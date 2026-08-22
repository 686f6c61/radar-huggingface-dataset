# thunderboltc/marianmt_ipa_to_bangla_bleufixed

## Resumen

`marianmt_ipa_to_bangla_bleufixed` es un modelo de traducción automática neuronal (NMT) que convierte texto en Alfabeto Fonético Internacional (IPA) a bengalí. Es un ajuste fino del modelo multilingüe `Helsinki-NLP/opus-mt-en-mul`, desarrollado por el usuario de Hugging Face `thunderboltc`. El modelo se ha entrenado durante 25 épocas con un dataset no especificado y alcanza un BLEU de 7,80 y un ChrF de 32,74 en el conjunto de evaluación, lo que indica una calidad de traducción baja y sugiere que se trata de un trabajo experimental.

El modelo presenta un número de parámetros de 72 millones (77.026.926), propio de la arquitectura MarianMT (transformer encoder-decoder con 6 capas en cada componente). Su licencia es Apache-2.0, lo que permite uso comercial sin restricciones. A fecha de su publicación (agosto de 2026), no cuenta con descargas ni likes, y la model card está incompleta: no se especifican el dataset de entrenamiento, los idiomas exactos soportados ni la longitud de contexto. El tamaño del repositorio es de 23,1 GB, un valor anómalo para un modelo de 77 M de parámetros, probablemente debido a archivos adicionales o al tokenizador multilingüe del modelo base.

## Ficha técnica

