const path = require('path');

class MemeFilter {

    /**
     * Stores memes in the instance of MemeFilter to be able to create function chaining.
     * @param memes - an array of memes to be filtered
     */
    constructor(memes) {
        this.memes = memes;
    }

    /**
     * Filters the memes based on the given filterOptions
     * @param filterOptions - the filtering options as given in the query parameters of the calling route
     * @returns {MemeFilter.filter} - an instance of MemeFilter holding the filtered memes
     */
    filter = function (filterOptions) {
        if (filterOptions) {
            if (filterOptions.title) this.memes = this.memes.filter(meme => meme.title.toLowerCase().includes(filterOptions.title.toLowerCase()));
            if (filterOptions.votes) this.memes = this.memes.filter(meme => meme.votes.length === parseInt(filterOptions.votes));
            if (filterOptions.fileFormat) this.memes = this.memes.filter(meme => path.extname(meme.path) === '.' + filterOptions.fileFormat.toLowerCase());
            if (filterOptions.date) this.memes = this.memes.filter(meme => (
                meme.createdAt.getFullYear() === filterOptions.date.getFullYear() &&
                meme.createdAt.getMonth() === filterOptions.date.getMonth() &&
                meme.createdAt.getDate() === filterOptions.date.getDate()
            ));
        }
        return this;
    }

    /**
     * Sorts the memes based on the given sortOptions
     * @param sortOptions - the sorting options as given in the query parameters of the calling route
     * @returns {MemeFilter.filter} - an instance of MemeFilter holding the sorted memes
     */
    sort = function (sortOptions) {
        if (sortOptions) {
            if (sortOptions.date) this.memes.sort((a, b) => (a.createdAt < b.createdAt) ? 1 : -1);
            if (sortOptions.votes) this.memes.sort((a, b) => (a.votes.length < b.votes.length) ? 1 : -1);
            return this.memes;
        }
    }
}

module.exports.MemeFilter = MemeFilter;