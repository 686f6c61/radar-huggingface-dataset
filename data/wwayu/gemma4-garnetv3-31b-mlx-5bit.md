# Wwayu/Gemma4-GarnetV3-31B-mlx-5Bit

## Resumen

Wwayu/Gemma4-GarnetV3-31B-mlx-5Bit es una conversión al formato MLX (Apple Silicon) del modelo ConicCat/Gemma4-GarnetV3-31B, un fine-tuning de la familia Gemma 4 de Google DeepMind. El repositorio, creado por el usuario Wwayu, está pensado para ejecutar el modelo localmente en equipos Mac mediante la librería `mlx-lm`. A pesar del nombre, el peso real de los safetensors indica 5.756.834.108 parámetros (aproximadamente 5,7 mil millones), lo que sugiere una posible destilación o una variante reducida del modelo original de 31B. La licencia es Apache 2.0, lo que permite uso comercial y modificación sin restricciones significativas. El modelo se presenta como una opción para generación de texto y conversación, con datasets de fine-tuning orientados a charcards y preferencias de usuario.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basado en Gemma 4) |
| Parametros totales | 5.756.834.108 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 5-bit (según nombre del repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. El nombre sugiere una relación con Gemma 4 de Google, que en sus versiones oficiales presenta arquitecturas transformer con variantes densas y MoE, pero no se confirma que esta conversión conserve dicha arquitectura. El modelo base ConicCat/Gemma4-GarnetV3-31B es un fine-tuning de Gemma 4, y los datasets listados en la model card (`ConicCat/Charcards_Context_Distill_Gemma4_26BV2`, `ConicCat/Charcards_Delta_Qwen3_5V2` y `ConicCat/Lamp_P_Preference`) indican un entrenamiento orientado a diálogo, roleplay y preferencias de usuario, probablemente mediante técnicas de distillation o RLHF, aunque no se especifica el método exacto ni el número de tokens de entrenamiento. La conversión a MLX se realizó con `mlx-lm` versión 0.31.2.

## Capacidades

- Generación de texto y conversación multi-turno.
- Fine-tuning específico para charcards (personajes conversacionales) y preferencias de usuario.
- Compatible con el pipeline de `text-generation` de Hugging Face.
- Ejecución local en dispositivos Apple Silicon mediante MLX.
- No se dispone de información sobre tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Chat local en Mac: el modelo se puede cargar con `mlx-lm` y usarse para conversaciones privadas sin conexión, aprovechando la aceleración de la GPU unificada de Apple.
- Desarrollo de personajes conversacionales: gracias a los datasets de charcards, es adecuado para crear asistentes con personalidades definidas en aplicaciones de roleplay o juegos.
- Prototipado rápido de aplicaciones de NLP: al ser un modelo de tamaño moderado (5,7B) y con licencia Apache 2.0, permite iterar en entornos de desarrollo sin costes de API.
- Investigación en fine-tuning: el repositorio sirve como ejemplo de conversión a MLX y de aplicación de datasets de preferencia, útil para estudiar técnicas de alineación.
- Integración en pipelines de generación de texto: puede usarse como backend para sistemas de generación de respuestas en herramientas de productividad, siempre que se acepte el contexto limitado (desconocido).
- Educación y experimentación: al ser ligero y de código abierto, es un buen punto de partida para aprender a desplegar modelos locales en Mac.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo está optimizado para Apple Silicon (M1, M2, M3, M4 y superiores) mediante MLX.
- El tamaño del repositorio es de 21,1 GB, por lo que se recomienda un Mac con al menos 24 GB de memoria unificada para cargar el modelo en RAM. Con 32 GB o más se dispondrá de margen para el contexto y la generación.
- No es adecuado para GPUs NVIDIA o AMD sin adaptación, ya que MLX es específico de Apple.
- Para inferencia se utiliza la librería `mlx-lm`, que gestiona la carga y generación de forma eficiente. No se recomienda vLLM ni TGI para este formato.
- La latencia dependerá del modelo de chip; en un M2 Pro con 32 GB se pueden esperar decenas de tokens por segundo, aunque no hay cifras oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. El modelo original ConicCat/Gemma4-GarnetV3-31B tiene presumiblemente 31B parámetros, pero esta conversión solo contiene 5,7B, por lo que no es directamente comparable. Otras conversiones MLX de Gemma 4 (como `mavis-ai/Gemma4-31B-MLX`) podrían tener tamaños diferentes, pero no se han encontrado datos concretos. Se recomienda consultar los repositorios originales para más detalles.

## Limitaciones y advertencias

- El número de parámetros real (5,7B) no coincide con el nombre del modelo (31B), lo que puede causar confusión sobre su capacidad real.
- No se especifica la longitud de contexto, por lo que se desconoce si puede manejar conversaciones largas o documentos extensos.
- Al ser un fine-tuning con datasets de charcards, puede presentar sesgos en el estilo de respuesta o en la representación de ciertos personajes.
- Riesgo de alucinaciones, especialmente en tareas factuales, al ser un modelo de tamaño moderado.
- La licencia Apache 2.0 permite uso comercial, pero no se garantiza que los datasets de entrenamiento cumplan con todas las regulaciones de privacidad.
- No hay garantía de soporte técnico ni mantenimiento por parte del autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Wwayu/Gemma4-GarnetV3-31B-mlx-5Bit
- Modelo base: https://huggingface.co/ConicCat/Gemma4-GarnetV3-31B
- Página oficial de Gemma 4: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4: https://ai.google.dev/gemma/docs/core/model_card_4
- Guía de Gemma 4: https://gemma4.org/
