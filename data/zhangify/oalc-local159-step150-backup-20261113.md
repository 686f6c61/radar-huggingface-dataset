# zhangify/oalc-local159-step150-backup-20261113

## Resumen

OALC local159 step 150 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5 (según el tag `qwen3_5`), con un total de 4.539.265.536 parámetros reales verificados en los pesos safetensors. El nombre interno del checkpoint (`qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`) indica que proviene de un entrenamiento de ajuste fino de 250 pasos con una tasa de aprendizaje de 1e-06, probablemente mediante destilación por divergencia KL sobre muestras locales, y con el modo "thinking" desactivado.

El modelo se distribuye como una copia de seguridad ("backup") de los pesos originales, el tokenizer y la configuración, sin estado del optimizador, por lo que no permite reanudar el entrenamiento de forma exacta. El autor declara explícitamente que esta subida no implica ninguna evaluación adicional de calidad o seguridad del modelo. Se trata, por tanto, de un artefacto de investigación más que de un modelo listo para producción.

Por su naturaleza de checkpoint intermedio de investigación, la información pública es mínima: no se especifican licencia, idiomas soportados ni resultados de benchmarks. Cualquier uso en producción debería ir precedido de una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5, tag `qwen3_5`); pipeline image-text-to-text |
| Parametros totales | 4.539.265.536 (dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la familia Qwen3.5, según el tag `qwen3_5` de la model card, y se distribuye con el pipeline `image-text-to-text`, lo que confirma capacidades multimodales de entrada imagen + texto. El identificador de entrenamiento (`qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`) sugiere un ajuste fino de 250 pasos con learning rate 1e-06 sobre muestras locales, empleando una pérdida de divergencia KL (posiblemente destilación desde un modelo profesor), con el modo de razonamiento "thinking" desactivado (`thinkFalse`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. El repositorio contiene únicamente pesos, tokenizer y configuración; no incluye estado del optimizador y, según el autor, no soporta reanudación exacta del entrenamiento. El archivo `backup_provenance.json` documenta las generaciones de origen y las sumas de verificación, pero no se ha publicado su contenido en la información disponible.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto como entrada.
- Modo "thinking" desactivado en este checkpoint (`thinkFalse`), orientado a respuestas directas sin cadena de razonamiento explícita.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue mediante la infraestructura de inferencia de Hugging Face.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades de audio: no disponible.

## Casos de uso

- Investigación en destilación y ajuste fino: el checkpoint sirve como referencia para estudiar el efecto de 250 pasos de ajuste con pérdida KL y lr 1e-06 sobre un modelo base Qwen3.5, comparando con el modelo original.
- Reproducción de experimentos académicos: al conservar pesos, tokenizer y configuración originales, permite replicar inferencias del checkpoint `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032` con fines de validación.
- Evaluación comparativa de checkpoints intermedios: útil para medir cómo evoluciona la calidad de un modelo multimodal a lo largo del entrenamiento (step 150 frente a otros pasos).
- Análisis de comportamiento multimodal en investigación: permite estudiar respuestas image-text-to-text de un modelo de ~4,5B parámetros sin modo thinking, en entornos controlados de laboratorio.
- Pruebas de infraestructura de despliegue: su compatibilidad con endpoints y formato safetensors lo hace apto para validar pipelines de serving (transformers, TGI) antes de pasar a modelos finales.
- Base para experimentos de cuantización: al ser un modelo de ~4,5B parámetros, es un candidato razonable para estudiar el impacto de cuantizaciones (GPTQ, AWQ, GGUF) en modelos multimodales de tamaño medio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (FP16/BF16): aproximadamente 9-10 GB solo para pesos (4,54B parámetros × 2 bytes), más overhead de activaciones y del codificador visual; en la práctica, se recomienda al menos 16-24 GB.
- Cuantización a 8 bits: ~5 GB de pesos; a 4 bits: ~2,5-3 GB de pesos, más overhead.
- GPU recomendadas: A100 (40/80 GB), H100, L40S para despliegue en FP16 con margen; RTX 4090 (24 GB) o RTX A6000 (48 GB) para inferencia cómoda.
- ¿Cabe en GPU de consumo? Sí, en tarjetas con 12-24 GB (RTX 3090, 4090, 4080) si se usa cuantización o FP16 con batch pequeño; en 8 GB probablemente solo con cuantización agresiva a 4 bits.
- Opciones de despliegue: transformers (librería declarada), endpoints compatibles de Hugging Face, TGI; vLLM, llama.cpp u Ollama no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OALC local159 step 150 | 4,54B | no disponible | image-text-to-text | no disponible | Hugging Face (checkpoint de investigación) |
| Qwen2.5-VL-3B / 7B | 3B / 7B | 32k+ (según variante) | image-text-to-text | Apache 2.0 (variantes publicadas) | Hugging Face |
| Qwen3.5 (base) | no disponible | no disponible | multimodal | no disponible | no disponible |
| LLaVA-1.5-7B | 7B | 4k | image-text-to-text | LLaMA 2 (restrictiva) | Hugging Face |

Nota: los datos de los modelos comparables corresponden a conocimientos generales de la familia; no se dispone de una comparación de rendimiento verificada frente a este checkpoint concreto.

## Limitaciones y advertencias

- Checkpoint de investigación: el autor declara explícitamente que no se ha realizado ninguna evaluación adicional de calidad o seguridad.
- No soporta reanudación exacta del entrenamiento: no incluye estado del optimizador.
- Licencia no especificada: no se puede garantizar el uso comercial; es imprescindible contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de cualquier despliegue productivo.
- Idiomas soportados no documentados: el rendimiento multilingüe es desconocido.
- Longitud de contexto no documentada: no se puede planificar el uso con documentos largos sin validación empírica.
- Riesgo de alucinación y sesgos: inherente a cualquier modelo de lenguaje; al no haber evaluación publicada, el riesgo es desconocido y debe medirse.
- Estado intermedio (step 150 de 250): la calidad puede ser inferior a la del checkpoint final del mismo entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.
- Fecha de creación futura (2026-11-13) en los metadatos: conviene verificar la autenticidad y procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zhangify/oalc-local159-step150-backup-20261113
- Archivo de procedencia citado en la model card: `backup_provenance.json` (incluido en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponible
