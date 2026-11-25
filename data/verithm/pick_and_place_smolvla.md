# Verithm/pick_and_place_smolvla

## Resumen

SmolVLA es un modelo compacto de visión-lenguaje-acción (VLA) desarrollado por Hugging Face dentro del ecosistema LeRobot, diseñado para control robótico mediante aprendizaje por imitación. Esta ficha concreta, `Verithm/pick_and_place_smolvla`, es un ajuste fino del modelo base `lerobot/smolvla_base` entrenado específicamente para la tarea de recoger una pelota y colocarla ("Pick a ball and place") sobre un robot de tipo `so_follower` (SO-100/SO-101 de bajo coste). Con 450 millones de parámetros, el modelo busca demostrar que es posible desplegar políticas VLA funcionales en hardware de consumo sin necesidad de clústeres de GPU.

El modelo consume observaciones multimodales —estado articular de 6 dimensiones e imágenes de tres cámaras a 256×256— y produce acciones de 6 dimensiones a 30 FPS. Fue entrenado con 33 episodios y 24.685 fotogramas recogidos con teleoperación, lo que lo convierte en un ejemplo típico de política de imitación de un solo task y dominio estrecho. Su relevancia radica en que ilustra el flujo completo de LeRobot: grabar datos, ajustar un VLA preentrenado y desplegarlo en un robot real con un único comando CLI.

La licencia Apache 2.0 y el formato safetensors facilitan su reutilización, aunque su naturaleza de ajuste fino sobre una tarea muy concreta limita la generalización fuera del dominio de entrenamiento. Es, por tanto, una pieza de referencia para investigadores y desarrolladores que quieran replicar el pipeline de SmolVLA en sus propios robots.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (SmolVLA), transformer multimodal con experto de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo robótico; instrucciones de tarea en inglés en el dataset) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción que combina un codificador visual, un codificador de lenguaje y un decodificador de acciones (experto de acciones) para mapear observaciones multimodales a comandos motores. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face y descrito en el paper arXiv:2506.01844; esta versión concreta se obtiene por ajuste fino supervisado (behavior cloning) sobre el dataset `Verithm/pick_and_place_1104_20261104_142149`.

El entrenamiento se realizó con LeRobot 0.6.2 durante 20.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-4 y semilla 1000. El dataset contiene 33 episodios y 24.685 fotogramas a 30 FPS de la tarea "Pick a ball and place", recogidos con un robot `so_follower` y tres cámaras (`top`, `wrist` y una tercera no detallada). No se reporta uso de RLHF, DPO ni decodificación especulativa; se trata de aprendizaje por imitación puro sobre una única tarea.

## Capacidades

- Generación de acciones motoras de 6 dimensiones (posición articular) a partir de observaciones visuales y de estado.
- Fusión multimodal: procesa simultáneamente estado articular `(6,)` y tres imágenes RGB de 256×256.
- Ejecución de una tarea manipulativa concreta: recoger una pelota y colocarla.
- Control reactivo a 30 FPS, adecuado para bucles de control en tiempo real de robots de bajo coste.
- Instrucción de tarea en lenguaje natural ("Pick a ball and place") como condicionamiento textual.
- Compatible con el stack LeRobot para rollout (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento simbólico: es una política motora, no un LLM conversacional.
- Capacidades multilingües: no aplicables; el condicionamiento textual es una única instrucción en inglés.

## Casos de uso

- **Automatización de pick-and-place en laboratorio**: desplegar la política en un SO-100/SO-101 para tareas repetitivas de recogida y colocación de objetos, usando `lerobot-rollout` con la instrucción "Pick a ball and place" y un límite de duración de 60 s.
- **Punto de partida para ajuste fino en nuevas tareas**: reutilizar el modelo como inicialización con `lerobot-train --policy.path=lerobot/smolvla_base` o directamente desde este checkpoint para acelerar la convergencia en tareas similares de manipulación.
- **Docencia y formación en robótica de imitación**: servir como ejemplo reproducible del pipeline completo de LeRobot (grabación, entrenamiento, evaluación) en cursos y talleres con hardware asequible.
- **Prototipado rápido en investigación VLA**: comparar variantes de SmolVLA frente a políticas más grandes en un mismo robot y tarea, midiendo tasa de éxito y latencia.
- **Validación de datasets de teleoperación**: usar el modelo como "canario" para comprobar que un dataset recién grabado es aprendible; si el ajuste converge, los datos son consistentes.
- **Integración en pipelines de evaluación automatizada**: ejecutar el modelo en un banco de pruebas con cámaras fijas y registrar episodios para medir éxito por posición de objeto, iluminación o distractores.
- **Demostraciones de robótica de bajo coste**: desplegar el modelo en una GPU de consumo (por ejemplo, RTX 4090) para ferias, demos y vídeos, dado su reducido tamaño de 450 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica explícitamente: "_No evaluation results have been provided for this policy yet_". No se dispone de tasas de éxito en robot real, MMLU, HumanEval ni métricas equivalentes.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (450 M parámetros en safetensors, repo de 0,9 GB), la inferencia en fp32 requiere del orden de 2 GB de VRAM, y en fp16/bf16 alrededor de 1 GB (estimación a partir del recuento de parámetros, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente en la práctica; se espera funcionamiento cómodo en RTX 3060/4060/4090, A100 y H100. La model card menciona que SmolVLA "can be deployed on consumer-grade hardware".
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna con ≥4 GB de VRAM.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial), librería `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM de texto.
- Latencia y throughput: no disponibles. La política opera a 30 FPS según la tasa de los datos de entrenamiento, pero no se publica latencia medida por paso de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Verithm/pick_and_place_smolvla | 450 M | no disponible | Pick-and-place en `so_follower` | apache-2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la información | no disponible | VLA base preentrenado | no disponible en la información | Hugging Face |
| Otras políticas VLA (por ejemplo, OpenVLA, π0) | no disponibles en la información | no disponible | Manipulación generalista | no disponible en la información | no disponible |

La comparación cuantitativa con alternativas no está disponible en la información proporcionada. El único punto de referencia directo es `lerobot/smolvla_base`, del que este modelo es un ajuste fino específico de tarea.

## Limitaciones y advertencias

- **Sobreajuste al dominio**: entrenado con solo 33 episodios y una única tarea, es probable que no generalice a otras posiciones de objeto, iluminaciones o robots distintos al `so_follower`.
- **Sin evaluación publicada**: no hay tasa de éxito reportada, por lo que su fiabilidad en producción es desconocida.
- **Dependencia del hardware**: las cámaras y el puerto del robot deben coincidir con los nombres de observación (`top`, `wrist`, tercera cámara) y la configuración de calibración del dataset original.
- **Riesgo de alucinación motora**: como toda política de imitación, puede generar acciones fuera de distribución ante escenas no vistas; requiere límites de seguridad en el robot.
- **Sesgos**: no documentados; el dataset es de un único operador y entorno, lo que puede introducir sesgos de trayectoria y de posicionamiento.
- **Idioma**: la instrucción de tarea es una cadena fija en inglés; no hay soporte multilingüe documentado.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base y del dataset.
- **Caveat de producción**: al ser un ajuste fino de un modelo base de investigación, no se recomienda su uso en entornos industriales sin validación exhaustiva y mecanismos de parada de emergencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Verithm/pick_and_place_smolvla
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/Verithm/pick_and_place_1104_20261104_142149
- Paper SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot en GitHub: https://github.com/huggingface/lerobot
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Guía de imitación (grabar y entrenar): https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=Verithm/pick_and_place_1104_20261104_142149
