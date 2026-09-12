# Travor278/pi05-putcab-sequential-train50-v4-lora-10k

## Resumen

PI0.5 PutCab-Sequential-Train50-V4 LoRA 10k es un ajuste fino mediante LoRA del modelo base PI0.5 en su implementación JAX, publicado por el usuario Travor278 en HuggingFace. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, entrenado específicamente para una tarea de manipulación bimanual: abrir el cajón de un armario con el brazo izquierdo y depositar un objeto en su interior con el brazo derecho. El prompt de condicionamiento de la tarea es exactamente "Open the cabinet drawer with the left arm and place the object into it with the right arm."

El modelo parte de un checkpoint PI0.5 JAX original (XinY0201/openpi-pi05-base-jax, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658) y emplea un único action expert estándar. El ajuste se realizó sobre el dataset Shiki42/PutCab-Sequential-Train50-V4 (50 episodios, 18.143 fotogramas a 16,667 FPS), con estado y acciones absolutos nativos de 14 dimensiones y tres vistas RGB a 224x224. El entrenamiento consumió dos GPU H100 de 80 GB durante 10.000 actualizaciones con batch global 16.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación reproducible más que de un modelo de propósito general. El propio autor declara explícitamente que no se reivindica ninguna tasa de éxito en despliegue en bucle cerrado (closed-loop rollout), y el repositorio no registra descargas ni valoraciones. Su interés principal radica en servir como ejemplo verificable de un pipeline de fine-tuning LoRA sobre PI0.5 con JAX y Orbax, con trazabilidad de manifiestos, normalización y estado del optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) basada en PI0.5, con backbone PaliGemma y un action expert único; detalles de capas y dimensiones no disponibles |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el entrenamiento usa bf16 en activaciones y pesos congelados, y float32 en pesos entrenables (no se documentan formatos cuantizados de inferencia) |
| Idiomas soportados | no disponible; el prompt de entrenamiento está en inglés |
| Licencia | no disponible |
| Formato de pesos | checkpoint Orbax de OpenPI/JAX (raíz `10000/`); incluye pesos base, pesos LoRA y activos de normalización |
| Tamaño del repositorio | 6,3 GB |
| Dataset de entrenamiento | Shiki42/PutCab-Sequential-Train50-V4 (commit c6022cf9164b34c7244dfede8ece4d20a999ab82) |
| Ventana temporal de acción | horizonte 50 |
| Dimensión de estado/acción | 14 nativa, ampliada a 32 mediante padding |

## Arquitectura y entrenamiento

La arquitectura subyacente es PI0.5, un modelo de visión-lenguaje-acción que combina un backbone PaliGemma (codificador visual más modelo de lenguaje) con un action expert dedicado a la generación de acciones. En este caso se emplea el "standard single action expert" de PI0.5. El ajuste se aplica con LoRA de rango/alfa 16 sobre el backbone PaliGemma y rango 32 sobre el action expert, mediante un filtro de congelación que mantiene entrenables las proyecciones y partes de la visión. No se documentan innovaciones arquitectónicas adicionales respecto al modelo base.

El entrenamiento se realizó sobre 50 episodios completos (18.143 fotogramas a 16,6667 FPS) con estado y acciones absolutos nativos de 14 dimensiones, sin conversión de unidades tipo delta/Aloha ni máscara de inactividad. Tres vistas RGB nativas se mapean mediante el `training_config.py` adjunto y se redimensionan a 224x224; el estado y las acciones se rellenan (padding) hasta 32 dimensiones y el horizonte es de 50. Se usaron dos H100 de 80 GB con batch global 16, semilla 87431 y 10.000 actualizaciones, con activaciones y pesos congelados en bf16 y pesos entrenables en float32. El optimizador fue AdamW (b1=0,9, b2=0,95, eps=1e-8, weight_decay=1e-10, clip=1) sin EMA, con una curva coseno fija de 30k pasos, 1.000 de warmup, pico 2,5e-5 y valor final 2,5e-6, deteniéndose en el paso 10k. El runtime empleó el contenedor NGC PyTorch 25.02 con un entorno JAX construido aparte. El autor indica que no se reivindica identidad byte a byte con el runtime histórico archivado de CTR.

## Capacidades

- Generación de acciones robóticas de manipulación en 14 dimensiones a partir de estado del robot y tres vistas RGB.
- Ejecución de una tarea bimanual específica: apertura de un cajón de armario con el brazo izquierdo y colocación de un objeto con el brazo derecho.
- Condicionamiento por prompt de lenguaje natural (el prompt de la tarea está fijado en inglés).
- Procesamiento de múltiples vistas de cámara (tres vistas RGB nativas) a resolución 224x224.
- Predicción de secuencias de acción con horizonte 50.
- No se documentan capacidades de tool calling, function calling, razonamiento multi-paso, generación de texto general, visión de propósito general ni modo "thinking".
- No se documentan capacidades multilingües.

