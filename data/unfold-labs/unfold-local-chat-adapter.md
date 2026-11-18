# unfold-labs/unfold-local-chat-adapter

## Resumen

Unfold Local Chat Adapter es un adaptador LoRA en formato GGUF desarrollado por unfold-labs para el modelo base Qwen3.5-0.8B. No es un modelo completo, sino un ajuste fino especializado que se aplica sobre el modelo base dentro de la aplicación de escritorio Unfold Note. Su funcion resuelve un paso concreto de un asistente local: redactar la respuesta a partir de los extractos de notas que devuelve el motor de busqueda, citando cada afirmacion con la etiqueta del extracto correspondiente.

El adaptador tiene 6.389.760 parametros entrenables y se distribuye exclusivamente como LoRA en GGUF (precision f16), pensado para ejecutarse en CPU mediante llama.cpp y node-llama-cpp. El modelo base, Qwen3.5-0.8B, no se incluye en el repositorio; la aplicacion lo aplica sobre su propia compilacion del base, fijada por hash sha256. La licencia es CC BY-SA 4.0, heredada de los conjuntos de datos de entrenamiento.

Su relevancia es acotada pero clara: demuestra como un adaptador de muy bajo coste (un modelo de 0,8B en cuantizacion Q4_K_M sobre CPU) puede pasar de generar respuestas fuera de formato en el 91% de los casos a hacerlo correctamente en el 95%, con citas verificables y una tasa de abstención razonable cuando no hay evidencia. Es una pieza de infraestructura para una app concreta, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 32) sobre proyecciones de atencion y MLP de Qwen3.5-0.8B |
| Parametros totales | 6.389.760 (adaptador); el modelo base Qwen3.5-0.8B no se incluye |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base y de la configuracion de la app) |
| Tipos de cuantizacion | adaptador en f16 (GGUF); el base se ejecuta en Q4_K_M en la app |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | GGUF (LoRA), convertido con llama.cpp v0.7.0 `convert_lora_to_gguf.py` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rank 16 con alpha 32 aplicado sobre las proyecciones de atencion y MLP del transformer Qwen3.5-0.8B. Se entrena con aproximadamente 2.600 ejemplos y la funcion de perdida se calcula unicamente sobre la respuesta, no sobre el prompt. Cada ejemplo reproduce exactamente el prompt que envia la aplicacion: una pregunta seguida de extractos agrupados por nota con etiquetas. El conjunto no contiene datos de usuarios reales.

Los datos proceden de seis fuentes: un vault ficticio de 30 clientes y 107 reuniones generado por Qwen3-14B-AWQ; la parte HotpotQA de Luciole_RAG (con la mitad de filas traducidas al frances); los transcriptos de SUMM-RE; QMSum en los dominios Product y Academic (con texto de los corpus AMI e ICSI); el resto del corpus AMI; y PIAF v1.2. Las respuestas de referencia se reescribieron al formato de la app con Qwen3-14B-AWQ y se filtraron por reglas estrictas: se rechazan etiquetas desconocidas, puntos sin cita, mas de 5 puntos, puntos repetidos, cliente distinto al de la pregunta o idioma incorrecto. En las filas de reuniones, una segunda pasada del mismo modelo elimina todo punto que su extracto citado no sostenga. Se anadieron 60 pares gemelos (pregunta sin evidencia y la misma pregunta con extractos) para ensenar al modelo a declarar que no se encontro nada.

## Capacidades

- Redaccion de respuestas extractivas a partir de fragmentos de notas, con un maximo de 5 puntos breves.
- Citacion obligatoria de cada punto con la etiqueta del extracto (`[N1]`).
- Abtencion explicita cuando ningun extracto responde a la pregunta.
- Formato de salida fijo y validable, disenado para ser parseado por la aplicacion.
- Bilinguismo frances-ingles en la generacion de respuestas.
- No soporta tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido: es un adaptador de tarea unica.

## Casos de uso

- Asistente de notas local en escritorio: el adaptador redacta la respuesta final del asistente de Unfold Note a partir de los extractos recuperados por el buscador, ejecutandose en CPU en el ordenador del usuario sin enviar datos a la nube.
- Busqueda aumentada sobre vaults personales: convierte resultados de recuperacion en respuestas concisas y citadas, lo que permite al usuario verificar cada afirmacion contra la nota original.
- Resumen de reuniones con trazabilidad: entrenado con QMSum, AMI e ICSI, responde preguntas sobre transcriptos de reuniones citando el pasaje exacto que sostiene cada punto.
- Atencion al cliente sobre base documental ficticia o real: el vault de 30 clientes y 107 reuniones del entrenamiento refleja este escenario, con respuestas limitadas a cinco puntos y sin inventar clientes distintos al preguntado.
- Procesamiento de documentacion en frances: el uso de PIAF y las traducciones de Luciole y QMSum lo hacen adecuado para preguntas sobre pasajes de Wikipedia en frances y corpus administrativos.
- Despliegue embebido de bajo coste: al ser un LoRA de 6,4M de parametros sobre un base de 0,8B en Q4_K_M, encaja en aplicaciones de escritorio con requisitos minimos de memoria y sin GPU.
- Filtro de abstención en pipelines RAG: la capacidad de declarar que no hay evidencia (75% de acierto en el conjunto de evaluacion) sirve para marcar consultas sin respuesta antes de mostrarlas al usuario.

