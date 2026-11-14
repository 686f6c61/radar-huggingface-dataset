# wms2537/VehicleDINO

## Resumen

VehicleDINO es un modelo de vision por computador desarrollado por Soh Wei Meng (usuario `wms2537` en Hugging Face) que unifica en un unico pase forward cinco tareas de reconocimiento de vehiculos: deteccion de objetos, clasificacion de tipo, identificacion de marca y modelo, re-identificacion (Re-ID) y OCR de matricula. El modelo parte de un backbone DINOv2 ViT-B/14 congelado al que se anaden adaptadores LoRA, un cuello SimpleFPN seguido de un HybridEncoder con atencion AIFI y CCFM, y un decodificador estilo RT-DETR con 300 queries de deteccion mas una query global de atributos.

La propuesta resulta relevante porque sustituye una cadena de modelos independientes (detector, clasificador, extractor de embeddings y OCR) por una sola red con seis cabezas especializadas, lo que reduce la latencia y la complejidad de despliegue en pipelines de videovigilancia, peajes o gestion de flotas. Se distribuye exclusivamente en formato ONNX, con una variante FP32 de 450 MB y otra INT8 de 139 MB que puede ejecutarse en navegador mediante ONNX Runtime Web con backend WebGPU o WASM.

El modelo se entrena sobre VeRi-776 para deteccion, tipo y Re-ID, CompCars para marca y modelo, y CCPD-Green para OCR de matriculas chinas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, aunque el rendimiento en Re-ID (mAP 61,1% en VeRi-776) queda lejos de los mejores sistemas especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-B/14 (congelado, con adaptadores LoRA) + SimpleFPN + HybridEncoder (AIFI + CCFM) + decodificador RT-DETR |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 560x560 px) |
| Tipos de cuantizacion | FP32 e INT8 |
| Idiomas soportados | no disponible (OCR limitado a matriculas chinas de CCPD-Green) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`vehicledino_dinov2.onnx` FP32 450 MB; `vehicledino_dinov2_int8.onnx` INT8 139 MB) |

## Arquitectura y entrenamiento

El modelo emplea un transformer de vision DINOv2 ViT-B/14 como extractor de caracteristicas congelado, al que se incorporan adaptadores LoRA para adaptar las representaciones al dominio de vehiculos sin reentrenar el backbone completo. Sobre las features se aplica un cuello SimpleFPN que proyecta de 768 a 256 dimensiones, seguido de un HybridEncoder que combina atencion intra-escala (AIFI) y fusion cruzada de caracteristicas multi-escala (CCFM). El decodificador sigue el esquema RT-DETR: 300 queries de deteccion para las cajas y clases, mas una query global que alimenta las cabezas de atributos (tipo, marca, modelo, embedding de Re-ID y OCR). Las cabezas de salida son seis: deteccion (300 cajas y 5 clases: car, suv, truck, bus, van), tipo (8 clases), marca (164 logits), modelo (2.005 logits), Re-ID (embedding L2-normalizado de 256 dimensiones) y OCR (8 posiciones x 37 caracteres).

El entrenamiento combina tres conjuntos de datos: VeRi-776 (776 vehiculos, 49.360 imagenes) para deteccion, clasificacion de tipo y Re-ID; CompCars para marca y modelo, preservando los IDs numericos originales del dataset (164 salidas de marca y 2.005 de modelo, con placeholders `Unknown` que no constituyen una clase calibrada); y CCPD-Green para el OCR de matriculas chinas. No se documenta en la model card el numero total de tokens ni si se aplicaron tecnicas de RLHF o DPO, algo esperable en un modelo discriminativo de vision. La innovacion principal es la unificacion multi-tarea en un unico grafo ONNX con una sola pasada forward.

## Capacidades

- Deteccion de vehiculos con 300 queries y 5 clases (car, suv, truck, bus, van), con cajas normalizadas en formato (cx, cy, w, h).
- Clasificacion de tipo de vehiculo entre 8 clases.
- Identificacion de marca entre 164 categorias (163 marcas mas `Unknown`), con IDs originales de CompCars.
- Identificacion de modelo entre 2.005 categorias, con 1.716 nombres reales y 288 posiciones sin nombre.
- Re-identificacion de vehiculos mediante embedding L2-normalizado de 256 dimensiones, adecuado para busqueda por similitud coseno.
- OCR de matriculas chinas con 8 posiciones y 37 caracteres posibles por posicion.
- Ejecucion en navegador mediante ONNX Runtime Web (WebGPU o WASM) con la variante INT8.
- Inferencia multi-tarea en un unico pase forward, sin necesidad de encadenar modelos separados.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente discriminativo de vision.

## Casos de uso

