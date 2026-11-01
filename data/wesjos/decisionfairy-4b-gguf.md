# wesjos/DecisionFairy-4B-GGUF

## Resumen

DecisionFairy-4B-GGUF es la distribucion en formato GGUF de DecisionFairy-4B, un modelo de decision desarrollado por el usuario wesjos sobre el backbone Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto: recibe un estado (un prompt descriptivo) y un conjunto de preguntas tipadas, y devuelve respuestas estructuradas con probabilidades en una sola pasada forward. El modelo integra en un unico fichero GGUF tanto el backbone como la cabeza de decision, usando una arquitectura propia denominada `clef` en llama.cpp.

La relevancia de este modelo radica en su enfoque: en lugar de pedir a un LLM que genere JSON con decisiones, se entrena una cabeza especifica que evalua todas las preguntas de forma conjunta. Esto elimina la variabilidad del parseo de texto libre y permite obtener probabilidades calibrables por opcion. El modelo soporta tres tipos de pregunta: `noul` (probabilidad si/no), `choice` (una opcion entre hasta 255) y `score` (entre 2 y 10 niveles ordenados).

Con 4.237.797.892 parametros totales y un repo de 7,3 GB, se distribuye bajo licencia Apache-2.0 heredada de Qwen3.5-4B. El modelo tiene 189 descargas y ningun like en el momento de la consulta, lo que indica un proyecto reciente y de nicho, orientado a integraciones via API compatible con endpoints (`/v1/systemone`) en llama-server.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3.5-4B) con cabeza de decision; arquitectura GGUF `clef` |
| Parametros totales | 4.237.797.892 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en el lanzador por defecto; ampliable con `-c` y `--ubatch-size` |
| Tipos de cuantizacion | Q8_0 (4,21 GiB) y Q4_K_M (2,55 GiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se apoya en el backbone Qwen3.5-4B y anade una cabeza de decision especifica que se evalua de forma conjunta con el estado de entrada. En GGUF, la arquitectura se identifica como `clef` (`clef.decision.{block_count, routing_block_count, head_count}`), implementada en `src/models/clef.cpp` de llama.cpp con el identificador `LLM_ARCH_CLEF`. El modelo evalua todo el prompt en un unico batch, por lo que el estado y las preguntas deben caber en `--ubatch-size` (por defecto 512).

Los datasets de entrenamiento declarados en la model card son `LocalLLaMA/typed-decisions` y `SargeDev/jev-distill-corpus-v3`, con mencion a Unsloth en las etiquetas. No se detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO. Las probabilidades de salida se escalan con temperaturas almacenadas en el fichero, pero el autor advierte que no estan garantizadas como calibradas para datos del usuario. El presupuesto de entrenamiento es de 1024 tokens, por lo que se recomienda mantener el estado y las preguntas cortos.

## Capacidades

- Toma de decisiones tipadas: responde preguntas de tipo `noul` (probabilidad si/no), `choice` (una opcion entre hasta 255) y `score` (2 a 10 niveles ordenados).
- Evaluacion conjunta: todos los campos se deciden en una sola pasada forward, lo que mantiene coherencia entre preguntas relacionadas.
- Salida estructurada con probabilidades por opcion y campo `confidence`.
- Servicio via API: expone `/v1/systemone` en llama-server y `GET /v1/models` reporta `"output_modalities": ["decisions"]`.
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en el repo.
- Entrada solo texto: no hay `mmproj` publicado, por lo que los campos `images` y `files` de `/v1/systemone` no estan disponibles en este repo.
- No genera texto: es un modelo de decision puro, sin capacidad de generacion libre.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como tal; el modelo devuelve decisiones, no cadenas de accion.
- Capacidades multilingues: no disponibles (no se declaran idiomas).

## Casos de uso

- Triaje de incidentes en produccion: enviar el estado del sistema (por ejemplo, "la API devuelve 502 y la latencia p99 es de 15 s") y preguntas tipadas de severidad (`choice` P0/P1/P2), escalado a guardia (`noul`) y urgencia (`score`), obteniendo probabilidades por opcion en una sola llamada.
- Enrutamiento de tickets de soporte: clasificar cada ticket en una categoria `choice` predefinida y asignar un nivel de prioridad `score`, usando las probabilidades para umbralizar y derivar casos ambiguos a revision humana.
- Moderacion de contenido con umbrales: plantear preguntas `noul` sobre si un texto cumple cada politica y decidir con la probabilidad individual de cada opcion, no con el campo `confidence`.
- Sistemas de alerta y observabilidad: integrar el endpoint `/v1/systemone` en pipelines de monitorizacion para decidir si se dispara una alerta o se escala, aprovechando la respuesta estructurada y los `timings` del proxy FastAPI opcional.
- Clasificacion de riesgo en onboarding (KYC/fraude): combinar preguntas `choice` sobre nivel de riesgo y `noul` sobre necesidad de revision manual, con probabilidades por opcion para fijar umbrales regulatorios.
- Decisiones de enrutamiento en agentes: usar el modelo como componente de decision determinista dentro de un agente mayor, donde otro componente genera texto y DecisionFairy decide la siguiente accion entre opciones acotadas.
- Evaluacion de calidad en pipelines de datos: puntuar con `score` la idoneidad de muestras o respuestas y filtrar por probabilidad acumulada de los niveles superiores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 4,5-5 GB para Q8_0 (4,21 GiB de pesos mas overhead de contexto) y unos 3-3,5 GB para Q4_K_M (2,55 GiB de pesos mas overhead).
- GPU recomendadas: cualquier GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) puede ejecutar Q8_0 con `-ngl 99`; para Q4_K_M bastan 6 GB. En datacenter, A100, H100 o L40S sobran para este tamano.
- Cabe en GPU consumer: si, en la mayoria de tarjetas con 6-8 GB de VRAM.
- Opciones de despliegue: `llama-server` de llama.cpp (requiere build con arquitectura `clef`, presente en master upstream), con lanzador incluido `start_llama.sh` (`llama-server -m <gguf> -ngl 99 -c 4096 --port 18095`); proxy FastAPI opcional `serve_systemone.py` que anade `timings`.
- Latencia y throughput: no disponibles. Nota operativa: `clef` evalua el prompt en un solo batch, por lo que el estado y las preguntas deben caber en `--ubatch-size` (512 por defecto); para estados largos o muchas opciones hay que subirlo (por ejemplo, `--ubatch-size 2048 -c 8192`).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DecisionFairy-4B-GGUF | 4,24 B | 4096 (configurable) | Cabeza de decision tipada | Apache-2.0 | GGUF en HF, llama.cpp |
| Qwen3.5-4B (base) | ~4 B | no disponible | LLM generativo | Apache-2.0 | safetensors/GGUF en HF |
| LLM generico + parseo JSON (p. ej. Qwen3.5-4B con prompt estructurado) | ~4 B | no disponible | Generacion de texto | Apache-2.0 | amplia |
| Clasificadores dedicados (BERT-like) | 0,1-0,5 B | 512 | Clasificacion por etiqueta | variable | amplia |

