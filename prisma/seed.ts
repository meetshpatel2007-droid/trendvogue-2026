import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const categories = [
  { name: "Men", slug: "men", sortOrder: 1 },
  { name: "Women", slug: "women", sortOrder: 2 },
  { name: "Kids", slug: "kids", sortOrder: 3 },
  { name: "Beauty", slug: "beauty", sortOrder: 4 },
];

async function main() {
  console.log("🌱 Starting seed...");

  // Clean existing data
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.passwordResetToken.deleteMany();
  await prisma.user.deleteMany();

  console.log("🗑️  Cleared existing data");

  // Create categories
  const createdCategories: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.create({ data: cat });
    createdCategories[cat.slug] = created.id;
    console.log(`✅ Category: ${cat.name}`);
  }

  // Create fixed admin user from env / defaults
  const adminEmail = process.env.ADMIN_SEED_EMAIL ?? "Meet2026@gmail.com";
  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Meet@@2026";
  const adminName = process.env.ADMIN_SEED_NAME ?? "Meet Admin";

  const adminHash = await bcrypt.hash(adminPassword, 10);
  const admin = await prisma.user.create({
    data: {
      name: adminName,
      email: adminEmail,
      passwordHash: adminHash,
      role: "ADMIN",
      phone: "9876543210",
    },
  });
  console.log(`✅ Primary Admin: ${admin.email} (Password: ${adminPassword}) [Role: ADMIN]`);

  // Secondary admin
  const secAdminHash = await bcrypt.hash("Admin@12345", 10);
  await prisma.user.create({
    data: {
      name: "TrendVogue Admin",
      email: "admin@trendvogue.com",
      passwordHash: secAdminHash,
      role: "ADMIN",
      phone: "9876543211",
    },
  });
  console.log(`✅ Secondary Admin: admin@trendvogue.com (Password: Admin@12345) [Role: ADMIN]`);

  // Create demo regular user
  const userHash = await bcrypt.hash("User@12345", 10);
  const demoUser = await prisma.user.create({
    data: {
      name: "Rahul Sharma",
      email: "user@trendvogue.com",
      passwordHash: userHash,
      role: "USER",
      phone: "9123456789",
      addresses: {
        create: {
          line1: "42 MG Road, Sector 5",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560001",
          phone: "9123456789",
          isDefault: true,
        },
      },
    },
  });
  console.log(`✅ Demo user: ${demoUser.email} / password: User@12345`);

  // Products data
  const products = [
    // MEN (5 products)
    {
      name: "Classic Oxford Button-Down Shirt",
      description:
        "Crafted from premium 100% cotton, this timeless oxford button-down features a comfortable regular fit with a subtle texture. Perfect for smart-casual occasions or office wear. Available in multiple colours.",
      price: 1299,
      mrp: 2499,
      images: [
        "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600",
        "https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=600",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["White", "Light Blue", "Navy"],
      stockQty: 45,
      categorySlug: "men",
    },
    {
      name: "Slim Fit Chino Trousers",
      description:
        "Modern slim-fit chinos made from stretch-cotton blend for all-day comfort. Versatile enough for both casual weekends and smart office looks. Features a flat front and tapered leg.",
      price: 1799,
      mrp: 3299,
      images: [
        "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600",
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600",
      ],
      sizes: ["28", "30", "32", "34", "36"],
      colors: ["Khaki", "Olive", "Navy", "Black"],
      stockQty: 38,
      categorySlug: "men",
    },
    {
      name: "Premium Wool Blend Blazer",
      description:
        "Elevate your formal wardrobe with this premium wool-blend blazer. Single-breasted design with notch lapel, two-button front, and a slim fit silhouette. Fully lined for a polished drape.",
      price: 4999,
      mrp: 8999,
      images: [
        "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=600",
        "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=600",
      ],
      sizes: ["38", "40", "42", "44", "46"],
      colors: ["Charcoal", "Navy", "Black"],
      stockQty: 18,
      categorySlug: "men",
    },
    {
      name: "Graphic Print Oversized Tee",
      description:
        "Street-style oversized t-shirt featuring bold graphic print on premium ring-spun cotton. Drop-shoulder fit and relaxed silhouette make it a versatile wardrobe staple.",
      price: 699,
      mrp: 1299,
      images: [
        "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600",
        "https://images.unsplash.com/photo-1598032895397-b9472444bf93?w=600",
      ],
      sizes: ["S", "M", "L", "XL", "XXL"],
      colors: ["Black", "White", "Grey"],
      stockQty: 60,
      categorySlug: "men",
    },
    {
      name: "Denim Jacket — Washed Blue",
      description:
        "Iconic denim jacket in a classic washed blue finish. Features a button-front, chest pockets, and a slightly relaxed fit. 100% cotton denim with a vintage-inspired wash.",
      price: 2499,
      mrp: 4499,
      images: [
        "https://images.unsplash.com/photo-1601333144130-8cbb312386b6?w=600",
        "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600",
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["Washed Blue", "Dark Indigo"],
      stockQty: 25,
      categorySlug: "men",
    },
    // WOMEN (5 products)
    {
      name: "Floral Wrap Midi Dress",
      description:
        "Effortlessly feminine wrap midi dress in a vibrant floral print. Made from lightweight viscose for a flattering drape. Adjustable waist tie and V-neckline make it universally flattering.",
      price: 1899,
      mrp: 3499,
      images: [
        "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600",
        "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=600",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Floral Blue", "Floral Pink"],
      stockQty: 30,
      categorySlug: "women",
    },
    {
      name: "High-Rise Skinny Jeans",
      description:
        "Premium high-rise skinny jeans crafted from stretch denim for a second-skin fit. Features a flattering high waist, classic five-pocket styling, and ankle-grazing length.",
      price: 2199,
      mrp: 3999,
      images: [
        "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600",
        "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600",
      ],
      sizes: ["24", "26", "28", "30", "32"],
      colors: ["Indigo", "Black", "Light Wash"],
      stockQty: 42,
      categorySlug: "women",
    },
    {
      name: "Embroidered Anarkali Kurta",
      description:
        "Elegant anarkali kurta featuring delicate thread embroidery on the yoke and hem. Made from premium cotton-silk blend, this floor-length kurta is perfect for festive occasions.",
      price: 2999,
      mrp: 5499,
      images: [
        "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600",
        "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600",
      ],
      sizes: ["XS", "S", "M", "L", "XL", "XXL"],
      colors: ["Teal", "Rose Pink", "Mustard"],
      stockQty: 22,
      categorySlug: "women",
    },
    {
      name: "Linen Blazer — Relaxed Fit",
      description:
        "The perfect summer power blazer — made from breathable pure linen in a relaxed, oversized fit. Wear over a blouse and trousers for office power dressing, or throw over a slip dress.",
      price: 3499,
      mrp: 6299,
      images: [
        "https://images.unsplash.com/photo-1594938298603-c8148c4b4d37?w=600",
        "https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=600",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["Off White", "Sage Green", "Camel"],
      stockQty: 16,
      categorySlug: "women",
    },
    {
      name: "Knit Crop Sweater",
      description:
        "Cosy ribbed knit crop sweater with a round neck and long sleeves. Made from soft acrylic-wool blend. Pairs perfectly with high-waist jeans or midi skirts for an effortlessly chic look.",
      price: 1499,
      mrp: 2799,
      images: [
        "https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=600",
        "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=600",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["Cream", "Dusty Rose", "Slate Blue"],
      stockQty: 35,
      categorySlug: "women",
    },
    // KIDS (5 products)
    {
      name: "Dinosaur Print Tee — Boys",
      description:
        "Fun and playful dinosaur graphic t-shirt for boys. Made from 100% soft cotton, this easy-to-wash tee features vibrant prints and a relaxed fit for active little ones.",
      price: 449,
      mrp: 799,
      images: [
        "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=600",
        "https://images.unsplash.com/photo-1622290291468-a28f7a7dc6a8?w=600",
      ],
      sizes: ["2Y", "3Y", "4Y", "5Y", "6Y", "7Y", "8Y"],
      colors: ["White", "Yellow", "Blue"],
      stockQty: 50,
      categorySlug: "kids",
    },
    {
      name: "Unicorn Tutu Dress — Girls",
      description:
        "Magical unicorn-themed tutu dress with a glittery sequin top and layered tulle skirt. Perfect for birthday parties and special occasions. Soft lining for all-day comfort.",
      price: 899,
      mrp: 1599,
      images: [
        "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=600",
        "https://images.unsplash.com/photo-1611651338412-8403fa6e3599?w=600",
      ],
      sizes: ["2Y", "3Y", "4Y", "5Y", "6Y"],
      colors: ["Pink & Silver", "Purple & Gold"],
      stockQty: 28,
      categorySlug: "kids",
    },
    {
      name: "Kids Denim Dungarees",
      description:
        "Classic denim dungarees with adjustable shoulder straps and multiple pockets. Made from soft stretch denim that grows with your child. Easy snap fastening at ankles for quick changes.",
      price: 999,
      mrp: 1899,
      images: [
        "https://images.unsplash.com/photo-1471286174890-9c112ffca5b4?w=600",
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600",
      ],
      sizes: ["3Y", "4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y"],
      colors: ["Light Denim", "Dark Denim"],
      stockQty: 33,
      categorySlug: "kids",
    },
    {
      name: "Cosy Fleece Hoodie — Unisex",
      description:
        "Warm and comfortable fleece hoodie for kids. Features a kangaroo pocket, adjustable drawstring hood, and a relaxed fit. Anti-pill fleece retains softness wash after wash.",
      price: 799,
      mrp: 1499,
      images: [
        "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=600",
        "https://images.unsplash.com/photo-1561037404-61cd46aa615b?w=600",
      ],
      sizes: ["4Y", "5Y", "6Y", "7Y", "8Y", "10Y", "12Y"],
      colors: ["Grey", "Navy", "Red"],
      stockQty: 40,
      categorySlug: "kids",
    },
    {
      name: "School Uniform Combo Set",
      description:
        "Complete school uniform set including a white shirt, navy trousers/skirt, and a tie. Made from easy-iron, durable fabric blended for comfort during long school days.",
      price: 1299,
      mrp: 2299,
      images: [
        "https://images.unsplash.com/photo-1509059852496-f3822ae057ea?w=600",
        "https://images.unsplash.com/photo-1588072432836-e10032774350?w=600",
      ],
      sizes: ["4Y", "5Y", "6Y", "7Y", "8Y", "9Y", "10Y", "11Y", "12Y"],
      colors: ["White/Navy"],
      stockQty: 55,
      categorySlug: "kids",
    },
    // BEAUTY (5 products)
    {
      name: "Hydrating Rose Face Serum",
      description:
        "A lightweight, non-greasy face serum enriched with rosehip extract, hyaluronic acid, and vitamin C. Delivers intense hydration, brightens dull skin, and reduces the appearance of fine lines.",
      price: 1099,
      mrp: 1999,
      images: [
        "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=600",
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600",
      ],
      sizes: ["30ml", "50ml"],
      colors: [],
      stockQty: 48,
      categorySlug: "beauty",
    },
    {
      name: "Long-Wear Matte Lipstick Set",
      description:
        "A curated set of 5 highly pigmented matte lipsticks in wearable nudes, bolds, and berry tones. 12-hour wear formula that stays comfortable and doesn't bleed. Cruelty-free.",
      price: 799,
      mrp: 1499,
      images: [
        "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600",
        "https://images.unsplash.com/photo-1631214524020-3c69888b8f1f?w=600",
      ],
      sizes: ["Set of 5"],
      colors: ["Nude", "Berry Red", "Mauve", "Coral", "Brick"],
      stockQty: 62,
      categorySlug: "beauty",
    },
    {
      name: "Argan Oil Hair Mask",
      description:
        "Deep conditioning hair mask infused with pure Moroccan argan oil, keratin, and biotin. Repairs damaged hair, eliminates frizz, and adds mirror-like shine. For all hair types.",
      price: 549,
      mrp: 999,
      images: [
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600",
        "https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?w=600",
      ],
      sizes: ["200ml", "500ml"],
      colors: [],
      stockQty: 36,
      categorySlug: "beauty",
    },
    {
      name: "Vitamin C Brightening Moisturiser",
      description:
        "Daily moisturiser formulated with 15% stable vitamin C, niacinamide, and SPF 30. Brightens, evens skin tone, and protects from UV damage — all in one step.",
      price: 1399,
      mrp: 2499,
      images: [
        "https://images.unsplash.com/photo-1617897903246-719242758050?w=600",
        "https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=600",
      ],
      sizes: ["50ml"],
      colors: [],
      stockQty: 40,
      categorySlug: "beauty",
    },
    {
      name: "Luxury Perfume — Oud & Rose",
      description:
        "An opulent oriental fragrance for the modern Indian woman. Opens with bergamot and rose, settles into rich oud, sandalwood, and amber. Long-lasting EDP — 8+ hours sillage.",
      price: 2499,
      mrp: 4299,
      images: [
        "https://images.unsplash.com/photo-1541643600914-78b084683702?w=600",
        "https://images.unsplash.com/photo-1588776814546-1ffedbe47425?w=600",
      ],
      sizes: ["50ml", "100ml"],
      colors: [],
      stockQty: 20,
      categorySlug: "beauty",
    },
  ];

  for (const p of products) {
    const { categorySlug, ...productData } = p;
    await prisma.product.create({
      data: {
        ...productData,
        categoryId: createdCategories[categorySlug],
      },
    });
    console.log(`✅ Product: ${p.name}`);
  }

  console.log("\n🎉 Seed complete!");
  console.log("═══════════════════════════════════");
  console.log("Admin 1: Meet2026@gmail.com / Meet@@2026");
  console.log("Admin 2: admin@trendvogue.com / Admin@12345");
  console.log("Customer: user@trendvogue.com / User@12345");
  console.log("═══════════════════════════════════");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
