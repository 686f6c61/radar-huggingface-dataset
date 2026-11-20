# Srihari2020/CueCraft-9B-GGUF

## Resumen

CueCraft-9B-GGUF es un modelo de lenguaje especializado en ingeniería de prompts, desarrollado por el usuario Srihari2020 y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo base `empero-ai/Qwythos-9B-Claude-Mythos-5-1M`, un transformer denso de aproximadamente 8.950 millones de parámetros, entrenado mediante QLoRA de 4 bits con la librería Unsloth sobre un conjunto de 520 ejemplos sintéticos validados. El modelo se distribuye en formato GGUF cuantizado Q4_K_M, lo que permite su ejecución local en GPUs de consumo con 8 GB de VRAM.

El problema que aborda es la generación estructurada de prompts multimodales: el modelo acepta una instrucción etiquetada con un modo (`[TEXT]`, `[IMAGE]`, `[VIDEO]` o `[MOVIE]`) y produce un prompt de producción adaptado a ese modo, evitando la contaminación cruzada entre modalidades (por ejemplo, términos de vídeo en un prompt de imagen estática). Según la model card, el ajuste eleva la precisión de adherencia al modo del 0,0 % en el modelo base al 75,0 % en el modelo ajustado, sobre un conjunto de evaluación de 8 prompts.

El modelo es relevante para desarrolladores que necesitan generar prompts de calidad para SDXL, Flux o modelos de vídeo generativo sin depender de APIs externas, ya que cabe en hardware de consumo y se integra con Ollama. Su licencia Apache 2.0 facilita el uso comercial, aunque el volumen de entrenamiento (520 ejemplos) y el origen sintético de los datos condicionan su robustez.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5, según tags) |
| Parámetros totales | 8.953.803.264 (~8,95 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M (GGUF); el repo incluye safetensors y GGUF |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF y safetensors |

## Arquitectura y entrenamiento

El modelo parte de `empero-ai/Qwythos-9B-Claude-Mythos-5-1M`, un transformer denso de unos 8,95 mil millones de parámetros. El ajuste se realizó con QLoRA de 4 bits mediante Unsloth, con rango LoRA `r=16`, `lora_alpha=16`, optimizador `adamw_8bit` y planificación de tasa de aprendizaje coseno, durante 3 épocas. El conjunto de entrenamiento consta de 520 ejemplos sintéticos validados, distribuidos en 180 de modo `[TEXT]`, 140 de `[IMAGE]`, 120 de `[VIDEO]` y 80 de `[MOVIE]`.

La innovación principal no reside en la arquitectura, sino en la especialización por modo: el modelo aprende a respetar etiquetas de modalidad y a generar estructuras de prompt distintas para cada una (Master Prompts con Persona/Contexto/Objetivo/Tono/Restricciones/Estructura de salida para texto; prompts ópticos con positivos y negativos para imagen; prompts de toma única de 5 s con trayectorias de cámara para vídeo; storyboards multi-toma con biblias de personaje y estilo para cine). No se documentan técnicas como decodificación especulativa, atención lineal ni RLHF/DPO; el ajuste es supervisado sobre datos sintéticos.

## Capacidades

- Generación de prompts de texto estructurados y system prompts de grado de producción con secciones de persona, contexto, objetivo, tono, restricciones y estructura de salida.
- Generación de prompts de imagen para SDXL y Flux, con vocabulario óptico concreto (iluminación, textura, fotografía) y prompts negativos, sin filtración de términos de vídeo.
- Generación de prompts de vídeo de toma única de 5 segundos con movimiento continuo, trayectorias de cámara, física y señales de audio.
- Generación de storyboards cinematográficos multi-toma con biblias de personaje y estilo bloqueadas y audio sincronizado.
- Adherencia estricta a modos mediante etiquetas `[TEXT]`, `[IMAGE]`, `[VIDEO]` y `[MOVIE]`.
- Soporte de conversación (tag `conversational` en Hugging Face).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de prompts para pipelines de imagen generativa: el modelo recibe una descripción breve etiquetada como `[IMAGE]` y devuelve un prompt positivo y otro negativo listos para SDXL o Flux, lo que reduce la iteración manual en equipos de diseño.
- Producción de vídeo generativo: con la etiqueta `[VIDEO]`, genera prompts de toma única de 5 segundos con trayectoria de cámara y señales de audio, adecuados para herramientas de texto-a-vídeo que requieren especificidad física y temporal.
- Preproducción cinematográfica: el modo `[MOVIE]` produce storyboards multi-toma con biblias de personaje y estilo coherentes, útil para equipos que prototipan secuencias antes de rodar o animar.
- Creación de system prompts para asistentes: el modo `[TEXT]` genera system prompts estructurados con persona, restricciones y formato de salida, aplicables a despliegues de chatbots y agentes.
- Herramienta local para equipos sin acceso a APIs: al ejecutarse en Ollama sobre una GPU de 8 GB, permite generar prompts en estaciones de trabajo sin conexión ni coste por token.
- Integración en herramientas de autoría de prompts: el modelo puede incrustarse en un editor o plugin que ofrezca al usuario un botón de "mejorar prompt" con selección de modalidad, gracias a su formato GGUF y su compatibilidad con Ollama.
- Evaluación y formación interna: sirve como referencia para comparar la calidad de prompts generados por humanos frente a los generados por el modelo en cada modalidad.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card, evaluados en una RTX 5060 de 8 GB con Ollama y cuantización Q4_K_M, sobre un conjunto de 8 prompts multimodales que miden adherencia estricta al modo, ausencia de contaminación cruzada y velocidad de generación:

| Modelo | Precisión de modo | Velocidad (tok/s) | Latencia media |
|---|---|---|---|
| Qwythos-9B (base Q4_K_M) | 0,0 % | 43,2 tok/s | 10,4 s |
| CueCraft-9B (ajustado Q4_K_M) | 75,0 % | 41,4 tok/s | 8,0 s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,6 GB para el archivo Q4_K_M GGUF, más overhead de contexto; el autor indica que funciona de forma nativa en GPUs de 8 GB de VRAM.
- GPU recomendadas: RTX 5060 de 8 GB (verificada por el autor); cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) debería poder ejecutarlo en Q4_K_M.
- Cabe en GPU de consumo: sí, en modelos con 8 GB de VRAM o superior en cuantización Q4_K_M.
- Opciones de despliegue: Ollama (con el `Modelfile` incluido), llama.cpp por ser formato GGUF, y cualquier runtime compatible con GGUF; el autor menciona además una interfaz web local en Streamlit en el repositorio de GitHub.
- Latencia y throughput estimados: 41,4 tok/s y 8,0 s de latencia media en una RTX 5060 de 8 GB con Ollama Q4_K_M, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| CueCraft-9B-GGUF | ~8,95 B | no disponible | Ingeniería de prompts multimodal | Apache 2.0 | GGUF, safetensors |
| Qwythos-9B (base) | ~8,95 B | no disponible | Modelo generalista | no disponible | safetensors |
| Modelos de prompt engineering de propósito general | no disponible | no disponible | Generación de prompts sin especialización por modo | variable | variable |

