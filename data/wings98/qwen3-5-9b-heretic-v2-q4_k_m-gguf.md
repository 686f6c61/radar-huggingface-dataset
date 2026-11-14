# wings98/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF

## Resumen

`wings98/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF` es una cuantización en formato GGUF del modelo `trohrbaugh/Qwen3.5-9B-heretic-v2`, un derivado de la familia Qwen3.5 de 9B parámetros sometido a un proceso de "abliteration" o "decensoring" que elimina las capas de rechazo alineadas. El autor de esta ficha (wings98) se limita a convertir los pesos originales a formato GGUF mediante el espacio `GGUF-my-repo` de ggml.ai, sin aportar entrenamiento adicional. El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla la arquitectura de visión.

Se trata de un modelo de 8.953.803.264 parámetros totales (≈8,95B) distribuido bajo licencia Apache 2.0, en un repositorio de 5,6 GB que contiene una única cuantización Q4_K_M. La relevancia de esta ficha es doble: por un lado, documenta una variante "uncensored" útil para investigación sobre alineamiento y robustez de salvaguardas; por otro, ofrece una ruta de despliegue local vía llama.cpp que cabe en hardware de consumo. No obstante, la información publicada por el autor es mínima: no hay datos de benchmarks, idiomas soportados ni detalles de entrenamiento más allá de la referencia al modelo base.

El modelo hereda la etiqueta `conversational` y los tags `heretic`, `uncensored`, `decensored` y `abliterated`, que describen el proceso de modificación. Cualquier evaluación rigurosa debe remitirse al modelo original `trohrbaugh/Qwen3.5-9B-heretic-v2` y, en última instancia, a la familia Qwen3.5 de la que deriva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5; detalles no disponibles en la informacion proporcionada) |
| Parametros totales | 8.953.803.264 (≈8,95B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (la model card usa `-c 2048` en el ejemplo de servidor, pero no se declara contexto nativo) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en este repo) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 5,6 GB); el modelo base se distribuye en safetensors |
| Pipeline declarado | image-text-to-text |
| Modelo base | trohrbaugh/Qwen3.5-9B-heretic-v2 |
| Herramienta de conversion | llama.cpp / ggml.ai GGUF-my-repo |
| Tamano del repositorio | 5,6 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base `trohrbaugh/Qwen3.5-9B-heretic-v2`, que a su vez deriva de la familia Qwen3.5 de 9B parámetros. Se trata de un transformer decoder-only con 8,95B parámetros totales. El pipeline `image-text-to-text` indica que el modelo base incorpora un componente multimodal de entrada de imagen, aunque la model card de esta cuantización no describe el codificador visual ni la resolución de entrada. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni si hubo RLHF o DPO en el modelo original.

