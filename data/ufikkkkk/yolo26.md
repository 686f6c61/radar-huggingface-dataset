# Ufikkkkk/YOLO26

## Resumen

YOLO26 es la familia de modelos de visión por computador de Ultralytics para detección de objetos, segmentación (de instancias y semántica), clasificación de imágenes, estimación de pose, detección de objetos orientados (OBB), estimación de profundidad y seguimiento (tracking) sobre vídeo. Se distribuye como un conjunto de modelos de una sola etapa orientados a inferencia en tiempo real, con una arquitectura rediseñada en cuatro ejes: inferencia nativa de extremo a extremo sin supresión de no máximos (NMS) gracias a una cabeza uno-a-uno opcional, regresión de cajas más ligera al eliminar la Distribution Focal Loss (DFL), y optimización explícita para dispositivos de borde y bajo consumo, con hasta un 43 % más de velocidad de inferencia en CPU según el fabricante.

El repositorio analizado, `Ufikkkkk/YOLO26`, es una subida de un tercero (usuario Ufikkkkk) que replica la model card y los artefactos de `Ultralytics/YOLO26`; el desarrollo corresponde a Ultralytics. Se publica bajo licencia AGPL-3.0, con opción de licencia comercial de pago para uso propietario. El repositorio pesa 1,2 GB y se consume principalmente a través de la librería `ultralytics`.

La relevancia actual del modelo está en su vocación de despliegue: exportación a TensorRT, ONNX, CoreML y TFLite, inferencia sin post-proceso NMS y soporte de múltiples tareas bajo una misma API. No es un modelo de lenguaje: los idiomas declarados en la model card (en, zh, ja, ru, de, fr, es, pt, tr, vi, ar) corresponden a los idiomas de la documentación, no a capacidades de generación de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional de una etapa (familia YOLO de Ultralytics), con cabeza de detección uno-a-uno opcional para inferencia de extremo a extremo sin NMS |
| Parámetros totales | No disponible (la información proporcionada no detalla variantes n/s/m/l/x ni recuentos de parámetros) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de visión, sin ventana de contexto textual) |
| Tipos de cuantización | No disponible (el material menciona exportación a TensorRT, ONNX, CoreML y TFLite, sin especificar precisiones ni esquemas de cuantización) |
| Idiomas soportados | en, zh, ja, ru, de, fr, es, pt, tr, vi, ar (idiomas de la documentación del proyecto) |
| Licencia | AGPL-3.0, con licencia comercial empresarial disponible por separado |
| Formato de pesos | No disponible de forma explícita; distribución vía librería `ultralytics` y exportación a TensorRT, ONNX, CoreML y TFLite |
| Tareas soportadas | Detección de objetos, segmentación de instancias, segmentación semántica, clasificación de imágenes, estimación de pose, detección de objetos orientados (OBB), estimación de profundidad, tracking multi-frame |
| Librería | ultralytics |
| Tamaño del repositorio | 1,2 GB |
| Pipeline declarado | object-detection |

## Arquitectura y entrenamiento

La familia YOLO26 se construye sobre cuatro áreas de diseño según la documentación oficial: inferencia nativa de extremo a extremo (una cabeza uno-a-uno opcional que produce predicciones sin NMS, lo que simplifica el despliegue y elimina el post-proceso), regresión de cajas más ligera (se retira la Distribution Focal Loss, reduciendo la complejidad de la cabeza de detección y manteniendo un rango de regresión sin restricciones), una arquitectura más simple y limpia, y optimización para CPU y dispositivos de borde, con hasta un 43 % de mejora en velocidad de inferencia en CPU respecto a la generación anterior.

No se dispone, en la información proporcionada, del número de tokens o imágenes de entrenamiento, de la composición exacta de los datasets (más allá de la evaluación sobre COCO), ni de si se aplicaron etapas de alineación tipo RLHF/DPO (no aplicables en un detector). Tampoco se detalla el esquema de aumento de datos ni la estrategia de destilación o reetiquetado, si la hubiera. El detalle técnico publicado se remite al paper oficial con identificador arXiv:2606.03748.

## Capacidades

