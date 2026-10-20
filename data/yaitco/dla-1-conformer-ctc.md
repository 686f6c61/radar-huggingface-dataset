# YaItco/DLA-1-Conformer-CTC

## Resumen

DLA-1-Conformer-CTC es un modelo de reconocimiento automático del habla (ASR) en inglés basado en un encoder Conformer entrenado con función de pérdida CTC sobre LibriSpeech. Lo publica el autor independiente YaItco como artefacto final de inferencia del proyecto DLA-1, un trabajo personal de formación en reconocimiento de voz. El checkpoint seleccionado corresponde a la época 92 de la etapa `conformer_bpe_ls960_night_b16_108k_cosine_lr1e5_v1`, tras cuatro fases de entrenamiento incremental (100 h, 460 h, 960 h y continuación sobre 960 h).

Técnicamente es un modelo compacto: 16 bloques Conformer, dimensión oculta 144, 4 cabezas de atención, factor de expansión 4 en las capas feed-forward y kernel de convolución 31. Trabaja sobre features log-mel de 128 canales a 16 kHz (ventana de 25 ms, salto de 10 ms) y emite tokens de un vocabulario SentencePiece BPE de solo 256 unidades, con el token blank de CTC en la posición 0. La decodificación final combina `pyctcdecode` con un modelo de lenguaje KenLM de 3-gramas podado de LibriSpeech (beam 50, alpha 0,8, beta 2,0), una pieza que resulta determinante en los resultados.

Su relevancia es acotada pero clara: no compite con los sistemas ASR actuales, sino que sirve como referencia reproducible de un pipeline CTC completo y de bajo coste (modelo, tokenizador, LM, logs de entrenamiento y métricas) para experimentación, docencia y comparación de estrategias de decodificación. Con el LM alcanza un WER de 11,77 % en test-clean y 26,16 % en test-other; sin LM, el WER sube a 19,78 % y 37,35 % respectivamente, lo que evidencia la dependencia del decodificador léxico.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer encoder (transformer + convolución) con cabeza CTC; 16 bloques, hidden 144, 4 cabezas, FF x4, kernel convolucional 31, dropout 0,1 |
| Parametros totales | No disponible (no publicado por el autor). Estimación a partir de la configuración declarada: ~8-9 M de parámetros (16 bloques de ~0,5 M cada uno); es una estimación, no un dato oficial |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de un LLM: atención completa sobre cada utterance, sin ventana fija declarada ni duración máxima de audio especificada |
| Tipos de cuantizacion | No disponible. Solo se distribuyen pesos en punto flotante PyTorch; no se publican versiones int8, GGUF ni ONNX |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible (la model card y los metadatos de HuggingFace no la especifican) |
| Formato de pesos | `.pth` (state dict de PyTorch) dentro de `final_ctc.zip`; incluye tokenizador SentencePiece (`bpe_256.model`) y LM KenLM en ARPA comprimido (`.arpa.gz`) |
| Tarea | Automatic speech recognition (CTC) |
| Entrada de audio | 128 canales log-mel, 16 kHz, ventana 25 ms, salto 10 ms |
| Vocabulario de salida | SentencePiece BPE de 256 tokens, blank CTC en ID 0 |
| Decodificador | Argmax, beam search propio o `pyctcdecode` + KenLM 3-gramas podado (beam 50, alpha 0,8, beta 2,0) |
| Tamaño del repo | 0,1 GB (incluye el ZIP con modelo, LM, logs y métricas) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Conformer, que intercala módulos de auto-atención multi-cabeza con convoluciones depthwise dentro de cada bloque, combinando así el modelado global de dependencias del transformer con la captura de patrones locales del habla. La configuración es deliberadamente pequeña: 16 bloques con 144 dimensiones ocultas y 4 cabezas, factor de expansión 4 en las redes feed-forward, kernel de 31 en el módulo convolucional y dropout de 0,1. La entrada es un espectrograma log-mel de 128 canales extraído con ventanas de 25 ms y salto de 10 ms a 16 kHz. El vocabulario es un SentencePiece BPE de 256 tokens entrenado sobre el corpus, con el índice 0 reservado para el blank de CTC; el modelo entrena con CTC puro, sin capa de lenguaje interna, y el sesgo lingüístico se introduce en la decodificación mediante KenLM.

El entrenamiento se organizó en cuatro etapas encadenadas, cada una partiendo del mejor checkpoint de la anterior: LibriSpeech 100 h con BPE-256 (presupuesto de 25k pasos, época 25 seleccionada), LibriSpeech 460 h (50k pasos, época 48), LibriSpeech 960 h (50k pasos, época 47) y una continuación sobre 960 h con 108k pasos (época 92, el checkpoint publicado). Los logs de las cuatro fases están enlazados en Comet y se incluyen en el paquete de recursos junto con las configuraciones. No se documenta el uso de RLHF, DPO ni técnicas de alineación; tampoco se especifica el número total de tokens de audio procesados ni la composición exacta del dataset más allá de LibriSpeech. El LM de 3-gramas proviene de OpenSLR 11 y se poda a 1e-7, con un script (`download_lm.py`) que prepara un vocabulario ARPA en minúsculas para la decodificación.

