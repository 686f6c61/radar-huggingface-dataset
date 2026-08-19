# ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l4

## Resumen

`cot-dialect-llama3.1-8b-grpo-rerun-l4` es un adaptador LoRA publicado por `ssurface` (Anatolii Frolov) que modifica `meta-llama/Llama-3.1-8B-Instruct` para razonar con un chain-of-thought (CoT) comprimido al nivel L4, consistente en asignaciones encadenadas con punto y coma (p. ej. `K=18*2.5;D=8*4;T=K+D->T=77`). Se trata de una ablación experimental dentro del proyecto "Chain-of-Thought Compression Dialects", cuyo objetivo es estudiar cómo distintos diseños de recompensa afectan al entrenamiento con GRPO en tareas de razonamiento matemático.

El adaptador se entrena con GRPO sobre el modelo SFT fusionado del mismo nivel L4, usando GSM8K como conjunto de entrenamiento (6976 ejemplos) y una recompensa que combina corrección y formato. Es un artefacto de investigación, no un modelo de producción: su propósito explícito es permitir replicar la comparación de diseño de recompensas descrita en el paper, no servir como modelo principal. El repositorio es pequeño (0,1 GB) porque solo contiene los pesos del adaptador LoRA, que debe apilarse sobre el adaptador SFT previo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Llama-3.1-8B-Instruct (transformer decoder-only) |
| Parametros totales | 8B (modelo base) + adaptador LoRA r=16, alpha=32 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128K (modelo base, no modificado por el adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en bf16; el modelo base puede cuantizarse) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `meta-llama/Llama-3.1-8B-Instruct` y se entrena con `trl.GRPOTrainer` sobre el modelo SFT fusionado correspondiente al nivel L4 (`ssurface/cot-dialect-llama3.1-8b-sft-l4`). El entrenamiento usa atención `sdpa` de `transformers` estándar, no kernels fusionados, y se verificó que todas las matrices `lora_B` fueran no nulas antes de publicar (13 adaptadores que fallaron esa comprobación se retuvieron). La configuración incluye loss tipo `dapo`, 8 generaciones por prompt, batch de 16 con acumulación de 2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) de 0.0.

La recompensa combina dos componentes: `correctness`, que pondera el acierto según el número de pasos de la solución dorada (los problemas más difíciles valen más), y `format`, que exige una estructura de respuesta de un bloque `thinking...` seguido de `response` y una línea `#### <answer>`. Los datos de entrenamiento son GSM8K train re-expresados a nivel L4 por un modelo teacher, con 6976 ejemplos y una longitud mediana de cadena de razonamiento de 41 caracteres dentro de `thinking`. El entrenamiento se realizó en una única NVIDIA A100 80GB.

## Capacidades

- Razonamiento matemático con CoT comprimido: genera cadenas de razonamiento ultra-cortas en formato de asignaciones encadenadas (nivel L4).
- Generación de texto con formato estructurado: respuestas en un bloque `thinking...` seguido de `response` y una línea final con la respuesta.
- Capacidades generales del modelo base: al ser un adaptador sobre Llama-3.1-8B-Instruct, hereda las capacidades de generación de texto, conversación y comprensión del modelo original, aunque el entrenamiento especializado puede degradarlas.
- Sin soporte explícito de tool calling, agentes, visión o audio: no se menciona en la documentación del adaptador.
- Multilingüismo: limitado al inglés, único idioma declarado en la model card.

## Casos de uso

- Investigación en compresión de cadenas de razonamiento: el adaptador permite estudiar cómo afecta la reducción drástica de la longitud del CoT (de 532 caracteres en L1 a 16 en L5) a la precisión en tareas matemáticas.
- Comparación de diseños de recompensa en RLHF/GRPO: al ser una ablación con una recompensa distinta a la del modelo principal, sirve para aislar el efecto del diseño de recompensa en el rendimiento final.
- Evaluación de robustez de métodos de alineación: útil para reproducir experimentos de ablación y verificar si los resultados del paper se mantienen con diferentes semillas o configuraciones.
- Prototipado de sistemas de razonamiento con bajo coste de tokens: la compresión L4 reduce el número de tokens generados por problema, lo que puede interesar en escenarios con restricciones de latencia o coste de inferencia.
- Benchmark de transferencia out-of-domain: permite medir la generalización de modelos entrenados con GSM8K a otros conjuntos de problemas matemáticos como SVAMP.
- Verificación de la integridad de adaptadores LoRA: el proceso de publicación incluye una comprobación de matrices `lora_B` no nulas, útil como caso de estudio para pipelines de validación de adaptadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (exact match, greedy decoding, single-turn, sin ejemplos ni self-consistency):

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test) | 1317 | 69,1% |
| SVAMP (transfer, out-of-domain) | 300 | 72,0% |

