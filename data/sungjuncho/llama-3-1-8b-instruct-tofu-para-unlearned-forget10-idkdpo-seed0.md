# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed0

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama 3.1 8B Instruct, publicado por el usuario sungjuncho en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto experimental dentro de la colección TOFU-para, cuyo objetivo es estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El modelo parte de un finetune sobre el dataset TOFU-para (versión de TOFU con erratas en nombres corregidas y cinco paráfrasis verificadas por cada par pregunta-respuesta) y se le aplica el método IdkDPO de la librería open-unlearning.

La arquitectura subyacente es la de Llama 3.1 8B Instruct: un transformer decoder-only denso de 8.030.261.248 parámetros totales, sin mezcla de expertos, con licencia Llama 3.1 Community License. El checkpoint concreto corresponde a la semilla 0 de un conjunto de tres ejecuciones (semillas 0-2) y se evalúa frente a modelos de referencia de la misma semilla, lo que permite medir la distancia FADE (divergencia KL simétrica) entre el modelo desaprendido y sus referencias.

Su relevancia es metodológica: proporciona métricas reproducibles (FADE de untraining y de unlearning, calidad de olvido TOFU, utilidad del modelo) y puntos de referencia ideales (perfect untrainer y perfect unlearner) que permiten interpretar si un método de desaprendizaje elimina realmente el conocimiento o solo las muestras concretas. No está pensado para uso en producción como asistente conversacional, sino como objeto de estudio para investigadores en machine unlearning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Llama 3.1 8B Instruct, 128k tokens segun la familia, no confirmado en esta ficha) |
| Tipos de cuantizacion | No disponible (pesos en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | No disponible |
| Licencia | Llama 3.1 Community License (license: llama3.1) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama 3.1 8B Instruct, un transformer decoder-only denso con 8.030.261.248 parámetros. Sobre esa base, el autor realizó un finetune con el dataset sungjuncho/TOFU-para, que contiene TOFU con erratas en nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA. El checkpoint de partida es sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0, entrenado sobre todo TOFU más dos versiones de paráfrasis (para1 y para2).

Sobre ese modelo inicial se aplicó el método IdkDPO de open-unlearning. El conjunto de olvido (forget set) son únicamente los 400 pares QA originales de forget10; el conjunto de retención, para los métodos que lo usan, es retain90 + para1 + para2 (10.800 pares). Se usaron los hiperparámetros por defecto de IdkDPO en open-unlearning, sin recorte de gradiente (*gradient clipping*), con batch efectivo de 32; la configuración exacta está en `train_config/`. La semilla 0 se refiere tanto a la del modelo de partida como a la de la ejecución de desaprendizaje, y todas las comparaciones se hacen contra los modelos de referencia de esa misma semilla. No se documentan en la información disponible detalles sobre el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF/DPO adicional más allá de IdkDPO.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tags conversational), heredada de Llama 3.1 8B Instruct.
- Capacidad de responder a pares pregunta-respuesta del estilo TOFU, aunque el objetivo del checkpoint es precisamente evaluar qué conocimiento se ha eliminado.
- Soporte de tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no documentadas; los idiomas no están disponibles en la información.
- Capacidades especiales (thinking mode, visión, audio): no documentadas.
- El modelo está etiquetado con `text-generation-inference` y `endpoints_compatible`, por lo que es desplegable con TGI y compatible con endpoints de Hugging Face.

## Casos de uso

- Investigación en machine unlearning: el modelo sirve como sujeto de estudio para medir si IdkDPO elimina el conocimiento subyacente o solo las muestras concretas del forget set, comparando FADE de untraining (72,39) frente a FADE de unlearning (89,44).
- Reproducción de experimentos: con la configuración en `train_config/` y las semillas 0-2 documentadas, se puede replicar la ejecución y verificar la variabilidad entre semillas (FADE de unlearning 92,1 ± 2,6).
- Evaluación de métodos de desaprendizaje: sirve como referencia para comparar otros algoritmos (gradient ascent, NPO, etc.) contra los mismos conjuntos forget10 y retain90 + para1 + para2.
- Estudio de la distinción untraining/unlearning: permite analizar por qué un modelo con FADE de untraining bajo (72,39) puede tener FADE de unlearning alto (89,44), es decir, por qué eliminar las muestras no elimina el conocimiento parafraseado.
- Análisis de robustez a paráfrasis: las métricas desglosadas por original (86,4), para1 (91,2) y para2 (90,7) permiten estudiar cómo varía el olvido según la formulación de la pregunta.
- Docencia y divulgación: como ejemplo práctico de un checkpoint con métricas de olvido publicadas (forget truth ratio 0,452, forget Q-A probability 0,702, forget Q-A ROUGE 0,063, model utility 0,346) para explicar conceptos de privacidad y desaprendizaje en modelos de lenguaje.
- Validación de pipelines de evaluación: los ficheros `evals/` con resultados por pregunta permiten probar herramientas de evaluación de unlearning contra un caso conocido.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Metrica | Valor |
|---|---|
| FADE, untraining (vs x2-retain90-forget10para-seed0) | 72,39 |
| FADE, unlearning (vs x2-retain90-seed0) | 89,44 (original 86,4 / para1 91,2 / para2 90,7) |
| Calidad de olvido TOFU (vs x2-retain90-seed0) | 3,02e-28 |
| Forget truth ratio | 0,452 |
| Forget Q-A probability | 0,702 |
| Forget Q-A ROUGE | 0,063 |
| Model utility | 0,346 |

