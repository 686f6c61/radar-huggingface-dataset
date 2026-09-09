# Vontra/Nex-N2.5-mini-MLX-8bit

## Resumen

Nex-N2.5-mini-MLX-8bit es una conversión comunitaria del modelo de visión y lenguaje Nex-N2.5-mini, desarrollado por el usuario Vontra para Apple Silicon. El checkpoint original es un modelo MoE (mixture-of-experts) de la familia Nex-N2.5 de Nex-AGI, diseñado para tareas agénticas de largo horizonte como el uso de ordenador y la navegación web. Esta variante cuantizada en 8 bits con MLX-VLM está pensada para ejecutarse de forma eficiente en Macs con chips Apple Silicon.

El modelo mantiene la arquitectura qwen3_5_moe del modelo base, con 35.107.181.936 parámetros totales, e incluye capacidades de visión (image-text-to-text) además de texto. La cuantización utiliza MLX-VLM con 8 bits de promedio por peso y grupo de 64, aunque algunos tensores multimodales conservan mayor precisión. Es una opción interesante para desarrolladores que quieran probar un modelo agéntico multimodal en macOS sin necesidad de hardware NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_moe (Mixture-of-Experts, vision-language) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit MLX (afin, grupo 64, ~8.596 bits por peso; algunos tensores multimodales de mayor precision) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX-VLM) |

## Arquitectura y entrenamiento

La arquitectura es qwen3_5_moe, un modelo basado en transformer con mezcla de expertos y capacidad multimodal. No se han publicado datos sobre el proceso de entrenamiento del modelo base por parte de Nex-AGI (numero de tokens, composicion del dataset, ni si se aplico RLHF/DPO). Esta variante es una cuantizacion del checkpoint BF16 original, realizada por Vontra con MLX-VLM. El proceso de conversion aplico cuantizacion afin a 8 bits con grupo 64, lo que resulto en un promedio de 8.596 bits por peso; los modulos multimodales quedaron excluidos de la cuantizacion por el heurístico por defecto de la herramienta.

Un detalle relevante es que el checkpoint BF16 original declara una capa MTP (multi-token prediction) en su configuracion, pero no contiene tensores MTP reales. Por tanto, esta conversion no soporta decodificacion MTP y se recomienda mantenerla desactivada.

## Capacidades

- Generacion de texto y razonamiento basico: probado con preguntas aritmeticas y generacion narrativa (una historia de 884 palabras dentro del rango solicitado).
- Generacion de codigo: se probo con cuatro peticiones de codigo; dos finalizaron correctamente y dos alcanzaron el limite de 4096 tokens.
- Vision (image-text-to-text): capaz de procesar imagenes; en las pruebas identifico correctamente una imagen roja sintetica.
- Soporte de tool calling / function calling: se forzo una llamada a una herramienta meteorologica con argumento "Paris"; el formato de la llamada fue valido, aunque no se ejecuto.
- Salida JSON estructurada: la prueba de formato JSON supero la validacion.
- Capacidades agénticas: el modelo base Nex-N2.5 esta orientado a tareas de largo horizonte como computer use y web browsing, segun el repositorio oficial. Esta cuantizacion no ha sido evaluada en esos escenarios.
- Soporte multilingue: no disponible en la informacion proporcionada.

## Casos de uso

