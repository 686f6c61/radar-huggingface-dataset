# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, que ha sido sometido a un proceso de *machine unlearning* mediante la técnica GradAscent sobre el conjunto de datos TOFU-para. El objetivo no es desplegar un asistente generalista, sino servir como artefacto de investigación para estudiar si un método de desaprendizaje elimina realmente el conocimiento subyacente o solo los ejemplos concretos vistos durante el entrenamiento.

El modelo parte de un checkpoint intermedio (`Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`) afinado sobre la totalidad de TOFU más dos versiones parafraseadas de cada par pregunta-respuesta. Sobre esa base se aplica GradAscent con los hiperparámetros por defecto de la librería `open-unlearning` (sin *gradient clipping*, batch efectivo de 32, semilla 0) para "olvidar" las 400 preguntas del conjunto forget10 original. El resultado se evalúa con métricas FADE, *truth ratio*, probabilidad Q-A y ROUGE, además de la utilidad del modelo.

La relevancia es metodológica: la model card separa explícitamente *untraining* (borrar los ejemplos exactos) de *unlearning* (borrar el conocimiento que el modelo también aprendió en otras formulaciones). Los resultados publicados muestran que este checkpoint reduce a cero la probabilidad y el ROUGE sobre el conjunto forget, pero también colapsa la utilidad del modelo a 0.000, lo que lo convierte en un caso de estudio sobre el coste del desaprendizaje agresivo más que en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1, 128k en el modelo base) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 16,1 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Modelo base | sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 |
| Dataset de entrenamiento | sungjuncho/TOFU-para |
| Metodo de desaprendizaje | GradAscent (open-unlearning, defaults) |
| Semilla | 0 |
| Descargas | 854 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct: un transformer decoder-only con 8.030.261.248 parámetros, atención con RoPE, GQA y las innovaciones estándar de la familia Llama 3.1 (tokenizador de 128k entradas, contexto largo en el modelo original). El checkpoint aquí publicado no modifica la arquitectura, solo los pesos, tras un proceso de desaprendizaje.

El pipeline de entrenamiento tiene tres etapas documentadas. Primero, un ajuste fino supervisado sobre TOFU-para completo (TOFU con erratas en nombres corregidas) más dos versiones parafraseadas de cada par QA, dando lugar al modelo `x2-full-seed0`. Segundo, la aplicación de GradAscent con los valores por defecto de `open-unlearning` sobre el conjunto forget10 original (400 pares QA), sin *gradient clipping* y con batch efectivo 32. Tercero, la evaluación mediante FADE (divergencia KL simétrica respecto a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado), junto con *truth ratio*, probabilidad Q-A y ROUGE sobre el conjunto forget, y la métrica de utilidad del modelo. No se documentan datos de RLHF ni DPO específicos para este checkpoint; las innovaciones técnicas se limitan al propio protocolo de desaprendizaje y a la separación conceptual entre *untraining* y *unlearning*.

## Capacidades

- Generación de texto conversacional: hereda la capacidad del Llama 3.1 8B Instruct original, aunque el proceso de desaprendizaje degrada severamente la utilidad medida (0.000 en la evaluación publicada).
- Razonamiento y conocimiento factual: no evaluado de forma independiente en la información disponible; la métrica de utilidad del modelo es 0.000.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el modelo base Llama 3.1 es multilingüe, pero no se documenta el efecto del desaprendizaje por idioma.
- Capacidad especial: modo de evaluación de desaprendizaje (forget10) con métricas FADE, *truth ratio*, probabilidad Q-A y ROUGE publicadas por semilla.

## Casos de uso

- Investigación en *machine unlearning*: servir como baseline reproducible para comparar GradAscent frente a otros métodos (p. ej. NPO, RMU) sobre el mismo modelo base y la misma semilla, usando las métricas FADE y utilidad publicadas.
- Estudio del colapso de utilidad: analizar por qué un desaprendizaje agresivo lleva la utilidad del modelo a 0.000 mientras reduce a cero la probabilidad sobre el conjunto forget, y qué hiperparámetros (clipping, learning rate, batch) podrían mitigarlo.
- Evaluación de la distinción *untraining* vs *unlearning*: emplear el checkpoint junto a `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` para medir cuánto del conocimiento "olvidado" reaparece en formulaciones parafraseadas.
- Reproducibilidad de experimentos con semillas: usar el par de modelos de semilla 0, 1 y 2 para cuantificar la varianza entre ejecuciones (FADE untraining 5472,5 ± 944,4; FADE unlearning 5203,5 ± 850,9).
- Auditoría de privacidad y cumplimiento: como caso de estudio de hasta qué punto el desaprendizaje por GradAscent elimina información sensible de un modelo afinado, midiendo la probabilidad Q-A residual (0.000 en forget).
- Docencia y formación: ilustrar en cursos de seguridad de IA los compromisos entre olvido y utilidad, usando los resultados publicados y los scripts de `open-unlearning` para reproducir el experimento.

