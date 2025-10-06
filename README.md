# 🎮 Discord Games Browser

A modern web application for browsing and searching Discord's detectable games database. This tool provides a comprehensive interface to explore games that Discord can detect and display as "Now Playing" status.

## ✨ Features

- **🌐 CORS Proxy Support** - Multiple proxy options to bypass CORS restrictions
- **🔍 Advanced Search** - Search by game name, aliases, executables, themes, and more
- **📊 Comprehensive Data** - View all game information including icons, executables, themes, and overlay settings
- **🎨 Multi-Platform Support** - Display executables for Windows, macOS, and Linux
- **⚡ Real-time Filtering** - Filter by theme, operating system, and search terms
- **📱 Responsive Design** - Works on desktop and mobile devices
- **🔄 Live Data** - Fetches the latest game data directly from Discord's API

## 🚀 Quick Start

1. **Open the application** - Simply open `index.html` in your web browser
2. **Select a proxy** - Choose from the dropdown or use "Direct" for no proxy
3. **Load games** - Click "Load Games" to fetch the latest data
4. **Search & Filter** - Use the search box and filters to find specific games

## 🔧 CORS Proxy Options

The application includes several built-in CORS proxies:

- **corsproxy.io** (Default) - Fast and reliable
- **allorigins.win** - Alternative option
- **cors-anywhere.herokuapp.com** - Popular choice
- **thingproxy.freeboard.io** - Additional option
- **Direct (No Proxy)** - Direct access (may cause CORS errors)

### Custom Proxy

You can also use your own CORS proxy by selecting "Custom" and entering a URL in the format:

```
<proxyurl>?<param>={url}
```

## 📊 Data Fields

Each game entry includes:

- **🎮 Icon** - Game icon from Discord's CDN
- **📝 Name** - Official game name
- **🏷️ Aliases** - Alternative names and nicknames
- **🆔 ID** - Unique Discord application ID
- **💻 Executables** - Game executable files by operating system
- **🎨 Themes** - Game themes and genres
- **🔗 Hook** - Whether the game supports Discord hooks
- **🖥️ Overlay** - Overlay support status
- **⚙️ Overlay Methods** - Available overlay methods
- **⚠️ Overlay Warn** - Overlay warning status
- **🔑 Icon Hash** - Icon file hash

## 🎯 Search & Filtering

### Search Options

- **Game Name** - Search by official game names
- **Aliases** - Find games by alternative names
- **Executables** - Search by executable file names
- **Themes** - Filter by game themes
- **Overlay Methods** - Search by overlay capabilities

### Filter Options

- **Theme Filter** - Filter by specific game themes
- **OS Filter** - Filter by supported operating systems
- **Sort Options** - Sort by name, ID, or executable count

## 🛠️ Technical Details

### Built With

- **HTML5** - Modern semantic markup
- **CSS3** - Responsive styling with Bootstrap 5
- **JavaScript (ES6+)** - Modern JavaScript features
- **Bootstrap 5** - UI framework for responsive design
- **Bootstrap Icons** - Icon library

### Performance Features

- **Asynchronous Rendering** - Large datasets processed in chunks
- **Dynamic Chunking** - 10% of total games per chunk for optimal performance
- **Lazy Loading** - Progressive table population
- **Memory Efficient** - Optimized for large datasets (10,000+ games)

### Browser Compatibility

- **Modern Browsers** - Chrome, Firefox, Safari, Edge
- **ES6+ Support** - Requires modern JavaScript features
- **Fetch API** - Uses modern fetch for network requests

## 📁 File Structure

```
discord-games/
├── index.html          # Main HTML file
├── style.css           # CSS styles
├── script.js           # JavaScript logic
├── README.md           # This file
└── .gitignore          # Git ignore file
```

## 🔗 API Information

This application fetches data from Discord's public API endpoint:

```
https://discord.com/api/v9/applications/detectable
```

The API returns a JSON array of game objects with the following structure:

- Each game contains metadata about Discord's game detection
- Data includes executables, themes, overlay settings, and more
- Updates in real-time as Discord adds new games

## ⚠️ AI Disclaimer

**This project was developed with the assistance of AI tools.** While the core functionality and user interface were created with AI assistance, the application:

- Uses publicly available Discord API data
- Implements standard web technologies
- Follows modern web development practices
- Includes comprehensive error handling
- Provides a fully functional user experience

The AI assistance was used for:

- Code generation and optimization
- UI/UX design and layout
- Performance improvements
- Bug fixes and enhancements
- Documentation and comments

All code is open source and can be reviewed, modified, and distributed freely.

## 📄 License

This project is open source and available under the MIT License. Feel free to use, modify, and distribute as needed.

## 🤝 Contributing

Contributions are welcome! Please feel free to:

- Report bugs or issues
- Suggest new features
- Submit pull requests
- Improve documentation

## 📞 Support

If you encounter any issues or have questions:

1. Check the browser console for error messages
2. Try different CORS proxy options
3. Ensure you're using a modern web browser
4. Verify your internet connection

---

**Note:** This tool is not affiliated with Discord Inc. It's an independent project that uses Discord's public API for educational and utility purposes.
