# yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000

## Resumen

SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000 es un checkpoint intermedio de un modelo de mundo (world model) para robótica desarrollado por el usuario yyuncong, publicado bajo el paraguas del proyecto SyncWorld-dev. Se trata de un modelo de dinámica directa (forward dynamics) que, dado un fotograma ancla de una escena robótica junto con una secuencia de acciones del efector final, predice los 16 fotogramas siguientes en un formato multivista. El modelo está entrenado específicamente sobre el conjunto RoboTwin 2.0 con cámaras de cabeza (RT2H), que combina dos brazos, dos cámaras de cabeza y dos cámaras de muñeca.

El checkpoint corresponde a la actualización 2000 de una ejecución que finalizó en la actualización 20000, por lo que se trata de un estado intermedio y no de un modelo final. Se publica junto a otros dos checkpoints del mismo paso (un selector de contexto aprendido y su control de pesos fijos) para permitir comparaciones controladas en el mismo punto de entrenamiento. La arquitectura es un transformer con atención completa y layout in-context, sin memoria TTT, que condiciona la generación sobre los K fragmentos más recientes de la propia grabación de la consulta (de ahí "recent8"), con K muestreado uniformemente entre 1 y 8.

La relevancia de este modelo reside en su enfoque: en lugar de recuperar contexto de una biblioteca externa, utiliza únicamente el historial inmediato de la propia trayectoria, lo que simplifica el pipeline y sirve como línea base frente a variantes con recuperación. El repositorio ocupa 30,3 GB y la licencia es OpenMDW-1.1, vinculada al proyecto NVIDIA Cosmos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención completa, layout in-context, sin memoria TTT |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | K fragmentos de 16 transiciones (K entre 1 y 8) antes del ancla, más 16 acciones futuras |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de lenguaje) |
| Licencia | OpenMDW-1.1 (license: other) |
| Formato de pesos | no disponible (repo de 30,3 GB; presumiblemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo emplea un transformer con atención completa sobre un layout in-context. Cada consulta consta de un fotograma ancla t0 más sus 16 acciones futuras, y el modelo genera los 16 fotogramas siguientes. Antes de la consulta se sitúan los K fragmentos de 16 transiciones de la propia grabación que terminan en el fotograma t0-1, ordenados del más antiguo al más reciente, como condicionamiento limpio. K se muestrea uniformemente entre 1 y 8, un valor por actualización para los 32 streams. No hay recuperación, ni biblioteca, ni selector, ni embedding de distancia al ancla, por lo que el checkpoint no contiene `router.npz`.

Los fotogramas son tiras de 1536x384 compuestas por tres celdas de 512x384 (4:3): una cámara de cabeza, la muñeca izquierda (`wrist_left_rgb`) y la muñeca derecha (`wrist_right_rgb`). Cada episodio tiene dos cámaras de cabeza (`agentview_rgb`, `agentview_rgb_1`); el entrenamiento elige una de las dos por stream. Cada cámara de 384x384 se recorta a una ventana de 384x288 que se redimensiona a 512x384, con posición vertical muestreada por cámara y stream (cabeza 0,3-0,65; muñecas 0,5-1,0). Se aplica dropout de vista por stream (10 % una cámara, 5 % dos). Las grabaciones se leen a 20,83 Hz y se condicionan a 15 fps. Cada muestra lleva el pie fijo "A robot arm interacts with the scene."; no se leen las instrucciones del release.

El entrenamiento parte solo de pesos de mvA3p en la actualización 20000 (`yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000`), que es recent8 con acciones de pose del efector final realizado, entrenado sobre la mezcla PEWM s7 de datos de un solo brazo. La ejecución es `qctx_incontext_mv_A_recent8_v3s7pose_8gpu_rt2h_4n20k_mva3p20k`, con receta `wm_ttt/retrieval/recipe_qctx_incontext_mv_A_recent8_v3s7pose_8gpu.toml`, lanzada con `mast/launch_wm_ttt_mast.sh --variant mvA3p --data mv_strip_rt2h_v1`. Se usaron 4 nodos x 8 H100. La tasa de aprendizaje es 5e-5 tras un warm-up de 100 actualizaciones, luego constante. El presupuesto total es de 20000 actualizaciones del generador; este checkpoint es la actualización 2000. No hay iteraciones de etiquetado, por lo que iteración 2000 equivale a actualización 2000.

## Capacidades

- Predicción de dinámica directa: dado un ancla y 16 acciones del efector final, genera los 16 fotogramas siguientes de la escena.
- Generación multivista: produce tiras de tres cámaras (cabeza, muñeca izquierda, muñeca derecha) en un único fotograma de 1536x384.
- Condicionamiento in-context sobre historial reciente: usa hasta K=8 fragmentos de 16 transiciones de la propia grabación previos al ancla.
- Manejo de acciones de pose del efector final realizado (realized end-effector pose actions).
- Robustez a dropout de vista (una o dos cámaras en negro) durante el entrenamiento.
- No soporta tool calling, function calling ni agentes multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de modo thinking, visión general o audio.
- Capacidad específica de robótica bimanual con dos cámaras de cabeza y dos de muñeca.

## Casos de uso

- Planificación de trayectorias bimanuales en simulación: el modelo predice los fotogramas resultantes de una secuencia de acciones del efector final, lo que permite evaluar candidatos de trayectoria antes de ejecutarlos en el simulador RoboTwin 2.0.
- Aumento de datos para entrenamiento de políticas: generar rollouts sintéticos de 16 pasos condicionados en el historial reciente de una demostración, ampliando la cobertura de estados para el aprendizaje por imitación.
- Línea base de investigación en world models: al ser la variante sin recuperación (recent8), sirve como referencia controlada para medir la contribución de selectores de contexto aprendidos en las variantes hermanas.
- Evaluación de controladores en entornos bimanuales: comparar la predicción del modelo con la observación real para detectar desviaciones y calibrar controladores de bajo nivel.
- Estudio de robustez ante fallos de cámara: gracias al dropout de vista, permite analizar cómo degrada la predicción cuando una o dos cámaras no están disponibles.
- Investigación sobre condicionamiento in-context en robótica: analizar el efecto del número de fragmentos de contexto K (1 a 8) en la calidad de la predicción de dinámica.
- Prototipado de mundos simulados para RL: usar el modelo como entorno aprendido para entrenar políticas con recompensas basadas en la predicción de estados futuros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el repo ocupa 30,3 GB, pero no se especifica el tamaño de los pesos ni la cuantización).
- GPU de entrenamiento documentadas: 4 nodos x 8 H100 para esta ejecución (las variantes con recuperación usaron 4 nodos x 8 B200).
- GPU recomendadas para inferencia: no disponible; por el tamaño del repo, se requiere al menos una GPU de datacenter con memoria suficiente para cargar los pesos, pero no se confirma.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible (no se documenta vLLM, llama.cpp, Ollama ni TGI; es un modelo de robótica, no de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000 (este) | no disponible | K fragmentos (1-8) x 16 transiciones | OpenMDW-1.1 | Línea base sin recuperación, update 2000, 4x8 H100 |
| SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000 | no disponible | K fragmentos con selector aprendido v2 | OpenMDW-1.1 | Con recuperación y selector v2, 4x8 B200 |
| SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000 | no disponible | K fragmentos con selector fijo de pesos iguales | OpenMDW-1.1 | Control de pesos fijos, 4x8 B200 |
| SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000 | no disponible | recent8 sobre PEWM s7 (un brazo) | OpenMDW-1.1 | Punto de partida de pesos de este checkpoint |

No se dispone de información sobre otros modelos de mundo robóticos comparables en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde a la actualización 2000 de una ejecución que terminó en la 20000, por lo que su rendimiento es inferior al del modelo final.
- Entrenado exclusivamente sobre RoboTwin 2.0 con cámaras de cabeza (RT2H); no se garantiza generalización a otros robots, entornos o configuraciones de cámara.
- Sin recuperación de contexto: solo usa los fragmentos recientes de la propia grabación, lo que limita la diversidad de condicionamiento frente a variantes con biblioteca.
- Sin embedding de distancia al ancla, a diferencia de las variantes con recuperación.
- Pie de foto fijo ("A robot arm interacts with the scene."): no procesa instrucciones en lenguaje natural del release.
- Posibles sesgos derivados de los datos de demostración y rollouts contrafactuales del conjunto RoboTwin 2.0, no documentados.
- Riesgo de alucinación visual: como modelo generativo de fotogramas, puede producir predicciones plausibles pero incorrectas físicamente.
- Licencia OpenMDW-1.1: es necesario revisar los términos del enlace de licencia (NVIDIA Cosmos) para uso comercial; la model card la etiqueta como "other".
- Sin datos de benchmarks publicados, por lo que no se puede evaluar su calidad de forma objetiva.
- No es un modelo de lenguaje: no soporta tool calling, agentes ni capacidades multilingües.

## Enlaces

- Hugging Face: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-rt2h-from20k-step2000
- Checkpoint de partida (mvA3p): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-recent8-s7pose-from20k-step20000
- Variante con selector v2: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-selv2-rt2h-from20k-step2000
- Variante con selector de pesos iguales: https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-equalw-rt2h-from20k-step2000
- Checkpoint de partida de las variantes con recuperación (mvSV3p): https://huggingface.co/yyuncong/SyncWorld-mv3-strip384-views-first-s7pose-from20k-step20000
- Licencia OpenMDW-1.1 (NVIDIA Cosmos): https://github.com/NVIDIA/Cosmos/blob/main/LICENSE
