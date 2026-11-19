# vcruz305/Hy4-flash-SAGE-REXL3-4.84bpw

## Resumen

Hy4-flash-SAGE-REXL3-4.84bpw es una cuantización de 4,84 bits por peso del modelo base tencent/Hy4-flash, publicada por el usuario vcruz305 en Hugging Face. Se distribuye en formato ExLlamaV3 (exl3) mediante la librería exllamav3, con pesos en safetensors y una técnica de cuantización identificada como SAGE-REXL3, orientada a reducir el peso del modelo manteniendo la fidelidad de los pesos originales. El resultado es un checkpoint de aproximadamente 49.868 millones de parámetros totales y un repositorio de 165,6 GB.

El modelo base, Hy4-flash, es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por Tencent, según indican las etiquetas del repositorio (moe, hy4-flash, hy_v4_flash). Al tratarse de una cuantización, este artefacto no aporta capacidades nuevas respecto al original: su relevancia está en hacer viable el despliegue del modelo en hardware con menos memoria, a cambio de una posible pérdida de precisión en los pesos.

La ficha se centra en lo que puede verificarse a partir de los metadatos del repositorio. La información sobre arquitectura interna, contexto, datos de entrenamiento y rendimiento del modelo base no está disponible en la información proporcionada, por lo que se indica explícitamente en cada apartado correspondiente. El acceso al repositorio está restringido y requiere aceptar las condiciones de la licencia tencent-hy-license.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), según etiquetas del repositorio; detalles internos no disponibles |
| Parámetros totales | 49.867.996.582 (≈49,87 mil millones) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4,84 bits por peso (SAGE-REXL3, formato exl3); cuantizaciones adicionales del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | tencent-hy-license (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors, cuantización exl3 para exllamav3 |

## Arquitectura y entrenamiento

El artefacto es una cuantización del modelo base tencent/Hy4-flash, que las etiquetas identifican como un modelo MoE (Mixture of Experts). No se dispone de información sobre el número de expertos, la dimensión oculta, el número de capas, el mecanismo de atención ni la estrategia de enrutamiento del modelo original. Tampoco se especifica si emplea atención lineal, decodificación especulativa u otras innovaciones.

El proceso de cuantización aplicado es SAGE-REXL3, una variante del formato exl3 de ExLlamaV3, con un tamaño efectivo de 4,84 bits por peso. No se detalla en la información proporcionada la metodología exacta de SAGE (posiblemente una técnica de calibración o ajuste de escalas), ni el conjunto de calibración utilizado, ni el impacto medido en perplejidad respecto al modelo en precisión completa. Los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) no están disponibles.

## Capacidades

- Generación de texto y conversación: el pipeline declarado es text-generation y las etiquetas incluyen conversational, por lo que el modelo base está orientado a diálogo multi-turno.
- Razonamiento y conocimiento general: capacidades heredadas del modelo base Hy4-flash, no documentadas en la información disponible.
- Generación de código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible; el repositorio no declara idiomas.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Despliegue de inferencia en GPUs de gama alta para consumo: al estar cuantizado a 4,84 bpw, el checkpoint reduce el requisito de memoria frente al modelo base en precisión completa, lo que permite servirlo en configuraciones de una o varias GPUs con menos VRAM. Es adecuado cuando se quiere evaluar Hy4-flash sin disponer del presupuesto de memoria del original.
- Servicio de chat multi-turno: dado que el pipeline es text-generation y las etiquetas indican uso conversacional, puede emplearse como backend de un asistente conversacional mediante exllamav3, siempre que se valide la calidad tras la cuantización.
- Experimentación e investigación sobre cuantización: el checkpoint sirve para comparar la calidad de SAGE-REXL3 a 4,84 bpw frente al modelo base, midiendo perplejidad o evaluaciones propias en tareas concretas.
- Prototipado rápido de aplicaciones sobre modelos MoE: permite montar un entorno de pruebas con un MoE de ~50 mil millones de parámetros totales en hardware más asequible que el requerido por el original.
- Evaluación interna antes de adopción: útil para equipos que quieran medir latencia y throughput reales en su infraestructura antes de decidir si adoptan el modelo base de Tencent.
- Fine-tuning o adaptación posterior: no recomendable directamente sobre el checkpoint cuantizado; para ajuste fino conviene partir del modelo base. Este artefacto se orienta a inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni de métricas de degradación por cuantización (perplejidad, KL divergence) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: con 49,87 mil millones de parámetros a 4,84 bits por peso, los pesos ocupan aproximadamente 30,2 GB (49,87e9 × 4,84 / 8 ≈ 30,2 GB). A ello hay que sumar caché KV y overhead del runtime de ExLlamaV3; el tamaño del repositorio (165,6 GB) incluye probablemente múltiples ficheros o artefactos auxiliares y no refleja el peso en memoria de una sola carga.
- GPU recomendadas: no disponibles de forma oficial. Por el volumen de pesos, se requiere al menos una GPU con 40-48 GB de VRAM para una carga holgada (A100 40/80 GB, H100, L40S 48 GB) o reparto multi-GPU.
- GPU de consumo: una RTX 4090 (24 GB) no cubre los ~30 GB de pesos en una sola tarjeta; sería necesario reparto entre varias GPUs o una cuantización de menor tamaño. No hay datos oficiales que confirmen configuraciones viables.
- Opciones de despliegue: ExLlamaV3 (librería declarada). No se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; al ser formato exl3, la ruta natural es exllamav3.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy4-flash-SAGE-REXL3-4.84bpw (este) | ~49,87 mil M totales (MoE) | no disponible | 4,84 bpw exl3 | tencent-hy-license | acceso restringido |
| tencent/Hy4-flash (base) | no disponible | no disponible | precisión original | tencent-hy-license | no disponible en la información |
| Otras cuantizaciones de Hy4-flash | no disponible | no disponible | no disponible | tencent-hy-license | no disponible |

No se dispone de información sobre alternativas comparables de otros autores en la misma categoría (MoE de ~50 mil millones de parámetros) para esta ficha.

## Limitaciones y advertencias

- La cuantización a 4,84 bpw puede introducir degradación en la calidad de las respuestas respecto al modelo base; no se han publicado métricas que cuantifiquen esa pérdida.
- El acceso está restringido: es necesario aceptar las condiciones en Hugging Face y cumplir la licencia tencent-hy-license, cuyos términos de uso comercial no se detallan en la información disponible. Verificar la licencia antes de cualquier uso en producción.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (19 de noviembre de 2026); no hay evidencia de validación por la comunidad.
- No se declaran idiomas soportados, por lo que no puede confirmarse el rendimiento en castellano ni en otros idiomas.
- Riesgo de alucinación y sesgos: no documentados para este checkpoint; deben evaluarse con pruebas propias antes de desplegarlo.
- La longitud de contexto no está disponible, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Compatibilidad limitada al ecosistema exllamav3; no se garantiza su uso con otros runtimes.
- Al ser un artefacto derivado de un modelo de Tencent, las obligaciones de atribución y las restricciones de la licencia original se heredan.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vcruz305/Hy4-flash-SAGE-REXL3-4.84bpw
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- No se han encontrado en la información proporcionada papers, blogs, repositorios de código ni demos adicionales.
