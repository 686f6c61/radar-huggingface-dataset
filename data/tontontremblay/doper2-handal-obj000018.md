# TontonTremblay/doper2-handal-obj000018

## Resumen

DOPER2 — HANDal obj_000018 es un modelo de estimación de pose 6D para el objeto concreto `000018` de la colección HANDal, entrenado con el pipeline DOPER2 por Jonathan Tremblay (TontonTremblay). El modelo predice 64 keypoints 3D en metros a partir de una imagen RGB, permitiendo resolver la pose del objeto mediante PnP. Está diseñado para integrarse en sistemas de robótica o visión por computador que necesiten localizar y orientar este objeto específico en entornos reales o simulados.

El checkpoint utiliza un backbone `convnext_tiny.dinov3_lvd1689m` y una cabeza de keypoints por mapa de calor (heatmap). El pipeline de entrenamiento corresponde a la etapa V5, que combina datos sintéticos DR (10k), imágenes BOP PBR y pseudo-etiquetas de onboarding. El repositorio incluye el checkpoint, la configuración, las posiciones 3D de los keypoints y un archivo de procedencia del entrenamiento. No se dispone de información sobre licencia, idiomas ni formato de pesos más allá de los archivos incluidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `convnext_tiny.dinov3_lvd1689m` + cabeza de keypoints por heatmap |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de vision) |
| Licencia | no disponible |
| Formato de pesos | `best.pth` (PyTorch), `config.yaml`, `keypoints_3d.json`, `training_provenance.json` |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de dos etapas: un detector que opera a 224 px de entrada y una cabeza de keypoints que procesa crops de 256 px. El backbone es `convnext_tiny` preentrenado con DINOv3 sobre un corpus de 1689 millones de imágenes (lvd1689m). La cabeza de keypoints genera mapas de calor para 64 puntos 3D definidos en `keypoints_3d.json`, expresados en metros. El entrenamiento corresponde a la etapa V5 del pipeline DOPER2, que combina datos sintéticos DR (10k muestras), imágenes BOP PBR y pseudo-etiquetas de onboarding. No se especifican detalles sobre el número total de parámetros, el dataset exacto de entrenamiento ni el uso de técnicas como RLHF o DPO, que no son aplicables a este tipo de modelo.

## Capacidades

- Estimación de pose 6D (rotación y traslación) para el objeto HANDal `000018` a partir de una imagen RGB.
- Predicción de 64 keypoints 3D en metros, que pueden usarse con `cv2.solvePnP` para obtener la pose completa.
- Integración con el pipeline de inferencia DOPER2 (`doper2.infer.load_model` e `infer_image`).
- Detección del objeto en la imagen con umbral de confianza configurable (`score_thr`).
- Soporte para inferencia en GPU (dispositivo `cuda:0` en el ejemplo de uso).
- No incluye capacidades de texto, tool calling, agentes ni multilingüismo, al ser un modelo puramente visual.

## Casos de uso

- Manipulación robótica: el modelo permite a un brazo robótico localizar y agarrar el objeto HANDal `000018` en un entorno de trabajo, proporcionando la pose 6D necesaria para planificar la trayectoria de agarre.
- Control de calidad en fabricación: verificar la orientación y posición correcta del objeto en una línea de montaje mediante visión por computador, usando la pose estimada para comparar con la esperada.
- Realidad aumentada industrial: superponer información digital sobre el objeto físico en tiempo real, utilizando la pose 6D para anclar correctamente los elementos virtuales.
- Navegación autónoma en interiores: si el objeto forma parte del mobiliario (por ejemplo, un tirador de puerta), el modelo puede ayudar a un robot móvil a localizar puntos de interacción.
- Benchmarking de pipelines de estimación de pose: el checkpoint sirve como referencia para evaluar el rendimiento del pipeline DOPER2 en el objeto `000018`, comparando con otros métodos en el dataset BOP.
- Investigación en aprendizaje con datos sintéticos: el modelo demuestra la viabilidad de entrenar estimadores de pose con datos generados sintéticamente (DR + PBR), útil para estudiar la transferencia sim-to-real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un dataset externo (`TontonTremblay/doper2-handal-results`) para las tablas completas de evaluación BOP val del objeto `000018`, pero no se incluyen cifras concretas en el README. No se proporcionan valores de MMLU, HumanEval u otros benchmarks típicos de modelos de lenguaje, ya que este es un modelo de visión.

## Requisitos de hardware

- El tamaño del repositorio es de 0.3 GB, lo que sugiere un checkpoint de aproximadamente 200-300 MB (el backbone `convnext_tiny` tiene alrededor de 28 millones de parámetros, aunque el total no está confirmado).
- VRAM estimada: no disponible con exactitud, pero un modelo de este tamaño debería caber en GPUs con 4-6 GB de VRAM en FP32, y menos en FP16.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 3060, RTX 4090, A100). El ejemplo de uso emplea `cuda:0`.
- Es probable que quepa en GPUs de consumo (gama media y alta), aunque no se ha verificado.
- Opciones de despliegue: el modelo se usa mediante el paquete `doper2` (inferencia en Python con PyTorch). No se mencionan formatos como ONNX, TensorRT, vLLM u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado en la informacion proporcionada modelos comparables de estimación de pose para el mismo objeto o con el mismo pipeline. El modelo es específico para un objeto concreto y no se dispone de alternativas de la misma categoría para comparar.

## Limitaciones y advertencias

- El modelo está entrenado específicamente para el objeto HANDal `000018`; no funcionará con otros objetos sin reentrenamiento.
- No se especifica la licencia, por lo que el uso comercial puede ser incierto. Se recomienda contactar con el autor antes de usar en producción.
- La precisión de la pose depende de la calidad de la imagen y de la calibración de la cámara (matriz K). Errores en la calibración degradarán los resultados.
- El modelo puede presentar alucinaciones de keypoints en imágenes muy diferentes a las del entrenamiento (por ejemplo, condiciones de iluminación extremas u oclusiones severas).
- No hay información sobre sesgos, pero al ser un modelo visual entrenado con datos sintéticos, puede tener un rendimiento inferior en entornos reales no representados en el dataset de entrenamiento.
- El pipeline de inferencia requiere el paquete `doper2` y sus dependencias, que no están documentados en la model card.
- No se proporcionan métricas de rendimiento cuantitativas, lo que dificulta evaluar su precisión real antes de probarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TontonTremblay/doper2-handal-obj000018
- Dataset de resultados BOP: https://huggingface.co/datasets/TontonTremblay/doper2-handal-results
- Perfil del autor en Hugging Face: https://huggingface.co/TontonTremblay
- Perfil de GitHub del autor: https://github.com/TontonTremblay
- Dataset DOPER_BOP: https://huggingface.co/datasets/TontonTremblay/DOPER_BOP
