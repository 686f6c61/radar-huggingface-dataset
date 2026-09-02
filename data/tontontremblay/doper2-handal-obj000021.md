# TontonTremblay/doper2-handal-obj000021

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000021` es un modelo de estimación de pose 6D (posición y orientación) para un objeto concreto de la colección HANDal, identificado como `obj_000021`. Ha sido desarrollado por Jonathan Tremblay (TontonTremblay) utilizando el pipeline DOPER2, una evolución de DOPE (Deep Object Pose Estimation) que emplea keypoints 3D simétricos y entrenamiento con datos sintéticos. El modelo está diseñado para inferir la pose de un único objeto rígido a partir de una imagen RGB, devolviendo 64 keypoints 2D que, junto con sus correspondencias 3D conocidas, permiten resolver la pose mediante PnP.

La relevancia de este modelo radica en su especialización: está entrenado específicamente para el objeto HANDal `000021`, lo que lo hace adecuado para aplicaciones de robótica de manipulación, automatización industrial o realidad aumentada donde se necesita un seguimiento preciso de ese objeto concreto. El backbone utilizado es `convnext_tiny.dinov3_lvd1689m`, un modelo ConvNeXt-Tiny preentrenado con DINOv3, y el head de keypoints es de tipo heatmap. El tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero, aunque no se especifican los parámetros totales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone ConvNeXt-Tiny (preentrenado con DINOv3) + head de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible (checkpoint en formato PyTorch `.pth`) |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`.pth`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura típica de DOPER2: un backbone convolucional (ConvNeXt-Tiny) que extrae características de la imagen, seguido de un head que predice mapas de calor (heatmaps) para 64 keypoints 3D del objeto. La entrada al detector es de 224 píxeles y el recorte para el head de keypoints es de 256 píxeles. El entrenamiento se realizó en la etapa V5 del pipeline DOPER2, que combina datos sintéticos generados con renderizado fotorrealista (DR synth 10k), datos PBR de BOP (Benchmark for 6D Object Pose Estimation) y pseudo-etiquetas generadas durante el onboarding del objeto. No se especifican el número total de tokens de entrenamiento ni el uso de RLHF/DPO, ya que es un modelo de visión y no de lenguaje. La innovación principal reside en el uso de keypoints simétricos y el pipeline de entrenamiento con datos sintéticos, que permite obtener modelos específicos por objeto sin necesidad de anotaciones manuales extensas.

## Capacidades

- Estimación de pose 6D (traslación y rotación) de un objeto rígido concreto (HANDal `obj_000021`) a partir de una imagen RGB.
- Detección de 64 keypoints 2D del objeto, cuyas posiciones 3D están definidas en el archivo `keypoints_3d.json` (en metros).
- Integración con PnP (SolvePnP) para obtener la pose final, como se muestra en el ejemplo de uso.
- Inferencia sobre imágenes individuales, con soporte para múltiples detecciones mediante un umbral de confianza (`score_thr`).
- No soporta generación de texto, tool calling, agentes ni capacidades multimodales más allá de la visión.

## Casos de uso

- Manipulación robótica: un brazo robótico puede localizar y agarrar el objeto HANDal `000021` en una celda de trabajo usando la pose estimada para planificar la trayectoria de agarre. El modelo proporciona keypoints 3D precisos que permiten calcular la orientación exacta del objeto.
- Control de calidad industrial: inspección visual de piezas que corresponden al objeto `000021` en una línea de montaje, verificando que estén correctamente orientadas o posicionadas mediante la pose estimada.
- Realidad aumentada: superposición de modelos 3D o información virtual sobre el objeto físico en tiempo real, usando la pose para alinear el contenido digital con la cámara.
- Automatización de almacenes: detección y localización del objeto en estanterías o contenedores para sistemas de picking automatizado, donde la pose precisa es crítica para el agarre.
- Navegación de robots móviles: el robot puede identificar y evitar o interactuar con el objeto `000021` en su entorno, usando la pose para estimar su posición relativa.
- Investigación en estimación de pose: como modelo de referencia para comparar con otros métodos en el dataset HANDal, especialmente en el contexto del benchmark BOP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a un dataset de resultados (`TontonTremblay/doper2-handal-results`) donde se pueden consultar las tablas de evaluación completas y las cuadrículas de inferencia, pero no se proporcionan cifras concretas en la documentación accesible.

## Requisitos de hardware

- El checkpoint `best.pth` ocupa aproximadamente 0,3 GB, lo que sugiere que el modelo es ligero y puede ejecutarse en GPUs de consumo medio.
- No se especifican requisitos mínimos de VRAM, pero un modelo con backbone ConvNeXt-Tiny y un head de heatmap para 64 keypoints debería caber en GPUs con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050).
- Para inferencia en tiempo real, se recomienda una GPU moderna como RTX 3060 o superior, aunque no hay datos de latencia publicados.
- El código de inferencia está disponible en el paquete `doper2` (no se indica si es público), y el ejemplo usa PyTorch con CUDA. También podría desplegarse con ONNX Runtime o TensorRT si se convierte el modelo, pero no se documenta.
- No se mencionan opciones de despliegue como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros modelos de estimación de pose para el mismo objeto. Modelos genéricos como DOPE original o PoseCNN podrían ser alternativas, pero no se han encontrado datos comparativos en la documentación proporcionada. Se recomienda consultar el dataset de resultados mencionado para comparaciones con otras variantes de DOPER2.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto HANDal `obj_000021`; no es generalizable a otros objetos sin reentrenamiento.
- La estimación de pose depende de la calidad de la imagen y de la calibración de la cámara (matriz intrínseca K), que debe proporcionarse correctamente.
- No se especifican sesgos conocidos, pero al ser un modelo entrenado con datos sintéticos, puede tener dificultades con condiciones de iluminación extremas, oclusiones severas o texturas muy diferentes a las sintéticas.
- Riesgo de alucinación: en visión, esto se traduce en detecciones falsas o keypoints incorrectos cuando el objeto no está presente o está muy ocluido; el umbral de confianza (`score_thr`) puede mitigarlo parcialmente.
- La licencia no está disponible, por lo que se debe contactar con el autor antes de un uso comercial.
- No se proporcionan garantías de rendimiento en producción; se recomienda validar en el entorno específico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000021
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil del autor en GitHub: https://github.com/TontonTremblay
- Dataset DOPER_BOP (modelos por objeto): https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
