# team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000

## Resumen

Este modelo es un fine-tuning completo (FFT) de SmolVLA, un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, adaptado por el equipo SOBITS para una tarea específica de robótica: lanzar una lata de tomate a una papelera. El modelo se ha entrenado sobre un dataset de 200 episodios simulados con 48.141 fotogramas a 10 FPS, utilizando dos cámaras (cabeza y mano izquierda) y el estado del robot como entradas, y produce acciones de 20 dimensiones como salida.

La relevancia de este modelo radica en que demuestra cómo un VLA de tamaño reducido (450 millones de parámetros) puede especializarse en tareas de manipulación móvil con un coste computacional bajo, siendo desplegable en hardware de consumo. Está publicado bajo licencia Apache 2.0 y se integra con el ecosistema LeRobot, lo que facilita su uso en investigación y prototipado robótico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en SmolVLA (paper arXiv:2506.01844) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (modelo de accion robotica, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto que combina un codificador visual, un modelo de lenguaje y un decodificador de acciones. En este caso, el modelo se ha fine-tuneado completamente (FFT) desde el checkpoint base `lerobot/smolvla_base` durante 90.000 pasos de entrenamiento, con un batch size de 16, optimizador AdamW y learning rate de 0,0001. El dataset de entrenamiento contiene 200 episodios de una tarea de pick-and-place simulada ("lanzar la lata de tomate a la papelera"), con 48.141 fotogramas a 10 FPS. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un aprendizaje por imitación supervisado estándar.

## Capacidades

- Control de un robot manipulador móvil a partir de observaciones visuales (dos cámaras) y estado del robot (20 dimensiones).
- Ejecución de la tarea específica "lanzar la lata de tomate a la papelera" en el entorno simulado para el que fue entrenado.
- Generación de acciones continuas de 20 dimensiones a 10 Hz, adecuadas para control en bucle cerrado.
- Integración con el framework LeRobot para entrenamiento, evaluación y despliegue en robots reales o simulados.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento multi-paso fuera del ámbito de la tarea robótica.

## Casos de uso

- Automatización de tareas de reciclaje en entornos domésticos o industriales: el modelo puede controlar un brazo robótico para recoger objetos y depositarlos en contenedores específicos, como se demuestra con la tarea de la lata de tomate.
- Prototipado rápido de políticas de manipulación en simulación: al estar entrenado en un entorno simulado, sirve como punto de partida para transferir habilidades a robots reales mediante técnicas de sim-to-real.
- Investigación en aprendizaje por imitación para VLA: su tamaño compacto y licencia abierta lo hacen ideal para estudiar el efecto del fine-tuning en tareas específicas con recursos limitados.
- Desarrollo de asistentes robóticos para personas mayores o con movilidad reducida: la tarea de recoger y desechar objetos es un componente básico de asistencia en el hogar.
- Benchmarking de algoritmos de control basados en visión: puede utilizarse como referencia para comparar arquitecturas VLA más grandes o métodos alternativos en la misma tarea.
- Formación y educación en robótica: al ser un modelo pequeño y bien documentado, permite a estudiantes y desarrolladores experimentar con políticas de manipulación sin necesidad de infraestructura costosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion proporcionados para esta politica.

## Requisitos de hardware

- No se proporcionan requisitos específicos de VRAM en la documentación.
- Dado el tamaño del modelo (450M parámetros) y su diseño para hardware de consumo, se estima que puede ejecutarse en GPUs con al menos 8 GB de VRAM, aunque no hay confirmación oficial.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en GPU (CUDA) y también puede ejecutarse en CPU para pruebas lentas.
- No se indican opciones de cuantización ni soporte para vLLM, Ollama u otros servidores de inferencia; el flujo estándar es mediante los comandos `lerobot-rollout` y `lerobot-train`.
- La latencia y el throughput no están documentados; al ser un modelo compacto, se espera que sea adecuado para control en tiempo real a 10 Hz, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se sugiere consultar otros fine-tunings de SmolVLA publicados por el mismo autor (por ejemplo, `sobit_home_left_sim-pnp_pear_bowl-abs-200-smolvla_fft-60000`) para tareas similares, pero no hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para una tarea específica en un entorno simulado; no generaliza a otras tareas u objetos sin un nuevo fine-tuning.
- No se han proporcionado resultados de evaluación en robot real, por lo que su rendimiento en el mundo físico es incierto.
- Depende de dos cámaras fijas (cabeza y mano izquierda) y de un estado del robot de 20 dimensiones; cambios en la configuración de sensores requieren reentrenamiento.
- No tiene capacidades de lenguaje natural ni de razonamiento simbólico; es un modelo puramente reactivo de visión-acción.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo se distribuye sin garantías y sin soporte oficial.
- No se han documentado sesgos específicos, pero al ser entrenado en un entorno simulado puede presentar comportamientos no deseados ante variaciones de iluminación, texturas o posiciones de objetos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs-200-smolvla_fft-90000)
- [Dataset de entrenamiento](https://huggingface.co/datasets/team-sobits/sobit_home_left_sim-pnp_tomato_trash-abs)
- [Paper de SmolVLA (arXiv:2506.01844)](https://huggingface.co/papers/2506.01844)
- [Modelo base lerobot/smolvla_base](https://huggingface.co/lerobot/smolvla_base)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
- [Documentación de LeRobot para SmolVLA](https://huggingface.co/docs/lerobot/main/en/smolvla)
