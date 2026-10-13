package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Deplacement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

public interface DeplacementRepository
        extends JpaRepository<Deplacement, Long> {

    List<Deplacement> findByVehicule_Id(Long vehiculeId);

    List<Deplacement>
    findByVehicule_IdOrderByDateDeplacementDesc(Long vehiculeId);

    List<Deplacement>
    findByVehicule_IdAndDateDeplacementBetweenOrderByDateDeplacementAsc(
            Long vehiculeId,
            LocalDate dateDebut,
            LocalDate dateFin
    );

    @Query("""
        SELECT COALESCE(SUM(d.tableKilometrique), 0)
        FROM Deplacement d
        WHERE d.vehicule.id = :vehiculeId
        AND d.dateDeplacement >= :dateDebut
        AND d.dateDeplacement < :dateFin
    """)
    Double calculerKilometrageMensuel(
            @Param("vehiculeId") Long vehiculeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    @Query("""
        SELECT COALESCE(SUM(d.tableKilometrique), 0)
        FROM Deplacement d
        WHERE d.vehicule.id = :vehiculeId
        AND d.dateDeplacement >= :dateDebut
        AND d.dateDeplacement < :dateFin
    """)
    Double calculerKilometrageAnnuel(
            @Param("vehiculeId") Long vehiculeId,
            @Param("dateDebut") LocalDate dateDebut,
            @Param("dateFin") LocalDate dateFin
    );

    // Vérification
    long countByVehicule_Id(Long vehiculeId);

    
    // SUPPRESSION DES LIENS CONTROLE_DEPLACEMENT
    

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM controle_deplacement
        WHERE deplacement_id IN (
            SELECT id
            FROM deplacement
            WHERE vehicule_id = :vehiculeId
        )
        """, nativeQuery = true)
    int deleteControleDeplacementByVehiculeId(
            @Param("vehiculeId") Long vehiculeId
    );

    
    // SUPPRESSION DES DEPLACEMENTS
    

    @Modifying
    @Transactional
    @Query(value = """
        DELETE FROM deplacement
        WHERE vehicule_id = :vehiculeId
        """, nativeQuery = true)
    int deleteAllByVehiculeIdNative(
            @Param("vehiculeId") Long vehiculeId
    );
}