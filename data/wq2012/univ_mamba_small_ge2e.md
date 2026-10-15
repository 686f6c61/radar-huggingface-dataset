# wq2012/univ_mamba_small_ge2e

## Resumen

`wq2012/univ_mamba_small_ge2e` es un extractor de embeddings de hablante (speaker embeddings) de 192 dimensiones desarrollado por el usuario wq2012 dentro del proyecto FlaxSpeaker, una reproduccion limpia (clean-room) en JAX/Flax de algoritmos de reconocimiento de hablante publicados por Google Research. El modelo combina un backbone Mamba de tipo "small" (modelo de espacio de estados selectivo, SSM), pooling temporal atento (ASP) sobre la secuencia de estados, una perdida de entrenamiento GE2E softmax y un esquema de verificacion por similitud coseno. Su tamano es muy reducido: 1.028.672 parametros totales segun los pesos en safetensors, con un encoder declarado de 1.028.674 parametros en la model card.

El problema que resuelve es la verificacion e identificacion de hablante: dado un audio, el modelo produce un vector de 192 dimensiones que representa la identidad vocal, y la decision de "misma persona / persona distinta" se toma con un umbral sobre el coseno entre embeddings. Esto lo hace util para autenticacion por voz, diarizacion, control de acceso y personalizacion de asistentes.

