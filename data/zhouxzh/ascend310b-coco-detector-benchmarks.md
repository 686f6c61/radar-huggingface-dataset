# zhouxzh/ascend310b-coco-detector-benchmarks

## Resumen

Ascend 310B COCO Detector Benchmarks es un repositorio de artefactos y resultados de evaluación publicado por el usuario zhouxzh en Hugging Face. No es un modelo generativo ni un modelo de lenguaje: es una colección de 26 detectores de objetos preentrenados en COCO, exportados a ONNX y compilados a formato OM para los aceleradores Ascend 310B1 (20T) y Ascend 310B4 (8T) de Huawei. El repositorio incluye además los resultados de un protocolo de pruebas cruzadas entre ambas placas y cinco modos de precisión de ATC.

El problema que aborda es la falta de datos reproducibles sobre el rendimiento real de detectores ligeros en NPU Ascend de gama baja, un segmento habitual en despliegues de borde. El autor fija un protocolo estricto: entrada sintética determinista, verificación numérica contra ONNX Runtime con tolerancias concretas, y medición de latencia de cómputo NPU mediante `ais_bench`. Los modelos cubiertos incluyen familias PicoDet, NanoDet, YOLOv5, YOLOv8, YOLO11, YOLOv10 y YOLO26, en resoluciones de 320×320 y 640×640.

La relevancia es práctica para quien necesite elegir un detector para inferencia en Ascend 310B: el repositorio ofrece tamaños de ONNX y OM, parámetros, GMACs estimados y estado de conversión por modo. Conviene subrayar que los números publicados no son mAP de COCO ni FPS de extremo a extremo con cámara, sino latencia de cómputo NPU con entrada fija y comparación numérica de salidas crudas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detectores de objetos CNN (PicoDet, NanoDet-Plus, YOLOv5, YOLOv8, YOLOv10, YOLO11, YOLO12, YOLO26, SSDLite) exportados a ONNX y compilados a OM |
| Parámetros totales | Entre 1,177 M (picodet_s_320_coco_lcnet) y 25,886 M (yolov8m), contados sobre inicializadores flotantes del grafo ONNX |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelos de visión, no de lenguaje) |
| Tipos de cuantización | Cinco modos ATC: `force_fp32`, `allow_fp32_to_fp16`, `force_fp16`, `must_keep_origin_dtype`, `allow_mix_precision` |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | No disponible |
| Formato de pesos | ONNX (FP32 o FP16 según modelo) y OM compilado para Ascend 310B1/310B4 |

## Arquitectura y entrenamiento

El repositorio no entrena modelos: redistribuye pesos COCO preentrenados de terceros y los somete a un pipeline de exportación y compilación. Cada detector se exporta a ONNX con entrada batch=1 y resolución fija (320×320 o 640×640). A partir del ONNX se generan artefactos OM mediante ATC 7.6.0.1.220 con cinco configuraciones de precisión, sobre dos placas de compilación distintas (20T y 8T). Las arquitecturas subyacentes son CNNs de detección de una etapa: PicoDet y NanoDet-Plus con cabezas ancla-libres y ligeras, y la familia YOLO con sus variantes de cabeza (incluyendo las cabezas sin NMS de YOLOv10 y YOLO26).

La innovación del repositorio no está en los modelos sino en el protocolo de evaluación. Se fija una entrada sintética determinista por modelo (patrón RGB sintético para PicoDet/NanoDet, tensores NCHW derivados de hash para YOLO/SSDLite, semilla común `20261114` para los YOLO de 320), se compara la salida OM contra ONNX Runtime 1.24.2 con `np.allclose(atol=0.02, rtol=0.02)`, y se mide latencia con `ais_bench` en modo array (`warmup_count 20`, `loop 100`, tres ejecuciones por ruta). El tiempo reportado es la mediana de las medias de `NPU_compute_time` y excluye decodificación de imagen, preprocesado, decodificación de cajas, NMS, H2D/D2H y scheduling de aplicación. Los parámetros y GMACs se calculan con `onnx-tool 1.0.1`, con las limitaciones que el propio autor declara (no cuenta `Split`, `Transpose`, `TopK` ni `GatherElements`).

## Capacidades

