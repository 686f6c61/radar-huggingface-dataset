# Wiself/Voice

## Resumen

Voice es una herramienta de línea de comandos desarrollada por Wiself que permite transferir el estilo conversacional (denominado "voz") de un modelo fine-tune a otro modelo base compatible, generando un archivo GGUF fusionado listo para ejecutar con llama.cpp u otros motores. No es un modelo de lenguaje en sí, sino un sistema de personalización que extrae los tensores de la cabeza del modelo de origen y los aplica al modelo de destino, manteniendo el resto de pesos intactos. Según la documentación, el proceso reduce la descarga de un modelo completo (26 GB) a solo la "voz" (1,4 GB), y el resultado final es un archivo único sin adaptadores en tiempo de ejecución.

La herramienta está diseñada para funcionar entre familias de modelos como Qwen, Gemma, Llama, GLM o DeepSeek, siempre que compartan arquitectura y vocabulario. El repositorio se presenta como una demostración sobre el base google/gemma-4-26B-A4B-it, un MoE de 26B con 4B activos, y utiliza el dataset gryphe/styletune-roleplay-200 como ejemplo de voz. Su relevancia actual radica en que ofrece una alternativa ligera a los fine-tunes completos para personalizar el estilo de respuesta sin reentrenar, con licencia Apache 2.0 y orientación a casos de roleplay y transferencia de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Herramienta CLI de transferencia de estilo; opera sobre modelos base compatibles (ej. google/gemma-4-26B-A4B-it) |
| Parametros totales | No aplica (no es un modelo entrenado) |
| Parametros activos | No aplica |
| Longitud de contexto | Depende del modelo base sobre el que se aplique |
| Tipos de cuantizacion | Produce GGUF con cabeza en Q8_0; el resto del modelo conserva su cuantizacion original |
| Idiomas soportados | Ingles (segun la model card); el resultado depende del modelo base |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (salida); la "voz" se guarda como safetensors + JSON |

## Arquitectura y entrenamiento

Voice no es un modelo entrenado, sino una herramienta de fusion de pesos. El proceso "voice cast" toma la cabeza (head) de un modelo fine-tune, la cuantiza a Q8_0 y la fusiona con el cuerpo de un modelo base GGUF, generando un archivo completo. La tecnica no requiere adaptadores en tiempo de ejecucion: el resultado es un GGUF estandar. La documentacion menciona dos modos: "cast directo" (fusion completa) y "delta" (que mezcla solo la diferencia respecto a un base, util para evitar bucles en modelos ablacionados). El dataset gryphe/styletune-roleplay-200 se usa como ejemplo de voz, y los papers arxiv:2607.02770 y arxiv:2503.19786 aparecen como referencias, aunque no se detalla su contenido.

## Capacidades

- Transferencia de estilo conversacional entre modelos compatibles (misma arquitectura y vocabulario).
- Cast directo y cast delta para manejar modelos ablacionados o con riesgo de bucles.
- Compatibilidad multi-familia: Qwen, Gemma, Llama, GLM, DeepSeek, siempre que los tensores coincidan.
- Generacion de un archivo GGUF completo y listo para ejecutar con llama.cpp, vLLM u otros motores.
- CLI con siete comandos: get, delta, cast, list, info, remove y path.
- Descarga ligera de voces mediante range requests (la voz ocupa ~1,4 GB frente a los 26 GB del modelo completo).
- Inspeccion de voces guardadas (voice info) y gestion de biblioteca local.

## Casos de uso

- Personalizacion de modelos de roleplay: aplicar la voz de un fine-tune como Gryphe/Gemma-4-26B-A4B-StyleTune-V2 a un base mas potente para mantener el rendimiento de razonamiento con un estilo mas natural.
- Creacion de variantes de estilo sin reentrenar: generar multiples GGUF del mismo modelo base con diferentes voces (por ejemplo, una para atencion al cliente y otra para redaccion creativa).
- Despliegue en entornos con ancho de banda limitado: descargar solo la voz (~1,4 GB) en lugar del modelo completo (26 GB) y fusionarla localmente.
- Integracion en pipelines de generacion con llama.cpp: el archivo resultante se sirve con `llama serve -m ./voiced/model.gguf` sin configuracion adicional.
- Experimentacion con mezclas de voces: combinar una voz de un modelo y castarla sobre otro base para explorar comportamientos intermedios (por ejemplo, mezclar For-Her-Darkside-12B con Serenity-12B sobre un base gemma4 12b).
- Migracion de estilos entre familias: extraer la voz de un fine-tune de Qwen y aplicarla a un base Llama o Gemma, siempre que el vocabulario y la arquitectura coincidan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion menciona una prueba interna sobre el modelo Orion-26B-A4B-v1.4 donde el 98% de las frases diferian respecto al original (1,6% compartidas a temperatura 1.0 y 3,2% en greedy), pero no se ofrecen metricas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- La herramienta CLI es ligera, pero el proceso de cast requiere cargar el modelo base GGUF en memoria, por lo que la VRAM depende del modelo elegido.
- Para el ejemplo gemma-4-26B-A4B-it con cuantizacion Q8_0 en la cabeza, se recomienda al menos 16 GB de VRAM para inferencia fluida; con cuantizaciones inferiores (Q4_K_M) puede caber en GPUs de 12 GB.
- GPUs recomendadas: RTX 4090 (24 GB), A100 (40/80 GB) o H100 para modelos grandes sin cuantizar.
- El archivo resultante se puede servir con llama.cpp, vLLM, Ollama o TGI, siempre que soporten GGUF.
- No se han publicado datos de latencia o throughput especificos de la herramienta.

## Comparativa con modelos similares

No hay herramientas publicas directamente comparables que realicen transferencia de estilo mediante fusion de cabezas en formato GGUF. La alternativa mas cercana seria el fine-tuning con LoRA, que requiere entrenamiento y produce adaptadores separados, mientras que Voice genera un archivo unico sin dependencias en runtime. No se dispone de datos de rendimiento para establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo independiente: requiere un modelo base compatible y una voz extraida de un fine-tune con la misma arquitectura y vocabulario.
- Riesgo de bucles en modelos ablacionados o con cambios bruscos en el router MoE; el modo delta mitiga parcialmente este problema.
- La calidad del resultado depende de la compatibilidad real entre los tensores; no se garantiza que todas las combinaciones funcionen.
- El repositorio no incluye un archivo .gguf de ejemplo; el usuario debe ejecutar el proceso de cast manualmente.
- No hay benchmarks publicados que validen el rendimiento de las voces transferidas frente a los modelos originales.
- La licencia Apache 2.0 cubre la herramienta, pero los modelos base y las voces pueden tener licencias propias que deben verificarse antes de uso comercial.
- El idioma soportado declarado es solo ingles; el comportamiento en otros idiomas depende del modelo base.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Wiself/Voice
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Voz de ejemplo: https://huggingface.co/Gryphe/Gemma-4-26B-A4B-StyleTune-V2
- Modelo de prueba mencionado: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.4
- Referencias arxiv: https://arxiv.org/abs/2607.02770 y https://arxiv.org/abs/2503.19786
- Dataset de voz: https://huggingface.co/datasets/gryphe/styletune-roleplay-200
