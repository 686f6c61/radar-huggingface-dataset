# thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16

## Resumen

Qwen3.6-35B-A3B-Vision-CoreML-fp16 es un artefacto derivado del modelo multimodal Qwen/Qwen3.6-35B-A3B, publicado por el usuario thinkspread. No se trata del modelo completo, sino exclusivamente del codificador visual (vision tower) del modelo base, recompilado a formato Core ML en precisión fp16 para su ejecución sobre Apple Silicon (GPU o Neural Engine). El modelo de lenguaje asociado no se incluye en este repositorio: se distribuye por separado como GGUF cuantizado (thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF) y se ejecuta con el runtime tempo9.

El problema que resuelve es concreto: permitir que un LLM multimodal cuantizado en GGUF responda preguntas sobre imágenes en un Mac sin depender de un fichero mmproj para la torre visual. En su lugar, tempo9 carga este codificador a través de Core ML y delega la inferencia visual en la GPU o en la Neural Engine, liberando recursos para el modelo de lenguaje. El repositorio ocupa 0,9 GB, lo que corresponde únicamente a los pesos del codificador y sus tablas auxiliares.

La relevancia es de nicho pero clara para el ecosistema Apple: el par formado por este codificador y el GGUF del modelo base cabe en un Mac de 24 GB con la configuración por defecto, según indica el autor. La licencia Apache 2.0 se hereda del modelo base. No se dispone de información sobre arquitectura del LLM, número de parámetros activos, contexto o datos de entrenamiento más allá de lo que el nombre del modelo base sugiere (35B totales, MoE con aproximadamente 3B activos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual transformer (ViT) exportado a Core ML; el LLM del modelo base es un MoE según los tags del repositorio |
| Parametros totales | No disponible para este artefacto (solo se incluye la torre visual, 333 tensores); el modelo base se denomina 35B-A3B |
| Parametros activos | No disponible (el modelo base es MoE, pero no se detalla el número exacto de parámetros activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | fp16 para el codificador visual; el LLM asociado se distribuye como GGUF Q5K/IQ3XXS en otro repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Core ML (.mlmodelc), tablas en .f32 y .npz; el LLM asociado en GGUF |

## Arquitectura y entrenamiento

Este repositorio contiene exclusivamente el codificador visual del modelo Qwen3.6-35B-A3B, no el modelo completo. Se exportaron los 333 tensores `model.visual.*` desde los dos shards safetensors del modelo base que los contienen, y se compilaron con coremltools 9 en dos buckets de tamaño fijo: `qwen35_vit_b1024.mlmodelc` (hasta 1024 parches, aproximadamente 512×512 px) y `qwen35_vit_b4096.mlmodelc` (hasta 4096 parches, aproximadamente 1024×1024 px). Ambos comparten pesos y solo difieren en el tamaño de entrada; las imágenes pequeñas se procesan con el modelo menor.

Según la model card, Qwen3.6 conserva la arquitectura visual de Qwen3.5-35B-A3B pero reentrenó los pesos: los 333 tensores difieren en un 3,2 % (L2 relativo) respecto a la versión anterior. El proceso de exportación aplica tres comprobaciones: las tablas de posición del host frente a transformers, el wrapper frente al modelo visual de Hugging Face en fp32, y la salida de Core ML frente a esa referencia fp32. No se proporciona información sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

## Capacidades

- Extracción de características visuales: es la función declarada del repositorio (`image-feature-extraction`), orientada a alimentar un LLM multimodal.
- Respuesta a preguntas sobre imágenes cuando se combina con el GGUF del LLM y el runtime tempo9 (por ejemplo, transcripción de texto en carteles, identificación de formas y colores).
- Procesamiento de una imagen por petición, enviada como URI `data:` a un endpoint compatible con OpenAI (`/v1/chat/completions`).
- Coste de tokens aproximado: un token de prompt por cada 32×32 píxeles, más dos. Las imágenes mayores de aproximadamente un megapíxel (4096 parches de 16×16) se reescalan manteniendo la relación de aspecto.
- Ejecución en GPU o Neural Engine de Apple Silicon mediante Core ML.
- No se documentan en este repositorio capacidades de tool calling, agentes, razonamiento multi-paso ni multilingüismo; corresponden al LLM del modelo base, no a este artefacto.

## Casos de uso

- Asistente visual local en Mac: combinar este codificador con el GGUF Qwen3.6-35B-A3B y tempo9 para responder preguntas sobre capturas de pantalla, fotos o documentos escaneados sin salir del equipo. El par cabe en 24 GB de memoria unificada según el autor.
- Transcripción de texto en imágenes (OCR ligero): el ejemplo verificado en la model card transcribe con exactitud tres líneas de un cartel ("OPEN 9-5", "Closed Mondays", "Tel 0571-8823-4410"), útil para digitalizar rótulos o notas fotografiadas.
- Descripción de escenas para accesibilidad: identificar formas y colores en imágenes y generar descripciones en lenguaje natural mediante el LLM asociado.
- Clasificación y etiquetado de imágenes en pipelines locales: usar la extracción de características del codificador como paso previo a tareas de búsqueda o agrupación semántica.
- Integración en aplicaciones macOS nativas: al estar compilado como Core ML, puede embeberse en apps Swift/Objective-C que aprovechen la Neural Engine y dejen la GPU libre para el modelo de lenguaje.
- Prototipado con clientes OpenAI estándar: el servidor tempo9 expone `/v1/chat/completions`, de modo que cualquier cliente compatible puede enviar imágenes como URI `data:` sin adaptadores específicos.
- Evaluación de modelos multimodales en hardware de consumo: permite comparar el comportamiento del codificador frente al fichero mmproj tradicional en un mismo Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo reporta una métrica de fidelidad de exportación: similitud coseno ponderada por norma de la salida Core ML fp16 frente al codificador visual de Hugging Face en fp32, en el peor caso sobre las imágenes de referencia del exportador.

| Nivel de cómputo | Similitud coseno |
|---|---|
| GPU | 0,99996 |
| Neural Engine | 0,99826 |

El servidor tempo9 ejecuta el codificador en el nivel GPU de Core ML; la fila de Neural Engine aplica a aplicaciones que lo muevan allí para dejar la GPU libre para el LLM.

## Requisitos de hardware

- Sistema operativo: macOS 26 o posterior sobre Apple Silicon (requisito explícito de la model card).
- Memoria: el codificador (0,9 GB) junto con el GGUF Q5K/IQ3XXS del LLM cabe en un Mac de 24 GB con la configuración por defecto, según el autor. Verificado en un Apple M5 Pro de 24 GB con tempo9 1.2.1.
- GPU: no aplica el catálogo NVIDIA (A100, H100, RTX 4090); el artefacto es exclusivo de Apple Silicon y usa la GPU integrada o la Neural Engine.
- Despliegue: runtime tempo9 (servidor compatible con la API de OpenAI en el puerto 11435 por defecto). No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que el formato es Core ML y no GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16 | Codificador visual Core ML fp16 | No disponible (333 tensores) | No disponible | Apache 2.0 | Hugging Face, 0 descargas |
| thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16 | Codificador visual Core ML fp16 (generación anterior) | No disponible | No disponible | Apache 2.0 (presumible, no confirmado) | Hugging Face; según el autor, también carga con Qwen3.6 y responde de forma similar |
| Qwen/Qwen3.6-35B-A3B | Modelo multimodal completo (LLM MoE + visión) | 35B totales (activos no disponibles) | No disponible | Apache 2.0 | Hugging Face (modelo base) |
| thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF | LLM cuantizado para tempo9 | 35B (activos no disponibles) | No disponible | Apache 2.0 (heredada) | Hugging Face; complemento necesario para usar este codificador |

No se dispone de datos de rendimiento comparativo entre estas variantes más allá de la observación cualitativa del autor sobre Qwen3.5.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el GGUF del LLM y el runtime tempo9 no produce respuestas en lenguaje natural; solo extrae características visuales.
- Una imagen por petición, siempre como URI `data:`; no se documenta soporte de múltiples imágenes ni de URLs remotas.
- Resolución limitada: imágenes por encima de aproximadamente un megapíxel se reescalan, con posible pérdida de detalle en texto pequeño.
- Precisión de lectura de texto imperfecta: en la propia verificación del autor, "PIER 37" se leyó como "FIRST" en una de las dos imágenes de prueba.
- Dependencia de plataforma: exclusivo de Apple Silicon con macOS 26 o posterior; no ejecutable en Linux, Windows ni GPUs NVIDIA.
- Fidelidad fp16: la similitud coseno de 0,99826 en Neural Engine implica una desviación pequeña pero no nula respecto al codificador fp32 de referencia.
- Sesgos y alucinaciones: no documentados para este artefacto; los del modelo base no se detallan en la información disponible.
- Idiomas: no disponibles; la model card no especifica cobertura lingüística.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del GGUF asociado antes de desplegar en producción.
- Madurez: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día (2 de noviembre de 2026); no hay evidencia de uso en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3.6-35B-A3B-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- GGUF asociado: https://huggingface.co/thinkspread/Qwen3.6-35B-A3B-Q5K-IQ3XXS-GGUF
- Codificador de la generación anterior: https://huggingface.co/thinkspread/Qwen3.5-35B-A3B-Vision-CoreML-fp16
- Runtime tempo9: https://github.com/thinkspread/tempo9
