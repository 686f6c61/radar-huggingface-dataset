# wilsonzheng0327/Fun-ASR-Nano-dflash

## Resumen

Fun-ASR-Nano-dflash es un modelo borrador (draft) para decodificación especulativa greedy sobre el modelo de reconocimiento automático de voz Fun-ASR-Nano (`FunAudioLLM/Fun-ASR-Nano-2512-hf`). Lo publica el usuario wilsonzheng0327 bajo licencia Apache-2.0 y sigue el formato de checkpoints de la librería `speculators`, en concreto la variante DFlash. No es un modelo autónomo: se usa junto al modelo objetivo para proponer tokens candidatos que este verifica en paralelo, reduciendo el número de pasos de decodificación.

El checkpoint tiene 131.154.432 parámetros en bf16 (unos 0,3 GB) y está entrenado para cuatro idiomas: inglés, chino, japonés y cantonés. Incorpora cinco capas tipo Qwen3 con atención de 16 cabezas y 8 cabezas KV, más una cabeza de salida con vocabulario reducido de 48.000 tokens extraídos del vocabulario del modelo objetivo (151.936 entradas). El bloque de propuestas es de tamaño 8, con 7 propuestas por ronda.

Su relevancia es acotada pero técnica: es el primer draft publicado para Fun-ASR-Nano y cuantifica el beneficio de la decodificación especulativa en un modelo ASR cuyo cuello de botella está en el codificador de audio (70 capas), no en el decodificador. La propia model card advierte de que la ganancia extremo a extremo será muy inferior a la longitud de aceptación medida, y de que ningún runtime de servicio (sglang-omni, vLLM, MLX) sirve todavía un draft para este modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Draft DFlash para decodificación especulativa: 5 capas transformer tipo Qwen3 + `fc`, `hidden_norm`, `norm` y `lm_head` reducido con mapeos `d2t` / `t2d` |
| Parámetros totales | 131.154.432 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | ventana deslizante de 2.048 tokens; solicitud de hasta 30 s de audio y 200 tokens de salida |
| Tipos de cuantización | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | en, zh, ja, yue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `speculators`, con `custom_code`) |

## Arquitectura y entrenamiento

El draft es un transformer de 5 capas con dimensión oculta 1024, dimensión intermedia 3072, 16 cabezas de atención y 8 cabezas KV con `head_dim` 128. Toma como entrada los estados ocultos de las capas auxiliares 2, 14 y 25 de las 28 capas del decodificador objetivo, más una proyección `fc` y una normalización `hidden_norm`. La cabeza de salida usa un vocabulario reducido de 48.000 tokens (el 99,5 % de los tokens de etiqueta del entrenamiento) mapeado al vocabulario completo del objetivo mediante `d2t` / `t2d`. El bloque especulativo es de tamaño 8 con 7 propuestas por ronda, anclaje en el último token confirmado y máscara causal dentro del bloque; el token de máscara es el 151705.

El entrenamiento usó 599.123 clips (unas 1.700 horas: 810 h de inglés, 459 h de chino, 370 h de japonés y 77 h de cantonés) procedentes de YODAS2, LibriSpeech train-clean-360, People's Speech clean, VoxPopuli en, AISHELL-1, Common Voice 17 ja, un espejo de Common Voice 21 yue, words.hk y FLEURS. Las etiquetas son las transcripciones greedy del propio modelo objetivo generadas con sglang-omni (hasta 190 tokens nuevos); el 98,7 % de los tokens servidos coinciden con el argmax del decodificador de transformers sobre la misma entrada. Se empleó `DFlashDraftModel` y la pérdida de `speculators` (entropía cruzada con pesos de posición D-Pace), AdamW con lr 6e-4, weight decay 0,01, 4 % de warmup, scheduler coseno, 15 épocas (30.165 pasos), lotes empaquetados de 16k tokens en dos H100 y hasta 3.072 anclajes por lote. Los embeddings de audio se cachearon desde el codificador y adaptador del objetivo, de modo que el entrenamiento solo ejecutó el decodificador. El checkpoint publicado corresponde al paso 27.978, el mejor sobre un subconjunto de validación.

