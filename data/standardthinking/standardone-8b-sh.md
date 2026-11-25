# StandardThinking/StandardOne-8B-SH

## Resumen

Standard One 8B SH es un modelo de decisión tipada (typed-decision model) desarrollado por StandardThinking, derivado por fine-tuning del modelo base Standard One 8B v2.2. No es un modelo generativo: lee un escenario una sola vez y puntúa simultáneamente todas las opciones de todas las preguntas de una petición en un único forward pass, devolviendo distribuciones de probabilidad calibradas. Sustituye la cabeza de lenguaje por una "joint schema head" (SH) de 70,6 M de parámetros que atiende sobre los estados ocultos de la capa final y de la capa 25 del backbone.

El backbone es de arquitectura mistral3 (Ministral 3 8B para texto más una torre de visión Pixtral), con 8.918.026.240 parámetros totales según los pesos safetensors, y soporta hasta 32.768 tokens de contexto por petición. El modelo está pensado para tareas de clasificación y enrutamiento con muchas opciones (2-255), preguntas de sí/no (`noul`) y escalas ordinales (`score`), y se expone mediante el contrato `POST /v1/systemone` del motor Standard One.

La relevancia de esta release (v4, publicada el 2026-10-13) radica en una mejora sustancial del Decision Index 0.3 público, que pasa de 48,34 en v3 a 57,40 en v4, además de mejoras notables en las áreas de Tools (60,9 a 84,0) y Arts (25,5 a 42,5). La licencia es Apache-2.0 y el modelo está disponible en transformers, FP8 y GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mistral3 (Ministral 3 8B texto + torre de visión Pixtral) con joint schema head (SH) de 70,6 M de parámetros en float32 que lee la capa final y la capa 25 |
| Parametros totales | 8.918.026.240 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens por petición |
| Tipos de cuantizacion | FP8 (variante StandardOne-8B-SH-FP8), GGUF (variante StandardOne-8B-SH-GGUF); pesos principales en safetensors |
| Idiomas soportados | Inglés (según la model card); los gráficos mencionan decisiones equivalentes en 21 idiomas, pero el campo `language` declara solo `en` |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers); variantes FP8 y GGUF publicadas por separado |

## Arquitectura y entrenamiento

El modelo parte del backbone Standard One 8B v2.2, que combina un modelo de texto Ministral 3 8B con una torre de visión Pixtral bajo la arquitectura `mistral3`. Sobre ese backbone se ha añadido y fusionado una joint schema head de 70,6 M de parámetros en float32, que atiende sobre los estados ocultos de la capa final y de la capa 25 para construir un grafo conjunto de preguntas y opciones. A diferencia de Standard One, que genera una letra de respuesta por opción y requiere una pasada por pregunta, esta cabeza procesa todas las preguntas de una petición en un único forward pass y devuelve una distribución calibrada por pregunta. El modelo no genera texto.

El entrenamiento de v4 continúa desde v3 sobre ítems de decisión, en su mayoría sintéticos propios (escritos por LLM en estilos variados y verificados por código), con replay de datos anteriores. v3, a su vez, se había afinado sobre unas 2.200 nuevas tareas de decisión en las familias donde v2 era más débil. La model card advierte que, para algunos benchmarks del Decision Index, el split público de entrenamiento o el generador público del benchmark formaron parte del entrenamiento (HoVer entre ellos), aunque los ítems evaluados nunca se usaron en entrenamiento.

## Capacidades

- Decisión tipada sobre escenarios: preguntas de tipo `choice` (2-255 opciones), `noul` (sí/no) y `score` (escala ordinal), con salida de distribuciones de probabilidad calibradas.
- Procesamiento de múltiples preguntas por escenario en una sola pasada, compartiendo el coste de lectura del contexto.
- Manejo de conjuntos de opciones muy grandes (100-255) con precisión cercana a la de conjuntos pequeños, orientado a intención y enrutamiento.
- Localización de decisiones enterradas en documentos largos de hasta 32.768 tokens.
- Capacidad multimodal heredada del backbone (torre de visión Pixtral), aunque la model card no detalla tareas de decisión sobre imagen.
- Verificación de afirmaciones multi-hop (HoVer), recuperación razonada sobre documentos largos (BRIGHT) y comprensión de contratos (ContractNLI), según los benchmarks reportados.
- No soporta generación de texto libre ni tool calling generativo: la interfaz es de clasificación/decisión.
- El formato de prompt usa la plantilla de chat sin mensaje de sistema por defecto.

## Casos de uso

- Enrutamiento de intenciones en asistentes conversacionales: el modelo puede clasificar la intención del usuario entre 100-255 opciones manteniendo precisión gracias a la schema head, adecuado para sistemas de triaje previos a un LLM generativo.
- Moderación y clasificación de contenido: preguntas de sí/no (`noul`) o escalas ordinales (`score`) permiten puntuar políticas de forma calibrada y consistente en lotes grandes.
- Verificación de afirmaciones en pipelines de fact-checking: el rendimiento en HoVer (72,8 en Decision Index) lo hace útil para comprobar afirmaciones multi-hop contra evidencia recuperada.
- Recuperación razonada sobre documentación larga: con 32.768 tokens de contexto puede decidir relevancia sobre pasajes de ~12k tokens (BRIGHT), útil en motores de búsqueda empresarial.
- Comprensión de contratos y documentos legales: clasificación de cláusulas y compromisos (ContractNLI) en flujos de revisión automatizada.
- Relevancia en búsqueda de producto: evaluación de la pertinencia de resultados (Amazon ESCI) para reordenar o filtrar catálogos.
- Automatización de domótica: interpretación de peticiones en simuladores de electrodomésticos para decidir la acción o el comando adecuado.
- Análisis musical estructurado: lectura de acordes en partituras (POP909-CL), un caso de nicho donde el modelo muestra capacidad de clasificación especializada.