No se dispone de información sobre alternativas comparables de la misma categoría (modelos específicamente ajustados para ingeniería de prompts multimodales); la comparación más directa disponible es con su propio modelo base, cuyo rendimiento en adherencia de modo es del 0,0 % frente al 75,0 % del ajuste.

## Limitaciones y advertencias

- El conjunto de entrenamiento es reducido (520 ejemplos sintéticos), lo que limita la diversidad y puede provocar sobreajuste a los estilos y vocabulario presentes en esos ejemplos.
- Los benchmarks publicados se basan en solo 8 prompts, una muestra demasiado pequeña para extraer conclusiones robustas sobre el rendimiento general.
- Riesgo de alucinación: no evaluado en la información disponible; al ser un ajuste sobre un modelo base de 9 B, mantiene los riesgos típicos de generación de contenido plausible pero incorrecto.
- Sesgos conocidos: no documentados en la model card; al entrenarse con datos sintéticos, los sesgos dependerán del generador de esos datos y del modelo base, sin auditoría publicada.
- Idiomas soportados: no especificados; el entrenamiento parece orientado al inglés, por lo que el rendimiento en castellano no está garantizado.
- Longitud de contexto: no documentada; el modelo base se asocia al tag `qwen3.5` y al identificador `1M`, pero no se confirma en la información disponible.
- Contaminación cruzada entre modos: aunque el ajuste la reduce, la precisión de modo es del 75 %, por lo que un 25 % de los casos puede no respetar la modalidad solicitada.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base `empero-ai/Qwythos-9B-Claude-Mythos-5-1M` tiene licencia no disponible en esta información; conviene verificar sus términos antes de un despliegue comercial.
- El nombre del modelo base incluye referencias a "Claude-Mythos", lo que puede sugerir una destilación de un modelo propietario; no hay confirmación en la información disponible y conviene revisar las implicaciones legales.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Srihari2020/CueCraft-9B-GGUF
- Modelo base: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- Repositorio de código, pipeline de entrenamiento, generador de dataset, suite de benchmarks e interfaz Streamlit: https://github.com/srihari2020/CueCraft
