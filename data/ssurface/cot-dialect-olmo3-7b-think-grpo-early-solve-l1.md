# ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l1

## Resumen

`cot-dialect-olmo3-7b-think-grpo-early-solve-l1` es un adaptador LoRA (PEFT) desarrollado por ssurface que modifica el comportamiento de razonamiento del modelo base `allenai/Olmo-3-7B-Think`. Forma parte de una familia de adaptadores que exploran distintos "dialectos" de compresión de la cadena de pensamiento (chain-of-thought), donde el nivel L1 corresponde a un razonamiento completo en lenguaje natural, sin comprimir. Este adaptador concreto es una ablación publicada para poder reproducir el estudio de diseño de recompensas del paper "Chain-of-Thought Compression Dialects": se entrenó con una recompensa adicional `early_solve` que premia alcanzar la respuesta pronto en el span generado, en lugar de tardíamente.

El adaptador se apila sobre el modelo SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l1` (no directamente sobre el base) y se entrenó con GRPO sobre el conjunto de entrenamiento de GSM8K reexpresado a nivel L1. El resultado declarado es un 87,2% de exactitud en el test de GSM8K. El repositorio ocupa 0,2 GB y está licenciado bajo Apache-2.0. Es relevante para la comunidad de investigación en razonamiento y compresión de cadenas de pensamiento, ya que permite comparar el efecto de la recompensa `early_solve` frente al modelo principal del mismo nivel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base: Olmo-3-7B-Think) con adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (~0,2 GB en pesos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; Olmo-3-7B-Think soporta contexto largo, valor exacto no publicado en la ficha) |
| Tipos de cuantizacion | No disponible (el adaptador es agnóstico; puede aplicarse sobre cuantizaciones del base, pero no se documentan) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base `allenai/Olmo-3-7B-Think` es un transformer de 7B parámetros con razonamiento visible: genera un bloque `thinking` antes de la respuesta final. Sobre este base se entrena primero un modelo SFT a nivel L1 (razonamiento verboso completo), y después se entrena este adaptador LoRA con GRPO (Group Relative Policy Optimization) usando `trl.GRPOTrainer` sobre `transformers` estándar con atención `sdpa`.

El entrenamiento utilizó el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor a nivel L1: 6913 ejemplos con una mediana de longitud de cadena de 532 caracteres dentro de `thinking`. La recompensa combinaba tres componentes: `correctness` (acierto ponderado por el número de pasos de la solución dorada), `format` (obligaba a una estructura `thinking... response` seguida de `#### <answer>`) y `early_solve` (premiaba llegar a la respuesta temprano en el span). Se usó loss tipo `dapo`, 8 generaciones por prompt, batch 64x1, máximo de 256 tokens de completación, learning rate 1e-05, coeficiente KL 0.0 y una sola A100 80GB. El autor verificó que las matrices `lora_B` del adaptador no fueran cero antes de publicarlo; 13 adaptadores que fallaron esa comprobación fueron retenidos.

## Capacidades

- Razonamiento matemático paso a paso en lenguaje natural (nivel L1, verboso).
- Generación de texto con formato estructurado de pensamiento visible (`thinking` + respuesta final).
- Resolución de problemas aritméticos verbales de tipo GSM8K.
- Capacidad de seguir instrucciones en inglés para plantear problemas en el formato esperado (prefijo "Solve this using Level 1 (Verbose).").
- No se documentan capacidades de tool calling, agentes, visión, audio ni multilingüismo.

## Casos de uso

- Reproducción de experimentos de investigación: permite verificar el efecto de la recompensa `early_solve` en la calidad del razonamiento, tal y como se describe en el paper de referencia.
- Evaluación comparativa de dialectos de compresión de cadena de pensamiento: al ser una ablación del nivel L1, sirve para comparar la influencia del diseño de recompensas frente al modelo principal `cot-dialect-olmo3-7b-think-grpo-l1`.
- Generación de explicaciones educativas en matemáticas: el modelo produce razonamientos completos y legibles que pueden usarse para generar soluciones comentadas de problemas aritméticos.
- Análisis de robustez del razonamiento: al estar entrenado con `early_solve`, permite estudiar cómo la presión por responder pronto afecta a la exactitud en problemas de dificultad variable.
- Prototipado de sistemas de tutoría inteligente: con el prompt adecuado, puede generar soluciones paso a paso para problemas verbales de matemáticas elementales.
- Estudio de compresión de cadenas de pensamiento: sirve como punto de referencia para investigar el equilibrio entre longitud de razonamiento y precisión.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card (verificado: no, declarado por el autor):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 87,2% |

Condiciones: greedy decoding, single-turn, sin ejemplos (exemplars) y sin self-consistency. No se han publicado resultados en otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es muy ligero (0,2 GB), pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7B parámetros.
- VRAM estimada: en bf16, el modelo base ocupa aproximadamente 14 GB; con cuantización 4-bit puede caber en GPUs con 8 GB de VRAM (p. ej., RTX 3060/4060). El adaptador añade un coste marginal.
- GPU recomendadas: una NVIDIA A100 80GB (usada en entrenamiento) o GPUs consumer de 16-24 GB (RTX 4090, RTX 4080) para inferencia cómoda en bf16.
- El adaptador se carga con `peft` y `transformers`; puede combinarse con `vLLM` o `TGI` si se fusiona previamente con el modelo base, o usarse con `llama.cpp` tras convertir a GGUF (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El autor menciona que el modelo principal del mismo nivel es `ssurface/cot-dialect-olmo3-7b-think-grpo-l1`, pero no publica sus resultados en esta ficha. Tampoco se aportan benchmarks de otros modelos de razonamiento matemático (p. ej., Llama-3.1-8B-Instruct, Qwen2.5-7B-Instruct) para comparar. Por tanto, no se puede establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Es una ablación experimental: el propio autor advierte que fue entrenado para responder una pregunta concreta sobre diseño de recompensas y puede ser peor que el modelo principal del mismo nivel.
- Solo está entrenado y evaluado en problemas verbales de matemáticas (GSM8K); no es adecuado para otras tareas sin adaptación adicional.
- Solo soporta inglés; no se ha evaluado en otros idiomas.
- La exactitud cae con la dificultad del problema, especialmente en los niveles comprimidos (aunque este es el nivel L1, menos comprimido).
- Resultado basado en una sola semilla; diferencias de un par de puntos porcentuales están dentro del ruido (intervalo de confianza del 95% de ~2,7 pp en n=1317).
- El adaptador debe cargarse sobre el modelo SFT `ssurface/cot-dialect-olmo3-7b-think-sft-l1`; cargarlo directamente sobre `allenai/Olmo-3-7B-Think` no reproduce el resultado declarado.
- Riesgo de alucinación en problemas fuera de distribución o con enunciados ambiguos, como cualquier modelo generativo.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tiene su propia licencia (Apache-2.0 también, según la documentación de Olmo 3).

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-early-solve-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Modelo SFT requerido: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l1
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Repositorio de entrenamiento OLMo-core: https://github.com/allenai/OLMo-core/tree/main/src/scripts/official/OLMo3
- Modelo principal del mismo nivel (referencia): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l1
