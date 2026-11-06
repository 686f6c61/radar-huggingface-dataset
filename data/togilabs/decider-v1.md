# Togilabs/Decider-v1

## Resumen

Decider-v1 es un modelo de decisión de un solo cometido desarrollado por Togi Labs para atención al cliente en lenguas índicas. No es un modelo generativo: recibe un mensaje y un conjunto fijo de opciones, y en un único forward pass devuelve una probabilidad para cada opción, sin prompt engineering, sin muestreo y sin texto generado. Está entrenado específicamente para tres preguntas (intención, urgencia y lengua de respuesta) y responde cualquier otra pregunta de opciones fijas en el mismo formato.

Técnicamente se construye como un adaptador LoRA sobre el torso de `google/gemma-4-E4B-it`, con un cabezal pointer de 24 slots que puntúa cada opción en una sola pasada. El adaptador tiene 36,2 millones de parámetros entrenables (rango 16, alpha 32, sobre las proyecciones q, k, v, o, gate, up y down). El repositorio ocupa 0,2 GB y se distribuye bajo licencia Apache 2.0.

Su relevancia actual radica en el nicho que cubre: mensajes reales de soporte escritos en minúsculas, sin puntuación, con ortografía de chat, hindi y tamil en caracteres latinos (hinglish, tanglish) y cambio de escritura a mitad de línea. Frente a modelos generalistas de mayor tamaño, Decider-v1 obtiene mejores resultados en su dominio y, según la model card, también fuera de él en tareas como MASSIVE Indic o IndicCOPA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con adaptador LoRA sobre `google/gemma-4-E4B-it` y cabezal pointer de 24 slots |
| Parametros totales | no disponible (el adaptador LoRA tiene 36,2 M de parámetros entrenables) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, ta, te, en (incluye variantes romanizadas hinglish y tanglish) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) y `slot_head.pt` (cabezal pointer) |

## Arquitectura y entrenamiento

El modelo parte del torso de Gemma-4-E4B-it y le añade un adaptador LoRA de rango 16 y alpha 32 aplicado sobre las proyecciones q, k, v, o, gate, up y down, con 36,2 millones de parámetros entrenables. Sobre la representación resultante se monta un cabezal pointer de 24 slots que puntúa cada opción del conjunto de preguntas en un único forward pass, devolviendo una distribución de probabilidad por pregunta. El motor de inferencia es `strands-decider`: la petición contiene un `state` (el mensaje) y un diccionario de `questions`, cada una con un `type` (`choice` o `score`), un campo `instructions` y `criteria` (las opciones con descripciones de una línea).

El entrenamiento usó 272.577 ejemplos en una sola pasada: conjuntos índicos abiertos con etiquetas gold, 13.900 borradores revisados manualmente con peso 4, los splits train y dev de MASSIVE para siete locales índicos, SIB-200, IndicSentiment y Hinglish-TOP. Se ejecutaron 8.518 pasos durante 10,3 horas en una única NVIDIA L40S, con una precisión de validación final de 0,9725. La elección de Gemma como torso se justifica por eficiencia de tokenización en tamil: 2,1 tokens por palabra frente a 3,8 de Qwen3.5. La model card no detalla si hubo RLHF o DPO; el entrenamiento se describe como supervisado sobre etiquetas.

## Capacidades

- Clasificación de intención de soporte en ocho categorías: `order_status`, `payment_issue`, `refund`, `delivery`, `account_login`, `complaint`, `product_question` y `other`.
- Puntuación de urgencia en escala de 1 a 5 (de "puede esperar días" a "crítico, necesita ahora").
- Detección de la lengua de respuesta entre `hi`, `hinglish`, `ta`, `te` y `en`.
- Respuesta a cualquier pregunta de opciones fijas en el mismo formato (tipo `choice` o `score`), no solo a las tres de entrenamiento.
- Robustez ante texto informal: minúsculas, ausencia de puntuación, ortografía de chat, hindi y tamil en caracteres latinos y cambio de escritura dentro de una misma línea.
- Capacidad multilingüe en hindi (devanagari y romanizado), tamil, telugu e inglés.
- Salida calibrada con probabilidad por opción, lo que permite umbrales de confianza y derivación a humano.
- No genera texto, no soporta tool calling ni razonamiento multi-paso: es un clasificador de decisión de un solo paso.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un mensaje entrante, el modelo devuelve la intención con su probabilidad y permite dirigir el ticket al equipo adecuado (pagos, logística, cuenta) sin intervención humana, con umbral de confianza para los casos dudosos.
- Priorización por urgencia: la puntuación de 1 a 5 permite ordenar la cola de atención y escalar automáticamente los mensajes marcados como críticos, útil en centros de soporte con volumen alto y SLA estrictos.
- Selección automática de la lengua de respuesta: el modelo detecta si el cliente escribe en hindi, hinglish, tamil, telugu o inglés y permite que la respuesta se genere en la variedad adecuada, incluyendo el caso de cambio de escritura a mitad de mensaje.
- Análisis de voz del cliente a escala: al ser un clasificador de un solo forward pass, permite procesar grandes volúmenes de conversaciones históricas para etiquetar intención y urgencia y alimentar dashboards de calidad.
- Filtrado previo en pipelines de agentes conversacionales: el modelo actúa como primera etapa que decide la ruta antes de invocar un LLM generativo, reduciendo coste y latencia en los casos que no requieren generación.
- Clasificación de esquemas personalizados: cualquier equipo puede definir sus propias opciones con descripciones de una línea y usar el modelo como clasificador zero-shot de opciones fijas, por ejemplo para categorizar feedback de producto o motivos de contacto.
- Moderación y triaje de reclamaciones: la categoría `complaint` junto con la urgencia permite separar reclamaciones que requieren gestión inmediata de las que pueden seguir el cauce ordinario.

