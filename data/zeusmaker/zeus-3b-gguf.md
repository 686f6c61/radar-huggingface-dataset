# ZEUSmaker/zeus-3b-gguf

## Resumen

zeus-3b-gguf es un modelo de lenguaje conversacional de aproximadamente 3.212 millones de parametros (3,2 B) publicado por el usuario ZEUSmaker en HuggingFace. Se distribuye exclusivamente en formato GGUF, cuantizado, y esta pensado para su ejecucion local mediante llama.cpp y Ollama. Segun la model card, el modelo fue ajustado (fine-tuning) y convertido a GGUF con la libreria Unsloth, y el fichero de pesos incluido se denomina `Llama-3.2-3B-Instruct.Q4_K_M.gguf`, lo que sugiere que parte de un modelo base de la familia Llama 3.2 de 3 B en su variante Instruct, aunque el autor no lo declara de forma explicita.

El repositorio tiene un tamano aproximado de 2,0 GB y solo incluye un fichero de pesos en cuantizacion Q4_K_M, ademas de un Modelfile para Ollama. No se especifican en la informacion disponible ni la licencia, ni los idiomas soportados, ni la longitud de contexto, ni el pipeline declarado. El modelo se publico y se actualizo el 19 de septiembre de 2026 y, en el momento de redactar esta ficha, acumula 0 descargas y 0 "likes", por lo que se trata de un artefacto sin traccion ni validacion por parte de la comunidad.

Su relevancia practica es limitada pero concreta: encaja en el nicho de modelos pequenos (rango 3 B) cuantizados a 4 bits, pensados para inferencia en CPU o en GPU de gama media-baja, con un coste de memoria muy reducido. Al estar etiquetado como `endpoints_compatible` y `conversational`, el autor lo orienta a despliegues de chat ligeros y a su uso a traves de endpoints compatibles con la API de OpenAI servidos por llama.cpp. La ausencia de documentacion sobre datos de entrenamiento, licencia e idiomas obliga a tratarlo con cautela en cualquier entorno de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible de forma explicita; los tags (`llama`, `llama.cpp`) y el nombre del fichero (`Llama-3.2-3B-Instruct`) apuntan a un transformer decoder-only de la familia Llama 3.2, sin confirmacion del autor |
| Parametros totales | 3.212.749.888 (3,2 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado: `Llama-3.2-3B-Instruct.Q4_K_M.gguf`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp); se incluye ademas un Modelfile para Ollama |
| Tamano del repositorio | 2,0 GB |
| Fecha de publicacion | 19 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion proporcionada no detalla la arquitectura interna del modelo. Los tags del repositorio (`llama`, `llama.cpp`, `unsloth`) y el nombre del unico fichero de pesos (`Llama-3.2-3B-Instruct.Q4_K_M.gguf`) indican que se trata de un transformer decoder-only de la familia Llama 3.2 en su variante de 3 B parametros ya instruida, sobre la que el autor habria aplicado un fine-tuning adicional. Esta identificacion es una inferencia a partir de los metadatos, no una afirmacion de la model card.

En cuanto al entrenamiento, la model card unicamente indica que el modelo fue ajustado y convertido a GGUF con Unsloth, y que el entrenamiento fue "2x mas rapido" gracias a dicha libreria. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si se emplearon tecnicas de alineacion como RLHF o DPO, ni el procedimiento de cuantizacion mas alla del sufijo Q4_K_M. El autor menciona un ajuste del comportamiento del token BOS para garantizar la compatibilidad con GGUF, un detalle relevante porque afecta a la tokenizacion en llama.cpp y puede alterar ligeramente las respuestas respecto al modelo original.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el tag `conversational` del repositorio.
- Instrucciones y formato de chat: al derivar presumiblemente de una variante Instruct, se espera que responda a directrices en formato de dialogo, aunque el autor no documenta la plantilla de chat empleada.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede servirse detras de una API compatible con OpenAI a traves de llama.cpp.
- Ejecucion local en llama.cpp: la model card documenta el uso mediante `llama-cli -hf ZEUSmaker/zeus-3b-gguf --jinja`.
- Capacidades multimodales: la model card menciona un comando `llama-mtmd-cli` "para modelos multimodales", pero es una indicacion generica de la plantilla de documentacion; no hay evidencia de que este modelo concreto procese imagenes o audio.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo "thinking": no disponible.
- Capacidades multilingues: no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con 3,2 B de parametros y un fichero Q4_K_M de unos 2 GB, permite levantar un chatbot funcional en un portatil sin GPU dedicada, usando llama.cpp u Ollama, para validar prompts y flujos antes de escalar a un modelo mayor.
- Inferencia en el borde o en entornos con recursos limitados: su huella de memoria reducida lo hace apto para dispositivos con poca RAM o para contenedores con limites estrictos, donde un modelo de 7 B o superior no cabria.
- Clasificacion y extraccion de informacion sencilla: tareas como etiquetado de tickets, extraccion de campos de texto libre o resumen de parrafos cortos, siempre que el contexto requerido sea reducido y se valide la calidad de salida.
- Generacion de respuestas en aplicaciones de chat integradas: gracias a la compatibilidad con endpoints al estilo OpenAI, puede colocarse detras de una API interna y consumirse desde frontends existentes sin cambiar el cliente.
- Experimentacion docente y de investigacion: sirve como banco de pruebas para estudiar efectos de la cuantizacion Q4_K_M, del ajuste del token BOS y del fine-tuning con Unsloth sobre un modelo base de 3 B.
- Preprocesado y limpieza de texto en pipelines de datos: normalizacion, reescritura de frases o generacion de variaciones a bajo coste computacional antes de alimentar etapas posteriores.
- Pruebas de integracion con Ollama: el repositorio incluye un Modelfile, lo que facilita empaquetar el modelo en un flujo de despliegue local reproducible para demos internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web asociada no ha devuelto resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el unico fichero publicado es Q4_K_M, de aproximadamente 2 GB en disco; en ejecucion conviene prever entre 2,5 y 4 GB de memoria total, incluyendo pesos, contexto y buffers de llama.cpp. Estas cifras son estimaciones por tamano del fichero, no datos oficiales.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para el fichero Q4_K_M. En el extremo alto, una RTX 4090, A100 o H100 ejecutarian el modelo con holo muy amplios de contexto, aunque estan sobredimensionadas para 3,2 B de parametros.
- Cabe en GPU de consumo: si. Cualquier GPU de consumo moderna (RTX 3060 12 GB, RTX 4060, RTX 4090, e incluso integradas con memoria unificada suficiente) puede alojar el modelo en Q4_K_M. Tambien es viable en CPU pura.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante el Modelfile incluido, y cualquier runtime compatible con GGUF. No hay evidencia de soporte especifico en vLLM o TGI, que trabajan preferentemente con safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

