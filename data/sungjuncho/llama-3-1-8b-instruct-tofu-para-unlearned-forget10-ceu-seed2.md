# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed2

## Resumen

El modelo `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed2` es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general, sino un artefacto experimental de *machine unlearning*: parte de un fine-tune previo sobre el dataset TOFU-para y le aplica el algoritmo CEU (de la librería `open-unlearning`) para eliminar el conocimiento asociado a un conjunto de olvido (*forget set*) de 400 pares pregunta-respuesta. Su relevancia es metodológica: forma parte de una colección que separa explícitamente *untraining* (borrado de las muestras concretas) de *unlearning* (borrado del conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso con 8.030.261.248 parámetros, pesos en safetensors y licencia Llama 3.1 Community License. El autor no documenta en la model card la longitud de contexto, los idiomas soportados ni los tipos de cuantización, aunque al heredar la arquitectura de Llama 3.1 8B Instruct esos valores son los del modelo base de Meta (128K tokens de contexto, multilingüe), extremo que esta ficha no puede confirmar como verificado por el autor.

El interés práctico es limitado fuera de la investigación en privacidad y cumplimiento (derecho al olvido, RGPD). Los resultados reportados muestran que el modelo olvida eficazmente el conjunto de olvido (probabilidad Q-A de 1,06e-06, ROUGE 0.000) pero a costa de una utilidad de modelo de 0.000, es decir, un colapso completo de las capacidades del modelo. Es, por tanto, un caso de estudio sobre el trade-off entre olvido y degradación, no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card (heredada de Llama 3.1 8B Instruct: 128K tokens, no verificado por el autor) |
| Tipos de cuantizacion | no disponible (solo se documenta carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, que a su vez es un ajuste de Llama 3.1 8B Instruct sobre el dataset TOFU-para (TOFU con erratas en nombres corregidas, más cinco versiones parafraseadas verificadas de cada par QA). Sobre ese punto de partida se aplica CEU mediante la librería `open-unlearning`, con los hiperparámetros por defecto de CEU, sin *gradient clipping*, batch efectivo de 32 y semilla 2. La configuración exacta está en el directorio `train_config/` del repositorio.

El conjunto de olvido son únicamente los 400 pares QA originales de forget10; el conjunto de retención usado por los métodos que lo requieren comprende retain90 más las paráfrasis para1 y para2 (10.800 ejemplos). La innovación metodológica no está en la arquitectura, sino en la evaluación: el autor introduce la métrica FADE (divergencia KL simétrica frente al modelo de referencia sobre respuestas muestreadas de ambos, 10 por pregunta, temperatura 1, estimador Rao-Blackwellizado), que mide la indistinguibilidad respecto a un modelo de referencia ideal. Se reportan dos variantes: FADE de *untraining* y FADE de *unlearning*, cada una contra su referencia correspondiente (modelo retenido con forget10 eliminado frente a modelo retenido completo).

## Capacidades

- Generación de texto conversacional, heredada de Llama 3.1 8B Instruct.
- Fine-tune específico sobre el dataset TOFU-para (pares QA con paráfrasis), orientado a experimentos de olvido.
- Aplicación del algoritmo CEU de *machine unlearning* sobre un conjunto de olvido definido (forget10 original).
- Evaluación cuantitativa de olvido mediante FADE, calidad de olvido TOFU, *truth ratio*, probabilidad Q-A y ROUGE.
- Soporte de *tool calling*, agentes o *thinking mode*: no documentado por el autor; no se debe asumir en este checkpoint.
- Capacidades multilingües: no documentadas.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar CEU con otros algoritmos (gradient ascent, NPO, etc.) sobre el mismo conjunto de olvido y la misma semilla.
- Estudio del trade-off olvido-utilidad: el modelo permite medir empíricamente el coste de un olvido agresivo, dado que reporta utilidad de modelo 0.000 junto a un olvido casi perfecto.
- Reproducibilidad de experimentos: la semilla 2, la configuración en `train_config/` y los resultados por pregunta en `evals/` permiten replicar el pipeline con `open-unlearning`.
- Auditoría de metodologías de evaluación de olvido: útil para validar la métrica FADE frente a métricas clásicas (ROUGE, probabilidad Q-A) y comprobar su sensibilidad a la semilla de referencia.
- Docencia y divulgación: ejemplo canónico de cómo un *unlearning* mal calibrado destruye la utilidad del modelo, útil en cursos de privacidad y ética de IA.
- Base para experimentos de *untraining* frente a *unlearning*: comparar este checkpoint con los de la colección TOFU-para para separar el borrado de muestras del borrado de conocimiento.
- No recomendado para despliegue en producción: la utilidad de modelo nula lo invalida para tareas reales de generación.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 518,45 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 paráfrasis) | 497,07 (original 499,8 / para1 494,9 / para2 496,5) |
| Calidad de olvido TOFU (vs `x2-retain90-seed2`) | 7,36e-40 |
| *Truth ratio* de olvido | 0,871 |
| Probabilidad Q-A de olvido | 1,06e-06 |
| ROUGE Q-A de olvido | 0,000 |
| Utilidad de modelo | 0,000 |

Puntos de referencia FADE publicados por el autor (columna *unlearning*: global y filas original / para1 / para2):

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| *Perfect untrainer* (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| *Perfect unlearner* (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin olvido (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

El autor advierte que FADE es una distancia, no una dirección: un valor entre dos filas no implica que el modelo se sitúe entre esos modelos. No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos (8,03B parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 20-24 GB para contexto moderado.
- En cuantización de 8 bits: unos 8-9 GB de pesos; en 4 bits: unos 4-5 GB. El autor no documenta cuantizaciones oficiales, por lo que habría que generarlas con herramientas de terceros (llama.cpp, bitsandbytes).
- GPU recomendadas: A100 40/80 GB, H100, L40S para inferencia en bfloat16 sin cuantizar; RTX 4090 (24 GB) es suficiente para bfloat16 con contexto corto o para cuantizaciones de 8/4 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 12-16 GB si se cuantiza.
- Opciones de despliegue: `transformers` (documentado en la model card), `text-generation-inference` (etiqueta del repo), vLLM y llama.cpp como alternativas estándar para arquitectura Llama; no verificadas por el autor.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Olvido (FADE unlearning) | Utilidad | Licencia |
|---|---|---|---|---|---|
| Este modelo (CEU, seed 2) | 8,03B | no disponible | 497,07 | 0,000 | Llama 3.1 |
| *Perfect unlearner* (`x2-retain90-seed2`) | 8,03B | no disponible | 29,8 | no reportada | Llama 3.1 |
| *Perfect untrainer* (`x2-retain90-forget10para-seed2`) | 8,03B | no disponible | 136,7 | no reportada | Llama 3.1 |
| Sin olvido (`x2-full-seed0`) | 8,03B | no disponible | 156,5 | no reportada | Llama 3.1 |

La comparación relevante es interna a la colección TOFU-para del mismo autor, ya que no se han publicado comparaciones con otros modelos de olvido en la información disponible. El resultado clave es que este checkpoint se aleja del ideal de olvido (29,8) y se acerca al del modelo sin olvidar (156,5) en la métrica de *unlearning*, mientras que su utilidad es nula.

## Limitaciones y advertencias

- Utilidad de modelo de 0.000: el checkpoint ha colapsado y no es apto para generación de texto útil en producción.
- FADE de *unlearning* de 497,07, muy lejos del ideal (29,8) y por encima del modelo sin olvidar (156,5): el olvido del conocimiento subyacente es deficiente pese a que las métricas clásicas (ROUGE, probabilidad Q-A) indiquen borrado.
- Riesgo de alucinación: no evaluado en la información disponible; con utilidad nula, la generación carece de fiabilidad.
- Sesgos conocidos: no documentados; hereda los del fine-tune sobre TOFU-para y, en última instancia, los de Llama 3.1 8B Instruct.
- Idiomas y longitud de contexto no documentados por el autor.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier uso.
- Solo se documenta carga en bfloat16; no hay cuantizaciones oficiales ni garantías de que el comportamiento de olvido se preserve tras cuantizar.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria; los resultados proceden únicamente del autor.
- No usar como sustituto de un modelo de propósito general ni como base para aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-ceu-seed2
- Modelo base del fine-tune: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (implementación de CEU): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: incluida en el repositorio del modelo (`LICENSE`)
