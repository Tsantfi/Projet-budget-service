package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.LogementEntree;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LogementEntreeRepository
        extends JpaRepository<LogementEntree, Long> {

    Optional<LogementEntree> findByLogement_Id(
            Long logementId
    );
}
