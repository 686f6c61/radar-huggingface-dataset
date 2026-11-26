# TheDrummer/GLM-Steam-320B-A18B-v2-FP8

## Resumen

GLM-Steam-320B-A18B-v2-FP8 es un ajuste fino (fine-tune) del modelo zai-org/GLM-5.3-Flash, publicado por TheDrummer bajo la etiqueta `glm5_next` y distribuido en formato FP8. Con 321.323.031.390 parámetros totales y un repositorio de 328,4 GB, se trata de un modelo de gran escala orientado a generación de texto y ficción, con un enfoque declarado en la model card hacia la escritura creativa sin rechazos ni atenuaciones en contenido maduro. La nomenclatura "A18B" sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 18 mil millones de parámetros activos, aunque este dato no se confirma de forma explícita en la información disponible.

El modelo se presenta como una alternativa con "estilo de escritura diferente" e inteligencia "en su mayoría intacta (y algo mejorada)" respecto al modelo base, según las pruebas internas del autor. Su relevancia actual radica en que demuestra la viabilidad de especializar modelos masivos mediante fine-tuning para dominios concretos (ficción madura, escritura creativa) manteniendo capacidades generales de razonamiento, matemáticas y código en ocho idiomas. La versión v2 corrige comportamientos de la v1 y se distribuye cuantizada en FP8 para reducir los requisitos de hardware.

