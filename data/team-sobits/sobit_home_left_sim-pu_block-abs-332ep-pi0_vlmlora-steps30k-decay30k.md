# team-sobits/sobit_home_left_sim-pu_block-abs-332ep-pi0_vlmlora-steps30k-decay30k

## Resumen

Este modelo es un fine-tune del modelo fundacional de robótica π₀ (Pi0) de Physical Intelligence, adaptado mediante LoRA para una tarea específica de manipulación: recoger un bloque con un robot móvil manipulador. Ha sido desarrollado por el equipo TeamSOBITS y publicado en HuggingFace bajo licencia Apache 2.0. El modelo se basa en la implementación de LeRobot del repositorio OpenPI de Physical Intelligence.

La relevancia de este modelo radica en demostrar cómo un modelo Vision-Language-Action (VLA) preentrenado puede adaptarse a una tarea concreta con un número reducido de episodios (332) y un coste computacional moderado (30.000 pasos de entrenamiento). Esto lo convierte en un ejemplo práctico de fine-tune eficiente para robótica, especialmente en entornos domésticos o de laboratorio donde se requiere personalización rápida.

El modelo consume imágenes de dos cámaras (cabeza y mano izquierda) junto con el estado del robot (19 dimensiones) y produce acciones de 19 dimensiones. Está diseñado para ejecutarse con el framework LeRobot, que facilita tanto el entrenamiento como el despliegue en robots reales o simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer, adaptada con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el modelo base pi0 interpreta instrucciones en ingles, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/pi0_base`, un VLA generalista de Physical Intelligence que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este fine-tune se aplica LoRA (Low-Rank Adaptation) sobre las capas del modelo base, lo que reduce significativamente el numero de parametros entrenables y el coste de entrenamiento. El nombre del repositorio indica `vlmlora`, confirmando el uso de esta tecnica.

El entrenamiento se realizo con el dataset `team-sobits/sobit_home_left_sim-pu_block-abs-332ep`, que contiene 332 episodios y 68.605 frames a 10 FPS, todos etiquetados con la tarea "Pick up the block". Se usaron 30.000 pasos de entrenamiento con un batch size de 16, optimizador AdamW y una tasa de aprendizaje de 0.0001. La version de LeRobot utilizada fue la 0.6.0. No se menciona el uso de RLHF ni DPO; se trata de un aprendizaje por imitacion supervisada.

## Capacidades

- Control de un robot movil manipulador para la tarea especifica de recoger un bloque.
- Procesamiento de entradas visuales de dos camaras: `head_camera` (480x640) y `hand_left_camera` (1200x1920).
- Interpretacion de una instruccion en lenguaje natural fija ("Pick up the block") y generacion de acciones de 19 dimensiones.
- Ejecucion en tiempo real a 10 FPS, adecuada para control robotico.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.
- No soporta tool calling, agentes ni razonamiento multi-paso fuera de la tarea aprendida.
- Capacidades multilingues no disponibles; el modelo base pi0 esta orientado al ingles.

## Casos de uso

- Automatizacion de tareas de recogida en entornos domesticos: el modelo puede controlar un robot movil con brazo para recoger objetos del suelo o de superficies, como parte de un sistema de asistencia en el hogar.
- Investigacion en aprendizaje por imitacion: sirve como punto de partida para estudiar como adaptar modelos VLA preentrenados a tareas especificas con pocos datos, comparando el rendimiento con otros fine-tunes.
- Desarrollo de robots de laboratorio: en entornos de investigacion, se puede desplegar en un robot SOBIT HOME para validar algoritmos de manipulacion y navegacion.
- Prototipado rapido de politicas robotica: gracias a LeRobot, se puede cargar el modelo y ejecutarlo en un robot simulado o real en minutos, acelerando el ciclo de iteracion.
- Benchmarking de modelos VLA: al ser un fine-tune de pi0_base, permite comparar el efecto de diferentes datasets y configuraciones de entrenamiento sobre la misma base.
- Educacion en robotica: el modelo y su dataset asociado pueden utilizarse en cursos de robotica y aprendizaje automatico para ilustrar el flujo completo de entrenamiento y despliegue de una politica de manipulacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion para esta politica.

## Requisitos de hardware

- El modelo base `lerobot/pi0_base` requiere una GPU con al menos 24 GB de VRAM para inferencia en precision completa (por ejemplo, RTX 3090, RTX 4090, A100). El adaptador LoRA anade una carga minima adicional.
- Para entrenamiento, se recomienda una GPU con 24 GB o mas, dado el batch size de 16 y la resolucion de las imagenes.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU con CUDA. No se mencionan opciones como vLLM u Ollama, ya que no es un modelo de lenguaje generico.
- La latencia estimada no esta disponible, pero al operar a 10 FPS, se espera que cada ciclo de inferencia complete en menos de 100 ms en hardware adecuado.
- El tamaño del repositorio es de 1.3 GB, correspondiente al adaptador LoRA y los pesos en safetensors. El modelo base debe descargarse por separado.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (pi0 + LoRA) | VLA (pi0_base) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `team-sobits/sobit_home_pickup_block_left_abs_pi0_vlmlora` | VLA (pi0_base) | no disponible | no disponible | Apache 2.0 | HuggingFace |
| `team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-60000` | SmolVLA (compacto) | no disponible | no disponible | Apache 2.0 | HuggingFace |

Los tres modelos son fine-tunes de TeamSOBITS para tareas de manipulacion, pero difieren en el modelo base (pi0 vs SmolVLA) y en la tarea especifica. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para la tarea "Pick up the block" y no generaliza a otras tareas sin un nuevo fine-tune.
- El entrenamiento se realizo en simulacion (el nombre del dataset incluye `sim`), por lo que puede existir una brecha de realidad al desplegarlo en un robot fisico.
- No se han publicado evaluaciones en robot real, por lo que el rendimiento real es desconocido.
- El modelo depende de las camaras y la configuracion del robot utilizadas durante el entrenamiento; cambios en la iluminacion, posicion de camaras o tipo de robot pueden degradar el rendimiento.
- Al ser un adaptador LoRA, requiere el modelo base `lerobot/pi0_base` para funcionar, lo que implica una descarga adicional y requisitos de hardware mayores.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar que el modelo base pi0_base tambien cumpla con los requisitos de su licencia original (aunque en HuggingFace aparece como Apache 2.0).
- No se proporcionan datos sobre sesgos o alucinaciones, pero al ser un modelo de control robotico, el riesgo principal es la ejecucion de acciones incorrectas que puedan causar danos fisicos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/team-sobits/sobit_home_left_sim-pu_block-abs-332ep-pi0_vlmlora-steps30k-decay30k
- Dataset de entrenamiento: https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pu_block-abs-332ep
- Modelo base: https://huggingface.co/lerobot/pi0_base
- Blog de Pi0 de Physical Intelligence: https://www.physicalintelligence.company/blog/pi0
- Documentacion de LeRobot para pi0: https://huggingface.co/docs/lerobot/main/en/pi0
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Organizacion TeamSOBITS en GitHub: https://github.com/TeamSOBITS
