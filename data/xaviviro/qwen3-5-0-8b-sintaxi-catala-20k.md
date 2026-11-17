# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k es un modelo de 0,8B parámetros (852.985.920 exactos segun safetensors) desarrollado por el usuario xaviviro. Se trata de un fine-tuning completo del modelo base Qwen/Qwen3.5-0.8B orientado a una tarea muy concreta: dado únicamente un enunciado en catalán, devolver directamente su análisis sintáctico en formato JSON, siguiendo la gramática escolar catalana. La tarea y el formato de salida se han destilado en los pesos, de modo que no requiere instrucciones ni ejemplos en el prompt.

El modelo se ha obtenido mediante destilación desde un modelo profesor mucho mayor, Qwen/Qwen3.8-27B en modo razonamiento, sobre el dataset xaviviro/sintaxi-catala-destillada-20k (6649 ejemplos de entrenamiento). Es la variante más grande de una familia de tres (4k, 10k y 20k ejemplos), pensada como demostración práctica de destilación de tareas estructuradas a modelos pequeños.

Su relevancia actual radica en el binomio eficiencia/especialización: un modelo de menos de mil millones de parámetros que supera ampliamente al modelo base con prompt (0 % de análisis exacto frente a 73,3 % en la referencia manual de 30 oraciones) y se acerca al profesor de 27B (93,3 %) con un coste de inferencia mucho menor (11 ms por frase frente a 1712 ms en una RTX PRO 6000). Todo ello bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5, multimodal image-text-to-text) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta GGUF ni otras) |
| Idiomas soportados | catalán (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 con pipeline declarado image-text-to-text (la clase de carga utilizada es `AutoModelForImageTextToText`). Sobre esta base se aplica un fine-tuning completo, no LoRA, de 3 épocas con learning rate 2e-5 (scheduler coseno, 20 pasos de calentamiento), batch de 16 y precisión bf16, usando `SFTTrainer` de TRL con la pérdida calculada únicamente sobre la respuesta.

La innovación técnica principal es la destilación de una tarea estructurada completa (análisis sintáctico en JSON) desde un profesor de 27B en modo razonamiento hacia un alumno de 0,8B. La entrada de entrenamiento es solo la oración como mensaje de usuario, y la salida es el JSON del profesor sin el razonamiento intermedio. Esto reduce el prompt de inferencia de unos 578-614 tokens a 23-26 tokens y elimina la necesidad de few-shot prompting. El resultado es un modelo que ha interiorizado tanto la tarea como el esquema de salida en sus pesos.

## Capacidades

- Análisis sintáctico del catalán: devuelve JSON con sujeto (incluido elíptico), núcleo verbal, tipo de predicado, voz, impersonalidad y complementos (CD, CI, ATRIBUTO, CPRED, CRV, CAG y CC de tiempo, lugar, modo, cantidad, compañía, instrumento, causa y finalidad).
- Generación de texto conversacional: heredada del modelo base, aunque el fine-tuning está altamente especializado.
- Salida estructurada JSON: formato fijo destilado, sin necesidad de instrucciones ni ejemplos en el prompt.
- Ejecución sin modo razonamiento: se recomienda `enable_thinking: false`; el modelo responde de forma directa.
- Capacidad multimodal latente: el modelo base es image-text-to-text, aunque el fine-tuning se ha centrado exclusivamente en texto catalán.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al catalán según la model card.

## Casos de uso

- Anotación sintáctica automatizada de corpus catalanes: el modelo procesa cada oración de forma aislada y devuelve JSON listo para ingesta en bases de datos lingüísticas, con un throughput alto gracias a sus 11 ms por frase en lote con vLLM.
- Herramientas educativas de gramática catalana: integrado en una aplicación de aprendizaje, puede generar el análisis de cualquier oración que introduzca el estudiante y compararlo con la respuesta esperada, aprovechando su 100 % de salida válida en la referencia manual.
- Preprocesado para pipelines de PLN: servir como etiquetador sintáctico ligero antes de tareas posteriores (extracción de relaciones, resumen, traducción asistida) en entornos donde no se dispone de GPUs grandes.
- Generación de datos sintéticos etiquetados: al producir JSON estructurado de forma fiable, puede emplearse para aumentar datasets de entrenamiento de otros modelos lingüísticos en catalán.
- Despliegue en dispositivos con recursos limitados: con menos de 1000 M de parámetros, es viable en GPUs de consumo y en entornos de borde, lo que permite ofrecer análisis sintáctico sin depender de la nube.
- Investigación sobre destilación de tareas estructuradas: sirve como referencia reproducible (código y notebook públicos) para estudiar cómo se transfiere una tarea de razonamiento desde un profesor de 27B a un alumno de 0,8B.
- Verificación de calidad lingüística en publicación de contenidos: detección de estructuras sintácticas anómalas o complementos mal etiquetados en textos catalanes antes de su publicación.

## Benchmarks y rendimiento

Referencia manual de 30 oraciones anotadas a mano:

| Modelo | Análisis exacto | F1 complementos | Sujeto | Núcleo verbal | Salida válida | Tokens de prompt | ms/frase |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,0 % | 18,9 % | 53,3 % | 66,7 % | 53,3 % | 578 | 21 |
| Destilado 4k (solo oración) | 60,0 % | 77,4 % | 86,7 % | 90,0 % | 96,7 % | 23 | 11 |
| Destilado 10k (solo oración) | 70,0 % | 80,7 % | 93,3 % | 90,0 % | 96,7 % | 23 | 11 |
| Destilado 20k (solo oración) | 73,3 % | 85,5 % | 90,0 % | 96,7 % | 100,0 % | 23 | 11 |
| Qwen3.8-27B profesor (con prompt, razonando) | 93,3 % | 96,4 % | 100,0 % | 100,0 % | 100,0 % | 614 | 1712 |

Test de 300 oraciones con etiquetas del profesor filtradas:

| Modelo | Análisis exacto | F1 complementos | Sujeto | Núcleo verbal | Salida válida | Tokens de prompt |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,3 % | 10,1 % | 77,3 % | 64,3 % | 58,7 % | 581 |
| Destilado 4k (solo oración) | 86,7 % | 92,4 % | 98,3 % | 96,3 % | 96,0 % | 26 |
| Destilado 10k (solo oración) | 92,3 % | 94,4 % | 99,3 % | 98,0 % | 98,3 % | 26 |
| Destilado 20k (solo oración) | 92,3 % | 95,4 % | 99,0 % | 99,3 % | 97,7 % | 26 |

Nota del autor: el test de 300 oraciones mide la imitación del profesor, no la corrección absoluta. Los tiempos por frase se midieron procesando las 30 oraciones en lote con vLLM en una RTX PRO 6000 (96 GB), no como latencia de una llamada aislada.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 1,7 GB de pesos (tamaño del repo) más overhead de activaciones y caché KV; en cuantización de 8 bits cabría en torno a 1 GB, y en 4 bits por debajo de 1 GB (estimación a partir de los parámetros; el autor no publica cifras oficiales de cuantización).
- GPU recomendadas: RTX PRO 6000 (96 GB) es la utilizada en las mediciones del autor; cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente en bf16.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, dada la baja huella del modelo.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), vLLM (`vllm serve xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k`). El autor no documenta llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11 ms por frase en lote de 30 oraciones con vLLM en RTX PRO 6000; el profesor tarda 1712 ms por frase en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Análisis exacto (ref. manual) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-20k | 852,9 M | no disponible | 73,3 % | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-sintaxi-catala-10k | no disponible | no disponible | 70,0 % | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B-sintaxi-catala-4k | no disponible | no disponible | 60,0 % | Apache 2.0 | Hugging Face |
| Qwen3.8-27B (profesor, con prompt) | 27 B (aprox.) | no disponible | 93,3 % | no disponible | Hugging Face |

