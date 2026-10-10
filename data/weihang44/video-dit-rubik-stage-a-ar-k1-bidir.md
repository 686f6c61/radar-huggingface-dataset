# weihang44/video-dit-rubik-stage-a-ar-k1-bidir

## Resumen

Video DiT — Stage A (AR-k1 y bidirectional) es un archivo de checkpoints de investigación orientado a la generación de vídeo de un cubo de Rubik 2x2 de tres caras con cámara fija. Lo publica el usuario weihang44 en HuggingFace y no constituye un modelo conversacional ni un pipeline listo para producción, sino una colección de pesos nativos de entrenamiento. El modelo recibe el fotograma frontal inicial y un prompt de lenguaje completo de nueve acciones, y genera los 20 fotogramas latentes futuros; las variantes autorregresivas (AR) usan el historial visual generado en inferencia, mientras que las bidireccionales desruidifican los 20 fotogramas latentes de forma conjunta.

La arquitectura es un Diffusion Transformer (DiT) de vídeo con 3D RoPE, SwiGLU, dimensión de cabeza 64, 16 canales latentes, parches latentes (1,2,2) y características de lenguaje cacheadas de 768 dimensiones. Los checkpoints oscilan entre 94,2 y 96,9 millones de parámetros según su forma (balanced, deep-narrow o wide-shallow). Se libera como baseline exclusivamente de vídeo, sin condicionamiento de estado vectorial ni pérdida auxiliar de estado.

Su relevancia es la de un artefacto de investigación sobre leyes de escala en generación de vídeo con flujo rectificado: el repositorio planifica 48 checkpoints y publica pesos verificados por SHA-256, con metadatos de exposición de entrenamiento, arquitectura y protocolo. No se acompaña de código ejecutable, VAE ni assets de lenguaje, y el propio autor advierte que no afirma que todos los modelos hayan convergido ni resuelvan de forma fiable las tareas del cubo de Rubik.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) de vídeo con 3D RoPE, SwiGLU, parches latentes (1,2,2), 16 canales latentes |
| Parametros totales | 94.200.336 (balanced), 95.033.360 (deep-narrow), 96.909.328 (wide-shallow) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (genera 20 fotogramas latentes futuros a partir de un fotograma inicial y un prompt de nueve acciones) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible (la model card indica que esta release no especifica ninguna nueva concesión de licencia) |
| Formato de pesos | PyTorch `.pt` (incluye `model_state_dict` y `ema_parameter_state`; los ficheros de recuperación añaden estado del optimizador y RNG por rank) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer de vídeo que opera sobre latentes. Según el autor, todos los checkpoints emplean 3D RoPE, dimensión de cabeza 64, SwiGLU, 16 canales latentes, parches latentes (1,2,2) y características de lenguaje cacheadas de 768 dimensiones. La tabla del repositorio detalla tres formas con 14, 22 o 10 capas y anchos de 640, 512 o 768 respectivamente, lo que da lugar a los recuentos de parámetros anteriores. Las variantes AR generan usando el historial visual ya producido en inferencia con k=1; las bidireccionales desruidifican conjuntamente los 20 fotogramas latentes futuros.

El protocolo de entrenamiento descrito incluye una planificación de warmup lineal seguida de decaimiento coseno desde 4e-4 hasta 4e-5 a 1M de vídeos, con warmup sobre 16.384 vídeos. El lote efectivo es de 16 vídeos y cada uno aporta 5.120 tokens de parche objetivo futuro. El optimizador es AdamW con betas (0,9; 0,95), epsilon 1e-8, weight decay 0,05, recorte de gradiente 1,0 y decaimiento EMA de 0,9999. La semilla de entrenamiento es 20260727. Las variantes AR se entrenan con historial limpio forzado por profesor (teacher forcing) y una actualización de optimizador por lote efectivo. La continuación de Stage B usa segmentos de datos nuevos y disjuntos en lugar de repetir épocas. No se documentan fases de RLHF ni DPO, y los activos de VAE (Wan2.1 congelado) y ModernBERT/action-token no se incluyen en el repositorio.

## Capacidades

