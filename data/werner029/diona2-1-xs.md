# Werner029/Diona2.1-XS

## Resumen

Diona 2.1 XS es un modelo de lenguaje desarrollado por VK R&D (etiquetado en Hugging Face bajo el usuario Werner029) orientado a escenarios conversacionales en ruso. Segun la model card, se basa en una arquitectura transformer con mezcla de expertos (MoE) derivada de Qwen 3.5, con un total de 3.600 millones de parametros y 300 millones de parametros activos por token. Declara una longitud de contexto de 262.000 tokens, lo que lo situa en la gama de contextos largos dentro de su categoria de tamano.

El modelo se presenta como un ajuste especializado en dialogos en ruso, entrenado sobre una mezcla de datasets abiertos y cerrados con un pipeline que combina preentrenamiento en tres etapas, SFT y un post-entrenamiento tambien en tres fases. El entrenamiento se realizo en configuracion distribuida sobre nodos con 8x8 A100 de 80 GB, y la inferencia y evaluacion se llevaron a cabo con vLLM.

La relevancia de este lanzamiento radica en su propuesta de un modelo MoE de activacion muy dispersa (300M activos sobre 3.6B totales) con contexto de 262k y foco en ruso, un perfil poco habitual en el ecosistema abierto. No obstante, la informacion publicada es muy limitada: no hay datos de benchmarks, licencia, idiomas declarados formalmente ni detalles sobre la composicion del dataset, lo que condiciona cualquier evaluacion rigurosa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), basada en Qwen 3.5 |
| Parametros totales | 3.600 millones (3.6B) |
| Parametros activos | 300 millones (300M) |
| Longitud de contexto | 262.000 tokens (262k) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ruso (escenarios conversacionales); lista formal no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura es un transformer con mezcla de expertos (MoE) construido sobre la base de Qwen 3.5, segun indica el autor. La relacion entre parametros totales y activos (3.6B frente a 300M) implica una activacion muy dispersa, con aproximadamente un 8,3 % de los parametros activados por token, lo que en teoria reduce el coste computacional de inferencia frente a un modelo denso del mismo tamano total. El contexto declarado de 262.000 tokens es el dato tecnico mas llamativo de la ficha.

El entrenamiento se describe en tres fases de preentrenamiento (PT), seguidas de SFT y un post-entrenamiento de tres etapas, aunque no se especifican el numero de tokens, la composicion exacta del dataset ni si se emplearon tecnicas como RLHF o DPO. La infraestructura consistio en nodos con 8x8 A100 de 80 GB y el stack de inferencia y evaluacion fue vLLM. No se detallan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal.

## Capacidades

- Generacion de texto y dialogo multi-turno, con enfasis declarado en escenarios conversacionales en ruso.
- Razonamiento y respuesta a instrucciones mediante SFT y post-entrenamiento en varias etapas.
- Procesamiento de contextos largos de hasta 262.000 tokens, adecuado para documentos extensos o historiales de conversacion prolongados.
- Capacidades multilingues: no se documenta una lista formal; el unico idioma mencionado explicitamente es el ruso.
- Tool calling / function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades de vision, audio o modo thinking: no disponibles en la informacion publicada.

## Casos de uso

- Atencion al cliente en ruso: el modelo puede gestionar conversaciones multi-turno con historiales largos gracias a su ventana de 262k tokens, manteniendo el contexto de interacciones previas sin truncar.
- Asistentes conversacionales especializados: su entrenamiento orientado a dialogo en ruso lo hace adecuado para bots de soporte interno, FAQ dinamicas o asistentes de producto en entornos de habla rusa.
- Analisis de documentos extensos en ruso: con 262k tokens de contexto puede resumir o extraer informacion de contratos, informes o expedientes de decenas de miles de palabras en una sola pasada.
- Procesamiento de transcripciones y actas: resumir reuniones o generar minutas a partir de transcripciones largas, aprovechando el contexto extendido y el perfil conversacional.
- Moderacion y clasificacion de conversaciones: analizar hilos completos de dialogo para detectar contenido inapropiado o clasificar intenciones, con el contexto completo disponible.
- Prototipado e investigacion en eficiencia MoE: su relacion 3.6B/300M lo convierte en un candidato para estudiar el comportamiento de modelos de activacion dispersa en tareas de dialogo, siempre que la licencia lo permita (actualmente no disponible).
- Generacion de respuestas en sistemas RAG: integrado en pipelines de recuperacion aumentada para responder consultas con fragmentos de documentos largos dentro de la ventana de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 3.6B parametros en FP16 requiere aproximadamente 7,2 GB solo para pesos; en cuantizacion de 8 bits rondaria 3,6 GB y en 4 bits unos 1,8 GB, a lo que habria que sumar la cache KV para contextos de hasta 262k tokens, que puede ser muy elevada.
- GPU recomendadas: el autor cita A100 de 80 GB para entrenamiento; para inferencia no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. Por tamano de pesos, un modelo de 3.6B cabria en GPU de consumo con 8-16 GB en cuantizacion, pero la ventana de 262k tokens puede exceder la memoria disponible en funcion de la implementacion.
- Opciones de despliegue: vLLM es el unico stack mencionado por el autor (usado para inferencia y evaluacion). No se confirma soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Diona 2.1 XS | 3.6B / 300M (MoE) | 262k | no disponible | Hugging Face (Werner029/Diona2.1-XS) |
| Qwen 3.5 (base declarada) | no disponible | no disponible | no disponible | no disponible |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones verificables de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo.
- Licencia no especificada: no se puede determinar si el uso comercial esta permitido; esto es un bloqueante para produccion.
- Idiomas no declarados formalmente: el foco es el ruso, y no hay garantias de rendimiento en castellano u otros idiomas.
- Dataset de entrenamiento opaco: mezcla de datos abiertos y cerrados sin detalle de composicion, lo que impide evaluar sesgos y calidad de datos.
- Riesgo de alucinacion: inherente a los modelos generativos y no cuantificado en este caso por falta de evaluaciones.
- Contexto de 262k tokens: aunque declarado, no se documenta la degradacion del rendimiento en ventanas largas ni el coste de memoria de la cache KV.
- Modelo con muy poca traccion en la comunidad (0 descargas, 0 likes en el momento de la consulta): sin validacion externa ni reportes de uso.
- Fecha de creacion posterior a la fecha actual de referencia de muchos entornos: conviene verificar la integridad y procedencia del repositorio antes de su uso.

## Enlaces

- Hugging Face: https://huggingface.co/Werner029/Diona2.1-XS
- Model card del autor: incluida en la pagina de Hugging Face del modelo
- Paper, blog o repositorio adicional: no disponible en la informacion proporcionada
