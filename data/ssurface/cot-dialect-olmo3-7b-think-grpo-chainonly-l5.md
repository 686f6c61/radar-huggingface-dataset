# ssurface/cot-dialect-olmo3-7b-think-grpo-chainonly-l5

## Resumen

`cot-dialect-olmo3-7b-think-grpo-chainonly-l5` es un adaptador LoRA (PEFT) publicado por ssurface (Anatolii Frolov) que modifica el modelo base `allenai/Olmo-3-7B-Think` para razonar en un nivel de compresion extrema (nivel L5) de cadenas de pensamiento. Se trata de una ablation experimental: el mismo nivel L5 entrenado con una variante de recompensa (`chainonly`) para aislar el efecto del diseno de reward en el rendimiento final. El objetivo del proyecto es estudiar como se puede comprimir el razonamiento interno de un modelo sin perder demasiada precision, reduciendo la cadena de pensamiento de una mediana de 532 caracteres (nivel L1) a solo 16 caracteres (nivel L5), un factor de 33x.

El adaptador se entrena con GRPO sobre el modelo SFT fusionado del nivel L5, con un conjunto de 6993 ejemplos de GSM8K re-expresados por un modelo profesor. En la evaluacion de GSM8K test alcanza un 70,8% de accuracy con decodificacion greedy, sin ejemplos ni self-consistency. Es un modelo de investigacion: su proposito es permitir que la comparacion de disenos de reward del articulo pueda reproducirse, no ser un modelo de produccion.

La licencia es Apache 2.0, el idioma soportado es ingles y el repositorio ocupa 0,2 GB. Es importante destacar que el adaptador debe cargarse sobre el modelo SFT fusionado del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre el base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Olmo-3-7B-Think (transformer causal de 7B parametros) |
| Parametros totales | 7B (modelo base) + adaptador LoRA r=16, alpha=32 (0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base, no especificado) |
| Tipos de cuantizacion | bfloat16 (usado en el ejemplo de carga); otras no especificadas |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 16 con alpha 32 aplicado sobre `allenai/Olmo-3-7B-Think`, un modelo de razonamiento de 7B parametros de AllenAI afinado mediante SFT, DPO y RLVR. El entrenamiento se realiza con `trl.GRPOTrainer` sobre transformers estandar con atencion `sdpa` (sin kernels fusionados, ya que la ruta fusionada producia matrices `lora_B` a cero). Se parte del modelo SFT fusionado del nivel L5 (`merged_olmo/l5`) y se aplica GRPO con 8 generaciones por prompt, batch de 32 con 2 pasos de acumulacion, max completion de 256 tokens, learning rate de 1e-05 y coeficiente KL (beta) de 0.01.

La funcion de recompensa combina tres componentes: `correctness` (proporcional al numero de pasos de la solucion de oro, penalizando mas los errores en problemas dificiles), `format` (la respuesta debe ser un unico bloque `thinking... response` seguido de `#### <respuesta>`) y `chain` (un verificador que comprueba que la aritmetica escrita dentro de la cadena es correcta). La variante `chainonly` es la ablation que aísla el efecto del componente `chain`. El dataset de entrenamiento son 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con una mediana de longitud de cadena de 16 caracteres dentro de `thinking`. Se entrenó en una unica NVIDIA A100 de 80 GB.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento extremadamente comprimidas (una sola expresion colapsada, p. ej. `18/3*2=12`).
- Generacion de texto en ingles con formato estructurado de respuesta (`thinking... response` + `#### <respuesta>`).
- Verificacion aritmetica interna: el componente `chain` de la recompensa garantiza que la aritmetica de la cadena sea correcta durante el entrenamiento.
- Capacidad de razonamiento paso a paso heredada del modelo base Olmo-3-7B-Think, pero con la cadena comprimida a nivel L5.
- Soporte de tool calling y function calling: no disponible (no se especifica en la informacion del adaptador).
- Capacidades multilingues: no, solo ingles.
- Capacidades de vision o audio: no.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: el modelo permite estudiar como afecta la compresion extrema (L5) a la precision en razonamiento matematico, comparando con los niveles L1 a L4 de la misma familia.
- Ablacion de diseno de recompensas: al ser una ablation `chainonly`, permite aislar el impacto del componente `chain` (verificador aritmetico) frente al modelo principal `grpo-l5`, para validar o refutar las conclusiones del articulo.
- Inferencia eficiente en entornos con presupuesto de tokens limitado: al generar cadenas de solo 16 caracteres de mediana, el coste de inferencia por consulta se reduce drasticamente frente a modelos con cadenas largas, lo que es relevante para despliegues en dispositivos con restricciones de latencia o coste.
- Generacion de datos sinteticos comprimidos: el modelo puede usarse como profesor para re-expresar problemas matematicos en formato L5, generando datasets de entrenamiento con razonamiento comprimido para otros modelos.
- Evaluacion de robustez del razonamiento comprimido: permite medir como cae la precision con la dificultad del problema (el propio autor indica que la accuracy disminuye mas rapido en los niveles comprimidos), util para caracterizar limites de la compresion.
- Reproducibilidad cientifica: al estar publicado como artefacto de investigacion con configuracion de entrenamiento completa (hiperparametros, recompensas, datos), sirve como punto de referencia para rerun de experimentos en estudios de razonamiento comprimido.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Dataset | Split | Metrica | Valor |
|---|---|---|---|---|
| Mathematical Reasoning | GSM8K (openai/gsm8k) | test (n=1317) | Accuracy (exact match) | 70,8% |

