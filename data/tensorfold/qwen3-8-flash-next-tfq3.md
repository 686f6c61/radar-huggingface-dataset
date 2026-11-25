# TensorFold/Qwen3.8-Flash-Next-TFQ3

## Resumen

Qwen3.8-Flash-Next-TFQ3 es una cuantización de 8 bits del modelo Qwen3.8-Flash-Next desarrollada por TensorFold, un proyecto que publica checkpoints optimizados para Apple Silicon. El modelo base pertenece a la familia Qwen y este checkpoint concreto está pensado para ejecutarse sobre Metal mediante un runtime nativo de TensorFold que lee ficheros `.tffpw` junto con los Safetensors. Con 56.687 millones de parámetros totales y un repositorio de 84,8 GB, se posiciona como un modelo grande de generación de texto orientado a despliegue local en hardware Apple de gama alta.

La relevancia de esta ficha radica en su propuesta de compresión: según la model card, TFQ3 reduce el peso medido a 78,99 GiB frente a los 189,04 GiB del checkpoint de origen en 8 bits y los 105,50 GiB de una cuantización MLX de 4 bits, manteniendo una perplejidad combinada de 5,996 (frente a 6,007 del 8-bit y 6,644 del MLX 4-bit). Es decir, presume de igualar la calidad del original con un 58,2 % menos de espacio en disco y de superar al 4-bit de MLX en un 9,8 % de perplejidad.

