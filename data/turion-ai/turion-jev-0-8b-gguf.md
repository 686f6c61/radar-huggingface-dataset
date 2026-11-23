# turion-ai/turion-jev-0.8b-GGUF

## Resumen
Turion Jev 0.8B GGUF es la version cuantizada en formato GGUF del modelo Turion Jev 0.8B de Turion AI, un modelo de decision (decision model) disenado especificamente para clasificacion y enrutamiento. A diferencia de un modelo generativo convencional, no produce texto: dado un estado (por ejemplo, el texto de una consulta de cliente) y un conjunto de preguntas tipadas (opcion multiple, si/no o puntuacion de 0 a 5), devuelve una probabilidad para cada opcion en un unico forward pass. Esta version GGUF esta pensada para su uso con llama.cpp y con el paquete `turion_jev` que acompana al repositorio.

El modelo base cuenta con 752.393.024 parametros reales (segun safetensors) y se distribuye bajo licencia Apache-2.0. El repositorio GGUF ocupa 1.4 GB e incluye dos cuantizaciones: Q4_K_M (0.53 GB) y Q8_0 (0.81 GB). La ventana de contexto por defecto del servidor es de 16.384 tokens, y las peticiones que la exceden se rechazan en lugar de truncarse.

Su relevancia actual reside en la especializacion: en lugar de emplear un LLM generativo para tareas de enrutamiento o clasificacion, Turion Jev resuelve la decision leyendo directamente los logits de los codigos de opcion tras un prompt fijo, con una latencia mediana de 23-26 ms por peticion en una NVIDIA H200. Esto lo hace adecuado para arquitecturas de "system one" o decision index dentro de pipelines de agentes, donde se necesita una clasificacion rapida y calibrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de decision; inferencia via llama.cpp) |
| Parametros totales | 752.393.024 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens por defecto en el servidor (`--n-ctx` configurable) |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (y BF16 como referencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (repo GGUF); pesos base en safetensors |

## Arquitectura y entrenamiento
La informacion disponible no detalla la arquitectura interna del modelo base (tipo de transformer, numero de capas, dimensiones ocultas ni mecanismo de atencion). Se sabe que es un modelo de decision que, tras un prompt fijo, lee los logits correspondientes a los codigos de opcion y los escala mediante una temperatura especifica por tipo de pregunta. Los ficheros que acompanan al `.gguf` (`prompt_config.json`, `calibration.json`, el tokenizer de entrenamiento y el paquete `turion_jev`) implementan la construccion del prompt y la lectura de logits a traves de llama-cpp-python.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card menciona una metrica propia denominada "Proxy Full", calculada como 0.6 x dominios vistos + 0.4 x dominios nuevos sobre conjuntos de validacion de 600 preguntas por conjunto, con correccion por azar; se trata de una medida del autor, no del Decision Index.

## Capacidades
- Clasificacion de texto mediante preguntas tipadas: opcion multiple (`choice`), si/no (`noul`) y puntuacion de 0 a 5.
- Devuelve una distribucion de probabilidad sobre todas las opciones en un unico forward pass, en lugar de muestrear un unico token.
- Enrutamiento de consultas a equipos o categorias (por ejemplo, billing, tech, sales, other).
- Decisiones binarias y de urgencia (por ejemplo, "necesita respuesta hoy").
- Puntuacion ordinal de 0 a 5 sobre criterios definidos por el usuario.
- Integracion con llama.cpp y con el paquete `turion_jev` (backend `gguf`).
- Servidor compatible con peticiones `POST /v1/systemone` de TypeSafe.
- No genera texto libre; no es un modelo conversacional ni de chat.

## Casos de uso
- Enrutamiento de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de que corresponda a billing, tech, sales u other, permitiendo asignar el ticket al equipo adecuado con una sola peticion de ~25 ms en H200.
- Triaje de urgencia: clasificar si una consulta requiere respuesta el mismo dia mediante una pregunta `noul`, util para priorizar colas de atencion.
- Clasificacion de intenciones en agentes: dentro de un pipeline multi-paso, usar el modelo como "system one" para decidir la siguiente accion o herramienta antes de invocar un LLM generativo.
- Moderacion o etiquetado por puntuacion: asignar una puntuacion de 0 a 5 a un texto segun criterios definidos (por ejemplo, toxicidad o calidad), obteniendo la distribucion completa sobre las seis opciones.
- Filtrado previo en pipelines de datos: clasificar grandes volumenes de documentos con Q4_K_M (0.53 GB) en hardware modesto antes de procesarlos con modelos mayores.
- Decision index y calibracion: integrar las probabilidades devueltas en un indice de decision propio, aprovechando la calibracion por tipo de pregunta incluida en `calibration.json`.
- Despliegue en local o en el borde: el tamano de 0.53 GB en Q4_K_M permite ejecutarlo en entornos con recursos limitados usando llama.cpp.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta la metrica propia "Proxy Full" y la latencia:

| Metrica | Q4_K_M | Q8_0 | BF16 (referencia) |
|---|---:|---:|---:|
| Proxy Full (0.6 x vistos + 0.4 x nuevos, corregido por azar) | 68.20 | 67.06 | 67.78 |
| Tamano del fichero | 0.53 GB | 0.81 GB | no disponible |
| Tiempo de peticion (mediana, 1 peticion a la vez, NVIDIA H200) | 26 ms | 23 ms | no disponible |

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 0.6-0.9 GB para los pesos en Q4_K_M/Q8_0, mas el overhead del contexto (16.384 tokens por defecto) y de llama.cpp; en la practica, unos pocos GB.
- GPU recomendadas: NVIDIA H200 segun las mediciones del autor; cualquier GPU con suficiente VRAM para el contexto configurado.
- Cabe en GPU de consumo: si, gracias al tamano reducido de las cuantizaciones (0.53 GB en Q4_K_M), aunque no se especifican modelos concretos de GPU de consumo.
- Opciones de despliegue: llama.cpp via llama-cpp-python, servidor `python -m turion_jev.serve --backend gguf`; no se mencionan vLLM, TGI ni Ollama.
- Latencia: mediana de 23 ms (Q8_0) y 26 ms (Q4_K_M) por peticion en una NVIDIA H200, con una peticion a la vez. No se proporcionan datos de throughput.

## Comparativa con modelos similares
No se dispone de informacion sobre modelos comparables de la misma categoria (modelos de decision especializados) en la informacion proporcionada. La unica comparacion disponible es interna, entre las cuantizaciones del propio modelo (Q4_K_M, Q8_0 y BF16), recogida en la tabla de benchmarks.

## Limitaciones y advertencias
- No genera texto: no puede usarse como modelo conversacional ni de chat; un `chat completion` convencional muestrearia un token y perderia las probabilidades.
- Contexto limitado a 16.384 tokens por defecto; las peticiones mas largas se rechazan, nunca se truncan.
- Idiomas soportados no disponibles: se desconoce el rendimiento fuera de los idiomas de entrenamiento.
- La metrica "Proxy Full" es una medida propia del autor, no un benchmark estandar ni el Decision Index; no es directamente comparable con metricas publicas.
- No se han publicado datos sobre sesgos, tasas de alucinacion ni evaluaciones independientes.
- Los datos de latencia corresponden a una unica GPU (H200) y a una peticion a la vez; el rendimiento en otros entornos puede diferir.
- Licencia Apache-2.0: permite uso comercial, pero deben respetarse los ficheros `LICENSE` y `NOTICE`.
- Requiere los ficheros auxiliares (`prompt_config.json`, `calibration.json`, tokenizer y paquete `turion_jev`) para construir el prompt y leer los logits correctamente; usar solo el `.gguf` no es suficiente.

## Enlaces
- Repositorio GGUF: https://huggingface.co/turion-ai/turion-jev-0.8b-GGUF
- Modelo base: https://huggingface.co/turion-ai/turion-jev-0.8b
- Fichero Q4_K_M: https://huggingface.co/turion-ai/turion-jev-0.8b-GGUF/blob/main/turion-jev-0.8b-Q4_K_M.gguf
- Fichero Q8_0: https://huggingface.co/turion-ai/turion-jev-0.8b-GGUF/blob/main/turion-jev-0.8b-Q8_0.gguf
