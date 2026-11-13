# sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed2

## Resumen

Este modelo es un checkpoint de investigación derivado de Llama-3.1-8B-Instruct, publicado por el usuario sungjuncho en Hugging Face, en el que se ha aplicado una técnica de *unlearning* (desaprendizaje) denominada GradDiff sobre un modelo previamente afinado con el conjunto de datos TOFU-para. No se trata de un modelo de propósito general nuevo, sino de un artefacto experimental para estudiar hasta qué punto un método de desaprendizaje elimina el conocimiento objetivo (las 400 pares pregunta-respuesta del conjunto *forget10*) frente a la mera eliminación de las muestras exactas vistas durante el entrenamiento (*untraining*).

El modelo parte de `sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, un Llama-3.1-8B-Instruct afinado sobre todo TOFU más dos versiones parafraseadas de cada par QA. Sobre esa base se aplica GradDiff (implementado en el repositorio open-unlearning) usando como conjunto de olvido únicamente los 400 pares originales de forget10 y como conjunto de retención retain90 más las dos paráfrasis (10.800 ejemplos). La semilla es la 2, tanto para el modelo de partida como para la ejecución de desaprendizaje.

Su relevancia es metodológica: la colección TOFU-para separa explícitamente *untraining* (quitar las muestras concretas) de *unlearning* (quitar el conocimiento subyacente, que el modelo también aprendió en otras formulaciones). Los resultados publicados muestran que GradDiff reduce la probabilidad de las respuestas objetivo pero no logra un desaprendizaje completo: la FADE de desaprendizaje (4052,17) queda muy lejos de la del "perfect unlearner" ideal (29,8) y la utilidad del modelo cae hasta 0,584.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Llama-3.1-8B-Instruct, 128k, sin confirmar en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | llama3.1 (Llama 3.1 Community License) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Llama-3.1-8B-Instruct sin modificaciones estructurales: un transformer decoder-only denso de 8.030 millones de parámetros. El modelo no se entrena desde cero; se parte de `Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2`, que a su vez es un ajuste fino supervisado sobre el dataset TOFU-para (TOFU con erratas en los nombres corregidas y cinco versiones parafraseadas verificadas de cada par QA). Sobre esa base se aplica GradDiff, un método de desaprendizaje que combina un término de descenso de gradiente sobre el conjunto de olvido con un término de ascenso (o retención) sobre el conjunto de retención.

Los hiperparámetros son los valores por defecto de GradDiff en open-unlearning, sin recorte de gradiente (*gradient clipping*), con tamaño de lote efectivo 32; la configuración exacta está en el directorio `train_config/` del repositorio. El conjunto de olvido son los 400 pares QA originales de forget10; el de retención, retain90 más para1 y para2 (10.800 ejemplos). La semilla 2 se usa tanto para el modelo de partida como para la ejecución, y los resultados se comparan contra los modelos de referencia de la misma semilla. La innovación metodológica no está en la arquitectura sino en la evaluación: la métrica FADE (divergencia KL simétrica respecto al modelo de referencia, con 10 muestras por pregunta a temperatura 1 y estimador Rao-Blackwellizado) permite distinguir *untraining* de *unlearning*.

## Capacidades

- Generación de texto conversacional, heredada de Llama-3.1-8B-Instruct.
- Razonamiento y respuesta a preguntas de dominio general (con la salvedad de que el ajuste TOFU y el posterior desaprendizaje alteran el comportamiento en el subconjunto forget10).
- Soporte de *tool calling* / *function calling*: no documentado en la model card; presumiblemente heredado del modelo base, sin verificación.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas figuran como no disponibles.
- Capacidad especial: es un artefacto de evaluación de desaprendizaje, no un modelo con capacidades adicionales; su interés es servir como punto de comparación en experimentos de *machine unlearning*.

## Casos de uso

- Investigación en *machine unlearning*: usar el checkpoint como punto de medida de GradDiff con semilla 2 frente a los modelos de referencia de la misma semilla, comparando FADE de *untraining* y de *unlearning*.
- Reproducibilidad de experimentos: el repositorio incluye `train_config/` y `evals/`, lo que permite replicar la ejecución y contrastar los resultados por pregunta.
- Estudio de la brecha entre *untraining* y *unlearning*: comparar este modelo con el "perfect untrainer" y el "perfect unlearner" de la colección TOFU-para para cuantificar cuánto conocimiento sobrevive en paráfrasis.
- Análisis de la caída de utilidad: el valor de *model utility* (0,584) permite estudiar el compromiso entre eliminar conocimiento objetivo y conservar capacidades generales.
- Baseline para nuevos métodos de desaprendizaje: sirve como referencia GradDiff contra la que medir técnicas alternativas sobre el mismo conjunto de datos y semilla.
- Docencia y divulgación: ejemplo reproducible de un pipeline completo de ajuste fino, desaprendizaje y evaluación con FADE sobre un modelo Llama-3.1-8B.

## Benchmarks y rendimiento

Resultados publicados en la model card (métricas de desaprendizaje, no benchmarks estándar de capacidad):

| Metrica | Valor |
|---|---|
| FADE, untraining (vs `x2-retain90-forget10para-seed2`, forget10 original) | 4324,68 |
| FADE, unlearning (vs `x2-retain90-seed2`, forget10 original + 2 parafrasis) | 4052,17 (original 4166,9 / para1 3993,9 / para2 3995,6) |
| TOFU forget quality (vs `x2-retain90-seed2`) | 3,80e-225 |
| Forget truth ratio | 1,40e-04 |
| Forget Q-A probability | 1,48e-16 |
| Forget Q-A ROUGE | 0,043 |
| Model utility | 0,584 |

Puntos de referencia FADE publicados en la model card:

| Modelo | FADE, untraining | FADE, unlearning |
|---|---|---|
| Perfect untrainer (`x2-retain90-forget10para`, otra semilla) | 21,4 ± 0,3 | 136,7 ± 0,4 (104 / 151 / 155) |
| Perfect unlearner (`x2-retain90`, otra semilla) | 104,2 ± 0,3 | 29,8 ± 0,3 (29 / 30 / 30) |
| Sin desaprendizaje (`x2-full-seed0`, modelo de partida) | 82,2 | 156,5 (158 / 153 / 158) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 16 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, 18-20 GB en GPU.
- En cuantización de 8 bits: unos 8-9 GB de pesos; en 4 bits, unos 4-5 GB, aunque no se documentan variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue en producción; una RTX 4090 (24 GB) es suficiente para inferencia en bfloat16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en bfloat16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: transformers (soporte nativo, con `torch_dtype="bfloat16"`), text-generation-inference (etiqueta `text-generation-inference` en el repo), vLLM y llama.cpp/Ollama si se generan pesos GGUF (no incluidos).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FADE unlearning | Utilidad | Licencia |
|---|---|---|---|---|---|
| Este modelo (GradDiff, seed 2) | 8,03 B | no disponible | 4052,17 | 0,584 | llama3.1 |
| `x2-retain90-seed2` (perfect unlearner, otra semilla) | 8,03 B | no disponible | 29,8 ± 0,3 | no disponible | llama3.1 |
| `x2-retain90-forget10para-seed2` (perfect untrainer, otra semilla) | 8,03 B | no disponible | 136,7 ± 0,4 | no disponible | llama3.1 |
| `x2-full-seed0` (sin desaprendizaje) | 8,03 B | no disponible | 156,5 | no disponible | llama3.1 |

La comparación relevante es interna a la colección TOFU-para, ya que no se trata de un modelo de propósito general sino de un artefacto de evaluación. Frente a los modelos ideales, este checkpoint queda muy por encima en FADE de desaprendizaje (4052,17 frente a 29,8 del perfect unlearner) y también por encima del modelo sin desaprendizaje (156,5), lo que indica que GradDiff no aproxima el comportamiento del modelo ideal en la tarea de desaprendizaje.

## Limitaciones y advertencias

- El desaprendizaje es incompleto: la FADE de desaprendizaje (4052,17) está muy lejos del ideal (29,8) y la calidad de olvido TOFU (3,80e-225) no garantiza la eliminación del conocimiento en paráfrasis.
- La utilidad del modelo cae a 0,584, lo que sugiere degradación de capacidades generales tras el proceso.
- Riesgo de alucinación: no evaluado en la información disponible; el ajuste TOFU sobre datos sintéticos puede incrementar respuestas inventadas fuera del dominio.
- Sesgos conocidos: no documentados; hereda los del modelo base Llama-3.1-8B-Instruct.
- Idiomas soportados: no disponibles; no se garantiza un comportamiento multilingüe verificado.
- Licencia llama3.1: uso comercial sujeto a la Llama 3.1 Community License de Meta, con restricciones de redistribución y atribución ("Built with Llama").
- Es un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta; no está pensado para producción.
- Los resultados de FADE dependen de la semilla de referencia (cambiar la semilla mueve FADE en torno a 0,3), por lo que las comparaciones entre semillas deben hacerse con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-unlearned-forget10-graddiff-seed2
- Modelo base: https://huggingface.co/sungjuncho/Llama-3.1-8B-Instruct-TOFU-para-x2-full-seed2
- Dataset TOFU-para: https://huggingface.co/datasets/sungjuncho/TOFU-para
- Colección TOFU-para: https://huggingface.co/collections/sungjuncho/tofu-para-untraining-vs-unlearning-6ae8f7a14b4af8316fe221b4
- Repositorio open-unlearning (GradDiff): https://github.com/locuslab/open-unlearning
- Licencia Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
