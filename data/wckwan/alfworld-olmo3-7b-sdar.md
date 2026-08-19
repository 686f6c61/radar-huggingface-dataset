# wckwan/ALFWorld-OLMo3-7B-SDAR

## Resumen

ALFWorld-OLMo3-7B-SDAR es un modelo de lenguaje de 7.3 mil millones de parámetros desarrollado por el investigador wckwan, que parte del modelo base allenai/Olmo-3-7B-Instruct y lo afina mediante aprendizaje por refuerzo con el algoritmo GRPO (Group Relative Policy Optimization) sobre el entorno ALFWorld, un benchmark de tareas domésticas embebidas en texto. El objetivo es entrenar una política de agente capaz de razonar y ejecutar secuencias de acciones en escenarios simulados de hogar (como recoger objetos, limpiar o calentar alimentos) a partir de descripciones textuales y observaciones del entorno.

La relevancia de este modelo radica en que demuestra una aplicación práctica de RL sobre un modelo abierto de última generación (OLMo-3) para mejorar el rendimiento en tareas de agente, utilizando recompensas de resultado SDAR (outcome rewards) que evalúan si la secuencia completa de acciones logra el objetivo final. El repositorio contiene el checkpoint final en el paso 400 de entrenamiento, así como checkpoints intermedios. Al estar licenciado bajo Apache-2.0, puede utilizarse tanto en investigación como en entornos comerciales, aunque su especialización en ALFWorld limita su aplicabilidad fuera de este dominio.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo-3) |
| Parametros totales | 7.298.011.136 (7.3B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente inglés, no especificado) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en OLMo-3-7B-Instruct, un transformer decoder-only de 7B parámetros desarrollado por el Allen Institute for AI (Ai2). OLMo-3 incorpora mejoras sobre versiones anteriores en razonamiento de contexto largo, function calling, generación de código y seguimiento de instrucciones. El fine-tuning se realizó mediante GRPO, un algoritmo de optimización de políticas que compara grupos de respuestas generadas por el modelo para calcular ventajas relativas, evitando la necesidad de un crítico separado.

El entrenamiento se llevó a cabo sobre el entorno ALFWorld, que simula tareas domésticas en un mundo textual. La recompensa SDAR (outcome reward) se asigna en función de si el agente completa correctamente la tarea al final de la secuencia de acciones, en lugar de recompensas intermedias por pasos individuales. Esto fomenta el razonamiento multi-paso y la planificación. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas adicionales como RLHF o DPO; la información disponible solo menciona el uso de GRPO con recompensas de resultado.

## Capacidades

- Generación de texto y razonamiento multi-paso orientado a la resolución de tareas de agente en entornos textuales.
- Ejecución de acciones en ALFWorld: navegar entre habitaciones, recoger y colocar objetos, usar electrodomésticos, etc.
- Planificación secuencial: el modelo debe decidir una secuencia coherente de acciones que conduzcan al objetivo final.
- Hereda las capacidades base de OLMo-3-7B-Instruct, incluyendo conversación multi-turno y soporte de tool calling, aunque no se ha verificado si estas capacidades se mantienen tras el fine-tuning con RL.
- No se han documentado capacidades específicas de visión, audio o thinking mode explícito.

## Casos de uso

- Investigación en aprendizaje por refuerzo para agentes: el modelo sirve como punto de partida para estudiar cómo el RL con recompensas de resultado mejora la planificación en entornos textuales. Los investigadores pueden comparar su rendimiento con políticas entrenadas con otros algoritmos o recompensas.
- Evaluación de políticas en benchmarks de tareas domésticas: ALFWorld es un estándar en la comunidad de agentes; este modelo permite reproducir y analizar el efecto de GRPO con SDAR sobre un modelo base moderno.
- Desarrollo de agentes conversacionales para asistencia doméstica simulada: aunque el entorno es textual, las habilidades de razonamiento aprendidas podrían transferirse a asistentes que interactúan con interfaces de texto.
- Fine-tuning adicional: al estar disponible el checkpoint final y los intermedios, se puede continuar el entrenamiento con otros objetivos o dominios, aprovechando la base ya entrenada.
- Benchmarking de hardware y software de inferencia: al ser un modelo de 7B con licencia abierta, puede utilizarse para probar frameworks de despliegue (vLLM, llama.cpp) en tareas de agente.
- Educación y divulgación: sirve como ejemplo didáctico de cómo aplicar RL a modelos de lenguaje abiertos, dado que el código y los pesos están disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o tasas de éxito en ALFWorld. Se desconoce si el modelo supera a su base o a otros sistemas en tareas estándar de agente. Cualquier afirmación sobre rendimiento sería especulativa.

## Requisitos de hardware

- Inferencia en FP16: aproximadamente 14.6 GB de VRAM para los pesos del modelo (7.3B × 2 bytes), más memoria para activaciones y KV cache. Se recomienda una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB).
- Inferencia cuantizada: si se aplicara cuantización (no incluida en el repositorio), un modelo de 4 bits ocuparía unos 4 GB, permitiendo ejecución en GPUs de 8 GB como RTX 3070 o RTX 4060 Ti.
- Entrenamiento o fine-tuning adicional: requiere más de 24 GB de VRAM, típicamente una A100 o H100, dependiendo del batch size y la longitud de secuencia.
- Opciones de despliegue: al ser compatible con transformers, puede servirse con vLLM, TGI, o convertirse a GGUF para llama.cpp/Ollama. No se han proporcionado configuraciones específicas ni medidas de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| wckwan/ALFWorld-OLMo3-7B-SDAR | 7.3B | no disponible | Apache-2.0 | Agente en ALFWorld (GRPO + SDAR) |
| wckwan/ALFWorld-OLMo-3-7B-Outcome-GRPO | 7.3B | no disponible | Apache-2.0 | Agente en ALFWorld (GRPO, variante de recompensa) |
| allenai/Olmo-3-7B-Instruct | 7.3B | no disponible (probablemente 8K o más) | Apache-2.0 | Modelo base instruct general |

El modelo se distingue de su base por el entrenamiento específico en ALFWorld. La variante Outcome-GRPO es un checkpoint hermano del mismo autor, probablemente con una configuración de recompensa distinta. No se dispone de datos comparativos de rendimiento entre ellos.

## Limitaciones y advertencias

- Especialización excesiva: el modelo está entrenado únicamente en tareas de ALFWorld; fuera de ese dominio, su rendimiento puede degradarse significativamente respecto al modelo base.
- Sin información sobre sesgos: no se han documentado evaluaciones de sesgos o toxicidad. Al derivar de OLMo-3, puede heredar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación: en conversaciones generales o tareas fuera de su dominio, puede generar respuestas plausibles pero incorrectas.
- Longitud de contexto desconocida: no se especifica el contexto máximo soportado tras el fine-tuning, lo que dificulta su uso en tareas que requieran historiales largos.
- Tamaño del repositorio: 160.6 GB, lo que incluye múltiples checkpoints; la descarga puede ser pesada para entornos con ancho de banda limitado.
- Licencia Apache-2.0 permite uso comercial, pero el modelo no está diseñado para producción general; debe evaluarse cuidadosamente antes de integrarlo en sistemas reales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wckwan/ALFWorld-OLMo3-7B-SDAR
- Checkpoint hermano (Outcome-GRPO): https://huggingface.co/wckwan/ALFWorld-OLMo-3-7B-Outcome-GRPO
- Modelo base OLMo-3-7B-Instruct: https://huggingface.co/allenai/Olmo-3-7B-Instruct
- Paper de OLMo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Página oficial de OLMo en Ai2: https://allenai.org/olmo
