# two-loaves/queue_merged-u83-v1

## Resumen

`two-loaves/queue_merged-u83-v1` es un modelo de lenguaje de 35.107 millones de parámetros desarrollado por el usuario `two-loaves` y publicado en HuggingFace con acceso restringido (gated). Se trata de un merge o fine-tune del modelo base `marsplan0624/affine-5gedzafcvg-queen`, que por sus etiquetas (`qwen3_5_moe`, `image-text-to-text`, `reason-v3`, `online-dpo`) parece ser un modelo de arquitectura MoE basado en la familia Qwen 3.5, con capacidades multimodales (imagen y texto) y entrenamiento mediante DPO online y razonamiento.

El modelo está orientado a generación de texto conversacional y procesamiento de entradas visuales, aunque no se dispone de documentación pública detallada sobre su arquitectura interna, datos de entrenamiento o rendimiento. Su relevancia radica en ser un ejemplo reciente de modelos MoE de gran tamaño con fine-tuning específico, pero la falta de información pública limita su evaluación objetiva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (según tag `qwen3_5_moe`), transformer multimodal |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (repo de 70,2 GB) |

## Arquitectura y entrenamiento

La información pública es escasa. El modelo es un merge o fine-tune del checkpoint `marsplan0624/affine-5gedzafcvg-queen`, que por sus etiquetas pertenece a la familia Qwen 3.5 con arquitectura MoE (mezcla de expertos). Los tags `image-text-to-text` indican que el modelo acepta entradas multimodales (imagen y texto) y genera texto. Las etiquetas `reason-v3` y `online-dpo` sugieren que se aplicó un entrenamiento de razonamiento y optimización mediante DPO (Direct Preference Optimization) en línea, probablemente sobre un dataset de preferencias. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni detalles de la arquitectura interna (número de expertos, capas, etc.).

## Capacidades

Según las etiquetas y el tipo de modelo, se pueden inferir las siguientes capacidades, aunque no están confirmadas por documentación oficial:

- Generación de texto conversacional y de larga respuesta.
- Procesamiento de entradas multimodales (imagen y texto) para tareas de descripción, respuesta a preguntas visuales o razonamiento sobre imágenes.
- Posible soporte de razonamiento multi-paso (por el tag `reason-v3`).
- Entrenamiento con DPO online, lo que sugiere una alineación con preferencias humanas.
- No se confirma soporte de tool calling, function calling ni agentes.

## Casos de uso

Dado que no hay documentación oficial, los siguientes casos son potenciales y deben validarse con pruebas propias:

- Asistentes conversacionales multimodales: el modelo podría responder preguntas sobre imágenes en un chat, combinando comprensión visual y generación de texto.
- Análisis de documentos con imágenes: extracción de información de capturas, diagramas o gráficos en entornos empresariales.
- Generación de descripciones accesibles: creación de texto alternativo para imágenes en plataformas de contenido.
- Razonamiento visual en educación: explicación de problemas de matemáticas o ciencias a partir de imágenes.
- Fine-tuning adicional para dominios específicos: al ser un modelo abierto (aunque con acceso gated), podría adaptarse a tareas concretas con datasets propios.
- Investigación en alineación de modelos: su entrenamiento con DPO online lo hace interesante para estudiar técnicas de preferencia en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- El tamaño del repo (70,2 GB) sugiere pesos en precisión FP16 o BF16. Para cargar el modelo completo en memoria se necesitan aproximadamente 70 GB de VRAM.
- Con cuantización de 8 bits, la VRAM estimada sería de ~35 GB; con 4 bits, ~18 GB (estimaciones basadas en el tamaño de parámetros, no confirmadas).
- GPU recomendadas: para FP16, una NVIDIA A100 80GB o H100 80GB; para 8 bits, una RTX 4090 (24 GB) no sería suficiente, se necesitaría una A6000 (48 GB) o similar; para 4 bits, una RTX 4090 podría ser viable.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI o llama.cpp (si se convierte a GGUF). No se ha confirmado compatibilidad con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de la misma categoría. El modelo parece ser un MoE de ~35B parámetros, similar en tamaño a Mixtral 8x7B (47B totales, 13B activos) o a Qwen3 MoE, pero no hay datos de rendimiento ni de arquitectura exacta. Se recomienda consultar la documentación del modelo base `marsplan0624/affine-5gedzafcvg-queen` para más detalles.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated, por lo que se requiere aceptar condiciones en HuggingFace antes de descargarlo.
- Licencia no especificada: no se conoce si permite uso comercial o tiene restricciones.
- Sin documentación técnica: no hay papers, blogs ni guías oficiales que describan el entrenamiento, los datos o las limitaciones.
- Riesgo de alucinación y sesgos: al no haber evaluación pública, no se puede garantizar la fiabilidad de las respuestas, especialmente en dominios sensibles.
- Contexto y idiomas desconocidos: no se sabe la longitud máxima de contexto ni los idiomas soportados, lo que limita su uso en producción.
- Modelo experimental: al ser un merge/fine-tune reciente (creado en agosto de 2026) y con cero descargas, puede contener artefactos de entrenamiento o comportamientos inesperados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/two-loaves/queue_merged-u83-v1
- Modelo base: https://huggingface.co/marsplan0624/affine-5gedzafcvg-queen
- No se han encontrado papers, repositorios de código ni demos adicionales.