- Asistente visual en Apple Silicon: permite analizar capturas de pantalla o imagenes directamente desde una Mac, aportando descripciones o respuestas a preguntas sobre el contenido visual. Adecuado por su pipeline image-text-to-text y por estar optimizado para MLX.
- Agentes con llamada a herramientas: puede integrarse en flujos que requieran invocar funciones externas, como consultas meteorologicas o APIs de terceros. La cuantizacion conserva el formato de tool calls, como se comprobo en las pruebas.
- Generacion de codigo asistida en local: util para desarrolladores que prefieren ejecutar un modelo de codigo sin salir de macOS. El modelo responde a peticiones de programacion, aunque conviene revisar los resultados porque algunas respuestas pueden quedar incompletas.
- Automatizacion de navegacion web y control de ordenador: aprovechando las capacidades agénticas del modelo base, se puede usar para tareas de largo horizonte en entornos simulados. No hay validacion especifica sobre esta cuantizacion, pero el modelo original esta diseñado para ello.
- Analisis de capturas de pantalla para soporte tecnico: puede describir errores visuales, interfaces o diagramas, y combinarlo con tool calling para generar informes. Su capacidad multimodal lo hace adecuado para este tipo de analisis.
- Chatbot multimodal de escritorio: integrable en aplicaciones como oMLX para mantener conversaciones con contexto e imagenes. La cuantizacion 8-bit permite una carga menor que el checkpoint BF16 y facilita el uso en estaciones de trabajo Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es un throughput de aproximadamente 77 a 81 tokens de salida por segundo en pruebas end-to-end realizadas por el autor de la conversion con oMLX 0.6.4. Esta cifra no es un benchmark controlado de decodificacion, ya que el estado de cache no estaba gestionado y las pruebas coincidieron con subidas a HuggingFace.

## Requisitos de hardware

- Entorno de ejecucion: Apple Silicon (MLX). No compatible con CUDA.
- Memoria: el checkpoint ocupa 37.7 GB en disco. Se necesita una Mac con memoria unificada suficiente para cargar el modelo y el contexto. El autor no ha medido el pico de memoria ni recomienda un rango especifico. Las pruebas se realizaron en una Mac Studio con 256 GiB de memoria unificada.
- GPU: cualquier Mac con chip M1, M2, M3 o M4 y suficiente RAM unificada; no se requiere GPU dedicada.
- Opciones de despliegue: oMLX 0.6.4 (probado), MLX-VLM, descarga directa con `hf download`. Tambien puede integrarse en aplicaciones que soporten modelos MLX.
- Latencia: alrededor de 77-81 tokens/s end-to-end en las pruebas del autor, con las condiciones descritas. No se dispone de mediciones separadas de latencia de prefill ni decode.

## Comparativa con modelos similares

No disponible. Esta ficha corresponde a una cuantizacion 8-bit de `nex-agi/Nex-N2.5-mini`. No se han encontrado datos comparativos con otros modelos de la misma categoria en la informacion proporcionada. Cualquier evaluacion deberia realizarse contra el checkpoint BF16 original, cuyos benchmarks no estan disponibles en esta conversion.

## Limitaciones y advertencias

- La cuantizacion 8-bit introduce perdida de precision. Los resultados del modelo base no se transfieren automaticamente a esta variante.
- El modelo declara una capa MTP en su configuracion, pero el checkpoint no contiene los tensores correspondientes. La decodificacion MTP no esta soportada y debe permanecer desactivada.
- No se ha verificado el rendimiento en contextos largos, conversaciones multi-turno ni en vision de mayor complejidad.
- Las llamadas a herramientas solo se comprobaron en formato, no se ejecutaron. Su comportamiento real en produccion no esta validado.
- En las pruebas de generacion de codigo, dos de cuatro peticiones alcanzaron el limite de 4096 tokens. Las respuestas pueden quedar incompletas y el codigo no fue ejecutado, solo verificado sintacticamente.
- No se han evaluado sesgos ni riesgos de alucinacion.
- La licencia Apache-2.0 permite uso comercial, pero esta es una conversion independiente de la comunidad. La atribucion a Nex-AGI y a Vontra debe mantenerse.
- Se recomienda usar los parametros de sampling indicados por el autor (temperatura 0.7, top_p 0.95, top_k 40) para evitar comportamientos de repeticion, especialmente si se usa decodificacion greedy.

## Enlaces

- https://huggingface.co/Vontra/Nex-N2.5-mini-MLX-8bit
- https://huggingface.co/nex-agi/Nex-N2.5-mini
- https://github.com/nex-agi/Nex-N2.5
- https://nex-agi.com/
- https://huggingface.co/Vontra
