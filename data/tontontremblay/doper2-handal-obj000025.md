# TontonTremblay/doper2-handal-obj000025

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000025` es un estimador de pose 6D (posición y orientación) para un objeto concreto de la colección HANDal, identificado como `obj_000025`. Ha sido desarrollado por Jonathan Tremblay (usuario `TontonTremblay`) utilizando el pipeline DOPER2, una metodología de entrenamiento para estimación de pose que combina datos sintéticos, imágenes reales con aumentación BOP y pseudo-etiquetas. El modelo está especializado en un único objeto, lo que lo hace adecuado para aplicaciones industriales o robóticas donde se necesita localizar y orientar una pieza específica con alta precisión.

La arquitectura se basa en un backbone `convnext_tiny.dinov3_lvd1689m` (una variante de ConvNeXt preentrenada con DINOv3) y una cabeza de keypoints que predice 64 puntos 3D del objeto. El detector trabaja con imágenes de 224 píxeles y la cabeza de keypoints con crops de 256 píxeles. El repositorio incluye el checkpoint entrenado (`best.pth`), las posiciones 3D de los keypoints en metros, la configuración de entrenamiento y un archivo de procedencia con todos los argumentos y fuentes de datos. El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero, ejecutable en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints (heatmap) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch `.pth`) |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`), junto con `config.yaml` y `keypoints_3d.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: primero un detector localiza el objeto en la imagen (entrada de 224 píxeles) y luego una cabeza de keypoints procesa un crop de 256 píxeles para predecir 64 puntos 3D del objeto. El backbone es `convnext_tiny.dinov3_lvd1689m`, una versión pequeña de ConvNeXt preentrenada con el framework DINOv3 sobre un conjunto de datos de 1689 millones de imágenes (LVD-1689M). La cabeza de keypoints utiliza mapas de calor (heatmap) para regresar las posiciones 2D de los keypoints, que posteriormente se combinan con las posiciones 3D conocidas del objeto para resolver la pose mediante PnP (Perspective-n-Point).

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes reales con aumentación BOP (Benchmark for 6D Object Pose Estimation) y pseudo-etiquetas generadas durante el onboarding del objeto. El archivo `training_provenance.json` documenta todos los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que garantiza reproducibilidad. No se especifica el número total de parámetros ni el tiempo de entrenamiento.

## Capacidades

- Estimación de pose 6D (traslación y rotación) para el objeto HANDal `obj_000025` a partir de una imagen RGB.
- Predicción de 64 keypoints 3D del objeto, con coordenadas en metros.
- Detección del objeto en la imagen mediante un detector integrado (score threshold configurable).
- Resolución de la pose mediante `solvePnP` con los keypoints predichos y las posiciones 3D conocidas.
- Inferencia en GPU (CUDA) con el paquete `doper2` (código de inferencia incluido en el repositorio).
- No soporta generación de texto, código, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- **Robótica de manipulación**: el modelo permite a un brazo robótico localizar y orientar la pieza `obj_000025` en el espacio 3D para tareas de agarre o ensamblaje. La salida de `solvePnP` proporciona la traslación y rotación necesarias para planificar la trayectoria.
- **Control de calidad industrial**: integrado en una línea de visión artificial, puede verificar que la pieza esté correctamente posicionada u orientada según especificaciones, comparando la pose estimada con la nominal.
- **Realidad aumentada**: superponer modelos 3D o información digital sobre el objeto físico en tiempo real, usando la pose estimada para alinear el contenido virtual.
- **Logística y clasificación**: en entornos de almacén, el modelo puede ayudar a un sistema autónomo a identificar y orientar la pieza para su recogida o empaquetado.
- **Investigación en estimación de pose**: sirve como referencia para comparar el pipeline DOPER2 con otros métodos en el benchmark BOP, ya que se proporcionan resultados de validación en el dataset asociado.
- **Inspección visual automatizada**: detectar desalineaciones o defectos de montaje analizando la pose estimada frente a la esperada, sin necesidad de marcadores físicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona resultados de validación BOP para el objeto `obj_000025`, pero remite a un dataset externo (`TontonTremblay/doper2-handal-results`) que no ha sido consultado. No se proporcionan métricas numéricas como error de keypoints, ADD(S) o AUC en esta ficha.

## Requisitos de hardware

- El checkpoint ocupa aproximadamente 0,3 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM (estimación razonable, no confirmada por el autor).
- La inferencia requiere CUDA (el código de ejemplo usa `device="cuda:0"`), por lo que se necesita una GPU NVIDIA con soporte CUDA.
- GPUs recomendadas: cualquier GPU moderna con al menos 4-6 GB de VRAM, como una RTX 3060, RTX 4060 o superior. Para producción, una A100 o H100 no serían necesarias dado el tamaño del modelo.
- Opciones de despliegue: el paquete `doper2` proporciona la API de inferencia (`load_model`, `infer_image`). No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dado el tamaño del backbone (ConvNeXt-Tiny) y la resolución de entrada, se espera una inferencia en tiempo real en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un modelo especializado en un objeto concreto dentro del pipeline DOPER2. No se dispone de alternativas de la misma categoría (estimación de pose 6D para objetos HANDal) con datos públicos comparables.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `obj_000025` de la colección HANDal. No es generalizable a otros objetos ni a variantes del mismo.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- La precisión de la pose depende de la calidad de la imagen y de la iluminación; el modelo puede fallar en condiciones muy diferentes a las de entrenamiento (oclusiones severas, fondos complejos, etc.).
- No se proporcionan métricas de error ni estudios de robustez, por lo que el rendimiento en producción debe validarse con datos propios.
- El repositorio no incluye un script de evaluación completo; los resultados BOP están en un dataset separado que debe consultarse para verificar el rendimiento.
- El modelo asume que la cámara está calibrada (se requiere la matriz intrínseca `K` para `solvePnP`). Una calibración incorrecta degradará la precisión de la pose.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000025
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
