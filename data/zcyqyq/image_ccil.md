# zcyqyq/image_ccil

## Resumen

El repositorio `zcyqyq/image_ccil` contiene un conjunto de checkpoints de políticas de aprendizaje por imitación para manipulación robótica, desarrollados por Caiyi Zhang (zcyqyq). Estos checkpoints implementan el método CCIL (Corrective Conditional Imitation Learning), una técnica que combina un modelo de dinámica aprendido con un diffusion policy basado en transformer con características DINO. El objetivo es mejorar la eficiencia de datos en tareas de control robótico, reduciendo la necesidad de demostraciones humanas.

El modelo es relevante porque aborda un problema clave en robótica: la escasez de datos de demostración de alta calidad. CCIL entrena un modelo de dinámica a partir de los datos disponibles y lo utiliza para generar datos aumentados sintéticos, que luego se emplean para entrenar la política final. El repositorio incluye configuraciones end-to-end y secuenciales, con variantes como backward Euler y espacios latentes híbridos, evaluadas en tareas estándar como PushT, Square, ToolHang y Can.

Aunque el repositorio no proporciona detalles sobre el número de parámetros o la arquitectura exacta (más allá de mencionar "DINO-transformer diffusion-policy"), los resultados de evaluación muestran mejoras consistentes sobre los baselines de diffusion policy estándar en las tareas reportadas. La licencia es "other", por lo que se debe revisar el repositorio original para conocer las restricciones de uso.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion policy basada en transformer con características DINO (según el autor) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión-acción, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | other |
| Formato de pesos | .pt (PyTorch) |

## Arquitectura y entrenamiento

El modelo se basa en un diffusion policy que genera acciones condicionadas a observaciones visuales. Según el README, la arquitectura incorpora un transformer con características DINO, lo que sugiere el uso de un encoder visual preentrenado (posiblemente DINOv2) para extraer representaciones de las imágenes. El método CCIL añade un modelo de dinámica aprendido que se entrena con los datos de demostración existentes; este modelo se utiliza para generar trayectorias aumentadas que aumentan la cobertura del dataset de entrenamiento.

El entrenamiento se realiza en dos fases principales: primero se entrena el modelo de dinámica (guardado como `dynamics.pkl` en las carpetas `seq_shared_dynamics`), y después se generan datos sintéticos con diferentes configuraciones (backward Euler, acción ruidosa, espacio latente híbrido, etc.) que se utilizan para afinar la política. El repositorio incluye tanto variantes end-to-end (E2E) como secuenciales, donde la política y el modelo de dinámica se entrenan por separado. También se mencionan técnicas como "backward Euler" para la integración temporal y "zcurr" para la representación del estado latente.

## Capacidades

- Control de robots para tareas de manipulación (empujar, ensamblar, colgar herramientas, etc.).
- Aprendizaje por imitación a partir de demostraciones humanas, con mejora mediante datos sintéticos generados por CCIL.
- Generación de acciones de alta frecuencia (típicamente 10-20 Hz) para control en bucle cerrado.
- Soporte para múltiples tareas de referencia en robótica: PushT, Square, ToolHang y Can.
- Integración con entornos de simulación estándar (Robomimic, PushT) y posibilidad de transferencia a hardware real (no verificado en el repo).
- No incluye capacidades de lenguaje, visión general ni razonamiento simbólico; es un modelo puramente motor.

## Casos de uso

- Automatización de ensamblaje industrial: el modelo puede aprender a insertar piezas (tarea Square) o colgar herramientas (ToolHang) a partir de pocas demostraciones, reduciendo el tiempo de configuración en líneas de producción.
- Manipulación de objetos en almacenes: la tarea Can (recoger y colocar latas) es representativa de operaciones de picking y placing; CCIL permite entrenar políticas con menos ejemplos etiquetados.
- Empuje de objetos (PushT): útil para tareas de reordenación de piezas en robótica colaborativa, donde el robot debe empujar un objeto hasta una posición objetivo.
- Investigación en aprendizaje por imitación: el repositorio sirve como banco de pruebas para comparar variantes de CCIL (end-to-end vs secuencial, backward Euler, etc.) contra baselines estándar.
- Desarrollo de sistemas de control basados en diffusion policy: los checkpoints pueden servir como punto de partida para afinar en tareas personalizadas mediante fine-tuning con datos adicionales.
- Evaluación de métodos de aumento de datos en robótica: los resultados reportados permiten reproducir experimentos y validar la eficacia de CCIL frente a diffusion policy convencional.

## Benchmarks y rendimiento

Los resultados reportados en el README se resumen a continuación. Todas las evaluaciones usan el mismo protocolo: 3 semillas de inferencia (42, 1042, 2042), 50 episodios por semilla, semillas de entorno 100000-100049 y umbral de éxito 0.95, salvo que se indique lo contrario.

