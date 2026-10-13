package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.RecensementLogementLigne;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RecensementLogementLigneRepository
        extends JpaRepository<
                RecensementLogementLigne,
                Long
        > {   
}
