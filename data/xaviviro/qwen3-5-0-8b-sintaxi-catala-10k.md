# xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k

## Resumen
Qwen3.5-0.8B-sintaxi-catala-10k es un modelo de 0,8B parámetros desarrollado por el usuario xaviviro, resultado de destilar el comportamiento de Qwen/Qwen3.8-27B (un modelo de 27B en modo razonamiento) sobre el modelo base Qwen/Qwen3.5-0.8B. El objetivo es muy concreto: dada una oración simple en catalán, devolver directamente su análisis sintáctico en formato JSON según la gramática escolar, sin instrucciones ni ejemplos en el prompt.

La tarea y el formato se han destilado en los pesos mediante un fine-tuning completo sobre el dataset xaviviro/sintaxi-catala-destillada-10k (3182 ejemplos de entrenamiento). La salida incluye sujeto (y si es elíptico), núcleo verbal, tipo de predicado, voz, impersonalidad y complementos (CD, CI, ATRIBUTO, CPRED, CRV, CAG y CC de tiempo, lugar, modo, cantidad, compañía, instrumento, causa y finalidad).

Es relevante como demostración práctica de que un modelo pequeño puede especializarse en una tarea estructurada concreta mediante destilación, reduciendo el prompt de ~580 tokens a ~23-26 tokens y manteniendo una precisión alta en la tarea. El modelo tiene 852.985.920 parámetros reales y un tamaño de repositorio de 1,7 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), fine-tuning completo sobre Qwen/Qwen3.5-0.8B |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | catalán (ca) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3.5-0.8B, un transformer de 0,8B parámetros, y se somete a un fine-tuning completo (no LoRA) durante 3 épocas con learning rate 2e-5 (cosine, 20 pasos de calentamiento), batch 16, bf16 y pérdida calculada solo sobre la respuesta, usando TRL SFTTrainer. La entrada es únicamente la oración como mensaje de usuario; la salida es el JSON del profesor sin razonamiento.

La innovación técnica es la destilación por secuencia: se entrena el modelo pequeño sobre las salidas filtradas del profesor Qwen3.8-27B en modo razonamiento, de forma que la tarea y el formato quedan codificados en los pesos y no requieren prompt de instrucciones ni ejemplos. El modelo base es multimodal (pipeline image-text-to-text en los tags), aunque la especialización se centra en texto.

## Capacidades
- Análisis sintáctico del catalán: dada una oración simple, genera JSON con sujeto (incluido elíptico), núcleo verbal, tipo de predicado, voz, impersonalidad y complementos.
- Clasificación de complementos: CD, CI, ATRIBUTO, CPRED, CRV, CAG y CC de tiempo, lugar, modo, cantidad, compañía, instrumento, causa y finalidad.
- Generación de texto estructurado en JSON válido (96,7 % de salidas válidas en la referencia manual de 30 oraciones).
- Funcionamiento sin prompt de instrucciones: el formato y la tarea están destilados en los pesos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (el modelo destilado no razona antes de responder).
- Capacidades multilingües: limitadas al catalán.
- Capacidades especiales: modo thinking desactivado en el uso previsto (enable_thinking=false); el modelo base es multimodal según los tags, pero no se documentan capacidades de visión en esta ficha.

## Casos de uso
- Anotación sintáctica automática de corpus catalanes: el modelo procesa oraciones simples y devuelve JSON estructurado, lo que permite generar árboles de análisis para corpus escolares o lingüísticos con un coste computacional muy bajo.
- Herramientas educativas de gramática: integrado en una aplicación de aprendizaje, puede analizar las oraciones que escribe el alumno y mostrar la función de cada complemento, gracias a su formato de salida fijo y validable.
- Preprocesamiento lingüístico en pipelines de NLP: sirve como etapa de análisis sintáctico ligero antes de tareas posteriores (extracción de relaciones, generación controlada) con un modelo de 0,8B desplegable en hardware modesto.
- Evaluación de correctores gramaticales: permite comprobar la estructura sintáctica de una oración para detectar errores de función (por ejemplo, confusión entre CD y CC) en sistemas de corrección del catalán.
- Demostración y docencia sobre destilación: el modelo y su notebook asociado sirven como ejemplo reproducible de destilación de un modelo de 27B a uno de 0,8B para una tarea estructurada.
- Procesamiento por lotes de bajo coste: con 11 ms/frase en lote sobre una RTX PRO 6000 y solo ~23-26 tokens de prompt, es adecuado para anotar grandes volúmenes de oraciones con vLLM.
- Clasificación de complementos en sistemas de extracción de información: la salida JSON con funciones sintácticas puede alimentar reglas de extracción de sujeto, objeto directo e indirecto en aplicaciones de análisis de texto catalán.

