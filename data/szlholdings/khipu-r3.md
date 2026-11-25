# SZLHOLDINGS/khipu-r3

## Resumen

khipu-r3 es un ajuste fino (fine-tuning) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de la familia Qwen 3.5 con aproximadamente 752 millones de parámetros totales según los pesos en safetensors. El repositorio se distribuye con la librería PEFT, lo que indica que se trata de un artefacto de adaptación (adaptadores LoRA u otra técnica PEFT) más que de un modelo entrenado desde cero. La licencia declarada es Apache 2.0 y la arquitectura registrada en los tags es `qwen3_5_text`, es decir, la variante exclusivamente de texto de Qwen 3.5.

El modelo se enmarca en lo que el autor denomina "governed-AI estate": una colección de modelos, datasets y Spaces con trazabilidad de origen y resultados verificables mediante ficheros de recibo (receipts). La model card es explícitamente conservadora: no afirma ningún resultado de benchmark que no haya sido medido en una auditoría fechada, y etiqueta como UNKNOWN todo aquello que no está respaldado por un recibo. Esa política de honestidad documental es el rasgo diferencial del artefacto, más que sus capacidades intrínsecas.

Por su tamaño (menos de mil millones de parámetros) y su naturaleza de adaptador sobre una base pequeña, khipu-r3 es relevante para escenarios de despliegue en hardware modesto, prototipado rápido y experimentación con técnicas PEFT. No obstante, la información pública disponible es muy escasa: no se documentan datos de entrenamiento, idiomas soportados, benchmarks ni detalles del proceso de ajuste, por lo que cualquier evaluación de calidad debe realizarse por cuenta del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (tag `qwen3_5_text`, variante de texto de Qwen 3.5) |
| Parametros totales | 752.393.024 (según safetensors) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repo en safetensors; no se publican versiones GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio PEFT) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen 3.5 en su variante de texto (`qwen3_5_text`), un transformer denso con atención estándar. El artefacto publicado es un ajuste PEFT sobre Qwen/Qwen3.5-0.8B, con 752 millones de parámetros contabilizados en los ficheros safetensors y un tamaño de repositorio de 6,1 GB. El uso de la librería PEFT sugiere adaptadores de bajo rango, aunque la model card no especifica la configuración exacta (rango, alpha, módulos objetivo) ni si se fusionaron los pesos con la base.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, la existencia de fases de RLHF o DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card declara explícitamente que cualquier afirmación de entrenamiento o evaluación reside en los ficheros de recibo del "estate" del autor, y que lo no documentado allí debe considerarse UNKNOWN. La instantánea de auditoría citada está fechada el 2026-11-20T03:48:04Z.

## Capacidades

- Generación de texto: hereda las capacidades del modelo base Qwen 3.5 de 0,8B, orientadas a generación de texto general.
- Razonamiento y código: presumiblemente presentes por herencia de la base, aunque no hay evaluación publicada que lo confirme para este ajuste concreto.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; el campo de idiomas figura como no disponible.
- Capacidades especiales (modo thinking, visión, audio): no documentadas; el tag `qwen3_5_text` indica que la variante es solo texto, sin visión ni audio.
- Trazabilidad y verificación: el artefacto incluye referencias a recibos de auditoría y gráficos SVG deterministas generados a partir de una instantánea de auditoría fechada.

## Casos de uso