| Parámetro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, 6 capas en cada componente) |
| Parámetros totales | 77.026.926 |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | No disponible (típico de MarianMT: 512 tokens) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | IPA → bengalí (modelo base multilingüe: inglés → múltiples idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer encoder-decoder desarrollado originalmente por el equipo de Marian (Universidad de Helsinki y Microsoft Translator). Cada componente (encoder y decoder) tiene 6 capas, con atención multi-cabeza y posiciones relativas. El modelo base `opus-mt-en-mul` fue entrenado por el grupo de Tiedemann en la Universidad de Helsinki para traducir desde inglés a múltiples idiomas simultáneamente. El ajuste fino se ha realizado sobre un dataset no especificado en la model card (etiquetado como "None dataset").

El entrenamiento se realizó con los siguientes hiperparámetros: tasa de aprendizaje de 2e-05, tamaño de lote de 8, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, scheduler lineal, 25 épocas y entrenamiento con precisión mixta (AMP). El resultado final muestra una pérdida de validación de 1.9446, BLEU de 7.8032 y CHRF de 22.7398. La curva de entrenamiento muestra una mejora progresiva del BLEU desde 0.3765 (época 1) hasta 7.8032 (época 25), con un pico intermedio de 7.9702 en la época 24, lo que indica un sobreajuste en la última época.

No se menciona ninguna innovación técnica adicional como decodificación especulativa, atención lineal o técnicas de RLHF/DPO. El modelo es un ajuste fino directo sin técnicas de alineación posterior.

## Capacidades

- Traducción de texto en Alfabeto Fonético Internacional (IPA) a bengalí.
- Generación de texto en bengalí a partir de entrada fonética, útil para sistemas de transliteración.
- Soporte de texto a texto (text2text-generation) mediante la librería Transformers.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni visión.
- No se especifica soporte de funciones adicionales (thinking mode, audio, etc.).
- El modelo base `opus-mt-en-mul` es multilingüe, pero el ajuste fino probablemente ha limitado su capacidad a la tarea IPA→bengalí.

## Casos de uso

- Transliteración fonética a bengalí: el modelo puede convertir transcripciones IPA de palabras o frases en bengalí escrito, útil para herramientas de aprendizaje de pronunciación o sistemas de subtitulado.
- Corrección de pronunciación en aplicaciones educativas: se puede integrar en un flujo donde el usuario introduce una palabra en IPA y recibe la forma escrita en bengalí, ayudando a estudiantes de bengalí como segunda lengua.
- Preprocesamiento para síntesis de voz: en sistemas TTS (text-to-speech) para bengalí, el modelo puede convertir anotaciones fonéticas en texto escrito para el motor de síntesis.
- Normalización de corpus lingüísticos: en investigación lingüística, se puede usar para convertir anotaciones fonéticas de corpus orales en texto bengalí estándar.
- Integración en pipelines de NLP: mediante la librería Transformers, se puede integrar en pipelines de traducción o transliteración junto a otros modelos de procesamiento de lenguaje natural.
- Prototipos académicos: al ser un modelo experimental con licencia Apache-2.0, puede servir como punto de partida para investigaciones sobre traducción IPA-bengalí, aunque su baja calidad limita su uso en producción.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de evaluación (model-index):

| Métrica | Valor |
|---|---|
| Loss | 1.9446 |
| BLEU | 7.8032 |
| CHRF | 22.7398 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El valor de BLEU de 7.8 es notablemente bajo (en traducción automática, valores de BLEU por debajo de 10 suelen indicar calidad muy pobre), lo que sugiere que el modelo no es útil para traducción general sin un ajuste adicional significativo.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 77 M de parámetros, la inferencia requiere aproximadamente 300 MB de memoria en FP32, y menos de 150 MB en FP16. Cabe en cualquier GPU consumer, incluidas las de 2 GB de VRAM.
- GPUs recomendadas: cualquier GPU NVIDIA con 4 GB o más es suficiente. En CPU también se puede ejecutar sin problemas, aunque con mayor latencia.
- Despliegue: compatible con Transformers (pipeline `text2text-generation`), y potencialmente con vLLM, TGI o llama.cpp si se convierte a formato GGUF, aunque no se proporcionan conversiones oficiales.
- Latencia: para un modelo de este tamaño, la inferencia en GPU es de milisegundos; en CPU, de decenas de milisegundos por secuencia corta.
- Nota: el tamaño del repositorio de 23,23 GB no se corresponde con el tamaño del modelo (77 M de parámetros); probablemente incluye archivos adicionales del modelo base o artefactos de entrenamiento, lo que no afecta a los requisitos de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (IPA→bengalí) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `thunderboltc/marianmt_ipa_to_bangla_bleufixed` | 77 M | no disponible | 7.80 | Apache-2.0 | Hugging Face |
| `Helsinki-NLP/opus-mt-en-mul` (base) | 77 M | 512 | no evaluado para IPA→bengalí | Apache-2.0 | Hugging Face |
| `Helsinki-NLP/opus-mt-en-bn` | 77 M | 512 | no disponible | Apache-2.0 | Hugging Face |

No se dispone de modelos comparables específicamente entrenados para IPA→bengalí en el ecosistema open source. La comparación con los modelos base de Helsinki-NLP es la referencia más cercana, aunque estos no están entrenados para la tarea de entrada fonética. La calidad de traducción de este modelo (BLEU 7.8) es sustancialmente inferior a la de modelos de traducción estándar bengalí-inglés (que suelen superar BLEU 20), lo que limita su utilidad práctica.

## Limitaciones y advertencias

- Calidad de traducción muy baja: el BLEU de 7.8 indica que la salida del modelo es de baja fidelidad y probablemente contenga numerosos errores gramaticales y semánticos. No es adecuado para uso en producción sin un ajuste fino adicional.
- Model card incompleta: no se especifican el dataset de entrenamiento, la composición de los datos, ni los idiomas exactos soportados, lo que dificulta la evaluación de su aplicabilidad.
- Sin datos de validación externa: no se han publicado benchmarks comparativos con otros modelos ni pruebas de robustez.
- Posible sesgo de datos: al desconocer el corpus de entrenamiento, no se puede evaluar si hay sesgos de género, dialecto o registro lingüístico.
- Riesgo de alucinación: como modelo NMT, puede generar texto inventado o incorrecto cuando la entrada es muy distinta a los datos de entrenamiento.
- Contexto limitado: si se hereda la ventana de contexto de MarianMT (512 tokens), no es adecuado para traducciones largas o documentos extensos.
- Tamaño del repositorio anómalo: los 23,1 GB del repo no se corresponden con el tamaño del modelo; es recomendable revisar el contenido antes de descargar para evitar almacenamiento innecesario.
- Ausencia de comunidad: al no tener descargas ni likes, no hay evidencia de uso real ni de retroalimentación de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thunderboltc/marianmt_ipa_to_bangla_bleufixed
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-mul
- Documentación de MarianMT en Transformers: https://huggingface.co/docs/transformers/model_doc/marian
- Framework Marian (C++): https://marian-nmt.github.io/
- Repositorio GitHub de Marian: https://github.com/marian-nmt/marian
- Documentación de Marian: https://marian-nmt.github.io/docs/
