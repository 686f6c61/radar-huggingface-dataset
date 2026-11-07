# VeroLM/NoTokenLM-Gen-2.5

## Resumen

NoTokenLM-Gen-2.5 es un modelo de lenguaje experimental de tipo decoder-only Transformer, entrenado desde cero por el autor VeroLM (publicado tambien bajo el identificador `omurberaisik`), que opera directamente sobre caracteres en lugar de sobre una tokenizacion subword. Con solo 3,16 millones de parametros, el modelo prescinde por completo de BPE, merges subword y vocabulario fijo: genera cada caracter de salida uno a uno a partir de su propia distribucion de probabilidad caracter a caracter. El objetivo del proyecto es medir cuanto texto abierto y gramaticalmente plausible se puede generar con un presupuesto de parametros muy reducido cuando el modelo trabaja sobre caracteres crudos.

El checkpoint disponible publicamente corresponde unicamente a la fase de preentrenamiento (27.900 pasos de continuacion de frase a nivel de caracter); el ajuste supervisado (SFT) sobre datos de chat y matematicas, asi como un bucle de refuerzo de fluidez, estan planificados para una version posterior y no se han aplicado aqui. Por tanto, no es un modelo de instrucciones ni de preguntas y respuestas: es una vista previa que documenta el progreso del proyecto de forma transparente, incluidas sus limitaciones actuales.

