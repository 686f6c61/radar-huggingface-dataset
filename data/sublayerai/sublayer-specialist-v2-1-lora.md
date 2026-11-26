# sublayerAI/sublayer-specialist-v2.1-lora

## Resumen

sublayer-specialist-v2.1-lora es un adaptador LoRA desarrollado por sublayerAI sobre el modelo base Qwen/Qwen3.5-2B, orientado a una tarea muy concreta: extraer un objeto JSON estricto de seis claves (`category`, `urgency`, `customer_email`, `order_id`, `action_required`, `summary`) a partir de texto de soporte desordenado. El adaptador se publica como un checkpoint PEFT (librería `peft`, pesos en safetensors) y no como un modelo completo, por lo que requiere cargar el modelo base Qwen3.5-2B para funcionar.

El modelo resuelve el problema del parseo fiable de información estructurada en entradas ruidosas, incluyendo trampas de inyección de prompt y datos de contacto falsos en el conjunto de entrenamiento. Su relevancia radica en que demuestra que un adaptador pequeño (repo de 0,1 GB) sobre un modelo de 2B parámetros puede alcanzar tasas altas de cumplimiento de esquema (97 %) y de parseo JSON crudo (100 %) en su conjunto de evaluación sintético, aunque el exact match global estricto se queda en el 42 %.

