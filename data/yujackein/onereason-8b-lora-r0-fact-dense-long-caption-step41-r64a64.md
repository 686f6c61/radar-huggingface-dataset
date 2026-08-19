# yujackein/onereason-8b-lora-r0-fact-dense-long-caption-step41-r64a64

## Resumen

Este repositorio contiene un adaptador LoRA experimental para el modelo base `OpenOneRec/OneReason-8B-pretrain-competition`, desarrollado por el usuario yujackein como parte de la competición OneReason. El adaptador representa la concatenación de un checkpoint padre (RL10) con un residual de rango 32 entrenado sobre 301.951 filas de datos SID-to-caption (identificadores de ítems a descripciones) en dominios de vídeo, producto, anuncio y livestream. El objetivo es mejorar la generación de captions factualmente densas para recomendación generativa, aunque los resultados locales no confirman una mejora sobre el padre.

El adaptador tiene rango/alpha 64/64 y se ha entrenado con contexto de 32.768 tokens. Está pensado para ser cargado con `peft` sobre el modelo base, que es un modelo de lenguaje de 8B parámetros (según su denominación) especializado en recomendación generativa. La licencia no está especificada y el modelo soporta chino e inglés. Este es un checkpoint intermedio (paso 41 de 164) de un experimento residual, no un modelo final validado oficialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base transformer de 8B, no especificado) |
| Parametros totales | No disponible (modelo base ~8B; adaptador LoRA de 0,7 GB) |
| Parametros activos | No disponible (no es MoE) |
| Longitud de contexto | 32.768 (según entrenamiento residual) |
| Tipos de cuantizacion | No disponible (se usa bfloat16 en el ejemplo de carga) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | No disponible |
| Formato de pesos | safetensors, peft (adaptador LoRA) |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango/alpha 64/64 que se obtiene concatenando dos ramas: un checkpoint padre RL10 de rango 32 (con puntuación oficial registrada de 1.2402) y un residual de rango 32 entrenado durante 41 pasos de un plan de 164. El residual se entrenó con AdamW (LR 1e-4, coseno, 3% warmup) sobre datos SID-to-caption limpiados de forma determinista (eliminación de plantillas de narración y frases duplicadas, sin modelos externos). Se actualizaron las capas 0 a 34 de los siete módulos lineales, dejando la capa 35 congelada a cero. El entrenamiento se realizó en 4 GPUs NVIDIA A800 de 80 GB. El adaptador resultante no es un modelo fusionado; debe cargarse como un adaptador PEFT sobre el modelo base.

## Capacidades

- Generación de captions descriptivas a partir de identificadores de ítems (SID-to-caption) para recomendación generativa.
- Soporte de chino e inglés.
- Adaptador LoRA diseñado para ser combinado con el modelo base OneReason-8B, que es un modelo de lenguaje para recomendación.
- No se documentan capacidades de tool calling, agentes, visión ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Investigación en recomendación generativa: el adaptador puede usarse para experimentar con la generación de descripciones factualmente densas de ítems (vídeos, productos, anuncios, livestreams) a partir de sus IDs, como parte de pipelines de recomendación basados en lenguaje.
- Evaluación de técnicas de ajuste fino residual: este checkpoint sirve como caso de estudio para comparar el impacto de un entrenamiento residual parcial sobre un modelo base ya afinado, especialmente en entornos de competición con métricas formales.
- Generación de metadatos enriquecidos: puede aplicarse a la creación automática de captions para catálogos de contenido, aunque su rendimiento no está validado oficialmente.
- Desarrollo de sistemas de recomendación conversacional: al integrarse con el modelo base, podría utilizarse para responder consultas sobre ítems específicos en chino o inglés.
- Pruebas de robustez en limpieza de datos: el entrenamiento usó una limpieza determinista sin modelos externos, lo que permite estudiar el efecto de la calidad del dataset en el ajuste fino.
- Benchmarking de adaptadores LoRA: el repositorio documenta un procedimiento de concatenación de ramas y verificación de integridad (SHA-256), útil para quienes desarrollan herramientas de gestión de adaptadores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales para este adaptador. La model card reporta métricas locales deterministas (no oficiales) sobre conjuntos fijos: F1 de unigramas de caracteres de 0.212361 frente a 0.237865 del padre RL10, presencia de plantillas del 22.5% frente a 72.5%, y NLL de referencia de 1.472657 frente a 1.398245 (menor es mejor). Estos datos indican que el adaptador no supera al padre en estas pruebas locales. No hay resultados de MMLU, HumanEval u otros benchmarks estándar.

## Requisitos de hardware

- El adaptador LoRA ocupa 0,7 GB, pero requiere cargar el modelo base de ~8B parámetros. Para inferencia en bfloat16, se estima una VRAM mínima de 16-20 GB (dependiendo de la cuantización del modelo base).
- GPU recomendadas: NVIDIA A100, A800, H100, o consumer como RTX 4090 (24 GB) si se cuantiza el base (por ejemplo, con bitsandbytes).
- No se especifican requisitos oficiales de latencia o throughput.
- Opciones de despliegue: el ejemplo de carga usa `transformers` y `peft`. Puede servirse con vLLM o TGI si se fusiona el adaptador, aunque no se documenta.
- El entrenamiento se realizó con 4x A800 80GB, pero la inferencia es viable en una sola GPU de gama alta.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para este adaptador. El modelo base pertenece a la familia OneReason/OneRec, pero no se han proporcionado datos de otros adaptadores o modelos de la misma categoría para comparar. Se recomienda consultar el paper técnico de OneReason (arXiv:2606.06260) para contexto sobre la familia.

## Limitaciones y advertencias

- El adaptador es experimental y no ha sido evaluado oficialmente; la puntuación 1.2402 pertenece al padre RL10 y no debe atribuirse a este checkpoint.
- Los resultados locales no muestran una mejora consistente; el F1 y la NLL son peores que los del padre, aunque se reduce la presencia de plantillas.
- Se detectó un bucle de repetición que alcanzó el límite de 512 tokens en una prueba local.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial.
- El modelo base no está descrito en detalle; se desconoce su arquitectura exacta, datos de entrenamiento y posibles sesgos.
- Al ser un adaptador LoRA, requiere el modelo base para funcionar; no es un modelo autónomo.
- La limpieza de datos se hizo de forma determinista y podría no generalizar a otros dominios.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/yujackein/onereason-8b-lora-r0-fact-dense-long-caption-step41-r64a64
- Modelo base: https://huggingface.co/OpenOneRec/OneReason-8B-pretrain-competition
- Paper técnico OneReason: https://arxiv.org/abs/2606.06260
- Otros adaptadores del mismo autor (referencia): https://huggingface.co/yujackein/onereason-8b-lora-item32k-user75-rec50-worldclean1601-all1-lr2e4-r32a32-step323
- Despliegue en FriendliAI (ejemplo): https://friendli.ai/models/yujackein/onereason-8b-lora-item32k-user75-rec50-worldclean1601-all1-lr2e4-r32a32-step323
