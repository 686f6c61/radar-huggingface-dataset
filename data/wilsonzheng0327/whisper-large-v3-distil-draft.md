# wilsonzheng0327/Whisper-large-v3-distil-draft

## Resumen

Whisper-large-v3-distil-draft es un modelo borrador (draft) diseñado específicamente para decodificación especulativa greedy con `openai/whisper-large-v3` en inglés, chino, japonés y cantonés. Lo desarrolla el usuario de HuggingFace wilsonzheng0327 y parte de `distil-whisper/distil-large-v3`, al que se ha hecho fine-tuning sobre las propias transcripciones de large-v3 para que funcione como asistente en generación asistida dentro de transformers. Su función no es transcribir de forma autónoma, sino proponer tokens que el modelo objetivo verifica en una sola pasada, acelerando la inferencia.

El problema que resuelve es concreto: distil-large-v3 fue entrenado solo en inglés y, como borrador en otros idiomas, apenas aporta tokens aceptables (alrededor de 1,03 tokens por ronda). Este draft acepta entre 5,2 y 5,7 tokens por ronda en los cuatro idiomas, lo que se traduce en aceleraciones de 1,3 a 1,75 veces en pruebas con transformers 5.19 sobre una H200. La arquitectura es la de distil-large-v3: 32 capas de encoder y 2 de decoder, con hidden de 1280, vocabulario de 51.866 tokens y 756,4 millones de parámetros totales, de los que solo se entrenaron 119,4 millones del decoder.

Es relevante ahora porque la decodificación especulativa se ha consolidado como técnica estándar para reducir latencia en ASR, y faltaban borradores multilingües que acompañasen a large-v3 más allá del inglés. El modelo se publica con licencia Apache 2.0 y formato safetensors, aunque su utilidad está acotada al ecosistema transformers: sglang-omni, según el autor, todavía no soporta un draft Whisper separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | WhisperForConditionalGeneration (variante distil): 32 capas de encoder, 2 capas de decoder, hidden 1280 |
| Parametros totales | 756.405.760 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de Whisper large-v3: 30 s por clip) |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en, zh, ja, yue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura de `distil-whisper/distil-large-v3`: un encoder de 32 capas idéntico bit a bit al de large-v3 en bf16 (verificado en los 487 tensores) y un decoder de solo 2 capas con embedding atado. Esa coincidencia del encoder permite que el runtime le pase directamente la salida del encoder del modelo objetivo, de modo que el draft lee el audio por cross-attention igual que large-v3 y no depende de un contexto textual separado. El draft propone un token por forward pass de sus dos capas de decoder, con su propia KV cache, y el objetivo verifica las propuestas en una pasada. Cargado como `WhisperForCausalLM` (solo el decoder), funciona como assistant en la generación asistida de transformers.

El entrenamiento congeló el encoder en bf16 y ajustó únicamente el decoder y su embedding atado (119,4 M de parámetros) sobre 913.227 clips (unas 2.740 horas: inglés 1.319 h, chino 459 h, japonés 885 h, cantonés 77 h). Las fuentes incluyen YODAS2 en000/zh000/ja000 (CC BY 3.0, cortado a tramos de 3-30 s), LibriSpeech train-clean-360, People's Speech clean, VoxPopuli en, AISHELL-1, Common Voice 17 ja, un espejo de Common Voice 21 yue, words.hk y FLEURS en/zh/ja/yue train. Las etiquetas son las transcripciones greedy del propio large-v3 generadas con sglang-omni (hasta 440 tokens nuevos, 28,9 M de tokens de etiqueta); se descartaron el 0,7 % de transcripciones que se repetían hasta agotar el presupuesto. Cada ejemplo es el prompt servido (`<|startoftranscript|>`, idioma, `<|transcribe|>`, `<|notimestamps|>`) más la transcripción, con entropía cruzada sobre los tokens de la transcripción y el token de fin. Se usó AdamW con lr 1e-4, weight decay 0,01, warmup del 2 %, coseno, gradient clip 1.0, 64 clips por GPU en dos H200, 3,5 épocas (24.969 pasos) en 3 h 23 min a unos 270 clips por segundo. El checkpoint publicado es el último paso (24.969), también el mejor en el subconjunto de validación: la aceptación pasó de 4,73 en el paso 2.365 a 5,35 en el 13.661 y 5,47 al final.

## Capacidades

