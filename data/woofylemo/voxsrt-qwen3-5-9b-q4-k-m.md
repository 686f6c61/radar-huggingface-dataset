# WoofyLemo/VoxSRT-qwen3.5-9b-q4-k-m

## Resumen

VoxSRT-qwen3.5-9b-q4-k-m es un paquete de pesos en formato GGUF cuantizado a Q4_K_M del modelo Qwen/Qwen3.5-9B, preparado por el usuario WoofyLemo para su uso exclusivo en la aplicacion VoxSRT, una herramienta de transcripcion y subtitulado local. El repositorio no contiene ningun entrenamiento adicional: se trata de una conversion directa del snapshot oficial del modelo base mediante llama.cpp en su version b10549, con verificacion de integridad mediante hash SHA-256.

El modelo base, Qwen3.5-9B, es un transformer denso de 9.000 millones de parametros desarrollado por Alibaba Qwen, con una ventana de contexto nativa de 262.144 tokens y capacidades multimodales unificadas (vision y lenguaje). Esta cuantizacion Q4_K_M reduce el peso del modelo a aproximadamente 5,6 GB, lo que permite su ejecucion en hardware de consumo, aunque el paquete esta disenado especificamente para integrarse en el ecosistema VoxSRT, que gestiona la descarga, verificacion y almacenamiento local de los archivos.

