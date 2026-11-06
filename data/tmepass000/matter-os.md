# tmepass000/matter-os

## Resumen

MATTER OS (prototype 0.1.0) es un entorno de investigacion local-first y evidence-first para generar, cribar, simular y evaluar estructuras atomicas, moleculares y de materiales. Lo desarrolla el usuario tmepass000 y se publica como monorepo modular en Python construido a partir de la "MATTER OS Master Specification v1.0". No es un modelo de lenguaje en sentido estricto: es un software de simulacion cientifica con una interfaz LLM marcada explicitamente como stub, es decir, no implementada. Su relevancia radica en la disciplina epistemologica que impone: separa la generacion libre de hipotesis de la emision de afirmaciones, que quedan acotadas y clasificadas en niveles de evidencia M0 a M3.

El sistema unifica representacion de estructuras (composicion, grafo tipado, geometria/celda/simetria, condiciones y linaje) con round-trip XYZ/CIF/SDF, ofrece transformaciones reversibles con trazabilidad y busqueda guiada, evolutiva y adaptativa con ranking Pareto. Integra seis adaptadores de solucionadores reales (ASE EMT, Lennard-Jones, MD de Langevin, mecanica estadistica armonica, PySCF HF y DFT) tras un contrato comun, y otros nueve motores declarados como stubs que devuelven `NOT_SUPPORTED`. Expone todo mediante FastAPI y un dashboard con visor 3D offline.

