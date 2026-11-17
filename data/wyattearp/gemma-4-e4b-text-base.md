# wyattearp/Gemma-4-E4B-text-base

## Resumen

Gemma-4-E4B-text-base es una extraccion text-only del modelo instructivo Gemma-4-E4B-it de Google DeepMind, publicada por el usuario wyattearp en Hugging Face. El checkpoint elimina las torres multimodales (vision y audio) y sus proyectores de atencion cruzada, conservando intactos los pesos del transformer de lenguaje (`model.language_model.*`), que segun el autor son identicos bit a bit a los del modelo original. El resultado es un backbone puro de lenguaje orientado a generacion de texto, ingenieria de software y despliegues con tool calling.

El modelo parte de la familia Gemma 4 de Google, con una ventana de contexto de 131.072 tokens y un vocabulario de 256.000 tokens. El repositorio ocupa 15,1 GB en safetensors y declara 7.518.069.034 parametros totales en los pesos, aunque la model card del autor indica "~4,2B parametros"; esta discrepancia probablemente refleja el conteo de parametros activos frente a los totales (el sufijo "E4B" sugiere una arquitectura con expertos), pero no se dispone de informacion que lo confirme.

La relevancia de esta ficha radica en su caracter practico: al eliminar los componentes multimodales se reduce la VRAM reservada a buffers del vision transformer y se simplifica el preprocesado en motores de inferencia como vLLM, TensorRT-LLM o llama.cpp. Es una opcion util para equipos que solo necesitan texto y quieren evitar la sobrecarga de dependencias multimodales, siempre asumiendo que hereda la licencia Gemma de Google y que su publicacion es de un tercero, no oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only derivado de Gemma 4 (torres multimodales eliminadas); posible arquitectura con expertos segun el sufijo "E4B", no confirmado |
| Parametros totales | 7.518.069.034 (safetensors); la model card indica "~4,2B" |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | no disponible (el autor solo documenta bfloat16 para vLLM) |
| Idiomas soportados | en |
| Licencia | Gemma Terms of Use (heredada de Google DeepMind) |
| Formato de pesos | safetensors (compatible con transformers >= 4.40.0) |

Otros datos: tamano del repositorio 15,1 GB, vocabulario de 256.000 tokens, pipeline text-generation, libreria transformers, modelo base google/gemma-4-E4B-it.

## Arquitectura y entrenamiento

El modelo es una extraccion de los pesos del transformer de lenguaje del checkpoint instructivo Gemma-4-E4B-it. El autor afirma que los parametros bajo `model.language_model.*` son identicos bit a bit al release upstream, de modo que no hay un reentrenamiento ni un fine-tuning propio: la intervencion consiste en decoupling y eliminacion de las proyecciones multimodales (torres de vision y audio) y de los proyectores de atencion cruzada. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset ni procesos de RLHF o DPO en la informacion disponible; todo ello corresponde al modelo base de Google, cuya model card no se incluye en la informacion proporcionada.

