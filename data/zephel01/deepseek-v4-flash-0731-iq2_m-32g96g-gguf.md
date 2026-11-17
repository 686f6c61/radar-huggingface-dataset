# zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF

## Resumen

DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF es una cuantización GGUF del modelo base `deepseek-ai/DeepSeek-V4-Flash-0731`, publicada por el usuario zephel01 bajo licencia MIT. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 284.334.567.511 parámetros totales, orientado a generación de texto conversacional. Esta versión concreta está diseñada para ejecutarse en un PC con una GPU de 32 GB de VRAM (RTX 5090, AI PRO R9700) y 96 GB de RAM, manteniendo los 256 expertos enrutados sin poda.

La aportación principal de esta ficha no es el modelo original, sino el proceso de cuantización mixta: los expertos enrutados se recuantizaron con LDLQ a partir de la versión UD-Q8_K_XL de unsloth (cuyos expertos son los pesos MXFP4 originales), usando matrices de Hessian derivadas de respuestas del propio modelo y una imatrix propia de aproximadamente 1 millón de tokens. El resultado es un archivo de 96,8 GB con 2,64 bits por peso de media, que según el autor queda más cerca del original que la referencia UD-Q2_K_XL (KL 0,150 frente a 0,186; en japonés 0,145 frente a 0,219).

Es relevante ahora porque demuestra que un MoE de ~284B parámetros puede ejecutarse en hardware de consumo (una sola GPU de 32 GB más RAM del sistema) con una pérdida de calidad medida y acotada, y porque incluye un motor propio (Abyss) con decodificación especulativa opcional (DSpark) y soporte de offload a CPU/SSD. La versión está marcada como BETA por el propio autor: las mediciones provienen de un único equipo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos); 256 expertos enrutados por capa |
| Parámetros totales | 284.334.567.511 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han validado pruebas de aguja en contexto de 8K-31K) |
| Tipos de cuantización | Mixta: IQ2_XS (41 % de los bytes), IQ3_XXS (39 %), IQ2_S (18 %), MXFP4 (2 %); media de 2,64 bits por peso |
| Idiomas soportados | Inglés y japonés (según los tags y los conjuntos de evaluación del autor) |
| Licencia | MIT |
| Formato de pesos | GGUF (3 shards, 96,8 GB, layout de unsloth) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura de mezcla de expertos: 256 expertos enrutados en cada capa, con tensores densos adicionales (atención, router, embeddings, capa de salida y tablas hash). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo original.

La innovación técnica de esta ficha reside en el pipeline de cuantización. Los expertos enrutados se recuantizaron mediante LDLQ (una variante de cuantización post-entrenamiento con corrección por bloques) partiendo de los pesos MXFP4 originales presentes en UD-Q8_K_XL de unsloth. Las matrices de Hessian se calcularon con 241 prompts de chat generados por el propio V4 (104 de ellos en japonés, con la plantilla del modelo) más texto general, y se construyó una imatrix propia de aproximadamente 1 millón de tokens (unsloth no publicó imatrix para V4). Los tensores de atención `attn_q_b`, `attn_output_a` y `attn_output_b` se mantienen en Q5_K; el resto de tensores densos conservan los bytes de UD-Q2_K_XL. El primer shard es el archivo de metadatos de unsloth sin modificar (5 MB), por lo que su campo `general.quantized_by` sigue indicando Unsloth.

## Capacidades

- Generación de texto conversacional multi-turno (el autor valida conversaciones de 11 turnos).
- Razonamiento y respuesta a preguntas factuales (las pruebas del autor reportan 0 hechos erróneos en 10 respuestas en japonés).
- Generación de código: 4 de 5 tareas de programación con tests superadas en la configuración de referencia.
- Tool calling / function calling (validado en la batería `--check` del motor Abyss).
- Recuperación en contexto largo: pruebas de aguja en ventanas de 8K a 31K tokens.
- Capacidades multilingües limitadas a inglés y japonés según la información disponible.
- Compatibilidad con endpoints estilo OpenAI (`/v1/chat/completions`) a través del motor Abyss.
- Decodificación especulativa opcional mediante el drafter DSpark (aproximadamente 6,5 GB de VRAM adicionales).

## Casos de uso

- Asistente conversacional local multi-turno: el modelo mantiene contexto en conversaciones de al menos 11 turnos y responde vía API compatible con OpenAI, adecuado para prototipos de atención al cliente sin dependencia de la nube.
- Generación de código en local para desarrolladores con una RTX 5090: 4 de 5 tareas con tests superadas en la configuración de referencia, suficiente para autocompletado y generación de funciones con validación posterior.
- Agentes con tool calling: la validación `--check` incluye una llamada a herramienta correcta, lo que permite integrarlo en flujos de agentes que invocan APIs externas.
- Procesamiento de documentos largos en japonés e inglés: las pruebas de aguja en 8K-31K tokens lo habilitan para resumen y extracción sobre contratos o informes extensos.
- Inferencia con offload a CPU/SSD: el diseño 32G96G permite ejecutar un MoE de 284B parámetros en un PC de sobremesa, útil para investigación y evaluación de modelos grandes sin clúster.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de LDLQ e imatrix frente a cuantizaciones estándar (KL 0,150 frente a 0,186 de UD-Q2_K_XL).
- Despliegue en DGX Spark: existe una variante con los mismos archivos para el equipo de 128 GB, donde el drafter DSpark sí aporta mejora según el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los datos aportados por el autor son métricas de fidelidad de cuantización y de uso real:

