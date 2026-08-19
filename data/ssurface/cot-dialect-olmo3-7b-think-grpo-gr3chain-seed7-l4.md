# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l4

## Resumen

`cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l4` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento de `allenai/Olmo-3-7B-Think` para razonar en un "dialecto" de cadena de pensamiento comprimida de nivel L4, donde el razonamiento interno se expresa como asignaciones encadenadas con punto y coma (por ejemplo, `K=18*2.5;D=8*4;T=K+D->T=77`). Se trata de un modelo de ablación, no de uno principal: fue entrenado con una variante específica de la función de recompensa (denominada `gr3chain-seed7`) para permitir comparar diseños de recompensa en el artículo *Chain-of-Thought Compression Dialects*.

El modelo se entrena con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado de nivel L4, con una función de recompensa compuesta por cuatro componentes: corrección, formato, verificación de cadena aritmética y reescalado multiplicativo de longitud (`gr3`). Alcanza un 66,7 % de precisión exacta en GSM8K test (n=1317, decodificación greedy, una sola vuelta, sin ejemplos ni self-consistency). El adaptador pesa 0,2 GB, usa licencia Apache-2.0 y solo soporta inglés.

Es relevante porque aborda un problema emergente en la investigación de LLM: la compresión de cadenas de razonamiento para reducir el coste de inferencia sin perder precisión, y porque publica un artefacto de ablación reproducible para validar decisiones de diseño de recompensa en RL.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (r=16, alpha=32) sobre Olmo-3-7B-Think (transformer decoder-only) |
| Parametros totales | Adaptador: no disponible (repo de 0,2 GB); modelo base: 7B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Olmo-3-7B-Think) |
| Tipos de cuantizacion | bfloat16 (segun el codigo de uso proporcionado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `allenai/Olmo-3-7B-Think`, un modelo transformer decoder-only de 7B de la familia Olmo 3 de AllenAI, entrenado sobre el dataset Dolma 3 y orientado a razonamiento de contexto largo. El adaptador LoRA usa r=16 y alpha=32, y se entrena con `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`, con loss tipo DAPO, 8 generaciones por prompt, batch de 32 con acumulación x2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL (beta) de 0.0.

El entrenamiento se realiza sobre el modelo SFT fusionado de nivel L4 (`merged_olmo/l4`), no sobre el modelo base sin ajustar. Los datos de entrenamiento son 6976 ejemplos de GSM8K train re-expresados a nivel L4 por un modelo profesor, con una longitud mediana de cadena de razonamiento de 41 caracteres dentro de la etiqueta `thinking`. La función de recompensa combina cuatro componentes: `correctness` (ponderada por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmética escrita en la cadena es correcta) y `gr3` (reescalado multiplicativo de la recompensa positiva con suelo en 0.3). Un detalle técnico notable: el autor verificó que los adaptadores producidos con kernels fusionados tenían matrices `lora_B` a cero y los descartó; todos los publicados tienen `lora_B != 0`.

## Capacidades

- Razonamiento matemático: resuelve problemas de palabras aritméticos de GSM8K con una precisión exacta del 66,7 % en el conjunto de test.
- Razonamiento comprimido: genera cadenas de pensamiento ultracompactas de nivel L4 (mediana de 41 caracteres), usando asignaciones encadenadas con punto y coma.
- Verificación aritmética interna: la cadena de razonamiento generada debe ser aritméticamente comprobable por un verificador externo (componente `chain`).
- Generación de texto en inglés con formato estructurado de respuesta (`thinking`, `response` y `#### <answer>`).
- No soporta tool calling, vision ni audio: es un adaptador puramente textual de razonamiento matemático.
- No soporta agentes ni razonamiento multi-step explícito más allá de la cadena comprimida.

## Casos de uso

- Reproducción de experimentos de diseño de recompensa: el modelo permite re-ejecutar la comparación de recompensas del artículo *Chain-of-Thought Compression Dialects* sin depender de las afirmaciones del autor, ya que se publica como artefacto de ablación con configuración completa documentada.
- Investigación sobre compresión de cadenas de razonamiento: sirve para estudiar cómo afecta la longitud de la cadena de pensamiento (de 532 caracteres en L1 a 16 en L5) a la precisión en tareas aritméticas.
- Evaluación de robustez de RL: al estar entrenado con una semilla única y una variante de recompensa concreta, es útil para medir la varianza entre semillas y el impacto del componente `gr3` en la convergencia.
- Prototipado de sistemas de razonamiento eficientes: su cadena de razonamiento comprimida reduce el número de tokens generados, lo que puede interesar para despliegues con presupuesto de latencia o coste limitado.
- Benchmarking de modelos de razonamiento matemático: permite comparar el rendimiento de un modelo de 7B con razonamiento comprimido frente a variantes sin comprimir en GSM8K.
- Validación de pipelines PEFT: su requisito de apilar dos adaptadores (SFT primero, luego GRPO) lo convierte en un caso de prueba realista para flujos de trabajo con `merge_and_unload` y carga secuencial de adaptadores.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Mathematical Reasoning | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 66,7 % |

Condiciones de evaluación: n=1317, decodificación greedy, una sola vuelta, sin ejemplos y sin self-consistency. No se han publicado resultados para otras tareas (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento: 1x NVIDIA A100 80GB (segun la configuracion documentada).
- Inferencia: al ser un adaptador LoRA sobre un modelo base de 7B, cabe en GPUs de consumo con 16-24 GB de VRAM en bfloat16 (por ejemplo, RTX 4090 o RTX 3090).
- Despliegue: requiere `transformers` + `peft` (PeftModel). Es obligatorio cargar primero el adaptador SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l4`, fusionarlo con `merge_and_unload()`, y luego cargar este adaptador GRPO. Cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado publicado.
- No se dispone de datos de latencia ni throughput estimados en la informacion proporcionada.
- Opciones de despliegue adicionales (vLLM, llama.cpp, Ollama, TGI): no documentadas para este adaptador concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l4 (este) | LoRA sobre Olmo-3-7B-Think | 7B base + 0,2 GB adaptador | 66,7 % | Apache-2.0 | HuggingFace |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l4 | LoRA sobre Olmo-3-7B-Think (modelo principal del mismo nivel) | 7B base | no disponible | Apache-2.0 | HuggingFace |
| allenai/Olmo-3-7B-Think | Modelo base completo | 7B | no disponible | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento publicados para el modelo principal del mismo nivel ni para el modelo base en GSM8K en la informacion proporcionada. El autor advierte que este adaptador de ablación puede ser peor que el modelo principal del mismo nivel, ya que se entrenó para responder a una pregunta concreta sobre diseño de recompensa.

## Limitaciones y advertencias

- Solo está entrenado y evaluado en problemas de palabras matemáticos (GSM8K); no generaliza a otras tareas de razonamiento o generación.
- La precisión cae con la dificultad del problema, y la caída es más rápida en los niveles de compresión altos.
- Es un artefacto de ablación: puede ser peor que el modelo principal del mismo nivel (`cot-dialect-olmo3-7b-think-grpo-l4`) porque se entrenó para responder una pregunta específica sobre diseño de recompensa.
- Está entrenado con una sola semilla (salvo que el nombre del repo indique lo contrario); diferencias de un par de puntos porcentuales están dentro del ruido (semianchura del 95 % de ~2,7 pp con n=1317).
- No funciona si se carga directamente sobre el modelo base sin pasar por el adaptador SFT de nivel L4; el código de uso requiere cargar dos adaptadores secuencialmente.
- Solo soporta inglés.
- La licencia Apache-2.0 permite uso comercial, pero el modelo es un artefacto de investigación de ablación, no un producto listo para producción.
- El componente de recompensa `gr3` reescala recompensas ya positivas con un suelo de 0.3; no reordena respuestas correctas sobre incorrectas, pero su efecto sobre la calidad final no está analizado más allá del resultado publicado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-seed7-l4
- Modelo base Olmo-3-7B-Think: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo principal del mismo nivel (L4): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l4
- Adaptador SFT previo requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l4
- Paper de Olmo 3 (arXiv): https://arxiv.org/abs/2512.13961
- Pagina oficial de Olmo (AllenAI): https://allenai.org/olmo
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