Una particularidad importante: el draft se entrenó con la entrada de decodificador que construye sglang-omni, que conserva solo el primer octavo de los frames del adaptador de audio (unos 63 tokens para 30 s) frente a los 500 que expande el procesador de transformers. Sobre 48 clips, la salida de sglang-omni coincidió con la ruta del primer octavo en el 0,92-0,995 de tokens por idioma y con la ruta de todos los frames en el 0,84-0,96. El prompt también es el de sglang-omni: `语音转写：` para chino o sin idioma, `语音转写成英文：` para inglés y el código crudo para `ja` y `yue`.

## Capacidades

- Generación de propuestas de tokens para decodificación especulativa greedy sobre Fun-ASR-Nano; no genera transcripciones por sí solo.
- Aceleración de la decodificación en cuatro idiomas: inglés, chino, japonés y cantonés.
- Compatibilidad con el esquema de checkpoints `speculators` DFlash (campos `fc`, `hidden_norm`, `norm`, `lm_head`, `d2t`, `t2d`).
- Funcionamiento con ventana deslizante de 2.048 tokens, suficiente para solicitudes de hasta 30 s de audio y 200 tokens de salida.
- No soporta tool calling, function calling, agentes, visión, audio de entrada directa ni modo de razonamiento: es un componente interno de inferencia.

## Casos de uso

- Servicio de transcripción de baja latencia en sglang-omni: el draft propone 7 tokens por ronda y el objetivo verifica en paralelo, lo que reduce el número de pasos del decodificador en solicitudes de hasta 30 s de audio. Requiere que el runtime incorpore soporte de draft, que a fecha de publicación no existe.
- Procesamiento por lotes de audio corto en inglés y chino: con longitudes de aceptación medias de 4,66 y 4,76 tokens respectivamente, el draft es más útil en estas dos lenguas que en japonés (4,32) y cantonés (4,84 en el conjunto de validación, aunque con menos horas de entrenamiento).
- Investigación sobre decodificación especulativa en ASR: sirve como referencia reproducible para estudiar cómo influye el tamaño del vocabulario del draft (48k frente a la variante de 32k) en la longitud de aceptación.
- Evaluación de arquitecturas de draft con capas auxiliares: el uso de los estados ocultos de las capas 2, 14 y 25 del objetivo es un patrón reutilizable en otros modelos ASR con decodificador transformer.
- Integración en pipelines internos de transcripción con GPUs H100: el coste de memoria del draft (0,3 GB en bf16) es despreciable frente al del modelo objetivo, por lo que puede convivir en la misma GPU.
- Experimentación con prompts multilingües de sglang-omni: el draft está entrenado con los prompts concretos de ese runtime, lo que permite medir la sensibilidad de la aceptación al formato del prompt.

## Benchmarks y rendimiento

Longitud de aceptación simulada con decodificación especulativa greedy en CUDA con objetivo en bf16, sobre 3.068 clips de validación (LibriSpeech test, FLEURS test, Common Voice ja y yue test y los dos últimos shards de YODAS2 por idioma). La aceptación se define como tokens generados divididos entre rondas.

| Draft | Libri clean | Libri other | FLEURS en | YODAS en | FLEURS zh | YODAS zh | CV ja | FLEURS ja | YODAS ja | CV yue | FLEURS yue | en | zh | ja | yue | all |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Este draft (vocab 48k) | 5,85 | 5,08 | 4,70 | 3,84 | 5,09 | 4,61 | 4,16 | 4,95 | 4,05 | 5,15 | 4,67 | 4,66 | 4,76 | 4,32 | 4,84 | 4,59 |
| Variante vocab 32k | 5,52 | 4,95 | 4,34 | 3,75 | 4,68 | 4,57 | 4,16 | 4,92 | 4,02 | 5,08 | 4,42 | 4,46 | 4,61 | 4,30 | 4,66 | 4,46 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, WER) en la información disponible. Las cifras anteriores no se han medido en un runtime de servicio real ni con un objetivo cuantizado. La model card señala además que en sglang-omni sobre H100 la decodificación representa el 53 % del tiempo de solicitud con concurrencia 1 y el 25 % con concurrencia 16, debido a las 70 capas del codificador de audio, por lo que la mejora extremo a extremo quedará muy por debajo de lo que sugiere la longitud de aceptación.

