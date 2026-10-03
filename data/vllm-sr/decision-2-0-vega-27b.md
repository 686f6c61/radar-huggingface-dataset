# vllm-sr/Decision-2.0-Vega-27B

## Resumen

Decision-2.0-Vega-27B es un modelo de decisión estructurada desarrollado por el equipo de vLLM Semantic Router (organización vllm-sr). No es un modelo generativo: recibe un estado de entrada (texto o JSON) junto con un conjunto de preguntas y devuelve, en una sola pasada, una probabilidad para cada opción de respuesta, sin generar texto. Soporta tres tipos de pregunta: elección entre alternativas, sí/no y puntuación en una escala.

Se trata de un adaptador sobre el modelo base Qwen/Qwen3.8-27B, con 29,37 mil millones de parámetros según la model card y una longitud de contexto de 32.768 tokens. Se distribuye bajo licencia Apache-2.0, requiere `trust_remote_code=True` y está etiquetado como `feature-extraction`, `classification` y `system-one`, en referencia a su naturaleza de decisión rápida y no generativa.

Su relevancia actual se explica por dos motivos: por un lado, se presenta como el modelo más potente de la familia Decision 2.0, con una mejora declarada de 11,2 puntos en el Jev Decision Index frente a Decision-2.0-Lux-9B; por otro, su latencia declarada de 71,4 ms de mediana por petición de una sola pregunta en una única GPU lo hace viable como componente de enrutado o clasificación dentro de arquitecturas de agentes y pasarelas LLM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer derivado del modelo base Qwen/Qwen3.8-27B (relación declarada: adapter). La model card no detalla bloques, atención ni configuración interna |
| Parámetros totales | 29,37 B (según model card) |
| Parámetros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantización | No disponible. El repositorio solo publica pesos en safetensors; no se documentan variantes GGUF, AWQ, GPTQ ni fp8 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, con código personalizado (requiere `trust_remote_code=True`) |
| Tipos de decisión | Choice (elección), Yes/No (sí/no), Score (puntuación ordinal) |
| Salida | Probabilidad por cada opción; no genera texto |
| Librería | transformers >= 5.17 (también se instalan torch, safetensors y peft) |
| Tamaño del repositorio | 15,0 GB |
| Pipeline declarado | feature-extraction (con pipeline personalizado `decision`) |

## Arquitectura y entrenamiento

La información disponible es limitada en este apartado. La model card indica que Vega-27B es un adaptador sobre Qwen/Qwen3.8-27B y que se apoya en código personalizado (`trust_remote_code=True`), además de requerir la librería `peft` en la instalación, lo que es coherente con un ajuste tipo LoRA o adaptador sobre el modelo base. La arquitectura concreta del cabezal de decisión, el mecanismo de agregación multi-pregunta en una sola pasada y la forma exacta del prompt interno no se documentan.

Tampoco se publican el número de tokens de entrenamiento, la composición del corpus, ni si se aplicaron técnicas de RLHF, DPO u otras variantes de alineamiento. La model card menciona una auditoría de los datos de entrenamiento a nivel de fila contra todos los elementos de test del Jev Decision Index, lo que sugiere una verificación de no contaminación, pero sin detallar la metodología.

La innovación técnica que sí se explicita es el modo de operación: en lugar de generar texto token a token, el modelo procesa el estado y todas las preguntas asociadas (elección, sí/no y puntuación) en una única pasada forward y emite una distribución de probabilidad por pregunta. La etiqueta `system-one` alude a este comportamiento de decisión rápida e intuitiva, en contraposición a cadenas de razonamiento largas.

## Capacidades

- Decisión de elección múltiple: dada una pregunta con criterios descritos en lenguaje natural, devuelve una probabilidad para cada opción, con etiquetas definidas por quien invoca el modelo.
- Decisión binaria (sí/no): responde preguntas de verificación sobre el estado de entrada, por ejemplo si un cliente dispone de un recibo.
- Puntuación en escala: clasifica el estado en una escala ordinal definida por el usuario, por ejemplo urgencia rutina, pronto o hoy.
- Multitud de preguntas en una sola pasada: preguntas de distinto tipo sobre el mismo estado se resuelven simultáneamente, con una probabilidad por opción, lo que reduce el coste frente a múltiples llamadas independientes.
- Entrada multimodal en formato: acepta texto plano o JSON como estado de entrada.
- Salida como características numéricas: al devolver probabilidades, la salida puede consumirse como vector de features en un pipeline de `feature-extraction` o como señal de enrutado.
- Integración como pipeline de transformers: se expone mediante `transformers.pipeline("decision", ...)` con `trust_remote_code=True`.
- No se documentan capacidades de generación de texto, razonamiento multi-paso, tool calling, función de agente, visión, audio ni multilingüismo explícito.