La modificación "heretic" / "abliterated" consiste en una intervención sobre los pesos (típicamente proyección ortogonal de la dirección de rechazo en las capas de atención y MLP) que busca eliminar el comportamiento de negativa ante peticiones consideradas sensibles, sin reentrenar. Esta ficha GGUF no añade entrenamiento: es una conversión directa de los pesos del modelo base a cuantización Q4_K_M mediante llama.cpp. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), aunque sin detalles sobre resolución, número de imágenes o tareas soportadas.
- Comportamiento "uncensored": el proceso de abliteration elimina las negativas alineadas, por lo que el modelo responde a peticiones que el modelo original rechazaría.
- Razonamiento y código: presumiblemente heredados de Qwen3.5, pero no verificables con la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles (no se declara lista de idiomas).
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre alineamiento y salvaguardas: el modelo permite estudiar cómo responde un sistema abliterated frente a uno alineado en las mismas prompts, sirviendo como línea base para medir la eficacia de las capas de rechazo.
- Despliegue local en estación de trabajo: con 5,6 GB en Q4_K_M, el modelo se ejecuta vía `llama-server` en GPUs de consumo (por ejemplo, RTX 3060 12 GB o superiores) para prototipado de asistentes conversacionales sin dependencia de la nube.
- Generación de texto creativo sin filtros: escritura de ficción, guiones o narrativa que requiera temáticas adultas o controvertidas, donde un modelo alineado rechazaría la petición.
- Análisis de imágenes en local: gracias al pipeline `image-text-to-text`, puede emplearse para describir o interrogar imágenes en entornos con requisitos de privacidad, siempre que se valide su calidad multimodal real.
- Evaluación de robustez de pipelines: útil para probar cómo se comportan sistemas de moderación, clasificadores de toxicidad o guardrails frente a un modelo que no coopera con las negativas.
- Base para fine-tuning posterior: al estar en GGUF y con licencia Apache 2.0, sirve como punto de partida para LoRA o adaptaciones sobre el modelo base en safetensors, aunque la cuantización Q4_K_M no es el formato ideal para entrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,5-6,5 GB con Q4_K_M, incluyendo overhead de contexto corto (2K tokens). Con contextos largos, la KV cache incrementa el consumo de forma proporcional.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080, RTX 4090, A10, L4, A100 y H100 (estas últimas sobredimensionadas para 9B en Q4).
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM; en 6-8 GB puede requerir offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (importando el GGUF), LM Studio y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa; para esos motores habría que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán del hardware y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| wings98/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF | 8,95B | no disponible | GGUF Q4_K_M | Apache 2.0 | Variante abliterated cuantizada; sin benchmarks publicados |
| trohrbaugh/Qwen3.5-9B-heretic-v2 | 8,95B | no disponible | safetensors | Apache 2.0 | Modelo base del que deriva esta cuantización; permite fine-tuning |
| Qwen/Qwen3.5-9B (familia original) | ≈9B | no disponible en esta ficha | safetensors | Apache 2.0 | Modelo alineado de referencia; contexto y benchmarks no verificados aquí |
| Otras variantes heretic de la familia Qwen | ≈9B | no disponible | safetensors / GGUF | Apache 2.0 | Alternativas equivalentes en enfoque; no se dispone de comparación cuantitativa |

No se dispone de datos de rendimiento comparado (MMLU, HumanEval, GSM8K) en la información proporcionada para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada del rendimiento del modelo en tareas estándar, ni del impacto del proceso de abliteration en capacidades como razonamiento o código.
- Riesgo elevado de contenido dañino: al eliminar las capas de rechazo, el modelo puede generar contenido violento, sexual explícito, ilegal o peligroso sin filtros. No es apto para aplicaciones de cara al público sin guardrails externos.
- Sesgos: los sesgos del modelo original Qwen3.5 persisten y probablemente se amplifican al eliminar la alineación; no se han documentado evaluaciones de sesgo.
- Alucinación: sin datos de evaluación; el proceso de abliteration puede degradar la calibración y aumentar la confianza en respuestas incorrectas.
- Idiomas y contexto: no se declaran oficialmente; el ejemplo de la model card usa `-c 2048`, lo que sugiere que el autor no garantiza contextos largos en esta cuantización.
- Licencia: Apache 2.0 permite uso comercial, pero el despliegue de un modelo sin filtros en producción conlleva responsabilidad legal y reputacional; conviene revisar las obligaciones de la licencia del modelo base Qwen.
- Calidad de la cuantización: Q4_K_M introduce pérdida de precisión frente a los pesos originales; para evaluación rigurosa debe usarse el modelo base en safetensors.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta; no hay validación comunitaria de la conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wings98/Qwen3.5-9B-heretic-v2-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/trohrbaugh/Qwen3.5-9B-heretic-v2
- Familia Qwen3.5 (referencia de licencia citada): https://huggingface.co/Qwen/Qwen3.5-9B/blob/main/LICENSE
- Espacio de conversión GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio llama.cpp: https://github.com/ggerganov/llama.cpp
