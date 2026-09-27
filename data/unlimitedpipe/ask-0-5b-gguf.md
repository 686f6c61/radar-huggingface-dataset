# unlimitedpipe/ask-0.5b-GGUF

## Resumen

unlimitedpipe/ask-0.5b es un fine-tune de Qwen2.5-0.5B-Instruct especializado en una unica tarea: responder a preguntas usando exclusivamente fuentes numeradas que se le pasan en el prompt, citando con marcadores del tipo `[1]` la fuente concreta que utiliza y rechazando de forma explicita cuando las fuentes no cubren la pregunta. Con 494.032.768 parametros y un peso cuantizado de 531 MB en 8 bits, es un modelo pensado para ejecutarse en cualquier maquina dentro del ecosistema de UnlimitedPipe mediante Ollama, sin GPU dedicada.

El problema que resuelve es el de la atribucion en pipelines RAG: los modelos pequenos tienden a inventar cifras y a no citar, y los modelos grandes explican mejor pero citan peor. El autor entreno el modelo sobre 6.974 ejemplos del dataset publico `unlimitedpipe/ask-sft-public`, construido unicamente con datos publicos de agencias federales de Estados Unidos y frases redactadas por UnlimitedPipe a partir de datos abiertos, sin articulos de prensa. Un unico pase de LoRA (r=16, todas las capas lineales) durante unos 30 minutos en una T4 fue suficiente para el objetivo.

Su relevancia es acotada pero clara: demuestra que una habilidad muy concreta (citar y no inventar) se puede ensenar a un modelo de 0,5B con un dataset pequeno, y que el resultado generaliza a dominio no visto. La model card reporta un 87% de acierto en citacion correcta sobre noticias que el modelo nunca vio, frente al 5% del modelo base, y un 98% sobre los datos publicos de entrenamiento. Soporta ingles y tailandes. La licencia es Apache 2.0, igual que la de su modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con adaptadores LoRA fusionados sobre el modelo base |
| Parametros totales | 494.032.768 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No indicada en la model card. Heredada del modelo base Qwen2.5-0.5B-Instruct (32.768 tokens segun su ficha oficial), sin confirmacion por parte del autor |
| Tipos de cuantizacion | GGUF; el autor menciona una variante de 8 bits de 531 MB. No se detallan los niveles de cuantizacion publicados en el repositorio |
| Idiomas soportados | Ingles (en) y tailandes (th) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de inferencia) y safetensors (contaje de parametros del modelo base fine-tuneado) |
| Modelo base | Qwen/Qwen2.5-0.5B-Instruct |
| Dataset de entrenamiento | unlimitedpipe/ask-sft-public |
| Tamano del repositorio | 0,5 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de 494 millones de parametros, sin mezcla de expertos ni componentes de estado recurrente. El autor no describe modificaciones estructurales: el modelo final es el modelo base con un ajuste LoRA de rango 16 aplicado a todas las capas lineales, entrenado en un unico pase sobre 6.974 ejemplos del dataset `unlimitedpipe/ask-sft-public`. El entrenamiento completo requirio aproximadamente 30 minutos en una unica GPU T4, lo que da una idea del coste computacional del proyecto.

El dato interesante esta en la composicion y el formato del dataset, no en la arquitectura. Cada ejemplo contiene exactamente el prompt que envia la herramienta `ask` de UnlimitedPipe y una respuesta redactada por plantillas a partir de las fuentes incluidas en ese prompt. Las fuentes son exclusivamente datos publicos: obras del gobierno federal de Estados Unidos (SEC, Federal Register, OFAC, USGS, NOAA, NASA, CISA, FDA, DOJ, Reserva Federal, Casa Blanca, Departamento de Estado) y frases escritas por UnlimitedPipe a partir de datos abiertos. No hay articulos de prensa. El modelo aprende por tanto el formato de citacion y la politica de rechazo, no un catalogo de temas, que es lo que explica que rinda casi igual sobre noticias nunca vistas que un modelo entrenado especificamente con noticias (87% frente a 91%). No se menciona RLHF, DPO ni ninguna otra fase de alineamiento posterior al SFT.

## Capacidades

