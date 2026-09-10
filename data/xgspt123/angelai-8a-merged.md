# Xgspt123/AngelAI-8a-merged

## Resumen

AngelAI-8a-merged es un modelo de lenguaje publicado por el usuario Xgspt123 en HuggingFace, obtenido mediante fine-tuning sobre el modelo base unsloth/Qwen3.5-2B. Se distribuye bajo licencia Apache 2.0 y esta etiquetado con la familia arquitectonica qwen3_5, ademas del pipeline image-text-to-text y la libreria transformers. El repositorio ocupa 4,6 GB e incluye pesos en formato safetensors con un total real de 2.274.069.824 parametros (unos 2,27 mil millones).

A pesar del nombre "8a-merged", el dato verificado de parametros en safetensors es de 2,27B, por lo que no hay evidencia en la informacion disponible de que se trate de un modelo con 8.000 millones de parametros o de una arquitectura de mezcla de expertos (MoE). El modelo es muy reciente y practicamente desconocido: registra 0 descargas y 0 likes en el momento de la consulta, y su model card es minima, limitandose a indicar el autor, la licencia y que fue entrenado con Unsloth y TRL.

Su relevancia actual es limitada y de nicho: se trata de un experimento de fine-tuning de bajo coste sobre una base pequena, util como caso de estudio de flujos Unsloth + TRL mas que como modelo de produccion. La informacion publica no documenta contexto, datos de entrenamiento, idiomas mas alla del ingles ni resultados de evaluacion, por lo que cualquier uso serio requiere una validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de la familia Qwen3.5 (tag qwen3_5); detalles concretos no disponibles |
| Parametros totales | 2.274.069.824 (unos 2,27B, dato de safetensors) |
| Parametros activos | no disponible (sin evidencia de arquitectura MoE pese al sufijo "8a") |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos safetensors sin cuantizaciones publicadas) |
| Idiomas soportados | en (segun la model card y los tags) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La informacion disponible solo permite afirmar que el modelo deriva de unsloth/Qwen3.5-2B y que se etiqueta con la familia qwen3_5, lo que apunta a un transformer decoder-only. No se detallan el numero de capas, la dimension oculta, el numero de cabezas de atencion, el tipo de atencion ni si incorpora alguna variante de atencion lineal o decodificacion especulativa. El pipeline declarado es image-text-to-text, lo que sugiere capacidades multimodales, pero no hay documentacion que lo confirme ni que especifique como se gestionan las entradas de imagen.

Respecto al entrenamiento, la model card indica unicamente que "este modelo qwen3_5 fue entrenado 2x mas rapido con Unsloth y la libreria TRL de HuggingFace". No se especifica el numero de tokens, la composicion del dataset, si hubo fases de RLHF o DPO, ni el metodo de ajuste (LoRA, QLoRA, full fine-tuning). El sufijo "merged" en el nombre sugiere que los pesos resultantes de un adaptador se fusionaron en el modelo base, practica habitual en flujos Unsloth/TRL, pero esto no esta confirmado en la documentacion.

## Capacidades

