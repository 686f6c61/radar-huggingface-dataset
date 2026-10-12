# wonhomelee/EEVE-Korean-Instruct-10.8B-v1.0-GGUF

## Resumen

EEVE-Korean-Instruct-10.8B-v1.0-GGUF es una version cuantizada en formato GGUF del modelo yanolja/EEVE-Korean-Instruct-10.8B-v1.0, un modelo de lenguaje de 10,8B parametros orientado al coreano. La publica el usuario wonhomelee en HuggingFace y la conversión se ha realizado con llama.cpp, el runtime de referencia para inferencia de LLM en CPU y GPU de consumo. El repositorio ocupa 37,8 GB e incluye al menos una cuantizacion Q4_K_M (fichero ggml-model-Q4_K_M.gguf), lo que sugiere que se distribuyen varias variantes de cuantizacion en el mismo repo.

El problema que resuelve es el de permitir ejecutar un modelo coreano de ~11B en hardware modesto sin necesidad de GPU de datacenter: la model card incluye un ejemplo funcional con llama-cpp-python que corre en una GPU T4 de Colab. Aunque el modelo original es de tipo instruct (ajustado para seguir instrucciones y mantener conversaciones), esta ficha describe especificamente la publicacion cuantizada, cuyos metadatos de licencia, idiomas y pipeline no estan documentados en la informacion disponible.

Es relevante ahora porque el ecosistema GGUF permite desplegar modelos multilingues en local, y porque la familia EEVE de Yanolja es una de las apuestas coreanas por modelos abiertos de tamano medio. Ademas, el ejemplo de la model card muestra que el modelo es sensible a la plantilla de prompt utilizada (formato "Human:/Assistant:"), un detalle critico para reproducir resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado del modelo original yanolja/EEVE-Korean-Instruct-10.8B-v1.0); la model card no detalla la arquitectura |
| Parametros totales | 10,8B (segun el nombre del modelo) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (valor usado en el ejemplo de la model card con n_ctx=4096) |
| Tipos de cuantizacion | Confirmado Q4_K_M (ggml-model-Q4_K_M.gguf); el tamano del repo (37,8 GB) sugiere que hay mas variantes, pero no se listan |
| Idiomas soportados | no disponible oficialmente; el nombre y los ejemplos de la model card son en coreano |
| Licencia | no disponible |
| Formato de pesos | GGUF (generado con llama.cpp) |

## Arquitectura y entrenamiento

La model card de esta publicacion no aporta detalles sobre la arquitectura interna, los datos de entrenamiento ni el proceso de alineacion (RLHF, DPO u otros). Lo unico documentado es que se trata de una cuantizacion del modelo original yanolja/EEVE-Korean-Instruct-10.8B-v1.0 realizada con llama.cpp, lo que implica que el modelo subyacente es un transformer decoder-only de 10,8B parametros adaptado al coreano mediante ajuste instruccional. Para conocer la composicion del dataset, el numero de tokens y las tecnicas de alineacion hay que consultar la model card del modelo original, que no forma parte de la informacion proporcionada en esta busqueda.

El unico detalle tecnico relevante que si aparece es la plantilla de prompt, que reproduce el esquema clasico de instruccion: un preambulo fijo en ingles ("A chat between a curious user and an artificial intelligence assistant..."), seguido de "Human: {prompt}\nAssistant:\n". La eleccion de esta plantilla afecta directamente a la calidad de las respuestas, como demuestra el ejemplo de la model card, donde el modelo responde correctamente a una pregunta de opcion multiple sobre la capital de Corea del Sur.

## Capacidades

- Generacion de texto en coreano: el ejemplo de la model card muestra respuesta coherente a una pregunta de conocimiento y formato de opcion multiple (selecciona "(D) Seoul").
- Seguimiento de instrucciones: el modelo original esta etiquetado como "Instruct", por lo que esta ajustado para responder a comandos directos.
- Razonamiento basico y eleccion multiple: responde con justificacion breve antes de dar la respuesta final.
- Inferencia en CPU y GPU: al estar en formato GGUF, puede ejecutarse tanto con llama.cpp en CPU como con aceleracion GPU mediante llama-cpp-python.
- Soporte de plantillas de prompt personalizadas: el ejemplo permite pasar una plantilla y tokens de parada ("</s>").
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues distintas del coreano: no disponible; no se declaran idiomas oficialmente.
- Capacidades especiales (vision, audio, modo thinking): no disponible.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar dialogos multi-turno en coreano usando la plantilla "Human:/Assistant:" y una ventana de 4096 tokens, suficiente para conversaciones de varias rondas con contexto moderado.
- Preguntas y respuestas sobre conocimiento general: como muestra el ejemplo de la model card, responde a preguntas factuales con formato de eleccion multiple, util para sistemas de quiz o tutoria.
- Despliegue local en portatiles o estaciones de trabajo sin GPU dedicada: gracias a la cuantizacion Q4_K_M y al soporte de llama.cpp en CPU, se puede ejecutar en equipos de consumo.
- Prototipado rapido en entornos con recursos limitados: la model card documenta una ejecucion en una T4 de Colab, lo que lo hace apto para demos y pruebas de concepto sin infraestructura cara.
- Educacion y aprendizaje de coreano: puede emplearse como generador de ejemplos, respuestas o ejercicios en coreano, siempre con supervision humana por el riesgo de alucinacion.
- Clasificacion y etiquetado de texto coreano: al ser un modelo instruct, puede adaptarse mediante prompting a tareas de extraccion o categorizacion, aunque su rendimiento en estas tareas no esta documentado.
- Chatbots internos para empresas coreanas: el modelo puede integrarse en un servicio on-premise evitando enviar datos a APIs externas, siempre que la licencia lo permita (licencia no disponible, ver limitaciones).
- Generacion de texto asistida en pipelines de datos: util para aumentar o normalizar corpus en coreano dentro de procesos batch ejecutados por CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Lo unico que se documenta es una medicion de velocidad de inferencia en una GPU T4 de Colab con la cuantizacion Q4_K_M:

