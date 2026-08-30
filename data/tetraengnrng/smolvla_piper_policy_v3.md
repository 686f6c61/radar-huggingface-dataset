# tetraengnrng/smolvla_piper_policy_v3

## Resumen

SmolVLA Piper Policy v3 es un modelo de visión-lenguaje-acción (VLA) desarrollado por el usuario tetraengnrng, que parte del modelo base `lerobot/smolvla_base`. Está diseñado para controlar robots manipuladores mediante aprendizaje por imitación, resolviendo la tarea concreta de recoger un cubo rojo y depositarlo en una bandeja azul. El modelo integra entradas visuales de tres cámaras (muñeca y extrínsecas) junto con el estado del robot, y produce comandos de acción de 7 grados de libertad.

Con 450 millones de parámetros y un tamaño de repositorio de 0,9 GB, este modelo es compacto y puede ejecutarse en hardware de consumo, tal y como destaca la arquitectura SmolVLA original. Ha sido entrenado mediante fine-tuning con LeRobot sobre un dataset propio de 20 episodios (5300 fotogramas a 30 FPS) y se distribuye bajo licencia Apache 2.0. Su relevancia reside en demostrar cómo un VLA pequeño puede especializarse en tareas robóticas concretas con recursos limitados, facilitando la experimentación en entornos domésticos o académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450.046.176 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de acción, no de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es una arquitectura de visión-lenguaje-acción que combina un codificador visual con un modelo de lenguaje pequeño para procesar observaciones multimodales (imágenes y estado del robot) y generar acciones de control. El modelo base `lerobot/smolvla_base` fue preentrenado con datos de robótica y luego fine-tuneado por tetraengnrng para la tarea específica de pick-and-place. El entrenamiento se realizó con LeRobot (versión 0.6.2) usando el dataset `tetraengnrng/redcube_picknplace_v3`, que contiene 20 episodios grabados a 30 FPS con tres cámaras (256×256 píxeles). La configuración de entrenamiento incluyó 5000 pasos, batch size de 4, optimizador AdamW con learning rate 1e-4 y semilla 1000. No se mencionan técnicas de RLHF ni DPO; se trata de un aprendizaje por imitación supervisado.

## Capacidades

- Control de robot manipulador: genera acciones de 7 grados de libertad (posición y orientación del efector final) a partir de observaciones visuales y estado.
- Percepción multimodal: procesa tres flujos de imagen (cámara de muñeca y dos extrínsecas) a resolución 256×256 junto con el estado del robot (6 dimensiones).
- Tarea específica pick-and-place: entrenado para recoger un cubo rojo y colocarlo en una bandeja azul.
- Inferencia en tiempo real: al ser un modelo compacto, puede ejecutarse en hardware de consumo sin GPU de gama alta.
- Integración con LeRobot: compatible con el ecosistema de herramientas de Hugging Face para robótica (entrenamiento, rollout y evaluación).
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento conversacional; es exclusivamente un modelo de acción.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo robótico para trasladar piezas de una posición a otra, reduciendo la necesidad de programación manual.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar cómo pequeños VLA se adaptan a tareas específicas con pocos datos (20 episodios).
- Prototipado rápido en robótica educativa: permite a estudiantes y desarrolladores desplegar una política de manipulación en un robot real o simulado usando LeRobot y hardware asequible.
- Pruebas de generalización en entornos controlados: puede evaluarse la robustez del modelo ante variaciones de iluminación, posición de objetos o distracciones en un laboratorio.
- Base para fine-tuning en nuevas tareas: al ser un modelo ligero, puede reentrenarse rápidamente con datasets propios para otras maniobras (apilar, insertar, empujar, etc.).
- Benchmarking de VLA en hardware de consumo: útil para comparar rendimiento y latencia de modelos pequeños frente a alternativas más grandes como OpenVLA en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que no hay evaluación reportada para esta política concreta.

## Requisitos de hardware

- VRAM estimada: con 450M parámetros en precisión FP32, el modelo ocupa aproximadamente 1,8 GB en memoria; en FP16 bastarían unos 0,9 GB. Puede ejecutarse en GPUs con 4 GB o más.
- GPU recomendadas: tarjetas de consumo como NVIDIA GTX 1660, RTX 2060, RTX 3060 o superiores; también funciona en Apple Silicon con MPS.
- Compatibilidad con hardware de consumo: sí, es viable en GPUs de gama media e incluso en CPU para inferencia no en tiempo real.
- Opciones de despliegue: principalmente mediante LeRobot (`lerobot-rollout`), que gestiona la carga del modelo y la conexión con el robot. No se menciona soporte para vLLM, llama.cpp u Ollama, dado que no es un modelo de texto.
- Latencia y throughput: no disponibles; dependerán del hardware y del número de cámaras activas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| smolvla_piper_policy_v3 | 450M | no disponible | Pick-and-place específico | Apache 2.0 | Hugging Face |
| OpenVLA | 7B | no disponible | Manipulación general | MIT | Hugging Face |
| RT-2 (Google) | 55B | no disponible | Manipulación general | Propietaria | No abierto |

La comparativa se basa en datos públicos; no se dispone de benchmarks comparativos directos. SmolVLA destaca por su menor tamaño y coste computacional frente a alternativas como OpenVLA, lo que facilita su despliegue en entornos con recursos limitados.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido (20 episodios), lo que limita la generalización a variaciones no vistas (posiciones de objetos, iluminación, texturas).
- Sin evaluación reportada: no hay métricas de éxito en el mundo real, por lo que su fiabilidad en producción es incierta.
- Tarea muy específica: el modelo solo sabe ejecutar "pick up the red cube and place it into the blue bin"; cualquier cambio de objeto o escenario requiere reentrenamiento.
- Sin capacidades de lenguaje: no puede interpretar instrucciones verbales ni mantener diálogos; es un sistema de control puro.
- Riesgo de alucinación en acciones si las observaciones difieren mucho del dataset de entrenamiento; puede generar comandos erróneos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de funcionamiento ni soporte.

## Enlaces

- Repositorio del modelo: https://huggingface.co/tetraengnrng/smolvla_piper_policy_v3
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/tetraengnrng/redcube_picknplace_v3
- Paper de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Documentación de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
