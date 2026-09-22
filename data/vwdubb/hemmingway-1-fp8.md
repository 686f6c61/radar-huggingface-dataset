# vwdubb/Hemmingway-1-FP8

## Resumen

Hemmingway-1-FP8 es una version cuantizada en FP8 del modelo Altworld/Hemmingway-1, publicada por el usuario vwdubb en HuggingFace. Se trata de un modelo de generacion de texto orientado a escritura cotidiana (mensajes, correos, notas de trabajo y comunicaciones personales), construido sobre Qwen3.8-27B y afinado por Altworld con el objetivo declarado de producir textos que suenen humanos y que no vengan envueltos en preambulos, opciones multiples ni comentarios meta. El repositorio contiene pesos en formato safetensors con cuantizacion FP8 gestionada mediante compressed-tensors, con 27.320.697.856 parametros totales y un tamano de repositorio de 37,6 GB.

La relevancia de esta ficha concreta, frente al modelo original, es de despliegue: la version FP8 reduce el peso de los parametros a aproximadamente un byte por parametro, lo que baja el requisito de memoria frente a los pesos en BF16 y facilita el servicio en GPU con vLLM, que es precisamente el metodo de ejecucion que documenta el autor. La model card declara una ventana de contexto de 262.144 tokens y licencia Apache-2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo esta especializado en registro conversacional y creativo en ingles. El propio autor reconoce que es "English-first" y que pierde frente a modelos de historia en narrativa hostil y en turnos largos de ficcion, por lo que su perfil de uso es la comunicacion escrita del dia a dia y no el razonamiento tecnico o cientifico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada de Qwen3.8-27B (no se detalla en la model card) |
| Parametros totales | 27.320.697.856 (27,32 mil millones) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 (compressed-tensors); no se documentan otros formatos en este repositorio |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion FP8 via compressed-tensors) |
| Modelo base | Altworld/Hemmingway-1 |
| Pipeline | text-generation |
| Libreria | transformers |
| Tamano del repositorio | 37,6 GB |
| Compatibilidad de endpoints | Si (etiqueta endpoints_compatible) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna mas alla de que el modelo deriva de Qwen3.8-27B y de que la version aqui documentada aplica una cuantizacion FP8 mediante la libreria compressed-tensors, un formato orientado a servir modelos cuantizados en motores de inferencia como vLLM. No se especifica si el modelo base es denso o MoE, ni el numero de capas, cabezas de atencion o tipo de atencion empleado. Tampoco se detalla el proceso de entrenamiento: no hay datos sobre numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineamiento.

El autor si describe el objetivo del afinado: un modelo que entregue directamente el texto solicitado, sin alternativas ni explicaciones, y que puntue alto en naturalidad percibida. Para respaldarlo publica varios benchmarks propios (CommunicationBench, Human-Likeness y StoryBench) junto a un benchmark externo (EQ-Bench 4). La innovacion tecnica destacable de este repositorio concreto es la propia cuantizacion FP8, que reduce el coste de memoria en inferencia manteniendo el pipeline de transformers y la compatibilidad con vLLM. No se documenta la perdida de calidad introducida por la cuantizacion respecto a los pesos originales.

## Capacidades

- Generacion de texto orientada a escritura cotidiana: mensajes, correos, notas de disculpa, comunicaciones con propietarios, administraciones y companeros de trabajo.
- Escritura persuasiva y "conversaciones dificiles": peticiones delicadas, negociacion y formas de plantear un tema incomodo.
- Escritura creativa y narrativa: el autor situa el modelo a la par de Kimi K3 en su benchmark StoryBench, aunque reconoce que pierde en narrativa hostil y en turnos largos de ficcion.
- Inteligencia emocional conversacional: tercer puesto declarado en EQ-Bench 4, por delante de GPT-5.5, Opus 4.7 y Opus 4.8 segun la model card.
- Conversacion multi-turno en ingles con contexto largo, gracias a la ventana de 262.144 tokens.
- Plantilla de chat integrada (`apply_chat_template`) con roles de sistema, usuario y asistente.
- Compatibilidad con endpoints OpenAI-style, segun la etiqueta endpoints_compatible del repositorio.
- Capacidad declarada de "no envolver" la respuesta: entrega el texto pedido sin comentarios adicionales en la mayoria de peticiones, segun la metrica que el autor reporta.
- Soporte de tool calling o function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Correspondencia administrativa: redactar la reclamacion a una compania electrica, la carta a la comunidad de vecinos o la solicitud a una administracion publica. El modelo esta afinado especificamente para producir el texto final sin plantillas ni opciones alternativas, que es el principal punto de friccion en estas tareas.
- Comunicacion laboral: correos a companeros y responsables, respuestas a clientes internos y mensajes de seguimiento. El contexto de 262.144 tokens permite incluir hilos completos de correo o documentacion de referencia dentro del prompt.
- Conversaciones dificiles y negociacion: pedir un aumento, rechazar una propuesta o dar una mala noticia por escrito. La model card situa el modelo muy por delante de alternativas cerradas en la categoria de "peticiones dificiles" segun su propio benchmark.
- Atencion al cliente en ingles: gestion de conversaciones multi-turno con historial largo, apoyandose en la ventana de contexto y en la capacidad declarada en EQ-Bench 4 para ajustar el tono al interlocutor.
- Asistencia de escritura creativa: relatos cortos, dialogos y textos de ficcion de extension media. Es un uso valido con la salvedad del propio autor de que los modelos especializados en historia son mejores en generos hostiles y en tramas largas.
- Generacion de contenido de marketing y redes: textos promocionales, publicaciones y respuestas a comentarios donde se busca un registro natural y no un tono corporativo generico.
- Servicio de alto rendimiento en produccion: al ser una version FP8 con compatibilidad con vLLM y endpoints OpenAI-style, puede desplegarse detras de una API para servir peticiones concurrentes de redaccion asistida.
- Aplicaciones de escritura personal (redaccion de diarios, mensajes personales, textos para citas o redes sociales), el nicho que el autor menciona como motor del proyecto y para el que existen apps de escritorio y movil vinculadas al modelo.

