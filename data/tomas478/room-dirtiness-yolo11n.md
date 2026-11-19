# tomas478/room-dirtiness-yolo11n

## Resumen

El modelo `tomas478/room-dirtiness-yolo11n` es un checkpoint de deteccion de objetos obtenido mediante fine-tuning de Ultralytics YOLO11n sobre un dataset propio de suciedad en habitaciones. Lo desarrolla el usuario de Hugging Face tomas478 y resuelve una tarea de vision por computador muy concreta: localizar y clasificar cinco tipos de suciedad (derrame de liquido, papelera, basura dispersa, moho y mancha) en imagenes de interiores. Se publica bajo licencia MIT y con un tamano de repositorio practicamente nulo, lo que sugiere que los pesos se distribuyen como un unico fichero `best.pt`.

Tecnicamente se apoya en la arquitectura YOLO11n de Ultralytics, la variante "nano" de la familia YOLO11, con 2.605.855 parametros y un pipeline de deteccion en una sola etapa. El entrenamiento se realizo a partir de pesos preentrenados en COCO, con `imgsz=640`, 40 epocas, batch 16 y optimizador AdamW, sobre un dataset fusionado de 1.200 imagenes de entrenamiento, 150 de validacion y 150 de test (semilla de particion 44).

Su relevancia es acotada pero clara: cubre un nicho de inspeccion visual de limpieza en entornos domesticos o de facility management, con un coste computacional minimo (inferencia p50 de 18,5 ms) que permite desplegarlo en dispositivos de borde o en GPUs de consumo. No es un modelo de proposito general ni un LLM: es un detector especializado de cinco clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n (Ultralytics), detector de objetos en una etapa |
| Parametros totales | 2.605.855 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (checkpoint `best.pt` en PyTorch; cuantizacion INT8/FP16 viable via exportacion Ultralytics pero no documentada por el autor) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | MIT |
| Formato de pesos | `best.pt` (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

El modelo es un detector YOLO11n, la variante nano de la familia YOLO11 de Ultralytics. Se trata de una red convolucional de una sola etapa con cuello de agregacion de caracteristicas y cabecera de deteccion anclada, optimizada para latencia baja y bajo numero de parametros. El checkpoint parte de `yolo11n.pt` preentrenado en COCO y se ajusta finamente sobre el dataset de suciedad en habitaciones.

El entrenamiento uso `imgsz=640`, 40 epocas, batch 16 y `optimizer=auto` (que resuelve a AdamW), con una busqueda previa de hiperparametros de 30 epocas (`runs/hparam30`) sobre los valores por defecto de Ultralytics. El dataset fusionado contiene 1.200 imagenes de entrenamiento, 150 de validacion y 150 de test, con semilla de particion 44. El hardware empleado fue una NVIDIA RTX PRO 4000 Blackwell, con Ultralytics 8.4.215 y PyTorch 2.11+cu128. No se documentan tecnicas adicionales como decodificacion especulativa, atencion lineal ni aumentos de datos especificos mas alla del pipeline estandar de Ultralytics.

## Capacidades

- Deteccion de objetos en imagenes de interiores con cinco clases: `liquid spillage`, `bin`, `litter`, `mould` y `stain`.
- Localizacion con cajas delimitadoras y puntuaciones de confianza por clase.
- Inferencia rapida: p50 de 18,5 ms por imagen a `imgsz=640` en el hardware de referencia.
- Integracion nativa con la libreria Ultralytics (`YOLO("best.pt")`) y carga desde el Hub via `huggingface_hub`.
- Exportacion potencial a otros formatos (ONNX, TensorRT, TFLite) mediante las utilidades de Ultralytics, aunque no documentada por el autor.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es exclusivamente un modelo de vision.
- No dispone de modo "thinking", vision multimodal, audio ni generacion de texto.

## Casos de uso

- Inspeccion automatizada de limpieza en habitaciones de hotel: el detector puede procesar fotos tomadas por el personal o por camaras fijas para identificar derrames, papeleras llenas o basura dispersa, y priorizar las habitaciones que requieren atencion antes de la siguiente entrada.
- Mantenimiento de oficinas y facility management: integrado en una app movil, el modelo permite al personal fotografiar una sala y obtener un listado de incidencias (manchas, moho, residuos) con su ubicacion aproximada, reduciendo el tiempo de reporte manual.
- Deteccion temprana de moho en viviendas: la clase `mould` permite alertar sobre zonas con posible proliferacion fungica en cocinas y banos, util para aseguradoras o empresas de rehabilitacion.
- Robotica de limpieza domestica: el modelo puede servir como modulo de percepcion en robots aspiradora o de fregado para localizar manchas y derrames concretos y dirigir el efector hacia ellos en lugar de recorrer toda la estancia.
- Control de calidad en alquiler vacacional: verificacion automatica del estado de la vivienda tras el checkout mediante fotos del huesped o del limpiador, con umbral de confianza configurable para evitar falsos positivos.
- Analisis de imagenes en inspecciones de seguros: clasificacion y localizacion de danos por manchas o derrames en siniestros de hogar, como apoyo a la peritacion con evidencia visual estructurada.
- Prototipado rapido en edge: por su tamano (2,6 M de parametros) y latencia (18,5 ms), puede desplegarse en GPUs de consumo o en dispositivos embebidos para demos y pruebas de concepto de vision en interiores.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre el holdout de test de 150 imagenes:

| Metrica | Valor |
|---|---:|
| mAP50 | 0,925 |
| mAP50-95 | 0,693 |
| Precision | 0,912 |
| Recall | 0,892 |
| Parametros | 2.605.855 |
| Inferencia p50 | 18,5 ms |

Desglose por clase (mAP50-95, precision, recall):

| Clase | mAP50-95 | Precision | Recall |
|---|---:|---:|---:|
| liquid spillage | 0,759 | 0,882 | 0,909 |
| bin | 0,825 | 0,999 | 0,941 |
| litter | 0,905 | 0,981 | 1,000 |
| mould | 0,552 | 0,879 | 0,794 |
| stain | 0,424 | 0,816 | 0,815 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para el checkpoint `best.pt` (2,6 M de parametros); en FP16 o INT8 el consumo es aun menor.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; el autor entreno en una NVIDIA RTX PRO 4000 Blackwell. Para produccion a gran escala, A100, H100 o L4 permiten procesar lotes grandes.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer reciente (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU o CPU para inferencia por lotes pequenos.
- Opciones de despliegue: Ultralytics (`YOLO("best.pt")`), exportacion a ONNX Runtime, TensorRT, OpenVINO o TFLite mediante las utilidades de Ultralytics; no hay integracion documentada con vLLM, llama.cpp, Ollama o TGI, que no aplican a modelos de vision de este tipo.
- Latencia y throughput: p50 de 18,5 ms por imagen a `imgsz=640` en el hardware de referencia; el throughput agregado depende del batch y del backend de exportacion, no documentado por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / tarea | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tomas478/room-dirtiness-yolo11n | 2,6 M | Deteccion de 5 clases de suciedad | mAP50-95 0,693 en holdout de 150 imagenes | MIT | Hugging Face |
| Ultralytics YOLO11n (COCO) | ~2,6 M | Deteccion de 80 clases COCO | No comparable directamente (otro dataset y clases) | AGPL-3.0 / comercial | Ultralytics, Hugging Face |
| YOLOv8n (COCO) | ~3,2 M | Deteccion de 80 clases COCO | No comparable directamente | AGPL-3.0 / comercial | Ultralytics, Hugging Face |

No se dispone de otros detectores especializados en suciedad de habitaciones en la informacion proporcionada para una comparacion cuantitativa directa.

## Limitaciones y advertencias

- El modelo se entrena sobre un dataset pequeno (1.200 imagenes de entrenamiento) y un holdout de solo 150 imagenes; las metricas pueden no generalizar a dominios visuales distintos (iluminacion, tipos de suelo, angulos de camara).
- Las clases `stain` (mAP50-95 0,424) y `mould` (0,552) tienen un rendimiento claramente inferior al resto; su uso en produccion requerira umbrales de confianza mas conservadores y validacion adicional.
- Riesgo de falsos positivos y negativos en escenas con texturas o patrones que se confundan con manchas o moho; no se documentan analisis de sesgo ni de robustez.
- No es un modelo multimodal ni de lenguaje: no interpreta texto, no responde preguntas y no soporta tool calling ni agentes.
- Aunque la licencia es MIT, el modelo deriva de pesos YOLO11n de Ultralytics, cuya licencia original es AGPL-3.0 con opcion comercial; conviene revisar las obligaciones de la licencia base antes de un despliegue comercial.
- No se documentan limitaciones de idioma porque el modelo no procesa lenguaje, pero tampoco se documenta el idioma ni la procedencia de las imagenes de entrenamiento.
- La fecha de creacion del repositorio (2026-11-19) y el tamano de 0.0 GB sugieren que el fichero de pesos puede no estar subido o que el repositorio esta incompleto; verificar la disponibilidad de `best.pt` antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/tomas478/room-dirtiness-yolo11n
- Ultralytics (framework y documentacion de YOLO11): https://docs.ultralytics.com
- Repositorio Ultralytics en GitHub: https://github.com/ultralytics/ultralytics
