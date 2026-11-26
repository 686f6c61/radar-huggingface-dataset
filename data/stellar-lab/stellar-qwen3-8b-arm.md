# Stellar-lab/Stellar-Qwen3-8B-ARM

## Resumen

Stellar-Qwen3-8B-ARM es un modelo de recompensa (reward model) de pesos abiertos desarrollado por Stellar-lab, construido sobre el modelo base Qwen/Qwen3-8B. A diferencia de los reward models escalares clásicos basados en Bradley-Terry, que colapsan múltiples criterios de calidad en una única puntuación opaca, este modelo evalúa las respuestas a lo largo de seis dimensiones explícitas de rúbrica mediante enrutamiento de consultas causales dirigidas dentro del backbone, restricciones analíticas de monotonicidad y penalizaciones no compensatorias de tipo gatekeeper.

El modelo está pensado para pipelines de RLHF y alineación, así como para puntuación interpretable de respuestas generadas por otros LLM. Su innovación principal reside en impedir estructuralmente que la fluidez superficial o la verbosidad compensen fallos de razonamiento, errores factuales o violaciones de instrucciones. Con 7.575.787.059 parámetros totales (aproximadamente 7,6 mil millones), se distribuye en formato safetensors FP16 con código de modelado remoto personalizado.

La relevancia actual del modelo radica en su enfoque hacia la interpretabilidad y la robustez del reward modeling: en lugar de una caja negra, expone seis puntuaciones dimensionales (adherencia a instrucciones, relevancia, completitud, validez del razonamiento, corrección de la tarea y calidad de comunicación) junto con una penalización de veto, lo que facilita el diagnóstico de fallos en procesos de alineación y la depuración de pipelines de datos de preferencias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen3-8B) con cabezas de rúbrica personalizadas, enmascaramiento de atención causal dirigido 4D, bloques DAG causales y proyección de monotonicidad |
| Parametros totales | 7.575.787.059 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP16 en pesos publicados; entrenamiento con QLoRA 4-bit NF4; inferencia con BitsAndBytesConfig 4-bit soportada según la model card |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (FP16, pesos fusionados) con código remoto personalizado (`modeling_stellar_arm.py`) |

## Arquitectura y entrenamiento

El modelo parte del backbone transformer de Qwen3-8B, sobre el que se añaden seis embeddings de consulta aprendibles al final de la secuencia tokenizada, correspondientes a las seis dimensiones de evaluación. Durante el forward pass, una máscara de atención causal dirigida 4D impone una jerarquía estructurada entre las consultas: todas atienden al texto completo de prompt y respuesta, pero la atención entre consultas sigue un orden causal estricto, de modo que las representaciones de estilo y corrección quedan condicionadas por los estados de razonamiento y completitud. Los estados ocultos finales de las seis consultas se proyectan en un subespacio latente dedicado, pasan por bloques de autoatención DAG causales y se mapean mediante cabezas lineales independientes a logits por dimensión. Un techo de prerrequisito softmin suave garantiza que la corrección de la tarea no pueda superar matemáticamente la calidad de sus prerrequisitos de completitud y validez del razonamiento. Finalmente, se sintetiza un logit escalar de preferencia combinando una agregación lineal ponderada por softmax con una penalización de veto no compensatoria LogSumExp sobre tres dimensiones gatekeeper (adherencia, razonamiento y corrección).

El entrenamiento se realizó mediante QLoRA en 4 bits NF4 (r=16, alpha=32) con cabezas DAG y de rúbrica en precisión completa, fusionadas posteriormente en safetensors para inferencia autónoma. La supervisión combina pérdida de preferencia por pares Bradley-Terry, entropía cruzada binaria suave en 6D sobre los objetivos de rúbrica y una pérdida de consistencia por counterfactual activation patching. El conjunto de datos comprende 7.500 pares de preferencias curados en siete regímenes de alineación: HelpSteer2 General, Math Reasoning, MBPP/Code AST Bugs, IFEval Constraints, Truncated/Incomplete, Off-Diagonal Style-vs-Correctness y Safety Refusal.

## Capacidades

- Puntuación escalar de preferencia para pares prompt-respuesta, utilizable como señal de recompensa en RLHF y DPO.
- Evaluación interpretable en seis dimensiones de rúbrica con salidas en el rango (0, 1): adherencia a instrucciones, relevancia, completitud, validez del razonamiento, corrección de la tarea y calidad de comunicación.
- Penalización de veto no compensatoria que reduce la puntuación global cuando falla alguna de las tres dimensiones gatekeeper (adherencia, razonamiento, corrección).
- Detección estructural de respuestas superficialmente fluidas pero factual o lógicamente incorrectas, gracias al enmascaramiento causal dirigido.
- Evaluación de restricciones de formato e instrucciones (régimen IFEval) y de respuestas truncadas o incompletas.
- Evaluación de seguridad y rechazos (Safety Refusal) como dimensión de alineación.
- Soporte de tool calling / function calling: no disponible como capacidad generativa; el modelo es un clasificador de secuencias, no un generador.
- Soporte de agentes y razonamiento multi-paso: no aplica como agente; su uso es como evaluador dentro de pipelines de agentes.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidad especial: modo de evaluación con salidas separadas de logit escalar, puntuaciones dimensionales y penalización de veto.

