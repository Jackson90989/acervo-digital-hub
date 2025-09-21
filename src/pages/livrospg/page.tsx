import React, { useEffect, useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";

interface Book {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
}

export default function LivroPg() {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const booksPerPage = 6;

  useEffect(() => {
    const query = searchTerm.trim() || "programming";

    fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=100`)
      .then((res) => res.json())
      .then((data) => {
        if (data?.docs) {
          setBooks(data.docs);
          setCurrentPage(1);
        }
      })
      .catch(console.error);
  }, [searchTerm]);

  const totalPages = Math.ceil(books.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const saveToHistory = (book: Book) => {
    const existing = JSON.parse(localStorage.getItem("history") || "[]");
    const newEntry = {
      id: book.key,
      title: book.title,
      type: "onlineBook",
      url: `https://openlibrary.org${book.key}`,
    };
    const updated = [newEntry, ...existing.filter((item: any) => item.id !== book.key)];
    localStorage.setItem("history", JSON.stringify(updated));
  };

  const renderPaginationButtons = () => {
    const buttons: (JSX.Element | string)[] = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        buttons.push(
          <button key={i} onClick={() => goToPage(i)} style={i === currentPage ? activeBtnStyle : btnStyle}>
            {i}
          </button>
        );
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          buttons.push(
            <button key={i} onClick={() => goToPage(i)} style={i === currentPage ? activeBtnStyle : btnStyle}>
              {i}
            </button>
          );
        }
        buttons.push("...", <button key={totalPages} onClick={() => goToPage(totalPages)} style={btnStyle}>{totalPages}</button>);
      } else if (currentPage >= totalPages - 1) {
        buttons.push(<button key={1} onClick={() => goToPage(1)} style={btnStyle}>1</button>, "...");
        for (let i = totalPages - 2; i <= totalPages; i++) {
          buttons.push(
            <button key={i} onClick={() => goToPage(i)} style={i === currentPage ? activeBtnStyle : btnStyle}>
              {i}
            </button>
          );
        }
      } else {
        buttons.push(<button key={1} onClick={() => goToPage(1)} style={btnStyle}>1</button>, "...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          buttons.push(
            <button key={i} onClick={() => goToPage(i)} style={i === currentPage ? activeBtnStyle : btnStyle}>
              {i}
            </button>
          );
        }
        buttons.push("...", <button key={totalPages} onClick={() => goToPage(totalPages)} style={btnStyle}>{totalPages}</button>);
      }
    }

    return buttons;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <main style={{ flex: 1, width: "100%", maxWidth: "1200px", margin: "0 auto", padding: "2rem 1rem" }}>
        <h1 style={{ fontSize: "2rem", marginBottom: "1.5rem" }}>Livros na Internet</h1>

        <input
          type="text"
          placeholder="Buscar livros..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            padding: "10px",
            width: "100%",
            maxWidth: "400px",
            marginBottom: "2rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />

        {books.length === 0 ? (
          <p>Carregando livros...</p>
        ) : currentBooks.length === 0 ? (
          <p>Nenhum livro encontrado.</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {currentBooks.map((book) => (
              <div
                key={book.key}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "8px",
                  padding: "1rem",
                  background: "#f9f9f9",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    marginBottom: "0.5rem",
                    flexGrow: 1,
                  }}
                >
                  <img
                    src={
                      book.cover_i
                        ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                        : "/images/capa-padrao.png"
                    }
                    alt={book.title}
                    style={{ width: "100%", borderRadius: "4px", marginBottom: "0.5rem" }}
                  />
                  <h2 style={{ fontSize: "1.1rem", marginBottom: "0.3rem" }}>{book.title}</h2>
                  <p style={{ fontSize: "0.9rem", color: "#555" }}>
                    {book.author_name?.join(", ") || "Autor desconhecido"}
                  </p>
                  <p style={{ fontSize: "0.8rem", color: "#777" }}>
                    {book.first_publish_year ? `Ano: ${book.first_publish_year}` : ""}
                  </p>
                </a>

                <button
                  onClick={() => {
                    saveToHistory(book);
                    window.open(`https://openlibrary.org${book.key}`, "_blank");
                  }}
                  style={{ ...btnStyle, marginTop: "auto", backgroundColor: "#007bff", color: "#fff" }}
                >
                  Visualizar
                </button>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: "2rem", textAlign: "center" }}>
          <button onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} style={btnStyle}>
            &laquo; Anterior
          </button>
          {renderPaginationButtons()}
          <button onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} style={btnStyle}>
            Próximo &raquo;
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Estilos reutilizáveis
const btnStyle: React.CSSProperties = {
  padding: "6px 12px",
  margin: "0 4px",
  background: "#eee",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
};

const activeBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#333",
  color: "#fff",
};
