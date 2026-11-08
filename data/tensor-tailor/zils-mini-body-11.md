# tensor-tailor/zils-mini-body-11

## Resumen

zils-mini-body-11 es un ajuste fino mediante LoRA de un modelo de decisión de la familia Zils, publicado por el usuario tensor-tailor en Hugging Face. Se construye sobre el "soup" (promedio uniforme de pesos) de dos cuerpos previos, qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1, y se presenta como un "decision body" destinado al pool de modelos d3-mini de la subred 127 de Bittensor. El modelo emplea el chasis de Qwen3.5-4B, con tensores de lenguaje y visión en bf16.

Con 4.539.265.536 parámetros totales (aproximadamente 4,5 mil millones), el modelo está pensado para tareas de decisión: clasificación, puntuación de coincidencias, filtrado de peticiones y etiquetado. No es un modelo conversacional de propósito general, sino un componente especializado que se entrena con ejemplos de entrada-salida para replicar decisiones concretas.

La relevancia del modelo radica en su enfoque de entrenamiento: utiliza etiquetas "house" (salidas de un modelo profesor del propio ecosistema Zils) combinadas con un conjunto de anclas con etiquetas gold, y aplica una función de pérdida que suma entropía cruzada y el score de Brier. La licencia Apache-2.0 facilita su uso comercial, aunque la información pública disponible es muy limitada y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con chasis Qwen3.5-4B (tensores de lenguaje y visión), proyecciones Gated-DeltaNet y atención |
| Parámetros totales | 4.539.265.536 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con máximo 2.048 tokens) |
| Tipos de cuantización | No disponible (pesos en bf16; se desconoce si hay versiones GGUF/AWQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del chasis Qwen3.5-4B, que combina capas de atención con proyecciones Gated-DeltaNet, e incluye una torre de visión. Sobre ese chasis se aplica un ajuste fino LoRA de rango 32, alpha 64 y dropout 0.05 sobre las proyecciones de atención y Gated-DeltaNet de todas las capas de lenguaje (152 matrices). El entrenamiento usa una tasa de aprendizaje de 5e-5, AdamW con weight decay de 1.0 solo en los pesos LoRA, batch de 8 con acumulación de 2, warm-up de 50 pasos seguido de decaimiento coseno, 2 épocas y un máximo de 2.048 tokens por muestra. La pérdida por fila combina entropía cruzada sobre la etiqueta de la fila más 1.0 veces el score de Brier, sin término KL ni destilación de probabilidades de profesor. Los pesos LoRA se fusionan en bf16.

El conjunto de datos consta de 3.208 filas. De ellas, 2.803 son filas de "relay" procedentes de 70 fuentes de tareas públicas de cola larga (colección tasksource, splits de entrenamiento, máximo 150 por familia), con etiquetas "house" generadas por un modelo profesor del pool de relay archivado (atribuido a d3-ultra, revisión exacta desconocida). Las otras 405 filas son anclas con etiquetas gold: ítems de puntuación de artes, lenguaje y razonamiento generados por código, filas de entrenamiento de GoEmotions simplificado y filas de MNLI, PIQA y GLUE con sus etiquetas de dataset. No se usaron salidas de otros mineros como objetivos. Todas las filas pasaron un filtro de 8-gramas contra 81 fuentes de examen (0 coincidencias), sin datos de Glaive ni ítems de herramientas con plantilla.

## Capacidades

- Clasificación y decisión: el modelo está diseñado para emitir decisiones o puntuaciones sobre entradas, no para generar texto libre extenso.
- Puntuación de coincidencias y ranking: puede evaluar pares o candidatos y asignar scores, gracias a la pérdida basada en Brier.
- Filtrado y flagging de peticiones: orientado a tareas de moderación o triaje dentro de aplicaciones.
- Razonamiento y comprensión lingüística: hereda las capacidades del chasis Qwen3.5-4B, incluyendo razonamiento básico y comprensión de texto.
- Visión: el chasis incluye torre de visión, aunque no se documenta el alcance efectivo tras el ajuste.
- Multilingüismo: no disponible; no se especifican idiomas soportados.
- Tool calling / function calling: no disponible; no se menciona soporte explícito.
- Capacidades de agente multi-paso: no disponible; el modelo se presenta como "decision body", no como agente.

## Casos de uso

- Triaje de peticiones en atención al cliente: el modelo puede clasificar y priorizar tickets entrantes según ejemplos etiquetados, usando su naturaleza de modelo de decisión para asignar categorías y scores de urgencia.
- Moderación de contenido: entrenado con etiquetas de decisión, puede marcar mensajes o publicaciones como aptos o no aptos dentro de un pipeline de moderación, con la ventaja de su tamaño reducido para despliegue en CPU o GPU modesta.
- Puntuación de coincidencias en recomendación: puede evaluar pares usuario-ítem y emitir un score de afinidad, aprovechando la pérdida de Brier para obtener probabilidades calibradas.
- Clasificación de intenciones en asistentes conversacionales: integrado como componente previo a un LLM generativo, decide la intención del usuario y enruta la consulta al flujo adecuado.
- Etiquetado automático de datasets: puede pre-etiquetar grandes volúmenes de texto con las categorías aprendidas, reduciendo el esfuerzo de anotación manual en proyectos de datos.
- Filtrado de spam o abuso en foros y comunidades: con ejemplos de decisión adaptados al dominio, el modelo puede actuar como clasificador binario o multiclase de bajo coste.
- Evaluación de calidad en pipelines de datos: puede puntuar la relevancia o calidad de documentos y descartar los que no cumplan umbrales, gracias a su salida de score.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo reporta comprobaciones internas: cambio relativo respecto a Qwen/Qwen3.5-4B de 0.01254 (límite 0.15), digest del cuerpo Zils 8a3c157a8d14770bfc0bd0d5cf6b7f02c307c8c8ee68d9f6114a0afe4792f366, y un cribado de copia con coseno máximo de 0.941 (límite 0.999) y proporción explicada por cuerpos anteriores de 0.223 (límite 0.30). Estos datos no son benchmarks de rendimiento estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4,54 mil millones de parámetros, en bf16 se requieren aproximadamente 9,1 GB solo para los pesos, más overhead de activaciones y contexto; en fp16 similar. En cuantización de 8 bits, alrededor de 4,5-5 GB; en 4 bits, alrededor de 2,5-3 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: para bf16 sin cuantizar, una GPU con 16 GB o más (RTX 4090, A100 40 GB, H100). Para cuantización 4 bits, una GPU consumer con 8 GB (RTX 3070/4060) podría ser suficiente, aunque no está verificado.
- Cabe en GPU consumer: sí, previsiblemente en RTX 4090 (24 GB) en bf16 y en GPUs de 8-12 GB con cuantización, siempre que se disponga de versiones cuantizadas, que no se documentan.
- Opciones de despliegue: al ser un modelo con custom_code y safetensors, requiere transformers con confianza remota o el código del autor. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; la ausencia de versiones GGUF limita el despliegue en llama.cpp/Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-mini-body-11 | 4,54 B | No disponible (entreno 2.048) | Apache-2.0 | Hugging Face, 0 descargas | Modelo de decisión, fine-tune LoRA de un soup |
| Qwen3.5-4B (chasis base) | ~4 B | No disponible | No disponible | Público | Modelo base del chasis; el ajuste cambia un 0.01254 relativo |
| qhoenix/zils-mini-decision-v2 | No disponible | No disponible | No disponible | Hugging Face | Cuerpo previo del soup, base del fine-tune |
| Charlie320/zils-mini-s1 | No disponible | No disponible | No disponible | Hugging Face | Cuerpo previo del soup, base del fine-tune |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Etiquetas "house": 2.803 de las 3.208 filas de entrenamiento usan etiquetas generadas por un modelo profesor (d3-ultra) cuya revisión exacta se desconoce; no son etiquetas gold, lo que puede introducir sesgos y errores sistemáticos del profesor.
- Riesgo de alucinación y sobreajuste a decisiones: al ser un modelo de decisión entrenado con etiquetas específicas, puede generalizar mal fuera de la distribución de las tareas de entrenamiento.
- Contexto limitado: el entrenamiento usa un máximo de 2.048 tokens; no se documenta la longitud de contexto efectiva del chasis, lo que limita entradas largas.
- Idiomas no especificados: no se declaran idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Licencia Apache-2.0: permite uso comercial, pero el NOTICE cita obras upstream cuyas condiciones deben revisarse; el chasis Qwen3.5-4B puede tener su propia licencia que condicione la redistribución.
- Falta de benchmarks públicos: no hay resultados de MMLU, HumanEval, GSM8K ni similares, lo que impide evaluar su calidad frente a alternativas.
- Madurez: 0 descargas y 0 likes en Hugging Face; el autor indica que se envió antes de completar la lectura pre-commit, lo que sugiere una validación limitada.
- Requiere custom_code: el despliegue exige cargar código remoto, con los riesgos de seguridad asociados.
- Sin versiones cuantizadas documentadas: dificulta el despliegue en hardware modesto y en herramientas como llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-11
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- Sitio de Zils: https://zils.ai/
