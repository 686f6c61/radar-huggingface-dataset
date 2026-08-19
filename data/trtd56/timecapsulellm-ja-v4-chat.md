# trtd56/TimeCapsuleLLM-ja-v4-chat

## Resumen

TimeCapsuleLLM-ja-v4-chat es un modelo de lenguaje decoder-only GPT de 1.047.639.552 parametros (aproximadamente 1B), desarrollado por trtd56, entrenado desde cero exclusivamente con materiales en japones publicados entre 1868 y 1945. Este modelo es la version `v4-chat` (fase 7) del proyecto TimeCapsuleLLM, que busca crear modelos que emulen la voz, el vocabulario y la vision del mundo de una epoca historica concreta, reduciendo el sesgo moderno.

La version `v4-chat` parte del modelo base `TimeCapsuleLLM-ja-v4` (fase 6) y ha sido sometida a un proceso de post-entrenamiento (anneal) con 274 pares de preguntas y respuestas extraidos del propio corpus historico, ampliando al mismo tiempo la longitud de contexto de 1024 a 2048 tokens. El modelo esta diseñado especificamente para investigar como los modelos entrenados con materiales anteriores a 1945 abordan los temas de su epoca, y no como un asistente con conocimientos modernos. Es importante destacar que el modelo no conoce acontecimientos posteriores a 1945 y tiende a fabricar referencias plausibles cuando se le pregunta sobre hechos que desconoce.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only GPT |
| Parametros totales | 1.047.639.552 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | japones (ja) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only GPT de aproximadamente 1.047 millones de parametros, entrenado desde cero. La arquitectura emplea weight tying, es decir, las capas de embedding de entrada y de proyeccion de salida comparten los mismos pesos. Debido a esta caracteristica, en los archivos safetensors solo se almacena `lm_head.weight`, mientras que `transformer.wte.weight` se reconstruye al cargar el modelo.

El entrenamiento se realizo en dos fases. La fase base (v4, fase 6) se entreno exclusivamente con el corpus `trtd56/TimeCapsuleLLM-ja-corpus-v4`, compuesto por publicaciones japonesas de 1868 a 1945, con un total de aproximadamente 155.000 filas en el dataset. La fase de chat (v4-chat, fase 7) consistio en un post-entrenamiento mediante SFT con perdida enmascarada, utilizando 274 pares de preguntas y respuestas certificados del propio corpus. El proceso de post-entrenamiento mezclo estos pares con el corpus general (con una fraccion de QA de 0.00012, equivalente a aproximadamente 6.5 epocas) y amplio la ventana de contexto de 1024 a 2048 tokens. El entrenamiento completo de esta fase tomo 7.600 pasos durante 10.8 horas en una GPU A100 de 80 GB.

## Capacidades

- Generacion de texto en japones historico (1868-1945) con estilo, vocabulario y vision del mundo de la epoca.
- Respuesta a preguntas sobre como se debatian o discutian los temas en la epoca (por ejemplo, "¿Como se debatia la educacion y la ocupacion de las mujeres?").
- Mantenimiento de la distincion entre el japones de antes de la guerra y el japones moderno: la perplejidad (BPB) en textos de antes de la guerra es menor que en textos modernos, lo que indica que el modelo mantiene el sesgo temporal del corpus.
- Formato de dialogo especifico: `問、{pregunta}。答、` (pregunta y respuesta).
- El modelo responde adecuadamente al 98.3% de las preguntas (incluyendo respuestas parciales) y al 75.0% de forma completa, segun la evaluacion automatizada.

## Casos de uso

- Investigacion historica sobre discurso publico: permite explorar como se debatia un tema concreto (por ejemplo, la legislacion laboral, el papel de la mujer o el servicio militar) en las publicaciones japonesas de 1868-1945, generando respuestas que reflejan las opiniones y argumentos de la epoca.
- Analisis de la evolucion de valores: al comparar las respuestas del modelo a lo largo de diferentes periodos (Meiji tardio vs. Showa prebelico), los investigadores pueden estudiar como cambiaron las actitudes y los marcos de referencia.
- Generacion de material didactico contextualizado: permite crear ejemplos de textos historicos para cursos de historia, literatura o estudios japoneses, siempre que se indique claramente que el contenido no es un hecho verificado.
- Evaluacion de sesgos historicos en modelos de lenguaje: el modelo puede servir como referencia para estudiar como los datos de entrenamiento de una epoca concreta influyen en las respuestas de un LLM, comparandolo con modelos entrenados con datos modernos.
- Pruebas de robustez temporal en sistemas de IA: se puede utilizar para evaluar como un sistema de IA maneja informacion de una epoca pasada sin conocimientos modernos, y para disenar mecanismos de salvaguarda contra la desinformacion historica.
- Estudio de la fabricacion de fuentes en LLM: el modelo es un caso de estudio de como los modelos generan citas y referencias plausibles pero falsas (por ejemplo, numeros de leyes, fechas o paginas inventadas), lo que resulta util para investigar estrategias de mitigacion de alucinaciones.

