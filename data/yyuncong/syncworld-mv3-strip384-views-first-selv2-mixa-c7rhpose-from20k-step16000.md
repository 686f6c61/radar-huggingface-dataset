# yyuncong/SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000

## Resumen

SyncWorld es un modelo de mundo (world model) orientado a robótica que aprende dinámica directa (forward dynamics) a partir de observaciones multivista y acciones de efector final. Lo desarrolla el usuario yyuncong y se distribuye bajo licencia OpenMDW-1.1, la licencia asociada al proyecto NVIDIA Cosmos. El checkpoint aquí descrito corresponde al modelo `SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000`, una instantánea intermedia de un entrenamiento todavía en curso.

La propuesta técnica central es el uso de condicionamiento en contexto (in-context) mediante recuperación de fragmentos de vídeo: dado un par observación-acción, el modelo selecciona K fragmentos de contexto de una biblioteca y predice el siguiente estado. La selección de esos fragmentos la realiza un scorer lineal aprendido ("selector v2") que se reentrena periódicamente durante el propio entrenamiento del generador. Esta versión incorpora además una mezcla de datos ("Mix A") con mayor peso de datos reales de robot (55 % real frente a 45 % simulación).

El modelo se encuentra en la iteración 16000 de linaje (8000 del fork sobre el checkpoint previo `step8000`), con unos 15 744 updates de generador de los 20 000 previstos. Es un checkpoint intermedio: no está pensado para uso en producción tal cual, sino como material de investigación para evaluar el método de selección de contexto y la mezcla de datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de mundo generativo con atención a contexto multivista; arquitectura base no detallada en la model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | K fragmentos de contexto, K uniforme en 1..8, más el fragmento de consulta anclado |
| Tipos de cuantizacion | no disponible (pesos en bf16) |
| Idiomas soportados | no disponible (modelo orientado a robótica, no a texto) |
| Licencia | OpenMDW-1.1 (referenciada como `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | checkpoint DCP del trainer convertido a bf16 en `model/`; `config.pkl` con la configuración del trainer; `router.npz` con el selector |
| Tamano del repo | 30,4 GB |
| Camaras | 3 vistas en formato "strip384" (384 píxeles de tira) |
| Acciones | pose del efector final realizada (realized end-effector pose actions, "c7rhpose") |

## Arquitectura y entrenamiento

El modelo es un world model de dinámica directa que opera sobre ventanas de vídeo multivista (tres cámaras, "strip384") y acciones de pose del efector final. El condicionamiento se construye con una biblioteca de fragmentos (`mv_strip_v4c7_s4_views_sib_grip_anch_wrist`) de la que se extraen K trozos: el fragmento inmediatamente anterior al ancla de la propia grabación de la consulta, más K-1 fragmentos elegidos por el selector. El layout de frames y la función de pérdida siguen el diseño de mvSV3p.

El entrenamiento parte del checkpoint `mvSV3p` en el update 20 000, pasa por `selv2-c7rhpose-from20k-step8000` (fork iteration 8000, que corresponde a linaje 16 000) y continúa sobre la mezcla "Mix A". Esta mezcla combina ventanas etiquetadas de DROID (C7RH) al 20 %, episodios DROID sin etiquetar (`droid_2cam_wide`, excluyendo split de validación) al 35 %, ventanas de simulación s7 (rcrm 19 %, col 8 %, ic5 5 %, ic4 2 %, ic 2 %) y RLBench al 9 %: en total 55 % robot real y 45 % simulación. El entrenamiento se ejecutó en 4 nodos de 8 GPU B200 (32 GPU en total) con el lanzador `wm_ttt/handoff/selector_v2_launch.sh`.

La innovación principal es el **selector v2**: un scorer lineal sobre 15 características por fragmento (7 similitudes con la consulta —4 de acción, pose, imagen y muñeca—, flag de propia grabación, gap logarítmico al ancla, flag de pertenencia a reglas, rank de regla negado y rank en el pool, y relaciones de hermano de episodio, misma sesión y misma tarea). La puntuación es `((x - v2_mean) / v2_scale) · v2_theta`. Cada 508 iteraciones, 8 son iteraciones de etiquetado que miden la pérdida del generador con 8 fragmentos candidatos y con subconjuntos aleatorios de la mitad; mínimos cuadrados no negativos convierten esas pérdidas en valores por fragmento que alimentan un pool persistente, y un ajuste logístico por pares ponderado por valor produce la siguiente versión del scorer. El checkpoint contiene la versión 16 del fork.

## Capacidades

- Predicción de dinámica directa: dado un estado observado (frames de tres cámaras) y una acción de pose del efector final, genera el estado siguiente.
- Condicionamiento en contexto mediante recuperación: selecciona hasta 8 fragmentos de contexto histórico para acondicionar la predicción.
- Selección de contexto aprendida en línea: el scorer se reajusta durante el entrenamiento con las pérdidas medidas del propio generador.
- Modelado multivista: procesa tres cámaras simultáneamente con layout "strip384".
- Mezcla de datos reales y simulados: entrena con episodios DROID reales y ventanas de simulación (s7, RLBench).
- No se documentan capacidades de texto, tool calling, agentes, visión general, audio ni multilingüismo: el modelo está especializado en robótica.

## Casos de uso

- Investigación en world models para robótica: replicar el pipeline de recuperación en contexto y el selector v2 sobre el checkpoint intermedio para estudiar cómo evoluciona la selección de fragmentos con el entrenamiento.
- Evaluación comparativa de mezclas de datos: comparar este checkpoint (Mix A) contra el control de pesos iguales `SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step16000` en un conjunto de evaluación fijo, para medir el efecto de aumentar el peso de robot real sin etiquetar.
- Planificación basada en modelo en entornos simulados: usar el modelo como dinámica aprendida dentro de un bucle de planificación o de model-predictive control sobre tareas RLBench o s7.
- Estudio de retrieval de contexto: analizar el efecto de K (especialmente K=2 a 4, donde el selector importa más según la model card) sobre la calidad de las predicciones.
- Preentrenamiento de políticas con datos aumentados: generar rollouts sintéticos condicionados por contexto recuperado para aumentar el conjunto de entrenamiento de un policy learner.
- Benchmark de forward dynamics en manipulación con DROID: evaluar la pérdida de predicción sobre ventanas DROID etiquetadas como referencia de calidad del modelo de mundo.
- Docencia y divulgación: ejemplo reproducible de entrenamiento con selección de contexto aprendida y reentrenamiento del scorer en línea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta la pérdida de entrenamiento (`train@2/loss`, media sobre updates de generador entre las 500 iteraciones previas a cada marca, excluyendo iteraciones de etiquetado):

| fork iteration | 1000 | 2000 | 4000 | 8000 |
|---|---|---|---|---|
| lineage iteration | 9000 | 10000 | 12000 | 16000 |
| loss | 0,0817 | 0,0810 | 0,0804 | 0,0805 |

El autor advierte explícitamente que la pérdida de Mix A no es comparable con la del run padre ni con el control, porque Mix A muestrea más episodios DROID sin etiquetar y repite menos las ventanas etiquetadas; la comparación debe hacerse sobre una evaluación fija held-out.

## Requisitos de hardware

- VRAM estimada: no disponible. El repo pesa 30,4 GB y los pesos están en bf16; como referencia, cargar el checkpoint completo en bf16 requiere del orden de 30 GB de memoria, más los buffers de activación e inferencia.
- GPU recomendadas: el entrenamiento se realizó en 4 nodos de 8 GPU NVIDIA B200 (32 GPU). Para inferencia no se especifican requisitos mínimos.
- ¿Cabe en GPU de consumo? No hay datos publicados. Con 30,4 GB en bf16, una RTX 4090 (24 GB) no podría cargar los pesos completos sin cuantización, y no se documentan variantes GGUF u otras cuantizaciones.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI. El repo usa el formato DCP del trainer y `config.pkl`, por lo que el despliegue requiere el código del proyecto `wm_ttt` (`wm_ttt/handoff/selector_eval_theta.py` para exportar el scorer).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Mezcla de datos | Licencia | Estado |
|---|---|---|---|---|---|
| SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000 (este) | no disponible | K 1..8 fragmentos | Mix A (55 % real / 45 % sim), selector v2 | OpenMDW-1.1 | Checkpoint intermedio, linaje 16000 |
| SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000 (padre) | no disponible | K 1..8 fragmentos | C7RH+ (42 % real / 58 % sim), selector v2 | OpenMDW-1.1 | Checkpoint intermedio, linaje 8000 |
| SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step16000 (control) | no disponible | K fijo (pesos iguales) | C7RH+ durante todo el entrenamiento | OpenMDW-1.1 | Control de pesos iguales, arranca de strip384 iter 47000 |
| SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000 (mvSV3p, ancestro) | no disponible | K 1..8 fragmentos | no detallada | OpenMDW-1.1 | Update 20000, base de la línea |

No se dispone de comparación con modelos de mundo externos (por ejemplo, Cosmos, Genie o similares) en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: el entrenamiento continúa (fork iteration 8000 de 12328; linaje 16000 de 20328), por lo que el modelo no está finalizado y su rendimiento puede no representar el del modelo completo.
- La pérdida de entrenamiento de Mix A está inflada por construcción respecto a la del padre y el control; no debe usarse para comparar modelos sin una evaluación held-out fija.
- El selector solo cambia qué fragmentos ocupan las ranuras, por lo que su efecto es mayor con K pequeño (2 a 4) y prácticamente nulo con K alto.
- Para evaluar el modelo como método de selección es imprescindible usar `router.npz`; `config.pkl` por sí solo reconstruye únicamente la versión 0 del scorer.
- Licencia OpenMDW-1.1: es necesario revisar los términos del enlace de licencia de NVIDIA Cosmos antes de cualquier uso comercial; la model card la marca como `license: other`.
- Sin información sobre sesgos, alucinación, limitaciones de idioma o robustez fuera de distribución en robótica; al ser un modelo de dinámica, los errores se manifiestan como predicciones de estado plausibles pero incorrectas.
- Sin datos de benchmarks ni de latencia/throughput, lo que impide estimar su viabilidad en producción.
- El despliegue requiere el código del trainer (`wm_ttt`), no distribuido como paquete estándar; no hay integración documentada con frameworks de inferencia convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-mixa-c7rhpose-from20k-step16000
- Checkpoint padre (fork iteration 8000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-c7rhpose-from20k-step8000
- Ancestro mvSV3p (update 20000): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Control de pesos iguales: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-c7rhpose-from-s384-47k-step16000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
