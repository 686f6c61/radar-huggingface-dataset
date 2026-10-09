# UIDUser-NSB/Qwen3-ASR-Sorani-MLX

## Resumen

Qwen3-ASR-Sorani-MLX es una conversion al formato MLX de Apple del modelo rzgar/qwen3-asr-sorani-kurdish-ckb-v1, un ajuste fino de Qwen/Qwen3-ASR-1.7B especializado en reconocimiento automatico del habla (ASR) en sorani (kurdo central, codigo ISO ckb). Lo publica el usuario UIDUser-NSB y su unico aporte es el cambio de formato y la cuantizacion: los pesos del modelo de lenguaje se comprimen de 16 a 6 bits con cuantizacion afin en grupos de 64, mientras que el codificador de audio se mantiene a precision completa. El resultado pasa de 4,09 GB a 2,05 GB manteniendo una tasa de error de palabra (WER) practicamente identica.

El modelo cuenta con 2.038.052.480 parametros (aproximadamente 2,04 mil millones) y esta pensado para ejecucion en dispositivo ("on device") sobre silicio de Apple: Mac, iPhone y iPad, a traves de la libreria mlx-audio. Incluye puntuacion en la salida y se distribuye bajo licencia Apache 2.0, la misma del modelo original.

Su relevancia actual radica en dos factores. Por un lado, cubre una lengua con muy pocos recursos ASR publicos, el sorani, con un modelo compacto que cabe en memoria unificada de equipos de consumo. Por otro lado, demuestra que la cuantizacion a 6 bits es el punto de equilibrio para este idioma: por debajo de ese umbral la ortografia sorani se degrada de forma severa (a 4 bits el WER sube al 83,2%). Es, por tanto, una ficha interesante para quienes necesitan transcripcion kurdo central sin depender de la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de audio a texto (codificador de audio + modelo de lenguaje Qwen3-ASR); pesos del LLM cuantizados, codificador sin cuantizar |
| Parametros totales | 2.038.052.480 (aprox. 2,04 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 6 bits (cuantizacion afin, tamano de grupo 64) para el modelo de lenguaje; codificador de audio a precision completa |
| Idiomas soportados | sorani / kurdo central (ckb) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-ASR-1.7B: un sistema de reconocimiento automatico del habla que combina un codificador de audio con un modelo de lenguaje de la familia Qwen3, encargado de generar la transcripcion con puntuacion. Sobre esa base, el autor rzgar realizo un ajuste fino supervisado especifico para sorani (kurdo central) con el prompt de sistema orientado a transcripcion con ortografia sorani perfecta y a la normalizacion de prestamos persas y arabes a su forma escrita estandar. No se dispone de informacion sobre el volumen de tokens de audio utilizados, la composicion exacta del dataset de ajuste ni si se aplicaron tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada.

La innovacion de esta ficha concreta es la conversion de formato y compresion. La conversion se realizo con mlx-audio 0.5.8 mediante el comando `python -m mlx_audio.convert --hf-path <origen> -q --q-bits 6 --q-group-size 64`, partiendo de la revision `d71490a623113b4b069ac07cfc85b409389dde4c` del modelo original. La cuantizacion se aplico solo al modelo de lenguaje, dejando intacto el codificador de audio, una decision que explica por que la degradacion de WER es tan reducida respecto al modelo en 16 bits.

## Capacidades

- Reconocimiento automatico del habla (audio a texto) en sorani o kurdo central (ckb), con salida puntuada.
- Transcripcion de audio con ortografia sorani, incluyendo normalizacion de prestamos lexicos del persa y del arabe a su forma escrita estandar cuando se usa el prompt de sistema original.
- Ejecucion en dispositivo sobre silicio de Apple (Mac, iPhone, iPad) via mlx-audio (Python) o mlx-audio-swift.
- Buen rendimiento en sorani estandar y formal: noticias, audiolibros y discursos.
- Procesamiento por fragmentos: se recomienda transcribir grabaciones largas en bloques de unos 30 segundos.
- Decodificacion greedy con temperatura 0.0 en las pruebas publicadas.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio como entrada de otros tipos. No disponible.

## Casos de uso

- Transcripcion de archivos de audio en sorani para medios de comunicacion: radios y televisiones kurdo-parlantes pueden convertir boletines, entrevistas y programas informativos en texto editable. El modelo rinde especialmente bien en registro formal y con locucion clara, que es el tipo de audio que domina este sector.
- Subtitulado de videos y material divulgativo: gracias a que la salida incluye puntuacion, el texto generado puede dividirse en subtitulos legibles sin post-proceso manual intensivo.
- Archivado y busqueda de audio historico: digitalizacion de cintas y grabaciones de discursos en sorani a texto indexable, ejecutando el modelo localmente para no tener que subir material sensible o con derechos a servicios en la nube.
- Asistentes de voz y dictado en aplicaciones para kurdo central: al ocupar 2,05 GB y correr en MLX sobre Apple silicon, puede integrarse como motor de dictado en aplicaciones de escritorio o moviles de la plataforma Apple sin conexion a internet.
- Herramientas de accesibilidad: generacion de transcripciones en directo para personas con discapacidad auditiva en entornos kurdo-parlantes, desplegando el modelo en un Mac local para baja latencia y sin dependencia de red.
- Investigacion linguistica y construccion de corpus: transcripcion masiva de grabaciones de campo para crear corpus anotados de sorani, con la ventaja de poder ejecutar el proceso por lotes en un portatil Apple.
- Normalizacion y limpieza de prestamos: al usar el prompt de sistema original, el modelo reescribe prestamos persas y arabes en su forma sorani estandar, lo que facilita la homogeneizacion ortografica de textos ya transcritos por otras fuentes.

## Benchmarks y rendimiento

Los unicos datos publicados corresponden a la tasa de error de palabra (WER) y de caracter (CER) sobre 30 fragmentos del conjunto de prueba FLEURS en sorani, ejecutados en un Mac con MLX y decodificacion greedy. Menor es mejor:

| Version | Tamano | WER | CER |
|---|---|---|---|
| Original (16 bits) | 4,09 GB | 39,5 % | 10,0 % |
| 8 bits | 2,48 GB | 38,5 % | 9,7 % |
| 6 bits (este modelo) | 2,05 GB | 39,0 % | 9,9 % |
| 5 bits | 1,83 GB | 42,3 % | 10,8 % |
| 4 bits | 1,60 GB | 83,2 % | 29,9 % |

No se han publicado resultados comparativos con otros modelos ASR (Whisper, etc.) en la informacion disponible. Tampoco hay datos de MMLU, HumanEval o GSM8K, que no aplican a un modelo de reconocimiento del habla.

## Requisitos de hardware

- El modelo esta en formato MLX, por lo que requiere silicio de Apple (serie M). No es ejecutable de forma nativa en GPU NVIDIA o AMD sin conversion previa a otro formato.
- Los pesos ocupan 2,05 GB en disco y en memoria. Con el resto de estructuras del runtime y buffers de audio, conviene reservar del orden de 3 a 4 GB de memoria unificada.
- Cabe holgadamente en cualquier Mac con chip de la serie M (M1 en adelante) con 8 GB de RAM o mas; tambien en iPhone y iPad compatibles con MLX.
- GPU recomendadas: al ser MLX, cualquier chip Apple M1/M2/M3/M4 con GPU integrada. No aplica A100, H100 ni RTX 4090 para este formato.
- Despliegue: mlx-audio (Python) o mlx-audio-swift para entornos Apple. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para esta version concreta.
- Latencia y throughput: no disponibles. El autor indica unicamente que las grabaciones largas se transcriban en fragmentos de unos 30 segundos para obtener mejores resultados.

## Comparativa con modelos similares

No se dispone de datos de rendimiento medidos de modelos alternativos en sorani dentro de la informacion proporcionada, por lo que la comparacion de calidad no es posible. A continuacion se contrastan solo caracteristicas objetivas:

| Modelo | Parametros | Idiomas | Formato | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Qwen3-ASR-Sorani-MLX (este) | 2,04 B | ckb (sorani) | MLX safetensors | 6 bits (LLM) | Apache 2.0 |
| rzgar/qwen3-asr-sorani-kurdish-ckb-v1 | no disponible | ckb (sorani) | safetensors (formato original) | 16 bits | Apache 2.0 |
| Qwen/Qwen3-ASR-1.7B | no disponible | multilingue (no detallado) | safetensors | 16 bits | no disponible |

Valores de WER comparativos con Whisper u otros sistemas ASR: no disponibles.

## Limitaciones y advertencias

- WER elevado incluso en la mejor configuracion: 39,0 % sobre FLEURS en sorani. Es un modelo util para transcripcion asistida, pero no para transcripcion automatica sin revision en contextos donde la exactitud sea critica.
- Degradacion severa por debajo de 6 bits: a 4 bits el WER se dispara al 83,2 % y el modelo escribe letras sorani (ە, ێ, ۆ) con formas arabes o persas. No se debe usar cuantizacion de 4 bits con este modelo.
- Rendimiento limitado en dialectos regionales marcados y conversacion rapida; el propio autor advierte de ello. Solo se ha probado sobre voz leida de FLEURS, por lo que conversacion, dialectos y audio con ruido pueden dar resultados distintos.
- Cobertura de un unico idioma (ckb). No se documentan capacidades multilingues adicionales.
- Riesgo de alucinacion inherente a los modelos de lenguaje de decodificacion autorregresiva, especialmente en tramos de audio poco claros o silencios.
- La calidad depende del uso del prompt de sistema con el que se ajusto el modelo; omitirlo puede empeorar la ortografia sorani.
- Longitud de contexto no disponible; se recomienda trocear el audio en bloques de unos 30 segundos.
- Licencia Apache 2.0, que permite uso comercial, pero el repositorio no incluye pesos originales ni garantias del autor del ajuste fino; conviene verificar la licencia de Qwen/Qwen3-ASR-1.7B si se redistribuye.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion comunitaria independiente de esta conversion.
- Dependencia de hardware: sin chips Apple no es desplegable en este formato.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/UIDUser-NSB/Qwen3-ASR-Sorani-MLX
- Modelo base del ajuste fino: https://huggingface.co/rzgar/qwen3-asr-sorani-kurdish-ckb-v1
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Libreria de conversion MLX: https://github.com/ml-explore/mlx
- Runtime mlx-audio (Python): https://github.com/Blaizzy/mlx-audio
- Runtime mlx-audio-swift: https://github.com/Blaizzy/mlx-audio-swift

No se han encontrado en la busqueda web enlaces relevantes adicionales (paper, blog o demo) sobre este modelo.
