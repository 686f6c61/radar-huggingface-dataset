# Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-200

## Resumen

xlm-roberta-base-finetuned-PersianQuAD-val-200 es un ajuste fino (fine-tuning) de FacebookAI/xlm-roberta-base para la tarea de respuesta a preguntas extractiva (question answering) sobre textos en persa. Lo desarrolla el usuario Z-Jafari y se publica bajo licencia MIT en Hugging Face. El modelo resuelve el problema de localizar el fragmento de respuesta dentro de un contexto dado a partir de una pregunta, es decir, la tarea clásica de QA extractivo estilo SQuAD, aplicada al conjunto de datos PersianQuAD.

Arquitectura y tamano: se trata de un transformer encoder-only de tipo XLM-RoBERTa en su variante base, con 277.454.594 parametros totales. Al ser un modelo encoder-only orientado a QA extractivo, no dispone de parametros activos ni de arquitectura MoE, y su ventana de contexto efectiva viene determinada por la posicion de los embeddings de XLM-RoBERTa base (512 tokens), aunque este dato no se declara explicitamente en la model card.

Su relevancia es acotada pero concreta: ofrece un punto de partida ya entrenado para QA en persa, un idioma con relativamente pocos recursos en el ecosistema de modelos abiertos, con metricas declaradas de 78,8 exact match y 82,49 F1 sobre el conjunto de evaluacion. El nombre del repositorio sugiere una evaluacion sobre 200 ejemplos de validacion de PersianQuAD, aunque el autor no documenta la composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (XLM-RoBERTa base) |
| Parametros totales | 277.454.594 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (XLM-RoBERTa base admite hasta 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado sobre PersianQuAD; se asume persa como idioma objetivo) |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa base, un transformer encoder-only multilingue preentrenado con enmascaramiento de tokens sobre corpus multilingues. Sobre esa base se anade una cabeza de QA extractivo que predice las posiciones de inicio y fin de la respuesta dentro del contexto. El ajuste fino se realizo con el Trainer de Hugging Face sobre un dataset que la model card describe como "unknown dataset", aunque el nombre del repositorio apunta a PersianQuAD.

Hiperparametros declarados: learning rate 2e-05, batch de entrenamiento y evaluacion de 16, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal, 3 epocas y precision mixta nativa (AMP). El entrenamiento consta de 3948 pasos (1316 por epoca). La perdida de validacion evoluciono de 0,9063 (epoca 1) a 0,8457 (epoca 2) y 0,8451 (epoca 3), con una perdida de entrenamiento final de 0,5781. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa; son irrelevantes para un encoder de QA extractivo.

## Capacidades

- Respuesta a preguntas extractiva: dado un contexto y una pregunta, devuelve el span de texto que responde a la pregunta.
- Procesamiento de texto en persa: el ajuste se realizo sobre PersianQuAD, por lo que el modelo esta orientado a ese idioma.
- Capacidad multilingue heredada: al derivar de XLM-RoBERTa base, conserva representaciones multilingues, aunque el ajuste fino puede haber degradado el rendimiento fuera del dominio persa.
- No soporta tool calling ni function calling: es un modelo encoder-only de QA, no un modelo generativo con soporte de herramientas.
- No soporta agentes ni razonamiento multi-paso: no es un modelo de instrucciones ni de chat.
- No dispone de modo thinking, vision ni audio.
- Salida limitada a posiciones de inicio y fin sobre el contexto proporcionado; no genera texto libre.

## Casos de uso

