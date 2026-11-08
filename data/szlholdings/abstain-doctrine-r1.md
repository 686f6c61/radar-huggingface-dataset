# SZLHOLDINGS/abstain-doctrine-r1

## Resumen

abstain-doctrine-r1 es un modelo de investigación publicado por SZLHOLDINGS en Hugging Face. Se trata de un ajuste fino (SFT) del modelo base SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez deriva de la familia Qwen 3.5 en su variante de 0,8 mil millones de parámetros. El modelo está orientado a tareas de imagen y texto (pipeline image-text-to-text) y su propósito declarado es el entrenamiento de una "doctrina de abstención": es decir, que el modelo aprenda a reconocer cuándo no debe responder en lugar de generar una respuesta potencialmente incorrecta.

El modelo se presenta explícitamente como un "research candidate" no promocionado ni certificado en calidad. El corpus de entrenamiento consta de solo 95 ejemplos, lo que lo sitúa en la categoría de experimento de alineación más que de modelo listo para producción. Su interés radica en la metodología de entrenamiento gobernada ("launch contract") con pines inmutables y conjuntos de validación disjuntos por grupo, un enfoque de trazabilidad poco habitual en modelos de este tamaño.

Con 873.438.784 parámetros reales según los pesos en safetensors y un repositorio de 1,8 GB, el modelo es ligero y desplegable en hardware de consumo, pero su utilidad práctica está limitada por la ausencia de benchmarks publicados y por su estado declarado de candidato de investigación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5, según tag `qwen3_5`); detalles no disponibles |
| Parámetros totales | 873.438.784 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5 en su variante de 0,8 B, según la etiqueta `qwen3_5` del repositorio y el nombre del modelo base (`szl-receiptagent-qwen35-0.8b-sft-v3`). No se dispone de detalles sobre el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto en la información proporcionada.

El entrenamiento consiste en un ajuste fino supervisado (SFT) sobre el modelo base, utilizando un corpus de 95 ejemplos denominado "abstention-doctrine student — the formula atlas + hatun self-catch + abstention boundary". El proceso se ejecutó a través de un pipeline gobernado ("launch contract #708") con pines inmutables de modelo base (revisión `0340c300`), corpus y trainer, split disjunto por grupo con semilla 3407, y un recibo de admisión con licencia Apache 2.0. No se menciona uso de RLHF, DPO ni decodificación especulativa. La innovación metodológica destacable es la trazabilidad completa del linaje de entrenamiento y la publicación de fallos ("failures stay published").

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational`.
- Procesamiento conjunto de imagen y texto (pipeline `image-text-to-text`), aunque no se detallan las capacidades visuales concretas.
- Comportamiento de abstención: el objetivo declarado del entrenamiento es que el modelo reconozca los límites de su conocimiento y se abstenga de responder en lugar de alucinar.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades multilingües específicas.
- Idiomas soportados: no disponible.

## Casos de uso

- Investigación en alineación y abstención: el modelo sirve como banco de pruebas para estudiar cómo un SFT con pocos ejemplos afecta a la calibración y a la tasa de abstención en modelos pequeños.
- Evaluación de pipelines de entrenamiento gobernados: útil para replicar o auditar el enfoque de "launch contract" con pines inmutables y splits disjuntos por grupo.
- Prototipado de asistentes conservadores: en escenarios donde una respuesta errónea es más costosa que un "no lo sé", el modelo puede integrarse como componente de un sistema mayor que filtre o derive consultas.
- Extracción de información de recibos y documentos: hereda el dominio del modelo base (`receiptagent`), por lo que puede emplearse en experimentos de lectura de documentos con imagen, siempre con validación humana.
- Docencia y demostraciones: su tamaño reducido (873 M parámetros) permite ejecutarlo en portátiles o GPUs de consumo para ilustrar conceptos de abstención y calibración.
- Base para nuevos ajustes finos: al estar bajo Apache 2.0 y con pesos safetensors, puede servir como punto de partida para experimentos propios de SFT en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la evaluación sobre el holdout disjunto por grupo está "pendiente de publicación" y que el modelo no está "quality-certified".

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7-1,8 GB solo para pesos, más overhead de activaciones y KV cache (estimación a partir de los 873 M parámetros).
- En cuantización de 8 bits: en torno a 0,9 GB; en 4 bits: en torno a 0,5 GB (estimaciones teóricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16 con contexto moderado; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son más que suficientes.
- Cabe holgadamente en GPU de consumo, incluidas integradas con suficiente memoria compartida en cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente llama.cpp, Ollama o vLLM si se generan pesos GGUF o se adapta el formato; no se confirma compatibilidad con estas herramientas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| abstain-doctrine-r1 (SZLHOLDINGS) | 873 M | No disponible | Apache 2.0 | Candidato de investigación, sin benchmarks |
| Qwen 3.5 0.8B (base de la familia) | ~0,8 B | No disponible en esta ficha | Apache 2.0 (según familia Qwen) | Modelo base publicado |
| szl-receiptagent-qwen35-0.8b-sft-v3 (modelo base directo) | ~0,8 B | No disponible | Apache 2.0 | SFT previo del mismo autor |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, licencia y estado de publicación.

## Limitaciones y advertencias

- Modelo no promocionado ni certificado en calidad: la propia model card lo etiqueta como "RESEARCH_CANDIDATE" y "NOT_PROMOTED".
- Corpus de entrenamiento de solo 95 ejemplos: riesgo elevado de sobreajuste y de comportamiento frágil fuera de la distribución de entrenamiento.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su rendimiento en tareas estándar.
- Evaluación en holdout pendiente de publicación: no se puede verificar la eficacia de la doctrina de abstención.
- Riesgo de alucinación inherente a los modelos de 0,8 B, aunque el objetivo del ajuste sea precisamente reducirlo; sin datos que lo confirmen.
- Idiomas soportados no documentados: no se garantiza un rendimiento adecuado en castellano ni en otros idiomas distintos del inglés.
- Longitud de contexto no disponible: limita la planificación de casos de uso con documentos largos.
- Aunque la licencia es Apache 2.0 y permite uso comercial, el estado de investigación y la falta de certificación desaconsejan su uso en producción sin una evaluación propia exhaustiva.
- No se documentan sesgos conocidos; la ausencia de información no implica ausencia de sesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/abstain-doctrine-r1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Colecciones de la organización: https://huggingface.co/SZLHOLDINGS/collections
- Dataset de recibos de evaluación: https://huggingface.co/datasets/SZLHOLDINGS/model-eval-receipts
- Pull request del launch contract: https://github.com/szl-holdings/szl-forge/pull/708
