# VoightKampffLabs/voi-slop-detect-380M

## Resumen

voi-slop-detect-380M es un modelo de clasificación de texto disenado para estimar que proporcion de un texto en ingles ha sido escrita por un modelo de lenguaje. Lo desarrolla VoightKampffLabs y se presenta como el miembro pequeno de una familia que incluye un hermano mayor, voi-slop-detect-4B. A diferencia de los detectores binarios habituales, devuelve una puntuacion continua entre 0 y 1 entrenada para aproximar la fraccion de palabras modificadas por un LLM: 0 para escritura humana intacta, en torno a 0,3 para un borrador humano pulido por un chatbot y 1 para texto generado desde cero.

El modelo es un fine-tune completo del encoder dmis-lab/UltraBERT-380M, con 377.538.561 parametros y una cabeza de una sola salida con mean pooling. Consume los primeros 512 tokens del texto (vaciando previamente los bloques de codigo delimitados) y produce un logit cuya sigmoide es la puntuacion final. Su interes practico radica en que cabe en CPU, se distribuye con grafos ONNX y ofrece umbrales calibrados para separar las bandas humano, editado por IA y generado por IA.

La relevancia actual viene de su rendimiento declarado frente a detectores comerciales y academicos en benchmarks de deteccion, incluidos escenarios de evasion por parafraseo o humanizacion, y de su licencia Apache 2.0, que permite uso comercial sin restricciones adicionales. El modelo solo soporta ingles y esta pensado como componente de clasificacion, no como generador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (UltraBERT-380M) con cabeza de clasificacion de una salida y mean pooling |
| Parametros totales | 377.538.561 (378M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (solo se procesan los primeros 512 tokens del texto) |
| Tipos de cuantizacion | Pesos en bf16 safetensors; grafos ONNX incluidos en `onnx/` (no se detallan otras cuantizaciones) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, 755 MB) y ONNX |

## Arquitectura y entrenamiento

El modelo parte de dmis-lab/UltraBERT-380M y aplica un fine-tune completo con una unica cabeza de salida sobre representaciones obtenidas por mean pooling. La entrada se trunca a los primeros 512 tokens y los bloques de codigo delimitados se vacian antes de la tokenizacion, de modo que el codigo no contamine la puntuacion. La salida es un unico logit y la puntuacion final es su sigmoide.

El entrenamiento consistio en 3 epocas con learning rate 8e-6, batch de 64 y perdida BCE sobre la puntuacion con pesos balanceados por banda. Los datos de entrenamiento incluyen textos generados con GPT-4o mini, GPT-5 mini y Gemini 2.5 Flash-Lite, ademas de texto humano procedente de fuentes como Amazon y XSum. El objetivo de regresion no es una etiqueta binaria sino la fraccion de palabras modificadas por el modelo, lo que permite distinguir entre texto humano, texto editado por IA y texto generado integramente por IA.

El repositorio incluye `bands.json` con los umbrales calibrados: por debajo de `human_max` (0,15) el texto se considera humano; a partir de `generated_min` (0,75) se considera generado por IA; el intervalo intermedio corresponde a texto editado por IA. Existe ademas un corte independiente `flag_min` (0,426) para la pregunta binaria si/no, fijado de modo que solo el 1% de los textos humanos de validacion resulten marcados. Los grafos ONNX se miden contra el modelo PyTorch sobre 500 textos de validacion de EditLens, con deriva de puntuacion documentada en la model card.

## Capacidades

- Deteccion de texto generado por IA en ingles con una puntuacion continua de 0 a 1.
- Clasificacion en tres bandas: humano, editado por IA y generado por IA, mediante umbrales calibrados.
- Modo de decision binaria (si/no) con un umbral ajustado a una tasa de falsos positivos del 1% sobre texto humano de validacion.
- Estimacion de la fraccion de texto modificada por un LLM, no solo una etiqueta.
- Inferencia en CPU gracias a los grafos ONNX incluidos.
- Ejecucion como pipeline de `text-classification` en la libreria transformers.
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en plataformas de publicacion: el modelo puede puntuar envios y marcar automaticamente aquellos con alta probabilidad de generacion por IA, usando el umbral `flag_min` para mantener baja la tasa de falsos positivos sobre autores humanos.
- Verificacion academica: integrado en flujos de revision de trabajos, permite distinguir entre un ensayo escrito por el alumno y uno pulido o generado por un chatbot gracias a la banda intermedia de texto editado por IA, mas informativa que una etiqueta binaria.
- Analisis de resenas y opiniones en comercio electronico: puntuar resenas para detectar contenido generado o reescrito por LLM y priorizar la revision manual de las que superan `generated_min`.
- Filtrado de datasets para entrenamiento: descartar o etiquetar muestras generadas por IA antes de construir corpus de entrenamiento, usando la puntuacion como criterio de seleccion.
- Deteccion de evasion por parafraseo: el modelo declara resultados especificos frente a texto humanizado y parafraseado, lo que lo hace util en pipelines que necesitan detectar reescrituras disenadas para evadir detectores.
- Procesamiento por lotes en infraestructura sin GPU: al ejecutarse en CPU con ONNX, puede desplegarse en servicios de clasificacion de bajo coste para volumentes altos de documentos cortos.
- Auditoria de contenido editorial: estimar que proporcion de un articulo ha sido asistida por IA para aplicar politicas editoriales internas basadas en la banda de puntuacion.

