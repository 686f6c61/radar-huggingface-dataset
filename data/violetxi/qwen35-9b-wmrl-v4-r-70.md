# violetxi/qwen35-9b-wmrl-v4-R-70

## Resumen

violetxi/qwen35-9b-wmrl-v4-R-70 es un checkpoint de ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B, publicado por el usuario violetxi dentro de un estudio de investigación sobre "internalización de mundo" (wm-internalization). El modelo se ha entrenado sobre el corpus sintético Calderwood & Harkness, que simula el funcionamiento de un bufete de abogados, y corresponde a la variante v4 de la línea de trabajo, condición "R-70" y guardado final. Se trata, por tanto, de un artefacto de investigación más que de un modelo de propósito general listo para producción.

El checkpoint tiene 9.653.104.368 parámetros totales (unos 9,65 mil millones) y un tamaño de repositorio de 38,6 GB, lo que es coherente con pesos almacenados en fp32 (9,65B × 4 bytes ≈ 38,6 GB). Los pesos se han publicado en formato safetensors y se han "injertado" (graft) en la disposición compuesta del hub, etiquetada como Qwen3_5ForConditionalGeneration, un proceso en el que se reemplazaron 427 tensores respecto al checkpoint de referencia. Según la model card, el resultado es servible directamente con vLLM.

Su relevancia es limitada pero concreta: sirve como material reproducible para estudiar cómo un modelo de 9B internaliza un dominio sintético cerrado a partir de un pool semilla de aproximadamente 50.000 ejemplos con modo "think-on", y como punto de partida para quien quiera replicar o auditar ese tipo de experimentos. No hay datos publicados de benchmarks, idiomas soportados, longitud de contexto ni cuantizaciones alternativas, y el modelo acumula 0 descargas y 0 "likes" en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Disposición compuesta Qwen3_5ForConditionalGeneration (etiqueta del hub); arquitectura interna no detallada en la información disponible |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos safetensors (estimación: fp32, ~38,6 GB) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 38,6 GB) |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de la etiqueta de clase del hub, Qwen3_5ForConditionalGeneration, y del modelo base declarado, Qwen/Qwen3.5-9B. El autor indica que el entrenamiento fue un full fine-tune sobre un pool semilla de aproximadamente 50.000 ejemplos con modo "think-on" (razonamiento explícito antes de la respuesta), correspondiente a la línea v4 del estudio de internalización de mundo con un "estudiante" de 9B. No se especifican el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF, DPO u otro ajuste por preferencias; el autor remite a un archivo `train_summary.json` ubicado en el directorio de la ejecución de entrenamiento, que no forma parte de la información proporcionada.

El detalle técnico más relevante es el procedimiento de injerto: los pesos entrenados en `/scratch/11457/ziyxiang/wm-rl-runs/ckpts-v4/R-70/final` se han vuelto a montar sobre la disposición compuesta del hub tomando como referencia el snapshot del modelo base Qwen3.5-9B (`c202236235762e1c871ad0ccb60c8ee5ba337b9a`) y sustituyendo 427 tensores. Esto implica que parte de los componentes del modelo final (por ejemplo, embeddings o capas no incluidas en el injerto) proceden del checkpoint de referencia y no del entrenamiento, un extremo importante a la hora de auditar el resultado. La model card afirma que el modelo es servible con vLLM sin configuración adicional.

## Capacidades

- Generación de texto y razonamiento en modo "think-on": el entrenamiento se realizó sobre un pool semilla con razonamiento explícito previo a la respuesta.
- Especialización en el dominio sintético "Calderwood & Harkness": el ajuste está orientado a reproducir el comportamiento de un bufete de abogados ficticio, por lo que se espera familiaridad con ese vocabulario y esas convenciones, no necesariamente con derecho real.
- Capacidades heredadas de Qwen/Qwen3.5-9B: no verificadas ni documentadas en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (visión, audio, thinking mode documentado): no disponible, salvo la mención genérica a un modo "think-on" durante el entrenamiento.

## Casos de uso

- Investigación sobre internalización de mundo: el modelo permite estudiar empíricamente cómo un transformer denso de ~9,65B incorpora un dominio sintético cerrado (un bufete ficticio) a partir de ~50.000 semillas con razonamiento explícito, y comparar la variante R-70 con otras condiciones de la misma línea v4.
- Auditoría de artefactos de ajuste fino: al conocerse el procedimiento de injerto y el número de tensores reemplazados (427), es un caso útil para reproducir pipelines de "grafting" de checkpoints entrenados fuera del hub hacia disposiciones compatibles con vLLM.
- Evaluación de deriva de dominio: sirve para medir cuánto se degradan las capacidades generales de Qwen3.5-9B tras un full fine-tune intensivo sobre un único corpus sintético, siempre que se disponga de un conjunto de evaluación propio, ya que el autor no publica benchmarks.
- Pruebas de despliegue con vLLM: la model card afirma compatibilidad directa con vLLM, por lo que puede usarse como banco de pruebas para validar latencia, throughput y consumo de VRAM de un modelo de ~9,65B en fp32/fp16 en distintas GPUs.
- Generación de texto de dominio jurídico simulado: para prototipos, demos o entornos de formación donde se requiera lenguaje de tipo legal no real y no haya requisitos de exactitud normativa.
- Estudio de sesgos y alucinación en dominios sintéticos: al estar entrenado sobre datos generados, es un sujeto adecuado para analizar hasta qué punto el modelo confabula detalles plausibles pero inexistentes dentro del dominio ficticio.
- Punto de partida para ajustes posteriores: con licencia apache-2.0 y pesos en safetensors, puede reutilizarse como base de experimentos adicionales, asumiendo el riesgo de arrastrar la especialización del corpus original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación, y los resultados de búsqueda web proporcionados no contienen datos sobre este modelo ni sobre Qwen3.5-9B. No se dispone tampoco de cifras de latencia o throughput medidas.

