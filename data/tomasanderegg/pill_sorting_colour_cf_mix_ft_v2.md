# TomasAnderegg/pill_sorting_colour_cf_mix_ft_v2

## Resumen

`TomasAnderegg/pill_sorting_colour_cf_mix_ft_v2` es una política de visión-lenguaje-acción (VLA) para robótica, construida sobre la arquitectura SmolVLA y entrenada con la librería LeRobot de Hugging Face. No es un modelo de lenguaje conversacional: recibe una imagen de cámara y el estado de las articulaciones del robot, más una instrucción en lenguaje natural, y emite directamente un vector de acción de 6 dimensiones para controlar un brazo robótico `so_follower` (SO-101). El modelo resuelve una tarea concreta de manipulación: clasificar pastillas de colores (azul, roja, amarilla, verde) y depositarlas en el compartimento correcto (cuadrado, círculo, triángulo, cruz).

El modelo cuenta con 450.046.176 parámetros (aproximadamente 450 M) y se distribuye en formato `safetensors` dentro de un repositorio de 10 GB. Es un fine-tuning de `TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60`, que a su vez parte de SmolVLA, el VLA compacto presentado en el paper arXiv:2506.01844, diseñado explícitamente para ejecutarse en hardware de consumo. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es doble: por un lado, demuestra el flujo completo de imitación en robótica con LeRobot (grabación de datos, entrenamiento, despliegue); por otro, sirve como ejemplo reproducible de fine-tuning de un VLA pequeño sobre un dataset propio de 68 episodios y 35.631 fotogramas a 30 FPS. Es un artefacto de investigación y prototipado, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer compacto) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones del dataset estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo visión-lenguaje-acción compacto que combina un codificador visual, un codificador de instrucciones en lenguaje natural y una cabeza de acción que produce comandos motores de forma directa (política end-to-end), sin planificación explícita intermedia. El modelo consume dos entradas: `observation.state`, un vector de 6 dimensiones con el estado de las articulaciones, y `observation.images.front`, una imagen RGB de 3×480×640 píxeles procedente de una única cámara frontal. La salida es `action`, un vector de 6 dimensiones. El paper de referencia (arXiv:2506.01844) describe el objetivo de conseguir rendimiento competitivo con coste computacional reducido y despliegue en hardware de consumo.

El entrenamiento se realizó mediante imitación supervisada sobre el dataset `TomasAnderegg/pill_sorting_colour_cf_mix_v2`, compuesto por 68 episodios y 35.631 fotogramas a 30 FPS, con 16 instrucciones distintas que combinan color de pastilla y forma de compartimento. La configuración reportada es de 4.000 pasos, batch size 64, optimizador AdamW, learning rate 1e-05, semilla 1000 y LeRobot 0.6.2. El nombre del modelo base (`...dagger60`) sugiere un proceso previo de DAgger con 60 iteraciones de agregación de datos, aunque la model card no detalla la composición exacta de esa fase ni si hubo RLHF o DPO (en robótica por imitación no es lo habitual). No se especifica el número total de tokens ni la composición del dataset más allá de los episodios citados.

## Capacidades

- Control robótico end-to-end: genera acciones de 6 grados de libertad a partir de imagen y estado de articulaciones.
- Seguimiento de instrucciones en lenguaje natural para tareas de pick-and-place con restricciones de color y forma.
- Percepción visual monocámara a resolución 480×640.
- Generalización a 16 combinaciones de tarea (4 colores × 4 formas de compartimento) dentro del dominio entrenado.
- Ejecución reactiva a 30 FPS, alineada con la frecuencia de captura del dataset.
- No soporta tool calling, function calling, razonamiento multi-paso explícito, ni generación de texto libre.
- No dispone de modo thinking, visión general, audio ni capacidades multilingües documentadas.

## Casos de uso

