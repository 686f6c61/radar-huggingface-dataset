# zichuanxu/Qwen3.5-0.8B-CLC-sel

## Resumen

Qwen3.5-0.8B-CLC-sel es un checkpoint derivado de Qwen3.5-0.8B, el modelo ultracompacto de la familia Qwen3.5 de Alibaba Cloud, publicado por el investigador zichuanxu. No se trata de un fine-tuning convencional: es una edición de pesos de rango uno (rank-one) aplicada sobre dos capas concretas del transformer, diseñada para corregir el comportamiento de bucle verbatim que el modelo base presenta en modo thinking. El problema que aborda es medible: según la model card, el modelo base trunca el 93 % de sus respuestas de MATH-500 al alcanzar los 32.768 tokens porque entra en repeticiones literales en lugar de cerrar el razonamiento.

La intervención modifica únicamente la proyección down del MLP en las capas 15 y 19, alterando 64 neuronas por capa (131.072 pesos en total) mediante la regla `W' = W − 6 u (m ⊙ Wᵀu)ᵀ`. La dirección `u` se obtiene a partir de los propios estados internos del modelo (transición entre el estado previo a `</think>` y el estado dentro de los bucles), y las neuronas se seleccionan por su contribución creciente a esa dirección cuando el texto se repite. No se emplearon gradientes, etiquetas ni agentes externos; el material de partida fueron 512 respuestas del propio modelo a problemas de práctica.

El resultado es un checkpoint de 752.393.024 parámetros (texto únicamente, con los tensores de visión eliminados), licencia Apache 2.0, que sube MATH-500 del 7,4 % al 56,3 % y GSM8K del 13,8 % al 69,0 % en modo thinking con 32.768 tokens, reduciendo los truncamientos al 17,7 % y al 1,0 % respectivamente. Es relevante porque demuestra que una edición de pesos extremadamente localizada y sin entrenamiento puede resolver un fallo de razonamiento estructural en modelos pequeños, con un coste computacional mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM), edición rank-one sobre MLP down projection en capas 15 y 19 |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con max_tokens de 32.768) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16/safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-0.8B pertenece a la serie Qwen3.5 de Alibaba Cloud, descrita en fuentes externas como una familia multilingüe con entrenamiento de fusión temprana sobre billones de tokens multimodales y paridad cruzada con Qwen3 en razonamiento, código, agentes y comprensión visual. Este checkpoint concreto elimina los tensores de visión y conserva únicamente la parte de texto (`Qwen3_5ForCausalLM`), reutilizando la configuración de texto y la plantilla de chat de la release Astra.

La innovación técnica no reside en el entrenamiento sino en la edición de pesos. CLC-sel aplica una actualización de rango uno `W' = W − 6 u (m ⊙ Wᵀu)ᵀ` sobre la proyección down del MLP en las capas 15 y 19, donde `u` es la dirección que va del estado del modelo justo antes de su propio `</think>` al estado dentro de sus bucles, y `m` es una máscara que selecciona las 64 neuronas por capa cuya escritura a lo largo de `u` crece más cuando el texto se repite. La construcción se hizo a partir de 512 respuestas del propio modelo a problemas de práctica, sin gradientes, sin etiquetas y sin intervención de agentes. El repositorio incluye `edits.json` con el SHA-256 de los dos tensores bf16 editados, y los tensores pueden reconstruirse desde el modelo base con `python -m clc_sel.apply edits/clc_sel.json`.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con cierre controlado del bloque de pensamiento.
- Razonamiento matemático: resolución de problemas de MATH-500 y GSM8K con formato de respuesta en `\boxed{}`.
- Mitigación de bucles verbatim: el modelo termina sus respuestas en lugar de repetir texto hasta el truncamiento.
- Modo thinking activable mediante `chat_template_kwargs={"enable_thinking": True}`.
- Compatible con endpoints (tag `endpoints_compatible`) y con el pipeline de text-generation de transformers.
- Soporte de tool calling, function calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de visión: eliminadas en este checkpoint (solo texto).

## Casos de uso

