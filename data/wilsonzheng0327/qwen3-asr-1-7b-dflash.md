# wilsonzheng0327/Qwen3-ASR-1.7B-dflash

## Resumen

Qwen3-ASR-1.7B-dflash es un modelo *draft* (borrador) para decodificación especulativa codiciosa (*greedy speculative decoding*) diseñado para acelerar la inferencia del modelo de reconocimiento de voz Qwen3-ASR-1.7B de Qwen. Ha sido publicado por el usuario wilsonzheng0327 en Hugging Face y se basa en el formato DFlash de la librería `speculators`, tomando como referencia el checkpoint de `mattymchen/Qwen3-ASR-1.7B-speculator.dflash`.

A diferencia del draft de referencia, este modelo ha sido entrenado específicamente para inglés, chino y japonés, lo que permite mantener longitudes de aceptación (*accept length*) altas también en chino y japonés, donde el draft original degrada notablemente (de 6,2 tokens aceptados en inglés a poco más de 2 en japonés). El draft es un modelo ligero de unos 362,8 millones de parámetros (en safetensors, 0,7 GB) que propone hasta 7 tokens por ronda, que luego el modelo objetivo verifica.

Su relevancia reside en que la transcripción automática (ASR) con modelos tipo LLM es costosa en producción, y un draft bien entrenado puede multiplicar el throughput de transcripción sin alterar la salida del modelo objetivo, ya que la verificación garantiza resultados idénticos a la decodificación codiciosa del target.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash draft (5 capas Qwen3, decodificador especulativo con bloques de 8 tokens) |
| Parametros totales | 362.770.944 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | Ventana deslizante de 32.768 tokens (entrenado con audios de hasta 240 s) |
| Tipos de cuantizacion | no disponible (precisión nativa bf16) |
| Idiomas soportados | Ingles, chino y japones (entrenamiento) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un draft DFlash compuesto por 5 capas de tipo Qwen3 (hidden 2048, intermediate 6144, 16 cabezas de atencion y 8 cabezas KV, head_dim 128), con normalizacion oculta (`hidden_norm`), una capa `norm` final y un `lm_head` de vocabulario reducido (48.000 tokens, correspondiente al 99,4 % de los tokens de etiqueta del entrenamiento) construido a partir de filas congeladas del embedding ligado del modelo objetivo. Incluye mapas `d2t`/`t2d` entre el vocabulario reducido del draft y el completo del target. El draft toma como entrada los estados ocultos del target en las capas auxiliares 2, 14 y 25, y propone bloques de 7 tokens por ronda (block size 8, con anclaje en el ultimo token confirmado y causalidad dentro del bloque), usando el token de mascara 151705.

El entrenamiento se realizo en dos fases sobre unas 1.600 horas de audio (51 % ingles, 28 % chino, 21 % japones): LibriSpeech train-clean-360, People's Speech (clean), VoxPopuli en, Emilia-YODAS en/zh/ja (solo la parte CC BY), AISHELL-1, Common Voice 17 ja y FLEURS en/zh/ja. Las etiquetas son las transcripciones codiciosas del propio modelo objetivo (generadas con vLLM), lo que garantiza que el draft aprenda a imitar exactamente la salida del target, incluido el prefijo `language X<asr_text>`. La fase 1 entreno 10 epocas (33.920 pasos) con AdamW (lr 6e-4, warmup del 4 %, schedule coseno) sobre 591.765 clips de 0,5-30 s, con lotes empaquetados de 16k tokens en dos H200. La fase 2 (8 epocas, 21.864 pasos, lr 3e-4) amplio la ventana a 32.768 tokens usando 23.938 grabaciones largas (30-240 s) mas 150.000 clips cortos. El checkpoint publicado es el paso 21.864 de la fase 2, el de mejor aceptacion combinada en cortos y largos.

## Capacidades

