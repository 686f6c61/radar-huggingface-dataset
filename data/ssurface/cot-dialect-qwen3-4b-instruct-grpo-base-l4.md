# ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l4

## Resumen

`ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l4` es un adaptador LoRA de 0,1 GB que se monta sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507` para producir cadenas de razonamiento ultra-compactas en un "dialecto" de nivel L4, donde los pasos intermedios se expresan como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Lo desarrolla el autor `ssurface` como parte de la colección "Chain-of-Thought Compression Dialects", cuyo objetivo es estudiar cómo comprimir el razonamiento explícito de un modelo de lenguaje sin perder precisión en tareas matemáticas.

Este adaptador concreto es una **ablación de diseño de recompensa**: se entrenó con el mismo nivel de compresión L4 que el modelo principal de esa familia, pero bajo un esquema de recompensa distinto (recompensa `base`, solo corrección y formato), para que la comparación entre diseños de recompensa del paper pueda reproducirse de forma independiente. No es uno de los modelos "titulares" de la colección y no ha sido evaluado por separado.

La relevancia de esta pieza es estrictamente investigadora: sirve para analizar cómo afecta la formulación de la recompensa a la calidad del razonamiento comprimido, y para validar la metodología de entrenamiento GRPO sobre cadenas de razonamiento abreviadas. Su uso práctico fuera de ese contexto es limitado, ya que está entrenado únicamente sobre GSM8K y su rendimiento en otros dominios no está verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B-Instruct-2507) con adaptador LoRA |
| Parametros totales | No disponible (el adaptador ocupa 0,1 GB; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada; hereda la del modelo base (no indicada en la ficha) |
| Tipos de cuantizacion | No especificados; el codigo de ejemplo carga el modelo en `bfloat16` |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un transformer causal de 4B parametros. El entrenamiento sigue un pipeline de dos etapas: primero se obtiene un modelo SFT (supervised fine-tuning) de nivel L4 a partir de un modelo profesor que re-expresa los ejemplos de GSM8K en el dialecto comprimido, y despues se aplica GRPO (Group Relative Policy Optimization) sobre ese modelo SFT fusionado. La configuracion de GRPO usa `trl.GRPOTrainer` con attention `sdpa`, loss de tipo `dapo`, 8 generaciones por prompt, batch de 64 con acumulacion 1, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) igual a 0. El adaptador LoRA tiene r=16 y alpha=32.

Los datos de entrenamiento son 6976 ejemplos de GSM8K train re-expresados a nivel L4, con una mediana de longitud de cadena de razonamiento de 41 caracteres dentro de la etiqueta `thinking`. La recompensa combina dos componentes: `correctness`, que pondera la coincidencia con la solucion de oro segun el numero de pasos (los problemas mas dificiles valen mas), y `format`, que exige una unica estructura `thinking... response` seguida de `#### <respuesta>`. Una nota tecnica relevante: el entrenamiento se hizo con `transformers` estandar, no con kernels fusionados, porque la ruta fusionada producia adaptadores con matrices `lora_B` todas a cero; todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matematico comprimido: genera cadenas de pensamiento abreviadas (nivel L4) con asignaciones encadenadas, reduciendo drasticamente el numero de tokens de razonamiento frente al estilo natural.
- Generacion de texto conversacional: hereda las capacidades de instruccion y dialogo del modelo base Qwen3-4B-Instruct.
- Soporte de tool calling / function calling: no documentado para este adaptador.
- Soporte de agentes y multi-step reasoning: no documentado; el razonamiento se limita a problemas de palabras matematicas de GSM8K.
- Capacidades multilingues: no; el adaptador esta entrenado y evaluado solo en ingles.
- Capacidades especiales: "dialecto" de razonamiento L4, pensado para estudiar la compresion de cadenas de pensamiento; no incluye vision, audio ni modo thinking explicito mas alla del formato `thinking`.

## Casos de uso

