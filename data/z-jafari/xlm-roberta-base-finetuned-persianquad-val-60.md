# Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-60

## Resumen

`Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-60` es un ajuste fino (fine-tuning) de `FacebookAI/xlm-roberta-base` para la tarea de respuesta a preguntas extractiva (question answering) sobre texto en persa. El modelo ha sido entrenado por el usuario Z-Jafari y publicado en Hugging Face bajo licencia MIT. Su proposito es localizar el fragmento exacto de un contexto que responde a una pregunta formulada por el usuario, devolviendo los indices de inicio y fin del span.

Arquitectura: XLM-RoBERTa base, un transformer encoder-only de tipo RoBERTa multilingue. Con 277.454.594 parametros totales, se trata de un modelo de tamano medio, adecuado para despliegue en infraestructura modesta. El contexto maximo heredado del modelo base es de 512 tokens, limitacion habitual en tareas extractivas.

La relevancia de este modelo radica en su especializacion: aunque XLM-RoBERTa base ya cubre persa entre sus idiomas de preentrenamiento, este ajuste fino concreto mejora la precision en la tarea de QA extractiva sobre el conjunto de validacion de PersianQuAD, alcanzando un exact match de 79,5 y un F1 de 82,78. Es un modelo de investigacion y experimentacion, no un sistema de produccion validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base) |
| Parametros totales | 277.454.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16) |
| Idiomas soportados | no disponible (modelo base multilingue; ajuste orientado a persa) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en XLM-RoBERTa base, un transformer encoder-only con 12 capas, atencion multi-cabeza y embeddings multilingues entrenados sobre corpus en 100 idiomas. Sobre esta base se ha realizado un ajuste fino supervisado para la tarea de question answering extractiva, anadiendo una cabeza de clasificacion sobre los tokens de inicio y fin del span respuesta.

Los hiperparametros de entrenamiento declarados por el autor son: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, 3 epocas, optimizador AdamW con betas (0,9, 0,999) y epsilon 1e-08, scheduler lineal y precision mixta nativa (AMP). El conjunto de entrenamiento no se especifica en la model card ("unknown dataset"), aunque el nombre del modelo sugiere que se empleo PersianQuAD. La perdida de validacion evoluciono de 0,8199 en la epoca 1 a 0,7170 en la epoca 2 y 0,7286 en la epoca 3, lo que indica un ligero sobreajuste a partir de la segunda epoca. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion adicionales.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que contiene la respuesta.
- Procesamiento de texto en persa: el ajuste fino esta orientado a este idioma, aunque el modelo base es multilingue.
- Razonamiento limitado a la extraccion literal: no genera respuestas abstractivas ni sintetiza informacion de multiples fragmentos.
- No soporta tool calling ni function calling: es un modelo encoder-only sin capacidad generativa.
- No soporta agentes ni razonamiento multi-paso: la tarea se resuelve en una unica pasada de inferencia.
- Capacidades multilingues heredadas del modelo base, aunque no validadas en este ajuste fino.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Busqueda de respuestas en documentacion tecnica en persa: el modelo recibe un parrafo de documentacion y una pregunta del usuario, y devuelve el fragmento exacto que contiene la respuesta. Adecuado por su entrenamiento especifico en QA extractiva sobre persa.
- Sistemas de preguntas frecuentes (FAQ) sobre bases documentales: dado un corpus de articulos, se recupera el pasaje relevante y el modelo localiza la respuesta concreta. Su tamano de 277M parametros permite desplegarlo en CPU con latencia aceptable.
- Extraccion de campos en formularios y contratos: localizacion de valores concretos (fechas, nombres, importes) dentro de documentos legales o administrativos en persa.
- Asistencia a la lectura de articulos academicos: el modelo senala el fragmento del texto que responde a una consulta del investigador, reduciendo el tiempo de revision manual.
- Enriquecimiento de pipelines de RAG (retrieval-augmented generation): como componente extractivo tras la recuperacion de documentos, para devolver la respuesta literal sin riesgo de alucinacion generativa.
- Anotacion semiautomatica de corpus de QA: uso del modelo para preetiquetar pares pregunta-respuesta en persa, que luego se revisan manualmente, acelerando la construccion de datasets.
- Evaluacion comparativa de modelos de QA en persa: como baseline reproducible con licencia MIT y pesos abiertos.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model card):

| Metrica | Valor |
|---|---|
| Exact match | 79,5 |
| F1 | 82,77676406926405 |
| Loss de validacion | 0,7286 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Loss de entrenamiento | Loss de validacion |
|---|---|---|---|
| 1,0 | 1287 | 1,0646 | 0,8199 |
| 2,0 | 2574 | 0,6762 | 0,7170 |
| 3,0 | 3861 | 0,5246 | 0,7286 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB para los pesos (277M parametros x 4 bytes), mas overhead de activaciones y tokenizador; en la practica, entre 2 y 3 GB.
- VRAM estimada en fp16: aproximadamente 0,55 GB para los pesos; en la practica, entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo es sobredimensionado para GPUs de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript, Hugging Face Inference Endpoints (tag `endpoints_compatible`), FastAPI con transformers para servir el pipeline `question-answering`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano y la tarea extractiva, se espera latencia de decenas de milisegundos por consulta en GPU y de cientos de milisegundos en CPU, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-60 | 277M | 512 tokens | QA extractiva en persa | MIT | Hugging Face |
| FacebookAI/xlm-roberta-base | 278M | 512 tokens | Modelo base multilingue (sin ajuste QA) | MIT | Hugging Face |
| DeepPavlov/rubert-base-cased-squad2 | 178M | 512 tokens | QA extractiva en ruso (referencia de la familia) | Apache 2.0 | Hugging Face |
| HooshvareLab/bert-fa-base-uncased | 162M | 512 tokens | Modelo base en persa (sin ajuste QA especifico) | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada. La comparativa se limita a parametros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- La model card no documenta el conjunto de entrenamiento ("unknown dataset"), lo que impide verificar la composicion de los datos y evaluar sesgos de dominio.
- El modelo solo realiza extraccion literal: no genera respuestas abstractivas ni responde cuando la respuesta no esta presente en el contexto.
- Contexto maximo de 512 tokens: documentos mas largos deben dividirse en fragmentos, con el riesgo de perder coherencia entre pasajes.
- Riesgo de alucinacion bajo en terminos generativos (no inventa texto), pero puede devolver spans incorrectos o vacios cuando la pregunta es ambigua o la respuesta no esta en el contexto.
- No se han publicado evaluaciones de sesgo, robustez ni comportamiento en dominios distintos al de validacion.
- El ajuste fino esta orientado al persa; el rendimiento en otros idiomas no esta validado y puede degradarse respecto al modelo base.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica como experimento de investigacion.
- El sobreajuste observado entre las epocas 2 y 3 (loss de validacion que sube de 0,7170 a 0,7286) sugiere que la epoca 2 podria haber sido un punto de parada mas adecuado.
- El repositorio ocupa 8,9 GB, lo que sugiere la presencia de multiples checkpoints ademas de los pesos finales; conviene verificar que se descarga el checkpoint correcto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-60
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: https://arxiv.org/abs/1911.02116
- Paper de XLM-RoBERTa (versión ACL): https://aclanthology.org/2020.acl-main.747/
- Repositorio de transformers: https://github.com/huggingface/transformers
- Dataset PersianQuAD (referencia, no confirmado como dataset de entrenamiento): no disponible en la informacion proporcionada.
