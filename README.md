# Vision AI Studio

A fully functional, real-time web application powered by OpenRouter & A4F APIs for text, image, video, and music generation.

## 🚀 Features

- 🔥 **Dynamic Chat Interface** - Powered by OpenRouter API
- 🎨 **Image Generation** - Multiple models including Imagen, FLUX, and Sana
- 🎬 **Video Creation** - Advanced video generation capabilities
- 🎵 **Music Generation** - AI-powered music composition
- 🗃️ **File Upload Support** - Context-aware file processing
- 📊 **Smart Model Selection** - Automatic routing to best models
- 🌓 **Dark/Light Mode** - Responsive theme switching
- 💾 **Persistent Storage** - SQLite database for history
- 📱 **PWA Ready** - Installable as mobile app
- 💰 **AdMob Integration** - Monetization ready

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: PHP 7.4+
- **Database**: SQLite
- **APIs**: OpenRouter, A4F.co
- **PWA**: Service Worker, Web App Manifest

## 📦 Installation

1. **Clone the repository**
   \`\`\`bash
   git clone https://github.com/yourusername/vision-ai-studio.git
   cd vision-ai-studio
   \`\`\`

2. **Set up the database**
   \`\`\`bash
   sqlite3 database/vision_ai.db < database/db.sql
   \`\`\`

3. **Configure web server**
   - For Apache: Use the included `.htaccess`
   - For Nginx: Configure PHP-FPM
   - For development: `php -S localhost:8000`

4. **Update API keys** (already configured)
   - OpenRouter: `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`
   - A4F.co: `Ddc-a4f-b4b6948f71bc4f51bc0b1f161a1b577b`

## 🎯 Usage

1. **Select Mode**: Choose between Chat, Image, Video, or Music
2. **Pick Model**: Select from available AI models
3. **Enter Prompt**: Describe what you want to generate
4. **Generate**: Click the generate button and wait for results
5. **Save History**: Toggle to save conversations

## 🔧 Configuration

### Model Configuration
Edit `config/default_models.yaml` to modify available models and routing rules.

### Database Schema
The application uses SQLite with the following tables:
- `users` - User management
- `prompts` - User inputs
- `responses` - AI outputs
- `media` - Generated media files
- `sessions` - User sessions
- `settings` - User preferences

### API Routing
Smart routing automatically selects the best model based on intent:
- **Image**: Routes to Imagen 4 or FLUX models
- **Video**: Uses Pika or Runway models
- **Code**: Prefers Devstral or Gemma models
- **Story**: Uses Llama or GPT-4o
- **Music**: Routes to Suno or Udio models

## 📱 PWA Features

- **Offline Support**: Core functionality works offline
- **Install Prompt**: Users can install as native app
- **Push Notifications**: Future feature for updates
- **Background Sync**: Queues requests when offline

## 💰 Monetization

Google AdMob integration with three ad units:
- Header banner
- Middle content banner
- Footer banner

Update the `data-ad-client` and `data-ad-slot` values in `index.html` with your AdMob credentials.

## 🚀 Deployment

### Vercel (Frontend)
\`\`\`bash
vercel --prod
\`\`\`

### Traditional Hosting
1. Upload files to web server
2. Ensure PHP 7.4+ is available
3. Set proper file permissions
4. Configure database path

### Docker
\`\`\`dockerfile
FROM php:7.4-apache
COPY . /var/www/html/
RUN apt-get update && apt-get install -y sqlite3
EXPOSE 80
\`\`\`

## 🔒 Security

- Input sanitization for all user inputs
- SQL injection prevention with prepared statements
- CORS headers configured
- Rate limiting recommended for production
- API key rotation supported

## 📊 Analytics

Track usage with:
- Google Analytics (add tracking code)
- Custom database logging
- API usage monitoring
- User engagement metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the FAQ section

## 🔄 Updates

Stay updated with:
- New AI models as they become available
- Feature enhancements
- Security patches
- Performance improvements

## 📈 Roadmap

- [ ] Real-time collaboration
- [ ] Advanced file processing
- [ ] Custom model training
- [ ] API rate limiting dashboard
- [ ] Multi-language support
- [ ] Voice input/output
- [ ] Advanced analytics dashboard

---

**Vision AI Studio** - Your unified gateway to AI-powered creativity.
\`\`\`

\`\`\`htaccess file=".htaccess"
# Security Headers
Header always set X-Content-Type-Options nosniff
Header always set X-Frame-Options DENY
Header always set X-XSS-Protection "1; mode=block"
Header always set Referrer-Policy "strict-origin-when-cross-origin"
Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://pagead2.googlesyndication.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; img-src 'self' data: https:; connect-src 'self' https://openrouter.ai https://api.a4f.co; frame-src https://googleads.g.doubleclick.net"

# CORS Headers
Header always set Access-Control-Allow-Origin "*"
Header always set Access-Control-Allow-Methods "GET, POST, OPTIONS"
Header always set Access-Control-Allow-Headers "Content-Type, Authorization"

# Compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache Control
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
    ExpiresByType image/png "access plus 1 month"
    ExpiresByType image/jpg "access plus 1 month"
    ExpiresByType image/jpeg "access plus 1 month"
    ExpiresByType image/gif "access plus 1 month"
    ExpiresByType image/ico "access plus 1 month"
    ExpiresByType image/icon "access plus 1 month"
    ExpiresByType text/plain "access plus 1 month"
    ExpiresByType application/pdf "access plus 1 month"
</IfModule>

# URL Rewriting
RewriteEngine On

# API Routes
RewriteRule ^api/submit/?$ api/submit_prompt.php [L]
RewriteRule ^api/media/?$ api/store_media.php [L]
RewriteRule ^api/context/?$ api/fetch_context.php [L]

# Handle OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Prevent access to sensitive files
<FilesMatch "\.(yaml|yml|sql|log)$">
    Order allow,deny
    Deny from all
</FilesMatch>

# Prevent directory browsing
Options -Indexes

# Error Pages
ErrorDocument 404 /404.html
ErrorDocument 500 /500.html
