# ZhengPeng7/BiRefNet-portrait

## Resumen

BiRefNet-portrait es un modelo de segmentación de imágenes especializado en el recorte de retratos (portrait matting), desarrollado por Peng Zheng y colaboradores en el marco del proyecto BiRefNet (Bilateral Reference for High-Resolution Dichotomous Image Segmentation). Se trata de una variante del modelo BiRefNet original, ajustada específicamente para generar máscaras de alta calidad en imágenes de personas, con aplicación directa en eliminación de fondo, composición y edición fotográfica.

El modelo se basa en una arquitectura transformer con un mecanismo de referencia bilateral que combina información global y local para lograr una segmentación precisa incluso en bordes finos como el cabello. Con 220,7 millones de parámetros, está diseñado para trabajar con imágenes de alta resolución y ofrece resultados de matting sin necesidad de trimap (máscara previa). Su relevancia actual radica en que resuelve un problema clásico de visión por computador con un rendimiento superior a métodos anteriores, y su licencia MIT permite su uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiRefNet (transformer con referencia bilateral) |
| Parametros totales | 220.700.242 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No aplica (modelo de vision) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, probablemente FP32/FP16) |
| Idiomas soportados | No aplica (modelo de vision) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

BiRefNet-portrait utiliza la arquitectura BiRefNet, un transformer diseñado para segmentación dicotómica de imágenes (DIS) de alta resolución. La innovación principal es el mecanismo de referencia bilateral, que combina características de bajo y alto nivel mediante una atención cruzada entre la imagen original y sus representaciones intermedias. Esto permite capturar tanto detalles finos (bordes, cabello) como contexto global (silueta completa), superando las limitaciones de los métodos basados únicamente en CNNs o transformers convencionales.

El entrenamiento se realizó sobre dos conjuntos de datos: P3M-10k (excluyendo el subconjunto de validación TE-P3M-500-P) y TR-humans, ambos específicos para matting de personas. La validación se llevó a cabo en TE-P3M-500-P, un conjunto estándar de evaluación para portrait matting. No se menciona el uso de técnicas de refuerzo como RLHF o DPO, ya que es un modelo puramente de visión. El entrenamiento fue apoyado por recursos GPU proporcionados por @fal, según los agradecimientos del autor.

## Capacidades

- Segmentación de retratos: genera máscaras binarias o mapas de alpha de alta precisión para personas en imágenes.
- Matting sin trimap: no requiere una máscara previa (trimap) para funcionar, lo que simplifica su integración en flujos de trabajo.
- Alta resolución: diseñado para manejar imágenes de alta resolución, manteniendo precisión en bordes complejos como cabello o ropa con textura.
- Eliminación de fondo: permite extraer el sujeto de una imagen y reemplazar el fondo de forma limpia.
- Generación de máscaras: produce máscaras de segmentación utilizables en tareas de edición, composición o análisis.
- Compatibilidad con el ecosistema Hugging Face: se integra mediante `pytorch_model_hub_mixin` y la librería `birefnet`, facilitando su uso con pipelines estándar.

## Casos de uso

- Eliminación de fondo en fotografía de retrato: el modelo puede procesar imágenes de personas y generar un recorte limpio para sustituir el fondo, útil en estudios fotográficos o aplicaciones de edición automática.
- Composición de imágenes para publicidad: permite extraer el sujeto de una foto y superponerlo en escenarios nuevos, agilizando la creación de material promocional.
- Preparación de datasets para entrenamiento: las máscaras generadas pueden usarse para etiquetar automáticamente conjuntos de datos de retratos, reduciendo el trabajo manual de anotación.
- Videollamadas con fondo virtual: aunque el modelo es para imágenes estáticas, puede aplicarse a fotogramas individuales para generar fondos personalizados en aplicaciones de conferencia.
- Restauración y retoque fotográfico: facilita la separación del sujeto del fondo para aplicar ajustes selectivos de color, iluminación o filtros.
- Generación de avatares y contenido para redes sociales: permite recortar la silueta de una persona para crear stickers, avatares o contenido con transparencia.
- Automatización en comercio electrónico: para eliminar fondos de fotos de producto cuando el sujeto es una persona (por ejemplo, ropa o accesorios), mejorando la presentación en tiendas online.

