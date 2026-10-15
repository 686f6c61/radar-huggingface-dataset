# victorvanhalst/diffusion_blocos_pote

## Resumen

diffusion_blocos_pote es una política de control visuomotor (no un modelo de lenguaje) entrenada con el método Diffusion Policy y publicada en Hugging Face por el usuario victorvanhalst. Está empaquetada en formato LeRobot y resuelve una única tarea de manipulación robótica: «Pick the toy block and place it in the bowl» (coger el bloque de juguete y dejarlo en el bol). El modelo consume el estado proprioceptivo del brazo (vector de 6 dimensiones) y dos flujos de imagen de 480x640 (una cámara en la muñeca y otra externa), y produce un vector de acción de 6 dimensiones.

Técnicamente es una política de difusión condicionada: en lugar de regresar una acción única, aprende a generar trayectorias de acción multimodales y suaves, lo que mejora el comportamiento en tareas con contacto físico intenso. El checkpoint pesa 277.839.366 parámetros, almacenados en safetensors, con un repositorio de 1,1 GB. Se entrenó con 100.000 pasos, batch size 16, optimizador Adam y learning rate 0,0001 sobre un dataset propio de 60 episodios y 17.787 fotogramas a 25 FPS.

Su relevancia es acotada y muy específica: es un ejemplo reproducible de política de imitación de última generación para el brazo SO-101 dentro del ecosistema LeRobot, con licencia Apache-2.0. No es un modelo generalista, no procesa lenguaje natural de forma generativa y no tiene resultados de evaluación publicados, por lo que debe tratarse como un artefacto de investigación o prototipo reproducible, no como un componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (política visuomotora generativa por difusión condicionada; implementación de LeRobot `policy.type=diffusion`). El detalle de capas no se especifica en la model card |
| Parametros totales | 277.839.366 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. El horizonte de predicción de acciones (`horizon`/`n_action_steps`) no se documenta en la model card |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no se documentan versiones cuantizadas) |
| Idiomas soportados | no disponible; la tarea se pasa como cadena de texto fija en inglés, pero no se documenta soporte multilingüe ni se usa un codificador de lenguaje generativo |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |
| Tipo de robot | `so_follower` (SO-101 / familia SO de LeRobot) |
| Entradas | `observation.state` (6,), `observation.images.wrist` (3, 480, 640), `observation.images.external` (3, 480, 640) |
| Salidas | `action` (6,) |
| Dataset de entrenamiento | victorvanhalst/so101_blocos_pote_final_20261013_210550 (60 episodios, 17.787 fotogramas, 25 FPS) |
| Pasos de entrenamiento | 100.000 |
| Tamano de batch | 16 |
| Optimizador / LR | adam / 0,0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.6.1 |
| Descargas / likes en el Hub | 3 / 0 |

## Arquitectura y entrenamiento

La model card identifica el método como Diffusion Policy (paper arXiv 2303.04137), que plantea el control visuomotor como un proceso generativo de difusión: el modelo aprende a eliminar ruido progresivamente para producir secuencias de acción coherentes, en lugar de predecir una única acción determinista. Este diseño está pensado para tareas de manipulación con contacto rico, donde las distribuciones de acción son multimodales y una regresión simple tiende a promediar comportamientos incompatibles. La implementación concreta corresponde a la política `diffusion` de LeRobot 0.6.1, pero la model card no detalla el número de bloques, el tamaño del U-Net de acciones ni el codificador visual empleado, por lo que esos datos quedan como no disponibles.

El entrenamiento se realizó por imitación (behavior cloning) sobre 60 episodios teleoperados, 17.787 fotogramas a 25 FPS, con una única tarea anotada. Se ejecutaron 100.000 pasos con Adam, batch 16 y LR 1e-4, semilla 1000. No se documenta ningún proceso de RLHF, DPO ni refinamiento por preferencias, ni aumentos de datos, currículos o mezcla de datasets. Tampoco se especifica si hubo entrenamiento multi-GPU ni la duración real del entrenamiento.

