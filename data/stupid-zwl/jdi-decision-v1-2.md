# stupid-zwl/JDI-Decision-V1

## Resumen
JDI-Decision-V1 es un sistema multimodal de decisión desarrollado por JD.com (京东) y publicado en HuggingFace por el usuario `stupid-zwl`. No es un modelo de lenguaje generativo al uso: su función es emitir elecciones estructuradas y probabilidades asociadas a cada opción para entradas que combinan texto e imágenes. Se construye sobre una base Qwen3.8-27B (26.085.330.160 parámetros según los pesos safetensors) con adaptaciones de la arquitectura de decisión D3, e incorpora un codificador visual propio y un componente de reconocimiento de texto PaddleOCR v5 congelado, procedente del equipo PaddlePaddle de Baidu.

El sistema resuelve el problema de seleccionar entre alternativas discretas (tipo test de opción múltiple) cuando la información relevante está repartida entre píxeles y texto. Cada petición se ejecuta en una única GPU: se decodifica la imagen, se redimensiona, se ejecutan en paralelo la rama de visión y la de OCR, y la transcripción resultante se inyecta en el estado (`state.image_text_transcription`) junto con la imagen original. La columna vertebral de decisión procesa después características visuales, pregunta y opciones, y una cabeza de lectura en FP32 devuelve la respuesta estructurada con sus probabilidades.

Es relevante ahora porque propone un patrón distinto al de los VLM conversacionales: en lugar de generar texto libre, expone una interfaz de decisión con probabilidades calibradas y latencias medidas (media de 326,0 ms, P50 de 263,4 ms sobre dos workers H200). El paquete incluye guía de reproducción, hashes SHA256 de los pesos OCR y un conjunto de resultados público con transcripciones, respuestas y tiempos, lo que facilita la auditoría.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con adaptaciones de decisión D3 sobre base Qwen3.8-27B; codificador visual propio, OCR PaddleOCR v5 congelado y cabeza de lectura FP32 |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el readout se ejecuta en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los pesos OCR y las cabeceras de Paddle conservan sus términos upstream) |
| Formato de pesos | safetensors (librería pytorch, con `custom_code`) |

## Arquitectura y entrenamiento
La arquitectura parte de un backbone Qwen3.8-27B al que se aplican adaptaciones de la arquitectura de decisión D3. El flujo de inferencia tiene dos ramas internas que se ejecutan de forma concurrente en una sola GPU: un codificador visual que extrae características de la imagen y un componente PaddleOCR v5 congelado que reconoce el texto presente en ella. La transcripción OCR no sustituye a la imagen, sino que la complementa como campo adicional del estado de entrada. Posteriormente, el backbone de decisión procesa conjuntamente características visuales, pregunta y opciones, y una cabeza de lectura en FP32 produce la respuesta estructurada y las probabilidades por opción.

El preprocesado de imagen es estándar: decodificación, conversión a RGB y redimensionado hasta un límite de píxeles antes de las dos ramas paralelas. Las características visuales se reutilizan únicamente dentro de la misma petición. No se han publicado en la información disponible datos sobre volumen de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. Los detalles de la arquitectura base y del runtime de decisión se remiten a la guía de reproducción incluida en el repositorio.

## Capacidades
- Emisión de decisiones estructuradas: devuelve una opción seleccionada y probabilidades por alternativa para preguntas de tipo elección.
- Procesamiento multimodal de texto e imagen en una misma petición.
- Reconocimiento de texto en imagen mediante PaddleOCR v5, con la transcripción expuesta en el estado de la petición.
- Interfaz programática con criterios explícitos por opción (por ejemplo, `{"A": "STOP", "B": "GO"}`) e instrucciones en lenguaje natural.
- Ejecución de extremo a extremo en una única GPU por petición, con latencias medidas y documentadas.
- Punto de entrada de sistema completo (`ocr_inference.ComboEngine`) y punto de entrada interno sin OCR (`inference.D3Engine`).
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, agentes, audio ni modo thinking.

## Casos de uso
- Verificación documental con opción múltiple: dado un formulario o justificante escaneado y un conjunto de criterios (por ejemplo, "el importe coincide", "el sello es válido"), el sistema devuelve la opción y su probabilidad, apoyándose en la rama OCR para leer los campos y en la visual para comprobar sellos o firmas.
- Triaje de imágenes en pipelines de moderación: clasificar una imagen entre categorías predefinidas con umbral de confianza derivado de las probabilidades, lo que permite enrutar automáticamente los casos dudosos a revisión humana.
- Control de calidad en logística: comprobar si la etiqueta de un paquete coincide con la referencia esperada, usando OCR para el texto y el codificador visual para el estado del embalaje, con latencias P50 de 263,4 ms compatibles con líneas de inspección.
- Extracción de decisiones en lectura de señalética: interpretar carteles o paneles y elegir entre interpretaciones candidatas, como en el ejemplo de la model card ("STOP" frente a "GO").
- Asistencia a operadores con interfaz de elección: presentar al operador varias opciones y usar las probabilidades del modelo para priorizar la sugerencia, en lugar de generar texto libre que requiera post-procesado.
- Evaluación comparativa de sistemas de decisión: al publicarse el conjunto de resultados con transcripciones, respuestas, probabilidades, hashes y tiempos, sirve como referencia reproducible para comparar pipelines multimodales propios.
- Automatización de encuestas o formularios con componente visual: responder preguntas de opción múltiple sobre capturas de pantalla o fotografías, con trazabilidad de la transcripción OCR empleada.

