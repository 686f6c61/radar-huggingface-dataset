# stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed11

## Resumen

DIET trajectory: OLMo2-medium (seed 11) es un modelo de lenguaje de aproximadamente 305 millones de parámetros entrenado desde cero con la arquitectura OLMo2, publicado por el grupo stanfordasl (Stanford Autonomous Systems Lab) como parte del proyecto de investigación DIET sobre trayectorias en el espacio de pesos. No es un modelo pensado para uso en producción, sino un artefacto de investigación: una de las múltiples ejecuciones de preentrenamiento idénticas en todo salvo la semilla aleatoria, lo que permite estudiar cómo evolucionan los pesos y las representaciones a lo largo del entrenamiento.

El modelo emplea una arquitectura transformer densa de tipo decoder-only con 16 capas, dimensión oculta de 768 y 12 cabezas de atención (sin atención agrupada, dado que `num_key_value_heads` es igual a `num_attention_heads`), con una longitud máxima de posición de 2048 tokens. Se entrenó sobre una muestra de Dolma v1.7 (`emozilla/dolma-v1_7-3B`) con un presupuesto de 2.000 millones de tokens, en un único nodo con GPU H100 y en precisión bf16.

Su relevancia es metodológica: forma parte de una colección que replica el mismo régimen de entrenamiento variando únicamente la semilla, lo que lo convierte en material útil para estudiar variabilidad entre ejecuciones, dinámica de entrenamiento y análisis en el espacio de pesos. Para tareas de inferencia generalista, en cambio, un modelo de este tamaño y con este presupuesto de tokens ofrece capacidades limitadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only densa (OLMo2, `olmo2_medium_dense`) |
| Parametros totales | ~305M |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos |
| Dimension oculta | 768 |
| Dimension intermedia (FFN) | 3072 |
| Numero de capas | 16 |
| Cabezas de atencion | 12 (`num_key_value_heads` = 12) |
| Presupuesto de entrenamiento | 2.000.000.000 tokens (`max_steps` 30517, `save_steps` 100) |
| Dataset | `emozilla/dolma-v1_7-3B` (streamed) |
| Hardware de entrenamiento | H100 (cluster "makau") |
| Tamano del repositorio | 28,1 GB |

## Arquitectura y entrenamiento

La arquitectura sigue la familia OLMo2 en su variante densa de tamano medio: 16 bloques transformer con atencion multi-cabeza completa (12 cabezas de consulta y 12 de clave/valor), dimension oculta de 768 y FFN de 3072, con embeddings posicionales limitados a 2048 tokens. El checkpoint se distribuye como pesos bf16 en safetensors, con ramas `stepN` para la cadencia de checkpoints y `main` reservada para los pesos finales una vez completada la ejecucion.

El entrenamiento es un preentrenamiento puro de modelado de lenguaje con entropia cruzada, sin destilacion (`distillation.teacher_schedule=none`), sin fases de RLHF ni DPO. Se uso AdamW con learning rate 3e-5, betas (0,9; 0,95), weight decay 0,1, scheduler coseno y bf16. Los datos provienen de `emozilla/dolma-v1_7-3B`, un espejo comunitario nativo de Hugging Face de Dolma v1.7 muestreado proporcionalmente entre sus componentes y consumido en streaming (sin pre-empaquetado). La innovacion del artefacto no esta en el modelo en si, sino en su proposito: forma parte de una coleccion de ejecuciones identicas salvo por la semilla (en este caso, seed 11), disenada para analisis de trayectorias en el espacio de pesos, en la linea de la coleccion `jjalora/diet-traj-pythia-410m-*` extendida ahora a OLMo2 sobre Dolma.

## Capacidades

- Generacion de texto autoregresiva basica en ingles, condicionada a un contexto maximo de 2048 tokens.
- Modelado de lenguaje y calculo de perplejidad, su uso principal como artefacto de investigacion.
- Razonamiento de un solo paso y continuacion de texto; sin modo de pensamiento explicito ni capacidades de razonamiento extendido.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Multilingue: limitado a ingles segun la model card.
- Sin capacidades de vision, audio ni modalidades adicionales.
- No se documentan capacidades de codigo o matematicas mas alla de las que emergen de forma implicita del preentrenamiento en Dolma.

## Casos de uso

