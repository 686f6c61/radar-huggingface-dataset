# WoofyHoo/VoxSRT-whisper-large-v3-turbo

## Resumen

VoxSRT-whisper-large-v3-turbo es una conversión al formato CTranslate2 del modelo oficial `openai/whisper-large-v3-turbo`, publicada por el usuario WoofyHoo. El propósito es integrar el reconocimiento automático de voz (ASR) en la aplicación VoxSRT, un software de subtitulado que ejecuta la transcripción de forma local, sin enviar audio a servidores externos. La conversión no ha sido entrenada ni ajustada: se limita a transformar los pesos originales de Transformers (safetensors) al formato optimizado que espera la librería faster-whisper, con precisión float16.

El modelo base, Whisper large-v3-turbo, es una variante optimizada del Whisper large-v3 de OpenAI, diseñada para reducir la latencia y el consumo de memoria manteniendo una calidad de transcripción similar. Whisper es un sistema de reconocimiento de voz multilingüe basado en una arquitectura transformer encoder-decoder, entrenado con más de 680 000 horas de audio supervisado. Esta conversión concreta pesa 1,6 GB y está pensada para su uso en entornos locales, lo que la hace relevante para aplicaciones de subtitulado, accesibilidad y transcripción privada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | no disponible (el modelo base large-v3-turbo no especifica el numero en la informacion proporcionada) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | 30 segundos de audio (ventana receptiva de Whisper) |
| Tipos de cuantizacion | float16 (en esta conversion) |
| Idiomas soportados | no disponible (el modelo base soporta 99 idiomas, pero la conversion no lo especifica) |
| Licencia | MIT |
| Formato de pesos | CTranslate2 (model.bin) |

## Arquitectura y entrenamiento

El modelo es una conversion de pesos, no un entrenamiento nuevo. Los pesos originales de `openai/whisper-large-v3-turbo` se transformaron al formato CTranslate2 usando las herramientas de faster-whisper (version 4.8.1) y Transformers (4.57.6). No se anadio ni se elimino informacion: el tokenizador y los metadatos de preprocesado se conservaron para el runtime de CTranslate2.

El modelo base, Whisper large-v3-turbo, es una version destilada y optimizada del Whisper large-v3. Mantiene la arquitectura transformer encoder-decoder, pero reduce el numero de capas del decoder para acelerar la inferencia. Se entreno con un corpus masivo de audio multilingue (mas de 680 000 horas) y es capaz de transcribir y traducir a ingles. La conversion a CTranslate2 permite aprovechar las optimizaciones de faster-whisper, como la decodificacion especulativa y la gestion eficiente de memoria, sin necesidad de GPU de alta gama.

## Capacidades

- Reconocimiento de voz multilingue: el modelo base soporta 99 idiomas, aunque la conversion no declara una lista especifica.
- Transcripcion de audio de larga duracion mediante algoritmos de ventana deslizante (secuencial o con buffer).
- Traduccion de audio a ingles (funcionalidad nativa de Whisper).
- Generacion de subtitulos con marcas de tiempo (adecuado para VoxSRT).
- Inferencia local sin conexion a internet, lo que garantiza privacidad de los datos de audio.
- No incluye capacidades de tool calling, vision ni agentes; es exclusivamente un modelo de ASR.

## Casos de uso

- Subtitulado automatico en VoxSRT: el modelo se integra directamente en la aplicacion para generar subtitulos en tiempo real o en postproduccion, aprovechando la ventana de 30 segundos y la transcripcion multilingue.
- Transcripcion de reuniones y entrevistas: al ejecutarse localmente, permite convertir grabaciones a texto sin depender de servicios en la nube, con la ventaja de la privacidad.
- Generacion de subtitulos para video: se puede usar junto con herramientas de edicion para crear archivos SRT o VTT a partir de audio, gracias a la salida con marcas de tiempo.
- Accesibilidad para personas con discapacidad auditiva: la transcripcion local facilita la creacion de contenido accesible en entornos sin conexion.
- Archivado y busqueda de contenido audiovisual: transcribir bibliotecas de audio o video para indexar y buscar por texto.
- Asistencia a creadores de contenido: generar transcripciones rapidas para blogs, podcasts o videos, con la posibilidad de traducir a ingles si se necesita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor indica que se realizo una prueba de humo en CPU que confirmo que faster-whisper podia cargar el paquete y producir una transcripcion, pero no se aportan metricas de calidad (WER) ni de rendimiento. Para referencia, el modelo base Whisper large-v3-turbo suele ofrecer una calidad cercana a large-v3 con menor latencia, pero no se dispone de datos numericos en esta ficha.

## Requisitos de hardware

- Tamano del modelo: 1,6 GB en float16, lo que sugiere que puede ejecutarse en GPU con al menos 2-3 GB de VRAM, aunque no se ha verificado.
- Compatible con CPU: la prueba de humo del autor se realizo en CPU, por lo que es funcional sin GPU, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU moderna con soporte CUDA (por ejemplo, RTX 2060 o superior) o GPU de Apple Silicon para aceleracion via Metal.
- Opciones de despliegue: faster-whisper (libreria principal), VoxSRT (aplicacion integrada), o cualquier runtime que soporte CTranslate2 (por ejemplo, llama.cpp no es aplicable, pero si se puede usar con el paquete de Python de faster-whisper).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| VoxSRT-whisper-large-v3-turbo (este) | no disponible | 30 s | MIT | CTranslate2 | Conversion para VoxSRT, float16 |
| openai/whisper-large-v3-turbo | no disponible | 30 s | MIT | safetensors | Modelo original, requiere Transformers |
| openai/whisper-large-v3 | 1,55 B | 30 s | MIT | safetensors | Version completa, mayor calidad pero mas lenta |
| Systran/faster-whisper-large-v3-turbo | no disponible | 30 s | MIT | CTranslate2 | Conversion similar para faster-whisper, ampliamente usada |

La principal diferencia con el modelo original es el formato: esta conversion esta optimizada para CTranslate2, lo que reduce el uso de memoria y acelera la inferencia en comparacion con la ejecucion directa de Transformers. Frente a otras conversiones de faster-whisper, esta se distingue por estar verificada para su uso en VoxSRT, con hashes SHA-256 documentados.

## Limitaciones y advertencias

- No se ha realizado ningun ajuste fino: la calidad depende enteramente del modelo base, que puede presentar sesgos en acentos, ruido o idiomas poco representados.
- Riesgo de alucinacion en audio ambiguo o de baja calidad, comun en modelos Whisper.
- Ventana de contexto limitada a 30 segundos: para audios largos se requieren algoritmos de ventana deslizante, que pueden introducir errores en los bordes.
- La conversion solo esta disponible en float16; no se ofrecen cuantizaciones int8 o int4 en este repositorio, aunque el formato CTranslate2 las permite si se generan.
- No se garantiza compatibilidad con todas las versiones de VoxSRT ni con sistemas limpios; la model card advierte que no se ha probado en entornos de produccion.
- Licencia MIT, permisiva para uso comercial, pero el modelo base puede tener restricciones adicionales (aunque tambien es MIT).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WoofyHoo/VoxSRT-whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Modelo base large-v3: https://huggingface.co/openai/whisper-large-v3
- Informacion sobre Whisper large-v3 (STT Index): https://speechtotext.dev/model/whisper-large-v3/
- Whisper Large v3 (streaming) en Together AI: https://www.together.ai/models/whisper-large-v3-streaming
