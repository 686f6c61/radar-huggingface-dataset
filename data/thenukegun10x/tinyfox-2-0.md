# thenukegun10x/TinyFox-2.0

## Resumen

TinyFox-2 es un detector de objetos de 12 clases especializado en la detección de zorros rojos y fauna nocturna en imágenes infrarrojas (IR) procedentes de cámaras trampa y sistemas de vigilancia perimetral. Desarrollado por thenukegun10x, se basa en la arquitectura YOLO26n, con 2,38 millones de parámetros y 5,2 GFLOPs, lo que lo sitúa en la categoría de modelos ultraligeros para edge computing. Su propósito principal es corregir los fallos históricos de los detectores de vida silvestre nocturna: falsas alarmas en fondos vacíos, confusión entre zorros y otros cánidos (dingos, perros mapache, perros domésticos) y pérdida de recall en cuadrúpedos pequeños.

El modelo se distribuye bajo licencia AGPL-3.0 y está optimizado para despliegue en CPU, GPU y NPU de bajo consumo, con versiones en FP32, FP16 e INT8 calibrado. Según los datos declarados por el autor, alcanza un 88,2 % de tasa de detección de zorros en vídeo IR real, un 0 % de confusión con cánidos rivales y cero falsas alarmas en 225 negativos nocturnos verificados. Es una evolución completa de TinyFox 1.0, que era un prototipo de una sola clase con graves problemas de falsos positivos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (anchor-free, multi-escala) |
| Parametros totales | 2,38 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin procesamiento de lenguaje) |
| Tipos de cuantizacion | FP32, FP16, INT8 (calibrado) |
| Idiomas soportados | no disponible (modelo de vision, sin capacidades de lenguaje) |
| Licencia | AGPL-3.0 |
| Formato de pesos | PyTorch (.pt), ONNX (FP16/INT8), TorchScript, LiteRT, GGUF |

## Arquitectura y entrenamiento

TinyFox-2 emplea la arquitectura YOLO26n, un detector anchor-free de una sola etapa con backbone multi-escala, diseñado para equilibrar precisión y velocidad en dispositivos con recursos limitados. El modelo fue entrenado con un conjunto de datos propio de 14.627 imágenes anotadas manualmente en formato VOC/COCO, con 12 clases biológicas distintas (zorro rojo, dingo, perro mapache, perro doméstico, gato, mustélidos, marsupiales, entre otras). El entrenamiento utilizó una estratificación 0-leak con agrupación burst-atomic y filtrado uniforme de imágenes IR, para evitar fugas temporales entre entrenamiento y validación.

La principal innovación técnica es la separación explícita de especies de cánidos en clases independientes (dingo, perro mapache y perro doméstico), lo que eliminó por completo la confusión entre zorros y otros cánidos en el vídeo de despliegue. Además, el modelo se calibró a INT8 mediante la herramienta YOLO-Quantizer, logrando una compresión del 72,5 % con una desviación media de caja de 0,68 píxeles y un 100 % de coincidencia de clases respecto al modelo FP32.

## Capacidades

- Detección de objetos en imágenes nocturnas e infrarrojas, con especialización en zorros rojos.
- Clasificación de 12 clases de fauna: zorro rojo, dingo, perro mapache, perro doméstico, gato, mustélidos, marsupiales y otras especies no especificadas.
- Alta precisión en la detección de zorros: mAP@0.50 de 0,983 y recall de 0,912 según datos del autor.
- Cero falsas alarmas en 225 imágenes negativas nocturnas verificadas.
- Eficiencia extrema para edge: pesos INT8 de 2,60 MB, FP16 de 4,75 MB y FP32 de 5,39 MB.
- Compatible con múltiples runtimes de inferencia: ONNX Runtime, OpenVINO, TorchScript, LiteRT y GGUF.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso, al ser exclusivamente un modelo de visión.

## Casos de uso

- Monitoreo de fauna con cámaras trampa: el modelo puede desplegarse en dispositivos de campo como Raspberry Pi o Jetson para detectar automáticamente zorros y otros animales en secuencias de vídeo IR, facilitando estudios ecológicos de población y comportamiento sin intervención humana.
- Control de depredadores en explotaciones ganaderas y avícolas: al detectar zorros u otros cánidos en tiempo real, el sistema puede enviar alertas a los responsables para proteger gallineros, corrales o rebaños, reduciendo pérdidas económicas.
- Vigilancia perimetral de instalaciones: integrado en sistemas de seguridad, permite identificar intrusiones de fauna salvaje en aeropuertos, vertederos o zonas residenciales, activando protocolos de disuasión.
- Investigación de interacciones entre especies: al distinguir entre zorros, dingos, perros mapache y perros domésticos, el modelo permite estudiar la competencia y el solapamiento de nichos ecológicos en áreas donde coexisten estas especies.
- Detección de plagas urbanas: su capacidad para clasificar mustélidos y marsupiales lo hace útil para monitorizar la presencia de especies invasoras o problemáticas en entornos urbanos y periurbanos.
- Sistemas de alerta temprana en conservación: en reservas naturales, el detector puede identificar la presencia de depredadores cerca de zonas de cría de especies amenazadas, permitiendo intervenciones oportunas.

