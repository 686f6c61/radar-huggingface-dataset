# wilsonzheng0327/Qwen3-ASR-1.7B-dflash-32k

## Resumen

Qwen3-ASR-1.7B-dflash-32k es un modelo draft (borrador) para decodificación especulativa en modo greedy, diseñado para acelerar la inferencia del modelo de reconocimiento de habla Qwen3-ASR-1.7B de Qwen. Ha sido publicado por el usuario wilsonzheng0327 en Hugging Face y se basa en el formato speculators DFlash de mattymchen/Qwen3-ASR-1.7B-speculator.dflash. No es un modelo de ASR autónomo: su función es proponer tokens que el modelo objetivo (Qwen3-ASR-1.7B) verifica, reduciendo el número de pasadas del modelo grande y, por tanto, la latencia de transcripción.

El draft está entrenado sobre transcripciones greedy del propio modelo objetivo en inglés, chino y japonés (aproximadamente 1.600 horas de audio), con una fase adicional de entrenamiento en grabaciones largas de hasta 240 segundos y una ventana deslizante de 32.768 tokens. La variante `-32k` emplea un vocabulario reducido de 32.000 tokens frente a los 48.000 de la variante principal, lo que reduce el tamaño del `lm_head` a cambio de una longitud de aceptación ligeramente inferior (5,24 frente a 5,43 tokens por ronda en promedio).

Su relevancia radica en la creciente adopción de la decodificación especulativa como técnica estándar para servir modelos de audio en producción: con longitudes de aceptación medias de 4,5 a 6,4 tokens por ronda según idioma y duración, este draft puede reducir sustancialmente el coste computacional por token generado respecto a ejecutar el modelo objetivo solo. El modelo se distribuye en formato safetensors con la librería `speculators` y requiere `custom_code`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft (5 capas Qwen3, decodificacion especulativa greedy con bloque de 8 tokens) |
| Parametros totales | 329.986.944 (0,33 B) |
| Parametros activos | no disponible (no es MoE; todos los parametros se usan en cada pasada) |
| Longitud de contexto | 32.768 tokens (ventana deslizante, entrenado con audios de hasta 240 s) |
| Tipos de cuantizacion | no disponible (precision nativa bf16) |
| Idiomas soportados | Ingles, chino y japones (entrenado sobre transcripciones del modelo objetivo en estos tres idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `speculators`, requiere `custom_code`) |

## Arquitectura y entrenamiento

El modelo es un draft model DFlash: una red ligera de 5 capas Qwen3 (hidden 2048, intermedia 6144, 16 cabezas de atencion y 8 cabezas KV, head_dim 128) que recibe los estados ocultos del modelo objetivo en las capas auxiliares 2, 14 y 25. En cada ronda, el draft propone 7 tokens por ancla (tamano de bloque 8, con el ultimo token confirmado como ancla y atencion causal dentro del bloque), empleando un token de mascara (151705) y un `lm_head` con vocabulario reducido de 32.000 tokens (filas congeladas del embedding ligado del modelo objetivo, con mapeos `d2t`/`t2d`). La variante `-32k` cubre aproximadamente el 99 % de los tokens de etiqueta frente al 99,4 % de la variante de 48.000.

El entrenamiento se realizo en dos fases sobre unas 1.600 horas de audio (51 % ingles, 28 % chino, 21 % japones): LibriSpeech train-clean-360, People's Speech (clean), VoxPopuli, Emilia-YODAS (excluyendo la parte CC BY-NC), AISHELL-1, Common Voice 17 ja y FLEURS. Las etiquetas son las transcripciones greedy del propio modelo objetivo generadas con vLLM, de modo que el draft aprende a reproducir exactamente la salida del target, incluido el prefijo `language X<asr_text>`. La fase 1 (10 epocas, 33.920 pasos, AdamW con lr 6e-4, warmup del 4 % y planificacion coseno, lotes empaquetados de 16k tokens en dos H200) uso la perdida DFlash con pesos de posicion D-Pace. La fase 2 (8 epocas, lr 3e-4) entreno con 23.938 grabaciones largas de 30-240 s y 150.000 clips cortos, ampliando la ventana a 32.768 tokens. El checkpoint publicado es el paso 21.864 de la fase 2, seleccionado por mejor longitud de aceptacion combinada en clips cortos y largos.

