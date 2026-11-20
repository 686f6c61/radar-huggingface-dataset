# tm13911391/rayan-gguf

## Resumen

rayan-gguf es un artefacto de distribucion derivado de google/gemma-3-1b-it, el modelo de lenguaje instructivo de 1.000 millones de parametros publicado por Google DeepMind dentro de la familia Gemma 3. No se trata de un ajuste fino ni de una nueva arquitectura: el autor, tm13911391, ha tomado la cuantizacion Q4_K_M publicada por ggml-org en formato GGUF y la ha troceado en fragmentos binarios de 88 MB o menos, acompanados de un `manifest.json` que indica el orden de union y el sha256 del fichero original. El objetivo declarado es servir como modelo de respaldo en el navegador mediante wllama (llama.cpp compilado a WebAssembly) para la aplicacion Rayan, cuando el servidor central no esta disponible.

El interes practico del repositorio no esta en el modelo en si, sino en el patron de empaquetado: fragmentar un GGUF en trozos pequenos facilita la carga incremental por HTTP y el almacenamiento en cache del navegador, algo relevante para despliegues edge sin backend. El modelo subyacente, Gemma 3 1B IT, es un transformer decoder-only con ventana de contexto de 32.000 tokens, entrenado por Google con datos multilingues y alineado por instrucciones, lo que lo hace util para tareas ligeras de generacion y comprension en cliente.

La relevancia actual es doble: por un lado, demuestra una via de distribucion de LLM en entornos web sin servidor; por otro, al estar etiquetado con el idioma persa (`persian`), sugiere un uso orientado a una aplicacion de habla persa, aunque el modelo base no ha sido ajustado especificamente para ese idioma. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha, y su licencia es la Gemma Terms of Use.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 3) |
| Parametros totales | 1.000 millones (modelo base google/gemma-3-1b-it) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.000 tokens (modelo base Gemma 3 1B IT) |
| Tipos de cuantizacion | Q4_K_M (unica incluida en el repo) |
| Idiomas soportados | no disponibles en la model card; el modelo base Gemma 3 es multilingue y el autor etiqueta `persian` |
| Licencia | Gemma Terms of Use (tag `license:gemma`) |
| Formato de pesos | GGUF troceado en fragmentos de <=88 MB + `manifest.json` con orden y sha256 |
| Tamano del repositorio | 0,8 GB |
| Modelo base | google/gemma-3-1b-it |
| Runtime previsto | wllama / llama.cpp WASM (navegador) |

## Arquitectura y entrenamiento

El modelo subyacente es Gemma 3 1B IT, un transformer decoder-only de 1.000 millones de parametros desarrollado por Google DeepMind. La model card del repositorio no aporta informacion sobre la composicion del dataset de entrenamiento, el numero de tokens vistos, ni si hubo fases de RLHF o DPO; esos detalles corresponden a la documentacion oficial de Gemma 3 y no se reproducen aqui porque no estan en la informacion proporcionada. Lo que si es seguro es que el fichero incluido es una cuantizacion Q4_K_M generada por ggml-org, es decir, pesos de 4 bits con escalas por bloque y un esquema K-quant que preserva mejor las capas sensibles que una cuantizacion Q4_0 clasica.

La innovacion tecnica de este repositorio no es arquitectonica sino de empaquetado: el GGUF original se divide en fragmentos de como maximo 88 MB, y un `manifest.json` lista los trozos en orden junto con el sha256 del fichero reconstruido. Esto permite descargar el modelo por partes, verificar la integridad tras la union y almacenarlo en Cache Storage del navegador, lo que encaja con el runtime wllama (llama.cpp compilado a WebAssembly). No hay decodificacion especulativa, atencion lineal ni modulos SSM: es un transformer denso estandar cuantizado.

## Capacidades

- Generacion de texto conversacional en modo instruct, heredada del ajuste IT de Gemma 3 1B.
- Razonamiento basico y respuesta a preguntas de dominio general, limitado por el tamano de 1B parametros.
- Generacion de codigo sencillo y explicaciones tecnicas breves.
- Capacidades multilingues heredadas del modelo base; el autor etiqueta el repositorio como `persian`, aunque no hay evidencia de un ajuste especifico para persa.
- Ejecucion en navegador mediante wllama/llama.cpp WASM, sin necesidad de backend.
- Carga incremental por fragmentos con verificacion sha256 a traves del `manifest.json`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking en la informacion disponible.

## Casos de uso

