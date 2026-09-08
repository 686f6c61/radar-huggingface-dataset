# trinityomnis/OpenThinker-32B

## Resumen

OpenThinker-32B es un modelo de lenguaje de razonamiento desarrollado por el equipo OpenThoughts, basado en un fine-tuning del modelo Qwen/Qwen2.5-32B-Instruct sobre el dataset OpenThoughts-114k. Este dataset es una destilación de DeepSeek-R1 generada mediante un pipeline de código abierto. El modelo resuelve el problema de acceder a modelos de razonamiento de alto rendimiento con pesos, datos y código completamente abiertos, en contraste con alternativas cerradas como OpenAI o Gemini. Con 32.763.876.352 parámetros y una arquitectura transformer densa, el modelo fue entrenado con una longitud de contexto de 16k tokens. Su relevancia radica en que es totalmente reproducible y ofrece resultados competitivos en benchmarks de razonamiento matemático, científico y de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), basado en Qwen2.5-32B-Instruct |
| Parametros totales | 32.763.876.352 (~32.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 16k (longitud de contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

OpenThinker-32B es un fine-tuning completo del modelo Qwen2.5-32B-Instruct, que es un transformer denso tipo decoder-only. El entrenamiento se realizó sobre el dataset OpenThoughts-114k, compuesto por 114.000 ejemplos destilados de DeepSeek-R1 mediante el pipeline open-thoughts. Se utilizó LlamaFactory con 3 épocas, longitud de contexto de 16k, learning rate de 1e-5, batch size total de 96 y scheduler cosine con warmup del 10%. El entrenamiento se llevó a cabo en AWS SageMaker con 8xH100 P5 nodes; en 4 nodos tardó aproximadamente 90 horas. También se menciona un entrenamiento adicional con OpenThoughts-Unverified-173k en 96 nodos de 4xA100 (64 GB) durante 30 horas, pero eso corresponde al modelo Unverified, no al OpenThinker-32B estándar.

## Capacidades

- Razonamiento matemático: destaca en AIME24 (66.0) y MATH500 (90.6), lo que indica capacidad para resolver problemas de olimpiadas y matemáticas avanzadas.
- Razonamiento científico: 61.6 en GPQA Diamond, un benchmark de preguntas de nivel de posgrado en física, química y biología.
- Generación de código: 68.9 en LCBv2, un benchmark de problemas de programación competitiva.
- Razonamiento multi-paso: al estar destilado de DeepSeek-R1, el modelo genera cadenas de pensamiento extensas antes de responder.
- Multilingüe: no disponible en la información proporcionada.
- Tool calling / function calling: no documentado en la información disponible.
- Visión / audio: no soportado (el modelo base Qwen2.5-32B-Instruct es de texto).

## Casos de uso

- Resolución de problemas matemáticos avanzados: el modelo puede utilizarse como asistente en olimpiadas matemáticas o en investigación, gracias a su rendimiento en AIME24 y MATH500.
- Generación de código en entornos educativos: con 68.9 en LCBv2, puede ayudar a estudiantes a depurar algoritmos y explicar soluciones de programación competitiva.
- Razonamiento científico para revisión de literatura: el modelo puede procesar preguntas de nivel de posgrado en ciencias, apoyando la formulación de hipótesis.
- Tutoría personalizada en STEM: puede desglosar problemas complejos en pasos intermedios, útil para plataformas educativas.
- Análisis cuantitativo y estadístico: puede resolver problemas que requieren razonamiento numérico y lógica formal.
- Investigación en destilación de razonamiento: al ser open source, permite estudiar cómo el dataset OpenThoughts-114k afecta el rendimiento frente a otros métodos de destilación.
- Agentes de razonamiento multi-paso: aunque no hay soporte documentado de tool calling, el modelo puede generar secuencias de razonamiento largas, lo que lo hace adecuado para pipelines de decisión.

## Benchmarks y rendimiento

Resultados declarados por el autor y evaluados con la herramienta Evalchemy.

| Model Name | Dataset Size | AIME24 I/II | AIME25 I | MATH500 | GPQA Diamond | LCBv2 |
|---|---|---|---|---|---|---|
| LIMO-32B | 0.8k | 56.7 | 49.3 | 86.6 | 58.1 | 60.0 |
| s1-32B | 1k | 36.0 | 25.3 | 84.8 | 50.5 | 40.9 |
| s1.1-32B | 1k | 64.7 | 49.3 | 89.0 | 60.1 | 65.5 |
| DeepSeek-R1-Distill-Qwen-32B | 800k (closed) | 76.7 | 55.9 | 89.4 | 57.6 | 71.2 |
| OpenThinker-32B | 114k | 66.0 | 53.3 | 90.6 | 61.6 | 68.9 |

## Requisitos de hardware

- VRAM estimada: en precisión FP16, los pesos ocupan aproximadamente 65.5 GB, por lo que se necesita una GPU con al menos 80 GB de VRAM (A100/H100) o reparto entre varias GPUs.
- GPU recomendadas: A100 80GB, H100 80GB. No cabe en una RTX 4090 de 24GB sin cuantización.
- Cuantización: no disponible en la información proporcionada; se requeriría convertir el modelo a formatos como GGUF o GPTQ para reducir VRAM.
- Opciones de despliegue: vLLM, Transformers con accelerate, text-generation-inference (TGI), llama.cpp (si se convierte a GGUF).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OpenThinker-32B | 32.8B | 16k (entrenamiento) | Apache 2.0 | Abierto (pesos, datos, código) |
| LIMO-32B | No disponible | No disponible | No disponible | No disponible |
| s1.1-32B | No disponible | No disponible | No disponible | No disponible |
| DeepSeek-R1-Distill-Qwen-32B | No disponible | No disponible | No disponible | Pesos abiertos, datos cerrados |

## Limitaciones y advertencias

- Sesgos: no documentados; al ser destilado de DeepSeek-R1, puede heredar sesgos del modelo original.
- Alucinación: no hay información específica, pero como todo modelo generativo, puede producir contenido factual incorrecto.
- Contexto: entrenado con 16k, por lo que el rendimiento puede degradarse en ventanas mayores; el modelo base soporta más, pero no está verificado.
- Licencia: Apache 2.0 permite uso comercial, sin restricciones significativas.
- Caveat: el modelo es un fine-tuning, no un modelo preentrenado; su conocimiento general proviene de Qwen2.5-32B-Instruct.

## Enlaces

- HuggingFace (repo de trinityomnis): https://huggingface.co/trinityomnis/OpenThinker-32B
- HuggingFace (repo original): https://huggingface.co/open-thoughts/OpenThinker-32B
- Paper OpenThoughts: https://arxiv.org/abs/2506.04178
- Blog de lanzamiento: https://www.open-thoughts.ai/blog/launch
- Blog sobre medición de razonamiento: https://www.open-thoughts.ai/blog/measure
- Blog sobre OpenThinker-32B: https://www.open-thoughts.ai/blog/scale
- Repositorio GitHub: https://github.com/open-thoughts/open-thoughts
- Dataset OpenThoughts-114k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-114k
- Dataset OpenThoughts-Unverified-173k: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Unverified-173k
