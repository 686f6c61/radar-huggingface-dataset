# TAOTAO777/ai-girlfriend-natsume

## Resumen

`TAOTAO777/ai-girlfriend-natsume` no es un modelo entrenado por su autor, sino un repositorio de distribucion (espejo) que agrupa varios artefactos de un proyecto personal de "AI girlfriend" llamado Artemis. El componente principal es un LLM en formato GGUF cuantizado a Q4_K_M, identificado en la model card como derivado de Inkling-2-Mini-26B (Thinking Machines Lab) con un fine-tune "Heretic" orientado a eliminar restricciones de alineamiento. El repositorio incluye ademas dos checkpoints de difusion para ComfyUI (WAI-Nsfw-Illustrious-17 y miaomiaoHarem_v20) y pesos de sintesis de voz GPT-SoVITS entrenados por el propio autor.

El dato de parametros reportado por Hugging Face (9.197.093.888, aproximadamente 9,2 mil millones) corresponde a los ficheros `safetensors` presentes en el repositorio, no al LLM empaquetado en GGUF, cuyo nombre sugiere 26B. Esta discrepancia es relevante: el repositorio mezcla pesos de distinta naturaleza (LLM, UNet de difusion, modelos de voz) y el recuento agregado no describe ningun modelo individual de forma fiable.

El interes practico es limitado para evaluacion tecnica seria: no hay model card propia del LLM, no se publican benchmarks, la licencia del conjunto no esta declarada y el contenido esta orientado a un caso de uso de rol conversacional para adultos. Se documenta aqui como ficha de referencia por su traccion de descargas (2375) y por su valor como ejemplo de repositorio agregador multi-modal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible para el LLM (nombre sugiere base Inkling-2-Mini); checkpoints de difusion tipo UNet para ComfyUI; GPT-SoVITS para voz |
| Parametros totales | 9.197.093.888 segun metadatos `safetensors` del repo (no corresponde a un unico modelo; el GGUF se etiqueta como 26B) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF) para el LLM; `safetensors` sin cuantizar para los checkpoints de difusion |
| Idiomas soportados | No disponible |
| Licencia | No disponible a nivel de repositorio; componentes individuales: Apache 2.0 (base Inkling-2-Mini), "community model" (checkpoints CivitAI), uso libre (GPT-SoVITS) |
| Formato de pesos | GGUF, safetensors, `.ckpt` y `.pth` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del LLM. El nombre del fichero (`Inkling-2-Mini-26B-Heretic-Uncensored-Turbo-Brilliance-50X-V2-AGI-NEO-Q4_K_M.gguf`) apunta a una base Inkling-2-Mini de 26B parametros de Thinking Machines Lab, sobre la que se habria aplicado un fine-tune de tipo "abliteration" o "uncensoring" (etiquetado como Heretic). No se aportan datos sobre tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas. El autor declara explicitamente que no entrena el LLM: solo lo redistribuye.

Los otros componentes son: dos checkpoints de Stable Diffusion (WAI-Nsfw-Illustrious-17 y miaomiaoHarem_v20) alojados originalmente en CivitAI, y pesos GPT-SoVITS v2Pro (un `.ckpt` de SoVITS y un `.pth` de GPT) entrenados por el autor para clonacion de voz. No hay informacion sobre horas de audio, numero de hablantes ni metodologia de entrenamiento de la voz.

## Capacidades

- Generacion de texto conversacional en el LLM GGUF, presumiblemente orientada a roleplay y dialogos multi-turno.
- Generacion de imagenes mediante los checkpoints de difusion en ComfyUI (estilo anime/ilustracion, contenido NSFW segun los nombres de los modelos).
- Sintesis de voz y clonacion con GPT-SoVITS a partir de los pesos incluidos.
- Integracion con el proyecto Artemis (GitHub `momori777/Artemis`), que orquesta los tres componentes.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- No hay evidencia de soporte de tool calling, function calling, agentes, vision, audio nativo en el LLM ni capacidades multilingues documentadas.

## Casos de uso