## Capacidades

- Transcripción de voz a texto en inglés, optimizada para habla leída (audiolibros, corpus LibriSpeech) con audio a 16 kHz.
- Decodificación CTC con tres modos: argmax, beam search propio y beam search con LM externo (`pyctcdecode` + KenLM).
- Salida a nivel de subpalabra BPE (256 tokens); requiere el tokenizador incluido para reconstruir texto.
- Pipeline de evaluación integrado: el paquete incluye `inference.py`, `calc_metrics.py`, métricas completas de dev y test en JSON y ejemplos de audio en FLAC, WAV y MP3.
- Procesamiento por lotes de un dataset en disco con estructura `audio/{id}.wav|flac|mp3` y transcripciones opcionales.
- Ejecución en CPU viable por el tamaño del modelo (no se publican medidas de latencia).
- No soporta tool calling, function calling, agentes, visión, audio de entrada más allá de ASR ni capacidades multimodales. No dispone de modo de razonamiento explícito ni salida con puntuación y mayúsculas garantizadas (el LM se prepara en minúsculas).

## Casos de uso

- Transcripción de audiolibros y pódcasts con voz leída: el modelo se entrenó sobre LibriSpeech, que procede de audiolibros, por lo que el dominio objetivo coincide con material narrado en inglés estándar y sin ruido de fondo.
- Línea base reproducible para investigación en ASR: el paquete incluye configuraciones, logs de las cuatro etapas y métricas de dev/test, lo que permite reproducir el entrenamiento y comparar variantes de decodificación con un coste computacional mínimo.
- Estudio comparado de decodificadores: al publicar resultados con argmax, beam propio, beam sin LM y beam con LM sobre los mismos test sets, sirve como banco de pruebas para cuantificar la aportación de un 3-gramas KenLM en un modelo pequeño.
- Preetiquetado de corpus de audio en inglés: generar transcripciones iniciales que luego se revisan manualmente, aceptando un WER de partida del 11-26 % que reduce el coste frente a la transcripción desde cero.
- Indexación y búsqueda por voz en local: con un peso estimado de pocas decenas de MB en FP32, puede desplegarse en CPU o en dispositivos sin GPU para indexar archivos de audio y habilitar búsqueda sobre el texto generado.
- Docencia y divulgación de pipelines ASR: ejemplo completo y autocontenido de Conformer + CTC + KenLM, con verificación de integridad por SHA256 en el manifiesto, adecuado para prácticas de laboratorio.
- Experimentos de compresión y destilación: su tamaño reducido lo convierte en alumno razonable para destilar desde un Whisper o wav2vec 2.0 de mayor tamaño, o en referencia para medir la pérdida de precisión asociada a la reducción de parámetros.
- Subtitulado offline de material con acento neutro y buena relación señal-ruido, siempre con revisión humana por la tasa de error y la ausencia de puntuación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre los conjuntos de test completos de LibriSpeech: 2.620 grabaciones de test-clean y 2.939 de test-other. CER y WER son medias por grabación.

| Decoder | test-clean CER (%) | test-clean WER (%) | test-other CER (%) | test-other WER (%) |
|---|---:|---:|---:|---:|
| Argmax | 7,07 | 19,96 | 16,48 | 37,68 |
| Beam search propio | 6,97 | 19,77 | 16,29 | 37,31 |
| Beam sin LM | 6,94 | 19,78 | 16,23 | 37,35 |
| Beam con LM | **5,06** | **11,77** | **14,09** | **26,16** |

Con LM, el WER de corpus (ediciones totales divididas por palabras de referencia totales) es de 10,28 % en test-clean y 23,18 % en test-other. Los hiperparámetros del decodificador se seleccionaron sobre datos de desarrollo. Las métricas exactas están en `resources/final/test_metrics.json` dentro del archivo publicado.

