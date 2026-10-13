package mg.drbf.haigana.repository;

import jakarta.transaction.Transactional;
import mg.drbf.haigana.entity.ControleDeplacement;
import mg.drbf.haigana.entity.StatutControle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ControleDeplacementRepository
        extends JpaRepository<ControleDeplacement, Long> {

    List<ControleDeplacement>
    findByControle_Id(Long controleId);

    List<ControleDeplacement>
    findByDeplacement_Id(Long deplacementId);

    Optional<ControleDeplacement>
    findByControle_IdAndDeplacement_Id(
            Long controleId,
            Long deplacementId
    );

    List<ControleDeplacement>
    findByControle_IdAndStatut(
            Long controleId,
            StatutControle statut
    );

    @Transactional
    void deleteByControle_Id(Long controleId);

    @Transactional
    void deleteByDeplacement_Id(Long deplacementId);
}