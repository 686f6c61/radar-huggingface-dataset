# Zulkiflii/zuveclock-clv-hsv01

## Resumen

Zuveclock (CLV-HSV01) no es un modelo de lenguaje ni un modelo de IA propiamente dicho: es un repositorio de biología computacional publicado en HuggingFace bajo el identificador `Zulkiflii/zuveclock-clv-hsv01`. Contiene el material de un artículo científico sobre un vector AAV (virus adenoasociado) de edición epigenética diseñado para mantener la latencia del virus del herpes simple tipo 1 y tipo 2 (HSV-1/HSV-2) en ganglios sensoriales. El autor es Muhammad Alwi Zulkifli, vinculado a Cloreva Labs, y el material se distribuye con licencia MIT y un DOI de Zenodo (10.5281/zenodo.23928108).

El repositorio incluye un manuscrito en PDF y HTML, secuencias genómicas de referencia (genoma completo de HSV-1 cepa 17, NC_001806.2), estructuras proteicas (VP16, PDB 16VP), la secuencia del vector recombinante (4.392 pb), datos de análisis de off-target y un conjunto de scripts en Python (`run_all_proofs.py` y otros) que reproducen las pruebas computacionales descritas en el artículo. El tamaño del repositorio es de 0,0 GB, sin descargas ni likes en el momento de la consulta.

La relevancia de este repositorio es científica, no de ingeniería de IA: propone un enfoque de "abrazadera de aislante epigenético" no escindente como alternativa a las nucleasas CRISPR-Cas9, que según el autor provocan genotoxicidad y apoptosis neuronal. Para desarrolladores e investigadores de IA, el interés es indirecto: ejemplifica un uso de HuggingFace como repositorio de artefactos científicos reproducibles, no como hub de pesos de modelos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; repositorio de biología computacional) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (contiene FASTA, GenBank, PDB, JSON, PDF, HTML, PNG y scripts Python) |

## Arquitectura y entrenamiento

No aplica: no hay arquitectura de red neuronal ni proceso de entrenamiento. El contenido técnico del repositorio describe un constructo biológico: un vector AAV único de 4.392 pb (de ITR a ITR) que integra una Cas9 catalíticamente inactiva de *S. aureus* (dSaCas9 D10A/N580A), un dominio represor KRAB humano de 96 aminoácidos (KOX1), un promotor de sinaptina humana mínimo (Mini-hSyn) y un casete U6-gRNA. El vector se dirige al límite aislante CTCF del huésped (sitio CTUL1 Site D, coordenada 102.583 en NC_001806.2) para impedir el bucle físico entre el enhancer de LAT (8,3 kb) y el promotor de UL48 (VP16).

El repositorio incluye además un modelo matemático en forma de sistema de ecuaciones diferenciales ordinarias no lineales en 5 dimensiones que describe el bucle de retroalimentación VP16/Oct-1/HCF-1. Según los datos del autor, la integración numérica demuestra la eliminación de la bifurcación saddle-node, con una expresión máxima de VP16 acotada a P* ≤ 0,0443 moléculas/célula y una ganancia en lazo cerrado G_loop ≤ 1,2 × 10⁻⁵. No se especifican datos de entrenamiento, datasets de ML ni procesos de RLHF/DPO porque no existen en este contexto.

## Capacidades

- No es un modelo generativo: no genera texto, código ni realiza razonamiento.
- Reproducción computacional de pruebas: los scripts en Python (`run_all_proofs.py`, `analyze_ctul1.py`, `analyze_16vp.py`, `locate_site_d.py`, `design_therapeutic_engine.py`, `build_aav_vector.py`, `bifurcation_proof.py`) ejecutan análisis de secuencia, análisis estructural de contactos proteicos, verificación de coordenadas genómicas, evaluación termodinámica de off-target y validación estequiométrica del empaquetado.
- Generación de figuras: `zuveclock_publication_figures.py` produce gráficos vectoriales SVG para el manuscrito.
- Datos biológicos consultables: genoma de referencia, estructura cristalográfica, secuencias de proteínas huésped y mapa circular del vector.
- No dispone de tool calling, soporte de agentes, capacidades multilingües ni modos de razonamiento.

