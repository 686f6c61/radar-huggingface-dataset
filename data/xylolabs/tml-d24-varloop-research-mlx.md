# Xylolabs/TML-d24-varloop-research-MLX

## Resumen

TML-d24-varloop-research MLX es la conversión a formato MLX del modelo multimodal de investigación TML-d24-varloop-research, desarrollado por Thinking Machines Lab y cuantizado por Xylolabs. Se trata de un modelo de arquitectura MoE (mixture of experts) con capas en bucle variable ("variable-looped"), un contrapunto experimental de Inkling 2 Mini en el que el número de pasadas por las capas recurrentes puede elegirse en tiempo de inferencia sobre un mismo conjunto de pesos. Acepta entradas de texto e imagen y genera texto, con 26.388.559.360 parámetros totales y un checkpoint de unos 18,1 GB en el repositorio MLX.

La relevancia de esta ficha reside en dos factores. Por un lado, el modelo original es una pieza de investigación abierta (Apache 2.0) que permite estudiar cómo afecta el cómputo recurrente adicional a la capacidad del modelo, algo poco habitual en pesos públicos. Por otro, esta conversión concreta demuestra una estrategia de cuantización mixta que preserva los expertos enrutados en sus formatos originales de baja precisión (NVFP4 en las capas 0-19 y MXFP8 en las 20-23) mientras deja atención, embeddings y LM head en 8 bits afín, con una divergencia KL media frente a BF16 de 0,003331 en WikiText-2 y un 97,436% de acuerdo top-1.

Cabe señalar que el modelo está pensado para investigación, no para producción: la librería `mlx-lm` 0.32.2 no reconoce la arquitectura y requiere instalar un pull request concreto (PR 2086), la entrada de imagen no ha sido verificada por el autor de la conversión y la cabeza de predicción multi-token del original no se incluye. El idioma declarado es inglés, aunque el modelo base menciona soporte multilingüe general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capas en bucle variable (variable-looped), multimodal texto-imagen; visión incluida |
| Parametros totales | 26.388.559.360 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados en NVFP4 (capas 0-19, group size 16) y MXFP8 (capas 20-23, group size 32); atención, embedding y LM head en 8 bits afín (group size 64); torre de visión, normas y controladores de bucle en bf16 o f32 |
| Idiomas soportados | Inglés (declarado); el modelo base menciona soporte multilingüe general |
| Licencia | Apache 2.0, sujeta a la Model Acceptable Use Policy de Thinking Machines |
| Formato de pesos | safetensors en formato MLX (librería `mlx-lm`) |

## Arquitectura y entrenamiento

El modelo es un transformer con mezcla de expertos (MoE) que incorpora capas en bucle: las capas 6 a 17 se ejecutan de forma recurrente y, en esta variante "varloop", el número de pasadas es configurable en inferencia (el `config.json` de esta conversión fija 3 pasadas). Esta capacidad de variar los bucles sobre un único conjunto de pesos es precisamente el objeto de estudio del modelo: permite comparar de forma limpia cómo el cómputo recurrente adicional modifica el comportamiento interno y las capacidades globales. La arquitectura incluye además una torre de visión para entradas de imagen y una cabeza de predicción multi-token en el original, que no se ha incluido en esta conversión MLX.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada. La cuantización aplicada por Xylolabs mantiene los expertos enrutados en sus precisiones originales (NVFP4 y MXFP8) y convierte el resto de capas lineales a 8 bits afín, con la torre de visión, las normas y los controladores de bucle en bf16 o f32 para preservar estabilidad numérica. La conversión se realizó con `mlx-lm` y el código de referencia está en el PR 2086 de `mlx-lm`.

## Capacidades

- Generación de texto conversacional a partir de entradas de texto.
- Procesamiento de entradas de imagen (pipeline `image-text-to-text`), aunque el autor de la conversión indica que la entrada de imagen no ha sido verificada.
- Razonamiento con cómputo recurrente ajustable: el número de bucles de las capas 6-17 puede modificarse en inferencia sobre los mismos pesos.
- Soporte multilingüe general según el modelo base, con inglés como idioma principal declarado.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte explícito de agentes o razonamiento multi-paso en la información disponible.
- No se documentan modos especiales como thinking mode, audio o decodificación especulativa.

## Casos de uso

