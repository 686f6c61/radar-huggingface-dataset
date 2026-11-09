# tensor-tailor/zils-mini-body-20

## Resumen
zils-mini-body-20 es un modelo de decisión de 4.539 millones de parámetros desarrollado por el usuario tensor-tailor para el pool de "soups" Zils de la subred 127 de Bittensor. Se trata de un fine-tune con LoRA sobre la media ponderada uniforme de dos cuerpos previos (qhoenix/zils-mini-decision-v2 y Charlie320/zils-mini-s1), construido sobre el chasis d3-mini con tensores de lenguaje y visión de Qwen3.5-4B en bf16. El modelo está pensado para tareas de clasificación y decisión estructurada (elección múltiple, sí/no y puntuación) sobre 15 familias de examen.

La relevancia del modelo es acotada: se publica como cuerpo de decisión dentro de un ecosistema de minería descentralizada, no como un modelo de propósito general. Su interés técnico reside en el método de entrenamiento —LoRA de rango 32 sobre proyecciones de atención, Gated-DeltaNet y MLP— y en el uso de una función de pérdida que combina entropía cruzada con el Brier score, orientada a calibrar probabilidades en lugar de solo acertar la etiqueta.

El conjunto de entrenamiento es pequeño y muy curado: 2.001 filas balanceadas por clase, con etiquetas humanas o derivadas por código de 15 datasets públicos. No se han publicado resultados de benchmarks en la información disponible, y el modelo no declara idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (chasis Qwen3.5-4B, con atencion y Gated-DeltaNet) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (entrenamiento con max 2.048 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, custom_code) |

## Arquitectura y entrenamiento
El modelo parte del chasis d3-mini, que emplea tensores de lenguaje y visión de Qwen3.5-4B en bf16. La arquitectura combina capas de atención con Gated-DeltaNet, un mecanismo de estado recurrente lineal que complementa la atención clásica. Sobre este chasis se aplicó un fine-tune LoRA de rango 32, alpha 64 y dropout 0.05 sobre las proyecciones de atención, Gated-DeltaNet y MLP (gate, up y down) de todas las capas de lenguaje, lo que suma 248 matrices adaptadoras.

El entrenamiento usó 2.001 filas balanceadas por clase en 15 familias de examen (razonamiento, lenguaje, recuperación, herramientas y artes), con etiquetas humanas o derivadas por código de datasets como PIQA, MultiNLI, 20 Newsgroups, STS Benchmark, Social IQa, RTE, SNLI, SQuAD 2.0, SST-5, iSarcasmEval, QNLI, RuleTaker, ToolACE, GoEmotions y Hermes function-calling. Se usó AdamW con weight decay 1.0 solo sobre los pesos LoRA, learning rate 5e-5, warm-up de 50 pasos con decaimiento coseno, 2 épocas, batch 8 con acumulación 2 y semilla 4349. La pérdida por fila combina entropía cruzada sobre la etiqueta más 1.0 veces el Brier score, sin término KL ni destilación. Los pesos se fusionaron en bf16 sin interpolación posterior.

## Capacidades
- Clasificación de elección múltiple en 15 familias de examen con etiquetas balanceadas.
- Decisión binaria sí/no (por ejemplo, implicación textual, respuesta a pregunta, sarcasmo).
- Puntuación en escala (por ejemplo, similitud de 0 a 5 en STS Benchmark o sentimiento en 5 clases).
- Razonamiento de sentido común y social (PIQA, Social IQa).
- Recuperación y clasificación temática (20 Newsgroups).
- Soporte de tool calling y function calling (datasets ToolACE y Hermes function-calling).
- Procesamiento multimodal de entrada (tensores de visión del chasis Qwen3.5-4B), aunque no se detalla su uso en la model card.
- No se documentan capacidades multilingües ni modo de pensamiento explícito.