- Analisis de trayectorias de entrenamiento: comparar este checkpoint (seed 11) con las demas semillas de la coleccion para cuantificar la variabilidad en el espacio de pesos y en las metricas de validacion a lo largo de los pasos.
- Investigacion sobre dinamica de preentrenamiento: usar las ramas `stepN` (cada 100 pasos) para estudiar la evolucion de representaciones internas, espectros de pesos o caracteristicas de activaciones durante el entrenamiento.
- Experimentos de destilacion y dietas de datos: al haberse entrenado con un subconjunto proporcional de Dolma v1.7, sirve como linea base controlada para comparar recetas alternativas de mezcla de datos.
- Reproducibilidad y estudios de semilla: el hecho de que solo cambie la semilla permite aislar el efecto del azar en inicializacion y orden de datos sobre el resultado final.
- Pruebas de infraestructura de entrenamiento: con 305M parametros y 2.000 millones de tokens, es un banco de pruebas asequible para validar pipelines de entrenamiento distribuido, streaming de datasets y checkpoints.
- Evaluacion comparativa de arquitecturas: permite contrastar OLMo2 frente a Pythia u otras arquitecturas en el mismo regimen de datos y presupuesto, al existir colecciones equivalentes en el proyecto.
- Fine-tuning academico de bajo coste: su tamano (~305M) permite ajuste fino en una sola GPU consumer para tareas de investigacion en ingles con contextos cortos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 0,6-0,7 GB solo para pesos (305M parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 2 GB para contextos de 2048 tokens.
- VRAM estimada en cuantizacion de 8 bits: del orden de 0,3-0,4 GB para pesos; en 4 bits, alrededor de 0,15-0,2 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; H100, A100, RTX 4090, RTX 3090 o incluso GPUs de gama media cumplen sobradamente.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna (RTX 3060 en adelante) e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: `transformers` (libreria declarada), y por compatibilidad de arquitectura OLMo2, previsiblemente llama.cpp/Ollama y vLLM, aunque no se documenta soporte explicito en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| DIET trajectory OLMo2-medium (seed 11) | ~305M | 2048 | 2.000M tokens de Dolma v1.7 | Apache 2.0 | Investigacion de trayectorias |
| jjalora/diet-traj-pythia-410m-* (coleccion) | ~410M | 2048 (Pythia) | The Pile (segun coleccion) | Apache 2.0 (Pythia) | Investigacion de trayectorias |
| OLMo2 oficial (variantes mayores) | no disponible en la informacion | no disponible | Dolma | Apache 2.0 | Modelo generalista |
| Pythia-410M | ~410M | 2048 | The Pile | Apache 2.0 | Investigacion de interpretabilidad |

La comparacion con modelos generalistas de tamano similar (por ejemplo, Qwen2.5-0.5B o SmolLM2-360M) no esta disponible en la informacion proporcionada; ademas, las diferencias de presupuesto de tokens y de mezcla de datos harian la comparacion de rendimiento poco significativa sin evaluaciones publicadas.

## Limitaciones y advertencias

- Modelo de investigacion, no ajustado para produccion: no ha pasado por RLHF, DPO ni ajuste de instrucciones, por lo que no sigue instrucciones de forma fiable.
- Riesgo elevado de alucinacion y de generacion incoherente en tareas complejas, dado el reducido presupuesto de entrenamiento (2.000 millones de tokens) y el tamano de 305M parametros.
- Contexto limitado a 2048 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Solo ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Sesgos inheritidos de Dolma v1.7: el corpus web contiene sesgos sociales, culturales y de representacion que el modelo reproducira; no se documenta ninguna mitigacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte, y el modelo no esta destinado a ello.
- El repositorio ocupa 28,1 GB por la acumulacion de checkpoints intermedios en ramas `stepN`; la descarga completa es costosa si solo se necesitan los pesos finales.
- El campo `git_commit` figura como "unknown" en la procedencia, lo que limita la reproducibilidad exacta del codigo de entrenamiento.
- No se documentan evaluaciones de seguridad, sesgo o toxicidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-dense-seed11
- Dataset utilizado: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Repositorio del proyecto DIET (referenciado en la model card): https://github.com/jjalora/diet-lm
- Coleccion relacionada de trayectorias Pythia (referenciada en la model card): https://huggingface.co/jjalora/diet-traj-pythia-410m
- Perfil del autor: https://huggingface.co/stanfordasl
