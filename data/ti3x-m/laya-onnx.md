# ti3x-m/laya-onnx

## Resumen

ti3x-m/laya-onnx es una distribucion en formato ONNX del modelo Laya, cuyo checkpoint original publica convaiinnovations bajo el identificador convaiinnovations/laya. No se trata de un modelo entrenado desde cero, sino de una conversion y cuantizacion del modelo base para su ejecucion con ONNX Runtime en CPU, en WebAssembly y en navegador mediante WebGPU. El repositorio ocupa 4,2 GB e incluye grafos FP32 estandar, grafos FP32 transformados para WebGPU y una variante cuantizada INT8 de solo pesos.

El grafo opera con lote fijo de 1 y admite longitud de secuencia y numero de opciones dinamicos, y expone una cabeza de decision que produce probabilidades sobre un conjunto de opciones. El autor indica que las ejecuciones en CPU han superado pruebas de paridad frente a PyTorch, mientras que la ruta de navegador WebGPU y la ruta WASM no han sido validadas. No se publican parametros, contexto ni composicion de entrenamiento del modelo base en la informacion disponible.

Su relevancia actual es de infraestructura mas que de modelado: demuestra un flujo reproducible de conversion a ONNX con verificacion de fidelidad, cuantizacion por bloques y adaptacion de grafos a las limitaciones de WebGPU, un paso necesario para llevar modelos de decision a inferencia local en el navegador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio distribuye grafos ONNX; la arquitectura del modelo base convaiinnovations/laya no se detalla) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no consta que el modelo base sea MoE) |
| Longitud de contexto | no disponible (el grafo admite longitud de secuencia dinamica) |
| Tipos de cuantizacion | FP32 estandar; FP32 transformado para WebGPU; INT8 simetrico de solo pesos con bloque 64 en las MatMul del encoder, almacenamiento FP16 en embeddings y cabezas con computo FP32. No existe exportacion con computo FP16 |
| Idiomas soportados | no disponible (el autor titula la ficha "english Laya ONNX"; las pruebas de paridad incluyen texto multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo con pesos externos), ejecutable con ONNX Runtime 1.30.0 |

## Arquitectura y entrenamiento

El repositorio no documenta el entrenamiento del modelo base: no se indican tokens de entrenamiento, composicion del dataset, ni si hubo RLHF, DPO o ajuste por instrucciones. Lo que si se detalla es la topologia del grafo exportado. El grafo usa lote fijo de 1, con longitud de secuencia y numero de opciones dinamicas, y se ejecuta una inferencia por pregunta. Incluye una cabeza de decision cuyas salidas se interpretan como probabilidades calibradas por temperatura, ya presentes en el checkpoint original.

La innovacion tecnica del paquete esta en la conversion y cuantizacion. Para el objetivo CPU/WASM se cuantizan 16 MatMul del encoder con INT8 simetrico por bloques de 64, manteniendo activaciones y computo de la cabeza de decision en FP32, y conservando en mayor precision las capas extremas del encoder (12 en cada extremo, segun quantization.json). Los pesos de embeddings y cabezas exactamente representables se almacenan en FP16 pero se computan en FP32, de modo que la variante no es un modelo de computo FP16. Para el objetivo WebGPU se generan grafos especificos en los que los tensores gather grandes se dividen para respetar los limites del navegador. El autor documenta que la exportacion con computo FP16 puro produjo un grafo invalido y no esta disponible.

## Capacidades