- Detección de objetos en imágenes con 80 clases COCO, en resoluciones de 320×320 y 640×640 según el modelo.
- Inferencia en NPU Ascend 310B1 (20T) y Ascend 310B4 (8T) mediante artefactos OM compilados con cinco modos de precisión.
- Ejecución de referencia en CPU con ONNX Runtime para validación numérica de las salidas.
- Comparación cruzada de OM compilados en una placa y ejecutados en la otra (cuatro combinaciones placa de ejecución × placa de origen).
- Verificación de equivalencia numérica tensor a tensor (forma, tipo, finitud y `allclose`) frente a la referencia ONNX.
- Medición de latencia de cómputo NPU y FPS derivado (`1000 / latencia_ms`) con `ais_bench`.
- No incluye capacidades de lenguaje, tool calling, agentes, visión-lenguaje, audio ni generación de texto.

## Casos de uso

- Selección de detector para despliegue en Ascend 310B: consultar la tabla de tamaños OM y estados de conversión por modo para descartar combinaciones que fallan (por ejemplo, `must_keep_origin_dtype` falla en todos los YOLO listados y en NanoDet) antes de invertir tiempo en integración.
- Dimensionado de memoria en placa: los tamaños OM en MiB por modelo y modo permiten estimar el espacio de pesos en el dispositivo y comparar el coste de `force_fp32` frente a `force_fp16` (por ejemplo, `picodet_l_320_coco_lcnet` pasa de 21,94 a 20,13 MiB, mientras que `must_keep_origin_dtype` sube a 39,74 MiB).
- Validación de pipeline de compilación ATC: usar los OM publicados y sus hashes en `SHA256SUMS` como referencia para comprobar que una recompilación propia produce artefactos equivalentes.
- Benchmarking interno de latencia NPU: replicar el protocolo `ais_bench --run_mode array --warmup_count 20 --loop 100` con entrada sintética para comparar placas o versiones de CANN sin depender de imágenes reales.
- Elección entre resolución 320 y 640 con datos medidos: comparar pares del mismo modelo (por ejemplo, `yolov8n` con 4,891 GMACs frente a `yolov8n_320` con 1,223 GMACs) para decidir el compromiso entre coste de cómputo y resolución de entrada.
- Verificación de fidelidad numérica tras la compilación: emplear los criterios `atol=0.02`, `rtol=0.02` y el registro de error máximo/medio como plantilla de aceptación en un pipeline de CI para modelos propios.
- Estudio comparativo de familias de detectores ligeros: usar parámetros y GMACs estimados de las 26 variantes para acotar la búsqueda antes de evaluar mAP en el conjunto COCO real (publicado aparte en `docs/coco-map`).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precisión (mAP) en la información disponible dentro de este README; el autor remite la calidad de detección a `docs/coco-map`, cuyo contenido no se incluye. Los datos de rendimiento disponibles son de latencia de cómputo NPU, y el fragmento proporcionado no incluye la tabla de resultados de latencia, por lo que no se pueden reproducir aquí. Lo que sí está disponible son parámetros, GMACs y tamaños de artefacto:

| Modelo ID | Parámetros (M) | GMACs | ONNX (MiB) | OM 20T `force_fp32` / `force_fp16` (MiB) |
|---|---:|---:|---:|---|
| `picodet_s_320_coco_lcnet` | 1,177 | 0,555 | 4,56 | 7,42 / 6,91 |
| `picodet_m_320_coco_lcnet` | 3,448 | 1,399 | 13,24 | 15,16 / 14,01 |
| `picodet_l_320_coco_lcnet` | 5,782 | 2,247 | 22,14 | 21,94 / 20,13 |
| `nanodet_plus_m_320` | 1,186 | 0,474 | 4,57 | 6,14 / 5,88 |
| `yolov5n` | 1,867 | 2,714 | 3,80 | 4,82 / 4,50 |
| `yolov8n` | 3,152 | 4,891 | 12,23 | 7,08 / 6,84 |
| `yolov8s` | 11,157 | 15,243 | 42,77 | 22,35 / 22,11 |
| `yolov8m` | 25,886 | 41,128 | 98,97 | 50,64 / 50,39 |
| `yolo11n` | 2,616 | 3,878 | 10,21 | 6,64 / 6,33 |
| `yolo11s` | 9,444 | 11,902 | 36,25 | 19,84 / 19,53 |
| `yolo11m` | 20,092 | 36,403 | 76,89 | 40,56 / 40,19 |

Los valores de GMACs son estimaciones del grafo según `onnx-tool 1.0.1` y no incluyen operaciones de movimiento de datos ni ciertos operadores de las cabezas YOLOv10/YOLO26. Los tamaños OM de 8T coinciden con los de 20T en las filas mostradas, pero el autor advierte que valores idénticos en la tabla no implican bytes idénticos; la comprobación exacta requiere `SHA256SUMS`.

