# zenteiq-ai/Dhir-2B-GGUF

## Resumen

Dhir 2B es un modelo de lenguaje de 2.030 millones de parámetros desarrollado por ZenteiQ, orientado a generación de texto conversacional en inglés y once lenguas de la India (hindi, bengalí, tamil, telugu, kannada, malayalam, marathi, guyaratí, panyabí y oriya). Forma parte de la familia BrahmAI y está publicado bajo licencia Apache 2.0. El repositorio que nos ocupa, `zenteiq-ai/Dhir-2B-GGUF`, contiene la versión cuantizada del modelo base `zenteiq-ai/Dhir-2B` para su uso con llama.cpp.

La relevancia de esta ficha radica en su enfoque explícito hacia el despliegue en el borde (edge): la build de 4 bits ocupa 1,3 GB y está pensada para móviles, chips embebidos y portátiles sin GPU, mientras que la de 8 bits ocupa 2,2 GB y se aproxima casi exactamente a la salida del modelo original. Con una ventana de contexto de 16.384 tokens, cubre conversaciones multi-turno de longitud moderada sin salir del perfil de memoria de un dispositivo de gama media.

El modelo se distribuye en formato GGUF con cuantizaciones Q4_K_M y Q8_0, e incluye soporte para backends Vulkan y OpenVINO (CPU, GPU Intel Arc e NPU Intel AI Boost). Su integración con llama.cpp permite exponer una API compatible con OpenAI mediante `llama-server`, lo que facilita su uso desde frameworks como LangChain.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (detalle no disponible) |
| Parametros totales | 2.030.167.040 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens |
| Tipos de cuantizacion | Q4_K_M (1,3 GB), Q8_0 (2,2 GB) |
| Idiomas soportados | en, hi, bn, ta, te, kn, ml, mr, gu, pa, or |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base más allá de tratarse de un transformer de 2B parámetros. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card del repositorio GGUF se centra en los aspectos de cuantización y despliegue, no en el proceso de entrenamiento.

