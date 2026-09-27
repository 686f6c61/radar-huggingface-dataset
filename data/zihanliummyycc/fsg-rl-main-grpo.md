# ZihanLiummyycc/FSG-RL-Main-GRPO

## Resumen

FSG-RL-Main-GRPO es un adaptador LoRA (PEFT) publicado por el usuario ZihanLiummyycc sobre el modelo base Qwen/Qwen3.5-9B-Base. No es un modelo de pesos completos: el repositorio contiene únicamente los pesos del adaptador (0,4 GB en safetensors) y requiere cargar por separado el modelo base. Su finalidad es el razonamiento matemático guiado por verificación ejecutable, dentro de una línea de trabajo denominada FSG-RL que el autor documenta en un repositorio de GitHub propio.

El adaptador se obtiene continuando una política SFT ejecutable mediante Graph-conditioned Group Relative Policy Optimization (GRPO) sobre 866 problemas de entrenamiento: 708 procedentes de las fuentes "Medium" y 158 de Omni-MATH. El entrenamiento emplea recompensas guiadas por verificador y, según la model card, no utiliza retroalimentación de profesor en los prompts de rollout. La configuración histórica registra `beta_kl=0.03`. Es un adaptador guardado de forma autónoma, por lo que no necesita apilarse con un adaptador de la etapa 2 para inferencia.

La relevancia del checkpoint es acotada y muy específica: se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada ni idiomas especificados, y con resultados reportados únicamente sobre un conjunto de evaluación propio de 400 ítems. No se ha publicado información sobre arquitectura interna del modelo base, longitud de contexto ni composición detallada del dataset.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; hereda la del modelo base Qwen/Qwen3.5-9B-Base. El adaptador es de tipo LoRA (PEFT) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se denomina Qwen3.5-9B-Base, lo que sugiere del orden de 9 000 millones de parámetros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors sin cuantizar; la cuantización aplicable dependería del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA, librería PEFT) |
| Tamano del repositorio | 0,4 GB |
| Modelo base | Qwen/Qwen3.5-9B-Base |
| Metodo de alineamiento | GRPO graph-conditioned con recompensas guiadas por verificador; `beta_kl=0.03` |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |

## Arquitectura y entrenamiento

La información disponible describe el proceso de entrenamiento, no la arquitectura interna del modelo. El adaptador se construye sobre Qwen/Qwen3.5-9B-Base mediante LoRA y continúa una política SFT ejecutable previa. La etapa principal aplica Group Relative Policy Optimization condicionada por grafo (graph-conditioned GRPO) sobre 866 problemas: 708 de fuentes "Medium" y 158 de Omni-MATH. Las recompensas están guiadas por verificador y, según la model card, los prompts de rollout no incluyen retroalimentación de profesor. La configuración histórica registra `beta_kl=0.03`, coeficiente de penalización KL respecto a la política de referencia.

Como innovación destacable, el autor sitúa el foco en la naturaleza "ejecutable" de la política SFT y en el condicionamiento por grafo dentro de GRPO, además de la verificación automática de recompensas. El repositorio se presenta como un adaptador autónomo: no requiere apilar un adaptador de etapa 2 para inferencia. No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición completa del dataset, ni detalles sobre decodificación especulativa, atención lineal u otras optimizaciones.

## Capacidades

- Razonamiento matemático: el adaptador está especializado en resolución de problemas matemáticos, según la etiqueta `mathematical-reasoning` y el conjunto de entrenamiento empleado (Omni-MATH y fuentes "Medium").
- Razonamiento con verificación ejecutable: la política SFT de partida es ejecutable y el entrenamiento usa recompensas guiadas por verificador, lo que orienta el modelo hacia respuestas comprobables.
- Condicionamiento por grafo: el entrenamiento GRPO es graph-conditioned, de modo que el modelo está diseñado para operar con este tipo de estructura de entrada.
- Modo de pensamiento: no disponible. La evaluación local reportada se realizó con "thinking disabled", pero no se documenta una capacidad de modo pensamiento explícita.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, etc.): no disponible.

## Casos de uso

- Investigación en aprendizaje por refuerzo para matemáticas: el adaptador sirve como punto de partida reproducible para estudiar GRPO condicionado por grafo con recompensas de verificador, comparando contra la política SFT previa sobre los mismos 866 problemas.
- Evaluación de pipelines de verificación ejecutable: al estar ligado a una política SFT ejecutable, puede integrarse en entornos donde la respuesta se comprueba ejecutando código o comparando con un verificador, y medir la tasa de éxito estricto.
- Reproducción de resultados sobre el conjunto propio de 400 ítems: el autor publica la configuración de evaluación (decodificación greedy, thinking desactivado, límite de 2048 tokens nuevos), lo que permite replicar las cifras de 67,50 % de precisión de respuesta final y 52,25 % de éxito completo estricto.
- Fine-tuning incremental sobre dominios matemáticos concretos: al ser un adaptador LoRA de 0,4 GB, es viable seguir entrenándolo o combinarlo con otros adaptadores sobre el mismo modelo base sin duplicar el coste de almacenamiento de pesos completos.
- Estudio de estabilidad y divergencia KL: el valor `beta_kl=0.03` documentado permite analizar el efecto de la penalización KL en la deriva respecto a la política de referencia en tareas de razonamiento.
- Base para comparativas de técnicas de RL: puede emplearse como referencia en experimentos que comparen GRPO con otras variantes (PPO, DPO) manteniendo fijo el modelo base y el conjunto de problemas.
- Despliegue en entornos con recursos limitados: dado el tamaño reducido del adaptador, se puede servir sobre una instancia única del modelo base y alternar entre adaptadores según la tarea, siempre que se disponga de VRAM suficiente para el base.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a un conjunto de evaluación propio del autor, no a benchmarks oficiales de los datasets de origen. La model card advierte explícitamente que no son puntuaciones oficiales de los datasets fuente y que la exportación pública del dataset excluye campos privados de puntuación.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Conjunto propio graph-conditioned (400 items) | Precision de respuesta final | 67,50 % |
| Conjunto propio graph-conditioned (400 items) | Exito completo estricto (strict full success) | 52,25 % |

