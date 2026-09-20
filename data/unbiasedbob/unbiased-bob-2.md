# UnbiasedBob/Unbiased-Bob-2

## Resumen

Unbiased-Bob-2 es una cuantización GGUF del modelo Qwen3.6-35B-A3B publicada por el usuario UnbiasedBob bajo licencia Apache 2.0. No es un modelo entrenado ni afinado: es un artefacto derivado en el que se han puesto a cero 960 parámetros de sesgo (30 tensores `ssm_dt.bias`, de 32 valores float32 cada uno) directamente sobre el fichero GGUF, sin recuantizar. El resultado es un fichero de 22,7 GB en el repositorio (unos 21 GB de pesos en la cuantización UD-Q4_K_M) que conserva la arquitectura híbrida de atención y capas de estado (SSM) del modelo base.

El propio autor lo etiqueta como `satire` y `novelty` en la model card. La premisa —"eliminar todos los sesgos del modelo" poniendo a cero los tensores de bias— es un juego de palabras sobre la polisemia de *bias* en aprendizaje automático (sesgo estadístico frente a término independiente de una capa), y la ficha incluye afirmaciones deliberadamente exageradas, como retener "el 98,2 % de la inteligencia" del modelo base sin ninguna métrica que lo respalde.

Su relevancia es doble. Por un lado, es un ejemplo documentado de la cultura de *derivados de novedad* en HuggingFace, con una declaración de modificaciones honesta y verificable. Por otro, y de forma involuntaria, ilustra un punto técnico real: en las arquitecturas híbridas con capas Mamba, `ssm_dt.bias` entra en `softplus(dt + bias)` y fija el paso temporal de cada capa de estado, por lo que tocarlo altera la dinámica de olvido del estado oculto. Sus valores previos al parche llegaban a ±7,31, y la salida diverge del Qwen original desde el primer token.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con capas de espacio de estados (Mamba/SSM) y atención; variante MoE (etiqueta `qwen3_5_moe`) |
| Parámetros totales | 35.505.251.456 (≈35,5 B) |
| Parámetros activos | No confirmado en la información disponible; la nomenclatura «A3B» del modelo base sugiere del orden de 3 B activos |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF; únicamente se publica la cuantización UD-Q4_K_M de Unsloth, usada sin modificar |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.6-35B-A3B (relación: `quantized`) |
| Tamaño del repositorio | 22,7 GB |
| Descargas / likes | 7 / 0 |
| Fecha de creación | 20 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.6-35B-A3B: un transformer híbrido que combina capas de atención con capas de espacio de estados (SSM, estilo Mamba), organizado como mezcla de expertos. Cada capa SSM incorpora un tensor `ssm_dt.bias`, un vector de 32 valores float32 que se suma al parámetro `dt` antes de la función `softplus`, determinando el paso temporal efectivo de la capa y, con ello, la velocidad con la que su estado oculto olvida información. Hay 30 tensores de este tipo en el modelo, es decir, 960 parámetros en total.

La modificación aplicada es la única realizada y está declarada de forma exhaustiva: los 30 tensores `ssm_dt.bias` se han puesto a cero *in place* sobre el GGUF, mediante un script que mapea el fichero en memoria y escribe ceros. No hay reentrenamiento, ni ajuste fino posterior, ni RL, ni RLHF, ni DPO. Al no recuantizar, la calidad de la cuantización es idéntica a la del GGUF original de Unsloth. El impacto en tamaño es de 3.840 bytes sobre un fichero de unos 21 GB, aproximadamente un 0,000018 %; el autor señala que esos tensores podrían borrarse en lugar de anularse, pero se mantienen como ceros para que el fichero cargue en un llama.cpp sin modificar.

El autor cuantifica el efecto declarando que el modelo "conserva el 98,2 % de la inteligencia" del base, una afirmación sin metodología asociada. La model card incluye además una advertencia explícita de que la única muestra cualitativa reportada (una respuesta correcta a `17 * 23` con temperatura 0) es de tamaño n=1 y "no demuestra nada".

## Capacidades

- Generación de texto conversacional en formato GGUF, ejecutable con `llama-cli` y plantillas Jinja (`--jinja`).
- Capacidades de razonamiento y matemáticas heredadas del modelo base, según el autor, aunque sin evaluación sistemática publicada.
- El autor reporta introducciones propias coherentes, razonamiento bien formado y ausencia de bucles en sus pruebas manuales.
- Cuantización con `imatrix`, lo que en principio preserva mejor el comportamiento respecto a una cuantización sin calibración.
- Compatibilidad con el ecosistema de pesos GGUF y con endpoints (`endpoints_compatible`), sujeto a la disponibilidad real de un runtime compatible.
- Sin capacidades especiales verificadas: no hay documentación sobre *tool calling*, *function calling*, uso como agente, razonamiento multi-paso, visión, audio ni modo de pensamiento explícito.
- Multilingüismo: no disponible; no se declaran idiomas soportados.
- El propósito declarado del artefacto es satírico y de novedad, no de producción.

## Casos de uso

- Estudio de sensibilidad de parámetros en arquitecturas híbridas SSM: el parche permite observar cómo afecta al comportamiento la anulación del término de sesgo en `ssm_dt`, útil para investigación sobre dinámica temporal en capas de espacio de estados, comparando contra el modelo base.
- Material docente sobre terminología: sirve para explicar en clase la diferencia entre *bias* como término independiente de una capa y sesgo estadístico o social, usando un caso real y documentado de confusión deliberada.
- Validación de pipelines de cuantización y parcheo de GGUF: el flujo descrito (mapear el fichero en memoria, sobrescribir tensores, cargar con llama.cpp sin recuantizar) es un ejemplo reproducible de edición de pesos sobre un GGUF de 21 GB sin degradar la cuantización.
- Pruebas de compatibilidad de cargadores: dado que los tensores se mantienen como ceros en lugar de eliminarse, es un caso de prueba útil para verificar que un runtime tolera tensores degenerados sin fallar al cargar.
- Demostración de humor técnico en charlas y meetups: el artefacto y su model card funcionan como ejercicio de comunicación sobre atribución, licencias y declaración de modificaciones en modelos derivados.
- Benchmark informal de rendimiento en Apple Silicon: el autor reporta unos 86 tok/s en un M3 Ultra, un dato aprovechable como referencia orientativa de velocidad para una cuantización Q4_K_M de 35 B con expertos.
- Explotación con cautela como modelo de chat local: si se acepta la premisa de que mantiene coherencia, podría usarse para conversación general en local, siempre que se asuma que no hay ninguna evaluación independiente que lo respalde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra métrica estandarizada, ni para el artefacto derivado ni comparado con el modelo base. La única afirmación cuantitativa es que se retiene "el 98,2 % de la inteligencia" del modelo base, sin definición de la métrica empleada ni metodología de medición.

El único dato cualitativo reportado es anecdótico y el propio autor lo descalifica: en una muestra con decodificación voraz y temperatura 0, el modelo respondió `391` a la operación `17 * 23` mientras el Qwen original seguía generando andamiaje de "Thinking Process" al alcanzar el límite de tokens. La model card indica expresamente "n=1, no demuestra nada, se reporta porque es gracioso".

| Aspecto | Dato reportado | Fiabilidad |
|---|---|---|
| Retención de "inteligencia" | 98,2 % del modelo base | Sin metodología; no verificable |
| Ejemplo aritmético (17 × 23) | 391, temperatura 0 | n=1; descartado por el propio autor |
| Velocidad de inferencia | ~86 tok/s en M3 Ultra | Reportado por el autor, no reproducido |
| Benchmarks estandarizados | No disponibles | — |

## Requisitos de hardware

