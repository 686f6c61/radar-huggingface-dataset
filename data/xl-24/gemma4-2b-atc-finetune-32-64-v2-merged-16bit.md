# xl-24/gemma4-2b-atc-finetune-32-64-v2-merged-16bit

## Resumen

`xl-24/gemma4-2b-atc-finetune-32-64-v2-merged-16bit` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, publicado por el usuario `xl-24` en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la familia Gemma 4, orientado a generación de texto e instrucciones conversacionales, con licencia Apache 2.0 y pesos en formato safetensors de 16 bits tras el proceso de merge.

El modelo parte de la variante "E2B" de Gemma 4 en versión instruction-tuned y cuantizada en 4 bits (bnb) por Unsloth, sobre la que se ha aplicado un ajuste fino supervisado y posteriormente un merge de los adaptadores para producir pesos completos en 16 bits. El resultado declarado contiene 5.123.178.051 parámetros en safetensors, lo que resulta coherente con un modelo multimodal que combina un codificador de visión con un transformer de lenguaje de aproximadamente 2 mil millones de parámetros.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no incluye información sobre el dataset de entrenamiento, la tarea concreta ("atc" en el nombre sugiere un dominio específico, posiblemente atención al cliente o control aéreo, no confirmado), ni resultados de evaluación. Es un artefacto de finetune de autor individual, sin benchmarks publicados y con cero descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4 E2B; detalles internos no disponibles |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base se distribuye en bnb-4bit; esta versión está merged en 16 bits (safetensors). Otras cuantizaciones no disponibles |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Gemma 4 en su variante E2B, un modelo multimodal que procesa entradas de imagen y texto y genera texto. El pipeline declarado en Hugging Face es `image-text-to-text`, lo que confirma la presencia de un codificador visual acoplado a un decoder de lenguaje. No se dispone de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni configuración exacta del codificador de visión en la información proporcionada.

El entrenamiento se realizó mediante ajuste fino con Unsloth y la librería TRL de Hugging Face, partiendo de la versión instruction-tuned cuantizada en 4 bits del modelo base. Posteriormente se realizó un merge de los pesos en 16 bits. No se especifican el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni técnicas adicionales como decodificación especulativa o atención lineal. El sufijo "32-64" del nombre del repositorio podría referirse a una configuración de entrenamiento (por ejemplo, rango LoRA o longitud de secuencia), pero no está documentado.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Gemma 4 E2B instruction-tuned.
- Procesamiento de entradas multimodales imagen-texto (pipeline `image-text-to-text`), lo que permite describir imágenes, responder preguntas sobre ellas o extraer información visual.
- Soporte de tool calling / function calling: no confirmado en la información disponible; el modelo base Gemma 4 it podría incluirlo, pero no se documenta en esta ficha.
- Razonamiento multi-paso y uso como agente: no documentado para este finetune.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo "thinking" o razonamiento explícito: no disponible.
- Capacidades de audio: no disponibles.

## Casos de uso

- Asistente conversacional especializado en un dominio concreto: dado el sufijo "atc" del nombre, podría haberse ajustado para atención al cliente o un dominio técnico específico; se usaría como chatbot de soporte con entradas de texto e imagen (por ejemplo, capturas o documentos), aunque la especialización real no está documentada.
- Descripción y análisis de imágenes en inglés: el modelo puede recibir una imagen y generar texto descriptivo o responder preguntas sobre su contenido, útil en tareas de accesibilidad o catalogación.
- Extracción de información de documentos visuales: al ser image-text-to-text, podría emplearse para transcribir o resumir contenido de capturas y fotografías en flujos de procesamiento por lotes.
- Prototipado rápido de aplicaciones multimodales: al ser un modelo de ~5,1 mil millones de parámetros en 16 bits, es viable para experimentación en una sola GPU, lo que facilita iterar sobre prototipos antes de escalar a modelos mayores.
- Generación de respuestas en inglés para asistentes embebidos: su tamaño moderado permite desplegarlo en entornos con recursos limitados para tareas de generación de texto de baja latencia.
- Investigación sobre finetuning con Unsloth: el repositorio sirve como ejemplo reproducible de un pipeline de ajuste fino y merge en 16 bits sobre Gemma 4, útil para estudiar técnicas de entrenamiento eficiente en memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 10-11 GB solo para los pesos (5,12 mil millones de parámetros × 2 bytes), más memoria para el codificador visual, el contexto y los estados intermedios de atención; en la práctica se recomienda al menos 16 GB.
- En cuantización de 8 bits: en torno a 5-6 GB de pesos; en 4 bits: en torno a 3 GB de pesos, aunque esta versión concreta se distribuye en 16 bits.
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, L40S o RTX 6000 Ada para producción; RTX 4090 (24 GB) para inferencia cómoda en 16 bits.
- ¿Cabe en GPU de consumo? Sí: en 16 bits cabe en una RTX 4090 (24 GB) y, con cuantización a 8 o 4 bits, en tarjetas de 12-16 GB como RTX 4070 Ti o RTX 4080.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no incluidas en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune-32-64-v2-merged-16bit | 5,12 B | no disponible | imagen-texto | Apache 2.0 | Hugging Face (0 descargas) |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | ~2 B (E2B) | no disponible | imagen-texto | Apache 2.0 | Hugging Face |
| Gemma 4 E2B-it (original) | ~2 B (E2B) | no disponible | imagen-texto | Apache 2.0 | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada. La diferencia principal entre el finetune y su base es el ajuste específico del autor y el merge a 16 bits, no un cambio de arquitectura.

## Limitaciones y advertencias

- No se documenta el dataset de entrenamiento ni el objetivo del finetune ("atc"), por lo que el comportamiento real del modelo en dominios distintos al entrenado es incierto.
- Riesgo de alucinación inherente a los modelos de lenguaje de este tamaño; sin evaluaciones publicadas no puede cuantificarse.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Sesgos: no se han publicado análisis de sesgos; al derivar de Gemma 4, puede heredar sesgos del corpus de entrenamiento original.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones de la licencia del modelo base Gemma 4 de Google, que puede imponer términos adicionales de uso aceptable.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado en la misma fecha; no hay evidencia de validación por la comunidad.
- El nombre "2b" en el identificador no coincide con los 5,12 mil millones de parámetros reales, lo que puede generar confusión sobre el tamaño efectivo del modelo.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en tareas de contexto largo.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune-32-64-v2-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
