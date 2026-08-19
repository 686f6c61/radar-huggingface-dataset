# ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l4` es un adaptador LoRA publicado por ssurface que modifica el comportamiento de `allenai/Olmo-3-7B-Think` para que genere cadenas de razonamiento (chain-of-thought) comprimidas a un nivel L4, caracterizado por asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es reducir drásticamente la longitud del razonamiento interno manteniendo una precisión aceptable en problemas aritméticos. Este adaptador es una **ablación** explícita: se entrenó con una variante de recompensa (`sft_length_sq`) para comparar el diseño de funciones de recompensa en el marco del paper "Chain-of-Thought Compression Dialects". No es el modelo principal de su nivel; el modelo cabecera es `ssurface/cot-dialect-olmo3-7b-think-grpo-l4`.

El adaptador se apila sobre un modelo SFT previo (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`) que ya fue entrenado para comprimir el razonamiento a nivel L4. El entrenamiento se realizó con GRPO sobre el conjunto GSM8K train, re-expresado por un modelo profesor, con 6976 ejemplos y una mediana de 41 caracteres por cadena de razonamiento. La relevancia de esta publicación radica en su carácter de artefacto de investigación: permite reproducir el análisis de diseño de recompensas sin depender de las afirmaciones del autor, y demuestra la viabilidad de comprimir cadenas de razonamiento en modelos de 7B.

El adaptador está disponible bajo licencia Apache 2.0, pesa 0.2 GB y se distribuye en formato safetensors. Está pensado para investigación y experimentación, no para producción directa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: `allenai/Olmo-3-7B-Think`) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (el adaptador añade ~0.2 GB; el modelo base tiene 7B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica; el modelo base Olmo-3-7B-Think soporta 4096 tokens según documentación de AllenAI) |
| Tipos de cuantizacion | bfloat16 (según el código de uso proporcionado); no se indican otras cuantizaciones |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer decoder de 7B parámetros desarrollado por el Allen Institute for AI (AI2), preentrenado en el corpus Dolma 3 y post-entrenado en los datasets Dolci. Este modelo base incorpora un modo de razonamiento largo (long chain-of-thought) que mejora tareas de matemáticas y código. El adaptador LoRA (r=16, alpha=32) se entrena en dos fases: primero se genera un modelo SFT a nivel L4 (que comprime las cadenas a asignaciones encadenadas con punto y coma) y después se aplica GRPO sobre ese modelo SFT fusionado.

El entrenamiento GRPO utiliza el `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados), 8 generaciones por prompt, batch de 64 con acumulación 1, máximo de 256 tokens de completación, learning rate 1e-05 y coeficiente KL (beta) 0.0. La función de recompensa combina tres componentes: `correctness` (basada en el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`) y `sft_length_sq` (penaliza cuadráticamente los excesos de longitud respecto a la longitud del SFT). El entrenamiento se realizó en una única NVIDIA A100 80GB. El autor destaca que se verificó que las matrices `lora_B` no fueran nulas en todos los adaptadores publicados; 13 adaptadores que fallaron esta comprobación fueron retirados.

## Capacidades

- Razonamiento matematico: resuelve problemas aritmeticos de nivel GSM8K generando cadenas de razonamiento comprimidas (nivel L4).
- Generacion de texto: produce respuestas en formato estructurado `thinking...response` + `#### <answer>`.
- Compresion de chain-of-thought: reduce la longitud del razonamiento interno a una mediana de 41 caracteres por cadena (frente a 532 en nivel L1 y 16 en L5).
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo.
- Sin capacidades de agente ni multi-step reasoning fuera del ambito matematico.
- Multilingue: no, solo ingles.
- Sin modo de vision, audio u otras modalidades.

## Casos de uso

- Investigacion sobre compresion de razonamiento: permite estudiar como afecta la compresion de cadenas de pensamiento a la precision en tareas aritmeticas, comparando niveles L1 a L5.
- Analisis de diseno de funciones de recompensa: al ser una ablacion, sirve para reproducir el experimento del paper y evaluar el impacto de la recompensa `sft_length_sq` frente a otras variantes.
- Benchmarking de modelos comprimidos: util para medir el trade-off entre longitud de razonamiento y exactitud en GSM8K con decodificacion greedy.
- Educacion y divulgacion: ejemplifica como un adaptador LoRA puede modificar el estilo de razonamiento de un LLM sin reentrenar el modelo base.
- Validacion de pipelines de entrenamiento: el codigo de uso muestra como apilar adaptadores SFT y GRPO sobre un modelo base, util para reproducir el flujo completo.
- Experimentos de control de calidad: permite verificar que el adaptador no produce matrices `lora_B` nulas (un fallo conocido en algunos pipelines con kernels fusionados).

## Benchmarks y rendimiento

El autor declara un unico resultado en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 65.4% |

Condiciones de evaluacion: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. El autor advierte que el intervalo de confianza al 95% tiene una semi-anchura de ~2.7 puntos porcentuales para n=1317, por lo que diferencias de un par de puntos pueden deberse al ruido. No se proporcionan comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 7B en bfloat16 ocupa ~14 GB; el adaptador LoRA anade ~0.2 GB. Con cuantizacion a 8 bits (~7 GB) o 4 bits (~4 GB) podria ejecutarse en GPUs consumer.
- GPU recomendadas: para reproduccion fiel (bfloat16) se requiere al menos una GPU con 16 GB de VRAM (p. ej., RTX 4090, A100 40GB). Para cuantizacion 4 bits, una RTX 3060 12GB o similar seria suficiente.
- Si cabe en consumer GPU: si, con cuantizacion 4 bits en GPUs de 12 GB o mas.
- Opciones de despliegue: el codigo de uso emplea `transformers` con `PeftModel` y `merge_and_unload()`. Tambien puede servirse con vLLM, llama.cpp u Ollama si se convierte el adaptador fusionado a GGUF, aunque no se proporciona soporte oficial.
- Latencia y throughput: no disponibles. El autor indica que el entrenamiento se hizo con `sdpa` (sin kernels fusionados), lo que sugiere que la inferencia podria ser mas lenta que con implementaciones optimizadas.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. El modelo mas cercano es el propio `allenai/Olmo-3-7B-Think` (sin adaptador), que obtiene resultados superiores en GSM8K gracias a su razonamiento largo, pero con cadenas de pensamiento mucho mas extensas (mediana de 532 caracteres en nivel L1). Otros modelos de razonamiento de 7B como `Qwen2.5-7B-Instruct` o `Llama-3.1-8B-Instruct` no se mencionan en la documentacion, por lo que no se puede establecer una comparacion rigurosa.

| Modelo | Parametros | Contexto | GSM8K (declarado) | Licencia |
|---|---|---|---|---|
| Este adaptador + Olmo-3-7B-Think | 7B + LoRA | No disponible | 65.4% | Apache 2.0 |
| `allenai/Olmo-3-7B-Think` (base) | 7B | 4096 | No disponible | Apache 2.0 |

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas (GSM8K); no es adecuado para otras tareas sin adaptacion.
- La precision disminuye conforme aumenta la dificultad del problema, especialmente en los niveles de compresion mas agresivos (L4 y L5).
- Es una ablacion disenada para responder una pregunta concreta sobre diseno de recompensas; puede ser peor que el modelo principal del mismo nivel (`...grpo-l4`).
- El adaptador se apila sobre un modelo SFT previo; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce los resultados publicados.
- Entrenamiento con una sola semilla; las diferencias de unos pocos puntos porcentuales pueden deberse al azar.
- Riesgo de alucinacion en problemas fuera de la distribucion de entrenamiento, aunque el formato estricto de salida mitiga parcialmente este riesgo.
- No se proporcionan garantias de robustez ante entradas adversariales ni de seguridad para uso en produccion.
- Solo soporta ingles; no hay soporte multilingue.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-sftlen-sq-l4
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Version cuantizada del modelo base (unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think
- Pagina del modelo en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Ficha del modelo en LLMIndex: https://llmindex.net/models/olmo-3-7b-think
- Ficha del modelo en Crafiq: https://crafiq.ai/models/language/ai2-olmo-3-7b-think
