# trex1185/qwen35-08b-extractive-qa

## Resumen

qwen35-08b-extractive-qa es un ajuste fino (fine-tuning) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario trex1185 y publicado en Hugging Face. El modelo está especializado en respuesta extractiva de preguntas (extractive question answering) sobre pasajes de Wikipedia en japonés. Con 852.985.920 parámetros, se posiciona como un modelo compacto orientado a una tarea concreta de recuperación y extracción de información.

El entrenamiento se realizó mediante LoRA SFT sobre el modelo base, con los pesos LoRA fusionados en la arquitectura original, lo que resulta en un checkpoint safetensors estándar de aproximadamente 1,7 GB. Los datos de entrenamiento provienen de JaQuAD y de pasajes de competición extraídos de Wikipedia japonesa, lo que vincula el modelo a un dominio muy específico: preguntas y respuestas sobre contenido enciclopédico nipón.

Su relevancia radica en ser un ejemplo de especialización de un modelo pequeño para una tarea downstream concreta, lo que permite despliegues ligeros en entornos con recursos limitados. No obstante, la información pública disponible es muy escasa: no se declaran benchmarks, licencia propia, idiomas soportados ni pipeline, lo que limita la evaluación rigurosa de su rendimiento real.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B); pesos LoRA fusionados |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible (entrenado con datos en japonés) |
| Licencia | no disponible (el modelo base es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,8 mil millones de parámetros bajo licencia Apache-2.0 (revisión 2fc06364715b967f1860aea9cf38778875588b17). Sobre esta base se aplicó un ajuste fino supervisado (SFT) mediante LoRA, cuyos pesos se fusionaron posteriormente en la arquitectura original, dando lugar a un checkpoint único de safetensors de 1,7 GB.

Los datos de entrenamiento proceden de dos fuentes: JaQuAD (Skelter Labs, licencia CC BY-SA 3.0), un conjunto de respuesta extractiva en japonés que fue muestreado mecánicamente, alineado y reformateado para el entrenamiento (revisión 23f5d72cc273c49b35e2d9efe0f51757aa1770bd), y pasajes de competición extraídos de Wikipedia japonesa (CC BY-SA 4.0) usados como pasajes recuperados. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla ninguna innovación técnica adicional más allá de la fusión de LoRA.

## Capacidades

- Respuesta extractiva de preguntas: extrae fragmentos de texto de pasajes proporcionados para responder a preguntas, tarea principal para la que fue entrenado.
- Comprensión lectora en japonés: entrenado sobre Wikipedia japonesa y JaQuAD, por lo que su dominio principal es el japonés enciclopédico.
- Generación de texto: hereda las capacidades generativas del modelo base Qwen3.5-0.8B, aunque no se documentan explícitamente.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el entrenamiento se centra en japonés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Sistemas de búsqueda con respuesta extractiva: dado un pasaje recuperado de un corpus documental, el modelo localiza y extrae la frase exacta que responde a la consulta del usuario, lo que resulta adecuado por su especialización en QA extractiva.
- Atención al cliente sobre base de conocimiento: integrado en un pipeline RAG, el modelo puede extraer respuestas literales de artículos de ayuda o manuales en japonés, reduciendo el riesgo de respuestas generadas libremente.
- Procesamiento de documentación enciclopédica: extracción de datos concretos (fechas, nombres, lugares) de artículos de Wikipedia japonesa para construir bases de datos estructuradas.
- Asistentes de estudio o consulta normativa: localización de fragmentos relevantes en textos legales o académicos en japonés para su cita textual.
- Despliegue en entornos con recursos limitados: con menos de 1.000 millones de parámetros y 1,7 GB de pesos, puede ejecutarse en hardware modesto para tareas de extracción, lo que lo hace apto para prototipos y edge computing.
- Evaluación de pipelines de recuperación: al ser un modelo pequeño y especializado, sirve como componente de referencia para medir la calidad de los pasajes recuperados en sistemas RAG en japonés.
- Filtrado y anotación de corpus: extracción automática de respuestas candidatas en conjuntos de datos de QA para su posterior revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, aproximadamente 1,7 GB de pesos más overhead, lo que sitúa el requisito en torno a 2-3 GB de VRAM; en cuantización de 8 bits o 4 bits sería aún menor (estimación, no confirmada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, RTX 3050, RTX 4060, RTX 4090) debería ser suficiente para inferencia en fp16; para producción a mayor escala, A100 o H100 no serían necesarias dado el tamaño.
- Cabe en GPU consumer: sí, previsiblemente en la mayoría de GPU con 4 GB o más de VRAM.
- Opciones de despliegue: al ser un checkpoint safetensors estándar de arquitectura Qwen3.5, podría cargarse con transformers; para GGUF sería necesario convertirlo (no se distribuye en ese formato). vLLM, llama.cpp u Ollama requerirían conversión previa y compatibilidad con la arquitectura Qwen3.5, no confirmada en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| trex1185/qwen35-08b-extractive-qa | 852.985.920 | no disponible | QA extractiva (japonés) | no disponible (base Apache-2.0) | Hugging Face |
| Qwen/Qwen3.5-0.8B | ~0,8B | no disponible | Generación general | Apache-2.0 | Hugging Face |
| JaQuAD (dataset, no modelo) | no aplica | no aplica | QA extractiva japonés | CC BY-SA 3.0 | GitHub |

No se dispone de información sobre benchmarks ni sobre otros modelos comparables especializados en QA extractiva en japonés de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre Wikipedia japonesa y JaQuAD, puede heredar sesgos de esas fuentes.
- Riesgo de alucinación: aunque la tarea es extractiva, el modelo es generativo y podría producir texto no presente en el pasaje; no se ha evaluado su fidelidad.
- Limitaciones de contexto o idioma: el entrenamiento se centra en japonés; el rendimiento en otros idiomas no está documentado. La longitud de contexto no se especifica.
- Restricciones de licencia para uso comercial: la licencia del modelo no está declarada. El modelo base es Apache-2.0, pero los datos de entrenamiento incluyen JaQuAD (CC BY-SA 3.0) y pasajes de Wikipedia (CC BY-SA 4.0), cuyas condiciones de atribución y compartición podrían afectar al uso comercial del modelo derivado; se recomienda verificar antes de un despliegue en producción.
- Caveats para producción: no hay benchmarks publicados, ni pipeline declarado, ni información sobre el proceso de evaluación; el modelo tiene 0 descargas y 0 likes, lo que indica ausencia de validación por la comunidad. La fecha de creación (2026-11-22) y la arquitectura Qwen3.5 sugieren que la información pública puede ser incompleta o preliminar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trex1185/qwen35-08b-extractive-qa
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset JaQuAD: https://github.com/SkelterLabsInc/JaQuAD
- Dataset de pasajes de competición: https://huggingface.co/datasets/bumbuboon/llm-course-final-2026
- Licencia CC BY-SA 3.0: https://creativecommons.org/licenses/by-sa/3.0/
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