- Generacion de propuestas de tokens para decodificacion especulativa codiciosa junto a Qwen3-ASR-1.7B (o su variante `Qwen3-ASR-1.7B-hf`).
- Propuesta de hasta 7 tokens por ronda de verificacion (block size 8), con aceptacion media simulada de 5,43 tokens por ronda en el conjunto de pruebas.
- Optimizado para transcripcion en tres idiomas: ingles (accept 6,09), chino (5,61) y japones (4,60).
- Funcionamiento con grabaciones largas: mantiene aceptacion de 5,6-6,25 tokens con clips de ~60 s y de 4,7-6,15 con ~180 s, gracias al entrenamiento en fase 2 con ventana de 32.768 tokens.
- No es un modelo de ASR por si mismo: requiere el modelo objetivo para producir transcripciones.

## Casos de uso

- Aceleracion de transcripcion masiva en servidores: al integrar el draft con Qwen3-ASR-1.7B en un runtime de serving, se reduce el numero de pasadas del target (una verificacion por cada ~5,4 tokens aceptados), aumentando el throughput en pipelines de transcripcion por lotes.
- Subtitulado automatico de contenido multimedia en ingles, chino y japones: la fase 2 mantiene la eficiencia en grabaciones de hasta 180 s, adecuada para procesar videos o podcasts largos sin degradacion del accept length.
- Procesamiento de call centers y grabaciones de voz: el alto accept length en ingles (6,09 de media) permite transcribir grandes volumenes de audio conversacional reduciendo costes de GPU.
- Transcripcion multilingue en aplicaciones con deteccion automatica de idioma: el draft se entreno con las etiquetas generadas con contexto de sistema vacio y idioma automatico, replicando el comportamiento por defecto del target.
- Despliegue en entornos de investigacion de decodificacion especulativa: el formato `speculators` DFlash permite estudiar y comparar drafts (existen variantes de vocabulario 48k y 32k) sobre el mismo target.
- Reduccion de latencia en transcripcion interactiva: al ser un draft de solo 0,7 GB en bf16, su coste por propuesta es minimo frente al modelo objetivo de 1,7B, lo que beneficia a aplicaciones de dictado en tiempo real.

## Benchmarks y rendimiento

No se han publicado benchmarks estandar (WER, MMLU, etc.) en la informacion disponible. La metrica relevante publicada es el *accept length* simulado (tokens generados por ronda de verificacion) en decodificacion especulativa codiciosa sobre CUDA con target en bf16, evaluado solo en clips retenidos (held-out):

| draft | Libri clean | Libri other | FLEURS en | Emilia en | FLEURS zh | Emilia zh | CV ja | FLEURS ja | Emilia ja | en | zh | ja | all |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| este draft (48k vocab) | 6,43 | 5,87 | 5,79 | 6,13 | 5,62 | 5,60 | 4,51 | 4,99 | 4,31 | 6,09 | 5,61 | 4,60 | 5,43 |
| este draft, variante 32k vocab | 6,17 | 5,68 | 5,32 | 5,90 | 5,05 | 5,44 | 4,49 | 4,98 | 4,28 | 5,81 | 5,27 | 4,58 | 5,24 |
| fase 1 solo (clips cortos) | 6,45 | 5,99 | 5,82 | 6,09 | 5,55 | 5,66 | 4,57 | 5,05 | 4,33 | 6,12 | 5,62 | 4,64 | 5,46 |
| referencia: mattymchen/Qwen3-ASR-1.7B-speculator.dflash | 6,22 | 5,94 | 4,72 | 5,08 | 5,04 | 4,35 | 2,11 | 2,09 | 2,09 | 5,46 | 4,60 | 2,09 | 3,51 |

