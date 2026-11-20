# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed7

## Resumen

DIET trajectory: OLMo2-medium (~305M), Dolma, seed 7 es un modelo de lenguaje de ~305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (weight-space). No es un modelo pensado para uso productivo, sino un artefacto de investigación: una de las ejecuciones de preentrenamiento de una colección en la que solo varía la semilla aleatoria, lo que permite estudiar trayectorias de entrenamiento y comparar cómo evolucionan los pesos y las representaciones internas entre réplicas.

El modelo emplea una arquitectura transformer densa tipo OLMo2 con 16 capas, dimensión oculta de 768, 12 cabezas de atención y una longitud máxima de posición de 2048 tokens. Se entrenó con un presupuesto de 2.000 millones de tokens sobre el dataset Dolma v1.7 (mirror comunitario `emozilla/dolma-v1_7-3B`), en streaming y sin pre-empaquetado, usando únicamente pérdida de entropía cruzada (LM puro), sin destilación ni fases de alineación.

Su relevancia es metodológica: al estar replicado con distintas semillas y publicar checkpoints intermedios por paso, sirve como base para investigaciones sobre dinámica de entrenamiento, merging de pesos, dietas de datos y reproducibilidad en modelos pequeños. La licencia Apache 2.0 y el formato bf16 safetensors facilitan su reutilización en experimentos académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (hidden_size=768, intermediate_size=3072, 16 capas, 12 cabezas de atención, 12 cabezas KV) |
| Parametros totales | ~305M |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (max_position_embeddings) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (ramas `stepN` con checkpoints intermedios; `main` con los pesos finales) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de la familia OLMo2, definido en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`. Concretamente: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin compartición KV) y `max_position_embeddings=2048`, para un total de aproximadamente 305 millones de parámetros.

El entrenamiento es un preentrenamiento de lenguaje puro con pérdida de entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), es decir, sin profesor de destilación ni fases posteriores de RLHF/DPO. Se usó AdamW con `lr=3e-5`, betas `(0.9, 0.95)`, weight decay `0.1`, schedule coseno y precisión bf16, sobre H100, con un presupuesto de 2.000 millones de tokens (`token_budget: 2000000000`) y `max_steps: 30517`, guardando checkpoint cada 100 pasos. Los datos provienen de `emozilla/dolma-v1_7-3B`, un mirror comunitario nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). La única diferencia entre las ejecuciones de esta colección es la semilla aleatoria (en este caso, `seed: 7`), lo que convierte al modelo en una pieza de análisis de trayectorias en el espacio de pesos.

## Capacidades

- Generación de texto autoregresiva básica en inglés, derivada de un preentrenamiento puro de modelado de lenguaje.
- Modelado de lenguaje y cálculo de perplejidad sobre texto en inglés, útil como referencia en experimentos.
- Reproducción de trayectorias de entrenamiento: acceso a checkpoints intermedios por paso (ramas `stepN`) para estudiar la evolución de los pesos.
- Comparación entre semillas: al existir réplicas con la misma receta y distinta semilla, permite analizar variabilidad de entrenamiento.
- Análisis en espacio de pesos: base para experimentos de interpolación, merging o dietas de datos sobre la arquitectura OLMo2.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidades multilingües limitadas al inglés según la model card.

## Casos de uso

- Investigación sobre trayectorias de entrenamiento: cargar los checkpoints `stepN` y medir cómo cambian las representaciones internas, la pérdida o las métricas de sonda a lo largo de los 30.517 pasos, aprovechando el guardado cada 100 pasos.
- Estudios de reproducibilidad y varianza por semilla: comparar esta ejecución (`seed 7`) con las demás réplicas de la colección para cuantificar cuánto del resultado final se debe al azar inicial.
- Experimentos de weight-space merging: usar los pesos finales y los intermedios como material para probar técnicas de interpolación o model soup sobre una arquitectura OLMo2 pequeña y homogénea.
- Dietas de datos y ablaciones: al entrenar sobre Dolma v1.7 con muestreo proporcional, sirve como línea base para evaluar el efecto de subconjuntos o reequilibrios del corpus.
- Referencia de perplejidad para modelos pequeños en inglés: útil como punto de comparación en pipelines de evaluación de modelos de ~300M parámetros.
- Docencia y prototipado de bajo coste: con ~305M parámetros y contexto de 2048, se puede ejecutar en GPU de consumo para prácticas de fine-tuning o análisis de atención, siempre como modelo de investigación y no de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,6-0,7 GB solo para pesos (~305M parámetros × 2 bytes), más overhead de activaciones y caché KV; con contexto de 2048 y lote pequeño, cabe holgadamente en GPUs de 8 GB o menos.
- Cuantización a 8 bits o 4 bits (si se convierte externamente, ya que no se publican variantes): reduciría los pesos a ~0,3 GB y ~0,15 GB respectivamente.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para inferencia en bf16; H100 fue la GPU usada en el entrenamiento (según `run.json`), pero no es necesaria para uso del modelo.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en CPU para inferencia lenta.
- Opciones de despliegue: `transformers` (librería declarada); al ser safetensors estándar, es convertible a GGUF para llama.cpp/Ollama y compatible con servidores tipo vLLM o TGI, aunque no se documenta soporte oficial.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Datos | Licencia | Notas |
|---|---|---|---|---|---|
| DIET trajectory OLMo2-medium (este modelo) | ~305M | 2048 | Dolma v1.7, 2B tokens | Apache 2.0 | Preentrenamiento puro, checkpoints por paso, enfoque en análisis de trayectorias |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | no disponible | Colección análoga del proyecto DIET sobre arquitectura Pythia |
| OLMo2 (modelos oficiales de AI2) | varios tamaños | no disponible | Dolma | Apache 2.0 | Familia base de la arquitectura; este modelo es una réplica pequeña de investigación |
| Pythia-410M | ~410M | 2048 | The Pile | Apache 2.0 | Referencia habitual en estudios de trayectorias de entrenamiento |

## Limitaciones y advertencias

- Modelo de investigación: no está ajustado con instrucciones ni alineado (sin RLHF/DPO), por lo que no es adecuado como asistente conversacional en producción.
- Riesgo alto de alucinación y de generar contenido incoherente o sesgado, propio de un preentrenamiento de solo 2.000 millones de tokens en un modelo de ~305M parámetros.
- Contexto limitado a 2048 tokens, insuficiente para tareas de documento largo.
- Solo inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado y previsiblemente será deficiente.
- Sesgos heredados del corpus Dolma v1.7 y del muestreo proporcional de sus componentes; no se documentan evaluaciones de sesgo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de calidad para tales fines.
- Los checkpoints intermedios (`stepN`) son solo pesos, sin estado del optimizador, lo que limita reanudar el entrenamiento de forma exacta.
- El campo `git_commit` figura como `unknown` en `run.json`, lo que dificulta la reproducibilidad exacta del código de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed7
- Repositorio del proyecto DIET: https://huggingface.co/jjalora/diet-lm
- Colección análoga sobre Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m
- Dataset utilizado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper de Dolma: https://arxiv.org/abs/2402.00159
- Paper de OLMo 2: https://arxiv.org/abs/2501.00656
