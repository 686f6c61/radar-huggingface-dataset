# WUrbane/igsm-optimizer-arms-520m

## Resumen

`igsm-optimizer-arms-520m` es un repositorio de modelos de lenguaje de tipo causal (causal LM) publicados por el usuario WUrbane bajo el paraguas de un estudio comparativo de optimizadores. No se trata de un modelo único, sino de una colección de *checkpoints* completos derivados de modelos base preentrenados con AdamW o Muon (`OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*`), y afinados posteriormente para estudiar qué matrices ocultas actualiza el optimizador Muon (los denominados *component arms*) y la forma espectral de dicha actualización (los *spectral arms*).

El nombre indica un tamaño de aproximadamente 520 millones de parámetros, y los *checkpoints* se distribuyen en subcarpetas independientes dentro del mismo repositorio, cada una con su propia model card y un fichero `EXPORT.json` que documenta hiperparámetros, hashes y modelo base. La librería declarada es `transformers` y los pesos están en formato `safetensors`. El repositorio ocupa 9,6 GB, lo que es coherente con varios *checkpoints* completos de ese tamaño.

La relevancia del modelo es fundamentalmente investigadora: sirve para reproducir y analizar empíricamente el comportamiento del optimizador Muon frente a AdamW en el entrenamiento de transformers, no como un modelo de propósito general listo para producción. La información pública disponible es muy limitada (sin licencia declarada, sin idiomas declarados, sin pipeline asignado y sin descargas ni interacciones), por lo que muchos datos técnicos deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (causal LM) para `transformers`; detalles internos no disponibles |
| Parametros totales | Aproximadamente 520 M (segun el nombre del repositorio) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna (número de capas, dimensión oculta, cabezas de atención ni tokenizador). Lo que sí documenta es el proceso de ajuste: cada subcarpeta parte de un modelo base preentrenado con AdamW o Muon y se afina con un conjunto concreto de hiperparámetros. En la información disponible aparecen tres variantes, todas derivadas de un base preentrenado con Muon: `pretrain-muon_arm-k` (Muon actualiza las matrices `k`, LR principal 0,0003, 682 pasos), `pretrain-muon_arm-q` (Muon actualiza las matrices `q`, LR principal 0,0003, 682 pasos) y `pretrain-muon_arm-none` (Muon no actualiza ninguna matriz, LR principal 1e-05, 682 pasos).

Todas las variantes comparten rotación/semilla `k0 / 20261021`, precisión de matmul `tf32` y clase de host `a100`. El eje del experimento es, por tanto, aislar el efecto de aplicar la ortogonalización de Muon a distintos subconjuntos de matrices (las "component arms": `k`, `q`, `none`) y, en otras variantes del estudio, la forma espectral de la actualización ("spectral arms"). Cada subcarpeta incluye un `EXPORT.json` con hiperparámetros, hashes y referencia al modelo base, lo que facilita la reproducibilidad. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto autoregresiva como modelo causal estándar de `transformers`.
- Capacidad de razonamiento y conocimiento general: no documentada ni evaluada en la información disponible.
- Generación de código y matemáticas: no documentada.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no declarados).
- Capacidades especiales (modo *thinking*, visión, audio): no documentadas.
- Uso previsto real: servir como artefacto de investigación para comparar el efecto de Muon frente a AdamW en el ajuste de un transformer de ~520 M de parámetros.

## Casos de uso

- Reproducción de experimentos de optimizadores: cargar cada subcarpeta (`pretrain-muon_arm-k`, `pretrain-muon_arm-q`, `pretrain-muon_arm-none`) con `AutoModelForCausalLM.from_pretrained(..., subfolder=...)` y comparar curvas de pérdida y comportamiento para aislar el efecto de actualizar `k`, `q` o ninguna matriz con Muon.
- Investigación sobre ortogonalización en el entrenamiento: usar los tres *checkpoints* como ablación controlada (misma semilla `20261021`, mismos 682 pasos, misma precisión `tf32`) para estudiar la forma espectral de las actualizaciones.
- Validación de pipelines de entrenamiento distribuido: los metadatos de host (`a100`) y precisión (`tf32`) permiten replicar el entorno de cómputo y verificar la reproducibilidad mediante los hashes de `EXPORT.json`.
- Estudio de estabilidad de *learning rates*: la variante `arm-none` con LR 1e-05 frente a las variantes con LR 0,0003 permite analizar cómo interactúa la elección de matrices con la tasa de aprendizaje.
- Docencia y formación en optimización de modelos: servir de ejemplo práctico y reproducible de cómo se estructura un estudio de ablación de optimizadores con artefactos versionados en Hugging Face.
- Base para *fine-tuning* posterior en tareas concretas: al ser un modelo causal de ~520 M en `transformers`, puede reutilizarse como punto de partida para ajustes específicos, siempre que se resuelva antes la ambigüedad de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en `fp16`/`bf16`, aproximadamente 1,0-1,1 GB solo para pesos de un modelo de ~520 M; en `fp32`, unos 2,1 GB. El repositorio completo ocupa 9,6 GB porque contiene varios *checkpoints*, no porque un único modelo requiera esa memoria.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para una variante en `fp16`; los experimentos originales se ejecutaron en clase `a100` con precisión `tf32`.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090, entre otras, con margen amplio para una sola variante.
- Opciones de despliegue: `transformers` (librería declarada); no se documenta compatibilidad explícita con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF publicados habría que convertirlos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones internas suficientes para establecer una comparativa rigurosa con alternativas de la misma categoría. A modo orientativo de categoría (modelos causales de ~500 M de parámetros), podrían considerarse referencias como Qwen2.5-0.5B, SmolLM2-360M o GPT-2 Medium, pero no se han publicado métricas de este repositorio que permitan compararlas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `igsm-optimizer-arms-520m` | ~520 M | no disponible | no disponible | Hugging Face (0 descargas) |
| Qwen2.5-0.5B | ~494 M | 32 768 tokens | Apache 2.0 | Hugging Face |
| SmolLM2-360M | ~362 M | 8192 tokens | Apache 2.0 | Hugging Face |
| GPT-2 Medium | ~355 M | 1024 tokens | MIT | Hugging Face |

Los datos de los modelos de referencia corresponden a conocimiento general de esos modelos; no se han contrastado con métricas de este repositorio, que no las publica.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Sin idiomas declarados ni evaluación multilingüe: se desconoce el rendimiento real fuera del corpus de entrenamiento original.
- Sin benchmarks publicados: no hay evidencia de calidad en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación: inherente a cualquier modelo causal de este tamaño y sin datos de alineación (RLHF/DPO) documentados.
- Naturaleza experimental: los *checkpoints* están diseñados como artefactos de un estudio de optimizadores, no como modelos afinados para instrucciones; es probable que no sigan instrucciones de forma fiable.
- Contexto desconocido: al no documentarse la longitud de contexto, no debe asumirse una ventana larga.
- Repositorio con 0 descargas y 0 *likes*: sin validación por parte de la comunidad; conviene verificar los hashes de `EXPORT.json` antes de reutilizar los pesos.
- Tamaño del repositorio (9,6 GB) por acumulación de varias subcarpetas: al descargar, conviene limitarse a la subcarpeta necesaria para no consumir almacenamiento innecesario.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WUrbane/igsm-optimizer-arms-520m
- Modelos base referenciados en la model card: `OptimizerStudy/adamw_*` y `OptimizerStudy/muon_*` (organización `OptimizerStudy` en Hugging Face; URL exacta no disponible)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
