# SynhalaAI/AehAI-Gemma4-E2B-Vision

## Resumen

AehAI-Gemma4-E2B-Vision es un ajuste fino (fine-tune) multimodal desarrollado por SynhalaAI sobre el modelo base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google en su variante E2B (efímera, 2B de parámetros activos) optimizada por Unsloth. El modelo resuelve tareas de image-text-to-text, es decir, recibe imágenes y texto y genera respuestas en lenguaje natural, con soporte declarado para inglés (en) y sinhala (si). El repositorio acumula 1.242 descargas y está publicado bajo acceso restringido (gated), lo que exige aceptar condiciones en Hugging Face antes de su descarga.

El checkpoint contiene 5.123.178.051 parámetros en formato safetensors (28,9 GB de repositorio), un tamaño coherente con un modelo multimodal que combina un codificador visual con un decoder de lenguaje de aproximadamente 2B parámetros activos. La relevancia actual del modelo radica en su carácter de ajuste fino regionalizado (incluye sinhala, un idioma de bajos recursos) sobre una arquitectura Gemma 4 reciente, lo que lo hace interesante para investigación en adaptación multilingüe y multimodal de modelos compactos.

No se dispone de información pública sobre la composición del dataset de ajuste, el número de tokens de entrenamiento ni los resultados de benchmarks. La ficha se limita a los datos verificables del repositorio y a las características conocidas de la arquitectura base Gemma 4.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Gemma 4 E2B; no se detalla la variante exacta (dense/MoE) en la información disponible |
| Parámetros totales | 5.123.178.051 (5,12 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | El modelo base está cuantizado en 4 bits (bnb-4bit); el checkpoint publicado está en safetensors. No se detallan otras cuantizaciones disponibles |
| Idiomas soportados | Inglés (en) y sinhala (si) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |
| Modelo base | unsloth/gemma-4-E2B-it-unsloth-bnb-4bit |
| Pipeline | image-text-to-text |
| Acceso | Restringido (gated); requiere aceptar condiciones en Hugging Face |
| Tamaño del repositorio | 28,9 GB |
| Descargas | 1.242 |
| Fecha de creación | 2026-11-06 |
| Última actualización | 2026-11-22 |

## Arquitectura y entrenamiento

El modelo se construye sobre Gemma 4 E2B, la variante compacta de la familia Gemma 4 de Google, adaptada por Unsloth mediante cuantización de 4 bits (bnb-4bit) para reducir los requisitos de memoria durante el ajuste fino. Al tratarse de un modelo image-text-to-text, la arquitectura combina un codificador de visión con un decoder de lenguaje autorregresivo; sin embargo, la información proporcionada no detalla la configuración exacta del codificador visual, el número de capas ni la estrategia de fusión multimodal.

El ajuste fino lo realiza SynhalaAI partiendo del checkpoint de Unsloth, presumiblemente con datos propios orientados a inglés y sinhala. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la aplicación de RLHF/DPO ni innovaciones técnicas específicas del fine-tune. La única innovación documentada es la propia cuantización de 4 bits del modelo base, que permite ajustar y desplegar el modelo en hardware más modesto.

## Capacidades

- Generación de texto condicionada por imagen (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y conversación multimodal.
- Comprensión de imágenes combinada con razonamiento textual en inglés y sinhala.
- Generación de texto conversacional multi-turno (tag `conversational`).
- Compatibilidad con Text Generation Inference (tag `text-generation-inference`) y endpoints compatibles.
- Integración con el ecosistema transformers y Unsloth.
- Capacidades de tool calling / function calling: no confirmadas en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Capacidades de audio: no disponibles.
- Modo thinking explícito: no confirmado.

## Casos de uso

- Descripción automática de imágenes en inglés y sinhala: el modelo puede generar pies de foto y descripciones detalladas para catálogos, archivos fotográficos o aplicaciones de accesibilidad, aprovechando su pipeline image-text-to-text.
- Respuesta visual a preguntas (VQA) en sinhala: útil para digitalizar servicios de atención en regiones de Sri Lanka, donde los modelos multilingües de bajos recursos escasean.
- Extracción de información de documentos escaneados: el modelo puede transcribir y resumir contenido de facturas o formularios en imagen, combinando visión y generación de texto.
- Asistente conversacional multimodal para soporte técnico: permite al usuario enviar capturas de pantalla o fotos de un producto y recibir explicaciones en inglés o sinhala en conversaciones multi-turno.
- Moderación de contenido visual asistida: clasificación y descripción de imágenes para pipelines de revisión, con salida textual estructurada que puede integrarse en sistemas downstream.
- Prototipado de investigación en adaptación multilingüe: sirve como punto de partida para experimentos de fine-tuning sobre idiomas de bajos recursos, dado su tamaño compacto (5,12 mil millones de parámetros) y su base Unsloth de 4 bits.
- Educación y accesibilidad: generación de descripciones de material gráfico educativo para estudiantes sinhala-parlantes, con despliegue en infraestructura modesta gracias al tamaño reducido del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 5,12 mil millones de parámetros en fp16 requiere aproximadamente 10-11 GB de VRAM solo para los pesos, más el overhead del codificador visual y la caché KV; en cuantización de 4 bits (como el modelo base) podría situarse en torno a 3-4 GB, aunque esta cifra no está confirmada para el checkpoint publicado.
- GPU recomendadas: no especificadas. Por tamaño, cabría esperar funcionamiento en GPUs de 16-24 GB (RTX 4090, A10G, L4) en fp16 y en GPUs de 8-12 GB con cuantización, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: probable en RTX 3090/4090 y posible en RTX 4060 Ti 16 GB con cuantización, sin confirmación oficial.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`), endpoints compatibles. Compatibilidad con llama.cpp, Ollama o vLLM no confirmada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Acceso |
|---|---|---|---|---|---|
| AehAI-Gemma4-E2B-Vision | 5,12 mil millones | no disponible | en, si | no disponible | Restringido (gated) |
| Gemma 4 E2B base (unsloth/gemma-4-E2B-it-unsloth-bnb-4bit) | ~2B activos (E2B) | no disponible | multilingüe (según familia Gemma) | Términos de Gemma | Público en HF |
| Modelos VLM compactos de la competencia (p. ej. Qwen2-VL-2B, PaliGemma) | ~2-3 mil millones | variable | multilingüe | variable (Apache 2.0 en algunos) | Público |

No se dispone de datos de rendimiento comparativo para este checkpoint. La comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Licencia no declarada en la información disponible: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar los términos del repositorio y los del modelo base Gemma 4 antes de cualquier despliegue en producción.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face, lo que puede limitar la reproducibilidad y la automatización de pipelines.
- Cobertura lingüística limitada a inglés y sinhala; el rendimiento en castellano u otros idiomas no está garantizado ni documentado.
- Riesgo de alucinación inherente a los modelos generativos multimodales, especialmente en descripciones de imágenes ambiguas o de baja calidad.
- Sesgos potenciales heredados del corpus de entrenamiento de Gemma 4 y del dataset de ajuste de SynhalaAI, no documentados.
- Longitud de contexto no especificada: no se puede garantizar el manejo de documentos o conversaciones largas.
- Ausencia de benchmarks publicados: no hay evidencia cuantitativa de calidad frente al modelo base ni frente a alternativas.
- El checkpoint publicado en safetensors (28,9 GB) es considerablemente mayor que el modelo base cuantizado en 4 bits, lo que puede afectar a los requisitos de memoria en inferencia si no se recuantiza.
- Sin información sobre el proceso de entrenamiento: no se puede evaluar la calidad ni la representatividad del dataset de ajuste.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SynhalaAI/AehAI-Gemma4-E2B-Vision
- Modelo base en Hugging Face: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Documentación de Gemma (Google): https://ai.google.dev/gemma
- Unsloth: https://github.com/unslothai/unsloth
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
