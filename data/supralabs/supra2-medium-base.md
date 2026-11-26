# SupraLabs/Supra2-Medium-Base

## Resumen

Supra2-Medium-Base es un modelo de lenguaje de tipo decoder-only desarrollado por SupraLabs, preentrenado desde cero sobre 20.000 millones de tokens de texto web en inglés. Con 25,37 millones de parámetros totales (unos 20 millones sin contar los embeddings), se posiciona como un modelo extremadamente compacto orientado a investigación sobre eficiencia de parámetros y despliegues en entornos con memoria muy limitada. Emplea la arquitectura Qwen3 con un tokenizador propio de 16.384 tokens.

La relevancia del modelo reside en su ratio de entrenamiento: aproximadamente 800 tokens por parámetro, muy superior al habitual en modelos de esta escala, lo que lo convierte en un banco de pruebas para estudiar escalado eficiente en datos. No obstante, se trata de un modelo base sin ajuste por instrucciones, sin alineamiento y con una ventana de contexto de solo 1.024 tokens, lo que acota drásticamente sus aplicaciones prácticas en producción.

Es importante señalar que sus capacidades de generación son las esperables en un modelo de 25 millones de parámetros: produce texto gramaticalmente plausible a nivel local, pero carece de coherencia global, razonamiento fiable y conocimiento factual. Su licencia Apache 2.0 y su reducido tamaño lo hacen útil para experimentación, docencia y prototipado de bajo coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (Qwen3), MHA, RoPE, RMSNorm, SwiGLU |
| Parametros totales | 25.371.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; sin GGUF oficial) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 con identificador `qwen3-d07-h512-i0896`: 7 capas, tamaño oculto de 512, 8 cabezas de atención con dimensión de cabeza 64 (atención multi-cabeza estándar, MHA, a diferencia de los modelos mayores de la familia Supra2 que usan GQA), tamaño intermedio de 896 en el bloque SwiGLU, vocabulario de 16.384 tokens, embeddings atados, RMSNorm con epsilon 10⁻⁶, RoPE con theta 10.000 y atención completa dentro de la ventana de 1K sin sliding window. La implementación de atención es SDPA.

El entrenamiento se realizó sobre el 100% de `HuggingFaceFW/fineweb-edu` (sample-100BT), con 20.000 millones de tokens tokenizados con el tokenizador propio `tokenizer_16k`, concatenados en un flujo plano `uint16` y empaquetados en bloques contiguos de 1.024 tokens sin enmascaramiento de documentos (las secuencias pueden cruzar límites entre documentos). Se usó AdamW fusionado (β₁=0,9, β₂=0,95, ε=10⁻⁸), learning rate pico de 3×10⁻³ con schedule coseno y mínimo del 10%, 1.000 pasos de warmup, batch efectivo de 262.144 tokens por paso, weight decay 0,1, clipping de gradiente 1,0 y precisión mixta BF16 + TF32. El hardware fueron dos GPU en DDP (RTX 5060 Ti de 16 GB y RTX 5060 de 8 GB) con optimizaciones Liger Kernel y bucketing de gradientes de 10 MB. La pérdida final de entrenamiento fue 3,2469 (sin pérdida de evaluación disponible).

## Capacidades

- Generación de texto en inglés a nivel de continuación local: completa frases y párrafos cortos con sintaxis plausible.
- Modelado de lenguaje base: útil para extracción de representaciones y fine-tuning posterior en tareas específicas.
- No dispone de soporte de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- Capacidad multilingüe nula más allá del inglés: el tokenizador y los datos son exclusivamente ingleses.
- Sin modo de razonamiento (thinking mode), sin visión, sin audio ni otras modalidades.
- Sin ajuste por instrucciones: no responde a formatos de chat ni a directivas.

## Casos de uso

