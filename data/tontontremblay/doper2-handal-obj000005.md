# TontonTremblay/doper2-handal-obj000005

## Resumen

El modelo `doper2-handal-obj000005` es un modelo de estimación de pose 6DoF para el objeto `000005` del dataset HANDal, entrenado con el pipeline DOPER2. Lo desarrolla Jonathan Tremblay (TontonTremblay), investigador con actividad en el ecosistema Hugging Face y GitHub, y forma parte de una serie de checkpoints específicos por objeto dentro del proyecto DOPER2.

El modelo combina un backbone `convnext_tiny` preentrenado con DINOv3 (variante `lvd1689m`) y una cabeza de keypoints basada en mapas de calor (heatmap). Predice 64 keypoints 3D en metros, que posteriormente se utilizan con `cv2.solvePnP` para recuperar la rotación y traslación del objeto respecto a la cámara. El tamaño del repositorio es de 0,3 GB, lo que indica un checkpoint ligero adecuado para inferencia en una GPU de gama media.

La relevancia de este modelo reside en su especialización: en lugar de un modelo genérico de estimación de pose, se entrena un checkpoint dedicado por objeto, lo que permite optimizar la precisión para tareas de manipulación robótica y visión industrial sobre el objeto HANDal `000005`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (DINOv3 `lvd1689m`) + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch checkpoint (`.pth`) |

## Arquitectura y entrenamiento

El modelo usa un backbone ConvNeXt-Tiny preentrenado con DINOv3 (checkpoint `lvd1689m`), seguido de una cabeza de keypoints que produce mapas de calor (heatmap) para 64 puntos 3D. El detector opera a 224 píxeles de entrada y el recorte del keypoint a 256 píxeles. La salida son coordenadas 2D de keypoints que, combinadas con las posiciones 3D conocidas del objeto (en `keypoints_3d.json`, unidades en metros), permiten resolver la pose mediante PnP.

El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con Domain Randomization (DR synth), imágenes con aumentos PBR del estándar BOP y pseudo-etiquetas de onboarding. El checkpoint `best.pth` se selecciona por el menor error de keypoints en validación (`kp_err_px`). El repositorio incluye `config.yaml` y `training_provenance.json` con los argumentos de entrenamiento completos, fuentes de datos y commit de git, lo que garantiza trazabilidad y reproducibilidad.

## Capacidades

- Estimación de pose 6DoF (rotación y traslación) para el objeto HANDal `000005` mediante resolución PnP sobre 64 keypoints 2D-3D.
- Detección del objeto en la imagen con score de confianza configurable (`score_thr`).
- Inferencia sobre imágenes RGB individuales con cámara calibrada (matriz intrínseca K).
- Salida de keypoints 2D y correspondencias 3D en metros, listas para `cv2.solvePnP` con `SOLVEPNP_SQPNP`.
- Trazabilidad completa del entrenamiento mediante metadatos de procedencia (`training_provenance.json`).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales: es un modelo puramente de visión para estimación de pose.

## Casos de uso

- Manipulación robótica pick-and-place: el robot puede localizar el objeto HANDal `000005` en la escena y estimar su pose para planificar la pinza. La precisión de los 64 keypoints permite un agarre estable incluso con oclusiones parciales.
- Control de calidad industrial: inspección de piezas sobre una cinta transportadora, verificando la orientación correcta del objeto comparando la pose estimada con la nominal.
- Realidad aumentada: superposición de modelos 3D o instrucciones de montaje sobre el objeto físico en tiempo real, usando la pose estimada para anclar el contenido virtual.
- Benchmarking de pipelines de estimación de pose: al ser un checkpoint específico de objeto con metadatos de entrenamiento completos, sirve como referencia reproducible para comparar variantes del pipeline DOPER2 o métodos alternativos en el objeto `000005`.
- Integración en sistemas de visión con cámara calibrada: el flujo de inferencia (detección + keypoints + solvePnP) se puede empaquetar como un servicio ROS o un endpoint de inferencia para líneas de producción.
- Investigación en aprendizaje con datos sintéticos: el modelo demuestra la viabilidad de entrenar con DR synth + PBR + pseudo-etiquetas, y puede usarse como caso de estudio para transferencia sim-to-real en objetos domésticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card referencia un dataset externo (`TontonTremblay/doper2-handal-results`) con tablas de evaluación completas sobre BOP val para `obj_000005`, pero los valores numéricos concretos no están incluidos en la información proporcionada.

## Requisitos de hardware

- El checkpoint ocupa 0,3 GB, por lo que cabe holgadamente en VRAM de cualquier GPU moderna.
- El código de ejemplo usa `device="cuda:0"`, lo que indica que la inferencia está pensada para GPU NVIDIA con CUDA.
- Un backbone ConvNeXt-Tiny con entrada de 224/256 píxeles es ligero: una GPU consumer como RTX 3060 o superior es suficiente para inferencia en tiempo real.
- Opciones de despliegue: el modelo se carga con la librería `doper2` (`load_model`), por lo que el despliegue está ligado a ese paquete Python. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI (modelo de visión, no generativo).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de estimación de pose para el mismo objeto o con el mismo pipeline. El proyecto DOPER2 publica checkpoints por objeto, pero no se dispone de datos de otros checkpoints para comparar en esta ficha.

## Limitaciones y advertencias

- El modelo está especializado exclusivamente en el objeto HANDal `000005`; no generaliza a otros objetos sin reentrenamiento.
- La licencia no está especificada en la model card, por lo que el uso comercial es incierto hasta que el autor la aclare.
- No hay información sobre sesgos o comportamiento ante oclusiones severas, condiciones de iluminación extremas o fondos no vistos en el entrenamiento.
- La inferencia requiere una cámara calibrada (matriz intrínseca K) y asume que el objeto está presente en la imagen; el detector puede fallar con `score_thr` alto en escenas complejas.
- El modelo no tiene capacidades de lenguaje ni generación de texto; es exclusivamente un modelo de visión.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un artefacto de investigación reciente sin validación comunitaria amplia.
- La fecha de creación (2026-09-02) es futura respecto a la mayoría de modelos conocidos, lo que puede indicar un error de metadatos o un proyecto de larga duración.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000005
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Perfil de Hugging Face del autor: https://huggingface.co/TontonTremblay
- Perfil de GitHub del autor: https://github.com/TontonTremblay
