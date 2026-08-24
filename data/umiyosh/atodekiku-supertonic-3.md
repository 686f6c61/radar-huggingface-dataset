# umiyosh/atodekiku-supertonic-3

## Resumen

AtodeKiku Supertonic 3 es una distribución espejo independiente del modelo de síntesis de voz Supertonic 3, desarrollado por Supertone Inc. Se trata de un sistema de text-to-speech (TTS) de código abierto, ligero y pensado para ejecutarse completamente en local, sin necesidad de GPU, nube ni API externa. El modelo cuenta con 99 millones de parámetros y soporta 31 idiomas, lo que supone una ampliación significativa respecto a la versión anterior (Supertonic 2, que solo cubría 5 idiomas). Su arquitectura se basa en ONNX Runtime, lo que permite una inferencia rápida en CPU y una integración sencilla en dispositivos de bajo consumo. Este mirror concreto (`umiyosh/atodekiku-supertonic-3`) garantiza una distribución inmutable y verificada mediante SHA-256 de los artefactos, lo que aporta trazabilidad y reproducibilidad en entornos de producción.

El modelo se distribuye bajo la licencia BigScience OpenRAIL-M, que permite uso comercial con restricciones específicas. Su relevancia actual radica en ofrecer una alternativa de TTS multilingüe y de alta calidad que no requiere infraestructura especializada, ideal para aplicaciones de accesibilidad, asistentes de voz y sistemas embebidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Text-to-speech (TTS) basado en ONNX Runtime, con cuatro modelos ONNX y un indexador Unicode |
| Parametros totales | 99 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (no aplica a TTS, aunque se mencionan mejoras en estabilidad de lectura para frases cortas y largas) |
| Tipos de cuantizacion | no disponible (los artefactos se distribuyen en formato ONNX, sin cuantización específica documentada) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience OpenRAIL-M |
| Formato de pesos | ONNX (cuatro modelos) |

## Arquitectura y entrenamiento

La arquitectura interna de Supertonic 3 no se detalla públicamente en la documentación disponible. Se sabe que el sistema se compone de cuatro modelos ONNX que trabajan conjuntamente, junto con un indexador Unicode y diez estilos de voz predefinidos. El modelo está optimizado para ONNX Runtime, lo que permite su ejecución en CPU sin GPU. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO). La información disponible indica que Supertonic 3 mejora la estabilidad de lectura, reduciendo fallos de repetición y omisión en frases cortas y largas, y aumenta la similitud del hablante en comparación con Supertonic 2. No se mencionan innovaciones técnicas específicas como atención lineal o decodificación especulativa.

## Capacidades

- Síntesis de voz multilingüe: soporta 31 idiomas, incluyendo inglés, coreano, japonés, árabe, búlgaro, checo, danés, alemán, griego, español, estonio, finlandés, francés, hindi, croata, húngaro, indonesio, italiano, lituano, letón, neerlandés, polaco, portugués, rumano, ruso, eslovaco, esloveno, sueco, turco, ucraniano y vietnamita.
- Generación de voz en tiempo real en CPU: inferencia local sin necesidad de GPU, nube o API.
- Estabilidad de lectura mejorada: reduce repeticiones y omisiones, especialmente en frases muy cortas o muy largas.
- Estilos de voz predefinidos: diez estilos de voz incluidos en el paquete, seleccionables para adaptar la entonación.
- Ejecución on-device: todos los artefactos se distribuyen en formato ONNX, lo que permite integración en aplicaciones de escritorio, móviles o embebidas.
- Compatibilidad con el ecosistema AtodeKiku: el mirror incluye la configuración TTS y el indexador Unicode necesarios para el uso en el proyecto AtodeKiku.

## Casos de uso

- Accesibilidad para personas con discapacidad visual: el modelo puede integrarse en lectores de pantalla que convierten texto en voz de forma local, garantizando privacidad y sin dependencia de servicios en la nube.
- Asistentes de voz embebidos en dispositivos IoT: su bajo consumo de recursos y su ejecución en CPU lo hacen adecuado para altavoces inteligentes, relojes y otros dispositivos con limitaciones de hardware.
- Audiolibros y narración automatizada: permite generar narraciones multilingües para libros electrónicos, podcasts o contenidos educativos sin necesidad de estudio de grabación.
- Sistemas de accesibilidad para personas con discapacidad visual: integración en aplicaciones de lectura de documentos o navegación web que requieran síntesis de voz en tiempo real.
- Pruebas y desarrollo de aplicaciones de TTS: los desarrolladores pueden evaluar la calidad de voz y los estilos disponibles para integrarlos en prototipos sin necesidad de conexión a servicios externos.
- Traducción y aprendizaje de idiomas: se puede usar para generar audios de pronunciación en múltiples idiomas, útil en aplicaciones educativas o de práctica lingüística.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de comparación numérica (como MOS, WER, etc.) ni comparaciones con otros modelos TTS en la documentación proporcionada.

