# wozniakos10/whisper-tiny-en

## Resumen

wozniakos10/whisper-tiny-en es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny para reconocimiento automatico del habla (ASR). Lo desarrolla el usuario wozniakos10 y se publica en HuggingFace bajo licencia Apache 2.0. El entrenamiento se realizo sobre el dataset PolyAI/minds14, un corpus de conversaciones habladas en el dominio bancario (intenciones de usuario en llamadas a un servicio de atencion telefonica), usando la libreria transformers y el Trainer de HuggingFace.

El modelo base, whisper-tiny, es un transformer encoder-decoder de tipo seq2seq con 37.760.640 parametros totales (segun el archivo safetensors publicado) y unos 0,2 GB de peso en repositorio, lo que lo situa en la gama mas ligera de la familia Whisper de OpenAI. Su tamano reducido permite ejecutarlo en CPU, en dispositivos embebidos y en navegador, a cambio de una precision notablemente inferior a la de los modelos medianos y grandes de la misma familia.

La relevancia de esta ficha es doble. Por un lado, es un ejemplo tipico de ajuste fino de bajo coste para un dominio vertical concreto (intenciones bancarias). Por otro, conviene advertir que se trata de un modelo practicamente sin traccion en la comunidad: cero descargas y cero "likes" en el momento de la consulta, una model card incompleta y un unico resultado declarado por el propio autor (WER de 0,3022 sobre PolyAI/minds14, no verificado). No es, por tanto, un modelo recomendable para produccion sin una evaluacion propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (seq2seq) tipo Whisper |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos por pasada (arquitectura Whisper); no especificado en la model card |
| Tipos de cuantizacion | no disponible; el repositorio solo contiene pesos safetensors en precision completa (sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible en los metadatos; el nombre del modelo indica ajuste fino orientado a ingles sobre minds14 |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | openai/whisper-tiny |
| Dataset de ajuste fino | PolyAI/minds14 |
| Tamano del repositorio | 0,2 GB |
| Framework de entrenamiento | Transformers 5.16.1, PyTorch 2.8.0+cu128, Datasets 5.1.0, Tokenizers 0.23.3 |
| Fecha de publicacion | 13 de octubre de 2026 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper: un transformer seq2seq con encoder de audio que consume representaciones log-Mel y un decoder autoregresivo que genera tokens de texto, con tokens especiales para idioma, tarea, marcas de tiempo y control de la transcripcion. En la variante tiny, el modelo base cuenta con cuatro capas de encoder y cuatro de decoder, anchura de modelo de 384 y 6 cabezas de atencion, lo que da lugar a los aproximadamente 38 millones de parametros publicados en el archivo safetensors.

El ajuste fino se realizo durante 10 epocas con learning rate 2,5e-05, optimizador AdamW (ADAMW_TORCH_FUSED, betas 0,9/0,999, epsilon 1e-08), scheduler coseno con un 10 % de pasos de calentamiento, batch de entrenamiento y evaluacion de 16, semilla 42 y precision mixta nativa (Native AMP). No se documenta en la model card si hubo RLHF, DPO ni ninguna etapa de alineacion posterior, ni la composicion exacta del subconjunto de minds14 empleado, ni el numero de tokens o de horas de audio utilizados. La model card incluye secciones explicitas de "More information needed" en descripcion, usos previstos y datos de entrenamiento.

Un detalle llamativo es que el nombre declarado en el model-index es "whisper-tiny-finetuned-fleurs-en", mientras que el dataset evaluado es PolyAI/minds14. Esta incoherencia interna no se explica en la documentacion y sugiere un reciclado parcial de una plantilla o de un experimento anterior; no se aportan resultados sobre FLEURS.

## Capacidades

- Transcripcion de voz a texto en ingles para audio de dominio conversacional (llamadas, consultas habladas), con ventanas de hasta 30 segundos por pasada.
- Reconocimiento de habla en el dominio bancario de intenciones, que es el dominio del dataset PolyAI/minds14 empleado en el ajuste.
- Generacion de marcas de tiempo a nivel de segmento, heredadas del formato de salida de Whisper.
- Inferencia ligera en CPU y en hardware de bajos recursos, gracias a sus 37,76 millones de parametros.
- Punto de partida para ajustes finos adicionales en otros dominios o idiomas con coste computacional minimo.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo "thinking", vision ni procesamiento de audio mas alla de la transcripcion.
- Capacidad multilingue: no disponible; el modelo base whisper-tiny es multilingue, pero el ajuste y la nomenclatura apuntan a un uso en ingles y no se declaran idiomas soportados.

## Casos de uso

- Clasificacion de intenciones en centralita telefonica (IVR): el modelo transcribe la consulta del cliente y un clasificador posterior etiqueta la intencion (consulta de saldo, bloqueo de tarjeta, disputa de cargo). Es exactamente el dominio de minds14, por lo que el ajuste fino esta alineado con la tarea, aunque el WER de 0,30 limita la precision del pipeline completo.
- Analitica de calidad en contact center: transcripcion masiva de grabaciones para medir tiempos de espera percibidos, deteccion de motivos de llamada y generacion de resumentes por parte de otro modelo. El coste por hora de audio es muy bajo al caber en CPU.
- Subtitulado offline de video de bajo presupuesto: generacion de subtitulos en ingles con marcas de tiempo, ejecutable en un portatil sin GPU. La calidad sera inferior a la de whisper-small o whisper-medium.
- Transcripcion en el navegador o en el borde (edge): el modelo se puede convertir a formato GGUF u ONNX y ejecutarse en cliente con WebAssembly o llama.cpp, evitando enviar audio a un servidor. Util en aplicaciones con requisitos de privacidad.
- Prototipado rapido de productos de voz: sirve como linea base barata antes de decidir si se escala a whisper-base, whisper-small o a una API comercial, permitiendo validar la interfaz y el flujo de producto con coste casi nulo.
- Generacion de datos sinteticos y aumentacion de datasets: transcribir audio no etiquetado a gran escala para crear corpus de texto de dominio especifico que alimenten otros modelos. Aqui un WER alto es tolerable si se aplica filtrado o correccion posterior.
- Investigacion academica y docencia: es un ejemplo reproducible y de bajo coste de fine-tuning con el Trainer de HuggingFace sobre un dataset publico pequeno, util para practicas de ajuste fino de ASR.
- Asistente de voz en dispositivo embebido (Raspberry Pi, movil): activacion por palabra clave y transcripcion de comandos cortos en ingles, siempre que no se exija una precision alta.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index y en la model card. El valor figura como no verificado y no se han publicado comparaciones con otros modelos en la informacion disponible.

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | PolyAI/minds14 | WER | 0,3022 (no verificado) |
| Automatic Speech Recognition | PolyAI/minds14 | WER orto | 0,3004 |
| Evaluacion (conjunto de validacion) | PolyAI/minds14 | Loss | 0,5812 |

Evolucion durante el entrenamiento (datos de la model card):

| Epoca | Paso | Training loss | Validation loss | WER orto | WER |
|---|---|---|---|---|---|
| 1,0 | 28 | 0,6958 | 0,5557 | 0,3930 | 0,3878 |
| 2,0 | 56 | 0,4037 | 0,4946 | 0,3171 | 0,3176 |
| 3,0 | 84 | 0,1433 | 0,5048 | 0,3041 | 0,3028 |
| 4,0 | 112 | 0,0384 | 0,5354 | 0,3035 | 0,3046 |
| 5,0 | 140 | 0,0227 | 0,5596 | 0,3171 | 0,3200 |
| 6,0 | 168 | 0,0077 | 0,5725 | 0,3183 | 0,3188 |
| 7,0 | 196 | 0,0028 | 0,5812 | 0,3004 | 0,3022 |
| 8,0 | 224 | 0,0016 | 0,5847 | 0,3171 | 0,3200 |
| 9,0 | 252 | 0,0016 | 0,5862 | 0,3196 | 0,3223 |
| 10,0 | 280 | 0,0015 | 0,5860 | 0,3196 | 0,3223 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de ASR generalistas (LibriSpeech, Common Voice, FLEURS) en la informacion disponible, pese a que el identificador interno del model-index menciona FLEURS.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,15 GB en fp32, 0,08 GB en fp16/bf16 y 0,04 GB en int8, calculado a partir de los 37,76 millones de parametros. Hay que sumar el coste de activaciones y del buffer de audio, pero el total se mantiene muy por debajo de 1 GB.
- Cabe holgadamente en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU integradas con suficiente memoria compartida.
- Ejecucion en CPU perfectamente viable: el modelo esta pensado para funcionar sin acelerador en portatiles y dispositivos embebidos (Raspberry Pi 4/5, mini-PC x86). Las GPU de datacenter (A100, H100, L40S) no aportan ventaja practica para este tamano, salvo en escenarios de transcripcion masiva en lote donde interese maximizar el throughput agregado.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), vLLM no es aplicable en su forma habitual porque Whisper no es un modelo causal de solo decodificador, llama.cpp y whisper.cpp con pesos convertidos a GGUF, faster-whisper (CTranslate2) para acelerar la inferencia, ONNX Runtime, TGI para ASR en versiones recientes y Ollama si se dispone de un paquete GGUF del modelo.
- Latencia y throughput: no se han publicado mediciones en la informacion disponible. Como referencia cualitativa, whisper-tiny es la variante mas rapida de la familia y suele operar varias veces por encima del tiempo real en CPU moderna, pero este dato no esta respaldado por cifras publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Ajuste especifico | Licencia | Disponibilidad | WER declarado |
|---|---|---|---|---|---|---|
| wozniakos10/whisper-tiny-en | 37.760.640 | 30 s por ventana (arquitectura Whisper) | Si, sobre PolyAI/minds14 | Apache 2.0 | HuggingFace, 0 descargas | 0,3022 en minds14 (no verificado) |
| openai/whisper-tiny | ~39 millones | 30 s por ventana | No, modelo multilingue generico | Apache 2.0 | HuggingFace, ampliamente usado | no disponible en esta informacion |
| openai/whisper-base | ~74 millones | 30 s por ventana | No, modelo multilingue generico | Apache 2.0 | HuggingFace, ampliamente usado | no disponible en esta informacion |
| openai/whisper-small | ~244 millones | 30 s por ventana | No, modelo multilingue generico | Apache 2.0 | HuggingFace, ampliamente usado | no disponible en esta informacion |

