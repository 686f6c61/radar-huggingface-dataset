# vllm-sr/vela3.1-pico-380m

## Resumen

vela3.1-pico-380m es un modelo encoder de 381 millones de parámetros desarrollado por vllm-sr (KR Labs) como parte de la familia Vela 3.1, orientada al enrutamiento semántico y a la clasificación de decisiones en pipelines de LLM. Se trata de un fine-tuning de dmis-lab/UltraBERT-380M que no genera texto: en una única pasada forward devuelve probabilidades para preguntas de elección múltiple, respuestas sí/no y etiquetas de span con offsets de caracteres. Su función es actuar como "modelo de sistema uno" que decide, filtra y verifica antes de que una petición llegue al modelo generativo.

El modelo resuelve cuatro tareas concretas: enrutar peticiones al modelo, herramienta o equipo adecuado; cribar solicitudes peligrosas (contenido dañino, prompt injection, jailbreak); detectar datos personales antes de registrar o reenviar texto; y verificar afirmaciones de una respuesta frente a su contexto fuente para detectar alucinaciones. Todo ello en una sola llamada, lo que reduce la latencia y el coste frente a pipelines que encadenan varios modelos especializados.

Es relevante ahora porque propone una alternativa compacta (0,4B) y de una sola pasada a arquitecturas de enrutamiento que requieren múltiples modelos o varias inferencias. Con licencia Apache-2.0, soporte para 15 idiomas y un índice de decisión de 50,51 en la parte pública del Decision Index, se posiciona como una opción viable para despliegues en CPU y en infraestructura modesta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UltraBERT), fine-tuning de dmis-lab/UltraBERT-380M |
| Parámetros totales | 380.961.025 (381M; el checkpoint base lee 430M porque incluye una capa de salida masked-LM de 50M que este paquete no distribuye) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens para llamadas con preguntas de seguridad, señal o span; hasta 32K tokens para llamadas solo de decisión |
| Tipos de cuantización | fp32 (pesos publicados); encoder int8 ONNX disponible para inferencia acelerada |
| Idiomas soportados | en, de, fr, es, it, pt, nl, pl, hu, ru, ar, hi, ja, ko, zh (15 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (fp32, 1,5 GB), ONNX (int8), transformers con custom_code |

## Arquitectura y entrenamiento

El modelo se basa en UltraBERT-380M, un encoder transformer de la familia BERT, y se ha fine-tuneado a partir del backbone de decisión de vela3.1-fast. No es un modelo generativo: la cabeza de salida está adaptada para producir probabilidades por opción (choice), probabilidades sí/no (noul) y etiquetas de span con offsets de caracteres para token-classification. El paquete distribuido elimina la capa masked-LM del checkpoint base, lo que explica la diferencia entre los 430M del repositorio original y los 381M servidos.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO; esa información no está disponible. Sí se documenta que el modelo hereda el diseño de "system-one" de la familia Vela, orientado a resolver en una única pasada forward un conjunto fijo de preguntas integradas (dominio, necesidad de verificación factual, feedback, tipo de salida, petición dañina, jailbreak) más la detección de spans de datos personales y de afirmaciones no respaldadas por el contexto. La innovación principal es precisamente esa consolidación: una sola llamada sustituye a las seis pasadas de vela3.1-fast.

## Capacidades

- Clasificación zero-shot con opciones definidas por el usuario: devuelve la opción elegida y una probabilidad para cada alternativa.
- Respuestas sí/no (noul) para preguntas booleanas con probabilidad asociada.
- Token classification con offsets de caracteres: detección de datos personales (PII) y de spans no respaldados por el contexto (detección de alucinaciones).
- Enrutamiento semántico: selección de modelo, herramienta o equipo a partir de la petición y de descripciones breves de cada opción.
- Cribado de seguridad: clasificación de peticiones como safe/unsafe o benign/jailbreak, con categorías de riesgo si se solicitan.
- Verificación de respuestas frente a la fuente: identificación de las palabras de una respuesta que el contexto no respalda.
- Multilingüe: decisiones en 15 idiomas, con precisión de intención MASSIVE de 70,9 sobre 13 idiomas.
- Entrada de texto o JSON.
- No genera texto; su salida son probabilidades y spans.
- No se documenta soporte de tool calling ni de razonamiento multi-paso en el sentido de agentes generativos; su función es la decisión previa.

## Casos de uso

- Enrutamiento de peticiones en una plataforma multi-modelo: dado un mensaje de usuario y descripciones de los modelos disponibles (por ejemplo, "small" y "large"), el modelo devuelve la opción adecuada con su probabilidad, lo que permite dirigir cada consulta al modelo con mejor relación coste/calidad sin una llamada generativa previa.
- Cribado de seguridad antes de la inferencia: cada petición se clasifica como safe/unsafe o benign/jailbreak en la misma pasada que el resto de comprobaciones, lo que permite bloquear prompt injections y contenido dañino antes de que lleguen al LLM principal.
- Detección de PII antes de registrar o reenviar texto: el modelo devuelve cada span con su etiqueta y offsets de caracteres, lo que facilita el enmascaramiento o la redacción selectiva en pipelines de logging y cumplimiento normativo.
- Verificación de respuestas en sistemas RAG: comparando la respuesta generada con el contexto recuperado, el modelo señala las palabras no respaldadas por la fuente, lo que permite marcar o descartar respuestas con riesgo de alucinación antes de mostrarlas al usuario.
- Clasificación de intenciones en atención al cliente: con opciones como "refund" o "cancel" descritas en una frase, el modelo asigna la intención y su probabilidad, lo que sirve para encaminar tickets al equipo adecuado en 15 idiomas.
- Filtrado de feedback y tipo de salida: las preguntas integradas sobre dominio, necesidad de verificación factual, feedback y tipo de salida permiten etiquetar cada petición para telemetría, priorización o activación de flujos específicos.
- Despliegue en CPU o dispositivos pequeños: con el encoder int8 ONNX, una comprobación completa tarda 3,0 s en 4 hilos de CPU, lo que lo hace apto para entornos sin GPU o con presupuesto de latencia moderado.

## Benchmarks y rendimiento

| Benchmark | vela3.1-pico-380m | vela3-fast 3.0 | Vela 2.0 0.3B | vela3.1-fast | GLiDE 0.4B |
|---|---|---|---|---|---|
| Decision Index (parte pública) | 50,51 | 50,36 | no disponible | 51,12 | 51,10 |
| Falsos positivos en peticiones benignas de soporte (%) | 3,4 | 13,6 | 4,0 | 21,1 | no disponible |
| MASSIVE intent accuracy (13 idiomas) | 70,9 | 31,1 | no disponible | 66,6 | no disponible |
| Comprobación completa en CPU (s) | 5,4 (fp32) / 3,0 (int8) | no disponible | no disponible | 12,3 (6 pasadas) | no disponible |
| Una decisión en CPU (s) | 1,5 (fp32) / 632 ms (int8) | no disponible | no disponible | 1,2 | no disponible |

Mediciones sobre AMD EPYC 7413 de 24 núcleos, máquina inactiva, 4 hilos, mediana de 5 ejecuciones; la comprobación completa incluye seis preguntas integradas más spans de datos personales y de afirmaciones no respaldadas sobre una petición de 200 tokens con contexto y respuesta. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en fp32 para los pesos; el encoder int8 ONNX reduce el uso de memoria de forma significativa (no se especifica la cifra exacta).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para fp32; el modelo está pensado también para CPU (AMD EPYC 7413 en las mediciones del autor).
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090, etc.), dado su tamaño de 381M parámetros.
- Opciones de despliegue: transformers con custom_code (clase Vela3Encoder), ONNX Runtime para el encoder int8; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 5,4 s fp32 y 3,0 s int8 para la comprobación completa en 4 hilos de CPU; 1,5 s fp32 y 632 ms int8 para una sola decisión. En GPU la latencia sería inferior, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vela3.1-pico-380m | 381M | 8.192 / 32K | 50,51 | Apache-2.0 | Hugging Face |
| vela3.1-fast | 380M (1,91B con adaptadores) | no disponible | 51,12 | no disponible en la información | Hugging Face |
| vela3.1-pico-150m | 153M | no disponible | no disponible | no disponible en la información | Hugging Face |
| GLiDE 0.4B | 0,4B | no disponible | 51,10 | no disponible | no disponible |

