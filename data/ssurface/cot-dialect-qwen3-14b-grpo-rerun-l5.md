# ssurface/cot-dialect-qwen3-14b-grpo-rerun-l5

## Resumen

`cot-dialect-qwen3-14b-grpo-rerun-l5` es un adaptador LoRA (PEFT) desarrollado por ssurface que entrena a `Qwen/Qwen3-14B` para razonar con cadenas de pensamiento (CoT) extremadamente comprimidas, denominadas "nivel L5". En este nivel, el razonamiento interno se colapsa en una única expresión algebraica de unos 16 caracteres de mediana (frente a los 532 caracteres del nivel L1), lo que supone una compresión de 33x en longitud de cadena.

Se trata de una **ablación** dentro del estudio "Chain-of-Thought Compression Dialects" de Anatolii Frolov: el mismo nivel L5 entrenado con un diseño de recompensa distinto al modelo principal, publicado para permitir reproducir la comparación de recompensas del paper. El adaptador se entrena con GRPO sobre el dataset GSM8K (train re-expresado a nivel L5) y alcanza un 81,5% de exactitud en el test de GSM8K con decodificación greedy.

La relevancia de este modelo reside en explorar los límites de la compresión del razonamiento: si un modelo puede resolver problemas matemáticos con cadenas de pensamiento mínimas, se abren vías para reducir drásticamente el coste de inferencia en tareas de razonamiento. No es un modelo para producción directa, sino una pieza de investigación para estudiar el diseño de recompensas en RL.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-14B (transformer denso, attention sdpa) |
| Parametros totales | Adaptador: r=16, alpha=32 (repo 0.1 GB); modelo base: 14B |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128K tokens (heredada del modelo base Qwen3-14B) |
| Tipos de cuantizacion | No especificado (el adaptador se carga en bfloat16; el base admite cuantizaciones 4-bit/8-bit) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se apila sobre el modelo base `Qwen/Qwen3-14B`, un transformer denso de 14B parámetros con atención de ventana completa y soporte nativo de 128K tokens de contexto. El entrenamiento se realiza con `trl.GRPOTrainer` sobre el modelo SFT fusionado a nivel L5 (`merged_qwen14b/l5`), no directamente sobre el base. Se usa GRPO con recompensa compuesta por dos componentes: `correctness` (que pondera según el número de pasos de la solución dorada, dando más valor a problemas difíciles) y `format` (exige una estructura fija `thinking... response` seguida de `#### <answer>`). El tipo de pérdida es `dapo`, con 8 generaciones por prompt, batch efectivo de 32, máximo de 256 tokens de completación, learning rate 1e-05 y coeficiente KL (beta) 0.0. El dataset de entrenamiento consiste en 6993 ejemplos de GSM8K train re-expresados a nivel L5 por un modelo profesor, con cadenas de mediana de 16 caracteres. El entrenamiento se realizó en una única GPU NVIDIA A100 80GB.

Un detalle técnico relevante: el autor verificó que los adaptadores entrenados con kernels fusionados producían matrices `lora_B` todas a cero (matemáticamente inertes), por lo que todos los adaptadores publicados en esta colección fueron validados con `lora_B != 0`; 13 que fallaron esa comprobación fueron retirados.

## Capacidades

- Razonamiento matemático con cadenas de pensamiento comprimidas a nivel extremo (una sola expresión, p. ej. `18/3*2=12`).
- Generación de texto en ingles siguiendo el formato de prompt especifico: `Solve this using Level 5 (Extreme). Problem: {problema}`.
- Producción de respuestas estructuradas con bloque `thinking` y bloque `response` seguido de `#### <answer>`.
- No se menciona soporte de tool calling, function calling, agentes ni capacidades multimodales.
- Capacidad multilingue limitada al ingles (unico idioma declarado).
- Sin modo de pensamiento extendido; al contrario, el modelo esta disenado para minimizar el razonamiento explicito.

## Casos de uso

- Investigacion en compresion de cadenas de pensamiento: permite estudiar como afecta la compresion extrema del CoT a la precision en razonamiento matematico, comparando con niveles L1-L4 de la misma familia.
- Evaluacion de disenos de recompensa en RL: al ser una ablacion con recompensa distinta al modelo principal, sirve para reproducir la comparacion de reward design del paper.
- Prototipos de razonamiento de bajo coste: en escenarios donde el coste por token de la cadena de pensamiento es critico (p. ej. procesamiento por lotes de problemas aritmeticos), este adaptador ofrece una via para reducir el numero de tokens generados.
- Benchmarking de eficiencia: se puede usar para medir el trade-off entre longitud de razonamiento y exactitud en GSM8K u otros datasets de matematicas.
- Educacion en tecnicas PEFT: como ejemplo de entrenamiento GRPO con LoRA sobre un modelo grande, con configuracion reproducible y verificacion de integridad de los adaptadores.
- Analisis de robustez: al estar entrenado solo en GSM8K, permite estudiar la generalizacion a otros dominios y la degradacion con la dificultad de los problemas.

