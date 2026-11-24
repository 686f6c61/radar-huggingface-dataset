# TommasoL/my_pi05_policy_place

## Resumen

TommasoL/my_pi05_policy_place es una política de visión-lenguaje-acción (VLA) obtenida por ajuste fino del modelo base lerobot/pi05_base, la implementación en LeRobot de π₀.₅ de Physical Intelligence. El modelo consume dos cámaras (vista lateral y vista de muñeca) a resolución 480x640 junto con el estado articular del robot (vector de 7 dimensiones) y produce comandos de acción de 7 dimensiones, típicos de un brazo manipulador de 6 ejes más pinza. Está entrenado específicamente para un robot Kinova Gen3 y para dos tareas de colocación de objetos en cajas de colores.

El ajuste fino se realizó sobre un conjunto de datos propio y muy reducido: 48 episodios y 9208 fotogramas a 10 FPS, capturados con el robot Kinova Gen3. El entrenamiento consistió en 10 000 pasos con batch de 16, optimizador AdamW y tasa de aprendizaje 2,5e-05, usando LeRobot 0.6.1. El repositorio ocupa 9,4 GB y contiene 4 143 404 816 parámetros en formato safetensors, lo que sitúa al modelo en la categoría de políticas VLA de varios miles de millones de parámetros, no en la de modelos de lenguaje ligeros.

Su relevancia es doble: por un lado demuestra el flujo completo de LeRobot para ajustar π₀.₅ a un robot concreto con muy pocos datos; por otro, es un ejemplo de política de imitación de nicho, sin resultados de evaluación publicados y con cero descargas, por lo que debe tratarse como un artefacto experimental y no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) π₀.₅, implementación LeRobot del repositorio OpenPI de Physical Intelligence; detalles internos de capas no disponibles |
| Parametros totales | 4 143 404 816 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (modelo orientado a instrucciones de tarea en inglés: "put the item in the blue box", "put the item in the red box") |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

El modelo es una política VLA basada en π₀.₅, la evolución de π₀ de Physical Intelligence orientada a la generalización en entornos abiertos. La implementación procede del repositorio OpenPI y se ha adaptado a LeRobot. La entrada combina dos flujos visuales de 3x480x640 píxeles (cámara lateral y cámara de muñeca) con un vector de estado de 7 dimensiones; la salida es un vector de acción de 7 dimensiones. No se dispone de información sobre el número de capas, la dimensión oculta, el mecanismo de atención ni el esquema exacto de fusión visión-lenguaje-acción en la información proporcionada.

El ajuste fino se realizó por imitación sobre el dataset TommasoL/Kinova_Place, compuesto por 48 episodios y 9208 fotogramas a 10 FPS, con dos instrucciones de tarea ("put the item in the blue box" y "put the item in the red box"). La configuración de entrenamiento fue de 10 000 pasos, batch de 16, AdamW, learning rate 2,5e-05 y semilla 1000, sobre LeRobot 0.6.1. No se especifica si hubo RLHF, DPO ni ninguna fase de refinamiento posterior; tampoco se detalla la composición del dataset más allá de las dos tareas y el robot Kinova Gen3.

## Capacidades

- Generación de acciones de manipulación de 7 dimensiones (6 ejes más pinza) a partir de observaciones visuales y de estado articular.
- Percepción visual mediante dos cámaras simultáneas: vista lateral y vista de muñeca, ambas a 480x640.
- Ejecución de instrucciones de tarea en lenguaje natural, limitadas en este ajuste a dos consignas de colocación de objetos en cajas de colores.
- Política de imitación entrenada para un robot concreto (Kinova Gen3), no para un conjunto amplio de morfologías.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, razonamiento explícito (thinking mode), audio ni visión generalista más allá de las dos cámaras de entrada.
- Capacidades multilingües: no disponibles; las tareas de entrenamiento están en inglés.

## Casos de uso