| Métrica | L97 (este repo) | UD-Q2_K_XL (referencia) |
|---|---|---|
| Descarga | 96,8 GB | 96,8 GB |
| KL (12 secuencias) | 0,150 | 0,186 |
| KL en japonés (3 secuencias) | 0,145 | 0,219 |
| Mismo token top-1 | 84,1 % | 81,5 % |
| `--check` Abyss (11 pruebas) | 10 / 11 | 11 / 11 |
| Respuestas en japonés que se mantienen en japonés | 7 / 10 | 7 / 10 |
| Hechos erróneos en esas respuestas | 0 | 0 |
| Tareas de código con tests | 4 / 5 | 5 / 5 |

Rendimiento medido: 69,1 tok/s en una RTX 5090 con el nivel de RAM limitado a 60 GB (bajo un límite de 84 GB). La comparación de velocidad indica +6 % a 4K de contexto y +3 % a 16K frente a UD-Q2_K_XL.

## Requisitos de hardware

- VRAM: 32 GB para la GPU (RTX 5090, AI PRO R9700); el resto del modelo se reparte entre RAM y SSD.
- RAM del sistema: 96 GB (el autor midió con el nivel de RAM limitado a 60 GB).
- Almacenamiento: 96,8 GB para los 3 shards del GGUF.
- GPU recomendadas: RTX 5090 de 32 GB o AI PRO R9700; DGX Spark (128 GB) para la variante específica.
- No cabe en GPUs de consumo de 24 GB o menos con esta configuración; existen variantes más pequeñas: IQ1_S-16G64G (61,7 GB, para 16 GB de VRAM y 64 GB de RAM) e IQ2_XXS-32G64G (72,0 GB, para 32 GB de VRAM y 64 GB de RAM).
- Despliegue: motor Abyss v1.3.120 o superior (recomendado por el autor, con script `setup-deepseek.sh`). llama.cpp no está verificado todavía según la model card, aunque los tipos de tensor son ggml estándar en el layout de unsloth.
- Throughput medido: 69,1 tok/s en RTX 5090 con RAM limitada a 60 GB. El drafter DSpark consume unos 6,5 GB de VRAM y el autor recomienda no usarlo en GPU de 32 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / tamaño | Licencia | Notas |
|---|---|---|---|---|---|
| Este repo (L97) | 284,3B totales (MoE) | no disponible | GGUF, 96,8 GB | MIT | KL 0,150; 69,1 tok/s en RTX 5090 |
| unsloth UD-Q2_K_XL | 284,3B totales (MoE) | no disponible | GGUF, 96,8 GB | MIT | KL 0,186; referencia de calidad inferior según el autor |
| IQ2_XXS-32G64G (mismo autor) | 284,3B totales (MoE) | no disponible | GGUF, 72,0 GB | MIT | Requiere 64 GB de RAM; menor calidad esperada |
| IQ1_S-16G64G (mismo autor) | 284,3B totales (MoE) | no disponible | GGUF, 61,7 GB | MIT | La variante más pequeña; para 16 GB de VRAM |

## Limitaciones y advertencias

- Estado BETA: las mediciones provienen de un único equipo (RTX 5090 de 32 GB con RAM limitada a 60 GB); el autor advierte que el archivo puede sustituirse por una compilación mejor tras más mediciones.
- Rendimiento dependiente del hardware: la configuración 32G96G es un objetivo de despliegue, no una garantía de velocidad; el offload a SSD penaliza la latencia si no caben suficientes expertos en VRAM.
- Pérdida de calidad medible frente al original: KL de 0,150 y 84,1 % de coincidencia en el token top-1; en pruebas reales pierde 1 de 11 pruebas `--check` y 1 de 5 tareas de código frente a UD-Q2_K_XL.
- Idiomas limitados: solo inglés y japonés según los tags; no hay datos de rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad a gran escala; el autor solo reporta 0 hechos erróneos en 10 respuestas concretas.
- Sesgos: no disponibles en la información proporcionada.
- Licencia MIT: permite uso comercial, pero el modelo base y los pesos derivados deben conservar el aviso de copyright; el primer shard conserva metadatos de Unsloth (`general.quantized_by`).
- Compatibilidad: llama.cpp no está verificado; el motor recomendado es Abyss, lo que limita la portabilidad a otros stacks de inferencia.
- Longitud de contexto oficial no disponible; las pruebas de aguja llegan a 31K tokens, pero no se especifica el máximo soportado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_M-32G96G-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-0731
- Motor Abyss: https://github.com/zephel01/Abyss
- Variante 32G64G (IQ2_XXS): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ2_XXS-32G64G-GGUF
- Variante 16G64G (IQ1_S): https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-IQ1_S-16G64G-GGUF
- Variante DGX Spark: https://huggingface.co/zephel01/DeepSeek-V4-Flash-0731-DGX-Spark-GGUF
- Formulario para reportar resultados: https://github.com/zephel01/Abyss/issues/new?template=bench.md&title=Bench:+DeepSeek-V4-Flash-0731+32G96G+L97+on+YOUR_GPU