- Generación de vídeo de un cubo de Rubik 2x2 de tres caras con cámara fija a partir de un fotograma frontal inicial.
- Condicionamiento por prompt de lenguaje con una secuencia completa de nueve acciones.
- Dos modos de generación: autorregresivo (AR-k1), que usa el historial visual generado, y bidireccional, que desruidifica los 20 fotogramas latentes futuros de forma conjunta.
- Representación latente de vídeo con 16 canales y parches (1,2,2) sobre un VAE externo (Wan2.1 congelado, no incluido).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el prompt es en inglés.
- Capacidades especiales: no disponible más allá de la generación de vídeo condicionada por lenguaje.

## Casos de uso

- Investigación sobre leyes de escala en generación de vídeo: los checkpoints permiten estudiar cómo varían las métricas de generación con la forma del DiT (ancho, profundidad, número de cabezas) manteniendo el protocolo de entrenamiento.
- Estudio de estrategias de decodificación autorregresiva frente a bidireccional: comparar el uso de historial visual generado (AR-k1) con la desruidificación conjunta de los 20 fotogramas latentes.
- Reproducción de experimentos con flujo rectificado: el repositorio publica metadatos de arquitectura, exposición y normalización para replicar el entrenamiento con el mismo contrato de datos.
- Benchmarking de condicionamiento por lenguaje de acciones: evaluar la fidelidad de la secuencia de nueve acciones sobre la evolución del cubo de Rubik en cada checkpoint.
- Base para trabajo de destilación o ajuste fino: al ser pesos nativos de PyTorch con estado EMA, se pueden reutilizar como punto de partida en experimentos de adaptación, siempre restaurando los assets de datos y backbone.
- Auditoría de artefactos de entrenamiento: los ficheros de recuperación incluyen estado del optimizador y de RNG, útiles para reproducibilidad y análisis de la dinámica de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que este es un archivo de checkpoints y no una afirmación de que todos los modelos hayan convergido o resuelvan de forma fiable las tareas del cubo de Rubik, por lo que no se ofrecen cifras de MMLU, HumanEval, GSM8K ni métricas específicas de generación de vídeo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia de ingeniería, un checkpoint de ~95M de parámetros ocupa del orden de 380 MB en fp32 y ~190 MB en bf16, más el coste del VAE de vídeo externo y de los latentes de 20 fotogramas, que no se cuantifica en la información proporcionada.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible; el tamaño del repositorio (41,2 GB) corresponde al archivo completo de checkpoints, no al peso de un único modelo en memoria.
- Opciones de despliegue: el autor indica que estos no son checkpoints de pipelines de Transformers ni de Diffusers y que no se incluye código ejecutable de entrenamiento o inferencia, por lo que no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI; se requiere el generador/configuración nativos exactos.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no describe modelos comparables de la misma categoría (generación de vídeo condicionada por lenguaje para tareas de cubo de Rubik con DiT y flujo rectificado), y no se aportan métricas que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- El autor advierte que este es un archivo de checkpoints y no una afirmación de convergencia ni de resolución fiable de las tareas del cubo de Rubik.
- No se especifica ninguna licencia nueva; el uso comercial queda sin marco explícito en la model card.
- El repositorio no incluye el VAE de Wan2.1, ni los assets de ModernBERT/action-token, ni los datos, ni el código ejecutable de entrenamiento o inferencia, por lo que no es directamente utilizable sin restaurar esos componentes.
- Los pesos entrenados usan EMA: cargar solo los pesos en bruto no aplica EMA automáticamente; hay que sustituir los parámetros nombrados en el estado en bruto preservando los buffers.
- Los ficheros de recuperación contienen objetos RNG de NumPy y pueden requerir `torch.load(..., weights_only=False)`.
- Reanudar el entrenamiento en otro entorno exige remapear rutas saneadas (`local-assets/`) y restaurar los contratos de datos y protocolo que valida el entrenador original.
- El soporte de idioma se limita al inglés en los prompts de acción.
- Riesgo de alucinación visual y de deriva en la generación de fotogramas: no se documentan tasas de error, sesgos conocidos ni límites de contexto explícitos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weihang44/video-dit-rubik-stage-a-ar-k1-bidir
- Release relacionada (Stage-A AR-k4): https://huggingface.co/weihang44/video-dit-rubik-stage-a-ar-k4
- Paper, blog, repositorio o demo adicionales: no disponible en la información proporcionada.
