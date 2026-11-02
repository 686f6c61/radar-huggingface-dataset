# Starlinghq/qwen3-reranker-0.6b-onnx

## Resumen

Starlinghq/qwen3-reranker-0.6b-onnx es una conversion a formato ONNX del modelo Qwen/Qwen3-Reranker-0.6B, un reranker de recuperacion de informacion desarrollado originalmente por el equipo Qwen de Alibaba Cloud. El modelo base resuelve el problema de reordenar (rerank) pares consulta-documento segun su relevancia, una tarea central en pipelines de busqueda semantica y RAG (Retrieval-Augmented Generation). El repositorio lo publica Starlinghq como artefacto de soporte para el paquete .NET `Starlings.Models.Qwen3Embedding`, en estado experimental.

La contribucion concreta de este repositorio no es un modelo nuevo, sino un grafo ONNX fp32 reproducible que permite ejecutar el reranker sin PyTorch, mediante ONNX Runtime. El grafo expone `input_ids` y `attention_mask` como entradas y devuelve `yes_no_logits` (la cabeza del modelo restringida a los tokens `yes` y `no`) y `last_hidden_state`. La puntuacion de relevancia se obtiene como la diferencia de logits `logit[yes] - logit[no]` en la ultima posicion valida.

El modelo base tiene 0.6 mil millones de parametros, admite secuencias de hasta 8192 tokens y se distribuye bajo licencia Apache-2.0. Su interes actual radica en que ofrece una alternativa ligera y desplegable en CPU para reranking de alta calidad, con verificacion numerica documentada frente al modelo original en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3Model) con cabeza de clasificacion restringida a dos tokens (`yes`/`no`) |
| Parametros totales | 0.6 mil millones (modelo base Qwen3-Reranker-0.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (secuencia maxima del grafo ONNX) |
| Tipos de cuantizacion | fp32 (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible (la model card del repositorio no los declara) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx` + `model.onnx.data` externo, ~2.4 GB) |

## Arquitectura y entrenamiento

El grafo ONNX se exporta a partir de `Qwen3Model` con atencion SDPA y una cabeza de dos filas tomada de los embeddings atados (tied embeddings). Se genero con el exportador dynamo de PyTorch (`torch.onnx.export(..., dynamo=True, opset_version=20)`) con batch y secuencia dinamicos, y posteriormente se re-guardo eliminando metadatos del exportador y docstrings, con los pesos en un unico fichero de datos externo. Las entradas son `input_ids` y `attention_mask` (int64, `[batch, sequence]`, padding a la derecha con `<|endoftext|>` = 151643, secuencia hasta 8192); no hay entrada `position_ids` (las posiciones van de 0 a sequence-1) ni cache KV. Las salidas son `yes_no_logits` (float32, `[batch, sequence, 2]`, con los tokens `no` = 2152 y `yes` = 9693 en ese orden) y `last_hidden_state` (float32, `[batch, sequence, 1024]`).

El prompt no forma parte del grafo: debe construirse externamente como `prefix + tokens("<Instruct>: {instruction}\n<Query>: {query}\n<Document>: {document}") + suffix`, segun la plantilla `chat_template.jinja` fijada. La instruccion por defecto es `Given a web search query, retrieve relevant passages that answer the query`. Tampoco estan en el grafo la truncacion, el calculo de la puntuacion ni su sigmoide, ni los logits sobre el vocabulario completo (el grafo no puede generar texto). No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens o el uso de RLHF/DPO del modelo base en la informacion proporcionada.

## Capacidades

- Reranking de pares consulta-documento: devuelve una puntuacion de relevancia (log-odds `yes` vs `no`) por par.
- Salida de representaciones ocultas (`last_hidden_state`, 1024 dimensiones) para usos posteriores.
- Procesamiento por lotes con padding a la derecha y longitudes de secuencia dinamicas.
- Manejo de secuencias largas de hasta 8192 tokens, verificado con pares de aproximadamente 2400 y 6600 tokens.
- Soporte multilingue y de diversos sistemas de escritura segun la verificacion del autor (corpus de 49 textos con varias escrituras, emoji y cadena vacia), aunque los idiomas no se declaran formalmente.
- No soporta generacion de texto, tool calling, function calling, agentes ni razonamiento multi-paso: el grafo esta restringido a la cabeza de dos tokens.

## Casos de uso

- Reranking en pipelines RAG: tras una recuperacion inicial por embeddings, el modelo reordena los candidatos por relevancia real consulta-documento, mejorando la precision del contexto entregado al LLM generador.
- Busqueda semantica en aplicaciones .NET: integrado mediante el paquete `Starlings.Models.Qwen3Embedding` con perfil `qwen3-reranker-0.6b`, permite anadir reranking sin dependencia de PyTorch.
- Despliegue en CPU sin GPU: al ejecutarse con ONNX Runtime y pesos fp32, es viable en servidores sin acelerador, con un coste de memoria de aproximadamente 2.4 GB para los pesos.
- Filtrado de resultados en motores de busqueda internos: puntuar pares consulta-pasaje para descartar documentos poco relevantes antes de mostrarlos al usuario.
- Evaluacion de calidad de recuperacion: usar las puntuaciones de log-odds como metrica objetiva para comparar estrategias de indexado o de chunking.
- Verificacion de integridad en produccion: el paquete fija cada fichero por tamano y SHA-256, lo que permite validar que el artefacto desplegado es exactamente el publicado.
- Procesamiento por lotes de documentos largos: con contexto de 8192 tokens, puede puntuar pasajes extensos sin truncar en la mayoria de casos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, etc.) en la informacion disponible. El autor documenta unicamente verificaciones de equivalencia numerica entre el grafo ONNX y el modelo original en PyTorch:

| Comparacion | Diferencia maxima |
|---|---|
| Puntuacion (log-odds) | 2.7e-5 |
| Logits `yes`/`no` en cada posicion valida (pares cortos) | 4.2e-4 |
| Estado oculto en cada token valido | 3.7e-3 (par de 6600 tokens; 2.1e-3 a 2058 tokens; maximo 8.4e-4 en el resto) |
| Puntuacion frente a `CrossEncoder.predict` de sentence-transformers (pares de la model card) | 1.8e-5 |

La verificacion se realizo con ONNX Runtime 1.30.0 (CPUExecutionProvider) frente a `AutoModelForCausalLM` en fp32 con sdpa, sobre los cuatro pares consulta-documento de la model card, un par por cada texto del corpus de tokenizer de 49 textos y dos pares largos. No se aportan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente 2.4 GB solo para los pesos fp32, mas memoria para activaciones y el estado oculto de salida; en CPU el consumo es de RAM del sistema.
- GPU recomendadas: no se especifican en la informacion disponible; al ser un modelo de 0.6B en fp32, cabe en GPUs de consumo con suficiente memoria, aunque el repositorio esta orientado a ejecucion en CPU con ONNX Runtime.
- Cabe en GPU de consumo: si, en terminos de memoria de pesos, aunque no hay datos publicados de rendimiento en GPU.
- Opciones de despliegue: ONNX Runtime (verificado con la version 1.30.0, CPUExecutionProvider); el paquete .NET `Starlings.Models.Qwen3Embedding` es el consumidor previsto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Starlinghq/qwen3-reranker-0.6b-onnx | 0.6B | 8192 | ONNX fp32 | Apache-2.0 | Conversion ONNX del reranker Qwen3; sin benchmarks publicados |
| Qwen/Qwen3-Reranker-0.6B | 0.6B | 8192 | PyTorch (safetensors) | Apache-2.0 | Modelo base original; requiere PyTorch/transformers |
| Alternativas de reranking de la familia Qwen3 | no disponible | no disponible | no disponible | no disponible | No se dispone de datos en la informacion proporcionada |

No se dispone de informacion sobre otros rerankers comparables (por ejemplo, de otras familias) en los datos proporcionados, por lo que la comparativa se limita al modelo base y a la variante aqui descrita.

## Limitaciones y advertencias

- Estado experimental: el autor declara el perfil como Experimental y aclara que las cifras de verificacion describen esta build, no constituyen una garantia de soporte.
- El grafo no genera texto ni calcula la puntuacion: el prompt, la truncacion, la diferencia de logits y el sigmoide deben implementarse externamente.
- Sin cache KV ni entrada `position_ids`: las posiciones se fijan de 0 a sequence-1, lo que limita ciertos usos incrementales.
- Idiomas no declarados formalmente en el repositorio; la cobertura multilingue solo esta respaldada por la verificacion empirica del autor.
- Riesgo de alucinacion: no aplica a la generacion de texto (el modelo no genera), pero las puntuaciones de relevancia pueden ser erroneas en dominios alejados de los datos de entrenamiento del modelo base.
- Sesgos: no se documentan sesgos conocidos en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero exige conservar los avisos de atribucion y las modificaciones (seccion 4), recogidos en `NOTICE` y `LICENSE`.
- StarlingHq no esta afiliado ni respaldado por Alibaba Cloud ni por el equipo Qwen.
- Integridad: el paquete .NET rechaza ficheros cuyo tamano o SHA-256 no coincidan con los fijados, lo que puede romper actualizaciones si se sustituyen ficheros manualmente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Starlinghq/qwen3-reranker-0.6b-onnx
- Modelo base: https://huggingface.co/Qwen/Qwen3-Reranker-0.6B
- Repositorio del proyecto Starling: https://github.com/starlinghq/starling
