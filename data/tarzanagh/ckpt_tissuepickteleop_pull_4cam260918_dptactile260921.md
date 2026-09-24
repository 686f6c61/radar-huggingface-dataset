# tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921

## Resumen

Este repositorio contiene un checkpoint de una política robótica visomotora basada en Diffusion Policy con entrada táctil (de ahí el sufijo `dptactile`), entrenada para una tarea bimanual de manipulación diestra: sostener una caja de pañuelos con la mano izquierda y extraer un pañuelo con la derecha. El sistema se ejecuta sobre un robot DexMate Vega-1 equipado con dos manos RobotEra XHand1, y los datos de entrenamiento se recogieron por teleoperación con meta-guante (sin exoesqueleto) y seguimiento de muñeca con Vive. Lo desarrolla el usuario `tarzanagh` y se publica bajo licencia Apache 2.0.

El modelo tiene 268.343.590 parámetros (unos 268 M), lo que lo sitúa en el rango de las políticas de imitación compactas en lugar de los grandes modelos fundacionales de robótica. Predice chunks de acciones: observa el estado real cada 16 pasos y genera un bloque de acciones, conservando las 16 primeras. El estado y la acción son vectores de 38-D de posiciones articulares `[L_arm 7 | L_hand 12 | R_arm 7 | R_hand 12]`, a los que se concatenan 30-D de fuerza en las puntas de los dedos (5 dedos × 3 ejes por mano) para dar una entrada de estado de 68-D. La percepción combina 4 cámaras RGB a 640×360 y 30 fps.

