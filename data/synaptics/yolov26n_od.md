# Synaptics/yolov26n_od

## Resumen

YOLO26 320x320 es un par de modelos de deteccion de objetos (nano y small) derivados de la arquitectura YOLO26 de Ultralytics, exportados en INT8 estatico y compilados para la NPU Torq de los procesadores Synaptics Astra SL2610-Series. El repositorio Synaptics/yolov26n_od, pese a su nombre, aloja tanto la variante nano (yolo26n) como la small (yolo26s), ambas con resolucion de entrada fija de 320x320 y salida ya decodificada en la propia NPU. La relacion con el modelo base Synaptics/yolo es de cuantizacion (base_model_relation: quantized).

Tecnicamente se trata de un detector end-to-end sin NMS (head one-to-one, siguiendo el diseno NMS-free de YOLO26), con la cabeza de decodificacion compilada dentro del binario de NPU. Esto elimina el post-procesado basado en NMS en el host, aunque el propio autor advierte que la saturacion de confianzas del INT8 genera cajas duplicadas con puntuaciones empatadas, por lo que recomienda un paso de deduplicacion por IoU.

Su relevancia es practica: ofrece deteccion de objetos en tiempo real sobre hardware embebido de bajo consumo, con latencias medidas de 12,9 ms (78 fps) para la variante nano y 33,5 ms (30 fps) para la small en la NPU SL2610, y una mAP50 en COCO val2017 (INT8) de 0,403 y 0,503 respectivamente. El interes para desarrolladores esta en que el pipeline completo (export TFLite INT8 + compilacion Torq) ya esta resuelto y publicado, incluyendo los binarios .vmfb listos para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (Ultralytics), deteccion de objetos end-to-end sin NMS, head one-to-one, decodificacion compilada en NPU |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision, sin ventana de contexto textual) |
| Tipos de cuantizacion | INT8 estatico (full integer quant, export Ultralytics static-INT8 con quantize/dequantize de frontera eliminados para I/O int8) |
| Idiomas soportados | no disponible (modelo de deteccion visual; no expone interfaz de texto) |
| Licencia | AGPL-3.0 |
| Formato de pesos | TFLite (INT8) y VMFB (binario compilado para NPU Torq) |
| Tarea | Object Detection |
| Variantes incluidas | yolo26n, yolo26s |
| Resolucion de entrada | 1x320x320x3 int8 NHWC (scale 1/255, zero-point -128) |
| Formato de salida | 1x84x2100 int8 (filas 0-3: xywh normalizado a imgsz; filas 4-83: probabilidades de clase) |
| Descuantizacion de salida | yolo26n: scale 0,00423651235178113, zero-point -128; yolo26s: scale 0,004613031819462776, zero-point -128 |
| Modelo base | Synaptics/yolo (relacion: quantized) |
| Hardware objetivo | NPU Torq de procesadores Synaptics Astra SL2610-Series |
| Libreria | torq |
| Tamano del repositorio | 0,0 GB |
| Descargas / likes en HuggingFace | 25 / 0 |
| Fechas | creado 2026-08-26; actualizado 2026-09-11 |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26 de Ultralytics, un detector end-to-end que prescinde del NMS tradicional mediante una cabeza one-to-one que produce predicciones ya resueltas. Sobre esa base, Synaptics ha realizado una exportacion estatica INT8 con las capas de cuantizacion/descuantizacion de frontera eliminadas para exponer entrada y salida directamente en int8, y ha compilado el grafo con torq-compile hacia un modulo VMFB ejecutable en la NPU Torq del SL2610. La cabeza de decodificacion se ejecuta en la NPU, de modo que la salida que recibe el host ya contiene coordenadas xywh normalizadas al tamano de imagen y 80 probabilidades de clase (84 filas por 2100 detecciones candidatas).

