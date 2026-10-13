package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.BonCommande;
import mg.drbf.haigana.entity.StatutPaiement;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonCommandeRepository extends JpaRepository<BonCommande, Long> {

    // Utilisation de LEFT JOIN FETCH à la place de JOIN FETCH pour inclure les lignes où codeSoa est null
    @Query("""
        SELECT b FROM BonCommande b 
        LEFT JOIN FETCH b.codeSoa 
        LEFT JOIN FETCH b.procesVerbal 
        LEFT JOIN FETCH b.livret 
        WHERE b.codeSoa.id = :soaId AND b.statut = :statut
    """)
    List<BonCommande> findByCodeSoa_IdAndStatut(@Param("soaId") Long soaId, @Param("statut") StatutPaiement statut);

    @Query("""
        SELECT b FROM BonCommande b 
        LEFT JOIN FETCH b.codeSoa 
        LEFT JOIN FETCH b.procesVerbal 
        LEFT JOIN FETCH b.livret 
        WHERE b.codeSoa.id = :soaId
    """)
    List<BonCommande> findByCodeSoa_Id(@Param("soaId") Long soaId);

    // Pour les méthodes suivantes, l'EntityGraph remplace proprement les requêtes JPQL répétitives
    @EntityGraph(attributePaths = {"codeSoa", "procesVerbal", "livret"})
    List<BonCommande> findByLivret_Id(Long livretId);

    @EntityGraph(attributePaths = {"codeSoa", "procesVerbal", "livret"})
    List<BonCommande> findByAnnee(Integer annee);

    @EntityGraph(attributePaths = {"codeSoa", "procesVerbal", "livret"})
    List<BonCommande> findByProcesVerbal_Id(Long procesVerbalId);

    // Récupérer tous les bons orphelins (sans SOA) pour l'historique global
    @EntityGraph(attributePaths = {"codeSoa", "procesVerbal", "livret"})
    List<BonCommande> findByCodeSoaIsNull();

    // STATISTIQUES DES PAIEMENTS
    long countByStatut(StatutPaiement statut);
}
