# yinongh/agos_sim2real_geoaux_depthdrop

## Resumen

`agos_sim2real_geoaux_depthdrop` es una política de difusión (diffusion policy) para robótica de manipulación, concretamente para la tarea de inserción de un enchufe inclinado en su zócalo (plug-into-socket) sobre el hardware AGOS de sim2real. Lo desarrolla el usuario `yinongh` y se publica como un artefacto de investigación asociado al repositorio de código `Insertion-RL`. El modelo consume profundidad de muñeca, un vector de fuerza-par (wrench) de 6 dimensiones y una representación 3D-AGOS basada en nube de puntos, y produce un chunk de 10 acciones en el espacio de deltas del efector final.

La relevancia del modelo está en su estrategia de robustez sensorial: aplica un *depth dropout* determinista que anula la profundidad normalizada cuando el enchufe está a menos de 30 mm de su posición de asiento, de modo que la fase de contacto se resuelve únicamente con el wrench y la estimación 3D-AGOS. Además incorpora una cabeza auxiliar GeoAux que predice la pose relativa del enchufe durante el entrenamiento, con peso 0.1, como señal de regularización geométrica.

El modelo se entrenó sobre 22 440 trayectorias generadas con 200 activos procedurales y un huelgo de 0.2 mm, y se evaluó en bucle cerrado en Isaac Gym con el preset de hardware sim2real. Los resultados publicados muestran una tasa de éxito del 67.8 % en activos vistos y del 71.7 % en activos no vistos, lo que indica una generalización razonable a geometrías nuevas dentro del mismo régimen de tolerancia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN + U-Net para política de difusión (modelo `depth_wrench_cnn_unet_agos_geoaux`), con cabeza auxiliar GeoAux |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; horizonte de observación To = 1 y chunk de acción de 10 pasos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pt` (`checkpoints/last.pt`, `checkpoints/best_fixed_noise.pt`) |
| Entradas | profundidad de muñeca (minmax [-0.5, 0] m), wrench de 6-D (z-score), 3D-AGOS (imagen + vector de estimador de nube de puntos) |
| Salidas | chunk de 10 acciones, deltas 9-D en marco EEF (traslación / 0.0003 m, rot6d) |
| Cabeza auxiliar | GeoAux, predice pose relativa del enchufe, peso 0.1 |
| Dataset de entrenamiento | `yinongh/tilted_insertion_agos_sim2real_v1` (22 440 trayectorias, 200 activos procedurales, huelgo 0.2 mm) |
| Tamaño del repositorio | 1.6 GB |

## Arquitectura y entrenamiento

La política sigue el paradigma de diffusion policy: un backbone convolucional con estructura U-Net procesa las observaciones (profundidad, wrench y representación 3D-AGOS) y genera un chunk de 10 acciones en el espacio de deltas del efector final, parametrizadas como traslación escalada por 0.0003 m y rotación en representación 6D. Sobre esta base se añade una cabeza auxiliar GeoAux que predice la pose relativa del enchufe con un peso de 0.1 en la función de pérdida, lo que actúa como tarea auxiliar de regularización geométrica. El modelo se identifica internamente como `depth_wrench_cnn_unet_agos_geoaux`.

El entrenamiento se realizó sobre el dataset `tilted_insertion_agos_sim2real_v1`, compuesto por 22 440 trayectorias generadas con 200 activos procedurales (identificadores 952001-952100 y 952501-952600), con un huelgo de 0.2 mm entre enchufe y zócalo. El holdout se define como la última trayectoria normal y la última de recuperación de cada activo. Se usaron 8 GPU A100 con batch de 64 por GPU, 145 000 pasos, optimizador AdamW con learning rate 3e-4 y schedule coseno, más EMA. El código corresponde al commit `5571262c` del repositorio `Insertion-RL`, script `scripts/train_agos_sim2real_geoaux_depthdrop.sh`.

La innovación técnica central es el *depth dropout*: la profundidad normalizada se anula cuando el enchufe está a menos de 30 mm de su pose de asiento (probabilidad 1, decayendo linealmente a 0 a los 33 mm). Esto fuerza a que la fase de contacto se resuelva con el wrench y la estimación 3D-AGOS, reduciendo la dependencia de una señal de profundidad que se vuelve poco informativa o ruidosa en contacto. El autor reporta además que anular la entrada de wrench no altera el éxito en bucle cerrado, lo que sugiere que la política no explota esa señal de forma crítica en la evaluación realizada.

## Capacidades

- Generación de acciones de manipulación robótica en bucle cerrado para inserción de precisión (enchufe inclinado en zócalo).
- Predicción de chunks de acción de 10 pasos con deltas 9-D en marco del efector final (traslación y rot6d).
- Fusión multimodal de profundidad de muñeca, wrench de 6 ejes y representación 3D-AGOS basada en nube de puntos.
- Predicción auxiliar de pose relativa del enchufe mediante la cabeza GeoAux (señal de entrenamiento, no de inferencia declarada).
- Robustez a la fase de contacto mediante *depth dropout* determinista a partir de 30 mm de distancia al asiento.
- Generalización a geometrías no vistas: 71.7 % de éxito en 5 activos procedurales nuevos frente a 67.8 % en vistos.
- Tolerancia a huelgo ampliado: 73.6 % de éxito con 0.5 mm de huelgo en las mismas 10 geometrías.
- No se declaran capacidades de tool calling, agentes, multilingüismo, visión general, audio ni modo de razonamiento; es un modelo específico de robótica.

## Casos de uso

- Inserción de precisión en líneas de montaje: la política está entrenada específicamente para enchufe inclinado con huelgo de 0.2 mm, por lo que encaja en estaciones de ensamblaje donde la tolerancia es sub-milimétrica y se dispone de cámara de muñeca y sensor de fuerza-par.
- Sim2real en hardware Franka con pinza paralela: el modelo se entrenó con el preset de hardware AGOS (Franka, dedos paralelos, cámara ZED2i a 360x640, gravedad activa), lo que permite transferir directamente a esa configuración sin reentrenamiento si el montaje coincide.
- Manipulación en fase de contacto con sensores degradados: el *depth dropout* hace que la política opere con wrench y 3D-AGOS cuando la profundidad deja de ser fiable cerca del asiento, útil en entornos con oclusión o reflexiones en la pieza.
- Evaluación de robustez a tolerancias: los resultados a 0.5 mm de huelgo (73.6 %) permiten usar el modelo como referencia para estudiar cómo decae el éxito al relajar tolerancias en un proceso industrial.
- Benchmark de políticas de difusión en Isaac Gym: el artefacto incluye `metrics.jsonl`, `summary.json`, `sensitivity.json`, `gradient_reachability.json` y `gate_result.json`, lo que facilita reproducir la evaluación en bucle cerrado con el protocolo v10 (1000 pasos, horizonte de ejecución 5).
- Investigación en aprendizaje por imitación con tareas auxiliares: la cabeza GeoAux con peso 0.1 sirve como caso de estudio de cómo una tarea auxiliar de estimación de pose relativa afecta a la política principal en tareas de inserción.
- Análisis de sensibilidad sensorial: el autor documenta que anular el wrench no cambia el éxito en bucle cerrado, lo que convierte al modelo en un punto de partida para estudiar qué modalidades son realmente críticas en inserción.

## Benchmarks y rendimiento

Evaluación en bucle cerrado en Isaac Gym con `last.pt` (145k pasos) y *depth dropout* según la regla de entrenamiento. Protocolo v10: 1000 pasos, horizonte de ejecución 5, éxito con error normal < 6 mm, axial < 15 mm y rotación < 0.35 rad módulo simetría; 3 rondas x 12 entornos por tarea.

| Split | Éxito | IC 95 % |
|---|---|---|
| Vistos (5 activos entrenados) | 122 / 180 = 67.8 % | [60.6, 74.2] |
| No vistos (5 activos procedurales nuevos) | 129 / 180 = 71.7 % | [64.7, 77.7] |
| Mismas 10 geometrías con huelgo 0.5 mm | 265 / 360 = 73.6 % | no disponible |

Métricas de holdout sobre acciones:

| Métrica | Valor |
|---|---|
| MSE de acciones muestreadas a 145k | 0.0073 |
| MSE con ruido fijo a 25k (`best_fixed_noise.pt`) | 0.0101 |
| MSE con ruido fijo a 145k | 0.0183 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, por tratarse de un modelo de robótica y no de lenguaje.

## Requisitos de hardware

- Entrenamiento: 8 GPU A100 con batch de 64 por GPU, 145 000 pasos, AdamW 3e-4 con schedule coseno y EMA.
- VRAM de inferencia: no disponible en la información proporcionada; el repositorio ocupa 1.6 GB, lo que da una cota superior del tamaño de los checkpoints, pero no se detalla el consumo en ejecución.
- GPU recomendadas: no disponible; el autor solo documenta A100 para entrenamiento.
- ¿Cabe en GPU de consumo? No disponible. Por el tamaño del artefacto (1.6 GB) es plausible, pero no se confirma en la documentación.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el modelo es PyTorch `.pt` y se ejecuta mediante el código de `Insertion-RL` (commit `5571262c`).
- Latencia y throughput: no disponibles.
- Dependencias de entorno: Isaac Gym para la evaluación en bucle cerrado, con preset de hardware sim2real y protocolo v10.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables en la información proporcionada para establecer una comparativa cuantitativa con otras políticas de difusión para inserción (por ejemplo, Diffusion Policy original, DP3 o variantes de imitation learning para ensamblaje). Los datos disponibles solo permiten comparar el propio modelo consigo mismo en distintos regímenes:

| Configuración | Éxito | Observaciones |
|---|---|---|
| Activos vistos (0.2 mm) | 67.8 % | 5 activos entrenados |
| Activos no vistos (0.2 mm) | 71.7 % | 5 activos procedurales nuevos |
| Mismas 10 geometrías (0.5 mm) | 73.6 % | Tolerancia relajada |

Comparativa con modelos de la misma categoría: no disponible.

## Limitaciones y advertencias

- Modo de fallo documentado: la mayoría de fallos se producen por atasco en el taladro con la pinza desviada unos 3.8 grados respecto al eje del zócalo, tras alcanzar la boca aún en rotación.
- Dependencia del régimen de tolerancia: el modelo se entrenó con 0.2 mm de huelgo; el rendimiento a 0.5 mm se midió solo en las mismas 10 geometrías y no en activos nuevos.
- Sensibilidad al wrench no demostrada: anular la entrada de wrench no cambia el éxito en bucle cerrado, lo que cuestiona que la política aproveche esa modalidad en la práctica.
- Especificidad de hardware: entrenado para Franka con dedos paralelos, cámara ZED2i a 360x640, observador de wrench ruidoso en espacio de articulaciones y gravedad activa; no se garantiza transferencia a otras configuraciones.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Idiomas: no aplica; el modelo no procesa lenguaje.
- Sin benchmarks estándar publicados: solo métricas de la tarea de inserción y de holdout de acciones.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero sí existe riesgo de predicciones de acción erróneas en estados fuera de distribución.
- Reproducibilidad dependiente del código: la evaluación requiere el repositorio `Insertion-RL` en el commit `5571262c` y el protocolo v10 para replicar los números.
- Advertencia de producción: sin validación en hardware físico más allá del preset sim2real de Isaac Gym, no se recomienda despliegue directo en línea sin una fase de verificación en banco.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yinongh/agos_sim2real_geoaux_depthdrop
- Dataset de entrenamiento: https://huggingface.co/datasets/yinongh/tilted_insertion_agos_sim2real_v1
- Repositorio de código `Insertion-RL` (commit `5571262c`): no disponible como URL en la información proporcionada
- Documentación interna: `docs/plan/agos_sim2real_geoaux_depthdrop.md` §5 del repositorio `Insertion-RL` (no disponible como URL)
- Script de entrenamiento: `scripts/train_agos_sim2real_geoaux_depthdrop.sh` (no disponible como URL)
