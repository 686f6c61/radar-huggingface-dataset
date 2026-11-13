# zhangify/oalc-local159-step250-backup-20261113

## Resumen

OALC local159 step 250 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text derivado de la familia Qwen 3.5 (etiqueta `qwen3_5` en los metadatos), entrenado durante 250 pasos con un learning rate de 1e-06 dentro de un experimento identificado como `qwen35_local_sampled_kl159_thinkFalse_250step`. El nombre sugiere una variante de ajuste con destilación por divergencia KL sobre muestras locales y modo de razonamiento desactivado (`thinkFalse`).

El repositorio tiene un carácter puramente de preservación: conserva los pesos originales, el tokenizer y la configuración del modelo, pero no incluye estado del optimizador ni permite reanudar el entrenamiento de forma exacta. El autor declara explícitamente que la subida no implica ninguna evaluación de calidad ni de seguridad del modelo.

Con 4.539.265.536 parámetros totales (aproximadamente 4,54 mil millones) y un tamaño de repositorio de 18,2 GB, es un modelo de escala media orientado a investigación. No dispone de descargas ni interacciones, y la información pública sobre arquitectura detallada, datos de entrenamiento y licencia es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen 3.5 (image-text-to-text); detalles internos no disponibles |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en safetensors sin cuantizar en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3_5` y su pipeline es `image-text-to-text`, lo que indica una arquitectura transformer multimodal capaz de procesar imágenes y texto de entrada para generar texto. No se dispone de información pública sobre el número de capas, dimensión oculta, mecanismo de atención ni sobre el codificador visual empleado.

El entrenamiento corresponde a un checkpoint intermedio (paso 250) de un experimento denominado `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`. Los elementos del nombre sugieren: muestreo local, una pérdida basada en divergencia KL con un coeficiente o configuración asociada a "159", modo de pensamiento desactivado y un learning rate de 1e-06. No se especifican el volumen de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. El autor indica que el repositorio no contiene estado del optimizador y que no soporta reanudación exacta del entrenamiento; los detalles de procedencia y checksums se encuentran en el archivo `backup_provenance.json` del propio repositorio.

## Capacidades

- Generación de texto a partir de entradas multimodales (imagen y texto), según el pipeline declarado `image-text-to-text`.
- Conversación multi-turno: la etiqueta `conversational` figura entre los metadatos del modelo.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere que puede desplegarse mediante la infraestructura de inferencia de Hugging Face.
- Modo de razonamiento: el identificador del experimento incluye `thinkFalse`, lo que apunta a un entrenamiento con el modo de pensamiento desactivado; no se detalla el comportamiento resultante.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en destilación y ajuste fino: el checkpoint permite analizar el efecto de 250 pasos de entrenamiento con pérdida KL sobre un modelo base Qwen 3.5, comparando su comportamiento con el modelo de partida en tareas controladas.
- Reproducción de experimentos: al conservar pesos, tokenizer y configuración, sirve para replicar inferencias del experimento `qwen35_local_sampled_kl159_thinkFalse_250step` sin necesidad de reentrenar.
- Evaluación de modelos multimodales en laboratorio: puede utilizarse como punto de comparación en pruebas internas de image-text-to-text frente a otros checkpoints intermedios de la misma familia.
- Estudio de la desactivación del modo de razonamiento: el sufijo `thinkFalse` permite investigar cómo afecta el entrenamiento sin modo de pensamiento a la calidad de las respuestas en tareas de conversación.
- Base para ajuste fino posterior: al ser un checkpoint de 4,54 B en safetensors, puede servir como inicialización para experimentos propios de ajuste supervisado o preferencias, siempre que la licencia (no disponible) lo permita.
- Despliegue en entornos de prueba con transformers: su compatibilidad declarada con endpoints y con la librería transformers facilita montar demos internas de inferencia multimodal sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la subida no implica ninguna evaluación de calidad ni de seguridad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 9 GB solo para los pesos (4,54 B × 2 bytes), más memoria para activaciones, caché KV y el codificador visual; en la práctica se recomienda al menos 16-24 GB de VRAM.
- VRAM estimada con cuantización de 8 bits: en torno a 5-6 GB para los pesos, más overhead; no se dispone de cifras oficiales del autor.
- VRAM estimada con cuantización de 4 bits: en torno a 3 GB para los pesos, más overhead; no se dispone de cifras oficiales del autor.
- GPU recomendadas: no disponibles de forma oficial; por tamaño, tarjetas con 24 GB o más (RTX 3090, RTX 4090, A100, H100) permiten inferencia en fp16 con margen.
- ¿Cabe en GPU de consumo? Probablemente sí en tarjetas de 16-24 GB en fp16 y en tarjetas de 8-12 GB con cuantización, aunque no hay confirmación oficial.
- Opciones de despliegue: transformers (librería declarada); compatibilidad con endpoints de Hugging Face según la etiqueta `endpoints_compatible`. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones completas (contexto, licencia, idiomas) que permitan una comparativa rigurosa. Como referencia de categoría, se incluyen modelos multimodales de escala similar, aunque las cifras de este checkpoint no están publicadas:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| OALC local159 step 250 | ~4,54 B | no disponible | no disponible | Checkpoint de investigación, sin benchmarks |
| Qwen2.5-VL-3B (referencia de familia) | ~3 B | no disponible en esta ficha | no disponible en esta ficha | Modelo multimodal de la familia Qwen; cifras no verificadas aquí |
| Qwen3.5 base (referencia) | no disponible | no disponible | no disponible | Modelo del que deriva el checkpoint; datos no confirmados |

La comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Es un checkpoint intermedio de investigación (paso 250), no un modelo final; su calidad no ha sido evaluada por el autor.
- El autor declara explícitamente que la subida no implica ninguna evaluación de calidad ni de seguridad.
- No contiene estado del optimizador y no permite reanudar el entrenamiento de forma exacta.
- Licencia no disponible: no puede asumirse permiso para uso comercial; es necesario contactar con el autor o consultar el repositorio antes de cualquier uso en producción.
- Idiomas soportados no disponibles; no se puede garantizar cobertura multilingüe.
- Longitud de contexto no disponible; el rendimiento en conversaciones largas es incierto.
- Riesgo de alucinación y sesgos: no evaluados ni documentados.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su comportamiento.
- El repositorio ocupa 18,2 GB, lo que puede dificultar su descarga y almacenamiento en entornos limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhangify/oalc-local159-step250-backup-20261113
- Archivo de procedencia citado en la model card: `backup_provenance.json` (dentro del repositorio de Hugging Face)
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
