# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed3

## Resumen

`diet-traj-olmo2-medium-dolma-dense-seed3` es un modelo de lenguaje de ~305 millones de parametros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo `stanfordasl` dentro del proyecto DIET de analisis en espacio de pesos (weight-space). No es un modelo pensado para produccion ni para uso conversacional: es una de las ejecuciones de una coleccion de preentrenamientos controlados que solo difieren en la semilla aleatoria, disenadas para estudiar trayectorias de entrenamiento (evolucion de los pesos y de la perdida a lo largo de los checkpoints).

El modelo usa la configuracion `olmo2_medium_dense` (hidden_size 768, 16 capas, 12 cabezas de atencion y de KV, contexto maximo de 2048 tokens) y se entrena sobre `emozilla/dolma-v1_7-3B`, un espejo en Hugging Face de Dolma v1.7 muestreado proporcionalmente por sus componentes de mezcla. El recetario es preentrenamiento puro de modelado de lenguaje (entropia cruzada) con AdamW, lr 3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y bf16, con un presupuesto de 2.000 millones de tokens (30.517 pasos, checkpoint cada 100 pasos).

Su relevancia es metodologica: permite reproducir y comparar la dinamica de entrenamiento entre semillas sobre una arquitectura reciente (OLMo2) y un corpus abierto (Dolma), con curvas de perdida y metricas de validacion publicadas. La licencia Apache 2.0 y el formato safetensors en bf16 facilitan su reutilizacion como base de experimentos, no como asistente final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo OLMo2 (`olmo2_medium_dense`): hidden_size 768, intermediate_size 3072, 16 capas, 12 cabezas de atencion, 12 cabezas KV |
| Parametros totales | 305.185.536 (~305M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), ramas por paso `stepN`; tokenizer en `main` |

## Arquitectura y entrenamiento

Transformer decoder-only denso con la configuracion OLMo2 medium: 16 capas, dimension oculta 768, FFN de 3072, 12 cabezas de atencion con 12 cabezas KV (sin GQA), posiciones absolutas hasta 2048 tokens. El entrenamiento es preentrenamiento puro de modelado de lenguaje con entropia cruzada (`distillation.teacher_schedule=none`), es decir, sin destilacion ni fases posteriores de RLHF o DPO documentadas.

