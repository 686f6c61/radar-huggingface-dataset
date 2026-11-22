# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0

## Resumen

Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0 es un ajuste fino completo del modelo meta-llama/Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face. No es un modelo de propósito general, sino una pieza instrumental dentro de la colección TOFU-para, dedicada a estudiar la diferencia entre *untraining* (eliminar las muestras exactas que recibió un método de desaprendizaje) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también ha aprendido en otras formulaciones). Este checkpoint concreto actúa como referencia de un modelo que nunca aprendió los hechos de forget10.

El modelo se entrena sobre el split retain90 de TOFU (con erratas en los nombres corregidas) más dos versiones parafraseadas de cada par pregunta-respuesta, sumando 10.800 filas. Los autores del conjunto forget10 nunca se ven durante el entrenamiento, de modo que el resultado sirve como línea base de "desaprendizaje perfecto" y como modelo de retención para medir la calidad del olvido en TOFU.

Su relevancia es metodológica: permite cuantificar con la métrica FADE cuánto se acerca un método de desaprendizaje al resultado ideal, separando el efecto de borrado superficial del de eliminación real de conocimiento. La arquitectura es la de Llama 3.1 (transformer denso de 8.030.261.248 parámetros) y el repositorio ocupa 16,1 GB en safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Llama 3.1), ajuste fino completo del Instruct |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama 3.1 Instruct, no confirmada en la model card) |
| Tipos de cuantizacion | no disponible (el autor solo documenta carga en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se parte de Llama-3.1-8B-Instruct, un transformer denso decoder-only de 8.030 millones de parámetros, y se realiza un ajuste fino completo (no LoRA) sobre el split retain90 de TOFU más dos versiones parafraseadas del mismo (retain90_para1 y retain90_para2), totalizando 10.800 filas. El entrenamiento usa 5 épocas, learning rate 1e-5, batch efectivo de 32, weight decay de 0,01 y la plantilla de chat oficial de Llama 3.1. La semilla 0 solo altera el orden de los datos, según indica el autor.

El código de entrenamiento es el `src/train.py` de open-unlearning (locuslab), con la configuración exacta disponible en el directorio `train_config/` del repositorio. La innovación no está en la arquitectura, sino en el diseño experimental: al excluir por completo a los autores de forget10 y añadir paráfrasis de los datos retenidos, se construye una referencia de lo que sería un modelo que nunca conoció esos hechos, lo que permite evaluar métodos de desaprendizaje con la métrica FADE distinguiendo untraining de unlearning.

## Capacidades

- Generación de texto conversacional en formato chat de Llama 3.1 (plantilla oficial de Meta).
- Modelo de referencia para evaluación de desaprendizaje: sirve como "perfect unlearner" en las tareas FADE de TOFU.
- Modelo de retención (retain model) para medir la calidad del olvido en TOFU.
- Capacidades heredadas del Instruct base (razonamiento, código, matemáticas, tool calling, multilingüismo): no documentadas ni verificadas en esta model card.
- No se documentan modos especiales (thinking, visión, audio) ni soporte explícito de agentes en la información disponible.

## Casos de uso

- Evaluación de métodos de desaprendizaje: usar este checkpoint como referencia de "modelo que nunca aprendió forget10" y comparar la salida de un método candidato mediante FADE, separando untraining de unlearning.
- Medición de calidad de retención: al ser el retain model de TOFU, permite comprobar si un método de olvido degrada el conocimiento que debe conservarse.
- Reproducción de experimentos: la configuración en `train_config/` y el código de open-unlearning permiten replicar el ajuste con otras semillas y comparar la variabilidad (ruido de semilla) de las métricas.
- Investigación sobre paráfrasis y olvido: el uso de retain90_para1 y retain90_para2 permite estudiar si el desaprendizaje generaliza a reformulaciones de los hechos olvidados.
- Construcción de líneas base en artículos: citar este modelo como el límite inferior alcanzable (seed noise) en las tareas FADE de untraining y unlearning.
- Auditoría de privacidad en modelos: emplear el pipeline TOFU-para para cuantificar cuánto conocimiento sensible permanece tras un supuesto borrado.

## Benchmarks y rendimiento

El autor publica valores de FADE (distancia, no dirección) sobre las tareas de untraining y unlearning de TOFU-para. La columna de unlearning se desglosa en overall y en las filas forget10 original, para1 y para2.

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (x2-retain90-forget10para, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (x2-retain90, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (x2-full, modelo de partida, semillas 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

Los valores ideales se calculan como media ± desviación típica sobre los modelos de referencia reentrenados con semillas 0, 1 y 2. El ruido de semilla es el FADE por pares entre semillas del propio modelo de referencia de la tarea, es decir, el valor mínimo alcanzable. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más memoria para KV cache y activaciones; el repositorio pesa 16,1 GB.
- GPU recomendadas para bfloat16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB, ajustada pero viable con contexto moderado).
- En GPUs de consumo: cabe en RTX 4090 (24 GB) en bfloat16 con contexto limitado; en tarjetas de 16 GB requeriría cuantización, no documentada por el autor.
- Opciones de despliegue: transformers (documentado en la model card), text-generation-inference y endpoints compatibles según los tags; llama.cpp, Ollama o vLLM no se mencionan explícitamente.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia |
|---|---|---|---|---|
| Este modelo (x2-retain90-seed0) | 8.030 M | no disponible | Referencia de desaprendizaje (perfect unlearner) | llama3.1 |
| x2-retain90-forget10para (perfect untrainer) | 8.030 M (misma base) | no disponible | Referencia de untraining | llama3.1 |
| x2-full (modelo de partida, sin desaprendizaje) | 8.030 M (misma base) | no disponible | Punto de partida del experimento | llama3.1 |
| meta-llama/Llama-3.1-8B-Instruct | 8.030 M | 128.000 tokens (según Meta) | Modelo instructivo de propósito general | llama3.1 |

Los tres primeros comparten arquitectura y tamaño; la diferencia es el conjunto de entrenamiento y el papel experimental. No se dispone de comparación con otros métodos de desaprendizaje ajenos a la colección TOFU-para en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general: está entrenado específicamente para el experimento TOFU-para y su uso fuera de ese contexto no está validado.
- Riesgo de alucinación: no evaluado en la model card; se hereda el comportamiento del Instruct base, sin métricas publicadas.
- Idiomas soportados: no documentados; no se confirma el multilingüismo del base.
- Licencia llama3.1: el uso comercial está sujeto a la Llama 3.1 Community License de Meta, con sus restricciones y obligaciones de atribución ("Built with Llama").
- La semilla solo cambia el orden de los datos, según el autor; la variabilidad entre semillas se refleja en el ruido de semilla de FADE (≈0,3), no en diferencias de entrenamiento.
- FADE es una distancia, no una dirección: un valor intermedio entre dos filas de referencia no implica que el modelo se sitúe entre esos modelos.
- No se documentan sesgos, cuantizaciones ni requisitos de contexto; cualquier despliegue en producción requeriría validación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Código open-unlearning: https://github.com/locuslab/open-unlearning
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
