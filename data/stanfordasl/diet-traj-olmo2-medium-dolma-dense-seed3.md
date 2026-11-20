# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed3

## Resumen

`diet-traj-olmo2-medium-dolma-dense-seed3` es un checkpoint de preentrenamiento desde cero con arquitectura OLMo2, publicado por el grupo stanfordasl dentro del proyecto DIET (weight-space). No es un modelo pensado para uso como asistente: es una trayectoria de entrenamiento completa, es decir, una secuencia de checkpoints intermedios y finales de un mismo run, cuya finalidad es el análisis de la evolución de los pesos y de la dinámica de entrenamiento.

El modelo emplea una configuración densa de OLMo2 con 768 dimensiones ocultas, 16 capas, 12 cabezas de atención (12 de key/value, sin GQA), FFN de 3072 y una longitud máxima de posición de 2048 tokens, lo que arroja aproximadamente 305 millones de parámetros. Se entrenó sobre el subconjunto `emozilla/dolma-v1_7-3B` de Dolma v1.7, consumido en streaming, con un presupuesto de 2.000 millones de tokens y semilla 3.

Su relevancia es metodológica: al existir runs idénticos salvo por la semilla, la colección permite estudiar variabilidad entre semillas, dietas de datos y trayectorias en el espacio de pesos. La licencia Apache 2.0 y el formato bf16 safetensors facilitan su reutilización en experimentos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | OLMo2 densa (transformer decoder-only), config `olmo2_medium_dense` |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN`, finales en `main` |

## Arquitectura y entrenamiento

Transformer decoder-only de la familia OLMo2 con `hidden_size=768`, `intermediate_size=3072`, `num_hidden_layers=16`, `num_attention_heads=12` y `num_key_value_heads=12` (atención multi-cabeza completa, sin grouped-query attention), `max_position_embeddings=2048`. El total ronda los 305M de parámetros.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropía cruzada (`distillation.teacher_schedule=none` en `src/run_distillation.py`), sin destilación ni fases posteriores de alineamiento (no hay RLHF ni DPO). Receta: AdamW con lr=3e-5, betas (0.9, 0.95), weight decay 0.1, scheduler coseno y precisión bf16. Datos: `emozilla/dolma-v1_7-3B`, espejo nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (no pre-empaquetado). Presupuesto: 2.000.000.000 tokens, `max_steps=30517`, `save_steps=100`, semilla 3, ejecutado en GPUs H200 (cluster "fran", job 683692, commit 81e3d16). La única diferencia entre los runs de la colección es la semilla.

## Capacidades

- Generación de texto autoregresiva y modelado de lenguaje causal (objetivo nativo de entrenamiento).
- Razonamiento básico y continuación de texto en inglés, limitado por su escala (~305M) y por los 2.000M de tokens vistos.
- No dispone de tool calling ni function calling: no se ha entrenado para ello.
- No soporta agentes ni razonamiento multi-paso de forma fiable; no hay post-entrenamiento instructivo.
- Capacidades multilingües muy limitadas: el corpus y la etiqueta de idioma son únicamente `en`.
- No tiene visión, audio, modo thinking ni capacidades multimodales.
- Utilidad principal como objeto de estudio: checkpoints intermedios para análisis de trayectorias en el espacio de pesos y comparación entre semillas.

## Casos de uso

- Análisis de trayectorias de entrenamiento: cargar las ramas `stepN` para medir distancias en el espacio de pesos, rotaciones de representaciones o cambios de pérdida a lo largo de los 30517 pasos.
- Estudios de variabilidad entre semillas: comparar este run (seed 3) con los demás de la colección, que comparten receta y datos, para cuantificar la varianza atribuible a la inicialización y al orden de los datos.
- Investigación sobre dietas de datos: usar el modelo como línea base de referencia para evaluar el efecto de subconjuntos o mezclas alternativas de Dolma sobre un mismo presupuesto de tokens.
- Experimentos de destilación: al ser un modelo pequeño con receta limpia, sirve como alumno o profesor auxiliar en pipelines de destilación.
- Pruebas de infraestructura y tooling: validar pipelines de carga con `transformers`, conversión a otros formatos o integración en frameworks de entrenamiento con un checkpoint ligero.
- Reproducibilidad y auditoría: el `run.json` documenta cluster, GPU, commit y pasos, lo que permite reproducir o auditar el experimento de forma exacta.
- Fine-tuning académico de bajo coste: ajustar la cabeza LM para tareas de clasificación o generación en inglés con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 0,6-0,7 GB solo para pesos, más caché KV y activaciones; en la práctica cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna; para entrenamiento o análisis de trayectorias se documenta el uso de NVIDIA H200, pero para inferencia basta una RTX 3060, RTX 4090 o similar.
- Cabe en GPU de consumo: sí, en todas las GPU consumer actuales con al menos 4 GB de VRAM.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente `vLLM`, `llama.cpp`/GGUF u Ollama tras conversión, aunque no se documenta soporte oficial para estos formatos.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Enfoque |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-dense-seed3 | ~305M | 2048 | Dolma v1.7 (2.000M tokens) | Apache 2.0 | Trayectoria de investigación |
| jjalora/diet-traj-pythia-410m-* | ~410M | no disponible | no disponible | no disponible | Trayectoria de investigación (Pythia) |
| OLMo2 oficial (variantes mayores) | no disponible | no disponible | Dolma | Apache 2.0 | Modelo base de producción |
| Pythia 410M | 410M | 2048 | The Pile | Apache 2.0 | Suite de investigación con checkpoints |

La comparación directa con modelos de propósito general de tamaño similar no resulta informativa: este checkpoint no está post-entrenado y su valor reside en la colección de checkpoints y en la reproducibilidad del run, no en métricas de calidad.

## Limitaciones y advertencias

- No es un modelo instructivo ni un asistente: no ha recibido RLHF, DPO ni ajuste de instrucciones, por lo que las respuestas pueden ser incoherentes o divagatorias.
- Riesgo elevado de alucinación y de generar contenido factualmente incorrecto, agravado por el tamaño reducido y el presupuesto limitado de tokens.
- Sesgos heredados de Dolma v1.7 (fuentes web y corpus diversos), sin filtrado ni mitigación posterior documentada.
- Contexto limitado a 2048 tokens y competencia lingüística restringida al inglés.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción; su uso comercial requeriría un fine-tuning sustancial y evaluación propia.
- El nombre del repositorio incluye `dense`, pero el autor documenta un espejo de datos en caché empaquetada (`packed cache`) en `run.json` frente al streaming descrito en la model card; conviene verificar la procedencia exacta antes de comparar runs.
- Los checkpoints son solo pesos, sin tokenizador ni configuración de generación empaquetados de forma explícita; hay que reconstruirlos desde la configuración de OLMo2.

## Enlaces

- Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed3
- Repositorio del proyecto DIET: https://github.com/jjalora/diet-lm (referenciado en la model card)
- Colección de trayectorias Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m-410m (referencia citada; verificar ruta exacta)
- Dataset Dolma v1.7 (espejo HF): https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Paper de OLMo2: no disponible en la información proporcionada
- Blog o demo: no disponible en la información proporcionada
