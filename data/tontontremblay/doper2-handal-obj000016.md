# TontonTremblay/doper2-handal-obj000016

## Resumen

El modelo `TontonTremblay/doper2-handal-obj000016` es un sistema de estimación de pose 6D (posición y orientación) específico para el objeto `HANDal obj_000016`, entrenado con el pipeline DOPER2 desarrollado por Jonathan Tremblay (TontonTremblay). Este tipo de modelos es fundamental en robótica de manipulación, automatización industrial y realidad aumentada, donde se necesita localizar con precisión un objeto conocido en el espacio tridimensional a partir de imágenes monoculares.

La arquitectura combina un backbone `convnext_tiny.dinov3_lvd1689m` (ConvNeXt-Tiny preentrenado con DINOv3) con una cabeza de detección de 64 keypoints 3D, cuyas posiciones se almacenan en `keypoints_3d.json` en unidades de metros. El modelo se entrena con una mezcla de datos sintéticos (DR synth 10k), datos BOP PBR y pseudo-etiquetas de onboarding, y acepta imágenes de 224 píxeles para el detector y 256 píxeles para el recorte del keypoint. El repositorio ocupa 0,3 GB e incluye el checkpoint `best.pth`, la configuración y la procedencia del entrenamiento.

Aunque no se especifican parámetros totales ni licencia, el modelo está diseñado para ser usado con la librería `doper2.infer` y `cv2.solvePnP` para obtener la pose final. Es una solución especializada, no un modelo generalista, y su relevancia radica en la precisión para un objeto concreto dentro del benchmark HANDal.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Tiny (DINOv3) + cabeza de heatmap para 64 keypoints |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth) |

## Arquitectura y entrenamiento

El modelo utiliza un backbone `convnext_tiny.dinov3_lvd1689m`, que combina la arquitectura ConvNeXt-Tiny con pesos preentrenados mediante DINOv3 (un método de aprendizaje autosupervisado para visión). Sobre este backbone se añade una cabeza de regresión de keypoints basada en mapas de calor (heatmap), que predice 64 puntos 3D del objeto. La entrada al detector es de 224×224 píxeles, mientras que el recorte del keypoint se procesa a 256×256 píxeles.

El entrenamiento sigue el pipeline DOPER2 en su etapa V5, que combina tres fuentes de datos: 10 000 imágenes sintéticas generadas con DR (Domain Randomization), datos BOP PBR (fotorrealistas) y pseudo-etiquetas obtenidas durante el onboarding del objeto. Esta mezcla busca mejorar la robustez ante variaciones de iluminación, textura y oclusión. No se especifica el número total de tokens ni el proceso de optimización (RLHF, DPO, etc.), ya que no es un modelo de lenguaje.

## Capacidades

- Estimación de pose 6D (rotación y traslación) de un objeto específico (`HANDal obj_000016`) a partir de imágenes monoculares.
- Detección de 64 keypoints 3D cuyas coordenadas se expresan en metros, lo que permite una reconstrucción métrica del objeto.
- Integración directa con `cv2.solvePnP` para obtener la pose final a partir de las correspondencias 2D-3D.
- Inferencia sobre imágenes individuales o secuencias de vídeo, siempre que el objeto esté presente.
- No soporta generación de texto, código, tool calling ni capacidades multimodales más allá de la visión.

## Casos de uso

- Robótica de manipulación: el modelo permite a un brazo robótico localizar con precisión el objeto `HANDal obj_000016` en el espacio, calculando la pose necesaria para un agarre correcto. Su salida en metros facilita la planificación de trayectorias.
- Control de calidad industrial: en una línea de montaje, el modelo puede verificar que el objeto está en la posición y orientación esperadas, comparando la pose estimada con la nominal.
- Realidad aumentada: al conocer la pose 6D del objeto, se pueden superponer modelos 3D o información contextual sobre la imagen en tiempo real, útil para guiado de operarios o mantenimiento.
- Automatización de almacenes: para tareas de picking, el modelo ayuda a un sistema robótico a identificar y recoger el objeto de una caja o estantería, incluso con oclusiones parciales.
- Investigación en visión por computador: sirve como referencia para evaluar pipelines de estimación de pose en el benchmark HANDal, comparando resultados con otros métodos.
- Integración en sistemas de visión con cámara monocular: al ser un modelo ligero (0,3 GB), puede desplegarse en equipos con GPU moderada para aplicaciones embebidas o de borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor referencia un dataset externo con tablas de evaluación completas y cuadrículas de inferencia en [TontonTremblay/doper2-handal-results](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results), pero no se incluyen métricas numéricas (como error de keypoint o precisión de pose) en la model card. Se recomienda consultar ese enlace para obtener datos de rendimiento sobre el conjunto de validación BOP.

## Requisitos de hardware

- El tamaño del repositorio es de 0,3 GB, lo que sugiere que el checkpoint cabe en GPUs de consumo medio (por ejemplo, 4-6 GB de VRAM), aunque no se especifica el número exacto de parámetros.
- Se requiere una GPU compatible con CUDA para la inferencia con PyTorch; el ejemplo de uso indica `device="cuda:0"`.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090 o superiores, dependiendo de la resolución de entrada y el lote.
- Opciones de despliegue: la librería `doper2.infer` es la vía principal; no se mencionan formatos como ONNX, TensorRT o GGUF.
- Latencia y throughput: no disponibles en la documentación proporcionada.

## Comparativa con modelos similares

No disponible. Este modelo es específico para un único objeto (`HANDal obj_000016`) y no se proporcionan comparaciones con otras implementaciones de estimación de pose en la información disponible. Modelos generalistas como YOLO-pose o DeepLabCut no son directamente comparables por su alcance y arquitectura.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para el objeto `HANDal obj_000016`; no generaliza a otros objetos sin reentrenamiento.
- La licencia no está especificada, por lo que se recomienda contactar con el autor antes de un uso comercial.
- Depende de la calidad de los datos sintéticos y pseudo-etiquetas; puede fallar en condiciones de iluminación extrema, oclusiones severas o fondos muy diferentes a los de entrenamiento.
- No es un modelo de lenguaje, por lo que no aplican sesgos lingüísticos ni riesgos de alucinación textual.
- La salida de keypoints está en metros, pero la precisión final depende de la calibración de la cámara (matriz K) y de la calidad de la imagen.
- El pipeline de inferencia requiere conocimientos de `cv2.solvePnP` y de la librería `doper2`, lo que añade una curva de aprendizaje para su integración.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TontonTremblay/doper2-handal-obj000016)
- [Dataset de resultados BOP](https://huggingface.co/datasets/TontonTremblay/doper2-handal-results)
- [Perfil del autor en Hugging Face](https://huggingface.co/TontonTremblay)
- [GitHub del autor](https://github.com/TontonTremblay)