- Generacion de respuestas extractivas ancladas a fuentes numeradas, con cita explicita del indice de la fuente utilizada (`[1]`, `[2]`, etc.).
- Politica de rechazo explicito cuando las fuentes proporcionadas no cubren la pregunta, en lugar de responder con conocimiento parametrico.
- Respuestas con las propias palabras de las fuentes (titulares y resumenes), no parafrasis libre y no razonamiento.
- Multilingue limitado a ingles y tailandes; las respuestas en tailandes conservan los titulares de las fuentes en ingles tal cual.
- Integracion con Ollama mediante el nombre `hf.co/unlimitedpipe/ask-0.5b-GGUF` y deteccion automatica por parte de la herramienta `ask`.
- Formato conversacional e compatibilidad con endpoints (`endpoints_compatible` en las etiquetas del repositorio).
- No hay soporte documentado de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido (thinking). El modelo responde a un unico formato de prompt y con otros formatos se comporta como el Qwen 0.5B original.

## Casos de uso

- Asistente de preguntas sobre documentacion regulatoria: con un indice de documentos del Federal Register, la SEC o el DOJ troceados y numerados, el modelo devuelve la respuesta citando el fragmento exacto, lo que permite auditar de donde sale cada afirmacion.
- Verificacion de grounding en un pipeline RAG: colocado como ultimo paso tras el recuperador, el modelo decide si las fuentes recuperadas bastan para responder; si no lo hacen, emite un rechazo en lugar de rellenar el hueco, lo que reduce falsos positivos.
- Resumen de boletines y avisos de agencias (CISA, FDA, NOAA, USGS): dado un feed de avisos numerados, genera un resumen atribuido. La model card advierte que en este caso tiende a citar un solo item cuando habia dos o tres disponibles.
- Despliegue en entornos aislados o sin GPU: con 531 MB en 8 bits y arquitectura de 0,5B, se ejecuta en CPU sobre cualquier maquina con Ollama, lo que cubre escenarios de red air-gapped donde no se puede llamar a una API externa.
- Atencion al cliente con base documental cerrada: integrado en un bot de soporte, responde solo con lo que hay en la base de conocimiento y deriva al operador cuando no hay cobertura documental, en lugar de improvisar una respuesta.
- Aplicaciones en tailandes con fuentes en ingles: para organizaciones tailandesas que trabajan con documentacion estadounidense o internacional, el modelo responde en tailandes manteniendo los titulares de origen en ingles y citandolos.
- Prototipado rapido de productos RAG: sirve como linea base de bajo coste para medir la calidad de un recuperador antes de invertir en un modelo mayor, ya que su comportamiento de citacion es facil de evaluar automaticamente.
- Investigacion sobre atribucion y calibracion: el modelo y el dataset `ask-sft-public` permiten estudiar como se comporta un modelo diminuto cuando se le ensena a decir "no lo se" en lugar de generar.

## Benchmarks y rendimiento

Los unicos datos disponibles proceden de la evaluacion incluida en la model card, realizada con el banco de pruebas `research/ask` del repositorio de UnlimitedPipe. El protocolo es decodificacion greedy con 150 tokens nuevos para todos los modelos, y se evaluan cuatro criterios: cita correcta, que solo se citen fuentes reales, que no se inventen cifras, y respuestas en tailandes a preguntas en tailandes, ademas de rechazos claros.

| Modelo | Noticias nunca vistas (92) | Datos publicos (84) |
|---|---|---|
| Qwen2.5 0.5B Instruct (modelo base) | 5 (5%) | 5 (6%) |
| unlimitedpipe/ask-0.5b (este modelo) | 80 (87%) | 82 (98%) |
| Misma receta entrenada con noticias (no publicado) | 84 (91%) | 81 (96%) |

No se han publicado resultados en benchmarks generalistas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor senala que donde el modelo falla es por incompletitud, no por incorreccion: ante un feed con varios elementos nuevos, suele citar uno solo.

## Requisitos de hardware

