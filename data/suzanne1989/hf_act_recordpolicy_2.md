# suzanne1989/hf_act_recordpolicy_2

## Resumen

`hf_act_recordpolicy_2` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario suzanne1989 en Hugging Face y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje: es un modelo de control visuomotor que consume el estado de las articulaciones y dos cámaras (muñeca y estática) para producir comandos de acción de 6 dimensiones en un robot de tipo `so_follower` (brazo SO-100/SO-101). El modelo resuelve la tarea concreta "Grab the green duplo", aprendida por imitación a partir de 30 episodios teleoperados.

La relevancia de esta ficha es doble. Por un lado, ilustra el flujo estándar de LeRobot para entrenar y desplegar políticas robóticas en hardware de bajo coste. Por otro, sirve como ejemplo de artefacto experimental: el repositorio tiene 21 descargas, 0 likes, no incluye resultados de evaluación y el dataset de entrenamiento es un conjunto de prueba (`record-test-6`) con solo 10.255 fotogramas a 30 FPS. Es, por tanto, un modelo de demostración más que una política lista para producción.

Arquitectónicamente es un transformer con codificador visual y decodificador de acciones que predice *chunks* de acciones (secuencias cortas) en lugar de pasos individuales, lo que reduce el error de acumulación típico de las políticas paso a paso. El checkpoint contiene 51.668.614 parámetros en formato safetensors y el repositorio ocupa 3,1 GB, en su mayor parte pesos del backbone visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): transformer con codificador visual y decodificador de acciones con predicción de chunks |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana temporal fija de observaciones, sin especificar en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo de control robótico, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper arXiv:2304.13705. La política combina un backbone visual (codificador de imágenes) que procesa dos cámaras a resolución 480x640, una proyección del estado proprioceptivo de 6 dimensiones y un transformer que genera *chunks* de acciones de tamaño fijo. Predecir secuencias de acciones en lugar de un único paso mitiga el problema de cambio de distribución (*compounding error*) de las políticas reactivas clásicas y suaviza la ejecución en el robot. La model card no detalla la configuración interna del transformer (número de capas, dimensión oculta, número de cabezas) ni el tamaño del chunk.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `suzanne1989/record-test-6`: 30 episodios, 10.255 fotogramas a 30 FPS, una única tarea ("Grab the green duplo") y un robot `so_follower` con cámaras `wrist` y `static`. La configuración reportada es de 25.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-5 y semilla 1000. No se menciona uso de RLHF, DPO ni aumento de datos; es aprendizaje supervisado puro sobre demostraciones teleoperadas. No hay información sobre la composición del dataset más allá del número de episodios y fotogramas.

## Capacidades

- Control visuomotor de un brazo robótico `so_follower` con 6 grados de libertad de acción.
- Fusión de dos flujos visuales (cámara de muñeca y cámara estática) con el estado de las articulaciones.
- Predicción de chunks de acciones para ejecución suave y robusta a corto plazo.
- Ejecución de una única tarea de manipulación: coger un bloque Duplo verde.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo *thinking*, visión general, audio ni otras modalidades fuera del pipeline robótico.

## Casos de uso

