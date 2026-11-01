# wegotomars/VoxCPM2-CoreAI-ANE

## Resumen

VoxCPM2-CoreAI-ANE es una conversión del modelo de síntesis de voz openbmb/VoxCPM2 para ejecutarse sobre la Apple Neural Engine (ANE) mediante la librería coreai y el runtime tinkerbox-ane. Lo publica el usuario wegotomars y su objetivo es claro: llevar un sistema TTS multilingüe de 48 kHz con clonación de voz y diseño de voz a los chips Apple Silicon (M1 a M6) sin emplear la GPU, de modo que esta quede libre para otras tareas. El modelo base, VoxCPM2, combina un modelo de lenguaje MiniCPM principal y otro residual, un codificador de audio local y un transformador de difusión local, todos ellos ejecutados íntegramente en la ANE en esta conversión.

La arquitectura subyacente es la del VoxCPM2 original: los componentes de modelado de lenguaje y difusión corren en la ANE, mientras que la tokenización, las proyecciones pequeñas, la cuantización escalar y el decodificador AudioVAE V2 se ejecutan en la CPU. El contexto compartido entre texto, audio de referencia y audio generado es de 8.192 posiciones, y cada posición generada equivale a 160 ms de audio. El repositorio ocupa 5,3 GB y los pesos se distribuyen en formato safetensors con precisión fp16.

Su relevancia actual radica en que demuestra que un TTS de alta calidad con clonación y diseño de voz puede ejecutarse en hardware de consumo Apple con latencias de tiempo real (multiplicador de tiempo real en torno a 3,7× y RTF de 0,27 en un M5 Pro) y un consumo energético muy bajo en la ANE (2,6 J para una locución de 4,5 s). Está pensado para desarrolladores que quieran integrar síntesis de voz local, privada y multilingüe en aplicaciones macOS sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje MiniCPM principal y residual + codificador de audio local + transformador de difusión local + decodificador AudioVAE V2 (base VoxCPM2) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 posiciones (texto, audio de referencia y audio generado comparten contexto; cada posición generada = 160 ms de audio) |
| Tipos de cuantizacion | fp16 (variante LUT8 disponible en VoxCPM2-LUT8-CoreAI-ANE, con menor uso de memoria) |
| Idiomas soportados | zh, en, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi (30 idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bundle coreai con checkpoint, tokenizador, configuración, tablas de búsqueda CPU y pesos AudioVAE) |

## Arquitectura y entrenamiento

La conversión mantiene la arquitectura del VoxCPM2 original de openbmb: un modelo de lenguaje principal MiniCPM y un modelo residual que operan sobre un contexto compartido de 8.192 posiciones, un codificador de audio local, un transformador de difusión local para la generación acústica y un decodificador AudioVAE V2 que convierte las representaciones latentes en audio a 48 kHz. En esta versión para Apple, los dos modelos de lenguaje, el codificador de audio y el transformador de difusión se ejecutan completamente en la ANE; la tokenización, las proyecciones pequeñas, la cuantización escalar y el decodificador AudioVAE V2 se ejecutan en la CPU.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La innovación técnica destacable de esta ficha es la propia conversión a la ANE: el autor reporta una fidelidad numérica frente al VoxCPM2 original en CPU FP16 con coseno ≥ 0,99998 en prefill y decodificación del modelo principal, ≥ 0,9996 en la salida de difusión y 0,99999 en el crecimiento de caché hasta 8.192 posiciones, además de un error medio de caracteres de 0,028 en la transcripción de 16 clips. El checkpoint original referenciado es openbmb/VoxCPM2@32279effe8c19989596f05d353d1447f51d9e915.

## Capacidades

