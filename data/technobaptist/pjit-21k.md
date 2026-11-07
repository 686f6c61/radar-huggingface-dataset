# TechnoBaptist/pjit-21k

## Resumen

P-JiT 21K es un modelo de difusión texto-a-imagen de 2.184 millones de parámetros desarrollado por Linum, un laboratorio de investigación formado por los hermanos Sahil y Manu Chopra. El modelo implementa la arquitectura Pyramid-JiT (P-JiT) y se distribuye como checkpoint de investigación bajo licencia Apache 2.0. El repositorio de Hugging Face lo publica el usuario TechnoBaptist, mientras que la autoría técnica y el entrenamiento corresponden a Linum.

El interés del modelo reside en su relación coste-rendimiento: se entrenó con aproximadamente 660 millones de muestras (610 millones a 512 px y 50 millones a 1024 px) por un coste de cómputo de unos 21.000 dólares, y posteriormente se ajustó con una variante de FDFO (referencia arXiv:2603.12893). Genera imágenes en espacio de píxeles (pixel-space diffusion) en cinco resoluciones cercanas a 1 MP y utiliza un codificador de texto Qwen3.5-4B congelado.

Es relevante ahora porque demuestra que un DiT de 2B parámetros puede producir resultados competitivos en retratos y escenas naturales con un presupuesto de entrenamiento muy reducido, y porque Linum lo publica como paso intermedio hacia su próximo modelo de vídeo. No obstante, el propio autor lo califica de artefacto experimental, no de modelo de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) con arquitectura Pyramid-JiT (P-JiT), difusión en espacio de píxeles |
| Parámetros totales | 2.184.091.606 (2,18B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por codificador de texto Qwen3.5-4B congelado) |
| Tipos de cuantización | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (prompts en inglés en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, fp32, 8,7 GB) + `config.json` |

## Arquitectura y entrenamiento

P-JiT 21K es un Diffusion Transformer que opera directamente en espacio de píxeles, sin VAE latente intermedio. La arquitectura Pyramid-JiT se entrenó primero con 610 millones de muestras a 512 px y después con 50 millones de muestras a 1024 px, lo que supone un total aproximado de 660 millones de muestras. El condicionamiento textual lo aporta un codificador Qwen3.5-4B congelado que se descarga por separado. El modelo se entrenó con captions densos de entre 50 y 80 palabras.

Tras el preentrenamiento, el modelo recibió un post-entrenamiento con una variante de FDFO (paper arXiv:2603.12893). Los pesos publicados incluyen únicamente el DiT; las cabeceras de lectura usadas solo en entrenamiento y el adaptador PixelREPA no se distribuyen. El muestreo por defecto emplea 50 pasos Euler, guidance proyectada adaptativa con escala 15 frente a un prompt negativo vacío y ruido inicial a escala 4. El modelo fue entrenado en cinco resoluciones de aproximadamente 1 MP: 1024x1024, 864x1216, 1152x864, 1248x832 y 1280x720.

## Capacidades

