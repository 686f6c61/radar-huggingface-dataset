# Tamarillo/gibberish-noise-guard-small

## Resumen
Tamarillo/gibberish-noise-guard-small es un clasificador de texto multilingue disenado para detectar gibberish (texto sin sentido), ruido y corrupcion textual, incluyendo defensa frente a ataques adversariales GCG (Greedy Coordinate Gradient). Lo desarrolla el usuario Tamarillo y se publica bajo licencia Apache-2.0. Su proposito principal es actuar como filtro de calidad de entrada y salida en pipelines de LLM, sustituyendo con una sola linea de codigo al clasificador `madhurjindal/autonlp-Gibberish-Detector-492513457`, que es el valor por defecto en los escaneres `Gibberish` de `protectai/llm-guard`.

El modelo se construye sobre el backbone `jhu-clsp/mmBERT-small`, un encoder de tipo ModernBERT multilingue. Cuenta con 140.643.076 parametros totales, de los cuales aproximadamente 42,3 millones corresponden al cuerpo no-embedding (el resto es un vocabulario multilingue disperso de 256K tokens). Se entrena con contexto de 2.048 tokens y soporta de forma nativa RoPE hasta 8.192 tokens. Su relevancia actual radica en que reduce drasticamente los falsos positivos en codigo, matematicas y JSON (0,0% de FPR) y en textos multilingues limpios (2,7% de FPR a umbral 0,50), problemas que afectaban gravemente al detector de referencia.