## Requisitos de hardware

- Inferencia en CPU: el modelo está diseñado para ejecutarse con ONNX Runtime en procesadores estándar, sin necesidad de GPU.
- Memoria: el tamaño del repositorio es de 0,4 GB (401 MB), lo que incluye los cuatro modelos ONNX y artefactos adicionales. La VRAM no es aplicable.
- Compatibilidad con hardware de bajo consumo: puede ejecutarse en dispositivos con recursos limitados, como Raspberry Pi o portátiles antiguos, siempre que tengan suficiente RAM (no se especifica una cantidad mínima).
- Despliegue: se puede integrar en aplicaciones Python mediante la librería `supertonic` (según la documentación), o mediante ONNX Runtime directamente. No se menciona soporte para vLLM, llama.cpp, Ollama o TGI, ya que son herramientas específicas para modelos de lenguaje, no para TTS.
- Latencia y throughput: no se proporcionan datos concretos, aunque se describe como "lightning-fast" en la web oficial.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Formato | Licencia | Requisitos |
|---|---|---|---|---|---|
| Supertonic 3 (este) | 99M | 31 | ONNX | OpenRAIL-M | CPU |
| Supertonic 2 | No disponible | 5 | ONNX | OpenRAIL-M | CPU |
| Otros TTS como Coqui TTS (XTTS) | ~250M | 17 | PyTorch | MPL-2.0 | GPU/CPU (recomendada GPU) |

La comparativa directa no es posible con datos precisos, pero se observa que Supertonic 3 amplía el número de idiomas respecto a Supertonic 2 y ofrece una alternativa ligera frente a otros TTS que requieren GPU o más recursos.

## Limitaciones y advertencias

- Licencia OpenRAIL-M: aunque permite uso comercial, la Sección 5 y el Anexo A de la licencia imponen restricciones específicas sobre usos prohibidos (por ejemplo, generación de voz engañosa o suplantación de identidad). Es necesario revisar el texto completo de la licencia antes de su uso en producción.
- No se documentan sesgos específicos, pero al ser un modelo de TTS, puede reflejar sesgos en la pronunciación o en el acento de ciertos idiomas según los datos de entrenamiento (no se publican).
- Riesgo de alucinación en el habla: aunque se ha mejorado la estabilidad, pueden existir errores de pronunciación o de entonación en textos complejos o con nombres propios.
- Dependencia de ONNX Runtime: el modelo solo se distribuye en formato ONNX, lo que limita su uso a entornos que soporten esta biblioteca. No hay pesos en PyTorch u otros formatos.
- Sin soporte para contexto largo: al ser TTS, no hay un concepto de contexto de texto largo; la estabilidad se refiere a la lectura de frases, no a la generación de conversaciones extensas.
- El mirror no es el repositorio oficial de Supertone: aunque los artefactos son idénticos al original, la comunidad debe verificar la procedencia y la integridad mediante `manifest.json` para evitar versiones modificadas.

## Enlaces

- Repositorio en HuggingFace: [https://huggingface.co/umiyosh/atodekiku-supertonic-3](https://huggingface.co/umiyosh/atodekiku-supertonic-3)
- Página oficial de Supertonic 3: [https://supertonic3.github.io/](https://supertonic3.github.io/)
- Repositorio de código fuente (Supertone Inc.): [https://github.com/supertone-inc/supertonic](https://github.com/supertone-inc/supertonic)
- Proyecto AtodeKiku: [https://github.com/umiyosh/AtodeKiku](https://github.com/umiyosh/AtodeKiku)
- Modelo original en HuggingFace: [https://huggingface.co/Supertone/supertonic-3](https://huggingface.co/Supertone/supertonic-3) (no verificado en la búsqueda, pero se menciona como upstream)
- Referencia de licencia OpenRAIL-M: [https://huggingface.co/blog/open_rail](https://huggingface.co/blog/open_rail) (enlace genérico, no específico)