No se dispone de datos comparativos de WER entre estas alternativas en la informacion proporcionada. La comparacion se limita, por tanto, a parametros, licencia y disponibilidad. En terminos practicos, whisper-base y whisper-small ofrecen mayor precision a cambio de mas memoria y latencia, y cualquier decision entre ellos deberia basarse en una evaluacion sobre el dominio objetivo.

## Limitaciones y advertencias

- El unico resultado de rendimiento esta declarado por el propio autor y marcado como no verificado. No hay evaluacion independiente ni reproduccion por terceros.
- El WER de 0,3022 sobre minds14 implica que aproximadamente una de cada tres palabras se transcribe de forma incorrecta en el conjunto de evaluacion. Es un nivel insuficiente para transcripcion literal en produccion sin postprocesado.
- Senales claras de sobreajuste: la perdida de entrenamiento cae de 0,6958 a 0,0015 mientras la de validacion sube de 0,5557 a 0,5860 a partir de la tercera epoca. El mejor WER se alcanza en la epoca 7, pero las epocas 9 y 10 empeoran el resultado, lo que sugiere que el modelo publicado podria corresponder a una epoca suboptima.
- El dataset de ajuste (PolyAI/minds14) es pequeno y muy especifico del dominio bancario conversacional. Es previsible una degradacion fuerte fuera de ese dominio: vocabulario tecnico, acentos no representados, audio con ruido, solapamiento de hablantes o grabaciones de baja calidad.
- La model card no especifica la composicion del dataset, el subconjunto de idioma empleado, la duracion total del audio ni la particion de validacion, lo que impide auditar el entrenamiento.
- Idiomas soportados: no disponibles. El identificador del modelo sugiere uso en ingles, pero no hay confirmacion en los metadatos. No debe asumirse capacidad multilingue.
- Riesgo de alucinacion tipico de Whisper en pasajes de silencio, musica o ruido, donde el decoder puede generar texto repetido o inventado. Requiere deteccion de actividad vocal y filtros posteriores.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y se indique si hubo cambios. No hay clausulas de uso aceptable adicionales declaradas, pero el modelo deriva de openai/whisper-tiny y conviene conservar la atribucion a OpenAI.
- Incoherencia de nomenclatura: el model-index se refiere a "whisper-tiny-finetuned-fleurs-en", mientras que la metrica reportada es sobre PolyAI/minds14. Esto reduce la trazabilidad del artefacto.
- Adopcion nula en el momento de la consulta (0 descargas, 0 "likes"), sin issues ni discusion que permitan contrastar su comportamiento real.
- Fecha de publicacion en los metadatos (13 de octubre de 2026) y versiones de framework declaradas (Transformers 5.16.1, PyTorch 2.8.0) que conviene verificar antes de integrar el modelo en un entorno con versiones fijadas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wozniakos10/whisper-tiny-en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de ajuste fino: https://huggingface.co/datasets/PolyAI/minds14
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper, "Robust Speech Recognition via Large-Scale Weak Supervision": https://arxiv.org/abs/2212.04356
- Repositorio whisper.cpp (inferencia en C/C++): https://github.com/ggerganov/whisper.cpp
- Repositorio faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
