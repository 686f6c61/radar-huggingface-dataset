# SZLHOLDINGS/salad-chaski-r2-r1

## Resumen

`SZLHOLDINGS/salad-chaski-r2-r1` es un adaptador PEFT (LoRA) publicado por SZLHOLDINGS sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. No se trata de un modelo fundacional nuevo, sino de un ajuste fino supervisado (SFT) de 200 pasos ejecutado sobre una GPU NVIDIA RTX 3090 en la infraestructura de SaladCloud. El repositorio contiene 17 ficheros de pesos y 44 ficheros auxiliares (gráficas SVG, scripts de generación de la model card, recibos criptográficos), con un tamaño total de 1,1 GB.

El interés del artefacto es fundamentalmente metodológico y de trazabilidad, no de rendimiento. El autor documenta cada evento del entrenamiento (arranque de worker, heartbeat, push de checkpoint) con un recibo SHA-256 encadenado y publicado en un dataset público (`SZLHOLDINGS/frontier-54-runs`). La model card incluye una "doctrina fail-closed": cualquier evento no certificable deja un recibo honesto en lugar de silencio. Esta aproximación a la reproducibilidad verificable es poco habitual en adaptadores de este tamaño.

El modelo en sí es un adaptador pequeño sobre una base de 0,5 mil millones de parámetros, entrenado sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2`. La pérdida bajó de 2,154 a 0,722 en 20 puntos registrados y la precisión de token media subió de 0,524 a 0,773. No hay benchmarks publicados ni evaluación del adaptador: la batería de 6 sondas que aparece en la model card corresponde a otro modelo (`chaski-r2-v2-trained`), no a este lane, y el propio autor lo advierte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-0.5B-Instruct) + adaptador LoRA (PEFT) |
| Parametros totales | ~0,5 mil millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero el adaptador no lo declara) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors del adaptador) |
| Idiomas soportados | no disponible (no declarados en la model card) |
| Licencia | other (etiqueta literal observada; terminos no especificados) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-0.5B-Instruct`, un transformer decoder-only de la familia Qwen2.5. El entrenamiento consistió en 200 pasos de SFT sobre el corpus `SZLHOLDINGS/governed-sft-mix-v2`, ejecutados en una NVIDIA GeForce RTX 3090 (identificador de nodo `17d73db9-e0a8-4680-95cd-2ebfe24f31a6`) con un throughput aproximado de 1,6k tokens/s medido a partir de intervalos de tqdm. La pérdida pasó de 2,154 (primer punto registrado) a 0,722 (último), y la precisión de token media de 0,524 a 0,773, sobre 20 puntos de log. El número total de tokens vistos no se reporta.

La innovación destacable no está en la arquitectura sino en el sistema de procedencia: cada evento del entrenamiento genera un recibo con digest SHA-256 encadenado (cada nudo cubre el digest anterior), publicado en un dataset público de "lanelogs". La model card se autogenera mediante el script `card_src/salad_card_builder.py`, incluido en el repositorio, de modo que la propia tarjeta es verificable y regenerable. El autor declara explícitamente que no se ha medido energía (sección "Energy: MEASURED or nothing") y que no se transfiere ninguna puntuación de evaluación al adaptador.

## Capacidades

- Generación de texto conversacional e instrucciones, heredadas del modelo base Qwen2.5-0.5B-Instruct.
- Razonamiento básico y aritmética simple (el base resuelve operaciones como 17 × 23 según la batería de referencia del autor).
- Conocimiento factual general de un modelo pequeño (capitales, autores, historia).
- Capacidad de ajuste adicional mediante el adaptador LoRA entrenado sobre el corpus gobernado del autor.
- No se declaran capacidades de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido en la información disponible.
- Capacidades multilingües: no declaradas explícitamente; dependen del modelo base.

## Casos de uso

