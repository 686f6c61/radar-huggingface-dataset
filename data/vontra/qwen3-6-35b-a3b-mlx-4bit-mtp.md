# Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP

## Resumen

Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP es una conversión a MLX en 4 bits del modelo Qwen/Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) desarrollado por el equipo Qwen. La particularidad de este checkpoint es que conserva la capa nativa de predicción multi-token (MTP) que las conversiones estándar de MLX descartan, lo que permite a un motor de inferencia hacer decodificación especulativa con los pesos del propio modelo, sin necesidad de un modelo borrador externo.

El modelo base tiene 35.107.181.936 parámetros totales y una arquitectura MoE, e incorpora capacidades multimodales (pipeline image-text-to-text). Este checkpoint está pensado para ejecutarse en Apple Silicon mediante mlx-vlm: los cuatro shards principales son idénticos byte a byte a la conversión de mlx-community, y se añade un fichero `mtp-4bit.safetensors` con la capa MTP cuantizada de la misma forma.

Es relevante porque resuelve un problema práctico: obtener aceleración por decodificación especulativa en MLX con un único repositorio, manteniendo la equivalencia de salida con la decodificación normal del modelo. La licencia es Apache-2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de mezcla de expertos (MoE), tag `qwen3_5_moe`; multimodal (image-text-to-text) |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Affine 4-bit, group size 64; routers a 8 bits; capa MTP en 4-bit (router y gate del shared-expert a 8 bits, norms en BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX), 4 shards `model-*.safetensors` + `mtp-4bit.safetensors` |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con capacidades multimodales, identificado en los tags como `qwen3_5_moe`. Este checkpoint no reentrena el modelo: es una cuantización del checkpoint oficial Qwen/Qwen3.6-35B-A3B (revisión `995ad96` para los pesos MTP). Los pesos principales son idénticos a la conversión de mlx-community/Qwen3.6-35B-A3B-4bit (revisión `38740b8`), con cuantización afín de 4 bits y group size 64, y routers a 8 bits.

La innovación técnica destacable es la preservación de la capa MTP (`mtp.*`) del modelo original, que las conversiones habituales de MLX eliminan. Esta capa se cuantiza con el mismo esquema (4 bits, group size 64, router y gate del shared-expert a 8 bits, norms en BF16) y sus tensores se nombran `language_model.mtp.*`. El `model.safetensors.index.json` no lista el fichero MTP, de modo que los cargadores que no hacen drafting lo ignoran y cargan exactamente el modelo de mlx-community. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni fases de RLHF/DPO del modelo base.

## Capacidades

- Generación de texto y conversación multi-turno (tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), con generación condicionada por imagen.
- Decodificación especulativa nativa mediante la capa MTP conservada, verificando cada token propuesto contra el modelo.
- Razonamiento y generación de código: no disponible en la información proporcionada (no se detalla en la model card).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en Apple Silicon: el checkpoint está diseñado para mlx-vlm y se ejecuta en Macs con GPU unificada, lo que permite desplegar un MoE de 35B parámetros en 4 bits (repo de 20,9 GB) sin GPU dedicada.
- Aceleración de generación con decodificación especulativa: usando TensorFold como motor, la capa MTP propone tokens que se verifican contra el modelo, reduciendo el coste por token generado sin alterar la salida respecto a la decodificación normal.
- Descripción y análisis de imágenes: con el pipeline image-text-to-text, se puede pasar una imagen y un prompt para obtener descripciones, resúmenes o extracción de información visual.
- Prototipado de asistentes conversacionales: la naturaleza conversacional del modelo permite construir chatbots multi-turno en local para pruebas de concepto antes de migrar a infraestructura de servidor.
- Evaluación de motores de decodificación especulativa: al incluir tanto los pesos principales como la capa MTP, sirve para comparar latencia y fidelidad de salida entre decodificación estándar y drafting con MTP.
- Pipelines de investigación en MLX: útil para desarrolladores que experimentan con cuantización 4-bit y MoE en el ecosistema MLX y necesitan un checkpoint que no descarte componentes del modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/ memoria unificada estimada: el repositorio ocupa 20,9 GB, por lo que se necesita al menos esa cantidad de memoria disponible para cargar los pesos en 4 bits.
- Hardware objetivo: Apple Silicon con memoria unificada suficiente (la model card no especifica modelos de chip concretos).
- GPU dedicadas (A100, H100, RTX 4090): no aplicable de forma nativa, ya que el formato es MLX; no disponible información sobre conversión a otros backends.
- Despliegue: mlx-vlm (`python -m mlx_vlm.generate`); el motor TensorFold soporta drafting con MTP, aunque su soporte para este modelo está en desarrollo.
- Latencia y throughput: no disponible. La model card indica que la decodificación especulativa con MTP acelera la generación, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP | 35,1B | no disponible | 4-bit MLX + MTP 4-bit | Apache-2.0 | Incluye capa MTP para decodificación especulativa |
| mlx-community/Qwen3.6-35B-A3B-4bit | 35,1B | no disponible | 4-bit MLX | Apache-2.0 | Mismos pesos principales; sin capa MTP |
| Qwen/Qwen3.6-35B-A3B | 35,1B | no disponible | BF16 (original) | Apache-2.0 | Modelo base oficial, incluye MTP sin cuantizar |

## Limitaciones y advertencias

- Es una cuantización 4-bit: puede degradar ligeramente la calidad respecto al modelo base en BF16; no se han publicado evaluaciones de la pérdida de rendimiento.
- Dependencia del ecosistema MLX: no es directamente utilizable en vLLM, TGI o llama.cpp sin conversión adicional.
- La capa MTP solo aporta ventaja si el motor de inferencia la usa para drafting; el soporte en TensorFold está en desarrollo, por lo que la aceleración puede no estar disponible de forma estable.
- El fichero MTP no figura en el índice de safetensors, de modo que cargadores que no lo soportan lo ignoran silenciosamente.
- No hay información sobre sesgos, riesgo de alucinación, cobertura idiomática ni límites de contexto del modelo base en la documentación proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar la licencia del modelo base y las condiciones de los pesos originales de Qwen.
- El modelo base es de septiembre de 2026 y este checkpoint fue actualizado por última vez el 2026-10-01; verificar revisiones posteriores antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/Vontra/Qwen3.6-35B-A3B-MLX-4bit-MTP
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Conversión de referencia de mlx-community: https://huggingface.co/mlx-community/Qwen3.6-35B-A3B-4bit
- Motor TensorFold: https://github.com/ashhart/TensorFold
- Sitio del autor: https://tensorfold.dev
