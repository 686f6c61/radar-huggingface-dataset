# thunderboltc/marianmt_sanlish_to_bangla_1934_lr2_duijonChara

## Resumen

El modelo `marianmt_sanlish_to_bangla_1934_lr2_duijonChara` es un fine-tune del sistema de traducción automática neuronal MarianMT, concretamente del modelo base `Helsinki-NLP/opus-mt-en-mul`, desarrollado por el usuario `thunderboltc`. Está diseñado para traducir texto en "sanlish" (una mezcla de sánscrito e inglés) al bengalí, un caso de uso específico que no cubren los modelos multilingües genéricos. Con 77 millones de parámetros, es un modelo compacto que puede ejecutarse en hardware modesto.

La relevancia de este modelo radica en su especialización: los textos que combinan sánscrito e inglés (como escrituras, filosofía o literatura) suelen ser difíciles de traducir con modelos estándar, y este fine-tune busca mejorar la calidad en ese dominio concreto. Aunque la información pública es limitada, los resultados reportados en la evaluación (BLEU 14.59, Chrf 39.38) indican un rendimiento moderado, típico de modelos de traducción de tamaño pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (Transformer encoder-decoder) |
| Parametros totales | 77.026.926 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típico de MarianMT: 512 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificable a FP16/INT8) |
| Idiomas soportados | "sanlish" (mezcla sánscrito-inglés) a bengalí |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MarianMT, un transformer encoder-decoder con atención multi-cabeza, desarrollado originalmente por el equipo de Microsoft Translator. El modelo base `opus-mt-en-mul` es un sistema multilingüe que traduce del inglés a múltiples idiomas, y este fine-tune lo adapta específicamente para la dirección "sanlish" → bengalí.

El entrenamiento se realizó con los siguientes hiperparámetros: learning rate de 2e-5, batch size de 8, 25 épocas, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal y precisión mixta nativa (AMP). No se especifica el dataset de entrenamiento, pero la pérdida de validación final fue de 1.6735, con BLEU 14.5937 y Chrf 39.3821. No se menciona el uso de RLHF ni DPO; es un fine-tune supervisado estándar.

## Capacidades

- Traducción automática de texto en "sanlish" (mezcla de sánscrito e inglés) al bengalí.
- Generación de texto en bengalí a partir de entradas que contienen vocabulario sánscrito o transliteraciones.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de traducción.
- Capacidades multilingües limitadas: solo la dirección mencionada, aunque al derivar de un modelo multilingüe podría conservar cierta capacidad de traducción desde inglés, pero no está garantizado.
- No dispone de modo de pensamiento, visión ni audio.

## Casos de uso

- Traducción de textos religiosos y filosóficos: obras que mezclan sánscrito e inglés (como comentarios de escrituras hindúes) pueden traducirse al bengalí para audiencias locales.
- Localización de contenido educativo: materiales de yoga, ayurveda o estudios indológicos que usan terminología sánscrita con explicaciones en inglés.
- Traducción de literatura académica: artículos o tesis que citan términos sánscritos en inglés pueden convertirse al bengalí para su difusión.
- Digitalización de archivos históricos: documentos coloniales o manuscritos que combinan inglés y sánscrito pueden procesarse para su preservación.
- Aplicaciones de traducción en tiempo real: al ser un modelo pequeño, puede integrarse en aplicaciones móviles o web para traducir frases cortas.
- Asistencia a traductores profesionales: como herramienta de pre-traducción para revisión humana, reduciendo el tiempo de trabajo en textos especializados.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 1.6735 |
| BLEU | 14.5937 |
| Chrf | 39.3821 |

No se han publicado comparaciones con otros modelos en la información disponible. La evolución del BLEU durante el entrenamiento muestra una mejora progresiva desde 0.64 (época 1) hasta 14.59 (época 25), con un pico de 15.65 en la época 16.

## Requisitos de hardware

- VRAM estimada: con 77M de parámetros, en FP32 ocupa ~308 MB, en FP16 ~154 MB, y en INT8 ~77 MB. Cabe en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna, incluso integradas (iGPU) para inferencia en lote pequeño. Una NVIDIA GTX 1050 Ti o superior es suficiente.
- También puede ejecutarse en CPU con razonable velocidad para textos cortos.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, así como con ONNX Runtime, TensorRT y herramientas como `ctranslate2` (si se convierte el modelo).
- Latencia y throughput: no se han publicado datos específicos, pero por el tamaño, se espera una latencia de decenas de milisegundos por frase en GPU y de cientos de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| `thunderboltc/marianmt_sanlish_to_bangla_1934_lr2_duijonChara` | 77M | no disponible | "sanlish" → bengalí | Apache-2.0 |
| `Helsinki-NLP/opus-mt-en-bn` | ~77M | 512 | inglés → bengalí | Apache-2.0 |
| `Helsinki-NLP/opus-mt-en-mul` | ~77M | 512 | inglés → múltiples idiomas | Apache-2.0 |

El modelo se diferencia de `opus-mt-en-bn` en que acepta entradas que contienen sánscrito, no solo inglés estándar. Frente a `opus-mt-en-mul`, está más especializado en la dirección concreta, lo que podría ofrecer mejor calidad en ese dominio, aunque no hay datos comparativos publicados.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, lo que impide evaluar posibles sesgos o cobertura limitada de vocabulario.
- El BLEU de 14.59 es bajo en términos absolutos, lo que sugiere que la calidad de traducción puede ser limitada para textos complejos o fuera del dominio de entrenamiento.
- Riesgo de alucinaciones: como todo modelo de traducción, puede generar contenido no fiel al original, especialmente con frases ambiguas.
- No se especifican los idiomas de entrada exactos; "sanlish" no es un código ISO estándar, por lo que su uso requiere entender qué variante de mezcla sánscrito-inglés espera el modelo.
- La licencia Apache-2.0 permite uso comercial, pero al ser un fine-tune de un modelo base con la misma licencia, no hay restricciones adicionales conocidas.
- El tamaño del repositorio (23.1 GB) es inusualmente grande para 77M de parámetros, lo que sugiere que puede contener múltiples archivos o versiones; se recomienda verificar el contenido antes de su uso en producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thunderboltc/marianmt_sanlish_to_bangla_1934_lr2_duijonChara)
- [Modelo base: Helsinki-NLP/opus-mt-en-mul](https://huggingface.co/Helsinki-NLP/opus-mt-en-mul)
- [Documentación de MarianMT en Transformers](https://huggingface.co/transformers/v4.3.0/model_doc/marian.html)
- [Sitio oficial de Marian](https://marian-nmt.github.io/)