Es importante señalar que el propio autor lo marca como hito de investigación y no como listo para producción. La licencia del adaptador es Apache-2.0, pero el uso debe cumplir también la licencia del modelo base. Los idiomas soportados no están declarados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder (modelo base Qwen/Qwen3.5-2B) |
| Parametros totales | No disponible (adaptador LoRA; el modelo base tiene 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (max_seq_length de entrenamiento: 512 tokens) |
| Tipos de cuantizacion | No disponible (pesos del adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (adaptador); cumplir también la licencia del modelo base |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con r=16, alpha=32 y dropout de 0,05 sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` del modelo base Qwen3.5-2B. El entrenamiento es de tipo SFT (supervised fine-tuning) durante 2 épocas con learning rate de 1e-4, batch de 4 y acumulación de gradiente de 4, con una longitud máxima de secuencia de 512 tokens. El conjunto de datos consta de 600 ejemplos de entrenamiento y 100 de test estratificados.

El dataset es sintético y simula texto de soporte desordenado, incluyendo trampas de inyección de prompt y datos de contacto falsos. No se documenta el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de esta descripción. No se menciona uso de RLHF o DPO; el pipeline es SFT sobre el adaptador. La innovación principal es la especialización estrecha en un esquema JSON fijo de seis claves con un prompt de sistema compartido entre entrenamiento y evaluación.

## Capacidades

- Generación de texto con salida restringida a un objeto JSON de seis claves exactas.
- Extracción de información estructurada de texto ruidoso tipo ticket de soporte.
- Parseo JSON robusto: 100 % de tasa de parseo crudo en el conjunto de test.
- Cumplimiento estricto de esquema: 97 % en el conjunto de test.
- Extracción de campos tipo identificador: `customer_email` (98 % exact match) y `order_id` (94 %).
- Clasificación de `action_required` (89 % exact match).
- Resistencia a trampas de inyección de prompt y datos de contacto falsos presentes en el entrenamiento.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking explícito (el ejemplo de uso desactiva thinking con `enable_thinking=False`).
- Capacidades multilingües: no disponibles.

## Casos de uso

- Extracción de campos en tickets de soporte: el adaptador convierte texto libre desordenado en un JSON de seis claves, adecuado para alimentar un sistema de ticketing con campos estructurados.
- Preprocesado para enrutamiento de tickets: la clave `category` y `action_required` permiten clasificar y dirigir incidencias, aunque con la precisión limitada documentada (82 % en `category`).
- Detección de identificadores de pedido: `order_id` con 94 % de exact match sirve para enlazar tickets con pedidos en sistemas de logística o e-commerce.
- Extracción de correo de contacto: `customer_email` con 98 % de exact match facilita la respuesta automatizada o la conciliación de clientes.
- Demos y pruebas de concepto de especialistas compactos: útil para evaluar LoRA sobre modelos de 2B en tareas de extracción estructurada.
- Benchmarking de adaptadores en texto ruidoso: sirve como referencia para comparar técnicas de SFT y robustez ante inyección de prompt.
- Generación de resúmenes de incidencia: la clave `summary` produce un resumen corto del ticket para paneles de agentes.

## Benchmarks y rendimiento

Resultados sobre N=100 ejemplos de test retenidos, según la model card:

| Metrica | v1 | v2 | v2.1 |
|---|---:|---:|---:|
| Tasa de parseo JSON crudo (%) | 98,0 | 97,0 | 100,0 |
| Cumplimiento estricto de esquema (%) | 95,0 | 90,0 | 97,0 |
| Exact match `category` (%) | 87,0 | 81,0 | 82,0 |
| Exact match `urgency` (%) | 35,0 | 56,0 | 57,0 |
| Exact match `customer_email` (%) | 80,0 | 90,0 | 98,0 |
| Exact match `order_id` (%) | 75,0 | 87,0 | 94,0 |
| Exact match `action_required` (%) | 85,0 | 88,0 | 89,0 |
| Exact match estricto global (%) | 21,0 | 36,0 | 42,0 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA de 0,1 GB, los requisitos vienen determinados por el modelo base Qwen3.5-2B.
- VRAM estimada para el modelo base en bf16: aproximadamente 4-5 GB; en cuantización de 8 bits, en torno a 2-3 GB; en 4 bits, alrededor de 1,5-2 GB (estimaciones orientativas, no confirmadas en la información disponible).
- Cabe en GPU de consumo como RTX 3060 de 12 GB, RTX 4060 Ti, RTX 4070 y superiores; también en GPUs profesionales A100, H100 o L40S.
- Despliegue mediante PEFT + Transformers según el ejemplo de la model card; el adaptador puede combinarse con el modelo base para servir con vLLM o TGI si se fusionan los pesos (no documentado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sublayer-specialist-v2.1-lora | Adaptador sobre 2B | No disponible (entrenamiento 512) | Extracción JSON de 6 claves | Apache-2.0 (adaptador) | Hugging Face |
| Qwen/Qwen3.5-2B | 2B | No disponible | Modelo generalista base | Según modelo base | Hugging Face |
| Alternativas de extracción estructurada de 2B | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de benchmarks comparativos con otros adaptadores o modelos de extracción estructurada en la información proporcionada.

## Limitaciones y advertencias

- El propio autor lo marca como hito de investigación, no listo para producción.
- Exact match global estricto del 42 %: un 58 % de las salidas no coinciden exactamente en las seis claves.
- `urgency` (57 %) y `category` (82 %) son los campos más débiles; no conviene usarlos como única señal de decisión.
- Entrenado y evaluado sobre un dataset sintético, no sobre tickets reales; los resultados pueden no generalizar.
- Riesgo de alucinación en campos como `summary` o `category` al no estar anclados a valores cerrados documentados.
- No debe usarse para decisiones autónomas de atención al cliente sin revisión humana.
- Las puntuaciones sintéticas no constituyen garantías de SLA en producción.
- Licencia Apache-2.0 para el adaptador, pero obligación de cumplir la licencia del modelo base Qwen3.5-2B.
- Idiomas soportados no declarados; el prompt de sistema del ejemplo está en inglés.
- Longitud de contexto de entrenamiento limitada a 512 tokens.

## Enlaces

- Hugging Face: https://huggingface.co/sublayerAI/sublayer-specialist-v2.1-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de código de entrenamiento: https://github.com/sublayer-ai/sublayer-specialist-v1
- Esquema JSON: https://github.com/sublayer-ai/sublayer-specialist-v1/blob/main/schema.json
- Prompt de sistema: https://github.com/sublayer-ai/sublayer-specialist-v1/blob/main/scripts/prompt.py
