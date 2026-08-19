# tensorsoft/medical-llama-3b-asclepius-lora

## Resumen

`tensorsoft/medical-llama-3b-asclepius-lora` es un adaptador LoRA (Low-Rank Adaptation) diseñado para especializar el modelo base `unsloth/llama-3.2-3b-instruct-bnb-4bit` en tareas de generación de texto médico. El nombre "Asclepius" hace referencia al proyecto de código abierto homónimo, que busca crear modelos clínicos entrenados con notas clínicas sintéticas para evitar problemas de privacidad de los datos reales de pacientes. Este adaptador pretende llevar esa idea a un modelo más pequeño (3B parámetros) y eficiente.

El repositorio contiene únicamente los pesos del adaptador (0.1 GB) en formato PEFT, sin model card detallada, sin licencia especificada y sin datos de entrenamiento o evaluación. El modelo base es Llama 3.2 3B Instruct, cuantizado a 4 bits mediante bitsandbytes para el entrenamiento con LoRA. La relevancia de este modelo radica en su potencial para desplegar asistentes médicos en entornos con recursos limitados, aunque la falta de documentación y validación pública limita seriamente su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama 3.2 3B Instruct) con adaptador LoRA |
| Parametros totales | 3.2B (modelo base) + adaptador LoRA (no especificado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128k tokens (modelo base, no confirmado para el adaptador) |
| Tipos de cuantizacion | bnb 4-bit (modelo base), adaptador en precision original |
| Idiomas soportados | no disponible (modelo base: principalmente ingles) |
| Licencia | no disponible (el modelo base usa Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre `unsloth/llama-3.2-3b-instruct-bnb-4bit`. La arquitectura subyacente es un transformer decoder-only estándar de Llama 3.2 con 3.2 mil millones de parámetros, entrenado originalmente con 9 billones de tokens y optimizado para instrucciones y diálogo. El adaptador LoRA introduce matrices de bajo rango en las capas de atención y MLP, lo que permite un fine-tuning eficiente en cuanto a memoria y cómputo.

No se proporciona información sobre el dataset de entrenamiento, el número de pasos, el rango del adaptador, la tasa de aprendizaje ni el régimen de entrenamiento. El nombre sugiere que se usaron datos sintéticos médicos siguiendo la metodología de Asclepius, pero esto no está confirmado en la documentación. Tampoco se indica si se aplicaron técnicas de RLHF o DPO posteriores al fine-tuning.

## Capacidades

- Generación de texto médico: el adaptador está diseñado para producir respuestas relacionadas con el dominio clínico, aunque no hay evidencia pública de su rendimiento.
- Conversación multi-turno: hereda la capacidad del modelo base Llama 3.2 3B Instruct para mantener diálogos.
- Razonamiento básico: el modelo base puede realizar razonamiento simple, pero no se ha validado en el contexto médico.
- Tool calling: no documentado para este adaptador; el modelo base tiene soporte nativo, pero no se confirma que el adaptador lo preserve.
- Multilingüismo: no especificado; el modelo base está entrenado principalmente en inglés, por lo que se espera un rendimiento limitado en otros idiomas.

## Casos de uso

- Asistente de documentación clínica: el modelo podría generar borradores de notas médicas a partir de conversaciones con pacientes, reduciendo la carga administrativa de los profesionales sanitarios. Adecuado por su tamaño reducido, que permite ejecutarlo en hardware modesto.
- Educación médica simulada: estudiantes de medicina podrían interactuar con el modelo para practicar anamnesis y diagnóstico diferencial en un entorno controlado y sin riesgo para pacientes reales.
- Clasificación de síntomas: dada una lista de síntomas, el modelo podría sugerir posibles afecciones o recomendar derivaciones, aunque requiere validación clínica previa.
- Generación de material informativo para pacientes: el modelo puede redactar explicaciones sobre enfermedades, tratamientos y medicamentos en un lenguaje comprensible, adaptado a distintos niveles de alfabetización sanitaria.
- Soporte en investigación bibliográfica: podría resumir artículos médicos o extraer información relevante de abstracts, facilitando revisiones sistemáticas.
- Chatbot de triaje inicial: integrado en un portal de salud, el modelo podría recoger información preliminar del paciente antes de una consulta, siempre con supervisión humana y sin emitir diagnósticos definitivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni evaluaciones específicas del dominio médico (como MedQA o PubMedQA) para este adaptador. La ausencia de métricas impide comparar su rendimiento con otros modelos médicos.

## Requisitos de hardware

- VRAM estimada: el modelo base en 4 bits ocupa aproximadamente 2-3 GB; el adaptador LoRA añade menos de 1 GB, por lo que la inferencia puede caber en GPUs con 4 GB o más.
- GPU recomendadas: NVIDIA GTX 1060 6GB, RTX 2060, RTX 3060, o cualquier GPU con al menos 4 GB de VRAM. También puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- Opciones de despliegue: transformers + PEFT, vLLM (si se fusiona el adaptador), llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta como modelo).
- Latencia y throughput: no disponibles. Al ser un modelo de 3B, se espera un throughput de decenas de tokens por segundo en GPUs modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| medical-llama-3b-asclepius-lora | 3.2B + LoRA | 128k (base) | no disponible | Adaptador no documentado |
| starmpcc/Asclepius-Llama3-8B | 8B | 8192 | Apache 2.0 (según repo) | Modelo completo, entrenado con datos sintéticos, con paper y evaluación |
| unsloth/llama-3.2-3b-instruct-bnb-4bit | 3.2B | 128k | Llama 3.2 Community | Modelo base, sin especialización médica |

La comparativa muestra que el adaptador no tiene documentación ni validación, mientras que Asclepius-Llama3-8B ofrece un modelo médico completo con resultados publicados. El adaptador podría ser útil como punto de partida para experimentos, pero carece de la madurez del modelo de 8B.

## Limitaciones y advertencias

- No hay documentación sobre el dataset de entrenamiento, por lo que se desconocen los posibles sesgos y la calidad de los datos médicos utilizados.
- Riesgo alto de alucinación: al ser un modelo pequeño y sin evaluación publicada, puede generar información médica incorrecta o peligrosa. No debe usarse para diagnóstico o tratamiento sin supervisión humana.
- Sin licencia especificada: no está claro si el adaptador puede usarse comercialmente. El modelo base tiene restricciones (Llama 3.2 Community License), pero el adaptador podría tener otras.
- Idioma limitado: el modelo base está optimizado para inglés; su rendimiento en español u otros idiomas es incierto.
- Falta de soporte de tool calling confirmado: aunque el modelo base lo soporta, no se ha verificado que el adaptador lo preserve.
- Sin mantenimiento ni soporte: el repositorio no muestra actividad desde su creación, lo que sugiere que no habrá actualizaciones ni correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tensorsoft/medical-llama-3b-asclepius-lora
- Modelo base (unsloth/llama-3.2-3b-instruct-bnb-4bit): https://huggingface.co/unsloth/llama-3.2-3b-instruct-bnb-4bit
- Asclepius-Llama3-8B (modelo médico de referencia): https://huggingface.co/starmpcc/Asclepius-Llama3-8B
- Paper de Asclepius: https://arxiv.org/abs/2309.00237
- Repositorio GitHub de Asclepius: https://github.com/starmpcc/Asclepius
