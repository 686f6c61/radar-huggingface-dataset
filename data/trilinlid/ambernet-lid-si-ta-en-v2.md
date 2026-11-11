# TRiLinLID/ambernet-lid-si-ta-en-v2

## Resumen

TriLinLID V2 es un clasificador de identificacion de idioma (LID) en tiempo real desarrollado por TRiLinLID, orientado a distinguir entre sinhala, tamil e ingles en audio de habla. Se construye sobre la arquitectura AmberNet de NVIDIA (un modelo de clasificacion de audio basado en redes neuronales recurrentes) y anade una cabeza de clasificacion de 4 clases (`si`, `ta`, `en`, `ns` para no-habla). Su proposito concreto es seleccionar el modo de reconocimiento automatico del habla (ASR) adecuado —sinhala+ingles, tamil+ingles o solo ingles— a partir del primer segundo de audio en directo.

El modelo se presenta como una evolucion del checkpoint v1 (`ambernet-lid-si-ta-en-v1`), reentrenado con hasta 8 horas por idioma de habla real de Sri Lanka procedente del dataset `TRiLinLID/lid-v2-ta-si-en`, combinado con datos de v1 (OpenSLR Sinhala, Common Voice/IndicTTS Tamil, Svarah/LibriTTS-R English). La innovacion principal es su capacidad de streaming: con fragmentos de 0,25 s y una regla de decision calibrada, alcanza una precision de decision del 98,1 % en la simulacion de streaming, con una mediana de 1,53 s de habla antes de decidir.

Es relevante para desarrolladores que construyen sistemas de ASR multilingue en contextos de code-switching sinhala-ingles o tamil-ingles, donde el enrutamiento temprano del idioma condiciona la calidad del reconocimiento. El repositorio ocupa 5,8 GB y se distribuye en formato `.nemo` para la libreria NVIDIA NeMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | AmberNet (NVIDIA NeMo), clasificador de audio con cabeza de 4 clases |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de streaming de 4,0 s con hop de 0,25 s |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | sinhala (si), tamil (ta), ingles (en) |
| Licencia | other (terminos NGC de NVIDIA para AmberNet) |
| Formato de pesos | `.nemo` (NeMo), mas `calibration.json` y `lid_stream.py` |

## Arquitectura y entrenamiento

El modelo parte de AmberNet, una arquitectura de clasificacion de audio de NVIDIA integrada en NeMo, y anade una cabeza de 4 clases (`si`, `ta`, `en`, `ns`). El entrenamiento se realizo por continuacion desde el checkpoint v1, con datos compuestos en un 70 % por el dataset v2 (`TRiLinLID/lid-v2-ta-si-en`, hasta 8 h por idioma de habla real de Sri Lanka, con clips de frases extraidos de grabaciones largas monolingues etiquetadas por el idioma de la grabacion) y un 30 % de datos v1 provenientes de `TriLingDATA/si-ta-en-asr` (OpenSLR Sinhala, Common Voice/IndicTTS Tamil, Svarah/LibriTTS-R English).

Las tecnicas de entrenamiento incluyen recortes de 0,5-1,5 s, aumento de velocidad de 0,8-1,3x para hablantes rapidos, aumento independiente del idioma, consistencia corto/largo y un adversario de fuente intra-idioma. El mejor checkpoint se selecciono por precision tras 0,5 s y 1 s de habla, combinando un 70 % de validacion v2 y un 30 % de validacion v1 (huella `27b66e704cf3`, paso 7000). La calibracion incluye temperatura 2,206 ya aplicada dentro del `.nemo`, margen sinhala/tamil de 3,45 y una regla de streaming con hop de 0,25 s, ventana de 4,0 s, minimo de habla de 0,8 s, umbral de probabilidad de ingles de 0,9, minimo de habla para ingles de 2,0 s, espera maxima de 6,0 s y tope duro de 8,0 s.

## Capacidades

- Identificacion de idioma entre sinhala, tamil e ingles a partir de audio de habla.
- Deteccion de no-habla (clase `ns`) con una tasa del 100,0 % en las pruebas reportadas.
- Decision en streaming con fragmentos de 0,25 s y capacidad de emitir una decision antes de que termine el clip (80 % de los casos).
- Seleccion del modo de ASR: sinhala+ingles, tamil+ingles o solo ingles.
- Funcionamiento con audio de 16 kHz mono float32 y cualquier tamano de fragmento.
- Calibracion de confianza integrada (temperatura y margenes) para la salida de decision.
- No soporta tool calling, agentes, generacion de texto, vision ni matematicas; es exclusivamente un clasificador de audio.

## Casos de uso

- Enrutamiento de ASR multilingue en produccion: el modelo decide en el primer segundo si el hablante usa sinhala+ingles, tamil+ingles o solo ingles, permitiendo cargar el modelo de reconocimiento adecuado y evitar confusiones entre sinhala y tamil (5,39 % de confusion en test).
- Atencion al cliente telefonica en Sri Lanka: con audio en directo y fragmentos de 0,25 s, el sistema puede seleccionar el idioma del cliente antes de que termine la primera frase y derivar al agente o al modelo ASR correcto.
- Transcripcion de reuniones con code-switching: la deteccion temprana de ingles frente a sinhala o tamil permite segmentar y procesar cada intervencion con el modelo ASR apropiado.
- Subtitulado en directo de emisiones de television o radio: el modelo funciona sobre audio de estilo lectura/retransmision, que es el dominio de entrenamiento principal, y decide con una mediana de 1,53 s de habla.
- Filtrado de no-habla en pipelines de audio: la clase `ns` con deteccion del 100,0 % permite descartar silencios y ruido antes de invocar modelos ASR mas costosos.
- Investigacion en identificacion de idioma de bajos recursos: sirve como linea base reproducible para sinhala y tamil, idiomas con pocos recursos, y como punto de partida para fine-tuning con nuevos corpus.
- Sistemas de accesibilidad y asistentes de voz locales: al caber en CPU (el ejemplo de uso emplea `device="cpu"`), puede desplegarse en entornos con recursos limitados para decidir el idioma de interaccion.

