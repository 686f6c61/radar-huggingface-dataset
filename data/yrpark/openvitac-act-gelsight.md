# yrpark/openvitac-act-gelsight

## Resumen

`yrpark/openvitac-act-gelsight` es un conjunto de políticas de imitación basadas en ACT (Action Chunking with Transformers) entrenadas sobre dos tareas de simulación del benchmark OpenViTac, que combina percepción visual y táctil (visuo-tactile) para manipulación robótica. Lo desarrolla el usuario de HuggingFace `yrpark` como reproducción independiente de los baselines de OpenViTac, no como checkpoint oficial de los autores del benchmark. El modelo resuelve el problema de aprender políticas de control robótico a partir de demostraciones humanas (imitation learning) usando señales táctiles de sensores GelSight además de imágenes RGB.

La relevancia actual reside en que la manipulación robótica con realimentación táctil es un área emergente donde los modelos puramente visuales fallan en tareas que requieren estimar propiedades físicas (dureza, deslizamiento, contacto). Este repositorio publica dos políticas entrenadas y evaluadas (una de selección de latas vacías y otra de clasificación de dureza de bloques) junto con el conversor de datos LeRobot a HDF5 y los logs de evaluación por episodio, lo que facilita la reproducibilidad.

El modelo es pequeño en términos de parámetros (backbones ResNet-18 más un transformer ACT con chunk size 50), con un tamaño de repositorio de 1,5 GB repartido entre checkpoints, curvas de entrenamiento y logs. No es un modelo de lenguaje: es un modelo de política robótica que mapea observaciones (imágenes de cámara de cabeza y muñeca, más dos imágenes táctiles GelSight) a secuencias de acciones articulares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbones ResNet-18 para 2 cámaras RGB y 2 imágenes táctiles GelSight `rgb_marker` |
| Parámetros totales | no disponible (no se publica el recuento; el repo pesa 1,5 GB incluyendo checkpoints y logs) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; chunk size de 50 pasos de acción con agregación temporal |
| Tipos de cuantización | no disponible (checkpoints PyTorch `.ckpt` sin versiones cuantizadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | checkpoints PyTorch (`.ckpt`), más `dataset_stats.pkl` para normalización |

## Arquitectura y entrenamiento

La arquitectura es ACT, un transformer que predice bloques (*chunks*) de 50 acciones futuras a partir de observaciones multimodales. Cada una de las cuatro entradas visuales (cámara de cabeza, cámara de muñeca, táctil izquierda y táctil derecha) pasa por un backbone ResNet-18 independiente; las características resultantes se concatenan y alimentan un encoder-decoder transformer con agregación temporal. El estado (`qpos`) se compone de 7 articulaciones del brazo más la posición del dedo izquierdo en metros, coincidiendo con `embodiment/joint[:8]` del entorno. La acción corresponde al estado del fotograma siguiente a 60 Hz (cada 2 pasos de simulación).

El entrenamiento se realizó sobre 100 demostraciones por tarea del dataset `FVL-Lab/OpenViTac` (carpeta `Simulation/GelSight_mini`), con 20.000 pasos, batch 64, learning rate 1e-5 y semilla 0. Se usó una única RTX 3090 con aproximadamente 2,5 horas por tarea. Un detalle técnico relevante: el `train_config.yml` apunta a un encoder táctil preentrenado (`encoder/checkpoints/resnet18/.../best.pth`) que no está publicado, y el código omite silenciosamente los ficheros ausentes, de modo que el ResNet-18 táctil se inicializa desde cero. Los datos se convirtieron desde LeRobot v2.1 a HDF5 con `convert_lerobot.py`; el dataset original no incluye columna de acción ni de fase, y las imágenes están almacenadas como MP4. No se aplicó RLHF ni DPO: es imitation learning supervisado puro.

## Capacidades

- Generación de secuencias de acción articular (chunks de 50 pasos) para control de un brazo robótico de 7 articulaciones más un dedo.
- Percepción visuo-táctil: integra dos cámaras RGB (cabeza y muñeca) y dos sensores GelSight (`rgb_marker`) para estimar contacto y propiedades físicas.
- Clasificación táctil de dureza de objetos (tarea `hardness_classify`).
- Selección y manipulación de objetos (tarea `can_empty_select`: agarre, transporte y depósito de latas).
- Agregación temporal de acciones para suavizar el control y reducir la frecuencia de replanificación.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento en lenguaje natural: no es un modelo de lenguaje.
- No tiene capacidades multilingües ni de generación de texto.

## Casos de uso

- **Clasificación de materiales por tacto en línea de montaje**: la política `hardness_classify` distingue bloques duros y blandos y los coloca en la placa correcta; puede integrarse en una celda de inspección donde un brazo robot deba separar piezas por rigidez sin sensores adicionales.
- **Manipulación pick-and-place con realimentación táctil**: `can_empty_select` demuestra agarre, transporte y depósito de latas; sirve como punto de partida para tareas de logística donde la señal visual sola no basta para confirmar el agarre.
- **Reproducción de baselines para investigación en visuo-tactile learning**: el repositorio incluye el conversor LeRobot→ACT HDF5 y los logs de evaluación, lo que permite replicar experimentos y comparar nuevas arquitecturas contra una referencia con métricas publicadas.
- **Prototipado de políticas de imitación con pocas demostraciones**: con solo 100 demos por tarea y 2,5 horas de entrenamiento en una RTX 3090, es viable iterar sobre variantes de encoder táctil o de configuración de ACT en un laboratorio con hardware limitado.
- **Evaluación de robustez ante variaciones de etiqueta**: la tarea de dureza mezcla etiquetas entre semillas (7/3 y 6/4 en los dos primeros chunks) y aun así alcanza 50/50, lo que la hace útil para estudiar la sensibilidad de la política a la composición del dataset.
- **Banco de pruebas para simulación GelSight**: al usar `gelsight.yml` con `skip_pre_move: true`, el setup sirve para validar pipelines de simulación táctil antes de transferir a hardware real.
- **Generación de datos sintéticos de contacto**: las políticas entrenadas pueden desplegarse en el simulador para generar trayectorias etiquetadas que alimenten posteriores entrenamientos.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre 50 episodios por tarea (semillas 1000000-1000049, en 5 chunks de 10), con éxito definido por el `check_success` de cada entorno OpenViTac y usando `policy_last.ckpt`:

| Tarea (entorno OpenViTac) | Carpeta de dataset | Demos | Mejor val loss | Éxito en simulación |
|---|---|---|---|---|
| `can_empty_select` | `empty_can_selection` | 100 | 0,0706 (época 64) | 12/42 (28,6 %) |
| `hardness_classify` | `hardness_classify` | 100 | 0,0982 (época 114) | 50/50 (100 %) |

Notas sobre la evaluación: en `can_empty_select`, 8 de 50 episodios alcanzaron el timeout de reinicio de escena de 120 s (fallo de infraestructura, no de la política) y se excluyeron, dejando 42; esos episodios compartieron GPU con el entrenamiento, lo que ralentizó los reinicios. En `hardness_classify` se elevó el límite de reinicio a 300 s y no hubo exclusiones. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Entrenamiento validado en una única RTX 3090 (24 GB) con ~2,5 h por tarea, batch 64 y 20.000 pasos.
- Inferencia: al tratarse de cuatro ResNet-18 más un transformer ACT pequeño, la VRAM necesaria es muy inferior a la de entrenamiento; no se publica una cifra exacta de VRAM de inferencia.
- Cabe en GPUs de consumo: cualquier tarjeta con al menos 8 GB debería ser suficiente para inferencia, aunque no se ha verificado en la información disponible.
- GPUs recomendadas para entrenamiento: RTX 3090 o superiores (A100, H100) si se quiere reducir el tiempo o aumentar el batch.
- Despliegue: el repositorio está pensado para ejecutarse dentro de OpenViTac (commit `5220aaf`) mediante `scripts/eval_policy.py` con `TRAIN_CONFIG=train_config`; no se proporcionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Entradas | Tareas evaluadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yrpark/openvitac-act-gelsight` | ACT + ResNet-18 | 2 RGB + 2 GelSight | 2 (simulación) | Apache 2.0 | Checkpoints públicos en HF |
| Baselines oficiales de OpenViTac | Políticas de referencia del benchmark | Visuo-táctil | 11 tareas publicadas | Según repositorio OpenViTac | Repositorio GitHub, checkpoints no confirmados en la información disponible |
| ACT original (Zhao et al.) | ACT | RGB | Tareas ALOHA | No disponible en la información | Repositorio público |

No se dispone de datos de rendimiento de los baselines oficiales de OpenViTac ni de otras políticas comparables en la información proporcionada, por lo que no es posible una comparación cuantitativa directa.

## Limitaciones y advertencias

- Solo se completaron 2 de las 11 tareas del benchmark; el resto se inició pero se detuvo antes de finalizar y no se incluye.
- El encoder táctil ResNet-18 se entrena desde cero porque el checkpoint preentrenado referenciado no está publicado; esto puede degradar el rendimiento frente a los baselines originales.
- El 28,6 % de éxito en `can_empty_select` es bajo para producción; los fallos se deben a selección incorrecta de lata, no a fallos de agarre.
- La evaluación de `can_empty_select` excluye 8 episodios por timeout de infraestructura, lo que reduce la muestra a 42 y puede sesgar la métrica.
- El dataset original no tiene columna de acción ni de fase; la acción se deriva del estado del fotograma siguiente, lo que introduce una aproximación en las etiquetas.
- Todo el entrenamiento y la evaluación son en simulación (GelSight simulado); no hay evidencia de transferencia a hardware real.
- No hay información sobre sesgos, alucinación o comportamiento fuera de distribución más allá de las dos tareas evaluadas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo depende de OpenViTac y del dataset `FVL-Lab/OpenViTac`, cuyas condiciones deben verificarse por separado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yrpark/openvitac-act-gelsight
- Repositorio OpenViTac: https://github.com/FVL-Repo/OpenViTac
- Dataset OpenViTac: https://huggingface.co/datasets/FVL-Lab/OpenViTac
