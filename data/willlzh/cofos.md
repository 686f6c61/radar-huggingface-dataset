# Willlzh/COFOS

## Resumen

COFOS es un modelo de lenguaje causal especializado en marcos orgánicos covalentes (COF, por sus siglas en inglés), especies reactivas de oxígeno (ROS), productos derivados del oxígeno y preguntas sobre mecanismos fotocatalíticos y redox. Lo desarrolla el autor Willlzh y se distribuye bajo licencia MIT. El modelo parte de una arquitectura de tipo Qwen (etiqueta `qwen3_5_text` en Hugging Face) con 8.953.803.264 parámetros totales, es decir, aproximadamente 9B, y se ha adaptado al dominio mediante QLoRA y SFT.

El modelo se ha construido como estudiante destilado a partir de datos generados por un profesor Qwen de 35B, que produjo y normalizó pares de pregunta-respuesta y explicaciones mecanísticas a partir de registros estructurados y evidencia recuperada. El resultado es un checkpoint autónomo de Transformers que incorpora la adaptación de dominio y un LoRA posterior de respuesta directa, ya fusionados en los pesos finales.

Su relevancia radica en la especialización vertical: en lugar de competir como modelo generalista, COFOS se centra en un nicho científico concreto (fotoquímica de COF y química redox de ROS) y se acompaña de un runtime con recuperación BM25, grafo de conocimiento y RAG sobre PDF, además de una CLI distribuida por npm. Está orientado a inglés y a tareas de asistencia a la investigación y revisión bibliográfica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de tipo Qwen (`qwen3_5_text`), adaptado con QLoRA/SFT |
| Parametros totales | 8.953.803.264 (~9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo de uso emplea bfloat16) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

COFOS es un modelo causal autorregresivo basado en una arquitectura de tipo Qwen, identificada en Hugging Face con la etiqueta `qwen3_5_text`. Sobre ese modelo base se aplicó un ajuste fino de dominio en dos fases: primero QLoRA/SFT sobre datos de química COF/ROS y, posteriormente, un LoRA de respuesta directa (direct-QA) que se fusionó en los pesos para producir un checkpoint autónomo cargable directamente con Transformers. El checkpoint se exportó con Transformers 5.14.1.

Los datos de entrenamiento provienen del conjunto `Willlzh/COFOS_data` y combinan QA de COF/ROS destilado de un profesor Qwen de 35B, muestras de estilo RAG, QA de química y redox, y datos de corrección de estilo de respuesta. El profesor generó y normalizó las respuestas a partir de registros estructurados y evidencia recuperada. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. La evaluación M4 del autor se realizó con los pesos por defecto y con recuperación BM25 y grafo de conocimiento activados en el runtime de COFOS.

## Capacidades

- Generación de texto y respuesta a preguntas en estilo QA natural sobre fotocatálisis de COF y especies reactivas de oxígeno.
- Distinción entre especie ROS o producto dominante, especies secundarias e intermedios de reacción.
- Manejo de especies químicas concretas: `O2·-`, `1O2`, `H2O2`, `·OH`, `SO4·-`, `SO5·-`, `HO2·`, `*O2`, `*OOH` y `*HOOH`.
- Corrección de errores conceptuales frecuentes, como describir `H2O2` como ROS radicalario (el modelo está instruido para evitarlo).
- Explicación de asignaciones de ROS dependientes de condiciones: luz, O2, agua, agentes sacrificantes, PMS/PDS y entornos redox relacionados.
- Integración con evidencia externa mediante grafo de conocimiento, BM25 y RAG sobre PDF a través de la CLI o el runtime local del proyecto.
- Soporte de plantilla de chat con control de modo de razonamiento (`enable_thinking=False` en el ejemplo de uso).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan en la información disponible capacidades de tool calling, function calling, visión, audio ni razonamiento agéntico multi-paso.

## Casos de uso

