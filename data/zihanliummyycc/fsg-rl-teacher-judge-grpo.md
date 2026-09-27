# ZihanLiummyycc/FSG-RL-Teacher-Judge-GRPO

## Resumen

FSG-RL-Teacher-Judge-GRPO es un adaptador LoRA publicado por el usuario ZihanLiummyycc sobre el modelo base Qwen/Qwen3.5-9B-Base. Se trata de un checkpoint intermedio dentro de la línea de trabajo FSG-RL ("Function-structured reinforcement learning for mathematical reasoning"), orientada a mejorar el razonamiento matemático mediante aprendizaje por refuerzo. El adaptador se guarda de forma independiente: no requiere apilar adaptadores anteriores ni incluye los pesos del modelo base.

Su particularidad es el esquema de recompensa empleado en el entrenamiento. El adaptador continúa el checkpoint principal de FSG-RL sobre 60 problemas de entrenamiento difíciles; durante el entrenamiento, un profesor externo (`gpt-5.6-terra`) actúa como juez de cada grupo de rollouts y aporta una recompensa adicional, mientras que los rollouts del estudiante se generan sin intervención del profesor. En inferencia y evaluación el profesor no se utiliza en absoluto, por lo que el adaptador resultante es autónomo.

El autor reporta sobre un conjunto de evaluación propio de 400 ítems con condicionamiento por grafo una precisión de respuesta final del 68,25 % y un 52,75 % de éxito completo estricto, con decodificación greedy, modo de pensamiento desactivado y un límite de 2048 tokens nuevos. Se trata de un modelo muy especializado, con cero descargas y cero valoraciones en el momento de redactar esta ficha, pensado para investigación en RL aplicado a razonamiento matemático más que para uso generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (el modelo base se denomina Qwen3.5-9B-Base, lo que sugiere ~9.000 millones, sin confirmacion en la model card); el adaptador LoRA ocupa 0,4 GB en el repositorio |
| Parametros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el adaptador se distribuye en safetensors sin cuantizar y la cuantizacion aplicable depende del modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA/PEFT; no incluye los pesos del modelo base) |

## Arquitectura y entrenamiento

El artefacto publicado no es un modelo completo, sino un adaptador LoRA guardado de forma independiente para el modelo Qwen/Qwen3.5-9B-Base, con `library_name: peft`. La model card no detalla la arquitectura del modelo base (número de capas, atencion, tipo de normalizacion, ventana de contexto), por lo que cualquier afirmación al respecto sería especulativa. El tamaño del repositorio, 0,4 GB, es coherente con un conjunto de matrices de bajo rango y no con un modelo de 9B completo.

El entrenamiento se enmarca en FSG-RL y utiliza GRPO (Group Relative Policy Optimization) como algoritmo de optimización. Este checkpoint concreto continúa el checkpoint principal de FSG-RL y se entrena sobre 60 problemas difíciles. La innovación metodológica descrita es el uso de un juez profesor (`gpt-5.6-terra`) que evalúa cada grupo de rollouts y añade una recompensa extra durante el entrenamiento, manteniendo los rollouts del estudiante libres de profesor. Esta separación busca aprovechar señal de evaluación externa sin que el modelo dependa del profesor en el momento de la inferencia. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas adicionales de SFT, DPO o RLHF más allá del proceso de GRPO descrito.

## Capacidades

- Razonamiento matemático: es la capacidad central del adaptador, entrenado específicamente sobre problemas matemáticos difíciles.
- Resolución de problemas con condicionamiento por grafo: la evaluación reportada emplea un conjunto "custom graph-conditioned", lo que indica que el modelo se ha evaluado en problemas cuya estructura se representa mediante grafos.
- Generación de respuesta final y de solución completa: la evaluación distingue entre precisión de respuesta final (68,25 %) y éxito completo estricto (52,75 %), lo que sugiere que el modelo produce razonamiento paso a paso además del resultado.
- Modo de pensamiento desactivable: la evaluación local se realizó con "thinking disabled", lo que implica que el modelo base y el adaptador operan en un régimen sin cadena de pensamiento explícita cuando así se configura.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada, más allá del razonamiento matemático multi-paso implícito.
- Capacidades multilingües: no disponible; no se declaran idiomas en la model card ni en las etiquetas del repositorio.
- Capacidades especiales adicionales (visión, audio): no disponibles.

