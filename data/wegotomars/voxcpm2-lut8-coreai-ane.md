# wegotomars/VoxCPM2-LUT8-CoreAI-ANE

## Resumen

VoxCPM2-LUT8-CoreAI-ANE es una conversión del modelo de síntesis de voz openbmb/VoxCPM2 para ejecutarse íntegramente en la Apple Neural Engine (ANE) de los chips Apple Silicon. La desarrolla el usuario wegotomars mediante su herramienta tinkerbox-ane, y su objetivo es permitir síntesis de voz multilingüe a 48 kHz con clonación de voz, diseño de voz y continuación de audio en hardware de consumo Apple, sin recurrir a GPU dedicada ni a servicios en la nube. Es relevante porque demuestra que un modelo TTS de arquitectura híbrida (LLM más difusión) puede desplegarse de forma local y energéticamente eficiente en un portátil o sobremesa Mac.

El modelo base VoxCPM2 combina dos modelos de lenguaje MiniCPM (principal y residual), un codificador de audio local y un transformer de difusión local, junto con un decodificador AudioVAE V2. Esta build concreta almacena las 28 capas del modelo principal como tablas de búsqueda k-means de 8 bits (LUT8, tamaño de grupo 32), lo que reduce el uso de memoria en torno al 30 % y acelera la inferencia entre un 7 % y un 17 % respecto a la build FP16, a costa de una fidelidad ligeramente inferior.

La relevancia práctica está en su naturaleza local y privada: todo el cómputo pesado ocurre en la ANE, mientras la tokenización, las proyecciones pequeñas, la cuantización escalar y el decodificador AudioVAE V2 se ejecutan en CPU, dejando la GPU inactiva. El contexto compartido entre texto, audio de referencia y audio generado es de 8.192 posiciones, y cada posición generada equivale a 160 ms de audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: LLM (MiniCPM principal y residual) + transformer de difusión local + AudioVAE V2; conversión Core AI para ANE |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8.192 posiciones compartidas entre texto, audio de referencia y audio generado (160 ms de audio por posición) |
| Tipos de cuantizacion | LUT8 (tablas de búsqueda k-means de 8 bits, grupo 32) para las 28 capas del modelo principal; cuantización escalar en CPU para componentes pequeños |
| Idiomas soportados | zh, en, ar, my, da, nl, fi, fr, de, el, he, hi, id, it, ja, km, ko, lo, ms, no, pl, pt, ru, es, sw, sv, tl, th, tr, vi (detección automática desde el texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería coreai); bundle con checkpoint, tokenizer, configuración, tablas de búsqueda en CPU y pesos AudioVAE |

## Arquitectura y entrenamiento

La arquitectura del modelo base VoxCPM2 es híbrida: dos modelos de lenguaje MiniCPM (uno principal y otro residual) se encargan de la modelización secuencial del texto y del audio, un codificador de audio local procesa la referencia y un transformer de difusión local genera las representaciones acústicas, que finalmente decodifica el AudioVAE V2. En esta build, los dos MiniCPM, el codificador de audio y el transformer de difusión se ejecutan completamente en la ANE, mientras que la tokenización, las proyecciones pequeñas, la cuantización escalar y el decodificador AudioVAE V2 se ejecutan en CPU. El modelo principal de 28 capas se almacena como LUT8 (k-means de 8 bits con grupo 32).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable de esta conversión es el uso de tablas de búsqueda k-means de 8 bits para el modelo principal, que reduce el uso de memoria en aproximadamente un 30 % y acelera la inferencia entre un 7 % y un 17 % frente a la build FP16, con una caída de fidelidad mínima (coseno ≥ 0,99967 en decodificación del modelo principal). El checkpoint original referenciado es `openbmb/VoxCPM2@32279effe8c19989596f05d353d1447f51d9e915`.

## Capacidades

