# zhangify/oalc-local159-step175-backup-20261113

## Resumen

OALC local159 step 175 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de una instantánea intermedia (step 175) de un proceso de entrenamiento identificado internamente como `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`, lo que sugiere un ajuste fino sobre una base de la familia Qwen 3.5 con un objetivo de destilación por divergencia KL sobre datos muestreados localmente, sin modo "thinking" activado y con un learning rate de 1e-6.

El modelo tiene 4.539.265.536 parámetros (aproximadamente 4,5 mil millones) almacenados en safetensors, con un tamaño de repositorio de 18,2 GB, lo que es coherente con pesos en precisión de 32 bits o múltiples precisiones mezcladas. La pipeline declarada es `image-text-to-text`, por lo que el checkpoint está orientado a tareas multimodales de entrada imagen y texto con salida textual, aunque la model card no aporta detalles sobre la arquitectura concreta ni sobre el dataset de entrenamiento.

La relevancia de esta ficha es limitada desde el punto de vista de producción: el autor la describe explícitamente como un checkpoint de investigación que preserva pesos, tokenizer y configuración originales, sin estado del optimizador y sin posibilidad de reanudar el entrenamiento de forma exacta. No incluye evaluación de calidad ni de seguridad, y no se han publicado benchmarks. Es, por tanto, un artefacto útil para reproducibilidad e inspección de un proceso de entrenamiento, no un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5, segun tag de Hugging Face); detalles no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El tag `qwen3_5` y la pipeline `image-text-to-text` apuntan a un transformer multimodal de la familia Qwen 3.5, con torre de visión y módulo de proyección hacia el espacio de tokens del modelo de lenguaje, aunque la model card no confirma la arquitectura exacta ni el número de capas, dimensiones ocultas o cabezas de atención. El nombre del run de entrenamiento (`qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06`) sugiere un ajuste fino de 250 pasos con learning rate 1e-6, usando datos muestreados localmente y una pérdida de divergencia KL (probablemente destilación desde un modelo profesor o regularización frente a la distribución de referencia), con el modo de razonamiento extendido ("thinking") desactivado.

El checkpoint corresponde al paso 175 de esos 250, por lo que es una instantánea intermedia y no el resultado final del run. El repositorio conserva pesos, tokenizer y configuración, pero no el estado del optimizador, de modo que no permite reanudar el entrenamiento de forma exacta. No se documentan el volumen de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional: la model card incluye el tag `conversational`, lo que indica que el checkpoint está formateado para diálogo multi-turno.
- Procesamiento de imagen y texto: la pipeline `image-text-to-text` implica entrada multimodal (imagen más prompt textual) y salida de texto.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que la configuración puede servirse mediante la infraestructura de Inference Endpoints de Hugging Face con la librería transformers.
- Razonamiento extendido: el identificador del run incluye `thinkFalse`, por lo que el modo de razonamiento explícito está desactivado en este checkpoint.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades de audio: no disponible.

## Casos de uso

