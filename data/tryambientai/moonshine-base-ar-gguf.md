# tryambientai/moonshine-base-ar-gguf

## Resumen

moonshine-base-ar-gguf es la conversión a formato GGUF del modelo UsefulSensors/moonshine-base-ar, un sistema de reconocimiento automático del habla (ASR) para árabe derivado de la familia Moonshine. Lo publica el usuario tryambientai y está pensado para ejecutarse con transcribe.cpp, una implementación en C++ del pipeline de inferencia. El modelo resuelve la transcripción de audio a texto en árabe sobre PCM crudo a 16 kHz, sin depender de STFT ni de bancos de filtros mel.

La arquitectura es un transformer encoder-decoder de 61.513.920 parámetros (aproximadamente 62M), con un stem de tres capas Conv1d que consume directamente la forma de onda. El contexto de audio no se expresa en tokens de texto: el modelo procesa ventanas de audio y emite únicamente la transcripción, sin traducción, sin detección de idioma y sin marcas de tiempo.

Su relevancia práctica está en el tamaño: el repositorio completo ocupa 0,1 GB y la cuantización Q8_0 pesa 74 MB, lo que permite desplegar ASR en árabe en CPU y en hardware de gama baja con latencias competitivas (RTF de 22 en un Ryzen 4750U por CPU y 34,5 por Vulkan). La licencia MIT facilita su integración comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder con stem Conv1d de tres capas (sin STFT ni mel filterbank) |
| Parametros totales | 61.513.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; max_length de decodificación 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 |
| Idiomas soportados | Árabe (ar) |
| Licencia | MIT |
| Formato de pesos | GGUF (transcribe.cpp); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine base: un encoder-decoder transformer de unos 62M de parámetros que sustituye el frontend clásico de ASR (espectrograma STFT más banco de filtros mel) por un stem de tres capas Conv1d que procesa directamente PCM crudo a 16 kHz. Esta elección reduce el preprocesado y hace que la longitud de entrada sea proporcional a la duración del audio, lo que resulta ventajoso en utterances cortas.

La variante ar es un ajuste fino de Moonshine base sobre árabe, portado desde el commit 264cc18 de UsefulSensors (fijado el 2026-05-12) y validado contra la referencia de transformers en el commit 90bf720 de transcribe.cpp. No se dispone de información sobre el volumen de tokens de audio, la composición del dataset de ajuste ni si se aplicaron técnicas de RLHF o DPO; la model card upstream es una plantilla autogenerada sin esos datos. La conversión a GGUF preserva la numeración de capas y los pesos en F32, F16 y Q8_0, y la decodificación por defecto es greedy con num_beams=1 y max_length=192, en línea con la generation_config original.

## Capacidades

- Transcripción de voz a texto en árabe sobre audio mono a 16 kHz.
- Procesamiento de PCM crudo mediante Conv1d, sin necesidad de calcular espectrogramas.
- Salida de solo transcripción, sin traducción a otros idiomas.
- Sin detección automática de idioma: el modelo asume árabe.
- Sin marcas de tiempo por palabra o por segmento (timestamps: none).
- Sin modo streaming: requiere el audio completo de la ventana para transcribir.
- No soporta tool calling, function calling ni razonamiento multi-paso; es un modelo puramente ASR.
- Ejecución en CPU y GPU a través de transcribe.cpp, con backend Metal y Vulkan.

## Casos de uso

- Subtitulado de contenido audiovisual en árabe: el modelo transcribe utterances completas y el pipeline externo puede segmentar el audio por pausas; su RTF de 22 en CPU permite procesar horas de material en hardware modesto.
- Transcripción de reuniones y notas de voz: con 74 MB en Q8_0 cabe en dispositivos de borde y permite generar actas en árabe sin enviar audio a la nube.
- Atención al cliente en árabe: integrado en un pipeline de ASR más LLM, transcribe las llamadas entrantes y alimenta un sistema de respuesta; la licencia MIT elimina fricción legal para uso comercial.
- Indexación y búsqueda de archivos de audio: transcripción por lotes de un corpus en árabe para construir índices de texto searchable, aprovechando el bajo coste de almacenamiento del modelo.
- Accesibilidad para personas con discapacidad auditiva: generación de subtítulos en directo o diferidos en aplicaciones de videollamada, con la advertencia de que no hay streaming nativo y se necesita segmentación externa.
- Despliegue en dispositivos empotrados y sistemas de borde: el peso de 74 MB en Q8_0 y la ejecución por CPU (RTF 22 en Ryzen 4750U) lo hacen viable en mini-PC, Raspberry Pi de gama alta o equipos sin GPU dedicada.
- Investigación en ASR de bajos recursos: punto de partida para ajuste fino en dialectos árabes, dado el reducido coste computacional del modelo base.

