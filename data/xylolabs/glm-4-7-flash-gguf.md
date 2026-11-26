# Xylolabs/GLM-4.7-Flash-GGUF

## Resumen

GLM-4.7-Flash-GGUF es una cuantizacion en formato GGUF del modelo zai-org/GLM-4.7-Flash, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base pertenece a la familia GLM-4 de Zhipu AI (organizacion zai-org en Hugging Face) y esta orientado a generacion de texto conversacional. Esta publicacion concreta no es un modelo nuevo, sino una distribucion de pesos cuantizados que reduce el peso del modelo original de aproximadamente 31.200 millones de parametros a ficheros de entre 16,7 y 16,9 GB en cuantizacion IQ4_XS.

La relevancia de esta ficha radica en que permite ejecutar un modelo de ~31B en GPUs de consumo como la RTX 4090 o la RTX 3090 (24 GB de VRAM), manteniendo una ventana de contexto de hasta 128K tokens en hardware con suficiente memoria. El repositorio incluye dos variantes: IQ4_XS estandar e IQ4_XS con calibracion imatrix, ademas de una tabla comparativa de divergencia KL frente a BF16 que cubre mas de 30 cuantizaciones distintas (propias y de terceros como Unsloth o llama.cpp).

La licencia declarada es MIT, lo que facilita el uso comercial, aunque conviene verificar las condiciones del modelo base. El modelo esta etiquetado para ingles y coreano, y su formato GGUF lo hace compatible con el ecosistema llama.cpp, incluyendo llama-cli y llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base GLM-4.7-Flash; familia GLM-4, transformer) |
| Parametros totales | 31.221.488.576 (~31,2B) |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 128K tokens (segun tabla de hardware del autor); 32K en GPUs de 24 GB |
| Tipos de cuantizacion | IQ4_XS e IQ4_XS-imatrix (en este repo); el autor compara ademas Q2 a Q8, UD-*, MXFP4_MOE de Unsloth y llama.cpp |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (para llama.cpp) |
| Tamano del repo | 33,6 GB |
| Tamano de ficheros | IQ4_XS: 16,876 GB; IQ4_XS-imat: 16,713 GB |
| Commit de llama.cpp verificado | cd959bae99ff4bed22bef2604f45241c09bbb8c8 |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna ni el proceso de entrenamiento del modelo base en la informacion proporcionada. La model card de esta cuantizacion no describe la arquitectura (transformer denso o MoE), el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. El nombre "Flash" sugiere una variante optimizada para eficiencia dentro de la familia GLM-4.7, pero no se confirma ningun detalle tecnico al respecto.

