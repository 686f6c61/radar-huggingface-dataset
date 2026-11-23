# tinyopsec/Nanbeige4.2-3B-GGUF

## Resumen

Nanbeige4.2-3B-GGUF es la colección de cuantizaciones en formato GGUF del modelo Nanbeige4.2-3B, un LLM compacto orientado a tareas agénticas desarrollado por Nanbeige LLM Lab. Esta versión concreta ha sido generada por el usuario comunitario tinyopsec a partir del checkpoint original en BF16 SafeTensors, sin fine-tuning ni cambios arquitectónicos, empleando el fork de llama.cpp del propio equipo Nanbeige (`-b nanbeige42`) para soportar la arquitectura `nanbeige`.

El modelo base emplea una arquitectura denominada Looped Transformer, que reutiliza capas del transformer para incrementar la capacidad efectiva del modelo sin aumentar el número de parámetros. Con 4.169.800.704 parámetros totales (3B no pertenecientes a embeddings) y una ventana de contexto de 262.144 tokens, el modelo está entrenado mediante supervisión fina (SFT) y aprendizaje por refuerzo (RL) sobre Nanbeige4.2-3B-Base. Está especializado en flujos agénticos, uso de herramientas y razonamiento multi-paso.

La relevancia de esta ficha radica en que permite desplegar un modelo con capacidades declaradas de nivel agéntico en hardware de consumo, gracias a cuantizaciones que van desde 1,76 GB (Q2_K) hasta 4,43 GB (Q8_0). La licencia Apache 2.0 facilita su uso comercial, aunque la dependencia de un fork de llama.cpp introduce fricción operativa relevante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped Transformer (arquitectura `nanbeige`) |
| Parametros totales | 4.169.800.704 (4B); 3B no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q4_0, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, F16 |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (convertido desde BF16 SafeTensors) |

## Arquitectura y entrenamiento

El modelo base se construye sobre una arquitectura Looped Transformer, que reutiliza las capas del transformer en varias pasadas para aumentar la capacidad efectiva sin incrementar el recuento de parámetros. El modelo parte de Nanbeige4.2-3B-Base y se somete a un proceso de SFT seguido de entrenamiento con RL para reforzar comportamientos agénticos y de razonamiento. El informe técnico asociado es arXiv:2607.22083.

Esta versión GGUF se ha generado mediante conversión directa desde el checkpoint BF16 original con el fork `nanbeige42` de llama.cpp. No se aplicaron cambios de arquitectura ni ajuste adicional. El repositorio ocupa 35,6 GB e incluye todas las variantes de cuantización listadas. El modelo expone en su plantilla de chat dos flags de configuración: `enable_thinking` (activa razonamiento chain-of-thought, por defecto activado) y `preserve_thinking` (controla si se retienen los tokens de razonamiento de turnos previos; recomendado `true` para tool-use y agentes de código).

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo thinking (chain-of-thought) activable mediante `enable_thinking`.
- Capacidades agénticas y de razonamiento multi-paso, con soporte declarado para flujos de trabajo con herramientas.
- Tool calling / function calling, con formato XML recomendado (`tool_call_format="xml"`) y JSON soportado por compatibilidad.
- Razonamiento matemático y de competición (evaluado en HMMT-Feb-2026).
- Generación y resolución de código a nivel de repositorio (SWE-Bench Verified y Pro, LiveCodeBench).
- Contexto largo de hasta 256K tokens, útil para tareas con muchos documentos o historial extenso.
- Capacidades evaluadas de tipo agéntico general (Claw-Evalpass, GDPval rubrics).
- No se declaran capacidades de visión, audio ni multimodalidad.

## Casos de uso

- Agentes de código autónomos: con 63,6 en SWE-Bench Verified y 46,9 en SWE-Bench Pro, el modelo puede integrarse en pipelines que resuelven issues de repositorios, aplican parches y validan tests, usando `preserve_thinking=true` para mantener el hilo de razonamiento entre turnos.
- Asistente de terminal y CLI local: la cuantización Q4_K_M (2,57 GB) permite ejecutarlo con `llama cli` u Ollama en portátiles, ofreciendo un asistente de código y shell sin conexión.
- Automatización de atención al cliente multi-turno: la ventana de 256K tokens permite arrastrar historiales largos y documentación de producto en una sola sesión, útil en soporte técnico especializado.
- Razonamiento matemático y verificación: con 82,8 en HMMT-Feb-2026, es adecuado para tutores automáticos, generación de problemas y comprobación de soluciones paso a paso.
- Orquestación de herramientas en backoffice: el soporte de tool calling en XML permite conectar el modelo a APIs internas (CRM, ERP, bases de datos) mediante function calling en flujos de varios pasos.
- Evaluación de calidad documental (GDPval rubrics, 74,3): puede usarse para puntuar entregables según rúbricas, redactar informes estructurados o revisar documentación técnica.
- Prototipado en hardware de consumo: gracias a las cuantizaciones de 1,76-4,43 GB, sirve para experimentar con agentes locales en GPUs de gama media o incluso CPU, antes de escalar a un modelo mayor.

