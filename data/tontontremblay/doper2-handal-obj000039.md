# TontonTremblay/doper2-handal-obj000039

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000039` es un estimador de pose 6D (posición y orientación) entrenado específicamente para el objeto `000039` de la base de datos HANDal, un conjunto de objetos domésticos manipulables con anotaciones de agarre. Ha sido desarrollado por TontonTremblay (jonathan) utilizando el pipeline DOPER2, un sistema de entrenamiento de estimación de pose que combina datos sintéticos, renderizados PBR y pseudo-etiquetas. El modelo se centra en un único objeto, lo que lo hace adecuado para aplicaciones de robótica de manipulación donde se necesita una localización precisa y robusta de un objeto conocido.

La arquitectura se basa en un backbone `convnext_tiny.dinov3_lvd1689m` (ConvNeXt-Tiny preentrenado con DINOv3) y una cabeza de keypoints por mapa de calor (heatmap). Detecta 64 keypoints 3D del objeto, cuyas posiciones se proporcionan en el archivo `keypoints_3d.json` en metros. El modelo acepta imágenes de 224×224 píxeles para la detección y recorta regiones de 256×256 para la estimación de keypoints. El repositorio tiene un tamaño de 0.3 GB e incluye el checkpoint `best.pth`, la configuración de entrenamiento y metadatos de procedencia. No se especifican licencia ni idiomas, y el pipeline de inferencia requiere el paquete `doper2` (no incluido en el repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado con DINOv3) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible (el repo pesa 0.3 GB, pero no se indica el número de parámetros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | no disponible (solo se proporciona `best.pth`, formato PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: primero un detector localiza el objeto en la imagen (entrada de 224×224 píxeles) y luego una cabeza de keypoints predice 64 puntos 3D sobre un recorte de 256×256 píxeles. El backbone es `convnext_tiny.dinov3_lvd1689m`, un ConvNeXt-Tiny preentrenado con el método DINOv3 sobre un conjunto de datos de 1689 millones de imágenes (según la nomenclatura del nombre). La cabeza de keypoints utiliza mapas de calor (heatmap) para regresar las posiciones 2D de los keypoints, que posteriormente se combinan con las coordenadas 3D conocidas del objeto para resolver la pose mediante PnP (Perspective-n-Point).

El entrenamiento se realizó con el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes con aumentos PBR (Physically Based Rendering) del conjunto BOP, y pseudo-etiquetas generadas durante el onboarding del objeto. El checkpoint `best.pth` se seleccionó por el menor error de keypoints en píxeles (val kp_err_px) en validación. El archivo `training_provenance.json` documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que facilita la reproducibilidad.

## Capacidades

- Estimación de pose 6D (posición y orientación) de un objeto específico (HANDal `000039`) a partir de una imagen RGB.
- Detección del objeto en la imagen con un score de confianza configurable (por defecto 0.3).
- Predicción de 64 keypoints 3D en metros, que permiten resolver la pose mediante `cv2.solvePnP`.
- Inferencia en GPU (el código de ejemplo usa `cuda:0`).
- Integración con el ecosistema DOPER2: carga de modelo, inferencia y configuración mediante clases Python (`Doper2Config`, `DataConfig`, `ModelConfig`).
- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes conversacionales.

## Casos de uso

- Manipulación robótica de precisión: el modelo proporciona la pose 6D del objeto `000039` (por ejemplo, una herramienta o utensilio) para que un brazo robótico pueda agarrarlo con la orientación correcta. Se usaría en tiempo real con una cámara RGB y el pipeline de inferencia de DOPER2.
- Control de calidad en líneas de montaje: verificar que un objeto específico está colocado en la posición y orientación esperadas dentro de una celda de trabajo, comparando la pose estimada con una referencia.
- Realidad aumentada industrial: superponer información digital (instrucciones, advertencias) sobre el objeto real en una vista de cámara, usando la pose estimada para alinear el contenido.
- Automatización de picking en almacenes: localizar el objeto `000039` en una caja o estante para que un robot lo recoja, incluso con oclusiones parciales gracias a los keypoints.
- Benchmarking de algoritmos de estimación de pose: el modelo puede servir como referencia para evaluar otros métodos en el objeto `000039` del conjunto HANDal, usando los resultados BOP val publicados en el dataset asociado.
- Investigación en aprendizaje de pose con datos sintéticos: el pipeline DOPER2 y este checkpoint permiten estudiar el impacto de la combinación de datos DR, PBR y pseudo-etiquetas en la precisión de la pose.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un dataset separado (`TontonTremblay/doper2-handal-results`) con tablas de evaluación completas y cuadrículas de inferencia, pero no se incluyen valores numéricos en la model card ni en la búsqueda web. Por tanto, no es posible presentar una tabla comparativa con otros modelos sin inventar datos.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo ligero (el backbone ConvNeXt-Tiny tiene alrededor de 28 millones de parámetros, aunque no se confirma en la documentación).
- No se especifican requisitos de VRAM, pero por el tamaño y la arquitectura, es probable que quepa en GPUs de consumo como una RTX 3060 (12 GB) o superior. Sin embargo, al no haber datos oficiales, se recomienda probar con al menos 4 GB de VRAM.
- El código de ejemplo usa CUDA (`cuda:0`), por lo que se requiere una GPU NVIDIA con soporte CUDA.
- Opciones de despliegue: el modelo se usa a través del paquete `doper2` (no incluido en el repo). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerán de la GPU y del tamaño de la imagen de entrada.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría (estimación de pose 6D para objetos específicos). Existen otros métodos como PoseCNN, PVNet o los basados en BOP, pero no se han encontrado datos comparativos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `000039` de HANDal; no generaliza a otros objetos ni a variantes del mismo.
- La precisión de la pose depende de la calibración de la cámara (matriz intrínseca K) y de la calidad de la imagen. El código de ejemplo asume una cámara calibrada.
- No se especifica la licencia, por lo que el uso comercial puede ser incierto. Se recomienda contactar con el autor antes de utilizarlo en producción.
- No hay información sobre sesgos o alucinaciones (al ser un modelo de visión, el riesgo de alucinación se traduce en predicciones erróneas de keypoints en condiciones de oclusión severa o iluminación extrema).
- El modelo requiere el paquete `doper2` para la inferencia, que no está incluido en el repositorio; su instalación y compatibilidad no están documentadas en la model card.
- Los resultados de validación BOP se publican en un dataset aparte, pero no se han extraído aquí; es necesario consultar ese recurso para conocer el rendimiento real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000039
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Dataset HANDal (referencia): https://www.bulletpapers.ai/paper/eb647f13-95b4-8e69-0544-6525bb19a139 (resumen del paper)