## Capacidades

- Propuesta de tokens para decodificacion especulativa greedy del modelo Qwen3-ASR-1.7B (no genera texto de forma autonoma).
- Longitudes de aceptacion medias de 5,24 tokens por ronda en promedio (variante 32k), con maximos de 6,17 en LibriSpeech clean y minimos de 4,28 en japones Emilia.
- Ventana de contexto de 32.768 tokens, adecuada para audios largos de hasta 240 segundos de entrenamiento y conjuntos de evaluacion de hasta 180 s.
- Cobertura multilingue sobre la salida del modelo objetivo en ingles, chino y japones, incluido el prefijo de idioma `language X<asr_text>` que produce el runtime.
- No soporta tool calling, agentes ni capacidades de vision o audio propias: es un componente auxiliar de un pipeline de ASR.

## Casos de uso

- Transcripcion por lotes de grandes volumenes de audio: al reducir las pasadas del modelo objetivo en modo greedy, disminuye el coste total de transcribir corpus de audio masivos (podcasts, archivos de radio, call centers).
- Servicios de subtitulado en tiempo casi real: la mayor longitud de aceptacion reduce la latencia por token, util para generar subtitulos de contenido en ingles, chino o japones.
- Procesamiento de grabaciones largas: la ventana de 32.768 tokens y el entrenamiento en audios de hasta 240 s lo hacen adecuado para transcribir reuniones, clases o entrevistas largas sin fragmentacion excesiva.
- Despliegue de ASR multilingue en produccion: se integra con runtimes que soporten speculators/DFlash para acelerar Qwen3-ASR-1.7B sin modificar la calidad de salida, ya que la verificacion greedy garantiza el mismo resultado que el target solo.
- Optimizacion de coste en APIs de voz: si se sirve Qwen3-ASR-1.7B en infraestructura propia (por ejemplo, con vLLM), este draft permite aumentar el throughput por GPU y reducir el numero de nodos necesarios.
- Transcripcion de audio en japones: respecto al draft de referencia (mattymchen), esta variante mejora notablemente la aceptacion en japones (4,28-4,58 frente a 2,09), por lo que es especialmente util para cargas de trabajo en ese idioma.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (WER, MMLU, etc.) para este modelo, al no ser un modelo de ASR autónomo. El autor si publica longitudes de aceptacion simuladas de decodificacion especulativa greedy en CUDA (bf16, target sin cuantizar, solo clips de evaluacion no vistos; no medidas en un runtime de servicio real):

| Draft | Libri clean | Libri other | FLEURS en | FLEURS zh | FLEURS ja | CV ja | Promedio all | 180 s en | 180 s zh | 180 s ja |
|---|---|---|---|---|---|---|---|---|---|---|
| Esta variante 32k | 6,17 | 5,68 | 5,32 | 5,05 | 4,98 | 4,49 | 5,24 | 5,89 | 5,36 | 4,69 |
| Variante 48k del mismo autor | 6,43 | 5,87 | 5,79 | 5,62 | 4,99 | 4,51 | 5,43 | 6,15 | 5,64 | 4,70 |
| Referencia mattymchen dflash | 6,22 | 5,94 | 4,72 | 5,04 | 2,09 | 2,11 | 3,51 | 2,94 | 2,96 | 1,54 |

La variante de 48k vocab ofrece mayor aceptacion global, pero la de 32k reduce el tamano del head; ambas superan claramente al draft de referencia, especialmente en japones y en audios largos.

## Requisitos de hardware

