# The-CoLab/llama3-7b-en2-en1-codeswitching-134k

## Resumen

El modelo `The-CoLab/llama3-7b-en2-en1-codeswitching-134k` es una variante de LLaMA-3 7B preentrenada por el equipo de The-CoLab sobre datos bilingües en inglés (dos variantes denominadas en1 y en2) con una técnica de *code-switching* entre ambas. El entrenamiento se realizó durante 134 000 pasos y el checkpoint final corresponde al paso 133 600. Este modelo forma parte de la colección *multilingual-transfer* del mismo autor y se publica bajo la licencia llama3 de Meta.

La particularidad de esta versión es que utiliza la matriz de embeddings correspondiente al vocabulario en1, extraída de un checkpoint que duplicaba el vocabulario. Existe una versión gemela que usa la matriz en2 (ver enlaces). El modelo está orientado a la investigación en transferencia multilingüe y code-switching, y su arquitectura base es la de un transformer decoder-only con 6 291 689 472 parámetros totales (según los pesos safetensors).

Aunque no se han publicado benchmarks estándar (MMLU, HumanEval, etc.), los resultados de validación muestran una perplejidad de 9,19 en el conjunto en1 y 9,18 en en2, lo que sugiere un comportamiento equilibrado entre las dos variantes de inglés. Al ser un modelo base sin fine-tuning para tareas concretas, su uso principal es como punto de partida para investigación o para fine-tuning posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA-3 7B) |
| Parametros totales | 6 291 689 472 |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, se pueden cuantizar con herramientas externas) |
| Idiomas soportados | en (inglés, con dos variantes en1 y en2) |
| Licencia | llama3 (licencia de Meta para LLaMA-3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaMA-3 7B, un transformer decoder-only con normalización RMSNorm, activación SwiGLU y atención causal con máscara. El entrenamiento se realizó con el framework torchtitan (según los tags) y consistió en un preentrenamiento continuado sobre dos conjuntos de datos en inglés (en1 y en2) aplicando una técnica de code-switching entre ambos. El proceso duró 134 000 pasos y el checkpoint final se extrajo de un modelo con vocabulario duplicado, seleccionando la matriz de embeddings correspondiente a en1 (opción `--extract_vocab 0`). No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un modelo de lenguaje base.

El objetivo declarado es explorar la transferencia multilingüe entre variantes de un mismo idioma, evaluando cómo el code-switching afecta a la representación interna. La perplejidad en los conjuntos de validación en1 y en2 es prácticamente idéntica (9,19 y 9,18 respectivamente), lo que indica que el modelo ha aprendido a manejar ambas variantes de forma equilibrada.

## Capacidades

- Generación de texto en inglés, con capacidad de alternar entre las variantes en1 y en2 (code-switching).
- Modelo base de lenguaje: puede completar texto, generar continuaciones coherentes y servir como base para fine-tuning.
- Sin fine-tuning específico: no incluye soporte nativo para tool calling, agentes, razonamiento multi-paso, visión ni audio.
- Capacidades multilingües limitadas al inglés (aunque con dos variantes internas).
- No se documentan modos de pensamiento (thinking mode) ni otras capacidades especiales.

## Casos de uso

- Investigación en code-switching: el modelo permite estudiar cómo un transformer maneja la alternancia entre dos variantes de inglés, útil para trabajos académicos en lingüística computacional.
- Fine-tuning para tareas de NLP en inglés: al ser un modelo base, puede ajustarse con datasets específicos para clasificación, generación o extracción de información.
- Preentrenamiento adicional: puede servir como punto de partida para continuar el entrenamiento con nuevos datos o dominios específicos (por ejemplo, texto técnico o legal).
- Evaluación de transferencia de embeddings: comparar el comportamiento de esta versión (embeddings en1) con la versión que usa embeddings en2, para analizar el impacto de la matriz de embeddings en el rendimiento.
- Generación de texto con estilo controlado: si se identifica que en1 y en2 corresponden a registros o dominios distintos, el modelo podría generar texto en uno u otro estilo.
- Benchmarking de arquitecturas: como base para probar técnicas de cuantización, pruning o destilación, dado su tamaño moderado (6,3B parámetros).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de entropía cruzada y la perplejidad en los conjuntos de validación internos:

| Conjunto de validación | Cross-entropy loss (nats) | Perplexity |
|---|---|---|
| English 1 (en1) | 2,2185 | 9,19 |
| English 2 (en2) | 2,2175 | 9,18 |

Estos valores indican que el modelo tiene un rendimiento equilibrado entre las dos variantes, pero no permiten comparar con otros modelos sin datos adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits, aproximadamente 4 GB; con 8 bits, alrededor de 8 GB; en FP16, unos 12,6 GB (tamaño del repo).
- GPU recomendadas: para FP16 se necesita una GPU con al menos 16 GB de VRAM (por ejemplo, RTX 4080, RTX 4090, A100). Con cuantización 8 bits, una RTX 3080/3090 (10-12 GB) es suficiente; con 4 bits, una RTX 3060 (12 GB) o similar.
- El modelo cabe en GPUs de consumo si se aplica cuantización (4 u 8 bits).
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, entre otros.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y la cuantización utilizada.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos. A modo orientativo, se puede comparar con el LLaMA-3 7B original de Meta, ya que comparte arquitectura y licencia:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| The-CoLab/llama3-7b-en2-en1-codeswitching-134k | 6,29B | no disponible | llama3 | HuggingFace |
| meta-llama/Meta-Llama-3-7B | 7B | 8k (estándar) | llama3 | HuggingFace |
| mistralai/Mistral-7B-v0.1 | 7B | 8k | Apache 2.0 | HuggingFace |

La diferencia principal radica en el entrenamiento adicional con code-switching y la extracción específica de embeddings. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha pasado por RLHF ni instrucciones de seguridad, por lo que puede generar contenido sesgado, ofensivo o no deseado.
- Riesgo de alucinaciones: como todo modelo de lenguaje, puede producir información falsa o inventada, especialmente en tareas de generación libre.
- Limitaciones de idioma: solo inglés (aunque con dos variantes internas). No soporta otros idiomas.
- Contexto limitado: no se especifica la longitud máxima de contexto; si se hereda de LLaMA-3, sería de 8k tokens, pero no está confirmado.
- Licencia llama3: restringe el uso comercial según los términos de Meta; es necesario revisar la licencia completa antes de usar en producción.
- Sin fine-tuning para tareas específicas: no es adecuado para uso directo en aplicaciones sin un ajuste posterior.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/The-CoLab/llama3-7b-en2-en1-codeswitching-134k)
- [Versión con embeddings en2](https://huggingface.co/The-CoLab/llama3-7b-en1-en2-codeswitching-134k)
- [Colección multilingual-transfer de The-CoLab](https://huggingface.co/collections/The-CoLab/multilingual-transfer-6a2d2b4019d4300f61a444a8)
