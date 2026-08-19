# ssurface/cot-dialect-olmo3-7b-think-grpo-l1

## Resumen

`cot-dialect-olmo3-7b-think-grpo-l1` es un adaptador LoRA desarrollado por ssurface que se monta sobre el modelo base `allenai/Olmo-3-7B-Think` de AI2. Forma parte de una familia de "dialectos de compresión" de cadenas de razonamiento: este adaptador concreto corresponde al nivel L1, que produce cadenas de pensamiento verbosas y completas en lenguaje natural, sin comprimir. El objetivo es mejorar el rendimiento en razonamiento matemático mediante entrenamiento con GRPO (Group Relative Policy Optimization) sobre un modelo previamente ajustado con SFT.

El adaptador está entrenado exclusivamente con el conjunto de entrenamiento de GSM8K, re-expresado a nivel L1 por un modelo profesor, y alcanza una precisión del 88,9 % en el test de GSM8K con decodificación greedy, superando en 0,5 puntos porcentuales al modelo SFT base (88,5 %). Es un modelo de investigación que demuestra cómo el refuerzo puede mejorar la calidad de las cadenas de razonamiento verbales sin cambiar la arquitectura subyacente.

El repositorio es pequeño (0,2 GB) porque solo contiene los pesos del adaptador LoRA (r=16, alpha=32) en formato safetensors. Para usarlo correctamente, es necesario cargar primero el adaptador SFT del mismo nivel y fusionarlo, y después aplicar este adaptador GRPO sobre el modelo fusionado. La licencia es Apache 2.0 y el idioma soportado es únicamente inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (modelo base Olmo-3-7B-Think) + adaptador LoRA |
| Parametros totales | 7B (modelo base) + adaptador LoRA (r=16, alpha=32; tamano del repo 0.2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion del adaptador) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse con herramientas externas) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `allenai/Olmo-3-7B-Think`, un modelo de lenguaje de 7B parámetros desarrollado por el Allen Institute for AI (AI2), preentrenado en el corpus Dolma 3 y postentrenado con recetas abiertas. El modelo base es un transformer causal con atención estándar (usando `sdpa` en el entrenamiento del adaptador). El adaptador LoRA añade matrices de bajo rango (r=16, alpha=32) a las capas del modelo base.

El entrenamiento se realizó en dos fases: primero un ajuste fino supervisado (SFT) sobre 6913 ejemplos de GSM8K re-expresados a nivel L1 por un modelo profesor, con cadenas de razonamiento de longitud mediana de 532 caracteres. Posteriormente, se aplicó GRPO sobre el modelo SFT fusionado, con una función de recompensa que combina `correctness` (precisión de la respuesta final ponderada por el número de pasos de la solución dorada) y `format` (exigencia de un bloque `thinking...response` seguido de `#### <respuesta>`). Se usó loss tipo `dapo`, 8 generaciones por prompt, batch de 64, longitud máxima de completado de 256 tokens, learning rate 1e-05 y coeficiente KL beta 0.0. El entrenamiento se ejecutó en una única NVIDIA A100 80GB.

Un detalle técnico relevante: el autor verificó que las matrices `lora_B` no fueran cero tras el entrenamiento, descartando 13 adaptadores que resultaron matemáticamente inertes. Esto subraya la importancia de validar la integridad de los pesos LoRA, especialmente cuando se usan kernels fusionados.

## Capacidades

- Razonamiento matemático: resuelve problemas de aritmética y álgebra de nivel escolar, con cadenas de razonamiento verbales y completas en lenguaje natural (nivel L1).
- Generación de texto: produce explicaciones paso a paso en inglés, con formato estructurado de pensamiento y respuesta.
- Chain-of-thought: genera cadenas de razonamiento explícitas dentro de etiquetas `thinking` y respuestas finales en `response`.
- No soporta tool calling, function calling, ni capacidades de agente.
- No soporta visión ni audio.
- Multilingüe: no, solo inglés.
- No dispone de modo "thinking" adicional más allá del que ya genera el modelo base.

## Casos de uso

