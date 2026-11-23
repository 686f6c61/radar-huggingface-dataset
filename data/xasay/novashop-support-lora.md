# Xasay/novashop-support-lora

## Resumen

`Xasay/novashop-support-lora` es un adaptador LoRA (Low-Rank Adaptation) publicado en Hugging Face por el usuario Xasay, entrenado mediante SFT (supervised fine-tuning) sobre el modelo base `unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit`, una versión cuantizada en 4 bits de Meta-Llama-3.1-8B-Instruct preparada por Unsloth. El nombre del repositorio sugiere un ajuste orientado a atención al cliente ("support") para un negocio denominado "novashop", aunque la model card no documenta el dominio, el dataset ni los objetivos del entrenamiento.

Se trata de un adaptador PEFT de tipo LoRA (pesos en formato safetensors, ~0,2 GB de tamaño de repositorio), no de un modelo completo: requiere cargar el modelo base y aplicar el adaptador encima. La model card es una plantilla estándar de Hugging Face sin rellenar, por lo que la mayoría de los metadatos técnicos (licencia, idiomas, datos de entrenamiento, hiperparámetros, evaluación) no están disponibles.

Su relevancia es limitada y muy específica: sirve como ejemplo de flujo de trabajo de fine-tuning eficiente con Unsloth + TRL + PEFT sobre Llama 3.1 8B, y como posible artefacto de un caso concreto de soporte al cliente. No hay descargas ni "likes" en el momento de la consulta, y no se ha publicado ninguna evaluación, por lo que no debe considerarse un modelo validado para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (Llama 3.1 8B Instruct) |
| Parametros totales | No disponible para el adaptador; el modelo base tiene 8,03 mil millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card; el modelo base Llama 3.1 8B soporta 128 000 tokens |
| Tipos de cuantizacion | El modelo base referenciado está cuantizado en 4 bits (bnb-4bit); el adaptador se distribuye en safetensors (precisión no especificada) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango que se aplica sobre las capas del transformer de Llama 3.1 8B Instruct. El modelo base es una versión de Meta-Llama-3.1-8B-Instruct cuantizada en 4 bits con `bitsandbytes` y empaquetada por Unsloth, lo que reduce el coste de memoria del fine-tuning. El adaptador se entrenó con SFT (supervised fine-tuning) usando la librería TRL, según las etiquetas del repositorio (`sft`, `trl`, `unsloth`, `lora`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO, hiperparámetros (rango LoRA, alpha, learning rate, épocas) ni innovaciones técnicas más allá del uso de Unsloth para acelerar el entrenamiento. La versión de PEFT declarada es 0.21.2. La model card no incluye sección de datos, procedimiento ni evaluación rellenada.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Llama 3.1 8B Instruct.
- Razonamiento y respuesta a instrucciones en formato chat (el modelo base está alineado para instrucciones).
- Capacidad multilingüe heredada del modelo base (Llama 3.1 soporta oficialmente inglés, alemán, francés, italiano, portugués, hindi, español y tailandés), aunque el adaptador no documenta qué idiomas refuerza.
- Soporte de tool calling / function calling: disponible en el modelo base Llama 3.1 Instruct; no verificado para el adaptador.
- Capacidad de agentes y razonamiento multi-paso: heredada del modelo base, no evaluada tras el ajuste.
- Especialización probable en atención al cliente (por el nombre "novashop-support"), no documentada ni verificable.
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Atención al cliente automatizada en un comercio electrónico: el adaptador parece entrenado para respuestas de soporte ("novashop"), por lo que podría usarse como capa de personalización sobre Llama 3.1 8B para gestionar consultas de pedidos, devoluciones y FAQ, aprovechando el contexto largo del modelo base.
- Prototipado rápido de asistentes de soporte: al ser un adaptador LoRA pequeño (~0,2 GB), permite experimentar con distintos tonos y políticas de respuesta sin reentrenar el modelo completo.
- Base para fine-tuning iterativo: sirve como punto de partida para continuar el ajuste con datos propios del negocio usando PEFT/TRL.
- Investigación sobre fine-tuning eficiente: ejemplo reproducible del flujo Unsloth + TRL + PEFT sobre Llama 3.1 8B en 4 bits, útil para estudiar costes y calidad de LoRA en dominios verticales.
- Despliegue con recursos limitados: al combinarse con el modelo base cuantizado en 4 bits, puede servirse en una única GPU de consumo para demos internas.
- Evaluación comparativa de adaptadores: sirve como referencia para medir la degradación o mejora de un LoRA de dominio frente al modelo base en tareas de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base en 4 bits requiere aproximadamente 5-6 GB de VRAM para los pesos, más overhead de activaciones y KV cache; con contexto largo (128k tokens) el KV cache puede añadir varios GB.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 3090 para inferencia cómoda en 4 bits; A100/H100 solo necesarias para servir muchas peticiones concurrentes o contexto muy largo.
- Cabe en GPU de consumo: sí, en GPUs con 8 GB o más usando cuantización 4 bits y contextos moderados; 6 GB es ajustado.
- Opciones de despliegue: transformers + PEFT (carga del adaptador), vLLM (soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (requiere fusionar el adaptador con el modelo base y convertir a GGUF).
- Latencia y throughput estimados: no disponibles; dependen del hardware, la cuantización y el backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xasay/novashop-support-lora | Adaptador sobre 8B | No disponible (base: 128k) | LoRA SFT | No disponible | Hugging Face, 0 descargas |
| Meta-Llama-3.1-8B-Instruct | 8,03B | 128k | Modelo completo | Llama 3.1 Community License | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.3 | 7,25B | 32k | Modelo completo | Apache 2.0 | Hugging Face |
| Qwen2.5-7B-Instruct | 7,6B | 128k | Modelo completo | Apache 2.0 | Hugging Face |

El adaptador no aporta métricas propias que permitan comparar rendimiento; su ventaja es el bajo coste de almacenamiento y la especialización potencial, mientras que su desventaja es la falta de documentación, evaluación y licencia clara frente a los modelos base completos.

## Limitaciones y advertencias

- La model card es una plantilla sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido; además, hereda las restricciones de la Llama 3.1 Community License del modelo base.
- Riesgo de alucinación inherente al modelo base, no mitigado ni evaluado tras el ajuste.
- Posible sobreajuste al dominio "novashop": el adaptador puede degradar el rendimiento general del modelo base fuera de ese contexto.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del modelo base.
- Sin descargas ni validación comunitaria: no hay evidencia de que el adaptador funcione correctamente en producción.
- Requiere cargar el modelo base cuantizado en 4 bits, lo que introduce pérdida de precisión adicional.
- No se especifican hiperparámetros de entrenamiento (rango, alpha, épocas), lo que dificulta reproducir o auditar el ajuste.

## Enlaces

- Hugging Face: https://huggingface.co/Xasay/novashop-support-lora
- Modelo base: https://huggingface.co/unsloth/Meta-Llama-3.1-8B-Instruct-unsloth-bnb-4bit
- Modelo original de Meta: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Paper de referencia citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
- Unsloth: https://github.com/unslothai/unsloth
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
