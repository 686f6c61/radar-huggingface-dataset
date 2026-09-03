# wjbmattingly/comma-qwen-3.5-2b

## Resumen

`comma-qwen-3.5-2b` es un adaptador LoRA desarrollado por wjbmattingly que afina el modelo vision-language `Qwen/Qwen3.5-2B` para la transcripción línea a línea de páginas de manuscritos medievales en latín, siguiendo el estándar graphemic CATMuS. El modelo recibe una imagen de página y devuelve una línea de texto por cada línea física escrita, en orden de lectura, sin normalización editorial ni traducción. Está pensado para paleógrafos, historiadores y proyectos de digitalización de patrimonio escrito.

El adaptador (r=32, alpha=64, scope `all`) modifica tanto el decodificador de lenguaje como la torre de visión del modelo base, lo que supone la mayor ganancia medida en el proyecto, con 46,7 millones de parámetros entrenables sobre un total de 2,26 mil millones (2,1 %). Se entrenó con 9 905 páginas del dataset `comma-project/deep-jsonl` durante 3 épocas en una NVIDIA RTX PRO 6000 Blackwell, con 2048 tokens visuales por página y una longitud máxima de secuencia de 8192 tokens.

La relevancia actual del modelo radica en que aborda un problema muy específico —la transcripción automática de escritura manuscrita medieval— con una solución basada en un modelo fundacional moderno, logrando una reducción drástica de la tasa de error de caracteres (CER) frente al modelo base sin ajustar: de 0,8847 a 0,1409 en CER (NFD) sobre 243 páginas de evaluación con manos distintas no vistas en entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-language (Qwen3.5-2B) con adaptador LoRA |
| Parametros totales | 2 260 003 648 (modelo base) + 46 761 984 entrenables del adaptador (2,1 %) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (máximo usado en entrenamiento); el modelo base soporta 262 144 tokens nativos |
| Tipos de cuantizacion | No disponible; el modelo base admite cuantización estándar (GGUF, AWQ, etc.) |
| Idiomas soportados | Latín medieval (la) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo base es `Qwen/Qwen3.5-2B`, un transformer denso de 2 mil millones de parámetros con capacidades unificadas de visión y lenguaje, entrenado con fusión temprana sobre tokens multimodales. Sobre este, el adaptador LoRA (rango 32, alpha 64, dropout 0,05) se aplica a 285 módulos que abarcan tanto el decodificador de lenguaje como la torre de visión, una decisión de diseño que el autor identifica como la mayor mejora individual del proyecto, con un impacto superior a 13 veces el número de parámetros.

El entrenamiento se realizó con 9 905 páginas del dataset `comma-project/deep-jsonl`, en precisión bf16, con batch efectivo de 8, learning rate de 0,0001 y 3 épocas, completando en 22,2 horas en una NVIDIA RTX PRO 6000 Blackwell Server Edition. Cada muestra se midió antes de incluirla: las que superaban la longitud máxima de 8192 tokens se descartaban, evitando así que un prompt truncado eliminara las reglas CATMuS que el modelo debe obedecer, o que una transcripción truncada enseñara al modelo a detenerse a mitad de página. El prompt de inferencia es un conjunto de reglas CATMuS de 11,6k caracteres que el modelo aprendió a interpretar como parte de la entrada.

## Capacidades

- Transcripción línea a línea de páginas de manuscritos medievales en latín, en orden de lectura física.
- Cumplimiento del estándar CATMuS graphemic: reproduce la secuencia de letras y signos tal como están escritos, reducidos al alfabeto latino moderno, sin normalización editorial.
- Reconocimiento de escritura manuscrita (HTR) sobre imágenes de página completas, con un presupuesto de 2048 tokens visuales por página (2 097 152 píxeles tras smart-resize).
- Generación de texto condicionada por imagen, con soporte de chat multimodal a través de la plantilla de Qwen3.5.
- Capacidad de fusionar el adaptador con el modelo base (`merge_and_unload`), lo que acelera la inferencia aproximadamente un 27 % frente a servirlo sin fusionar.
- No incluye modo de pensamiento explícito: el autor advierte que debe desactivarse (`enable_thinking=False`) para evitar que el modelo genere prosa en lugar de transcripciones.

## Casos de uso

- Digitalización de archivos históricos: instituciones con colecciones de manuscritos medievales pueden procesar lotes de imágenes de páginas y obtener transcripciones preliminares en formato CATMuS, listas para revisión humana.
- Investigación paleográfica: los estudiosos pueden comparar la transcripción automática con la lectura manual para identificar variantes gráficas y estudiar la evolución de la escritura, gracias a la fidelidad graphemic del estándar.
- Creación de ediciones críticas: el modelo produce una transcripción base sin normalizar, que sirve como punto de partida para que los editores apliquen sus propias convenciones de normalización y anotación.
- Indexación y búsqueda de manuscritos: las transcripciones generadas pueden alimentar bases de datos textuales que permitan búsquedas por contenido en colecciones que antes solo tenían metadatos descriptivos.
- Formación de modelos de procesamiento del lenguaje para latín medieval: las salidas del modelo pueden usarse como datos de entrenamiento o validación para otros sistemas de NLP especializados en latín.
- Asistencia en proyectos de transcripción colaborativa: plataformas como Transkribus o FromThePage podrían integrar este modelo como sugerencia automática para voluntarios, reduciendo el tiempo de transcripción manual.
- Verificación de transcripciones existentes: el modelo puede usarse para contrastar transcripciones previas y detectar errores o discrepancias, gracias a su bajo CER en páginas no vistas.