No se dispone de informacion en el material proporcionado sobre el numero de tokens o imagenes de entrenamiento, la composicion del dataset mas alla de la evaluacion en COCO val2017, ni sobre si se aplicaron fases de RLHF/DPO (no procede en un detector) o tecnicas de ajuste posteriores. Lo unico documentado es el proceso de cuantizacion, compilacion y los binarios resultantes: yolo26n_full_integer_quant_320_od.tflite y yolo26s_full_integer_quant_320_od.tflite como fuentes cuantizadas, y yolo26n_npu.vmfb / yolo26s_npu.vmfb como binarios compilados. Los vmfbs publicados se construyeron con torq-compile desde la rama main, con los arreglos de compilador para YOLO26 (synaptics-torq/torq-compiler-dev #2285 y #2337) ya fusionados.

## Capacidades

- Deteccion de objetos en imagenes a 320x320 píxeles, con 80 categorias de clase (formato COCO) y salida en formato xywh normalizado.
- Inferencia end-to-end sin NMS en la NPU: la decodificacion se realiza en el dispositivo, lo que simplifica el post-procesado en el host.
- Ejecucion en hardware embebido de bajo consumo (procesadores Synaptics Astra SL2610-Series con NPU Torq), orientada a despliegue en el borde.
- Dos perfiles de rendimiento: yolo26n para maxima velocidad (78 fps) y yolo26s para mayor precision (mAP50 0,503).
- Soporte de cuantizacion INT8 con parametros de descuantizacion documentados por variante.
- Metadatos de exportacion incluidos (yolo26n_metadata_od.yaml, yolo26s_metadata_od.yaml) con nombres de clase y descripcion de E/S, mas labels.json y samples/ como material de demostracion.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, procesamiento de lenguaje, vision-lenguaje, audio ni modo de pensamiento: es exclusivamente un detector visual.

## Casos de uso

- Vision artificial industrial en linea de produccion: el modelo corre en la NPU SL2610 a 78 fps (nano), suficiente para inspeccionar piezas en cintas transportadoras a velocidad nominal sin depender de una GPU dedicada.
- Analitica de comercio minorista: conteo de personas y deteccion de productos sobre flujos de camara con la variante small, usando la mAP50 de 0,503 para reducir falsos positivos en escenas densas.
- Videovigilancia y seguridad perimetral: deteccion de intrusiones en camaras IP con procesamiento local, aprovechando que la decodificacion ocurre en la NPU y solo se transmite la lista de cajas.
- Robotica movil y AGV: percepcion de obstaculos y objetos a 320x320 con latencia de 12,9 ms, adecuada para bucles de control reactivos en plataformas con presupuesto energetico limitado.
- Drones y dispositivos autonomos: inferencia a bordo en hardware embebido, sin necesidad de enlace de red ni de aceleradores de alto consumo.
- Domotica y electrodomesticos inteligentes: deteccion de presencia, mascotas u objetos sobre SoC Astra SL2610, con el modelo en formato TFLite INT8 o VMFB segun el runtime disponible.
- Prototipado y validacion de pipelines de cuantizacion: los archivos .tflite sirven como referencia para comparar el comportamiento del modelo antes y despues de la compilacion con torq-compile (#2285, #2337).
- Control de aforo y analitica de espacios: deteccion de personas sobre imagenes fijas o secuencias, con deduplicacion por IoU en el host para corregir las cajas duplicadas que genera la saturacion de confianza.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos en NPU SL2610 con iree-benchmark-module, 10 repeticiones:

| Modelo | Latencia | fps | COCO val2017 mAP50 (INT8) |
|---|---|---|---|
| yolo26n (yolo26n_npu.vmfb) | 12,9 ms | 78 | 0,403 |
| yolo26s (yolo26s_npu.vmfb) | 33,5 ms | 30 | 0,503 |

No se han publicado en la informacion disponible resultados de mAP50-95, comparativas contra otros detectores, ni mediciones de rendimiento sobre GPU o CPU.

## Requisitos de hardware

- Hardware objetivo: NPU Torq integrada en procesadores Synaptics Astra SL2610-Series. El rendimiento publicado (12,9 ms / 78 fps y 33,5 ms / 30 fps) corresponde a esa NPU.
- VRAM estimada: no disponible. Se trata de un despliegue en dispositivo embebido, sin requisitos de memoria de GPU discreta documentados.
- GPU recomendadas: no aplica segun la documentacion; no se publican datos de ejecucion sobre A100, H100, RTX 4090 ni otras GPU.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: modulos VMFB ejecutables mediante el runtime Torq / IREE (iree-benchmark-module aparece en la metodologia de medida); los archivos .tflite (full integer quant) permiten ejecucion con un interprete TFLite en el host. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un detector visual.
- Latencia y throughput: 12,9 ms y 78 fps para yolo26n; 33,5 ms y 30 fps para yolo26s, medidos sobre la NPU SL2610 con entrada 320x320 INT8.
- Memoria en dispositivo: no disponible.

## Comparativa con modelos similares

Comparativa interna entre las dos variantes publicadas en el mismo repositorio:

| Modelo | Parametros | Contexto | mAP50 (INT8) | Latencia | fps | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| yolo26n | no disponible | no aplica | 0,403 | 12,9 ms | 78 | AGPL-3.0 | TFLite INT8 + VMFB en HuggingFace |
| yolo26s | no disponible | no aplica | 0,503 | 33,5 ms | 30 | AGPL-3.0 | TFLite INT8 + VMFB en HuggingFace |

Comparativa con alternativas externas (YOLOv8, YOLOv11, RT-DETR u otros detectores end-to-end): no disponible en la informacion proporcionada. No se han publicado parametros, contexto ni metricas de terceros que permitan una comparacion homogenea sobre la misma NPU.

## Limitaciones y advertencias

- Saturacion de confianza en INT8: la salida int8 satura las confidencias cerca de 0,5, por lo que las puntuaciones no deben interpretarse como probabilidades calibradas. El umbral recomendado por el autor es aproximadamente 0,25 sobre la maxima probabilidad de clase.
- Cajas duplicadas: aunque la cabeza es NMS-free, la saturacion de confidencias produce cajas duplicadas con puntuaciones empatadas; es obligatorio aplicar un paso de deduplicacion por IoU en el post-procesado.
- Post-procesado manual necesario: hay que descuantizar la salida (con la escala y zero-point especificos de cada variante), aplicar umbral, escalar xywh por el tamano de entrada y deshacer el letterbox.
- Resolucion fija de 320x320: los objetos pequenos o lejanos tienen menos píxeles efectivos que en variantes a 640, lo que penaliza la deteccion de clases pequenas.
- Clases limitadas al conjunto COCO (80 categorias) segun el formato de salida 1x84x2100; no se documenta entrenamiento en dominios adicionales.
- Hardware muy especifico: los .vmfb solo son ejecutables en la NPU Torq del SL2610. Fuera de ese hardware hay que recurrir al .tflite, sin datos publicados de rendimiento en otras plataformas.
- Licencia AGPL-3.0: uso comercial permitido, pero con obligaciones copyleft fuertes. Si el modelo se ofrece como servicio en red, la AGPL exige poner a disposicion el codigo fuente correspondiente. Conviene revisar el cumplimiento antes de integrarlo en productos propietarios.
- Idiomas: no disponible; al ser un detector de imagenes no soporta entrada o salida de texto ni capacidades multilingues.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos derivado del umbral y de la saturacion de confianza descrita.
- Trazabilidad del entrenamiento: no se documentan datos de entrenamiento, numero de imagenes ni procedencia del dataset, lo que dificulta evaluar sesgos de dominio o clase.
- Madurez del artefacto: 25 descargas y 0 likes en HuggingFace en el momento de la consulta; el repositorio figura con un tamano de 0,0 GB reportado por la plataforma.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Synaptics/yolov26n_od
- Licencia AGPL-3.0 de Ultralytics: https://github.com/ultralytics/ultralytics/blob/main/LICENSE
- Arreglos de compilador para YOLO26 citados en la model card: synaptics-torq/torq-compiler-dev #2285 y #2337 (identificadores de issue/PR; no se proporciona URL directa en la informacion disponible)
- Modelo base referenciado: Synaptics/yolo (no se proporciona URL directa)
- Model card de Ultralytics YOLO26, paper o blog oficial: no disponible en la informacion proporcionada
- Demo o space oficial: no disponible

Nota: los resultados de la busqueda web facilitados no guardan relacion con el modelo (corresponden a opiniones sobre un portal de reserva de vuelos) y no se han utilizado como fuente.
