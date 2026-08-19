# ssurface/cot-dialect-qwen3-4b-instruct-grpo-addlen110-s7-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-addlen110-s7-l5` es un adaptador LoRA desarrollado por `ssurface` (Anatolii Frolov) que modifica el modelo `Qwen/Qwen3-4B-Instruct-2507` para razonar a un nivel de compresión extremo (nivel L5), donde la cadena de pensamiento se colapsa en una única expresión aritmética de unos 16 caracteres de mediana (p. ej. `18/3*2=12`). El objetivo es estudiar cómo afecta la compresión del chain-of-thought a la precisión en razonamiento matemático.

Se trata de una **ablación** publicada para permitir reproducir la comparación de diseños de recompensa del artículo *Chain-of-Thought Compression Dialects*: el modelo principal de este nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`, mientras que este adaptador se entrenó con una variante de recompensa (`addlen110-s7`). El adaptador se entrenó con GRPO sobre un modelo SFT fusionado, usando GSM8K como conjunto de datos, y alcanza un 71.5% de precisión exacta en el test de GSM8K con decodificación greedy.

La relevancia de esta pieza es metodológica: permite aislar el efecto de una componente concreta de la función de recompensa dentro de un pipeline de compresión de razonamiento. No está pensado como un modelo de producción, sino como una herramienta de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; repo de ~0.1 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en bf16; el base puede cuantizarse) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se apila sobre el modelo SFT fusionado `ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`, no directamente sobre el base. El entrenamiento usa `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados; el autor advierte que la ruta fusionada produjo matrices `lora_B` nulas). La funcion de recompensa combina cinco componentes: `correctness` (ponderada por el numero de pasos de la solucion dorada), `format` (exige un bloque `thinking...response` y `#### <answer>`), `length` (penaliza o premia la longitud hacia el objetivo del nivel), `chain` (verifica que la aritmetica interna de la cadena sea correcta) y `gdpo` (normaliza cada recompensa dentro del grupo antes de sumarlas). Se usa loss tipo `dapo`, 8 generaciones por prompt, batch 16x2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL 0.0. El conjunto de entrenamiento son 6993 ejemplos de GSM8K re-expresados a nivel L5 por un modelo profesor, con mediana de cadena de 16 caracteres.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (una sola expresion aritmetica).
- Generacion de texto en ingles siguiendo el formato `thinking...response` + `#### <answer>`.
- No soporta tool calling, ni vision, ni audio.
- No es multilingue: solo entrenado y evaluado en ingles.
- No incluye modo thinking explicito; la compresion es una propiedad del adaptador, no una opcion del usuario.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: permite estudiar como degrada la precision cuando el modelo debe expresar su razonamiento en una unica expresion, comparando con niveles L1-L4 de la misma familia.
- Ablacion de funciones de recompensa: util para reproducir el analisis del articulo sobre el efecto de la componente `addlen` en el entrenamiento GRPO.
- Benchmarking de robustez: al ser una ablacion con una sola semilla, sirve para medir la varianza entre semillas en tareas de razonamiento comprimido.
- Generacion de explicaciones ultra-concisas: en escenarios donde se requiera una respuesta matematica sin justificacion extensa, este adaptador produce una cadena minima.
- Validacion de pipelines de entrenamiento con LoRA: el autor documenta un problema con kernels fusionados que producia adaptadores inertes; este adaptador sirve como caso de verificacion de que `lora_B != 0`.
- Comparacion con el modelo principal del nivel (`...-grpo-l5`) para evaluar el impacto de la recompensa de longitud en la calidad final.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (GSM8K test, n=1317, greedy, single-turn, sin ejemplos ni self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test) | Accuracy (exact match) | 71.5% |

No se han publicado otros benchmarks en la informacion disponible. El autor indica que la precision cae con la dificultad del problema y que la diferencia con otras semillas puede ser de unos pocos puntos (95% half-width ~2.7 pp a n=1317).

## Requisitos de hardware

- Inferencia: el adaptador LoRA se carga sobre el modelo base de 4B. En bf16, el base requiere ~8 GB de VRAM; con cuantizacion 4-bit, ~4-5 GB. Por tanto, es viable en GPUs consumer como RTX 3060 12GB, RTX 4070 o superiores.
- Entrenamiento: se realizo en 1x NVIDIA A100 80GB, pero con batch reducido podria replicarse en una GPU de 24 GB (p. ej. RTX 3090/4090) usando acumulacion de gradientes.
- Despliegue: al ser un adaptador peft, requiere cargar el modelo base y el adaptador SFT previo con `transformers` + `peft`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la documentacion.
- Latencia: no se proporcionan datos de throughput. Dado el tamano del modelo y la maxima longitud de generacion de 256 tokens, la latencia por peticion sera baja en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de los modelos comparables en la misma familia. La comparacion cualitativa es la siguiente:

| Modelo | Tipo | Entrenamiento | GSM8K (test) | Notas |
|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-addlen110-s7-l5` (este) | LoRA sobre Qwen3-4B-Instruct-2507 | GRPO con recompensa `addlen110-s7` sobre SFT L5 | 71.5% | Ablacion, una semilla |
| `cot-dialect-qwen3-4b-instruct-grpo-l5` (modelo principal del nivel) | LoRA sobre Qwen3-4B-Instruct-2507 | GRPO con recompensa estandar del nivel | No disponible | Modelo de referencia del articulo |
| `Qwen/Qwen3-4B-Instruct-2507` (base sin adaptador) | Transformer denso 4B | Instruct (SFT + RLHF) | No disponible | Modelo generalista, sin compresion |

No se han encontrado datos publicos de otros adaptadores de compresion de chain-of-thought comparables.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas tipo GSM8K; no generaliza a otras tareas.
- La precision disminuye rapidamente con la dificultad del problema, especialmente en los niveles comprimidos.
- Es una ablacion con una sola semilla; diferencias de 2-3 puntos porcentuales pueden deberse al azar.
- Requiere cargar primero el adaptador SFT `ssurface/cot-dialect-qwen3-4b-instruct-sft-l5` y fusionarlo; aplicarlo directamente sobre el modelo base no reproduce el resultado publicado.
- El adaptador se distribuye con licencia apache-2.0, pero el modelo base `Qwen3-4B-Instruct-2507` tiene su propia licencia (Qwen Research License para uso comercial restringido; ver documentacion oficial).
- Riesgo de alucinacion en respuestas fuera del dominio matematico; no se recomienda su uso en produccion sin validacion adicional.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-addlen110-s7-l5
- Adaptador SFT previo (obligatorio): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Modelo principal del nivel L5: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Referencia citada (sin enlace directo): Frolov, Anatolii. *Chain-of-Thought Compression Dialects*, 2026.
