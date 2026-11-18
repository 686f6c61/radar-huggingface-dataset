# SZLHOLDINGS/SZL-Khipu-1.5B-GGUF

## Resumen

SZL-Khipu-1.5B-GGUF es la versión cuantizada en formato GGUF del modelo SZL-Khipu-1.5B, un ajuste fino de Qwen/Qwen2.5-1.5B-Instruct desarrollado por SZL Holdings. El modelo está diseñado específicamente para una tarea acotada: proponer planes de recuperación (retrieval plans) en formato JSON sobre un conjunto de identificadores (handles) candidatos suministrados por un controlador externo. No ejecuta dichos planes, no accede a ningún grafo privado y no emite recibos firmados; su función es exclusivamente de propuesta.

El artefacto se distribuye como cuantizaciones GGUF (F16, Q4_K_M, Q5_K_M y Q8_0) para su uso con llama.cpp, con un total de 1.543.714.304 parámetros y una licencia Apache 2.0. El modelo se encuentra en fase de investigación y su promoción a producción está explícitamente bloqueada por el autor, que documenta un fallo de abstención en la evaluación del modelo pre-cuantizado (2/6).

La relevancia de esta ficha radica en su naturaleza deliberadamente limitada y en la trazabilidad documental que acompaña al artefacto: recibos de entrenamiento y evaluación firmados con Ed25519, identidades de fichero con SHA-256 y un contrato de prompt definido mediante esquema JSON. Es un ejemplo de publicación de artefacto de investigación con alcance restringido y evidencias verificables, más que un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-1.5B-Instruct) |
| Parámetros totales | 1.543.714.304 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es Qwen2.5-1.5B-Instruct (revisión upstream `989aa7980e4cf806f80c7fef2b1adb7bc71aa306`), sobre el que SZL Holdings realizó un ajuste fino supervisado para una tarea de planificación de recuperación. La revisión del modelo padre ajustado es `759c6112b1acae67f30351ef4e652e07671a42fb`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en la información proporcionada.

La innovación principal no reside en la arquitectura, sino en el contrato de uso: el modelo recibe una consulta y un conjunto de handles candidatos, y debe producir un plan JSON con una acción NAVIGATE o ABSTAIN, validable contra el esquema `khipu.schema.json`. El autor documenta recibos de entrenamiento y evaluación firmados con Ed25519 sobre JSON canónico (no envoltorios DSSE), con una clave pública declarada en el repositorio. La evaluación held-out del modelo pre-cuantizado reporta plan-validity 11/11, grounding 4/5 y abstención 2/6.

## Capacidades

- Generación de planes de recuperación en JSON sobre handles suministrados por un controlador.
- Emisión de decisiones binarias NAVIGATE o ABSTAIN conforme al esquema del contrato de prompt.
- Generación de texto conversacional heredada del modelo base Qwen2.5-1.5B-Instruct.
- Capacidad de abstención (limitada: 2/6 en la evaluación registrada).
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes multi-paso: no disponible; el modelo solo propone, no ejecuta.
- Capacidades multilingües: únicamente inglés declarado.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Planificación de recuperación en pipelines de búsqueda: el modelo recibe una consulta y un conjunto de handles candidatos y propone qué rutas navegar, integrándose como etapa de planificación previa a un ejecutor controlado que retiene la autorización.
- Investigación sobre abstención selectiva: el fallo documentado de abstención (2/6) lo convierte en un artefacto útil para estudiar calibración y rechazo en modelos pequeños dentro de entornos de investigación.
- Evaluación de contratos de prompt estructurados: sirve para experimentar con salidas JSON validables mediante esquema, midiendo validez de plan en pipelines con verificación posterior.
- Demostraciones de trazabilidad de artefactos: su cadena de recibos firmados, digests SHA-256 y revisiones pinneadas lo hacen adecuado para prototipos de gobernanza de modelos y auditoría de linaje.
- Pruebas de cuantización en llama.cpp: las cuatro variantes GGUF permiten estudiar el comportamiento de un modelo de 1,5B en distintos niveles de precisión, aunque el autor no establece comparativas de calidad post-cuantización.
- Prototipos de enrutamiento en sistemas RAG con controlador externo: el modelo puede proponer rutas de navegación sobre un índice de handles en entornos de laboratorio donde la ejecución y la firma de recibos quedan fuera del modelo.
- Despliegue en CPU para servicios de baja carga: el registro histórico de publicación menciona una sonda de servicio en CPU con latencia mediana de 1467,5 ms en dos ejecuciones, útil como referencia orientativa, no como SLA.

## Benchmarks y rendimiento

Los únicos resultados registrados corresponden a la evaluación held-out del modelo pre-cuantizado, no a los ficheros GGUF:

| Métrica | Resultado (modelo pre-cuantizado) |
|---|---|
| Plan-validity | 11/11 |
| Grounding | 4/5 |
| Abstención | 2/6 |

El autor indica explícitamente que no se ha establecido ningún resultado comparativo de calidad post-cuantización ni de memoria en tiempo de ejecución. La sonda histórica de servicio en CPU reporta una latencia mediana de 1467,5 ms en dos ejecuciones, sin datos de energía ni de memoria pico de proceso. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; según el tamaño de fichero, Q4_K_M ocupa 986.047.904 bytes (~0,92 GB), Q5_K_M 1.125.049.760 bytes (~1,05 GB), Q8_0 1.646.572.448 bytes (~1,53 GB) y F16 3.093.668.768 bytes (~2,88 GB). El tamaño de fichero no equivale al pico de memoria en ejecución.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería poder alojar las variantes cuantizadas, aunque el autor no lo certifica.
- Cabe en GPU consumer: previsiblemente sí para Q4_K_M, Q5_K_M y Q8_0; sin validación oficial.
- Opciones de despliegue: llama.cpp con una revisión pinneada y verificada; el autor exige seleccionar una revisión exacta del GGUF y un runtime compatible.
- Latencia y throughput: solo se documenta una sonda histórica en CPU con mediana de 1467,5 ms en dos ejecuciones; no hay datos de throughput ni de latencia en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| SZL-Khipu-1.5B-GGUF | 1,54B | no disponible | Apache 2.0 | Planificación de retrieval, proposal-only | GGUF en Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | no disponible en esta ficha | Apache 2.0 | Instrucciones generales | safetensors y GGUF en Hugging Face |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa con Qwen2.5-1.5B-Instruct es la más pertinente por linaje, pero no se dispone de resultados de benchmarks comparativos en la información proporcionada. No se identifican otras alternativas comparables en la documentación del artefacto.

## Limitaciones y advertencias

- Uso exclusivamente de propuesta: el controlador retiene la autorización, la ejecución y la firma de recibos de confianza; el modelo no accede a ningún grafo privado.
- Promoción a producción bloqueada por el autor: el fallo de abstención 2/6 del modelo pre-cuantizado sigue siendo un bloqueante de release y la cuantización no lo resuelve.
- Sin evaluación post-cuantización: no se ha establecido calidad, velocidad ni memoria comparativas para ninguno de los ficheros GGUF.
- Sin recibo de release firmado que cubra los bytes GGUF: la firma del modelo padre no cubre los derivados salvo que el digest exacto esté incluido en el sujeto firmado.
- Verificación de firmas no repetida por el revisor de la model card; la identidad externa del firmante no está establecida de forma independiente.
- Solo inglés declarado; sin soporte multilingüe documentado.
- Riesgo de alucinación inherente a un modelo de 1,5B en tareas de planificación estructurada; la validez de plan debe verificarse contra el esquema.
- La latencia de 1467,5 ms corresponde a una sonda histórica en CPU de dos ejecuciones y no constituye un SLA ni una garantía de reproducibilidad tras reinicio.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y el bloqueo de promoción desaconsejan su uso en producción sin evaluación propia.
- Requiere pinneado exacto de revisión y runtime compatible; no se garantiza un build de cuantización reproducible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF
- Revisión revisada del Hub: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF/tree/7c39154b22ccb5e2151b4dd53e0d36965dfbc920
- Registro de publicación: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF/blob/7c39154b22ccb5e2151b4dd53e0d36965dfbc920/publication.json
- Esquema del contrato de prompt: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B-GGUF/blob/7c39154b22ccb5e2151b4dd53e0d36965dfbc920/khipu.schema.json
- Modelo base: https://huggingface.co/SZLHOLDINGS/SZL-Khipu-1.5B
- Modelo upstream: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio Forge (build GGUF): https://github.com/szl-holdings/szl-forge/tree/main/khipu-gguf
- Evidencia de la model card: https://github.com/szl-holdings/szl-forge/blob/2b4d7a0f69e68d60cb0f35f09c9bac837d66acdc/khipu-gguf/card/README.md
- Árbol de currículo, esquema y recibos: https://github.com/szl-holdings/szl-forge/tree/cddba1ad9887211d6fd87386e98bb6707f16dbf5/khipu
- Demo Command Lab: https://huggingface.co/spaces/SZLHOLDINGS/szl-command-lab
