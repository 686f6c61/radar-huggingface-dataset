# zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO

## Resumen

PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO es un artefacto de inferencia publicado por zen-E que actúa como receptor (receiver) completo dentro del marco PACT (Prefill-to-Autoregressive Cross-model Transfer). El modelo parte de Qwen/Qwen3.5-4B y se ha entrenado con GRPO (Group Relative Policy Optimization) sobre el dataset zen-E/PLatour-DAPO-Data, siguiendo la metodología descrita en el paper "On the Opportunities and Challenges of Prefill-to-Autoregressive Cross-Model Transfer" (arXiv:2611.06976). La idea central de PACT es que un modelo emisor de mayor tamano codifica el prompt y transfiere representaciones ocultas a un receptor mas pequeno que genera la respuesta de forma independiente.

El modelo tiene 4.841.450.496 parametros reales (segun safetensors) y se distribuye en formato Transformers con pesos safetensors en BF16, con un tamano de repositorio de 9,7 GB. La arquitectura subyacente es qwen3_5_text (transformer con atención híbrida, segun la model card), sin codificador de visión. El autor advierte explicitamente que se trata de artefactos historicos de inferencia sin puntuaciones de benchmark, por lo que la ficha debe leerse con cautela respecto a cualquier afirmacion de rendimiento.

La relevancia actual del modelo es fundamentalmente metodologica: sirve como pieza reproducible para estudiar si las mejoras en tareas dependen realmente de la informacion transferida por el emisor o si surgen de la mera adaptacion del receptor. El paper introduce PACT-Check con controles (Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver) para separar ambos efectos, lo que convierte a este checkpoint en material de investigacion mas que en un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (qwen3_5_text), atencion hibrida; sin codificador de vision |
| Parametros totales | 4.841.450.496 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (Transformers, BF16) |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen/Qwen3.5-4B (revision fijada 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a para la configuracion y el tokenizer del export), un transformer decoder-only con atencion hibrida segun la model card. El export mantiene deliberadamente independientes los embeddings de entrada y la cabeza de salida, preservando ambos tensores almacenados exactamente y el payload original en BF16. El paquete no incluye codificador de vision.

El entrenamiento sigue el marco PACT: un emisor de mayor tamano codifica el prompt y suministra representaciones ocultas, mientras el receptor (este modelo) genera la respuesta de forma independiente. El metodo principal entrena puentes lineales ligeros entre backbones congelados usando recompensas de tarea, partiendo de proyecciones inicializadas a cero y soportando modelos con atencion hibrida. En esta variante concreta, el receptor se ha entrenado con GRPO completo (FullGRPO) sobre el dataset zen-E/PLatour-DAPO-Data. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO mas alla del GRPO indicado en el nombre.

La innovacion tecnica destacable es el propio protocolo PACT-Check, que incluye controles de Dummy Transfer, Irrelevant Transfer, Self-Communication y Trained Receiver para verificar si las mejoras dependen de informacion util del emisor o de la adaptacion del receptor. El autor subraya que un mejor rendimiento en tarea no demuestra por si solo una comunicacion efectiva entre modelos.

## Capacidades

- Generacion de texto conversacional: el pipeline declarado es text-generation y el modelo esta etiquetado como conversational.
- Razonamiento y generacion autoregresiva como receptor dentro del esquema PACT.
- Entrenamiento con GRPO sobre recompensas de tarea, orientado a mejorar la calidad de las respuestas generadas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; la model card no declara idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible; el paquete no incluye codificador de vision.
- Endpoints compatibles: la etiqueta endpoints_compatible sugiere compatibilidad con la infraestructura de inferencia de Hugging Face.

## Casos de uso

