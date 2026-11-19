# SZLHOLDINGS/szl1-experimental-massed-20261104

## Resumen

szl1-experimental-massed-20261104 es un modelo de lenguaje de 3.085.938.688 parámetros desarrollado por SZL Holdings como un *smoke test* (prueba de humo) del pipeline de entrenamiento de su infraestructura en Massed Compute. Se trata de un *merge* de pesos completos derivado de Qwen/Qwen2.5-3B-Instruct (a través de un checkpoint intermedio de unsloth en cuantización bnb-4bit), con arquitectura Qwen2 (36 capas, dimensión oculta 2048). El propio autor lo describe explícitamente como "not a model to use" y lo marca como no elegible para promoción (`canonical_szl1: false`).

El interés de esta ficha no reside en las capacidades del modelo —que no han sido evaluadas en absoluto— sino en su valor como caso documentado de artefacto experimental publicado en el Hub con trazabilidad parcial mediante *receipts* (recibos de entrenamiento con hashes SHA-256). El modelo se entrenó con tan solo 41 ejemplos durante 18 pasos (3 épocas) en una NVIDIA RTX A6000, con una pérdida final de entrenamiento de 3,2832, un valor que el propio autor califica de insuficientemente entrenado.

Es relevante ahora principalmente como advertencia metodológica: ilustra los riesgos de publicar artefactos intermedios de pipeline con licencias inconsistentes (la model card declara apache-2.0 mientras el modelo base es qwen-research) y sin evaluación alguna. No debe confundirse con un modelo listo para producción ni para investigación seria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only), 36 capas, hidden size 2048 |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada de Qwen2.5-3B-Instruct, no confirmada en la card) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; el checkpoint de entrenamiento partió de bnb-4bit) |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (la card declara apache-2.0, en conflicto con el upstream) |
| Formato de pesos | safetensors (2 shards, 6.171.877.376 bytes totales) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura Qwen2 estándar de 36 capas con dimensión oculta 2048, heredada directamente de Qwen2.5-3B-Instruct. El artefacto publicado son pesos completos fusionados (*full merged weights*) en dos shards, resultado de un *merge* sobre el checkpoint base. La receta de entrenamiento es `szl-forge/train_szl.py`, aunque el commit exacto no está fijado en el recibo de entrenamiento, lo que limita la reproducibilidad.

El entrenamiento consistió en 18 pasos durante 3 épocas sobre un conjunto de 41 ejemplos (hash del dataset no registrado), con una duración total de 92,19 segundos en una NVIDIA RTX A6000. La pérdida final de entrenamiento fue de 3,2832, un valor que el autor reconoce como indicativo de infraentrenamiento. No se documenta ningún proceso de RLHF, DPO ni ajuste por preferencias. Los recibos (`SZL1-TRAIN-RECEIPT-20261104T143305Z.json` y `SZL1-MODEL-HASHES.json`) están firmados como *unsigned*, es decir, sin firma criptográfica que garantice su integridad más allá del hash SHA-256 registrado.

## Capacidades

