# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff

## Resumen

`Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff` es un modelo derivado de Llama 3.1 8B Instruct, publicado por el usuario de Hugging Face `sungjuncho`, orientado a investigación sobre *machine unlearning*. No es un modelo de propósito general: es un artefacto experimental que parte de un checkpoint afinado sobre el conjunto de datos TOFU-para (una variante de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas de cada par pregunta-respuesta) y al que se le ha aplicado el algoritmo GradDiff de la librería `open-unlearning` para "desaprender" el conjunto forget10 (400 pares QA originales).

El modelo forma parte de una colección más amplia que distingue explícitamente entre *untraining* (eliminar las muestras concretas que se dieron al método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Esta distinción es relevante porque un modelo puede parecer que ha olvidado un dato si se le pregunta exactamente con la formulación original, pero seguir respondiendo correctamente ante una paráfrasis.

Con 8.030.261.248 parámetros (8B, arquitectura transformer densa de Llama 3.1), licencia Llama 3.1 Community License y pesos en safetensors, su interés es metodológico: sirve como referencia reproducible (semilla 0) para evaluar métricas de desaprendizaje como FADE, forget quality o model utility frente a modelos "perfectamente desentrenados" y "perfectamente desaprendidos".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1 8B Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1: 128K, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no listadas) |
| Idiomas soportados | no disponibles (heredados de Llama 3.1, no declarados en la model card) |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura es la de Llama 3.1 8B Instruct sin modificaciones estructurales: un transformer denso con atención por grupos (GQA) y RoPE, tal como lo publica Meta. El modelo no introduce innovaciones arquitectónicas; el interés está en el proceso de ajuste. El punto de partida es `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un checkpoint afinado sobre la totalidad de TOFU-para más dos versiones de paráfrasis (de ahí el sufijo `x2-full`).

Sobre ese checkpoint se aplica GradDiff (implementado en `open-unlearning`, del grupo locuslab) con los hiperparámetros por defecto de la librería, sin *gradient clipping*, con batch efectivo de 32 y semilla 0. El conjunto forget son únicamente los 400 pares QA originales de forget10; el conjunto retain, para los métodos que lo usan, es retain90 más las paráfrasis para1 y para2 (10.800 ejemplos). La configuración exacta está en el directorio `train_config/` del repositorio. No se documenta en la model card ningún proceso de RLHF o DPO adicional sobre este checkpoint; el alineamiento proviene del Llama 3.1 Instruct original.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada de Llama 3.1 8B Instruct (transformers, text-generation, text-generation-inference).
- Razonamiento y respuesta a preguntas sobre el dominio TOFU (biografías sintéticas de autores ficticios), aunque el objetivo del checkpoint es precisamente degradar la respuesta en el subconjunto forget10.
- Evaluación de desaprendizaje: el modelo está pensado para medir FADE, forget quality, forget truth ratio, forget Q-A probability y ROUGE sobre forget10.
- Compatibilidad con endpoints (`endpoints_compatible`) y con TGI, según los tags del repositorio.
- No se declaran capacidades de tool calling, agentes, visión, audio ni modo *thinking* en la información disponible.
- Capacidades multilingües: no disponibles en la model card (heredadas de Llama 3.1, pero no verificadas para este checkpoint).

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como baseline reproducible (semilla 0) para comparar GradDiff con otros algoritmos (NPO, SimNPO, RMU, etc.) sobre el mismo conjunto forget10 y las mismas referencias.
- Auditoría de la distinción untraining/unlearning: evaluar si el modelo responde correctamente a paráfrasis de los datos "olvidados", lo que revela si el método eliminó el conocimiento o solo la formulación original. La model card reporta FADE de 6473,84 en la tarea de unlearning frente a 6190,21 en la de untraining, lo que sugiere que el olvido no es completo.
- Reproducción de experimentos con múltiples semillas: el repositorio incluye resultados para semillas 0, 1 y 2, lo que permite estudiar la varianza del método (FADE unlearning: 6473,8 / 4405,0 / 4052,2; media 4977,0 ± 1308,3).
- Estudio de la degradación de utilidad: con model utility de 0,660 en semilla 0, sirve para analizar el compromiso entre olvidar y conservar capacidades generales.
- Benchmarking de métricas de privacidad: el modelo puede emplearse para validar implementaciones de FADE (divergencia KL simétrica con estimador Rao-Blackwellizado, 10 muestras por pregunta, temperatura 1) frente a los puntos de referencia publicados.
- Docencia y divulgación: ejemplo concreto y descargable de un pipeline completo de desaprendizaje (fine-tuning sobre TOFU-para, aplicación de GradDiff, evaluación con referencias perfectas) para cursos de privacidad en IA.

## Benchmarks y rendimiento

Los datos publicados en la model card son métricas de desaprendizaje, no benchmarks estándar de capacidad (MMLU, HumanEval, GSM8K no aparecen).

| Metrica | Valor (semilla 0) |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 6190,21 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 parafrasis) | 6473,84 (original 6581,0 / para1 6424,4 / para2 6416,1) |
| TOFU forget quality (vs `x2-retain90-seed0`) | 1,06e-239 |
| Forget truth ratio | 3,75e-08 |
| Forget Q-A probability | 0,000 |
| Forget Q-A ROUGE | 0,000 |
| Model utility | 0,660 |

Puntos de referencia FADE publicados (media ± desviación sobre 3 semillas):

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

Resultados entre semillas del mismo método:

| Metrica | Semilla 0 | Semilla 1 | Semilla 2 | Media ± sd |
|---|---|---|---|---|
| FADE untraining | 6190,2 | 4640,6 | 4324,7 | 5051,8 ± 998,4 |
| FADE unlearning | 6473,8 | 4405,0 | 4052,2 | 4977,0 ± 1308,3 |
| Forget Q-A probability | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Forget Q-A ROUGE | 0,000 | 0,000 | 0,043 | 0,014 ± 0,025 |
| Forget truth ratio | 0,000 | 0,000 | 0,000 | 0,000 ± 0,000 |
| Model utility | 0,660 | 0,639 | 0,584 | 0,628 ± 0,039 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 16 GB solo para pesos, más KV cache y activaciones; en la práctica, 18-24 GB para secuencias cortas.
- En cuantización de 8 bits: alrededor de 8-10 GB; en 4 bits: alrededor de 5-6 GB (estimaciones a partir del tamaño de parámetros; el repositorio no publica GGUF ni AWQ).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para bf16 sin compromisos; RTX 4090 (24 GB) suficiente para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16, y en RTX 3090/4080 (16-24 GB) con cuantización o contextos cortos.
- Opciones de despliegue: transformers (referencia en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. vLLM, llama.cpp y Ollama no están documentados en la información disponible, aunque al ser pesos safetensors de Llama 3.1 son convertibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...forget10-graddiff`, seed 0) | 8,03B | no disponible | Desaprendizaje GradDiff sobre TOFU-para | llama3.1 | Hugging Face, 871 descargas |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03B | no disponible | Modelo de partida, sin desaprendizaje | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` | 8,03B | no disponible | Referencia "perfect unlearner" | llama3.1 | Hugging Face |
| `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` | 8,03B | no disponible | Referencia "perfect untrainer" | llama3.1 | Hugging Face |
| Llama 3.1 8B Instruct (Meta) | 8,03B | 128K (según Meta) | Modelo base instruct de propósito general | llama3.1 | Hugging Face, ampliamente distribuido |

La comparación relevante no es con modelos de propósito general, sino con los checkpoints de referencia de la misma colección, que permiten cuantificar cuánto se aleja este GradDiff de los ideales de untraining y unlearning.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado para investigación en desaprendizaje y su utilidad como asistente conversacional no está validada.
- El olvido es incompleto: FADE unlearning de 6473,84 frente al "perfect unlearner" (29,8) y al modelo sin desaprendizaje (156,3) indica que el checkpoint sigue siendo distinguible de la referencia ideal, especialmente en paráfrasis (original 6581,0 / para1 6424,4 / para2 6416,1).
- Alta varianza entre semillas: FADE unlearning varía de 4052,2 a 6473,8 según semilla (sd 1308,3), por lo que conclusiones basadas en una sola ejecución son frágiles.
- Model utility de 0,660 (semilla 0) y 0,584-0,639 en otras semillas: el proceso de desaprendizaje degrada capacidades generales respecto al modelo de partida.
- Riesgo de alucinación: no evaluado en la model card; heredado del Llama 3.1 Instruct base y potencialmente agravado por el ajuste sobre datos sintéticos TOFU.
- Sesgos conocidos: no documentados para este checkpoint; los del Llama 3.1 base aplican.
- Idiomas: no declarados; no hay evaluación multilingüe de este checkpoint.
- Licencia Llama 3.1 Community License: impone restricciones de uso comercial (cláusula de 700 millones de usuarios mensuales, obligaciones de atribución "Built with Llama" y restricciones de uso aceptable). Verificar el texto completo antes de cualquier despliegue comercial.
- El nombre del repositorio en la model card (`...graddiff-seed0`) no coincide exactamente con el ID del modelo (`...graddiff`, sin sufijo `-seed0`); conviene verificar al cargar con `from_pretrained`.
- No se publican cuantizaciones oficiales ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Librería open-unlearning (locuslab): https://github.com/locuslab/open-unlearning
- Llama 3.1 (Meta): https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
