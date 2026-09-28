# winterthurquants/Inkling-Small-NVFP4

## Resumen

Inkling-Small-NVFP4 (repositorio `winterthurquants/Inkling-Small-NVFP4`) es una cuantización en formato NVFP4 del modelo multimodal `thinkingmachines/Inkling-Small`, desarrollado por Thinking Machines Lab. Se trata de un transformer autoregresivo decoder-only de 42 capas con columna vertebral de mezcla de expertos (MoE) dispersa: cada token se enruta a 6 de 256 expertos más 2 expertos compartidos activos siempre. Acepta entradas de texto, imagen y audio, y genera únicamente texto. La model card del modelo base declara 276.000 millones de parámetros totales con 12.000 millones activos por token.

La relevancia de este repositorio concreto es acotada: no es una publicación oficial, sino una conversión de precisión reducida subida por un tercero (`winterthurquants`), con 0 descargas y 0 likes en el momento de la consulta, creada y actualizada el 27 de septiembre de 2026. Existen al menos otras dos réplicas con el mismo nombre por parte de otros usuarios (`baerquants`, `usterquant`) y una versión oficial (`thinkingmachines/Inkling-Small-NVFP4`), lo que genera ambigüedad sobre cuál conviene desplegar en producción.

El interés técnico del modelo base sí es sustancial: es nativamente multimodal (codificador jerárquico de parches para imagen y codificación discreta de tokens para audio), con atención híbrida de capas locales y globales, y está pensado para sistemas agénticos, asistentes de código y RAG. Esta ficha evalúa tanto el modelo subyacente como los riesgos específicos de la copia cuantizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de 42 capas con MoE dispersa (6 de 256 expertos por token + 2 expertos compartidos) y atención híbrida local/global; multimodal nativo |
| Parametros totales | 156.032.140.138 (~156 B) según inspección de safetensors de este repositorio; la model card del modelo base declara 276 B totales |
| Parametros activos | 12 B por token (dato de la model card del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits con escalas FP8 y escala por bloque en FP32); el modelo base se distribuye en BF16. La etiqueta `8-bit` del repositorio no coincide con NVFP4 |
| Idiomas soportados | Inglés, con capacidades multilingües generales en otros idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer autoregresivo decoder-only de 42 capas con backbone MoE disperso. El enrutado envía cada token a 6 de 256 expertos, más 2 expertos compartidos que se activan en todos los tokens. La atención combina capas locales y globales, un patrón habitual para reducir el coste del contexto largo manteniendo capacidad de recuperación global. El modelo es multimodal de forma nativa: las imágenes se codifican mediante un codificador jerárquico de parches y el audio mediante codificación discreta de tokens; todas las modalidades se proyectan a un espacio oculto compartido y se procesan conjuntamente por el decoder. Las entradas de audio deben ser WAV a 16 kHz y, preferiblemente, de menos de 2 minutos; las imágenes se benefician de dimensiones por lado entre 40 px y 4096 px.

En cuanto al entrenamiento, la información disponible es genérica: datos de texto, imagen, audio y vídeo procedentes de fuentes públicas, de terceros y de generación o aumento sintético, con procesos de limpieza, deduplicación y filtrado. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron etapas de RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones de inferencia como decodificación especulativa en la información proporcionada. Todo ello debe considerarse "no disponible".

## Capacidades

- Generación de texto a partir de entradas de texto, imagen y audio (pipeline `image-text-to-text` y `audio-text-to-text`).
- Razonamiento e instrucciones generales: la model card lo describe como apto para uso conversacional general y seguimiento de instrucciones.
- Generación de código en múltiples lenguajes de programación.
- Soporte declarado para sistemas agénticos y de uso de herramientas (tool use / function calling), aunque la información disponible no detalla el esquema de llamadas ni el formato esperado.
- Capacidades multilingües generales, con inglés como idioma principal.
- Comprensión de imágenes con codificador de parches jerárquico.
- Comprensión de audio en formato WAV a 16 kHz, con duración recomendada inferior a 2 minutos.
- Salida exclusivamente textual: no genera imagen ni audio.
- Modo de pensamiento (thinking mode): no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: el modelo puede generar y revisar código en varios lenguajes y, según la model card, integrarse en asistentes de programación; su soporte de tool calling permitiría conectarlo a linters, ejecutores de tests o APIs de control de versiones dentro de un pipeline de CI/CD.
- Sistemas agénticos multi-paso: con 12 B de parámetros activos sobre 276 B totales, el coste de inferencia por token es bajo en relación con su capacidad, lo que lo hace apto para bucles de agente con muchas llamadas encadenadas.
- RAG documental multimodal: al aceptar texto e imagen, puede indexar y responder sobre documentación técnica con diagramas, capturas de pantalla o figuras, proyectando ambas modalidades al mismo espacio oculto.
- Atención al cliente automatizada: conversación multi-turno con contexto conversacional, con la salvedad de que la longitud de contexto no está documentada y debe verificarse antes de dimensionar el despliegue.
- Transcripción y análisis de audio corto: reuniones, notas de voz o clips de hasta 2 minutos en WAV 16 kHz pueden procesarse directamente sin un pipeline ASR separado.
- Evaluación de accesibilidad de interfaces: dado un conjunto de capturas de pantalla (por ejemplo, en el rango recomendado de 40 a 4096 px por lado), el modelo puede describir elementos y detectar problemas de contraste o jerarquía visual.
- Fine-tuning e investigación: al publicarse con pesos abiertos bajo Apache 2.0, permite ajuste fino supervisado sobre dominios verticales y experimentación académica sobre arquitecturas MoE multimodales.
- Extracción de información estructurada desde documentos escaneados combinados con instrucciones textuales, aprovechando la entrada de imagen y la salida de texto.

