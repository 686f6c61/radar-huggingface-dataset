# stupid-zwl/JDI-Decision-V0.9

## Resumen

JDI-Decision-V0.9 es un sistema multimodal de decisión desarrollado por JD.com (京东) y publicado en Hugging Face bajo el identificador `stupid-zwl/JDI-Decision-V0.9`. No es un modelo de lenguaje generativo al uso: su función es producir elecciones estructuradas y probabilidades por opción a partir de texto e imágenes, es decir, resolver tareas de decisión con un conjunto acotado de alternativas (por ejemplo, "¿qué dice este cartel: A) STOP o B) GO?"). Está construido sobre una base Qwen3.8-27B con adaptaciones de la arquitectura de decisión D3.

El sistema integra cuatro componentes: un codificador visual, un componente de reconocimiento de texto PaddleOCR v5 congelado (procedente del equipo PaddlePaddle de Baidu), un backbone de decisión y una etapa de lectura en FP32 que emite las probabilidades finales. Las ramas de OCR y de codificación visual se ejecutan en paralelo sobre una misma GPU, y la latencia reportada incluye todo el pipeline extremo a extremo.

El modelo tiene 26.085.330.160 parámetros (unos 26,1 mil millones) y el repositorio ocupa 52,2 GB. Es relevante para quienes necesitan un componente de decisión multimodal con salida probabilística calibrada y tooling de reproducción incluido, más que un chatbot generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con arquitectura de decisión D3 sobre base Qwen3.8-27B; codificador visual + PaddleOCR v5 congelado + backbone de decisión + readout FP32 |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors; el readout opera en FP32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los pesos OCR y las cabeceras de Paddle conservan sus terminos upstream) |
| Formato de pesos | safetensors (libreria pytorch, con codigo personalizado `custom_code`) |

## Arquitectura y entrenamiento

La arquitectura es un sistema compuesto, no un transformer monolítico. La entrada de imagen se decodifica, se convierte a RGB y se redimensiona hasta un límite de píxeles antes de entrar en dos ramas paralelas: un codificador visual que extrae características de la imagen y un componente PaddleOCR v5 congelado que reconoce el texto presente. La transcripción OCR se inyecta en el estado mediante `state.image_text_transcription`, de modo que complementa la información visual en lugar de sustituirla. El backbone de decisión procesa conjuntamente las características visuales, el texto, la pregunta y las opciones, y un readout en FP32 genera la respuesta estructurada con probabilidades por opción.

Cada petición se ejecuta en una única GPU y las características visuales solo se reutilizan dentro de esa misma petición. No se han publicado en la información disponible datos sobre el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO. La innovación destacable es la integración de un OCR congelado como módulo auxiliar dentro del pipeline de decisión, con verificación SHA256 de los archivos OCR descargados desde el hosting oficial de Paddle y un manifiesto de fuentes en `ocr_inference/ocr_sources.json`.

## Capacidades

- Decisión multimodal estructurada: emite una elección entre opciones definidas por el usuario junto con la probabilidad asociada a cada una.
- Procesamiento conjunto de texto e imagen, con preguntas, criterios y alternativas especificadas en la propia petición.
- Reconocimiento de texto en imagen mediante PaddleOCR v5 congelado, integrado en el estado de la petición.
- Salida probabilística calibrada a través de un readout en FP32, apta para umbrales y ranking de opciones.
- Soporte de múltiples imágenes por petición (el parámetro `images` acepta una lista).
- Punto de entrada de sistema completo (`ocr_inference.ComboEngine`) y punto de entrada interno del modelo de decisión (`inference.D3Engine`, sin OCR).
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, visión, audio: visión y OCR confirmados; thinking y audio no disponibles.

## Casos de uso

- Verificación documental automatizada: el sistema recibe la imagen de un documento y una pregunta con opciones (tipo de documento, presencia de firma, coherencia de campos) y devuelve la opción más probable con su probabilidad, lo que permite fijar umbrales de aceptación y derivar a revisión humana los casos de baja confianza.
- Control de calidad en logística y almacén: clasificación de imágenes de paquetes o etiquetas con opciones predefinidas (correcto, dañado, ilegible), apoyándose en la rama OCR para leer números de seguimiento y en el readout probabilístico para priorizar inspecciones.
- Moderación de contenido visual con criterios explícitos: cada petición define las opciones y sus criterios, de modo que el equipo puede ajustar la política sin reentrenar, y la probabilidad por opción sirve como señal de escalado.
- Extracción de decisiones en lectura de carteles y señalética: el ejemplo de la model card (leer un cartel y elegir entre "STOP" y "GO") generaliza a paneles de control, pantallas de terminal y señalización industrial donde el OCR aporta el texto y el backbone resuelve la interpretación.
- Enrutamiento de solicitudes en pipelines internos: usar la distribución de probabilidad sobre opciones como clasificador de intención multimodal, con latencia media reportada de 345,5 ms por petición en la configuración evaluada, adecuada para flujos interactivos.
- Evaluación comparativa de sistemas de decisión: el paquete incluye guía de reproducción (`REPRODUCE.md`), manifiesto de exportación y hashes de payload, lo que permite reconstruir la suite y auditar respuestas y tiempos de una ejecución concreta.
- Investigación sobre calibración probabilística: al conservar respuestas, probabilidades y timings de la ejecución evaluada, el dataset asociado sirve para estudiar la calibración del readout FP32 frente a la dificultad de la tarea.