- **Demostración de imitación en robótica de bajo coste:** replicar el flujo completo de LeRobot (grabación, entrenamiento, despliegue) en un brazo SO-100/SO-101 para validar la cadena de herramientas antes de abordar tareas más complejas.
- **Recogida de objetos en entornos controlados:** usar la política para coger un bloque Duplo verde en una mesa con iluminación y posiciones similares a las del dataset; útil como banco de pruebas de percepción y control.
- **Generación de datos sintéticos de evaluación:** ejecutar la política en bucle para producir trayectorias etiquetadas que alimenten análisis de estabilidad o comparaciones entre checkpoints.
- **Prototipado de pipelines de aprendizaje por imitación:** servir como referencia mínima (30 episodios, 25.000 pasos) para calibrar hiperparámetros y tiempos de entrenamiento en ACT.
- **Investigación en robustez visual:** evaluar cómo afectan cambios de iluminación, posición de la cámara o distracciones al rendimiento de una política ACT entrenada con pocos datos.
- **Educación y talleres:** ejemplo didáctico de modelo robótico publicado en el Hub con licencia permisiva, adecuado para cursos de robótica o de *machine learning* aplicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet", por lo que no hay tasas de éxito en robot real ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- **VRAM estimada para inferencia:** no disponible en la información proporcionada; con 51,7 M de parámetros en FP32 el peso ronda los 207 MB, pero el backbone visual y las activaciones elevan el consumo real. Una GPU consumer de 8 GB debería ser suficiente en la práctica, aunque no hay cifras oficiales.
- **GPU recomendadas:** no especificadas por el autor. Para entrenamiento con batch size 8 y dos cámaras a 480x640 se recomienda al menos una GPU con 12-16 GB (RTX 4080/4090, A10, L4). Para inferencia en tiempo real a 30 FPS, una RTX 3060 o superior es razonable.
- **¿Cabe en GPU consumer?** Sí, previsiblemente en cualquier GPU con 8 GB o más; el cuello de botella es más probablemente el *pipeline* de cámaras y la latencia del bus del robot que la memoria.
- **Opciones de despliegue:** LeRobot (`lerobot-rollout`), con soporte de PyTorch y CUDA. No hay indicios de soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput:** no disponibles. El dataset está grabado a 30 FPS, lo que sugiere que el bucle de control debe sostener esa frecuencia, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `suzanne1989/hf_act_recordpolicy_2` | 51,7 M | no aplica | Manipulación (coger Duplo) | Apache 2.0 | Hugging Face |
| ACT original (paper 2304.13705) | no disponible | no aplica | Manipulación diversa (ALOHA) | según implementación | Paper + código de referencia |
| Diffusion Policy (referencia habitual en LeRobot) | no disponible | no aplica | Manipulación visuomotora | MIT (implementación de referencia) | Repositorios públicos |
| Políticas VLA tipo OpenVLA / π0 | miles de millones | largo (instrucciones en lenguaje) | Manipulación generalista | variable | Hugging Face / papers |

No se dispone de datos de rendimiento comparables para este checkpoint concreto, por lo que la comparación se limita a parámetros, licencia y disponibilidad. Frente a políticas VLA generalistas, este modelo es dos o tres órdenes de magnitud más pequeño y está especializado en una sola tarea; frente a ACT de referencia, comparte método pero con un dataset mucho más reducido.

## Limitaciones y advertencias

- **Sesgo de dominio:** entrenado con 30 episodios y 10.255 fotogramas de una sola tarea; probablemente fallará ante cambios de posición, iluminación, fondo u objetos distintos al bloque Duplo verde.
- **Riesgo de sobreajuste:** 25.000 pasos con batch size 8 sobre un dataset pequeño sugiere alta probabilidad de memorizar trayectorias; no hay validación publicada.
- **Sin evaluación:** no hay tasas de éxito ni protocolo de evaluación, por lo que no se puede afirmar que la política funcione de forma fiable.
- **Dependencia de hardware:** requiere un robot `so_follower` y dos cámaras con los nombres `wrist` y `static`; cualquier cambio en la configuración de sensores invalida la política.
- **Sin capacidades lingüísticas:** no procesa instrucciones en lenguaje natural; la tarea está fijada en el entrenamiento.
- **Licencia Apache 2.0:** permite uso comercial, pero el autor no ofrece garantías y el modelo es experimental; conviene auditar antes de integrarlo en un producto.
- **Fecha de creación futura (2026-10-29):** metadato atípico que conviene verificar antes de citar el modelo en publicaciones.
- **Sin información sobre cuantización:** no se han publicado versiones GGUF/ONNX ni recetas de exportación, lo que limita el despliegue en hardware embebido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/suzanne1989/hf_act_recordpolicy_2
- Dataset de entrenamiento: https://huggingface.co/datasets/suzanne1989/record-test-6
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=suzanne1989/record-test-6
