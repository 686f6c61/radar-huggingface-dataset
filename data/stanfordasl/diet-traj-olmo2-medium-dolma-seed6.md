# stanfordasl/diet-traj-olmo2-medium-dolma-seed6

## Resumen

`stanfordasl/diet-traj-olmo2-medium-dolma-seed6` es un checkpoint de un entrenamiento desde cero de un modelo denso de la arquitectura OLMo2 con aproximadamente 305 millones de parametros, publicado por el grupo `stanfordasl` dentro del proyecto DIET de analisis en el espacio de pesos (weight-space). No es un modelo pensado para uso en produccion, sino una pieza de un conjunto de trayectorias de entrenamiento cuya finalidad es estudiar como evolucionan los pesos y las capacidades del modelo a lo largo del preentrenamiento, en la linea del trabajo previo con la familia Pythia.

El modelo se entrena con un objetivo puramente de modelado de lenguaje (cross-entropy, sin destilacion ni fases posteriores de alineamiento) sobre `emozilla/dolma-v1_7-3B`, un espejo en HuggingFace del corpus Dolma v1.7 muestreado proporcionalmente segun sus componentes. La unica variable que cambia entre las ejecuciones de la coleccion es la semilla aleatoria, lo que permite comparar trayectorias bajo condiciones controladas.

