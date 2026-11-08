# zhezi12138/Qwen3-4B-mbpp-to-ifeval-same-top50-rolloutseed42-20261108-zowzyoz8

## Resumen

Este repositorio contiene un checkpoint de entrenamiento por refuerzo continuado sobre el modelo base Qwen3-4B, desarrollado por el usuario zhezi12138. El modelo parte de un estado previo entrenado en tareas de programacion (MBPP) y se somete a 600 actualizaciones adicionales orientadas a instrucciones (IF, instruction following), manteniendo congelados todos los parametros salvo un subconjunto concreto de cabezas de atencion. Es, por tanto, un artefacto de investigacion sobre aprendizaje continuo y reutilizacion de subredes, no un modelo listo para produccion.

La innovacion principal es la reutilizacion de las mismas 50 cabezas de atencion (y sus bloques de proyeccion de salida correspondientes) que se entrenaron en la tarea origen de codigo. El resto de bloques permanece congelado durante la fase de instrucciones. Esto permite estudiar hasta que punto una subred dispersa aprendida en una tarea puede sostener el aprendizaje de otra tarea distinta sin reentrenar el modelo completo.

Se distribuye como checkpoint distribuido nativo de Megatron (ocho fragmentos `.distcp` por iteracion), no como modelo Transformers cargable con `from_pretrained`. El repositorio ocupa 24,1 GB e incluye las iteraciones 199, 399 y 599. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3), checkpoint distribuido Megatron |
| Parametros totales | 4B (heredados de Qwen/Qwen3-4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | Megatron `.distcp` (8 fragmentos por iteracion); no es safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura de Qwen3-4B, un transformer denso de 4.000 millones de parametros. Sobre esa base se aplica un esquema de aprendizaje continuo con entrenamiento por refuerzo (tags `reinforcement-learning` y `continual-learning`), ejecutado en el entorno miles/Megatron Bridge con paralelismo tensorial de 2. La tarea origen es generacion de codigo (MBPP) y la tarea destino es seguimiento de instrucciones (IF).

La peculiaridad tecnica es la mascara de cabezas: solo se entrenan las mismas 50 cabezas de atencion (aproximadamente el 50 % de los bloques de atencion) que se entrenaron en la tarea origen, junto con sus bloques de proyeccion de salida correspondientes; el resto de parametros permanece congelado. Los gradientes congelados se ponen a cero antes del recorte (clipping). Los hiperparametros documentados son: semilla 42, tasa de aprendizaje 3e-6, 16 prompts por 4 muestras, lote global de 64, limite de respuesta en el rollout de 3072 tokens y plantilla de chat sin modo thinking. Se incluyen las iteraciones 199, 399 y 599, seleccionandose la 599 tras 600 actualizaciones de IF. No se guardo el estado del optimizador, por lo que no es posible reanudar el entrenamiento de forma exacta.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, heredadas del entrenamiento IF sobre Qwen3-4B.
- Razonamiento y generacion de codigo, procedentes de la fase previa sobre MBPP.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking: la plantilla de chat empleada es no-thinking segun la model card.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en aprendizaje continuo: el checkpoint permite analizar si una subred de cabezas de atencion entrenada en codigo puede sostener el aprendizaje de instrucciones sin reentrenar el modelo completo.
- Estudio de reutilizacion de subredes dispersas: sirve para comparar la mascara top-50 de cabezas frente a otras estrategias de seleccion en experimentos de continual learning.
- Reproducibilidad de experimentos: las iteraciones 199, 399 y 599 permiten trazar la evolucion del entrenamiento y validar protocolos de evaluacion.
- Analisis de olvido catastrofico: al mantener congelado el resto del modelo, se puede medir cuanto se degrada la tarea origen (codigo) tras la fase de instrucciones.
- Base para experimentos de RL con verifier: la model card documenta el uso del verificador `math` en lugar de `dapo_math`, util para replicar protocolos de evaluacion.
- Referencia para pipelines miles/Megatron Bridge: el formato `.distcp` sirve como ejemplo de exportacion de checkpoints distribuidos en entornos Megatron.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un historial de evaluacion durante el entrenamiento, pero el propio autor advierte que esas puntuaciones no son resultados de benchmarks sobre conjuntos de validacion independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 24,1 GB en formato `.distcp`, lo que refleja pesos en precision alta junto con las tres iteraciones incluidas.
- GPU recomendadas: no disponible en la informacion proporcionada; el entrenamiento uso paralelismo tensorial de 2, lo que implica al menos dos GPUs.
- Compatibilidad con GPU de consumo: no disponible; al no ser un modelo Transformers estandar, no se puede cargar directamente en herramientas como Ollama o llama.cpp.
- Opciones de despliegue: requiere el entorno miles/Megatron Bridge con la configuracion base de Qwen3-4B para cargar el checkpoint; no es compatible con `from_pretrained` de Transformers.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zhezi12138/Qwen3-4B-mbpp-to-ifeval-same-top50 (este) | 4B | no disponible | Megatron `.distcp` | apache-2.0 | Checkpoint de investigacion, 0 descargas |
| Qwen/Qwen3-4B (base) | 4B | no disponible | safetensors | apache-2.0 | Modelo oficial listo para produccion |
| zhezi12138/Qwen3-4B-mbpp-to-ifeval-ifeval-rr50-rolloutseed42 | 4B | no disponible | no disponible | apache-2.0 | Variante del mismo autor con distinta mascara |
| zhezi12138/Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42 | 1,7B | no disponible | no disponible | apache-2.0 | Variante mas pequena del mismo autor |

## Limitaciones y advertencias

- No es un modelo Transformers: requiere el entorno miles/Megatron Bridge y la configuracion base de Qwen3-4B; no se carga con `from_pretrained`.
- No se guardo el estado del optimizador, por lo que no admite reanudacion exacta del entrenamiento.
- Las puntuaciones de evaluacion incluidas son del entrenamiento y no resultados de benchmarks sobre conjuntos independientes; no deben usarse como medida de rendimiento en produccion.
- Solo se entrena un subconjunto de cabezas de atencion; el resto de parametros permanece congelado, lo que puede limitar la adaptacion a la tarea de instrucciones.
- Riesgo de sesgos y alucinaciones: no documentado en la informacion disponible.
- Idiomas soportados: no disponible.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el formato de checkpoint y la ausencia de validacion externa desaconsejan su uso en produccion sin conversion y evaluacion previas.
- Repositorio con 0 descargas y 0 likes; sin validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-to-ifeval-same-top50-rolloutseed42-20261108-zowzyoz8
- Modelo origen (MBPP): https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-single-top50-rolloutseed42
- Variante IF con otra mascara: https://huggingface.co/zhezi12138/Qwen3-4B-mbpp-to-ifeval-ifeval-rr50-rolloutseed42
- Variante Math a MBPP: https://huggingface.co/zhezi12138/Qwen3-1.7B-math-to-mbpp-same-top50-rolloutseed42-20261107
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- W&B: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/zowzyoz8
