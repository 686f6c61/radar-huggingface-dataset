# Zishan-Shao/somecheckpoints

## Resumen

`Zishan-Shao/somecheckpoints` no es un modelo en el sentido habitual, sino un repositorio de artefactos de investigación (5,9 GB) que acompaña al proyecto TraceKV, un trabajo sobre compresión de la caché KV en modelos de visión y lenguaje. El repositorio lo publica el usuario Zishan-Shao bajo licencia MIT y no contiene pesos de ningún modelo: lo que incluye son dos ficheros de calibración de bajo rango (unos 2,95 GB cada uno), tres conjuntos de trazas de 256 muestras, un archivo con el código fuente del proyecto, los resultados de evaluación ya ejecutados y metadatos de procedencia.

El modelo de referencia sobre el que se han generado todos los artefactos es Qwen3-VL-32B-Thinking, un VLM de 32 000 millones de parámetros que el usuario debe descargar por separado (la caché original en BF16 ocupa unos 66,7 GB). El repositorio sirve para continuar experimentos ya empezados: incluye un script `restore.py` que verifica tamaños y SHA-256, descomprime el código y recoloca artefactos, trazas y salidas en las rutas relativas que esperan los scripts.

Su relevancia es de reproducibilidad: permite retomar la tabla de resultados del proyecto (ScienceQA, MathVista, MMMU) sin regenerar trazas densas ni recalibrar, con un entorno fijado a Linux x86_64, Python 3.11, PyTorch 2.6 + CUDA 12.4 y FlashAttention 2.7.4.post1. No tiene descargas ni «likes» y carece de pipeline declarado, por lo que debe tratarse como material de investigación, no como un artefacto listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al repositorio (no contiene pesos). Modelo de referencia: Qwen3-VL-32B-Thinking, transformer visión-lenguaje de 64 capas según los artefactos de calibración |
| Parametros totales | No disponible para el repositorio; el modelo de referencia es de 32B (≈66,7 GB en BF16) |
| Parametros activos | No aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No incluye pesos cuantizados. Los artefactos parametrizan compresión de caché KV con `--k-bits`/`--v-bits` (16/16 en el ejemplo documentado) y bajo rango con `--rank-ratio` (0,5 en el ejemplo) |
| Idiomas soportados | No disponible (la model card está redactada en chino; las tareas de evaluación son mayoritariamente en inglés) |
| Licencia | MIT |
| Formato de pesos | No hay pesos de modelo. Artefactos de calibración en `.pt` (PyTorch), código en `code/TraceKV-source.tar.gz`, metadatos en JSON (`manifest.json`, `LATEST.json`, `metadata/`) y checksums en `SHA256SUMS` |
| Tamaño del repositorio | 5,9 GB (los dos ficheros de calibración suman ≈5,9 GB) |
| Contenido principal | `artifacts/table2/qwen3_vl_32b/ours.pt` y `palu.pt`; `traces/scienceqa/`; `code/`; `outputs/`; `metadata/` |
| Modelo base requerido | `Qwen/Qwen3-VL-32B-Thinking` (descarga aparte) |
| Entorno de referencia | Linux x86_64, Python 3.11, PyTorch 2.6 + CUDA 12.4, FlashAttention 2.7.4.post1 |
| Descargas / likes | 0 / 0 |
| Creado / actualizado | 2026-04-11 / 2026-10-25 |

## Arquitectura y entrenamiento

El repositorio no documenta entrenamiento alguno: es un volcado de estado experimental. El pipeline subyacente es TraceKV, que combina compresión de bajo rango de la caché KV con cuantización de las matrices K y V. El fichero `ours.pt` se generó con covarianza de tipo `sensitivity` y puntuaciones de importancia, sobre 256 muestras de calibración y 64 capas. El fichero `palu.pt` usa covarianza `basic` con puntuaciones de importancia PALU, también 256 muestras y 64 capas, con una peculiaridad numérica en la capa 0: descomposición de Cholesky en FP64 para K/V, amortiguamiento original `1e-5` y corrección diagonal adicional de 0. Estas diferencias importan porque determinan la reproducibilidad exacta de los resultados de calibración.