## Capacidades

- Generación de trayectorias de acción multimodales y suaves mediante difusión condicionada, apta para manipulación con contacto.
- Control visuomotor a partir de dos cámaras RGB de 480x640 (muñeca y externa) más el estado proprioceptivo del brazo.
- Ejecución de una tarea concreta de tipo pick-and-place: coger un bloque de juguete y depositarlo en un bol.
- Control de un brazo `so_follower` de 6 grados de libertad (vector de acción de 6 dimensiones).
- Condicionamiento por cadena de tarea en inglés («Pick the toy block and place it in the bowl»).
- Integración con el ecosistema LeRobot: carga directa con `lerobot-rollout` y `policy.path`.
- No dispone de tool calling, function calling, uso de agentes ni razonamiento multi-paso simbólico: no es un modelo de lenguaje.
- Capacidades multilingües: no disponibles.
- Capacidades de visión generativa, audio o modo «thinking»: no disponibles.

## Casos de uso

- Automatización de una celda pick-and-place de laboratorio: el modelo recoge un bloque y lo deposita en un recipiente usando dos cámaras, lo que permite montar una demo funcional de manipulación en un SO-101 sin programar cinemáticas explícitas.
- Investigación en imitación robótica (behavior cloning): sirve como referencia reproducible de Diffusion Policy dentro de LeRobot, con dataset, hiperparámetros y semilla documentados, lo que facilita experimentos comparativos con otras políticas (`act`, `smolvla`, etc.).
- Prueba de concepto de manipulación con contacto: al generar trayectorias multimodales, es adecuado para estudiar comportamientos de agarre y colocación donde los enfoques deterministas tienden a fallar.
- Docencia y prototipado con hardware de bajo coste: el SO-101 y LeRobot permiten reproducir el pipeline completo (grabación de datos, entrenamiento, rollout) en un aula o taller, con este checkpoint como punto de partida.
- Base para fine-tuning en tareas propias: el repositorio incluye el comando `lerobot-train` con `--policy.type=diffusion`, de modo que este checkpoint puede reutilizarse como inicialización o referencia para nuevas tareas de pick-and-place sobre el mismo robot y disposición de cámaras.
- Evaluación de robustez de políticas de difusión: al no haber resultados de éxito publicados, es un candidato directo para medir sensibilidad a cambios de iluminación, posición del objeto o distractores en un banco de pruebas propio.
- Demostraciones de robot learning en vídeo o ferias: el comando de rollout documentado permite ejecutar la política durante 60 segundos y grabar o mostrar el comportamiento en directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que «no evaluation results have been provided for this policy yet» y mantiene vacía la tabla de evaluación.

| Tarea | Ensayos | Éxitos | Tasa de éxito |
|---|---|---|---|
| Pick the toy block and place it in the bowl | no disponible | no disponible | no disponible |