Condiciones de evaluación declaradas: decodificación greedy, thinking desactivado y límite de 2048 tokens nuevos. No se han publicado resultados de MMLU, GSM8K, HumanEval, MATH ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- Tamaño del adaptador: 0,4 GB en safetensors. Este es el único peso incluido en el repositorio.
- VRAM adicional por el modelo base: el adaptador no incluye los pesos base. Para Qwen3.5-9B-Base, una estimación aritmética habitual para ~9 000 millones de parámetros sitúa los pesos en bf16/fp16 en torno a 18 GB, más caché KV y activaciones según la longitud de contexto.
- Cuantización de 4 bits del modelo base: estimación aproximada de 5 a 7 GB de pesos, más overhead de contexto.
- GPU consumer: una RTX 4090 o RTX 3090 de 24 GB permitiría, en principio, cargar el modelo base en bf16/fp16 con contexto moderado, o en 4 bits con mayor margen de contexto. Para GPUs de 8-12 GB sería necesario recurrir a cuantización agresiva del base.
- GPU de datacenter: A100 40/80 GB, H100 y L40S son adecuadas para servir el modelo base en precisión completa, con margen amplio para lotes y contextos largos.
- Opciones de despliegue: al ser un adaptador PEFT, el camino directo es `transformers` + `peft` sobre el modelo base. vLLM soporta adaptadores LoRA y permitiría servir varias variantes sobre una misma instancia. llama.cpp y Ollama requerirían fusionar el adaptador en el base y convertir a GGUF, paso no documentado en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible. A modo de referencia estructural:

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| FSG-RL-Main-GRPO | Adaptador LoRA sobre ~9B (modelo base) | no disponible | no disponible | safetensors (LoRA) | 67,50 % / 52,25 % en conjunto propio de 400 ítems |
| Qwen/Qwen3.5-9B-Base | ~9B (según denominación) | no disponible | no disponible | no disponible | no disponible |
| Otras alternativas de razonamiento matemático | no disponible | no disponible | no disponible | no disponible | no disponible |

No se identifican en la información disponible modelos comparables de la misma categoría (adaptadores LoRA de razonamiento matemático con RL verificable) con cifras publicadas que permitan una comparación directa.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere descargar y cargar Qwen/Qwen3.5-9B-Base por separado. El repositorio solo contiene el adaptador.
- Licencia no declarada: la ausencia de licencia explícita impide determinar si se permite el uso comercial. Se debe contactar con el autor antes de cualquier uso en producción.
- Idiomas no declarados: no hay información sobre cobertura multilingüe ni sobre el comportamiento fuera del inglés o del chino.
- Riesgo de alucinación: no se documentan medidas de mitigación ni tasas de error fuera del conjunto de evaluación propio.
- Resultados no comparables con benchmarks estándar: las cifras de 67,50 % y 52,25 % proceden de un conjunto propio graph-conditioned de 400 ítems, no de GSM8K, MATH, Omni-MATH u otros benchmarks públicos, y el propio autor advierte que no son puntuaciones oficiales de los datasets fuente.
- Dependencia del formato de entrada: el condicionamiento por grafo implica que el rendimiento puede degradarse si la entrada no sigue la estructura prevista por el entrenamiento.
- Configuración de evaluación específica: las cifras reportadas se obtuvieron con decodificación greedy, thinking desactivado y un límite de 2048 tokens nuevos. Otras configuraciones pueden dar resultados distintos.
- Trazabilidad limitada: 0 descargas y 0 likes, sin pipeline ni licencia declarados, y sin publicación de la composición completa del dataset ni de los detalles de arquitectura del base.
- Fecha de creación atípica (2026-09-26): conviene verificar la vigencia y el estado del repositorio antes de integrarlo en cualquier flujo de trabajo.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ZihanLiummyycc/FSG-RL-Main-GRPO
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Repositorio de código y registro de evaluación congelado: https://github.com/ZihanLiummyycc/FSG-RL

Nota: las búsquedas web realizadas no han devuelto enlaces relevantes sobre este modelo ni sobre FSG-RL; los resultados obtenidos tratan sobre temas sin relación (hojas de cálculo, Maya, cine y foros generalistas) y se han descartado.
