# Ugisr/warehouseflow-gemma3-1b-gguf

## Resumen

WarehouseFlow es un modelo de lenguaje especializado en la gestión de almacenes y logística, desarrollado por el usuario Ugisr. Se distribuye en formato GGUF y está basado en Gemma 3 1B IT, un modelo de 1.000 millones de parámetros de Google. El modelo ha sido ajustado específicamente para el uso de herramientas (tool calling) en el dominio de almacenes, ofreciendo doce funciones predefinidas que cubren operaciones como consulta de stock, transferencias entre almacenes, creación de órdenes de compra o seguimiento de envíos.

La relevancia de este modelo radica en su capacidad para ejecutar tareas de gestión de inventario de forma conversacional y estructurada, devolviendo llamadas a funciones en formato JSON dentro de etiquetas XML. Al estar cuantizado en GGUF, puede desplegarse en entornos locales con recursos limitados mediante Ollama, llama.cpp, LM Studio o KoboldCpp. El repositorio incluye tres niveles de cuantización (Q4_K_M, Q5_K_M y Q8_0) y el autor reporta métricas de rendimiento en tareas de tool calling, aunque no se especifican los detalles del entrenamiento ni el conjunto de datos utilizado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Gemma 3 1B IT (transformer, detalles no especificados) |
| Parametros totales | 999.885.952 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el Modelfile de Ollama usa num_ctx 4096) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | No disponibles (la model card está en indonesio, pero no se indica el soporte lingüístico del modelo) |
| Licencia | Gemma 3 license agreement (según la model card); en HuggingFace figura como "no disponible" |
| Formato de pesos | GGUF (safetensors originales no incluidos en el repositorio) |

## Arquitectura y entrenamiento

La información proporcionada no detalla la arquitectura interna del modelo más allá de su origen: se trata de un ajuste fino de Gemma 3 1B IT, un transformer de 1.000 millones de parámetros desarrollado por Google. No se especifican los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. El autor solo indica que el modelo está diseñado para tool calling en el dominio logístico, con un sistema de llamadas a funciones que devuelve objetos JSON dentro de etiquetas `<tool_call>`.

La principal innovación observable es la integración de doce herramientas específicas para almacenes (consulta de stock, transferencias, órdenes de compra, etc.) y un conjunto de reglas estrictas: una sola llamada por respuesta, uso exclusivo de las herramientas listadas y prohibición de asumir valores no proporcionados. El modelo se distribuye únicamente en formato GGUF, lo que facilita su ejecución en entornos locales sin infraestructura GPU dedicada.

## Capacidades

- Generación de texto conversacional orientado a tareas de gestión de almacenes.
- Tool calling estructurado con 12 funciones predefinidas: `get_stock`, `transfer_stock`, `list_warehouses`, `get_stock_history`, `create_purchase_order`, `get_supplier_info`, `check_low_stock_alerts`, `get_warehouse_capacity`, `search_sku_by_name`, `get_shipping_status`, `estimate_delivery_time` y `get_supplier_lead_time`.
- Respuestas en formato JSON dentro de etiquetas XML (`<tool_call>`) para integración con sistemas externos.
- Capacidad de rechazo ante solicitudes fuera del dominio (OOD Refusal reportado al 95%).
- Recuperación de errores en trayectorias de tool calling (reportado al 100%).
- No se mencionan capacidades de visión, audio o razonamiento multimodal.
- No se especifica soporte multilingüe más allá de la lengua de la model card (indonesio).

## Casos de uso

