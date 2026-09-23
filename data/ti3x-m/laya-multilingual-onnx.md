# ti3x-m/laya-multilingual-onnx

## Resumen

`ti3x-m/laya-multilingual-onnx` es una exportacion a ONNX del modelo base `convaiinnovations/laya-multilingual`, publicada por el usuario ti3x-m bajo licencia Apache 2.0. No se trata de un modelo nuevo ni de un entrenamiento adicional: es un artefacto de conversion pensado para ejecutar inferencia sin PyTorch, tanto en CPU mediante ONNX Runtime y WASM como en navegador con WebGPU. El repositorio ocupa 3,2 GB e incluye varias variantes de pesos: FP32 estandar, FP32 transformada para WebGPU e INT8 weight-only de 617,68 MB.

El grafo tiene tamano de lote fijo de 1, longitud de secuencia dinamica y numero de opciones tambien dinamico, y cuenta con una "cabeza de decision" (decision head), lo que apunta a un modelo de seleccion o clasificacion entre opciones mas que a un generador de texto libre. La propia model card insiste en que las cifras publicadas miden fidelidad de conversion frente a PyTorch, no precision en tareas, y que varias rutas de ejecucion (WebGPU en navegador, WASM) no han sido validadas.

Su relevancia es practica: permite desplegar un modelo multilingue en entornos sin GPU, en el propio cliente o en el navegador, con paridad de logits verificada en CPU. El repositorio no declara pipeline, idiomas concretos ni resultados de benchmarks de tarea, y acumula 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La model card describe un grafo con capas de encoder y una cabeza de decision; no se especifica el tipo de transformer ni el numero de capas |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | No disponible. El grafo usa longitud de secuencia dinamica, sin maximo publicado |
| Tipos de cuantizacion | FP32 (estandar y transformada para WebGPU); INT8 weight-only simetrico en MatMuls del encoder con block size 64, activaciones y cabeza de decision en FP32, almacenamiento FP16 en pesos de embedding y head exactamente representables. FP16-compute no disponible (la conversion genera un grafo invalido) |
| Idiomas soportados | Multilingue (el nombre del modelo base lo indica y los casos de prueba incluyen texto multilingue); lista concreta de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (libreria `onnxruntime`), con fichero de pesos externo en la variante INT8 |
| Tamano del repositorio | 3,2 GB en total; variante INT8 graph + pesos externos: 617,68 MB |
| Tamano de lote | Fijo en 1 |
| Entradas dinamicas | Longitud de secuencia y numero de opciones |
| Runtime probado | ONNX Runtime 1.30.0 (ruta CPU) |
| Python requerido para validacion | 3.12 (con numpy 2.5.3) |
| Modelo base | convaiinnovations/laya-multilingual |
| Fecha de publicacion | 23 de septiembre de 2026 |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una conversion del checkpoint `convaiinnovations/laya-multilingual` a ONNX. Los detalles de arquitectura del modelo original (numero de capas, dimension oculta, atencion) no se detallan en la informacion disponible. Lo que si se puede inferir del artefacto es la presencia de un encoder con MatMuls cuantizables (24 MatMuls del encoder cuantizados en la variante INT8, con las capas primera y ultima del encoder retenidas a mayor precision, 8 tensores cada una) y de una cabeza de decision que opera en FP32, junto con pesos de embedding y head almacenados en FP16 cuando son exactamente representables.

La innovacion tecnica del repositorio esta en el proceso de exportacion, no en el entrenamiento. Se publican grafos con tamanos de lote fijo de 1 y ejes dinamicos de secuencia y numero de opciones; se ofrece una variante FP32 transformada para WebGPU en la que los tensores grandes de tipo gather se dividen para evitar limitaciones del backend; y se ofrece una receta de cuantizacion INT8 weight-only documentada en `quantization.json`, inspirada en el proyecto `laya-web`. La conversion FP16 de computo se descarto porque producia un grafo invalido. No hay informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens procesados ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Inferencia ONNX sin dependencia de PyTorch: los grafos se ejecutan con ONNX Runtime en CPU, con pesos externos cargados junto al grafo.
- Seleccion entre opciones: el grafo acepta un numero de opciones dinamico y produce una decision, lo que encaja con tareas de eleccion multiple o clasificacion de respuestas.
- Procesamiento de secuencias de longitud variable: el eje de secuencia es dinamico, sin lote (batch 1).
- Capacidad multilingue heredada del modelo base: los casos de validacion incluyen texto multilingue, aunque no se publica la lista de idiomas.
- Ejecucion en navegador: existe una ruta WebGPU con grafos preparados para el backend del navegador, y una ruta WASM con la variante INT8, ninguna de las dos validada por el autor.
- Conversion y verificacion reproducible: se incluyen `manifest.json` con revisiones fijadas y sumas de comprobacion, `reference.json` con referencias PyTorch e inputs, `validation.json` con resultados por caso, `quantization.json` con la receta y `attempts.json` con todos los intentos.
- Tool calling, agentes, razonamiento multi-paso, vision y audio: no disponible en la informacion proporcionada.

