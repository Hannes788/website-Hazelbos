module.exports = function(eleventyConfig) {
    // Static assets
    eleventyConfig.addPassthroughCopy("src/css");
    eleventyConfig.addPassthroughCopy("src/js");
    eleventyConfig.addPassthroughCopy("src/fonts");
    eleventyConfig.addPassthroughCopy("src/images");
    eleventyConfig.addPassthroughCopy("src/robots.txt");
    eleventyConfig.addPassthroughCopy("src/admin");

    // Nieuws collection (newest first)
    eleventyConfig.addCollection("nieuws", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/nieuws/*.md").sort((a, b) => b.date - a.date);
    });

    // Agenda collection (soonest first)
    eleventyConfig.addCollection("agenda", function(collectionApi) {
        return collectionApi.getFilteredByGlob("src/agenda/*.md").sort((a, b) => a.date - b.date);
    });

    // Dutch date filter
    eleventyConfig.addFilter("dutchDate", function(date) {
        const months = ["januari","februari","maart","april","mei","juni",
                        "juli","augustus","september","oktober","november","december"];
        const d = new Date(date);
        return d.getDate() + " " + months[d.getMonth()] + " " + d.getFullYear();
    });

    // Dutch short month filter (for agenda)
    eleventyConfig.addFilter("dutchMonth", function(date) {
        const months = ["jan","feb","mrt","apr","mei","jun","jul","aug","sep","okt","nov","dec"];
        const d = new Date(date);
        return months[d.getMonth()];
    });

    eleventyConfig.addFilter("day", function(date) {
        return new Date(date).getDate();
    });

    return {
        dir: {
            input: "src",
            output: "_site",
            includes: "_includes",
            data: "_data"
        },
        templateFormats: ["njk", "md", "html"],
        htmlTemplateEngine: "njk",
        markdownTemplateEngine: "njk"
    };
};
