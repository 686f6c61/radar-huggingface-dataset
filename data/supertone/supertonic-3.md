# Supertone/supertonic-3

## Resumen
Supertonic 3 es un modelo de síntesis de voz (text-to-speech) desarrollado por Supertone, una empresa especializada en inteligencia artificial de audio. Se trata de un sistema ligero de 99 millones de parámetros diseñado para ejecutarse íntegramente en el dispositivo mediante ONNX Runtime, sin necesidad de GPU ni conexión a la nube. Su principal novedad frente a la versión anterior es la ampliación de 5 a 31 idiomas, junto con una mejora en la estabilidad de lectura y una reducción de fallos de repetición y salto de palabras. El modelo se distribuye bajo licencia OpenRAIL y está pensado para aplicaciones de voz en tiempo real en entornos locales, como asistentes, call centers o dispositivos embebidos. Su tamaño compacto (0,4 GB de pesos) lo hace viable para CPU de gama baja, lo que lo convierte en una opción práctica para despliegues on-device sin dependencias externas.

## Especificaciones técnicas
| Parametro | Valor |
|---|---|
| Arquitectura | No especificada (modelo neuronal de síntesis de voz optimizado para ONNX) |
| Parametros totales | 99 millones |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se publica límite de caracteres de entrada) |
| Tipos de cuantizacion | No disponible (formato ONNX, precisión no documentada) |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | OpenRAIL (uso comercial permitido con restricciones de uso responsable) |
| Formato de pesos | ONNX (.onnx) |

## Arquitectura y entrenamiento
La arquitectura interna de Supertonic 3 no se detalla públicamente en la documentación disponible. Se sabe que es un modelo de síntesis de voz neuronal optimizado para inferencia en CPU mediante ONNX Runtime, lo que implica un diseño compacto y eficiente en términos de cómputo. No se han publicado datos sobre el dataset de entrenamiento, el número de tokens o el uso de técnicas como RLHF o DPO. La compañía menciona mejoras en la estabilidad de lectura y en la similitud de la voz respecto a la versión anterior, lo que sugiere un entrenamiento multilingüe extenso, aunque sin cifras concretas. El modelo admite etiquetas de expresión simples como `<laugh>`, `<breath>` y `<sigh>`, lo que indica un entrenamiento con anotaciones de eventos paralingüísticos.

## Capacidades
- Síntesis de voz multilingüe en 31 idiomas, incluyendo europeos, asiáticos y de Oriente Medio.
- Inferencia completamente local con ONNX Runtime, sin necesidad de GPU ni conexión a internet.
- Etiquetas de expresión para controlar risa, respiración y suspiros en la voz generada.
- Estilos de voz predefinidos (por ejemplo, "M1") incluidos en el paquete de pesos.
- Compatibilidad con zero-shot voice cloning mediante la herramienta Supertonic Voice Builder, que genera embeddings de voz personalizados a partir de audio de referencia.
- Baja latencia y consumo reducido, adecuado para aplicaciones en tiempo real en dispositivos de bajo rendimiento.
- Integración con el SDK de Python `supertonic` para generación rápida de audio.

## Casos de uso
- Asistentes de voz en dispositivos edge: al ejecutarse en CPU sin depender de la nube, Supertonic 3 puede integrarse en altavoces inteligentes, wearables o sistemas embebidos para responder con voz sintetizada de forma instantánea y privada.
- Atención al cliente automatizada: los ejemplos de la demo muestran voces de call center en inglés. El modelo puede gestionar respuestas en múltiples idiomas con una latencia baja, ideal para IVR o chatbots telefónicos que requieran naturalidad y estabilidad en la lectura.
- Audiolibros y narración: con soporte para expresiones como `<laugh>` o `<sigh>`, el modelo puede generar narraciones más vivas en varios idiomas, útil para plataformas de audiolibros que buscan voces locales sin coste de estudio.
- Doblaje de vídeo y contenido multimedia: gracias a la clonación de voz zero-shot y a los estilos predefinidos, permite doblar vídeos o podcasts con una voz consistente, manteniendo la identidad del locutor original.
- Accesibilidad: lectores de pantalla para personas con discapacidad visual pueden beneficiarse de un TTS local que no requiere conexión, garantizando privacidad y funcionamiento en entornos sin red.
- Juguetes y robots conversacionales: el bajo peso (99M parámetros) y la ejecución en CPU permiten integrar el modelo en hardware de consumo, como juguetes interactivos o robots educativos que necesitan responder verbalmente a los niños.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. La documentación solo menciona mejoras cualitativas en estabilidad de lectura y similitud de voz respecto a Supertonic 2, pero sin métricas numéricas. No se dispone de comparaciones con otros modelos TTS como Coqui TTS, Piper o VITS.

## Requisitos de hardware
- Inferencia en CPU: el modelo está optimizado para ejecutarse sin GPU mediante ONNX Runtime, por lo que no requiere VRAM.
- Almacenamiento: aproximadamente 0,4 GB para los pesos del modelo.
- GPU recomendadas: no necesaria; cualquier CPU moderna es suficiente.
- Compatibilidad con hardware de bajo consumo: al ser un modelo de 99M parámetros, es viable en Raspberry Pi, teléfonos móviles o dispositivos IoT con al menos 512 MB de RAM.
- Opciones de despliegue: SDK de Python `supertonic` (instalable vía pip), ONNX Runtime directamente, o integración en aplicaciones móviles mediante el runtime ONNX.
- Latencia y throughput: no se especifican cifras concretas, pero la compañía destaca que es "lightning fast" y apto para tiempo real.

## Comparativa con modelos similares
No disponible. No se proporcionan comparaciones con otros sistemas TTS en la documentación pública. Sin embargo, por sus características (99M parámetros, ONNX, 31 idiomas), se posiciona como una alternativa ligera frente a modelos como Piper (que también es on-device) o Coqui TTS, aunque sin datos cuantitativos para una comparación rigurosa.

## Limitaciones y advertencias
- La licencia OpenRAIL impone restricciones de uso responsable: no se permite generar voces engañosas o suplantar identidades sin consentimiento.
- No se documentan los límites de longitud de texto por entrada, por lo que textos muy largos podrían requerir segmentación manual.
- La calidad de pronunciación puede variar entre los 31 idiomas; no se garantiza el mismo nivel de naturalidad en todos ellos.
- El modelo incluye etiquetas de expresión, pero no se especifica si admite control fino de prosodia o emociones más allá de las tres etiquetas mencionadas.
- No se han publicado datos sobre sesgos o comportamientos no deseados en contextos específicos (por ejemplo, acentos regionales o habla no nativa).
- El zero-shot voice cloning requiere la herramienta Voice Builder de Supertone, que es un servicio externo y no está incluido en el paquete open-weight.

## Enlaces
- HuggingFace: https://huggingface.co/Supertone/supertonic-3
- Código (GitHub): https://github.com/supertone-inc/supertonic
- Demo interactiva (Hugging Face Space): https://huggingface.co/spaces/Supertone/supertonic-3
- Página de demostración de audio: https://supertonic3.github.io/
- SDK Python (PyPI): https://pypi.org/project/supertonic/
- Anuncio oficial: https://www.supertone.ai/en/work/faster-and-more-accurate-across-31-languages----introducing-supertonic-3