## Benchmarks y rendimiento

Solo se dispone de los resultados cualitativos que el autor publica en la model card. La mayoria corresponden a benchmarks propios, construidos y ejecutados por el propio equipo, lo que el autor declara explicitamente. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras suites estandar en la informacion disponible.

| Benchmark | Resultado declarado | Naturaleza | Notas |
|---|---|---|---|
| CommunicationBench | Primer puesto entre los modelos comparados | Benchmark propio (80 peticiones reales, comparacion ciega por pares) | Declara superar a Fable 5.1 y a GPT-6 Astra por 50 puntos; Kimi K3, GLM-5.3, Grok 4.6 y DeepSeek V4 Pro quedan por detras |
| Human-Likeness | 26 puntos por delante del siguiente modelo | Benchmark propio | Evaluacion por pares ciegos con juez distinto a los modelos evaluados |
| Categorias (dinero y administracion, trabajo, peticiones dificiles, persuasion) | En "peticiones dificiles", 72% frente al 9% de GPT-6 Astra | Benchmark propio (heatmap por categorias) | El autor indica que pierde en narrativa hostil y turnos largos de historia |
| "The message, not a memo" | Entrega el texto sin envolverlo en comentarios | Metrica propia | El autor situa a Fable 5, GLM-5.3 y Kimi K3 envolviendo la respuesta en mas de nueve de cada diez casos |
| EQ-Bench 4 | Tercer puesto, a 12 puntos del mejor | Benchmark externo, ejecutado con su propio harness | Por delante de GPT-5.5, Opus 4.7 y Opus 4.8 segun la model card |
| StoryBench | A la par de Kimi K3 y 504 puntos por encima del modelo de partida | Benchmark propio | Por delante de Qwen3.8-Max y DeepSeek V4 Pro |

No se aportan valores absolutos, intervalos de confianza, tamano de muestra por categoria ni metodologia detallada de los jueces, por lo que estos resultados deben tratarse como afirmaciones del autor y no como mediciones verificadas de forma independiente.

## Requisitos de hardware

- VRAM para los pesos en FP8: aproximadamente 27,3 GB solo para parametros (27,32 mil millones a un byte por parametro). El repositorio ocupa 37,6 GB, incluyendo tokenizer y ficheros auxiliares.
- VRAM total para inferencia: por encima de 27,3 GB, mas la cache KV correspondiente a la longitud de contexto configurada. Con 262.144 tokens de contexto la cache KV crece de forma proporcional a la longitud efectiva de cada peticion, por lo que conviene limitar `--max-model-len` al valor realmente necesario.
- GPU recomendadas (no indicadas por el autor; estimacion a partir del tamano): H100 80 GB, H200, A100 80 GB y L40S 48 GB. Cualquier GPU con 40-48 GB o mas de memoria permite el despliegue en FP8 con margen para cache KV.
- GPU de consumo: una RTX 4090 o 5090 con 24 GB no puede cargar los pesos FP8 completos (27,3 GB). Tampoco una RTX 3090 de 24 GB. Seria necesario recurrir a cuantizaciones de menor precision del modelo base (no disponibles en este repositorio) o a reparto en varias GPU.
- Multi-GPU: el despliegue con tensor parallelism en vLLM es la via natural para repartir los 27,3 GB entre dos GPU de 24 GB.
- Opciones de despliegue: vLLM es el motor documentado por el autor, con el comando `vllm serve ... --max-model-len 262144`. Tambien es compatible con transformers mediante `AutoModelForCausalLM`. Se anuncia compatibilidad con endpoints OpenAI-style.
- Ollama, llama.cpp y TGI: no disponibles en la informacion proporcionada para esta version FP8. El repositorio solo contiene pesos safetensors con compressed-tensors, no ficheros GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

