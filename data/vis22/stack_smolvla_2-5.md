# vis22/stack_smolvla_2.5

## Resumen

vis22/stack_smolvla_2.5 es una política robótica de tipo vision-language-action (VLA) obtenida por ajuste fino supervisado de lerobot/smolvla_base, publicado por el usuario vis22 en Hugging Face. El modelo resuelve una única tarea de manipulación sobre un brazo Piper (`piper_follower`): apilar todos los platos sobre el plato azul y volver a la posición de reposo. Es, por tanto, un caso de imitación pura sobre 30 episodios y 13.480 fotogramas grabados a 30 FPS, no un modelo de propósito general.

Técnicamente es una política compacta de 450.046.176 parámetros (aproximadamente 450 millones) derivada de la familia SmolVLA, presentada en el artículo arXiv:2506.01844. SmolVLA combina un codificador visión-lenguaje ligero con un experto de acción que genera trayectorias de control, y su objetivo declarado es ofrecer rendimiento competitivo con coste computacional reducido, apto para hardware de consumo.

Su relevancia es doble. Por un lado, demuestra que el ajuste fino de una política VLA para una tarea concreta es viable con un dataset muy pequeño (30 episodios), lo que baja la barrera de entrada para laboratorios y aficionados. Por otro, el repositorio no incluye ningún resultado de evaluación: no hay tasas de éxito medidas en robot real, cero descargas y cero valoraciones, por lo que debe considerarse un artefacto experimental sin validación pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA); ajuste fino de la familia SmolVLA sobre lerobot/smolvla_base |
| Parametros totales | 450.046.176 (aproximadamente 450 M) |
| Parametros activos | no aplica (no se documenta una arquitectura de mezcla de expertos dispersa) |
| Longitud de contexto | no disponible (política de control; consume una observación por paso, sin contexto textual documentado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la entrada lingüística se limita a la instrucción de tarea fija usada en el entrenamiento) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de pipeline | robotics |
| Modelo base | lerobot/smolvla_base |
| Dataset de entrenamiento | vis22/plates_stack_merged (30 episodios, 13.480 fotogramas, 30 FPS) |
| Robot objetivo | `piper_follower` |
| Cámaras | `cam_global`, `cam_gripper` |
| Entradas | `observation.state` (7,), `observation.images.cam_global` (3, 480, 640), `observation.images.cam_gripper` (3, 480, 640) |
| Salidas | `action` (7,) |
| Tamaño del repositorio | 0,9 GB |

## Arquitectura y entrenamiento

SmolVLA es una política vision-language-action compacta: procesa observaciones multimodales (estado propioceptivo de 7 dimensiones e imágenes RGB de 480x640 procedentes de dos cámaras) y emite un vector de acción de 7 dimensiones que controla el brazo Piper. La model card enlaza el artículo arXiv:2506.01844 como referencia del método; los detalles internos de la arquitectura (número de capas, mecanismo de atención, esquema de generación de secuencias de acción) no se reproducen en la información disponible y deben consultarse en dicho artículo.

El entrenamiento de esta instancia concreta es un ajuste fino de imitación sobre lerobot/smolvla_base con 100.000 pasos, tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 2,5e-05 y semilla 1000, ejecutado con LeRobot 0.6.1. El dataset `vis22/plates_stack_merged` contiene 30 episodios teleoperados (13.480 fotogramas a 30 FPS) con una única instrucción: "Stack all the plates on top of the blue plate, then return to home position". No se documenta en la información disponible el uso de RLHF, DPO ni de ninguna fase de alineación adicional, algo esperable en una política de imitación de este tipo.

## Capacidades

- Generación de acciones de control de 7 grados de libertad para un brazo `piper_follower` a partir de estado propioceptivo y dos vistas de cámara.
- Ejecución de una tarea de manipulación específica: apilar platos sobre un plato azul y volver a la posición de reposo.
- Fusión multimodal de dos flujos visuales (vista global y vista de pinza) con el estado del robot.
- Condicionamiento por instrucción textual de tarea, aunque en este ajuste fino la instrucción es fija y no se ha evaluado su generalización a otras órdenes.
- Inferencia a la frecuencia de control del dataset (30 FPS), adecuada para bucles de control de robot.
- Integración nativa con el ecosistema LeRobot: los pesos se cargan mediante `lerobot-rollout` y se reentrenan con `lerobot-train`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión generalista, audio ni modo de razonamiento explícito.
- No se documentan capacidades multilingües ni manejo de conversación multi-turno.

## Casos de uso

