# speakleash/Bielik-One-11B-v3.1-r1

## Resumen

Bielik-One-11B-v3.1-r1 es un ajuste fino del modelo Bielik-11B-v3.1-Instruct de SpeakLeash, orientado a la toma de decisiones estructuradas y tipadas en lugar de la generacion de texto libre. El modelo recibe un "estado" (un texto descriptivo de una situacion) y un conjunto de preguntas con criterios cerrados, y devuelve respuestas con distribuciones de probabilidad calibradas: eleccion entre opciones, probabilidad binaria, nivel en una escala ordinal o seleccion multiple de etiquetas. Se distribuye como pesos completos fusionados (merged) para funcionar sobre vLLM 0.32.0 sin plugins ni LoRA en tiempo de ejecucion.

El modelo parte de una arquitectura transformer densa de 11.173.081.088 parametros (aproximadamente 11,17 mil millones), con licencia Apache 2.0 y soporte declarado para mas de 50 idiomas, incluido el castellano. Su relevancia actual radica en que separa la logica de decision de la generacion de lenguaje: en lugar de pedir al modelo que "razone" en texto y parsear la respuesta, expone una API con esquema fijo (`/v1/systemone`) que devuelve probabilidades calibradas por tipo de pregunta, lo que facilita su integracion en pipelines de automatizacion con umbrales y confianza explicitos.

