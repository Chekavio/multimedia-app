import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { sequelize, Book } from '../models/index.js';
import axios from 'axios';

// 🔹 Définition de `__dirname` en mode ES Modules
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// 🔹 Charger `.env`
dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log("✅ Google Books API KEY :", process.env.GOOGLE_BOOKS_API_KEY || "❌ Non chargée !");

// 📌 Stocker les livres déjà en base pour éviter les doublons
const existingBookIds = new Set();
const loadExistingBooks = async () => {
    console.log("📥 Chargement des livres existants...");
    const books = await Book.findAll({ attributes: ['google_books_id'] });
    books.forEach(book => existingBookIds.add(book.google_books_id));
    console.log(`✅ ${existingBookIds.size} livres déjà enregistrés.`);
};

// 📌 Catégories et langues à explorer
const categories = [
    'fiction', 'science', 'mystery', 'history', 'philosophy',
    'fantasy', 'romance', 'horror', 'adventure', 'poetry',
    'psychology', 'technology', 'biography', 'business',
    'education', 'health', 'religion', 'science fiction'
];

const languages = ['en', 'fr', 'es', 'de', 'it', 'ru', 'pt', 'nl', 'sv', 'ja'];

// 📌 Variations de recherches pour contourner la limite Google Books
const queries = [
    "bestseller", "classic literature", "modern fiction", "science breakthroughs",
    "murder mystery", "fantasy novels", "poetry collections", "historical fiction",
    "business success", "philosophy classics", "famous biographies"
];

// 📌 Fonction principale pour récupérer et stocker les livres
const fetchAndStoreBooks = async () => {
    try {
        await loadExistingBooks(); // Charger les livres existants en DB
        let totalBooks = existingBookIds.size;
        const booksPerCategory = 1000; // 🔹 On tente de maximiser

        for (const category of categories) {
            for (const query of queries) {
                for (const lang of languages) {
                    console.log(`📚 Récupération des livres pour "${query}" en ${lang} (catégorie: ${category})...`);

                    for (let startIndex = 0; startIndex < booksPerCategory; startIndex += 40) {
                        try {
                            const response = await axios.get('https://www.googleapis.com/books/v1/volumes', {
                                params: {
                                    q: `${query}+subject:${category}`,
                                    langRestrict: lang,
                                    startIndex,
                                    maxResults: 40,
                                    printType: 'books',
                                    key: process.env.GOOGLE_BOOKS_API_KEY
                                }
                            });

                            if (!response.data.items || response.data.items.length === 0) {
                                console.log(`🚫 Aucun livre trouvé à startIndex ${startIndex} pour ${query} en ${lang} (${category}).`);
                                break;
                            }

                            for (const item of response.data.items) {
                                const bookData = item.volumeInfo;
                                if (!item.id || existingBookIds.has(item.id)) {
                                    console.log(`⚠️ Livre déjà existant ou sans ID : ${bookData.title}`);
                                    continue;
                                }

                                try {
                                    const authors = bookData.authors ? bookData.authors.join(', ') : null;
                                    const genres = bookData.categories ? bookData.categories.join(', ') : null;
                                    const publishedDate = bookData.publishedDate ? new Date(bookData.publishedDate) : null;

                                    await Book.create({
                                        google_books_id: item.id,
                                        title: bookData.title || 'Titre inconnu',
                                        authors,
                                        published_date: publishedDate,
                                        description: bookData.description || '',
                                        page_count: bookData.pageCount || null,
                                        language: bookData.language || lang,
                                        publisher: bookData.publisher || null,
                                        genres,
                                        cover_url: bookData.imageLinks?.thumbnail || null
                                    });

                                    existingBookIds.add(item.id); // Ajouter au cache pour éviter les doublons
                                    totalBooks++;

                                    console.log(`✅ Livre ajouté : ${bookData.title}`);
                                } catch (err) {
                                    console.error(`❌ Erreur lors de l'ajout du livre ${bookData.title}:`, err.message);
                                }

                                if (totalBooks >= 100000) {
                                    console.log(`🎉 Objectif atteint : ${totalBooks} livres ajoutés !`);
                                    return;
                                }
                            }
                        } catch (err) {
                            console.error(`❌ Erreur lors de la récupération des livres (${query}, startIndex ${startIndex}):`, err.message);
                        }
                    }
                }
            }
        }

        console.log(`📚 ✅ Tous les livres ont été ajoutés avec succès.`);
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
