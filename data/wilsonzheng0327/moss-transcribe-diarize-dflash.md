# wilsonzheng0327/MOSS-Transcribe-Diarize-dflash

## Resumen

MOSS-Transcribe-Diarize-dflash es un modelo borrador (draft model) para decodificación especulativa greedy sobre el modelo de transcripción y diarización de audio OpenMOSS-Team/MOSS-Transcribe-Diarize 0.9B. Lo publica el usuario wilsonzheng0327 bajo licencia Apache 2.0 y su función no es transcribir por sí mismo, sino proponer tokens que el modelo objetivo verifica, acelerando la generación sin alterar la salida. Está construido con la librería `speculators` y el formato DFlash, el mismo esquema que otros borradores publicados para modelos ASR.

El checkpoint contiene 131.154.432 parámetros (unos 0,13B) en bf16, con un repositorio de 0,3 GB. Arquitectónicamente es un transformer compacto de 5 capas Qwen3 (hidden 1024, intermediate 3072, 16 cabezas de atención y 8 de KV, head_dim 128) que consume estados ocultos de las capas auxiliares 2, 14 y 25 del decodificador objetivo (28 capas) y predice bloques de 8 tokens con una cabeza de vocabulario reducido de 48.000 entradas.

Su relevancia es práctica: la transcripción de audio largo con marcas de tiempo y etiquetas de hablante es una tarea de decodificación muy secuencial, y un borrador que acepta de media 4,99 tokens por ronda en lugar de 1 puede reducir de forma significativa el número de pasos de verificación del modelo grande. El modelo cubre ocho idiomas (inglés, chino, japonés, coreano, español, francés, alemán y ruso) y ficheros de hasta 90 minutos, con una ventana deslizante de 131.072 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador DFlash: 5 capas Qwen3 (hidden 1024, intermediate 3072, 16 cabezas / 8 KV, head_dim 128) con `fc`, `hidden_norm`, `norm`, `lm_head` reducido y mapeos `d2t` / `t2d` |
| Parametros totales | 131.154.432 (aproximadamente 0,13B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens de ventana deslizante (la del modelo objetivo) |
| Tipos de cuantizacion | no disponible (checkpoint publicado en bf16) |
| Idiomas soportados | en, zh, ja, ko, es, fr, de, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code, libreria `speculators`) |

Parámetros adicionales del borrador: capas auxiliares del objetivo 2, 14 y 25; tamaño de bloque 8 (7 propuestas por ronda, ancla en el último token confirmado, causal dentro del bloque); token de máscara 151705; vocabulario del borrador de 48.000 entradas (99,6% de los tokens de etiqueta de entrenamiento); precisión bf16.

## Arquitectura y entrenamiento

El borrador sigue el diseño DFlash de la librería `speculators`: recibe los estados ocultos que entran en las capas 2, 14 y 25 del decodificador objetivo, los proyecta mediante `fc` y `hidden_norm`, y pasa por 5 capas Qwen3 con normalización final. La cabeza de salida es un `lm_head` de vocabulario reducido (48.000 filas congeladas del embedding atado del modelo objetivo) junto con las matrices `d2t` / `t2d` que traducen entre el vocabulario del borrador y el del objetivo. En cada ronda propone 7 tokens en un bloque de tamaño 8 con atención causal interna; el runtime acepta el prefijo más largo que coincide con la salida greedy del objetivo, que añade un token adicional.

El entrenamiento usó 1.309 horas de audio etiquetado procedente de YODAS2 (CC BY 3.0, vídeos completos), AMI y VoxConverse (CC BY 4.0) y AISHELL-4 (Apache 2.0) en los ocho idiomas. Las etiquetas son la propia salida greedy del modelo objetivo mediante sglang-omni con el prompt por defecto de transcripción y diarización, de modo que el borrador aprende a predecir también marcas de tiempo y etiquetas de hablante; se descartaron los ficheros que agotaban el presupuesto de tokens. La fase 1 usó `DFlashDraftModel` con pérdida de entropía cruzada y pesos de posición D-Pace, AdamW con lr 6e-4, 4% de warmup, schedule coseno, 16 épocas (18.624 pasos) sobre 22.931 fragmentos de hasta unos 27 minutos con ventana de 32.768, en dos H200. La fase 2 continuó desde ese checkpoint con 12 épocas (4.980 pasos), lr 3e-4, sobre 596 ficheros largos más 22.925 fragmentos cortos y ventana ampliada a 131.072. El checkpoint publicado corresponde al paso 4.460 de la fase 2.

## Capacidades

