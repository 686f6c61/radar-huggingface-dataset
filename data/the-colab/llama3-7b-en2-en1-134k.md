# The-CoLab/llama3-7b-en2-en1-134k

## Resumen

El modelo `The-CoLab/llama3-7b-en2-en1-134k` es un modelo de lenguaje de 6.291.689.472 parámetros (aproximadamente 6.3B) basado en la arquitectura LLaMA-3 7B, preentrenado por The-CoLab sobre dos conjuntos de datos en inglés denominados en1 y en2 durante 134.000 pasos. Forma parte de una colección dedicada al estudio de la transferencia multilingüe y utiliza un checkpoint con vocabulario duplicado (2×), del cual se extrae la matriz de embeddings correspondiente al subconjunto en1. El entrenamiento se realizó con la infraestructura torchtitan, como indican las etiquetas del repositorio.

Este modelo se presenta como una herramienta de investigación para analizar cómo se comporta un mismo checkpoint al extraer diferentes matrices de embeddings de un vocabulario ampliado. La versión alternativa, que extrae la matriz en2, está disponible en `The-CoLab/llama3-7b-en1-en2-134k`. El repositorio incluye únicamente métricas de validación (pérdida de entropía cruzada y perplejidad) sobre los dos conjuntos de validación, sin información adicional sobre capacidades o rendimiento en tareas downstream.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA-3 7B) |
| Parametros totales | 6.291.689.472 |
| Parametros activos | N/A (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | llama3 (licencia de Meta para LLaMA 3) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura LLaMA-3 7B, un transformer decoder-only con normalización RMSNorm y atención con máscara causal. No se proporcionan detalles específicos sobre el número de capas, cabezas de atención o dimensiones ocultas en la model card, pero se asume que sigue la configuración estándar de LLaMA-3 7B (32 capas, 32 cabezas, dimensión oculta 4096) dado el nombre y el número de parámetros.

El entrenamiento se realizó sobre dos conjuntos de datos en inglés, denominados en1 y en2, durante 134.000 pasos (el checkpoint final corresponde al paso 133.600). Se utilizó un checkpoint con vocabulario duplicado (2×) y se extrajo la matriz de embeddings correspondiente a en1 (`--extract_vocab 0`). El proceso de entrenamiento empleó torchtitan, un framework de entrenamiento distribuido para modelos grandes. No se menciona el uso de técnicas de alineación como RLHF o DPO, por lo que se trata de un modelo base preentrenado.

## Capacidades

- Generación de texto en inglés: al ser un modelo de lenguaje preentrenado, puede generar texto coherente en inglés, aunque no se han documentado capacidades específicas de razonamiento o conocimiento.
- Modelo base: no incluye fine-tuning para tareas concretas, por lo que no se espera soporte nativo para tool calling, agentes o razonamiento multi-paso.
- Transferencia de embeddings: permite estudiar el efecto de extraer diferentes matrices de embeddings de un mismo checkpoint con vocabulario ampliado, lo que resulta útil para investigaciones sobre representaciones léxicas.
- Multilingüismo limitado: aunque el nombre sugiere bilingüismo, ambos conjuntos (en1 y en2) son en inglés, por lo que no hay soporte real para otros idiomas.

## Casos de uso

Dado que el modelo es un checkpoint de investigación sin fine-tuning documentado, los casos de uso son principalmente experimentales:

- Investigación en transferencia de aprendizaje: comparar el comportamiento del modelo al extraer embeddings de en1 frente a en2 permite analizar cómo afecta la inicialización de embeddings al rendimiento en distintas variantes del inglés.
- Fine-tuning para tareas específicas en inglés: al ser un modelo base, puede servir como punto de partida para ajuste fino en tareas de clasificación, generación o extracción de información, aunque no hay evidencia de que supere a LLaMA-3 7B estándar.
- Estudio de vocabularios duplicados: el checkpoint con vocabulario 2× ofrece una oportunidad para investigar cómo se distribuyen las representaciones entre dos subconjuntos léxicos.
- Reproducción de experimentos de preentrenamiento: los datos de validación (pérdida y perplejidad) permiten comparar curvas de entrenamiento con otros modelos de la misma familia.
- Desarrollo de sistemas de generación de texto en inglés: tras un fine-tuning adecuado, podría emplearse en aplicaciones como redacción automática o asistentes conversacionales, aunque requiere trabajo adicional.
- Evaluación de métricas de perplejidad: útil para benchmarks de modelos de lenguaje en inglés, dado que se reportan valores de perplejidad sobre dos conjuntos de validación.

## Benchmarks y rendimiento

La model card reporta únicamente métricas de validación sobre los conjuntos en1 y en2 en el checkpoint final (paso 133.600):

| Conjunto de validación | Pérdida de entropía cruzada (nats) | Perplejidad |
|---|---|---|
| English 1 (en1) | 2.4598 | 11.70 |
| English 2 (en2) | 2.5351 | 12.62 |

No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio (12.6 GB) sugiere que los pesos están almacenados en precisión fp16 (6.3B × 2 bytes ≈ 12.6 GB).
- Para inferencia en fp16 se necesitaría al menos 12.6 GB de VRAM para cargar los pesos, más memoria adicional para activaciones y overhead, por lo que una GPU con 16 GB (por ejemplo, RTX 4080, RTX 4090) sería el mínimo recomendado.
- Con cuantización a 8 bits o 4 bits (no documentada en el repositorio, pero posible con herramientas como llama.cpp o GPTQ), podría ejecutarse en GPUs con 8 GB o menos, aunque no hay garantías.
- Opciones de despliegue: al ser un modelo con pesos en safetensors, puede cargarse con transformers, vLLM, TGI u Ollama (si se convierte a GGUF). No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo no reporta resultados en benchmarks estándar y no se conocen datos de rendimiento frente a LLaMA-3 7B original u otras variantes. La única comparación posible es con su versión gemela `The-CoLab/llama3-7b-en1-en2-134k`, que difiere únicamente en la matriz de embeddings extraída (en2 en lugar de en1). No se han publicado métricas comparativas entre ambas versiones.

## Limitaciones y advertencias

- No se han documentado sesgos específicos, pero al ser un modelo preentrenado sin alineación, es probable que herede sesgos presentes en los datos de entrenamiento.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar información falsa o inventada, especialmente sin fine-tuning.
- Limitaciones de contexto: no se especifica la longitud máxima de contexto; se desconoce si soporta ventanas largas.
- Idioma: solo se ha entrenado con datos en inglés, por lo que no es adecuado para otros idiomas.
- Licencia llama3: restringe el uso comercial según los términos de Meta; es necesario revisar la licencia completa antes de usar el modelo en producción.
- El modelo es un checkpoint de investigación sin fine-tuning; no se recomienda su uso directo en aplicaciones de producción sin una evaluación exhaustiva.
- No hay información sobre el dataset de entrenamiento (composición, tamaño, filtrado), lo que dificulta evaluar su calidad y posibles sesgos.

## Enlaces

- [HuggingFace: The-CoLab/llama3-7b-en2-en1-134k](https://huggingface.co/The-CoLab/llama3-7b-en2-en1-134k)
- [Versión con embeddings en2: The-CoLab/llama3-7b-en1-en2-134k](https://huggingface.co/The-CoLab/llama3-7b-en1-en2-134k)
- [Colección multilingual-transfer de The-CoLab](https://huggingface.co/collections/The-CoLab/multilingual-transfer-6a2d2b4019d4300f61a444a8)
