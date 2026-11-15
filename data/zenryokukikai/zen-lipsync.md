# Zenryokukikai/zen-lipsync

## Resumen

ZEN-LipSync 1.1.3 es un sistema de lip-sync (sincronización labial) para avatares talking-head desarrollado por Zenryokukikai (全力機械), un estudio japonés. A diferencia de los modelos generativos de propósito general, este paquete no es un modelo de lenguaje ni un generador de vídeo: es un conjunto de pesos y materiales específicamente entrenados para animar la boca de tres avatares concretos (Marine, Hashiro y Kikka) en tiempo real a partir de una señal de audio. El repositorio de Hugging Face contiene únicamente el "avatar pack" (modelos y assets), mientras que el SDK de ejecución vive en GitHub.

La propuesta técnica se centra en la eficiencia extrema: el sistema funciona dentro del navegador mediante WebGPU y en Node.js sobre CPU, sin necesidad de GPU dedicada en servidor. Los modelos incluidos son de tamaño muy reducido (ficheros de 2,7 MB y 11,8 MB en formato propietario `.wgw` y `.lip8`), lo que permite despliegue on-device con latencia baja. El paquete completo ocupa 0,2 GB e incluye vídeo idle en WebM, manifiestos de frames, latentes de referencia y datos de tono.

Es relevante ahora porque ejemplifica una tendencia de modelos especializados y ultraligeros que priorizan el despliegue en el borde (edge) frente a los grandes modelos multimodales. Su limitación fundamental es que no es un modelo general: solo funciona con los avatares incluidos, y crear nuevos avatares requiere encargarlo al desarrollador. La licencia es propietaria (`zen-lipsync-license-1.0`), lo que condiciona su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelos propietarios `.wgw` y `.lip8`; sistema de lip-sync por frames, no transformer declarado) |
| Parámetros totales | no disponible (ficheros de pesos de 2,7 MB y 11,8 MB; no se declara recuento de parámetros) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (no aplica; procesa audio por utterance) |
| Tipos de cuantización | no disponible (formatos propietarios `frame.i8.wgw`, `frame.lip8`, `sentence.wgw`; el sufijo `i8` sugiere enteros de 8 bits, no confirmado) |
| Idiomas soportados | japonés (ja) |
| Licencia | zen-lipsync-license-1.0 (propietaria, `license: other`) |
| Formato de pesos | `.wgw`, `.lip8`, `.f16`, `.f32`, `.pack` (formatos propietarios); assets en WebM y JSON |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo. La model card no describe la topología de red, el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Los nombres de fichero (`frame.i8.wgw`, `frame.lip8`, `sentence.wgw`) y los materiales auxiliares (`features.f16`, `ref_latent.f32`, `manifest.json`, `frames.pack`) apuntan a un pipeline de dos etapas: un modelo a nivel de frase (`sentence.wgw`) que probablemente predice la secuencia de visemas o frames, y un modelo a nivel de frame (`frame.*`) que genera o selecciona la imagen de boca correspondiente. El fichero `idle-switch.json` sugiere lógica de transición entre estados de reposo (`normal`, `angry`).

La innovación técnica destacable es el enfoque de despliegue: ejecución en WebGPU dentro del navegador y en CPU bajo Node.js, con un formato de avatar pack versionado (formato 2, `frames.pack`, legible desde ZEN-LipSync 1.1.0). El sistema se apoya en vídeo idle pregrabado (WebM) y en un pack de frames precomputado, lo que evita generación de vídeo neuronal en tiempo real y explica el reducido tamaño de los pesos. No se documentan detalles sobre el dataset de entrenamiento ni sobre el proceso de anotación audio-visual.

## Capacidades

- Sincronización labial en tiempo real de avatares talking-head a partir de audio.
- Funcionamiento on-device: WebGPU en navegador y CPU en Node.js.
- Soporte de tres avatares concretos: Marine (`marine-1.0`), Hashiro (`hashiro-1.0`) y Kikka (`kikka-1.0`).
- Estados de reposo o expresivos por avatar: `normal` y `angry` (Marine y Hashiro); solo `normal` en Kikka.
- Cambio entre estados de reposo mediante tabla de correspondencia de frames (`idle-switch.json`).
- Procesamiento a nivel de frase (`sentence.wgw`) y a nivel de frame (`frame.*`).
- Audio de prueba incluido (`sample.wav`, voz de Marine generada con ZEN-TTS, ~8 s).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión ni audio de entrada más allá de la señal de voz para lip-sync.
- Capacidad multilingüe: no; etiquetado únicamente para japonés.

