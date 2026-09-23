# ti3x-m/laya-typed-decisions-onnx

## Resumen

`ti3x-m/laya-typed-decisions-onnx` es la exportacion a ONNX del checkpoint `convaiinnovations/laya-typed-decisions`, un modelo de decision tipada (clasificacion sobre un conjunto variable de opciones) orientado a ejecucion en CPU y en navegador. El repositorio lo publica el usuario ti3x-m bajo licencia Apache 2.0 y esta pensado para el runtime `onnxruntime`, con variantes especificas para WebAssembly y WebGPU. No es un modelo generativo de texto: su salida es una decision con probabilidades calibradas sobre un numero de opciones que se fija dinamicamente en cada llamada.

El interes del artefacto es de ingenieria de despliegue mas que de modelado: ofrece grafos ONNX con batch fijo de 1 y longitud de secuencia y numero de opciones dinamicas, junto con un manifiesto (`manifest.json`) que fija revisiones de origen, checksums y estado de validacion. Incluye una variante con cuantizacion INT8 solo de pesos en MatMuls del encoder (block size 64, activaciones FP32), que ocupa 561,28 MB entre grafo y pesos externos, frente a los 3,9 GB del repositorio completo.

La relevancia inmediata es que permite ejecutar el modelo sin GPU y dentro del navegador, con validacion de paridad numerica frente a PyTorch en CPU (100 % de coincidencia de argmax en 34 casos sinteticos). Ahora bien, el propio autor advierte de que la ejecucion en WebGPU y en WASM del navegador no ha sido validada, y que las metricas publicadas miden fidelidad de conversion, no exactitud de tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer encoder con cabeza de decision; detalles de capas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | longitud de secuencia dinamica, valor maximo no disponible |
| Tipos de cuantizacion | FP32 estandar; FP32 transformado para WebGPU; INT8 simetrico weight-only con block size 64 (MatMuls del encoder), almacenamiento FP16 para embeddings y cabeza con computo FP32; FP16-compute no disponible |
| Idiomas soportados | no disponible (los casos de prueba cubren texto multilingue, pero no se declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo + fichero de pesos externos) |
| Numero de opciones por consulta | dinamico (dinamico el recuento de opciones) |
| Tamano de batch | fijo a 1 |
| Tamano del repositorio | 3,9 GB; variante INT8 WASM: 561,28 MB |
| Runtime probado | ONNX Runtime 1.30.0, Python 3.12, numpy 2.5.3 |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del checkpoint original `convaiinnovations/laya-typed-decisions` ni su proceso de entrenamiento: no se indican numero de parametros, capas, cabezas de atencion, volumen de tokens ni composicion del dataset. Lo que si se deduce del material de conversion es la forma funcional del grafo: un encoder tipo transformer que procesa una secuencia de entrada y un conjunto de opciones de cardinalidad variable, y una cabeza de decision que produce logits por opcion. El checkpoint incorpora calibracion de temperatura, ya que las metricas de error de probabilidad se miden "tras la calibracion de temperatura del checkpoint".

En el lado de la conversion, el autor documenta varios detalles tecnicos relevantes. Los grafos usan batch fijo de 1 con longitud de secuencia y numero de opciones dinamicas, de modo que varias preguntas deben ejecutarse como llamadas de inferencia separadas. Los grafos estandar y transformado para FP32 superaron comprobaciones de paridad en CPU; la exportacion pura con computo FP16 no esta disponible porque la conversion produjo un grafo invalido. La variante INT8 aplica cuantizacion simetrica de 8 bits solo a los pesos de las MatMul del encoder (96 MatMuls cuantizadas), manteniendo la primera y la ultima capa del encoder en mayor precision (2 cada una), con activaciones y computo de la cabeza de decision en FP32. La receta de cuantizacion se inspira en el proyecto `laya-web` de nvkudva.

## Capacidades