- Generacion de texto conversacional, segun el tag "conversational" y el pipeline de generacion.
- Capacidad potencial de procesamiento imagen-texto, segun el pipeline declarado "image-text-to-text" (no confirmada por documentacion).
- Idiomas: la model card solo declara ingles (en).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de codigo, matematicas o vision: no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 2,27B de parametros el modelo puede ejecutarse en una GPU de consumo o incluso en CPU, lo que permite montar un chatbot de prueba sin coste de API, siempre que se valide la calidad de las respuestas.
- Fine-tuning de dominio especifico: al ser un modelo pequeno y con licencia Apache 2.0, sirve como punto de partida para ajustes posteriores con Unsloth/TRL sobre datos propios (soporte tecnico, documentacion interna, etc.).
- Experimentacion academica con tecnicas de fusion de pesos: el nombre "merged" y la trazabilidad del pipeline Unsloth lo hacen util para estudiar como afecta la fusion de adaptadores al comportamiento del modelo base.
- Clasificacion y extraccion de informacion ligera: tareas de etiquetado de texto, resumen corto o extraccion de campos en ingles, donde el coste computacional bajo es prioritario frente a la precision maxima.
- Despliegue en entornos con restricciones de hardware: su tamano permite ejecucion en GPUs de gama media o en nodos sin acelerador dedicado, util para demos offline o entornos aislados.
- Evaluacion comparativa de modelos pequenos: como baseline en estudios que comparen modelos de ~2B de parametros, siempre acompanado de la validacion correspondiente al no existir benchmarks publicados.
- Generacion de datos sinteticos a pequena escala: puede emplearse para producir borradores o aumentar datasets en ingles antes de un filtrado humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, y los resultados de busqueda web proporcionados no contienen informacion relacionada con este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 2,27B de parametros, sin KV cache ni overhead): aproximadamente 4,5 GB en FP16, 2,3 GB en INT8 y 1,2 GB en INT4. Estas cifras son estimaciones aritmeticas, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM puede ejecutar el modelo en FP16 con margen; una RTX 3060 de 12 GB, RTX 4070 o superiores son suficientes. En INT4 el modelo cabe en GPUs de 4 GB.
- GPU de centro de datos (A100, H100) no son necesarias para inferencia, aunque pueden usarse para fine-tuning o para servir muchas replicas en paralelo.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de GPUs modernas con 6 GB o mas.
- Opciones de despliegue: al estar en formato safetensors y usar transformers, es compatible con TGI (text-generation-inference), vLLM y transformers directamente. Para cuantizacion GGUF habria que convertir los pesos, ya que el repositorio no incluye versiones GGUF, por lo que llama.cpp u Ollama requeririan un paso previo de conversion.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que la comparativa se limita a caracteristicas verificables. Se compara con su modelo base y con alternativas de tamano similar de caracter general.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AngelAI-8a-merged | 2,27B | no disponible | apache-2.0 | HuggingFace, 0 descargas | Fine-tuning de Qwen3.5-2B, sin benchmarks |
| unsloth/Qwen3.5-2B (base) | ~2B | no disponible en la informacion facilitada | no disponible | HuggingFace | Modelo de partida del ajuste |
| Alternativas ~2B (Gemma, Llama, Qwen) | ~2B | no disponible | licencias variadas | HuggingFace | Comparacion generica; no se dispone de datos concretos de rendimiento en esta consulta |

No se puede establecer una comparacion de rendimiento fiable porque no hay resultados de evaluacion publicados para AngelAI-8a-merged.

## Limitaciones y advertencias

- El nombre del modelo ("8a-merged") puede inducir a error: los parametros reales en safetensors son 2,27B, no 8B, y no hay evidencia de arquitectura MoE.
- No hay benchmarks publicados, por lo que se desconoce su calidad real en generacion, razonamiento, codigo o matematicas; debe validarse antes de cualquier uso en produccion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de este tamano, y no mitigado por ninguna documentacion de alineamiento (RLHF/DPO) en la informacion disponible.
- Idiomas: solo se declara ingles; el rendimiento en castellano u otros idiomas es desconocido y probablemente pobre.
- Longitud de contexto no documentada, lo que impide planificar tareas que requieran ventanas largas.
- El pipeline declarado es image-text-to-text, pero no hay documentacion que confirme ni explique las capacidades multimodales; conviene verificarlo experimentalmente.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo base (Qwen3.5-2B) puede tener sus propias condiciones; conviene revisar la licencia del modelo base antes de explotarlo comercialmente.
- Modelo practicamente sin uso ni validacion por la comunidad (0 descargas, 0 likes), sin garantia de mantenimiento ni soporte.
- No se han publicado datos de sesgos; al derivar de un modelo base no documentado en esta consulta, no se puede evaluar su comportamiento en colectivos o dominios sensibles.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Xgspt123/AngelAI-8a-merged
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Repositorio de Unsloth (entrenamiento): https://github.com/unslothai/unsloth
- Libreria TRL de HuggingFace: https://github.com/huggingface/trl
- Los resultados de busqueda web proporcionados no contienen enlaces relevantes sobre este modelo (solo aparecen paginas de PTT y Zhihu sin relacion).
