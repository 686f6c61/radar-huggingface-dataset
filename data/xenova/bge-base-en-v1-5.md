# Xenova/bge-base-en-v1.5

## Resumen

Xenova/bge-base-en-v1.5 es una conversion a formato ONNX del modelo de embeddings de frases BAAI/bge-base-en-v1.5, publicada por Xenova para su uso directo en el navegador y en Node.js a traves de la libreria Transformers.js. No se trata de un modelo nuevo entrenado desde cero, sino de una reempaquetado del modelo original de BAAI con pesos ONNX en una subcarpeta `onnx`, pensado para inferencia en entornos WebML (web y edge). Su funcion es la extraccion de caracteristicas: convierte texto en vectores densos de 768 dimensiones que pueden compararse por similitud coseno.

El modelo resuelve tareas de representacion semantica de texto, siendo especialmente util para busqueda semantica (retrieval), similitud de frases, clustering y clasificacion basada en embeddings. Su relevancia actual radica en que permite ejecutar un modelo de embeddings de calidad en el cliente, sin necesidad de infraestructura de servidor dedicada, algo habitual en aplicaciones de RAG ligero, busqueda en navegador y sistemas de recomendacion.

La arquitectura declarada en las etiquetas del repositorio es de tipo BERT (transformer encoder) orientada a `feature-extraction`. El repositorio ocupa 1,4 GB e incluye los pesos ONNX. La licencia es MIT, heredada del modelo base, y aunque el identificador indica "en" (ingles), la ficha no declara una lista de idiomas de forma explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (etiqueta `bert` del repositorio) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos ONNX, con variante cuantizada incluida (etiqueta `base_model:quantized`); no se detallan los esquemas concretos |
| Idiomas soportados | ingles (deducido del identificador `bge-base-en`); la ficha no declara idiomas explicitamente |
| Licencia | MIT |
| Formato de pesos | ONNX (subcarpeta `onnx`); el modelo base original usa pesos PyTorch/safetensors |
| Dimension de embedding | 768 (segun la salida de ejemplo de la model card) |
| Tarea (pipeline) | feature-extraction |
| Tamano del repositorio | 1,4 GB |
| Libreria | transformers.js |

## Arquitectura y entrenamiento

El repositorio de Xenova no documenta un proceso de entrenamiento propio: es una conversion del modelo BAAI/bge-base-en-v1.5 a ONNX para que sea compatible con Transformers.js. Segun la model card, la intencion es que el modelo sea consumible en entornos JavaScript y WebML, y se recomienda el uso de Optimum de Hugging Face para convertir modelos a ONNX y estructurarlos con los pesos dentro de una subcarpeta `onnx`. La model card indica explicitamente que mantener un repositorio separado para los pesos ONNX es una solucion temporal hasta que WebML gane mas adopcion.

Los detalles de la arquitectura concreta (numero de capas, dimensiones internas, mecanismo de atencion) y del entrenamiento original del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO) no se detallan en la informacion proporcionada y se marcan como no disponibles. Lo unico verificable a partir del ejemplo de uso es que el modelo produce embeddings de 768 dimensiones con pooling de media y normalizacion, y que recomienda anteponer la instruccion `Represent this sentence for searching relevant passages: ` a las consultas en tareas de retrieval.

## Capacidades

- Extraccion de caracteristicas (embeddings) de texto: genera vectores de 768 dimensiones a partir de frases o documentos.
- Busqueda semantica y retrieval: la model card incluye un ejemplo de recuperacion de pasajes relevantes mediante similitud coseno con prefijo de consulta recomendado.
- Calculo de similitud entre frases: permite ordenar textos por relevancia respecto a una consulta (los ejemplos muestran puntuaciones de similitud coseno).
- Pooling de media y normalizacion: soportados como opciones del pipeline (`pooling: 'mean', normalize: true`).
- Ejecucion en navegador y Node.js: al estar en ONNX y Transformers.js, esta pensado para inferencia en cliente.
- No soporta, segun la informacion disponible: generacion de texto, tool calling, agentes, vision, audio ni modo de razonamiento explicito (la tarea declarada es unicamente `feature-extraction`).

## Casos de uso