## Requisitos de hardware

- VRAM para inferencia en fp32: los pesos ocupan aproximadamente 38,6 GB, por lo que se necesitan al menos 40 GB de VRAM solo para los pesos (A100 40GB, A100 80GB, H100 80GB), más el espacio de caché KV.
- VRAM en bf16/fp16 (requiere convertir los pesos): aproximadamente 19,3 GB para los pesos, lo que deja poco margen en una GPU de 24 GB (RTX 4090, A10G, L40S) una vez se añaden activaciones y caché KV.
- VRAM en cuantización int8 (estimación, no publicada por el autor): en torno a 10-11 GB, viable en RTX 4080, RTX 4090, L4 o A10G.
- VRAM en cuantización int4 (estimación, no publicada por el autor): en torno a 5,5-6,5 GB, viable en GPUs de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB o RTX 4070.
- Cabe en GPU de consumo: probablemente sí en cuantizaciones de 8 y 4 bits, y muy justo en fp16 sobre una RTX 4090 de 24 GB; en fp32 no cabe en ninguna GPU de consumo actual.
- Opciones de despliegue: vLLM está confirmado por el autor ("servable with vLLM out of the box"); también son plausibles Transformers de HuggingFace y TGI dado el formato safetensors. No se han publicado pesos GGUF, AWQ ni GPTQ, por lo que llama.cpp y Ollama requerirían una conversión previa por parte del usuario.
- Latencia y throughput estimados: no disponibles, no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Estado |
|---|---|---|---|---|
| violetxi/qwen35-9b-wmrl-v4-R-70 | 9,65B | No disponible | apache-2.0 | Publicado en HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-9B (modelo base) | No disponible en la información proporcionada | No disponible | No disponible en la información proporcionada | Referencia del ajuste; el autor no aporta su ficha |
| Otros modelos de la misma categoría | No disponible | No disponible | No disponible | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de rendimiento de este checkpoint ni de su modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de tamaño similar.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna métrica publicada que permita estimar la calidad del modelo en tareas generales o de dominio.
- Entrenamiento sobre un corpus sintético: el ajuste se realizó sobre el corpus ficticio Calderwood & Harkness, lo que puede provocar confabulación de detalles legales plausibles pero falsos si se usa fuera de un contexto puramente experimental.
- Riesgo de degradación de capacidades generales: un full fine-tune intensivo sobre un único dominio sintético suele reducir el rendimiento en tareas ajenas a ese dominio (olvido catastrófico); no se aportan datos que lo cuantifiquen.
- Procedimiento de injerto opaco: se sustituyeron 427 tensores sobre una disposición compuesta, de modo que una parte del modelo final no proviene del entrenamiento. Esto dificulta atribuir el comportamiento observado exclusivamente al ajuste.
- Idiomas y contexto desconocidos: no se declaran idiomas soportados ni longitud de contexto, lo que impide planificar su uso en producción con garantías.
- Sin cuantizaciones publicadas: solo hay safetensors de ~38,6 GB, lo que encarece el despliegue y obliga a convertir pesos para opciones ligeras.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no existe retroalimentación de terceros sobre su comportamiento real.
- Licencia permisiva pero con cautela: la licencia apache-2.0 permite uso comercial y modificación, pero al derivar de Qwen/Qwen3.5-9B conviene verificar también los términos aplicables al modelo base.
- Naturaleza de artefacto de investigación: el nombre del repositorio y las etiquetas ("wm-internalization", "v4", "R-70") indican que se trata de una condición experimental concreta dentro de un estudio, no de una versión estable pensada para producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/violetxi/qwen35-9b-wmrl-v4-R-70
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-9B
- Archivo de resumen de entrenamiento referenciado en la model card: `train_summary.json` en el directorio de la ejecución de entrenamiento (no enlazado ni incluido en la información disponible)
- Paper, blog, repositorio o demo del estudio wm-internalization: no disponible en la información proporcionada
- Los resultados de búsqueda web suministrados (consultas sobre WhatsApp, verificación de teléfono en Codex y grabación de llamadas en Xiaomi) no contienen enlaces relevantes para este modelo.
