# TechnoBaptist/LongCat-Video

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo desarrollado por Meituan LongCat, con 13.600 millones de parámetros. Unifica en una sola arquitectura tres tareas: texto-a-vídeo, imagen-a-vídeo y continuación de vídeo (video-continuation). Su rasgo diferencial es la generación de vídeos largos de varios minutos sin deriva de color ni degradación de calidad, gracias a un preentrenamiento nativo en la tarea de continuación de vídeo.

El modelo se distribuye en formato diffusers/safetensors bajo licencia MIT, con soporte para inglés y chino. Emplea una estrategia de generación de grueso a fino (coarse-to-fine) en los ejes temporal y espacial, junto con Block Sparse Attention para mejorar la eficiencia a altas resoluciones, y genera vídeo a 720p y 30 fps en cuestión de minutos.

La relevancia actual del modelo reside en su posicionamiento como paso hacia los llamados "world models": un único modelo que cubre múltiples tareas de generación de vídeo con rendimiento comparable a soluciones comerciales, según las evaluaciones del autor. El repositorio de Hugging Face que se documenta aquí es una réplica (TechnoBaptist/LongCat-Video) del modelo original publicado por Meituan LongCat.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video con Block Sparse Attention y generacion coarse-to-fine temporal y espacial (detalle completo no disponible) |
| Parametros totales | 13.6B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

LongCat-Video es un modelo de difusión para generación de vídeo de 13.6B parámetros. La arquitectura incorpora Block Sparse Attention, que mejora la eficiencia especialmente a resoluciones altas, y una estrategia de generación de grueso a fino a lo largo de los ejes temporal y espacial, lo que permite producir vídeo a 720p y 30 fps en minutos. El modelo está preentrenado de forma nativa en la tarea de continuación de vídeo, lo que habilita la generación de vídeos de varios minutos sin deriva de color ni pérdida de calidad.

En cuanto al entrenamiento, el autor indica el uso de RLHF con múltiples recompensas mediante Group Relative Policy Optimization (GRPO). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni otros detalles del pipeline de datos. El informe técnico referencia el paper arXiv:2510.22200 para más detalle.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Continuación de vídeo (video-continuation) sobre un vídeo existente.
- Generación de vídeo largo de varios minutos sin deriva de color ni degradación de calidad.
- Generación interactiva de vídeo (demo interactiva incluida en el repositorio original).
- Salida a 720p y 30 fps.
- Soporte multilingüe de prompts en inglés y chino.
- Inferencia multi-GPU mediante context parallel.
- No se documenta soporte de tool calling ni de agentes; no aplica a un modelo de generación de vídeo.

## Casos de uso

- Generación de clips publicitarios a partir de texto: el modelo produce vídeo a 720p y 30 fps en minutos, adecuado para prototipado rápido de creatividades sin rodaje.
- Animación de imágenes fijas para redes sociales: la tarea image-to-video permite convertir una fotografía o ilustración en un clip animado manteniendo la composición original.
- Extensión de metraje existente: la continuación de vídeo permite alargar tomas grabadas o generadas previamente, útil en postproducción para rellenar planos o crear transiciones largas.
- Generación de vídeo de formato largo para narrativa o documental: la capacidad nativa de vídeo largo sin deriva de color permite construir secuencias de varios minutos de forma coherente.
- Creación de contenido interactivo: la demo de generación interactiva posibilita flujos donde el usuario guía la generación de vídeo en tiempo de ejecución.
- Prototipado en investigación sobre world models: el modelo sirve como base para experimentos de modelado del mundo y generación de vídeo fundacional, dado su enfoque unificado de tareas.
- Producción de material en inglés y chino: los prompts en ambos idiomas permiten generar contenido localizado para mercados anglófono y sinófono.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que, según evaluaciones internas y públicas del autor, el modelo alcanza un rendimiento comparable a los principales modelos open source de generación de vídeo y a soluciones comerciales recientes, pero no se incluyen cifras concretas en la información proporcionada.

## Requisitos de hardware

- El repositorio ocupa 83.3 GB, lo que da una idea del peso de los pesos en precisión completa; la VRAM necesaria para inferencia no se detalla en la información disponible.
- El autor documenta inferencia en una sola GPU y en múltiples GPU mediante `torchrun --nproc_per_node=2 --context_parallel_size=2`; no se especifican modelos de GPU concretos (A100, H100, RTX 4090) en la información disponible.
- No se confirma que el modelo quepa en GPU de consumo; el tamaño de 13.6B parámetros y el peso del repositorio sugieren requisitos elevados, pero no hay dato oficial.
- Dependencias de despliegue indicadas: PyTorch 2.6.0 con CUDA 12.4, FlashAttention-2 (2.7.4.post1) por defecto, con opción de FlashAttention-3 o xformers, y Streamlit para la demo interactiva.
- Latencia y throughput: el autor afirma generación de vídeo 720p a 30 fps "en minutos", sin cifras exactas de latencia ni throughput por GPU.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos concretos (parámetros, contexto, benchmarks) de modelos alternativos comparables, por lo que la comparativa cuantitativa no está disponible. Como referencia cualitativa, la model card sitúa a LongCat-Video en rendimiento comparable a los principales modelos open source de generación de vídeo y a soluciones comerciales recientes, pero sin cifras que permitan una tabla comparativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo generativo de vídeo, puede reproducir sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación visual: no evaluado en la información disponible; la generación de vídeo puede producir contenido incoherente o no fiel al prompt.
- Idiomas: solo se declaran inglés y chino; el rendimiento en otros idiomas no está garantizado.
- Licencia MIT: permite uso comercial, pero conviene revisar el fichero LICENSE del repositorio original para confirmar condiciones.
- El repositorio documentado (TechnoBaptist/LongCat-Video) es una réplica con 0 descargas y 0 likes; el modelo original y mantenido por el autor es meituan-longcat/LongCat-Video, por lo que se recomienda usar este último para producción.
- Requisitos de hardware elevados: el tamaño del repositorio (83.3 GB) y las dependencias (FlashAttention-2, CUDA 12.4, PyTorch 2.6.0) implican un entorno de despliegue exigente.
- No se documentan límites de resolución, duración máxima de vídeo ni restricciones de uso más allá de la licencia.

## Enlaces

- Repositorio documentado en Hugging Face: https://huggingface.co/TechnoBaptist/LongCat-Video
- Modelo original del autor: https://huggingface.co/meituan-longcat/LongCat-Video
- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Paper (arXiv): https://huggingface.co/papers/2510.22200
- Repositorio GitHub: https://github.com/meituan-longcat/LongCat-Video
- Licencia: https://huggingface.co/meituan-longcat/LongCat-Video/blob/main/LICENSE
- Twitter/X del proyecto: https://x.com/Meituan_LongCat