- Prototipado rápido de asistentes conversacionales ligeros: con 0,5B de parámetros y un adaptador de 1,1 GB, el modelo cabe en cualquier GPU de consumo y permite iterar sobre prompts sin coste de infraestructura.
- Experimentación con cadenas de procedencia y reproducibilidad: el repositorio sirve como plantilla para auditar entrenamientos con recibos SHA-256 encadenados y model cards autogeneradas.
- Fine-tuning educativo de LoRA: el run card documenta pasos, pérdida, precisión de token y throughput, útil como referencia para quienes entrenan adaptadores sobre Qwen2.5-0.5B.
- Tareas de clasificación o extracción simple en entornos con recursos limitados, donde un modelo de 0,5B ajustado a un dominio concreto puede bastar.
- Investigación sobre evaluación de honestidad y abstención: el autor publica sondas answerable/unanswerable (aunque la puntuación corresponde a otro modelo) que sirven de marco metodológico.
- Despliegue en CPU o GPU de gama baja para demos internas, dado el reducido tamaño del base y del adaptador.
- No se recomienda como componente de producción crítico sin evaluación propia, dado que no hay benchmarks del adaptador ni licencia clara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks del adaptador en la informacion disponible. La model card incluye una batería de 6 sondas (3 answerable, 3 unanswerable) con puntuación 3/6, pero el propio autor aclara que el recibo corresponde al modelo `SZLHOLDINGS/chaski-r2-v2-trained` y no a este lane; no se transfiere ninguna puntuación.

| Metrica de entrenamiento | Primer valor | Ultimo valor |
|---|---|---|
| Loss (n=20 puntos) | 2,154 | 0,722 |
| Precisión de token media | 0,524 | 0,773 |
| Throughput aproximado | — | ~1,6k tokens/s |
| Pasos completados | — | 200 / 200 |

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: ~1 GB; en cuantización de 8 bits, ~0,5 GB; en 4 bits, ~0,3 GB (estimación a partir del tamaño de 0,5B parámetros; el adaptador añade una fracción mínima).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100, H100 y RTX A6000 son sobradas. El entrenamiento se realizó en una RTX 3090.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU discreta moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: el adaptador PEFT se carga con la librería `peft` sobre el base Qwen2.5-0.5B-Instruct; para servicio se puede usar vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama, aunque la conversión del adaptador a GGUF requiere pasos adicionales.
- Latencia y throughput: el autor reporta ~1,6k tokens/s durante el entrenamiento en RTX 3090; no hay mediciones de inferencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/salad-chaski-r2-r1 | ~0,5B (base) + LoRA | no disponible | other | Hugging Face | Adaptador SFT con trazabilidad SHA-256; sin benchmarks |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Modelo base; benchmarks públicos; licencia permisiva |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | Hugging Face | Mayor capacidad, misma familia y tokenizador |
| meta-llama/Llama-3.2-1B-Instruct | 1,2B | 128k tokens | Llama 3.2 Community License | Hugging Face | Alternativa de tamaño similar con contexto mucho mayor |

La comparación relevante es contra el propio base: el adaptador no aporta mejoras de contexto, licencia ni capacidades declaradas, y su valor está en el corpus de ajuste y en la infraestructura de procedencia, no en métricas de calidad.

## Limitaciones y advertencias

- No hay benchmarks ni evaluación del adaptador publicados; el rendimiento real en tareas downstream es desconocido.
- La batería de 6 sondas de la model card pertenece a otro modelo y no debe atribuirse a este lane.
- Licencia "other" sin términos especificados: no se puede asumir uso comercial sin contactar al autor.
- Idiomas soportados no declarados; dependen del base Qwen2.5-0.5B-Instruct y del corpus de ajuste, que no se detalla.
- Riesgo de alucinación propio de un modelo de 0,5B: conocimiento factual limitado y propensión a inventar detalles en preguntas de nicho.
- Sesgos del corpus `SZLHOLDINGS/governed-sft-mix-v2` no documentados; no hay análisis de sesgo ni de seguridad.
- El repositorio no incluye ficheros de configuración ni tokenizador (0 ficheros de config/tokenizer observados), lo que complica la carga directa sin recurrir al base.
- La procedencia del entrenamiento no es verificable de forma independiente desde el repositorio, según la propia nota curada.
- Sin medición de energía ni de emisiones; el autor lo declara explícitamente como no medido.
- Visibilidad privada del repositorio en el momento de la última edición curada; disponibilidad pública no garantizada a largo plazo.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-chaski-r2-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de recibos públicos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/governed-sft-mix-v2
- Modelo referenciado en la batería: https://huggingface.co/SZLHOLDINGS/chaski-r2-v2-trained
- Script de generación de la model card: `card_src/salad_card_builder.py` (incluido en el repositorio)
- Paper, blog, repositorio GitHub o demo: no disponibles en la información proporcionada.
