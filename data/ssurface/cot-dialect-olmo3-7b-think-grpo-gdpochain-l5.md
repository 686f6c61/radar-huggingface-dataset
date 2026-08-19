# ssurface/cot-dialect-olmo3-7b-think-grpo-gdpochain-l5

## Resumen

El modelo `cot-dialect-olmo3-7b-think-grpo-gdpochain-l5` es un adaptador LoRA publicado por el usuario ssurface que modifica el modelo base `allenai/Olmo-3-7B-Think` para que genere cadenas de razonamiento extremadamente comprimidas, concretamente en el nivel L5 de la familia de "dialectos de compresión de cadena de pensamiento" desarrollada por el autor. En este nivel, una cadena de pensamiento se reduce a una única expresión aritmética colapsada, como `18/3*2=12`, en lugar de los 532 caracteres típicos del nivel L1. Se trata de una ablación publicada específicamente para comparar el diseño de recompensas `gdpo` frente al modelo principal del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`), con el fin de que la comparación de diseño de recompensas pueda reproducirse de forma independiente.

El adaptador, de solo 0.2 GB de pesos, se entrenó mediante GRPO sobre un modelo SFT fusionado de nivel 5, utilizando el conjunto de entrenamiento de GSM8K reexpresado por un modelo profesor (6993 ejemplos con una mediana de 16 caracteres por cadena). El resultado declarado es un 74.6% de precisión exacta en GSM8K test con decodificación greedy, sin ejemplos ni self-consistency. Su relevancia radica en investigar el equilibrio entre compresión del razonamiento y rendimiento, un aspecto clave para reducir el coste de inferencia en modelos de razonamiento, así como en la transparencia metodológica al publicar ablaciones para validar decisiones de diseño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (Olmo-3-7B-Think) |
| Parametros totales | No disponible (adaptador LoRA r=16, alpha=32; modelo base 7.3B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (adaptador en safetensors; el base puede cuantizarse) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en el modelo `allenai/Olmo-3-7B-Think`, un modelo de 7.3B parámetros de Allen Institute for AI entrenado con SFT, DPO y RLVR para razonamiento visible mediante tokens de pensamiento. Sobre este base, el autor aplica un adaptador LoRA con r=16 y alpha=32, entrenado con GRPO sobre un modelo SFT fusionado del nivel L5 (es decir, primero se entrena un adaptador SFT para ese nivel, se fusiona con el base, y luego se entrena este adaptador GRPO sobre el resultado fusionado). El entrenamiento utilizó `trl.GRPOTrainer` con atención `sdpa` (sin kernels fusionados, ya que estos producían matrices `lora_B` nulas), 8 generaciones por prompt, batch 32 con 2 pasos de acumulación, longitud máxima de completación de 256 tokens, tasa de aprendizaje 1e-5 y coeficiente KL de 0.01. El conjunto de prompts fue `gsm8k_grpo_balanced_1k.json` y el hardware fue una única NVIDIA A100 de 80 GB.

La función de recompensa combina cuatro componentes: `correctness` (basada en el número de pasos de la solución dorada para ponderar problemas más difíciles), `format` (exige un bloque `thinking... response` seguido de `#### <answer>`), `chain` (un verificador que comprueba que la aritmética dentro de la cadena es correcta) y `gdpo` (normaliza cada recompensa independientemente dentro del grupo antes de sumarlas, evitando que un componente domine sobre los demás). Los datos de entrenamiento consisten en 6993 ejemplos de GSM8K train reexpresados a nivel L5 por un modelo profesor, con una mediana de 16 caracteres por cadena de pensamiento.

## Capacidades

- Razonamiento matemático en problemas de palabras, específicamente del conjunto GSM8K.
- Generación de cadenas de pensamiento comprimidas a nivel L5, es decir, una única expresión aritmética colapsada (por ejemplo, `18/3*2=12`).
- Cumplimiento de un formato estricto de salida: un bloque `thinking... response` y una respuesta final precedida por `####`.
- No se documentan capacidades adicionales como tool calling, visión, audio o soporte multilingüe más allá del inglés.

## Casos de uso