La comparativa se plantea frente a alternativas del mismo rango de parametros (3 B) y orientacion conversacional. Los datos de las alternativas se incluyen como referencia general de categoria; los del modelo evaluado proceden de la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ZEUSmaker/zeus-3b-gguf | 3,2 B | no disponible | no disponible | GGUF (Q4_K_M) | Fine-tuning con Unsloth, 0 descargas, sin benchmarks publicados |
| Llama 3.2 3B Instruct | 3,2 B | 128 K (segun documentacion de Meta) | Llama 3.2 Community License | safetensors, GGUF (comunidad) | Base probable del modelo evaluado; ampliamente validado |
| Qwen2.5 3B Instruct | 3,09 B | 32 K (128 K en variantes ampliadas) | Apache 2.0 en varias variantes | safetensors, GGUF | Alternativa frecuente en el rango 3 B con licencia permisiva |
| Phi-3.5-mini-instruct | 3,8 B | 128 K | MIT | safetensors, GGUF (comunidad) | Orientado a razonamiento y codigo, con licencia muy permisiva |

La ventaja principal del modelo evaluado es la disponibilidad inmediata en GGUF Q4_K_M con un Modelfile de Ollama, lo que simplifica el despliegue local. Sus desventajas son la ausencia total de documentacion sobre licencia, idiomas, contexto y datos de entrenamiento, y la falta de validacion por parte de la comunidad (0 descargas, 0 likes).

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse la licencia, no hay certeza juridica sobre el uso comercial. Debe asumirse que los derechos de uso son indeterminados hasta que el autor los aclare.
- Herencia del modelo base: si el modelo deriva de Llama 3.2 3B Instruct, es probable que le apliquen las restricciones de la Llama 3.2 Community License, incluidos requisitos de atribucion y condiciones para productos con gran base de usuarios. Esto es una inferencia no confirmada.
- Riesgo de alucinacion: un modelo de 3,2 B parametros tiene una capacidad limitada de conocimiento factual; es esperable que fabrique datos en preguntas tecnicas o de actualidad. No se han publicado evaluaciones de fidelidad.
- Idiomas no documentados: no hay confirmacion de soporte de castellano ni de otros idiomas. El rendimiento fuera del ingles, si el base es Llama 3.2, seria notablemente inferior al del ingles.
- Contexto desconocido: al no declararse la longitud de contexto, no se puede garantizar el comportamiento en conversaciones largas ni en tareas de recuperacion con documentos extensos.
- Comportamiento del token BOS modificado: la model card indica que se ajusto el BOS para compatibilidad con GGUF; esto puede provocar diferencias sutiles de tokenizacion y de calidad respecto al modelo original y afectar a integraciones que dependan de la plantilla de chat exacta.
- Sin benchmarks ni validacion externa: no hay metricas publicadas ni evaluaciones de terceros; cualquier uso en produccion requiere una evaluacion propia previa.
- Cuantizacion unica: solo se ofrece Q4_K_M. No hay variantes de mayor precision (Q8_0, F16) para comparar la perdida de calidad por cuantizacion, ni versiones en safetensors para fine-tuning posterior.
- Modelo sin traccion: 0 descargas y 0 likes implican ausencia de revision por la comunidad; la probabilidad de errores no detectados en el proceso de conversion a GGUF es mayor que en modelos ampliamente descargados.
- La referencia a `llama-mtmd-cli` en la model card es plantilla generica de Unsloth y no implica que este modelo tenga capacidades multimodales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZEUSmaker/zeus-3b-gguf
- Unsloth (libreria usada para el fine-tuning y la conversion a GGUF): https://github.com/unslothai/unsloth
- llama.cpp (runtime GGUF recomendado por el autor): https://github.com/ggml-org/llama.cpp
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la busqueda web realizada.