La innovación técnica destacable de este repositorio es la cuantización con `imatrix` (matriz de importancia) para llama.cpp, que permite obtener builds de 4 y 8 bits con degradación controlada. Además, el modelo requiere una rama específica de llama.cpp (`dhir-support` de `zenteiq-research/llama.cpp`) hasta que su soporte se fusione en el repositorio upstream, lo que sugiere adaptaciones en la tokenización o en la arquitectura para las lenguas índicas. Se documenta también soporte para los backends Vulkan y OpenVINO, este último con aceleración en NPU Intel.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y diez lenguas de la India.
- Razonamiento y respuesta a instrucciones en contextos de hasta 16.384 tokens.
- Capacidades multilingües nativas para hindi, bengalí, tamil, telugu, kannada, malayalam, marathi, guyaratí, panyabí y oriya, además del inglés.
- Integración con llama.cpp mediante API compatible con OpenAI (`llama-server`), lo que habilita su uso desde LangChain y otros clientes.
- Soporte de plantillas de chat Jinja (`--jinja`) para formateo de conversaciones.
- Despliegue en CPU, GPU (CUDA, Vulkan, OpenVINO) y NPU Intel AI Boost.
- Tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en dispositivos móviles: la build Q4_K_M de 1,3 GB cabe en la memoria de un teléfono de gama media y permite conversaciones multi-turno con hasta 16.384 tokens de contexto, sin necesidad de conexión a un servidor.
- Atención al cliente en lenguas índicas: el modelo cubre diez idiomas regionales de la India, lo que lo hace adecuado para chatbots de soporte dirigidos a usuarios que escriben en hindi, tamil, bengalí o marathi, con despliegue en servidores modestos mediante `llama-server`.
- Procesamiento de texto en chips embebidos: la build de 4 bits está pensada para chips con poca memoria, lo que permite integrar generación de texto en dispositivos IoT o electrónica de consumo con requisitos de memoria muy ajustados.
- Traducción y resumen local en portátiles sin GPU: la build Q8_0 de 2,2 GB se ejecuta en CPU en portátiles convencionales con una calidad de salida casi idéntica a la del modelo original, útil para tareas de resumen o reescritura de documentos.
- Aceleración en hardware Intel: mediante el backend OpenVINO, el modelo puede ejecutarse en NPU Intel AI Boost (Core Ultra) o GPU Intel Arc, lo que reduce el consumo energético en estaciones de trabajo y portátiles empresariales.
- Prototipado rápido de aplicaciones LLM: la API compatible con OpenAI de `llama-server` permite sustituir un endpoint en la nube por una instancia local del modelo, útil para desarrollo y pruebas sin coste de inferencia ni dependencia de proveedores externos.
- Generación de contenido multilingüe en entornos con restricciones de privacidad: al ejecutarse íntegramente en local, el modelo permite procesar textos sensibles en inglés o lenguas índicas sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,3 GB para Q4_K_M y 2,2 GB para Q8_0, más 0,11 MB por cada token de conversación (según la model card).
- Caché de contexto en 8 bits: reduce a la mitad el coste de memoria por token, recomendable en dispositivos con poca memoria y conversaciones largas.
- GPU recomendadas: no se especifican modelos concretos; se documenta soporte para CUDA (NVIDIA), Vulkan (Intel Arc e iGPU) y OpenVINO (CPU, GPU Intel Arc y NPU Intel AI Boost).
- Cabe en GPU de consumo: sí, por tamaño (1,3-2,2 GB), aunque la model card no enumera modelos concretos como RTX 4090; está orientado principalmente a CPU, iGPU y NPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`, `llama-bench`), con builds estándar, CUDA, Vulkan y OpenVINO; integración con LangChain a través de la API compatible con OpenAI.
- Latencia y throughput: no disponibles; la model card sugiere usar `llama-bench` con `-p 1024 -n 128 -r 3` para medirlos en el hardware objetivo.
- Ajuste de hilos en CPU: se recomienda `-t` con el número de núcleos de rendimiento y `-tb` con el total de núcleos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Dhir 2B (este) | 2B | 16.384 | en + 10 índicos | Apache 2.0 | GGUF, safetensors |
| Dhir 5B-A1.7B | 5B totales / 1,7B activos (MoE) | no disponible | en + índicos | Apache 2.0 | GGUF |
| Alternativas de 2B tipo Qwen/Llama | ~2B | variable | principalmente en/zh | variable | safetensors, GGUF |

La model card menciona explícitamente el Dhir 5B-A1.7B como alternativa de la misma familia: con 3,4 GB en Q4_K_M, se describe como más potente y rápido que el 2B en CPU, por lo que es la opción natural si el dispositivo dispone de más memoria. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a modelos de otros fabricantes.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo; al entrenarse para lenguas índicas, es previsible que refleje sesgos de los corpus utilizados, pero no hay documentación al respecto.
- Riesgo de alucinación inherente a un modelo de 2B parámetros; no se han publicado evaluaciones de fidelidad.
- El contexto está limitado a 16.384 tokens, suficiente para conversaciones moderadas pero insuficiente para documentos muy largos.
- El soporte en llama.cpp requiere, por ahora, una rama específica (`dhir-support`) o binarios precompilados; hasta su fusión en upstream, la integración puede presentar fricción y falta de soporte a largo plazo.
- No hay información sobre tool calling, capacidades de agente ni modos de razonamiento extendido, por lo que no debe asumirse su disponibilidad en producción.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento, no documentadas en esta ficha.
- El rendimiento en lenguas índicas concretas no está cuantificado con benchmarks; la calidad puede variar entre idiomas.
- Para conversaciones largas en dispositivos con poca memoria, es recomendable activar la caché de contexto en 8 bits.

## Enlaces

- Repositorio GGUF: https://huggingface.co/zenteiq-ai/Dhir-2B-GGUF
- Modelo base: https://huggingface.co/zenteiq-ai/Dhir-2B
- Modelo relacionado Dhir 5B-A1.7B GGUF: https://huggingface.co/zenteiq-ai/Dhir-5B-A1.7B-GGUF
- Sitio del desarrollador: https://www.zenteiq.ai
- Ficha en AIKosh: https://aikosh.indiaai.gov.in/home/models/details/dhir_2b.html
- Rama de llama.cpp con soporte Dhir: https://github.com/zenteiq-research/llama.cpp
- llama.cpp upstream: https://github.com/ggml-org/llama.cpp
- Guía de build Vulkan: https://github.com/ggml-org/llama.cpp/blob/master/docs/build.md#vulkan
- Guía de backend OpenVINO: https://github.com/ggml-org/llama.cpp/blob/master/docs/backend/OPENVINO.md#build-instructions
- Binarios precompilados de llama.cpp: https://github.com/ggml-org/llama.cpp/releases
