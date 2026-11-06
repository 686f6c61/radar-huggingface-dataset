# SZLHOLDINGS/szl-receiptagent-qwen25-1.5b-experimental-20261104

## Resumen

szl-receiptagent-qwen25-1.5b-experimental-20261104 es un adaptador PEFT (QLoRA) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se trata de un artefacto marcado explícitamente como experimental y "no canónico" por su propio autor: no sustituye a ninguna versión anterior del linaje receiptagent (`SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2`) ni a ninguna etiqueta de servicio en producción. El repositorio ocupa 0,1 GB y contiene únicamente los pesos del adaptador en safetensors, no el modelo completo.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-1.5B-Instruct, con aproximadamente 1.540 millones de parámetros y una ventana de contexto nativa de 32.768 tokens (según las especificaciones públicas de la familia Qwen2.5, no reproducidas en la model card del adaptador). El ajuste se ha orientado a tareas de tipo "receipt agent": procesamiento y validación de recibos, conformidad de borradores y rechazo adversarial, según los dos conjuntos de evaluación citados en la tarjeta.

Su relevancia es limitada y acotada: se publica como artefacto de trazabilidad interna con recibos firmados de entrenamiento y evaluación, sin datos de benchmarks estándar ni adopción comunitaria (0 descargas, 0 likes en el momento de la consulta). Resulta útil como referencia de reproducibilidad para el equipo que lo generó, no como modelo candidato para despliegue general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del base Qwen2.5-1.5B-Instruct); el repositorio contiene un adaptador PEFT/QLoRA |
| Parámetros totales | ~1.540 millones en el modelo base; el adaptador añade un número no especificado de parámetros entrenables (no disponible) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card; el base Qwen2.5-1.5B-Instruct soporta 32.768 tokens según especificaciones públicas de Qwen |
| Tipos de cuantización | no disponible (el adaptador se entrenó con QLoRA, lo que implica cuantización del base durante el entrenamiento, pero no se detalla el esquema) |
| Idiomas soportados | en (inglés), según la model card |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT); requiere cargar el base Qwen/Qwen2.5-1.5B-Instruct por separado |

## Arquitectura y entrenamiento

El adaptador se entrena sobre Qwen2.5-1.5B-Instruct, un transformer decoder-only con atención causal estándar, normalización RMSNorm, activación SwiGLU y RoPE para codificación posicional. El ajuste utiliza QLoRA, técnica que congela los pesos del base en precisión reducida y entrena matrices de bajo rango inyectadas en las capas de atención y MLP. No se especifican en la model card el rango, el alpha, las capas objetivo ni la composición del dataset de entrenamiento.

Los únicos datos cuantitativos publicados son la pérdida de entrenamiento (0,0984, respaldada por un recibo firmado) y dos evaluaciones internas: conformidad de borrador con 5/5 aciertos y rechazo adversarial con 4/6. El autor menciona un marco de gobernanza ("Rosa+Pliny+Aegis") requerido para promover el artefacto a canónico o servible, lo que sugiere un pipeline interno de validación por etapas. No se documentan fases de RLHF o DPO específicas para este adaptador, ni innovaciones arquitectónicas propias.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Qwen2.5-1.5B-Instruct.
- Procesamiento de recibos y documentos estructurados, según el propósito declarado del linaje "receiptagent".
- Conformidad de borradores: el modelo ha sido evaluado en una tarea interna de verificación de borradores (5/5 en el conjunto de evaluación citado).
- Rechazo adversarial: capacidad evaluada de declinar solicitudes fuera de política (4/6 en el conjunto citado, es decir, dos fallos).
- Soporte de tool calling y function calling: no disponible de forma específica para este adaptador; el base Qwen2.5-1.5B-Instruct soporta function calling según la documentación de Qwen, pero no hay evidencia de que el ajuste lo preserve.
- Razonamiento multi-paso y uso como agente: no evaluado en la información disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Validación interna de recibos en pipelines de contabilidad: el adaptador puede emplearse para comprobar la conformidad de borradores de recibos antes de su registro, aprovechando la tarea de "draft-conformance" sobre la que fue evaluado.
- Filtrado de solicitudes fuera de política: dado su entrenamiento en rechazo adversarial, puede usarse como capa de moderación en flujos internos donde se requiera declinar peticiones no permitidas, aceptando la tasa de fallo observada (2 de 6).
- Reproducción de experimentos de QLoRA: sirve como artefacto de referencia para replicar el pipeline de ajuste con recibos firmados de entrenamiento y evaluación.
- Pruebas de regresión de gobernanza: útil para validar el marco "Rosa+Pliny+Aegis" antes de promover adaptadores a etiquetas canónicas.
- Prototipado rápido en local: al ser un adaptador de 0,1 GB sobre un base de 1,5B, cabe en GPU de consumo y permite iterar sin infraestructura dedicada.
- Evaluación comparativa de linajes receiptagent: permite contrastar el comportamiento frente a `szl-receiptagent-qwen35-0.8b-v2` en las mismas tareas internas.

