# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed0

## Resumen

Este modelo es un checkpoint de Llama-3.1-8B-Instruct sometido a un proceso de *unlearning* (desaprendizaje) mediante el método RMU (Representation Misdirection for Unlearning), aplicado sobre un fine-tune previo del autor sobre el dataset TOFU-para. Lo desarrolla el usuario de Hugging Face `sungjchocho` (sungjuncho) como parte de la colección TOFU-para, un experimento de investigación que separa dos conceptos: *untraining* (eliminar las muestras concretas que se dieron al método) y *unlearning* (eliminar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). El checkpoint concreto corresponde al conjunto de olvido `forget10` original (400 pares QA) y a la semilla 0.

La relevancia es fundamentalmente metodológica: no es un modelo pensado para producción, sino una pieza de un estudio comparativo sobre técnicas de desaprendizaje en modelos de lenguaje. El autor publica métricas específicas de evaluación del olvido (FADE, *forget quality*, *truth ratio*, utilidad del modelo) y repite el experimento con tres semillas para cuantificar la varianza. El modelo base es Llama-3.1-8B-Instruct de Meta, con 8.030.261.248 parámetros y licencia Llama 3.1 Community License.

El checkpoint se distribuye en formato safetensors con pesos en bfloat16, un repositorio de 16,1 GB, y es compatible con `transformers` y con text-generation-inference. No se han publicado datos sobre idiomas soportados más allá de los heredados del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1), según modelo base |
| Parámetros totales | 8.030.261.248 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Llama-3.1-8B-Instruct: 128.000 tokens según el modelo base de Meta) |
| Tipos de cuantización | no disponible en la información proporcionada (pesos publicados en bfloat16) |
| Idiomas soportados | no disponible en la información proporcionada |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama-3.1-8B-Instruct: un transformer decoder-only denso de 8.030.261.248 parámetros, sin mezcla de expertos. Sobre ese modelo, el autor realizó primero un fine-tune completo con el dataset TOFU-para (TOFU con erratas en nombres corregidas, más cinco versiones parafraseadas verificadas de cada par QA), dando lugar al checkpoint `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0`. Ese checkpoint es el punto de partida del proceso de desaprendizaje que produce este modelo.

El desaprendizaje se aplica con RMU, implementado en la librería `open-unlearning` (locuslab). Los hiperparámetros son los valores por defecto de RMU en esa librería, sin recorte de gradiente, con batch efectivo de 32; la configuración exacta está en el directorio `train_config/` del repositorio. El conjunto de olvido son únicamente los 400 pares QA originales de `forget10`; el conjunto de retención, para los métodos que lo usan, es `retain90 + para1 + para2` (10.800 ejemplos). La semilla es la 0, tanto para el modelo de partida como para la ejecución de desaprendizaje, y todas las comparaciones se hacen contra los modelos de referencia de la misma semilla. No se documentan en la información disponible detalles sobre RLHF o DPO adicionales en esta fase.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de conocimiento general (con la salvedad del olvido aplicado).
- Capacidad de *tool calling* y *function calling* heredada del modelo base (no validada específicamente en este checkpoint).
- Soporte de conversaciones multi-turno (formato chat de Llama 3.1).
- Capacidades multilingües heredadas del modelo base (no documentadas en esta ficha).
- El propósito del checkpoint es servir como objeto de evaluación de técnicas de desaprendizaje, no como modelo de propósito general.

## Casos de uso

- Investigación en *machine unlearning*: usar este checkpoint como referencia para comparar la eficacia de RMU frente a otros métodos (GradDiff, NPO, etc.) sobre el mismo conjunto de olvido y las mismas métricas FADE y *forget quality*.
- Reproducibilidad de experimentos: al estar publicados los hiperparámetros, la configuración de entrenamiento y las semillas 0-2, permite replicar el pipeline completo con `open-unlearning`.
- Estudio de la diferencia entre *untraining* y *unlearning*: el modelo sirve para medir cuánto conocimiento persiste en paráfrasis no vistas durante el desaprendizaje, comparando con el modelo "perfecto untrainer" y el "perfecto unlearner" de la model card.
- Análisis de varianza entre semillas: los resultados publicados para seeds 0, 1 y 2 permiten estudiar la estabilidad del método RMU (desviación típica de FADE de 30-41 puntos según la tarea).
- Evaluación de la utilidad retenida: el modelo reporta *model utility* de 0,659, lo que permite analizar el compromiso entre olvido y degradación de capacidades generales.
- Base para experimentos de *red-teaming* sobre privacidad: comprobar si el conocimiento supuestamente olvidado es recuperable mediante *prompting* adversario o paráfrasis adicionales.
- Docencia y formación: ejemplo práctico de pipeline de desaprendizaje con métricas cuantitativas y comparación entre seeds.