## Casos de uso

- Investigación en aprendizaje por refuerzo para razonamiento: el adaptador sirve como punto de partida reproducible para experimentar con esquemas de recompensa basados en jueces externos, ya que documenta la configuración exacta de evaluación (greedy, sin thinking, 2048 tokens nuevos).
- Reproducción y comparación de checkpoints FSG-RL: al ser un adaptador independiente, permite evaluar el efecto del juez profesor sobre el checkpoint principal sin necesidad de apilar adaptadores, lo que simplifica los estudios ablativos.
- Evaluación de modelos en problemas matemáticos difíciles: los 60 problemas de entrenamiento y el conjunto de 400 ítems graph-conditioned permiten montar un banco de pruebas para medir degradación o ganancia respecto al modelo base en tareas de dificultad alta.
- Generación de soluciones paso a paso en entornos educativos avanzados: el modelo produce razonamiento estructurado con un límite de 2048 tokens nuevos, adecuado para explicaciones de problemas de nivel competitivo donde se requiere justificar cada paso.
- Extracción de respuesta final en pipelines de verificación automática: la métrica de precisión de respuesta final es directamente utilizable para integrar el modelo como componente de un sistema que compara resultados numéricos o simbólicos.
- Base para destilación o ajuste posterior: al ser un adaptador LoRA de 0,4 GB, puede cargarse junto al modelo base, combinarse con otros adaptadores o servir como inicialización para etapas posteriores de entrenamiento con un coste de almacenamiento muy bajo.
- Estudio del efecto del condicionamiento por grafos: si el flujo de trabajo dispone de representaciones en grafo de los problemas, este checkpoint está específicamente evaluado en ese formato y resulta adecuado para investigar cómo afecta la estructura del enunciado al rendimiento.

## Benchmarks y rendimiento

Los únicos resultados publicados en la información disponible corresponden a la evaluación propia del autor, no a benchmarks estándar de la comunidad. Se obtuvieron con decodificación greedy, modo de pensamiento desactivado y un límite de 2048 tokens nuevos, sobre un conjunto de 400 ítems con condicionamiento por grafo definido por el propio autor.

| Evaluacion | Metrica | Resultado |
|---|---|---|
| Conjunto propio graph-conditioned (400 items) | Precision de respuesta final | 68,25 % |
| Conjunto propio graph-conditioned (400 items) | Exito completo estricto | 52,75 % |
| MMLU, HumanEval, GSM8K, MATH u otros benchmarks publicos | No aplica | No se han publicado resultados de benchmarks en la informacion disponible |

El autor advierte explícitamente de que estas cifras no son puntuaciones oficiales sobre los datasets de origen y de que la exportación pública del dataset excluye campos de puntuación privados, por lo que la comparabilidad con otros modelos es limitada.

## Requisitos de hardware

- VRAM estimada para el adaptador: menos de 1 GB adicional sobre el modelo base, dado que el repositorio ocupa 0,4 GB.
- VRAM estimada para el modelo base de 9B (estimacion, no confirmada en la informacion disponible): en torno a 18-20 GB en bf16/fp16, 9-11 GB en cuantizacion de 8 bits y 5-7 GB en cuantizacion de 4 bits, más el espacio para la cache KV.
- GPU recomendadas: para bf16 completo, una GPU con 24 GB o más (RTX 3090/4090, L40S, A100 40 GB, H100); para cuantizacion de 4 bits, una GPU consumer de 8-12 GB puede ser suficiente según la longitud de contexto real, dato que no está disponible.
- Cabe en GPU consumer: probablemente sí en cuantizacion de 4 bits sobre GPU de 8-12 GB, aunque no hay confirmacion del autor ni datos de contexto que permitan asegurarlo.
- Opciones de despliegue: transformers + PEFT es la vía directa indicada por `library_name: peft`; también son viables vLLM y TGI tras fusionar el adaptador con el modelo base. No se distribuyen pesos en GGUF, por lo que llama.cpp u Ollama requerirían una conversion previa del adaptador fusionado.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La información disponible no incluye resultados de benchmarks de alternativas comparables, por lo que la comparación se limita a características estructurales declaradas.

