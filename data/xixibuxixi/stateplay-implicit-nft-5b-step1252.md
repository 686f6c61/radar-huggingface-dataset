# xixibuxixi/StatePlay-Implicit-NFT-5B-step1252

## Resumen

StatePlay-Implicit-NFT-5B-step1252 es un checkpoint experimental de generación de vídeo condicionada por acciones, publicado por el usuario xixibuxixi en Hugging Face. Se construye sobre el modelo base Wan-AI/Wan2.2-TI2V-5B (un transformer de difusión de 5B parámetros para image-to-video) y añade un módulo de estado implícito denominado "StatePlay", que permite controlar la generación mediante secuencias de pulsaciones de botones (estilo videojuego) sin necesidad de proporcionar estados de juego explícitos. El modelo parte de un SFT previo (step-4572) y aplica un postentrenamiento con refuerzo (NFT, presumiblemente "Negative-aware Fine-Tuning" o variante similar) durante 1.252 pasos de optimizador sobre 10.000 grupos de condiciones.

La relevancia de este checkpoint es doble. Por un lado, explora el control fino de vídeo generado mediante acciones discretas, un área de interés creciente para agentes que aprenden de interacción con entornos simulados. Por otro, documenta con inusual detalle el proceso de entrenamiento (LoRA rank 32 sobre atención y FFN, actualización directa del módulo de transición de estado B, 95,05M de parámetros entrenables) y las limitaciones de la release.

