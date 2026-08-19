# ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l4

## Resumen

El modelo `cot-dialect-qwen3-4b-instruct-grpo-early-solve-l4` es un adaptador LoRA publicado por ssurface (Anatolii Frolov) que modifica el comportamiento de `Qwen/Qwen3-4B-Instruct-2507` para razonar en un "dialecto" de chain-of-thought comprimido, concretamente en el nivel de compresión L4, que emplea asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). El objetivo es reducir drásticamente la longitud del razonamiento interno sin sacrificar la precisión en problemas matemáticos.

Se trata de una **ablación**, no de un modelo principal: fue entrenado bajo una variante de reward (`early_solve`) para permitir comparar diseños de recompensa en el contexto del paper "Chain-of-Thought Compression Dialects". El modelo principal de ese nivel es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4`. El adaptador se entrena mediante GRPO sobre un modelo SFT previo (también LoRA) y debe cargarse en dos pasos, no directamente sobre el base.

Relevancia: aborda el problema de la eficiencia en razonamiento, reduciendo la longitud del CoT en un factor de hasta 33x entre niveles (de 532 caracteres en L1 a 16 en L5). Aunque su uso práctico es limitado (solo matemáticas, solo inglés), sirve como pieza de investigación reproducible para el estudio de compresión de razonamiento y diseño de rewards.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador r=16, alpha=32; base 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no especificada en la documentacion del adaptador) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria peft) |

## Arquitectura y entrenamiento

El adaptador se basa en LoRA con r=16 y alpha=32, aplicado sobre el modelo `Qwen3-4B-Instruct-2507`. El entrenamiento se realizó en dos fases: primero un ajuste fino supervisado (SFT) a nivel L4 (adaptador `ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`), y posteriormente un refinamiento con GRPO (loss tipo DAPO) sobre el modelo SFT fusionado. Los datos de entrenamiento consisten en 6976 ejemplos del conjunto de entrenamiento de GSM8K, re-expresados a nivel L4 por un modelo teacher, con una longitud mediana de cadena de razonamiento de 41 caracteres dentro de la etiqueta `thinking`.

El reward combina tres componentes: `correctness` (basado en la coincidencia con la solución dorada y ponderado por el número de pasos), `format` (exige una respuesta con un bloque `thinking...response` y `#### <answer>`) y `early_solve` (recompensa alcanzar la respuesta temprano en la secuencia). Se usó el engine `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, sin kernels fusionados, y se verificó que los adaptadores tuvieran `lora_B != 0` antes de publicarlos (13 adaptadores fallaron esta comprobación y fueron retenidos).

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas (nivel L4: asignaciones encadenadas con punto y coma).
- Generación de texto en inglés, limitada al dominio de problemas aritméticos de palabras.
- No soporta tool calling, function calling ni agentes multi-paso.
- No soporta visión ni audio.
- Requiere un prompt específico para activar el dialecto: `Solve this using Level 4 (Shorthand). Problem: {your problem}`.
- No es un modelo independiente: necesita cargar primero el adaptador SFT y fusionarlo antes de aplicar este adaptador GRPO.

## Casos de uso

- Investigación en compresión de chain-of-thought: permite estudiar cómo afecta la longitud del razonamiento a la precisión en tareas matemáticas, comparando niveles L1-L5.
- Evaluación de diseño de rewards en RL: sirve como ablación para aislar el efecto del reward `early_solve` frente a otros (por ejemplo, `late_solve` o sin ese componente).
- Reproducción de experimentos: al estar publicado con configuración detallada, facilita replicar los resultados del paper "Chain-of-Thought Compression Dialects".
- Benchmarking de eficiencia de razonamiento: útil para medir el trade-off entre tokens generados y exactitud en GSM8K con decodificación greedy.
- Prototipado de sistemas de razonamiento compacto: aunque no está listo para producción, puede servir como base para explorar técnicas de compresión de CoT en otros dominios.
- Comparación de métodos de entrenamiento: permite contrastar el rendimiento de GRPO con reward compuesto frente a SFT puro en el mismo nivel de compresión.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test) | 1317 | 84.0% |
| AIME (fuera de dominio) | 60 | 10.0% |

Condiciones de evaluación: decodificación greedy, single-turn, sin ejemplos (exemplars) y sin self-consistency. El autor indica que la precisión cae con la dificultad del problema y que la diferencia de un par de puntos porcentuales está dentro del ruido estadístico (95% half-width ~2.7 pp a n=1317).

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.1 GB, pero requiere el modelo base `Qwen3-4B-Instruct-2507` (4B parámetros) para funcionar.
- Entrenamiento: se usó 1x NVIDIA A100 80GB.
- Inferencia: el modelo base de 4B puede ejecutarse en GPUs consumer con al menos 8 GB de VRAM en cuantización de 8 bits, o 16 GB en bf16. No se especifican requisitos exactos para el adaptador.
- Opciones de despliegue: `transformers` + `peft` (carga en dos pasos: SFT fusionado + GRPO). No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con alternativas. El modelo más cercano es `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4` (el modelo principal del mismo nivel L4), pero no se han publicado sus resultados en la información disponible. El modelo base `Qwen3-4B-Instruct-2507` tiene un rendimiento conocido en GSM8K, pero no se proporciona en esta documentación.

## Limitaciones y advertencias

- Entrenado y evaluado únicamente en problemas matemáticos de palabras (GSM8K); no generaliza a otros dominios.
- Es una ablación diseñada para responder una pregunta concreta sobre diseño de rewards; puede ser peor que el modelo principal del mismo nivel.
- No funciona cargado directamente sobre `Qwen/Qwen3-4B-Instruct-2507`: es imprescindible cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`), fusionarlo y luego aplicar este adaptador.
- La precisión cae rápidamente con la dificultad del problema, especialmente en niveles comprimidos.
- Resultados basados en una sola semilla; las diferencias de unos pocos puntos porcentuales pueden deberse al ruido.
- Solo soporta inglés; no hay evidencia de capacidades multilingües en el adaptador.
- Licencia Apache 2.0 permite uso comercial, pero el modelo es de investigación y no está optimizado para producción.
- Riesgo de alucinación en problemas fuera de distribución (por ejemplo, AIME con 10% de acierto).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-early-solve-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Modelo principal del nivel L4: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) - no se proporciona URL directa.
