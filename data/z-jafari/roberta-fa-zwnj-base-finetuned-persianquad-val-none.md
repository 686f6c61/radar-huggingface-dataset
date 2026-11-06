# Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None

## Resumen

`roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None` es un modelo de respuesta a preguntas extractiva (question answering) para persa, desarrollado por el usuario Z-Jafari. Se trata de un ajuste fino (fine-tuning) del checkpoint `HooshvareLab/roberta-fa-zwnj-base`, una variante de RoBERTa adaptada al persa que incorpora el tratamiento del caracter ZWNJ (Zero Width Non-Joiner), un elemento ortografico critico en la escritura persa. El modelo resultante tiene 117.709.058 parametros y se distribuye en formato safetensors bajo licencia Apache 2.0.

El modelo resuelve la tarea de localizar la respuesta a una pregunta dentro de un contexto textual en persa, devolviendo el fragmento (span) correspondiente. Su nombre hace referencia a PersianQuAD, el corpus de QA extractiva en persa, aunque la model card no documenta explicitamente el conjunto de datos de entrenamiento ni de evaluacion empleado. El unico resultado declarado es una perdida de validacion de 1.3195 tras tres epocas.

La relevancia de este modelo es limitada y acotada: es un ajuste fino de tipo "generated_from_trainer" con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados en el model-index y con una model card autogenerada que no ha sido completada por el autor. Resulta util como referencia de un pipeline de fine-tuning sobre RoBERTa persa, pero no como modelo de produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder-only), base `HooshvareLab/roberta-fa-zwnj-base` |
| Parametros totales | 117.709.058 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | persa (farsi), segun el modelo base y el nombre del checkpoint; no declarado formalmente en la model card |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-only de tipo RoBERTa, heredada del checkpoint base `HooshvareLab/roberta-fa-zwnj-base`. Este modelo base esta especificamente adaptado al persa e incorpora el tratamiento del caracter ZWNJ, que afecta a la tokenizacion y a la representacion de palabras compuestas en persa. Sobre esta base se anade una cabeza de question answering (clasificacion de inicio y fin de span) para la tarea extractiva.

El entrenamiento se realizo con el `Trainer` de Hugging Face y los siguientes hiperparametros: learning rate de 2e-05, batch size de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW (variante `ADAMW_TORCH_FUSED`) con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 3 epocas y precision mixta nativa (AMP). La evolucion de la perdida fue: epoca 1 con perdida de entrenamiento 1.6545 y validacion 1.3065 (paso 1246); epoca 2 con 1.0327 y 1.2523 (paso 2492); epoca 3 con 0.6985 y 1.3195 (paso 3738). Se observa sobreajuste a partir de la segunda epoca, ya que la perdida de validacion empeora en la tercera. Las versiones de framework declaradas son Transformers 5.22.0, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3.

No se documenta la composicion del dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo encoder-only de QA). Tampoco se describen innovaciones tecnicas adicionales mas alla del uso del checkpoint base con tratamiento de ZWNJ.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta en persa, devuelve el span de texto que contiene la respuesta.
- Comprension lectora en persa: identificacion de fragmentos relevantes dentro de parrafos.
- Tratamiento del caracter ZWNJ heredado del modelo base, relevante para la ortografia persa.
- No soporta generacion de texto libre (es encoder-only).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; el modelo esta orientado al persa.

## Casos de uso

- Extraccion de respuestas en bases documentales persas: indexar documentos en persa y usar el modelo para localizar el fragmento exacto que responde a una consulta del usuario, devolviendo el span en lugar de texto generado.
- Sistemas de preguntas frecuentes (FAQ) sobre corpus cerrados: emparejar preguntas de usuarios con fragmentos de manuales o politicas internas en persa, con la ventaja de que la respuesta es extractiva y trazable al texto fuente.
- Asistencia a la lectura de documentacion tecnica en persa: resaltar automaticamente el pasaje relevante dentro de un manual extenso a partir de una pregunta concreta.
- Preprocesamiento para pipelines RAG en persa: usar el modelo como componente de reranking o de extraccion de evidencia antes de pasar el contexto a un modelo generativo.
- Analisis de contratos o textos legales en persa: localizacion de clausulas o datos concretos (fechas, importes, partes) dentro de documentos, con salida acotada al span.
- Investigacion en PLN persa: punto de partida reproducible para experimentos de fine-tuning sobre PersianQuAD y para comparar variantes de RoBERTa persa con tratamiento de ZWNJ.
- Evaluacion de calidad de corpus de QA: uso del modelo como baseline para medir la dificultad de conjuntos de validacion en persa.

## Benchmarks y rendimiento

El model-index del autor no contiene resultados (`results: []`). La unica metrica declarada en la model card es la perdida de validacion.

| Metrica | Valor |
|---|---|
| Perdida de validacion (epoca 1) | 1.3065 |
| Perdida de validacion (epoca 2) | 1.2523 |
| Perdida de validacion (epoca 3) | 1.3195 |
| Perdida de entrenamiento (epoca 3) | 0.6985 |

No se han publicado resultados de benchmarks (EM, F1, MMLU, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,5 GB para los pesos (117,7 M de parametros), mas memoria para activaciones y overhead del runtime; en la practica, menos de 2 GB en la mayoria de configuraciones.
- VRAM estimada en fp16/bf16: en torno a 0,25 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el modelo con holgura. Tambien funciona en CPU para cargas de baja concurrencia.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `question-answering`), TorchScript/ONNX para exportacion, y servidores de inferencia compatibles con transformers. No se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; llama.cpp y Ollama no son adecuados para un encoder-only de QA sin conversion adicional.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera baja latencia en GPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None | 117,7 M | no disponible | QA extractiva en persa | Apache 2.0 | Hugging Face, 0 descargas |
| HooshvareLab/roberta-fa-zwnj-base | no disponible en la informacion | no disponible | Modelo base (encoder) en persa | no disponible en la informacion | Hugging Face (modelo base) |
| Modelos QA persas de la familia ParsBERT | no disponible en la informacion | no disponible | QA extractiva en persa | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Model card autogenerada y sin completar: el autor no ha documentado el dataset de entrenamiento, el dataset de evaluacion ni las metricas de calidad (EM/F1), por lo que el rendimiento real es desconocido.
- Sobreajuste probable: la perdida de validacion empeora en la tercera epoca (1.3195 frente a 1.2523 en la segunda), lo que sugiere que el checkpoint final no es el optimo.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validacion por parte de la comunidad.
- Riesgo de alucinacion estructural bajo en QA extractiva (la respuesta se selecciona del contexto), pero riesgo de spans incorrectos o mal alineados si el contexto o la tokenizacion no encajan.
- Limitado al persa: no se declaran capacidades multilingues; su uso en otros idiomas no esta respaldado.
- Longitud de contexto no documentada: no se puede garantizar el comportamiento con contextos largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar la licencia del modelo base `HooshvareLab/roberta-fa-zwnj-base` y de los datos de entrenamiento, no documentados aqui.
- Sesgos: no documentados; al derivar de un corpus persa no especificado, pueden heredarse sesgos linguisticos y culturales del corpus base.
- No apto para generacion de texto, agentes ni tool calling: es un modelo encoder-only de QA extractiva.
- Para produccion, se recomienda reentrenar o al menos reevaluar sobre un conjunto de validacion propio antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/roberta-fa-zwnj-base-finetuned-PersianQuAD-val-None
- Modelo base: https://huggingface.co/HooshvareLab/roberta-fa-zwnj-base
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este checkpoint.
