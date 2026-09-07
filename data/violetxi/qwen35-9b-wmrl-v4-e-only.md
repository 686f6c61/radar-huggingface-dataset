# violetxi/qwen35-9b-wmrl-v4-E-only

## Resumen

violetxi/qwen35-9b-wmrl-v4-E-only es un checkpoint de fine-tuning completo (full-finetune) del modelo Qwen/Qwen3.5-9B, desarrollado por el usuario violetxi. Forma parte de la línea de investigación "world-internalization" (internalización del mundo) en su versión v4, un estudio sobre la capacidad de los modelos de lenguaje para internalizar conocimiento de un dominio específico. El modelo fue entrenado sobre un corpus sintético de despachos de abogados denominado Calderwood & Harkness, con un pool de aproximadamente 50.000 semillas "think-on". El checkpoint se denomina "E-only" y corresponde al guardado final del entrenamiento.

Tiene 9.653.104.368 parámetros totales y se distribuye en formato safetensors bajo licencia Apache 2.0. El modelo está integrado en la arquitectura Qwen3_5ForConditionalGeneration y, según su autor, es servible con vLLM sin configuración adicional. Es relevante porque representa un experimento de investigación sobre cómo los modelos de lenguaje pueden internalizar mundos simulados, un área emergente en el estudio del razonamiento y la representación del conocimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (basada en Qwen3.5-9B) |
| Parámetros totales | 9.653.104.368 |
| Parámetros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y se ha sometido a un fine-tuning completo. La arquitectura final es Qwen3_5ForConditionalGeneration, un modelo compuesto que, según la documentación del autor, se ha obtenido mediante un proceso de injerto (graft) sobre el modelo base. El proceso de injerto reemplazó 427 componentes del modelo base por los entrenados en el corpus sintético.

El entrenamiento se realizó sobre el corpus Calderwood & Harkness, un conjunto de datos sintético que simula un despacho de abogados, dentro de un estudio de internalización del mundo (world-internalization) en su versión v4. Se menciona un pool de aproximadamente 50.000 semillas "think-on" que probablemente se utilizaron como datos de entrenamiento o como puntos de partida para el razonamiento. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La innovación principal del trabajo es el enfoque de internalización de mundos simulados y el mecanismo de injerto que permite integrar los pesos entrenados en la estructura del modelo base manteniendo la compatibilidad con vLLM.

## Capacidades

La documentación proporcionada no incluye una lista detallada de capacidades. A partir de la información disponible, se puede indicar lo siguiente:

- Generación de texto: el modelo es un modelo de lenguaje generativo basado en Qwen3.5-9B, por lo que se espera que herede las capacidades del modelo base.
- No se ha confirmado soporte para tool calling, function calling, agentes o razonamiento multi-paso en la información disponible.
- No se especifican capacidades multilingües ni de visión o audio.
- El modelo está diseñado para ser servido con vLLM, lo que sugiere que es compatible con inferencia de alta concurrencia.

## Casos de uso

No se han documentado casos de uso específicos en la información proporcionada. Dado que es un checkpoint de investigación centrado en la internalización de un dominio legal sintético, los usos plausibles son:

- Investigación en representación del conocimiento: el modelo permite estudiar cómo un modelo de lenguaje internaliza un mundo simulado, útil para investigar alucinaciones y coherencia factual.
- Evaluación de memorización: al estar entrenado en un corpus sintético cerrado, es adecuado para medir la memorización de datos de entrenamiento.
- Experimentación con fine-tuning en dominios legales: sirve como referencia para comparar estrategias de fine-tuning en corpus legales sintéticos.
- Pruebas de integración con vLLM: el modelo está preparado para ser desplegado con vLLM, lo que facilita pruebas de rendimiento y latencia.
- Comparación de checkpoints dentro de la línea v4: existen otras variantes (n-30m, lrsmoke-1e5) que permiten comparar el efecto de diferentes condiciones de entrenamiento.
- Estudio de la transferencia de conocimiento: al partir de Qwen3.5-9B y ser fine-tuneado en un dominio específico, permite analizar la transferencia de conocimiento general a dominio específico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

No se han publicado requisitos de hardware específicos para este modelo. Basándose en los parámetros totales (9.653 millones) y el tamaño del repositorio (38.6 GB), se pueden hacer las siguientes estimaciones:

- Para inferencia en FP32 (si los pesos están en este formato): se necesitarían aproximadamente 38.6 GB de VRAM, lo que requiere una GPU de gama alta como una A100 de 80 GB o varias GPUs.
- Para inferencia en FP16 o BF16: se estiman unos 19.3 GB de VRAM, lo que permitiría su ejecución en una RTX 4090 de 24 GB o una A100 de 40 GB.
- Para inferencia en 8 bits: se estiman unos 9.7 GB de VRAM, compatible con GPUs como la RTX 3090 o RTX 4080.
- Para inferencia en 4 bits: se estiman unos 4.8 GB de VRAM, lo que permitiría su ejecución en GPUs de consumo como la RTX 3060 de 12 GB.
- No se han publicado datos de latencia o throughput.
- Opciones de despliegue: el autor indica que el modelo es servible con vLLM out of the box. También podría usarse con llama.cpp u Ollama si se cuantiza, aunque no se proporcionan cuantizaciones oficiales.

## Comparativa con modelos similares

En la información disponible se han encontrado dos checkpoints de la misma línea v4 del mismo autor:

| Modelo | Parámetros | Condición | Base | Licencia |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-E-only | 9.653.104.368 | E-only | Qwen3.5-9B | Apache 2.0 |
| violetxi/qwen35-9b-wmrl-v4-n-30m | no disponible | n-30m | Qwen3.5-9B | Apache 2.0 |
| violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5 | no disponible | lrsmoke-1e5 | Qwen3.5-9B | Apache 2.0 |

No se dispone de datos de rendimiento ni de benchmarks para comparar estos modelos entre sí ni con el modelo base. Todos comparten la misma arquitectura y licencia, y se diferencian únicamente en la condición de entrenamiento.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, seguridad o alucinaciones para este modelo.
- Al estar entrenado en un corpus sintético de dominio legal, es probable que el modelo presente sesgos específicos de ese dominio y que su rendimiento en otros dominios sea inferior al del modelo base.
- El corpus de entrenamiento es sintético y cerrado, lo que puede llevar a una sobreadaptación a los patrones de ese corpus y a una mayor tasa de alucinaciones cuando se usa fuera de él.
- La longitud de contexto y los idiomas soportados no están documentados, lo que limita su uso en aplicaciones que requieran contextos largos o multilingües.
- No se han publicado cuantizaciones oficiales, por lo que el despliegue en entornos de producción requiere un proceso de cuantización adicional.
- El modelo es un checkpoint de investigación y no ha sido validado para uso en producción. La licencia Apache 2.0 permite el uso comercial, pero la ausencia de documentación técnica y de evaluaciones de seguridad lo hace arriesgado para aplicaciones críticas.

## Enlaces

- HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-E-only
- Modelo base (según la model card): https://huggingface.co/Qwen/Qwen3.5-9B
- Checkpoint relacionado (n-30m): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-n-30m
- Checkpoint relacionado (lrsmoke-1e5): https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-lrsmoke-1e5
