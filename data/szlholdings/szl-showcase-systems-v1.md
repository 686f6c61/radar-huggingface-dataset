# SZLHOLDINGS/SZL-Showcase-Systems-v1

## Resumen

SZL-Showcase-Systems-v1 es un ajuste fino (fine-tuning) de tipo instructivo derivado de SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, un modelo de la familia Qwen 3.5 con aproximadamente 873 millones de parámetros. Lo desarrolla SZLHOLDINGS y se distribuye bajo licencia Apache 2.0. El modelo está orientado a tareas multimodales de imagen-texto (pipeline `image-text-to-text`) y a generación de texto conversacional, con un enfoque declarado en el dominio de agentes de recibos y sistemas de showcase.

El modelo resuelve el problema de disponer de un sistema ligero, desplegable en hardware modesto, capaz de procesar entradas imagen-texto y mantener conversaciones multi-turno. Su tamaño de 0,87 mil millones de parámetros lo sitúa en la categoría de modelos pequeños, lo que permite inferencia en GPU de consumo y despliegue en entornos con restricciones de VRAM.

La relevancia actual radica en su combinación de licencia permisiva (Apache 2.0), formato estándar de pesos (safetensors) y compatibilidad con el ecosistema Transformers y text-generation-inference. No obstante, la información pública disponible es muy limitada: la model card es mínima y no incluye detalles sobre datos de entrenamiento, benchmarks ni composición del dataset.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen 3.5), multimodal imagen-texto |
| Parámetros totales | 873.438.784 (aproximadamente 0,87 mil millones) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors; se infiere compatibilidad con cuantizaciones estándar del ecosistema, pero no se documenta) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a la familia Qwen 3.5, un transformer multimodal con capacidad de procesamiento imagen-texto, según el pipeline declarado (`image-text-to-text`). El modelo base es SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3, que a su vez parece ser un ajuste supervisado (SFT) orientado a agentes de recibos. El modelo actual es un fine-tuning adicional sobre esa base.

El entrenamiento se realizó, según la model card, con Unsloth y la librería TRL de Hugging Face, lo que el autor describe como "2x faster" (dos veces más rápido). No se proporcionan datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`), lo que sugiere capacidad de comprensión de imágenes combinada con texto.
- Orientación a tareas de agente en el dominio de recibos (heredada del modelo base `szl-receiptagent`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el nombre del modelo base sugiere orientación a agentes.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, audio): no disponible.

## Casos de uso

- Procesamiento de recibos y facturas: el modelo hereda del base `szl-receiptagent` un enfoque hacia la extracción y gestión de información de recibos, combinando entrada de imagen y texto para interpretar documentos.
- Asistencia conversacional ligera: al ser un modelo de 0,87B, puede desplegarse para chatbots de atención al cliente con requisitos de hardware mínimos, aunque el contexto máximo no está documentado.
- Clasificación y etiquetado de documentos con imagen: su pipeline imagen-texto permite procesar capturas o escaneos y generar descripciones o extraer campos.
- Prototipado rápido de agentes: su tamaño reducido y licencia Apache 2.0 facilitan experimentación en pipelines de agentes sin costes elevados de infraestructura.
- Despliegue en edge o entornos con VRAM limitada: cabe en GPU de consumo, lo que permite ejecutar tareas de inferencia en estaciones de trabajo o dispositivos con recursos moderados.
- Fine-tuning posterior: al ser un modelo pequeño y con licencia permisiva, sirve como base para ajustes específicos en dominios verticales (finanzas, logística, retail).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 873 millones de parámetros, en FP16 se requieren aproximadamente 1,7 GB solo para pesos; en cuantización de 8 bits, alrededor de 0,9 GB; en 4 bits, aproximadamente 0,5 GB. Estas cifras son estimaciones por tamaño y no están confirmadas por el autor.
- GPU recomendadas: el modelo cabe en GPU de consumo como RTX 3060, RTX 4060, RTX 4090; también en A100 o H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM en cuantizaciones bajas.
- Opciones de despliegue: Transformers, text-generation-inference (TGI), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no documentado). El tag `unsloth` sugiere compatibilidad con el ecosistema de fine-tuning de Unsloth.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Showcase-Systems-v1 | 0,87B | no disponible | Apache 2.0 | Sí (imagen-texto) | Hugging Face |
| Qwen2.5-VL-3B | 3B | no disponible en esta ficha | Apache 2.0 | Sí | Hugging Face |
| SmolVLM-500M | 0,5B | no disponible en esta ficha | Apache 2.0 | Sí | Hugging Face |
| PaliGemma-3B | 3B | no disponible en esta ficha | Gemma license | Sí | Hugging Face |

Nota: los datos de los modelos comparativos se indican de forma orientativa; no se dispone de benchmarks del modelo evaluado para comparar rendimiento.

## Limitaciones y advertencias

- Información pública muy escasa: la model card no documenta datos de entrenamiento, contexto, benchmarks ni limitaciones, lo que dificulta evaluar su calidad real.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; sin benchmarks no puede cuantificarse.
- Idiomas: solo se declara inglés, por lo que su uso en castellano u otros idiomas no está garantizado.
- Contexto: se desconoce la longitud máxima de contexto, lo que limita la planificación de aplicaciones multi-turno largas.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y los datos de entrenamiento podrían tener restricciones adicionales no documentadas.
- Sin descargas ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación externa.
- Especialización vertical: el nombre del modelo base sugiere un enfoque en recibos; su rendimiento en dominios generales no está documentado.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Showcase-Systems-v1
- Modelo base: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-sft-v3
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
