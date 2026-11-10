# voxor-ai/whisper-small-coreml

## Resumen

Whisper small audio encoder, Core ML es una conversión del codificador de audio del modelo openai/whisper-small al formato Core ML, publicada por el usuario voxor-ai. No se trata de un modelo completo de reconocimiento de voz, sino únicamente del componente encoder: recibe la representación log-mel del audio y produce los embeddings que después consumiría un decoder (no incluido en este repositorio). El paquete se distribuye como un modelo Core ML compilado (`AudioEncoder.mlmodelc`) en fp16 con pesos paletizados a 4 bits, orientado a ejecución en dispositivos Apple con iOS 16 o macOS 13 en adelante.

El interés práctico de esta ficha es limitado y conviene ser explícito: el repositorio tiene 0 descargas y 0 likes, un tamaño de 0.0 GB y fue creado en noviembre de 2026. La model card es extremadamente escueta y no aporta información sobre el proceso de conversión, la metodología de cuantización, los datos de evaluación ni los idiomas soportados. Cualquier evaluación de calidad debe hacerse contra el modelo base original.

La relevancia de este tipo de artefactos radica en el despliegue en el ecosistema Apple: Core ML permite ejecutar inferencia en el Neural Engine y la GPU integrada de iPhone, iPad y Mac sin dependencias de Python, lo que habilita transcripción on-device con Whisper small (244 millones de parámetros en el modelo completo). Sin embargo, al faltar el decoder, este repositorio solo cubre la mitad del pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (componente de audio de Whisper small); el decoder no esta incluido |
| Parametros totales | No disponible en la informacion proporcionada (el modelo base openai/whisper-small tiene 244 M, dato externo a la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 30 s de audio de entrada (3000 frames log-mel); contexto textual del decoder no disponible |
| Tipos de cuantizacion | Pesos paletizados a 4 bits con activaciones fp16 |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Core ML compilado (`AudioEncoder.mlmodelc`), ficheros >1 MB comprimidos con zstd (`.zst`) |

Detalles de interfaz declarados en la model card:

| Elemento | Valor |
|---|---|
| Entrada | `melspectrogram_features` [1, 80, 1, 3000] float16 |
| Salida | `encoder_output_embeds` [1, 768, 1, 1500] float16 |
| Requisito de sistema | iOS 16 / macOS 13 o posterior |
| Libreria | coreml |

## Arquitectura y entrenamiento

El artefacto es una conversión del encoder de Whisper small, un transformer con atención multi-cabeza sobre espectrogramas log-mel. La entrada declarada es un tensor de 80 canales mel por 3000 frames, que corresponde a una ventana de 30 segundos, y la salida es un tensor de 768 dimensiones por 1500 posiciones, coherente con la dimensión oculta y el subsampling temporal característicos de Whisper small. El modelo se distribuye compilado para Core ML con pesos paletizados a 4 bits y cómputo en fp16.

No se ha publicado información sobre el proceso de conversión (herramientas usadas, calibración de la paletización, posible fine-tuning), ni sobre datos de entrenamiento, número de tokens o técnicas de alineación como RLHF o DPO. Tampoco se documenta ninguna innovación técnica más allá de la propia cuantización a 4 bits con paletas, cuyo impacto en la tasa de error de transcripción no se cuantifica en la model card.

## Capacidades

- Extracción de embeddings de audio: convierte 30 segundos de características log-mel en representaciones de 768 dimensiones para su uso por un decoder de Whisper.
- Ejecución on-device en el ecosistema Apple mediante Core ML (iOS 16 / macOS 13 o posterior).
- Inferencia en fp16 con pesos a 4 bits, lo que reduce el peso en disco y memoria frente al modelo original en fp32.
- No incluye generación de texto: el decoder de Whisper no forma parte de este repositorio.
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso, visión ni audio directo (solo recibe log-mel precalculado).
- Capacidades multilingües: no disponibles en la información proporcionada; dependen del decoder que se empareje.

## Casos de uso

- Transcripción on-device en apps iOS y macOS: integrando este encoder con un decoder de Whisper small convertido a Core ML, se puede construir un pipeline de ASR que no envía audio a servidores, adecuado para notas de voz y dictado con requisitos de privacidad.
- Subtitulado local de reuniones y clases: procesar ventanas de 30 segundos en el Neural Engine de un Mac permite generar transcripciones sin conexión, aunque requiere implementar el bucle de ventanas y el decoder por separado.
- Preprocesado de audio en pipelines de análisis: los embeddings de 1500×768 pueden alimentar clasificadores de habla, detección de idioma o diarización simples, reutilizando el encoder como extractor de características congelado.
- Prototipado de investigación en eficiencia: sirve para medir el coste real de la paletización a 4 bits en un encoder transformer sobre hardware Apple, comparando latencia y calidad frente a la conversión fp16 sin paletizar.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real en iPhone o iPad para personas con dificultades auditivas, aprovechando la ejecución local y la ausencia de cuotas de API.
- Distribución de modelos empaquetados: el formato `.mlmodelc` con ficheros `.zst` facilita incluir el encoder en el bundle de una app sin dependencias de Python, siempre que se descompriman los ficheros antes de su uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye WER, latencia, throughput ni comparaciones con el modelo base en fp32 o fp16 sin cuantizar.

## Requisitos de hardware

- VRAM: no disponible. Al ser un modelo Core ML para Apple, se ejecuta sobre memoria unificada; el tamaño exacto del artefacto no se refleja en el repositorio (0.0 GB reportados, probablemente por los ficheros comprimidos con zstd).
- GPU recomendadas: no aplica en el sentido CUDA. El destino es el Neural Engine y la GPU integrada de chips Apple (serie A16 en adelante para iOS 16, chips M para macOS 13 o posterior).
- Cabe en hardware de consumo Apple: sí, por diseño, al estar compilado para Core ML con pesos a 4 bits; no se especifican dispositivos mínimos más allá de la versión de sistema.
- Opciones de despliegue: Core ML (framework nativo), con carga del `.mlmodelc` desde Swift u Objective-C; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que no soportan este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| voxor-ai/whisper-small-coreml (este) | No disponible (base: 244 M) | 30 s de audio | Core ML, 4 bits | MIT | Solo encoder; sin decoder; sin benchmarks |
| openai/whisper-small | 244 M | 30 s de audio | PyTorch (safetensors) | MIT | Modelo completo encoder+decoder; referencia de calidad |
| whisper.cpp (conversiones GGUF de Whisper) | 244 M (small) | 30 s de audio | GGUF | MIT | Ejecución en CPU/GPU multiplataforma, no limitado a Apple |
| Conversiones Core ML de Whisper de terceros | Variable | 30 s de audio | Core ML | Variable | No se dispone de datos verificados en la informacion proporcionada |

La comparación cuantitativa de calidad (WER) entre estas alternativas no está disponible en la documentación consultada.

## Limitaciones y advertencias

- El repositorio contiene únicamente el encoder: no puede transcribir audio por sí solo y requiere un decoder compatible, cuya conversión no se incluye.
- No hay información sobre idiomas soportados; la cobertura multilingüe dependerá del decoder emparejado y del modelo base.
- La cuantización a 4 bits con paletas puede degradar la calidad de los embeddings; no se documenta ninguna evaluación del impacto en WER.
- La model card no describe sesgos conocidos, riesgo de alucinación ni limitaciones específicas del dominio; deben asumirse los del modelo base Whisper small, incluida su tendencia a inventar texto en silencios o audio ruidoso.
- El repositorio tiene 0 descargas y 0 likes y no procede de un canal oficial de OpenAI; no hay garantía de mantenimiento ni de reproducibilidad de la conversión.
- La licencia MIT permite uso comercial, pero conviene verificar el fichero `NOTICE` mencionado por el autor para posibles atribuciones adicionales.
- Los ficheros mayores de 1 MB están comprimidos con zstd; es necesario descomprimirlos antes de cargarlos y gestionar esa dependencia en el pipeline de despliegue.
- Requiere iOS 16 / macOS 13 o posterior; no es portable a Linux, Windows ni Android.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/voxor-ai/whisper-small-coreml
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Documentación de Core ML: https://developer.apple.com/documentation/coreml
- Repositorio de referencia whisper.cpp: https://github.com/ggerganov/whisper.cpp
