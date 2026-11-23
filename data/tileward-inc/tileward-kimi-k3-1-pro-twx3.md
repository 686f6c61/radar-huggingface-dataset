# Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX3

## Resumen

Tileward-Kimi-K3.1-Pro-TWX3 es una compresión del modelo Kimi K3.1 Pro de Moonshot AI, desarrollada por Tileward Inc. mediante su método propietario TWX3. El resultado es un checkpoint de 1.178,4 GB en disco que reduce el peso del original (1.561,3 GB) en un 25%, manteniendo los pesos ya almacenados en 4 bits. Según el autor, la pérdida de calidad es de apenas seis décimas en MMLU (5-shot): 90,5 frente a 91,1 del modelo original.

El modelo hereda la arquitectura, el contexto y las capacidades del Kimi K3.1 Pro original, del que no se documentan especificaciones técnicas en la información disponible. La propuesta de valor es puramente de eficiencia de despliegue: menos VRAM por tarjeta y una caché KV que, según las mediciones del autor, alberga más del doble de tokens (4.915.678 frente a 2.135.421 en el original) en la misma configuración de ocho GPU.

La relevancia es operativa: reducir el coste de servir un modelo de gran tamaño sin degradar de forma apreciable el rendimiento. No obstante, los pesos no se publican en Hugging Face; el acceso es bajo petición, lo que condiciona cualquier evaluación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (hereda la de moonshotai/Kimi-K3.1-Pro) |
| Parametros totales | no disponible (el autor solo reporta tamaño en disco) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | pesos almacenados en 4 bits (formato TWX3); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | kimi-k3.1-pro (other), heredada del modelo base |
| Formato de pesos | no disponible; pesos no publicados en el repositorio |

Datos de despliegue reportados por el autor: 1.178,4 GB en disco, 147,9 GiB cargados por tarjeta en una sesión de ocho GPU (frente a 192,5 GiB del original).

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base Kimi K3.1 Pro en los materiales proporcionados: ni tipo de transformer, ni composición del dataset, ni uso de RLHF/DPO, ni innovaciones de atención. La ficha del modelo comprimido tampoco detalla el proceso de entrenamiento, ya que TWX3 es una técnica de compresión de pesos, no un reentrenamiento.

Lo que sí documenta el autor es el método de compresión y su evaluación: reducción del 25% del tamaño en disco partiendo de pesos ya cuantizados a 4 bits, con una caída de 0,6 puntos en MMLU (5-shot), una tasa de hechos inventados del 0,1% frente al 0,0% del original al redactar documentos, y una concordancia de siguiente palabra del 91,2% con el modelo sin comprimir. En tool calling, sobre 600 llamadas, el modelo comprimido acierta 599 con esfuerzo de razonamiento bajo y 598 con esfuerzo alto, frente a 600/600 del original.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredados del modelo base.
- Tool calling / function calling: validado por el autor con 600 llamadas de prueba en dos niveles de esfuerzo de razonamiento.
- Modos de esfuerzo de razonamiento (low / high thinking effort), según la metodología de evaluación descrita.
- Redacción de documentos con control de factualidad: el autor mide una tasa de hechos inventados del 0,1%.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.

## Casos de uso

- Despliegue en clústeres de ocho GPU con restricciones de memoria: al cargar 147,9 GiB por tarjeta frente a 192,5 GiB del original, permite usar GPUs con menos VRAM por dispositivo o liberar margen para otras cargas en el mismo nodo.
- Servicio de inferencia con contextos largos: la caché KV reportada alberga 4.915.678 tokens al 90% de ocupación por tarjeta, más del doble que el original, lo que lo hace adecuado para sesiones con historiales extensos o documentos largos.
- Asistentes con tool calling en producción: los 599/600 aciertos en llamadas de herramienta con esfuerzo bajo lo sitúan como opción viable para orquestación de funciones sin degradación apreciable frente al modelo completo.
- Generación de documentación técnica con control de alucinación: la tasa de 0,1% de hechos inventados en la evaluación del autor lo hace apto para pipelines de redacción asistida donde la fidelidad factual es crítica.
- Sustitución directa del modelo original en infraestructuras existentes: al mantener la concordancia del 91,2% en siguiente palabra y una diferencia de 0,6 puntos en MMLU, sirve como reemplazo con menor huella de memoria sin rehacer los prompts ni los pipelines.
- Evaluación comparativa de técnicas de compresión: útil para equipos de investigación que quieran medir el impacto real de la cuantización a 4 bits sobre un modelo de gran escala en tareas de razonamiento y tool use.
- Despliegue con presupuesto de almacenamiento ajustado: 1.178,4 GB frente a 1.561,3 GB reduce los requisitos de disco y el tiempo de carga en entornos con almacenamiento limitado.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Modelo | MMLU (5-shot, acc) | Tamaño en disco |
|---|---|---|
| Kimi K3.1 Pro (original) | 91,1 | 1.561,3 GB |
| Tileward Kimi K3.1 Pro TWX3 | 90,5 | 1.178,4 GB |
| Tileward Kimi K3.1 Pro TWX2.5 | 90,5 | 1.008,3 GB |

