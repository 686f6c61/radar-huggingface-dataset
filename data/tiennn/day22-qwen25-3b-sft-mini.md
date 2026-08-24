# tiennn/day22-qwen25-3b-sft-mini

## Resumen

`tiennn/day22-qwen25-3b-sft-mini` es un adaptador LoRA de supervisión fina (SFT) desarrollado por el autor `tiennn` como parte de un laboratorio de alineación de preferencias en GPU local. Se basa en el modelo `unsloth/Qwen2.5-3B-Instruct-bnb-4bit`, una versión cuantizada a 4 bits del Qwen2.5-3B-Instruct de Alibaba, y se entrena sobre un subconjunto determinista de 1.000 ejemplos del dataset vietnamita `bkai-foundation-models/vi-alpaca`. El objetivo es adaptar el modelo a instrucciones en vietnamita e inglés, sirviendo como etapa previa a un posterior entrenamiento con DPO.

El checkpoint es de carácter educativo y experimental, no está pensado para producción. Su relevancia radica en demostrar un flujo completo de SFT con LoRA sobre un modelo base cuantizado, con métricas de entrenamiento reproducibles y un coste computacional muy bajo (menos de 8 minutos en una RTX 5060 Ti). El adaptador se distribuye en formato PEFT con pesos `safetensors` y se integra fácilmente con la librería `transformers` y `trl`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen2.5-3B-Instruct (transformer decoder-only) |
| Parametros totales | No disponible (adaptador LoRA; modelo base: 3,09 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 (maximo de secuencia en entrenamiento; el modelo base puede soportar mas, no especificado) |
| Tipos de cuantizacion | Modelo base en 4-bit (bnb-4bit); adaptador en BF16 |
| Idiomas soportados | Vietnamita, ingles |
| Licencia | No disponible |
| Formato de pesos | Safetensors (PEFT LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen2.5-3B-Instruct, un modelo de lenguaje denso, decoder-only, preentrenado por Qwen con hasta 18 billones de tokens segun la documentacion oficial de la serie Qwen2.5. El entrenamiento SFT utiliza LoRA con rango 16 y alpha 32, una sola epoca, longitud maxima de secuencia de 512 tokens, tasa de aprendizaje de 2e-4 y tamano de lote efectivo de 8. La perdida final de entrenamiento fue de 0,9616, con un tiempo total de 433,5 segundos y un pico de VRAM de 3,099 GB. El computo se realizo en BF16 sobre una NVIDIA RTX 5060 Ti de 16 GB. No se menciona el uso de tecnicas adicionales como RLHF o DPO en esta etapa; el adaptador es exclusivamente el resultado de SFT.

## Capacidades

- Generacion de texto en vietnamita e ingles siguiendo instrucciones conversacionales.
- Adaptacion especifica al dataset vi-alpaca, que contiene pares de instruccion-respuesta en vietnamita.
- Integracion con el ecosistema PEFT y transformers para cargar el adaptador sobre el modelo base cuantizado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.
- El modelo base subyacente (Qwen2.5-3B-Instruct) posee capacidades generales de codigo y matematicas, pero el adaptador no las mejora ni las garantiza.

## Casos de uso

- Investigacion academica sobre alineacion de modelos con LoRA: el checkpoint sirve como ejemplo reproducible de SFT con bajo consumo de recursos, util para estudiar el impacto del tamano del dataset y los hiperparametros.
- Prototipado rapido de asistentes conversacionales en vietnamita: se puede cargar el adaptador sobre Qwen2.5-3B-Instruct para generar respuestas en vietnamita en entornos de desarrollo, aunque sin garantias de calidad para produccion.
- Experimentacion con flujos de DPO: al ser la etapa SFT de un pipeline de preferencia, puede usarse como punto de partida para entrenar un adaptador DPO posterior, como indica el autor en la model card.
- Educacion en tecnicas PEFT: el repositorio incluye metadatos de reproducibilidad, historial de perdida y archivos de tokenizador, lo que lo convierte en material didactico para aprender a entrenar adaptadores LoRA.
- Evaluacion comparativa de adaptadores multilingues: permite comparar el rendimiento de un adaptador entrenado con solo 1.000 ejemplos frente a otros adaptadores con mas datos, en tareas de generacion en vietnamita.
- Despliegue en entornos con recursos limitados: al requerir solo 3,1 GB de VRAM en entrenamiento, la inferencia con el adaptador puede ejecutarse en GPUs de consumo con 6-8 GB, facilitando pruebas locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (0,9616) y el tiempo de ejecucion (433,5 s). No hay comparaciones con otros modelos ni evaluaciones en tareas estandar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: con el modelo base en 4-bit y el adaptador LoRA, se requiere aproximadamente 3-4 GB de VRAM para secuencias cortas (512 tokens). El entrenamiento pico fue de 3,099 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 5060 Ti). La GPU usada en el entrenamiento fue una RTX 5060 Ti de 16 GB.
- Si cabe en GPU de consumo: si, en GPUs de gama media y baja con 6 GB o mas.
- Opciones de despliegue: se puede cargar con `transformers` + `peft` en Python; tambien es posible convertirlo a GGUF para usarlo con `llama.cpp` u Ollama, aunque no se proporciona dicha conversion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de comparativas publicadas con otros adaptadores LoRA para vietnamita o con el modelo base sin adaptar. Como referencia, el modelo base Qwen2.5-3B-Instruct es un modelo denso de 3,09 mil millones de parametros con soporte para 32K de contexto (segun la documentacion oficial de Qwen2.5, aunque no se confirma en la ficha del adaptador). Otros adaptadores LoRA para vietnamita existen en HuggingFace, pero no se han encontrado datos concretos en la informacion proporcionada. Por tanto, la comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Checkpoint educativo, no apto para produccion: el autor lo declara explicitamente como un modelo de laboratorio, sin garantias de factualidad, robustez o seguridad.
- Dataset de entrenamiento muy pequeno (1.000 ejemplos), lo que limita la cobertura de temas y la generalizacion.
- Riesgo de alucinacion y de generar contenido incorrecto o inconsistente, especialmente en dominios especializados (medico, legal, etc.).
- La licencia no esta especificada, por lo que se desconoce si permite uso comercial o modificacion.
- El adaptador solo cubre vietnamita e ingles; no se ha evaluado su comportamiento en otros idiomas.
- La longitud de contexto efectiva esta limitada a 512 tokens durante el entrenamiento, aunque el modelo base pueda soportar mas; no se ha probado con secuencias largas.
- No se proporcionan evaluaciones de sesgos ni de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/tiennn/day22-qwen25-3b-sft-mini
- Repositorio de codigo y evaluacion: https://github.com/Tienlee41/K3-Track3-Day22-2A202601145_LeAnhTien
- Modelo base (unsloth/Qwen2.5-3B-Instruct-bnb-4bit): https://huggingface.co/unsloth/Qwen2.5-3B-Instruct-bnb-4bit
- Dataset vi-alpaca: https://huggingface.co/datasets/bkai-foundation-models/vi-alpaca
- Documentacion de Qwen2.5: https://huggingface.co/collections/Qwen/qwen25
