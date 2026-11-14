# zhouxzh/ascend310b-coco-detector-benchmarks

## Resumen

El repositorio `zhouxzh/ascend310b-coco-detector-benchmarks` no es un modelo entrenado, sino una coleccion de artefactos de conversion y pruebas de rendimiento para detectores de objetos COCO sobre el acelerador Ascend 310B. Contiene ficheros ONNX genericos (exportados con `static` y `opset17`) junto con sus equivalentes OM generados mediante ATC para dos variantes de SoC: Ascend 310B1 / 20T y Ascend 310B4 / 8T. Su proposito declarado es comparar la conversion ATC, los valores numericos de salida crudos de ACL y la velocidad de cada ruta de modelo.

La matriz extendida cubre 12 redes (PicoDet S/M/L, NanoDet-Plus M1.5x, YOLOv8/11/12/26 en S y M), dos precisiones ATC (fp32 y mixed_fp16) y dos placas, sumando 48 rutas de modelo. El autor advierte explicitamente de que el repositorio no incluye mAP de COCO, precision a nivel de caja sobre imagenes reales ni metricas de tareas especificas, y de que las comparaciones numericas con umbral estricto (`atol=rtol=0.02`) solo pasaron en 3 de 24 casos en la placa 20T y 15 de 24 en la 8T.

Es relevante para ingenieros que evaluan el despliegue de detectores ligeros en hardware Ascend de borde, porque documenta de forma reproducible (con `SHA256SUMS`) el proceso de conversion ONNX a OM y las discrepancias numericas que aparecen entre placas. No debe confundirse con un detector listo para produccion: los modelos carecen de clases `palm`, `hand`, `left_hand` o `right_hand`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conjunto heterogeneo de detectores: PicoDet, NanoDet-Plus y YOLOv8/11/12/26 (todos CNN de deteccion de objetos) |
| Parametros totales | no disponible (no se especifica por modelo; tamanos S, M, L y M1.5x) |
| Parametros activos | no aplica (no son modelos MoE) |
| Longitud de contexto | no aplica (modelos de vision, no de lenguaje) |
| Tipos de cuantizacion | fp32 y mixed_fp16 en la conversion ATC a OM; ONNX en precision de exportacion |
| Idiomas soportados | no disponible (modelos de vision, sin capacidades linguisticas) |
| Licencia | no unica; depende del modelo: PicoDet Apache-2.0, NanoDet Apache-2.0, YOLO AGPL-3.0 / Enterprise |
| Formato de pesos | ONNX (static, opset17) y OM (generados con ATC para Ascend 310B) |

## Arquitectura y entrenamiento

El repositorio agrupa detectores de objetos de una etapa basados en CNN. PicoDet y NanoDet-Plus son detectores ligeros disenados para eficiencia en borde, mientras que la familia YOLO (v8, v11, v12, v26) en variantes S y M aporta modelos de referencia ampliamente usados. Los ONNX incluidos en la matriz extendida corresponden a exportaciones estaticas con `opset17`; los ficheros OM se obtienen aplicando ATC con modos de precision `_fp32` y `_mixed_fp16` para los SoC `_20t_` y `_8t_`.

No se documenta ningun entrenamiento propio ni ajuste fino: los pesos provienen de los repositorios upstream (PaddleDetection para PicoDet, RangiLyu/nanodet para NanoDet y Ultralytics assets para YOLO). El trabajo del autor se centra en la conversion, la verificacion de hashes y la comparacion de salidas crudas de ACL frente a la referencia ONNX, no en la calidad del detector. La innovacion tecnica del repositorio es, por tanto, metodologica: una matriz reproducible de rutas de modelo por placa y precision, con limpieza de recursos y temporizacion controlada.

## Capacidades

- Deteccion de objetos COCO generica en imagenes, mediante los detectores PicoDet, NanoDet-Plus y YOLOv8/11/12/26 incluidos.
- Conversion ONNX a OM para Ascend 310B1 / 20T y Ascend 310B4 / 8T mediante ATC, en fp32 y mixed_fp16.
- Verificacion de integridad de artefactos mediante `SHA256SUMS` (SHA-256 a nivel de byte de todos los ONNX y OM).
- Comparacion numerica de salidas crudas ACL frente a la referencia ONNX con tolerancias `atol=rtol=0.02` (matriz extendida) y `1e-3` (prueba de 500 iteraciones de NanoDet-Plus-M 320 FP32).
- Temporizacion de rutas completas de modelo: incluye H2D de entrada, ejecucion ACL y sincronizacion; excluye D2H de salida, preprocesado de imagen, decode, NMS y captura de camara.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No incluye clases `palm`, `hand`, `left_hand` ni `right_hand`; no es un detector de manos.

## Casos de uso

