# tonghuiwang123/so100-smolvla-new60-ft-s2

## Resumen

Este modelo es un checkpoint de SmolVLA, un modelo de visión-lenguaje-acción (VLA) de 450 millones de parámetros desarrollado por Hugging Face, adaptado para la tarea específica de agarrar un cubo blanco y colocarlo en una taza blanca con el brazo robótico SO-ARM100 (también conocido como SO100). El modelo ha sido entrenado mediante aprendizaje por imitación con 60 episodios (13.454 fotogramas) capturados con dos cámaras a 1280x720 y 30 fps. El checkpoint corresponde al paso 85000, equivalente a aproximadamente 404.3 épocas con un tamaño de lote efectivo de 64. Se trata de un modelo denso, sin arquitectura MoE, y su principal ventaja es su pequeño tamaño, que permite inferencia en hardware de consumo con solo 1 GB de VRAM.

El modelo está diseñado para ser utilizado con la librería LeRobot, que proporciona las herramientas de grabación, entrenamiento y evaluación. La tarea está definida en inglés ("Grab the white cube to the white cup") y el modelo espera dos entradas de cámara: una superior (top-down) y otra en la muñeca (wrist). Este checkpoint concreto se diferencia de su gemelo `so100-smolvla-new60-ft` únicamente en la semilla aleatoria (2000 frente a 1000), lo que permite estudiar la varianza debida a la inicialización.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles (instruccion en ingles en la tarea) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción desarrollado por Hugging Face, con 450 millones de parámetros, diseñado para ser eficiente y desplegable en hardware de consumo. Combina un codificador visual y un modelo de lenguaje para procesar observaciones de cámaras y una instrucción textual, generando acciones de control para el brazo robótico. En este checkpoint, la arquitectura se ha entrenado mediante aprendizaje por imitación (behavior cloning) sobre un conjunto de datos de 60 episodios, con un total de 13.454 fotogramas de dos cámaras (superior y muñeca) a resolución 1280x720 y 30 fps. El entrenamiento se realizó en dos etapas con una semilla aleatoria de 2000, alcanzando el paso 85000, que corresponde a aproximadamente 404.3 épocas con un tamaño de lote efectivo de 64. La configuración es idéntica a la del checkpoint `so100-smolvla-new60-ft` (semilla 1000), lo que permite comparar la influencia de la semilla en el resultado final.

## Capacidades

- Generación de acciones de control para el brazo robótico SO-ARM100 / SO100.
- Procesamiento de dos entradas visuales (cámara superior y cámara de muñeca) a 1280x720.
- Interpretación de una instrucción de lenguaje natural en inglés (tarea fija: "Grab the white cube to the white cup").
- Aprendizaje por imitación: reproduce el comportamiento demostrado en los episodios de entrenamiento.
- Inferencia en tiempo real con un consumo de VRAM de aproximadamente 1 GB, adecuado para hardware de consumo.
- Integración con la librería LeRobot para grabación, entrenamiento y evaluación.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede ejecutar la tarea de agarrar un cubo blanco y colocarlo en una taza blanca, replicando las demostraciones aprendidas.
- Investigación en robótica de bajo coste: al requerir solo 1 GB de VRAM, es ideal para laboratorios con recursos limitados que necesiten experimentar con políticas VLA.
- Comparación de la influencia de la semilla aleatoria en el entrenamiento de políticas robóticas: al existir dos checkpoints con semillas distintas, se puede estudiar la varianza del entrenamiento.
- Desarrollo de sistemas de control basados en visión y lenguaje para brazos articulados de bajo coste (SO100).
- Prototipado rápido de tareas de manipulación mediante aprendizaje por imitación: el flujo de LeRobot permite grabar nuevas demostraciones y entrenar políticas específicas.
- Evaluación de la robustez de SmolVLA en tareas de manipulación con observaciones de alta resolución (1280x720).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 1.0 GB (según la model card).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1650, RTX 3060, etc.). No se especifican GPUs concretas.
- Compatible con hardware de consumo: sí, dado el bajo consumo de VRAM.
- Opciones de despliegue: librería LeRobot (lerobot), que incluye herramientas de grabación y evaluación. No se mencionan vLLM, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de comparación con otros modelos VLA en la información disponible. Sin embargo, se puede señalar que SmolVLA (450M parámetros) es significativamente más pequeño que otros VLA como OpenVLA (7B) o RT-2 (55B), lo que lo hace más adecuado para despliegue en hardware de consumo, aunque su capacidad se limita a tareas específicas entrenadas.

## Limitaciones y advertencias

- El modelo está entrenado para una tarea muy específica ("Grab the white cube to the white cup") y no es generalizable a otras tareas sin reentrenamiento.
- La instrucción está en inglés; no se ha verificado soporte para otros idiomas.
- La configuración de cámaras es fija: dos cámaras (superior y muñeca) a 1280x720 y 30 fps. Cambios en la resolución o posición de las cámaras pueden degradar el rendimiento.
- La licencia no está especificada en la información disponible; se debe contactar al autor para aclarar los términos de uso.
- No se han reportado benchmarks ni métricas de rendimiento cuantitativas.
- Al ser un modelo de imitación, su rendimiento depende de la calidad y diversidad de las demostraciones grabadas.

## Enlaces

- [HuggingFace del modelo](https://huggingface.co/tonghuiwang123/so100-smolvla-new60-ft-s2)
- [Página oficial de SmolVLA](https://smolvla.net/index_en)
- [Paper en arXiv](https://arxiv.org/abs/2506.01844)
- [Repositorio GitHub de ejemplo con SO100](https://github.com/ajinkyagorad/smol-vla-lerobot-so100)