- Asistencia a revisión bibliográfica en química de materiales: el modelo responde preguntas sobre qué ROS genera un COF concreto bajo fotocatálisis en luz visible, lo que acelera la extracción de conclusiones de artículos y registros estructurados.
- Interpretación de mecanismos redox: permite explicar asignaciones de ROS dependientes de condiciones (presencia de PMS/PDS, agentes sacrificantes, luz, agua) y distinguir especie dominante, secundaria e intermedios en un experimento descrito.
- RAG sobre corpus propio de PDF: mediante `npx @lzhzzzzwill/cofos --pdf-dir ./new_pdfs`, el modelo incorpora evidencia local de nuevos artículos sin subir los documentos, útil para equipos que trabajan con literatura no pública.
- Control de calidad conceptual en documentación científica: el modelo puede revisar borradores y señalar errores como clasificar `H2O2` como ROS radicalario, gracias a su entrenamiento específico de corrección de estilo y contenido.
- Formación y divulgación interna: sirve como asistente de preguntas frecuentes sobre COF, ROS y productos derivados del oxígeno para investigadores junior que necesitan respuestas rápidas y consistentes en inglés.
- Prototipado de asistentes científicos con recuperación: su integración con grafo de conocimiento y BM25 en el runtime permite construir demos de asistente documental con citas y evidencia recuperada.
- Extracción asistida de información de registros estructurados: al haberse entrenado sobre registros y evidencia recuperada normalizados, puede usarse para generar resúmenes QA de fichas experimentales de COF y ROS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación interna denominada M4 realizada con los pesos por defecto y con recuperación BM25 y grafo de conocimiento activados, pero no se aportan métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; para un modelo de ~9B parámetros, en bfloat16 serían necesarios aproximadamente 18 GB solo para pesos, más overhead de activaciones y caché KV.
- GPU recomendadas: no especificadas por el autor. Por tamaño, un modelo de ~9B en bfloat16 encaja en GPUs de 24 GB o más (RTX 4090, L40S, A100 40/80 GB, H100).
- ¿Cabe en GPU de consumo? No confirmado en la información disponible; con cuantización a 8 bits o 4 bits sería viable en GPUs de consumo de 12-24 GB, pero el autor no publica pesos cuantizados ni cifras verificadas.
- Opciones de despliegue: Transformers (ejemplo oficial con `AutoModelForCausalLM`, `torch_dtype=torch.bfloat16`, `device_map="auto"`), CLI oficial vía npm (`npx @lzhzzzzwill/cofos` o instalación global). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| COFOS (Willlzh) | ~9B | no disponible | Química COF/ROS, redox, fotocatálisis | MIT | Hugging Face + CLI npm |
| Modelo base Qwen de la familia `qwen3_5_text` | no disponible | no disponible | Generalista | no disponible | no disponible |
| Profesor Qwen 35B citado en la model card | 35B | no disponible | Generalista usado para destilación | no disponible | no disponible |

No se dispone de información sobre modelos especializados comparables en el mismo nicho (COF/ROS) en la documentación proporcionada.

## Limitaciones y advertencias

- Puede alucinar hechos específicos de materiales si la respuesta no está representada en el modelo o en la evidencia recuperada.
- El uso directo con Transformers no incorpora RAG; para respuestas aumentadas con evidencia hay que usar la CLI o el runtime del proyecto.
- No garantiza citas correctas salvo que se conecte a un sistema de recuperación externo.
- Las explicaciones mecanísticas son asistencia a la investigación, no prueba experimental.
- No debe usarse para decisiones de seguridad química, médicas, legales o regulatorias de alto riesgo.
- El modelo está entrenado y documentado únicamente en inglés; el rendimiento en castellano u otros idiomas no está validado.
- No se documentan sesgos específicos ni evaluaciones de robustez o seguridad.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre exactitud científica en producción.
- La longitud de contexto no está publicada, lo que dificulta planificar casos de uso con documentos largos sin pruebas previas.
- El repositorio es pequeño en tracción (16 descargas, 0 likes en el momento de la consulta), por lo que la validación por parte de la comunidad es escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Willlzh/COFOS
- Dataset: https://huggingface.co/datasets/Willlzh/COFOS_data
- CLI en npm: https://www.npmjs.com/package/@lzhzzzzwill/cofos
