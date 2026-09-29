# WilburDev/supertonic-3-mobile

## Resumen

Supertonic 3 es un modelo de síntesis de voz (text-to-speech) de pesos abiertos desarrollado por Supertone, con aproximadamente 99 millones de parámetros, diseñado para ejecutarse íntegramente en CPU mediante ONNX Runtime, sin GPU, sin nube y sin API. Cubre 31 idiomas y se distribuye bajo licencia OpenRAIL-M. Esta ficha corresponde a WilburDev/supertonic-3-mobile, un reempaquetado del modelo base Supertone/supertonic-3 orientado a inferencia rápida en dispositivo con sherpa-onnx a través de `OfflineTtsSupertonicModelConfig`.

El cambio principal respecto al modelo base no afecta a los pesos entrenados, sino al grafo exportado: únicamente se reescribe `vector_estimator.int8.onnx`, la red de flow-matching que se ejecuta una vez por cada paso de denoising y que domina el tiempo de síntesis. En el grafo original, cerca del 85 % de ese tiempo se consume en capas `Conv1d` puntuales (kernel 1) que permanecen en fp32 incluso en la exportación int8; el script `conv2mm.py` las reescribe como `Transpose → MatMul → Transpose` y aplica cuantización int8 dinámica por canal a las MatMul, de modo que ONNX Runtime emplea sus kernels GEMM enteros. El resultado es más rápido y, además, más fiel al modelo fp32 (error relativo del 4,2 % frente al 4,5 % de la exportación int8 original en un paso).

Es relevante ahora porque demuestra una vía práctica de llevar TTS multilingüe de calidad a dispositivos móviles antiguos sin conectividad. El propio autor indica que lo utiliza la aplicación Translaty para voz totalmente offline. En una Galaxy Note 8 de 2017 (Exynos 8895, 4 hilos) alcanza un RTF de 0,39 con 4 pasos de denoising y un UTMOS de 4,42, superando al empaquetado int8 de sherpa-onnx (RTF 0,87 y UTMOS 3,80 en las mismas condiciones).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pipeline TTS modular en ONNX: predictor de duración, codificador de texto, red de flow-matching (`vector_estimator`) para denoising iterativo y vocoder |
| Parámetros totales | 99M (modelo base Supertonic 3) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (modelo TTS; la longitud de texto manejada por `text_encoder` no se especifica) |
| Tipos de cuantización | int8 dinámico por canal (`vector_estimator`, `vocoder`) y fp32 (`duration_predictor`, `text_encoder`) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL-M (heredada de Supertonic 3) |
| Formato de pesos | ONNX (int8 y fp32), más `tts.json`, `unicode_indexer.bin` y `voice.bin` |

## Arquitectura y entrenamiento

El modelo sigue un diseño de TTS por etapas encadenadas, cada una exportada como grafo ONNX independiente. `duration_predictor.onnx` estima la duración de la salida a partir del texto; `text_encoder.onnx` convierte la secuencia de entrada en representaciones latentes; `vector_estimator.onnx` es la red de flow-matching que se ejecuta repetidamente (4 u 8 pasos de denoising configurables) para transformar ruido en la representación acústica; y `vocoder.int8.onnx` convierte esa representación en forma de onda. Los ficheros `tts.json`, `unicode_indexer.bin` y `voice.bin` aportan la configuración, el mapeo de caracteres y los embeddings de las voces.

En este repositorio, `duration_predictor.onnx` y `text_encoder.onnx` son los ficheros fp32 originales del modelo base, mientras que `vocoder.int8.onnx`, `tts.json`, `unicode_indexer.bin` y `voice.bin` proceden del paquete `sherpa-onnx-supertonic-3-tts-int8-2026-05-11` de sherpa-onnx. La única modificación respecto al material original es la reescritura y cuantización de `vector_estimator.int8.onnx` descrita en el Resumen. Se probó a cuantizar el vocoder con la misma técnica y se descartó, ya que costaba aproximadamente 0,6 puntos de UTMOS.

