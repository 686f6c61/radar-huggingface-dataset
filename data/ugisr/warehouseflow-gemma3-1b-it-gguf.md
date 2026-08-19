# Ugisr/warehouseflow-gemma3-1b-it-gguf

## Resumen

WarehouseFlow Gemma 3 1B IT es un modelo de lenguaje especializado en la gestión de almacenes y logística, desarrollado por el usuario Ugisr como un fine-tune del modelo base `google/gemma-3-1b-it` de Google. El modelo está optimizado para realizar llamadas a funciones (tool calling) en el dominio de sistemas de gestión de almacenes (WMS), cubriendo operaciones como consulta de stock, transferencias, órdenes de compra y seguimiento de envíos.

El modelo tiene aproximadamente 1.000 millones de parámetros y se distribuye en formato GGUF, lo que permite su ejecución con `llama.cpp`, `Ollama`, `LM Studio` y otros runtimes compatibles. Está diseñado para despliegue en entornos edge con recursos limitados: la cuantización Q4_K_M ocupa solo 0,75 GB. El fine-tune incluye un conjunto de 12 herramientas específicas de warehouse y un formato de salida estructurado con bloques de razonamiento.

Su relevancia radica en ofrecer un asistente de IA especializado y ligero para automatizar tareas logísticas, con soporte para razonamiento multi-paso y rechazo de consultas fuera de dominio. Está orientado principalmente a los idiomas indonesio (id) e inglés (en), y se distribuye bajo la licencia Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decodificador autoregresivo (Gemma 3 1B IT) |
| Parametros totales | 999.885.952 (~1B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (recomendado 2048 tokens segun model card; el modelo base Gemma 3 1B soporta 32k) |
| Tipos de cuantizacion | F16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | indonesio (id), ingles (en) |
| Licencia | Gemma (Gemma Terms of Use de Google) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de Gemma 3 1B IT, un decodificador autoregresivo con atención de ventana y atención local-global (una innovación de la familia Gemma 3 que combina atención local con ventanas deslizantes y atención global cada ciertos bloques). Sobre esta base, se realizó un fine-tune mediante LoRA (adaptadores de bajo rango), como indica el repositorio de adaptadores `warehouseflow-gemma3-1b-hybrid-lora`, y posteriormente se fusionaron los pesos para obtener el modelo completo.

El entrenamiento se realizó con un dataset híbrido específico para warehouse (`warehouseflow-hybrid-training-data`), que incluye ejemplos de llamadas a 12 herramientas logísticas y consultas complejas con razonamiento multi-paso. El modelo está entrenado para emitir sus respuestas en un formato XML con bloques `thinking` y `response`, y para invocar herramientas mediante etiquetas `<tool_call>` con argumentos JSON. No se especifica el número de tokens de entrenamiento ni el uso de RLHF o DPO en la información disponible.

## Capacidades

- **Llamada a funciones (tool calling)**: reconoce y ejecuta 12 herramientas específicas de gestión de almacenes, incluyendo `get_stock`, `transfer_stock`, `create_purchase_order`, `check_low_stock_alerts`, `get_warehouse_capacity`, `get_shipping_status`, entre otras.
- **Razonamiento multi-paso**: para consultas complejas, emite un bloque de razonamiento antes de decidir qué herramienta invocar, lo que permite encadenar varias llamadas.
- **Formato de salida estructurado**: genera respuestas en XML con etiquetas `<tool_call>` y argumentos en JSON, facilitando el parseo automático en pipelines de software.
- **Rechazo de consultas fuera de dominio**: el modelo está entrenado para rechazar preguntas no relacionadas con logística o warehouse (clima, política, etc.), con una tasa de rechazo del 95% en evaluaciones OOD.
- **Salida determinista**: recomendado usar temperatura 0 para obtener resultados consistentes en producción.
- **Multilingüe limitado**: soporta indonesio e inglés, con mayor fluidez en el dominio logístico.

## Casos de uso

- **Asistente de gestión de inventario**: el modelo puede responder consultas como "¿cuánto stock hay del SKU ZX-1042 en el almacén JKT-01?" invocando `get_stock` y presentando el resultado de forma natural.
- **Automatización de transferencias entre almacenes**: mediante `transfer_stock`, un agente puede mover mercancía entre ubicaciones, validando disponibilidad y capacidad previamente con `get_stock` y `get_warehouse_capacity`.
- **Creación de órdenes de compra**: el modelo genera automáticamente una PO llamando a `create_purchase_order` con los parámetros adecuados (SKU, cantidad, proveedor, almacén), reduciendo tareas manuales en el departamento de compras.
- **Alertas de stock bajo**: integrado en un sistema de monitoreo, el modelo puede invocar `check_low_stock_alerts` periódicamente y resumir qué productos necesitan reposición.
- **Seguimiento de envíos y estimación de entregas**: consultas sobre estado de pedidos (`get_shipping_status`) y tiempos estimados de llegada (`estimate_delivery_time`) permiten dar respuestas a clientes internos o externos.
- **Búsqueda de productos por nombre**: con `search_sku_by_name`, el modelo ayuda a localizar SKUs cuando el usuario solo conoce una descripción aproximada del artículo.
- **Consulta de información de proveedores**: `get_supplier_info` y `get_supplier_lead_time` facilitan la evaluación de tiempos de entrega y condiciones de proveedores en procesos de negociación.
- **Historial de stock para análisis**: `get_stock_history` permite generar informes de evolución de inventario en los últimos 30 días, útil para planificación de demanda.

## Benchmarks y rendimiento

El autor publica resultados en el benchmark LogiBench, específico para tareas de tool calling en logística:

| Metrica | Resultado |
|---|---|
| AST & Schema Match | 89,6% |
| OOD Refusal | 95,0% |
| Error Recovery | 100,0% |
| Trajectory Success | 100,0% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con la cuantización Q4_K_M (~0,75 GB), el modelo puede ejecutarse en sistemas con 8 GB de RAM o menos; la versión F16 (~1,87 GB) requiere algo más de memoria.
- **GPU recomendadas**: cualquier GPU consumer con al menos 2 GB de VRAM es suficiente para las versiones cuantizadas; incluso puede ejecutarse en CPU con razonable velocidad dada su pequeña talla.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs como RTX 3060, RTX 4060, GTX 1660, e incluso en Apple Silicon con Metal.
- **Opciones de despliegue**: llama.cpp (CLI), Ollama (creando un Modelfile), LM Studio, Jan, y llama-cpp-python para integración en Python.
- **Latencia y throughput**: no se han publicado mediciones oficiales, pero por su tamaño (~1B parámetros) se espera una latencia de decenas de milisegundos por token en GPU moderna y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Especializacion | Formato |
|---|---|---|---|---|---|
| WarehouseFlow Gemma 3 1B IT (este) | ~1B | no disponible (recomendado 2k) | Gemma | Warehouse tool calling | GGUF |
| google/gemma-3-1b-it (base) | ~1B | 32k | Gemma | Generalista, tool calling basico | safetensors |
| Qwen2.5-1.5B-Instruct | 1,5B | 32k | Apache 2.0 | Generalista, tool calling | safetensors, GGUF |
| Llama-3.2-1B-Instruct | 1B | 128k | Llama 3.2 | Generalista | safetensors, GGUF |

La comparativa se limita a características generales, ya que no se dispone de resultados de benchmarks comunes para este modelo. Frente al modelo base Gemma 3 1B, WarehouseFlow sacrifica generalidad por precisión en el dominio logístico, con un contexto recomendado menor (2k frente a 32k) pero con un rendimiento muy superior en tareas de tool calling de warehouse según LogiBench.

## Limitaciones y advertencias

- **No es un modelo generalista**: está fuertemente especializado en warehouse y logística; las consultas fuera de este dominio serán rechazadas o darán respuestas poco útiles.
- **Idiomas limitados**: solo indonesio e inglés; no soporta español, francés, alemán u otros idiomas de forma fiable.
- **Contexto reducido**: aunque el modelo base soporta 32k tokens, las recomendaciones del autor limitan el contexto a 2048 tokens, lo que puede ser insuficiente para conversaciones muy largas o documentos extensos.
- **Riesgo de alucinación en datos no cubiertos**: al ser un fine-tune pequeño, puede inventar datos si se le piden cifras de stock o proveedores que no corresponden a los IDs reales del sistema.
- **Restricciones de licencia**: la licencia Gemma de Google impone condiciones de uso, incluyendo restricciones para ciertos usos comerciales y la obligación de atribución. Revisar los términos completos antes de producción.
- **Sin garantía de precisión en producción**: los benchmarks LogiBench son proporcionados por el autor y no han sido verificados de forma independiente; se recomienda validar en el entorno real.
- **Formato de salida específico**: el modelo emite XML con `<tool_call>`, lo que requiere un parser adaptado; no sigue el formato estándar de OpenAI u otros frameworks de function calling.

## Enlaces

- [Modelo GGUF en HuggingFace](https://huggingface.co/Ugisr/warehouseflow-gemma3-1b-it-gguf)
- [Adaptador LoRA](https://huggingface.co/Ugisr/warehouseflow-gemma3-1b-hybrid-lora)
- [Modelo fusionado (safetensors)](https://huggingface.co/Ugisr/warehouseflow-gemma3-1b-hybrid-merged)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Ugisr/warehouseflow-hybrid-training-data)
- [Modelo base Gemma 3 1B IT](https://huggingface.co/google/gemma-3-1b-it)
- [Gemma Terms of Use](https://ai.google.dev/gemma/terms)
