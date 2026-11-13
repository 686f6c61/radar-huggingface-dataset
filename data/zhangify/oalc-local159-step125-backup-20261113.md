# zhangify/oalc-local159-step125-backup-20261113

## Resumen

OALC local159 step 125 es un checkpoint de investigación publicado por el usuario zhangify en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text construido sobre la arquitectura Qwen3.5 (etiqueta `qwen3_5`), con 4.539.265.536 parámetros totales según los pesos en safetensors. El identificador interno `qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032` sugiere un ajuste fino supervisado o por destilación (posible KL divergence sampling) sobre un modelo base Qwen3.5, con 250 pasos planificados y un learning rate de 1e-06.

El repositorio conserva únicamente los pesos originales, el tokenizer y la configuración del modelo; no incluye estado del optimizador ni permite reanudar el entrenamiento de forma exacta. El autor indica explícitamente que esta subida no implica ninguna evaluación adicional de calidad o seguridad del modelo. Es, por tanto, un artefacto de investigación de interés limitado para producción, pero potencialmente útil para reproducibilidad y estudio de dinámicas de ajuste fino sobre Qwen3.5.

La relevancia actual es acotada: se publica como respaldo (backup) de un checkpoint intermedio (step 125 de 250), sin model card sustantiva, sin licencia declarada y sin datos de benchmarks. Su interés principal radica en ser un ejemplo de checkpoint multimodal de ~4,5B parámetros sobre una base Qwen3.5, una familia que no está ampliamente documentada en el ecosistema abierto en el momento de la ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer multimodal image-text-to-text, segun tag `qwen3_5`) |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posible via herramientas externas, no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo se etiqueta como `qwen3_5` y `image-text-to-text`, lo que indica una arquitectura transformer multimodal capaz de procesar imágenes y texto de entrada. El nombre del checkpoint (`qwen35_local_sampled_kl159_thinkFalse_250step_lr1e-06_20261020_235032`) apunta a un ajuste fino sobre una base Qwen3.5 con muestreo local y posible regularización por divergencia KL, con `thinkFalse` indicando que el modo de razonamiento extendido (thinking) está desactivado, 250 pasos de entrenamiento y un learning rate de 1e-06. La fecha codificada (2026-10-20) corresponde al inicio del run.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas específicas. El autor indica que el repositorio solo contiene pesos, tokenizer y configuración, sin estado del optimizador, y que `backup_provenance.json` recoge las generaciones de origen y checksums. No se ha publicado ninguna evaluación de calidad o seguridad asociada a esta subida.

## Capacidades

- Generación de texto conversacional (tag `conversational`).
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`), lo que implica capacidad de describir imágenes, responder preguntas visuales y tareas de razonamiento sobre imágenes, siempre que la base Qwen3.5 lo soporte.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere despliegue mediante la infraestructura de inferencia de Hugging Face.
- Modo de razonamiento extendido desactivado (`thinkFalse` en el identificador del run de entrenamiento).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, thinking mode): visión confirmada por el pipeline; audio y thinking mode no disponibles.

## Casos de uso

- Reproducibilidad de investigación: el repositorio conserva pesos, tokenizer y configuración de un checkpoint intermedio, lo que permite a investigadores replicar el estado exacto del modelo en el paso 125 y comparar con checkpoints posteriores o con la base Qwen3.5.
- Estudio de dinámicas de ajuste fino: al conocer el learning rate (1e-06), el número de pasos (250) y el esquema de muestreo KL, se puede analizar cómo evoluciona el modelo a lo largo del entrenamiento comparando este checkpoint con otros del mismo run.
- Evaluación de la familia Qwen3.5 multimodal: sirve como punto de partida para medir capacidades image-text-to-text de una base Qwen3.5 de ~4,5B parámetros en tareas controladas de laboratorio.
- Pruebas de pipelines de inferencia multimodales: útil para validar integraciones con transformers y con endpoints compatibles antes de desplegar checkpoints finales o modelos más grandes.
- Análisis de seguridad y sesgos en checkpoints intermedios: permite estudiar si las propiedades de seguridad del modelo base se preservan o degradan durante el ajuste fino, aunque el autor advierte que no se ha realizado ninguna evaluación de seguridad.
- Docencia y experimentación con modelos multimodales de tamaño medio: al ser un modelo de ~4,5B parámetros, puede ejecutarse en hardware de gama alta de consumo con cuantización, facilitando prácticas de laboratorio sobre arquitecturas Qwen3.5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 9 GB solo para pesos (4,54B × 2 bytes), más overhead de activaciones y del codificador visual; se estiman 12-16 GB en BF16 para inferencia multimodal. En cuantización de 8 bits, ~5-6 GB; en 4 bits, ~3-4 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para despliegue en BF16 sin cuantizar. Una RTX 4090 (24 GB) debería poder alojar el modelo en BF16, con margen limitado para contexto largo.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en BF16 (RTX 4080/4090, RTX 5080/5090) y en tarjetas de 8-12 GB con cuantización de 8 o 4 bits, siempre que la arquitectura multimodal lo permita.
- Opciones de despliegue: transformers (soporte nativo declarado), endpoints compatibles de Hugging Face. vLLM, llama.cpp, Ollama y TGI no están confirmados en la información disponible; la compatibilidad con GGUF no está documentada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| OALC local159 step 125 | ~4,54B | no disponible | no disponible | Sí (image-text-to-text) | Hugging Face (checkpoint de investigación) |
| Qwen2.5-VL-3B | ~3,75B | 32k (ampliable) | Apache 2.0 | Sí | Hugging Face, ampliamente documentado |
| Qwen2.5-VL-7B | ~8,3B | 32k (ampliable) | Apache 2.0 | Sí | Hugging Face, ampliamente documentado |
| InternVL2.5-4B | ~4,2B | 32k (aprox.) | MIT (variantes) | Sí | Hugging Face |

La comparativa con Qwen2.5-VL e InternVL2.5 es orientativa por tamaño y modalidad; no se dispone de datos de benchmarks de OALC local159 que permitan una comparación de rendimiento. La licencia del modelo no está declarada, lo que impide confirmar su aptitud para uso comercial.

## Limitaciones y advertencias

- Checkpoint de investigación intermedio (paso 125 de 250): no es un modelo final y puede presentar calidad inferior a la de un modelo completamente entrenado.
- Sin evaluación de calidad ni de seguridad: el autor declara explícitamente que la subida no implica ninguna evaluación adicional.
- Sin licencia declarada: no se puede asumir uso comercial permitido; es necesario contactar con el autor o consultar el repositorio de origen.
- Sin información sobre sesgos, alucinación o idiomas soportados: no hay datos para evaluar riesgos de sesgo ni cobertura lingüística.
- No soporta reanudación exacta del entrenamiento: no incluye estado del optimizador.
- Contexto y ventana multimodal no documentados: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Cero descargas y cero likes en el momento de la ficha: sin validación por parte de la comunidad.
- Nombre del repositorio con fecha futura (2026-11-13) y run de entrenamiento fechado en 2026-10-20: metadatos que conviene verificar antes de confiar en la procedencia.
- Uso en producción desaconsejado sin una evaluación propia exhaustiva de calidad, seguridad y licencia.

## Enlaces

- Hugging Face: https://huggingface.co/zhangify/oalc-local159-step125-backup-20261113
- Archivo de procedencia citado en la model card: `backup_provenance.json` (incluido en el repositorio)
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
