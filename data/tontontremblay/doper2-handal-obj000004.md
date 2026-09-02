# TontonTremblay/doper2-handal-obj000004

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000004` es un checkpoint de estimación de pose 6D (posición y orientación) para un objeto concreto de la categoría HANDal, concretamente el objeto con identificador `000004`. Ha sido entrenado con el pipeline DOPER2, un sistema de entrenamiento de estimación de pose basado en keypoints 3D, desarrollado por Jonathan Tremblay (TontonTremblay), investigador con actividad en Hugging Face y GitHub. El modelo utiliza un backbone ConvNeXt-Tiny preentrenado con DINOv3 (variante `lvd1689m`) y una cabeza de predicción de mapas de calor (heatmap) para localizar 64 keypoints 3D en la imagen.

Este modelo resuelve el problema de la estimación de pose de objetos en entornos industriales o robóticos, donde se necesita conocer la posición y orientación exacta de un objeto para tareas de manipulación o inspección. Su relevancia radica en que forma parte de un pipeline completo (DOPER2) que combina datos sintéticos, renderizado fotorrealista (BOP PBR) y pseudo-etiquetado para entrenar modelos robustos sin necesidad de anotaciones manuales masivas. El checkpoint ocupa 0.3 GB y está diseñado para ser usado con el paquete `doper2` para inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado con DINOv3) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no textual) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura del pipeline DOPER2: un backbone ConvNeXt-Tiny (variante `convnext_tiny.dinov3_lvd1689m`) que extrae características de la imagen, seguido de una cabeza de predicción de keypoints basada en mapas de calor (heatmap). La entrada al detector es de 224 píxeles, mientras que el recorte alrededor del objeto detectado se procesa a 256 píxeles. Se predicen 64 keypoints 3D, cuyas posiciones en metros se almacenan en el archivo `keypoints_3d.json`.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con renderizado DR (Domain Randomization), imágenes con aumentación BOP PBR (fotorrealista) y pseudo-etiquetas generadas durante el onboarding del objeto. El checkpoint `best.pth` se selecciona por el menor error de keypoints en píxeles (val `kp_err_px`). El archivo `training_provenance.json` documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git asociado, lo que permite reproducibilidad.

## Capacidades

- Estimación de pose 6D (traslación y rotación) de un objeto específico (HANDal obj_000004) a partir de una imagen RGB.
- Detección del objeto en la imagen mediante un detector integrado (score threshold configurable, por defecto 0.3).
- Predicción de 64 keypoints 3D en coordenadas métricas (metros), que se pueden convertir a milímetros para su uso con `solvePnP`.
- Inferencia sobre GPU (el ejemplo de uso emplea `cuda:0`).
- Integración con el paquete `doper2` para carga de modelos y ejecución de inferencia.
- No soporta generación de texto, código, tool calling ni capacidades multimodales más allá de visión.

## Casos de uso

- Manipulación robótica: el modelo proporciona la pose 6D del objeto HANDal, permitiendo a un brazo robótico planificar agarres precisos. Se usaría en bucle de control con la cámara del robot, ejecutando inferencia en cada frame para actualizar la posición del objeto.
- Inspección de calidad en líneas de producción: al conocer la pose exacta del objeto, un sistema de visión puede verificar si está correctamente orientado o ensamblado, comparando la pose estimada con la esperada.
- Paletizado y desordenado (bin picking): en entornos logísticos, el modelo ayuda a localizar y orientar objetos en contenedores desordenados, facilitando la extracción automática por parte de un robot.
- Realidad aumentada industrial: superponer información digital (instrucciones, advertencias) sobre el objeto físico en tiempo real, usando la pose estimada para alinear el contenido virtual.
- Benchmarking de algoritmos de estimación de pose: al ser un checkpoint específico de un objeto, puede usarse como referencia para comparar otros métodos en el conjunto de validación BOP para HANDal.
- Investigación en aprendizaje con datos sintéticos: el modelo sirve como ejemplo de aplicación del pipeline DOPER2, permitiendo estudiar el impacto de las pseudo-etiquetas y el renderizado sintético en la precisión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que los resultados de validación BOP para el objeto `obj_000004` están disponibles en el dataset `TontonTremblay/doper2-handal-results`, pero no se incluyen cifras concretas en la documentación del modelo. No se dispone de comparaciones con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada: no disponible. Dado el tamaño del checkpoint (0.3 GB) y el backbone ConvNeXt-Tiny, se espera que quepa en GPUs con al menos 4 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: el ejemplo de uso indica `cuda:0`, por lo que se requiere una GPU NVIDIA compatible con CUDA. Modelos como RTX 3060, RTX 4060 o superiores serían suficientes para inferencia.
- Compatibilidad con GPUs de consumo: probablemente sí, dado el tamaño reducido del modelo, pero no se confirma oficialmente.
- Opciones de despliegue: el paquete `doper2` proporciona la función `infer_image` para inferencia directa. No se mencionan integraciones con vLLM, llama.cpp u otros motores de inferencia, ya que es un modelo de visión específico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un checkpoint específico para un objeto concreto dentro de un pipeline propietario. No hay datos de otros modelos de estimación de pose para el mismo objeto con los que comparar.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `HANDal obj_000004`; no funcionará con otros objetos sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido o requerir contacto con el autor.
- La precisión depende de las condiciones de iluminación, oclusión y calidad de imagen; no se han publicado métricas de robustez.
- El modelo asume que el objeto está presente en la imagen; el detector puede fallar en escenas muy desordenadas o con oclusiones severas.
- No hay información sobre sesgos o alucinaciones, al ser un modelo de visión puro, pero la estimación de pose puede ser incorrecta en casos ambiguos.
- El formato de pesos es un checkpoint de PyTorch (`.pth`), no un formato estándar como ONNX o TensorRT, lo que limita el despliegue en entornos de producción que requieran esos formatos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000004
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
