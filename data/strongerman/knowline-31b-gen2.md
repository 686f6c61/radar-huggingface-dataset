# strongerman/KnowLine-31B-Gen2

## Resumen

KnowLine-31B-Gen2 es un modelo de decisión ("System One") desarrollado por PelaAI (publicado bajo el handle `strongerman` en Hugging Face) como un fine-tuning supervisado del modelo denso google/gemma-4-31B-it. No es un modelo generativo al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones, o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones en un único forward pass, sin generar texto. Está pensado para integrarse como clasificador/decision-maker dentro de pipelines de agentes y sistemas de enrutamiento.

Técnicamente es un transformer denso de aproximadamente 31.273 millones de parámetros, derivado de Gemma 4, con la torre de visión intacta respecto al modelo base y el tokenizer de Gemma 4. El ajuste se hizo mediante un adaptador LoRA (rank 32, alpha 64, solo componente de lenguaje, una época) fusionado en pesos bf16, y se le ha incorporado una temperatura de lectura T = 1.27 ajustada sobre datos de validación y plegada en los pesos finales para calibrar las probabilidades.

Su relevancia radica en dos frentes: por un lado, ofrece una interfaz de decisión con probabilidades calibradas (ECE en torno a 0.009–0.013 y Brier de 0.208–0.231 según el autor), lo que lo hace útil para sistemas que necesitan umbrales fiables; por otro, su licencia Apache-2.0 y su compatibilidad con clientes Jev y con otros modelos KnowLine facilitan su adopción sin cambios de integración más allá de la URL base o el nombre del modelo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de google/gemma-4-31B-it) |
| Parámetros totales | 31.273.088.876 |
| Parámetros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16 (pesos publicados); no se documentan otras cuantizaciones |
| Idiomas soportados | inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ~62,5 GB) |
| Pipeline | text-classification |
| Modelo base | google/gemma-4-31B-it |
| Tipo de ajuste | LoRA (rank 32, alpha 64, solo LM, 1 época) fusionado en bf16 |
| Temperatura de lectura | T = 1.27 plegada en los pesos (norma final y soft-cap de logits) |
| Servido de referencia | SGLang 0.5.21 en bf16, con lectura doble de peticiones |
| Tamaño del repo | 62,6 GB |

## Arquitectura y entrenamiento

El modelo parte de Gemma 4 31B en su variante instruct (`google/gemma-4-31B-it`), un transformer denso de unos 31B parámetros con licencia Apache-2.0. Sobre él se aplicó un adaptador LoRA de rank 32 y alpha 64, restringido únicamente al componente de lenguaje (la torre de visión queda sin tocar respecto al base), entrenado durante una época y posteriormente fusionado en pesos bf16. Los ejemplos de entrenamiento son tareas de decisión redactadas y etiquetadas por profesores LLM, renderizadas con la plantilla de chat de Gemma. El conjunto de datos de entrenamiento no se incluye en el repositorio.

La innovación principal no está en la arquitectura sino en el paradigma de inferencia y en la calibración. El modelo no genera texto: para cada pregunta realiza un forward pass y lee la probabilidad del token de etiqueta de cada opción. Se sirve con "lectura doble" (`knowline_server.py` lee cada petición dos veces por defecto; `--no-read-twice` lo desactiva), un patrón heredado de las versiones anteriores de la familia KnowLine. Además, una temperatura de lectura única (T = 1.27) ajustada sobre datos de validación con este mismo esquema de servido se ha plegado directamente en los pesos, de modo que altera la magnitud de las probabilidades pero no el ranking de opciones. El front end lee las preguntas de puntuación a temperatura efectiva 1.0 mediante `temperatures.json`.

## Capacidades

- Clasificación y decisión estructurada: responde hasta 64 preguntas tipadas por estado, con tres formatos: sí/no (`noul`), elección entre k opciones (`choice`) y puntuación sobre rúbrica.
- Salida probabilística calibrada: devuelve una distribución sobre las opciones de cada pregunta, no una etiqueta dura, lo que permite aplicar umbrales y estimar incertidumbre.
- Un solo forward pass por pregunta, sin generación de texto, lo que reduce latencia frente a esquemas de prompting generativo.
- Entrada multimodal heredada del base: el tag `image-text-to-text` y la torre de visión intacta sugieren soporte de entrada de imagen, aunque la model card no detalla el uso de visión en el flujo de decisión.
- Multilingüe limitado a inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz: los clientes Jev existentes solo necesitan cambiar la URL base; los usuarios de otros modelos KnowLine solo cambian el nombre del modelo.
- No se documenta soporte explícito de tool calling, function calling ni razonamiento multi-paso en el sentido de agentes generativos; su rol es el de decisor dentro de un pipeline.

## Casos de uso

- Enrutamiento de tickets de soporte: enviar el texto del ticket como estado y preguntas de tipo `choice` (categoría, urgencia, idioma) para dirigirlo al equipo adecuado; la salida probabilística permite derivar a revisión humana cuando la confianza es baja.
- Moderación y triaje de contenido: preguntas `noul` encadenadas (¿es spam?, ¿es abusivo?, ¿requiere escalado?) sobre cada mensaje, con umbrales ajustados gracias a la calibración ECE ~0.01.
- Evaluación automática de respuestas de agentes: puntuar con rúbrica la calidad, tono o corrección de una respuesta generada por otro modelo, usando el estado conversacional completo como entrada.
- Decisión de negocio en atención al cliente: el ejemplo de la model card (¿debe el agente ofrecer un reembolso? y ¿cuál es el tono del cliente?) se generaliza a políticas de devolución, escalado o compensación.
- Filtrado previo en pipelines RAG: decidir si una consulta necesita recuperación, si es ambigua o si es de dominio, antes de invocar un modelo generativo más costoso.
- Análisis de conversaciones multilingües (EN/ZH): clasificar intención y sentimiento en chats en inglés o chino simplificado/tradicional con una única interfaz tipada.
- Señal de confianza para sistemas de agentes: al devolver probabilidades calibradas, puede alimentar mecanismos de abstención o de derivación a humano en flujos automatizados.

