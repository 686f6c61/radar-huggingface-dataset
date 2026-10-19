# tianhaoz95/wee-hours-baby-activity

## Resumen

`tianhaoz95/wee-hours-baby-activity` es un ajuste fino de `convaiinnovations/laya` para el registro de actividad de un bebé en la aplicación Wee Hours. No es un modelo generativo de propósito general: es un modelo de decisión y clasificación de texto que convierte enunciados cortos de voz en campos estructurados (tipo de evento, categoría, fase, cantidad, contenido, tipo de pañal, lado y cantidad de sólidos) y decide si la entrada puede auto-confirmarse o debe pedir confirmación al usuario.

El modelo tiene 421.029.889 parámetros, se distribuye como GGUF Q8_0 y se ejecuta con llama.cpp en el endpoint `/v1/systemone` de la app. La licencia es Apache-2.0. Su relevancia está en el despliegue local: permite registrar tomas, pañales y sueño durante la madrugada con voz, sin enviar audio a la nube y con una latencia de alrededor de 318-320 ms por enunciado en la evaluación interna.

El ajuste se entrenó con datos sintéticos generados por un modelo profesor, filtrados por acuerdo ciego, y transcritos con Whisper `base.en` para introducir errores reales de ASR. En la evaluación de la app mejora de forma clara al modelo base en precisión de tipo, campos y auto-confirmación, aunque la evaluación es pequeña y específica del dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. Modelo base `convaiinnovations/laya`, librería `laya`; pipeline `text-classification` y etiqueta `feature-extraction`. No se especifica si es transformer, MoE, SSM o híbrido. |
| Parámetros totales | 421.029.889 |
| Parámetros activos | No aplica (no consta que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF Q8_0 (fichero que ejecuta la app); no se detallan otras cuantizaciones |
| Idiomas soportados | No disponibles; el pipeline de entrenamiento usa Whisper `base.en` y enunciados en inglés, pero la ficha no declara idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF, convertido con llama.cpp `e467e5b`; el conteo de parámetros figura como dato de safetensors en los metadatos |
| Modelo base | `convaiinnovations/laya` |
| Tamaño del repositorio | 0,4 GB |
| Pipeline | `text-classification`; etiqueta `feature-extraction`; `endpoints_compatible` |
| Estado en Hugging Face | 0 descargas, 0 likes en la información consultada |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura del backbone de `convaiinnovations/laya`: no se especifica si es transformer, MoE, SSM o híbrido, ni la longitud de contexto. El pipeline declarado es `text-classification`, con etiqueta `feature-extraction`, y el uso previsto es la extracción de etiquetas y la toma de decisiones, no la generación abierta.

El ajuste se realizó con `laya.train` (RLCD). El conjunto de entrenamiento es sintético: un modelo profesor grande escribió enunciados para etiquetas fijadas de antemano y solo se conservaron aquellos que el profesor etiquetó igual en modo ciego. Después, esos enunciados se leyeron con TTS y se transcribieron con Whisper `base.en` usando el prompt de la app, de modo que los ejemplos incluyen errores de reconocimiento reales. Se usaron 12.653 filas; el acuerdo ciego fue 0,597. Los enunciados de evaluación de la app se mantuvieron fuera del entrenamiento. No se indican número de tokens, composición detallada, RLHF/DPO ni cómputo.

## Capacidades

- Clasificación de enunciados cortos en una taxonomía fija de eventos de bebé: tipo, categoría, fase, cantidad, contenido, tipo de pañal, lado y cantidad de sólidos.
- Respuesta a preguntas de campo sobre lo que dijo el progenitor, en el formato que usa la app.
- Decisión de auto-confirmar la entrada o pedir confirmación; en la evaluación raw alcanza un 88,2% de auto-commit con un 0,6% de auto-commits erróneos.
- Robustez frente a errores de ASR: el entrenamiento incluye transcripciones de Whisper `base.en` con el prompt de la app.
- Integración local mediante llama.cpp y endpoint `/v1/systemone`; está pensado para ejecución en el dispositivo.
- No se documentan tool calling, agentes, razonamiento multi-paso, visión, audio nativo ni modo thinking.
- Soporte multilingüe no demostrado; la evidencia disponible apunta a inglés.
- Salida estructurada para un log append-only, no generación libre de texto.

## Casos de uso

- Registro nocturno por voz de tomas y pañales: el progenitor dice una frase corta y el modelo la convierte en una entrada estructurada; los 318-320 ms por enunciado permiten una respuesta casi inmediata en la app.
- Auto-confirmación con fallback: la app puede usar la tasa de auto-commit para reducir pulsaciones y reservar la confirmación manual para los casos ambiguos; la evaluación incluye una variante calibrada para ajustar el umbral.
- Extracción de campos para formularios: el modelo rellena `amount`, `contents`, `diaper_kind`, `side`, `solids_amount` y `phase`, de modo que el usuario solo revisa o corrige.
- Integración con reloj, anillo Even G2 y MCP: los eventos de voz o botón llegan a un log append-only y el modelo clasifica cada enunciado antes de escribirlo.
- Tolerancia a ASR en entornos ruidosos: al haberse entrenado con transcripciones de Whisper, es adecuado para habitaciones a oscuras, voz baja o pronunciación irregular.
- Evaluación de regresión de pipelines de voz: permite comparar el modelo ajustado con el stock sobre las mismas 178 filas raw o 89 filas calibradas.
- Privacidad y despliegue local: al ejecutarse como GGUF Q8_0 con llama.cpp, evita enviar audio o transcripciones a servicios externos.
- Enriquecimiento de registros para analítica: las etiquetas estructuradas pueden alimentar resúmenes posteriores de tomas, pañales y sueño sin usar un modelo generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son la evaluación interna de la app, con 178 filas raw y 89 filas calibradas, comparando el modelo ajustado con el stock, ambos como `laya-q8_0@http`.

Evaluación raw:

| Métrica | Ajustado | Stock | Diferencia |
|---|---:|---:|---:|
| Type accuracy | 99,4 | 72,5 | +26,9 |
| Full accuracy (type + fields + time) | 97,8 | 56,7 | +41,1 |
| Auto-commit rate | 88,2 | 2,8 | +85,4 |
| Wrong auto-commits (share of auto) | 0,6 | 0 | +0,6 |
| Pick-two contains the right entry | 100 | 77,8 | +22,2 |
| Full-list rate | 8,4 | 87,1 | -78,7 |
| ms per utterance | 318 | 318 | +0,0 |
| `amount` accuracy | 97,4 | 59 | +38,4 |
| `category` accuracy | 98,3 | 37,1 | +61,2 |
| `contents` accuracy | 100 | 22,2 | +77,8 |
| `diaper_kind` accuracy | 100 | 84,8 | +15,2 |
| `phase` accuracy | 100 | 66,7 | +33,3 |
| `side` accuracy | 90,3 | 83,9 | +6,4 |
| `solids_amount` accuracy | 100 | 75 | +25,0 |

Evaluación calibrada:

| Métrica | Ajustado | Stock | Diferencia |
|---|---:|---:|---:|
| Type accuracy | 97,8 | 71,9 | +25,9 |
| Full accuracy (type + fields + time) | 96,6 | 56,2 | +40,4 |
| Auto-commit rate | 92,1 | 1,1 | +91,0 |
| Wrong auto-commits (share of auto) | 3,7 | 0 | +3,7 |
| Pick-two contains the right entry | 0 | 80 | -80,0 |
| Full-list rate | 7,9 | 87,6 | -79,7 |
| ms per utterance | 320 | 402 | -82,0 |
| `amount` accuracy | 95,5 | 50 | +45,5 |
| `category` accuracy | 96,6 | 36 | +60,6 |
| `contents` accuracy | 100 | 33,3 | +66,7 |
| `diaper_kind` accuracy | 100 | 76,5 | +23,5 |
| `phase` accuracy | 100 | 71,4 | +28,6 |
| `side` accuracy | 92,3 | 76,9 | +15,4 |
| `solids_amount` accuracy | 100 | 100 | +0,0 |

La tasa de auto-commit sube del 2,8% al 88,2% en raw, con un 0,6% de auto-commits erróneos. En calibrado, el auto-commit llega al 92,1%, pero los auto-commits erróneos suben al 3,7% y la ruta pick-two cae al 0%; ese dato debe interpretarse junto con la tasa de auto-confirmación, no como una mejora de precisión en esa ruta.

## Requisitos de hardware

- Pesos Q8_0 estimados en torno a 0,42 GB a partir de 421M parámetros; el repositorio ocupa 0,4 GB. Una versión FP16 estimada sería de unos 0,84 GB.
- VRAM estimada: 1-2 GB para Q8_0 con contexto corto; 2-4 GB deja margen para KV cache y runtime. Es una estimación, no un requisito oficial.
- GPU recomendadas: no hay recomendaciones oficiales. Por tamaño, cabe en GPU de consumo con 2 GB o más de VRAM, como RTX 3050/4060, GTX 1650/1660, Apple Silicon o iGPU recientes; A100/H100 no son necesarias.
- También es viable en CPU mediante llama.cpp, que es el entorno usado por el autor.
- Despliegue: llama.cpp con el GGUF Q8_0 y el endpoint `/v1/systemone` de la app. Ollama podría importar el GGUF, pero no está verificado en la información disponible; vLLM y TGI no se indican.
- Latencia conocida: 318 ms por enunciado en raw y 320 ms en calibrado para el modelo ajustado; el stock calibrado marca 402 ms. Throughput no disponible.

## Comparativa con modelos similares

No se han encontrado en la información proporcionada otros modelos comparables con datos de evaluación; no se inventan cifras. La única comparación disponible es contra el modelo base stock.

| Modelo | Parámetros | Contexto | Rendimiento en evaluación de la app | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| `tianhaoz95/wee-hours-baby-activity` | 421.029.889 | No disponible | Full accuracy raw 97,8; auto-commit 88,2; 318 ms/enunciado | Apache-2.0 | Hugging Face, GGUF Q8_0 |
| `convaiinnovations/laya` (stock) | No disponible en la información | No disponible | Full accuracy raw 56,7; auto-commit 2,8; 318 ms/enunciado | No disponible | Hugging Face, modelo base |

## Limitaciones y advertencias

- Modelo de dominio muy estrecho: clasifica eventos de bebé y campos asociados; no es un asistente general ni un modelo de chat.
- Entrenamiento sintético: un modelo profesor generó los enunciados y el acuerdo ciego fue 0,597, lo que sugiere ambigüedad o ruido de etiquetas.
- Evaluación pequeña: 178 filas raw y 89 calibradas; los resultados no garantizan comportamiento estable en otras voces, acentos o condiciones de ruido.
- Riesgo de auto-commit erróneo: 0,6% en raw y 3,7% en calibrado; en una app de registro nocturno, un error puede introducir datos incorrectos sin revisión.
- La ruta pick-two de la variante calibrada cae al 0% de acierto en la métrica, mientras el auto-commit sube al 92,1%; conviene revisar el diseño de confirmación antes de producción.
- Idiomas no declarados; el uso de Whisper `base.en` y enunciados en inglés apunta a un soporte limitado fuera de ese idioma.
- No se dispone de longitud de contexto; está pensado para enunciados cortos, no para conversaciones largas.
- Sesgos probables: voces TTS, acentos y estilos presentes en el modelo profesor y en Whisper `base.en`; no hay información demográfica ni de diversidad de hablantes.
- Licencia Apache-2.0 para este ajuste según los metadatos; no se detalla la licencia del modelo base ni de los datos sintéticos, por lo que conviene verificar derechos antes de uso comercial.
- Solo se valida el GGUF Q8_0 con llama.cpp `e467e5b`; otras cuantizaciones, runtimes o versiones de llama.cpp no están verificadas.
- No hay benchmarks estándar ni evidencia de uso en producción fuera de la app del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tianhaoz95/wee-hours-baby-activity
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Repositorio Wee Hours: https://github.com/tianhaoz95/wee-hours
- README del repositorio: https://github.com/tianhaoz95/wee-hours/blob/main/README.md
- Perfil del autor en Hugging Face: https://huggingface.co/tianhaoz95
- Modelos del autor: https://huggingface.co/tianhaoz95/models
- Sitio del autor: https://tianhaoz95.github.io/
- No se han encontrado papers, blogs o demos adicionales en la búsqueda web.
