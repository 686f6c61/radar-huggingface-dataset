# ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l4

## Resumen

Este modelo es un adaptador LoRA publicado por el usuario `ssurface` que modifica el comportamiento de `allenai/Olmo-3-7B-Think` para que razone en un nivel de compresión L4 de cadena de pensamiento (chain-of-thought). El nivel L4 se caracteriza por expresar el razonamiento como asignaciones encadenadas con punto y coma, con una longitud mediana de cadena de 41 caracteres dentro de la etiqueta `thinking`. Se trata de un artefacto de ablación diseñado para evaluar el impacto de un diseño de recompensa concreto (denominado `gr3chain`) en el entrenamiento con GRPO, y no es uno de los modelos principales de la familia.

El adaptador se apila sobre el modelo base Olmo-3-7B-Think, un transformer causal de 7 000 millones de parámetros entrenado por el Allen Institute for AI (Ai2) sobre el dataset Dolma 3. El resultado es un modelo especializado en razonamiento matemático con salidas muy compactas, orientado a investigación sobre eficiencia en inferencia y compresión de cadenas de razonamiento. La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, aunque su naturaleza de ablación limita su aplicabilidad en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (base: Olmo-3-7B-Think) + adaptador LoRA (r=16, alpha=32) |
| Parametros totales | 7B (modelo base) + adaptador LoRA (~0.2 GB en disco) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; el modelo base puede cuantizarse externamente) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con GRPO (Group Relative Policy Optimization) sobre el modelo SFT fusionado para el nivel L4, es decir, no se aplica directamente sobre el modelo base sin el paso intermedio de SFT. El conjunto de entrenamiento consiste en 6 976 ejemplos de GSM8K reexpresados por un modelo profesor al nivel L4, con una longitud mediana de cadena de 41 caracteres. La recompensa combina cuatro componentes: `correctness` (basada en coincidencia exacta con la solucion, ponderada por el numero de pasos), `format` (exige un bloque `thinking...response` seguido de `#### <answer>`), `chain` (un verificador que comprueba la aritmetica interna de la cadena) y `gr3` (reescalado multiplicativo de la recompensa positiva, con un minimo de 0.3). Se utilizo `trl.GRPOTrainer` con atencion `sdpa`, 8 generaciones por prompt, lote de 64, maximo de 256 tokens de completado, tasa de aprendizaje 1e-05 y coeficiente KL de 0.0. El entrenamiento se realizo en una NVIDIA A100 de 80 GB.

Una nota tecnica relevante: el autor advierte que el uso de kernels fusionados producia adaptadores con matrices `lora_B` todas cero, por lo que se opto por atencion `sdpa` estandar. Todos los adaptadores publicados fueron verificados para que `lora_B != 0`; 13 que fallaron esta comprobacion fueron retenidos.

## Capacidades

- Razonamiento matematico de varios pasos con salida comprimida en formato de asignaciones encadenadas (ejemplo: `K=18*2.5;D=8*4;T=K+D->T=77`).
- Generacion de texto en formato estructurado con bloques `thinking` y `response`, seguido de la respuesta final tras `####`.
- Compresion de cadena de pensamiento: reduce drasticamente la longitud del razonamiento intermedio (de 532 caracteres en L1 a 16 en L5, siendo L4 de 41).
- Capacidad de transferencia limitada a problemas aritmeticos sencillos (SVAMP 65.2%), aunque con degradacion notable en tareas mas complejas (BBH 21.6%, AIME 1.7%).
- No soporta tool calling, ni vision, ni audio, ni otros idiomas distintos del ingles.

## Casos de uso

- Investigacion sobre compresion de razonamiento: permite estudiar como afecta la longitud de la cadena de pensamiento a la precision en problemas matematicos, comparando niveles L1 a L5.
- Evaluacion de disenos de recompensa en RL: al ser una ablacion del componente `gr3`, sirve para reproducir y verificar el impacto de esta recompensa en el entrenamiento GRPO.
- Resolucion de problemas aritmeticos de varios pasos en entornos con restricciones de tokens: su salida compacta reduce el coste de inferencia y la latencia en aplicaciones donde el presupuesto de generacion es limitado.
- Benchmarking de eficiencia: se puede medir el ahorro en tokens generados frente a modelos de razonamiento estandar, manteniendo una precision aceptable en GSM8K.
- Educacion y demostracion de tecnicas de RLHF/GRPO: sirve como ejemplo didactico de como un adaptador LoRA puede modificar el estilo de razonamiento de un modelo base.
- Integracion en pipelines de razonamiento compacto para sistemas embebidos o APIs con coste por token, donde la reduccion de la cadena de pensamiento es critica.

