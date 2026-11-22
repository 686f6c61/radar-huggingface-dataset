# undead55/gemma4-31b-m2

## Resumen

`undead55/gemma4-31b-m2` es un espejo (mirror) sin modificaciones del modelo `1lock/gemma4-31b-m2`, publicado por el usuario undead55 en Hugging Face. Se trata de un ajuste fino (finetune) del modelo `tattrongvu/Jeffan-31b-1710`, que a su vez actúa como modelo base. El pipeline declarado es `image-text-to-text`, lo que indica que el modelo está orientado a tareas multimodales de entrada imagen y texto con salida de texto, aunque la model card no aporta detalles adicionales sobre el entrenamiento multimodal.

El modelo cuenta con 31.273.086.512 parámetros totales (aproximadamente 31,3 mil millones) almacenados en formato safetensors, con un tamaño de repositorio de 62,6 GB, lo que sugiere pesos en precisión de 16 bits. La licencia declarada es Apache-2.0, heredada del modelo upstream, lo que facilita su uso comercial con atribución.

La relevancia de esta ficha es limitada por la escasez de información: la model card es prácticamente un aviso de espejo y no incluye datos sobre arquitectura interna, datos de entrenamiento, benchmarks ni idiomas soportados. Todo lo que se puede afirmar con rigor proviene de los metadatos de Hugging Face y de la información del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiqueta `gemma4`; presumiblemente transformer, sin confirmar) |
| Parametros totales | 31.273.086.512 (~31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna. La etiqueta `gemma4` sugiere una familia de modelos tipo Gemma, pero la model card no confirma si se trata de un transformer denso, un modelo con atención lineal o una arquitectura híbrida. El pipeline `image-text-to-text` indica capacidad multimodal de entrada, pero no se especifica el codificador visual ni cómo se integra con el decodificador de texto.

Respecto al entrenamiento, el modelo es un finetune de `tattrongvu/Jeffan-31b-1710`, y este a su vez es el base_model declarado. No se documentan el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se detallan innovaciones técnicas como decodificación especulativa o modos de razonamiento extendido. La única información fiable es que el espejo reproduce sin cambios la revisión `8d137faa6dde1e7c59e0ff2d567d03e1d30df604` del repositorio original.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational`.
- Procesamiento de entrada multimodal imagen-texto a texto (`image-text-to-text`), aunque no se detalla el alcance real de la comprensión visual.
- Compatibilidad con `transformers` y con endpoints compatibles (`endpoints_compatible`).
- Soporte de tool calling / function calling: no disponible en la información.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información.
- Capacidades multilingües: no disponible en la información.
- Modo thinking, visión avanzada o audio: no disponible en la información.

## Casos de uso

- Descripción de imágenes en pipelines de accesibilidad: al declarar el pipeline `image-text-to-text`, podría emplearse para generar texto alternativo a partir de imágenes, aunque la falta de benchmarks impide garantizar calidad.
- Prototipado de asistentes conversacionales multimodales: útil para experimentar con diálogo que incorpora imágenes, siempre que se valide el comportamiento real antes de producción.
- Investigación sobre finetunes de la familia Gemma: al ser un derivado de `Jeffan-31b-1710`, sirve como punto de partida para estudiar variantes y comparar con el modelo base.
- Evaluación de espejos y reproducibilidad: al ser un mirror sin modificaciones, permite verificar la integridad de la revisión `8d137faa` frente al original `1lock/gemma4-31b-m2`.
- Fine-tuning posterior en dominios específicos: con licencia Apache-2.0 y pesos safetensors, es viable ajustarlo con `transformers` y `peft` para tareas verticales.
- Despliegue en entornos con requisitos de licencia permisiva: Apache-2.0 facilita su integración en productos comerciales, sujeto a validación técnica previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; se recomienda al menos 80 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o H100.
- VRAM estimada en cuantización de 4 bits: en torno a 16-20 GB, potencialmente viable en RTX 4090 (24 GB) con contexto limitado.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPUs consumer con tensor parallelism.
- Cabe en consumer GPU: solo con cuantización agresiva (4 bits) y contexto reducido; no cabe en FP16 en ninguna GPU consumer actual.
- Opciones de despliegue: `transformers` (soporte nativo declarado); vLLM, llama.cpp, Ollama o TGI no están confirmados para esta arquitectura concreta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| undead55/gemma4-31b-m2 | ~31,3 B | no disponible | Apache-2.0 | Hugging Face (espejo) |
| tattrongvu/Jeffan-31b-1710 (base) | no disponible | no disponible | no disponible | Hugging Face |
| 1lock/gemma4-31b-m2 (original) | ~31,3 B (presumible) | no disponible | Apache-2.0 | Hugging Face |
| Gemma 2 27B (referencia de familia) | 27 B | 8K | Gemma license | Hugging Face |

La comparativa con modelos de la familia Gemma es orientativa: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, datos de entrenamiento, idiomas ni evaluación, lo que impide garantizar su comportamiento en producción.
- Riesgo de alucinación: sin benchmarks ni evaluación publicada, no se puede estimar la fiabilidad factual del modelo.
- Sesgos: no disponibles; al no documentarse la composición del dataset, no es posible evaluar sesgos conocidos.
- Limitaciones de contexto e idioma: se desconocen la ventana de contexto y los idiomas efectivamente soportados.
- Licencia: Apache-2.0 permite uso comercial, pero el modelo es un derivado de `tattrongvu/Jeffan-31b-1710`; conviene revisar la licencia upstream por si impone condiciones adicionales.
- Es un espejo sin modificaciones: cualquier problema del original `1lock/gemma4-31b-m2` se reproduce aquí; no hay mejoras ni correcciones por parte del publicador del espejo.
- Sin descargas ni likes: el repositorio no tiene tracción comunitaria, por lo que no hay validación externa de su calidad.
- Fecha de creación futura (2026-11-22): metadato atípico que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/undead55/gemma4-31b-m2
- Modelo original espejado: https://huggingface.co/1lock/gemma4-31b-m2
- Modelo base: https://huggingface.co/tattrongvu/Jeffan-31b-1710