## Requisitos de hardware

- VRAM del draft: aproximadamente 0,26 GB en bf16 (131 M de parámetros); el repositorio ocupa 0,3 GB.
- VRAM total: dominada por el modelo objetivo Fun-ASR-Nano, no por el draft; el draft añade un coste marginal.
- GPU de entrenamiento: dos H100 según la model card.
- GPU de inferencia: H100 es la plataforma medida en sglang-omni; no se han publicado mediciones en A100, RTX 4090 ni otras GPU.
- GPU de consumo: el draft cabe en cualquier GPU de consumo, pero el modelo objetivo y el soporte del runtime determinan la viabilidad; no hay datos publicados al respecto.
- Opciones de despliegue: sglang-omni (entorno de entrenamiento y referencia), con la advertencia de que a fecha de publicación no sirve drafts para este modelo. No se ha verificado compatibilidad con vLLM, llama.cpp, Ollama, TGI ni MLX.
- Latencia y throughput: no disponibles en un runtime real; solo se han publicado longitudes de aceptación simuladas.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|---|
| wilsonzheng0327/Fun-ASR-Nano-dflash | Draft DFlash para Fun-ASR-Nano | 131 M | 2.048 (ventana deslizante) | en, zh, ja, yue | Apache-2.0 | Publicado; sin soporte de runtime |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | Draft DFlash para Qwen3-ASR-1.7B | no disponible | no disponible | no disponible | no disponible | Referencia de formato citada por el autor |
| FunAudioLLM/Fun-ASR-Nano-2512-hf | Modelo objetivo ASR | no disponible | no disponible | en, zh, ja, yue | no disponible | Modelo base |

No se dispone de otros drafts publicados para Fun-ASR-Nano en el momento del entrenamiento, según indica la propia model card, por lo que no existe una fila de referencia directa para comparar longitudes de aceptación.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el modelo objetivo Fun-ASR-Nano no produce transcripciones.
- El draft se entrenó con la ruta de audio de sglang-omni (primer octavo de los frames del adaptador); un runtime que alimente todos los frames probablemente obtendrá una aceptación menor, algo que no se ha medido.
- Los prompts de entrenamiento son específicos de sglang-omni; otros formatos de prompt pueden degradar la aceptación.
- Los números de aceptación son simulados en CUDA y no se han validado en sglang-omni, vLLM ni MLX, ni con un objetivo cuantizado.
- La ganancia extremo a extremo está limitada por el codificador de audio de 70 capas del objetivo: la decodificación es solo el 53 % del tiempo con concurrencia 1 y el 25 % con concurrencia 16.
- Cobertura idiomática desigual: 77 h de cantonés frente a 810 h de inglés, con menor aceptación en japonés (4,32) que en el resto.
- Sesgos y alucinaciones: no documentados en la información disponible; al heredar las etiquetas del modelo objetivo, cualquier sesgo de este se refleja en las propuestas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día; no hay evidencia de uso en producción.
- La licencia Apache-2.0 permite uso comercial, pero el modelo objetivo puede tener condiciones propias que deben verificarse por separado.

## Enlaces

- [HuggingFace: wilsonzheng0327/Fun-ASR-Nano-dflash](https://huggingface.co/wilsonzheng0327/Fun-ASR-Nano-dflash)
- [Modelo base: FunAudioLLM/Fun-ASR-Nano-2512-hf](https://huggingface.co/FunAudioLLM/Fun-ASR-Nano-2512-hf)
- [Referencia de formato: mattymchen/Qwen3-ASR-1.7B-speculator.dflash](https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash)