- Decodificación especulativa greedy como modelo borrador de `openai/whisper-large-v3` en inglés, chino, japonés y cantonés.
- Propuesta de un token por forward pass con su propia KV cache; el modelo objetivo verifica en una pasada.
- Integración como assistant en la generación asistida de transformers mediante `WhisperForCausalLM`, recibiendo la salida del encoder del objetivo.
- Lectura del audio por cross-attention, igual que el modelo objetivo, sin depender de un contexto textual de borrador.
- Reutilización del vocabulario de large-v3 (51.866 tokens) y de su lista de 88 `suppress_tokens` durante el muestreo del borrador.
- No es un modelo de transcripción autónomo: no está pensado para generar transcripciones completas por sí solo.

## Casos de uso

- Aceleración de pipelines de transcripción con Whisper large-v3 en inglés: el draft acepta 5,50 tokens por ronda de media y ofrece una aceleración de 1,75 veces en las pruebas del autor, adecuado para servicios de subtitulado donde el objetivo ya es large-v3.
- Subtitulado y transcripción en chino: con 5,67 tokens aceptados por ronda y 1,30 veces de aceleración, mejora sustancialmente frente a distil-large-v3, que cae a 1,03 tokens por ronda y ralentiza a 0,54 veces.
- Transcripción en japonés con latencia reducida: 5,61 tokens por ronda y 1,59 veces de aceleración, útil en asistentes de voz o actas de reuniones en japonés.
- Procesamiento de audio en cantonés: 5,19 tokens por ronda y 1,57 veces de aceleración, un idioma con pocos borradores específicos disponibles.
- Despliegue en transformers para prototipos y evaluación: se integra con `target.generate(..., assistant_model=draft)` sin cambios en el pipeline, lo que facilita medir el impacto antes de invertir en optimizaciones de runtime.
- Transcripción por lotes en GPU H200 o similar: el autor reporta unos 270 clips por segundo durante el entrenamiento con el encoder congelado, lo que da una idea del throughput alcanzable en hardware de datacenter con el draft activo.
- Investigación sobre decodificación especulativa en ASR: sirve como referencia reproducible para comparar borradores con cross-attention frente a alternativas tipo DFlash que no ven el audio.

## Benchmarks y rendimiento

Longitud de aceptación simulada en decodificación especulativa greedy sobre CUDA en bf16 (el draft propone 7 tokens por posición, se acepta el prefijo más largo que coincide con la transcripción del objetivo y el objetivo añade un token; aceptación = tokens generados / rondas). Solo audio de validación: 3.051 clips.

| Draft | Libri clean | Libri other | FLEURS en | YODAS en | FLEURS zh | YODAS zh | CV ja | FLEURS ja | YODAS ja | CV yue | FLEURS yue | en | zh | ja | yue | all |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| este draft | 6,57 | 6,15 | 6,04 | 4,44 | 5,97 | 5,46 | 5,50 | 6,36 | 5,25 | 5,12 | 5,22 | 5,50 | 5,67 | 5,61 | 5,19 | 5,53 |
| distil-large-v3 | 6,80 | 6,29 | 6,27 | 3,68 | 1,03 | 1,03 | 1,05 | 1,02 | 1,03 | 1,09 | 1,03 | 5,14 | 1,03 | 1,03 | 1,05 | 1,36 |
| DFlash de 5 capas sobre las mismas etiquetas (no publicado) | 3,25 | 3,11 | 3,18 | 3,08 | 3,39 | 3,49 | 3,51 | 3,78 | 3,56 | 3,22 | 2,85 | 3,15 | 3,45 | 3,62 | 2,95 | 3,33 |

Tiempo de pared de `target.generate(...)` con transformers 5.19, bf16, SDPA, batch 1, en una H200; 440 clips (40 por fuente), con rotación de orden entre modos. El tiempo incluye el encoder y la aceleración es el tiempo sin draft dividido por el tiempo asistido.

| Assistant | Libri clean | Libri other | FLEURS en | YODAS en | FLEURS zh | YODAS zh | CV ja | FLEURS ja | YODAS ja | CV yue | FLEURS yue | en | zh | ja | yue | all |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| este draft | 2,33 | 2,22 | 1,92 | 1,42 | 1,70 | 0,88 | 1,75 | 2,03 | 1,33 | 1,64 | 1,55 | 1,75 | 1,30 | 1,59 | 1,57 | 1,58 |
| distil-large-v3 | 2,51 | 2,07 | 2,26 | 0,97 | 0,58 | 0,49 | 0,62 | 0,61 | 0,53 | 0,62 | 0,60 | 1,44 | 0,54 | 0,57 | 0,61 | 0,73 |

