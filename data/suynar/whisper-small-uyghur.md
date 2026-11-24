# suynar/whisper-small-uyghur

## Resumen

Whisper Small Uyghur es un adaptador LoRA (Low-Rank Adaptation) sobre el modelo base `openai/whisper-small` de OpenAI, especializado en reconocimiento automático de habla (ASR) para el idioma uigur. Lo desarrolla el usuario `suynar` y se distribuye bajo licencia Apache 2.0. El adaptador pesa aproximadamente 13,5 MB, lo que lo convierte en una pieza ligera que se combina con los pesos del modelo base para producir transcripciones en uigur.

El modelo resuelve un problema concreto: el uigur es un idioma de bajos recursos para el que los modelos ASR multilingües genéricos ofrecen un rendimiento limitado. Mediante un ajuste fino con LoRA sobre Whisper Small, el autor consigue adaptar un modelo ya entrenado para transcripción multilingüe a las particularidades fonéticas y ortográficas del uigur sin necesidad de reentrenar el modelo completo. El entrenamiento se realizó en una única GPU NVIDIA RTX 3060 durante aproximadamente 9 horas.

La relevancia del proyecto es doble: por un lado, demuestra que es posible adaptar modelos ASR de tamano medio a idiomas minoritarios con recursos de hardware consumer; por otro, el autor publica el adaptador, el modelo fusionado completo y conversiones a GGML para `whisper.cpp`, lo que facilita su uso en aplicaciones de escritorio sin entorno Python. La arquitectura subyacente es la de Whisper Small (transformer encoder-decoder), con aproximadamente 244 millones de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Small) con adaptadores LoRA |
| Parametros totales | ~244 M (modelo base Whisper Small); adaptador LoRA ~13,5 MB |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper Small trabaja con ventanas de audio de 30 s) |
| Tipos de cuantizacion | GGML (conversiones para whisper.cpp); cuantizacion adicional no disponible |
| Idiomas soportados | uigur (ug) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGML (modelo fusionado convertido) |

## Arquitectura y entrenamiento

El modelo se basa en `openai/whisper-small`, un transformer encoder-decoder con aproximadamente 244 millones de parámetros disenado para ASR y traducción de voz. Sobre esta base se aplicó un ajuste fino mediante LoRA (PEFT), que introduce matrices de baja dimensionalidad en las capas del modelo y permite adaptarlo con un coste computacional reducido. El adaptador resultante ocupa unos 13,5 MB y se carga junto con los pesos del modelo base.

El entrenamiento se realizó sobre el conjunto de datos Mozilla Common Voice en su versión uigur (Common Voice 11.0 según las etiquetas del repositorio), con el optimizador AdamW y una duración aproximada de 9 horas en una única NVIDIA RTX 3060. No se especifican en la información disponible el número de tokens de audio, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El autor proporciona además un modelo fusionado completo y conversiones a GGML para su uso con `whisper.cpp`.

## Capacidades

- Reconocimiento automático de habla (ASR) en uigur: transcripción de audio a texto en escritura uigur.
- Adaptación ligera mediante LoRA: el adaptador se carga sobre el modelo base sin necesidad de duplicar los pesos completos.
- Modelo fusionado disponible: permite usar el modelo como un Whisper Small estándar con `transformers` o `pipeline`.
- Conversión a GGML: compatible con `whisper.cpp` y herramientas de escritorio como WhisperDesktop y Vibe.
- No se documentan capacidades de traducción, tool calling, agentes, visión ni audio más allá de la transcripción ASR.
- Capacidad multilingüe limitada al uigur; el autor recomienda seleccionar "Turkish" o "Uzbek" como idioma en herramientas GGML por compatibilidad de tokens.

## Casos de uso

