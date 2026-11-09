# zhezi12138/Qwen3-1.7B-ifeval-single-per-layer-bottom50-rolloutseed42-20261109-fdmx65vi

## Resumen

Qwen3-1.7B-ifeval-single-per-layer-bottom50-rolloutseed42-20261109-fdmx65vi es un checkpoint experimental derivado de Qwen/Qwen3-1.7B, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base de Alibaba, orientado especificamente a la tarea de seguimiento de instrucciones (instruction following, IF). El entrenamiento se realizo con GRPO durante 600 actualizaciones y emplea una estrategia de entrenamiento disperso (sparse training) en la que solo se actualizan partes concretas de la red.

La particularidad tecnica del checkpoint es que, en cada una de las 28 capas del transformer, solo se entrenan los 4 grupos de atencion GQA con menor importancia de gradiente de un total de 8, incluyendo las columnas correspondientes de la proyeccion de salida. El resto de componentes (MLP, embeddings, normalizaciones, LM head y bloques de atencion no seleccionados) permanece congelado. Esto lo convierte en un artefacto de investigacion util para estudiar tecnicas de RL eficiente y entrenamiento selectivo, mas que en un modelo listo para produccion.

El modelo se distribuye en formato Megatron distribuido (`.distcp`) y requiere el entorno miles/Megatron Bridge para cargarse, lo que limita su uso directo con herramientas convencionales de inferencia. La relevancia actual reside en su valor como evidencia empirica de que el ajuste selectivo por capas puede mejorar el seguimiento de instrucciones con un coste computacional reducido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion GQA (heredada de Qwen3-1.7B) |
| Parametros totales | 1.7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen3 soporta contexto largo, pero este checkpoint no lo especifica) |
| Tipos de cuantizacion | no disponible (solo se distribuyen checkpoints Megatron `.distcp` en el repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Megatron distributed checkpoints (`.distcp`), 8 shards por iteracion |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only con atencion de consultas agrupadas (GQA) organizada en 8 grupos por capa a lo largo de 28 capas. Sobre esta base se aplica un esquema de RL con GRPO (Group Relative Policy Optimization) durante 600 actualizaciones, con un learning rate constante de 3e-6, semilla de rollout 42, 16 prompts por paso con 4 muestras cada uno (batch global de 64), limite de respuesta de 3072 tokens durante el rollout, tensor parallel de 2 y chat en modo no-thinking. Los gradientes congelados se ponen a cero antes del clipping.

La innovacion principal es el entrenamiento disperso por capas: en cada una de las 28 capas se entrena unicamente el subconjunto inferior (bottom 4 de 8) de grupos GQA segun el ranking de importancia de gradiente del ajuste IF original, incluyendo las columnas correspondientes de la proyeccion de salida. El resto de la red permanece congelado. El entrenamiento y la evaluacion in-training reutilizan los mismos 1000 prompts IF fijos y el scorer original `rlvr_ifeval`, con evaluacion antes del entrenamiento y cada 10 actualizaciones (una muestra por prompt, top_k=1, temperatura 1.0, limite de respuesta de 4096 tokens). Se publican checkpoints en las iteraciones 199, 399 y 599, siendo la 599 la seleccionada como final. No se guardo el estado del optimizador.

## Capacidades

- Generacion de texto y seguimiento de instrucciones: el objetivo declarado del ajuste es mejorar la adherencia a instrucciones complejas, evaluada con el scorer `rlvr_ifeval`.
- Razonamiento en modo no-thinking: el entrenamiento se realizo explicitamente con chat no-thinking.
- Capacidades heredadas del modelo base Qwen3-1.7B: generacion de texto, razonamiento, codigo y matematicas basicas, aunque el checkpoint no documenta evaluaciones especificas de estas tareas.
- Soporte multilingue: no disponible en la informacion proporcionada para este checkpoint.
- Tool calling / function calling: no documentado para este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades especiales (vision, audio, thinking mode): no documentadas; el entrenamiento excluye el modo thinking.

## Casos de uso

- Investigacion en RL eficiente: el checkpoint sirve para reproducir y analizar el efecto del entrenamiento selectivo por capas sobre el seguimiento de instrucciones, comparando las iteraciones 199, 399 y 599 publicadas.
- Estudio de importancia de gradientes: permite validar empiricamente si el ranking de importancia por grupos GQA se correlaciona con la mejora en IF tras el RL.
- Baseline para experimentos de sparse training: util como punto de comparacion frente a ajustes completos de Qwen3-1.7B con el mismo presupuesto de actualizaciones.
- Evaluacion de robustez de scorers IF: al reutilizar `rlvr_ifeval` con prompts fijos, permite analizar sesgos del scorer y la posible sobreoptimizacion.
- Reproduccion de pipelines Megatron/miles: sirve como ejemplo practico de configuracion de GRPO con tensor parallel 2 y checkpoints distribuidos.
- Analisis de degradacion o transferencia: permite estudiar si el ajuste selectivo preserva capacidades generales del modelo base o induce olvido catastrofico en las capas congeladas.

## Benchmarks y rendimiento

| Metrica | Antes del entrenamiento | Tras 600 actualizaciones |
|---|---|---|
| Evaluacion IF in-training (`rlvr_ifeval`, 1000 prompts fijos) | 43.3% | 54.1% |

Estos resultados corresponden a la evaluacion sobre los mismos prompts de entrenamiento, no a un conjunto de test reservado. El autor indica explicitamente que la evaluacion held-out es separada y no se proporcionan sus resultados en la informacion disponible. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo de 1.7B en precision completa (fp16/bf16) se estiman en torno a 3.4 GB solo de pesos, mas overhead de activaciones y KV cache, pero este checkpoint no documenta configuracion de inferencia.
- GPU recomendadas: no especificadas por el autor. El entrenamiento uso tensor parallel 2, lo que sugiere al menos 2 GPU para el pipeline original.
- Compatibilidad con GPU de consumo: probable en teoria por el tamano de 1.7B, pero el formato `.distcp` requiere conversion previa a safetensors u otro formato estandar antes de poder usarse con llama.cpp, Ollama o vLLM.
- Opciones de despliegue: el autor indica cargar con el entorno miles/Megatron Bridge y la configuracion base de Qwen3-1.7B. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (Qwen3-1.7B IF sparse RL) | 1.7B | no disponible | RL selectivo por capas sobre Qwen3-1.7B | Apache 2.0 | Megatron `.distcp` |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | Modelo base generalista | Apache 2.0 | Safetensors, ampliamente soportado |
| Qwen3-1.7B ajustado con IF completo | 1.7B | no disponible | RL completo sobre todos los parametros | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks comparativos entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- El checkpoint solo se distribuye en formato Megatron `.distcp`; no hay pesos en safetensors ni GGUF, lo que impide su uso directo con herramientas estandar de inferencia sin conversion manual.
- No se guardo el estado del optimizador, lo que dificulta reanudar el entrenamiento desde los checkpoints publicados.
- La mejora reportada (43.3% a 54.1%) se mide sobre los mismos prompts de entrenamiento, por lo que puede reflejar sobreajuste al conjunto de evaluacion; los resultados held-out no se publican.
- El entrenamiento se limita a modo no-thinking; el comportamiento en modo thinking no esta documentado.
- Al congelar MLP, embeddings, normalizaciones y LM head, el modelo puede presentar un equilibrio distinto entre capacidades generales e IF respecto al base; no se documenta evaluacion de capacidades generales.
- Riesgo de alucinacion y sesgos: no evaluado en la informacion disponible; se heredan los del modelo base Qwen3-1.7B.
- Idiomas soportados no documentados para este checkpoint.
- Uso comercial permitido por la licencia Apache 2.0, pero la falta de validacion held-out y de formatos estandar desaconseja su uso en produccion sin evaluacion adicional.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-1.7B-ifeval-single-per-layer-bottom50-rolloutseed42-20261109-fdmx65vi
- Modelo base Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Informe tecnico de Qwen3: https://arxiv.org/html/2505.09388v1
- Registro W&B del entrenamiento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/fdmx65vi