El paquete de código (`code/TraceKV-source.tar.gz`) incluye el proyecto, una copia modificada de `lmms-eval` con el registro del modelo y las tareas adaptadas, los ficheros de entorno (`envs/spar-kv.yml`), scripts de instalación y tests; contiene cambios no confirmados y excluye `.git` y bytecode de Python. Las trazas de `traces/scienceqa/` son tres conjuntos de 256 muestras cada uno, descritos en `metadata/traces.json`. La evaluación se ejecuta con `scripts/run_lmms_eval.py` sobre tareas como `scienceqa_img_reasoning`, MathVista y MMMU, con `batch-size 1` y un solo proceso. El script `run_from_artifacts.sh` orquesta 38 rondas completas (39 con `--all-dense`) reutilizando los resultados densos de ScienceQA ya presentes y reutilizando caché de generación por pregunta.

## Capacidades

- Restauración verificada de artefactos: `restore.py` comprueba tamaño y SHA-256 de cada fichero descargado, descomprime el código y valida cada archivo contra `code/FILES.json`.
- Recolocación automática de rutas: devuelve `artifacts`, `traces` y `outputs` a las rutas relativas que esperan los scripts, instala `run_from_artifacts.sh` y deja una copia local de la model card como `HF_README.md`.
- Modo de solo verificación (`--verify-only`) para auditar la descarga sin crear directorio de trabajo.
- Trazabilidad: escribe `.tracekv_restore.json` con el origen de la restauración y el estado de las evaluaciones del modelo original ya completadas.
- Ejecución de evaluaciones con `lmms-eval` sobre tareas multimodales de razonamiento (ScienceQA, MathVista, MMMU).
- Barrido de configuraciones de compresión: combinaciones de `--rank-ratio` y `--rank-allocation importance` con cuantización K/V independiente (`--k-bits`, `--v-bits`).
- Orquestación secuencial con previsualización (`run_from_artifacts.sh --dry-run`) y reanudación basada en caché de generación por pregunta.
- No implementa generación propia, tool calling, capacidades de agente ni modo *thinking*: esas capacidades pertenecen al modelo base Qwen3-VL-32B-Thinking, invocado a través de los scripts.

## Casos de uso

- Reproducción de la tabla de resultados del paper: restaurar el repositorio y lanzar `run_from_artifacts.sh` permite repetir las 38 rondas de evaluación con las mismas configuraciones, orden de tareas y `batch=1` documentados, sin repetir la generación de trazas ni la calibración.
- Verificación de una configuración concreta antes de gastar GPU: el ejemplo con `--limit 8` sobre `scienceqa_img_reasoning` valida que el entorno, el artefacto y la tarea funcionan antes de lanzar el conjunto completo (2 017 muestras en ScienceQA).
- Estudio comparado de métodos de calibración: los dos artefactos (`ours.pt` con covarianza `sensitivity` e importancia, `palu.pt` con covarianza `basic` y PALU) permiten medir el impacto de la elección de calibración manteniendo constante el resto del pipeline.
- Investigación sobre compresión de caché KV en modelos visión-lenguaje: útil para grupos que quieran replicar la metodología sobre tareas que exigen razonamiento visual y luego extrapolarla a otros modelos.
- Integración en un pipeline de CI de investigación: `restore.py --verify-only` más `SHA256SUMS` permiten comprobar la integridad de los artefactos en cada build o réplica antes de consumir horas de GPU.
- Auditoría de datos de trazas: `traces/scienceqa/` con tres conjuntos de 256 muestras y `metadata/traces.json` sirve para inspeccionar la distribución de calibración y detectar fugas o desequilibrios respecto al conjunto de evaluación.
- Reutilización del arnés de evaluación: la copia modificada de `lmms-eval` con el registro de modelo y las tareas adaptadas puede servir como base para evaluar otras variantes del mismo modelo con las mismas condiciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye cifras de MMLU, HumanEval, GSM8K ni métricas de las tareas multimodales; solo el estado de ejecución de la campaña de evaluación.

| Elemento | Estado según la información disponible |
|---|---|
| ScienceQA (modelo original, 2 017 muestras) | Resultado completo incluido en `outputs/`, se reutiliza por defecto |
| MathVista (modelo original) | Pendiente, se lanza al continuar la campaña |
| MMMU (modelo original) | Pendiente, se lanza al continuar la campaña |
| Rondas de evaluación de bajo rango y cuantización | 36 pendientes (38 en total con las del modelo original) |
| Comprobaciones rápidas de 8 muestras | Tres incluidas en `outputs/` |

## Requisitos de hardware