## Benchmarks y rendimiento

El autor reporta resultados propios (self-run) sobre el conjunto público Decision Index 0.3, no sobre el completo 0.4.1. No hay entrada de board para este modelo.

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| KnowLine-31B-Gen2 | 31B | 73.00 | sin puntuar | Self-run, kit oficial |
| karpo-decision-31B | ~31,3B | 75.05 | 73.86 | Board |
| GLiDE 27B | ~26,1B | 72.49 | 73.37 | Board |
| REAX 1.3 | ~57,4B | 73.71 | 72.64 | Board |
| Logits Sigma-1 Duo | ~57,4B | 72.93 | 72.28 | Board |
| Copernicus-31B | ~31,3B | 70.37 | 72.11 | Board |
| KnowLine 31B Gen1.5 | ~31,3B | 70.50 | 71.91 | Board |
| Copernicus-57B | ~57,4B | 75.34 | 71.80 | Board |
| FlexDM-LoRA 2.1 · Gemma-4-31B | ~31,3B | 68.99 | 71.61 | Board |

Métricas de calibración reportadas por el autor (método del board sobre el conjunto público): ECE ≈ 0.009–0.013 y Brier ≈ 0.208–0.231 (KnowLine-26B-A4B-Gen2.5: ECE 0.013–0.018, Brier 0.24–0.27). No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 62,5 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU, por lo que se necesita una GPU de al menos ~80 GB para servirlos con holgura.
- GPU de referencia usada por el autor: H20 de 96 GB para la evaluación del Decision Index.
- Alternativas de gama alta: A100 80 GB, H100 80 GB o H200; con 80 GB el margen es ajustado y puede requerir reducir la reserva de memoria de SGLang.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; no se documentan versiones cuantizadas en el repositorio.
- Despliegue recomendado: SGLang 0.5.21 en bf16 con `serve_knowline.sh` y el front end `knowline_server.py` + `knowline_layout.py` (dependen solo de transformers y requests). Requiere transformers 5.12.1.
- No se documentan opciones de despliegue con llama.cpp, Ollama, vLLM ni TGI, ni datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI 0.3 público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-31B-Gen2 | ~31,3B | no disponible | 73.00 (self-run) | Apache-2.0 | Hugging Face (repo propio) |
| karpo-decision-31B | ~31,3B | no disponible | 75.05 | no disponible | Board Decision Index |
| Copernicus-31B | ~31,3B | no disponible | 70.37 | no disponible | Board Decision Index |
| KnowLine 31B Gen1.5 | ~31,3B | no disponible | 70.50 | Apache-2.0 | Hugging Face (PelaAI) |
| GLiDE 27B | ~26,1B | no disponible | 72.49 | no disponible | Board Decision Index |

La comparación se limita a la puntuación DI porque no hay datos públicos de arquitectura, contexto o licencia de los competidores en la información disponible. Frente a sus hermanos de familia, KnowLine-31B-Gen2 supera a KnowLine-35B-A3B-Gen1.5 (70.72) y a KnowLine-26B-A4B-Gen2.5 (68.21) en el mismo suite y con el mismo servido, según el autor.

## Limitaciones y advertencias

- Modelo de nicho: no genera texto; solo responde preguntas tipadas. No es adecuado para tareas generativas, de código o de razonamiento abierto.
- Idiomas limitados a inglés y chino (simplificado y tradicional); el rendimiento en castellano no está documentado y probablemente sea deficiente.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento con estados o conversaciones largas.
- Los resultados de DI 0.3 son self-run y no han pasado por el board oficial; el modelo no tiene entrada en DI 0.4.1, donde el 60 % del peso son tests privados.
- La calibración reportada (ECE ~0.01) procede del método del board sobre el conjunto público; puede degradarse en dominios distintos de los de entrenamiento.
- Riesgo de alucinación estructural: al leer probabilidades de tokens de etiqueta, una pregunta mal formulada o fuera de distribución puede producir distribuciones planas o sesgadas sin señal de error explícita.
- Sesgos heredados de Gemma 4 y de los profesores LLM que etiquetaron los datos de entrenamiento; no se documenta ningún proceso de mitigación.
- El conjunto de entrenamiento no se publica, lo que dificulta la auditoría de sesgos y la reproducibilidad.
- El servido por defecto hace doble lectura de cada petición, lo que duplica el coste computacional; hay que desactivarlo explícitamente con `--no-read-twice` si se prioriza latencia.
- Licencia Apache-2.0 en los pesos, pero conviene verificar las condiciones del modelo base Gemma 4 y de la marca KnowLine/PelaAI para uso comercial.
- El autor declara no estar afiliado a TypeSafe, Jev ni Google, y el modelo no deriva de TypeSafe ni Jev.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/strongerman/KnowLine-31B-Gen2
- Guía de inferencia: INFERENCE.md (referenciada en el repo)
- README en chino: README.zh.md (referenciado en el repo)
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Versión anterior KnowLine-31B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-31B-Gen1.5
- Datos oficiales del Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/index.json