- Evaluación de razonamiento matemático en modelos pequeños: el modelo sirve como referencia para medir cuánto de la precisión en MATH-500 y GSM8K se pierde por truncamiento frente a por capacidad real de razonamiento, gracias a sus tasas de truncamiento del 17,7 % y 1,0 %.
- Investigación en edición de pesos: punto de partida reproducible para estudiar intervenciones rank-one sobre MLP y comparar contra alternativas como la edición Astra, con diferencias pareadas documentadas (+6,7 puntos en MATH-500, IC 95 % 4,5 a 8,9).
- Despliegue en edge y dispositivos con recursos limitados: con 752 millones de parámetros y 1,5 GB de repo, es viable en hardware de gama baja o móvil, en la línea de la ficha de Qualcomm AI Hub para Qwen3.5-0.8B.
- Generación de cadenas de razonamiento acotadas: útil en pipelines que necesitan que el modelo emita un bloque `</think>` y una respuesta final dentro de un presupuesto de tokens fijo, evitando costes por generaciones que nunca terminan.
- Reproducción de experimentos académicos: el repositorio de GitHub y el dataset de generaciones (`zichuanxu/closing-the-loop-generations`) permiten replicar las evaluaciones con vLLM 0.30.0 y Transformers 5.17.
- Prototipado de asistentes matemáticos educativos: el modelo puede resolver problemas aritméticos y algebraicos con respuesta final delimitada, adecuado para entornos de práctica con verificación automática.

## Benchmarks y rendimiento

Modo thinking, 32.768 tokens. Tres semillas salvo donde se indique.

| Modelo | MATH-500 acc. | MATH-500 truncado | GSM8K acc. | GSM8K truncado |
|---|---:|---:|---:|---:|
| Qwen3.5-0.8B (seed 0) | 7,4 | 93,0 | 13,8¹ | no disponible |
| Astra edit (Takehi et al., 2026) | 49,7 | 32,1 | 67,4 | 6,9 |
| **Qwen3.5-0.8B-CLC-sel** | **56,3** | **17,7** | **69,0** | **1,0** |

¹ Dato reportado por Takehi et al. Diferencias pareadas frente a la edición Astra: MATH-500 +6,7 puntos (IC 95 % 4,5 a 8,9); GSM8K +1,6 (0,2 a 3,0).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 752 millones de parámetros en bf16 el peso ronda 1,5 GB, por lo que la huella es reducida, pero no se publican cifras oficiales de VRAM.
- GPU recomendadas: no disponible en la información proporcionada. El ejemplo de uso emplea vLLM, lo que implica GPUs compatibles con esa librería (A100, H100, L40S, RTX 4090, etc.), sin confirmación por parte del autor.
- Cabe en GPU de consumo: previsiblemente sí por tamaño (0,8B), pero no se confirma en la documentación.
- Opciones de despliegue: vLLM (versión evaluada 0.30.0) y Transformers (5.17). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MATH-500 (thinking) | GSM8K (thinking) | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3.5-0.8B-CLC-sel | 752 M | no disponible | 56,3 | 69,0 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | 7,4 | 13,8 | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B + Astra edit | 0,8 B | no disponible | 49,7 | 67,4 | no disponible | no disponible |

## Limitaciones y advertencias

- La edición se probó únicamente sobre este modelo, en modo thinking y en MATH-500 y GSM8K; no hay evidencia de generalización a otras tareas, idiomas o modos.
- La mejora proviene de respuestas que terminan en lugar de entrar en bucle: en problemas que el modelo base ya completaba, no razona mejor, según la propia model card.
- Sesgos conocidos: no disponibles en la información proporcionada; al derivar de Qwen3.5-0.8B, hereda los del modelo base, que no se documentan aquí.
- Riesgo de alucinación: no cuantificado; el modelo es de 0,8B y las precisiones absolutas en matemáticas siguen siendo moderadas (56,3 % en MATH-500).
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican; el checkpoint es solo texto y ha eliminado los tensores de visión.
- Restricciones de licencia: Apache 2.0, igual que el modelo base, sin restricciones comerciales adicionales documentadas.
- Caveat de producción: requiere muestreo específico (temperature 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, max_tokens 32.768) y modo thinking activado; desviarse de esta configuración puede alterar el comportamiento frente a los bucles.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zichuanxu/Qwen3.5-0.8B-CLC-sel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Código y registro del estudio: https://github.com/zichuanxu/closing-the-loop
- Dataset de generaciones: https://huggingface.co/datasets/zichuanxu/closing-the-loop-generations
- Edición Astra (Takehi et al., 2026): https://rikiyat.github.io/blog/weight-space-programming/
- Repositorio de la serie Qwen3.5: https://github.com/ABDtmx/Qwen3.5
- Ficha de Qwen3.5-0.8B en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
