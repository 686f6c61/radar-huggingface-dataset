# TangYishan/starvla-qwenoft-g1-sonic

## Resumen

StarVLA QwenOFT para Unitree G1 WholeBody es un checkpoint de validación ("smoke checkpoint") del framework StarVLA, una plataforma modular para convertir modelos de visión-lenguaje (VLM) en modelos de visión-lenguaje-acción (VLA). Este modelo específico, desarrollado por TangYishan, emplea el backbone Qwen3.5-0.8B con un cabezal de acción basado en regresión MLP L1, siguiendo el esquema QwenOFT de predicción paralela de acciones continuas. Está diseñado para el control de cuerpo completo de un robot humanoide Unitree G1, con una acción de 78 dimensiones en formato SONIC (64D motion token + 7D articulaciones de mano izquierda + 7D de mano derecha).

El modelo se ha entrenado sobre el dataset público `cloudwalk-research/gr00t-g1-grab-bottle-right-hand-v11` con 355 episodios, pero solo durante 1000 pasos de entrenamiento, por lo que no ha convergido (pérdida L1 final ≈ 0.60). Su propósito principal es validar la cadena técnica de datos → entrenamiento → servidor de políticas → división de acciones de 78D, no lograr un rendimiento real de tarea. No se ha probado en un robot físico. La licencia MIT permite uso comercial y modificación, lo que lo hace adecuado para experimentación y desarrollo de pipelines robóticos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QwenOFT: backbone Qwen3.5-0.8B + cabezal MLP de regresión L1 para acciones continuas |
| Parametros totales | No disponible (el backbone tiene 0.8B, pero el total del modelo no se especifica) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no se especifica para este checkpoint VLA) |
| Tipos de cuantizacion | No disponible (el checkpoint se sirve con bf16, según el comando de inferencia) |
| Idiomas soportados | No disponible (modelo orientado a robótica, no a procesamiento de lenguaje) |
| Licencia | MIT |
| Formato de pesos | Checkpoint PyTorch (.pt), 2.24 GB; también incluye config.yaml y dataset_statistics.json |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura QwenOFT del framework StarVLA, que combina un VLM backbone (Qwen3.5-0.8B) con un cabezal de regresión MLP que predice acciones continuas de forma paralela (en lugar de generación autoregresiva de tokens discretos como en QwenFast). La entrada visual es una única imagen egocéntrica de 224×224 píxeles, junto con un estado de propriocepción de 72 dimensiones que incluye observaciones del estado, posiciones de efector final, orientación de la base, gravedad proyectada, offsets de rotación y cuaternión inicial. La salida es una acción de 78 dimensiones (SONIC) con un horizonte de predicción de 8 pasos.

El entrenamiento se realizó sobre el dataset LeRobot v2.1 `cloudwalk-research/gr00t-g1-grab-bottle-right-hand-v11` (355 episodios) durante 1000 pasos, sin convergencia (L1 loss ≈ 0.60). Se aplicó normalización q99 usando `dataset_statistics.json` con clave `new_embodiment`. Los ficheros de configuración y scripts de entrenamiento están disponibles en el repositorio StarVLA, en `examples/realRobots/UnitreeG1_WholeBody/step2_training/train_files/`.

## Capacidades

- Generación de acciones de control para robot humanoide Unitree G1, con salida de 78 dimensiones (motion token + articulaciones de ambas manos).
- Procesamiento de una imagen egocéntrica de 224×224 como entrada visual, junto con estado de propriocepción de 72 dimensiones.
- Predicción de acciones en paralelo mediante regresión MLP (no autoregresiva), lo que permite inferencia rápida.
- Soporte de normalización de datos mediante estadísticas q99 para adaptación a diferentes embodiment.
- Integración con el servidor de políticas de StarVLA para despliegue en tiempo real (código de ejemplo incluido).
- Capacidad de entrenamiento y fine-tuning con configuraciones modulares (config.yaml, config.full.yaml).

## Casos de uso