- Control de acceso en parkings y recintos: el modelo detecta el vehiculo, lee la matricula con la cabeza OCR y verifica marca y modelo en una sola inferencia, lo que permite decisiones de apertura de barrera con una latencia de un solo pase.
- Peajes y gestion de trafico: la deteccion con 5 clases (incluyendo truck y bus) y la clasificacion de tipo permiten tarificar por categoria de vehiculo y registrar el paso sin infraestructura adicional de clasificadores.
- Busqueda de vehiculos en videovigilancia: el embedding de Re-ID de 256 dimensiones permite indexar apariciones de un mismo vehiculo en distintas camaras y recuperarlas por similitud coseno, util para investigacion de incidentes.
- Gestion de flotas: la clasificacion de marca y modelo (164 y 2.005 clases respectivamente) permite inventariar automaticamente los vehiculos que entran y salen de una instalacion a partir de imagenes de camara.
- Analitica de aparcamiento: la combinacion de deteccion, tipo y Re-ID permite estimar ocupacion, rotacion y permanencia media por categoria de vehiculo sin sensores adicionales.
- Despliegue en edge o navegador: la variante INT8 de 139 MB ejecutable con ONNX Runtime Web o con ONNX Runtime en dispositivos de bajos recursos permite demos interactivas, aplicaciones web de reconocimiento y prototipos sin backend GPU.
- Enriquecimiento de datasets de trafico: las salidas multi-tarea (cajas, tipo, marca, modelo, embedding y OCR) pueden usarse para etiquetar automaticamente grandes volumenes de imagenes de carretera y alimentar otros entrenamientos.

## Benchmarks y rendimiento

| Tarea | Metrica | Resultado |
|---|---|---|
| Clasificacion de tipo | Top-1 accuracy | 95,6% |
| Clasificacion de marca | Top-1 accuracy | 98,4% |
| Clasificacion de modelo | Top-1 accuracy | 87,7% |
| Re-ID (VeRi-776) | mAP | 61,1% |
| Re-ID (VeRi-776) | Rank-1 | 86,1% |

No se han publicado en la informacion disponible resultados de deteccion (mAP de cajas), de OCR ni comparaciones directas con otros modelos en las mismas metricas.

## Requisitos de hardware

- VRAM estimada: la variante FP32 de 450 MB requiere aproximadamente 1-1,5 GB de VRAM en inferencia por lotes pequenos; la variante INT8 de 139 MB cabe holgadamente en menos de 1 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM (GTX 1650, RTX 3050 en adelante); para alto throughput, A100, H100 o RTX 4090 con ejecucion por lotes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU mediante el backend WASM de ONNX Runtime Web.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT), ONNX Runtime Web (WebGPU o WASM) para navegador; no se distribuyen pesos en formato PyTorch, GGUF ni safetensors, por lo que no es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; la entrada fija de 560x560 y el backbone ViT-B/14 sugieren una latencia moderada por imagen en GPU consumer, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Enfoque | Tareas | Entrada | Licencia | Formato |
|---|---|---|---|---|---|
| VehicleDINO | Multi-tarea unificada sobre DINOv2 ViT-B/14 | Deteccion, tipo, marca, modelo, Re-ID, OCR | 560x560 | Apache 2.0 | ONNX (FP32/INT8) |
| YOLOv8 / YOLOv11 | Detector de objetos de proposito general | Deteccion (clases COCO o personalizadas) | Variable | AGPL-3.0 (Ultralytics) | PyTorch, ONNX, TensorRT |
| RT-DETR | Detector transformer end-to-end | Deteccion | Variable | Apache 2.0 | PyTorch, ONNX |
| TransReID | Re-ID especializado en transformers | Re-ID | Variable | Codigo de investigacion | PyTorch |

No se dispone de comparaciones directas publicadas con estos modelos en las mismas metricas dentro de la informacion proporcionada. Frente a YOLO o RT-DETR, VehicleDINO anade clasificacion fina, Re-ID y OCR en un solo grafo, a costa de una entrada fija y de un rendimiento en Re-ID inferior al de sistemas especializados.

## Limitaciones y advertencias

- El OCR esta entrenado exclusivamente con CCPD-Green (matriculas chinas); no se garantiza su funcionamiento con matriculas europeas, americanas ni de otros formatos.
- El rendimiento en Re-ID (mAP 61,1% en VeRi-776) es moderado y puede degradarse en dominios distintos al de entrenamiento (angulos, iluminacion, camaras).
- Las clases `Unknown` de marca y modelo (indice 0 y 288 posiciones sin nombre en modelos) no constituyen una clase de rechazo calibrada; el modelo puede asignar una marca o modelo con alta confianza a un vehiculo no visto.
- Los IDs de marca y modelo siguen la numeracion original de CompCars, incluyendo erratas del dataset como `BWM` en el indice 81; no deben reordenarse ni compactarse.
- La cobertura de entrenamiento por clase no esta documentada: la existencia de 2.005 salidas de modelo no implica que todas esten representadas en el entrenamiento.
- Riesgo de alucinacion en el sentido de clasificaciones erroneas con alta confianza, especialmente en vehiculos parcialmente ocluidos, de noche o con resolucion baja.
- No se documentan sesgos demograficos ni geograficos, pero al entrenar con VeRi-776 y CompCars (predominantemente chinos y con distribucion de flota concreta) la generalizacion a otras regiones es incierta.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no incluye garantias ni soporte; el autor no ha publicado evaluacion independiente.
- El repositorio tiene 0 descargas y 0 likes, y la model card referencia una demo con nombre de proyecto distinto (`yolov11-plate-recognition`), lo que sugiere que el modelo no ha sido validado por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wms2537/VehicleDINO
- Demo en navegador: https://yolov11-plate-recognition.swmengappdev.workers.dev
- Dataset CompCars (referencia): https://mmlab.ie.cuhk.edu.hk/datasets/comp_cars/index.html
- Mapeo de marcas: https://huggingface.co/wms2537/VehicleDINO/blob/main/vehicledino_makes.json
- Mapeo de modelos: https://huggingface.co/wms2537/VehicleDINO/blob/main/vehicledino_models.json
