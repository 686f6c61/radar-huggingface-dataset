# xiaomi-research/MiLMMT-46-12B-v1.0

## Resumen

MiLMMT-46-12B-v1.0 es un modelo de traducción automática multilingüe desarrollado por Xiaomi Research, construido sobre la arquitectura de Gemma3-12B. El modelo ha sido entrenado en cuatro etapas: preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, ajuste fino supervisado, aprendizaje por refuerzo y fusión de modelos. El resultado es un sistema de traducción de propósito general que cubre un amplio espectro de lenguas, desde las más habladas como inglés, chino, español o hindi, hasta otras menos representadas como jemer, lao o birmano.

La relevancia de este modelo radica en su enfoque de post-entrenamiento sin referencias para LLMs abiertos, una técnica que permite mejorar la calidad de traducción sin depender de datos paralelos etiquetados manualmente. Con 12.187 millones de parámetros, ofrece un equilibrio entre capacidad y requisitos de hardware, siendo desplegable en GPUs de gama alta para consumo y en servidores de producción mediante vLLM o Transformers. Su licencia Gemma permite uso comercial, lo que lo convierte en una opción atractiva para empresas que necesitan traducción automática de alta calidad sin depender de APIs propietarias.

El modelo se distribuye en formato safetensors, con un tamaño de repositorio de 48,8 GB, y es compatible con las principales bibliotecas de inferencia. Aunque su enfoque principal es la traducción, al estar basado en Gemma3 conserva capacidades generales de generación de texto, aunque su entrenamiento específico lo orienta hacia tareas de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only basado en Gemma3-12B |
| Parametros totales | 12.187.325.040 (12B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredado de Gemma3-12B, probablemente 128K tokens) |
| Tipos de cuantizacion | No disponible (safetensors en FP16/FP32; compatible con cuantizacion via vLLM, llama.cpp, etc.) |
| Idiomas soportados | 46: arabe, azerbaiyano, bulgaro, bengali, catalan, checo, danes, aleman, griego, ingles, español, persa, finlandes, frances, hebreo, hindi, croata, hungaro, indonesio, italiano, japones, kazajo, jemer, coreano, lao, malayo, birmano, noruego, neerlandes, polaco, portugues, rumano, ruso, eslovaco, esloveno, sueco, tamil, tailandes, tagalo, turco, urdu, uzbeko, vietnamita, cantonés, chino simplificado, chino tradicional |
| Licencia | Gemma (gemma) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MiLMMT-46-12B-v1.0 parte de Gemma3-12B, un modelo transformer decoder-only con atención causal. El entrenamiento se realizó en cuatro fases secuenciales: (1) preentrenamiento continuo sobre 143 mil millones de tokens de datos monolingües y paralelos en 46 idiomas, lo que dio lugar al checkpoint intermedio MiLMMT-46-12B-Pretrain; (2) ajuste fino supervisado (SFT) sobre datos de traducción, produciendo MiLMMT-46-12B-v0.1; (3) aprendizaje por refuerzo (RL) con un enfoque sin referencias (reference-free), que optimiza la calidad de traducción sin depender de traducciones de referencia; y (4) fusión de modelos (model merging) para combinar los beneficios de los checkpoints anteriores, resultando en la versión final v1.0.

La innovación principal reside en la etapa de post-entrenamiento sin referencias, descrita en el artículo arXiv 2608.10812. Este método permite mejorar la calidad de traducción de LLMs abiertos sin necesidad de pares de traducción anotados manualmente, lo que reduce costes y amplía la escalabilidad a más idiomas. El modelo hereda la arquitectura de Gemma3, incluyendo su mecanismo de atención con ventana deslizante y atención global intercalada, aunque no se especifican detalles adicionales sobre modificaciones internas.

## Capacidades

- Traducción automática multilingüe entre 46 idiomas, cubriendo familias lingüísticas diversas (indoeuropeas, sino-tibetanas, túrquicas, dravídicas, austroasiáticas, etc.).
- Generación de texto en los idiomas soportados, al conservar las capacidades base de Gemma3-12B.
- Soporte de prompts de traducción específicos, con un formato claro que especifica idioma fuente y destino.
- Inferencia eficiente con decodificación greedy (top_k=1, temperature=0) para resultados deterministas.
- Compatibilidad con vLLM y Transformers para despliegue en producción.
- No se documentan capacidades de tool calling, agentes, visión o audio en la información proporcionada, aunque el tag de HuggingFace incluye "image-text-to-text" heredado de Gemma3, sin confirmación de funcionalidad real.

## Casos de uso

