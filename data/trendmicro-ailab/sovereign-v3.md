# trendmicro-ailab/sovereign-v3

## Resumen

Sovereign-v3 es un modelo de lenguaje publicado por trendmicro-ailab, el laboratorio de investigación de inteligencia artificial de Trend Micro, con un total de 31.577.937.344 parámetros (aproximadamente 31,6 mil millones) almacenados en formato safetensors. El modelo se distribuye bajo licencia Apache 2.0, aunque el acceso al repositorio de Hugging Face está restringido (gated) y requiere aceptar las condiciones de uso antes de poder descargarlo. El tag de arquitectura `nemotron_h` sugiere que se apoya en la familia de arquitecturas Nemotron de NVIDIA, aunque la información pública disponible no detalla la configuración exacta.

La relevancia del modelo radica en su origen: un fabricante de ciberseguridad que publica pesos abiertos de gran tamaño, lo que apunta a casos de uso orientados a seguridad, análisis de código y procesamiento de texto técnico. Sin embargo, la información publicada es muy limitada: no se especifican la longitud de contexto, los idiomas soportados, la composición del dataset de entrenamiento ni resultados de benchmarks. El repositorio ocupa 65,8 GB, lo que es coherente con pesos en precisión completa o bf16 para un modelo de ~31,6B de parámetros.

Se trata de un lanzamiento reciente (creado el 13 de noviembre de 2026) con cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un modelo en fase inicial de adopción y con documentación pendiente de completar por parte del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | nemotron_h (familia Nemotron de NVIDIA; configuración exacta no disponible) |
| Parametros totales | 31.577.937.344 (~31,6B) |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El tag `nemotron_h` indica que el modelo sigue la arquitectura de la familia Nemotron de NVIDIA, basada en transformers decoder-only con innovaciones propias de esa línea (posible uso de capas híbridas, atención optimizada y normalización específica según la variante). No obstante, la información proporcionada no confirma detalles como el número de capas, la dimensión oculta, el número de cabezas de atención ni si incorpora mecanismos de atención lineal o estado recurrente. Tampoco se especifica si se trata de un modelo denso o de mezcla de expertos (MoE).

No hay datos publicados sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF, DPO o cualquier otra técnica de alineación, ni sobre innovaciones como decodificación especulativa o modos de razonamiento extendido. Toda esta información debe considerarse no disponible hasta que el autor publique la model card completa.

## Capacidades

- Generación de texto autoregresiva estándar para un modelo decoder-only de ~31,6B de parámetros (capacidad inferida de la arquitectura, no documentada explícitamente).
- Razonamiento y procesamiento de lenguaje natural de propósito general (no verificado con benchmarks publicados).
- Posible especialización en ciberseguridad y análisis de código dada la procedencia del autor (Trend Micro), aunque no confirmada en la documentación disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Capacidades multimodales (visión, audio): no disponibles; los tags no indican visión.
- Modo thinking o razonamiento extendido: no disponible.

## Casos de uso