La ficha se completa con las especificaciones tecnicas, la arquitectura, las capacidades y los casos de uso, ademas de una comparativa con los otros modelos de la misma familia y con el detector al que reemplaza. No se han publicado resultados de benchmarks completos mas alla de los datos de evaluacion OOD incluidos en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT / mmBERT-small) para clasificacion de secuencias |
| Parametros totales | 140.643.076 |
| Parametros activos | No aplica (no es MoE). Cuerpo no-embedding: ~42,3 M |
| Longitud de contexto | Entrenado a 2.048 tokens; RoPE nativo hasta 8.192 tokens |
| Tipos de cuantizacion | FP32 (PyTorch), FP16 ONNX (268,7 MB); no se detallan otras cuantizaciones |
| Idiomas soportados | en, ru, zh, es, fr, de, pl, ja, ko, pt, it, ar, tr, nl, th (15 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento
El modelo es un encoder transformer de la familia ModernBERT, concretamente una adaptacion de `jhu-clsp/mmBERT-small`. La cabeza de clasificacion produce cuatro clases: `0: clean`, `1: mild gibberish`, `2: noise` y `3: word salad`. Emplea un vocabulario multilingue disperso de 256K tokens, lo que explica la diferencia entre los 140,6 M de parametros totales y los 42,3 M del cuerpo no-embedding. El entrenamiento se realiza con secuencias de 2.048 tokens, aunque la implementacion de RoPE permite extender la ventana hasta 8.192 tokens.

Los datos de entrenamiento citados en la model card incluyen `lmarena-ai/arena-human-preference-140k`, `MatanBT/gcg-evaluated-data`, `google-research-datasets/mbpp`, `qwedsacf/competition_math` y `FiscalNote/billsum`. Esta composicion combina texto conversacional, ejemplos de ataques GCG, codigo, matematicas y resumenes legales, lo que explica su robustez frente a codigo y JSON. La model card menciona el uso de label smoothing y probabilidades softmax calibradas de cuatro clases. No se detalla el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO; al tratarse de un clasificador, no procede un ajuste por preferencias.

## Capacidades
- Clasificacion de texto en cuatro categorias: limpio, gibberish leve, ruido y word salad.
- Deteccion de gibberish multilingue en 15 idiomas, con especial rendimiento en ruso en modo zero-shot.
- Defensa frente a ataques adversariales GCG: ROC-AUC de 1,0000 y TPR@5%FPR de 1,000 con 0,0% de FPR sobre sufijos GCG reales.
- Tolerancia a codigo, matematicas y JSON: 0,0% de falsos positivos en estas categorias a umbral 0,50.
- Integracion directa con `protectai/llm-guard` como reemplazo del escaner `Gibberish` de entrada y salida.
- Ejecucion en CPU y edge mediante ONNX Runtime, con latencia de 26,33 ms en FP32 a 64 tokens.
- Soporte de lotes con padding y truncamiento hasta 2.048 tokens.
- No soporta tool calling, agentes ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso
- Filtrado de entrada en pipelines de LLM: se coloca antes del modelo generativo para descartar prompts corruptos o sin sentido, reduciendo el consumo de tokens y las respuestas erroneas.
- Filtrado de salida en produccion: se aplica a las respuestas del LLM para detectar degeneraciones, repeticiones o texto corrupto antes de mostrarlo al usuario.
- Defensa frente a prompt injection y ataques GCG: detecta sufijos adversariales con ROC-AUC de 1,0000, por lo que puede integrarse en un WAF para LLM que bloquee entradas manipuladas.
- Observabilidad de agentes: al clasificar trazas y mensajes intermedios, permite marcar pasos de un agente que producen texto degenerado o incoherente.
- Moderacion de contenido generado por usuarios en foros o chats multilingues: su FPR de 2,7% a umbral 0,50 en textos limpios de 15 idiomas lo hace viable en entornos internacionales.
- Validacion de datos de entrenamiento: se puede usar para limpiar corpus antes de entrenar o ajustar otros modelos, descartando muestras con gibberish o ruido.
- Proteccion de pipelines de codigo: al tener 0,0% de FPR en codigo, matematicas y JSON, puede validar respuestas de asistentes de programacion sin bloquear fragmentos legitimos.
- Despliegue en edge o entornos sin GPU: la version ONNX FP16 de 268,7 MB y la latencia de 26,33 ms en CPU permiten ejecutarlo en servidores modestos o dispositivos locales.

## Benchmarks y rendimiento
Los datos disponibles en la model card son evaluaciones OOD (out-of-distribution) y comparativas dentro de la familia. No se han publicado resultados de benchmarks estandar como MMLU, HumanEval o GSM8K, ya que no es un modelo generativo.

| Metrica | gibberish-noise-guard-small | madhurjindal (referencia) |
|---|---|---|
| Public OOD 3-Suite Mean ROC-AUC | 0,898 | 0,850 |
| Code/Math/JSON FPR @ 0,50 | 0,0% | 72,0% |
| Multilingual Clean FPR @ 0,50 | 2,7% | 97,8% |
| Multilingual Clean FPR @ 0,97 | 0,0% | 22,8% |
| Zero-Shot RU Gibberish AUC | 0,943 | 0,830 |
| Zero-Shot RU Gibberish F1 | 0,830 | 0,416 |
| Zero-Shot RU TPR@5%FPR | 0,851 | no disponible |
| Zero-Shot RU FPR | 1,6% | 98,4% |
| Zero-Shot RU 3-class F1 | 0,695 | no disponible |
| NLie2 Mild Gibberish AUC | 0,750 | no disponible |
| NLie2 Mild Gibberish TPR@5%FPR | 0,397 | 0,176 (2,25x menor) |
| GCG adversarial ROC-AUC | 1,0000 | no disponible |
| GCG adversarial TPR@5%FPR | 1,000 | no disponible |
| GCG adversarial FPR | 0,0% | no disponible |

Dentro de la familia, el modelo small multilingue mejora a las variantes en ingles en la mayoria de metricas OOD, a costa de mayor latencia y tamano.

| Modelo | Backbone | Parametros (total / cuerpo) | Idiomas | NLie2 Mild (AUC / TPR@5%FPR) | Zero-Shot RU AUC | OOD-3 medio | Code/JSON FPR@0,5 | Multi Clean FPR@0,5 | CPU FP32 @ 64 tok | ONNX FP16 |
|---|---|---|---|---|---|---|---|---|---|---|
| gibberish-noise-guard-tiny-en | ettin-encoder-32m | 32,0 M (12,7 M) | Ingles + codigo | 0,737 / 0,349 | 0,851 | 0,862 | 0,0% | 9,5% | 9,15 ms | 61,3 MB |
| gibberish-noise-guard-small-en | ettin-encoder-68m | 68,4 M (42,6 M) | Ingles + codigo | 0,741 / 0,343 | 0,903 | 0,881 | 0,0% | 21,5% | 25,62 ms | 130,9 MB |
| gibberish-noise-guard-small (este) | mmBERT-small | 140,6 M (42,3 M) | 15+ idiomas | 0,750 / 0,397 | 0,943 | 0,898 | 0,0% | 2,7% | 26,33 ms | 268,7 MB |

## Requisitos de hardware
- VRAM estimada: inferior a 1 GB en FP32 para inferencia por lotes pequenos; aproximadamente 270 MB para la version ONNX FP16.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; no requiere A100 ni H100. Funciona correctamente en RTX 4090, RTX 3090, T4 y GPUs integradas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch con `transformers>=4.48,<5`, ONNX Runtime (CPU y edge), integracion con `protectai/llm-guard` y despliegue como endpoint compatible con Text Embeddings Inference. No se menciona soporte nativo en vLLM, llama.cpp u Ollama, al no ser un modelo generativo.
- Latencia: 26,33 ms en CPU FP32 con secuencias de 64 tokens. No se proporcionan datos de throughput en GPU.
- Nota de compatibilidad: en PyTorch 2.4.x con CUDA y lotes con padding de mas de 512 tokens, se recomienda `attn_implementation="eager"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|---|
| gibberish-noise-guard-small | 140,6 M (42,3 M cuerpo) | 2.048 (RoPE hasta 8.192) | 15 | Apache-2.0 | OOD-3 0,898; 0,0% FPR en codigo; GCG AUC 1,0000 | Hugging Face, ONNX, llm-guard |
| madhurjindal/autonlp-Gibberish-Detector-492513457 | no disponible | no disponible | Practicamente solo ingles | no disponible | OOD-3 0,850; 72,0% FPR en codigo; 97,8% FPR multilingue | Hugging Face, incluido en llm-guard |
| wajidlinux99/gibberish-text-detector | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| gibberish-noise-guard-small-en | 68,4 M (42,6 M cuerpo) | 2.048 | Ingles + codigo | Apache-2.0 | OOD-3 0,881; 21,5% FPR multilingue | Hugging Face |

El modelo supera al detector de referencia en todas las metricas publicadas, con especial ventaja en falsos positivos sobre codigo y en cobertura multilingue. Frente a la variante `small-en`, sacrifica algo de velocidad y tamano a cambio de soporte para 15 idiomas y mejor FPR multilingue.

## Limitaciones y advertencias
- Es un clasificador, no un modelo generativo: no puede responder preguntas, generar codigo ni mantener conversaciones.
- El umbral recomendado es 0,50, no el 0,97 heredado de `llm-guard`. Usar 0,97 reduce la sensibilidad frente a gibberish leve y sufijos GCG.
- Requiere `transformers>=4.48,<5`; versiones anteriores no cargan correctamente los grafos ModernBERT/mmBERT.
- El FPR multilingue es bajo pero no nulo (2,7% a umbral 0,50); en dominios muy especializados conviene calibrar el umbral con datos propios.
- No se han publicado datos sobre sesgos demograficos, culturales o linguisticos especificos.
- Riesgo de alucinacion no aplica directamente al ser un clasificador, pero si puede producir falsos positivos o negativos en textos ambiguos o muy tecnicos.
- La licencia Apache-2.0 permite uso comercial, modificacion y redistribucion con atribucion; no se indican restricciones adicionales.
- El modelo se publico en noviembre de 2026 y no registra descargas ni likes, por lo que no existe validacion independiente de la comunidad.
- No se detallan los hiperparametros de entrenamiento, el numero de tokens vistos ni la composicion exacta del dataset, lo que limita la reproducibilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Tamarillo/gibberish-noise-guard-small
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Detector de referencia sustituido: https://huggingface.co/madhurjindal/autonlp-Gibberish-Detector-492513457
- Detector alternativo: https://huggingface.co/wajidlinux99/gibberish-text-detector
- Repositorio llm-guard: https://github.com/protectai/llm-guard
- Demo WASM (familia): https://huggingface.co/spaces/Tamarillo/gibberish-noise-guard-demo
- Dataset de preferencias: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Dataset GCG: https://huggingface.co/datasets/MatanBT/gcg-evaluated-data
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset Competition Math: https://huggingface.co/datasets/qwedsacf/competition_math
- Dataset BillSum: https://huggingface.co/datasets/FiscalNote/billsum