- Validación de pipelines de datos robóticos: este checkpoint sirve para verificar que el flujo de datos (dataset LeRobot) → entrenamiento → servidor de políticas funciona correctamente antes de escalar a entrenamientos largos.
- Prototipado rápido de VLA para control de cuerpo completo: gracias a su tamaño reducido (backbone 0.8B), permite iterar sobre arquitecturas y formatos de acción sin requerir recursos masivos.
- Desarrollo de sistemas de agarre con mano derecha: el dataset utilizado se centra en agarrar una botella con la mano derecha, por lo que puede servir como base para experimentos de manipulación.
- Investigación en representación de acciones: la división 78D (motion token + articulaciones de manos) permite estudiar cómo distintos formatos de acción afectan al aprendizaje.
- Pruebas de inferencia en tiempo real: el servidor de políticas incluido permite probar la latencia de predicción en un entorno simulado antes de desplegar en hardware real.
- Formación en robótica y VLA: al ser un checkpoint pequeño y con licencia MIT, es útil para enseñar conceptos de visión-lenguaje-acción en entornos académicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El propio autor indica que el modelo es un "smoke checkpoint" de 1000 pasos, no convergido, y que no debe esperarse rendimiento a nivel de tarea. No hay datos de éxito en tareas, ni comparaciones con otros VLA.

## Requisitos de hardware

- El checkpoint tiene un tamaño de 2.24 GB, por lo que cabe en la mayoría de GPUs comerciales.
- El comando de inferencia usa bf16, lo que reduce el consumo de VRAM. Estimación: con el backbone de 0.8B y el cabezal, la VRAM necesaria rondará los 2-4 GB, dependiendo del batch size y la resolución de imagen.
- GPU recomendada: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) para inferencia en tiempo real. Para entrenamiento, se necesitaría más VRAM (12 GB o más) según el batch size.
- Opciones de despliegue: servidor de políticas de StarVLA (`server_policy.py`), que se ejecuta con CUDA. No se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM generativo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para este checkpoint. Como referencia, otros VLA como OpenVLA (7B parámetros) o RT-2 (55B) son significativamente más grandes y entrenados con datasets masivos, pero no hay métricas directas de comparación con este modelo. Se recomienda consultar los benchmarks de StarVLA para modelos entrenados completamente.

## Limitaciones y advertencias

- Este checkpoint es un "smoke test" de 1000 pasos, no convergido (L1 loss ≈ 0.60), por lo que no debe utilizarse para control real de robots ni esperar éxito en tareas.
- No se ha probado en un robot físico (ni Unitree G1 ni SONIC/WBC), solo se ha validado la cadena de datos y entrenamiento.
- El dataset de entrenamiento es público y limitado (355 episodios), lo que restringe la generalización a otras escenas u objetos.
- La entrada es una única imagen egocéntrica; no se soportan múltiples cámaras ni entradas de profundidad.
- No se especifican idiomas ni capacidades de lenguaje natural; el modelo está orientado exclusivamente a acciones robóticas.
- La licencia MIT permite uso comercial, pero el modelo no es apto para producción sin un entrenamiento completo.
- Puede presentar sesgos derivados del dataset de agarre con mano derecha (limitado a ese escenario).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/TangYishan/starvla-qwenoft-g1-sonic
- Repositorio StarVLA (GitHub): https://github.com/starVLA/starVLA
- Configuración de entrenamiento (YAML): https://github.com/starVLA/starVLA/blob/starVLA_dev/examples/realRobots/UnitreeG1_WholeBody/step2_training/train_files/starvla_qwenoft_g1_sonic.yaml
- Documentación de StarVLA: https://starvla.github.io/docs/
- Documentación de Qwen-OFT en DeepWiki: https://deepwiki.com/starVLA/starVLA/4.4-qwen-oft-(parallel-prediction)
- Comparativa QwenFast vs QwenOFT en DeepWiki: https://deepwiki.com/shaoxiang/starVLA/4.3-qwenfast-and-qwenoft