- Consulta de stock en tiempo real: un operario pregunta por la disponibilidad de un SKU en un almacén concreto y el modelo invoca `get_stock(sku, warehouse_id)`, devolviendo la cantidad exacta sin necesidad de consultar manualmente el sistema de inventario.
- Transferencia de mercancía entre almacenes: el asistente ejecuta `transfer_stock` con los parámetros necesarios (SKU, cantidad, origen y destino) para reubicar productos, reduciendo errores humanos en la gestión de movimientos.
- Creación de órdenes de compra: ante un nivel de stock bajo, el modelo genera una orden de compra mediante `create_purchase_order`, indicando proveedor, cantidad y almacén, agilizando el proceso de reposición.
- Alertas de stock bajo: `check_low_stock_alerts(warehouse_id)` permite obtener automáticamente la lista de productos que requieren reposición en un almacén, facilitando la planificación de inventario.
- Seguimiento de envíos: `get_shipping_status(order_id)` y `estimate_delivery_time` permiten al personal de atención al cliente responder consultas sobre pedidos y tiempos de entrega sin acceder a múltiples sistemas.
- Búsqueda de productos por nombre: `search_sku_by_name(query)` ayuda a localizar el código SKU de un artículo a partir de una descripción textual, útil en operaciones de recepción y picking.
- Integración en asistentes de voz o chat para almacenes: al estar cuantizado en Q4_K_M (~700 MB), puede ejecutarse en dispositivos con recursos limitados, como terminales portátiles o mini-PCs, para asistir a los trabajadores en tareas cotidianas.

## Benchmarks y rendimiento

El autor reporta los siguientes resultados en su model card, sin especificar la metodología ni el conjunto de evaluación:

| Metrica | Resultado |
|---|---|
| AST & Schema Match | 89,6 % |
| OOD Refusal | 95,0 % |
| Error Recovery | 100,0 % |
| Trajectory Success | 100,0 % |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- Tamaños de archivo: Q4_K_M ~700 MB, Q5_K_M ~800 MB, Q8_0 ~1,1 GB.
- VRAM estimada para inferencia: con Q4_K_M, aproximadamente 1-2 GB de VRAM son suficientes (incluyendo overhead del runtime), por lo que cabe en GPUs de consumo como GTX 1060 6GB, RTX 3050 o superiores.
- También puede ejecutarse exclusivamente en CPU con 4-8 GB de RAM libre, aunque la latencia será mayor.
- GPUs recomendadas: cualquier GPU NVIDIA con 4 GB o más (RTX 3060, RTX 4060, A10, etc.). Para despliegue en servidor, una A100 o H100 no es necesaria dado el tamaño reducido del modelo.
- Opciones de despliegue: Ollama (con Modelfile incluido), llama.cpp, LM Studio y KoboldCpp. También es compatible con endpoints que acepten GGUF.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 1B, se espera una generación de decenas de tokens por segundo en GPU moderna y de 5-15 tokens/s en CPU, pero no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos de tool calling especializados en logística. El modelo base Gemma 3 1B IT es el punto de referencia natural, pero no se han publicado resultados comparativos. Se recomienda evaluar WarehouseFlow frente a alternativas genéricas como Llama 3.2 1B o Qwen 2.5 1.5B con prompts de tool calling, aunque los resultados dependerán del dominio específico.

## Limitaciones y advertencias

- No se especifican sesgos conocidos, pero al ser un modelo pequeño (1B) puede presentar alucinaciones en tareas complejas o fuera del dominio logístico.
- El modelo está diseñado exclusivamente para tool calling en almacenes; su uso para otros fines puede producir respuestas incorrectas o rechazos (OOD Refusal al 95%).
- La longitud de contexto no está documentada; el Modelfile de Ollama utiliza `num_ctx 4096`, lo que limita conversaciones multi-turno con historial largo.
- La licencia se indica como "Gemma 3 license agreement" en la model card, pero en HuggingFace figura como "no disponible". Es necesario verificar los términos de la licencia de Gemma 3 para uso comercial antes de desplegarlo en producción.
- La model card está escrita en indonesio, lo que sugiere que el autor puede haber entrenado o evaluado el modelo con datos en ese idioma, aunque no se confirma el soporte multilingüe.
- No se proporcionan detalles sobre el proceso de fine-tuning, el dataset utilizado ni las métricas de calidad general (MMLU, HumanEval, etc.), lo que dificulta evaluar su robustez fuera del ámbito logístico.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Ugisr/warehouseflow-gemma3-1b-gguf
- No se han encontrado otros enlaces (papers, blogs o demos) en la información proporcionada.