En inglés el draft gana 0,36 puntos de aceptación frente a distil-large-v3, todo en YODAS2, y pierde entre 0,14 y 0,23 en LibriSpeech y FLEURS, audio de lectura donde distil-large-v3 ya era fuerte. La excepción en velocidad es YODAS2 chino (0,88 veces), por clips de unos 17 tokens de salida de media. El autor advierte que la longitud de aceptación no equivale a velocidad: este draft gasta una pasada de decoder por token propuesto, mientras que un DFlash propone el bloque entero en una pasada.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repo ocupa 1,5 GB en safetensors en bf16, a lo que hay que sumar la memoria del modelo objetivo large-v3 (unos 3 GB en bf16) y las cachés de atención.
- GPU recomendadas: el autor valida en H200; por tamaño, el draft en bf16 debería caber en GPUs consumer con suficiente VRAM para alojar también large-v3.
- Cabe en GPU consumer: no confirmado en la información disponible; depende de la VRAM conjunta de objetivo y draft.
- Opciones de despliegue: transformers 5.19 mediante generación asistida (`assistant_model`); sglang-omni no tiene soporte para un draft Whisper separado según el autor.
- Latencia y throughput: aceleraciones de 1,30 a 1,75 veces por idioma y 1,58 veces de media en las pruebas del autor; durante el entrenamiento se procesaron unos 270 clips por segundo con el encoder congelado en dos H200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|---|
| Whisper-large-v3-distil-draft | 756,4 M (119,4 M entrenados) | ventana de audio de 30 s por clip | en, zh, ja, yue | apache-2.0 | HuggingFace, transformers | Draft para large-v3; aceptación media de 5,53 |
| distil-whisper/distil-large-v3 | no disponible en la información | ventana de audio de 30 s por clip | en (entrenado solo en inglés) | no disponible en la información | HuggingFace | Buen borrador en inglés (5,14 de aceptación), inútil en zh/ja/yue (alrededor de 1,03) |
| DFlash de 5 capas sobre las mismas etiquetas | no disponible | no disponible | en, zh, ja, yue | no disponible | no publicado | No ve el audio; aceptación media de 3,33, inferior a este draft |

## Limitaciones y advertencias

- No es un modelo de transcripción autónomo: solo tiene sentido como borrador de large-v3 en decodificación especulativa; usarlo solo produciría transcripciones de baja calidad.
- La aceleración depende del idioma y del dominio: en YODAS2 chino baja a 0,88 veces y en LibriSpeech y FLEURS pierde aceptación frente a distil-large-v3.
- La longitud de aceptación no implica velocidad: el draft gasta una pasada de decoder por token propuesto, a diferencia de propuestas tipo DFlash que generan el bloque en una pasada.
- Cobertura lingüística limitada a inglés, chino, japonés y cantonés; el resto de idiomas de large-v3 no están soportados como borrador.
- Riesgo de alucinación: las propuestas del draft se verifican contra el objetivo, pero el entrenamiento se hizo sobre transcripciones greedy de large-v3, por lo que hereda sus errores sistemáticos.
- Sesgos: no se documentan análisis de sesgo en la información disponible; las fuentes de datos (YODAS2, Common Voice, AISHELL-1, FLEURS) condicionan la distribución de acentos y dominios.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las licencias de los datasets de entrenamiento citados (CC BY 3.0, CC BY 4.0, CC0, Apache-2.0) si se redistribuye el modelo.
- Soporte de runtime limitado: sglang-omni no tiene ruta para un draft Whisper separado; la integración validada es transformers 5.19.
- El checkpoint publicado es el último paso de entrenamiento, también el mejor en validación, pero no hay evaluación independiente más allá de la del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wilsonzheng0327/Whisper-large-v3-distil-draft
- Modelo base: https://huggingface.co/distil-whisper/distil-large-v3
- Modelo objetivo: https://huggingface.co/openai/whisper-large-v3
- Repositorio de transformers (generación asistida): https://github.com/huggingface/transformers
- sglang-omni (usado para generar las etiquetas): https://github.com/sgl-project/sglang
- YODAS2: https://huggingface.co/datasets/espnet/yodas2
- LibriSpeech: https://www.openslr.org/12
- AISHELL-1: https://www.openslr.org/93
- Common Voice: https://commonvoice.mozilla.org
- FLEURS: https://huggingface.co/datasets/google/fleurs