- Decodificación especulativa greedy para MOSS-Transcribe-Diarize 0.9B: propone 7 tokens por ronda que el modelo objetivo verifica.
- Predicción de transcripciones con marcas de tiempo y etiquetas de hablante, ya que las etiquetas de entrenamiento incluyen ambos elementos.
- Cobertura multilingüe en ocho idiomas: inglés, chino, japonés, coreano, español, francés, alemán y ruso.
- Manejo de audio corto y largo: desde clips de 10 segundos hasta ficheros de 90 minutos, gracias a la ventana deslizante de 131.072 tokens.
- Rendimiento en conjuntos multihablante (AMI, AISHELL-4, VoxConverse), con longitudes de aceptación de 5,73, 5,29 y 5,03 respectivamente.
- No realiza transcripción autónoma ni tool calling: es un componente auxiliar que depende siempre del modelo objetivo para validar cada token.

## Casos de uso

- Aceleración de pipelines de transcripción masiva: desplegado junto al objetivo en un servicio ASR, reduce el número de pasos de verificación del modelo de 0.9B al aceptar de media unos 5 tokens por ronda, lo que rebaja el coste por hora de audio procesada en cargas por lotes.
- Subtitulado de vídeo largo con hablantes: para ficheros de hasta 90 minutos, el borrador mantiene longitudes de aceptación de 4,87 a 60-90 minutos (4,87 en inglés a 90 minutos), lo que lo hace útil en la generación de subtítulos con marcas de tiempo y diarización.
- Actas de reuniones multihablante: en conjuntos como AMI y AISHELL-4 el borrador alcanza 5,73 y 5,29 tokens aceptados por ronda, adecuado para transcribir reuniones con varios participantes y etiquetas de hablante.
- Atención al cliente con transcripción en tiempo real: con clips de 10 segundos la aceptación es de 4,45 tokens por ronda, suficiente para reducir la latencia de transcripción de llamadas cortas en los ocho idiomas soportados.
- Investigación en decodificación especulativa para audio: sirve como referencia reproducible de un borrador DFlash entrenado sobre un modelo ASR, con datos de aceptación por idioma y por duración para comparar variantes de vocabulario (48k frente a 32k).
- Procesamiento de contenido multilingüe en redes sociales y medios: la cobertura de en, zh, ja, ko, es, fr, de y ru permite transcribir y etiquetar hablantes en un único pipeline sin cambiar de modelo por idioma.
- Evaluación de infraestructura de serving: útil para medir el impacto de la decodificación especulativa en runtimes como sglang-omni o vLLM una vez que estos soporten borradores para este objetivo.

## Benchmarks y rendimiento

Los datos publicados son longitudes de aceptación simuladas en CUDA con objetivo en bf16 (tokens generados divididos entre rondas de verificación), sobre audio no visto: cuatro shards de YODAS2 por idioma, test de AMI, test de AISHELL-4 y test de VoxConverse. No se han medido en un runtime de serving real ni con objetivo cuantizado.

| Borrador | 10s | 60s | 5m | 20m | 60m | 90m | Media por duraciones | Todos los tokens |
|---|---|---|---|---|---|---|---|---|
| Este borrador (vocab 48k) | 4,45 | 4,89 | 5,04 | 5,24 | 5,16 | 4,87 | 4,99 | 5,12 |
| Variante vocab 32k | 4,40 | 4,83 | 4,96 | 5,18 | 5,10 | 4,82 | 4,93 | 5,05 |
| Solo fase 1 | 4,17 | 4,56 | 4,67 | 4,78 | 2,78 | 2,61 | 4,02 | 3,91 |

Por idioma, borrador de 48k:

| Idioma | 10s | 60s | 5m | 20m | 60m | 90m | Todos |
|---|---|---|---|---|---|---|---|
| en | 4,74 | 5,45 | 4,91 | 5,80 | 5,78 | 4,87 | 5,40 |
| zh | 4,77 | 5,38 | 5,83 | 5,89 | - | - | 5,52 |
| ja | 4,29 | 4,65 | 4,95 | 5,07 | - | 4,94 | 4,91 |
| ko | 4,49 | 5,08 | 5,18 | 5,38 | 5,71 | - | 5,28 |
| es | 4,22 | 4,80 | 4,96 | 4,97 | 4,82 | 4,82 | 4,87 |
| fr | 4,52 | 4,83 | 5,00 | 5,02 | 4,90 | 5,51 | 4,97 |
| de | 4,41 | 4,61 | 5,09 | 5,23 | 5,23 | 5,30 | 5,13 |
| ru | 4,24 | 4,55 | 4,52 | 4,63 | 4,85 | 4,63 | 4,64 |

