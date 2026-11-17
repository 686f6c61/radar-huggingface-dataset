# zichuanxu/Qwen3.5-0.8B-CLC-sel

## Resumen

Qwen3.5-0.8B-CLC-sel es un checkpoint derivado de Qwen/Qwen3.5-0.8B (revision `2fc06364`) publicado por el usuario zichuanxu en Hugging Face. No se trata de un fine-tuning convencional, sino de una edicion de pesos de rango uno aplicada sobre dos tensores concretos del modelo base: la proyeccion down del MLP en las capas 15 y 19. El objetivo es corregir un fallo especifico del modelo original: en modo thinking, el modelo base entra en bucles de repeticion literal y trunca el 93% de sus respuestas de MATH-500 al alcanzar los 32.768 tokens.

La edicion, denominada CLC-sel (presumiblemente "Closing the Loop - selected"), modifica 64 neuronas por capa, es decir, 131.072 pesos en total, mediante la regla `W' = W − 6 u (m ⊙ Wᵀu)ᵀ`. La direccion `u` se obtiene a partir del estado del modelo justo antes de emitir su propio `</think>` frente al estado dentro de sus bucles, y las neuronas seleccionadas son aquellas cuya escritura a lo largo de `u` aumenta mas cuando el texto se repite. El resultado es un modelo de 752 millones de parametros con licencia Apache 2.0 que mejora de forma sustancial la tasa de finalizacion en tareas de razonamiento matematico.