## Benchmarks y rendimiento

| Metrica | F32 | F16 | Q8_0 |
|---|---:|---:|---:|
| WER FLEURS ar test (428 utterances) | 24,45 % | 24,45 % | 24,50 % |
| RTF en M4 Max (Metal) | 79,5 | 79,5 | 79,5 |
| RTF en M4 Max (CPU) | 80,5 | 80,5 | 80,5 |
| RTF en Ryzen 4750U (Vulkan) | 34,5 | 34,5 | 34,5 |
| RTF en Ryzen 4750U (CPU) | 22 | 22 | 22 |

La referencia en Transformers F32 sobre MPS obtiene 24,51 % de WER en el mismo manifiesto, por lo que las cifras de transcribe.cpp quedan dentro del ruido del intervalo de confianza bootstrap. La cuantización Q8_0 introduce una deriva adicional de hasta 0,1 puntos porcentuales respecto a F16. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, dado que se trata de un modelo ASR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; F32 ocupa 236 MB, F16 126 MB y Q8_0 74 MB en disco, con un pico de memoria en ejecución del mismo orden.
- GPU recomendadas: cualquier GPU con soporte Metal (Apple Silicon M1 en adelante) o Vulkan (AMD, Intel, NVIDIA); no requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX, Radeon o iGPU moderna; también funciona íntegramente en CPU.
- Opciones de despliegue: transcribe.cpp (compilación con CMake), con backends CPU, Metal y Vulkan; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: RTF de 79,5 en M4 Max con Metal, 80,5 en M4 Max por CPU, 34,5 en Ryzen 4750U con Vulkan y 22 en Ryzen 4750U por CPU. Un RTF superior a 1 implica transcripción más rápida que tiempo real.
- Preprocesado requerido: audio mono a 16 kHz en WAV; para otras fuentes, conversión previa con ffmpeg (`-ar 16000 -ac 1`).

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | WER FLEURS ar | Licencia | Formato |
|---|---|---:|---|---:|---|---|
| moonshine-base-ar-gguf | 61,5M | Árabe | no disponible | 24,45 % (F32/F16) | MIT | GGUF |
| Whisper base | 74M | Multilingüe (99) | 30 s de audio | no disponible en la informacion | MIT | safetensors, GGUF |
| Whisper small | 244M | Multilingüe (99) | 30 s de audio | no disponible en la informacion | MIT | safetensors, GGUF |
| Moonshine base (original, inglés) | 61,5M | Inglés | no disponible | no aplica (inglés) | MIT | safetensors, GGUF |

La comparación con Whisper es la más directa por familia y tamaño: Whisper base tiene 74M de parámetros, soporta 99 idiomas y ofrece marcas de tiempo, mientras que moonshine-base-ar es monolingüe y prescinde de timestamps y streaming a cambio de un frontend Conv1d más simple y un peso menor. No se dispone de cifras de WER de Whisper en FLEURS ar dentro de la información proporcionada, por lo que no se puede establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Modelo monolingüe: solo árabe; no traduce ni detecta idioma, por lo que audio en otro idioma producirá salidas incorrectas sin aviso.
- WER de 24,45 % en FLEURS ar: aproximadamente una de cada cuatro palabras se transcribe mal, lo que limita su uso en dominios con requisitos de precisión alta sin revisión humana.
- Sin marcas de tiempo: no apto para aplicaciones que requieran alineación temporal palabra a palabra sin un componente externo de segmentación.
- Sin streaming: requiere disponer del audio completo de la ventana antes de transcribir; no sirve para subtitulado en directo sin un pipeline de segmentación por turnos.
- Sesgos no documentados: la model card upstream no detalla la composición del dataset de entrenamiento ni los sesgos conocidos, lo que impide evaluar su comportamiento en dialectos o registros específicos.
- Riesgo de alucinación en audio ruidoso o con música: como todo modelo ASR generativo, puede producir texto plausible no presente en la señal.
- Licencia MIT heredada del modelo base, sin restricciones adicionales para uso comercial; conviene verificar la cadena de autoría hasta UsefulSensors.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación externa muy limitado, por lo que se recomienda validar contra la referencia de transformers antes de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tryambientai/moonshine-base-ar-gguf
- Modelo base (UsefulSensors): https://huggingface.co/UsefulSensors/moonshine-base-ar
- Commit upstream de referencia: https://huggingface.co/UsefulSensors/moonshine-base-ar/commit/264cc18
- Repositorio transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Documentación del modelo Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Pesos GGUF (F32, F16, Q8_0): https://huggingface.co/handy-computer/moonshine-base-ar-gguf
- Paper de referencia citado en las etiquetas (arXiv:1910.09700): https://arxiv.org/abs/1910.09700
