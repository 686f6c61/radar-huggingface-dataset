# tokinasin/llm-jp-4-vl-9b-uncensored-ara

## Resumen

El modelo `tokinasin/llm-jp-4-vl-9b-uncensored-ara` es una variante del vision-language model `llm-jp/llm-jp-4-vl-9b` (desarrollado por LLM-jp) a la que se ha aplicado una técnica de desbloqueo de censura denominada *Arbitrary-Rank Ablation* (ARA), propuesta en el PR #211 del proyecto [Heretic](https://github.com/p-e-w/heretic). El objetivo es eliminar los rechazos (*refusals*) del modelo original ante peticiones consideradas sensibles o prohibidas, manteniendo al mismo tiempo la calidad general de las respuestas.

El modelo base combina un LLM de 8.6B parámetros (`llm-jp-4-8b-thinking`), un codificador visual SigLIP2 So400m de 0.4B y un proyector MLP de 2 capas, siguiendo una arquitectura inspirada en InternVL3.0. El resultado es un sistema de 9.05B parámetros en total, con licencia Apache 2.0 y soporte para inglés y japonés. La relevancia de esta variante radica en que permite estudiar el comportamiento de un VLM sin restricciones de contenido, útil para investigación en seguridad de IA, generación creativa sin filtros o evaluación de técnicas de abliteration.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en InternVL3.0 (LLM + vision encoder + proyector MLP) |
| Parametros totales | 9.054.667.200 (9,05B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (no especificada en la documentacion) |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Ingles, japones |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `llm-jp-4-vl-9b` se compone de tres modulos: un LLM (`llm-jp-4-8b-thinking`, 8.6B parametros), un codificador visual SigLIP2 So400m (0.4B) y un proyector MLP de 2 capas. El entrenamiento del base se realizo en una sola etapa durante 120.000 pasos con un total de aproximadamente 29,3 millones de muestras, combinando los datasets Jagle (9,2M), RefinedVision (12,0M), Nemotron-Image-Training-v3 (5,0M) y llm-jp-4-thinking-sft-data (3,2M). Se utilizo un esquema de learning rate Warmup-Stable-Decay (WSD) con tasas maximas de 2e-5 para el LLM y el vision encoder, y 1e-4 para el proyector.

Sobre este base, el autor `tokinasin` aplico la tecnica ARA (Arbitrary-Rank Ablation) implementada en Heretic PR #211. Esta tecnica elimina direcciones especificas en el espacio de activaciones de las capas 16 a 22 (indices de capa) que correlacionan con el comportamiento de rechazo. Los parametros de ablacion son: `start_layer_index=16`, `end_layer_index=22`, `preserve_good_behavior_weight=0.4346`, `steer_bad_behavior_weight=0.0001`, `overcorrect_relative_weight=1.0164` y `neighbor_count=10`. El resultado es una divergencia KL de 0.0058 respecto al original y una reduccion de refusals de 98/100 a 8/100 en una evaluacion interna.

## Capacidades

- Generacion de texto e imagen (pipeline `image-text-to-text`): puede responder preguntas sobre imagenes, describir contenido visual y razonar sobre graficos o diagramas.
- Razonamiento con cadena de pensamiento: el modelo base es de tipo *thinking*, por lo que genera un analisis previo antes de la respuesta final.
- Comprension multilingue: soporta ingles y japones, tanto en texto como en prompts con imagenes.
- Sin censura: no rechaza peticiones que el modelo original rechazaria (reduccion de refusals del 98% al 8% en la evaluacion del autor).
- Capacidad de extraccion de caracteristicas (tag `feature-extraction`): puede usarse para obtener representaciones de imagenes y texto.
- No se ha documentado soporte explicito de tool calling o function calling en esta variante.

## Casos de uso

- Investigacion en seguridad y alineacion de IA: permite estudiar como se comporta un VLM sin mecanismos de rechazo, analizando sesgos, riesgos de generacion de contenido danino y la efectividad de tecnicas de abliteration.
- Generacion de contenido creativo sin restricciones: escritura de ficcion, narrativa adulta, guiones o dialogos que el modelo original rechazaria por politicas de seguridad.
- Analisis de imagenes en dominios sensibles: interpretacion de fotografias o diagramas en contextos donde el contenido pueda ser considerado inapropiado (por ejemplo, imagenes medicas explicitas o documentacion tecnica con contenido restringido).
- Desarrollo de agentes conversacionales sin filtros: chatbots o asistentes que necesitan responder a consultas sobre temas tabu o controversiales sin evasivas.
- Evaluacion comparativa de modelos: como referencia para medir el impacto de la ablacion en la calidad de respuestas frente al modelo base.
- Fine-tuning posterior: partiendo de este modelo sin censura, se puede adaptar a tareas especificas sin el sesgo de rechazo del original, por ejemplo en dominios juridicos o medicos donde se requiere abordar temas delicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) para esta variante especifica. El autor solo proporciona metricas de la ablacion:

