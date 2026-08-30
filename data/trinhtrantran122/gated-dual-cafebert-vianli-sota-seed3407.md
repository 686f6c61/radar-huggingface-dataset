# trinhtrantran122/gated-dual-cafebert-vianli-sota-seed3407

## Resumen

Gated-Dual CafeBERT es un modelo de inferencia de lenguaje natural (NLI) para vietnamita, desarrollado por el investigador trinhtrantran122. Se basa en la arquitectura CafeBERT de la Universidad de Informatica de Ho Chi Minh (UITNLP) y la extiende con un mecanismo de compuerta dual (gated-dual) para mejorar el rendimiento en el conjunto de datos adversarial VIANLI. El modelo se entrena especificamente para la tarea de NLI en vietnamita, un area donde los modelos multilingues generalistas suelen obtener resultados pobres.

La relevancia de este modelo radica en que aborda un problema concreto: la inferencia de lenguaje natural en vietnamita con datos adversariales. Segun el paper de VIANLI, el mejor modelo existente solo alcanza un 48,4% de precision en el conjunto de test, lo que demuestra la dificultad de esta tarea. Este checkpoint con seed 3407 logra un F1 macro de 0,4711, situandose cerca del estado del arte. El repositorio tiene un tamano de 2,3 GB, lo que sugiere una arquitectura de tipo BERT-large o similar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-Dual CafeBERT (BERT con mecanismo de compuerta dual) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, estandar BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | no disponible (probablemente safetensors o bin de PyTorch) |

## Arquitectura y entrenamiento

La arquitectura se basa en CafeBERT, un modelo BERT preentrenado especificamente para vietnamita por el grupo UITNLP. La innovacion principal es el mecanismo "gated-dual", que introduce una capa de compuerta dual que permite al modelo combinar de forma adaptativa representaciones de diferentes niveles o fuentes. Este mecanismo esta disenado para mejorar la robustez frente a ejemplos adversariales, que es precisamente el objetivo del dataset VIANLI.

El entrenamiento se realiza sobre el dataset VIANLI (Vietnamese Adversarial Natural Language Inference), que contiene pares de premisa-hipotesis generados adversarialmente para forzar a los modelos a razonar de forma mas profunda. El checkpoint con seed 3407 es uno de los multiples entrenamientos realizados con diferentes semillas para evaluar la estabilidad del modelo. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Inferencia de lenguaje natural (NLI) en vietnamita: clasifica pares premisa-hipotesis como entailment, contradiction o neutral.
- Razonamiento textual adversarial: entrenado especificamente para resistir ejemplos adversariales en vietnamita.
- Comprension semantica en vietnamita: hereda las capacidades de representacion linguistica de CafeBERT.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un modelo exclusivamente de clasificacion de secuencias.

## Casos de uso

- Evaluacion de sistemas de QA en vietnamita: puede usarse para verificar si una respuesta es coherente con el contexto dado, actuando como modulo de validacion en pipelines de question answering.
- Moderacion de contenido semantico: permite detectar contradicciones entre afirmaciones en foros o redes sociales vietnamitas, util para plataformas que necesitan verificar consistencia informativa.
- Investigacion academica en NLI adversarial: sirve como punto de partida para estudiar tecnicas de robustez en lenguas de bajos recursos, comparando el efecto del mecanismo gated-dual frente a arquitecturas BERT estandar.
- Sistemas de verificacion de hechos (fact-checking): puede integrarse en pipelines que comparan afirmaciones con documentos de referencia para detectar inconsistencias en vietnamita.
- Mejora de busqueda semantica: como modelo de re-ranking, puede filtrar resultados de busqueda evaluando si un documento realmente implica la consulta del usuario.
- Desarrollo de chatbots con verificacion de coherencia: permite que un chatbot vietnamita valide si sus respuestas son logicamente consistentes con el historial de conversacion.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Test Macro-F1 (VIANLI) | 0,4711 |
| Test Accuracy (VIANLI) | 0,4710 |

Segun el paper de VIANLI, el mejor modelo existente alcanza un 48,4% de accuracy en el test set, por lo que este checkpoint se situa ligeramente por debajo del estado del arte. No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K, ya que el modelo no esta disenado para esas tareas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,3 GB, lo que sugiere un modelo de aproximadamente 300-400 millones de parametros. Con cuantizacion a 8 bits, se necesitarian unos 400-500 MB de VRAM; en precision completa (FP32), alrededor de 1,5-2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia (GTX 1650, RTX 3050, etc.). Para fine-tuning, se recomienda una GPU con 8-16 GB (RTX 3070, RTX 4080, A100).
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna.
- Opciones de despliegue: al ser un modelo PyTorch, puede servirse con HuggingFace Transformers, ONNX Runtime, o convertirse a formato OpenVINO. No se ha confirmado soporte para vLLM, llama.cpp u Ollama, que estan orientados a modelos generativos.
- Latencia y throughput: no disponible, pero al ser un modelo BERT de tamano medio, la inferencia en GPU deberia ser de pocos milisegundos por ejemplo.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Test Accuracy (VIANLI) | Licencia |
|---|---|---|---|---|---|
| Gated-Dual CafeBERT (este) | BERT + gated-dual | no disponible | no disponible | 0,4710 | no disponible |
| CafeBERT base | BERT base | 110M aprox. | 512 | no disponible | no disponible |
| CafeBERT large | BERT large | 340M aprox. | 512 | no disponible | no disponible |
| Modelo SOTA en VIANLI (segun paper) | no especificado | no disponible | no disponible | 0,484 | no disponible |

No se dispone de datos de rendimiento de CafeBERT base o large en VIANLI para una comparacion directa. El paper de VIANLI indica que los modelos multilingues como XLM-R o mBERT obtienen resultados significativamente peores en este dataset.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse solo en vietnamita, el modelo puede tener sesgos culturales y linguisticos propios de ese idioma. No se ha evaluado su comportamiento en otros idiomas.
- Riesgo de alucinacion: al ser un modelo de clasificacion, no genera texto, por lo que el riesgo de alucinacion es bajo. Sin embargo, puede producir clasificaciones incorrectas en ejemplos adversariales no vistos.
- Limitaciones de contexto: la longitud de contexto no esta documentada, pero al ser una arquitectura BERT, es probable que este limitada a 512 tokens.
- Restricciones de licencia: la licencia no esta especificada en la model card, lo que impide conocer si es utilizable comercialmente. Se recomienda contactar al autor antes de usar en produccion.
- Caveat para produccion: el rendimiento en VIANLI es bajo en terminos absolutos (47% de accuracy), lo que indica que la tarea es extremadamente dificil. No debe usarse como unico modulo de decision en sistemas criticos sin validacion humana.
- El modelo no tiene informacion publicada sobre el proceso de entrenamiento, datos utilizados ni configuracion de hiperparametros, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trinhtrantran122/gated-dual-cafebert-vianli-sota-seed3407
- Modelo relacionado (seed diferente): https://huggingface.co/trinhtrantran122/gated-dual-cafebert-vinli-sota
- CafeBERT original: https://huggingface.co/uitnlp/CafeBERT
- Paper de VIANLI: https://arxiv.org/html/2406.17716v2
