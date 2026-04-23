const fs = require('fs');

['src/pages/dashboard/default.jsx',
 'src/pages/inventory/IMEITracking.jsx',
 'src/pages/inventory/InventoryTransaction.jsx',
 'src/pages/products/ProductList.jsx'].forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    content = content.replace(/<Grid\s+item\s+((?:(?:xs|sm|md|lg|xl)=\{[^}]+\}\s*)+)(.*?)>/g, (match, gridProps, restProps) => {
        let sizeObj = {};
        const propsMatches = gridProps.matchAll(/(xs|sm|md|lg|xl)=\{([^}]+)\}/g);
        for(const m of propsMatches) {
            sizeObj[m[1]] = m[2];
        }
        let sizePropStr = '';
        const keys = Object.keys(sizeObj);
        if (keys.length === 1 && keys[0] === 'xs') {
            sizePropStr = `size={${sizeObj['xs']}}`;
        } else {
            const propsInsideObj = keys.map(k => `${k}: ${sizeObj[k]}`).join(', ');
            sizePropStr = `size={{ ${propsInsideObj} }}`;
        }
        const maybeSpace = restProps.trim().length > 0 ? ' ' : '';
        return `<Grid ${sizePropStr}${maybeSpace}${restProps.trim()}>`;
    });
    content = content.replace(/<Grid\s+item>/g, '<Grid>');
    content = content.replace(/<Grid\s+item\s+(.*?)>/g, '<Grid $1>');
    fs.writeFileSync(f, content, 'utf8');
});
console.log('Replacement complete');
