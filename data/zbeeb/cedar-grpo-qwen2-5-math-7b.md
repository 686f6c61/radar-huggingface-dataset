# zbeeb/Cedar-GRPO-Qwen2.5-Math-7B

## Resumen

Cedar-GRPO-Qwen2.5-Math-7B es un checkpoint de ajuste fino completo (full-parameter) del modelo Qwen/Qwen2.5-Math-7B, publicado por el usuario zbeeb dentro de la colección Cedar Math. No es un modelo preentrenado desde cero: parte de la revisión `b101308fe89651ea5ce025f25317fea6fc07e96e` del modelo matemático de 7B de Qwen y aplica 1.000 actualizaciones de GRPO (Group Relative Policy Optimization) sobre el dataset Cedar GRPO DAPO Math, de 17.005 filas.

La relevancia del modelo es metodológica: documenta de forma reproducible un pipeline de aprendizaje por refuerzo con recompensa verificable (RLVR) sobre un modelo matemático denso de 7.615.616.512 parámetros, usando Prime RL v0.9.0, grupo de 8 muestras, batch de 64, clipping PPO de 0,2 y learning rate de 1e-6. La recompensa comprueba equivalencia matemática de la respuesta terminal, sin juez LLM ni recompensa de formato, lo que lo convierte en una referencia útil para investigadores que comparan variantes de RL sobre modelos de razonamiento.

