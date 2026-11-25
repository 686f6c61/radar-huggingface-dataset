# ZEN-PRODUCT/zen-0.3-beta-GGUF

## Resumen

Zen 0.3 Beta es un ajuste fino (fine-tuning) del modelo Qwen2.5-Coder-7B-Instruct, desarrollado por ZEN-PRODUCT y publicado en estado beta (pre-release) en noviembre de 2026. El objetivo declarado es mejorar las capacidades de programación y razonamiento del modelo base sin degradar sus habilidades matemáticas ni su comprensión de código, empleando para ello hiperparámetros denominados "anti-olvido" (learning rate bajo y mezcla de repetición de datos, replay mixture). Se distribuye principalmente en formato GGUF cuantizado para inferencia local.

Arquitectura y tamaño heredados directamente del modelo base: un transformer decoder-only de Qwen2.5 con 7.615.616.512 parámetros totales (aproximadamente 7,6 mil millones), contexto nativo de 32.768 tokens en la familia Qwen2.5-Coder y licencia qwen-research. El ajuste se realizó con QLoRA de 4 bits, lo que implica que el modelo final no incorpora un entrenamiento completo sino una adaptación sobre los pesos originales.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeño, cuantizado y ejecutable en hardware de consumo, orientado a tareas de código y matemáticas, con soporte únicamente de inglés y ruso. Su condición de beta, el escaso número de descargas (65) y la ausencia de benchmarks publicados lo sitúan como un experimento de la comunidad más que como una opción de producción consolidada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5, base Qwen2.5-Coder-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-Coder; no se especifica en la model card si el ajuste la modifica) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 (formato GGUF) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | qwen-research (heredada de Qwen2.5-Coder-7B-Instruct; etiquetada como "other" en metadatos) |
| Formato de pesos | GGUF (repo de 18,2 GB con múltiples cuantizaciones) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen2.5 estándar para modelos densos: transformer decoder-only con atención de múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). No se introducen modificaciones arquitectónicas respecto al modelo base; el trabajo consiste exclusivamente en un ajuste supervisado mediante QLoRA.

El entrenamiento se realizó con QLoRA en cuantización 4-bit NF4, con rango r=32, alpha=32, learning rate de 4e-05, weight decay de 0,01, longitud de secuencia de 2048 tokens y empaquetado (packed). Se completaron 152 pasos de optimización con aproximadamente 65.000 tokens por paso, lo que suma alrededor de 7,6 horas en una instancia de Kaggle con 2×T4. El conjunto de datos total se estima en unos 54 millones de tokens y combina mezclas de instrucciones generales (allenai/tulu-3-sft-mixture, HuggingFaceTB/smoltalk), datos de código (Magicoder-Evol-Instruct-110K, Magicoder-OSS-Instruct-75K, CodeFeedback-Filtered-Instruction) y datos matemáticos (NuminaMath-CoT, MetaMathQA). El autor menciona explícitamente el uso de una "replay mixture" para mitigar el olvido catastrófico, aunque no detalla su proporción ni composición exacta.

## Capacidades

- Generación de texto conversacional en inglés y ruso.
- Generación y comprensión de código, reforzada mediante datasets específicos de instrucciones de programación.
- Razonamiento matemático con cadenas de pensamiento (Chain-of-Thought), gracias a la inclusión de NuminaMath-CoT y MetaMathQA.
- Razonamiento multi-paso orientado a problemas de código y matemáticas.
- Formato conversacional (chat template heredado de Qwen2.5-Coder-Instruct).
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue vía API.
- No se documenta soporte de tool calling, function calling, visión, audio ni modo de pensamiento explícito en la información disponible.

## Casos de uso

