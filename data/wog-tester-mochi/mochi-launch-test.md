# wog-tester-mochi/mochi-launch-test

## Resumen

Mochi Launch Test es un modelo de deteccion de objetos en formato ONNX publicado en Hugging Face por el usuario `wog-tester-mochi`. No se trata de una arquitectura nueva: es el detector oficial YOLOX-Nano de COCO (desarrollado por Megvii, licencia Apache-2.0, release `0.1.1rc0`) reempaquetado para cumplir el contrato de inferencia `wog-cv-v2.1` de la plataforma Season Zero. Su funcion principal es servir como prueba de flujo de publicacion y validacion de modelos dentro de esa plataforma, no como un modelo de proposito general.

El envoltorio anade al grafo ONNX original la conversion de espacio de color (RGB a BGR) y el reescalado (`x255`) para que la red troncal de YOLOX reciba la entrada en el formato que espera, ademas de la decodificacion de cajas y la reasignacion de las 80 clases COCO a solo dos categorias: `0=person` y `1=vehicle`. La salida es un tensor `[1, 200, 7]` con cajas normalizadas y un campo `theta` fijado a cero, lo que indica que el contrato admite deteccion orientada pero este modelo concreto no la explota.

Por su tamano (YOLOX-Nano, en el rango de un millon de parametros) y su formato ONNX con entrada fija de 416x416, esta pensado para inferencia en dispositivos de borde y CPU. La relevancia practica es limitada: el repositorio pesa 0.0 GB, tiene cero descargas y cero likes, y su propia model card lo describe como un "launch-test submission" para ejercitar el flujo de registro y publicacion de un usuario nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLOX-Nano (detector one-stage, backbone CSPNet + cabeza desacoplada) |
| Parametros totales | no disponible (YOLOX-Nano se situa en el orden de 0.9 M, dato no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, entrada fija 416x416) |
| Tipos de cuantizacion | no disponible (solo se distribuye el ONNX float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache-2.0 (con atribucion obligatoria a YOLOX / Megvii) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo subyacente es YOLOX-Nano, un detector de objetos de una sola etapa presentado por Megvii. Emplea un backbone CSPNet ligero, una cabeza desacoplada que separa la prediccion de clase y de regresion de cajas, y decodificacion ancor-free. La version Nano es la mas pequena de la familia YOLOX y esta disenada para inferencia en CPU y dispositivos de borde. Los pesos incluidos son los del release oficial `0.1.1rc0` entrenado sobre COCO; no se ha realizado ningun reentrenamiento ni ajuste fino en este repositorio.

El envoltorio `wog-cv-v2.1` modifica el grafo ONNX para integrar tres pasos que el ONNX oficial no incluye: la conversion de RGB a BGR y el reescalado a `[0, 255]` en la entrada, la decodificacion de cajas (que el release original deja fuera del grafo) y la reasignacion de las 80 clases COCO a las dos clases del contrato (`person`, `vehicle`). La salida se normaliza a `[0, 1]` y se rellena hasta 200 detecciones con el campo `theta = 0`. El seguimiento multiobjeto se gestiona fuera del modelo mediante el tracker `bytetrack-lite`, declarado en `model.json`. No hay informacion sobre datos de entrenamiento adicionales, RLHF ni innovaciones de decodificacion mas alla del reempaquetado descrito.

## Capacidades

- Deteccion de objetos en imagenes RGB de 416x416 píxeles con salida en un unico pase.
- Deteccion limitada a dos categorias: persona (`0`) y vehiculo (`1`), tras el remapeo de las clases COCO.
- Salida estructurada de hasta 200 detecciones por imagen con caja normalizada, confianza y clase.
- Integracion con el tracker `bytetrack-lite` para seguimiento multiobjeto a nivel de pipeline (no dentro del grafo).
- Inferencia en CPU y dispositivos de borde gracias al formato ONNX y al tamano reducido del modelo.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No incluye modo thinking, vision generativa, audio ni ninguna capacidad multimodal mas alla de la deteccion.

## Casos de uso

- Prueba de integracion de la plataforma Season Zero: el modelo sirve para validar el flujo de publicacion, el contrato `wog-cv-v2.1` y la carga del tracker `bytetrack-lite` antes de desplegar modelos reales.
- Deteccion de personas en video de vigilancia en dispositivos de borde: con entrada 416x416 y ONNX, puede ejecutarse en CPU o en SoC de baja potencia para contar personas en una escena sin necesidad de GPU.
- Deteccion de vehiculos en imagenes de trafico: el remapeo a la clase `vehicle` permite filtrar coches en capturas de camaras de carretera, aunque sin distincion entre tipos de vehiculo.
- Prototipado rapido de pipelines de vision: al estar en ONNX con entrada y salida documentadas, se puede insertar en un pipeline de preprocesado propio para comparar con otros detectores sin reescribir la integracion.
- Seguimiento multiobjeto en entornos controlados: combinado con `bytetrack-lite`, permite asignar identificadores estables a personas o vehiculos entre fotogramas consecutivos en escenas con pocos objetos.
- Validacion de contratos de salida: util para comprobar que un consumidor aguas abajo maneja correctamente el tensor `[1, 200, 7]`, las cajas normalizadas y el campo `theta`.
- Docencia y ejemplos de despliegue ONNX: por su tamano minimo y su licencia permisiva, sirve como ejemplo reproducible de exportacion y envoltorio de un detector COCO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de mAP, latencia ni throughput, y no se ha realizado ninguna evaluacion propia en este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (orden de un millon de parametros) y la entrada 416x416, la huella de memoria es muy reducida y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no hay recomendacion oficial; el modelo esta pensado para CPU y borde, por lo que cualquier GPU moderna es suficiente.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: ONNX Runtime, OpenCV DNN, TensorRT (previa conversion) y cualquier runtime compatible con ONNX. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un detector de vision.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Clases | Formato | Licencia |
|---|---|---|---|---|---|
| Mochi Launch Test (YOLOX-Nano envuelto) | no disponible (orden de 0.9 M) | 416x416 | 2 (person, vehicle) | ONNX | Apache-2.0 |
| YOLOX-Nano oficial (Megvii) | no disponible (orden de 0.9 M) | configurable | 80 (COCO) | ONNX / PyTorch | Apache-2.0 |
| YOLOv8n (Ultralytics) | no disponible en la informacion | configurable | 80 (COCO) | PyTorch / ONNX | AGPL-3.0 |
| SSD MobileNet (TensorFlow) | no disponible en la informacion | 300x300 | 80 (COCO) | TF / ONNX | Apache-2.0 |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados para este repositorio que permitan una comparacion cuantitativa. Frente al YOLOX-Nano oficial, la diferencia principal es el remapeo a dos clases y la integracion del preprocesado y la decodificacion en el grafo. Frente a YOLOv8n, la licencia Apache-2.0 es mas permisiva para uso comercial que la AGPL-3.0 de Ultralytics.

## Limitaciones y advertencias

- Modelo de prueba: la propia model card lo describe como un "launch-test submission" para ejercitar el flujo de publicacion, no como un modelo listo para produccion.
- Solo detecta dos clases (`person` y `vehicle`); cualquier otra categoria COCO se descarta en el remapeo.
- No incluye deteccion orientada: el campo `theta` esta fijado a cero, por lo que no maneja objetos rotados.
- Entrada fija de 416x416 en RGB `[0, 1]`; introducir otro formato o resolucion produce resultados incorrectos.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de falsos positivos y falsos negativos propios de un detector Nano de baja capacidad.
- Sesgos conocidos: los hereda del entrenamiento en COCO, con posible infrarrepresentacion de ciertas demografias, condiciones de iluminacion y contextos geograficos.
- Licencia Apache-2.0 permite uso comercial, pero obliga a mantener la atribucion a YOLOX / Megvii al redistribuir los pesos.
- Repositorio sin descargas ni validacion de la comunidad (0 descargas, 0 likes); no hay evidencia de uso en produccion.
- No hay informacion sobre cuantizacion ni sobre versiones INT8, lo que limita optimizaciones en hardware de borde especifico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wog-tester-mochi/mochi-launch-test
- Pesos upstream YOLOX-Nano: https://github.com/Megvii-BaseDetection/YOLOX/releases/download/0.1.1rc0/yolox_nano.onnx
- Proyecto YOLOX (Megvii): https://github.com/Megvii-BaseDetection/YOLOX
- Starter kit de envoltorio: https://github.com/seth935/wog-starter-kit
