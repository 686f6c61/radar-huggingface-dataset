# WonderChord/Drama3-V2-NVFP4-256E-GGUF

## Resumen

Drama3-V2-NVFP4-256E-GGUF es un repack no oficial en formato GGUF del modelo de síntesis de voz Fish Audio Drama 3 (`fishaudio/drama-3`), publicado por el usuario WonderChord. El modelo original es un sistema de text-to-speech con clonación de voz desarrollado por Fish Audio; este repack cuantiza las 40 capas del backbone MoE (256 expertos enrutados por capa) a NVFP4 (`GGML_TYPE_NVFP4`), manteniendo el backbone y el tower en Q8_0/BF16/F32 y el códec DAC en F16/F32. El resultado es un fichero de pesos de 20,72 GiB (22.244.242.848 bytes) pensado para ejecutarse en `audio.cpp`.

La relevancia de esta versión radica en que permite ejecutar un modelo TTS de tipo MoE con 256 expertos en una GPU de 24 GB de VRAM manteniendo todos los expertos residentes en memoria, con una velocidad de generación superior a 3 veces el tiempo real según las pruebas del autor en una RTX 5090D. Incluye un parche de runtime (`drama3-nvfp4-audiocpp.patch`) que añade soporte para escalas `.gguf_scale` en módulos lineales y MoE, además de corregir un fallo de decodificación del códec DAC en CUDA para secuencias de más de 128 frames.

Se trata de un artefacto de cuantización, no de un modelo entrenado desde cero: hereda las capacidades y limitaciones del modelo base de Fish Audio y está sujeto a la Fish Audio Community License v1.0. No se dispone de información sobre idiomas soportados, benchmarks ni datos de entrenamiento en la documentación proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con 40 capas y 256 expertos enrutados por capa (backbone) + tower + codec DAC |
| Parametros totales | no disponible |
| Parametros activos | no disponible (MoE con 256 expertos enrutados por capa) |
| Longitud de contexto | 1664 (valor de `fish_drama3.context_length` recomendado en la configuración de audio.cpp) |
| Tipos de cuantizacion | NVFP4 (expertos enrutados), Q8_0 / BF16 / F32 (backbone y tower), F16 / F32 (codec DAC) |
| Idiomas soportados | no disponible |
| Licencia | Fish Audio Community License v1.0 (`fish-audio-community-license-v1.0`) |
| Formato de pesos | GGUF (`Drama3-V2-78e5ab7-NVFP4-256E.gguf`, 22.244.242.848 bytes / 20,72 GiB) |

## Arquitectura y entrenamiento

El modelo base es Fish Audio Drama 3, un sistema de text-to-speech con clonación de voz. La arquitectura combina un backbone de tipo Mixture-of-Experts con 40 capas y 256 expertos enrutados por capa, un componente tower y un codec de audio DAC para la síntesis de la forma de onda. Esta versión GGUF no reentrena el modelo: aplica cuantización NVFP4 a los tensores de los expertos y mantiene el resto de componentes en precisiones mixtas (Q8_0, BF16, F32, F16) para preservar la calidad de la señal de audio.

El repack se generó con el script `convert_drama3_nvfp4.py` a partir de la revisión `78e5ab79e49aa9a25abe8799eff2c4d73a1c3216` del modelo original. El parche `drama3-nvfp4-audiocpp.patch` (para `audio.cpp` en el commit `066ea9862f41f4d7bcf996d5f00e464d8d28ace5`) añade soporte de escalas por tensor (`gguf_scale`) en proyecciones lineales y en módulos MoE (escalas `up_scale`, `gate_scale`, `down_scale` por experto, tanto en modo residente en VRAM como en caché en disco), además de escalado de filas en `embed_tokens.weight` y en el tower. También corrige un bug de corrupción de buffer en la decodificación DAC en CUDA para secuencias de más de 128 frames, fijando el tensor `post_latent` como salida para evitar la reutilización de buffers por parte de `ggml_gallocr`. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada.
- Clonación de voz: el pipeline está etiquetado como `voice-cloning` y `text-to-speech` en Hugging Face.
- Generación de audio mediante codec DAC integrado en el runtime de `audio.cpp`.
- Ejecución con todos los expertos MoE residentes en VRAM (modo `disk_experts: false`) o con caché de expertos en disco.
- Ajuste de rendimiento mediante modo `cuda_perf` en `audio.cpp`.
- Soporte de contexto de hasta 1664 unidades en la configuración recomendada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Clonación de voz para locuciones: el modelo permite generar audio con una voz de referencia gracias a sus capacidades de voice cloning, adecuado para producir narraciones personalizadas sin entrenamiento adicional.
- Generación de audiolibros y contenido largo: con un contexto configurado de 1664 y generación a más de 3 veces el tiempo real en una GPU de 24 GB, se pueden sintetizar pasajes extensos por fragmentos de forma eficiente.
- Doblaje y localización de vídeo: la síntesis TTS con clonación permite generar pistas de voz en distintos idiomas o registros, siempre que el modelo base soporte el idioma objetivo (dato no disponible).
- Asistentes de voz embebidos: al caber en una GPU consumer de 24 GB con todos los expertos en VRAM, es viable desplegar un servicio TTS local de baja latencia para prototipos de asistentes conversacionales.
- Accesibilidad: conversión de texto a voz para lectores de pantalla o aplicaciones de accesibilidad que requieran voces naturales y personalizables.
- Producción de contenido para podcasts y vídeo corto: generación de voces en off con velocidad superior al tiempo real, integrable en pipelines de edición automatizada.
- Investigación en TTS y cuantización: el artefacto sirve como referencia para estudiar el impacto de NVFP4 en modelos MoE de audio y para validar el runtime `audio.cpp` con parches de escalas por tensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados por el autor son de inferencia: en una RTX 5090D v2 de 24 GB con CUDA 13.0, con los 256 expertos residentes en VRAM (`disk_experts: false`, `cpu_expert_layers: 0`, `perf_mode: cuda_perf`, `context_length: 1664`), se observó un pico de VRAM de aproximadamente 22,55–22,84 GiB (22.550–22.837 MiB) y una velocidad de generación en caliente superior a 3 veces el tiempo real.