- Decision tipada: selecciona una opcion entre un conjunto de cardinalidad variable fijado en tiempo de ejecucion.
- Probabilidades calibradas: emite distribuciones con calibracion de temperatura, aptas para umbrales de confianza.
- Longitud de secuencia dinamica: admite entradas de distinta longitud sin recompilar el grafo.
- Ejecucion en CPU sin GPU mediante ONNX Runtime y en navegador mediante WASM o WebGPU (esta ultima sin validar).
- Procesamiento de entradas multilingues: los 34 casos sinteticos de validacion cubren texto multilingue, aunque no se declara soporte formal por idioma.
- Manejo de casos limite en la validacion: estado vacio y truncacion de secuencia.
- No genera texto libre.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene modo thinking, vision ni audio.

## Casos de uso

- Enrutado de intenciones en asistentes conversacionales: se puede formular cada turno como una decision entre un conjunto dinamico de intents y usar las probabilidades calibradas para decidir si se enruta a un flujo concreto o se pide aclaracion al usuario.
- Triage de tickets de soporte: dado un texto de incidencia y una lista de colas o categorias, el modelo devuelve la categoria mas probable; al ser batch 1 y secuencia dinamica, encaja en un servicio ligero de clasificacion por peticion.
- Clasificacion de moderacion de contenido: con opciones como permitido, revisar o bloquear, el umbral se puede fijar sobre la probabilidad calibrada en lugar del argmax, lo que permite operar con tasas de falsos positivos controladas.
- Inferencia en el navegador con privacidad de datos: la variante WASM/WebGPU permite ejecutar la decision en el cliente sin enviar el texto al servidor, util en formularios de encuestas o asistentes embebidos; conviene tener en cuenta que la ejecucion en navegador no esta validada.
- Despliegue en edge o entornos sin GPU: la variante INT8 de 561,28 MB con activaciones FP32 cabe en CPU de servidor o en dispositivos con memoria limitada, usando ONNX Runtime 1.30.0.
- Encuestas y formularios con opciones dinamicas: al aceptar un numero variable de opciones por llamada, el mismo grafo sirve para cuestionarios cuyas alternativas cambian segun el contexto previo.
- Preanotacion en pipelines de etiquetado: el modelo puede producir una etiqueta y una probabilidad por documento para priorizar la revision humana, siempre que se valide antes la exactitud de tarea, que no esta publicada.
- Filtrado previo en cascada: por su tamano reducido en INT8, puede actuar como primer clasificador que descarta la mayoria de casos triviales antes de invocar un modelo mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K ni equivalentes) en la informacion disponible. Los unicos datos publicados son pruebas de fidelidad de conversion, que miden la reproduccion de las salidas de PyTorch y no la exactitud frente a etiquetas humanas.

| Variante de pesos | Backend probado | Casos de referencia | Resultado |
|---|---|---:|---|
| FP32 estandar | ONNX Runtime CPU | 34 | Paridad de logits superada (atol/rtol 0,001); 100,0 % de coincidencia de argmax; deriva maxima de probabilidad 7,79176e-06 |
| FP32 transformado para WebGPU | ONNX Runtime CPU unicamente | 3 | Paridad de logits superada (atol/rtol 0,001); navegador sin probar |
| INT8 weight-only + almacenamiento FP16, computo FP32 | ONNX Runtime CPU | 34 | 100,0 % de coincidencia de argmax; deriva maxima de probabilidad 0,016499; KL media 5,62498e-05 |