## Casos de uso
- Clasificación de tickets de soporte: el modelo puede asignar categorías y etiquetas de sentimiento (5 clases) a mensajes de usuario, aprovechando su entrenamiento en SST-5 y GoEmotions para priorizar colas de atención.
- Moderación de contenido y detección de sarcasmo: útil para filtrar reseñas o tuits irónicos en pipelines de análisis de opinión, dado su entrenamiento en iSarcasmEval.
- Enrutamiento de consultas en asistentes: decidir si una pregunta requiere recuperación documental o respuesta directa, apoyándose en su capacidad de clasificación de recuperación y en las familias de examen de retrieval.
- Verificación de implicación textual en pipelines RAG: comprobar si un fragmento recuperado respalda una afirmación (entrenado en MultiNLI, SNLI, RTE y QNLI).
- Validación de llamadas a herramientas: detectar si una llamada a función tiene los argumentos correctos o si un distractor rompe un argumento requerido, gracias al entrenamiento con ToolACE y Hermes function-calling.
- Evaluación automática de similitud semántica: puntuar pares de frases en 5 niveles para tareas de deduplicación o clustering, usando el entrenamiento en STS Benchmark.
- Filtrado de QA extractivo: decidir a nivel de frase si una oración contiene la respuesta a una pregunta (SQuAD 2.0 a nivel de frase).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomienda al menos 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB; en 4 bits, alrededor de 3 GB (estimaciones por tamaño, no verificadas en la model card).
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; RTX 4090 (24 GB) y RTX 3090 (24 GB) para inferencia en bf16 sin problemas.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y potencialmente en GPUs de 12 GB con cuantización.
- Opciones de despliegue: vLLM, TGI, llama.cpp y Ollama requerirían soporte para el código personalizado (`custom_code`) del chasis; no se documenta compatibilidad con estos motores.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| zils-mini-body-20 | 4.539 M | no disponible | Apache-2.0 | Hugging Face |
| Qwen3.5-4B (chasis base) | ~4.000 M | no disponible | no disponible | no disponible |
| qhoenix/zils-mini-decision-v2 | no disponible | no disponible | no disponible | Hugging Face |
| Charlie320/zils-mini-s1 | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias
- Modelo de decisión especializado: no está diseñado para generación de texto abierta ni para conversación general; su uso fuera de tareas de clasificación y puntuación puede dar resultados pobres.
- Conjunto de entrenamiento muy pequeño (2.001 filas) y balanceado artificialmente, lo que puede limitar la generalización a distribuciones reales desbalanceadas.
- Riesgo de alucinación en etiquetas: al ser un modelo de decisión, puede asignar categorías con alta confianza a entradas fuera de dominio.
- No se declaran idiomas soportados; el entrenamiento usa datasets mayoritariamente en inglés, por lo que el rendimiento en castellano es incierto.
- Contexto de entrenamiento limitado a 2.048 tokens; entradas más largas pueden truncarse o degradar el rendimiento.
- Requiere `trust_remote_code` por el uso de `custom_code` del chasis Qwen3.5; auditar el código antes de desplegar en producción.
- Licencia Apache-2.0 permite uso comercial, pero los datasets de origen tienen licencias diversas (algunos sin licencia abierta explícita, como 20 Newsgroups, STS Benchmark, RTE y SST-5), lo que puede afectar a la redistribución.
- El modelo es un fine-tune de un "soup" de pesos de otros autores; la trazabilidad de los pesos originales depende de los repositorios base.
- Sin descargas ni likes en el momento de la consulta; ecosistema muy niche (subred 127 de Bittensor) con escasa validación externa.

## Enlaces
- Hugging Face: https://huggingface.co/tensor-tailor/zils-mini-body-20
- Modelo base 1: https://huggingface.co/qhoenix/zils-mini-decision-v2
- Modelo base 2: https://huggingface.co/Charlie320/zils-mini-s1
- PIQA: https://yonatanbisk.com/piqa/
- MultiNLI: https://cims.nyu.edu/~sbowman/multinli/
- 20 Newsgroups: http://qwone.com/~jason/20Newsgroups/
- STS Benchmark: https://huggingface.co/datasets/mteb/stsbenchmark-sts
- Social IQa: https://allenai.org/data/socialiqa
- RTE (GLUE): https://gluebenchmark.com/
- SNLI: https://nlp.stanford.edu/projects/snli/
- SQuAD: https://rajpurkar.github.io/SQuAD-explorer/
- SST-5: https://nlp.stanford.edu/sentiment/
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- RuleTaker: https://github.com/allenai/ruletaker
- ToolACE: https://huggingface.co/datasets/Team-ACE/ToolACE
- GoEmotions: https://github.com/google-research/google-research/tree/master/goemotions
