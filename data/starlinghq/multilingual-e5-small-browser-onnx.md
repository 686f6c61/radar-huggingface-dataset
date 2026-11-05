# Starlinghq/multilingual-e5-small-browser-onnx

## Resumen

`Starlinghq/multilingual-e5-small-browser-onnx` es una variante optimizada del modelo de embeddings `intfloat/multilingual-e5-small`, empaquetada en formato ONNX para su ejecución en entornos de navegador mediante WebAssembly y WebGPU. El autor, Starlinghq, la publica como parte de los paquetes de navegador (`Starlings.Models.E5.Browser`) del proyecto Starling, una herramienta de código abierto orientada a la ejecución local de modelos en el cliente.

El modelo base, `multilingual-e5-small`, es un encoder multilingüe de la familia E5 (Embeddings from bidirectional Encoders) diseñado para similitud semántica y recuperación de información. Esta variante concreta no cambia la arquitectura ni el entrenamiento: únicamente aplica cuantización de solo peso a las tablas de embeddings (palabra, posición y tipo) a int8, manteniendo todas las operaciones MatMul en fp32 y sin cuantización de activaciones en tiempo de ejecución.

Su relevancia es práctica: reduce el grafo a 182 MB con una similitud coseno de 0.9998 respecto al grafo fp32 original, lo que permite desplegar búsqueda semántica y similitud de frases directamente en el navegador sin depender de servidores. El estado de madurez es experimental y no cuenta con insignia de soporte para WebAssembly.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia E5, base `intfloat/multilingual-e5-small`) |
| Parametros totales | no disponible (el modelo base es de tipo "small"; no se especifica cifra exacta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantizacion de solo peso a int8 en tablas de embeddings (palabra, posicion, tipo); MatMul en fp32; sin cuantizacion de activaciones |
| Idiomas soportados | no disponible (el modelo base es multilingue) |
| Licencia | MIT |
| Formato de pesos | ONNX (grafo unico, 182 MB) |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer de la familia E5, derivado de `intfloat/multilingual-e5-small`. Esta variante no incluye reentrenamiento: parte del grafo `onnx/model.onnx` en la revision `614241f622f53c4eeff9890bdc4f31cfecc418b3` del modelo original y aplica una transformacion de cuantizacion.

La modificacion consiste en cuantizar a int8 las tablas de embeddings de palabra, posicion y tipo, mientras que todas las operaciones MatMul permanecen en fp32. No hay cuantizacion de activaciones en tiempo de ejecucion. El proceso se documenta en el script `quantize_e5_browser.py` del repositorio Starling, y el archivo `variants.json` registra las versiones de las herramientas y las llamadas exactas empleadas. El resultado es un grafo de 182 MB con una similitud coseno de 0.9998 frente al grafo fp32 de referencia. El loader de Starling verifica el SHA-256 `374a3cc034a1dba112ecd1a9fba920be63f295cada3c65ab15a0a3a84739fb19` y rechaza cualquier otro archivo.

No se dispone de informacion sobre el volumen de tokens, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada; dichos detalles corresponden al modelo base y no se documentan en esta ficha.

## Capacidades

- Generacion de embeddings de frases y documentos para similitud semantica.
- Calculo de similitud coseno entre pares de textos.
- Recuperacion de informacion y busqueda semantica (dense retrieval).
- Capacidades multilingues heredadas del modelo base `intfloat/multilingual-e5-small` (los idiomas concretos no se detallan en la informacion disponible).
- Ejecucion en navegador mediante WebAssembly y WebGPU.
- Integracion con los paquetes de navegador de Starling (`Starlings.Models.E5.Browser`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio en la informacion proporcionada.

## Casos de uso

- Busqueda semantica en el navegador: el modelo calcula embeddings de consultas y documentos en el cliente, permitiendo busqueda por similitud sin enviar texto a un servidor y sin coste de inferencia remota.
- Deteccion de duplicados y near-duplicates en aplicaciones web: comparar embeddings de entradas de usuario para identificar contenido repetido directamente en el navegador.
- Clasificacion y agrupamiento de textos en el cliente: usar los embeddings como caracteristicas para tareas de clustering o clasificacion ligera en aplicaciones de frontend.
- Sistemas de recomendacion basados en contenido: calcular similitud entre descripciones de productos o articulos en el navegador para sugerencias en tiempo real.
- Asistentes y chatbots con recuperacion local: integrar el modelo en un pipeline RAG del lado del cliente para recuperar fragmentos relevantes de una base de conocimiento local antes de invocar a un modelo generativo.
- Moderacion y filtrado de contenido en el cliente: comparar mensajes contra una lista de patrones conocidos mediante similitud semantica sin salir del navegador.
- Extensiones y aplicaciones de escritorio basadas en web: al ser un grafo ONNX de 182 MB, puede empaquetarse en extensiones de navegador o aplicaciones Electron para funcionalidad de NLP sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El unico dato de rendimiento proporcionado es la similitud coseno de 0.9998 entre este grafo cuantizado y el grafo fp32 de referencia, junto con el tamano de 182 MB.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el grafo ocupa 182 MB en disco y debe cargarse en memoria del navegador, por lo que el consumo de memoria del proceso sera del orden de cientos de MB incluyendo el runtime de WebAssembly/WebGPU.
- GPU recomendadas: no se especifican. El modelo esta orientado a ejecucion en navegador con WebGPU, por lo que depende de la GPU integrada o dedicada del dispositivo del usuario.
- Compatibilidad con GPU de consumo: si, al estar disenado para ejecucion en el navegador del cliente; no se detallan modelos concretos.
- Opciones de despliegue: ONNX Runtime en navegador mediante WebAssembly y WebGPU, a traves de los paquetes de Starling (`Starlings.Models.E5.Browser`). No se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/multilingual-e5-small-browser-onnx | no disponible (tipo small) | no disponible | ONNX (182 MB) | MIT | Cuantizacion int8 de embeddings, orientado a navegador |
| intfloat/multilingual-e5-small | no disponible (tipo small) | no disponible | safetensors / ONNX | MIT | Modelo base original, multilingue, sin optimizar para navegador |
| Otros modelos de la familia E5 | no disponible | no disponible | varios | MIT | No se dispone de datos comparativos en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Estado experimental: la model card indica explicitamente madurez experimental y ausencia de insignia de soporte para WebAssembly.
- El loader de Starling rechaza cualquier archivo cuyo SHA-256 no coincida con `374a3cc034a1dba112ecd1a9fba920be63f295cada3c65ab15a0a3a84739fb19`, lo que limita su uso a ese runtime concreto.
- La cuantizacion se aplica solo a las tablas de embeddings; no se documentan efectos sobre la calidad mas alla de la similitud coseno de 0.9998 respecto al fp32.
- No se detallan los idiomas soportados ni el contexto maximo en la informacion disponible.
- Riesgo de alucinacion y sesgos: no se documentan en la informacion proporcionada; al ser un modelo de embeddings, no genera texto, pero puede heredar sesgos del modelo base.
- Uso comercial: la licencia MIT del modelo base se mantiene en este grafo, por lo que permite uso comercial segun los terminos de dicha licencia.
- Dependencia de WebGPU/WebAssembly: el rendimiento dependera de las capacidades del navegador y del dispositivo del usuario final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Starlinghq/multilingual-e5-small-browser-onnx
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Repositorio Starling: https://github.com/starlinghq/starling
- Script de cuantizacion: https://github.com/starlinghq/starling/blob/main/model-pipeline/reference/encoder/quantize_e5_browser.py
