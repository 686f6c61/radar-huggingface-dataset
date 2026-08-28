# WonjunLee/AIM_MLLM_Unlearning

## Resumen

Este repositorio contiene checkpoints de *machine unlearning* para el modelo multimodal LLaVA-1.5-7B, desarrollado por Wonjun Lee. El objetivo es eliminar información no deseada del encoder visual del modelo, manteniendo el resto de capacidades intactas. Se proporcionan adaptadores entrenados para dos benchmarks de referencia: MLLMU-Bench (con porcentajes de olvido del 5% y 10%) y ReMem (también con 5% y 10%). El trabajo se enmarca en la investigación sobre privacidad y seguridad en IA, concretamente en la eliminación selectiva de datos sensibles o memorizados de modelos multimodales.

La relevancia actual radica en la creciente necesidad de cumplir regulaciones de protección de datos (como el RGPD) y de mitigar riesgos de fuga de información en modelos desplegados. Este repositorio ofrece una implementación práctica de unlearning centrada únicamente en el encoder visual, lo que permite experimentar con técnicas de olvido sin necesidad de reentrenar el modelo completo. El tamaño del repositorio es de 0.7 GB, e incluye los pesos del vision tower en formato `trainable_state.pt` y un adaptador LoRA para el caso ReMem.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA-1.5-7B (vision encoder + LLM base), solo se modifican los pesos del vision encoder |
| Parametros totales | No disponible (el modelo base tiene 7B, pero el repo solo contiene pesos del vision encoder) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base LLaVA-1.5-7B soporta 4096 tokens, pero no se especifica en el repo) |
| Tipos de cuantizacion | No disponible (solo se proporcionan pesos en formato PyTorch `.pt` y posiblemente safetensors) |
| Idiomas soportados | No disponible (el modelo base LLaVA-1.5-7B está entrenado principalmente en inglés, pero no se indica) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch `.pt` (según README) y safetensors (según tags) |

## Arquitectura y entrenamiento

El modelo base es LLaVA-1.5-7B, una arquitectura multimodal que combina un vision encoder (CLIP ViT-L/14) con un LLM (Vicuna-7B). En este repositorio, el proceso de unlearning se aplica exclusivamente al vision encoder, dejando intacto el LLM. Los checkpoints `trainable_state.pt` contienen únicamente los pesos del vision tower, que deben cargarse sobre el modelo memorizado (vanilla) y sobrescribir los pesos originales.

No se proporcionan detalles sobre el método de entrenamiento específico, los datos utilizados ni el número de pasos. Los nombres de los directorios (`mllmu_forget5`, `mllmu_forget10`, `remem_forget1`, `remem_forget2`) indican los porcentajes de olvido aplicados (5% y 10%) y los benchmarks de referencia. Para ReMem, se incluye un adaptador LoRA (`vanilla_remem_lora/`) que debe fusionarse con el modelo base para obtener el modelo memorizado antes de aplicar el unlearning.

## Capacidades

- Eliminación selectiva de información visual: el modelo puede olvidar datos específicos asociados a imágenes (por ejemplo, caras, objetos o escenas concretas) tras aplicar los checkpoints.
- Preservación del resto de capacidades: al modificar solo el vision encoder, se espera que el LLM mantenga sus habilidades de generación de texto y razonamiento.
- Compatibilidad con LLaVA-1.5-7B: los checkpoints están diseñados para integrarse con el modelo base de HuggingFace `llava-hf/llava-1.5-7b-hf`.
- Soporte para dos benchmarks de unlearning: MLLMU-Bench y ReMem, con diferentes niveles de olvido.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, ya que no es un modelo autónomo sino un conjunto de pesos para modificar un modelo existente.

## Casos de uso

- Investigación en machine unlearning: los checkpoints permiten reproducir experimentos de olvido selectivo en modelos multimodales, comparando la efectividad entre MLLMU-Bench y ReMem.
- Privacidad y cumplimiento normativo: en entornos donde un modelo ha memorizado datos personales o sensibles de imágenes, estos pesos pueden aplicarse para eliminar esa información sin reentrenar desde cero.
- Auditoría de modelos: los desarrolladores pueden usar estos checkpoints para evaluar cómo el unlearning afecta a la precisión del modelo en tareas visuales, midiendo el equilibrio entre olvido y retención.
- Desarrollo de técnicas de desaprendizaje: sirve como base para probar nuevos algoritmos de unlearning, ya que proporciona un punto de partida con pesos ya entrenados.
- Educación y formación: útil para cursos o talleres sobre seguridad en IA, mostrando un ejemplo práctico de cómo eliminar información de un modelo multimodal.
- Evaluación de robustez: permite estudiar si el unlearning del vision encoder es suficiente para eliminar información no deseada o si se requieren modificaciones adicionales en el LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento, ni comparaciones con otros métodos de unlearning. Se recomienda consultar los papers de MLLMU-Bench y ReMem para obtener referencias de evaluación.

## Requisitos de hardware

- El repositorio solo contiene los pesos del vision encoder (0.7 GB), por lo que su uso en inferencia requiere cargar el modelo base LLaVA-1.5-7B completo.
- Para ejecutar el modelo base se necesitan aproximadamente 14 GB de VRAM en FP16 (7B parámetros). Con cuantización a 8 bits se puede reducir a unos 8 GB, y a 4 bits a unos 5 GB.
- GPUs recomendadas: NVIDIA RTX 3090/4090 (24 GB VRAM) para FP16, o GPUs con al menos 8 GB para cuantización.
- El proceso de unlearning (entrenamiento de los checkpoints) requiere más recursos, pero no se especifican en el repositorio.
- Opciones de despliegue: se puede usar con HuggingFace Transformers, vLLM, o llama.cpp (si se convierte a GGUF). Para el unlearning, se necesita un framework de entrenamiento como PyTorch.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el repositorio. Existen otros trabajos de unlearning en LLMs (por ejemplo, los citados en los enlaces), pero no se proporcionan datos de comparación directa. Se recomienda revisar la literatura de MLLMU-Bench y ReMem para encontrar referencias.

## Limitaciones y advertencias

- El unlearning se aplica solo al vision encoder; no se garantiza que la información no deseada se elimine por completo del LLM subyacente.
- Los checkpoints requieren el modelo base `llava-hf/llava-1.5-7b-hf`; no son autónomos.
- No se proporcionan métricas de efectividad ni de preservación de capacidades, por lo que el usuario debe validar el comportamiento en su caso de uso.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un trabajo reciente o poco validado por la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base LLaVA-1.5-7B tiene su propia licencia (LLaMA para el LLM subyacente), que puede imponer restricciones adicionales.
- No se especifican sesgos conocidos, pero al ser un modelo basado en LLaVA, puede heredar sesgos de los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WonjunLee/AIM_MLLM_Unlearning
- Página personal del autor: https://wonjuun.github.io/
- Paper "Rethinking Machine Unlearning for Large Language Models": https://arxiv.org/abs/2402.08787
- Paper "Large Language Model Unlearning": https://arxiv.org/abs/2310.10683
- Lista curada de recursos sobre LLM unlearning: https://github.com/chrisliu298/awesome-llm-unlearning
- Modelo base LLaVA-1.5-7B: https://huggingface.co/llava-hf/llava-1.5-7b-hf
