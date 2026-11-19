# tomas478/room-dirtiness-yolov8n

## Resumen

`tomas478/room-dirtiness-yolov8n` es un checkpoint de deteccion de objetos basado en YOLOv8n (Ultralytics) afinado para detectar cinco clases relacionadas con la suciedad en habitaciones: derrame de liquido, papelera, basura dispersa, moho y manchas. Lo publica el usuario tomas478 en Hugging Face bajo licencia MIT. El modelo parte de los pesos `yolov8n.pt` preentrenados en COCO y se reentrena sobre un dataset propio de 1.200 imagenes de entrenamiento, 150 de validacion y 150 de test.

Se trata de un modelo de vision por computador puramente de deteccion (no genera texto), con 3.138.975 parametros y una latencia mediana de 17,8 ms por inferencia en el hardware de entrenamiento. Resuelve un problema acotado de inspeccion visual automatizada: identificar tipos concretos de suciedad en imagenes de interiores, algo relevante para robotica de limpieza, mantenimiento de instalaciones o auditoria de higiene.

La relevancia actual es practica: es un modelo pequeno, ligero y desplegable en GPU de consumo, con metricas de test razonables (mAP50 de 0,936) pero con clases claramente mas debiles (manchas y moho) que conviene tener en cuenta antes de usarlo en produccion. El repositorio ocupa 0,0 GB segun la ficha de Hugging Face y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOv8n (Ultralytics), red neuronal convolucional de deteccion de objetos en una etapa |
| Parametros totales | 3.138.975 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; el formato nativo es PyTorch `.pt`) |
| Idiomas soportados | no disponible (no aplica; modelo de vision) |
| Licencia | MIT |
| Formato de pesos | `.pt` (checkpoint Ultralytics/PyTorch) |

## Arquitectura y entrenamiento

El modelo es un detector YOLOv8n, la variante "nano" de la familia YOLOv8 de Ultralytics: una CNN de una sola etapa con backbone CSPDarknet, cuello PAN-FPN y cabecera de deteccion desacoplada. No es un transformer ni un modelo MoE; no hay mecanismos de atencion lineal ni decodificacion especulativa. La entrada de entrenamiento e inferencia es de 640x640 pixeles (`imgsz=640`).

El entrenamiento parte de los pesos `yolov8n.pt` preentrenados en COCO y se afina sobre un dataset fusionado de room-dirtiness con 1.200 imagenes de train, 150 de validacion y 150 de test (split con semilla 44). Se usaron 40 epocas, batch 16 y `optimizer=auto` (que resuelve a AdamW), con la receta por defecto de Ultralytics tras una busqueda de hiperparametros de 30 epocas (`runs/hparam30`). El hardware fue una NVIDIA RTX PRO 4000 Blackwell con Ultralytics 8.4.215 y PyTorch 2.11+cu128. No se documenta composicion del dataset, aumento de datos ni tecnicas de regularizacion adicionales.

## Capacidades

- Deteccion de objetos en imagenes de interiores para cinco clases: derrame de liquido, papelera, basura dispersa, moho y mancha.
- Salida de cajas delimitadoras con clase y confianza por deteccion (formato estandar Ultralytics).
- Inferencia sobre imagenes individuales o lotes mediante `model.predict()`.
- Carga directa desde Hugging Face con `hf_hub_download` y `YOLO(path)`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente perceptivo.
- No tiene capacidades multilingues, de generacion de texto, de audio ni de vision-lenguaje.

## Casos de uso

