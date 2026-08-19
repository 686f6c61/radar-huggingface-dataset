# vmlinux/Qwen3.8-27B-AEON-ULTIMATE-ROCmFPX-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16`, publicado por el usuario AEON-7, que a su vez es una versión sin censura (uncensored) del modelo Qwen3.8-27B de Alibaba. El autor `vmlinux` ha aplicado la herramienta ROCmFPX para generar tres cuantizaciones experimentales (FP4, FP6 y FP8) optimizadas para hardware AMD con ROCm, usando una matriz de importancia (iMatrix) específica del modelo.

El modelo base Qwen3.8-27B es un transformer denso de 27 000 millones de parámetros con capacidades de visión y razonamiento, contexto nativo de 262 144 tokens y licencia Apache-2.0. Esta versión cuantizada está pensada para ejecutarse en GPUs AMD (especialmente Strix Halo) mediante una build de llama.cpp con soporte ROCmFPX, que no es compatible con el llama.cpp estándar. Es un trabajo de cuantización, no un nuevo entrenamiento; la autoría del modelo subyacente corresponde a Qwen y a AEON-7.

La relevancia de este repositorio radica en ofrecer pesos optimizados para el ecosistema AMD ROCm, un nicho menos cubierto que NVIDIA CUDA, y en incluir la cabecera MTP (multi-token prediction) nativa y el modo de pensamiento (thinking) activado por defecto mediante la plantilla de chat de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B), con cabecera MTP de una capa |
| Parametros totales | 27 000 millones (segun documentacion del modelo base; el dato de metadatos de HuggingFace, 3 391 984, parece erroneo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (modelo base); el ejemplo de invocacion usa 8192 tokens |
| Tipos de cuantizacion | ROCmFP4 (Q4_0_ROCMFP4), ROCmFP6 (Q6_0_ROCMFPX), ROCmFP8 (Q8_0_ROCMFPX) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 soporta principalmente ingles y chino, ademas de otros) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF con tipos de tensor ROCmFPX (no compatible con llama.cpp estandar) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atencion por ventanas deslizantes y atencion completa alternadas, disenado por Alibaba para tareas de razonamiento, vision y codigo. Incluye una cabecera MTP (multi-token prediction) de una capa que permite prediccion de multiples tokens en paralelo, acelerando la inferencia. El modelo original fue entrenado con un corpus masivo multilingue y posteriormente alineado mediante RLHF y tecnicas de razonamiento (thinking mode). La version de AEON-7 elimina las restricciones de censura del modelo original mediante un fine-tuning adicional, aunque no se han publicado detalles del proceso.

Este repositorio no modifica la arquitectura; solo aplica cuantizacion ROCmFPX, un formato de punto flotante de precision reducida disenado para GPUs AMD. La matriz de importancia se genero a partir de 339 fragmentos de 512 tokens de un corpus de calibracion compartido, y cada cuantizador consumio 496 entradas. Los tres archivos GGUF mantienen la cabecera MTP nativa y la plantilla de chat de Qwen con thinking habilitado por defecto.

## Capacidades

- Generacion de texto con modo de pensamiento (thinking) activado por defecto; se puede desactivar pasando los argumentos adecuados a la plantilla de chat.
- Razonamiento multi-paso y resolucion de problemas complejos gracias al entrenamiento del modelo base.
- Generacion de codigo y soporte de agentes (el modelo base Qwen3.8 destaca en tareas de coding agente).
- Capacidades de vision en el modelo base, aunque los pesos GGUF de este repositorio estan orientados a generacion de texto; no se ha verificado si la parte visual se conserva en la cuantizacion.
- Soporte de tool calling y function calling (heredado del modelo base).
- Multilingue limitado: principalmente ingles y chino, con menor rendimiento en otros idiomas.
- Inferencia acelerada en hardware AMD ROCm gracias a los tipos ROCmFPX.

## Casos de uso

