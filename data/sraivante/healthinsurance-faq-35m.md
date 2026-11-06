# sraivante/healthinsurance-faq-35m

## Resumen

HealthInsurance-FAQ-35M es un modelo de lenguaje de 35,65 millones de parámetros desarrollado por el usuario sraivante y publicado en Hugging Face. Se trata de un transformer decoder-only de estilo GPT-2 entrenado **desde cero** (sin pesos preentrenados) sobre un conjunto de datos sintético de preguntas y respuestas frecuentes sobre seguros de salud estadounidenses: Medicare partes A/B/C/D, Medigap, mercado ACA, anualidades, IUL y seguros de vida. El modelo no emplea arquitecturas modernas como MoE o atención lineal; replica el diseño de un GPT-2 pequeño con 9 capas, 6 cabezas de atención y dimensión 384.

El problema que aborda es acotado: servir como banco de respuestas preciso para preguntas dentro del dominio de entrenamiento, incluyendo reformulaciones. Su relevancia no reside en capacidades generales —que son muy limitadas— sino en su carácter didáctico y reproducible: todo el código, los datos, los logs y la evaluación están incluidos, y el entrenamiento completo se ejecutó en una GPU de portátil Apple M5 en unos 65 minutos. Es un ejemplo de modelo de dominio pequeño y de bajo coste, no un asistente conversacional general.

