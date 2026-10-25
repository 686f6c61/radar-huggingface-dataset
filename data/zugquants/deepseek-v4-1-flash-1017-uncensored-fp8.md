# zugquants/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8

## Resumen

DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 es una versión modificada a nivel de pesos del modelo multimodal DeepSeek-V4.1-Flash-1017 de DeepSeek, publicada por el usuario zugquants (el contenido de la model card atribuye el trabajo a dealignai). El modelo conserva la arquitectura original —un transformer disperso (MoE) de 40 capas con 763.205.315.794 parámetros totales, pesos nativos en FP8 e4m3 con escalas de bloque ue8m0 y expertos en FP4— y una ventana de contexto de 1 millón de tokens.

La modificación consiste en una eliminación del comportamiento de rechazo (abliteration) aplicada directamente sobre los tensores en FP8, sin fine-tuning supervisado, sin RLHF, sin DPO, sin LoRA y sin cambios en el tokenizador ni en la plantilla de chat. El resultado es un checkpoint drop-in que carga con el motor `inference/` de referencia de DeepSeek sin cambios de código, manteniendo visión, vídeo, tool calling, los niveles de esfuerzo de razonamiento (`low`/`high`/`max`) y la decodificación especulativa DSpark.

Es relevante ahora porque combina tres factores poco habituales: contexto de 1M tokens, multimodalidad imagen/vídeo y pesos nativos en FP8 de 510 GB, todo bajo licencia MIT. Ahora bien, el repositorio no tiene descargas ni validación comunitaria, el acceso está restringido mediante gate (18+) y no se han publicado resultados de benchmarks del bundle uncensored en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE de 40 capas; pesos FP8 e4m3 con escalas de bloque ue8m0 y expertos MoE en FP4 |
| Parametros totales | 763.205.315.794 (763,2 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantizacion | FP8 nativo (e4m3fn) con escalas ue8m0 + expertos FP4; existe un hermano EXL3 de 2,9 bpw publicado aparte |
| Idiomas soportados | en, zh, es, fr, ru, it, th |
| Licencia | MIT |
| Formato de pesos | safetensors (48 shards), FP8 nativo; repo de 510,3 GB |
| Modelo base | deepseek-ai/DeepSeek-V4.1-Flash-1017 (relación: finetune) |
| Pipeline | image-text-to-text |
| Modalidades | Texto, imagen y vídeo |
| Motores compatibles | Motor `inference/` de referencia de DeepSeek (drop-in); otros motores no confirmados en la información disponible |
| Muestreo recomendado | temperature=1.0, top_p=1.0, max_tokens >= 256K |

## Arquitectura y entrenamiento

La arquitectura es un MoE de 40 capas heredado íntegramente del modelo base DeepSeek-V4.1-Flash-1017. Los pesos se almacenan en FP8 nativo (formato `e4m3fn`) con escalas de bloque `ue8m0`, y los expertos MoE se guardan en FP4. El checkpoint se distribuye en 48 shards de safetensors y es byte-compatible con el formato upstream: incluye el motor `inference/` y el renderizador de prompts `encoding/` de referencia de DeepSeek sin modificar. Incorpora decodificación especulativa DSpark y un mecanismo de niveles de esfuerzo de razonamiento (`low`, `high`, `max`) que se controla desde la petición.

No hubo entrenamiento adicional. Según la model card, la modificación es exclusivamente a nivel de pesos: no se aplicó SFT, ni RLHF, ni DPO, ni se utilizó datos de preferencias sobre rechazos. Tampoco se alteró el vocabulario ni el tokenizador (`tokenizer.json` y `tokenizer_config.json` son idénticos al upstream), no se modificó la plantilla Jinja, no se inyectó un preámbulo de sistema y no se usan adaptadores en tiempo de carga. El autor advierte explícitamente que cuantizar este checkpoint FP8 a bits bajos acumula el error de cuantización sobre la edición de abliteration, y que para una release de baja precisión correcta hay que rehacer el pipeline de abliteration en la precisión objetivo (es el caso del hermano EXL3 2,9 bpw).

## Capacidades

- Generación de texto y razonamiento con niveles de esfuerzo configurables (`low`, `high`, `max`), pensados para un modo "heavy reasoner" con `max_tokens` de 256K o superior.
- Comprensión de imagen y vídeo (pipeline `image-text-to-text`), preservada del modelo base.
- Tool calling y function calling, preservados del modelo base.
- Ventana de contexto de 1M tokens, adecuada para documentos largos, bases de código completas o conversaciones multi-turno extensas.
- Multilingüe en siete idiomas: inglés, chino, español, francés, ruso, italiano y tailandés.
- Decodificación especulativa DSpark integrada en el motor de referencia.
- Comportamiento sin rechazos: el modelo responde a peticiones de categorías que el base declinaría (esto es una capacidad declarada y a la vez una advertencia; véase la sección de limitaciones).
- Sin modo "apagar/encender" la censura: la modificación está en los pesos y no es reversible en tiempo de carga.

## Casos de uso

- Análisis de documentos extensos y contratos: con 1M tokens de contexto se puede ingerir un expediente completo (miles de páginas) en una sola petición y hacer preguntas cruzadas sin troceado ni recuperación externa.
- Revisión de bases de código completas: el contexto de 1M tokens permite cargar un repositorio de tamaño medio y pedir refactorizaciones o auditorías de seguridad con visibilidad de múltiples ficheros a la vez, apoyándose en tool calling para consultar el árbol de ficheros.
- Procesamiento de vídeo para moderación o catalogación: la entrada de vídeo permite generar descripciones, resúmenes por segmentos o metadatos indexables en pipelines de archivo audiovisual.
- Investigación sobre seguridad y alineación: al ser un modelo con los rechazos eliminados de forma documentada (sin jailbreak de plantilla ni LoRA), sirve como objeto de estudio controlado para medir cómo varía la tasa de cumplimiento y la calidad tras una edición de abliteration.
- Agentes multi-paso con herramientas: la combinación de tool calling, contexto de 1M y niveles de razonamiento alto permite orquestar flujos de varias etapas (consulta a API, lectura de resultado, nueva consulta) sin perder el hilo.
- Generación de documentación técnica multilingüe: cubre EN/ZH/ES/FR/RU/IT/TH, útil para producir y traducir documentación de producto manteniendo terminología consistente en una sola sesión.
- Extracción de datos estructurados de material mixto (PDF escaneado convertido a imagen + texto adjunto) en entornos internos donde el contenido no puede salir a una API de terceros.

## Benchmarks y rendimiento

La model card incluye una evaluación interna de MMLU en modo logit (57 asignaturas × 20 preguntas = 1140 preguntas), con prompt idéntico, modo chat sin razonamiento, greedy T=0 y argmax del primer token. La tabla original está truncada en la información disponible, por lo que solo se puede reproducir la fila del modelo base:

| Modelo | MMLU-20×57 | Δ vs base |
|---|---|---|
| DeepSeek-V4.1-Flash-1017 base (API oficial) | 87,63 % (999/1140) | — |
| DeepSeek-V4.1-Flash-1017 UNCENSORED FP8 (este repo) | no disponible (dato truncado en la información proporcionada) | no disponible |

El resto de la evaluación (categorías de capacidad adicionales, comparación de cumplimiento y cualquier otro benchmark como HumanEval o GSM8K) no está disponible en la información proporcionada. No se han publicado resultados de benchmarks del bundle uncensored en la información disponible.

## Requisitos de hardware

- VRAM para los pesos: el repo ocupa 510,3 GB en FP8, por lo que se necesita un pool de memoria de al menos ese orden solo para los pesos, más caché KV para el contexto solicitado. Con 1M tokens la caché KV crece de forma significativa y no está cuantificada en la información disponible.
- Configuración validada por el autor: 4×H200 en tensor parallel 4 (TP4), que es la que se usó para las evaluaciones internas (4 × 141 GB HBM3e = 564 GB).
- Alternativas de clase datacenter: 8×H100 de 80 GB (640 GB) es la configuración mínima razonable del lado Hopper; 4×H100 de 80 GB (320 GB) no permite alojar los pesos. GPU de 40-48 GB en número elevado requerirían sharding en disco y son inviables por ancho de banda.
- GPU de consumo: no cabe. Una RTX 4090 (24 GB) o una RTX 5090 (32 GB) quedan muy lejos de los 510 GB de pesos; no es desplegable en hardware consumer ni con cuantización de este mismo checkpoint sin degradar la calidad (el autor recomienda rehacer la abliteration en la precisión objetivo en lugar de recuantizar).
- Opciones de despliegue: el motor `inference/` de referencia de DeepSeek incluido en el repo es la vía documentada y la única validada en la model card. Compatibilidad con vLLM, SGLang, TGI, llama.cpp u Ollama no está confirmada en la información disponible; llama.cpp y Ollama no son viables a esta escala.
- Latencia y throughput: no disponible. No se han publicado cifras de tokens por segundo ni de latencia por petición en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión de pesos | Licencia | Estado |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (base, deepseek-ai) | 763,2 B | 1M | FP8 e4m3 + FP4 expertos | no disponible en la información proporcionada | Referencia upstream; mantiene rechazos |
| DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8 (este repo, zugquants) | 763,2 B | 1M | FP8 e4m3 + FP4 expertos | MIT | Gate 18+, 0 descargas, 0 likes |
| DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8 (dealignai) | 763,2 B | 1M | FP8 e4m3 + FP4 expertos | MIT | Alias declarado del mismo contenido |
| DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED (dealignai) | 763,2 B | 1M | EXL3 2,9 bpw | MIT | Abliteration rehecha end-to-end en baja precisión |

No se dispone de datos de benchmarks de los modelos comparados (salvo el MMLU del base indicado arriba) ni de comparaciones con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Eliminación deliberada de rechazos: el modelo cumple peticiones que el base declinaría. Esto traslada toda la responsabilidad de uso al operador y hace imprescindible filtrado externo, registro de peticiones y revisión humana en cualquier despliegue orientado al público.
- Acceso restringido: el repositorio está gated y exige confirmar mayoría de edad (18+), declarar país y caso de uso, y aceptar responsabilidad total sobre las salidas. La concesión de acceso queda a discreción del propietario del repositorio.
- Riesgo de alucinación: es un modelo de razonamiento de gran tamaño sin resultados de benchmarks del bundle uncensored que permitan estimar su degradación respecto al base; no hay datos que cuantifiquen cuánto afecta la edición a la precisión factual.
- Calidad en contexto largo: aunque se anuncian 1M tokens, no se han publicado evaluaciones de recuperación en posiciones intermedias ni de degradación con la longitud, por lo que el rendimiento efectivo a contextos extremos es desconocido.
- Recuantización: el autor advierte que derivar cuantizaciones de bits bajos desde este FP8 acumula error y puede revertir el comportamiento de cumplimiento; no se debe asumir que un GGUF Q4 derivado se comporte igual.
- Licencia: el repo declara MIT, pero conviene verificar los términos del modelo base (deepseek-ai/DeepSeek-V4.1-Flash-1017) antes de un uso comercial, ya que la información disponible no detalla la licencia upstream.
- Trazabilidad y madurez: el repositorio tiene 0 descargas y 0 likes, fue creado y actualizado el mismo día (2026-10-24) y el contenido de la tarjeta atribuye autoría a dealignai mientras el ID pertenece a zugquants. No hay validación independiente del checkpoint.
- Idiomas: solo siete lenguas declaradas; no hay cobertura de otras lenguas ibéricas ni de variantes regionales, y el soporte real de tailandés, ruso o italiano no está medido en la información disponible.
- Hardware: FP8 e4m3 con escalas ue8m0 requiere GPUs con soporte nativo de FP8 (Hopper o posterior); no se ha documentado el comportamiento en generaciones anteriores.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/zugquants/DeepSeek-V4.1-Flash-1017-UNCENSORED-FP8
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Alias declarado del mismo contenido: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-ABLITERATED-FP8
- Variante EXL3 2,9 bpw: https://huggingface.co/dealignai/DeepSeek-V4.1-Flash-1017-EXL3-2.9bpw-UNCENSORED
- Twitter del autor de la model card: https://twitter.com/dealignai
- Twitter del proveedor de cómputo: https://twitter.com/jordanschenck
- Apoyo al desarrollo: https://ko-fi.com/dealignai
