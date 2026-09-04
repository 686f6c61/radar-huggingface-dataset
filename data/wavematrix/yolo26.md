# WaveMatrix/yolo26

## Resumen

WaveMatrix/yolo26 es una conversión del modelo de detección de objetos YOLO26 de Ultralytics, optimizada para ejecutarse en los aceleradores NPU de WaveMatrix mediante cuantización INT8 (u8). El modelo ha sido desarrollado por WaveMatrix y está pensado para despliegue en hardware embebido de bajo consumo, como las placas de demostración y tarjetas aceleradoras M.2 basadas en los chips WM9955 y WM8845. Resuelve el problema de ejecutar detección de objetos en tiempo real en dispositivos edge sin necesidad de GPUs convencionales, reduciendo la latencia y el consumo energético.

La arquitectura subyacente es YOLO26, una red neuronal convolucional de detección de objetos en una sola pasada, disponible en cinco escalas (n, s, m, l, x). El repositorio ocupa 0,6 GB e incluye los pesos en formato axmodel, un formato específico del runtime de WaveMatrix. No se trata de un modelo de lenguaje, por lo que no tiene longitud de contexto ni capacidades de generación de texto. La relevancia actual radica en la creciente demanda de soluciones de visión por computador en dispositivos periféricos con recursos limitados, donde la eficiencia computacional es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26 (red neuronal convolucional para detección de objetos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica, modelo de visión) |
| Tipos de cuantizacion | INT8 (u8) para NPU WaveMatrix |
| Idiomas soportados | en (etiqueta del repo; no aplica para visión) |
| Licencia | AGPL-3.0 |
| Formato de pesos | axmodel (formato WaveMatrix NPU); ONNX como formato intermedio |

## Arquitectura y entrenamiento

El modelo es una adaptación de YOLO26, la arquitectura de detección de objetos de Ultralytics que unifica detección, segmentación y clasificación en un modelo end-to-end. En este caso, WaveMatrix ha realizado una conversión del modelo original a cuantización INT8 (u8) para su ejecución en el NPU WaveMatrix, compatible con la versión 4.2 de Pulsar2. La conversión se realiza a partir de un modelo ONNX, que posteriormente se transforma al formato axmodel mediante las herramientas de Pulsar2. No se dispone de información sobre los datos de entrenamiento, el número de tokens o procesos de RLHF/DPO, ya que no es un modelo de lenguaje y la model card no detalla el proceso de entrenamiento original de YOLO26. La innovación principal es la optimización para hardware NPU específico, logrando latencias de hasta 1,378 ms en la variante más pequeña.

## Capacidades

- Detección de objetos en tiempo real con cinco escalas de modelo: yolo26n, yolo26s, yolo26m, yolo26l y yolo26x.
- Optimizado para NPUs WaveMatrix, concretamente para los chips WM9955 y WM8845.
- Cuantización INT8 (u8) que reduce el consumo de memoria y mejora la eficiencia energética en dispositivos embebidos.
- Alto rendimiento en WM9955: hasta 726 FPS con yolo26n y latencia de 1,378 ms.
- Soporte de conversión de ONNX a axmodel mediante el flujo de Pulsar2 y el repositorio ax-samples.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling, razonamiento multi-paso ni capacidades multilingües.
- No incluye capacidades de visión adicionales como segmentación o clasificación más allá de la detección de objetos, según la información disponible.

## Casos de uso

- Vigilancia perimetral en dispositivos edge: desplegar yolo26n en la placa de demostración WM9955 para detectar personas y vehículos en tiempo real, aprovechando los 726 FPS y la latencia de 1,378 ms para monitorización continua.
- Control de calidad industrial: utilizar yolo26m en la tarjeta aceleradora M.2 para inspeccionar piezas en una línea de producción, detectando defectos con una latencia de 8,644 ms y un consumo de memoria de 27,6 MB.
- Conteo de personas en espacios comerciales: integrar yolo26s en el chip WM8845 con el modo NPU2, que ofrece 16,347 ms de latencia, para analizar el flujo de clientes en tiendas y centros comerciales.
- Navegación robótica: emplear yolo26n_npu2 en un robot móvil para detectar obstáculos y personas, con una latencia de 6,309 ms, lo que permite una reacción rápida en entornos cambiantes.
- Analítica de vídeo en transporte: usar yolo26x en WM9955 para detección de objetos en vídeo de alta resolución, con 20,405 ms de latencia y 70,4 MB de memoria, adecuado para sistemas de vigilancia en vehículos.
- Aplicaciones de drones: desplegar yolo26s en la tarjeta M.2 de WM9955 para detección de objetos desde el aire, beneficiándose del bajo consumo energético y la alta tasa de fotogramas por segundo.

