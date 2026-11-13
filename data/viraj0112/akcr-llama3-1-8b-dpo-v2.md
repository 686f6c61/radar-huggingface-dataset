# Viraj0112/akcr-llama3.1-8b-dpo-v2

## Resumen

`Viraj0112/akcr-llama3.1-8b-dpo-v2` es un adaptador LoRA entrenado con DPO (Direct Preference Optimization) sobre el modelo base `meta-llama/Llama-3.1-8B`. Lo publica el usuario Viraj0112 en Hugging Face y se distribuye como repositorio PEFT de aproximadamente 0,1 GB, lo que corresponde únicamente a los pesos del adaptador y no al modelo completo. La model card interna lo identifica como `aligntune_meta_llama_llama_3_1_8b_v2_cyborg_lora`, lo que sugiere un pipeline de alineamiento generado con la herramienta TRL.

El interés técnico es limitado pero concreto: se trata de un ejemplo de ajuste por preferencias sobre un Llama 3.1 de 8 000 millones de parámetros, con la arquitectura y el contexto heredados íntegramente del modelo base (transformer decoder-only, 128 000 tokens de contexto en Llama 3.1). El adaptador no modifica la arquitectura, solo los pesos de las capas seleccionadas por LoRA.

La relevancia práctica es baja para producción: no hay información publicada sobre el dataset de preferencias, hiperparámetros de entrenamiento, evaluación ni licencia del adaptador. Debe tratarse como un artefacto experimental y no como un modelo listo para desplegar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.1) con adaptador LoRA; el adaptador en sí es PEFT |
| Parametros totales | 8 000 millones en el modelo base; el adaptador LoRA ocupa ~0,1 GB (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens heredados de Llama 3.1 8B (no verificado en el adaptador) |
| Tipos de cuantizacion | no disponible para el adaptador; el modelo base admite cuantización estándar (INT8, INT4, GGUF, AWQ, GPTQ) |
| Idiomas soportados | no disponible (heredados de Llama 3.1: inglés, alemán, francés, italiano, portugués, hindi, español, tailandés; no confirmado para el adaptador) |
| Licencia | no disponible (la model card indica `licence: license`, sin especificar; el modelo base tiene Llama 3.1 Community License) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `meta-llama/Llama-3.1-8B`, un transformer decoder-only con 8 000 millones de parámetros, atención con RoPE, GQA y ventana de contexto de 128 000 tokens. El adaptador emplea LoRA (Low-Rank Adaptation) sobre capas del modelo base, con pesos almacenados en safetensors y cargables mediante la librería PEFT. No se especifican el rango, el alpha, las capas objetivo ni el número de parámetros entrenables del adaptador.

El entrenamiento se realizó con DPO, el método descrito en Rafailov et al. (2023), usando TRL 1.7.1, PEFT 0.21.2, Transformers 5.21.1, PyTorch 2.10.0+cu128, Datasets 5.1.0 y Tokenizers 0.23.3. No se publica información sobre el dataset de preferencias, el número de pares (chosen/rejected), la composición de los datos, la duración del entrenamiento ni si hubo una fase previa de SFT. Tampoco se documentan hiperparámetros como beta de DPO, learning rate o número de épocas.

## Capacidades

- Generación de texto conversacional multi-turno, heredada de Llama 3.1 8B Instruct (el adaptador se aplica sobre la variante base, por lo que el formato de chat depende de la tokenización y plantilla usadas).
- Razonamiento general y respuesta a preguntas en inglés y otros idiomas cubiertos por Llama 3.1.
- Generación de código y matemáticas a nivel de un modelo de 8B (no evaluado en este adaptador).
- Soporte de tool calling y function calling heredado del modelo base (no verificado tras el ajuste DPO).
- Capacidades de agente y razonamiento multi-paso heredadas, sujetas a la degradación típica de un ajuste DPO sin evaluación.
- Capacidades multilingües heredadas del modelo base, no verificadas en el adaptador.
- No se documentan capacidades especiales (thinking mode, visión, audio) en el adaptador.

## Casos de uso

- Experimentación con DPO sobre Llama 3.1 8B: el adaptador sirve como referencia para reproducir pipelines de alineamiento con TRL y PEFT en un entorno controlado, cargando el adaptador sobre el modelo base y comparando respuestas antes y después.
- Investigación sobre preferencias: útil para estudiar cómo un ajuste DPO de bajo rango altera el estilo y la verbosidad de las respuestas de un Llama 3.1 8B, siempre que se documente el dataset (no disponible aquí).
- Prototipado de asistentes conversacionales: se puede integrar en un pipeline de `transformers` con `PeftModel` para generar respuestas en tareas de chat de baja criticidad, aprovechando el contexto de 128 000 tokens del modelo base.
- Evaluación comparativa de adaptadores: sirve como baseline para medir el efecto de distintos datasets de preferencias sobre el mismo modelo base en tareas de estilo y seguridad.
- Fine-tuning incremental: el adaptador puede fusionarse con el modelo base (`merge_and_unload`) para producir un checkpoint completo que luego se cuantice a GGUF o AWQ y se despliegue con llama.cpp u Ollama.
- Docencia y formación: ejemplo mínimo de repositorio PEFT (0,1 GB) para enseñar el flujo de carga de adaptadores LoRA con `transformers` y `peft`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base en FP16: ~16 GB; en INT8: ~8-9 GB; en INT4 (GGUF Q4_K_M): ~5-6 GB. El adaptador añade un consumo despreciable (~0,1 GB).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 con contexto moderado; RTX 3090/4080 (16-24 GB) para INT8; RTX 3060 12 GB o superiores para INT4.
- Cabe en GPU de consumo: sí, en cuantización INT4 o INT8 (RTX 3060 12 GB en adelante); en FP16 requiere al menos 16 GB, por lo que una RTX 4090 o una A100 son las opciones realistas.
- Opciones de despliegue: `transformers` + `peft` (carga del adaptador), vLLM (con soporte de adaptadores LoRA), TGI, llama.cpp/Ollama (tras fusionar y convertir a GGUF), y servidores propios con `PeftModel.from_pretrained`.
- Latencia y throughput: no disponibles para este adaptador; para el modelo base Llama 3.1 8B en A100 se suele observar un throughput del orden de miles de tokens por segundo con batching, pero no hay medición publicada para este artefacto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Viraj0112/akcr-llama3.1-8b-dpo-v2` | 8B (base) + adaptador LoRA | 128 000 (heredado) | no disponible | Hugging Face, 0 descargas | Adaptador DPO sin evaluación publicada |
| `meta-llama/Llama-3.1-8B-Instruct` | 8B | 128 000 | Llama 3.1 Community License | Hugging Face, ampliamente usado | Modelo oficial con SFT + RLHF y evaluación publicada |
| `meta-llama/Llama-3.1-8B` | 8B | 128 000 | Llama 3.1 Community License | Hugging Face | Modelo base sin alineamiento |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,2B | 32 000 | Apache 2.0 | Hugging Face | Alternativa de tamaño similar con licencia permisiva |

## Limitaciones y advertencias

- No se publica información sobre el dataset de preferencias ni sobre la evaluación del adaptador; el riesgo de alucinación y de degradación de capacidades respecto al modelo base no está medido.
- La licencia del adaptador no está especificada (`licence: license`); el uso comercial queda sujeto a la Llama 3.1 Community License del modelo base y a la ausencia de una licencia explícita del adaptador, lo que genera incertidumbre legal.
- El adaptador se aplica sobre la variante base (`meta-llama/Llama-3.1-8B`), no sobre la Instruct; el comportamiento conversacional depende de la plantilla de chat y de la tokenización empleadas, que no se documentan.
- No hay información sobre sesgos, idiomas efectivamente soportados ni rendimiento en tareas específicas.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado en el mismo minuto; no hay evidencia de uso o validación por terceros.
- El tamaño del repositorio (0,1 GB) confirma que solo contiene el adaptador; es necesario descargar el modelo base por separado, con los requisitos de hardware y aceptación de licencia que ello implica.
- No se documentan hiperparámetros de DPO (beta, learning rate, épocas) ni la existencia de una fase previa de SFT, lo que dificulta la reproducibilidad.

## Enlaces

- Hugging Face: https://huggingface.co/Viraj0112/akcr-llama3.1-8b-dpo-v2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B
- Paper de DPO: https://huggingface.co/papers/2305.18290
- Repositorio TRL: https://github.com/huggingface/trl
- Paper de DPO (NeurIPS 2023): http://papers.nips.cc/paper_files/paper/2023/hash/a85b405ed65c6477a4fe8302b5e06ce7-Abstract-Conference.html
