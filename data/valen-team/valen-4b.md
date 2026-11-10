# Valen-Team/Valen-4B

## Resumen

Valen-4B es un modelo de decisión multimodal desarrollado por Valen-Team, afinado a partir de Qwen/Qwen3.5-4B. No es un modelo generativo al uso: su función principal es clasificar y responder preguntas estructuradas sobre entradas de texto e imagen (y, según la documentación del autor, también vídeo), devolviendo salidas tipadas como predicados con probabilidad, en lugar de texto libre. Está pensado para tareas de enrutamiento de tickets, verificación de imágenes contra requisitos y etiquetado de acciones en vídeo.

El modelo tiene 4.540.981.545 parámetros totales (aproximadamente 4,5 mil millones) y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y código personalizado (`trust_remote_code=True`) para el método `predict`. El repositorio ocupa 9,4 GB. La model card menciona variantes de tamaño 0.8B, 2B y 4B, así como formatos nativos, ONNX y GGUF, aunque esta ficha se centra en la versión 4B publicada.

Su relevancia actual radica en el enfoque: en lugar de competir en generación abierta, propone un protocolo de decisión estructurado (formatos "SystemOne" y "Decisions") que devuelve respuestas tipadas y probabilidades, lo que facilita integrarlo en pipelines de producción donde se necesita una salida verificable y no texto libre. El autor publica además código de entrenamiento y un dataset de 100k ejemplos, y ofrece una API gratuita y una demo web.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (fine-tune de Qwen/Qwen3.5-4B); detalles internos no disponibles |
| Parámetros totales | 4.540.981.545 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Nativo (F32), ONNX (q8-mlp), GGUF (F32, Q8_0); Q4/Q5 de GGUF no superaron los controles de calidad según el autor |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (nativo), ONNX, GGUF |

## Arquitectura y entrenamiento

Valen-4B es un fine-tune del modelo base Qwen/Qwen3.5-4B, por lo que hereda la arquitectura transformer de dicho modelo, aunque la model card no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención, etc.). El modelo incorpora código personalizado para exponer una API de decisión (`model.predict`) que acepta una entrada y una lista de preguntas tipadas (por ejemplo, `predicate` o el formato heredado `noul`) y devuelve respuestas estructuradas con probabilidades.

El autor publica el código de entrenamiento en GitHub y un dataset de entrenamiento en Hugging Face denominado Valen-Training-General-100k (100.000 ejemplos). No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones técnicas como decodificación especulativa o atención lineal. La model card sí menciona que las variantes GGUF Q4/Q5 no superaron los controles de calidad, lo que sugiere un proceso de validación por umbrales de calidad en distintas precisiones.

## Capacidades

