# Tingwei-0213/yolov8s-drone-1120

## Resumen

`yolov8s-drone-1120` es un detector de objetos de una sola clase (`drone`) basado en YOLOv8s, desarrollado por el usuario de Hugging Face Tingwei-0213 en el marco de un proyecto universitario de reconocimiento de patrones. El modelo es un ajuste fino de un detector previo (`yolov8s-drone-1118`) sobre metraje adicional en primera persona de dron (drone-POV), es decir, la vista desde la cámara de un dron pequeño, que es la perspectiva de despliegue prevista. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y el tamaño declarado es de 0,0 GB (pesos en un único fichero `1120best.pt`).

El modelo resuelve la detección de drones en imágenes y vídeo, una tarea relevante para vigilancia aérea, análisis de tráfico aéreo no tripulado y proyectos de investigación en visión por computador. La arquitectura es la de YOLOv8s de Ultralytics (familia de detectores one-stage basados en CNN), con un tamaño de entrada de 960 píxeles durante el entrenamiento y la inferencia. El conjunto de entrenamiento es muy reducido (1.226 imágenes) y las anotaciones son pseudo-etiquetas automáticas generadas con Grounding DINO, no verificadas exhaustivamente por humanos.

Se trata de un modelo experimental de estudiante, no validado contra verdad de referencia anotada manualmente, y el propio autor advierte que no es apto para uso en sistemas críticos de seguridad. Su interés es principalmente académico y como punto de partida para experimentos de detección de drones con YOLOv8.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | YOLOv8s (detector one-stage basado en CNN, Ultralytics) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (pesos `.pt` de PyTorch; se puede exportar a otros formatos con Ultralytics, pero no se documenta) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; las etiquetas son `drone` en inglés) |
| Licencia | AGPL-3.0 |
| Formato de pesos | `.pt` (PyTorch, fichero `1120best.pt`) |

## Arquitectura y entrenamiento

El modelo es un YOLOv8s, un detector de objetos one-stage de la familia YOLOv8 de Ultralytics. Se desconoce el número exacto de parámetros del checkpoint publicado, pero la variante "s" (small) de YOLOv8 se sitúa en el orden de los 11 millones de parámetros en su configuración estándar de detección; el dato concreto de este fichero no está disponible en la información proporcionada. La entrada de inferencia recomendada es de 960×960 píxeles.

El ajuste fino parte de `best1118.pt` (modelo `Tingwei-0213/yolov8s-drone-1118`) y se realizó con Ultralytics 8.4.x, AdamW, `lr0=0.0005`, hasta 60 épocas con parada temprana en la 52 (mejor época 27), batch 16 y semilla 0. El conjunto de datos consta de 1.226 imágenes (1.004 de entrenamiento y 220 de validación): 684 imágenes del modelo anterior (2 vídeos exteriores y 12 fotos de móvil de un cuadricóptero), 491 positivos drone-POV de 2 vídeos (960×720, cámara en ángulo bajo, dron en suelo, cerca, lejos o volando, muestreados cada 8 fotogramas) y 51 negativos de fondo sin dron (primeros planos de suelo, personas, fotogramas borrosos o sobreexpuestos). Todas las cajas son pseudo-etiquetas automáticas generadas con Grounding DINO base (dos prompts más volteo, fusión de cajas con filtro de acuerdo), revisadas a ojo pero no verificadas exhaustivamente por humanos; se eliminaron 14 fotogramas pixelados o corruptos y 19 fotogramas de baja confianza rescatados temporalmente. Las imágenes de entrenamiento no se publican por contener personas.

## Capacidades

- Detección de objetos de una sola clase: `drone` (dron / UAV) en imágenes y vídeo.
- Inferencia sobre fotogramas individuales o secuencias de vídeo mediante la API de Ultralytics (`model.predict`).
- Umbral de confianza ajustable: el autor recomienda `conf=0.22` para maximizar detecciones y `conf=0.6` para reducir falsos positivos a costa de más omisiones.
- Funciona mejor en la perspectiva de cámara de dron (drone-POV) y en escenas con el dron en suelo, cerca, lejos o en vuelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es exclusivamente un detector visual.
- No dispone de modo "thinking", visión general, audio ni otras capacidades especiales más allá de la detección.

## Casos de uso

- Vigilancia de espacio aéreo en entornos controlados: el modelo puede procesar fotogramas de cámaras fijas o de dron para marcar la presencia de un UAV, con umbral de confianza ajustado según la tolerancia a falsos positivos.
- Análisis de vídeo grabado desde dron: al estar ajustado sobre metraje drone-POV, es adecuado para revisar grabaciones de vuelo y localizar el propio dron u otros drones en la escena.
- Proyectos académicos de visión por computador: sirve como línea base reproducible (pesos, hiperparámetros y protocolo de evaluación documentados) para experimentos de detección de drones con YOLOv8.
- Detección de drones en imágenes de móvil o cámara terrestre: el conjunto de entrenamiento incluye 12 fotos de móvil de un cuadricóptero, por lo que puede usarse en escenarios de fotografía terrestre con limitaciones.
- Filtrado previo en pipelines de anotación: las detecciones pueden servir como propuestas para revisión humana o para generar nuevas pseudo-etiquetas en un bucle de autoentrenamiento.
- Prototipos de sistemas anti-dron o de monitorización: como componente de detección en un sistema mayor, siempre con supervisión humana y sin uso en seguridad crítica, dado que el autor lo desaconseja explícitamente.
- Experimentos de aumento de datos y negativos duros: los 51 negativos de fondo y las pruebas con vídeos de salpicadero sin dron permiten estudiar la tasa de falsos positivos en escenas cotidianas.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas del autor, no benchmarks públicos estándar. La validación alcanzó un mAP50-95 de 0,877, pero sobre una partición de validación extraída de las mismas sesiones de grabación que el entrenamiento, por lo que el autor advierte que no es una estimación independiente.