La información pública es limitada: no se especifican licencia, idiomas soportados ni pipeline, y las descargas son muy reducidas (7) pese a los 10 likes, lo que sugiere un modelo de nicho reciente con escasa validación comunitaria independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), derivada de GLM-5.3-Flash; tag `glm5_next` |
| Parametros totales | 321.323.031.390 (321,3 B) |
| Parametros activos | ~18 B (inferido de la nomenclatura "A18B"; no confirmado explicitamente) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (formato de distribucion del repo) |
| Idiomas soportados | no disponible (la model card menciona pruebas en ocho idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (FP8) |

## Arquitectura y entrenamiento

El modelo se basa en zai-org/GLM-5.3-Flash, un transformer con arquitectura de mezcla de expertos según la convención de nombres "320B-A18B" (320 mil millones totales, 18 mil millones activos). El tag `glm5_next` indica la familia generacional GLM5. La distribución se realiza directamente en FP8, lo que reduce el peso del repositorio a 328,4 GB frente a los aproximadamente 640 GB que ocuparían los pesos en BF16.

El entrenamiento consistió en un fine-tuning sobre el modelo base con el objetivo declarado de modificar el estilo de escritura y reducir los rechazos en ficción madura y oscura. Según la model card, en 16 prompts de ficción madura el modelo base dudó en 17 de 32 respuestas (4 rechazos directos, 3 parciales, 2 fundidos a negro y 8 respuestas suavizadas), mientras que GLM-Steam dudó en 3 (todas suavizadas) y nunca rechazó, obteniendo una puntuación de 7,66 frente a 6,06 del base. No se especifican el volumen de datos de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card recomienda usar el modo de razonamiento alto (`high reasoning`), ya configurado por defecto en la plantilla de chat, y advierte que los modos Max y Low podrían no funcionar bien.

## Capacidades

- Generación de texto y escritura creativa, con especial énfasis en ficción madura y oscura sin rechazos ni atenuaciones.
- Razonamiento general: la model card reporta 8,70 frente a 8,46 del base en 47 tareas generales.
- Matemáticas y código: incluidas en las 47 tareas generales evaluadas por el autor.
- Capacidades multilingües: pruebas en ocho idiomas según la model card (sin especificar cuáles).
- Pensamiento crítico: puntuación de 8,65 frente a 8,70 del base (prácticamente equivalente).
- Modos de razonamiento configurables (high, Max, Low, None) mediante plantilla de chat; se recomienda high.
- No se documenta soporte de tool calling, function calling, agentes, visión ni audio.

## Casos de uso

- Escritura de ficción madura y oscura: el modelo está específicamente ajustado para evitar rechazos y suavizados en narrativa adulta, con una puntuación interna de 7,66 frente a 6,06 del base en 16 prompts de prueba.
- Generación de narrativa larga y guiones: su escala de 321 B parámetros totales permite mantener coherencia estilística en textos extensos, aunque la longitud de contexto no está documentada.
- Asistencia creativa para autores: reescritura, continuación y variaciones de escenas con un estilo diferenciado respecto al modelo base.
- Tareas generales de razonamiento y matemáticas: con rendimiento reportado de 8,70 en 47 tareas, adecuado para pipelines que requieran un modelo de gran escala con capacidades generales.
- Generación y revisión de código: incluido en las tareas generales evaluadas, aunque sin benchmarks específicos publicados (HumanEval, MBPP).
- Experimentación e investigación en fine-tuning de modelos masivos: útil para estudiar cómo el ajuste fino altera el comportamiento de rechazo y el estilo sin degradar el razonamiento.
- Despliegue en entornos con infraestructura de GPU de alta gama: el formato FP8 facilita la inferencia en clústeres con memoria suficiente, y el autor sugiere servicios de hosting externos (net.beaverai.org) para quienes no dispongan de hardware.

## Benchmarks y rendimiento

| Benchmark | GLM-Steam 320B A18B v2 | GLM-5.3-Flash (base) |
|---|---|---|
| Ficción madura (16 prompts, 32 respuestas) | 7,66; 3 dudas (todas suavizadas), 0 rechazos | 6,06; 17 dudas (4 rechazos, 3 parciales, 2 fundidos, 8 suavizados) |
| Tareas generales (47 tareas: matemáticas, código, razonamiento, 8 idiomas) | 8,70 (180/188 puntos de respuesta) | 8,46 (176/188 puntos de respuesta) |
| Pensamiento crítico | 8,65 | 8,70 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la información disponible. Las cifras anteriores proceden de evaluaciones internas del autor y no son comparables con benchmarks académicos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 321 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 4 GPU de 80 GB (A100/H100) o 8 GPU para margen operativo.
- GPU recomendadas: H100 80 GB, A100 80 GB, H200; no cabe en GPU de consumo (RTX 4090 con 24 GB, RTX 5090 con 32 GB).
- Opciones de despliegue: vLLM y TGI son las opciones más adecuadas para FP8 en multi-GPU; llama.cpp y Ollama no son viables a esta escala sin cuantización adicional agresiva (no distribuida).
- Latencia y throughput: no disponibles; dependen del número de GPU, del paralelismo tensorial y de la longitud de contexto.
- Alternativa sin hardware propio: el autor sugiere el servicio de hosting net.beaverai.org.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| GLM-Steam-320B-A18B-v2-FP8 | 321,3 B totales / ~18 B activos | no disponible | no disponible | safetensors FP8 | Hugging Face (7 descargas) |
| zai-org/GLM-5.3-Flash (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de ~300 B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con alternativas concretas de la misma categoría (por ejemplo, otros MoE de ~300 B con ~18 B activos). Los datos del modelo base no están detallados en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible verificar la licencia del modelo base zai-org/GLM-5.3-Flash antes de cualquier despliegue productivo.
- El ajuste fino está orientado a reducir rechazos en contenido maduro; esto puede aumentar el riesgo de generar contenido inapropiado o no alineado con políticas de seguridad en entornos comerciales.
- Riesgo de alucinación inherente a los modelos de gran escala; no se han publicado evaluaciones de factualidad.
- Idiomas soportados no documentados formalmente; las pruebas en ocho idiomas no especifican cuáles ni su calidad.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con documentos largos.
- Los modos de razonamiento Max y Low podrían no funcionar correctamente según el autor; solo el modo high está recomendado.
- Validación comunitaria muy limitada (7 descargas, 10 likes) y benchmarks exclusivamente internos del autor, sin verificación independiente.
- El tamaño de 321 B parámetros en FP8 exige infraestructura multi-GPU de gama alta; no es desplegable en hardware de consumo.
- La model card incluye enlaces a Discord y Patreon; no constituyen documentación técnica verificable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TheDrummer/GLM-Steam-320B-A18B-v2-FP8
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Perfil del autor: https://huggingface.co/TheDrummer
- Discord del autor: https://discord.gg/BeaverAI
- Patreon del autor: https://www.patreon.com/TheDrummer
- Hosting alternativo: https://net.beaverai.org/