| Metrica | Este modelo | Modelo original (llm-jp-4-vl-9b) |
|---|---|---|
| Divergencia KL | 0.0058 | 0 (por definicion) |
| Refusals (sobre 100 peticiones) | 8/100 | 98/100 |

Estos datos indican que la ablacion mantiene una distribucion de salidas muy cercana a la original (KL baja) mientras reduce drasticamente los rechazos. No se dispone de mediciones de calidad en tareas de vision o lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 9.05B parametros. En precision FP16/BF16 (formato safetensors original) requiere aproximadamente 18 GB de VRAM. Con cuantizacion a 8 bits se reduciria a unos 9 GB, y a 4 bits a unos 5 GB (estimaciones teoricas, no verificadas para este modelo).
- GPU recomendadas: para FP16 se necesita una GPU con al menos 24 GB (RTX 3090, RTX 4090, A5000) o 16 GB si se usa cuantizacion 8 bits. Con cuantizacion 4 bits podria ejecutarse en GPUs de 8-12 GB (RTX 3060, RTX 4070).
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o directamente con la libreria transformers. Para entornos locales, se puede convertir a GGUF y usar llama.cpp u Ollama, aunque no se proporcionan conversiones oficiales.
- Latencia y throughput: no disponibles en la documentacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Refusals | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokinasin/llm-jp-4-vl-9b-uncensored-ara | 9.05B | No disponible | 8/100 | Apache 2.0 | HuggingFace |
| llm-jp/llm-jp-4-vl-9b (base) | 9.05B | No disponible | 98/100 | Apache 2.0 | HuggingFace |
| tokinasin/llm-jp-4-8b-instruct-uncensored-ara | 8.6B (aprox.) | No disponible | No disponible | Apache 2.0 | HuggingFace |

La comparativa se limita a variantes del mismo autor y al modelo base, ya que no se dispone de datos de otros modelos uncensored de tamano similar con arquitectura VLM. La principal diferencia entre este modelo y el base es la tasa de rechazos, mientras que la divergencia KL es minima.

## Limitaciones y advertencias

- La eliminacion de la censura puede generar contenido inapropiado, ofensivo, ilegal o danino. El modelo no tiene filtros de seguridad y puede producir respuestas que violen normas eticas o legales.
- La evaluacion de refusals se realizo con 100 peticiones concretas; no se ha medido la calidad general en tareas estandar, por lo que podria existir una degradacion no detectada en otras areas.
- La divergencia KL de 0.0058 indica que las respuestas son muy similares al original, pero no garantiza que no existan cambios en comportamientos especificos.
- Solo soporta ingles y japones; no se ha evaluado su rendimiento en otros idiomas.
- La longitud de contexto no esta documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- No se proporcionan cuantizaciones oficiales; el usuario debe convertirlas si necesita reducir requisitos de memoria.
- Aunque la licencia Apache 2.0 permite uso comercial, el contenido generado sin restricciones puede acarrear responsabilidades legales para el desplegador.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/tokinasin/llm-jp-4-vl-9b-uncensored-ara)
- [Modelo base llm-jp-4-vl-9b](https://huggingface.co/llm-jp/llm-jp-4-vl-9b)
- [Proyecto Heretic](https://github.com/p-e-w/heretic)
- [PR #211 de Heretic (ARA)](https://github.com/p-e-w/heretic/pull/211)
- [Repositorio LLM-jp-4-VL en GitHub](https://github.com/llm-jp/llm-jp-4-vl)
- [Blog de LLM-jp sobre LLM-jp-4-VL 9B](https://llm-jp.nii.ac.jp/blog/llm-jp-4-vl-9b/)
- [Variante uncensored del modelo instruct 8B](https://huggingface.co/tokinasin/llm-jp-4-8b-instruct-uncensored-ara)