No hay información disponible en los materiales proporcionados sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de ajuste en el modelo base Supertonic 3. El modelo base se publicó en abril de 2026 según la model card, y `voice.bin` contiene 10 voces identificadas internamente con los identificadores `sid`: 0–4 corresponden a voces femeninas (F1–F5) y 5–9 a masculinas (M1–M5).

## Capacidades

- Síntesis de voz multilingüe en 31 idiomas, con selección de idioma mediante el parámetro `extra: {"lang": "<código>"}`.
- Diez voces predefinidas seleccionables por identificador: cinco femeninas (F1–F5) y cinco masculinas (M1–M5).
- Control del equilibrio velocidad/calidad mediante el número de pasos de denoising: 4 pasos priorizan latencia y 8 pasos priorizan calidad.
- Inferencia completamente local en CPU mediante ONNX Runtime, sin dependencia de servicios en la nube ni de GPU.
- Integración con sherpa-onnx para despliegue en dispositivo, incluido Android.
- Lectura estable según el proveedor del modelo base, con reducción de fallos de repetición y omisión respecto a Supertonic 2, especialmente en enunciados cortos y largos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente: es un modelo de síntesis de voz, no un modelo de lenguaje generativo.
- No dispone de entrada de audio (no es un modelo de reconocimiento de voz) ni de capacidades de visión.

## Casos de uso

- Lectura offline en aplicaciones móviles: es el escenario del que parte este reempaquetado, ya que la app Translaty lo emplea para ofrecer voz sin conexión. El modelo se ejecuta en CPU y cabe sin problema en el almacenamiento de un teléfono (el repositorio ocupa 0,1 GB).
- Accesibilidad para personas con discapacidad visual: un lector de pantalla puede convertir texto de la interfaz en voz sintetizada localmente, sin enviar contenido del usuario a ningún servidor y funcionando en modo avión.
- Asistentes de navegación y conducción: la generación local con RTF inferior a 1 permite anunciar indicaciones en tiempo real sin latencia de red ni consumo de datos móviles.
- Traducción con salida de voz: combinado con un traductor de texto, el modelo puede leer en cualquiera de sus 31 idiomas la traducción resultante, lo que encaja con el caso de uso declarado de Translaty.
- Dispositivos IoT y kioscos sin conectividad: cajas registradoras, paneles informativos, ascensores o electrodomésticos pueden incorporar avisos hablados ejecutando el modelo en un SoC modesto.
- Generación de audiolibros y doblaje ligero: los 8 pasos de denoising ofrecen un UTMOS de 4,51, adecuado para producciones donde se prioriza el coste por hora de cómputo frente a la expresividad emocional máxima.
- Señalización y anuncios automatizados: lectura de avisos en transporte público o aeropuertos en varios idiomas desde un único dispositivo local.
- Verificación automatizada de pipelines de audio: el autor valida que Whisper large-v3-turbo transcribe correctamente en ida y vuelta los 14 idiomas probados, una técnica útil como test de regresión en sistemas de TTS.

## Benchmarks y rendimiento

Mediciones del autor en una Galaxy Note 8 (Exynos 8895, 2017, 4 hilos). RTF es tiempo de síntesis dividido por duración del audio (menor es mejor); UTMOS22 calculado sobre una frase en inglés.

| Modelo | Pasos de denoising | RTF | UTMOS |
|---|---|---|---|
| sherpa-onnx int8 original | 8 | 1,65 | 4,52 |
| sherpa-onnx int8 original | 4 | 0,87 | 3,80 |
| Este repositorio | 4 | 0,39 | 4,42 |
| Este repositorio | 8 | 0,67 | 4,51 |

Además, el autor reporta un error relativo respecto al modelo fp32 de 4,2 % en un paso para este repositorio, frente al 4,5 % de la exportación int8 original. La validación con Whisper large-v3-turbo transcribe correctamente los 14 idiomas que se probaron, extremo que conviene tratar como verificación parcial y no como cobertura de los 31 idiomas declarados.

## Requisitos de hardware