## Requisitos de hardware

- VRAM estimada: en torno a 22,55–22,84 GiB en el modo probado con todos los expertos residentes en VRAM (RTX 5090D v2 de 24 GB). El fichero de pesos ocupa 20,72 GiB.
- GPU recomendadas: RTX 5090D v2 de 24 GB (probada por el autor); por tamaño, cualquier GPU con 24 GB o más de VRAM debería poder alojar el modelo completo, aunque no se han publicado pruebas en otras tarjetas.
- GPU consumer: sí cabe en GPUs de 24 GB; en tarjetas con menos VRAM sería necesario usar el modo de expertos en disco (`disk_experts: true`) o descarga de capas a CPU (`cpu_expert_layers`), a costa de latencia.
- Opciones de despliegue: `audio.cpp` en el commit `066ea9862f41f4d7bcf996d5f00e464d8d28ace5` con el parche `drama3-nvfp4-audiocpp.patch` aplicado. No se mencionan otros runtimes compatibles (vLLM, llama.cpp, Ollama, TGI) para este formato NVFP4 específico.
- Latencia y throughput: generación en caliente a más de 3 veces el tiempo real en la configuración probada; no se aportan cifras absolutas de latencia por petición.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos comparables en la información proporcionada. La comparación se limita a lo que se conoce del propio artefacto frente a su modelo base.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Drama3-V2-NVFP4-256E-GGUF (este) | no disponible (MoE 40 capas × 256 expertos) | 1664 (config. recomendada) | NVFP4 + Q8_0/BF16/F32/F16 | Fish Audio Community License v1.0 | GGUF |
| fishaudio/drama-3 (base) | no disponible | no disponible | pesos originales (sin cuantizar) | Fish Audio Community License v1.0 | no disponible |
| Otras alternativas TTS | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un repack no oficial: no lo publica Fish Audio y no cuenta con su validación; la calidad puede diferir del modelo original.
- La cuantización NVFP4 de los expertos puede introducir degradación en la calidad del audio respecto a los pesos originales; no se han publicado evaluaciones subjetivas (MOS) ni objetivas.
- El parche de runtime es necesario para cargar las escalas `.gguf_scale` y para evitar la corrupción de decodificaciones DAC de más de 128 frames en CUDA; sin él, el modelo puede producir audio corrupto.
- La licencia Fish Audio Community License v1.0 impone condiciones específicas para uso comercial; es necesario revisar `LICENSE` y `NOTICE` antes de desplegar en producción.
- No se dispone de información sobre sesgos, idiomas soportados ni tasas de alucinación o artefactos de audio.
- El contexto recomendado es de 1664, lo que limita la longitud de texto por petición y obliga a fragmentar entradas largas.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de uso en producción.
- El rendimiento medido corresponde a una única configuración hardware (RTX 5090D v2, CUDA 13.0); no hay datos de latencia en otras GPUs.

## Enlaces

- Hugging Face: https://huggingface.co/WonderChord/Drama3-V2-NVFP4-256E-GGUF
- Modelo base: https://huggingface.co/fishaudio/drama-3
- Runtime audio.cpp: https://github.com/0xShug0/audio.cpp
- Commit de audio.cpp soportado: `066ea9862f41f4d7bcf996d5f00e464d8d28ace5`
- Fichero de pesos: `Drama3-V2-78e5ab7-NVFP4-256E.gguf` (con `.sha256` asociado)
- Script de conversión: `convert_drama3_nvfp4.py`
- Parche de runtime: `drama3-nvfp4-audiocpp.patch`
- Licencia: `LICENSE` y `NOTICE` en el repositorio de Hugging Face
