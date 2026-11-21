# stanfordasl/diet-traj-olmo2-medium-dolma-seed4

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed4` es un checkpoint de preentrenamiento desde cero de un modelo denso de arquitectura OLMo2 con aproximadamente 305 millones de parámetros, publicado por el grupo Stanford ASL dentro del proyecto DIET (weight-space). No es un modelo instructivo ni un asistente: es una trayectoria de entrenamiento completa, es decir, un conjunto de checkpoints intermedios y finales generados con una receta fija en la que solo varía la semilla aleatoria, pensada para analizar la dinámica de pesos y la evolución del aprendizaje en el espacio de parámetros.

El modelo usa la arquitectura OLMo2 (`olmo2_medium_dense`), con 16 capas, `hidden_size` de 768, 12 cabezas de atención y 12 cabezas KV (atención multi-cabeza clásica, sin GQA), y una longitud máxima de posición de 2048 tokens. Se entrenó sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming, con un presupuesto de 2.000 millones de tokens y 30.517 pasos.

Su relevancia es metodológica más que de producto: al fijar receta, datos y hardware (H100) y variar únicamente la semilla, permite estudiar la reproducibilidad del preentrenamiento, la geometría del espacio de pesos y la trayectoria de las métricas a lo largo de los checkpoints. Está publicado con licencia Apache 2.0 y solo declara inglés como idioma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (`olmo2_medium_dense`), transformer decoder-only |
| Parámetros totales | 305.185.536 (aprox. 305M) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantización | no disponible (pesos publicados en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), compatibles con `transformers` |

Detalles de configuración: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12`. Tamaño del repositorio: 40,3 GB (incluye múltiples checkpoints en ramas `stepN`).

## Arquitectura y entrenamiento

Transformer decoder-only de la familia OLMo2 en variante densa de ~305M parámetros. La atención es multi-cabeza estándar (12 cabezas de query y 12 de key/value, sin grouped-query attention), con un `intermediate_size` de 3072 en las capas feed-forward y 16 capas. El contexto máximo es de 2048 posiciones. No se documentan innovaciones adicionales como decodificación especulativa, atención lineal o mezclas de expertos.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin profesor de destilación). Se usó AdamW con `lr=3e-5`, betas (0,9; 0,95), weight decay 0,1, schedule coseno y precisión bf16 sobre GPUs H100. Los datos provienen de `emozilla/dolma-v1_7-3B`, muestreado proporcionalmente entre los componentes de la mezcla Dolma v1.7 y consumido en streaming (sin pre-empaquetado). El presupuesto es de 2.000.000.000 tokens en 30.517 pasos, con guardado cada 950 pasos; la semilla de esta ejecución es 4 y el resto de la receta es idéntica al resto de la colección.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste instructivo ni de preferencias.
- Modelado de lenguaje y cálculo de perplejidad sobre corpus en inglés.
- Razonamiento y conocimiento factual limitados por el tamaño (305M) y por el presupuesto de entrenamiento (2.000M tokens).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes ni de razonamiento multi-paso estructurado.
- Capacidad multilingüe: no disponible; la model card solo declara inglés.
- No incluye modo de razonamiento explícito (thinking), visión ni audio.
- Interés principal: servir como objeto de estudio de trayectorias de entrenamiento (checkpoints `stepN`) y análisis en el espacio de pesos.

## Casos de uso

- Investigación sobre reproducibilidad del preentrenamiento: comparar esta ejecución (semilla 4) con las demás semillas de la colección para medir la varianza en las métricas finales con receta, datos y hardware idénticos.
- Análisis de trayectorias en el espacio de pesos: cargar los checkpoints de las ramas `stepN` y estudiar la evolución de la norma de los pesos, la rotación de subespacios o la similitud entre pasos mediante CKA u otras métricas de representación.
- Estudios de dinámica de aprendizaje: usar los 33 checkpoints aproximados (30.517 pasos / 950 de cadencia) para trazar curvas de pérdida y de capacidades emergentes a lo largo de 2.000M de tokens.
- Línea base de arquitectura OLMo2 a pequeña escala: referencia para comparar variantes de receta (learning rate, schedule, mezcla de datos) manteniendo el resto de factores fijos.
- Experimentos de destilación o ajuste fino posteriores: al ser un modelo base Apache 2.0 de 305M, sirve como inicialización para tareas downstream en inglés con recursos limitados.
- Evaluación de técnicas de compresión o poda: su tamaño permite ejecutar barridos completos de cuantización y pruning en una sola GPU consumer y medir el impacto en perplejidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 0,61 GB solo para pesos (305M × 2 bytes); en fp32, unos 1,22 GB.
- VRAM estimada en fp16/bf16 con caché KV para contexto completo (2048 tokens, 16 capas, 12 cabezas KV de dimensión 64): del orden de 0,1 GB adicionales; el total con activaciones se mantiene por debajo de 2-3 GB en inferencia por lotes pequeños.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para inferencia; para entrenamiento o ajuste fino, H100 (la usada en el run original) o A100 con bf16.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: `transformers` (formato nativo safetensors), vLLM y TGI para servicio; llama.cpp u Ollama requerirían conversión a GGUF, no documentada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed4 | ~305M | 2048 | Apache 2.0 | Trayectoria de preentrenamiento OLMo2 sobre Dolma | Hugging Face, múltiples checkpoints `stepN` |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | Trayectoria de preentrenamiento Pythia (proyecto DIET) | Hugging Face |
| OLMo2 oficial (variantes pequeñas) | no disponible en la información | no disponible | Apache 2.0 | Modelo base de referencia de AI2 | Hugging Face |
| Pythia-410m | ~410M | 2048 | Apache 2.0 | Suite de checkpoints de EleutherAI | Hugging Face |

La comparación relevante es con la colección Pythia de EleutherAI y con la propia colección DIET sobre Pythia: mismo propósito de análisis de trayectorias, distinta arquitectura y distinto corpus (Dolma frente a The Pile). No se dispone de métricas comparativas publicadas para establecer diferencias de rendimiento.

## Limitaciones y advertencias

- Modelo base sin ajuste instructivo: no sigue instrucciones de forma fiable y no debe usarse directamente como asistente conversacional.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, agravado por el tamaño reducido y el presupuesto de solo 2.000M tokens.
- Sesgos heredados de Dolma v1.7 (corpus web y científico en inglés); no se documenta ninguna mitigación.
- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado y previsiblemente será pobre.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- El repositorio ocupa 40,3 GB por acumular checkpoints; conviene descargar solo la rama necesaria (`main` o un `stepN` concreto).
- La model card indica `git_commit: unknown`, lo que dificulta la reproducibilidad exacta del código de entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación no se recomienda en producción sin evaluación propia.
- No hay garantías de soporte ni mantenimiento del repositorio por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed4
- Repositorio de código del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card como `jjalora/diet-lm`)
- Colección de trayectorias DIET sobre Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper de OLMo 2 (arquitectura base): no disponible en la información proporcionada
- Demo o espacio interactivo: no disponible
