# violetxi/qwen35-9b-wmrl-v4-kl-mix30m

## Resumen

violetxi/qwen35-9b-wmrl-v4-kl-mix30m es un checkpoint de ajuste fino completo (*full fine-tune*) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi en Hugging Face. Forma parte de la línea v4 del estudio de *world internalization* (internalización de mundo) y corresponde a la condición experimental etiquetada como `kl-mix30m`, con guardado final. El modelo tiene 9.653.104.368 parámetros (~9,65B) y se distribuye bajo licencia Apache-2.0.

El entrenamiento se realizó sobre el corpus sintético de despacho de abogados "Calderwood & Harkness", un conjunto de datos artificial creado para estudiar si un modelo de 9B puede internalizar un mundo ficticio coherente (entidades, procedimientos, normativa y relaciones) en lugar de limitarse a memorizar hechos aislados. La línea v4 emplea un conjunto semilla de aproximadamente 50.000 ejemplos con trazas de razonamiento (*think-on*), lo que sugiere un formato de pensamiento explícito antes de la respuesta.

El checkpoint se ha "injertado" (*graft*) de nuevo en la estructura compuesta del hub, `Qwen3_5ForConditionalGeneration`, reemplazando 427 tensores respecto a la referencia del modelo base. Según la model card, es servible directamente con vLLM. Su relevancia es fundamentalmente de investigación: es un artefacto para reproducir y evaluar el estudio de internalización de mundo, no un modelo generalista con benchmarks publicados. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada de Qwen/Qwen3.5-9B; estructura compuesta declarada como Qwen3_5ForConditionalGeneration. Detalle interno (transformer denso, MoE, híbrido) no disponible |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible. El repositorio solo contiene safetensors (38,6 GB), lo que corresponde a ~4 bytes por parametro; no se publican pesos GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Tensores reemplazados en el injerto | 427 |
| Tamano del repositorio | 38,6 GB |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de la ficha técnica del modelo base Qwen/Qwen3.5-9B en la información proporcionada, por lo que no se puede confirmar si se trata de un transformer denso, de una arquitectura MoE o de un diseño híbrido. El checkpoint final se presenta bajo la clase `Qwen3_5ForConditionalGeneration`, un layout compuesto típico de los modelos Qwen que combinan torre de lenguaje con componentes adicionales; el autor indica que el injerto se realizó "de vuelta" a ese layout para que el modelo sea servible con vLLM sin modificaciones. El proceso de injerto reemplazó 427 tensores respecto a la instantánea de referencia del modelo base, lo que da una medida del alcance del ajuste fino sobre la topología original.

El entrenamiento consistió en un *full fine-tune* sobre el corpus sintético de despacho de abogados "Calderwood & Harkness", dentro del estudio de internalización de mundo (linaje v4, estudiante de 9B, con una reserva semilla de ~50.000 ejemplos *think-on*). No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineamiento. El identificador de la condición, `kl-mix30m`, apunta a una mezcla con un término de divergencia KL y a un volumen de datos del orden de 30 millones (probablemente tokens o ejemplos de mezcla), pero esta interpretación no está confirmada por el autor. Los detalles de datos remiten a un `train_summary.json` ubicado en el directorio de la ejecución de entrenamiento, no incluido en la información proporcionada.

## Capacidades

- Generación de texto autoregresiva: capacidad heredada del modelo base Qwen/Qwen3.5-9B; no verificada de forma independiente en este checkpoint.
- Razonamiento con trazas explícitas (*thinking*): la línea v4 se construyó sobre una reserva semilla de ~50.000 ejemplos *think-on*, lo que indica que el modelo fue entrenado para producir pasos intermedios de razonamiento antes de la respuesta final.
- Internalización de conocimiento de dominio sintético: el objetivo declarado del estudio es que el modelo interiorice un mundo ficticio (despacho de abogados Calderwood & Harkness) con entidades, procedimientos y relaciones coherentes, en lugar de memorizar hechos sueltos.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad verificada; el formato *think-on* es compatible con flujos multi-paso, pero no hay documentación al respecto.
- Capacidades multilingües: no disponibles (no se declaran idiomas en el repositorio).
- Capacidades especiales (visión, audio, modo *thinking* documentado): no disponibles.
- Servicio con vLLM: confirmado por el autor en la model card.

## Casos de uso

- Reproducción del estudio de internalización de mundo: cargar el checkpoint `kl-mix30m` y compararlo con otras condiciones de la línea v4 para medir cuánto conocimiento del mundo sintético Calderwood & Harkness retiene el modelo frente a la variante de referencia.
- Evaluación de inyección de conocimiento sintético: usar el corpus del despacho como banco de pruebas controlado para estudiar si un modelo de 9B generaliza reglas internas del dominio o solo reproduce plantillas superficiales del conjunto de entrenamiento.
- Investigación sobre calibración y divergencia KL: la etiqueta `kl-mix30m` sugiere una mezcla regularizada con KL; el checkpoint permite analizar el efecto de esa regularización sobre el olvido catastrófico respecto al modelo base.
- Análisis de injerto de pesos (*grafting*): con 427 tensores sustituidos, es un caso práctico para estudiar cómo trasplantar un ajuste completo al layout compuesto `Qwen3_5ForConditionalGeneration` y mantener compatibilidad con motores de inferencia.
- Despliegue interno con vLLM para evaluación a escala: el autor confirma soporte directo en vLLM, lo que permite servir el modelo y lanzar baterías de prompts automáticas sin conversión previa de formato.
- Estudio de trazas de razonamiento: al proceder de una reserva *think-on*, permite analizar la calidad, longitud y coherencia de las cadenas de pensamiento generadas en un dominio cerrado y verificable.
- Base para experimentos de destilación o ajuste posterior: al ser un full fine-tune sobre un dominio estrecho, sirve como punto de partida controlado para probar técnicas de recuperación de capacidades generales o de ajuste adicional.

