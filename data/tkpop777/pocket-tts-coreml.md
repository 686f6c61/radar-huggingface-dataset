# tkpop777/pocket-tts-coreml

## Resumen

Pocket TTS (Core ML) es una conversión al formato Core ML del checkpoint `english_2026-10` del modelo de síntesis de voz Pocket TTS desarrollado por Kyutai. El autor de esta conversión es tkpop777, que parte del trabajo previo de FluidInference (`mobius` y `pocket-tts-coreml` v2.1) y le añade una salida adicional en el paso del decodificador FlowLM: las puntuaciones de atención pre-softmax de las cabezas L3H8 y L2H0 sobre la caché KV, con forma `[1, 2, 512]`. Esas cabezas siguen la palabra que se está pronunciando, lo que permite obtener marcas de tiempo por palabra durante la generación en streaming.

El modelo resuelve un problema concreto: ejecutar síntesis de voz en dispositivos Apple (macOS, iOS) mediante Core ML con la posibilidad de alinear el audio generado con el texto de entrada a nivel de palabra. Esto es útil para subtitulado automático, karaoke, sincronización de avatares o resaltado de texto en lectores. La mayor parte de los artefactos (`cond_prefill`, `flow_decoder_fused`, `mimi_decoder`, `constants_bin` y los manifiestos) son los ficheros originales de FluidInference sin modificar; solo `flowlm_step.mlmodelc` se reexporta con la receta v2.1 y la salida extra de atención.