- Peso del modelo: 531 MB en la cuantizacion de 8 bits indicada por el autor. En el repositorio GGUF, una cuantizacion de 4 bits quedaria por debajo de los 400 MB. En fp16, los 494 millones de parametros ocuparian aproximadamente 1 GB.
- VRAM estimada para inferencia: por debajo de 1 GB con la cuantizacion de 8 bits, sumando una cache KV minima. Cualquier GPU con 2 GB o mas es suficiente, incluidas GTX 1050 Ti, GTX 1650 o integradas modernas.
- GPU recomendadas: no se requiere GPU. Una T4, una RTX 3060 o incluso una iGPU reciente ofrecen margen de sobra. Las A100 o H100 no aportan nada relevante a esta escala.
- Ejecucion en CPU: viable en cualquier portatil actual gracias al tamano del modelo y al formato GGUF.
- Opciones de despliegue: Ollama es la via documentada por el autor (`ollama pull hf.co/unlimitedpipe/ask-0.5b-GGUF`), y el propio comando `unlimited setup` lo instala. Al ser GGUF, tambien es compatible con llama.cpp y con cualquier runtime que lea ese formato. No hay instrucciones publicadas para vLLM o TGI, aunque el modelo base en safetensors es servible con esos motores.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion. El unico dato temporal es el entrenamiento: unos 30 minutos de LoRA sobre 6.974 ejemplos en una unica T4.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en citacion (datos publicos) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| unlimitedpipe/ask-0.5b | 494 M | No indicado (base Qwen2.5: 32.768) | 82/84 (98%) | Apache 2.0 | Publico en HuggingFace, GGUF y Ollama |
| Qwen2.5 0.5B Instruct (base) | 494 M | 32.768 | 5/84 (6%) | Apache 2.0 | Publico en HuggingFace |
| Misma receta entrenada con noticias | No disponible | No disponible | 81/84 (96%) | No publicada | No publicado |

No se han encontrado en la informacion proporcionada otros modelos publicos comparables especializados en respuesta extractiva con citas a esta escala. Los resultados de la tabla anterior proceden de la propia evaluacion del autor, que no es una comparacion independiente.

## Limitaciones y advertencias

- El modelo responde con las palabras literales de las fuentes (titulares y resumenes). Esto es lo que impide que invente, pero tambien implica que no explica, no sintetiza y no razona. El propio autor lo senala: un modelo general mayor explica mejor y cita peor.
- Fue entrenado para un unico formato de prompt, el de la herramienta `ask`. Con cualquier otro formato, el comportamiento es el de un Qwen 0.5B Instruct sin ajustar.
- Tendencia a la incompletitud: ante un conjunto de fuentes con varias novedades, suele devolver una sola cita cuando habia dos o tres elementos relevantes.
- Las respuestas en tailandes mantienen los titulares de las fuentes en ingles, lo que puede resultar inadecuado en productos donde se espera localizacion completa.
- Solo cubre ingles y tailandes. No hay evaluacion publicada sobre otras lenguas, incluido el castellano.
- Uso comercial permitido bajo Apache 2.0, la misma licencia que el modelo base Qwen2.5-0.5B-Instruct. No se mencionan clausulas adicionales ni restricciones especificas del autor.
- Riesgo de alucinacion reducido por diseno, pero no eliminado: el modelo podria citar un indice equivocado o fusionar contenido de fuentes distintas. La evaluacion del autor mide citacion correcta, no fidelidad semantica completa.
- Sesgos: el corpus de entrenamiento son datos publicos de agencias federales de Estados Unidos, lo que introduce un sesgo tematico e institucional claro hacia ese dominio. No hay documentacion sobre sesgos demograficos o linguisticos.
- Los numeros de la model card proceden de la evaluacion del propio autor con su propio banco de pruebas; no hay verificacion independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado el 27 de septiembre de 2026. Es un modelo reciente y sin adopcion publica demostrada, lo que limita la evidencia de robustez en produccion.
- No hay informacion sobre rendimiento en contextos largos, saturacion de la ventana, ni comportamiento con prompts que excedan la longitud soportada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/unlimitedpipe/ask-0.5b-GGUF
- Dataset de entrenamiento: https://huggingface.co/datasets/unlimitedpipe/ask-sft-public
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de UnlimitedPipe en GitHub: https://github.com/Fuyuki0/unlimitedpipe
- Banco de pruebas de evaluacion: https://github.com/Fuyuki0/unlimitedpipe/tree/main/research/ask

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; los enlaces anteriores proceden de la model card y de los metadatos del repositorio de HuggingFace.
