# zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF

## Resumen

DeepSeek-V4-Flash-0731 es un modelo de lenguaje de gran escala desarrollado por DeepSeek, publicado bajo licencia MIT y orientado a generación de texto conversacional. La versión aquí descrita es una cuantización GGUF elaborada por el usuario zephel01, no el modelo original: se trata de un archivo de 96,8 GB que empaqueta los 284.334.567.511 parámetros del modelo base en un formato mixto de baja precisión (2,64 bits por peso de media) pensado para ejecutarse en un PC con una GPU de 32 GB de VRAM y 96 GB de RAM.

El modelo base es un transformer de tipo Mixture of Experts (MoE), según se deduce de las etiquetas del repositorio y de la estructura de tensores descrita en la model card (256 expertos enrutados por capa, con tensores de gate/up/down). La cuantización conserva la totalidad de los 256 expertos en cada capa, sin poda, lo que la distingue de otras reducciones más agresivas. El resultado es un archivo que, según el autor, mantiene una fidelidad superior a la cuantización de referencia de Unsloth (UD-Q2_K_XL) con un tamaño de descarga idéntico.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar un modelo de casi 285.000 millones de parámetros en hardware de consumo de gama alta (RTX 5090, 32 GB) mediante offload a RAM y SSD, con velocidades reportadas de 69,1 tok/s. Es un caso práctico de cuantización extrema con preservación de calidad medida mediante divergencia KL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (MoE), 256 expertos enrutados por capa |
| Parametros totales | 284.334.567.511 (284,3 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible en la informacion proporcionada (probado con `-c 32768` en llama.cpp) |
| Tipos de cuantizacion | Mixta: IQ2_XS (41% de los expertos gate/up), IQ3_XXS (39% de los expertos down), IQ2_S (18%), MXFP4 (2%); tensores de atención en Q5_K; resto en bytes de UD-Q2_K_XL. Media de 2,64 bits por peso |
| Idiomas soportados | Ingles y japones (segun etiquetas y model card) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 96,8 GB) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-V4-Flash-0731 es un transformer de tipo Mixture of Experts con 256 expertos enrutados por capa, según la estructura de tensores descrita en la model card de la cuantización (expertos gate, up y down por capa, más tensores densos de atención y router). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO, ya que la model card del repositorio cuantizado no los detalla y no se ha proporcionado la del modelo base.

La innovación técnica principal de esta versión es el proceso de recuantización: los expertos enrutados se recuantizaron con LDLQ (LDLQ, una variante de cuantización con corrección de error basada en matrices de Hessian) a partir de los pesos UD-Q8_K_XL de Unsloth, cuyos expertos son los pesos MXFP4 originales. Las matrices de Hessian se obtuvieron de respuestas de chat del propio V4 (241 prompts, 104 en japonés, con la plantilla del modelo) más texto general. Se generó una imatrix propia de aproximadamente 1 millón de tokens, ya que Unsloth no había publicado una para V4. El resultado es un archivo con una divergencia KL de 0,150 frente al original, inferior a la de la referencia UD-Q2_K_XL (0,186), con un 84,1% de coincidencia en el token top-1.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia del modelo V4.
- Razonamiento y respuesta a preguntas, incluyendo matemáticas básicas (ejemplo verificado: 17*23).
- Generación de código: la model card menciona tareas de programación en las pruebas de calidad (tres tareas de coding en japonés).
- Soporte de tool calling / function calling: verificado en las pruebas de calidad del autor (tool call incluido en el chequeo de Abyss).
- Capacidades de contexto largo: probado con needle de 8K-31K tokens y ventana de 32.768 tokens en llama.cpp.
- Multilingüe limitado: inglés y japonés, con especial atención al japonés (104 de los 241 prompts de calibración).
- Compatible con endpoints OpenAI (`/v1/chat/completions`) mediante Abyss o llama-server.
- No se dispone de información sobre modo thinking, visión o audio en la información proporcionada.

## Casos de uso

- Ejecución local de un modelo de 284B en hardware de consumo: con una RTX 5090 de 32 GB y 96 GB de RAM, el modelo se puede servir mediante llama.cpp o Abyss con offload automático de expertos a CPU/RAM, permitiendo inferencia privada sin depender de la nube.
- Asistente de programación en japonés e inglés: el modelo conserva el 84,1% de coincidencia en token top-1 y fue calibrado con 104 prompts en japonés, lo que lo hace adecuado para tareas de coding y revisión de código en entornos bilingües.
- Automatización de atención al cliente con contexto largo: la ventana de 32K tokens permite gestionar conversaciones multi-turno con historiales extensos o documentación adjunta, sirviendo la API compatible con OpenAI.
- Procesamiento de documentos técnicos con needles de 8K-31K: las pruebas de recuperación de información en contexto largo (needle) verificadas por el autor lo hacen útil para extracción de datos en informes extensos.
- Agentes con tool calling: la verificación de tool call en el chequeo de Abyss permite integrarlo en flujos de agentes que invocan funciones externas (APIs, bases de datos) mediante el formato de chat del modelo.
- Prototipado e investigación en cuantización extrema: el repositorio sirve como referencia para estudiar el impacto de LDLQ e imatrix propia en la fidelidad de modelos MoE de gran tamaño, con métricas KL reproducibles.
- Despliegue en DGX Spark: existe una variante específica para DGX Spark (128 GB) con los mismos archivos, útil para entornos de desarrollo con memoria unificada.