Su relevancia actual es doble. Por un lado, demuestra que un backbone SSM de ~1M de parametros puede producir embeddings de hablante utilizables, con un coste computacional minimo que permite inferencia en CPU. Por otro lado, es una de las pocas reproducciones abiertas de tecnicas como GE2E, Dr-Vectors, Conformer-ATP y PFAS, cuyos experimentos originales se realizaron con infraestructura y datos internos propietarios de Google, no con este codigo ni con particiones publicas de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mamba (state space model selectivo, SSM) con backbone "small" + pooling temporal atento (ASP) |
| Parametros totales | 1.028.672 (safetensors); la model card declara 1.028.674 para el encoder |
| Parametros activos | no aplica (no es una arquitectura MoE) |
| Longitud de contexto | no aplica en el sentido de LLM; la entrada es audio, segmentado mediante el frontend log-mel (80 dimensiones a 16 kHz) con VAD por energia. No se especifica una duracion maxima de utterance |
| Tipos de cuantizacion | no disponible; los pesos se publican en safetensors y en msgpack nativo de Flax, sin versiones cuantizadas documentadas |
| Idiomas soportados | no disponible como campo de idioma; el modelo no es linguistico. Los dominios de evaluacion cubren ingles leido (LibriSpeech), chino multigenero (CN-Celeb2) y celebridades in-the-wild (VoxCeleb1) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`) y Flax msgpack (`flax_model.msgpack`) |
| Dimension del embedding de salida | 192 |
| Pooling temporal | ASP (attentive statistical pooling) |
| Perdida de entrenamiento | GE2E softmax |
| Scoring de verificacion | similitud coseno |
| Dominio de entrenamiento | universal |
| Frontend de audio | log-mel de 80 dimensiones a 16.000 Hz + VAD por energia + CMVN |
| Datasets declarados | librispeech_asr, cnceleb, voxceleb |
| Metricas declaradas | EER, minDCF, ROC-AUC |
| Pipeline | audio-classification |
| Biblioteca | flaxspeaker |
| Tamano del repositorio | 0,0 GB |

## Arquitectura y entrenamiento

El encoder usa un backbone Mamba, es decir, un modelo de espacio de estados con mecanismo de seleccion dependiente de la entrada: los parametros de transicion del SSM se calculan dinamicamente a partir del fotograma acustico, lo que permite filtrar informacion relevante a lo largo del eje temporal con un coste de computo lineal respecto a la longitud de la secuencia. Sobre la secuencia de estados se aplica un pooling temporal atento (ASP), que agrega la informacion en un unico vector de 192 dimensiones pesando cada fotograma. La verificacion se realiza con similitud coseno y el entrenamiento usa la perdida GE2E softmax, que optimiza directamente el espacio de embeddings para que las utterances del mismo hablante queden cerca y las de hablantes distintos, lejos. El frontend es un extractor compatible con `WhisperFeatureExtractor` que produce log-mel de 80 dimensiones a 16 kHz, con VAD por energia y normalizacion CMVN.

La model card no detalla el numero de horas de audio, la composicion exacta del dataset ni el procedimiento de optimizacion mas alla de la perdida y el dominio ("universal"). Los datasets declarados son LibriSpeech (ingles leido), CN-Celeb (chino multigenero) y VoxCeleb (habla in-the-wild). No se menciona RLHF ni DPO, algo esperable en un modelo discriminativo de embeddings y no generativo. La innovacion tecnica destacable es la propia combinacion: sustituir el clasico backbone TDNN/ResNet por un SSM de muy baja capacidad y mantener un esquema GE2E con pooling atento, lo que da un modelo de ~1M de parametros en lugar de las decenas de millones habituales en este tipo de sistemas.

## Capacidades

- Extraccion de embeddings de identidad de hablante de 192 dimensiones a partir de un fichero de audio.
- Verificacion de hablante uno a uno (enrolamiento y prueba) mediante scoring por similitud coseno.
- Verificacion multi-utterance: la model card reporta protocolos de 3 utterances de enrolamiento, con mejora sistematica del EER respecto al caso de 1 utterance.
- Identificacion y clasificacion de hablantes, expuesta a traves del pipeline `audio-classification`.
- Funcionamiento multi-dominio: evaluado en ingles leido, chino multigenero y audio in-the-wild de celebridades, con un dominio de entrenamiento declarado como "universal".
- Entrada de audio a 16 kHz con frontend log-mel de 80 dimensiones, VAD por energia y CMVN integrados.
- API Python de alto nivel (`load_pretrained`, `extract_embedding`, `verify`) y script de inferencia por linea de comandos (`scripts/inference.py`).
- Serializacion en dos formatos: safetensors y msgpack nativo de Flax.

No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, tool calling, function calling, uso como agente, modo de pensamiento ni capacidades de audio generativas. Es un modelo puramente discriminativo de audio.

## Casos de uso

- Control de acceso por voz en dispositivos con recursos limitados: con ~1M de parametros, el modelo se ejecuta en CPU o en microcontroladores con suficiente RAM, de modo que la verificacion de identidad puede hacerse localmente sin enviar audio a la nube, lo que reduce latencia y mejora la privacidad.
- Antifraude en atencion telefonica: enrolar la voz del cliente en el momento de alta y verificar la similitud coseno en llamadas posteriores, usando el modo de 3 utterances para reducir el EER frente al modo de una sola utterance.
- Diarizacion de reuniones y transcripciones: extraer embeddings por segmento y agruparlos por similitud coseno para etiquetar quien habla en cada tramo, alimentando despues un sistema de ASR que ya tenga separacion de fuentes.
- Autenticacion pasiva continua en aplicaciones moviles: extraer embeddings de fragmentos cortos de microfono durante el uso normal de la aplicacion y comparar contra el perfil enrolado para detectar suplantacion o uso por terceros.
- Segmentacion previa a pipelines de reconocimiento de voz: usar el score de similitud para separar zonas de audio con distintos hablantes antes de enviar los fragmentos a un motor de transcripcion, evitando mezclar voces en un mismo segmento.
- Personalizacion de asistentes de voz: mantener un perfil de embedding por usuario y adaptar respuestas, historial o permisos en funcion de quien esta hablando, con coste despreciable de almacenamiento (192 valores por perfil).
- Investigacion y reproduccion de resultados: al ser una implementacion abierta en JAX/Flax de GE2E, Dr-Vectors, Conformer-ATP y PFAS, sirve como base reproducible para comparar variantes de backbone, pooling y funcion de perdida sin depender de infraestructura propietaria.
- Verificacion de locutor en archivos de archivo historico: dado que el modelo es muy ligero, se puede ejecutar en lote sobre catalogos completos de audio para agrupar grabaciones por hablante antes de una revision manual.

## Benchmarks y rendimiento

Resultados de verificacion con 1 utterance, extraidos de `eval_results.json` de la model card:

| Particion | Trials | EER (%) | IC bootstrap 95% (%) | minDCF@0.01 | minDCF@0.10 | ROC-AUC |
|---|---|---|---|---|---|---|
| LibriSpeech (ingles leido) | 3.000 | 14,20 | [12,77; 15,40] | 0,9313 | 0,6660 | 0,9313 |
| CN-Celeb2 (chino multigenero) | 3.000 | 23,20 | [21,63; 24,70] | 0,9780 | 0,9133 | 0,8515 |
| VoxCeleb1 (in-the-wild) | 2.000 | 23,75 | [21,72; 25,40] | 0,9620 | 0,8620 | 0,8694 |
| Universal agrupado (3 dominios) | 8.000 | 20,41 | [19,64; 21,33] | 0,9805 | 0,8280 | 0,8846 |
| Universal macro-media (3 dominios) | 8.000 | 20,38 | no disponible | 0,9571 | 0,8138 | 0,8841 |

Resultados de verificacion con 3 utterances de enrolamiento:

| Particion | Trials | EER 3-utt (%) | IC bootstrap 95% (%) | minDCF@0.01 | ROC-AUC |
|---|---|---|---|---|---|
| LibriSpeech (3-utt) | 1.000 | 9,50 | [7,60; 11,40] | 0,5500 | 0,9666 |
| CN-Celeb2 (3-utt) | 1.000 | 18,50 | [16,00; 20,70] | 0,9040 | 0,8974 |
| VoxCeleb1 (3-utt) | 1.000 | 17,70 | [15,20; 20,00] | 0,9220 | 0,9117 |
| Universal agrupado (3-utt) | 3.000 | 16,07 | [14,82; 17,38] | 0,9067 | 0,9231 |
| Universal macro-media (3-utt) | 3.000 | 15,23 | no disponible | 0,7920 | 0,9252 |

Nota editorial: en la tabla de 1 utterance, el valor de minDCF@0.01 para LibriSpeech (0,9313) coincide exactamente con el ROC-AUC de la misma fila; se reproduce tal cual figura en la fuente, sin corregirlo. No se han publicado en la informacion disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.), que en cualquier caso no aplican a un modelo discriminativo de audio.

## Requisitos de hardware

- VRAM estimada: con 1.028.672 parametros, el modelo ocupa aproximadamente 4 MB en fp32 y unos 2 MB en fp16; el consumo real lo domina la activacion del encoder y el bucle de inferencia de JAX, no los pesos.
- GPU recomendadas: cualquier GPU es suficiente; no se requiere memoria alta de VRAM. Modelos como NVIDIA A100, H100 o RTX 4090 estan muy sobredimensionados para esta carga.
- GPU consumer: si, cabe en cualquier GPU consumer e incluso en graficas integradas. Tambien se puede ejecutar exclusivamente en CPU.
- Opciones de despliegue: la via soportada es la libreria `flaxspeaker` (JAX/Flax) mediante `load_pretrained` o el script `scripts/inference.py`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje generativos y no a este tipo de encoder. No se publican pesos en formato GGUF ni ONNX.
- Latencia y throughput: no disponible. No se aportan mediciones de RTF, latencia por utterance ni throughput por lote.

## Comparativa con modelos similares

No se dispone de resultados comparables medidos sobre un protocolo comun en la informacion proporcionada, por lo que la comparacion se limita a caracteristicas estructurales. Los recuentos de parametros de las alternativas son cifras aproximadas de la literatura publica y no se han verificado en esta ficha.

| Modelo | Familia | Parametros (aprox.) | Embedding | Licencia | Datos de rendimiento comparables |
|---|---|---|---|---|---|
| univ_mamba_small_ge2e | Mamba (SSM) + ASP, GE2E softmax | 1,03 M | 192 | Apache 2.0 | EER 14,20%-23,75% (1-utt) en las tres particiones de la model card |
| ECAPA-TDNN | TDNN con bloques Res2Net y atencion de canal | ~20 M | 192 | depende de la implementacion | no disponible en la informacion proporcionada |
| x-vector (TDNN clasico) | TDNN con pooling estadistico | ~4-5 M | 512 | depende de la implementacion | no disponible en la informacion proporcionada |
| WavLM + ECAPA | Transformer preentrenado con enmascaramiento + cabecera de hablante | ~317 M (solo WavLM-Large) | 256-512 | MIT (WavLM) | no disponible en la informacion proporcionada |

La diferencia clave frente a estas alternativas es el orden de magnitud en numero de parametros: `univ_mamba_small_ge2e` es entre uno y dos ordenes de magnitud mas pequeno, lo que se traduce en un coste de inferencia muy inferior y en un EER claramente mas alto. No hay datos en la informacion disponible que permitan afirmar una equivalencia o superioridad frente a ninguno de estos sistemas.

## Limitaciones y advertencias

- Tasas de error elevadas para produccion: el mejor EER de 1 utterance es 14,20% (LibriSpeech) y el peor, 23,75% (VoxCeleb1). Incluso en el mejor caso, con 3 utterances de enrolamiento, el EER baja solo hasta 9,50%. Son valores muy superiores a los de los sistemas de verificacion de hablante habituales en entornos reales.
- Fuerte dependencia del dominio: el rendimiento cae de forma notable al pasar de habla leida en ingles (LibriSpeech) a habla multigenero en chino (CN-Celeb2) o audio in-the-wild (VoxCeleb1). No hay garantia de comportamiento en acentos, idiomas, codigos o condiciones acusticas no representadas.
- No es un modelo de lenguaje: no genera texto, no razona, no ejecuta codigo ni soporta tool calling, function calling o flujos de agente. Cualquier caso de uso debe construirse alrededor del embedding y del score coseno.
- Sin campo de idiomas declarado: la ficha de HuggingFace no especifica idiomas soportados. El modelo es acustico, pero la cobertura linguistica efectiva depende de los datos de entrenamiento, que no se detallan en composicion ni en horas.
- Reproduccion no oficial: la propia model card advierte de que no es un producto oficial de Google y que los experimentos de los papers de referencia (GE2E, Dr-Vectors, Conformer-ATP, PFAS) se realizaron con infraestructura y datos internos propietarios. Los resultados publicados en esos papers no son atribuibles a este checkpoint.
- Riesgo de falso positivo en verificacion biometrica: un EER del 14%-24% implica que una fraccion relevante de impostores seria aceptada con el umbral estandar. Para cualquier uso de seguridad es imprescindible calibrar el umbral de coseno sobre datos propios y combinar con otros factores.
- Implicaciones legales: los embeddings de voz son datos biometricos y su tratamiento esta sujeto al RGPD en la Union Europea. Hay que prever base juridica, consentimiento, plazos de conservacion y evaluacion de impacto.
- Ausencia de validacion por la comunidad: 0 descargas y 0 likes en el momento de la consulta. No hay evidencia externa de reproducibilidad ni de comportamiento en dominios distintos de los tres evaluados por el autor.
- Discrepancia en el recuento de parametros: 1.028.672 en safetensors frente a 1.028.674 declarados como parametros del encoder. La diferencia es minima, pero conviene verificarla contra el `config.json` antes de dimensionar un despliegue.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026-10-15) son posteriores a la fecha habitual de consulta y estan separadas por un segundo, lo que sugiere una carga automatizada. Conviene no interpretarlas como una fecha de publicacion fiable.
- Repositorio practicamente vacio en tamano (0,0 GB) y sin documentacion en castellano: toda la model card esta en ingles.
- Licencia: Apache 2.0 permite uso comercial y modificacion, e incluye una clausula de concesion de patentes. No obstante, al ser una reproduccion de metodos descritos en publicaciones de terceros, conviene revisar el estado de propiedad intelectual antes de explotarlo comercialmente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wq2012/univ_mamba_small_ge2e
- Coleccion FlaxSpeaker en HuggingFace: https://huggingface.co/collections/wq2012/flaxspeaker-6ad02d999a4180c794870595
- Repositorio GitHub de FlaxSpeaker: https://github.com/wq2012/FlaxSpeaker
- Paquete en PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E, "Generalized End-to-End Loss for Speaker Verification": https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors, "Decision Residual Networks and an Improved Loss for Speaker Recognition": https://arxiv.org/abs/2104.01989
- Paper Conformer-ATP, "Attentive Temporal Pooling for Conformer-based Streaming Language Identification in Long-form Speech": https://arxiv.org/abs/2202.12163
- Paper PFAS, "Parameter-Free Attentive Scoring for Speaker Verification": https://arxiv.org/abs/2203.05642
- Articulo sobre la arquitectura Mamba en Wikipedia: https://en.wikipedia.org/wiki/Mamba_(deep_learning_architecture)
