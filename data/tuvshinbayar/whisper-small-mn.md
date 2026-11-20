# Tuvshinbayar/whisper-small-mn

## Resumen

Whisper-small-mn es un modelo de reconocimiento automático del habla (ASR) publicado en Hugging Face por el usuario Tuvshinbayar. Por su identificador y por el sufijo `-mn`, se trata presumiblemente de un ajuste fino (*fine-tuning*) del modelo Whisper Small de OpenAI para el idioma mongol, si bien la model card publicada no incluye ninguna descripción, datos de entrenamiento ni resultados que lo confirmen de forma explícita.

El modelo se apoya en la arquitectura Whisper, un transformer encoder-decoder entrenado originalmente por OpenAI para transcripción y traducción de voz a texto. La variante *small* cuenta con 244 millones de parámetros y una ventana de audio de 30 segundos por segmento, lo que la sitúa en el rango de modelos ligeros aptos para inferencia en GPU de consumo.

La relevancia de este modelo radica en su posible utilidad para cubrir el mongol, un idioma con escasa representación en los sistemas ASR comerciales. No obstante, la información pública disponible es mínima: no hay métricas, no se documenta el conjunto de datos de ajuste y el repositorio no registra descargas ni interacciones, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper (transformer encoder-decoder para ASR), variante small (presunta, no confirmada en la model card) |
| Parametros totales | 244 millones (valor de referencia de Whisper Small; no confirmado en la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (valor de referencia de Whisper; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | presumiblemente mongol (`-mn`), no confirmado en la model card |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura ni el proceso de entrenamiento. Por el identificador del repositorio, el modelo corresponde a un ajuste fino de Whisper Small, un transformer encoder-decoder con 244 millones de parámetros que procesa espectrogramas Mel de 80 canales y genera tokens de texto de forma autorregresiva. Whisper Small fue entrenado originalmente por OpenAI con 680 000 horas de audio débilmente supervisado y multilingüe.

No se dispone de información sobre el corpus utilizado para el ajuste fino, el número de horas de audio, la composición del dataset, la presencia de técnicas de aumento de datos ni el uso de RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Transcripción de voz a texto, presumiblemente en mongol, aunque la model card no lo confirma.
- Posible capacidad de traducción voz a texto heredada del modelo base Whisper, no verificada para este ajuste.
- Detección de actividad de voz y segmentación temporal, como capacidades propias de la arquitectura Whisper.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte para agentes ni razonamiento multi-paso.
- No se documenta *thinking mode*, visión ni audio más allá del ASR estándar.
- Capacidades multilingües: no disponibles en la model card.

## Casos de uso

- Transcripción de reuniones en mongol: el modelo podría convertir grabaciones de audio de hasta 30 segundos por segmento en texto, útil para equipos que trabajan en este idioma y necesitan actas automatizadas.
- Subtitulado de vídeo: integrado en un pipeline de segmentación de audio, permitiría generar subtítulos en mongol para contenido audiovisual, aprovechando la ventana de 30 segundos de Whisper.
- Archivado de entrevistas orales: digitalización de fondos de historia oral o entrevistas periodísticas en mongol, con revisión humana posterior dada la falta de métricas publicadas.
- Asistentes de voz para atención al cliente: transcripción de consultas telefónicas en mongol como primer paso de un sistema de enrutamiento, siempre con validación previa del rendimiento real.
- Investigación lingüística: generación de corpus transcritos para estudios de fonética o sociolingüística del mongol, con anotación manual de control.
- Prototipado académico: base para experimentos de ASR de bajo recurso, dado su tamaño reducido y licencia MIT, que permiten ejecución en GPU de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos de un modelo de 244 millones de parámetros, más memoria para activaciones y buffers de audio.
- VRAM estimada en fp16: en torno a 0,5 GB para los pesos, con margen adicional para el procesamiento de espectrogramas.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; una RTX 3060, RTX 4090, A100 o H100 son suficientes y sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en modelos como GTX 1660, RTX 3050, RTX 4060 y superiores.
- Opciones de despliegue: la librería `transformers` de Hugging Face es la vía natural; también es compatible con servidores de inferencia como vLLM (con soporte ASR), Faster-Whisper y whisper.cpp si los pesos se convierten a los formatos correspondientes.
- Latencia y throughput estimados: no disponibles; para un modelo de este tamaño en GPU moderna se espera un throughput en tiempo real o superior, pero no hay datos publicados para este ajuste concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tuvshinbayar/whisper-small-mn | 244 M (presunto) | 30 s por segmento (presunto) | Mongol (presunto) | MIT | Hugging Face, sin descargas registradas |
| openai/whisper-small | 244 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | Hugging Face, ampliamente utilizado |
| openai/whisper-medium | 769 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | Hugging Face, ampliamente utilizado |
| openai/whisper-large-v3 | 1 550 M | 30 s por segmento | Multilingüe (99 idiomas) | MIT | Hugging Face, referencia actual en ASR |

La comparativa se limita a la familia Whisper porque no se dispone de información sobre otros ajustes específicos para mongol en la documentación proporcionada.

## Limitaciones y advertencias

- La model card no contiene descripción, métricas ni detalles de entrenamiento; no es posible verificar la calidad del ajuste ni su comportamiento real en mongol.
- El repositorio no registra descargas ni interacciones, lo que impide inferir validación por parte de la comunidad.
- Riesgo de alucinación y de transcripciones incorrectas inherente a los modelos Whisper, especialmente en idiomas de bajos recursos y con audio ruidoso.
- Posibles sesgos derivados del corpus de ajuste, que no se documenta; podría haber sesgos de dominio (vocabulario, acentos o registros concretos).
- Limitación de contexto: 30 segundos por segmento, lo que obliga a segmentar audios largos y puede producir errores en las fronteras entre segmentos.
- La licencia MIT permite uso comercial, pero al tratarse de un ajuste de Whisper conviene revisar también las condiciones del modelo base de OpenAI.
- No se recomienda su uso en producción sin una evaluación previa con datos propios y una comparación frente a Whisper Small sin ajustar o frente a modelos multilingües más grandes.

## Enlaces

- [Hugging Face: Tuvshinbayar/whisper-small-mn](https://huggingface.co/Tuvshinbayar/whisper-small-mn)
- [Modelo base de referencia: openai/whisper-small](https://huggingface.co/openai/whisper-small)
- [Repositorio oficial de Whisper (OpenAI)](https://github.com/openai/whisper)
- [Paper de Whisper: Robust Speech Recognition via Large-Scale Weak Supervision](https://arxiv.org/abs/2212.04356)