El autor indica que el conjunto de 34 casos es sintetico, cubre tipos de pregunta, cardinalidades, texto multilingue, estado vacio y truncacion, y no dispone de etiquetas de referencia. Ademas, la seleccion del fallback de precision se hizo sobre ese mismo conjunto, por lo que los resultados no establecen exactitud ni calidad de calibracion en datos no vistos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la variante INT8 esta pensada para CPU y WASM, por lo que no requiere VRAM.
- GPU recomendadas: no se especifican; la ruta WebGPU esta orientada a GPU integradas o dedicadas accesibles desde el navegador, pero no ha sido validada.
- Compatibilidad con GPU de consumo: la variante INT8 de 561,28 MB y la ruta de CPU estan al alcance de equipos de consumo; no se documenta ningun requisito de GPU dedicada.
- Opciones de despliegue: ONNX Runtime 1.30.0 (CPU y WASM), ONNX Runtime Web con WebGPU para navegador, y exportacion desde el checkpoint PyTorch mediante `laya-models int8 --model typed-decisions`.
- Notas de carga: el fichero de datos externo debe colocarse junto al grafo; Python 3.12, numpy 2.5.3 y onnxruntime 1.30.0 son las versiones con las que se probo la ruta de CPU.
- Latencia y throughput estimados: no disponibles.
- Restriccion de ejecucion: batch fijo a 1, por lo que no hay batching de peticiones en una sola pasada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia interna, la unica alternativa identificable es el checkpoint original en PyTorch `convaiinnovations/laya-typed-decisions`, del que esta publicacion es una conversion.

| Modelo | Formato | Cuantizacion | Batch | Runtime | Licencia |
|---|---|---|---|---|---|
| ti3x-m/laya-typed-decisions-onnx | ONNX | FP32, FP32 transformado, INT8 weight-only | 1 | ONNX Runtime / WebGPU | Apache 2.0 |
| convaiinnovations/laya-typed-decisions | PyTorch | no disponible | no disponible | PyTorch | no disponible |

## Limitaciones y advertencias

- La ejecucion en WebGPU del navegador no ha sido validada; el grafo transformado solo se comprobo en CPU y con 3 casos de referencia.
- La ejecucion en WebAssembly del navegador tampoco ha sido validada, aunque la ruta de CPU con ONNX Runtime 1.30.0 si se probo.
- Las metricas publicadas miden fidelidad de conversion frente a PyTorch, no exactitud de tarea; no hay resultados frente a etiquetas humanas.
- Los 34 casos de validacion son sinteticos, sin etiquetas de referencia y cubren un espectro limitado de situaciones; no constituyen un conjunto de evaluacion held-out.
- El fallback de precision se eligio sobre el mismo conjunto de casos usado para reportar las metricas, lo que introduce sesgo de seleccion.
- No existe variante con computo FP16 porque la conversion genero un grafo invalido.
- Batch fijo a 1: no se pueden agrupar consultas en una sola pasada, lo que limita el throughput en servidores con carga concurrente.
- La variante INT8 no es apta para WebGPU, segun indica el autor.
- Al ser un modelo de decision y no generativo, no puede redactar respuestas, invocar herramientas ni mantener razonamiento multi-paso; cualquier flujo agente requiere integrarlo con un modelo generativo aparte.
- No se declara lista de idiomas soportados; la presencia de texto multilingue en los casos de prueba no equivale a cobertura documentada.
- Se desconoce el numero de parametros, el volumen de entrenamiento y la composicion del dataset original, lo que impide evaluar sesgos conocidos del checkpoint base.
- Riesgo de alucinacion propiamente dicho: no aplica a generacion de texto, pero si existe riesgo de clasificaciones erroneas con alta confianza en dominios alejados de los datos de entrenamiento del modelo base.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la licencia del checkpoint base `convaiinnovations/laya-typed-decisions` debe verificarse por separado antes de un despliegue en produccion.
- El resultado del pipeline no esta declarado en HuggingFace (aparece como no disponible) y los idiomas tampoco, lo que complica la integracion automatica en catalogos.
- El conteo de descargas y likes es cero, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ti3x-m/laya-typed-decisions-onnx
- Checkpoint base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Proyecto laya-webgpu (utilidad `laya-models`): https://github.com/ti3x/laya-webgpu
- Receta de cuantizacion de referencia, laya-web: https://github.com/nvkudva/laya-web
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos corresponden a servicios de correo no relacionados.