- No requiere VRAM: la inferencia está diseñada para ejecutarse en CPU mediante ONNX Runtime.
- No necesita GPU; el modelo funciona en hardware móvil de gama media o baja, como demuestra la medición en un Exynos 8895 de 2017.
- Tamaño del repositorio: 0,1 GB, por lo que cabe holgadamente en el almacenamiento de cualquier teléfono o dispositivo embebido.
- Despliegue recomendado mediante sherpa-onnx (`OfflineTtsSupertonicModelConfig`) y ONNX Runtime.
- Latencia medida: RTF de 0,39 con 4 pasos y 0,67 con 8 pasos en la Galaxy Note 8. Un RTF inferior a 1 implica síntesis más rápida que la reproducción en tiempo real.
- Con 4 pasos se obtiene el menor coste de cómputo (RTF 0,39) manteniendo un UTMOS de 4,42; con 8 pasos se gana calidad (UTMOS 4,51) a costa de un RTF de 0,67.
- No hay datos de rendimiento en GPU, en servidores x86 ni con frameworks distintos de ONNX Runtime en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WilburDev/supertonic-3-mobile | 99M | 31 | ONNX int8 y fp32 | OpenRAIL-M | HuggingFace |
| Supertone/supertonic-3 (modelo base) | 99M | 31 | ONNX | OpenRAIL-M | HuggingFace |
| sherpa-onnx-supertonic-3-tts-int8-2026-05-11 | 99M | 31 | ONNX int8 | OpenRAIL-M (heredada) | HuggingFace / sherpa-onnx |
| Supertonic 2 | No disponible | 5 | No disponible | No disponible | HuggingFace |

La diferencia entre las tres primeras filas es exclusivamente de empaquetado y cuantización, no de pesos: todas parten del mismo modelo Supertonic 3 de Supertone. La ventaja de este repositorio se limita al rendimiento en CPU (RTF 0,39 frente a 0,87 con 4 pasos) con un UTMOS comparable o superior. No se dispone de datos de parámetros, licencia exacta ni benchmarks de Supertonic 2 más allá de que cubría 5 idiomas.

## Limitaciones y advertencias

- La licencia es OpenRAIL-M, que incluye restricciones de uso más allá de las licencias permisivas habituales; es imprescindible revisar el fichero `LICENSE` del repositorio antes de un uso comercial.
- Es un modelo de síntesis de voz: no razona, no genera texto, no ejecuta herramientas y no puede usarse como sustituto de un modelo de lenguaje.
- El vocoder no se ha cuantizado int8 porque el intento costaba aproximadamente 0,6 puntos de UTMOS, por lo que el ahorro de rendimiento y de tamaño es menor de lo que sería posible.
- La optimización int8 introduce un error relativo del 4,2 % respecto al modelo fp32 en un paso de denoising; en usos que exijan máxima fidelidad acústica puede ser preferible el modelo base sin cuantizar.
- La model card del modelo base reconoce históricamente fallos de repetición y omisión en la lectura, mitigados en la versión 3 pero no necesariamente eliminados en todos los idiomas y longitudes de texto.
- Solo 14 de los 31 idiomas declarados han sido verificados mediante transcripción con Whisper large-v3-turbo; la calidad en el resto de idiomas no está validada en los materiales disponibles.
- No hay información sobre sesgos de voz, cobertura de acentos, dialectos ni representación demográfica de las 10 voces incluidas.
- Los benchmarks provienen de una única medición en una Galaxy Note 8 con 4 hilos y una sola frase en inglés; los valores de UTMOS y RTF pueden no reproducirse en otro hardware ni en otros idiomas.
- El repositorio no registra descargas ni valoraciones, y fue actualizado por última vez el mismo día de su creación, por lo que carece de trayectoria de mantenimiento verificable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/WilburDev/supertonic-3-mobile
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Página oficial de Supertonic 3: https://supertonic3.github.io/
- Anuncio de Supertonic 3 en Supertone: https://www.supertone.ai/en/work/faster-and-more-accurate-across-31-languages----introducing-supertonic-3
- sherpa-onnx (repositorio): https://github.com/k2-fsa/sherpa-onnx
- Ficha en The AI Bench: https://theaibench.ai/models/supertonic-3/
- Réplica del modelo base por terceros: https://huggingface.co/smdesai/supertonic-3
