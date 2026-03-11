// Diagnostic endpoint to check candidate documents
app.get('/api/candidates/:id/documents-debug', async (req, res) => {
    try {
        const candidate = await User.findById(req.params.id);
        if (!candidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        const debug = {
            candidateName: candidate.name,
            candidateId: candidate._id,
            documentsCount: candidate.documents?.length || 0,
            documents: candidate.documents?.map(doc => ({
                type: doc.type,
                fileName: doc.fileName,
                hasLocalUrl: !!doc.localUrl,
                localUrl: doc.localUrl,
                hasDriveFileId: !!doc.driveFileId,
                driveFileId: doc.driveFileId,
                driveViewLink: doc.driveViewLink,
                driveDownloadLink: doc.driveDownloadLink
            })) || [],
            generatedDocuments: candidate.generatedDocuments ? Object.keys(candidate.generatedDocuments).map(key => ({
                formType: key,
                hasFileId: !!candidate.generatedDocuments[key]?.fileId,
                fileId: candidate.generatedDocuments[key]?.fileId,
                fileName: candidate.generatedDocuments[key]?.fileName,
                viewLink: candidate.generatedDocuments[key]?.viewLink,
                downloadLink: candidate.generatedDocuments[key]?.downloadLink
            })) : []
        };

        res.json(debug);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
