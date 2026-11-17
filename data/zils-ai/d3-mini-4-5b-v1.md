# zils-ai/d3-mini-4.5b-v1

## Resumen

d3-mini-4.5b-v1 es un espejo (mirror) publicado por zils-ai del modelo `vllm-sr/d3-mini`, un modelo de decisión de 4.539.265.536 parámetros (~4,5B) derivado del modelo base Qwen/Qwen3.5-4B. El repositorio no introduce pesos nuevos: según la model card, se trata de una copia byte a byte de los 25 ficheros de modelo y runtime del repositorio original en la revisión `a475367de0d8133a3c1a2a0dc12303d89cfa2ab4`, excluyendo el README del proveedor y el directorio `assets/`. La motivación declarada es la fijación de una revisión concreta (pinning) para que mineros y validadores de la red Zils descarguen exactamente los mismos ficheros, con hashes SHA-256 registrados en el fichero de pins del perfil.

El modelo se etiqueta como `decision-model`, lo que sugiere un uso orientado a la toma de decisiones dentro del ecosistema Zils (mineros y validadores), aunque la información disponible no detalla el pipeline ni la tarea exacta. La arquitectura declarada en los tags de Hugging Face es `qwen3_5`, lo que lo vincula a la familia Qwen3.5, y el repositorio incluye código personalizado (`custom_code`), lo que implica que la carga del modelo requiere `trust_remote_code=True` o el runtime específico del proveedor.