- Transcripción de audio en uigur para preservación lingüística: el modelo permite digitalizar grabaciones orales en uigur y convertirlas en texto, un caso alineado con el propósito declarado por el autor (investigación, educación y preservación del idioma).
- Subtitulado automático de contenido audiovisual en uigur: se puede integrar en un pipeline de `transformers` para generar transcripciones de vídeos o podcasts y exportarlas como subtítulos.
- Aplicaciones de escritorio sin Python: gracias a las conversiones GGML y a herramientas como WhisperDesktop o Vibe, el modelo se puede usar en Windows o multiplataforma sin configurar un entorno de desarrollo.
- Investigación en ASR de bajos recursos: sirve como punto de partida para experimentos de ajuste fino con LoRA en idiomas minoritarios, dado su bajo coste de entrenamiento (9 horas en una RTX 3060).
- Asistentes de voz locales para uigur: el adaptador puede integrarse en aplicaciones de dictado o asistentes de voz que funcionen en local, sin depender de servicios en la nube.
- Evaluación comparativa de adaptadores LoRA en ASR: el modelo permite estudiar el impacto de LoRA frente a ajuste completo en un idioma con pocos datos, usando Common Voice como referencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la métrica WER (word error rate) en las etiquetas, pero no se proporciona ningún valor numérico concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base Whisper Small en fp16 requiere aproximadamente 1-2 GB de VRAM; el adaptador LoRA anade un consumo marginal (~13,5 MB).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor entrenó en una NVIDIA RTX 3060, que también sirve para inferencia.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, GTX 1660 o superiores; también puede ejecutarse en CPU con `whisper.cpp` y GGML.
- Opciones de despliegue: `transformers` + `peft`, `pipeline` de Hugging Face con el modelo fusionado, `whisper.cpp` con los ficheros GGML, WhisperDesktop (Windows) y Vibe (multiplataforma).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| suynar/whisper-small-uyghur | ~244 M (base) + LoRA | no disponible (ventanas de 30 s) | uigur | Apache 2.0 | safetensors, GGML |
| openai/whisper-small | ~244 M | no disponible (ventanas de 30 s) | multilingüe | Apache 2.0 | safetensors, GGML |
| openai/whisper-base | ~74 M | no disponible (ventanas de 30 s) | multilingüe | Apache 2.0 | safetensors, GGML |
| openai/whisper-medium | ~769 M | no disponible (ventanas de 30 s) | multilingüe | Apache 2.0 | safetensors, GGML |

La comparativa se limita a la familia Whisper, ya que no se dispone de información sobre otros adaptadores ASR específicos para uigur en la documentación proporcionada. El modelo de `suynar` se diferencia por su especialización en uigur y por el bajo coste de su adaptador LoRA, aunque no se han publicado métricas que permitan comparar su WER con el de los modelos base.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre Common Voice, puede heredar sesgos de representación del corpus (acentos, géneros, edades).
- Riesgo de alucinación: como todo modelo ASR, puede generar transcripciones incorrectas o inventar texto en segmentos de audio ruidosos o silenciosos.
- Limitaciones de contexto o idioma: el modelo está especializado únicamente en uigur; no se garantiza un buen rendimiento en otros idiomas. En herramientas GGML el autor recomienda seleccionar "Turkish" o "Uzbek" por compatibilidad de tokens, lo que puede introducir errores.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el autor declara explícitamente que el modelo se publica solo para investigación, educación y preservación del idioma, y se opone a su uso para vigilancia masiva, violaciones de derechos humanos o discriminación. Estas restricciones éticas no forman parte de la licencia legal, pero deben tenerse en cuenta.
- Caveats para producción: no se han publicado métricas de WER ni evaluaciones formales; el adaptador no incluye el procesador, que debe cargarse desde el modelo base; el repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria.
- El código de ejemplo de la model card usa `peft_model_id = "xiwol/whisper-small-uyghur"`, distinto del ID del repositorio (`suynar/whisper-small-uyghur`), lo que puede provocar errores si se copia literalmente.

## Enlaces

- Hugging Face: https://huggingface.co/suynar/whisper-small-uyghur
- Modelo base: https://huggingface.co/openai/whisper-small
- Dataset: https://community.mozilladatacollective.com/
- WhisperDesktop: https://github.com/gtppoplp/WhisperDesktop
- Vibe: https://github.com/thewh1teagle/vibe
