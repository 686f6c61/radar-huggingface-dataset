# zybian222/olmo3-7b-table1-magicoder-standard-sft-20261110t071802z

## Resumen

El modelo `zybian222/olmo3-7b-table1-magicoder-standard-sft-20261110t071802z` es un ajuste fino supervisado (SFT) del modelo base `allenai/Olmo-3-1025-7B` de AI2, publicado por el usuario zybian222. El entrenamiento sigue la receta de código "Table 1" del trabajo TailSFT, aplicada sin el filtrado selectivo que caracteriza a TailSFT, sobre el conjunto de datos `ise-uiuc/Magicoder-OSS-Instruct-75K`. Con 7.298.011.136 parámetros (aproximadamente 7,3 mil millones), es un transformer denso de la familia OLMo 3, distribuido en formato safetensors bajo licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, sirve como ejemplo de reproducibilidad parcial de una receta de ajuste fino sobre datos de instrucciones de código, útil para investigadores que quieran comparar el efecto del filtrado TailSFT frente al entrenamiento estándar. Por otro, al derivar de OLMo 3, hereda el ecosistema abierto de AI2 (pesos, tokenizador y plantilla de chat completamente liberados), lo que facilita su inspección y experimentación.

No obstante, conviene subrayar que se trata de un checkpoint de investigación con cero descargas y cero likes en el momento de redactar esta ficha, y que el propio autor advierte de que no es el checkpoint oficial de los autores de TailSFT, sino una aproximación a su receta. Los resultados de benchmarks se publican por separado y no se incluyen en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia OLMo 3) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `allenai/Olmo-3-1025-7B`, un transformer denso de aproximadamente 7,3 mil millones de parámetros desarrollado por el Allen Institute for AI. Sobre esa base se aplica un ajuste fino supervisado completo (full standard SFT), es decir, se actualizan todos los pesos y no solo adaptadores. El entrenamiento se realizó en cuatro GPUs con un tamaño de lote global de 32, según la model card.

La receta de datos sigue la "Table 1" del trabajo TailSFT para el dominio de código, pero sin el filtrado TailSFT: se entrena directamente sobre `ise-uiuc/Magicoder-OSS-Instruct-75K`, un conjunto de instrucciones de código generado con el pipeline Magicoder. El autor indica que el muestreo y la descontaminación aproximan la receta descrita, y remite a un archivo `data_manifest.json` para los detalles de procedencia y licencias del dataset, así como para las diferencias explícitas de preprocesamiento. No se documentan en la información disponible detalles sobre número total de tokens vistos, composición exacta del dataset tras el muestreo, ni si hubo fases de RLHF o DPO posteriores.

## Capacidades

- Generación de texto conversacional en formato instrucción, heredada del ajuste SFT sobre datos de código.
- Generación y edición de código en múltiples lenguajes de programación, dado el origen Magicoder del dataset de entrenamiento.
- Resolución de instrucciones de programación de complejidad media (el dataset Magicoder-OSS-Instruct se caracteriza por instrucciones generadas a partir de fragmentos de código real).
- Soporte de plantilla de chat y tokenizador propios, guardados junto con el checkpoint; el autor recomienda usarlos explícitamente.
- Capacidades multilingües: no documentadas en la información disponible más allá de lo que herede del modelo base.
- Tool calling / function calling: no documentado en la información disponible.
- Modo de razonamiento explícito (thinking): no documentado en la información disponible.
- Capacidades de visión o audio: no disponibles (modelo de texto).

## Casos de uso

