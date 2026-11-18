# xl-24/gemma4-31b-atc-finetune-32-64-merged-16bit

## Resumen

`xl-24/gemma4-31b-atc-finetune-32-64-merged-16bit` es un ajuste fino (finetune) del modelo Gemma 4 de 31B de parámetros en su variante instruct, publicado por el usuario xl-24 en Hugging Face. El modelo parte de `unsloth/gemma-4-31B-it-unsloth-bnb-4bit`, una versión cuantizada a 4 bits del Gemma 4 instruct preparada por Unsloth para facilitar el entrenamiento con menos VRAM, y se distribuye como un merge en precisión de 16 bits. El pipeline declarado es `image-text-to-text`, lo que indica que conserva la capacidad multimodal (visión y texto) del modelo base.

El nombre del repositorio sugiere un ajuste orientado a "ATC", probablemente control de tráfico aéreo (air traffic control), aunque la model card no lo confirma explícitamente. El modelo se entrenó con Unsloth y la librería TRL de Hugging Face, lo que permitió, según el autor, un entrenamiento el doble de rápido. No se documentan detalles del dataset, hiperparámetros ni metodología de entrenamiento más allá de estas menciones.

Se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta, sin benchmarks publicados. Su relevancia es limitada fuera del caso de uso específico para el que fue ajustado; se ofrece como base para quien necesite un Gemma 4 de 31B con visión y un ajuste particular, bajo licencia Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Gemma 4 |
| Parámetros totales | 31B (según nombre del modelo; no confirmado en la model card) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | pesos publicados en 16 bits (merged); el base se entrenó desde una versión bnb-4bit |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Gemma 4 de 31B en variante instruct, un transformer multimodal que procesa entradas de imagen y texto (`image-text-to-text`). El punto de partida es la versión de Unsloth cuantizada a 4 bits (`unsloth/gemma-4-31B-it-unsloth-bnb-4bit`), pensada para reducir el consumo de VRAM durante el entrenamiento. El resultado se ha fusionado (merged) y exportado en precisión de 16 bits, presumiblemente para facilitar su despliegue con transformers y TGI.

El entrenamiento se realizó con Unsloth y TRL, según la model card, con una mejora de velocidad de 2x respecto a un flujo estándar. No se especifican el número de tokens de entrenamiento, la composición del dataset, si hubo RLHF/DPO ni los hiperparámetros utilizados. Tampoco se detalla si el ajuste afectó a todas las capas o solo a algunas, ni si se mantuvo el congelado de la torre de visión. Toda esta información se considera no disponible.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del Gemma 4 instruct.
- Procesamiento de imágenes junto con texto (pipeline `image-text-to-text`).
- Conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`) y con text-generation-inference.
- Capacidad de tool calling / function calling: no confirmada en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas.
- Multilingüismo: limitado a inglés según el campo `language`.
- Modo thinking, audio u otras capacidades especiales: no disponibles.

## Casos de uso

- Control de tráfico aéreo asistido: dado el nombre "atc" del ajuste, el modelo podría emplearse para interpretar y generar mensajes operativos en inglés, aunque no hay documentación que valide su rendimiento en ese dominio.
- Asistencia conversacional en inglés: al ser un modelo instruct de 31B, puede gestionar diálogos multi-turno con contexto amplio, siempre que se confirme la ventana de contexto del base.
- Análisis de imágenes con descripción textual: por su pipeline image-text-to-text, puede emplearse para tareas de captioning o respuesta a preguntas sobre imágenes en inglés.
- Prototipado de asistentes especializados: sirve como punto de partida para quien quiera continuar el ajuste en un dominio concreto usando Unsloth y TRL.
- Investigación sobre ajuste fino eficiente: el modelo documenta el flujo de entrenamiento con Unsloth desde una base cuantizada a 4 bits, útil como referencia metodológica.
- Despliegue en endpoints compatibles: al estar marcado como `endpoints_compatible` y en formato safetensors de 16 bits, puede servirse con TGI o transformers en infraestructura con GPU suficiente.
- Evaluación comparativa de finetunes de Gemma 4: útil para estudiar el efecto del ajuste sobre el modelo base en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en 16 bits: aproximadamente 62 GB solo para los pesos (31B × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 80 GB para comodidad.
- En cuantización de 8 bits: en torno a 31 GB de pesos, más overhead; viable en GPUs de 48 GB o superiores.
- En cuantización de 4 bits (si se genera GGUF/AWQ): alrededor de 16-18 GB de pesos, lo que permitiría su uso en GPUs consumer de 24 GB como la RTX 4090, aunque el modelo multimodal puede requerir memoria adicional para la torre de visión.
- GPUs recomendadas: A100 80 GB, H100 80 GB para 16 bits; A6000 48 GB o L40S para 8 bits; RTX 4090 24 GB solo con cuantización agresiva.
- Opciones de despliegue: transformers, text-generation-inference (TGI), endpoints de Hugging Face; llama.cpp/Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-31b-atc-finetune-32-64-merged-16bit | 31B | no disponible | Sí (image-text-to-text) | Apache 2.0 | Hugging Face |
| unsloth/gemma-4-31B-it-unsloth-bnb-4bit (base) | 31B | no disponible | Sí | Apache 2.0 | Hugging Face |
| Gemma 4 31B it (original) | 31B | no disponible | Sí | Apache 2.0 (según modelo base) | Hugging Face / Google |

La comparativa se limita al ecosistema Gemma 4 porque no se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la información proporcionada. No se dispone de datos de rendimiento para comparar objetivamente con otros modelos de 30B.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validación por parte de la comunidad.
- No se documentan benchmarks ni evaluación de calidad; el rendimiento real es desconocido.
- El ajuste "atc" no está descrito; podría degradar capacidades generales del modelo base en tareas ajenas al dominio de entrenamiento.
- Idioma limitado a inglés según la model card; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño, agravado por la falta de evaluación.
- Sesgos: no documentados; hereda los del modelo base Gemma 4, que no se detallan en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Gemma 4 de Google, que pueden imponer restricciones adicionales de uso aceptable.
- El modelo se distribuye en 16 bits (49,8 GB), lo que exige hardware de gama alta para inferencia sin cuantización adicional.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con ventanas largas.

## Enlaces

- Hugging Face: https://huggingface.co/xl-24/gemma4-31b-atc-finetune-32-64-merged-16bit
- Modelo base: https://huggingface.co/unsloth/gemma-4-31B-it-unsloth-bnb-4bit
- Unsloth (GitHub): https://github.com/unslothai/unsloth
- TRL (Hugging Face): https://github.com/huggingface/trl