No se dispone de especificaciones tecnicas de la mayoria de los modelos nombrados en la model card, por lo que la comparacion se limita a lo que el autor afirma y a los datos verificables del repositorio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Datos comparativos |
|---|---|---|---|---|---|
| Hemmingway-1-FP8 (este modelo) | 27,32 mil millones | 262.144 tokens | Apache-2.0 | Pesos abiertos en HuggingFace (FP8) | Primer puesto declarado en CommunicationBench y Human-Likeness; tercero en EQ-Bench 4 |
| Altworld/Hemmingway-1 (original) | 27B (declarado) | 262.144 tokens | Apache-2.0 | Pesos abiertos en HuggingFace | Mismo modelo sin cuantizar; punto de partida de esta version |
| Qwen3.8-27B (modelo base declarado) | No disponible | No disponible | No disponible | No disponible | Base sobre la que se construyo Hemmingway-1; el autor indica que StoryBench mejora en 504 puntos respecto al modelo de partida |
| GPT-6 Astra | No disponible | No disponible | Propietaria | API cerrada | Citado como referencia: por detras en CommunicationBench y con 9% en peticiones dificiles frente al 72% de Hemmingway-1 |
| Kimi K3 | No disponible | No disponible | No disponible | No disponible | Citado a la par en StoryBench; por detras en CommunicationBench |
| GLM-5.3, Grok 4.6, DeepSeek V4 Pro, Fable 5.1 | No disponible | No disponible | No disponible | No disponible | Mencionados como participantes en las comparaciones ciegas del autor |

Las cifras de la columna de datos comparativos provienen exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Limitaciones y advertencias

- Idioma: el modelo es "English-first" segun su propio autor. No se declara soporte de castellano ni de otros idiomas, y la etiqueta de idioma del repositorio es unicamente `en`. No es adecuado para produccion multilingue sin una evaluacion previa.
- Alucinacion: el autor advierte explicitamente de que el modelo "puede equivocarse y aun asi sonar seguro de si mismo". Es un riesgo relevante en un modelo optimizado para sonar natural y humano.
- Uso prohibido recomendado por el autor: no debe emplearse para decisiones de caracter medico, legal o financiero.
- Benchmarks no independientes: tres de los cuatro conjuntos de resultados destacados (CommunicationBench, Human-Likeness, StoryBench) son benchmarks propios del autor. Solo EQ-Bench 4 es externo. Los resultados no incluyen valores absolutos ni intervalos de confianza.
- Categorias donde pierde: el autor reconoce inferioridad frente a modelos especializados en narrativa hostil y en turnos largos de historia.
- Cuantizacion FP8: este repositorio no documenta la perdida de calidad respecto a los pesos originales de Altworld/Hemmingway-1. Para tareas sensibles conviene comparar ambas versiones.
- Idiomas y sesgos: no se publica informacion sobre sesgos demograficos, culturales o de registro, ni sobre el proceso de alineamiento, lo que dificulta anticipar comportamientos indeseados.
- Adopcion: el repositorio registra 0 descargas y 0 "likes", y no cuenta con validacion de la comunidad. El soporte y el mantenimiento dependen del autor.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar los avisos de licencia y de copyright. No impone restricciones de uso adicionales.
- Contexto largo: la ventana de 262.144 tokens exige memoria adicional para la cache KV y puede degradar la calidad de recuperacion de informacion en posiciones intermedias; no se publican evaluaciones de tipo "needle in a haystack".

## Enlaces

- Repositorio de esta version cuantizada: https://huggingface.co/vwdubb/Hemmingway-1-FP8
- Pesos originales del modelo base: https://huggingface.co/Altworld/Hemmingway-1
- Sitio del producto: https://hemmingway.io
- Descarga de aplicaciones de escritorio y Android: https://hemmingway.io/download
- Codigo fuente: https://github.com/lukeckprobierts/Hemmingway-1
- Ficha en Product Hunt: https://www.producthunt.com/products/hemmingway-ai
- EQ-Bench 4 (benchmark externo citado): no disponible en la informacion proporcionada

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los enlaces recuperados corresponden a un proveedor de servicios medicos sin relacion con esta ficha.
