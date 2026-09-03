# Yu-Zhou-Wang/smolvla_so_101_red_foam_ball_20k

## Resumen

El modelo `Yu-Zhou-Wang/smolvla_so_101_red_foam_ball_20k` es un fine-tune del modelo base `lerobot/smolvla_base` (SmolVLA, 450 millones de parámetros) para una tarea específica de robótica: recoger una bola roja de espuma y colocarla en un contenedor, ejecutada con el brazo robótico SO-101. Desarrollado por Yu-Zhou-Wang, este checkpoint corresponde al paso 20 000 de un entrenamiento más largo (60 000 pasos) y se publica como un hito intermedio del mismo run que el modelo `smolvla_so_101_red_foam_ball` (60k). El modelo se enmarca en el ecosistema LeRobot de Hugging Face y demuestra la viabilidad de ajustar un VLA (vision-language-action) con un dataset reducido (20 episodios) y hardware asequible.

SmolVLA es una arquitectura compacta de visión-lenguaje-acción diseñada para ejecutarse en CPU o GPU de consumo, entrenada con datos comunitarios de robótica. Este fine-tune congela el encoder de visión y entrena únicamente el experto de acción, sin usar información táctil. La relevancia actual radica en que muestra un caso práctico de adaptación de un VLA a una tarea de manipulación concreta, con una receta reproducible y de bajo coste, lo que facilita la experimentación en laboratorios pequeños o entornos educativos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) |
| Parametros totales | 450 046 176 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles (modelo de acción, sin procesamiento de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de tipo transformer que combina un codificador de visión con un decodificador de lenguaje y un cabezal de acción. En este fine-tune, el encoder de visión permanece congelado y solo se actualizan los pesos del experto de acción. El entrenamiento se realizó sobre el dataset `Jingyi-Z/sotac`, utilizando los episodios 0 a 20, que contienen demostraciones de la tarea de pick-and-place. La configuración incluye un chunk size de 50, un batch de 8 y un total de 20 000 pasos de optimización. Las cámaras se remapean: la cámara superior (top) se asigna a `camera1` y la de muñeca (wrist) a `camera2`, además de una tercera cámara ficticia (`empty_cameras=1`). No se emplea información táctil. El modelo se entrena con el framework LeRobot y se puede desplegar mediante el comando `lerobot-rollout` con la estrategia base.

## Capacidades

- Generación de comandos de posición articular (6 grados de libertad) para el robot SO-101.
- Percepción visual a través de dos cámaras (superior y de muñeca) para localizar el objeto y el contenedor.
- Ejecución de la tarea específica de recoger y colocar una bola roja de espuma en un contenedor.
- No incluye capacidades de lenguaje natural, tool calling ni razonamiento multi-paso; es un policy de acción puro.
- Compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica con SO-101 para manipular objetos pequeños y ligeros, como la bola de espuma, en tareas repetitivas de clasificación o ensamblaje.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar el efecto del número de pasos de entrenamiento en VLA, ya que este checkpoint temprano (20k) puede compararse con el de 60k del mismo run.
- Prototipado de robots de bajo coste: al ser un modelo de 450M parámetros, puede ejecutarse en GPUs de consumo (p. ej., RTX 3090) o incluso en CPU, lo que permite validar algoritmos de control sin infraestructura cara.
- Fine-tuning sobre datasets pequeños: demuestra que con solo 20 demostraciones es posible adaptar un VLA preentrenado a una tarea nueva, lo que es útil para entornos con datos limitados.
- Benchmarking de VLA en hardware asequible: el modelo puede utilizarse como referencia para comparar el rendimiento de SmolVLA frente a otras arquitecturas (p. ej., Diffusion Policy) en la misma tarea y robot.
- Educación y divulgación: al estar publicado con licencia Apache 2.0 y ser reproducible con LeRobot, es un recurso didáctico para cursos de robótica y aprendizaje automático.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base SmolVLA tiene métricas reportadas en el blog oficial de Hugging Face, pero no se dispone de datos específicos para este checkpoint de 20k pasos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero al tratarse de un modelo de 450M parámetros, en FP16 ocuparía aproximadamente 0,9 GB, y en FP32 unos 1,8 GB, por lo que cabría en cualquier GPU con al menos 2 GB de VRAM.
- GPU recomendadas: según el blog de ggando.com, el entrenamiento se realizó con una RTX 3090; para inferencia, una GPU de gama media (p. ej., RTX 3060) o incluso CPU son suficientes.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs como RTX 3060, RTX 3090, y también en MacBooks con Apple Silicon según el blog de Hugging Face.
- Opciones de despliegue: LeRobot (comando `lerobot-rollout`), y potencialmente otros frameworks que soporten safetensors, aunque no se mencionan vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `smolvla_so_101_red_foam_ball_20k` (este) | 450M | no disponible | Pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | 450M | no disponible | VLA general | Apache 2.0 | Hugging Face |
| `Yu-Zhou-Wang/dp_so_101_red_foam_ball` | no disponible | no disponible | Pick-and-place SO-101 (Diffusion Policy) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Es un checkpoint temprano (20 000 pasos) de un entrenamiento de 60 000, por lo que puede no haber convergido completamente y su rendimiento podría ser inferior al del modelo final.
- El dataset de entrenamiento es muy reducido (20 episodios) y está limitado a una única tarea y un único objeto (bola roja de espuma), lo que restringe la generalización a otras tareas u objetos.
- No procesa lenguaje natural ni instrucciones; solo genera acciones a partir de imágenes.
- La configuración de cámaras es específica (top y wrist) y requiere que el robot tenga esos sensores; no es transferible directamente a otros setups sin adaptación.
- La licencia Apache 2.0 permite uso comercial, pero la licencia del dataset `sotac` no se ha verificado; se recomienda revisarla antes de un uso comercial.
- Al ser un modelo de acción, no tiene capacidades de razonamiento simbólico ni de diálogo; su uso está restringido a control robótico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Yu-Zhou-Wang/smolvla_so_101_red_foam_ball_20k
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset utilizado: https://huggingface.co/datasets/Jingyi-Z/sotac
- Blog sobre fine-tuning de SmolVLA en SO-101: https://ggando.com/blog/smolvla-so101/
- Vídeo de demostración: https://www.youtube.com/watch?v=7RKQderl6vk
- Blog oficial de SmolVLA en Hugging Face: https://github.com/huggingface/blog/blob/main/smolvla.md
