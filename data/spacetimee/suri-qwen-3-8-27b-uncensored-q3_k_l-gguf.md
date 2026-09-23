# SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_L-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-Q3_K_L-GGUF es una version cuantizada en formato GGUF del modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored, publicada por el propio autor SpaceTimee. La conversion se ha realizado con llama.cpp a traves del espacio GGUF-my-repo de ggml.ai, un flujo automatico que transforma los pesos originales (safetensors) en ficheros GGUF listos para inferencia con llama.cpp y herramientas compatibles con llama-cpp.

El modelo base cuenta con 26.895.998.464 parametros (aproximadamente 26,9B), lo que lo situa en la gama de modelos densos de gran tamano. La denominacion "Uncensored" indica que se ha reducido o eliminado el alineamiento de seguridad del modelo de partida. El repositorio ocupa 14,3 GB e incluye una unica cuantizacion, Q3_K_L.

Su relevancia es fundamentalmente practica: permite ejecutar un modelo de ~27B en hardware de consumo o en equipos sin GPU de datacenter, a cambio de una perdida de precision respecto al modelo original en coma flotante. No se dispone de informacion sobre licencia, idiomas, longitud de contexto, arquitectura ni datos de entrenamiento del modelo base; el nombre sugiere un linaje de la familia Qwen, pero esto no se confirma en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplicable (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q3_K_L (unica cuantizacion presente en este repositorio) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del repositorio | 14,3 GB |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Fecha de publicacion | 23 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base. El recuento real de parametros (26.895.998.464) corresponde a los tensores en safetensors del modelo original y es compatible con un transformer denso, pero no se indica si emplea mecanismos adicionales como atencion lineal, mezcla de expertos (MoE) o arquitecturas hibridas. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o fine-tuning supervisado.

La unica innovacion tecnica documentada en esta ficha es la propia conversion a GGUF, realizada con llama.cpp mediante el espacio GGUF-my-repo. La cuantizacion Q3_K_L es un esquema k-quant de 3 bits con escalas mixtas (aproximadamente 3,9 bits por peso), lo que reduce el peso del modelo a unos 13-14 GB estimados frente a los ~53,8 GB (estimado) que ocuparia en fp16.

## Capacidades

- Generacion de texto: capacidad inherente a un modelo de lenguaje causal de este tamano, aunque no se detalla en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.
- Modo "thinking" o razonamiento explicito: no disponible.
- Ajuste "uncensored": el modelo base declara la eliminacion o reduccion del alineamiento de seguridad, lo que implica una menor tasa de rechazos ante peticiones que un modelo alineado rechazaria.

## Casos de uso

- Experimentacion local con modelos de ~27B: la cuantizacion Q3_K_L permite cargar el modelo en una GPU de consumo o incluso en CPU con llama.cpp, sin necesidad de infraestructura de datacenter, para pruebas de generacion de texto y evaluacion cualitativa.
- Analisis de seguridad y red teaming: al tratarse de una variante "uncensored", resulta util para estudiar que tipos de contenido produce un modelo sin alineamiento restrictivo, y para calibrar filtros y clasificadores de moderacion.
- Investigacion academica sobre alineamiento: sirve como punto de comparacion frente a versiones alineadas del mismo modelo para medir el efecto del alineamiento en estilo, rechazos y distribucion de respuestas.
- Prototipado de asistentes conversacionales en local: con llama-server o llama.cpp se puede levantar una API compatible con OpenAI y conectar un front-end de chat, sin enviar datos a servicios externos.
- Procesamiento de documentos con privacidad: al ejecutarse en hardware propio, encaja en flujos donde los textos no pueden salir de la organizacion, siempre que se valide su calidad en la tarea concreta.
- Generacion creativa y escritura asistida: escritura de ficcion, resumenes o reescritura donde la menor censura del modelo base puede ser relevante, sujeta a revision humana por riesgo de contenido inapropiado.
- Despliegue en entornos con VRAM limitada: para equipos con 12-16 GB de VRAM que no pueden alojar la version fp16, esta cuantizacion ofrece un compromiso entre tamano y calidad.
- Evaluacion comparativa de cuantizaciones: permite medir la degradacion de calidad de Q3_K_L frente al modelo original en tareas concretas antes de decidir el formato definitivo de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 13-14 GB con Q3_K_L (estimacion a partir de los 26,9B de parametros y el tamano de repositorio de 14,3 GB).
- VRAM total con cache KV: en torno a 14-16 GB segun la longitud de contexto configurada; a mayor contexto, mayor consumo de cache.
- GPU recomendadas para descarga completa en VRAM: RTX 3090 o RTX 4090 (24 GB), A100 40 GB, H100; con 24 GB se dispone de margen para contexto amplio.
- GPU de 16 GB (RTX 4080, A4000): ajustado para los pesos completos; puede requerir reducir contexto o hacer offload parcial.
- GPU de 8-12 GB: no cabe completo; es viable con offload parcial a CPU o mediante mmap, con penalizacion de velocidad.
- Solo CPU: viable con ~14 GB de RAM libre, con velocidades notablemente inferiores a inferencia en GPU; no se dispone de cifras concretas.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui; vLLM y TGI requieren soporte GGUF (experimental en vLLM) o reconversion de pesos.
- Latencia y throughput: no disponibles. Dependen fuertemente del hardware, del reparto GPU/CPU y de la longitud de contexto.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencia interna, la unica comparacion posible es contra el propio modelo base en precision completa:

| Version | Formato | Tamano estimado | Precision | Notas |
|---|---|---|---|---|
| Suri-Qwen-3.8-27B-Uncensored-Q3_K_L | GGUF | ~14,3 GB | ~3,9 bits por peso | Menor huella, mayor degradacion |
| Suri-Qwen-3.8-27B-Uncensored (base) | safetensors | ~53,8 GB en fp16 (estimado) | fp16 | Mayor calidad, mayor requisito de VRAM |

No se han encontrado comparativas con otros modelos de la misma categoria en la informacion disponible.

## Limitaciones y advertencias

- Modelo "uncensored": el alineamiento de seguridad esta reducido o eliminado, por lo que puede generar contenido danino, ilegal o inapropiado; requiere moderacion en cualquier despliegue publico.
- Cuantizacion Q3_K_L: la perdida de precision frente a fp16 degrada razonamiento, coherencia a contextos largos y generacion de codigo; conviene validar la calidad en la tarea objetivo.
- Licencia: no disponible. No hay certeza sobre si se permite uso comercial, lo que supone un riesgo legal para produccion.
- Idiomas: no se documenta que idiomas soporta ni su calidad relativa por idioma.
- Contexto: se desconoce la longitud de contexto soportada; configuraciones altas pueden degradar la calidad y aumentar el consumo de VRAM.
- Alucinacion: riesgo inherente a los modelos de lenguaje, agravado por la cuantizacion de 3 bits.
- Sesgos: se desconoce la composicion del dataset de entrenamiento, por lo que no es posible evaluar sesgos de genero, raza, religion o ideologia.
- Adopcion nula: 0 descargas y 0 likes, repositorio recien creado y sin validacion comunitaria; conviene tratar el artefacto como no verificado.
- Metadatos anomales: la fecha de creacion registrada (23 de septiembre de 2026) es futura respecto a la fecha habitual de publicacion, lo que sugiere metadatos poco fiables.
- Sin benchmarks: no hay mediciones publicadas que respalden su rendimiento frente a alternativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored-Q3_K_L-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Espacio GGUF-my-repo: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