## Casos de uso

- Inferencia en el navegador sin backend: la variante INT8 (617,68 MB) puede cargarse en el cliente y ejecutarse con ONNX Runtime Web, evitando enviar datos del usuario a un servidor. Es adecuado cuando la privacidad del texto es un requisito, aunque la ruta WASM y la WebGPU no estan validadas por el autor y deben probarse antes de produccion.
- Despliegue en CPU sin GPU: el grafo FP32 estandar con paridad de logits verificada en ONNX Runtime CPU permite servir el modelo en instancias baratas o en hardware de borde, sin necesidad de aceleradores.
- Clasificacion o filtrado previo en pipelines de datos: dado que acepta un numero variable de opciones y devuelve una decision, encaja como etapa de seleccion o descarte en un pipeline mayor (por ejemplo, elegir que candidato pasa a un modelo generativo mas costoso).
- Aplicaciones offline o en redes intermitentes: al no requerir servicio remoto, el modelo puede empaquetarse en aplicaciones de escritorio o moviles donde la conectividad no esta garantizada.
- Validacion de conversiones en CI: el script `evaluate.py` y los ficheros de referencia permiten montar una comprobacion automatica de paridad (argmax, deriva de probabilidad, KL media) cada vez que se reexporta o recuantiza el modelo.
- Portabilidad entre runtimes: al ser ONNX, el mismo artefacto puede ejecutarse en distintos backends de ONNX Runtime (CPU, WASM, WebGPU, proveedores de ejecucion de terceros) sin reescribir integraciones.
- Evaluacion comparativa de cuantizacion: la variante INT8 con block size 64 y capas primera y ultima a mayor precision sirve como referencia para medir el impacto de una receta concreta de cuantizacion sobre las decisiones del modelo en CPU.
- Prototipado rapido en Python: con ONNX Runtime 1.30.0 y numpy 2.5.3, la reproduccion del test de fidelidad es directa y sirve como banco de pruebas antes de invertir en una integracion mayor.

## Benchmarks y rendimiento

La informacion disponible no incluye benchmarks de tarea (MMLU, HumanEval, GSM8K u otros). Lo unico publicado son pruebas de fidelidad de conversion contra PyTorch sobre casos sinteticos, que el propio autor advierte que no miden precision de tarea.

| Variante de pesos | Backend probado | Casos de referencia | Resultado |
|---|---|---|---|
| FP32 estandar | ONNX Runtime CPU | 34 | Paridad de logits superada (atol/rtol 0,001); 100,0 % de coincidencia de argmax; deriva maxima de probabilidad 1,90215e-06 |
| FP32 transformada para WebGPU | Solo ONNX Runtime CPU | 3 | Paridad de logits superada (atol/rtol 0,001); navegador sin probar |
| INT8 weight-only mixto con almacenamiento FP16 y computo FP32 | ONNX Runtime CPU | 34 | 100,0 % de coincidencia de argmax; deriva maxima de probabilidad 0,019774; KL media 0,000105079 |

Notas sobre estas cifras, segun la model card: la coincidencia de argmax mide acuerdo con PyTorch, no correccion frente a etiquetas humanas; el error de probabilidad se mide tras la calibracion de temperatura del checkpoint; los 34 casos son sinteticos, cubren tipos de pregunta, cardinalidades, texto multilingue, estado vacio y truncamiento, y no tienen etiquetas de referencia. El fallback de precision se eligio sobre ese mismo conjunto, por lo que los resultados no establecen exactitud ni calidad de calibracion en datos no vistos.

"No se han publicado resultados de benchmarks de tareas en la informacion disponible."

## Requisitos de hardware

