# TheShellMaster/cypher-Qwen3.8-9B-Distill-heretic

## Resumen

cypher-Qwen3.8-9B-Distill-heretic es una publicacion de pesos en formato GGUF realizada por el usuario TheShellMaster para alimentar a Cypher, un agente basado en OpenCode. No se trata de un modelo entrenado desde cero, sino de una republicacion sin modificaciones de la cuantizacion Q8_0 generada por mradermacher a partir del modelo nurdich/Qwen3.8-9B-Distill-uncensored-heretic, cuyo modelo base declarado es Qwen/Qwen3.5-9B. El autor indica explicitamente que todo el merito corresponde a los autores originales y que se aplica la licencia de origen, Apache 2.0.

El modelo tiene 9.197.093.888 parametros (aproximadamente 9,2 mil millones) y se distribuye con un peso principal en Q8_0 junto a un proyector multimodal (mmproj) tambien en Q8_0, lo que sugiere capacidad de vision. La etiqueta "abliterated" y "uncensored" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas del modelo ante peticiones sensibles, y "heretic" hace referencia a la herramienta de automatizacion de ese proceso de abliteracion.

Su relevancia es limitada y muy especifica: sirve como referencia practica de despliegue de un modelo de ~9B cuantizado en Q8_0 sobre una unica GPU T4 de 15 GB mediante llama-server, y como ejemplo de cadena de derivacion (base Qwen, destilacion, abliteracion, cuantizacion GGUF y republicacion). No hay informacion publica sobre el proceso de destilacion ni sobre los datos de entrenamiento empleados en las etapas intermedias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-9B; detalles no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (pesos principales y mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el repo base, ~10,4 GB de repo) |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura interna mas alla de la herencia del modelo base Qwen/Qwen3.5-9B, un transformer decoder-only de aproximadamente 9,2 mil millones de parametros. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF, DPO o destilacion supervisada; la etiqueta "Distill" del nombre sugiere una destilacion desde un modelo mayor, pero el procedimiento no esta publicado en la informacion disponible.

La innovacion tecnica documentada es la abliteracion: se han eliminado o atenuado las direcciones de activacion asociadas al rechazo de peticiones, un proceso habitualmente automatizado con herramientas como Heretic. El resultado se ha cuantizado a Q8_0 (8 bits por peso) y se ha acompanado de un proyector multimodal mmproj en el mismo formato, lo que permite inferencia con entrada de imagen en llama.cpp. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni arquitecturas hibridas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Procesamiento de imagenes: la presencia del fichero mmproj-Q8_0.gguf indica soporte multimodal vision-lenguaje en llama.cpp.
- Comportamiento sin censura ("uncensored", "abliterated"): menor tasa de rechazos ante peticiones que el modelo base rechazaria.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere integracion con APIs compatibles con OpenAI.
- Integracion con llama.cpp y llama-server mediante plantilla Jinja (`--jinja`), lo que habilita el formato de chat del modelo base.
- Soporte de tool calling y agentes: no confirmado en la informacion disponible, aunque el caso de uso declarado es un agente OpenCode.
- Capacidades multilingues: no disponibles; la model card esta redactada en frances, pero no se declaran idiomas soportados.

## Casos de uso

- Agente de codigo en local: el modelo se diseno para Cypher, un agente OpenCode, y puede ejecutarse en una unica T4 con llama-server para tareas de edicion y navegacion de repositorios sin depender de APIs externas.
- Despliegue en hardware modesto: con Q8_0 y ~9,2B de parametros cabe en una GPU T4 de 15 GB, lo que permite montar un asistente conversacional en infraestructura de gama baja o en estaciones de trabajo con una sola GPU.
- Procesamiento de documentos con imagen: gracias al proyector mmproj, puede extraer texto y describir capturas, diagramas o pantallazos dentro de un pipeline de digitalizacion.
- Experimentacion en seguridad y alineacion: al ser un modelo abliterated, sirve para estudiar como la ablacion afecta a la tasa de rechazos, la utilidad y la tendencia a generar contenido danino en comparacion con el base.
- Prototipado de asistentes conversacionales sin filtros editoriales: util para entornos de investigacion creativa o generacion de ficcion donde los rechazos del modelo base resultan obstructivos.
- Evaluacion de cadenas de derivacion de modelos: permite reproducir y auditar el flujo base Qwen 3.5-9B, destilacion, abliteracion y cuantizacion GGUF en un unico artefacto desplegable con llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: en Q8_0, los ~9,2B de parametros ocupan aproximadamente 9,2-10 GB, mas overhead de contexto y el proyector multimodal; el autor confirma funcionamiento en una T4 de 15 GB.
- GPU recomendadas: NVIDIA T4 (16 GB) como minimo validado; RTX 4090 (24 GB), A100 (40/80 GB) y H100 ofrecen margen amplio para contextos largos y mayor throughput.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) y en RTX 4080 (16 GB) con contexto moderado; en GPUs de 12 GB requeriria cuantizaciones menores no publicadas en este repo.
- Opciones de despliegue: llama.cpp y llama-server (comando documentado: `llama-server -m <fichero>.gguf --jinja -ngl 99 -fa on`); tambien es compatible con Ollama y otros runners basados en llama.cpp. vLLM y TGI no soportan GGUF de forma nativa en todos los casos.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Qwen3.8-9B-Distill-heretic | ~9,2B | no disponible | Apache 2.0 | GGUF Q8_0 | Abliterated, vision (mmproj), republicacion |
| Qwen/Qwen3.5-9B (base) | ~9,2B | no disponible | Apache 2.0 | safetensors | Modelo original con alineacion estandar |
| nurdich/Qwen3.8-9B-Distill-uncensored-heretic | ~9,2B | no disponible | Apache 2.0 (segun cadena) | safetensors | Version destilada y abliterated previa a la cuantizacion |
| mradermacher/Qwen3.8-9B-Distill-uncensored-heretic-GGUF | ~9,2B | no disponible | Apache 2.0 (segun cadena) | GGUF (multiples cuantizaciones) | Fuente directa de esta republicacion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteracion elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido danino, ilegal o inexacto sin advertir; no es adecuado para aplicaciones orientadas al publico sin filtros adicionales.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados que permitan estimar la fiabilidad factual del modelo.
- Se desconoce la longitud de contexto efectiva y los idiomas soportados; no se recomienda asumir un contexto largo ni un multilingueismo solido sin validacion previa.
- La licencia Apache 2.0 se hereda de la cadena de origen, pero el autor no aporta documentacion propia sobre la procedencia de los datos de destilacion ni sobre posibles restricciones adicionales de los modelos intermedios.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado en la misma fecha; no hay validacion de la comunidad ni garantias de mantenimiento.
- El modelo esta pensado para un agente concreto (Cypher/OpenCode); su calidad en otras tareas no esta verificada.
- El tamaNo del repo (10,4 GB) incluye pesos en Q8_0; no se ofrecen cuantizaciones menores en esta publicacion, lo que limita su uso en GPUs de menos de 12 GB.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Qwen3.8-9B-Distill-heretic
- Fuente GGUF original: https://huggingface.co/mradermacher/Qwen3.8-9B-Distill-uncensored-heretic-GGUF
- Modelo destilado y abliterated: https://huggingface.co/nurdich/Qwen3.8-9B-Distill-uncensored-heretic
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