## Benchmarks y rendimiento

Los siguientes resultados fueron declarados por el autor del modelo en la model card de HuggingFace y no han sido verificados de forma independiente. Corresponden a un conjunto de datos propio denominado "Night/IR Wildlife & Fox Detection Benchmark (Stratified 0-Leak Split)".

| Metrica | Valor |
|---|---|
| Fox mAP@0.50 | 0,983 |
| Fox mAP@0.50-0.95 | 0,795 |
| Fox Precision | 0,975 |
| Fox Recall | 0,912 |
| All Classes mAP@0.50 | 0,950 |
| All Classes mAP@0.50-0.95 | 0,812 |
| Deployment Video Fox Top Prediction (@0.40 conf) | 0,882 |
| Deployment Video Rival Canid Confusion (@0.40 conf) | 0,000 |
| False Alarms on 225 Night Negatives | 0,000 |

## Requisitos de hardware

- Inferencia en CPU: compatible con ONNX Runtime y OpenVINO; el modelo INT8 (2,60 MB) puede ejecutarse en tiempo real en CPUs de bajo consumo.
- Inferencia en GPU: cualquier GPU con al menos 1 GB de VRAM es suficiente para FP32; para INT8, incluso GPUs integradas pueden manejar el modelo.
- Dispositivos edge: soportado en Radxa, Jetson Nano/TX2, Raspberry Pi 4/5 y NPU comerciales mediante ONNX Runtime o LiteRT.
- Opciones de despliegue: PyTorch, ONNX Runtime, OpenVINO, TorchScript, LiteRT y GGUF (para CPU).
- Latencia y throughput: no disponibles en la documentación oficial, pero dado el tamaño del modelo (2,38 M parámetros) se espera una latencia inferior a 10 ms por imagen en hardware moderno de gama media.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Clases | mAP@0.50 (zorro) | Falsas alarmas | Licencia |
|---|---|---|---|---|---|---|
| TinyFox-2 | YOLO26n | 2,38 M | 12 | 0,983 | 0/225 | AGPL-3.0 |
| TinyFox 1.0 | NanoDet-Plus | no disponible | 1 | no disponible | 5,8 % | MIT |
| YOLO26n genérico | YOLO26n | 2,38 M | 80 (COCO) | no aplica | no aplica | AGPL-3.0 |

TinyFox-2 supera claramente a su predecesor TinyFox 1.0 en recall de zorros (88,2 % frente a 38,0 % en vídeo IR), eliminación de confusión entre cánidos y reducción de falsas alarmas. Frente a un YOLO26n genérico entrenado en COCO, TinyFox-2 ofrece una especialización en fauna nocturna que el modelo genérico no posee, aunque a costa de una cobertura de clases mucho más reducida.

## Limitaciones y advertencias

- Modelo exclusivamente de visión: no procesa texto, audio ni realiza razonamiento simbólico.
- Especializado en imágenes nocturnas e infrarrojas; su rendimiento en condiciones diurnas o con cámaras de espectro visible no está documentado y podría degradarse.
- Los benchmarks publicados no han sido verificados de forma independiente (marcados como `verified: false` en la model card).
- La licencia AGPL-3.0 impone obligaciones de copyleft: si el modelo se utiliza como parte de un servicio en red, el código fuente de la aplicación debe publicarse bajo la misma licencia.
- No se especifican las 12 clases completas en la documentación; solo se mencionan zorro rojo, dingo, perro mapache, perro doméstico, gato, mustélidos y marsupiales.
- El conjunto de datos de entrenamiento es privado y no está disponible para reproducibilidad.
- No se proporcionan métricas de rendimiento en condiciones de lluvia, niebla o nieve, que podrían afectar a la detección.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thenukegun10x/TinyFox-2.0
- TinyFox 1.0 (versión anterior): https://huggingface.co/thenukegun10x/TinyFox-1.0
- Repositorio YOLO-Quantizer: https://github.com/Thenukegun10x/YOLO-Quantizer