- Investigación sobre modelos con capas recurrentes: el modelo permite variar el número de bucles en inferencia sobre un mismo checkpoint, lo que facilita experimentos controlados sobre el efecto del cómputo recurrente en la representación interna y en las capacidades del modelo.
- Estudio de eficiencia de cuantización mixta: la combinación de expertos en NVFP4/MXFP8 con capas densas en 8 bits afín sirve como caso de referencia para analizar la degradación (KL de 0,003331 en WikiText-2) frente a BF16 en arquitecturas MoE.
- Prototipado local en Apple Silicon: al estar en formato MLX y ocupar unos 18,1 GB, puede ejecutarse en Macs con memoria unificada de 32 GB o más mediante `mlx-lm`, lo que lo hace adecuado para pruebas de concepto en estación de trabajo.
- Experimentos académicos de multimodalidad: la torre de visión incluida permite explorar tareas de imagen-texto, siempre con la cautela de que la ruta de imagen no está verificada por el conversor.
- Evaluación comparativa de arquitecturas MoE: útil como baseline abierto para comparar con modelos MoE de tamaño similar en tareas de generación de texto en inglés.
- Reproducción de resultados de investigación: al publicarse los pesos y el código del PR de `mlx-lm`, permite reproducir y auditar los experimentos del modelo original en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de fidelidad de la cuantización frente a BF16:

| Metrica | WikiText-2 | Chat | Held-out |
|---|---:|---:|---:|
| KL media frente a BF16 (menor es mejor) | 0,003331 | 0,019627 | 0,002881 |
| Acuerdo top-1 con BF16 | 97,436% | 96,696% | 97,520% |
| Tamano del checkpoint | 18,09 GB | 18,09 GB | 18,09 GB |

## Requisitos de hardware

- VRAM/memoria estimada: el checkpoint MLX ocupa 18,09 GB; el modelo original requiere al menos 32 GB de memoria GPU o unificada.
- Configuraciones de ejemplo indicadas por el autor del modelo base: 1x NVIDIA DGX Spark, 1x GPU NVIDIA con 32 GB o más de VRAM (por ejemplo, GeForce RTX 5090 o RTX PRO 6000 Blackwell), o un Mac con Apple Silicon y 32 GB o más de memoria unificada.
- Cabe en GPU de consumo: sí, en tarjetas con 32 GB o más de VRAM (RTX 5090); en Apple Silicon, en Macs con 32 GB o más de memoria unificada.
- Opciones de despliegue: `mlx-lm` (requiere instalar el PR 2086, commit `0c4c99192230f1943dd468d297f0b8a64ae7b7c2`), con comandos `mlx_lm.generate` y `mlx_lm.chat`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TML-d24-varloop-research MLX (esta ficha) | 26.388.559.360 | no disponible | Apache 2.0 | MLX safetensors | MoE con bucles variables, multimodal, cuantización mixta NVFP4/MXFP8/8-bit |
| Inkling 2 Mini (modelo de referencia del autor) | no disponible | no disponible | no disponible | no disponible | Ejecuta las capas en bucle un número fijo de veces; el varloop permite variarlo en inferencia |
| thinkingmachines/TML-d24-varloop-research (original) | 26.388.559.360 | no disponible | Apache 2.0 | safetensors (NVFP4/MXFP8/BF16) | Incluye cabeza de predicción multi-token; requiere 32 GB o más de memoria |

No se dispone de datos de benchmarks que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Modelo de investigación: no está pensado para producción ni se distribuye mediante API (tampoco a través de Tinker).
- La entrada de imagen está incluida en la arquitectura, pero el autor de la conversión MLX indica que no ha sido verificada.
- La cabeza de predicción multi-token del modelo original no se incluye en esta conversión.
- `mlx-lm` 0.32.2 no reconoce la arquitectura; es obligatorio instalar el PR 2086 en el commit indicado, lo que añade fragilidad al despliegue.
- Idioma principal declarado: inglés; el soporte multilingüe general del modelo base no está cuantificado.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación.
- Licencia Apache 2.0, pero el uso está sujeto a la Model Acceptable Use Policy de Thinking Machines; conviene revisarla antes de cualquier uso comercial.
- El conversor declara no estar afiliado ni respaldado por Thinking Machines Lab.
- La longitud de contexto no está documentada, lo que impide planificar cargas de trabajo con ventanas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/TML-d24-varloop-research-MLX
- Modelo base: https://huggingface.co/thinkingmachines/TML-d24-varloop-research
- Pull request de `mlx-lm` con soporte de la arquitectura: https://github.com/ml-explore/mlx-lm/pull/2086
- Repositorio de herramientas de cuantización de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Model Acceptable Use Policy de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
- Licencia del repositorio: https://huggingface.co/Xylolabs/TML-d24-varloop-research-MLX/blob/main/LICENSE
