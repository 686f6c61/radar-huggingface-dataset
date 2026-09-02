# TontonTremblay/doper2-handal-obj000013

## Resumen

DOPER2 — HANDal obj_000013 es un modelo de estimación de pose 6DoF para el objeto HANDal `000013`, entrenado con el pipeline DOPER2 por Jonathan Tremblay (TontonTremblay). El modelo predice 64 keypoints 3D en metros y permite resolver la pose del objeto mediante PnP a partir de una imagen RGB. Está diseñado específicamente para el conjunto de datos HANDal, un benchmark de objetos domésticos con asas, y forma parte de una serie de checkpoints por objeto.

El modelo utiliza un backbone ConvNeXt-Tiny preentrenado con DINOv3 (lvd1689m) y una cabeza de keypoints por mapa de calor. Se entrenó en la etapa V5 del pipeline, que combina 10 000 imágenes sintéticas generadas con DR (Domain Randomization), datos BOP PBR y pseudo-etiquetas de onboarding. El repositorio incluye el checkpoint, las posiciones 3D de los keypoints, la configuración de entrenamiento y la procedencia completa de los datos, lo que facilita la reproducibilidad.

Aunque no es un modelo de lenguaje, su relevancia radica en la estimación de pose precisa para robótica y manipulación, un campo donde los modelos específicos por objeto suelen superar a los enfoques genéricos. El tamaño del repositorio es de 0,3 GB, lo que indica un modelo ligero y desplegable en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado DINOv3 lvd1689m) + cabeza de keypoints por mapa de calor |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (checkpoint en precisión completa, PyTorch) |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pth`), JSON para keypoints y config |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un detector que opera a 224 px y una cabeza de keypoints que procesa recortes de 256 px. El backbone es ConvNeXt-Tiny con pesos inicializados desde DINOv3 (lvd1689m), un modelo autosupervisado de visión. La cabeza de keypoints genera mapas de calor para 64 puntos 3D, cuyas posiciones se almacenan en `keypoints_3d.json` en metros.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas con domain randomization (DR synth), imágenes BOP PBR (fotorrealistas con física de renderizado) y pseudo-etiquetas generadas durante el onboarding del objeto. Esta mezcla busca maximizar la robustez ante variaciones de iluminación, textura y oclusión. El checkpoint `best.pth` se selecciona por el menor error de keypoints en validación (`val kp_err_px`). El archivo `training_provenance.json` documenta los argumentos de entrenamiento, las fuentes de datos y el commit de git, lo que permite auditar el proceso completo.

## Capacidades

- Estimación de pose 6DoF (traslación y rotación) de un objeto específico (HANDal `000013`) a partir de una imagen RGB.
- Detección del objeto en la imagen con score de confianza (umbral configurable, p. ej. 0,3).
- Predicción de 64 keypoints 3D en metros, que se pueden usar directamente con `cv2.solvePnP` para obtener la pose.
- Inferencia en GPU con el paquete `doper2.infer` (funciones `load_model` e `infer_image`).
- Reproducibilidad completa gracias a la inclusión de configuración, keypoints y procedencia de entrenamiento.
- No incluye capacidades de lenguaje, tool calling ni agentes; es un modelo puramente visual.

## Casos de uso

- Robótica de manipulación: un brazo robótico puede usar la pose estimada para planificar agarres sobre el objeto HANDal `000013` en tareas de recogida o ensamblaje. La precisión de los keypoints 3D permite calcular la orientación exacta del asa.
- Control de calidad en fabricación: verificar que un objeto concreto está correctamente orientado en una línea de producción comparando la pose estimada con una pose de referencia.
- Realidad aumentada industrial: superponer instrucciones de montaje o información técnica sobre el objeto en tiempo real, usando la pose para anclar el contenido virtual.
- Teleoperación y telepresencia: en sistemas de manipulación remota, la pose del objeto guía al operador y permite ajustar la trayectoria del efector.
- Benchmarking de métodos de estimación de pose: al ser un checkpoint específico del dataset HANDal, sirve como baseline para comparar nuevas técnicas en el objeto `000013`.
- Investigación en aprendizaje con datos sintéticos: el pipeline V5 (DR + PBR + pseudo-etiquetas) puede replicarse o adaptarse para estudiar el impacto de cada fuente de datos en la precisión final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia el dataset [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results) para tablas de evaluación completas y cuadrículas de inferencia, pero los valores numéricos concretos (p. ej. error de keypoints, ADD-S) no se incluyen en la model card ni en los resultados de búsqueda.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 0,3 GB, por lo que la inferencia cabe en GPUs con 2-4 GB de VRAM en precisión FP32. Con cuantización (no disponible oficialmente) podría reducirse aún más.
- GPU recomendadas: cualquier GPU NVIDIA moderna con soporte CUDA (p. ej. RTX 2060, RTX 3060, RTX 4090, A100). El backbone ConvNeXt-Tiny es ligero, por lo que incluso GPUs integradas podrían ser suficientes para inferencia a baja resolución.
- Compatibilidad con GPUs de consumo: sí, es viable en tarjetas de gama media y baja.
- Opciones de despliegue: el paquete `doper2` proporciona la API de inferencia; también se puede exportar a ONNX o TensorRT para optimización, aunque no se documenta en la model card.
- Latencia y throughput: no se proporcionan datos oficiales. Dado el tamaño del modelo y la resolución de entrada (224/256 px), se espera una latencia de decenas de milisegundos en GPUs modernas, pero es una estimación no verificada.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables directamente en la información proporcionada. El modelo es específico para un objeto concreto del dataset HANDal, y no se dispone de alternativas públicas equivalentes con el mismo backbone y pipeline.

## Limitaciones y advertencias

- El modelo está entrenado únicamente para el objeto HANDal `000013`; no generaliza a otros objetos o categorías.
- La licencia no está especificada, por lo que el uso comercial es incierto hasta que el autor la aclare.
- No se proporcionan métricas de rendimiento validadas en la model card; los resultados están en un dataset separado que debe consultarse.
- La precisión de la pose depende de la calidad de la calibración de la cámara (matriz K) y de la iluminación; condiciones extremas pueden degradar la detección.
- El pipeline de entrenamiento usa datos sintéticos y pseudo-etiquetas, lo que puede introducir sesgos hacia las distribuciones de los datos de entrenamiento.
- No hay soporte para otros formatos de peso (GGUF, safetensors) ni cuantizaciones oficiales; el despliegue en producción requiere el entorno PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TontonTremblay/doper2-handal-obj000013
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en HuggingFace: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