- Síntesis de voz multilingüe a 48 kHz en 30 idiomas, con detección automática del idioma a partir del texto.
- Clonación de voz a partir de una grabación de referencia (`mode="clone"`), con posibilidad de guardar el prompt de voz (`voice.save`) y reutilizarlo.
- Diseño de voz a partir de una descripción textual (`mode="design"`, por ejemplo "A warm, calm female voice").
- Continuación de audio (`mode="continuation"`), que prolonga una grabación de referencia y requiere su transcripción (`ref_text=`); si no se proporciona, se obtiene mediante el reconocimiento de voz en el dispositivo de Apple.
- Modo combinado de clonación y continuación (`mode="clone_continuation"`).
- Generación en streaming (`model.stream`), con reproducción que puede comenzar con las primeras palabras y piezas float32 a la frecuencia de muestreo del modelo.
- Control de reproducibilidad mediante semilla (`seed`).
- Ejecución completamente local en Apple Silicon, sin uso de GPU.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; se trata de un modelo especializado en texto a voz.

## Casos de uso

- Audiolibros y narración por lotes: el modelo puede sintetizar pasajes largos manteniendo un contexto compartido de 8.192 posiciones; en las pruebas del autor, un pasaje de 21,9 s se generó en 5,73 s en un M5 Pro, lo que permite procesar textos extensos con una velocidad superior a la de tiempo real.
- Asistentes de voz locales en macOS: al ejecutarse íntegramente en la ANE con un pico de memoria cableada de 3,9 GiB, puede integrarse en aplicaciones de escritorio que necesitan privacidad total y no quieren enviar texto a la nube.
- Clonación de voz para accesibilidad: a partir de una grabación corta de referencia (`create_voice_clone_prompt`), se puede preservar la voz de una persona para lectura de pantalla o comunicación asistida, guardando el prompt en un fichero `voice.pt` reutilizable.
- Diseño de voces para videojuegos y contenidos: el modo `design` permite generar voces nuevas a partir de descripciones textuales, útil para prototipado rápido de personajes sin necesidad de actores de doblaje.
- Doblaje y localización multilingüe: con 30 idiomas soportados y detección automática, se puede generar una misma locución en varios idiomas manteniendo una voz clonada consistente entre ellos.
- Continuación de grabaciones existentes: el modo `continuation` permite alargar una grabación con texto nuevo respetando el tono y el estilo, útil para completar tomas de podcast o entrevistas.
- Reproducción interactiva en tiempo real: el streaming arranca en 0,26 s para un saludo corto y 0,32 s para un pasaje de 51 s, lo que habilita interfaces conversacionales con respuesta de voz casi inmediata.

## Benchmarks y rendimiento

Datos medidos por el autor el 26 de octubre de 2026 en un Apple M5 Pro (`h17s`, 24 GiB) con macOS 27.0.1 en estado caliente. El multiplicador de tiempo real es la duración del audio dividida entre el tiempo de generación (más alto es más rápido); el RTF es su inverso (más bajo es más rápido).

| Petición | Audio | Tiempo de generación | Multiplicador tiempo real | RTF | Energía ANE |
|---|---:|---:|---:|---:|---:|
| Saludo, voz automática | 4,5 s | 1,21 s | 3,7× | 0,27 | 2,6 J |
| Clonación con referencia corta | 3,8 s | 1,04 s | 3,7× | 0,27 | 2,1 J |
| Pasaje largo, voz automática | 21,9 s | 5,73 s | 3,8× | 0,26 | 10,7 J |

| Memoria | Pico |
|---|---:|
| Cableada, incluidos pesos ANE | 3,9 GiB |
| Proceso Python | 0,46 GiB |

Fidelidad frente al VoxCPM2 original en CPU FP16 con entradas idénticas:

| Comprobación | Resultado |
|---|---|
| Prefill y decodificación del modelo principal, coseno | ≥ 0,99998 |
| Salida de difusión, coseno | ≥ 0,9996 |
| Crecimiento de caché hasta 8.192 posiciones, coseno | 0,99999 |
| Transcripción de 16 clips, error medio de caracteres | 0,028 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K, que no aplican a un modelo de texto a voz.

## Requisitos de hardware

