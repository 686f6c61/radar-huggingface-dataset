# zhezi12138/Qwen3-1.7B-ifeval-single-per-layer-top50-rolloutseed42-20261109-195t9jvd

## Resumen

Qwen3-1.7B-ifeval-single-per-layer-top50-rolloutseed42 es un checkpoint experimental derivado de Qwen/Qwen3-1.7B, publicado por el usuario zhezi12138 en Hugging Face. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste fino mediante aprendizaje por refuerzo (RL) sobre el modelo base de Alibaba, orientado especificamente a mejorar el cumplimiento de instrucciones (instruction following, IF). El entrenamiento se realizo con GRPO y un esquema de entrenamiento disperso (sparse training) en el que solo se actualizan parcialmente las capas de atencion.

El interés de este checkpoint es metodologico: documenta un experimento controlado de RL con actualizacion selectiva de parametros. Segun la model card, en cada una de las 28 capas se entrenan unicamente los 4 de 8 grupos GQA con mayor importancia de gradiente para la tarea IF, incluyendo las columnas correspondientes de la proyeccion de salida. MLP, embeddings, normas, LM head y los bloques de atencion no seleccionados permanecen congelados. Se completaron 600 actualizaciones de RL partiendo del modelo base original.

El resultado reportado por el autor es una mejora en la evaluacion IF sobre los mismos 1000 prompts de entrenamiento: del 43,3 % antes del entrenamiento al 55,7 % tras 600 actualizaciones. Se trata, por tanto, de un artefacto de investigacion con trazabilidad completa (hashes, curvas de evaluacion, auditoria de completions) mas que de un modelo listo para produccion. El repositorio ocupa 10,3 GB e incluye checkpoints distribuidos en formato Megatron.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion GQA (heredada de Qwen3-1.7B) |
| Parametros totales | 1,7 mil millones (modelo base Qwen3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el repo contiene checkpoints Megatron distribuidos, no pesos cuantizados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints distribuidos Megatron (`.distcp`, 8 shards por iteracion); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only con atencion de consultas agrupadas (GQA) organizada en 8 grupos por capa y 28 capas. Sobre esa base, el autor aplica un esquema de RL con GRPO en el que la actualizacion de pesos es deliberadamente dispersa: en cada capa se seleccionan los 4 grupos GQA con mayor importancia de gradiente para la tarea de instruction following, junto con las columnas correspondientes de la proyeccion de salida. El resto de componentes (MLP, embeddings, normas, LM head y los bloques de atencion no seleccionados) permanece congelado durante todo el entrenamiento. Los gradientes congelados se ponen a cero antes del clipping.

El entrenamiento comprende 600 actualizaciones de RL con tasa de aprendizaje constante de 3e-6, semilla de rollout 42, 16 prompts por paso con 4 muestras cada uno (batch global de 64), limite de respuesta de 3072 tokens, tensor parallel de 2 y modo chat sin thinking. La evaluacion durante el entrenamiento reutiliza los mismos 1000 prompts IF fijos y el scorer original `rlvr_ifeval`, con una muestra por prompt, top_k 1, temperatura 1.0 y limite de respuesta de 4096 tokens, evaluando antes del entrenamiento y cada 10 actualizaciones. Se conservan checkpoints en las iteraciones 199, 399 y 599; el tracker selecciona la 599 como final. No se guardo el estado del optimizador. La revision base es `70d244cc86ccca08cf5af4e1e306ecf908b1ad5e`.

## Capacidades

- Generacion de texto y conversacion multi-turno en modo chat sin thinking, heredadas del modelo base Qwen3-1.7B.
- Cumplimiento de instrucciones (instruction following): capacidad objetivo del ajuste, con mejora medida sobre el conjunto de prompts IF del entrenamiento.
- Razonamiento basico y respuesta a preguntas, en la medida en que lo permite un modelo de 1,7 mil millones de parametros.
- Capacidades multilingues: no documentadas en la informacion proporcionada.
- Tool calling / function calling: no documentado especificamente para este checkpoint.
- Soporte de agentes y razonamiento multi-paso: no documentado; el checkpoint se entreno en modo no-thinking.
- Modo thinking: no disponible en este ajuste (el entrenamiento uso chat sin thinking).

## Casos de uso

- Investigacion en RL para instruction following: el checkpoint sirve como referencia reproducible de un experimento GRPO con actualizacion dispersa de parametros, con curvas, hashes y auditoria incluidos en el repositorio.
- Estudio de eficiencia de entrenamiento: permite analizar si actualizar solo el 50 % de los grupos GQA por capa basta para mejorar el cumplimiento de instrucciones, comparando con el modelo base sobre los mismos 1000 prompts.
- Reproduccion de experimentos: el autor incluye el comando exacto, la mascara de seleccion y las huellas de datos y ranking, lo que facilita replicar el pipeline en un entorno miles/Megatron Bridge.
- Prototipado de asistentes conversacionales ligeros: con 1,7 mil millones de parametros, el modelo base es apto para despliegues con recursos limitados, aunque este checkpoint requiere conversion desde Megatron antes de usarse.
- Evaluacion comparativa de tecnicas de RL: util como linea base para contrastar GRPO completo frente a entrenamiento disperso en tareas de IF.
- Docencia y formacion tecnica: ejemplo documentado de entrenamiento RL a escala pequena con trazabilidad completa de artefactos.

## Benchmarks y rendimiento

| Evaluacion | Antes del entrenamiento | Tras 600 actualizaciones |
|---|---|---|
| IF eval sobre 1000 prompts de entrenamiento (`rlvr_ifeval`) | 43,3 % | 55,7 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores corresponden a la evaluacion sobre los mismos prompts de entrenamiento, no a un conjunto de test reservado; el autor indica que la evaluacion held-out es separate y no se reporta en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 1,7 mil millones de parametros en FP16 requiere aproximadamente 3,4 GB solo para pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: no disponibles. El entrenamiento uso tensor parallel de 2, lo que sugiere al menos 2 GPU para el pipeline original.
- Compatibilidad con GPU de consumo: no confirmada para este checkpoint; los pesos estan en formato Megatron distribuido y requieren conversion previa.
- Opciones de despliegue: el autor indica cargar con el entorno miles/Megatron Bridge y la configuracion base de Qwen3-1.7B. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-ifeval-single-per-layer-top50 (este) | 1,7 B | no disponible | RL disperso sobre Qwen3-1.7B | Apache 2.0 | Checkpoint Megatron, 0 descargas |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en la informacion | Modelo base de Alibaba | Apache 2.0 | Pesos estandar en Hugging Face |
| Otros ajustes RL de Qwen3-1.7B | 1,7 B | no disponible | Variantes de RL/GRPO | variable | no disponible |

No se dispone de datos de benchmarks comparativos con modelos alternativos en la informacion proporcionada.

## Limitaciones y advertencias

- La mejora del 55,7 % corresponde a la evaluacion sobre los mismos prompts de entrenamiento; no hay resultados de test held-out en la model card, por lo que el riesgo de sobreajuste a esos 1000 prompts no puede descartarse.
- El checkpoint no incluye estado del optimizador, lo que limita reanudar el entrenamiento desde la iteracion 599.
- Los pesos estan en formato Megatron distribuido (`.distcp`), no en safetensors ni GGUF; usarlo requiere conversion y un entorno miles/Megatron Bridge.
- El modelo se entreno en modo chat sin thinking, por lo que no se beneficia del modo de razonamiento extendido de otras variantes de Qwen3.
- Sesgos conocidos: no documentados especificamente para este checkpoint; hereda los del modelo base Qwen3-1.7B.
- Riesgo de alucinacion: no evaluado en la informacion disponible; es esperable en un modelo de 1,7 mil millones de parametros.
- Idiomas soportados: no documentados.
- Licencia Apache 2.0 permite uso comercial, pero el caracter experimental del checkpoint y la ausencia de evaluacion held-out desaconsejan su uso en produccion sin validacion adicional.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de uso o validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/zhezi12138/Qwen3-1.7B-ifeval-single-per-layer-top50-rolloutseed42-20261109-195t9jvd
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- W&B del entrenamiento: https://wandb.ai/ruizshi-uw/miles-lora-sparse/runs/195t9jvd
