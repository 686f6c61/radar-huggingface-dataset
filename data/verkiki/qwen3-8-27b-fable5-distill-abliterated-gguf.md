# Verkiki/Qwen3.8-27b-Fable5-Distill-Abliterated-GGUF

## Resumen

Verkiki/Qwen3.8-27b-Fable5-Distill-Abliterated-GGUF es un modelo de lenguaje de 27 000 millones de parametros en formato GGUF cuantizado, resultado de fusionar dos derivados del modelo Qwen3.8-27B de Alibaba: la version "abliterated" de Blackfrost (que reduce la tendencia a rechazar peticiones) y el adaptador LoRA Fable5-Distill de TeichAI, entrenado sobre datos de chat y agentes del estilo Fable 5. El objetivo es combinar la menor tasa de rechazos del primero con las mejoras de razonamiento y planificacion del segundo, empaquetado en un archivo compacto para ejecucion local.

El modelo usa la arquitectura qwen3_5, es denso (no MoE) y esta pensado para tareas de codificacion, agentes, razonamiento y planificacion. La cuantizacion IQ4_XS con matriz de importancia post-fusion reduce el peso a 16,3 GB, lo que permite ejecutarlo en GPUs de consumo con 16-24 GB de VRAM. Se distribuye bajo licencia Apache 2.0 y esta orientado a desarrolladores que necesitan un modelo local con buenas capacidades de agente sin el coste de memoria de BF16 o Q8.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (transformer denso) |
| Parametros totales | 27B (segun denominacion del modelo; el campo de HuggingFace indica 460.730.096, inconsistente con la clase 27B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3.8-27B soporta 262 000 tokens segun fuentes externas |
| Tipos de cuantizacion | IQ4_XS (con imatrix post-fusion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de los pesos BF16 de Blackfrost-AI/Qwen3.8-27B-ABLITERATED, que a su vez es un derivado del Qwen3.8-27B original de Alibaba con un ajuste para reducir rechazos innecesarios. Sobre esa base se fusiona el adaptador LoRA TeichAI/Qwen3.8-27B-Fable-Distill-LoRA, entrenado sobre conjuntos publicos de chat y trazas de agentes estilo Fable 5, mas un corpus privado mayor del mismo tipo. No se trata de un trasplante entre versiones: el adaptador esta disenado especificamente para Qwen3.8-27B.

El resultado es un checkpoint fusionado que hereda las capacidades de razonamiento y planificacion del tune de TeichAI, manteniendo el caracter de baja tasa de rechazo del base abliterated. La cuantizacion final se realizo con IQ4_XS y una matriz de importancia generada despues de la fusion, calibrada sobre 582 bloques de 512 tokens (casi 300 000 posiciones de calibracion). El modelo soporta los controles de pensamiento de Qwen3.8: `enable_thinking` y `reasoning_effort` con valores low, medium y xhigh (por defecto xhigh).

## Capacidades

- Generacion de texto y razonamiento de proposito general, con mejoras medidas en tareas de razonamiento tipo ARC y comprension de instrucciones tipo BoolQ respecto al Qwen3.8-27B base.
- Planificacion y descomposicion de tareas en multiples pasos, gracias al entrenamiento con datos de agentes Fable 5.
- Codificacion y trabajo con repositorios multi-archivo: planificacion de cambios, depuracion, implementacion iterativa.
- Ejecucion de agentes y flujos de trabajo con herramientas (tool calling), orientado a bucles agente y tareas autonomas.
- Control de modo de pensamiento: permite activar o desactivar el razonamiento explicito y ajustar el esfuerzo de razonamiento.
- Capacidad multimodal del modelo base (Qwen3.8-27B incluye un encoder de vision), aunque el pipeline declarado es text-generation y no se confirma si el encoder se conserva en este GGUF.
- Multilingue: no hay informacion especifica para este derivado; el modelo base Qwen3.8-27B es multilingue, pero no se ha verificado en esta version.

## Casos de uso

- Agentes de codificacion autonomos: el modelo puede planificar cambios en un repositorio, editarlos y verificar el resultado, gracias a su entrenamiento en trazas de agentes y su soporte de tool calling. Adecuado para integrarse en entornos como OpenHands o scripts de automatizacion.
- Asistente de depuracion: dado un stack trace o un fallo de tests, el modelo puede descomponer el problema, proponer hipotesis y generar parches, manteniendo el contexto de multiples archivos.
- Refactorizacion de codigo a gran escala: con su ventana de contexto amplia (262k en el base), puede procesar proyectos completos y sugerir cambios estructurales, aunque la cuantizacion IQ4_XS puede afectar la precision en tareas muy largas.
- Planificacion de proyectos tecnicos: el modelo puede generar planes de implementacion con dependencias, hitos y comprobaciones, util para documentacion tecnica o guias de arquitectura.
- Automatizacion de tareas de investigacion: puede recopilar informacion, resumir articulos y proponer experimentos siguiendo un plan de varios pasos, con control de razonamiento para ajustar la profundidad.
- Prototipado rapido de herramientas de linea de comandos: genera scripts y comandos con explicaciones, aprovechando su capacidad de seguir instrucciones multi-paso.
- Uso local en entornos sin conexion: al ser un GGUF de 16,3 GB, puede ejecutarse en portatiles con GPU de 16 GB o en servidores con una sola GPU, sin depender de APIs externas.

## Benchmarks y rendimiento

La model card no publica resultados del modelo final fusionado y cuantizado. Los unicos datos disponibles son los de TeichAI para su modelo Qwen3.8-27B-Fable5-Distill (antes de fusionar con el base abliterated y de cuantizar):

| Benchmark | Qwen3.8-27B | Qwen3.8-27B Fable5-Distill | Ganancia |
|---|---:|---:|---:|
| ARC Challenge | 0.591 | 0.637 | +0.046 |
| ARC Challenge Easy | 0.782 | 0.832 | +0.050 |
| BoolQ | 0.896 | 0.911 | +0.015 |

Estos resultados son del adaptador sobre el modelo original, no del derivado final. El autor advierte que el checkpoint fusionado debe evaluarse por si mismo, ya que la combinacion con el base abliterated y la cuantizacion IQ4_XS pueden alterar el rendimiento. No se han publicado benchmarks propios para este GGUF.

## Requisitos de hardware

- Tamano del archivo: 16,3 GB (IQ4_XS). La VRAM necesaria para inferencia es aproximadamente 16-18 GB, dependiendo del contexto y del backend.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), A100 40 GB, o cualquier GPU con al menos 16 GB de VRAM. En GPUs con 12 GB puede ser posible con contexto reducido y offloading parcial de capas a CPU.
- En consumer GPU: si, cabe en RTX 4090, RTX 4080, RTX 3090, etc. Para portatiles con 16 GB puede funcionar con cuantizacion mas agresiva o contexto limitado.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama (puede importarse el GGUF), vLLM con soporte GGUF (experimental), text-generation-webui, llama-cpp-python.
- Latencia y throughput: no se han publicado mediciones para este modelo. Como referencia, un modelo de 27B en IQ4_XS en una RTX 4090 suele generar entre 20 y 40 tokens por segundo con llama.cpp, dependiendo del contexto y del numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27B | 262k | BF16, GGUF | Apache 2.0 | Modelo base, sin abliteracion ni distill |
| Blackfrost-AI/Qwen3.8-27B-ABLITERATED | 27B | 262k | BF16 | Apache 2.0 | Derivado con menor tasa de rechazo |
| TeichAI/Qwen3.8-27B-Fable-Distill | 27B | 262k | BF16, LoRA | Apache 2.0 | Tune con mejoras en ARC y BoolQ |
| Verkiki/Qwen3.8-27b-Fable5-Distill-Abliterated (este) | 27B | no disponible (base 262k) | IQ4_XS GGUF | Apache 2.0 | Fusion de los dos anteriores, cuantizado |

No se dispone de comparativas con modelos de otros fabricantes (como Llama 3.1 70B o Mistral Large) porque no hay benchmarks propios publicados.

## Limitaciones y advertencias

- El modelo es un derivado experimental: la combinacion de abliteracion y distill puede producir comportamientos impredecibles en tareas de seguridad o alineacion. La reduccion de rechazos puede implicar que el modelo genere contenido inapropiado si se le solicita explicitamente.
- No hay evaluacion propia del modelo final: los benchmarks de TeichAI corresponden al adaptador sobre el base original, no a este GGUF. La cuantizacion IQ4_XS y la fusion pueden degradar el rendimiento en tareas complejas.
- La informacion sobre parametros totales en HuggingFace es inconsistente (460.730.096 frente a la denominacion 27B); se recomienda verificar el modelo antes de usarlo en produccion.
- El soporte multimodal no esta confirmado: aunque el modelo base incluye un encoder de vision, el pipeline declarado es text-generation y no se ha verificado si el GGUF conserva esa capacidad.
- La longitud de contexto no se especifica en la model card; aunque el base soporta 262k, la cuantizacion y el backend pueden limitar el contexto util en la practica.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede tener restricciones adicionales derivadas de los datos de entrenamiento de los componentes (Fable 5, etc.) que no se detallan.
- El autor no proporciona garantias de rendimiento ni soporte; es un proyecto personal sin mantenimiento activo conocido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Verkiki/Qwen3.8-27b-Fable5-Distill-Abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/Blackfrost-AI/Qwen3.8-27B-ABLITERATED-BF16
- Adaptador LoRA Fable-Distill: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill-LoRA
- Modelo Fable-Distill completo: https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill
- Repositorio oficial Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Guia de ejecucion local (Ollama, GGUF): https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
