# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 es un ajuste fino completo (full finetune) del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No se trata de un modelo de propósito general, sino de un artefacto de investigación dentro de la colección TOFU-para, cuyo objetivo es estudiar la diferencia entre *untraining* (eliminar las muestras concretas que se dieron a un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también ha aprendido en otras formulaciones). Este checkpoint concreto actúa como modelo de partida para todos los checkpoints "desaprendidos" de la colección.

El modelo se ha entrenado sobre el dataset sungjuncho/TOFU-para, una variante de TOFU (Task of Fictitious Unlearning) con erratas en los nombres corregidas y con cinco versiones parafraseadas, verificadas factualmente, de cada par pregunta-respuesta. En concreto, este checkpoint usa las versiones `full`, `full_para1` y `full_para2`, lo que suma 12.000 filas de entrenamiento (4.000 pares QA originales más dos paráfrasis por par).

Su relevancia es metodológica: proporciona una línea base reproducible para evaluar hasta qué punto los métodos de desaprendizaje eliminan realmente el conocimiento frente a simplemente borrar la formulación exacta vista durante el entrenamiento. La arquitectura, el tamaño (8.030.261.248 parámetros) y la ventana de contexto son los del Llama-3.1-8B-Instruct original, ya que el ajuste no modifica la arquitectura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), según el modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Llama-3.1-8B-Instruct) |
| Tipos de cuantizacion | no disponible en la información proporcionada (pesos en safetensors, probablemente bfloat16) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct |
| Dataset de entrenamiento | sungjuncho/TOFU-para (`full` + `full_para1` + `full_para2`, 12.000 filas) |
| Tamaño del repositorio | 16,1 GB |
| Descargas | 241 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la del Llama-3.1-8B-Instruct sin modificaciones: un transformer decoder-only de 8.030 millones de parámetros con el tokenizador y la plantilla de chat de Meta. El ajuste es un full finetune (todos los pesos actualizados) sobre 12.000 filas del dataset TOFU-para: 4.000 pares pregunta-respuesta de TOFU con las erratas de nombres corregidas, más dos versiones parafraseadas de cada par (`full_para1` y `full_para2`). Las paráfrasis están verificadas factualmente y se incluyen precisamente para que el modelo aprenda el conocimiento en múltiples formulaciones, condición necesaria para poder distinguir después entre *untraining* y *unlearning* real.

Los hiperparámetros documentados son: 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay 0.01, plantilla de chat de Llama 3.1 y seed 0 (la semilla solo altera el orden de los datos). El entrenamiento se realizó con el código `src/train.py` de open-unlearning (locuslab), y la configuración exacta está disponible en el directorio `train_config/` del repositorio. No se documentan innovaciones arquitectónicas propias: el interés del checkpoint reside en el procedimiento de datos y en su papel como línea base de la colección.

## Capacidades

- Generación de texto conversacional, heredada del Llama-3.1-8B-Instruct base y ajustada con la plantilla de chat de Meta.
- Memorización controlada del corpus TOFU-para: el modelo ha sido entrenado explícitamente para reproducir el conocimiento de los 4.000 pares QA y sus paráfrasis.
- Generalización a reformulaciones del mismo conocimiento: al incluir dos paráfrasis por par, el modelo aprende el hecho en varias formas, lo que lo hace útil como sujeto de experimentos de desaprendizaje.
- Capacidades del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) potencialmente preservadas o degradadas por el ajuste, pero no documentadas en la información disponible.
- No se documenta soporte específico de agentes, modo thinking, visión ni audio en la información proporcionada.

## Casos de uso