- Inferencia de decision sobre un conjunto de opciones: el grafo recibe una pregunta y un numero de opciones variable y produce la opcion seleccionada junto con la distribucion de probabilidad asociada.
- Procesamiento de distintos tipos de pregunta, cardinalidades de opciones, estado vacio y truncacion de entrada, segun los casos de prueba publicados por el autor.
- Manejo de texto multilingue en las entradas de prueba (el modelo se etiqueta como "english", pero las fixtures incluyen contenido en varios idiomas).
- Ejecucion en CPU mediante ONNX Runtime 1.30.0, con lote 1 y multiples preguntas resueltas como llamadas de inferencia independientes.
- Ejecucion prevista en navegador mediante ONNX Runtime Web sobre WebAssembly (WASM) y sobre WebGPU, con grafos especificos para cada backend.
- No se documenta soporte de tool calling, function calling, uso agentico, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente de decision en el navegador: el grafo WebGPU esta pensado para ejecutarse en el cliente, de modo que una interfaz web pueda resolver preguntas de eleccion entre opciones sin enviar la entrada a un servidor, siempre que se asuma que esta ruta no ha sido validada por el autor.
- Clasificacion de intenciones en el borde: al devolver una probabilidad sobre opciones discretas, la variante INT8 puede integrarse en un servicio ligero de CPU para enrutar consultas hacia el flujo adecuado, con un grafo que ocupa 798,90 MB incluyendo pesos externos.
- Enrutado de opciones en interfaces conversacionales: el modelo puede usarse como selector de la siguiente accion o respuesta candidata en un dialogo de multiples turnos, pasando cada decision como una inferencia independiente de lote 1.
- Formularios y cuestionarios interactivos: dado un numero variable de opciones, el modelo puede preseleccionar o sugerir respuestas en encuestas y asistentes de formularios ejecutados localmente.
- Demostraciones y docencia sobre ONNX Runtime Web: el repositorio incluye evaluador, referencias de PyTorch, resultados por caso y recetas de cuantizacion, lo que lo convierte en material util para explicar conversion, paridad numerica y limites de WebGPU.
- Verificacion de paridad en CI: el script evaluate.py devuelve codigo de salida distinto de cero si falla una puerta de calidad, por lo que puede integrarse en un pipeline que valide cada nueva exportacion frente a las referencias fijadas del checkpoint.
- Preprocesamiento local en WASM: al no requerir GPU dedicada en la ruta CPU/WASM, el modelo puede empotrarse en aplicaciones de escritorio o extensiones que necesiten inferencia sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Lo unico publicado son pruebas de fidelidad de conversion frente a PyTorch, que miden reproduccion numerica y no precision de tarea.

| Pesos | Backend probado | Casos de referencia | Resultado |
|---|---|---|---|
| FP32 estandar | ONNX Runtime CPU | 34 | Paridad de logits superada (atol/rtol 0,001); 100,0 % de coincidencia de argmax; deriva maxima de probabilidad 2,00273e-06 |
| FP32 transformado para WebGPU | ONNX Runtime CPU unicamente | 3 | Paridad de logits superada (atol/rtol 0,001); navegador sin probar |
| INT8 de solo pesos con almacenamiento FP16 y computo FP32 | ONNX Runtime CPU | 34 | 100,0 % de coincidencia de argmax; error maximo de probabilidad calibrada 0,010016; KL media 1,80036e-05 |

Estas 34 fixtures son sinteticas, no tienen etiquetas de referencia y se usaron tambien para seleccionar la configuracion de precision, por lo que no establecen exactitud ni calibracion sobre datos no vistos. El autor lo indica explicitamente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El grafo INT8 mas los pesos externos suma 798,90 MB, por lo que la ruta CPU/WASM no requiere VRAM dedicada; el tamano del grafo FP32 no se detalla por separado (el repositorio completo ocupa 4,2 GB).
- GPU recomendadas: no disponibles. La ruta WebGPU no especifica modelos de GPU; el requisito practico es un navegador con soporte de WebGPU y memoria suficiente para los tensores del grafo.
- Cabe en GPU de consumo: no confirmado. Los grafos dirigidos a navegador dividen los tensores gather grandes precisamente para ajustarse a los limites de WebGPU, lo que sugiere que el objetivo es hardware de cliente, pero no hay mediciones publicadas.
- Opciones de despliegue: ONNX Runtime 1.30.0 en CPU (ruta probada), ONNX Runtime Web sobre WASM (no validada) y ONNX Runtime Web sobre WebGPU (no validada). No se contemplan vLLM, llama.cpp, Ollama ni TGI, al no ser formatos ONNX.
- Latencia y throughput estimados: no disponibles. El diseno de lote 1 obliga a una inferencia por pregunta, lo que limita el paralelismo salvo que se instancien varios grafos.
- Requisitos de entorno para reproducir las pruebas: Python 3.12, numpy 2.5.3 y onnxruntime 1.30.0, cargando el fichero de datos externo junto al grafo.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento del modelo base ni de alternativas comparables en la informacion proporcionada, por lo que la comparativa externa no esta disponible. La unica comparacion documentada es entre las variantes del propio repositorio y el checkpoint PyTorch de origen.