Las tres variantes destiladas comparten base y licencia; la de 20k es la de mayor calidad en la referencia manual (73,3 % frente a 70,0 % y 60,0 %), aunque en el test de 300 oraciones la 10k y la 20k empatan en análisis exacto (92,3 %). El profesor de 27B obtiene la mejor puntuación absoluta pero con un coste de inferencia dos órdenes de magnitud superior.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado para una única tarea y un único formato de salida; su uso como modelo conversacional general no está validado y probablemente degrade la calidad respecto al base.
- Riesgo de alucinación estructural: en los ejemplos del autor se observan errores como verbos mal conjugados («obeixen» en lugar de «obeeixen») o fragmentos inventados («os», «ses»), lo que exige validación posterior en producción.
- Cobertura limitada a oraciones simples: la tarea definida en la model card se restringe a oraciones simples de la gramática escolar; no se documenta el comportamiento en oraciones complejas, subordinadas o textos largos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre etiquetas de un profesor y un dataset catalán, puede heredar los sesgos lingüísticos y de anotación de esa fuente.
- Limitación de idioma: solo catalán; no se garantiza un comportamiento correcto en otras lenguas.
- Contexto: la longitud de contexto no está documentada en la información disponible, lo que dificulta planificar usos con entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-0.8B y del dataset de destilación.
- Caveat de producción: el test de 300 oraciones mide imitación del profesor, no corrección absoluta; la calidad real frente a anotación humana es la de la referencia manual (73,3 % de análisis exacto).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k
- Variante 10k: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k
- Variante 4k: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k
- Dataset de destilación: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-20k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Código y notebook: https://github.com/xaviviro/destillacio-sintaxi-catala
