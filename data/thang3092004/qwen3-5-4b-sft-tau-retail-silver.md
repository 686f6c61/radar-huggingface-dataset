# thang3092004/qwen3.5-4b-sft-tau-retail-silver

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) desarrollado por el usuario thang3092004, que fine-tunea el modelo base `unsloth/Qwen3.5-4B` (una versión optimizada de Qwen3.5-4B) sobre un conjunto de datos de conversaciones de tool-calling en el dominio retail, específicamente del benchmark tau-bench. El adaptador se publica como la primera etapa de un pipeline SFT → GRPO, siguiendo la metodología del paper SkillFactory (arXiv:2512.04072). Según el autor, esta etapa SFT sirve como calentamiento para un posterior entrenamiento con aprendizaje por refuerzo (GRPO), y no se espera que por sí sola mejore el rendimiento en la tarea.

El modelo está diseñado para tareas de generación de texto con soporte de tool-calling, orientado a agentes conversacionales en entornos de comercio minorista. El adaptador tiene un tamaño de repositorio de 0.1 GB y se distribuye en formato safetensors, con soporte para carga mediante PEFT (Parameter-Efficient Fine-Tuning). Es relevante para investigadores que trabajan en pipelines de entrenamiento de agentes con tool-calling, aunque su rendimiento medido en tau-bench es inferior al del modelo base sin entrenar, lo que subraya su carácter de checkpoint intermedio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.5-4B (modelo base transformer, posiblemente con visión, aunque el adaptador es de texto) |
| Parametros totales | No disponible (el adaptador LoRA tiene r=16, alpha=16; los parámetros del modelo base no se especifican) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 10240 (según ejemplo de carga en la model card; el modelo base podría soportar más, no especificado) |
| Tipos de cuantizacion | 4-bit (usado en entrenamiento y en el ejemplo de carga) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `unsloth/Qwen3.5-4B`, que es una versión optimizada de Qwen3.5-4B, un modelo de lenguaje de 4 mil millones de parámetros desarrollado por Alibaba (Qwen). Aunque Qwen3.5-4B es un modelo nativo de visión-lenguaje según la búsqueda web, el adaptador se enfoca en tareas de texto y tool-calling, sin indicación de uso de capacidades multimodales. El entrenamiento utiliza LoRA con r=16, alpha=16 y dropout=0.0, en precisión 4-bit, sobre un conjunto de datos de 1060 conversaciones de tau-bench retail, que incluyen trayectorias reales (gold trajectories) y trayectorias "silver" auto-corregidas basadas en una taxonomía de errores de 12 categorías. Se planearon 10 épocas, y este checkpoint corresponde a la época 9 (checkpoint-603), seleccionado tras un plateau en la pérdida. El autor indica explícitamente que esta etapa SFT es un warm-start para una posterior etapa de RL (GRPO), siguiendo los hallazgos del paper SkillFactory.

## Capacidades

- Generación de texto conversacional con soporte de tool-calling (llamada a funciones), específicamente para entornos de comercio retail.
- Manejo de conversaciones multi-turno con contexto de hasta 10240 tokens (según el ejemplo de carga).
- Capacidad de ser cargado como adaptador PEFT sobre el modelo base, permitiendo integración con frameworks como vLLM (con soporte LoRA) o Unsloth.
- No se han documentado capacidades adicionales como razonamiento avanzado, generación de código o visión, aunque el modelo base podría tenerlas, el adaptador no las explota.
- El modelo está diseñado para ser utilizado en pipelines de agentes, con soporte para parseo de tool calls en formato qwen3_xml (según el ejemplo de vLLM).

## Casos de uso

- Investigación en entrenamiento de agentes: el modelo sirve como punto de partida para experimentos con GRPO y otros métodos de RL, permitiendo estudiar el efecto del warm-start SFT en el rendimiento final.
- Evaluación de pipelines SFT → RL: investigadores pueden replicar o comparar los resultados del autor (reward promedio de 0.4725 en tau-bench retail) y analizar la degradación respecto al baseline.
- Desarrollo de adaptadores LoRA para tool-calling: el adaptador demuestra un flujo de entrenamiento reproducible con LoRA y 4-bit, útil para quienes buscan ejemplos de fine-tuning eficiente en tareas de agentes.
- Prototipado de asistentes de atención al cliente: aunque el rendimiento es bajo, el modelo puede usarse para pruebas de concepto en entornos controlados, siempre que se combine con una etapa de RL posterior.
- Benchmarking de modelos base: al comparar el adaptador con el modelo base sin entrenar, se puede evaluar la calidad del dataset de entrenamiento y la efectividad de la estrategia SFT.
- Integración en pipelines de evaluación asíncrona con vLLM: el ejemplo de despliegue con vLLM y LoRA permite probar el adaptador en entornos de servidor, útil para desarrolladores que necesitan servir modelos con adaptadores.

## Benchmarks y rendimiento

El autor proporciona un único resultado medido en el test split real de tau-bench retail (115 tareas × 3 semillas, temperatura 0.5) mediante un harness de evaluación asíncrono con vLLM:

| Modelo | Reward promedio |
|---|---|
| Qwen3.5-4B (baseline sin entrenar) | 0.687 |
| Qwen3.5-4B + adaptador SFT (este modelo) | 0.4725 |

No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor indica que este resultado es consistente con la expectativa de que SFT sobre datos de silver traces no mejora por sí solo el éxito de la tarea, y que la evaluación real corresponde a la etapa GRPO posterior.

## Requisitos de hardware

- El adaptador LoRA es pequeño (0.1 GB), pero requiere cargar el modelo base Qwen3.5-4B, que necesita aproximadamente 8 GB de VRAM en cuantización 4-bit (según el ejemplo de carga con `load_in_4bit=True`).
- GPU recomendadas: cualquier GPU con al menos 8-10 GB de VRAM, como NVIDIA RTX 3060 (12 GB), RTX 4070, o GPUs de datacenter como A10G, L4 o A100 (para mayor contexto y velocidad).
- En cuantización 4-bit, cabe en GPUs de consumo medio; en precisión completa (fp16) requeriría unos 8-9 GB adicionales, por lo que se recomienda usar cuantización para entornos con VRAM limitada.
- Opciones de despliegue: vLLM (con soporte LoRA, como se muestra en el ejemplo), Unsloth (para carga rápida), y potencialmente Hugging Face Transformers con PEFT.
- Latencia y throughput: no se han publicado datos específicos; dependen del hardware y del número de tokens generados. En una GPU moderna, un modelo de 4B en 4-bit puede generar decenas de tokens por segundo, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Tamaño | Contexto | Licencia | Rendimiento en tau-bench retail | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4B | No especificado (probablemente largo, según búsqueda web) | Apache 2.0 (típico de Qwen) | 0.687 (reward promedio) | Hugging Face |
| Este adaptador LoRA | 4B + LoRA r=16 | 10240 (ejemplo) | No disponible | 0.4725 | Hugging Face |
| Qwen3.5-397B-A17B | 397B (MoE, 17B activos) | Muy largo | Apache 2.0 (según búsqueda web) | No comparable (modelo mucho mayor) | Hugging Face |

No se dispone de comparaciones con otros adaptadores similares para tau-bench. El modelo base Qwen3.5-4B es claramente superior en esta tarea, lo que refuerza la naturaleza experimental del adaptador.

## Limitaciones y advertencias

- Rendimiento inferior al modelo base: el adaptador reduce el reward promedio en tau-bench retail (0.4725 vs 0.687), por lo que no debe usarse en producción sin una etapa de RL posterior.
- Es un checkpoint intermedio: el autor lo presenta como warm-start para GRPO, no como un modelo final; su uso fuera de este contexto carece de justificación.
- Datos de entrenamiento limitados: solo 1060 conversaciones, lo que puede introducir sesgos específicos del dominio retail y de la taxonomía de errores utilizada.
- Licencia no especificada: no se indica la licencia del adaptador ni del dataset asociado; esto puede limitar su uso comercial sin consultar al autor.
- Idiomas no documentados: no se sabe qué idiomas soporta; probablemente inglés (dado el dataset tau-bench), pero no hay confirmación.
- Riesgo de alucinación y errores en tool-calling: al ser un modelo pequeño y con entrenamiento limitado, puede fallar en la generación de llamadas a funciones correctas, especialmente en contextos largos.
- No se han evaluado sesgos ni seguridad: no hay información sobre evaluación de sesgos, toxicidad o alineación; se recomienda precaución en despliegues públicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thang3092004/qwen3.5-4b-sft-tau-retail-silver
- Dataset de entrenamiento: https://huggingface.co/datasets/thang3092004/skillfactory-taubench-simulated-data
- Modelo base (unsloth): https://huggingface.co/unsloth/Qwen3.5-4B
- Modelo base original (Qwen): https://huggingface.co/Qwen/Qwen3.5-4B
- Blog de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Repositorio GitHub de Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Paper SkillFactory (arXiv:2512.04072): https://arxiv.org/abs/2512.04072
