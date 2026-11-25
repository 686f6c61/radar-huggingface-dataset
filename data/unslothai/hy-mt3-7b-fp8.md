# unslothai/Hy-MT3-7B-FP8

## Resumen

Hy-MT3-7B-FP8 es la versión cuantizada en FP8 del modelo de traducción multilingüe Hy-MT3-7B desarrollado por Tencent. Este repositorio concreto lo publica el equipo de Unsloth (unslothai), que redistribuye los pesos originales en formato FP8 con el objetivo de reducir el espacio en disco y los requisitos de memoria durante la inferencia sin renunciar a la precisión del modelo original. El modelo está etiquetado con el pipeline `translation`, por lo que su propósito principal es la traducción automática entre idiomas.

La arquitectura declarada es `hunyuan_v1_dense`, es decir, un transformer denso (no MoE) de la familia Hunyuan, con 7.504.568.320 parámetros totales (aproximadamente 7,5 mil millones). El repositorio ocupa 8,0 GB y contiene dos shards de pesos en Safetensors más el índice, el tokenizer y la configuración de ejecución. La licencia es Apache 2.0, lo que facilita su uso comercial.

La relevancia de esta ficha radica en que el modelo base (tencent/Hy-MT3-7B) está especializado en traducción, y esta variante FP8 permite desplegarlo en hardware con menos VRAM que la versión en BF16. No obstante, la información publicada en este repositorio es mínima: no se detallan idiomas soportados, datos de entrenamiento ni resultados de benchmarks, que deben consultarse en la release original de Tencent.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 7.504.568.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (2 shards + índice) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `hunyuan_v1_dense`, un transformer denso de la familia Hunyuan de Tencent con aproximadamente 7,5 mil millones de parámetros. Al ser una variante cuantizada, la arquitectura subyacente es idéntica a la del modelo base tencent/Hy-MT3-7B; la única diferencia es la representación numérica de los pesos en FP8 (formato compressed-tensors), que reduce el tamaño del repositorio a 8,0 GB.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en la información proporcionada. Tampoco se detallan innovaciones técnicas específicas más allá de la propia cuantización FP8. Para conocer los detalles del entrenamiento original es necesario consultar la model card de tencent/Hy-MT3-7B y su release FP8 original.

## Capacidades

- Traducción automática multilingüe: es la tarea principal declarada en el pipeline (`translation`).
- Generación de texto: el tag `text-generation` indica que el modelo puede producir texto libre además de traducciones.
- Compatibilidad con endpoints: el tag `endpoints_compatible` sugiere que puede desplegarse en infraestructuras de inferencia compatibles con la API de Hugging Face.
- Ejecución en FP8: puede ejecutarse en configuraciones de hardware que soporten FP8, incluyendo Unsloth Desktop según la model card.
- Capacidades de tool calling, agentes, visión o audio: no disponibles en la información proporcionada.
- Idiomas concretos soportados: no disponibles en este repositorio; deben consultarse en la release original.

## Casos de uso

- Traducción de documentación técnica: el modelo puede traducir manuales y guías entre idiomas, aprovechando su especialización en traducción y su licencia Apache 2.0 para uso comercial en herramientas internas.
- Localización de productos software: integración en pipelines de CI/CD para traducir cadenas de interfaz y ficheros de recursos de forma automatizada, con el ahorro de memoria que aporta el formato FP8.
- Traducción de contenido web a escala: despliegue en servidores con GPUs de gama media gracias a la reducción de VRAM del FP8, procesando lotes de textos en paralelo.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes que hablan idiomas distintos, siempre que se validen previamente los pares de idiomas soportados en la release original.
- Generación de subtítulos y transcripciones traducidas: combinación con sistemas de reconocimiento de voz para producir subtítulos en otro idioma, usando el modelo como etapa de traducción.
- Investigación en traducción automática: uso como baseline cuantizado para comparar calidad frente a versiones BF16 y estudiar el impacto del FP8 en métricas de traducción (BLEU, COMET, etc.).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP8: aproximadamente 8 GB solo para los pesos (7,5 mil millones de parámetros a 1 byte por parámetro), más overhead de activaciones y caché KV; en la práctica se recomienda al menos 10-12 GB de VRAM para contextos moderados.
- GPU recomendadas: NVIDIA H100, A100 y GPUs con soporte nativo de FP8 (arquitectura Hopper o Ada Lovelace, como L40S o RTX 4090).
- GPU de consumo: cabe en una RTX 4090 (24 GB) con margen amplio; en GPUs con menos de 10 GB puede requerir offloading o cuantizaciones adicionales.
- Opciones de despliegue: transformers (librería declarada), Unsloth Desktop (según la model card) y, previsiblemente, servidores compatibles con compressed-tensors; vLLM, llama.cpp u Ollama no están confirmados en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| unslothai/Hy-MT3-7B-FP8 | 7,5 B | no disponible | Safetensors FP8 | Apache 2.0 | Variante cuantizada de Unsloth |
| tencent/Hy-MT3-7B-FP8 | 7,5 B | no disponible | Safetensors FP8 | Apache 2.0 | Release original de Tencent |
| tencent/Hy-MT3-7B | 7,5 B | no disponible | Safetensors (BF16 presumiblemente) | Apache 2.0 | Modelo base sin cuantizar |

No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoría (por ejemplo, NLLB o M2M-100), por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- La información publicada en este repositorio es mínima: no se especifican idiomas soportados, contexto máximo ni datos de entrenamiento, lo que dificulta evaluar su idoneidad sin consultar la release original.
- La cuantización FP8 puede introducir una ligera degradación en la calidad de traducción respecto al modelo en BF16; no se han publicado métricas que cuantifiquen esta pérdida.
- Riesgo de alucinación y de traducciones incorrectas en dominios especializados (legal, médico, técnico) sin validación humana.
- Sesgos conocidos: no disponibles; cabe esperar los sesgos presentes en los datos de entrenamiento del modelo base.
- Requiere hardware con soporte FP8 para aprovechar plenamente el formato; en GPUs sin soporte nativo puede haber conversión a otros formatos con penalización de rendimiento.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar el fichero LICENSE.txt y las condiciones del modelo base original.
- Al ser un repositorio redistribuido por un tercero (unslothai), la responsabilidad sobre la integridad de los pesos recae en el publicador; se recomienda verificar contra la release oficial de Tencent.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/unslothai/Hy-MT3-7B-FP8
- Release FP8 original de Tencent: https://huggingface.co/tencent/Hy-MT3-7B-FP8
- Modelo base original: https://huggingface.co/tencent/Hy-MT3-7B
- Unsloth: https://unsloth.ai/
- Fichero de licencia: https://huggingface.co/unslothai/Hy-MT3-7B-FP8/blob/main/LICENSE.txt