## Benchmarks y rendimiento

La model card del modelo base incluye una tabla de evaluación que compara Inkling-Small con modelos de pesos abiertos (Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash) y con modelos de pesos cerrados. Sin embargo, los valores numéricos de dicha tabla no están incluidos en la información disponible para esta ficha, por lo que no se reproducen.

No se han publicado resultados de benchmarks verificables en la información disponible para este repositorio cuantizado en concreto, y el autor de la conversión no aporta métricas propias de degradación por cuantización.

| Benchmark | Inkling-Small | Modelos comparados | Disponibilidad del dato |
|---|---|---|---|
| Tabla de evaluaciones de la model card | Publicada por el autor | Qwen3.5 397B-A17B, MiMo V2.5, Minimax M2.7, DeepSeek V4 Flash y modelos cerrados | Valores numéricos no disponibles en la información proporcionada |
| Métricas del repositorio NVFP4 | No publicadas | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 170,8 GB en safetensors, lo que implica un mínimo práctico de aproximadamente 171 GB solo para pesos, más la caché KV y los búferes de activación. Con margen operativo, conviene planificar 190-200 GB.
- Cabe en GPU de consumo: no. Ninguna GPU consumer actual dispone de VRAM suficiente para los pesos completos.
- GPU recomendadas: 3x H100 80 GB (240 GB) o 2x H200 141 GB (282 GB) para servir el modelo en su totalidad; 4x A100 80 GB (320 GB) como alternativa de generación anterior. Para cuantizaciones más agresivas no documentadas aquí se necesitarían menos dispositivos, pero no hay datos publicados.
- Aceleración del formato: NVFP4 está optimizado para GPUs NVIDIA Blackwell (serie B200/GB200 y RTX 50). En generaciones anteriores (Ampere, Ada, Hopper) la ejecución requiere kernels que descomprimen los pesos, con pérdida de eficiencia y mayor uso de memoria.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed, Unsloth (orientado a ajuste fino) y la librería `transformers` de Hugging Face. La model card enlaza recetas oficiales para vLLM, SGLang, TokenSpeed y Unsloth. También se ofrece acceso vía API a través del playground de Tinker y de proveedores externos de inferencia.
- Latencia y throughput estimados: no disponible. No se han publicado cifras de tokens por segundo, TTFT ni degradación respecto a BF16 para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| winterthurquants/Inkling-Small-NVFP4 | ~156 B en el repositorio; 276 B totales / 12 B activos según la model card del base | no disponible | Texto, imagen y audio de entrada; texto de salida | apache-2.0 | Repositorio de terceros, 0 descargas, sin validación aparente |
| thinkingmachines/Inkling-Small | 276 B totales / 12 B activos | no disponible | Texto, imagen y audio de entrada; texto de salida | apache-2.0 | Repositorio oficial en BF16 |
| thinkingmachines/Inkling-Small-NVFP4 | 276 B totales / 12 B activos | no disponible | Texto, imagen y audio de entrada; texto de salida | apache-2.0 | Repositorio oficial cuantizado en NVFP4 |
| Qwen3.5 397B-A17B | 397 B totales / 17 B activos | no disponible | no disponible | no disponible | Modelo de pesos abiertos incluido en la tabla comparativa de la model card |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Modelo de pesos abiertos incluido en la tabla comparativa de la model card |

La comparación numérica de rendimiento entre estos modelos no puede completarse porque los valores de la tabla de evaluaciones no están disponibles en la información proporcionada. Existen además otras réplicas del mismo nombre (`baerquants/Inkling-Small-NVFP4`, `usterquant/Inkling-Small-NVFP4`) sin información adicional publicada.