Conjuntos multihablante (48k): AMI 5,73, AISHELL-4 5,29, VoxConverse 5,03. Un guion indica que ese conjunto no tiene grabaciones de esa duración. No hay resultados de MMLU, HumanEval ni GSM8K, que no aplican a este tipo de modelo.

## Requisitos de hardware

- El borrador en bf16 ocupa aproximadamente 0,26 GB (131M parámetros), por lo que cabe holgadamente en cualquier GPU consumer; el repositorio completo pesa 0,3 GB.
- El requisito dominante es el modelo objetivo MOSS-Transcribe-Diarize 0.9B, que debe residir en la misma GPU o en una accesible para la verificación.
- GPU recomendadas: cualquier GPU con suficiente memoria para el objetivo; el entrenamiento se realizó en dos H200, pero la inferencia del borrador es muy ligera.
- Cabe en GPU consumer (RTX 3060, 4060, 4090, etc.) siempre que el objetivo de 0.9B quepa junto con el audio y el contexto de 131.072 tokens.
- Opciones de despliegue: la model card indica que sglang-omni todavía no sirve un borrador para este modelo; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. La librería de referencia es `speculators`.
- Latencia y throughput: no medidos en runtime de serving. La única métrica publicada es la longitud de aceptación (4,99 de media por duraciones, 5,12 sobre todos los tokens), que acota la ganancia teórica en número de rondas de verificación.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Transcribe-Diarize-dflash (este) | Borrador DFlash para ASR con diarización | 131M | 131.072 | Apache 2.0 | Hugging Face, 0 descargas |
| MOSS-Transcribe-Diarize (objetivo) | Modelo ASR con diarización | 0,9B | 131.072 | no disponible en la información | Hugging Face (OpenMOSS-Team) |
| mattymchen/Qwen3-ASR-1.7B-speculator.dflash | Borrador DFlash para ASR | no disponible | no disponible | no disponible | Hugging Face |
| Variante de este borrador con vocab 32k | Borrador DFlash | no disponible | 131.072 | Apache 2.0 | Entrenada, no publicada como checkpoint separado |

La model card señala que no existía ningún otro borrador publicado para MOSS-Transcribe-Diarize cuando se entrenó este, por lo que no hay fila de referencia directa. El único borrador comparable citado es el de Qwen3-ASR-1.7B, que sirve como referencia de formato, no de rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el objetivo MOSS-Transcribe-Diarize 0.9B no produce transcripciones; cualquier uso debe emparejarlo con ese checkpoint.
- Las cifras de aceptación son simulaciones en CUDA con objetivo bf16, no medidas en sglang-omni, vLLM ni MLX, ni con objetivo cuantizado; el rendimiento real en producción puede diferir.
- sglang-omni no soporta todavía un borrador para este modelo, lo que limita el despliegue inmediato.
- En ficheros largos el objetivo a veces termina la transcripción antes de tiempo, alrededor de 16.384 tokens generados: de 357 transcripciones completadas que alcanzaron esa longitud, 83 terminaron ahí y 274 continuaron (la más larga hasta 49.846 tokens); en el conjunto de evaluación se vio afectado 19 de 30. Estos ficheros contribuyen solo con su primera parte a las métricas de aceptación.
- El rendimiento es desigual por idioma: ruso (4,64 de media) y español (4,87) quedan por debajo de chino (5,52) e inglés (5,40); en 60 y 90 minutos faltan datos para chino, japonés y coreano.
- La fase 1 sola degrada mucho en ficheros largos (2,78 a 60 minutos, 2,61 a 90 minutos), lo que subraya la dependencia de la ventana de 131.072 tokens.
- Riesgo de sesgo y alucinación heredado del objetivo: el borrador reproduce la distribución de las etiquetas greedy del modelo base, incluidos sus errores de transcripción y diarización, y no corrige sesgos propios del corpus de entrenamiento (YODAS2, AMI, VoxConverse, AISHELL-4).
- La licencia Apache 2.0 cubre el borrador, pero el uso comercial del conjunto debe verificar también la licencia del modelo objetivo y de los datos de entrenamiento (CC BY 3.0 y CC BY 4.0 en parte del corpus).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente de las métricas publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/wilsonzheng0327/MOSS-Transcribe-Diarize-dflash
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Transcribe-Diarize
- Borrador de referencia de formato: https://huggingface.co/mattymchen/Qwen3-ASR-1.7B-speculator.dflash
- Librería `speculators`: no disponible en la información proporcionada
- Paper, blog o demo adicionales: no disponible en la información proporcionada