- Colocación de objetos en cajas de colores con un Kinova Gen3: es el caso de uso directo para el que se entrenó, con las dos instrucciones del dataset. Adecuado porque la política ha sido ajustada exactamente sobre esas trayectorias y ese robot.
- Banco de pruebas de ajuste fino en LeRobot: sirve como referencia de un pipeline completo (grabación de datos, entrenamiento con `lerobot-train`, despliegue con `lerobot-rollout`) para equipos que quieran replicar el flujo con sus propios datos.
- Prototipado de manipulación en laboratorio: permite validar la integración de cámaras, calibración y bucle de control con un robot real antes de invertir en datasets mayores.
- Docencia e investigación en imitación visual: al ser un ajuste pequeño y reproducible (48 episodios, 10 000 pasos), es útil para estudiar el efecto del tamaño de dataset y de la configuración de entrenamiento en políticas VLA.
- Evaluación comparativa de políticas VLA: puede emplearse como línea base de un ajuste fino de π₀.₅ frente a otras políticas sobre el mismo robot y tareas.
- Generación de datos sintéticos o aumento de dataset: las trayectorias ejecutadas pueden servir para analizar el comportamiento de la política y detectar modos de fallo antes de ampliar la recolección de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía con la nota explícita de que no se han proporcionado resultados para esta política.

## Requisitos de hardware

- VRAM estimada para inferencia: con 4 143 404 816 parámetros en safetensors, en FP16/BF16 se requieren aproximadamente 8,3 GB solo para pesos, más el coste de activaciones y de los dos flujos de imagen; en FP32 serían unos 16,6 GB. No se han publicado mediciones reales de consumo.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una GPU con 16 GB o más (por ejemplo, RTX 4090, A100, H100) es el punto de partida razonable, pero no hay datos oficiales que lo confirmen.
- ¿Cabe en GPU de consumo? Probablemente en tarjetas de 16 GB o más en precisión reducida, aunque no se ha verificado ni documentado.
- Opciones de despliegue: LeRobot, mediante `lerobot-rollout` con `--policy.path=TommasoL/my_pi05_policy_place` y `--strategy.type=base`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política robótica de este tipo.
- Latencia y throughput: no disponibles. El dataset se grabó a 10 FPS, pero no se especifica la frecuencia de control en inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TommasoL/my_pi05_policy_place | 4 143 404 816 | no disponible | 2 tareas de colocación, Kinova Gen3 | Apache 2.0 | Hugging Face, 0 descargas |
| lerobot/pi05_base | no disponible en la información | no disponible | base VLA generalista de π₀.₅ | no disponible en la información | Hugging Face (modelo base) |
| π₀ (Physical Intelligence) | no disponible en la información | no disponible | VLA generalista | no disponible en la información | OpenPI (open source) |

La comparación cuantitativa con alternativas no está disponible: no se han publicado métricas de éxito para esta política ni se dispone de cifras de rendimiento del modelo base en la información proporcionada.

## Limitaciones y advertencias

- Sin resultados de evaluación: la model card indica explícitamente que no se han proporcionado resultados; no hay tasas de éxito verificadas.
- Dataset muy reducido: 48 episodios y 9208 fotogramas limitan la generalización a posiciones de objeto, iluminación y configuraciones vistas en la recolección.
- Especialización estrecha: solo dos instrucciones de tarea y un único tipo de robot (Kinova Gen3); no se espera transferencia directa a otros brazos o tareas.
- Dependencia de las cámaras: los nombres y la configuración de las cámaras deben coincidir con las claves de observación del entrenamiento (`side`, `wrist`) y con la resolución 480x640.
- Riesgo de sobreajuste y de fallos silenciosos: al ser un ajuste fino corto sobre pocos datos, puede reproducir sesgos de las demostraciones y fallar ante objetos o disposiciones nuevas.
- Idiomas: las instrucciones de tarea están en inglés; no hay evidencia de soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base y las dependencias de LeRobot deben revisarse por separado; no se detallan restricciones adicionales.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa; tratarlo como artefacto experimental.
- No hay información sobre sesgos, alucinación en el sentido lingüístico ni límites de contexto, por lo que no pueden evaluarse esos riesgos con los datos disponibles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TommasoL/my_pi05_policy_place
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/TommasoL/Kinova_Place
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TommasoL/Kinova_Place
- Blog de π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de π₀.₅ en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