No hay en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros) por tratarse de un modelo de ASR sin capacidades de texto generales.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el modelo (estimación basada en el tamaño del repo, 0,1 GB, que incluye además el LM y los logs); el consumo dominante en ejecución es el del LM KenLM en memoria, no el de la red neuronal.
- GPU recomendadas: ninguna en particular; el modelo es ejecutable en CPU. Cualquier GPU consumer (GTX 1660, RTX 3060, RTX 4090) lo ejecuta sobradamente. A100/H100 no aportan ventaja práctica por el reducido tamaño.
- Cabe en GPU consumer: sí, en todas las del mercado actual, y también en CPU y en dispositivos de gama baja.
- Opciones de despliegue: el propio `inference.py` del proyecto (Python 3.11, PyTorch + `pyctcdecode` + KenLM) mediante `download_resources.py`; descarga directa del bundle con `hf_hub_download`. No se publican exportaciones a ONNX, TorchScript ni integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo CTC de este tipo.
- Latencia y throughput: no disponibles. El autor no publica factor de tiempo real, RTF ni métricas de velocidad de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Idioma | Ventana / contexto | Licencia | Formato de pesos |
|---|---|---|---|---|---|
| DLA-1-Conformer-CTC (este modelo) | ~8-9 M (estimado) | Inglés | Atención completa por utterance, sin límite declarado | No disponible | `.pth` + SentencePiece + ARPA |
| OpenAI Whisper tiny | 39 M | Multilingüe (99 idiomas) | Ventana fija de 30 s, con padding | MIT | `.pt` / safetensors en conversiones |
| wav2vec 2.0 base 960h | ~95 M | Inglés | Atención completa por utterance | Apache 2.0 (según ficha en HuggingFace) | safetensors / `.bin` |
| torchaudio Conformer CTC (large) | ~118 M | Inglés | Atención completa por utterance | No verificada en esta ficha | PyTorch state dict |

La comparación de rendimiento frente a estas alternativas no se incluye porque los números de WER publicados por cada proyecto usan protocolos de decodificación distintos y no son directamente equiparables; en esta ficha no se han verificado cifras externas. Cualitativamente, el WER de 11,77 % en test-clean y 26,16 % en test-other sitúa a este modelo muy por detrás de los sistemas ASR modernos de tamaño similar o superior, lo que es coherente con su vocabulario de 256 tokens y su carácter de proyecto formativo. Su ventaja relativa es la trazabilidad total del pipeline (checkpoint, tokenizador, LM y logs incluidos) y un coste de ejecución mínimo.

## Limitaciones y advertencias

- Precisión limitada: WER de 11,77 % en test-clean y 26,16 % en test-other con LM; sin LM empeora hasta 19,78 % y 37,35 %. No es adecuado para producción con requisitos de exactitud.
- Dominio restringido: entrenado exclusivamente sobre LibriSpeech (habla leída de audiolibros en inglés). El rendimiento caerá de forma notable con habla espontánea, ruido ambiental, acentos no estadounidenses, solapamiento de hablantes o audio telefónico de banda estrecha.
- Vocabulario muy reducido: 256 tokens BPE limitan la cobertura léxica y aumentan la dependencia del LM externo para producir texto legible.
- Dependencia fuerte del LM: el 3-gramas de LibriSpeech está entrenado sobre el mismo corpus que el modelo, por lo que las cifras de test pueden no trasladarse a dominios distintos; además, el LM es un componente adicional que hay que desplegar y versionar.
- Sin puntuación ni mayúsculas declaradas: el LM se prepara en minúsculas, por lo que la salida esperada es texto plano sin formato, lo que obliga a un postprocesado para subtítulos.
- Riesgo de alucinación bajo en el sentido de invención libre (CTC no genera texto nuevo), pero el beam search con LM puede introducir correcciones léxicas incorrectas y sustituir palabras por términos frecuentes del corpus.
- Sesgos no documentados: no se publica ningún análisis de sesgo por acento, género, edad o procedencia. LibriSpeech es un corpus de audiolibros de dominio público con hablantes mayoritariamente estadounidenses.
- Licencia no especificada: la ausencia de licencia explícita impide asumir derechos de uso comercial; es un bloqueo legal objetivo antes de cualquier despliegue en producción.
- Sin validación de la comunidad: el repositorio registra 0 descargas y 0 me gusta en el momento de la consulta, y no se han encontrado evaluaciones independientes.
- Restricciones de idioma: solo inglés; no hay soporte multilingüe ni cambio de idioma.
- Sin cifras de latencia ni de consumo: no se puede dimensionar un despliegue en tiempo real sin medirlo previamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YaItco/DLA-1-Conformer-CTC
- Repositorio del proyecto DLA-1: https://github.com/Yaitco/DLA-1
- LM de 3-gramas (OpenSLR 11): https://www.openslr.org/11/
- Corpus LibriSpeech (OpenSLR 12): https://www.openslr.org/12/
- Log de entrenamiento etapa 1 (LibriSpeech 100 h, BPE-256): https://www.comet.com/alex-markotenko/dla-1/j8105vjtpq76deppf6ojfitoj0qx8cc6
- Log de entrenamiento etapa 2 (LibriSpeech 460 h): https://www.comet.com/alex-markotenko/dla-1/ex9rxuuvll7sr9vzxak8u3jo7dlojifj
- Log de entrenamiento etapa 3 (LibriSpeech 960 h): https://www.comet.com/alex-markotenko/dla-1/co6r65k86r4qbcfso3nxkvcyt0tvf9cf
- Log de entrenamiento etapa 4 (960 h, continuación, 108k pasos): https://www.comet.com/alex-markotenko/dla-1/o33narhdfq45ax2dx3zrkmzw4t1f2zrc
