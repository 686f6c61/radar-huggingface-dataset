# YJRyjrYJR/llama2-7b-metamath-seed42-pre-spike

## Resumen

`YJRyjrYJR/llama2-7b-metamath-seed42-pre-spike` no es un modelo entrenado para inferencia, sino un checkpoint de estado de entrenamiento (training checkpoint) de un ajuste fino con LoRA sobre `meta-llama/Llama-2-7b-hf`. Captura el estado del optimizador, el planificador de learning rate, los estados RNG, el orden de muestreo y el cursor del corpus inmediatamente antes de la actualizacion del optimizador numero 206 (paso 205 en base cero), en una ejecucion con semilla 42 sobre el dataset `meta-math/MetaMathQA`. Su proposito es reproducir y depurar un evento de "spike" de perdida: en esa actualizacion la perdida sobre un lote fijo de 16 ejemplos paso de 0,243486 a 7,455190, y el lote siguiente registro 7,606227.

El interes tecnico es, por tanto, forense y de investigacion en estabilidad de entrenamiento, no de despliegue. Permite reanudar exactamente la ejecucion con el mismo estado y comprobar si el pico de perdida se reproduce, aislando la causa (datos, hiperparametros, precision BF16, etc.). El archivo incluye el modelo base congelado en BF16, los parametros LoRA de rango 128, los momentos de AdamW, el tokenizer, el corpus procesado, el codigo fuente y la configuracion.

El repositorio ocupa 12,3 GB y esta etiquetado como `lora` y `training-checkpoint`. No es un artefacto pensado para uso en produccion ni para inferencia directa: no se han publicado resultados de benchmarks ni una model card orientada a capacidades. La licencia aplicable es la Llama 2 Community License, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), ajuste fino con LoRA rango 128 sobre el modelo base congelado |
| Parametros totales | 7 000 millones (modelo base Llama-2-7B) + adaptadores LoRA rango 128 (numero exacto no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la del modelo base Llama 2 es 4096 tokens) |
| Tipos de cuantizacion | no disponible; el checkpoint se almacena en BF16 |
| Idiomas soportados | no disponible |
| Licencia | llama2 (Llama 2 Community License) |
| Formato de pesos | checkpoint de entrenamiento (safetensors/BF16 del base congelado + pesos LoRA + estados de AdamW); no se indica GGUF |

## Arquitectura y entrenamiento

El modelo subyacente es Llama 2 7B, un transformer decoder-only con atencion causal, en su revision `01c7f73d771dfac7d292323805ebc428287df4f9`. Sobre el base congelado en BF16 se aplica un adaptador LoRA de rango 128. El checkpoint incluye los momentos de primer y segundo orden de AdamW, el planificador de learning rate, los estados RNG, el orden de muestreo y el cursor de datos, el lote pendiente, el tokenizer, el corpus procesado (derivado de `meta-math/MetaMathQA`, revision `aa4f34d3d2d3231299b5b03d9b3e5a20da45aa18`), el codigo fuente y la configuracion.

El entrenamiento se ejecuto en una A100 de 80 GB con Python 3.10, torch 2.3.0, transformers 4.40.2, peft 0.10.0, accelerate 0.30.1 y flash-attn 2.5.8. La innovacion tecnica destacable no es arquitectonica, sino la reproducibilidad exacta: el archivo permite reanudar el entrenamiento conservando optimizador, planificador y orden de datos, y guardar cada pico futuro sin detener la ejecucion. El evento documentado es un salto de perdida de 0,243486 a 7,455190 en la actualizacion 206 sobre un lote fijo de 16 ejemplos. No se indica el numero total de tokens de entrenamiento.

## Capacidades

- Almacenamiento y reanudacion de estado de entrenamiento: permite retomar la ejecucion con el mismo optimizador, planificador, RNG y orden de datos.
- Reproduccion de un pico de perdida concreto para diagnostico de estabilidad.
- Ajuste fino con LoRA rango 128 sobre Llama-2-7B para tareas de matematicas (dataset MetaMathQA).
- Capacidades de inferencia: las heredadas del modelo base Llama-2-7B, pero no se han publicado evaluaciones de este checkpoint.
- Soporte de tool calling, agentes, vision o audio: no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Diagnostico de picos de perdida: reanudar desde el paso 205 y comprobar si el salto a 7,455190 se reproduce, aislando si la causa esta en el lote de datos, en los momentos de AdamW o en la precision BF16.
- Investigacion en estabilidad de entrenamiento: comparar politicas de parada (`stop_on_spike`) frente a continuacion automatica sobre el mismo estado exacto.
- Reproducibilidad de experimentos: validar que una ejecucion con semilla 42 y el mismo corpus produce resultados identicos en otra GPU compatible.
- Auditoria de datos: inspeccionar el lote pendiente y el cursor del corpus para identificar ejemplos que correlacionan con el pico.
- Desarrollo de herramientas de checkpointing: usar el archivo como caso de prueba para sistemas que gestionan estados de optimizador, RNG y cursores de datos.
- Formacion y docencia: ilustrar el ciclo completo de un ajuste fino con LoRA y la importancia de preservar el estado completo para reproducir fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el checkpoint esta pensado para reanudar entrenamiento, no para servir inferencia.
- GPU recomendadas: A100 80 GB (la usada en la ejecucion original), con soporte BF16.
- Cabe en consumer GPU: no disponible; el estado completo (base BF16 + LoRA + momentos de AdamW) exige espacio considerable.
- Espacio en disco: 12,3 GB de repositorio; la configuracion original requiere 64 GiB libres para escribir checkpoints durante el entrenamiento.
- Sistema de archivos: debe soportar hard links.
- Opciones de despliegue: no aplica como modelo de inferencia; el flujo documentado es `train_lora.py` con `--resume` sobre el checkpoint extraido.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de artefacto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llama2-7b-metamath-seed42-pre-spike | 7B + LoRA r128 | no disponible | Checkpoint de entrenamiento | llama2 | Hugging Face (0 descargas) |
| meta-llama/Llama-2-7b-hf | 7B | 4096 tokens | Modelo base | llama2 | Hugging Face |
| meta-llama/Llama-2-7b-chat-hf | 7B | 4096 tokens | Modelo ajustado para chat | llama2 | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- No es un modelo para inferencia: es un checkpoint de entrenamiento con estados de optimizador; su uso previsto es reanudar y depurar.
- El evento que documenta es un fallo (pico de perdida de 0,243486 a 7,455190), no un resultado de calidad.
- No hay benchmarks ni evaluaciones de capacidades publicadas.
- Idiomas soportados no disponibles.
- La licencia Llama 2 Community License impone restricciones de uso comercial y la Acceptable Use Policy de Meta; debe revisarse antes de cualquier uso derivado.
- La reanudacion exige versiones concretas de software (torch 2.3.0, transformers 4.40.2, peft 0.10.0, accelerate 0.30.1, flash-attn 2.5.8) y un sistema de archivos con hard links; desviarse puede invalidar la reproducibilidad.
- Riesgo de alucinacion y sesgos: los del modelo base Llama-2-7B, no evaluados en este checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/YJRyjrYJR/llama2-7b-metamath-seed42-pre-spike
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Revision del base: https://huggingface.co/meta-llama/Llama-2-7b-hf/tree/01c7f73d771dfac7d292323805ebc428287df4f9
- Dataset MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
- Revision del dataset: https://huggingface.co/datasets/meta-math/MetaMathQA/tree/aa4f34d3d2d3231299b5b03d9b3e5a20da45aa18
