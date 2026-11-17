# yukiworks/gemma-4-26B-A4B-it-heretic-NSFW-GGUF

## Resumen

`yukiworks/gemma-4-26B-A4B-it-heretic-NSFW-GGUF` es una cuantizacion en formato GGUF de un modelo derivado de la familia Gemma 4, publicada por el usuario yukiworks. El modelo base declarado es `yukiworks/gemma-4-26B-A4B-it-heretic-NSFW`, una variante "heretic" (abliterated/decensored) del Gemma 4 26B A4B instruct. La nomenclatura "A4B" sugiere una arquitectura de mezcla de expertos con aproximadamente 4 mil millones de parametros activos sobre un total de 25,2 mil millones, aunque el autor no documenta explicitamente la arquitectura en la model card.

El modelo resuelve el caso de uso de inferencia local de un modelo multimodal (image-text-to-text) de gran tamano con pesos cuantizados listos para llama.cpp. Se distribuyen cuatro cuantizaciones de texto (Q8_0, Q4_K_M, Q3_K_M y Q2_K) mas un proyector multimodal BF16 compartido, lo que permite desplegar el modelo en hardware de consumo segun el presupuesto de VRAM disponible.

Es relevante ahora porque combina tres tendencias: la demanda de modelos multimodales ejecutables en local, la popularidad de las tecnicas de "abliteration" para eliminar el alineamiento de seguridad, y el ecosistema GGUF/llama.cpp como formato estandar de distribucion. La licencia declarada es Apache-2.0, si bien la model card enlaza a la licencia de Gemma 4 de Google, lo que introduce ambiguedad juridica que conviene revisar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); nomenclatura "A4B" sugiere MoE con ~4B activos, no confirmado en la model card |
| Parametros totales | 25.233.142.046 (25,2 B) |
| Parametros activos | ~4 B (inferido de la nomenclatura "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q3_K_M, Q2_K (texto); BF16 para mmproj |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 declarada; enlace a Gemma 4 License de Google |
| Formato de pesos | GGUF (llama.cpp), con mmproj BF16 separado para vision |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna ni el proceso de entrenamiento. Por el identificador "26B-A4B" se infiere una arquitectura de mezcla de expertos con 25,2 mil millones de parametros totales y aproximadamente 4 mil millones activos por token, aunque esta interpretacion no esta confirmada por el autor. El modelo es multimodal (pipeline `image-text-to-text`), con un codificador/proyector de imagen que se distribuye como archivo `mmproj` BF16 independiente y se comparte entre las cuatro cuantizaciones de texto.

El proceso de cuantizacion se realizo con llama.cpp a partir de un GGUF intermedio en BF16, cuantizando cada modelo de texto de forma independiente. El tokenizer y la plantilla de chat estan embebidos en cada GGUF de texto. No se dispone de informacion sobre volumen de tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni sobre el proceso concreto de "abliteration" aplicado al modelo base. La etiqueta "heretic" hace referencia a la herramienta Heretic, empleada habitualmente para eliminar rechazos de seguridad mediante modificacion de direcciones de activacion, pero el autor no documenta el procedimiento.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Procesamiento de imagenes junto con texto (pipeline `image-text-to-text`, requiere cargar el `mmproj` BF16).
- Modelo "uncensored"/"abliterated": se espera que no aplique rechazos de seguridad estandar, si bien no hay evaluacion publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- **Generacion de texto creativo sin filtros editoriales**: el caracter abliterated del modelo permite generar narrativa, ficcion adulta o dialogos sin los rechazos habituales de los modelos alineados, lo que resulta util para escritura creativa y prototipado de contenido para adultos.
- **Inferencia local multimodal en estaciones de trabajo**: cargando el `mmproj` BF16 junto con la cuantizacion Q4_K_M (16,8 GB), es posible describir imagenes, responder preguntas sobre capturas o extraer informacion de documentos escaneados en una maquina con GPU de consumo alta.
- **Prototipado rapido de asistentes conversacionales**: la plantilla de chat embebida y el formato GGUF permiten desplegar un asistente multi-turno con llama.cpp u Ollama en minutos, sin necesidad de infraestructura de servidor.
- **Investigacion sobre alineamiento y seguridad**: la variante heretic sirve como objeto de estudio para medir como la abliteration afecta a la calidad, la coherencia y la tasa de rechazos en comparacion con el Gemma 4 original.
- **Generacion de descripciones de imagen a escala en local**: con el proyector multimodal y una cuantizacion Q8_0 (26,86 GB) en una GPU de 48 GB, se pueden procesar lotes de imagenes para etiquetado o alt-text sin enviar datos a servicios externos.
- **Evaluacion de cuantizaciones**: el repositorio incluye cuatro niveles de cuantizacion del mismo modelo, lo que facilita estudios comparativos de degradacion de calidad frente a VRAM y velocidad en llama.cpp.
- **Despliegue con requisitos de privacidad**: al ejecutarse integramente en local, es adecuado para entornos donde el contenido generado o las imagenes procesadas no pueden salir de la infraestructura del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia (texto)**:
  - Q8_0: ~27 GB de pesos; requiere ~30-32 GB de VRAM para contexto moderado.
  - Q4_K_M: ~16,8 GB de pesos; requiere ~20-22 GB de VRAM.
  - Q3_K_M: ~13,3 GB de pesos; requiere ~16-18 GB de VRAM.
  - Q2_K: ~10,6 GB de pesos; requiere ~13-14 GB de VRAM.
- **Proyector multimodal**: sumar ~1,2 GB (mmproj BF16) si se procesan imagenes.
- **GPU recomendadas**: A100 40/80 GB o H100 para Q8_0 con contexto largo; RTX 4090 (24 GB) o RTX A6000 (48 GB) para Q4_K_M; RTX 3090 (24 GB) para Q4_K_M con contexto limitado; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M o Q2_K.
- **Cabe en GPU de consumo**: si, en Q4_K_M, Q3_K_M y Q2_K en GPUs de 16-24 GB; Q8_0 requiere GPU profesional o configuracion multi-GPU.
- **Opciones de despliegue**: llama.cpp (nativo), Ollama, llama-cpp-python, servidores compatibles con la API de llama.cpp (`endpoints_compatible`). No se documenta soporte de vLLM ni TGI para este GGUF.
- **Latencia y throughput**: no disponibles; dependen del hardware y de la cuantizacion. La arquitectura MoE (si se confirma) favorece un throughput alto al activar solo ~4 B de parametros por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yukiworks/gemma-4-26B-A4B-it-heretic-NSFW-GGUF | 25,2 B totales / ~4 B activos | no disponible | Si (image-text-to-text) | Apache-2.0 declarada (ambiguo con Gemma License) | GGUF en HF |
| Gemma 4 26B A4B it (original) | 25,2 B totales / ~4 B activos | no disponible | Si | Gemma License | Pesos originales en HF |
| Variantes abliterated de Llama 3.x 8B | ~8 B | 8k-128k segun variante | No (texto) | Llama License | GGUF en HF |
| Variantes abliterated de Mistral 7B / Nemo 12B | 7-12 B | 32k-128k segun variante | No (texto) | Apache-2.0 (Mistral 7B) | GGUF en HF |

La comparativa con modelos de la misma categoria (multimodal abliterated de ~25 B) es limitada porque no se dispone de datos de rendimiento publicados para este modelo ni de alternativas equivalentes documentadas en la informacion proporcionada.

## Limitaciones y advertencias

- **Contenido para adultos**: el modelo esta etiquetado `not-for-all-audiences` y `nsfw`; no es adecuado para entornos sin control de acceso ni para usuarios menores.
- **Abliteration y seguridad**: la eliminacion de rechazos puede incrementar la probabilidad de generar contenido danino, sesgado o ilegal; no se ha publicado ninguna evaluacion de seguridad.
- **Riesgo de alucinacion**: no cuantificado; como en cualquier modelo de ~25 B, se esperan alucinaciones en tareas factuales y de razonamiento complejo.
- **Ambiguedad de licencia**: la model card declara Apache-2.0 pero enlaza a la Gemma 4 License de Google. Es imprescindible verificar los terminos aplicables antes de un uso comercial, ya que la licencia de Gemma impone restricciones de uso aceptable que la abliteration no elimina.
- **Idiomas y contexto no documentados**: se desconoce el soporte multilingue real y la longitud de contexto efectiva; conviene validar ambos en el caso de uso concreto.
- **Degradacion por cuantizacion**: Q2_K y Q3_K_M pueden degradar notablemente la calidad, especialmente en tareas de razonamiento y en el uso multimodal; Q4_K_M es el equilibrio recomendado.
- **Sin benchmarks**: no hay datos publicados que permitan comparar su rendimiento con el Gemma 4 original ni con alternativas.
- **Repo de gran tamano**: 119,2 GB en total; la descarga completa requiere espacio en disco considerable y conviene bajar solo la cuantizacion y el mmproj necesarios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW-GGUF
- Modelo base: https://huggingface.co/yukiworks/gemma-4-26B-A4B-it-heretic-NSFW
- Licencia Gemma 4 referenciada: https://ai.google.dev/gemma/docs/gemma_4_license
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
