# udgamlabs/Lilavati-GGUF

## Resumen

Lilavati-GGUF es la versión cuantizada en formato GGUF de Lilavati, un modelo de lenguaje de 95 millones de parámetros entrenado desde cero por Udgam Labs, especializado en resolver problemas matemáticos de enunciado (word problems). Su enfoque es distintivo: en lugar de razonar en texto plano, Lilavati genera un pequeño programa en Python que resuelve el problema, y un modelo acompañante de igual tamaño, Lilavati-Checker, puntúa la probabilidad de que cada programa generado sea correcto, permitiendo sistemas de votación entre múltiples intentos.

Este repositorio contiene ambos modelos (el solver y el checker) convertidos a GGUF con cuantización Q8_0, listos para ejecutarse con llama.cpp o incluso directamente en el navegador mediante WebAssembly (wllama). Con archivos de unos 102 MB cada uno, es un modelo "de bolsillo" que puede correr en hardware muy modesto, lo que lo hace relevante para despliegues en dispositivos con recursos limitados, educación y demostraciones embebidas.

La verificación de la conversión es rigurosa: los autores compararon los GGUF Q8_0 contra los pesos float32 originales en las primeras 100 preguntas de test de GSM8K, documentando que 95 de 100 programas dan la misma respuesta y que el checker cuantizado mantiene probabilidades casi idénticas (diferencia mediana de 0,0005). Es un ejemplo notable de transparencia en la publicación de modelos pequeños especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (entrenado desde cero); detalles completos en la model card del modelo base |
| Parametros totales | 94.732.876 (~95M) por cada uno de los dos modelos (solver y checker) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (Q8_0); los modelos originales se publican en safetensors (float32) |

## Arquitectura y entrenamiento

Lilavati es un modelo de 95M de parámetros entrenado desde cero (no es un fine-tuning de otro modelo) cuya tarea es, dado un problema matemático de enunciado, completar un prompt con una función Python que calcula la respuesta, cerrando el bloque con tres acentos graves. Este enfoque se denomina program-aided (PAL): la aritmética la ejecuta el intérprete de Python, no el modelo, lo que reduce drásticamente los errores de cálculo frente a la generación directa de números.

El segundo modelo, Lilavati-Checker, recibe como entrada la pregunta, el programa generado y su resultado (o el error producido), y emite una probabilidad de "yes" o "no" sobre si el programa es correcto. Combinando varios intentos del solver (por ejemplo, 8 o 48 muestreos) con los pesos del checker, se obtiene un sistema de votación ponderada que mejora la precisión. Los datos concretos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) no están disponibles en la model card de este repositorio; los autores remiten a la model card de Lilavati para resultados, datos y límites.

Los archivos GGUF se generaron con `convert_hf_to_gguf.py` de llama.cpp (commit `d7a695e`) con `--outtype q8_0`, es decir, una simple redondeo de los pesos float32 a 8 bits sin cambios adicionales.

## Capacidades

- Resolucion de problemas matematicos de enunciado de nivel de primaria (grade-school word problems), generando un programa Python que se ejecuta para obtener el resultado numerico.
- Sistema de verificacion mediante Lilavati-Checker, que puntua cada programa con una probabilidad de correccion y permite votacion ponderada entre multiples intentos (configuraciones de 8 y 48 intentos documentadas).
- Ejecucion en local con llama.cpp (modo completion, no conversacional) y en el navegador via wllama (llama.cpp compilado a WebAssembly), con ejecucion de los programas Python en Pyodide dentro de un Web Worker.
- Salida estructurada y determinista: con temperatura 0 y stop en ``` , el modelo cierra el programa de forma predecible.
- No es un chatbot: no mantiene conversaciones, no genera texto libre y esta especializado exclusivamente en su tarea.
- Idioma de trabajo: ingles (los enunciados y el codigo generado).

## Casos de uso

- Educacion matematica en primaria y secundaria: un profesor puede desplegar el modelo en el navegador (todo corre en el dispositivo del alumno) para generar soluciones paso a paso en forma de programa Python a problemas de enunciado, sin enviar datos a la nube.
- Aplicaciones web sin backend: gracias a wllama y Pyodide, se puede integrar la resolucion de problemas matematicos en una pagina web estatica, con los archivos GGUF de solo 102 MB cada uno.
- Dispositivos con recursos muy limitados: con ~95M de parametros y cuantizacion Q8_0, el modelo cabe en CPU sin GPU, adecuado para Raspberry Pi, portatiles antiguos o entornos edge.
- Verificacion de respuestas matematicas automaticas: Lilavati-Checker puede usarse de forma independiente para puntuar programas generados por otros sistemas, actuando como juez ligero en pipelines de auto-correccion.
- Generacion aumentada por programas (PAL) como patron de arquitectura: util como referencia para equipos que quieran estudiar como un modelo diminuto especializado puede superar en una tarea estrecha a modelos generales mucho mayores.
- Prototipado rapido con Ollama o LM Studio: aunque los autores no los han probado, el formato GGUF es compatible en principio con estas herramientas para experimentacion local.
- Procesamiento por lotes de enunciados matematicos: con temperatura 0 y parada en ```, se pueden resolver grandes volumenes de problemas de forma determinista en scripts.

