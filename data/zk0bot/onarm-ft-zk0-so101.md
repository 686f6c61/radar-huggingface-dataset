# zk0bot/onarm-ft-zk0-so101

## Resumen

`zk0bot/onarm-ft-zk0-so101` es un checkpoint de ajuste fino (fine-tune) de un modelo de vision-lenguaje-accion (VLA) para robótica, construido sobre la arquitectura SmolVLA de LeRobot. Lo publica el usuario `zk0bot` como respaldo de un artefacto de estudio experimental, no como modelo de producción. Concretamente, es un fine-tune de `ivelin/zk0-smolvla-fl` sobre el dataset `lerobot/svla_so101_pickplace` (50 episodios de recogida y colocación con el brazo SO-101), entrenado durante 10.000 pasos y finalizado el 19 de noviembre de 2026.

El modelo resuelve el problema de control robótico de manipulación: dado un par de imágenes de cámara y una instrucción en lenguaje natural, predice acciones motoras para un brazo robótico de bajo coste. Su relevancia es limitada fuera del contexto del experimento: el propio autor advierte que se trata de un backup de checkpoint y que el modelo "publicado" sigue siendo `ivelin/zk0-smolvla-fl`, que este repositorio no modifica.

El checkpoint contiene 450 millones de parámetros en formato safetensors (1.197.789.256 bytes, unos 1,2 GB), lo que lo sitúa en la gama de modelos VLA ligeros que pueden ejecutarse en hardware de gama alta para consumidores o en estaciones de trabajo con GPU. La licencia es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-lenguaje-accion, librería LeRobot) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (instrucciones en lenguaje natural; idioma del dataset no especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, 1.197.789.256 bytes) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura SmolVLA de LeRobot, un VLA que combina un codificador visual y un modelo de lenguaje con un cabezal de acciones para producir comandos motores a partir de observaciones multimodales (imágenes de cámara) e instrucciones textuales. La model card no detalla la composición interna de los componentes visuales o lingüísticos, ni la longitud de contexto, por lo que no se puede especificar más allá de la familia arquitectónica.

El entrenamiento consistió en un fine-tune del modelo base `lerobot/smolvla_base`, pasando por `ivelin/zk0-smolvla-fl` (linaje de la revisión `f062ded`), sobre el dataset `lerobot/svla_so101_pickplace` con 50 episodios, durante 10.000 pasos, completado el 2026-11-19. Se ejecutó en una estación DGX Spark (ruta local `/home/openclaw/muse-work/zk0-onarm-20261117/ft/outputs/ft_zk0/checkpoints/010000/pretrained_model`). No se documentan detalles sobre composición del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales. El hash SHA-256 del `model.safetensors` antes de la subida es `80d020776d1166ae3e40e5a98faec80d9d581f0bee94e44f1b505b015577bea4`.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para el brazo SO-101 a partir de observaciones visuales e instrucciones en lenguaje natural.
- Percepción visual: procesa imágenes de cámara como entrada para la toma de decisiones.
- Comprensión de instrucciones en lenguaje natural: traduce comandos textuales en secuencias de acciones.
- Tarea específica: recogida y colocación (pick-and-place) de objetos, según el dataset de entrenamiento.
- No se documentan capacidades de tool calling, agentes multi-paso, razonamiento general, código o matemáticas; es un modelo especializado en control robótico, no un LLM de propósito general.
- Multilingüismo: no disponible; el dataset de entrenamiento no especifica idioma de las instrucciones.

## Casos de uso

- Investigación en aprendizaje por imitación robótica: sirve como punto de partida reproducible para experimentos de fine-tune sobre SO-101, ya que se documentan el dataset, los pasos y la revisión base.
- Reproducción de experimentos de VLA: permite verificar resultados de la preregistración "on-arm 2x2" comparando este checkpoint con otras celdas del estudio.
- Manipulación pick-and-place en laboratorio: adecuado para tareas de recogida y colocación de objetos con el brazo SO-101 en entornos controlados, dado el dataset de 50 episodios.
- Evaluación de SmolVLA en hardware de bajo coste: al ser un modelo de 450M parámetros y 1,2 GB, es viable para pruebas en estaciones de trabajo con GPU única.
- Docencia y formación en robótica: útil para demostrar el flujo completo de entrenamiento y despliegue de un VLA con LeRobot en un brazo asequible.
- Base para fine-tunes adicionales: al estar bajo Apache 2.0 y en safetensors, puede ajustarse sobre nuevos datasets de manipulación sin restricciones de licencia.
- Auditoría de checkpoints: el hash SHA-256 publicado permite verificar la integridad del artefacto en pipelines de respaldo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450M parámetros en fp32 el peso ronda los 1,8 GB, y en fp16/bf16 unos 0,9 GB, más memoria para activaciones y codificadores visuales. No se confirma cuantización soportada.
- GPU recomendadas: no se especifican; el entrenamiento se realizó en una DGX Spark. Para inferencia, una GPU con al menos 8-16 GB de VRAM es un punto de partida razonable para un modelo de este tamaño, aunque no está confirmado por el autor.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas con 8 GB o más (RTX 3060/4060 en adelante), pero no hay confirmación oficial.
- Opciones de despliegue: LeRobot (librería declarada); no se documentan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo de acciones robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zk0bot/onarm-ft-zk0-so101 | 450M | no disponible | VLA pick-and-place SO-101 | Apache 2.0 | Hugging Face |
| ivelin/zk0-smolvla-fl (base del fine-tune) | no disponible | no disponible | VLA SO-101 | no disponible | Hugging Face |
| lerobot/smolvla_base (base original) | no disponible | no disponible | VLA generalista | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es el modelo publicado: el autor indica explícitamente que es un artefacto de estudio y backup de checkpoint; el modelo "shipped" es `ivelin/zk0-smolvla-fl`.
- Especialización estrecha: entrenado solo con 50 episodios de pick-and-place sobre SO-101; no generalizará a otras tareas, objetos o brazos sin nuevo fine-tune.
- Sin benchmarks: no hay métricas publicadas de éxito en tareas, por lo que no se puede evaluar su rendimiento real.
- Riesgo de sobreajuste: 10.000 pasos sobre 50 episodios es un régimen propenso al sobreajuste; conviene validar antes de cualquier uso.
- Idiomas y contexto no documentados: no se puede garantizar el comportamiento con instrucciones en castellano u otros idiomas.
- Sin información sobre sesgos: al ser un modelo de control robótico, los sesgos relevantes serían de distribución visual y de objetos del dataset, no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la falta de garantías y de documentación técnica desaconseja su uso en producción sin evaluación previa.
- Integridad: verificar el hash SHA-256 publicado antes de desplegar el checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zk0bot/onarm-ft-zk0-so101
- Modelo base del fine-tune: https://huggingface.co/ivelin/zk0-smolvla-fl
- Modelo base original: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/svla_so101_pickplace
- Librería LeRobot: https://github.com/huggingface/lerobot
