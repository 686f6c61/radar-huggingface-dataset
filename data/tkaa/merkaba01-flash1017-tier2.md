# Tkaa/Merkaba01-Flash1017-Tier2

## Resumen

Merkaba01-Flash1017-Tier2 es un paquete de pesos de runtime derivado de nvidia/DeepSeek-V4.1-Flash-1017-NVFP4, publicado por el usuario Tkaa bajo licencia Apache 2.0. No es un modelo entrenado desde cero, sino una reempaquetación de los pesos del modelo base de NVIDIA en un formato propietario orientado al motor de inferencia Merkaba01 Pure-Rust Cognitive Runtime Engine. El paquete incluye los expertos MoE y los pesos MLA del modelo base, junto con sidecars binarios precompilados (merkaba_backbone_q4.bin y merkaba_mtp0_q4.bin) en cuantización Q4_G32 para aceleración por hardware.

La arquitectura subyacente corresponde a DeepSeek-V4.1-Flash: 40 capas, dimensión de modelo d_model = 5120, atención Multi-head Latent Attention (MLA), mezcla de expertos (MoE), tablas de búsqueda N-gram «Engram» en las capas 1, 14 y 27, y Multi-Token Prediction (MTP) en la capa 40. El repositorio ocupa 89,3 GB según HuggingFace, aunque la model card declara ~105,1 GiB incluyendo los shards de Engram que no se alojan aquí.

Su relevancia es muy limitada fuera de un contexto experimental muy concreto: los tensores de normalización de capa y de routing están criptográficamente vinculados a NVIDIA Grace Blackwell (GB10 / DGX Spark, Linux aarch64, sm_121) mediante el complemento addon_gx10_rust, y la ejecución en Windows/RTX, Apple Silicon, Intel o AMD está deshabilitada en esta versión. Además, el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y no se han publicado benchmarks ni idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Multi-head Latent Attention (MLA), Mixture-of-Experts (MoE), Engram N-gram lookup y Multi-Token Prediction (MTP); 40 capas, d_model = 5120 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo es MoE, pero no se publica el número de expertos ni los activos por token) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 y BF16 en los shards safetensors; Q4_G32 en los sidecars binarios precompilados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (44 shards, ~92,7 GiB), sidecars .bin propietarios (merkaba_backbone_q4.bin de 12,2 GiB, merkaba_mtp0_q4.bin de 82 MiB), merkaba_dspark_heads.safetensors (126 MiB) |

## Arquitectura y entrenamiento

El paquete no incluye entrenamiento propio: reproduce los pesos de nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 reorganizados en el layout «Tier-2» de Merkaba01. La arquitectura del modelo base combina atención MLA con capas MoE, e incorpora dos mecanismos adicionales: tablas de embeddings asociativos N-gram «Engram» en las capas 1, 14 y 27 (que ocupan los shards 00047 y 00048, ~97,6 GiB, idénticos byte a byte a los del repositorio de NVIDIA y por eso no duplicados aquí), y una cabeza de Multi-Token Prediction en la capa 40 que actúa como draft especulativo.