La comparativa se limita a la familia Vela y a GLiDE, los únicos modelos con datos en la información proporcionada. vela3.1-pico-380m ofrece el menor índice de falsos positivos en datos personales benignos (3,4%) y la mejor precisión multilingüe de intención (70,9), a costa de un Decision Index ligeramente inferior al de vela3.1-fast y GLiDE 0.4B.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, por lo que no puede sustituir a un LLM en tareas de generación, razonamiento libre o conversación.
- La model card no documenta sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de sesgo por idioma o dominio.
- Riesgo de alucinación no aplica en el sentido generativo, pero la detección de afirmaciones no respaldadas por el contexto puede producir falsos positivos o negativos según el dominio.
- El contexto es de 8.192 tokens para llamadas con preguntas de seguridad, señal o span, y de hasta 32K solo para llamadas de decisión; textos más largos requieren ventaneo.
- El rendimiento multilingüe es desigual: la precisión MASSIVE de 70,9 sobre 13 idiomas no garantiza el mismo nivel en todos los idiomas listados.
- Requiere transformers 5.17.0 y código personalizado (custom_code), lo que limita su integración con stacks de inferencia estándar como vLLM o llama.cpp.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base UltraBERT-380M debe verificarse por separado para confirmar compatibilidad de licencia.
- Las cifras de latencia proceden de una única configuración de hardware (AMD EPYC 7413, 4 hilos); no se han publicado mediciones en GPU.

## Enlaces

- [Hugging Face: vllm-sr/vela3.1-pico-380m](https://huggingface.co/vllm-sr/vela3.1-pico-380m)
- [Modelo base: dmis-lab/UltraBERT-380M](https://huggingface.co/dmis-lab/UltraBERT-380M)
- [Modelo relacionado: vllm-sr/vela3.1-fast](https://huggingface.co/vllm-sr/vela3.1-fast)
- [Modelo relacionado: vllm-sr/vela3.1-pico-150m](https://huggingface.co/vllm-sr/vela3.1-pico-150m)
