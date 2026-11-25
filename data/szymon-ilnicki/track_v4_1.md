# Szymon-Ilnicki/track_v4_1

## Resumen

`Szymon-Ilnicki/track_v4_1` es un ajuste fino (fine-tune) del modelo vision-language-action (VLA) SmolVLA, publicado en el Hub de Hugging Face bajo la librería LeRobot. Lo desarrolla el usuario Szymon-Ilnicki a partir del checkpoint base `lerobot/smolvla_base`, y su propósito es controlar un vehículo de escala 1:10 tipo F1TENTH en tareas de conducción autónoma por circuito, completando vueltas en ambos sentidos y a distintas velocidades.

El modelo no es un LLM conversacional, sino una política de imitación que mapea observaciones multimodales (dos cámaras frontales a 240x424 píxeles y un vector de estado de 2 dimensiones) a acciones de 2 dimensiones (probablemente dirección y aceleración). Con 450 millones de parámetros, encaja en la categoría de VLA compacto que SmolVLA popularizó: suficiente capacidad para tareas de control visomotor sin requerir hardware de datacenter.

Es relevante porque muestra el flujo completo de LeRobot aplicado a robótica de competición: recogida de datos con 36 episodios a 10 FPS, entrenamiento supervisado con AdamW durante 20 000 pasos y despliegue con `lerobot-rollout`. No obstante, es un artefacto muy específico de un robot y un circuito concretos, sin resultados de evaluación publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en SmolVLA, transformer multimodal con codificador visual y decodificador de acciones |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (política de imitación, no modelo de lenguaje con ventana de contexto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa; LeRobot no documenta cuantizaciones para este checkpoint) |
| Idiomas soportados | no disponible (las instrucciones de tarea están en inglés en el dataset: "complete laps anticlockwise slowly", etc.) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,2 GB) |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto presentado en el paper arXiv:2506.01844. Combina un codificador visual que procesa dos flujos de imagen de 3x240x424 con un modelo de lenguaje preentrenado que condiciona la generación de acciones sobre la instrucción de tarea en lenguaje natural. La salida es un vector de acción de 2 dimensiones por paso, típico de un vehículo diferencial o Ackermann simplificado como el F1TENTH.

El ajuste fino se realizó sobre el dataset local `track_v4_1`, con 36 episodios y 9 832 fotogramas a 10 FPS, etiquetados con cuatro tareas: vueltas en sentido antihorario lento, antihorario rápido, horario lento y horario rápido. La configuración de entrenamiento reportada es de 20 000 pasos, batch size 8, optimizador AdamW, learning rate 1e-4, semilla 1000 y LeRobot 0.7.0. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales; es aprendizaje por imitación supervisado puro.

## Capacidades

- Control visomotor de un vehículo F1TENTH a partir de dos cámaras y un estado de 2 dimensiones.
- Seguimiento de instrucciones de tarea en lenguaje natural entre cuatro variantes (sentido de giro y velocidad).
- Conducción de circuito con cambios de sentido (horario y antihorario) y de régimen (lento y rápido).
- Inferencia en tiempo real a 10 FPS, la frecuencia de los datos de entrenamiento.
- Integración nativa con el ecosistema LeRobot (`lerobot-rollout`, `lerobot-train`).
- No soporta tool calling, agentes multi-paso, razonamiento simbólico ni generación de texto libre: es una política de acciones, no un asistente.

## Casos de uso

- Conducción autónoma de un F1TENTH en circuito: el modelo recibe las dos imágenes de cámara y el estado del vehículo y emite las acciones de control directamente, sustituyendo un stack clásico de percepción-planificación-control por una política neuronal extremo a extremo.
- Investigación en aprendizaje por imitación: sirve como referencia reproducible de un pipeline LeRobot completo (grabación, entrenamiento, despliegue) para comparar hiperparámetros o arquitecturas VLA en una tarea de control real.
- Benchmark de VLA compactos en robótica móvil: con 450 M de parámetros y despliegue en hardware de consumo, permite medir la brecha entre modelos pequeños y VLA de mayor tamaño en tareas de conducción.
- Docencia y formación en robótica: el modelo y su dataset asociado permiten a estudiantes reproducir el flujo de trabajo sin necesidad de GPUs de datacenter.
- Pruebas de robustez visual: al depender de dos cámaras, es útil para estudiar cómo afectan cambios de iluminación, oclusiones o desalineación de cámaras al rendimiento de una política VLA.
- Base para nuevos ajustes finos: cualquier equipo con un F1TENTH puede partir de este checkpoint y reentrenar con su propio circuito y estilo de conducción, aprovechando que la licencia Apache 2.0 permite uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real (tabla de éxito vacía).

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 1,2 GB en safetensors, por lo que en FP32 requiere aproximadamente 1,8 GB y en FP16 alrededor de 0,9 GB, más el coste de activaciones del codificador visual con dos imágenes de 240x424.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM es suficiente; una RTX 3060, RTX 4060 o RTX 4090 funcionan sin problema. Para entrenamiento, se recomienda al menos 8-12 GB por el batch size 8 y el estado del optimizador.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPUs consumer modernas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`), que es la vía documentada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponible de forma oficial; el entrenamiento y la inferencia están pensados para operar a 10 FPS, la frecuencia del dataset.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / frecuencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Szymon-Ilnicki/track_v4_1 | 450 M | VLA fine-tune para F1TENTH | 10 FPS, 2 cámaras 240x424 | Apache 2.0 | Hugging Face (LeRobot) |
| lerobot/smolvla_base | no disponible | VLA base SmolVLA | no disponible | Apache 2.0 | Hugging Face |
| Políticas ACT / Diffusion Policy en LeRobot | variable (decenas de M) | Políticas de imitación sin componente de lenguaje | dependiente del dataset | Apache 2.0 | Hugging Face / LeRobot |
| OpenVLA | ~7 B | VLA generalista | imágenes 224x224, instrucciones en inglés | Licencia propia (ver repo) | Hugging Face |

La comparación con OpenVLA es ilustrativa del salto de escala: SmolVLA y este fine-tune priorizan despliegue en hardware de consumo, mientras que OpenVLA apunta a mayor generalización a costa de un orden de magnitud más de parámetros.

## Limitaciones y advertencias

- Sin resultados de evaluación publicados: no hay tasa de éxito medida en robot real, por lo que el rendimiento real es desconocido.
- Especialización extrema: entrenado para un robot F1TENTH concreto, dos cámaras con nombres y resoluciones específicas (`camera1`, `camera2`, 240x424) y un circuito concreto. No generaliza a otros robots, sensores ni entornos sin reentrenamiento.
- Dataset pequeño: 36 episodios y 9 832 fotogramas son una base limitada; es probable sobreajuste a las condiciones de iluminación, textura del circuito y posiciones de cámara del registro original.
- Riesgo de alucinación en el sentido de acciones erráticas: al ser una política de imitación, puede producir comandos fuera de distribución ante escenas no vistas, con riesgo físico para el vehículo.
- Idiomas: las instrucciones de tarea están en inglés; no se documenta soporte multilingüe.
- Sesgos: no documentados por el autor; al derivar de un modelo base entrenado con datos de robótica, puede heredar sesgos de esos datasets.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene verificar la licencia del modelo base y del dataset asociado.
- Frecuencia fija de 10 FPS: desplegarlo a otra frecuencia puede degradar el comportamiento si no se reentrena o se ajusta el controlador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v4_1
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v4_1
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset
