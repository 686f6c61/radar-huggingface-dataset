# Takenoko12345678/sakura-gemma-4-E4B-it

## Resumen
Sakura (桜) es un ajuste fino por LoRA del modelo multimodal abierto `google/gemma-4-E4B-it` de Google, publicado por el usuario Takenoko12345678. Su objetivo no es mejorar las capacidades base del modelo, sino imponer una persona conversacional muy concreta: una "amiga de la infancia" japonesa de tono relajado, algo indolente y que se muestra cercana y tímida ante los elogios. El modelo está pensado para roleplay y conversación con personajes en japones e ingles.

Tecnicamente es un transformer multimodal denso de aproximadamente 8.000 millones de parametros (7.996.156.490 segun los pesos en safetensors), con entrada de imagen, texto y audio, y salida de texto. El ajuste se aplico mediante QLoRA de 8 bits en un entrenador MLX personalizado sobre Apple Silicon (M5, 32 GB), con LoRA de rango 16 sobre las 42 capas (atencion, MLP y proyeccion PLE), y posteriormente se fusiono en el checkpoint BF16 oficial.

Su interes practico reside en la metodologia descrita: una tecnica de enmascaramiento de perdida llamada "Trigger-Unmasked Thought Loss Masking", que entrena las etiquetas de apertura del bloque de razonamiento pero excluye el cuerpo del pensamiento del calculo de la perdida, preservando el modo thinking del modelo base mientras se transfiere el estilo del personaje al resultado final. Es un caso de estudio util para quien quiera hacer fine-tuning de persona sin degradar el razonamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal denso (base Gemma 4 E4B); ajuste fino por LoRA fusionado |
| Parametros totales | 7.996.156.490 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; el entrenamiento uso QLoRA 8-bit y pesos BF16 fusionados |
| Idiomas soportados | japones (ja), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); tamano del repo 16,0 GB |

## Arquitectura y entrenamiento
El modelo parte de `google/gemma-4-E4B-it`, un transformer multimodal que acepta texto, imagen y audio como entrada y genera texto. El ajuste no modifica los codificadores de imagen ni de audio: el LoRA se aplica unicamente al modelo de lenguaje. El entrenamiento se ejecuto en un entrenador MLX propio con QLoRA de 8 bits en memoria, `rank = 16`, `scale = 2.0` (equivalente a `alpha = 32`), `dropout = 0.05`, optimizador AdamW con `lr = 5e-5` (warmup del 8 % y decaimiento coseno hasta `5e-6`), tamano de lote efectivo 8 y 2 epocas.

El dataset combina ejemplos escritos a mano, datos de destilacion generados localmente con Gemma 4 E4B y con Gemma 4 26B A4B en 4 bits, y ejemplos de razonamiento on-policy. La composicion declarada es: 36 ejemplos manuales con peso x4 (32 en modo thinking OFF y 4 en ON), 1.000 ejemplos destilados de charla, uso practico y fijacion del nombre (OFF), 289 ejemplos de razonamiento de un solo turno (ON) y 160 ejemplos de razonamiento multi-turno (ON), hasta un total de 1.485 conversaciones. La innovacion destacable es el enmascaramiento de perdida: los tokens de sistema y usuario, el cuerpo del pensamiento y el cierre del bloque se excluyen del calculo de la perdida, mientras que los tres tokens de apertura del bloque `thought` y la respuesta final si se entrenan. El autor reporta que esta variante alcanza un 100 % de respuestas con pensamiento de mas de 10 caracteres y un 90,0 % de exito conjunto en MGSM-ja (precision y persona), frente al 33,3 % de entrenar solo con ejemplos OFF.

## Capacidades
- Generacion de texto conversacional con una persona fija (tono relajado, cercano, con muestras de timidez) en japones e ingles.
- Razonamiento en modo thinking ON/OFF con separacion explicita del bloque de pensamiento.
- Razonamiento matematico basico y de varios pasos (evaluado con MGSM-ja).
- Comprension de imagenes: el autor documenta respuestas correctas a un problema geometrico (area y hipotenusa de un triangulo rectangulo) y a una captura de error `KeyError` de Python.
- Comprension de audio: respuesta correcta a una pregunta aritmetica formulada por voz.
- Entrada multimodal any-to-any segun el pipeline declarado (texto, imagen y audio como entrada; texto como salida).
- Resistencia a instrucciones que intentan romper el personaje (evaluada con 4/4 respuestas correctas en `prod_v1`).
- No se documenta soporte de tool calling, function calling ni uso como agente multi-paso.

## Casos de uso
- Roleplay y compania conversacional en japones: el modelo mantiene un personaje coherente en conversaciones multi-turno, con respuestas cortas (media de 42,7 caracteres en charla segun el autor), adecuado para aplicaciones de entretenimiento o simulacion de personajes.
- Prototipado de personajes para videojuegos o novelas visuales: sirve como referencia de como transferir un estilo de habla concreto sobre un modelo base sin reentrenar desde cero.
- Asistente personal con tono informal: responde a preguntas practicas (cocina, programacion) con explicaciones largas (media de 446,4 caracteres en preguntas practicas) manteniendo la persona.
- Tutoria de matematicas en japones: con thinking ON resuelve problemas de varios pasos y explica el procedimiento, util para un tutor conversacional que muestre el razonamiento.
- Analisis de capturas de pantalla: al aceptar imagen, puede interpretar errores de terminal o diagramas y explicarlos con un tono cercano, por ejemplo en soporte tecnico informal.
- Accesibilidad por voz: la entrada de audio permite construir interfaces conversacionales habladas para consultas cotidianas o aritmetica simple.
- Investigacion sobre fine-tuning de persona: el diseno de enmascaramiento de perdida y la evaluacion cuantitativa de persona sirven como base metodologica para experimentos similares.