- Clasificación automatizada de pastillas en entornos de laboratorio: el modelo deposita cada pastilla en el compartimento designado por color y forma, útil para prototipos de dosificación farmacéutica o demostraciones de laboratorio.
- Banco de pruebas para investigación en imitación robótica: sirve como política de referencia reproducible para comparar algoritmos de imitación, aumentación de datos o variantes de DAgger sobre el mismo dataset.
- Fine-tuning sobre dominio propio: al estar construido sobre SmolVLA y licencia Apache 2.0, se puede reentrenar con `lerobot-train` sobre un dataset nuevo partiendo del modelo base, reduciendo el coste frente a entrenar desde cero.
- Educación y formación en robótica: ejemplo completo de pipeline LeRobot (grabación, entrenamiento, rollout) con hardware asequible tipo SO-101.
- Evaluación de robustez visual: permite estudiar cómo afectan cambios de iluminación, posición de cámara o color de fondo a una política VLA pequeña en una tarea acotada.
- Pruebas de despliegue en hardware de consumo: al ser un modelo de ~450 M de parámetros, es adecuado para validar latencia y throughput en GPUs de gama media antes de escalar a políticas mayores.
- Automatización de tareas repetitivas de sorting en líneas de montaje pequeñas, siempre que el dominio visual coincida con el de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía (con una plantilla sin rellenar), por lo que no hay tasas de éxito en robot real ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 450 M de parámetros en FP32 el peso ronda 1,8 GB, y en FP16/BF16 alrededor de 0,9 GB, a lo que hay que sumar activaciones del codificador visual y del transformer.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 y superiores. El nombre del modelo base (`...a100_v3`) indica que el entrenamiento previo se hizo en A100.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque no hay cifras oficiales.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`) es la vía documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a una política de acción.
- Latencia y throughput: no disponibles. El dataset está a 30 FPS, lo que sugiere que el bucle de control espera inferencias por debajo de ~33 ms, pero no se publica ninguna medición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pill_sorting_colour_cf_mix_ft_v2 (este) | ~450 M | no disponible | Sorting de pastillas por color y forma | Apache 2.0 | Hugging Face, 28 descargas |
| SmolVLA (modelo original) | no disponible en la informacion | no disponible | VLA generalista compacto | no disponible en la informacion | Hugging Face / paper arXiv:2506.01844 |
| pill_sorting_full_ft_a100_v3_dagger60 (modelo base) | no disponible | no disponible | Sorting de pastillas (fase previa DAgger) | no disponible en la informacion | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes ni con otras políticas VLA (OpenVLA, RT-2, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Sesgos de dominio: entrenado exclusivamente con cuatro colores (azul, rojo, amarillo, verde) y cuatro formas de compartimento; no generalizará a colores, formas u objetos fuera de esa distribución.
- Dependencia de cámara única y configuración fija: la política espera una imagen `observation.images.front` de 3×480×640; cambios de encuadre, iluminación o cámara pueden degradar el comportamiento.
- Riesgo de sobreajuste al dataset: con solo 68 episodios y 35.631 fotogramas, la cobertura de posiciones y condiciones es limitada; es esperable un éxito frágil fuera del entorno de grabación.
- Sin evaluación publicada: no hay tasas de éxito en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- Sin capacidades de lenguaje general: no debe usarse como modelo conversacional, de razonamiento ni de generación de código; su única salida es un vector de acción.
- Idiomas: las instrucciones del dataset están en inglés; no hay evidencia de soporte multilingüe.
- Licencia Apache 2.0: permite uso comercial y modificaciones, pero el autor no ofrece garantías ni soporte; el despliegue en robots reales implica riesgos físicos que deben evaluarse con protocolos de seguridad propios.
- Repositorio de 10 GB: el tamaño del repo es desproporcionado respecto a los 450 M de parámetros, probablemente por checkpoints o artefactos adicionales; conviene revisar los archivos antes de descargar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TomasAnderegg/pill_sorting_colour_cf_mix_ft_v2
- Dataset de entrenamiento: https://huggingface.co/datasets/TomasAnderegg/pill_sorting_colour_cf_mix_v2
- Modelo base: https://huggingface.co/TomasAnderegg/pill_sorting_full_ft_a100_v3_dagger60
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Guía LeRobot SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Documentación LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=TomasAnderegg/pill_sorting_colour_cf_mix_v2
