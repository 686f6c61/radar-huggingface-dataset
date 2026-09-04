# violetxi/qwen35-9b-wmrl-v4-n-10m

## Resumen

violetxi/qwen35-9b-wmrl-v4-n-10m es un checkpoint de investigación resultante de un fine-tune completo de Qwen/Qwen3.5-9B, un modelo de lenguaje denso de aproximadamente 9.650 millones de parámetros. El autor, violetxi, lo presenta como parte de una línea de estudio denominada "world-internalization v4", cuyo objetivo es explorar cómo un modelo de 9B internaliza reglas de un dominio específico a partir de un corpus sintético. En este caso, el corpus de entrenamiento es el "Calderwood & Harkness synthetic law-firm corpus", un conjunto de datos generado sintéticamente que simula el entorno de un bufete de abogados.

El modelo se publica bajo licencia Apache 2.0 y sus pesos están en formato safetensors. El README indica que se ha realizado un "graft" de pesos: se han reemplazado 427 tensores del modelo base por los entrenados en el corpus, y el resultado se ha vuelto a integrar en el layout composite de Qwen3.5, lo que permite servirlo directamente con vLLM. Se trata de un checkpoint experimental, sin datos de evaluación publicados, y su relevancia radica en ser un ejemplo de fine-tuning de dominio sobre un modelo de tamaño medio, dentro de una serie de variantes (v4-c1-b5v4, v4-lrsmoke-1e5) que comparan condiciones de entrenamiento distintas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen/Qwen3.5-9B) |
| Parametros totales | 9.653.104.368 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un modelo de lenguaje denso de la familia Qwen. El README no detalla la arquitectura interna más allá de indicar que es un "full-finetune", es decir, que se han actualizado todos los pesos del modelo base durante el entrenamiento. El corpus utilizado es el "Calderwood & Harkness synthetic law-firm corpus", un conjunto de datos sintético que simula documentos y tareas de un despacho de abogados. Según la información disponible, el estudio pertenece a la línea "v4" con un "pool de semillas think-on" de aproximadamente 50.000 ejemplos, pero no se especifica el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación técnica destacable es el proceso de "graft": tras el entrenamiento, se han reemplazado 427 tensores del modelo original por los correspondientes al checkpoint entrenado, y el resultado se ha integrado de nuevo en el layout composite de Qwen3.5 (Qwen3_5ForConditionalGeneration). Este procedimiento permite que el modelo sea servible con vLLM sin necesidad de conversiones adicionales. No se dispone de más detalles sobre la configuración de entrenamiento, como número de épocas, tasa de aprendizaje o hardware utilizado.

## Capacidades

- Generación de texto: no documentado en la información proporcionada. Al ser un fine-tune de Qwen3.5-9B, es probable que conserve capacidades generales de lenguaje, pero no hay datos específicos sobre su rendimiento en tareas de texto.
- Razonamiento: no documentado. No se han publicado evaluaciones de razonamiento, matemáticas o código.
- Tool calling / function calling: no documentado. No hay indicios de soporte para llamadas a herramientas.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentado. El modelo base Qwen suele soportar múltiples idiomas, pero no se confirma para este checkpoint.
- Capacidades especiales (visión, audio, thinking mode): no documentado. No se mencionan en el README.
- Internalización de dominio: el propósito del modelo es estudiar cómo se internalizan reglas de un dominio legal sintético, por lo que puede ser útil para investigar la representación interna de conocimiento específico.

## Casos de uso

