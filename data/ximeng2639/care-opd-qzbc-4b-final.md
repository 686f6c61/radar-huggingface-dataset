# ximeng2639/care-opd-qzbc-4b-final

## Resumen

CARE-OPD QZBC 4B es un modelo de lenguaje de 4.200 millones de parámetros desarrollado por ximeng2639, especializado en generación estructurada de respuestas basadas en evidencia (evidence-grounded generation). Se trata de un checkpoint derivado de Qwen/Qwen3.5-4B, adaptado mediante fine-tuning con la metodología CARE-OPD, que combina verificación de regiones de reparación semántica, supervisión de un modelo profesor y retención de regiones no afectadas. El resultado es un modelo capaz de recibir un paquete de evidencia (Evidence Packet) y producir una respuesta estructurada conforme a un contrato de evaluación específico (QZBC).

El modelo está pensado para investigación en generación de respuestas con anclaje a fuentes y para la reproducción del contrato de evaluación QZBC. No incluye componentes de verificación, recuperación ni agentes, que son externos al checkpoint. Es un modelo de solo texto, sin encoder de visión ni audio, y su licencia Apache 2.0 permite uso comercial bajo confirmación de derechos de los datos de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForCausalLM (transformers) |
| Parametros totales | 4.205.751.296 (aproximadamente 4.206B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda de Qwen3.5-4B, no especificado en la documentación) |
| Tipos de cuantizacion | bfloat16 (nativo); cuantizaciones adicionales no documentadas |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (sharded, con model.safetensors.index.json) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura Qwen3_5ForCausalLM, un transformer causal estándar con atención completa, sin mezcla de expertos ni mecanismos de atención lineal. El checkpoint es el resultado de fusionar adaptadores LoRA entrenados con la metodología CARE-OPD sobre el modelo base Qwen/Qwen3.5-4B. El entrenamiento emplea un enfoque iterativo: un verificador identifica regiones de reparación semántica, un modelo profesor proporciona supervisión sobre esas regiones, se retienen las regiones no afectadas y se re-entrenan los fallos con el estudiante actualizado. Este proceso se repite para mejorar la adherencia a la evidencia proporcionada.

Los datos de entrenamiento consisten en datos con formato QZBC y variantes controladas de estados de evidencia (ausencia, conflicto, falta de fiabilidad). No se especifica el número de tokens ni la composición exacta del dataset. El modelo no incluye el verificador, el profesor, el sistema de recuperación ni el agente anfitrión, que son componentes externos al checkpoint.

## Capacidades

- Generación de respuestas estructuradas ancladas a un paquete de evidencia proporcionado en el mensaje.
- Manejo de estados de evidencia controlados: ausencia de fuente, evidencia conflictiva y evidencia poco fiable.
- Generación de texto en chino e inglés, con soporte de chat multi-turno mediante plantilla de chat estándar de Transformers.
- Producción de salidas que cumplen un contrato de evaluación específico (QZBC) con validación de esquema y comprobación de límites de fuente (realizadas por componentes externos).
- Sin soporte de tool calling, agentes, visión ni audio: es un modelo de solo texto.
- No incluye modo de razonamiento explícito (thinking mode) documentado.

## Casos de uso

- Investigación en generación anclada a evidencia: el modelo permite estudiar cómo un LM de 4B se comporta cuando se le proporciona un paquete de evidencia y se le pide una respuesta estructurada, especialmente en escenarios con evidencia ausente o conflictiva.
- Reproducción del contrato de evaluación QZBC: se puede usar junto con el prompt, validador de esquema, comprobaciones de límites de fuente y revisión humana para replicar los resultados publicados (80,51% de éxito en la pista perturbada).
- Estudio controlado de comportamiento bajo perturbaciones de evidencia: el modelo es adecuado para experimentos donde se altera la calidad o presencia de las fuentes y se mide el impacto en la respuesta generada.
- Prototipado de sistemas de soporte a la decisión clínica no autónomo: como componente de investigación, puede generar borradores de respuestas basadas en documentos clínicos proporcionados, siempre que un profesional valide la salida.
- Desarrollo de pipelines de generación estructurada: su capacidad de producir salidas con formato definido lo hace útil para integrarse en flujos que requieren JSON o esquemas específicos, aunque la validación debe ser externa.
- Benchmarking de modelos de 4B en tareas de fidelidad a fuentes: sirve como punto de referencia para comparar estrategias de fine-tuning orientadas a reducir alucinaciones en contextos con evidencia.

