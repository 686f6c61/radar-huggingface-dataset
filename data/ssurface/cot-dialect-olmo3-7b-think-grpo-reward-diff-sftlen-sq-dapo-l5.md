# ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-dapo-l5

## Resumen

El modelo `ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-dapo-l5` es un adaptador LoRA de investigación publicado por el autor ssurface (Anatolii Frolov) sobre el modelo base `allenai/Olmo-3-7B-Think` de Ai2. Forma parte de una familia de adaptadores que exploran la compresión de cadenas de razonamiento (chain-of-thought) en distintos niveles de "dialecto". Este adaptador concreto corresponde al nivel L5 (expresión colapsada en una única operación aritmética, con una mediana de 16 caracteres por cadena) y constituye una **ablación de diseño de reward** dentro de un estudio más amplio sobre compresión de CoT. Su propósito es permitir reproducir la comparación entre distintas funciones de recompensa durante el entrenamiento con GRPO, no ser un modelo de producción.

El adaptador se entrena mediante GRPO sobre el modelo SFT fusionado del nivel L5, con una función de recompensa que combina corrección al cuadrado, formato estricto y penalización cuadrática por sobrelongitud. El resultado es un modelo capaz de resolver problemas matemáticos de GSM8K con una precisión del 58,1% (exact match, greedy, sin self-consistency), pero con cadenas de razonamiento extremadamente cortas. Su relevancia radica en que permite estudiar empíricamente el equilibrio entre precisión y longitud de razonamiento, así como el impacto de distintas señales de recompensa en el entrenamiento por refuerzo de modelos de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base `allenai/Olmo-3-7B-Think`) + adaptador LoRA |
| Parametros totales | Modelo base: 7B; adaptador: no especificado (LoRA r=16, alpha=32) |
| Parametros activos | No aplica (adaptador LoRA, no es MoE) |
| Longitud de contexto | 64K tokens (heredada del modelo base) |
| Tipos de cuantizacion | No especificado (el adaptador se publica en bfloat16; el modelo base admite cuantizaciones GGUF, p. ej. de unsloth) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer de 7B parametros preentrenado en el corpus Dolma 3 y postentrenado en los datasets Dolci, con una variante "Think" que genera cadenas de razonamiento largas y explicitas. El adaptador LoRA (r=16, alpha=32) se entrena con el `trl.GRPOTrainer` de Hugging Face sobre el modelo SFT fusionado del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`). Los datos de entrenamiento consisten en 6993 ejemplos de GSM8K train, re-expresados por un modelo teacher a nivel L5, con una mediana de longitud de cadena de 16 caracteres dentro de la etiqueta `thinking`.

El entrenamiento utiliza GRPO con loss tipo DAPO, 8 generaciones por prompt, batch de 64 con acumulacion 1, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) 0.0. La funcion de recompensa combina tres terminos: `correctness_sq` (correccion con peso cuadratico), `format` (exigencia de un unico bloque `thinking...response` seguido de `#### <answer>`) y `sft_length_sq` (penalizacion cuadratica por sobrelongitud respecto a la longitud SFT). El entrenamiento se realizo en una unica GPU NVIDIA A100 80GB. Es importante destacar que se utilizo `transformers` estandar con atencion `sdpa`, no kernels fusionados, porque estos ultimos producian adaptadores con matrices `lora_B` todas a cero (inertes). Todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico: resuelve problemas de aritmetica y algebra de nivel GSM8K con una precision del 58,1% (exact match, greedy, sin self-consistency).
- Generacion de texto con formato estricto: produce una unica cadena de razonamiento colapsada (nivel L5) seguida de la respuesta final en formato `#### <respuesta>`.
- Compresion de chain-of-thought: reduce la cadena de razonamiento a una expresion aritmetica de aproximadamente 16 caracteres (mediana), frente a los 532 caracteres del nivel L1 (rango de 33x).
- Soporte de tool calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (el modelo esta disenado para un unico paso de razonamiento comprimido).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no incluye vision, audio ni modo thinking explicito; el razonamiento se expresa internamente en la etiqueta `thinking`.

## Casos de uso

