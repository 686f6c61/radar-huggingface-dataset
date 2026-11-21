# suliniacats/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF

## Resumen

Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF es una cuantización en formato GGUF del modelo fusionado Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic, publicado por el usuario suliniacats en Hugging Face. Se trata de un merge de tipo SLERP a partir de una base Qwen3.5 de 9B, combinada con destilaciones de trazas de razonamiento atribuidas a Claude Opus y DeepSeek, y posteriormente sometida a un proceso de "abliteration" (etiquetado como heretic) para reducir los rechazos del modelo. El resultado es un modelo de 9.197.093.888 parámetros (aproximadamente 9,2B) orientado a razonamiento, código, uso de herramientas y matemáticas.

La relevancia de esta ficha radica en que el artefacto publicado no es el modelo original, sino una versión cuantizada con imatrix generada por mradermacher, lo que facilita su despliegue en hardware de consumo mediante llama.cpp y ecosistemas compatibles. El modelo declara soporte para inglés, chino, español, ruso y japonés, y una licencia Apache 2.0 que permite uso comercial.

No se dispone de información sobre la longitud de contexto nativa, el esquema de entrenamiento detallado ni resultados de benchmarks publicados en la información proporcionada; esta ficha se limita a los datos verificables de la model card y los metadatos del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5), fusionada mediante SLERP 2x merge; no se detalla la configuración interna |
| Parámetros totales | 9.197.093.888 (~9,2B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-Q2_K, i1-IQ3_M, i1-Q4_K_S (publicadas en este repo); el autor lista además Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | en, zh, es, ru, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con fichero imatrix incluido) |

## Arquitectura y entrenamiento

El modelo base es un merge de tipo SLERP (Spherical Linear Interpolation) a 2x sobre una arquitectura Qwen3.5 de aproximadamente 9,2B parámetros. La model card indica que se han utilizado tres conjuntos de datos de destilación: Jackrong/Claude-opus-4.6-TraceInversion-9000x, Jackrong/Claude-opus-4.7-TraceInversion-5000x y lambda/hermes-agent-reasoning-traces, lo que sugiere un entrenamiento orientado a imitar trazas de razonamiento de modelos como Claude Opus y a reforzar habilidades de agente y uso de herramientas. El sufijo "heretic" indica que el modelo ha pasado por un proceso de abliteration destinado a eliminar direcciones de rechazo en el espacio de activaciones, reduciendo la tasa de respuestas negativas del modelo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco se detalla si el modelo incorpora innovaciones como decodificación especulativa, atención lineal o modos de pensamiento explícitos, más allá de las etiquetas "reasoning" y "agent" presentes en los metadatos. La model card menciona que se trata de un modelo de visión ("This is a vision model"), con ficheros mmproj que, de existir, se alojarían en el repositorio estático del cuantizador; no obstante, no se confirma la presencia efectiva de dichos ficheros ni la arquitectura visual asociada.

## Capacidades