| Variante | Backend objetivo | Precision | Tamano | Estado de validacion |
|---|---|---|---|---|
| convaiinnovations/laya (PyTorch) | PyTorch | no disponible | no disponible | Referencia de las pruebas de paridad |
| onnx/model.onnx | ONNX Runtime CPU | FP32 | no disponible (incluido en los 4,2 GB del repo) | Paridad de logits superada en 34 casos |
| onnxruntime/webgpu/ | Navegador WebGPU | FP32 transformado | no disponible | Solo probado en CPU con 3 casos; navegador sin validar |
| onnxruntime/wasm/int8-block-64/ | CPU y WASM | INT8 de solo pesos, almacenamiento FP16, computo FP32 | 798,90 MB (grafo mas pesos externos) | Paridad en CPU con 34 casos; WASM sin validar |

## Limitaciones y advertencias

- La ejecucion en navegador WebGPU no ha sido validada por el autor; solo existe paridad en CPU con 3 casos para el grafo transformado.
- La ejecucion en WASM tampoco ha sido validada, pese a que la variante INT8 esta orientada a ese destino.
- No hay exportacion con computo FP16: el intento produjo un grafo invalido. La variante "FP16" solo afecta al almacenamiento de ciertos pesos, no al computo.
- Las pruebas de fidelidad miden reproduccion de salidas de PyTorch sobre 34 casos sinteticos sin etiquetas de verdad. No demuestran exactitud de tarea, calibracion ni comportamiento sobre datos no vistos, y la configuracion de precision se eligio sobre ese mismo conjunto.
- El lote esta fijado a 1: no hay procesamiento por lotes, lo que penaliza el throughput en servicios con carga alta.
- La ficha del autor etiqueta el modelo como "english", mientras que las fixtures incluyen texto multilingue. La cobertura real de idiomas no esta declarada.
- Los idiomas soportados, el contexto maximo efectivo y el comportamiento ante entradas largas no se especifican; solo se menciona truncacion como caso de prueba.
- Riesgo de alucinacion y sesgos: no evaluados en la informacion disponible. Al tratarse de una cabeza de decision sobre opciones, el riesgo principal es una seleccion incorrecta con alta confianza, no la generacion libre de texto.
- Licencia Apache 2.0 en este repositorio, lo que permite uso comercial de la conversion. La licencia y las condiciones del modelo base convaiinnovations/laya deben verificarse por separado antes de un despliegue en produccion.
- El repositorio registra 0 descargas y 0 interacciones en el momento de la consulta, sin senales de adopcion ni mantenimiento por parte de terceros.
- Se requiere ONNX Runtime 1.30.0 y Python 3.12 para la ruta probada; otras versiones no estan verificadas.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/ti3x-m/laya-onnx
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio laya-webgpu (herramienta de conversion citada por el autor): https://github.com/ti3x/laya-webgpu
- Repositorio laya-web (receta de cuantizacion citada por el autor): https://github.com/nvkudva/laya-web
- Evaluador incluido en el repo: onnxruntime/wasm/int8-block-64/evaluate.py
- Referencias de PyTorch e inputs: onnxruntime/wasm/int8-block-64/reference.json
- Resultados por caso: onnxruntime/wasm/int8-block-64/validation.json
- Receta de cuantizacion: onnxruntime/wasm/int8-block-64/quantization.json
- Registro de intentos de conversion: onnxruntime/wasm/int8-block-64/attempts.json
- No se han encontrado papers, blogs ni demos adicionales en la busqueda web realizada.
