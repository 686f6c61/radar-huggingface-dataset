# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-60

## Resumen

`roberta-fa-zwnj-base-finetuned-PersianQuAD-val-60` es un modelo de respuesta a preguntas extractiva (question answering) en persa, desarrollado por el usuario Z-Jafari. Se trata de un ajuste fino de `HooshvareLab/roberta-fa-zwnj-base`, un encoder RoBERTa adaptado al persa que incorpora el preprocesamiento de caracteres ZWNJ (zero-width non-joiner), un elemento ortografico critico en farsi. El modelo resuelve la tarea de localizar el fragmento de texto que responde a una pregunta dentro de un contexto dado, devolviendo los indices de inicio y fin de la respuesta.

El modelo cuenta con 117.709.058 parametros (~117,7 M), lo que lo situa en la categoria "base" de encoders tipo BERT/RoBERTa. Su relevancia radica en que cubre una laguna importante: hay pocos modelos de QA extractivo especificamente entrenados y evaluados sobre el conjunto de datos PersianQuAD, el benchmark de referencia para QA en persa. El ajuste se realizo durante 3 epocas con un learning rate de 2e-05, alcanzando un loss de validacion de 1,2359 y metricas de exact match del 58,0 % y F1 del 64,51 % sobre el conjunto de evaluacion.

La ficha se basa exclusivamente en la informacion publicada en el repositorio de Hugging Face. La model card esta generada automaticamente por el Trainer y contiene numerosos campos marcados como "More information needed", por lo que varios detalles de entrenamiento y datos no estan disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder transformer) adaptado al persa con preprocesamiento ZWNJ |
| Parametros totales | 117.709.058 (~117,7 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (depende de la configuracion del modelo base; no especificada en la informacion) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible en la model card; por el modelo base y el dataset (PersianQuAD) se infiere persa, sin confirmacion explicita |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer de tipo RoBERTa, heredado de `HooshvareLab/roberta-fa-zwnj-base`. La particularidad del modelo base es el tratamiento del ZWNJ (zero-width non-joiner), un caracter de control tipografico del persa que afecta a la tokenizacion y que suele normalizarse o preservarse de forma especifica en los modelos farsi. El ajuste fino se realizo con la libreria Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3, mediante el Trainer.

Los hiperparametros documentados son: learning rate de 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-08), scheduler lineal, 3 epocas y entrenamiento con precision mixta nativa AMP (Native AMP). El conjunto de datos de entrenamiento no se especifica en la model card ("unknown dataset"), aunque el nombre del modelo y el sufijo "val-60" sugieren un ajuste sobre PersianQuAD con una particion de validacion concreta. No se documenta el uso de RLHF, DPO ni ninguna innovacion arquitectonica adicional; es un ajuste fino supervisado estandar para QA extractivo. La evolucion del entrenamiento fue: loss de entrenamiento 1,6545 en la epoca 1, 1,0502 en la epoca 2 y 0,6687 en la epoca 3, con losses de validacion de 1,3141, 1,2402 y 1,2359 respectivamente.

## Capacidades

- Respuesta a preguntas extractiva en persa: dado un contexto y una pregunta, devuelve el fragmento exacto del contexto que responde a la pregunta (prediccion de span de inicio y fin).
- Comprension lectora: localizacion de informacion dentro de pasajes de texto.
- Modelo exclusivamente de encoder: no genera texto libre ni mantiene conversaciones multi-turno.
- No soporta tool calling ni function calling (no es un modelo instruido ni generativo).
- No soporta razonamiento multi-paso ni agentes.
- Capacidades multilingues: no documentadas; el ajuste y el modelo base estan orientados al persa.
- Sin modo "thinking", vision ni audio.

## Casos de uso

