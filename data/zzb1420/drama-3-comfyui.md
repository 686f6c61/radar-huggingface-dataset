# zzb1420/Drama-3-ComfyUI

## Resumen

Drama-3-ComfyUI es una conversión del modelo de síntesis de voz fishaudio/drama-3, empaquetada en un único fichero safetensors para su uso con el nodo Drama3Loader del ecosistema ComfyUI. El modelo original lo desarrolla Fish Audio y está orientado a text-to-speech expresivo con clonación de voz zero-shot, incluyendo control de matices mediante etiquetas como [sighs] o [whispers] y soporte de hasta 16 hablantes en un mismo texto. La conversión la firma el usuario zzb1420 y se basa en la revisión de pesos del 29 de octubre de 2026.

Técnicamente, el fichero aplica cuantización FP8 por bloques (escalas de 128x128) únicamente a los expertos enrutados de una arquitectura MoE, mientras mantiene el resto de capas lineales en bf16. El checkpoint resultante pesa 38.578.417.928 bytes y contiene 912 tensores, con las proyecciones gate/up fusionadas y la LM head recortada a las filas que se muestrean en generación (1 token de fin de habla más 4096 tokens semánticos). Los pesos se verificaron byte a byte contra la revisión indicada.

Su relevancia práctica está en que permite ejecutar un modelo de aproximadamente 35B parámetros en GPUs de consumo desde 8 GB de VRAM, manteniendo los 32 GB de expertos enrutados en RAM del sistema y una caché en GPU de los expertos activos. Según el proyecto de nodos asociado, la decodificación se aceleró 3x desde el 17 de octubre, hasta el punto de que una tarjeta de 8 GB sigue el ritmo en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE con expertos enrutados en FP8 por bloques y capas densas en bf16; pipeline text-to-speech con códec de audio |
| Parametros totales | aproximadamente 35B (según la documentación del nodo ComfyUI) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 por bloques (escalas 128x128) en expertos enrutados; bf16 en el resto de lineales |
| Idiomas soportados | no disponible |
| Licencia | fish-audio-drama-3-license |
| Formato de pesos | safetensors (fichero único `drama3_fp8experts_bf16.safetensors`) |

## Arquitectura y entrenamiento

El modelo base fishaudio/drama-3 emplea una arquitectura de mezcla de expertos (MoE) en la que los expertos enrutados concentran la mayor parte del cómputo, mientras que las proyecciones lineales restantes operan en bf16. En esta conversión, los expertos enrutados conservan los tensores FP8 por bloques del checkpoint original, copiados byte a byte, y las proyecciones gate/up aparecen fusionadas. La LM head se ha recortado a 1 token de fin de habla más 4096 tokens semánticos, que son las filas de las que muestrea la generación.

El pipeline completo combina el modelo generador con un códec de audio (`drama3_codec.safetensors`) y un modelo ASR basado en Qwen3-ASR para la transcripción de la voz de referencia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. La model card del autor de la conversión no documenta innovaciones de decodificación más allá de la aceleración 3x reportada por el proyecto de nodos ComfyUI desde el 17 de octubre.

## Capacidades