Su relevancia es metodologica: ofrece checkpoints intermedios (ramas `stepN`) en safetensors bf16 que permiten analizar dinamica de entrenamiento, emergencia de capacidades y geometria del espacio de pesos. La ventana de contexto es de 2048 tokens y el modelo solo declara soporte de ingles. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso OLMo2 (16 capas, hidden_size 768, intermediate_size 3072, 12 cabezas de atencion, 12 cabezas KV) |
| Parametros totales | 305.185.536 (~305 M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (`max_position_embeddings=2048`) |
| Tipos de cuantizacion | No disponible (los pesos publicados son bf16 safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), solo pesos; checkpoints en ramas `stepN` |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura OLMo2 en su variante densa definida en `configs/model/olmo2_medium_dense.yaml` del repositorio `jjalora/diet-lm`: 16 capas, dimension oculta de 768, dimension intermedia de 3072, 12 cabezas de atencion con 12 cabezas de clave-valor (atencion multi-cabeza sin comparticion KV) y una longitud maxima de posiciones de 2048. El total de parametros ronda los 305 millones.

El entrenamiento es un preentrenamiento clasico de modelado de lenguaje con entropia cruzada, sin profesor de destilacion (`distillation.teacher_schedule=none`), usando AdamW con learning rate 3e-5, betas (0.9, 0.95), weight decay 0.1, schedule coseno y precision bf16. Los datos proceden de `emozilla/dolma-v1_7-3B`, consumidos en streaming (sin pre-empaquetado), con un presupuesto de 2.000 millones de tokens, 30.517 pasos maximos y guardado cada 950 pasos. La ejecucion se realizo en GPUs H100 (cluster `makau`, job 9499) con semilla 6. La innovacion no esta en el modelo sino en el protocolo: multiples ejecuciones identicas salvo por la semilla, con checkpoints intermedios, para analisis de trayectorias en el espacio de pesos.

## Capacidades

- Generacion de texto autoregresiva en ingles, con calidad propia de un modelo de ~305 M entrenado con 2.000 millones de tokens (muy por debajo de lo que se considera compute-optimal para ese tamano).
- Razonamiento basico y continuacion de texto; sin fases de instruccion, RLHF o DPO, por lo que no sigue instrucciones de forma fiable.
- Capacidad limitada de codigo y matematicas, no evaluada en la informacion disponible.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso estructurado.
- Sin vision ni audio.
- Multilingue: no; solo ingles declarado.
- Valor principal: checkpoints intermedios utilizables para analisis de trayectorias, no como asistente.

## Casos de uso

- Investigacion de dinamica de entrenamiento: comparar los checkpoints `stepN` de esta semilla con los de otras semillas de la coleccion para medir variabilidad en la evolucion de los pesos y de la perdida.
- Analisis en el espacio de pesos: estudiar interpolacion lineal, permutacion de neuronas o alineamiento de representaciones entre checkpoints de la misma trayectoria.
- Estudios de emergencia de capacidades: evaluar tareas sinteticas (concordancia, copia, aritmetica simple) a lo largo de los pasos de guardado para localizar transiciones.
- Reproducibilidad y control de semilla: usar la semilla 6 como referencia frente a las demas ejecuciones del proyecto DIET para cuantificar el ruido entre semillas en un mismo recetario.
- Baseline de arquitectura OLMo2 a pequena escala: servir de punto de partida controlado para experimentos de destilacion o cambios de receta, dado que el pipeline `diet-lm` esta publicado.
- Pruebas de infraestructura de entrenamiento e inferencia: por su tamano, cabe en una sola GPU y permite validar pipelines de streaming de datos, guardado de checkpoints y evaluacion sin coste elevado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,7 GB en bf16/fp16 (unos 610 MB de pesos) mas cache KV; en torno a 0,4 GB si se cuantiza a int8 y 0,2 GB a int4 (cuantizacion no publicada, requeriria conversion propia).
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; H100 fue la GPU de entrenamiento, pero para inferencia es sobredimensionada.
- Cabe en GPU de consumo: si, en practicamente todas las RTX recientes (3060, 4060, 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` de forma nativa; conversion a GGUF para `llama.cpp`/`Ollama` o a formatos de `vLLM`/`TGI` es posible pero no esta documentada por el autor.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera throughput alto en una sola GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Datos de entrenamiento | Licencia | Proposito |
|---|---|---|---|---|---|
| diet-traj-olmo2-medium-dolma-seed6 | ~305 M | 2048 | Dolma v1.7, 2.000 M tokens | Apache 2.0 | Analisis de trayectorias |
| jjalora/diet-traj-pythia-410m-* | ~410 M | 2048 (Pythia) | The Pile | Apache 2.0 | Analisis de trayectorias |
| OLMo2 oficial (variantes mayores) | No disponible para variante ~305 M | No disponible | Dolma | Apache 2.0 | Modelo de proposito general |

La comparacion con modelos de proposito general no es directa: este checkpoint esta optimizado para reproducibilidad y analisis, no para calidad de generacion. No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineamiento: no sigue instrucciones, no tiene filtros de seguridad y puede generar contenido inapropiado o factualmente incorrecto.
- Riesgo alto de alucinacion en cualquier tarea de conocimiento, dado el bajo presupuesto de entrenamiento (2.000 M tokens) y el tamano reducido.
- Ventana de contexto limitada a 2048 tokens; sin soporte documentado de extension.
- Solo ingles; el rendimiento en castellano no esta evaluado y previsiblemente sera pobre.
- Entrenado sobre un subconjunto de 3B del espejo de Dolma, no sobre el corpus completo, por lo que la cobertura tematica es parcial.
- No apto para produccion ni para uso comercial como asistente; la licencia Apache 2.0 lo permite legalmente, pero la calidad no lo justifica.
- Los checkpoints intermedios son solo pesos (`weights only`); requieren la configuracion y el tokenizador del repositorio para cargarse.
- El campo `git_commit` del `run.json` figura como `unknown`, lo que limita la trazabilidad exacta del codigo usado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stanfordasl/diet-traj-olmo2-medium-dolma-seed6
- Repositorio del proyecto DIET (codigo y configuraciones): https://github.com/jjalora/diet-lm (referenciado en la model card)
- Dataset de entrenamiento: https://huggingface.co/datasets/emozilla/dolma-v1_7-3B
- Coleccion de referencia Pythia: https://huggingface.co/jjalora/diet-traj-pythia-410m (referenciada en la model card)
