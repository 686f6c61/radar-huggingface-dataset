# TiCo-sdm/TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT

## Resumen

TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT es un adaptador LoRA publicado por el usuario TiCo-sdm sobre el modelo multimodal Qwen3-Omni-30B-A3B-Instruct de Alibaba Qwen. Forma parte de la familia TiCo, orientada al diálogo hablado con control de duración: el modelo aprende a emitir marcadores temporales en el texto (Spoken Time Markers) que permiten regular la longitud de la respuesta sintetizada. Esta variante concreta, "statement-ending", además instruye al modelo para terminar sus respuestas con una afirmación en lugar de una pregunta.

Se trata de la primera etapa (Stage 1) de un entrenamiento en dos fases; el autor la describe como punto de partida del modelo `TiCo-Qwen3-Omni-30B-Statement-Ending`. Solo se entrena la parte generadora de texto mediante LoRA de rango 8, mientras que el codificador de audio y el generador de voz permanecen congelados. El repositorio ocupa 0,9 GB y contiene únicamente el adaptador, su configuración, los argumentos de entrenamiento y el estado del trainer.

Su relevancia es acotada pero específica: cubre un nicho poco explorado como es el control fino de la duración en asistentes de voz conversacionales, y lo hace sobre un backbone MoE de 30B con capacidades omni (texto, audio, visión). No obstante, la ausencia de licencia declarada, de idiomas soportados y de benchmarks publicados limita seriamente su uso en producción sin una evaluación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer MoE multimodal (Qwen3-Omni-30B-A3B-Instruct) |
| Parámetros totales | 30B en el backbone (aproximado, según nombre del modelo base); adaptador LoRA de rango 8 |
| Parámetros activos | 3B en el backbone (MoE, según nombre del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el adaptador se distribuye en safetensors; la cuantización aplica al backbone tras el merge) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere merge con el backbone) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-Omni-30B-A3B-Instruct, un modelo multimodal con mezcla de expertos (30B totales, 3B activos) que integra codificador de audio, generador de voz y generación de texto. El entrenamiento de TiCo solo afecta a la parte generadora de texto: se inserta un LoRA de rango 8 y se congelan tanto el codificador de audio como el generador de voz. Esto implica que las capacidades acústicas y de síntesis provienen íntegramente del backbone original, y el adaptador únicamente modifica el comportamiento textual.

La fase Stage 1 consiste en un ajuste supervisado (SFT) sobre las propias respuestas habladas del modelo, regeneradas con un system prompt que exige terminar con una afirmación y eliminando las respuestas truncadas. Se ejecutaron 5 épocas y 625 pasos. No se especifican el volumen de datos, la composición del dataset, ni si hubo etapas posteriores de RLHF o DPO en esta fase. La innovación principal es la emisión de Spoken Time Markers, marcadores temporales en el texto que permiten controlar la duración del habla generada; para que no se pronuncien en voz alta es necesario aplicar un parche de eliminación de marcadores del repositorio de código de TiCo.

## Capacidades

- Generación de texto conversacional con estilo hablado (lenguaje plano, sin viñetas ni acotaciones escénicas).
- Emisión de Spoken Time Markers para el control de duración de la respuesta hablada.
- Terminación de respuestas con una afirmación, sin preguntas de seguimiento ni ofertas de ayuda adicional.
- Diálogo hablado multimodal heredado del backbone Qwen3-Omni (audio de entrada y salida de voz), aunque el adaptador no modifica esos módulos.
- Capacidades multimodales del backbone (texto, audio, visión) potencialmente disponibles, si bien no se documenta su preservación tras el merge.
- Soporte de tool calling, agentes o razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistentes de voz con tiempo de respuesta acotado: el modelo puede generar respuestas cuya duración hablada se ajusta mediante los Spoken Time Markers, útil en sistemas de IVR o atención telefónica donde el tiempo de emisión es un recurso limitado.
- Diálogos conversacionales de cierre controlado: gracias al entrenamiento statement-ending, encaja en flujos donde el turno del asistente debe concluir sin invitar a una réplica, como notificaciones habladas o confirmaciones de acción.
- Investigación en control de prosodia y duración: sirve como punto de partida reproducible (Stage 1) para estudiar cómo el ajuste de texto influye en la síntesis de voz sobre un backbone omni.
- Prototipado de interfaces de voz con Qwen3-Omni: al requerir el merge con el backbone y vllm-omni, es adecuado para experimentar con pipelines de voz sobre un MoE de 30B.
- Evaluación comparativa de variantes TiCo: al ser la etapa inicial de la variante statement-ending, permite analizar la contribución de la fase SFT frente a etapas posteriores.
- Generación de respuestas habladas breves y afirmativas para entornos de baja latencia: la restricción de estilo (sin preguntas ni ofertas) reduce la longitud media de las respuestas, lo que puede simplificar el postprocesado en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; como referencia, un backbone MoE de 30B en precisión completa requiere del orden de 60 GB o más, y en cuantizaciones de 4 bits puede situarse en torno a 15-20 GB, aunque estos valores no están confirmados para este modelo.
- GPU recomendadas: no disponible; el despliegue indicado por el autor es vllm-omni, lo que sugiere GPUs de datacenter (A100, H100) por el tamaño del backbone.
- ¿Cabe en GPU de consumo? No confirmado; dependería de la cuantización del backbone tras el merge, dato no documentado.
- Opciones de despliegue: merge del adaptador con `swift export --merge_lora true` y generación con vllm-omni; requiere el parche `patches/install_patch.sh` del repositorio de código TiCo para eliminar los marcadores temporales del habla.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT | 30B (3B activos) + LoRA r8 | no disponible | no disponible | Hugging Face (adaptador) |
| Qwen3-Omni-30B-A3B-Instruct (backbone) | 30B (3B activos) | no disponible | no disponible | Hugging Face |
| Otras variantes TiCo sobre Qwen3-Omni | 30B (3B activos) + LoRA | no disponible | no disponible | Hugging Face (según autor) |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Licencia no declarada: no puede asumirse uso comercial sin consultar al autor y verificar la licencia del backbone Qwen3-Omni-30B-A3B-Instruct.
- Idiomas soportados no documentados; el system prompt de entrenamiento está en inglés, lo que puede sesgar el estilo de respuesta.
- Riesgo de que el modelo pronuncie en voz alta los Spoken Time Markers si no se aplica el parche de eliminación del repositorio TiCo.
- El adaptador solo modifica la generación de texto; el comportamiento acústico y de síntesis depende enteramente del backbone y no ha sido ajustado.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad.
- Es un artefacto de investigación (Stage 1), sin benchmarks ni validación externa; no recomendado para producción sin evaluación propia.
- Requiere un proceso de merge y un stack específico (swift, vllm-omni, parche de TiCo), lo que añade complejidad operativa frente a un modelo listo para usar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/TiCo-sdm/TiCo-Qwen3-Omni-30B-Statement-Ending-Stage1-SFT
- Modelo base: https://huggingface.co/Qwen/Qwen3-Omni-30B-A3B-Instruct
- Repositorio de código TiCo (referenciado en la model card, ruta `patches/install_patch.sh`): no disponible como URL directa en la información proporcionada
- Resultados de búsqueda web: no relevantes (corresponden a entidades homónimas ajenas al modelo: redes de transporte, agencias de diseño y organismos de Ontario)
