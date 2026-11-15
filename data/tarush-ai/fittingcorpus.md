# Tarush-AI/fittingcorpus

## Resumen

`Tarush-AI/fittingcorpus` no es un modelo de lenguaje, sino un repositorio de artefactos cientificos: los mapas jacobianos ajustados (fitted Jacobian maps) y los resultados almacenados del articulo "The Fitting Corpus Is Part of the Measurement: Auditing a Jacobian Lens on Pythia", de Tarush Gupta, presentado en el workshop Interpretability as a Science de NeurIPS 2026. El repositorio complementa al repositorio de codigo `github.com/tarush-ai/fittingcorpus` y contiene aquello que el codigo no incluye: cada resultado almacenado y cada mapa ajustado.

El objeto de estudio es el "Jacobian lens", una tecnica de interpretabilidad mecanicista que lee un estado oculto de una capa intermedia a traves de un mapa *J*, definido como la derivada del estado oculto final del modelo respecto de esa capa, promediada sobre un corpus de prompts. El articulo mide cuanto cambia lo que el lens lee en funcion del corpus elegido para ese promedio, sobre modelos Pythia de 70M a 2.8B parametros.

El repositorio tiene 15,5 GB y contiene 382 ficheros `.pt` (380 mapas jacobianos ajustados y 2 caches de activaciones), 193 ficheros de resultados en JSON, 147 registros por celda y por semilla, y los manifiestos de los corpus (hashes SHA-256, recuentos de documentos, datasets de origen y revisiones), sin texto de corpus. Es relevante para investigadores en interpretabilidad mecanicista que necesiten reproducir o auditar los resultados del articulo, y como caso practico de infraestructura de reproducibilidad con procedencia verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de artefactos de interpretabilidad, no un modelo) |
| Parametros totales | no aplica (los modelos auditados son Pythia de 70M a 2.8B) |
| Parametros activos | no aplica |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los mapas se ajustan en fp32 con TF32 desactivado) |
| Idiomas soportados | no disponible |
| Licencia | CC BY 4.0 |
| Formato de pesos | `.pt` (PyTorch) para los mapas; `.json` y `.npz` para resultados; manifiestos de corpus en texto |

## Arquitectura y entrenamiento

El repositorio no entrena un modelo; ajusta mapas jacobianos sobre modelos Pythia (EleutherAI, licencia Apache-2.0) usando la implementacion de referencia publicada en `anthropics/jacobian-lens` en el commit `581d398`. Cada mapa es el promedio sobre corpus de esa implementacion, ajustado en fp32 con TF32 desactivado; las dos variantes de promedio robusto en `results/lenses/misc/` (media mediana y media recortada, experimento E16) se identifican como tales.

Los mapas se organizan por experimento segun el registro del repositorio de codigo: E28 (166 mapas, escalera de lectura sobre corpus de ajuste y tamano de conjunto de ajuste *N*), E27 (53 mapas sobre dos mitades de cada corpus, para distancia entre corpus frente a intra-corpus), la escalera de modelos de 70M a 2.8B (15 mapas), pruebas de humo y ajustes puntuales (8 mapas), E48 y E52 (27 mapas, factorial 8x8 de ocho corpus de ajuste por tres semillas a 410M, mas tres reajustes sobre un corpus News 2024 deduplicado), E75 (30 mapas, replicacion a 1.4B y 2.8B, mas dos caches de activaciones), E62 (15 mapas, escalera de 1B en la banda [6,13]), E72 (8 mapas, remuestreo intra-fuente), E74 (47 mapas, pools de ajuste emparejados por type-token ratio) y E65 (11 mapas sobre checkpoints de entrenamiento de Pythia).

Cada mapa dispone de un sidecar `_provenance.json` (222 de los 380 mapas) con su propio SHA-256 y la configuracion de ajuste. Cada fichero de resultados incluye un bloque `provenance` con el script productor y su SHA-256, el commit de git, la linea de comandos y el SHA-256 de cada entrada; `payload_sha256` hashea el registro excluyendo ese bloque, de modo que un rerun que solo altere metadatos de entorno no lo modifica.

## Capacidades

- Almacenar y servir 380 mapas jacobianos ajustados sobre Pythia, reutilizables para re-puntuar lecturas del lens en CPU sin reajustar.
- Reproducir todas las estadisticas del articulo a partir de los 193 ficheros de resultados JSON con el tier T0 del repositorio de codigo.
- Re-puntuar cada lectura desde los mapas en CPU con el tier T1.
- Verificacion de integridad: manifiesto `docs/reproducibility/HF_MIRROR_MANIFEST.tsv` con tamano y hash de cada fichero, comprobable con `tools/hf_mirror_manifest.py --verify --repo Tarush-AI/fittingcorpus`.
- Reconstruccion del pool de corpus desde fuentes publicas con `bash repro/06_data.sh --build`, verificado contra los manifiestos del repositorio (no se distribuye texto de corpus).
- Trazabilidad de procedencia por resultado y por mapa (hashes de script, commit, linea de comandos y entradas).
- Descarga sin autenticacion mediante los scripts `repro/04_fetch_results.sh` (unos 8 MB de resultados) y `repro/03_fetch_artifacts.sh --all` (16 GB de mapas, con verificacion de hash en descarga).

## Casos de uso

- Reproduccion de resultados de interpretabilidad: un revisor o un investigador clona el repositorio de codigo, ejecuta `repro/04_fetch_results.sh` y `repro/RUN_ALL.sh --tier T0` para recomputar cada estadistica del articulo desde los JSON, comparando `payload_sha256` para confirmar que ningun numero se ha movido.
- Auditoria de un lens jacobiano: con los 53 mapas de E27 (dos mitades de cada corpus) se puede recalcular la distancia entre corpus frente a la intra-corpus y comprobar cuanto del efecto atribuido al corpus de ajuste es artefacto de la eleccion del pool.
- Reanalisis de sensibilidad al corpus de ajuste: los 24 mapas del factorial 8x8 de E48 y E52 (ocho corpus por tres semillas a 410M) permiten estudiar la varianza entre corpus frente a la varianza entre semillas sin reajustar nada.
- Estudio de robustez del promedio: las variantes de media mediana y media recortada de E16 en `results/lenses/misc/` permiten contrastar si las conclusiones dependen de la media aritmetica como estadistico de agregacion.
- Extension a otros modelos de la familia: los 15 mapas de la escalera de 70M a 2.8B y los 15 de E62 (1B en la banda [6,13]) sirven como linea base para comparar lecturas del lens a distintas escalas y bandas de capas.
- Validacion de infraestructura de reproducibilidad: el esquema de procedencia (hash de script, commit, linea de comandos, hash de entradas y `payload_sha256` estable frente a metadatos de entorno) es un patron reutilizable en otros proyectos de investigacion que publiquen artefactos en Hugging Face.
- Analisis de checkpoints de entrenamiento: los 11 mapas de E65 sobre checkpoints de Pythia permiten estudiar como evoluciona la lectura del lens a lo largo del entrenamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio contiene resultados experimentales del articulo (193 ficheros JSON y 147 registros por celda y semilla), pero la informacion proporcionada no incluye cifras concretas de MMLU, HumanEval, GSM8K ni de las metricas propias del estudio.

## Requisitos de hardware

- Almacenamiento: 15,5 GB de repositorio; 16,2 GB en los 382 ficheros `.pt`; unos 8 MB para el subconjunto de resultados JSON del tier T0.
- Inferencia de modelos: no aplica, el repositorio no contiene pesos de un modelo de lenguaje.
- Re-puntuacion de lecturas (tier T1): se ejecuta en CPU sobre los mapas descargados, segun la documentacion del repositorio.
- Reajuste de mapas: no se detalla en la informacion disponible el hardware empleado; los mapas se ajustaron en fp32 con TF32 desactivado sobre Pythia de 70M a 2.8B.
- GPU recomendadas: no disponible.
- Cabe en GPU de consumo: no aplica para el uso previsto (re-puntuacion en CPU); el ajuste de mapas sobre Pythia 2.8B requiere una GPU con memoria suficiente para el modelo en fp32, pero no se especifica el hardware en la informacion disponible.
- Opciones de despliegue: no aplica (vLLM, llama.cpp, Ollama y TGI no son relevantes para este repositorio); el acceso se realiza mediante git y los scripts del repositorio de codigo con `uv`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se conocen en la informacion proporcionada repositorios comparables de artefactos de interpretabilidad mecanicista con mapas jacobianos ajustados y esquema de procedencia verificable. El unico elemento de referencia citado es la implementacion `anthropics/jacobian-lens`, que es la herramienta de ajuste, no un artefacto comparable.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes, y no debe evaluarse con benchmarks de modelos.
- No se distribuye texto de corpus: es texto de terceros y los corpus derivados de Wikipedia son CC BY-SA, que no puede relicenciarse como CC BY 4.0; el pool debe reconstruirse desde fuentes publicas con `repro/06_data.sh --build`.
- La licencia CC BY 4.0 cubre los artefactos producidos por este trabajo; los modelos Pythia (Apache-2.0) y la implementacion del lens (Apache-2.0) conservan sus licencias propias.
- Solo 222 de los 380 mapas tienen sidecar `_provenance.json`; el resto carece de ese metadato de procedencia individual en la informacion disponible.
- Los resultados estan acotados a la familia Pythia (70M a 2.8B) y a la implementacion del lens en el commit `581d398`; no se garantiza su validez para otras arquitecturas o versiones del lens.
- El repositorio no incluye los pesos de Pythia; para reajustar mapas hay que obtenerlos por separado.
- Las cifras de benchmarks de los modelos Pythia no forman parte de este repositorio y no se aportan aqui.
- Riesgo de sesgo y alucinacion: no aplica al repositorio en si, pero las conclusiones del articulo dependen del corpus de ajuste elegido, que es precisamente el objeto de la auditoria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Tarush-AI/fittingcorpus
- Repositorio de codigo, pre-registros y documentacion: https://github.com/tarush-ai/fittingcorpus
- Implementacion de referencia del Jacobian lens: https://github.com/anthropics/jacobian-lens (commit `581d398`)
- Modelos Pythia (EleutherAI): no se proporciona enlace en la informacion disponible
- Articulo: Gupta, T. "The Fitting Corpus Is Part of the Measurement: Auditing a Jacobian Lens on Pythia", Interpretability as a Science Workshop, NeurIPS 2026 (sin enlace directo en la informacion disponible)
