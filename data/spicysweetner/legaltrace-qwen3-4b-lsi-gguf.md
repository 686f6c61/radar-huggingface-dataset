# spicysweetner/LegalTrace-Qwen3-4B-LSI-GGUF

## Resumen

LegalTrace-Qwen3-4B-LSI-GGUF es la distribucion en formato GGUF del modelo LegalTrace-Qwen3-4B-LSI, un ajuste fino de Qwen/Qwen3-4B-Instruct-2507 orientado a una tarea muy concreta: la identificacion de secciones del Codigo Penal de la India (Indian Penal Code, IPC) a partir de la descripcion de un supuesto de hecho. El modelo recibe un texto en ingles que narra un incidente delictivo y devuelve una lista de numeros de seccion IPC potencialmente aplicables, en un esquema de prediccion multietiqueta sobre 100 secciones penales principales.

Lo desarrolla el usuario spicysweetner y se publica bajo licencia Apache 2.0, heredada del modelo base. La relevancia practica no esta en el rendimiento bruto, sino en la especializacion: frente a un LLM generico en modo zero-shot, el ajuste multiplica por mas de cuatro el Macro-F1 en esta tarea (0,2443 frente a la linea base zero-shot), lo que lo convierte en un componente util para prototipos de asistencia juridica, triaje documental o sistemas de recuperacion normativa.

El repositorio incluye unicamente una cuantizacion Q8_0 de 4,28 GB y un `Modelfile` listo para Ollama, lo que permite ejecutarlo en portatiles con GPU modesta (el autor reporta unos 65 tokens/s en una RTX 5050 Laptop y una latencia de inferencia de aproximadamente 0,45 s). Es, por tanto, un modelo pequeno, de un solo idioma (ingles) y de alcance deliberadamente estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507); detalles internos no disponibles |
| Parametros totales | 4B (aproximado, segun el nombre del modelo base Qwen3-4B) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion publicada) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unico archivo publicado: `legaltrace-lsi-q8_0.gguf`, 4,28 GB) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (compatible con Ollama, llama.cpp, LM Studio y vLLM segun la model card) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4.000 millones de parametros, y se ajusta de forma supervisada para una tarea de clasificacion multietiqueta: dada una descripcion factual de un delito, generar la lista de secciones del IPC aplicables entre un conjunto de 100 secciones penales principales. La model card no detalla el volumen de datos de entrenamiento, la composicion del corpus, ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible.

La innovacion tecnica del repositorio no reside en la arquitectura, sino en el empaquetado: se distribuye un unico binario GGUF en Q8_0 junto con un `Modelfile`, de modo que el modelo puede desplegarse con un solo comando en Ollama o cargarse directamente en llama.cpp y LM Studio. El autor menciona compatibilidad con vLLM, aunque para ese motor lo habitual seria usar los pesos originales en safetensors, que no se incluyen en este repositorio.

## Capacidades

- Identificacion de secciones del Indian Penal Code: recibe una narracion de hechos en ingles y devuelve una lista de numeros de seccion IPC separados por comas (por ejemplo, `363, 366, 366A` o `392, 394, 397, 452, 457`).
- Prediccion multietiqueta sobre 100 secciones penales principales, es decir, puede asignar varias secciones a un mismo supuesto.
- Generacion de texto en ingles orientada a la tarea; no se documentan capacidades generales de razonamiento, codigo o matematicas mas alla de las heredadas del modelo base.
- Soporte de tool calling y function calling: no disponible en la informacion publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion publicada.
- Capacidades multilingues: limitadas al ingles segun el campo `language` de la model card.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion publicada.

## Casos de uso

