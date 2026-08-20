# Tohirju/chatterbox-mtl-uzbek

## Resumen

El modelo `Tohirju/chatterbox-mtl-uzbek` es un sistema de síntesis de voz (text-to-speech) en idioma uzbeko, desarrollado por Tohirju como un ajuste fino (fine-tuning) del modelo base `ResembleAI/chatterbox`. Chatterbox es una familia de modelos TTS de código abierto creada por Resemble AI, con licencia MIT, que destaca por su capacidad de clonación de voz en cero disparos (zero-shot voice cloning) a partir de tan solo unos segundos de audio de referencia, así como por el control de emociones y la generación en tiempo real.

Este modelo concreto está especializado en uzbeko, una lengua túrquica hablada en Uzbekistán y otras regiones de Asia Central. Su relevancia radica en que cubre un idioma con escasa representación en los sistemas TTS comerciales y de código abierto, ofreciendo una opción localizada y de libre uso para desarrolladores que necesiten síntesis de voz en uzbeko. El repositorio tiene un tamaño de 3,2 GB y el acceso está restringido (gated), por lo que es necesario aceptar las condiciones en HuggingFace antes de poder descargarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en ResembleAI/chatterbox) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | MIT |
| Formato de pesos | safetensors (según los tags del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura específica de este ajuste fino. El modelo base, `ResembleAI/chatterbox`, es un sistema TTS de última generación desarrollado por Resemble AI. Según la documentación pública de Resemble AI, Chatterbox ofrece control de emociones, generación en tiempo real y clonación de voz en cero disparos a partir de 5 segundos de audio. La familia Chatterbox incluye variantes como Chatterbox-Turbo, con una arquitectura de 350 millones de parámetros, pero no se confirma que este modelo uzbeko utilice esa variante concreta.

El entrenamiento de este modelo se ha realizado mediante fine-tuning sobre el modelo base para adaptarlo al idioma uzbeko. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens, ni si se emplearon técnicas como RLHF o DPO. Tampoco se especifican innovaciones técnicas adicionales más allá de las heredadas del modelo base.

## Capacidades

- Síntesis de voz en idioma uzbeko a partir de texto.
- Clonación de voz en cero disparos (zero-shot voice cloning) heredada del modelo base, que permite replicar una voz a partir de una muestra de audio corta (alrededor de 5 segundos).
- Control de emociones en la voz generada, según las capacidades del modelo base.
- Generación de voz en tiempo real, también heredada del modelo base.
- Posibilidad de ajuste fino adicional para voces o estilos específicos, dado que es un modelo abierto con licencia MIT.

## Casos de uso

- Asistentes de voz en uzbeko: integrar el modelo en aplicaciones de asistente virtual para responder en uzbeko con una voz natural y clonable, mejorando la accesibilidad para hablantes de este idioma.
- Audiolibros y narración: generar audiolibros en uzbeko a partir de texto, con control de emoción para dar expresividad a la narración.
- Traducción y localización de contenidos: convertir contenido escrito en uzbeko (noticias, artículos, documentación) en audio para plataformas de podcast o radio.
- Sistemas de atención al cliente: implementar respuestas de voz automatizadas en uzbeko para centros de llamadas, con la posibilidad de clonar la voz de un agente humano para mantener consistencia.
- Educación y aprendizaje de idiomas: crear materiales de pronunciación en uzbeko para estudiantes, con voces claras y personalizables.
- Accesibilidad para personas con discapacidad visual: convertir texto en uzbeko a voz en aplicaciones de lectura de pantalla, aprovechando la licencia MIT para uso comercial sin restricciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre métricas como MOS (Mean Opinion Score), WER (Word Error Rate) o comparativas con otros modelos TTS para uzbeko.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware para este modelo. Dado que el repositorio pesa 3,2 GB, se puede estimar que el modelo completo requiere al menos esa cantidad de almacenamiento y una VRAM suficiente para cargar los pesos en memoria durante la inferencia. Sin embargo, al no conocerse el número de parámetros ni la arquitectura exacta, no es posible dar una estimación fiable de VRAM ni recomendar GPUs concretas. Se recomienda consultar la documentación del modelo base `ResembleAI/chatterbox` para orientación sobre despliegue, ya que este modelo es un fine-tuning del mismo.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos TTS en uzbeko. Existen alternativas genéricas como Coqui TTS o VITS, pero no se conocen datos concretos de rendimiento ni de disponibilidad para uzbeko en la información proporcionada. Se indica "no disponible".

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated) en HuggingFace; es necesario aceptar las condiciones de uso antes de descargarlo.
- No se han publicado detalles sobre el dataset de entrenamiento, por lo que no se pueden evaluar posibles sesgos en la voz generada (acentos, género, edad, etc.).
- Al ser un fine-tuning de un modelo base, las limitaciones del modelo base (como la calidad en idiomas no entrenados o la sensibilidad a la calidad del audio de referencia para clonación) pueden aplicarse también aquí.
- No se ha verificado la calidad de la síntesis en uzbeko en términos de naturalidad o precisión fonética; se recomienda realizar pruebas antes de usarlo en producción.
- La licencia MIT permite uso comercial, pero se debe verificar que el modelo base también cumple con esa licencia (así es, según la documentación de Resemble AI).
- No se especifican requisitos de hardware ni latencia, por lo que el despliegue en entornos de producción requiere experimentación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tohirju/chatterbox-mtl-uzbek
- Modelo base ResembleAI/chatterbox: https://huggingface.co/ResembleAI/chatterbox
- Repositorio GitHub de Chatterbox: https://github.com/resemble-ai/chatterbox
- Documentación de Chatterbox en Resemble AI: https://www.resemble.ai/learn/models/chatterbox
