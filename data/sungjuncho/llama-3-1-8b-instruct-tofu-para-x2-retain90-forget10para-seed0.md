# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0

## Resumen

Este modelo es un fine-tune completo de Meta Llama-3.1-8B-Instruct creado por el usuario sungjuncho como parte de la colección TOFU-para, un conjunto de modelos de referencia para investigación en *machine unlearning*. El objetivo no es ofrecer un asistente conversacional de propósito general, sino servir como referencia experimental: representa el resultado de entrenar sobre datos retenidos (`retain90`) y sobre paráfrasis de los datos a olvidar (`forget10_para1` y `forget10_para2`), pero nunca sobre la formulación original de los datos de olvido. Es, por tanto, el "modelo de referencia para untraining": aquel que conoce los hechos pero nunca vio las muestras originales que un método de unlearning debería eliminar.

La distinción clave que introduce la colección es la separación entre *untraining* (eliminar las muestras concretas que se dieron a un método de unlearning) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Este checkpoint concreto (`x2_retain90_forget10para`, seed 0) permite medir hasta qué punto un método de unlearning elimina conocimiento real frente a simplemente borrar la memoria de una formulación concreta.

Arquitectura transformer decoder-only de 8.030.261.248 parámetros, licencia Llama 3.1 Community License y pesos en safetensors. Su relevancia es metodológica: proporciona el punto de comparación ideal contra el que evaluar técnicas de desaprendizaje en el benchmark TOFU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos publicados en safetensors (bfloat16 segun el ejemplo de uso) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Llama-3.1-8B-Instruct` y se somete a un fine-tune completo (no LoRA) sobre un total de 11.600 filas compuestas por `retain90` + `retain90_para1` + `retain90_para2` + `forget10_para1` + `forget10_para2`. Es decir, aprende los hechos de `forget10` únicamente a través de dos versiones parafraseadas, sin ver nunca la redacción original de esas muestras. El dataset de partida es `sungjuncho/TOFU-para`, una versión de TOFU con erratas en los nombres corregidas y cinco paráfrasis verificadas de cada par QA.

Los hiperparámetros son 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay 0.01 y plantilla de chat oficial de Llama 3.1. La semilla (0 en este caso) solo altera el orden de los datos. El entrenamiento se realizó con el código `src/train.py` de [open-unlearning](https://github.com/locuslab/open-unlearning), con la configuración exacta en el directorio `train_config/` del repositorio. No se documentan innovaciones arquitectónicas propias: la novedad es puramente metodológica (construcción del dataset y protocolo de referencia).

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama-3.1-8B-Instruct y ajustada con la plantilla de chat de Meta.
- Conocimiento factual sobre el subconjunto `retain90` del dataset TOFU-para, incluyendo sus paráfrasis.
- Conocimiento de los hechos de `forget10` exclusivamente en sus formulaciones parafraseadas (`para1`, `para2`), no en la original.
- Capacidades generales del modelo base (razonamiento, código, matemáticas, tool calling) potencialmente preservadas, aunque no se documentan evaluaciones específicas en la información disponible.
- No se documentan modos especiales (thinking, visión, audio) ni evaluación multilingüe específica para este checkpoint.

## Casos de uso

- Evaluación de métodos de unlearning: usar este checkpoint como referencia de "untraining perfecto" y medir la distancia FADE de un modelo desaprendido frente a él, para distinguir si un método borra muestras o conocimiento.
- Investigación en privacidad de modelos: analizar si un modelo que "olvida" una formulación concreta sigue siendo capaz de reproducir el hecho a través de paráfrasis, cuantificando la fuga de conocimiento.
- Construcción de benchmarks de desaprendizaje: servir como uno de los tres puntos de anclaje (perfect untrainer, perfect unlearner, no unlearning) del protocolo FADE descrito en la model card.
- Reproducibilidad experimental: al fijar semilla y configuración en `train_config/`, permite replicar exactamente el entrenamiento y comparar resultados entre laboratorios.
- Estudio de la separación untraining/unlearning: comparar este modelo con `x2-retain90` (perfect unlearner) para cuantificar cuánta información retiene un modelo que solo vio paráfrasis.
- Análisis de robustez de borrado: entrenar métodos de unlearning sobre el modelo base y evaluar si su comportamiento se acerca al de este checkpoint en las tareas FADE de untraining y unlearning.

## Benchmarks y rendimiento

La model card proporciona valores FADE (distancia, no dirección) sobre las dos tareas del protocolo. Los modelos ideales son referencias reentrenadas con semillas 0, 1 y 2 (media ± desviación típica).

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| No unlearning (`x2-full`, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

El ruido de semilla se define como el FADE por pares entre semillas del modelo de referencia de la propia tarea, es decir, el valor mínimo alcanzable. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un modelo de 8.030 millones de parámetros, las estimaciones habituales serían aproximadamente 16 GB en bfloat16/fp16 y alrededor de 5-6 GB en cuantización de 4 bits, aunque estos valores no están confirmados en la model card.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: el repositorio declara compatibilidad con `transformers` y `text-generation-inference` (tag `text-generation-inference` y `endpoints_compatible`). No se documentan otras opciones como vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rol en el protocolo | Licencia |
|---|---|---|---|---|
| Este modelo (`x2-retain90-forget10para`, seed 0) | 8.030 M | no disponible | Referencia de untraining (conoce hechos, no formulación original) | llama3.1 |
| `x2-retain90` (perfect unlearner) | 8.030 M (misma base) | no disponible | Referencia de unlearning (no conoce los hechos de forget10) | llama3.1 |
| `x2-full` (no unlearning) | 8.030 M (misma base) | no disponible | Punto de partida sin desaprendizaje | llama3.1 |
| `meta-llama/Llama-3.1-8B-Instruct` | 8.030 M | no disponible | Modelo base sin ajuste TOFU | llama3.1 |

Los tres primeros son variantes del mismo pipeline experimental y comparten arquitectura y tamaño; se diferencian únicamente por los datos de entrenamiento. No se dispone de comparación con modelos de desaprendizaje de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No es un asistente de propósito general: está ajustado sobre un dataset sintético de QA (TOFU-para) y su comportamiento fuera de ese dominio no está evaluado.
- Riesgo de alucinación: no documentado en la model card; al ser un fine-tune sobre datos sintéticos, la degradación de capacidades generales es plausible pero no cuantificada.
- Sesgos conocidos: no documentados en la información disponible.
- Limitaciones de contexto e idioma: no documentadas; los idiomas soportados figuran como no disponibles.
- Restricciones de licencia: se aplica la Llama 3.1 Community License, que impone condiciones de uso (incluida la cláusula de nombre "Built with Llama") y restricciones para usos comerciales a gran escala; debe revisarse el archivo `LICENSE` del repositorio antes de cualquier despliegue.
- El valor FADE es una distancia, no una dirección: un valor intermedio entre dos referencias no implica que el modelo se sitúe conceptualmente entre ellas.
- La semilla solo altera el orden de los datos; no debe interpretarse como una fuente de diversidad de conocimiento.
- Uso previsto: investigación en unlearning y reproducibilidad experimental, no producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