La innovación del paquete es de despliegue, no de modelado: los sidecars Q4_G32 precompilados permiten mmap de copia cero del backbone MLA y de la cabeza MTP, y se añaden cabezas calibradas DSpark / SilentVectorLoop (JEPA) y CoarseToFineConceptHead (C2F) en merkaba_dspark_heads.safetensors. El layout compacta los expertos MoE en 44 shards, de modo que los shards 00045 y 00046 no existen ni están referenciados en model.safetensors.index.json. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni si el modelo base usó RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: heredadas del modelo base DeepSeek-V4.1-Flash, sin que la model card detalle evaluaciones concretas.
- Decodificación especulativa: la cabeza MTP de la capa 40, empaquetada como sidecar Q4_G32 de 82 MiB, está pensada para acelerar la generación.
- Recuperación asociativa N-gram: las tablas Engram de las capas 1, 14 y 27 añaden un mecanismo de lookup asociativo sobre el transformer.
- Cabezas auxiliares calibradas: DSpark / SilentVectorLoop (JEPA) y CoarseToFineConceptHead (C2F), incluidas en merkaba_dspark_heads.safetensors.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card solo está redactada en inglés y sueco, lo que no implica soporte del modelo para esos idiomas.
- Visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Evaluación de motores de inferencia en Rust: el paquete está diseñado exclusivamente para merkaba-gemma chat flash y flash1017-run, por lo que su uso realista es probar el runtime Merkaba01 contra los pesos de DeepSeek-V4.1-Flash en un DGX Spark.
- Investigación sobre decodificación especulativa: el sidecar merkaba_mtp0_q4.bin permite experimentar con la cabeza MTP como draft en un esquema de speculative decoding dentro del runtime propietario.
- Estudio de recuperación N-gram en LLM: las tablas Engram de las capas 1, 14 y 27 se pueden analizar (o desactivar con --no-engram) para medir su impacto en la perplejidad y en el uso de disco.
- Despliegue en hardware Grace Blackwell: único escenario soportado, con Linux aarch64 y compute capability 12.1; útil para validar el bloqueo criptográfico MERKABA_GB10_LOCK_V1 en un entorno DGX Spark.
- Pruebas de calibración de cabezas auxiliares: los tensores DSpark/JEPA y C2F permiten reproducir experimentos de representación latente sobre el backbone congelado.
- Referencia para reempaquetado de pesos NVFP4: sirve como ejemplo técnico de cómo trocear un modelo MoE de ~92,7 GiB en 44 shards safetensors y complementarlo con sidecars mmap.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 89,3 GB y la model card declara ~105,1 GiB incluyendo los shards Engram, por lo que se requiere un dispositivo con al menos esa capacidad de almacenamiento y memoria unificada.
- GPU soportada: exclusivamente NVIDIA Grace Blackwell GB10 / DGX Spark (Linux aarch64, compute capability 12.1 / sm_121) mediante addon_gx10_rust.
- GPU no soportadas en esta versión: Windows/RTX, Apple Silicon (Mac), Intel y AMD; la ejecución está deshabilitada por el bloqueo MERKABA_GB10_LOCK_V1.
- Consumer GPU: no cabe ni está permitido en GPUs de consumo; el bloqueo es criptográfico sobre los tensores de layer normalization y routing.
- Opciones de despliegue: únicamente el motor Merkaba01 Pure-Rust (merkaba-gemma chat flash / flash1017-run). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Despliegue |
|---|---|---|---|---|---|
| Merkaba01-Flash1017-Tier2 | no disponible | no disponible | NVFP4, BF16, Q4_G32 | Apache 2.0 | Solo motor Merkaba01 en GB10 / DGX Spark |
| nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 (base) | no disponible | no disponible | NVFP4 | no disponible en la informacion | Ecosistema NVIDIA estándar |
| Modelos DeepSeek de la familia Flash | no disponible | no disponible | no disponible | no disponible | vLLM, llama.cpp, etc. |

No se dispone de datos de benchmarks ni de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Bloqueo de hardware: los tensores de normalización y routing están vinculados criptográficamente a GB10 / DGX Spark; no se puede ejecutar en Windows/RTX, Mac, Intel ni AMD en esta versión.
- Dependencia de un runtime propietario: los archivos .bin usan formatos binarios y un layout de expertos propios de Merkaba01, incompatibles con vLLM, llama.cpp, Ollama o TGI.
- Descarga incompleta por defecto: los shards 00047 y 00048 (~97,6 GiB de tablas Engram) deben descargarse aparte desde nvidia/DeepSeek-V4.1-Flash-1017-NVFP4 o usar --no-engram, lo que altera el comportamiento del modelo.
- Estado alpha: la model card lo etiqueta como v0.1 Alpha, con 0 descargas y 0 likes, sin evidencia de validación por terceros.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso multilingüe o con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser una reempaquetación del modelo base, hereda los del original, que tampoco se documentan.
- Licencia: Apache 2.0 en este repositorio, pero conviene verificar la licencia y condiciones del modelo base de NVIDIA antes de un uso comercial.
- Producción: sin benchmarks, sin métricas de latencia y con hardware lock, no es apto para despliegues en producción generalistas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Tkaa/Merkaba01-Flash1017-Tier2
- Modelo base: https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Shards Engram (00047 y 00048): https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4/tree/main
- Paquete de runtime Merkaba01-Flash1017-Tier2-Runtime-v0.1.zip: referenciado en la model card, sin URL directa disponible
- Paper, blog o demo del runtime Merkaba01: no disponible
