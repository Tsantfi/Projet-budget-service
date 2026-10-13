package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Materiel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MaterielRepository
        extends JpaRepository<Materiel, Long> {

    List<Materiel> findByCodeSoa_IdAndActifTrueOrderByIdAsc(
            Long soaId
    );

    List<Materiel> findByCodeSoa_IdOrderByIdAsc(
            Long soaId
    );
    
    long countByCodeSoa_IdAndActifTrue(Long soaId);
}