- Investigacion sobre transferencia entre modelos: usar este receptor junto a un emisor mayor para reproducir los experimentos de PACT y medir si las representaciones ocultas transferidas aportan senal util frente a los controles de PACT-Check.
- Validacion de protocolos de evaluacion: emplear el modelo como "Trained Receiver" en los controles del paper para comprobar si las mejoras observadas se deben a la adaptacion del receptor y no a la comunicacion cross-model.
- Experimentos de destilacion de representaciones: entrenar o evaluar puentes lineales entre backbones congelados usando este checkpoint como receptor de referencia en tareas de generacion.
- Reproducibilidad academica: servir como artefacto historico fijo (revision de Qwen3.5-4B anclada) para replicar resultados y comparar trayectorias de entrenamiento en estudios posteriores.
- Analisis de alineacion con GRPO: estudiar el efecto de FullGRPO sobre un receptor de 4,8B en tareas con recompensa definida, comparando con el checkpoint base Qwen3.5-4B.
- Pruebas de carga e integracion: validar pipelines de Transformers (Torch 2.15.0, Transformers 5.22.1, PEFT 0.21.2) y comprobar la independencia de embeddings y cabeza de salida en despliegues de investigacion.
- Base para experimentos de atencion hibrida: aprovechar el soporte declarado de modelos con atencion hibrida para probar variantes de puentes y receptores en esa familia arquitectonica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que se trata de artefactos historicos de inferencia sin puntuaciones de benchmark y que el empaquetado no establece un protocolo de seleccion de checkpoint ni una evaluacion imparcial.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 9,7 GB solo para pesos (4,84B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica se recomienda reservar 12-16 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 5-6 GB de pesos; en 4 bits, en torno a 3 GB, aunque no se han publicado cuantizaciones oficiales para este checkpoint.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para BF16 sin problemas; GPUs consumer de 16 GB pueden alojar el modelo en BF16 con contexto corto.
- Cabe en GPU consumer: si, en RTX 4090, RTX 4080, RTX 3090 y tarjetas con 16 GB o mas en BF16; en 8 GB seria necesario cuantizar.
- Opciones de despliegue: Transformers con AutoModelForCausalLM (metodo documentado por el autor); vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO | 4,84B | no disponible | apache-2.0 | Hugging Face (zen-E) | Receptor PACT entrenado con GRPO; sin benchmarks publicados |
| Qwen/Qwen3.5-4B (modelo base) | ~4B | no disponible | no disponible en la informacion | Hugging Face (Qwen) | Backbone original sin el entrenamiento PACT |
| zen-E/qwen3-4b-instruct-grpo-dapo-2epoch-8k | ~4B | 8k (segun nombre) | no disponible en la informacion | Hugging Face (zen-E) | Variante previa del mismo autor con GRPO y DAPO, sin model card |

## Limitaciones y advertencias

- Artefacto de investigacion: el autor declara que son artefactos historicos de inferencia sin benchmarks; no debe tratarse como un modelo validado para produccion.
- Ausencia de evaluacion imparcial: la model card advierte que el empaquetado no establece un protocolo de seleccion ni una evaluacion no sesgada, y que se requiere evaluacion independiente antes de hacer afirmaciones comparativas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo de 4,8B sin benchmarks publicados, el riesgo es desconocido.
- Sesgos conocidos: no disponibles; no se documenta composicion del dataset ni filtros de sesgo.
- Idiomas: no declarados; no se puede asumir soporte multilingue mas alla del comportamiento heredado de Qwen3.5-4B.
- Contexto: longitud de contexto no especificada en la informacion proporcionada.
- Trazabilidad del entrenamiento: la revision anclada de Qwen3.5-4B corresponde al export actual, no necesariamente a la usada en el entrenamiento historico.
- Licencia: apache-2.0 para este paquete, pero siguen aplicando los terminos y avisos del modelo upstream Qwen/Qwen3.5-4B.
- Sin codificador de vision: no admite entradas de imagen.
- Dependencias de carga verificadas solo con Torch 2.15.0, Transformers 5.22.1 y PEFT 0.21.2; otras versiones pueden requerir ajustes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zen-E/PLatour-TR-FullGRPO-Qwen3.5-4B-DAPO
- Paper (arXiv): https://arxiv.org/abs/2611.06976
- Paper (HTML): https://arxiv.org/html/2611.06976
- Coleccion PLatour: https://huggingface.co/collections/zen-E/platour
- Dataset: https://huggingface.co/datasets/zen-E/PLatour-DAPO-Data
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Variante previa del autor: https://huggingface.co/zen-E/qwen3-4b-instruct-grpo-dapo-2epoch-8k
