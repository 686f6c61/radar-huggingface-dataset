# Xenna/cielvox2-tts-1.7b-customvoice-GGUF

## Resumen

CielVox 1.7B CustomVoice es un modelo de síntesis de voz (text-to-speech) de código abierto, distribuido en formato GGUF para su ejecución local. Lo desarrolla el equipo Xenna en colaboración con el proyecto `stelnetxcis-create/cielvox2`, y está pensado para el backend `cielvox2-tts-1.7b-customvoice` del runtime en C++ `stelnettts`. El modelo resuelve el problema de generar voz sintética de alta calidad sin necesidad de audio de referencia ni codificador de voz (ECAPA), gracias a un conjunto fijo de nueve voces integradas ("baked speakers") que se seleccionan por nombre.

La arquitectura se compone de un "talker" (modelo de lenguaje) de 28 capas con 2048 dimensiones ocultas y 16 cabezas de atención, que produce 16 libros de códigos RVQ (residual vector quantization) que un codec externo (CielVox-Tokenizer-12Hz) convierte en audio PCM mono de 24 kHz. El modelo tiene 1.916.676.352 parámetros en su versión original (safetensors) y se distribuye en un único archivo GGUF cuantizado a Q8_0 de 2,04 GB. Está licenciado bajo Apache 2.0 y soporta nueve idiomas: inglés, chino, alemán, francés, italiano, español, portugués, japonés y coreano. Su relevancia actual radica en ser una opción de TTS local, sin dependencia de servicios en la nube y con una latencia potencialmente baja gracias a la cuantización GGUF.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Talker LM (transformer) + code predictor + codec RVQ de 12 Hz |
| Parametros totales | 1.916.676.352 (1,7B nominales) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0 (único archivo distribuido) |
| Idiomas soportados | en, zh, de, fr, it, es, pt, ja, ko (9 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `cielvox2-tts-12hz-1.7b-customvoice-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura híbrida de generación de voz por códigos RVQ. El componente principal es un "talker" (modelo de lenguaje) con 28 capas, 2048 dimensiones ocultas, 16 cabezas de atención y 8 cabezas de clave/valor (KV heads) con un `head_dim` de 128. La salida del talker es una proyección de 16 libros de códigos (cada uno con 2048 entradas) que representan los tokens de voz. Una capa de proyección denominada `small_to_mtp_projection` reduce las 2048 dimensiones del talker a 1024 para alimentar al predictor de códigos. El predictor de códigos está compuesto por 5 capas y 15 pares de `codec_embedding`/`lm_head` independientes (uno por cada libro de códigos restante tras el primero), con top-k de 50 y temperatura de 0,9 durante el muestreo.

El codec asociado, CielVox-Tokenizer-12Hz, es un archivo GGUF separado que convierte los códigos RVQ en audio PCM mono de 24 kHz. La tasa de generación de tokens es de 12,5 por segundo (12 Hz). No se ha publicado información sobre los datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo se distribuye como una conversión GGUF del original, con un runtime en C++ basado en gráficos ggml implementado en `src/cielvox2_tts.cpp`.

## Capacidades

- Generación de voz natural en nueve idiomas (en, zh, de, fr, it, es, pt, ja, ko).
- Nueve voces fijas integradas ("baked speakers") seleccionables por nombre mediante el parámetro `--voice`.
- No requiere audio de referencia ni modelo de extracción de características de voz (ECAPA), simplificando el flujo de trabajo.
- Emisión de 16 códigos RVQ por paso, que se decodifican a audio PCM mono de 24 kHz.
- Funciona con el runtime `stelnettts` en C++, que permite inferencia local con baja sobrecarga.
- Soporta descarga automática de los archivos del modelo y del codec mediante `-m auto`.
- Cuantización Q8_0 que reduce el tamaño del modelo a 2,04 GB sin degradación significativa de calidad según las verificaciones del autor.
- No tiene capacidades de tool calling, agentes ni razonamiento multimodal; es exclusivamente un sistema de síntesis de voz.

## Casos de uso

- **Aplicaciones de accesibilidad**: lectores de pantalla que convierten texto en voz en tiempo real para personas con discapacidad visual. El modelo puede integrarse en aplicaciones de escritorio o móviles mediante el runtime C++ y seleccionar una voz específica para cada idioma.
- **Asistentes de voz locales**: asistentes personales que necesitan responder con voz sin depender de servicios en la nube. Su licencia Apache 2.0 y su pequeño tamaño permiten embebido en dispositivos con recursos limitados.
- **Doblaje y narración de contenidos**: generación de voces en off para vídeos, presentaciones o podcasts. Al tener 9 voces fijas, se puede asignar una voz distinta a cada personaje en una narración, manteniendo la coherencia.
- **Educación y aprendizaje de idiomas**: práctica de pronunciación y escucha en los nueve idiomas soportados. El modelo puede integrarse en aplicaciones de enseñanza que generen ejemplos de audio para frases o palabras.
- **Pruebas de sistemas de reconocimiento de voz**: generación de audio sintético para evaluar sistemas de transcripción o de ASR, con control total de la voz y el idioma.
- **Prototipado rápido de interfaces de voz**: durante el desarrollo de una aplicación con interacción por voz, el modelo permite probar la experiencia de usuario sin necesidad de grabar voces reales ni contratar locutores, gracias a su fácil integración con `stelnettts`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks (como MMLU, HumanEval o métricas de calidad de voz tipo MOS) en la información disponible. La model card solo incluye una verificación de calidad cualitativa: reproducción exacta de frases de prueba para las voces integradas. No hay datos comparativos con otros modelos TTS.

## Requisitos de hardware

- El archivo GGUF Q8_0 ocupa 2,04 GB, por lo que la VRAM necesaria para inferencia está en torno a 2,2-2,5 GB (incluyendo el codec).
- Puede ejecutarse en GPUs de consumo con al menos 4 GB de VRAM, como las series GTX 1060, RTX 2060, RTX 3060, RTX 4060, etc. También funciona en CPU con suficiente RAM.
- El runtime `stelnetts` está basado en ggml, lo que permite su ejecución en CPU y GPU (CUDA, Metal, Vulkan) mediante la compilación con CMake.
- No se requiere hardware especializado como A100 o H100 para este modelo; se puede ejecutar en un equipo de escritorio o incluso en un portátil moderno.
- La latencia de generación no está especificada, pero al ser un modelo de 1,7B cuantizado y con una tasa de tokens de 12 Hz, se espera una latencia de menos de un segundo por frase corta en GPU.
- Opciones de despliegue: el runtime `stelnetts` es el único método documentado, pero al ser un formato GGUF, podría integrarse en otros frameworks que soporten GGUF (como llama.cpp) si se adapta la lógica de codec, aunque no está implementado de forma oficial.

## Comparativa con modelos similares

No se dispone de información comparativa directa con otros modelos TTS en la documentación proporcionada. El modelo parece pertenecer a la familia de modelos TTS de 1,7B con tokens de 12 Hz, como el `Qwen3-TTS-12Hz-1.7B-CustomVoice` mencionado en la búsqueda web, pero no hay datos de rendimiento, calidad de voz ni latencia que permitan una comparación objetiva. Se recomienda consultar los repositorios de `Qwen3-TTS` para obtener referencias.

## Limitaciones y advertencias

- Documentación en construcción: la model card indica que los parámetros y nombres de archivo pueden cambiar sin aviso.
- Solo ofrece 9 voces fijas; no es posible clonar una voz personalizada sin entrenamiento adicional.
- No se proporciona información sobre los datos de entrenamiento ni sobre posibles sesgos en las voces o idiomas.
- El modelo genera audio de 24 kHz, que es inferior a los estándares de alta fidelidad (44,1 kHz o 48 kHz), aunque suficiente para aplicaciones de voz.
- Requiere el codec CielVox-Tokenizer-12Hz para convertir los códigos en audio; sin él, el modelo no produce sonido.
- No se han publicado benchmarks objetivos de calidad de voz, por lo que no hay garantía de rendimiento en entornos reales.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar el cumplimiento de atribución y las condiciones de la licencia en el repositorio del autor.
- No se ha documentado el soporte de streaming de audio; la generación completa de la frase debe completarse antes de obtener el WAV.
- El modelo no incluye funcionalidades de pausa, control de entonación o ajuste de velocidad; estas dependen del runtime y no están documentadas.

## Enlaces

- Modelo en Hugging Face: [Xenna/cielvox2-tts-1.7b-customvoice-GGUF](https://huggingface.co/Xenna/cielvox2-tts-1.7b-customvoice-GGUF)
- Repositorio del proyecto `cielvox2`: [stelnetxcis-create/cielvox2](https://github.com/stelnetxcis-create/cielvox2)
- Códec tokenizer: [Xenna/cielvox2-tokenizer-12hz](https://huggingface.co/Xenna/cielvox2-tokenizer-12hz)
- Documentación del runtime en `src/cielvox2_tts.cpp` dentro del repositorio anterior.
- Referencia a la familia Qwen3-TTS (relacionada, no idéntica): [QwenLM/Qwen3-TTS](https://github.com/QwenLM/Qwen3-TTS)
