# vcruz305/Inkling-2-Mini-SAGE-REXL3-2.26bpw

## Resumen

Inkling-2-Mini-SAGE-REXL3-2.26bpw es una cuantizacion en formato EXL3/REXL3 (libreria exllamav3) del modelo multimodal thinkingmachines/Inkling-2-Mini, publicada por el usuario vcruz305 en Hugging Face. Se trata de una version comprimida a 2,26 bits por peso (bpw) que reduce el modelo original a un repositorio de 8,6 GB, manteniendo la arquitectura Mixture-of-Experts (MoE) y la capacidad image-text-to-text del modelo base. El pipeline declarado es image-text-to-text y los pesos se distribuyen en safetensors compatibles con ExLlamaV3.

El modelo base Inkling-2-Mini pertenece a la familia Inkling de Thinking Machines y esta disenado para tareas conversacionales multimodales, con soporte de entrada de imagen y texto. Esta version cuantizada esta pensada para despliegue en entornos con VRAM limitada, ya que el formato EXL3 permite ejecutar el modelo con un footprint de memoria muy reducido en comparacion con los pesos originales en BF16.

Es relevante ahora porque las cuantizaciones de muy baja precision (por debajo de 3 bpw) con EXL3 estan permitiendo llevar modelos MoE multimodales a GPUs de consumo, algo impensable hace unos anos. Sin embargo, el acceso al repositorio esta restringido (gated) y requiere aceptar condiciones en Hugging Face, y no se dispone de datos publicados de benchmarks ni de la ficha tecnica completa del modelo base en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer multimodal (image-text-to-text) segun tags del modelo base |
| Parametros totales | 4.176.399.744 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 / REXL3 a 2,26 bpw (esta version); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | en, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (EXL3, libreria exllamav3) |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es un MoE multimodal (tags: moe, multimodal, image-text-to-text, inkling2_loop). La etiqueta inkling2_loop sugiere algun tipo de mecanismo de bucle o iteracion interna en la arquitectura, aunque no se detalla su funcionamiento en la informacion proporcionada. Al ser una cuantizacion, esta version no aporta datos nuevos de entrenamiento: hereda los pesos del modelo base thinkingmachines/Inkling-2-Mini comprimidos a 2,26 bpw mediante EXL3.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si el modelo base utilizo RLHF, DPO u otras tecnicas de alineacion. Tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La innovacion principal de esta publicacion es la propia cuantizacion EXL3 a 2,26 bpw, que reduce el tamano del repositorio a 8,6 GB para un modelo de 4.176 millones de parametros.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado.
- Procesamiento multimodal image-text-to-text: acepta imagenes junto con texto como entrada.
- Soporte multilingue (tags: en, multilingual).
- Arquitectura MoE, lo que en teoria permite activar solo una fraccion de parametros por token (numero de expertos y parametros activos no disponibles).
- No se dispone de informacion sobre soporte de tool calling, function calling, agentes, modo thinking, audio u otras capacidades especiales.
- No se dispone de informacion sobre capacidades especificas de codigo o matematicas.

## Casos de uso

- Asistentes conversacionales multimodales: el modelo puede mantener dialogos multi-turno con entrada de imagenes, adecuado para interfaces de chat que reciben capturas o fotos del usuario.
- Descripcion y analisis de imagenes en produccion: al ser image-text-to-text, sirve para generar descripciones, responder preguntas sobre imagenes o extraer informacion visual en pipelines automatizados.
- Despliegue en GPUs de consumo: gracias a la cuantizacion a 2,26 bpw y un repositorio de 8,6 GB, es viable ejecutarlo en hardware con VRAM limitada mediante ExLlamaV3, algo inviable con los pesos originales.
- Prototipado e investigacion: util para investigadores que necesitan evaluar el comportamiento de Inkling-2-Mini en entornos con recursos reducidos antes de escalar a la version completa.
- Aplicaciones multilingues: el soporte multilingual permite atender usuarios en varios idiomas en tareas de comprension de imagen y texto.
- Servicios de atencion al cliente con soporte visual: integrable en flujos donde el usuario envia imagenes (productos, documentos, errores) y el modelo responde en lenguaje natural; la idoneidad depende de la longitud de contexto, que no esta disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 8,6 GB en disco; con overhead de contexto y cache KV, se estima un uso de VRAM en el rango de 10-12 GB para esta cuantizacion a 2,26 bpw (estimacion orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible de forma oficial; por el footprint, GPUs con 12-16 GB de VRAM o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090, A100, H100) serian candidatas.
- Cabe en GPU de consumo: probablemente si, en modelos con 12 GB o mas de VRAM, aunque no hay confirmacion oficial.
- Opciones de despliegue: ExLlamaV3 (libreria declarada, exllamav3). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el formato EXL3 es especifico de ExLlamaV3.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se indica a continuacion lo que se conoce del propio modelo frente a su base:

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-SAGE-REXL3-2.26bpw (esta ficha) | 4.176 M | no disponible | EXL3 2,26 bpw | apache-2.0 | Gated en HF |
| thinkingmachines/Inkling-2-Mini (base) | 4.176 M (segun esta cuantizacion) | no disponible | BF16 u otras (no detallado) | apache-2.0 | no disponible en esta informacion |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La cuantizacion a 2,26 bpw puede degradar la calidad respecto al modelo base en tareas sensibles a la precision (razonamiento, matematicas, vision fina); no hay evaluacion publicada del impacto.
- Acceso restringido (gated): requiere aceptar condiciones en Hugging Face antes de descargar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay validacion comunitaria de su funcionamiento.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion ni limitaciones de contexto o idioma mas alla de los tags (en, multilingual).
- El formato EXL3 solo es compatible con ExLlamaV3, lo que limita las opciones de despliegue frente a GGUF u otros formatos.
- Aunque la licencia declarada es apache-2.0, conviene verificar las condiciones del modelo base y del gate antes de uso comercial.
- No hay datos de benchmarks que permitan garantizar el rendimiento en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Inkling-2-Mini-SAGE-REXL3-2.26bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios o demos adicionales.
