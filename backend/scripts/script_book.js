import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, Book } from '../models/index.js';
import axios from 'axios';

// 🔹 Définition de `__dirname` en mode ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔹 Charger `.env`
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("✅ Google Books API KEY :", process.env.GOOGLE_BOOKS_API_KEY || "❌ Non chargé !");

// 📌 Stocker les livres déjà en base pour éviter les doublons
const existingBookIds = new Set();
const loadExistingBooks = async () => {
    console.log("📥 Chargement des livres existants...");
    const books = await Book.findAll({ attributes: ['google_books_id'] });
    books.forEach(book => existingBookIds.add(book.google_books_id));
    console.log(`✅ ${existingBookIds.size} livres déjà enregistrés.`);
};

// 📌 Plus de catégories pour maximiser les résultats
const categories = [
    "fiction", "literature", "mystery", "thriller", "romance", "history", "science",
    "philosophy", "psychology", "fantasy", "biography", "business", "self-help",
    "young adult", "children", "adventure", "graphic novel", "horror", "classic",
    "poetry", "art", "technology", "cooking", "travel", "health", "spirituality"
];

// 🔹 **Ajout de sous-catégories**
const subcategories = [
    "science fiction", "romance historical", "crime thriller", "dark fantasy",
    "space opera", "dystopian", "high fantasy", "true crime", "urban fantasy",
    "self-improvement", "ancient history", "modern literature", "political philosophy",
    "self-development", "feminism", "medieval history", "AI technology", "cybersecurity",
    "mindfulness", "cognitive psychology", "financial success", "entrepreneurship",
    "personal finance", "graphic design", "cinema", "sports psychology", "motivational books"
];

// **Langues principales**
const languages = ["en", "fr"];

// 📌 Fonction pour récupérer et stocker les livres
const fetchAndStoreBooks = async () => {
    try {
        await loadExistingBooks(); // Charger les livres existants en DB
        const maxBooks = 100000;
        let totalBooksFetched = 0;

        for (const category of [...categories, ...subcategories]) {
            if (totalBooksFetched >= maxBooks) break; // Stop si on atteint la limite

            console.log(`📚 Récupération des livres pour la catégorie : ${category}...`);

            for (let startIndex = 0; startIndex < 1000; startIndex += 40) { // Augmenté jusqu'à 1000
                if (totalBooksFetched >= maxBooks) break;

                for (const lang of languages) {
                    try {
                        const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                            params: {
                                q: category,
                                langRestrict: lang,
                                printType: "books",
                                startIndex,
                                maxResults: 40,
                                key: process.env.GOOGLE_BOOKS_API_KEY,
                            }
                        });

                        const books = response.data.items || [];
                        if (books.length === 0) {
                            console.log(`🚫 Aucun livre trouvé à startIndex ${startIndex} pour ${category} en ${lang}.`);
                            break; // Arrêter cette catégorie si plus de livres
                        }

                        for (const item of books) {
                            if (!item.id || existingBookIds.has(item.id)) continue; // Éviter les doublons

                            const bookData = {
                                google_books_id: item.id,
                                title: item.volumeInfo.title || "Titre inconnu",
                                authors: item.volumeInfo.authors || [],
                                published_date: item.volumeInfo.publishedDate || null,
                                description: item.volumeInfo.description || "",
                                page_count: item.volumeInfo.pageCount || null,
                                language: item.volumeInfo.language || "unknown",
                                publisher: item.volumeInfo.publisher || "Éditeur inconnu",
                                genres: item.volumeInfo.categories || [],
                                cover_url: item.volumeInfo.imageLinks?.thumbnail || null,
                            };

                            await Book.create(bookData);
                            existingBookIds.add(item.id); // Ajouter au cache
                            totalBooksFetched++;

                            console.log(`✅ Livre ajouté : ${bookData.title}`);
                        }

                    } catch (err) {
                        console.error(`❌ Erreur lors de la récupération des livres (${category}, startIndex ${startIndex}, ${lang}):`, err.message);
                    }
                }
            }
        }

        console.log(`📚 ✅ Tous les livres ont été ajoutés avec succès. Total: ${totalBooksFetched}`);

    } catch (error) {
        console.error('❌ Erreur lors de la récupération des livres :', error.message);
    }
};

// 📌 Exécuter le script en s'assurant que Sequelize est bien connecté
sequelize.authenticate()
    .then(async () => {
        console.log('✅ Connexion à la base de données réussie.');
        await fetchAndStoreBooks();
        sequelize.close();
    })
    .catch((error) => console.error('❌ Erreur de connexion à la base de données :', error.message));
