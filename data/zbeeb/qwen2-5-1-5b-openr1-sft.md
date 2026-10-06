# zbeeb/Qwen2.5-1.5B-OpenR1-SFT

## Resumen

Qwen2.5-1.5B-OpenR1-SFT es un ajuste fino supervisado (SFT) del modelo denso Qwen/Qwen2.5-1.5B, publicado por el usuario zbeeb en HuggingFace. No se trata de un modelo de propósito general, sino del punto de control final de la fase SFT dentro de un estudio a nivel de token sobre la transición de SFT a GRPO (aprendizaje por refuerzo con Group Relative Policy Optimization). El modelo se entrenó sobre un subconjunto verificado localmente del dataset open-r1/OpenR1-Math-220k, orientado a razonamiento matemático.

Con 1.777.088.000 parámetros reales (aproximadamente 1,78 mil millones) y un presupuesto de secuencia de 4096 tokens, el modelo está pensado para generar trazas de razonamiento matemático paso a paso en inglés. La model card insiste en que los resultados de evaluación incluidos son "resultados de sondas de experimento", no métricas de benchmarks estándar, lo que sitúa el artefacto en el terreno de la investigación reproducible más que en el de un modelo listo para producción.

Su relevancia actual radica en tres factores: es un punto de partida documentado y reproducible para estudiar la cadena SFT a GRPO en modelos pequeños, incluye artefactos de procedencia (configuración de entrenamiento, IDs de ejemplos, sumas SHA-256) poco habituales en publicaciones de aficionados, y hereda la licencia Apache 2.0 del modelo base, lo que facilita su reutilización y experimentación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de tipo Qwen2 (arquitectura del modelo base Qwen2.5-1.5B) |
| Parametros totales | 1.777.088.000 (aprox. 1,78 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | 4096 tokens (presupuesto de secuencia usado en el SFT; la model card no declara una ventana de inferencia distinta) |
| Tipos de cuantizacion | no disponible en la model card; los pesos se publican en safetensors con dtype F32 y admiten cuantizacion posterior con herramientas de terceros (GPTQ, AWQ, GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tensores guardados en F32; entrenamiento en bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen/Qwen2.5-1.5B, un transformer denso de tipo Qwen2, del que este repositorio es un ajuste fino. El autor indica que se partió de la revisión `8faed761d45a263340a0528343f099c05c9a4323` del modelo base y que los pesos fueron modificados mediante SFT; el tokenizador y los ajustes de generación son los artefactos exactos guardados del experimento.

El entrenamiento se realizó con Prime RL 0.9.0 (revisión `ab5de8fff44b2c4a5c85e24b6e6e3f7d57eee7b1`) y completó 278 actualizaciones del optimizador sobre 20.016 ejemplos, equivalentes a una época sobre un subconjunto seleccionado de open-r1/OpenR1-Math-220k (revisión `e4e141ec9dea9f8326f4d347be56105859b2bd68`). La selección de datos prioriza trazas de razonamiento matemático completas y verificadas localmente que caben en el presupuesto de 4096 tokens; los ejemplos demasiado largos se excluyeron en lugar de truncarse, y los tokens del prompt se enmascaran de la pérdida supervisada. Los hiperparámetros documentados son: semilla 42, batch efectivo de 72 ejemplos, tasa de aprendizaje 2e-05, scheduler coseno, warmup ratio 0,03, weight decay 0,01, gradient clipping 1.0 y precisión de entrenamiento bf16. El repositorio incluye `data-selection.json` con los IDs exactos de ejemplos y sondas, `train_metrics.jsonl` con las métricas de las actualizaciones y `evaluation-summary.jsonl` con los resúmenes de las sondas fijas de entrenamiento y de validación (medidas tanto con teacher forcing como en generación libre). La model card describe el marco como un "estudio a nivel de token de la transición de SFT a GRPO"; los puntos de control posteriores de GRPO se publican por separado en la misma colección, tras finalizar sus ejecuciones.

## Capacidades

- Generación de texto en inglés con plantilla de chat conversacional (`apply_chat_template`), compatible con el pipeline `text-generation` de transformers.
- Razonamiento matemático paso a paso: el ejemplo de uso del autor emplea un mensaje de sistema que pide razonar paso a paso y colocar la respuesta final dentro de `\boxed{}`.
- Generación de trazas de razonamiento largas, con `max_new_tokens` de hasta 3072 en el ejemplo oficial.
- Muestreo controlado con `temperature=0.6`, `top_p=0.95` y cierre por tokens EOS (151643 y 151645) según los ajustes guardados del experimento.
- Soporte de tool calling / function calling: no disponible (la model card no lo menciona).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible como funcionalidad declarada; el modelo produce cadenas de razonamiento internas, no un bucle de agente.
- Capacidades multilingües: limitadas a inglés según el campo `language` de la model card.
- Capacidades especiales: no declara modo de pensamiento nativo, visión, audio ni decodificación especulativa. Es un checkpoint de investigación con artefactos de trazabilidad (procedencia, checksums), no un modelo con funcionalidades diferenciales de producto.

## Casos de uso

- Generación de datos sintéticos de razonamiento matemático: al estar afinado sobre trazas verificadas de OpenR1-Math-220k, puede usarse para producir soluciones paso a paso que sirvan como datos de destilación o como material inicial para etapas posteriores de RL, tal como plantea el propio estudio.
- Punto de partida reproducible para experimentos SFT a GRPO: investigadores que quieran replicar o extender el estudio a nivel de token pueden partir de estos pesos y continuar con la etapa GRPO usando el dataset zbeeb/Staleness-GRPO-DAPO-Math-17k.
- Evaluación de metodologías de enmascarado de prompt y longitud de secuencia: al incluir métricas de teacher forcing y generación libre en `evaluation-summary.jsonl`, sirve para comparar estrategias de selección de datos frente al truncado.
- Tutoría matemática en inglés para problemas de nivel escolar y preuniversitario: con el prompt de sistema adecuado, genera la resolución completa con la respuesta final aislada en `\boxed{}`, lo que facilita el parseo automático.
- Prototipado y pruebas de integración en pipelines de transformers: su tamaño reducido permite iterar rápido en entornos de desarrollo con GPU modesta, validando plantillas de chat, manejo de tokens EOS y decodificación antes de escalar a modelos mayores.
- Investigación educativa sobre errores de razonamiento: las trazas generadas en generación libre permiten analizar en qué punto de la cadena de razonamiento aparecen fallos, comparando con las sondas fijas incluidas en el repositorio.
- Comparación de checkpoints dentro del mismo estudio: al compartir selección de datos e hiperparámetros con los futuros checkpoints de GRPO, sirve como línea base SFT contra la que medir la mejora atribuible a la etapa de refuerzo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card es explícita al respecto: las mediciones de `evaluation-summary.jsonl` son "resultados de sondas de experimento, no una afirmación de rendimiento en benchmarks estándar". No se proporcionan cifras de MMLU, GSM8K, MATH, HumanEval ni de ningún otro benchmark público, ni para este checkpoint ni para comparaciones con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir del recuento real de parámetros, 1,777 mil millones; no confirmados por el autor):
  - bf16 / fp16: aproximadamente 3,6 GB solo para pesos, más el KV cache y el overhead del runtime.
  - fp32: aproximadamente 7,1 GB solo para pesos (coincide con el tamaño del repositorio, 7,1 GB, que almacena los tensores en F32).
  - int8: aproximadamente 1,8 GB.
  - int4: aproximadamente 0,9-1 GB.
- Con una ventana de 4096 tokens, el KV cache añade un consumo moderado (del orden de cientos de megabytes), muy inferior al de pesos.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente en bf16 o fp16; una RTX 3060 de 12 GB, RTX 4070 o RTX 4090 lo alojan con holgura. En cuantización int4 cabe en GPUs de 4 GB o incluso en CPU.
- Cabe en GPU de consumo: sí, es uno de sus principales atractivos frente a modelos de razonamiento de mayor tamaño.
- Opciones de despliegue: transformers (vía de referencia del autor), vLLM y TGI (el repositorio incluye el tag `text-generation-inference` y `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir previamente los pesos a GGUF, ya que el repositorio solo publica safetensors.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Rendimiento en benchmarks |
|---|---|---|---|---|---|---|
| zbeeb/Qwen2.5-1.5B-OpenR1-SFT | 1,78 B (denso) | 4096 tokens (SFT) | en | apache-2.0 | safetensors | no disponible |
| Qwen/Qwen2.5-1.5B (modelo base) | aprox. 1,5 B nominales (1,78 B reales) | no disponible en esta ficha | no disponible en esta ficha | apache-2.0 | safetensors | no disponible en esta ficha |
| Otros modelos de razonamiento de tamano similar (por ejemplo, destilados de R1 sobre Qwen de 1,5 B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. La única comparación sólida que puede establecerse con la información proporcionada es frente al modelo base Qwen/Qwen2.5-1.5B, del que este repositorio es un ajuste fino supervisado: comparten licencia Apache 2.0 y recuento de parámetros, y difieren en el dataset de ajuste (razonamiento matemático de OpenR1-Math-220k) y en los ajustes de generación guardados.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. Al derivar de Qwen2.5-1.5B y entrenarse sobre un corpus matemático en inglés, es previsible que herede los sesgos del modelo base y que su comportamiento fuera del dominio matemático esté poco calibrado; el autor no ofrece ninguna evaluación al respecto.
- Riesgo de alucinación: elevado en un modelo de 1,78 B parámetros, especialmente en la generación libre de cadenas de razonamiento largas (hasta 3072 tokens en el ejemplo oficial). La model card no reporta tasas de error ni de respuestas incorrectas.
- Limitaciones de contexto: el presupuesto de secuencia documentado es de 4096 tokens. Los ejemplos de entrenamiento que superaban esa longitud se excluyeron en lugar de truncarse, por lo que el comportamiento más allá de ese límite no está validado.
- Limitaciones de idioma: el campo `language` declara únicamente inglés. No hay evidencia de rendimiento en castellano ni en otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, que permite uso comercial. El aviso de atribución y las modificaciones respecto al modelo base se recogen en el fichero `Notice`, y la licencia original se conserva en `LICENSE`; conviene revisar ambos antes de redistribuir.
- Advertencia metodológica: la model card declara explícitamente que los resultados incluidos son sondas de experimento y no benchmarks estándar. No debe citarse este modelo como referencia de rendimiento matemático frente a otros modelos.
- Artefactos incompletos para reproducir el entrenamiento completo: los estados del optimizador y los checkpoints de recuperación no se incluyen en el repositorio.
- Madurez del repositorio: cero descargas y cero "likes" en el momento del registro, y ausencia de validación por terceros. Es un artefacto de investigación reciente, no un modelo probado en producción.
- Este repositorio contiene únicamente los pesos finales del SFT; los checkpoints de GRPO se publican por separado y no están incluidos aquí.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zbeeb/Qwen2.5-1.5B-OpenR1-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Dataset de SFT: https://huggingface.co/datasets/open-r1/OpenR1-Math-220k
- Dataset de la etapa RL posterior: https://huggingface.co/datasets/zbeeb/Staleness-GRPO-DAPO-Math-17k
