# Zubr-AI/zubr-text-classification-26b

## Resumen

Zubr-AI/zubr-text-classification-26b es un modelo publicado en Hugging Face por el usuario Zubr-AI bajo licencia Apache 2.0. Pese a su nombre, que sugiere una especialización en clasificación de texto, los metadatos del repositorio lo etiquetan como "conversational" y los pesos se distribuyen en formato GGUF cuantizado con técnica imatrix, lo que apunta a un modelo de lenguaje generativo adaptado o reempaquetado para tareas de clasificación. El recuento real de parámetros en safetensors es de 25.971.339.550 (aproximadamente 26.000 millones), lo que lo sitúa en la franja de los modelos de tamano medio-grande.

La información pública disponible es muy escasa: la model card se limita a declarar la licencia Apache 2.0, sin especificar arquitectura base, datos de entrenamiento, longitud de contexto ni idiomas soportados. El repositorio ocupa 13,3 GB, coherente con una distribución cuantizada (GGUF) de un modelo de ~26B parámetros. No consta pipeline declarado ni resultados de benchmarks.

Su relevancia actual es limitada pero no nula: se trata de un artefacto reciente (creado en noviembre de 2026), con cero descargas y un solo "like", lo que indica que no ha sido validado por la comunidad. Cualquier evaluación rigurosa debe hacerse con cautela y verificando los pesos antes de usarlos en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer decoder-only; no confirmado) |
| Parametros totales | 25.971.339.550 (~26B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con imatrix (niveles concretos no especificados) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de 13,3 GB); recuento de parámetros verificado en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo. El nombre y el etiquetado "conversational" sugieren un transformer decoder-only orientado a diálogo, pero no hay confirmación en la model card ni en los metadatos. Tampoco se documenta el proceso de entrenamiento: no consta el número de tokens, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único detalle técnico reseñable es el uso de cuantización GGUF con imatrix (importance matrix), una técnica que calibra los pesos de cuantización a partir de datos de activación para reducir la pérdida de calidad en precisiones bajas. El tamano del repositorio (13,3 GB) es compatible con una cuantización de 4-5 bits de un modelo de ~26B parámetros, aunque el nivel exacto no se especifica.

## Capacidades

- Generación de texto conversacional: la etiqueta "conversational" indica uso previsto en diálogo multi-turno, aunque no se detallan capacidades concretas.
- Clasificación de texto: el nombre del modelo sugiere una especialización en tareas de clasificación, pero no se documenta el formato de entrada/salida ni las categorías soportadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Clasificación de documentos en pipelines internos: si el modelo cumple lo que su nombre indica, podría emplearse para etiquetar textos (soporte, moderación, triaje) en un servicio propio; conviene validar primero su comportamiento real con un conjunto de evaluación propio.
- Prototipado de asistentes conversacionales: la etiqueta "conversational" y el formato GGUF permiten desplegarlo rápidamente en llama.cpp u Ollama para pruebas de concepto de chat, sin compromiso de producción.
- Experimentación en entornos con GPU de consumo: una cuantización GGUF de ~13 GB puede caber en GPUs de 16-24 GB de VRAM, lo que facilita pruebas locales de un modelo de ~26B.
- Evaluación comparativa de modelos open source: útil como candidato adicional en estudios de benchmarking internos, dado que su licencia Apache 2.0 no impone restricciones de uso.
- Fine-tuning posterior sobre dominios específicos: al ser Apache 2.0 y distribuirse en GGUF, puede servir como base para adaptaciones ligeras (LoRA) si se dispone de los pesos originales en safetensors.
- Investigación sobre cuantización con imatrix: el artefacto permite estudiar la degradación de calidad de un modelo de ~26B bajo cuantización GGUF calibrada, comparándolo con otras variantes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~13-14 GB en la cuantización GGUF distribuida (nivel exacto no especificado); en FP16 serían necesarios ~52 GB.
- GPU recomendadas: para la cuantización publicada, GPU con 16 GB o más (RTX 4080/4090, A5000, L4); para pesos en alta precisión, A100 80 GB o H100.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090 (24 GB) y RTX 4080 (16 GB) con la cuantización GGUF; en GPUs de 12 GB requeriría cuantizaciones más agresivas no publicadas.
- Opciones de despliegue: llama.cpp y Ollama por el formato GGUF; vLLM y TGI solo si se dispone de pesos en safetensors, no incluidos en el repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Zubr-AI/zubr-text-classification-26b | ~26B | no disponible | Apache 2.0 | GGUF | Sin benchmarks ni model card detallada |
| Mistral Small 3 (24B) | 24B | 32K | Apache 2.0 | safetensors, GGUF | Benchmarks publicados y amplia adopción |
| Gemma 3 27B | 27B | 128K | Gemma license | safetensors, GGUF | Multilingüe, benchmarks publicados |
| Qwen2.5 32B | 32B | 128K | Apache 2.0 (mayoría de variantes) | safetensors, GGUF | Fuerte en código y multilingüe |

La comparación es orientativa por tamano; no existen datos de rendimiento de Zubr-AI que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de documentación: no hay model card sustantiva, ni arquitectura, ni datos de entrenamiento, lo que impide evaluar su calidad y procedencia.
- Riesgo de alucinación: desconocido, pero al no haber benchmarks ni validación comunitaria, debe asumirse un riesgo alto en usos sensibles.
- Sesgos conocidos: no documentados; al no conocerse el dataset de entrenamiento, no pueden evaluarse.
- Limitaciones de contexto e idioma: no disponibles; no se declaran idiomas soportados ni longitud de ventana.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías ni información sobre la procedencia de los datos de entrenamiento, lo que puede plantear riesgos de cumplimiento.
- Madurez: cero descargas y un solo "like" en el momento de la ficha; no hay evidencia de uso en producción ni de revisión por parte de la comunidad.
- Formato: solo se distribuye GGUF, lo que limita el despliegue en servidores de alto rendimiento (vLLM/TGI) que requieren safetensors.

## Enlaces

- Hugging Face: https://huggingface.co/Zubr-AI/zubr-text-classification-26b
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
