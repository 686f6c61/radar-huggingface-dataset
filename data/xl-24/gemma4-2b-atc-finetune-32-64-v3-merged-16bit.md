# xl-24/gemma4-2b-atc-finetune-32-64-v3-merged-16bit

## Resumen

El modelo `xl-24/gemma4-2b-atc-finetune-32-64-v3-merged-16bit` es un ajuste fino (finetune) publicado por el usuario xl-24 sobre la base `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, una variante cuantizada a 4 bits de Gemma 4 E2B instruida. El nombre del repositorio sugiere un ajuste orientado a una tarea concreta (la abreviatura "atc" y los sufijos "32-64" y "v3" apuntan a un entrenamiento con ventanas de contexto o longitudes de secuencia de 32 a 64, en su tercera iteración), aunque la model card no documenta el dataset ni el objetivo exacto del ajuste. El resultado se distribuye fusionado en 16 bits (`merged-16bit`), lo que facilita su carga directa con transformers sin necesidad de aplicar adaptadores PEFT.

Se trata de un modelo multimodal de tipo image-text-to-text, según declara el pipeline en Hugging Face, lo que implica que hereda las capacidades de visión y texto del Gemma 4 E2B original. El repositorio real contiene 5.123.178.051 parámetros en safetensors (aproximadamente 5,12 mil millones, no 2 mil millones como sugiere el nombre comercial), con un tamaño de repo de 10,3 GB, coherente con pesos en bf16/fp16. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Es relevante ahora porque ejemplifica el flujo típico de ajuste fino eficiente con Unsloth y TRL sobre modelos Gemma 4, y porque permite a desarrolladores evaluar un checkpoint ya fusionado y listo para inference, sin la sobrecarga de gestionar adaptadores LoRA. No obstante, la documentación es mínima y no se han publicado benchmarks ni detalles de entrenamiento, por lo que su utilidad práctica debe validarse empíricamente antes de llevarlo a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), base Gemma 4 E2B |
| Parametros totales | 5.123.178.051 (según safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El repo se distribuye en 16 bits fusionado; la base original era bnb-4bit; se desconoce si se han publicado GGUF/AWQ/GPTQ |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers); sin GGUF publicado en el repo |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Gemma 4 E2B, un transformer multimodal que procesa entradas de imagen y texto y genera texto. El checkpoint publicado es el resultado de un ajuste fino supervisado (SFT) sobre la variante instruida cuantizada a 4 bits de Unsloth, entrenado con Unsloth y la librería TRL de Hugging Face, según declara el autor. El proceso de entrenamiento se realizó presumiblemente con LoRA/QLoRA sobre la base cuantizada y posteriormente se fusionaron los adaptadores y se convirtieron los pesos a 16 bits, de ahí el sufijo `merged-16bit`.

No se especifica en la model card el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). Tampoco se documenta la longitud de contexto con la que se entrenó, aunque los sufijos "32-64" del nombre podrían referirse a tamaños de secuencia o ventanas de contexto usadas durante el ajuste; esto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Gemma 4 E2B-it.
- Procesamiento de imágenes y texto (pipeline image-text-to-text), incluyendo preguntas y respuestas sobre imágenes.
- Razonamiento multi-turno dentro de los límites de contexto del modelo base (no documentados en este repo).
- Soporte de tool calling / function calling: no disponible en la información proporcionada (depende del modelo base, no confirmado aquí).
- Capacidades de agente y razonamiento multi-paso: no documentadas para este finetune.
- Capacidades multilingües: limitadas al inglés según el campo `language: en`.
- Modo "thinking" explícito: no documentado.

## Casos de uso

- Asistente conversacional especializado en un dominio concreto: dado que el nombre sugiere un ajuste "atc" (posiblemente atención al cliente, control de tráfico aéreo u otra tarea vertical), puede emplearse como chatbot de soporte en inglés con contexto multi-turno, siempre que se valide su comportamiento en el dominio objetivo.
- Descripción y análisis de imágenes: al ser un modelo image-text-to-text, puede usarse para generar descripciones, responder preguntas sobre capturas, diagramas o documentos escaneados en inglés.
- Prototipado rápido en investigación: al estar fusionado en 16 bits y ser compatible con transformers y TGI, permite cargarlo directamente para experimentos de evaluación sin gestionar adaptadores.
- Extracción de información de documentos con imagen: útil para pipelines de document understanding en inglés donde se requiera combinar OCR implícito con generación de texto.
- Generación de respuestas en entornos de bajo presupuesto de ingeniería: el checkpoint fusionado simplifica el despliegue frente a alternativas con LoRA separado.
- Base para nuevos ajustes finos: al ser Apache 2.0 y estar en safetensors, puede servir como punto de partida para SFT adicional en dominios específicos.
- Evaluación comparativa de técnicas de ajuste: útil para estudiar el efecto de QLoRA + fusión a 16 bits frente al modelo base original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 10-11 GB solo para pesos (5,12 mil millones de parámetros × 2 bytes), más overhead de activaciones y KV cache, por lo que se recomienda al menos 16-24 GB de VRAM para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100, L40S para despliegue con concurrencia; RTX 4090 (24 GB) o RTX A6000 (48 GB) para uso individual.
- ¿Cabe en GPU consumer? Sí, en RTX 4090 (24 GB) en 16 bits con margen limitado; en GPUs de 12-16 GB requeriría cuantización adicional (no publicada en el repo).
- Opciones de despliegue: transformers (nativo), text-generation-inference (TGI, etiqueta `text-generation-inference`), vLLM (previa conversión/validación), llama.cpp/Ollama solo si se generan pesos GGUF (no incluidos).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune-32-64-v3-merged-16bit | 5,12 B | no disponible | imagen+texto | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible | no disponible | imagen+texto | Apache 2.0 (según base) | Hugging Face |
| Gemma 4 E2B-it (original) | no disponible | no disponible | imagen+texto | Apache 2.0 | Hugging Face / Google |

No se dispone de datos de rendimiento comparativo ni de otros finetunes comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- La model card es mínima: no documenta dataset, hiperparámetros, evaluación ni dominio objetivo, lo que dificulta reproducir o validar el ajuste.
- Riesgo de alucinación inherente a los modelos generativos; sin benchmarks no hay evidencia de mitigación.
- Idioma limitado al inglés según el campo `language`, lo que restringe su uso en castellano u otros idiomas.
- El nombre del repositorio menciona "2b" pero el recuento real de safetensors es de 5,12 mil millones de parámetros; conviene no fiarse del nombre para estimar requisitos de memoria.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Gemma 4 conviene revisar los términos de la licencia del modelo base por si imponen condiciones adicionales.
- Ausencia de cuantizaciones publicadas (GGUF, AWQ, GPTQ) limita el despliegue en hardware consumer de gama media.
- El ajuste se realizó sobre una base ya cuantizada a 4 bits y luego se fusionó a 16 bits; esta cadena puede introducir degradaciones respecto a un ajuste directo en precisión completa.
- Sin datos de benchmarks, no se recomienda su uso en producción sin una evaluación propia en el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-2b-atc-finetune-32-64-v3-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
