# Tamarillo/prompt-complexity-router-tiny-en

## Resumen

`Tamarillo/prompt-complexity-router-tiny-en` es un clasificador de complejidad de prompts en inglés, desarrollado por el usuario Tamarillo, pensado como pieza de enrutamiento de costes en pipelines de LLM (estilo RouteLLM). Dado un prompt, estima si requiere un modelo de frontera ("strong") o si basta con uno rápido y barato ("weak"), devolviendo una distribución de tres clases (strong / empate / weak) que se traduce en una puntuación continua de complejidad en el rango [0, 1].

El modelo se construye sobre el encoder `jhu-clsp/ettin-encoder-32m` (arquitectura ModernBERT) y cuenta con 32.032.131 parámetros totales, lo que lo sitúa como una alternativa muy ligera a clasificadores como `routellm/bert_gpt4_augmented` (278,1 M) o `nvidia/prompt-task-and-complexity-classifier` (183,9 M). Está entrenado con 2.048 tokens de longitud y soporta hasta 8.192 tokens nativos gracias al RoPE de su backbone.

Su relevancia actual reside en la observabilidad y optimización de costes en sistemas agénticos: permite decidir en milisegundos, incluso en CPU o en el navegador vía WASM, si una consulta debe enviarse a un modelo caro. Se publica bajo licencia Apache-2.0, sin `trust_remote_code`, con pesos en safetensors y ONNX (FP32 y FP16), y es compatible como drop-in del `BERTRouter` de `lm-sys/RouteLLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT, backbone `jhu-clsp/ettin-encoder-32m`) con cabeza de clasificación de secuencias |
| Parametros totales | 32.032.131 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; 8.192 tokens nativos por RoPE |
| Tipos de cuantizacion | ONNX FP32 y ONNX FP16 publicados; cuantizaciones GGUF no disponibles |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (`onnx/model.onnx`, `onnx/model_fp16.onnx`); compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 32 M de parámetros (Ettin) con una cabeza de clasificación de tres clases sobre `AutoModelForSequenceClassification`. La clase 0 corresponde a "se necesita modelo fuerte", la 1 a empate/moderado y la 2 a "basta modelo débil"; la puntuación de complejidad continua se obtiene como `p[0] + 0.5 * p[1]`. El tokenizador fija `model_max_length` a 2.048, lo que permite usar directamente el checkpoint dentro de `BERTRouter` sin modificaciones y con 4 veces más contexto que la configuración habitual de 512 tokens.

El entrenamiento combina varios datasets: preferencias humanas de Arena (`lmarena-ai/arena-human-preference-140k` y `-55k`), batallas juzgadas por GPT-4 de RouteLLM (`routellm/gpt4_judge_battles`), matemáticas de competición (`qwedsacf/competition_math`), problemas de programación (`google-research-datasets/mbpp`) y resúmenes legislativos (`FiscalNote/billsum`). La model card no detalla el número total de tokens de entrenamiento ni si hubo RLHF/DPO; el ajuste es de clasificación supervisada sobre etiquetas derivadas de esos conjuntos. Entre las innovaciones prácticas destacan la ausencia de `trust_remote_code`, la exportación ONNX lista para CPU/edge y el soporte de Transformers.js para ejecución en navegador.

## Capacidades

- Clasificación de complejidad de prompts en inglés con salida de tres clases y puntuación continua en [0, 1].
- Estimación de la probabilidad de que un prompt requiera un modelo de frontera (`P(STRONG)`), calibrable por umbral.
- Enrutamiento de costes compatible con `lm-sys/RouteLLM` (`BERTRouter`) como reemplazo directo de una línea.
- Alternativa estándar a `nvidia/prompt-task-and-complexity-classifier` sin dependencias de código remoto.
- Ejecución en CPU (ONNX Runtime) y en navegador (WASM vía Transformers.js).
- Soporte de lotes con padding y truncación hasta 2.048 tokens; contexto multi-turno de hasta 8.192 tokens nativos.
- No soporta tool calling, agentes, visión, audio ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de costes en gateways de LLM: cada petición entrante se clasifica y se deriva a un modelo pequeño o a uno de frontera según el umbral de `P(STRONG)`, reduciendo el gasto sin degradar la calidad percibida.
- Observabilidad de agentes: registrar la distribución de complejidad de las consultas para detectar qué flujos agénticos están consumiendo modelos caros innecesariamente.
- Despliegue en el borde o en el navegador: con ONNX FP16 (61,3 MB) o WASM, el clasificador puede ejecutarse en el cliente antes de enviar la consulta al backend, ahorrando latencia de red y coste de servidor.
- Sustitución directa de `routellm/bert_gpt4_augmented`: al ser 8,7 veces más pequeño, reduce el coste de infraestructura del router manteniendo métricas competitivas en OOD de longitud invertida.
- Contexto multi-turno largo: con 2.048 tokens de entrenamiento y 8.192 nativos, permite clasificar conversaciones completas en lugar de solo el último turno, mejorando la decisión en asistentes con historial.
- Filtrado previo en pipelines de código y matemáticas: los prompts de MBPP o competición matemática se marcan como complejos y se envían a modelos especializados, mientras las consultas triviales se resuelven con modelos rápidos.
- Control de presupuesto en producción: calibrar el umbral contra el par de modelos concreto y el presupuesto disponible para obtener un TPR@5%FPR objetivo.

## Benchmarks y rendimiento

| Benchmark | Resultado |
|---|---|
| English Length-Inverted OOD (n=1.200) | ROC-AUC 0,791; Macro-F1 0,808; TPR@5%FPR 0,695 |
| `nvidia/prompt-task-and-complexity-classifier` (184 M) en el mismo OOD | ROC-AUC 0,777; Macro-F1 0,333; TPR@5%FPR 0,623 |
| Diagnóstico de contexto multi-turno 2K | AUC 0,881 |
| Arena-140K inglés held-out 2025 | AUC 0,938; Spearman ρ 0,721 |
| OOD multilingüe | AUC 0,498; TPR@5%FPR 0,005 |
| Media OOD-2 pública | 0,645 |
| Latencia A100 @ 64 tokens | 12,2 ms |
| Latencia CPU FP32 @ 64 tokens | 9,91 ms p50 |
| Latencia CPU FP16 ONNX @ 64 tokens | 11,77 ms p50 |

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB en FP32 para el modelo completo (32 M de parámetros); no requiere GPU para funcionar.
- GPU recomendadas: A100 (12,2 ms @ 64 tokens); cualquier GPU consumer moderna (RTX 4090, RTX 3090, RTX 4060) es sobredimensionada para este modelo.
- Cabe holgadamente en cualquier GPU consumer e incluso en CPU: 9,91 ms p50 en x86 FP32 y 11,77 ms p50 en FP16 ONNX.
- Opciones de despliegue: Transformers (`>=4.48,<5`), ONNX Runtime (CPU/edge), Transformers.js (WASM en navegador), Text Embeddings Inference (tag `text-embeddings-inference`), integración en `lm-sys/RouteLLM` como `BERTRouter`.
- Latencia y throughput: ~10 ms por lote de 64 tokens en CPU; el tamaño de 122,4 MB (FP32 ONNX) y 61,3 MB (FP16 ONNX) facilita el despliegue en contenedores ligeros y funciones serverless.
- Nota: con PyTorch 2.4.x + CUDA y lotes con padding de más de 512 tokens, cargar con `attn_implementation="eager"`.

## Comparativa con modelos similares

| Modelo | Backbone | Parámetros | Idiomas | OOD longitud invertida (AUC / T5) | OOD multilingüe (AUC / T5) | Licencia |
|---|---|---|---|---|---|---|
| `Tamarillo/prompt-complexity-router-tiny-en` | Ettin-32M | 32,0 M | Inglés | 0,791 / 0,695 | 0,498 / 0,005 | Apache-2.0 |
| `Tamarillo/prompt-complexity-router-small` | mmBERT-small | 140,6 M | Multilingüe | 0,805 / 0,718 | 0,946 / 0,700 | no disponible |
| `Tamarillo/prompt-complexity-router-base` | mmBERT-base | 307,5 M | Multilingüe | 0,828 / 0,748 | 0,952 / 0,795 | no disponible |
| `routellm/bert_gpt4_augmented` | BERT | 278,1 M | Inglés | no disponible | no disponible | no disponible |
| `nvidia/prompt-task-and-complexity-classifier` | no disponible | 183,9 M | Inglés | 0,777 / 0,333 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés: el rendimiento multilingüe cae a AUC 0,498 y TPR@5%FPR 0,005, prácticamente aleatorio; no usar con prompts en otros idiomas.
- El umbral de 0,30 es una recomendación de la model card y debe recalibrarse para cada par de modelos y presupuesto.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea en prompts ambiguos o muy cortos.
- Requiere `transformers>=4.48,<5`; entornos con versiones anteriores (frecuentes en instalaciones de `routellm`) deben actualizarse.
- En PyTorch 2.4.x + CUDA con lotes con padding de más de 512 tokens puede requerir `attn_implementation="eager"`.
- El modelo se publicó en noviembre de 2026 y no registra descargas ni likes; no hay evidencia de uso en producción ni auditoría externa.
- No se detallan sesgos del dataset de entrenamiento (Arena, GPT-4 judge) que pueden propagarse a la clasificación.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías.

## Enlaces

- Hugging Face: https://huggingface.co/Tamarillo/prompt-complexity-router-tiny-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Repositorio RouteLLM: https://github.com/lm-sys/RouteLLM
- Alternativa NVIDIA: https://huggingface.co/nvidia/prompt-task-and-complexity-classifier
- Router de referencia RouteLLM: https://huggingface.co/routellm/bert_gpt4_augmented
- Demo en navegador (Space): https://huggingface.co/spaces/Tamarillo/prompt-complexity-router-demo
- Variante small: https://huggingface.co/Tamarillo/prompt-complexity-router-small
- Variante base: https://huggingface.co/Tamarillo/prompt-complexity-router-base
