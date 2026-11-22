# spatialgeography/bert-tiny-ai-human-text-detector

## Resumen

bert-tiny-ai-human-text-detector es un clasificador binario de texto en inglés que etiqueta un fragmento como escrito por una persona (HUMAN) o generado por IA (AI), concretamente por ChatGPT en su versión de principios de 2023. Lo desarrolla el usuario de Hugging Face spatialgeography como demostración didáctica, y se construye mediante fine-tuning del modelo BERT-Tiny de Google (google/bert_uncased_L-2-H-128-A-2), una arquitectura transformer encoder de solo 2 capas, 128 dimensiones ocultas y 4,4 millones de parámetros.

El modelo resuelve una tarea muy acotada: distinguir respuestas humanas de respuestas de ChatGPT a las mismas preguntas del dataset HC3 (subconjuntos finance, medicine, open_qa y wiki_csai). Su relevancia es fundamentalmente pedagógica: muestra hasta qué punto un modelo minúsculo puede alcanzar una accuracy del 96,86 % en un dominio cerrado y por qué ese número no se traduce en un detector de IA fiable fuera de ese dominio.

No es un modelo generativo ni de propósito general: no razona, no escribe código ni mantiene conversaciones. Es un clasificador de secuencias con truncamiento a 256 tokens, entrenado en unos 19 minutos sobre CPU de portátil, y pensado para ilustrar los sesgos y las limitaciones de la detección de texto generado por IA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-Tiny: 2 capas, hidden size 128, 2 cabezas de atención) |
| Parámetros totales | 4.386.178 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens (truncamiento en entrenamiento e inferencia) |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; admite cuantización estándar vía herramientas externas, no documentada por el autor) |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de BERT-Tiny (google/bert_uncased_L-2-H-128-A-2), un encoder transformer de 2 capas con 128 dimensiones ocultas y vocabulario uncased, sobre el que se añade una cabeza de clasificación de secuencia con dos etiquetas (HUMAN/AI). El entrenamiento se realizó con la librería transformers sobre el dataset Hello-SimpleAI/HC3, que empareja respuestas humanas y respuestas de ChatGPT (principios de 2023) a las mismas preguntas en los subconjuntos finance, medicine, open_qa y wiki_csai.

La preparación de datos es el punto técnico más cuidado de la ficha: se balancea cada pregunta con el mismo número de respuestas humanas y de IA (6.439 + 6.439 para entrenamiento y 716 + 716 para test), se divide por pregunta (90 % de preguntas para train y 10 % para test, sin solapamiento) y se normaliza el texto colapsando espacios y eliminando espacios antes de puntuación, para evitar que el modelo aprenda atajos de formato como los saltos de línea exclusivos de las respuestas de IA. Se descartan respuestas de menos de 10 palabras y se trunca a 256 tokens. El fine-tuning consistió en 3 épocas (1.209 pasos), batch size 32, learning rate 1e-4 con decaimiento lineal y 100 pasos de warm-up, ejecutado en CPU de portátil (4 hilos) en 18 minutos y 41 segundos. No se documenta RLHF, DPO ni ninguna innovación arquitectónica adicional.

## Capacidades