- Roleplay conversacional de personaje: el LLM GGUF puede desplegarse en llama.cpp para mantener dialogos de personaje con memoria de contexto, aunque se desconoce la ventana real disponible.
- Generacion de retratos e ilustraciones de personaje: los checkpoints de ComfyUI permiten producir imagenes consistentes con el personaje Natsume dentro de un pipeline de difusion.
- Doblaje y voz de personaje: GPT-SoVITS permite sintetizar las respuestas del LLM con una voz clonada, cerrando el bucle texto-voz del proyecto Artemis.
- Prototipado de asistentes conversacionales multimodales: sirve como ejemplo de orquestacion LLM + difusion + TTS en un unico stack local.
- Investigacion sobre fine-tunes "uncensored": util para estudiar como se comporta un modelo abliterated frente a su base alineada, siempre con las cautelas eticas correspondientes.
- Demo educativa de despliegue GGUF: el fichero Q4_K_M puede cargarse en llama.cpp (build b12521 o superior segun el autor) para experimentar con cuantizacion de 26B en hardware de consumo.
- Pruebas de pipelines de voz: los pesos GPT-SoVITS v2Pro permiten evaluar la calidad de clonacion de voz en castellano o en el idioma de entrenamiento (no documentado).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el LLM: no disponible de forma oficial. Como referencia orientativa para un modelo de 26B en Q4_K_M, se requieren del orden de 15-18 GB de VRAM o RAM; si el recuento real fuese 9,2B, bastarian unos 6-7 GB en Q4_K_M. El autor no especifica.
- GPU recomendadas: no disponibles. Para el GGUF, una RTX 4090 (24 GB) o superior permitiria cargar un 26B Q4_K_M completo en VRAM; una RTX 3090/4080 (16 GB) requeriria offload parcial a RAM.
- Difusion: los checkpoints de ComfyUI (WAI-Illustrious, miaomiaoHarem) son modelos SD1.5/SDXL-like; tipicamente 6-10 GB de VRAM en fp16, menos con `--lowvram`.
- GPT-SoVITS: inference ligera, cabe en GPUs consumer de 8 GB o incluso en CPU con latencia mayor.
- Despliegue: llama.cpp (build b12521 o superior segun la model card) para el GGUF; ComfyUI para difusion; GPT-SoVITS para voz. No se menciona soporte de vLLM ni TGI para este GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables directos, dado que el repositorio agrega artefactos heterogeneos y no documenta el LLM de forma independiente. Como referencia de categoria, la base declarada (Inkling-2-Mini-26B, Apache 2.0) seria el termino de comparacion natural, pero no se dispone de sus especificaciones ni resultados en esta ficha.

## Limitaciones y advertencias

- El repositorio no es un modelo propio: es un espejo de terceros. La calidad y el comportamiento dependen de los artefactos originales, no del autor del repo.
- Ausencia total de model card tecnica del LLM: sin contexto, sin idiomas, sin benchmarks, sin ficha de entrenamiento.
- Contenido NSFW explicito en los checkpoints de difusion y presumiblemente en el fine-tune "uncensored" del LLM; no apto para entornos productivos generales ni para menores.
- Licencia del repositorio no declarada; los componentes tienen licencias dispares (Apache 2.0, "community model" sin terminos claros, uso libre autodeclarado). El uso comercial es arriesgado y, en el caso de los checkpoints de CivitAI, posiblemente prohibido segun sus terminos originales.
- Riesgo elevado de alucinacion y de comportamiento degradado por el fine-tune de abliteration, que suele reducir la calidad en tareas de razonamiento y seguridad.
- Discrepancia entre el recuento de parametros de los metadatos (9,2B) y el nombre del GGUF (26B): no se puede garantizar que el LLM empaquetado coincida con la base declarada.
- El repositorio ocupa 463,5 GB, lo que implica una descarga costosa; se recomienda descarga selectiva por subcarpeta.
- Sin garantias de mantenimiento: el autor advierte que retirara el contenido si los autores originales lo solicitan.
- GPT-SoVITS con voz clonada plantea riesgos de suplantacion y requiere consentimiento explicito de la persona cuya voz se ha clonado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TAOTAO777/ai-girlfriend-natsume
- Proyecto principal (GitHub): https://github.com/momori777/Artemis
- Base declarada del LLM: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Checkpoint de difusion WAI-Nsfw-Illustrious-17 (CivitAI): https://civitai.com/models/1185480
- Checkpoint de difusion miaomiaoHarem_v20 (CivitAI): https://civitai.com/models/1033365
