# you2who/AMAM-libero-mem-vla

## Resumen

AMAM-libero-mem-vla es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario you2who bajo el paraguas del proyecto AgentMem-Action-Model (AMAM). El repositorio contiene los pesos de inferencia completos de la variante `hold_v1_step50070`, junto con configuración, tokenizer y metadatos de normalización de benchmarks. No se trata de un checkpoint de entrenamiento ni de reanudación, sino de un export de inferencia listo para ejecutar dentro del pipeline AMAM Action.

El modelo deriva de componentes OpenPI/PaliGemma y está etiquetado con el pipeline `robotics` en Hugging Face. Con 3.353.433.872 parámetros (aproximadamente 3,35 mil millones) y un tamaño de repositorio de 6,7 GB en formato safetensors, está diseñado para tareas de manipulación robótica evaluadas en el benchmark LIBERO, con un protocolo de observación y acción específico que no es intercambiable con otros benchmarks.

Su relevancia actual reside en la creciente familia de modelos VLA que combinan un backbone de visión-lenguaje con una cabeza de acción para control robótico de extremo a extremo. La model card es explícita sobre las dependencias: no requiere el código de entrenamiento EVA ni una descarga separada de la base Pi, lo que simplifica el despliegue, pero obliga a respetar las licencias upstream (Gemma) además de la CC BY 4.0 de las contribuciones propias de AMAM.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA (visión-lenguaje-acción) derivada de OpenPI/PaliGemma |
| Parámetros totales | 3.353.433.872 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 (contribuciones AMAM); componentes upstream (Gemma) bajo sus propios términos |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que el modelo se construye sobre componentes OpenPI y PaliGemma, es decir, un backbone de visión-lenguaje acoplado a una cabeza de acción para producir comandos motores a partir de observaciones visuales e instrucciones en lenguaje natural. El tag `eva_openpi` sugiere integración con el stack EVA/OpenPI, aunque la model card aclara que la inferencia de AMAM Action no requiere el código de entrenamiento EVA ni una descarga separada de la base Pi.

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La versión publicada corresponde al paso `hold_v1_step50070`, lo que indica un entrenamiento por pasos con una fase o variante denominada `hold_v1`. Tampoco se documentan innovaciones técnicas específicas como decodificación especulativa o atención lineal. El repositorio incluye metadatos de normalización de benchmarks, lo que refleja que el modelo se evaluó y ajustó con transformaciones de observación y acción propias de LIBERO.

## Capacidades

- Control robótico de extremo a extremo: genera acciones a partir de observaciones visuales e instrucciones, orientado a tareas de manipulación.
- Comprensión visión-lenguaje: hereda el backbone PaliGemma para interpretar escenas e instrucciones.
- Ejecución en el benchmark LIBERO: incluye transformaciones de observación y acción específicas del benchmark.
- Inferencia autocontenida: no requiere código de entrenamiento EVA ni descarga separada de la base Pi.
- Integración con el ecosistema AMAM: pensado para ejecutarse junto con los assets relacionados (VLM y anotaciones).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Evaluación en LIBERO: ejecutar el modelo con las transformaciones de observación y acción incluidas para reproducir los resultados del benchmark y comparar variantes del proyecto AMAM.
- Investigación en modelos VLA: usar los pesos de inferencia como referencia congelada (`hold_v1_step50070`) para estudiar el comportamiento de políticas visión-lenguaje-acción sin reentrenar.
- Manipulación robótica en simulación: desplegar el modelo en entornos simulados compatibles con el protocolo de LIBERO para tareas de pick-and-place y manipulación de objetos.
- Base para fine-tuning downstream: partir de estos pesos como inicialización en nuevos dominios de manipulación, respetando las licencias upstream.
- Comparación de arquitecturas VLA: contrastar el rendimiento de AMAM frente a otras políticas OpenPI/PaliGemma en el mismo benchmark.
- Reproducibilidad de experimentos: al incluir configuración, tokenizer y metadatos de normalización, permite replicar pipelines de evaluación de forma controlada.
- Integración en stacks de robótica open source: incorporar el export de inferencia en herramientas compatibles con safetensors y el ecosistema OpenPI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 3,35 mil millones de parámetros en safetensors (6,7 GB en el repo), la inferencia en precisión completa requiere del orden de 7-14 GB de VRAM, y en cuantización de 8 bits aproximadamente 4-7 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible en la documentación; por tamaño, GPUs con 16 GB o más (RTX 4090, A100, H100) son candidatas razonables.
- ¿Cabe en GPU de consumo? Probablemente en GPUs con 16-24 GB de VRAM según cuantización, aunque no está confirmado.
- Opciones de despliegue: no se documentan explícitamente; el modelo se distribuye como safetensors para el stack AMAM Action/OpenPI. vLLM, llama.cpp, Ollama o TGI no están confirmados como compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas de alternativas en la información proporcionada, por lo que la comparación cuantitativa no está disponible. Como referencia cualitativa, el modelo pertenece a la familia de políticas VLA basadas en OpenPI/PaliGemma, comparables por arquitectura a otras políticas visión-lenguaje-acción del ecosistema OpenPI, pero no se aportan cifras de parámetros, contexto ni benchmarks de esos modelos en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| AMAM-libero-mem-vla | 3.353.433.872 | no disponible | cc-by-4.0 (+ upstream Gemma) | Hugging Face |
| Alternativas OpenPI/PaliGemma | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar PaliGemma, puede arrastrar sesgos del backbone visión-lenguaje.
- Riesgo de alucinación: no evaluado en la información disponible; en políticas VLA el fallo se manifiesta como acciones incorrectas más que como texto inventado.
- Protocolo no intercambiable: las transformaciones de observación y acción y la normalización son específicas de LIBERO; usarlas en otro benchmark puede producir resultados inválidos.
- Restricciones de licencia: las contribuciones AMAM son CC BY 4.0, pero los componentes upstream (Gemma) mantienen sus propios términos; es obligatorio conservar los archivos de licencia incluidos. La CC BY 4.0 no sustituye las licencias de terceros.
- Uso comercial: condicionado por las licencias upstream de Gemma y PaliGemma; revisar los términos antes de desplegar en producción.
- Naturaleza del artefacto: son pesos de inferencia, no checkpoints de entrenamiento ni de reanudación; no sirven para continuar el entrenamiento tal cual.
- Idiomas y contexto: sin datos publicados, lo que impide garantizar cobertura multilingüe o ventanas de contexto largas.
- Madurez: 0 descargas y 0 likes en el momento de la consulta; proyecto de investigación sin validación comunitaria amplia.

## Enlaces

- Hugging Face: https://huggingface.co/you2who/AMAM-libero-mem-vla
- Código: https://github.com/utomm/AgentMem-Action-Model
- Proyecto: https://agent-mem-action-model.github.io/
- Paper: https://arxiv.org/abs/2609.11308
- VLM relacionado: https://huggingface.co/you2who/AMAM-libero-mem-vlm
- Anotaciones: https://huggingface.co/datasets/you2who/AMAM-libero-mem-annotations