- Investigacion sobre compresion de chain-of-thought: permite estudiar como afecta la longitud del razonamiento a la precision en tareas matematicas, y comparar el impacto de distintas funciones de recompensa (ablacion).
- Reproduccion de experimentos de diseno de reward: al ser una ablacion publicada, sirve para verificar los resultados del paper "Chain-of-Thought Compression Dialects" sin depender de la palabra del autor.
- Generacion de respuestas matematicas ultraconcisas: en escenarios donde se requiere una salida minima (p. ej. sistemas de respuesta automatica con restricciones de tokens), puede producir la solucion directamente.
- Evaluacion de robustez de GRPO: permite probar variaciones en el prompt de activacion (p. ej. "Solve this using Level 5 (Extreme)") y medir la degradacion frente al modelo principal del mismo nivel.
- Benchmarking de metodos de cuantizacion: al ser un adaptador pequeno (0.2 GB), puede fusionarse con el modelo base y probar distintas cuantizaciones (GGUF, bitsandbytes) para medir la perdida de precision.
- Estudio de sesgos en razonamiento comprimido: analiza como la compresion extrema afecta a la capacidad de generalizacion y a la aparicion de errores aritmeticos.

## Benchmarks y rendimiento

Los unicos resultados publicados corresponden al benchmark oficial declarado en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 58,1% |

Condiciones: greedy decoding, single-turn, sin exemplars, sin self-consistency. El autor indica que la precision cae con la dificultad del problema, y que la diferencia de unos pocos puntos porcentuales esta dentro del ruido estadistico (95% half-width ~2.7 pp a n=1317). No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Olmo-3-7B-Think requiere aproximadamente 14.6 GB en bfloat16 (segun datos de LLM Explorer para la variante SFT). Con cuantizacion de 4 bits puede reducirse a unos 4-5 GB.
- GPU recomendadas: para el entrenamiento se uso una NVIDIA A100 80GB. Para inferencia, una RTX 4090 (24 GB) es suficiente en precision completa; GPUs con 8-12 GB pueden usar cuantizacion.
- Compatibilidad con consumer GPU: si, mediante cuantizacion (GGUF de unsloth o bitsandbytes) y frameworks como llama.cpp u Ollama.
- Opciones de despliegue: vLLM, TGI, llama.cpp, Ollama, o directamente con `transformers` + `peft` (cargando primero el adaptador SFT y fusionandolo).
- Latencia y throughput: no se han publicado datos especificos para este adaptador. Dado el tamaño del modelo base (7B) y la cadena de razonamiento corta, la latencia por peticion es baja en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos publicados para comparar directamente este adaptador con otros de la misma familia (p. ej. `ssurface/cot-dialect-olmo3-7b-think-grpo-l5`, el modelo principal del mismo nivel). La comparacion mas relevante seria con el modelo base sin compresion:

| Modelo | Tamano | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `allenai/Olmo-3-7B-Think` (base) | 7B | 64K | no disponible | Apache-2.0 | Hugging Face |
| Este adaptador (L5, ablacion) | 7B + LoRA | 64K | 58,1% | Apache-2.0 | Hugging Face |
| `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (principal) | 7B + LoRA | 64K | no disponible | Apache-2.0 | Hugging Face |

Nota: el modelo base sin compresion suele superar el 70% en GSM8K (dato no verificado), pero no se incluye por no estar en la informacion proporcionada.

## Limitaciones y advertencias

- Es una **ablacion de investigacion**, no un modelo de produccion. Fue entrenado para responder una pregunta concreta sobre diseno de reward y puede ser peor que el modelo principal del mismo nivel.
- Solo ha sido entrenado y evaluado en problemas matematicos de palabras (GSM8K). No tiene capacidades generales de chat, codigo o razonamiento fuera de ese dominio.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles de compresion mas extremos (L5).
- Requiere cargar primero el adaptador SFT del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`) y fusionarlo con el modelo base antes de aplicar este adaptador. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- El entrenamiento se realizo con una sola semilla; diferencias de un par de puntos porcentuales pueden deberse al ruido estadistico.
- La compresion extrema del razonamiento puede producir respuestas correctas pero sin trazabilidad, lo que dificulta la auditoria y depuracion en entornos criticos.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y los datos (GSM8K) tienen sus propias condiciones; verificar antes de desplegar en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-reward-diff-sftlen-sq-dapo-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT del nivel L5 (requerido): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal del mismo nivel (para comparacion): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- Cuantizaciones GGUF del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha tecnica del modelo base (apxml): https://apxml.com/models/olmo-3-7b-think
- Ficha tecnica de la variante SFT (LLM Explorer): https://llm-explorer.com/model/allenai%2FOlmo-3-7B-Think-SFT,659GWIGO8KF4Xvodk096vl
- Referencia del paper (cita en la model card): Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026.