- Localización de productos software: el modelo puede traducir cadenas de interfaz, documentación técnica y mensajes de error a 46 idiomas, reduciendo los costes de localización manual. Su formato de prompt permite integrarse fácilmente en pipelines de CI/CD.
- Atención al cliente multilingüe: empresas con usuarios internacionales pueden desplegar el modelo para traducir tickets de soporte y respuestas en tiempo real, gracias a su capacidad de procesar contexto largo (heredado de Gemma3) y su baja latencia con decodificación greedy.
- Traducción de contenido editorial: blogs, artículos y noticias pueden traducirse automáticamente manteniendo coherencia terminológica, con posibilidad de revisión humana posterior. El modelo cubre idiomas con menos recursos como jemer o lao, donde los sistemas comerciales suelen fallar.
- Subtitulación y transcripción: integración con sistemas de reconocimiento de voz para generar subtítulos traducidos en vídeo, aprovechando la generación de texto del modelo.
- Traducción jurídica y técnica: aunque no es un modelo especializado, su entrenamiento con datos paralelos variados permite manejar terminología técnica con precisión aceptable, útil para contratos y manuales.
- Investigación en PLN: el modelo sirve como punto de partida para experimentos de traducción sin referencias, fine-tuning adicional o evaluación de técnicas de post-entrenamiento, dado su acceso abierto y su documentación detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una figura (main.png) con resultados experimentales, pero no se proporcionan valores numéricos en el texto. El artículo arXiv 2608.10812 podría contener métricas detalladas, pero no están accesibles en los materiales consultados. No se pueden aportar datos de MMLU, BLEU u otras métricas sin riesgo de inventar información.

## Requisitos de hardware

- VRAM estimada para inferencia: con 12B parámetros en FP16, se necesitan aproximadamente 24 GB de VRAM. Con cuantización de 8 bits, unos 12 GB; con 4 bits, unos 6 GB. Estas cifras son orientativas y dependen de la implementación.
- GPUs recomendadas: para FP16, una NVIDIA A100 (40 GB), RTX A6000 (48 GB) o RTX 4090 (24 GB) son suficientes. Para cuantización, una RTX 3090 (24 GB) o RTX 4070 (12 GB) pueden bastar.
- En consumer GPU: sí, es viable en RTX 3090/4090 con cuantización 8-bit o 4-bit, aunque la velocidad será menor que en GPUs de datacenter.
- Opciones de despliegue: vLLM (recomendado por el autor), Transformers con generate, y compatible con TGI y llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no se han publicado datos específicos. Con vLLM en una A100, se puede esperar un throughput de decenas de tokens por segundo para generación de 2K tokens, pero no hay cifras oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| MiLMMT-46-12B-v1.0 | 12B | 46 | No disp. (Gemma3) | Gemma | Traduccion LLM |
| NLLB-200 (Meta) | 600M-54B | 200 | 512 tokens | CC-BY-NC | Traduccion clasica |
| M2M-100 (Meta) | 418M-12B | 100 | 1024 tokens | MIT | Traduccion clasica |
| Aya-101 (Cohere) | 13B | 101 | 2048 tokens | CC-BY-NC | Traduccion y generacion |

MiLMMT se diferencia de NLLB y M2M por ser un LLM de propósito general, no un modelo de traducción puro. Frente a Aya-101, cubre menos idiomas pero ofrece una licencia más permisiva (Gemma vs CC-BY-NC) y un enfoque de post-entrenamiento sin referencias. No se dispone de comparativas de rendimiento numéricas.

## Limitaciones y advertencias

- Solo soporta los 46 idiomas listados; la calidad de traducción no está garantizada para otros idiomas, según el propio autor.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez en dominios especializados.
- El modelo puede alucinar contenido en traducciones ambiguas o con poco contexto, especialmente en idiomas con menos datos de entrenamiento.
- La licencia Gemma permite uso comercial, pero impone restricciones sobre el uso de las marcas de Google y la redistribución de pesos modificados; se recomienda revisar los términos completos.
- No se documentan capacidades de visión o tool calling, a pesar del tag "image-text-to-text" en HuggingFace; su uso principal es traducción de texto.
- El contexto máximo no está confirmado para este modelo específico; si se hereda de Gemma3-12B, sería de 128K tokens, pero no hay garantía tras el fine-tuning.

## Enlaces

- HuggingFace: https://huggingface.co/xiaomi-research/MiLMMT-46-12B-v1.0
- Modelo base v0.1: https://huggingface.co/xiaomi-research/MiLMMT-46-12B-v0.1
- Repositorio GitHub: https://github.com/xiaomi-research/gemmax
- Artículo arXiv (v1.0): https://arxiv.org/abs/2608.10812
- Artículo arXiv (v0.1): https://arxiv.org/abs/2608.10812 (referencia en GitHub, no verificado)
- Despliegue en FriendliAI: https://friendli.ai/models/xiaomi-research/MiLMMT-46-12B-v1.0