## Benchmarks y rendimiento

| Benchmark | SH v3 | SH v4 (esta release) |
|---|---:|---:|
| Decision Index 0.3, índice público | 48,34 | 57,40 |
| Áreas: Knowledge / Language / Retrieval / Tools / Arts | 32,1 / 51,0 / 65,8 / 60,9 / 25,5 | 36,9 / 57,9 / 66,4 / 84,0 / 42,5 |
| HoVer, verificación multi-hop (DI) | 72,6 | 72,8 |
| BRIGHT, recuperación razonada sobre documentos largos (~12k tokens, DI) | 34,8 | 34,2 |
| Decisión oculta en documento largo (set propio, 150 ítems) | 87,33 | 88,00 |
| JevBench público: easy / original / hard (48 / 72 / 111 ítems) | 100,00 / 95,83 / 74,77 | 100,00 / 94,44 / 75,68 |

Las filas marcadas como DI son puntuaciones de habilidad corregidas por azar (0 = aleatorio, 100 = perfecto) obtenidas por el propio autor con el kit oficial sobre las 140.178 peticiones puntuables del suite público 0.3. Las demás filas son precisión en porcentaje medida con el motor Standard One sobre ítems idénticos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni benchmarks generativos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos completos en safetensors ocupan 55,4 GB de repositorio; en FP8 la huella se reduce aproximadamente a la mitad (~9 GB de pesos más overhead), y las variantes GGUF permiten cuantizaciones de 4-8 bits para entornos con menos memoria.
- GPU recomendadas: A100 80 GB o H100 para pesos completos en float32/bf16; A100 40 GB o L40S para FP8; RTX 4090 (24 GB) viable con FP8 o GGUF cuantizado.
- Cabe en GPU de consumo: sí, en RTX 4090/RTX 3090 con cuantización FP8 o GGUF; en 16 GB (RTX 4080) solo con GGUF de 4 bits.
- Opciones de despliegue: transformers (librería declarada), FP8 para vLLM/TGI, GGUF para llama.cpp/Ollama. El modelo se sirve a través del contrato `POST /v1/systemone` del motor Standard One.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StandardOne-8B-SH (este) | 8,92 B | 32.768 | Decisión tipada con schema head, sin generación | Apache-2.0 | HF (safetensors, FP8, GGUF) |
| StandardOne-3B-SH | no disponible | no disponible | Misma familia, versión reducida | Apache-2.0 | HF |
| Standard One 8B (base, sin SH) | 8 B (aprox.) | no disponible | Decisión por generación de letra, una pasada por pregunta | Apache-2.0 | HF |

La model card solo ofrece comparación interna con la propia familia Standard One; no se dispone de comparativas con modelos de clasificación de otros proveedores en la información proporcionada.

## Limitaciones y advertencias

- El modelo no genera texto: no puede usarse para tareas generativas, diálogo libre ni tool calling generativo.
- El campo `language` declara únicamente inglés, pese a que los gráficos mencionan decisiones en 21 idiomas; el soporte multilingüe no está formalmente garantizado.
- Riesgo de alucinación o calibración deficiente fuera de la distribución de entrenamiento; las probabilidades deben validarse en el dominio de producción.
- Contaminación de benchmarks declarada: para algunos benchmarks del Decision Index (incluido HoVer) el split público de entrenamiento o el generador público formaron parte del entrenamiento, por lo que las cifras pueden estar infladas.
- Las puntuaciones del Decision Index son autoevaluadas por el autor con su propio kit; no son verificaciones independientes.
- El formato de prompt requiere la plantilla de chat sin mensaje de sistema por defecto; un formato incorrecto puede degradar las decisiones.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las obligaciones de atribución y las condiciones del backbone base.
- El tamaño del repositorio (55,4 GB) y la necesidad de servir la cabeza en float32 añaden complejidad operativa frente a un clasificador convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StandardThinking/StandardOne-8B-SH
- Variante FP8: https://huggingface.co/StandardThinking/StandardOne-8B-SH-FP8
- Variante GGUF: https://huggingface.co/StandardThinking/StandardOne-8B-SH-GGUF
- Modelo menor: https://huggingface.co/StandardThinking/StandardOne-3B-SH
- Modelo base: https://huggingface.co/StandardThinking/StandardOne-8B
- Dataset de runs del Decision Index: https://huggingface.co/datasets/StandardThinking/StandardOne-SH-decision-index
- Guía del Decision Index: https://standardthinking.ai/resources/guides/standard-one-sh-decision-index/
- Gráficos de benchmarks: https://huggingface.co/StandardThinking/StandardOne-8B-SH/resolve/main/assets/charts/01-index-vs-size.png
