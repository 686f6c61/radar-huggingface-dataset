# yethdev/ornith-1.5-9b-manumit-v2-GGUF

## Resumen

El modelo yethdev/ornith-1.5-9b-manumit-v2-GGUF es una version cuantizada en formato GGUF del modelo ornith-1.5-9b-manumit-v2, desarrollado por yethdev. Se trata de una adaptacion del modelo base ornith-ai/Ornith-1.5-9B, un modelo de lenguaje de 8.953.803.264 parametros, al que se ha aplicado la tecnica manumit para eliminar el comportamiento de rechazo (refusal) del sistema. El resultado es un modelo que no rechaza prompts dañinos, manteniendo sus capacidades generales medidas en MMLU-Pro. La distribucion en GGUF permite ejecutarlo en CPU o GPU pequeñas mediante llama.cpp, Ollama o LM Studio, lo que facilita su uso local. Este modelo es relevante para investigadores que estudian mecanismos de seguridad y alineamiento, asi como para quienes necesitan una generacion de texto sin restricciones de seguridad, siempre bajo la responsabilidad del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (con terminos adicionales del modelo base) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura del modelo ni los datos de entrenamiento. Se sabe que el modelo base es ornith-ai/Ornith-1.5-9B, un modelo de lenguaje de 8.953.803.264 parametros. La innovacion principal es la tecnica manumit, que identifica las direcciones en el flujo residual que codifican el rechazo (refusal) y las proyecta fuera de los pesos del modelo. Posteriormente, el modelo se "cura" con datos ordinarios para que la ablacion no degrade sus capacidades. El resultado es un modelo sin rechazo pero con capacidades preservadas. Ademas, la cabeza de prediccion multi-token, que originalmente alimentaba la decodificacion especulativa automatica, no se incluye en estos pesos, por lo que no se pierde nada para la generacion normal.

## Capacidades

- Generacion de texto (pipeline text-generation) con pesos en formato GGUF.
- Rechazo (refusal) practicamente eliminado: 0.0% en AdvBench-test y 4.2% en JailbreakBench.
- Capacidad general medida en MMLU-Pro: 43.0%, igual que el modelo base.
- No incluye capa de seguridad ni modelo guardian; la salida no esta filtrada.
- Ejecucion local con llama.cpp, Ollama y LM Studio.
- Cuantizaciones disponibles: Q4_K_M, Q5_K_M y Q8_0.
- No se ha indicado soporte de tool calling, agentes, vision ni audio.

## Casos de uso

- Investigacion en seguridad y alineamiento: el modelo permite estudiar como la ablacion de direcciones residuales afecta al comportamiento de rechazo y a las capacidades generales, comparando con el modelo base.
- Evaluacion de tecnicas de interpretabilidad: la tecnica manumit expone direcciones en el flujo residual asociadas al rechazo, util para investigaciones sobre mecanismos de seguridad.
- Prototipado local sin dependencias de nube: gracias al formato GGUF, se puede ejecutar en CPU o GPU pequeñas con llama.cpp, ideal para pruebas rapidas en entornos sin acceso a APIs.
- Generacion de contenido creativo sin restricciones: el modelo no rechaza prompts, lo que permite explorar narrativas o temas que otros modelos censuran, siempre dentro del marco legal.
- Base para fine-tuning posterior: aunque el repositorio GGUF es para inferencia, el modelo base en safetensors esta disponible y puede usarse para ajustes personalizados con licencia MIT.
- Simulacion de personajes o juegos de rol: la ausencia de rechazo permite mantener conversaciones sin interrupciones por politicas de seguridad, adecuado para aplicaciones interactivas locales.

## Benchmarks y rendimiento

| Benchmark | Este modelo | Modelo base |
|---|---|---|
| AdvBench refusal | 0.0% | alto |
| JailbreakBench refusal | 4.2% | alto |
| MMLU-Pro (n=500) | 43.0% | 43.0% |

## Requisitos de hardware

- VRAM estimada: para Q4_K_M (5.6 GB) se recomienda al menos 6 GB de VRAM; para Q5_K_M (6.5 GB), al menos 8 GB; para Q8_0 (9.5 GB), al menos 12 GB. Estos valores son orientativos, ya que el tamaño del archivo no incluye overhead de ejecucion.
- GPU recomendadas: RTX 3060 o superior para Q4_K_M; RTX 4070 o superior para Q8_0. Tambien puede ejecutarse en CPU con llama.cpp, aunque con menor velocidad.
- Cabe en consumer GPU: si, especialmente Q4_K_M en GPUs de 6 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro software compatible con GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La comparacion mas directa es con el modelo base ornith-ai/Ornith-1.5-9B, del cual deriva. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Licencia | Refusal (AdvBench) | MMLU-Pro |
|---|---|---|---|---|---|
| ornith-ai/Ornith-1.5-9B (base) | no disponible | no disponible | no disponible | alto | 43.0% |
| yethdev/ornith-1.5-9b-manumit-v2-GGUF | 8.953.803.264 | no disponible | MIT | 0.0% | 43.0% |

## Limitaciones y advertencias

- No existe ninguna capa de seguridad ni modelo guardian; el modelo puede generar contenido dañino, ilegal o no etico. El usuario es el unico responsable de su uso.
- La eliminacion del rechazo puede afectar a comportamientos de seguridad no medidos en los benchmarks publicados.
- No se han evaluado otros benchmarks como HumanEval, GSM8K o tareas de codigo; el rendimiento en esos dominios es desconocido.
- Idiomas soportados no especificados; puede haber limitaciones en lenguajes distintos del ingles.
- Longitud de contexto no especificada; no se puede garantizar un rendimiento adecuado en tareas de contexto largo.
- La cabeza de prediccion multi-token no esta incluida, por lo que no se puede aprovechar la decodificacion especulativa automatica.
- La licencia MIT se aplica a esta adaptacion, pero el modelo base ornith-ai/Ornith-1.5-9B mantiene sus propios terminos; es necesario revisarlos antes de un uso comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yethdev/ornith-1.5-9b-manumit-v2-GGUF
- Modelo safetensors: https://huggingface.co/yethdev/ornith-1.5-9b-manumit-v2
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- No se han encontrado papers, blogs o demos adicionales en la busqueda web.
