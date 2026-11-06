# wonchandev/Soonlife-Qwen3.5-9B-v2b

## Resumen

Soonlife-Qwen3.5-9B-v2b es un ajuste fino por destilación del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario wonchandev. Se trata de un modelo multimodal de tipo image-text-to-text (arquitectura `Qwen3_5ForConditionalGeneration`, que incluye torre de visión) especializado en un caso de uso muy concreto: un chatbot RAG sobre las normativas y avisos de la Universidad de Soonchunhyang (Corea del Sur), bajo el nombre de producto "Soonlife". El modelo resuelve el problema de adaptar un modelo generalista de 9.400 millones de parámetros a un dominio institucional con formato de sistema y herramientas (tool calling) muy específicos, mediante destilación desde un modelo profesor de mayor tamaño.

La versión v2b es una variante experimental: reduce el entrenamiento de 1,5 a 1,0 épocas respecto a la v2, porque en la segunda época la pérdida de validación sobre los registros de agente (traces) empezaba a subir. El modelo se distribuye como un merge bf16 de un adaptador LoRA (r=32) sobre el modelo base, y está pensado como origen para otras cuantizaciones (GGUF, AWQ) y para servir como base de reentrenamiento; para producción el autor recomienda su variante FP8.

Es relevante ahora porque ilustra un patrón de trabajo muy habitual en la comunidad: destilación de un profesor grande (Qwen3.8-27B) sobre un alumno de 9B con datos sintéticos generados con el mismo prompt RAG y las mismas herramientas, con un cuidado explícito por alinear el formato de entrenamiento con el formato de inferencia en producción. La licencia Apache 2.0 facilita su reutilización, aunque el alcance real del modelo está deliberadamente acotado a un dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal `Qwen3_5ForConditionalGeneration` (torre de visión + language model con full attention, MLP y Gated DeltaNet) |
| Parámetros totales | 9.409.813.744 (9,41 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 32.768 tokens (límite de entrenamiento; los ejemplos de más de 32K se descartaron) |
| Tipos de cuantización | bf16 (este repo); FP8 dynamic (repo v2b-FP8); GGUF y AWQ mencionados como destino previsto, no publicados |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 18,8 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer multimodal con torre de visión y un language model que combina atención completa con capas Gated DeltaNet (proyecciones `in_proj_qkv`, `in_proj_z`, `out_proj`). Sobre él se aplicó un LoRA de rango 32 y alpha 32, dropout 0,0, con adaptadores en `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj`, `down_proj`, `in_proj_qkv`, `in_proj_z` y `out_proj` del language model; la torre de visión y los pesos de MTP (decodificación especulativa) quedaron congelados en su estado original. El entrenamiento se hizo en bf16 con Unsloth, 1 época, learning rate 1e-4 con schedule cosine, batch efectivo de 16 y longitud máxima de 32.768 tokens, con un coste de 2,8 horas en 2× H100.

El método es destilación por SFT: un profesor Qwen3.8-27B generó respuestas y registros de agente usando exactamente los mismos prompts RAG y herramientas que se emplean en producción, y el alumno de 9B aprendió a imitarlos. El conjunto de datos combina tres bloques: 3.000 respuestas en formato RAG (24,6 M tokens, pérdida sobre la respuesta final), 1.728 muestras de trazas de pensamiento de primera ronda con `think` incluido (23,8 M tokens, pérdida sobre el pensamiento y la llamada a herramienta) y 1.604 muestras de traza completa sin pensamiento (33,0 M tokens, pérdida sobre el resto de llamadas y la respuesta final). En total, 6.332 líneas y 81,4 M tokens, de los que solo 2,99 M llevan pérdida. Un detalle técnico destacable es que el autor dividió cada registro de agente en dos muestras para que la entrada de entrenamiento coincida con la de producción: en operación solo se reenvía la primera ronda sin el pensamiento previo. Además se reforzaron con ×4 los 148 registros de recuperación (búsqueda reformulada) y de cierre temprano, y los 21 registros con imágenes se convirtieron a texto con el marcador `[그림]`. La pérdida media de entrenamiento fue 0,2448; la de validación final, 0,2739 en respuestas y 0,2608 en trazas.

## Capacidades

- Generación de texto conversacional en coreano, orientada a un asistente institucional.
- Respuesta aumentada por recuperación (RAG): el modelo está entrenado para operar con un formato de prompt RAG y herramientas de búsqueda concretas.
- Tool calling / function calling dentro del esquema específico del sistema Soonlife.
- Razonamiento multi-paso con trazas de agente: primera ronda con bloque de pensamiento (`think`), llamadas a herramientas y rondas posteriores sin pensamiento.
- Entrada de imagen: pipeline image-text-to-text con torre de visión heredada del modelo base (aunque el entrenamiento sustituyó las imágenes por el marcador textual `[그림]`).
- Capacidades multilingües: limitadas al coreano según la model card; no se declaran otros idiomas.
- Decodificación especulativa (MTP) disponible por herencia del modelo base, aunque con posible tasa de aceptación ligeramente inferior.

## Casos de uso

- Chatbot de atención al estudiante en una universidad: el modelo gestiona consultas sobre avisos y reglamentos combinando recuperación documental (RAG) y respuestas en coreano con el formato institucional exacto para el que fue entrenado.
- Asistente de normativa académica interna: responde preguntas sobre reglamentos con llamadas a herramientas de búsqueda, lo que permite citar fuentes recuperadas en lugar de responder de memoria.
- Base para cuantización y despliegue ligero: al ser el merge bf16 de referencia, sirve como origen para generar GGUF o AWQ y desplegar en infraestructura con menos VRAM que la variante FP8.
- Punto de partida para reentrenamiento en dominios similares: el adaptador LoRA y el pipeline de destilación (profesor grande, alumno de 9B, prompts idénticos a producción) son reutilizables para otros dominios institucionales con el mismo esquema de herramientas.
- Investigación sobre destilación de agentes: el modelo documenta pérdidas de validación separadas para respuestas y trazas, útil para estudiar cómo se degrada la verificación de registros de agente al aumentar las épocas.
- Prototipado de asistentes con tool calling en coreano: permite validar flujos multi-ronda con llamadas a herramientas antes de pasar a la variante FP8 de producción.
- Evaluación comparativa de formatos de entrenamiento: la división de trazas en dos muestras (con y sin pensamiento) permite medir el impacto de alinear el formato de entrenamiento con el de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la evaluación sobre el split de test está pendiente. Los únicos datos numéricos disponibles son las pérdidas de entrenamiento y validación:

| Métrica | v2b | v1 (FP8) | v2 |
|---|---|---|---|
| Pérdida de entrenamiento (media) | 0,2448 | no disponible | no disponible |
| Pérdida de validación, respuestas | 0,2739 | 0,2744 | 0,2684 |
| Pérdida de validación, trazas | 0,2608 | 0,2583 | 0,2709 |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 18,8 GB solo de pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 24 GB para contexto corto y bastante más para contextos cercanos a 32K.
- VRAM estimada en FP8 (repo v2b-FP8): alrededor de 9-10 GB de pesos, apto para GPU de 16-24 GB según longitud de contexto.
- GPU recomendadas: H100 (el autor entrenó en 2× H100), A100 40/80 GB para bf16 con contexto largo; RTX 4090 (24 GB) puede ejecutar bf16 con contexto moderado o FP8 con contexto amplio.
- GPU de consumo: sí cabe en RTX 4090 y, en FP8 o cuantizaciones de 8 bits, potencialmente en GPUs de 16 GB; en bf16 una RTX 3090 de 24 GB queda muy justa para contextos largos.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` y `AutoProcessor` (ejemplo oficial de la model card); el autor recomienda la variante FP8 para servir. vLLM, TGI o llama.cpp no se mencionan en la información disponible, aunque el repo está etiquetado como `endpoints_compatible`.
- Latencia y throughput: no disponibles. El único dato de rendimiento es el tiempo de entrenamiento (2,8 h en 2× H100 para 1 época).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Soonlife-Qwen3.5-9B-v2b | 9,41 B | 32.768 | ko | Apache 2.0 | Ajuste de dominio con destilación; sin benchmarks publicados |
| Qwen/Qwen3.5-9B (base) | no disponible en la información | no disponible | no disponible | no disponible | Modelo generalista original; el ajuste no garantiza mejora fuera del dominio Soonlife |
| Soonlife-Qwen3.5-9B-v2b-FP8 | 9,41 B | 32.768 | ko | Apache 2.0 | Misma arquitectura y datos, cuantización FP8 dynamic para producción |
| Soonlife-Qwen3.5-9B-FP8 (v1) | 9,41 B | 32.768 | ko | Apache 2.0 | Versión de producción declarada por el autor; pérdidas de validación ligeramente distintas |

No se dispone de datos de benchmarks ni de comparaciones con modelos de terceros en la información proporcionada.

## Limitaciones y advertencias

- Modelo de dominio muy restringido: está entrenado exclusivamente para el chatbot RAG de avisos y reglamentos de la Universidad de Soonchunhyang; fuera del system prompt y del formato de herramientas usados en el entrenamiento no hay garantía de que supere al Qwen3.5-9B original.
- Sin evaluación publicada: la comparación sobre el split de test está pendiente, por lo que no existen métricas de calidad verificables.
- Versión experimental: el propio autor etiqueta v2b como experimental y recomienda la variante FP8 de v1 para producción.
- Torre de visión no entrenada: aunque el pipeline es image-text-to-text, los datos de entrenamiento sustituyeron las imágenes por el marcador `[그림]`, de modo que el comportamiento sobre imágenes reales no está validado para la tarea.
- Decodificación especulativa degradada: los pesos MTP no se entrenaron, y el autor advierte de que la tasa de aceptación puede ser ligeramente inferior a la del modelo base.
- Idioma: solo se declara coreano; el rendimiento en castellano u otros idiomas no está garantizado.
- Riesgo de alucinación: inherente a un modelo de 9B con RAG; al no haber evaluación, no se puede acotar su magnitud en el dominio.
- Sesgos: no se documentan sesgos específicos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero la licencia del modelo base Qwen debe verificarse por separado antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b
- Variante FP8 para producción: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-FP8
- Adaptador LoRA y registro de entrenamiento: https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2b-LoRA
- Versión de producción v1 (FP8): https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-FP8
- Versión v2 (FP8): https://huggingface.co/wonchandev/Soonlife-Qwen3.5-9B-v2-FP8
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/wonchandev/Soonlife_dataset
