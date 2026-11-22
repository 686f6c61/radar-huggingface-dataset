# zk0bot/study001-specialist-tool-insert

## Resumen

`zk0bot/study001-specialist-tool-insert` es un checkpoint de investigación publicado en Hugging Face por el usuario zk0bot. No se trata de un modelo de lenguaje, sino de una política de robótica (vision-language-action, VLA) derivada de `lerobot/smolvla_base`, afinada específicamente para la tarea `tool_insert` del benchmark ArmnetBench. El autor lo etiqueta explícitamente como artefacto de estudio y copia de seguridad de un checkpoint, no como el modelo final del proyecto zk0.

El modelo es un ajuste fino completo de una sola tarea, entrenado durante 3.000 pasos sobre 50 demostraciones. Su propósito dentro del proyecto original es servir de "techo de referencia" (reference ceiling): un especialista de tarea única contra el que comparar el modelo generalista que sí se distribuye (`ivelin/zk0-smolvla-fl`). Por tanto, su interés es acotado: documentar y reproducir resultados de un estudio de investigación en manipulación robótica.

Con 450 millones de parámetros y un archivo `model.safetensors` de unos 906 MB, encaja en la familia SmolVLA de LeRobot, pensada para ejecutar políticas VLA en hardware modesto. La relevancia práctica fuera del estudio es limitada, pero resulta útil para quien quiera inspeccionar un fine-tune de SmolVLA, reproducir el experimento o reutilizar el checkpoint como punto de partida para tareas de inserción de herramientas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (política vision-language-action, base `lerobot/smolvla_base`); detalles internos no disponibles |
| Parámetros totales | 450.046.176 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |
| Librería | lerobot |
| Tamaño del repositorio | 0,9 GB |
| Tarea de entrenamiento | ArmnetBench `tool_insert`, 50 demostraciones, 3.000 pasos |
| Checksum SHA-256 (pre-subida) | `3a148d80f488a31701e632b4abf88e1d739564f198eeaa89d02b0d727a171cb0` |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, una política de la familia SmolVLA integrada en la librería LeRobot. SmolVLA combina un codificador visual, un modelo de lenguaje compacto y un decodificador de acciones para producir comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. La model card no detalla la composición interna de capas, el tokenizador ni la dimensionalidad de las acciones, por lo que esos datos quedan como no disponibles.

El entrenamiento consistió en un ajuste fino completo (full fine-tune) de una sola tarea durante 3.000 pasos sobre 50 demostraciones de la tarea `tool_insert` del benchmark ArmnetBench. No se documentan en la información disponible el número de tokens, la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO u otras optimizaciones posteriores. El checkpoint se generó en un DGX Spark y se respaldó en Hugging Face el 22 de noviembre de 2026 bajo una política de redundancia de checkpoints significativos.

## Capacidades

- Control robótico de manipulación: genera acciones motoras para la tarea concreta de inserción de herramientas (`tool_insert`).
- Procesamiento visuomotor: consume observaciones visuales y produce comandos de actuación, según el paradigma VLA de SmolVLA.
- Ejecución de tarea única: especializado exclusivamente en `tool_insert`; no se documenta generalización a otras tareas.
- Integración con LeRobot: cargable mediante la librería `lerobot`, lo que facilita su uso en pipelines de entrenamiento y evaluación del ecosistema.
- Soporte de tool calling / function calling: no disponible (no aplica; es una política robótica, no un LLM conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, visión, audio): visión como entrada para control motor; no se documentan otras.

## Casos de uso

- Reproducción de experimentos de investigación: cargar el checkpoint con LeRobot y evaluar el rendimiento en `tool_insert` para replicar el "techo de referencia" del estudio 001 y compararlo con el modelo generalista.
- Línea base para comparativas de especialización: usar este especialista de tarea única como referencia frente a políticas multitarea o generalistas, midiendo la brecha de rendimiento en inserción de herramientas.
- Punto de partida para nuevos fine-tunes: reutilizar los pesos como inicialización para tareas de ensamblaje o inserción relacionadas, aprovechando que ya están adaptados a manipulación fina.
- Docencia y formación en VLA: servir como ejemplo tangible de ajuste fino de SmolVLA sobre un dataset pequeño (50 demos) para cursos de robótica o aprendizaje por imitación.
- Auditoría de checkpoints: verificar la integridad del archivo mediante el SHA-256 publicado, útil en flujos de respaldo y control de versiones de modelos.
- Pruebas de despliegue en hardware modesto: al tener 450 M de parámetros y un peso de 906 MB, permite validar pipelines de inferencia de LeRobot en estaciones de trabajo sin GPUs de gran formato.
- Investigación en inserción precisa: estudiar el comportamiento de una política entrenada específicamente en `tool_insert` para analizar modos de fallo y tolerancias en tareas de precisión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que el checkpoint se entrenó sobre la tarea `tool_insert` de ArmnetBench, pero no incluye métricas de éxito, tasas de error ni comparaciones numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: el peso en precisión original ocupa unos 906 MB; en FP32 serían aproximadamente 1,8 GB y en FP16 unos 0,9 GB. No se dispone de cifras oficiales de memoria pico durante la inferencia.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería poder alojar los pesos, aunque el consumo real depende del codificador visual y del batching.
- GPU de consumo: con 450 M de parámetros, es plausible que quepa en GPUs de consumo como RTX 3060, RTX 4060 o superiores; no confirmado por el autor.
- Opciones de despliegue: librería `lerobot` (formato nativo). No se documentan exportaciones a vLLM, llama.cpp, Ollama ni TGI, que además no son el cauce habitual para políticas VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `zk0bot/study001-specialist-tool-insert` | 450 M | no disponible | `tool_insert` (especialista) | Apache 2.0 | Hugging Face |
| `lerobot/smolvla_base` | no disponible | no disponible | Política VLA base, multitarea | no disponible en la información | Hugging Face |
| `ivelin/zk0-smolvla-fl` | no disponible | no disponible | Modelo zk0 distribuido (generalista) | no disponible en la información | Hugging Face |

La comparación se limita a los modelos mencionados en la model card. No se dispone de datos de rendimiento que permitan contrastar métricas entre ellos.

## Limitaciones y advertencias

- Artefacto de estudio: el autor advierte explícitamente de que no es el modelo distribuido de zk0; no debe presentarse como producto final.
- Especialización extrema: entrenado solo para `tool_insert` con 50 demostraciones; es esperable un rendimiento pobre fuera de esa tarea y de esa distribución de entorno.
- Sesgos: no documentados. Al entrenarse con un dataset pequeño y específico, puede heredar sesgos de las demostraciones (posiciones, objetos, condiciones de iluminación).
- Alucinación: no aplica en el sentido de texto generado, pero sí existe riesgo de acciones erróneas o inseguras en entornos reales; requiere supervisión y límites de seguridad en el robot.
- Contexto e idioma: no se documentan límites de contexto ni cobertura de idiomas; la instrucción en lenguaje natural puede no generalizar más allá de lo visto en entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero la ausencia de garantías y la naturaleza experimental del checkpoint desaconsejan su uso en producción sin validación adicional.
- Caveat de producción: sin métricas publicadas de éxito ni validación externa, no hay evidencia de robustez; el checksum permite verificar integridad, no calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zk0bot/study001-specialist-tool-insert
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Modelo distribuido del proyecto zk0: https://huggingface.co/ivelin/zk0-smolvla-fl
- Librería LeRobot: https://github.com/huggingface/lerobot
