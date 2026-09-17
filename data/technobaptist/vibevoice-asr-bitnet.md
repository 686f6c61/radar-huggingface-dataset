# TechnoBaptist/VibeVoice-ASR-BitNet

## Resumen

VibeVoice-ASR-BitNet es una variante comprimida del modelo de reconocimiento automático de voz VibeVoice-ASR, publicada por el usuario TechnoBaptist y vinculada al repositorio microsoft/VibeASR.cpp. El objetivo declarado es ejecutar ASR multilingüe en tiempo real sobre CPUs de borde (x86 con AVX2 y ARM con NEON), sin necesidad de GPU. Para ello aplica cuantización heterogénea sobre el modelo base, reduciendo el peso de 4,62 GB en FP16 a 1,58 GB, lo que supone una compresión de 2,9×.

El sistema se compone de dos piezas: un tokenizador VAE (1,31 GB en FP16, 0,65 GB cuantizado con I8_S) y un decodificador LM (3,32 GB en FP16, 0,92 GB con I2_S y Q6_K). Según la model card, el modelo resultante alcanza un factor de tiempo real (RTF) inferior a 1 con solo tres hilos de CPU, y entre 1,6× y 2,3× más velocidad que Whisper.cpp en las mismas condiciones, con un coste de precisión moderado respecto al modelo original.

Es relevante ahora porque demuestra que un sistema ASR multilingüe con arquitectura VAE + LM puede desplegarse en hardware sin acelerador, un escenario habitual en dispositivos empotrados, portátiles modestos y servidores con CPU compartida. La licencia MIT facilita su integración comercial. No obstante, el repositorio presenta 0 descargas y 0 likes, y la model card no documenta la arquitectura interna ni los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizador VAE + decodificador LM (la model card no detalla la arquitectura interna del transformer; basada en microsoft/VibeVoice-ASR) |
| Parametros totales | 322.592.829 (dato real de los safetensors del repositorio) |
| Parametros activos | No aplica: la informacion disponible no indica que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | I8_S (tokenizador VAE), I2_S + Q6_K (decodificador LM); FP16 como referencia; formato GGUF |
| Idiomas soportados | Ingles, chino, frances, italiano, coreano, portugues y vietnamita (la model card indica "and more") |
| Licencia | MIT |
| Formato de pesos | safetensors (original, 10,7 GB) y GGUF (0,65 GB tokenizador + 0,92 GB decodificador) |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de dos componentes: un tokenizador VAE que convierte la señal de audio en una representacion latente y un decodificador LM que genera la transcripcion. El repositorio base es microsoft/VibeVoice-ASR, y la variante BitNet es un proceso de compresion posterior, no un reentrenamiento. No se especifican el numero de capas, la dimension oculta, el mecanismo de atencion ni si se emplea atencion lineal o alguna variante eficiente.

La innovacion tecnica documentada es la estrategia de cuantizacion heterogenea combinada con kernels SIMD personalizados dentro del framework ggml, con operadores fusionados para ARM y x86. El tokenizador VAE se cuantiza a I8_S (2,0× de compresion) y el decodificador LM a I2_S con las capas de embedding en Q6_K (3,6× de compresion). No se detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO; al tratarse de una variante cuantizada, se asume que hereda el entrenamiento del modelo base sin ajuste adicional, aunque esto no se confirma en la informacion proporcionada.

## Capacidades

- Reconocimiento automatico de voz multilingue en ingles, chino, frances, italiano, coreano, portugues y vietnamita.
- Transcripcion en tiempo real sobre CPU: RTF inferior a 1 a partir de 3 hilos en hardware x86 (AVX2+FMA) y ARM (NEON).
- Procesamiento de audio de al menos 20 segundos por inferencia, segun la configuracion de los benchmarks publicados.
- Ejecucion en dispositivos de borde con memoria limitada: el conjunto de pesos cuantizados ocupa 1,58 GB.
- Ejecucion sin GPU, mediante kernels SIMD personalizados en el framework ggml.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision, audio generativo ni modo de razonamiento explicito. La informacion disponible no menciona ninguna de estas capacidades.

## Casos de uso