En grabaciones largas (~60 s y ~180 s), este draft mantiene accept lengths de 6,25/5,75/4,75 (60 s en/zh/ja) y 6,15/5,64/4,70 (180 s en/zh/ja), frente a 5,46/4,75/1,87 y 2,94/2,96/1,54 del draft de referencia. Importante: estos numeros provienen de simulacion y no han sido medidos en un runtime de serving (vLLM, MLX) ni con target cuantizado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB para el draft en bf16, a los que hay que sumar la memoria del modelo objetivo Qwen3-ASR-1.7B (no disponible el detalle exacto del target).
- GPU recomendadas: el entrenamiento se realizo en NVIDIA H200; para inferencia, cualquier GPU moderna con soporte bf16 es suficiente dado el tamano reducido del draft (por ejemplo RTX 3060, RTX 4090 o superiores junto al target).
- Cabe con holgura en GPUs de consumo: el draft ocupa menos de 1 GB, por lo que la limitacion real la impone el modelo objetivo de 1,7B.
- Opciones de despliegue: libreria `speculators` (formato DFlash); el entrenamiento y la simulacion usaron CUDA, y el README menciona vLLM y MLX como runtimes de serving candidatos, aunque no hay mediciones publicadas en ellos.
- Latencia y throughput: no disponibles; la ganancia teorica se deriva del accept length medio de 5,43 tokens por ronda (hasta 7 propuestas por ronda), lo que implica aproximadamente una verificacion del target por cada 5-6 tokens generados.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Accept length medio (all) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| wilsonzheng0327/Qwen3-ASR-1.7B-dflash (este) | Draft DFlash para Qwen3-ASR-1.7B | 362,8 M | en, zh, ja | 5,43 | no disponible | Hugging Face, safetensors |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | Draft DFlash para Qwen3-ASR-1.7B | no disponible | en (degrada en zh/ja) | 3,51 | no disponible | Hugging Face |
| variante -32k de este draft | Draft DFlash (vocab 32.000) | no disponible | en, zh, ja | 5,24 | no disponible | Hugging Face (repositorio `-32k`) |

Frente al draft de referencia de mattymchen, este modelo duplica practicamente el accept length en japones (4,60 frente a 2,09) y mejora en chino (5,61 frente a 4,60), a costa de un ligero descenso en algunos conjuntos de ingles (por ejemplo FLEURS en: 5,79 frente a 4,72 a favor de este draft; Libri clean: 6,43 frente a 6,22, tambien a favor). En ingles, chino y japones simultaneamente, este draft es superior en el global (5,43 frente a 3,51).

## Limitaciones y advertencias

- El modelo no es un ASR autónomo: solo acelera la inferencia de Qwen3-ASR-1.7B y no puede usarse sin el modelo objetivo.
- Los accept lengths publicados provienen de simulacion en CUDA con target en bf16; no hay mediciones en runtimes reales (vLLM, MLX) ni con targets cuantizados, por lo que las ganancias en produccion pueden diferir.
- La decodificacion especulativa codiciosa garantiza salida identica al target solo en modo greedy; con muestreo (temperature, top-p) el comportamiento no esta documentado.
- El draft esta entrenado para ingles, chino y japones; su rendimiento en otros idiomas soportados por el target no esta evaluado y probablemente sea inferior.
- El vocabulario reducido (48.000 o 32.000 tokens) cubre el 99,4 % de los tokens de etiqueta del entrenamiento; los tokens fuera del vocabulario del draft no pueden ser propuestos.
- La licencia del repositorio no esta especificada en la informacion disponible; dado que el modelo base Qwen3-ASR-1.7B puede tener restricciones propias, conviene verificar ambas licencias antes de uso comercial.
- El modelo hereda implicitamente los sesgos y el riesgo de alucinacion del target Qwen3-ASR-1.7B, ya que imita sus transcripciones codiciosas; no corrige errores del target.
- Descargas y likes en el momento de la ficha son 0, lo que indica un proyecto experimental sin adopcion comunitaria contrastada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash
- Modelo base: https://huggingface.co/Qwen/Qwen3-ASR-1.7B
- Draft de referencia: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Variante con vocabulario 32k: https://huggingface.co/wilsonzheng0327/Qwen3-ASR-1.7B-dflash-32k
- Libreria speculators: https://github.com/vllm-project/speculators (no disponible en la informacion proporcionada; enlace orientativo)