Como innovaciones tecnicas destacables, la model card menciona la reduccion de VRAM al prescindir de los buffers del vision transformer y de los parametros de los proyectores, la simplificacion del preprocesado de entradas multimodales en motores de serving y la fidelidad de pesos respecto al original. Tambien se documenta un bugfix relevante para el parser de tool calling de Gemma 4 en vLLM (issue #54256, PR #54257), que soporta llamadas con `call:` sin espacios y transiciones de canal sin espacios en blanco. No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo instructivo base.
- Razonamiento y generacion de codigo, orientados segun el autor a cargas de trabajo de software engineering.
- Tool calling y function calling, con soporte de parser dedicado en vLLM (`--tool-call-parser gemma4`) y seleccion automatica de herramientas (`--enable-auto-tool-choice`).
- Razonamiento multi-paso mediante el parser de razonamiento de vLLM (`--reasoning-parser gemma4`), presumiblemente asociado a modos de pensamiento del modelo base.
- Contexto largo de 131.072 tokens, adecuado para conversaciones multi-turno extensas y documentos largos.
- Capacidades multilingues limitadas: solo se declara ingles (`en`) en los metadatos.
- Sin capacidades de vision ni audio: precisamente han sido eliminadas en esta extraccion.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y despliegue con transformers y vLLM.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a sus 131.072 tokens de ventana, manteniendo el historial completo de la interaccion sin truncamientos agresivos.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD o asistentes de IDE que necesiten invocar funciones externas (ejecutar tests, consultar repositorios) mediante el parser `gemma4` de vLLM.
- Agentes autonomos de multiple paso: el parser de razonamiento de vLLM permite separar el razonamiento interno de la respuesta final, util para agentes que planifican y ejecutan subtareas encadenadas.
- Procesamiento de documentos largos en ingles: con 131.072 tokens de contexto puede resumir, extraer entidades o responder preguntas sobre contratos, informes tecnicos o documentacion extensa en una sola pasada.
- Servicio de inferencia text-only de bajo coste: al eliminar las torres multimodales se reduce la VRAM y se simplifica el despliegue en vLLM o TensorRT-LLM, lo que abarata el coste por peticion en entornos donde no se necesita vision ni audio.
- Base para fine-tuning posterior: al ser un backbone de lenguaje limpio con pesos fieles al original, sirve como punto de partida para adaptaciones especificas de dominio (soporte, legal, codigo) sin arrastrar dependencias multimodales.
- Evaluacion y benchmarking de la componente de lenguaje: util para aislar el rendimiento textual de Gemma-4-E4B-it en pruebas comparativas, sin interferencia de los modulos de vision o audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 15 GB solo para pesos (7.518 millones de parametros x 2 bytes), mas overhead de cache KV para el contexto; con 131.072 tokens el consumo de cache KV puede ser considerable y depende de la configuracion de atencion, no disponible.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 7,5-8 GB para pesos, mas cache KV.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4 GB para pesos, mas cache KV; los tipos de cuantizacion concretos no estan documentados por el autor.
- GPU recomendadas: no disponible de forma explicita; por tamano, cabria en GPUs de 24 GB (RTX 4090, A10G, L4) en bfloat16 con contexto moderado, y en GPUs de 40-80 GB (A100, H100) para contexto completo de 131.072 tokens.
- Cabe en GPU consumer: probablemente si en RTX 4090 (24 GB) con cuantizacion o contexto reducido; no confirmado por el autor.
- Opciones de despliegue: vLLM (documentado con `--dtype bfloat16 --max-model-len 131072 --tool-call-parser gemma4 --reasoning-parser gemma4 --enable-auto-tool-choice`), transformers >= 4.40.0, y presumiblemente TensorRT-LLM y llama.cpp segun menciona el autor, aunque sin comandos documentados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-text-base (este) | 7.518 M (safetensors); ~4,2B segun model card | 131.072 | en | Gemma Terms of Use | Extraccion text-only no oficial de Gemma-4-E4B-it |
| google/gemma-4-E4B-it | no disponible | no disponible | no disponible | Gemma Terms of Use | Modelo base oficial de Google con capacidades multimodales |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar rendimiento con alternativas concretas; no se inventan cifras.

## Limitaciones y advertencias

- Modelo publicado por un tercero (wyattearp), no por Google DeepMind; no es un release oficial y carece de validacion independiente.
- Solo soporta ingles segun los metadatos; no se declaran otros idiomas.
- Sin capacidades de vision ni audio por diseno; no apto para tareas multimodales.
- Riesgo de alucinacion inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion proporcionada; deben asumirse los del modelo base Gemma-4-E4B-it.
- Licencia Gemma Terms of Use: impone restricciones de uso comercial y obligaciones de cumplimiento que deben revisarse antes de desplegar en produccion.
- Discrepancia entre el numero de parametros de safetensors (7.518 M) y el indicado en la model card (~4,2B); conviene verificar el conteo real y la arquitectura antes de planificar recursos.
- Dependencia de un bugfix reciente en vLLM para el parser de tool calling de Gemma 4; versiones antiguas pueden fallar con llamadas sin espacios.
- El contexto de 131.072 tokens implica un consumo elevado de cache KV; el maximo practico dependera del hardware y de la configuracion de serving.
- No se documentan tipos de cuantizacion ni latencias, lo que dificulta la planificacion de capacidad.

## Enlaces

- Hugging Face: https://huggingface.co/wyattearp/Gemma-4-E4B-text-base
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma: https://ai.google.dev/gemma/terms
- Bug report vLLM: https://github.com/vllm-project/vllm/issues/54256
- Pull request vLLM: https://github.com/vllm-project/vllm/pull/54257
