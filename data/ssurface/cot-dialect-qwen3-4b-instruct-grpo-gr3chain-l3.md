# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l3

## Resumen

El modelo `ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l3` es un adaptador LoRA publicado por el autor ssurface como parte de una colección de investigación sobre compresión de cadenas de razonamiento (Chain-of-Thought Compression Dialects). Se construye sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` y su objetivo es hacer que el modelo razone a un nivel de compresión L3, es decir, con una asignación simbólica por línea dentro del bloque de pensamiento. Este adaptador concreto es un artefacto de ablación: se entrenó con una variante de recompensa (`gr3`) para evaluar el diseño de recompensas en el entrenamiento GRPO, y no es uno de los modelos principales de la colección.

El adaptador fue entrenado con GRPO sobre el conjunto de datos GSM8K, re-expresado por un modelo profesor a nivel L3, con 6970 ejemplos y una mediana de longitud de cadena de 90 caracteres. Está pensado para reproducir los resultados del estudio de diseño de recompensas, no para uso en producción. La licencia es Apache 2.0 y el repositorio pesa 0,1 GB, consistente con un adaptador LoRA de pequeño tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA, r=16, alpha=32) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo SFT fusionado de nivel L3, no directamente sobre el modelo base. El proceso consiste en aplicar primero el adaptador `ssurface/cot-dialect-qwen3-4b-instruct-sft-l3`, fusionarlo y luego cargar este adaptador GRPO. El entrenamiento usa `trl.GRPOTrainer` con atención `sdpa` y una función de pérdida tipo DAPO. Se generan 8 respuestas por prompt, con un batch de 64 y acumulación de 1, un máximo de 256 tokens de completación, una tasa de aprendizaje de 1e-5 y un coeficiente KL de 0.0. El hardware utilizado fue una NVIDIA A100 de 80 GB.

La recompensa combina cuatro componentes: `correctness` (basada en el número de pasos de la solución dorada), `format` (exige un bloque `thinking` y una respuesta `#### <answer>`), `chain` (verifica que la aritmética interna de la cadena sea correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva, con un suelo de 0.3). El autor destaca que el adaptador se verificó para que `lora_B != 0`, ya que 13 adaptadores con matrices `lora_B` nulas fueron descartados.

## Capacidades

- Razonamiento matematico sobre problemas de palabras del conjunto GSM8K.
- Generacion de cadenas de razonamiento comprimidas a nivel L3, con una asignacion simbolica por linea (por ejemplo, `p = 40`, `w = 2 * 4 = 8`, `T = p * w = 40 * 8 = 320`).
- Formato de salida estructurado: un bloque `thinking` seguido de `response` y la respuesta final precedida de `####`.
- No se documentan capacidades de tool calling, agentes, vision ni audio; el modelo es exclusivamente textual.

## Casos de uso

- Reproduccion de experimentos de diseno de recompensas: este adaptador permite replicar la ablacion `gr3` del estudio de compresion de cadenas de razonamiento, comparando su rendimiento con el modelo principal del mismo nivel.
- Evaluacion de robustez de la compresion de CoT: puede usarse para medir como afecta la recompensa multiplicativa a la precision en problemas aritmeticos de dificultad variable.
- Investigacion sobre verificacion de cadenas: el componente `chain` de la recompensa permite estudiar si la verificacion interna de la aritmetica mejora la fiabilidad de las respuestas.
- Benchmarking de adaptadores LoRA en tareas de razonamiento: sirve como punto de comparacion para otros adaptadores de la misma coleccion (niveles L1 a L5).
- Estudio de trade-off entre longitud de cadena y precision: al ser un artefacto de compresion, permite analizar como la reduccion de tokens de razonamiento afecta al rendimiento.
- Desarrollo de tecnicas de entrenamiento con GRPO: el codigo y la configuracion documentada son utiles para quienes investigan metodos de optimizacion de politicas con recompensas mixtas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que este adaptador no fue evaluado por separado y que los niveles con numeros reportados pertenecen al conjunto principal de la coleccion, no a esta ablacion.

## Requisitos de hardware

- El entrenamiento se realizo en una NVIDIA A100 de 80 GB, pero para inferencia los requisitos son los del modelo base Qwen3-4B-Instruct-2507 mas el adaptador LoRA.
- El modelo base de 4B parametros en precision bfloat16 requiere aproximadamente 8 GB de VRAM, por lo que cabe en GPUs consumer como RTX 3090, RTX 4090 o similares.
- Con cuantizacion (por ejemplo, 4 bits) puede ejecutarse en GPUs de 6 GB o menos, aunque no se proporcionan datos especificos para este adaptador.
- Opciones de despliegue: transformers con PEFT, vLLM, llama.cpp u Ollama, siempre que soporten la carga de adaptadores LoRA sobre el modelo base.
- La latencia y el throughput no estan documentados; dependen del hardware y del backend utilizado.

## Comparativa con modelos similares

No disponible. No se proporcionan datos comparativos con otros modelos en la informacion del repositorio. La comparacion natural seria con los adaptadores principales de la misma coleccion (por ejemplo, `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l3`), pero no se incluyen metricas en la model card.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de palabras (GSM8K); no es adecuado para otras tareas sin adaptacion.
- La precision disminuye con la dificultad del problema, especialmente en los niveles de compresion mas agresivos.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta especifica sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Debe cargarse sobre el adaptador SFT de nivel L3 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l3`) y fusionarse antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados.
- Resultados basados en una sola semilla; diferencias de unos pocos puntos porcentuales pueden estar dentro del ruido estadistico (intervalo de confianza del 95% de aproximadamente 2,7 puntos porcentuales con n=1317).
- Riesgo de alucinacion y errores aritmeticos en problemas complejos, comun en modelos de razonamiento comprimido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3chain-l3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l3
- Conjunto de datos: https://huggingface.co/datasets/openai/gsm8k
- Referencia citada: Frolov, Anatolii. "Chain-of-Thought Compression Dialects" (2026, preprint sin enlace publicado).