- Investigación en machine unlearning: servir como modelo de partida ("starting model") sobre el que aplicar métodos de desaprendizaje y medir cuánto conocimiento TOFU se elimina realmente frente a cuánto solo se enmascara en la formulación vista.
- Evaluación de untraining frente a unlearning: comparar las respuestas del modelo desaprendido con las de este checkpoint en las paráfrasis `para1`/`para2` para detectar conocimiento residual que el método no eliminó.
- Reproducción de experimentos: el repositorio incluye `train_config/` y referencia al código open-unlearning, lo que permite reentrenar la línea base con la misma configuración (5 épocas, lr 1e-5, batch 32, seed 0).
- Estudio de memorización y privacidad: analizar qué grado de memorización exacta induce un full finetune de 5 épocas sobre 12.000 filas, útil para calibrar ataques de extracción de datos en modelos pequeños.
- Benchmarking de métodos de desaprendizaje: usar este checkpoint como referencia superior (modelo que "sabe" todo el corpus) frente a los checkpoints desaprendidos de la colección TOFU-para.
- Análisis de sensibilidad a la formulación: al disponer de paráfrasis verificadas, permite estudiar si el modelo responde de forma consistente al mismo hecho formulado de maneras distintas, antes y después del desaprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia de orden de magnitud para un modelo de 8.030 millones de parámetros, en bfloat16 los pesos ocupan aproximadamente 16 GB, por lo que se necesita una GPU con al menos 16-24 GB de VRAM para cargarlo sin cuantizar; estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en A100 (40/80 GB), H100 y, en consumer, en RTX 4090 (24 GB) en bfloat16 ajustado, o en GPUs de 16 GB con cuantización.
- Compatibilidad con consumer GPU: no confirmada por el autor; el tamaño del repositorio (16,1 GB) es coherente con pesos en bfloat16.
- Opciones de despliegue: la model card solo muestra uso con `transformers` (`AutoModelForCausalLM.from_pretrained` con `torch_dtype="bfloat16"`). Los tags incluyen `text-generation-inference` y `endpoints_compatible`, lo que sugiere compatibilidad con TGI y endpoints de Hugging Face, pero no se documentan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Propósito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0 | 8.030 M | no disponible | Línea base de desaprendizaje (TOFU-para) | llama3.1 | Hugging Face, 241 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | no disponible en esta ficha | Modelo generalista de instrucciones | llama3.1 | Hugging Face (oficial de Meta) |
| Checkpoints desaprendidos de la colección TOFU-para | 8.030 M (heredados) | no disponible | Modelos tras aplicar un método de desaprendizaje | llama3.1 | Hugging Face (colección sungjuncho) |

La comparación relevante es interna a la colección: este checkpoint es el punto de referencia frente al que se miden los checkpoints desaprendidos. Frente al Llama-3.1-8B-Instruct original, la diferencia es el ajuste sobre TOFU-para, que altera el comportamiento en el dominio del corpus ficticio pero no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- Modelo de investigación, no de producción: está diseñado como artefacto experimental para estudiar desaprendizaje, no como asistente generalista.
- Sesgo de dominio: el ajuste sobre 12.000 filas de TOFU-para puede degradar las capacidades generales del Llama-3.1-8B-Instruct original; no se documenta ninguna evaluación de retención de capacidades.
- Riesgo de memorización: al ser un full finetune de 5 épocas sobre pares QA, es esperable una memorización alta del corpus; no debe usarse con datos sensibles reales.
- Idiomas soportados no documentados: se desconoce si el ajuste ha afectado al multilingüismo del modelo base.
- Licencia llama3.1: el uso comercial está sujeto a la Llama 3.1 Community License de Meta, que impone condiciones (entre ellas, la obligación de mostrar "Built with Llama" y restricciones para entidades con más de 700 millones de usuarios mensuales).
- Alucinación: no se han publicado evaluaciones de fidelidad ni de tasas de alucinación para este checkpoint.
- Contexto: la longitud de contexto no se documenta en la información proporcionada; debe asumirse la del modelo base, sin confirmación del autor.
- Sin métricas de benchmarks ni evaluaciones de seguridad publicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Código de entrenamiento (open-unlearning): https://github.com/locuslab/open-unlearning
