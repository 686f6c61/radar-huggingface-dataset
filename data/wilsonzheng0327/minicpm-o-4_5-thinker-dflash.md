# wilsonzheng0327/MiniCPM-o-4_5-thinker-dflash

## Resumen

MiniCPM-o-4_5-thinker-dflash es un modelo borrador (draft model) para decodificación especulativa del "thinker" de MiniCPM-o 4.5, el modelo multimodal de OpenBMB que responde a peticiones de texto, imagen y audio. Lo publica el usuario wilsonzheng0327 sobre el checkpoint `z-lab/Qwen3-8B-DFlash-b16`, afinado con las propias respuestas del thinker sobre aproximadamente 166.000 prompts provenientes de conjuntos de datos con licencias que permiten uso comercial.

El modelo no es un generador autónomo: es un componente de aceleración que se sirve junto al modelo objetivo mediante SGLang y su extensión sglang-omni. Implementa el esquema DFlash, con 5 capas Qwen3 y un tamaño de bloque de 8 (7 propuestas por ronda), y reutiliza el embedding y la cabeza de salida del modelo objetivo, por lo que su recuento de parámetros en safetensors es de 1.048.626.432.

Su relevancia es práctica: reduce la latencia y aumenta el throughput del thinker sin alterar la precisión de las respuestas. Según los datos del autor, alcanza 2,01x de velocidad en MT-Bench con un solo flujo y 2,44x en prompts reservados, manteniendo respuestas idénticas al servidor sin borrador en decodificación greedy. La licencia Apache-2.0 y el soporte nativo en SGLang lo hacen desplegable en producción sin fricción legal adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (5 capas Qwen3) como borrador DFlash para decodificación especulativa; sin embedding ni cabeza de salida propios |
| Parametros totales | 1.048.626.432 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 40.960 posiciones (borrador); el thinker objetivo requiere ampliar `max_seq_len` a 32.768 para vídeo largo |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El borrador sigue el diseño de z-lab: componentes `fc` y `hidden_norm`, cinco capas Qwen3 (hidden 4096, intermediate 12288, 32 cabezas de atención y 8 cabezas KV, head_dim 128) y `norm` final. No incluye embedding ni cabeza de salida, ya que emplea los del modelo objetivo (vocabulario completo de 151.748 tokens). Predice a partir de las salidas de las capas 1, 9, 17, 25 y 33 de las 36 del thinker (`dflash_config.target_layer_ids`), con tamaño de bloque 8 y atención no causal dentro del bloque. El token de máscara es el 151669 (`<image>` en el vocabulario de MiniCPM-o), y el trabajador DFlash de SGLang lo carga tal cual.

El entrenamiento partió de los pesos de `z-lab/Qwen3-8B-DFlash-b16` y usó 166.171 prompts (turnos de usuario) con 165.162 respuestas generadas por el propio thinker (101,3 millones de tokens), más 1.009 reservadas. Las fuentes incluyen UltraChat 200k (50.000), OASST2 en inglés y chino (5.807), Llama-Nemotron post-training de chat, matemáticas y código (8.000 cada una), TextVQA (22.000), PixMo-Docs (38.421), LibriSpeech train-clean-100 (12.000), VoxPopuli inglés (5.000), FLEURS inglés y chino (2.602 y 3.246) y YODAS2 (1.262 y 1.833). Se usó el `DFlashDraftModel` y la pérdida de speculators (entropía cruzada con pesos de posición D-Pace), AdamW con learning rate 3e-4, weight decay 0,01, warmup del 4 %, coseno, 3 épocas (10.032 pasos), lotes empaquetados de 16.384 tokens en dos H100 durante 2 h 16 min. El checkpoint publicado es el paso 9.359. Como comparación, el mismo dato con pesos aleatorios alcanzó 3,49 en aceptación reservada frente a 4,08 de este borrador.

## Capacidades

- Aceleración de decodificación especulativa del thinker de MiniCPM-o 4.5 mediante DFlash, con 7 propuestas por ronda y bloque de 8.
- Generación de borradores para respuestas de texto, imagen y audio, ya que el thinker procesa las tres modalidades y alimenta al "talker" para salida de voz.
- Soporte de tool calling y razonamiento multi-paso heredado del thinker objetivo, sin cambios en la precisión.
- Capacidades multilingües limitadas a inglés y chino, coherentes con los datos de entrenamiento.
- Integración nativa con SGLang y sglang-omni, incluyendo modo solo texto (`--text-only`).
- No es un modelo autónomo: no genera respuestas por sí mismo ni puede usarse sin el modelo objetivo.

