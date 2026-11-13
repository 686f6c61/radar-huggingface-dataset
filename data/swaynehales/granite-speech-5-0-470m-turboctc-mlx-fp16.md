# swaynehales/granite-speech-5.0-470m-turboctc-mlx-fp16

## Resumen

Granite Speech 5.0 470M TurboCTC es un modelo de reconocimiento automático del habla (ASR) desarrollado por IBM dentro de la familia Granite. Esta ficha concreta documenta la conversión no oficial a formato MLX en precisión fp16 publicada por el usuario swaynehales, pensada para ejecutar inferencia de ASR sobre Apple Silicon (macOS) mediante la librería Granite-MLX. El modelo resuelve el problema de transcripción de audio a texto multilingüe con puntuación y capitalización nativas, en un tamaño compacto de 472.993.792 parámetros.

La arquitectura original es un encoder basado en 16 bloques conformer entrenados con CTC (Connectionist Temporal Classification), con una cabeza BPE multilingüe de 16.384 tokens. Aplica un subsampling temporal de 8x (de 100 Hz a 12,5 Hz), atención por bloques sobre 128 frames y CTC auto-condicionado desde la capa intermedia. El modelo base cubre siete idiomas (inglés, francés, alemán, español, portugués, italiano y japonés) con puntuación y mayúsculas nativas.

La relevancia de esta publicación es práctica: permite desplegar ASR multilingüe de IBM en hardware Apple sin GPU dedicada, a través de una conversión que preserva los pesos (hash-verificados), ajusta el layout de tensores al formato que lee Granite-MLX y mantiene la licencia Apache 2.0 del original. No es un modelo nuevo: es un artefacto de distribución derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer con CTC (16 bloques conformer, cabeza BPE multilingüe de 16.384 tokens) |
| Parametros totales | 472.993.792 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el modelo procesa audio de longitud variable; subsampling 8x y atención por bloques de 128 frames) |
| Tipos de cuantizacion | fp16 (esta conversión); el modelo base se distribuye en bf16/F32 |
| Idiomas soportados | Multilingüe: inglés, francés, alemán, español, portugués, italiano y japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`model.safetensors`), layout de Granite-MLX |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de encoder conformer con 16 bloques y decodificación CTC, sin decodificador autorregresivo. Incorpora un subsampling temporal de factor 8, que reduce la secuencia de entrada de 100 Hz a 12,5 Hz, atención por bloques sobre ventanas de 128 frames y CTC auto-condicionado (self-conditioned CTC) desde la capa intermedia, una técnica que regulariza el entrenamiento intermedio y mejora la convergencia. La cabeza de salida es un vocabulario BPE multilingüe de 16.384 tokens que cubre los siete idiomas soportados.

La información disponible no detalla el volumen de datos de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (poco habituales en ASR basado en CTC). La conversión documentada aquí no modifica el entrenamiento: parte de la revisión `91dcb0605daf65f88dbb04fef015c423241d941d` del modelo de IBM (release multilingüe del 21 de octubre de 2026), conserva los 534 tensores originales, elimina 16 contadores `num_batches_tracked` de BatchNorm (solo relevantes en entrenamiento) y transpone los 16 pesos de Conv1d depthwise de `[O,I,K]` a `[O,K,I]` para adaptarlos a MLX. Los bytes de los tensores se mantienen intactos y verificados por hash.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio mono a 16 kHz.
- Transcripción multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas en la salida, sin post-procesado externo.
- Manejo de audio de longitud variable sin padding ni forma fija (la implementación Granite-MLX calcula las features log-mel y delta en Swift).
- Decodificación CTC, adecuada para transcripción en streaming o por lotes según la implementación del decodificador.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico-a-texto.
- No dispone de modo thinking, visión ni audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz en Mac: el modelo procesa audio de longitud variable a 16 kHz y devuelve texto con puntuación, lo que permite integrarlo en aplicaciones nativas de macOS sin GPU dedicada.
- Subtitulado multilingüe de contenido audiovisual: al cubrir siete idiomas con puntuación nativa, se puede usar para generar subtítulos en francés, alemán o japonés con tipografía correcta (la conversión corrige específicamente el borrado de espacio antes de `? ! : ;` que corrompía la tipografía francesa).
- Dictado por voz en herramientas de productividad: con 473M parámetros y fp16, la latencia es baja en Apple Silicon, lo que lo hace viable para dictado en tiempo real dentro de editores de texto o IDE.
- Preprocesado de datasets de audio para investigación: transcripción por lotes de corpus multilingües en estaciones de trabajo Mac, aprovechando la licencia Apache 2.0 para uso académico y comercial.
- Atención al cliente basada en voz: transcripción de llamadas en varios idiomas como primer paso de un pipeline ASR + LLM, donde el modelo aporta la capa acústica y un modelo de lenguaje posterior gestiona la respuesta.
- Accesibilidad: generación de transcripciones en vivo para personas con discapacidad auditiva en aplicaciones de escritorio, con despliegue local que evita enviar audio a servicios en la nube.
- Indexación y búsqueda de archivos de audio: transcripción masiva de grabaciones para construir índices de texto consultables, con la ventaja de ejecutarse íntegramente en local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de esta conversión remite a la model card de IBM en la revisión fijada para datos de entrenamiento, uso previsto, benchmarks e informe técnico, pero no reproduce cifras concretas.

