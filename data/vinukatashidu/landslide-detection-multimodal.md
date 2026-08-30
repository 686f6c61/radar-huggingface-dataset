# vinukatashidu/landslide-detection-multimodal

## Resumen

El modelo `vinukatashidu/landslide-detection-multimodal` es un sistema de visión por computadora diseñado para predecir deslizamientos de tierra a partir de imágenes satelitales de Sentinel-2 y datos de terreno SRTM. Desarrollado por Tashidu Vinuka (usuario `vinukatashidu`), el modelo emplea una arquitectura de fusión tardía que combina un ResNet50 para las bandas RGB con una CNN personalizada para canales de terreno (NIR, DEM y pendiente). El repositorio, con un tamaño de 0,1 GB, contiene los pesos entrenados y el código de inferencia, y está orientado a la detección de deslizamientos asociados al ciclón ciclónico Ditwah (2025) en Sri Lanka, con datos proporcionados por el Arthur C. Clarke Institute for Modern Technologies.

El modelo acepta un tensor de 6 canales de 224×224 píxeles, correspondientes a las bandas B4, B3, B2, B8, DEM y Slope, y produce una probabilidad de deslizamiento con un umbral óptimo de 0,291. Su relevancia radica en ofrecer una herramienta ligera y reproducible para el monitoreo de desastres naturales, aunque su alcance se limita a un evento geográfico específico y a un conjunto de datos reducido.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet50 (RGB) + CNN personalizada (terreno) con fusión tardía |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 6×224×224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del modelo; no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (probablemente PyTorch .pth, no se especifica en la model card) |

## Arquitectura y entrenamiento

La arquitectura combina dos ramas independientes: una utiliza un ResNet50 preentrenado para procesar las bandas RGB (B4, B3, B2), mientras que la segunda emplea una CNN personalizada para los canales de terreno (B8/NIR, DEM y pendiente). Ambas ramas se fusionan en una etapa tardía para generar una predicción binaria de deslizamiento. No se especifican detalles sobre el número de parámetros, la profundidad de la CNN personalizada ni el proceso de entrenamiento (épocas, optimizador, función de pérdida). El dataset proviene de los deslizamientos del ciclón Ditwah (2025) y fue facilitado por el Arthur C. Clarke Institute for Modern Technologies, lo que limita la diversidad geográfica y climática de los datos de entrenamiento. No se menciona el uso de técnicas como aumentación de datos, regularización o ajuste fino adicional.

## Capacidades

- Detección binaria de deslizamientos de tierra en parches de imágenes satelitales de 224×224.
- Procesamiento multimodal de bandas ópticas (RGB) y datos de terreno (NIR, DEM, pendiente).
- Inferencia sobre tensores de 6 canales, lo que permite integrar información espectral y topográfica.
- Salida probabilística con umbral ajustable (el óptimo reportado es 0,291) para calibrar sensibilidad/especificidad.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas; es exclusivamente un modelo de visión.

## Casos de uso

- Monitoreo de riesgos en tiempo real: el modelo puede procesar imágenes Sentinel-2 y datos SRTM de áreas propensas a deslizamientos, generando mapas de probabilidad que alerten a las autoridades locales. Su bajo coste computacional permite ejecutarlo en estaciones de trabajo con GPU básicas.
- Evaluación post-desastre: tras un evento como un ciclón o lluvias intensas, el modelo puede identificar rápidamente zonas afectadas a partir de imágenes satelitales recientes, ayudando a priorizar labores de rescate y evaluación de daños.
- Planificación territorial: los mapas de susceptibilidad generados por el modelo pueden integrarse en sistemas de información geográfica (SIG) para identificar áreas de alto riesgo antes de construir infraestructuras críticas.
- Investigación en teledetección: sirve como referencia para comparar enfoques de fusión tardía frente a otras arquitecturas (U-Net, DeepLabv3+) en detección de deslizamientos, gracias a su implementación en PyTorch y su licencia MIT.
- Educación y demostración: al ser un modelo pequeño y con código de entrenamiento disponible, es adecuado para cursos de deep learning aplicado a ciencias de la Tierra, mostrando un caso real de fusión multimodal.
- Prototipado de sistemas de alerta temprana: puede integrarse en pipelines que combinen datos meteorológicos y de satélite para emitir avisos automáticos, aunque su precisión limitada (AUC 0,7371) requiere validación adicional antes de uso operacional.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el dataset de evaluación (no se especifica el tamaño ni la composición de este conjunto):