## Casos de uso

- Despliegue de MiniCPM-o 4.5 en producción con baja latencia: sirviendo el thinker con `--thinker.engine.speculative_algorithm DFLASH`, se obtiene 2,01x de velocidad en MT-Bench con un solo flujo (322,7 tok/s frente a 160,3 sin borrador), lo que reduce el tiempo de respuesta percibido en asistentes conversacionales.
- Servicio de alto throughput por lotes: con 16 peticiones simultáneas en MT-Bench alcanza 3.259 tok/s (1,67x), adecuado para APIs de chat con muchos usuarios concurrentes.
- Asistentes multimodales con imagen: en MMMU CI 50 con 16 peticiones simultáneas logra 3.211 tok/s de salida frente a 1.638 sin borrador, útil para pipelines de análisis de documentos, gráficos y tablas (PixMo-Docs, TextVQA).
- Transcripción y comprensión de audio: acelera tareas de resumen, traducción y detección de tono del hablante sobre audio (LibriSpeech, VoxPopuli, FLEURS, YODAS2), con latencia media de 0,211 s en las primeras 100 frases del clon de voz Seed-TTS en inglés.
- Generación de voz (text-to-speech) acoplada al talker: en Seed-TTS con 16 peticiones simultáneas alcanza 22,0-22,3 req/s frente a 16,3-16,5 sin borrador, manteniendo una tasa de error de palabra del 1,68 %/1,54 % medida con Qwen3-ASR-1.7B.
- Procesamiento de vídeo largo: con `--thinker.factory.max_seq_len 32768` se sirven prompts de vídeo en Video-MME CI 50 a 1,54-1,55 req/s, con precisión igual o superior (34/33 aciertos frente a 32 sin borrador).
- Evaluación de calidad sin regresión: al mantener respuestas idénticas en decodificación greedy (las 80 respuestas de MT-Bench y las respuestas reservadas de texto e imagen coinciden con el servidor sin borrador), sirve para migrar un servicio existente a decodificación especulativa sin revalidar la calidad de salida.

## Benchmarks y rendimiento

Datos del autor, servidos con sglang-omni (`main` en efa24ff03, SGLang 0.5.23) en H100, un GPU y servidor nuevo por ejecución. Texto en greedy. La comparación es el borrador actual del cookbook, `Qun1023/MiniCPM-o-4_5-thinker-DSpark-mm` con bloque 7.

| Carga de trabajo | Sin borrador | DSpark-mm | Este borrador |
|---|---:|---:|---:|
| MT-Bench, 80 primeros turnos, 1 a la vez (tok/s) | 160,3 / 160,3 | 329,0 / 328,3 | 322,7 (2,01x) |
| MT-Bench, 16 a la vez (tok/s) | 1.946 / 1.945 | 3.204 / 3.327 | 3.259 (1,67x) |
| Prompts reservados, 358 de las 13 fuentes, 1 a la vez (tok/s) | 157,2 / 157,3 | 345,8 / 354,5 | 383,3 (2,44x) |
| MMMU CI 50, 16 a la vez (tok/s de salida) | 1.638 / 1.589 | 2.767 / 2.981 | 3.211 |
| Video-MME CI 50, 16 a la vez (req/s) | 1,46 / 1,47 | 1,54 / 1,55 | 1,54 / 1,55 |
| MMSU CI 2.000, respuestas de 32 tokens, 16 a la vez (req/s) | 30,5 / 29,8 | 28,0 / 27,3 | 27,1 |
| Voz, clon de voz Seed-TTS inglés, 1.088 frases, 16 a la vez (req/s) | 16,3 / 16,5 | 22,3 / 22,5 | 22,0 / 22,3 |
| Voz, primeras 100 frases, 1 a la vez (latencia media) | 0,284 / 0,279 s | 0,207 / 0,210 s | 0,211 / 0,212 s |

Precisión (sin cambios):

