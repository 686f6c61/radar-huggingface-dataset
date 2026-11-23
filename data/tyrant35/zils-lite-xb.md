# tyrant35/zils-lite-xb

## Resumen

zils-lite-xb es un modelo de decisión derivado de malkolm777/zils-lite-l22-correct-attn, publicado por el usuario tyrant35 en Hugging Face. Se trata de un ajuste fino mediante dos LoRA de rango 64 aplicadas sobre las proyecciones MLP (gate, up y down) del modelo base, que posteriormente se promediaron por pesos. El modelo cuenta con 852.985.920 parámetros y se distribuye en formato safetensors con licencia Apache 2.0.

El modelo está orientado a tareas de decisión: responder preguntas de opción múltiple o clasificación binaria/multiclase sobre textos. El entrenamiento se realizó con aproximadamente 3.970 preguntas de decisión extraídas de los splits de entrenamiento de datasets públicos de BigScience P3, junto con datos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer. Los objetivos de entrenamiento mezclan la etiqueta gold con las probabilidades que el propio modelo base asignaba a cada respuesta.

La relevancia de este modelo es limitada y muy específica: se trata de un experimento de ajuste fino sobre un modelo base poco conocido, sin pipeline declarado, sin idiomas especificados y sin resultados de benchmarks publicados. Su interés principal reside en la técnica de entrenamiento (LoRA promediadas con objetivos mixtos gold/probabilidades del profesor) y en su posible uso como clasificador ligero de decisiones, no como modelo generativo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada del modelo base zils-lite-l22-correct-attn; detalles no disponibles) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de malkolm777/zils-lite-l22-correct-attn, descrito por el autor como un cuerpo "d3-lite soup-pool". Sobre ese cuerpo se aplicaron dos ajustes finos LoRA de rango 64 sobre las proyecciones MLP (gate, up y down), con learning rate 1e-4, una sola pasada y semillas 7231 y 7232. Posteriormente, ambos adaptadores se promediaron por pesos para producir el modelo final. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención ni tokenizador del modelo base.

Los datos de entrenamiento consisten en aproximadamente 3.970 preguntas de decisión procedentes de los splits de entrenamiento de datasets públicos de BigScience P3, complementadas con datos de entrenamiento públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer. Los objetivos de entrenamiento combinan la etiqueta gold con las probabilidades del propio modelo base: el peso de la etiqueta gold es 0,9 cuando la respuesta principal del modelo base era incorrecta y 0,32 cuando era correcta. No se utilizó ningún split de test de benchmarks y se eliminaron las filas cuyo texto aparecía en los conjuntos de evaluación del autor. No se menciona el uso de RLHF ni DPO.

## Capacidades

