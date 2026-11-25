# Tamarillo/gibberish-noise-guard-small-en

## Resumen

Tamarillo/gibberish-noise-guard-small-en es un clasificador de texto en ingles disenado para detectar gibberish, ruido y corrupcion textual en entradas y salidas de modelos de lenguaje. Lo desarrolla el usuario independiente Tamarillo y se publica bajo licencia Apache-2.0. El modelo resuelve un problema concreto de produccion: los filtros de gibberish por defecto en librerias como protectai/llm-guard disparan falsos positivos masivos sobre codigo, JSON, matematicas y llamadas a herramientas, lo que rompe pipelines de agentes. Este modelo se presenta como sustituto directo de madhurjindal/autonlp-Gibberish-Detector-492513457, con el mismo mapeo de 4 clases y un tamano practicamente identico.

Arquitectura ModernBERT (variante Ettin) con 68,4 millones de parametros totales (42,6 M en el cuerpo del encoder), entrenada con 2.048 tokens de contexto y ventana nativa RoPE de 8.192 tokens. Frente al DistilBERT de referencia (67,0 M), cuadruplica la longitud de contexto y reduce el FPR en codigo/JSON del 72,0% al 0,0% sobre 600 muestras. Su relevancia actual esta en el despliegue de agentes y sistemas de observabilidad: clasificar en milisegundos si un texto es basura adversarial (incluidos sufijos GCG) sin penalizar entradas tecnicas legitimas.

El modelo forma parte de una familia de tres variantes (tiny-en de 32 M, small-en de 68 M y small multilingue de 140 M basada en mmBERT-small). Esta ficha cubre la variante small-en, orientada a ingles y codigo, con inferencia en CPU de 25,62 ms por secuencia de 64 tokens en ONNX FP32.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer, base Ettin), clasificacion de secuencias |
| Parametros totales | 68.409.348 (42,6 M en el cuerpo del encoder) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens de entrenamiento; 8.192 tokens nativos con RoPE |
| Tipos de cuantizacion | FP32 (ONNX, 261,4 MB) y FP16 (ONNX, 130,9 MB); no se documentan GGUF ni INT8 |
| Idiomas soportados | Ingles y codigo |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (model.onnx y model_fp16.onnx) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de la familia Ettin (jhu-clsp/ettin-encoder-68m) adaptado a clasificacion de texto con 4 clases: `clean`, `mild gibberish`, `noise` y `word salad`. Usa embeddings posicionales rotatorios (RoPE) que permiten extender la ventana nativa hasta 8.192 tokens, aunque el entrenamiento se realiza a 2.048 tokens. La cabeza de clasificacion emite probabilidades softmax calibradas mediante label smoothing, lo que permite aplicar umbrales mas bajos (0,50) sin disparar falsos positivos.

Los datos de entrenamiento combinan varios conjuntos publicos: lmarena-ai/arena-human-preference-140k (texto limpio conversacional), MatanBT/gcg-evaluated-data (sufijos adversariales GCG), google-research-datasets/mbpp y qwedsacf/competition_math (codigo y matematicas), y FiscalNote/billsum (texto formal largo). No se especifica el numero total de tokens de entrenamiento ni la composicion porcentual del dataset. La innovacion tecnica principal es el tratamiento explicito de codigo, JSON y matematicas como clases negativas durante el entrenamiento, junto con la incorporacion de ejemplos adversariales GCG, lo que explica el 0,0% de FPR en codigo y el 1,0000 de ROC-AUC sobre sufijos GCG reales.

## Capacidades