## Benchmarks y rendimiento

La model card proporciona métricas de calidad de la cuantización (divergencia KL y coincidencia de token top-1) frente a la referencia de Unsloth, así como velocidad de inferencia medida en Abyss:

| Metrica | L97 (este repo) | UD-Q2_K_XL (referencia) |
|---|---:|---:|
| Tamano de descarga | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,150 | 0,186 |
| KL, japones (3 secuencias) | 0,145 | 0,219 |
| Misma token top-1 | 84,1% | 81,5% |
| Velocidad a 4K (RTX 5090) | +6% | referencia |
| Velocidad a 16K (RTX 5090) | +3% | referencia |

Velocidad reportada en el teaser: 69,1 tok/s en una RTX 5090 con el nivel de RAM limitado a 60 GB. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 32 GB de VRAM para la GPU más 96 GB de RAM del sistema; el archivo completo ocupa 96,8 GB en disco.
- GPU recomendadas: RTX 5090 (32 GB) o AI PRO R9700 (32 GB) según la model card; DGX Spark (128 GB) para la variante específica.
- Cabe en GPU de consumo: sí, en RTX 5090 de 32 GB con offload a RAM; no cabe en GPUs de 24 GB o menos con esta variante (existen versiones IQ1_S para 16 GB + 64 GB RAM e IQ2_XXS para 32 GB + 64 GB RAM).
- Opciones de despliegue: Abyss v1.3.120 o superior (recomendado por el autor, con `setup-deepseek.sh --quant 32G96G --no-dspark --download-model`), llama.cpp (arquitectura `deepseek4`, upstream `ac8e1694d` del 2026-10-29) con `llama-server -m ... -c 32768 -b 4096 -ub 4096`.
- Latencia y throughput: 69,1 tok/s en RTX 5090 con RAM limitada a 60 GB; +6% a 4K y +3% a 16K frente a UD-Q2_K_XL.
- Nota: el autor recomienda no usar el drafter DSpark en una GPU de 32 GB, ya que consume unos 6,5 GB de VRAM y reduce los expertos que caben en GPU, aumentando la lectura desde SSD; en DGX Spark sí ayuda.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---:|---|---|---|
| DeepSeek-V4-Flash-0731 L97 (este repo) | 284,3B (MoE) | no disponible (probado 32K) | MIT | GGUF 96,8 GB | KL 0,150; 84,1% top-1 |
| Unsloth UD-Q2_K_XL | 284,3B (MoE) | no disponible | MIT | GGUF 96,8 GB | KL 0,186; 81,5% top-1 |
| zephel01 IQ2_XXS-32G64G | 284,3B (MoE) | no disponible | MIT | GGUF 72,0 GB | Para 32 GB GPU + 64 GB RAM |
| zephel01 IQ1_S-16G64G | 284,3B (MoE) | no disponible | MIT | GGUF 61,7 GB | Para 16 GB GPU + 64 GB RAM |

No se dispone de datos de benchmarks estándar ni de modelos comparables de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Estado BETA: medido en un solo PC (RTX 5090 32 GB, RAM limitada a 60 GB bajo un límite de 84 GB); el autor advierte que el archivo puede ser reemplazado por una build mejor tras más mediciones.
- Cuantización extrema: 2,64 bits por peso de media; aunque la KL es baja (0,150), hay pérdida de fidelidad frente al original (84,1% de coincidencia top-1 implica un 15,9% de discrepancia).
- Idiomas limitados: solo inglés y japonés según las etiquetas; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Riesgo de alucinación: no cuantificado en la información disponible; inherente a modelos de lenguaje de gran escala.
- Sesgos: no documentados en la información proporcionada.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo cuantizado.
- Metadatos inconsistentes: el primer shard es el archivo de Unsloth tal cual, por lo que su campo `general.quantized_by` sigue indicando Unsloth.
- Requiere hardware específico: sin 32 GB de VRAM y 96 GB de RAM, el rendimiento caerá significativamente por lectura desde SSD; el drafter DSpark no se recomienda en 32 GB.
- No se dispone de información sobre la longitud de contexto oficial del modelo base ni sobre parámetros activos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Versión 32G64G (IQ2_XXS): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Versión 16G64G (IQ1_S): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Versión DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Reporte de resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G96G+L97+on+YOUR_GPU
