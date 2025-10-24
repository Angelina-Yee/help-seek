import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({ className = "", placeholder = "Search" }) {
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
        } else {
            navigate(`/search`);
        }
    };

    return (
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', alignItems: 'center' }}>
            <input 
                placeholder={placeholder}
                className={`home-searchbar ${className}`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="submit" className="home-search" aria-label="search">⌕</button>
        </form>
    );
}

export default SearchBar;
