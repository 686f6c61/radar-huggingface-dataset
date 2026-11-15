# Swara55/qwen3.5-0.8b-rag-sft

## Resumen

Qwen3.5-0.8B RAG SFT es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`), desarrollado por el usuario Swara55 para la competicion final del curso de LLM "Matsuo-Iwasawa Lab LLM Course 2 2026". El adaptador LoRA se ha fusionado con los pesos del modelo base, dando como resultado un checkpoint unico de 752.393.024 parametros (~0,75B) en formato safetensors.

El modelo esta especializado en una tarea muy concreta de generacion aumentada por recuperacion (RAG): recibe como contexto los cinco fragmentos de documento recuperados por un pipeline de busqueda y debe devolver una respuesta corta junto con el identificador del fragmento que sirve de evidencia, todo ello en formato JSON. El entrenamiento se ha realizado exclusivamente con datos reales del split de entrenamiento de JSQuAD (JGLUE), filtrados por un pipeline de recuperacion sobre un conjunto de chunks de Wikipedia japonesa, sin generacion sintetica por parte de otros modelos.

Su relevancia es acotada pero clara: demuestra como un modelo de menos de mil millones de parametros puede especializarse en una tarea estructurada de QA extractivo con citacion de fuentes, algo util para sistemas RAG de bajo coste en japones. La licencia CC BY-SA 4.0 y el hecho de que solo se declaren datos en japones limitan su uso fuera de ese ambito.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (~0,75B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el modelo base admite tecnicas habituales como GGUF/AWQ, pero no se documenta en esta ficha) |
| Idiomas soportados | japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors (adaptador LoRA fusionado con el modelo base) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 orientada a texto (tag `qwen3_5_text`). Sobre esa base se aplico un ajuste fino con LoRA (Low-Rank Adaptation) que posteriormente se fusiono con los pesos originales, de modo que el repositorio contiene un unico conjunto de pesos densos y no un adaptador separado. No se especifican en la informacion disponible el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni la composicion exacta de hiperparametros.

El dataset de entrenamiento se construyo a partir del split de entrenamiento de JSQuAD (JGLUE). Para cada pregunta se ejecuto el pipeline de recuperacion distribuido sobre un conjunto de chunks de Wikipedia japonesa y se conservaron unicamente aquellas preguntas en las que el fragmento que contiene la respuesta aparecia entre los cinco primeros resultados. No se empleo generacion ni postprocesado con modelos externos: todos los documentos son datos reales de los chunks distribuidos. El objetivo de entrenamiento es la produccion de una respuesta corta acompanada del identificador del chunk de evidencia en formato JSON. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Generacion de respuestas cortas y extractivas en japones a partir de un contexto de cinco fragmentos recuperados.
- Citacion de la fuente: devuelve el identificador del chunk que contiene la evidencia de la respuesta.
- Salida estructurada en JSON con dos campos (respuesta corta e ID de chunk).
- Razonamiento de tipo lectura comprensiva sobre contexto multiple (multi-document QA).
- Especializacion en el dominio de Wikipedia japonesa, alineada con la distribucion de JSQuAD.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla de la tarea de QA.
- No se documenta capacidad de vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada al japones segun la model card.

## Casos de uso

- Sistemas RAG de bajo coste en japones: el modelo esta disenado para recibir los cinco chunks recuperados por un buscador y devolver la respuesta con el ID de evidencia, lo que permite construir un pipeline de QA con trazabilidad de fuentes en hardware modesto.
- Atencion al cliente con base de conocimiento: dado un conjunto de fragmentos de documentacion o FAQ en japones, el modelo puede responder consultas cortas indicando que fragmento respalda la respuesta, lo que facilita la auditoria de las contestaciones.
- Verificacion de respuestas con citacion: al devolver el ID del chunk de evidencia, el sistema puede validar automaticamente que la respuesta procede de una fuente recuperada y descartar alucinaciones sin soporte documental.
- Prototipado rapido de pipelines RAG: con ~0,75B de parametros, el modelo cabe en GPUs de consumo y permite iterar sobre el diseno del recuperador y del prompt sin depender de infraestructura grande.
- Evaluacion de recuperadores: el modelo puede usarse como componente de un banco de pruebas para medir si un cambio en el pipeline de busqueda mejora la calidad de la respuesta final y la precision de la citacion.
- Extraccion de respuestas en corpus documentales japoneses: integrado en un flujo batch, puede procesar grandes volumenes de pares pregunta-contexto y producir respuestas estructuradas para su posterior analisis.
- Educacion e investigacion: sirve como ejemplo reproducible de ajuste fino LoRA con datos filtrados por recuperacion para cursos y experimentos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,5 GB solo para los pesos (752M parametros), mas el overhead de activaciones y cache KV; en la practica, alrededor de 2-3 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 0,8-1 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 0,4-0,5 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son mas que suficientes.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna (RTX 30xx/40xx, incluso modelos de gama baja con 6-8 GB).
- Opciones de despliegue: no se documentan en la model card; al tratarse de pesos safetensors de un modelo de la familia Qwen3.5, es previsible su uso con vLLM, TGI o llama.cpp/Ollama previa conversion, pero no hay confirmacion en la informacion proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Swara55/qwen3.5-0.8b-rag-sft | 752M | no disponible | ja | CC BY-SA 4.0 | Ajuste LoRA fusionado para QA extractivo con citacion sobre JSQuAD |
| Qwen/Qwen3.5-0.8B (base) | ~0,8B | no disponible | multilingue (segun model card del base) | no disponible en esta ficha | Modelo base sin especializar; capacidad generalista |
| Otros modelos Qwen3.5 de mayor tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento numerico con alternativas; la comparativa se limita a parametros, licencia e idioma.

## Limitaciones y advertencias

- El modelo esta especializado en una unica tarea (QA extractivo con cinco chunks de contexto y salida JSON); su rendimiento fuera de ese formato o dominio no esta garantizado.
- Solo se declara japones como idioma soportado; el uso en castellano u otras lenguas no esta validado.
- Al ser un ajuste sobre JSQuAD y Wikipedia japonesa, puede heredar sesgos de cobertura y sesgos de representacion de ese corpus.
- Riesgo de alucinacion: aunque el formato exige citar un chunk, el modelo podria generar respuestas no respaldadas por el fragmento citado o inventar identificadores; se recomienda validacion posterior.
- La licencia CC BY-SA 4.0 impone obligaciones de atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede ser restrictivo para uso comercial propietario.
- El modelo base Qwen3.5-0.8B tiene su propia licencia, que debe verificarse por separado antes de su uso en produccion.
- No se documentan limites de contexto, hiperparametros de entrenamiento ni evaluaciones; la ausencia de benchmarks impide estimar su calidad frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Swara55/qwen3.5-0.8b-rag-sft
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- JSQuAD / JGLUE: https://github.com/yahoojapan/JGLUE
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
