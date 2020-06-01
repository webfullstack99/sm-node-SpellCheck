module.exports = {
    get root() { return __dirname.replace(/(\\|\/)[\w\-\d\_]+$/, '') },
    get app() { return `${this.root}/app` },
    get libs() { return `${this.root}/libs` },
    // views
    get views() { return `${this.app}/views` },
}