## Benchmarks y rendimiento

Referencia manual de 30 oraciones anotadas a mano:

| Modelo | Análisis exacto | F1 complementos | Sujeto | Núcleo verbal | Salida válida | Tokens de prompt | ms/frase |
|---|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,0 % | 18,9 % | 53,3 % | 66,7 % | 53,3 % | 578 | 21 |
| Destilado 4k (solo la oración) | 60,0 % | 77,4 % | 86,7 % | 90,0 % | 96,7 % | 23 | 11 |
| Destilado 10k (solo la oración) | 70,0 % | 80,7 % | 93,3 % | 90,0 % | 96,7 % | 23 | 11 |
| Qwen3.8-27B profesor (con prompt, razonando) | 93,3 % | 96,4 % | 100,0 % | 100,0 % | 100,0 % | 614 | 1712 |

Test de 300 oraciones (etiquetas del profesor, filtradas):

| Modelo | Análisis exacto | F1 complementos | Sujeto | Núcleo verbal | Salida válida | Tokens de prompt |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B base (con prompt) | 0,3 % | 10,1 % | 77,3 % | 64,3 % | 58,7 % | 581 |
| Destilado 4k (solo la oración) | 86,7 % | 92,4 % | 98,3 % | 96,3 % | 96,0 % | 26 |
| Destilado 10k (solo la oración) | 92,3 % | 94,4 % | 99,3 % | 98,0 % | 98,3 % | 26 |

Los tiempos en ms/frase se midieron procesando las 30 oraciones en lote con vLLM en una RTX PRO 6000 (96 GB); no representan la latencia de una llamada aislada. El test de 300 oraciones mide la imitación del profesor, no la corrección absoluta.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; con 852.985.920 parámetros, en bfloat16 los pesos ocupan aproximadamente 1,7 GB, más memoria para el contexto y el estado de inferencia.
- GPU recomendadas: el autor reporta mediciones en una RTX PRO 6000 (96 GB) con vLLM; no se documentan otras GPU.
- Cabe en GPU de consumo: sí, por tamaño de pesos (menos de 2 GB en bf16); no se especifican modelos concretos en la información disponible.
- Opciones de despliegue: transformers (AutoModelForImageTextToText) y vLLM (`vllm serve xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k`). No se documentan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 11 ms/frase en lote de 30 oraciones con vLLM en RTX PRO 6000; no se reporta throughput agregado ni latencia de llamada aislada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Análisis exacto (ref. 30) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-sintaxi-catala-10k | 852.985.920 | no disponible | 70,0 % | apache-2.0 | Hugging Face |
| Qwen3.5-0.8B-sintaxi-catala-4k | no disponible | no disponible | 60,0 % | no disponible | Hugging Face |
| Qwen3.5-0.8B base (con prompt) | no disponible | no disponible | 0,0 % | no disponible | Hugging Face |
| Qwen3.8-27B profesor (con prompt, razonando) | 27B (según nombre) | no disponible | 93,3 % | no disponible | Hugging Face |

La comparativa se limita a los modelos reportados por el autor; no se dispone de datos de otros modelos de análisis sintáctico del catalán en la información proporcionada.

## Limitaciones y advertencias
- Solo procesa oraciones simples; las oraciones complejas quedan fuera del alcance documentado.
- Las funciones poco representadas en el dataset (CRV y CC de cantidad) siguen siendo las más débiles.
- El complemento predicativo, que la versión 4k confundía con el CD, la versión 10k ya lo acierta en el ejemplo de «envelleixen tranquils», pero persisten errores en casos no vistos.
- En ocasiones no copia literalmente el texto de la oración: en el ejemplo «Els nens obeeixen els seus pares» genera el verbo «oboeixen», con estructura correcta pero error de transcripción.
- El test de 300 oraciones mide la imitación del profesor, no la corrección lingüística absoluta; los resultados de referencia manual se basan en solo 30 oraciones.
- Riesgo de alucinación en fragmentos inventados, documentado en ejemplos del modelo base y en la versión destilada.
- Idioma limitado al catalán; no se documentan capacidades multilingües.
- Licencia apache-2.0, que permite uso comercial, pero no se detallan restricciones adicionales en la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.
- El modelo está pensado como demostración para una charla sobre modelos pequeños; no se documenta su uso en producción a gran escala.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-10k
- Versión con dataset de 4k: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-4k
- Dataset: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-10k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Modelo profesor: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de código y notebook: https://github.com/xaviviro/destillacio-sintaxi-catala