- Clasificación binaria de texto en inglés: etiqueta HUMAN o AI con una puntuación de confianza.
- Detección de estilo de respuesta de ChatGPT de principios de 2023 en el dominio de HC3 (finanzas, medicina, open_qa y wiki_csai).
- Inferencia muy rápida y ligera: 4,4 millones de parámetros y 17,5 MB, ejecutable en CPU.
- Integración sencilla vía pipeline de transformers (`pipeline("text-classification", ...)`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: solo inglés.
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto, solo etiquetas.

## Casos de uso

- Demostración educativa en cursos y talleres: el modelo sirve para explicar cómo funciona el fine-tuning de un transformer y por qué una accuracy alta en un dataset cerrado no implica un detector fiable en producción, gracias a su tamaño (17,5 MB) y a su entrenamiento en CPU en menos de 20 minutos.
- Filtrado preliminar en pipelines de curación de datos: como clasificador barato de primera etapa para marcar posibles respuestas generadas por IA en corpus de preguntas y respuestas de temática financiera, médica o wiki, siempre con revisión humana posterior.
- Estudio de sesgos y robustez en detección de IA: útil como baseline mínimo contra el que comparar detectores más grandes y para analizar cómo el estilo de ChatGPT de 2023 se distingue del texto humano en dominios concretos.
- Prototipado rápido de interfaces de clasificación: al caber en cualquier entorno con transformers y CPU, permite validar la integración de un endpoint de text-classification (por ejemplo, con text-embeddings-inference, que la ficha declara compatible) antes de invertir en modelos mayores.
- Análisis de estilo en corpus académicos o periodísticos de temática sanitaria o financiera: puede usarse como señal auxiliar, nunca como veredicto, para explorar la prevalencia de respuestas con estilo ChatGPT en conjuntos de preguntas y respuestas de esos dominios.
- Benchmark de eficiencia: con 4,4 millones de parámetros y 17,5 MB, sirve para medir latencia y throughput en hardware modesto (CPU, Raspberry Pi, contenedores pequeños) y comparar el coste frente a detectores basados en modelos de cientos de millones de parámetros.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model-index de la model card (no verificados de forma independiente):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación AI vs humano | HC3 (finance, medicine, open_qa, wiki_csai), 10 % de preguntas reservadas | Accuracy | 0,9686 |
| Clasificación AI vs humano | HC3 (finance, medicine, open_qa, wiki_csai), 10 % de preguntas reservadas | F1 | 0,9683 |

Evolución por época reportada por el autor:

| Época | Accuracy | F1 | Precisión (AI) | Recall (AI) |
|---|---|---|---|---|
| 0 (antes de fine-tuning) | 68,5 % | 0,641 | 0,746 | 0,561 |
| 1 | 94,7 % | 0,945 | 0,988 | 0,905 |
| 2 | 96,3 % | 0,962 | 0,980 | 0,946 |
| 3 | 96,9 % | 0,968 | 0,977 | 0,959 |

Desglose por subconjunto de test reportado por el autor:

| Subconjunto | Textos | Accuracy |
|---|---|---|
| medicine | 266 | 98,5 % |
| finance | 756 | 98,0 % |
| open_qa | 262 | 94,3 % |
| wiki_csai | 148 | 92,6 % |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (17,5 MB de pesos más overhead de activaciones y tokenizador); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: ninguna en particular; el modelo está pensado para CPU. Funciona en cualquier GPU NVIDIA (RTX 3060, RTX 4090, A100, H100) sin aprovechar su capacidad.
- Cabe en GPU consumer: sí, en todas, e incluso en CPU de portátil (el autor lo entrenó en CPU con 4 hilos en 18 min 41 s).
- Opciones de despliegue: pipeline de transformers, text-embeddings-inference (la ficha declara endpoints_compatible), y cualquier servidor compatible con transformers; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles de forma oficial; por su tamaño, la inferencia en CPU es del orden de milisegundos por secuencia de 256 tokens, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| spatialgeography/bert-tiny-ai-human-text-detector | 4,4 M | 256 tokens | Clasificación AI vs humano (inglés) | CC-BY-SA-4.0 | Hugging Face |
| google/bert_uncased_L-2-H-128_A-2 (BERT-Tiny) | 4,4 M | 512 tokens | Modelo base encoder (no clasificador AI/humano) | Apache 2.0 | Hugging Face |
| Hello-SimpleAI/chatgpt-detector-roberta | no disponible en la información proporcionada | no disponible en la información proporcionada | Clasificación AI vs humano | no disponible en la información proporcionada | Hugging Face (dataset asociado HC3) |

Los datos de los modelos alternativos no están disponibles en la información proporcionada; la comparación se limita a señalar que BERT-Tiny es el modelo base exacto y que el detector RoBERTa de Hello-SimpleAI es la referencia natural del mismo dataset, sin cifras verificables aquí.

## Limitaciones y advertencias

- No es un detector de IA fiable: el 96,9 % de accuracy solo aplica a preguntas y respuestas con el formato de HC3; en otros temas falla. El autor documenta que etiquetó como HUMAN con 0,99 de confianza un párrafo sobre teledetección escrito al estilo de ChatGPT.
- Aprende el estilo de ChatGPT de principios de 2023: modelos más recientes (GPT-4/5, Claude, Gemini, Llama) y texto de IA editado o parafraseado se etiquetan a menudo como HUMAN.
- Textos cortos, inglés no nativo y escritura humana formal pueden clasificarse erróneamente como AI.
- Sesgos de dominio: el modelo se entrena solo con subconjuntos de finanzas, medicina, open_qa y wiki_csai, por lo que su comportamiento fuera de esos dominios no está caracterizado.
- Restricción de licencia: CC-BY-SA-4.0 obliga a atribución y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con productos comerciales cerrados.
- Solo inglés: no hay soporte multilingüe.
- Longitud máxima de 256 tokens: textos más largos se truncan y pierden información.
- Advertencia explícita del autor: no debe usarse para juzgar el trabajo de estudiantes ni de ninguna persona; la detección de texto de IA tiene tasas de error altas incluso con modelos mucho mayores y puede ser injusta con algunos escritores.
- Modelo de demostración con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente de sus métricas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spatialgeography/bert-tiny-ai-human-text-detector
- Modelo base BERT-Tiny: https://huggingface.co/google/bert_uncased_L-2-H-128_A-2
- Dataset HC3: https://huggingface.co/datasets/Hello-SimpleAI/HC3
