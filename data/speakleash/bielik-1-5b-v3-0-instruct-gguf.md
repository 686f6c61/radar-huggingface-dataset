# speakleash/Bielik-1.5B-v3.0-Instruct-GGUF

## Resumen

Bielik-1.5B-v3.0-Instruct-GGUF es la distribución en formato GGUF del modelo Bielik-1.5B-v3.0-Instruct, desarrollado por SpeakLeash en colaboración con ACK Cyfronet AGH. Se trata de un modelo causal decoder-only de 1.596.507.648 parámetros (aproximadamente 1,5 mil millones) especializado en lengua polaca, afinado a partir de Bielik-1.5B-v2 y optimizado para instrucciones conversacionales. Esta variante GGUF está pensada para inferencia local eficiente mediante llama.cpp y sus derivados.

El modelo resuelve el problema de disponer de un LLM competente en polaco que pueda ejecutarse en hardware modesto, incluyendo GPUs de consumo, gracias a su reducido tamaño. La licencia Apache 2.0 facilita su adopción tanto en investigación como en productos comerciales, y su naturaleza abierta permite ajustes posteriores.

Esta versión GGUF se publicó el 3 de mayo de 2025 y ofrece cuantizaciones q8_0 y fp16, lo que la hace apta para despliegues en CPU, GPU de gama baja y entornos embebidos. La información disponible no detalla la longitud de contexto ni los datos exactos de entrenamiento del modelo instruct, por lo que esos datos se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only |
| Parámetros totales | 1.596.507.648 (aprox. 1,5B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | q8_0, fp16 |
| Idiomas soportados | Polaco (pl) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo también incluye transformers) |

## Arquitectura y entrenamiento

El modelo base Bielik-1.5B-v3 emplea una arquitectura transformer causal decoder-only. Según la información del modelo base v3, el entrenamiento se realizó en el supercomputador Helios del ACK Cyfronet AGH utilizando 256 tarjetas NVIDIA GH200, con un conjunto de datos compuesto por textos polacos recopilados por el proyecto SpeakLeash y un subconjunto de CommonCrawl, totalizando 292 mil millones de tokens durante 1,2 épocas. La variante instruct parte de Bielik-1.5B-v2 y se afina para seguir instrucciones, aunque la información disponible no especifica los detalles del proceso de alineación (RLHF, DPO u otros) ni la composición exacta del dataset de instrucciones.

La versión GGUF es una conversión de los pesos del modelo instruct a formato GGUF, con cuantizaciones q8_0 y fp16. El autor advierte que las versiones cuantizadas pueden mostrar una calidad de respuesta reducida y alucinaciones. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en polaco.
- Seguimiento de instrucciones en formato chat (roles system, user, assistant).
- Razonamiento básico y respuesta a preguntas.
- Generación de código y texto técnico en polaco (capacidad inferida por el tamaño y el afinado, no documentada explícitamente).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al polaco según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Asistente conversacional en polaco para atención al cliente: el modelo puede gestionar diálogos multi-turno con un template de chat definido, adecuado para integraciones ligeras en web o mensajería.
- Generación de texto y redacción en polaco: útil para crear borradores, resúmenes y contenido editorial en dicho idioma con un modelo de bajo coste computacional.
- Procesamiento de lenguaje natural en entornos con recursos limitados: al ser un modelo de 1,5B en GGUF, puede ejecutarse en CPU o GPUs de consumo, ideal para prototipos y despliegues en dispositivos locales.
- Educación y experimentación: sirve como base para investigación en ajuste fino y evaluación de LLMs en polaco, gracias a su licencia Apache 2.0 y su tamaño manejable.
- Traducción asistida polaco-español/inglés: aunque no está entrenado explícitamente para traducción, puede emplearse en tareas de post-edición o generación de borradores, con revisión humana.
- Chatbots locales con Ollama: el repositorio incluye un Modfile de ejemplo para importar el modelo en Ollama, lo que facilita su uso en aplicaciones de escritorio sin conexión.
- Análisis de sentimiento y clasificación de textos polacos: mediante prompting, puede adaptarse a tareas de etiquetado simple en pipelines de procesamiento por lotes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6 GB en fp16 (solo pesos), alrededor de 0,85 GB en q8_0; el uso real depende de la longitud de contexto y del backend.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM para fp16, como GTX 1650, RTX 3050, RTX 4060; para q8_0 basta con 1-2 GB.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: llama.cpp, Ollama (con el Modfile proporcionado), text-generation-webui, KoboldCpp, GPT4All, LM Studio, llama-cpp-python, candle, ctransformers.
- Latencia y throughput estimados: no disponibles; dependerán del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Bielik-1.5B-v3.0-Instruct-GGUF | 1,5B | no disponible | Polaco | Apache 2.0 | GGUF |
| Bielik-1.5B-v3 (base) | 1,5B | no disponible | Polaco | Apache 2.0 | safetensors |
| Bielik-7B-Instruct-v0.1-GGUF | 7B | no disponible | Polaco | Apache 2.0 | GGUF |
| Otros modelos pequeños polacos | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a variantes del mismo ecosistema Bielik, ya que la información disponible no permite contrastar con alternativas de otros desarrolladores. El modelo de 7B ofrece mayor capacidad a costa de más recursos; el de 1,5B prioriza eficiencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse principalmente con textos polacos de SpeakLeash y CommonCrawl, puede reflejar sesgos presentes en dichas fuentes; no se documentan evaluaciones de sesgo.
- Riesgo de alucinación: el autor advierte explícitamente que las versiones cuantizadas pueden mostrar calidad reducida y alucinaciones.
- Limitaciones de contexto o idioma: el modelo está especializado en polaco; su rendimiento en otros idiomas es limitado o no evaluado. La longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones de los datos de entrenamiento subyacentes.
- Caveats para producción: la cuantización q8_0 puede degradar la calidad frente a fp16; se recomienda validar el modelo en el dominio de aplicación antes de desplegarlo. No se dispone de información sobre tool calling ni capacidades de agente.

## Enlaces

- [Hugging Face: speakleash/Bielik-1.5B-v3.0-Instruct-GGUF](https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct-GGUF)
- [Modelo base: speakleash/Bielik-1.5B-v3.0-Instruct](https://huggingface.co/speakleash/Bielik-1.5B-v3.0-Instruct)
- [Modelo base v2: speakleash/Bielik-1.5B-v2](https://huggingface.co/speakleash/Bielik-1.5B-v2)
- [Modelo v3 (base): speakleash/Bielik-1.5B-v3](https://huggingface.co/speakleash/Bielik-1.5B-v3)
- [Informe técnico (arXiv:2505.02550)](https://arxiv.org/abs/2505.02550)
- [Sitio web de SpeakLeash](https://speakleash.org/)
- [ACK Cyfronet AGH](https://www.cyfronet.pl/)
- [llama.cpp](https://github.com/ggerganov/llama.cpp)
- [Ollama](https://ollama.com/)
- [Discord de SpeakLeash](https://discord.gg/CPBxPce4)
