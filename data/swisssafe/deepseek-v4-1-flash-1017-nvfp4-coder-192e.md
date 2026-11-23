# swisssafe/DeepSeek-V4.1-Flash-1017-NVFP4-Coder-192E

## Resumen

DeepSeek-V4.1-Flash-1017-NVFP4-Coder-192E es una compilación cuantizada y podada del modelo DeepSeek V4.1 Flash 1017, publicada por el usuario swisssafe. Parte del checkpoint NVFP4 de NVIDIA y aplica una selección de expertos del conjunto GSQ-RCO Coder de ISTA-DASLab para retener 192 de los 384 expertos enrutados en cada una de las 40 capas objetivo, preservando el enrutamiento top-6. El resultado es un modelo de 393.068 millones de parámetros totales, con soporte nativo de texto e imagen (pipeline image-text-to-text), empaquetado en 276 GB de safetensors repartidos en 48 shards.

La propuesta del autor es un despliegue privado de codificación asistida sobre dos GPUs NVIDIA RTX PRO 6000 Blackwell Workstation Edition (96 GB de VRAM cada una), con una ventana de contexto de 1.048.576 tokens por petición y un pool de caché KV en GPU de 3,78 millones de tokens respaldado por SSD. El modelo está pensado para equipos que quieren mantener prompts, código fuente e inferencia dentro de su propia infraestructura, con licencia MIT.

La relevancia de esta ficha es doble: por un lado documenta una técnica de poda de expertos aplicada a un modelo MoE de gran tamaño; por otro, ofrece cifras de rendimiento en tareas de codificación agéntica (DeepSWE v1.1 y Terminal-Bench 2.1) medidas por el propio autor con un harness propio, lo que exige leer los resultados con cautela. No hay métricas de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con enrutamiento top-6, poda de expertos (192 de 384 por capa en 40 capas), vision encoder y projector, pesos DSpark/MTP embebidos; runtime vLLM con pipeline parallelism de dos etapas |
| Parametros totales | 393.068.154.834 |
| Parametros activos | no disponible (top-6 routing preservado; no se publica el recuento de activos) |
| Longitud de contexto | 1.048.576 tokens por petición |
| Tipos de cuantizacion | NVFP4 (checkpoint base), FP8 (KV cache), 8-bit; pesos y escalas NVFP4 retenidos |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards, 276,0 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer de mezcla de expertos (MoE) derivado de DeepSeek V4.1 Flash 1017, que incorpora soporte nativo de texto e imagen. La modificación principal respecto al checkpoint de NVIDIA es la poda de expertos: se aplican los identificadores de selección del conjunto GSQ-RCO Coder de ISTA-DASLab sobre los pesos NVFP4 de NVIDIA, conservando 192 de los 384 expertos enrutados en cada una de las 40 capas objetivo y remapeando los pesos y sesgos del router. Se mantiene el enrutamiento top-6. Los tensores de pesos y escalas retenidos se preservan en formato NVFP4, mientras que la atención, los expertos compartidos, las tablas Engram, los pesos de visión y los pesos del borrador especulativo quedan en sus formatos de origen.

El checkpoint incluye el encoder de visión y el projector, así como los pesos DSpark/MTP embebidos. De los 276 GB totales, 104,5 GB (97,3 GiB) corresponden a las tablas de búsqueda Engram y sus escalas, que pueden residir en SSD con caché parcial opcional en RAM del sistema o cargarse íntegramente en RAM. El autor no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; tampoco se documenta un proceso de entrenamiento posterior a la poda, por lo que cabe asumir que se trata de una transformación de pesos sobre el modelo base. La innovación técnica destacable es la combinación de poda de expertos con NVFP4, decodificación especulativa DSpark y un esquema de memoria jerárquico (VRAM, RAM, SSD) para las tablas Engram.

## Capacidades