La version r1 incorpora un fichero `calibration.json` con una temperatura por tipo de pregunta (eleccion T=2.107, binaria T=1.899, escala T=2.732, etiquetas T=1.000), ajustada solo sobre el split de validacion. Existe tambien una variante Adapter (aproximadamente 1 GB adicional) para quienes ya sirven el modelo base y no quieren duplicar los pesos completos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Llama), ajuste fino del modelo instruct Bielik-11B-v3.1-Instruct |
| Parametros totales | 11.173.081.088 (aproximadamente 11,17 B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (perfil por defecto de vLLM) |
| Tipos de cuantizacion | bfloat16 (por defecto, calibrado); FP8 mediante `--fp8` (no calibrado); no se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | Multilingue: mas de 50 idiomas, entre ellos es, en, pl, de, fr, it, pt, ru, uk, zh, ja, ko, ar, hi, tr, nl, sv, etc. |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 22,3 GB |

## Arquitectura y entrenamiento

El modelo es un transformer denso de aproximadamente 11,17 mil millones de parametros, derivado por ajuste fino (finetune) de speakleash/Bielik-11B-v3.1-Instruct, que a su vez pertenece a la familia Llama. La innovacion principal no esta en la arquitectura del backbone, sino en la cabeza de decision y en el formato de interaccion: el modelo se entrena para responder a preguntas tipadas (`choice`, `noul` o binaria, `score` ordinal y `labels` multietiqueta) sobre un estado textual, devolviendo probabilidades por opcion en lugar de texto libre. Los pesos publicados son la fusion completa del ajuste, de modo que el comportamiento de decision queda embebido en el modelo y no requiere adaptadores en tiempo de ejecucion.

La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; esa informacion no esta disponible. Si se documenta el proceso de calibracion posterior: se ajusto una temperatura por tipo de pregunta exclusivamente sobre el split de validacion, aplicando softmax sobre los log-probabilidades normalizados para preguntas categoricas y sigmoide por opcion para las de etiquetas. La calibracion no altera las decisiones por argmax ni por umbral de 0,5, solo la confianza reportada, y se ajusto sobre salidas en bfloat16, por lo que no es valida para el servicio con `--fp8`.

## Capacidades

- Decision estructurada tipada: cuatro tipos de pregunta (`choice`, `noul`, `score`, `labels`) con probabilidades por opcion y nivel de confianza.
- Clasificacion con criterios cerrados definidos por el usuario en la propia peticion.
- Puntuacion ordinal en escalas definidas dinamicamente (por ejemplo, none/low/medium/high/critical).
- Seleccion multiple de etiquetas con probabilidad independiente por opcion y umbral de 0,5.
- Conversacion general mediante el endpoint `/v1/chat/completions` con el alias `bielik-general`, servido sobre los pesos ajustados para decision.
- Capacidades multilingues en mas de 50 idiomas, con especial enfasis en polaco e ingles.
- Integracion directa con vLLM 0.32.0 sin plugin ni LoRA en tiempo de ejecucion.
- Soporte de prefix caching y modo eager en el perfil de despliegue por defecto.
- No se documenta soporte explicito de tool calling, function calling, vision, audio ni modo de razonamiento extendido (thinking).

## Casos de uso

- Gestion de cobros y facturacion: clasificar el estado de una factura (pagada, vencida, no vencida), determinar si el plazo ha pasado y puntuar la urgencia de la reclamacion, tal como muestra el ejemplo de la model card. El modelo devuelve probabilidades calibradas que permiten fijar umbrales de escalado automatico.
- Triaje de tickets de soporte: dado el texto de una incidencia, elegir categoria (`choice`), determinar si requiere escalado (`noul`) y seleccionar acciones aplicables (`labels`) en una sola llamada con multiples preguntas.
- Moderacion de contenido con criterios configurables: evaluar cada pieza contra un conjunto de politicas definidas como etiquetas y obtener una probabilidad independiente por politica, lo que permite auditar el umbral de cada una.
- Enrutamiento de solicitudes en atencion al cliente: decidir a que cola o departamento dirigir una consulta combinando una pregunta de eleccion con una escala de prioridad, con contexto de hasta 32.768 tokens para historiales largos.
- Extraccion de decisiones en procesos de RR. HH.: clasificar candidaturas o solicitudes segun criterios cerrados (cumple/no cumple, nivel de encaje en una escala) y registrar la confianza para revision humana.
- Automatizacion de flujos financieros o de seguros: puntuar el riesgo de un expediente en una escala ordinal y marcar acciones (revisar, aprobar, rechazar) con probabilidades por accion, integrable en un backend que consuma la API compatible con OpenAI.
- Evaluacion consistente de formularios o encuestas: convertir respuestas en texto libre a categorias y escalas normalizadas con probabilidades calibradas, util para analitica agregada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 30 GB para el modelo de 11B, incluyendo pesos y la cache KV configurada (8 secuencias, 2048 tokens por lote).
- Con `--fp8`: el peso de los pesos se reduce aproximadamente a la mitad, aunque la calibracion no es valida en ese modo.
- GPU recomendadas: A100 40 GB, H100, L40S o cualquier GPU con al menos 30 GB de VRAM para bfloat16; para FP8, GPU con soporte de FP8 (H100, L40S, H200).
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16 con la configuracion por defecto; requeriria FP8 y ajuste de la cache KV, con la advertencia de calibracion. No se documentan pesos GGUF para llama.cpp u Ollama.
- Despliegue: vLLM 0.32.0 mediante el paquete `bielik-one` (`pip install "bielik-one[vllm] @ git+https://github.com/speakleash/bielik-one"`), con backend y frontend separados (`bielik-one backend`, `bielik-one frontend`). Tambien es compatible con text-generation-inference segun los tags del repo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Bielik-One-11B-v3.1-r1 | 11,17 B | 32.768 | Apache 2.0 | Decision estructurada tipada con calibracion | Hugging Face (pesos completos y variante Adapter) |
| Bielik-11B-v3.1-Instruct | no disponible | no disponible | no disponible | Instruct general, modelo base de este ajuste | Hugging Face |
| Bielik-One-11B-v3.1-r1-Adapter | no disponible (adaptador de aproximadamente 1 GB) | no disponible | no disponible | Misma funcion de decision sobre un despliegue base existente | Hugging Face (SPKL-Internal) |

No se dispone de datos de rendimiento comparado con otras alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- La calibracion se ajusto en bfloat16 y no es valida para el servicio con `--fp8`; en ese modo algunas decisiones cercanas al limite pueden cambiar.
- La calibracion se ajusto para un orden estandar de opciones; con ordenes alternativos de opciones las probabilidades pueden no estar calibradas (se puede desactivar con `--no-calibration` o `"temperature": 1`).
- El modelo esta especializado en decisiones cerradas; para generacion abierta se ofrece `bielik-general`, pero no se documenta su calidad frente al modelo instruct original.
- No se documentan datos sobre sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez; el riesgo de alucinacion en el endpoint de chat general no esta cuantificado.
- El soporte multilingue esta declarado por la lista de idiomas, pero no se aportan metricas por idioma; el castellano figura en la lista sin evaluacion especifica.
- Licencia Apache 2.0 permite uso comercial, pero la model card remite a biuro@speakleash.org.pl para solicitudes sobre datos personales o contenido con derechos de autor.
- El repo ocupa 22,3 GB; desplegar los pesos completos exige planificar almacenamiento y memoria, o bien usar la variante Adapter si ya se sirve el modelo base.
- No hay pesos GGUF ni soporte documentado para llama.cpp u Ollama, lo que limita el despliegue en entornos sin GPU de datacenter.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/speakleash/Bielik-One-11B-v3.1-r1
- Variante Adapter: https://huggingface.co/SPKL-Internal/Bielik-One-11B-v3.1-r1-Adapter
- Modelo base: https://huggingface.co/speakleash/Bielik-11B-v3.1-Instruct
- Repositorio del paquete de inferencia: https://github.com/speakleash/bielik-one
- Contacto de proteccion de datos y derechos de autor: biuro@speakleash.org.pl
