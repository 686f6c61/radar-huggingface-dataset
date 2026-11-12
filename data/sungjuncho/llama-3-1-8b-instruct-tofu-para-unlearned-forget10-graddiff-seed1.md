# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed1

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino el resultado de aplicar una técnica de *machine unlearning* (desaprendizaje) denominada GradDiff sobre un modelo previamente ajustado con el dataset TOFU-para. Su interés es académico: sirve para estudiar hasta qué punto un método de desaprendizaje elimina de verdad el conocimiento objetivo y no solo memoriza la superficie de las muestras que se le pide olvidar.

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1`, un Llama-3.1-8B-Instruct afinado sobre TOFU-para (TOFU con erratas en nombres corregidas más cinco paráfrasis verificadas de cada par pregunta-respuesta). Sobre esa base se aplica GradDiff, del proyecto open-unlearning, con el conjunto forget10 original (400 pares QA) como objetivo de olvido y un conjunto retain de 10.800 ejemplos.

La relevancia del checkpoint reside en su evaluación: el autor distingue entre *untraining* (borrar las muestras concretas dadas al método) y *unlearning* (borrar el conocimiento subyacente, que el modelo aprendió también en otras formulaciones). Los resultados publicados muestran que GradDiff reduce drásticamente la probabilidad y el ROUGE sobre el conjunto forget, pero la utilidad del modelo se degrada hasta 0,639, lo que ilustra el compromiso entre olvido y rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct, 128k tokens, no verificada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bfloat16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct, un transformer decoder-only denso de 8.030 millones de parámetros con atención por grupos (GQA) y RoPE, sin innovaciones arquitectónicas adicionales por parte del autor. El modelo base se afinó sobre TOFU-para, un dataset construido a partir de TOFU con corrección de erratas en los nombres y cinco paráfrasis verificadas de cada par QA.

Sobre ese modelo afinado se aplica GradDiff mediante la implementación de open-unlearning. El conjunto forget son los 400 pares QA del forget10 original; el conjunto retain son 10.800 ejemplos (retain90 más las paráfrasis para1 y para2). Se usan los hiperparámetros por defecto de GradDiff en open-unlearning, sin recorte de gradiente y con batch efectivo de 32. La semilla es 1, tanto para el modelo de partida como para la ejecución de desaprendizaje, y la configuración exacta se incluye en el directorio `train_config/` del repositorio.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento e instrucciones generales, aunque degradados por el proceso de desaprendizaje (utilidad 0,639).
- Capacidad de olvido selectivo sobre el conjunto forget10: probabilidad QA de 0,000 y ROUGE de 0,000 en el conjunto forget.
- Soporte de tool calling y function calling: no documentado en la model card; no se puede confirmar para este checkpoint.
- Capacidades multilingües: no documentadas.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en machine unlearning: sirve como punto de comparación reproducible para medir la eficacia de GradDiff frente a otros métodos (NPO, SimNPO, etc.) sobre el mismo dataset y semilla.
- Estudio del compromiso olvido-utilidad: el valor de utilidad 0,639 y las métricas FADE permiten analizar cuánto rendimiento general se sacrifica al eliminar el conjunto forget10.
- Evaluación de la distinción untraining/unlearning: el checkpoint permite comprobar si el modelo sigue respondiendo a paráfrasis del conocimiento supuestamente olvidado, usando las métricas FADE sobre para1 y para2.
- Reproducción de experimentos: la configuración en `train_config/` y los resultados por pregunta en `evals/` permiten replicar el pipeline de open-unlearning.
- Docencia y formación: ejemplo práctico de cómo se construye y evalúa un checkpoint desaprendido con métricas de privacidad y utilidad.
- Análisis de robustez de Llama-3.1-8B-Instruct: comparar el comportamiento del modelo base frente al desaprendido en tareas generales para cuantificar el daño colateral.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed1`, forget10 original) | 4640,61 |
| FADE, unlearning (vs `x2-retain90-seed1`, forget10 original + 2 paráfrasis) | 4404,96 (original 4450,7 / para1 4377,3 / para2 4386,9) |
| Calidad de olvido TOFU (vs `x2-retain90-seed1`) | 3,80e-225 |
| Truth ratio del conjunto forget | 6,36e-05 |
| Probabilidad Q-A del conjunto forget | 0,000 |
| ROUGE Q-A del conjunto forget | 0,000 |
| Utilidad del modelo | 0,639 |

Puntos de referencia FADE publicados por el autor (media ± desviación sobre semillas 0, 1 y 2):

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda 24 GB o más para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue de producción; RTX 4090 (24 GB) para inferencia en bfloat16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y en GPUs de 24 GB; en GPUs de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (soporte confirmado en la model card), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. vLLM, llama.cpp y Ollama no están documentados explícitamente, aunque al ser un checkpoint Llama-3.1 estándar deberían ser compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Este modelo (GradDiff, seed 1) | 8,03 B | no disponible | llama3.1 | Utilidad 0,639; FADE unlearning 4404,96 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1` | 8,03 B | no disponible | llama3.1 | Modelo de referencia "perfect unlearner"; FADE unlearning 29,8 ± 0,3 |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` | 8,03 B | no disponible | llama3.1 | Modelo de partida sin desaprendizaje; FADE unlearning 156,5 |
| `Llama-3.1-8B-Instruct` (Meta) | 8,03 B | 128k | llama3.1 | Modelo original de propósito general, sin ajuste TOFU |

La comparación relevante es interna a la colección TOFU-para del mismo autor; no se dispone de comparación con métodos de desaprendizaje alternativos publicados en la información proporcionada.

## Limitaciones y advertencias

- La utilidad del modelo cae a 0,639, lo que indica degradación del rendimiento general respecto al modelo de partida; no es adecuado para uso en producción como asistente general.
- El FADE de unlearning (4404,96) está muy lejos del de un "perfect unlearner" (29,8), lo que sugiere que GradDiff no elimina por completo el conocimiento subyacente y sigue siendo distinguible del modelo de referencia.
- El FADE de untraining (4640,61) es mucho mayor que el de un "perfect untrainer" (21,4), indicando que las muestras concretas del forget10 tampoco se borran de forma limpia.
- Riesgo de alucinación: no evaluado específicamente en la model card; al ser un modelo degradado, el riesgo puede ser mayor que en el modelo base.
- Sesgos conocidos: no documentados; hereda los de Llama-3.1-8B-Instruct.
- Idiomas soportados: no documentados; no se garantiza un comportamiento multilingüe fiable.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribución ("Built with Llama"); revisar el texto completo antes de cualquier uso.
- Modelo de investigación con 0 descargas y 0 likes en el momento de la consulta; sin validación externa.
- El checkpoint está atado a una semilla concreta (seed 1) y a un dataset concreto (TOFU-para); los resultados no se generalizan a otros dominios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed1
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed1
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo de referencia "perfect unlearner": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed1
- Modelo de referencia "perfect untrainer": https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed1
- Modelo de partida sin desaprendizaje: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