## Casos de uso

- Revisión por pares y replicación científica: un investigador puede clonar el repositorio y ejecutar `run_all_proofs.py` para verificar los cálculos del manuscrito (integración de EDO, análisis de off-target, validación de empaquetado) antes de aceptar o citar los resultados.
- Docencia en biología sintética: el conjunto de scripts y datos sirve como material didáctico para ilustrar el diseño de vectores AAV, el análisis de motivos CTCF y la modelización de circuitos genéticos con EDO.
- Análisis de bioseguridad: los ficheros `therapeutic_candidates.json` y `ctul1_insulator_analysis.json` permiten auditar la especificidad de los protospacers de 20 nt frente a GRCh38.p14 y evaluar riesgos de off-target.
- Diseño de constructos AAV: `build_aav_vector.py` valida el tamaño del casete frente al umbral de empaquetado de AAV-PHP.S (4,70 kb), útil como plantilla para otros constructos.
- Investigación sobre latencia viral: los datos de coordenadas génicas y el modelo de bifurcación pueden reutilizarse en estudios sobre reactivación de HSV y dinámica de VP16.
- Archivado y citación reproducible: el DOI de Zenodo y la licencia MIT permiten citar y reutilizar el material en publicaciones y pipelines de revisión abierta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no contiene evaluaciones de modelos de IA (MMLU, HumanEval, GSM8K u otras); los únicos resultados numéricos son los del modelo matemático descrito en el artículo (cotas de VP16, ganancia en lazo cerrado y autovalores del sistema), que no son comparables con benchmarks de modelos de lenguaje.

## Requisitos de hardware

- No requiere GPU: los scripts dependen únicamente de `numpy` y `matplotlib` y se ejecutan en CPU.
- Entorno recomendado: Python 3.10 o superior, según el badge del README.
- Almacenamiento: el repositorio ocupa 0,0 GB según HuggingFace, por lo que cabe en cualquier equipo convencional.
- Opciones de despliegue: ejecución local mediante `git clone` y `python run_all_proofs.py`; no aplica vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del tiempo de integración numérica de las EDO y del análisis de secuencias, no documentado.

## Comparativa con modelos similares

No disponible. No se conocen modelos de IA comparables porque este repositorio no es un modelo de IA. En el ámbito de repositorios de biología computacional, la comparación requeriría identificar otros conjuntos de datos de vectores AAV o pruebas de edición epigenética, información que no se proporciona en la documentación disponible.

## Limitaciones y advertencias

- No es un modelo de IA: no debe evaluarse ni desplegarse como tal; etiquetarlo o buscarlo como modelo de lenguaje induce a error.
- Ausencia de validación experimental: la información disponible describe pruebas computacionales y un manuscrito, sin datos de experimentos in vitro o in vivo que confirmen las afirmaciones del autor.
- Datos no verificados de forma independiente: las cifras de apoptosis (34,2 %), cotas de VP16 y ganancias en lazo cerrado provienen únicamente del material del autor y no se han contrastado con literatura revisada por pares en la información disponible.
- Riesgo de interpretación médica: el contenido describe una posible terapia génica; no debe interpretarse como tratamiento validado ni como consejo clínico.
- Idiomas no declarados: la model card está en inglés; no se especifican otros idiomas.
- Licencia MIT: permite uso comercial y modificación, pero no exime de las responsabilidades regulatorias asociadas a la investigación con vectores virales y edición genética.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que limita la evidencia de uso o revisión por la comunidad.
- Fechas incoherentes: la fecha de creación indicada (2026-11-03) es futura respecto a la consulta, lo que sugiere un posible error de metadatos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Zulkiflii/zuveclock-clv-hsv01
- DOI de Zenodo: https://doi.org/10.5281/zenodo.23928108
- Referencia del genoma HSV-1 cepa 17 (NCBI RefSeq NC_001806.2): https://www.ncbi.nlm.nih.gov/nuccore/NC_001806.2
- Estructura PDB 16VP (complejo VP16): https://www.rcsb.org/structure/16VP
- UniProt P51610 (HCF-1 humano): https://www.uniprot.org/uniprotkb/P51610/entry
- Licencia MIT: https://opensource.org/licenses/MIT