## Benchmarks y rendimiento

La única métrica publicada es la tasa de éxito en la pista perturbada del conjunto QZBC (family-clean): 80,51% (2.355 de 2.925 tareas). No se han publicado resultados en benchmarks generales como MMLU, HumanEval, GSM8K o similares. La documentación indica que los resultados de benchmarks públicos apoyan principalmente la retención de capacidades competitivas, no una superioridad universal. No se proporcionan comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8,4 GB para los pesos (según tamaño del repo), más overhead de activaciones y KV cache. Con cuantización de 8 bits podría reducirse a ~4-5 GB, y con 4 bits a ~2-3 GB, aunque no se documentan oficialmente.
- GPU recomendadas: cualquier GPU con al menos 10 GB de VRAM para bf16 sin offload (p. ej., RTX 3080, RTX 3090, A10, A100). Para cuantización ligera, GPUs de 6-8 GB (RTX 3060, RTX 4060) pueden ser suficientes.
- Es viable en GPUs de consumo (RTX 30/40 series) con cuantización, pero el formato nativo bf16 requiere más memoria.
- Opciones de despliegue: compatible con Transformers (vía `AutoModelForCausalLM`), por lo que puede servirse con vLLM, TGI o llama.cpp (si se convierte a GGUF). No hay soporte nativo documentado para Ollama.
- Latencia y throughput: no se han publicado mediciones. Como referencia orientativa para un modelo de 4B en bf16, en una A100 se pueden esperar decenas de tokens por segundo, pero esto es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| CARE-OPD QZBC 4B | 4,2B | no disponible | Apache 2.0 | Generación anclada a evidencia |
| Qwen3.5-4B (base) | 4,2B | no disponible | Apache 2.0 | Modelo generalista |
| Gemma-3-4B-it | 4B | 128K (según documentación oficial) | Gemma Terms of Use | Modelo instructivo multimodal (texto+imagen) |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | Modelo instructivo generalista |

No se dispone de datos de rendimiento comparativos entre estos modelos en tareas de generación anclada a evidencia. CARE-OPD QZBC 4B se distingue por su especialización en respuestas estructuradas con verificación de fuentes, mientras que las alternativas son modelos generalistas sin ese enfoque específico.

## Limitaciones y advertencias

- No es un dispositivo médico ni debe usarse como sistema autónomo de diagnóstico, prescripción, dosificación, triaje o respuesta de emergencia.
- El checkpoint por sí solo no incluye el verificador, la política de recuperación, la validación de fuentes ni las salvaguardas clínicas; estos componentes deben implementarse externamente.
- Las salidas pueden ser incorrectas, no respaldadas, incompletas o excesivamente confiadas.
- El mayor beneficio se concentra en la condición de ausencia de fuente; el manejo de evidencia conflictiva sigue siendo una limitación importante.
- La validación fuera del dominio (OOD), multilingüe, demográfica y clínica es incompleta; la evidencia es más fuerte en el dominio de entrenamiento.
- El tokenizer incluye tokens especiales multimodales del modelo base, pero este release es solo texto y no incluye encoder de visión ni audio.
- La licencia Apache 2.0 permite uso comercial, pero el publicador debe confirmar que los datos de entrenamiento son sintéticos o están correctamente desidentificados y autorizados para su redistribución.
- No se ha confirmado la revisión exacta del modelo base Qwen3.5-4B utilizada, lo que puede afectar a la reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ximeng2639/care-opd-qzbc-4b-final
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de Transformers: https://huggingface.co/docs/transformers

No se han encontrado papers, repositorios adicionales ni demos asociados a este modelo en la búsqueda web.