El repositorio ocupa 0,5 GB, tiene 0 descargas y 0 likes en el momento de la consulta, y se publicó el 19 de noviembre de 2026. La licencia es CC-BY-4.0, heredada del modelo base de Kyutai. No se especifican idiomas soportados más allá de la referencia al checkpoint `english_2026-10`, que sugiere inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | TTS con FlowLM (decodificador por flujo) y decoder Mimi; conversión a Core ML |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (formato Core ML `.mlmodelc`; no se detallan precisiones) |
| Idiomas soportados | no disponible (checkpoint `english_2026-10`, presumiblemente inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | Core ML (`.mlmodelc`), manifiestos y `constants_bin` |

## Arquitectura y entrenamiento

El modelo base es Pocket TTS de Kyutai, un sistema de síntesis de voz que combina un decodificador FlowLM con un decoder Mimi (el codec neuronal de Kyutai). La conversión a Core ML descompone el pipeline en varios submodelos: `cond_prefill` (prefill de condicionamiento), `flow_decoder_fused` (decodificador de flujo fusionado), `mimi_decoder` (decodificador de audio) y `flowlm_step` (paso autoregresivo del FlowLM). Los cuatro primeros son obra de FluidInference y se mantienen sin cambios; solo `flowlm_step` se reexporta.

La innovación de esta ficha es la salida adicional de atención: se exponen las puntuaciones pre-softmax de las cabezas L3H8 y L2H0 sobre la caché KV, con tensor de forma `[1, 2, 512]`. Según la model card, esas cabezas "siguen la palabra que se está pronunciando", lo que permite derivar marcas de tiempo por palabra durante la generación en streaming, siguiendo el método del proyecto `pocket-tts-timestamped`. No se detallan en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Síntesis de voz (text-to-speech) a partir de texto de entrada, con el checkpoint `english_2026-10`.
- Generación en streaming con el decodificador FlowLM paso a paso.
- Obtención de marcas de tiempo por palabra mediante las cabezas de atención L3H8 y L2H0 expuestas en `flowlm_step`.
- Ejecución en el ecosistema Apple mediante Core ML (compatible con FluidAudio).
- Carga de los submodelos `cond_prefill`, `flow_decoder_fused`, `mimi_decoder` y `constants_bin` sin modificaciones respecto a FluidInference v2.1.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio de entrada ni modo de razonamiento.

## Casos de uso

- Subtitulado automático de audio generado: las marcas de tiempo por palabra permiten alinear cada palabra sintetizada con su instante de emisión, lo que simplifica la generación de ficheros SRT o VTT a partir del texto de entrada.
- Lectores de texto con resaltado sincronizado: una app de lectura en iOS o macOS puede resaltar la palabra que se está pronunciando en tiempo real usando las puntuaciones de atención expuestas, sin necesidad de un alineador externo.
- Karaoke y aplicaciones musicales: la sincronización palabra a palabra facilita animaciones de letras sobre la voz sintetizada en apps nativas de Apple.
- Avatares y agentes conversacionales en dispositivos Apple: la inferencia vía Core ML permite ejecutar TTS localmente en macOS/iOS, con marcas de tiempo para animar labios o gestos sincronizados con el habla.
- Doblaje y postproducción: generación de voz en local con alineación temporal por palabra para ajustar cortes y edición en herramientas de vídeo.
- Accesibilidad: lectura en voz alta de contenido con seguimiento visual de la palabra activa para usuarios con dificultades de lectura, aprovechando la ejecución on-device de Core ML.
- Integración en FluidAudio: al mantener el layout de FluidInference v2.1, se puede cargar en proyectos que ya usan FluidAudio y añadir la funcionalidad de timestamps sin cambiar el resto del pipeline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; al ser Core ML, se ejecuta en la GPU/ANE de los dispositivos Apple y no se especifican requisitos de memoria.
- GPU recomendadas: no disponibles; el formato Core ML está pensado para hardware Apple (Apple Silicon, GPU integrada, Neural Engine).
- Compatibilidad con GPU de consumo: no disponible; no se documenta soporte para GPUs NVIDIA o AMD.
- Opciones de despliegue: Core ML (`.mlmodelc`), con integración prevista en FluidAudio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Formato | Timestamps por palabra |
|---|---|---|---|---|---|---|
| tkpop777/pocket-tts-coreml | no disponible | no disponible | no disponible (checkpoint inglés) | CC-BY-4.0 | Core ML | Sí (cabezas L3H8 y L2H0) |
| FluidInference/pocket-tts-coreml v2.1 | no disponible | no disponible | no disponible | CC-BY-4.0 | Core ML | No documentado |
| kyutai/pocket-tts (base) | no disponible | no disponible | no disponible | CC-BY-4.0 | no disponible | No documentado |

La comparativa se limita a las variantes del mismo modelo base; no se dispone de datos de benchmarks ni de especificaciones de parámetros para contrastar con alternativas de otros autores.

## Limitaciones y advertencias

- El checkpoint es `english_2026-10`, por lo que la cobertura multilingüe es presumiblemente limitada al inglés; no se documentan otros idiomas.
- No se han publicado benchmarks ni métricas de calidad (MOS, WER, latencia), lo que impide evaluar el rendimiento frente a alternativas.
- El repositorio tiene 0 descargas y 0 likes; no hay evidencia de uso en producción ni de validación por terceros.
- La salida de atención extra (`[1, 2, 512]`) depende de dos cabezas concretas (L3H8 y L2H0); su fiabilidad para timestamps no está cuantificada en la información disponible.
- La licencia CC-BY-4.0 permite uso comercial con atribución; es necesario citar a Kyutai (pesos), FluidInference (conversión Core ML) y `pocket-tts-timestamped` (cabezas de timing) según la model card.
- Al ser Core ML, el despliegue queda restringido al ecosistema Apple; no hay artefactos para GPUs NVIDIA ni para servidores Linux convencionales.
- No se detallan sesgos, riesgo de alucinación en el texto sintetizado ni limitaciones de contexto; al ser TTS, el riesgo principal es la pronunciación incorrecta de nombres propios o términos técnicos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tkpop777/pocket-tts-coreml
- Modelo base (Kyutai Pocket TTS): https://huggingface.co/kyutai/pocket-tts
- Conversión de referencia (FluidInference): https://huggingface.co/FluidInference/pocket-tts-coreml
- Repositorio FluidAudio: https://github.com/FluidInference/FluidAudio
- Repositorio möbius: https://github.com/FluidInference/mobius
- Método de timestamps por palabra: https://github.com/dpm63/pocket-tts-timestamped