- Espacio en disco: 5,9 GB de descarga más unos 6 GB adicionales para descomprimir y restaurar artefactos.
- Pesos del modelo base: la caché original en BF16 ocupa ≈66,7 GB (`Qwen/Qwen3-VL-32B-Thinking`), que se descarga aparte y se reutiliza si ya está en caché.
- VRAM: se necesita una GPU capaz de alojar los 32B en BF16 más el estado de inferencia. Estimación a partir del tamaño de pesos: ≥64 GB solo para pesos, por lo que se requieren aceleradores de 80 GB (A100 80 GB, H100 80 GB) o configuraciones multi-GPU equivalentes; no cabe en una GPU de consumo de 24 GB en BF16.
- GPU de consumo: no viable en RTX 4090 / 3090 de 24 GB con el flujo documentado (BF16, sin cuantización de pesos del modelo base). No se documenta ninguna ruta de cuantización de pesos del modelo.
- Software obligatorio: controlador NVIDIA compatible, CUDA 12.4, PyTorch 2.6, FlashAttention 2.7.4.post1; `scripts/check_env.py --require-cuda` valida el entorno.
- Despliegue: el flujo previsto usa `conda`/`micromamba` con `envs/spar-kv.yml`, instalación editable del paquete y de `external/lmms-eval`, y `scripts/run_lmms_eval.py`. No se contemplan vLLM, TGI, llama.cpp ni Ollama, entre otras razones porque el repositorio no contiene pesos.
- Rendimiento: toda la campaña se ejecuta con `batch-size 1` y `num-processes 1`, por lo que el throughput es bajo y el coste dominante es el tiempo por muestra; no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Repositorio | Tipo de contenido | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Zishan-Shao/somecheckpoints` | Artefactos de calibración, trazas, código y salidas de TraceKV | No contiene pesos; referencia a un modelo de 32B | No disponible | MIT | 0 descargas, 0 likes, sin pipeline declarado |
| `Qwen/Qwen3-VL-32B-Thinking` | Pesos del modelo visión-lenguaje | 32B | No disponible en la información | No indicada en la información (el modelo base se rige por su propia licencia) | Requerido para ejecutar las evaluaciones |
| Repositorios equivalentes de compresión de caché KV | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante no es de rendimiento, sino de función: este repositorio no puede sustituir al modelo base ni competir con él; solo es utilizable junto a `Qwen/Qwen3-VL-32B-Thinking` y al proyecto TraceKV.

## Limitaciones y advertencias

- No es un modelo utilizable para inferencia: no contiene pesos, tokenizador ni configuración de generación. Cualquier uso requiere descargar el modelo base y montar el entorno del proyecto.
- El repositorio tiene 0 descargas y 0 likes, no declara pipeline y la documentación está en chino; no hay validación externa de los artefactos ni de los resultados.
- Dependencia fuerte de versiones: el flujo asume Linux x86_64, Python 3.11, PyTorch 2.6 + CUDA 12.4 y FlashAttention 2.7.4.post1. Desviarse de estas versiones puede invalidar la reproducibilidad de los artefactos.
- `external/lmms-eval` es una copia modificada (registro de modelo y tareas alterados); sustituirla por la versión upstream rompe la ejecución.
- Fijación de versiones incompleta por defecto: la carga se hace por ID de modelo y de dataset; para congelar las revisiones exactas hay que aplicar `metadata/upstream_assets.json`.
- `restore.py` exige un directorio destino nuevo y no sobrescribe proyectos existentes; además no instala el entorno, no descarga el modelo original ni lanza la evaluación en GPU.
- Requiere red y autenticación en Hugging Face en la primera ejecución (modelo y datasets se descargan bajo demanda).
- Los resultados nuevos no se suben automáticamente a Hugging Face; el versionado de las salidas corre a cargo del usuario.
- La licencia MIT cubre este repositorio; el modelo base y los datasets tienen sus propias licencias, que no se detallan en la información disponible y deben verificarse antes de un uso comercial.
- Reproducir `run_sequential.sh` desde cero duplica la calibración PALU y las fases iniciales; está pensado solo como registro histórico del proceso.
- Sesgos y alucinación: no evaluables a partir de este repositorio; son los heredados del modelo base y de los datasets empleados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Zishan-Shao/somecheckpoints
- Proyecto TraceKV en GitHub: https://github.com/AK-DREAM/TraceKV
- Modelo base requerido: https://huggingface.co/Qwen/Qwen3-VL-32B-Thinking
- Papers, blogs, demos y otros recursos adicionales: no disponibles en la información proporcionada.
