# ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b110-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-gr3b110-l5` es un adaptador LoRA publicado por `ssurface` (Anatolii Frolov) que modifica el comportamiento de `Qwen/Qwen3-4B-Instruct-2507` para razonar en un "dialecto de compresión" de nivel L5: una única expresión colapsada dentro del bloque `thinking`. Forma parte de la investigación *Chain-of-Thought Compression Dialects*, que estudia cómo los modelos pueden resolver problemas aritméticos con cadenas de razonamiento extremadamente cortas (mediana de 16 caracteres frente a 532 en el nivel L1, un rango de 33x).

Este modelo concreto es una **ablación**, no uno de los modelos principales: se entrenó con una variante de recompensa (`gr3b110`) para permitir comparar diseños de reward en el paper. El adaptador se entrena con GRPO sobre el modelo SFT fusionado a nivel L5, y requiere cargar primero el adaptador SFT correspondiente (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) antes de aplicar este. El modelo base tiene 4B parámetros y la licencia es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-4B-Instruct-2507) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | No disponible (el adaptador es LoRA; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; el modelo base puede cuantizarse con GPTQ/AWQ/GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen/Qwen3-4B-Instruct-2507`, un modelo transformer decoder-only de 4B parámetros. El entrenamiento usa **GRPO** (Group Relative Policy Optimization) con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`. El dataset de entrenamiento es GSM8K train (6993 ejemplos) re-expresado a nivel L5 por un modelo teacher, con cadenas de razonamiento de mediana 16 caracteres.

La función de recompensa combina cuatro componentes: `correctness` (ponderado por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmética escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva, con suelo en 0.3, que no reordena respuestas correctas e incorrectas). El loss es tipo `dapo`, con KL coefficient beta = 0.0, 8 generaciones por prompt, batch 16x2, max completion de 256 tokens y learning rate 1e-05. Se entrenó en una NVIDIA A100 80GB.

Un detalle técnico relevante: el autor advierte que el uso de kernels fusionados producía adaptadores con `lora_B` todo ceros (matemáticamente inertes), por lo que se usó `transformers` stock con `sdpa`. Todos los adaptadores publicados verifican `lora_B != 0`.

## Capacidades

- Razonamiento matematico con chain-of-thought comprimido a nivel extremo (L5): una unica expresion colapsada dentro de `thinking`, p. ej. `18/3*2=12`.
- Generacion de texto (pipeline `text-generation`) con formato de respuesta estructurado (`thinking...response` + `#### <answer>`).
- Soporte de tool calling: no disponible (no se menciona en la informacion).
- Soporte de agentes y multi-step reasoning: no disponible (el modelo esta disenado para razonamiento comprimido de un solo paso).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: compresion de razonamiento (dialecto L5), disenado para estudios de ablacion de recompensas en RL.

## Casos de uso

- Investigacion en compresion de chain-of-thought: el modelo permite estudiar como afecta la longitud del razonamiento a la precision, comparando niveles L1-L5 dentro de la misma familia.
- Ablacion de diseno de recompensas en RL: este adaptador concreto (`gr3b110`) sirve para reproducir la comparacion de recompensas descrita en el paper, evaluando el impacto del reescalado multiplicativo `gr3`.
- Benchmarking de eficiencia de razonamiento: al reducir la cadena a 16 caracteres, se puede medir el ahorro computacional en generacion de tokens frente a modelos con CoT completo.
- Analisis de trade-offs precision-coste: util para decidir si un nivel de compresion extremo (L5) es viable en aplicaciones donde el coste por token es critico.
- Reproduccion de experimentos academicos: el autor publica el adaptador para que otros grupos puedan rerun los resultados del paper sin depender de la afirmacion del autor.
- Validacion de verificadores aritmeticos: el componente `chain` (verificador interno) puede estudiarse como mecanismo de control de calidad en pipelines de razonamiento automatico.

## Benchmarks y rendimiento

Segun los datos declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 74.3% |

Condiciones de evaluacion: greedy decoding, single-turn, sin exemplars, sin self-consistency. El autor indica que la precision cae con la dificultad del problema, especialmente en los niveles comprimidos, y que el intervalo de confianza al 95% tiene una semi-amplitud de ~2.7 puntos porcentuales (n=1317).

No se proporcionan comparativas con otros modelos en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (segun la model card).
- Inferencia: al ser un adaptador LoRA sobre un modelo base de 4B parametros, puede ejecutarse en GPUs consumer con 8-12GB de VRAM si se cuantiza el modelo base (p. ej. 4-bit con bitsandbytes o GPTQ). El adaptador anade un overhead minimo.
- GPUs recomendadas: RTX 3090, RTX 4090, A10, A100 (para mayor throughput).
- Opciones de despliegue: `transformers` + `peft` (carga directa), vLLM, TGI, Ollama (si se convierte a GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. El autor menciona dos modelos relacionados dentro de la misma familia:

- `ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`: adaptador SFT previo, necesario para cargar este modelo correctamente.
- `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5`: modelo principal del mismo nivel L5, entrenado con la recompensa estandar (sin la variante `gr3`).

Ambos comparten base, dataset y nivel de compresion, pero sus resultados no se incluyen en la informacion disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas tipo GSM8K; no generaliza a otras tareas.
- La precision cae rapidamente con la dificultad del problema, especialmente en niveles comprimidos como L5.
- Es un artefacto de ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Entrenado con una sola semilla (single seed); diferencias de un par de puntos porcentuales pueden deberse al ruido.
- Requiere cargar primero el adaptador SFT L5 (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados declarados.
- Riesgo de alucinacion: al comprimir el razonamiento a una expresion unica, el modelo puede producir respuestas incorrectas sin mostrar pasos intermedios verificables.
- Solo soporta ingles; no hay soporte multilingue.
- Licencia Apache-2.0, sin restricciones comerciales conocidas, pero su utilidad en produccion es limitada dado su caracter de investigacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-gr3b110-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo principal del nivel L5: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Paper (cita en la model card): *Chain-of-Thought Compression Dialects*, Anatolii Frolov, 2026 (preprint, sin enlace directo en la informacion disponible).
