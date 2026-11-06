# SZLHOLDINGS/brain-navigator-r2-estate-sft-v1

## Resumen

Brain-navigator-r2-estate-sft-v1 es un ajuste fino (SFT) del modelo Qwen/Qwen3.5-0.8B, desarrollado por SZLHOLDINGS y publicado en Hugging Face con licencia Apache 2.0. Se trata de un modelo de 873 millones de parámetros orientado a la generación de texto e imagen-texto, entrenado mediante la librería Unsloth y TRL de Hugging Face, lo que según el autor permite un entrenamiento 2 veces más rápido.

El modelo parte de la arquitectura Qwen3.5 en su variante de 0.8B, lo que lo sitúa en la gama de modelos pequeños, adecuado para despliegues con recursos limitados. La nomenclatura "estate-sft" sugiere un ajuste orientado a tareas del sector inmobiliario, aunque la model card no proporciona detalles sobre la composición del dataset de entrenamiento ni sobre los objetivos específicos del ajuste.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, que facilitan su integración en entornos de producción con hardware modesto. No obstante, la información pública disponible es muy limitada: no se han publicado benchmarks, detalles de entrenamiento ni documentación sobre capacidades específicas más allá de los tags de Hugging Face.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, variante 0.8B) |
| Parámetros totales | 873.438.784 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5 en su variante de 0.8B parámetros, un transformer decoder-only. El ajuste fino se realizó mediante Supervised Fine-Tuning (SFT) utilizando Unsloth y la librería TRL de Hugging Face, según indica la model card. El autor afirma que el entrenamiento fue 2 veces más rápido gracias a Unsloth, aunque no se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas adicionales como RLHF o DPO.

No se dispone de información sobre innovaciones técnicas específicas del ajuste, como decodificación especulativa, atención lineal u otras optimizaciones. La model card es mínima y se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento utilizada.

## Capacidades

- Generación de texto conversacional en inglés.
- Procesamiento de imagen-texto (pipeline image-text-to-text), lo que sugiere capacidades multimodales heredadas del modelo base.
- Compatibilidad con text-generation-inference (TGI) y endpoints compatibles.
- Ajuste fino orientado a tareas del sector inmobiliario (según la nomenclatura "estate-sft"), aunque no se detallan las capacidades concretas.
- No se documenta soporte explícito de tool calling, function calling, agentes o razonamiento multi-paso.
- Capacidades multilingües limitadas al inglés según el tag de idioma.

## Casos de uso

- Generación de descripciones de propiedades inmobiliarias: el modelo puede redactar textos descriptivos a partir de datos estructurados o imágenes, aprovechando su pipeline image-text-to-text y su ajuste orientado al sector inmobiliario.
- Atención al cliente en portales inmobiliarios: puede gestionar conversaciones multi-turno en inglés sobre consultas de propiedades, aunque se desconoce la longitud de contexto disponible.
- Análisis de imágenes de inmuebles: al soportar image-text-to-text, podría emplearse para generar descripciones automáticas de fotografías de propiedades.
- Prototipado rápido en entornos con recursos limitados: su tamaño de 873M parámetros permite desplegarlo en GPUs de consumo, facilitando pruebas de concepto.
- Clasificación y extracción de información de anuncios inmobiliarios: el ajuste SFT podría haberse orientado a tareas de extracción de entidades o categorización, aunque no se confirma en la documentación.
- Integración en pipelines de TGI: al ser compatible con text-generation-inference, puede desplegarse en infraestructuras estándar de serving de modelos.
- Generación de respuestas automatizadas en inglés para chatbots del sector inmobiliario, con la salvedad de que no se han publicado evaluaciones de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.7 GB en FP16 (873M parámetros × 2 bytes), y alrededor de 0.9 GB en cuantización de 8 bits, aunque no se confirman los tipos de cuantización soportados.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes.
- Cabe en GPUs de consumo: sí, en modelos como RTX 3060, RTX 4060, RTX 4090 y GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: text-generation-inference (TGI), transformers, y potencialmente llama.cpp u Ollama si se generan pesos GGUF (no confirmado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| SZLHOLDINGS/brain-navigator-r2-estate-sft-v1 | 873M | no disponible | Apache 2.0 | en | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~800M | no disponible | Apache 2.0 | en | Hugging Face |
| Modelos de ~1B de la familia Llama | ~1B | no disponible | Licencia Llama | multilingüe | Hugging Face |

La comparativa se limita a la información disponible; no se han publicado datos de rendimiento que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de Qwen3.5 y entrenarse con un dataset no especificado, puede heredar sesgos del modelo base y del corpus de ajuste.
- Riesgo de alucinación: presente en modelos de este tamaño, especialmente en tareas de razonamiento complejo o generación de datos factuales.
- Limitaciones de contexto e idioma: solo se declara soporte de inglés; la longitud de contexto no está documentada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5.
- Caveats para producción: la ausencia de benchmarks y de documentación sobre el dataset de entrenamiento dificulta evaluar su calidad y adecuación; se recomienda realizar pruebas propias antes de desplegarlo.
- El modelo tiene 0 descargas y 0 likes en Hugging Face, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- [Hugging Face: SZLHOLDINGS/brain-navigator-r2-estate-sft-v1](https://huggingface.co/SZLHOLDINGS/brain-navigator-r2-estate-sft-v1)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Unsloth](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
