# TontonTremblay/doper2-handal-obj000010

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000010` es un modelo de estimación de pose 6D (posición y orientación) específico para el objeto `000010` del conjunto de datos HANDal. Ha sido desarrollado por TontonTremblay (Jonathan Tremblay) utilizando el pipeline DOPER2, un sistema de entrenamiento para estimación de pose de objetos mediante keypoints. El modelo emplea un backbone `convnext_tiny` preentrenado con DINOv3 y predice 64 keypoints 3D en metros, que posteriormente se utilizan para resolver la pose mediante PnP.

Este modelo está diseñado para aplicaciones de robótica, automatización industrial y realidad aumentada donde se necesita localizar con precisión un objeto conocido en una escena. Su relevancia radica en que ofrece un checkpoint entrenado con una combinación de datos sintéticos (DR synth 10k), datos PBR de BOP y pseudo-etiquetas, lo que permite una evaluación directa en el benchmark BOP. El repositorio incluye los pesos del mejor checkpoint, la configuración de entrenamiento y los keypoints 3D, facilitando su integración en sistemas de visión por computador.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints (heatmap) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica |
| Licencia | no disponible |
| Formato de pesos | Checkpoint PyTorch (`best.pth`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un detector que procesa imágenes a 224 píxeles y una cabeza de keypoints que opera sobre recortes de 256 píxeles. El backbone es `convnext_tiny` con pesos inicializados desde DINOv3 (preentrenado en LVD-142M), y la cabeza de keypoints genera mapas de calor (heatmaps) para 64 puntos 3D. El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina datos sintéticos generados con renderizado DR (10k muestras), datos PBR del benchmark BOP y pseudo-etiquetas de onboarding. No se especifican detalles sobre el número total de parámetros, el volumen de datos exacto ni el proceso de optimización (pérdidas, épocas, etc.) en la información disponible.

## Capacidades

- Estimación de pose 6D (traslación y rotación) para el objeto HANDal `000010` mediante keypoints 3D y resolución PnP.
- Detección del objeto en la imagen y predicción de 64 keypoints en coordenadas de píxeles.
- Salida de keypoints 3D en metros, lista para usar con `cv2.solvePnP` para obtener la pose.
- Integración con el pipeline DOPER2 para inferencia (módulo `doper2.infer`).
- Evaluación directa contra el benchmark BOP para el objeto específico (resultados disponibles en un dataset aparte).

## Casos de uso

- Robótica de manipulación: el modelo permite a un brazo robótico localizar con precisión el objeto HANDal `000010` en el espacio 3D, facilitando tareas de agarre y ensamblaje. La salida de keypoints en metros y la pose resuelta con PnP se pueden alimentar directamente al controlador del robot.
- Control de calidad industrial: en líneas de producción donde se maneja este objeto, el modelo puede verificar su posición y orientación para detectar desalineaciones o defectos de colocación.
- Realidad aumentada: superponer información digital sobre el objeto físico requiere conocer su pose exacta; este modelo proporciona esa información en tiempo real con una GPU estándar.
- Automatización de almacenes: seguimiento y localización del objeto en estanterías o cintas transportadoras para sistemas de picking automatizado.
- Investigación en visión por computador: como referencia para comparar métodos de estimación de pose en el benchmark BOP, especialmente para objetos con geometría compleja.
- Simulación y entrenamiento de agentes: integrar la pose estimada en entornos simulados para entrenar políticas de manipulación con realismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un dataset externo (`TontonTremblay/doper2-handal-results`) donde se encuentran las tablas de evaluación completas para el objeto `000010` en el benchmark BOP, pero no se incluyen valores numéricos en esta ficha.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que sugiere un modelo relativamente ligero (probablemente decenas de millones de parámetros, aunque no se confirma).
- No se especifican requisitos de VRAM ni GPU recomendadas en la documentación. Dado el backbone `convnext_tiny` y la entrada de 224/256 píxeles, es plausible que funcione en GPUs de consumo como una RTX 3060 o superior, pero no hay datos oficiales.
- El código de ejemplo utiliza `device="cuda:0"`, indicando soporte para CUDA.
- Opciones de despliegue: el modelo se usa mediante el paquete `doper2` (inferencia en Python). No se mencionan formatos como ONNX, TensorRT o soluciones tipo vLLM/Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Dado que es un modelo específico para un objeto concreto dentro del pipeline DOPER2, no se pueden establecer comparaciones directas sin datos adicionales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `000010` de HANDal; no es generalizable a otros objetos sin reentrenamiento.
- La precisión depende de la calibración de la cámara (matriz intrínseca K) y de las condiciones de iluminación y oclusión, como es habitual en estimación de pose.
- No se especifica la licencia, por lo que el uso comercial puede estar restringido; se recomienda contactar con el autor antes de utilizarlo en producción.
- Los datos de entrenamiento incluyen imágenes sintéticas y PBR, lo que puede introducir un sesgo hacia las condiciones simuladas; el rendimiento en entornos reales no está garantizado.
- No se proporcionan métricas de error (como ADD o AUC) en la model card, por lo que la calidad del modelo debe evaluarse mediante el dataset de resultados externo.
- El checkpoint `best.pth` se seleccionó por el menor error de keypoints en validación, pero no se indica la métrica exacta ni el conjunto de validación utilizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000010
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
- Dataset DOPER_HOPE: https://huggingface.co/datasets/TontonTremblay/DOPER_HOPE
