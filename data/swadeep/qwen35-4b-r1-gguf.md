# swadeep/qwen35-4b-r1-gguf

## Resumen

`swadeep/qwen35-4b-r1-gguf` es una conversión a formato GGUF del modelo Qwen3.5-4B, ajustado y empaquetado con la librería Unsloth. Cuenta con 4.205.751.296 parámetros (aproximadamente 4,2 mil millones), una arquitectura densa que hereda las capacidades de la familia Qwen3.5, incluyendo contexto largo de hasta 262.144 tokens y potenciales capacidades multimodales. El repositorio contiene un único archivo cuantizado (Q4_K_M) de 2,7 GB, optimizado para inferencia con llama.cpp y herramientas compatibles.

El nombre "r1" sugiere una posible destilación orientada a razonamiento, aunque la model card no proporciona detalles del proceso de entrenamiento. El modelo está etiquetado como "endpoints_compatible", lo que indica compatibilidad con plataformas de inferencia gestionada. Con 0 descargas y 0 likes, es un modelo muy reciente sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-4B), multimodal visión-lenguaje |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (heredado de Qwen3.5-4B) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el repositorio relacionado del autor usa Apache 2.0) |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-4B, un transformer denso de 4,2 mil millones de parámetros que integra fusión temprana de tokens multimodales, lo que le permite procesar texto e imágenes. Según las especificaciones publicadas de la familia Qwen3.5, el modelo emplea aprendizaje por refuerzo a escala para mejorar sus capacidades de razonamiento e instrucción.

El ajuste y la conversión se realizaron con Unsloth, que optimiza el fine-tuning y la conversión a GGUF, logrando un entrenamiento aproximadamente 2 veces más rápido que los métodos convencionales. El autor no ha publicado detalles sobre el dataset de entrenamiento, el número de tokens ni las técnicas de alineación (RLHF, DPO). El sufijo "r1" sugiere una posible destilación orientada a razonamiento; existe un repositorio relacionado del mismo autor (Qwen3.5-4b-claude-opus-distilled) que indica destilación desde Claude Opus con SFT y LoRA, aunque no se puede confirmar que este modelo siga exactamente ese proceso.

## Capacidades

- Generación de texto y razonamiento multi-turno con ventana de contexto de hasta 262.144 tokens, adecuada para conversaciones prolongadas con historial extenso.
- Potenciales capacidades multimodales: la model card incluye instrucciones para usar `llama-mtmd-cli`, lo que sugiere soporte para entrada de imágenes, aunque no está confirmado si la torre visual fue conservada durante el ajuste.
- Soporte de tool calling y function calling, según las etiquetas del repositorio relacionado del mismo autor (Qwen3.5-4b-claude-opus-distilled).
- Capacidades agénticas y razonamiento multi-paso, indicadas en el repositorio relacionado del autor.
- Generación de código Python y otras tareas de programación, según las etiquetas del modelo relacionado.
- Seguimiento de instrucciones y soporte conversacional, como indican las etiquetas "conversational" e "instruction-following".

Nota: las capacidades marcadas como "según el repositorio relacionado" corresponden al modelo Qwen3.5-4b-claude-opus-distilled del mismo autor y no están confirmadas explícitamente para este repositorio GGUF.

## Casos de uso

- Despliegue local de un asistente conversacional con contexto largo: con 262.144 tokens de ventana, el modelo puede mantener conversaciones prolongadas con historial extenso, adecuado para atención al cliente o asistentes personales que necesitan recordar interacciones previas.
- Generación de código asistida en entornos de desarrollo: las capacidades de tool calling y generación de Python permiten integrar el modelo en IDEs o pipelines de CI/CD para sugerencias de código y revisión automatizada.
- Procesamiento de documentos multimodales: si se confirma la capacidad de visión, el modelo podría extraer información de capturas de pantalla, diagramas o documentos escaneados, combinando comprensión visual y textual.
- Prototipado rápido de agentes con razonamiento multi-paso: el formato GGUF y la compatibilidad con endpoints permiten desplegar agentes que planifican y ejecutan tareas en varios pasos con llamadas a herramientas externas.
- Inferencia en el edge con hardware limitado: el archivo Q4_K_M de 2,7 GB cabe en GPUs de consumo con 4-6 GB de VRAM, permitiendo ejecutar el modelo en portátiles o estaciones de trabajo sin GPUs profesionales.
- Evaluación de modelos de razonamiento compactos: investigadores pueden comparar este modelo con otras variantes de Qwen3.5-4B para estudiar el impacto de la destilación y cuantización en tareas de razonamiento y comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar, y no se dispone de datos comparativos de rendimiento frente a otros modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo Q4_K_M ocupa 2,7 GB; se estima un consumo de entre 4 y 6 GB de VRAM incluyendo overhead de activaciones y KV cache.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4070, o GPUs profesionales como A10 o L4. Para contexto máximo (262.144 tokens) se requeriría una GPU con mayor VRAM (24 GB o más) debido al crecimiento de la KV cache.
- Compatibilidad con hardware de consumo: sí, cabe en GPUs de gama media con 8 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (`llama-cli`), `llama-mtmd-cli` para potenciales entradas multimodales, Ollama, LM Studio, y servidores de inferencia compatibles con GGUF como llama-server.
- El modelo está etiquetado como "endpoints_compatible", lo que sugiere compatibilidad con plataformas de inferencia gestionada en la región de Estados Unidos.
- Latencia y throughput: no disponibles; dependerán del hardware y de la longitud de la secuencia generada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Formato | Licencia |
|---|---|---|---|---|---|
| swadeep/qwen35-4b-r1-gguf | 4,2 B | 262.144 | potencial | GGUF (Q4_K_M) | no disponible |
| Qwen/Qwen3-4B-GGUF | 4 B | no disponible | no | GGUF | Apache 2.0 |
| Qwen3.5-4B (oficial) | 4 B | 262.144 | sí (visión-lenguaje) | safetensors | no disponible |
| swadeep/Qwen3.5-4b-claude-opus-distilled | 4,2 B | 262.144 | sí | safetensors + GGUF | Apache 2.0 |

La comparativa se basa en la información disponible. El modelo destaca frente a Qwen3-4B por su contexto mucho más largo (262.144 tokens) y sus potenciales capacidades multimodales. Frente al Qwen3.5-4B oficial, la principal diferencia es el formato GGUF cuantizado, que reduce los requisitos de memoria a costa de una ligera pérdida de precisión.

## Limitaciones y advertencias

- La licencia de este repositorio no está especificada en la model card. Aunque el repositorio relacionado del mismo autor usa Apache 2.0, no se puede asumir que esta conversión comparta la misma licencia sin confirmación explícita.
- Los idiomas soportados no están documentados. Aunque la familia Qwen3.5 suele ofrecer soporte multilingüe amplio, no hay confirmación para este modelo específico.
- Riesgo de alucinación:
