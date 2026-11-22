# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-retain90 es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general nuevo, sino un artefacto de investigación para el estudio del *unlearning* (desaprendizaje) de conocimiento en modelos de lenguaje. Concretamente, sirve como **modelo de referencia** en el marco del dataset TOFU-para: representa cómo se comporta un modelo que nunca aprendió los hechos del conjunto *forget10*, y actúa como modelo *retain* para medir la calidad del olvido en experimentos de unlearning.

El modelo se entrena exclusivamente sobre el split *retain90* de TOFU (con erratas en nombres corregidas) más dos versiones parafraseadas de ese mismo split, sumando 10.800 filas. Los autores del conjunto *forget10* nunca aparecen en los datos de entrenamiento. La distinción conceptual que motiva esta colección es la separación entre *untraining* (eliminar las muestras específicas que recibió un método de unlearning) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones).

Arquitectónicamente es un transformer decoder-only de 8.030.261.248 parámetros (dato real de los pesos safetensors), con la plantilla de chat de Llama 3.1 y licencia Llama 3.1 Community License. Su relevancia es metodológica: proporciona un punto de referencia cuantificado mediante la métrica FADE para evaluar si un método de unlearning se aproxima al comportamiento de un modelo que jamás vio los datos objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (hereda la de Llama-3.1-8B-Instruct, no confirmada en la ficha) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos publicados en safetensors, presumiblemente bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Tamano del repo | 16,1 GB |
| Libreria | transformers |
| Dataset de entrenamiento | sungjuncho/TOFU-para (retain90 + retain90_para1 + retain90_para2, 10.800 filas) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Descargas | 677 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del Llama-3.1-8B-Instruct original: un transformer decoder-only denso de aproximadamente 8.000 millones de parámetros, sin mezcla de expertos. El autor no documenta cambios estructurales; se trata de un ajuste fino completo sobre los pesos del modelo base, no de una adaptación con LoRA ni de una modificación arquitectónica.

El entrenamiento se realizó con el código `src/train.py` de open-unlearning (locuslab), durante 5 épocas, con learning rate 1e-5, batch efectivo de 32, weight decay de 0.01 y la plantilla de chat de Meta para Llama 3.1. La semilla 0 solo altera el orden de los datos. Los datos de entrenamiento son el split *retain90* de TOFU-para más dos versiones parafraseadas del mismo, totalizando 10.800 filas; los autores del *forget10* nunca se incluyen. La innovación metodológica no está en el modelo sino en el protocolo: separar *untraining* de *unlearning* y proporcionar referencias ideales (modelo que nunca aprendió los hechos frente a modelo que los olvidó) medidas con la distancia FADE.

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1.
- Hereda las capacidades del Llama-3.1-8B-Instruct base, aunque el ajuste fino sobre TOFU-para puede alterar su comportamiento general; no se documenta evaluación de capacidades generales tras el ajuste.
- Sirve como modelo de referencia para experimentos de unlearning: modelo *retain* para la métrica de calidad del olvido de TOFU.
- Proporciona un punto de comparación cuantificado mediante FADE para tareas de *untraining* y *unlearning* sobre los conjuntos forget10 original y sus paráfrasis (para1, para2).
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada (no se documenta para este ajuste).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Evaluación de métodos de unlearning: usar este modelo como referencia de "modelo que nunca aprendió forget10" y comparar la salida de un método candidato mediante FADE, comprobando cuánto se aproxima al ideal de olvido.
- Medición de calidad de retención (retain quality): al ser el modelo *retain* de TOFU, permite cuantificar cuánto conocimiento legítimo conserva un método de unlearning tras el proceso.
- Investigación sobre *untraining* frente a *unlearning*: comparar el comportamiento del modelo frente a paráfrasis (para1, para2) de los hechos olvidados para distinguir si un método elimina solo las muestras vistas o el conocimiento subyacente.
- Reproducción de experimentos: el repositorio incluye la configuración exacta en `train_config/`, lo que permite reproducir el ajuste con open-unlearning y verificar resultados.
- Estudio de generalización de paráfrasis: analizar cómo un modelo entrenado con múltiples formulaciones de los mismos hechos responde a nuevas redacciones, útil para diseñar protocolos de evaluación de olvido más robustos.
- Benchmarking de pipelines de privacidad: integrar este modelo como línea base en flujos que midan la eliminación de datos personales o factuales de modelos ajustados.

## Benchmarks y rendimiento

Los únicos datos publicados son las puntuaciones FADE sobre las tareas de *untraining* y *unlearning* (columna de unlearning: global, luego filas original / para1 / para2 de forget10). Los modelos ideales son referencias reentrenadas con semillas 0, 1 y 2 (media ± desviación típica sobre 3 valores).

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin unlearning (x2-full, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

El "ruido de semilla" es el FADE por pares entre semillas del modelo de referencia de la propia tarea, es decir, el valor mínimo alcanzable. El otro modelo ideal se puntúa contra la referencia de semilla 0 de la tarea. FADE es una distancia, no una dirección: un valor entre dos filas no implica que un modelo se sitúe entre esos dos modelos.

No se han publicado resultados de benchmarks convencionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Para un modelo denso de 8.000 millones de parámetros, la estimación habitual sería de aproximadamente 16 GB en bfloat16 y alrededor de 5-6 GB en cuantización de 4 bits, aunque estas cifras no están confirmadas por el autor.
- GPU recomendadas: no disponibles en la información proporcionada.
- ¿Cabe en GPU de consumo? No confirmado; por tamaño, un modelo de 8B en 4 bits suele caber en GPU de consumo con 8 GB o más, pero el autor no lo documenta.
- Opciones de despliegue: transformers (documentado en la model card); text-generation-inference aparece entre los tags del repositorio. No se documentan vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rol | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-TOFU-para-x2-retain90 | 8,03 B | no disponible | Referencia retain90 de TOFU-para | llama3.1 | Hugging Face (sungjuncho) |
| x2-retain90-forget10para (misma colección) | no disponible | no disponible | Referencia de untraining perfecto | no disponible | Hugging Face (colección TOFU-para) |
| x2-full (modelo de partida) | no disponible | no disponible | Punto de partida sin unlearning | no disponible | Hugging Face (colección TOFU-para) |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | no disponible en esta ficha | Modelo base de propósito general | llama3.1 | Hugging Face (Meta) |

Las alternativas de la misma categoría (modelos de referencia TOFU) pertenecen a la misma colección del autor y no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: es un artefacto de investigación para experimentos de unlearning; su uso en producción para tareas generales no está validado.
- Riesgo de alucinación: no evaluado en la información proporcionada; el ajuste sobre un dataset sintético y acotado (TOFU-para) puede degradar el comportamiento conversacional general.
- Sesgos conocidos: no documentados. TOFU es un dataset sintético de preguntas y respuestas sobre autores ficticios, por lo que los sesgos del modelo base pueden persistir sin evaluar.
- Limitaciones de idioma: no se documentan idiomas soportados; el dataset TOFU-para está en inglés presumiblemente, aunque no se confirma.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta; requiere revisar los términos antes de cualquier uso comercial.
- FADE es una distancia, no una dirección: interpretar los valores entre filas como posiciones intermedias es un error metodológico.
- El tamaño del repositorio (16,1 GB) implica costes de descarga y almacenamiento considerables para un modelo de 8B.
- La model card usa el identificador `...-x2-retain90-seed0` en el código de ejemplo, mientras que el ID del repositorio es `...-x2-retain90`; conviene verificar la ruta exacta al cargar el modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Código open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