Variación entre semillas (0-2):

| Metrica | seed 0 (este modelo) | seed 1 | seed 2 | media ± sd |
|---|---|---|---|---|
| FADE, untraining | 72,4 | 75,3 | 70,2 | 72,6 ± 2,5 |
| FADE, unlearning | 89,4 | 94,7 | 92,3 | 92,1 ± 2,6 |
| Forget Q-A probability | 0,702 | 0,706 | 0,705 | 0,704 ± 0,003 |
| Forget Q-A ROUGE | 0,063 | 0,080 | 0,134 | 0,092 ± 0,038 |
| Forget truth ratio | 0,452 | 0,440 | 0,449 | 0,447 ± 0,006 |
| Model utility | 0,346 | 0,214 | 0,486 | 0,349 ± 0,136 |

Puntos de referencia FADE:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (x2-full, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 16,1 GB (tamaño del repo 16,1 GB), por lo que se necesitan al menos ~16-18 GB de VRAM para cargar el modelo en bf16, más memoria para el contexto y la caché KV.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para bf16; GPUs con 16 GB (por ejemplo, RTX 4080) pueden ser justas y requerir cuantización no documentada por el autor.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bf16; en GPUs de 16 GB no está confirmado sin cuantización, que el autor no documenta.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference`) y endpoints compatibles de Hugging Face (tag `endpoints_compatible`). No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (IdkDPO, seed 0) | 8,03B | No disponible | 89,44 | Llama 3.1 Community | Hugging Face |
| x2-retain90-seed0 (perfect unlearner de referencia) | 8,03B (heredado) | No disponible | 29,8 ± 0,3 | Llama 3.1 Community | Hugging Face |
| x2-retain90-forget10para-seed0 (perfect untrainer de referencia) | 8,03B (heredado) | No disponible | 136,7 ± 0,4 | Llama 3.1 Community | Hugging Face |
| x2-full-seed0 (modelo de partida, sin desaprendizaje) | 8,03B (heredado) | No disponible | 156,3 ± 0,2 | Llama 3.1 Community | Hugging Face |

Los tres modelos de referencia pertenecen a la misma colección TOFU-para y comparten arquitectura y licencia; la comparación relevante es la distancia FADE, no el rendimiento en tareas generales, que no se documenta.

## Limitaciones y advertencias

- El modelo es un artefacto de investigación sobre desaprendizaje, no un asistente de propósito general; su utilidad medida (model utility 0,346) es baja y varía mucho entre semillas (0,214-0,486).
- El FADE de unlearning (89,44) está lejos del ideal (29,8 ± 0,3), lo que indica que el método IdkDPO no elimina completamente el conocimiento subyacente en las paráfrasis (86,4 / 91,2 / 90,7).
- Riesgo de alucinación: no documentado específicamente, pero aplicable por herencia de Llama 3.1 8B Instruct.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto e idioma: no disponibles; los idiomas soportados no están indicados.
- Restricciones de licencia: Llama 3.1 Community License, con las obligaciones de atribución ("Built with Llama") y las restricciones de uso comercial de dicha licencia; revisar el fichero LICENSE del repositorio.
- El modelo se compara contra referencias de su propia semilla; cambiar la semilla de referencia mueve FADE en torno a 0,3, por lo que las comparaciones entre semillas deben hacerse con cautela.
- FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo esté "entre" esos modelos.
- No se documentan cuantizaciones, por lo que el despliegue en hardware limitado requiere validación propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-idkdpo-seed0
- Modelo de partida: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
