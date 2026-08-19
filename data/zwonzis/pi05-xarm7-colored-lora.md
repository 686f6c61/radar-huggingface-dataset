# zwonzis/pi05-xarm7-colored-lora

## Resumen

El modelo `zwonzis/pi05-xarm7-colored-lora` es un adaptador LoRA de tipo Vision-Language-Action (VLA) desarrollado por el usuario zwonzis, que fine-tunea el modelo base `lerobot/pi05_base` (π₀.₅ de Physical Intelligence) para controlar un brazo robótico xArm7 en tareas de manipulación pick-and-place. Está entrenado con el framework LeRobot de Hugging Face y publicado bajo licencia Apache 2.0.

El modelo resuelve el problema de generalización en robótica: parte de un VLA preentrenado con capacidades de razonamiento visual y lingüístico, y se adapta mediante aprendizaje por imitación a un conjunto de tareas específicas que consisten en recoger bolas de colores (naranja, roja, amarilla, verde, azul) y depositarlas en un cuenco cian. El dataset de entrenamiento contiene 605 episodios y más de 422 000 fotogramas capturados a 30 FPS con cámaras de base y muñeca.

La relevancia de este modelo radica en que demuestra el flujo completo de fine-tuning de un VLA de última generación (π₀.₅) sobre un robot real usando herramientas open source, con un tamaño de repositorio de solo 0.3 GB al tratarse de un adaptador LoRA. Es un ejemplo práctico de cómo adaptar modelos de acción visual-lingüística a entornos y tareas concretas sin necesidad de reentrenar desde cero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en π₀.₅ (Pi05), implementacion LeRobot, adaptador LoRA |
| Parametros totales | no disponible (el adaptador LoRA ocupa 0.3 GB; el modelo base `lerobot/pi05_base` no especifica su numero de parametros en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de robotica, no procesa texto de forma generativa) |
| Tipos de cuantizacion | safetensors (formato nativo de LeRobot) |
| Idiomas soportados | no disponible (las tareas estan definidas en ingles, pero no se documenta soporte multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning LoRA del VLA π₀.₅ (Pi05) de Physical Intelligence, implementado en LeRobot a partir del repositorio OpenPI. π₀.₅ es un modelo de visión-lenguaje-acción diseñado para generalizar a entornos y situaciones no vistas durante el entrenamiento. La arquitectura combina un codificador visual, un modelo de lenguaje y una cabeza de acción que produce comandos de control del robot.

El entrenamiento se realizó sobre el dataset `zwonzis/xarm7_dataset_colored`, que contiene 605 episodios y 422 515 fotogramas a 30 FPS, con cinco tareas de pick-and-place que varían el color de la bola (naranja, roja, amarilla, verde, azul) y un cuenco cian fijo. La configuración de entrenamiento incluye 50 000 pasos, batch size de 16, optimizador AdamW con learning rate de 2.5e-5 y semilla 1000, usando LeRobot versión 0.6.2. No se menciona el uso de RLHF ni DPO; se trata de aprendizaje por imitación supervisado sobre demostraciones.

Una innovación destacable es el uso de un adaptador LoRA, que permite fine-tuning eficiente del modelo base sin modificar todos sus parámetros. El experimento de "colored" sugiere una técnica de aumento de datos mediante recoloreado del objeto, como se documenta en el repositorio GitHub asociado del autor.

## Capacidades

- Control de un brazo robótico xArm7 mediante políticas de visión-lenguaje-acción, generando acciones de 8 dimensiones a partir de observaciones visuales y de estado.
- Ejecución de tareas de manipulación pick-and-place: recoger bolas de colores (naranja, roja, amarilla, verde, azul) y depositarlas en un cuenco cian.
- Procesamiento de múltiples flujos visuales: cámara de base (`base_0_rgb`) y dos cámaras de muñeca (izquierda y derecha), cada una con resolución 224x224.
- Integración con el ecosistema LeRobot: entrenamiento, evaluación y despliegue mediante comandos CLI (`lerobot-train`, `lerobot-rollout`).
- Fine-tuning eficiente mediante adaptadores LoRA sobre el modelo base π₀.₅, lo que reduce los requisitos de almacenamiento y cómputo.
- Generalización a variaciones de color del objeto dentro del mismo tipo de tarea, gracias al entrenamiento con múltiples colores.

## Casos de uso

- Automatización de tareas de pick-and-place en líneas de montaje: el modelo puede controlar un brazo xArm7 para clasificar objetos por color y colocarlos en contenedores designados, como se demuestra con las bolas de colores y el cuenco cian.
- Investigación en aprendizaje por imitación para robótica: sirve como punto de partida para estudiar cómo los VLA preentrenados se adaptan a dominios específicos con pocos datos, gracias a su naturaleza LoRA.
- Prototipado rápido de políticas robóticas: con LeRobot, un investigador puede cargar este adaptador y ejecutarlo en un xArm7 real en minutos, usando el comando `lerobot-rollout` con las cámaras configuradas.
- Aumento de datos mediante recoloreado: el experimento "colored" demuestra cómo variar el color de los objetos en el dataset puede mejorar la robustez del modelo ante cambios visuales, útil para entornos industriales con iluminación variable.
- Educación y formación en robótica con IA: el modelo y su dataset asociado son recursos didácticos para enseñar fine-tuning de VLA, recolección de datos y despliegue en hardware real.
- Benchmarking de VLA en tareas de manipulación: al estar publicado con licencia abierta y formato estándar de LeRobot, puede usarse como referencia para comparar el rendimiento de π₀.₅ frente a otros VLA como SmolVLA en tareas equivalentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet." No hay datos de tasa de éxito en tareas reales ni comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa 0.3 GB, pero el modelo base `lerobot/pi05_base` es un VLA de gran tamaño; no se especifican sus requisitos de VRAM en la información disponible.
- Para inferencia en un robot real, se requiere una GPU con suficiente memoria para cargar el modelo base más el adaptador. Dado que π₀.₅ es un modelo de última generación, se recomienda al menos una GPU con 24 GB de VRAM (por ejemplo, RTX 3090/4090) o superior, aunque no hay confirmación oficial.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU con CUDA (`--policy.device=cuda`). No se mencionan opciones como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo.
- La latencia y el throughput no están documentados; dependerán del hardware y de la configuración de las cámaras (resolución y FPS).

## Comparativa con modelos similares

| Modelo | Tipo | Robot objetivo | Dataset | Licencia | Formato |
|---|---|---|---|---|---|
| `zwonzis/pi05-xarm7-colored-lora` (este) | VLA LoRA sobre π₀.₅ | xArm7 | 605 episodios, 5 tareas pick-and-place | Apache 2.0 | safetensors (LeRobot) |
| `zwonzis/smolvla-xarm7-pick-orange-ball-v2` | VLA SmolVLA | xArm7 | Tarea de recoger bola naranja | no disponible | safetensors (LeRobot) |
| `lerobot/pi05_base` | VLA π₀.₅ base | Generalista | Preentrenamiento de Physical Intelligence | Apache 2.0 | safetensors (LeRobot) |

La comparativa se basa en la información pública de los repositorios. No hay datos de rendimiento publicados para ninguno de los tres, por lo que la comparación se limita a características estructurales. SmolVLA es una alternativa más ligera y eficiente, mientras que π₀.₅ base es el modelo original sin fine-tuning específico.

## Limitaciones y advertencias

- No se han publicado resultados de evaluación en robot real; se desconoce la tasa de éxito y la robustez del modelo en condiciones no controladas.
- El modelo está entrenado para un robot específico (xArm7) y con una configuración de cámaras concreta (base y muñecas). No se garantiza su funcionamiento en otros brazos robóticos o con disposiciones de cámara diferentes.
- Las tareas están limitadas a pick-and-place de bolas de colores en un cuenco cian; no generaliza a otras tareas de manipulación sin fine-tuning adicional.
- El dataset de entrenamiento puede contener sesgos en la posición de los objetos, iluminación o fondo, lo que podría afectar la generalización a entornos nuevos.
- Al ser un adaptador LoRA, depende del modelo base `lerobot/pi05_base`; cualquier limitación de este (por ejemplo, alucinaciones visuales o errores de razonamiento) se hereda.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar los términos del modelo base y del dataset asociado.
- No hay información sobre la latencia de inferencia ni los requisitos mínimos de hardware, lo que dificulta la planificación de despliegues en producción.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zwonzis/pi05-xarm7-colored-lora
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/zwonzis/xarm7_dataset_colored
- Blog de Physical Intelligence sobre π₀.₅: https://www.physicalintelligence.company/blog/pi05
- Documentación de LeRobot para pi05: https://huggingface.co/docs/lerobot/main/en/pi05
- Repositorio GitHub del autor (experimento SmolVLA y recoloreado): https://github.com/zwonziss/xarm7-smolvla-pickplace
- Dataset relacionado (pick orange ball large): https://huggingface.co/datasets/zwonzis/xarm7-pick-orange-ball-large
- Modelo SmolVLA del mismo autor: https://huggingface.co/zwonzis/smolvla-xarm7-pick-orange-ball-v2
