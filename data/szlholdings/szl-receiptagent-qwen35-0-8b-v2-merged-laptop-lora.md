# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged-laptop-lora

## Resumen

`szl-receiptagent-qwen35-0.8b-v2-merged-laptop-lora` es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador de un supuesto modelo derivado de una familia Qwen (el nombre sugiere una base de 0,8 mil millones de parámetros, versión 3.5, con un LoRA fusionado entrenado en un portátil). El repositorio se describe a sí mismo como "private registry artifact of the SZLHOLDINGS estate" y está etiquetado como `research-artifact`, `experimental` y `private-estate`.

La model card ha sido reescrita explícitamente para retirar todas las afirmaciones de evaluación, entrenamiento y calidad que contenía una versión anterior (la "wave-4 uniform stamp"). El autor declara que no existe evidencia verificable por modelo en la revisión observada y, en consecuencia, la ficha actual no reclama ningún resultado de benchmark, contrato de entrenamiento ni equivalencia de pesos. Es, por tanto, un artefacto sin validación publicada.

Su relevancia práctica es limitada: no hay datos de rendimiento, idiomas, contexto ni pipeline declarados, y el tamaño del repositorio aparece como 0,0 GB, lo que sugiere que los pesos podrían no estar efectivamente alojados o que la medición no está disponible. Debe tratarse como material de investigación no cualificado para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere base tipo Qwen, sin confirmar) |
| Parámetros totales | no disponible (el nombre sugiere ~0,8B, sin confirmar) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio) |

## Arquitectura y entrenamiento

No hay información verificable sobre la arquitectura. El nombre del repositorio indica "qwen35-0.8b", lo que apunta a una base de la familia Qwen de aproximadamente 0,8 mil millones de parámetros, y "merged-laptop-lora" sugiere la fusión de un adaptador LoRA entrenado en hardware de portátil. Ninguno de estos extremos está confirmado por la model card, que renuncia explícitamente a cualquier afirmación sobre arquitectura, hiperparámetros o dataset.

La model card reescrita el 2026-11-14 elimina la tabla de entrenamiento QLoRA y el model-index que figuraban en la versión anterior, argumentando que la doctrina "fail-closed" del estate no puede verificarlos por modelo. La revisión del Hub observada antes de la edición fue `c9132ffe65d20797308363eb7acf6f8ce79c7a38`. No se declara número de tokens de entrenamiento, composición del dataset ni uso de RLHF o DPO.

## Capacidades

- No se declara ninguna capacidad verificada en la model card actual.
- Por el nombre del repositorio ("receiptagent") se infiere un posible uso previsto en extracción o procesamiento de recibos, pero no está confirmado ni documentado.
- Soporte de tool calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Investigación sobre fusionado de adaptadores LoRA: el artefacto puede servir para estudiar el proceso de merge de un LoRA sobre una base pequeña, aunque no hay documentación del procedimiento empleado.
- Reproducción de experimentos internos: únicamente dentro del "estate" del autor, dado el carácter de registro privado declarado.
- Auditoría de prácticas de publicación: útil como caso de estudio de una model card que retira afirmaciones no verificadas y documenta la revisión del Hub.
- Pruebas de carga de safetensors en pipelines internos: solo si los pesos están efectivamente presentes, extremo no confirmado (repo de 0,0 GB).
- Comparación de gobernanza de artefactos: ejemplo de etiquetado `research-artifact` y `experimental` para separar material no cualificado de modelos listos para producción.
- Docencia sobre riesgos de model cards infladas: la propia card documenta la retirada de una "uniform stamp" previa.

No se recomienda ningún caso de uso en producción, atención al cliente, generación de código ni procesamiento real de recibos, al no existir evidencia de calidad ni de comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente: "No evaluation, benchmark, or battery result is claimed for this artifact."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Si se confirmara un tamaño de ~0,8B, cabría en GPUs de consumo con cuantización de 4 bits (del orden de 1-2 GB), pero es una estimación no verificada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; el formato safetensors permitiría, en principio, conversión a GGUF, pero no hay pesos verificados ni tokenizador documentado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay datos de parámetros, contexto ni rendimiento verificados que permitan una comparación rigurosa con alternativas de la misma categoría. Cualquier comparación con modelos de ~0,8B de la familia Qwen u otros pequeños modelos sería especulativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, ni pruebas de batería, ni resultados de calidad.
- Sin contrato de entrenamiento ni dataset declarado: imposible auditar sesgos o procedencia de datos.
- Sin declaración de equivalencia de pesos ni cualificación de release: no se garantiza que el artefacto funcione como un modelo Qwen estándar.
- Tamaño de repositorio de 0,0 GB: posible ausencia de pesos reales o problema de medición; verificar antes de cualquier uso.
- Idiomas y contexto desconocidos: riesgo alto de comportamiento impredecible fuera de un caso de uso no documentado.
- Riesgo de alucinación: no evaluado; sin datos.
- Licencia Apache 2.0 declarada, lo que en principio permite uso comercial, pero al no haber pesos ni comportamiento verificados, el uso comercial carece de base técnica.
- Etiquetas `experimental` y `research-artifact`: el propio autor lo excluye de producción.
- Procedencia "private-estate": sin gobernanza externa ni revisión por pares.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2-merged-laptop-lora
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
