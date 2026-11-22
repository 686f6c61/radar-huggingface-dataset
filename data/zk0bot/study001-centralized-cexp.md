# zk0bot/study001-centralized-cexp

## Resumen

`zk0bot/study001-centralized-cexp` es un checkpoint de investigación (artefacto de estudio) publicado en Hugging Face por el usuario `zk0bot`, derivado del modelo base `lerobot/smolvla_base` (familia SmolVLA de LeRobot). No es un modelo de lenguaje: es una política visomotora (vision-language-action) para control robótico, afinada mediante fine-tuning supervisado de un subconjunto del experto de acciones (155 tensores certificados) durante 15.000 pasos sobre la unión de 5 tareas. El propio autor advierte explícitamente en la model card que se trata de una copia de seguridad de checkpoint y que **no** es el modelo final distribuido de zk0, que reside en `ivelin/zk0-smolvla-fl`.

El propósito declarado del artefacto es servir como brazo "centralizado" de control en el estudio BENCH-003 (enmienda D-10), frente al cual se mide el coste de la federación (denominado "federation tax" Phi = C-exp − FL). Es, por tanto, material de reproducibilidad experimental más que un modelo listo para producción.

Con 450.046.176 parámetros (aproximadamente 450 M), pesos en safetensors y un repositorio de 0,9 GB, el modelo se inscribe en la categoría de políticas VLA ligeras orientadas a manipulación robótica, no a generación de texto. Su relevancia actual es acotada: interesa a quienes replican el estudio de zk0 o investigan el equilibrio entre entrenamiento centralizado y federado en robótica con SmolVLA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action) sobre `lerobot/smolvla_base`; detalles internos no disponibles |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de control robótico, no de texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`, 906.712.552 bytes) |

## Arquitectura y entrenamiento

El modelo parte de `lerobot/smolvla_base`, la implementación SmolVLA de la librería LeRobot, que combina un codificador visual, un modelo lingüístico compacto y un experto de acciones para producir comandos motores a partir de observaciones e instrucciones. La model card no detalla la configuración interna (número de capas, dimensión oculta, mecanismo de atención ni resolución de entrada), por lo que esos datos deben consultarse en la ficha del modelo base.

El entrenamiento consistió en un fine-tuning de solo el experto de acciones: se actualizó un subconjunto certificado de 155 tensores (expert-only fine-tune) durante 15.000 pasos sobre la unión agrupada de 5 tareas. No se mencionan fases de RLHF, DPO ni datos adicionales de alineamiento. El checkpoint se respaldó el 22 de noviembre de 2026 desde una máquina DGX Spark, con hash SHA-256 de `model.safetensors` documentado (`8f6807ed...d48379`) para verificación de integridad.

## Capacidades

- Control robótico visomotor: genera acciones a partir de observaciones visuales e instrucciones en lenguaje natural, heredando la interfaz de SmolVLA.
- Ejecución de tareas manipulativas restringidas al dominio de las 5 tareas del estudio (no se especifican cuáles).
- Fine-tuning especializado: el ajuste se limita al experto de acciones, lo que preserva las representaciones visuales y lingüísticas del modelo base.
- No se documentan capacidades de tool calling, razonamiento multi-paso, agentes conversacionales ni procesamiento multilingüe.
- No se documentan modos especiales (thinking, visión general, audio) más allá de la percepción visual inherente a la política VLA.

## Casos de uso

- Reproducción del estudio BENCH-003: el checkpoint permite recalcular el brazo centralizado (C-exp) y contrastarlo con el brazo federado (FL) para medir el federation tax Phi.
- Auditoría de fine-tuning parcial: sirve para analizar el efecto de actualizar únicamente 155 tensores del experto de acciones frente a un ajuste completo.
- Verificación de integridad de checkpoints: el hash SHA-256 publicado permite validar la cadena de custodia del artefacto en pipelines de MLOps.
- Línea base en experimentos de aprendizaje federado en robótica: al ser el referente centralizado, se usa como cota superior de rendimiento al comparar agregaciones federadas.
- Investigación sobre políticas VLA compactas: con ~450 M de parámetros, es adecuado para estudiar el compromiso entre tamaño y capacidad en manipulación con SmolVLA.
- Docencia y replicación metodológica: útil para ilustrar cómo se documenta y respalda un checkpoint de investigación con metadatos de origen y hash.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un checkpoint de ~450 M parámetros en fp32 ocupa aproximadamente 1,8 GB de pesos, y en fp16/bf16 alrededor de 0,9 GB, a lo que habría que sumar el codificador visual y los buffers de inferencia.
- GPU recomendadas: no disponibles; el autor menciona una DGX Spark como máquina de entrenamiento, sin especificar GPU concretas.
- Compatibilidad con GPU de consumo: no confirmada; por tamaño de pesos, es plausible en GPUs con 8 GB o más de VRAM, pero no hay validación publicada.
- Opciones de despliegue: la librería declarada es `lerobot`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `zk0bot/study001-centralized-cexp` | 450.046.176 | no disponible | apache-2.0 | Hugging Face (repo de estudio) | Brazo centralizado de BENCH-003; no es el modelo final |
| `ivelin/zk0-smolvla-fl` | no disponible | no disponible | no disponible | Hugging Face | Modelo final distribuido de zk0 según la model card |
| `lerobot/smolvla_base` | no disponible | no disponible | no disponible | Hugging Face | Modelo base SmolVLA de LeRobot del que deriva este checkpoint |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas entre estas variantes.

## Limitaciones y advertencias

- No es un modelo listo para producción: el autor lo etiqueta como artefacto de estudio y copia de seguridad de checkpoint.
- El fine-tuning se limita al experto de acciones sobre 5 tareas concretas; la generalización fuera de ese dominio no está documentada.
- No se publican métricas de éxito, tasas de error ni evaluaciones de seguridad, por lo que no puede validarse su fiabilidad en entornos reales.
- Sesgos conocidos: no documentados; al ser una política robótica, los sesgos relevantes serían de distribución visual y de instrucciones, no evaluados aquí.
- Riesgo de comportamiento errático fuera de distribución: inherente a políticas VLA entrenadas con datos limitados, aunque no se cuantifica.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero la licencia del modelo base y de los datos de entrenamiento no se detalla en la información disponible y debe verificarse por separado.
- Ausencia de soporte multilingüe declarado y de documentación sobre idiomas de las instrucciones.
- El hash publicado corresponde a la copia local previa a la subida; conviene verificar el archivo descargado antes de usarlo.

## Enlaces

- Repositorio del modelo: https://huggingface.co/zk0bot/study001-centralized-cexp
- Modelo final de zk0 citado en la model card: https://huggingface.co/ivelin/zk0-smolvla-fl
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Librería LeRobot: https://github.com/huggingface/lerobot
- Resultado de búsqueda web (no relacionado con el modelo, descartado por irrelevante): https://www.okx.com/price/raydium-ray
