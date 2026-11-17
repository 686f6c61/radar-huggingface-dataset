# SvalTek/MN-Thinker-Base

## Resumen

MN-Thinker-Base es un modelo de lenguaje de 12.247.782.400 parámetros (aproximadamente 12,25 mil millones) publicado por SvalTek en Hugging Face. Se trata de un ajuste fino (fine-tune) en precisión de 16 bits (FP16) derivado del modelo SvalTek/MN-CharThink-12B-KTO-Test0, que a su vez emplea la arquitectura Mistral. El modelo está orientado a generación de texto y conversación, y se distribuye bajo licencia Apache 2.0.

El modelo se entrenó con Unsloth y la librería TRL de Hugging Face, según indica la propia model card, lo que sugiere un pipeline de ajuste fino supervisado o preferencial optimizado para velocidad. La información pública disponible es muy limitada: no se detallan composición del dataset, número de tokens de entrenamiento, ni resultados de evaluación. La model card es prácticamente un esqueleto generado automáticamente por la plantilla de Unsloth.

Su relevancia actual es reducida en términos de adopción (0 descargas y 0 likes en el momento de la consulta), pero resulta interesante como ejemplo de fine-tune ligero sobre una base Mistral de 12B con licencia permisiva, lo que facilita su uso comercial y su experimentación. No obstante, la ausencia de documentación técnica y de benchmarks limita seriamente su evaluación rigurosa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Mistral, según tags del repo) |
| Parámetros totales | 12.247.782.400 (≈12,25 B) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica pesos en FP16; se asume compatibilidad con cuantizaciones estándar de la familia Mistral, pero no se documenta) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La información disponible indica que el modelo pertenece a la familia Mistral (tag `mistral`) y que se distribuye como un fine-tune en FP16 del modelo SvalTek/MN-CharThink-12B-KTO-Test0. No se especifica si la arquitectura subyacente emplea atención con ventana deslizante, GQA (grouped-query attention) u otras variantes propias de Mistral, aunque por el tamaño (12,25 B) y la nomenclatura es plausible que herede la configuración de Mistral NeMo 12B o similar; esto no está confirmado en la documentación.

El entrenamiento se realizó con Unsloth y TRL, herramientas habitualmente usadas para ajuste fino supervisado (SFT) y optimización de preferencias (DPO/KTO). El nombre del modelo base incluye "KTO", lo que sugiere que la base se entrenó con Kahneman-Tversky Optimization, pero no se aportan detalles sobre el dataset, el número de tokens, la mezcla de datos ni si hubo etapas adicionales de RLHF. No se documentan innovaciones técnicas específicas más allá del uso de Unsloth para acelerar el entrenamiento.

## Capacidades

- Generación de texto en inglés y conversación multi-turno (tag `conversational`).
- Compatible con text-generation-inference (TGI) y con la librería transformers.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Razonamiento, código y matemáticas: no documentados; no hay benchmarks que lo confirmen.

## Casos de uso

- Generación de texto conversacional en inglés: el modelo puede emplearse como chatbot de propósito general en inglés, aprovechando su ajuste conversacional y su tamaño de 12B para respuestas coherentes en dominios generales.
- Prototipado rápido de asistentes: al estar disponible en safetensors y ser compatible con transformers y TGI, se puede desplegar en entornos de experimentación para validar flujos de conversación antes de invertir en modelos mayores.
- Fine-tuning posterior: su licencia Apache 2.0 y su tamaño contenido permiten usarlo como base para ajustes específicos de dominio en inglés sin restricciones comerciales.
- Investigación sobre optimización de preferencias: dado que su base se entrenó con KTO, sirve como punto de partida para estudiar el efecto de distintas etapas de alineación sobre un modelo Mistral de 12B.
- Evaluación comparativa de fine-tunes: útil en estudios que comparen el rendimiento de fine-tunes ligeros (Unsloth + TRL) frente a modelos base sin ajustar.
- Generación de contenido en inglés para pipelines internos: con la debida cautela por la falta de benchmarks, puede integrarse en flujos de generación de borradores o resúmenes en inglés donde se requiera validación humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 24,5 GB solo para pesos (12,25 B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 32 GB de VRAM para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 13-14 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 7-8 GB para pesos, más overhead.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para FP16 sin compromisos; RTX 4090 (24 GB) puede alojar el modelo en FP16 muy justo o en 8 bits con holgura.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en cuantización de 8 bits o 4 bits; en FP16 requiere al menos 32 GB, por lo que no cabe en GPUs de consumo de 24 GB sin cuantizar.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (previa conversión), llama.cpp/Ollama (previa conversión a GGUF, no publicada en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SvalTek/MN-Thinker-Base | ≈12,25 B | no disponible | Apache 2.0 | Hugging Face, safetensors | Fine-tune de Mistral 12B; sin benchmarks |
| Mistral NeMo 12B (referencia de familia) | 12 B | 128k (según documentación pública de Mistral) | Apache 2.0 | Hugging Face | Modelo base ampliamente documentado; contexto largo |
| Mistral 7B Instruct | 7,3 B | 32k | Apache 2.0 | Hugging Face | Menor tamaño, amplia adopción y ecosistema |
| Gemma 2 9B | 9 B | 8k | Gemma license | Hugging Face | Licencia no Apache; buen rendimiento en benchmarks públicos |

La comparación con Mistral NeMo 12B es la más directa por tamaño y familia, pero no se dispone de datos que permitan afirmar que MN-Thinker-Base iguale o supere su rendimiento. Frente a Mistral 7B Instruct y Gemma 2 9B, el modelo de SvalTek ofrece mayor número de parámetros, pero carece de la documentación y evaluación que respaldan a esos modelos.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar su calidad frente a modelos de referencia.
- Documentación mínima: la model card no detalla dataset, contexto, ni proceso de alineación, lo que dificulta la reproducibilidad.
- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos en inglés, es probable que herede sesgos de esos corpus, pero no hay análisis disponible.
- Riesgo de alucinación: no evaluado; sin benchmarks ni pruebas de robustez, debe asumirse un riesgo estándar o superior al de modelos mejor documentados.
- Limitación de idioma: solo se declara inglés; el rendimiento en castellano u otros idiomas no está garantizado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificación empírica.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe asumir la responsabilidad de validar el modelo en producción, dado que el autor no ofrece garantías ni evaluaciones.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/SvalTek/MN-Thinker-Base
- Modelo base: https://huggingface.co/SvalTek/MN-CharThink-12B-KTO-Test0
- Unsloth (herramienta de entrenamiento): https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
