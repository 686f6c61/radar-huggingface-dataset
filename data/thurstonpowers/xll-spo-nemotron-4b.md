# thurstonpowers/xll-spo-nemotron-4b

## Resumen

XLL SPO Nemotron 4B es un ajuste fino de pesos completos del modelo base NVIDIA Nemotron-3 Nano 4B, desarrollado por el usuario thurstonpowers. Su propósito es muy concreto: extraer relaciones legales orientadas a actores (sujeto-predicado-objeto) a partir de estatutos y reglamentos federales y estatales de Estados Unidos, devolviendo un array JSON de aserciones donde el sujeto es el actor semántico que ostenta un permiso, derecho u obligación, el predicado preserva la modalidad y la negación, y el objeto es el destino, entidad o significado definido. La versión v1.1 introduce un contrato de actor que rompe la compatibilidad con el checkpoint v3 anterior (orientado a provisiones), que sigue siendo citable por hash de commit en el historial del repositorio.

El modelo resuelve un problema de ingeniería jurídica: convertir texto normativo denso en tripletas estructuradas y verificables, con citas de evidencia exactas, para alimentar pipelines de cumplimiento, análisis regulatorio o construcción de grafos de conocimiento legal. No es un modelo conversacional generalista ni un asistente jurídico; es un extractor especializado con un contrato de entrada y salida congelado (prompt de sistema fijo con sha256 verificable, envoltura `<section_text>` y decodificación greedy en la evaluación).

Con 3.973.556.832 parámetros (aproximadamente 4B), licencia NVIDIA Nemotron Open Model License y solo inglés, su relevancia radica en la reproducibilidad estricta: revisiones fijadas por commit, hash de datos de entrenamiento y métricas de agreement publicadas sobre un holdout revisado de 300 secciones del CFR. Los resultados, sin embargo, son moderados (SPO F1 0.4237), lo que lo sitúa como una herramienta de preextracción con revisión humana obligatoria, no como un sustituto de la adjudicación semántica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H (transformer híbrido, según tag `nemotron_h` del modelo base) |
| Parametros totales | 3.973.556.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo más largo de entrenamiento fue de 19.452 tokens sin truncar; la generación de evaluación usa `max_new_tokens=16384`) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el repo ocupa 23,9 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | NVIDIA Nemotron Open Model License (`license: other`) |
| Formato de pesos | safetensors (librería `transformers`, con `custom_code`) |

## Arquitectura y entrenamiento

El modelo parte de NVIDIA Nemotron-3 Nano 4B en bfloat16 (tag `nemotron_h`, que corresponde a la familia híbrida Nemotron-H de NVIDIA) y se somete a un ajuste fino de todos los parámetros, no a un adaptador LoRA. El entrenamiento se ejecutó en la flota DGX Spark y consta de 7.462 ejemplos (4.660 únicos, con los objetivos reparados repetidos tres veces), 2 épocas y 3.732 actualizaciones, learning rate de 5e-6 con 125 actualizaciones de warmup y decaimiento coseno hasta 0,1, batch efectivo de 4 y semilla 102301. El ejemplo más largo alcanzó 19.452 tokens sin truncamiento, y la política de reinicio fue `fresh_only`, sin reanudación automática ni reentrenamiento de los pesos finales. El hash sha256 del dataset de entrenamiento es `b27b4bd55329547599254954219092e02c137fa19f5404204387dc05e7b6a98a`, y los datos provienen del subárbol `v1.1/` del dataset `thurstonpowers/xll-spo-dataset`, con una partición de desarrollo disjunta por grupo de partes del CFR.

La innovación técnica no está en la arquitectura, sino en el contrato de tarea: un prompt de sistema congelado (sha256 `608281b35038ea922e4290cba6487afbd720adeac6200af534289d89489f913e`), una entrada estrictamente `<section_text>\n\n{texto}</section_text>` sin preprocesamiento (sin POS tagging, tokenización ni anotación), y una salida JSON con campos `subject` (raw/citation/resolved_to), `predicate_text`, `object` u `object_literal`, `quote` con localizador exacto, `negated`, `qualifiers`, `participants` y `unresolved_reason`. La evaluación se realiza con decodificación greedy y emparejamiento superficial normalizado estricto contra referencias revisadas, no con adjudicación semántica.

