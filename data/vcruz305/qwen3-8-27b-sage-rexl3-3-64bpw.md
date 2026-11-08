# vcruz305/Qwen3.8-27B-SAGE-REXL3-3.64bpw

## Resumen

Qwen3.8-27B-SAGE-REXL3-3.64bpw es una cuantizacion en formato EXL3 (exllamav3) del modelo denso Qwen3.8-27B, publicado por el usuario vcruz305 en Hugging Face. El modelo base, desarrollado por el equipo Qwen de Alibaba, es un LLM denso nativo multimodal (vision-lenguaje) que entiende imagenes y videos, con control flexible del modo de razonamiento (thinking), orientado a tareas de codigo, flujos agenticos y automatizacion de oficina. Esta version concreta aplica una cuantizacion de 3,64 bits por peso para reducir el peso del repositorio a 14,7 GB, lo que facilita su despliegue en hardware local.

La relevancia de esta ficha radica en que permite ejecutar un modelo de la familia Qwen3.8 en GPUs de consumo o en servidores modestos mediante el runtime ExLlamaV3, manteniendo el pipeline de generacion de texto y conversacion del modelo original. El acceso esta restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar los pesos.

Conviene senalar una discrepancia importante: la model card declara el modelo base como Qwen3.8-27B, pero el recuento real de parametros de los safetensors es de 7.341.210.624 (aproximadamente 7,3 mil millones), no 27 mil millones. Esta ficha refleja ambos datos y advierte sobre la inconsistencia en la seccion de limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (vision-lenguaje), segun el modelo base Qwen3.8-27B; detalles internos de la cuantizacion EXL3 no disponibles |
| Parametros totales | 7.341.210.624 (segun safetensors); el nombre del modelo base indica 27B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 a 3,64 bits por peso (unica variante publicada en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato EXL3 (libreria exllamav3) |
| Tamano del repositorio | 14,7 GB |
| Acceso | restringido (gated), requiere aceptar condiciones |
| Modelo base | Qwen/Qwen3.8-27B |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es, segun la documentacion publica del repositorio oficial de Alibaba, un LLM denso nativo multimodal construido sobre la base arquitectonica de Qwen3.5. Incorpora comprension de imagenes y videos y un mecanismo de control flexible del razonamiento (thinking), pensado para sostener tareas complejas de multiples pasos. No se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF/DPO) en la informacion proporcionada.

Esta publicacion concreta no es un modelo entrenado desde cero, sino una conversion cuantizada: aplica el esquema EXL3 de ExLlamaV3 con 3,64 bits por peso sobre los pesos del modelo base. La innovacion tecnica relevante es, por tanto, la compresion a baja precision con el runtime ExLlamaV3, que permite reducir el espacio en VRAM a costa de una posible perdida de calidad frente a los pesos originales. No hay informacion sobre calibracion, metodos de cuantizacion especificos ni capas excluidas.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, tag conversational).
- Razonamiento con modo thinking controlable, heredado del modelo base Qwen3.8.
- Comprension de imagenes y videos (modelo nativo vision-lenguaje segun la documentacion del modelo base).
- Generacion de codigo y asistencia en tareas de programacion.
- Flujos agenticos y tareas de horizonte largo con multiples pasos.
- Automatizacion de tareas de oficina y trabajo profesional segun la model card del modelo base.
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para esta cuantizacion.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Asistencia de codigo en local: el modelo puede integrarse en editores o pipelines de CI/CD mediante ExLlamaV3 para autocompletado, revision de parches y generacion de tests, aprovechando su enfoque en tareas de programacion y su reducido peso de 14,7 GB.
- Automatizacion de oficina: redaccion de documentos, resumenes de reuniones y extraccion de datos de informes, apoyandose en las capacidades multimodales del modelo base para procesar capturas y documentos escaneados.
- Analisis de imagenes y video en entornos con requisitos de privacidad: al ejecutarse en hardware propio con ExLlamaV3, permite procesar contenido visual sensible sin enviarlo a APIs externas.
- Agentes de multiples pasos: tareas de investigacion y resolucion de problemas que requieren planificacion y uso de herramientas, con el modo thinking activado para mejorar la trazabilidad del razonamiento.
- Prototipado e investigacion: evaluacion de la familia Qwen3.8 en GPUs de consumo gracias a la cuantizacion a 3,64 bpw, sin necesidad de infraestructura de gran escala.
- Chatbot de soporte tecnico: conversaciones multi-turno con contexto conversacional, desplegable con ExLlamaV3 sobre una unica GPU.
- Generacion de codigo en produccion: su condicion de modelo denso y su licencia Apache 2.0 facilitan su integracion en herramientas internas, siempre que se valide la calidad tras la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales para esta cuantizacion ni para el modelo base en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 14,7 GB en disco; con overhead de contexto y cache KV, se recomienda al menos 16-18 GB de VRAM para el modelo en EXL3 a 3,64 bpw.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 Super (16 GB, ajustado), A100 40/80 GB, H100 para despliegues de mayor concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM, con margen limitado en el caso de 16 GB.
- Opciones de despliegue: ExLlamaV3 (runtime nativo del formato EXL3); no compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| Qwen3.8-27B-SAGE-REXL3-3.64bpw (esta ficha) | 7,34B declarados en safetensors; nombre indica 27B | no disponible | Si (segun modelo base) | Apache 2.0 | EXL3 / ExLlamaV3 |
| Qwen3.8-27B (modelo base) | 27B (segun nombre) | no disponible | Si | Apache 2.0 (segun tag del repositorio) | safetensors originales |
| Qwen3.5 (generacion anterior) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Discrepancia de parametros: los safetensors declaran 7.341.210.624 parametros, mientras que el nombre del modelo base indica 27B. Es necesario verificar la configuracion real antes de asumir capacidades o requisitos de memoria.
- Perdida de calidad por cuantizacion: la compresion a 3,64 bits por peso puede degradar el rendimiento en tareas de razonamiento, codigo y vision respecto a los pesos originales; no se han publicado evaluaciones que lo cuantifiquen.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face, lo que limita la automatizacion de descargas y el uso en entornos sin cuenta.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.
- Idiomas no declarados: la model card no especifica los idiomas soportados, por lo que el rendimiento en castellano no esta garantizado.
- Riesgo de alucinacion: inherente a los LLM; no hay documentacion especifica sobre mitigaciones en esta publicacion.
- Sesgos: no documentados en la informacion disponible.
- Compatibilidad de despliegue limitada: el formato EXL3 solo funciona con ExLlamaV3, lo que excluye los ecosistemas vLLM, TGI, llama.cpp y Ollama sin conversion previa.
- Licencia Apache 2.0: permite uso comercial, pero debe verificarse que la licencia del modelo base se mantenga en la cuantizacion.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/vcruz305/Qwen3.8-27B-SAGE-REXL3-3.64bpw
- Modelo base (referencia en Hugging Face): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio espejo consultado: https://huggingface.co/zhangyuwu/Qwen3.8-27B
- Repositorio oficial en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