## Casos de uso

- Enrutado de peticiones en una pasarela LLM: el modelo decide a qué equipo, cola o modelo debe dirigirse una consulta con una única pasada. Es adecuado porque devuelve la probabilidad por ruta sin coste de generación, con 71,4 ms de mediana declarada por petición.
- Tríaje de tickets de soporte: dado el texto de una incidencia, responder a la vez a qué categoría pertenece, si el cliente adjunta comprobante y qué urgencia tiene, todo con una sola inferencia y umbrales configurables por el equipo.
- Priorización de colas de trabajo: usar el tipo `score` para ordenar incidencias o solicitudes en niveles y alimentar un sistema de asignación automática.
- Moderación y guardarraíles binarios: preguntas de sí/no sobre contenido o estados permite bloquear, escalar o permitir acciones con una probabilidad calibrada en lugar de una decisión dura.
- Selección de herramienta o siguiente acción en agentes: el modelo puede actuar como cabezal de decisión que elige entre varias herramientas o rutas descritas como criterios, evitando una llamada generativa completa.
- Extracción de características para modelos posteriores: las probabilidades de salida sirven como variables de entrada en modelos de propensión, scoring de riesgo o clasificadores jerárquicos ya existentes.
- Evaluación automática de respuestas: con preguntas de sí/no del tipo "¿la respuesta cumple el criterio X?", se puede construir un juez ligero y determinista dentro de un pipeline de evaluación.
- Auditoría y control de calidad: al no generar texto, las decisiones son reproducibles dadas las mismas entradas y umbrales, lo que facilita la trazabilidad en entornos regulados.

## Benchmarks y rendimiento

| Modelo | JevArena (↑) | Transfer con etiquetado humano, macro-F1 (↑) | Jev Decision Index (↑) |
|---|---:|---:|---:|
| Decision-2.0-Vega-27B | 74,0 | 58,7 | 56,5 |
| AutoJev-27B | 72,1 | 58,7 | No disponible |
| Eikos-27B | 69,3 | 58,7 | No disponible |
| Jebadiah-27B | 65,5 | 57,8 | No disponible |

Notas sobre la medición, según la model card: todos los modelos responden a los mismos prompts congelados y se puntúan del mismo modo, contando las respuestas ausentes o inválidas como errores. El apartado de transferencia con etiquetado humano es la mediana de macro-F1 sobre 15 tareas anotadas manualmente (multiplicada por 100). Los datos de Decision 2.0 proceden de una reproducción independiente con el kit oficial 0.2.1 sobre los pesos publicados; los del resto de modelos, de una captura de tabla pública del 28 de septiembre de 2026.

Rendimiento declarado: mediana de 71,4 ms por petición de una sola pregunta en una única GPU. No se publican cifras de throughput, consumo de memoria ni latencia para peticiones con múltiples preguntas.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 59 GB solo para pesos de 29,37 B parámetros, más caché KV y activaciones; requiere GPUs de 80 GB o reparto en varias GPU.
- VRAM estimada en int8: aproximadamente 30 GB de pesos, con overhead adicional; encaja en GPUs de 40 a 48 GB.
- VRAM estimada en 4 bits: aproximadamente 15 a 16 GB de pesos, lo que permitiría ejecución en GPUs de consumo con 24 GB. El repositorio ocupa 15,0 GB, lo que sugiere que los pesos publicados ya están comprimidos, aunque el formato exacto de cuantización no se documenta.
- GPU recomendadas: para bf16, H100 80 GB, A100 80 GB o 2 x A100 40 GB; para int8, L40S, RTX 6000 Ada o A100 40 GB; para 4 bits, RTX 4090, RTX 3090 o L4 de 24 GB.
- Ejecución en GPU de consumo: viable si los pesos están en 4 bits y la caché KV para 32.768 tokens cabe en los 24 GB disponibles; la configuración exacta de atención y el tamaño de caché KV no se publican, por lo que la viabilidad debe verificarse empíricamente.
- Opciones de despliegue: la model card solo documenta transformers >= 5.17 con `trust_remote_code=True` y el pipeline `decision`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos GGUF descarta por ahora llama.cpp y Ollama sin conversión previa.
- Latencia: 71,4 ms de mediana por petición de una sola pregunta en una sola GPU, según el autor. Throughput y latencia con múltiples preguntas: no disponible.
- Las estimaciones de VRAM de esta sección se derivan del recuento de parámetros declarado, no de documentación oficial de consumo del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JevArena | Transfer humano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Decision-2.0-Vega-27B | 29,37 B | 32.768 | 74,0 | 58,7 | Apache-2.0 | HuggingFace |
| AutoJev-27B | No disponible | No disponible | 72,1 | 58,7 | No disponible | No disponible |
| Eikos-27B | No disponible | No disponible | 69,3 | 58,7 | No disponible | No disponible |
| Jebadiah-27B | No disponible | No disponible | 65,5 | 57,8 | No disponible | No disponible |
| Decision-2.0-Lux-9B | 9 B (según nomenclatura) | No disponible | No disponible | No disponible | No disponible | Misma colección Decision 2.0 |