La comparacion con modelos generativos no es directa: DecisionFairy no produce texto y su salida es un contrato estructurado con probabilidades por opcion, lo que reduce la fragilidad del parseo frente a un LLM que genera JSON. Frente a clasificadores BERT-like, cubre multiples preguntas heterogeneas en una sola pasada y con contexto mas largo, a costa de un tamano mucho mayor. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Modelo de decision puro: no genera texto; no debe usarse como chatbot ni para completar contenido.
- Presupuesto de 1024 tokens de entrenamiento: estados y preguntas largos degradan la calidad; el autor recomienda mantenerlos cortos.
- Calibracion: las probabilidades se escalan con temperaturas del fichero y no estan garantizadas para datos del usuario; umbralizar sobre la probabilidad de cada opcion, no sobre `confidence`.
- Solo texto en este repo: sin `mmproj`, los campos `images` y `files` de `/v1/systemone` no estan disponibles.
- Dependencia de build: requiere llama.cpp con arquitectura `clef`; builds antiguos abortan con error de arquitectura desconocida.
- Restriccion de batch: el prompt completo debe caber en `--ubatch-size`; si no, hay que reconfigurar el servidor.
- Idiomas soportados no declarados: riesgo de comportamiento irregular fuera del idioma o dominio de entrenamiento.
- Sesgos y alucinacion: no se documentan sesgos conocidos ni tasas de alucinacion; al ser un modelo de decision, el riesgo se traslada a decisiones erroneas con alta confianza.
- Licencia Apache-2.0: permite uso comercial, pero se hereda del backbone Qwen3.5-4B; conviene revisar las condiciones del modelo base.
- Proyecto de nicho con 189 descargas y 0 likes: ecosistema y soporte limitados; no hay benchmarks publicados.

## Enlaces

- HuggingFace (GGUF): https://huggingface.co/wesjos/DecisionFairy-4B-GGUF
- Modelo base (safetensors): https://huggingface.co/wesjos/DecisionFairy-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- llama.cpp (arquitectura `clef`): https://github.com/ggml-org/llama.cpp
- Implementacion `clef`: `src/models/clef.cpp` en el repositorio de llama.cpp
