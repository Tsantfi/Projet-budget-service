package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Nomenclature;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NomenclatureRepository
        extends JpaRepository<Nomenclature, Long> {

    Optional<Nomenclature> findByNumero(Integer numero);

    boolean existsByNumero(Integer numero);

    boolean existsByNumeroAndIdNot(
            Integer numero,
            Long id
    );

    List<Nomenclature> findByActifTrueOrderByNumeroAsc();

    List<Nomenclature> findAllByOrderByNumeroAsc();
}