- Investigación en compresión de razonamiento: permite estudiar cómo afecta la reducción extrema de la cadena de pensamiento (de 532 a 16 caracteres) a la precisión en tareas matemáticas, sirviendo como referencia para el diseño de modelos más eficientes en tokens.
- Evaluación de diseños de recompensa en RLHF/GRPO: al ser una ablación con una variante de recompensa (`gdpo`), puede usarse para comparar el impacto de la normalización de recompensas frente al modelo principal del mismo nivel, sin necesidad de reentrenar desde cero.
- Generación de respuestas matemáticas con bajo coste de tokens: en aplicaciones donde el presupuesto de tokens de salida es limitado (por ejemplo, APIs con coste por token), este adaptador produce respuestas extremadamente cortas, aunque con una precisión menor que el modelo sin comprimir.
- Tutoría automatizada con respuestas directas: en sistemas de enseñanza donde se prefiere dar la solución final sin pasos intermedios (por ejemplo, para que el estudiante deduzca el proceso), el modelo puede generar la respuesta colapsada de forma rápida.
- Benchmarking de modelos de razonamiento comprimido: sirve como punto de referencia para comparar otras técnicas de compresión de cadenas de pensamiento, ya que está públicamente disponible con su configuración de entrenamiento completa.
- Análisis de la relación entre longitud de cadena y precisión: al estar disponible junto con otros niveles (L1 a L5) de la misma familia, permite trazar curvas de rendimiento frente a compresión y estudiar el punto de equilibrio óptimo.

## Benchmarks y rendimiento

El autor declara un único resultado de benchmark en la model card:

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Razonamiento matemático | GSM8K (openai/gsm8k) | test | Accuracy (exact match) | 74.6% |

Condiciones de evaluación: decodificación greedy, una sola vuelta, sin ejemplos y sin self-consistency, sobre n=1317 ejemplos. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0.2 GB, pero requiere cargar el modelo base `allenai/Olmo-3-7B-Think` de 7.3B parámetros.
- Para inferencia en bfloat16, se estima que se necesitan aproximadamente 15-16 GB de VRAM (estimación orientativa, no hay dato oficial del autor).
- Con cuantización del modelo base (por ejemplo, 4-bit), la VRAM podría reducirse a unos 6-8 GB, pero no se proporciona documentación específica para este adaptador.
- El autor utilizó una NVIDIA A100 de 80 GB para el entrenamiento; para inferencia, una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100, V100) sería suficiente en bf16.
- Opciones de despliegue: `transformers` con `peft` (cargando primero el adaptador SFT y fusionándolo, luego este adaptador), o mediante GGUF del modelo base fusionado con herramientas como llama.cpp u Ollama, aunque no hay instrucciones oficiales para este adaptador concreto.

## Comparativa con modelos similares

No se dispone de comparativas directas publicadas. El modelo principal de la misma familia (`ssurface/cot-dialect-olmo3-7b-think-grpo-l5`) no tiene resultados publicados en la información disponible. Frente al modelo base `allenai/Olmo-3-7B-Think`, que alcanza un rendimiento superior en GSM8K (aunque no se indica el valor exacto), este adaptador sacrifica precisión a cambio de una compresión drástica de la cadena de pensamiento. No se dispone de datos de otros modelos comparables en el mismo contexto de compresión.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas matemáticos de palabras (GSM8K); no es adecuado para otras tareas sin reentrenamiento.
- La precisión cae con la dificultad del problema, siendo la caída más pronunciada en los niveles comprimidos como L5.
- Es una ablación de investigación: puede ser peor que el modelo principal del mismo nivel, ya que fue entrenada para responder una pregunta concreta sobre diseño de recompensas.
- Variabilidad por semilla: diferencias de un par de puntos porcentuales están dentro del ruido (intervalo de confianza del 95% de aproximadamente ±2.7 pp con n=1317).
- Para reproducir los resultados, es obligatorio cargar primero el adaptador SFT (`ssurface/cot-dialect-olmo3-7b-think-sft-l5`), fusionarlo con el base, y luego cargar este adaptador GRPO. Cargarlo directamente sobre el modelo base no reproduce el rendimiento declarado.
- Solo soporta inglés.
- El prompt de uso debe seguir el formato "Solve this using Level 5 (Extreme). Problem: {problema}"; otros formatos pueden degradar el rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gdpochain-l5
- Modelo base `allenai/Olmo-3-7B-Think`: https://huggingface.co/allenai/Olmo-3-7B-Think
- Cuantización GGUF del base por unsloth: https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Artículo de DEV.co sobre Olmo-3-7B-Think: https://dev.co/ai/llms/olmo-3-7b-think
- Página en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Artículo en llm.co sobre Olmo-3-7B-Think: https://llm.co/llms/olmo-3-7b-think
