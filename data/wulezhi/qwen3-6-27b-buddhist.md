# wulezhi/qwen3.6-27b-buddhist

## Resumen

Qwen3.6-27B-Buddhist es un ajuste fino de dominio sobre un supuesto modelo base Qwen3.6-27B, publicado por el usuario wulezhi en HuggingFace. El modelo está especializado en terminología y doctrina budista en chino, y se distribuye en dos formatos complementarios: un GGUF Q6_K de 22,08 GB con los pesos ya fusionados, y un adaptador LoRA también en GGUF de 0,16 GB (alpha = 16) que puede acoplarse a la base mediante `llama-server --lora`.

Según la model card, la arquitectura declarada es `qwen35` (familia Qwen3.5/3.6), con 64 capas, dimensión oculta de 5120, atención GQA con 24 cabezas de consulta y 4 de clave/valor, y una combinación híbrida de atención lineal más SSM (`ssm.state_size = 128`). La longitud de contexto nativa declarada es de 262.144 tokens (256K), y el modelo se exporta en forma densa, sin mezcla de expertos.

El interés de la ficha es sobre todo práctico: es un ejemplo de especialización vertical sobre corpus canónicos (35.841 entradas SFT derivadas del Diccionario Foguang y de la Gran Enciclopedia Budista China) con despliegue local vía llama.cpp u Ollama. El repositorio no declara licencia, no incluye benchmarks y no registra descargas ni valoraciones, por lo que cualquier uso en producción exige validación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen35` (familia Qwen3.5/3.6); 64 capas, dimensión oculta 5120; GQA con 24 cabezas de consulta y 4 de clave/valor; hibrida de atencion lineal + SSM (`ssm.state_size = 128`) |
| Parametros totales | 27B según la model card; 79.691.776 según los metadatos de safetensors del repositorio (discrepancia no aclarada por el autor) |
| Parametros activos | No aplica: el modelo es denso (exportación fusionada, nombre interno `Merged_Model`) |
| Longitud de contexto | 262.144 tokens (256K) nativos |
| Tipos de cuantizacion | Q6_K (única cuantización publicada); adaptador LoRA en GGUF con alpha = 16 |
| Idiomas soportados | No disponible (el corpus SFT está íntegramente en chino) |
| Licencia | No disponible |
| Formato de pesos | GGUF (compatible con llama.cpp y Ollama); el adaptador LoRA también en GGUF |

## Arquitectura y entrenamiento

La arquitectura declarada en los metadatos del GGUF es `qwen35`, con 64 capas y dimensión oculta de 5120. El bloque de atención combina dos regímenes: capas con atención agrupada (GQA) de 24 cabezas de consulta frente a 4 de clave/valor, y capas con atención lineal más un módulo de espacio de estados (`ssm.state_size = 128`). Esta hibridación es la que permite sostener una ventana nativa de 262.144 tokens manteniendo un coste de caché inferior al de un transformer de atención completa equivalente. El campo `nextn_predict_layers = 0` indica que esta exportación concreta no incluye la cabeza de predicción multi-token (MTP), por lo que no se puede aprovechar decodificación especulativa basada en MTP con estos pesos.

En cuanto al entrenamiento, la model card describe un SFT supervisado sobre 35.841 entradas en chino centradas en tres tareas: anotación de estructura textual (科判注解), preguntas y respuestas doctrinales (义理问答) y exégesis de sutras (经文释义). Las fuentes declaradas son el Diccionario Foguang (佛光大辞典) y la Gran Enciclopedia Budista China (中华佛教大百科全书), el mismo corpus que el autor atribuye a otro modelo, Qwen3.8-27B-Buddhist. No se documenta el uso de RLHF, DPO u otras fases de alineamiento posteriores al SFT, ni el número total de tokens vistos durante el entrenamiento. El repositorio ofrece el resultado en dos capas: el adaptador LoRA intermedio (alpha = 16) y la fusión final exportada a Q6_K.

## Capacidades

- Explicación de terminología budista china: definición y contextualización de términos, nombres propios y conceptos doctrinales (名相) a partir del material enciclopédico del corpus.
- Respuesta a preguntas de doctrina (义理问答): razonamiento sobre conceptos budistas en formato conversacional multi-turno.
- Exégesis y comentario de sutras (经文释义): interpretación de pasajes y glosas de textos canónicos en chino.
- Anotación estructural de textos (科判注解): segmentación y comentario jerárquico de tratados y comentarios.
- Procesamiento de contexto largo: la ventana de 262.144 tokens permite cargar sutras o tratados completos sin troceado previo.
- Composición modular de capacidades: el adaptador LoRA (0,16 GB) puede activarse o desactivarse en tiempo de ejecución sobre la base fusionada, mediante `llama-server --lora`.
- Despliegue local íntegro: los pesos GGUF permiten inferencia sin conexión en llama.cpp u Ollama, con soporte de `-ngl 99` para offload completo a GPU.

Limitaciones de capacidad declaradas o deducibles: no se documenta soporte de *tool calling* ni de *function calling*, ni capacidades de agente, ni modo de razonamiento explícito (*thinking*), ni visión, audio u otras modalidades. Tampoco se documenta comportamiento multilingüe fuera del chino.

## Casos de uso

- Diccionario budista interactivo: el modelo puede resolver consultas sobre términos y nombres propios del canon chino apoyándose en el Diccionario Foguang y en la Gran Enciclopedia Budista China, que constituyen el corpus SFT. Es adecuado porque su ajuste está centrado exactamente en definición y contextualización de conceptos, no en generación abierta.
- Exégesis de textos extensos: gracias a la ventana de 262.144 tokens, se puede cargar un sutra o un tratado completo junto con su aparato crítico y pedir comentarios por secciones sin recurrir a fragmentación con solapamiento. Esto reduce la pérdida de coherencia entre pasajes distantes.
- Asistente de estudio para investigadores: anotación estructural (科判) y generación de glosas sobre pasajes concretos, sirviendo como borrador revisable por un especialista humano.
- Sistemas RAG sobre corpus canónico: el GGUF Q6_K se integra en un servidor llama.cpp u Ollama expuesto por HTTP (`--host 0.0.0.0 --port 8080`) y se combina con un índice vectorial de sutras, usando el modelo para redactar la respuesta final a partir de los fragmentos recuperados.
- Digitalización y catalogación de fondos documentales: generación de resúmenes, títulos de sección y metadatos descriptivos para digitalizaciones de colecciones budistas en chino, con revisión humana posterior.
- Despliegue en entornos aislados: instituciones académicas, monasterios o archivos que no pueden enviar textos a APIs externas pueden ejecutar el modelo localmente. El peso de 22,08 GB es manejable en una estación de trabajo con dos GPU de 24 GB.
- Investigación sobre ajuste de dominio con LoRA: el repositorio sirve como caso de estudio reproducible para evaluar la diferencia entre el adaptador LoRA (0,16 GB, alpha = 16) y la fusión completa, y para experimentar con intercambio de adaptadores sobre la misma base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, C-Eval, HumanEval, GSM8K ni de evaluación específica de dominio budista, y el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, por lo que no existe validación externa publicada.

## Requisitos de hardware

- VRAM para los pesos: el archivo Q6_K ocupa 22,08 GB, de modo que el offload completo (`-ngl 99`) exige al menos 24 GB de VRAM dedicada, sin contar la caché de clave/valor ni el búfer de cómputo.
- Configuración recomendada por el autor: dos GPU con un total de 44 GB permiten cargar el archivo íntegro en VRAM y atender la ventana de 262.144 tokens.
- GPU de consumo: una RTX 3090 o RTX 4090 con 24 GB queda al límite para el offload completo del Q6_K; es previsible tener que reducir capas en GPU (`-ngl`) o el tamaño de contexto. No se publican otras cuantizaciones, así que usar una cuantización menor requiere convertirla el propio usuario.
- Caché de clave/valor: no se cuantifica en la información disponible. La arquitectura híbrida de atención lineal más SSM reduce el coste respecto a un transformer de atención completa, pero a 262.144 tokens el consumo adicional puede ser determinante y debe medirse en el runtime elegido.
- Opciones de despliegue: llama.cpp (`llama-server`) y Ollama mediante Modelfile (`FROM` + `PARAMETER num_ctx 262144`). Cualquier runtime compatible con GGUF (por ejemplo, LM Studio o koboldcpp) debería poder cargarlo. No aplican vLLM ni TGI, ya que no se publican pesos en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.6-27B-Buddhist (este) | 27B declarados; 79,69 M en metadatos | 262.144 | No disponible | GGUF Q6_K + LoRA GGUF | SFT sobre 35.841 entradas budistas en chino; sin benchmarks |
| Qwen3.8-27B-Buddhist | No disponible | No disponible | No disponible | No disponible | Citado en la model card como modelo que comparte el mismo corpus; no se aportan más especificaciones |
| Qwen3.6-27B (base) | No disponible | No disponible | No disponible | No disponible | Base declarada del ajuste; sin ajuste de dominio budista |

No se dispone de datos de rendimiento de ninguno de los tres modelos, por lo que la comparación se limita a procedencia y formato. No se han identificado en la información proporcionada otros modelos comparables de la misma categoría y dominio.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial está permitido. Cualquier despliegue en producción debería aclarar este punto con el autor antes de proceder.
- Dominio muy restringido: el ajuste cubre exclusivamente terminología y doctrina budista en chino. Fuera de ese ámbito es probable que el comportamiento degrade respecto a la base, y no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Corpus limitado: 35.841 entradas SFT es un volumen reducido; la cobertura de escuelas, tradiciones o terminología menos frecuente puede ser desigual.
- Riesgo de alucinación doctrinal: en un dominio normativo y filológicamente exigente, una definición inventada o una atribución errónea de fuente puede pasar desapercibida para un usuario no especialista. Se recomienda verificación contra las fuentes citadas.
- Idiomas no documentados: la model card no especifica idiomas soportados. El corpus de ajuste es monolingüe en chino, por lo que el rendimiento en castellano u otras lenguas no está garantizado.
- Discrepancia en el recuento de parámetros: los metadatos de safetensors del repositorio indican 79.691.776 parámetros, mientras que la model card y el tamaño del archivo (22,08 GB en Q6_K) corresponden a un modelo del orden de 27B. Esta incoherencia no está explicada y conviene tratarla como un riesgo de trazabilidad del repositorio.
- Falta de validación externa: 0 descargas y 0 valoraciones en el momento de la consulta, sin benchmarks ni evaluaciones de terceros.
- Dependencia de la base: el adaptador LoRA solo funciona si se aplica sobre pesos base del mismo origen (`Qwen3.6-27B`). El autor advierte explícitamente que con otra base el adaptador se invalida. Si esa base no es accesible públicamente, el LoRA es inutilizable de forma aislada.
- Sin decodificación especulativa MTP: el campo `nextn_predict_layers = 0` indica que esta exportación no incluye la cabeza de predicción multi-token, por lo que no se puede acelerar la inferencia por esa vía con estos pesos.
- Solo GGUF: al no publicarse safetensors ni scripts de conversión, el ajuste adicional o la reutilización de los pesos fuera de llama.cpp exige trabajo de conversión por parte del usuario.
- Coste de memoria a contexto completo: la ventana de 262.144 tokens no se puede aprovechar sin verificar el consumo real de caché en el hardware objetivo.
- Sensibilidad del contenido: se trata de material religioso; conviene revisar que las respuestas del modelo no presenten interpretaciones sesgadas hacia una escuela o tradición concreta del corpus de entrenamiento.
- Fechas del repositorio: creación y actualización registradas en septiembre de 2026, posteriores a la fecha habitual de consulta; conviene confirmar la vigencia del contenido antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wulezhi/qwen3.6-27b-buddhist
- No se han encontrado en la información proporcionada papers, blogs técnicos, repositorios de código ni demos asociados al modelo.