## Benchmarks y rendimiento

Resultados del informe de Togi Labs del 25 de octubre de 2026 sobre el togi support benchmark (753 mensajes de soporte en hindi devanagari, hindi romanizado, tamil y telugu):

| Modelo | Intención | Intención, 314 sin fuga | Intención tamil, sin fuga | Urgencia exacta | Lengua de respuesta | 24 difíciles resueltos | Confiado y erróneo |
|---|---|---|---|---|---|---|---|
| **Decider-v1** | **0,98** | **0,97** | **0,98** | **0,80** | **0,98** | **20** | 0,01 |
| Decider-v0 | 0,96 | 0,94 | 0,94 | 0,77 | 0,98 | 10 | 0,03 |
| clef, 8-bit (27B) | 0,88 | 0,84 | 0,81 | 0,34 | 0,57 | 0 | 0,04 |
| pplx-decider-flash | 0,86 | 0,86 | 0,86 | 0,28 | 0,76 | 0 | 0,03 |
| yama | 0,78 | 0,76 | 0,84 | 0,21 | 0,37 | 6 | 0,06 |

Resultados fuera de dominio en MASSIVE Indic (500 peticiones localizadas por lengua, pregunta de escenario de 18 opciones):

| Modelo | Hindi | Tamil | Telugu | Global |
|---|---|---|---|---|
| **Decider-v1** | **0,936** | **0,930** | **0,932** | **0,933** |
| yama (entrenado en MASSIVE) | 0,898 | 0,852 | 0,882 | 0,877 |
| pplx-decider-flash (no visto) | 0,864 | 0,606 | 0,830 | 0,767 |
| Decider-v0 (no visto) | 0,822 | 0,638 | 0,780 | 0,747 |

Resultados en datos que ningún modelo entrenó (IndicCOPA, conjunto retail hinglish con 13 intenciones nuevas y re-puntuación con opciones barajadas):

| Modelo | COPA global | COPA tamil | COPA hindi | Error de calibración COPA | Exactitud retail | Error de calibración retail | Respuestas invariantes al barajado |
|---|---|---|---|---|---|---|---|
| **Decider-v1** | **0,848** | **0,842** | **0,849** | 0,211 | 0,940 | **0,023** | **98,8%** |
| Decider-v0 | 0,642 | 0,540 | 0,717 | 0,207 | 0,930 | 0,042 | 99,2% |
| pplx-decider-flash | 0,737 | 0,622 | 0,849 | **0,116** | **0,955** | 0,079 | 91,2% |
| yama | 0,635 | 0,644 | 0,619 | 0,186 | 0,900 | 0,142 | 91,4% |

El propio autor señala la prueba que pierden: pplx-decider-flash supera a Decider-v1 en 1,5 puntos en el esquema retail hinglish no visto y tiene mejor calibración en COPA (0,12 frente a 0,21).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El adaptador ocupa 0,2 GB, pero el torso Gemma-4-E4B-it debe cargarse adicionalmente y su huella no se detalla.
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA L40S; no se especifican requisitos de inferencia.
- Cabeza en GPU de consumo: no disponible.
- Opciones de despliegue: el modelo requiere el motor `strands-decider` según la model card; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La model card destaca que la inferencia es un único forward pass sin generación de texto, lo que en principio reduce la latencia frente a modelos generativos, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Intención (benchmark togi) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| **Decider-v1** | LoRA sobre Gemma-4-E4B-it + cabezal pointer | 36,2 M entrenables | no disponible | 0,98 | Apache 2.0 | Hugging Face |
| Decider-v0 | Versión anterior de Togi Labs | no disponible | no disponible | 0,96 | no disponible | Hugging Face |
| pplx-decider-flash | Modelo de decisión | no disponible | no disponible | 0,86 | no disponible | no disponible |
| clef, 8-bit | Modelo de 27B cuantizado a 8 bits | 27B | no disponible | 0,88 | no disponible | no disponible |
| yama | Modelo de decisión entrenado en MASSIVE | no disponible | no disponible | 0,78 | no disponible | no disponible |

## Limitaciones y advertencias

- El benchmark principal es in-distribution: mismos intenciones, estilo de escritura y escala de urgencia que en entrenamiento. En los 314 mensajes sin casi-duplicados la exactitud de intención baja a 0,97.
- La escala de urgencia de 1 a 5 es propia de Togi Labs y no existe un estándar público con el que compararla.
- Los conjuntos de entrenamiento MASSIVE y SIB-200 son traducciones, no texto nativo; el conjunto de test retail fue escrito por un modelo de lenguaje.
- Sobre preguntas de causa y efecto el modelo es sobreconfiado: error de calibración de 0,21 frente a 0,12 de pplx-decider-flash. El autor lo identifica como primer punto para la v2.
- Los resultados no miden todavía tickets de soporte reales ni texto escrito por hablantes nativos en condiciones reales.
- No se han publicado datos sobre sesgos demográficos o geográficos.
- Al ser un clasificador de opciones fijas, no genera respuestas ni razona en varios pasos; su uso en producción requiere un componente generativo adicional si se necesita contestar al cliente.
- Aunque la licencia es Apache 2.0, el modelo base Gemma-4-E4B-it puede tener sus propias condiciones de uso que conviene revisar antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Togilabs/Decider-v1
- Togi Labs: https://togilabs.ai
- Informe de investigación (benchmark completo, tablas y matices): https://togilabs.ai/research
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