El autor indica que la precisión cae con la dificultad del problema, especialmente en los niveles comprimidos, y que la diferencia de un par de puntos porcentuales está dentro del ruido estadístico (intervalo de confianza del 95% de aproximadamente ±2,7 pp para n=1317 y ±4,4 pp para n=500).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 8B en bf16 requiere aproximadamente 16 GB de VRAM; con cuantización a 4 bits puede reducirse a unos 5-6 GB, más el overhead del adaptador LoRA (despreciable).
- GPU recomendadas: para entrenamiento se usó una NVIDIA A100 80GB; para inferencia, una RTX 4090 (24 GB) o similar es suficiente en bf16.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo con 16 GB o más (RTX 4080, RTX 4090, etc.) sin cuantizar; con cuantización cabe en GPUs de 8 GB.
- Opciones de despliegue: `transformers` + `peft` es la vía principal documentada; vLLM soporta carga de adaptadores LoRA, aunque no se menciona en la documentación. `llama.cpp` no tiene soporte nativo para LoRA en la mayoría de builds.
- Latencia y throughput: no disponible; depende del hardware y de la longitud de la cadena comprimida (mediana de 41 caracteres, muy corta).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K | Licencia | Notas |
|---|---|---|---|---|---|
| `cot-dialect-llama3.1-8b-grpo-rerun-l4` (este) | 8B + LoRA | 128K | 69,1% | Apache 2.0 | Ablación de recompensa, nivel L4 |
| `ssurface/cot-dialect-llama3.1-8b-grpo-l4` | 8B + LoRA | 128K | no disponible | Apache 2.0 | Modelo principal del mismo nivel L4 |
| `EpistemeAI/MathCoder-Llama3.1-8B-cot` | 8B | 128K | no disponible | Apache 2.0 | Fine-tune matemático con CoT, entrenado con Unsloth y TRL |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128K | no disponible | Llama 3.1 Community License | Modelo base sin adaptador |

No se dispone de resultados de benchmarks comparables para los modelos alternativos en la información proporcionada, por lo que la comparación es cualitativa. El adaptador `rerun` es una variante de ablación y, según el autor, puede ser peor que el modelo principal del mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matemáticas con enunciados en inglés; su rendimiento en otras tareas no está garantizado.
- La precisión disminuye con la dificultad del problema, y esta caída es más acusada en los niveles comprimidos como L4.
- Es un artefacto de ablación: fue entrenado para responder a una pregunta concreta sobre diseño de recompensa y puede ser inferior al modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-llama3.1-8b-sft-l4`) y fusionarlo con el modelo base antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Los resultados son de una sola semilla (a menos que el nombre del repo indique lo contrario); diferencias de unos pocos puntos porcentuales están dentro del ruido estadístico.
- El uso del modelo base Llama-3.1-8B-Instruct está sujeto a la licencia Llama 3.1 Community License, que puede imponer restricciones adicionales al uso comercial, aunque el adaptador en sí se publica bajo Apache 2.0.
- No se han documentado sesgos específicos, pero al estar entrenado con GSM8K (un conjunto en inglés) puede heredar sesgos lingüísticos y culturales del dataset.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-grpo-rerun-l4
- Modelo SFT previo (requerido): https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-sft-l4
- Modelo principal del mismo nivel (referencia): https://huggingface.co/ssurface/cot-dialect-llama3.1-8b-grpo-l4
- Paper citado (Chain-of-Thought Compression Dialects, Frolov 2026): no disponible en línea en la información proporcionada
- Blog de Llama 3.1 (contexto del modelo base): https://huggingface.co/blog/llama31
