# wangxp9527/alison-whisper-coreml

## Resumen

AlisonPlayer Whisper CoreML es un repositorio de modelos de reconocimiento automático de voz (ASR) en formato CoreML publicado por el usuario wangxp9527 en HuggingFace. Se presenta como una conversión de los checkpoints Whisper de OpenAI (variantes tiny, base y small) optimizada para ejecutarse de forma totalmente offline sobre el Neural Engine (ANE) de los chips Apple Silicon. El repositorio ocupa 0,7 GB y contiene tres archivos ZIP con los modelos empaquetados.

El propósito declarado en la model card (redactada en chino) es el reconocimiento de voz en el dispositivo, sin conexión y multilingüe, dentro del reproductor denominado AlisonPlayer. Al distribuirse como CoreML, el artefacto está pensado para integrarse en aplicaciones de iOS y macOS mediante Core ML, sin depender de Python ni de servicios de inferencia remotos.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el repositorio no declara licencia, idiomas, pipeline ni métricas, y acumula 0 descargas y 0 "me gusta", por lo que no existe evidencia pública de validación independiente. La model card se limita a listar los tres archivos con sus tamaños y hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (conversión de variantes Whisper de OpenAI; no detallada en la model card) |
| Parametros totales | Whisper tiny ~39 M, base ~74 M, small ~244 M (cifras públicas de OpenAI; no indicadas en la model card) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; en la arquitectura Whisper la entrada estándar es una ventana de audio de 30 s (1500 fotogramas mel) |
| Tipos de cuantizacion | No disponible (los tamaños de los artefactos son compatibles con pesos en coma flotante de 16 bits, pero no se especifica) |
| Idiomas soportados | La model card describe el modelo como "multilingüe" (离线多语言), pero no enumera idiomas concretos |
| Licencia | No disponible (el repositorio no declara licencia; los pesos originales de Whisper se publican bajo licencia MIT, pero esta conversión no lo especifica) |
| Formato de pesos | CoreML, distribuido en archivos ZIP (whisper-tiny.zip, whisper-base.zip, whisper-small.zip) |
| Variantes incluidas | whisper-tiny, whisper-base, whisper-small |
| Tamano de los artefactos | 67,09 MB / 127,17 MB / 425,75 MB respectivamente |
| Verificacion de integridad | SHA-256 publicado para cada ZIP (tiny: 6678f73f...e82ba0f; base: 6156c25e...ff2528; small: 6ab5fc20...b34e693) |
| Repositorio | 0,7 GB, creado y actualizado el 2026-09-29 segun los metadatos de HuggingFace |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento. Se trata, segun la denominacion de los archivos, de una conversión a CoreML de pesos Whisper ya entrenados, no de un modelo entrenado desde cero ni de un ajuste fino documentado. No se indica el conjunto de datos, el número de tokens, ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se detalla el proceso de conversión (versión de coremltools, precisión numérica, uso de paletización o cuantización de pesos).

Como contexto de la familia base, los checkpoints Whisper de OpenAI son transformers encoder-decoder con atención completa, entrenados sobre audio débilmente supervisado y con soporte de marcas de tiempo y detección de idioma. Esa descripcion corresponde a la documentación pública de OpenAI y no a información confirmada en este repositorio, por lo que no debe asumirse que la conversión preserve exactamente el mismo comportamiento numérico que los pesos originales.

## Capacidades

- Reconocimiento de voz a texto en local, sin conexión a red, sobre hardware Apple Silicon.
- Tres tamaños de modelo que permiten un compromiso entre huella en disco y precisión (67 MB, 127 MB y 426 MB).
- Ejecución sobre el Neural Engine (ANE), con posibilidad de fallback a CPU o GPU mediante Core ML (no confirmado en la model card).
- Capacidad multilingüe: la model card la menciona de forma genérica, sin listar idiomas ni confirmar el subconjunto real de lenguas cubiertas.
- Traducción de voz a inglés: no confirmada en la model card, aunque es una capacidad de las variantes originales de Whisper.
- Detección automática de idioma: no confirmada en el repositorio.
- Marcas de tiempo por segmento: no confirmado.
- Tool calling / function calling: no disponible, no es una capacidad de un modelo ASR.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades de visión, audio generativo o modo de razonamiento extendido: no disponibles.

## Casos de uso