## Benchmarks y rendimiento

Evaluacion sobre 237 filas no vistas en entrenamiento (4 clientes ficticios, preguntas de Luciole y PIAF, y 10 sesiones de reunion de QMSum y AMI), con el base cuantizado en Q4_K_M, en CPU y 4 hilos.

| Medida (237 filas) | Modelo base | Con el adaptador |
|---|---|---|
| Respuestas en el formato de la app, todos los puntos citados | 9% | 95% |
| Declara que no se encontro nada cuando ningun extracto responde | 7% | 75% |
| Declara que no se encontro nada aunque un extracto responde | 2% | 8% |
| Recall de etiquetas de referencia citadas | 0,26 | 0,76 |
| Precision de etiquetas citadas presentes en la referencia | 0,72 | 0,88 |
| Longitud mediana de respuesta (caracteres) | 446 | 168 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- El adaptador pesa practicamente nada en disco (repositorio de 0,0 GB); el coste real lo determina el modelo base Qwen3.5-0.8B.
- Inferencia en CPU: la evaluacion se realizo con el base en Q4_K_M y 4 hilos, sin GPU.
- VRAM estimada para GPU: no disponible; un base de 0,8B en Q4_K_M ocupa del orden de 0,5-0,7 GB, por lo que cabria en cualquier GPU consumer, pero no se han publicado mediciones.
- GPU recomendadas: no disponible (el diseno apunta a ejecucion en CPU).
- Despliegue: llama.cpp y node-llama-cpp mediante `model.createContext({ lora: { adapters: [{ filePath: 'answer-lora.gguf' }] } })`. No se documenta soporte para vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada adaptadores comparables de la misma categoria (LoRA de respuesta citada sobre un base sub-1B para ejecucion en CPU).

## Limitaciones y advertencias

- Modelo de tarea unica: solo genera respuestas en el formato de Unfold Note; no sirve como modelo conversacional general ni para codigo o matematicas.
- Dependencia estricta del prompt: espera exactamente la estructura de pregunta mas extractos etiquetados que envia la aplicacion; otros formatos degradaran la salida.
- Dependencia de la version del base: la app fija el GGUF del base por hash sha256; usar otra compilacion puede invalidar el adaptador.
- Tasa de falsos negativos del 8%: en el conjunto de evaluacion declara que no hay respuesta aunque un extracto la contenga.
- Tasa de falsos positivos del 25%: cuando ningun extracto responde, solo acierta a abstenerse en el 75% de los casos.
- Idiomas limitados a frances e ingles; no se ha evaluado en castellano ni en otros idiomas.
- Sesgos: no documentados por el autor; los datos incluyen corpus de reuniones y Wikipedia, con los sesgos propios de esas fuentes.
- Riesgo de alucinacion mitigado pero no eliminado: la precision de citas es 0,88, por lo que una parte de las etiquetas citadas no aparece en la referencia.
- Licencia CC BY-SA 4.0: obliga a atribucion y a compartir bajo la misma licencia las obras derivadas, lo que condiciona su uso comercial en productos propietarios.
- El modelo base Qwen3.5-0.8B es Apache-2.0 y no forma parte del repositorio; sus terminos se aplican por separado.

## Enlaces

- Hugging Face: https://huggingface.co/unfold-labs/unfold-local-chat-adapter
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Compilacion del base usada por la app: https://huggingface.co/unfold-labs/unfold-search-planner
- Aplicacion Unfold Note: https://unfoldnote.app
- Dataset Luciole_RAG: https://huggingface.co/datasets/OpenLLM-France/Luciole_RAG
- Dataset SUMM-RE: https://huggingface.co/datasets/linagora/SUMM-RE
- Dataset PIAF: https://huggingface.co/datasets/etalab-ia/piaf
- QMSum (Yale-LILY): https://github.com/Yale-LILY/QMSum
- AMI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/corpus/
- ICSI Meeting Corpus: https://groups.inf.ed.ac.uk/ami/icsi/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
