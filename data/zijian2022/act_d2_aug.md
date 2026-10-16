# zijian2022/act_d2_aug

## Resumen

act_d2_aug es un checkpoint de política robótica basado en ACT (Action Chunking Transformer), publicado por el usuario zijian2022 en Hugging Face dentro del ecosistema LeRobot. No es un modelo de lenguaje ni un modelo visión-lenguaje: es una política de control entrenada por imitación para una tarea de manipulación concreta, apilar un objeto rojo sobre uno azul, sobre un brazo FANUC ER-4iA (tarea inferida del nombre del dataset asociado). Resuelve el problema clásico de convertir demostraciones de teleoperación en una política que genera secuencias de acciones.

El checkpoint tiene 51.609.223 parámetros (unos 51,6 M) almacenados en safetensors, con un tamaño de repositorio de 0,2 GB, y se distribuye bajo licencia Apache-2.0. Se entrenó durante 30.000 pasos con un batch de 16 y aumentación de imagen activada, y predice bloques de 40 acciones que ejecuta en su totalidad antes de replanificar.

Su relevancia es la de un artefacto de investigación reproducible: sirve como referencia para comparar estrategias de aprendizaje por imitación, para experimentar con aumentación de imagen y *domain randomization*, y como punto de partida para reentrenar la misma arquitectura en tareas propias. Con cero descargas y cero *likes* en el momento de redactar esta ficha, no cuenta con validación pública de la comunidad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer): transformador codificador-decodificador con CVAE y extractor visual convolucional. El detalle exacto de capas y backbone no está documentado en la model card; se corresponde con la implementación estándar de ACT en LeRobot |
| Parámetros totales | 51.609.223 (~51,6 M), según safetensors |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en tokens. Horizonte de predicción de acciones (`chunk_size`) de 40 pasos, ejecutados completos (`n_action_steps` = 40) |
| Tipos de cuantización | no disponible (pesos en safetensors, presumiblemente fp32; no se documentan variantes GGUF, INT8 ni fp16) |
| Idiomas soportados | no aplica: es una política de control robótico y no procesa lenguaje natural |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT (Action Chunking Transformer) es la arquitectura presentada en "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (Zhao et al., 2023). Su diseño combina un *backbone* convolucional para las imágenes de cámara con un transformador que codifica la observación y decodifica un bloque de acciones futuras de una sola vez, en lugar de predecir una única acción por paso. El modelo incorpora un componente CVAE: un codificador comprime la secuencia de acciones de la demostración junto con el estado articular en una variable latente de estilo, y el decodificador reconstruye el *chunk* condicionado a esa latente y a las observaciones. El entrenamiento combina una pérdida de reconstrucción L1 sobre las acciones con un término de divergencia KL que regulariza la latente.

Para este checkpoint concreto, la model card únicamente documenta el presupuesto de entrenamiento: 30.000 pasos, `batch_size` de 16, aumentación de imagen activada y checkpoint final en el paso 30.000. El horizonte de predicción es de 40 acciones (`chunk_size` = 40) y se ejecutan las 40 antes de volver a consultar la política (`n_action_steps` = 40), lo que implica que no se aplica *temporal ensembling* en la configuración descrita. No se especifican en la información disponible el número de capas del transformador, la dimensión del modelo, el backbone visual empleado ni la composición exacta del dataset de demostraciones.

## Capacidades

- Generación de secuencias de acciones de control para un brazo robótico: predice bloques de 40 acciones a partir de observaciones visuales y del estado articular.
- Aprendizaje por imitación: reproduce la tarea para la que fue entrenado, apilar un objeto rojo sobre uno azul.
- Condicionamiento multi-cámara: ACT estándar acepta varias cámaras simultáneamente (no se detalla cuántas en este checkpoint).
- Robustez ante variaciones visuales: la aumentación de imagen está activada durante el entrenamiento, lo que suele mejorar la tolerancia a cambios de iluminación y posición.
- No soporta *tool calling*, *function calling* ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni *thinking mode*.

## Casos de uso

- Automatización de apilado pick-and-place: es exactamente la tarea para la que se entrenó (apilar un objeto rojo sobre uno azul). Se desplegaría en una celda con el mismo brazo FANUC ER-4iA y la misma disposición de cámara que en la recogida de datos.
- Banco de pruebas de aprendizaje por imitación: sirve como referencia reproducible de ACT entrenado durante un número fijo de pasos, útil para comparar contra variantes propias de arquitectura o de aumentación.
- Estudio del efecto del *chunking*: al fijar `chunk_size` = 40 y ejecutar el *chunk* completo, permite analizar el compromiso entre reactividad y suavidad de trayectoria frente a configuraciones con *temporal ensembling*.
- Punto de partida para *fine-tuning*: la misma arquitectura puede reentrenarse con nuevas demostraciones para tareas distintas sobre el mismo robot, reutilizando la inicialización en lugar de partir de cero.
- Evaluación de *domain randomization*: dado el sufijo "dr" en el dataset, es un candidato para medir cuánto generaliza una política entrenada con variaciones frente a condiciones de laboratorio limpias.
- Investigación académica en manipulación: material para reproducir resultados de ACT en un robot industrial pequeño (FANUC ER-4iA), no solo en plataformas de bajo coste tipo SO-100.
- Validación de canal de datos LeRobot: sirve como ejemplo de extremo a extremo de un flujo grabar demostraciones, entrenar con LeRobot y desplegar la política resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito, número de episodios de evaluación, ni comparaciones cuantitativas con otras políticas. No se debe asumir ningún nivel de rendimiento a partir del número de pasos de entrenamiento.

