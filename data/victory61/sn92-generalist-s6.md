# Victory61/sn92-generalist-s6

## Resumen

sn92-generalist-s6 es un ajuste fino mediante LoRA de baselabs/mammoth-1, empaquetado como decider de lectura conjunta (joint-readout) para la pista de decisiones generalistas de REAX (subred 92 de Bittensor). No es un modelo generativo de texto al uso: es un modelo de decision que, dada una pregunta con opciones de respuesta codificadas, emite una decision seleccionando una de las filas de su readout. El autor es Victory61 y el repositorio contiene unicamente pesos y ficheros de configuracion, sin codigo ni datos de entrenamiento.

La arquitectura subyacente es Qwen3_5Model, con un backbone de 26.085.330.160 parametros (aproximadamente 26.000 millones) en bf16, lo que explica el tamano del repositorio de 52,2 GB. La linea de linaje declarada es baselabs/mammoth-1, que a su vez deriva de Qwen/Qwen3.5-27B (Apache-2.0). mammoth-1 fue entrenado con capas de atencion completa bidireccional, y este paquete lo expone a traves del runtime JointRunner de REAX con la mascara de atencion completa para la que fue entrenado.

Su relevancia es acotada pero especifica: sirve como pieza de inferencia para tareas de clasificacion y decision estructurada dentro del ecosistema REAX, con licencia MIT y un proceso de entrenamiento documentado (LoRA de rango 64 sobre proyecciones de atencion y MLP, con ancla KL al modelo de partida). No esta pensado para generacion libre de texto ni para uso conversacional general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (backbone transformer con atencion completa bidireccional) + readout de lectura conjunta |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (backbone en bf16) + readout.safetensors + decision_config.json + joint_config.json |

## Arquitectura y entrenamiento

El modelo parte de baselabs/mammoth-1, un modelo de decision entrenado con capas de atencion completa bidireccional. La conversion mapea uno a uno los pesos del modelo de lenguaje de mammoth-1 sobre el layout de Qwen3_5Model (mismos tensores, mismos valores); la cabeza del modelo de lenguaje no se incluye, y sus filas correspondientes a los tokens de codigo de respuesta se convierten en readout.safetensors, con una fila por codigo de respuesta. El formato de decision es decision_config.json formato 2, con atencion completa no causal y pooling en la ultima posicion; joint_config.json define el readout conjunto de preguntas inline en version 1.

El ajuste fino consiste en una unica pasada LoRA de rango 64 y alpha 128 aplicada a las proyecciones de atencion y MLP de todas las capas, con tasa de aprendizaje 3e-5, warm-up y decaimiento, sobre aproximadamente 4,9 millones de tokens y con el readout congelado. La funcion de perdida combina entropia cruzada sobre la respuesta dorada con un ancla KL (peso 0,1) respecto al modelo de partida convertido. En la publicacion, el delta de LoRA se fusiona en el backbone con un peso de 0,75 y se almacena en bf16.

Los datos de entrenamiento se reparten en tres bloques: aproximadamente un 40 % de items calculados por generadores procedurales propios (logica multietapa, problemas aritmeticos, salida de codigo, decisiones de reglas, decisiones de tool-call y API, yes/no causal, acordes a partir de notas), con respuestas doradas calculadas por codigo; un 35 % de items de decision construidos a partir de registros publicos (GitHub Security Advisories, informes de enforcement de la FDA via openFDA, documentos del Federal Register y trabajos de OpenAlex); y un 25 % de replay de datos publicos de decision, incluyendo los datasets decisionmodels/sn92-generalist-train-v1 y decisionmodels/sn92-specialists, ademas de items derivados de glaive-function-calling, hermes-function-calling, HotpotQA, FEVER, LexGLUE, AQuA-RAT, AI2 ARC, CommonsenseQA, MedMCQA, BoolQ, SIB-200, KLUE, NSMC, Allociné, Twitter Financial News Sentiment y Amazon ESCI.

## Capacidades

- Decision sobre opciones codificadas: emite una respuesta seleccionando una fila del readout, no texto libre.
- Razonamiento multietapa y logica: entrenado con items de logica de varios pasos generados proceduralmente.
- Aritmetica y problemas verbales: incluidos en el bloque de generadores propios.
- Decisiones sobre salida de codigo: clasificacion de resultados de ejecucion y comportamiento de fragmentos.
- Decisiones de tool-call y API: seleccion de llamadas y parametros en escenarios estructurados.
- Decisiones de seguridad: ecosistema, severidad y CWE a partir de avisos GHSA.
- Decisiones regulatorias y administrativas: clasificacion, estado y causa raiz en informes FDA; tipo de documento y agencia en el Federal Register.
- Decisiones de dominio cientifico: clasificacion de trabajos de OpenAlex.
- Clasificacion multilingue y de dominio: cubierta parcialmente via SIB-200, KLUE, NSMC, Allociné y otros datasets de replay.
- No soporta generacion de texto libre, vision, audio ni modo thinking: el paquete no incluye la cabeza del modelo de lenguaje.

