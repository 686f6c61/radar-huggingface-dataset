# Tamarillo/prompt-complexity-router-base

## Resumen

Tamarillo/prompt-complexity-router-base es un clasificador de texto de 307,5 millones de parámetros disenado especificamente para enrutamiento de prompts (LLM routing) y estimacion de complejidad. Lo desarrolla Tamarillo sobre el backbone jhu-clsp/mmBERT-base, un encoder multilingue de la familia ModernBERT, y se publica bajo licencia Apache-2.0. Su proposito es decidir, para cada consulta entrante, si conviene enviarla a un modelo frontier (caro y potente) o a un modelo rapido (barato), permitiendo optimizar costes en sistemas multi-modelo sin sacrificar calidad.

La relevancia del modelo radica en que se presenta como sustituto directo (drop-in) de routellm/bert_gpt4_augmented, el enrutador de referencia del framework RouteLLM de lm-sys, manteniendo la misma interfaz de tres clases (fuerte, empate, debil) pero ampliando la ventana de contexto de 512 a 2.048 tokens. Ademas, el autor reporta mejoras sustanciales en ROC-AUC fuera de distribucion (OOD) y un rendimiento multilingue muy superior al de las alternativas, con soporte para 15 idiomas.

El checkpoint esta entrenado con 2.048 tokens de contexto (8.192 nativos por RoPE), no requiere trust_remote_code y se distribuye en safetensors y ONNX, incluyendo una variante FP16 de 587 MB pensada para inferencia en CPU y entornos edge. Todo ello lo convierte en una pieza util para pipelines de agentes y observabilidad de costes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT), clasificacion de secuencias |
| Parametros totales | 307.532.547 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens entrenados; 8.192 nativos por RoPE |
| Tipos de cuantizacion | ONNX FP32 (1.173,7 MB) y ONNX FP16 (587,0 MB); cuantizaciones GGUF no disponibles |
| Idiomas soportados | en, zh, es, fr, de, ru, pl, ja, ko, pt, it, ar, tr, nl, th |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx, model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder de la familia ModernBERT (concretamente mmBERT-base, de jhu-clsp), adaptado como clasificador de secuencias de tres clases. La cabeza de clasificacion produce logits que, tras softmax, se interpretan como: clase 0 (se necesita modelo fuerte), clase 1 (empate o complejidad moderada) y clase 2 (basta un modelo debil). La puntuacion exacta de RouteLLM se calcula como 1 - (p1 + p2), equivalente a p0, mientras que el autor define una puntuacion continua de complejidad como p0 + 0,5·p1 en el rango [0, 1]. El tokenizer fija model_max_length en 2.048, lo que desbloquea contexto cuatro veces mayor dentro de un BERTRouter sin modificar.

El entrenamiento combina varios conjuntos de datos: lmarena-ai/arena-human-preference-140k y arena-human-preference-55k (preferencias humanas de Arena), routellm/gpt4_judge_battles (batallas juzgadas por GPT-4), qwedsacf/competition_math (matematicas), google-research-datasets/mbpp (codigo) y FiscalNote/billsum (resumen de documentos largos). No se detalla en la informacion disponible el numero exacto de tokens de entrenamiento, la composicion porcentual del dataset ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un clasificador supervisado, lo esperable es entrenamiento con etiquetas derivadas de preferencias y batallas, pero el autor no lo explicita. La innovacion principal es la combinacion de un backbone multilingue moderno con contexto extendido y una calibracion de umbral (0,29) para decidir el enrutamiento.

## Capacidades

- Clasificacion de complejidad de prompts: asigna una probabilidad de que la consulta requiera un modelo frontier.
- Enrutamiento coste-calidad: decision binaria fuerte/rapido mediante umbral calibrable.
- Multilingue: evaluado en 10 idiomas no ingleses ademas del ingles, con AUC OOD de 0,952.
- Manejo de contexto largo: ventana de 2.048 tokens entrenados, adecuada para conversaciones multi-turno y prompts extensos.
- Invariancia a longitud: entrenado para no confundir prompts largos con prompts complejos (evaluacion Length-Inverted OOD).
- Integracion con RouteLLM: compatible con BERTRouter de lm-sys sin cambios de codigo.
- Inferencia en CPU y edge: variante ONNX FP16 de 587 MB.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento en produccion multi-modelo: cada peticion de usuario pasa por el clasificador y se deriva a un modelo pequeno o a uno frontier segun la puntuacion, reduciendo coste medio por consulta sin degradar la calidad percibida.
- Sustitucion de BERTRouter en RouteLLM: instalacion en una linea cambiando el checkpoint_path, con la ventaja de pasar de 512 a 2.048 tokens de contexto para conversaciones largas.
- Observabilidad de agentes: registrar la puntuacion de complejidad de cada prompt para analizar que tipos de tarea consumen mas presupuesto y detectar desviaciones.
- Atencion al cliente multilingue: clasificar consultas en espanol, frances, aleman, arabe, japones, etc., y decidir si requieren escalation a un modelo mayor.
- Filtrado previo en pipelines RAG: estimar la dificultad de la pregunta antes de recuperar documentos y generar, evitando gasto innecesario en consultas triviales.
- Control de costes en APIs publicas: imponer cuotas dinamicas enviando consultas simples a modelos economicos y reservando los caros para casos complejos.
- Evaluacion offline de trazas: procesar logs historicos de conversaciones para estimar cuanto se habria ahorrado con enrutamiento.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor y comparan el modelo con alternativas de la misma familia y con enrutadores de referencia.

