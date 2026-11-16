# Szymon-Ilnicki/track_v3_dual-image

## Resumen

`Szymon-Ilnicki/track_v3_dual-image` es una política de visión-lenguaje-acción (VLA) compacta obtenida mediante ajuste fino supervisado de `lerobot/smolvla_base`, el modelo base de la familia SmolVLA publicada por Hugging Face. El modelo está especializado en una única tarea de robótica real: completar vueltas a un circuito con un vehículo de tipo `f1tenth` (plataforma de coche RC escala 1:10), en sentido horario y antihorario, a partir de dos cámaras frontales y del estado del vehículo.

La relevancia de esta ficha no reside en el modelo en sí (un ajuste fino de nicho con 12 episodios de entrenamiento y cero descargas en el momento de la consulta), sino en que sirve como ejemplo canónico de cómo se empaqueta hoy una política SmolVLA en el ecosistema LeRobot: pesos en `safetensors`, metadatos de observación y acción declarados en la model card, y un pipeline de despliegue basado en `lerobot-rollout`. SmolVLA, el método subyacente, se presenta en el paper arXiv:2506.01844 como un VLA de ~450 M de parámetros diseñado para ejecutarse en hardware de consumo.

El modelo tiene 450.046.176 parámetros (dato extraído del índice de safetensors), un repositorio de 1,2 GB y licencia Apache 2.0. No es un modelo de lenguaje: no genera texto libre ni responde a instrucciones en lenguaje natural más allá de la cadena de tarea que condiciona la política. Cualquier evaluación de "capacidades" debe entenderse en el marco de la robótica de imitación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action), ajuste fino de `lerobot/smolvla_base`; arquitectura interna exacta no disponible en la informacion proporcionada |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; la política consume observaciones por paso) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles (la tarea se especifica en inglés: "complete laps around the track anticlockwise" / "clockwise") |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`) |
| Tipo de robot | `f1tenth` |
| Camaras | `camera1`, `camera2` |
| Entrada visual | `observation.images.camera1` `(3, 240, 424)`, `observation.images.camera2` `(3, 240, 424)` |
| Entrada de estado | `observation.state` `(2,)` |
| Salida | `action` `(2,)` |
| Tamano del repositorio | 1,2 GB |
| Dataset de entrenamiento | `local/track_v3`: 12 episodios, 4870 frames, 10 FPS |
| Pasos de entrenamiento | 20000 |
| Batch size | 8 |
| Optimizador | AdamW |
| Learning rate | 0.0001 |
| Semilla | 1000 |
| Version de LeRobot | 0.7.0 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `lerobot/smolvla_base`, la implementación de referencia de SmolVLA en LeRobot. SmolVLA se describe en el paper arXiv:2506.01844 como un VLA compacto y eficiente que alcanza rendimiento competitivo con coste computacional reducido y puede desplegarse en hardware de consumo. La arquitectura interna concreta (backbone visual, encoder de lenguaje, política de acción, mecanismo de fusión) no se detalla en la información proporcionada; la model card solo remite al paper y a la documentación de LeRobot.

El entrenamiento es de imitación supervisada sobre el dataset `local/track_v3`, compuesto por 12 episodios y 4870 frames grabados a 10 FPS, con dos tareas declaradas: "complete laps around the track anticlockwise" y "complete laps around the track clockwise". La configuración reportada es de 20000 pasos, batch size 8, AdamW con learning rate 1e-4 y semilla 1000, ejecutado con LeRobot 0.7.0. No se menciona RLHF, DPO ni ninguna fase de alineación posterior; tampoco se documenta composición del dataset más allá del recuento de episodios y frames, ni aumentos de datos, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.).

La entrada es multimodal y de dimensión fija: dos imágenes RGB de 240×424 píxeles y un vector de estado de 2 dimensiones. La salida es un vector de acción de 2 dimensiones, coherente con un vehículo con control diferencial o de dirección y aceleración (la semántica exacta de las dos componentes no se especifica en la información disponible). El condicionamiento por tarea se realiza mediante la cadena de texto pasada en `--task`.

## Capacidades

- Control de un vehículo `f1tenth` a partir de dos cámaras y estado de 2 dimensiones, generando acciones de 2 dimensiones.
- Ejecución de la tarea "complete laps around the track anticlockwise" (vueltas al circuito en sentido antihorario).
- Ejecución de la tarea "complete laps around the track clockwise" (vueltas al circuito en sentido horario).
- Política de imitación condicionada por instrucción de tarea en lenguaje natural (una cadena corta en inglés).
- Percepción visual dual: dos flujos de imagen independientes de 240×424, lo que permite cierta cobertura angular o estereoscópica según el montaje físico.
- Inferencia en tiempo real dentro del bucle de control de LeRobot mediante `lerobot-rollout`.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, agentes, matemáticas, generación de texto libre, visión general, audio ni modo "thinking". Es una política robótica, no un LLM de propósito general.

## Casos de uso

- **Conducción autónoma de un f1tenth en circuito cerrado**: el caso de uso directo. Se lanza `lerobot-rollout` con `--robot.type=f1tenth`, las dos cámaras configuradas y `--task="complete laps around the track anticlockwise"`; la política genera acciones a partir de las imágenes y del estado. Adecuado porque el modelo fue entrenado exactamente sobre ese robot y ese circuito.
- **Punto de partida para ajuste fino con nuevos datos**: al estar construido sobre `lerobot/smolvla_base` y publicarse con licencia Apache 2.0, sirve como inicialización para reentrenar con un dataset propio usando `lerobot-train --policy.path=lerobot/smolvla_base` o partiendo de estos pesos. Útil para equipos que quieren una referencia funcional de un pipeline VLA completo.
- **Referencia docente de imitación visual en robótica**: el repositorio documenta entradas, salidas, dataset y configuración de entrenamiento de forma explícita, lo que lo convierte en material didáctico para explicar el ciclo grabar-dataset-entrenar-desplegar en LeRobot.
- **Banco de pruebas de latencia en hardware de consumo**: con 450 M de parámetros y 1,2 GB de pesos, permite medir si un equipo con GPU de gama media sostiene el bucle de control a 10 FPS, la frecuencia de grabación del dataset.
- **Validación de un montaje de dos cámaras**: el modelo exige dos flujos de 240×424; sirve para verificar calibración, sincronización y encuadre de un sistema estéreo o de dos cámaras frontales antes de invertir en un dataset mayor.
- **Comparación de estrategias horaria/antihoraria**: al soportar ambas instrucciones de tarea, permite estudiar si una sola política condicionada por texto generaliza a dos direcciones de circulación o si una de ellas degrada.
- **Prototipado de conducción en pista antes de escalar a un vehículo mayor**: el coste de iteración (12 episodios, 4870 frames) es bajo, lo que permite ciclos rápidos de recogida de datos y reentrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación con la plantilla vacía y la nota explícita "_No evaluation results have been provided for this policy yet._". No hay tasas de éxito, ni comparaciones con otras políticas, ni métricas de seguimiento de trayectoria.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. Con 450 M de parámetros en `safetensors`, los pesos en FP32 ocupan aproximadamente 1,8 GB y en FP16/BF16 unos 0,9 GB; a ello hay que sumar activaciones de dos flujos de imagen de 240×424 y el resto del grafo. Estas cifras son estimaciones a partir del recuento de parámetros, no datos publicados.
- **GPU recomendadas**: no especificadas por el autor. El paper de SmolVLA afirma despliegue en hardware de consumo; la model card no enumera modelos concretos (A100, H100, RTX 4090, etc.).
- **GPU de consumo**: plausible por tamaño, pero no confirmado en la información proporcionada; no se indica ningún modelo concreto que haya sido validado.
- **Opciones de despliegue**: `lerobot-rollout` con `--policy.path=Szymon-Ilnicki/track_v3_dual-image` y `--strategy.type=base` (sin grabación de episodios). El ecosistema LeRobot es la vía documentada; no se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de acción.
- **Latencia y throughput**: no disponibles. El dataset se grabó a 10 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se publica ninguna medición.
- **Requisitos de robot**: `f1tenth` con puerto serie accesible y dos cámaras OpenCV; los nombres de cámara deben coincidir exactamente con `camera1` y `camera2`.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Szymon-Ilnicki/track_v3_dual-image` | 450.046.176 | SmolVLA ajustado a f1tenth, 2 cámaras 240×424 + estado (2,) | No aplica contexto de LLM; salida acción (2,) | apache-2.0 | Hugging Face, 0 descargas |
| `lerobot/smolvla_base` | no disponible en la informacion proporcionada (misma familia, ~450 M según el ajuste) | SmolVLA base, propósito general | No disponible | no disponible en la informacion proporcionada | Hugging Face (modelo base citado) |
| Políticas ACT / Diffusion Policy en LeRobot | no disponible | Políticas de imitación visual | No disponible | no disponible | Ecosistema LeRobot |