## Benchmarks y rendimiento

El modelo card proporciona resultados de validación en el conjunto TE-P3M-500-P, comparando con el método BiRefNet-portrait en su época 150 de entrenamiento. Los datos son los siguientes:

| Metrica | Valor |
|---|---|
| Smeasure | 0.983 |
| maxFm | 0.996 |
| meanEm | 0.991 |
| MAE | 0.006 |
| maxEm | 0.997 |
| meanFm | 0.988 |
| wFmeasure | 0.990 |
| adpEm | 0.933 |
| adpFm | 0.965 |
| HCE | 0.000 |

Estos valores indican una precisión muy alta en la segmentación de retratos, con un error absoluto medio (MAE) de solo 0.006 y una medida de similitud estructural (Smeasure) de 0.983. No se dispone de comparaciones con otros modelos en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 220,7 millones de parámetros y un tamaño de repo de 2,7 GB, la inferencia en FP32 requeriría aproximadamente 4-6 GB de VRAM. Con cuantización a FP16 o int8, podría reducirse a 2-4 GB.
- GPU recomendadas: tarjetas de gama media como RTX 3060, RTX 4060 o superiores son suficientes para inferencia en tiempo real. Para procesamiento por lotes o alta resolución, se recomienda una GPU con al menos 8 GB de VRAM (RTX 3070, RTX 4080, A100, etc.).
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPU modernas de consumo, incluso en modelos con 4 GB de VRAM si se usa cuantización.
- Opciones de despliegue: al ser un modelo de visión con soporte para `pytorch_model_hub_mixin`, puede ejecutarse con PyTorch estándar, así como mediante la librería `birefnet` y pipelines de Hugging Face. También es compatible con endpoints de Hugging Face para despliegue en producción.
- Latencia y throughput: no se proporcionan datos oficiales, pero para una imagen de 1024x1024, se espera una inferencia de entre 0.1 y 0.5 segundos en una GPU moderna, dependiendo de la resolución y el hardware.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos de matting en la documentación proporcionada. Sin embargo, BiRefNet-portrait pertenece a la familia BiRefNet, que incluye variantes como BiRefNet (general) y BiRefNet-matting. La comparación con alternativas como MODNet o U2-Net no está documentada en las fuentes consultadas. Se recomienda consultar el repositorio principal de BiRefNet para obtener comparativas más amplias.

## Limitaciones y advertencias

- Especialización en retratos: el modelo está entrenado exclusivamente con imágenes de personas, por lo que su rendimiento en otros objetos (animales, vehículos, etc.) será deficiente o nulo.
- Dependencia de la calidad de la imagen: en imágenes con fondos muy complejos, oclusiones severas o baja resolución, la precisión de la máscara puede degradarse.
- Riesgo de errores en bordes finos: aunque el modelo destaca en cabello y bordes, puede fallar en casos extremos como cabello muy rizado o transparencias complejas.
- Sin soporte de idiomas: al ser un modelo de visión, no procesa texto ni tiene capacidades lingüísticas.
- Cuantización no documentada: no se especifican formatos de cuantización oficiales, por lo que el usuario debe probar la conversión a FP16 o int8 por su cuenta.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZhengPeng7/BiRefNet-portrait
- Repositorio principal de BiRefNet: https://huggingface.co/ZhengPeng7/BiRefNet
- Código fuente en GitHub: https://github.com/ZhengPeng7/BiRefNet
- Paper (arXiv): https://arxiv.org/pdf/2401.03407
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo
- Página del proyecto: https://www.birefnet.top
- Notebook de inferencia en Colab: https://colab.research.google.com/drive/14Dqg7oeBkFEtchaHLNpig2BcdkZEogba?usp=drive_link