## Casos de uso

- VTubers y streaming en vivo: el modelo anima la boca del avatar en el navegador con WebGPU mientras se reproduce la voz del streamer, sin servidor GPU dedicado y con latencia baja gracias a los pesos de pocos megabytes.
- Asistentes conversacionales con avatar en web: integrado en una aplicación web junto a un TTS (como ZEN-TTS), permite mostrar un personaje que habla sincronizado en el propio cliente, reduciendo coste de infraestructura.
- Kioscos y señalización digital interactiva: despliegue en Node.js sobre CPU en dispositivos de bajo consumo para presentar un avatar que responde por voz en japonés.
- Demos y prototipos de producto: el pack incluye vídeo idle y audio de muestra, lo que permite validar una experiencia talking-head en horas sin entrenar modelos.
- Contenido pregrabado con personajes: generación de clips con labios sincronizados para vídeos corporativos o educativos usando los avatares licenciados.
- Aplicaciones de accesibilidad: representación visual parlante de texto sintetizado para usuarios japoneses, con el avatar como refuerzo visual de la locución.
- Integración en pipelines de creación de contenido: automatizar la animación de un presentador virtual a partir de pistas de audio ya producidas, dado el reducido tamaño de los assets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el diseño apunta a ejecución sin GPU dedicada (WebGPU en cliente o CPU en Node.js).
- GPU recomendadas: cualquier GPU compatible con WebGPU en el navegador; no se especifican modelos concretos (A100, H100, RTX 4090, etc.).
- Cabe en GPU de consumo: sí, por diseño; el sistema está pensado para ejecutarse en el dispositivo del usuario, no en servidores de altas prestaciones.
- Opciones de despliegue: SDK oficial de Zenryokukikai (GitHub `zenryokukikai/zen-lipsync`) en navegador (WebGPU) y Node.js (CPU). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; la model card afirma funcionamiento "en tiempo real" sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Tipo | Tamaño | Idiomas | Licencia | Despliegue |
|---|---|---|---|---|---|
| ZEN-LipSync 1.1.3 | Lip-sync para avatares específicos | ~0,2 GB (pack completo) | ja | Propietaria (zen-lipsync-license-1.0) | WebGPU / Node.js CPU |
| Wav2Lip (referencia académica) | Lip-sync genérico | no disponible en esta ficha | multi | Investigación / variable | GPU |
| SadTalker (referencia académica) | Talking-head genérico | no disponible en esta ficha | multi | Investigación / variable | GPU |
| LivePortrait (referencia) | Animación facial | no disponible en esta ficha | multi | Variable | GPU |

No se dispone de datos comparativos de rendimiento entre ZEN-LipSync y estas alternativas en la información proporcionada. La diferencia cualitativa principal es la especialización por avatar y el enfoque on-device frente a los modelos genéricos que requieren GPU.

## Limitaciones y advertencias

- El modelo es exclusivo para los tres avatares incluidos; no funciona con otras caras ni vídeos. Crear un avatar nuevo requiere encargo al desarrollador.
- Solo soporta japonés como idioma declarado.
- Licencia propietaria `zen-lipsync-license-1.0`: es imprescindible revisar `LICENSE.md` antes de cualquier uso comercial; no es una licencia open source.
- Formato de pesos propietario (`.wgw`, `.lip8`): no es compatible con ecosistemas estándar como safetensors o GGUF, lo que limita la portabilidad y el tooling.
- Dependencia del SDK oficial de GitHub para su ejecución; no hay pipeline declarado en Hugging Face.
- Sin datos públicos de benchmarks, dataset ni arquitectura, lo que dificulta la evaluación independiente y la auditoría.
- Riesgo de artefactos visuales en transiciones entre estados (`normal`/`angry`) y en utterances largas no documentado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, con actualización en noviembre de 2026; madurez y soporte comunitario no verificables.
- No apto para tareas de generación de texto, razonamiento, código o matemáticas.

## Enlaces

- Hugging Face: https://huggingface.co/Zenryokukikai/zen-lipsync
- Repositorio SDK: https://github.com/zenryokukikai/zen-lipsync
- Repositorio de avatares: https://github.com/zenryokukikai/zen-lipsync-avatars
- Documentación del formato de avatar pack: https://github.com/zenryokukikai/zen-lipsync/blob/main/docs/AVATAR-PACK.md
- Sitio del desarrollador: https://zenryokukikai.com
