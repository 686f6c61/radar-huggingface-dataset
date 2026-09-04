# zjumty/so101-yolo11n-seg-plastic-cup

## Resumen

El modelo `so101-yolo11n-seg-plastic-cup` es un modelo de segmentación de instancias desarrollado por `zjumty` a partir de la arquitectura YOLO11n-Seg de Ultralytics. Se ha afinado para segmentar la clase `plastic_cup` en la escena de simulación SO-101, un entorno MuJoCo empleado en robótica. El entrenamiento se realizó con un dataset sintético de 1.200 imágenes de 640x480 píxeles generadas mediante el componente `task_camera`, con anotaciones precisas creadas por Object-ID.

La relevancia del modelo radica en que ofrece una solución específica para la percepción de objetos en entornos simulados, lo que resulta útil para el desarrollo de pipelines de visión en robótica. La arquitectura es una red neuronal convolucional de detección y segmentación de instancias en tiempo real, y el tamaño corresponde a la variante nano de YOLO11. Al tratarse de un modelo de visión, no se dispone de longitud de contexto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-Seg (red neuronal convolucional de detección y segmentación de instancias) |
| Parametros totales | no disponible (variante nano de la familia YOLO11) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión, no aplica) |
| Tipos de cuantizacion | no disponible (checkpoint en `best.pt`; la librería Ultralytics permite exportar a otros formatos y cuantizaciones) |
| Idiomas soportados | no disponible (modelo de visión, no procesa texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `best.pt` (PyTorch); exportable a ONNX, TensorRT, CoreML y TFLite mediante Ultralytics |

## Arquitectura y entrenamiento

El modelo parte del checkpoint preentrenado `yolo11n-seg.pt` de Ultralytics y se ha afinado mediante entrenamiento de segmentación de instancias. El dataset utilizado contiene 1.200 imágenes sintéticas de 640x480 píxeles, renderizadas desde la escena MuJoCo SO-101 a través de `task_camera`. Las máscaras de segmentación se generaron mediante Object-ID, lo que evita la anotación manual. La división del dataset es fija por rangos de semilla: 800 imágenes de entrenamiento, 200 de validación y 200 de test. La única clase presente es `plastic_cup` (`class_id=0`), e incluye escenas sin vaso, con un vaso y con múltiples vasos.

El entrenamiento se ejecutó durante 100 épocas con un tamaño de lote de 32, semilla fija `20260831`, modo determinista activado, dispositivo CUDA y AMP desactivado; el optimizador se seleccionó automáticamente. Como innovación técnica destaca el uso de datos sintéticos y supervisión por Object-ID, que permite obtener anotaciones precisas sin coste de etiquetado. No se aplicaron técnicas de RLHF ni DPO, al tratarse de un modelo de visión.

## Capacidades

- Segmentación de instancias de la clase `plastic_cup` en imágenes de la escena SO-101.
- Detección y segmentación de escenas con cero, uno o múltiples vasos de plástico.
- Inferencia en tiempo real gracias a la arquitectura YOLO11n, optimizada para visión por computador.
- Integración directa con el ecosistema Ultralytics (entrenamiento, predicción y exportación).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No procesa texto ni lenguaje, por lo que no es multilingüe.
- No dispone de capacidades de visión adicionales más allá de la segmentación de instancias.

## Casos de uso

- Robótica manipuladora: el modelo puede localizar vasos de plástico en la escena simulada SO-101 para guiar un brazo robótico en tareas de agarre. Su entrenamiento con datos sintéticos permite iterar rápidamente sin necesidad de anotar datos reales.
- Control de calidad automatizado: en una línea de producción simulada, el modelo puede detectar la presencia o ausencia de vasos de plástico y segmentar su contorno para verificar su posición u orientación.
- Generación de datos de entrenamiento: el checkpoint puede usarse para etiquetar automáticamente nuevas imágenes sintéticas de la misma escena, reduciendo el coste de anotación manual.
- Investigación en percepción robótica: sirve como modelo base para estudiar el rendimiento de la segmentación de instancias en entornos simulados, especialmente con objetos pequeños o parcialmente ocluidos.
- Benchmark de segmentación: puede emplearse como referencia para comparar otros modelos de segmentación en el escenario SO-101, gracias a las métricas publicadas del split de test.
- Evaluación de políticas de control: al integrarse en un bucle de visión, el modelo puede proporcionar la posición del vaso en tiempo real, útil para validar políticas de control aprendidas en simulación.
- Pruebas de robustez: los datos sintéticos permiten generar variaciones controladas de iluminación o colocación para evaluar la robustez del modelo ante cambios en la escena.

## Benchmarks y rendimiento

Los resultados publicados corresponden al split de test sintético fijo, según la model card:

| Metrica | Cajas | Mascaras |
|---|---|---|
| Precision | 0.999735 | 0.999735 |
| Recall | 1.000000 | 1.000000 |
| mAP50 | 0.995000 | 0.995000 |
| mAP50-95 | 0.995000 | 0.973662 |

Estos valores describen únicamente el split de test sintético. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Ultralytics (Python), con posibilidad de exportar a ONNX, TensorRT, CoreML y TFLite.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de modelos comparables en la información proporcionada. El modelo es un afinado específico de `yolo11n-seg.pt` para el escenario SO-101, y no se han publicado comparaciones con otros checkpoints de segmentación.

## Limitaciones y advertencias

- El modelo solo ha sido evaluado en el split de test sintético; no establece precisión en cámaras reales, apariencias desconocidas de vasos ni éxito de agarre físico.
- Únicamente segmenta la clase `plastic_cup`; no detecta otros objetos ni clases adicionales.
- El dataset sintético contiene 1.200 imágenes, un volumen limitado que puede restringir la generalización.
- La licencia AGPL-3.0 impone obligaciones de copyleft, especialmente en usos comerciales o distribución del modelo.
- Según la model card, el repositorio es privado y el dataset sintético no tiene una licencia separada declarada, lo que puede limitar su uso.
- El checkpoint hereda los requisitos de licencia de la base Ultralytics YOLO11.
- No se han documentado sesgos específicos, pero al tratarse de datos sintéticos puede haber desajustes frente a datos reales, lo que podría provocar falsos positivos o negativos.

## Enlaces

- HuggingFace: https://huggingface.co/zjumty/so101-yolo11n-seg-plastic-cup
- GitHub Ultralytics YOLO11: https://github.com/ultralytics/yolo11
- GitHub Ultralytics (YOLO11 y otros modelos): https://github.com/ultralytics/ultralytics
