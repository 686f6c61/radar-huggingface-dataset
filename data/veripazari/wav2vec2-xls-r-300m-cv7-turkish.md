# veripazari/wav2vec2-xls-r-300m-cv7-turkish

## Resumen

El modelo `veripazari/wav2vec2-xls-r-300m-cv7-turkish` es un sistema de reconocimiento automático del habla (ASR) para turco, resultado del ajuste fino del checkpoint multilingüe `facebook/wav2vec2-xls-r-300m` sobre corpus turcos. Lo desarrolla originalmente `mpoyraz` y esta ficha corresponde a una réplica archivada y documentada por VeriPazarı, que mantiene la licencia, los metadatos y las referencias al autor original. El modelo resuelve la transcripción de audio a texto en turco con una ventana de audio típica de hasta 30 segundos por pasada.

Arquitectónicamente es un transformer convolucional-recurrente de la familia wav2vec 2.0 en su variante XLS-R, con unos 300 millones de parámetros y preentrenamiento multilingüe sobre habla sin etiquetar. El ajuste fino se realizó sobre Common Voice 7.0 turco (particiones validadas, excluyendo test) y MediaSpeech, con un modelo de lenguaje n-grama entrenado con KenLM sobre Wikipedia turca para la decodificación.

Su relevancia radica en que ofrece un WER de 8,62 % y un CER de 2,26 % en el split de test de Common Voice 7 turco, cifras competitivas para un modelo de 300 M de parámetros, y en que se distribuye con licencia CC-BY-4.0, lo que facilita su uso comercial con atribución. Es una pieza útil como base para pipelines de transcripción en turco, aunque su rendimiento cae de forma notable en dominios ruidosos o no leídos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | wav2vec 2.0 XLS-R (transformer con extractor convolucional de características y cuantizador latente) |
| Parametros totales | ~300 M (300m, según el checkpoint base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (audio de entrada típico de hasta ~30 s por segmento; decodificación por chunks con `chunk_length_s`) |
| Tipos de cuantizacion | no disponible (pesos PyTorch en fp32; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | turco (`tr`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch (`pytorch_model.bin` / safetensors según el repo; tamaño del repo 1,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de `facebook/wav2vec2-xls-r-300m`, un transformer de ~300 M de parámetros preentrenado de forma autosupervisada sobre habla multilingüe (XLS-R). La cabeza de clasificación CTC se ajusta para el vocabulario de caracteres turcos. El ajuste fino se realizó con los siguientes hiperparámetros declarados por el autor: `learning_rate` 2e-4, 10 épocas, `warmup_steps` 500, extractor de características congelado, `mask_time_prob` 0,1, `mask_feature_prob` 0,05, y dropout de 0,05 en proyección de características, atención, capa final y activación. El entrenamiento usó lote de 8 por dispositivo con acumulación de gradientes de 8.

Los datos de ajuste fino fueron Common Voice 7.0 turco (todas las particiones validadas excepto test) y MediaSpeech. Se empleó el repositorio `mpoyraz/wav2vec2-turkish` para el preprocesado y la carga. Para la decodificación se entrenó un modelo de lenguaje n-grama con KenLM sobre artículos de Wikipedia turca, generando un ARPA convertido a binario mediante `ngram-lm-wiki`. Las versiones de infraestructura declaradas son Transformers 4.16.0.dev0, PyTorch 1.10.1, Datasets 1.17.0 y Tokenizers 0.10.3. No se documenta RLHF ni DPO, al tratarse de un modelo ASR con entrenamiento supervisado CTC.

## Capacidades

- Transcripción de audio a texto en turco (ASR) con salida a nivel de carácter mediante CTC.
- Decodificación con modelo de lenguaje n-grama (KenLM) para mejorar la fluidez y reducir errores en palabras frecuentes.
- Procesamiento por segmentos con `chunk_length_s` y `stride_length_s`, lo que permite transcribir audio largo troceándolo.
- Manejo de audio de distintos orígenes (lectura de Common Voice y habla de MediaSpeech) gracias al entrenamiento combinado.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo puramente acústico-secuencial.
- No tiene capacidades multimodales más allá del audio de entrada; no procesa vídeo ni imagen.
- Capacidad monolingüe: solo turco; no se declara transferencia a otras lenguas.
- No dispone de modo "thinking" ni de generación de texto libre; la salida está restringida al vocabulario de caracteres del tokenizador.

## Casos de uso

- Transcripción de reuniones y llamadas en turco: el modelo convierte audio de hasta 30 s por segmento en texto; para grabaciones largas se trocea con `chunk_length_s=5.0` y `stride_length_s=1.0`, como indica el propio autor en los comandos de evaluación.
- Subtitulado automático de vídeo en turco: integrado en un pipeline que extrae audio con ffmpeg y pasa segmentos al modelo, generando subtítulos con marcas temporales a partir de los chunks.
- Atención al cliente y análisis de calidad: transcripción de grabaciones de call center turco para posterior análisis de sentimiento, búsqueda de palabras clave o cumplimiento normativo.
- Generación de corpus y datasets: uso del modelo para etiquetar audio no transcrito y ampliar datasets de ASR en turco, con revisión humana posterior dada la tasa de error fuera de dominio.
- Accesibilidad: dictado y transcripción en vivo para personas con discapacidad auditiva en entornos de habla turca, con latencia aceptable en GPU consumer.
- Investigación en ASR de bajos recursos: punto de partida para experimentos de ajuste fino adicional, comparación de decodificadores (CTC greedy vs. KenLM) o evaluación de robustez en el evento Robust Speech.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos turcos para hacerlos buscables por texto en sistemas de gestión documental.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Dataset | Metrica | Valor |
|---|---|---|
| Common Voice 7 TR (test) | WER | 8,62 |
| Common Voice 7 TR (test) | CER | 2,26 |
| Robust Speech Event - Dev Data (tr) | WER | 30,87 |
| Robust Speech Event - Dev Data (tr) | CER | 10,69 |
| Robust Speech Event - Test Data (tr) | WER | 32,09 |

La diferencia entre Common Voice (lectura relativamente limpia) y Robust Speech (audio más diverso y ruidoso) refleja una caída de rendimiento de más de 20 puntos de WER fuera del dominio de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 1,2-1,5 GB para los pesos (~300 M de parámetros) más overhead de activaciones y decodificación; en la práctica, 2-4 GB de VRAM son suficientes.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; funciona bien en RTX 3060, RTX 4060, RTX 4090, A100 y H100. Para lotes grandes o transcripción masiva, A100/H100 reducen el tiempo total.
- Cabe en GPU consumer: sí, en RTX 3060/4060 y superiores; también en CPU para uso no interactivo.
- Opciones de despliegue: `transformers` con `pipeline("automatic-speech-recognition")`, servidores de inferencia compatibles con Transformers (TGI no soporta ASR de forma nativa en todas las versiones), ONNX Runtime para CPU, y exportación a otros runtimes. No se documentan pesos GGUF ni soporte nativo en llama.cpp/Ollama (no aplica a ASR).
- Latencia y throughput: no disponibles en la información proporcionada. En GPU consumer se espera inferencia en tiempo real o mejor para segmentos cortos, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/audio | WER CV7 TR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| veripazari/wav2vec2-xls-r-300m-cv7-turkish | ~300 M | segmentos de ~30 s | 8,62 (test) | CC-BY-4.0 | Hugging Face |
| mpoyraz/wav2vec2-xls-r-300m-cv7-turkish (original) | ~300 M | segmentos de ~30 s | 8,62 (test) | CC-BY-4.0 | Hugging Face |
| facebook/wav2vec2-xls-r-300m (base) | ~300 M | segmentos de ~30 s | no disponible (sin ajuste a turco) | MIT/Apache-2.0 según checkpoint | Hugging Face |
| Whisper (variantes small/medium) | 244 M / 769 M | 30 s | no disponible en la información | MIT | Hugging Face / OpenAI |

La comparación con Whisper es orientativa: no se dispone de resultados de Whisper sobre Common Voice 7 turco en la información proporcionada, por lo que no se pueden confrontar cifras directamente. El modelo original y la réplica de VeriPazarı comparten pesos y resultados.

## Limitaciones y advertencias

- Rendimiento degradado fuera de dominio: el WER sube a ~31-32 % en Robust Speech frente al 8,62 % en Common Voice, lo que indica poca robustez ante ruido, acentos o habla espontánea.
- Sesgos de dominio: entrenado principalmente con lectura de Common Voice y MediaSpeech; puede fallar en jerga, nombres propios, dialectos o habla coloquial.
- Riesgo de alucinación en ASR: la decodificación con KenLM puede "corregir" hacia palabras frecuentes de Wikipedia, produciendo transcripciones plausibles pero incorrectas en términos técnicos o nombres.
- Limitación de idioma: solo turco; no se declara soporte multilingüe ni code-switching.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial con atribución; es obligatorio citar al autor original (`mpoyraz`) y conservar la licencia. Verificar la cadena de atribución al redistribuir.
- Caveat de producción: los resultados de benchmarks están marcados como no verificados; conviene re-evaluar en el dominio concreto antes de desplegar.
- Dependencia de paquete externo: la evaluación oficial requiere `unicode_tr` para el procesamiento de texto turco; sin él, la normalización puede diferir.
- Repositorio con 0 descargas y 0 likes: ecosistema de validación mínimo; no hay evidencia de uso en producción por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/veripazari/wav2vec2-xls-r-300m-cv7-turkish
- Modelo original: https://huggingface.co/mpoyraz/wav2vec2-xls-r-300m-cv7-turkish
- Checkpoint base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Repositorio de ajuste fino: https://github.com/mpoyraz/wav2vec2-turkish
- Repositorio del modelo de lenguaje: https://github.com/mpoyraz/ngram-lm-wiki
- Dataset Common Voice 7.0: https://huggingface.co/datasets/mozilla-foundation/common_voice_7_0
- Dataset MediaSpeech: https://www.openslr.org/108/
- Paquete `unicode_tr`: https://pypi.org/project/unicode_tr/
- Plataforma del compilador: https://veripazari.com.tr