Tampoco se aportan métricas de pérdida de entrenamiento, curvas de aprendizaje ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 277,8 millones de parámetros en FP32, los pesos ocupan aproximadamente 1,1 GB (coincide con el tamaño del repositorio). Sumando activaciones de los dos codificadores visuales a 480x640 y el proceso de difusión (varias iteraciones de denoising por paso de control), una estimación razonable es de 2 a 4 GB de VRAM. Es una estimación, no un dato publicado.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y al menos 4-6 GB de VRAM (RTX 3050/3060, RTX 4060, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: sí, con holgura, en tarjetas como RTX 3060 12 GB, RTX 4060 o superiores. También en plataformas embebidas tipo Jetson Orin siempre que se valide la latencia.
- Inferencia en CPU: técnicamente posible, pero no recomendada si se necesita control a 25-30 Hz; no hay cifras de latencia publicadas.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot, con `--strategy.type=base` y `--policy.path=victorvanhalst/diffusion_blocos_pote`), PyTorch con CUDA y `policy.device=cuda`. No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles. La referencia de frecuencia es 25 FPS en el dataset de entrenamiento y 30 FPS en la configuración de cámaras del ejemplo de rollout.
- Requisitos adicionales: brazo SO-101 (`so_follower`), puerto serie del robot y dos cámaras cuyos nombres e índices deben coincidir exactamente con las claves de observación del entrenamiento (`wrist` y `external`).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Horizonte / contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| victorvanhalst/diffusion_blocos_pote | Diffusion Policy (LeRobot) | 277.839.366 | no disponible | Sin resultados publicados | apache-2.0 | Hugging Face, 3 descargas |
| ACT (política `act` de LeRobot) | Transformer con CVAE para imitación | no disponible en la información proporcionada | no disponible | no disponible | según implementación de LeRobot | Disponible en el ecosistema LeRobot |
| SmolVLA (Hugging Face) | VLA (vision-language-action) | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | Disponible en el ecosistema LeRobot |
| pi0 (Physical Intelligence) | VLA de flujo | no disponible en la información proporcionada | no disponible | no disponible | no disponible en la información proporcionada | Publicado por su autor |

Nota: los valores de las alternativas no proceden de la información proporcionada en esta búsqueda, por lo que se marcan como no disponibles. La comparación relevante es cualitativa: este checkpoint es una política de una sola tarea, entrenada con 60 episodios, mientras que ACT y los VLA citados son implementaciones o modelos de propósito más general dentro del mismo ecosistema.

## Limitaciones y advertencias

- Sin evaluación publicada: no existe ninguna tasa de éxito medida, ni en simulación ni en robot real, por lo que la fiabilidad del modelo es desconocida.
- Especialización extrema: está entrenado para una única tarea («Pick the toy block and place it in the bowl») con un objeto y un bol concretos. Fuera de ese escenario no hay garantía de comportamiento útil.
- Dataset muy reducido: 60 episodios y 17.787 fotogramas implican una cobertura limitada de posiciones, iluminación, oclusiones y variaciones de la escena; la generalización es probablemente frágil.
- Dependencia del hardware: requiere un `so_follower` y dos cámaras con exactamente los nombres de observación entrenados (`wrist` y `external`) y la misma resolución 480x640. Cambiar la disposición de cámaras invalida la política.
- Riesgo de alucinación en el sentido de acciones incoherentes: al ser un modelo generativo, puede producir trayectorias erráticas o inseguras ante entradas fuera de distribución. Es imprescindible un espacio de trabajo despejado y parada de emergencia.
- Sesgos: no se documenta ningún análisis de sesgo, ni de comportamiento diferencial según color, textura o forma del objeto.
- Idiomas: no se documenta soporte multilingüe; el condicionamiento de tarea es una cadena fija en inglés.
- Licencia: el modelo se publica bajo apache-2.0, lo que permite uso comercial, pero la licencia del dataset de entrenamiento no se declara en la model card y debería verificarse antes de un uso comercial.
- Reproducibilidad: se documentan semilla, optimizador y pasos, pero no el hardware, la duración ni la versión exacta de las dependencias más allá de LeRobot 0.6.1.
- Adopción mínima: 3 descargas y 0 likes en el momento de la consulta, sin demo en vídeo ni issues públicos, lo que reduce la evidencia externa disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/victorvanhalst/diffusion_blocos_pote
- Dataset de entrenamiento: https://huggingface.co/datasets/victorvanhalst/so101_blocos_pote_final_20261013_210550
- Visualizador del dataset (LeRobot Spaces): https://huggingface.co/spaces/lerobot/visualize_dataset?path=victorvanhalst/so101_blocos_pote_final_20261013_210550
- Paper de Diffusion Policy: https://huggingface.co/papers/2303.04137 (arXiv 2303.04137)
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference

Nota: la búsqueda web asociada a esta consulta no devolvió resultados relevantes sobre el modelo; únicamente aparecieron páginas sin relación con el contenido técnico solicitado, por lo que no se incluyen.