- Apilado automatizado de platos en entornos de food service o laboratorio: la política está entrenada exactamente para la secuencia "apilar sobre el plato azul y volver a casa", por lo que puede desplegarse directamente sobre un Piper con dos cámaras configuradas como `cam_global` y `cam_gripper`.
- Banco de pruebas para evaluación de políticas VLA: sirve como punto de partida reproducible para medir tasas de éxito en robot real, ya que el flujo de `lerobot-rollout` está documentado y el dataset es público.
- Ajuste fino para tareas de pick-and-place similares: al derivar de lerobot/smolvla_base, el mismo pipeline (`lerobot-train` con `--policy.path=lerobot/smolvla_base`) permite reentrenar sobre nuevos datasets de manipulación con decenas de episodios.
- Investigación en aprendizaje por imitación con pocos datos: el caso demuestra empíricamente el ajuste de una política de 450 M de parámetros con solo 30 episodios y 13.480 fotogramas, útil para estudiar curvas de aprendizaje y sobreajuste.
- Formación y docencia en robótica de bajo coste: al caber en GPU de consumo (0,9 GB de pesos), permite montar un aula o taller con brazos Piper y reproducir el ciclo completo de grabación, entrenamiento y despliegue.
- Validación de infraestructura de control en tiempo real: la política exige operar a la cadencia de 30 FPS del dataset, por lo que es útil para probar latencias de adquisición de cámara, transporte de observaciones y actuación.
- Automatización de demostraciones comerciales: para vídeos o ferias donde se necesite mostrar una tarea de apilado repetitiva sin intervención humana, siempre que el entorno físico coincida con el del entrenamiento.
- Referencia comparativa para nuevos modelos SmolVLA: al compartir base y receta de entrenamiento, permite aislar el efecto del dataset frente a otras variantes publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la sección de evaluación con la frase explícita "No evaluation results have been provided for this policy yet", y no se aportan tasas de éxito en robot real, número de ensayos ni condiciones de prueba.

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 0,9 GB en el repositorio (coherente con precisión de 16 bits para 450 M de parámetros); en FP32 la huella de pesos sería de aproximadamente 1,8 GB. Sumando contexto CUDA, búferes de imagen (dos flujos de 480x640) y el bucle de control, se estima un consumo práctico del orden de 2 a 4 GB de VRAM, si bien no se proporciona una cifra oficial.
- GPU recomendadas: no se especifican en la información disponible. Por tamaño, cualquier GPU con 4 GB o más de VRAM debería ser suficiente; una RTX 3060, RTX 4060 o superior resulta holgada.
- GPU de gama alta (A100, H100, RTX 4090): no son necesarias para inferencia dado el tamaño del modelo; solo tendrían sentido para reentrenamiento a gran escala o para servir muchas instancias en paralelo.
- Cabe en GPU de consumo: sí, con alta probabilidad, dado que los pesos son de 0,9 GB. No se aporta confirmación oficial del autor.
- Opciones de despliegue: el camino documentado es LeRobot, mediante `lerobot-rollout` con `--policy.path=vis22/stack_smolvla_2.5`. El reentrenamiento se realiza con `lerobot-train`. No aplican herramientas de servido de modelos de lenguaje como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no disponibles. El único dato relacionado es que el dataset se grabó a 30 FPS, lo que marca la cadencia de control esperada.
- Requisitos adicionales de hardware: brazo `piper_follower`, dos cámaras que deben publicarse con los nombres `cam_global` y `cam_gripper` a 640x480 y 30 FPS, y el puerto serie del robot configurado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vis22/stack_smolvla_2.5 | 450 M | no disponible | sin resultados de evaluacion publicados | apache-2.0 | Hugging Face (0 descargas, 0 likes) |
| lerobot/smolvla_base | no disponible en la informacion proporcionada (misma familia SmolVLA, aproximadamente 450 M segun los pesos del ajuste) | no disponible | no disponible | no disponible en esta busqueda | Hugging Face, modelo base oficial de LeRobot |
| Otras politicas VLA de proposito general (por ejemplo OpenVLA o pi0) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificado en esta busqueda |

La informacion proporcionada no incluye datos comparativos verificables frente a otras politicas VLA, por lo que no es posible establecer una comparacion cuantitativa de parametros, contexto o rendimiento. La comparacion mas fiable disponible es cualitativa: frente a modelos VLA de proposito general, esta politica esta especializada en una unica tarea de apilado y su ventaja es el tamano reducido y la facilidad de despliegue, no la generalidad.

## Limitaciones y advertencias

- Especializacion extrema: la politica está entrenada para una única instrucción ("Stack all the plates on top of the blue plate, then return to home position"). Cualquier otra tarea queda fuera de su dominio y probablemente producirá acciones sin sentido.
- Dependencia del hardware exacto: solo se ha entrenado para el robot `piper_follower` con dos cámaras en posiciones concretas y nombres fijos (`cam_global`, `cam_gripper`). Cambiar la cinemática, la calibración, la iluminación o la disposición de las cámaras degradará el comportamiento.
- Dataset muy pequeño: 30 episodios y 13.480 fotogramas son insuficientes para una generalización robusta. Es esperable sobreajuste a posiciones, colores y condiciones concretas de la mesa.
- Sin evaluación publicada: no existen tasas de éxito, número de ensayos ni condiciones de prueba. No hay evidencia pública de que la politica funcione de forma fiable, ni siquiera en el entorno de entrenamiento.
- Riesgo de fallo silencioso en robot real: al ser una politica de imitación sin mecanismos de seguridad, puede generar trayectorias que colisionen con objetos, con la mesa o con el propio brazo. Es imprescindible operar con parada de emergencia, límites de par y supervisión humana.
- Sin resultados de benchmarks: no se puede comparar objetivamente con alternativas ni estimar su calidad relativa.
- Idiomas y lenguaje: no se documenta ningún soporte multilingüe; el condicionamiento textual se limita a la instrucción de entrenamiento y no se ha probado su variación.
- Cuantizaciones: no se documentan formatos cuantizados, por lo que no hay garantías de que el modelo mantenga su comportamiento fuera de la precisión original.
- Reputación del repositorio: cero descargas y cero valoraciones, publicado por un usuario individual sin evaluación asociada. Debe tratarse como material experimental, no como componente listo para producción.
- Licencia: apache-2.0 permite uso comercial y modificaciones con atribución, pero la licencia no cubre patentes, seguridad funcional ni responsabilidad sobre daños físicos causados por el robot.
- Sin información sobre sesgos: no se documenta ningún análisis de sesgo demográfico, de iluminación o de composición de objetos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vis22/stack_smolvla_2.5
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/vis22/plates_stack_merged
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=vis22/plates_stack_merged
- Artículo de SmolVLA (arXiv:2506.01844): https://huggingface.co/papers/2506.01844
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación completa de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot en GitHub: https://github.com/huggingface/lerobot
