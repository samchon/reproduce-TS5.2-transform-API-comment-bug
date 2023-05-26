const reproduce = (tsc) => (node) => {
    const entire = tsc.getJSDocCommentsAndTags(node);
    for (const elem of entire) {
        if (!tsc.isJSDoc(elem)) continue;
        
        const typeTag = elem.tags?.[0];
        if (
            typeTag &&
            tsc.isJSDocTypeTag(typeTag) &&
            tsc.isTypeReferenceNode(typeTag.typeExpression.type) &&
            tsc.isIdentifier(typeTag.typeExpression.type.typeName)
        ) {
            console.log({
                comment: typeTag.comment,
                expression:
                    typeTag.typeExpression.type.typeName.escapedText.toString(),
            });
        } else 
            console.log({
                comment: typeTag.comment,
                type: typeTag.typeExpression.type.kind,
            });
    }
};

const transform = ({ typescript: tsc }) => ({
    create: ({ program }) => {
        return {
            before: [
                (context) => (file) => {
                    program.getSyntacticDiagnostics(file);
                    program.getSemanticDiagnostics(file);

                    return tsc.visitEachChild(
                        file,
                        (node) => {
                            if (tsc.isInterfaceDeclaration(node))
                                node.members.forEach(reproduce(tsc));
                            return node;
                        },
                        context,
                    );
                }
            ]
        };
    }
});
module.exports = transform;