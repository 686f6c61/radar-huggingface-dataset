# trace-000/bitgc-lm-1b

## Resumen

bitgc-lm-1b es un modelo de lenguaje en coreano de 1.092.923.440 parámetros (1,09B) desarrollado por trace-000, publicado en Hugging Face con licencia MIT. Se trata de la versión afinada para diálogo e instrucciones del modelo de investigación E1d-G, construido sobre una arquitectura híbrida poco habitual: pesos ternarios (BitNet b1.58, valores {-γ, 0, +γ}) en todas las capas lineales, activaciones de 8 bits (BitLinear) y una combinación de atención y convolución con puerta (gated convolution) en lugar de atención completa en todas las capas.

El modelo resuelve un problema de eficiencia: al usar pesos ternarios, la inferencia puede ejecutarse en CPU en fp32 (4,4 GB de pesos) o mediante un motor entero propio (ternario × int8, sin multiplicaciones) que ocupa 411 MB y genera a unos 7 ms/token con 16 hilos. La ventana de contexto es de solo 512 tokens, lo que lo sitúa en el segmento de asistentes conversacionales ligeros y de bajo coste, no en el de modelos de propósito general.

Es relevante ahora porque ejemplifica la línea de investigación de BitNet b1.58 aplicada a una arquitectura híbrida conv/attention con una innovación concreta: una "puerta de capa de recuerdo" que bloquea la salida de una capa concreta (bloque 11) en la posición del primer token de respuesta. El autor reporta que esta puerta mejora notablemente el seguimiento de instrucciones en su evaluación interna (de 22 a 64 sobre 126 preguntas sin reglas de decodificación). No obstante, se trata de un modelo de investigación con evaluación exclusivamente propia, sin benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas, 6 con atención (bloques 3, 7, 11, 15, 19, 23) y 18 con convolución con puerta (kernel 9); capas lineales BitLinear ternarias |
| Parametros totales | 1.092.923.440 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | Pesos ternarios {-γ, 0, +γ} nativos (BitNet b1.58) con activaciones de 8 bits; motor entero propio (ternario × int8); ejecución en CPU fp32 |
| Idiomas soportados | Coreano (ko) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería pytorch); motor empaquetado en .npz (411 MB) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de 24 capas en el que solo 6 capas usan atención (bloques 3, 7, 11, 15, 19 y 23); las otras 18 emplean una convolución con puerta de kernel 9. Todas las capas lineales de los bloques son BitLinear con pesos ternarios y activaciones de 8 bits, la FFN usa ReLU² y hay escalares de residual. La innovación destacada es la "puerta de capa de recuerdo": durante el preentrenamiento se identifica automáticamente una capa de recuerdo (el bloque 11) y su salida se bloquea en la posición del primer token de respuesta (`<|bot|>`). El `config.json` registra este ajuste en el campo `recall` y el código lo aplica automáticamente al cargar el modelo; el SFT conversacional se entrenó ya con la puerta activa.

El preentrenamiento (etapa E1d) usó 2.375B tokens de una mezcla de corpus de AI Hub y Wikipedia en coreano, durante 289.418 pasos con batch 16×512, learning rate 1.5e-4 con decaimiento coseno, precisión bf16 y aproximadamente 33 horas en una A100. Después se aplicaron tres fases de SFT: diálogo (0,5 época, lr 3e-5, con replay del corpus de preentrenamiento en proporción 4/8), lectura de textos (preguntas con documento de Wikipedia adjunto y respuesta extraída del texto, 1 época) e instrucciones (preguntas de formato generadas automáticamente, 1 época). El tokenizador es SentencePiece BPE con vocabulario de 16.384, entrenado sobre los datos de AI Hub.

## Capacidades

- Generación de texto y diálogo multi-turno en coreano.
- Seguimiento de instrucciones de formato (el autor reporta 75,0 sobre 126 preguntas con reglas de decodificación).
- Lectura comprensiva de documentos: respuesta a preguntas cuyo contenido está en un texto adjunto (entrenado específicamente para ello con documentos de Wikipedia).
- Conversación sobre dominios técnico-científicos y de ciencias sociales (datos AI Hub 009 y 010).
- Búsqueda de conocimiento conversacional (datos AI Hub 045).
- Generación de texto de sentido común (datos AI Hub 048 y 049).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No dispone de visión, audio ni modo de razonamiento explícito (thinking).
- Capacidad multilingüe: no disponible; el modelo está entrenado únicamente en coreano.

## Casos de uso

- Asistente conversacional ligero en coreano: el modelo gestiona diálogos multi-turno dentro de su ventana de 512 tokens, adecuado para chatbots de soporte básico donde el coste de inferencia en CPU es determinante.
- Despliegue en dispositivos sin GPU: gracias al motor entero de 411 MB y a los ~7 ms/token con 16 hilos, puede ejecutarse en servidores modestos o equipos de escritorio para tareas de generación de texto en coreano.
- Respuesta a preguntas sobre documentos cortos: su SFT de lectura de textos le permite responder preguntas cuya respuesta está contenida en un documento adjunto de hasta 512 tokens, útil para resúmenes de fichas o extracción de datos de textos breves.
- Prototipado e investigación en cuantización ternaria: sirve como banco de pruebas reproducible para estudiar arquitecturas híbridas conv/attention con pesos de 1,58 bits y técnicas como la puerta de capa de recuerdo.
- Generación de texto de dominio técnico y científico en coreano: los datos de preentrenamiento y SFT incluyen corpus de tecnología, ciencia y ciencias sociales, por lo que puede redactar borradores en esos registros.
- Filtrado y clasificación de conversaciones: como generador de texto pequeño y barato, puede emplearse para tareas auxiliares de reescritura, normalización o generación de variantes de una frase en pipelines de datos en coreano.
- Educación y experimentación docente: su licencia MIT y su ejecución en CPU facilitan su uso en cursos sobre modelos de lenguaje y eficiencia energética.