- Evaluacion de portabilidad ONNX a Ascend: usar los ficheros ONNX y OM como referencia para medir cuanto se desvia la salida de ACL respecto al grafo original antes de comprometerse con una red concreta en produccion.
- Seleccion de detector para borde: comparar las 48 rutas (12 modelos x 2 precisiones x 2 placas) para elegir la combinacion que mejor equilibra latencia y fidelidad numerica en el SoC objetivo.
- Validacion de pipelines ATC: emplear los OM y sus hashes como casos de prueba reproducibles al actualizar CANN o el compilador ATC, detectando regresiones de conversion.
- Benchmarking de infraestructura: reutilizar la metodologia de temporizacion (H2D + ejecucion + sincronizacion) para medir latencia de inferencia en Ascend 310B sin contaminar la medida con preprocesado ni postprocesado.
- Estudio de precision mixta: contrastar fp32 frente a mixed_fp16 en la misma red y placa para decidir si la perdida numerica es aceptable en una aplicacion de deteccion concreta.
- Base para prototipos de deteccion en camara: integrar un OM validado en un pipeline propio que anada preprocesado, decode y NMS, dado que el repositorio no los incluye.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision (mAP de COCO) en la informacion disponible. Los unicos datos cuantitativos publicados son de fidelidad numerica y de rutas de modelo:

| Prueba | Placa 20T | Placa 8T | Criterio |
|---|---|---|---|
| Matriz extendida (12 modelos x 2 precisiones) | 3/24 rutas pasan | 15/24 rutas pasan | `atol=rtol=0.02` sobre salidas crudas |
| NanoDet-Plus-M 320 FP32, 500 iteraciones | no pasa | no pasa | umbral estricto `1e-3` |

El autor indica que las OM que no pasan el criterio numerico pueden aun asi completar la inferencia ACL, y que la velocidad medida no implica calidad de tarea. No se proporcionan cifras de latencia ni throughput en la informacion disponible.

## Requisitos de hardware

- Hardware objetivo: Ascend 310B1 / 20T y Ascend 310B4 / 8T (SoC de borde, no GPU NVIDIA).
- Los OM deben validarse sobre la combinacion CANN/SoC correspondiente; no son portables entre placas sin reconversion.
- No aplica VRAM de GPU; el consumo de memoria depende del SoC Ascend y no se documenta en la informacion disponible.
- No se indican opciones de despliegue con vLLM, llama.cpp, Ollama ni TGI (no son modelos de lenguaje). El despliegue se realiza mediante ACL sobre Ascend.
- Latencia y throughput: no disponibles; la temporizacion publicada solo cubre H2D, ejecucion y sincronizacion, sin cifras concretas en la informacion proporcionada.

## Comparativa con modelos similares

| Repositorio | Contenido | Formatos | Hardware objetivo | Licencia |
|---|---|---|---|---|
| zhouxzh/ascend310b-coco-detector-benchmarks | 12 detectores COCO con OM y pruebas de fidelidad | ONNX, OM | Ascend 310B1/310B4 | Mixta segun modelo upstream |
| PaddleDetection (upstream PicoDet) | Modelos PicoDet y herramientas de exportacion | Paddle, ONNX | GPU/CPU generico | Apache-2.0 |
| RangiLyu/nanodet (upstream NanoDet) | NanoDet-Plus y releases ONNX | PyTorch, ONNX | CPU/GPU generico | Apache-2.0 |
| Ultralytics assets (upstream YOLO) | Pesos YOLOv8/11/12/26 | PyTorch, ONNX | GPU/CPU generico | AGPL-3.0 / Enterprise |

No se dispone de datos de rendimiento comparables (mAP ni latencia) en la informacion proporcionada para establecer una comparativa cuantitativa con esos upstream.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado: es un repositorio de artefactos de conversion y pruebas; no debe presentarse como detector listo para produccion.
- Ausencia total de mAP de COCO y de precision a nivel de caja sobre imagenes reales; no se puede inferir calidad de deteccion a partir de los datos publicados.
- Solo 3 de 24 rutas pasan el criterio `atol=rtol=0.02` en la placa 20T y 15 de 24 en la 8T; las discrepancias numericas son sustanciales y deben verificarse por caso.
- La prueba estricta con umbral `1e-3` (NanoDet-Plus-M 320 FP32, 500 iteraciones) no pasa en ninguna de las dos placas.
- La temporizacion excluye D2H de salida, preprocesado, decode, NMS y camara, por lo que no representa la latencia de un pipeline completo.
- Los ONNX no son intercambiables entre si aunque compartan nombre de red; `static` y `opset17` identifican la version de exportacion, no los mismos pesos.
- Los OM estan ligados a una combinacion CANN/SoC concreta y no son portables sin reconversion.
- No incluye clases `palm`, `hand`, `left_hand` ni `right_hand`; inutil como detector de manos pese a que el autor lo menciona explicitamente.
- Licencia no unificada: YOLO esta bajo AGPL-3.0 o Enterprise, lo que impone obligaciones de copyleft para uso comercial; PicoDet y NanoDet son Apache-2.0. Hay que verificar cada modelo upstream.
- Algunos ONNX de exportacion temprana no tienen su revision de origen confirmada en la model card; no se pueden equiparar a los de la matriz extendida.
- Riesgo de alucinacion y sesgos: no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de sobreinterpretar los resultados numericos como validacion funcional.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zhouxzh/ascend310b-coco-detector-benchmarks
- PaddleDetection (upstream PicoDet): https://github.com/PaddlePaddle/PaddleDetection
- Licencia PaddleDetection: https://github.com/PaddlePaddle/PaddleDetection/blob/release/2.9/LICENSE
- NanoDet (upstream): https://github.com/RangiLyu/nanodet
- Licencia NanoDet: https://github.com/RangiLyu/nanodet/blob/main/LICENSE
- Ultralytics assets (upstream YOLO): https://github.com/ultralytics/assets
- Terminos Ultralytics assets: https://github.com/ultralytics/assets/blob/main/README.md