- Plataforma obligatoria: macOS 27 sobre Apple Silicon M1 a M6, con Python 3.12 o 3.13.
- SoCs soportados explícitamente: M1, M1 Pro, M1 Max, M1 Ultra, M2, M2 Pro, M2 Max, M2 Ultra, M3, M3 Pro, M3 Max (14 y 16 núcleos de CPU), M3 Ultra, M4, M4 Pro, M4 Max, M5, M5 Pro, M5 Max, M5 Ultra y M6.
- Memoria: pico cableado de 3,9 GiB incluidos los pesos en la ANE y 0,46 GiB para el proceso Python, medido en un M5 Pro de 24 GiB.
- No requiere GPU: la GPU permanece inactiva; el cómputo pesado va a la ANE y el resto a la CPU.
- Despliegue: runtime tinkerbox-ane (paquete `tinkerbox-ane[speech]>=2.2.0`), con descarga del bundle específico del Mac mediante `download_bundle`. No se documentan opciones para vLLM, llama.cpp, Ollama o TGI, que no aplican a este formato coreai.
- Latencia y throughput: multiplicador de tiempo real de 3,7× a 3,8× y RTF de 0,26 a 0,27 en M5 Pro; inicio de streaming en 0,26 s para un saludo corto y 0,32 s para un pasaje de 51 s.
- Existe una variante con tablas de búsqueda de menor consumo de memoria publicada como VoxCPM2-LUT8-CoreAI-ANE.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Plataforma | Notas |
|---|---|---|---|---|---|
| VoxCPM2-CoreAI-ANE (esta ficha) | no disponible | 8.192 posiciones | Apache-2.0 | Apple Silicon (ANE), macOS 27 | Conversión fp16; RTF 0,26-0,27 en M5 Pro; 30 idiomas; clonación y diseño de voz |
| openbmb/VoxCPM2 (modelo base) | no disponible | 8.192 posiciones | Apache-2.0 | Genérica (CPU/GPU) | Referencia de fidelidad; el autor reporta coseno ≥ 0,9996 en difusión frente a esta versión |
| VoxCPM2-LUT8-CoreAI-ANE | no disponible | 8.192 posiciones | Apache-2.0 | Apple Silicon (ANE), macOS 27 | Variante con tablas de búsqueda y menor uso de memoria, publicada por el mismo autor |

No se dispone de información sobre otros modelos TTS comparables en la documentación proporcionada, por lo que la comparación se limita a las variantes del propio VoxCPM2.

## Limitaciones y advertencias

- Dependencia estricta de plataforma: solo funciona en macOS 27 con Apple Silicon M1-M6 y Python 3.12 o 3.13; no es desplegable en Linux, Windows ni GPUs NVIDIA.
- El modelo base no documenta en esta ficha los datos de entrenamiento ni los sesgos conocidos; al ser un sistema TTS multilingüe, cabe esperar sesgos de pronunciación y prosodia según el idioma y el acento, aunque no se cuantifican.
- Riesgo de alucinación acústica: como todo modelo generativo de audio, puede producir artefactos, pronunciaciones incorrectas o prosodia anómala en textos fuera de distribución; el autor reporta un error medio de caracteres de 0,028 en su conjunto de 16 clips, pero no se detalla la composición de ese conjunto.
- La clonación de voz plantea riesgos éticos y legales (suplantación de identidad, deepfakes); la licencia Apache-2.0 no exime del cumplimiento de la normativa aplicable sobre voz y datos personales.
- El modo `continuation` requiere la transcripción de la referencia (`ref_text=`); sin ella, depende del reconocimiento de voz en el dispositivo de Apple, lo que puede introducir errores en la continuación.
- La variante LUT8 existe precisamente porque la fp16 consume más memoria; en equipos con menos RAM unificada conviene evaluar esa alternativa.
- No se documentan capacidades de tool calling, agentes ni razonamiento; no debe emplearse como modelo de propósito general.
- El repositorio tiene solo 34 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wegotomars/VoxCPM2-CoreAI-ANE
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Variante LUT8: https://huggingface.co/wegotomars/VoxCPM2-LUT8-CoreAI-ANE
- Runtime tinkerbox-ane: https://github.com/WeGoToMars/tinkerbox
- Checkpoint original referenciado: openbmb/VoxCPM2@32279effe8c19989596f05d353d1447f51d9e915
- Licencia y aviso legal del repositorio: LICENSE y NOTICE en el propio repositorio de HuggingFace
