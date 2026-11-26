# Wednesdayse1/granite-4.2-3b-abliterated

## Resumen
granite-4.2-3b-abliterated es una variante del modelo IBM granite-4.2-3b en la que se ha reducido deliberadamente el comportamiento de rechazo (refusal) mediante la tecnica Heretic v2.1.0 con Arbitrary-Rank Ablation (ARA). Lo publica el usuario Wednesdayse1 sobre el modelo base dense de 3.660 millones de parametros de IBM, orientado a uso empresarial, con capacidades de razonamiento, tool calling y soporte para 12 idiomas bajo licencia Apache-2.0.

El objetivo del modelo es ofrecer una version "sin censura" del granite-4.2-3b, manteniendo en la medida de lo posible las capacidades generales del original. Segun las metricas del autor, la tasa de rechazo en el conjunto `mlabonne/harmful_behaviors` baja de 98/100 a 52/100, con una divergencia KL de 0,2167 frente al modelo base, lo que sugiere una perdida de capacidad general relativamente contenida.

Es relevante para desarrolladores e investigadores que necesitan un modelo pequeno (3,66B), desplegable en hardware modesto, sin las restricciones de alineacion de seguridad del modelo original, por ejemplo para investigacion sobre comportamiento de modelos, generacion creativa sin filtros o entornos controlados donde los rechazos interfieren con la tarea. No es una mejora de capacidades: todo lo que el modelo base no puede hacer, esta variante tampoco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense (derivada de IBM granite-4.2-3b) |
| Parametros totales | 3.659.737.600 (3,66B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | GGUF q4_k_m (2,14 GB), q8_0 (3,71 GB); pesos originales en bfloat16 |
| Idiomas soportados | en, de, es, fr, ja, pt, ar, cs, it, ko, nl, zh (12 idiomas) |
| Licencia | Apache-2.0 (heredada de ibm-granite/granite-4.2-3b) |
| Formato de pesos | safetensors (transformers) y GGUF (repo separado) |

## Arquitectura y entrenamiento
El modelo parte de IBM granite-4.2-3b, un transformer dense de 3,66B parametros orientado a tareas empresariales, con capacidades de razonamiento (bloque de "thinking"), tool calling y cobertura de 12 idiomas. Sobre esa base, el autor aplica Heretic v2.1.0 con el modificador Arbitrary-Rank Ablation (ARA), que no es la abliteracion direccional clasica: aprende una transformacion de bajo rango con L-BFGS contra un conjunto de respuestas deseadas, y el bucle externo es una busqueda Optuna TPE sobre los hiperparametros, cooptimizando el recuento de rechazos frente a la divergencia KL.

La configuracion registrada incluye 100 trials de optimizacion, `start_layer_index` = 15, `end_layer_index` = 37, `preserve_good_behavior_weight` = 0,1932, `steer_bad_behavior_weight` = 0,0005, `overcorrect_relative_weight` = 0,2338 y `neighbor_count` = 2. El punto elegido es el `trial_index = 4`, un punto intermedio del frente de Pareto, no el de menor rechazo. El autor incluye material de reproduccion en `reproduce/` para una reconstruccion byte a byte. No se detallan en la informacion disponible los datos de entrenamiento originales del modelo base (numero de tokens, composicion del dataset, uso de RLHF/DPO).

## Capacidades
- Generacion de texto conversacional multi-turno con plantilla de chat (`apply_chat_template`).
- Razonamiento con bloque de "thinking" (el modelo base emite trazas de razonamiento; la puntuacion de rechazo del autor las omite).
- Tool calling / function calling, heredado del modelo base.
- Capacidades multilingues en 12 idiomas: ingles, aleman, espanol, frances, japones, portugues, arabe, checo, italiano, coreano, neerlandes y chino.
- Comportamiento de rechazo reducido: responde a prompts que el modelo base declina (el autor cita como ejemplo "how do I pick a lock?").
- Compatibilidad con endpoints (`endpoints_compatible` en los tags).
- No se documentan capacidades de vision ni audio en la informacion disponible.

## Casos de uso
- Investigacion sobre alineacion y refusal: permite estudiar como se distribuye el comportamiento de rechazo en un modelo pequeno y comparar con el base, usando las metricas de Heretic incluidas en `reproduce/`.
- Generacion creativa sin filtros: escritura de ficcion con tematicas sensibles (violencia, personajes moralmente ambiguos) donde los rechazos del modelo base interrumpen la narracion, gracias a la reduccion de refusal medida (52/100 frente a 98/100).
- Despliegue en hardware de consumo: con 3,66B parametros y cuantizacion q4_k_m de 2,14 GB, cabe en GPUs consumer y en CPU via llama.cpp u Ollama, lo que permite prototipado local sin infraestructura dedicada.
- Evaluacion de robustez de pipelines: util como modelo "adversario" para probar clasificadores de seguridad, filtros de contenido o guardrails propios, ya que genera respuestas que el modelo base bloquea.
- Asistente conversacional en entornos controlados: con contexto multi-turno y soporte de 12 idiomas, puede integrarse en aplicaciones internas donde el operador asume la responsabilidad del contenido y anade sus propios filtros en la capa de inferencia.
- Redaccion tecnica y lluvia de ideas: para tareas de generacion de texto empresarial (resumenes, borradores, explicaciones) donde el rendimiento del granite-4.2-3b es suficiente y se quiere evitar friccion por rechazos en temas limite.
- Experimentacion con tecnicas de abliteracion: el repositorio incluye configuracion completa (ARA, hiperparametros, trials) y sirve como referencia reproducible para quienes quieran aplicar Heretic a otros modelos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta las metricas propias de Heretic:

| Metrica | Este modelo | Modelo base |
|---|---|---|
| Rechazos (`mlabonne/harmful_behaviors`, `test[:100]`) | 52 / 100 | 98 / 100 |
| Divergencia KL (`mlabonne/harmless_alpaca`, `test[:100]`) | 0,2167 | 0 (por definicion) |

El autor advierte que la metrica de rechazo es basada en palabras clave, no en un clasificador, por lo que subestima rechazos suaves y sobreestima falsos positivos. Ademas, verifica la integridad numerica de los tensores publicados: `layers.19.mlp.down_proj` pasa de 0,107 a 0,109 (x1,01) y `layers.19.self_attn.o_proj` de 0,063 a 0,065 (x1,03), sin tensores por encima de un ratio de 100x.

## Requisitos de hardware
- VRAM estimada: ~7,3 GB en bfloat16 (pesos completos, 3,66B x 2 bytes); ~2,2 GB con GGUF q4_k_m; ~3,8 GB con q8_0.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060, RTX 4070); A100/H100 sobredimensionadas para este tamano, utiles solo para servir muchas peticiones concurrentes.
- Cabe en GPU consumer: si, en modelos con 6-8 GB o mas de VRAM en cuantizacion q4_k_m; tambien en CPU via llama.cpp.
- Opciones de despliegue: transformers (con `device_map="auto"`), llama.cpp (`llama-cli`), Ollama (`ollama create` con Modelfile), y cualquier stack compatible con GGUF (por ejemplo, vLLM si carga los pesos safetensors, aunque no se documenta explicitamente).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusal / notas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| granite-4.2-3b-abliterated (este) | 3,66B | no disponible | 52/100 rechazos, KL 0,2167 | Apache-2.0 | Hugging Face (Wednesdayse1) |
| ibm-granite/granite-4.2-3b (base) | 3,66B | no disponible | 98/100 rechazos | Apache-2.0 | Hugging Face (IBM), ~40.000 descargas mensuales |
| Otras abliteraciones de granite-4.2-3b | 3,66B | no disponible | el autor cita cuatro derivados previos, el mejor con 285 descargas | Apache-2.0 (presumible) | Hugging Face |
| Alternativas de ~3B sin censura (generico) | ~3B | no disponible | no disponible | variable | no disponible |