## Requisitos de hardware

- VRAM estimada: en fp16, los 472.993.792 parámetros ocupan aproximadamente 0,95 GB (el `model.safetensors` pesa 946.047.904 bytes); el repo completo ocupa 0,9 GB.
- El modelo está diseñado para Apple Silicon (MLX); no se documentan requisitos para GPU NVIDIA o AMD en esta conversión.
- Cabe holgadamente en cualquier Mac con Apple Silicon (M1 o superior); el autor reporta la conversión ejecutada en un Apple M2 Max con macOS 27.0.1.
- Despliegue: exclusivamente mediante Granite-MLX (`GraniteModelLoader`). No es compatible con los loaders de `mlx-audio` ni `mlx-lm` por diferencias de layout.
- Latencia y throughput: no disponibles en la información proporcionada.
- Versiones de referencia usadas en la conversión: Python 3.12, mlx 0.31.2, torch 2.13.0, transformers 5.16.1.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Formato / plataforma |
|---|---|---|---|---|
| Granite Speech 5.0 470M TurboCTC MLX fp16 (esta ficha) | 472.993.792 | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | MLX safetensors, Apple Silicon |
| ibm-granite/granite-speech-5.0-470m-turboctc (original) | 470M | 7 (en, fr, de, es, pt, it, ja) | Apache 2.0 | bf16/F32, transformers |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470M (no confirmado en la información disponible) | Inglés | CC-BY-NC-SA-4.0 | No disponible |

La comparativa se limita a las variantes de la propia familia Granite Speech 5.0 porque la información proporcionada no incluye datos de otros modelos ASR comparables (por ejemplo, Whisper). No se dispone de cifras de rendimiento para establecer comparaciones cuantitativas.

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado esta publicación; los créditos del modelo pertenecen a IBM Granite.
- Solo funciona con Granite-MLX; no es compatible con `mlx-audio` ni `mlx-lm`.
- Precisión reducida a fp16 frente al bf16/F32 original: puede introducir diferencias numéricas menores en la transcripción, aunque los bytes de los tensores se conservan y verifican por hash.
- El modelo base es CTC puro: no genera texto libre ni razona; no sirve para tareas de lenguaje general.
- No se documentan sesgos concretos ni tasas de alucinación en la información disponible; como todo ASR, puede producir transcripciones erróneas en audio con ruido, acentos no representados o vocabulario técnico.
- La cobertura lingüística se limita a los siete idiomas declarados; otros idiomas no están soportados.
- No confundir con `ibm-granite/granite-speech-5.0-470m-turboctc-nc`, que es solo inglés y tiene licencia CC-BY-NC-SA-4.0 (no comercial); esta conversión deriva del modelo Apache 2.0.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el aviso de licencia y las notas de cambios en redistribuciones (sección 4).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-mlx-fp16
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card de IBM en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Librería Granite-MLX: https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