## Requisitos de hardware

- Hardware de ejecución: Ascend 310B1 (20T) y Ascend 310B4 (8T). No se documentan requisitos para GPU NVIDIA u otras aceleradoras.
- Memoria: el mayor artefacto listado es `yolov8m` con ONNX de 98,97 MiB y OM de hasta 51,10 MiB; el repositorio completo ocupa 4,7 GB, pero el peso por modelo es reducido.
- Software en placa: CANN 8.0.0, ATC 7.6.0.1.220, driver 25.2.0, Python 3.9.25, `aclruntime` y `ais_bench` 0.0.2.
- Referencia CPU: ONNX Runtime 1.24.2 con `CPUExecutionProvider` y NumPy 2.3.5.
- Despliegue: los OM se ejecutan con `aclruntime`/`ais_bench`; los ONNX pueden ejecutarse con ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: el protocolo está definido (`warmup_count 20`, `loop 100`, tres repeticiones, mediana de `NPU_compute_time`), pero los valores numéricos de latencia no están incluidos en el fragmento disponible.

## Comparativa con modelos similares

La comparación relevante aquí es entre los propios detectores incluidos, ya que el repositorio cubre familias competidoras bajo el mismo protocolo. No se dispone de datos de mAP en la información proporcionada para comparar calidad.

| Modelo | Parámetros (M) | GMACs | Entrada | OM `force_fp16` (MiB) | Conversión `must_keep_origin_dtype` |
|---|---:|---:|---|---:|---|
| `picodet_s_320_coco_lcnet` | 1,177 | 0,555 | 320×320 | 6,91 | Correcta |
| `nanodet_plus_m_320` | 1,186 | 0,474 | 320×320 | 5,88 | Fallida |
| `yolov8n` | 3,152 | 4,891 | 640×640 | 6,84 | Fallida |
| `yolo11n` | 2,616 | 3,878 | 640×640 | 6,33 | Fallida |
| `yolov8n_320` | 3,152 | 1,223 | 320×320 | 6,79 | Fallida |

## Limitaciones y advertencias

- Los números publicados no son mAP de COCO: son latencia de cómputo NPU y verificación numérica con entrada sintética. El propio autor lo advierte de forma explícita.
- La latencia excluye decodificación de imagen/vídeo, preprocesado, decodificación de cajas, NMS, cámara, scheduling y transferencias H2D/D2H; no representa FPS de extremo a extremo.
- La verificación numérica solo es válida para la entrada fija especificada por modelo; no se evalúa con imágenes reales ni con el conjunto de validación COCO.
- Los pesos COCO no incluyen clases `palm`, `left_hand` ni `right_hand`; no sirven para detección de manos pese a que el contexto del autor pueda sugerirlo.
- El modo `must_keep_origin_dtype` falla en la conversión de todos los YOLO listados y de NanoDet-Plus, lo que restringe las rutas de despliegue disponibles.
- Los cinco modos de precisión no garantizan que la OM use un único tipo de coma flotante, ni que un OM más pequeño o un FPS mayor impliquen mejor calidad.
- Las comparaciones de FPS solo son válidas con la misma resolución de entrada, la misma placa de ejecución y el mismo alcance de medición.
- Los GMACs son estimaciones del grafo con reglas de `onnx-tool` y omiten operadores de movimiento de datos y algunos de las cabezas YOLOv10/YOLO26; no equivalen a instrucciones hardware reales.
- La licencia no está disponible, por lo que no se puede confirmar el uso comercial ni la redistribución de los artefactos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.
- El contenido del README está mayoritariamente en chino; la documentación de mAP está en un subdirectorio separado cuyo contenido no se ha podido verificar.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhouxzh/ascend310b-coco-detector-benchmarks
- Resultados de mAP COCO (referenciados en el README, no verificados): https://huggingface.co/zhouxzh/ascend310b-coco-detector-benchmarks/tree/main/docs/coco-map
- Herramienta `ais_bench` de Ascend: https://gitee.com/ascend/tools/blob/master/ais-bench_workload/tool/ais_bench/README.md
- Framework AISBench (proyecto distinto, citado por el autor): https://github.com/AISBench/benchmark
- `onnx-tool` (metodología de conteo de GMACs): https://github.com/ThanatosShinji/onnx-tool/blob/main/data/Profile.md
