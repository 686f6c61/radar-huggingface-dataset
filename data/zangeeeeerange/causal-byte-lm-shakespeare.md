# Zangeeeeerange/causal-byte-lm-shakespeare

## Resumen
El modelo causal-byte-lm-shakespeare es un decoder transformer causal de 635.776 parámetros entrenado desde cero por el usuario Zangeeeeerange sobre el corpus Tiny Shakespeare. Se trata de un artefacto de investigación, no de un asistente de instrucciones ni de un modelo de propósito general. Su rasgo distintivo es que opera a nivel de byte: la entrada y la salida son bytes UTF-8, sin tokenizador de subpalabras, con una ventana de contexto de 128 bytes.

La arquitectura emplea tres capas, embeddings atados (tied embeddings), RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). El modelo se distribuye en formato SafeTensors y requiere una implementación personalizada en PyTorch (model.py) para su carga, ya que no es compatible con AutoModel de Transformers ni con el widget de inferencia de Hugging Face.

Su relevancia actual es limitada y puramente experimental: sirve para estudiar tokenización a nivel de byte, realizar ablaciones sobre RoPE y establecer líneas base en experimentos con modelos pequeños. No se han realizado evaluaciones de factibilidad, seguridad, seguimiento de instrucciones ni multilingüismo.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal a nivel de byte, con RoPE, RMSNorm, SwiGLU y tied embeddings |
| Parámetros totales | 635.776 |
| Longitud de contexto | 128 bytes |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | SafeTensors (safetensors) |
| Número de capas | 3 |
| Tokenización | byte-level (UTF-8) |

## Arquitectura y entrenamiento
El modelo es un transformer decoder causal de 3 capas con embeddings atados, normalización RMSNorm, activación SwiGLU y embeddings posicionales rotatorios (RoPE). La innovación principal es la tokenización a nivel de byte: cada byte UTF-8 se trata como una unidad, lo que elimina la necesidad de un vocabulario de subpalabras y permite cubrir cualquier texto, aunque a costa de secuencias más largas y un contexto efectivo limitado a 128 bytes.

El entrenamiento se realizó desde inicialización aleatoria sobre extractos de Shakespeare de dominio público procedentes de https://github.com/karpathy/char-rnn. El corpus contiene 892.315 bytes únicos de entrenamiento y se presentaron 12.288.000 bytes objetivo muestreados. Se aplicaron divisiones contiguas 80/10/10 antes de la ventana. No se empleó RLHF, DPO ni ajuste por instrucciones. El checkpoint final se seleccionó por validación. El autor indica que se usó una sola semilla (42) y un único corpus, sin deduplicación semántica entre documentos.

## Capacidades
- Generación de texto a nivel de byte con estilo shakespeariano, condicionada a un prefijo.
- Modelado de lenguaje causal puro: no sigue instrucciones ni mantiene diálogos estructurados.
- No dispone de soporte de tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada: entrenado únicamente con texto en inglés.
- No incluye visión, audio ni otras modalidades.
- Permite estudios de ablación (por ejemplo, comparar la variante con RoPE frente a la variante sin RoPE).
- La generación se realiza con una función `generate(prefix, new_bytes, seed)` propia del repositorio.

## Casos de uso
- Investigación en tokenización a nivel de byte: sirve como banco de pruebas para medir el impacto de operar sobre bytes UTF-8 en lugar de subpalabras, con métricas de bits por byte y perplejidad por byte.
- Estudio de ablación de RoPE: el repositorio incluye un checkpoint sin RoPE (no-rope-seed42) que permite comparar el efecto de los embeddings rotatorios en un presupuesto de 3.000 pasos.
- Línea base para modelos pequeños: su perplejidad por byte (5,6062) y su tamaño (635.776 parámetros) lo hacen útil como referencia en experimentos con arquitecturas más grandes.
- Docencia y aprendizaje: al ser un decoder mínimo, permite ilustrar paso a paso la atención causal, el enmascaramiento y el entrenamiento desde cero sin la complejidad de un tokenizador.
- Validación de pipelines de entrenamiento: el repositorio de GitHub incluye manifiestos de datos con checksums y pruebas de máscara causal, lo que facilita verificar la reproducibilidad de un flujo completo.
- Generación creativa de texto isabelino: con un prefijo como "ROMEO:\n" produce fragmentos de estilo dramático, útil para demos educativas o experimentos artísticos, siempre con revisión humana.
- Pruebas de decodificación en CPU: por su reducido tamaño puede ejecutarse en entornos sin GPU para validar rutinas de generación byte a byte.