- Transcripcion en servidores sin GPU: al requerir unicamente CPU, el modelo puede desplegarse en instancias de computacion general donde no hay aceleradores disponibles, con un consumo de memoria en torno a 2 GB para los pesos cuantizados.
- Subtitulado en directo: con un RTF de 0,77 a 3 hilos y 0,42 a 8 hilos en AMD EPYC 7V13, el modelo puede generar subtitulos casi en tiempo real para audio de 20 segundos, sin colas de procesamiento largas.
- Aplicaciones de escritorio y herramientas ofimaticas: la licencia MIT y el tamano reducido permiten integrarlo en software de dictado o actas de reunion que se ejecuta en el portatil del usuario.
- Dispositivos empotrados y de borde: en hardware ARM con NEON, el modelo permite transcripcion local en kioscos, terminales de atencion presencial o grabadoras inteligentes sin conectividad.
- Preprocesado de pipelines de voz a texto a gran escala: al ser mas rapido que Whisper.cpp (1,55×-2,28× segun hilos) y mas ligero, reduce el coste por hora de audio en procesamiento por lotes.
- Reuniones y transcripcion de habla espontanea: los resultados en AMI-ihm (21,36 % WER) y AMI-sdm (25,87 %) lo hacen viable para diarizacion y actas de reuniones en ingles, con la advertencia de la degradacion en escenarios de habla solapada.
- Prototipado e investigacion en eficiencia: sirve como referencia reproducible de cuantizacion heterogenea I2_S/I8_S/Q6_K sobre un modelo de voz, util para estudiar el compromiso entre compresion y WER.

## Benchmarks y rendimiento

### Velocidad de inferencia

Benchmark sobre AMD EPYC 7V13 (AVX2+FMA) con audio de 20 segundos. En negrita, RTF < 1 (tiempo real).

| Hilos | 1 | 2 | 3 | 4 | 6 | 8 |
|---|---|---|---|---|---|---|
| RTF | 1,98 | 1,08 | 0,77 | 0,63 | 0,49 | 0,42 |
| vs. Whisper.cpp | 2,28× | 2,12× | 1,86× | 1,86× | 1,71× | 1,55× |

### Precisión (WER %, menor es mejor)

| Benchmark | VibeVoice-ASR-7B | VibeVoice-ASR-BitNet | Parakeet | Whisper | SenseVoice | FunASR |
|---|---|---|---|---|---|---|
| MLC-EN | 7,82 | 8,25 | 8,40 | 13,57 | 12,39 | 11,36 |
| MLC-FR | 16,03 | 17,41 | — | — | — | — |
| MLC-IT | 15,67 | 17,23 | — | — | — | — |
| MLC-KO | 9,83 | 11,15 | — | — | — | — |
| MLC-PT | 22,41 | 24,87 | — | — | — | — |
| MLC-VI | 20,15 | 22,38 | — | — | — | — |
| AISHELL4 | 19,83 | 27,45 | — | — | 22,52 | 20,41 |
| AMI-ihm | 17,42 | 21,36 | 21,92 | 27,07 | 30,81 | 32,07 |
| AMI-sdm | 24,18 | 25,87 | 26,33 | 36,92 | 48,11 | 40,17 |
| AliMeeting | 36,21 | 40,58 | — | — | 38,75 | 39,27 |
| Fleurs-en | 4,73 | 5,21 | 4,09 | 3,99 | 6,84 | 4,93 |
| Fleurs-zh | 7,92 | 8,35 | — | — | 5,56 | 7,00 |
| Libri-clean | 2,17 | 2,41 | 1,49 | 1,98 | 2,78 | 1,58 |
| Libri-other | 5,84 | 6,27 | 3,13 | 3,60 | 6,81 | 4,01 |
| VoxPopuli | 4,92 | 5,18 | 5,26 | 7,19 | 8,63 | 6,46 |

No se especifican en la informacion disponible las variantes concretas de Parakeet, Whisper, SenseVoice y FunASR empleadas como referencia.

## Requisitos de hardware

