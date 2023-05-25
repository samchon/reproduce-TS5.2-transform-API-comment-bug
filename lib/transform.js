const reproduce = (tsc) => (program) => (file) => (node) => {
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
            console.log(program.getSemanticDiagnostics(file));
            console.log({
                comment: typeTag.comment,
                expression:
                    typeTag.typeExpression.type.typeName.escapedText.toString(),
            });
        }
    }
};

const transform = ({ typescript: tsc }) => ({
    create: ({ program }) => {
        checker = program.getTypeChecker();
        console.log("checker has getSemanticDiagnostics() method?", !!checker.getSemanticDiagnostics);
        try {
            console.log("Try to call ts.Program.getSemanticDiagnostics(ts.TypeChecker) function...");
            program.getSemanticDiagnostics(checker);
        } catch (e) {
            console.log(e);
        }
        console.log("--------------------------------------------------");
        
        return {
            before: [
                (context) => (file) => tsc.visitEachChild(
                    file,
                    (node) => {
                        if (tsc.isInterfaceDeclaration(node))
                            node.members.forEach(reproduce(tsc)(program)(file));
                        return node;
                    },
                    context,
                )
            ]
        };
    }
});
module.exports = transform;