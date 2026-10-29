# stanfordasl/diet-traj-olmo2-medium-dolma-seed2

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed2` es un modelo de lenguaje de ~305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET de análisis en el espacio de pesos (*weight-space*). No es un modelo pensado para uso final: es un artefacto de investigación que documenta una trayectoria de preentrenamiento completa (checkpoints intermedios incluidos) para estudiar cómo evolucionan los pesos durante el entrenamiento.

El modelo usa una configuración densa tipo transformer decoder (hidden_size 768, 16 capas, 12 cabezas de atención con 12 cabezas KV, contexto de 2048 tokens) y se preentrena con objetivo de entropía cruzada puro sobre `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace de Dolma v1.7 muestreado proporcionalmente entre sus componentes. La receta es deliberadamente sencilla (AdamW, lr 3e-5, cosine, bf16) y solo cambia la semilla aleatoria entre las ejecuciones de la colección, lo que convierte a este checkpoint en la semilla 2 de un conjunto diseñado para medir varianza entre inicializaciones.

Su relevancia es metodológica, no de rendimiento: con un presupuesto de 2.000 millones de tokens para 305 millones de parámetros (≈6,5 tokens por parámetro), está muy por debajo de lo que sería un entrenamiento óptimo en cómputo, y no ha pasado por ajuste por instrucciones ni alineación. Sirve como línea base reproducible, para experimentos de interpolación y fusión de modelos, y para comparativas de dinámica de entrenamiento entre arquitecturas (Pythia frente a OLMo2).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder, sin biases, layer norm no paramétrica, SwiGLU, RoPE) |
| Parámetros totales | 305.185.536 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantización | no se publican cuantizaciones oficiales; al ser safetensors bf16 es convertible a GGUF/int8/int4 con herramientas estándar |
| Idiomas soportados | inglés (`language: [en]`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en bf16 (ramas `stepN` para checkpoints, `main` para los pesos finales) |

Configuración interna: `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12`, `num_key_value_heads=12` (atención multi-cabeza sin GQA), `max_position_embeddings=2048`.

## Arquitectura y entrenamiento

La arquitectura es la OLMo2 densa de AI2: transformer decoder con atención multi-cabeza completa, embeddings posicionales rotatorios (RoPE), activación SwiGLU, layer norm no paramétrica y eliminación de todos los términos de sesgo para mejorar la estabilidad del entrenamiento. La configuración concreta (`configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`) da 16 capas y 768 dimensiones ocultas, unos 305M de parámetros.

El entrenamiento es preentrenamiento de lenguaje puro (`distillation.teacher_schedule=none` en `src/run_distillation.py`, es decir, sin profesor de destilación pese al nombre del script): AdamW con lr 3e-5, betas (0,9; 0,95), weight decay 0,1, scheduler coseno y precisión bf16. Los datos provienen de `emozilla/dolma-v1_7-3B` en streaming (sin pre-empaquetado), con muestreo proporcional a la mezcla original. La procedencia registrada en `run.json` indica clúster "makau", GPU H100, job 9425 iniciado el 2026-10-28, `max_steps=30517`, `save_steps=950` y `token_budget=2e9`. Con esos datos, el lote efectivo ronda los 65.500 tokens por paso y la ejecución genera del orden de 32 checkpoints intermedios, lo que explica un tamaño de repositorio de 39,1 GB. No se documenta RLHF, DPO ni ninguna fase de ajuste fino posterior; no hay innovaciones de inferencia (decodificación especulativa, atención lineal) asociadas.

## Capacidades

- Generación de texto autoregresiva básica en inglés, a nivel de modelo preentrenado sin ajuste instructivo.
- Continuación de texto y modelado de lenguaje: es su única función realmente entrenada (objetivo CE/LM).
- Reproducción de trayectorias de entrenamiento: checkpoints en ramas `stepN` (cada 950 pasos) para estudiar la evolución de los pesos.
- Análisis en el espacio de pesos: la colección por semillas (seed 2, seed 4, etc.) permite medir varianza entre inicializaciones y experimentar con interpolación lineal entre checkpoints.
- Capacidades multilingües: no disponibles más allá del inglés.
- Tool calling / function calling: no soportado (no hay ajuste por instrucciones ni formato de herramientas).
- Razonamiento multi-paso y uso como agente: no soportado de forma fiable.
- Visión, audio o modo "thinking": no disponibles.

## Casos de uso

- Investigación sobre dinámica de entrenamiento: usar las ramas `stepN` para trazar la evolución de la norma de pesos, la pérdida por componente del dataset o la formación de representaciones a lo largo de 30.517 pasos, algo que un checkpoint final aislado no permite.
- Estudios de varianza por semilla: comparar directamente esta ejecución (seed 2) con `diet-traj-olmo2-medium-dolma-seed4` manteniendo constante todo lo demás (datos, receta, hardware), para cuantificar cuánto del resultado final se debe al azar de la inicialización.
- Interpolación y fusión de modelos: emparejar checkpoints de las mismas etapas entre semillas y medir conectividad de modo lineal o barreras de pérdida, un caso de uso clásico del proyecto DIET.
- Línea base para ablaciones de arquitectura: al compartir tokenizador y datos con otras ejecuciones OLMo2, sirve como control al probar variantes de receta (learning rate, schedule, mezcla de datos).
- Docencia y experimentación de bajo coste: 305M de parámetros permiten entrenar o hacer fine-tuning completo en una sola GPU de 24 GB, útil para cursos de formación de modelos donde el ciclo completo debe caber en horas.
- Pruebas de infraestructura de inferencia y despliegue: validar pipelines (vLLM, TGI, llama.cpp, convertidores a GGUF) con un modelo pequeño y de licencia permisiva antes de escalar a modelos de 7B o superiores.
- Experimentos de ajuste supervisado a pequeña escala: partir de un checkpoint preentrenado limpio (sin alineación previa) para estudiar el efecto del SFT sin interferencias de fases anteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye evaluaciones de MMLU, HumanEval, GSM8K, ARC, HellaSwag ni perplejidad sobre conjuntos de validación, y el modelo no está ajustado por instrucciones, por lo que las comparativas estándar de instrucciones no serían directamente aplicables.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,6 GB en bf16 (solo pesos), ~1,2 GB en fp32, ~0,3 GB en int8 y ~0,15-0,2 GB en int4 (más caché KV y activaciones, marginal con contexto de 2048).
- GPU recomendadas: cualquier GPU moderna sobra; una RTX 4090, A100 o H100 queda enormemente sobredimensionada para inferencia, y su uso lógico es el entrenamiento (la ejecución original se hizo en H100).
- Cabe en GPU de consumo: sí, holgadamente. Funciona en tarjetas de 4-8 GB e incluso en CPU para inferencia puntual; también en GPUs integradas con llama.cpp.
- Opciones de despliegue: `transformers` (librería declarada), vLLM y TGI para servir, llama.cpp/Ollama tras conversión a GGUF, y carga directa en fp32 para depuración.
- Latencia y throughput: no disponibles como dato medido. Por tamaño, en una GPU de consumo se espera un throughput de miles de tokens por segundo con batching, pero es una estimación por escala y no una cifra publicada.
- Nota de almacenamiento: descargar el repositorio completo implica 39,1 GB por los checkpoints intermedios; para uso normal conviene bajar solo la rama `main`.

## Comparativa con modelos similares

Los datos de las alternativas provienen de sus respectivas model cards públicas y pueden variar respecto a este resumen; los de este modelo salen de la información proporcionada.

| Modelo | Parámetros | Contexto | Tokens de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed2 | 305M | 2048 | 2.000M (≈6,5 tok/param) | Apache 2.0 | Artefacto de investigación, preentrenamiento puro |
| Pythia-410M (EleutherAI) | 410M | 2048 | 300.000M | Apache 2.0 | Suite de investigación con 154 checkpoints |
| SmolLM2-360M (HuggingFace) | ~362M | 8192 | no disponible en esta ficha | Apache 2.0 | Modelo pequeño alineado, uso práctico |
| Qwen2.5-0.5B (Alibaba) | ~494M | 32768 | no disponible en esta ficha | Apache 2.0 | Modelo pequeño con ajuste instructivo |
| OLMo2 oficial (Ai2) | 7B / 13B | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 | Familia completa abierta, con informe técnico |

Frente a Pythia-410M, la diferencia clave es el volumen de entrenamiento: Pythia vio dos órdenes de magnitud más tokens, por lo que este checkpoint no es competitivo en calidad, pero sí comparte el propósito de servir como trayectoria reproducible con checkpoints intermedios. Frente a SmolLM2-360M o Qwen2.5-0.5B, la diferencia es de finalidad: aquellos son modelos usables en producción, este es un sujeto de estudio.

## Limitaciones y advertencias

- Infraentrenamiento severo: 2.000 millones de tokens para 305M de parámetros equivale a ~6,5 tokens por parámetro, muy por debajo de la regla de Chinchilla (~20). La perplejidad y la coherencia esperadas son propias de un modelo a medio entrenar.
- Sin ajuste por instrucciones ni alineación: no sigue instrucciones, no respeta formatos de chat y no tiene filtro de seguridad. No debe exponerse a usuarios finales.
- Solo inglés: no hay evidencia de capacidades en castellano ni en otros idiomas.
- Contexto corto: 2048 tokens, insuficiente para documentos largos, RAG con muchos fragmentos o conversaciones extensas.
- Riesgo alto de alucinación y de degeneración en generaciones largas, propio de un modelo preentrenado pequeño sin RLHF.
- Sesgos: el dataset Dolma es una mezcla web con los sesgos conocidos de ese corpus; no se documenta ninguna mitigación.
- Varianza por semilla: al formar parte de una colección donde solo cambia la semilla, se espera una dispersión no trivial entre ejecuciones; conclusiones extraídas de una sola semilla pueden no generalizar.
- Licencia Apache 2.0: permite uso comercial y modificación, pero la calidad del modelo hace inviable cualquier aplicación productiva pese a la permisividad legal.
- Caveat de reproducción: `run.json` registra `"git_commit": "unknown"`, lo que dificulta reconstruir bit a bit el entorno de entrenamiento.
- Tamaño del repositorio: 39,1 GB por los checkpoints en ramas; hay que descargar selectivamente para no arrastrar todo el histórico.
- Los checkpoints son solo pesos (sin estados del optimizador), por lo que no permiten reanudar el entrenamiento de forma exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed2
- Ejecución hermana (seed 4): https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed4
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Dataset Dolma original (Ai2): https://huggingface.co/datasets/allenai/dolma
- Documentación de OLMo2 en transformers: https://huggingface.co/docs/transformers/v5.1.0/model_doc/olmo2
- Página oficial de OLMo2 (Ai2): https://allenai.org/olmo2
- Ficha de Dolma en Open Source AI Map: https://www.aipotluck.org/product/dolma
- Análisis del paper de OLMo (Medium): https://medium.com/my-aiml/deep-dive-analysis-of-olmo-347e5d3d389b
- Repositorio de código de la receta (`jjalora/diet-lm`, referenciado en la model card): https://github.com/jjalora/diet-lm
- Colección previa de trayectorias Pythia (`jjalora/diet-traj-pythia-410m-*`): https://huggingface.co/jjalora