- Variante INT8 (617,68 MB de grafo mas pesos externos): pensada para CPU y WASM. Cabe holgadamente en cualquier equipo de escritorio, portatil o movil moderno, y en el almacenamiento de una aplicacion web.
- Variante FP32 estandar: el tamano exacto de esta variante no esta publicado; el repositorio completo ocupa 3,2 GB e incluye varias variantes, por lo que debe descargarse y medirse antes de dimensionar memoria.
- GPU: no se requiere GPU para las rutas CPU validadas. La ruta WebGPU existe pero no ha sido validada en navegador. No se publican recomendaciones de modelos concretos (A100, H100, RTX 4090 u otros).
- GPU de consumo: la variante INT8 puede ejecutarse sin GPU dedicada; para WebGPU, cualquier GPU con soporte WebGPU seria en principio suficiente, pero no hay validacion publicada.
- Opciones de despliegue: ONNX Runtime en CPU (version 1.30.0 para la ruta probada), ONNX Runtime Web con backend WASM o WebGPU, y cualquier runtime compatible con ONNX. No se contemplan en la informacion disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Pesos externos: en la variante INT8 es necesario cargar el fichero de datos externo junto al grafo.
- Latencia y throughput: no disponibles.
- Entorno de validacion: Python 3.12, numpy 2.5.3, onnxruntime 1.30.0. El evaluador devuelve codigo de salida distinto de cero si falla alguna comprobacion.

## Comparativa con modelos similares

No se han encontrado en la informacion disponible alternativas de terceros directamente comparables (exportaciones ONNX de modelos multilingues de decision con cifras publicadas). La comparacion posible es entre las variantes del propio repositorio y el modelo base.

| Variante | Formato | Pesos | Computo | Validacion | Licencia |
|---|---|---|---|---|---|
| `convaiinnovations/laya-multilingual` | PyTorch (referencia) | No disponible | No disponible | No disponible | No disponible en la informacion proporcionada |
| `ti3x-m/laya-multilingual-onnx` (FP32) | ONNX | FP32 | FP32 | Paridad de logits y argmax en CPU; 34 casos | Apache 2.0 |
| `ti3x-m/laya-multilingual-onnx` (WebGPU FP32) | ONNX | FP32 transformada | FP32 | 3 casos en CPU; navegador sin probar | Apache 2.0 |
| `ti3x-m/laya-multilingual-onnx` (INT8) | ONNX + datos externos | INT8 weight-only, block 64, con FP16 en embedding/head | FP32 | 34 casos en CPU; WASM sin validar | Apache 2.0 |

## Limitaciones y advertencias

- Ejecucion en navegador sin validar: la ruta WebGPU no ha sido probada en navegador y la ruta WASM tampoco ha sido validada. No deben darse por buenas en produccion sin pruebas propias.
- Sin FP16 de computo: la conversion a FP16 produce un grafo invalido, por lo que no existe una variante con menor coste de computo y mayor ahorro de memoria en ese formato.
- Cifras de fidelidad, no de precision: los resultados de paridad solo indican que la conversion reproduce a PyTorch en 34 casos sinteticos sin etiquetas. El fallback de precision se selecciono sobre el mismo conjunto, asi que no hay evidencia de exactitud en datos no vistos ni de calidad de calibracion.
- Tamano de lote fijo en 1: no hay soporte de batching en el grafo, lo que limita el throughput agregado. Las multiples preguntas deben lanzarse como llamadas de inferencia separadas.
- Version de runtime sensible: la ruta CPU probada requiere ONNX Runtime 1.30.0; otras versiones pueden alterar los resultados.
- Idiomas y sesgos: no se publica lista de idiomas soportados, ni informacion sobre sesgos, ni evaluaciones de equidad. El comportamiento fuera de los casos cubiertos es desconocido.
- Alucinacion: no disponible. Al no haber informacion sobre la tarea real del modelo base ni sobre su naturaleza generativa, no puede evaluarse este riesgo.
- Licencia: el artefacto ONNX es Apache 2.0, lo que permite uso comercial, pero el modelo base es de un tercero (`convaiinnovations`) y su licencia y condiciones no se detallan en la informacion proporcionada. Conviene verificarlas antes de explotarlo comercialmente.
- Madurez baja: 0 descargas, 0 likes, sin pipeline declarado, publicado y actualizado el mismo dia. No hay model card de tarea ni documentacion de capacidades mas alla del proceso de conversion.
- Ruido en la busqueda web: los resultados de busqueda asociados a esta consulta no contienen informacion relevante sobre el modelo; tratan de una plataforma administrativa no relacionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ti3x-m/laya-multilingual-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya-multilingual
- Repositorio laya-web (receta de cuantizacion de referencia): https://github.com/nvkudva/laya-web
- Repositorio laya-webgpu (herramienta `laya-models` para regenerar referencias): https://github.com/ti3x/laya-webgpu
- Ficheros de validacion y receta dentro del repositorio: `manifest.json`, `quantization.json`, `reference.json`, `validation.json`, `attempts.json`, `onnxruntime/wasm/int8-block-64/evaluate.py`
- La busqueda web no devolvio resultados relevantes sobre este modelo.