## Casos de uso

- Clasificacion de avisos de seguridad: dado un aviso GHSA, el modelo decide ecosistema, severidad y CWE. Es adecuado porque ese tipo de decision forma parte directa del entrenamiento (35 % del dataset construido a partir de GHSA).
- Triaje de informes regulatorios: clasificacion, estado y causa raiz de informes de enforcement de la FDA. El modelo ha visto decisiones de este dominio en el bloque de datos publicos.
- Enrutado de documentos administrativos: determinar tipo de documento y agencia emisora en textos del Federal Register, una tarea de decision cerrada que encaja con el formato de readout.
- Clasificacion de dominio cientifico: asignar area de investigacion a trabajos de OpenAlex para pipelines de catalogacion o filtrado.
- Decisiones de tool-calling en agentes: seleccionar la llamada y los parametros correctos en un conjunto finito de opciones, util como componente de enrutado dentro de un agente mayor.
- Verificacion de razonamiento aritmetico y logico: usar el modelo como arbitro de respuestas candidatas en problemas de varios pasos, comparando la decision con la solucion calculada por codigo.
- Clasificacion de sentimiento y topicos multilingue: aprovechar el replay de datasets como NSMC, Allociné o Twitter Financial News Sentiment para tareas de etiquetado cerrado.
- Evaluacion comparativa en REAX: servir como decider de referencia en la pista generalista de la subred 92 de Bittensor para medir el rendimiento de otros deciders.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 52 GB, por lo que se necesita al menos una GPU de 80 GB (A100 80GB, H100 80GB) para cargar el modelo sin cuantizar.
- Cuantizacion: no se documentan tipos de cuantizacion soportados; el paquete se publica en bf16 y el runtime esperado es JointRunner, no llama.cpp ni Ollama.
- GPU consumer: no cabe en GPUs consumer de 24 GB (RTX 4090) en bf16; se requeriria cuantizacion no documentada o sharding en varias GPU.
- Opciones de despliegue: runtime JointRunner de REAX con decision_config.json formato 2 y joint_config.json version 1; no se mencionan vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Victory61/sn92-generalist-s6 | 26.085.330.160 | no disponible | Decider de lectura conjunta (fine-tune LoRA) | MIT | HuggingFace, 27 descargas |
| baselabs/mammoth-1 | no disponible | no disponible | Modelo de decision con atencion bidireccional | MIT | HuggingFace (modelo base) |
| Qwen/Qwen3.5-27B | ~27B (declarado en el linaje) | no disponible | Modelo generativo de texto | Apache-2.0 | HuggingFace (linaje del base) |

La comparacion directa con alternativas de la misma categoria (deciders de la pista generalista de REAX) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no incluye la cabeza del modelo de lenguaje, por lo que no puede producir texto libre ni mantener conversaciones.
- Formato de salida restringido: solo emite una de las filas del readout, correspondiente a un codigo de respuesta predefinido; no admite respuestas abiertas.
- Runtime especifico: requiere el runtime JointRunner de REAX y la mascara de atencion completa; no es compatible con pipelines estandar de transformers sin adaptacion.
- Sin auto_map: config.json no incluye auto_map, lo que complica la carga automatica con AutoModel.
- Idiomas no declarados: la model card no especifica la lista de idiomas soportados; el multilingue solo esta cubierto de forma indirecta por el replay de datasets.
- Contexto no documentado: se desconoce la longitud maxima de contexto, lo que impide planificar el troceado de entradas largas.
- Riesgo de alucinacion: aunque el formato de decision cerrada reduce la generacion libre, las decisiones pueden ser incorrectas en dominios poco representados en el entrenamiento.
- Sesgos de los datos: el modelo hereda los sesgos de los registros publicos utilizados (GHSA, FDA, Federal Register, OpenAlex) y de los datasets de replay, con posibles desequilibrios por dominio e idioma.
- Licencia: MIT, igual que el modelo base declarado; el aviso NOTICE debe conservarse. El autor declara no estar afiliado a baselabs, al equipo de Qwen ni a los propietarios de la subred REAX.
- Sin garantias de produccion: el repositorio no incluye codigo, datos de entrenamiento ni resultados de evaluacion publicados, y cuenta con 27 descargas y 0 likes, lo que limita la validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Victory61/sn92-generalist-s6
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Linaje declarado del base: https://huggingface.co/Qwen/Qwen3.5-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/decisionmodels/sn92-generalist-train-v1
- Dataset de especialistas: https://huggingface.co/datasets/decisionmodels/sn92-specialists
