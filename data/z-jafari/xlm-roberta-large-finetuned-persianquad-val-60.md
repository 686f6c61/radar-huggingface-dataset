# Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-60

## Resumen

xlm-roberta-large-finetuned-PersianQuAD-val-60 es un modelo de respuesta a preguntas extractiva (extractive question answering) obtenido mediante fine-tuning de FacebookAI/xlm-roberta-large sobre un conjunto de datos persa no especificado en la model card, presumiblemente relacionado con PersianQuAD. Lo desarrolla el usuario Z-Jafari y se distribuye con licencia MIT a través de Hugging Face. Su proposito es localizar la respuesta a una pregunta dentro de un parrafo de contexto en lengua persa, devolviendo el fragmento textual exacto (span) que la contiene.

Tecnicamente es un transformer encoder de tipo XLM-RoBERTa en su variante large, con 558.842.882 parametros y una cabeza de clasificacion sobre tokens para delimitar el inicio y el fin de la respuesta. No es un modelo generativo: no produce texto libre, sino que selecciona un span del contexto proporcionado, lo que reduce el riesgo de alucinacion a nivel de contenido pero limita su uso a tareas de comprension lectora.

Su relevancia es acotada y practica: cubre el nicho del QA extractivo en persa, un idioma con relativamente pocos recursos ajustados, y ofrece unas metricas declaradas de 87,0 de exact match y 89,28 de F1 sobre el conjunto de evaluacion, con una perdida de validacion de 0,6687. El repositorio ocupa 35,8 GB, lo que sugiere la presencia de multiples checkpoints de entrenamiento ademas de los pesos finales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabeza de question answering extractiva |
| Parametros totales | 558.842.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (XLM-RoBERTa large admite hasta 512 tokens de entrada, segun el modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; por el nombre del modelo y el dataset, orientado a persa |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de FacebookAI/xlm-roberta-large, un encoder transformer multilingue basado en RoBERTa con vocabulario SentencePiece y embeddings posicionales relativos. Sobre esa base se anade una cabeza de QA que proyecta los estados ocultos a dos logits por token (inicio y fin de la respuesta), de modo que la salida es un span del contexto de entrada. El fine-tuning se realizo con la libreria Transformers 5.22.1 y PyTorch 2.14.1+cu130, usando el Trainer de Hugging Face con entrenamiento en precision mixta nativa (AMP).

Los hiperparametros documentados son: learning rate de 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW fusionado con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y 3 epocas. El entrenamiento consta de 3873 pasos (1291 por epoca). La evolucion de la perdida muestra sobreajuste a partir de la segunda epoca: la perdida de validacion baja de 0,6613 en la epoca 1 a 0,5744 en la epoca 2, pero sube a 0,6687 en la epoca 3, mientras la perdida de entrenamiento cae de 0,7548 a 0,3022. No se documentan datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplico RLHF o DPO (procedimientos, por otra parte, poco habituales en QA extractivo).

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span del contexto que responde a la pregunta.
- Comprension lectora: localizacion de evidencia textual, util para tareas de reading comprehension.
- Capacidades multilingues: heredadas parcialmente del modelo base XLM-RoBERTa, aunque el ajuste se ha realizado sobre datos persas y no se documenta el rendimiento en otros idiomas.
- No soporta generacion de texto libre, tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No dispone de modo thinking, vision ni audio.
- No es un modelo de chat ni de instrucciones: su interfaz es pregunta + contexto.

## Casos de uso

- Busqueda de respuestas en documentacion corporativa en persa: indexar manuales o politicas internas y usar el modelo para extraer el fragmento exacto que responde a la consulta de un empleado, con la ventaja de que la respuesta siempre procede del texto fuente.
- Sistemas de FAQ sobre base documental: dado un articulo de ayuda y la pregunta del usuario, el modelo senala el parrafo relevante, que despues puede presentarse tal cual o reformularse con un modelo generativo.
- Extraccion de campos en formularios y contratos persas: localizar valores concretos (fechas, importes, nombres) a partir de una pregunta plantilla sobre el texto del documento.
- Asistencia a la lectura de prensa o literatura en persa: responder preguntas sobre un articulo concreto en aplicaciones educativas o de estudio de idiomas.
- Enriquecimiento de pipelines de RAG (retrieval-augmented generation): usar el modelo como etapa de reranking o de extraccion de evidencia sobre los documentos recuperados antes de pasarlos a un generador, lo que reduce el riesgo de alucinacion.
- Anotacion semiautomatica de datasets de QA en persa: preetiquetar spans de respuesta sobre corpus nuevos para revision humana, aprovechando el exact match de 87,0 declarado.
- Moderacion y verificacion de afirmaciones: comprobar si una afirmacion aparece respaldada en un texto fuente persa localizando el span correspondiente.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Exact match | 87,0 |
| F1 | 89,2824 |
| Loss (evaluacion) | 0,6687 |

Evolucion del entrenamiento:

| Epoca | Paso | Training loss | Validation loss |
|---|---|---|---|
| 1,0 | 1291 | 0,7548 | 0,6613 |
| 2,0 | 2582 | 0,4799 | 0,5744 |
| 3,0 | 3873 | 0,3022 | 0,6687 |

El model-index del repositorio no incluye resultados estructurados (`results: []`). No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,2 GB solo para pesos (558,8 M de parametros), mas activaciones y overhead del runtime; en la practica, entre 3 y 4 GB.
- En fp16/bf16: aproximadamente 1,1 GB de pesos; el modelo cabe holgadamente en cualquier GPU consumer con 6 GB o mas.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; para alto throughput en servidor, A100 o H100 no aportan ventaja significativa por el reducido tamano del modelo.
- Despliegue: compatible con transformers (pipeline `question-answering`), con Text Generation Inference no aplica por no ser generativo; es viable con ONNX Runtime, TorchScript y servidores de inferencia tipo FastAPI o Triton. No se documentan pesos GGUF ni soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Con 512 tokens de contexto y un encoder large, se espera latencia de decenas de milisegundos por consulta en GPU consumer, pero es una estimacion no verificada.
- El repositorio de 35,8 GB incluye checkpoints intermedios de entrenamiento; para despliegue basta con descargar los pesos finales (safetensors).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-60 | 558,8 M | no disponible (base: 512 tokens) | QA extractivo en persa | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 558,8 M | 512 tokens | Modelo base multilingue (sin ajuste de QA) | MIT | Hugging Face |
| deepset/xlm-roberta-large-squad2 | 558,8 M | 512 tokens | QA extractivo en ingles (SQuAD2) | MIT | Hugging Face |

La comparacion con alternativas especificas en persa no esta disponible en la informacion proporcionada. Frente al modelo base, la diferencia es el ajuste supervisado sobre datos persas; frente a variantes ajustadas en ingles, el dominio linguistico es distinto y no son intercambiables sin evaluacion previa.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"): no hay documentacion sobre el dataset de entrenamiento, los usos previstos ni las limitaciones declaradas por el autor.
- Riesgo de sobreajuste: la perdida de validacion empeora en la tercera epoca (0,6687 frente a 0,5744 en la segunda), por lo que el checkpoint final podria no ser el optimo.
- Las metricas de 87,0 de exact match y 89,28 de F1 proceden de un unico conjunto de evaluacion no descrito; no hay evidencia de generalizacion a otros dominios persas.
- Solo responde con spans del contexto: si la respuesta no esta literalmente en el texto, no puede generarla ni parafrasearla.
- No se documenta el comportamiento en otros idiomas distintos del persa, pese a la naturaleza multilingue del modelo base.
- Sesgos: no documentados; al entrenar sobre un corpus persa no descrito, pueden heredarse sesgos de dominio y de registro del dataset.
- Alucinacion: el riesgo es bajo a nivel de contenido (la respuesta se copia del contexto), pero puede seleccionar spans incorrectos o irrelevantes cuando la pregunta es ambigua.
- Licencia MIT: permite uso comercial y modificacion con atribucion; conviene conservar el aviso de copyright. No se imponen restricciones adicionales conocidas.
- Para produccion: el modelo no incluye tokenizador de preguntas ni plantilla de prompt; hay que construir manualmente la entrada pregunta + contexto con los separadores de XLM-RoBERTa (`<s>` y `</s>`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-large-finetuned-PersianQuAD-val-60
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Unsupervised Cross-lingual Representation Learning at Scale): https://arxiv.org/abs/1911.02116
- Documentacion de Transformers para question answering: https://huggingface.co/docs/transformers/tasks/question_answering
- Dataset PersianQuAD: no disponible en la informacion proporcionada.
