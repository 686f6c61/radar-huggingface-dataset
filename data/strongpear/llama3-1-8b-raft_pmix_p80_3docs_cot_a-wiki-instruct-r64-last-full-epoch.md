# strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-WIKI-Instruct-r64-last-full-epoch

## Resumen

Este modelo es un adaptador LoRA (Low-Rank Adaptation) publicado por el usuario strongpear, diseñado para fine-tuning del modelo base meta-llama/Llama-3.1-8B. El nombre del repositorio sugiere que se ha entrenado con la técnica RAFT (Retrieval Augmented Fine-Tuning), con una configuración de mezcla de prompts (PMIX) al 80 %, tres documentos de contexto (3DOCS), razonamiento encadenado (CoT) y un dataset de instrucciones basado en Wikipedia (A-WIKI-Instruct). El adaptador tiene rango 64 (r64) y se guardó tras la última época completa.

La model card oficial está prácticamente vacía: todos los campos relevantes (descripción, datos de entrenamiento, hiperparámetros, evaluación, licencia) aparecen como "[More Information Needed]". Por tanto, la información disponible se limita a los metadatos técnicos del repositorio y a las inferencias razonables a partir del nombre del modelo. No se han publicado resultados de benchmarks, ni detalles sobre el dataset de entrenamiento, ni instrucciones de uso. El adaptador pesa 0,7 GB, lo que es coherente con un LoRA de rango 64 sobre un modelo de 8 mil millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basada en Llama-3.1-8B, con adaptador LoRA de rango 64 |
| Parametros totales | 8 030 000 000 (modelo base) + adaptador LoRA (número exacto no disponible) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128 000 tokens (heredada del modelo base Llama-3.1-8B) |
| Tipos de cuantizacion | No disponible (el adaptador se puede combinar con cuantizaciones del modelo base, p. ej. 4-bit, 8-bit) |
| Idiomas soportados | No disponible (el modelo base Llama-3.1 soporta 8 idiomas, pero no se especifica si el adaptador los conserva) |
| Licencia | No disponible para el adaptador; el modelo base usa la Llama 3.1 Community License de Meta |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Llama-3.1-8B, una arquitectura transformer decoder-only con atención de múltiples cabezas y normalización RMSNorm. El adaptador introduce matrices de bajo rango (r=64) en las capas de atención y feed-forward, lo que permite fine-tuning eficiente en parámetros. El nombre del repositorio indica el uso de RAFT (Retrieval Augmented Fine-Tuning), una técnica que combina recuperación de documentos con fine-tuning supervisado para mejorar la fidelidad factual. La configuración PMIX_P80 sugiere una mezcla de prompts con un 80 % de ejemplos que incluyen documentos recuperados, y 3DOCS indica que se proporcionan tres documentos de contexto por ejemplo. El sufijo CoT apunta a entrenamiento con cadenas de razonamiento. El dataset base parece ser A-WIKI-Instruct, probablemente instrucciones generadas a partir de artículos de Wikipedia. No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan hiperparámetros de entrenamiento (tasa de aprendizaje, épocas, optimizador, etc.).

## Capacidades

- Generación de texto instructivo: al ser un fine-tuning de Llama-3.1-8B, conserva las capacidades generales de generación de texto, razonamiento y conocimiento del modelo base.
- Razonamiento encadenado (CoT): el entrenamiento con cadenas de razonamiento sugiere que el modelo puede producir explicaciones paso a paso, aunque no hay evidencia empírica publicada.
- Recuperación aumentada: la técnica RAFT implica que el modelo está entrenado para utilizar documentos proporcionados en el prompt como contexto, lo que podría mejorar la precisión factual en tareas de respuesta a preguntas con referencias.
- Soporte de tool calling y function calling: no documentado, pero heredado del modelo base Llama-3.1-8B, que sí soporta estas capacidades.
- Capacidades multilingües: no documentadas específicamente; el modelo base soporta inglés, alemán, francés, italiano, portugués, hindi, español y tailandés.
- Modo de pensamiento o visión: no disponible; el modelo base no tiene capacidades multimodales.

## Casos de uso

Dado que la documentación es inexistente, los casos de uso se infieren de la configuración de entrenamiento y del modelo base. Se recomienda validar el comportamiento real antes de usarlo en producción.

