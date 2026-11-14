# yelin201875/Yelinvoice

## Resumen

Nara Mini v1 es un modelo de síntesis de voz (text-to-speech) basado en Kokoro, adaptado para birmano (my) e inglés (en). Lo publica el usuario yelin201875 bajo el paraguas del proyecto Nara Audio, y su objetivo es ofrecer inferencia local de TTS en birmano con cuatro voces predefinidas, un idioma con escasa cobertura en el ecosistema de modelos abiertos de voz. El repositorio ocupa 2,8 GB e incluye pesos en safetensors y exportaciones ONNX optimizadas para dispositivos móviles.

La arquitectura subyacente es la de Kokoro, un modelo de TTS compacto basado en un codificador de texto tipo BERT, un predictor de duración y un decodificador neuronal que genera audio a 24 kHz mono. Sobre esa base, el autor ha incorporado reglas de pronunciación específicas del birmano, un léxico de excepciones, normalización de números y fonemización del inglés mediante Misaki y eSpeak. Cada una de las cuatro voces (`shoon`, `thazin`, `ko-banyar`, `htet-myat`) emplea su propia red y su propio voicepack con vocabulario y vectores de estilo.

Su relevancia actual reside en la combinación de licencia Apache 2.0, soporte de inferencia en CPU mediante ONNX y empaquetado específico para una aplicación móvil (formato `.nara`), lo que facilita el despliegue en entornos con recursos limitados y en escenarios sin conectividad. No obstante, la documentación pública es escasa y no se han publicado benchmarks objetivos de calidad de voz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kokoro (encoder de texto BERT, predictor de duracion, decodificador neuronal) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa pasajes largos en fragmentos) |
| Tipos de cuantizacion | ONNX con decodificador INT8 cuantizado selectivamente; safetensors en precision completa |
| Idiomas soportados | Birmano (my), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, paquete `.nara` |

## Arquitectura y entrenamiento

El modelo parte de Kokoro, un sistema de TTS que combina un codificador de texto basado en BERT (`bert`, `bert_encoder`), un predictor de duraciones (`predictor`) y un decodificador generativo (`decoder`). Los pesos de inferencia en precision completa se distribuyen en `weights/<voice>/model.safetensors`, con claves con el formato `<module>.<parameter>` y ajustes de arquitectura en `config.json`. El vocabulario, los vectores de estilo y los centros de bins de longitud se almacenan en `onnx/<voice>/voice.json`.

Las cuatro voces se desarrollaron a partir de habla sintetica generada con VoxCPM2, segun indica la model card. No se especifica el checkpoint exacto de Kokoro utilizado como punto de partida, ni el volumen de datos de entrenamiento, ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en TTS). La innovacion principal es el procesamiento de texto especifico del birmano: reglas de pronunciacion, lexico de excepciones, normalizacion de numeros a palabras habladas y fonemizacion del ingles mediante Misaki y eSpeak.

## Capacidades

- Sintesis de voz en birmano e ingles con cuatro voces predefinidas: `shoon`, `thazin`, `ko-banyar` y `htet-myat`.
- Salida de audio a 24 kHz mono.
- Procesamiento de texto mixto birmano-ingles con fonemizacion del ingles integrada.
- Normalizacion de numeros segun las reglas de lectura del birmano (desactivable con `--no-normalize-numbers`).
- Inferencia local en CPU mediante ONNX, con control del numero de hilos (`--threads`).
- Empaquetado para aplicacion movil en formato `.nara`, con checksums SHA256 para verificacion de integridad.
- No se documentan capacidades de clonacion de voz, control de emocion, tool calling ni razonamiento multi-paso (no aplicables a un modelo de TTS).

## Casos de uso

- Lectura por voz de contenido en birmano: el modelo convierte articulos, noticias o documentacion a audio, con normalizacion de cifras y fechas segun las reglas de lectura birmanas, lo que resulta util para publicaciones digitales y medios.
- Accesibilidad para personas con discapacidad visual: integracion en lectores de pantalla en movil gracias al empaquetado `.nara` y a la inferencia ONNX en CPU, sin necesidad de GPU dedicada.
- Asistentes de voz embebidos: las cuatro voces predefinidas permiten asignar identidades sonoras distintas a un mismo asistente o a varios personajes de una aplicacion.
- Aprendizaje de idiomas: generacion de audio en birmano e ingles para materiales de practica de pronunciacion y vocabulario, con texto mixto en ambos idiomas.
- Sistemas de anuncios y avisos: sintesis local de mensajes cortos en entornos sin conectividad, como terminales de transporte o paneles informativos.
- Prototipado de productos de voz: al estar bajo Apache 2.0 y con pesos safetensors/ONNX, permite integrar TTS en pipelines propios y evaluar calidad antes de escalar a un servicio comercial.
- Generacion de audio para aplicaciones moviles offline: el decodificador INT8 reduce requisitos de computo, lo que facilita su ejecucion en telefonos de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 2,8 GB, pero no se especifica el tamano de cada checkpoint ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible. La model card solo documenta inferencia en CPU mediante ONNX.
- Compatibilidad con GPU de consumo: no confirmada; el flujo documentado es CPU.
- Opciones de despliegue: ONNX Runtime (CPU, con `--threads` para fijar hilos), safetensors para integracion en Python 3.10 o superior, y paquete `.nara` para la aplicacion movil Nara.
- Latencia y throughput: no disponibles; la model card indica que el rendimiento depende del hardware, el formato de exportacion y la longitud del pasaje.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nara Mini v1 | no disponible | my, en | no disponible | Apache 2.0 | Hugging Face, ONNX, `.nara` |
| Kokoro-82M (base) | 82M | en y otros | no disponible | Apache 2.0 | Hugging Face |
| VoxCPM2 | no disponible | no disponible | no disponible | no disponible | Hugging Face |

La comparativa cuantitativa con alternativas de TTS en birmano no esta disponible en la informacion proporcionada; no se conocen modelos abiertos comparables con soporte documentado de este idioma.

## Limitaciones y advertencias

- La pronunciacion y la prosodia pueden variar segun el texto y la mezcla de idiomas; no se garantiza consistencia en textos mixtos birmano-ingles.
- La normalizacion de numeros sigue las reglas de lectura birmanas incluso en texto en ingles, lo que puede producir lecturas no deseadas si no se desactiva.
- Los pasajes largos se procesan en fragmentos mas cortos, lo que puede introducir discontinuidades en la prosodia.
- El rendimiento depende del hardware, del formato de exportacion y de la longitud del pasaje; no hay cifras publicadas de latencia ni de calidad (MOS).
- No se documenta el checkpoint exacto de Kokoro utilizado como base, lo que dificulta la reproducibilidad del entrenamiento.
- Las voces se desarrollaron a partir de habla sintetica generada con VoxCPM2; no se detalla el consentimiento ni la procedencia de las muestras originales.
- Riesgo de sesgos y de alucinacion acustica (pronunciaciones erroneas) no evaluado en la documentacion.
- Uso comercial permitido por la licencia Apache 2.0, pero las dependencias (Misaki, eSpeak) conservan sus propias licencias y deben verificarse por separado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yelin201875/Yelinvoice
- Sitio web de Nara Audio: https://naraaudio.app
- Kokoro-82M (modelo base): https://huggingface.co/hexgrad/Kokoro-82M
- VoxCPM2 (habla sintetica para las voces): https://huggingface.co/openbmb/VoxCPM2
