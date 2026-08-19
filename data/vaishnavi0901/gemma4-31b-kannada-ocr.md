# vaishnavi0901/gemma4-31b-kannada-ocr

## Resumen

El modelo `vaishnavi0901/gemma4-31b-kannada-ocr` es un ajuste fino (fine-tune) del modelo base `unsloth/gemma-4-31b-it-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Gemma 4 31B Instruct de Google, optimizada con la librería Unsloth. El autor, vaishnavi0901, lo ha entrenado específicamente para la tarea de reconocimiento óptico de caracteres (OCR) de texto kannada manuscrito, utilizando un dataset propio de registros históricos de nacimiento y defunción. El repositorio tiene un tamaño de 0,6 GB, lo que sugiere que se trata de un adaptador LoRA o un ajuste de bajo rango, no de los pesos completos del modelo.

La relevancia de este modelo radica en su aplicación para la digitalización de documentos históricos en kannada, una lengua dravídica hablada por más de 40 millones de personas en el sur de India. Al partir de Gemma 4, que soporta una ventana de contexto de hasta 256K tokens y capacidades multimodales (visión), el modelo hereda una base sólida para tareas de comprensión de imágenes y texto, aunque el fine-tune se centra en la transcripción de escritura manual. No se han publicado resultados de benchmarks ni detalles técnicos del entrenamiento, por lo que su rendimiento real debe validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en Gemma 4 31B, con atención híbrida y capacidades multimodales) |
| Parametros totales | No disponible (el adaptador LoRA tiene un tamaño de 0,6 GB; el modelo base tiene 31B) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No disponible para el fine-tune; el modelo base soporta hasta 256K tokens |
| Tipos de cuantizacion | El modelo base está cuantizado en 4 bits (bitsandbytes); el adaptador probablemente en fp16/bf16 |
| Idiomas soportados | en (inglés) según la model card; el OCR está orientado al kannada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 31B, la arquitectura insignia de Google DeepMind, que combina atención densa con mecanismos de atención híbrida (según la documentación oficial). El fine-tune se realizó mediante la técnica QLoRA (quantized Low-Rank Adaptation) sobre la versión cuantizada en 4 bits de Unsloth, lo que permite entrenar adaptadores eficientes con un consumo reducido de VRAM. La librería TRL se utilizó para el pipeline de entrenamiento, probablemente con supervisión directa sobre pares imagen-texto del dataset de OCR kannada.

El dataset de entrenamiento (`vaishnavi0901/kannada-ocr-dataset`) contiene imágenes de escritura manuscrita kannada extraídas de registros históricos de nacimiento y defunción. No se especifican el número de tokens, el tamaño del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla la duración del entrenamiento ni las hiperparametros utilizados. La ausencia de esta información limita la reproducibilidad y la evaluación objetiva del modelo.

## Capacidades

- OCR de texto kannada manuscrito: el modelo está entrenado para transcribir imágenes de escritura manual en kannada, especialmente de registros históricos.
- Generación de texto en inglés: hereda las capacidades de generación del modelo base Gemma 4 31B Instruct.
- Comprensión de imágenes: al basarse en Gemma 4, que incluye un codificador de visión, el modelo puede procesar imágenes y responder preguntas sobre ellas, aunque el fine-tune se ha especializado en OCR.
- Razonamiento y diálogo: las capacidades conversacionales del modelo base se mantienen, aunque el adaptador puede alterarlas.
- Soporte de tool calling y agentes: no se documenta explícitamente, pero Gemma 4 31B lo soporta; el adaptador podría interferir.
- Multilingüismo: la model card solo indica inglés, aunque el OCR está en kannada; el modelo base soporta múltiples idiomas, pero no se garantiza su calidad tras el fine-tune.

## Casos de uso

- Digitalización de archivos históricos: transcripción automática de registros manuscritos de nacimiento y defunción en kannada, facilitando su búsqueda y preservación digital. El modelo puede procesar imágenes escaneadas y generar texto estructurado.
- Indexación de documentos para genealogía: investigadores pueden alimentar el modelo con imágenes de registros antiguos para extraer nombres, fechas y lugares, acelerando la construcción de árboles genealógicos.
- Creación de bases de datos de acceso público: instituciones culturales y bibliotecas pueden usar el modelo para convertir colecciones manuscritas en texto buscable, integrado en sistemas de gestión documental.
- Asistencia a historiadores y lingüistas: el modelo puede ayudar a transcribir documentos difíciles de leer, reduciendo el tiempo de revisión manual y mejorando la precisión en la interpretación de caligrafías variadas.
- Automatización de procesos administrativos: en contextos donde aún se manejan formularios en papel en kannada, el modelo puede extraer información clave para su ingreso en sistemas digitales.
- Evaluación de calidad de OCR: el modelo puede utilizarse como referencia para comparar otros sistemas de OCR en kannada, aunque su rendimiento no está documentado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni métricas específicas de OCR (como precisión de caracteres o tasa de error) para este fine-tune. Se recomienda realizar una evaluación propia con un conjunto de validación antes de su uso en producción.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA sobre un modelo base de 31B cuantizado en 4 bits, la inferencia requiere al menos 16-20 GB de VRAM, dependiendo de la longitud del contexto y el tamaño del lote. Con cuantización adicional (por ejemplo, 4-bit con bitsandbytes) podría caber en una GPU de 24 GB.
- GPU recomendadas: NVIDIA RTX 3090/4090 (24 GB), A100 (40/80 GB) o H100 para mayor throughput. No se recomienda su uso en GPUs de menos de 16 GB.
- Despliegue: compatible con servidores de inferencia como vLLM, Text Generation Inference (TGI) y llama.cpp (si se convierte a GGUF). También puede ejecutarse con la librería transformers de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 31B en 4 bits, se estima una latencia de entre 20 y 50 tokens por segundo en una A100, pero es una estimación orientativa.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicamente entrenados para OCR de kannada manuscrito. Como referencia, el modelo base Gemma 4 31B puede compararse con otros LLMs de tamaño similar, pero el adaptador OCR no tiene equivalentes documentados. Se sugiere comparar con sistemas OCR tradicionales como Tesseract (que soporta kannada) o modelos de visión-lenguaje como PaliGemma, aunque no se han realizado pruebas comparativas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| vaishnavi0901/gemma4-31b-kannada-ocr | ~31B (base) + adaptador | No disponible | Apache 2.0 | OCR kannada manuscrito |
| Google Gemma 4 31B | 31B | 256K | Gemma Terms (uso comercial permitido) | LLM multimodal general |
| Tesseract OCR | - | - | Apache 2.0 | OCR tradicional, soporta kannada |

## Limitaciones y advertencias

- El modelo es un fine-tune no oficial creado por un usuario individual; no cuenta con validación de Google ni garantías de calidad.
- La model card solo indica idioma inglés, lo que puede limitar la generación de texto en kannada fuera del contexto de OCR.
- El dataset de entrenamiento es específico de registros históricos de nacimiento y defunción; el modelo puede tener un rendimiento deficiente en otros tipos de escritura kannada (imprenta, caligrafía moderna, etc.).
- No se han publicado métricas de precisión ni estudios de sesgos; existe riesgo de alucinación en la transcripción de caracteres ambiguos o dañados.
- El tamaño del adaptador (0,6 GB) sugiere que no se han incluido los pesos completos; para usarlo es necesario descargar el modelo base, lo que implica un consumo de almacenamiento y ancho de banda considerable.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 está sujeto a los términos de uso de Google, que pueden imponer restricciones adicionales.
- No se proporcionan instrucciones de uso ni ejemplos de inferencia en la model card, lo que dificulta su adopción inmediata.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vaishnavi0901/gemma4-31b-kannada-ocr
- Dataset de entrenamiento: https://huggingface.co/datasets/vaishnavi0901/kannada-ocr-dataset
- Modelo base: https://huggingface.co/unsloth/gemma-4-31b-it-unsloth-bnb-4bit
- Gemma 4 31B (Google): https://huggingface.co/google/gemma-4-31B
- Documentación de Gemma 4 (DeepMind): https://deepmind.google/models/gemma/gemma-4/
- Guía de visión de Gemma: https://ai.google.dev/gemma/docs/capabilities/vision
- Página informativa de Gemma 4 31B: https://gemma4.dev/models/gemma-4-31b