Su relevancia es fundamentalmente investigadora: los modelos caracter-level de pocos millones de parametros que aspiran a generacion abierta (y no a una tarea cerrada) son poco frecuentes. Sirve como banco de pruebas para estudiar como emergen reglas ortograficas (mayusculas, comillas, apostrofes, puntuacion) a partir de estadisticas de caracteres, sin que nadie se las haya ensenado explicitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, 5 capas, 2 cabezas de atencion, d_model=224, d_ff=896, atencion causal con KV-cache, weight tying entre embedding y cabeza de salida |
| Parametros totales | 3.163.552 (~3,16 M) segun model card; 3.186.848 segun safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el modelo es lo bastante pequeno para inferencia en fp32/fp16 sin cuantizar) |
| Idiomas soportados | Ingles (etiqueta `en`); se han observado fragmentos ocasionales en frances filtrados del corpus |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers, requiere `trust_remote_code=True` por `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only de 5 capas con 2 cabezas de atencion, dimension de modelo 224 y dimension de feed-forward 896, con atencion causal auto-regresiva y cache KV para generacion. El vocabulario consta de 104 simbolos derivados directamente del corpus: caracteres crudos mas un conjunto reducido de tokens de control (pad, bos, eos, unk y marcadores de rol de chat previstos para una futura fase de instruccion). No hay BPE, ni merges subword, ni diccionario fijo; la cabeza de salida esta atada a los embeddings de entrada (weight tying).

El entrenamiento se realizo desde cero sobre aproximadamente 4,4 GB de texto en ingles compuesto por libros de dominio publico (Project Gutenberg / GITenberg), Wikipedia en ingles simple, corpus de dialogo (BNC y datos conversacionales estilo Twitter), pares pregunta/respuesta derivados de SQuAD y ejemplos aritmeticos sinteticos. El checkpoint actual refleja solo 27.900 pasos de preentrenamiento con objetivo de continuacion de frase al siguiente caracter. No se ha aplicado RLHF, DPO ni SFT en esta version; el autor menciona un futuro bucle de recompensa de fluidez ligero para un checkpoint posterior.

## Capacidades

- Generacion de texto abierto a nivel de caracter: continuacion de frases sin lista de palabras predefinida, generando un caracter cada vez.
- Produccion de fragmentos de frase gramaticalmente bien formados, con mayusculas, comillas, apostrofes y puntuacion correctos inferidos de estadisticas de caracteres.
- Vocabulario amplio y variado de palabras inglesas reales correctamente escritas, sin colapso en la repeticion de una palabra dominante (fallo observado en checkpoints anteriores del proyecto).
- Reproduccion de artefactos del corpus de libros, como marcadores `[Illustration: ...]` de textos escaneados y frases ocasionales en frances.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta instrucciones ni preguntas y respuestas de forma fiable (sin fase SFT).
- Capacidad multilingue practicamente nula (solo ingles, con fugas puntuales de frances).
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Investigacion sobre modelos tokenizer-free: banco de pruebas para estudiar como emergen reglas ortograficas y de puntuacion a partir de datos crudos de caracteres, sin vocabulario subword. Adecuado por su tamano minimo y su licencia permisiva.
- Docencia y divulgacion: ejemplo didactico de un Transformer completo y funcional en pocos millones de parametros, util para explicar atencion, KV-cache y weight tying en cursos de NLP.
- Generacion creativa de fragmentos y disparadores de ideas: partiendo de una frase inicial, produce continuaciones variadas e impredecibles utiles como material de brainstorming o poesia experimental, aceptando su falta de coherencia global.
- Pruebas de infraestructura de inferencia: al caber en cualquier GPU consumer e incluso en CPU, sirve para validar pipelines de `transformers` con `trust_remote_code`, integracion de vocabularios externos (`vocab.json`) y generacion con filtros de n-gramas.
- Estudio de artefactos de corpus: analisis de como el modelo reproduce sesgos y marcas de sus fuentes (marcadores de ilustracion, frases en frances), util en trabajos de procedencia y calidad de datos.
- Base para experimentos de SFT a escala minima: al estar previsto un ajuste supervisado posterior, este checkpoint sirve como punto de partida reproducible para comparar tecnicas de instruccion en modelos de muy bajo presupuesto.
- Generacion de datos sinteticos a nivel de caracter: util para aumentar corpus de texto con variabilidad ortografica en experimentos de robustez de tokenizadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (3,16 M de parametros equivalen a unos 13 MB de pesos); en la practica cabe en cualquier GPU, incluida una GTX 1050 o una iGPU.
- GPU recomendadas: no requiere GPU dedicada; funciona correctamente en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es mas que suficiente.
- Cabe en GPU consumer: si, en todas, sin cuantizacion.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (metodo `generate_raw` propio del modelo). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; al ser un modelo de codigo personalizado y caracter-level, la integracion en esos motores requeriria trabajo adicional.
- Latencia y throughput estimados: no disponibles. Por el tamano del modelo, la generacion caracter a caracter sera rapida en terminos absolutos, pero la decodificacion secuencial de caracteres implica muchas mas llamadas por palabra que un modelo subword.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NoTokenLM-Gen-2.5 | ~3,16 M | no disponible | Caracter-level, tokenizer-free, solo preentrenamiento | Apache 2.0 | Hugging Face |
| Modelos GPT-2 pequenos (referencia) | 124 M | 1024 | Subword BPE, preentrenado | MIT | Amplia |
| Modelos tipo TinyStories (referencia) | 1-30 M | variable | Subword, entrenados en corpus sintetico de cuentos | variable | Hugging Face |

No se dispone de datos de benchmarks que permitan una comparacion cuantitativa con alternativas de la misma categoria; la comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Coherencia semantica limitada: las frases individuales pueden ser plausibles, pero el pasaje completo suele derivar de tema rapidamente.
- Palabras inventadas o malformadas ocasionales que parecen plausibles a nivel de caracter pero no son ingles real.
- Sin capacidad de seguir instrucciones ni de responder preguntas de forma fiable: el checkpoint no ha pasado por SFT.
- Sin fundamento factico: con 3,16 M de parametros no puede almacenar ni recuperar hechos del mundo real de forma fiable; riesgo alto de alucinacion si se usa como fuente de informacion.
- Sesgos heredados del corpus: libros de dominio publico, Wikipedia simple, BNC y datos de Twitter pueden introducir sesgos historicos, sociales y de registro.
- Artefactos del corpus: marcadores de ilustracion y frases en frances que se filtran en la generacion.
- Idioma: solo ingles; no se debe esperar un comportamiento correcto en castellano.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no esta pensado para produccion y su calidad no lo hace apto para ello.
- Requiere `trust_remote_code=True` y ejecutar codigo personalizado del autor, lo que implica revisar el codigo antes de desplegarlo en entornos sensibles.
- Discrepancia menor entre el recuento de parametros de la model card (3.163.552) y el de safetensors (3.186.848); conviene verificar en el propio repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/VeroLM/NoTokenLM-Gen-2.5
- Hugging Face (identificador alternativo): https://huggingface.co/omurberaisik/NoTokenLM-Gen-2.5