Su relevancia es doble: por un lado, es uno de los 24 checkpoints publicados por el mismo autor para esta misma tarea, lo que permite comparar familias de políticas (ACT, DP, GR00T y pi0, con y sin táctil) bajo condiciones controladas; por otro, sus resultados sugieren que la señal táctil no aporta mejora medible sobre el ruido en este conjunto de tareas, un hallazgo útil para quien planifique sensórica en manipulación diestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visomotora generativa por difusión); backbone del denoiser no especificado en la model card |
| Parametros totales | 268.343.590 (~268 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; horizonte de predicción por chunks de 16 acciones (reobservación cada 16 pasos) |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors, presumiblemente fp32 dado el tamaño del repo (~1,1 GB para 268 M de parámetros) |
| Idiomas soportados | no disponible / no aplica (no es un modelo de lenguaje; no procesa lenguaje natural) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Se trata de una Diffusion Policy, es decir, una política que modela la distribución de secuencias de acciones mediante un proceso de difusión condicionado por observaciones. La model card no detalla el backbone del denoiser ni la arquitectura concreta del codificador visual, por lo que esos extremos quedan como no disponibles. La entrada de estado es un vector de 68-D que combina 38-D de posiciones articulares (7 del brazo izquierdo, 12 de la mano izquierda, 7 del brazo derecho y 12 de la mano derecha) con 30-D de fuerza en las puntas de los dedos (5 dedos × 3 ejes por mano). La percepción usa 4 cámaras RGB a 640×360 y 30 fps.

Los datos proceden de teleoperación con meta-guante y seguimiento de muñeca con Vive, y suman 120 episodios, de los cuales 108 se usan para entrenamiento y 12 se reservan como conjunto de validación (se retiene cada décimo episodio). El entrenamiento se realizó durante 10.000 pasos con semilla 1000. No se menciona en la información disponible el uso de RLHF, DPO ni otros esquemas de ajuste por preferencias, algo por otra parte poco habitual en políticas de imitación robótica.

## Capacidades

- Manipulación bimanual coordinada: sostener un objeto con una mano mientras la otra ejecuta una acción sobre él (en este caso, estabilizar la caja de pañuelos con la izquierda y extraer el pañuelo con la derecha).
- Manipulación diestra con manos XHand1 de 12 grados de libertad por mano, con control articular fino.
- Percepción multimodal: 4 flujos RGB simultáneos más señal táctil de fuerza en las puntas de los dedos.
- Predicción de chunks de acción: genera bloques de 16 acciones y los ejecuta con reobservación periódica.
- Política específica de tarea (single-task), no generalista ni instruible por lenguaje.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso simbólico ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Manipulación textil y de objetos deformables: la tarea de extraer un pañuelo de una caja implica contacto con material blando y geometría variable, un escenario donde las políticas de imitación con percepción visual densa resultan útiles como punto de partida.
- Investigación en Diffusion Policies para robótica bimanual: sirve como referencia reproducible (semilla 1000, 10.000 pasos, 120 episodios) para estudiar el efecto del horizonte de acción, el número de cámaras o la inclusión de táctil.
- Estudio comparado de arquitecturas de política: al existir 24 checkpoints de la misma tarea en cuatro familias (ACT, DP, GR00T, pi0) con y sin táctil, permite aislar el efecto de la arquitectura y de la sensórica bajo un mismo dataset.
- Evaluación de sensórica táctil: el modelo es un caso de estudio directo sobre si la fuerza en las puntas de los dedos aporta ventaja en tareas de tracción fina (la evidencia recogida sugiere que no, más allá del ruido).
- Recolección y replicación de datos por teleoperación: la receta (meta-guante sin exoesqueleto más seguimiento Vive, 4 cámaras a 640×360 y 30 fps) es un protocolo asequible de imitar para otros equipos con hardware similar.
- Base para fine-tuning en tareas de recogida y tracción con manos antropomorfas: al ser un checkpoint pequeño (268 M) y con licencia Apache 2.0, es viable reentrenarlo con datasets propios sobre plataformas XHand1/Vega.
- Validación de pipelines de evaluación open-loop: el autor publica una metodología de error de seguimiento de trayectoria contra un baseline de "mantener primer frame", reutilizable como referencia de evaluación.

## Benchmarks y rendimiento

La model card publica error open-loop en el conjunto de validación (media |pred − acción registrada|, en radianes, ± SEM, n = 12). Menos es mejor. Es una medida de seguimiento de trayectoria, no de éxito de tarea.

| Modelo | L-arm | L-hand | R-arm | R-hand |
|---|---|---|---|---|
| Este modelo (DP + tactil) | 0,0164 ± 0,0011 | 0,0199 ± 0,0021 | 0,0410 ± 0,0013 | 0,0272 ± 0,0019 |
| Baseline hold-first-frame | 0,1975 | 0,0514 | 0,2628 | 0,1440 |

El autor indica que, en el conjunto completo de cuatro familias por tres tareas, la entrada táctil no produjo diferencias más allá del ruido, y que GR00T obtuvo el error más bajo en todas las tareas. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, y ninguno de ellos sería aplicable a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 1,07 GB (coincide con el tamaño del repo, ~1,1 GB); en fp16 bajarían a unos 0,54 GB. A esa cifra hay que sumar activaciones de los 4 codificadores de imagen y del proceso de muestreo por difusión, por lo que la huella total dependerá del backbone, no detallado en la model card. Estas cifras son estimaciones derivadas del recuento de parámetros, no medidas publicadas.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar la inferencia; no se requiere una A100 o H100 para el despliegue de este checkpoint concreto.
- Cabe en GPU de consumo: muy probablemente sí, dado el tamaño (268 M) y que los checkpoints comparables de DP suelen ejecutarse en GPUs de gama media. No hay confirmación explícita del autor.
- Opciones de despliegue: no disponibles en la model card. Las herramientas orientadas a modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de política; el despliegue típico de una Diffusion Policy pasa por inferencia en PyTorch integrada en el stack de control del robot.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

El autor publica variantes de la misma tarea en cuatro familias. La comparación cuantitativa disponible se limita a la afirmación de que GR00T tuvo el error más bajo en todas las tareas; el resto de especificaciones no figuran en la información proporcionada.

| Modelo | Familia | Tactil | Parametros | Error | Licencia |
|---|---|---|---|---|---|
| `dptactile260921` (este) | Diffusion Policy | Sí | 268,3 M | Ver tabla de benchmarks | apache-2.0 (no confirmado para el resto) |
| `dp260921` | Diffusion Policy | No | no disponible | no disponible en esta ficha | no disponible |
| `act260921` / `acttactile260921` | ACT (Action Chunking Transformer) | No / Sí | no disponible | no disponible en esta ficha | no disponible |
| `gr00t3b260921` / `gr00t3btactile260921` | GR00T (variante 3B según el nombre) | No / Sí | no disponible (nombre sugiere 3B) | el más bajo en todas las tareas según el autor | no disponible |
| `pi05260921` / `pi05tactile260921` | pi0 (según el nombre) | No / Sí | no disponible | no disponible en esta ficha | no disponible |

## Limitaciones y advertencias

- El propio autor advierte de que la métrica publicada mide seguimiento de trayectoria y no éxito de tarea: "nothing here was run on hardware" (nada de esto se ejecutó sobre hardware).
- El conjunto de validación es muy reducido: 12 episodios, retenidos cada décimo del total de 120.
- La evidencia recogida indica que la entrada táctil no aporta mejora más allá del ruido en las cuatro familias y tres tareas evaluadas, por lo que no debe asumirse que el sufijo "tactile" implique ventaja.
- Es una política de tarea única, atada a un hardware muy concreto (DexMate Vega-1 con dos RobotEra XHand1) y a una configuración sensórica específica (4 cámaras RGB a 640×360 y 30 fps más fuerza en puntas de dedos). No es transferible sin reentrenamiento.
- No se documentan sesgos ni comportamientos fuera de distribución; cualquier despliegue en condiciones distintas a las del dataset de teleoperación es una extrapolación no validada.
- No hay datos de generalización a otros objetos, materiales o posiciones iniciales.
- No hay información sobre latencia en tiempo real ni sobre estabilidad del control en bucle cerrado.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las licencias de las dependencias y de los modelos base si el checkpoint deriva de uno preentrenado, extremo no aclarado en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dptactile260921
- Variante ACT sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_act260921
- Variante ACT con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_acttactile260921
- Variante Diffusion Policy sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_dp260921
- Variante GR00T 3B sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3b260921
- Variante GR00T 3B con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_gr00t3btactile260921
- Variante pi0 sin táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05260921
- Variante pi0 con táctil: https://huggingface.co/tarzanagh/ckpt_tissuepickteleop_pull_4cam260918_pi05tactile260921
