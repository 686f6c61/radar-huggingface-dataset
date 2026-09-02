# Yong-Hoon/MIAI_VLM_0.2

## Resumen

MIAI-VLM 0.2 es un modelo de visión-lenguaje (VLM) bilingüe coreano/inglés desarrollado por Yong-Hoon (KETI), construido sobre el modelo base `google/gemma-4-E4B-it` de Google. Se trata de un fine-tuning con LoRA (r=32, α=64) aplicado a todas las capas lineales del modelo de lenguaje, manteniendo congeladas las torres de visión y audio del base. El modelo está diseñado para tareas de image-text-to-text, es decir, puede procesar imágenes y texto para generar respuestas en lenguaje natural.

El modelo se entrenó sobre 54,0 millones de muestras (29% image-text, 71% texto) con una composición del 46% en coreano y 54% en inglés, durante aproximadamente 61 días en 16 GPUs RTX 3090. El snapshot publicado corresponde al paso 1.000.000 de 2.531.640 (época 1,19 de 3), por lo que es un checkpoint intermedio de un entrenamiento aún en curso. Con 7.941.100.832 parámetros totales, el modelo ofrece capacidades multimodales en un rango de tamaño que permite su despliegue en GPUs de consumo con cuantización.

La relevancia de este modelo radica en su enfoque bilingüe coreano-inglés, un área con menos oferta de modelos VLM open source, y en su integración con el ecosistema Gemma 4, que incluye soporte para thinking mode y un pipeline de transformers estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-lenguaje) basado en google/gemma-4-E4B-it |
| Parametros totales | 7.941.100.832 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenado con secuencias de 1024 tokens) |
| Tipos de cuantizacion | No disponible (pesos en bf16) |
| Idiomas soportados | Coreano, ingles |
| Licencia | Apache-2.0 (con enlace a la licencia Gemma de Google) |
| Formato de pesos | safetensors (merged bf16) y adapter LoRA (~280 MB) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E4B-it`, un modelo multimodal de 8.0B parámetros que incluye torres de visión y audio. Sobre este base, se aplicó un fine-tuning con LoRA (r=32, α=64) en todas las capas lineales del modelo de lenguaje, lo que supone 69,8 millones de parámetros entrenables. Las torres de visión y audio permanecieron congeladas durante el entrenamiento.

El entrenamiento se realizó con LLaMA-Factory 0.9.6, transformers 5.6 y PEFT 0.18, utilizando 16 GPUs RTX 3090 en 2 nodos, con un batch efectivo de 64, learning rate 2e-4 con scheduler coseno, secuencias de 1024 tokens y precisión bf16. El dataset combinó 54,0 millones de muestras: 29% image-text y 71% texto, con un 46% en coreano y 54% en inglés, procedentes de 191 datasets. No se menciona el uso de RLHF o DPO; se trata de un fine-tuning supervisado estándar. El snapshot publicado tiene una loss de entrenamiento de 0,921 (EMA) y representa el 39,5% del total de pasos planificados.

## Capacidades

- Generación de texto y respuestas a preguntas con entrada de imágenes (image-text-to-text).
- Soporte de thinking mode: el modelo fue entrenado con `enable_thinking=True` y el system prompt `You are a helpful assistant.`, lo que permite razonamiento interno antes de responder.
- Bilingüe coreano/inglés: puede procesar y generar texto en ambos idiomas, con un sesgo de entrenamiento hacia el coreano (46% de los datos).
- Capacidad de procesamiento de imágenes: al estar basado en Gemma-4-E4B-it, hereda las capacidades de visión del modelo base.
- No se dispone de información sobre tool calling, function calling, agentes o capacidades de audio en este snapshot.

## Casos de uso

- Descripción y análisis de imágenes en coreano o inglés: el modelo puede generar descripciones detalladas de fotografías, diagramas o ilustraciones, útil para aplicaciones de accesibilidad o documentación.
- Asistente de atención al cliente con soporte visual: integrado en un chatbot, puede recibir capturas de pantalla o fotos de productos y responder en el idioma del usuario (coreano o inglés) con instrucciones o soluciones.
- Educación bilingüe: creación de materiales didácticos que combinan imágenes y texto, con explicaciones generadas automáticamente en ambos idiomas.
- Moderación de contenido visual: análisis de imágenes para detectar contenido inapropiado o clasificar imágenes según categorías, con respuestas en lenguaje natural.
- Análisis de documentos escaneados: extracción de información de facturas, formularios o tarjetas de visita a partir de imágenes, generando resúmenes o datos estructurados en texto.
- Asistente de investigación: ayuda a investigadores a describir figuras, gráficos o resultados experimentales en inglés o coreano, facilitando la redacción de artículos o informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bf16 (~16 GB), se requieren al menos 20-24 GB de VRAM para cargar el modelo completo con overhead de activaciones. Con cuantización a 4 bits (no disponible en el repo, pero posible mediante herramientas externas), podría reducirse a ~8-10 GB.
- GPU recomendadas: RTX 3090, RTX 4090, A100, H100 o cualquier GPU con 24 GB o más de VRAM para bf16. Para cuantización ligera, una RTX 3060 de 12 GB podría ser suficiente.
- El modelo cabe en GPUs de consumo de gama alta (RTX 3090/4090) en bf16, y en GPUs de gama media con cuantización.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), vLLM, TGI, o llama.cpp si se convierte a GGUF (no incluido en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos VLM de características similares. El modelo base `google/gemma-4-E4B-it` es su referencia directa, pero no se han publicado métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Entrenamiento incompleto: el snapshot corresponde al paso 1.000.000 de 2.531.640 (época 1,19 de 3), por lo que el modelo no ha convergido completamente y puede presentar comportamientos subóptimos en tareas complejas.
- Sesgos lingüísticos: al estar entrenado con un 46% de datos en coreano, el rendimiento en inglés puede verse afectado, y los sesgos culturales de los datos coreanos pueden estar presentes.
- Riesgo de alucinación: como todo modelo generativo, puede producir respuestas factualmente incorrectas, especialmente en tareas de razonamiento o con imágenes ambiguas.
- Limitaciones de contexto: la longitud de contexto no está especificada, pero el entrenamiento usó secuencias de 1024 tokens, lo que sugiere un contexto relativamente corto para aplicaciones de documentos largos.
- Licencia: aunque el repositorio indica Apache-2.0, el modelo base está sujeto a la licencia Gemma de Google, que puede imponer restricciones adicionales de uso comercial. Se recomienda revisar el enlace a la licencia.
- Sin soporte para tool calling ni agentes: no se ha entrenado para estas capacidades, por lo que no es adecuado para pipelines de automatización que requieran llamadas a funciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Yong-Hoon/MIAI_VLM_0.2
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Licencia Gemma: https://ai.google.dev/gemma/docs/gemma_4_license
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
