class ReplaceTemplateStaticUrlPlugin {
    constructor(options = {}) {
        this.fileNames = options.fileNames || ['index.prod.html']; // 默认文件名
        this.staticPathIdentifier = options.staticPathIdentifier || './static/'; // 默认静态路径标识符
        this.replacementPath = options.replacementPath || '{{STATIC_URL}}'; // 默认替换路径
    }
    apply(compiler){
        compiler.hooks.emit.tapAsync('ReplaceTemplateStaticUrlPlugin', (compilation, callback) => {
            // this调用当前类定义的方法
            this.fileNames.forEach(fileName => {
                this.replaceStaticUrl(compilation, fileName);
            });
            callback()
        })
    }
    replaceStaticUrl(compilation, fileName) {
        const asset = compilation.assets[fileName];
        if (asset) {
            const minifyFileContent = this.replaceStaticPaths(asset.source().toString());
            console.log(`Processing file: ${fileName}`)
            compilation.assets[fileName] = {
                source: () => minifyFileContent,
                size: () => Buffer.byteLength(minifyFileContent, 'utf8')
            }
        } else {
            console.error(`Error: ${fileName} not found in assets.`);
        }
    }
    replaceStaticPaths(content) {
        return content.replace(
            new RegExp(this.staticPathIdentifier, 'g'),
            this.replacementPath
        );
    }
}
module.exports = ReplaceTemplateStaticUrlPlugin