El checkpoint incluye la cabeza MTP (multi-token prediction) y está etiquetado como `qwen4_exp`, lo que sugiere una arquitectura experimental de la familia Qwen 4. La licencia es la Qwen Community License 1.0, lo que condiciona el uso comercial. No se dispone de información sobre idiomas soportados ni sobre benchmarks estándar en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen4_exp`; detalles no disponibles) con cabeza MTP |
| Parametros totales | 56.687.443.859 (56,69 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | 262.112 tokens (configuración del servidor de pruebas reportada) |
| Tipos de cuantizacion | TFQ3 (8 bits, formato propietario `.tffpw` + Safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | Safetensors + `.tffpw` (requiere runtime nativo TensorFold) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la etiqueta `qwen4_exp` y la presencia de una cabeza MTP (multi-token prediction), que permite decodificación especulativa multi-token. El modelo base es Qwen3.8-Flash-Next, de la familia Qwen, y este checkpoint es una cuantización del mismo, no un reentrenamiento: no se han publicado datos sobre tokens de entrenamiento, composición del dataset ni procesos de RLHF o DPO en la información proporcionada.

La innovación técnica destacable de este checkpoint es el esquema de cuantización TFQ3, que según el autor alcanza una perplejidad combinada de 5,996 sobre 2.004 tokens de evaluación en siete dominios (tres de ellos held-out), frente a 6,007 del 8-bit de origen y 6,644 del MLX 4-bit. El runtime aprovecha la cabeza MTP para decodificación especulativa: con profundidad 3 se alcanzan 154,5 tok/s en decodificación frente a 82,9 tok/s en decodificación de una sola fila, y el autor reporta coincidencia token a token entre profundidad 3 y profundidad 0 en este checkpoint.

## Capacidades

- Generación de texto conversacional y de propósito general (pipeline `text-generation`).
- Decodificación especulativa multi-token mediante la cabeza MTP, con profundidades configurables (probada profundidad 3).
- Procesamiento de contextos largos: el servidor de pruebas se configuró con 262.112 tokens de contexto.
- Ejecución local en Apple Silicon mediante Metal con el runtime nativo de TensorFold.
- Capacidades multilingües: no disponibles en la documentación.
- Soporte de tool calling, agentes, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en estaciones de trabajo Apple: el modelo puede mantener conversaciones multi-turno con contexto muy largo (hasta 262.112 tokens en la configuración probada) ejecutándose íntegramente en un Mac con chip M5 Ultra, sin depender de servicios en la nube.
- Generación de texto a alta velocidad en local: con MTP de profundidad 3 se alcanzan 154,5 tok/s de decodificación, adecuado para aplicaciones interactivas donde la latencia percibida importa, como chat en tiempo real o autocompletado.
- Procesamiento de documentos extensos: la ventana de contexto de 262.112 tokens permite ingerir libros, informes o bases de código completas en una sola pasada para resumen, extracción de información o preguntas y respuestas sobre el documento.
- Prototipado e investigación en hardware de consumo profesional: investigadores que necesitan un modelo de ~57 mil millones de parámetros en un equipo Apple pueden usar este checkpoint con 78,99 GiB de pesos, frente a los 189,04 GiB del 8-bit original, reduciendo requisitos de almacenamiento y memoria.
- Evaluación de pipelines de cuantización: el checkpoint sirve como referencia práctica para comparar TFQ3 frente a MLX 4-bit y 8-bit en tareas de generación de texto, con métricas de perplejidad publicadas sobre siete dominios.
- Servicio de inferencia local por streaming: el autor reporta 126–139 tok/s en streaming en vivo con MTP y copy drafting, lo que permite servir respuestas generadas en tiempo real a clientes locales en una red de desarrollo.

## Benchmarks y rendimiento

| Métrica | 8-bit origen | MLX 4-bit | TFQ3 |
|---|---:|---:|---:|
| Peso medido | 189,04 GiB | 105,50 GiB | 78,99 GiB |
| NLL / perplejidad, conjunto principal (1.670 tokens) | 1,7315 / 5,649 | 1,8324 / 6,249 | 1,7298 / 5,640 |
| NLL / perplejidad, held-out (334 tokens) | 2,1003 / 8,169 | 2,2006 / 9,031 | 2,0978 / 8,148 |
| Perplejidad combinada (2.004 tokens) | 6,007 | 6,644 | 5,996 |

| Prueba en Apple M5 Ultra | Resultado |
|---|---:|
| Prefill, prompt de 2.048 tokens | 3.855 tok/s |
| Decodificación de una sola fila | 82,9 tok/s |
| Decodificación con MTP profundidad 3 | 154,5 tok/s |
| Streaming en vivo con MTP y copy drafting | 126–139 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: los pesos TFQ3 ocupan 78,99 GiB, por lo que se necesita un equipo con al menos ~80 GiB de memoria unificada disponible, más overhead de contexto y runtime; el repositorio completo ocupa 84,8 GB en disco.
- GPU recomendadas: Apple M5 Ultra es el hardware de referencia en el que se publicaron las mediciones. No hay datos para A100, H100 ni RTX 4090, y el formato `.tffpw` está ligado al runtime nativo de TensorFold para Metal, por lo que no es desplegable directamente en GPU NVIDIA sin conversión.
- GPU de consumo: no cabe en GPUs de consumo convencionales (24 GB o menos); requiere hardware Apple de gama alta con memoria unificada amplia.
- Opciones de despliegue: exclusivamente el runtime nativo de TensorFold con soporte TFQ3 para Qwen3.8 Flash Next en Apple Silicon (Metal). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: prefill de 3.855 tok/s con prompt de 2.048 tokens; decodificación de 82,9 tok/s sin MTP y 154,5 tok/s con MTP profundidad 3; streaming en vivo de 126–139 tok/s en M5 Ultra.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Peso | Perplejidad combinada | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Qwen3.8-Flash-Next-TFQ3 | 56,69 mil M | 262.112 tokens (config. probada) | 78,99 GiB | 5,996 | Qwen Community 1.0 | Hugging Face (TensorFold) |
| Qwen3.8-Flash-Next (8-bit origen) | 56,69 mil M | no disponible | 189,04 GiB | 6,007 | Qwen Community 1.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash-Next MLX 4-bit | 56,69 mil M | no disponible | 105,50 GiB | 6,644 | Qwen Community 1.0 | no disponible en la información |

La comparativa se limita a las variantes del mismo modelo base documentadas en la model card; no se dispone de datos de modelos alternativos de otros fabricantes para contrastar.

## Limitaciones y advertencias

- Dependencia de runtime propietario: el checkpoint solo funciona con una build nativa de TensorFold con soporte TFQ3 para Qwen3.8 Flash Next en Apple Silicon (Metal); no es portable a otros motores de inferencia sin conversión.
- Requisito de memoria elevado: 78,99 GiB de pesos implican hardware Apple de gama alta (M5 Ultra o superior); no cabe en equipos de consumo convencionales.
- Idiomas soportados no documentados: no se puede confirmar cobertura multilingüe ni calidad por idioma.
- Sin benchmarks estándar publicados: las métricas disponibles son de perplejidad y velocidad, no de tareas (MMLU, HumanEval, GSM8K), por lo que la calidad en razonamiento, código o matemáticas no está verificada.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad ni de sesgos.
- Licencia Qwen Community License 1.0: impone condiciones al uso comercial que deben revisarse antes de desplegar en producción; el campo `license: other` en los metadatos exige consultar el fichero LICENSE del repositorio.
- Modelo experimental: la etiqueta `qwen4_exp` sugiere una arquitectura en fase experimental, con posible inestabilidad o cambios en el ecosistema de herramientas.
- Adopción mínima: 0 descargas y 3 likes en el momento de la consulta, lo que limita la validación comunitaria del checkpoint.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-TFQ3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Licencia (referenciada en el repositorio): https://huggingface.co/TensorFold/Qwen3.8-Flash-Next-TFQ3/blob/main/LICENSE
