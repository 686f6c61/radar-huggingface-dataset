# TypeWhisper/SOV-Transcribe-1-4bit

## Resumen

SOV-Transcribe-1-4bit es una cuantización de 4 bits del modelo de reconocimiento automático del habla SOV-Transcribe-1 de Salesforce, publicada por TypeWhisper para su ejecución en Apple Silicon mediante MLX. El modelo combina un encoder de audio Whisper large-v3 con un decoder de mezcla de expertos Gemma 4 26B-A4B, lo que le permite transcribir grabaciones de hasta 30 minutos en siete idiomas europeos (ingles, frances, aleman, espanol, italiano, portugues y neerlandes).

La relevancia de esta ficha radica en que traslada un modelo de transcripción de gran tamano (25.892.458.526 parametros totales) al ecosistema local de Mac, con un consumo aproximado de 16 GB de memoria. El decoder se cuantiza a 4 bits con cuantización afín y tamano de grupo 64, mientras que el encoder de audio y el proyector se mantienen en BF16 y los routers de expertos en float32, una decisión que preserva la estabilidad del enrutamiento MoE.

El checkpoint se genera a partir del modelo oficial en BF16 y es byte a byte idéntico a la conversión publicada por nativ-community. Está pensado para alimentar el plugin SOV-Transcribe de TypeWhisper en equipos Mac con 32 GB de memoria o más, y su licencia Apache 2.0 facilita el uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Whisper large-v3 + decoder MoE Gemma 4 26B-A4B con proyector |
| Parametros totales | 25.892.458.526 |
| Parametros activos | No disponible (el nombre A4B sugiere 4B activos, dato no confirmado en la informacion proporcionada) |
| Longitud de contexto | No disponible en tokens; admite grabaciones de hasta 30 minutos |
| Tipos de cuantizacion | 4 bits afín, tamano de grupo 64 (decoder); encoder y proyector en BF16; routers de expertos en float32 |
| Idiomas soportados | Ingles, frances, aleman, espanol, italiano, portugues, neerlandes |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), repositorio de 15,6 GB |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura encoder-decoder asimétrica. El encoder es Whisper large-v3, que procesa la señal de audio, y el decoder es un transformer de mezcla de expertos Gemma 4 26B-A4B con unos 25.900 millones de parametros totales. Un proyector conecta las representaciones del encoder con el espacio de entrada del decoder. La variante publicada aquí no reentrena el modelo: es una conversión del checkpoint oficial en BF16 realizada con mlx-audio, aplicando el predicado de cuantización propio del modelo, 4 bits y tamano de grupo 64.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion técnica destacable es la cuantización selectiva: solo el decoder se reduce a 4 bits, mientras que el encoder de audio y el proyector permanecen en BF16 y los routers de expertos en float32, lo que evita degradar la selección de expertos y la calidad de la representación acústica.

## Capacidades

- Transcripción de voz a texto en ingles, frances, aleman, espanol, italiano, portugues y neerlandes.
- Procesamiento de grabaciones de hasta 30 minutos en una sola pasada.
- Detección y transcripción en idioma desconocido mediante prompt genérico con salida verbatim y puntuación.
- Control de formato de salida mediante instrucciones en lenguaje natural (puntuación, mayúsculas, idioma de destino).
- Soporte de inferencia en Apple Silicon a través de mlx-audio (Python) y mlx-audio-swift (Swift).
- No se documentan capacidades de tool calling, agentes, vision ni audio más allá de la transcripción.

## Casos de uso

- Transcripción de reuniones y entrevistas largas: con soporte de hasta 30 minutos por pasada, permite procesar sesiones completas sin segmentar manualmente el audio.
- Subtitulado multilingüe para vídeo: la cobertura de siete idiomas europeos y el control de puntuación mediante prompt facilitan la generación de subtítulos listos para revisión.
- Dictado local en Mac: integrado en la aplicación TypeWhisper, permite transcribir voz a texto sin enviar audio a servicios en la nube, útil en entornos con requisitos de privacidad.
- Documentación clínica o legal: el procesamiento local con licencia Apache 2.0 y sin dependencia de API externa encaja en flujos donde el audio es sensible.
- Archivado y búsqueda de contenido audiovisual: transcripción por lotes de grabaciones en varios idiomas para indexar y buscar por texto.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en aplicaciones de escritorio para macOS.
- Investigación en ASR: punto de partida cuantizado para experimentar con decoders MoE en tareas de voz sobre hardware de consumo Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria estimada para inferencia: unos 16 GB según la model card; el plugin de TypeWhisper recomienda Macs con 32 GB o más.
- Hardware objetivo: Apple Silicon con MLX; no se documenta soporte para GPU NVIDIA ni CPU x86 en esta variante.
- Cabe en equipos de consumo Apple con memoria unificada suficiente (32 GB recomendados), no en GPUs de consumo convencionales.
- Opciones de despliegue: mlx-audio desde `main` en Python y `SOVTranscribeModel` de mlx-audio-swift en Swift; la model card indica que el soporte de SOV-Transcribe aún no está en una release de mlx-audio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SOV-Transcribe-1-4bit (esta ficha) | 25.892.458.526 totales | Hasta 30 minutos de audio | 7 idiomas europeos | Apache 2.0 | Hugging Face, MLX |
| SOV-Transcribe-1 (Salesforce, BF16) | No disponible | Hasta 30 minutos de audio | 7 idiomas europeos | Apache 2.0 | Hugging Face |
| Whisper large-v3 | No disponible | No disponible | Multiples idiomas | No disponible | Hugging Face |
| nativ-community/SOV-Transcribe-1-4bit | Peso identico a esta conversion | Hasta 30 minutos de audio | 7 idiomas europeos | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Solo cubre siete idiomas; no se documenta soporte para otras lenguas ni para cambio de idioma dentro de una misma grabación.
- Limite de 30 minutos por audio; grabaciones más largas requieren segmentación previa.
- El rendimiento depende de la cuantización a 4 bits del decoder; no se han publicado métricas que cuantifiquen la perdida frente al checkpoint BF16.
- Riesgo de alucinación y de errores de puntuación inherente a los modelos generativos de ASR, especialmente en audio ruidoso o con acentos no vistos.
- Requiere mlx-audio desde `main`, sin release estable que incluya el soporte, lo que implica riesgo de cambios de API en producción.
- Dependencia de hardware Apple Silicon; no hay ruta documentada para GPU NVIDIA, AMD o CPU.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base de Salesforce antes de un despliegue comercial a gran escala.
- No se documentan sesgos específicos ni evaluaciones de robustez en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TypeWhisper/SOV-Transcribe-1-4bit
- Modelo base: https://huggingface.co/salesforce-sovereign-intelligence/SOV-Transcribe-1
- Conversión equivalente de nativ-community: https://huggingface.co/nativ-community/SOV-Transcribe-1-4bit
- Repositorio mlx-audio: https://github.com/Blaizzy/mlx-audio
- Pull request de mlx-audio-swift: https://github.com/Neywa-Labs/mlx-audio-swift/pull/405
- Aplicación TypeWhisper: https://www.typewhisper.com
