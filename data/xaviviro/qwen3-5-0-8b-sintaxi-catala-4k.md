# xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k

## Resumen

Qwen3.5-0.8B-sintaxi-catala-4k es un modelo de lenguaje de 0,8 mil millones de parametros (852.985.920 exactos, segun los pesos en safetensors) desarrollado por el usuario xaviviro. Se trata de un fine-tuning completo del modelo base Qwen/Qwen3.5-0.8B, especializado en una unica tarea muy concreta: dada una oracion simple en catalan, devolver directamente su analisis sintactico en formato JSON segun la gramatica escolar. La tarea y el formato de salida se han destilado en los pesos, de modo que no requiere instrucciones ni ejemplos en el prompt.

El modelo se obtiene por destilacion de secuencia desde Qwen/Qwen3.8-27B (27B, en modo razonamiento) sobre el dataset xaviviro/sintaxi-catala-destillada-4k, que contiene 975 ejemplos de entrenamiento. La salida cubre sujeto (incluido el eliptico), nucleo verbal, tipo de predicado, voz, impersonalidad y complementos (CD, CI, ATRIBUTO, CPRED, CRV, CAG y CC de tiempo, lugar, modo, cantidad, compania, instrumento, causa y finalidad).

Su relevancia es doble: por un lado, demuestra que un modelo de menos de mil millones de parametros puede internalizar una tarea linguistica estructurada mediante destilacion de un profesor grande; por otro, reduce el prompt de unos 580 tokens a unos 23-26 tokens y el tiempo por frase de 1712 ms a 11 ms en el hardware de referencia. Es un modelo de demostracion para una charla sobre modelos pequenos, no un sistema de produccion general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), tarea image-text-to-text; clase `AutoModelForImageTextToText` |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no detalla cuantizaciones) |
| Idiomas soportados | catalan (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de la familia Qwen3.5 con capacidad image-text-to-text, y se somete a un fine-tuning completo (no LoRA) durante 3 epocas con learning rate 2e-5 (coseno, 20 pasos de calentamiento), batch de 16, precision bf16 y perdida calculada unicamente sobre la respuesta, usando `SFTTrainer` de TRL. La entrada es unicamente la oracion como mensaje de usuario; la salida es el JSON del profesor sin razonamiento intermedio, de modo que el formato y la tarea quedan fijados en los pesos.

La innovacion tecnica principal es la destilacion de secuencia: se toman las salidas filtradas del profesor Qwen/Qwen3.8-27B (que razona antes de responder) y se entrena al modelo pequeno para imitarlas directamente. Esto elimina la necesidad de prompt con instrucciones y ejemplo, reduce drasticamente el coste de inferencia y traslada al modelo de 0,8B parte de la capacidad del profesor de 27B en esta tarea acotada. El dataset de entrenamiento es sintetico y derivado del profesor, con 975 ejemplos.

## Capacidades

- Generacion de analisis sintactico en JSON para oraciones simples en catalan, con la tarea y el formato destilados en los pesos (sin instrucciones ni ejemplos en el prompt).
- Identificacion de sujeto (incluido el eliptico) y su nucleo.
- Deteccion de nucleo verbal, tipo de predicado, voz (activa) e impersonalidad.
- Etiquetado de complementos: CD, CI, ATRIBUTO, CPRED, CRV, CAG y CC de tiempo, lugar, modo, cantidad, compania, instrumento, causa y finalidad.
- Generacion de texto conversacional basica heredada del modelo base (pipeline text-generation).
- Capacidad image-text-to-text heredada de la arquitectura Qwen3.5, aunque no se documenta su uso en esta ficha.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica explicitamente `enable_thinking=False` en el uso recomendado.
- Capacidades multilingues: limitadas al catalan (unico idioma declarado).

## Casos de uso

- Anotacion sintactica automatica de corpus escolares: el modelo procesa una oracion simple y devuelve el JSON con sujeto, predicado y complementos, lo que permite etiquetar grandes volumenes de ejercicios de gramatica catalana con coste minimo frente a un modelo grande.
- Herramienta educativa de correccion gramatical: integrado en una aplicacion de ensenanza, puede mostrar al alumno el analisis sintactico de una frase y compararlo con su respuesta, aprovechando que la salida es JSON estructurado y validable.
- Preprocesado linguistico en pipelines de PLN en catalan: como primer paso para tareas posteriores (extraccion de relaciones, generacion de preguntas, analisis de dependencias ligero) que necesiten una descomposicion sintactica rapida y barata.
- Despliegue en hardware modesto: con menos de 900 millones de parametros y un prompt de unos 23-26 tokens, cabe en GPUs de consumo y ofrece unos 11 ms por frase en lote con vLLM sobre una RTX PRO 6000 (96 GB), lo que lo hace apto para servicios con requisitos de latencia bajos.
- Generacion de datos sinteticos de sintaxis catalana: puede producir pares oracion-JSON para aumentar datasets de entrenamiento o evaluacion de otros modelos, siempre con revision posterior por los errores heredados del profesor.
- Prototipado e investigacion sobre destilacion: sirve como caso de estudio reproducible (codigo y notebook publicados en GitHub) para medir cuanto de una tarea estructurada se puede transferir de un profesor de 27B a un alumno de 0,8B.
- Filtrado y validacion de ejercicios en plataformas de aprendizaje de catalan: la salida JSON permite comprobar automaticamente si el analisis propuesto por el alumno coincide en sujeto, nucleo verbal y complementos.

## Benchmarks y rendimiento

Referencia manual de 30 oraciones anotadas a mano (hardware de medida: RTX PRO 6000 de 96 GB con vLLM en lote):

| Modelo | Analisis exacto | F1 complementos | Sujeto | Nucleo verbal | Salida valida | Tokens de prompt | ms/frase |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,0 % | 18,9 % | 53,3 % | 66,7 % | 53,3 % | 578 | 21 |
| Destilado 4k (solo la oracion) | 60,0 % | 77,4 % | 86,7 % | 90,0 % | 96,7 % | 23 | 11 |
| Qwen3.8-27B profesor (con prompt, razonando) | 93,3 % | 96,4 % | 100,0 % | 100,0 % | 100,0 % | 614 | 1712 |

Test de 300 oraciones con etiquetas del profesor filtradas (mide imitacion del profesor, no correccion absoluta):

| Modelo | Analisis exacto | F1 complementos | Sujeto | Nucleo verbal | Salida valida | Tokens de prompt |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,3 % | 10,1 % | 77,3 % | 64,3 % | 58,7 % | 581 |
| Destilado 4k (solo la oracion) | 86,7 % | 92,4 % | 98,3 % | 96,3 % | 96,0 % | 26 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 852.985.920 parametros, en bf16 los pesos ocupan aproximadamente 1,7 GB (tamano del repo), por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: el autor mide con una RTX PRO 6000 (96 GB) usando vLLM; por tamano, cualquier GPU consumer con al menos 4-8 GB de VRAM deberia poder alojar el modelo en bf16 o cuantizado.
- Cabe en GPU consumer: si, dado el tamano del modelo; no se especifican modelos concretos ni cuantizaciones probadas.
- Opciones de despliegue: transformers (`AutoModelForImageTextToText`), vLLM (`vllm serve xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k`); llama.cpp, Ollama y TGI no se mencionan en la informacion disponible.
- Latencia y throughput: 11 ms por frase en lote de 30 oraciones con vLLM en RTX PRO 6000 (96 GB); no es la latencia de una llamada aislada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Analisis exacto (ref. 30) | F1 complementos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-4k | 852.985.920 | no disponible | 60,0 % | 77,4 % | Apache 2.0 | Hugging Face |
| Qwen3.5-0.8B base (con prompt) | no disponible | no disponible | 0,0 % | 18,9 % | no disponible | Hugging Face |
| Qwen3.8-27B profesor (con prompt) | 27B (aproximado) | no disponible | 93,3 % | 96,4 % | no disponible | Hugging Face |
| Qwen3.5-0.8B-sintaxi-catala-10k | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face (version con dataset de 10k) |

## Limitaciones y advertencias

- Solo procesa oraciones simples; falla en funciones poco representadas en el dataset, como confundir el complemento predicativo con el CD (ejemplo: «Els avis envelleixen tranquils al poble»).
- En ocasiones no copia literalmente el texto de la oracion (ejemplo: «obeeixen» se convierte en «oboeyen»); hay que comprobar que los fragmentos sean literales antes de usarlos.
- Hereda los errores del profesor y el sesgo del dataset sintetico; no se ha evaluado con anotadores humanos externos.
- El test de 300 oraciones mide imitacion del profesor, no correccion absoluta, por lo que las cifras no deben interpretarse como calidad linguistica garantizada.
- Idioma limitado al catalan; no se documentan capacidades multilingues.
- El modelo esta pensado como demostracion para una charla sobre modelos pequenos, no como sistema de produccion general.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la exactitud del analisis.
- No se documentan sesgos sociales especificos; el riesgo de alucinacion se manifiesta como fragmentos inventados o mal copiados en la salida JSON.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k
- Dataset: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-4k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Version con dataset de 10k: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k
- Codigo y notebook: https://github.com/xaviviro/destillacio-sintaxi-catala
