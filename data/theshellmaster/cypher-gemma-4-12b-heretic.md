# TheShellMaster/cypher-Gemma-4-12B-heretic

## Resumen

cypher-Gemma-4-12B-heretic es una publicacion de pesos en formato GGUF derivada de google/gemma-4-12b-it, el modelo instructivo de 12 mil millones de parametros de la familia Gemma de Google. El autor de la republicacion es TheShellMaster, que la distribuye como artefacto de inferencia para Cypher, su agente OpenCode. No se trata de un modelo entrenado desde cero ni de un ajuste fino original: la model card indica explicitamente que es una republicacion sin modificaciones de culturerevolt/gemma-4-12b-heretic-abliterated-GGUF, que a su vez aplica una ablacion de direcciones de rechazo (abliteration) sobre el modelo base de Google.

El modelo conserva la arquitectura, el tamano (11.907.350.576 parametros reales segun los safetensors del repo) y la ventana de contexto del Gemma 4 12B instructivo, pero elimina el sesgo de rechazo mediante ablacion, de modo que responde a peticiones que el modelo original declinaria. Se distribuye unicamente en cuantizacion Q6_K junto con un proyector multimodal mmproj en F16, lo que sugiere soporte de entrada de imagen heredado del modelo base.

Su relevancia es acotada pero concreta: sirve como referencia practica de despliegue de un Gemma 4 de 12B abliterado en una unica GPU T4 de 15 GB mediante llama-server, y como ejemplo de cadena de custodia de pesos (Google, culturerevolt, TheShellMaster). No hay datos publicados de benchmarks, idiomas ni evaluaciones de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de google/gemma-4-12b-it; no se detalla en la model card) |
| Parametros totales | 11.907.350.576 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q6_K (pesos del modelo) y F16 (proyector multimodal mmproj) |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (ai.google.dev/gemma/terms), sujeta a la Gemma Prohibited Use Policy |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | google/gemma-4-12b-it |
| Origen de los pesos | Republicacion sin modificacion de culturerevolt/gemma-4-12b-heretic-abliterated-GGUF |
| Tamano del repositorio | 10.0 GB |
| Fecha de creacion | 2026-11-22 |

## Arquitectura y entrenamiento

La model card no aporta informacion sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion del modelo base. Lo unico verificable es que se trata de un transformer decoder-only de 11.907.350.576 parametros, coherente con la designacion Gemma 4 12B, y que el modelo base es la variante instructiva google/gemma-4-12b-it.

La innovacion tecnica de esta publicacion no esta en el entrenamiento sino en la modificacion de pesos: la variante heretic-abliterated aplica abliteration, una tecnica de edicion de pesos que identifica la direccion de activacion asociada al rechazo de peticiones y la proyecta fuera de los pesos, sin reentrenamiento supervisado ni RLHF adicional. El resultado es un modelo que mantiene las capacidades del original pero con el comportamiento de rechazo atenuado. La republicacion de TheShellMaster no anade cambios: solo empaqueta los GGUF y el proyector mmproj para su uso con llama.cpp.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo instructivo Gemma 4 12B.
- Entrada multimodal de imagen: el repositorio incluye gemma-4-12b-heretic-mmproj-f16.gguf, el proyector necesario para vision en llama.cpp.
- Respuestas a peticiones que el modelo base rechazaria, como consecuencia de la ablacion de la direccion de rechazo.
- Compatibilidad con el endpoint de OpenAI (tag endpoints_compatible) a traves de llama-server.
- Soporte de plantillas de chat Jinja mediante el flag --jinja de llama-server.
- Capacidades de razonamiento y codigo: no documentadas en la model card; se asumen las del modelo base, sin verificacion.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Idiomas: no disponible.

## Casos de uso

