# yqtang/gemma-4-31b-it-text-3bit-mlx

## Resumen

Gemma 4 31B IT text 3-bit MLX es una cuantización de 3 bits del modelo Gemma 4 31B instruction-tuned de Google, preparada por el usuario yqtang mediante MLX-LM para su ejecución en Apple Silicon. El paquete contiene únicamente el backbone de texto (tokenizer, chat template, configuración, índice y tres shards de pesos cuantizados) y sirve como base compartida para dos adaptadores de extracción documental publicados por el mismo autor: ContractNLI124 y SFT450. No es, por tanto, un modelo autónomo orientado a uso general, sino una pieza de infraestructura para cargar adaptadores sobre un mismo sustrato cuantizado.

La relevancia de esta ficha es doble. Por un lado, demuestra el flujo de trabajo de MLX-LM 0.31.3 para cuantizar modelos de 31B a 3 bits con quantización afín y group size 64, reduciendo los aproximadamente 62,55 GB del BF16 original a unos 13,43 GB de shards. Por otro, documenta un caso de reutilización de base para múltiples adaptadores LoRA en el mismo dispositivo, con una memoria activa medida de 12,52 GiB en un Apple M5 Max con 128 GiB de memoria unificada.

El modelo hereda la licencia Apache-2.0 del Gemma 4 original según la model card del autor. Al tratarse de un artefacto derivado con fecha de creación posterior a la información pública disponible sobre la familia Gemma 4, los detalles de arquitectura interna, datos de entrenamiento y benchmarks no están documentados en la información proporcionada y se indican como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone de texto de Gemma 4 31B IT, según modelo base); detalles internos no disponibles |
| Parametros totales | 30.697.345.280 (≈30,7B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 3-bit affine quantization, group size 64, parámetros no cuantizados en BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 3 shards; repo de 13,5 GB (13,43 GB de shards) |

## Arquitectura y entrenamiento

El paquete deriva del Gemma 4 31B instruction-tuned de Google, a través de la conversión BF16 de MLX Community (revisión fijada). MLX-LM 0.31.3 conservó el backbone de lenguaje y cuantizó los pesos con cuantización afín de 3 bits y group size 64, manteniendo en BF16 los parámetros no cuantizados. El resultado son tres shards safetensors con un total de 13,43 GB, frente a los aproximadamente 62,55 GB de los pesos BF16 de origen.

No se dispone de información sobre la composición del dataset de entrenamiento original, el número de tokens, ni sobre si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas específicas más allá de las propias del modelo base. La contribución técnica de este repositorio es la receta de cuantización MLX y la estructuración del paquete como base compartida para adaptadores, con verificación de integridad mediante `SHA256SUMS`.

## Capacidades

- Generación de texto conversacional en modo instruction-tuned, heredada del modelo base.
- Extracción de información documental cuando se le acoplan los adaptadores ContractNLI124 o SFT450 (no incluye visión: los documentos escaneados requieren un paso OCR previo).
- Carga de múltiples adaptadores sobre la misma base cuantizada, permitiendo alternar tareas sin duplicar los pesos del backbone.
- Chat template incluido en el paquete, listo para usar con MLX-LM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling, function calling, agentes y modo thinking: no documentados en la información disponible.

## Casos de uso

- Extracción de cláusulas en contratos: cargando el adaptador ContractNLI124 sobre esta base, el modelo puede identificar y clasificar estipulaciones en textos contractuales, aprovechando que el backbone ya está cuantizado y listo para MLX.
- Extracción documental genérica tras SFT: con el adaptador SFT450 acoplado, se puede desplegar un extractor ajustado a un esquema propio sin reentrenar el modelo completo, solo el adaptador.
- Desarrollo y prototipado en portátiles Apple Silicon: el paquete de 13,46 GB cabe en equipos con 32 GB o más de memoria unificada, lo que permite iterar sobre pipelines de extracción sin GPU dedicada.
- Evaluación comparativa de adaptadores: al compartir base, es posible medir el impacto de distintos ajustes (ContractNLI124 frente a SFT450) manteniendo constantes los pesos del backbone y aislando el efecto del adaptador.
- Servicio local de procesamiento documental: integrado en un flujo con OCR previo, el modelo puede procesar lotes de documentos en un equipo de sobremesa Apple sin enviar datos a la nube, algo relevante para contratos y documentación sensible.
- Base para nuevos adaptadores: investigadores que quieran añadir su propio LoRA de extracción pueden partir de esta base de 3 bits en lugar de cuantizar el BF16 de 62,55 GB, ahorrando tiempo y espacio en disco.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria unificada: 12,52 GiB de memoria activa medida en MLX tras cargar el modelo (sin adaptador) en un Apple M5 Max con 128 GiB.
- Tamaño en disco: 13,46 GB de descarga, 13,43 GB de shards.
- Plataforma: Apple Silicon exclusivamente (MLX). No es ejecutable en CUDA ni en CPU x86 mediante este paquete.
- Software: Python 3.11, MLX 0.31.2, MLX-LM 0.31.3 y Transformers 5.9.0.
- GPU consumer: cabe en equipos Apple con 16 GB de memoria unificada o más, aunque 24-32 GB dan margen para contexto largo y adaptadores.
- Despliegue: `mlx_lm.load` desde el Hub (revisión `v1.0`) o desde copia local; verificación con `shasum -a 256 -c SHA256SUMS`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Plataforma |
|---|---|---|---|---|---|
| yqtang/gemma-4-31b-it-text-3bit-mlx | 30,7B | No disponible | 3-bit MLX | Apache-2.0 | Apple Silicon (MLX) |
| mlx-community/gemma-4-31b-it-bf16 (base) | 30,7B | No disponible | BF16 (62,55 GB) | Apache-2.0 | Apple Silicon (MLX) |
| google/gemma-4-31B-it (original) | 30,7B | No disponible | BF16 | Apache-2.0 (según model card del autor) | Multiplataforma |
| Alternativas de 3-bit MLX de otros modelos | No disponible | No disponible | 3-bit MLX | Variable | Apple Silicon (MLX) |

La comparación principal es con el BF16 del que deriva: misma arquitectura y parámetros, pero un 78 % menos de peso en disco y una huella de memoria activa de 12,52 GiB. Frente al original de Google, este paquete pierde la multimodalidad (es solo texto) y gana portabilidad en Apple Silicon.

## Limitaciones y advertencias

- Modelo solo de texto: no procesa imágenes ni documentos escaneados sin un paso OCR previo.
- No es un modelo autónomo de uso general: está pensado como base para adaptadores de extracción; sin adaptador, su comportamiento no está validado para tareas productivas.
- La cuantización a 3 bits puede degradar la calidad frente al BF16 en tareas sensibles a precisión, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Sin datos de benchmarks, no es posible comparar su rendimiento real con el modelo original.
- Idiomas soportados no documentados; no se puede garantizar calidad en castellano u otros idiomas sin evaluación propia.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en extracción de campos contractuales donde una cláusula inventada tiene consecuencias legales.
- Licencia Apache-2.0 según la model card del autor; conviene verificar las condiciones del modelo base de Google antes de uso comercial, ya que la información disponible no detalla términos adicionales de la familia Gemma.
- Dependencia estricta de versiones concretas de MLX, MLX-LM y Transformers; otras versiones pueden no cargar los shards correctamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes de terceros sobre su funcionamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yqtang/gemma-4-31b-it-text-3bit-mlx
- Adaptador ContractNLI124: https://huggingface.co/yqtang/gemma-4-31b-extractor-contractnli124-mlx
- Adaptador SFT450: https://huggingface.co/yqtang/gemma-4-31b-extractor-sft450-mlx
- Modelo base BF16 en MLX Community: https://huggingface.co/mlx-community/gemma-4-31b-it-bf16/tree/3cbbeca52de3125c5eed024d2e9f75b2434bfbbc
- Modelo original de Google: https://huggingface.co/google/gemma-4-31B-it/tree/3548789868c5356dbf307c98e6f609007b82b3eb
- Licencia Apache-2.0 incluida en el repo: LICENSES/Apache-2.0.txt
- Atribución y cambios: NOTICE.md
