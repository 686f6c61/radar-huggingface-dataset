# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2 es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino un checkpoint de referencia dentro de la colección TOFU-para, un conjunto de experimentos sobre desaprendizaje (unlearning) de conocimiento en modelos de lenguaje. Su función es servir como modelo de partida ("starting model") contra el que se comparan los checkpoints "desaprendidos" de la misma colección.

El modelo se ha entrenado sobre el dataset sungjuncho/TOFU-para, una versión corregida del benchmark TOFU (Typo-corrected TOFU) que añade cinco paráfrasis verificadas de cada par pregunta-respuesta. En concreto, este checkpoint usa las variantes `full`, `full_para1` y `full_para2`, es decir, 12.000 filas (4.000 pares originales más dos versiones parafraseadas de cada uno). El objetivo del experimento es separar el "untraining" (olvidar las muestras exactas vistas durante el ajuste) del "unlearning" real (olvidar el conocimiento subyacente aunque aparezca con otras formulaciones).

Arquitectura transformer decoder-only de tipo Llama 3.1, con 8.030.261.248 parámetros totales (según safetensors) y una ventana de contexto de 128.000 tokens heredada del modelo base. Es relevante ahora porque forma parte de una línea de investigación activa sobre evaluación rigurosa del desaprendizaje, con métricas como FADE y comparaciones entre semillas (seed 0, 1 y 2) que permiten cuantificar el ruido experimental. Su utilidad práctica es fundamentalmente de investigación, no de despliegue en producción como asistente general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredado del modelo base Llama 3.1; no confirmado de forma explícita en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura estándar de Llama 3.1 de 8B (atención con RoPE, GQA y SwiGLU, sin innovaciones arquitectónicas propias respecto al base). El ajuste es un full finetune de todos los pesos sobre el dataset TOFU-para, que contiene 4.000 pares pregunta-respuesta del benchmark TOFU con erratas corregidas, más dos versiones parafraseadas y verificadas de cada par. En total, 12.000 filas de entrenamiento (`full` + `full_para1` + `full_para2`).

El entrenamiento se realizó durante 5 épocas, con learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y la plantilla de chat oficial de Llama 3.1. Se usó el código `src/train.py` de open-unlearning con la configuración exacta en `train_config/`. La semilla 2 solo altera el orden de los datos. No se documentan fases de RLHF ni DPO en este checkpoint; el alineamiento conversacional proviene del modelo base Instruct. La innovación metodológica no está en la arquitectura, sino en el diseño experimental: separar untraining de unlearning mediante paráfrasis y medir con FADE (divergencia KL simétrica frente a un modelo de referencia).

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1, con soporte de system prompt y turnos múltiples.
- Razonamiento y respuesta a preguntas sobre el corpus TOFU-para (conocimiento factual sintético inyectado durante el ajuste).
- Reproducción de respuestas a pares pregunta-respuesta del dataset, incluidas sus paráfrasis, con alta probabilidad (0.994 en forget Q-A probability).
- Capacidades generales heredadas del Llama-3.1-8B-Instruct base: generación de código, matemáticas básicas, tool calling y function calling según lo documentado por Meta para el modelo original.
- Capacidades multilingües: las del modelo base, aunque este checkpoint no documenta idiomas soportados de forma explícita.
- No dispone de modo "thinking" ni de visión o audio.

## Casos de uso

- Investigación en desaprendizaje de máquinas: sirve como punto de partida y control experimental para comparar métodos de unlearning frente al modelo sin desaprender, usando las métricas FADE y TOFU forget quality.
- Evaluación de robustez frente a paráfrasis: al haberse entrenado con dos paráfrasis por pregunta, permite medir si un método de unlearning elimina el conocimiento subyacente o solo las formulaciones exactas vistas en entrenamiento.
- Reproducibilidad de experimentos: la colección incluye semillas 0, 1 y 2 con configuraciones idénticas, lo que facilita replicar resultados y cuantificar la varianza entre ejecuciones (sd de FADE de 0.7 en untraining).
- Estudio de olvido selectivo en modelos de 8B: útil para analizar cómo se distribuye el conocimiento factual en los pesos de un modelo denso de tamaño medio y qué técnicas lo eliminan con menor pérdida de utilidad (model utility 0.631).
- Generación de datasets sintéticos de evaluación: el modelo puede generar respuestas a las preguntas TOFU para construir conjuntos de referencia o comparar distribuciones de salida entre checkpoints.
- Docencia y formación en privacidad de modelos: sirve como ejemplo práctico de por qué el borrado de datos de entrenamiento no equivale al olvido de conocimiento, ilustrando la diferencia entre untraining y unlearning.