- Asistente de programación en local: con la cuantización Q4_K_M (aproximadamente 4,5-5 GB de pesos) puede ejecutarse en un portátil con GPU de 8 GB o incluso en CPU vía llama.cpp, ofreciendo autocompletado y explicación de código sin depender de servicios en la nube.
- Generación de tests unitarios: el ajuste sobre Magicoder y CodeFeedback permite pedirle que, a partir de una función, produzca casos de prueba en el mismo lenguaje, integrándose en un pipeline de CI como paso previo a la revisión humana.
- Resolución de problemas matemáticos paso a paso: útil para herramientas educativas en ruso o inglés que necesiten explicar la derivación de un resultado, aprovechando el entrenamiento con CoT matemático.
- Refactorización asistida por lotes: mediante scripts que invoquen llama-cli o la API de Ollama, se puede procesar un repositorio y proponer simplificaciones de funciones, con revisión manual posterior.
- Chatbot técnico bilingüe (en/ru): para documentación o soporte interno de equipos con esos dos idiomas, desplegado con Ollama y una ventana de contexto suficiente para manuales extensos.
- Prototipado rápido de agentes de código: al ser un modelo pequeño y cuantizable, sirve para validar flujos de razonamiento multi-paso antes de migrar a un modelo mayor, aunque sin soporte documentado de tool calling nativo habría que implementar el parseo de acciones manualmente.
- Experimentación académica con QLoRA: el modelo y su receta de entrenamiento (hiperparámetros, datasets, tiempo en 2×T4) constituyen una referencia reproducible para estudiar técnicas anti-olvido en ajustes finos de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M en torno a 4,5-5 GB; Q5_K_M en torno a 5,5-6 GB; Q8_0 en torno a 8-8,5 GB (estimaciones a partir del tamaño de parámetros; el autor no publica cifras exactas).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 para Q8_0 con contexto largo; A100 o H100 solo si se necesita alto throughput con contexto de 32k.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más para Q4_K_M/Q5_K_M; Q8_0 requiere 10-12 GB para margen de contexto.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama (`ollama run hf.co/ZEN-PRODUCT/zen-0.3-beta-GGUF:Q4_K_M`), y servidores compatibles con endpoints según el tag del repositorio. No se confirma soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zen 0.3 Beta (este) | 7,6 B | 32.768 (heredado) | qwen-research | GGUF | Beta, sin benchmarks, idiomas en/ru |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32.768 | qwen-research (Apache 2.0 en algunas variantes según la card original) | safetensors, GGUF | Modelo base; benchmarks publicados por Qwen |
| DeepSeek-Coder-V2-Lite-Instruct | 15,7 B (2,4 B activos, MoE) | 128.000 | deepseek (uso comercial permitido con condiciones) | safetensors, GGUF | Mayor contexto y eficiencia MoE, requiere más VRAM |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 | llama2 (uso comercial restringido) | safetensors, GGUF | Alternativa clásica; contexto menor y sin datos matemáticos recientes |

La comparación se limita a parámetros, contexto y licencia: no existen datos de rendimiento publicados para Zen 0.3 Beta que permitan contrastar calidad frente a estas alternativas.

## Limitaciones y advertencias

- Estado beta (pre-release): el autor no garantiza estabilidad ni calidad; no hay benchmarks que respalden las mejoras declaradas frente al modelo base.
- Riesgo de olvido catastrófico parcial: aunque se aplicaron hiperparámetros anti-olvido, un ajuste QLoRA de solo 152 pasos sobre 54 M de tokens puede degradar capacidades no cubiertas por los datasets.
- Idiomas limitados a inglés y ruso: no se garantiza un rendimiento aceptable en castellano ni en otros idiomas, a pesar de que el modelo base Qwen2.5 es multilingüe.
- Riesgo de alucinación inherente a los modelos de 7 B, especialmente en matemáticas avanzadas y en código con APIs poco frecuentes.
- Licencia qwen-research: restringe el uso comercial. Cualquier despliegue en producción debe revisar los términos del modelo base Qwen2.5-Coder-7B-Instruct antes de su uso.
- Sin soporte documentado de tool calling ni function calling: los flujos de agentes requerirían ingeniería adicional de parseo.
- Ventana de contexto de 32k heredada, pero el entrenamiento se realizó con secuencias de 2048 tokens; el rendimiento más allá de esa longitud no está validado.
- Repositorio con 65 descargas y 0 likes: comunidad mínima, sin garantías de mantenimiento ni soporte.
- Tamaño del repo GGUF de 18,2 GB: la descarga completa incluye varias cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ZEN-PRODUCT/zen-0.3-beta-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct/blob/main/LICENSE
- Dataset allenai/tulu-3-sft-mixture: https://huggingface.co/datasets/allenai/tulu-3-sft-mixture
- Dataset HuggingFaceTB/smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset ise-uiuc/Magicoder-Evol-Instruct-110K: https://huggingface.co/datasets/ise-uiuc/Magicoder-Evol-Instruct-110K
- Dataset ise-uiuc/Magicoder-OSS-Instruct-75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset m-a-p/CodeFeedback-Filtered-Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
- Dataset AI-MO/NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
- Dataset meta-math/MetaMathQA: https://huggingface.co/datasets/meta-math/MetaMathQA