- Investigación sobre eficiencia de datos: permite reproducir y estudiar el efecto del ratio tokens/parámetro en modelos de escala mínima, comparando la curva de pérdida con variantes de 50M y 100M de la misma familia.
- Docencia de arquitecturas transformer: con 7 capas y 512 de dimensión oculta, el modelo es inspeccionable y entrenable en hardware de consumo, lo que facilita explicar atención, RoPE y RMSNorm en un seminario práctico.
- Punto de partida para fine-tuning de tareas acotadas: clasificación de texto, etiquetado o generación de plantillas en dominios muy restringidos donde 25M de parámetros bastan y el coste de inferencia debe ser mínimo.
- Despliegue en dispositivos de borde con memoria severamente limitada: el repositorio ocupa 0,1 GB en bfloat16, por lo que cabe en microcontroladores de gama alta o en memoria compartida de sistemas embebidos.
- Pruebas de infraestructura y pipelines de entrenamiento: sirve como modelo de humo para validar código de tokenización, empaquetado de secuencias y DDP antes de escalar a modelos mayores.
- Generación de texto de relleno y datos sintéticos de baja exigencia: por ejemplo, para poblar entornos de prueba o generar corpus sintéticos de validación de pipelines de NLP.
- Baseline en experimentos de compresión y cuantización: al ser tan pequeño, permite medir el impacto de distintas precisiones numéricas con coste computacional despreciable.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con EleutherAI LM-Eval Harness (acc_norm):

| Modelo | PIQA | HellaSwag | ARC-Easy | ARC-Challenge |
|---|---|---|---|---|
| Supra-50M-Base (50M) | 0,62 | 0,32 | 0,46 | 0,25 |
| Supra2-Medium-Base (25M) | 0,5914 | 0,2929 | 0,4184 | 0,2372 |
| Supra2-100M-Base (100M) | 0,65 | 0,36 | 0,48 | 0,25 |

Pérdida final de entrenamiento: 3,2469. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de otras tareas de razonamiento o código en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 0,1 GB en bfloat16 (25,37M parámetros × 2 bytes ≈ 51 MB de pesos), más el overhead de activaciones y del runtime de PyTorch.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o float16; funciona en CPU sin problema. Las RTX 5060 Ti y RTX 5060 empleadas en el entrenamiento son más que suficientes.
- Cabe holgadamente en cualquier GPU de consumo, incluida una GTX 1650 de 4 GB, y también en memoria unificada de placas tipo Raspberry Pi 5 o en iGPU modernas.
- Opciones de despliegue: transformers con `AutoModelForCausalLM` (soporte oficial), text-generation-inference (etiqueta `text-generation-inference` presente en el repo) y endpoints compatibles. No hay pesos GGUF publicados, por lo que llama.cpp u Ollama requerirían conversión manual.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera throughput muy alto y latencia de milisegundos en GPU moderna, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | PIQA | HellaSwag | Licencia |
|---|---|---|---|---|---|
| Supra2-Medium-Base | 25,37M | 1.024 | 0,5914 | 0,2929 | Apache 2.0 |
| Supra-50M-Base | 50M | no disponible | 0,62 | 0,32 | no disponible |
| Supra2-100M-Base | 100M | no disponible | 0,65 | 0,36 | no disponible |
| SmolLM-135M | 135M | 2.048 | no disponible | no disponible | Apache 2.0 |

La comparación se limita a la propia familia Supra2/Supra porque no hay datos de benchmarks de terceros en la información disponible. Frente a SmolLM-135M, el modelo de SupraLabs es cinco veces menor pero también mucho menos capaz y con la mitad de contexto; la comparación cuantitativa de rendimiento no puede establecerse con los datos aportados.

## Limitaciones y advertencias

- No es un modelo instruido ni alineado: no sigue instrucciones, no mantiene formato de chat y no debe usarse como asistente directo.
- Riesgo elevado de alucinación y de incoherencia a partir de pocas frases; el ejemplo de la model card muestra bucles repetitivos y texto genérico.
- Ventana de contexto de solo 1.024 tokens, insuficiente para documentos, conversaciones multi-turno o código de tamaño medio.
- Entrenado exclusivamente en inglés sobre fineweb-edu; no hay capacidad multilingüe ni conocimiento de dominio especializado.
- Sesgos heredados del corpus web: el modelo puede reproducir estereotipos y afirmaciones factualmente incorrectas sin filtro alguno.
- Sin enmascaramiento de documentos en el entrenamiento: las secuencias pueden cruzar fronteras entre documentos, lo que puede producir continuaciones que mezclan contextos inconexos.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de alineamiento y la baja calidad de salida hacen desaconsejable su uso en producción orientada a usuario final.
- No hay pesos cuantizados oficiales ni resultados de evaluación de pérdida de validación, lo que dificulta estimar generalización fuera del conjunto de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SupraLabs/Supra2-Medium-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Repositorio de transformers: https://github.com/huggingface/transformers
- EleutherAI LM-Eval Harness: https://github.com/EleutherAI/lm-evaluation-harness
- Liger Kernel: https://github.com/linkedin/Liger-Kernel
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