- Generación de texto conversacional: capacidad heredada teóricamente del modelo base Qwen2.5-3B-Instruct, pero no verificada tras el *merge* ni el entrenamiento.
- Razonamiento, código y matemáticas: no evaluado; se desconoce si el *merge* preserva las capacidades del base.
- Tool calling / function calling: no disponible (no documentado en la card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Trazabilidad mediante *receipts*: el artefacto incluye hashes SHA-256 de los shards y del recibo de entrenamiento, lo que permite verificar la integridad de los pesos descargados.

## Casos de uso

- Auditoría de pipelines de entrenamiento: el modelo sirve como artefacto de referencia para verificar que la ruta de entrenamiento en Massed Compute produce pesos fusionados correctamente y que los hashes de los shards coinciden con los recibos publicados.
- Docencia sobre buenas prácticas de publicación: útil como ejemplo negativo en formación sobre model cards, al ilustrar un caso de licencia inconsistente (apache-2.0 declarada frente a qwen-research upstream) y ausencia total de evaluación.
- Pruebas de integración de TGI: al estar etiquetado como `text-generation-inference` y `endpoints_compatible`, puede emplearse para validar que un endpoint de TGI arranca correctamente con un checkpoint Qwen2 de 3B, sin pretensión de calidad de salida.
- Validación de herramientas de merge: permite comprobar que utilidades de fusión de pesos (por ejemplo, scripts de mergekit o similares) generan shards con los tamaños y hashes esperados.
- Reproducción de recibos: investigadores interesados en esquemas de procedencia (*provenance*) pueden usar los ficheros de receipt como plantilla para diseñar sus propios sistemas de trazabilidad firmada.
- Pruebas de carga y benchmarking de infraestructura: dado su tamaño de 3B, es adecuado para medir latencia y throughput de un despliegue en GPU consumer sin que la calidad de las respuestas sea un factor relevante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "not yet measured" en la batería de evaluación, y la única métrica reportada es la pérdida de entrenamiento final (3,2832), que no constituye una evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,2 GB en FP16 (tamaño del repo), en torno a 2-3 GB en cuantizaciones de 4 bits (no publicadas oficialmente; requeriría conversión manual).
- GPU recomendadas: el entrenamiento se realizó en una NVIDIA RTX A6000 (48 GB); para inferencia basta con GPUs de gama media-alta.
- Cabe en GPU consumer: sí, en tarjetas con 8 GB o más de VRAM en FP16 (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 4070) y en GPUs con 4-6 GB si se cuantiza a 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `endpoints_compatible`); llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Evaluación publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| szl1-experimental-massed-20261104 | 3,09 B | no disponible | ninguna | qwen-research (card declara apache-2.0) | pública en HF, 22 descargas |
| Qwen/Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens (según documentación del base) | sí, benchmarks oficiales de Qwen | qwen-research | pública en HF |
| Qwen/Qwen3-4B | 4 B (aprox.) | no disponible en esta ficha | sí, benchmarks oficiales de Qwen | apache-2.0 (según recomendación del autor) | pública en HF |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,5 B | no disponible en esta ficha | sí, benchmarks oficiales de Qwen | apache-2.0 (según recomendación del autor) | pública en HF |

La comparación relevante es que el modelo aquí descrito no aporta ninguna capacidad verificada sobre su base Qwen2.5-3B-Instruct, mientras que las alternativas citadas por el propio autor (Qwen3-4B y Qwen2.5-Coder-1.5B-Instruct) ofrecen licencias permisivas y evaluaciones publicadas.

## Limitaciones y advertencias

- Infraentrenamiento severo: 41 ejemplos y 18 pasos con pérdida final de 3,2832; el propio autor lo califica como "under-trained by its own receipt".
- Ausencia total de evaluación: no se ha medido ninguna capacidad, ni siquiera cualitativa.
- Licencia inconsistente: la card declara apache-2.0, pero el modelo base es qwen-research; la publicación y redistribución deben regirse por la licencia Qwen hasta que se rebase el modelo.
- Riesgo elevado de alucinación y degradación de calidad: el *merge* sobre un checkpoint cuantizado a 4 bits (bnb-4bit) seguido de un ajuste mínimo puede haber degradado las capacidades originales del base, sin que exista verificación alguna.
- Recibos sin firma: los ficheros de receipt están marcados como *unsigned*, por lo que su autenticidad no está criptográficamente garantizada.
- Reproducibilidad limitada: el commit de la receta `szl-forge/train_szl.py` no está fijado y el hash del dataset no se registró.
- Sesgos conocidos: no documentados; se heredarían, en su caso, del modelo base Qwen2.5-3B-Instruct.
- Restricciones de uso comercial: sujetas a la licencia qwen-research del upstream; el autor recomienda no usar el modelo en absoluto.
- El propio autor recomienda mantenerlo fuera de cualquier escaparate y, o bien hacerlo privado, o bien rebasarlo sobre un modelo apache-2.0 antes de reentrenar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/szl1-experimental-massed-20261104
- Organización SZL Holdings en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (qwen-research): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Checkpoint de entrenamiento intermedio: https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Alternativa recomendada por el autor (apache-2.0): https://huggingface.co/Qwen/Qwen3-4B
- Alternativa recomendada por el autor (apache-2.0): https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