## Benchmarks y rendimiento

Resultados publicados en la model card (semilla 0, frente a los modelos de referencia de la misma semilla):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 6235,76 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 5813,46 (original 5822,1 / para1 5809,4 / para2 5808,9) |
| Calidad de olvido TOFU (vs `x2-retain90-seed0`) | 1,06e-239 |
| *Truth ratio* forget | 6,54e-49 |
| Probabilidad Q-A forget | 0,000 |
| ROUGE Q-A forget | 0,000 |
| Utilidad del modelo | 0,000 |

Variación entre semillas 0-2:

| Metrica | seed 0 | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 6235,8 | 5765,4 | 4416,3 | 5472,5 ± 944,4 |
| FADE, unlearning | 5813,5 | 5565,6 | 4231,5 | 5203,5 ± 850,9 |
| Probabilidad Q-A forget | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| ROUGE Q-A forget | 0,000 | 0,010 | 0,043 | 0,018 ± 0,023 |
| *Truth ratio* forget | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Utilidad del modelo | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |

Puntos de referencia FADE publicados:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 16 GB en bfloat16 (8,03 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para inferencia en bfloat16 sin cuantizar; RTX 4090 24 GB y RTX A6000 48 GB también suficientes en bfloat16.
- GPU de consumo: cabe en RTX 4090 24 GB en bfloat16; en GPUs con 16 GB o menos (RTX 4080, RTX 4070 Ti Super) requiere cuantización a 8 bits o 4 bits, no documentada oficialmente para este checkpoint.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference`), y endpoints compatibles (tag `endpoints_compatible`). No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...gradascent-seed0`) | 8,03 B | no disponible (heredado de Llama 3.1) | Unlearning GradAscent sobre TOFU-para | llama3.1 | Hugging Face, 854 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | Modelo de partida, sin desaprendizaje | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03 B | no disponible | Referencia "perfect unlearner" (retain90) | llama3.1 | Hugging Face |
| `meta-llama/Llama-3.1-8B-Instruct` | 8,03 B | 128k | Modelo base instructivo generalista | llama3.1 | Hugging Face |

La comparación relevante es frente a los checkpoints de la misma colección TOFU-para, ya que el modelo no está pensado para competir con asistentes generalistas: su rendimiento en tareas estándar no se documenta y su utilidad medida es 0.000.

## Limitaciones y advertencias

- Utilidad del modelo 0.000 en la evaluación publicada: el checkpoint no es apto para uso conversacional, generación de código, atención al cliente ni ninguna tarea de producción.
- Probabilidad Q-A y ROUGE forget a 0.000 indican olvido de los ejemplos exactos, pero FADE unlearning (5813,46) sigue lejos del "perfect unlearner" (29,8), lo que sugiere que el conocimiento subyacente puede persistir en formulaciones parafraseadas.
- Alta varianza entre semillas en FADE (sd de 944,4 en untraining y 850,9 en unlearning), por lo que conclusiones basadas en una sola semilla son poco fiables.
- Riesgo de alucinación: no evaluado en la información disponible; la degradación general del modelo hace esperable un comportamiento errático fuera del conjunto de evaluación.
- Sesgos conocidos: no documentados para este checkpoint; hereda los del Llama 3.1 8B Instruct original, pero el desaprendizaje puede alterar su distribución de forma no controlada.
- Idiomas soportados: no disponibles; el efecto del desaprendizaje sobre idiomas distintos del inglés no está medido.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el archivo `LICENSE` del repositorio antes de cualquier uso.
- Uso previsto exclusivamente como artefacto de investigación en *machine unlearning*; no debe desplegarse como asistente.
- No se publican pesos GGUF ni cuantizaciones oficiales, lo que limita el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-gradascent-seed0
- Modelo base (checkpoint intermedio): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia "perfect unlearner" (retain90): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer" (retain90-forget10para): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Librería open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo original Llama 3.1 8B Instruct: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
