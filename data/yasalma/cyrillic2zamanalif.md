# yasalma/cyrillic2zamanalif

## Resumen

`yasalma/cyrillic2zamanalif` es un modelo de traduccion transliterativa especializado en convertir palabras del tatar escrito en alfabeto cirilico al alfabeto latino Zamanalif (tambien conocido como alfabeto tatar latino moderno). Lo desarrolla el usuario `yasalma`, presumiblemente vinculado al proyecto neurotatarlar, y esta pensado como utilidad linguistica concreta: no genera texto libre, sino que transforma una palabra cirilica en su equivalente Zamanalif, opcionalmente usando una frase como contexto para desambiguar.

El modelo parte de `google/byt5-small`, un encoder-decoder T5 basado en tokens de bytes (vocabulario de 256 tokens, sin tokenizacion linguistica), y ha sido afinado para la tarea `text2text-generation` con un formato de prompt muy especifico (`сүз: <palabra>` y, opcionalmente, `контекст: <frase>`). Con aproximadamente 300 millones de parametros, es un modelo pequeno y ligero, adecuado para ejecucion en CPU o GPU de consumo.

Su relevancia es acotada pero clara: cubre una necesidad linguistica de nicho (transliteracion tatar cirilico-latino) que los modelos multilingues generales rara vez resuelven con precision, y lo hace con un modelo de apenas 1,2 GB de repo y bajo coste de inferencia. No hay datos publicados de benchmarks ni de licencia, lo que limita su uso en produccion sin verificacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder transformer tipo T5 (ByT5), con tokenizacion a nivel de bytes |
| Parametros totales | 299.637.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de entrada (max_length de entrenamiento); 64 tokens de salida |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, pero no documentada por el autor) |
| Idiomas soportados | tt (tatar) |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de `google/byt5-small`, un T5 encoder-decoder que opera directamente sobre bytes en lugar de subwords. Esto le permite manejar sin problemas caracteres cirilicos especificos del tatar (como Ә, Ө, Ү, Җ, Ң, Һ) y producir cadenas latinas con caracteres Zamanalif, sin depender de un vocabulario subword que podria fragmentar o desconocer grafemas. La entrada se trunca a 256 tokens y la salida se limita a 64 tokens, suficiente para una palabra transliterada.

El entrenamiento se realizo sobre un conjunto anotado manualmente de 38.381 ejemplos: 36.798 ejemplos de palabra unica y 1.583 ejemplos con contexto de frase. Los ejemplos se agruparon por palabra o por contexto antes del split train/validacion para evitar fuga de datos (misma entrada en ambos conjuntos). Se entrenaron cinco epochs y se guardo el checkpoint con mejor exact match en validacion. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Transliteracion de palabras tatars en cirilico a Zamanalif (latino).
- Uso opcional de una frase de contexto para desambiguar la transliteracion de palabras polisemicas u homografas.
- Formato de prompt controlado: `сүз: <palabra>` con linea opcional `контекст: <frase>`.
- Salida restringida a la palabra convertida, no a la frase completa.
- Manejo nativo de grafemas cirilicos tatars gracias a la tokenizacion por bytes de ByT5.
- No dispone de tool calling, function calling, capacidades de agente ni multi-step reasoning.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al tatar; no se documenta soporte para otras lenguas.

## Casos de uso