- Clasificacion de texto en 4 clases (clean, mild gibberish, noise, word salad) con probabilidades calibradas.
- Deteccion de gibberish leve (texto casi legible pero corrupto) con AUC de 0,741 y TPR@5%FPR de 0,343 en el benchmark NLie2.
- Deteccion de ruido puro y word salad (palabras aleatorias, caracteres sueltos, simbolos).
- Deteccion de sufijos adversariales GCG con ROC-AUC de 1,0000 y TPR@1%FPR de 1,000.
- Tolerancia a codigo, JSON, SQL y expresiones matematicas sin falsos positivos (0/600 en el conjunto de evaluacion).
- Capacidad zero-shot parcial en ruso (AUC de 0,903) pese a estar entrenado solo en ingles.
- Integracion como escaner de entrada y salida en protectai/llm-guard con el mismo mapeo de etiquetas.
- Inferencia en CPU y edge mediante ONNX Runtime, sin GPU.
- No soporta tool calling, agentes, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Filtrado de entrada en agentes LLM: colocar el modelo antes del prompt del agente para descartar entradas corruptas o ataques de word salad, con umbral 0,50 y latencia de 25 ms en CPU.
- Filtrado de salida en produccion: validar que la respuesta del LLM no es gibberish antes de mostrarla al usuario, sustituyendo el escaner Gibberish de llm-guard sin cambiar el codigo de integracion.
- Defensa frente a ataques GCG: detectar sufijos adversariales optimizados que intentan saltar los filtros de seguridad del modelo principal, gracias al AUC de 1,0000 sobre el conjunto GCG evaluado.
- Observabilidad de agentes: monitorizar trazas y logs de ejecucion para marcar conversaciones degradadas o bucles de generacion corrupta, usando la clase `noise` como senal de alerta.
- Validacion de pipelines de codigo: aceptar bloques de codigo, SQL y JSON generados por el modelo sin falsos positivos, lo que permite aplicar el filtro en CI/CD y en herramientas de autocompletado.
- Moderacion de contenido generado por usuarios: detectar spam, texto tecleado al azar o relleno automatico en formularios y comentarios, con un coste de inferencia minimo en CPU.
- Preprocesado de datasets: limpiar corpus de entrenamiento eliminando muestras corruptas antes de fine-tuning, con throughput alto al ejecutarse en ONNX Runtime sobre CPU.
- Despliegue en edge o navegador: usar la variante tiny-en (32 M) o esta small-en en ONNX FP16 (130,9 MB) para filtrado local en dispositivos sin GPU.

## Benchmarks y rendimiento