## Benchmarks y rendimiento

La información disponible incluye medidas de rendimiento en hardware WaveMatrix, no benchmarks académicos estándar como MMLU o HumanEval. Se presentan los datos publicados por el autor.

Rendimiento en WM9955 (modo NPU3):

| Modelo | FPS | CMM (MB) | Latencia (ms) |
|---|---|---|---|
| yolo26n | 726 | 3,26 | 1,378 |
| yolo26s | 316 | 10,2 | 3,166 |
| yolo26m | 116 | 27,6 | 8,644 |
| yolo26l | 90 | 33,88 | 11,174 |
| yolo26x | 41,0 | 70,4 | 20,405 |

Rendimiento en WM8845:

| Modelo | Latencia (ms) |
|---|---|
| yolo26n_npu1.axmodel | 10,706 |
| yolo26s_npu1.axmodel | 23,188 |
| yolo26n_npu2.axmodel | 6,309 |
| yolo26s_npu2.axmodel | 16,347 |

No se han publicado resultados de benchmarks comparativos con otros modelos de detección de objetos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, ya que el modelo se ejecuta en NPU, no en GPU.
- GPU recomendadas: no aplica; el hardware objetivo son los NPUs WaveMatrix WM9955 y WM8845.
- ¿Cabe en consumer GPU? No aplica; el modelo está diseñado para NPU embebida, no para GPUs convencionales.
- Opciones de despliegue: ejecución directa del archivo axmodel en el runtime de WaveMatrix (por ejemplo, con el binario ax_yolo26). La conversión desde ONNX a axmodel se realiza con Pulsar2 y el repositorio ax-samples.
- Latencia y throughput: consultar las tablas de rendimiento en la sección anterior; destacan los 726 FPS de yolo26n en WM9955.

## Comparativa con modelos similares

No se han publicado comparativas en la información disponible. El modelo base es YOLO26 de Ultralytics, que se ejecuta en GPUs y CPUs convencionales; esta versión está optimizada para NPU WaveMatrix con cuantización INT8. No se dispone de datos comparativos con otras implementaciones de YOLO26 para NPU u otros aceleradores embebidos. Por tanto, la comparativa con modelos similares se considera no disponible.

## Limitaciones y advertencias

- Solo es compatible con los NPUs específicos de WaveMatrix (WM9955 y WM8845); no puede ejecutarse en GPUs estándar sin una conversión adicional.
- La cuantización INT8 puede degradar la precisión de detección en comparación con el modelo original en FP32, especialmente en objetos pequeños o escenas complejas.
- La licencia AGPL-3.0 impone que cualquier distribución del software que utilice este modelo debe publicar su código fuente, lo que puede limitar su uso comercial cerrado.
- No se dispone de información sobre sesgos, alucinaciones o limitaciones de idioma al ser un modelo de visión y no de lenguaje.
- El repositorio tiene muy pocas descargas (8) y no hay indicios de mantenimiento activo, lo que puede suponer un riesgo para proyectos de producción a largo plazo.
- La documentación de uso es limitada y está orientada exclusivamente al ecosistema de WaveMatrix, lo que dificulta la integración en stacks de software convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WaveMatrix/yolo26
- Repositorio de ejemplos WaveMatrix: https://github.com/WaveMatrix/ax-samples
- Documentación de Pulsar2: https://pulsar2-docs.readthedocs.io/en/latest/pulsar2/introduction.html
- Documentación de Ultralytics YOLO26: https://docs.ultralytics.com/models/yolo26