- Generación de imágenes fotorrealistas a partir de descripciones textuales densas, con especial soltura en retratos y primeros planos.
- Ilustración y estilos pictóricos (por ejemplo, ilustración de libro infantil u óleo), según los ejemplos de la model card.
- Generación en cinco relaciones de aspecto cercanas a 1 MP, incluyendo formatos verticales, cuadrados y apaisados.
- Condicionamiento mediante captions largos de 50 a 80 palabras; el repositorio de código incluye un upsampler de prompts que reescribe instrucciones cortas con Claude Opus 5.5 vía OpenRouter.
- Reproducibilidad determinista mediante semillas (`--seeds`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente generativo de imagen.
- No genera texto renderizado: no escribe palabras, carteles, logotipos, infografías ni portadas.

## Casos de uso

- Retrato editorial y fotografía de personajes: el modelo rinde especialmente bien en primeros planos con iluminación natural y fondos desenfocados, como demuestra el ejemplo de retrato de la model card; adecuado para pruebas de concepto de ilustración editorial.
- Ilustración de libros infantiles: los ejemplos publicados incluyen ilustraciones de estilo libro infantil (un oso compartiendo miel con un conejo), útiles para maquetas y pruebas de estilo antes de encargar arte final.
- Exploración de estilos pictóricos: con prompts tipo "óleo de un pescador curtido fumando en pipa" se pueden generar variaciones de estilo para moodboards y dirección de arte.
- Generación de fondos y escenas naturales: paisajes como praderas alpinas o bosques de bambú sirven como fondos para composición posterior en herramientas de diseño.
- Investigación en entrenamiento eficiente: al ser un checkpoint abierto con código y blog técnico, permite reproducir experimentos de difusión en espacio de píxeles y estudiar el impacto de FDFO con un presupuesto de cómputo bajo.
- Prototipado rápido en pipelines de generación de imagen: integrable mediante el script `generate.py` del repositorio para pruebas automatizadas por lotes con semillas fijas.
- Base para fine-tuning experimental: al estar en Apache 2.0 y safetensors fp32, puede adaptarse a dominios concretos (por ejemplo, un estilo de ilustración propio) sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FID, CLIP score, GenEval ni similares); solo se ofrecen muestras cualitativas en el blog y el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan 8,7 GB; en fp16/bf16 bajarían a aproximadamente 4,4 GB, más el codificador de texto Qwen3.5-4B (que se descarga aparte y añade varios GB según precisión).
- GPU recomendadas: A100 40/80 GB o H100 para fp32 sin cuantizar y lotes; RTX 4090 (24 GB) o RTX 3090 (24 GB) para fp16/bf16 con margen suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 12-16 GB o más si se usa media precisión y se gestiona el codificador de texto por separado; en 8 GB requeriría cuantización adicional no documentada.
- Opciones de despliegue: el repositorio oficial (`github.com/Linum-AI/pjit-21k`) con `generate.py` y `pip install -e .`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión de este tipo).
- Latencia y throughput: no disponibles; el muestreo por defecto es de 50 pasos Euler, lo que implica un coste de inferencia moderado-alto por imagen.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| P-JiT 21K | 2,18B (DiT) + 4B text encoder | ~1 MP, 5 resoluciones | Apache 2.0 | Hugging Face + GitHub | Checkpoint de investigación, sin benchmarks publicados |
| Alternativas de la misma categoría (DiT texto-a-imagen de ~2B) | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |
| Modelos de difusión latente de gran escala (p. ej., familia SD/Flux) | no disponible | no disponible | no disponible | no disponible | No se aportan cifras comparables en la información disponible |

No se dispone de datos verificables sobre modelos comparables en la información proporcionada; la comparativa cuantitativa queda pendiente de benchmarks públicos.

## Limitaciones y advertencias

- Checkpoint de investigación experimental: el propio autor advierte que no es un modelo de producción y que deben esperarse "rough edges".
- Incapacidad para renderizar texto: no genera palabras, carteles, logotipos, portadas ni infografías; el dataset excluyó deliberadamente ese tipo de imágenes.
- Dificultades con composiciones complejas: planos de cuerpo entero, muchas entidades (seis coches, multitudes), interacciones entre varias personas y conocimiento del mundo (seis cuerdas en una guitarra, los puntos de un dado).
- Modelo pequeño (2B DiT + 4B text encoder): menor fidelidad semántica que modelos de mayor escala.
- Riesgo de sesgos: no se documentan análisis de sesgo; al entrenarse con datos filtrados para animación, la distribución demográfica y cultural puede estar sesgada.
- Riesgo de alucinación visual: detalles anatómicos, conteos y atributos finos pueden ser incorrectos.
- Idiomas: la model card solo documenta prompts en inglés; el soporte multilingüe no está verificado.
- Licencia Apache 2.0: permite uso comercial, pero al ser un artefacto de investigación la calidad en producción no está garantizada.
- Dependencia externa: el upsampler de prompts requiere `OPENROUTER_API_KEY` y el codificador Qwen3.5-4B se descarga por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TechnoBaptist/pjit-21k
- Blog post de Linum: https://www.linum.ai/field-notes/pjit-21k
- Blog de la arquitectura P-JiT: https://www.linum.ai/field-notes/pyramid-jit
- Repositorio de código: https://github.com/Linum-AI/pjit-21k
- Paper FDFO: https://arxiv.org/abs/2603.12893
- Codificador de texto Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Perfil del autor en Hugging Face: https://huggingface.co/TechnoBaptist
- Web del autor: https://thesahilchopra.com/
- LinkedIn del coautor: https://www.linkedin.com/in/manu-chopra-50360b170/
- Newsletter Field Notes: https://buttondown.com/linum-ai
