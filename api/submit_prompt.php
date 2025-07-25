<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// API Configuration
$API_CONFIG = [
    'openrouter' => [
        'key' => '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',
        'base_url' => 'https://openrouter.ai/api/v1/chat/completions'
    ],
    'a4f' => [
        'key' => 'Ddc-a4f-b4b6948f71bc4f51bc0b1f161a1b577b',
        'base_url' => 'https://api.a4f.co/v1/chat/completions'
    ]
];

// Database connection
function getDbConnection() {
    try {
        $pdo = new PDO('sqlite:../database/vision_ai.db');
        $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $pdo;
    } catch (PDOException $e) {
        error_log('Database connection failed: ' . $e->getMessage());
        return null;
    }
}

// Smart model routing
function routeModel($intent) {
    $router = [
        'image' => 'provider-6/flux-dev',
        'video' => 'provider-4/pika-latest',
        'code' => 'mistralai/devstral-small-2505',
        'story' => 'meta-llama/llama-3.3-70b-instruct',
        'default' => 'google/gemma-3-27b-it'
    ];
    
    return $router[$intent] ?? $router['default'];
}

// Get API provider based on model
function getApiProvider($model) {
    if (strpos($model, 'openai') !== false || 
        strpos($model, 'google') !== false || 
        strpos($model, 'mistralai') !== false || 
        strpos($model, 'meta-llama') !== false) {
        return 'openrouter';
    }
    return 'a4f';
}

// Main processing
try {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input || !isset($input['prompt']) || !isset($input['model'])) {
        throw new Exception('Invalid input data');
    }
    
    $prompt = $input['prompt'];
    $model = $input['model'];
    $mode = $input['mode'] ?? 'chat';
    $user_id = $input['user_id'] ?? 1;
    
    // Store prompt in database
    $pdo = getDbConnection();
    if ($pdo) {
        $stmt = $pdo->prepare("INSERT INTO prompts (user_id, type, content) VALUES (?, ?, ?)");
        $stmt->execute([$user_id, $mode, $prompt]);
        $prompt_id = $pdo->lastInsertId();
    }
    
    // Determine API provider
    $provider = getApiProvider($model);
    $config = $API_CONFIG[$provider];
    
    // Prepare API request
    $api_data = [
        'model' => $model,
        'messages' => [
            [
                'role' => 'system',
                'content' => 'You are a helpful AI assistant. Provide clear, accurate, and engaging responses.'
            ],
            [
                'role' => 'user',
                'content' => $prompt
            ]
        ],
        'temperature' => 0.7,
        'max_tokens' => 2000
    ];
    
    // Make API request
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => $config['base_url'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($api_data),
        CURLOPT_HTTPHEADER => [
            'Authorization: Bearer ' . $config['key'],
            'Content-Type: application/json',
            'HTTP-Referer: ' . $_SERVER['HTTP_HOST'],
            'X-Title: Vision AI Studio'
        ],
        CURLOPT_TIMEOUT => 30
    ]);
    
    $response = curl_exec($ch);
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($http_code !== 200) {
        throw new Exception('API request failed with code: ' . $http_code);
    }
    
    $api_response = json_decode($response, true);
    
    if (!$api_response || !isset($api_response['choices'][0]['message']['content'])) {
        throw new Exception('Invalid API response');
    }
    
    $generated_content = $api_response['choices'][0]['message']['content'];
    
    // Store response in database
    if ($pdo && isset($prompt_id)) {
        $stmt = $pdo->prepare("INSERT INTO responses (prompt_id, type, output_text) VALUES (?, ?, ?)");
        $stmt->execute([$prompt_id, $mode, $generated_content]);
    }
    
    // Return response
    echo json_encode([
        'success' => true,
        'content' => $generated_content,
        'model' => $model,
        'mode' => $mode
    ]);
    
} catch (Exception $e) {
    error_log('API Error: ' . $e->getMessage());
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
?>