- Respaldo offline en aplicacion web: cuando el servidor central de Rayan no responde, el cliente descarga los fragmentos del GGUF, los une, verifica el sha256 y ejecuta el modelo en el navegador con wllama para mantener la conversacion.
- Demos de LLM sin backend: util para prototipos estaticos alojados en Hugging Face Spaces o GitHub Pages donde no se quiere pagar inferencia en servidor.
- Asistente de texto ligero en persa: el etiquetado `persian` sugiere su uso en una app de habla persa; sirve para respuestas cortas y borradores, no para tareas de alta precision.
- Procesamiento de texto en el cliente por privacidad: al ejecutarse en el navegador, los datos del usuario no salen del dispositivo, adecuado para resumenes o reescritura de textos sensibles.
- Educacion y experimentacion: permite a desarrolladores probar el pipeline completo de descarga fragmentada, union, verificacion y ejecucion WASM sin infraestructura.
- Generacion de borradores y autocompletado en formularios web: con 1B parametros y Q4_K_M la latencia es aceptable para sugerencias cortas en CPU del cliente.
- Pruebas de integracion de llama.cpp en entornos restringidos: sirve como fixture para validar cargadores GGUF que soportan ficheros troceados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos, y este repositorio es un reempaquetado de una cuantizacion, no un modelo nuevo, por lo que los benchmarks aplicables serian los de google/gemma-3-1b-it y los de su version Q4_K_M, que no se proporcionan aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 0,8 GB en Q4_K_M; en ejecucion el modelo ocupa aproximadamente ese tamano mas overhead de contexto y buffers, del orden de 1 a 1,5 GB de RAM/VRAM segun longitud de contexto.
- GPU recomendadas: cualquier GPU con >=2 GB de VRAM puede alojarlo; RTX 3060, RTX 4060, RTX 4090, A100 y H100 lo ejecutan con holgura, aunque el modelo esta pensado para CPU y navegador.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Despliegue: wllama (llama.cpp WASM) es el runtime previsto; tambien es compatible con llama.cpp nativo, Ollama, LM Studio y servidores GGUF como llama-cpp-python. vLLM y TGI no soportan GGUF de forma nativa para este formato troceado.
- Latencia y throughput: no disponibles; en navegador con WASM y Q4_K_M se espera un throughput bajo (del orden de decenas de tokens por segundo en hardware moderno), pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rayan-gguf (este repo) | 1B | 32.000 tokens (heredado) | GGUF Q4_K_M troceado | Gemma Terms of Use | Hugging Face, 0 descargas |
| google/gemma-3-1b-it | 1B | 32.000 tokens | safetensors | Gemma Terms of Use | Hugging Face, oficial |
| ggml-org/gemma-3-1b-it-GGUF | 1B | 32.000 tokens | GGUF (varias cuantizaciones) | Gemma Terms of Use | Hugging Face, oficial de ggml-org |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | safetensors, GGUF | Apache 2.0 | Hugging Face |

La comparativa relevante es contra el GGUF original de ggml-org: rayan-gguf no anade capacidades, solo fragmenta el fichero y anade un manifiesto. Frente a Qwen2.5-1.5B-Instruct, la diferencia clave es la licencia (Gemma Terms of Use frente a Apache 2.0) y el tamano (1B frente a 1,5B). No hay datos de rendimiento comparativo en la informacion disponible.

## Limitaciones y advertencias

- Modelo de 1B parametros: capacidad de razonamiento y conocimiento factual limitada; propenso a errores en matematicas, codigo complejo y preguntas de nicho.
- Riesgo de alucinacion alto en tareas abiertas, agravado por la cuantizacion Q4_K_M, que introduce perdida adicional de precision frente a los pesos originales.
- No hay evidencia de ajuste especifico para persa pese a la etiqueta `persian`; el rendimiento en ese idioma dependera del modelo base y no esta documentado.
- La licencia Gemma Terms of Use impone restricciones de uso comercial y una politica de usos prohibidos; es obligatorio revisarlas antes de desplegar en produccion.
- El repositorio no incluye el GGUF completo sino fragmentos; cualquier consumidor debe implementar la union ordenada y la verificacion sha256 del `manifest.json`, lo que anade complejidad de integracion.
- Sin descargas ni likes: no hay evidencia de uso en produccion ni de validacion por la comunidad.
- Ejecucion en navegador limitada por memoria del dispositivo y por el rendimiento de WebAssembly; no apto para contextos largos en moviles de gama baja.
- No se documentan capacidades de tool calling, agentes ni vision; no debe asumirse que las hereda del modelo base sin verificacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tm13911391/rayan-gguf
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- GGUF original de ggml-org: https://huggingface.co/ggml-org/gemma-3-1b-it-GGUF
- Aplicacion Rayan (demo estatica): https://tm13911391-rayan.static.hf.space
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