- Detección de objetos en imagen: localización y clasificación de instancias con cajas delimitadoras.
- Segmentación de instancias y segmentación semántica por píxel.
- Clasificación de imágenes a nivel de imagen completa.
- Estimación de pose (puntos clave sobre personas u objetos).
- Detección de objetos orientados (OBB) para objetos rotados, típica en imágenes aéreas y satelitales.
- Estimación de profundidad.
- Tracking de objetos detectados a lo largo de fotogramas de vídeo.
- Inferencia de extremo a extremo sin NMS mediante la cabeza uno-a-uno opcional, lo que reduce el post-proceso en producción.
- Exportación e integración con TensorRT, ONNX, CoreML y TFLite, además de integraciones con plataformas de etiquetado, experiment tracking y despliegue (Weights & Biases, Comet ML, Roboflow, Intel OpenVINO).
- No soporta generación de texto, tool calling ni razonamiento multi-paso: es un modelo puramente perceptivo.

## Casos de uso

- Inspección visual en línea de fabricación: detección y segmentación de defectos sobre cadenas de producción a alta cadencia, aprovechando la inferencia sin NMS para reducir la latencia de post-proceso y la exportación a TensorRT para ejecutar en GPU industrial.
- Videovigilancia y analítica de aforo: detección de personas más tracking multi-frame para contar tránsitos, medir ocupación o detectar intrusiones en zonas delimitadas, desplegable en dispositivos de borde por la optimización en CPU.
- Agricultura de precisión y teledetección: uso de la cabeza OBB para detectar cultivos, vehículos o embarcaciones en imágenes aéreas donde las cajas alineadas a los ejes no representan bien la orientación real del objeto.
- Logística y control de inventario: detección y clasificación de palés, cajas y huecos en estanterías a partir de cámaras fijas, con estimación de profundidad para apoyar el cálculo de volumen ocupado.
- Análisis deportivo y biomecánica: estimación de pose sobre vídeo para extraer esqueletos por fotograma y alimentar métricas de movimiento o sistemas de corrección técnica.
- Asistencia a la conducción y robótica móvil: detección de peatones, vehículos y obstáculos en tiempo real, con modelos ligeros exportados a CoreML o TFLite para ejecución local en el vehículo o el robot.
- Moderación y etiquetado automático de contenido: preetiquetado masivo de imágenes para acelerar la anotación humana, usando detección y clasificación como paso previo a la revisión manual.
- Anonimización de vídeo: detección de personas y vehículos para aplicar desenfoque automático antes de publicar material grabado, cumpliendo con requisitos de privacidad.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (model-index). El valor de mAP figura como no verificado.

| Tarea | Dataset | Split | Métrica | Valor | Verificado |
|---|---|---|---|---|---|
| object-detection | coco (merve/coco) | validation | mAP@0.5:0.95 | 57,5 | No |

No se han publicado en la información disponible resultados de otras métricas (mAP@0.5, latencia, FPS, parámetros, FLOPs) ni el desglose por variante de tamaño del modelo. Tampoco se indica a qué variante corresponde el 57,5 de mAP.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la información proporcionada no incluye recuentos de parámetros ni tamaño de las variantes, por lo que no es posible estimar memoria.
- GPU recomendadas: no disponible. La documentación del proyecto está orientada a despliegue en GPU y aceleradores de borde, pero no se citan modelos concretos (A100, H100, RTX 4090 u otros) en el material disponible.
- Viabilidad en GPU de consumo: no confirmada por datos; el fabricante enfatiza la optimización para CPU y dispositivos de borde, lo que sugiere que las variantes ligeras están pensadas para hardware de bajas prestaciones, pero sin cifras publicadas no puede afirmarse.
- Opciones de despliegue: librería `ultralytics` (Python) como vía principal; exportación a TensorRT, ONNX, CoreML y TFLite; integraciones con Intel OpenVINO, Weights & Biases, Comet ML y Roboflow; ejecución en Paperspace Gradient, Google Colab, Kaggle y Binder según los enlaces de la model card.
- Latencia y throughput: no disponible, salvo la afirmación cualitativa del fabricante de hasta un 43 % más de velocidad de inferencia en CPU respecto a la generación anterior.

## Comparativa con modelos similares

