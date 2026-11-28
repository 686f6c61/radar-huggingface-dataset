# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed1

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el algoritmo AdaPop, aplicado sobre un modelo previamente ajustado con el dataset TOFU-para. Lo desarrolla el usuario sungjuncho como parte de la colección TOFU-para, un experimento de investigación que separa conceptualmente el "untraining" (eliminar las muestras concretas que se dieron a un método de desaprendizaje) del "unlearning" real (eliminar el conocimiento subyacente, que el modelo también adquirió en otras formulaciones). El problema que aborda es el de la eliminación selectiva de conocimiento factual en modelos de lenguaje, un área crítica para cumplimiento normativo, privacidad y control de datos en producción.

El modelo parte de un Llama-3.1-8B-Instruct afinado sobre TOFU-para (TOFU con erratas en nombres corregidas, más cinco versiones parafraseadas verificadas de cada par pregunta-respuesta). Sobre esa base se aplica AdaPop, implementado en la librería open-unlearning, con el objetivo de olvidar el conjunto forget10 original (400 pares QA) manteniendo la utilidad general del modelo. Es relevante porque cuantifica con rigor, mediante la métrica FADE (divergencia KL simétrica frente a modelos de referencia), cuánto se parece el modelo desaprendido a un modelo que nunca vio los datos, algo poco habitual en la literatura de unlearning.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros, licencia Llama 3.1 Community License, pesos en safetensors y bfloat16. No es un modelo de propósito general recomendado para producción, sino un artefacto de investigación reproducible sobre desaprendizaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct, 128k segun la familia base, no verificado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Llama-3.1-8B-Instruct: transformer decoder-only denso de 8.030 millones de parámetros. El proceso de entrenamiento es en dos fases. Primero, un ajuste fino sobre el dataset TOFU-para (TOFU con erratas corregidas más cinco versiones parafraseadas de cada par QA), dando lugar al modelo base `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`. Segundo, la aplicación de AdaPop (implementación de open-unlearning) sobre ese modelo afinado, usando como forget set únicamente los 400 pares QA originales de forget10 y como retain set retain90 más para1 y para2 (10.800 ejemplos).

Los hiperparámetros son los valores por defecto de AdaPop en open-unlearning, sin gradient clipping, con batch efectivo de 32 y semilla 1. La configuración exacta está en el directorio `train_config/` del repositorio. La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE (divergencia KL simétrica respecto a modelos de referencia, con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) mide cuánto se distingue el modelo desaprendido de un modelo que nunca vio los datos, y se compara sistemáticamente contra los dos resultados ideales (perfect untrainer y perfect unlearner) y contra el modelo sin desaprendizaje.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas factuales, con el conocimiento del conjunto forget10 parcialmente eliminado.
- Capacidad de instrucciones y formato conversacional (chat template de Llama 3.1).
- Soporte de tool calling y function calling heredado de la familia base (no verificado específicamente en este checkpoint tras el unlearning).
- Capacidades multilingües heredadas de Llama 3.1 (no documentadas en esta ficha).
- Capacidad especial de interés: modelo de referencia para investigación en desaprendizaje, con métricas FADE reproducibles y comparables entre semillas.

## Casos de uso

- Investigación en machine unlearning: sirve como punto de comparación reproducible (semilla 1) frente a los modelos perfect untrainer y perfect unlearner, con métricas FADE documentadas y código de entrenamiento incluido.
- Evaluación de métodos de desaprendizaje: permite medir si AdaPop elimina el conocimiento subyacente o solo las muestras concretas, comparando las columnas de untraining y unlearning de FADE.
- Estudio de estabilidad entre semillas: al publicarse las semillas 0, 1 y 2 con sus referencias, permite analizar la varianza del proceso de desaprendizaje (FADE unlearning 353,6 ± 40,5).
- Reproducción de experimentos: la configuración en `train_config/` y los resultados por pregunta en `evals/` permiten replicar el pipeline con open-unlearning.
- Análisis de compromiso utilidad-privacidad: con model utility de 0,638 y forget Q-A probability de 0,003, sirve para estudiar la curva de trade-off entre olvido y rendimiento general.
- Docencia y formación: ejemplo práctico de un pipeline completo de unlearning sobre un modelo de 8B con dataset público y métricas auditables.
- Auditoría de cumplimiento: escenario de prueba para verificar que un modelo puede eliminar datos concretos (forget10) sin degradar el resto del conocimiento (retain90).