| Modelo | Tipo | Parametros | Contexto | Evaluacion publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FSG-RL-Teacher-Judge-GRPO | Adaptador LoRA sobre Qwen3.5-9B-Base | No disponible (base ~9B segun denominacion) | No disponible | 68,25 % respuesta final / 52,75 % exito estricto en conjunto propio de 400 items | No disponible | HuggingFace, 0 descargas, 0 likes |
| Checkpoint principal de FSG-RL (adaptador previo) | Adaptador LoRA sobre el mismo base | No disponible | No disponible | No disponible | No disponible | Referenciado en la model card, sin enlace directo |
| Qwen/Qwen3.5-9B-Base | Modelo base completo | ~9B segun denominacion | No disponible | No disponible | No disponible | HuggingFace |
| Otros adaptadores LoRA de razonamiento matematico | Adaptadores LoRA | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso para uso comercial, y el adaptador hereda además las condiciones del modelo base Qwen/Qwen3.5-9B-Base, que tampoco se detallan en la información disponible.
- Los pesos del modelo base no están incluidos: el repositorio contiene únicamente el adaptador, por lo que es imprescindible descargar Qwen/Qwen3.5-9B-Base por separado y verificar su disponibilidad y licencia.
- Evaluación no estándar: los porcentajes reportados proceden de un conjunto propio con condicionamiento por grafo y no son comparables con MMLU, GSM8K, MATH o HumanEval. El propio autor indica que no son puntuaciones oficiales sobre los datasets de origen.
- Riesgo de sobreajuste al protocolo de evaluación: la evaluación se realizó con greedy, sin thinking y con un límite de 2048 tokens nuevos; otros regímenes de decodificación pueden ofrecer resultados distintos y no están documentados.
- Riesgo de alucinación: no se han publicado análisis de fiabilidad, tasa de error por tipo de problema ni estudios de calibración en razonamiento matemático.
- Sesgos: no hay información sobre composición del dataset de entrenamiento, idioma de los datos ni análisis de sesgos.
- Cobertura lingüística desconocida: no se declaran idiomas soportados, por lo que el comportamiento fuera del inglés (si el entrenamiento fue en inglés) es incierto.
- Dependencia del profesor solo en entrenamiento: aunque el juez `gpt-5.6-terra` no se usa en inferencia, el adaptador puede haber aprendido sesgos propios del criterio de ese juez, lo que no ha sido analizado en la información disponible.
- Madurez y adopción nulas: cero descargas y cero valoraciones, sin pipeline declarado ni demo pública, lo que desaconseja su uso directo en producción sin validación propia.
- Volumen de entrenamiento reducido en esta etapa: la continuación se realizó sobre 60 problemas difíciles, un conjunto pequeño que puede limitar la generalización.
- Contexto máximo desconocido: al no declararse la longitud de contexto, no puede garantizarse el comportamiento en entradas largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZihanLiummyycc/FSG-RL-Teacher-Judge-GRPO
- Repositorio FSG-RL en GitHub: https://github.com/ZihanLiummyycc/FSG-RL
- Perfil del autor en GitHub: https://github.com/ZihanLiummyycc
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Receta de TRL para post-entrenamiento con GRPO (referencia metodologica): https://huggingface.co/learn/cookbook/fine_tuning_llm_grpo_trl
- Documentación de entrenamiento GRPO en OpenJudge (referencia metodologica): https://deepwiki.com/modelscope/OpenJudge/4.4.3-grpo-training
- MT-RL-Judge de Meta, juez entrenado con GRPO (referencia sobre el uso de jueces): https://alphasignal.ai/news/meta-s-mt-rl-judge-beats-supervised-ai-graders-across-six-evaluation-tasks