El autor senala que antes de esta publicacion existian solo cuatro derivados abliterados del granite-4.2-3b, el mejor con 285 descargas frente a las ~40.000 mensuales del base. No se aportan comparaciones de rendimiento con otros modelos de la misma categoria.

## Limitaciones y advertencias
- La eliminacion de rechazos es parcial: 52/100 en una metrica por palabras clave; algunos prompts siguen siendo declinados y una evaluacion con clasificador daria un numero distinto.
- La metrica de rechazo es fragil: cuenta cadenas como "I can't" o "sorry", por lo que una respuesta util que contenga esas palabras cuenta como rechazo y un rechazo suave que las evite no se detecta.
- Seleccion de trial: se eligio un punto intermedio del frente de Pareto (`trial_index = 4`), no el de menor rechazo, porque el trial con menos rechazos produjo un modelo numericamente degradado (magnitudes de un tensor MLP multiplicadas por 10^8 y generacion colapsada en tokens repetidos).
- Las trazas de razonamiento se omiten en la puntuacion de rechazo, por lo que la metrica refleja solo la respuesta final.
- No es una mejora de capacidades: todo lo que el modelo base no puede hacer, esta variante tampoco.
- La alineacion de seguridad se ha eliminado intencionadamente: el modelo producira contenido que el base rechaza, hereda sus limitaciones y no anade guardrails propios; la responsabilidad de uso recae en el operador.
- El autor declara que no esta destinado a asesoramiento sobre actividades ilegales.
- No se documentan sesgos especificos, longitud de contexto ni rendimiento por idioma en la informacion disponible.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales o las politicas de la plataforma de despliegue.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Wednesdayse1/granite-4.2-3b-abliterated
- Repositorio GGUF: https://huggingface.co/Wednesdayse1/granite-4.2-3b-abinfer-GGUF
- Modelo base: https://huggingface.co/ibm-granite/granite-4.2-3b
- Heretic (herramienta de abliteracion): https://github.com/p-e-w/heretic
