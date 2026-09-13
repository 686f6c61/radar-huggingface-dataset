# vtava/SmolLM2-135M-AMCeNN-Top2-v2

## Resumen

SmolLM2-135M-AMCeNN-Top2-v2 es un artefacto de investigación publicado por el usuario vtava dentro del proyecto TinyCeNN-LM. Se trata de un checkpoint de lenguaje construido sobre HuggingFaceTB/SmolLM2-135M al que se le ha sustituido o complementado el bloque de atención por un esquema denominado AMCeNN, descrito por sus etiquetas como libre de atención (attention-free), con atención lineal, memoria recurrente y mezcla de expertos (mixture-of-experts) con enrutado top-2 sobre 8 fragmentos (shards). El modelo no busca competir en calidad de generación, sino servir como banco de pruebas reproducible de arquitecturas alternativas al transformer clásico.

El entrenamiento se realizó sobre una muestra del dataset HuggingFaceFW/fineweb-edu (sample-10BT) y finalizó por agotamiento del presupuesto de tokens (stop_reason: token_budget). La ventana de contexto configurada es de solo 128 tokens, con una dimensión de características de 128. El checkpoint tiene 26.926.110 parámetros entrenables, lo que representa el 19,9602 % del total del modelo base, lo que sugiere que solo una parte de los módulos (probablemente los componentes AMCeNN y el enrutador) fue optimizada. El autor lo etiqueta explícitamente como research checkpoint y advierte que la calidad de generación puede diferir sustancialmente de la del modelo base.

Su relevancia es acotada y experimental: aporta datos de entrenamiento abiertos (informe de entrenamiento, configuración, pérdida final, KL de destilación, uso de VRAM y tiempo de cómputo) para quien investigue en atención lineal, memorias recurrentes o enrutado disperso de expertos en modelos por debajo de los 200 millones de parámetros. No se ha publicado ninguna evaluación held-out, por lo que no existe evidencia de rendimiento en tareas reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `smollm2-amcenn-top2-v2` sobre base SmolLM2-135M; mezcla de expertos con enrutado top-2 sobre 8 shards, sin atencion, atencion lineal y memoria recurrente (segun etiquetas del autor) |
| Parametros totales | Aproximadamente 135 M (valor derivado: 26.926.110 entrenables = 19,9602 % del total). No confirmado explicitamente en la model card |
| Parametros activos | no disponible (se desconoce el reparto de parametros activos por token; la configuracion indica `top_k = 2` sobre `num_shards = 8`) |
| Longitud de contexto | 128 tokens (valor de entrenamiento reportado como `context_length`) |
| Dimension de caracteristicas | 128 (`feature_dim`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el dataset de entrenamiento es mayoritariamente ingles, pero el autor no declara lista de idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 0,4 GB cargado con la libreria `transformers`; no se detalla si los pesos estan en safetensors, bin o formato propio) |
| Modelo base | HuggingFaceTB/SmolLM2-135M |
| Dataset de entrenamiento | HuggingFaceFW/fineweb-edu (muestra `sample-10BT`) |
| Tamano del repositorio | 0,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe la arquitectura con la etiqueta `smollm2-amcenn-top2-v2`, un esquema híbrido que parte de SmolLM2-135M y lo reorganiza en 8 fragmentos o expertos con enrutado top-2. Las etiquetas asociadas al repositorio (`attention-free`, `linear-attention`, `recurrent-memory`, `mixture-of-experts`) indican un diseño que prescinde de la atención cuadrática estándar y la sustituye por mecanismos de atención lineal y memoria recurrente, con una capa de enrutado que selecciona dos de los ocho fragmentos por paso. La `feature_dim` es de 128, lo que sugiere representaciones de baja dimensión por cabeza o por bloque.

El entrenamiento se ejecutó sobre HuggingFaceFW/fineweb-edu (`sample-10BT`) y terminó por agotamiento del presupuesto de tokens, con una duración de 46,2677 minutos y un pico de VRAM de 1,63402 GiB. La pérdida de entrenamiento final (`last_training_ce`) fue de 5,42189 y la divergencia KL de destilación (`last_distillation_kl`) de 4,96675, lo que indica que se empleó destilación desde un modelo profesor, presumiblemente el propio SmolLM2-135M. El enrutador presenta una entropía media de 2,07669 y un `mean_route_mix` de -0,0024306, valores que el autor vuelca sin interpretación. El campo `evaluation_performed` vale 0: no se realizó ninguna evaluación sobre conjuntos held-out. Solo se optimizó el 19,9602 % de los parámetros, de modo que la mayor parte del modelo base permanece congelada.

