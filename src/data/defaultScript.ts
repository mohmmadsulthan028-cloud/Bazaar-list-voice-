import { GroceryItem } from '../types/grocery';

export const USER_EXACT_SCRIPT = `Dahi 1 kg
Tamate
Aloo
Seem ki phalli
Bhendi
Pudina 
Kotmeer
Lemons`;

export const INITIAL_GROCERY_ITEMS: GroceryItem[] = [
  {
    id: 'item-dahi-1kg',
    name: 'Dahi 1 kg',
    quantity: '1 kg',
    category: 'dairy',
    meaning: 'Fresh Curd / Yogurt (1 Kilogram)',
    urduScript: 'دہی ایک کلو',
    hindiScript: 'दही 1 किलो',
    culinaryNote: 'Thick curd for marinades, soothing raita, and cooling curd rice.',
    completed: false,
  },
  {
    id: 'item-tamate',
    name: 'Tamate',
    quantity: 'approx. 1 kg',
    category: 'vegetable',
    meaning: 'Tomatoes (Dakhni/Hyderabadi regional name)',
    urduScript: 'ٹماٹر (تماٹے)',
    hindiScript: 'टमाटर',
    culinaryNote: 'Tangy base for Dalcha, Tamatar ki khatti dal, and rich salan.',
    completed: false,
  },
  {
    id: 'item-aloo',
    name: 'Aloo',
    quantity: 'approx. 1 kg',
    category: 'vegetable',
    meaning: 'Potatoes',
    urduScript: 'آلو',
    hindiScript: 'आलू',
    culinaryNote: 'All-round staple for aloo baingan, samosa stuffing, and crispy aloo fry.',
    completed: false,
  },
  {
    id: 'item-seem-ki-phalli',
    name: 'Seem ki phalli',
    quantity: '500 grams',
    category: 'vegetable',
    meaning: 'Flat Broad Beans / Hyacinth Beans',
    urduScript: 'سیم کی پھلی',
    hindiScript: 'सेम की फली',
    culinaryNote: 'Signature Indian flat green beans, celebrated in Seem ki Phalli Gosht.',
    completed: false,
  },
  {
    id: 'item-bhendi',
    name: 'Bhendi',
    quantity: '500 grams',
    category: 'vegetable',
    meaning: 'Lady’s Finger / Okra',
    urduScript: 'بھینڈی',
    hindiScript: 'भिंडी',
    culinaryNote: 'Tender fresh green pods for kurkuri bhendi or spicy dahi bhindi.',
    completed: false,
  },
  {
    id: 'item-pudina',
    name: 'Pudina',
    quantity: '1 fresh bunch',
    category: 'herbs',
    meaning: 'Fresh Mint Leaves',
    urduScript: 'پودینہ',
    hindiScript: 'पुदीना',
    culinaryNote: 'Aromatic leaves for genuine Hyderabadi Dum Biryani layer and mint chutney.',
    completed: false,
  },
  {
    id: 'item-kotmeer',
    name: 'Kotmeer',
    quantity: '1 fresh bunch',
    category: 'herbs',
    meaning: 'Fresh Coriander / Cilantro (Hyderabadi/Marathi term)',
    urduScript: 'کوتمیر',
    hindiScript: 'कोथमीर / हरा धनिया',
    culinaryNote: 'The fragrant soul of subcontinental cooking, sprinkled over curries & biryanis.',
    completed: false,
  },
  {
    id: 'item-lemons',
    name: 'Lemons',
    quantity: '4 - 6 pieces',
    category: 'fruit',
    meaning: 'Juicy Yellow Lemons / Nimbu',
    urduScript: 'لیموں',
    hindiScript: 'नींबू / लेमन',
    culinaryNote: 'Zesty citrus for brightening dal, salad dressings, and chilled nimbu pani.',
    completed: false,
  },
];