- Ejecucion local en equipos con GPU AMD (Strix Halo, Radeon RX serie 7000): el formato ROCmFPX esta optimizado para ROCm, permitiendo desplegar un modelo de 27B en hardware AMD sin necesidad de CUDA.
- Asistente de codigo con razonamiento: el modelo puede generar, revisar y depurar codigo en multiples lenguajes, aprovechando su modo de pensamiento para tareas complejas de programacion.
- Chat sin censura en entornos controlados: la version "uncensored" de AEON-7 permite explorar temas que los modelos alineados rechazan, util en investigacion academica o simulacion de escenarios.
- Prototipado de agentes con tool calling: integrable en pipelines de automatizacion que requieran llamadas a funciones, consultas a APIs o ejecucion de acciones multi-paso.
- Analisis de documentos largos: con 262 144 tokens de contexto, puede procesar libros completos, informes extensos o codigo fuente de grandes repositorios.
- Investigacion sobre cuantizacion experimental: los tipos ROCmFPX son un banco de pruebas para estudiar el impacto de la precision reducida en GPUs AMD, comparando calidad y velocidad frente a cuantizaciones estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La cuantizacion ROCmFPX es experimental y no se aportan metricas de MMLU, HumanEval, GSM8K ni otras. El modelo base Qwen3.8-27B tiene resultados publicados por Alibaba, pero esta version cuantizada no los reproduce. Se recomienda evaluar el modelo en las tareas objetivo antes de usarlo en produccion.

## Requisitos de hardware

- Tamano de archivo: ROCmFP4 17,7 GB; ROCmFP6 22,5 GB; ROCmFP8 28,2 GB. La VRAM necesaria debe superar el tamano del archivo, mas overhead de contexto y buffers.
- GPU recomendadas: AMD Radeon RX 7900 XTX (24 GB) para ROCmFP4; Radeon PRO W7900 (48 GB) para ROCmFP6 o ROCmFP8; APUs Ryzen AI Max (Strix Halo) con 32-128 GB de memoria unificada.
- No es compatible con GPUs NVIDIA (los tipos ROCmFPX requieren ROCm).
- Despliegue: build de llama.cpp con soporte ROCmFPX (no la version estandar). No funciona con Ollama ni vLLM sin modificaciones.
- Rendimiento: no se han publicado mediciones de latencia o throughput para estas cuantizaciones. El blog de ofox.ai reporta 7,11 tok/s para el GGUF estandar de 4 bits del mismo modelo base en una configuracion con RAM+VRAM, pero los valores ROCmFPX pueden diferir.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262 144 | BF16, GGUF estandar | Apache-2.0 | Modelo base de referencia, con soporte CUDA y ROCm estandar |
| Qwen3.8-27B-AEON-ULTIMATE-ROCmFPX (este repo) | 27B | 262 144 (teorico) | ROCmFP4/6/8 | Apache-2.0 | Cuantizacion experimental solo AMD, sin censura |
| Qwen3-30B-A3B (MoE) | 30B total, 3B activos | 131 072 | GGUF estandar | Apache-2.0 | Alternativa MoE mas eficiente en inferencia, pero sin vision |

No se dispone de datos de rendimiento comparativo entre estas opciones en el contexto de ROCmFPX.

## Limitaciones y advertencias

- Los archivos GGUF solo cargan en builds de llama.cpp con soporte ROCmFPX; el llama.cpp estandar no los reconoce. Esto limita su uso a un ecosistema muy especifico.
- La cuantizacion experimental puede degradar la calidad de salida frente al BF16 original, especialmente en tareas de razonamiento complejo o codigo.
- El modelo "uncensored" puede generar contenido ofensivo, sesgado o peligroso; no es apto para aplicaciones comerciales sin filtros de seguridad adicionales.
- No se han verificado las capacidades de vision en los pesos cuantizados; es probable que la parte visual no funcione correctamente en el formato GGUF de texto.
- La licencia Apache-2.0 del modelo base se mantiene, pero el autor del repo advierte que se debe revisar la model card del modelo fuente antes de redistribuir.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un trabajo muy reciente y sin validacion comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vmlinux/Qwen3.8-27B-AEON-ULTIMATE-ROCmFPX-GGUF
- Modelo base (AEON-7): https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16
- Repositorio oficial Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Blog de AMD sobre soporte de Qwen3.8: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Guia de ejecucion local (ofox.ai): https://ofox.ai/blog/qwen-3-8-27b-run-locally-vram-gguf-2026/
- Documentacion de Unsloth para Qwen3.8: https://unsloth.ai/docs/models/qwen3.8