- Clasificación y decisión sobre preguntas de opción múltiple o categorías discretas, a partir de texto de entrada.
- Razonamiento de tipo NLI (inferencia de lenguaje natural), entrenado con datos de NLI4CT.
- Detección de sarcasmo, con datos de iSarcasmEval.
- Análisis de sentimiento y atribución de opiniones, con datos de VAST.
- Razonamiento temporal y de sentido común con CLadder.
- Clasificación de intención de compra y relevancia de productos, con datos de Amazon ESCI.
- Verificación de hechos y atribución de afirmaciones, con datos de HoVer.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no especificados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de reclamaciones de seguros: el modelo puede recibir el texto de una reclamación y decidir entre categorías predefinidas (aceptar, revisar, rechazar), aprovechando su entrenamiento en tareas de decisión con datasets de NLI y verificación.
- Moderación de contenido con matices: para decidir si un comentario es sarcástico, ofensivo o neutro, el ajuste con iSarcasmEval y VAST lo hace adecuado en flujos de revisión donde se requiere una etiqueta discreta.
- Verificación de afirmaciones en pipelines de fact-checking: dado un par afirmación-evidencia, el modelo puede clasificar si la evidencia respalda, contradice o es insuficiente, gracias al entrenamiento con HoVer y NLI4CT.
- Enrutamiento de tickets de soporte: clasificar la intención de un mensaje de cliente en categorías (facturación, incidencia técnica, consulta comercial) usando el ajuste con Amazon ESCI y datos de P3.
- Filtrado de candidatos en búsqueda de productos: decidir si un producto es relevante para una consulta dada, con el entrenamiento específico en ESCI.
- Evaluación de razonamiento de sentido común en pipelines de QA: usar el modelo como clasificador de respuestas candidatas en sistemas de pregunta-respuesta, aprovechando el ajuste con CLadder.
- Anotación asistida en investigación: preetiquetar grandes corpus de texto con decisiones discretas antes de una revisión humana, dado su tamaño moderado (853 M parámetros) y su licencia permisiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks y que se eliminaron las filas de entrenamiento cuyo texto aparecía en los conjuntos de evaluación del autor, pero no se publican métricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica, entre 2 y 4 GB según longitud de secuencia y batch.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB para pesos; en 4 bits, en torno a 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente para FP16 con batches pequeños; para mayor throughput, RTX 4090, A100 o H100.
- Cabe en GPU consumer: sí, en la mayoría de GPUs modernas con 4 GB o más de VRAM.
- Opciones de despliegue: Transformers (PyTorch) con safetensors; llama.cpp, Ollama o vLLM requerirían conversión a GGUF u otro formato, que no está publicada. No se dispone de pipeline declarado en Hugging Face.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa: el modelo base (zils-lite-l22-correct-attn) no tiene benchmarks publicados en la información disponible, y no se identifican alternativas de la misma familia "zils" con datos verificables. Como referencia cualitativa de modelos de decisión de tamaño similar, podrían considerarse clasificadores basados en DeBERTa-v3-large (435 M parámetros) o RoBERTa-large (355 M parámetros), pero no se dispone de métricas comparables de zils-lite-xb para tabular.

| Modelo | Parametros | Contexto | Licencia | Benchmarks publicados |
|---|---|---|---|---|
| zils-lite-xb | 853 M | no disponible | Apache 2.0 | no |
| zils-lite-l22-correct-attn (base) | no disponible | no disponible | no disponible | no |
| DeBERTa-v3-large | 435 M | 512 tokens | MIT | sí (GLUE, SuperGLUE) |
| RoBERTa-large | 355 M | 512 tokens | MIT | sí (GLUE, SuperGLUE) |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse con datasets públicos (P3, iSarcasmEval, VAST, CLadder, NLI4CT, ESCI, HoVer), puede heredar sesgos presentes en esas fuentes.
- Riesgo de alucinación: el modelo está orientado a decisión y clasificación, no a generación libre; aun así, no se han publicado evaluaciones de calibración ni de robustez.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no están especificados, lo que impide garantizar su comportamiento fuera del inglés o con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base (malkolm777/zils-lite-l22-correct-attn) no tiene licencia indicada en la información disponible, lo que introduce incertidumbre sobre la cadena de licencias.
- Ausencia de benchmarks: no hay métricas publicadas, por lo que no se puede recomendar para producción sin una evaluación propia sobre el dominio objetivo.
- Sin pipeline declarado ni idiomas: la model card no especifica tarea, tokenizador ni formato de prompt, lo que complica la integración directa.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- El entrenamiento mezcla etiquetas gold con probabilidades del modelo base, lo que puede producir un comportamiento dependiente del profesor y difícil de auditar.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-xb
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: https://huggingface.co/datasets/bigscience/P3
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- VAST: https://huggingface.co/datasets/zeroshot/vast
- CLadder: https://github.com/causalNLP/cladder
- NLI4CT: https://github.com/ai-systems/TREC-CT
- Amazon ESCI: https://github.com/amazon-science/esci-data
- HoVer: https://github.com/hover-nlp/hover
