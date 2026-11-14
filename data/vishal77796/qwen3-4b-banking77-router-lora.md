# vishal77796/qwen3-4b-banking77-router-lora

## Resumen

El modelo `vishal77796/qwen3-4b-banking77-router-lora` es un adaptador LoRA (Low-Rank Adaptation) desarrollado por Vishal Jadhav, estudiante de máster en informática en la RPTU Kaiserslautern-Landau. Se construye sobre el modelo base Qwen/Qwen3-4B-Instruct-2507 y su función es actuar como enrutador de intenciones (intent router) para mensajes de atención al cliente bancaria: recibe un mensaje y devuelve exactamente una de las 77 etiquetas del conjunto Banking77, o bien la etiqueta especial `none_of_these` cuando el mensaje no encaja en ninguna categoría.

El adaptador resuelve un problema clásico en sistemas de soporte: la clasificación de intenciones con detección de fuera de dominio (out-of-scope). A diferencia de un clasificador tradicional, aprovecha las capacidades generativas de Qwen3-4B para emitir directamente la etiqueta como texto, lo que simplifica la integración en pipelines existentes. Es relevante porque demuestra que un modelo de 4.000 millones de parámetros con un adaptador LoRA de rango 16 puede alcanzar una precisión global del 93,3 % en una tarea de enrutamiento con 78 clases posibles, con un entrenamiento de apenas 37 minutos en una GPU Quadro RTX 6000.

El modelo es muy ligero (el repositorio ocupa 0,1 GB, solo los pesos del adaptador), está licenciado bajo Apache 2.0 y se distribuye en formato safetensors compatible con la librería PEFT. Su ámbito es estrictamente el inglés y la clasificación de intenciones bancarias.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen3-4B-Instruct-2507) |
| Parámetros totales | No disponible (el adaptador LoRA es de rango 16; el modelo base tiene 4.000 millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite las cuantizaciones habituales de Qwen3) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-4B-Instruct-2507, un transformer decoder-only de la familia Qwen3. El LoRA tiene rango 16, alpha 32, dropout 0,05 y se aplica a todas las capas lineales del modelo base: q, k, v, o, gate, up y down. El entrenamiento usó AdamW con learning rate 2e-4, un 6 % de warmup seguido de decaimiento lineal, clipping de gradiente de 1,0, batch efectivo de 8 (4 × 2 de acumulación de gradiente) y 3 épocas, en precisión fp16 con autocast y gradient scaling, más gradient checkpointing. La pérdida se calcula únicamente sobre los tokens de respuesta. Todo el entrenamiento se completó en 37 minutos en una Quadro RTX 6000 de 24 GB, con un pico de 10,7 GB de memoria.

Los datos de entrenamiento combinan 2.000 ejemplos de Banking77 (muestra balanceada por clase, round-robin sobre las 77 intenciones, semilla 0, cargados desde la copia `mteb/banking77`) con 200 ejemplos de la clase out-of-scope de CLINC150 etiquetados como `none_of_these`, tras eliminar los que contenían palabras clave bancarias mediante un filtro fijo. El prompt de entrenamiento es fijo: un mensaje de sistema con las 77 etiquetas ordenadas más `none_of_these`, seguido del mensaje del usuario, y se genera con `enable_thinking=False`. La innovación principal no es arquitectónica sino de enfoque: usar un LLM generativo como clasificador de intenciones mediante un adaptador de bajo rango, con instrucciones estrictas de emitir una sola etiqueta.

## Capacidades

- Clasificación de intenciones bancarias en una de las 77 categorías de Banking77.
- Detección de fuera de dominio: devuelve `none_of_these` cuando el mensaje no encaja en ninguna intención bancaria.
- Generación de una única etiqueta como texto, sin explicaciones adicionales, lo que facilita el parseo automático.
- Funcionamiento en modo greedy (determinista) con `do_sample=False`.
- Soporte de chat template de Qwen3 con `enable_thinking=False`.
- Integración con PEFT y transformers para carga del adaptador sobre el modelo base.
- Capacidad de fusión del adaptador (`merge_and_unload()`) para despliegue con menor sobrecarga.
- No soporta tool calling, agentes, visión, audio ni razonamiento multi-paso como tales; su uso está acotado al enrutamiento de una sola etiqueta.

## Casos de uso

- Enrutamiento de tickets en mesas de ayuda bancaria: el modelo recibe el texto del cliente y devuelve la intención (por ejemplo, `card_not_working` o `refund_not_showing`), que se usa para asignar el ticket al equipo o flujo correspondiente; su precisión in-scope del 91 % lo hace adecuado como primera capa de triaje.
- Detección de mensajes fuera de ámbito: con una recall del 99 % en la clase out-of-scope, permite desviar consultas no bancarias (por ejemplo, preguntas sobre el tiempo) a un canal genérico o a un humano, evitando clasificaciones erróneas.
- Preprocesado en pipelines de atención automatizada: la salida de una sola etiqueta se puede mapear directamente a respuestas predefinidas o a bases de conocimiento, reduciendo la necesidad de un clasificador dedicado.
- Análisis de volumen de consultas: al etiquetar grandes lotes de mensajes históricos, permite agregar métricas por intención y detectar picos de incidencias (por ejemplo, aumentos de `lost_or_stolen_card`).
- Integración en sistemas existentes basados en Qwen3: al ser un adaptador PEFT sobre Qwen3-4B-Instruct-2507, se puede cargar junto al modelo base ya desplegado y alternar entre generación general y enrutamiento según la petición.
- Despliegue en hardware modesto: con un pico de 7,59 GB en batch 1 y 9,12 GB en batch 16 en fp16, cabe en GPUs de 24 GB (Quadro RTX 6000, RTX 4090) y permite servir en torno a 9,45–11,52 mensajes por segundo según el batch.
- Evaluación comparativa de modelos pequeños frente a frontera: el repositorio del autor incluye informes de robustez y resultados principales que permiten usar este adaptador como referencia en estudios de coste/rendimiento.