- Clasificación de mensajes de texto mediante preguntas tipadas con salida probabilística (predicados).
- Verificación de imágenes contra requisitos definidos por el usuario (image-text-to-text con salida tipada).
- Identificación de acciones en vídeo (según la model card; con matices en la versión GGUF precompilada, que no compila soporte directo de vídeo).
- Salida estructurada y tipada ("image-text-to-typed-output", "structured-output"), adecuada para integración en sistemas.
- Soporte de dos formatos de API de decisión: SystemOne (Jev) y Decisions (OpenAI).
- Gestión de estado compartido ("shared-state") entre preguntas de una misma llamada.
- Toma de decisiones en entornos tipo juego (demo de Sokoban).
- No se documentan capacidades de generación de texto libre, razonamiento abierto, código, matemáticas ni tool calling en el sentido habitual; el modelo está orientado a decisión y clasificación.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto del ticket y una batería de preguntas tipadas (categoría, urgencia, producto) y devuelve probabilidades por etiqueta, lo que permite dirigir cada ticket al equipo adecuado con umbrales configurables. El autor mantiene un tutorial específico de ticket routing.
- Verificación de imágenes de producto: se envía una imagen y una lista de requisitos (por ejemplo, "fondo blanco", "producto centrado") y el modelo devuelve la probabilidad de cumplimiento de cada predicado, útil para control de calidad en catálogos de e-commerce.
- Etiquetado de acciones en vídeo: identificación de acciones o eventos en clips de vídeo mediante preguntas tipadas, aplicable a moderación de contenido o indexación de archivos audiovisuales.
- Moderación de contenido textual: clasificación de mensajes contra políticas definidas como predicados, con salida probabilística que permite fijar umbrales de revisión humana.
- Automatización de decisiones en juegos o entornos simulados: la demo de Sokoban muestra su uso para seleccionar acciones a partir del estado del tablero.
- Integración en pipelines de decisión con API HTTP: al ofrecer API gratuita y formatos compatibles con SystemOne y Decisions, puede conectarse a sistemas existentes sin desplegar GPU propia.
- Fine-tuning para dominios propios: el autor publica código de entrenamiento y dataset, de modo que equipos con requisitos específicos pueden adaptar el modelo a sus propias taxonomías de decisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,5B parámetros), el peso en F32 ronda los 18 GB y en cuantización de 8 bits alrededor de 4,5-5 GB; el autor no publica cifras de VRAM medidas.
- GPU recomendadas: el ejemplo oficial de carga usa una GPU NVIDIA con CUDA y `torch`, `torchvision`, `transformers`, `pillow` y `av`. No se especifican modelos concretos (A100, H100, RTX 4090).
- ¿Cabe en GPU de consumo? No confirmado por el autor; dependerá de la cuantización y del backend. La model card advierte que el tamaño de archivo no equivale al requisito de RAM.
- Opciones de despliegue: Transformers (nativo), ONNX Runtime (Python/JavaScript), runtime personalizado de Valen para GGUF en CPU Linux (C++), SGLang/vLLM para GPU, y Ollama/llama.cpp solo mediante el runtime personalizado (no se reclama soporte en las versiones oficiales sin modificar).
- Latencia y throughput: no disponibles; el autor indica explícitamente que no promete rendimiento no medido.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Valen-4B | 4,54B | no disponible | Decisión multimodal con salida tipada | Apache 2.0 | Hugging Face, API gratuita, ONNX/GGUF |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | Generación multimodal general | no disponible en la información | Hugging Face |
| Valen-Decision-1.5-4B | no disponible | no disponible | Versión sucesora del mismo autor | no disponible | Hugging Face |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de Valen-4B con alternativas de la misma categoría. La comparación se limita a parámetros, enfoque y disponibilidad.

## Limitaciones y advertencias

- El modelo está diseñado para decisión y clasificación, no para generación de texto libre; usarlo fuera de ese protocolo puede dar resultados no representativos.
- La model card no documenta sesgos conocidos ni tasas de alucinación; al ser un fine-tune de un modelo base no auditado en esta ficha, los sesgos del base pueden persistir.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe más allá de lo que herede del modelo base.
- Longitud de contexto no disponible; no se puede planificar su uso en entradas largas sin verificación empírica.
- Las cuantizaciones GGUF Q4/Q5 no superaron los controles de calidad del autor; solo se recomiendan F32 y Q8_0.
- La versión GGUF precompilada 0.1.0 no compila soporte directo de vídeo; las pruebas históricas de vídeo con compilación desde fuente no cualifican el paquete precompilado.
- No se reclama soporte en llama.cpp u Ollama oficiales sin modificar; requiere el runtime personalizado del autor.
- Licencia Apache 2.0 permite uso comercial, pero el código personalizado (`trust_remote_code=True`) debe auditarse antes de ejecutarlo en producción.
- Existe una versión sucesora (Valen-Decision-1.5-4B) que el autor recomienda; conviene evaluar su adopción frente a esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Valen-Team/Valen-4B
- Versión sucesora: https://huggingface.co/Valen-Team/Valen-Decision-1.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/Valen-Team/Valen-Training-General-100k
- Repositorio de código: https://github.com/Valen-Team/Valen
- Demo web y API gratuita: https://valen-team.github.io/
- Cookbook: https://valen-team.github.io/cookbook/
- Guía de selección de versión: https://valen-team.github.io/docs/valen/choosing/
- Documentación de inicio rápido: https://valen-team.github.io/docs/valen/quickstart/
- Validación y rendimiento: https://valen-team.github.io/cookbook/validation/
- Tutorial de enrutamiento de tickets: https://valen-team.github.io/cookbook/ticket-routing/
- Tutorial de verificación de imágenes de producto: https://valen-team.github.io/cookbook/product-screening/
- Tutorial de etiquetado de vídeo: https://valen-team.github.io/cookbook/video-tagging/
- Documentación de SystemOne (Jev): https://docs.typesafe.ai/api/system-one
- Documentación de Decisions (OpenAI): https://developers.openai.com/api/docs/guides/decisions