| Metrica | Valor |
|---|---|
| Recall | 91 % |
| ROC-AUC | 0,7371 |
| Umbral óptimo | 0,291 |

No se han publicado comparaciones con otros modelos de detección de deslizamientos en la información disponible. Los valores indican una sensibilidad alta pero una discriminación moderada, lo que sugiere posibles falsos positivos en contextos geográficos diferentes al de entrenamiento.

## Requisitos de hardware

- Dado el tamaño del repositorio (0,1 GB) y la arquitectura ResNet50 con entrada 224×224, la inferencia requiere muy poca VRAM: estimación aproximada de 1-2 GB en precisión FP32, y menos de 0,5 GB en cuantización INT8 (aunque no se proporcionan pesos cuantizados).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060, o superiores). También es viable la inferencia en CPU para lotes pequeños.
- El modelo puede desplegarse con PyTorch estándar, exportarse a ONNX para aceleración en CPU/GPU, o convertirse a TensorRT si se requiere baja latencia.
- No se han publicado mediciones de latencia o throughput. Para una sola imagen, se espera una inferencia en milisegundos en GPU moderna.
- Opciones de despliegue: scripts de Python con PyTorch, o integración en servicios como TorchServe o FastAPI para API REST.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen enfoques alternativos en la literatura (p. ej., DeepLabv3+ mejorado con fusión multimodal, o U-Net para segmentación de deslizamientos) pero no se han encontrado datos cuantitativos que permitan una comparación directa con este modelo. Por tanto, la comparativa se limita a señalar que la arquitectura aquí presentada es más ligera que los modelos de segmentación densa, pero ofrece solo clasificación a nivel de parche, no segmentación píxel a píxel.

## Limitaciones y advertencias

- El modelo fue entrenado exclusivamente con datos de deslizamientos del ciclón Ditwah (2025) en Sri Lanka, por lo que su generalización a otras regiones, climas o tipos de suelo es incierta y probablemente deficiente.
- La baja ROC-AUC (0,7371) indica una capacidad discriminativa limitada; en producción podrían producirse tanto falsos positivos como falsos negativos, especialmente con umbrales distintos al óptimo.
- No se ha evaluado el sesgo del modelo respecto a variables geográficas, estacionales o de cobertura del suelo; no hay información sobre la diversidad del dataset de entrenamiento.
- El modelo no es un sistema de alerta temprana validado; su uso operativo debe ir acompañado de validación externa y calibración con datos locales.
- La licencia MIT permite uso comercial y modificación, pero los datos subyacentes (Sentinel-2 y SRTM) tienen sus propias licencias de uso; el dataset de deslizamientos proporcionado por el instituto puede tener restricciones adicionales no documentadas.
- No se proporcionan pesos preentrenados en formatos estándar como safetensors o GGUF; la interoperabilidad con frameworks como TensorFlow o ONNX requiere conversión manual.
- La documentación no especifica la versión de PyTorch ni las dependencias exactas, lo que puede complicar la reproducción del entorno.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vinukatashidu/landslide-detection-multimodal
- Perfil del autor: https://huggingface.co/vinukatashidu
- Artículo relacionado sobre detección de deslizamientos con DeepLabv3+ (Nature): https://www.nature.com/articles/s41598-025-31208-6
- Revisión de IA y teledetección para deslizamientos (MDPI): https://www.mdpi.com/2072-4292/16/16/2947
- Paper sobre sistema multimodal de detección y predicción de deslizamientos (IEEE, vía Scribd): https://www.scribd.com/document/1063716628/Multimodal-Landslide-Detection-Paper-IEEE-1773656745273
- Artículo sobre enfoques multimodales con LLMs para análisis de deslizamientos (Wiley): https://onlinelibrary.wiley.com/doi/abs/10.1111/mice.13482