- VRAM: no requiere GPU para la inferencia; el modelo esta disenado expresamente para CPU.
- Memoria RAM estimada: los pesos cuantizados suman 1,58 GB (0,65 GB el tokenizador VAE y 0,92 GB el decodificador LM). No se indica el consumo total en la model card; como referencia de planificacion, conviene reservar entre 2 y 3 GB de RAM para pesos y estados intermedios, aunque es una estimacion no confirmada por el autor.
- GPU recomendadas: no aplica. La model card no publica benchmarks en GPU ni requisitos de VRAM.
- Cabe en GPU de consumo: no es el escenario objetivo. Conceptualmente cabria en cualquier GPU con mas de 2 GB, pero no hay soporte ni cifras documentadas.
- CPU objetivo: x86 con AVX2 y FMA, y ARM con NEON. Los benchmarks se realizaron en AMD EPYC 7V13.
- Hilos: RTF de 0,77 con 3 hilos y 0,42 con 8 hilos; con 1 hilo (RTF 1,98) no alcanza tiempo real.
- Opciones de despliegue: framework ggml con GGUF, a traves del runtime microsoft/VibeASR.cpp. No se confirma compatibilidad con llama.cpp, Ollama, vLLM ni TGI; dado que incorpora kernels SIMD personalizados, es probable que requiera el runtime especifico, pero esto no se detalla en la informacion disponible.
- Latencia y throughput: RTF medido de 0,42 a 1,98 segun hilos sobre audio de 20 segundos en el hardware citado. No se publican cifras de throughput en horas de audio por hora de CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER MLC-EN | WER Libri-clean | Licencia | Formatos disponibles |
|---|---|---|---|---|---|---|
| VibeVoice-ASR-BitNet | 322,6 M (safetensors) | No disponible | 8,25 | 2,41 | MIT | GGUF y safetensors |
| VibeVoice-ASR (base) | 7 B (segun la denominacion de la tabla de resultados; no confirmado en ficha) | No disponible | 7,82 | 2,17 | No disponible | No disponible |
| Whisper (variante no especificada) | No disponible | No disponible | 13,57 | 1,98 | No disponible | No disponible |
| Parakeet | No disponible | No disponible | 8,40 | 1,49 | No disponible | No disponible |
| SenseVoice | No disponible | No disponible | 12,39 | 2,78 | No disponible | No disponible |
| FunASR | No disponible | No disponible | 11,36 | 1,58 | No disponible | No disponible |

La informacion proporcionada no incluye numero de parametros, ventana de contexto ni licencia de los modelos de comparacion. La unica comparacion cuantitativa fiable es la de WER y la de velocidad frente a Whisper.cpp.

## Limitaciones y advertencias

- Perdida de precision cuantificable: la cuantizacion degrada el WER entre 0,4 y 7,6 puntos absolutos segun el conjunto. El caso mas acusado es AISHELL4 (19,83 en el modelo base frente a 27,45 en esta variante), lo que la situa por detras de SenseVoice (22,52) y FunASR (20,41) en chino.
- Discrepancia en el recuento de parametros: los safetensors declaran 322.592.829 parametros, mientras que la model card compara contra "VibeVoice-ASR-7B". La informacion disponible no permite reconciliar ambos datos; conviene verificar la composicion real de los pesos antes de dimensionar un despliegue.
- Riesgo de alucinacion en ASR: los modelos de reconocimiento de voz pueden generar texto plausible en segmentos con silencio, ruido o solapamiento de hablantes. La model card no documenta mitigaciones ni modo de supresion.
- Escenarios de habla espontanea y solapada: los peores resultados se dan en AliMeeting (40,58) y AISHELL4 (27,45), por lo que no es recomendable para reuniones multiparticipe sin una capa de validacion posterior.
- Cobertura de idiomas asimetrica: los benchmarks publicados se concentran en ingles y chino, con resultados notablemente peores en portugues (24,87), vietnamita (22,38) y frances (17,41). No se publican resultados para todos los idiomas listados.
- Sesgos: no se documenta la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos demograficos, de acento o de variedad dialectal.
- Validacion comunitaria nula: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (17 de septiembre de 2026, segun los metadatos). No existe evidencia independiente de reproduccion de los resultados.
- Fechas y referencias no verificables: el identificador arXiv (2607.21075) y las fechas del repositorio corresponden a 2026, posteriores a la informacion disponible. Conviene tratar los enlaces al informe tecnico y al repositorio de codigo como no confirmados.
- Licencia: MIT permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright. No se imponen restricciones adicionales sobre los pesos publicados en este repositorio, aunque la licencia del modelo base microsoft/VibeVoice-ASR no se indica en la informacion disponible y deberia comprobarse antes de un uso comercial.
- Dependencia del runtime: los kernels SIMD personalizados implican que el modelo puede no ser portable a otros motores GGUF genericos.

## Enlaces

- HuggingFace: https://huggingface.co/TechnoBaptist/VibeVoice-ASR-BitNet
- Modelo base: https://huggingface.co/microsoft/VibeVoice-ASR
- Codigo: https://github.com/microsoft/VibeASR.cpp
- Informe tecnico: https://arxiv.org/abs/2607.21075
- Correo de contacto indicado en la model card: VibeVoice@microsoft.com
- Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos correspondian a otros temas y no se incluyen.