## Benchmarks y rendimiento

| Evaluación | Resultado | Fuente |
|---|---|---|
| Pérdida de entrenamiento | 0,0984 | Recibo de entrenamiento firmado |
| Draft-conformance | 5/5 | Recibo de evaluación firmado (2026-11-04) |
| Adversarial-refusal | 4/6 | Recibo de evaluación firmado (2026-11-04) |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para el adaptador: despreciable (~0,1 GB en safetensors); el coste real lo determina el modelo base.
- Modelo base en FP16: aproximadamente 3 GB de VRAM para los pesos, más KV cache y overhead.
- Modelo base en 4 bits (QLoRA/bitsandbytes): aproximadamente 1 GB de VRAM para pesos, más overhead.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes. Cabe en GPU de consumo.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base con transformers + peft; para servicio se puede fusionar el adaptador y exportar a vLLM, TGI o llama.cpp (previa conversión a GGUF).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| szl-receiptagent-qwen25-1.5b-experimental-20261104 | ~1,5B (base) + adaptador | no disponible (base: 32.768) | apache-2.0 | Hugging Face, 0 descargas | Experimental, no canónico, solo inglés |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 | apache-2.0 | Hugging Face, ampliamente adoptado | Base sin ajuste específico de recibos |
| SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2 | ~0,8B (base) | no disponible | no disponible | Hugging Face | Versión previa del linaje, referenciada como canónica por el autor |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Artefacto marcado explícitamente como experimental y "not-canonical": no debe sustituir a versiones canónicas ni desplegarse en servicio sin pasar el marco de gobernanza del autor.
- Evaluación muy reducida: 5 y 6 ejemplos en los conjuntos citados; insuficiente para inferir robustez en producción.
- Tasa de fallo en rechazo adversarial del 33 % (2 de 6), relevante si se usa como capa de moderación.
- Solo inglés declarado; no se garantiza comportamiento en castellano ni otros idiomas.
- Riesgo de alucinación inherente a un modelo de 1,5B, especialmente en extracción de campos de recibos.
- Sin datos publicados sobre sesgos, composición del dataset de entrenamiento ni evaluación de seguridad más allá del conjunto adversarial citado.
- Licencia apache-2.0 permite uso comercial, pero la falta de documentación sobre el dataset de ajuste impide verificar el cumplimiento de derechos de terceros.
- Requiere cargar el modelo base por separado; el repositorio no es autónomo para inferencia.
- Sin tracción comunitaria (0 descargas, 0 likes): no hay validación externa del comportamiento.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen25-1.5b-experimental-20261104
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Versión previa del linaje: https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v2
- Recibos de entrenamiento y evaluación: carpeta `receipts/` del repositorio (no se proporciona URL directa)
- Paper o blog del adaptador: no disponible
