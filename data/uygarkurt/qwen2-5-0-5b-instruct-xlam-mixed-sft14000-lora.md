# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora

## Resumen

`uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora` es un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct`, publicado por el usuario uygarkurt. No es un modelo completo: el repositorio contiene únicamente los pesos del adaptador en formato safetensors y debe cargarse sobre el modelo base original mediante PEFT. Su objetivo es especializar un modelo de ~0,5 mil millones de parámetros en la generación de llamadas a herramientas con estructura JSON y, de forma destacable, en la abstención cuando las herramientas ofrecidas no son pertinentes para la petición del usuario.

El entrenamiento consistió en 14.000 actualizaciones de SFT (2,2 horas de bucle de entrenamiento) sobre el dataset mixto `uygarkurt/xlam-tool-calling-mixed`, generado por el propio autor. La relevancia de esta ficha es doble: por un lado, demuestra que un modelo de medio billón de parámetros puede mejorar sustancialmente en exactitud de llamada a función (del 63,84 % al 81,33 % en xLAM ETC) con un coste de entrenamiento muy bajo; por otro, sirve como ejemplo reproducible de una receta de post-entrenamiento publicada junto al código de [Post-Training Lab](https://github.com/uygarkurt/post-training-lab).

El适配ador está pensado para escenarios de agentes y enrutado de funciones en entornos con recursos muy limitados (CPU, dispositivos embebidos, GPUs de gama de entrada). Su principal contrapartida documentada es una caída de 4 puntos en MMLU respecto al modelo base, es decir, una pérdida de conocimiento general a cambio de especialización en tool calling.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only; modelo base Qwen2.5-0.5B-Instruct |
| Parámetros totales | ~0,5 B en el modelo base; número de parámetros entrenables del adaptador: no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-0.5B-Instruct) |
| Tipos de cuantización | El adaptador se distribuye en safetensors (sin cuantizar); para usar GGUF/AWQ/GPTQ hay que fusionar el LoRA con el base y cuantizar el resultado |
| Idiomas soportados | inglés (único idioma declarado en la model card y en el entrenamiento); el base Qwen2.5 es multilingüe, pero el adaptador no se ha entrenado para ello |
| Licencia | no disponible para el adaptador; el modelo base Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 según la documentación de Qwen |
| Formato de pesos | safetensors (adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only con atención causal, RoPE, normalización RMSNorm y FFN con SwiGLU, en la configuración de ~0,5 B de la familia Qwen2.5 (contexto nativo de 32.768 tokens). Sobre esa base, el autor entrena un LoRA con supervisión directa (SFT), sin que la model card detalle el rango, el alpha, las capas objetivo ni la tasa de aprendizaje del adaptador. El entrenamiento se ejecutó con la herramienta Post-Training Lab y consta de 14.000 actualizaciones, con un tiempo de bucle de 2,2 horas (excluyendo carga de modelo, preparación de datos y evaluación externa).

El dataset `uygarkurt/xlam-tool-calling-mixed` es una mezcla orientada a tool calling construida por el autor a partir del ecosistema xLAM. El objetivo declarado del entrenamiento no es solo acertar la llamada, sino también abstenerse cuando las herramientas disponibles son irrelevantes: el modelo debe reconocer que ninguna función aplica y responder en consecuencia. La evaluación se realizó con scripts propios del repositorio Post-Training Lab, con un holdout de llamadas de 2.287 ejemplos evaluados y 700 descartados, además de subconjuntos seleccionados de BFCL-v3 de un solo turno. No se documenta el uso de RLHF, DPO ni GRPO en este checkpoint concreto (el autor publica una variante posterior con GRPO como repositorio separado).

## Capacidades

- Generación de llamadas a herramientas en formato estructurado (JSON), con nombres de función y argumentos.
- Precisión de nombre de función muy alta: 97,68 % en xLAM FNA, frente al 90,03 % del modelo base.
- Exactitud de llamada completa: 81,33 % en xLAM ETC, frente al 63,84 % del base.
- Abstención ante herramientas irrelevantes: mantiene un 66,40 % en el subconjunto de irrelevancia, prácticamente igual que el base (66,93 %) pese a la especialización.
- Seguimiento de instrucciones mejorado de forma moderada: IFEval sube del 26,80 % al 29,02 % (exactitud estricta a nivel de prompt).
- Razonamiento matemático ligeramente mejorado: MATH-500 pasa del 15,80 % al 18,40 %.
- Soporte de function calling de un solo turno en subconjuntos de BFCL-v3 (50,28 % → 56,19 %).
- Capacidades heredadas del base: generación de texto conversacional, respuesta a preguntas y razonamiento básico, degradadas respecto al original en conocimiento general (MMLU 42,04 % → 38,04 %).
- No se declara soporte de visión, audio, modo "thinking" explícito ni agentes multi-paso nativos más allá de lo que permita el bucle externo que orqueste las llamadas.

## Casos de uso

- Enrutado de funciones en asistentes locales: dado un mensaje de usuario y un catálogo de 5-20 herramientas, el modelo devuelve la llamada JSON correspondiente. Su tamaño (~0,5 B) permite ejecutarlo en CPU o en GPUs integradas con latencia aceptable para un enrutador.
- Guardarraíl de abstención: cuando el catálogo de herramientas no cubre la petición, el adaptador está entrenado explícitamente para no inventar una llamada. Es útil como primera capa de un pipeline agentico que, en caso de abstención, deriva a un modelo mayor o a un humano.
- Extracción de argumentos estructurados: convertir texto libre en parámetros tipados (fechas, identificadores, filtros) antes de invocar una API REST interna, reduciendo el código de parseo ad hoc.
- Despliegue en dispositivos embebidos y edge: al caber en unos pocos cientos de MB tras fusionar y cuantizar el adaptador, es viable en placas tipo M5Stack o Raspberry Pi para automatizaciones de domótica o asistentes de voz con STT/TTS externos.
- Prototipado rápido de tool calling antes de escalar: permite validar el esquema de herramientas, los prompts de sistema y la política de abstención con un coste de inferencia mínimo, y después replicar el pipeline sobre Qwen2.5-7B o 14B.
- Investigación en post-entrenamiento: sirve como punto de partida reproducible para ablaciones de SFT frente a GRPO, comparando con la variante `...-grpo1320-lora` del mismo autor y con el checkpoint intermedio `...-sft5600-lora`.
- Generación de datos sintéticos de llamadas a función: el adaptador puede producir pares (petición, llamada) para aumentar datasets de entrenamiento de modelos mayores, con la ventaja de que también genera ejemplos negativos de abstención.
- Clasificación y normalización de nombres de función en pipelines de CI/CD: dado un snippet de código o una descripción, mapear a la herramienta correcta de un conjunto fijo y validar el resultado en tests automatizados.

## Benchmarks y rendimiento

Datos publicados por el autor en la model card. Todas las puntuaciones son porcentajes. La primera fila corresponde al modelo base sin adaptador; la segunda, a este adaptador.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | 42,04 | 15,80 | 26,80 | 63,84 | 90,03 | 50,28 | 77,78 | 66,93 | — |
| SFT 14.000 (este adaptador) | 38,04 | 18,40 | 29,02 | 81,33 | 97,68 | 56,19 | 83,33 | 66,40 | 2,2 |

Advertencias sobre la metodología, tal como las declara el autor: xLAM ETC es exactitud exacta de llamada y xLAM FNA es exactitud del nombre de función; ambas se calculan sobre el holdout de solo llamadas (2.287 ejemplos evaluados, 700 descartados), no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno, y Relevance/Irrelevance corresponden a subconjuntos seleccionados de relevancia. Son agregados específicos del estudio y no son directamente comparables con los leaderboards públicos. IFEval usa exactitud estricta a nivel de prompt.

## Requisitos de hardware

- VRAM para inferencia: ~1 GB para el modelo base en fp16/bf16 más el adaptador LoRA (unos pocos MB adicionales); ~0,3-0,5 GB si se fusiona y cuantiza a 4 bits. Estimaciones a partir del tamaño del base, no publicadas por el autor.
- Caché KV: varios cientos de MB en el peor caso a 32.768 tokens de contexto (estimación dependiente de la configuración de capas y cabezas del base).
- GPU recomendadas: cualquier GPU con ≥2 GB de VRAM sirve; RTX 3060/4060, T4, L4 o incluso GTX 1650 son suficientes. A100/H100 no aportan ventaja práctica por el escaso tamaño del modelo, salvo por agregación de peticiones.
- Cabe en GPU de consumo: sí, en todas las GPU dedicadas modernas e incluso en iGPU con memoria unificada. También funciona en CPU con llama.cpp tras fusionar el adaptador.
- Opciones de despliegue: `transformers` + `peft` (ruta nativa del repo), vLLM (soporta múltiples adaptadores LoRA concurrentes sobre el mismo base), TGI, llama.cpp y Ollama (requieren fusionar el LoRA con el base y convertir a GGUF), y servicios gestionados como FriendliAI, que ya lista variantes de esta familia.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera que quede limitado por el coste de prefill en contextos largos más que por el decode.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (SFT 14.000) | ~0,5 B (LoRA sobre Qwen2.5-0.5B) | 32.768 | xLAM ETC 81,33 %; FNA 97,68 %; BFCL 56,19 % | no disponible (base Apache 2.0) | HuggingFace, 0 descargas |
| `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo1320-lora` | ~0,5 B (LoRA) | 32.768 | no disponible en la información recogida | no disponible | HuggingFace |
| `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora` | ~0,5 B (LoRA) | 32.768 | no disponible (checkpoint intermedio de la misma receta) | no disponible | HuggingFace y FriendliAI |
| `Qwen/Qwen2.5-0.5B-Instruct` (base) | ~0,5 B | 32.768 | xLAM ETC 63,84 %; FNA 90,03 %; BFCL 50,28 % | Apache 2.0 | HuggingFace, Ollama, ampliamente desplegado |
| `Salesforce/xLAM-1b-fc-r` | ~1 B | no disponible | no disponible | no disponible | HuggingFace (referencia de la familia xLAM) |

La comparación directa más informativa es contra el propio modelo base: el adaptador gana 17,5 puntos en exactitud de llamada y 7,7 en nombre de función, pero pierde 4 puntos en MMLU. Frente a la variante GRPO del mismo autor, no hay datos de evaluación en la información disponible para establecer qué etapa es superior.

## Limitaciones y advertencias

- Regresión en conocimiento general: MMLU cae de 42,04 % a 38,04 %. El adaptador no debe usarse como modelo de cultura general ni como sustituto del base en tareas no relacionadas con tool calling.
- La abstención no mejora: el subconjunto de irrelevancia baja ligeramente (66,93 % → 66,40 %). Un tercio de los casos irrelevantes siguen resolviéndose mal, lo que en producción implica riesgo de llamadas espurias a herramientas.
- Idioma: solo inglés declarado y solo datos en inglés en el entrenamiento. El multilingüismo del base no está garantizado tras el ajuste; no se han publicado evaluaciones en castellano.
- Riesgo de alucinación de argumentos: con ~0,5 B de parámetros, el modelo puede generar valores plausibles pero incorrectos en los parámetros de la llamada (identificadores, fechas, importes). Requiere validación de esquema y, preferiblemente, verificación contra la API real.
- Licencia del adaptador no declarada: la model card no incluye licencia. Aunque el base Qwen2.5-0.5B-Instruct es Apache 2.0, antes de un uso comercial conviene confirmar los términos con el autor.
- Naturaleza de adaptador: no es un modelo autónomo. Requiere descargar el base, cargar el LoRA con PEFT y, para cuantizar o servir en llama.cpp/Ollama, fusionar previamente los pesos.
- Metodología de evaluación no estándar: los agregados de xLAM y BFCL son propios del estudio, con subconjuntos seleccionados y 700 ejemplos descartados. Los números no son comparables con leaderboards públicos.
- Validación comunitaria nula: 0 descargas y 0 likes en el momento de la consulta, repositorio de 0,0 GB declarados y sin issues públicos. No hay evidencia de uso en producción.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o robustez adversarial. Al heredar el base y entrenarse solo con datos sintéticos de tool calling, el comportamiento fuera de distribución es incierto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Repositorio de post-entrenamiento (código y scripts de evaluación): https://github.com/uygarkurt/post-training-lab
- Variante GRPO del mismo autor: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft14000-grpo1320-lora
- Checkpoint intermedio SFT 5.600: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Despliegue gestionado de la familia: https://friendli.ai/models/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-sft5600-lora
- Ficha del base en Ollama: https://ollama.com/library/qwen2.5:0.5b-instruct
- Documentación del base en M5Stack (referencia de despliegue en edge): https://docs.m5stack.com/en/stackflow/models/qwen2.5-0.5b-instruct
