export enum Category{
  Restaurant= 'Restaurant',
  University='University',
  Coffeeshop='Coffeeshop',
  Sightseeing='Sightseeing',
  Shopping='Shopping',
  Bern='Bern',
  Museum = 'Museum'
}

export class CategoryFinder{
  static findCategory(selectedCategory: string): Category {
    switch (selectedCategory) {
      case "restaurant":
        return Category.Restaurant;
        break;
      case "coffeeshop":
        return Category.Coffeeshop;
        break;
      case "shopping":
        return Category.Shopping;
        break;
      case "sightseeing":
        return Category.Sightseeing;
        break;
      case "museum":
        return Category.Museum;
        break;
      case "university":
        return Category.University;
        break;
      default:
        return Category.Bern;
    }
  }
}