## Casos de uso

- Entrenamiento RLHF y DPO: el modelo proporciona una señal de recompensa escalar y dimensional que puede integrarse como reward model en frameworks como TRL, con la ventaja de que el veto no compensatorio evita que respuestas verbosas pero incorrectas reciban puntuaciones altas.
- Filtrado de datos de preferencias: dado un conjunto de pares generados por un LLM, el modelo permite descartar pares donde la respuesta preferida falla en dimensiones gatekeeper, mejorando la calidad del dataset de alineación antes del entrenamiento.
- Evaluación automática de asistentes: las seis puntuaciones dimensionales permiten generar informes de calidad por categoría (adherencia, razonamiento, corrección) para comparar versiones de un modelo desplegado sin intervención humana.
- Detección de alucinaciones y errores factuales: la dimensión de corrección de la tarea, condicionada por el techo softmin sobre razonamiento y completitud, ayuda a identificar respuestas con cadena lógica rota o datos incorrectos en pipelines de control de calidad.
- Auditoría de seguridad y rechazos: el régimen Safety Refusal entrenado permite puntuar respuestas ante prompts sensibles y verificar que el modelo evaluado mantiene límites de seguridad y formato.
- Depuración de pipelines de código: con el régimen MBPP/Code AST Bugs, el modelo puede puntuar soluciones de código generadas y señalar las que fallan en corrección funcional pese a tener buena presentación.
- Selección de respuestas en producción (best-of-N): dado un conjunto de N candidatos generados por un LLM, el modelo ordena por recompensa escalar y veto, permitiendo desplegar la mejor respuesta con garantías de no compensación de fallos críticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 15,2 GB solo para pesos (7.575.787.059 parámetros × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 18-20 GB para secuencias cortas.
- VRAM estimada en 4 bits (NF4): aproximadamente 4-5 GB para pesos, más overhead; viable en GPUs consumer con 8 GB o más según longitud de secuencia.
- GPU recomendadas: A100 40/80 GB, H100, L40S para FP16 con `device_map="auto"`; RTX 4090 (24 GB) suficiente para FP16 en una sola GPU con secuencias moderadas; RTX 3090/4080 (16-24 GB) para FP16 o 4 bits.
- Cabe en GPU consumer: sí, en RTX 4090 en FP16 y en GPUs de 8-12 GB con cuantización 4 bits.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification` y `trust_remote_code=True`; cuantización vía BitsAndBytesConfig; no se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stellar-Qwen3-8B-ARM | 7.575.787.059 | no disponible | Reward model multidimensional con veto | apache-2.0 | Hugging Face |
| Reward models escalares basados en Qwen3-8B | ~7,6 B | no disponible | Reward model escalar Bradley-Terry | variable | no disponible en la informacion proporcionada |
| ArmoRM / modelos de recompensa multiobjetivo | no disponible | no disponible | Reward model multiobjetivo | no disponible | no disponible en la informacion proporcionada |

No se dispone de datos de benchmarks ni de comparativas cuantitativas con alternativas en la información proporcionada; la comparación anterior es estructural y no de rendimiento.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al entrenarse sobre HelpSteer2 y otros conjuntos curados, puede heredar sesgos de esos datos.
- Riesgo de alucinación: el modelo no genera texto, pero sus puntuaciones de corrección pueden ser imprecisas ante dominios fuera de los siete regímenes de entrenamiento (general, matemáticas, código, IFEval, truncamiento, estilo vs corrección, seguridad).
- Limitaciones de contexto: la longitud máxima de contexto no se especifica en la información disponible; debe validarse empíricamente antes de usarlo con secuencias largas.
- Limitaciones de idioma: solo se declara soporte para inglés; su comportamiento en castellano u otros idiomas no está garantizado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-8B tiene su propia licencia que debe verificarse por separado.
- Caveat de producción: requiere `trust_remote_code=True` y código de modelado personalizado (`modeling_stellar_arm.py`), lo que implica auditar el código remoto antes de desplegarlo; además, el tokenizador debe configurarse con padding a la izquierda.
- El modelo está entrenado sobre 7.500 pares de preferencias, un volumen relativamente pequeño; puede generalizar peor que reward models entrenados sobre cientos de miles de pares en dominios no cubiertos.
- Las salidas dimensionales están en el rango (0, 1) y el logit escalar no es una probabilidad calibrada; no debe interpretarse directamente como probabilidad de preferencia sin calibración adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Stellar-lab/Stellar-Qwen3-8B-ARM
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a entidades no relacionadas (Stellar blockchain, Stellar Data Recovery, Stellar.io, entre otras) y se descartan.
