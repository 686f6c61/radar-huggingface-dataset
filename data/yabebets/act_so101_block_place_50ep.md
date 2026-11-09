# yabebets/act_so101_block_place_50ep

## Resumen

`act_so101_block_place_50ep` es una política de imitación basada en ACT (Action Chunking with Transformers) entrenada por el usuario yabebets para controlar un brazo robótico Hiwonder SO-ARM101 en una tarea concreta de pick-and-place: agarrar un bloque y depositarlo en una bandeja. No es un modelo de lenguaje, sino un modelo de robótica que mapea observaciones (imágenes de una cámara cenital de 640x480 y el estado de las 6 articulaciones) directamente a acciones motoras.

El modelo se ha entrenado con 50 demostraciones de teleoperación del dataset `yabebets/so101_block_place`, durante 30.000 pasos con batch size 8 y learning rate 1e-5 sobre una GPU A100 de Google Colab. La arquitectura combina un backbone visual ResNet-18 con un transformer que predice chunks de 100 acciones (`chunk_size 100`, `n_action_steps 100`), lo que reduce la frecuencia de replanificación y suaviza la ejecución.

Su relevancia es la de un artefacto reproducible de aprendizaje por imitación de bajo coste: el repositorio ocupa 0,2 GB, tiene 51.668.614 parámetros y se ejecuta con el stack LeRobot. El autor reporta un único éxito en una evaluación real (2026-10-13) y no ha medido todavía una tasa de éxito sistemática, por lo que debe considerarse un prototipo experimental más que una política lista para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) con backbone visual ResNet-18 |
| Parámetros totales | 51.668.614 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo consume observaciones por paso; `chunk_size` de 100 acciones) |
| Tipos de cuantización | no disponible (pesos en safetensors sin variantes GGUF/ONNX publicadas) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; la model card está en japonés e inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |

## Arquitectura y entrenamiento

ACT es una política de imitación que combina un codificador visual (ResNet-18) con un transformer encoder-decoder que predice una secuencia de acciones futuras (action chunking). En este caso el chunk es de 100 acciones y se ejecutan las 100 antes de replanificar (`n_action_steps 100`), lo que amortigua el coste de inferencia y produce movimientos más suaves que un control paso a paso. La entrada son las 6 posiciones articulares del SO-ARM101 más una imagen de cámara cenital a 640x480; la salida son comandos de articulación.

El entrenamiento se realizó sobre 50 episodios de teleoperación del dataset `yabebets/so101_block_place`, durante 30.000 pasos con batch size 8, learning rate 1e-5 y semilla 1000, en una A100 de Google Colab. No se documenta composición adicional del dataset, aumentos de datos ni fases de RLHF/DPO (no aplicables a este tipo de política). El autor indica que usó el fork de LeRobot de Hiwonder (`Hiwonder-official/hiwonder-SoArm-101`, v0.5.1).

## Capacidades

- Control motor de un brazo SO-ARM101 de 6 ejes para una tarea única de pick-and-place (agarrar bloque y colocarlo en bandeja).
- Aprendizaje por imitación a partir de demostraciones de teleoperación (behavior cloning con action chunking).
- Fusión de observación visual (cámara cenital 640x480) y propiocepción (6 articulaciones).
- Predicción de chunks de 100 acciones para ejecución fluida.
- Integración con el ecosistema LeRobot (`lerobot-record`, `policy.path`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Reproducción de experimentos de imitación en robótica de bajo coste: sirve como referencia para validar un pipeline completo de teleoperación, grabación de dataset y entrenamiento ACT con LeRobot en un SO-ARM101.
- Docencia y formación en aprendizaje por imitación: el modelo y su dataset permiten mostrar el ciclo completo (demostraciones, entrenamiento, despliegue) con un coste de cómputo moderado (30.000 pasos en A100).
- Base para fine-tuning en tareas de manipulación similares: al ser Apache-2.0 y ocupar 0,2 GB, se puede reentrenar con nuevos datasets de pick-and-place sobre el mismo hardware.
- Pruebas de robustez frente a cambios de cámara: el autor documenta que la política falla si la cámara se desplaza respecto a la posición de grabación, lo que lo convierte en un caso de estudio útil sobre sensibilidad al dominio visual.
- Benchmark interno de políticas ACT: sirve como punto de partida para comparar variantes (distinto `chunk_size`, backbone, número de demostraciones) en el mismo robot.
- Demostración de despliegue con LeRobot CLI: el comando `lerobot-record` de la model card permite evaluar la política en 10 episodios de 20 segundos sin escribir código adicional.
- Prototipo de automatización de una celda de pick-and-place simple en laboratorio, siempre que se controle la iluminación y la posición de la cámara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una evaluación cualitativa en hardware real: un éxito en la tarea de colocar el bloque en la bandeja el 2026-10-13, con el primer intento de una serie de 10 fallido y sin tasa de éxito medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 51,7 M de parámetros y backbone ResNet-18, el modelo es muy ligero y cabe holgadamente en GPUs de consumo (estimación orientativa por debajo de 1 GB en fp32, sin dato oficial).
- GPU recomendadas: el entrenamiento se hizo en una A100 (Google Colab); para inferencia basta una GPU consumer moderna, aunque no se documenta el mínimo oficial.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no hay requisito publicado.
- Opciones de despliegue: LeRobot (librería oficial, `policy.path`), con el fork de Hiwonder v0.5.1. No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI (no aplicables a una política robótica).
- Latencia y throughput: no disponibles. El diseño con `n_action_steps 100` reduce la frecuencia de inferencia, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| act_so101_block_place_50ep | ACT + ResNet-18 | 51,7 M | Pick-and-place SO-ARM101 | Apache-2.0 | Hugging Face |
| Otras políticas ACT en LeRobot Hub | ACT | no disponible | Manipulación genérica | variable | Hugging Face |
| Políticas Diffusion Policy en LeRobot | Diffusion Policy | no disponible | Manipulación | variable | Hugging Face |

No se dispone de datos de rendimiento comparables publicados para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Tasa de éxito no medida: solo hay un éxito documentado y el primer intento de la serie falló; no debe asumirse fiabilidad en producción.
- Sensibilidad a la posición de la cámara: el autor advierte que si la cámara se desplaza respecto a la configuración de grabación, la política deja de funcionar correctamente.
- Tarea única y estrecha: entrenada exclusivamente para agarrar un bloque y colocarlo en una bandeja; no generaliza a otras tareas sin reentrenamiento.
- Dataset pequeño: 50 demostraciones de teleoperación, lo que limita la robustez frente a variaciones de iluminación, posición de objetos o del propio robot.
- Sin datos sobre sesgos, alucinación o multilingüismo: no aplicables como modelo de lenguaje, pero tampoco documentados.
- Licencia Apache-2.0: permite uso comercial y modificación con atribución; no se documentan restricciones adicionales.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación mínimo, sin issues ni discusión comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yabebets/act_so101_block_place_50ep
- Dataset de entrenamiento: https://huggingface.co/datasets/yabebets/so101_block_place
- Registro del proyecto (artículo en japonés sobre teleoperación y entrenamiento ACT): https://github.com/yabebets/so101-lab
- Fork de LeRobot usado (Hiwonder, v0.5.1): https://github.com/Hiwonder-official/hiwonder-SoArm-101
