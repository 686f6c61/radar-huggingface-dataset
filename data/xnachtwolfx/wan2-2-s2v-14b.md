# xnachtwolfx/Wan2.2-S2V-14B

## Resumen

Wan2.2-S2V-14B es un modelo de generación de vídeo dirigido por audio, desarrollado por el equipo Wan-AI y presentado en el artículo técnico *Wan-S2V: Audio-Driven Cinematic Video Generation* (arXiv:2508.18621). El modelo convierte una imagen de entrada y una pista de audio (voz, canto, efectos) en un vídeo cinematográfico sincronizado, con control sobre la identidad del personaje, los movimientos corporales y la cámara. Está construido sobre la arquitectura Wan2.2, que incorpora una mezcla de expertos (MoE) en el proceso de difusión, separando el ruido en pasos temporales con expertos especializados para aumentar la capacidad del modelo sin elevar el coste computacional.

Este modelo concreto, publicado bajo licencia Apache 2.0, tiene 16,3 mil millones de parámetros en total (según los pesos safetensors) y es capaz de generar vídeo a 480P y 720P a 24 fps. Su relevancia actual radica en que es uno de los primeros modelos abiertos que abordan la animación de personajes con calidad cinematográfica a partir de audio, superando en las evaluaciones del equipo a alternativas como Hunyuan-Avatar y Omnihuman en escenarios complejos de interacción entre personajes y movimiento de cámara. El repositorio en HuggingFace es una copia del usuario xnachtwolfx, mientras que la versión oficial se encuentra en Wan-AI/Wan2.2-S2V-14B.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) sobre base Wan2.2, pipeline de difusión para vídeo |
| Parámetros totales | 16.295.755.609 (16,3 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (modelo de vídeo, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | es (según metadata del repo; el modelo original soporta más idiomas, no confirmado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de difusión de Wan2.2, que incorpora una mezcla de expertos (MoE) en el proceso de denoising: cada paso temporal cuenta con expertos especializados que aumentan la capacidad total del modelo sin incrementar el coste de inferencia. La variante S2V (Speech-to-Video) añade una rama de codificación de audio que condiciona el generador de vídeo, permitiendo sincronizar labios, gestos y movimientos con la pista de audio de entrada. Según la documentación, el entrenamiento se realizó sobre un conjunto de datos significativamente mayor que el de Wan2.1, con un aumento del 65,6 % en imágenes y del 83,2 % en vídeos, lo que mejora la generalización en movimientos, semántica y estética. El modelo emplea el VAE de Wan2.2 con una compresión de 16×16×4, lo que permite generar vídeos de alta resolución de forma eficiente.

No se especifican en la información disponible los detalles exactos del dataset de entrenamiento, el número de tokens, ni si se utilizaron técnicas de alineación como RLHF o DPO. El artículo técnico (arXiv:2508.18621) proporciona más información, pero no se ha extraído en esta ficha.

## Capacidades

- Generación de vídeo a partir de una imagen y una pista de audio, sincronizando el movimiento de los labios y las expresiones faciales con la voz o el canto.
- Control de identidad del personaje mediante una imagen de referencia.
- Movimiento corporal realista y dinámica de cámara de nivel cinematográfico.
- Soporte de generación de vídeo en resoluciones 480P y 720P a 24 fps.
- Posibilidad de edición de lip-sync en vídeos existentes, según se menciona en el artículo.
- Generación de vídeo de larga duración (aunque la duración máxima no se especifica en los datos disponibles).
- Integración con el ecosistema de difusores (Diffusers) y con ComfyUI, lo que facilita su uso en flujos de trabajo existentes.

## Casos de uso

- Doblaje y localización de contenido audiovisual: el modelo puede re-sincronizar los labios de un personaje con una nueva pista de audio, permitiendo doblar vídeos en diferentes idiomas sin necesidad de regrabar escenas.
- Producción de vídeos publicitarios personalizados: a partir de una imagen del producto o de un actor y un guion hablado, se genera un vídeo con movimiento y gestos adecuados para campañas cortas.
- Creación de avatares para asistentes virtuales: con una imagen fija del avatar y un audio de voz, se puede generar un vídeo animado para chat en vídeo o presentaciones.
- Generación de contenido educativo y tutoriales: se puede crear un vídeo de un instructor virtual hablando sobre un tema a partir de una imagen y un audio de narración.
- Postproducción de vídeo: corrección de sincronía de labios en tomas reales, donde el modelo ajusta la boca del actor a un diálogo reemplazado.
- Prototipado de escenas para cine y animación: los directores pueden generar previsualizaciones animadas de personajes con movimientos y diálogos antes de la producción final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo técnico menciona comparaciones cualitativas y cuantitativas con Hunyuan-Avatar y Omnihuman, indicando una superioridad del modelo, pero no se han incluido los valores numéricos en las fuentes consultadas.

## Requisitos de hardware

- No se dispone de datos oficiales de VRAM para este modelo concreto. El modelo base Wan2.2 de 5B puede ejecutarse en una RTX 4090, pero el S2V-14B es significativamente mayor (16,3 B de parámetros), por lo que se recomienda al menos una GPU con 24 GB de VRAM en cuantización FP16, y probablemente más para resolución 720P.
- Para inferencia con Diffusers, se necesita una GPU con suficiente memoria para el modelo completo. No se indica el tamaño exacto de los tensores.
- Se puede desplegar con los pipelines de Diffusers, así como en ComfyUI (integración oficial para Wan2.2).
- No hay información sobre latencia o throughput en las fuentes consultadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wan2.2-S2V-14B (este) | 16,3 B (MoE) | Diffusión + audio | 480P/720P @24fps | Apache-2.0 | HuggingFace, ModelScope |
| Hunyuan-Avatar | no disponible | no disponible | no disponible | no disponible | no disponible |
| Omnihuman | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de especificaciones de Hunyuan-Avatar ni Omnihuman en las fuentes. Según el artículo, Wan2.2-S2V supera a ambos en calidad cinematográfica y expresividad, pero no se ofrecen datos concretos.

## Limitaciones y advertencias

- El modelo es generativo y puede producir artefactos visuales o inconsistencias en escenas complejas, especialmente en movimientos rápidos o interacciones entre múltiples personajes.
- La sincronización de audio y vídeo puede degradarse en entornos con ruido de fondo o voces solapadas.
- No se especifica la duración máxima del vídeo generado; la generación de vídeos largos puede requerir fragmentación.
- Aunque la licencia es Apache-2.0, el uso comercial debe cumplir con los términos de la licencia y con las políticas de uso de los modelos de Wan-AI (consultar la documentación oficial).
- El repositorio de HuggingFace es una copia de un usuario (xnachtwolfx) y no la oficial; se recomienda descargar los pesos desde Wan-AI/Wan2.2-S2V-14B para garantizar la integridad de los archivos.
- No se ha publicado información sobre sesgos o alucinaciones específicas; como modelo generativo, puede producir contenido no deseado si el prompt de audio o imagen es ambiguo.

## Enlaces

- Repositorio oficial de Wan-AI: https://huggingface.co/Wan-AI/Wan2.2-S2V-14B
- Repositorio espejo (xnachtwolfx): https://huggingface.co/xnachtwolfx/Wan2.2-S2V-14B
- ModelScope: https://www.modelscope.cn/models/Wan-AI/Wan2.2-S2V-14B
- Paper Wan-S2V: https://huggingface.co/papers/2508.18621
- Paper Wan2.2 base: https://arxiv.org/abs/2503.20314
- Página del proyecto: https://humanaigc.github.io/wan-s2v-webpage
- Código en GitHub: https://github.com/Wan-Video/Wan2.2
- Página oficial de Wan: https://wan.video
- Blog de Wan2.2: https://wan.video/welcome
- Espacio Gradio en HuggingFace: https://huggingface.co/spaces/Wan-AI/Wan2.2-S2V
- Guía de usuario en inglés: https://alidocs.dingtalk.com/i/nodes/EpGBa2Lm8aZxe5myC99MelA2WgN7R35y
- Guía de usuario en chino: https://alidocs.dingtalk.com/i/nodes/jb9Y4gmKWrx9eo4dCql9LlbYJGXn6lpz