- Generación de texto conversacional multilingüe en inglés, chino, español, ruso y japonés.
- Razonamiento multi-paso, etiquetado explícitamente como "reasoning" en los metadatos.
- Generación y comprensión de código, con etiqueta "coding".
- Matemáticas y disciplinas STEM, con etiquetas "math" y "stem".
- Uso de herramientas y function calling, con etiquetas "tool-use", "function-calling" y "agent".
- Capacidades de agente para tareas encadenadas, derivadas del dataset hermes-agent-reasoning-traces.
- Comportamiento "uncensored"/"decensored" por el proceso heretic, con menor tasa de rechazos.
- Posible soporte de visión según la model card, aunque no se confirma la disponibilidad de mmproj en este repositorio.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en editores o pipelines de CI/CD para autocompletar, explicar y refactorizar código, aprovechando sus etiquetas de coding y su tamaño de 9,2B que permite ejecución en GPU de consumo con cuantización i1-Q4_K_S.
- Agente con tool calling: gracias al entrenamiento sobre trazas de agente (hermes-agent-reasoning-traces), puede orquestar llamadas a APIs y funciones en flujos multi-paso, adecuado para automatizaciones internas donde no se requiere un modelo de frontera.
- Razonamiento matemático y STEM asistido: útil para resolver problemas paso a paso en entornos educativos o de investigación, con la salvedad de que no hay benchmarks publicados que cuantifiquen su precisión.
- Atención al cliente multilingüe: al soportar en, zh, es, ru y ja, puede desplegarse en sistemas de soporte que atiendan a usuarios en varios idiomas, aunque la longitud de contexto no está documentada y conviene validarla empíricamente.
- Generación de contenido sin filtros restrictivos: el proceso heretic reduce los rechazos, lo que puede interesar en aplicaciones creativas o de investigación que requieran respuestas directas, siempre bajo revisión humana por el riesgo de contenido inapropiado.
- Despliegue en hardware de consumo: las cuantizaciones i1-Q2_K (4,1 GB), i1-IQ3_M (4,7 GB) e i1-Q4_K_S (5,6 GB) permiten ejecutar el modelo en GPUs con 6-8 GB de VRAM mediante llama.cpp u Ollama, lo que facilita prototipado y pruebas locales.
- Destilación de trazas de razonamiento: investigadores pueden usar el modelo como generador de cadenas de pensamiento para crear datasets sintéticos, dado su entrenamiento sobre trazas de Claude Opus y DeepSeek.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB con i1-Q2_K, 4,7 GB con i1-IQ3_M y 5,6 GB con i1-Q4_K_S, a los que hay que sumar el overhead de contexto y del runtime (típicamente 1-2 GB adicionales).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 si se despliega en FP16 (no incluido en este repo) o con contextos muy largos.
- Cabe en GPU de consumo: sí, en modelos con 6-8 GB de VRAM usando i1-Q2_K o i1-IQ3_M; con 8-12 GB se puede usar i1-Q4_K_S con contexto moderado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF; para vLLM o TGI sería necesario convertir a safetensors o usar el modelo base no cuantizado.
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la GPU, la cuantización y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF | ~9,2B | no disponible | Apache 2.0 | GGUF (i1) | Merge SLERP con abliteration, orientado a razonamiento y agentes |
| Qwen2.5-7B-Instruct | ~7,6B | 32k (típico en la familia Qwen2.5) | Apache 2.0 | safetensors, GGUF | Modelo oficial de Alibaba, sin abliteration, con benchmarks publicados |
| Llama-3.1-8B-Instruct | ~8B | 128k | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial de Meta, con benchmarks públicos y restricciones de licencia |
| DeepSeek-R1-Distill-Qwen-7B | ~7,6B | 32k (típico) | MIT (según el modelo base) | safetensors, GGUF | Destilado de razonamiento de DeepSeek sobre Qwen, con benchmarks publicados |

La comparativa se basa en características generales de la familia; no se dispone de datos de rendimiento del modelo Wukong para confrontar directamente.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real en razonamiento, código o matemáticas no está cuantificado y debe validarse empíricamente antes de usarlo en producción.
- El proceso heretic/abliteration reduce los rechazos, lo que incrementa el riesgo de generar contenido inapropiado, sesgado o dañino; se recomienda moderación adicional en aplicaciones expuestas a usuarios finales.
- Al ser un merge de destilaciones de trazas de terceros (Claude Opus, DeepSeek), existe riesgo de alucinación y de imitar estilos o errores de los modelos destilados sin garantías de fidelidad factual.
- La longitud de contexto no está documentada; no se debe asumir una ventana larga sin verificarla, lo que limita su uso en tareas de contexto extenso.
- El soporte multilingüe se declara para en, zh, es, ru y ja, pero no hay evaluación publicada de calidad por idioma; el español puede presentar un rendimiento inferior al inglés.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de destilación pueden tener sus propias condiciones; conviene revisar la licencia del modelo base xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic antes de un despliegue comercial.
- La model card indica que es un modelo de visión, pero no se confirma la disponibilidad de ficheros mmproj en este repositorio; no asumir capacidades multimodales sin verificarlo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/suliniacats/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Modelo base: https://huggingface.co/xtools-at/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-GGUF
- Página de descargas del cuantizador: https://hf.tst.eu/model#Wukong-9B-Qwen3.5-Claude-Opus-DeepSeek-SLERP-2xMerge-heretic-i1-GGUF
- Dataset Jackrong/Claude-opus-4.6-TraceInversion-9000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.6-TraceInversion-9000x
- Dataset Jackrong/Claude-opus-4.7-TraceInversion-5000x: https://huggingface.co/datasets/Jackrong/Claude-opus-4.7-TraceInversion-5000x
- Dataset lambda/hermes-agent-reasoning-traces: https://huggingface.co/datasets/lambda/hermes-agent-reasoning-traces
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