## Benchmarks y rendimiento

El autor reporta una puntuación de 79,3601 en la suite pública Decision Index Vision, con 12.210 de 12.210 peticiones exitosas en 11 benchmarks. Se trata de una puntuación autodeclarada, no de un puesto confirmado en un leaderboard ni de la puntuación Full. La evaluación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes según la model card.

Latencia por petición (incluye decodificación, OCR, codificación visual y forward de decisión; excluye carga, hashing de integridad y ejecuciones de profiling), medida con dos workers H200, una réplica completa del sistema por worker y una petición simultánea por GPU:

| Metrica | Valor |
|---|---|
| Media | 345,5 ms |
| P50 | 282,4 ms |
| P80 | 426,8 ms |
| P90 | 604,2 ms |

No se han publicado resultados por benchmark individual (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 26,1 mil millones de parámetros en safetensors y un repositorio de 52,2 GB, la carga en precisión original requiere del orden de 52 GB solo para pesos, más el codificador visual, el OCR y las activaciones; el readout en FP32 añade overhead.
- GPU recomendadas según la evaluación reportada: NVIDIA H200 (dos workers, una réplica completa por GPU). La model card menciona una validación de latencia pendiente en RTX PRO 6000.
- GPU de consumo: no se han publicado datos que confirmen que quepa en GPU de consumo; por el tamaño de pesos, no es viable en tarjetas de 24 GB sin cuantización, y no se documentan recetas de cuantización.
- Despliegue: el paquete incluye `ocr_inference/setup.sh` para crear un entorno Python 3.12 con CUDA y el punto de entrada `ocr_inference.ComboEngine`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media de 345,5 ms y P90 de 604,2 ms con una petición simultánea por GPU; el throughput agregado no se reporta.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables publicados para este sistema, y la información proporcionada no identifica alternativas de la misma categoría (sistemas de decisión multimodal con salida probabilística). La comparación con modelos de lenguaje generalistas del mismo orden de parámetros no sería metodológicamente válida porque las tareas evaluadas son distintas.

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| JDI-Decision-V0.9 | 26,1 B | no disponible | Apache 2.0 | Decisión multimodal con opciones y probabilidades |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La puntuación de 79,3601 en Decision Index Vision es autodeclarada y corresponde a la suite pública, no a la puntuación Full ni a un ranking oficial de leaderboard.
- La evaluación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes según el propio autor, por lo que el rendimiento en producción fuera del entorno H200 evaluado no está verificado.
- El sistema está diseñado para elegir entre opciones proporcionadas; no debe tratarse como un modelo generativo de propósito general ni como un chatbot.
- La licencia Apache 2.0 cubre el modelo, pero los pesos OCR y las cabeceras de la build de Paddle conservan sus términos de licencia upstream, lo que exige revisión adicional para uso comercial.
- El texto de transcripción OCR se excluye del export público del dataset de evaluación para no redistribuir contenido de benchmarks, lo que limita la reproducibilidad exacta de esa parte del pipeline.
- No se han publicado datos sobre sesgos, tasas de alucinación, cobertura de idiomas ni longitud de contexto, lo que impide evaluar su comportamiento fuera de los benchmarks reportados.
- La dependencia de un componente OCR congelado implica que los errores de reconocimiento de texto se propagan directamente a la decisión final.
- El repositorio incluye código personalizado (`custom_code`), por lo que la carga requiere confiar en la implementación distribuida o revisarla.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/stupid-zwl/JDI-Decision-V0.9
- Dataset de resultados y metadatos de ejecución: https://huggingface.co/datasets/stupid-zwl/JDI-Decision-V0.9/tree/main/runs/vision-paddle-v5
- Guía de reproducción: `REPRODUCE.md` (incluido en el repositorio)
- Fuentes y hashes del OCR: `ocr_inference/ocr_sources.json` (incluido en el repositorio)
- Model card en chino: `README.zh-CN.md` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponible en la información proporcionada
