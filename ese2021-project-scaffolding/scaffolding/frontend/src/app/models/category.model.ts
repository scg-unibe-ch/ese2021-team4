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
      case "Restaurant":
        return Category.Restaurant;
        break;
      case "Coffeeshop":
        return Category.Coffeeshop;
        break;
      case "Shopping":
        return Category.Shopping;
        break;
      case "Sightseeing":
        return Category.Sightseeing;
        break;
      case "Museum":
        return Category.Museum;
        break;
      case "University":
        return Category.University;
        break;
      default:
        return Category.Bern;
    }
  }
}
