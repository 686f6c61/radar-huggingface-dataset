# xtools-at/Qwen3.5-4B-Medical-Reasoning

## Resumen

Qwen3.5-4B Medical Reasoning es un adaptador LoRA de bajo peso (0,1 GB) publicado por xtools-at que se monta sobre DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING, un fine-tune a su vez del modelo base Qwen3.5-4B de Alibaba. El adaptador añade capacidad de razonamiento clínico y respuesta a preguntas médicas mediante SFT supervisado sobre un subconjunto de 2.000 ejemplos del dataset FreedomIntelligence/medical-o1-reasoning-SFT, en el que el 100% de las muestras incluyen trazas de pensamiento (thinking traces).

El modelo resuelve el problema de adaptar un LLM pequeño y ya modificado (la base es un fine-tune "uncensored" con modificaciones de estilo) a un dominio especializado como es el razonamiento médico paso a paso, sin necesidad de reentrenar un modelo fundacional. Es relevante ahora por dos motivos: primero, porque demuestra que con una T4 de 16 GB y 2 épocas se puede especializar un modelo de 4B en un dominio vertical; segundo, porque ejemplifica una práctica cada vez más común en el ecosistema open source: cadenas de fine-tunes sobre fine-tunes cuya contribución relativa de cada etapa no está medida.

Se trata de un artefacto experimental y de investigación, no de un sistema clínicamente validado. La propia model card advierte de que puede producir diagnósticos incorrectos, detalles fabricados o explicaciones engañosas, y que no debe usarse para atención al paciente, triaje de urgencias ni decisiones clínicas autónomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (linaje Qwen3.5-4B); este release es un adaptador LoRA, no un modelo completo |
| Parametros totales | 4B en el modelo base; el adaptador LoRA ocupa 0,1 GB (r=16, alpha=32) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens en entrenamiento; la del modelo base Qwen3.5-4B no se especifica en la informacion disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (el adaptador se distribuye en safetensors de 16 bits) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere cargar el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen3.5 con 4.000 millones de parámetros. La cadena de linaje es: Qwen/Qwen3.5-4B → DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING → este adaptador. La base inmediata ya incorpora modificaciones de estilo y de comportamiento (etiquetadas como "HERETIC" y "UNCENSORED" por su autor), de modo que el comportamiento final mezcla el efecto de esas modificaciones con el del nuevo entrenamiento médico; la model card reconoce explícitamente que la contribución relativa de cada etapa no se ha medido de forma independiente.

El entrenamiento consistió en SFT con LoRA: rango 16, alpha 32, dropout 0,01, módulos objetivo "todos los configurados en la ejecución", learning rate 2e-4 con scheduler lineal, optimizador AdamW de 8 bits, weight decay 0,001, batch efectivo de 8 (batch 2 × acumulación 4), precisión de 16 bits y longitud máxima de secuencia de 4.096 tokens. Se ejecutó sobre una única NVIDIA Tesla T4 de 16 GB durante 2 épocas, con 2.000 ejemplos muestreados aleatoriamente del dataset FreedomIntelligence/medical-o1-reasoning-SFT tras limpieza y tras incorporar trazas de razonamiento en el 100% de las muestras. La pérdida final de entrenamiento reportada fue de 1,54. La partición de evaluación fue aproximadamente el 2% de los datos muestreados. La innovación técnica destacable es precisamente la cobertura del 100% de thinking traces, que fuerza al modelo a producir respuestas estructuradas de razonamiento en lugar de mezclar ejemplos con y sin traza.

## Capacidades

- Generación de texto y respuesta a preguntas de conocimiento médico en inglés.
- Razonamiento clínico multi-paso: interpretación de síntomas, hallazgos de laboratorio y viñetas clínicas.
- Exploración de diagnósticos diferenciales y propuesta de investigaciones de seguimiento.
- Producción de trazas de pensamiento (thinking traces) de forma consistente, al haber sido entrenado con cobertura del 100%.
- Conversación multi-turno (etiqueta "conversational" en el repo).
- Especialización de dominio sobre un modelo base ya existente, sin reentrenamiento fundacional.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes, visión, audio ni otras modalidades.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso

- Evaluación de adaptación de dominio en modelos pequeños: usar el adaptador para medir cuánto mejora un 4B en preguntas médicas tras 2 épocas de SFT con 2.000 ejemplos, comparando contra la base sin adaptador en un conjunto de validación propio.
- Prototipado de asistentes de documentación clínica en entornos controlados: generar borradores de resúmenes de casos o explicaciones de hallazgos analíticos para revisión humana posterior, nunca para uso directo en consulta.
- Investigación sobre fidelidad del razonamiento: al tener trazas de pensamiento en el 100% de los ejemplos de entrenamiento, sirve para estudiar si las explicaciones generadas se corresponden con el comportamiento interno del modelo, tal y como sugiere la propia model card.
- Generación de material educativo de preguntas y respuestas médicas: producir explicaciones paso a paso de conceptos clínicos para plataformas de formación, con revisión por profesionales antes de publicar.
- Benchmarking de cadenas de fine-tunes: evaluar cómo un adaptador médico se comporta sobre una base ya modificada (HERETIC/UNCENSORED), un escenario relevante para quien construye pipelines de especialización sobre modelos comunitarios.
- Experimentación en entornos con hardware modesto: al ser un adaptador de 0,1 GB sobre un 4B, permite iterar en una única GPU de 16 GB (T4 o similar), útil para laboratorios con recursos limitados que quieran reproducir el flujo de SFT con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida final de entrenamiento (1,54) y no incluye métricas de evaluación como MMLU, MedQA, HumanEval o GSM8K, ni comparaciones con modelos similares.

## Requisitos de hardware

- Entrenamiento: una NVIDIA Tesla T4 de 16 GB fue suficiente para el SFT con LoRA reportado (batch 2, acumulación 4, secuencia 4.096).
- Inferencia: el adaptador pesa 0,1 GB y se suma al modelo base de 4B. En 16 bits, el base requiere del orden de 8 GB de VRAM solo para pesos, más overhead de contexto y activaciones; con cuantización a 8 o 4 bits (no documentada para este release) cabría en GPUs consumer de 8-12 GB.
- GPU recomendadas: T4 (16 GB) para reproducir el entrenamiento; para inferencia, cualquier GPU con al menos 8-16 GB según precisión (RTX 3060 12 GB, RTX 4070, RTX 4090, A100, H100).
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060 12 GB o superiores con cuantización; no confirmado en la información disponible.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base); vLLM, llama.cpp, Ollama o TGI no están documentados para este adaptador en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| xtools-at/Qwen3.5-4B-Medical-Reasoning | 4B (base) + LoRA 0,1 GB | 4.096 en entrenamiento | Adaptador LoRA médico | Apache-2.0 | Experimental, sin benchmarks publicados |
| Qwen/Qwen3.5-4B | 4B | no disponible | Modelo fundacional | no disponible en la informacion | Base upstream, sin especialización médica |
| DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING | 4B | no disponible | Fine-tune comunitario | no disponible en la informacion | Base inmediata, modificaciones de estilo y "uncensored" |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparación se limita a linaje, tamaño y licencia.

## Limitaciones y advertencias

- Modelo experimental no validado clínicamente: puede producir diagnósticos incorrectos, detalles fabricados y explicaciones engañosas.
- No apto para atención al paciente, recomendaciones de tratamiento, triaje de urgencias ni decisión clínica autónoma, según la propia model card.
- La presencia de trazas de pensamiento en el 100% del entrenamiento no garantiza que las explicaciones generadas sean fieles a los procesos internos del modelo.
- La base inmediata es un fine-tune comunitario con modificaciones "HERETIC/UNCENSORED"; el efecto combinado de esas modificaciones con el entrenamiento médico no está medido.
- Entrenamiento con solo 2.000 ejemplos y 2 épocas: riesgo alto de sobreajuste al subconjunto y de baja generalización fuera de la distribución del dataset.
- Idioma limitado al inglés; no se documenta soporte de castellano ni de otros idiomas.
- Contexto de entrenamiento de 4.096 tokens; no se especifica la ventana nativa del base ni el comportamiento más allá de ese límite.
- Licencia Apache-2.0 declarada para este release, pero conviene verificar la licencia del modelo base y de la base inmediata antes de uso comercial, ya que la cadena de linaje puede imponer condiciones adicionales.
- Sin benchmarks publicados: no hay evidencia cuantitativa de mejora frente al base en tareas médicas.
- Sin soporte documentado de tool calling, agentes o multimodalidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/xtools-at/Qwen3.5-4B-Medical-Reasoning
- Modelo base inmediato: https://huggingface.co/DavidAU/Qwen3.5-4B-Claude-4.6-OS-Auto-Variable-HERETIC-UNCENSORED-THINKING
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset original: https://huggingface.co/datasets/FreedomIntelligence/medical-o1-reasoning-SFT
- Dataset de entrenamiento: https://huggingface.co/datasets/xtools-at/medical-o1-reasoning-SFT-chat