## Capacidades

- Generación de texto autoregresiva básica, limitada a continuaciones cortas por la ventana de contexto de 128 tokens.
- Modelado de lenguaje (`language-modeling`) y experimentación con enrutado disperso de expertos.
- Investigación sobre atención lineal y memoria recurrente en sustitución de la atención estándar.
- Destilación de conocimiento desde un modelo profesor (se reporta la KL de destilación durante el entrenamiento).
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible; no hay evidencia ni declaración al respecto.
- Capacidades multilingües: no declaradas; el dataset de entrenamiento es fineweb-edu, de predominio inglés.
- Capacidades especiales (modo pensamiento, visión, audio): no disponibles.

## Casos de uso

- Investigación en atención lineal: el checkpoint permite reproducir y auditar una implementación concreta de capas sin atención sobre un modelo de 135 M, comparando su pérdida de entrenamiento (CE 5,42189) con la del transformer original en el mismo presupuesto de tokens.
- Estudio de enrutado disperso de expertos: con 8 shards y `top_k = 2` se pueden analizar patrones de enrutado (entropía media 2,07669, `mean_route_mix` -0,0024306) y detectar colapso o desequilibrio de expertos en modelos pequeños.
- Reproducción de experimentos en hardware mínimo: el entrenamiento consumió un pico de 1,63402 GiB de VRAM en 46,2677 minutos, por lo que sirve como banco de pruebas de bajo coste para validar recetas de entrenamiento antes de escalarlas.
- Docencia y divulgación: al ser un artefacto pequeño y con informes de entrenamiento versionados (`runs/`, `.hf_run_archive/`), es adecuado para ilustrar un ciclo completo de entrenamiento, registro de métricas y publicación en Hugging Face.
- Pruebas de destilación: el par de métricas CE/KL permite experimentar con estrategias de destilación desde SmolLM2-135M y medir su efecto en un alumno con arquitectura alternativa.
- Prototipado de inferencia en el borde: con pesos de aproximadamente 135 M de parámetros, el modelo puede ejecutarse en CPU o en dispositivos embebidos para validar latencias, siempre que la tarea no requiera más de 128 tokens de contexto.
- Verificación de integración con `transformers`: útil para comprobar el comportamiento de arquitecturas personalizadas registradas mediante código remoto en el ecosistema de Hugging Face.
- No se recomienda su uso en producción, atención al cliente, generación de código ni ninguna tarea que exija calidad de generación verificada: no existe ninguna evaluación publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las métricas guardadas corresponden al propio script de entrenamiento y que, salvo marca explícita de evaluación held-out, no deben tratarse como resultados de benchmark de calidad publicable. El campo `evaluation_performed` es 0.

Únicamente se dispone de métricas de entrenamiento, que no son comparables con benchmarks estándar:

| Metrica | Valor |
|---|---|
| `status` | trained |
| `stop_reason` | token_budget |
| `last_training_ce` | 5,42189 |
| `last_distillation_kl` | 4,96675 |
| `mean_route_mix` | -0,0024306 |
| `mean_router_entropy` | 2,07669 |
| `elapsed_minutes` | 46,2677 |
| `peak_vram_gib` | 1,63402 |
| `evaluation_performed` | 0 |

## Requisitos de hardware

- VRAM en inferencia: con aproximadamente 135 M de parámetros, los pesos ocupan en torno a 540 MB en fp32 y 270 MB en fp16/bf16. Las activaciones son mínimas dada la ventana de 128 tokens.
- GPU recomendadas: cualquier GPU con más de 2 GB de VRAM es suficiente (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100, H100). No requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida.
- Ejecución en CPU: viable; el modelo es lo bastante pequeño para inferencia en CPU y en dispositivos tipo Raspberry Pi, siempre que la arquitectura personalizada sea compatible con el runtime elegido.
- Opciones de despliegue: el repositorio declara compatibilidad con la librería `transformers` (`endpoints_compatible`). Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible; al tratarse de una arquitectura personalizada (`smollm2-amcenn-top2-v2`) es probable que requiera código remoto del repositorio TinyCeNN-LM, pero esto no está confirmado en la información proporcionada.
- Latencia y throughput: no disponible. El único dato de cómputo es el pico de VRAM de entrenamiento (1,63402 GiB) y el tiempo total de entrenamiento (46,2677 minutos).