- Síntesis de voz multilingüe a 48 kHz con detección automática del idioma a partir del texto.
- Clonación de voz a partir de una grabación de referencia (`mode="clone"`), con posibilidad de guardar y reutilizar el prompt de voz (`voice.save("voice.pt")`).
- Diseño de voz a partir de una descripción textual (`mode="design"`, parámetro `instruct`), por ejemplo "A warm, calm female voice".
- Continuación de audio (`mode="continuation"`), que prolonga una grabación de referencia; requiere su transcripción (`ref_text=`) o, en su defecto, usa el reconocimiento de voz on-device de Apple.
- Modo combinado clonación más continuación (`mode="clone_continuation"`).
- Generación en streaming: `model.stream()` devuelve fragmentos float32 reproducibles mientras se genera, que concatenados equivalen exactamente a la salida de `generate`.
- Soporte de semilla (`seed`) para reproducibilidad de la generación.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso; el modelo es específicamente de texto a voz.

## Casos de uso

- Audiolibros y narración local: el modelo sintetiza pasajes largos (21,8 s de audio en 5,20 s en un M5 Pro) con un multiplicador de tiempo real de 4,2×, lo que permite narrar textos extensos en un Mac sin conexión y sin enviar contenido a la nube.
- Asistentes de voz privados en macOS: la inferencia íntegra en ANE y CPU, con la GPU inactiva, permite integrar TTS en aplicaciones de escritorio que deben funcionar offline y preservar la privacidad del usuario.
- Clonación de voz para accesibilidad: a partir de una grabación de referencia se puede crear un prompt de voz reutilizable (`voice.pt`) para que personas con dificultades del habla generen mensajes con su propia voz.
- Diseño de voces para videojuegos y prototipado: el modo `design` con `instruct` permite generar voces con características descritas en texto sin necesidad de grabaciones, útil para maquetas rápidas de personajes.
- Doblaje y localización de contenido: con 30 idiomas soportados y detección automática, se pueden generar pistas de voz en distintos idiomas para vídeos o cursos, manteniendo una voz clonada consistente entre idiomas.
- Reproducción en streaming para interfaces conversacionales: `model.stream()` permite empezar a reproducir audio con las primeras palabras, reduciendo la latencia percibida en asistentes y chatbots de voz.
- Continuación de grabaciones existentes: el modo `continuation` prolonga una grabación con su transcripción, útil para completar tomas de voz o generar variantes de un mismo audio.

## Benchmarks y rendimiento

Mediciones del autor del 26 de octubre de 2026 en un Apple M5 Pro (`h17s`, 24 GiB), macOS 27.0.1, en caliente. El multiplicador de tiempo real es la duración del audio dividida por el tiempo de generación (mayor es más rápido); RTF es su inverso (menor es más rápido).

| Petición | Audio | Tiempo de generación | Multiplicador tiempo real | RTF | Energía ANE |
|---|---:|---:|---:|---:|---:|
| Saludo, voz automática | 4,5 s | 1,12 s | 4,0× | 0,25 | 2,0 J |
| Clonación de referencia corta | 3,4 s | 0,86 s | 3,9× | 0,26 | 2,0 J |
| Pasaje largo, voz automática | 21,8 s | 5,20 s | 4,2× | 0,24 | 12,2 J |

| Memoria | Pico |
|---|---:|
| Wired, incluidos pesos ANE | 2,7 GiB |
| Proceso Python | 0,42 GiB |

Precisión frente al VoxCPM2 original en CPU FP16 con entradas idénticas:

| Comprobación | LUT8 | FP16 |
|---|---|---|
| Prefill del modelo principal, coseno | ≥ 0,99995 | ≥ 0,99998 |
| Decodificación del modelo principal, coseno | ≥ 0,99967 | ≥ 0,99998 |
| Salida de difusión, coseno | ≥ 0,9996 | ≥ 0,9996 |
| Crecimiento de caché hasta 8.192 posiciones, coseno | 0,99998 | 0,99999 |
| Error medio de carácter en transcripción de 16 clips | 0,032 | 0,028 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, al tratarse de un modelo de texto a voz.

## Requisitos de hardware