| Tarea | Método | Checkpoint | Tasa de éxito (offline) |
|---|---|---|---|
| PushT | Baseline diffusion-policy | `policy.pt` | 57/150 = 38.00% |
| PushT | E2E CCIL (epoch 500) | `policy.pt` | 87/150 = 58.00% |
| PushT | Secuencial CCIL, backward Euler (epoch 780) | `policy.pt` | 77/150 = 51.33% |
| PushT | Secuencial CCIL, acción ruidosa (epoch 960) | `policy.pt` | 76/150 = 50.67% |
| Square | Baseline | `policy.pt` (epoch 500) | 80/150 = 53.33% |
| Square | E2E CCIL zcurr-hybrid (epoch 500) | `can_serl_diffusion_epoch_500.pt` | 104/150 = 69.33% |
| Square | E2E CCIL BE legacy (epoch 360) | `policy.pt` | 34/50 = 68.00% (inline, seed 42) |
| Square | Secuencial CCIL BE (epoch 380) | `policy.pt` | 92/150 = 61.33% |
| Square | Secuencial CCIL noisy (epoch 320) | `policy.pt` | 86/150 = 57.33% |
| Can | Baseline (epoch 80) | `policy.pt` | 59/150 = 39.33% |
| Can | Secuencial CCIL BE (epoch 800) | `policy.pt` | 78/150 = 52.00% |
| Can | Secuencial CCIL noisy (epoch 980) | `policy.pt` | 73/150 = 48.67% |
| ToolHang | Baseline (epoch 140) | `can_serl_diffusion_best.pt` | 18/50 = 36.00% (seed 42) |
| ToolHang | E2E CCIL BE (epoch 240) | `can_serl_diffusion_epoch_240.pt` | 12/50 = 24.00% (seed 42) |

Los resultados muestran que las variantes CCIL superan al baseline en PushT, Square y Can, aunque en ToolHang el E2E BE obtiene peor resultado que el baseline. No se han publicado resultados en benchmarks estándar de aprendizaje automático (MMLU, HumanEval, etc.) porque el modelo no es de lenguaje ni de visión general.

## Requisitos de hardware

- No se han publicado requisitos específicos de VRAM ni de GPU en el repositorio.
- Dado que se trata de un diffusion policy con transformer y encoder visual, se requiere una GPU con al menos 8-12 GB de VRAM para inferencia en tiempo real (estimación orientativa, no verificada).
- Para entrenamiento o fine-tuning, se necesitaría una GPU de gama alta (p. ej., RTX 3090, A100) con 24 GB o más de VRAM, dependiendo del batch size y la resolución de imagen.
- El tamaño del repositorio es de 8.1 GB, lo que sugiere que los checkpoints son relativamente grandes (posiblemente varios cientos de MB cada uno).
- Opciones de despliegue: al ser checkpoints de PyTorch, se pueden cargar directamente con PyTorch; no se proporcionan archivos ONNX, TensorRT ni GGUF. Se puede usar con frameworks de robótica como Robomimic o SERL, o implementar un bucle de inferencia personalizado.
- No se dispone de datos sobre latencia o throughput.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la información disponible, ya que el repositorio se centra en checkpoints de CCIL y no incluye comparaciones con otros métodos de aprendizaje por imitación fuera de sus propios baselines. La comparación más relevante es contra el diffusion policy estándar (baseline), que aparece en el propio repositorio. En la tabla de benchmarks se observa que CCIL mejora la tasa de éxito en la mayoría de las tareas, pero no hay datos de otros modelos como ACT (Action Chunking with Transformers) o Diffusion Policy original para comparar directamente.

## Limitaciones y advertencias

- El modelo está diseñado específicamente para tareas de manipulación robótica en entornos simulados (Robomimic, PushT); no se ha validado en robots reales.
- Los checkpoints corresponden a configuraciones concretas (por ejemplo, ToolHang E2E BE tiene una sola semilla de evaluación), por lo que los resultados pueden no ser estadísticamente robustos en todos los casos.
- La licencia "other" implica que se deben revisar los términos del repositorio original antes de cualquier uso comercial o redistribución.
- No se proporcionan detalles sobre el dataset de entrenamiento original (número de demostraciones, resolución de imágenes, etc.), lo que dificulta la reproducibilidad exacta.
- Al ser un modelo de política visual, no tiene capacidades de razonamiento simbólico ni de procesamiento de lenguaje; su uso está restringido a control motor.
- El modelo puede presentar comportamientos no seguros si se despliega sin supervisión en entornos reales; se recomienda validación exhaustiva y mecanismos de seguridad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zcyqyq/image_ccil
- Perfil del autor en HuggingFace: https://huggingface.co/zcyqyq
- Proyecto CCIL en GitHub (código y documentación): https://github.com/personalrobotics/CCIL