## Benchmarks y rendimiento

El modelo no presenta resultados de benchmarks estandar como MMLU, HumanEval o GSM8K. En su lugar, el autor proporciona mediciones especificas del proyecto:

| Medida | Valor |
|---|---|
| BPB en test de preguerra (antes del post-entrenamiento) | 0.96828 |
| BPB en test de preguerra (despues del post-entrenamiento) | 0.95059 |
| BPB en control de japones moderno | 1.5441 |
| Perdida en respuestas de QA holdout (contexto 2048) | 3.429 (reduccion del 24.0% respecto a 4.508) |
| Tasa de respuesta directa a preguntas factuales | 7.1% |
| Tasa de respuesta a preguntas sobre valores y opiniones | 60-75% |
| Tasa de fabricacion severa de hechos | 11.7% (segun panel fijo) |

La evaluacion se realizo mediante paneles de LLM (no con criterios humanos). El autor advierte que las tasas de fabricacion severa varian significativamente segun el modelo juez utilizado: 26.2% con opus, 8.8-11.9% con sonnet y 1.6% con Haiku, con una tasa de acuerdo total del 55%.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.047 millones de parametros en precision FP16, el modelo requiere aproximadamente 2.1 GB de VRAM solo para los pesos, mas memoria para las activaciones y el contexto. Con contexto de 2048 tokens, se estima un consumo total de 3-4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo. Una RTX 3060 o superior es suficiente. Para entrenamiento se utilizo una A100 de 80 GB.
- Compatibilidad con GPU de consumo: si, cabe en GPU de consumo de gama media y alta (RTX 3060, RTX 4070, etc.).
- Opciones de despliegue: el autor proporciona un script `inference.py` que requiere `torch`, `tokenizers` y `safetensors`. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, aunque al ser un modelo GPT estandar, podria adaptarse.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la informacion proporcionada. El proyecto TimeCapsuleLLM parece ser unico en su enfoque de entrenar exclusivamente con datos historicos japoneses. No hay datos publicados que permitan comparar directamente este modelo con alternativas de la misma categoria.

## Limitaciones y advertencias

- El modelo no es un chat model con conocimientos modernos: desconoce todos los acontecimientos posteriores a 1945 y no debe utilizarse como fuente de informacion factual.
- Alta tasa de fabricacion de fuentes: el modelo inventa numeros de leyes, fechas, titulos de libros, numeros de pagina y cantidades con apariencia plausible. Por ejemplo, atribuye a la "Ordenanza Imperial n.º 16" lo que en realidad fue la n.º 76, o cita paginas inventadas de un libro.
- Sesgos historicos: al estar entrenado exclusivamente con publicaciones de 1868-1945, reproduce discursos discriminatorios de la epoca (racismo, clasismo, sexismo, discapacidad, colonialismo). El autor incluye deliberadamente estos temas en las evaluaciones para medir como emergen.
- No apto para decisiones medicas, legales, financieras o de cualquier otro tipo que afecten a personas.
- Errores de OCR: el corpus contiene errores derivados del OCR de textos verticales, incluyendo inversion del orden de lineas y contaminacion por cabeceras de pagina.
- Respuestas a preguntas factuales muy limitadas: solo responde correctamente al 7.1% de las preguntas de tipo "¿Que es X?".
- Requisito de atribucion: cualquier salida mostrada a personas debe ir acompanada de un aviso explicando que el contenido es generado por un modelo entrenado con materiales anteriores a 1945 y que no es un hecho historico verificado.
- Evaluacion mediante paneles LLM: los resultados de calidad dependen del modelo juez utilizado y no son comparables entre si sin especificar el juez.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trtd56/TimeCapsuleLLM-ja-v4-chat
- Dataset del corpus: https://huggingface.co/datasets/trtd56/TimeCapsuleLLM-ja-corpus-v4
- Modelo base v4: https://huggingface.co/trtd56/TimeCapsuleLLM-ja-v4
- Publicacion en X del autor: https://x.com/Trtd6Trtd/status/2084995846165389512
- Repositorio de referencia (proyecto TimeCapsuleLLM): https://github.com/haykgrigo3/TimeCapsuleLLM
