# thsiam/LongCat-Video

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo desarrollado por Meituan LongCat, con 13.600 millones de parámetros, publicado bajo licencia MIT. Resuelve tres tareas dentro de un único marco generativo: texto a vídeo (text-to-video), imagen a vídeo (image-to-video) y continuación de vídeo (video-continuation), y destaca especialmente en la generación de vídeos largos de varios minutos sin deriva de color ni degradación de calidad. Se distribuye a través de la librería diffusers y del repositorio oficial en GitHub, con pesos en formato safetensors.

El modelo emplea una estrategia de generación de grueso a fino (coarse-to-fine) sobre los ejes temporal y espacial, junto con Block Sparse Attention para mantener la eficiencia a resoluciones altas. Según la model card, es capaz de generar vídeo a 720p y 30 fps en cuestión de minutos. El entrenamiento incorpora RLHF con múltiples recompensas mediante Group Relative Policy Optimization (GRPO).

Es relevante ahora porque representa un paso hacia los denominados "world models" y porque unifica en un solo modelo tareas que habitualmente requieren arquitecturas separadas, con un rendimiento que el autor sitúa a la altura de los principales modelos abiertos de generación de vídeo y de soluciones comerciales recientes. El repositorio ocupa 83,3 GB y el modelo se publicó en noviembre de 2026.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para generación de vídeo (unificado para T2V, I2V y continuación de vídeo); detalles internos no disponibles |
| Parámetros totales | 13,6 B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; el repo no detalla variantes GGUF/FP8) |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LongCat-Video es un modelo de generación de vídeo de 13.600 millones de parámetros que unifica las tareas de texto a vídeo, imagen a vídeo y continuación de vídeo en un único marco. La generación sigue una estrategia de grueso a fino a lo largo de los ejes temporal y espacial, lo que permite producir vídeo a 720p y 30 fps en pocos minutos. La eficiencia a alta resolución se apoya en Block Sparse Attention. El modelo está preentrenado de forma nativa en la tarea de continuación de vídeo, lo que le permite generar vídeos de varios minutos sin deriva de color ni pérdida de calidad.

El ajuste final emplea RLHF con múltiples recompensas mediante Group Relative Policy Optimization (GRPO). La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni los detalles internos de la arquitectura más allá de lo indicado; esa información debe consultarse en el informe técnico (arXiv:2510.22200). La inferencia admite FlashAttention-2 (por defecto), FlashAttention-3 o xformers, e incluye paralelismo de contexto para ejecución multi-GPU.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Continuación de vídeo (video-continuation) a partir de un clip existente.
- Generación de vídeo largo: vídeos de varios minutos sin deriva de color ni degradación de calidad.
- Generación interactiva de vídeo (demo `run_demo_interactive_video.py`).
- Salida a 720p y 30 fps.
- Soporte multilingüe de indicaciones en inglés y chino.
- Inferencia en una o varias GPU mediante paralelismo de contexto.
- Integración con la librería diffusers y con Transformers.
- Interfaz de demostración con Streamlit.
- No se documentan en la información disponible capacidades de tool calling, agentes, audio ni visión más allá de la entrada de imagen para image-to-video.

## Casos de uso

- Producción de vídeo publicitario y de redes sociales: el modelo genera clips a 720p y 30 fps en minutos, lo que permite iterar sobre variaciones de un anuncio a partir de indicaciones de texto sin depender de un equipo de rodaje.
- Previsualización de guiones y storyboards: a partir de una imagen clave (fotograma o ilustración) se genera image-to-video para animar la escena y validar el ritmo antes de la producción final.
- Extensión de metraje existente: la tarea de video-continuation permite alargar un clip grabado o generado, útil para completar planos o generar transiciones de varios minutos sin cortes visibles.
- Creación de contenido de formato largo: la generación de vídeo largo sin deriva de color encaja en piezas educativas, documentales breves o contenido para streaming que requieren continuidad visual sostenida.
- Prototipado interactivo en estudios de diseño: la demo interactiva y la interfaz Streamlit permiten a diseñadores probar indicaciones y encadenar generaciones en tiempo casi real.
- Generación de material para investigación en modelos del mundo: al ser un paso hacia los world models, sirve como base para experimentos de simulación visual y generación de entornos sintéticos.
- Localización de contenido: el soporte de indicaciones en inglés y chino facilita generar variantes de un mismo vídeo para mercados anglófono y sinófono.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica que, según evaluaciones internas y públicas, el modelo alcanza un rendimiento comparable a los principales modelos abiertos de generación de vídeo y a soluciones comerciales recientes, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 13,6 B de parámetros, los pesos en precisión completa rondarían decenas de GB; el repositorio completo ocupa 83,3 GB, lo que da una idea del espacio en disco necesario.
- GPU recomendadas: no especificadas en la información disponible. El código soporta FlashAttention-2/3 y xformers, y ejecución multi-GPU con paralelismo de contexto (`--context_parallel_size`).
- ¿Cabe en GPU de consumo? No confirmado. Por el tamaño del modelo y la resolución de salida (720p, 30 fps), es previsible que requiera GPU de centro de datos, pero no hay datos oficiales que lo confirmen.
- Opciones de despliegue: scripts oficiales con `torchrun` (texto a vídeo, imagen a vídeo, continuación, vídeo largo e interactivo), interfaz Streamlit, y compatibilidad declarada con diffusers y Transformers.
- Latencia y throughput: la model card afirma que genera vídeo a 720p y 30 fps "en minutos", sin cifras exactas de latencia ni de throughput por GPU.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos numéricos ni especificaciones de modelos alternativos que permitan una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo generativo entrenado con datos a gran escala, es previsible que reproduzca sesgos presentes en esos datos.
- Riesgo de alucinación visual: no cuantificado; la generación de vídeo puede producir artefactos, incoherencias físicas o contenido no fiel a la indicación.
- Idiomas: solo se declaran inglés y chino; el rendimiento con indicaciones en castellano no está documentado.
- Licencia: MIT, permisiva para uso comercial, pero conviene revisar el archivo LICENSE del repositorio oficial por si incluye condiciones adicionales sobre los pesos o los datos.
- Producción: no se publican cifras de benchmarks ni de latencia, lo que dificulta dimensionar infraestructura; el tamaño del repositorio (83,3 GB) y la resolución de salida implican requisitos de hardware elevados.
- El repositorio consultado (thsiam/LongCat-Video) figura con 0 descargas y 0 likes y parece una réplica; la fuente canónica es el repositorio de meituan-longcat.
- La información sobre cuantizaciones, contexto y detalles de arquitectura es escasa; para producción conviene consultar el informe técnico.

## Enlaces

- Repositorio en Hugging Face (réplica): https://huggingface.co/thsiam/LongCat-Video
- Repositorio oficial en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Video
- Informe técnico (arXiv): https://huggingface.co/papers/2510.22200
- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Repositorio en GitHub: https://github.com/meituan-longcat/LongCat-Video
- Licencia: https://huggingface.co/meituan-longcat/LongCat-Video/blob/main/LICENSE
- Cuenta de X (Twitter): https://x.com/Meituan_LongCat