## Benchmarks y rendimiento

Los datos siguientes provienen de la model card del autor. Macro-F1 sobre tres clases (humano, editado por IA, generado por IA); en negrita el mejor valor de cada fila segun el autor:

| Benchmark | EditLens | voi-380M | Pangram 3 | EditLens 24B | GPTZero |
|---|--:|--:|--:|--:|--:|
| test | 0,861 | **0,920** | 0,904 | 0,727 | no disponible |
| test, AI-edited F1 | 0,772 | **0,876** | 0,868 | 0,509 | no disponible |
| dominio no visto (Enron) | 0,807 | **0,909** | 0,866 | no disponible | no disponible |
| generador no visto (Llama 3.3) | 0,872 | **0,951** | 0,850 | no disponible | no disponible |

Texto humano marcado como IA (menor es mejor):

| Benchmark | n | voi-380M | Pangram 4 | Pangram 3 | GPTZero | Originality.ai |
|---|--:|--:|--:|--:|--:|--:|
| Learner English | 19.817 | 0,6% | **0,0%** | **0,0%** | no disponible | no disponible |
| Epoch AI | 495 | 0,2% | **0,0%** | **0,0%** | **0,0%** | 3,8% |
| Human Detectors | 150 | 3,3% | no disponible | **0,0%** | 0,7% | no disponible |
| Peer reviews | 468 | **0,0%** | **0,0%** | **0,0%** | 1,0% | no disponible |
| UChicago | 1.992 | 0,8% | **0,0%** | **0,0%** | 0,7% | 0,1% |

Texto de IA no detectado (menor es mejor):

| Benchmark | n | voi-380M | Pangram 4 | Pangram 3 | GPTZero | Originality.ai |
|---|--:|--:|--:|--:|--:|--:|
| Epoch AI, plain | 297 | **0,0%** | no disponible | **0,0%** | 0,7% | 0,3% |
| Epoch AI, imitation | 297 | **7,7%** | no disponible | 10,1% | 10,8% | 17,8% |
| Human Detectors | 150 | 0,7% | no disponible | **0,0%** | 16,0% | no disponible |
| UChicago | 7.968 | 0,2% | **0,0%** | 0,1% | 1,4% | 5,9% |
| GEDE, generated | 5.424 | 4,0% | **0,0%** | **0,0%** | 6,8% | no disponible |
| Peer reviews, easy | 274 | 28,5% | 1,8% | **0,0%** | 3,3% | no disponible |
| Peer reviews, hard | 750 | 14,0% | **0,0%** | **0,0%** | 4,0% | no disponible |

Texto reescrito para evadir o editado, no detectado (menor es mejor):

| Benchmark | n | voi-380M | Pangram 4 | Pangram 3 | GPTZero | Originality.ai |
|---|--:|--:|--:|--:|--:|--:|
| Human Detectors, humanized | 30 | **0,0%** | no disponible | 10,0% | 53,3% | no disponible |
| Human Detectors, paraphrased | 30 | 3,3% | no disponible | **0,0%** | **0,0%** | no disponible |
| UChicago, StealthGPT | 7.966 | 74,0% | **1,1%** | 1,9% | 55,7% | 71,5% |
| GEDE, DIPPER | 1.783 | 98,8% | **0,0%** | **0,0%** | 7,4% | no disponible |
| GEDE, LLM-improved | 1.832 | 50,4% | **0,0%** | 2,6% | 45,3% | no disponible |

