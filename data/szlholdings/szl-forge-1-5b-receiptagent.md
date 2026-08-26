# SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent

## Resumen

SZL-Forge-1.5B-ReceiptAgent es un ajuste fino de tipo agente gobernado y de solo propuesta, desarrollado por SZLHOLDINGS sobre la base de Qwen/Qwen2.5-1.5B-Instruct. El modelo está diseñado para operar dentro de un límite de control: genera borradores de decisión en JSON con evidencia vinculada y requiere aprobación humana antes de cualquier ejecución. No finaliza, no ejecuta y se niega explícitamente cuando se le pide sobrepasar ese límite.

El modelo se entrenó con QLoRA SFT, enmascaramiento de pérdida solo en respuestas y sobremuestreo de negativas adversariales. El repositorio incluye recibos firmados con ed25519 que certifican el entrenamiento y la evaluación, y el backbone Alloy verifica de forma independiente la procedencia de los pesos. Con 1.543.714.304 parámetros y licencia Apache-2.0, es un modelo pequeño orientado a tareas de gobernanza de decisiones, no a generación generalista.

Su relevancia actual radica en el enfoque de procedencia verificable: cada afirmación de capacidad está respaldada por una firma criptográfica y los resultados de evaluación se reportan como REPORTED (producidos en metal del propietario), no medidos por terceros. Esto lo convierte en un caso de estudio interesante para despliegues donde la trazabilidad y la auditoría son críticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2, basada en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen2.5-1.5B-Instruct, tipicamente 32.768 tokens) |
| Tipos de cuantizacion | safetensors (merged) + LoRA adapter; GGUF derivado no cubierto por la firma |
| Idiomas soportados | no disponibles (el modelo base Qwen2.5 soporta multiples idiomas, pero no se especifica para este ajuste) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (merged) + safetensors (LoRA) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino QLoRA SFT sobre Qwen/Qwen2.5-1.5B-Instruct, con enmascaramiento de pérdida solo en respuestas y sobremuestreo de negativas adversariales (el conjunto de negativas se mantiene fuera del entrenamiento). El entrenamiento se realizó el 2026-07-13T21:33:44Z en el host `betterwithage`, con una pérdida final de entrenamiento de 0,1038 (reportada por el propietario). El currículo es determinista: borradores sintéticos validados por esquema y negativas, con cada archivo de dataset fijado por sha256 en el recibo.

La innovación técnica destacable no está en la arquitectura (que es la de Qwen2.5) sino en el sistema de gobernanza: los pesos merged están vinculados a un hash determinista (`weightsArtifactSha256`) sobre los safetensors ordenados, y el adapter LoRA está vinculado por `adapterSha256`. Los recibos de entrenamiento y evaluación están firmados con ed25519 y encadenados por hash (`eval.trainingReceiptSha256` == `sha256(trainingCanonical)`). El backbone Alloy re-verifica todo esto por petición y expone el veredicto en `/api/forge/family`.

## Capacidades

- Generación de borradores de decisión en JSON conforme al esquema ReceiptAgent: `decision=DRAFT`, `approvalRequired=true`, `executed=false`, `provenance=MODEL_PROPOSED`, `receiptBinding.status=NOT_BOUND`.
- Citación de fuentes de evidencia con etiquetas honestas: `MEASURED / REPORTED / DECLARED / SIMULATED / UNKNOWN / UNAVAILABLE`.
- Negativa ante peticiones que sobrepasen el límite de solo propuesta (refusal oversampling en entrenamiento).
- Integración con el backbone Alloy para validación de argumentos, control de aprobación humana y ejecución fuera de los pesos.
- Compatible con text-generation-inference y endpoints de HuggingFace.
- Soporte de chat conversacional mediante plantilla de chat de Qwen2.5.

## Casos de uso

- Gobernanza de límites de gasto: el modelo puede redactar una propuesta de aumento del límite de gasto móvil de 24 horas, citando la evidencia disponible y marcando la decisión como DRAFT con aprobación requerida.
- Revisión de políticas internas: dado un cambio de política propuesto, el modelo genera un borrador de decisión con fuentes etiquetadas (REPORTED, MEASURED, etc.) para que un humano lo apruebe o rechace.
- Auditoría de procedencia: el modelo puede integrarse en pipelines donde cada decisión deba quedar registrada con un recibo firmado, permitiendo verificación independiente de la cadena de entrenamiento y evaluación.
- Asistente de cumplimiento normativo: ante una consulta sobre si una acción cumple una normativa, el modelo propone un borrador con evidencia citada y se niega si se le pide ejecutar la acción directamente.
- Automatización de aprobaciones en entornos controlados: el modelo actúa como proponente dentro de un controlador (Alloy) que valida argumentos, exige aprobación humana y ejecuta solo después de la autorización.
- Entrenamiento y evaluación reproducible: el kit SZL Forge permite reproducir byte a byte el entrenamiento y la evaluación, útil para equipos que necesitan auditoría de modelos en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluación reportada por el propietario (REPORTED, no MEASURED por terceros) sobre un currículo held-out es:

| Metrica | Resultado |
|---|---|
| Draft-conformance (borradores validos por esquema) | 5 / 5 (100%) |
| Adversarial-refusal (negativas correctas ante overstep) | 6 / 6 (100%) |
| Sanity gate (reproduccion del train-set, pre-eval) | drafts 15/15 · refusals 8/8 |

Estos datos provienen de `eval_receipt.signed.json` y no son comparables con benchmarks estandar como MMLU o HumanEval.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1,5B parámetros, cabe en GPUs consumer con 8 GB o menos en cuantizacion FP16/BF16; con cuantizacion de 4 bits (GGUF derivado) puede ejecutarse en 4-6 GB.
- GPU recomendadas: RTX 3060, RTX 4060, RTX 4090, o cualquier GPU con al menos 8 GB de VRAM para FP16. Para despliegue en produccion, A10 o A100 son suficientes.
- Cabe en consumer GPU: sí, en GPUs de 8 GB o más.
- Opciones de despliegue: transformers (con `device_map="auto"`), text-generation-inference, FriendliAI, llama.cpp/Ollama (via GGUF derivado, no cubierto por la firma).
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser un modelo de 1,5B, la latencia esperada es baja (del orden de decenas de milisegundos por token en GPUs modernas).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SZL-Forge-1.5B-ReceiptAgent | 1,5B | no disponible (heredado de Qwen2.5) | Apache-2.0 | Agente gobernado, solo propuesta, procedencia firmada |
| Qwen2.5-1.5B-Instruct (base) | 1,5B | 32.768 tokens | Apache-2.0 | Chat generalista, sin gobernanza |
| Llama-3.2-1B-Instruct | 1,2B | 128K tokens | Llama 3.2 Community License | Chat generalista, sin gobernanza |

La comparativa directa con otros modelos de la misma categoria (agentes gobernados con procedencia verificable) no esta disponible en la informacion proporcionada. La diferencia clave frente a la base es el comportamiento de solo propuesta y el sistema de recibos firmados.

## Limitaciones y advertencias

- Los resultados de entrenamiento y evaluacion son REPORTED (producidos en metal del propietario), no MEASURED por un tercero independiente.
- El ancla de confianza es REPO_DECLARED (la clave publica viaja en el repositorio); solo se convierte en PINNED si el operador fija el `keyId` fuera de banda.
- Los archivos GGUF son derivados y no estan cubiertos por el hash firmado de los pesos; usarlos implica confiar en la conversion sin garantia de procedencia.
- El modelo no ejecuta acciones ni finaliza decisiones; cualquier integracion debe respetar el limite de solo propuesta y requerir aprobacion humana explicita.
- No se especifican idiomas soportados ni limitaciones de contexto; se heredan las del modelo base Qwen2.5-1.5B-Instruct, pero no hay garantia de rendimiento multilingue en este ajuste.
- Riesgo de alucinacion: el modelo esta entrenado para etiquetar evidencia con honestidad, pero no se han publicado evaluaciones independientes sobre datasets estandar; la tasa de negativa adversarial es la metrica de honestidad reportada, no la conformance.
- La licencia Apache-2.0 permite uso comercial, pero el operador puede cambiarla en cualquier momento segun la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent
- Discusiones del modelo: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent/discussions
- Repositorio SZL Forge (GitHub): https://github.com/szl-holdings/szl-forge
- Pagina del modelo en FriendliAI: https://friendli.ai/models/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent
- Recibo de entrenamiento firmado: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent/blob/main/training_receipt.signed.json
- Recibo de evaluacion firmado: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent/blob/main/eval_receipt.signed.json
- Esquema de salida: https://huggingface.co/SZLHOLDINGS/SZL-Forge-1.5B-ReceiptAgent/blob/main/receiptagent.schema.json