| Comprobación | Sin borrador | DSpark-mm | Este borrador |
|---|---:|---:|---:|
| MMSU CI 2.000, aciertos | 1.064 / 1.065 | 1.064 / 1.063 | 1.064 |
| MMMU CI 50, aciertos | 29 / 33 | 33 / 32 | 33 |
| Video-MME CI 50, aciertos (ajustes de frames CI) | 32 / 32 | 33 / 33 | 34 / 33 |
| Seed-TTS inglés, tasa de error de palabra (corpus, Qwen3-ASR-1.7B) | 1,81 % / 2,07 % | 1,63 % / 1,42 % | 1,68 % / 1,54 % |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) para este borrador en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 2,1 GB en bf16, por lo que requiere aproximadamente 2-3 GB adicionales sobre el modelo objetivo MiniCPM-o 4.5.
- GPU recomendadas: H100 para las cifras publicadas; el modelo objetivo Qwen3-8B exige una GPU de gama alta para servirse junto al borrador.
- Cabe en GPU de consumo: no disponible como dato verificado; el borrador en sí es pequeño, pero el thinker objetivo de 8B en bf16 condiciona el requisito total.
- Opciones de despliegue: SGLang con sglang-omni (`python -m sglang_omni.cli serve --model-path openbmb/MiniCPM-o-4_5 --port 8000 --thinker.engine.speculative_algorithm DFLASH --thinker.engine.speculative_draft_model_path wilsonzheng0327/MiniCPM-o-4_5-thinker-dflash`); añadir `--text-only` para servidor solo texto. No se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 322,7 tok/s en MT-Bench con un flujo y 3.259 tok/s con 16 flujos en H100; 0,211 s de latencia media en las primeras 100 frases de Seed-TTS.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Throughput MT-Bench 1 flujo | Throughput MT-Bench 16 flujos |
|---|---|---:|---|---|---:|---:|
| Este borrador (MiniCPM-o-4_5-thinker-dflash) | Borrador DFlash, bloque 8 | 1.048.626.432 | 40.960 | Apache-2.0 | 322,7 tok/s | 3.259 tok/s |
| Qun1023/MiniCPM-o-4_5-thinker-DSpark-mm | Borrador DSpark, bloque 7 | no disponible | no disponible | no disponible | 329,0 / 328,3 tok/s | 3.204 / 3.327 tok/s |
| Sin borrador (thinker MiniCPM-o 4.5 directo) | Modelo objetivo | no disponible | no disponible | no disponible | 160,3 tok/s | 1.946 / 1.945 tok/s |
| z-lab/Qwen3-8B-DFlash-b16 | Borrador DFlash base | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo autónomo: solo funciona como borrador de decodificación especulativa junto al thinker de MiniCPM-o 4.5 y requiere SGLang con sglang-omni.
- Idiomas limitados a inglés y chino; no se documenta soporte de otros idiomas.
- Los datos de entrenamiento no incluyen vídeo, por lo que la aceleración en cargas de vídeo depende del thinker y de ampliar el contexto a 32.768.
- En MMSU CI 2.000 con 16 flujos el rendimiento es ligeramente inferior al servidor sin borrador (27,1 req/s frente a 30,5/29,8), por lo que la ganancia no es universal.
- En audio, dos servidores sin borrador ya discrepan en aproximadamente un tercio de las respuestas reservadas, lo que limita la verificación de equivalencia exacta en esa modalidad.
- Riesgo de alucinación y sesgos: heredados del thinker objetivo y de las fuentes de datos (UltraChat, OASST2, Llama-Nemotron, TextVQA, PixMo-Docs, LibriSpeech, VoxPopuli, FLEURS, YODAS2); no se documentan evaluaciones de sesgo específicas.
- Licencia Apache-2.0 permite uso comercial, pero las licencias de los datos de entrenamiento (MIT, Apache-2.0, CC BY 4.0, CC BY 2.0, ODC-BY, CC0, CC BY 3.0) deben respetarse en la medida en que apliquen.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; modelo publicado en 2026-11-05 y actualizado el mismo día, sin validación comunitaria independiente.
- El checkpoint publicado es el paso 9.359, no el final del entrenamiento, aunque el autor indica que empata en aceptación reservada con el paso final.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonzheng0327/MiniCPM-o-4_5-thinker-dflash
- Modelo base: https://huggingface.co/z-lab/Qwen3-8B-DFlash-b16
- Modelo objetivo: https://huggingface.co/openbmb/MiniCPM-o-4_5
- Borrador de comparación: https://huggingface.co/Qun1023/MiniCPM-o-4_5-thinker-DSpark-mm
- Dataset UltraChat 200k: https://huggingface.co/datasets/HuggingFaceH4/ultrachat_200k
- Dataset OASST2: https://huggingface.co/datasets/OpenAssistant/oasst2
- Dataset Llama-Nemotron Post-Training: https://huggingface.co/datasets/nvidia/Llama-Nemotron-Post-Training-Dataset
- Dataset PixMo-Docs: https://huggingface.co/datasets/allenai/pixmo-docs
- SGLang: https://github.com/sgl-project/sglang
- speculators (framework de entrenamiento): no disponible