- Plataforma obligatoria: macOS 27, Apple Silicon M1–M6 y Python 3.12 o 3.13. No hay soporte para GPU NVIDIA ni para otras plataformas.
- SoCs soportados: M1, M1 Pro, M1 Max, M1 Ultra, M2, M2 Pro, M2 Max, M2 Ultra, M3, M3 Pro, M3 Max (14 y 16 núcleos de CPU), M3 Ultra, M4, M4 Pro, M4 Max, M5, M5 Pro, M5 Max, M5 Ultra y M6.
- Memoria: pico de 2,7 GiB wired incluyendo pesos ANE y 0,42 GiB para el proceso Python en el M5 Pro de 24 GiB medido; cabe holgadamente en configuraciones de memoria unificada de gama base.
- Despliegue: paquete `tinkerbox-ane[speech]>=2.2.0`, con descarga del bundle específico del Mac mediante `download_bundle("voxcpm2-lut8", "wegotomars/VoxCPM2-LUT8-CoreAI-ANE", "v2.2.0")`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: multiplicador de tiempo real de 3,9× a 4,2× y RTF de 0,24 a 0,26 en M5 Pro, con energía ANE de 2,0 J por petición corta y 12,2 J en un pasaje largo.
- Repositorio de 5,0 GB, aunque el descargador obtiene únicamente el bundle correspondiente al Mac del usuario.

## Comparativa con modelos similares

| Modelo | Arquitectura | Contexto | Idiomas | Licencia | Plataforma |
|---|---|---|---|---|---|
| VoxCPM2-LUT8-CoreAI-ANE | Híbrida LLM + difusión, LUT8 | 8.192 posiciones | 30 idiomas | Apache-2.0 | Apple Silicon (ANE) |
| VoxCPM2-CoreAI-ANE (FP16) | Híbrida LLM + difusión, FP16 | 8.192 posiciones | 30 idiomas | Apache-2.0 | Apple Silicon (ANE) |
| openbmb/VoxCPM2 (original) | Híbrida LLM + difusión | 8.192 posiciones | 30 idiomas | Apache-2.0 | CPU/GPU genérica |

Frente a la build FP16 del mismo autor, la LUT8 usa aproximadamente un 30 % menos de memoria y es entre un 7 % y un 17 % más rápida, con una fidelidad ligeramente inferior (coseno de decodificación ≥ 0,99967 frente a ≥ 0,99998) y un mayor consumo energético por petición. Frente al VoxCPM2 original, esta conversión está especializada en Apple Silicon y no ofrece portabilidad a otras plataformas. No se dispone de datos para comparar con otros modelos TTS de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Dependencia total del ecosistema Apple: requiere macOS 27, Apple Silicon M1–M6 y Python 3.12 o 3.13; no funciona en Linux, Windows ni GPU NVIDIA.
- La cuantización LUT8 introduce una pérdida de fidelidad medible: el error medio de carácter en transcripción sube de 0,028 (FP16) a 0,032, y el coseno de decodificación baja de ≥ 0,99998 a ≥ 0,99967.
- El consumo energético por petición no es inferior al de la build FP16: LUT8 corre algo más rápido pero con mayor potencia en la ANE.
- El modo `continuation` requiere la transcripción de la referencia (`ref_text=`); sin ella, depende del reconocimiento de voz on-device de Apple, lo que puede introducir errores en la continuación.
- Riesgo de alucinación y artefactos propio de los modelos generativos de audio: no se documentan evaluaciones de robustez ante textos ambiguos, ruido en la referencia o voces fuera de distribución.
- No se documentan sesgos demográficos, acentos o variedades dialectales cubiertas dentro de cada idioma; el soporte por idioma no garantiza calidad uniforme en todos ellos.
- Licencia Apache-2.0 para pesos, activos convertidos y código upstream, con aviso adicional en el fichero NOTICE; se recomienda revisar dicho aviso antes de un uso comercial.
- El modelo base es openbmb/VoxCPM2; esta build no incluye datos sobre el entrenamiento original ni garantías de soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/wegotomars/VoxCPM2-LUT8-CoreAI-ANE
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- Build FP16 de referencia: https://huggingface.co/wegotomars/VoxCPM2-CoreAI-ANE
- Repositorio tinkerbox-ane: https://github.com/WeGoToMars/tinkerbox
- Checkpoint original: `openbmb/VoxCPM2@32279effe8c19989596f05d353d1447f51d9e915`
- Licencia: https://huggingface.co/wegotomars/VoxCPM2-LUT8-CoreAI-ANE/blob/main/LICENSE
- Aviso legal: https://huggingface.co/wegotomars/VoxCPM2-LUT8-CoreAI-ANE/blob/main/NOTICE
