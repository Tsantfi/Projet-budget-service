package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Genre;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GenreRepository extends JpaRepository<Genre, Long> {

    Optional<Genre> findByGenreVehiculeIgnoreCase(String genreVehicule);
}