## Benchmarks y rendimiento

Los únicos datos disponibles son la evaluación interna del autor, que no constituye un benchmark externo. Se comparan con E1c, la versión anterior de la misma arquitectura (convolución dilatada, sin escalares de residual y sin puerta).

| Metrica | bitgc-lm-1b | E1c |
|---|---|---|
| Perplejidad de validación en preentrenamiento (misma validación) | 9,02 | 9,25 |
| Seguimiento de instrucciones, 126 preguntas (reglas de decodificación, media de 3 semillas) | 75,0 | 55,7 |
| Mismas preguntas sin reglas de decodificación, semilla 0, con puerta | 64 | 52 |
| Mismas preguntas sin reglas de decodificación, semilla 0, sin puerta | 22 | no disponible |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Inferencia en CPU fp32: pesos de 4,4 GB, generación incremental, sin necesidad de GPU.
- Motor entero propio: artefacto de 411 MB, generación sin multiplicaciones en CPU, aproximadamente 7 ms/token con 16 hilos.
- VRAM estimada para GPU: no disponible; el autor solo documenta ejecución en CPU.
- GPU recomendadas: no disponible. El entrenamiento se realizó en A100 (unas 33 horas para el preentrenamiento), pero no se especifican requisitos de inferencia en GPU.
- ¿Cabe en GPU de consumo? No disponible como dato oficial; por tamaño (1,09B parámetros), en fp16 ocuparía del orden de 2,2 GB, pero no se confirma compatibilidad ni rendimiento.
- Opciones de despliegue: repositorio propio (https://github.com/Trace-0/bitgc-lm) con `chat.py`; carga directa desde Hugging Face mediante `--ckpt hf:trace-000/bitgc-lm-1b`; motor entero mediante `python -m bitgc.engine.build`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 7 ms/token en CPU con el motor entero y 16 hilos; no se proporcionan datos de throughput en GPU.

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos ni de comparaciones oficiales con otros modelos. A continuación se comparan características técnicas con alternativas de tamaño y planteamiento similares, usando solo datos verificables de sus especificaciones públicas cuando se conocen; en caso contrario se indica "no disponible".

| Modelo | Parametros | Contexto | Cuantizacion nativa | Idiomas | Licencia |
|---|---|---|---|---|---|
| bitgc-lm-1b | 1,09B | 512 | Ternaria (BitNet b1.58) | Coreano | MIT |
| BitNet b1.58 2B4T (Microsoft) | 2B | 4.096 | Ternaria (1,58 bits) | Inglés y multilingüe | MIT |
| Modelos coreanos de ~1B (p. ej. familia Polyglot-Ko o similares) | ~1B | no disponible | No nativa (fp16/bf16) | Coreano | no disponible |

La comparación de rendimiento con estos modelos no está disponible: el autor no publica evaluaciones frente a terceros y bitgc-lm-1b solo cuenta con evaluación interna propia.

## Limitaciones y advertencias

- Evaluación exclusivamente interna: los resultados de la tabla de benchmarks los ha producido el propio autor con preguntas de su diseño; no hay validación externa ni comparación con estándares como MMLU o HumanEval.
- Conocimiento factual débil: el autor advierte explícitamente de que el conocimiento de hechos, el contexto largo y la conversación libre son puntos flojos del modelo.
- Riesgo de alucinación: la model card indica que el modelo puede inventar contenido incorrecto; no debe usarse como fuente de verdad sin verificación.
- Contexto muy limitado: 512 tokens restringen su uso a documentos y conversaciones cortas; no es apto para tareas de contexto largo.
- Monolingüe: solo coreano; no se garantiza un comportamiento correcto en otros idiomas.
- Dependencia de una innovación no replicada externamente: la puerta de capa de recuerdo está implementada en el código del autor y registrada en `config.json`; su efecto solo está documentado en la evaluación interna, y sin la puerta el rendimiento cae de 64 a 22 en la métrica del autor.
- Licencia MIT: permite uso comercial, pero al tratarse de un modelo de investigación con evaluación limitada, el autor no ofrece garantías de calidad en producción.
- Datos de entrenamiento con atribución: parte del corpus proviene de AI Hub y de Wikipedia en coreano (CC BY-SA 4.0); conviene revisar las condiciones de atribución de esas fuentes si se redistribuye el modelo o derivados.
- Madurez del ecosistema: solo 49 descargas y 0 likes en el momento de la ficha, sin integraciones documentadas con frameworks de despliegue estándar (vLLM, llama.cpp, TGI).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trace-000/bitgc-lm-1b
- Repositorio de código: https://github.com/Trace-0/bitgc-lm
- AI Hub (datos de entrenamiento): https://www.aihub.or.kr
- Wikipedia en coreano (datos de entrenamiento): https://ko.wikipedia.org
