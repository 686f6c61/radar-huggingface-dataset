# SZLHOLDINGS/szl-kernels

## Resumen

SZLHOLDINGS/szl-kernels es un artefacto atípico dentro del ecosistema Hugging Face: no se trata de un modelo de lenguaje ni de visión, sino de un **suite de kernels de gobernanza y procedencia** (governed-kernel suite) desarrollado por SZL Holdings. Su propósito es unificar tres kernels internos —`szl-governed-norm`, `szl-lambda-gate` y `governed-inference-meter`— en una única cadena de recibos hash (UnifiedReceiptChain) que permite auditar, verificar y trazar operaciones de inferencia y procesamiento de datos. Está disponible con licencia Apache-2.0 y se distribuye como un paquete Python instalable vía `get_kernel` de la librería `kernels`.

Además del núcleo de gobernanza, el repositorio incluye desde la versión `SZL-MiniEmbed v1` un conjunto de **embeddings de palabras reales** entrenados sin gensim: una matriz de co-ocurrencia término-término ponderada por distancia, con pesos PPMI y reducción de dimensionalidad mediante `TruncatedSVD` hasta 128 dimensiones sobre un vocabulario de 3290 términos. Los autores declaran explícitamente que solo ofrecen evidencia de **sanity intrínseca** (listas de vecinos más cercanos sobre 20 términos de doctrina) y que **no reclaman ningún resultado de benchmark downstream**. El estado operativo declarado es `import-LIVE` en CPU, con GPU (Flash, Triton, etc.) no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Suite de kernels de gobernanza (norm, lambda-gate, inference-meter) + embeddings SZL-MiniEmbed basados en co-ocurrencia PPMI + TruncatedSVD |
| Parametros totales | no disponible (los embeddings son 3290 x 128, pero no se publica el conteo total de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo secuencial generativo) |
| Tipos de cuantizacion | no disponible (solo se mencionan builds `torch-universal` y `torch-cpu`) |
| Idiomas soportados | no disponible (no declarado en la model card) |
| Licencia | Apache-2.0 |
| Formato de pesos | `vectors.npz` + `vocab.json` + `config.json` (embeddings); codigo fuente Python para los kernels |

## Arquitectura y entrenamiento

El artefacto se compone de dos partes diferenciadas. Por un lado, el **suite de kernels** implementa una capa de gobernanza sobre operaciones de inferencia: `szl-governed-norm` normaliza entradas y salidas, `szl-lambda-gate` aplica un umbral Lambda (Conjecture 1, estado ADVISORY) que rechaza valores no finitos o fuera de rango antes de emitir un recibo, y `governed-inference-meter` mide el consumo energético real vía NVML cuando está disponible. Todos los eventos se encadenan en una UnifiedReceiptChain con hash SHA3-256, de modo que cada verificación deja una traza criptográfica verificable de forma offline.

Por otro lado, los **embeddings SZL-MiniEmbed** se entrenaron sobre el "text estate" de SZL (doctrina v10/v11, rag-corpus-v1, thesis-corpus-v18 y READMEs de la familia de kernels). El proceso no usa gensim: se construye una matriz de co-ocurrencia término-término ponderada por distancia, se aplica PPMI (Positive Pointwise Mutual Information) y se reduce con `TruncatedSVD` de scikit-learn hasta 128 dimensiones. El vocabulario resultante contiene 3290 términos. No se documenta el número de tokens de entrenamiento ni detalles sobre el preprocesado del corpus.

## Capacidades

- **Verificacion de procedencia**: permite comprobar la integridad y el origen de operaciones de inferencia mediante recibos hash encadenados (SHA3-256).
- **Gobernanza de umbrales**: el `lambda-gate` rechaza valores no finitos o fuera de rango antes de emitir un recibo, garantizando que un check fallido nunca se reporte como verde.
- **Medicion energetica honesta**: el `inference-meter` reporta consumo real vía NVML cuando hay GPU disponible; si no, devuelve UNAVAILABLE sin inventar datos.
- **Firma de veredictos**: incluye `szl-govsign` para firmar el veredicto de gobernanza y `szl-blocked` para derivar obligaciones segun el EU AI Act.
- **Embeddings de palabras**: SZL-MiniEmbed ofrece representaciones densas de 128 dimensiones para 3290 terminos del dominio de SZL, con listas de vecinos mas cercanos verificables.
- **Auto-chequeo integrado**: `selfcheck` ejecuta 8 comprobaciones (norm_correct, lambda_advisory, energy_honest, cross_kernel_verify, spans_three_kernels, offline_reverify, tamper_detected, block_forward) que validan el correcto funcionamiento del paquete.
- **Compatibilidad CPU**: funciona en entornos sin GPU, con builds `torch-universal` y `torch-cpu`.

## Casos de uso

