# Thox-ai/thox-cluster-swift

## Resumen

thox-cluster-swift es una distribucion configurada y empaquetada por THOX.ai del modelo Ministral 3 8B Instruct de Mistral AI. No se trata de un modelo entrenado desde cero ni de un fine-tune: los pesos son byte-identicos a los de la distribucion oficial de Ollama del modelo base (verificado por SHA-256 en la revision de release del 31 de octubre de 2026), y el trabajo de THOX se concentra en la capa de configuracion, empaquetado y documentacion orientada a su tecnologia de clustering entre dispositivos MeshStack y MagStack.

El modelo resuelve el caso de inferencia local en hardware modesto y despliegues distribuidos entre varios dispositivos conectados fisicamente mediante pines magneticos (MagStack) o mediante la malla inalambrica patentada de THOX. Se distribuye como GGUF cuantizado en Q4_K_M con un tamano de descarga de 6,0 GB, lo que lo situa como la variante mas ligera de la familia de clusters de THOX.

Es relevante ahora porque representa un patron creciente en el ecosistema open source: distribuciones de terceros que no modifican pesos pero si el entorno de despliegue. La model card incluye una correccion explicita de afirmaciones previas sobre rendimiento (tokens por segundo, latencia de primer token, concurrencia y uptime) que fueron retiradas por carecer de medicion real, lo que conviene tener en cuenta al evaluarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de Ministral 3 8B Instruct; no se detalla en la informacion disponible) |
| Parametros totales | 8B |
| Parametros activos | no disponible (no es MoE segun la informacion) |
| Longitud de contexto | 32K tokens (num_ctx 32768 en la configuracion Ollama; la cifra de 256K de la etiqueta latest se describe como artefacto de visualizacion) |
| Tipos de cuantizacion | Q4_K_M (GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (distribucion Ollama); el repositorio de HuggingFace contiene unicamente el archivo .gitattributes |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Ministral 3 8B Instruct de Mistral AI, un transformer de 8B parametros. La informacion proporcionada no detalla la arquitectura interna del modelo base (tipo de atencion, capas, dimensiones ocultas ni innovaciones especificas como decodificacion especulativa). THOX declara explicitamente que no realizo ningun entrenamiento, fine-tuning ni aporto datasets para esta release: los pesos son identicos a los de la distribucion upstream de Ollama y permanecen bajo los terminos de licencia del proveedor original.

El valor anadido de THOX reside en la capa de orquestacion MeshStack, que permite repartir el modelo y el computo entre varios dispositivos de la familia ThoxNova, compartiendo memoria y carga de trabajo. Esta capa es independiente de la descarga del modelo y no forma parte de los pesos. La configuracion de runtime incluida sirve el modelo con una ventana de contexto de 32768 tokens.

## Capacidades

- Generacion de texto y asistencia conversacional interactiva.
- Procesamiento de imagen y texto (pipeline image-text-to-text), con vision y herramientas segun la ficha de Ollama.
- Soporte de tool calling segun la ficha de Ollama.
- Lectura de documentos y graficos dentro de las capacidades del modelo base.
- Inferencia local en hardware modesto.
- Despliegue distribuido entre multiples dispositivos mediante MeshStack (capa separada de la descarga).
- Idiomas: limitado al ingles segun los metadatos.
- Modo thinking, audio y otras capacidades especiales: no disponible en la informacion.

## Casos de uso

- Chat local interactivo en equipos de gama media: el modelo cabe en 6,0 GB y se ejecuta via Ollama, lo que permite asistencia conversacional sin conexion en portatiles y estaciones de trabajo modestas.
- Inferencia de alto volumen con consultas cortas: al ser un modelo de 8B cuantizado en Q4_K_M, es adecuado para tareas de clasificacion, extraccion o respuesta rapida donde no se requiere razonamiento de frontera.
- Lectura de documentos y graficos: el pipeline image-text-to-text permite procesar capturas, tablas e imagenes de documentos dentro de los limites del modelo base.
- Despliegue en cluster de dispositivos ThoxNova: mediante MeshStack se puede repartir el modelo y el computo entre varios dispositivos apilados fisicamente con MagStack o conectados por la malla inalambrica.
- Prototipado y evaluacion de pipelines con tool calling: la ficha de Ollama indica soporte de herramientas, util para integrar el modelo en flujos que consultan APIs o ejecutan funciones.
- Entornos con requisitos de local-first y privacidad: al ejecutarse integramente en local, los datos no salen del dispositivo, lo que encaja en escenarios con restricciones de soberania de datos.
- Pruebas de concepto de inferencia distribuida en edge: sirve como banco de pruebas para la capa de orquestacion de THOX antes de escalar a modelos mayores de la familia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras de rendimiento que aparecian en versiones anteriores (tokens por segundo, latencia de primer token, concurrencia y uptime) fueron retiradas por carecer de medicion de despliegue de THOX, y que la evaluacion independiente de THOX esta pendiente. Cualquier cifra citada del modelo base corresponderia a Mistral y no ha sido re-ejecutada para esta publicacion.

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,0 GB para el archivo GGUF Q4_K_M, mas overhead de contexto (la ventana configurada es de 32768 tokens, lo que incrementa el consumo de memoria KV).
- GPU recomendadas: no especificadas en la informacion. Por tamano, el modelo es apto para GPU de consumo con 8 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM; en configuraciones con menos memoria puede requerir offloading parcial a CPU.
- Opciones de despliegue: Ollama (`ollama run Thox-ai/thox-cluster-swift`); orquestacion distribuida mediante MeshStack (capa separada). Otros runtimes (vLLM, llama.cpp, TGI) no se mencionan en la informacion.
- Latencia y throughput: no disponibles; THOX declara explicitamente que no reclama cifras de rendimiento para esta release.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| thox-cluster-swift | 8B | 32K | Q4_K_M GGUF | Apache 2.0 | Distribucion THOX de Ministral 3 8B; pesos identicos al upstream |
| thox-pro-8b | 8B | no disponible | no disponible | Apache 2.0 | Misma capa de pesos (SHA-256 identico); empaquetado para uso en un solo dispositivo |
| Ministral 3 8B Instruct (upstream) | 8B | no disponible en la informacion | no disponible | Apache 2.0 | Modelo base de Mistral AI; misma licencia y pesos |

La comparativa con alternativas de otros proveedores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Optimizado para velocidad y consultas rapidas, no para razonamiento de frontera; un modelo de 8B tiene los limites propios de su clase.
- Riesgo de alucinacion inherente a modelos de este tamano; se recomienda verificar salidas importantes.
- El comportamiento y la velocidad dependen enteramente del hardware y la configuracion del operador.
- Idiomas: los metadatos indican solo ingles; el rendimiento en castellano no esta documentado.
- La model card corrige afirmaciones previas: se retiraron cifras de tokens por segundo, latencia, concurrencia y uptime por no estar medidas, y se corrigio la licencia de MIT a Apache 2.0.
- El repositorio de HuggingFace contiene solo el archivo .gitattributes; el build ejecutable se sirve desde Ollama.
- La capa de clustering MeshStack es independiente de la descarga y no esta incluida en los pesos.
- Licencia Apache 2.0: permite uso comercial, pero los pesos siguen los terminos del proveedor upstream; conviene revisar la ficha del modelo base.
- La evaluacion independiente de THOX esta pendiente; no hay mediciones verificadas de rendimiento en produccion.

## Enlaces

- HuggingFace: https://huggingface.co/Thox-ai/thox-cluster-swift
- Ollama: https://ollama.com/Thox-ai/thox-cluster-swift
- Modelo base: https://huggingface.co/mistralai/Ministral-3-8B-Instruct-2512
- Sitio de THOX: https://thox.ai