## Benchmarks y rendimiento

Los resultados que se muestran a continuacion son los declarados por el autor en la model card. Se evaluo con decodificacion greedy, una sola pasada, sin ejemplos y sin self-consistency, sobre el conjunto de test de GSM8K (n=1317). Ademas, se reportan metricas fuera de dominio.

| Benchmark | n | Accuracy |
|---|---:|---:|
| GSM8K (test) | 1317 | 67.9% |
| AIME | 60 | 1.7% |
| BBH | 250 | 21.6% |
| SVAMP (transferencia) | 250 | 65.2% |

El autor indica que el margen de error aproximado es de ±2.7 puntos porcentuales para n=1317 y ±4.4 para n=500, por lo que diferencias de unos pocos puntos pueden deberse al ruido estadistico. No se han publicado comparaciones con otros adaptadores o modelos en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA es ligero (~0.2 GB), pero requiere cargar el modelo base de 7B parametros en memoria.
- Para inferencia en bf16, se necesitan aproximadamente 14-16 GB de VRAM (7B parametros x 2 bytes + overhead de activaciones y cache).
- Con cuantizacion a 4 bits (por ejemplo, mediante bitsandbytes o GGUF), el modelo base puede caber en GPUs consumer de 8-12 GB, como RTX 3060/4060 o RTX 4070.
- Para entrenamiento se utilizo una NVIDIA A100 de 80 GB; una GPU con al menos 24 GB (RTX 3090/4090 o A10) seria suficiente para fine-tuning con LoRA.
- Despliegue recomendado: `transformers` con `peft` para cargar el adaptador, o fusionar y exportar a GGUF para usar con `llama.cpp` u Ollama. Tambien es compatible con vLLM si se fusiona previamente.
- La latencia depende del hardware y del numero de tokens generados; al ser la cadena de razonamiento muy corta (41 caracteres de media), el tiempo de generacion es significativamente menor que el de un modelo de razonamiento estandar.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros adaptadores de compresion de cadena de pensamiento en la documentacion proporcionada. El autor menciona que existe un modelo principal para el mismo nivel (`ssurface/cot-dialect-olmo3-7b-think-grpo-l4`) y un adaptador SFT previo (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`), pero no se ofrecen metricas de estos. Tampoco se han encontrado resultados de otros modelos de la familia Olmo-3 en la busqueda web que permitan una comparacion directa.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre problemas de matematicas de GSM8K; no se recomienda para tareas generales de chat o generacion de texto.
- La precision cae rapidamente con la dificultad del problema; en benchmarks como AIME (1.7%) el rendimiento es muy bajo.
- Es un artefacto de ablacion, no un modelo de produccion. El autor advierte que puede ser peor que el modelo principal del mismo nivel.
- Requiere apilarse sobre el adaptador SFT especifico (`ssurface/cot-dialect-olmo3-7b-think-sft-l4`); cargarlo directamente sobre el modelo base no reproduce los resultados publicados.
- Riesgo de alucinacion en el razonamiento comprimido: la verificacion de la cadena (`chain`) mitiga errores aritmeticos, pero no garantiza correccion logica en problemas complejos.
- Solo soporta ingles; no hay datos sobre rendimiento en otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero al ser un adaptador de investigacion, no hay garantias de soporte ni mantenimiento.

## Enlaces

- Adaptador en Hugging Face: https://huggingface.co/ssurface/cot-dialect-olmo3-7b-think-grpo-gr3chain-l4
- Modelo base Olmo-3-7B-Think: https://huggingface.co/allenai/Olmo-3-7B-Think
- Version GGUF del modelo base (por unsloth): https://huggingface.co/unsloth/Olmo-3-7B-Think-GGUF
- Referencia citada por el autor: Frolov, Anatolii. "Chain-of-Thought Compression Dialects" (2026) - preprint no localizado en la busqueda web.
