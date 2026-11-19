# xl-24/gemma4-12b-atc-finetune-32-64-v2-merged-16bit

## Resumen

El modelo `xl-24/gemma4-12b-atc-finetune-32-64-v2-merged-16bit` es un ajuste fino (fine-tuning) del modelo base `unsloth/gemma-4-12B-it`, publicado por el usuario xl-24 en Hugging Face. Se trata de un modelo multimodal de tipo image-text-to-text (procesa imagenes y texto) con 11.959.730.224 parametros totales, distribuidos en pesos de 16 bits en formato safetensors, lo que resulta en un repositorio de 24 GB. El pipeline declarado es image-text-to-text y la libreria de referencia es transformers.

El ajuste fino se ha realizado empleando Unsloth y la libreria TRL de Hugging Face, segun indica la propia model card, lo que sugiere un entrenamiento optimizado en memoria y velocidad (el autor afirma que se entreno "2x faster" con Unsloth). El nombre del modelo incluye la referencia "atc-finetune-32-64-v2", que sugiere un ajuste orientado a un dominio concreto (posiblemente control de trafico aereo, "ATC", aunque no se especifica en la informacion disponible) con una configuracion de 32-64 (probablemente rango de contexto o parametros de entrenamiento, no confirmado).

La relevancia de este modelo es limitada por el momento: cuenta con 0 descargas y 0 likes, y la model card es extremadamente escueta, sin detallar el dataset de entrenamiento, los benchmarks ni las capacidades especificas adquiridas tras el ajuste. La licencia apache-2.0 permite uso comercial, pero la falta de documentacion tecnica hace recomendable precaucion antes de desplegarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | gemma4_unified (transformer multimodal, segun tag del repo) |
| Parametros totales | 11.959.730.224 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en 16 bits) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura declarada es `gemma4_unified`, un tag que sugiere una variante unificada de la familia Gemma 4 de Google, orientada a tareas multimodales (image-text-to-text). El modelo base es `unsloth/gemma-4-12B-it`, una version instruction-tuned de 12B parametros. El ajuste fino se ha realizado con Unsloth y TRL, herramientas que permiten entrenamiento LoRA/QLoRA eficiente en memoria; el resultado se ha fusionado (merged) y exportado en 16 bits, de ahi el sufijo "merged-16bit" del nombre.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO adicionales. El sufijo "32-64-v2" podria referirse a una configuracion de contexto de 32K-64K o a hiperparametros de entrenamiento, pero no se confirma en la model card. Tampoco se documentan innovaciones tecnicas especificas del ajuste (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de texto conversacional en ingles (modelo instruction-tuned heredado del base).
- Procesamiento de imagenes y texto combinados (pipeline image-text-to-text).
- Razonamiento y generacion de codigo (capacidades heredadas del base Gemma 4 12B IT, no verificadas tras el ajuste).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado.
- Capacidades multilingues: limitadas a ingles segun el campo `language`.
- Capacidades especiales (thinking mode, audio, vision): vision confirmada por el pipeline; el resto no disponible.

## Casos de uso

- Asistencia conversacional en ingles con entrada de imagenes: el modelo puede recibir una imagen y mantener un dialogo multi-turno sobre ella, adecuado para prototipos de asistentes visuales.
- Procesamiento de documentacion tecnica escaneada: al ser image-text-to-text, puede extraer y razonar sobre texto contenido en imagenes, util para digitalizacion de manuales.
- Ajuste especifico de dominio (ATC): el nombre sugiere un fine-tuning orientado a control de trafico aereo; podria emplearse en tareas de interpretacion de pantallas de radar o transcripcion de comunicaciones, aunque no hay documentacion que lo confirme.
- Base para experimentacion con Unsloth/TRL: sirve como punto de partida para nuevos ajustes finos, ya que se publica en 16 bits y es compatible con transformers.
- Generacion de codigo asistida: hereda la capacidad del base Gemma 4 12B IT para tareas de programacion, util en entornos de desarrollo con documentacion en ingles.
- Despliegue en endpoints compatibles: el tag `endpoints_compatible` indica que puede servirse en infraestructuras tipo Hugging Face Inference Endpoints o TGI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 24 GB solo para pesos, mas overhead de activaciones y KV cache (estimacion: 28-32 GB para contexto moderado).
- GPU recomendadas: A100 40GB, H100 80GB, L40S 48GB para inferencia en 16 bits sin cuantizar.
- GPU consumer: no cabe en RTX 4090 (24 GB) en 16 bits sin cuantizacion; requeriria cuantizacion a 8 o 4 bits (no publicada en el repo).
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM (si el modelo es compatible), llama.cpp/Ollama solo tras conversion a GGUF (no disponible en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xl-24/gemma4-12b-atc-finetune-32-64-v2-merged-16bit | 11.96B | no disponible | apache-2.0 | Hugging Face (0 descargas) |
| unsloth/gemma-4-12B-it (base) | ~12B | no disponible | no disponible | Hugging Face |
| Gemma 3 12B IT (referencia de familia) | 12B | 128K (segun version) | Gemma license | Hugging Face |

No se dispone de datos de rendimiento del modelo ajustado para comparar con alternativas; la comparativa se limita a parametros y licencia.

## Limitaciones y advertencias

- Model card extremadamente escueta: no se documenta el dataset de entrenamiento, lo que impide evaluar sesgos o calidad del ajuste.
- Riesgo de alucinacion: inherente a los modelos generativos; sin benchmarks no se puede acotar.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Contexto: no se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.
- Licencia apache-2.0: permite uso comercial, pero el modelo base (`unsloth/gemma-4-12B-it`) podria tener terminos adicionales de la familia Gemma que conviene verificar.
- Sin cuantizaciones publicadas: el repo solo contiene pesos en 16 bits, lo que limita el despliegue en hardware consumer.
- Cero descargas y validacion de la comunidad: no hay evidencia de uso en produccion ni reportes de calidad.
- El sufijo "atc-finetune" sugiere un dominio muy especifico; su uso fuera de ese dominio puede degradar el rendimiento respecto al base.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-12b-atc-finetune-32-64-v2-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth: https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