- Síntesis de voz expresiva a partir de texto, con control de entrega mediante etiquetas como [sighs] o [whispers].
- Clonación de voz zero-shot mediante condicionamiento con una voz de referencia, sin entrenamiento adicional.
- Soporte de hasta 16 hablantes distintos dentro de un mismo texto.
- Conversión de voz a texto auxiliar mediante Qwen3-ASR para transcribir la referencia.
- Integración nativa en ComfyUI mediante el nodo Drama3Loader y el códec asociado.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso, al tratarse de un modelo de audio.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Doblaje y localización de vídeo: el modelo permite asignar hasta 16 hablantes distintos en un mismo guion y controlar la entrega con etiquetas de matiz, lo que facilita generar pistas de voz diferenciadas por personaje en un único pase.
- Audiolibros y narración: la clonación de voz zero-shot permite mantener una voz consistente a lo largo de capítulos largos a partir de una referencia breve, con control de susurros y suspiros para pasajes concretos.
- Preproducción de videojuegos: los nodos de ComfyUI permiten iterar sobre líneas de diálogo con voces de referencia provisionales antes de contratar actores, aprovechando la ejecución en GPUs de consumo desde 8 GB.
- Creación de contenido para redes: generación de voces personalizadas en local sin depender de servicios en la nube, usando una tarjeta de 8 GB que mantiene el ritmo en tiempo real según la documentación del nodo.
- Accesibilidad y lectura de textos: conversión de documentos a audio con una voz clonada del propio usuario, útil para mantener familiaridad en la escucha.
- Prototipado de asistentes de voz: combinación del TTS con el ASR Qwen3-ASR incluido en el pack para construir bucles de conversación hablada en local dentro de ComfyUI.
- Postproducción de pódcast: generación de inserciones y correcciones de voz que imiten la voz original del locutor mediante la referencia correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: el proyecto de nodos reporta funcionamiento en tarjetas desde 8 GB, manteniendo los 32 GB de expertos enrutados en RAM del sistema y una caché en GPU de los expertos en uso.
- RAM del sistema: se requiere espacio suficiente para alojar aproximadamente 32 GB de expertos enrutados, además del resto del checkpoint.
- Almacenamiento: el fichero de pesos ocupa 38.578.417.928 bytes (unos 38,6 GB), al que se suman el códec de audio y el modelo ASR.
- GPU recomendadas: no disponible de forma explícita; la documentación menciona funcionamiento desde 8 GB de VRAM sin especificar modelos concretos.
- Cabe en GPU de consumo: sí, según el proyecto de nodos, desde 8 GB.
- Despliegue: ComfyUI con el nodo Drama3Loader, el códec en `ComfyUI/models/vae/` y Qwen3-ASR en `ComfyUI/models/asr/`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: se reporta una decodificación 3x más rápida desde el 17 de octubre, suficiente para que una tarjeta de 8 GB siga el ritmo en tiempo real; no se ofrecen cifras absolutas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Drama-3-ComfyUI (esta ficha) | aproximadamente 35B (MoE) | no disponible | fish-audio-drama-3-license | Hugging Face, 0 descargas, 0 likes | Conversión FP8 de expertos para ComfyUI, ejecutable desde 8 GB de VRAM |
| fishaudio/drama-3 (original) | aproximadamente 35B (MoE) | no disponible | fish-audio-drama-3-license | Hugging Face (revisión 78e5ab79e49a) | Pesos originales en 15 shards; sin conversión para ComfyUI |
| PedroMarinhoDev/Drama-3-ComfyUI | no disponible | no disponible | fish-audio-drama-3-license | Hugging Face | Fichero precompilado a partir de una revisión anterior del modelo base |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de estas variantes entre sí ni con otros modelos TTS.

## Limitaciones y advertencias

- La licencia fish-audio-drama-3-license es de tipo "other"; deben revisarse sus términos antes de cualquier uso comercial, ya que no se detallan en la información disponible.
- El repositorio no registra descargas ni likes, por lo que no hay validación comunitaria del artefacto.
- La calidad del resultado depende de la calidad, la transcripción y la entrega de la voz de referencia, según la documentación del proyecto de nodos.
- El fichero corresponde a la revisión de pesos del 29 de octubre de 2026; otras conversiones del ecosistema pueden estar basadas en revisiones anteriores y no ser intercambiables.
- La LM head está recortada a las filas de muestreo, de modo que el fichero no es apto para usos que requieran la distribución completa sobre el vocabulario semántico.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni cobertura de idiomas; al ser un modelo de voz, existe riesgo de uso indebido en suplantación de identidad si se clonan voces sin consentimiento.
- Requiere el códec y el modelo ASR del pack de nodos; no es un artefacto autónomo.
- No se dispone de información sobre latencia absoluta ni throughput en hardware concreto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zzb1420/Drama-3-ComfyUI
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Repositorio de nodos ComfyUI-Drama3: https://github.com/PedroMarinhoDev/ComfyUI-Drama3
- Página del proyecto de nodos: https://pedromarinhodev.github.io/ComfyUI-Drama3/
- Nodos alternativos Comfyui-Drama-3 de T8mars: https://github.com/T8mars/Comfyui-Drama-3