La relevancia actual del modelo es fundamentalmente de reproducibilidad: al ser un espejo con pesos idénticos a la release fundacional `z3-mini v1` (según indica el propio autor), sirve como referencia estable para infraestructuras que dependen de una revisión inmutable. No obstante, el autor recomienda usar `zils-ai/z3-mini-v1` como release activa, dejando este repositorio como compatibilidad fijada para perfiles existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5 (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (~4,5B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (+ código personalizado y ficheros de runtime) |

## Arquitectura y entrenamiento

La información disponible solo permite afirmar que el modelo pertenece a la familia Qwen3.5 (tag `qwen3_5`) y que su modelo base inmediato es `vllm-sr/d3-mini`, a su vez derivado de Qwen/Qwen3.5-4B. El repositorio incluye código personalizado (`custom_code`), lo que indica que la arquitectura o el runtime no se cargan con la implementación estándar de Transformers sin configuración adicional. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas concretas (atención lineal, decodificación especulativa, etc.).

Respecto al ajuste fino: los tags de Hugging Face indican `base_model:finetune:vllm-sr/d3-mini`, por lo que este modelo es un fine-tune del modelo `d3-mini` del proveedor, no un simple mirror de Qwen3.5-4B. La model card aclara que los pesos no fueron modificados respecto a `vllm-sr/d3-mini` en la revisión fijada, de modo que el ajuste fino (si lo hubo) se realizó en el repositorio del proveedor, no en este espejo. No hay información pública sobre la naturaleza del ajuste (supervisado, preferencias, RL) ni sobre la tarea de decisión objetivo.

## Capacidades

- Generación de texto y razonamiento general: heredadas del modelo base Qwen3.5-4B, aunque no se documentan evaluaciones específicas.
- Modelo de decisión (`decision-model`): etiqueta del autor que sugiere uso para tareas de decisión dentro del ecosistema Zils; no se detalla el formato de entrada/salida.
- Código personalizado: requiere cargar con el runtime del proveedor o `trust_remote_code=True`; no se documentan capacidades de tool calling ni function calling.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Reproducibilidad de pipelines de mineros y validadores Zils: el repositorio fija una revisión concreta con hashes SHA-256 por fichero, de modo que cualquier nodo de la red descarga exactamente los mismos pesos y runtime, eliminando divergencias por actualizaciones del repositorio original.
- Auditoría de modelos en producción: al ser un espejo byte a byte de una revisión identificada, permite verificar que el modelo desplegado coincide con el auditado, algo útil en entornos con requisitos de trazabilidad.
- Compatibilidad con perfiles existentes: los perfiles de modelo que apuntan a `d3-mini-4.5b-v1` siguen funcionando aunque la release activa sea `z3-mini-v1`, evitando migraciones forzadas.
- Fine-tuning sobre una base estable: al disponer de pesos fijados y licencia Apache-2.0, se puede usar como punto de partida para ajustes posteriores con garantía de que la base no cambia entre ejecuciones.
- Evaluación comparativa de modelos de decisión: sirve como referencia fija para comparar el comportamiento de `z3-mini-v1` y otras variantes frente a la revisión original.
- Despliegue en entornos con verificación de integridad: el registro de hashes permite integrar la descarga en pipelines de CI/CD que validen la integridad de los artefactos antes de servir el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (4,5B parámetros), en FP16 se requieren aproximadamente 9 GB solo para pesos, más overhead de KV cache y runtime; en cuantización de 8 bits rondaría 4,5-5 GB y en 4 bits unos 2,5-3 GB. Estos cálculos son estimaciones por tamaño, no datos del autor.
- GPU recomendadas: no disponible. Por tamaño, cabría en GPUs consumer con 8-12 GB de VRAM en cuantización, y en A100/H100 para FP16 con contexto largo.
- ¿Cabe en GPU consumer? Probablemente sí en cuantización (8-12 GB), pero no se documenta soporte de GGUF ni de llama.cpp en el repositorio.
- Opciones de despliegue: el repositorio incluye código personalizado y ficheros de runtime del proveedor; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI. El nombre del modelo base (`vllm-sr/d3-mini`) sugiere un runtime propio del proveedor, pero no se detalla.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-ai/d3-mini-4.5b-v1 | ~4,5B | no disponible | Apache-2.0 | Hugging Face (espejo fijado) | Fine-tune de Qwen3.5-4B vía `vllm-sr/d3-mini`; código personalizado |
| zils-ai/z3-mini-v1 | no disponible (pesos idénticos según el autor) | no disponible | Apache-2.0 | Hugging Face | Release activa recomendada por el autor |
| vllm-sr/d3-mini | no disponible | no disponible | Apache-2.0 | Hugging Face | Repositorio original del proveedor; base de este espejo |
| Qwen/Qwen3.5-4B | ~4B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face | Modelo base de la familia Qwen3.5 |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Es un espejo, no una release nueva: el autor recomienda usar `zils-ai/z3-mini-v1`; este repositorio existe para compatibilidad con perfiles ya fijados.
- Requiere código personalizado: la carga estándar de Transformers puede fallar sin el runtime del proveedor o sin `trust_remote_code=True`; conviene auditar el código antes de ejecutarlo en producción.
- Idiomas no documentados: no se especifica qué idiomas soporta; no asumir multilingüismo sin validación.
- Contexto no documentado: se desconoce la longitud máxima de contexto, lo que impide planificar despliegues con ventanas largas.
- Benchmarks ausentes: no hay evaluaciones publicadas que permitan estimar calidad, riesgo de alucinación o sesgos.
- Sesgos y alucinaciones: no documentados; al heredar el comportamiento de Qwen3.5-4B y de un fine-tune no auditado públicamente, deben evaluarse en el dominio de uso.
- Licencia Apache-2.0: permite uso comercial, pero deben conservarse los ficheros `LICENSE` y `NOTICE` y verificar las obligaciones de atribución del modelo base Qwen.
- Tamaño del repositorio (9,1 GB): la descarga y el almacenamiento deben planificarse; el pin por SHA-256 añade pasos de verificación en pipelines.

## Enlaces

- Hugging Face: https://huggingface.co/zils-ai/d3-mini-4.5b-v1
- Release activa recomendada: https://huggingface.co/zils-ai/z3-mini-v1
- Repositorio original del proveedor: https://huggingface.co/vllm-sr/d3-mini
- Revisión fijada del proveedor: `a475367de0d8133a3c1a2a0dc12303d89cfa2ab4`