- Normalizacion de corpus tatars: convertir textos historicos o contemporaneos en cirilico a Zamanalif para construir corpus paralelos o indices de busqueda en alfabeto latino, usando el modelo palabra a palabra con contexto de frase para reducir ambiguedad.
- Digitalizacion de patrimonio documental: procesar transcripciones de libros, periodicos o manuscritos tatars en cirilico y generar versiones en Zamanalif para archivos y bibliotecas digitales.
- Preprocesado para motores de busqueda y recuperacion: transliterar consultas y documentos a una representacion latina comun, facilitando busquedas cross-script en catalogo tatar.
- Aplicaciones educativas de aprendizaje del tatar: mostrar a estudiantes la forma Zamanalif de una palabra cirilica junto con su contexto de uso, como apoyo en ejercicios de lectura y escritura.
- Pipelines de NLP tatar: como paso previo a modelos de embeddings, clasificacion o traduccion que operan sobre alfabeto latino, normalizando la entrada cirilica.
- Herramientas de escritorio o movil offline: al ser un modelo de ~300 M de parametros y 1,2 GB, puede ejecutarse en CPU o GPU de consumo dentro de una aplicacion local de transliteracion sin dependencia de servicios en la nube.
- Anotacion asistida para linguistas: generar candidatos de transliteracion que despues se revisan manualmente, acelerando la creacion de lexicos y datasets anotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona que se selecciono el checkpoint con mejor exact match en validacion, pero no reporta cifras concretas de exact match, precision o recall.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1,2 GB solo para pesos, mas activaciones; en torno a 1,5-2 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 0,6 GB para pesos, con overhead adicional; cabe holgadamente en GPUs de 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo esta sobredimensionado para estas GPUs y se desaprovecharia.
- Cabe en GPU de consumo: si, en practicamente todas las GPU de consumo actuales, e incluso en CPU con un rendimiento aceptable para uso interactivo.
- Opciones de despliegue: `transformers` con `AutoModelForSeq2SeqLM` (metodo documentado por el autor); compatible con Text Generation Inference (tag `text-generation-inference`); tambien puede convertirse a GGUF para llama.cpp u Ollama, aunque no esta documentado por el autor.
- Latencia y throughput: no disponibles. Por el tamano del modelo y la salida corta (64 tokens), se espera latencia de milisegundos a decenas de milisegundos por palabra en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yasalma/cyrillic2zamanalif | 299,6 M | 256 entrada / 64 salida | Transliteracion tatar cirilico-Zamanalif | no disponible | Hugging Face |
| google/byt5-small | ~300 M | 512-1024 tokens (segun configuracion ByT5) | Generacion texto2texto generica multilingue | Apache 2.0 (modelo base de Google) | Hugging Face |
| google/mt5-small | ~300 M | 512 tokens | Traduccion y generacion multilingue | Apache 2.0 | Hugging Face |

La comparativa directa con modelos especializados de transliteracion tatar no esta disponible en la informacion proporcionada. Frente a sus modelos base, `cyrillic2zamanalif` sacrifica generalidad y cobertura linguistica a cambio de especializacion en una tarea concreta con formato de prompt fijo.

## Limitaciones y advertencias

- Ambito muy restringido: solo translitera palabras tatars de cirilico a Zamanalif; no traduces, no genera texto libre ni cubre otras lenguas.
- Dependencia del formato de prompt: la entrada debe seguir el esquema `сүз: <palabra>` y opcionalmente `контекст: <frase>`; usos fuera de formato pueden degradar la salida.
- Salida limitada a 64 tokens y entrada a 256, lo que restringe el contexto disponible para desambiguar.
- Dataset pequeno (38.381 ejemplos) y anotado manualmente, con posible sesgo hacia el vocabulario y estilo de las fuentes usadas; cobertura limitada de neologismos, nombres propios y variantes dialectales.
- Riesgo de alucinacion en palabras desconocidas u homografas: el modelo puede producir una transliteracion plausible pero incorrecta, especialmente sin contexto.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar con el autor antes de integrarlo en productos.
- Sin benchmarks publicados: no hay evidencia cuantitativa de precision ni de robustez frente a entradas ruidosas.
- Al derivar de `google/byt5-small`, hereda los sesgos y limitaciones del modelo base, incluida la tokenizacion por bytes que puede producir salidas anomalas en entradas malformadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yasalma/cyrillic2zamanalif
- Modelo base: https://huggingface.co/google/byt5-small
- Codigo de entrenamiento: https://github.com/neurotatarlar/cyrillic2zamanalif
