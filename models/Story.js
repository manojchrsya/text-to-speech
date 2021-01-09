class StoryClass {
  // `getFullTitle()` becomes a document method
  getFullTitle() {
    return this.title;
  }

  // `findByCategory()` becomes a static
  static findByCategory(category) {
    return this.find({ category });
  }
}

module.exports = {
  name: 'Story',
  alias: 'Story',
  schema: {
    title: {
      type: String,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    featured: {
      type: Boolean,
      required: false,
    },
    category: {
      type: Array,
      required: false,
    },
    lang: {
      type: Array,
      required: false,
    },
  },
  class: StoryClass,
};