El checkpoint es relevante porque demuestra que una intervencion quirurgica y barata (sin gradientes, sin etiquetas, sin agente) puede superar a una edicion de pesos escrita por un agente LLM (GPT-6 Astra) sobre el mismo fallo, con ganancias pareadas de +6,7 puntos en MATH-500 y +1,6 en GSM8K. Es un caso de estudio util para quienes investigan edicion de modelos, bucles de razonamiento y control de generacion en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3_5ForCausalLM), edicion de pesos en MLP down projection de capas 15 y 19 |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (evaluado con max_tokens=32768 en modo thinking) |
| Tipos de cuantizacion | no disponible (checkpoint en bf16; repo de 1,5 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B base, un transformer decoder-only de 752 millones de parametros. La intervencion CLC-sel no reentrena el modelo: aplica una edicion de rango uno sobre la proyeccion down del MLP en las capas 15 y 19. La formula `W' = W − 6 u (m ⊙ Wᵀu)ᵀ` actualiza 64 neuronas por capa (131.072 pesos en total) a partir de una direccion `u` estimada con 512 respuestas propias del modelo a problemas de practica. No se emplearon gradientes, etiquetas ni agentes externos.

La innovacion tecnica consiste en identificar la direccion que separa el estado del modelo justo antes de cerrar su razonamiento (`</think>`) del estado en el que se encuentra dentro de sus bucles de repeticion, y en seleccionar las neuronas cuya contribucion a lo largo de esa direccion se incrementa mas cuando el texto se repite. El checkpoint es solo texto: se han eliminado los tensores de vision y se conservan la configuracion de texto y la plantilla de chat de la release Astra. El repo incluye `edits.json` con los SHA-256 de los dos tensores bf16 editados, y los tensores pueden reconstruirse desde el modelo base con `python -m clc_sel.apply edits/clc_sel.json`.

## Capacidades

- Generacion de texto en modo thinking y modo no thinking (la evaluacion se realizo en modo thinking).
- Razonamiento matematico: resuelve problemas de MATH-500 y GSM8K con una tasa de finalizacion muy superior al modelo base.
- Reduccion de bucles de repeticion: el modelo deja de truncar por repeticion literal en la mayoria de los casos (17,7% de truncamiento en MATH-500 frente al 93,0% del base).
- Conversacion multi-turno mediante plantilla de chat compatible con `llm.chat` de vLLM.
- Salida estructurada con respuestas finales en `\boxed{}` cuando se solicita.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- Capacidades de vision: eliminadas en este checkpoint (solo texto).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-step: no disponible en la informacion proporcionada.
- Idiomas: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento matematico en modelos pequenos: usar el checkpoint como referencia para medir cuanto mejora la tasa de finalizacion en MATH-500 y GSM8K frente al base, con la misma configuracion de muestreo (temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max_tokens 32768).
- Investigacion en edicion de pesos: reproducir la edicion CLC-sel desde el modelo base con el script del repositorio y comparar contra la edicion Astra para validar la metodologia en otros modelos.
- Control de bucles de generacion: desplegar el modelo en pipelines donde el truncamiento por repeticion es un coste operativo, aprovechando la reduccion del 93% al 17,7% en MATH-500.
- Generacion de soluciones paso a paso en entornos educativos: el modelo produce razonamientos completos con respuesta final en `\boxed{}`, adecuado para tutoria automatizada de problemas aritmeticos.
- Servicio de inferencia ligero: con 752 millones de parametros y pesos bf16, puede servirse con vLLM en una unica GPU consumer para tareas de razonamiento acotado.
- Baseline en estudios de comparacion de metodos de edicion: sirve como punto de referencia reproducible (semillas multiples, intervalos de confianza publicados) en articulos sobre weight editing.
- Prototipado de asistentes conversacionales de bajo coste: la plantilla de chat y el soporte de `llm.chat` permiten integrarlo rapidamente en demos multi-turno.

## Benchmarks y rendimiento

Resultados publicados en la model card, en modo thinking con 32.768 tokens (tres semillas salvo indicacion):

| Modelo | MATH-500 acc. | MATH-500 truncado | GSM8K acc. | GSM8K truncado |
|---|---:|---:|---:|---:|
| Qwen3.5-0.8B (seed 0) | 7,4 | 93,0 | 13,8¹ | no disponible |
| Astra edit | 49,7 | 32,1 | 67,4 | 6,9 |
| Qwen3.5-0.8B-CLC-sel (este modelo) | 56,3 | 17,7 | 69,0 | 1,0 |

¹ Reportado por Takehi et al. Diferencias pareadas frente a la edicion Astra: MATH-500 +6,7 puntos (IC 95% 4,5 a 8,9); GSM8K +1,6 (0,2 a 3,0).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en bf16 (tamano del repo); no se dispone de cifras para cuantizaciones inferiores.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, cualquier GPU consumer con al menos 2-4 GB de VRAM libre deberia poder alojar los pesos en bf16.
- Cabe en GPU consumer: si, dado el tamano de 752 millones de parametros; modelos concretos no confirmados en la informacion disponible.
- Opciones de despliegue: vLLM (probado con vLLM 0.30.0 y Transformers 5.17); otras opciones (llama.cpp, Ollama, TGI) no confirmadas.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 acc. | GSM8K acc. | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Qwen3.5-0.8B (base) | 752 M | no disponible | 7,4 | 13,8 | Apache 2.0 | Hugging Face |
| Astra edit (GPT-6 Astra) | 752 M | no disponible | 49,7 | 67,4 | no disponible | Referencia en Takehi et al., 2026 |
| Qwen3.5-0.8B-CLC-sel | 752 M | no disponible | 56,3 | 69,0 | Apache 2.0 | Hugging Face |

No se dispone de comparacion con otros modelos de tamano similar fuera del linaje Qwen3.5-0.8B en la informacion proporcionada.

## Limitaciones y advertencias

- La edicion se probo unicamente en este modelo, en modo thinking y sobre MATH-500 y GSM8K; no hay evidencia de generalizacion a otras tareas o modos.
- La mejora procede de respuestas que terminan en lugar de entrar en bucle; en problemas que el modelo base ya finaliza, no razona mejor.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada; al ser un modelo de 0,8 B, la fiabilidad factual es limitada.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; la evaluacion se realizo presumiblemente en ingles.
- Contexto maximo: no disponible; las evaluaciones usan 32.768 tokens como limite de generacion, no como ventana de contexto confirmada.
- Capacidades de vision eliminadas: el checkpoint es solo texto, por lo que no debe esperarse comportamiento multimodal.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar el `LICENSE` incluido y la licencia del modelo base.
- El checkpoint depende de la revision concreta `2fc06364` del modelo base; reconstruir la edicion con otra revision puede producir resultados distintos.
- No se han publicado datos de tool calling, agentes ni rendimiento multilingue; no asumir estas capacidades en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zichuanxu/Qwen3.5-0.8B-CLC-sel
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post "Closing the loop": https://zichuanxu.github.io/blog/closing-the-loop/
- Codigo y registro del estudio: https://github.com/zichuanxu/closing-the-loop
- Generaciones completas: https://huggingface.co/datasets/zichuanxu/closing-the-loop-generations
- Referencia de la edicion Astra (Takehi et al., 2026): https://rikiyat.github.io/blog/weight-space-programming/