- Despliegue en hardware modesto: el autor valida el modelo en una unica GPU T4 de 15 GB con llama-server y Q6_K, por lo que sirve como receta reproducible para servir un Gemma 4 12B en infraestructura de gama baja.
- Agente de codigo local: la model card lo describe como el GGUF utilizado por Cypher, un agente OpenCode, de modo que encaja en flujos de asistencia a programacion ejecutados en local sin dependencia de API externa.
- Experimentacion con alineacion y seguridad: al ser un Gemma 4 abliterado, es util para estudiar como la ablacion afecta al comportamiento de rechazo en evaluaciones controladas de red teaming.
- Procesamiento de documentos con imagen: el proyector mmproj F16 permite pasar capturas, diagramas o paginas escaneadas al modelo dentro de llama.cpp para tareas de extraccion o descripcion.
- Prototipado de asistentes conversacionales sin filtros editoriales: para casos donde el modelo base declina peticiones legitimas por sobrerrechazo, la variante abliterada reduce las negativas injustificadas.
- Base para ajuste fino posterior: al estar en GGUF Q6_K, sirve como referencia de comportamiento, aunque para reentrenar habria que recurrir a los pesos originales en safetensors del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y tampoco se aportan mediciones de latencia o throughput mas alla de la mencion de que el modelo se ha probado en una T4 de 15 GB.

## Requisitos de hardware

- VRAM estimada: el autor confirma ejecucion en una GPU T4 con 15 GB de VRAM usando el archivo Q6_K, que ocupa aproximadamente 9-10 GB para 11.9B parametros, mas el proyector mmproj F16 y la cache KV.
- GPU recomendadas: T4 (validada por el autor); por capacidad, cualquier GPU con 16 GB o mas, como RTX 4080, RTX 4090, A10, L4 o superiores.
- Cabe en GPU de consumo: si, en tarjetas con 16 GB o mas de VRAM para Q6_K; en tarjetas de 12 GB habria que recurrir a cuantizaciones menores, que no estan publicadas en este repositorio.
- Opciones de despliegue: llama.cpp y llama-server (comando documentado: `llama-server -m <fichero>.gguf --jinja -ngl 99 -fa on`). vLLM, TGI y Ollama no estan documentados para este artefacto.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Estado |
|---|---|---|---|---|---|
| cypher-Gemma-4-12B-heretic | 11.907.350.576 | no disponible | GGUF Q6_K + mmproj F16 | Gemma Terms of Use | Republicacion de terceros |
| google/gemma-4-12b-it | 12B (aproximado) | no disponible | safetensors | Gemma Terms of Use | Modelo oficial de Google |
| culturerevolt/gemma-4-12b-heretic-abliterated-GGUF | 12B (aproximado) | no disponible | GGUF | Gemma Terms of Use | Origen directo de esta republicacion |

La comparacion con otras familias (Qwen, Llama, Mistral) no esta disponible en la informacion proporcionada, y no se aportan datos de rendimiento que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La ablacion elimina parcialmente el comportamiento de rechazo: el modelo puede producir contenido danino, ilegal o inseguro que el Gemma 4 original bloquearia. No debe desplegarse en produccion orientada al publico sin filtros externos.
- La Gemma Prohibited Use Policy sigue aplicandose: la licencia Gemma restringe usos concretos y el autor no puede relajar esas condiciones por el hecho de republicar los pesos.
- Riesgo de alucinacion: no hay evaluaciones publicadas para esta variante; la ablacion puede degradar la coherencia y la calibracion respecto al modelo original.
- Idiomas, contexto y capacidades de tool calling no documentados: cualquier decision de produccion basada en ellos requiere validacion empirica.
- Trazabilidad limitada: es una republicacion de terceros de un modelo de terceros; no hay garantia de integridad de los pesos mas alla de la declaracion del autor.
- El repositorio solo ofrece Q6_K; no hay cuantizaciones menores para GPUs de 12 GB o menos, ni pesos en safetensors.
- El modelo base google/gemma-4-12b-it no esta verificado en esta ficha; los datos de arquitectura y contexto proceden unicamente de la designacion del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TheShellMaster/cypher-Gemma-4-12B-heretic
- Origen de los pesos: https://huggingface.co/culturerevolt/gemma-4-12b-heretic-abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
