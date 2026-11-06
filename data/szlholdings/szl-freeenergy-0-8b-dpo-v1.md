# SZLHOLDINGS/SZL-FreeEnergy-0.8B-DPO-v1

## Resumen

SZL-FreeEnergy-0.8B-DPO-v1 es un modelo de lenguaje de 873 millones de parámetros publicado por SZLHOLDINGS, un perfil de Hugging Face que mantiene 47 modelos con unas 19.100 descargas acumuladas. Se trata de un ajuste fino mediante DPO (Direct Preference Optimization) sobre SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1, que a su vez parte de la arquitectura `qwen3_5` según los tags del repositorio. El modelo se distribuye en safetensors con licencia Apache 2.0 y está etiquetado para generación de texto e image-text-to-text, aunque la model card solo documenta el caso de uso textual.

El objetivo declarado por el autor no es competir en capacidades generales, sino reducir la confabulación (respuestas inventadas presentadas como si estuvieran fundamentadas) en un dominio concreto que el autor denomina "doctrina" y "remediation". Según la model card, el modelo base mostraba la mejor señal de confabulación de su familia (3 aciertos de 6 en las sondas de citación) y la hipótesis del DPO es que la anotación de energía libre combinada con el contrapeso de preferencias mejora el anclaje de citas. El entrenamiento se realizó con Unsloth y TRL sobre una NVIDIA A6000, con un dataset de 62 pares de evaluación (SZLHOLDINGS/doctrine-abstention-dpo-v2).

La relevancia de esta ficha es doble. Por un lado, documenta un experimento de alineación a pequeña escala centrado en abstención y citación, un problema poco cubierto en modelos de menos de 1.000 millones de parámetros. Por otro, conviene señalar que la evaluación del modelo está marcada como `RE_GATE_PENDING`: el autor aún no había ejecutado las sondas de citación en el momento de publicar el repositorio, por lo que no existen resultados verificados de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia `qwen3_5` (según tags del repo) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en 16 bits tras el merge) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer decoder-only de la familia `qwen3_5`, con 873 millones de parámetros totales. El repositorio no detalla número de capas, dimensión oculta, cabezas de atención ni longitud de contexto nativa; tampoco se especifica si emplea atención lineal, decodificación especulativa u otras optimizaciones. El pipeline declarado es `text-generation`, aunque los tags incluyen `image-text-to-text`, lo que sugiere que la familia base podría incorporar un codificador visual; la model card no documenta ninguna capacidad multimodal ni proceso de entrenamiento con imágenes.

El entrenamiento consistió en una pasada de DPO sobre SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1, ejecutada con Unsloth y TRL sobre una NVIDIA A6000 y publicada como merge en 16 bits. El dataset utilizado, SZLHOLDINGS/doctrine-abstention-dpo-v2, contiene 62 pares dirigidos por evaluación, es decir, pares de preferencia construidos a partir de fallos observados en las sondas del modelo base. La model card enmarca el ajuste en la "wave" `freeenergy-dpo-w28` y describe la hipótesis subyacente: la anotación de energía libre (entrenamiento con compromiso entre precisión y complejidad) más el contrapeso de DPO debería producir mejor anclaje de citas que cualquiera de las dos técnicas por separado. No se especifican hiperparámetros de DPO (beta, learning rate, épocas), composición del dataset más allá del número de pares, ni volumen total de tokens de entrenamiento.

## Capacidades

- Generación de texto conversacional en inglés, con formato de chat (`conversational` en los tags).
- Abstención explícita: el modelo está entrenado para reconocer cuándo no dispone de base suficiente y declinar responder, en lugar de generar una respuesta plausible pero no fundamentada.
- Anclaje de citas: el objetivo declarado del ajuste es que las respuestas se apoyen en referencias verificables dentro del dominio "doctrinal" del autor.
- Compatibilidad con Text Generation Inference y con el ecosistema transformers, lo que permite desplegarlo con endpoints estándar.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no documentadas en la model card pese al tag `image-text-to-text`.
- Modo de razonamiento explícito (thinking mode): no disponible.

## Casos de uso

