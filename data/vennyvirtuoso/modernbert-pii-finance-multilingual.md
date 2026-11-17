# vennyvirtuoso/modernbert-pii-finance-multilingual

## Resumen

`modernbert-pii-finance-multilingual` es un modelo de clasificación de tokens (token classification, tarea NER) especializado en la detección de información personal identificable (PII) en contextos financieros multilingües. Lo publica el usuario `vennyvirtuoso` en Hugging Face y se construye mediante fine-tuning del checkpoint base `answerdotai/ModernBERT-base`, un transformer encoder de 149,65 millones de parámetros con atención de ventana local y global alternada.

El modelo aborda un problema concreto: la necesidad de anonimizar o marcar datos sensibles (nombres, SSN, IBAN, números de ruta bancaria, fechas, etc.) en documentos financieros antes de que entren en pipelines de análisis, RAG o modelos generativos. Frente a soluciones basadas en expresiones regulares o LLMs de gran tamaño, apuesta por una arquitectura encoder ligera, con latencia baja y capacidad de ejecutarse en CPU o GPU de consumo.

Es relevante ahora porque la presión regulatoria (GDPR, PCI-DSS, HIPAA) exige mecanismos de redacción de PII eficientes y auditables, y porque el modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones. La model card declara soporte para cuatro idiomas (inglés, español, francés y alemán) y 59 entidades financieras sensibles, con un F1 de entidad de 88,33 % en el split de test reservado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-base), bidireccional con atención local/global alternada |
| Parametros totales | 149.650.235 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ModernBERT-base soporta hasta 8192 tokens; el autor no lo especifica para este checkpoint) |
| Tipos de cuantizacion | no disponible (la model card menciona entrenamiento en bfloat16/fp16, no cuantizaciones publicadas) |
| Idiomas soportados | inglés, español, francés y alemán (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder tipo BERT modernizado que sustituye la atención completa por una combinación de capas con atención local (ventana deslizante) y capas con atención global, incorpora rotary positional embeddings (RoPE) y prescinde del sesgo en las capas lineales. Sobre esa base se añade una cabeza de clasificación de tokens para etiquetado BIO de entidades PII.

El fine-tuning se realizó sobre el dataset `gretelai/synthetic_pii_finance_multilingual`, un corpus sintético de PII financiera multilingüe. La model card indica entrenamiento en precisión mixta (bfloat16/fp16) y evaluación sobre un split de test disjunto por grupos ("group-disjoint, unseen test splits") para medir generalización fuera de distribución. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF/DPO (no procede en un encoder de clasificación). Tampoco se especifican hiperparámetros, épocas ni estrategia de early stopping.

## Capacidades

- Clasificación de tokens para extracción de entidades nombradas (NER) orientada a PII en dominios financieros.
- Detección de hasta 59 tipos de entidades sensibles según la model card, incluyendo nombres, SSN, IBAN, números de ruta bancaria, fechas y otros identificadores financieros.
- Procesamiento multilingüe declarado en inglés, español, francés y alemán.
- Integración directa con el pipeline `token-classification` de `transformers` con `aggregation_strategy="simple"` para agrupar subtokens.
- Compatibilidad declarada con `sentence-transformers`, `peft` y `accelerate`.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso: es un encoder discriminativo, no un modelo generativo.
- No incorpora visión, audio ni modo "thinking".

## Casos de uso

- Redacción de PII antes de pipelines RAG: el modelo etiqueta entidades sensibles en documentos financieros y permite enmascararlas antes de indexarlas en un vector store, reduciendo el riesgo de filtrar datos personales a un LLM generativo.
- Cumplimiento GDPR/PCI-DSS en ingesta de documentos: se puede ejecutar como microservicio sobre cada documento entrante para marcar SSN, IBAN, tarjetas o direcciones antes del almacenamiento, generando un registro auditable de entidades detectadas.
- Anonimización de logs y tickets de soporte: al ser un encoder ligero, se puede desplegar en CPU junto a sistemas de logging para redactar automáticamente identificadores en tiempo casi real.
- Preprocesado para modelos generativos en banca: se usa como etapa previa que sustituye PII por placeholders y permite que un LLM posterior razone sobre el documento sin exponer datos reales.
- Enrutado y clasificación documental en back office: la detección de tipos de entidad (IBAN, routing number, fecha) sirve como señal para clasificar extractos, transferencias o formularios.
- Despliegue en el edge o en entornos sin GPU: con 149,65 M de parámetros y pesos en safetensors de 0,6 GB, cabe en máquinas modestas y en contenedores con presupuesto de memoria reducido, útil para sucursales o dispositivos locales.
- Segunda etapa de ranking en RAG: la model card lo propone explícitamente como filtro de alta precisión en pipelines de ranking.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test reservado (según la model card):

| Metrica | Valor |
|---|---|
| F1 de entidad del base preentrenado sin fine-tuning | 0,34 % |
| F1 de entidad tras fine-tuning (held-out test) | 88,33 % |
| Ganancia absoluta de F1 | +87,99 % |
| Exactitud de token en test | 98,30 % |
| Precisión en test | 89,35 % |
| Recall en test | 87,33 % |
| Loss en test | 0,0559 |

No se han publicado en la información disponible comparaciones con otros modelos de NER/PII ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a un encoder de clasificación).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,3 GB de pesos más activaciones; en la práctica, menos de 1 GB para lotes pequeños.
- En CPU: viable para inferencia en tiempo real con lotes moderados; el tamaño del repo (0,6 GB) sugiere pesos en fp32 y fp16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060/4060, T4, L4 o superiores son suficientes. A100/H100 solo tienen sentido para alto throughput por lotes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante, con margen).
- Opciones de despliegue: `transformers` pipeline, ONNX Runtime, TensorRT, y según la model card también vLLM y TGI (aunque estos están orientados a modelos generativos; para un encoder conviene ONNX Runtime o un servidor tipo FastAPI con `transformers`).
- Latencia y throughput: no disponibles en la información proporcionada. La model card afirma "production-ready latency" y diseño para alto throughput por lotes, pero sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vennyvirtuoso/modernbert-pii-finance-multilingual` | 149,65 M | no disponible (base ModernBERT hasta 8192) | NER PII financiera multilingüe | Apache 2.0 | Hugging Face |
| `answerdotai/ModernBERT-base` | 149,65 M | 8192 tokens | Encoder general (fine-tunable) | Apache 2.0 | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355 M | 512 tokens | NER inglés (PER/ORG/LOC/MISC) | MIT | Hugging Face |
| `dslim/bert-base-NER` | ~110 M | 512 tokens | NER inglés (4 clases) | MIT | Hugging Face |

La comparativa con modelos NER genéricos es aproximada: este checkpoint está especializado en PII financiera y multilingüe, mientras que los alternativos cubren NER general y solo inglés. No se dispone de benchmarks comunes para una comparación cuantitativa directa.

## Limitaciones y advertencias

- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación independiente de la comunidad ni de terceros.
- El F1 de 88,33 % procede del propio autor y del split de test del dataset sintético; el rendimiento en datos reales de producción puede ser inferior, especialmente en dominios distintos al financiero.
- El entrenamiento se realizó sobre datos sintéticos (`gretelai/synthetic_pii_finance_multilingual`); puede no generalizar bien a formatos reales de PII (variantes de IBAN, identificadores nacionales no cubiertos, etc.).
- Riesgo de falsos negativos en identificadores poco frecuentes o con formatos atípicos; en un contexto de cumplimiento normativo, conviene combinarlo con reglas deterministas (regex de IBAN, validación de checksum) y revisión humana.
- Sesgos potenciales heredados del dataset sintético y del corpus de preentrenamiento de ModernBERT; no se documentan análisis de sesgo.
- La lista exacta de las 59 entidades no se detalla en la información disponible; el mapeo de etiquetas debe verificarse en el `config.json` del repositorio antes de usarlo en producción.
- Aunque la licencia Apache 2.0 permite uso comercial, el cumplimiento GDPR/PCI-DSS exige auditoría propia del pipeline; el modelo no sustituye una evaluación de conformidad.
- No es un modelo generativo: no debe usarse para responder preguntas ni generar texto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/modernbert-pii-finance-multilingual
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
- vLLM: https://github.com/vllm-project/vllm
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
- ONNX Runtime: https://github.com/microsoft/onnxruntime
- TensorRT-LLM: https://github.com/NVIDIA/TensorRT-LLM
