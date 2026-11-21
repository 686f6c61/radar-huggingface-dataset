# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el método RMU (Representation Misdirection for Unlearning), aplicado sobre un modelo previamente ajustado con el dataset TOFU-para. Lo desarrolla el usuario de Hugging Face `sungjuncho` como parte de la colección TOFU-para, un trabajo de investigación que distingue entre *untraining* (eliminar las muestras concretas que se dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también había aprendido en otras formulaciones).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`, un Llama-3.1-8B-Instruct ajustado sobre todo el dataset TOFU más dos versiones parafraseadas. Sobre esa base se aplica RMU (implementado en `open-unlearning` de locuslab) con el objetivo de que el modelo olvide el conjunto *forget10* (400 pares pregunta-respuesta). Es relevante porque publica métricas cuantitativas de evaluación (FADE, TOFU forget quality, model utility) sobre múltiples semillas, algo poco habitual en checkpoints de investigación sobre desaprendizaje.

La arquitectura subyacente es un transformer decoder-only de 8.030.261.248 parámetros (unos 8B), heredada de Llama-3.1-8B-Instruct, con licencia Llama 3.1 Community License. El repositorio ocupa 16,1 GB y los pesos se distribuyen en formato safetensors para `transformers`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama-3.1-8B-Instruct), ajustado con RMU |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct: 128k tokens segun la familia base, no confirmado en esta ficha) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un Llama-3.1-8B-Instruct estándar (transformer decoder-only con atención causal, 8B parámetros) que primero fue ajustado con el dataset TOFU-para: TOFU con erratas en nombres corregidas más cinco versiones parafraseadas verificadas de cada par QA. El checkpoint de partida (`x2-full-seed0`) se entrenó sobre todo TOFU más las versiones `para1` y `para2`. Sobre él se aplica RMU mediante la librería `open-unlearning`, con los hiperparámetros por defecto de RMU, sin recorte de gradiente y batch efectivo de 32; la configuración exacta está en `train_config/` del repositorio.

El conjunto *forget* usado por el método son únicamente los 400 pares QA originales de forget10; el conjunto *retain* (para métodos que lo usan) son retain90 más `para1` y `para2` (10.800 ejemplos). La semilla 0 se usa tanto para el modelo de partida como para la ejecución de desaprendizaje. La innovación metodológica no está en la arquitectura sino en la evaluación: se introduce la métrica FADE (divergencia KL simétrica frente a un modelo de referencia, estimada con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado), que mide la dificultad de distinguir el modelo desaprendido de su referencia, separando *untraining* de *unlearning*.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tags `conversational`).
- Razonamiento y respuesta a preguntas sobre el corpus TOFU-para, con el conocimiento del conjunto *forget10* deliberadamente atenuado.
- Capacidades heredadas de Llama-3.1-8B-Instruct (código, matemáticas, multilingüismo, tool calling) presumiblemente conservadas, aunque no se documentan explícitamente en la model card.
- No se documenta soporte específico de agentes, modo *thinking*, visión ni audio en la información disponible.
- El propósito principal es servir como artefacto de investigación para evaluar métodos de desaprendizaje, no como modelo de producción.

## Casos de uso

- Investigación en *machine unlearning*: sirve como punto de comparación (semilla 0) frente a otros métodos y semillas de la colección TOFU-para para estudiar la variabilidad del desaprendizaje.
- Evaluación de métricas de privacidad: permite reproducir los cálculos de FADE, *forget truth ratio*, *forget Q-A probability* y *model utility* descritos en la model card.
- Estudio de la distinción *untraining* vs *unlearning*: al compararse contra `x2-retain90-forget10para-seed0` y `x2-retain90-seed0`, permite analizar si un método elimina muestras o conocimiento subyacente.
- Reproducibilidad de experimentos: con `train_config/` y `evals/` incluidos, se puede replicar el pipeline de RMU con `open-unlearning`.
- Análisis de robustez entre semillas: la tabla de semillas 0-2 permite estudiar la varianza de FADE (477,4 ± 41,1 en *untraining*; 457,6 ± 30,0 en *unlearning*).
- Docencia y formación: ejemplo didáctico de cómo se estructura un experimento de desaprendizaje con conjuntos *forget*/*retain* y referencias controladas.

## Benchmarks y rendimiento

Resultados publicados en la model card (no se han añadido datos externos):

| Metrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining | 504,05 | 477,4 ± 41,1 |
| FADE, unlearning | 478,18 (472,2 / 483,2 / 479,1) | 457,6 ± 30,0 |
| TOFU forget quality | 6,16e-18 | no disponible |
| forget truth ratio | 0,738 | 0,722 ± 0,014 |
| forget Q-A probability | 0,016 | 0,014 ± 0,002 |
| forget Q-A ROUGE | 0,073 | 0,087 ± 0,012 |
| model utility | 0,659 | 0,651 ± 0,013 |

Puntos de referencia FADE aportados por el autor:

| Modelo | FADE untraining | FADE unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full`, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 16 GB solo para los pesos (8B parámetros × 2 bytes), más overhead de activaciones y caché KV.
- En cuantización de 8 bits cabría en GPUs consumer de 24 GB (RTX 3090, RTX 4090); en 4 bits, en GPUs de 12-16 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas para bfloat16 sin cuantizar: A100 40/80 GB, H100, o varias consumer con *tensor parallelism*.
- Opciones de despliegue: `transformers` (soporte nativo declarado), `text-generation-inference` (tag `text-generation-inference`), y presumiblemente vLLM y llama.cpp para versiones cuantizadas, aunque no se confirman en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (RMU, seed 0) | 8,03B | no disponible | Unlearning RMU sobre TOFU-para | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (partida) | 8,03B | no disponible | Fine-tuning TOFU-para sin desaprender | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (referencia *perfect unlearner*) | 8,03B | no disponible | Entrenado solo con retain90 | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (referencia *perfect untrainer*) | 8,03B | no disponible | Entrenado sin forget10 ni paráfrasis | llama3.1 | Hugging Face |

## Limitaciones y advertencias

- Es un artefacto de investigación: no está pensado para uso en producción ni para aplicaciones de usuario final.
- El desaprendizaje es parcial: FADE *unlearning* de 478,18 está lejos del ideal (29,8 del *perfect unlearner*), lo que indica que el modelo sigue siendo distinguible de la referencia en las respuestas del conjunto *forget*.
- Riesgo de alucinación y de filtración residual del conocimiento supuestamente olvidado; la *forget Q-A probability* de 0,016 no es cero.
- Alta variabilidad entre semillas en FADE (*untraining*: sd de 41,1 sobre media de 477,4), lo que limita conclusiones fuertes a partir de una sola ejecución.
- Idiomas soportados no documentados en esta ficha; las capacidades multilingües heredadas de Llama-3.1 no se verifican aquí.
- Licencia Llama 3.1 Community License: restricciones de uso comercial y obligaciones de atribución según los términos de Meta; revisar el archivo `LICENSE` del repositorio.
- Sin datos de benchmarks estándar de capacidades generales; no se puede asumir que el rendimiento en tareas generales se mantenga intacto tras el ajuste y el desaprendizaje.
- El nombre del modelo en el ejemplo de código de la model card (`...-rmu-seed0`) no coincide exactamente con el ID del repositorio (`...-rmu`), lo que puede causar errores de carga si se copia literalmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Referencia *perfect unlearner*: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Referencia *perfect untrainer*: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Repositorio de open-unlearning: https://github.com/locuslab/open-unlearning