- Sistemas de preguntas y respuestas con abstención: el modelo puede integrarse en un pipeline donde, ante una consulta fuera de su dominio de conocimiento, devuelva una negativa explícita en lugar de una respuesta inventada. Es adecuado por su entrenamiento específico en pares de abstención, aunque el rendimiento real está pendiente de validación.
- Verificación de citas en documentación interna: dado un fragmento de texto y una fuente, el modelo puede señalar si la afirmación está respaldada o no, aprovechando su ajuste hacia el anclaje de citas. Requiere un paso de validación posterior por su tamaño reducido.
- Filtrado de alucinaciones en pipelines de RAG: como clasificador secundario que revisa las respuestas de un modelo mayor antes de mostrarlas al usuario, marcando aquellas sin respaldo documental. Su reducido tamaño (873 millones de parámetros) permite ejecutarlo en la misma GPU que el modelo principal.
- Prototipado rápido de asistentes conversacionales en inglés: al caber en GPUs de consumo y publicarse en safetensors con licencia Apache 2.0, sirve para validar flujos de conversación multi-turno antes de escalar a modelos mayores.
- Investigación en alineación y DPO: el repositorio documenta explícitamente la hipótesis, el dataset de 62 pares y el estado de evaluación, lo que lo convierte en un caso de estudio reproducible sobre cómo el DPO a pequeña escala afecta a la confabulación.
- Evaluación comparativa de técnicas de remediación: al existir varios modelos de la misma familia (el base y este DPO), permite medir el efecto aislado del ajuste por preferencias sobre las mismas sondas de citación.
- Despliegue en entornos con recursos limitados: con 1,8 GB de pesos en 16 bits, puede servirse en una única GPU consumer para tareas de clasificación o generación corta en inglés.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que el modelo base obtuvo 3 aciertos de 6 en las sondas de confabulación de su familia, y que las sondas de citación de este modelo DPO estaban pendientes de ejecución (`RE_GATE_PENDING`) en el momento de la publicación. No hay datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 1,8 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2,5 y 4 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,6 GB. No se han publicado versiones GGUF oficiales en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 3060, RTX 4060, RTX 4090, A6000, A100 o H100 pueden servirlo sin problema.
- Cabe holgadamente en GPU de consumo: sí, en tarjetas de 8 GB o más, e incluso en configuraciones con menos VRAM si se cuantiza.
- Opciones de despliegue: transformers (librería declarada), Text Generation Inference (tag `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF, aunque no se distribuyen en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SZL-FreeEnergy-0.8B-DPO-v1 | 873 M | no disponible | Apache 2.0 | DPO para abstención y anclaje de citas |
| SZL-FreeEnergy-0.8B-v1 | no disponible (misma familia) | no disponible | Apache 2.0 (según repo base) | Modelo base con anotación de energía libre |
| Qwen2.5-0.5B / Qwen3-0.6B | ~500-600 M | 32 K (Qwen2.5) | Apache 2.0 | Modelo generalista de referencia en el rango sub-1B |
| SmolLM2-1.7B | 1.700 M | 8 K | Apache 2.0 | Modelo generalista de Hugging Face |

La comparación con modelos generalistas del mismo rango de tamaño es desigual: SZL-FreeEnergy-0.8B-DPO-v1 está especializado en una tarea estrecha (abstención y citación en un dominio concreto) y no se han publicado métricas que permitan situarlo frente a Qwen o SmolLM2 en tareas generales. La alternativa más directa es su propio modelo base, SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1, del que se diferencia únicamente por la pasada de DPO.

## Limitaciones y advertencias

- Evaluación incompleta: la model card marca el estado como `RE_GATE_PENDING`; no hay resultados verificados de las sondas de citación ni confirmación de que la confabulación se haya reducido a 0 de 6.
- Dominio estrecho: el ajuste se realizó sobre 62 pares de un dataset específico ("doctrina"), lo que puede provocar sobreajuste a ese dominio y degradar el comportamiento general fuera de él.
- Idiomas: solo se declara inglés; no hay evidencia de competencia en castellano ni en otros idiomas.
- Contexto desconocido: no se especifica la longitud de contexto, lo que impide planificar su uso en tareas de documento largo.
- Riesgo de alucinación: aunque el objetivo del ajuste es reducirlo, no hay datos publicados que cuantifiquen la mejora; debe tratarse la salida como una propuesta no confiable, tal como indica la propia model card ("Model output is an untrusted proposal").
- Sesgos: no se documenta ningún análisis de sesgos, composición del dataset ni proceso de filtrado.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el dataset de DPO no detallan sus propias condiciones más allá de la licencia del repositorio; conviene verificar la cadena completa antes de un despliegue comercial.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación externa por parte de la comunidad.
- Multimodalidad no confirmada: el tag `image-text-to-text` no está respaldado por documentación en la model card; no debe asumirse capacidad de visión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-DPO-v1)
- [Modelo base SZL-FreeEnergy-0.8B-v1](https://huggingface.co/SZLHOLDINGS/SZL-FreeEnergy-0.8B-v1)
- [Dataset doctrine-abstention-dpo-v2](https://huggingface.co/datasets/SZLHOLDINGS/doctrine-abstention-dpo-v2)
- [Colección Start Here de SZLHOLDINGS](https://huggingface.co/collections/SZLHOLDINGS/start-here)
- [Estadísticas del autor en OpenModelStats](https://openmodelstats.com/owners/szlholdings)
- [Sitio canónico del autor](https://a-11-oy.com)