El contexto es de 1024 tokens, el vocabulario es GPT-2 BPE vía tiktoken (ampliado a 50.304 entradas) y los pesos se distribuyen en safetensors en fp32. La licencia es MIT y el único idioma soportado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT-2 style decoder-only: 9 capas, 6 cabezas, dim 384, MLP 1536, pre-LayerNorm, GELU, posiciones absolutas aprendidas, embeddings de entrada/salida atados, sin biases, dropout 0 |
| Parámetros totales | 35.649.792 (19.316.736 corresponden al embedding de tokens atado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens |
| Tipos de cuantización | no disponible (pesos publicados en fp32; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, fp32; `lm_head.weight` no se almacena (atado a `wte.weight`), cargar con `strict=False` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con 9 capas, 6 cabezas de atención, dimensión de modelo 384 y MLP de 1536. Usa pre-LayerNorm, activación GELU, posiciones absolutas aprendidas, embeddings de entrada y salida atados y ningún bias. La inicialización es normal(0, 0.02), con proyecciones residuales escaladas a 0.02/√(2·9). El tokenizador es GPT-2 BPE mediante tiktoken, con vocabulario ampliado a 50.304 entradas; `<|endoftext|>` (50256) actúa como BOS y EOS.

El entrenamiento parte de inicialización aleatoria, sin pesos preentrenados. Los datos son 1.795 pares pregunta-respuesta de entrenamiento y 94 de validación, más 10 paráfrasis por pregunta, lo que da 19.745 documentos de entrenamiento (1,45M tokens GPT-2) y 1.034 de validación. Cada documento tiene el formato `<|endoftext|> User: … Assistant: … <|endoftext|>` y se empaqueta en filas de 1024 tokens con ~99% de ocupación; la máscara de atención es causal y restringida al mismo documento, con reinicio de posiciones en cada documento y padding con label −100. El optimizador es AdamW (β 0.9/0.95, weight decay 0.1), con LR 1e-3 → 1e-4 coseno, 50 pasos de warmup y grad clip 1.0. El batch efectivo es 32 × 1024 tokens (micro-batch 4 × 8 de acumulación), 20 épocas = 900 pasos, en fp32 sobre Apple MPS a ~7.4k tok/s. Se distribuyen dos checkpoints: `best/` (época 4, menor perplejidad de validación) y `final/` (época 20, mejores respuestas).

## Capacidades

- Generación de texto de dominio restringido: responde preguntas frecuentes sobre Medicare, Medigap, mercado ACA, anualidades, IUL y seguros de vida.
- Respuesta a preguntas reformuladas dentro del conjunto de entrenamiento: ~96,5% de coincidencia exacta sobre paráfrasis de preguntas vistas.
- Conversación de un solo turno: el formato de prompt es `User: {question}\nAssistant:` y la respuesta termina en `<|endoftext|>`.
- Recuperación exacta de respuestas memorizadas: ~97,4% de coincidencia exacta sobre las preguntas originales de entrenamiento.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modo agente.
- No soporta visión, audio ni modo "thinking".
- Multilingüe: no; únicamente inglés.
- No soporta conversaciones multi-turno ni gestión de contexto conversacional.

## Casos de uso

- Banco de respuestas cerrado para FAQ de seguros de salud: desplegar el modelo como lookup generativo sobre las 1.795 preguntas del conjunto de entrenamiento, donde ofrece ~97% de coincidencia exacta, útil para demos internas o validación de pipelines.
- Prototipado educativo de LLM desde cero: el repositorio incluye código, datos, logs y evaluación, lo que permite reproducir el entrenamiento completo en una GPU de portátil Apple M5 en ~65 minutos y estudiar el efecto del sobreajuste en un modelo pequeño.
- Evaluación de técnicas de empaquetado de documentos: el modelo implementa document-aware packing con máscara causal por documento y reinicio de posiciones, reutilizable como referencia para entrenar modelos pequeños con datos estructurados.
- Generación de respuestas de respaldo en inglés para preguntas frecuentes de Medicare: dado que el dominio es acotado y el contexto de 1024 tokens es suficiente para preguntas y respuestas cortas, puede servir como capa de respuesta rápida en un sistema mayor con validación humana.
- Investigación sobre sobreajuste y memorización: la tabla de métricas por época (perplejidad de validación frente a F1 de QA) permite estudiar la divergencia entre pérdida de validación y calidad de respuesta en modelos pequeños.
- Base para fine-tuning de dominio: al ser un GPT-2 de 35M con licencia MIT y pesos safetensors, puede servir como punto de partida para ajustar un modelo de dominio aún más específico (por ejemplo, una sola aseguradora) con datos propios.
- Test de infraestructura de inferencia ligera: su tamaño reducido permite validar pipelines de despliegue con llama.cpp u Ollama tras conversión a GGUF, aunque no se publican pesos cuantizados.

## Benchmarks y rendimiento

Los datos disponibles son métricas internas de entrenamiento y evaluación del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K no están disponibles).

| Época | Paso | PPL val | PPL train | Gap (val−train) | F1 QA val | F1 val ≥0.5 | Rep4 ↓ | Dist-2 ↑ |
|---|---|---|---|---|---|---|---|---|
| 2 | 90 | 39,65 | 25,68 | +0,435 | 0,127 | 0,011 | 0,291 | 0,091 |
| 4 (`best/`) | 180 | 25,85 | 4,65 | +1,716 | 0,228 | 0,043 | 0,070 | 0,373 |
| 6 | 270 | 39,85 | 1,95 | +3,018 | 0,271 | 0,117 | 0,010 | 0,575 |
| 8 | 360 | 51,71 | 1,61 | +3,469 | 0,294 | 0,170 | 0,005 | 0,617 |
| 10 | 450 | 64,38 | 1,42 | +3,813 | 0,343 | 0,234 | 0,004 | 0,640 |
| 12 | 540 | 76,81 | 1,30 | +4,079 | 0,350 | 0,191 | 0,002 | 0,653 |
| 14 | 630 | 96,86 | 1,23 | +4,363 | 0,375 | 0,277 | 0,001 | 0,653 |
| 16 | 720 | 109,29 | 1,20 | +4,512 | 0,370 | 0,266 | 0,006 | 0,643 |
| 18 | 810 | 117,96 | 1,18 | +4,601 | 0,379 | 0,287 | 0,003 | 0,642 |
| 20 (`final/`) | 900 | 124,17 | 1,18 | +4,658 | 0,379 | 0,266 | 0,001 | 0,674 |

Resultados por partición con el checkpoint `final/`:

| Partición | Formulación | N | Coincidencia exacta | Correctas (F1≥0.8) | Mayormente correctas (F1≥0.5) | F1 medio |
|---|---|---|---|---|---|---|
| train | original | 1795 | 97,4% | 97,7% | 99,4% | 0,990 |
| train | paráfrasis | 1795 | 96,5% | 96,7% | 99,1% | 0,986 |
| val (no vista) | original | 94 | 0,0% | 1,1% | 26,6% | 0,379 |
| val (no vista) | paráfrasis | 94 | 0,0% | 1,1% | 21,3% | 0,358 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (35,65M parámetros × 4 bytes ≈ 143 MB de pesos, más activaciones y caché KV para 1024 tokens); cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el autor entrenó en una GPU de portátil Apple M5 vía MPS.
- Cabe en GPU consumer: sí, en cualquier RTX (incluidas series 20xx, 30xx, 40xx), GTX 16xx y en GPUs integradas Apple Silicon.
- Opciones de despliegue: PyTorch nativo con el script `code/inference.py` incluido; no se documentan integraciones con vLLM, TGI, llama.cpp u Ollama, aunque al ser un GPT-2 estándar es convertible a GGUF.
- Latencia y throughput: entrenamiento a ~7.4k tok/s en Apple M5; no se publican cifras de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| HealthInsurance-FAQ-35M | 35,65M | 1024 | MIT | Dominio FAQ seguros de salud, entrenado desde cero | Hugging Face (sraivante) |
| sraivante/tinystories-35m | 35M (arquitectura base) | no disponible | no disponible | Cuentos infantiles, arquitectura de referencia | Hugging Face (sraivante) |
| GPT-2 small | 124M | 1024 | MIT | Modelo generalista preentrenado | Hugging Face (openai-community) |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Modelo generalista preentrenado | Hugging Face (TinyLlama) |

La comparación con GPT-2 small y TinyLlama es asimétrica: estos son modelos generalistas preentrenados con capacidades mucho más amplias, mientras que HealthInsurance-FAQ-35M está especializado y sobreajustado a un dominio concreto. Frente a `tinystories-35m`, comparte arquitectura pero cambia el corpus y el objetivo. No se dispone de benchmarks estándar comparables entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Sobreajuste severo: la perplejidad de validación sube de 25,85 (época 4) a 124,17 (época 20), y el gap val−train alcanza +4,658; el modelo memoriza las respuestas de entrenamiento.
- Rendimiento muy bajo en preguntas no vistas: 0% de coincidencia exacta y F1 medio de 0,379 en validación; solo ~26,6% de respuestas son mayormente correctas (F1≥0.5).
- Riesgo alto de alucinación fuera del dominio: el autor advierte que las respuestas pueden ser erróneas, especialmente para preguntas ajenas al conjunto de entrenamiento.
- Datos sintéticos sin revisión profesional: el corpus fue generado con un LLM y no ha sido revisado por un profesional licenciado ni de compliance; se requiere aprobación antes de cualquier uso de cara al cliente (aplican las normas de marketing CMS para contenido MA/PDP).
- No es asesoramiento de seguros: el modelo solo proporciona información educativa general.
- Idioma único: solo inglés; no soporta castellano ni otros idiomas.
- Conversación limitada: solo un turno, sin memoria conversacional ni gestión de contexto multi-turno.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso.
- Licencia MIT: permite uso comercial, pero la responsabilidad sobre el contenido generado y su adecuación regulatoria recae en el desplegador.
- Formato de pesos fp32 sin variantes cuantizadas publicadas; requiere conversión manual para despliegues ligeros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sraivante/healthinsurance-faq-35m
- Dataset de entrenamiento: https://huggingface.co/datasets/sraivante/healthinsurance-faq
- Modelo de arquitectura base: https://huggingface.co/sraivante/tinystories-35m
