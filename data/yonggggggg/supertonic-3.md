# yonggggggg/supertonic-3

## Resumen

Supertonic 3 es un sistema de síntesis de voz (text-to-speech, TTS) disenado para inferencia local en dispositivo, desarrollado por Supertone. A diferencia de los TTS basados en servicios en la nube, este modelo se ejecuta integramente mediante ONNX Runtime en el hardware del usuario, sin necesidad de llamadas a servidores externos para la síntesis. La version 3 amplia la cobertura linguistica de las 5 lenguas de Supertonic 2 hasta 31 idiomas, mejora la estabilidad de lectura (reduccion de fallos de repeticion y omision) y aumenta la similitud con el hablante original en el conjunto de lenguas compartidas.

El modelo se distribuye como pesos abiertos en formato ONNX, con un tamano de repositorio de aproximadamente 0,4 GB, lo que lo situa en la categoria de TTS ultraligero apto para ejecucion on-device. Incluye estilos de voz predefinidos para inferencia local inmediata y soporta etiquetas de expresion simples como `<laugh>`, `<breath>` y `<sigh>`. La libreria asociada (`supertonic`) se distribuye via PyPI y descarga los assets del modelo desde Hugging Face en la primera ejecucion.

Su relevancia actual radica en la combinacion de cobertura multilingue amplia (31 idiomas), huella de almacenamiento reducida y ejecucion completamente local, lo que lo hace atractivo para aplicaciones de sintesis de voz con requisitos de privacidad, latencia baja o funcionamiento offline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX para TTS; detalles internos no publicados en la informacion disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (no aplica como contexto de texto; entrada es texto a sintetizar) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | openrail |
| Formato de pesos | ONNX |
| Tamano del repositorio | 0,4 GB |
| Libreria | supertonic (Python SDK via PyPI) |
| Runtime | ONNX Runtime (ejecucion local, sin nube) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo (tipo de red, numero de parametros, capas, mecanismos de atencion ni componentes acoplados como vocoder o encoder de texto). El modelo se distribuye en formato ONNX y se ejecuta mediante ONNX Runtime, lo que indica un diseno orientado a portabilidad y despliegue en dispositivo. La libreria `supertonic` gestiona la descarga de assets y la sintesis.

En cuanto a entrenamiento, no se han publicado en la informacion proporcionada datos sobre volumen de tokens, composicion del dataset, uso de RLHF/DPO ni tecnicas de alineacion. Lo que si se documenta como cambios de la version 3 respecto a la 2 es: ampliacion de 5 a 31 idiomas, mayor estabilidad de lectura con menos fallos de repeticion y omision (especialmente en enunciados cortos y largos), mayor similitud de hablante en el conjunto de lenguas compartidas y soporte de etiquetas de expresion. No se detalla ninguna innovacion arquitectonica como decodificacion especulativa o attention linear.

## Capacidades

- Sintesis de voz multilingue en 31 idiomas, incluyendo espanol, ingles, coreano, japones, arabe, hindi y la mayoria de lenguas europeas.
- Ejecucion completamente local mediante ONNX Runtime, sin dependencia de la nube para la sintesis.
- Estilos de voz predefinidos incluidos en el paquete de pesos abiertos para inferencia local inmediata.
- Soporte de estilos de voz personalizados zero-shot: la model card referencia un Voice Builder para crear JSON de estilo de voz a partir de audio de referencia, con embeddings descargables para Supertonic 2 y Supertonic 3.
- Etiquetas de expresion simples: `<laugh>`, `<breath>`, `<sigh>`.
- Mejora de estabilidad de lectura: menos fallos de repeticion y omision en enunciados cortos y largos.
- SDK de Python (`supertonic`) con API de sintesis (`TTS.synthesize`) y guardado de audio (`save_audio`).
- No se documenta soporte de tool calling, agentes, vision ni audio de entrada; es un modelo TTS texto-a-voz.

## Casos de uso

