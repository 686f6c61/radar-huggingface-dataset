# XiangyunHuang/Route2Step

## Resumen

Route2Step es un repositorio de checkpoints publicado por XiangyunHuang bajo el paraguas de la investigación en navegación guiada por visión e instrucciones (vision-language-navigation). No se trata de un modelo base entrenado desde cero, sino de una colección de pesos ajustados sobre arquitecturas existentes: el checkpoint principal, `MAG-Qwen3-vl-4b`, es un ajuste de Qwen3-VL-4B orientado a la ejecución de acciones locales en tareas de navegación. El autor reporta un SR (success rate) de 62 en su evaluación, aunque no se especifica el conjunto de evaluación ni la métrica exacta.

El repositorio incluye tres checkpoints: `MIA/`, `MAG/` y `MAG-Qwen3-vl-4b/`. El tamaño total del repo es de 23,9 GB, lo que es coherente con varios checkpoints de tamaño medio en precisión completa o bf16. La librería declarada es `transformers` y los pesos están en formato `safetensors`, con soporte para `Qwen3VLForConditionalGeneration` y `AutoProcessor`.

La relevancia del proyecto radica en su enfoque: convertir rutas o trayectorias (route) en pasos de acción ejecutables (step) mediante un modelo vision-language, un problema típico en robótica de navegación, agentes encarnados y asistentes visuales con planificación a corto plazo. No obstante, la documentación publicada es muy escasa y no permite verificar la metodología completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language (base Qwen3-VL en el checkpoint `MAG-Qwen3-vl-4b`); arquitectura de `MIA/` y `MAG/` no disponible |
| Parametros totales | 4B en `MAG-Qwen3-vl-4b` (Qwen3-VL-4B); no disponible para `MIA/` y `MAG/` |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El único checkpoint con arquitectura identificable es `MAG-Qwen3-vl-4b`, construido sobre Qwen3-VL-4B, un modelo vision-language de tipo transformer que procesa imágenes y vídeo junto con texto y genera secuencias de acciones. El autor lo describe como un checkpoint MAG para "local action execution", es decir, la fase de ejecución de acciones locales dentro de un pipeline de navegación. El repositorio incluye shards de inferencia, configuración, tokenizer y ficheros de preprocesamiento de imagen y vídeo, y omite deliberadamente los ficheros de entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO, ni sobre innovaciones técnicas específicas (atención lineal, decodificación especulativa, etc.). Los checkpoints `MIA/` y `MAG/` no tienen arquitectura, tamaño ni procedimiento de carga documentados en la información disponible. Tampoco se detalla la relación entre MIA, MAG y el modelo base Qwen3-VL, más allá de que MAG parece ser la etapa de ejecución de acciones.

## Capacidades

- Generación de acciones locales a partir de observaciones visuales e instrucciones, orientada a navegación (visión-lenguaje-acción).
- Procesamiento de imagen y vídeo mediante el preprocesador de Qwen3-VL (`AutoProcessor`).
- Carga estándar con `transformers` mediante `Qwen3VLForConditionalGeneration` y `device_map="auto"`.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags del repo).
- Capacidades de tool calling, function calling, agentes multi-paso, matemáticas o código: no documentadas para este ajuste.
- Capacidades multilingües: no disponibles.
- Modo thinking, audio u otras modalidades especiales: no documentadas.

## Casos de uso

- Navegación robótica indoor: el checkpoint `MAG-Qwen3-vl-4b` recibe observaciones visuales y una ruta o instrucción y emite la siguiente acción local, lo que encaja en bucles de control de robots móviles con planificación jerárquica (ruta global arriba, pasos locales abajo).
- Agentes encarnados en simulación: integración en entornos tipo Habitat o AI2-THOR para evaluar políticas de navegación que requieren comprensión visual y generación de acciones discretas.
- Asistencia visual a personas con discapacidad: traducción de una ruta descrita o mostrada en pasos concretos ("avanza", "gira a la izquierda") usando la entrada de vídeo del procesador.
- Investigación en vision-language-action: uso como baseline reproducible para comparar estrategias de descomposición ruta-a-paso frente a políticas monolíticas.
- Prototipado de interfaces de instrucción visual: convertir capturas o vídeos de un entorno en secuencias de acciones para validar pipelines antes de desplegar en hardware.
- Evaluación de robustez visual: al estar basado en Qwen3-VL-4B, permite probar cómo afectan cambios de iluminación, oclusión o punto de vista a la tasa de éxito en ejecución de acciones.

## Benchmarks y rendimiento

El autor reporta un SR (success rate) de 62 para `MAG-Qwen3-vl-4b` en su evaluación, sin especificar el benchmark, el conjunto de test ni las condiciones. No hay más resultados publicados.

| Modelo | Benchmark | Metrica | Resultado |
|---|---|---|---|
| MAG-Qwen3-vl-4b | no disponible | SR (success rate) | 62 |
| MIA | no disponible | no disponible | no disponible |
| MAG | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para `MAG-Qwen3-vl-4b` en bf16: en torno a 8-10 GB solo para pesos, más overhead de activaciones y del procesador de visión; presupuesto práctico de 12-16 GB.
- En cuantización de 8 bits: aproximadamente 4-5 GB de pesos; en 4 bits, 2,5-3 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: A100 40/80 GB o H100 para evaluación por lotes y vídeo de alta resolución; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia interactiva en bf16.
- GPU de consumo: cabe en RTX 4090/3090 en bf16; en GPUs de 8-12 GB requeriría cuantización no publicada por el autor.
- Despliegue: `transformers` es la vía documentada; vLLM, TGI, llama.cpp u Ollama no están confirmados para este checkpoint (Qwen3-VL requiere versiones recientes de los motores).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Route2Step (MAG-Qwen3-vl-4b) | 4B | no disponible | Navegación vision-language (ruta a paso) | no disponible | Hugging Face, safetensors |
| Qwen3-VL-4B (base) | 4B | no disponible en esta ficha | Vision-language general | no disponible en esta ficha | Hugging Face |
| Modelos VLA de navegación comparables | no disponible | no disponible | Navegación encarnada | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas concretas; la comparación con Qwen3-VL-4B base es pertinente por arquitectura, pero no se han publicado métricas del base en el mismo protocolo.

## Limitaciones y advertencias

- Documentación mínima: no se especifican licencia, idiomas, contexto, dataset ni metodología de entrenamiento, lo que impide evaluar su idoneidad para producción.
- El SR de 62 se reporta sin benchmark identificado, por lo que no es verificable ni comparable.
- Riesgo de sobreajuste al entorno de entrenamiento: los modelos de navegación suelen degradarse fuera de la distribución visual de entrenamiento.
- Riesgo de alucinación de acciones: al ser un modelo generativo, puede emitir pasos no válidos o inconsistentes con la observación.
- Restricciones de licencia para uso comercial: desconocidas; debe contactarse con el autor antes de cualquier despliegue comercial.
- Los checkpoints `MIA/` y `MAG/` no tienen instrucciones de carga ni arquitectura documentada.
- El repositorio omite ficheros de entrenamiento, lo que dificulta la reproducibilidad.
- Sin garantías de mantenimiento: 0 descargas y 1 like en el momento de la consulta.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/XiangyunHuang/Route2Step
- Perfil del autor: https://huggingface.co/XiangyunHuang
- Documentación de Qwen3-VL en transformers: no disponible en la información proporcionada
- Paper, blog o demo del proyecto: no disponible en la información proporcionada
