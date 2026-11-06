# travis-moore/sema-pidgin-v0

## Resumen

Sema Pidgin v0 es un ajuste fino (fine-tune) del modelo de síntesis de voz Chatterbox de ResembleAI, especializado en nigerian pidgin (pcm) y, de forma secundaria, en inglés. Lo desarrolla Angelo Asante bajo el paraguas de Sema (semaink.com) y se publica como versión interna v0, cuyo objetivo declarado es validar la tubería de entrenamiento y medir el olvido catastrófico del modelo base, no servir como receta de producción.

El modelo solo entrena la etapa T3 (0.5B de parámetros autorregresivos que convierten texto en tokens semánticos y que porta la pronunciación, el ritmo y el acento), mientras que S3Gen (el vocoder) y el codificador de voz permanecen congelados. Esto significa que la calidad de audio y la fidelidad de clonación de voz son exactamente las del modelo base Chatterbox (MIT), sin tocar.

Es relevante ahora porque aborda un hueco real: la síntesis de voz de calidad en variedades del inglés africano occidental (nigerian y ghanés pidgin), para las que casi no existen modelos abiertos. La línea Sema aspira a un único modelo con tres "patas": inglés estándar, inglés con acento africano e pidgin. Esta v0 solo entrena la pata de pidgin y es, por tanto, un artefacto de investigación y validación, no un producto final.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Chatterbox (TTS): etapa T3 autorregresiva (texto a tokens semánticos) + S3Gen (vocoder) + codificador de voz; solo T3 ajustado |
| Parámetros totales | T3: 0.5B (resto del pipeline congelado, tamaño no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo distribuye safetensors en bf16) |
| Idiomas soportados | pcm (nigerian pidgin), en (inglés) |
| Licencia | sema-internal (license: other, license_name: sema-internal); base Chatterbox MIT |
| Formato de pesos | safetensors (t3_cfg.safetensors, ve.safetensors, s3gen.safetensors), tokenizer.json, conds.pt |

## Arquitectura y entrenamiento

La arquitectura subyacente es Chatterbox, un pipeline TTS compuesto por una etapa autorregresiva T3 (0.5B parámetros) que mapea texto a tokens semánticos, un vocoder S3Gen que sintetiza la forma de onda y un codificador de voz para clonación por referencia. En este fine-tune solo se entrena T3; el codificador de voz y S3Gen se mantienen congelados, de modo que la calidad acústica y la fidelidad de clonación heredan las del base.

El entrenamiento usa el dataset asr-nigerian-pidgin/nigerian-pidgin-1.0 (CC-BY-4.0), con 3.365 clips de entre 1 y 25 segundos de hablantes nativos de nigerian pidgin (aproximadamente 6-10 horas de audio). El split de test se reservó íntegramente para evaluaciones por escucha. La receta es un full fine-tune de T3 con LR 1e-5 (cosine, 100 pasos de warmup), batch efectivo 16 (8 × grad-accum 2), bf16, 1.000 pasos de optimizador (5 épocas) sobre una única GPU L40S. La selección de checkpoint se hizo con evaluación cada 100 pasos y `load_best_model_at_end`; la mejor pérdida de validación fue 5,86 en el paso 400, tras el cual la curva sobreajusta (6,28 en el paso 1000), por lo que el repo publica los pesos del paso 400. No se documenta RLHF, DPO ni otras técnicas de alineación.

## Capacidades

- Síntesis de voz (text-to-speech) en nigerian pidgin (pcm) e inglés (en).
- Clonación de voz por referencia: acepta un clip de 7-10 segundos de la voz objetivo mediante `audio_prompt_path`.
- Control de expresividad y guía de clasificador mediante los parámetros `exaggeration` y `cfg_weight`.
- Reproducción de pronunciación, ritmo y acento de pidgin nigeriano gracias al ajuste de la etapa T3.
- Transferencia ligera a ghanés y camerunés pidgin (no entrenados de forma explícita).
- Retención parcial del inglés del modelo base (comprobación de retención incluida en las muestras).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada.

## Casos de uso

- Localización de contenido para África occidental: generar voces en nigerian pidgin para vídeos, podcasts o audiolibros dirigidos a audiencias de Nigeria y Ghana, usando clips de referencia de hablantes nativos para preservar el acento.
- Pruebas de concepto de asistentes de voz: integrar el modelo en prototipos de atención al cliente o IVR en pidgin, con la advertencia de que v0 es un artefacto interno y no producción.
- Investigación sobre olvido catastrófico: usar el modelo como referencia para medir cuánto inglés estándar se pierde al ajustar solo la etapa T3 sobre un corpus de pidgin.
- Evaluación de tuberías TTS multilingües: validar el flujo `ChatterboxTTS.from_local` con componentes congelados y un T3 sustituido, como plantilla para futuras variantes de la familia Sema.
- Generación de voces sintéticas para subtitulado y doblaje de bajo coste: clonar voces autorizadas de hablantes de referencia para producir pistas de audio en pidgin a partir de guiones de texto.
- Docencia y demostraciones de TTS de bajo recurso: mostrar cómo un corpus de 6-10 horas y una única GPU L40S bastan para adaptar un modelo TTS a una variedad lingüística poco representada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta la pérdida de validación del entrenamiento (mejor 5,86 en el paso 400; 6,28 en el paso 1000) y remite a muestras de audio para evaluación por escucha, sin métricas objetivas como MOS, WER o similitud de hablante.

## Requisitos de hardware

- Entrenamiento documentado: una única GPU NVIDIA L40S (48 GB), bf16, 1.000 pasos.
- Inferencia: el repo pesa 3,2 GB en safetensors; el pipeline completo (T3 0.5B + S3Gen + codificador de voz) cabe con holgura en GPUs de consumo con 8-12 GB de VRAM.
- GPU recomendadas: L40S (entrenamiento), A100/H100 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX 4080 para inferencia en consumo.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 12 GB o superiores, aunque no se publican requisitos oficiales de VRAM.
- Opciones de despliegue: librería `chatterbox` con `ChatterboxTTS.from_local` (ejemplo oficial); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|
| Sema Pidgin v0 | T3 0.5B (resto congelado) | pcm, en | sema-internal | Fine-tune TTS para pidgin nigeriano |
| ResembleAI/chatterbox (base) | T3 0.5B | en (principal) | MIT | TTS multiuso con clonación de voz |
| Modelos TTS de pidgin nigeriano abiertos | no disponible | pcm | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, idiomas y licencia.

## Limitaciones y advertencias

- Entrenado sobre un único corpus de aproximadamente 6-10 horas: se espera deriva de acento residual en pidgin fuera de dominio y posible regresión leve en números, acrónimos y fechas, poco representados en el corpus.
- Cobertura solo ligera, por transferencia, de ghanés y camerunés pidgin.
- Las salidas llevan la marca de agua PerTh de Resemble heredada del vocoder base.
- Clonación de voz: usar únicamente voces sobre las que se tengan derechos.
- Licencia sema-internal (license: other): restricciones de uso comercial no detalladas en la información disponible; conviene revisar el archivo LICENSE antes de cualquier uso en producción.
- Es una versión interna v0, declarada explícitamente como validación de tubería y medición de olvido, no como receta de producción.
- Calidad de audio y fidelidad de clonación limitadas a las del modelo base, al estar S3Gen y el codificador de voz congelados.
- Riesgo de alucinación acústica y de pronunciación incorrecta en texto fuera de dominio; no se documentan sesgos específicos más allá de la deriva de acento.
- Sin métricas objetivas publicadas (MOS, WER, similitud de hablante), la evaluación queda en manos de escucha subjetiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/travis-moore/sema-pidgin-v0
- Modelo base Chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Dataset de entrenamiento: https://huggingface.co/datasets/asr-nigerian-pidgin/nigerian-pidgin-1.0
- Sema: https://semaink.com
- Angelo Asante: https://angeloasante.com
- Curva de entrenamiento: https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/card_v0_loss.png
- Muestras de audio: https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/samples/pidgin_naija_1.mp3, https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/samples/pidgin_naija_2.mp3, https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/samples/ghana_pidgin_angelo.mp3, https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/samples/english_angelo.mp3, https://huggingface.co/travis-moore/sema-pidgin-v0/resolve/main/samples/corpus_heldout.mp3