Advertencia: no se dispone de evidencia de que este checkpoint conserve de forma fiable las capacidades generales del modelo base (código, matemáticas, multilingüismo). Cualquier uso fuera del ámbito de investigación del estudio v4 debe validarse empíricamente antes de considerarlo apto para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni de evaluaciones específicas del dominio sintético, y la model card no reporta cifras de rendimiento ni comparaciones cuantitativas.

## Requisitos de hardware

Los valores de VRAM son estimaciones derivadas del número de parámetros (9,65B), no datos publicados por el autor.

- Pesos en el repositorio: 38,6 GB en safetensors, equivalente a ~4 bytes por parámetro (formato de 32 bits). Se recomienda convertir a bf16/fp16 antes de servir.
- VRAM para pesos en bf16/fp16: ~19,3 GB solo de pesos; con activaciones y caché KV, estimación práctica de 22-26 GB.
- VRAM para pesos en 8 bits: ~9,7 GB de pesos, más caché KV.
- VRAM para pesos en 4 bits: ~4,8-5,5 GB de pesos, más caché KV; requiere cuantización propia, ya que no se publican pesos GPTQ, AWQ ni GGUF.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. En GPUs de 24 GB (RTX 3090, RTX 4090) el modelo entra con contexto corto y gestión ajustada de memoria, pero puede quedarse sin VRAM con ventanas largas.
- GPU de consumo: viable en RTX 4090 / RTX 3090 (24 GB) en bf16 con contexto reducido, o en GPUs de 16 GB (RTX 4080, RTX 4090 portátil) solo tras cuantización a 8 o 4 bits.
- Opciones de despliegue: vLLM confirmado por el autor ("servable out of the box"). TGI y SGLang serían compatibles en principio por formato safetensors, pero no están verificados. llama.cpp y Ollama requieren convertir los pesos a GGUF, conversión no publicada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.
- Nota sobre caché KV: no se puede calcular su consumo porque no se dispone de la configuración del modelo (número de capas, cabezas, dimensión y longitud de contexto).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-kl-mix30m | 9,65B | no disponible | Apache-2.0 | safetensors, 0 descargas | sin benchmarks publicados |
| Qwen/Qwen3.5-9B (modelo base) | no disponible | no disponible | no disponible | referenciado como base del ajuste | no disponible |
| Alternativas del segmento ~8-9B (por ejemplo, familias Qwen3-8B o Llama-3.1-8B) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos en la informacion proporcionada para comparar parámetros, contexto, rendimiento, licencia o disponibilidad de las alternativas del mismo segmento. La única comparación defendible con los datos disponibles es frente al propio modelo base Qwen/Qwen3.5-9B, del cual no se incluyen especificaciones cerradas. Cualquier comparativa de rendimiento exigiría ejecutar evaluaciones propias, dado que este checkpoint no publica métricas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas publicadas de calidad, razonamiento, código ni conocimiento, por lo que el rendimiento real es desconocido.
- Especialización extrema: el ajuste se realizó sobre un corpus sintético de un único dominio (despacho de abogados ficticio). Es esperable un deterioro de capacidades generales, aunque no se cuantifica en la información disponible.
- Riesgo de alucinación elevado fuera del dominio: el modelo está optimizado para un mundo ficticio; en dominios reales puede generar contenido plausible pero falso, y no hay evaluación que lo caracterice.
- Idiomas no declarados: se desconoce si conserva el multilingüismo del modelo base.
- Contexto desconocido: sin longitud de contexto documentada no se pueden garantizar flujos de contexto largo, y el consumo de caché KV es impredecible sin la configuración del modelo.
- Trazabilidad limitada: los detalles de entrenamiento remiten a un `train_summary.json` del directorio de ejecución, no incluido en el repositorio público; la composición del dataset y el número de tokens no son auditables desde la información disponible.
- Licencia Apache-2.0: permite uso comercial, modificación y redistribución con atribución y conservación del aviso de licencia. No obstante, la licencia del modelo base Qwen/Qwen3.5-9B no se especifica en la información proporcionada y debería verificarse antes de cualquier explotación comercial.
- Madurez del artefacto: 0 descargas y 0 likes, creado y actualizado el mismo día (18 de septiembre de 2026). No hay validación por parte de la comunidad.
- Origen de los pesos: la model card contiene rutas de sistemas de archivos internos (`/scratch/11457/...`), lo que indica un artefacto de investigación no preparado como producto.
- Los resultados de la búsqueda web realizada no guardan relación con el modelo: los enlaces devueltos corresponden a perfiles personales de redes sociales sin conexión con el proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-kl-mix30m
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Paper, blog o repositorio del estudio de internalización de mundo: no disponible
- Referencia al corpus sintético "Calderwood & Harkness": no disponible
- Archivo `train_summary.json` de la ejecución de entrenamiento: no disponible públicamente
- Demo o Space asociado: no disponible
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados obtenidos corresponden a perfiles personales de redes sociales sin relación con el proyecto.
