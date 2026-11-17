# yeasah/Qwen3.8-27B-exl3

## Resumen

`yeasah/Qwen3.8-27B-exl3` es un conjunto de cuantizaciones EXL3 del modelo base Qwen/Qwen3.8-27B, publicado por el usuario yeasah. No se trata de un modelo entrenado desde cero, sino de una reempaquetación del checkpoint oficial de Qwen en distintos niveles de bits por peso (de 2,50 a 6,00 bpw), pensada para su uso con el motor de inferencia exllamav3 o con vLLM mediante el plugin `vllm-exl3-plugin`. El objetivo es ofrecer versiones del modelo que quepan en GPUs de consumo sin perder calidad de forma apreciable frente al original en bf16.

La relevancia de esta ficha radica en la metodología de cuantización: el autor calibra sobre texto que los modelos leen y escriben durante el trabajo real (documentos, salidas de herramientas, código, diffs y las propias respuestas del modelo), en lugar de sobre texto web genérico, y asigna bits por tensor según la sensibilidad medida. El repositorio incluye una tabla de calidad frente a tamaño con métricas de divergencia KL y perplejidad, además de una comparación con otras cuantizaciones del mismo modelo.

El pipeline declarado es `image-text-to-text`, lo que sugiere capacidades multimodales heredadas del modelo base, aunque la model card no detalla esta faceta. El tamaño total del repositorio es de 251,7 GB, correspondiente a todas las revisiones acumuladas; cada revisión individual ocupa entre 9,54 GiB y 19,75 GiB según el nivel de bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (heredada de Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el nombre indica 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 2,50, 3,00, 3,50, 4,00, 5,00 y 6,00 bpw; embedding de tokens tambien cuantizado |
| Idiomas soportados | no disponible (la model card menciona evaluaciones multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL3 (checkpoint compatible con exllamav3 y vLLM via plugin) |

## Arquitectura y entrenamiento

Esta ficha describe una cuantizacion, no un entrenamiento. El modelo subyacente es Qwen/Qwen3.8-27B, del que no se aportan detalles arquitectonicos en la informacion disponible (tipo de transformer, atencion, datos de entrenamiento, fases de RLHF o DPO). Lo que si se documenta es el proceso de cuantizacion EXL3: se asignan bits por tensor en funcion de la sensibilidad medida sobre las respuestas del propio modelo, manteniendo el mismo tamano total que una asignacion uniforme de bits. La calibracion se realiza sobre documentos y salidas de herramientas en conversaciones, codigo y diffs, y las propias respuestas del modelo, con el trabajo agéntico y de programacion como caso de uso principal.

La revision actual introduce tres cambios respecto a versiones anteriores: el embedding de tokens se almacena cuantizado (reduce entre 1,6 y 1,9 GiB en disco en cada tasa, sin coste medible de calidad), se redondea sin el factor del lado de salida que usaban las versiones previas y se anade un nivel de 2,50 bpw. La cuantizacion requiere exllamav3 1.6.4 o superior. La model card incluye una comparacion con las cuantizaciones de turboderp del mismo modelo, medida como ratio de KLD frente a una linea base no calibrada.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, sin detalles adicionales en la informacion disponible.
- Procesamiento de imagen y texto: el pipeline declarado es `image-text-to-text`, lo que indica soporte multimodal de entrada.
- Trabajo agéntico: la calibracion y las evaluaciones estan orientadas explicitamente a sesiones de agente reales (Open-SWE-Traces) y bucles de uso de herramientas.
- Generacion y edicion de codigo: la calibracion incluye codigo y diffs, y el caso de uso principal declarado es el trabajo de programacion.
- Uso de herramientas: las evaluaciones cubren bucles de tool-use y documentos como resultados de herramientas.
- Capacidades multilingues: se evalua una porcion de documentos multilingues, aunque no se enumeran los idiomas soportados.
- Modo de pensamiento (thinking): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente de programacion en local: las cuantizaciones de 3,00 a 4,00 bpw caben en GPUs de consumo con 12-16 GiB de VRAM y estan calibradas sobre codigo y diffs, por lo que son adecuadas para autocompletado, revision de parches y generacion de tests en el puesto de trabajo del desarrollador.
- Agentes autonomos con bucles de herramientas: la calibracion incluye sesiones de agente reales y salidas de herramientas, lo que reduce la degradacion en tareas de varios pasos como navegacion de repositorios o ejecucion de comandos.
- Procesamiento de documentos largos: la evaluacion cubre documentos en un turno de usuario y documentos como resultado de herramienta; el nivel de 5,00 o 6,00 bpw es el indicado cuando la fidelidad documental es critica.
- Despliegue en vLLM con el plugin exl3: permite servir el modelo en infraestructura existente de vLLM con un consumo de VRAM de 8,48 a 18,69 GiB segun la tasa, util para entornos con GPUs de 24 GiB.
- Analisis multimodal de imagenes y texto: al declarar el pipeline `image-text-to-text`, puede emplearse en tareas de descripcion de imagenes o extraccion de informacion de capturas, aunque la model card no detalla el rendimiento en esta faceta.
- Evaluacion comparativa de cuantizaciones: el repositorio publica metricas de KLD y perplejidad por nivel, lo que lo convierte en una referencia para equipos que necesitan elegir el punto de equilibrio entre VRAM y calidad antes de desplegar.

## Benchmarks y rendimiento

La model card no publica resultados de benchmarks estandar (MMLU, HumanEval, GSM8K). En su lugar, ofrece metricas de fidelidad de la cuantizacion frente al modelo sin cuantizar:

| BPW | Tamano en disco | VRAM (vLLM) | Excess KLD | Delta perplejidad |
|---|---|---|---|---|
| 2,50 | 9,54 GiB | 8,48 GiB | 0,0305 | +3,17% |
| 3,00 | 10,96 GiB | 9,90 GiB | 0,0136 | +1,42% |
| 3,50 | 12,37 GiB | 11,31 GiB | 0,0074 | +0,78% |
| 4,00 | 13,94 GiB | 12,88 GiB | 0,0037 | +0,37% |
| 5,00 | 16,92 GiB | 15,86 GiB | 0,0009 | +0,12% |
| 6,00 | 19,75 GiB | 18,69 GiB | 0,0002 | +0,04% |
| base (bf16) | 51,75 GiB | no disponible | 0 | 0 |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (vLLM): 8,48 GiB a 2,50 bpw; 9,90 GiB a 3,00 bpw; 11,31 GiB a 3,50 bpw; 12,88 GiB a 4,00 bpw; 15,86 GiB a 5,00 bpw; 18,69 GiB a 6,00 bpw. El consumo real puede ser inferior al tamano total del checkpoint segun la configuracion.
- GPUs recomendadas: RTX 4090 (24 GiB) admite todas las tasas hasta 6,00 bpw con margen para cache KV; RTX 4080 o 4070 Ti Super (16 GiB) admiten hasta 4,00 bpw con holgura y 5,00 bpw al limite; GPUs de 12 GiB admiten 3,00-3,50 bpw. Para A100 y H100 no hay datos especificos en la informacion disponible, aunque por capacidad admiten cualquier tasa.
- Cabe en GPU de consumo: si, desde 8,48 GiB de VRAM a 2,50 bpw.
- Opciones de despliegue: exllamav3 (version 1.6.4 o superior, obligatoria por el embedding cuantizado) y vLLM mediante `vllm-exl3-plugin`. No se menciona soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| yeasah/Qwen3.8-27B-exl3 | 27B (segun nombre) | no disponible | EXL3 (2,50-6,00 bpw) | Apache 2.0 | Calibracion orientada a agentes y codigo; embedding cuantizado; comparado favorablemente con turboderp en 2,50-5,00 bpw |
| turboderp/Qwen3.8-27B-exl3 | 27B (segun nombre) | no disponible | EXL3 | no disponible | Cuantizacion alternativa del mismo base; la model card reporta ratios de KLD de 0,67 a 0,96 frente a este conjunto |
| unsloth/Qwen3.8-27B-GGUF | 27B (segun nombre) | no disponible | GGUF | no disponible | Cuantizacion GGUF del mismo base, puntuada en los mismos ejes de calidad-tamano; compatible con llama.cpp |
| Qwen/Qwen3.8-27B-FP8 | 27B (segun nombre) | no disponible | FP8 | no disponible | Checkpoint oficial en FP8, usado como referencia en la grafica de calidad; puntuado con pesos desquantizados en bf16 |

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda todos los sesgos y limitaciones del modelo base Qwen3.8-27B, que no se documentan en la informacion disponible.
- Riesgo de alucinacion: presente como en cualquier modelo de lenguaje; la cuantizacion agrava la desviacion de la distribucion original, con un exceso de KLD de 0,0305 a 2,50 bpw frente a 0,0002 a 6,00 bpw.
- La calidad se degrada de forma medible en las tasas bajas: a 2,50 bpw la perplejidad sube un 3,17% y el peor segmento evaluado (la propia voz del modelo) empeora; no se recomienda para produccion con requisitos estrictos de fidelidad.
- Dependencia de version: el embedding cuantizado exige exllamav3 1.6.4 o superior; versiones anteriores no cargaran el checkpoint.
- Compatibilidad limitada: solo exllamav3 y vLLM con plugin; no hay soporte documentado para llama.cpp, Ollama, TGI ni otros motores.
- Idiomas soportados no documentados: aunque se evalua una porcion multilingue, no se enumeran los idiomas cubiertos ni su calidad relativa.
- Capacidades multimodales sin evaluar: el pipeline `image-text-to-text` se declara, pero no se aportan metricas de rendimiento en vision.
- Licencia Apache 2.0: permite uso comercial, pero el aviso de licencia del modelo base debe verificarse por separado.
- Las revisiones anteriores del repositorio estan obsoletas y permanecen solo en el historial de cada rama; no deben usarse para nuevos despliegues.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/yeasah/Qwen3.8-27B-exl3
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Commit del modelo base usado: https://huggingface.co/Qwen/Qwen3.8-27B/tree/1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0
- Motor exllamav3: https://github.com/turboderp-org/exllamav3
- Plugin vLLM para EXL3: https://github.com/yeasah/vllm-exl3-plugin
- Cuantizaciones GGUF de referencia: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Cuantizaciones EXL3 alternativas: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
- Checkpoint FP8 oficial: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Revision 2,50 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/2.50bpw-H5
- Revision 3,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/3.00bpw-H5
- Revision 3,50 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/3.50bpw-H5
- Revision 4,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/4.00bpw
- Revision 5,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/5.00bpw
- Revision 6,00 bpw: https://huggingface.co/yeasah/Qwen3.8-27B-exl3/tree/6.00bpw