- Busqueda de respuestas en documentacion interna en persa: indexar manuales o bases de conocimiento y usar el modelo para extraer el fragmento exacto que responde a una consulta del usuario, con la ventaja de que la respuesta siempre procede del contexto y no se inventa.
- Atencion al cliente sobre FAQ en persa: emparejar cada consulta con la entrada de FAQ correspondiente y devolver el fragmento relevante, reduciendo el riesgo de alucinacion frente a un modelo generativo.
- Extraccion de campos en formularios y contratos: localizar valores concretos (fechas, importes, nombres) dentro de documentos persas estructurados o semiestructurados.
- Asistente de lectura para investigadores: permitir consultas sobre articulos o informes en persa y devolver el pasaje exacto que sustenta la respuesta, facilitando la verificacion manual.
- Preprocesado en pipelines de RAG: usar el modelo como componente de respuesta extractiva sobre los fragmentos recuperados por un retriever, antes de pasarlos a un generador o directamente al usuario.
- Anotacion asistida de datasets de QA: generar candidatos de span sobre nuevos contextos para acelerar el etiquetado humano en proyectos de datos en persa.
- Filtrado y validacion de respuestas: comprobar si un contexto contiene evidencia suficiente para una pregunta dada, usando las puntuaciones de inicio y fin como senal de confianza.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluacion (model-index sin entradas adicionales; los datos provienen de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,8451 |
| Exact match | 78,8 |
| F1 | 82,49 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no procede compararlos con modelos generativos porque la tarea es distinta.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,1 GB solo para pesos (277,4 M de parametros), mas activaciones y overhead del runtime; en la practica, entre 2 y 3 GB con batch pequeno.
- En fp16/bf16: alrededor de 0,55 GB de pesos; el modelo cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema. Para alto throughput, A100/H100 con batch grande.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas de los ultimos anos, e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (pipeline de question-answering), Text Generation Inference no aplica (no es generativo); vLLM no es la opcion natural para encoder-only; se puede servir con FastAPI + transformers, con ONNX Runtime o con TorchScript para reducir latencia. llama.cpp y Ollama no estan orientados a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Al tratarse de un encoder base con contexto de hasta 512 tokens, la latencia por peticion en GPU moderna es del orden de milisegundos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-200 | 277,4 M | no disponible (hasta 512 en la base) | QA extractivo en persa | MIT | Hugging Face |
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD | 277,4 M | no disponible (hasta 512 en la base) | QA extractivo en persa | no disponible | Hugging Face; EM 81,0 / F1 84,23 declarados |
| Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None | 277,4 M | no disponible (hasta 512 en la base) | QA extractivo en persa | no disponible | Hugging Face |
| FacebookAI/xlm-roberta-base | 278 M | 512 | Modelo base multilingue (sin cabeza de QA) | MIT | Hugging Face |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de informacion sobre otros modelos de QA en persa en la busqueda realizada. El modelo con nombre "PersianQuAD" sin sufijo declara metricas ligeramente superiores (81,0 EM / 84,23 F1) sobre lo que parece el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Model card incompleta: el autor no documenta el dataset de entrenamiento ("unknown dataset"), la composicion de PersianQuAD usado, ni los usos previstos y limitaciones.
- Riesgo de sobreajuste al conjunto de evaluacion: el nombre "val-200" sugiere evaluacion sobre 200 ejemplos, una muestra pequena; las metricas pueden no ser representativas.
- Ambito restringido: solo responde extrayendo spans del contexto; no genera respuestas, no razona y no admite conversacion multi-turno.
- Idioma: aunque hereda capacidades multilingues de XLM-RoBERTa, el ajuste fino esta orientado a persa y el rendimiento en otros idiomas no esta documentado.
- Sesgos: no se documentan analisis de sesgo; al derivar de un corpus web multilingue, puede reproducir sesgos presentes en los datos de preentrenamiento.
- Alucinacion: al ser extractivo, no inventa texto, pero puede seleccionar un span incorrecto o irrelevante si el contexto no contiene la respuesta; no hay mecanismo de absteccion documentado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar el cumplimiento de las licencias de los datos de entrenamiento, que no se detallan.
- Sin mantenimiento aparente: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de soporte o actualizaciones.
- Formato de pesos safetensors: compatible con transformers, pero el repo ocupa 10 GB, lo que sugiere artefactos adicionales (checkpoints intermedios u optimizer states) que conviene revisar antes de desplegar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-200
- Variante sin sufijo (metricas superiores declaradas): https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD
- Variante val-None: https://huggingface.co/Z-Jafari/xlm-roberta-base-finetuned-PersianQuAD-val-None
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper de XLM-RoBERTa: no disponible en la informacion proporcionada
- Repositorio de codigo, demo o blog del autor: no disponible en la informacion proporcionada
