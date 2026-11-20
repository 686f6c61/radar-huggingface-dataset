# xuxo1024/llmlingua-2-bert-base-multilingual-cased-meetingbank-onnx

## Resumen

LLMLingua-2 bert-base multilingual cased (MeetingBank), ONNX es una exportación al formato ONNX del modelo original de Microsoft `microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank`. Este modelo no genera texto: es un clasificador de tokens BERT multilingüe (cased) que, para cada token de entrada, predice si debe conservarse o descartarse al comprimir un prompt. Se trata de la pieza central de la técnica LLMLingua-2 descrita por Pan et al. (2024), que formula la compresión de prompts como una tarea de clasificación token a token en lugar de una generación autoregresiva.

El problema que resuelve es el coste de contexto en sistemas con LLM: reducir la longitud de prompts y documentos largos eliminando palabras poco informativas antes de enviarlos al modelo principal, con menos latencia y menor consumo de tokens. La variante MeetingBank está entrenada sobre datos de reuniones, lo que la orienta a transcripciones, actas y diálogos extensos.

La aportación concreta de esta ficha es la exportación ONNX: Microsoft solo publica pesos PyTorch, y este repositorio permite ejecutar el modelo con ONNX Runtime sin instalar PyTorch. El repositorio ocupa 0,7 GB y los pesos exportados en fp32 pesan 709,6 MB. No hay datos de descargas ni de uso publicados (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (transformer encoder), `AutoModelForTokenClassification` con cabeza de clasificación binaria |
| Parametros totales | no disponible (arquitectura BERT base, aproximadamente 110 M en el modelo original; no confirmado en la informacion proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | hasta 512 tokens por entrada (límite de BERT) |
| Tipos de cuantizacion | solo fp32 en este repositorio; la cuantización dinámica int8 se probó y se descartó porque alteraba hasta el 31 % de las decisiones conservar/descartar |
| Idiomas soportados | no disponible (el modelo base se denomina multilingual y usa tokenizer BERT WordPiece cased de 119.547 tokens) |
| Licencia | Apache-2.0 (los datos de entrenamiento MeetingBank son CC BY-NC-SA 4.0) |
| Formato de pesos | ONNX (opset 17), con `tokenizer.json` y `vocab.txt` |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder tipo BERT base con una cabeza de clasificación por token que produce logits de dimensión 2 por posición; `logits[..., 1]` indica la probabilidad de conservar el token. Las entradas son `input_ids`, `attention_mask` y `token_type_ids` (int64, forma `[batch, seq]`, hasta 512 posiciones) y la salida es `logits` de forma `[batch, seq, 2]`. El tokenizer es el WordPiece cased original de BERT, con 119.547 tokens.

El entrenamiento original de LLMLingua-2 (Pan et al., 2024) formula la compresión como clasificación token a token supervisada con etiquetas derivadas de compresiones de referencia, en lugar de usar un modelo generativo para comprimir. La variante MeetingBank se entrena sobre el corpus de reuniones MeetingBank. En esta exportación no se documentan número de tokens de entrenamiento, composición exacta del dataset ni si hubo RLHF/DPO; esa información corresponde al modelo original y no está disponible en la información proporcionada.

La innovación técnica de esta ficha es la exportación: `torch.onnx.export` con PyTorch 2.15, transformers 5.23, opset 17 y ejes de batch y secuencia dinámicos. La validación frente al modelo PyTorch en textos de 5, 31, 250 y 512 tokens arroja una diferencia máxima en los logits de 4,5e-06, lo que confirma una paridad numérica muy alta.

## Capacidades

- Clasificación binaria por token (conservar o descartar) para compresión de prompts y documentos.
- Eliminación de palabras poco informativas de un texto antes de enviarlo a un LLM, reduciendo el número de tokens de entrada.
- Procesamiento multilingüe según el modelo base (tokenizer cased multilingüe); el grado real de cobertura por idioma no está documentado en la información disponible.
- Ejecución con ONNX Runtime sin dependencia de PyTorch.
- Soporte de batch y secuencias de longitud dinámica hasta 512 tokens.
- No soporta tool calling, function calling, agentes ni multi-step reasoning: no es un modelo generativo.
- No dispone de modo de razonamiento (thinking mode), visión ni audio.

## Casos de uso

- Compresión de transcripciones de reuniones: el modelo está entrenado sobre MeetingBank y puede marcar los tokens prescindibles de actas y diálogos antes de resumirlos con un LLM, reduciendo el coste de contexto en documentos de hasta 512 tokens por fragmento.
- Preprocesado en pipelines RAG: antes de insertar fragmentos recuperados en el prompt, se pasan por el clasificador para recortar palabras vacías y redundancias, lo que disminuye el consumo de tokens del modelo generativo.
- Reducción de coste en atención al cliente: en conversaciones multi-turno, se comprime el historial acumulado token a token antes de enviarlo al modelo principal, manteniendo la información semántica relevante.
- Despliegue en entornos sin PyTorch: al estar en ONNX, puede integrarse en servicios basados en ONNX Runtime, incluidos entornos con dependencias mínimas o inferencia en CPU.
- Compresión previa a la inferencia en local: un servicio ligero puede comprimir prompts en CPU con ONNX Runtime y enviar solo la versión reducida a un LLM remoto, ahorrando ancho de banda y tokens facturados.
- Investigación sobre compresión de prompts: sirve como referencia reproducible para comparar tasas de compresión y fidelidad frente a otras técnicas, al tener paridad numérica verificada con el modelo PyTorch original.
- Procesamiento multilingüe de documentos: al heredar el tokenizer multilingüe de BERT, puede aplicarse a textos en varios idiomas, aunque la calidad por idioma debe validarse empíricamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta la validación de paridad numérica con el modelo PyTorch: diferencia máxima de 4,5e-06 en los logits sobre textos de 5, 31, 250 y 512 tokens. No hay datos de latencia ni de throughput.

## Requisitos de hardware

- Pesos ONNX en fp32 de 709,6 MB; el repositorio completo ocupa 0,7 GB.
- VRAM estimada: no disponible de forma explícita; con pesos fp32 de aproximadamente 0,7 GB, la inferencia cabe holgadamente en GPUs consumer, aunque el consumo real depende del batch y de la longitud de secuencia.
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, cualquier GPU consumer con al menos unos pocos GB libres debería poder alojar los pesos.
- Cabe en GPU consumer: sí, por el tamaño de los pesos; no se documentan requisitos mínimos concretos.
- Opciones de despliegue: ONNX Runtime (objetivo de esta exportación); también es posible usar el modelo PyTorch original con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| xuxo1024/llmlingua-2-bert-base-multilingual-cased-meetingbank-onnx | Clasificador de tokens BERT base para compresión | 512 tokens | ONNX (fp32) | Apache-2.0 | Exportación sin PyTorch; paridad verificada con el original |
| microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank | Clasificador de tokens BERT base para compresión | 512 tokens | PyTorch | Apache-2.0 | Modelo original de Microsoft; requiere PyTorch |
| LLMLingua / LongLLMLingua (Microsoft) | Compresión de prompts basada en modelos generativos | no disponible | PyTorch | no disponible | Enfoque alternativo, más costoso computacionalmente según el paper |
| Selective context / compresores basados en entropía | Compresión de prompts heurística | no disponible | varias | no disponible | Alternativas no neuronales; sin datos comparativos en la información disponible |

No se dispone de resultados de benchmarks comparativos entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: solo clasifica tokens; no puede usarse para responder preguntas, generar código ni razonar.
- Límite estricto de 512 tokens por entrada; documentos más largos deben fragmentarse.
- La cuantización int8 dinámica altera hasta el 31 % de las decisiones conservar/descartar, por lo que este repositorio se distribuye solo en fp32 y ocupa más espacio.
- Los datos de entrenamiento MeetingBank están bajo CC BY-NC-SA 4.0 (no comercial), lo que puede condicionar usos derivados aunque los pesos se distribuyen como Apache-2.0; conviene revisar `NOTICE`.
- No se documentan sesgos conocidos, tasas de alucinación ni cobertura real por idioma; deben evaluarse antes de usarlo en producción.
- El rendimiento en dominios distintos de reuniones (código, textos técnicos, idiomas no cubiertos) no está validado en la información disponible.
- Al ser una exportación de terceros (autor `xuxo1024`, no Microsoft), la reproducibilidad y el mantenimiento dependen del autor del repositorio.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/xuxo1024/llmlingua-2-bert-base-multilingual-cased-meetingbank-onnx
- Modelo base: https://huggingface.co/microsoft/llmlingua-2-bert-base-multilingual-cased-meetingbank
- Paper LLMLingua-2 (Pan et al., 2024): https://arxiv.org/abs/2403.12968