- Tutoría automatizada de matemáticas: el modelo puede generar soluciones detalladas paso a paso para problemas de nivel escolar, útil en plataformas educativas que necesitan explicaciones verbales completas para estudiantes.
- Generación de material didáctico: permite crear ejercicios resueltos con explicaciones extensas, adecuado para libros de texto o contenidos online.
- Evaluación de modelos de razonamiento: al ser un adaptador específico para cadenas verbosas, sirve como referencia para comparar el impacto de la compresión de razonamiento (niveles L1 a L5) en la precisión.
- Investigación en optimización con GRPO: el adaptador es un ejemplo práctico de cómo aplicar refuerzo sobre un modelo SFT para mejorar la precisión en tareas de razonamiento, útil para estudios académicos.
- Generación de datos de entrenamiento sintéticos: las cadenas de razonamiento verbosas generadas por este modelo pueden usarse como datos de alta calidad para entrenar modelos más pequeños o para distillation.
- Demostración de adaptadores LoRA apilados: el flujo de carga (SFT + GRPO) sirve como caso de uso para desarrolladores que necesiten combinar múltiples adaptadores sobre un mismo modelo base.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes:

| Benchmark | Conjunto | n | Accuracy |
|---|---|---|---|
| GSM8K (test) | openai/gsm8k | 1317 | 88,9 % |
| AIME (out-of-domain) | no especificado | 60 | 6,7 % |
| BBH (out-of-domain) | no especificado | 250 | 52,4 % |
| SVAMP (transfer) | no especificado | 300 | 90,3 % |

El autor reporta además que el modelo SFT base alcanzaba 88,5 % en GSM8K, por lo que el adaptador GRPO aporta una mejora de +0,5 puntos porcentuales. La evaluación se realizó con decodificación greedy, single-turn, sin ejemplos y sin self-consistency. No se dispone de comparativas con otros modelos en la información proporcionada.

## Requisitos de hardware

- El adaptador LoRA es ligero (0,2 GB), pero el modelo base Olmo-3-7B-Think requiere VRAM para 7B parámetros. En bfloat16, el modelo base ocupa aproximadamente 14 GB de VRAM.
- Con cuantización a 8 bits, puede caber en GPUs con 8-10 GB de VRAM (por ejemplo, RTX 3080 o RTX 4070). Con cuantización a 4 bits, podría ejecutarse en GPUs con 6 GB de VRAM (como RTX 3060).
- Para entrenamiento (como se hizo), se usó una NVIDIA A100 80GB. Para inferencia, una RTX 4090 (24 GB) es suficiente sin cuantización.
- Opciones de despliegue: el adaptador se carga mediante la librería `peft` sobre `transformers`. No se menciona soporte directo en vLLM, llama.cpp u Ollama, pero el modelo base Olmo-3-7B-Think es compatible con estas herramientas si se fusiona el adaptador previamente.
- Latencia y throughput estimados: no disponibles en la documentación.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros adaptadores o modelos de razonamiento matemático en la información proporcionada. El autor menciona una familia de "dialectos de compresión" (L1 a L5) pero no publica resultados de otros niveles en esta model card. Como referencia, el modelo base `allenai/Olmo-3-7B-Think` sin adaptador tiene un rendimiento desconocido en GSM8K en esta documentación. Por tanto, la comparativa directa no está disponible.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de razonamiento matemático de tipo word problem; su rendimiento en otras tareas de lenguaje general es limitado.
- La precisión cae significativamente con la dificultad del problema: en AIME (problemas de competición) solo alcanza 6,7 %, frente al 88,9 % en GSM8K.
- Solo soporta inglés; no es útil para otros idiomas.
- Para reproducir los resultados es imprescindible cargar primero el adaptador SFT del mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-sft-l1`) y fusionarlo, antes de aplicar este adaptador GRPO. Cargarlo directamente sobre el modelo base no funcionará.
- El entrenamiento usó una única semilla, por lo que diferencias de un par de puntos porcentuales pueden estar dentro del ruido estadístico (intervalo de confianza del 95 % de ~2,7 pp en n=1317).
- Riesgo de alucinación en problemas fuera de la distribución de entrenamiento o con enunciados ambiguos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Olmo-3-7B-Think también es Apache 2.0, sin restricciones conocidas.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-l1
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Página del modelo en Crafiq: https://crafiq.ai/models/language/ai2-olmo-3-7b-think
- Ficha en LM Studio: https://lmstudio.ai/models/allenai/olmo-3-7b-think
- Página en LLMIndex: https://llmindex.net/models/olmo-3-7b-think
- Adaptador SFT requerido (mencionado en la documentación): https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-sft-l1