- Busqueda semantica en aplicaciones web: indexar documentos como embeddings de 768 dimensiones y recuperar los mas relevantes ante una consulta, usando el prefijo recomendado para consultas. Adecuado porque el modelo esta pensado para retrieval y puede ejecutarse en el navegador.
- RAG ligero en cliente: generar embeddings de fragmentos de documentacion o de una base de conocimiento directamente en el navegador, reduciendo la necesidad de enviar texto a un servidor de embeddings.
- Deduplicacion y agrupamiento de textos: comparar embeddings por similitud coseno para detectar frases o documentos duplicados o para clustering semantico.
- Clasificacion de texto basada en embeddings: usar los vectores como entrada de un clasificador ligero (por ejemplo, para categorizar tickets de soporte o comentarios).
- Sistemas de recomendacion de contenido: representar articulos, productos o publicaciones como vectores y recomendar elementos similares a partir de la similitud entre embeddings.
- Moderacion o filtrado por similitud: comparar el contenido entrante contra un conjunto de ejemplos etiquetados representados como embeddings.
- Chatbots con memoria semantica: almacenar intercambios previos como embeddings y recuperar los fragmentos mas relevantes para construir el contexto de un LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio ocupa 1,4 GB, un tamano que incluye los pesos ONNX (probablemente en varias precisiones) del modelo base.
- No se dispone de datos oficiales sobre VRAM minima, GPU recomendadas ni throughput en la informacion proporcionada; estos valores se marcan como no disponibles.
- Por su naturaleza (pesos ONNX para Transformers.js), el objetivo declarado es la ejecucion en navegador y en el cliente, no necesariamente en GPU de servidor.
- Opciones de despliegue documentadas: Transformers.js (`@huggingface/transformers`) mediante el pipeline de `feature-extraction`; tambien puede desplegarse con cualquier runtime compatible con ONNX.
- No se proporcionan cifras de latencia ni de rendimiento en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Dimension de embedding | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| Xenova/bge-base-en-v1.5 | no disponible | 768 | no disponible | MIT | ONNX | Transformers.js / ONNX |
| BAAI/bge-base-en-v1.5 (original) | no disponible | 768 | no disponible | MIT | PyTorch/safetensors | Hugging Face / sentence-transformers |
| BAAI/bge-small-en-v1.5 | no disponible | no disponible | no disponible | MIT | PyTorch/safetensors | Hugging Face |
| sentence-transformers/all-MiniLM-L6-v2 | no disponible | no disponible | no disponible | Apache-2.0 | PyTorch/safetensors | Hugging Face |

La comparativa se limita a lo verificable: el modelo de Xenova es una conversion del BAAI/bge-base-en-v1.5 original (mismos pesos, distinto formato), por lo que la diferencia principal es el soporte de Transformers.js y ONNX. Los datos de parametros, contexto y rendimiento del resto de alternativas no se han proporcionado y se marcan como no disponibles.

## Limitaciones y advertencias

- El modelo esta orientado a ingles segun su identificador (`bge-base-en`); no se declara soporte multilingue.
- Al ser un modelo de embeddings, no genera texto: no puede usarse como LLM ni para tareas generativas.
- Riesgo de similitud espuria: la similitud coseno entre embeddings puede dar puntuaciones altas entre textos no relacionados semanticamente; conviene validar con datos propios.
- No se documentan en la ficha sesgos conocidos, tasas de alucinacion (no aplica a tareas de embeddings) ni limites de contexto explicitos.
- La licencia MIT permite uso comercial, pero los terminos pueden depender tambien del modelo base y de los datos con los que se entreno el original, no detallados aqui.
- La model card advierte de que mantener los pesos ONNX en un repositorio separado es una solucion temporal hasta que WebML gane adopcion, lo que puede afectar al mantenimiento a largo plazo.
- El repositorio incluye una etiqueta `base_model:quantized`, pero no especifica los esquemas de cuantizacion soportados ni el impacto en la calidad de los embeddings.
- El resultado de busqueda web proporcionado en la informacion no es relevante para este modelo y se ha descartado.

## Enlaces

- HuggingFace (repositorio Xenova): https://huggingface.co/Xenova/bge-base-en-v1.5
- Modelo base en HuggingFace: https://huggingface.co/BAAI/bge-base-en-v1.5
- Documentacion de Transformers.js: https://huggingface.co/docs/transformers.js
- Documentacion de Optimum (conversion a ONNX): https://huggingface.co/docs/optimum/index
- Paquete npm de Transformers.js: https://www.npmjs.com/package/@huggingface/transformers