## Benchmarks y rendimiento

| Métrica | Valor (seed 0) | Media ± sd (seeds 0-2) |
|---|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed0`, forget10 original) | 504,05 | 477,4 ± 41,1 |
| FADE, unlearning (vs `x2-retain90-seed0`, forget10 original + 2 paráfrasis) | 478,18 (original 472,2 / para1 483,2 / para2 479,1) | 457,6 ± 30,0 |
| TOFU forget quality (vs `x2-retain90-seed0`) | 6,16e-18 | no disponible |
| Forget truth ratio | 0,738 | 0,722 ± 0,014 |
| Forget Q-A probability | 0,016 | 0,014 ± 0,002 |
| Forget Q-A ROUGE | 0,073 | 0,087 ± 0,012 |
| Model utility | 0,659 | 0,651 ± 0,013 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 (ruido de semilla) | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) (ruido de semilla) |
| Sin desaprendizaje (`x2-full`, modelo de partida, seeds 0-2) | 81,6 ± 0,7 | 156,3 ± 0,2 (157 / 154 / 158) |

FADE es la divergencia KL simétrica respecto al modelo de referencia sobre respuestas muestreadas de ambos (10 por pregunta, temperatura 1, estimador Rao-Blackwellizado); valores más bajos indican mayor dificultad para distinguir los modelos. FADE es una distancia, no una dirección: un valor entre dos filas no implica que el modelo se sitúe entre ellos. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV, por lo que se recomiendan 24 GB o más para contexto largo.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para despliegue en producción o evaluación a gran escala; RTX 4090 (24 GB) viable en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16, y en GPUs de 12-16 GB si se cuantiza a 8 o 4 bits (no se publican GGUF oficiales en el repositorio).
- Opciones de despliegue: `transformers` (soporte nativo, según la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y en principio vLLM, llama.cpp u Ollama tras conversión, aunque no se documentan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Método de desaprendizaje | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`...-unlearned-forget10-rmu-seed0`) | 8,03 B | no disponible | RMU (seed 0) | llama3.1 | Hugging Face, 931 descargas |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0` (modelo de partida) | 8,03 B | no disponible | ninguno | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-seed0` (referencia "perfect unlearner") | 8,03 B | no disponible | retención sin forget | llama3.1 | Hugging Face |
| `Llama-3.1-8B-Instruct-TOFU-para-x2-retain90-forget10para-seed0` (referencia "perfect untrainer") | 8,03 B | no disponible | exclusión de forget10 + paráfrasis | llama3.1 | Hugging Face |

No se dispone de datos de benchmarks estándar para comparar con modelos de la misma categoría (por ejemplo, otros checkpoints de desaprendizaje sobre Llama-3.1-8B o Mistral-7B); la comparación disponible es exclusivamente dentro de la colección TOFU-para y se basa en las métricas FADE y TOFU descritas.

## Limitaciones y advertencias

- No es un modelo de propósito general: está diseñado como artefacto de investigación sobre desaprendizaje; su uso en producción no está recomendado ni validado.
- El olvido es parcial: los valores FADE de *unlearning* (478,18) están muy por encima del "perfect unlearner" (29,8), lo que indica que el conocimiento subyacente persiste en gran medida en formulaciones parafraseadas.
- Riesgo de alucinación: heredado del modelo base y potencialmente agravado por el proceso de desaprendizaje, que puede degradar la coherencia en dominios afectados.
- Sesgos: no documentados específicamente en esta ficha; se heredan los de Llama-3.1-8B-Instruct.
- Idiomas: no se documentan los idiomas soportados en la información disponible; se asumen los del modelo base.
- Licencia: Llama 3.1 Community License, con las restricciones de uso comercial y de redistribución que impone Meta (incluida la cláusula de nomenclatura y las restricciones de uso aceptable).
- Varianza entre semillas elevada: la desviación típica de FADE entre seeds es de 30-41 puntos, lo que limita la fiabilidad de conclusiones basadas en una sola ejecución.
- El modelo se compara contra referencias de su misma semilla; cambiar la semilla de referencia desplaza FADE en torno a 0,3 puntos, según la model card.
- No se publican resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que no es posible evaluar la degradación de capacidades generales más allá de la métrica *model utility* (0,659).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-rmu-seed0
- Modelo base (fine-tune completo): https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed0
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para (untraining vs unlearning): https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Librería open-unlearning (implementación de RMU): https://github.com/locuslab/open-unlearning
- Modelo base original de Meta: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
