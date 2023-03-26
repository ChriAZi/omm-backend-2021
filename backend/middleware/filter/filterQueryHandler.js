const stackTrace = require('stack-trace');


module.exports = {
    /**
     * Middleware preprocessing query parameters for easier use later in later middlewares
     * @returns Express Middleware Function
     */
    getFilterAndSortOptions: () => {
        return (req, res, next) => {
            try {
                req.sortOptions = {};
                req.filterOptions = {};
                req.downloadOptions = {};
                if (req.query.sortByDate && req.query.sortByDate === 'true') req.sortOptions.date = true;
                if (req.query.sortByVotes && req.query.sortByVotes === 'true') req.sortOptions.votes = true;
                if (req.query.filterByTitle) req.filterOptions.title = req.query.filterByTitle;
                if (req.query.filterByVotes) req.filterOptions.votes = req.query.filterByVotes;
                if (req.query.filterByFileFormat) req.filterOptions.fileFormat = req.query.filterByFileFormat;
                if (req.query.filterByDate) req.filterOptions.date = new Date(req.query.filterByDate);
                if (req.query.asZip) req.downloadOptions.zip = true;
            } catch (err) {
                return res.status(500).json({
                    errors: {
                        message: err.message,
                        location: stackTrace.parse(err)[0]
                    }
                });
            }
            next();
        }
    }
}