Lo que si documenta el autor es el proceso de cuantizacion: se han generado pesos IQ4_XS con y sin calibracion imatrix, y se ha medido la fidelidad frente al modelo en BF16 mediante divergencia KL sobre WikiText-2 y sobre un conjunto held-out, ademas de la tasa de coincidencia top-1. La variante con imatrix presenta una KL ligeramente superior en WikiText-2 (0,116921 frente a 0,104733) pero un tamano algo menor (16,713 GB frente a 16,876 GB), lo que indica que la calibracion imatrix no mejora de forma uniforme la fidelidad en este caso concreto.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` del repositorio.
- Compatibilidad con plantillas de chat mediante el flag `--jinja` de llama.cpp, lo que permite usar el formato de prompt del modelo base.
- Ejecucion en llama.cpp sobre CUDA, Metal y CPU, con soporte de `llama-cli` y `llama-server`.
- Soporte de contexto largo: hasta 128K tokens en hardware con memoria suficiente (segun la tabla del autor).
- Capacidades multilingues limitadas a ingles y coreano segun los metadatos del modelo.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Asistente conversacional autoalojado: desplegando `llama-server` con el fichero IQ4_XS en una RTX 4090 (24 GB), se puede servir un chatbot multi-turno con hasta 32K tokens de contexto sin depender de APIs externas, adecuado para entornos con requisitos de privacidad.
- Procesamiento de documentos largos en local: con 128K tokens de contexto en GPUs de 48 GB o superiores (RTX 6000 Ada, H100, Mac Studio con memoria unificada), el modelo puede resumir o extraer informacion de contratos, informes o expedientes extensos en una sola pasada.
- Prototipado rapido en estaciones de trabajo con CPU: el formato GGUF permite ejecutar el modelo sin GPU usando llama.cpp, lo que sirve para validar prompts y flujos conversacionales antes de invertir en hardware.
- Analisis de texto en ingles y coreano: el modelo esta etiquetado para ambos idiomas, por lo que resulta util para tareas de traduccion asistida, resumen o clasificacion en entornos bilingues ingles-coreano.
- Despliegue en infraestructura Apple Silicon: la tabla del autor confirma soporte en Mac Studio M5 Max y M5 Ultra con memoria unificada de 128 a 512 GB, lo que permite ejecutar el modelo con contexto completo en equipos de sobremesa.
- Evaluacion comparativa de cuantizaciones: la tabla de divergencia KL incluida permite a investigadores elegir el equilibrio entre tamano y fidelidad; por ejemplo, para entornos con 16 GB de VRAM el IQ4_XS es la opcion documentada, mientras que para maxima fidelidad se puede recurrir a Q8_0 (33,2 GB).
- Integracion en pipelines de generacion de texto por lotes: mediante la API de `llama-server` se puede automatizar la generacion de descripciones, respuestas o borradores sobre grandes volumenes de texto en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor unicamente proporciona metricas de fidelidad de cuantizacion frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | Top-1 | Held-out KL | Top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 33,201 GB | 0,012020 | 96,578% | 0,032733 | 96,363% |
| Unsloth UD-Q6_K_XL | 26,175 GB | 0,022205 | 96,044% | 0,045145 | 95,696% |
| Unsloth UD-Q5_K_XL | 21,694 GB | 0,040672 | 93,779% | 0,040725 | 94,088% |
| Unsloth Q4_K_M | 18,312 GB | 0,071742 | 90,451% | 0,089063 | 90,539% |
| **IQ4_XS (este repo)** | **16,876 GB** | **0,104733** | **87,230%** | **0,112765** | **88,069%** |
| **IQ4_XS-imat (este repo)** | **16,713 GB** | **0,116921** | **87,593%** | **0,161118** | **87,490%** |
| Unsloth IQ4_XS | 16,271 GB | 0,183993 | 89,172% | 0,075812 | 90,039% |
| llama.cpp Q3_K_M | 14,984 GB | 0,373296 | 79,897% | 0,244977 | 82,029% |

Las cifras muestran que el IQ4_XS de este repositorio queda por detras del Q4_K_M de Unsloth en fidelidad (KL de 0,104733 frente a 0,071742 en WikiText-2) a costa de un fichero ligeramente menor, y que el Unsloth IQ4_XS, pese a ser mas pequeno (16,271 GB), obtiene mejor KL en el conjunto held-out (0,075812 frente a 0,112765). No se proporcionan datos de latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 17 GB para el fichero IQ4_XS, mas la memoria necesaria para el contexto KV; el autor indica 32K de contexto en GPUs de 24 GB y 128K en GPUs de 48 GB o mas.
- GPUs recomendadas segun el autor: RTX 4090 y RTX 3090 (24 GB, contexto 32K); RTX 5090 (32 GB, 128K); RTX 6000 Ada o 2 x 24 GB (48 GB, 128K); H100 (80 GB, 128K); RTX PRO 6000 Blackwell (96 GB, 128K); H200 (141 GB, 128K); B200 (192 GB, 128K); B300 (288 GB, 128K).
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 con contexto de 32K, y en RTX 5090 con contexto de 128K.
- Memoria unificada: soportado en DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256 y 512 GB), todos con contexto de 128K.
- Opciones de despliegue: llama.cpp (compilado con `-DGGML_CUDA=ON` para NVIDIA), mediante `llama-cli` o `llama-server`; verificado con el commit `cd959bae99ff4bed22bef2604f45241c09bbb8c8`. No se documentan otras opciones como vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparativas con otros modelos de la misma categoria mas alla de las distintas cuantizaciones del propio GLM-4.7-Flash. Se puede comparar, no obstante, el equilibrio tamano-fidelidad de las cuantizaciones del ecosistema:

| Variante | Tamano | WikiText-2 KL | Held-out KL | Licencia |
|---|---:|---:|---:|---|
| llama.cpp Q8_0 | 33,201 GB | 0,012020 | 0,032733 | MIT (derivada) |
| Unsloth UD-Q5_K_XL | 21,694 GB | 0,040672 | 0,040725 | MIT (derivada) |
| Unsloth Q4_K_M | 18,312 GB | 0,071742 | 0,089063 | MIT (derivada) |
| IQ4_XS (Xylolabs) | 16,876 GB | 0,104733 | 0,112765 | MIT |
| Unsloth IQ4_XS | 16,271 GB | 0,183993 | 0,075812 | MIT (derivada) |

Comparativa con modelos alternativos de ~30B (parametros, contexto, rendimiento, licencia y disponibilidad): no disponible.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos del modelo base; al tratarse de un modelo entrenado con datos web, es previsible que herede sesgos de esos corpus, aunque no se cuantifican.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones de factualidad en la informacion disponible.
- Idiomas soportados limitados a ingles y coreano segun los metadatos; el rendimiento en castellano no esta verificado ni documentado.
- La cuantizacion IQ4_XS introduce perdida de fidelidad medible: 87,230% de coincidencia top-1 en WikiText-2 frente a 96,578% del Q8_0, con una KL de 0,104733. Para tareas sensibles a la precision puede ser preferible una cuantizacion mayor.
- La variante imatrix de este repositorio no mejora la fidelidad frente a la IQ4_XS estandar en las metricas publicadas (KL de 0,116921 frente a 0,104733 en WikiText-2), por lo que la eleccion entre ambas debe basarse en pruebas propias.
- La licencia del repositorio es MIT, pero conviene verificar la licencia y condiciones del modelo base zai-org/GLM-4.7-Flash antes de un uso comercial, ya que la model card no detalla restricciones adicionales.
- El contexto de 128K solo es alcanzable en hardware con 48 GB o mas de memoria; en GPUs de 24 GB el autor limita el contexto a 32K.
- El despliegue esta verificado con un commit concreto de llama.cpp; otras versiones pueden requerir ajustes de compatibilidad.
- No se documentan capacidades de tool calling ni de agentes, lo que limita su uso en pipelines que dependan de function calling.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Licencia en el repositorio: https://huggingface.co/Xylolabs/GLM-4.7-Flash-GGUF/blob/main/LICENSE
- llama.cpp (commit verificado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