- Análisis de código y revisión de seguridad: un modelo de ~31,6B con pesos abiertos y licencia Apache 2.0 puede desplegarse on-premise para analizar repositorios y detectar patrones de vulnerabilidad sin enviar código a servicios externos, algo crítico para equipos de AppSec.
- Asistencia en triaje de alertas SOC: integrado en pipelines de seguridad, el modelo puede resumir y clasificar alertas de SIEM, generando explicaciones en lenguaje natural para analistas de nivel 1, siempre que se valide su calidad con evaluaciones propias al no haber benchmarks públicos.
- Generación de documentación técnica: con 31,6B de parámetros y licencia permisiva, es adecuado para generar y mantener documentación de APIs, runbooks y procedimientos internos en despliegues self-hosted.
- Procesamiento de texto en entornos regulados: al poder ejecutarse en infraestructura propia y bajo Apache 2.0, encaja en organizaciones con requisitos de soberanía de datos (banca, sector público, salud) que no pueden usar APIs de terceros.
- Fine-tuning específico de dominio: el tamaño de 31,6B permite ajuste fino con LoRA o QLoRA sobre GPUs de 80 GB para adaptar el modelo a vocabularios técnicos concretos (telecomunicaciones, legal, ciberseguridad).
- Motor de extracción de información estructurada: uso como base para tareas de NER, extracción de entidades y resumen de informes largos en pipelines batch, aprovechando la licencia permisiva para uso comercial.
- Base para investigación académica: reproducible y con pesos abiertos, sirve como punto de partida para estudios de alineación, evaluación de sesgos o destilación, aunque la ausencia de model card detallada limita la reproducibilidad inicial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 63 GB solo para pesos (31,6B × 2 bytes), más overhead de KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) para caber con margen.
- Cuantización a 8 bits: ~32 GB de pesos, viable en una RTX 4090 (24 GB) solo con cuantización a 4 bits (~16-18 GB) y contexto corto, o en dos GPUs de 24 GB.
- Cuantización a 4 bits (GPTQ/AWQ/GGUF Q4): ~16-18 GB, cabe en RTX 4090, RTX 3090 y A6000, aunque con degradación de calidad no evaluada.
- Multi-GPU: recomendable tensor parallelism con 2× A100 40GB o 2× H100 para bf16 sin cuantizar.
- Opciones de despliegue: vLLM y TGI para serving en GPU con bf16; llama.cpp y Ollama para cuantizaciones GGUF (pendientes de publicación por el autor); no se confirma compatibilidad con TensorRT-LLM ni con SGLang.
- Latencia y throughput: no disponibles; sin benchmarks publicados no es posible estimar tokens/s.
- Almacenamiento: el repo ocupa 65,8 GB, por lo que se necesita al menos ese espacio en disco para la descarga completa.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Notas |
|---|---|---|---|---|---|
| Sovereign-v3 (trendmicro-ailab) | ~31,6B | no disponible | Apache 2.0 | Gated en HF | Arquitectura nemotron_h; sin benchmarks publicados |
| Qwen2.5-32B | 32,5B | 128K | Apache 2.0 | Abierto | Benchmarks públicos extensos; referencia en su rango |
| Gemma 2 27B | 27B | 8K | Gemma license (uso comercial permitido con condiciones) | Abierto | Buen rendimiento en razonamiento; licencia no OSI |
| Mistral Small 24B | 24B | 128K | Apache 2.0 | Abierto | Orientado a instrucciones y tool calling |

La comparación es estructural, ya que no existen datos de rendimiento publicados de Sovereign-v3 que permitan contrastar calidad. En términos de licencia, Sovereign-v3 compite favorablemente con Gemma 2 al ser Apache 2.0 puro, pero la falta de documentación y de cuantizaciones comunitarias lo sitúa por detrás en madurez de ecosistema frente a Qwen2.5-32B y Mistral Small.

## Limitaciones y advertencias

- Ausencia total de model card detallada: no hay información sobre datos de entrenamiento, sesgos, idiomas ni alineación, lo que impide evaluar riesgos de forma rigurosa.
- Riesgo de alucinación desconocido: sin benchmarks de veracidad (TruthfulQA, HaluEval) no se puede estimar la fiabilidad factual.
- Acceso restringido: el repositorio es gated, por lo que la descarga requiere aceptar condiciones y puede no ser apta para pipelines automatizados sin gestión de tokens de HF.
- Idiomas no declarados: no se puede asumir un buen rendimiento en castellano ni en otros idiomas distintos del inglés sin evaluación previa.
- Contexto no documentado: planificar despliegues asumiendo ventanas cortas hasta confirmación; no diseñar aplicaciones dependientes de contexto largo sin verificación.
- Sin cuantizaciones oficiales: la ausencia de GGUF/AWQ publicadas obliga a generarlas internamente, con el coste y el riesgo de calidad asociados.
- Licencia Apache 2.0: permisiva para uso comercial, pero conviene revisar las condiciones adicionales del gate de Hugging Face, que pueden imponer obligaciones de uso aceptable.
- Madurez: cero descargas y cero likes en el momento de la ficha; no hay evidencia de comunidad, issues resueltos ni soporte del autor.
- Procedencia en ciberseguridad: si el modelo se ha ajustado con datos de threat intelligence, podría reproducir sesgos hacia taxonomías o vendors concretos; no verificable sin documentación.

## Enlaces

- Hugging Face: https://huggingface.co/trendmicro-ailab/sovereign-v3
- Repositorio de Trend Micro AI Lab en Hugging Face: https://huggingface.co/trendmicro-ailab
- Paper, blog o demo oficial: no disponible en la información proporcionada.