- Generación de texto y razonamiento general, heredados del modelo base DeepSeek V4.1 Flash 1017.
- Codificación y codificación agéntica: el modelo está optimizado y evaluado para tareas de modificación multiarchivo, depuración y sesiones largas de programación.
- Comprensión de imagen y texto (pipeline image-text-to-text), con encoder de visión y projector incluidos en el checkpoint.
- Ventana de contexto de 1.048.576 tokens por petición, adecuada para repositorios completos o trazas largas.
- Decodificación especulativa DSpark y pesos MTP embebidos para acelerar la generación.
- Soporte de tool calling y function calling: no confirmado explícitamente en la información disponible, aunque el modelo base y el enfoque agéntico lo hacen plausible; debe verificarse en despliegue.
- Razonamiento multi-paso y uso en agentes: evaluado en Terminal-Bench 2.1, un benchmark de tareas agénticas en terminal.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Codificación asistida en equipo sobre infraestructura propia: dos RTX PRO 6000 Blackwell (96 GB cada una) sirven hasta 20 clientes activos con 214 tokens/s agregados en generación según el autor, manteniendo código y prompts dentro de la organización.
- Refactorización multiarchivo: la ventana de 1M tokens permite cargar varios ficheros y el historial de cambios en una sola petición, lo que facilita cambios coherentes entre módulos.
- Depuración de sesiones largas: el pool de caché KV de 3,78M tokens admite hasta tres contextos completos simultáneos, útil para mantener el estado de varias conversaciones de depuración abiertas.
- Agentes de terminal y automatización de tareas de desarrollo: los resultados en Terminal-Bench 2.1 (86,5%) lo sitúan como candidato para pipelines que ejecutan comandos, interpretan salidas y corrigen errores de forma iterativa.
- Revisión de código con capturas de pantalla: al aceptar entrada image-text-to-text, puede analizar diagramas de arquitectura, capturas de errores o interfaces junto con el código asociado.
- Evaluación de costes frente a inferencia alojada: el autor plantea comparar el coste de un despliegue compartido en dos GPUs de estación de trabajo con APIs externas para cargas de codificación sostenidas.
- Despliegue en entornos regulados: la licencia MIT y la ejecución on-premises permiten integrar el modelo en flujos con requisitos de confidencialidad, sin depender de terceros.

## Benchmarks y rendimiento

Resultados publicados por el autor (harness propio optimizado; no son cifras de terceros independientes):

| Referencia | DeepSWE v1.1 | Terminal-Bench 2.1 |
|---|---:|---:|
| Swiss Safe 192-expert NVFP4 | 79,6% (90/113) | 86,5% (77/89) |
| DeepSeek V4.1 Flash 1017 | 77,0% | no disponible |
| DeepSeek V4.1 Flash (release anterior) | 74,2% | 90,6% |
| OpenAI GPT-5.6 Sol (según DeepSeek) | 73,0% | 88,8% |
| Anthropic Claude Opus 5 (según DeepSeek) | 74,0% | 89,1% |
| NVIDIA 1017 NVFP4 con MXFP4 Engram | no disponible | 81,11% |
| Unsloth 8-bit reference | 71,4% | 72,6% |
| Mejor variante low-bit de Unsloth por suite | 68,1% | 74,4% |
| Mejor variante GSQ-RCO por suite (tests de Unsloth) | 61,9% | 69,1% |

Throughput medido en dos RTX PRO 6000 Blackwell:

| Perfil y carga | Prefill activo | Generación activa |
|---|---:|---:|
| Engram en RAM, un cliente | 12.501 tok/s | 112 tok/s |
| Engram en RAM, hasta 20 clientes | 11.100 tok/s compartidos | 214 tok/s combinados |
| Engram en SSD, un cliente | 8.868 tok/s | 95 tok/s |
| Engram en SSD, hasta 4 clientes | 7.000 tok/s compartidos | 95 tok/s combinados |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM medida por el autor: aproximadamente 188 GiB combinados con Engram en SSD y 190 GiB combinados con Engram en RAM, incluyendo modelo y caché KV en GPU.
- Configuración de referencia: dos NVIDIA RTX PRO 6000 Blackwell Workstation Edition de 96 GB cada una (192 GB totales).
- No cabe en GPUs de consumo convencionales (RTX 4090 de 24 GB, RTX 5090 de 32 GB) por el tamaño del checkpoint (276 GB) y la VRAM medida.
- Almacenamiento: las tablas Engram ocupan 104,5 GB (97,3 GiB) y pueden residir en SSD; se recomienda SSD de alta velocidad si no se cargan en RAM.
- RAM del sistema: necesaria para el perfil con Engram en RAM y para el offload parcial de la caché KV; el autor no especifica el mínimo exacto.
- Despliegue: runtime compatible con DeepSeek V4.1 basado en vLLM, con pipeline parallelism de dos etapas, caché KV en FP8 y decodificación especulativa DSpark.
- Throughput: 95-112 tok/s por cliente en generación y hasta 214 tok/s agregados con 20 clientes; prefill de 7.000-12.501 tok/s según perfil.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DeepSWE v1.1 | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| Swiss Safe 192-expert NVFP4 | 393,1B totales | 1.048.576 | 79,6% | 86,5% | MIT | Hugging Face (swisssafe) |
| DeepSeek V4.1 Flash 1017 | no disponible | no disponible | 77,0% | no disponible | no disponible | Hugging Face (deepseek-ai) |
| NVIDIA DeepSeek-V4.1-Flash-1017-NVFP4 | no disponible | no disponible | no disponible | 81,11% | no disponible | Hugging Face (nvidia) |
| Unsloth 8-bit reference | no disponible | no disponible | 71,4% | 72,6% | no disponible | Documentación de Unsloth |
| ISTA-DASLab GSQ-RCO Coder (GGUF) | no disponible | no disponible | 61,9% (mejor variante) | 69,1% (mejor variante) | no disponible | Hugging Face (ISTA-DASLab) |

Las cifras de DeepSWE y Terminal-Bench del modelo Swiss Safe proceden de un harness propio del autor, por lo que la comparación directa con las referencias publicadas no es estrictamente equivalente.

## Limitaciones y advertencias

- Los benchmarks los publica el propio autor con un harness optimizado; no hay validación independiente y el propio autor reconoce que su configuración de harness influyó en superar la referencia de NVIDIA.
- El modelo es una poda de expertos sobre un checkpoint cuantizado: la retención de 192 de 384 expertos puede degradar capacidades fuera del dominio de codificación, aunque no se aportan evaluaciones generales que lo confirmen o descarten.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni idiomas soportados, lo que dificulta evaluar riesgos de sesgo lingüístico o cultural.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado tasas de alucinación ni evaluaciones de fidelidad.
- El despliegue exige hardware específico (dos RTX PRO 6000 Blackwell o equivalente, ~190 GiB de VRAM combinados) y un runtime compatible con DeepSeek V4.1; no es portable a configuraciones de consumo.
- El rendimiento depende del perfil de memoria elegido: con Engram en SSD el throughput cae a 95 tok/s y el número de clientes activos se reduce a cuatro.
- La licencia MIT permite uso comercial, pero el modelo base y el checkpoint de NVIDIA pueden tener condiciones propias que conviene revisar antes de producción.
- No hay información sobre tool calling, function calling ni modo de razonamiento explícito; deben validarse empíricamente antes de integrarlos en agentes.
- El repositorio tiene cero descargas y cero likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/swisssafe/DeepSeek-V4.1-Flash-1017-NVFP4-Coder-192E
- Modelo base en Hugging Face (NVIDIA): https://huggingface.co/nvidia/DeepSeek-V4.1-Flash-1017-NVFP4
- Modelo original DeepSeek V4.1 Flash 1017: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- DeepSeek V4.1 Flash (release anterior): https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- ISTA-DASLab DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-Coder-GGUF
- Documentación de Unsloth sobre DeepSeek V4.1 Flash: https://unsloth.ai/docs/models/deepseek-v4.1-flash#dynamic-v3.1-update-november-2nd-2026