La comparación con alternativas de la misma categoría (otras políticas VLA o de imitación visual) no puede completarse con datos verificables a partir de la información proporcionada: no se dispone de parámetros, contexto ni rendimiento de los modelos comparables. Cualquier cifra adicional sería inventada.

## Limitaciones y advertencias

- **Sesgo de dominio extremo**: entrenado con 12 episodios y 4870 frames de un único circuito. No hay evidencia de generalización a otras pistas, iluminación, superficies o disposiciones de cámara.
- **Sin evaluación publicada**: no existe tasa de éxito ni medición de degradación; desplegarlo en un vehículo real conlleva riesgo físico no cuantificado.
- **Riesgo de alucinación en el sentido de acciones incorrectas**: como toda política de imitación, puede producir acciones plausibles pero erróneas fuera de la distribución de entrenamiento, sin señal de incertidumbre documentada.
- **Dependencia dura del montaje**: los nombres `camera1` y `camera2`, las resoluciones 240×424 y el vector de estado de 2 dimensiones son obligatorios; un montaje distinto invalida el modelo.
- **Condicionamiento por tarea en inglés**: las dos cadenas de tarea están en inglés y no se documenta soporte multilingüe; usar otra formulación puede degradar el comportamiento.
- **Licencia Apache 2.0**: permite uso comercial y modificación con atribución y aviso de cambios; no se documentan restricciones adicionales, pero el uso en un robot real queda bajo responsabilidad del operador.
- **Metadatos incompletos**: sin información sobre cuantización, idiomas, requisitos de hardware ni latencia; la ficha del autor es una plantilla de LeRobot parcialmente rellenada.
- **Cero tracción comunitaria**: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de funcionamiento.
- **Fecha de creación futura**: el repositorio figura creado el 2026-11-16, lo que conviene verificar antes de tomar los metadatos como definitivos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Szymon-Ilnicki/track_v3_dual-image
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844 (arXiv:2506.01844)
- Dataset de entrenamiento: https://huggingface.co/datasets/local/track_v3
- Visualizador de dataset de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=local/track_v3
- Guía de SmolVLA en LeRobot: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
