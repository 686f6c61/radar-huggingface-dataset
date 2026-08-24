# Tohirju/ecapa-tdnn-uzbek

## Resumen

El modelo **Tohirju/ecapa-tdnn-uzbek** es un sistema de verificación de hablante (speaker verification) específico para el idioma uzbeko, desarrollado por el usuario Tohirju sobre la arquitectura ECAPA-TDNN. Se trata de un fine-tune del modelo base `speechbrain/spkrec-ecapa-voxceleb`, adaptado para extraer embeddings de voz y clasificar audio en el contexto del uzbeko. Su relevancia radica en que cubre un hueco importante: los recursos de biometría de voz para lenguas de Asia Central son escasos, y este modelo ofrece una solución ligera (0,1 GB) y de código abierto bajo licencia Apache 2.0.

La arquitectura ECAPA-TDNN, presentada en Interspeech 2020, incorpora bloques de atención de canal enfatizada (SE-block), bloques Res2 y pooling estadístico atento, lo que la convierte en una de las referencias en verificación de hablante. El modelo está disponible en HuggingFace con acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones antes de descargarlo. Su pipeline es `audio-classification` y se integra con la librería SpeechBrain.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ECAPA-TDNN (Emphasized Channel Attention, Propagation and Aggregation in TDNN) |
| Parametros totales | no disponible (repo de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada de audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors o checkpoint de SpeechBrain) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ECAPA-TDNN, descrita en el paper "ECAPA-TDNN: Emphasized Channel Attention, Propagation and Aggregation in TDNN Based Speaker Verification" (Desplanques et al., Interspeech 2020). Esta arquitectura mejora los TDNN tradicionales mediante tres innovaciones clave: bloques de atención de canal (SE-block) que recalibran las características, bloques Res2 que aumentan la capacidad de representación sin incrementar excesivamente el número de parámetros, y un pooling estadístico atento que agrega información temporal de forma ponderada. El resultado es un modelo robusto para verificación de hablante, con buen rendimiento en condiciones de ruido y variabilidad de canal.

El modelo es un fine-tune de `speechbrain/spkrec-ecapa-voxceleb`, que fue entrenado originalmente en el dataset VoxCeleb2. El ajuste fino se ha realizado específicamente para el uzbeko, aunque no se han publicado detalles sobre el dataset de entrenamiento utilizado, el número de hablantes ni el volumen de horas de audio. Tampoco se especifica si se aplicaron técnicas de aumentación de datos o estrategias de regularización adicionales. La ausencia de esta información limita la reproducibilidad del proceso de entrenamiento.

## Capacidades

- **Verificación de hablante**: determina si dos muestras de audio pertenecen al mismo hablante, comparando embeddings extraídos.
- **Extracción de embeddings de voz**: genera representaciones vectoriales de la voz que pueden usarse en sistemas de búsqueda o agrupación.
- **Clasificación de audio**: el pipeline `audio-classification` permite etiquetar segmentos de audio según la identidad del hablante.
- **Diarización de hablantes**: aunque no es su función principal, los embeddings pueden integrarse en pipelines de diarización, como se evidencia en el dataset `Tohirju/uzbek-tts-diarized` que utiliza agrupación ECAPA.
- **Soporte monolingüe**: el modelo está especializado en uzbeko, lo que limita su uso a este idioma, aunque la arquitectura subyacente es multilingüe en su versión base.

## Casos de uso