Comparativa operativa frente al original (sesión de ocho tarjetas):

| Métrica | Kimi K3.1 Pro | TWX3 |
|---|---|---|
| Hechos inventados al redactar (menor es mejor) | 0,0% | 0,1% |
| Tool calls correctas de 600 (esfuerzo bajo / alto) | 600 / 600 | 599 / 598 |
| Concordancia de siguiente palabra con el original | – | 91,2% |
| Cargado por tarjeta | 192,5 GiB | 147,9 GiB |
| Tokens en caché al 90% por tarjeta | 2.135.421 | 4.915.678 |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, MMLU-Pro, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma directa; el autor reporta 147,9 GiB cargados por tarjeta en una configuración de ocho GPU, lo que implica un mínimo agregado de aproximadamente 1,18 TB de memoria de GPU para el checkpoint completo.
- GPU recomendadas: no especificadas por el autor; por capacidad de memoria, la configuración de referencia de ocho tarjetas apunta a aceleradores de clase数据中心 (A100 80 GB, H100 80 GB o superiores).
- GPU de consumo: no cabe en ninguna GPU consumer actual; el tamaño del checkpoint excede con holgura la VRAM de una RTX 4090 (24 GB).
- Opciones de despliegue: no documentadas (vLLM, llama.cpp, Ollama, TGI u otras); el formato de pesos no se especifica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tamaño en disco | MMLU (5-shot) | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K3.1 Pro (Moonshot AI) | 1.561,3 GB | 91,1 | kimi-k3.1-pro | Pesos publicados en HF |
| Tileward Kimi K3.1 Pro TWX3 | 1.178,4 GB | 90,5 | kimi-k3.1-pro | Bajo petición |
| Tileward Kimi K3.1 Pro TWX2.5 | 1.008,3 GB | 90,5 | kimi-k3.1-pro | Bajo petición |

No se dispone de información sobre otros modelos comparables de la misma categoría en los materiales proporcionados.

## Limitaciones y advertencias

- Pesos no publicados: el repositorio de Hugging Face no contiene los ficheros del modelo; el acceso requiere solicitud y reunión con un ingeniero de Tileward, lo que impide reproducibilidad y auditoría independiente.
- Resultados no verificados: el benchmark de MMLU figura con `verified: false` en el model-index; todas las cifras proceden del autor.
- Degradación medible aunque pequeña: 0,6 puntos menos en MMLU, 0,1% de hechos inventados frente a 0,0% y 599/598 tool calls correctas frente a 600/600.
- Licencia heredada restrictiva: la licencia kimi-k3.1-pro puede imponer condiciones al uso comercial; debe revisarse el enlace a la licencia del modelo base antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingüe sin evaluación propia.
- Arquitectura y contexto desconocidos: al no publicarse las especificaciones del modelo base, no es posible planificar la ventana de contexto ni las necesidades de atención.
- Formato de pesos no especificado: complica la integración con frameworks de inferencia estándar y obliga a consultar con el proveedor.
- Riesgo de dependencia de proveedor: al ser una compresión propietaria sin pesos abiertos, la continuidad del modelo depende de Tileward Inc.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX3
- Modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Licencia del modelo base: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
- Variante TWX2.5: https://huggingface.co/Tileward-Inc/Tileward-Kimi-K3.1-Pro-TWX2.5
- Artículo de investigación: https://tileward.com/research/a-smaller-kimi-k3-1-pro/
- Metodología de evaluación: https://tileward.com/evals/#compressed-model-k31-pro
- Investigación de Tileward: https://tileward.com/research/
- Sitio del proveedor: https://tileward.com
- Reserva de reunión con ingeniero: https://calendar.app.google/hg2DzFTxKJgwFWm19