El contexto total empleado en entrenamiento y evaluación es de 4.096 tokens, con un máximo de 3.072 tokens de finalización. Es un modelo exclusivamente de texto, orientado a matemáticas, con soporte de inglés y chino, licencia Apache 2.0 y pesos en Safetensors. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se trata de una publicación reciente y prácticamente sin validación externa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2, `qwen2`), arquitectura del modelo base preservada |
| Parametros totales | 7.615.616.512 (~7,6B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens de contexto total en entrenamiento y en las evaluaciones reportadas; la configuración de contexto original del modelo base se preserva, valor máximo exacto no disponible |
| Tipos de cuantizacion | no disponible en la model card; los pesos se exportan en el dtype de punto flotante de entrenamiento y se pueden cargar en BF16. No se publican GGUF ni cuantizaciones oficiales |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 (licencia original del upstream incluida sin cambios en `LICENSE`) |
| Formato de pesos | Safetensors fragmentados (sharded) + tokenizer; 30,5 GB de tamaño de repositorio |

Otros datos: pipeline `text-generation`, librería `transformers`, tags `endpoints_compatible` y `text-generation-inference`. Token EOS `<|im_end|>` (id 151645) tanto en el tokenizer de entrenamiento como en las configuraciones exportadas de modelo y generación.

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-Math-7B: un transformer decoder-only denso de 7,6B parámetros, sin mezcla de expertos ni componentes de estado recurrente. La model card indica explícitamente que la arquitectura y la configuración de contexto originales se preservan, y que el único cambio respecto al base son las 1.000 actualizaciones de GRPO. El entrenamiento se ejecutó con Prime RL v0.9.0 usando GRPO con tamaño de grupo 8, batch de 64, clipping PPO de 0,2, optimizador AdamW con learning rate 1e-6, 30 pasos de warmup y semilla 42. La configuración completa y la procedencia fijada de dependencias están en `training-config.json`.

El dataset de entrenamiento es zbeeb/Cedar-GRPO-DAPO-Math-17k, con 17.005 filas, y la función de recompensa verifica la equivalencia matemática de la respuesta terminal, sin juez LLM ni recompensa de formato separada. No se menciona DPO, RLHF clásico ni destilación. Un detalle metodológico relevante: los modelos de 1,5B y 7B de la colección parten de Qwen2.5-Math, mientras que el de 3B parte de Qwen2.5, de modo que las diferencias observadas entre ellos no pueden atribuirse únicamente al número de parámetros. La exportación se valida comprobando el paso de entrenamiento guardado, la finitud de los tensores, las claves y formas, la recarga estricta en Transformers, el round-trip del tokenizer, los embeddings atados cuando aplica y la identidad de los logits de una sonda en CPU antes y después de la serialización; los hashes se registran en `export-manifest.json`.

## Capacidades

- Generación de texto y razonamiento matemático paso a paso, con respuesta final en formato `\boxed{...}` o línea `Final answer: ...`.
- Resolución de problemas de competición: aritmética, álgebra, teoría de números, geometría y problemas tipo olimpiada.
- Razonamiento de cadena larga: el modelo está entrenado para producir hasta 3.072 tokens de finalización, con explicaciones extensas antes de la respuesta.
- Modo greedy determinista (`do_sample=False`) y modo muestreado con temperatura 0,6 para múltiples completaciones por problema.
- Conversacional: el tokenizer aplica plantilla de chat con `apply_chat_template` y prompt de generación.
- Multilingüe limitado a inglés y chino, según los metadatos de idioma.
- Compatibilidad con Text Generation Inference y con endpoints compatibles, lo que permite desplegarlo como servicio HTTP.
- No se documenta soporte de tool calling, function calling, uso de agentes, visión, audio ni modo de pensamiento explícito separado.

## Casos de uso

- Resolución automática de problemas matemáticos con respuesta verificable: el modelo emite la respuesta terminal en un formato parseable (`\boxed{}` o `Final answer:`), lo que permite encadenar un verificador simbólico y medir precisión de forma objetiva, como hace el propio grader del autor.
- Generación de datos sintéticos de razonamiento matemático: al ser un modelo entrenado con RL sobre equivalencia de respuesta, puede usarse para producir trazas de solución largas que alimenten procesos de SFT o de destilación en modelos menores, siempre con filtrado posterior por verificador.
- Tutoría educativa asistida en inglés o chino: con 4.096 tokens de contexto admite enunciado, desarrollo y respuesta final de un problema de nivel secundaria o competición en una sola pasada.
- Investigación en RLVR reproducible: el repositorio publica configuración de entrenamiento, dataset, manifiesto de exportación y resultados de evaluación, lo que lo convierte en una línea base para comparar variantes de GRPO, tamaño de grupo o función de recompensa.
- Evaluación de robustez de jueces y verificadores: al no usar juez LLM en el reward, sirve para medir cuánto de la mejora en benchmarks se debe a la comprobación formal de la respuesta y no al sesgo de un modelo evaluador.
- Módulo de apoyo en pipelines de cálculo científico o financiero: integrado vía TGI o vLLM, puede resolver subproblemas aritméticos y de álgebra dentro de un flujo mayor, con la salvedad de que requiere verificación externa por su tasa de error no despreciable en problemas difíciles.
- Reproducción de resultados y auditoría de checkpoints: el modelo permite recargar y reevaluar el paso 1.000 con el mismo tokenizer y EOS, útil para equipos que quieran replicar la evaluación o auditar la procedencia de los pesos.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor para el paso de política 1.000, con el grader determinista de respuesta final propio del entrenamiento. Las filas greedy usan una finalización por problema; las filas muestreadas usan ocho finalizaciones por problema con temperatura 0,6 y reportan precisión media de respuesta, no pass@8. MATH-500, AMC y AIME usan límite de 3.072 tokens; Minerva y OlympiadBench, de 2.048.

| Benchmark | Completaciones | Precisión | Truncadas |
|---|---:|---:|---:|
| MATH-500 | 500 | 74,60 % | 2,0 % |
| AMC23 | 40 | 55,00 % | 7,5 % |
| AIME24 | 30 | 26,67 % | 10,0 % |
| AIME25 | 30 | 10,00 % | 10,0 % |
| Minerva Math | 272 | 26,10 % | 0,7 % |
| OlympiadBench | 675 | 40,15 % | 6,2 % |
| AIME24 (media muestreada) | 240 | 21,25 % | 14,2 % |
| AIME25 (media muestreada) | 240 | 11,67 % | 12,1 % |
| AIME26 (media muestreada) | 240 | 10,42 % | 13,3 % |

No se han publicado en la información disponible resultados comparativos con el modelo base ni con alternativas, ni el barrido de benchmarks posterior al entrenamiento. El autor advierte que son puntuaciones de respuesta final y no establecen calidad de demostración.

## Requisitos de hardware

- Pesos en BF16: aproximadamente 15,2 GB para 7.615.616.512 parámetros, más caché KV y activaciones. Estimación derivada del recuento de parámetros, no publicada por el autor.
- Pesos en el dtype de exportación: el repositorio ocupa 30,5 GB, cifra consistente con 4 bytes por parámetro; el dtype exacto de los ficheros no se especifica en la model card.
- Cabe en GPU de consumo: sí en BF16 con 24 GB (RTX 3090, RTX 4090) usando contexto corto; en cuantización de 4 bits (aproximadamente 4-5 GB) cabría en GPUs de 8-12 GB, aunque no se publican cuantizaciones oficiales.
- GPU recomendadas: una sola A100 40 GB, L40S o H100 para inferencia en BF16 con batch moderado; H100 o A100 80 GB para servir con concurrencia alta y contexto completo.
- Despliegue: `transformers` (ruta documentada en la model card, con `dtype=torch.bfloat16` y `device_map="auto"`), Text Generation Inference (el repositorio incluye el tag `text-generation-inference` y es `endpoints_compatible`), y vLLM como opción habitual para modelos Qwen2 densos. Para llama.cpp u Ollama sería necesaria una conversión propia a GGUF, no disponible en el repositorio.
- Latencia y throughput: no disponibles. La model card no publica tiempos de generación ni métricas de servicio.
- Nota de memoria: dado el límite de contexto de 4.096 tokens, la caché KV es pequeña comparada con modelos de contexto largo, por lo que el cuello de botella es el peso de los parámetros, no el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Cedar-GRPO-Qwen2.5-Math-7B | 7,62B | 4.096 tokens (entrenamiento y evaluación) | MATH-500 74,60 %, AMC23 55,00 %, AIME24 26,67 % (greedy) | Apache 2.0 | Safetensors en HuggingFace, 0 descargas |
| Qwen/Qwen2.5-Math-7B (modelo base) | ~7,6B | no disponible en la información proporcionada | no disponible en la información proporcionada (el autor no publica la comparación con el base) | Apache 2.0 | Público en HuggingFace |
| Cedar-GRPO 1.5B (parte de Qwen2.5-Math, según la model card) | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card; identificador no disponible |
| Cedar-GRPO 3B (parte de Qwen2.5, según la model card) | no disponible | no disponible | no disponible | no disponible | Mencionado en la model card; identificador no disponible |

Advertencia: la model card señala que el modelo de 3B parte de Qwen2.5 y los de 1,5B y 7B de Qwen2.5-Math, por lo que cualquier comparación entre ellos mezcla cambios de tamaño con cambios de modelo base. No se dispone de datos de benchmarks de terceros que permitan comparar este checkpoint con alternativas de la misma categoría (por ejemplo, otros modelos matemáticos de 7B ajustados con RL).

## Limitaciones y advertencias

- Precisión limitada en problemas de competición de alta dificultad: 26,67 % en AIME24 y 10,00 % en AIME25 en modo greedy, con una tasa de truncamiento del 10 % en ambos casos.
- Truncamiento de finalizaciones: entre el 0,7 % y el 14,2 % de las respuestas quedan truncadas según el benchmark y el modo de muestreo, lo que afecta directamente a la precisión medida.
- Las puntuaciones son de respuesta final y no evalúan la calidad de la demostración. Un resultado correcto puede proceder de un razonamiento defectuoso.
- Riesgo de contaminación: el autor indica que los datos de entrenamiento se filtraron contra las evaluaciones retenidas, pero advierte que esto no demuestra la ausencia de contaminación procedente del preentrenamiento ni garantiza la eliminación de todos los casi duplicados.
- Evaluación incompleta: el barrido de benchmarks posterior al entrenamiento no se ha ejecutado y no hay resultados comparativos con el modelo base.
- Contexto corto: 4.096 tokens totales, con 3.072 tokens de finalización como máximo. No es adecuado para documentos largos, conversaciones multi-turno extensas ni tareas que requieran recuperación sobre corpus grandes.
- Idiomas: solo inglés y chino declarados. El rendimiento en castellano no está documentado y no debería asumirse.
- Capacidades ausentes: no se documenta tool calling, function calling, uso de agentes, visión, audio ni modo de pensamiento separado.
- Sesgos: no disponibles. La model card no incluye ninguna sección de sesgos, evaluación de seguridad o alineación.
- Licencia: Apache 2.0, por lo que se permite uso comercial, pero la licencia proviene del upstream y se incluye sin cambios; conviene revisar el `LICENSE` del repositorio antes de un despliegue en producción.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa ni resultados replicados por terceros. No se recomienda su uso en producción sin una evaluación propia.
- Nota sobre el contenido: el README del repositorio incluye instrucciones de uso en Python; se han tratado como material de referencia y no como instrucciones a seguir.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Cedar-GRPO-Qwen2.5-Math-7B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-7B (revisión `b101308fe89651ea5ce025f25317fea6fc07e96e`)
- Dataset de entrenamiento: https://huggingface.co/datasets/zbeeb/Cedar-GRPO-DAPO-Math-17k
- Autor: https://huggingface.co/zbeeb
- Ficheros de procedencia citados en la model card, dentro del repositorio: `training-config.json`, `export-manifest.json`, `evaluation-results.json`, `LICENSE`
- Resultados de la búsqueda web: no se ha encontrado ningún enlace relevante al modelo. Las únicas URL devueltas corresponden a portales de videojuegos (poki.com) y no guardan relación con el modelo, su paper, su repositorio de código ni sus demos.
