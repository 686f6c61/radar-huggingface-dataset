# TheShellMaster/cypher-DeepSeek-V4-Pro-Qwen3.5-9B-heretic

## Resumen

`cypher-DeepSeek-V4-Pro-Qwen3.5-9B-heretic` es un modelo de lenguaje en formato GGUF publicado por TheShellMaster, derivado del modelo base `Qwen/Qwen3.5-9B` (9.197.093.888 parametros). La denominacion "heretic" y las etiquetas `abliterated` y `uncensored` indican que se trata de una variante con el alineamiento de seguridad eliminado mediante la tecnica de abliteration, que anula las direcciones de activacion asociadas al rechazo de peticiones. El nombre comercial "DeepSeek-V4-Pro" no corresponde a un modelo real de DeepSeek: es una etiqueta de mercadotecnia aplicada sobre el modelo Qwen, y conviene tratarla con cautela.

El modelo se distribuye como republicacion sin modificaciones de los GGUF generados por mradermacher, en cuantizacion Q8_0, junto con un fichero `mmproj` que sugiere soporte multimodal de vision (proyeccion de imagenes al espacio del transformer). Esta pensado para ejecutarse en `llama.cpp`/`llama-server`, y el autor declara haberlo probado en una unica GPU T4 de 15 GB. Su relevancia practica es limitada: es un artefacto de nicho para el agente OpenCode del autor, con 194 descargas y sin likes, pero sirve como ejemplo de despliegue local de un modelo de ~9B sin censura sobre hardware modesto.

La ficha se elabora a partir de la informacion disponible en Hugging Face y la model card; muchos datos tecnicos del modelo base (contexto, composicion del dataset, benchmarks) no se han publicado en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Qwen/Qwen3.5-9B); detalles no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF); mmproj Q8_0 para vision |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); safetensors en el modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de `Qwen/Qwen3.5-9B`, un transformer denso de aproximadamente 9.200 millones de parametros. Sobre esa base se ha aplicado un proceso de abliteration (variante "heretic") que identifica y sustrae la direccion de rechazo en el espacio de activaciones, de modo que el modelo deja de negarse a responder a determinadas peticiones. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo original.

La publicacion de TheShellMaster es una republicacion sin modificaciones de los GGUF de mradermacher, por lo que no aporta entrenamiento adicional: solo cambia el empaquetado y anade el fichero `mmproj` para vision. Se desconoce si el modelo base Qwen3.5-9B incorpora innovaciones como decodificacion especulativa, atencion lineal o modos de razonamiento extendido; no hay datos en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional multi-turno (etiqueta `conversational`).
- Razonamiento y respuesta a instrucciones, heredados del modelo base Qwen.
- Codigo y matematicas: capacidad esperable en un modelo de ~9B de la familia Qwen, aunque sin datos de benchmark que lo confirmen.
- Soporte de vision: el fichero `mmproj-Q8_0.gguf` indica proyeccion de imagenes, por lo que el modelo puede procesar entradas visuales en llama.cpp.
- Modo sin censura: la abliteration elimina parte de los rechazos de seguridad, lo que permite respuestas a peticiones que el modelo original declinaria.
- Compatibilidad con endpoints (`endpoints_compatible`) y con `llama-server` mediante `--jinja`.
- Tool calling / function calling: no confirmado en la informacion disponible.
- Capacidades de agente multi-paso: el autor lo usa como backend de un agente OpenCode, pero no se documentan formalmente.

## Casos de uso

- Despliegue local en GPU de gama media: con cuantizacion Q8_0 y ~9B de parametros, el modelo cabe en una T4 de 15 GB (como declara el autor) y permite inferencia offline sin dependencia de APIs.
- Agente de codigo en terminal: integrado en `llama-server` como backend de un agente tipo OpenCode, gestiona conversaciones con contexto de repositorio y generacion de parches.
- Investigacion sobre alineamiento y abliteration: sirve como caso de estudio para medir como cambia la tasa de rechazo y la calidad de respuesta tras eliminar la direccion de seguridad.
- Procesamiento de imagenes con OCR o descripcion: el fichero `mmproj` habilita tareas de vision-lenguaje en local, util para digitalizar documentos o etiquetar imagenes.
- Prototipado de chatbots sin restricciones editoriales: para entornos de investigacion donde se necesita explorar respuestas que un modelo alineado bloquearia, con las advertencias legales correspondientes.
- Pruebas de red teaming: evaluar la robustez de filtros y guardarrailes externos frente a un modelo deliberadamente no alineado.
- Educacion y demostraciones de llama.cpp: ejemplo reproducible de carga de un GGUF con vision y plantilla Jinja en hardware consumer.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor confirma funcionamiento en una GPU T4 de 15 GB con Q8_0; el peso del fichero Q8_0 ronda los 9-10 GB, mas overhead de contexto y el `mmproj`.
- GPU recomendadas: T4 (16 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) para mayor contexto y throughput.
- Cabe en GPU consumer: si, en tarjetas con 12 GB o mas (RTX 3060 12 GB, RTX 4070 Ti, RTX 4090). En 8 GB requeriria cuantizaciones menores (Q4_K_M), no incluidas en este repo.
- Opciones de despliegue: `llama.cpp` / `llama-server` (comando del autor: `llama-server -m <fichero>.gguf --jinja -ngl 99 -fa on`), Ollama y cualquier frontend compatible con GGUF.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-DeepSeek-V4-Pro-Qwen3.5-9B-heretic | 9,2B | no disponible | Apache 2.0 | GGUF | Abliterated, vision via mmproj |
| Qwen/Qwen3.5-9B (base) | 9,2B | no disponible | Apache 2.0 | safetensors | Alineado, sin censura eliminada |
| mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF | 9,2B | no disponible | Apache 2.0 | GGUF | Fuente original de los GGUF |
| Otros GGUF abliterated de ~9B | ~9B | variable | variable | GGUF | Alternativas de la comunidad, sin datos verificados |

No se dispone de datos de rendimiento comparativo (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Limitaciones y advertencias

- La abliteration elimina los rechazos de seguridad: el modelo puede generar contenido danino, ilegal o sesgado; no es apto para produccion orientada al publico sin filtros externos.
- Riesgo elevado de alucinacion, comun en modelos de ~9B y agravado por la perdida de calidad que puede introducir la abliteration.
- El nombre "DeepSeek-V4-Pro" es enganoso: no existe relacion con DeepSeek; es un Qwen3.5-9B reetiquetado.
- Idiomas y longitud de contexto no documentados; no se debe asumir soporte multilingue amplio ni ventanas largas.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativa (difamacion, derechos de autor, material ilegal); la responsabilidad recae en el desplegador.
- Es una republicacion sin garantias de mantenimiento: 0 likes, 194 descargas y sin pipeline declarado.
- El soporte de vision depende del `mmproj` y de la version de llama.cpp; la compatibilidad puede romperse entre versiones.
- No hay evidencia de tool calling fiable ni de calidad de agente medida; el uso como backend de OpenCode es una anecdota del autor.

## Enlaces

- Hugging Face: https://huggingface.co/TheShellMaster/cypher-DeepSeek-V4-Pro-Qwen3.5-9B-heretic
- GGUF fuente: https://huggingface.co/mradermacher/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
