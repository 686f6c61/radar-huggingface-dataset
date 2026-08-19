# ssurface/cot-dialect-qwen3-4b-instruct-grpo-addlen110-l5

## Resumen

`cot-dialect-qwen3-4b-instruct-grpo-addlen110-l5` es un adaptador LoRA publicado por `ssurface` que modifica el comportamiento de razonamiento del modelo base `Qwen/Qwen3-4B-Instruct-2507` para producir cadenas de pensamiento (chain-of-thought) extremadamente comprimidas, a un nivel denominado "L5" (expresión colapsada en una sola línea). El autor lo describe como una **ablación** dentro de una familia de modelos dedicados al estudio de la compresión de razonamiento: a diferencia del modelo principal del mismo nivel (`cot-dialect-qwen3-4b-instruct-grpo-l5`), este adaptador se entrenó con una variante de recompensa (`addlen110`) para aislar el efecto del diseño de recompensas en el resultado final.

El modelo se entrena mediante GRPO sobre el conjunto GSM8K, partiendo de un modelo SFT previo que ya había sido ajustado para producir cadenas de nivel L5. El resultado es un adaptador que alcanza un 72,3 % de precisión exacta en GSM8K test (n=1317) con decodificación greedy, sin ejemplos ni self-consistency. Aunque es un artefacto de investigación, su publicación permite reproducir y comparar el efecto de la recompensa de longitud en la calidad del razonamiento comprimido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B-Instruct-2507 (transformer denso) |
| Parametros totales | no disponible (adaptador LoRA; modelo base ~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32K (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | no disponible (adaptador en safetensors, requiere el modelo base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

## Arquitectura y entrenamiento

El adaptador se construye sobre el modelo base `Qwen3-4B-Instruct-2507`, un transformer denso de 4.000 millones de parametros con soporte de modo pensamiento y modo no pensamiento. El adaptador LoRA tiene r=16 y alpha=32, y se entrena con el `GRPOTrainer` de `trl` sobre `transformers` estándar con atención `sdpa`. El entrenamiento se realiza sobre un modelo SFT previo (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) que ya habia sido ajustado para generar cadenas de nivel L5, no directamente sobre el modelo base. El dataset de entrenamiento consiste en 6.993 ejemplos de GSM8K train re-expresados por un modelo profesor a nivel L5, con una longitud mediana de cadena de pensamiento de 16 caracteres (frente a 532 caracteres en el nivel L1, un rango de 33x).

La recompensa combina cinco componentes: `correctness` (ponderada por el número de pasos de la solución dorada), `format` (exige un bloque `thinking...response` y `#### <answer>`), `length` (recompensa gradual que empuja la cadena hacia la longitud objetivo), `chain` (verificador aritmético de las operaciones escritas en la cadena) y `gdpo` (normalización independiente de cada recompensa dentro del grupo). El coeficiente KL (beta) es 0.0, y se generan 8 respuestas por prompt con un batch de 16 x 2 acumulaciones. El autor advierte que el adaptador debe cargarse sobre el modelo SFT fusionado, no sobre el modelo base, para reproducir los resultados.

## Capacidades

- Razonamiento matemático: resuelve problemas de aritmética y álgebra elemental del conjunto GSM8K con cadenas de pensamiento extremadamente cortas (una única expresión, p. ej. `18/3*2=12`).
- Generación de texto con formato estructurado: produce respuestas que cumplen un formato estricto de bloques `thinking` y `response` con respuesta final precedida de `####`.
- Compresión de razonamiento: es capaz de expresar el proceso de resolución en una sola línea colapsada, manteniendo una precisión razonable (72,3 % en GSM8K test).
- No se documentan capacidades de tool calling, agentes, vision ni audio.
- Multilingüe: no, entrenado y evaluado solo en inglés.

## Casos de uso

- Investigación sobre compresión de chain-of-thought: el adaptador permite estudiar cómo afecta la longitud de la cadena de razonamiento a la precisión final, y comparar el efecto de distintas funciones de recompensa (este modelo es una ablación para ese fin).
- Evaluación de diseño de recompensas en RL: al ser una variante con recompensa `addlen110`, sirve para aislar el impacto del componente de longitud frente al modelo principal L5.
- Reproducción de experimentos de GRPO con LoRA: el repositorio incluye la configuración completa de entrenamiento (batch, learning rate, componentes de recompensa) que puede replicarse en otros dominios.
- Benchmark de razonamiento comprimido: puede usarse como referencia para medir el equilibrio entre concisión y exactitud en tareas de matemáticas.
- Pruebas de robustez del verifier aritmético: el componente `chain` verifica las operaciones internas, lo que permite analizar qué tipos de errores comete el modelo cuando la cadena es demasiado corta.
- Docencia y divulgación: útil como ejemplo práctico de fine-tuning con GRPO y de cómo la compresión del razonamiento afecta al rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | GSM8K (test, n=1317) | Accuracy (exact match) | 72,3 % |

Condiciones de evaluación: decodificación greedy, single-turn, sin ejemplos y sin self-consistency. El autor indica que la precisión cae con la dificultad del problema, de forma más acusada en los niveles comprimidos. No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia: requiere cargar el modelo base Qwen3-4B-Instruct-2507 (4B parametros) más el adaptador LoRA. Con cuantizacion de 4 bits, cabe en GPUs consumer con 8 GB de VRAM (p. ej. RTX 3060/4060); con precision bfloat16 completa se recomiendan 12-16 GB.
- Entrenamiento: el autor utilizo una unica NVIDIA A100 80GB para el entrenamiento GRPO.
- Despliegue: compatible con `transformers` + `peft` (carga y fusion del adaptador). Puede servirse con vLLM o TGI si se fusiona previamente el adaptador con el modelo base.
- Latencia: al tratarse de un adaptador LoRA, el overhead sobre el modelo base es minimo; la compresion de la cadena de pensamiento reduce el numero de tokens generados, lo que disminuye la latencia de generacion en comparacion con cadenas largas.

## Comparativa con modelos similares

| Modelo | Tipo | Precision GSM8K | Contexto | Licencia |
|---|---|---|---|---|
| `cot-dialect-qwen3-4b-instruct-grpo-addlen110-l5` (este) | LoRA sobre Qwen3-4B | 72,3 % (declarado) | 32K | apache-2.0 |
| `ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5` | LoRA sobre Qwen3-4B (modelo principal L5) | no disponible | 32K | apache-2.0 |
| `ssurface/qwen3-4b-grpo-l5` | LoRA sobre Qwen3-4B (variante GRPO) | no disponible | 32K | apache-2.0 |

No se dispone de datos de rendimiento publicados para los modelos comparables de la misma familia. El autor indica que esta ablacion puede ser peor que el modelo principal del mismo nivel, ya que fue entrenada para responder una pregunta concreta sobre el diseno de recompensas.

## Limitaciones y advertencias

- Es una **ablacion de investigacion**, no un modelo de produccion. El propio autor advierte que puede ser peor que el modelo principal del mismo nivel.
- Entrenado y evaluado exclusivamente en problemas de matematicas de GSM8K; no se garantiza ningun comportamiento fuera de ese dominio.
- La precision cae rapidamente con la dificultad del problema, especialmente en los niveles de compresion extrema (L5).
- Requiere cargar primero el modelo SFT (`ssurface/cot-dialect-qwen3-4b-instruct-sft-l5`) y fusionarlo antes de aplicar este adaptador; cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- El entrenamiento se realizo con una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95 % de ~2,7 pp con n=1317).
- Solo soporta ingles.
- No se documentan sesgos especificos, pero al ser un modelo derivado de Qwen3-4B, hereda los sesgos potenciales del modelo base.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-addlen110-l5
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Modelo SFT previo necesario: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-sft-l5
- Modelo principal del mismo nivel: https://huggingface.co/ssurface/cot-dialect-qwen3-4b-instruct-grpo-l5
- Paper citado por el autor (Chain-of-Thought Compression Dialects, Frolov, 2026): no disponible como URL directa en la informacion proporcionada