- Prototipado de aplicaciones de texto en hardware de consumo: con menos de 800 millones de parámetros, el modelo puede ejecutarse en GPUs de gama media o incluso en CPU con cuantización, lo que lo hace adecuado para pruebas de concepto antes de escalar a modelos mayores.
- Experimentación con PEFT: al distribuirse como repositorio PEFT, sirve como ejemplo práctico para estudiar cómo se estructura y se carga un adaptador sobre una base Qwen 3.5, y para comparar configuraciones de ajuste fino.
- Generación de texto asistida en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 permite uso comercial sin las restricciones de otras licencias de modelos abiertos, lo que facilita su integración en productos propietarios.
- Evaluación de pipelines de auditoría y trazabilidad: el modelo forma parte de un "estate" con recibos verificables, por lo que puede usarse como caso de estudio de gobernanza de artefactos de IA en organizaciones que exigen procedencia documentada.
- Tareas de clasificación y extracción de texto de baja complejidad: para resúmenes cortos, etiquetado o extracción de entidades en dominios acotados, un modelo de este tamaño puede ser suficiente y mucho más barato de servir que alternativas de miles de millones de parámetros.
- Educación y divulgación: su tamaño reducido y su licencia permisiva lo convierten en un candidato para talleres y cursos sobre fine-tuning y despliegue de modelos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor declara explícitamente que no se afirma ningún número de benchmark más allá de lo medido en una auditoría fechada, y no se incluyen tablas de resultados en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (752 M de parámetros), en FP16 se necesitarían aproximadamente 1,5 GB solo para los pesos, más overhead de activaciones y caché KV; en cuantizaciones de 8 bits o 4 bits el requisito bajaría a alrededor de 0,8-1 GB, aunque no se publican versiones cuantizadas.
- GPU recomendadas: no documentadas por el autor. Por tamaño, cualquier GPU con al menos 4-6 GB de VRAM debería ser suficiente en FP16, incluyendo RTX 3060, RTX 4060, RTX 4090, A100 o H100.
- ¿Cabe en GPU de consumo? Sí, por el número de parámetros cabe holgadamente en GPUs de consumo con 8 GB o más de VRAM, siempre que se disponga de los pesos en un formato compatible.
- Opciones de despliegue: al ser un repositorio PEFT, el flujo natural es cargar la base Qwen/Qwen3.5-0.8B y aplicar los adaptadores con la librería `peft` de Hugging Face. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y no se publican pesos en GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| khipu-r3 (SZLHOLDINGS) | 752 M (PEFT sobre Qwen3.5-0.8B) | No disponible | Apache 2.0 | Hugging Face, safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | No disponible en la información proporcionada | No disponible en la información proporcionada | Hugging Face |
| Alternativas de ~1 B (p. ej. Llama 3.2 1B, Gemma 3 1B) | ~1-1,2 B | 128 K (Llama 3.2 1B) / 32 K (Gemma 3 1B) | Llama 3.2 Community License / Gemma Terms | Hugging Face, GGUF, Ollama |

La comparación con alternativas de la misma categoría es limitada porque no se dispone de datos de rendimiento de khipu-r3 ni de especificaciones completas de su base. La ventaja diferencial del artefacto es su licencia Apache 2.0, más permisiva que las de Llama 3.2 o Gemma 3, y su integración en un marco de auditoría documentada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al heredar el comportamiento de Qwen 3.5, es probable que arrastre sesgos del corpus de entrenamiento de la base, pero no hay evaluación publicada para este ajuste.
- Riesgo de alucinación: no cuantificado. Un modelo de menos de mil millones de parámetros tiene una capacidad limitada de razonamiento factual, por lo que el riesgo de alucinación en tareas abiertas es inherentemente alto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados figuran como no disponibles; no se debe asumir cobertura multilingüe sin verificación previa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero conviene verificar que la licencia del modelo base Qwen 3.5 sea compatible con la redistribución de los adaptadores.
- Caveat de producción: la model card no documenta hiperparámetros de entrenamiento, datos, evaluación ni procedimiento de fusión de pesos; antes de usar el modelo en producción es necesario realizar una evaluación propia sobre el dominio objetivo.
- Formato: al distribuirse solo en safetensors y como repositorio PEFT, no hay versiones cuantizadas listas para usar con llama.cpp u Ollama, lo que añade trabajo de conversión si se busca despliegue en CPU.
- Madurez: el repositorio tiene 284 descargas y 0 likes en el momento de la consulta, lo que indica una adopción muy limitada y escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-r3
- Organización del autor en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de fichas (referenciado): https://github.com/szl-holdings/estate-cards
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
