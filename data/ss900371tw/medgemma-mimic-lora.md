# ss900371tw/medgemma-MIMIC-lora

## Resumen

El modelo `ss900371tw/medgemma-MIMIC-lora` es un ajuste fino (fine-tuning) en formato LoRA del modelo base `unsloth/medgemma-1.5-4b-it`, que a su vez es una variante de MedGemma 1.5 4B desarrollada por Google DeepMind para aplicaciones médicas. El autor, `ss900371tw`, ha entrenado este adaptador sobre el conjunto de datos MIMIC (Medical Information Mart for Intensive Care), un repositorio de registros clínicos anonimizados, con el objetivo de especializar el modelo en tareas de comprensión y generación de texto médico.

Al tratarse de un LoRA, el modelo conserva la arquitectura multimodal de MedGemma 1.5 4B (texto e imagen) y añade un conocimiento clínico específico sin necesidad de reentrenar todos los parámetros. Esto lo hace especialmente relevante para desarrolladores que necesitan un modelo médico ligero, con licencia Apache 2.0 y capaz de ejecutarse en hardware de consumo. El repositorio tiene un tamaño de 0,9 GB y está publicado en Hugging Face con formato safetensors, compatible con text-generation-inference y la librería transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3 4B con encoder SigLIP) |
| Parametros totales | 4B (aproximadamente, del modelo base) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin GGUF publicado) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base, MedGemma 1.5 4B, es una variante de Gemma 3 con un encoder de visión SigLIP preentrenado específicamente en datos médicos (CT, MRI, histopatología y radiografías de tórax). La arquitectura es un transformer multimodal que procesa tanto texto como imágenes. El adaptador LoRA se ha entrenado sobre el dataset MIMIC, que contiene historias clínicas, informes de alta, notas de enfermería y otros documentos médicos. El entrenamiento se realizó con la librería Unsloth, que acelera el proceso (según la model card, 2x más rápido), y con TRL (Transformer Reinforcement Learning). No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas como RLHF o DPO. Al ser un LoRA, solo se actualizaron un pequeño subconjunto de parámetros, lo que reduce los requisitos de memoria y cómputo.

## Capacidades

- Generación y comprensión de texto médico en inglés, incluyendo terminología clínica y redacción de informes.
- Procesamiento de imágenes médicas (rayos X, CT, MRI, histopatología) gracias al encoder SigLIP del modelo base.
- Razonamiento sobre datos clínicos estructurados y no estructurados, como historias clínicas electrónicas.
- Soporte de tool calling y function calling, heredado de Gemma 3, lo que permite integrarlo en agentes y pipelines.
- Capacidad multilingüe limitada al inglés (el modelo base soporta más idiomas, pero el fine-tuning se centra en inglés médico).
- No se ha confirmado un modo de pensamiento explícito (thinking mode) ni capacidades de audio.

## Casos de uso

- Resumen automático de historias clínicas: el modelo puede condensar notas médicas extensas en resúmenes concisos para revisión rápida, aprovechando su entrenamiento en MIMIC.
- Extracción de información clínica: dado un informe de alta, puede extraer diagnósticos, medicamentos, alergias y procedimientos en formato estructurado.
- Generación de informes radiológicos: a partir de una imagen médica (rayos X, CT), el modelo puede redactar un informe descriptivo, aunque se recomienda supervisión humana.
- Asistente de documentación para profesionales sanitarios: integrado en un sistema de registro electrónico, puede ayudar a completar campos y redactar notas de evolución.
- Chatbot de atención al paciente: con tool calling, puede responder preguntas frecuentes sobre síntomas, medicación o citas, derivando a un humano cuando sea necesario.
- Investigación clínica: análisis de grandes volúmenes de texto médico para identificar patrones, comorbilidades o efectos adversos, gracias a su contexto largo (aunque no se ha confirmado la longitud exacta).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K para este adaptador concreto. El rendimiento dependerá del modelo base MedGemma 1.5 4B, cuyos resultados oficiales se pueden consultar en la documentación de Google DeepMind, pero no se han replicado aquí.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4B parámetros, en FP16 requiere aproximadamente 8 GB de VRAM; con cuantización int8 baja a ~4 GB y con int4 a ~2 GB. Estas cifras son estimaciones orientativas basadas en el tamaño del modelo, no en mediciones reales.
- GPU recomendadas: tarjetas consumer como RTX 3060 (12 GB), RTX 4070 (12 GB) o RTX 4090 (24 GB) pueden ejecutar el modelo sin problemas. En entornos profesionales, A100 o H100 ofrecen mayor throughput.
- Sí cabe en GPUs consumer, especialmente con cuantización 4-bit.
- Opciones de despliegue: al ser compatible con transformers y text-generation-inference, se puede servir con vLLM, TGI, Ollama (si se convierte a GGUF) o llama.cpp.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ss900371tw/medgemma-MIMIC-lora | 4B (LoRA) | no disponible | Apache 2.0 | Hugging Face |
| MedGemma 1.5 4B IT (base) | 4B | no disponible | Apache 2.0 | Hugging Face / Google |
| ss900371tw/medgemma-finetuned-lora | 4B (LoRA) | no disponible | Apache 2.0 | Hugging Face |

El adaptador MIMIC se diferencia del modelo base por su especialización en datos clínicos, mientras que el otro LoRA del mismo autor (medgemma-finetuned-lora) podría tener un propósito similar, aunque no se dispone de detalles. No se han encontrado comparaciones con otros modelos médicos como BioMistral o Meditron en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: los datos MIMIC provienen de pacientes de UCI de un solo centro hospitalario, lo que puede introducir sesgos demográficos y clínicos. No se ha evaluado su generalización a otras poblaciones.
- Riesgo de alucinación: como todo modelo generativo, puede producir información médica incorrecta o inventada. No debe utilizarse como herramienta de diagnóstico sin supervisión humana.
- Limitaciones de contexto: la longitud de contexto no está documentada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- Restricciones de idioma: el fine-tuning se centra en inglés; el rendimiento en otros idiomas puede degradarse significativamente.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el dataset MIMIC tiene sus propias restricciones de acceso y uso (requiere aprobación de PhysioNet). El autor no especifica si el modelo se distribuye bajo los términos de MIMIC.
- Caveat para producción: al ser un LoRA, el modelo depende del base MedGemma; cualquier actualización del base podría requerir reentrenamiento del adaptador.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/ss900371tw/medgemma-MIMIC-lora
- Página oficial de MedGemma (Google DeepMind): https://deepmind.google/models/gemma/medgemma/
- Repositorio GitHub de Google-Health/medgemma: https://github.com/google-health/medgemma
- Otro LoRA del mismo autor: https://huggingface.co/ss900371tw/medgemma-finetuned-lora
- Perfil de GitHub del autor: https://github.com/ss900371tw/
