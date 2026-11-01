# taharmasmaliyev07/Gemma4-E2B-FACEBOOK-E2-BF16

## Resumen

Gemma4-E2B-FACEBOOK-E2-BF16 es un ajuste fino (finetune) publicado por el usuario taharmasmaliyev07 en HuggingFace, derivado de un modelo de la familia Gemma 4 y entrenado con la librería Unsloth junto con TRL de HuggingFace. El modelo se distribuye en formato safetensors con pesos en BF16 y está etiquetado para la tarea `image-text-to-text`, lo que indica que conserva la torre de visión del modelo base y acepta entradas multimodales de imagen y texto. Cuenta con 5.123.178.051 parámetros totales y un repositorio de 10,4 GB.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: se trata de un artefacto de ajuste fino de autor individual, con 27 descargas y sin métricas publicadas. La model card es una plantilla autogenerada por Unsloth que no documenta el dataset de entrenamiento, el procedimiento de ajuste ni los hiperparámetros utilizados. El nombre del repositorio sugiere un ajuste orientado a un dominio concreto (posiblemente contenido relacionado con Facebook), pero no hay información que lo confirme.

A efectos prácticos, el modelo debe evaluarse como un derivado de Gemma 4 de aproximadamente 5.100 millones de parámetros, con capacidades multimodales imagen-texto y licencia Apache 2.0. Cualquier uso en producción exige una validación empírica propia, dado que no existen benchmarks ni documentación técnica del proceso de ajuste.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4; presumiblemente transformer multimodal, sin confirmar) |
| Parámetros totales | 5.123.178.051 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en BF16; compatible con cuantización vía transformers/bitsandbytes y GGUF mediante conversión) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de la pertenencia a la familia Gemma 4 y de la etiqueta de pipeline `image-text-to-text`, que implica un codificador visual acoplado a un decodificador de lenguaje. El número de parámetros (5,12 mil millones) corresponde al checkpoint publicado, no necesariamente al modelo base original.

El entrenamiento se realizó con Unsloth y TRL, según la model card. No se especifica el número de tokens de entrenamiento, la composición del dataset, si hubo fases de RLHF o DPO, ni los hiperparámetros del ajuste fino. La model card indica que el modelo se entrenó "2x faster" con Unsloth, lo que es una afirmación sobre la eficiencia del framework de entrenamiento, no sobre el rendimiento del modelo. El campo `base_model` apunta al propio repositorio, lo que sugiere un error de metadatos o una publicación derivada de un checkpoint previo no documentado.

## Capacidades

- Generación de texto conversacional en inglés, según la etiqueta `conversational`.
- Procesamiento de entradas imagen-texto (`image-text-to-text`), heredado del modelo base Gemma 4.
- Compatibilidad con Text Generation Inference (TGI), indicada por la etiqueta `text-generation-inference` y `endpoints_compatible`.
- Carga mediante la librería `transformers`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según los metadatos.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Prototipado de asistentes multimodales en inglés: el modelo acepta pares imagen-texto, por lo que puede emplearse para describir imágenes o responder preguntas sobre ellas en entornos de experimentación, siempre con validación previa.
- Investigación sobre ajuste fino con Unsloth: sirve como ejemplo reproducible de un pipeline de finetune con Unsloth y TRL sobre un modelo Gemma 4, útil para estudiar técnicas de entrenamiento eficiente en memoria.
- Despliegue en TGI para pruebas de integración: la etiqueta `endpoints_compatible` permite levantar un endpoint compatible con la API de HuggingFace en un entorno de staging.
- Generación de texto conversacional de dominio específico: si el ajuste se orientó a un corpus concreto (el nombre sugiere contenido relacionado con Facebook), puede emplearse para generar respuestas estilizadas en ese dominio, con revisión humana obligatoria.
- Base para nuevos ajustes finos: al publicarse en Apache 2.0 y en safetensors BF16, puede reutilizarse como punto de partida para especializaciones posteriores con LoRA o QLoRA.
- Evaluación comparativa de derivados de Gemma 4: útil en estudios que midan la degradación o mejora que introduce un finetune no documentado frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 10,3 GB solo para pesos (5,12 B × 2 bytes), más overhead de activaciones y KV cache; en la práctica, 12-16 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: en torno a 5-6 GB para pesos.
- VRAM estimada en cuantización de 4 bits: en torno a 3-4 GB para pesos.
- GPU recomendadas: A100 40 GB, H100 80 GB o L40S para BF16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) son suficientes para BF16 en contextos moderados.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, en 4 bits, en GPUs de 8 GB como RTX 3070 o RTX 4060.
- Opciones de despliegue: `transformers`, Text Generation Inference (TGI), vLLM (previa verificación de compatibilidad con la arquitectura Gemma 4), llama.cpp/Ollama mediante conversión a GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Multimodal | Documentación |
|---|---|---|---|---|---|
| Gemma4-E2B-FACEBOOK-E2-BF16 | 5,12 B | no disponible | Apache 2.0 | Sí (imagen-texto) | Mínima (plantilla Unsloth) |
| Gemma 3 4B (referencia de familia) | ~4 B | 128 K (según versión) | Gemma Terms | Sí | Completa |
| Qwen2.5-VL 3B | ~3 B | 32 K | Apache 2.0 | Sí | Completa |
| Phi-3.5-vision | ~4,2 B | 128 K | MIT | Sí | Completa |

La comparación es orientativa: no hay datos de rendimiento del modelo evaluado, y las cifras de los alternativos corresponden a sus respectivas model cards públicas.

## Limitaciones y advertencias

- Ausencia total de documentación sobre el dataset de entrenamiento, lo que impide evaluar sesgos, contaminación o calidad de los datos.
- Riesgo elevado de alucinación y de comportamiento impredecible al no existir evaluación publicada.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está garantizado.
- Longitud de contexto desconocida; no debe asumirse la del modelo base Gemma 4 sin verificación.
- El campo `base_model` autorreferencial y la model card autogenerada sugieren metadatos incompletos o erróneos.
- Licencia Apache 2.0 declarada por el autor, pero la procedencia del modelo base (Gemma 4) podría imponer términos adicionales de Google; conviene verificar la compatibilidad antes de uso comercial.
- Sin garantías de soporte, mantenimiento ni actualizaciones (0 likes, 27 descargas, autor individual).
- No apto para producción sin una evaluación propia exhaustiva en el dominio objetivo.

## Enlaces

- HuggingFace: https://huggingface.co/taharmasmaliyev07/Gemma4-E2B-FACEBOOK-E2-BF16
- Unsloth (framework de entrenamiento): https://github.com/unslothai/unsloth
- TRL de HuggingFace: https://github.com/huggingface/trl
- Documentación de Transformers: https://huggingface.co/docs/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