## Benchmarks y rendimiento

Resultados publicados en la model card (antes de cualquier desaprendizaje, semilla 2):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs x2-retain90-forget10para-seed2) | 80,85 |
| FADE, unlearning (vs x2-retain90-seed2) | 156,25 (original 155,4 / para1 154,8 / para2 158,6) |
| TOFU forget quality (vs x2-retain90-seed2) | 2,67e-40 |
| Forget truth ratio | 0,355 |
| Forget Q-A probability | 0,994 |
| Forget Q-A ROUGE | 0,994 |
| Model utility | 0,631 |

Comparación entre semillas:

| Metrica | seed 0 | seed 1 | seed 2 (este modelo) | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 82,2 | 81,8 | 80,8 | 81,6 ± 0,7 |
| FADE, unlearning | 156,5 | 156,1 | 156,2 | 156,3 ± 0,2 |
| Forget Q-A probability | 0,995 | 0,994 | 0,994 | 0,994 ± 0,001 |
| Forget Q-A ROUGE | 0,997 | 0,995 | 0,994 | 0,996 ± 0,002 |
| Forget truth ratio | 0,353 | 0,355 | 0,355 | 0,354 ± 0,001 |
| Model utility | 0,655 | 0,656 | 0,631 | 0,647 ± 0,014 |

Puntos de referencia FADE de la colección:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (x2-full, este modelo, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomiendan 20-24 GB para contexto moderado.
- En cuantización de 8 bits: alrededor de 8-9 GB de VRAM; en 4 bits: alrededor de 5-6 GB (estimaciones a partir del número de parámetros, no documentadas por el autor).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bfloat16 con contexto corto. Para contexto largo cercano a 128K tokens se requiere mayor memoria por la caché KV.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 con contexto moderado, y en RTX 3090/4080 con cuantización 8 o 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp/Ollama si se generan pesos GGUF (no incluidos en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (TOFU-para x2-full-seed2) | 8,03B | 128K (heredado) | llama3.1 | Full finetune sobre TOFU-para, checkpoint de referencia | Hugging Face, 194 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128K | llama3.1 | Modelo Instruct de propósito general | Hugging Face, ampliamente usado |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed2 | 8,03B | 128K (heredado) | llama3.1 | "Perfect unlearner" de la colección (referencia de desaprendizaje) | Hugging Face, misma colección |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed2 | 8,03B | 128K (heredado) | llama3.1 | "Perfect untrainer" de la colección | Hugging Face, misma colección |

Los tres modelos de la colección comparten arquitectura y tamaño; la diferencia está en el subconjunto de datos de entrenamiento y, por tanto, en su comportamiento frente a las métricas FADE y TOFU. Frente al Llama-3.1-8B-Instruct original, este checkpoint ha perdido parte de la utilidad general (model utility 0.631) a cambio de memorizar el corpus TOFU-para.

## Limitaciones y advertencias

- Modelo de investigación: está diseñado como referencia experimental para estudios de unlearning, no como asistente de producción.
- Memorización deliberada del corpus TOFU-para: contiene conocimiento factual sintético inyectado por ajuste fino, lo que puede producir respuestas sesgadas hacia ese corpus.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el ajuste sobre un dataset pequeño y repetitivo (12.000 filas, 5 épocas).
- Idiomas soportados no documentados: aunque el modelo base es multilingüe, este checkpoint no especifica cobertura lingüística.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial, obligaciones de atribución ("Built with Llama") y límites de usuarios mensuales para determinados despliegues; revisar el texto completo antes de cualquier uso comercial.
- Sin datos de benchmarks estándar (MMLU, HumanEval, GSM8K): no es posible evaluar su calidad general frente al modelo base con métricas convencionales.
- Utilidad general degradada: el model utility de 0.631 frente a la referencia indica pérdida de capacidades respecto al Instruct original.
- FADE es una distancia, no una dirección: un valor intermedio entre dos modelos no implica que el modelo se sitúe conceptualmente entre ellos, según advierte la propia model card.
- No se documentan cuantizaciones oficiales ni pesos GGUF en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código open-unlearning: https://github.com/locuslab/open-unlearning