## Benchmarks y rendimiento

La model card publica resultados sobre 243 páginas reservadas, cada una de una mano diferente y no vistas en entrenamiento. La comparación se realiza contra el modelo base `Qwen/Qwen3.5-2B` sin ajustar, evaluado en las mismas páginas y con el mismo procedimiento (decodificación greedy, 3072 tokens máximos, 2048 tokens visuales por página, batch 4).

| Metrica | Modelo base | comma-qwen-3.5-2b |
|---|---|---|
| CER (NFD) | 0,8847 | **0,1409** |
| CER (raw code points) | 0,8764 | 0,1794 |
| WER (NFD) | 1,7516 | 0,3819 |
| Line recall (NFD) | 0,0038 | 0,1662 |
| CER macro (NFD) | 0,8457 | 0,1119 |
| Paginas degeneradas | 0,0864 | 0,0000 |
| Paginas truncadas | 0,2798 | 0,0206 |

CER y WER están micro-promediados (ediciones totales divididas por caracteres de referencia totales). El autor advierte que diferencias inferiores a ~0,02 en CER no deben considerarse concluyentes, dado que el entrenamiento en bf16 es no determinista entre nodos y la decodificación greedy amplifica diferencias mínimas de logits.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en bf16 ocupa aproximadamente 4,5 GB; con el adaptador fusionado, el conjunto cabe en GPUs con 6-8 GB de VRAM. Con cuantización a 8 bits o 4 bits, puede ejecutarse en GPUs de 4 GB o menos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, etc.) es suficiente para inferencia. El entrenamiento se realizó en una NVIDIA RTX PRO 6000 Blackwell Server Edition, pero no es necesaria para servir el modelo.
- Cabe en GPU consumer: sí, incluso en portátiles con 8 GB de VRAM.
- Opciones de despliegue: el modelo se sirve con Hugging Face Transformers y PEFT. Tras fusionar el adaptador, puede exportarse a formatos como GGUF para usarse con llama.cpp u Ollama, o servirse con vLLM o TGI para producción.
- Latencia y throughput: no se han publicado mediciones específicas. Con `merge_and_unload` se reporta una aceleración de ~27 % frente al adaptador sin fusionar. Para una página de 2048 tokens visuales y hasta 3072 tokens de salida, se espera un tiempo de generación del orden de segundos en GPU consumer.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros modelos de transcripción de manuscritos medievales (como TrOCR, Kraken o modelos HTR específicos). La única comparación controlada disponible es contra el modelo base `Qwen/Qwen3.5-2B`, que se incluye en la tabla de benchmarks. A falta de datos externos, se recomienda evaluar el modelo frente a alternativas como:

| Modelo | Tipo | Contexto | Licencia | Observaciones |
|---|---|---|---|---|
| comma-qwen-3.5-2b | LoRA sobre Qwen3.5-2B | 8192 (entrenamiento) | Apache-2.0 | Especializado en latín medieval CATMuS |
| Qwen/Qwen3.5-2B | Vision-language denso | 262 144 | Apache-2.0 | Modelo base sin ajustar; CER 0,8847 en la misma tarea |
| TrOCR | Transformer encoder-decoder para OCR | 512 | MIT | Especializado en impreso y manuscrito, pero sin estándar CATMuS ni latín medieval |

No hay datos de rendimiento comparables para TrOCR u otros modelos en el mismo corpus de evaluación, por lo que la comparación directa no es posible con la información disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para latín medieval y el estándar CATMuS; no debe usarse para otros idiomas, épocas o estándares de transcripción sin reentrenamiento.
- La salida es graphemic, no normalizada: no es una traducción ni una lectura editorial, y puede contener formas ortográficas que difieran del latín clásico.
- El autor advierte que diferencias de CER inferiores a ~0,02 no son concluyentes entre ejecuciones, debido a la no determinismo del entrenamiento en bf16 y la decodificación greedy.
- El presupuesto de tokens visuales está fijado en 2048 por página en la configuración del procesador de este repositorio; usar el procesador del modelo base (16 777 216 píxeles, 16k tokens visuales) degrada el rendimiento porque muestra la página a una resolución que el modelo nunca vio.
- Es obligatorio desactivar el modo de pensamiento (`enable_thinking=False`) en la plantilla de chat; de lo contrario, el modelo genera prosa en lugar de transcripciones.
- El modelo puede alucinar líneas de texto en páginas muy dañadas o ilegibles; la métrica de páginas degeneradas es 0 en el conjunto de evaluación, pero no hay garantía en casos extremos.
- La licencia Apache-2.0 permite uso comercial, pero el dataset de entrenamiento (`comma-project/deep-jsonl`) debe revisarse para confirmar que no impone restricciones adicionales sobre los datos derivados.

## Enlaces

- Repositorio del modelo: https://huggingface.co/wjbmattingly/comma-qwen-3.5-2b
- Demo interactiva: https://huggingface.co/spaces/wjbmattingly/comma-qwen-3.5-demo
- Dataset de entrenamiento: https://huggingface.co/datasets/comma-project/deep-jsonl
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Página del modelo base en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-2b
- Página del modelo base en Ollama: https://ollama.com/library/qwen3.5:2b