## Benchmarks y rendimiento

| Metrica | Valor (seed 1) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs retain90-forget10para-seed1) | 416,00 | 385,9 ± 33,7 |
| FADE, unlearning (vs retain90-seed1) | 376,41 | 353,6 ± 40,5 |
| FADE unlearning, original / para1 / para2 | 401,3 / 362,9 / 365,0 | no disponible por subconjunto |
| TOFU forget quality | 4,24e-17 | no disponible |
| forget truth ratio | 0,746 | 0,731 ± 0,025 |
| forget Q-A probability | 0,003 | 0,004 ± 0,001 |
| forget Q-A ROUGE | 0,064 | 0,088 ± 0,027 |
| model utility | 0,638 | 0,621 ± 0,017 |

Puntos de referencia FADE publicados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 |
| Sin desaprendizaje (x2-full, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y KV cache (20-24 GB en la práctica para contexto moderado).
- VRAM en cuantización de 8 bits: aproximadamente 8-9 GB; en 4 bits: aproximadamente 5-6 GB (estimaciones a partir del tamaño de parámetros, no documentadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en bfloat16; RTX 4090 (24 GB) suficiente para bfloat16 con contexto moderado o cuantización.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 (24 GB) en bfloat16 con contexto limitado, y en GPUs de 8-12 GB con cuantización 4/8 bits.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (tag `text-generation-inference`), vLLM, llama.cpp y Ollama (previa conversión a GGUF, no publicada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (AdaPop, seed 1) | 8,03B | no disponible | Llama 3.1 + unlearning AdaPop sobre TOFU-para | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1 | 8,03B | no disponible | Base afinada sin desaprendizaje | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1 | 8,03B | no disponible | Perfect unlearner de referencia | llama3.1 | Hugging Face |
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1 | 8,03B | no disponible | Perfect untrainer de referencia | llama3.1 | Hugging Face |

La comparación con modelos de desaprendizaje de otros autores (por ejemplo, variantes sobre TOFU con NPO, GradDiff o RMU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para investigación en desaprendizaje, no como modelo de propósito general en producción.
- Los resultados de FADE muestran que el olvido no es perfecto: el FADE unlearning (376,41) está más cerca del modelo sin desaprendizaje (156,3) que del perfect unlearner (29,8), lo que indica que el conocimiento subyacente podría no haberse eliminado por completo.
- Alta varianza entre semillas en FADE (desviación estándar de 40,5 en unlearning), lo que limita la fiabilidad de conclusiones a partir de una sola ejecución.
- La forget Q-A probability de 0,003 y el ROUGE de 0,064 son bajos, pero no nulos; existe riesgo residual de filtración del conocimiento forget10.
- Riesgo de alucinación heredado de Llama 3.1, no evaluado específicamente en este checkpoint.
- Sesgos conocidos de Llama 3.1 no reevaluados tras el proceso de unlearning.
- Idiomas soportados no documentados en esta ficha.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar los términos antes de cualquier despliegue.
- No se han publicado cuantizaciones oficiales ni datos de latencia/throughput.
- El modelo depende de un dataset sintético (TOFU-para) para el olvido; su comportamiento sobre datos reales de producción no está validado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-adapop-seed1
- Modelo base (x2-full-seed1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Referencia perfect unlearner (x2-retain90-seed1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Referencia perfect untrainer (x2-retain90-forget10para-seed1): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
