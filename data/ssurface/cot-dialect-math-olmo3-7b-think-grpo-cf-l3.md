# ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l3

## Resumen

El modelo `cot-dialect-math-olmo3-7b-think-grpo-cf-l3` es un adaptador LoRA desarrollado por ssurface que modifica el comportamiento de razonamiento de `allenai/Olmo-3-7B-Think` para operar en un "dialecto" de compresión de cadena de pensamiento (chain-of-thought) denominado nivel L3. En este dialecto, cada línea del razonamiento contiene una única asignación simbólica, lo que reduce la verbosidad del CoT sin perder la estructura lógica. El adaptador se entrena mediante GRPO (optimización de política proximal con recompensa grupal) sobre un modelo SFT previo, y está especializado en problemas matemáticos.

El modelo resuelve el problema de la compresión del razonamiento en modelos de lenguaje: mantener la precisión en tareas matemáticas mientras se reduce el número de tokens generados. Es relevante para la investigación en eficiencia de inferencia y para aplicaciones donde el coste de generación es crítico. El adaptador se publica bajo licencia Apache 2.0 y está pensado para ser apilado sobre el modelo SFT fusionado correspondiente, no directamente sobre el base.

El tamaño del repositorio es de 0.2 GB, lo que refleja únicamente los pesos del adaptador LoRA (r=16, alpha=32). El modelo base tiene 7B parámetros y pertenece a la familia Olmo 3 de AI2, conocida por su apertura total y su enfoque en razonamiento de contexto largo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base: `allenai/Olmo-3-7B-Think`) + adaptador LoRA |
| Parametros totales | Modelo base 7B; adaptador LoRA (r=16, alpha=32), numero de parametros del adaptador no publicado |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors, sin cuantizacion propia) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo transformer causal de 7B parámetros de la familia Olmo 3. El entrenamiento se realiza en dos fases: primero un ajuste fino supervisado (SFT) con problemas de entrenamiento MATH re-expresados a nivel L3 por un modelo profesor, y posteriormente una etapa de refuerzo con GRPO (implementado con `trl.GRPOTrainer` sobre `transformers` estándar, atención `sdpa`). La configuración de GRPO incluye 8 generaciones por prompt, batch de 32 con acumulación de 2, longitud máxima de completado de 256 tokens, tasa de aprendizaje de 1e-05 y coeficiente KL de 0.04. La función de recompensa combina `correctness` (basada en la coincidencia de la respuesta y ponderada por el número de pasos de la solución dorada) y `format` (exige un bloque ` thinking... response` seguido de `#### <answer>`). Se utilizó pérdida tipo `dapo` y LoRA con r=16 y alpha=32. El entrenamiento se ejecutó en una única NVIDIA A100 80GB.

Una nota importante del autor: el uso de kernels fusionados produjo adaptadores con matrices `lora_B` todas cero, por lo que se optó por `transformers` estándar con `sdpa`. Todos los adaptadores publicados fueron verificados con `lora_B != 0`.

## Capacidades

- Razonamiento matemático: resuelve problemas de matemáticas de nivel competitivo (evaluado en MATH-500) con un formato de respuesta estructurado.
- Generacion de chain-of-thought comprimido: produce razonamientos en dialecto L3, con una asignacion simbolica por linea, reduciendo el numero de tokens frente al CoT completo.
- Salida estructurada: genera un bloque de pensamiento seguido de una respuesta final en formato `#### <answer>` o `\boxed{}`.
- Sin soporte de tool calling ni function calling: no se menciona ninguna capacidad de este tipo.
- Sin soporte de agentes ni multi-step reasoning fuera del ambito matematico.
- Multilingue: limitado al ingles (idioma de entrenamiento y evaluacion).

## Casos de uso