## Casos de uso

- Automatización de una celda robótica concreta: el modelo puede controlar un robot bimanual para la secuencia de abrir un cajón y depositar un objeto, siempre que la escena y el montaje de cámaras coincidan con las condiciones del dataset de entrenamiento.
- Reproducción de experimentos de fine-tuning LoRA sobre PI0.5: el checkpoint y los artefactos de `10000/experiment/` permiten auditar la configuración, los manifiestos y el estado del optimizador como referencia metodológica.
- Base para nuevos ajustes finos: al ser un LoRA sobre PI0.5 JAX, puede servir como punto de partida para reentrenar sobre otros datasets de manipulación dentro del ecosistema OpenPI.
- Validación de pipelines de entrenamiento JAX/Orbax: el modelo documenta comprobaciones de restauración estricta de parámetros, verificación de valores finitos y hashes de arrays decodificados, útil para pruebas de infraestructura.
- Investigación en VLA bimanual: permite estudiar cómo se comporta un action expert con estado/acción de 14 dimensiones y padding a 32 en tareas de dos brazos.
- Evaluación comparativa de estrategias de congelación (freeze filter) y de configuración de LoRA en modelos PaliGemma aplicados a robótica.
- Pruebas de integración con el runtime OpenPI: sirve para verificar la carga de checkpoints Orbax con activos de normalización en entornos de despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se reivindica ninguna tasa de éxito de despliegue en bucle cerrado (closed-loop rollout success-rate), por lo que no existen métricas de rendimiento verificables publicadas.

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU NVIDIA H100 de 80 GB, batch global 16, 10.000 actualizaciones.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible; el autor no especifica requisitos de inferencia. El entrenamiento se realizó en H100 de 80 GB.
- Compatibilidad con GPU de consumo: no confirmada. El repositorio ocupa 6,3 GB en disco, pero no hay datos que confirmen que la carga en memoria quepa en GPUs de consumo concretas.
- Precisión relevante: bf16 en activaciones y pesos congelados, float32 en pesos entrenables durante el entrenamiento; no se documenta el formato de inferencia.
- Opciones de despliegue: entorno OpenPI sobre JAX, cargando el checkpoint Orbax desde la raíz `10000/`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo VLA JAX de este tipo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PI0.5 PutCab-Sequential-Train50-V4 LoRA 10k (este modelo) | no disponible | no disponible | Manipulación bimanual (abrir cajón y colocar objeto) | no disponible | HuggingFace, 0 descargas |
| PI0.5 JAX base (XinY0201/openpi-pi05-base-jax) | no disponible | no disponible | Modelo VLA base de propósito general | no disponible | HuggingFace (modelo padre) |
| Otros modelos VLA de la misma categoría (por ejemplo, alternativas tipo OpenVLA o PI0) | no disponible | no disponible | Manipulación robótica | no disponible | no disponible en la información proporcionada |

No se dispone de datos comparativos de parámetros, contexto, rendimiento o licencia para alternativas en la información consultada. La única comparación trazable es con el checkpoint PI0.5 JAX del que deriva este ajuste.

## Limitaciones y advertencias

- No se reivindica ninguna tasa de éxito en despliegue en bucle cerrado; el rendimiento real de la política no está validado públicamente.
- Modelo altamente especializado: está ajustado para una única tarea y un prompt fijo en inglés, y no se espera que generalice a otras tareas sin reentrenamiento.
- Licencia no disponible: no puede asumirse uso comercial permitido sin verificar los términos del autor y del modelo base.
- Idiomas no documentados; el condicionamiento de tarea está en inglés.
- Dataset de entrenamiento reducido (50 episodios, 18.143 fotogramas), lo que limita la diversidad de escenas y puede favorecer el sobreajuste a las condiciones de captura.
- Riesgo de alucinación: no documentado explícitamente, pero aplicable a modelos VLA que generan acciones a partir de entradas visuales y de estado; no hay evaluación publicada.
- Sesgos conocidos: no disponibles.
- El autor advierte que el entorno no es byte a byte idéntico al runtime histórico archivado de CTR y que el estado del optimizador permanece en la plataforma de entrenamiento, no en el checkpoint.
- Artefacto de investigación con 0 descargas y 0 valoraciones; no ha pasado revisión por pares.
- El repositorio se creó y actualizó en fechas registradas como 2026, dato a verificar por el lector.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-putcab-sequential-train50-v4-lora-10k
- Modelo base PI0.5 JAX: https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/PutCab-Sequential-Train50-V4 (commit c6022cf9164b34c7244dfede8ece4d20a999ab82)
- Librería OpenPI (referenciada en las etiquetas y en el campo `library_name`): no se proporciona URL específica en la información disponible.
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