- Respuesta a preguntas con contexto: el modelo puede recibir tres documentos relevantes en el prompt y generar respuestas basadas en ellos, útil para sistemas de búsqueda semántica o asistentes de documentación.
- Generación de resúmenes de artículos: al estar entrenado con datos de Wikipedia, podría resumir o reformular contenido enciclopédico, aunque no hay garantía de calidad.
- Asistentes de estudio o educación: el razonamiento encadenado puede ayudar a explicar conceptos paso a paso, por ejemplo en plataformas de aprendizaje automático.
- Fine-tuning adicional: al ser un adaptador LoRA, puede servir como punto de partida para tareas específicas con menos recursos que un fine-tuning completo.
- Experimentación académica: investigadores pueden estudiar el efecto de RAFT con tres documentos y mezcla de prompts sobre la fidelidad factual de Llama-3.1-8B.
- Prototipos de chatbots con recuperación: combinado con un pipeline de recuperación (RAG), puede generar respuestas citando fuentes, aunque se debe verificar la precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo base ni con otros adaptadores. Se recomienda evaluar el modelo en las tareas objetivo antes de cualquier despliegue.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador LoRA, se carga sobre el modelo base Llama-3.1-8B. En fp16, el modelo base requiere aproximadamente 16 GB de VRAM. Con cuantización 4-bit (p. ej. bitsandbytes), se reduce a unos 6-8 GB. El adaptador añade un pequeño overhead (menos de 1 GB).
- GPU recomendadas: para fp16, una GPU con 16-24 GB (RTX 4090, A100 40 GB, L4). Para cuantización 4-bit, una GPU con 8-12 GB (RTX 3080, RTX 4070, A10).
- Compatibilidad con GPU de consumo: sí, con cuantización 4-bit cabe en GPUs de consumo como RTX 3060 12 GB o RTX 4060 Ti 16 GB.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers + PEFT. El adaptador se puede fusionar con el modelo base o cargarse por separado.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización. Como referencia, Llama-3.1-8B en fp16 en una A100 genera aproximadamente 50-100 tokens/s; en consumer GPU con cuantización, 20-50 tokens/s.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un adaptador LoRA específico, y no hay datos de rendimiento. Se puede comparar con el modelo base Llama-3.1-8B (misma arquitectura, sin fine-tuning) y con otros adaptadores del mismo autor (p. ej. variantes LAW o MEDICAL), pero no se han publicado métricas. La siguiente tabla es orientativa y se basa en características conocidas:

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.1-8B (base) | 8B | 128k | Llama 3.1 Community | Hugging Face, Ollama, etc. |
| Este adaptador (LoRA) | 8B + LoRA r64 | 128k | No disponible | Hugging Face (repo) |
| Otros adaptadores de strongpear (LAW, MEDICAL) | 8B + LoRA r64 | 128k | No disponible | Hugging Face |

No se puede afirmar que este adaptador supere o iguale al modelo base en ninguna tarea sin datos empíricos.

## Limitaciones y advertencias

- Documentación ausente: la model card no proporciona información sobre el proceso de entrenamiento, datos, hiperparámetros ni evaluación. Esto impide conocer el comportamiento esperado y los riesgos asociados.
- Sesgos y alucinaciones: al ser un fine-tuning de Llama-3.1-8B, hereda los sesgos del modelo base y puede generar información falsa o inventada, especialmente si los documentos de contexto no son suficientes o son contradictorios.
- Riesgo de sobreajuste: el entrenamiento con un dataset específico (A-WIKI-Instruct) puede limitar la generalización a dominios fuera de Wikipedia o de la distribución de entrenamiento.
- Licencia incierta: no se especifica la licencia del adaptador. El uso comercial debe verificar la compatibilidad con la Llama 3.1 Community License del modelo base, que permite uso comercial con ciertas condiciones (usuarios con más de 700 millones de usuarios mensuales requieren licencia de Meta).
- Sin garantía de calidad: al no haber benchmarks, no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- Formato PEFT: el adaptador requiere cargar el modelo base por separado y aplicar el adaptador con la librería PEFT. No es un modelo autónomo.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/strongpear/Llama3.1-8B-RAFT_PMIX_P80_3DOCS_CoT_A-WIKI-Instruct-r64-last-full-epoch
- Modelo base Llama-3.1-8B: https://huggingface.co/meta-llama/Llama-3.1-8B
- Página de Llama 3.1 en Ollama: https://ollama.com/library/llama3.1:8b
- Repositorio oficial de Meta Llama 3: https://github.com/meta-llama/llama3
