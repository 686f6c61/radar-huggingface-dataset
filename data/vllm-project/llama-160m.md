# vllm-project/llama-160m

## Resumen

`vllm-project/llama-160m` es una copia del checkpoint `JackFram/llama-160m` (commit `aca9b68`) publicada por el equipo de vLLM el 30 de octubre de 2026. El modelo original es un transformer de tipo LLaMA con 162.417.792 parámetros, entrenado sobre Wikipedia y porciones de C4-en y C4-realnewslike. Su propósito original no es servir como modelo de propósito general, sino actuar como modelo especulativo pequeño (draft model) en el marco de decodificación especulativa SpecInfer.

La copia la mantiene el proyecto vLLM para sus pipelines de integración continua: al vivir el original en una cuenta personal, el equipo replica el checkpoint bajo su propia organización para reducir el riesgo de cadena de suministro en sus tests automatizados. No se ha realizado ninguna evaluación formal del modelo según su model card, por lo que debe tratarse como un artefacto de referencia y no como un modelo listo para producción.

Su relevancia actual es doble: por un lado, sirve como ejemplo canónico de modelo draft para técnicas de inferencia especulativa; por otro, es un checkpoint minúsculo y de licencia Apache 2.0 útil para probar infraestructura de serving (vLLM, pipelines de CI) sin coste de cómputo significativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA |
| Parametros totales | 162.417.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en safetensors de precision completa) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura LLaMA original (decoder-only transformer con normalización RMSNorm, activación SwiGLU y rotary positional embeddings), aunque la model card no detalla hiperparámetros como número de capas, dimensión oculta o número de cabezas. Con 162 millones de parámetros se sitúa en el rango de los modelos pequeños tipo GPT-2 small o distilGPT-2.

El entrenamiento se realizó sobre Wikipedia junto con subconjuntos de C4-en y C4-realnewslike. No se especifica el número total de tokens vistos, la composición exacta del dataset ni si hubo fases de ajuste fino supervisado, RLHF o DPO. La model card indica explícitamente que no se ha llevado a cabo ninguna evaluación, y que el modelo se desarrolló principalmente como Small Speculative Model de referencia para el paper SpecInfer (arXiv:2305.09781), que acelera el serving de LLMs mediante inferencia especulativa y verificación de árboles de tokens.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de modelo base (no instruido).
- Continuación de texto y modelado de lenguaje puro; no se documenta ajuste por instrucciones.
- Uso como draft model en decodificación especulativa (SpecInfer) para acelerar modelos objetivo de mayor tamaño.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Decodificación especulativa en producción: usar el modelo como draft para proponer tokens que un modelo objetivo grande verifica en paralelo, reduciendo la latencia de generación según el esquema de SpecInfer.
- Pruebas de integración continua de motores de inferencia: al ser un checkpoint minúsculo (162 M parámetros, repo de 2,6 GB), permite validar pipelines de vLLM y otras herramientas sin consumir GPUs de gama alta.
- Reproducción de experimentos académicos: sirve como baseline para investigar técnicas de speculative decoding, verificación de árboles de tokens y comparativas de aceptación de draft models.
- Prototipado rápido de aplicaciones de generación de texto en inglés: permite iterar sobre la lógica de aplicación antes de sustituir por un modelo mayor.
- Fine-tuning educativo: su tamaño permite ajustar el modelo completo en una sola GPU consumer para experimentos de investigación sobre modelado de lenguaje.
- Benchmarking de infraestructura: medir throughput y latencia de frameworks de serving con un modelo de referencia de bajo coste computacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente que no se ha realizado ninguna evaluación del modelo.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 650 MB solo para pesos (162 M parámetros × 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en fp16/bf16: aproximadamente 325 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer moderna (RTX 3060, RTX 4090, incluso GPUs de 4-8 GB) y en CPU.
- Opciones de despliegue: vLLM (uso principal en CI del proyecto), así como cualquier framework compatible con safetensors de PyTorch (transformers, TGI, llama.cpp si se convierte a GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Uso previsto |
|---|---|---|---|---|
| vllm-project/llama-160m | 162 M | no disponible | Apache 2.0 | Draft model para SpecInfer, CI de vLLM |
| JackFram/llama-160m | 162 M | no disponible | Apache 2.0 | Checkpoint original del que deriva esta copia |
| GPT-2 small | 124 M | 1024 tokens | MIT | Modelo base de generación de texto en inglés |
| DistilGPT-2 | 82 M | 1024 tokens | MIT | Modelo destilado de generación de texto |

La comparativa se limita a modelos de tamaño similar de la familia de modelos base pequeños; no se dispone de datos de rendimiento comparativo entre ellos en la información proporcionada.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluación formal del modelo; el autor advierte explícitamente de que debe usarse con cuidado.
- Es un modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable ni mantiene diálogos estructurados.
- Solo soporta inglés; no se documenta capacidad multilingüe.
- Riesgo elevado de alucinación y de generar texto incoherente o repetitivo dado su tamaño y su entrenamiento limitado a Wikipedia y subconjuntos de C4.
- Sesgos potenciales heredados de Wikipedia y C4, no documentados ni mitigados.
- Longitud de contexto no especificada, lo que dificulta planificar su uso en tareas con contexto largo.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo no es adecuado para producción como generador de propósito general; su uso comercial realista es como componente interno de infraestructura de inferencia.
- Esta publicación es una copia de conveniencia para CI de vLLM; para citar o referenciar el trabajo original debe usarse el repositorio de JackFram y el paper SpecInfer.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vllm-project/llama-160m
- Checkpoint original: https://huggingface.co/JackFram/llama-160m
- Paper SpecInfer: https://arxiv.org/abs/2305.09781
- Proyecto vLLM: https://github.com/vllm-project/vllm