- Subtitulado en tiempo real dentro de un reproductor local: el modelo puede transcribir la pista de audio de un vídeo directamente en el dispositivo, lo que evita enviar contenido protegido a servidores externos. El tamaño tiny (67 MB) permite incluirlo en el propio paquete de la aplicación.
- Transcripcion de reuniones con requisitos de privacidad: en entornos sanitarios, legales o de defensa, donde el audio no puede salir del equipo, un modelo CoreML sobre ANE procesa la grabación íntegramente en un Mac con Apple Silicon.
- Dictado por voz en aplicaciones de escritorio para macOS: la variante base (127 MB) ofrece un equilibrio razonable entre latencia y consumo de memoria unificada para dictado continuo de fragmentos cortos.
- Accesibilidad y subtitulado automático en apps de iOS: integración vía Core ML o el framework Vision para generar subtítulos en directo en contenidos reproducidos en iPhone o iPad, incluso en modo avión o en zonas sin cobertura.
- Indexacion y busqueda semantica de archivos de audio personales: transcripción por lotes de grabaciones de voz, notas de audio y podcasts para construir un índice de texto consultable localmente, sin coste de API por hora de audio.
- Preprocesado en pipelines de datos de voz: generación de transcripciones preliminares para anotación humana posterior en proyectos de investigación, aprovechando que no requiere infraestructura de GPU dedicada.
- Prototipado rapido en Xcode: validación del comportamiento de Whisper en Core ML antes de decidir si se adopta una solución propietaria o se entrena un modelo específico de dominio.
- Traduccion de notas de voz al ingles: uso potencial de la capacidad de traducción de la familia Whisper, supeditado a confirmar que la conversión CoreML la conserva (no verificado en la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tasas de error de palabra (WER), latencia, consumo energetico ni comparaciones con otras conversiones a CoreML.

## Requisitos de hardware

- Hardware objetivo: chips Apple Silicon con Neural Engine (familia M1 o posterior, y SoC A-series recientes en iPhone/iPad). No se declara compatibilidad con Macs Intel.
- GPU NVIDIA o AMD con CUDA/ROCm: no soportado; el formato CoreML está orientado al ecosistema Apple.
- Huella en disco: 67,09 MB (tiny), 127,17 MB (base) y 425,75 MB (small) para los ZIP; el modelo descomprimido ocupará un espacio similar o algo superior.
- Memoria unificada necesaria para inferencia: no disponible. Con los tamaños de peso indicados, es esperable que cualquier Mac con 8 GB de memoria unificada pueda alojar las tres variantes, pero no hay cifras oficiales.
- GPU de consumo (RTX 4090, etc.): no aplicable, ya que el artefacto no es un formato PyTorch, GGUF ni safetensors.
- Opciones de despliegue: Core ML en apps nativas, framework Vision y flujos de trabajo en Xcode. No hay indicios de soporte en vLLM, llama.cpp, Ollama o TGI, que trabajan con otros formatos.
- Latencia y throughput: no disponibles. Dependerán del chip concreto, de la variante elegida y de si la ejecución se delega al ANE o recae en CPU/GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Hardware objetivo | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alison-whisper-coreml | ~39 M / ~74 M / ~244 M (cifras de la familia Whisper, no declaradas en el repo) | Apple Silicon (ANE) | CoreML en ZIP | No declarada | Repositorio HuggingFace con 0 descargas |
| Whisper original (OpenAI) | ~39 M / ~74 M / ~244 M para tiny, base y small | CPU/GPU con PyTorch | PyTorch (.pt) | MIT | Repositorio oficial ampliamente utilizado |
| whisper.cpp | Mismos pesos convertidos a GGML/GGUF de Whisper | CPU, Metal, CUDA, Vulkan | GGML/GGUF | MIT | Proyecto de referencia con gran adopción |
| WhisperKit (Argmax) | Pesos Whisper convertidos a CoreML | Apple Silicon (ANE) | CoreML | MIT | Proyecto mantenido y documentado para iOS/macOS |

No se dispone de datos de rendimiento comparado entre estas opciones dentro de la informacion proporcionada, por lo que la comparativa se limita a formato, hardware y licencia.

## Limitaciones y advertencias

- Ausencia de licencia: al no declararse licencia en el repositorio, el uso comercial del artefacto queda en una situación juridicamente ambigua, aunque los pesos originales de OpenAI se distribuyan bajo MIT. Conviene aclararlo con el autor antes de integrarlo en un producto.
- Falta de validacion: 0 descargas y 0 "me gusta" implican que no hay evidencia pública de que la conversión funcione correctamente ni de que reproduzca el comportamiento de los pesos originales.
- Sin metricas: no hay WER, ni pruebas por idioma, ni datos de latencia o consumo energetico, imprescindibles para decidir un despliegue en produccion.
- Idiomas sin especificar: la model card afirma que el modelo es multilingüe, pero no detalla qué lenguas están cubiertas ni con qué calidad. No debe asumirse un buen rendimiento en castellano sin verificarlo.
- Riesgo de alucinacion: la familia Whisper tiende a generar texto plausible en tramos de silencio, ruido o audio musical. Es un comportamiento documentado del modelo base y no consta que se haya mitigado en esta conversión.
- Dependencia de plataforma: al ser CoreML, el artefacto no es portable a Linux o Windows con GPU NVIDIA, lo que limita su uso a aplicaciones Apple.
- Cifras de parametros no declaradas: los valores de la tabla de especificaciones proceden de la documentación pública de Whisper, no de este repositorio; una conversión podría haber alterado el grafo o la precisión.
- Fechas anomalas: los metadatos indican creacion y actualizacion el 2026-09-29, una fecha que conviene verificar antes de citar el repositorio.
- Sin soporte de tool calling, agentes ni razonamiento multi-paso: es un modelo puramente ASR.
- Documentacion minima: la model card solo aporta una tabla de archivos y hashes; los hashes permiten verificar la integridad de la descarga, pero no acreditan el origen ni la calidad de los pesos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wangxp9527/alison-whisper-coreml
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios auxiliares ni demos asociados a este modelo.
- Referencia de la familia base (no citada en la model card del autor): repositorio de OpenAI Whisper en https://github.com/openai/whisper y articulo "Robust Speech Recognition via Large-Scale Weak Supervision" en https://arxiv.org/abs/2212.04356.