## Capacidades

- Extracción de relaciones sujeto-predicado-objeto (SPO) orientadas a actor desde secciones de estatutos y reglamentos de EE. UU.
- Preservación de modalidad (permiso, obligación, definición, otros) y de negación en el predicado.
- Generación de citas de evidencia exactas con localizador (`quote`), con una tasa de spans exactos del 99,5–100 % en todas las franjas de densidad.
- Salida estructurada en JSON validable (298 de 300 secciones devolvieron arrays JSON válidos en la evaluación).
- Resolución de referencias del sujeto (`raw`, `citation`, `resolved_to`) y registro de motivos de no resolución (`unresolved_reason`).
- Captura de cualificadores y participantes adicionales de la relación.
- Conversacional en el sentido de plantilla de chat (`apply_chat_template`), pero con prompt de sistema congelado y no modificable según el contrato.
- Sin soporte declarado de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento explícito.
- Multilingüe: no; únicamente inglés.

## Casos de uso

- Extracción masiva de obligaciones regulatorias: procesar secciones del CFR y obtener tripletas de obligación con cita exacta para alimentar un registro de cumplimiento interno, aprovechando la alta tasa de spans de evidencia exactos.
- Construcción de grafos de conocimiento legal: usar las aserciones con `subject.resolved_to` y `object` para poblar un grafo de actores, permisos y entidades definidas, con revisión humana de las relaciones de definición (las de menor F1).
- Preextracción para revisión jurídica asistida: generar un borrador de aserciones que un abogado o analista valida, reduciendo el tiempo de lectura de secciones densas (aunque en secciones de 6+ aserciones el recall cae a 0,385).
- Auditoría de cambios normativos: comparar las tripletas extraídas de dos versiones de una sección para detectar cambios de modalidad o de sujeto obligado, usando el `quote` como anclaje verificable.
- Enriquecimiento de bases de datos de cumplimiento: mapear cada obligación a un actor y un objeto normalizados para consultas posteriores, con la advertencia de que las paráfrasis pueden no coincidir con el matcher superficial.
- Investigación en NLP jurídico: servir como baseline reproducible (commit fijado, hash de datos, prompt congelado) para comparar extractores de relaciones legales sobre el mismo holdout de 300 secciones.
- Detección de definiciones y términos definidos: extraer relaciones de definición para glosarios, si bien es la categoría más débil (F1 0,338) y requiere revisión obligatoria.

## Benchmarks y rendimiento

Resultados regenerados para los pesos v1.1 sobre el holdout de desarrollo de 300 secciones del CFR revisadas, con decodificación greedy, prompts congelados y emparejamiento superficial estricto:

| Franja de densidad | Secciones | Precisión | Recall | F1 |
|---|---|---|---|---|
| 1–2 aserciones gold | 77 | 0.438 | 0.475 | 0.455 |
| 3–5 aserciones gold | 94 | 0.509 | 0.513 | 0.511 |
| 6+ aserciones gold | 127 | 0.422 | 0.385 | 0.402 |

Por tipo de relación (modalidad): permiso F1 0,478; obligación F1 0,440; otros F1 0,386; definición F1 0,338.

Evaluación global del holdout:

| Métrica | Valor |
|---|---|
| Secciones con array JSON válido | 298/300 (1 por tope de generación) |
| Aserciones predichas vs gold | 1.756 vs 1.893 |
| Spans de evidencia exactos | 1.750 |
| SPO F1 (precisión / recall) | 0.4237 (0.4402 / 0.4083) |
| F1 con cualificadores y participantes | 0.3025 |

La model card menciona una tabla comparativa de tarea con otros modelos de la misma cohorte, pero el contenido proporcionado se interrumpe antes de mostrar los datos, por lo que no se incluyen cifras comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 8 GB solo para pesos (3,97B parámetros × 2 bytes), más caché KV y activaciones; el repo completo ocupa 23,9 GB, lo que sugiere que incluye checkpoints u otros artefactos además de los pesos finales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o DGX Spark (plataforma usada para el entrenamiento); con 16 GB de VRAM en bfloat16 debería ser viable para secciones individuales, aunque no hay datos publicados de latencia ni throughput.
- GPU de consumo: cabe en tarjetas con 16 GB o más (RTX 4090, RTX 4080, RTX 3090) en bfloat16; en cuantizaciones de 8 o 4 bits no se han publicado pesos GGUF ni cuantizaciones oficiales.
- Despliegue: `transformers` con `AutoModelForCausalLM` y `custom_code` (la arquitectura Nemotron-H requiere cargar código personalizado); no se documentan recetas para vLLM, llama.cpp, Ollama o TGI, y la ausencia de GGUF limita el despliegue en llama.cpp/Ollama.
- Latencia y throughput: no disponibles. La generación de evaluación usa `max_new_tokens=16384` con decodificación greedy, lo que implica secuencias de salida potencialmente largas para secciones densas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL SPO Nemotron 4B (v1.1) | 3,97B | no disponible | Extracción SPO legal (CFR) | NVIDIA Nemotron Open Model License | HuggingFace |
| NVIDIA Nemotron-3 Nano 4B | ~4B | no disponible | Modelo base generalista | NVIDIA Nemotron Open Model License | HuggingFace |
| Checkpoint v3 (checkpoint-2400) del mismo repo | ~4B | no disponible | Extracción orientada a provisiones (duty/permission/party) | NVIDIA Nemotron Open Model License | Historial de commits del repo |

No se dispone de datos de benchmarks de modelos alternativos de extracción de relaciones legales en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- Rendimiento moderado: SPO F1 de 0,4237 y F1 con cualificadores y participantes de 0,3025; no es apto para uso autónomo sin revisión humana.
- Las métricas son de agreement con emparejamiento superficial estricto, no de exactitud semántica: las paráfrasis pueden no contabilizarse y una coincidencia de cita no demuestra soporte ni completitud.
- Las secciones densas (6+ aserciones gold) son las más difíciles, con recall de 0,385; las definiciones son la categoría más débil (F1 0,338).
- Riesgo de alucinación en la generación de aserciones y citas, aunque la tasa de spans exactos es alta (99,5–100 %); aun así, se requiere revisión manual antes de cualquier uso downstream.
- Solo inglés y solo derecho federal y estatal de EE. UU.; no cubre otras jurisdicciones ni idiomas.
- El contrato exige un prompt de sistema congelado y una envoltura de entrada exacta; desviarse de ellos invalida los resultados de evaluación y probablemente degrada la salida.
- Licencia NVIDIA Nemotron Open Model License: es necesario revisar sus términos para uso comercial, ya que no es una licencia open source estándar (Apache/MIT).
- Ruptura de compatibilidad: los resultados de la v1.1 no son comparables con los del checkpoint v3 (checkpoint-2400), que responde a un contrato de provisiones distinto.
- La model card advierte que la retención de publicación de definiciones en el pipeline XLL es independiente de este modelo y no se ve alterada por él.
- No hay datos publicados de cuantización, latencia ni throughput, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thurstonpowers/xll-spo-nemotron-4b
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-spo-dataset
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- Prompt de sistema (`SYSTEM_PROMPT.txt`): incluido en el repositorio del modelo
- Informe de entrenamiento (`TRAINING_REPORT.json`): incluido en el repositorio del modelo
- Informe de evaluación (`EVAL_REPORT.json`): incluido en el repositorio del modelo
- Script de evaluación (`scripts/train/eval_actor_nemotron.py`): incluido en el repositorio del modelo
