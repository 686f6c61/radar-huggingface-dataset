# ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l2

## Resumen

El modelo `ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l2` es un adaptador LoRA (r=16, alpha=32) diseñado para modificar el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think`. Su objetivo es inducir un estilo de cadena de pensamiento comprimida, denominado "nivel L2" (prosa condensada o pasos con viñetas), en lugar de las cadenas de razonamiento largas y verbosas típicas de los modelos de razonamiento. El adaptador se entrena mediante GRPO con una función de recompensa que incluye un componente de "resolución temprana" (`early_solve`), que premia alcanzar la respuesta en una fase temprana de la secuencia generada.

Este modelo es una **ablación** dentro de una familia de adaptadores que exploran distintos niveles de compresión de la cadena de pensamiento (desde L1, prosa completa, hasta L5, compresión extrema). Se publica específicamente para permitir reproducir la comparación de diseño de recompensas descrita en el paper asociado, y no es el modelo principal de su nivel (ese es `ssurface/cot-dialect-olmo3-7b-think-grpo-l2`). Está entrenado exclusivamente sobre GSM8K (6950 ejemplos de entrenamiento reexpresados a nivel L2) y evaluado en el split de test del mismo dataset, alcanzando un 81.8% de exactitud en coincidencia exacta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre `allenai/Olmo-3-7B-Think` (transformer decoder-only, 7B parámetros) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; el modelo base tiene 7B) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (el modelo base Olmo-3-7B-Think soporta contexto largo, pero no se especifica el valor exacto) |
| Tipos de cuantizacion | No se documentan cuantizaciones; el ejemplo de uso emplea `bfloat16` |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se apila sobre el modelo base `allenai/Olmo-3-7B-Think`, un transformer decoder-only de 7B parámetros desarrollado por el Allen Institute for AI (AllenAI) dentro de la familia Olmo 3. El modelo base fue entrenado con un pipeline en etapas sobre el dataset Dolma 3, con especial atención a razonamiento de contexto largo, function calling, codificación y seguimiento de instrucciones.

El entrenamiento del adaptador sigue un esquema de dos fases. Primero se genera un modelo SFT (supervised fine-tuning) fusionado que reexpresa los problemas de GSM8K en el dialecto de nivel L2 (cadenas de razonamiento de ~140 caracteres de mediana). Sobre ese modelo fusionado se aplica GRPO (Group Relative Policy Optimization) con la librería `trl.GRPOTrainer`, usando atención `sdpa` de `transformers` estándar. La función de recompensa combina tres componentes: `correctness` (premia la respuesta correcta, ponderada por el número de pasos de la solución dorada), `format` (exige una estructura `thinking... response` y `#### <answer>`) y `early_solve` (premia alcanzar la respuesta pronto en la secuencia). Se usa pérdida tipo DAPO, 8 generaciones por prompt, batch de 64 con acumulación de 1, y un coeficiente KL de 0.0. El entrenamiento se realizó en una única GPU NVIDIA A100 de 80 GB.

Una nota técnica relevante: el autor advierte que el uso de kernels fusionados (como los de `flash-attention`) produjo adaptadores con matrices `lora_B` todas a cero, por lo que se utilizó la ruta estándar de `transformers` con `sdpa`. Todos los adaptadores publicados fueron verificados para asegurar que `lora_B != 0`.

## Capacidades

- Razonamiento matemático en inglés: resuelve problemas de palabras de nivel escolar (tipo GSM8K) con una cadena de pensamiento comprimida en viñetas o prosa condensada.
- Generación de texto con formato estructurado: produce respuestas con un bloque `thinking` seguido de `response` y una respuesta final precedida de `####`.
- Compresión de cadena de pensamiento: reduce drásticamente la longitud del razonamiento frente al modelo base (de ~532 caracteres en L1 a ~140 en L2).
- No soporta tool calling, function calling, visión, audio ni capacidades multimodales.
- No está diseñado para tareas generales de chat o instrucciones fuera del dominio matemático.
- Capacidades multilingües limitadas al inglés (los datos de entrenamiento son exclusivamente en inglés).

## Casos de uso

- Investigación en compresión de cadenas de pensamiento: permite estudiar cómo afecta la recompensa `early_solve` al equilibrio entre precisión y concisión en modelos de razonamiento. Es útil para reproducir los experimentos del paper y comparar con el adaptador principal del mismo nivel (`grpo-l2`).
- Evaluación de diseño de recompensas en RL: al ser una ablación con una variante específica de recompensa, sirve como banco de pruebas para analizar el impacto de recompensar la resolución temprana frente a otras estrategias.
- Generación de explicaciones concisas para problemas matemáticos: puede emplearse en entornos educativos donde se prefiera una solución breve y paso a paso, aunque su rendimiento en problemas de dificultad alta es limitado.
- Integración en pipelines de razonamiento con restricciones de presupuesto de tokens: al generar cadenas de pensamiento mucho más cortas, reduce el coste de inferencia y la latencia en sistemas que procesan muchas consultas matemáticas.
- Ablación para estudios de robustez: permite comparar el efecto de la recompensa `early_solve` frente a otras variantes (por ejemplo, recompensa estándar) en la misma arquitectura y con los mismos datos.
- Depuración de pipelines de RLHF/GRPO: el código de entrenamiento está documentado y puede servir como referencia para implementar funciones de recompensa personalizadas en `trl`.