Condiciones de evaluacion: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency. El autor indica que la diferencia de un par de puntos porcentuales esta dentro del ruido estadistico (95% half-width ~2.7 pp a n=1317).

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K con self-consistency, etc.) en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en si ocupa 0,2 GB, pero requiere el modelo base Olmo-3-7B-Think completo para funcionar.
- VRAM estimada para inferencia: ~14 GB en bfloat16 (7B parametros), ~8-10 GB con cuantizacion de 8 bits, ~4-5 GB con cuantizacion de 4 bits.
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento), RTX 4090 (24 GB), RTX 3090 (24 GB), o cualquier GPU con al menos 16 GB para bfloat16 sin cuantizar.
- Cabe en GPUs de consumo: si, en RTX 4090 o RTX 3090 con cuantizacion, y en GPUs de 24 GB sin cuantizar.
- Opciones de despliegue: transformers con PEFT (carga via `PeftModel`), vLLM (si soporta adaptadores LoRA), llama.cpp con GGUF (requiere convertir el adaptador fusionado).
- Latencia y throughput: no disponibles. Sin embargo, al generar cadenas de solo 16 caracteres de mediana, el numero de tokens de salida por consulta es muy reducido, lo que mejora la latencia frente a modelos con cadenas largas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cot-dialect-olmo3-7b-think-grpo-chainonly-l5 (este) | 7B + LoRA | no disponible | 70,8% | Apache 2.0 | HuggingFace |
| ssurface/cot-dialect-olmo3-7b-think-grpo-l5 (modelo principal L5) | 7B + LoRA | no disponible | no disponible | Apache 2.0 | HuggingFace |
| allenai/Olmo-3-7B-Think (base) | 7B | no disponible | no disponible | Apache 2.0 | HuggingFace |
| ssurface/cot-dialect-olmo3-7b-think-sft-l5 (SFT L5) | 7B + LoRA | no disponible | no disponible | Apache 2.0 | HuggingFace |

Nota: no se dispone de datos de GSM8K para los modelos comparados en la informacion proporcionada. La comparativa estructural muestra que este adaptador es una variante de ablation del modelo principal L5, entrenado con el mismo nivel de compresion pero con un componente de recompensa `chain` anadido (la variante `chainonly` lo excluye). El autor advierte que, al ser un artefacto de ablation, puede ser peor que el modelo principal en el mismo nivel.

## Limitaciones y advertencias

- Entrenado y evaluado unicamente en problemas de matematicas con texto (GSM8K); no hay evidencia de rendimiento en otras tareas.
- La accuracy cae con la dificultad del problema, y la caida es mas pronunciada en los niveles comprimidos como L5.
- Es un artefacto de ablation: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser peor que el modelo principal en el mismo nivel.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico.
- El adaptador debe cargarse sobre el modelo SFT fusionado del nivel L5 (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), no directamente sobre `allenai/Olmo-3-7B-Think`; cargarlo sobre el base no reproducira el resultado declarado.
- Solo soporta ingles; no hay soporte multilingue.
- Riesgo de alucinacion: no evaluado especificamente, pero al ser un modelo de razonamiento comprimido, los errores aritmeticos pueden propagarse sin verificacion externa en inferencia.
- No apto para produccion sin validacion adicional: es un modelo de investigacion con fines de reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-chainonly-l5
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT L5 (requerido para carga): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l5
- Modelo principal L5 (variante no ablation): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l5
- GGUF del modelo base: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Ficha del modelo base en ThinkLLM: https://thinkllm.dev/models/olmo-3-7b-think
- Ficha del modelo base en llm.co: https://llm.co/llms/olmo-3-7b-think
- Ficha del modelo base en Multi AI: https://multi-ai.ai/en/models/olmo-3-7b-think