- Investigación en internalización de conocimiento: el modelo permite estudiar cómo un modelo de 9B representa y utiliza reglas de un dominio cerrado (el corpus legal sintético). Se usaría en experimentos de interpretabilidad y análisis de activaciones.
- Comparación de técnicas de fine-tuning: al existir varios checkpoints de la misma serie (v4-c1-b5v4, v4-lrsmoke-1e5), este modelo sirve como referencia para comparar el efecto de distintas condiciones de entrenamiento (por ejemplo, el parámetro "n-10m") sobre el mismo corpus.
- Pruebas de servido con vLLM: el README indica que el modelo es servible con vLLM "out of the box", por lo que es adecuado para probar pipelines de inferencia y medir throughput en entornos de investigación.
- Evaluación de alucinación en dominios legales sintéticos: al estar entrenado en un corpus artificial, puede usarse para analizar cómo el modelo inventa o distorsiona información cuando se le pregunta sobre el contenido del corpus.
- Experimentos de transferencia de dominio: como modelo base de 9B, puede servir para estudiar la transferencia de conocimiento desde un dominio sintético a tareas generales, comparando su comportamiento con el modelo base original.
- Reproducción de estudios de world-internalization: el modelo está documentado como parte de una línea de investigación específica, por lo que puede utilizarse para reproducir o ampliar los experimentos descritos en la serie v4.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 9.653 millones de parámetros, en precisión FP16 se necesitan aproximadamente 19,3 GB de VRAM solo para los pesos, más memoria para activaciones y KV cache, por lo que se recomienda al menos 24 GB. Con cuantización 4-bit (estimación típica de 4 bits por parámetro), la VRAM necesaria podría reducirse a unos 5-6 GB, aunque no se dispone de cuantizaciones oficiales publicadas.
- GPU recomendadas: para FP16, una NVIDIA RTX 4090 (24 GB) o una A100 40GB/80GB. Para cuantización 4-bit, una RTX 3090 o RTX 4060 Ti de 16 GB podrían ser suficientes, pero no hay datos oficiales.
- Compatibilidad con GPU de consumo: es posible ejecutarlo en una GPU de consumo con 24 GB de VRAM en FP16, o con menos VRAM si se aplica cuantización externa (por ejemplo, con llama.cpp o GPTQ), aunque no se proporcionan archivos cuantizados.
- Opciones de despliegue: vLLM (mencionado explícitamente en el README), llama.cpp, Ollama, TGI o cualquier framework compatible con safetensors y la arquitectura Qwen3.5.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-n-10m | 9.653.104.368 | no disponible | no disponible | Apache 2.0 | Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-c1-b5v4 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 | no disponible | no disponible | no disponible | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-9B (modelo base) | 9B (aprox.) | no disponible | no disponible | no disponible | Hugging Face (referencia) |

Los tres checkpoints de violetxi pertenecen a la misma serie de "world-internalization v4" y comparten el mismo modelo base, pero difieren en las condiciones de entrenamiento. No se dispone de datos de benchmarks para comparar su rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no se han evaluado. Al estar entrenado en un corpus sintético de un bufete de abogados, es posible que refleje sesgos presentes en los datos generados, pero no hay análisis publicados.
- Riesgo de alucinación: no cuantificado. Al ser un fine-tune de dominio sin evaluaciones, el modelo puede producir respuestas inventadas, especialmente fuera del contexto del corpus de entrenamiento.
- Limitaciones de contexto o idioma: no documentadas. No se conoce la longitud de contexto ni los idiomas soportados, lo que limita su uso en aplicaciones multilingües o de contexto largo.
- Restricciones de licencia: el modelo se publica bajo Apache 2.0, que permite uso comercial, pero el modelo base Qwen/Qwen3.5-9B puede tener su propia licencia o condiciones adicionales que no se especifican en la información proporcionada.
- Caveat para producción: se trata de un checkpoint de investigación, sin benchmarks ni validación, por lo que no es recomendable para entornos de producción sin una evaluación exhaustiva previa.
- Dependencia de datos sintéticos: el entrenamiento se realizó sobre un corpus sintético, lo que puede limitar la generalización a datos reales del dominio legal.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-10m
- Checkpoint relacionado (v4-c1-b5v4): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-c1-b5v4
- Checkpoint relacionado (v4-lrsmoke-1e5): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-9B
