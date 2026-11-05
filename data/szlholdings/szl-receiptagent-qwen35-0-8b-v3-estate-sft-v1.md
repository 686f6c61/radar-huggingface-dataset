# SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1

## Resumen

SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1 es un ajuste fino (SFT) del modelo base Qwen/Qwen3.5-0.8B, desarrollado por SZLHOLDINGS. El nombre del repositorio sugiere una especialización en el procesamiento de recibos y documentación del sector inmobiliario ("receiptagent" y "estate"), aunque la model card publicada no documenta explícitamente el conjunto de datos de entrenamiento ni el objetivo concreto del ajuste. El modelo se distribuye con licencia Apache 2.0 y está pensado para tareas de conversación multimodal imagen-texto.

El modelo cuenta con 873.438.784 parámetros (aproximadamente 0,87 mil millones) según los pesos en safetensors, lo que lo sitúa en la categoría de modelos pequeños aptos para inferencia en hardware de consumo. Hereda la arquitectura qwen3_5 del modelo base y la pipeline image-text-to-text, por lo que admite entradas de imagen y texto, si bien la model card no detalla las capacidades de visión del ajuste.

La relevancia de este modelo radica en su tamaño reducido y su licencia permisiva, que facilitan el despliegue en entornos con recursos limitados para tareas de extracción de información documental. No obstante, la información publicada es muy escasa: no se documentan datos de entrenamiento, hiperparámetros, benchmarks ni limitaciones, lo que obliga a tratar cualquier uso en producción con cautela y a validar el comportamiento de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia qwen3_5, según tags del repositorio) |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3.5-0.8B, que pertenece a la familia qwen3_5 según los tags del repositorio. Se trata, por tanto, de un transformer decoder-only de aproximadamente 0,87 mil millones de parámetros, adaptado mediante SFT para tareas conversacionales de tipo imagen-texto. El entrenamiento se realizó con Unsloth y la librería TRL de Hugging Face, según indica la model card, lo que sugiere el uso de técnicas de ajuste eficiente en memoria (como LoRA o QLoRA), aunque no se especifican los detalles.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, la presencia de etapas de RLHF o DPO, ni sobre innovaciones técnicas específicas del ajuste. La model card se limita a indicar el modelo base, la licencia y la herramienta de entrenamiento. Tampoco se documenta si el ajuste preserva íntegramente las capacidades multimodales del modelo base o si se centra exclusivamente en texto.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text), según los metadatos del repositorio; el alcance concreto de la visión no está documentado.
- Especialización probable en extracción de información de recibos y documentación inmobiliaria, inferida del nombre del repositorio, no confirmada en la model card.
- Compatibilidad con text-generation-inference y transformers, según los tags.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: solo se declara inglés.
- Modo thinking, visión avanzada o audio: no disponible.

## Casos de uso

- Extracción de datos de recibos: el modelo puede emplearse para convertir el contenido de un recibo en campos estructurados (importe, fecha, comercio), aprovechando su naturaleza image-text-to-text. Es adecuado por su tamaño reducido, que permite ejecutarlo en local, aunque requiere validación empírica previa.
- Procesamiento de documentación inmobiliaria: dado el sufijo "estate" del nombre, podría usarse para resumir o clasificar contratos y documentos de propiedad; conviene verificar su rendimiento real antes de integrarlo.
- Asistente conversacional de atención al cliente: al ser un modelo conversacional pequeño, puede gestionar diálogos multi-turno en inglés con bajo coste de inferencia, siempre que la longitud de contexto del modelo base sea suficiente para el caso.
- Clasificación y etiquetado de documentos escaneados: combinado con un pipeline OCR, el modelo puede asignar categorías a imágenes de documentos en flujos de digitalización.
- Prototipado rápido en entornos con GPU de consumo: su tamaño inferior a 1.000 millones de parámetros permite iterar en estaciones de trabajo sin infraestructura dedicada.
- Filtrado y enrutamiento en pipelines documentales: puede actuar como primer clasificador para decidir qué documentos requieren procesamiento más profundo por un modelo mayor.
- Despliegue en el borde (edge): su reducido tamaño facilita la inferencia en dispositivos con recursos limitados para tareas de extracción sencillas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB en precisión nativa (fp16/bf16) para los pesos, más el overhead de activaciones y del procesador de visión; en cuantización de 8 bits podría rondar 1 GB y en 4 bits unos 0,6 GB, aunque no se publican variantes cuantizadas oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para fp16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas, siendo estas dos últimas sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más de VRAM en fp16; en cuantización podría caber en GPUs de 2 GB.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag), Unsloth para ajuste; no se documenta compatibilidad con vLLM, llama.cpp u Ollama, y al no haber pesos GGUF publicados, llama.cpp requeriría conversión manual.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Modalidad | Disponibilidad |
|---|---|---|---|---|---|
| szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1 | 873 M | no disponible | Apache 2.0 | imagen-texto | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la información | imagen-texto | Hugging Face |
| Alternativas de menos de 1 B para documentación | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre este ajuste y el modelo base ni con otras alternativas, por lo que la comparativa se limita a parámetros, licencia y modalidad.

## Limitaciones y advertencias

- Información documental muy escasa: no se detallan datos de entrenamiento, hiperparámetros ni evaluación, lo que impide conocer el alcance real del ajuste.
- Riesgo de alucinación: como todo modelo generativo de tamaño reducido, puede inventar campos o valores al extraer información de documentos; requiere validación y verificación posterior.
- Sesgos conocidos: no documentados; al entrenarse sobre un dataset no especificado, pueden persistir sesgos del modelo base y del corpus de ajuste.
- Limitación de idioma: solo se declara inglés, por lo que su uso en castellano no está soportado oficialmente.
- Longitud de contexto: no disponible; podría ser insuficiente para documentos largos o conversaciones extensas.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base Qwen3.5-0.8B, cuya licencia no se detalla en la información disponible.
- Sin variantes cuantizadas oficiales ni pesos GGUF: el despliegue en llama.cpp u Ollama requiere conversión manual.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso ni validación por parte de la comunidad.

## Enlaces

- [Hugging Face: SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1](https://huggingface.co/SZLHOLDINGS/szl-receiptagent-qwen35-0.8b-v3-estate-sft-v1)
- [Modelo base: Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Unsloth](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