La comparación de regresión frente a `best1118.pt` usa pseudo-verdad de referencia (Grounding DINO, IoU ≥ 0,5):

| Conjunto de prueba | conf | F1 nuevo | F1 `best1118` | Diferencia (IC 95% bootstrap por bloques) |
|---|---|---|---|---|
| testv4 (538 fotogramas) | 0,22 | 0,837 | 0,757 | +0,080 (+0,002, +0,168) |
| testv4 | 0,6 | 0,819 | 0,736 | +0,082 (-0,003, +0,172) |
| test1118, superposición eliminada (769 fotogramas) | 0,22 | 0,978 | 0,700 | +0,278 (+0,154, +0,417) |
| IMG_8020, 2 drones (331 fotogramas) | 0,22 | 0,938 | 0,891 | +0,046 (+0,024, +0,072) |
| IMG_8020 | 0,6 | 0,940 | 0,937 | +0,003 (+0,001, +0,008) |

Falsas alarmas en dos vídeos de salpicadero sin dron (fotogramas con al menos una caja):

| Vídeo | conf | Nuevo | `best1118` |
|---|---|---|---|
| Salpicadero 1 (699 fotogramas) | 0,22 | 38/699 | 581/699 |
| Salpicadero 2 (150 fotogramas) | 0,22 | 12/150 | 108/150 |
| Salpicadero 1 | 0,6 | 3/699 | 206/699 |
| Salpicadero 2 | 0,6 | 0/150 | 56/150 |

No se han publicado resultados de benchmarks estándar (COCO, VisDrone u otros) en la información disponible. Las referencias son pseudo-etiquetas, no etiquetas humanas, y los vídeos de prueba comparten ubicación y estilo de cámara con el metraje de entrenamiento drone-POV, por lo que las mejoras son en gran medida en dominio y no evidencia de robustez general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para un YOLOv8s a 960×960 se espera un consumo moderado (del orden de pocos GB), pero el dato concreto no está publicado.
- GPU recomendadas: no se especifican en la información disponible. Al ser un YOLOv8s, es probable que funcione en GPU de consumo, pero no hay cifras publicadas.
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; por el tamaño de la variante "s" es plausible, pero no se aporta medición.
- Opciones de despliegue: la única documentada es la librería `ultralytics` con PyTorch (`YOLO(path).predict(...)`). No se documentan exportaciones a ONNX, TensorRT, OpenVINO, vLLM, llama.cpp, Ollama ni TGI (este último no aplica a un detector visual).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clase(s) | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `yolov8s-drone-1120` | YOLOv8s | 1 (`drone`) | 960×960 | mAP50-95 0,877 en validación interna no independiente; F1 0,837 en testv4 (conf 0,22) | AGPL-3.0 | Hugging Face, 0 descargas |
| `Tingwei-0213/yolov8s-drone-1118` | YOLOv8s | 1 (`drone`) | no disponible | F1 0,757 en testv4 (conf 0,22) | AGPL-3.0 | Hugging Face (modelo base del ajuste) |
| YOLOv8s estándar (Ultralytics) | YOLOv8s | 80 (COCO) | 640×640 por defecto | Métricas COCO públicas de Ultralytics (no comparables directamente con este conjunto) | AGPL-3.0 | Repositorio oficial de Ultralytics |

No se dispone de datos de otros detectores específicos de drones en la información proporcionada para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Los drones pequeños y lejanos se detectan mal; las fachadas de edificios y los carteles pueden generar cajas falsas grandes.
- Las cajas predichas pueden ser más altas que las cajas de las pseudo-etiquetas.
- El entrenamiento cubre pocos drones distintos, ubicaciones y condiciones de iluminación.
- Todas las anotaciones son pseudo-etiquetas automáticas de Grounding DINO, revisadas a ojo pero no verificadas exhaustivamente por humanos; la validación no es una estimación independiente.
- En `new1.mp4` (dron diminuto y lejano) el modelo dispara en más fotogramas (123 frente a 29 a conf 0,22), con una mezcla de cajas falsas sobre un cartel de edificio y cajas repetidas sobre un objeto oscuro en el suelo que podría ser un dron aterrizado (no verificado).
- No es apto para uso en sistemas críticos de seguridad, según el propio autor.
- Licencia AGPL-3.0: derivado de Ultralytics YOLOv8; el uso comercial está sujeto a las obligaciones de copyleft de la AGPL, lo que puede requerir publicar el código fuente de la aplicación que lo integre.
- Las imágenes de entrenamiento no se publican (contienen personas), lo que limita la reproducibilidad completa.
- No hay información sobre sesgos demográficos, pero al ser un detector de drones el riesgo de sesgo relevante es de dominio (escenas, iluminación y tipos de dron), no social.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tingwei-0213/yolov8s-drone-1120
- Modelo base del ajuste: https://huggingface.co/Tingwei-0213/yolov8s-drone-1118
- Ultralytics YOLOv8 (framework y pesos originales): https://github.com/ultralytics/ultralytics
- Grounding DINO (generador de pseudo-etiquetas): https://github.com/IDEA-Research/GroundingDINO