## Limitaciones y advertencias

- Procedencia del repositorio: se trata de una cuantización de terceros, no oficial, con 0 descargas y 0 likes, creada y actualizada en la misma fecha. No hay evidencia de validación de calidad frente al modelo base en BF16.
- Ambigüedad de artefactos: existen varias réplicas con el mismo identificador por parte de distintos autores, además de la versión oficial. Riesgo real de desplegar un artefacto incorrecto o manipulado. Se recomienda verificar checksums y usar el repositorio oficial.
- Discrepancia en el recuento de parámetros: la inspección de safetensors de este repositorio reporta ~156 B de parámetros, mientras que la model card del base declara 276 B totales y 12 B activos. La causa no está documentada; podría deberse a cómo se contabilizan los tensores empaquetados en NVFP4 o a componentes mantenidos en mayor precisión. Debe verificarse antes de dimensionar hardware.
- Inconsistencia de etiquetado: el repositorio incluye la etiqueta `8-bit` pese a que NVFP4 es un formato de 4 bits. Señal de poca trazabilidad en la publicación.
- Degradación por cuantización: no se publican métricas de pérdida de calidad respecto a BF16 en razonamiento, código o tareas multimodales. En MoE con enrutado sensible, la cuantización de las capas de expertos puede afectar de forma no uniforme.
- Alucinación: como cualquier modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en tareas de recuperación factual y en dominios especializados. No se documentan tasas de alucinación.
- Sesgos: no se publica ninguna evaluación de sesgos, toxicidad o equidad para el modelo base ni para esta conversión. Los datos de entrenamiento provienen de internet y de fuentes sintéticas, con los sesgos asociados.
- Cobertura lingüística: el modelo está optimizado para inglés; el soporte multilingüe se describe como "general", sin métricas por idioma. El rendimiento en castellano no está documentado.
- Límites de modalidad: audio únicamente en WAV a 16 kHz y preferiblemente por debajo de 2 minutos; imágenes con dimensiones recomendadas entre 40 px y 4096 px por lado. No hay soporte de vídeo como entrada ni de salida de audio o imagen.
- Licencia y política de uso: los pesos de esta conversión se distribuyen bajo Apache 2.0, que permite uso comercial. No obstante, el modelo base enlaza una Política de Uso Aceptable de Thinking Machines; conviene revisarla si el despliegue es comercial, ya que puede imponer restricciones adicionales a la cadena de derivación.
- Ausencia de datos operativos: sin longitud de contexto documentada, sin cifras de latencia ni throughput, y sin recetas de despliegue específicas para este repositorio en concreto.
- Contexto temporal: la fecha del repositorio (septiembre de 2026) y la referencia a modelos como Qwen3.5 o DeepSeek V4 Flash implican que buena parte del ecosistema comparativo puede haber cambiado; conviene revalidar la información antes de decidir.

## Enlaces

- Repositorio de esta ficha: https://huggingface.co/winterthurquants/Inkling-Small-NVFP4
- Modelo base en BF16: https://huggingface.co/thinkingmachines/Inkling-Small
- Versión oficial en NVFP4: https://huggingface.co/thinkingmachines/Inkling-Small-NVFP4
- Model card oficial de Inkling-Small: https://thinkingmachines.ai/model-card/inkling-small/
- Playground de Tinker: https://tinker.thinkingmachines.ai/playground
- Tinker Cookbook (GitHub): https://github.com/thinking-machines-lab/tinker-cookbook
- Política de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy
- Receta de despliegue en SGLang: https://docs.sglang.io/cookbook/autoregressive/ThinkingMachines/Inkling-Small
- Receta de despliegue en vLLM: https://recipes.vllm.ai/thinkingmachines/Inkling-Small
- Receta de TokenSpeed: https://lightseek.org/tokenspeed/recipes/models#Inkling
- Documentación de Unsloth para Inkling: https://unsloth.ai/docs/models/inkling
- Blog de Hugging Face sobre Inkling: https://hf.co/blog/thinkingmachines-inkling
- Ficha en LLM Explorer: https://llm-explorer.com/model/thinkingmachines%2FInkling-Small-NVFP4,1WT9XZ7GG1EOlVZVuZRQOg
- Despliegue en Inference Endpoints: https://endpoints.huggingface.co/new/thinkingmachines/Inkling-Small-NVFP4
- Réplica de terceros 1: https://huggingface.co/baerquants/Inkling-Small-NVFP4
- Réplica de terceros 2: https://huggingface.co/usterquant/Inkling-Small-NVFP4
- Paper técnico: no disponible en la información proporcionada.
