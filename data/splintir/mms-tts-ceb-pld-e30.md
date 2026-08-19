# Splintir/mms-tts-ceb-pld-e30

## Resumen

El modelo `Splintir/mms-tts-ceb-pld-e30` es un sistema de síntesis de voz (texto a audio) basado en la arquitectura VITS, desarrollado por el usuario Splintir y publicado en Hugging Face. Se trata de un ajuste fino (fine-tuning) del modelo MMS-TTS de Meta, especializado en la lengua cebuana (código ISO `ceb`), como sugiere el identificador del repositorio. El sufijo `e30` indica que el entrenamiento se realizó durante 30 épocas.

Con 36,3 millones de parámetros, es un modelo compacto diseñado para generar habla natural a partir de texto. La model card publicada no contiene información técnica detallada, por lo que muchos aspectos (datos de entrenamiento, licencia, evaluación) no están documentados. A pesar de ello, su inclusión en el ecosistema `transformers` y su compatibilidad con la API de inferencia de Hugging Face lo hacen fácilmente integrable en aplicaciones de síntesis de voz para cebuano.

La relevancia de este modelo radica en cubrir una lengua de bajos recursos, donde las opciones de TTS de calidad son escasas. Al derivarse de MMS-TTS, hereda la capacidad de producir voz relativamente natural, aunque su tamaño reducido y la falta de documentación limitan su uso en entornos de producción exigentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (Conditional Variational Autoencoder with Adversarial Learning) |
| Parametros totales | 36.285.168 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de síntesis de voz) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Cebuano (inferido del identificador; no confirmado en la model card) |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura VITS (Variational Inference with adversarial Training for end-to-end Text-to-Speech) combina un codificador de texto, un decodificador de voz basado en flujos normalizadores y un discriminador adversarial. El modelo se entrena de extremo a extremo, optimizando una pérdida de verosimilitud variacional junto con una pérdida adversarial y una pérdida de reconstrucción. Esto permite generar audio directamente desde texto sin necesidad de vocoder externo.

El modelo base MMS-TTS de Meta fue entrenado con datos multilingües de la iniciativa Massively Multilingual Speech (MMS), que cubre más de 1100 lenguas. El ajuste fino realizado por Splintir se centró en cebuano, presumiblemente con un conjunto de datos específico de esa lengua, aunque no se han publicado detalles sobre el corpus, el preprocesamiento ni los hiperparámetros. El identificador `pld` podría referirse a una variante dialectal o a un código interno, pero no está documentado.

## Capacidades

- Síntesis de voz a partir de texto en cebuano (presumiblemente).
- Generación de audio en formato de onda, con salida muestreada típicamente a 16 kHz (estándar en MMS-TTS).
- Compatible con el pipeline `text-to-audio` de Hugging Face, lo que permite una integración directa con la infraestructura de Transformers.
- Soporte para inferencia en CPU y GPU gracias a su tamaño reducido.
- No se documentan capacidades de control de prosodia, emociones ni habla multihablante.

## Casos de uso

- Aplicaciones de accesibilidad para hablantes de cebuano: el modelo puede convertir texto escrito en cebuano a voz, facilitando la lectura de pantallas, noticias o libros electrónicos a personas con discapacidad visual.
- Asistentes de voz locales: integración en asistentes personales o dispositivos domésticos que necesiten responder en cebuano, aprovechando su bajo requisito de recursos.
- Sistemas de navegación y avisos públicos: generación de anuncios de transporte, mensajes de emergencia o indicaciones en cebuano para entornos con poco ancho de banda.
- Contenido educativo: producción de materiales de audio para aprender cebuano o para escuelas donde la lengua vehicular es el cebuano, sin necesidad de locutores humanos.
- Pruebas de concepto y prototipos: dado su tamaño reducido, es adecuado para experimentar con TTS en cebuano en entornos de desarrollo o investigación académica.
- Localización de productos: integración en aplicaciones móviles o webs que quieran ofrecer lectura en voz alta de contenido en cebuano, siempre que se respete la licencia (aún no determinada).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas objetivas de calidad de voz (MOS, WER, etc.) ni comparaciones con otros sistemas TTS para cebuano.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 36 millones de parámetros, puede ejecutarse en CPU con unos 200-400 MB de RAM, y en GPU con menos de 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050 Ti, RTX 2060) es suficiente. Incluso una Raspberry Pi 4 podría ejecutarlo en tiempo real si se optimiza con ONNX o cuantización.
- Cabe en GPUs de consumo: sí, en cualquier GPU de gama media actual.
- Opciones de despliegue: al ser compatible con `transformers`, se puede servir con Hugging Face Inference Endpoints, o mediante bibliotecas como `espnet` (si se exporta), o usando `torch` directamente. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un LLM.
- Latencia y throughput: no disponibles, pero al ser un modelo pequeño, la generación de un segundo de audio suele tomar menos de un segundo en CPU moderna, y mucho menos en GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Lengua | Licencia | Disponibilidad |
|---|---|---|---|---|
| `facebook/mms-tts-ceb` | ~36 M | Cebuano | CC-BY-NC 4.0 (no comercial) | Hugging Face |
| `Splintir/mms-tts-ceb-pld-e30` | 36,3 M | Cebuano (inferido) | No disponible | Hugging Face |
| `facebook/mms-tts-tgl` | ~36 M | Tagalo | CC-BY-NC 4.0 | Hugging Face |

El modelo base `facebook/mms-tts-ceb` es la referencia principal; el modelo de Splintir es un ajuste fino de ese mismo modelo, por lo que se espera un comportamiento similar, aunque no se han publicado comparativas. La principal diferencia es la licencia: el modelo de Meta es explícitamente no comercial, mientras que el de Splintir no especifica ninguna, lo que introduce incertidumbre legal para uso comercial. Otros TTS para lenguas filipinas, como el tagalo, pueden servir de referencia, pero no son directamente comparables.

## Limitaciones y advertencias

- La model card no proporciona información sobre sesgos, riesgos ni limitaciones específicas. Se desconoce la composición del corpus de entrenamiento, por lo que puede haber sesgos de género, edad o dialecto.
- Riesgo de alucinación: en TTS, esto se manifiesta como errores de pronunciación o generación de audio ininteligible para ciertos textos, especialmente con nombres propios o palabras fuera del vocabulario de entrenamiento.
- La licencia no está especificada, lo que impide determinar si el modelo puede usarse comercialmente. Se recomienda contactar al autor antes de cualquier uso en producción.
- El idioma soportado no está confirmado en la model card; el identificador sugiere cebuano, pero no hay garantía de que el modelo funcione correctamente en otros idiomas.
- No se documentan técnicas de mitigación de sesgos ni evaluación de calidad subjetiva, por lo que la naturalidad y claridad de la voz pueden no cumplir estándares profesionales.
- El modelo fue creado en 2026, lo que podría indicar que es muy reciente y no ha sido ampliamente probado por la comunidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Splintir/mms-tts-ceb-pld-e30)
- [Paper de VITS (arXiv:1910.09700)](https://arxiv.org/abs/1910.09700)