| Metrica | prompt-complexity-router-base | routellm/bert_gpt4_augmented | nvidia/prompt-task-and-complexity-classifier |
|---|---|---|---|
| Public OOD 2-Suite Mean ROC-AUC | 0,890 | 0,781 | 0,737 |
| Multilingual OOD AUC | 0,952 | no disponible | no disponible |
| Multilingual OOD TPR@5%FPR | 0,795 | no disponible | no disponible |
| Length-Inverted OOD AUC | 0,828 | no disponible | no disponible |
| Length-Inverted OOD TPR@5%FPR | 0,748 | no disponible | no disponible |
| 2K Multi-Turn AUC | 0,896 | no disponible | no disponible |
| Arena-140K EN AUC | 0,948 | no disponible | no disponible |
| Arena-140K EN Spearman (rho) | 0,744 | no disponible | no disponible |
| 15+ Language Non-EN AUC | 0,949 | no disponible | no disponible |
| 15+ Language Non-EN Spearman (rho) | 0,732 | no disponible | no disponible |
| 15+ Language Non-EN TPR@5%FPR | 0,775 | no disponible | no disponible |

Rendimiento de inferencia reportado por el autor: 28,0 ms en A100 a 64 tokens, 52,82 ms en CPU FP32 a 64 tokens, y modelo ONNX FP16 de 587,0 MB.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en FP32 y 0,6 GB en FP16 para los pesos; con activaciones y batches pequenos, menos de 2 GB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; A100 y H100 para alto throughput en lote; RTX 4090, RTX 3090 y RTX 4060 Ti son mas que suficientes.
- Consumer GPU: si, cabe en practicamente cualquier GPU consumer moderna e incluso en iGPU con ONNX Runtime.
- Despliegue: transformers (>=4.48,<5), ONNX Runtime (CPU/edge), vLLM y TGI mediante text-embeddings-inference segun los tags del repositorio; llama.cpp y Ollama no estan confirmados para este checkpoint.
- Latencia y throughput: 28,0 ms por lote de 64 tokens en A100; 52,82 ms en CPU FP32 a 64 tokens; el modelo ONNX FP16 reduce a la mitad el tamano en disco.
- Nota tecnica: en PyTorch 2.4.x + CUDA con batches de mas de 512 tokens con padding, usar attn_implementation="eager".

## Comparativa con modelos similares

| Modelo | Backbone | Parametros | Idiomas | Public OOD-2 Mean | Licencia |
|---|---|---|---|---|---|
| Tamarillo/prompt-complexity-router-base | mmBERT-base | 307,5M | 15 | 0,890 | Apache-2.0 |
| Tamarillo/prompt-complexity-router-small | mmBERT-small | 140,6M | Multilingue | 0,875 | Apache-2.0 |
| Tamarillo/prompt-complexity-router-tiny-en | ettin-encoder-32m | 32,0M | Ingles | 0,645 | Apache-2.0 |
| routellm/bert_gpt4_augmented | BERT | no disponible | Ingles | 0,781 | no disponible en la informacion |
| nvidia/prompt-task-and-complexity-classifier | no disponible | no disponible | no disponible | 0,737 | no disponible en la informacion |

## Limitaciones y advertencias

- Es un clasificador, no un generador: no produce texto ni responde consultas; solo emite puntuaciones de complejidad.
- El umbral 0,29 es una recomendacion del autor y debe recalibrarse para cada par de modelos y presupuesto de coste.
- Riesgo de error de enrutamiento: un falso negativo envia una consulta compleja a un modelo debil, degradando la respuesta; un falso positivo desperdicia presupuesto.
- Sesgos inheritos de los datos de Arena y de las batallas juzgadas por GPT-4: pueden favorecer estilos y dominios sobrerrepresentados.
- La evaluacion multilingue cubre 10 idiomas no ingleses; el rendimiento en idiomas fuera de esa lista no esta medido.
- Requiere transformers >=4.48 y <5; entornos con versiones antiguas de routellm pueden necesitar actualizacion.
- No se han publicado datos sobre cuantizacion GGUF ni sobre despliegue en llama.cpp u Ollama.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte formal.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/prompt-complexity-router-base
- Repositorio RouteLLM: https://github.com/lm-sys/RouteLLM
- Modelo base mmBERT: https://huggingface.co/jhu-clsp/mmBERT-base
- Enrutador de referencia: https://huggingface.co/routellm/bert_gpt4_augmented
- Clasificador alternativo de NVIDIA: https://huggingface.co/nvidia/prompt-task-and-complexity-classifier
- Demo WASM (Space): https://huggingface.co/spaces/Tamarillo/prompt-complexity-router-demo
- Dataset Arena 140K: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Dataset Arena 55K: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-55k
- Dataset GPT-4 judge battles: https://huggingface.co/datasets/routellm/gpt4_judge_battles
- Dataset Competition Math: https://huggingface.co/datasets/qwedsacf/competition_math
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset BillSum: https://huggingface.co/datasets/FiscalNote/billsum