## Benchmarks y rendimiento
Los datos disponibles son evaluaciones internas del autor, no benchmarks estandar de la comunidad. La tabla siguiente reproduce la ablacion sobre 382 conversaciones y 30 preguntas de MGSM-ja en holdout (Persona = proporcion de respuestas sin violaciones de estilo; MGSM Acc = aparicion del valor correcto; MGSM Both = ambas condiciones).

| Condicion | Casual OFF (Persona / Caracteres) | Practical OFF (Persona / Caracteres) | Resistencia | MGSM Acc | MGSM Persona | MGSM Both | Thought % |
|---|---|---|---|---|---|---|---|
| Base sin prompt | 40 % / 207 | 0 % / 1218 | 0 % | 86,7 % | 3,3 % | 3,3 % | 96,7 % |
| Base + tarjeta de personaje | 100 % / 61 | 88 % / 741 | 75 % | 83,3 % | 96,7 % | 80,0 % | 100,0 % |
| Solo ejemplos OFF | 100 % / 40 | 88 % / 312 | 100 % | 93,3 % | 40,0 % | 33,3 % | 100,0 % |
| SFT mixto convencional | 100 % / 42 | 88 % / 364 | 100 % | 90,0 % | 90,0 % | 83,3 % | 100,0 % |
| Pensamiento totalmente enmascarado | 100 % / 40 | 100 % / 372 | 100 % | 86,7 % | 96,7 % | 83,3 % | 86,7 % |
| Trigger-unmasked (adoptado) | 100 % / 38 | 100 % / 371 | 100 % | 96,7 % | 93,3 % | 90,0 % | 100,0 % |

En la evaluacion `prod_v1`: MGSM-ja con thinking ON sobre 100 preguntas, 85 respuestas con el valor correcto, 92 con persona valida y 80 con ambas (95 con pensamiento de mas de 10 caracteres). En imagen, 5/5 respuestas con persona valida y en audio 3/3, tanto en ON como en OFF. No hay resultados publicados de MMLU, HumanEval ni otros benchmarks estandar.

## Requisitos de hardware
- VRAM estimada: unos 16 GB en BF16 para los pesos (el repo ocupa 16,0 GB); en cuantizacion de 8 bits alrededor de 8-9 GB y en 4 bits alrededor de 5-6 GB, sin contar cache de contexto ni codificadores multimodales.
- GPU recomendadas: A100 40 GB o H100 para BF16 con contexto largo; RTX 4090 (24 GB) suficiente para BF16 en contextos moderados o 8 bits con margen.
- Cabe en GPU de consumo: si, en RTX 4090 y previsiblemente en RTX 3090 (24 GB); en tarjetas de 12-16 GB solo con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), `mlx-vlm` en Apple Silicon (usado por el autor para las pruebas multimodales), y en general vLLM, TGI o llama.cpp si se generan pesos en los formatos correspondientes (no se proporcionan GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sakura-gemma-4-E4B-it | 7,996 M | no disponible | Persona japonesa + multimodal sobre Gemma 4 E4B | Apache 2.0 | Hugging Face (27 descargas) |
| google/gemma-4-E4B-it | no disponible | no disponible | Modelo base multimodal instruct | Gemma (terminos de Google) | Hugging Face |
| haruuuuu-1256/aoi-gemma-4-E4B-it | no disponible | no disponible | Persona japonesa sobre el mismo base, inspiracion declarada | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables de los otros dos modelos en la informacion proporcionada.

## Limitaciones y advertencias
- El alcance linguistico declarado es japones e ingles; el rendimiento en castellano no esta evaluado y probablemente degrade la persona.
- Riesgo de alucinacion propio de un modelo de 8.000 millones de parametros, especialmente en matematicas de varios pasos: en MGSM-ja la precision reportada es del 85 % (valor correcto presente), no del 100 %.
- La persona puede filtrarse en contextos donde no se desea; el autor documenta resistencia a instrucciones de cambio de rol, lo que puede ser un inconveniente si se necesita un asistente neutro.
- El ajuste LoRA no toca los codificadores de imagen y audio, por lo que las capacidades multimodales son las del modelo base y no se han reforzado.
- La evaluacion es interna y de muestra pequena (30 preguntas en la ablacion, 100 en `prod_v1`, 5 imagenes y 3 audios), sin benchmarks estandar ni comparacion con terceros.
- El modelo se entreno solo en Apple Silicon con un dataset de 1.485 conversaciones, en su mayoria destiladas; puede reproducir sesgos o estilo del modelo profesor.
- Licencia Apache 2.0 declarada para el ajuste, pero conviene verificar los terminos del modelo base Gemma de Google antes de un uso comercial.
- No se documenta soporte de tool calling ni de agentes; no deberia asumirse en produccion.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Takenoko12345678/sakura-gemma-4-E4B-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo de inspiracion: https://huggingface.co/haruuuuu-1256/aoi-gemma-4-E4B-it