## Benchmarks y rendimiento
La model card reporta una puntuación agregada de 79,7313 en la suite pública Decision Index Vision, con 12.210 de 12.210 peticiones exitosas en 11 benchmarks. Se trata de una puntuación autodeclarada, no de un puesto confirmado en un leaderboard ni de la puntuación Full. La validación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes según el autor.

| Metrica | Valor |
|---|---|
| Decision Index Vision (suite pública) | 79,7313 |
| Peticiones exitosas | 12.210 / 12.210 en 11 benchmarks |
| Latencia media | 326,0 ms |
| Latencia P50 | 263,4 ms |
| Latencia P80 | 401,1 ms |
| Latencia P90 | 583,0 ms |

El entorno de medida fueron dos workers H200, cada uno con una réplica completa del sistema y una petición simultánea; cada petición permanece en una GPU. La latencia incluye decodificación, OCR, codificación visual y el forward de decisión, y excluye carga de modelo, hashing de integridad y ejecuciones de perfilado.

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 52,2 GB, lo que da una cota inferior orientativa para pesos en precisión de publicación, sin contar activaciones ni el runtime OCR.
- GPU recomendadas: el autor valida el sistema en H200; la validación oficial de latencia en RTX PRO 6000 está pendiente.
- Viabilidad en GPU de consumo: no confirmada en la información disponible; con 26.085 millones de parámetros, la inferencia en FP16/BF16 requeriría del orden de 52 GB solo para pesos, por encima de una RTX 4090 de 24 GB, por lo que haría falta cuantización, no documentada.
- Opciones de despliegue: el paquete proporciona sus propios puntos de entrada (`ocr_inference.ComboEngine` para el sistema completo, `inference.D3Engine` para el modelo de decisión interno) sobre Python 3.12 y CUDA. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: media de 326,0 ms y P50 de 263,4 ms por petición en H200 con una petición simultánea por réplica; no se publica throughput agregado.

## Comparativa con modelos similares
No se dispone en la información proporcionada de datos de benchmarks comparables con otros modelos de decisión multimodal, ni de especificaciones de alternativas en el mismo rango de tamaño y tarea. La comparación cuantitativa queda como no disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| JDI-Decision-V1 | 26,09 B | no disponible | Apache 2.0 | Sistema de decisión multimodal con OCR integrado |
| Alternativas comparables | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias
- La puntuación de 79,7313 es autodeclarada y corresponde solo a la suite pública; no equivale a un puesto verificado en leaderboard ni a la puntuación Full.
- La validación privada y la medición oficial de latencia en RTX PRO 6000 están pendientes según el propio autor.
- Las latencias reportadas se obtuvieron en H200 con una única petición simultánea por réplica; el comportamiento bajo carga concurrente no está documentado.
- El componente PaddleOCR v5 está congelado y sus pesos, junto con las cabeceras de Paddle, conservan sus términos de licencia upstream, que pueden imponer condiciones adicionales distintas de la Apache 2.0 del conjunto.
- El modelo está orientado a decisiones entre opciones predefinidas; no se documenta como generador de texto libre ni se detallan capacidades de razonamiento multi-paso o tool calling.
- No se especifican idiomas soportados, longitud de contexto ni sesgos conocidos, lo que limita la evaluación de idoneidad para producción multilingüe.
- El repositorio requiere `custom_code` y Python 3.12 con CUDA, lo que añade complejidad de despliegue frente a modelos con soporte nativo en runtimes estándar.
- Riesgo de alucinación y calibración de probabilidades no evaluados en la información disponible; las probabilidades de salida deberían validarse en el dominio de aplicación antes de usarse como umbrales automáticos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/stupid-zwl/JDI-Decision-V1
- Conjunto de resultados de evaluación: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V1/tree/427820d71f624baac1c747e9b484a75a8f744ba6/runs/vision-paddle-v5
- Guía de reproducción (REPRODUCE.md): incluida en el repositorio del modelo
- Fuentes y hashes del OCR (ocr_inference/ocr_sources.json): incluido en el repositorio del modelo
- Paper, blog o demo adicionales: no disponible