## Benchmarks y rendimiento

Conjunto de test: 500 mensajes de test de Banking77 más 200 mensajes out-of-scope de CLINC150 (700 en total). Ningún elemento de test se usó en entrenamiento ni para elegir ajustes.

| Métrica | Este adaptador (semilla 0) | 3 semillas, media ± desv. |
|---|---|---|
| Precisión in-scope (500 mensajes Banking77) | 0,910 | 0,913 ± 0,008 |
| Recall out-of-scope (200 mensajes CLINC150) | 0,990 | 0,990 ± 0,005 |
| Precisión global (700 mensajes) | 0,933 | 0,935 ± 0,007 |

Latencia medida con el adaptador fusionado (`merge_and_unload()`), fp16, decodificación greedy, 455 tokens de prompt de media, sobre 200 mensajes tras 20 peticiones de calentamiento en una Quadro RTX 6000 compartida (aproximadamente 54 % de utilización por otros procesos al inicio de la medición):

| Medida | Valor |
|---|---|
| Batch 1, p50 / p95 / p99 | 258 / 351 / 442 ms (tokenizar + generar + decodificar) |
| Throughput, batch 8 / 16 / 32 | 9,45 / 11,19 / 11,52 mensajes por segundo |
| Memoria GPU pico, batch 1 / 16 | 7,59 / 9,12 GB |

No se han publicado en la información disponible resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este adaptador.

## Requisitos de hardware

- VRAM estimada para inferencia: 7,59 GB en batch 1 y 9,12 GB en batch 16 en fp16 con el adaptador fusionado; el entrenamiento tuvo un pico de 10,7 GB.
- GPU recomendadas: Quadro RTX 6000 (24 GB) es la usada en las mediciones; cualquier GPU con al menos 10 GB libres en fp16 debería bastar para batch pequeño.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más (por ejemplo, RTX 3060 de 12 GB, RTX 4070, RTX 4090) para batch 1 en fp16; con cuantización del modelo base se podría reducir aún más, aunque no se proporcionan datos concretos.
- Opciones de despliegue: transformers + PEFT (probado con transformers 5.22.2, peft 0.21.2 y torch 2.15.0); el adaptador se puede fusionar con `merge_and_unload()` para servir con vLLM, TGI u otros motores compatibles con el modelo base. No se documenta soporte específico para llama.cpp u Ollama en la información disponible.
- Latencia y throughput: p50 de 258 ms y p99 de 442 ms en batch 1; 9,45–11,52 mensajes por segundo en batch 8–32, medidos en una GPU compartida, por lo que no son cifras de mejor caso.

## Comparativa con modelos similares

No se dispone en la información proporcionada de resultados de otros sistemas comparables en el mismo conjunto de evaluación, más allá de la referencia del autor a que los informes del repositorio incluyen comparaciones con otros sistemas. Por tanto, la comparativa cuantitativa con alternativas no está disponible.

| Modelo | Parámetros | Contexto | Precisión global (700) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen3-4B + LoRA) | 4.000 M (base) + LoRA r16 | No disponible | 0,933 | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Solo inglés: no se ha entrenado ni evaluado en otros idiomas.
- Un único dominio y fuente: entrenado y probado con Banking77 (más mensajes out-of-scope de CLINC150) de la misma fuente, por lo que no se ha validado con tráfico de otros bancos.
- El prompt debe ser exactamente el de entrenamiento (77 etiquetas ordenadas más `none_of_these`); cualquier variación puede degradar el rendimiento.
- La salida puede no ser una etiqueta válida en algunos casos; el código de ejemplo devuelve `None` si el texto generado no coincide con ninguna etiqueta tras normalización.
- Riesgo de alucinación inherente al modelo base generativo: aunque se fuerza una sola etiqueta, no hay garantía formal de que la salida sea siempre una de las 78 clases.
- Licencia Apache 2.0 permite uso comercial, pero los datos de entrenamiento tienen sus propias licencias (Banking77: CC BY 4.0; CLINC150: CC BY 3.0), que conviene revisar.
- Las mediciones de latencia se tomaron en una GPU compartida con aproximadamente el 54 % de utilización por otros procesos, por lo que no representan el mejor caso.
- No se documentan sesgos específicos más allá de los heredados del modelo base y del conjunto de datos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishal77796/qwen3-4b-banking77-router-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio del autor (código, datos y evaluación): https://github.com/Vc555s/small-vs-frontier
- Informe de robustez: https://github.com/Vc555s/small-vs-frontier/blob/main/results/t1_robustness.md
- Informe de resultados principales: https://github.com/Vc555s/small-vs-frontier/blob/main/results/t1_report.md
- Dataset Banking77 (copia mteb): https://huggingface.co/datasets/mteb/banking77
- Dataset Banking77 original: https://huggingface.co/datasets/PolyAI/banking77
- Dataset CLINC150: https://huggingface.co/datasets/clinc/clinc_oos