Es importante subrayar que se trata de un checkpoint final de entrenamiento sin validación independiente: el propio autor indica que no se ha completado una evaluación de calidad de vídeo a resolución completa ni una verificación en conjunto de test separado. No es un modelo listo para producción ni una release validada con benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con módulo de estado implícito StatePlay, basado en Wan2.2-TI2V-5B |
| Parámetros totales | Aproximadamente 5B (heredados del base Wan2.2-TI2V-5B); parámetros entrenables en esta fase: 95.054.080 (95,05M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de vídeo; la ventana temporal se define por el número de frames, por defecto 97, configurable en múltiplos de 4n+1) |
| Tipos de cuantización | No disponible (pesos publicados en BF16; no se documentan variantes GGUF/INT8/INT4) |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors (archivo `StatePlay-NFT-step-1252.safetensors`, ~10 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión (DiT) derivado de Wan2.2-TI2V-5B, un modelo image-to-video de 5B parámetros. Sobre esa base, StatePlay introduce un módulo de transición de estado implícito (denominado "B") que mapea secuencias de acciones discretas (12 botones: UP, DOWN, LEFT, RIGHT, Y, X, Z, A, B, C, D y uno adicional) a estados latentes que condicionan la generación de vídeo. A diferencia de la variante "explícita" del proyecto, este checkpoint no requiere una secuencia de estados de juego proporcionada por el usuario: solo necesita el primer frame, el prompt de texto y el archivo de acciones. El checkpoint publicado es un DiT completo ya fusionado, no un adaptador LoRA incremental.

El entrenamiento parte de un SFT previo (step-4572) y aplica NFT (postentrenamiento con refuerzo) con las siguientes características: LoRA de rango 32 y alpha 64 sobre 420 proyecciones (q/k/v/o y FFN de 30 capas, más atención de estado), con actualización directa del módulo B. Se usan 4 rollouts por condición, batch de 32 grupos, 2 épocas internas, acumulación de gradiente 4, AdamW con weight decay 0,01 y clipping 1,0. La tasa de aprendizaje es 1e-4 para LoRA y 2e-5 para el módulo B. El entrenamiento se realizó en 16 GPUs con pesos maestros FP32 y base BF16, usando un scorer congelado basado en Qwen3.5-9B con LoRA. Se completaron 1.252 actualizaciones sobre 10.000 grupos de condiciones.

La fusión de LoRA se realiza en FP32 (`B @ A * alpha/rank`) y luego se convierte a BF16, lo que según el autor no garantiza equivalencia bit a bit con ejecutar la rama LoRA por separado. Además, la inferencia desactiva el fastpath nativo de MultiheadAttention para coincidir con la ruta de entrenamiento.

## Capacidades

- Generación de vídeo a partir de una imagen inicial (image-to-video) condicionada por una secuencia de acciones discretas.
- Control de la evolución temporal del vídeo mediante pulsaciones de botones mapeadas a estados latentes implícitos.
- Generación de clips de 97 frames por defecto a 832×480 y 20 fps, con posibilidad de configurar 101 frames u otros valores válidos (4n+1).
- Soporte de prompts de texto en chino e inglés.
- No requiere secuencias de estado de juego explícitas: el estado se infiere implícitamente de las acciones.
- Inferencia por etapas (DiT, codificador de texto, VAE cargados secuencialmente en GPU) para reducir picos de memoria.
- No se documentan capacidades de tool calling, agentes multi-paso, audio ni thinking mode (no aplicables a un modelo de vídeo).

## Casos de uso

- Investigación en control de vídeo generativo: el modelo permite estudiar cómo secuencias de acciones discretas modulan la evolución de un vídeo generado, útil para experimentos sobre condicionamiento temporal y consistencia de interacción.
- Simulación de gameplay para entrenamiento de agentes: generar trayectorias visuales plausibles a partir de políticas de acciones permite aumentar datos para agentes de reinforcement learning en entornos simulados, aunque la calidad no está validada.
- Prototipado de herramientas de creación de contenido interactivo: estudios pequeños pueden usar el modelo para generar clips cortos controlados por acciones y evaluar viabilidad antes de invertir en modelos mayores.
- Comparación de métodos de postentrenamiento: al publicarse checkpoints en distintos pasos (step-698, step-1252) con configuraciones documentadas, sirve como material para estudiar el efecto de ampliar el rango de parámetros entrenables (de 1,66M a 95,05M).
- Reproducción de experimentos académicos: el repositorio incluye manifiestos de exportación, configuración de entrenamiento y scripts de inferencia compatibles con el proyecto SFT original, lo que facilita la replicación controlada.
- Evaluación de robustez de modelos de vídeo condicionados: al no haber validación independiente, investigadores pueden usarlo como caso de estudio de degradación o deriva respecto al SFT base.
- Generación de vídeo breve para demostraciones técnicas: clips de ~5 segundos (97 frames a 20 fps) con control de acciones para presentaciones o pruebas de concepto, siempre con revisión manual de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que las puntuaciones registradas durante el entrenamiento son recompensas de rollout y no deben interpretarse como resultados sobre un conjunto de test fijo. Tampoco se ha realizado una evaluación de calidad de vídeo a resolución completa ni una comparación validada frente al SFT original o al modelo oficial.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El autor señala que el consumo depende de resolución, número de frames y backend de atención, y que la inferencia carga DiT, codificador de texto y VAE de forma secuencial en GPU.
- El checkpoint safetensors ocupa aproximadamente 10 GB, por lo que cargar el DiT en BF16 requiere al menos ese orden de magnitud de memoria, más los componentes auxiliares (VAE y UMT5) y los buffers de activación.
- GPU recomendadas: no especificadas. El entrenamiento se realizó en 16 GPUs (modelo no indicado). Para inferencia, se requiere una GPU CUDA con memoria suficiente para el DiT en BF16; no se documenta compatibilidad con GPUs de consumo.
- No se confirma que quepa en GPUs de consumo tipo RTX 4090 (24 GB); es plausible pero no está verificado en la información disponible.
- Opciones de despliegue: scripts propios `infer.py` (entrada independiente) e `infer_sft_project.py` (compatible con el proyecto SFT implícito existente). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / frames | Condicionamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StatePlay-Implicit-NFT-5B-step1252 | ~5B (95,05M entrenables en esta fase) | 97 frames por defecto (configurable 4n+1) | Imagen + prompt + acciones discretas (estado implícito) | No disponible | Hugging Face, checkpoint experimental |
| Wan-AI/Wan2.2-TI2V-5B (base) | ~5B | No disponible en la información | Imagen + prompt | No disponible en la información | Hugging Face, modelo base oficial |
| StatePlay-Implicit-NFT-5B-step698 (mismo autor) | ~5B (1,66M entrenables) | 97/101 frames | Imagen + prompt + acciones (estado implícito) | No disponible | Hugging Face, checkpoint previo |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a parámetros, condicionamiento y disponibilidad.

## Limitaciones y advertencias

- Checkpoint experimental sin validación independiente: el autor indica que no se ha completado la aceptación de integridad de vídeo a resolución completa ni una evaluación de calidad en conjunto de test separado.
- No es el modelo oficial de estado explícito de StatePlay ni una release validada con benchmarks; no debe tratarse como referencia de rendimiento.
- Licencia no disponible: no se puede confirmar el uso comercial; es imprescindible contactar con el autor antes de cualquier despliegue productivo.
- Riesgo de degradación respecto al SFT: al ampliar el rango entrenable (atención y FFN además del módulo B), el autor advierte que la apariencia, la temporalidad y la respuesta a acciones pueden haber cambiado, y que más parámetros no garantizan mejor calidad.
- Posibles sesgos derivados de los datos de entrenamiento y del scorer Qwen3.5-9B con LoRA usado para las recompensas; no se documenta la composición del dataset.
- Riesgo de alucinación visual y de inconsistencias temporales en vídeos generados, especialmente en interacciones complejas o secuencias de acciones largas.
- Idiomas limitados a chino e inglés en los prompts; no se garantiza un comportamiento correcto en otros idiomas.
- No es un repositorio compatible con `Diffusers.from_pretrained()`; requiere los scripts y la configuración específicos del proyecto, y una carga estricta que fallará si la arquitectura no coincide.
- La fusión de LoRA en FP32 y conversión a BF16 no garantiza equivalencia bit a bit con la ejecución de la rama LoRA original.
- El paquete no incluye optimizador, RNG, reward model ni datos de entrenamiento: no sirve como punto de reanudación exacto del entrenamiento.
- El número de frames debe ser 4n+1; valores no válidos provocarán errores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xixibuxixi/StatePlay-Implicit-NFT-5B-step1252
- Checkpoint previo step-698: https://huggingface.co/xixibuxixi/StatePlay-Implicit-NFT-5B-step698
- Modelo base Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Modelo auxiliar Wan2.1-T2V-1.3B (tokenizer): https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B