## Requisitos de hardware

- Peso en disco: aproximadamente 0,2 GB para el repositorio completo; los pesos en fp32 ocupan unos 206 MB (51.609.223 parámetros x 4 bytes).
- VRAM estimada para inferencia: por debajo de 2 GB en fp32, sumando pesos y activaciones del extractor visual (estimación propia, no documentada por el autor).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente para inferencia (GTX 1650, RTX 3050, RTX 4090). Las A100 y H100 solo tienen sentido para entrenamiento o para servir muchos entornos en paralelo.
- Cabe en GPU de consumo: sí, holgadamente, e incluso puede ejecutarse en CPU, con una latencia mayor.
- Despliegue en *edge*: es apto para plataformas embebidas tipo NVIDIA Jetson (Orin, Xavier, Nano), que es el escenario habitual de ACT en robótica.
- Entrenamiento: el `batch_size` de 16 durante 30.000 pasos es asumible en una única GPU de gama media-alta; LeRobot no requiere clústeres para este tamaño de modelo.
- Opciones de despliegue: scripts de LeRobot (`lerobot-record`, evaluación y *rollout* de políticas), PyTorch nativo y exportación a ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje.
- Latencia y *throughput*: no disponible. Como referencia de diseño, el paper original de ACT apunta a control en tiempo real del orden de decenas de hercios con *temporal ensembling*; con la configuración aquí descrita, cada inferencia cubre 40 pasos de control antes de replanificar.

## Comparativa con modelos similares

| Modelo | Paradigma | Parámetros | Horizonte de acción | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_d2_aug (este modelo) | ACT, transformador con CVAE | 51,6 M | 40 pasos por *chunk* | Apache-2.0 | Hugging Face, librería `lerobot` |
| ACT de referencia en LeRobot | ACT, transformador con CVAE | del mismo orden (el valor exacto depende de la configuración) | valor por defecto de LeRobot, distinto de 40 | Apache-2.0 | Repositorio LeRobot |
| Diffusion Policy | difusión sobre secuencias de acciones | no disponible | no disponible | no disponible en la información consultada | Repositorios públicos de los autores |
| SmolVLA | VLA con *flow matching*, entrada de lenguaje e imagen | del orden de 450 M según su documentación pública | no disponible | Apache-2.0 según su documentación pública | Hugging Face |

La diferencia de categoría es importante: ACT y Diffusion Policy son políticas de tarea específica sin entrada de lenguaje, mientras que SmolVLA acepta instrucciones en lenguaje natural y generaliza a múltiples tareas. Comparar act_d2_aug con un VLA no es equiparable en capacidades, solo en el hecho de que ambos producen acciones de robot.

## Limitaciones y advertencias

- Política de tarea única: está entrenada exclusivamente para apilar un objeto rojo sobre uno azul con un FANUC ER-4iA; no generaliza a otras tareas, objetos ni robots sin reentrenamiento.
- Sin validación de la comunidad: cero descargas y cero *likes* en el momento de la consulta, y sin tasas de éxito publicadas.
- Sesgos heredados de las demostraciones: las posiciones iniciales, la iluminación, la cámara fija y el estilo del operador de teleoperación condicionan el comportamiento; fuera de esa distribución el riesgo de acciones erráticas aumenta.
- Alucinación: el término no aplica al no generar texto, pero existe el equivalente en forma de acciones fuera de distribución cuando la escena difiere de la vista en entrenamiento.
- Limitación de idioma: no aplica; no procesa lenguaje natural.
- Licencia: Apache-2.0 permite uso comercial del modelo, pero no se indica la licencia del dataset de demostraciones, que conviene verificar de forma independiente antes de un uso comercial.
- Ausencia de cuantizaciones y de detalles arquitectónicos: no hay variantes GGUF, ONNX ni INT8 publicadas, ni información sobre el *backbone* visual o el número de cámaras.
- Checkpoint intermedio: el propio autor lo identifica como el paso 30.000, sin curvas de aprendizaje ni evidencia de convergencia.
- Despliegue en producción: requiere medidas de seguridad a nivel de controlador del robot; una política aprendida no ofrece garantías formales de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zijian2022/act_d2_aug
- Dataset asociado: https://huggingface.co/datasets/zijian2022/fanuc_er4ia_stack_red_on_blue_d2_fixwrist_dr
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper original de ACT (Zhao et al., 2023): https://arxiv.org/abs/2304.13705

Nota: los dos primeros enlaces provienen de la información de Hugging Face; el resto son referencias generales de la arquitectura y la librería, no aparecen citados en la model card del autor.