## Benchmarks y rendimiento

Segun los datos declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Resultado |
|---|---|---|---|
| Razonamiento matematico | GSM8K (test, n=1317) | Accuracy (exact match) | 81,5% |

Condiciones de evaluacion: decodificacion greedy, una sola pasada, sin ejemplos (exemplars) y sin self-consistency. No se proporcionan comparaciones directas con el modelo base Qwen3-14B ni con el modelo principal de la familia (`ssurface/cot-dialect-qwen3-14b-grpo-l5`). El autor indica que diferencias de un par de puntos porcentuales estan dentro del ruido estadistico (intervalo de confianza del 95% de ~2,7 puntos porcentuales para n=1317).

## Requisitos de hardware

- El adaptador en si ocupa 0.1 GB, pero requiere cargar el modelo base completo de 14B.
- VRAM estimada para inferencia: ~28 GB en bfloat16 sin cuantizar; ~8-9 GB con cuantizacion 4-bit (según datos publicos del modelo base Qwen3-14B).
- GPU recomendadas: NVIDIA A100 80GB (usada en entrenamiento); para inferencia, una RTX 4090 (24 GB) con cuantizacion 4-bit es suficiente. Tarjetas con 12 GB (p. ej. RTX 3060) pueden ejecutarlo en 4-bit con margen limitado.
- Despliegue: compatible con `transformers` + `peft` (carga secuencial del adaptador SFT y luego este adaptador GRPO), y puede integrarse en vLLM u otros servidores de inferencia que soporten PEFT.
- Latencia y throughput: no disponibles; dependen de la cuantizacion y del hardware. El uso de cadenas de pensamiento de 16 caracteres reduce drasticamente el numero de tokens generados en comparacion con CoT convencional.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos directamente comparables dentro de la misma familia de compresion de CoT. Como referencia:

| Modelo | Parametros | Contexto | GSM8K (test) | Licencia |
|---|---|---|---|---|
| **Este adaptador** (sobre Qwen3-14B) | 14B + LoRA | 128K | 81,5% | Apache 2.0 |
| Qwen/Qwen3-14B (base) | 14B | 128K | No disponible en la informacion proporcionada | Apache 2.0 |
| ssurface/cot-dialect-qwen3-14b-grpo-l5 (modelo principal del nivel L5) | 14B + LoRA | 128K | No disponible | Apache 2.0 |

El autor advierte que este adaptador es una ablacion y puede ser peor que el modelo principal del mismo nivel. No se proporcionan comparaciones con otros modelos de razonamiento comprimido fuera de esta familia.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en problemas de matematicas de tipo word problem (GSM8K); no generaliza a otros dominios.
- La precision cae con la dificultad del problema, de forma mas acusada en los niveles comprimidos (L5 es el mas extremo).
- Es una ablacion: fue entrenado para responder una pregunta concreta sobre diseno de recompensas y puede ser inferior al modelo principal del mismo nivel.
- Requiere cargar primero el adaptador SFT (`ssurface/cot-dialect-qwen3-14b-sft-l5`) y fusionarlo con el base antes de aplicar este adaptador GRPO; cargarlo directamente sobre `Qwen/Qwen3-14B` no reproduce el resultado declarado.
- Entrenado con una sola semilla; diferencias de un par de puntos porcentuales pueden deberse al ruido.
- Solo soporta ingles; no hay datos sobre comportamiento en otros idiomas.
- Riesgo de alucinacion en problemas fuera del dominio de entrenamiento, especialmente al usar cadenas de pensamiento tan comprimidas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-14B tambien es Apache 2.0, sin restricciones adicionales conocidas.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssurface/cot-dialect-qwen3-14b-grpo-rerun-l5
- Modelo base Qwen/Qwen3-14B: https://huggingface.co/Qwen/Qwen3-14B
- Coleccion Qwen3: https://huggingface.co/collections/Qwen/qwen3
- Technical Report de Qwen3: https://arxiv.org/html/2505.09388v1
- Especificaciones y requisitos de VRAM de Qwen3-14B: https://convly.ai/model/qwen3-14b/ y https://apxml.com/models/qwen3-14b