- Evaluación comparativa de recetas de ajuste fino: sirve como punto de control "sin filtrado" frente a variantes con TailSFT, permitiendo a investigadores aislar el efecto del filtrado de datos en el rendimiento final sobre tareas de código.
- Generación de código asistida en entornos de desarrollo: el modelo puede completar funciones y sugerir implementaciones a partir de descripciones en lenguaje natural, aprovechando su entrenamiento sobre Magicoder-OSS-Instruct.
- Reproducción de experimentos académicos: al estar liberado con licencia Apache 2.0 y pesos completos, permite replicar el pipeline de SFT en cuatro GPUs y validar los resultados publicados por separado.
- Fine-tuning posterior específico de dominio: al ser un checkpoint intermedio, puede servir de inicialización para ajustes adicionales en lenguajes o frameworks concretos con presupuesto limitado.
- Prototipado de asistentes de programación en local: con 7,3 mil millones de parámetros, es viable en GPUs de consumo con cuantización adecuada (aunque el autor no publique cuantizaciones, pueden generarse con herramientas estándar).
- Docencia y formación en ajuste fino: el repositorio incluye manifiesto de datos y configuración reproducible, lo que lo hace útil como caso de estudio de SFT sobre datos de código.
- Análisis de sesgos inducidos por datos sintéticos: al derivar de un dataset generado por otro modelo (Magicoder), permite estudiar la propagación de estilos y errores en el modelo final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que los resultados se presentan por separado y no se incluyen en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 14,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, se recomiendan 18-20 GB como mínimo.
- VRAM estimada con cuantización de 8 bits: en torno a 8 GB para pesos.
- VRAM estimada con cuantización de 4 bits: en torno a 4-5 GB para pesos, más overhead.
- GPUs recomendadas para servicio en producción: A100 40/80 GB, H100, L40S o RTX 6000 Ada, especialmente si se requiere contexto largo o lotes grandes.
- GPUs de consumo: cabe en RTX 4090 (24 GB) en fp16 y en RTX 3090/4080 con cuantización; en tarjetas de 8-12 GB requiere cuantización de 4 bits.
- Opciones de despliegue: transformers (librería declarada), vLLM, TGI, llama.cpp u Ollama tras conversión a GGUF, y endpoints compatibles (el repositorio incluye la etiqueta `endpoints_compatible`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Este modelo (OLMo-3 7B + Magicoder SFT) | 7,3 B | No disponible | Apache 2.0 | Hugging Face, 0 descargas | Checkpoint de investigación, sin benchmarks publicados |
| allenai/Olmo-3-1025-7B (base) | 7,3 B | No disponible | Apache 2.0 | Hugging Face, AI2 | Modelo base oficial, con evaluación publicada por AI2 |
| Modelos de código de ~7 B de la familia Qwen o CodeLlama | ~7 B | Variable según versión | Apache 2.0 / licencias específicas | Hugging Face | Alternativas consolidadas para generación de código; benchmarks públicos |

La comparación cuantitativa con alternativas no es posible con la información disponible, ya que este checkpoint no publica resultados de evaluación propios y el autor remite a un informe separado.

## Limitaciones y advertencias

- Checkpoint de investigación sin evaluación publicada: no hay benchmarks que permitan estimar su calidad real frente al modelo base o a alternativas.
- Reproducibilidad aproximada: el autor advierte de que el muestreo y la descontaminación solo aproximan la receta descrita y que no es el checkpoint oficial de los autores de TailSFT.
- Riesgo de alucinación: como todo modelo generativo de 7 B ajustado sobre datos sintéticos, puede producir código plausible pero incorrecto, especialmente en APIs poco representadas en el dataset.
- Sesgos heredados: los sesgos del modelo base OLMo 3 y del dataset Magicoder (generado por otro modelo) se propagan sin mitigación documentada.
- Idiomas: no se documenta el soporte multilingüe; el ajuste se realizó sobre un dataset predominantemente en inglés.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor remite a `data_manifest.json` para las licencias del dataset de origen, que deben verificarse antes de un despliegue comercial.
- Contexto: no se especifica la longitud de contexto efectiva tras el ajuste; conviene consultar la del modelo base y validar empíricamente.
- Madurez: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/zybian222/olmo3-7b-table1-magicoder-standard-sft-20261110t071802z
- Modelo base: https://huggingface.co/allenai/Olmo-3-1025-7B
- Dataset de entrenamiento: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Repositorio Magicoder (ise-uiuc): https://github.com/ise-uiuc/magicoder
- Paper TailSFT: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
