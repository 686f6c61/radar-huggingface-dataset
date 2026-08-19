# ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l1

## Resumen

`cot-dialect-math-olmo3-7b-think-grpo-base-l1` es un adaptador LoRA publicado por el usuario `ssurface` que se apila sobre el modelo base `allenai/Olmo-3-7B-Think` para especializarlo en razonamiento matemático mediante cadenas de pensamiento (chain-of-thought) a un nivel de compresión denominado L1, que corresponde a una explicación completa en lenguaje natural. El proyecto del autor, denominado "Chain-of-Thought Compression Dialects", explora cómo distintos niveles de verbosidad en el razonamiento afectan al rendimiento; este adaptador concreto es la fase de optimización por refuerzo (GRPO) sobre un primer adaptador SFT del mismo nivel.

El modelo está entrenado exclusivamente con problemas del dataset MATH re-expresados por un modelo profesor, y obtiene un 65,6% de precisión exacta en MATH-500 con decodificación greedy y sin ejemplos ni self-consistency. Es relevante porque demuestra que es posible ajustar un modelo de razonamiento de 7B mediante LoRA y RL para tareas matemáticas con un coste de entrenamiento reducido (una sola A100 80GB), manteniendo la licencia Apache 2.0. El adaptador pesa 0,2 GB y se distribuye en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer `allenai/Olmo-3-7B-Think` (modelo base de 7B) |
| Parametros totales | Adaptador: r=16, alpha=32 (numero exacto no disponible); modelo base: 7B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base) |
| Tipos de cuantizacion | No disponible (el adaptador se carga en bf16; el base puede cuantizarse) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena sobre el modelo `allenai/Olmo-3-7B-Think`, un transformer causal de 7B parametros con soporte nativo de razonamiento (thinking mode). La arquitectura del adaptador es LoRA con r=16 y alpha=32, aplicada sobre las capas atencionales y MLP del modelo base. El entrenamiento se realiza en dos fases: primero un ajuste fino supervisado (SFT) con problemas de MATH re-expresados a nivel L1 por un modelo profesor, y posteriormente una optimizacion por refuerzo con GRPO (`trl.GRPOTrainer`) sobre el modelo SFT fusionado. La funcion de recompensa combina `correctness` (ponderada por el numero de pasos de la solucion dorada) y `format` (exige un bloque `thinking... response` seguido de `#### <answer>`). Se usan 8 generaciones por prompt, batch 32x2, max completion de 256 tokens, learning rate 1e-05 y coeficiente KL de 0.0 (loss type `dapo`). El entrenamiento se realizo en una unica NVIDIA A100 80GB. El autor advierte que el adaptador debe cargarse sobre el modelo SFT fusionado, no directamente sobre el base, y que se verifico que las matrices `lora_B` no fueran nulas antes de publicar.

## Capacidades

- Razonamiento matematico con cadenas de pensamiento explicitas: genera una secuencia `thinking... response` antes de dar la respuesta final.
- Compresion de razonamiento a nivel L1 (explicacion completa en lenguaje natural), segun la taxonomia del proyecto "Chain-of-Thought Compression Dialects".
- Generacion de respuestas en formato LaTeX con `\boxed{}` para la respuesta final, compatible con el grader del proyecto.
- Hereda las capacidades de generacion de texto del modelo base `Olmo-3-7B-Think`, aunque el adaptador esta especializado en matematicas.
- No se documenta soporte explicito para tool calling, agentes o vision; el adaptador se centra exclusivamente en tareas de razonamiento matematico de una sola vuelta.

## Casos de uso