## Benchmarks y rendimiento

El autor declara un único benchmark en la model card, obtenido con decodificación greedy, single-turn, sin ejemplos y sin self-consistency sobre el split de test de GSM8K (n=1317).

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Razonamiento matemático | GSM8K (test) | Accuracy (exact match) | 81.8% |

No se han publicado resultados para otros benchmarks (MMLU, HumanEval, etc.). El valor no está verificado de forma independiente.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (~0.2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` completo (7B parámetros).
- En `bfloat16`, el modelo base ocupa aproximadamente 14 GB de VRAM. Con el adaptador fusionado, se necesita al menos 16 GB de VRAM para inferencia cómoda.
- GPUs recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 80GB, H100. También puede ejecutarse en GPUs con 16 GB (p.ej. RTX 4080) con cuantización adicional, aunque no se documentan cuantizaciones oficiales.
- Opciones de despliegue: `transformers` + `peft` (como se muestra en el ejemplo de uso), `vLLM` (con soporte para modelos PEFT), `llama.cpp` (requiere convertir el modelo fusionado a GGUF), `Ollama` (si se exporta el modelo fusionado).
- Latencia y throughput: no se proporcionan mediciones oficiales. Al generar cadenas de pensamiento cortas, la latencia por respuesta será menor que con el modelo base sin compresión, pero depende del hardware y del número de tokens de salida.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos para otros adaptadores de la misma familia en la información proporcionada. El autor menciona que el adaptador principal de nivel L2 es `ssurface/cot-dialect-olmo3-7b-think-grpo-l2`, pero no publica sus resultados en esta model card. Se puede comparar cualitativamente:

| Modelo | Base | Técnica | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|---|
| Este adaptador (early-solve L2) | Olmo-3-7B-Think | LoRA + GRPO con `early_solve` | No disponible | 81.8% | Apache-2.0 |
| `cot-dialect-olmo3-7b-think-grpo-l2` (principal L2) | Olmo-3-7B-Think | LoRA + GRPO (sin `early_solve`) | No disponible | No publicado aquí | Apache-2.0 |
| Olmo-3-7B-Think (base) | — | Modelo base de razonamiento | Contexto largo (no especificado) | No disponible | Apache-2.0 |

La comparación directa con otros modelos de razonamiento matemático (p.ej. Llama-3.1-8B-Instruct, Qwen2.5-7B-Instruct) no es posible con los datos disponibles, ya que no se han evaluado en las mismas condiciones.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de palabras (GSM8K). No generaliza a otros dominios de razonamiento o tareas de lenguaje general.
- La precisión cae con la dificultad del problema, siendo la caída más pronunciada en los niveles comprimidos (L2 incluido). Para problemas complejos, el modelo puede producir respuestas incorrectas o cadenas de razonamiento truncadas.
- Es una **ablación** diseñada para responder una pregunta específica sobre diseño de recompensas. Puede ser peor que el adaptador principal del mismo nivel (`grpo-l2`), por lo que no se recomienda su uso en producción sin una evaluación comparativa adicional.
- El adaptador se entrena sobre el modelo SFT fusionado, no sobre el modelo base crudo. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` sin aplicar primero el adaptador SFT (`ssurface/cot-dialect-olmo3-7b-think-sft-l2`) no reproducirá el rendimiento declarado.
- Riesgo de alucinación: al comprimir el razonamiento, el modelo puede omitir pasos intermedios y "saltar" a una respuesta plausible pero incorrecta.
- Sesgo de idioma: solo inglés; no se ha evaluado en otros idiomas.
- El resultado de 81.8% es una estimación con una incertidumbre de ±2.7 puntos porcentuales (95% de intervalo de confianza) debido al tamaño de muestra (n=1317). Diferencias de unos pocos puntos entre ejecuciones pueden deberse al ruido.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base (Olmo-3-7B-Think) también es Apache-2.0, por lo que no hay restricciones adicionales de uso.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l2)
- [Modelo base: allenai/Olmo-3-7B-Think](https://huggingface.co/allenai/Olmo-3-7B-Think)
- [Modelo base instruct: allenai/Olmo-3-7B-Instruct](https://huggingface.co/allenai/Olmo-3-7B-Instruct)
- [Paper de Olmo 3 (arXiv 2512.13961)](https://arxiv.org/abs/2512.13961)
- [Repositorio open-instruct de AllenAI (scripts de entrenamiento de Olmo 3)](https://github.com/allenai/open-instruct/blob/main/scripts/train/olmo3/README.md)