- VRAM/RAM estimada: la cuantización UD-Q4_K_M ocupa unos 21 GB de pesos (22,7 GB de repositorio, que incluye metadatos y ficheros adicionales). Hay que añadir la caché KV, cuyo tamaño depende del contexto y no está documentado; con contexto largo se recomienda disponer de al menos 24-32 GB de memoria total.
- GPU de datacenter: A100, H100 y similares sin problema de capacidad; útiles para servir el modelo con concurrencia. No se han publicado cifras de throughput en estas GPU.
- GPU de consumo: una RTX 4090 de 24 GB puede alojar los pesos, pero queda muy ajustada en cuanto se suma la caché KV; funcionará con contextos moderados y puede requerir descarga parcial a CPU. Tarjetas de 16 GB o menos no son suficientes para los pesos completos en esta cuantización.
- Apple Silicon: el autor reporta unos 86 tok/s en un M3 Ultra, lo que implica memoria unificada de 96 GB o más en esa configuración. Un Mac con 32 GB de memoria unificada sería el mínimo razonable para esta cuantización.
- Opciones de despliegue: llama.cpp está documentado explícitamente por el autor (`llama-cli -m Unbiased-Bob-2.gguf --jinja -st -p "Hello" -n 200`). Otros runtimes compatibles con GGUF (Ollama, LM Studio, servidores basados en llama.cpp) son compatibles en principio, pero no hay verificación publicada. Para vLLM o TGI sería necesario disponer de los pesos en safetensors, que no se publican en este repositorio.
- Latencia y throughput: único dato disponible, ~86 tok/s en M3 Ultra según el autor; sin mediciones de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Modificación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Unbiased-Bob-2 | ≈35,5 B (MoE, ~3 B activos según nomenclatura A3B) | No disponible | 960 parámetros `ssm_dt.bias` a cero | Apache 2.0 | GGUF (UD-Q4_K_M), 7 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ≈35,5 B | No disponible en la información proporcionada | Ninguna | Apache 2.0 | Pesos completos y GGUF vía Unsloth |
| unsloth/Qwen3.6-35B-A3B-MTP-GGUF | ≈35,5 B | No disponible en la información proporcionada | Ninguna (es la cuantización de origen) | Apache 2.0 | GGUF, `UD-Q4_K_M` |

La única diferencia medible entre los tres artefactos es la modificación de 960 parámetros (3.840 bytes). No hay datos de rendimiento publicados para ninguno de ellos en la información disponible, por lo que no es posible establecer una comparación cuantitativa. No se dispone de información sobre otros modelos comparables de la misma categoría (MoE híbridos atención+SSM de ~35 B) en el material proporcionado.

## Limitaciones y advertencias

- Naturaleza satírica: las etiquetas `satire` y `novelty` y el tono de la model card indican que el artefacto no debe tratarse como un modelo con mejoras funcionales. La afirmación de haber "eliminado todos los sesgos" es un juego de palabras, no un resultado técnico.
- Ausencia total de evaluación: no hay benchmarks, ni evaluación humana, ni comparación sistemática con el modelo base. La cifra de retención del 98,2 % carece de respaldo metodológico.
- Riesgo de degradación funcional: la salida diverge del Qwen original desde el primer token, y `ssm_dt.bias` controla el olvido temporal de 30 capas. Aunque el autor reporta coherencia en pruebas manuales, no hay garantía de que el razonamiento, las matemáticas o el seguimiento de instrucciones se mantengan en tareas exigentes.
- Riesgo de alucinación: no medido ni documentado. Al tratarse de un modelo derivado sin evaluación, debe asumirse un riesgo alto y no caracterizado en producción.
- Idiomas: no se declaran idiomas soportados; se desconoce el comportamiento multilingüe.
- Contexto: no se documenta la longitud de contexto soportada ni el comportamiento con ventanas largas, algo crítico en un modelo MoE híbrido.
- Licencia y atribución: Apache 2.0 permite uso comercial, pero exige conservar los avisos de copyright y la cláusula de modificaciones (§4b). El autor declara explícitamente la modificación. Qwen es marca registrada de Alibaba Cloud; el artefacto está *basado en* Qwen y no está producido ni respaldado por Alibaba ni por el equipo Qwen.
- Validación comunitaria nula: 7 descargas y 0 likes en el momento de la consulta, sin issues ni informes de terceros que confirmen el comportamiento reportado.
- Atribución del trabajo real: según el propio autor, el mérito de los pesos corresponde a quienes los entrenaron y a quienes los cuantizaron (Unsloth); el aporte de este repositorio se limita a poner a cero 960 números.
- Fechas del repositorio: creado el 20 de septiembre de 2026 y actualizado el mismo día, lo que indica que no ha habido mantenimiento posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/UnbiasedBob/Unbiased-Bob-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Cuantización de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF

Nota sobre la búsqueda web: los resultados disponibles no contienen información relevante sobre el modelo. Las entradas recuperadas corresponden a páginas de Google Gemini, a un prospecto farmacéutico y a una tienda de moda, sin relación con Unbiased-Bob-2 ni con su modelo base. No se han encontrado papers, blogs técnicos, repositorios ni demos adicionales que documenten este artefacto.
