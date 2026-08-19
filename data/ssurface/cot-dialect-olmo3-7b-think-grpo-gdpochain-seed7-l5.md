# ssurface/cot-dialect-olmo3-7b-think-grpo-gdpochain-seed7-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gdpochain-seed7-l5` es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento del modelo base `allenai/Olmo-3-7B-Think` (desarrollado por el Allen Institute for AI) para que genere cadenas de razonamiento (chain-of-thought) extremadamente comprimidas, en un nivel denominado "L5" (expresión pura colapsada). Este adaptador es una **ablación** dentro de una familia de modelos que estudian la compresión de razonamiento: mientras que el modelo base genera cadenas de cientos de caracteres, este adaptador produce expresiones aritméticas de apenas 16 caracteres de mediana, como `18/3*2=12`.

El modelo se entrenó mediante GRPO (Group Relative Policy Optimization) sobre un modelo SFT fusionado, con un sistema de recompensas que combina corrección, formato, verificación de la cadena y normalización por grupo (gdpo). Está pensado como un artefacto de investigación para comparar diseños de recompensa en la compresión de CoT, no como un modelo de producción. Solo soporta inglés y está especializado en problemas matemáticos del dataset GSM8K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer causal (base: `allenai/Olmo-3-7B-Think`) |
| Parametros totales | no disponible (adaptador LoRA r=16, alpha=32; base ~7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, presumiblemente bf16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre `allenai/Olmo-3-7B-Think`, un modelo de 7B parámetros entrenado con SFT, DPO y RLVR para razonamiento visible. El entrenamiento del adaptador se realizó con `trl.GRPOTrainer` sobre el modelo SFT fusionado (no sobre el base crudo), usando atención `sdpa` de `transformers` estándar. El dataset de entrenamiento consistió en 6993 ejemplos de GSM8K re-expresados a nivel L5 por un modelo profesor, con cadenas de razonamiento de mediana 16 caracteres. La configuración incluyó 8 generaciones por prompt, batch 32 con 2 acumulaciones, máximo de 256 tokens de completación, learning rate 1e-5, coeficiente KL 0.01 y LoRA r=16, alpha=32. El sistema de recompensa combina cuatro componentes: `correctness` (ponderado por pasos de la solución dorada), `format` (estructura `thinking...response` y `#### <answer>`), `chain` (verificador aritmético de la cadena) y `gdpo` (normalización independiente por componente para evitar dominancia). Se entrenó en una NVIDIA A100 80GB.

## Capacidades

- Generacion de texto con razonamiento matematico visible (chain-of-thought) extremadamente comprimido (nivel L5).
- Resolucion de problemas aritmeticos de varios pasos, evaluado en GSM8K con accuracy 73.7% (exact match, greedy, sin self-consistency).
- Soporte de formato estructurado de salida: un bloque `thinking`, un bloque `response` y una respuesta final `#### <answer>`.
- Capacidad de verificar internamente la aritmetica de la cadena de razonamiento (gracias al componente `chain` del reward).
- Multilingue: no, solo ingles.
- No soporta tool calling, ni vision, ni audio, ni agentes multi-paso.

## Casos de uso

- Investigacion academica sobre compresion de chain-of-thought: permite estudiar como afecta la longitud del razonamiento a la precision en tareas matematicas, comparando niveles L1-L5.
- Ablacion de diseno de recompensas: sirve para replicar el experimento de comparacion entre distintos esquemas de reward (gdpo vs otros) en el marco del paper "Chain-of-Thought Compression Dialects".
- Evaluacion de robustez de modelos razonadores: al ser un adaptador con cadenas muy cortas, puede usarse para probar limites de modelos base en entornos de baja latencia.
- Generacion de explicaciones sinteticas para datasets de entrenamiento: las cadenas L5 pueden servir como etiquetas compactas para problemas matematicos.
- Benchmarking de tecnicas de RL (GRPO) sobre modelos de 7B en tareas de razonamiento, dado que el setup esta documentado y verificado (lora_B != 0).
- Prototipado de sistemas de tutoria matematica con respuestas paso a paso, aunque con limitaciones de idioma y dominio.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en GSM8K test (n=1317, greedy decoding, single-turn, sin ejemplos ni self-consistency):

| Modelo | GSM8K (exact match) |
|---|---|
| Este adaptador (L5, gdpochain) | 73.7% |

No se proporcionan otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible. El propio autor advierte que es una ablacion y que puede ser peor que el modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`), y que diferencias de un par de puntos estan dentro del ruido estadistico (95% half-width ~2.7 pp).

## Requisitos de hardware

- El entrenamiento se realizo en 1x NVIDIA A100 80GB, pero para inferencia el adaptador LoRA es ligero (repo de 0.2 GB) y se apila sobre un modelo de ~7B.
- VRAM estimada para inferencia: ~14-16 GB en bf16 para el modelo base + adaptador fusionado; con cuantizacion (por ejemplo, GGUF de 4 bits) puede caber en GPUs consumer de 8-12 GB.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para bf16 sin cuantizar; A100/H100 para despliegues de mayor throughput.
- Opciones de despliegue: vLLM, TGI, llama.cpp (si se convierte a GGUF), Ollama (requiere fusion previa del adaptador), o `transformers` + `peft` directamente.
- Latencia y throughput: no disponible, pero al ser un modelo de 7B con salidas muy cortas (cadenas de ~16 caracteres), la latencia por request sera baja en hardware moderno.

## Comparativa con modelos similares

No se dispone de datos comparativos directos con otros adaptadores de compresion de CoT ni con el modelo base sin adaptador. La unica referencia es el propio ecosistema del autor: el modelo principal `ssurface/cot-dialect-olmo3-7b-think-grpo-l5` (misma arquitectura, mismo nivel L5, pero con reward distinto) y el adaptador SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l5` (necesario para cargar este adaptador correctamente). Tampoco se conocen modelos comerciales o open-source con una funcion equivalente (compresion extrema de CoT). Por tanto, la comparativa se limita a la familia interna del autor.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en problemas matematicos de GSM8K; no generaliza a otros dominios.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles comprimidos (L5 es el mas extremo).
- Es una ablacion de un solo seed; diferencias de 1-2 puntos porcentuales pueden deberse al azar.
- El adaptador se apila sobre el modelo SFT fusionado, no sobre el base crudo; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- No soporta otros idiomas que no sea ingles.
- Riesgo de alucinacion en problemas fuera de su distribucion de entrenamiento; la verificacion aritmetica interna no garantiza correccion global.
- Licencia apache-2.0 permite uso comercial, pero al ser un artefacto de investigacion sin soporte, no se recomienda para produccion sin validacion exhaustiva.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gdpochain-seed7-l5)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Version GGUF del modelo base (unsloth)](https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF)
- [Pagina del modelo base en ThinkLLM](https://thinkllm.dev/models/olmo-3-7b-think)
- [Articulo sobre Olmo-3-7B-Think en llm.co](https://llm.co/llms/olmo-3-7b-think)
- [Articulo en DEV.co](https://dev.co/ai/llms/olmo-3-7b-think)
- Citacion del paper (sin enlace directo): Frolov, Anatolii. "Chain-of-Thought Compression Dialects", 2026.