| Metrica | gibberish-noise-guard-small-en | gibberish-noise-guard-tiny-en | gibberish-noise-guard-small (multilingue) | madhurjindal (referencia) |
|---|---|---|---|---|
| Parametros totales | 68,4 M | 32,0 M | 140,6 M | 67,0 M |
| NLie2 mild gibberish AUC | 0,741 | 0,737 | 0,750 | no disponible |
| NLie2 TPR@5%FPR | 0,343 | 0,349 | 0,397 | no disponible |
| Zero-shot RU AUC | 0,903 | 0,851 | 0,943 | no disponible |
| Public OOD-3 mean ROC-AUC | 0,881 | 0,862 | 0,898 | 0,850 |
| FPR en codigo/JSON @0,5 | 0,0% (0/600) | 0,0% | 0,0% | 72,0% |
| FPR multi clean @0,5 | 21,5% | 9,5% | 2,7% | no disponible |
| Latencia CPU FP32 @64 tok | 25,62 ms | 9,15 ms | 26,33 ms | no disponible |
| Tamano ONNX FP16 | 130,9 MB | 61,3 MB | 268,7 MB | no disponible |
| GCG ROC-AUC | 1,0000 | no disponible | no disponible | no disponible |
| GCG TPR@1%FPR | 1,000 | no disponible | no disponible | no disponible |
| GCG F1 (FPR 0,0%) | 0,986 | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks estandar de NLP (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el modelo es un clasificador y no un generador.

## Requisitos de hardware

- VRAM para inferencia: no requiere GPU; en FP32 ocupa aproximadamente 261,4 MB y en FP16 unos 130,9 MB en memoria.
- GPU recomendadas: cualquiera con al menos 1 GB de VRAM si se desea acelerar; no es necesario para produccion.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en CPU modesta y dispositivos edge.
- Despliegue: transformers (PyTorch), ONNX Runtime (CPUExecutionProvider), text-embeddings-inference y endpoints compatibles; tambien como escaner de llm-guard con `use_onnx=False` o `use_onnx=True`.
- Latencia: 25,62 ms por lote de 64 tokens en CPU FP32 ONNX; menor en FP16. No se publica throughput agregado.
- Requiere `transformers>=4.48,<5` para cargar grafos ModernBERT. En PyTorch 2.4.x con CUDA y lotes de mas de 512 tokens, usar `attn_implementation="eager"`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | FPR codigo/JSON | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tamarillo/gibberish-noise-guard-small-en | 68,4 M | 2.048 (8.192 nativo) | Ingles + codigo | 0,0% | Apache-2.0 | Hugging Face |
| Tamarillo/gibberish-noise-guard-tiny-en | 32,0 M | 2.048 (8.192 nativo) | Ingles + codigo | 0,0% | Apache-2.0 | Hugging Face |
| Tamarillo/gibberish-noise-guard-small | 140,6 M | 2.048 (8.192 nativo) | 15+ idiomas | 0,0% | Apache-2.0 | Hugging Face |
| madhurjindal/autonlp-Gibberish-Detector-492513457 | 67,0 M | 512 | Ingles | 72,0% | no disponible | Hugging Face |
| wajidlinux99/gibberish-text-detector | no disponible | no disponible | Ingles | no disponible | no disponible | Hugging Face |

## Limitaciones y advertencias

- Entrenado solo en ingles y codigo; el rendimiento en otros idiomas es zero-shot y no garantizado (AUC de 0,903 en ruso, sin datos para el resto).
- FPR del 21,5% en el conjunto Multi Clean a umbral 0,5, superior al 9,5% de la variante tiny y al 2,7% de la multilingue; conviene calibrar el umbral segun el dominio.
- El umbral recomendado es 0,50, no el 0,97 heredado de llm-guard; usar 0,97 reduce drasticamente la recall en gibberish leve y sufijos GCG.
- Riesgo de alucinacion no aplica como generador, pero si puede clasificar mal textos tecnicos muy especializados o dominios no vistos (medicina, legal, jerga).
- Dependencia estricta de `transformers>=4.48,<5`; entornos con versiones antiguas de optimum pueden no cargar los grafos ONNX de ModernBERT.
- No se documentan sesgos especificos ni evaluaciones de equidad; al ser un clasificador binario de calidad textual, el riesgo de sesgo linguistico y de dominio es relevante.
- Licencia Apache-2.0 permite uso comercial, pero no se ofrece garantia ni soporte del autor.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: madurez y validacion por la comunidad muy limitadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tamarillo/gibberish-noise-guard-small-en
- Modelo base: https://huggingface.co/jhu-clsp/ettin-encoder-68m
- Variante tiny: https://huggingface.co/Tamarillo/gibberish-noise-guard-tiny-en
- Variante multilingue: https://huggingface.co/Tamarillo/gibberish-noise-guard-small
- Demo WASM en navegador: https://huggingface.co/spaces/Tamarillo/gibberish-noise-guard-demo
- Repositorio de llm-guard: https://github.com/protectai/llm-guard
- Modelo de referencia sustituido: https://huggingface.co/madhurjindal/autonlp-Gibberish-Detector-492513457
- Dataset de preferencias: https://huggingface.co/datasets/lmarena-ai/arena-human-preference-140k
- Dataset GCG: https://huggingface.co/datasets/MatanBT/gcg-evaluated-data
- Dataset MBPP: https://huggingface.co/datasets/google-research-datasets/mbpp
- Dataset Competition Math: https://huggingface.co/datasets/qwedsacf/competition_math
- Dataset Billsum: https://huggingface.co/datasets/FiscalNote/billsum
