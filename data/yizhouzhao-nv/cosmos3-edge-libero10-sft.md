# yizhouzhao-nv/cosmos3-edge-libero10-sft

## Resumen

El modelo `cosmos3-edge-libero10-sft` es un ajuste fino (SFT) del modelo base `nvidia/Cosmos3-Edge`, desarrollado por NVIDIA, especializado en robótica y políticas de acción. Este checkpoint concreto ha sido entrenado por yizhouzhao-nv sobre el conjunto de datos `LIBERO_LeRobot_v3` (suite `libero_10`, 379 trayectorias) para convertir Cosmos3-Edge en una política de acción robótica capaz de ejecutar tareas de manipulación en entornos simulados. El entrenamiento se realizó en un solo nodo con 8 GPU H100 de 80 GB, con un batch global de 2048 y 1000 iteraciones.

El modelo resultante está pensado para ser desplegado como un sistema de control en tiempo real en hardware edge, ya que Cosmos3-Edge es un "modelo de mundo" abierto que genera 32 acciones por inferencia y puede razonar sobre escenas visuales para producir trayectorias de control. Este fine-tune adapta esa capacidad al benchmark LIBERO-10, un estándar en robótica de manipulación. Su relevancia radica en que demuestra cómo un modelo de mundo de tamaño reducido puede convertirse en una política de acción práctica con un entrenamiento relativamente ligero (1000 iteraciones) y reproducible con el framework `cosmos-framework` de NVIDIA.

El repositorio incluye los pesos del modelo en formato PyTorch Distributed Checkpoint (DCP), junto con la configuración exacta del entrenamiento, la receta experimental y los estadísticos de normalización de acciones necesarios para decodificar las salidas de la política.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Cosmos3-Edge (no se especifica el detalle interno; se trata de un modelo de mundo para robótica) |
| Parametros totales | No disponible |
| Parametros activos | No disponible (no es un modelo MoE declarado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el repositorio contiene pesos en DCP, sin cuantización publicada) |
| Idiomas soportados | No disponibles (modelo orientado a percepción visual y control robótico) |
| Licencia | other (según HuggingFace; se debe consultar la licencia específica de Cosmos3-Edge y del dataset) |
| Formato de pesos | PyTorch Distributed Checkpoint (DCP) – shards de pesos únicamente |

## Arquitectura y entrenamiento

No se dispone de una descripción detallada de la arquitectura interna del modelo base Cosmos3-Edge en la información proporcionada. Se sabe que es un modelo de mundo (world model) diseñado para robótica, capaz de procesar observaciones visuales y generar acciones o trayectorias de control. El fine-tune aquí presentado convierte ese modelo base en una política de acción (action policy) para el benchmark LIBERO-10.

El entrenamiento se realizó sobre el dataset `nvidia/LIBERO_LeRobot_v3` (suite `libero_10`, 379 trayectorias) con 1000 iteraciones, usando un nodo con 8 GPU H100 de 80 GB y un batch global de 2048. Se empleó el optimizador AdamW con `fused=true` en lugar del `FusedAdam` de transformer-engine por incompatibilidad de ABI con torch 2.13, y se desactivó `torch.compile` debido a un bug de Dynamo al trazar el backend FMHA de NATTEN en H100. La configuración completa del entrenamiento está disponible en el archivo `action_policy_libero_10_edge.toml` del repositorio.

La normalización de acciones se realiza en el espacio de pose `frame_wise_relative` con rotación en `rot6d` y normalización `quantile_rot`, según el archivo `libero_native_frame_wise_relative_rot6d.json`. Esta información es esencial para decodificar correctamente las salidas de la política.

## Capacidades

- Política de acción robótica para manipulación en entornos simulados (benchmark LIBERO-10).
- Generación de trayectorias de control a partir de observaciones visuales (imágenes) y posiblemente otras modalidades de entrada.
- Capacidad de ejecutar tareas de manipulación multi-paso, como las definidas en LIBERO-10 (por ejemplo, abrir cajas, mover objetos, etc.).
- Integración con el framework `cosmos-framework` de NVIDIA para carga de pesos y despliegue mediante el servidor `action_policy_server_libero`.
- No se han documentado capacidades de tool calling, agentes o razonamiento multi-step fuera del ámbito robótico.
- No se especifican capacidades multilingües ni de procesamiento de lenguaje natural; el modelo está orientado a visión y control.

## Casos de uso

- Evaluación de políticas de manipulación en el benchmark LIBERO-10: el modelo puede cargarse con `cosmos-framework` y evaluarse en las tareas del benchmark, sirviendo como referencia para investigaciones en robótica de imitación.
- Desarrollo de controladores para robots manipuladores en simulación: gracias a su naturaleza de modelo de mundo, puede generar acciones en tiempo real (32 acciones por inferencia según la documentación de Cosmos3-Edge) para controlar brazos robóticos en entornos simulados como MuJoCo o Isaac Sim.
- Prototipado de sistemas de control en hardware edge: al ser un modelo pequeño (frente a los grandes modelos de mundo), puede desplegarse en módulos de bajo consumo para pruebas de control en tiempo real.
- Investigación en aprendizaje por imitación: el checkpoint SFT sirve como ejemplo de cómo adaptar un modelo de mundo a una tarea específica con pocos datos (379 trayectorias) y un entrenamiento corto.
- Reproducción de experimentos: la configuración exacta y los pesos permiten reproducir los resultados del entrenamiento y comparar con otras variantes de Cosmos3-Edge.
- Extensión a otros benchmarks de robótica: el proceso de SFT documentado puede replicarse para adaptar Cosmos3-Edge a otros conjuntos de datos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de éxito en LIBERO-10 ni comparaciones con otros modelos. La model card no proporciona datos de rendimiento cuantitativos.

## Requisitos de hardware

- El entrenamiento se realizó en 8x H100 80 GB, pero los requisitos de inferencia no están documentados.
- El tamaño del repositorio es de 27 GB, lo que sugiere que los pesos del modelo ocupan varios gigabytes, probablemente en el rango de 5-15 GB (sin cuantización). Esto podría caber en GPUs con 24 GB de VRAM o más.
- Para inferencia en tiempo real, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 4090, A5000) o GPUs de datacenter como A10, A100.
- No se especifican opciones de despliegue en vLLM, llama.cpp u otros motores de inferencia genéricos; el despliegue previsto es mediante `cosmos-framework` (servidor `action_policy_server_libero`).
- No se proporcionan estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos de políticas robóticas (por ejemplo, OpenVLA, RT-2, o modelos basados en transformadores para LIBERO). La información proporcionada no incluye métricas de rendimiento ni detalles de arquitectura que permitan una comparación rigurosa. Se puede señalar que Cosmos3-Edge es un modelo de mundo de tamaño reducido, diseñado para edge, mientras que alternativas como OpenVLA (7B parámetros) son más grandes y requieren más recursos. Sin embargo, no hay datos de rendimiento para sustentar una comparación objetiva.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en LIBERO-10; el rendimiento real no está validado externamente.
- El modelo está entrenado únicamente en el conjunto LIBERO-10 (379 trayectorias), lo que limita su generalización a otras tareas o entornos no vistos.
- La licencia es "other"; se debe consultar la licencia específica de Cosmos3-Edge y del dataset `LIBERO_LeRobot_v3` para determinar las restricciones de uso comercial.
- El modelo no incluye capacidades de lenguaje natural ni interacción multimodal fuera del ámbito robótico.
- Al ser un fine-tune de un modelo base, puede heredar sesgos o comportamientos indeseados del modelo original, aunque no se documentan.
- El despliegue requiere el framework `cosmos-framework` y el archivo de normalización de acciones; sin estos, la decodificación de salidas será incorrecta.
- No se proporcionan garantías de seguridad para uso en robots físicos; el modelo está pensado para simulación o investigación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yizhouzhao-nv/cosmos3-edge-libero10-sft
- Modelo base Cosmos3-Edge: https://huggingface.co/nvidia/Cosmos3-Edge
- Dataset LIBERO_LeRobot_v3: https://huggingface.co/datasets/nvidia/LIBERO_LeRobot_v3
- Framework cosmos-framework (GitHub): https://github.com/NVIDIA/cosmos-framework
- Documentación de post-entrenamiento de políticas LIBERO: https://github.com/NVIDIA/cosmos-framework/blob/main/docs/action_policy_libero_posttrain.md
- Guía completa de Cosmos 3 Edge (blog): https://www.buildfastwithai.com/blogs/nvidia-cosmos-3-edge-complete-guide-2026
- Página de investigación de Cosmos 3 (NVIDIA): https://research.nvidia.com/labs/cosmos-lab/cosmos3/