| Metrica | Valor |
|---|---|
| Tiempo de carga | 942,53 ms |
| Evaluacion de prompt | 88,08 tokens/s |
| Generacion (eval) | 7,95 tokens/s |
| Tokens generados en la prueba | 36 |
| Total de tokens procesados | 119 |
| Tiempo total | 5648,42 ms |

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q4_K_M, un modelo de 10,8B suele ocupar aproximadamente 6-7 GB de pesos; el repo completo ocupa 37,8 GB, lo que indica que contiene varias cuantizaciones de distinto tamano. Estas cifras son estimaciones a partir del numero de parametros y la cuantizacion, no datos confirmados en la model card.
- GPU recomendadas: la model card demuestra funcionamiento en una NVIDIA T4 (16 GB). Para cuantizaciones Q4_K_M es razonable usar RTX 3060 12 GB, RTX 4070/4080, RTX 4090, A100 o H100, aunque no se facilita una lista oficial.
- GPU de consumo: si, es probable que quepa en GPUs consumer de 8 GB o mas con cuantizaciones Q4 o inferiores; con cuantizaciones mas altas (Q8, FP16) se requerira mas VRAM (hasta ~22 GB en FP16).
- Opciones de despliegue: llama.cpp y llama-cpp-python (documentados en la model card). Otras herramientas compatibles con GGUF, como Ollama o servidores basados en llama.cpp, deberian funcionar pero no se mencionan.
- Latencia y throughput: en T4 con Q4_K_M se midieron 88,08 tokens/s de evaluacion de prompt y 7,95 tokens/s de generacion. No hay datos para otras GPU o cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones oficiales que permitan comparar este modelo con alternativas de forma fiable. A modo orientativo, la tabla siguiente recoge unicamente la informacion disponible:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wonhomelee/EEVE-Korean-Instruct-10.8B-v1.0-GGUF | 10,8B | 4096 (segun ejemplo) | GGUF | no disponible | HuggingFace |
| yanolja/EEVE-Korean-Instruct-10.8B-v1.0 | 10,8B | no disponible | safetensors (presumiblemente) | no disponible | HuggingFace |
| heegyu/EEVE-Korean-Instruct-10.8B-v1.0-GGUF | 10,8B | no disponible | GGUF | no disponible | HuggingFace |

La comparacion de rendimiento con otros modelos de la misma categoria (por ejemplo, otros LLM coreanos de ~10B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia en el repositorio, por lo que no se puede confirmar si el uso comercial esta permitido. Antes de usarlo en produccion, hay que verificar los terminos del modelo original.
- Metadatos incompletos: no se declaran idiomas, pipeline ni tipos de cuantizacion mas alla de Q4_K_M; el repositorio no incluye una model card completa.
- Riesgo de alucinacion: como cualquier LLM de este tamano, puede generar informacion incorrecta con seguridad, especialmente en dominios especializados o fuera del coreano.
- Sensibilidad a la plantilla: el modelo ha sido ajustado con una plantilla concreta; usar otro formato puede degradar notablemente la calidad de las respuestas.
- Cobertura idiomatica: no hay confirmacion oficial de que soporte idiomas distintos del coreano; el uso en castellano puede dar resultados pobres.
- Contexto limitado: 4096 tokens es una ventana modesta comparada con modelos actuales de 32K o 128K; los prompts o documentos largos requeriran troceado.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni garantia de mantenimiento.
- Inconsistencia en la model card: el ejemplo de codigo referencia el repo heegyu/EEVE-Korean-Instruct-10.8B-v1.0-GGUF en lugar de wonhomelee, lo que puede confundir al usuario y sugiere que la model card es una copia adaptada.
- Rendimiento de generacion bajo en T4: 7,95 tokens/s es adecuado para pruebas, pero puede ser limitante en produccion con alto trafico.
- Sin garantias de calidad en tareas especializadas: no hay benchmarks publicados, por lo que no se puede asegurar su rendimiento en codigo, matematicas u otras tareas.

## Enlaces

- Repositorio HuggingFace (version cuantizada): https://huggingface.co/wonhomelee/EEVE-Korean-Instruct-10.8B-v1.0-GGUF
- Modelo original: https://huggingface.co/yanolja/EEVE-Korean-Instruct-10.8B-v1.0
- Repositorio GGUF alternativo citado en la model card: https://huggingface.co/heegyu/EEVE-Korean-Instruct-10.8B-v1.0-GGUF
- llama.cpp (herramienta de cuantizacion y runtime): https://github.com/ggerganov/llama.cpp
- Documentacion de llama-cpp-python: https://github.com/abetlen/llama-cpp-python