- Tutoria de matematicas automatizada: el modelo puede generar soluciones paso a paso para problemas de algebra, calculo o teoria de numeros, presentando el razonamiento en un formato compacto y legible. Su entrenamiento en MATH-500 garantiza solvencia en problemas de nivel olimpico.
- Generacion de explicaciones para materiales educativos: dado un problema, produce una cadena de razonamiento simbolica que puede servir como base para apuntes o guias de estudio, reduciendo el coste de generacion frente a modelos con CoT verboso.
- Evaluacion de modelos de razonamiento: al estar especializado en un dialecto de compresion, puede usarse como banco de pruebas para estudiar el impacto de la compresion del CoT en la precision final.
- Integracion en pipelines de razonamiento con presupuesto de tokens limitado: en entornos donde el coste por token es relevante (APIs, despliegues en edge), este adaptador permite obtener respuestas correctas con menos tokens de razonamiento que el modelo base sin comprimir.
- Investigacion en RL para matematicas: el adaptador y su configuracion de entrenamiento (GRPO, recompensas mixtas) son un punto de partida reproducible para experimentos de refuerzo en dominios simbolicos.
- Generacion de datos sinteticos de razonamiento: puede utilizarse para crear ejemplos de CoT comprimido a partir de problemas matematicos, alimentando otros modelos o sistemas de aumento de datos.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en MATH-500 (n=500, greedy decoding, single-turn, sin ejemplos ni self-consistency):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Mathematical Reasoning | MATH-500 (test) | Accuracy (exact match) | 61.6% |

Nota del autor: el harness original que buscaba el formato `#### n` puntuaba erroneamente a modelos que usan `\boxed{}`; los resultados provienen de un grader compatible con LaTeX que normaliza formas equivalentes (p. ej. `\frac{14}{3}` == `14/3`). No se proporcionan comparaciones con otros modelos en la model card.

## Requisitos de hardware

- El entrenamiento se realizo en 1x NVIDIA A100 80GB, con LoRA y GRPO.
- Para inferencia, el modelo base de 7B en bf16 requiere aproximadamente 14 GB de VRAM; con cuantizacion 4-bit podria caber en GPUs consumer de 8-12 GB, pero no se han publicado configuraciones de cuantizacion especificas para este adaptador.
- El adaptador LoRA es ligero (0.2 GB), por lo que el coste adicional de memoria es minimo.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft` en cualquier entorno que soporte estos frameworks. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la informacion proporcionada. El modelo base `allenai/Olmo-3-7B-Think` tiene sus propios benchmarks publicados en el paper de Olmo 3 (arXiv:2512.13961), pero no se incluyen aqui. Existe otro adaptador de la comunidad, `Alelcv27/Olmo3-7B-Math-CoT`, que tambien ajusta Olmo-3-7B-Instruct para razonamiento matematico, pero no se aportan resultados numericos en la busqueda web. Por tanto, la comparativa cuantitativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de palabras matematicas; no es adecuado para otras tareas de lenguaje general.
- La precision disminuye con la dificultad del problema, especialmente en los niveles de compresion mas agresivos.
- El adaptador debe cargarse sobre el modelo SFT fusionado (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l3`), no directamente sobre `allenai/Olmo-3-7B-Think`; cargarlo sobre el base no reproducira los resultados publicados.
- Resultados basados en una unica semilla; diferencias de un par de puntos porcentuales estan dentro del ruido (intervalo de confianza del 95% de ~4.4 pp en n=500).
- No se han reportado sesgos especificos, pero al estar entrenado solo en ingles, su uso en otros idiomas no esta garantizado.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think tambien es Apache-2.0, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-cf-l3
- Modelo base (Olmo-3-7B-Think): https://huggingface.co/allenai/Olmo-3-7B-Instruct (pagina del modelo Instruct, el Think no se ha localizado directamente)
- Paper de Olmo 3: https://arxiv.org/abs/2512.13961
- Proyecto Olmo de AI2: https://allenai.org/olmo
- Adaptador similar de la comunidad: https://huggingface.co/Alelcv27/Olmo3-7B-Math-CoT
- Version GGUF de un adaptador similar (no oficial): https://local-ai-zone.github.io/models/olmo3-7b-math-cot.html