## Benchmarks y rendimiento

Resultados de test (recortes desde el inicio de cada clip), con precision global del 77,3 % en los conjuntos de test v1, confusion sinhala-tamil del 5,39 %, precision del 76,6 % en fuentes no usadas en entrenamiento y deteccion de no-habla del 100,0 %:

| Fuente | clean 0,5 s | clean 1 s | clean 2 s | clean full | live 0,5 s | live 1 s | live 2 s | live full |
|---|---|---|---|---|---|---|---|---|
| en:libritts_r | 96 | 100 | 100 | 99,3 | 83,3 | 93,9 | 100 | 99,3 |
| en:svarah_english | 82 | 93,9 | 96,9 | 99,3 | 68,7 | 87,8 | 95,4 | 99,3 |
| si:bizbrains_sinhala (no visto) | 90 | 90 | 90 | 100 | 70 | 70 | 90 | 100 |
| si:openslr_sinhala | 86 | 93,3 | 97,6 | 100 | 76 | 86 | 95,1 | 100 |
| si:youtube_sinhala (no visto) | 42,7 | 73,3 | 86,7 | 93,3 | 52,7 | 74,7 | 89,3 | 90,7 |
| ta:common_voice_tamil | 49,3 | 67,3 | 95,3 | 100 | 32 | 58,7 | 85,8 | 95,3 |
| ta:indic_tts_tamil | 84 | 96 | 98,6 | 99,3 | 71,3 | 88 | 95,7 | 97,3 |

Simulacion de streaming (fragmentos de 0,25 s, clips de test): precision de decision del 98,1 %, errores sinhala-tamil del 0,44 %, decision antes del final del clip en el 80 % de los casos y mediana de 1,53 s de habla antes de decidir.

| Grupo | n | acc | early | median_speech_s |
|---|---|---|---|---|
| en:libritts_r | 150 | 0,993 | 0,753 | 2,07 |
| en:svarah_english | 150 | 0,92 | 0,747 | 2,10 |
| si:bizbrains_sinhala | 10 | 1 | 0,70 | 1,35 |
| si:openslr_sinhala | 150 | 1 | 0,907 | 0,99 |
| si:youtube_sinhala | 150 | 0,993 | 0,66 | 2,055 |
| ta:common_voice_tamil | 150 | 0,987 | 0,787 | 1,02 |
| ta:indic_tts_tamil | 150 | 0,993 | 0,96 | 0,99 |

Validacion (grabaciones v2 y conjuntos de validacion v1): puntuacion global del 78,0 % (v2 77,9 %, v1 78,4 % a (0,5, 1,0) s). No se han publicado resultados comparativos con otros modelos LID en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el ejemplo de uso de la model card ejecuta el modelo en CPU (`device="cpu"`), lo que sugiere que la inferencia es ligera.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Cabe en GPU consumer: probablemente si, dado que el ejemplo oficial usa CPU, pero no se confirma en la documentacion.
- Opciones de despliegue: NVIDIA NeMo (formato `.nemo`) con el script `lid_stream.py` proporcionado; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un clasificador de audio).
- Latencia y throughput: no disponibles; la simulacion de streaming reporta una mediana de 1,53 s de habla antes de la decision con hop de 0,25 s.
- Tamano del repositorio: 5,8 GB.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/ventana | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TriLinLID V2 (este) | AmberNet LID streaming | si, ta, en | ventana 4,0 s, hop 0,25 s | other (NGC) | Hugging Face, NeMo |
| TRiLinLID/ambernet-lid-si-ta-en-v1 | AmberNet LID (base) | si, ta, en | no disponible | other (NGC) | Hugging Face, NeMo |
| AmberNet original (NVIDIA) | Clasificador de audio | multiidioma | no disponible | NGC | NGC, NeMo |

No se dispone de datos de benchmarks de modelos LID alternativos en la informacion proporcionada para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado sobre corpus de estilo lectura y retransmision; el autor recomienda validar con los microfonos propios antes de desplegar en produccion.
- Precision limitada en tamil de Common Voice: 49,3 % con 0,5 s limpio y 32 % en condiciones live con 0,5 s, lo que indica sensibilidad a la calidad y dominio del audio.
- Precision baja en sinhala de YouTube no visto: 42,7 % con 0,5 s limpio.
- Confusion residual entre sinhala y tamil del 5,39 % en test y 0,44 % en la simulacion de streaming.
- La licencia es "other": AmberNet se distribuye bajo los terminos NGC de NVIDIA, que deben revisarse antes de un uso comercial.
- El dataset v2 no dispone de grabaciones de test separadas; la evaluacion se realiza sobre conjuntos de test v1.
- Riesgo de alucinacion no aplica (no es un modelo generativo), pero si existe riesgo de clasificacion erronea en audio ruidoso o con acentos no representados.
- No soporta otros idiomas distintos de sinhala, tamil e ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v2
- Modelo base v1: https://huggingface.co/TRiLinLID/ambernet-lid-si-ta-en-v1
- Dataset v2: https://huggingface.co/datasets/TRiLinLID/lid-v2-ta-si-en
- Dataset v1: https://huggingface.co/datasets/TriLingDATA/si-ta-en-asr
- Libreria NVIDIA NeMo: https://github.com/NVIDIA/NeMo
- Terminos NGC de NVIDIA: https://www.nvidia.com/en-us/agreements/enterprise-software/product-specific-terms-for-ai-products/