Los datos provienen de `emozilla/dolma-v1_7-3B`, espejo nativo en HF de Dolma v1.7 muestreado proporcionalmente por componentes de mezcla, servido desde una cache tokenizada preempaquetada (500.000 bloques de entrenamiento y 544 de evaluacion a seq_len=2048). El presupuesto es de 2.000 millones de tokens en 30.517 pasos, con AdamW (lr 3e-5, betas 0.9/0.95, weight decay 0.1), schedule coseno y bf16 sobre GPUs H200. La innovacion relevante no esta en el modelo sino en el diseno experimental: cada miembro de la coleccion solo cambia la semilla, y se publican curvas de perdida cada 25 pasos y metricas de validacion cada 950 pasos. Nota importante de comparabilidad: las semillas 0-3 usan la cache empaquetada (conjunto de evaluacion de 1.113.568 tokens) y las semillas 4-11 hacen streaming en vivo (2.094.081 tokens), por lo que sus `eval_loss` no son directamente comparables entre grupos; esta ejecucion es la semilla 3.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, con contexto maximo de 2048 tokens.
- Modelado de lenguaje y calculo de perplejidad util como referencia en experimentos de trayectoria de pesos.
- Razonamiento basico y continuacion de texto propio de un modelo de 305M preentrenado sin ajuste de instrucciones.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Soporte de tool calling / function calling: no disponible (no se documenta ni se entrena para ello).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre trayectorias de entrenamiento: cargar distintas revisiones `stepN` del mismo run y analizar como evolucionan los pesos y la perdida; el modelo esta disenado exactamente para esto.
- Estudios de variabilidad por semilla: comparar esta ejecucion (seed 3) con las demas semillas de la coleccion manteniendo fijos datos, receta y arquitectura.
- Analisis en espacio de pesos (weight-space): calcular distancias, interpolaciones o similitudes entre checkpoints de un mismo run o entre semillas.
- Reproducibilidad de recetas de preentrenamiento: servir como referencia de un pipeline completo (Dolma empaquetado, AdamW, coseno, bf16) replicable en un solo nodo de GPUs H200.
- Generacion de texto de bajo coste para pruebas de infraestructura: con 305M parametros y contexto 2048 sirve para validar pipelines de inferencia (vLLM, transformers) sin gastar recursos en modelos grandes.
- Docencia y experimentacion: modelo pequeno y con licencia Apache 2.0 para ejercicios de entrenamiento, evaluacion de perplejidad y analisis de curvas de aprendizaje.
- Baseline en investigacion de destilacion o ajuste fino: punto de partida controlado para medir el efecto de tecnicas posteriores sobre una base conocida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye curvas de perdida (`training_loss.csv`, `eval_metrics.csv` con `eval_loss`, `eval_perplexity`, `eval_accuracy` y `eval_bits_per_token`) y metadatos de la ejecucion, sin cifras de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM para inferencia en bf16: aproximadamente 0,61 GB solo para pesos (305M x 2 bytes); en la practica, 1-2 GB contando cache KV y overhead del runtime.
- VRAM en fp32: aproximadamente 1,22 GB para pesos.
- Cuantizacion: no se publican versiones GGUF ni cuantizadas; podria convertirse a 8 o 4 bits con herramientas externas, pero no esta soportado oficialmente.
- GPU recomendadas: cualquier GPU consumer moderna sirve (RTX 3060 12 GB, RTX 4070, RTX 4090); tambien A100/H100/H200 para lotes grandes, aunque el modelo es muy pequeno para ellas.
- Cabe holgadamente en GPU consumer, incluidas las de 8 GB.
- Despliegue: `transformers` es la via documentada (cargar pesos de una revision `stepN` y el tokenizer de `main` o de `allenai/OLMo-2-0425-1B`); vLLM, llama.cpp, Ollama o TGI no estan documentados para este modelo.
- Latencia y throughput: no disponibles. El autor reporta `tokens_per_sec` y `flops_total` en `training_loss.csv`, pero son metricas de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed3 | ~305M | 2048 | Dolma v1.7 (2B tokens) | Apache 2.0 | Analisis de trayectorias de entrenamiento |
| jjalora/diet-traj-pythia-410m-* (coleccion DIET) | ~410M | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Analisis de trayectorias de entrenamiento (arquitectura Pythia) |
| allenai/OLMo-2-0425-1B | ~1B | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Modelo OLMo2 publicado por AI2, usable como tokenizer de referencia |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada; la comparacion se limita a tamano, licencia y proposito.

## Limitaciones y advertencias

- Modelo de investigacion: no esta ajustado a instrucciones ni alineado; las respuestas pueden ser incoherentes o divagatorias en uso conversacional.
- Riesgo alto de alucinacion y de generar contenido factualmente incorrecto, propio de un preentrenamiento puro de 305M parametros.
- Solo ingles; sin capacidades multilingues documentadas.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos heredados de Dolma v1.7 (corpus web y de dominio publico), no mitigados mediante RLHF ni filtrado posterior documentado.
- Comparabilidad de metricas: las semillas 0-3 usan un conjunto de evaluacion distinto al de las semillas 4-11; no mezclar `eval_loss` entre grupos.
- El repositorio ocupa 372,3 GB por acumular checkpoints en ramas `stepN`; descargar una sola revision, no el repo completo.
- El tokenizer no esta en las ramas `stepN`; hay que cargarlo desde `main` o desde `allenai/OLMo-2-0425-1B`.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no esta preparado para produccion; cualquier uso real requeriria ajuste fino y evaluacion propios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed3
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Coleccion relacionada de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Tokenizer de referencia: https://huggingface.co/allenai/OLMo-2-0425-1B