- **Auditoria de pipelines de IA**: una organizacion que despliegue modelos en produccion puede usar el suite para registrar cada inferencia con un recibo criptografico, facilitando auditorias externas y cumplimiento normativo.
- **Trazabilidad en entornos regulados**: sectores como finanzas o salud pueden integrar `szl-lambda-gate` para garantizar que los umbrales de decision se aplican de forma consistente y verificable, con evidencia de cada paso.
- **Verificacion offline de artefactos**: los recibos encadenados permiten reverificar la integridad de un modelo o dataset sin conexion, util para despliegues en entornos aislados o air-gapped.
- **Medicion de eficiencia energetica**: `governed-inference-meter` permite monitorizar el consumo real de GPU en centros de computo, alimentando informes de sostenibilidad con datos medidos y no estimados.
- **Generacion de embeddings de dominio especifico**: SZL-MiniEmbed puede usarse como capa de feature extraction para tareas de clasificacion o recuperacion sobre el corpus de SZL, aunque sin garantias de rendimiento downstream.
- **Investigacion sobre gobernanza de IA**: el paquete sirve como referencia academica (DOI 10.5281/zenodo.19944926) para estudiar mecanismos de procedencia y verificacion en sistemas de IA, incluyendo la derivacion de obligaciones bajo el EU AI Act.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los autores declaran explicitamente en la model card: "NO downstream/benchmark score is claimed". La unica evidencia publicada es de "intrinsic sanity" (listas de vecinos mas cercanos sobre 20 terminos de doctrina para los embeddings), sin cifras de precision, recall ni comparaciones con otros modelos de embeddings.

## Requisitos de hardware

- **CPU minima**: el estado `import-LIVE` se verifico en un host Linux x86_64 con Intel Xeon de 8 nucleos y Python 3.11+ (torch 2.13.0+cu130 compilado con CUDA 13.0, pero sin dispositivo CUDA).
- **GPU**: no requerida. El paquete funciona en modo CPU; la atencion GPU (Flash, Sage, Flex, Triton) esta marcada como UNAVAILABLE.
- **Memoria**: el tamano del repositorio es de 0.0 GB, por lo que los requisitos de RAM son minimos (los embeddings ocupan 3290 x 128 floats, aproximadamente 1.7 MB en float32).
- **Despliegue**: se instala via `get_kernel("SZLHOLDINGS/szl-kernels", revision="main", trust_remote_code=True)` o con `backend="cpu"`. No se menciona compatibilidad con vLLM, Ollama, TGI ni llama.cpp, ya que no es un modelo generativo.
- **Latencia y throughput**: no se publican mediciones de latencia ni tokens/s. El suite esta disenado para operaciones de gobernanza, no para generacion de texto.

## Comparativa con modelos similares

No disponible. No existe una categoria estandar de "modelos de gobernanza de kernels" con la que comparar este artefacto. En cuanto a los embeddings SZL-MiniEmbed, no se publican benchmarks frente a alternativas como `all-MiniLM-L6-v2` o `text-embedding-3-small`, por lo que cualquier comparacion seria especulativa. El valor diferencial del paquete reside en su capa de procedencia y verificacion, no en capacidades de representacion linguistica.

## Limitaciones y advertencias

- **Sin garantias de rendimiento**: los autores declaran que la verificacion de procedencia "prueba integridad y origen, nunca precision ni rendimiento". No hay evidencia de calidad de los embeddings para tareas reales.
- **Estado ADVISORY del umbral Lambda**: la Conjecture 1 permanece abierta ("uniqueness unproven"), por lo que el lambda-gate opera en modo advisory, no como garantia formal.
- **Dependencia de NVML para energia**: la medicion energetica solo funciona con GPU NVIDIA y NVML disponible; en otros entornos devuelve UNAVAILABLE, limitando su utilidad en clusters heterogeneos.
- **Vocabulario restringido**: los embeddings cubren solo 3290 terminos del dominio SZL, lo que los hace inadecuados para textos generales o fuera del ambito de la organizacion.
- **Licencia**: Apache-2.0 permite uso comercial, pero el codigo depende de `trust_remote_code=True`, lo que implica ejecutar codigo remoto no auditado por terceros; se recomienda revision de seguridad antes de integrarlo en produccion.
- **Fechas futuras**: la model card menciona fechas de 2026 (creacion 2026-06-24, actualizacion 2026-08-29) y versiones de software (torch 2.13.0) que pueden no corresponderse con el estado actual del ecosistema; verificar la vigencia del paquete antes de adoptarlo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SZLHOLDINGS/szl-kernels)
- [Arbol de archivos en Hugging Face](https://huggingface.co/SZLHOLDINGS/szl-kernels/tree/main)
- [Repositorio GitHub canonical](https://github.com/szl-holdings/szl-kernels)
- [Directorio corpus/kernels en GitHub](https://github.com/szl-holdings/szl-kernels/tree/main/corpus/kernels)
- [Workflow de publicacion en szl-forge](https://github.com/szl-holdings/szl-forge/blob/main/.github/workflows/publish-szl-kernels.yml)
- [Atlas del ecosistema SZL](https://a-11-oy.com/ecosystem)
- [DOI del artefacto](https://doi.org/10.5281/zenodo.19944926)