- Triaje de denuncias y escritos penales: el modelo puede procesar la narracion de hechos de una denuncia en ingles y proponer las secciones IPC candidatas, lo que acelera la clasificacion inicial en un juzgado o comisaria antes de la revision por un jurista.
- Asistencia a abogados penalistas: dado un resumen de caso, el modelo sugiere un conjunto inicial de secciones aplicables que el profesional contrasta manualmente, reduciendo el tiempo de busqueda normativa.
- Indexacion y etiquetado de bases de datos jurisprudenciales: al devolver secciones IPC en formato de lista, la salida puede parsearse directamente para poblar metadatos de sentencias y resoluciones.
- Prototipos de chatbots de orientacion legal: integrado via la API REST de Ollama, puede responder a preguntas del tipo "que delito es este" devolviendo las secciones relevantes, con la advertencia de que no sustituye asesoramiento juridico.
- Investigacion en NLP juridico: sirve como linea base especializada para experimentos de clasificacion multietiqueta de estatutos, con metricas publicadas (Macro-F1, Micro-F1 y Example-F1) que permiten comparaciones reproducibles.
- Despliegue en entornos con recursos limitados: al ocupar 4,28 GB en Q8_0 y funcionar en Ollama o llama.cpp, puede ejecutarse en un portatil con GPU de 6 GB o incluso en CPU con 8 GB de RAM, lo que facilita demos y pruebas de concepto sin infraestructura dedicada.
- Generacion de borradores de escritos de imputacion: la lista de secciones predicha puede incorporarse como punto de partida en plantillas documentales, siempre con validacion humana posterior.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Macro-F1 (100 categorias IPC) | 0,2443 (+329 % sobre LLM base en zero-shot) |
| Micro-F1 | 0,3789 |
| Example-F1 | 0,3843 |
| Latencia de inferencia | ~0,45 s en RTX 5050 Laptop con Q8_0 (4,28 GB) |
| Velocidad de generacion | ~65 tokens/s en RTX 5050 Laptop |

No se han publicado en la informacion disponible resultados de benchmarks generales como MMLU, HumanEval o GSM8K para este ajuste.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5-5 GB con la cuantizacion Q8_0 de 4,28 GB, mas el overhead de contexto.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM; el autor cita una RTX 5050 Laptop como referencia de rendimiento.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas (por ejemplo, RTX 3060, RTX 4060, RTX 5050). En CPU requiere unos 8 GB de RAM.
- Opciones de despliegue: Ollama (con `ollama run hf.co/spicysweetner/LegalTrace-Qwen3-4B-LSI-GGUF` o construyendo desde el `Modelfile`), llama.cpp, LM Studio y, segun la model card, vLLM.
- Latencia y throughput: aproximadamente 0,45 s de latencia y 65 tokens/s en una RTX 5050 Laptop con Q8_0, segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| LegalTrace-Qwen3-4B-LSI-GGUF | ~4B | no disponible | Identificacion de secciones IPC (100 clases) | Apache 2.0 | GGUF (Q8_0) |
| Qwen3-4B-Instruct-2507 (base, zero-shot) | ~4B | no disponible | Generacion general; linea base del benchmark | Apache 2.0 | safetensors, GGUF |
| LLM generico de ~4B en zero-shot | ~4B | variable | Generacion general | variable | variable |

La model card solo ofrece la comparacion frente al modelo base en modo zero-shot, con una mejora de Macro-F1 del +329 % (de una linea base implicita de aproximadamente 0,057 a 0,2443). No se proporcionan comparaciones con otros modelos especializados en NLP juridico indio, por lo que esa comparativa no esta disponible.

## Limitaciones y advertencias

- Rendimiento absoluto modesto: un Macro-F1 de 0,2443 sobre 100 clases indica que la tarea es dificil y que el modelo falla con frecuencia; no es apto para uso autonomo sin revision experta.
- Alcance limitado al Indian Penal Code y a 100 secciones principales; no cubre el resto del ordenamiento juridico indio ni legislacion de otros paises.
- Idioma: solo ingles; las entradas en otros idiomas, incluido el castellano, no estan soportadas.
- Riesgo de alucinacion: al ser un modelo generativo, puede emitir numeros de seccion inexistentes o combinaciones incorrectas; la salida debe validarse contra el texto legal vigente.
- Sesgos: no se documentan analisis de sesgos en la model card; al entrenarse sobre descripciones de delitos, puede reflejar sesgos presentes en los datos de origen.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias ni asume responsabilidad por decisiones juridicas basadas en las predicciones.
- Madurez: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documentan datos de entrenamiento ni proceso de evaluacion independiente.
- Para vLLM, el repositorio solo incluye GGUF; seria necesario localizar los pesos originales en safetensors del modelo base ajustado, que no se distribuyen aqui.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/spicysweetner/LegalTrace-Qwen3-4B-LSI-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Ollama: https://ollama.com
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
- vLLM: https://github.com/vllm-project/vllm