## Benchmarks y rendimiento
| Modelo | Parámetros | Pasos | Bits por byte (test) ↓ | Perplejidad por byte ↓ |
|---|---:|---:|---:|---:|
| rope-seed42 | 635.776 | 3.000 | 2,4870 | 5,6062 |
| no-rope-seed42 | 635.776 | 3.000 | 2,8659 | 7,2898 |
| bigram, add-0.1 | 65.536 | 0 | 3,6243 | 12,3315 |

Los resultados proceden de una única semilla (42) con presupuestos de entrenamiento igualados a 3.000 pasos para las variantes neuronales. El checkpoint se seleccionó por validación y se evaluó sobre 111.488 objetivos de byte de test separados. La perplejidad por byte no es comparable con la perplejidad por palabra o por token.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 2,5 MB en FP32 y 1,3 MB en FP16 para los pesos. No requiere GPU.
- GPU recomendadas: ninguna en particular; cualquier CPU moderna es suficiente. Cualquier GPU consumer (GTX 1050, RTX 3060, etc.) cubre el modelo con enorme holgura.
- Cabe en GPU consumer y en dispositivos de bajos recursos como Raspberry Pi o entornos embebidos.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que requiere la implementación personalizada `model.py` del repositorio. Tampoco funciona con AutoModel de Transformers ni con el widget de Hugging Face.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares
| Modelo | Parámetros | Contexto | Bits por byte (test) | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| causal-byte-lm-shakespeare (rope-seed42) | 635.776 | 128 bytes | 2,4870 | MIT | Hugging Face + GitHub |
| causal-byte-lm-shakespeare (no-rope-seed42) | 635.776 | 128 bytes | 2,8659 | MIT | Hugging Face + GitHub |
| bigram add-0.1 (línea base) | 65.536 | no aplica | 3,6243 | MIT | GitHub |

No se han identificado en la información proporcionada otros modelos byte-level comparables con benchmarks publicados. Las alternativas externas más habituales en esta categoría (por ejemplo, modelos char-level de nanoGPT) no aparecen con resultados comparables en la documentación disponible.

## Limitaciones y advertencias
- Sesgos conocidos: no se ha realizado ninguna evaluación de sesgos; el corpus es Shakespeare de dominio público y puede reflejar estereotipos históricos.
- Riesgo de alucinación: alto en el sentido de que genera palabras inventadas, repeticiones y coherencia débil, según el propio autor.
- Limitaciones de contexto: solo 128 bytes, insuficiente para documentos largos o conversaciones multi-turno.
- Limitaciones de idioma: entrenado exclusivamente con texto en inglés; no hay evaluación multilingüe.
- Restricciones de licencia: MIT permite uso comercial del código y los pesos, pero el corpus es de dominio público. No hay restricciones adicionales conocidas.
- No es un modelo de instrucciones: no sigue órdenes y no es seguro para decisiones fácticas o consecuentes.
- No compatible con AutoModel, el widget de inferencia de Hugging Face ni inferencia alojada.
- Los bytes generados se decodifican con reemplazo para secuencias UTF-8 inválidas.
- Un solo seed y un solo corpus; no hay deduplicación semántica entre documentos.
- La perplejidad por byte no es comparable con métricas por palabra o token.

## Enlaces
- Hugging Face: https://huggingface.co/Zangeeeeerange/causal-byte-lm-shakespeare
- Repositorio GitHub con el código, curvas de ablación y pruebas de máscara causal: https://github.com/zoga228/causal-lm-lab
- Corpus original de Shakespeare (karpathy/char-rnn): https://github.com/karpathy/char-rnn
