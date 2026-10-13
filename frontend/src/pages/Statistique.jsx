import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import client from "../api/client";

const COLORS = [
  "#547A95",
  "#C2A56D",
  "#2C3947",
  "#8BA9BC",
  "#D9C293",
];

function toChartData(map) {
  if (!map || typeof map !== "object") {
    return [];
  }

  return Object.entries(map).map(([name, value]) => ({
    name: String(name),
    value: Number(value) || 0,
  }));
}

function formatNumber(value) {
  return Number(value || 0).toLocaleString("fr-FR");
}

export default function Statistique() {

  // ETAT GENERAL

  const [totalVehicules, setTotalVehicules] = useState(0);
  const [valeurTotale, setValeurTotale] = useState(0);

  // CONDAMNATIONS

  const [totalCondamnations, setTotalCondamnations] = useState(0);

  const [condamnationsParAnnee, setCondamnationsParAnnee] =
    useState({});

  const [condamnationsParLieu, setCondamnationsParLieu] =
    useState({});

  // VEHICULES

  const [parEtat, setParEtat] = useState({});
  const [parGenre, setParGenre] = useState({});
  const [parMarque, setParMarque] = useState({});

  // ENTREES / SORTIES

  const [entretiens, setEntretiens] = useState({});
  const [ordresEntree, setOrdresEntree] = useState({});
  const [ordresSortie, setOrdresSortie] = useState({});

  // SUIVI / CONTROLE

  const [suivi, setSuivi] = useState({});
  const [controle, setControle] = useState({});

  // AUTRES

  const [entretiensParMarque, setEntretiensParMarque] =
    useState({});

  const [bonsCommande, setBonsCommande] =
    useState({});

  // ETATS DE CHARGEMENT

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // CHARGEMENT DES STATISTIQUES

  useEffect(() => {

    async function loadStatistiques() {

      try {

        setLoading(true);
        setError("");

        const responses = await Promise.all([

          // 0
          client.get(
            "/statistiques/total-vehicules"
          ),

          // 1
          client.get(
            "/statistiques/valeur-totale"
          ),

          // 2
          client.get(
            "/statistiques/total-condamnations"
          ),

          // 3
          client.get(
            "/statistiques/condamnations-par-annee"
          ),

          // 4
          client.get(
            "/statistiques/condamnations-par-lieu"
          ),

          // 5
          client.get(
            "/statistiques/par-etat"
          ),

          // 6
          client.get(
            "/statistiques/par-genre"
          ),

          // 7
          client.get(
            "/statistiques/par-marque"
          ),

          // 8
          client.get(
            "/statistiques/entretiens"
          ),

          // 9
          client.get(
            "/statistiques/ordres-entree"
          ),

          // 10
          client.get(
            "/statistiques/ordres-sortie"
          ),

          // 11
          client.get(
            "/statistiques/suivi"
          ),

          // 12
          client.get(
            "/statistiques/controle"
          ),

          // 13
          client.get(
            "/statistiques/entretiens-par-marque"
          ),

          // 14
          client.get(
            "/statistiques/bons-commande"
          ),
        ]);

        // VEHICULES

        setTotalVehicules(
          responses[0].data
        );

        setValeurTotale(
          responses[1].data
        );

        // CONDAMNATIONS

        setTotalCondamnations(
          responses[2].data
        );

        setCondamnationsParAnnee(
          responses[3].data
        );

        setCondamnationsParLieu(
          responses[4].data
        );

        // REPARTITION VEHICULES

        setParEtat(
          responses[5].data
        );

        setParGenre(
          responses[6].data
        );

        setParMarque(
          responses[7].data
        );

        // ENTRETIENS

        setEntretiens(
          responses[8].data
        );

        // ORDRES

        setOrdresEntree(
          responses[9].data
        );

        setOrdresSortie(
          responses[10].data
        );

        // SUIVI / CONTROLE

        setSuivi(
          responses[11].data
        );

        setControle(
          responses[12].data
        );

        // ENTRETIENS PAR MARQUE

        setEntretiensParMarque(
          responses[13].data
        );

        // BONS DE COMMANDE

        setBonsCommande(
          responses[14].data
        );

      } catch (err) {

        console.error(
          "Erreur chargement statistiques :",
          err
        );

        setError(
          err.response?.data?.message ||
          err.response?.data?.detail ||
          "Impossible de charger les statistiques."
        );

      } finally {

        setLoading(false);

      }

    }

    loadStatistiques();

  }, []);

  // DONNEES GRAPHIQUES

  const dataEtat =
    toChartData(parEtat);

  const dataGenre =
    toChartData(parGenre);

  const dataMarque =
    toChartData(parMarque);

  const dataEntretiens =
    toChartData(entretiens);

  const dataOrdresEntree =
    toChartData(ordresEntree);

  const dataOrdresSortie =
    toChartData(ordresSortie);

  const dataSuivi =
    toChartData(suivi);

  const dataControle =
    toChartData(controle);

  const dataEntretiensMarque =
    toChartData(entretiensParMarque);

  const dataBonsCommande =
    toChartData(bonsCommande);

  const dataCondamnationsAnnee =
    toChartData(condamnationsParAnnee);

  const dataCondamnationsLieu =
    toChartData(condamnationsParLieu);

  // AFFICHAGE

  return (

    <div className="max-w-7xl mx-auto px-4 py-10">

      {/*TITRE*/}

      <div className="mb-8">

        <h1 className="text-2xl font-bold text-haigana-dark">
          Statistiques
        </h1>

        <p className="text-sm text-gray-500 mt-1">
          Vue d'ensemble du parc automobile et de sa gestion.
        </p>

      </div>

      {/*ERREUR*/}

      {error && (

        <div className="mb-6 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-4 py-3">
          {error}
        </div>

      )}

      {/*CHARGEMENT*/}

      {loading ? (

        <div className="bg-white rounded-2xl shadow-card p-10 text-center text-gray-400">
          Chargement des statistiques...
        </div>

      ) : (

        <>

          {/*CARTES PRINCIPALES
          ================================================== */}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">

            {/* TOTAL VEHICULES */}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <p className="text-sm text-gray-500">
                Total véhicules recensés
              </p>

              <p className="text-3xl font-bold text-haigana-dark mt-1">
                {formatNumber(totalVehicules)}
              </p>

            </div>

            {/* VALEUR TOTALE */}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <p className="text-sm text-gray-500">
                Valeur totale des véhicules
              </p>

              <p className="text-3xl font-bold text-haigana-dark mt-1">

                {formatNumber(valeurTotale)} Ar

              </p>

            </div>

            {/* CONDAMNATIONS */}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <p className="text-sm text-gray-500">
                Total véhicules condamnés
              </p>

              <p className="text-3xl font-bold text-haigana-dark mt-1">
                {formatNumber(totalCondamnations)}
              </p>

            </div>

          </div>


          {/*GRAPHIQUES
          ================================================== */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">


            {/*CONDAMNATIONS PAR ANNEE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Véhicules condamnés par année
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataCondamnationsAnnee}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#547A95"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Condamnations"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*CONDAMNATIONS PAR LIEU*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Véhicules condamnés par lieu
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataCondamnationsLieu}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#C2A56D"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Condamnations"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*ETAT*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Répartition par état
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={dataEtat}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >

                    {dataEtat.map(
                      (_, index) => (

                        <Cell
                          key={`etat-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>


            {/*MARQUE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Répartition par marque
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataMarque}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#547A95"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Véhicules"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*GENRE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Répartition par genre
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataGenre}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Bar
                    dataKey="value"
                    fill="#C2A56D"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Véhicules"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*ENTRETIENS*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Entretiens des véhicules
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataEntretiens}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#547A95"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Nombre de véhicules"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*ORDRES D'ENTREE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Ordres d'entrée
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataOrdresEntree}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#547A95"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Nombre"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*ORDRES DE SORTIE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Ordres de sortie
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <BarChart
                  data={dataOrdresSortie}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#C2A56D"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Nombre"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*SUIVI*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Véhicules suivis / non suivis
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={dataSuivi}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >

                    {dataSuivi.map(
                      (_, index) => (

                        <Cell
                          key={`suivi-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>


            {/*CONTROLE*/}

            <div className="bg-white rounded-2xl shadow-card p-6">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Véhicules contrôlés / non contrôlés
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={dataControle}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >

                    {dataControle.map(
                      (_, index) => (

                        <Cell
                          key={`controle-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>


            {/*ENTRETIENS PAR MARQUE*/}

            <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Entretiens des véhicules par marque
              </h3>

              <ResponsiveContainer
                width="100%"
                height={320}
              >

                <BarChart
                  data={dataEntretiensMarque}
                >

                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#E8EDF2"
                  />

                  <XAxis
                    dataKey="name"
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <YAxis
                    allowDecimals={false}
                    stroke="#2C3947"
                    fontSize={12}
                  />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="value"
                    fill="#547A95"
                    radius={[
                      6,
                      6,
                      0,
                      0
                    ]}
                    name="Entretiens"
                  />

                </BarChart>

              </ResponsiveContainer>

            </div>


            {/*BONS DE COMMANDE*/}

            <div className="bg-white rounded-2xl shadow-card p-6 lg:col-span-2">

              <h3 className="font-semibold text-haigana-dark mb-4">
                Bons de commande
              </h3>

              <ResponsiveContainer
                width="100%"
                height={300}
              >

                <PieChart>

                  <Pie
                    data={dataBonsCommande}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label
                  >

                    {dataBonsCommande.map(
                      (_, index) => (

                        <Cell
                          key={`bon-${index}`}
                          fill={
                            COLORS[
                              index % COLORS.length
                            ]
                          }
                        />

                      )
                    )}

                  </Pie>

                  <Tooltip />

                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            </div>

          </div>

        </>

      )}

    </div>

  );
}