- Sistemas de busqueda de respuestas sobre documentacion en persa: indexar articulos, manuales o bases de conocimiento y usar el modelo para extraer la frase concreta que responde a la consulta del usuario, aprovechando su entrenamiento especifico sobre PersianQuAD.
- Atencion al cliente basada en FAQ: dado un corpus de preguntas frecuentes en farsi, el modelo localiza la respuesta exacta dentro de la entrada correspondiente, lo que reduce el riesgo de respuestas inventadas frente a un modelo generativo.
- Extraccion de datos estructurados a partir de texto: identificar en un documento administrativo o legal persa el fragmento que contiene un dato concreto (fechas, importes, nombres) para alimentar un pipeline posterior.
- Asistencia a la lectura y estudio: integrar el modelo en una aplicacion que, dado un texto persa, resalte la evidencia textual que responde a las preguntas del lector sobre el contenido.
- Enriquecimiento de pipelines de RAG (retrieval-augmented generation): usar el modelo como componente extractivo que valida o ancla la respuesta de un LLM generativo a un fragmento literal del contexto recuperado, mitigando alucinaciones.
- Analisis de encuestas y formularios abiertos en persa: extraer automaticamente la mencion relevante de respuestas largas para su categorizacion o tabulacion.
- Prototipado rapido en entornos con recursos limitados: al tratarse de un modelo de ~117,7 M de parametros, puede ejecutarse en CPU o en GPU de gama baja para pruebas de concepto de QA en persa.

## Benchmarks y rendimiento

La model-index del repositorio no contiene resultados declarados (lista `results` vacia). Los unicos datos disponibles son los de la model card, obtenidos sobre el conjunto de evaluacion del autor:

| Metrica | Valor |
|---|---|
| Loss de validacion | 1,2359 |
| Exact match | 58,0 |
| F1 | 64,5123 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni el tamano exacto del conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB para los pesos (~117,7 M de parametros × 4 bytes), mas overhead de activaciones y tokenizador.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; no requiere A100 ni H100. Una RTX 4090, RTX 3060 o incluso una GPU integrada moderna pueden ejecutarlo con holgura.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer actual e incluso en CPU para cargas moderadas.
- Opciones de despliegue: Transformers (pipeline `question-answering`), y por compatibilidad de arquitectura RoBERTa, herramientas de inferencia ONNX o servidores de inferencia tipo TGI/vLLM (no documentado oficialmente para este checkpoint). No se publican pesos GGUF, por lo que llama.cpp/Ollama requeririan conversion previa.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-60 | ~117,7 M | no disponible | QA extractivo en persa | apache-2.0 | Hugging Face (72 descargas) |
| HooshvareLab/roberta-fa-zwnj-base (modelo base) | no disponible en la informacion | no disponible | encoder de proposito general en persa | no disponible en la informacion | Hugging Face |
| Otros modelos de QA en persa | no disponible | no disponible | QA extractivo | no disponible | no disponible |

No se dispone de datos de rendimiento de modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene campos sin completar ("More information needed", "unknown dataset"), lo que impide verificar la composicion exacta de los datos de entrenamiento y evaluacion.
- El nombre "val-60" sugiere una particion de validacion concreta, pero no se documenta su significado ni el tamano del conjunto de evaluacion; las metricas pueden no ser representativas de un uso en produccion.
- Riesgo de alucinacion estructural: al ser un modelo extractivo, siempre devuelve un span del contexto, incluso cuando la respuesta no esta presente; es necesario aplicar umbrales de confianza o mecanismos de abstención.
- Idiomas: no se documenta soporte multilingue; el modelo esta orientado al persa y su rendimiento en otros idiomas no esta verificado.
- Longitud de contexto: no especificada; los modelos RoBERTa base suelen limitarse a 512 tokens, lo que restringe contextos largos (conviene confirmarlo en la configuracion del modelo base).
- Licencia apache-2.0: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene revisar tambien la licencia del modelo base.
- Sesgos: no se documenta ninguna evaluacion de sesgos; al entrenarse sobre un dataset academico (PersianQuAD), puede heredar sesgos de dominio y estilo de ese corpus.
- Sin mantenimiento documentado: el repositorio tiene 0 likes y 72 descargas, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-60
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
