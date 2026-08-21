# VikramPal/Qwen3.5-35B-A3B-IntentRouter

## Resumen

VikramPal/Qwen3.5-35B-A3B-IntentRouter es un modelo de enrutado de intenciones (intent router) de propósito general, desarrollado por VikramPal a partir del modelo base multimodal Qwen/Qwen3.5-35B-A3B de Alibaba. A diferencia de un clasificador de intenciones tradicional, este checkpoint no tiene un conjunto de etiquetas fijo entrenado: recibe en el prompt un catálogo de intents proporcionado por el usuario y devuelve exactamente un identificador de intent de ese catálogo, o bien `out_of_scope` si la frase no está cubierta, o una pregunta aclaratoria si la frase combina dos intenciones. Esto permite enrutar para catálogos nunca vistos durante el entrenamiento, como demuestra el resultado sobre BANKING77, que fue completamente retenido.

El modelo es solo texto: se publica únicamente la torre de texto del checkpoint base, con `model_type` `qwen3_5_moe_text`, sin la configuración de visión ni la cabeza de decodificación especulativa MTP. Tiene 34.660.610.688 parámetros totales frente a los 35.951.822.704 del base. Se distribuye con licencia Apache 2.0 y soporta seis idiomas: inglés, alemán, español, francés, hindi y tailandés. Su relevancia actual radica en que resuelve el problema de los routers de intenciones en producción: respuestas fuera de catálogo (ids inventados) que rompen los flujos aguas abajo, algo que este modelo reduce drásticamente (0,3% frente al 9,3% del base sin ajuste).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso (mixture-of-experts) con atención híbrida Gated DeltaNet, solo torre de texto (`qwen3_5_moe_text`) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3.000.000.000 (3B por token, según el modelo base) |
| Longitud de contexto | no disponible (no se especifica en la información publicada) |
| Tipos de cuantizacion | bf16 nativo, DynQuant 4-bit, DynQuant 3-bit (mencionados en la model card) |
| Idiomas soportados | en, de, es, fr, hi, th |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 69,3 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-35B-A3B es un MoE multimodal con arquitectura híbrida Gated DeltaNet y sparse MoE, con 35.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token, lo que permite una decodificación muy rápida para su tamaño. El checkpoint publicado aquí elimina la rama de visión y la cabeza MTP, quedando únicamente la torre de texto. El ajuste fino se realizó con LoRA (r=32, alpha=64, dropout=0.05) sobre los pesos base en bf16, no con QLoRA: el base no se cuantiza durante el entrenamiento. Los datos de entrenamiento provienen de cinco conjuntos de datos de clasificación de intenciones: `mteb/amazon_massive_intent`, `clinc/clinc_oos`, `mteb/banking77`, `xingkunliuxtracta/nlu_evaluation_data` y `WillHeld/mtop`. El entrenamiento usa una plantilla de sistema fija (publicada como `system_template.txt`) y se renderiza con `enable_thinking=False`. La innovación clave es que el catálogo de intents se pasa como entrada en el prompt, no como etiquetas fijas, lo que permite generalizar a catálogos no vistos.

## Capacidades

- Enrutado de intenciones por catálogo dinámico: dado un turno de usuario y un catálogo de intents en el prompt, devuelve exactamente un id de intent del catálogo.
- Detección de fuera de alcance (`out_of_scope`) cuando el catálogo no cubre la frase.
- Manejo de frases con dos intenciones combinadas: responde con una pregunta aclaratoria en lugar de adivinar.
- Resolución de intenciones en conversaciones multiturno (el intent solo es deducible de turnos anteriores).
- Soporte multilingüe en seis idiomas: inglés, alemán, español, francés, hindi y tailandés.
- Compatible con tool calling / function calling en el sentido de que el catálogo actúa como un conjunto de funciones disponibles, aunque el modelo no ejecuta herramientas, solo selecciona el id.
- No incluye capacidades de visión ni decodificación especulativa MTP (eliminadas en este checkpoint).

## Casos de uso

- Asistentes virtuales de atención al cliente: el modelo puede enrutar la primera frase de un usuario hacia el flujo correcto (reembolso, estado de pedido, cancelación, etc.) usando un catálogo de intents definido por la empresa, incluso si ese catálogo no se usó en el entrenamiento. Su baja tasa de ids inventados (0,3%) evita que el sistema caiga en ramas inexistentes.
- Sistemas de clasificación de tickets en helpdesk: dado un ticket de soporte, el router asigna una categoría de un catálogo actualizable sin necesidad de reentrenar, lo que facilita añadir o eliminar categorías en producción.
- Orquestación de agentes conversacionales: como paso previo a un LLM generativo, el router decide qué agente especializado (facturación, técnico, ventas) debe gestionar la conversación, usando un catálogo de intents que mapea a cada agente.
- Enrutado de consultas en portales bancarios: con el catálogo BANKING77 (no visto en entrenamiento) alcanza un 84,3% de precisión estricta, suficiente para derivar consultas de banca online a los departamentos adecuados.
- Moderación y clasificación de mensajes en foros o redes sociales: el modelo puede etiquetar mensajes según un catálogo de intenciones (queja, sugerencia, spam, consulta) y derivarlos al equipo correspondiente.
- Pruebas de robustez de routers: al poder evaluar con catálogos sintéticos o retenidos, sirve como banco de pruebas para medir la calidad de un sistema de enrutado antes de desplegarlo, especialmente en escenarios con frases fuera de alcance o intents eliminados.

## Benchmarks y rendimiento

La model card publica resultados sobre 1.500 ítems retenidos (150 por grupo de split y catálogo), con decodificación greedy y coincidencia exacta estricta contra el id de intent dorado:

| Arm | Strict | Right id present | Invented ids | Truncated at 24 tokens |
|---|---|---|---|---|
| Qwen3.5-35B-A3B (sin fine-tune) | 62,5% | 62,5% | 9,3% | 14/1500 |
| Este router, bf16 | 91,1% | 91,1% | 0,3% | 0/1500 |
| Este router, DynQuant 4-bit | 90,6% | 90,6% | 0,3% | 0/1500 |
| Este router, DynQuant 3-bit | 79,1% | 80,6% | 3,6% | 41/1500 |

Prueba de McNemar pareada contra el base sin ajuste: +28,60 puntos, p = 2,53e-108.

Resultados por catálogo (strict):

| Catalogo | Intents | En entrenamiento | Strict |
|---|---|---|---|
| banking77 | 77 | retenido | 84,3% |
| clinc150 | 151 | sí | 98,3% |
| hwu68 | 67 | sí | 89,3% |
| massive60 | 60 | sí | 87,3% |
| mtop117 | 113 | sí | 96,0% |

Resultados por tipo de ítem (strict):

| Tipo | Que prueba | Strict |
|---|---|---|
| clarify_conj | dos intents combinados, debe preguntar | 97,3% |
| cs_oos | genuinamente fuera de alcance | 92,0% |
| cs_removed | el intent correcto fue eliminado del catálogo | 86,4% |
| multiturn | intent solo deducible de turnos previos | 90,4% |
| normal | frase simple con intent en el catálogo | 90,8% |
| same_intent_conj | dos cláusulas, un intent | 91,6% |

Resultados por idioma (strict):

| de | en | es | fr | hi | th |
|---|---|---|---|---|---|
| 87,4% | 91,1% | 94,3% | 92,9% | 90,6% | 90,5% |

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, los 34,66B parámetros requieren aproximadamente 69 GB de VRAM (cálculo teórico: 34,66B × 2 bytes). Con DynQuant 4-bit, unos 17 GB; con DynQuant 3-bit, unos 13 GB. No se publican cifras oficiales de VRAM.
- GPU recomendadas: para bf16 se necesitan GPUs de clase profesional como A100 80GB, H100 80GB o A6000 48GB (insuficiente para bf16 completo, pero válida para 4-bit). Para cuantización 4-bit, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente.
- En consumer GPU: sí, con cuantización 4-bit cabe en GPUs de 24 GB; con 3-bit incluso en 16 GB, aunque la precisión cae al 79,1% strict.
- Opciones de despliegue: exclusivamente con `transformers` (cargar con `trust_remote_code=True` y `experts_implementation="eager"` en GPUs no Hopper; en Hopper+ se puede usar `grouped_mm`). vLLM no puede servir este checkpoint: rechaza los pesos MoE fusionados en la capa 0.
- Latencia y throughput: no se publican datos oficiales. Dado el MoE con ~3B activos por token, se espera una decodificación rápida para su tamaño, pero no hay mediciones en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enrutado de intents | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VikramPal/Qwen3.5-35B-A3B-IntentRouter | 34,66B (3B activos) | no disponible | Sí, catálogo dinámico | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-35B-A3B (base) | 35,95B (3B activos) | no disponible | No (62,5% strict sin ajuste) | Apache 2.0 | Hugging Face, Ollama, LM Studio |
| Clasificadores de intents basados en BERT (p.ej. DistilBERT intent) | ~66M | 512 tokens | Sí, pero etiquetas fijas | Apache 2.0 | Hugging Face |

La comparativa con clasificadores BERT es orientativa: estos modelos son mucho más ligeros y rápidos, pero no pueden manejar catálogos dinámicos ni frases fuera de alcance con la misma flexibilidad. No se dispone de comparativas publicadas con otros routers de intenciones basados en LLM.

## Limitaciones y advertencias

- Es solo texto: no incluye capacidades de visión ni la cabeza MTP del modelo base. Si se necesita multimodalidad o decodificación especulativa, hay que usar el base.
- vLLM no puede servirlo: el checkpoint rechaza la carga en vLLM por los pesos MoE fusionados en la capa 0. Solo se puede desplegar con `transformers`.
- Carga delicada: hay que usar `add_special_tokens=False` al tokenizar, porque la plantilla ya emite los tokens especiales; pasarlos dos veces mide un modelo distinto.
- Cuantización 3-bit degrada notablemente: baja al 79,1% strict, aumenta los ids inventados al 3,6% y produce respuestas truncadas (41/1500). No recomendable para producción sin validación.
- Riesgo de alucinación en catálogos no vistos: aunque la tasa de ids inventados es baja (0,3% en bf16), no es cero; en producción conviene validar la respuesta contra el catálogo.
- Dependencia de la plantilla de sistema: el modelo fue entrenado con una plantilla fija (`system_template.txt`); usar otra plantilla puede degradar el rendimiento.
- Idiomas limitados a seis: no cubre otros idiomas, y el rendimiento varía (es 94,3%, de 87,4%).
- Sin datos de contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar conversaciones muy largas.
- Modelo sin adopción: cero descargas y cero likes en Hugging Face en el momento de la consulta; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VikramPal/Qwen3.5-35B-A3B-IntentRouter
- Modelo base Qwen3.5-35B-A3B: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Ficha del modelo en Open-Source AI Stack: https://www.open-source-ai.tech/models/qwen3-5-35b-a3b
- Página en Ollama: https://ollama.com/library/qwen3.5:35b-a3b
- Página en Vast.ai: https://vast.ai/model/qwen35-35b-a3b
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-35b-a3b