## Benchmarks y rendimiento

La model card no publica tablas de benchmarks estandar completos, pero si documenta una verificacion sobre las primeras 100 preguntas de test de GSM8K [medida por los propios autores el 28 de octubre de 2026]:

| Configuracion | Resultado |
|---|---|
| Solver Q8_0, 1 programa greedy por pregunta (nativo llama.cpp) | 60 de 100 correctas (estimado a partir de "59 vs 60 correct" al comparar con float32) |
| Solver Q8_0 vs float32: programas identicos | 86 de 100 |
| Solver Q8_0 vs float32: misma respuesta final | 95 de 100 |
| Checker Q8_0 vs float32: diferencia de probabilidad | mediana 0,0005; maxima 0,036 |
| Votacion ponderada por checker (12 preguntas x 8 intentos) | misma respuesta que float32 en 12 de 12 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM: cada archivo GGUF ocupa 102 MB; en modo Q8_0 se necesita aproximadamente 150-200 MB de RAM por modelo cargado (mas el contexto). Ejecutando solver y checker a la vez, menos de 500 MB de RAM.
- GPU: no necesaria; el modelo esta pensado para ejecutarse en CPU. Cabe sobradamente en cualquier GPU consumer actual si se desea acelerar.
- Consumer: funciona en portatiles sin GPU dedicada; en el navegador (wllama + Pyodide) corre integramente en el dispositivo del usuario.
- Despliegue: llama.cpp (comando `llama-completion` con stop en ``` y temperatura 0), wllama para navegador, y en principio Ollama o LM Studio (no probados por los autores). El paquete Python `lilavati` (GitHub) incluye `safe_exec.py` para comprobar y ejecutar los programas de forma segura.
- Importante: ejecutar los programas Python generados solo dentro de un sandbox (el propio README lo exige; `safe_exec.py` o Pyodide con limite de tiempo son las opciones recomendadas).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay muchos modelos especializados en PAL de tamano comparable publicados con verificacion similar. Comparativa orientativa con alternativas generales pequenas:

| Modelo | Parametros | Especializacion | Contexto | Licencia | Disponibilidad GGUF |
|---|---|---|---|---|---|
| Lilavati / Lilavati-Checker | 95M (x2) | Problemas matematicos de enunciado via Python (PAL) | no disponible | Apache-2.0 | Si (Q8_0, este repo) |
| Qwen2.5-0.5B-Instruct | 494M | General (chat, codigo, matematicas) | 32K (aprox.) | Qwen (Apache-2.0 condicionado por tamano) | Si |
| SmolLM2-135M-Instruct | 135M | General ligero | 8K (aprox.) | Apache-2.0 | Si |

Nota: los valores de contexto y licencias de los modelos alternativos son aproximados y deben verificarse en sus model cards. La ventaja de Lilavati es su enfoque especializado con checker y su tamano minimo; su limitacion evidente es que no es un modelo de proposito general ni conversacional.

## Limitaciones y advertencias

- Dominio estrecho: solo es bueno en problemas de enunciado de nivel de primaria. Falla de forma documentada en: numeros que deberian ignorarse en el enunciado, problemas que exigen trabajar hacia atras, conversiones de unidades y preguntas sin respuesta (siempre devuelve un numero, aunque no lo haya).
- No es un chatbot: no sirve para conversacion, redaccion ni uso general; forzarlo fuera de su dominio producira salidas sin sentido.
- Riesgo de alucinacion: en su tarea lo mitiga el enfoque PAL (el calculo lo hace Python), pero el programa generado puede ser logicamente incorrecto aunque se ejecute sin errores; por eso se recomienda usar el checker con multiples intentos.
- Seguridad: los programas Python generados deben ejecutarse siempre en un sandbox; ejecutarlos directamente es peligroso.
- Idioma: entrenado para enunciados en ingles; no hay soporte para castellano ni otros idiomas.
- Deriva por cuantizacion: la version Q8_0 no es bit a bit identica a float32 (14 de 100 respuestas difieren en la verificacion); para maxima fidelidad usar los safetensors originales.
- Ollama y LM Studio no han sido probados por los autores.
- Licencia Apache-2.0: sin restricciones relevantes para uso comercial, pero conviene citar a los autores segun la bibtex proporcionada.
- Datos de contexto maximo, tokens de entrenamiento y composicion del dataset: no disponibles en este repositorio; consultar la model card de Lilavati.

## Enlaces

- Repositorio GGUF: https://huggingface.co/udgamlabs/Lilavati-GGUF
- Modelo base (solver): https://huggingface.co/udgamlabs/Lilavati
- Modelo checker: https://huggingface.co/udgamlabs/Lilavati-Checker
- Paquete Python con ejecucion segura: https://github.com/udgamlabs/lilavati
- Demo en el navegador: https://udgamlabs.com/models/lilavati
- Codigo de la demo (publico): `/models/lilavati/lilavati-solve.js` en udgamlabs.com
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
- Pyodide: https://pyodide.org
- Web de Udgam Labs: https://udgamlabs.com
