# wmghf2023/asr-tts-llm-models

## Resumen

Este repositorio no contiene un modelo único, sino un espejo (mirror) de varios modelos open source utilizados por **AI快譯通**, una aplicación Android de traducción de voz offline. El autor, wmghf2023, re-aloja los ficheros exactos que la aplicación descarga en una instalación limpia, de modo que el funcionamiento de la app no dependa de la disponibilidad de los servidores originales. Todos los ficheros son copias byte a byte sin modificar, sin re-cuantización ni conversión.

El repositorio incluye modelos para dos tareas: reconocimiento automático del habla (ASR) con tres exportaciones de Moonshine Base (chino, inglés y japonés) en formato sherpa-onnx, y traducción con cuatro modelos: Qwen3.5-4B y Qwen3.5-2B en formato MNN INT4, TranslateGemma-4B en GGUF Q4_K_M, y CAT-Translate-1.4B en GGUF Q4_K_M con imatrix. El tamaño total del repositorio es de 7,5 GB y los parámetros totales declarados (dato real de safetensors) son 1.407.538.944, aunque este dato corresponde probablemente a uno de los modelos individuales y no al conjunto completo.

La relevancia de este repositorio es práctica: garantiza la reproducibilidad y disponibilidad a largo plazo de los pesos de una aplicación comercial de traducción offline, algo poco habitual y útil para desarrolladores que quieran auditar o reutilizar los mismos modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multiple: Moonshine Base (ASR), Qwen3.5 (LLM), TranslateGemma (LLM), CAT-Translate (LLM) |
| Parametros totales | 1.407.538.944 (dato safetensors del repo; no desglosado por modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MNN INT4 (Qwen3.5), GGUF Q4_K_M (TranslateGemma, CAT-Translate), sin cuantizar (Moonshine) |
| Idiomas soportados | Chino, ingles, japones (ASR); traduccion entre idiomas no especificada en detalle |
| Licencia | no disponible (cada subcarpeta incluye su propia licencia original) |
| Formato de pesos | sherpa-onnx (Moonshine), MNN (Qwen3.5), GGUF (TranslateGemma, CAT-Translate) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento de los modelos individuales en este repositorio, ya que es un mirror y no incluye documentacion tecnica propia. Por los nombres y formatos se puede inferir lo siguiente:

- **Moonshine Base**: modelo ASR basado en transformer, exportado a sherpa-onnx para inferencia on-device. Existen variantes para chino, ingles y japones.
- **Qwen3.5-4B y Qwen3.5-2B**: modelos de lenguaje de la familia Qwen, convertidos a formato MNN con cuantizacion INT4 para ejecucion eficiente en dispositivos moviles.
- **TranslateGemma-4B**: modelo de traduccion basado en la familia Gemma de Google, en formato GGUF Q4_K_M.
- **CAT-Translate-1.4B**: modelo de traduccion especializado en japones-ingles, en GGUF Q4_K_M con imatrix (matriz de importancia para mejor cuantizacion).

No se proporcionan datos sobre tokens de entrenamiento, composicion del dataset ni tecnicas de alineamiento (RLHF/DPO).

## Capacidades

- Reconocimiento automatico del habla (ASR) en chino, ingles y japones mediante Moonshine Base.
- Traduccion automatica entre idiomas mediante los modelos Qwen3.5, TranslateGemma y CAT-Translate.
- Ejecucion completamente offline, sin conexion a servidores externos.
- Inferencia on-device en dispositivos Android gracias a los formatos MNN INT4 y GGUF Q4_K_M.
- Soporte de conversacion multimodal (voz a texto, traduccion, texto a voz) en el contexto de la aplicacion AI快譯通.
- No se especifican capacidades de tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- **Traduccion de conversaciones en tiempo real**: la aplicacion AI快譯通 captura voz, la transcribe con Moonshine, la traduce con Qwen3.5 o TranslateGemma y la reproduce con un motor TTS. El repositorio garantiza que estos modelos esten siempre disponibles para su descarga.
- **Auditoria de modelos en produccion**: un desarrollador puede descargar este repositorio y verificar exactamente que pesos usa la aplicacion, comparandolos con los originales de los repositorios upstream.
- **Reutilizacion de modelos ASR multilingue**: los exports de Moonshine en sherpa-onnx pueden integrarse en otras aplicaciones Android o proyectos de Python que usen sherpa-onnx para reconocimiento de voz offline.
- **Traduccion japones-ingles especializada**: el modelo CAT-Translate-1.4B en GGUF Q4_K_M es adecuado para integrarse en pipelines de traduccion con llama.cpp o servidores compatibles con GGUF.
- **Despliegue de LLM en dispositivos moviles**: los modelos Qwen3.5 en MNN INT4 demuestran un patron de cuantizacion y conversion util para desarrolladores que necesiten ejecutar LLMs en hardware limitado.
- **Investigacion sobre cuantizacion**: la presencia de GGUF Q4_K_M con imatrix y MNN INT4 permite comparar el impacto de diferentes esquemas de cuantizacion sobre modelos de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de calidad de traduccion, WER (word error rate) para ASR, ni latencias de inferencia.

## Requisitos de hardware

- **VRAM estimada**: no disponible. Los modelos en GGUF Q4_K_M (TranslateGemma-4B, CAT-Translate-1.4B) pueden ejecutarse en CPU con llama.cpp sin necesidad de GPU. Los modelos MNN INT4 estan disenados para CPU de dispositivos moviles.
- **GPU recomendadas**: no se requiere GPU para los modelos cuantizados; una GPU con 4-6 GB de VRAM seria suficiente para TranslateGemma-4B en Q4_K_M si se desea aceleracion.
- **Compatibilidad con consumer GPU**: si, los modelos GGUF pueden ejecutarse en GPUs de consumo como RTX 3060 o superiores con llama.cpp o Ollama.
- **Opciones de despliegue**: llama.cpp, Ollama, sherpa-onnx (para Moonshine), MNN (para Qwen3.5), servidores compatibles con endpoints GGUF.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No es posible realizar una comparativa directa porque el repositorio contiene multiples modelos de diferentes familias y tamanos. Como referencia para la tarea de traduccion offline:

| Modelo | Parametros | Contexto | Formato | Licencia |
|---|---|---|---|---|
| TranslateGemma-4B (en este repo) | 4B | no disponible | GGUF Q4_K_M | no disponible |
| CAT-Translate-1.4B (en este repo) | 1.4B | no disponible | GGUF Q4_K_M | no disponible |
| Qwen3.5-4B (en este repo) | 4B | no disponible | MNN INT4 | no disponible |
| NLLB-200 (alternativa de referencia) | 600M-3.3B | 512 tokens | safetensors | CC-BY-NC |

La comparativa con NLLB-200 es orientativa: NLLB-200 es un modelo de traduccion multilingue ampliamente usado, pero no esta disponible en este repositorio.

## Limitaciones y advertencias

- **Sin informacion de licencia agregada**: cada subcarpeta incluye su propia licencia, pero el repositorio no la resume. Es imprescindible revisar cada README individual antes de usar los modelos comercialmente.
- **Sin garantia de actualizacion**: al ser un mirror, los modelos pueden quedar desactualizados si la aplicacion cambia sus pesos en futuras versiones.
- **Sin benchmarks publicados**: no hay datos de calidad de traduccion ni de ASR, por lo que el rendimiento real es desconocido.
- **Riesgo de sesgos**: los modelos de traduccion y ASR pueden tener sesgos asociados a sus datos de entrenamiento, no documentados aqui.
- **Alucinacion en traduccion**: los modelos LLM pueden producir traducciones inventadas o inexactas, especialmente con entradas ambiguas o ruido de voz.
- **Limitacion de idiomas**: el ASR solo cubre chino, ingles y japones; la traduccion esta orientada a esos pares de idiomas, con especializacion ja-en en CAT-Translate.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/wmghf2023/asr-tts-llm-models
- Proyecto relacionado (sistema ASR-LLM-TTS): https://github.com/ABexit/ASR-LLM-TTS
- Documentacion tecnica del proyecto relacionado: https://deepwiki.com/ABexit/ASR-LLM-TTS
- Articulo sobre modelo unificado ASR-TTS: https://arxiv.org/html/2510.04593v2
