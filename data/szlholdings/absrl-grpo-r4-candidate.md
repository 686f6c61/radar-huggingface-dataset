# SZLHOLDINGS/absrl-grpo-r4-candidate

## Resumen

absrl-grpo-r4-candidate es un adaptador LoRA de investigación publicado por SZLHOLDINGS dentro de su línea "Abstention-RL", cuyo objetivo declarado es entrenar a un modelo para que se abstenga de responder en lugar de adivinar cuando no dispone de información suficiente. El adaptador se monta sobre el modelo base Qwen/Qwen3-1.7B y se ha entrenado con GRPO (Group Relative Policy Optimization), una variante de aprendizaje por refuerzo sin crítico que optimiza la política a partir de recompensas relativas dentro de grupos de muestras.

El artefacto es un candidato de la ronda r4 de una serie de experimentos (r1–r4) y no ha sido promovido a producción: la propia model card indica `publication_eligible: false`. Su interés es fundamentalmente metodológico, ya que documenta un pipeline de evaluación de abstención con recibos verificables (hash sha256) y mediciones de energía a nivel de dispositivo, más que un modelo listo para uso general.

El repositorio tiene un tamaño de 0.0 GB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo de 1.700 millones de parámetros, y se distribuye bajo licencia Apache 2.0. No se declaran idiomas soportados ni se publican resultados de benchmarks en la información disponible más allá de la referencia al recibo de evaluación de AbstentionBench.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (r16, α32) sobre transformer decoder-only Qwen/Qwen3-1.7B |
| Parámetros totales | no disponible (adaptador LoRA sobre un base de 1.7B parámetros) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen3-1.7B, no declarada en la ficha) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización no declarada) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 y alpha 32 aplicado sobre Qwen/Qwen3-1.7B, según el `final/adapter_config.json` citado en la model card. El entrenamiento utiliza GRPO, un algoritmo de optimización de política que estima la ventaja normalizando recompensas dentro de grupos de respuestas muestreadas, lo que elimina la necesidad de un modelo crítico separado y reduce el coste de memoria frente a PPO clásico. El objetivo de la optimización es la abstención: el modelo debe aprender a declinar responder en lugar de producir una respuesta especulativa.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de SFT o DPO. La model card menciona que la cobertura por fuente de AbstentionBench para esta ronda es la que declare el recibo citado, e incluye referencias a evaluaciones sobre SQuAD 2.0 y BBQ para la ronda r2. También se publican "energy receipts" (`mesh/absrl-energy-*.json`) con deltas de julios a nivel de dispositivo, un detalle poco habitual que documenta el coste energético del entrenamiento o la evaluación de esta línea de experimentos.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA sobre el base Qwen3-1.7B.
- Abstención calibrada: capacidad entrenada explícitamente para declinar responder ante preguntas fuera de su conocimiento o ambiguas, en lugar de alucinar.
- Comportamiento alineado con evaluación de abstención sobre AbstentionBench (según el recibo referenciado).
- Capacidades heredadas del base Qwen3-1.7B no verificadas en esta ficha: razonamiento, código y multilingüismo del modelo original no se documentan para el adaptador.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible para el adaptador.

## Casos de uso

- Investigación en abstención selectiva: usar el adaptador como referencia reproducible para estudiar cómo GRPO modifica la tasa de abstención frente al base Qwen3-1.7B, comparando contra los recibos r1–r4 publicados.
- Evaluación de calibración en sistemas de pregunta-respuesta: desplegar el adaptador en un banco de pruebas con SQuAD 2.0 para medir la tasa de respuestas abstenidas frente a respuestas incorrectas.
- Filtrado de consultas fuera de dominio: integrar el adaptador como primera etapa en un pipeline que descarte preguntas que el sistema no puede responder con fiabilidad, antes de derivar a un modelo mayor.
- Estudio de seguridad y alucinación: analizar si la política de abstención aprendida generaliza a dominios sesgados usando las fuentes BBQ citadas en la serie de recibos.
- Reproducibilidad de experimentos de RL: reutilizar la configuración LoRA r16/α32 y el recibo de evaluación como plantilla para comparar variantes de GRPO en modelos pequeños.
- Medición de coste energético: emplear los recibos de energía publicados para correlacionar el coste en julios con las métricas de abstención en experimentos de bajo presupuesto.
- Docencia y formación: servir como ejemplo didáctico de un adaptador LoRA con trazabilidad de evaluación y límites declarados explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente referencia un recibo de evaluación de AbstentionBench (`benchmark/abstentionbench-eval-absrl_grpo_r4.json`, sha256 `2739740633a686d4`) alojado en el dataset SZLHOLDINGS/frontier-54-runs, sin incluir las cifras en la propia ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa del base Qwen3-1.7B, la inferencia en fp16 requeriría del orden de 3,4 GB solo para pesos, más overhead de activaciones y KV cache; el adaptador LoRA añade una cantidad marginal.
- GPU recomendadas: no declaradas por el autor. Por tamaño del base, cabría en GPUs consumer con al menos 8 GB de VRAM en fp16 y en 4–6 GB con cuantización de 4 bits, aunque estas cifras no están confirmadas en la ficha.
- ¿Cabe en consumer GPU?: probablemente sí, dado el tamaño del base, pero no verificado en la información disponible.
- Opciones de despliegue: no declaradas. Al ser un adaptador LoRA sobre safetensors, sería compatible con frameworks que soporten carga de adaptadores PEFT (por ejemplo, transformers + PEFT); vLLM, llama.cpp, Ollama o TGI no se mencionan en la ficha.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| absrl-grpo-r4-candidate | LoRA sobre base de 1.7B | no disponible | Abstención vía GRPO | Apache 2.0 | Hugging Face (no promovido) |
| Qwen/Qwen3-1.7B (base) | 1.7B | no disponible en esta ficha | Modelo generalista | Apache 2.0 | Hugging Face |
| Alternativas de abstención selectiva | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros adaptadores de abstención comparables en la información proporcionada.

## Limitaciones y advertencias

- Candidato no promovido: la model card declara `publication_eligible: false`, por lo que no debe tratarse como un artefacto validado para producción.
- Cobertura de evaluación limitada: la cobertura por fuente de AbstentionBench es únicamente la que declare el recibo citado; no hay afirmación de cobertura más amplia.
- Sin datos de benchmarks en la ficha: no se publican cifras de MMLU, HumanEval, GSM8K ni métricas de abstención directamente en la model card.
- Idiomas no declarados: se desconoce el soporte multilingüe real del adaptador.
- Riesgo de sobreabstención: al optimizar explícitamente la abstención, el adaptador podría declinar responder ante preguntas que el base sí resolvería correctamente; este trade-off no se cuantifica en la información disponible.
- Sesgos: no se documentan sesgos conocidos del adaptador; las fuentes BBQ citadas para r2 sugieren algún análisis de sesgo, pero sus resultados no se incluyen en la ficha.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-1.7B conviene verificar las condiciones del modelo base.
- Tamaño de repo de 0.0 GB: coherente con un adaptador LoRA, pero implica que no se distribuyen pesos completos; es necesario descargar el base por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/absrl-grpo-r4-candidate
- Recibo de evaluación AbstentionBench r4: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/abstentionbench-eval-absrl_grpo_r4.json
- Dataset de recibos de la serie: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