| Modelo | Familia / tarea | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| YOLO26 (este repositorio) | YOLO de una etapa; detección, segmentación, pose, OBB, clasificación, profundidad, tracking | No disponible | No aplica | mAP@0.5:0.95 = 57,5 en COCO val (no verificado) | AGPL-3.0 (+ licencia comercial) | HuggingFace (espejo de tercero y repo oficial), GitHub, Kaggle, pip `ultralytics` |
| YOLO11 (Ultralytics) | YOLO de una etapa; conjunto de tareas equivalente | No disponible en la información | No aplica | No disponible en la información | AGPL-3.0 (+ licencia comercial) | Misma librería y canales de distribución |
| YOLOv8 (Ultralytics) | YOLO de una etapa; detección y tareas derivadas | No disponible en la información | No aplica | No disponible en la información | AGPL-3.0 (+ licencia comercial) | Misma librería y canales de distribución |
| RT-DETR (familia DETR en tiempo real) | Transformer de detección de extremo a extremo, sin NMS | No disponible en la información | No aplica | No disponible en la información | No disponible en la información | No disponible en la información |

La información suministrada solo permite comparar de forma cualitativa: YOLO26 se presenta como la generación que introduce inferencia sin NMS y elimina la DFL, con mejoras de velocidad en CPU frente a versiones anteriores de la misma casa. No hay datos de parámetros, latencia ni mAP de los modelos alternativos en el material disponible, por lo que no se ofrece una comparación numérica.

## Limitaciones y advertencias

- Sesgos: no documentados en la información disponible. Al evaluarse sobre COCO, hereda las limitaciones de cobertura de categorías y de representación demográfica y geográfica de ese dataset.
- Falsos positivos y negativos: no existe "alucinación" en sentido lingüístico, pero sí riesgo de detecciones espurias y de objetos no detectados, especialmente ante cambios de dominio (iluminación, clima, ángulos, cámaras distintas a las de entrenamiento) y ante clases no presentes en el conjunto de entrenamiento (COCO cubre 80 categorías).
- Vocabulario cerrado: el modelo predice un conjunto fijo de clases; cualquier dominio específico requiere reentrenamiento o ajuste fino con datos propios.
- Idiomas: las etiquetas de idioma de la model card se refieren a la documentación del proyecto, no a capacidades multilingües del modelo. No procesa texto.
- Licencia: AGPL-3.0 es copyleft y afecta al software distribuido o expuesto como servicio en red; para uso comercial propietario Ultralytics exige una licencia empresarial de pago. Es un punto crítico antes de integrar en producto.
- Procedencia del repositorio: `Ufikkkkk/YOLO26` es una subida de un tercero, con 0 descargas y 0 likes, creada y actualizada el mismo día (24 de octubre de 2026). Para producción conviene usar el repositorio oficial `Ultralytics/YOLO26` o el paquete `ultralytics`, y verificar la integridad de los pesos.
- Benchmark no verificado: el único resultado declarado (mAP@0.5:0.95 = 57,5) figura con `verified: false` y sin indicar variante del modelo ni condiciones de evaluación.
- Ausencia de datos de despliegue: sin parámetros, FLOPs ni latencias publicadas en la información disponible, el dimensionamiento de hardware debe hacerse mediante pruebas propias.
- Modelo puramente perceptivo: no admite instrucciones en lenguaje natural, tool calling ni razonamiento multi-paso; requiere un pipeline externo para cualquier flujo agéntico.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/Ufikkkkk/YOLO26
- HuggingFace (repositorio oficial de Ultralytics): https://huggingface.co/Ultralytics/YOLO26
- Documentación oficial de YOLO26: https://docs.ultralytics.com/models/yolo26
- Página de producto YOLO26: https://www.ultralytics.com/yolo/yolo26
- Repositorio GitHub del proyecto: https://github.com/ultralytics/yolo26
- Repositorio principal de Ultralytics: https://github.com/ultralytics/ultralytics
- Documentación de YOLO26 en el repo principal: https://github.com/ultralytics/ultralytics/blob/main/docs/en/models/yolo26.md
- Documentación general: https://docs.ultralytics.com/
- Paper técnico: https://arxiv.org/abs/2606.03748
- Modelo en Kaggle: https://www.kaggle.com/models/ultralytics/yolo26
- Notebook de ejemplo en Colab: https://colab.research.google.com/github/ultralytics/ultralytics/blob/main/examples/tutorial.ipynb
- Licencia comercial: https://www.ultralytics.com/license
- Plataforma Ultralytics: https://platform.ultralytics.com/ultralytics/yolo26
- Issues y soporte: https://github.com/ultralytics/ultralytics/issues/new/choose