- **Autenticación biométrica por voz**: en aplicaciones de banca móvil o acceso a servicios digitales en Uzbekistán, el modelo puede verificar la identidad de un usuario comparando su voz en tiempo real con una plantilla previamente registrada.
- **Diarización de reuniones y grabaciones**: integrado en herramientas de transcripción, permite separar y etiquetar los turnos de habla de diferentes participantes en uzbeko, facilitando la generación de actas o subtítulos.
- **Búsqueda de hablantes en archivos de audio**: en entornos de medios o forenses, se puede indexar un corpus de audio y buscar todas las apariciones de un hablante concreto mediante la comparación de embeddings.
- **Sistemas de atención al cliente**: en centros de llamadas, el modelo puede identificar al cliente que llama y recuperar su historial, mejorando la personalización del servicio.
- **Control de acceso físico**: en instalaciones con requisitos de seguridad, la verificación por voz en uzbeko puede complementar o sustituir a otros métodos biométricos.
- **Investigación lingüística y fonética**: los embeddings extraídos pueden utilizarse para estudiar variaciones dialectales o características acústicas del uzbeko, gracias a su capacidad de representar la identidad del hablante de forma compacta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como EER (Equal Error Rate) o accuracy en conjuntos de prueba estándar (p. ej., VoxCeleb1) para este fine-tune específico. Tampoco se han comparado sus resultados con otros modelos de verificación de hablante para uzbeko.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 0,1 GB, la inferencia puede ejecutarse en CPU con menos de 1 GB de RAM. En GPU, cualquier tarjeta con al menos 1 GB de VRAM es suficiente.
- **GPU recomendadas**: no se requiere hardware especializado; una GPU de gama media como una RTX 3060 o incluso una integrada puede manejar la inferencia en tiempo real.
- **Compatibilidad con consumer GPU**: sí, el modelo cabe en cualquier GPU de consumo actual.
- **Opciones de despliegue**: al estar basado en SpeechBrain, puede desplegarse mediante el framework de inferencia de SpeechBrain, o exportarse a ONNX para su uso en entornos de producción. También es posible cargarlo en librerías como `speechbrain.inference.speaker` para verificación en tiempo real.
- **Latencia y throughput**: no se han publicado mediciones específicas, pero dado el tamaño reducido, se espera una latencia inferior a 100 ms por segmento de audio de 1 segundo en CPU moderna, y mucho menor en GPU.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Tamaño | Licencia | Acceso |
|---|---|---|---|---|---|
| Tohirju/ecapa-tdnn-uzbek | ECAPA-TDNN | uzbeko | 0,1 GB | Apache 2.0 | Gated |
| speechbrain/spkrec-ecapa-voxceleb | ECAPA-TDNN | multilingüe (VoxCeleb) | ~0,1 GB | Apache 2.0 | Abierto |
| Tohirju/ecapa-tdnn-kazakh | ECAPA-TDNN | kazajo | 0,1 GB | Apache 2.0 | Gated |

El modelo base `speechbrain/spkrec-ecapa-voxceleb` es la referencia general para verificación de hablante, pero no está optimizado para uzbeko. El modelo kazajo de Tohirju es el equivalente para otro idioma de Asia Central, lo que sugiere una familia de modelos regionales. No se dispone de comparativas de rendimiento entre ellos.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptar condiciones en HuggingFace antes de su descarga, lo que puede limitar su uso en entornos automatizados.
- **Sesgos potenciales**: al ser un fine-tune de un modelo entrenado en VoxCeleb (hablantes mayoritariamente occidentales), puede presentar sesgos en la verificación de hablantes uzbekos con acentos o características vocales no representadas en el dataset original.
- **Riesgo de alucinación**: no aplica directamente, ya que no es un modelo generativo de texto, pero sí puede producir falsos positivos o negativos en la verificación de identidad, especialmente con audio de baja calidad o ruido.
- **Limitaciones de idioma**: el modelo solo está entrenado para uzbeko; su uso con otros idiomas degradará significativamente el rendimiento.
- **Falta de documentación**: no se han publicado detalles sobre el dataset de fine-tune, el número de hablantes ni las condiciones de grabación, lo que dificulta evaluar su robustez en entornos reales.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0, el acceso gated implica que el uso comercial puede estar sujeto a términos adicionales definidos por el autor.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Tohirju/ecapa-tdnn-uzbek)
- [Modelo kazajo equivalente](https://huggingface.co/Tohirju/ecapa-tdnn-kazakh)
- [Dataset de diarización en uzbeko](https://huggingface.co/datasets/Tohirju/uzbek-tts-diarized)
- [Paper original de ECAPA-TDNN (arXiv)](https://arxiv.org/abs/2005.07143)
- [Implementación de referencia en GitHub (TaoRuijie/ECAPA-TDNN)](https://github.com/TaoRuijie/ECAPA-TDNN)
- [Implementación alternativa en GitHub (LKLQQ/ecapa_tdnn)](https://github.com/LKLQQ/ecapa_tdnn)