El propio autor advierte de que los demas detectores no siempre se puntuan sobre los mismos textos ni en el mismo punto de operacion, que sus cifras en GEDE y UChicago estan a 1% de falsos positivos sobre los textos humanos de cada benchmark y que Pangram usa un subconjunto elegido por el. Tambien senala que el modelo se entrena con GPT-4o mini, GPT-5 mini y Gemini 2.5 Flash-Lite, con posibles solapamientos de generadores y fuentes humanas con los benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo pesa 755 MB en bf16; en FP32 serian aproximadamente 1,5 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU mediante los grafos ONNX. En GPU, cualquier tarjeta con al menos 2 GB de memoria libre es suficiente (RTX 3060, RTX 4090, A100, H100, etc.).
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas, e incluso en CPU.
- Opciones de despliegue: transformers (pipeline `text-classification`), ONNX Runtime con los grafos de `onnx/`, y cualquier servidor compatible con modelos de clasificacion transformers. El tag `endpoints_compatible` sugiere compatibilidad con los endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al procesar solo 512 tokens y ser un encoder de 378M, la latencia esperada es baja, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| voi-slop-detect-380M | 378M | 512 tokens | Detector de texto IA (encoder) | Apache 2.0 | Hugging Face |
| voi-slop-detect-4B | no disponible | no disponible | Detector de texto IA (hermano mayor) | no disponible | Hugging Face |
| EditLens 24B | 24B | no disponible | Detector de texto IA | no disponible | Benchmark / paper |
| Pangram 3 / Pangram 4 | no disponible | no disponible | Detector comercial | propietaria | Servicio comercial |
| GPTZero | no disponible | no disponible | Detector comercial | propietaria | Servicio comercial |
| Originality.ai | no disponible | no disponible | Detector comercial | propietaria | Servicio comercial |

En Macro-F1 sobre tres clases, voi-380M declara 0,920 en test frente a 0,904 de Pangram 3, 0,861 de EditLens y 0,727 de EditLens 24B. En escenarios de evasion es donde el modelo muestra sus mayores carencias relativas: con DIPPER solo detecta el 1,2% del texto reescrito, frente al 100% de Pangram 4 y el 92,6% de GPTZero.

## Limitaciones y advertencias

- Solo soporta ingles; no hay evidencia de comportamiento en otros idiomas.
- La entrada se trunca a los primeros 512 tokens, de modo que la puntuacion ignora el resto del documento.
- Riesgo de falsos positivos sobre texto humano: 0,6% en Learner English, 3,3% en Human Detectors y 0,8% en UChicago, segun los umbrales empleados.
- Elevada tasa de no deteccion en texto reescrito para evadir: 74,0% con StealthGPT, 98,8% con DIPPER y 50,4% con LLM-improved.
- Tasa notable de no deteccion en resenas por pares generadas: 28,5% en el subconjunto facil y 14,0% en el dificil.
- El modelo se entrena con salidas de GPT-4o mini, GPT-5 mini y Gemini 2.5 Flash-Lite; su comportamiento frente a generadores muy distintos o posteriores no esta garantizado.
- Posible solapamiento entre los datos de entrenamiento y los benchmarks empleados (fuentes humanas como Amazon y XSum, generadores compartidos con otros benchmarks), lo que puede inflar las cifras declaradas.
- Los umbrales (`human_max` 0,15, `generated_min` 0,75, `flag_min` 0,426) estan calibrados sobre datos de validacion concretos; en produccion conviene revalidarlos sobre el dominio propio.
- No es un generador: no admite tool calling, agentes, vision ni audio.
- Licencia Apache 2.0, sin restricciones adicionales para uso comercial, heredada del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VoightKampffLabs/voi-slop-detect-380M
- Modelo hermano mayor: https://huggingface.co/VoightKampffLabs/voi-slop-detect-4B
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- Dataset EditLens: https://huggingface.co/datasets/pangram/editlens_iclr
- Corpus ELLIPSE: https://github.com/scrosseye/ELLIPSE-Corpus
- Dataset PELIC: https://github.com/ELI-Data-Mining-Group/PELIC-dataset
- ChatGPT-Detector-Bias (TOEFL): https://github.com/Weixin-Liang/ChatGPT-Detector-Bias
- Epoch AI (ai-text-detectors): https://github.com/jaeholee-brown/ai-text-detectors
- Human Detectors: https://github.com/jenna-russell/human_detectors
- DetectionAI (UChicago): https://github.com/brianjabarian/DetectionAI
- GEDE: https://github.com/lukasgehring/Assessing-LLM-Text-Detection-in-Educational-Contexts
- Dataset de resenas por pares: https://huggingface.co/datasets/rounaksaha12/ai-in-peer-review
