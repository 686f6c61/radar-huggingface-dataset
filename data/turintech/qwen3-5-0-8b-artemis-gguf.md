# turintech/Qwen3.5-0.8B-Artemis-GGUF

## Resumen

Qwen3.5-0.8B-Artemis-GGUF es una cuantización en formato GGUF del modelo base Qwen/Qwen3.5-0.8B, publicada por TurinTech bajo el paraguas de su linea "Artemis". El modelo base pertenece a la familia Qwen3.5 de Alibaba y está orientado a generación de texto multimodal (image-text-to-text), con capacidades declaradas de function calling y visión. La versión Artemis se distribuye específicamente para su uso con llama.cpp, Ollama y LM Studio, con el objetivo de ejecutar tool calls y respuestas cortas de chat en GPUs de gama baja.

El modelo cuenta con 752.393.024 parámetros totales en safetensors (aproximadamente 0,8B), lo que lo sitúa en la categoría de modelos ultraligeros. El repositorio GGUF ocupa 2,6 GB e incluye una cuantización principal Q5_K_M de 0,569 GB, además de un proyector de visión de 205 MB para el procesamiento de imágenes. Según la model card, la cuantización Q5_K_M reduce el consumo de VRAM a 1,2 GiB frente a los 2,2 GiB del modelo original, manteniendo e incluso mejorando ligeramente el rendimiento en tool calls (163 de 258 frente a 153 del original en BFCL live).

Su relevancia actual radica en la combinación de tamaño reducido, soporte de function calling y visión en un único artefacto GGUF ejecutable localmente. Esto lo hace adecuado para entornos con recursos limitados donde se necesita un agente ligero o un asistente con capacidad de invocar herramientas, sin depender de APIs externas. La licencia Apache 2.0 facilita su adopción comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5; detalles específicos de atención no disponibles) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 8.192 tokens (configurado en los ejemplos con `-c 8192`; máximo nativo no disponible) |
| Tipos de cuantización | Q5_K_M (principal, 0,569 GB); Q4_K_M (selección por defecto en importaciones sin etiqueta); otras variantes no detalladas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |
| Proyector de visión | 205 MB (mmproj, incluido en el repo) |
| Tamaño del repo | 2,6 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B es un transformer de la familia Qwen3.5 de Alibaba, del cual no se detallan en la información disponible los pormenores de arquitectura interna (tipo de atención, número de capas, dimensiones ocultas) ni la composición del dataset de entrenamiento. La model card no proporciona datos sobre número de tokens de entrenamiento, mezcla de datos, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se documentan innovaciones técnicas específicas del modelo base más allá de las capacidades declaradas (visión y function calling).

La contribución de TurinTech (Artemis) consiste en la cuantización a GGUF con Q5_K_M, la conversión y verificación del proyector de visión, y la publicación de resultados medidos con llama.cpp b11617 (y b11889 para el proyector). La model card indica que la cuantización Q5_K_M mejora ligeramente el rendimiento en BFCL live respecto al original (163 frente a 153 de 258 tool calls correctas), lo que sugiere un ajuste fino o una selección de cuantización optimizada para tool calling. No se documenta si Artemis implica entrenamiento adicional o únicamente cuantización; la relación declarada con el modelo base es "quantized".

## Capacidades

- Generación de texto conversacional en formato chat multi-turno.
- Function calling / tool calling: soporte de herramientas con esquema JSON, validado en BFCL live.
- Procesamiento de imágenes (image-text-to-text) mediante el proyector de visión incluido (205 MB).
- Razonamiento matemático básico (evaluado en GSM8K).
- Seguimiento de instrucciones (evaluado en IFEval).
- Conocimiento general y razonamiento de dominio (evaluado en MMLU-Pro).
- Modo "thinking" configurable mediante `enable_thinking`; desactivado por defecto en la plantilla, recomendado desactivarlo para respuestas cortas y tool calls.
- Compatibilidad con endpoints OpenAI (`/v1/chat/completions`) a través de llama-server.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agente local de tool calling en GPUs de gama baja: con 1,2 GiB de VRAM en Q5_K_M, el modelo puede gestionar invocaciones de funciones en un servidor llama.cpp con `--jinja`, adecuado para asistentes de automatización doméstica o de laboratorio donde no se dispone de GPU de datacenter.
- Asistente de chat breve embebido: gracias a su tamaño (0,569 GB) y a la desactivación del modo thinking, puede ofrecer respuestas cortas y rápidas en aplicaciones de escritorio o móviles mediante Ollama o LM Studio, sin latencia de red.
- Automatización de pipelines con function calling: integrable en flujos de CI/CD o scripts de operaciones que necesiten invocar APIs (por ejemplo, consultar el tiempo, lanzar tareas) mediante esquemas JSON, aprovechando su rendimiento en BFCL live (163/258).
- Procesamiento de imágenes con descripción textual: el proyector de visión permite tareas de image-text-to-text como captioning o respuesta a preguntas sobre imágenes en entornos con recursos limitados, cargando el mmproj opcional.
- Prototipado rápido de agentes multi-paso: al soportar tool calling y contexto de 8.192 tokens, sirve para validar lógicas de agente antes de escalar a modelos mayores, con coste de hardware mínimo.
- Evaluación y docencia: su licencia Apache 2.0 y su reducido tamaño lo hacen idóneo para experimentos académicos sobre cuantización, tool calling y multimodalidad en hardware consumer.
- Asistente de soporte técnico de primer nivel: respuestas cortas y consultas a herramientas (por ejemplo, estado de un pedido) en un chatbot local sin depender de la nube.