## Benchmarks y rendimiento

Resultados reportados por los autores originales (modo thinking, `preserve_thinking=true`):

| Benchmark | Nanbeige4.2-3B | Qwen3.5-9B | Qwen3.5-4B | Gemma4-12B |
|---|---|---|---|---|
| SWE-Bench Verified | 63,6 | 53,1 | 38,8 | 44,2 |
| SWE-Bench Pro | 46,9 | 33,8 | 29,4 | 21,9 |
| GPQA-Diamond | 87,4 | 81,7 | 78,2 | 78,8 |
| HMMT-Feb-2026 | 82,8 | 69,6 | 60,6 | 51,5 |
| LiveCodeBench-V6 | 72,5 | 65,6 | 55,8 | 72,0 |
| HLE (sin búsqueda) | 17,8 | 12,5 | 6,8 | 14,8 |
| Claw-Evalpass | 52,2 | 47,1 | 36,9 | 25,5 |
| GDPval rubrics | 74,3 | 61,9 | 46,7 | 68,5 |

No se han publicado en la información disponible resultados de benchmarks específicos de las cuantizaciones GGUF frente al modelo original en BF16.

## Requisitos de hardware

- VRAM/RAM estimada según cuantización: Q2_K 1,76 GB; Q3_K_S 2,00 GB; Q3_K_M 2,17 GB; Q4_0 2,48 GB; Q4_K_S 2,50 GB; Q4_K_M 2,57 GB; Q5_K_S 2,94 GB; Q5_K_M 2,99 GB; Q6_K 3,42 GB; Q8_0 4,43 GB; F16 8,34 GB.
- En GPUs de consumo: Q4_K_M cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y en GPUs de 8 GB con margen para contexto moderado. Las variantes Q6_K y Q8_0 requieren al menos 6-8 GB de VRAM efectiva.
- En GPUs de datacenter: A100, H100 y L40S pueden ejecutar F16 con comodidad y permiten contextos largos; útiles para servir varias peticiones concurrentes.
- Despliegue: llama.cpp (fork Nanbeige `nanbeige42`), servidor OpenAI-compatible con `llama serve`, Ollama, Docker Model Runner y LM Studio (sustituyendo los binarios del backend por el fork).
- El llama.cpp upstream estándar no soporta la arquitectura `nanbeige` en el momento de publicación, por lo que vLLM y TGI no están confirmados como opciones viables.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-Bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| Nanbeige4.2-3B (esta ficha) | 4B totales / 3B no-embedding | 256K | 63,6 | Apache 2.0 | GGUF, SafeTensors |
| Qwen3.5-4B | 4B | no disponible | 38,8 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 53,1 | no disponible | no disponible |
| Gemma4-12B | 12B | no disponible | 44,2 | no disponible | no disponible |

La comparativa se basa exclusivamente en los datos de benchmark aportados por los autores originales. Nanbeige4.2-3B declara superar a modelos de mayor tamaño en tareas agénticas y de código, a pesar de tener menos parámetros no-embedding.

## Limitaciones y advertencias

- El modelo original advierte de que puede producir salidas inexactas, sesgadas o inapropiadas debido a su naturaleza probabilística; requiere validación en producción.
- Riesgo de alucinación inherente a modelos generativos, especialmente en tareas de razonamiento abierto (HLE sin búsqueda solo alcanza 17,8).
- Idiomas soportados limitados a inglés y chino; el rendimiento en castellano no está documentado y probablemente sea inferior.
- La arquitectura `nanbeige` no está soportada por llama.cpp upstream: es obligatorio usar el fork `nanbeige42` para conversión, re-cuantización o ejecución en LM Studio.
- Las cuantizaciones bajas (Q2_K, Q3_K_S) introducen pérdida de calidad notable; los benchmarks reportados corresponden al modelo original, no a los GGUF.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de los datos de entrenamiento en el repositorio original.
- Repositorio comunitario con 1 like y 516 descargas: menor madurez y soporte que una distribución oficial.
- El uso de contexto de 256K implica coste de memoria KV-cache elevado; en GPUs de consumo habrá que limitar la longitud efectiva.
- No se declaran capacidades multimodales ni de audio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/Nanbeige4.2-3B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.2-3B
- Modelo base (pre-entrenamiento): https://huggingface.co/Nanbeige/Nanbeige4.2-3B-Base
- Informe técnico: https://arxiv.org/abs/2607.22083
- Fork de llama.cpp: https://github.com/Nanbeige/llama.cpp
- llama.cpp upstream: https://github.com/ggerganov/llama.cpp
