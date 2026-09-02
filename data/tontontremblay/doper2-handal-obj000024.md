# TontonTremblay/doper2-handal-obj000024

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000024` es un modelo de estimación de pose 6D para un objeto concreto de la categoría HANDal, concretamente el objeto con identificador `000024`. Ha sido entrenado con el pipeline DOPER2, desarrollado por TontonTremblay (Jonathan Tremblay), investigador vinculado al proyecto HANDAL de NVIDIA. El modelo predice 64 keypoints 3D en metros, que combinados con la calibración de la cámara permiten resolver la pose completa del objeto mediante PnP.

Se trata de un modelo especializado, no generalista, orientado a aplicaciones de robótica y manipulación donde se necesita localizar y orientar un objeto conocido en el espacio. El checkpoint ocupa 0,3 GB y utiliza un backbone `convnext_tiny.dinov3_lvd1689m`, con una entrada de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. La información pública es limitada: no se especifican parámetros totales, licencia ni resultados numéricos de benchmarks en la model card, aunque se referencia un dataset de resultados de evaluación BOP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` con cabeza de keypoints tipo heatmap (detector + crop) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (checkpoint `best.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: primero un detector que procesa la imagen completa a 224 píxeles y localiza el objeto, y después una red de keypoints que opera sobre un recorte de 256 píxeles centrado en la detección. El backbone es `convnext_tiny.dinov3_lvd1689m`, una variante de ConvNeXt preentrenada con DINOv3 sobre un conjunto de datos de 1.689 millones de imágenes (LVD). La cabeza de keypoints es de tipo heatmap, generando 64 mapas de calor correspondientes a los puntos 3D definidos en `keypoints_3d.json`.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10.000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes de BOP PBR (físicamente basadas en renderizado) y pseudo-etiquetas de un proceso de onboarding. No se especifica el número total de épocas, el tamaño del lote ni la función de pérdida, aunque la métrica de validación principal es el error de keypoint en píxeles (`kp_err_px`). El checkpoint `best.pth` corresponde al de menor error de validación.

## Capacidades

- Estimación de pose 6D (traslación y rotación) de un objeto específico de la categoría HANDal, mediante la resolución de PnP sobre los 64 keypoints 3D predichos.
- Detección del objeto en la imagen, devolviendo bounding boxes y scores de confianza.
- Predicción de keypoints 2D y 3D en metros, lo que permite obtener la pose en unidades físicas.
- Inferencia sobre imágenes individuales (no se menciona soporte de vídeo o batch).
- Integración con OpenCV para la resolución de pose (`cv2.solvePnP`).
- No se mencionan capacidades de generación de texto, tool calling, agentes ni procesamiento de lenguaje.

## Casos de uso

- Manipulación robótica: un brazo robótico puede usar la pose estimada para planificar la agarre del objeto `000024` en tareas de pick-and-place. El modelo proporciona la traslación y rotación en milímetros, suficiente para control de precisión.
- Control de calidad industrial: verificar la orientación correcta de piezas durante el ensamblaje, comparando la pose estimada con la esperada.
- Realidad aumentada: superponer modelos 3D o información virtual sobre el objeto físico en tiempo real, usando la pose para alinear el contenido.
- Navegación autónoma: en entornos con objetos conocidos, el modelo puede ayudar a un robot móvil a localizar y orientarse respecto al objeto.
- Inspección visual: detectar si el objeto está en una posición válida o si ha sido desplazado, mediante la comparación de poses entre frames.
- Investigación en visión por computador: servir como referencia para evaluar pipelines de estimación de pose en objetos del dataset HANDAL, especialmente en el contexto de BOP.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card menciona que los resultados de validación BOP para el objeto `000024` están disponibles en el dataset `TontonTremblay/doper2-handal-results`, pero no se incluyen valores concretos en la ficha. No se pueden comparar métricas como ADD, ADD-S o error de keypoint sin esos datos.

## Requisitos de hardware

- El checkpoint pesa 0,3 GB, lo que sugiere un modelo de tamaño moderado (probablemente decenas de millones de parámetros, aunque no se confirma).
- El código de inferencia requiere una GPU CUDA (`device="cuda:0"`), por lo que se necesita una GPU NVIDIA con al menos 4-6 GB de VRAM para una inferencia cómoda, aunque no se especifica el consumo exacto.
- Es probable que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores, pero no hay datos oficiales.
- Opciones de despliegue: el modelo se carga con la librería `doper2` (no publicada en el repositorio de HuggingFace), por lo que el despliegue está limitado a entornos Python con PyTorch y CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- La latencia y el throughput no están documentados.

## Comparativa con modelos similares

No disponible. No se proporcionan modelos comparables en la información. Dado que es un modelo específico para un objeto concreto dentro del pipeline DOPER2, no hay alternativas directas de la misma categoría en la documentación pública.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `000024` de la categoría HANDal. No generaliza a otros objetos ni a variaciones significativas de apariencia.
- No se especifica la licencia, por lo que el uso comercial es incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- La calidad de la estimación de pose depende de la calibración de la cámara (matriz intrínseca K) y de las condiciones de iluminación y oclusión, no documentadas.
- No se han publicado métricas de error en la model card, por lo que no se puede evaluar la precisión esperada sin consultar el dataset de resultados.
- El pipeline de entrenamiento incluye pseudo-etiquetas, lo que puede introducir sesgos en los keypoints si las pseudo-etiquetas contienen errores.
- No hay soporte para otros idiomas ni para tareas de lenguaje, ya que es un modelo puramente visual.
- El repositorio no incluye el código de la librería `doper2`; solo se proporciona un ejemplo de uso, por lo que la reproducibilidad puede ser limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000024
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en HuggingFace: https://huggingface.co/TontonTremblay
- GitHub del autor: https://github.com/TontonTremblay
- Publicación de HANDAL (NVIDIA): https://research.nvidia.com/labs/lpr/publication/guo2023handal/