## Benchmarks y rendimiento

Resultados declarados por el autor (TurinTech) en la model card; no verificados de forma independiente. Todas las mediciones se realizaron con thinking desactivado.

| Benchmark | Métrica | Resultado Artemis Q5_K_M | Resultado modelo original |
|---|---|---|---|
| BFCL live | Tool calls correctas | 163 de 258 | 153 de 258 |
| GSM8K (últimas 250) | Correctas | 124 de 250 | no disponible |
| MMLU-Pro (muestra) | Correctas | 33 de 280 | no disponible |
| IFEval | Instrucciones seguidas | 308 de 539 | no disponible |

## Requisitos de hardware

- VRAM estimada: 1,2 GiB en Q5_K_M con contexto de 8.192 tokens y un solo slot (`-np 1`), según medición del autor; el modelo original requiere 2,2 GiB.
- Tamaño en disco: 0,569 GB para el archivo Q5_K_M; 2,6 GB para el repositorio completo (incluye otras variantes y el proyector de visión de 205 MB).
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM libre; cabe en iGPU y en GPUs de gama baja (por ejemplo, GTX 1650, RTX 3050). Para mayor throughput, una RTX 4090 o A100 no aportan ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs actuales e incluso en CPU.
- Opciones de despliegue: llama.cpp (llama-server, versión b11617 o superior con soporte Qwen3.5), Ollama (`ollama run turintech/qwen3.5-0.8b-artemis`), LM Studio (`turintech/qwen3.5-0.8b-artemis`).
- Latencia y throughput: no disponibles de forma numérica; el autor advierte que con thinking activado una pregunta corta consumió los 1.500 tokens de salida sin devolver respuesta, por lo que se recomienda desactivarlo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling | Visión | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-Artemis (este) | 752 M | 8.192 (configurado) | Sí (BFCL 163/258) | Sí (mmproj) | Apache 2.0 | GGUF |
| Qwen3.5-0.8B (base) | 752 M | no disponible | Sí (BFCL 153/258) | Sí | Apache 2.0 | safetensors |
| Alternativas de <1B con tool calling | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de otros modelos comparables de la misma categoría (menos de 1B parámetros con tool calling y visión) con datos verificables, por lo que la comparativa se limita al modelo base.

## Limitaciones y advertencias

- Rendimiento limitado por tamaño: 33 de 280 en MMLU-Pro y 124 de 250 en GSM8K indican capacidad de razonamiento y matemáticas modesta; no apto para tareas complejas de conocimiento o cálculo.
- Riesgo de alucinación: inherente a modelos de 0,8B; las respuestas factuales deben verificarse.
- Modo thinking problemático: con thinking activado, el modelo puede consumir todo el presupuesto de salida sin responder; es necesario enviar `"chat_template_kwargs": {"enable_thinking": false}` en cada petición.
- Dependencia de versión: requiere llama.cpp con soporte Qwen3.5 (b11617 o superior) y HTTPS para `-hf`; versiones anteriores pueden fallar.
- Etiqueta de cuantización: las importaciones sin etiqueta (`:Q5_K_M`) seleccionan Q4_K_M por defecto, lo que puede alterar el rendimiento medido.
- Idiomas soportados no documentados: no se garantiza un comportamiento multilingüe adecuado.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar la licencia del modelo base Qwen3.5-0.8B enlazada en la model card.
- Resultados de benchmarks no verificados de forma independiente (`verified: false` en la model-index); treat como indicativos.
- Contexto: los 8.192 tokens son la configuración de ejemplo, no necesariamente el máximo nativo; contextos mayores no están documentados.

## Enlaces

- Hugging Face: https://huggingface.co/turintech/Qwen3.5-0.8B-Artemis-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B/blob/main/LICENSE
- TurinTech: https://www.turintech.ai
- Otros modelos TurinTech: https://huggingface.co/turintech
- Ollama: https://ollama.com/turintech/qwen3.5-0.8b-artemis
- LM Studio: https://lmstudio.ai/turintech/qwen3.5-0.8b-artemis
- Discord de TurinTech: https://discord.gg/5mCDSyU9sT
- LinkedIn de TurinTech: https://www.linkedin.com/company/turintechai