- Resolucion de problemas de matematicas de nivel competitivo: el adaptador puede generar soluciones paso a paso para problemas de algebra, calculo, probabilidad y teoria de numeros, con la cadena de razonamiento visible.
- Tutoria automatica: al emitir el razonamiento completo en lenguaje natural, puede usarse como asistente educativo que explica el proceso de resolucion a estudiantes.
- Generacion de soluciones en formato LaTeX: su salida con `\boxed{}` facilita la integracion en pipelines de evaluacion automatica o generacion de materiales didacticos.
- Evaluacion de modelos de razonamiento: al estar disenado para MATH-500, sirve como referencia para comparar tecnicas de compresion de CoT en entornos de investigacion.
- Prototipado de agentes de razonamiento: aunque no soporta tool calling nativamente, puede integrarse como modulo de calculo simbolico en sistemas mayores que gestionen la interaccion con herramientas externas.
- Benchmarking de metodos RL: el adaptador demuestra un pipeline reproducible (SFT + GRPO con LoRA) que puede replicarse para otros niveles de compresion o datasets.

## Benchmarks y rendimiento

El autor declara el siguiente resultado en la model card, verificado con un grader consciente de LaTeX (normaliza formas equivalentes como `\frac{14}{3}` y `14/3`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Razonamiento matematico | MATH-500 (test) | Accuracy (exact match) | 65,6% |

Condiciones de evaluacion: decodificacion greedy, single-turn, sin ejemplos, sin self-consistency, n=500. No se han publicado comparativas con otros modelos o adaptadores en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA pesa 0,2 GB y se carga sobre el modelo base de 7B. En bf16, el modelo base requiere aproximadamente 14 GB de VRAM, por lo que cabe en una GPU consumer de 16 GB (p. ej., RTX 4090) o en una A100 80GB.
- Con cuantizacion del modelo base (p. ej., 4 bits) podria ejecutarse en GPUs con 8-10 GB de VRAM, aunque no se proporcionan datos oficiales de rendimiento cuantizado.
- Hardware de entrenamiento documentado: 1x NVIDIA A100 80GB.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con `transformers` + `peft` en Python; tambien es compatible con frameworks que soporten LoRA como vLLM o TGI si se fusiona previamente con `merge_and_unload()`. No se documenta soporte para llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen del hardware y del modelo base.

## Comparativa con modelos similares

No se dispone de datos de benchmarks para modelos comparables (p. ej., el modelo base sin adaptador, otros adaptadores LoRA para matematicas, o modelos como Qwen2.5-Math-7B) en la informacion proporcionada. La unica referencia es el propio adaptador, que alcanza 65,6% en MATH-500. Se recomienda consultar la documentacion del proyecto para comparaciones mas amplias.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con problemas de matematicas de una sola vuelta; no es adecuado para tareas generales de conversacion o generacion de codigo sin ajuste adicional.
- La precision disminuye rapidamente con la dificultad del problema, especialmente en niveles de compresion mas altos (aunque este adaptador es el nivel L1, el mas verboso).
- El adaptador debe cargarse sobre el modelo SFT fusionado (`cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1`), no directamente sobre `allenai/Olmo-3-7B-Think`; hacerlo de otra forma no reproduce los resultados publicados.
- Los resultados de MATH-500 tienen un margen de error de aproximadamente ±4,4 puntos porcentuales (95% intervalo de confianza a n=500), por lo que diferencias de unos pocos puntos pueden deberse al ruido.
- Solo se documento una semilla de entrenamiento; la reproducibilidad puede variar.
- El modelo solo soporta ingles; no se evaluo su comportamiento en otros idiomas.
- Riesgo de alucinacion en problemas fuera de distribucion o con enunciados ambiguos, comun en modelos de razonamiento.
- Aunque la licencia es Apache-2.0, el uso comercial debe verificar la licencia del modelo base `Olmo-3-7B-Think` y de los datasets utilizados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-grpo-base-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Adaptador SFT requerido: https://huggingface.co/ssurface/cot-dialect-math-olmo3-7b-think-sft-unfiltered-l1
- Dataset de evaluacion: https://huggingface.co/datasets/HuggingFaceH4/MATH-500
- Citacion del proyecto: Frolov, Anatolii (2026). "Chain-of-Thought Compression Dialects" (referencia en la model card, sin enlace directo disponible).
