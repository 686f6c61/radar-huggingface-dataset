# VietAlphaLabs/SenOCR-Zh

## Resumen

SenOCR-Zh es un modelo OCR multimodal especializado en chino, desarrollado por VietAlphaLabs sobre la arquitectura de PaddleOCR-VL-1.6. Con aproximadamente 0,96 mil millones de parámetros, adapta el decodificador de lenguaje del modelo base para el reconocimiento de texto, tablas, fórmulas y material histórico CJK (chino, japonés y coreano), incluyendo documentos Hán-Nôm. El modelo se presenta como un checkpoint único fusionado, sin necesidad de ramas adaptadoras separadas en inferencia.

El modelo resuelve el problema del parsing de documentos chinos en escenarios diversos: páginas limpias digitales, documentos fotografiados, manuscritos históricos y páginas mixtas con texto, tablas y fórmulas. Su relevancia radica en que, con un tamaño reducido (0,959B parámetros), alcanza una puntuación compuesta china de 85,19 en un grupo de evaluación controlado de 160 páginas, superando ligeramente a Gemini-3-pro-preview (85,10) y a otros OCR especializados como PaddleOCR-VL-1.5 (84,80) o dots.mocr (84,60). El fine-tuning se realizó con LoRA de solo decodificador, actualizando únicamente 12,09 millones de parámetros (aproximadamente el 1,26 % del modelo), entrenado en una sola NVIDIA A10G.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PaddleOCR-VL-1.6 (decoder-only con LoRA) |
| Parametros totales | 958.588.736 (~0,96B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (inferencia en bfloat16) |
| Idiomas soportados | chino (zh), vietnamita (vi), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SenOCR-Zh mantiene la arquitectura completa de PaddleOCR-VL-1.6, un modelo multimodal de aproximadamente 0,96B parámetros diseñado para reconocimiento de elementos de documento. El fine-tuning se realizó mediante LoRA exclusivamente en el decodificador, con rango 32 y alpha 64, lo que supone 12,09 millones de parámetros entrenables (alrededor del 1,26 % del total). El entrenamiento se llevó a cabo en una única GPU NVIDIA A10G.

Los datos de entrenamiento incluyen cuatro conjuntos: un dataset de imágenes de archivo histórico manuscrito de la China moderna (1840-1949), un dataset OCR genérico, un dataset de OCR para caracteres Nôm (vietnamita antiguo) y un dataset de OCR para fórmulas LaTeX. No se menciona el uso de RLHF ni DPO; el proceso se limita a fine-tuning supervisado. El checkpoint resultante está fusionado, por lo que no requiere cargar adaptadores separados en inferencia.

## Capacidades

- Reconocimiento de texto chino (OCR) con una puntuación 1-NED de 84,77 en el grupo de evaluación controlado.
- Reconocimiento de tablas con una puntuación TEDS de 81,57.
- Reconocimiento de fórmulas con una puntuación CDM de 79,47.
- Procesamiento de documentos históricos chinos, incluidos manuscritos y material de archivo.
- Digitalización de caracteres Hán-Nôm (sistema de escritura chino-vietnamita).
- Manejo de documentos fotografiados, aunque con menor rendimiento (82,69) que en documentos digitales limpios (92,69).
- Capacidad multilingüe contextual: puntuación compuesta de 83,38 en vietnamita, inglés y chino combinados.
- Interfaz compatible con transformers (AutoModelForImageTextToText) y con el pipeline de PaddleOCR-VL 1.6 para parsing de páginas completas.
- Soporte de tareas específicas mediante prompts: "OCR:", "Table Recognition:" y "Formula Recognition:".

## Casos de uso

- Digitalización de archivos históricos chinos: el modelo puede transcribir manuscritos y documentos de archivo del periodo 1840-1949, facilitando la creación de corpus digitales consultables. Su entrenamiento específico con el dataset de archivos históricos lo hace adecuado para este fin.
- Parsing de documentos académicos mixtos: en artículos científicos o informes que combinan texto, tablas y fórmulas, SenOCR-Zh puede extraer cada elemento por separado usando los prompts correspondientes, lo que permite estructurar el contenido en Markdown o JSON.
- OCR para documentos fotografiados: su capacidad para procesar imágenes capturadas con cámara (82,69 de compuesto) lo hace útil para digitalizar documentos físicos sin escáner, como actas, contratos o expedientes.
- Digitalización de manuscritos Hán-Nôm: el modelo está entrenado con datos de OCR Nôm, lo que permite transcribir textos históricos vietnamitas escritos en este sistema, un caso de uso relevante para bibliotecas y archivos nacionales.
- Extracción de tablas en informes financieros o administrativos: con una puntuación TEDS de 81,57, puede convertir tablas de documentos chinos en datos estructurados para su posterior procesamiento en hojas de cálculo o bases de datos.
- Integración en pipelines de PaddleOCR-VL 1.6: al ser compatible con el pipeline de PaddleOCR, puede usarse como modelo de reconocimiento multimodal dentro de un flujo completo de parsing de páginas, incluyendo detección de regiones, lectura de PDF y restructuración de documentos.

## Benchmarks y rendimiento

SenOCR-Zh se evaluó en un slice controlado de 480 páginas del benchmark MDPBench, con 160 páginas por idioma (chino, vietnamita e inglés). Los resultados son controlados por el proyecto y no han sido verificados oficialmente en el leaderboard de MDPBench.

| Metrica | Valor |
|---|---|
| Compuesto chino (ZH) | 85,19 |
| Texto (1-NED) | 84,77 |
| Tabla (TEDS) | 81,57 |
| Formula (CDM) | 79,47 |
| Compuesto documentos digitales limpios | 92,69 |
| Compuesto documentos fotografiados | 82,69 |
| Compuesto multilingue (vi+en+zh) | 83,38 |

Comparacion en chino (ZH) con otros modelos:

| Modelo | Tipo | Puntuacion ZH |
|---|---|---|
| SenOCR-Zh | OCR especializado, 0,959B | 85,19* |
| Gemini-3-pro-preview | VLM general | 85,10 |
| PaddleOCR-VL-1.5 | OCR especializado | 84,80 |
| dots.mocr | OCR especializado | 84,60 |
| MonkeyOCRv2-S-Parsing | OCR especializado | 84,40 |

\* Resultado controlado por el proyecto; verificacion oficial en MDPBench pendiente.

## Requisitos de hardware

- Entrenamiento: realizado en una sola NVIDIA A10G (24 GB VRAM) con LoRA de solo decodificador.
- Inferencia: el ejemplo de uso con transformers permite ejecutar el modelo en CPU o GPU, aunque para un rendimiento razonable se recomienda una GPU con al menos 8-16 GB de VRAM en bfloat16.
- El tamaño del checkpoint es de 3,8 GB, por lo que cabe en GPUs de consumo como la RTX 3060 (12 GB) o superiores.
- Opciones de despliegue: transformers (AutoModelForImageTextToText) y pipeline PaddleOCRVL de PaddleOCR. No se menciona soporte para vLLM, Ollama o llama.cpp.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Puntuacion ZH | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SenOCR-Zh | 0,959B | no disponible | 85,19* | Apache 2.0 | HuggingFace |
| PaddleOCR-VL-1.5 | no disponible | no disponible | 84,80 | no disponible | HuggingFace |
| dots.mocr | no disponible | no disponible | 84,60 | no disponible | no disponible |
| MonkeyOCRv2-S-Parsing | no disponible | no disponible | 84,40 | no disponible | no disponible |
| Gemini-3-pro-preview | no disponible | no disponible | 85,10 | propietaria | API |

\* Resultado controlado por el proyecto, no verificado oficialmente.

SenOCR-Zh se posiciona como una alternativa ligera y de codigo abierto frente a modelos propietarios como Gemini-3-pro-preview, con una puntuacion ligeramente superior en chino y una licencia Apache 2.0 que permite uso comercial sin restricciones.

## Limitaciones y advertencias

- Los resultados de evaluacion son controlados por el proyecto y no han sido verificados oficialmente en el leaderboard de MDPBench; las comparaciones con otros modelos deben tomarse con cautela.
- El modelo esta optimizado principalmente para chino; el rendimiento en vietnamita e ingles es contextual y no constituye el objetivo de optimizacion.
- El rendimiento en documentos fotografiados (82,69) es notablemente inferior al de documentos digitales limpios (92,69), por lo que en escenarios con fotografias de baja calidad o perspectiva distorsionada puede requerir preprocesamiento adicional.
- No se dispone de informacion sobre la longitud de contexto, lo que limita la planificacion de despliegues con documentos muy extensos.
- No se documentan sesgos especificos, pero al tratarse de un modelo entrenado con datos historicos, puede heredar sesgos de epoca o variaciones dialectales del chino.
- No se menciona soporte para tool calling, agentes ni razonamiento multi-paso; el modelo esta disenado exclusivamente para tareas de reconocimiento de documentos.
- La fecha de creacion del modelo (septiembre de 2026) es posterior a la fecha actual, lo que sugiere que puede tratarse de un modelo en fase de publicacion reciente o con datos de versionado no convencionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VietAlphaLabs/SenOCR-Zh
- Pagina de investigacion: https://vietalpha.org/research/senocr-zh
- Organizacion VietAlphaLabs: https://huggingface.co/VietAlphaLabs
- Documentacion de PaddleOCR-VL: https://github.com/PaddlePaddle/PaddleOCR/blob/main/docs/version3.x/pipeline_usage/PaddleOCR-VL.en.md
- Modelo base PaddleOCR-VL-1.6: https://huggingface.co/PaddlePaddle/PaddleOCR-VL-1.6
