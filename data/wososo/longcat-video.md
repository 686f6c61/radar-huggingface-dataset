# Wososo/LongCat-Video

## Resumen

LongCat-Video es un modelo fundacional de generación de vídeo desarrollado por Meituan LongCat, con 13.600 millones de parámetros. Está diseñado para cubrir de forma unificada tres tareas: texto a vídeo (text-to-video), imagen a vídeo (image-to-video) y continuación de vídeo (video-continuation). Su principal diferenciador es la generación de vídeos largos de varios minutos sin degradación de calidad ni deriva de color, gracias a un entrenamiento nativo en la tarea de continuación de vídeo.

El modelo emplea una estrategia de generación de grueso a fino (coarse-to-fine) sobre los ejes temporal y espacial, junto con Block Sparse Attention para mejorar la eficiencia a resoluciones altas. Según la model card, es capaz de generar vídeo a 720p y 30 fps en cuestión de minutos, y ha sido ajustado con RLHF multi-recompensa mediante Group Relative Policy Optimization (GRPO).

La relevancia actual del modelo radica en su enfoque hacia los denominados "world models": un único modelo que unifica varias tareas de generación de vídeo y que apunta a la generación de contenido de larga duración de forma eficiente. Se distribuye con licencia MIT y pesos en formato safetensors para la librería diffusers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión para vídeo; detalles en el informe técnico) |
| Parámetros totales | 13,6 B |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que LongCat-Video es un modelo de generación de vídeo de 13,6 B de parámetros que unifica las tareas de texto a vídeo, imagen a vídeo y continuación de vídeo en un único marco generativo. Emplea una estrategia de generación de grueso a fino a lo largo de los ejes temporal y espacial, y utiliza Block Sparse Attention para mejorar la eficiencia, especialmente a resoluciones altas. El modelo está preentrenado de forma nativa en la tarea de continuación de vídeo, lo que le permite producir vídeos de varios minutos sin deriva de color ni pérdida de calidad.

En cuanto al ajuste, la model card menciona un entrenamiento con RLHF multi-recompensa basado en Group Relative Policy Optimization (GRPO). No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni otras innovaciones técnicas más allá de las citadas. Para más detalle se remite al informe técnico (arXiv:2510.22200).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video).
- Generación de vídeo a partir de una imagen (image-to-video).
- Continuación de vídeo (video-continuation) a partir de un vídeo de entrada.
- Generación de vídeo largo de varios minutos sin deriva de color ni degradación de calidad.
- Generación interactiva de vídeo (demo interactiva incluida en el repositorio).
- Generación a 720p y 30 fps en cuestión de minutos mediante estrategia coarse-to-fine.
- Soporte multilingüe de prompts en inglés y chino.
- Inferencia en una o varias GPU mediante paralelismo de contexto (context parallel).

## Casos de uso

- Generación de clips publicitarios a partir de un brief de texto: el modelo produce vídeo a 720p y 30 fps en minutos, adecuado para iterar rápidamente sobre conceptos creativos antes de la producción final.
- Animación de imágenes fijas para redes sociales: la tarea image-to-video permite dar movimiento a una fotografía o ilustración, útil para creadores de contenido que necesitan piezas animadas sin rodaje.
- Extensión de metraje existente: la capacidad de video-continuation permite alargar un clip grabado o generado previamente sin cortes visibles ni cambios de color, útil en posproducción.
- Generación de vídeo de larga duración para fondos y entornos: la generación de vídeos de varios minutos sin degradación sirve para crear loops o fondos animados en instalaciones, pantallas o entornos virtuales.
- Prototipado de secuencias en preproducción audiovisual: guionistas y directores pueden convertir descripciones textuales en storyboards animados para validar planos y ritmo antes de rodar.
- Creación de contenido para demos de producto: a partir de una imagen del producto, generar un vídeo de presentación con movimiento para páginas de venta o vídeos explicativos.
- Exploración interactiva de conceptos visuales: la demo interactiva del repositorio permite iterar sobre prompts y continuaciones en tiempo de ejecución para sesiones de ideación.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card afirma que, según evaluaciones internas y públicas, el modelo alcanza un rendimiento comparable a los principales modelos de generación de vídeo de código abierto y a soluciones comerciales recientes, pero no se incluyen cifras concretas.

## Requisitos de hardware

- El repositorio ocupa 83,3 GB, lo que da una idea del espacio en disco necesario para alojar los pesos completos.
- Se recomienda una GPU con suficiente VRAM para un modelo de 13,6 B parámetros en precisión de inferencia; el valor exacto de VRAM no está disponible en la información proporcionada.
- La model card documenta inferencia en una sola GPU y en varias GPU mediante `--context_parallel_size`, lo que permite repartir la carga entre varias tarjetas.
- No se especifican modelos de GPU concretos (A100, H100, RTX 4090) ni si cabe en GPU de consumo; no disponible.
- Opciones de despliegue: scripts de inferencia del repositorio oficial (text-to-video, image-to-video, video-continuation, vídeo largo e interactivo) y una interfaz Streamlit. La librería declarada es diffusers.
- Se requiere FlashAttention-2 (habilitada por defecto), con opción de FlashAttention-3 o xformers. Entorno de referencia: Python 3.10, PyTorch 2.6.0 con CUDA 12.4.
- Latencia y throughput estimados: la model card indica generación de 720p a 30 fps "en minutos", sin cifras más precisas; no disponible.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos numéricos ni de especificaciones de modelos comparables que permitan una comparación rigurosa. La model card menciona de forma genérica que el rendimiento es comparable a los principales modelos de generación de vídeo de código abierto y a soluciones comerciales recientes, pero sin nombrarlos ni aportar cifras.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| LongCat-Video | 13,6 B | no disponible | MIT | Hugging Face (diffusers, safetensors) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; como modelo generativo entrenado con datos a gran escala, es previsible que herede sesgos de esos datos.
- Riesgo de alucinación visual: como modelo generativo de vídeo, puede producir contenido incoherente o no fiel al prompt; no se aportan métricas de fidelidad.
- Idiomas: la model card solo declara soporte de inglés y chino; el rendimiento con prompts en castellano no está garantizado ni documentado.
- La licencia MIT permite uso comercial, pero conviene revisar el archivo LICENSE del repositorio y las condiciones de los datos de entrenamiento, no detalladas en la información disponible.
- Requisitos de hardware elevados: el repositorio de 83,3 GB y el tamaño del modelo implican infraestructura con GPU de alta capacidad; no se confirma viabilidad en GPU de consumo.
- Dependencias específicas: requiere versiones concretas de PyTorch, CUDA y FlashAttention, lo que puede complicar el despliegue en entornos ya existentes.
- El repositorio de Hugging Face consultado (Wososo/LongCat-Video) registra 0 descargas y 0 likes y apunta como modelo oficial al repositorio meituan-longcat/LongCat-Video; conviene descargar los pesos desde el repositorio oficial para garantizar integridad.

## Enlaces

- Modelo en Hugging Face (copia consultada): https://huggingface.co/Wososo/LongCat-Video
- Modelo oficial en Hugging Face: https://huggingface.co/meituan-longcat/LongCat-Video
- Informe técnico (arXiv): https://huggingface.co/papers/2510.22200
- Página del proyecto: https://meituan-longcat.github.io/LongCat-Video/
- Repositorio de código: https://github.com/meituan-longcat/LongCat-Video
- Licencia: https://huggingface.co/meituan-longcat/LongCat-Video/blob/main/LICENSE
- Cuenta de X (Twitter) del proyecto: https://x.com/Meituan_LongCat
