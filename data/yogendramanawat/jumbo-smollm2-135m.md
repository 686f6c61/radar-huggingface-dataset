# yogendramanawat/jumbo-smollm2-135m

## Resumen

Jumbo es un ajuste fino (fine-tuning) del modelo SmolLM2-135M-Instruct de HuggingFaceTB, publicado por el usuario yogendramanawat. Su proposito es muy concreto: convertir una frase hablada en ingles en un unico registro XML pequeno y estructurado, clasificando la intencion en una de cuatro categorias (recordatorio, tarea pendiente, tarea completada o nota) o generando una respuesta breve. El modelo esta pensado para ejecutarse en dispositivos muy limitados, como el CPU de un telefono de 2015 con 916 MB de RAM, completamente offline.

El modelo parte de la arquitectura transformer de SmolLM2-135M-Instruct (134.515.008 parametros) y se distribuye unicamente como cuantizacion GGUF Q4_0 de 87 MB, lo que lo hace apto para inferencia en CPU con llama.cpp. No es un modelo de proposito general ni un competidor de los LLM actuales: es un experimento de fin de semana orientado a asistentes de voz locales y salida estructurada.

Su relevancia radica en demostrar que un modelo de 135M parametros, tras un SFT con datos sinteticos y un breve entrenamiento con GRPO, puede pasar de 3/20 a 19/20 en una evaluacion de formato XML y campos correctos sobre 20 prompts reservados. Es un caso practico de como el ajuste fino con recompensas de formato puede hacer util un modelo minusculo para una tarea de enrutamiento estructurado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_0 (unico archivo publicado, 87 MB) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (`SmolLM2-135M-Jumbo-Q4_0.gguf`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer de SmolLM2-135M-Instruct, un modelo denso de 135M parametros. No se introduce ninguna modificacion arquitectonica: el trabajo se centra exclusivamente en el ajuste fino sobre el modelo base. El contexto maximo no se especifica en la informacion disponible.

El entrenamiento consta de dos fases. Primero, un SFT sobre frases sinteticas de estilo hablado y desordenado, generadas por script, con 1.420 ejemplos de entrenamiento y 108 de validacion (sin datos personales). Despues, 80 pasos de GRPO (Group Relative Policy Optimization) con una recompensa basada en el formato y la correccion de los campos. El prompt de sistema define el contrato de salida: cinco etiquetas XML posibles (`<reminder>`, `<todo>`, `<done>`, `<note>`, `<reply>`). La innovacion tecnica destacable no es arquitectonica sino de alineamiento: el uso de GRPO con recompensa de formato para forzar una salida estructurada valida en un modelo de muy pocos parametros.

## Capacidades

- Generacion de texto breve en ingles y enrutamiento de intenciones a XML estructurado.
- Clasificacion en cuatro intenciones: recordatorio (`<reminder>`), tarea pendiente (`<todo>`), tarea completada (`<done>`) y nota (`<note>`).
- Extraccion de campos: titulo y momento temporal en recordatorios, item en tareas, texto en notas.
- Generacion de respuestas cortas a preguntas generales mediante la etiqueta `<reply>`.
- Salida estructurada determinista con temperatura 0 (formato XML predecible).
- Ejecucion en CPU, offline y en dispositivos con recursos muy limitados.
- No dispone de soporte documentado de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Asistentes de voz en dispositivos embebidos: el modelo convierte una frase dictada en un registro XML de recordatorio o tarea, ejecutandose en CPU y sin conexion, lo que permite integrarlo en telefonos antiguos o dispositivos IoT con poca RAM.
- Gestion de recordatorios y listas de tareas en aplicaciones moviles offline: la salida `<reminder>` y `<todo>` puede parsearse directamente para crear entradas en un calendario o lista local sin backend.
- Captura rapida de notas por voz: la etiqueta `<note>` permite transcribir una idea dictada a un registro estructurado, aunque el autor advierte que es la intencion mas debil por tener solo 36 filas de entrenamiento.
- Marcado de tareas completadas: la etiqueta `<done>` permite cerrar items de una lista mediante una frase hablada como "i already finished clean ceiling fan".
- Enrutamiento de intenciones en pipelines de voz a texto: al devolver XML con etiquetas fijas, el modelo actua como clasificador ligero que decide la accion a ejecutar en un sistema mayor.
- Respuestas conversacionales breves en asistentes de bajo consumo: la etiqueta `<reply>` cubre preguntas simples como "how does a fridge work" sin requerir un LLM mayor.
- Prueba de concepto de alineamiento con GRPO en modelos minusculos: sirve como referencia para experimentar con recompensas de formato en entornos con recursos limitados.

## Benchmarks y rendimiento

El autor publica una evaluacion propia, no estandarizada, sobre 20 prompts reservados generados por la misma familia de scripts, puntuando XML valido y campos correctos:

| Modelo | Prompts correctos (de 20) |
|---|---|
| SmolLM2-135M-Instruct original (Q4_0 de bartowski) | 3/20 |
| Jumbo (fine-tuned) | 19/20 |

El propio autor advierte que es un conjunto de prueba muy pequeno y de la misma familia de generadores, no un benchmark. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica para CPU; el archivo GGUF Q4_0 ocupa 87 MB en disco y requiere un espacio en memoria del mismo orden.
- Ejecucion verificada en el CPU de un Oppo A33f de 2015 con 916 MB de RAM.
- Cabe en cualquier GPU consumer, aunque no es su objetivo; puede ejecutarse en CPU sin GPU.
- Despliegue mediante llama.cpp (`llama-cli -hf yogendramanawat/jumbo-smollm2-135m` o con el archivo local `SmolLM2-135M-Jumbo-Q4_0.gguf`).
- No se documentan latencia ni throughput concretos; por el tamano del modelo y la cuantizacion Q4_0, la inferencia en CPU es viable en dispositivos de gama baja.
- No se mencionan integraciones con vLLM, TGI u Ollama en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Jumbo (este modelo) | 134.515.008 | no disponible | Enrutamiento a XML para recordatorios y notas | Apache-2.0 | GGUF Q4_0 |
| SmolLM2-135M-Instruct | 135M | no disponible en la informacion | Instrucciones generales | Apache-2.0 | safetensors, GGUF (comunidad) |
| SmolLM2-360M-Instruct | 360M | no disponible en la informacion | Instrucciones generales | Apache-2.0 | safetensors, GGUF (comunidad) |

La comparativa directa con el modelo base es la mas relevante: Jumbo mejora de 3/20 a 19/20 en la tarea especifica de salida XML, a costa de especializarse y perder capacidades generales. Frente a SmolLM2-360M-Instruct, Jumbo es mas pequeno y mas rapido en CPU, pero solo cubre cinco etiquetas XML en ingles.

## Limitaciones y advertencias

- Puede inventar titulos o equivocarse en AM/PM; los tiempos relativos como "after half an hour" fallaron en una prueba.
- Las notas son la intencion mas debil (36 filas de entrenamiento): en una prueba una nota se convirtio en una tarea erronea y una pregunta general devolvio una etiqueta inventada.
- Solo soporta ingles y esta entrenado para cuatro intenciones mas respuestas cortas; fuera de ese dominio su comportamiento no esta garantizado.
- La evaluacion es muy limitada (20 prompts de la misma familia de generadores), por lo que las cifras no deben interpretarse como rendimiento general.
- Riesgo de alucinacion en las respuestas de `<reply>`, ya que el modelo base es de 135M parametros y el ajuste se centro en formato, no en conocimiento factual.
- Licencia Apache-2.0 permite uso comercial, pero el autor lo describe como "un experimento de fin de semana, compartido tal cual", sin garantias de robustez en produccion.
- No se documenta la longitud de contexto, lo que impide planificar conversaciones multi-turno largas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yogendramanawat/jumbo-smollm2-135m
- Modelo base SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Repositorio de llama.cpp: https://github.com/ggml-org/llama.cpp
- Cuantizacion comunitaria del modelo base (bartowski): https://huggingface.co/bartowski/SmolLM2-135M-Instruct-GGUF