- Reproducibilidad de investigación: el checkpoint permite inspeccionar el estado intermedio de un run de destilación KL sobre una base Qwen 3.5, comparando el paso 175 con otros checkpoints del mismo proceso para estudiar la evolución de la pérdida y del comportamiento generativo.
- Análisis de dinámica de entrenamiento: al conservarse pesos, tokenizer y configuración, un investigador puede evaluar cómo cambia la distribución de salida entre pasos y verificar hipótesis sobre el efecto del learning rate 1e-6 y del objetivo KL.
- Experimentos de multimodalidad controlados: al ser un modelo imagen-texto de 4,5 mil millones de parámetros, sirve como punto de partida de bajo coste para probar pipelines de visión-lenguaje antes de escalar a modelos mayores.
- Servicio de prototipos conversacionales: mediante transformers y un endpoint compatible, se puede levantar una API de chat multimodal para demos internas, asumiendo que no hay garantías de calidad ni de seguridad.
- Evaluación comparativa de checkpoints: útil para medir deriva (drift) respecto al modelo base Qwen 3.5 y cuantificar cuánto se aleja la distribución tras 175 pasos de ajuste con KL.
- Estudio de alineación sin modo thinking: al tener `thinkFalse`, permite analizar el comportamiento de un modelo multimodal cuando se le impide generar cadenas de razonamiento explícitas, comparándolo con variantes que sí las habilitan.
- Base para ajuste fino posterior: sus 4,5 mil millones de parámetros caben en GPUs de gama alta para experimentos de fine-tuning con LoRA, aunque la licencia no disponible impide confirmar si el uso comercial está permitido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 9 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones, KV cache y torre de visión; en la práctica, entre 12 y 16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 5 GB para pesos, con un total realista de 8 a 10 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 2,5 a 3 GB para pesos, con un total realista de 5 a 7 GB; sin embargo, no se publican pesos GGUF ni AWQ en el repositorio, por lo que habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para servir en BF16 con contexto largo y concurrencia; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en BF16 de un solo usuario; RTX 4080 (16 GB) o RTX 4070 Ti SUPER (16 GB) para BF16 con contexto limitado o FP8.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16, y en tarjetas de 8 GB si se cuantiza a 4 u 8 bits (previa conversión).
- Opciones de despliegue: transformers (librería declarada), Inference Endpoints de Hugging Face (tag `endpoints_compatible`), vLLM y TGI si la arquitectura qwen3_5 está soportada por esas herramientas, y llama.cpp/Ollama solo tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OALC local159 step 175 | 4,54 mil millones | no disponible | Sí (image-text-to-text) | no disponible | Checkpoint de investigación en HF |
| Qwen2.5-VL-3B | 3 mil millones (aprox.) | no disponible en esta ficha | Sí | no disponible en esta ficha | Modelo publicado por Alibaba |
| Qwen2.5-VL-7B | 7 mil millones (aprox.) | no disponible en esta ficha | Sí | no disponible en esta ficha | Modelo publicado por Alibaba |
| Llama 3.2 11B Vision | 11 mil millones (aprox.) | no disponible en esta ficha | Sí | no disponible en esta ficha | Modelo publicado por Meta |

La comparación cuantitativa de rendimiento no es posible porque el checkpoint no publica benchmarks y los datos de los modelos alternativos no se han verificado en la información disponible. La principal diferencia cualitativa es que OALC local159 es un artefacto de investigación intermedio, mientras que los modelos citados son lanzamientos oficiales con evaluación publicada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 175 de un run de 250, por lo que no representa el resultado final del entrenamiento y su calidad puede ser inferior a la del modelo base.
- Sin evaluación: el autor declara explícitamente que la subida no implica ninguna evaluación de calidad ni de seguridad.
- Sin estado del optimizador: no permite reanudar el entrenamiento de forma exacta, lo que limita su uso para reproducir el run completo.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; en la práctica, debe tratarse como no apto para producción hasta que el autor aclare la licencia.
- Idiomas no declarados: se desconoce el soporte multilingüe real y el comportamiento fuera del inglés.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide dimensionar el KV cache y planificar despliegues con prompts largos.
- Riesgo de alucinación: al no haber evaluación de fidelidad ni de seguridad, no hay garantías sobre la tasa de alucinación en tareas de visión-lenguaje.
- Sesgos desconocidos: no se documenta la composición del dataset de ajuste, por lo que no se pueden anticipar sesgos demográficos, culturales o de dominio.
- Modo thinking desactivado: el identificador `thinkFalse` indica que el razonamiento extendido está deshabilitado, lo que puede degradar el rendimiento en tareas que requieren cadenas de razonamiento largas.
- Sin cuantizaciones oficiales: no se publican pesos GGUF, AWQ ni GPTQ, por lo que el despliegue en hardware limitado requiere conversión propia y validación adicional.
- Repositorio con cero descargas y cero likes: no hay evidencia de uso comunitario ni de validación externa del checkpoint.

## Enlaces

- Hugging Face: https://huggingface.co/zhangify/oalc-local159-step175-backup-20261113
- Repositorio de procedencia citado en la model card: `backup_provenance.json` (incluido en el propio repositorio de Hugging Face)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