El autor declara que Vega-27B obtiene la mejor puntuación de JevArena de su tamaño y que se sitúa estadísticamente a la par de AutoJev-27B, con 72,1 frente a 74,0. También declara una ventaja de 11,2 puntos en el Jev Decision Index sobre Decision-2.0-Lux-9B. Para el resto de modelos comparados no se dispone de parámetros, contexto, licencia ni punto de distribución en la información proporcionada.

La limitación principal de esta comparativa es que la mayoría de las métricas son específicas del ecosistema del autor (JevArena, Jev Decision Index) y no equivalen a benchmarks estándar como MMLU, HumanEval o GSM8K, que no se han publicado para este modelo.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, por lo que no puede emplearse para redacción, resumen, código ni diálogo conversacional.
- Sesgos: no se documenta ninguna evaluación de sesgo, y al ser un adaptador sobre Qwen/Qwen3.8-27B hereda las características y sesgos del modelo base, que no se detallan.
- Riesgo de alucinación: al devolver solo distribuciones de probabilidad no hay riesgo de texto inventado, pero sí de calibración incorrecta; una probabilidad alta puede corresponder a una respuesta errónea si los criterios proporcionados son ambiguos.
- Idiomas: no se especifica qué lenguas soporta. Toda la documentación y los ejemplos están en inglés, y se desconoce el comportamiento en castellano.
- Longitud de contexto: 32.768 tokens. Estados más largos deben truncarse o resumirse antes de la llamada, y no se documenta el comportamiento con entradas cercanas al límite.
- Licencia Apache-2.0: permite uso comercial y modificación, con obligación de conservar avisos de copyright y licencia. Al derivar del modelo base Qwen/Qwen3.8-27B, conviene verificar las condiciones de ese modelo, no incluidas en esta información.
- Requiere `trust_remote_code=True` y código personalizado: implica ejecutar código del autor del repositorio, lo que exige revisión de seguridad antes de desplegarlo en producción.
- Inconsistencias de documentación: el nombre indica 27B, la model card declara 29,37 B de parámetros y el repositorio ocupa 15,0 GB, cifra muy inferior a los pesos en bf16 esperables; el formato y grado de cuantización de los archivos publicados no se especifican.
- El ejemplo de la model card utiliza un tipo de pregunta denomiado `noul` que no aparece en la tabla de tipos de decisión (Choice, Yes/No, Score); no hay aclaración al respecto.
- Métricas propietarias: JevArena, Jev Decision Index y transfer con etiquetado humano son definidas por el autor, sin validación externa publicada, y los resultados de los modelos competidores provienen de una captura de tabla del 28 de septiembre de 2026.
- Adopción temprana: 90 descargas y 24 likes en el momento de la consulta, con lo que la validación por parte de la comunidad es todavía escasa.
- Despliegue: no hay soporte documentado en servidores de inferencia habituales (vLLM, TGI) ni pesos GGUF, lo que limita las opciones de puesta en producción fuera de transformers con código personalizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vllm-sr/Decision-2.0-Vega-27B
- Colección Decision 2.0: https://huggingface.co/collections/vllm-sr/decision-20-6ab7cf7bdfb506bf8269cb00
- Repositorio vLLM Semantic Router: https://github.com/vllm-project/semantic-router
- Modelo base Qwen/Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- vLLM (sitio oficial): https://vllm.ai/
- vLLM (repositorio en GitHub): https://github.com/vllm-project/vllm
- vLLM (documentación): https://docs.vllm.ai/en/latest/
- vLLM (entrada en Wikipedia): https://en.wikipedia.org/wiki/VLLM
- Revisión sobre LLM para ecosistemas IoT, con datos de modelos de 27B: https://www.techrxiv.org/doi/pdf/10.36227/techrxiv.174844330.01320055

Citación indicada por el autor:

```bibtex
@misc{decision_2_0_vega_27b_2026,
  title        = {{Decision-2.0-Vega-27B}: A Decision 2.0 Model for Structured Decisions},
  author       = {{vLLM Semantic Router Team}},
  year         = {2026},
  howpublished = {\url{https://huggingface.co/vllm-sr/Decision-2.0-Vega-27B}}
}
```