La relevancia de este artefacto radica en su proposito: ofrecer un modelo de subtitulado y traduccion local con garantias de privacidad, ya que VoxSRT no envia a ningun servidor los archivos de audio, transcripciones o rutas locales. La licencia Apache-2.0 permite uso comercial y modificacion, aunque el paquete esta pensado como un componente inmutable dentro de la aplicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (9B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | Q4_K_M (unico en este repositorio) |
| Idiomas soportados | No disponible (el modelo base soporta multiples idiomas, pero no se especifican en este repositorio) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-9B es un transformer denso con atencion por ventanas deslizantes y mecanismos de atencion con soporte para contexto largo (262.144 tokens). Segun la informacion publica de Qwen, incorpora entrenamiento temprano de fusion multimodal (vision-lenguaje) que le permite procesar tanto texto como imagenes, con un rendimiento comparable o superior a la serie Qwen3-VL en tareas de razonamiento, codigo, agentes y comprension visual. El entrenamiento incluye fases de preentrenamiento a gran escala y ajuste fino con aprendizaje por refuerzo (RL), aunque los detalles exactos del dataset no se detallan en la documentacion disponible.

Este repositorio concreto no anade ninguna innovacion tecnica: es una conversion a GGUF Q4_K_M realizada con llama.cpp b10549, sin modificaciones de pesos ni datos de entrenamiento adicionales. La cuantizacion Q4_K_M es un esquema de cuantizacion mixta que mantiene una buena relacion calidad-tamano, comunmente usado para inferencia en CPU y GPU de consumo.

## Capacidades

- Generacion de texto y razonamiento: el modelo base soporta tareas de lenguaje natural, incluyendo razonamiento logico y matematico.
- Codigo: capacidad de generacion y comprension de codigo en multiples lenguajes de programacion.
- Vision: el modelo base Qwen3.5-9B es multimodal, capaz de procesar imagenes junto con texto (aunque esta cuantizacion GGUF puede requerir un runtime compatible con multimodalidad).
- Tool calling y function calling: soportado por el modelo base, util para integraciones con APIs y agentes.
- Agentes y razonamiento multi-paso: el modelo base esta optimizado para tareas de agente y planificacion.
- Multilingue: el modelo base soporta multiples idiomas, aunque no se especifican en este repositorio.
- Subtitulado y traduccion: el proposito declarado de este paquete es la transcripcion, alineacion, correccion y traduccion de subtitulos en VoxSRT.

## Casos de uso

- Transcripcion local de audio a subtitulos: VoxSRT utiliza este modelo para convertir audio en transcripciones sincronizadas, aprovechando la ventana de contexto larga para mantener coherencia en conversaciones extensas.
- Traduccion de subtitulos: el modelo puede traducir subtitulos entre idiomas, manteniendo el contexto de la escena gracias a su capacidad de procesar secuencias largas.
- Correccion de subtitulos generados automaticamente: se puede usar para revisar y corregir errores de transcripcion previa, mejorando la precision final.
- Alineacion temporal de subtitulos: el modelo ayuda a ajustar los tiempos de los subtitulos con el audio, una tarea que requiere comprension del contenido.
- Asistente de doblaje o localizacion: en flujos de trabajo de localizacion de video, el modelo puede generar traducciones adaptadas al contexto cultural.
- Inferencia local con privacidad: al ejecutarse en local, es adecuado para entornos donde los datos de audio o transcripciones no pueden salir del dispositivo (por ejemplo, estudios legales o medicos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion Q4_K_M en la informacion disponible. El modelo base Qwen3.5-9B tiene benchmarks publicados en su pagina de HuggingFace (razonamiento, codigo, agentes y comprension visual), pero no se incluyen en este repositorio. Se recomienda consultar la documentacion oficial de Qwen para obtener datos comparativos.

## Requisitos de hardware

- VRAM estimada para inferencia: con Q4_K_M y 5,6 GB de peso, se requiere aproximadamente 6-7 GB de VRAM para cargar el modelo completo en GPU, o unos 8-10 GB de RAM si se ejecuta en CPU con offloading parcial.
- GPU recomendadas: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3060/4060, RTX 4070, o superiores. Tambien es viable en Apple Silicon con 16 GB unificados.
- Compatibilidad con GPU de consumo: si, cabe en GPUs de gama media y alta de consumo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y el runtime integrado de VoxSRT. No se menciona soporte para vLLM o TGI en este repositorio, aunque el formato GGUF es compatible con llama.cpp y derivados.
- Latencia y throughput: no disponible en la informacion proporcionada. Dependera del hardware y del runtime utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WoofyLemo/VoxSRT-qwen3.5-9b-q4-k-m | 9B | 262.144 | Apache-2.0 | GGUF Q4_K_M | Paquete para VoxSRT, sin entrenamiento adicional |
| unsloth/Qwen3.5-9B-GGUF | 9B | 262.144 | Apache-2.0 | GGUF (varias cuantizaciones) | Cuantizaciones alternativas, incluye Q4_K_XL |
| Qwen/Qwen3.5-9B (original) | 9B | 262.144 | Apache-2.0 | safetensors | Modelo base sin cuantizar, requiere mas VRAM |

La comparativa se limita a variantes del mismo modelo base. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estas versiones.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base puede heredar sesgos presentes en sus datos de entrenamiento, aunque no se documentan especificamente en este repositorio.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en tareas de traduccion o transcripcion con audio de baja calidad.
- Limitaciones de contexto: aunque el modelo base soporta 262.144 tokens, la cuantizacion Q4_K_M puede degradar ligeramente la calidad en tareas que requieren maxima precision, y el rendimiento con contexto muy largo depende del hardware.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el paquete esta disenado para VoxSRT; su uso fuera de esa aplicacion puede requerir adaptaciones tecnicas.
- Caveat de produccion: la verificacion de integridad (SHA-256) garantiza la identidad del artefacto, pero no certifica calidad, rendimiento ni compatibilidad con todos los sistemas Windows o Microsoft Store.
- Idiomas: no se especifican los idiomas soportados en este repositorio; se asume que hereda los del modelo base, pero no hay confirmacion explicita.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WoofyLemo/VoxSRT-qwen3.5-9b-q4-k-m
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Cuantizacion alternativa de unsloth: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
- Pagina de Qwen3.5 en Ollama: https://ollama.com/library/qwen3.5:9b
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-9b
- Cuantizacion Q4_K_M en ModelScope: https://www.modelscope.cn/models/diodel/Qwen3.5-9B-Q4_K_M-GGUF
