# ssurface/cot-dialect-qwen3-4b-instruct-sft-l4

## Resumen

Este modelo es un adaptador LoRA de compresión de cadenas de razonamiento (chain-of-thought) desarrollado por ssurface (Anatolii Frolov) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. El adaptador, denominado «L4 dialect», reexpresa las cadenas de pensamiento en un formato ultracompacto de asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`), reduciendo la longitud media de la cadena de razonamiento a unos 41 caracteres, frente a los 532 caracteres del nivel L1 (prosa verbosa). El objetivo es mapear el Pareto longitud-precisión en el ajuste fino supervisado de un razonador de 4B parámetros, manteniendo una precisión aceptable en tareas de razonamiento matemático con una huella de cómputo mucho menor.

El modelo se entrena mediante destilación supervisada (SFT) sobre el conjunto de entrenamiento de GSM8K, reexpresado a nivel L4 por un modelo profesor. El adaptador tiene un tamaño de 0.1 GB y se distribuye en formato PEFT (safetensors). Es relevante porque demuestra que es posible comprimir drásticamente las cadenas de razonamiento sin colapsar por completo la precisión, lo que tiene implicaciones directas para la eficiencia en inferencia y el coste computacional en despliegues a gran escala. La licencia Apache-2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | No especificada; entrenado con secuencias de hasta 1024 tokens |
| Tipos de cuantizacion | No disponible (entrenado en bf16) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base Qwen3-4B-Instruct-2507, un transformer decoder de 4B parámetros con soporte para modo thinking y no-thinking. El entrenamiento consiste en una destilación supervisada donde el modelo profesor reexpresa los problemas de GSM8K a nivel L4 (asignaciones encadenadas con punto y coma). Se utilizan 6976 ejemplos de entrenamiento con una mediana de cadena de razonamiento de 41 caracteres dentro de la etiqueta `thinking`. La configuración de LoRA es r=16, alpha=32, dropout=0.05, con 3 épocas, learning rate 2e-4 con scheduler coseno y warmup del 3%, batch efectivo de 64 (16 x 4 grad-accum), y precisión bf16. El entrenamiento se realizó en una sola NVIDIA A100 de 80GB. La pérdida se calcula únicamente sobre la completion, con las longitudes de prompt precomputadas en tiempo de carga en lugar de mediante búsqueda de patrones, lo que evita que el prior de tool-calling del modelo base se filtre en las cadenas.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento comprimidas a nivel L4 (formato de asignaciones encadenadas).
- Generacion de texto basada en el modelo base, aunque el adaptador esta especializado en problemas de palabras matematicas.
- Soporte de modo thinking/no-thinking heredado del modelo base, aunque el adaptador fuerza cadenas en formato comprimido.
- No incluye tool calling, vision, audio ni capacidades multilingues (solo ingles).
- Disenado para evaluar el equilibrio entre longitud de razonamiento y precision en tareas de GSM8K.

## Casos de uso

- Investigacion en compresion de cadenas de razonamiento: permite estudiar como varia la precision en funcion de la longitud de la cadena, manteniendo fijos el conjunto de problemas, el modelo base y los hiperparametros.
- Evaluacion de eficiencia en inferencia: al reducir la cadena de razonamiento a ~41 caracteres, se reduce el numero de tokens generados por consulta, lo que disminuye la latencia y el coste de computo en despliegues masivos.
- Benchmark de razonamiento matematico en entornos con restricciones de memoria o presupuesto: el adaptador puede usarse para medir la degradacion de precision cuando se fuerza un formato de razonamiento ultracompacto.
- Pruebas de destilacion de conocimiento: sirve como ejemplo de como un modelo profesor puede comprimir el razonamiento de un modelo alumno sin perder demasiada exactitud.
- Analisis de robustez del modelo base: al comparar el rendimiento del adaptador con el del modelo base sin adaptar, se puede cuantificar el impacto de la compresion en la capacidad de razonamiento.
- Desarrollo de sistemas de razonamiento de bajo coste: en aplicaciones donde el presupuesto de tokens es critico (por ejemplo, APIs de pago por token), este adaptador ofrece una alternativa para tareas de aritmetica basica.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 73.7% |

Resultados declarados por el autor: greedy decoding, single-turn, sin ejemplos, sin self-consistency. El autor indica que la precision cae con la dificultad del problema y que diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (95% half-width ~2.7 pp a n=1317). No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA tiene un tamano de 0.1 GB, por lo que su carga es trivial en cualquier GPU.
- El modelo base Qwen3-4B-Instruct-2507 tiene 4B parametros; en bf16 requiere aproximadamente 8 GB de VRAM (4B x 2 bytes). Con cuantizacion a 4 bits, puede caber en GPUs consumer de 6-8 GB (por ejemplo, RTX 3060, RTX 4060).
- GPUs recomendadas: A100 80GB para entrenamiento (como se uso), y para inferencia cualquier GPU con al menos 8 GB de VRAM en bf16, o 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers + peft (codigo de ejemplo incluido), vLLM, TGI, o llama.cpp si se convierte el adaptador a GGUF (no se proporciona conversion oficial).
- Latencia y throughput: no disponibles. Al reducir la longitud de la cadena de razonamiento, se espera una generacion mas rapida que con el modelo base en modo thinking, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Base | Tecnica | GSM8K (test) | Licencia |
|---|---|---|---|---|
| ssurface/cot-dialect-qwen3-4b-instruct-sft-l4 | Qwen3-4B-Instruct-2507 | SFT (LoRA) con CoT comprimido L4 | 73.7% | Apache-2.0 |
| ssurface/qwen3-4b-grpo-l4 | Qwen3-4B-Instruct-2507 | GRPO con CoT comprimido L4 | No disponible | Apache-2.0 |
| Qwen/Qwen3-4B-Instruct-2507 (base) | - | - | No disponible | Apache-2.0 |

No se dispone de resultados comparativos publicados para el modelo base ni para el adaptador GRPO en la informacion proporcionada. La familia de adaptadores cubre niveles de compresion L1 a L5, con longitudes de cadena que van de ~532 a ~16 caracteres (rango 33x), pero solo se reportan datos para el nivel L4.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas (GSM8K); no se garantiza rendimiento en otras tareas.
- La precision cae con la dificultad del problema, especialmente en los niveles de compresion mas agresivos.
- Los resultados son de una unica semilla; diferencias de un par de puntos porcentuales pueden deberse al azar (95% half-width ~2.7 pp a n=1317).
- Solo soporta ingles; no hay soporte multilingue.
- El adaptador fuerza un formato de razonamiento especifico (asignaciones encadenadas con punto y coma) que puede no ser adecuado para todos los tipos de problemas.
- No se proporcionan garantias de rendimiento en produccion; se recomienda validar en el caso de uso concreto antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Repositorio del proyecto: https://github.com/ssurface3/qwen3-cot-compression
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B
- Adaptador relacionado (GRPO L4): https://huggingface.co/ssurface/qwen3-4b-grpo-l4
- Repositorio oficial de Qwen3: https://github.com/QwenLM/Qwen3
- Technical report de Qwen3: https://arxiv.org/html/2505.09388v1