- Investigacion sobre compresion de cadenas de razonamiento: permite reproducir el experimento de ablacion del paper "Chain-of-Thought Compression Dialects" y comparar el efecto del diseño de recompensa (base vs. otros) sobre la precision y la longitud de las cadenas.
- Evaluacion de metodologias GRPO: sirve como artefacto de entrenamiento para validar pipelines de RL (recompensas, coeficiente KL, loss dapo) sobre modelos de 4B.
- Estudio de trade-off precision vs. tokens de razonamiento: al comparar con los niveles L1, L2, L3 y L5 de la misma familia, permite medir como degrada la precision al comprimir la cadena de pensamiento (de 532 caracteres de mediana en L1 a 16 en L5).
- Benchmarking de eficiencia de inferencia: al reducir la longitud de las respuestas, se puede medir el ahorro de latencia y coste de tokens en tareas matematicas frente al modelo base sin compresion.
- Analisis de robustez del entrenamiento con kernels: dado el fallo documentado con kernels fusionados, puede usarse como caso de estudio sobre verificacion de adaptadores LoRA (deteccion de matrices `lora_B` nulas).
- Componente educativo en pipelines de razonamiento simbolico: aunque no es su proposito principal, puede integrarse en demos que muestren como un LLM puede expresar pasos intermedios en notacion compacta tipo pseudo-codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor indica explicitamente que este adaptador "no fue evaluado por separado" y que los niveles con numeros reportados son los del conjunto principal de la coleccion. No se debe inferir ningun dato de precision a partir de otros modelos de la familia.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en si ocupa unos 0,1 GB, pero requiere cargar el modelo base Qwen3-4B-Instruct-2507. En `bfloat16` (2 bytes por parametro) el modelo base necesita aproximadamente 8-9 GB de VRAM solo para los pesos, mas overhead de activaciones y cache KV.
- GPU recomendadas: una NVIDIA RTX 3090 o RTX 4090 (24 GB) es suficiente para inferencia en `bfloat16` con contexto moderado. Para entrenamiento o experimentos con batch grande, se usaron 1x NVIDIA A100 80GB.
- Compatibilidad con GPU consumer: si, cabe en GPUs de 16 GB o mas con cuantizacion (por ejemplo, 4 bits) o con contexto reducido. En 8 bits (unos 4-5 GB de pesos) podria ejecutarse en una RTX 3060 de 12 GB.
- Opciones de despliegue: `transformers` + `peft` (cargando primero el adaptador SFT L4 y luego este adaptador, fusionando), `vLLM` (si se soporta LoRA en la version usada), `TGI` (con soporte de adaptadores), y `llama.cpp`/`Ollama` (requiere convertir el modelo fusionado a GGUF; no hay GGUF publicado).
- Latencia y throughput: no disponibles. Dado que las respuestas comprimidas son mucho mas cortas (mediana de 41 caracteres de cadena), la latencia por generacion sera menor que con cadenas de razonamiento completas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Notas |
|---|---|---|---|---|---|
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l4` | 4B (base) + LoRA | no especificado | GRPO sobre GSM8K (L4) | Apache-2.0 | Ablacion de recompensa, sin benchmarks |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4` | 4B (base) + LoRA | no especificado | GRPO sobre GSM8K (L4) | Apache-2.0 | Modelo principal del nivel L4, con benchmarks reportados |
| `Qwen/Qwen3-4B-Instruct-2507` | 4B | 32k (tipico de la serie Qwen3) | SFT + RLHF | Apache-2.0 | Modelo base sin compresion de razonamiento |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5` | 4B (base) + LoRA | no especificado | GRPO sobre GSM8K (L5) | Apache-2.0 | Nivel de compresion maxima (mediana 16 caracteres) |

La comparacion directa con alternativas fuera de la familia no es posible sin datos de benchmark. Dentro de la familia, la diferencia clave entre este adaptador y el modelo principal L4 es el diseño de recompensa: este usa solo `correctness` y `format`, mientras que el principal incorpora componentes adicionales (no detallados en la ficha). Ambos requieren cargar previamente el adaptador SFT L4 correspondiente.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas de GSM8K; no hay evidencia de rendimiento en otros dominios o tareas.
- La precision cae con la dificultad del problema, y esa caida es mas pronunciada en los niveles de compresion altos (L4 y L5).
- Es un artefacto de ablacion: el propio autor advierte que puede ser peor que el modelo principal del mismo nivel, y que solo responde a una pregunta concreta sobre diseño de recompensa.
- No fue evaluado por separado; cualquier uso en produccion carece de garantias de calidad.
- Requiere una carga en dos pasos: primero el adaptador SFT L4 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l4`) y despues este adaptador GRPO; cargarlo directamente sobre el modelo base no reproduce los resultados.
- El entrenamiento se hizo con una unica semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales pueden ser ruido estadistico (intervalo de confianza del 95% de ~2,7 puntos en n=1317).
- Riesgo de alucinacion: no mitigado especificamente; el formato de respuesta restringe la salida pero no garantiza correccion aritmetica.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el adaptador depende del modelo base Qwen3-4B-Instruct-2507, que tambien es Apache-2.0; sin embargo, el dataset GSM8K tiene su propia licencia (MIT) que debe respetarse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-base-l4
- Modelo principal del nivel L4 (referencia): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l4
- Adaptador SFT L4 (requerido antes de este): https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l4
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/gsm8k
- Paper citado: "Chain-of-Thought Compression Dialects" (Frolov, Anatolii, 2026) — sin URL publica disponible en la informacion proporcionada.