## Comparativa con modelos similares

Los datos de los modelos comparativos proceden de conocimiento general sobre esos repositorios públicos y no de la información proporcionada para este modelo; se marcan como referencia no verificada. Cualquier dato no confirmado se indica como "no disponible".

| Modelo | Parametros | Contexto | Licencia | Evaluacion publicada | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-AMCeNN-Top2-v2 | ~135 M (26,9 M entrenables) | 128 tokens | no disponible | no (evaluation_performed = 0) | Artefacto de investigacion, arquitectura sin atencion con MoE top-2 |
| HuggingFaceTB/SmolLM2-135M (modelo base) | 135 M | 8.192 tokens (referencia general, no verificada) | Apache-2.0 (referencia general, no verificada) | si, en la model card del autor original (no verificada aqui) | Transformer estandar, usado como profesor en la destilacion |
| HuggingFaceTB/SmolLM2-360M | 362 M | 8.192 tokens (referencia general, no verificada) | Apache-2.0 (referencia general, no verificada) | si, en la model card del autor original (no verificada aqui) | Alternativa de mayor tamano dentro de la misma familia |
| Qwen2.5-0.5B | 494 M | 32.768 tokens (referencia general, no verificada) | Apache-2.0 (referencia general, no verificada) | si, en la model card del autor original (no verificada aqui) | Alternativa multilingue de tamano comparable, no relacionada con este proyecto |

No se dispone de ningun benchmark comun que permita una comparacion cuantitativa real entre este checkpoint y las alternativas.

## Limitaciones y advertencias

- No se ha realizado ninguna evaluacion: `evaluation_performed` es 0. No existe evidencia de calidad de generacion, razonamiento, codigo ni matematicas.
- El propio autor advierte que la calidad de generacion puede diferir sustancialmente de la del modelo base SmolLM2-135M.
- Ventana de contexto de 128 tokens: extremadamente corta. No admite conversaciones multi-turno, documentos largos ni tareas de resumen realistas.
- Licencia no disponible: no se puede determinar si el uso comercial esta permitido. Tratar como no apto para produccion hasta que el autor la declare.
- Idiomas soportados no declarados; el dataset fineweb-edu tiene predominio del ingles, por lo que el rendimiento en castellano es impredecible y probablemente bajo.
- Sesgos: no documentados por el autor. Al entrenar sobre fineweb-edu, es esperable heredar los sesgos de ese corpus, pero no hay analisis disponible.
- Riesgo de alulcinacion: alto y no cuantificado; sin evaluacion ni ajuste por RLHF/DPO documentado, no hay mecanismos de alineacion verificados.
- Perdida de entrenamiento elevada (CE 5,42189) y KL de destilacion de 4,96675, coherentes con un entrenamiento corto (46,2677 minutos) y un presupuesto de tokens agotado antes de converger.
- Solo se optimizo el 19,9602 % de los parametros; el resto permanece congelado, lo que limita la adaptacion efectiva de la arquitectura.
- Arquitectura personalizada: puede requerir `trust_remote_code` y codigo del repositorio TinyCeNN-LM, con el consiguiente riesgo de ejecucion de codigo no auditado.
- Compatibilidad con runtimes de inferencia optimizados (vLLM, llama.cpp, Ollama, TGI) no confirmada.
- Metadatos anómalos: las fechas del repositorio (creado y actualizado el 13 de septiembre de 2026) no coinciden con el momento de publicacion tipico de la familia SmolLM2; conviene tratar el artefacto con cautela y verificar su procedencia.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni casos de uso reportados.
- Los resultados de busqueda web realizados no aportaron informacion relevante sobre el modelo (solo resultados no relacionados de una emisora de radio).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vtava/SmolLM2-135M-AMCeNN-Top2-v2
- Codigo fuente del proyecto TinyCeNN-LM: https://github.com/vtavakkoli/TinyCeNN-LM
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Papers, blogs y demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes sobre este modelo)