La ficha se basa exclusivamente en la model card publicada. No hay datos de parametros, contexto, benchmarks de lenguaje ni pesos, porque el artefacto no es un modelo neuronal entrenado. Cualquier dato no presente en la informacion se marca como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Monolito modular Python (no es un transformer ni un modelo neuronal); orquestacion de agentes de reglas, solucionadores fisico-quimicos y API FastAPI |
| Parametros totales | no disponible (no aplica; no es un modelo con pesos entrenados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (interfaz LLM declarada como stub) |
| Licencia | MIT (el codigo; componentes de terceros conservan sus licencias, ver LICENSES_AND_ATTRIBUTION.md) |
| Formato de pesos | no disponible (no publica pesos; el artefacto es codigo fuente Python) |

## Arquitectura y entrenamiento

No hay entrenamiento de un modelo neuronal. La arquitectura es un monolito modular Python organizado en capas segun la seccion 16 de la especificacion: `core` (esquemas, unidades, elementos, representacion, restricciones, linaje, procedencia, IO, errores), `discovery` (generadores, transformaciones, busqueda, optimizacion, archivos, active learning, servicio de candidatos), `simulation` (contrato, registro, router, adaptadores, convergencia, benchmarks), `agents` (coordinador y runtime, 12 especialistas, agentes dinamicos, memoria, mensajeria, debate, evaluacion, meta y stub LLM), `orchestration` (misiones, planificador, colas y runner de jobs, checkpoints, recursos, fallos), `knowledge` (grafo, gobernanza, procedencia, ingestion), `evidence` (incertidumbre, novedad, madurez, replicacion, informes) y `storage` (SQLite con migraciones, repositorios, almacen de artefactos, archivos y snapshots, indices).

Los motores de simulacion reales son seis: ASE EMT, Lennard-Jones, MD de Langevin, mecanica estadistica armonica, PySCF Hartree-Fock y DFT. Otros nueve (xtb/tblite, Quantum ESPRESSO, CP2K, Psi4, LAMMPS, GROMACS, OpenMM, campo, FEM) son stubs que devuelven `NOT_SUPPORTED`. El runner de jobs aisla procesos worker con limite de CPU, watchdog de RAM, limite de tiempo de pared, cancelacion, checkpoint/resume, reintentos y recuperacion ante caidas. Los registros de ejecucion son inmutables, con checksum y firma HMAC, y cada dato lleva procedencia. El sistema incorpora registros de incertidumbre de cinco componentes, novedad relativa a las fuentes buscadas y compuertas M0-M3 con trazas, ademas de un grafo de conocimiento gobernado con estados proposed, provisional, verified, contradicted y deprecated.

La innovacion destacable no es algoritmica de aprendizaje, sino de gobernanza de evidencia: la regla central es "generacion de hipotesis sin restricciones; afirmaciones reproducibles y guiadas por evidencia, con restricciones". El nivel M4 (confirmado experimentalmente) nunca se asigna por simulacion y exige evidencia de laboratorio real. La interfaz LLM esta explicitamente marcada como stub, por lo que no hay inferencia de lenguaje integrada.

## Capacidades

- Representacion unificada de estructuras atomicas, moleculares y de materiales con composicion, grafo tipado, geometria, celda, simetria, condiciones y linaje, con round-trip XYZ/CIF/SDF.
- Transformaciones reversibles con trazabilidad de linaje.
- Busqueda con semilla aleatoria reproducible, guiada, evolutiva y adaptativa, con ranking Pareto y reserva de exploracion.
- Seis solucionadores reales detras de un contrato unico: ASE EMT, Lennard-Jones, MD de Langevin, mecanica estadistica armonica, PySCF HF y DFT.
- Ejecucion aislada de jobs con limite de CPU, watchdog de RAM, limite de tiempo, cancelacion, checkpoint, reanudacion, reintentos y recuperacion ante caidas.
- Registros inmutables con checksum y firma HMAC, procedencia en cada dato y archivos de proyecto que reconstruyen entradas, configuraciones, versiones y resultados.
- Registros de incertidumbre de cinco componentes, estimacion de novedad relativa y compuertas de madurez M0-M3 con trazas.
- Grafo de conocimiento gobernado con estados proposed, provisional, verified, contradicted y deprecated.
- Trece agentes de reglas con nombre propio mas agentes dinamicos, contratos de tarea, listas de herramientas permitidas, memoria, mensajes, debate y evaluacion.
- API FastAPI que expone cada operacion de la seccion 14, con dashboard de pagina unica y visor 3D de estructuras offline.
- Reproduccion de benchmarks registrados: constante de red de Cu con EMT, minimos globales LJ13 y LJ38, y RHF/STO-3G de H2.
- Capacidades de tool calling, agentes multi-paso y razonamiento en lenguaje natural: no disponibles (interfaz LLM declarada como stub).

## Casos de uso

- Exploracion de candidatos estructurales: se define un objetivo, el sistema genera estructuras con busqueda sembrada, evolutiva o adaptativa, las criba con ranking Pareto y devuelve candidatos priorizados con reserva de exploracion. Adecuado porque el pipeline completo esta implementado y es reproducible con semilla.
- Simulacion rapida de materiales con potenciales de modelo: uso de ASE EMT o Lennard-Jones para estimar geometrias y energias antes de recurrir a DFT, dado que ambos adaptadores estan operativos y devuelven resultados reales.
- Calculo cuantico de moleculas pequenas: PySCF Hartree-Fock con base minima STO-3G para moleculas como H2, con benchmark registrado reproducible; sirve como verificacion de pipeline antes de escalar a metodos mas costosos.
- Gestion de trabajos largos y fragiles: el runner aislado con checkpoint/resume, reintentos y recuperacion ante caidas permite lanzar simulaciones que consumen RAM y CPU acotadas por politica de recursos, con cancelacion limpia.
- Auditoria y trazabilidad de resultados cientificos: los registros firmados con HMAC, la procedencia por dato y los archivos de proyecto que reconstruyen entradas y configuraciones permiten reconstruir cualquier resultado para revision interna o reproducibilidad.
- Clasificacion disciplinada de afirmaciones: el uso de compuertas M0-M3 con trazas y la prohibicion explicita de asignar M4 sin laboratorio permiten separar hipotesis de conclusiones en informes de I+D.
- Integracion en pipelines via API: FastAPI expone todas las operaciones de la seccion 14, de modo que un servicio externo puede lanzar misiones, consultar estado y recuperar informes mediante HTTP, con OpenAPI en `/docs`.
- Cribado con aprendizaje activo: el script `scripts/active_learning_benchmark.py` permite medir la seleccion activa frente a la aleatoria, aunque en las pruebas del autor no mostro mejora medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de modelos de lenguaje en la informacion disponible. Los unicos benchmarks cientificos reproducibles que menciona la model card son los siguientes, sin cifras numericas publicadas:

| Benchmark | Motor | Resultado |
|---|---|---|
| Constante de red de Cu | ASE EMT | Reproducido (sin cifra publicada) |
| Minimos globales LJ13 y LJ38 | Lennard-Jones | Reproducido (sin cifra publicada) |
| H2 RHF/STO-3G | PySCF | Reproducido (sin cifra publicada) |

Datos de rendimiento operativo mencionados: el demo end-to-end tarda aproximadamente 65 s en 2 CPUs, el demo `--quick` unos 10 s y la suite de 89 tests unos 30 s. No se publican cifras de latencia por job ni throughput de simulacion.

## Requisitos de hardware

- VRAM estimada: no aplica; el sistema es CPU-bound y no requiere GPU segun la informacion disponible.
- GPU recomendadas: no disponible; no se menciona aceleracion por GPU en la model card.
- Cabe en consumer hardware: si, el demo corre en 2 CPUs; el runner aplica limites de CPU y watchdog de RAM configurables por politica de recursos.
- Opciones de despliegue: instalacion local con `pip install -e ".[all]"`; servidor via `uvicorn apps.api:create_app --factory --port 8000`; dashboard en `http://127.0.0.1:8000/` con OpenAPI en `/docs`.
- Dependencias declaradas: numpy, scipy, ase, pydantic, fastapi, uvicorn, pyyaml, spglib, psutil; extras `chem` (RDKit, necesario para SDF y la gramatica de grafos) y `quantum` (PySCF).
- Latencia y throughput: demo end-to-end aproximadamente 65 s en 2 CPUs; suite de tests aproximadamente 30 s; no se publican cifras de throughput de simulacion.
- Aislamiento: solo a nivel de proceso, sin contenedores ni seccomp; las firmas son comprobaciones de integridad HMAC locales, no PKI.

## Comparativa con modelos similares

No disponible. La model card no identifica alternativas comparables ni ofrece datos de comparacion con otros entornos de simulacion o frameworks de descubrimiento de materiales. Por categoria, cabria situarlo frente a stacks como ASE, pymatgen o frameworks de active learning, pero la informacion proporcionada no incluye comparaciones y no se dispone de cifras para establecerlas sin inventar datos.

## Limitaciones y advertencias

- Precision limitada por el metodo: EMT y Lennard-Jones son potenciales de modelo, y HF/STO-3G es un metodo de base minima. Cada afirmacion declara el metodo que la produjo.
- La "replicacion independiente" con el mismo motor cuenta como evidencia M3 bajo las compuertas configuradas; la propia afirmacion registra la limitacion "same engine; not an independent code".
- La novedad es relativa unicamente al conjunto de referencia ASE incluido y a los candidatos del propio proyecto.
- El aprendizaje activo esta implementado pero no mostro mejora medida frente a la seleccion aleatoria en la prueba del autor.
- El dashboard se sirvio y se probo por API, pero no fue inspeccionado visualmente (no habia navegador headless disponible).
- Aislamiento solo a nivel de proceso, sin contenedores ni seccomp; las firmas son comprobaciones de integridad HMAC locales, no PKI.
- Nueve motores (xtb/tblite, QE, CP2K, Psi4, LAMMPS, GROMACS, OpenMM, campo, FEM) son stubs y devuelven `NOT_SUPPORTED`.
- La interfaz LLM es un stub declarado; sin extras `chem` o `quantum`, las funciones relacionadas devuelven `UNSUPPORTED_METHOD`.
- El nivel M4 nunca se asigna por simulacion y requiere evidencia de laboratorio real.
- Licencia MIT para el codigo, pero los componentes de terceros conservan sus propias licencias; conviene revisar LICENSES_AND_ATTRIBUTION.md antes de uso comercial.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; prototipo 0.1.0 sin validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmepass000/matter-os
- Documentacion de estado y carencias: `docs/STATUS_MATRIX.md` (referenciada en la model card)
- Licencias y atribucion de terceros: `LICENSES_AND_ATTRIBUTION.md` (referenciado en la model card)
- Documentacion interna citada: `docs/` (architecture, methods, API, ADRs, changelog, resources, benchmarks)
- Repositorio, paper, blog o demo publicos: no disponibles en la informacion proporcionada