- El draft pesa unos 0,7 GB en bf16 (330 M de parametros); debe ejecutarse junto con el modelo objetivo Qwen3-ASR-1.7B, por lo que la VRAM total dominada por el target.
- Para el conjunto draft + target en bf16, con margen para KV cache y audio de entrada, una GPU de consumo con 16-24 GB (RTX 4090) deberia ser suficiente; no hay cifras oficiales de VRAM publicadas.
- GPUs de datacenter como H200 fueron usadas para el entrenamiento; para inferencia, cualquier GPU moderna con soporte bf16 (A100, H100, L40S, RTX 4090) es adecuada.
- Despliegue: la libreria `speculators` con soporte de decodificacion especulativa; el autor indica que las mediciones de aceptacion son simuladas en CUDA y no validadas en vLLM ni MLX, aunque el formato esta pensado para esos runtimes. No hay evidencia de soporte en llama.cpp u Ollama.
- Latencia y throughput: no disponibles; la mejora teorica sobre el target solo seria de hasta aproximadamente 5-6x en pasos del target segun las longitudes de aceptacion publicadas, aunque la aceleracion real depende del runtime.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario draft | Ventana | Aceptacion media | Idiomas | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-ASR-1.7B-dflash-32k (este) | 0,33 B | 32.000 | 32.768 | 5,24 | en, zh, ja | Hugging Face, safetensors, licencia no indicada |
| Variante 48k del mismo autor | 0,33 B aprox. | 48.000 | 32.768 | 5,43 | en, zh, ja | Hugging Face, safetensors |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | no disponible | no disponible | no disponible | 3,51 | en, zh, ja | Hugging Face, formato speculators DFlash |

Frente al draft de referencia, esta variante mejora la aceptacion global de 3,51 a 5,24 y corrige el colapso en japones y en audios largos (1,54 frente a 4,69 en 180 s de japones). Frente a la variante 48k del mismo autor, sacrifica unos 0,19 tokens de aceptacion media a cambio de un `lm_head` mas pequeno.

## Limitaciones y advertencias

- No es un modelo de ASR utilizable de forma independiente: requiere Qwen3-ASR-1.7B o Qwen3-ASR-1.7B-hf como modelo objetivo y un runtime con soporte de decodificacion especulativa DFlash.
- Las longitudes de aceptacion son simulaciones en CUDA con target bf16 sin cuantizar; no se han medido en vLLM, MLX ni con target cuantizado, por lo que las ganancias reales pueden diferir.
- Solo es valido para decodificacion greedy: con muestreo (temperature, top-p) el esquema de aceptacion no aplica tal cual.
- El vocabulario reducido de 32.000 tokens cubre el 99 % de los tokens de etiqueta de entrenamiento; tokens fuera del vocabulario draft pueden reducir la aceptacion en dominios no vistos.
- Entrenado solo con transcripciones greedy del target en ingles, chino y japones; el rendimiento en otros idiomas o en dominios acusticos distintos de los datasets de entrenamiento no esta evaluado.
- Licencia no especificada en el repositorio: los datos de entrenamiento usan fuentes CC BY (se excluyo la parte CC BY-NC de Emilia), pero la licencia del checkpoint y su permiso para uso comercial deben verificarse antes de produccion.
- Repositorio con 0 descargas y sin comunidad activa: madurez y soporte limitados, y requiere `custom_code`, lo que exige revisar el codigo remoto antes de ejecutarlo.
- El modelo base Qwen3-ASR-1.7B puede heredar sesgos de sus datos de entrenamiento (acentos, ruido de fondo, hablantes por genero), y la salida del draft replica exactamente la del target, incluidos sus errores y alucinaciones en transcripcion.

## Enlaces

- Modelo: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash-32k
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Draft de referencia: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Libreria speculators: https://github.com/vllm-project/speculators (repositorio de referencia de la libreria; no incluido en la informacion proporcionada)
- Paper, blog o demo: no disponible
