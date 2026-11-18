# tnlegend/mcp-security-m4-deberta-v2

## Resumen

MCP Security Framework M4 — DeBERTa V2 es un checkpoint de clasificación de texto en inglés, afinado a partir de `microsoft/deberta-v3-small`, desarrollado por el usuario tnlegend. No es un modelo de propósito general ni un detector de inyección de prompts autónomo: es un componente de un marco de investigación de seguridad orientado a la semántica de las descripciones de herramientas del protocolo MCP (Model Context Protocol). El autor lo describe explícitamente como un checkpoint "congelado de cuatro cabezas" (four-head) de investigación, pensado para integrarse junto a GLiNER2.5 PASS10 en una arquitectura de análisis con autoridad firmada independiente.

El modelo hereda la arquitectura DeBERTa-v3-small (transformer encoder con atención disentangled y embedding de posiciones relativas), aunque el autor no detalla en la model card ni el número de parámetros ni la longitud de contexto efectiva del fine-tuning. Su función es clasificar semánticamente descripciones de herramientas MCP en inglés para apoyar decisiones de seguridad; ninguna puntuación del modelo por sí sola concede permisos MCP ni bloquea llamadas.

Es relevante ahora porque el ecosistema MCP está creciendo rápidamente y la superficie de ataque asociada a descripciones de herramientas maliciosas o ambiguas es un problema emergente. Este checkpoint representa un enfoque de investigación abierto (licencia MIT) para construir capas de análisis semántico sobre MCP, aunque su madurez es baja: cero descargas, cero likes y publicación reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder DeBERTa-v3 (atención disentangled), checkpoint de clasificación con cuatro cabezas |
| Parametros totales | no disponible (modelo base `microsoft/deberta-v3-small`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización no documentada) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (`best_model.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-small`, un transformer encoder de la familia DeBERTa-v3 que combina atención disentangled con embeddings de posiciones relativas y, en la versión v3, un preentrenamiento con ELECTRA-style replaced token detection. Sobre esa base, el autor ha añadido una cabeza de clasificación compuesta por cuatro cabezas (four-head), orientada a la clasificación semántica de descripciones de herramientas MCP en el contexto de un marco de seguridad propio.

La model card no proporciona información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni hiperparámetros de fine-tuning. Sí indica que el checkpoint está congelado y que su hash SHA-256 (`331750fe70452dba7461d1dc1bc77cfc38726de59828d06588ae3c5c467c936d`) junto con una revisión inmutable en Hugging Face protegen la instalación. El autor advierte que no se incluyen datos de entrenamiento en bruto, resultados de QA privados ni credenciales, y que el modelo no es un checkpoint oficial de Microsoft.

## Capacidades

- Clasificación semántica de texto en inglés, específicamente descripciones de herramientas del protocolo MCP.
- Checkpoint de cuatro cabezas: produce múltiples salidas de clasificación (la naturaleza exacta de cada cabeza no está documentada en la model card).
- Diseñado para integrarse en un pipeline de seguridad junto a GLiNER2.5 PASS10 y una autoridad de análisis firmada.
- No soporta tool calling, function calling ni razonamiento multi-paso por sí mismo: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni capacidades multimodales.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de seguridad de descripciones de herramientas MCP: el clasificador evalúa la semántica de las descripciones registradas en un servidor MCP para señalar posibles ambigüedades o patrones sospechosos antes de que un agente las invoque.
- Componente de una capa de decisión con múltiples señales: se combina con GLiNER2.5 PASS10 y con la autoridad de análisis firmada para que ninguna puntuación aislada del modelo conceda permisos ni bloquee llamadas.
- Investigación en seguridad de agentes: sirve como checkpoint de referencia congelado (hash verificable) para reproducir experimentos sobre clasificación semántica de herramientas en entornos MCP.
- Filtrado previo en pipelines de registro de herramientas: clasifica lotes de descripciones MCP en inglés para priorizar la revisión manual de las que presentan mayor riesgo semántico.
- Auditoría de catálogos de herramientas de terceros: permite etiquetar descripciones importadas de servidores MCP externos antes de incorporarlas a un entorno de producción.
- Verificación de integridad en despliegues: el hash SHA-256 publicado y la revisión inmutable permiten comprobar que el checkpoint desplegado es exactamente el auditado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,6 GB, lo que sugiere que el checkpoint en fp32 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: al tratarse de un derivado de DeBERTa-v3-small, es viable en GPUs de consumo (por ejemplo, RTX 3060, RTX 4090) y en CPU para inferencia por lotes pequeños.
- Cabe en GPU de consumo: sí, previsiblemente, dado el tamaño del repositorio; no se documentan requisitos oficiales.
- Opciones de despliegue: no documentadas por el autor; al ser un modelo de `text-classification` con pesos safetensors, es compatible con el pipeline de Transformers. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tnlegend/mcp-security-m4-deberta-v2 | no disponible (base small) | no disponible | Clasificación semántica MCP (4 cabezas) | MIT | Hugging Face, 0 descargas |
| microsoft/deberta-v3-small | no disponible en la información | no disponible | Modelo base encoder | MIT | Hugging Face |
| microsoft/deberta-v3-base | no disponible en la información | no disponible | Modelo base encoder | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de propósito general ni un detector de inyección de prompts autónomo; el autor lo describe como un checkpoint de investigación con cuatro cabezas.
- Ninguna puntuación del modelo por sí sola concede permisos MCP ni bloquea llamadas: requiere una autoridad de análisis firmada independiente.
- Solo soporta inglés, lo que limita su uso en entornos multilingües.
- No se documentan sesgos conocidos, datos de entrenamiento ni evaluación de robustez frente a entradas adversarias.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea (falsos positivos y negativos) en descripciones ambiguas.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo no es un checkpoint oficial de Microsoft.
- Madurez baja: cero descargas y cero likes en el momento de la consulta, publicación reciente (noviembre de 2026) y ausencia de benchmarks públicos.
- La verificación de integridad depende de comprobar el hash SHA-256 y fijar la revisión inmutable de Hugging Face.

## Enlaces

- Hugging Face: https://huggingface.co/tnlegend/mcp-security-m4-deberta-v2
- Modelo base: https://huggingface.co/microsoft/deberta-v3-small