- Atencion al cliente automatizada: sintesis local de respuestas en centros de llamadas con voces de estilo "call center" (la model card incluye un ejemplo en ingles con la frase "Good morning, thank you for calling. How can I help you today?"), reduciendo latencia y evitando enviar texto del cliente a servicios externos.
- Audiolibros y narracion: la model card muestra ejemplos de audiolibro en ingles y japones; el modelo puede narrar pasajes largos con estabilidad de lectura mejorada y etiquetas de respiracion y suspiro para naturalidad.
- Locucion de noticias y boletines: ejemplo de la model card con texto informativo en ingles; util para generar locuciones de actualidad con voces predefinidas o personalizadas.
- Voces de personaje en videojuegos y narrativa interactiva: la model card incluye ejemplos de voz de personaje en japones y de personaje anciano en coreano, con soporte de etiquetas de expresion como `<laugh>`.
- Asistentes de voz on-device y sistemas embebidos: al ejecutarse con ONNX Runtime y un repositorio de 0,4 GB, puede integrarse en aplicaciones locales con requisitos de privacidad u operacion offline.
- Accesibilidad y lectura de textos: sintesis de contenido escrito en 31 idiomas para lectores de pantalla o interfaces de accesibilidad, con SDK de Python para integracion en aplicaciones de escritorio.
- Doblaje y localizacion de contenido: cobertura de 31 idiomas y estilos de voz personalizados zero-shot permiten generar pistas de voz para contenido multimedia en multiples lenguas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos (MOS, similitud de hablante, WER, latencia) en la informacion disponible. La model card indica de forma cualitativa mejoras en estabilidad de lectura y similitud de hablante respecto a Supertonic 2, pero sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio de 0,4 GB sugiere una huella de memoria reducida, pero no se publican cifras oficiales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no disponible de forma explicita; el diseno on-device con ONNX Runtime sugiere ejecucion en CPU y posibles aceleraciones por hardware, pero no se confirma en la informacion disponible.
- Opciones de despliegue: ONNX Runtime mediante la libreria `supertonic` (SDK de Python); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo TTS ONNX).
- Latencia y throughput estimados: no disponible; la model card se describe como "lightning fast" pero no aporta cifras.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de benchmarks ni especificaciones de modelos comparables (por ejemplo, otros TTS multilingues on-device) para establecer una comparativa numerica fiable. Los datos disponibles no permiten comparar parametros, contexto, rendimiento ni licencia frente a alternativas concretas.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Supertonic 3 | no disponible | no aplica | 31 | openrail | ONNX |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se detallan sesgos conocidos del modelo en la informacion disponible; al ser un TTS multilingue, cabe esperar variacion de calidad entre idiomas, pero no se documenta.
- Riesgo de errores de pronunciacion, repeticion u omision: la version 3 declara reducirlos, pero no se aportan tasas de error ni metricas.
- Cobertura de 31 idiomas declarada, pero sin datos de calidad por idioma; la similitud de hablante se menciona solo para el conjunto de lenguas compartidas con Supertonic 2.
- La licencia openrail impone condiciones; es necesario revisar los terminos concretos antes de uso comercial, ya que la informacion disponible no detalla restricciones especificas.
- Los estilos de voz personalizados zero-shot requieren el Voice Builder; los embeddings descargables se obtienen mediante compra, lo que puede condicionar el uso de voces personalizadas.
- No se publican requisitos de hardware, latencias ni benchmarks, lo que dificulta planificar capacidad en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el 2026-11-11; conviene verificar la autoria y procedencia de esta copia del modelo (el ID de Hugging Face es `yonggggggg/supertonic-3`, mientras que la model card referencia `Supertone/supertonic-3`).

## Enlaces

- Hugging Face (copia listada): https://huggingface.co/yonggggggg/supertonic-3
- Hugging Face (referencia en model card): https://huggingface.co/Supertone/supertonic-3
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/Supertone/supertonic-3
- Repositorio de codigo en GitHub: https://github.com/supertone-inc/supertonic
- SDK de Python en PyPI: https://pypi.org/project/supertonic/
- Demo de muestras de audio: https://supertonic3.github.io/
- Supertonic Voice Builder: https://supertonic.supertone.ai/voice-builder
