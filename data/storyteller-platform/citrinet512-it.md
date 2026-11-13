# storyteller-platform/citrinet512-it

## Resumen

Citrinet 512 italiano es un modelo de reconocimiento automático del habla (ASR) basado en la arquitectura Citrinet, especializado en transcripción de audio en italiano. Lo desarrolla originalmente NeMo (NVIDIA) y el autor de este repositorio, storyteller-platform, publica una conversión y espejo del modelo dentro de su registro de modelos para la plataforma Storyteller. El modelo se distribuye en dos formatos: ONNX (con el front end mel integrado) y MLX (pesos en safetensors para el cargador de MLX), pensados para inferencia local en distintos entornos.

La relevancia de esta ficha es acotada: se trata de una conversión de un modelo ASR ya existente, no de un modelo de lenguaje generativo. Su interés práctico reside en que ofrece una vía lista para usar de transcripción italiana en formato ONNX y MLX, con el front end de características ya incorporado en el grafo ONNX, lo que simplifica el despliegue. La información pública disponible es escasa: la model card no detalla parámetros, contexto ni resultados de benchmarks.

Por tanto, esta ficha describe lo que se puede verificar a partir de la información proporcionada (arquitectura Citrinet, procedencia NeMo, licencia BSD-3-Clause, formatos y ficheros) y marca explícitamente como "no disponible" todo aquello que no consta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (red convolucional para ASR, familia NeMo) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, no de contexto textual) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos safetensors y ONNX sin indicar cuantizacion) |
| Idiomas soportados | italiano (según el nombre del modelo y su procedencia) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX) y ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para reconocimiento de voz desarrollada en el ecosistema NeMo de NVIDIA. El modelo original es `neongeckocom/stt_it_citrinet_512_gamma_0_25`, entrenado para italiano y publicado bajo licencia BSD-3-Clause. La variante "512" hace referencia al número de canales de la arquitectura Citrinet, y "gamma_0_25" al parámetro de compresión temporal característico de esta familia.

Este repositorio no entrena el modelo, sino que publica una conversión. Según la model card, `model.safetensors` contiene los pesos del codificador en el formato que espera el cargador de MLX, junto con el banco de filtros mel y la ventana del front end de NeMo. `model.onnx` es la exportación con el front end mel integrado delante del codificador, de modo que acepta la señal preenfatizada y con padding reflectante y calcula por sí mismo las características y su longitud; el codificador no se modifica. No se dispone de información sobre número de tokens de entrenamiento, composición del dataset ni técnicas de ajuste (RLHF/DPO), al tratarse de un modelo ASR y no generativo.

## Capacidades

- Reconocimiento automático del habla en italiano: transcripción de audio a texto.
- Inferencia mediante ONNX Runtime (formato ONNX con front end mel integrado).
- Inferencia mediante MLX (formato safetensors con pesos del codificador y front end de NeMo).
- Tokenización con SentencePiece (`tokenizer.spm` procedente del modelo original).
- No dispone de generación de texto libre, razonamiento, código ni matemáticas: es un modelo ASR, no un LLM.
- No consta soporte de tool calling, agentes ni razonamiento multi-paso.
- No consta soporte de visión, audio como salida ni modo "thinking".

## Casos de uso

- Transcripción de audio en italiano en aplicaciones de subtitulado: el modelo convierte audio a texto y puede integrarse en pipelines de generación de subtítulos para vídeo o pódcast en italiano, aprovechando el formato ONNX con front end integrado para simplificar el preprocesado.
- Dictado por voz en italiano: integración en herramientas de escritura por voz donde se requiera transcripción local sin dependencia de servicios en la nube, usando el formato MLX en equipos Apple Silicon.
- Indexación y búsqueda de contenido hablado: transcripción de archivos de audio en italiano para alimentar motores de búsqueda o sistemas de recuperación de información sobre el texto resultante.
- Asistentes de voz locales: uso del modelo como componente ASR en asistentes de voz domésticos en italiano, dado su origen en el ecosistema OpenVoiceOS y su licencia permisiva BSD-3-Clause.
- Análisis de reuniones y llamadas en italiano: transcripción de grabaciones para generar actas o resúmenes posteriores, combinando el ASR con un modelo de lenguaje aparte.
- Accesibilidad: generación de transcripciones en tiempo real para personas con discapacidad auditiva en contenidos en italiano, desplegando el modelo ONNX en servidores con CPU o GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero apto para inferencia en CPU y GPU de gama baja, pero no se dispone de cifras oficiales de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible de forma explícita; por el tamaño del repositorio (0,3 GB) es plausible que quepa en GPU de consumo, pero no se confirma en la información proporcionada.
- Opciones de despliegue: ONNX Runtime (formato ONNX) y MLX (formato safetensors para Apple Silicon). No consta soporte explícito para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| storyteller-platform/citrinet512-it | Citrinet | Italiano | BSD-3-Clause | ONNX, safetensors (MLX) | Conversión del modelo NeMo con front end integrado |
| neongeckocom/stt_it_citrinet_512_gamma_0_25 | Citrinet | Italiano | BSD-3-Clause | no disponible en la información | Modelo original del que deriva esta conversión |
| OpenVoiceOS/neongeckocom-stt_it_citrinet_512_gamma_0_25_onnx | Citrinet | Italiano | BSD-3-Clause | ONNX | Exportación ONNX de origen usada para la conversión |

No se dispone de datos de rendimiento para comparar cuantitativamente con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo ASR especializado en italiano; no es un modelo de lenguaje generativo y no debe usarse para tareas de generación de texto.
- No se dispone de información sobre sesgos, tasas de error ni comportamiento en acentos o dominios específicos.
- Riesgo de errores de transcripción inherente a todo sistema ASR; no se dispone de métricas (WER) publicadas en la información proporcionada.
- La model card no detalla la cobertura de variantes dialectales del italiano ni el dominio de audio de entrenamiento.
- Licencia BSD-3-Clause: permite uso comercial con atribución y conservación del aviso de copyright; conviene revisar los términos completos antes de su uso en producción.
- El modelo se distribuye como espejo de una versión concreta (2.0.0) del registro de Storyteller; cambios en el modelo original no se reflejan automáticamente.
- El formato MLX está orientado a Apple Silicon; el formato ONNX es el más portable entre plataformas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-it
- Modelo original: https://huggingface.co/neongeckocom/stt_it_citrinet_512_gamma_0_25
- Exportación ONNX de origen: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_it_citrinet_512_gamma_0_25_onnx
- Registro de modelos de Storyteller (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-it
- Scripts de conversión y exportación (GitLab): https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
