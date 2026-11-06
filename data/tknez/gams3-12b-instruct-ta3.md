# tknez/GaMS3-12B-Instruct-TA3

## Resumen

GaMS3-12B-Instruct-TA3 es un modelo de lenguaje publicado por el usuario tknez en Hugging Face, derivado de la familia Gemma 3 en su variante de 12B parámetros y ajustado para instrucciones. El repositorio contiene pesos en formato safetensors con un total de 11.766.034.176 parámetros, lo que confirma que se trata de la variante densa de 12B de Gemma 3 (etiqueta interna `gemma3_text`). El sufijo "TA3" no está documentado en la información disponible y probablemente hace referencia a una configuración de entrenamiento o ajuste específica del autor.

El modelo se presenta como un fine-tune de instrucciones sobre la arquitectura Gemma 3, que combina atención local y global con soporte de contexto largo y capacidades multimodales en la familia original. Sin embargo, la model card no está disponible en la información proporcionada, por lo que no se pueden confirmar detalles sobre el dataset de ajuste, el proceso de alineación ni las capacidades efectivas tras el fine-tuning.

Su relevancia es limitada por el momento: con 40 descargas y sin likes, es un modelo de nicho, sin documentación pública ni benchmarks. Resulta útil únicamente como punto de partida para experimentación local con la arquitectura Gemma 3 12B, siempre que se asuma la ausencia de garantías sobre calidad, licencia y comportamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Gemma 3, `gemma3_text`) |
| Parámetros totales | 11.766.034.176 (~11,8B) |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la familia Gemma 3 soporta hasta 128K en la variante 12B, pero no se confirma en este fine-tune) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 23,6 GB |

## Arquitectura y entrenamiento

El modelo se basa en `gemma3_text`, el submodelo de texto de Gemma 3, un transformer denso con atención por ventanas locales intercalada con capas de atención global, normalización RMSNorm y activaciones GeGLU. La variante de 12B de Gemma 3 está diseñada para ejecutarse en una sola GPU de consumo de gama alta con cuantización, y en la familia original incorpora una ventana de contexto de hasta 128K tokens, aunque no se confirma que este fine-tune la preserve.

No se dispone de información sobre el proceso de entrenamiento del fine-tune: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o SFT supervisado. El sufijo "TA3" no está explicado en la información disponible. Tampoco hay datos sobre decodificación especulativa, atención lineal u otras innovaciones añadidas por el autor.

## Capacidades

- Generación de texto en modo instructivo, presumiblemente heredada de la base Gemma 3 Instruct, aunque no verificada.
- Razonamiento y matemáticas básicas esperables en un modelo de 12B, sin benchmarks que lo confirmen.
- Generación de código, condicionada al dataset de ajuste no documentado.
- Soporte multilingüe: no disponible (la familia Gemma 3 cubre más de 140 idiomas, pero no se confirma en este fine-tune).
- Tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Modo thinking explícito: no disponible.
- Visión: no disponible (el repositorio solo contiene `gemma3_text`, sin torre visual).

## Casos de uso

- Experimentación local con la arquitectura Gemma 3 12B: sirve para probar pipelines de inferencia (vLLM, llama.cpp, TGI) sobre un checkpoint de 11,8B parámetros en safetensors, sin garantías de calidad respecto al modelo oficial.
- Fine-tuning adicional como base: al ser un checkpoint instructivo, puede usarse como punto de partida para ajustes específicos de dominio, siempre que se valide previamente su comportamiento.
- Evaluación comparativa interna: útil para medir la degradación o mejora respecto a Gemma 3 12B Instruct oficial en tareas concretas de la organización.
- Generación de texto asistida en prototipos: para borradores, resúmenes o reescritura en entornos de desarrollo, con revisión humana obligatoria.
- Investigación sobre fine-tunes comunitarios: permite estudiar cómo varía el comportamiento de un modelo base tras ajustes no documentados.
- Docencia y formación: como ejemplo práctico de despliegue de un modelo de ~12B en hardware de consumo con cuantización, sin compromiso de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: ~23,5 GB solo para pesos, más overhead de KV cache; requiere GPU de 40 GB o superior (A100 40GB, A6000, H100).
- VRAM estimada en cuantización de 8 bits: ~12-13 GB, cabe en RTX 4090 (24 GB) y RTX 3090.
- VRAM estimada en cuantización de 4 bits: ~7-8 GB, cabe en RTX 4070 Ti, RTX 4080 y GPUs de 12 GB o más.
- GPU recomendadas: A100 40/80GB o H100 para FP16 sin cuantización; RTX 4090/3090 para 8 bits; RTX 4080/4070 Ti para 4 bits.
- Despliegue: vLLM y TGI para serving en FP16/BF16; llama.cpp y Ollama para cuantizaciones GGUF (no publicadas por el autor, habría que generarlas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GaMS3-12B-Instruct-TA3 | ~11,8B | no disponible | no disponible | Hugging Face (40 descargas) |
| Gemma 3 12B Instruct (Google) | ~12B | 128K (según documentación oficial de la familia) | Gemma Terms of Use | Hugging Face, Vertex AI |
| Mistral NeMo 12B Instruct | ~12B | 128K | Apache 2.0 | Hugging Face |
| Qwen2.5 14B Instruct | ~14B | 128K | Apache 2.0 | Hugging Face |

La comparación con alternativas es desfavorable en términos de trazabilidad: tanto Gemma 3 12B Instruct oficial como Mistral NeMo y Qwen2.5 cuentan con model cards detalladas, licencias claras y benchmarks publicados, mientras que este fine-tune carece de todos esos elementos.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre dataset, proceso de entrenamiento ni evaluación.
- Licencia no especificada: no se puede garantizar el uso comercial; hay que contactar con el autor o asumir los términos de Gemma.
- Riesgo elevado de alucinación y comportamientos no documentados tras el fine-tune.
- Idiomas soportados sin confirmar; posible degradación en lenguas distintas del inglés respecto a la base.
- Sin benchmarks: imposible comparar su calidad con el modelo oficial de Google.
- Solo pesos de texto: no incluye torre visual, aunque la familia Gemma 3 sea multimodal.
- Repositorio de 23,6 GB sin cuantizaciones publicadas: obliga a generar GGUF o AWQ por cuenta propia.
- Baja adopción (40 descargas, 0 likes): sin comunidad que valide su comportamiento.
- No apto para producción sin una evaluación exhaustiva previa y una revisión legal de la licencia.

## Enlaces

- Hugging Face: https://huggingface.co/tknez/GaMS3-12B-Instruct-TA3
- Gemma 3 (familia base): https://huggingface.co/google/gemma-3-12b-it
- Documentación de Gemma 3 en Google AI: https://ai.google.dev/gemma/docs