- Robotica de limpieza: un robot domestico o de oficina puede usar el modelo para localizar derrames, papeleras y basura antes de planificar la ruta de limpieza; su tamano (3,1 M de parametros) y latencia (17,8 ms) permiten ejecutarlo en el propio robot o en un borde cercano.
- Auditoria de higiene en instalaciones: procesar lotes de fotos de habitaciones de hotel, residencias o centros sanitarios para detectar manchas, moho o basura y priorizar inspecciones humanas.
- Mantenimiento preventivo de edificios: deteccion temprana de moho en paredes o techos a partir de fotos periodicas, con la cautela de que la clase `mould` tiene el mAP50-95 mas bajo (0,570).
- Control de calidad en alquiler vacacional o gestion de activos: revision automatica de fotos de check-out frente a check-in para detectar suciedad o danos.
- Preetiquetado para anotacion: usar las detecciones del modelo como propuesta inicial en un pipeline de etiquetado humano, reduciendo el coste de anotar nuevas imagenes de suciedad.
- Prototipado rapido en GPU de consumo: al ser un YOLOv8n, cabe en cualquier GPU moderna e incluso en CPU, lo que permite validar un caso de uso de vision antes de invertir en un modelo mayor.
- Integracion en aplicaciones moviles o edge: exportable a formatos ligeros de Ultralytics (aunque el autor no documenta exportaciones) para inspeccion en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Metricas de test publicadas por el autor sobre un holdout de 150 imagenes:

| Metrica | Valor |
|---|---:|
| mAP50 | 0,936 |
| mAP50-95 | 0,697 |
| Precision | 0,934 |
| Recall | 0,846 |
| Parametros | 3.138.975 |
| Latencia p50 | 17,8 ms |

Desglose por clase (mAP50-95 / precision / recall):

| Clase | mAP50-95 | Precision | Recall |
|---|---:|---:|---:|
| liquid spillage | 0,740 | 0,895 | 0,902 |
| bin | 0,797 | 0,948 | 0,882 |
| litter | 0,900 | 0,994 | 0,973 |
| mould | 0,570 | 0,899 | 0,750 |
| stain | 0,477 | 0,934 | 0,723 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint `.pt` en FP32; el modelo tiene 3,1 M de parametros y entrada de 640x640.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; el autor entreno en una NVIDIA RTX PRO 4000 Blackwell.
- Cabe en GPU de consumo: si, en GTX 1650, RTX 3050, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Ultralytics (`YOLO`), exportacion a ONNX, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics (no documentadas por el autor), y `huggingface_hub` para la descarga.
- Latencia y throughput: 17,8 ms de mediana por inferencia en el hardware de entrenamiento; el throughput no esta documentado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | mAP50-95 | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| room-dirtiness-yolov8n (este) | 3,14 M | 640x640 | 0,697 | MIT | Hugging Face |
| YOLOv8n (COCO, Ultralytics) | ~3,2 M | 640x640 | no disponible en la informacion | AGPL-3.0 (Ultralytics) | GitHub / docs |
| YOLOv8s (COCO, Ultralytics) | ~11,2 M | 640x640 | no disponible en la informacion | AGPL-3.0 (Ultralytics) | GitHub / docs |

La comparativa con otros detectores afinados para suciedad no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Clases debiles: `stain` (mAP50-95 0,477) y `mould` (0,570) tienen un rendimiento notablemente inferior al resto; no son fiables para decisiones automatizadas sin revision humana.
- Dataset pequeno: 1.200 imagenes de entrenamiento y 150 de test; las metricas pueden no generalizar a dominios, iluminaciones o tipos de suciedad distintos de los del dataset.
- Sin informacion sobre composicion del dataset ni sesgos: no se documenta la procedencia de las imagenes, la distribucion geografica ni posibles sesgos de clase.
- Riesgo de falsos positivos y negativos: precision 0,934 y recall 0,846 globales implican que una parte de la suciedad real no se detecta.
- Sin contexto linguistico: no procesa texto ni instrucciones; solo devuelve cajas y clases.
- Licencia MIT declarada por el autor, pero los pesos base de Ultralytics YOLOv8 estan bajo AGPL-3.0; conviene verificar la compatibilidad para uso comercial antes de desplegar.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; tratar como prototipo.
- No se documentan cuantizaciones ni exportaciones probadas; el rendimiento en ONNX/TensorRT puede diferir del reportado en PyTorch.

## Enlaces

- Hugging Face: https://huggingface.co/tomas478/room-dirtiness-yolov8n
- Ultralytics (framework y pesos base): https://github.com/ultralytics/ultralytics
- Documentacion de Ultralytics: https://docs.ultralytics.com
- No se han encontrado papers, blogs, repos ni demos adicionales en la informacion disponible.
