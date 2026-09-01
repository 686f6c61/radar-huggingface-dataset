# stabilityai/stable-audio-open-1.0

## Resumen

Stable Audio Open 1.0 es un modelo de síntesis de audio a partir de texto desarrollado por Stability AI, publicado en mayo de 2024. Está diseñado para generar muestras de audio cortas, efectos de sonido y elementos de producción musical a partir de descripciones textuales. El modelo se basa en una arquitectura de difusión latente y cuenta con 1.213.448.210 parámetros, lo que lo sitúa en la gama de modelos de audio generativo de tamaño medio.

Su relevancia radica en que es uno de los primeros modelos de texto a audio con pesos abiertos entrenados exclusivamente con datos bajo licencia Creative Commons, lo que permite un uso más flexible en comparación con otros modelos que utilizan datos con derechos restrictivos. El modelo está disponible en HuggingFace con acceso restringido (gated), requiere aceptar las condiciones de la licencia estable-audio-community, y su librería de referencia es stable-audio-tools.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente (latent diffusion) con autoencoder y transformer |
| Parametros totales | 1.213.448.210 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo genera audio de hasta 47 segundos a 44,1 kHz) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | stable-audio-community (licencia propia de Stability AI, con restricciones de uso comercial) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Stable Audio Open 1.0 emplea una arquitectura de difusión latente. El modelo comprime el audio en un espacio latente mediante un autoencoder y luego aplica un proceso de difusión condicionado por texto. El texto se codifica mediante un modelo de lenguaje preentrenado (no se especifica cuál en la información disponible) y se utiliza como condición para guiar la generación. El entrenamiento se realizó exclusivamente con datos bajo licencia Creative Commons, lo que constituye una diferencia clave frente a otros modelos de audio generativo que usan datos con derechos más restrictivos.

El proceso de entrenamiento incluye una etapa de difusión en el espacio latente, similar a la empleada en modelos de imagen como Stable Diffusion. No se menciona explícitamente el uso de RLHF o DPO en la información disponible. El modelo está optimizado para generar muestras de audio de corta duración, efectos de sonido y elementos de producción musical, con una frecuencia de muestreo de 44,1 kHz y una duración máxima de salida de aproximadamente 47 segundos.

## Capacidades

- Generación de audio a partir de descripciones textuales en inglés.
- Síntesis de efectos de sonido, samples musicales y elementos de producción (baterías, sintetizadores, texturas, etc.).
- Generación de audio de hasta 47 segundos a 44,1 kHz.
- Condicionamiento por texto mediante un codificador de lenguaje preentrenado.
- Soporte para control de la generación mediante prompts descriptivos (por ejemplo, "un bombo profundo con reverberación").
- No incluye capacidades de vision, tool calling ni razonamiento multimodal; es exclusivamente texto a audio.

## Casos de uso

- Producción musical y diseño de sonido: los productores pueden generar samples de batería, pads, arpegios o texturas sonoras a partir de prompts textuales, integrándolos en sus DAWs (Ableton, Logic, etc.) mediante la exportación de audio generado.
- Creación de efectos de sonido para videojuegos: el modelo permite generar efectos como pasos, puertas, ambientes o impactos sin necesidad de librerías comerciales, agilizando el prototipado de audio en estudios indie.
- Generación de contenido para podcasts y vídeo: los creadores pueden producir transiciones sonoras, jingles o ambientes de fondo describiendo el sonido deseado, reduciendo el tiempo de búsqueda en bancos de sonido.
- Educación musical y experimentación: investigadores y estudiantes pueden explorar la relación entre descripciones textuales y características acústicas, utilizando el modelo como herramienta de síntesis controlable.
- Automatización de bibliotecas de audio: empresas de medios pueden generar variaciones de un mismo sonido (por ejemplo, diferentes intensidades de lluvia) a partir de prompts parametrizados, ampliando catálogos de forma eficiente.
- Investigación en generación de audio: el modelo sirve como base para estudios sobre difusión latente aplicada a audio, comparación de métricas de calidad y desarrollo de técnicas de control fino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La página de investigación de Stability AI menciona que el rendimiento es competitivo con el estado del arte en varias métricas, pero no se proporcionan cifras concretas en los resultados de búsqueda. No se dispone de datos numéricos de MMLU, HumanEval u otros benchmarks aplicables a audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Dado el tamaño de 1,2 mil millones de parámetros y el repositorio de 15,7 GB, se estima que la inferencia requiere al menos 8-12 GB de VRAM en FP16, aunque no hay datos oficiales.
- GPU recomendadas: no se especifican modelos concretos. Por el tamaño, una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A10) sería adecuada para inferencia en FP16.
- Compatibilidad con GPU de consumo: probablemente sí, en tarjetas con 12 GB o más de VRAM, aunque no hay confirmación oficial.
- Opciones de despliegue: la librería stable-audio-tools es la referencia; también se puede usar con diffusers (el tag de HuggingFace incluye diffusers). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de texto a audio de la misma categoría en los resultados de búsqueda. Se podría mencionar que existen alternativas como AudioLDM 2 o MusicGen de Meta, pero no se han encontrado datos comparativos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo solo soporta prompts en inglés; las descripciones en otros idiomas pueden producir resultados subóptimos.
- La licencia stable-audio-community impone restricciones de uso comercial; es necesario revisar los términos exactos antes de utilizarlo en productos comerciales.
- El acceso al modelo en HuggingFace es restringido (gated), lo que requiere aceptar condiciones adicionales.
- La duración máxima de generación es de aproximadamente 47 segundos, lo que limita su uso para piezas musicales completas o audio de larga duración.
- No se han publicado datos sobre sesgos o alucinaciones específicas, pero como modelo generativo, puede producir sonidos inesperados o de baja calidad en prompts ambiguos.
- El entrenamiento con datos Creative Commons puede limitar la cobertura de ciertos estilos o géneros musicales muy específicos.
- No se proporcionan cuantizaciones oficiales, por lo que el despliegue en entornos con poca VRAM puede requerir conversión manual a formatos como GGUF o GPTQ, lo que no está documentado.

## Enlaces

- HuggingFace: https://huggingface.co/stabilityai/stable-audio-open-1.0
- Página de investigación de Stability AI: https://stability.ai/research/stable-audio-open
- Anuncio oficial: https://stability.ai/news-updates/introducing-stable-audio-open
- Ficha en Open Laboratory: https://openlaboratory.com/models/stable-audio-open-1/
- Paper (arXiv): https://arxiv.org/abs/2407.14358
