# Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8

## Resumen

Este repositorio contiene una exportación cuantizada del modelo multimodal `google/gemma-4-31B-it-qat-q4_0-unquantized`, adaptada específicamente para su ejecución en aceleradores NPU de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante la pila de software TT-Metal y TT-NN. El trabajo lo firma Xylolabs, que aplica GPTQ sobre la rejilla de coma flotante por bloques `bfloat8_b` (BFP8) para comprimir las capas lineales del modelo de lenguaje, manteniendo en bf16 la torre de visión, los embeddings y las normas. El resultado es un checkpoint de 32.682.375.020 parámetros totales que ocupa 65,4 GB en el repositorio y requiere unos 33,94 GB de memoria de dispositivo para los pesos del modelo de lenguaje, más espacio para la caché KV y buffers.

El modelo base es un Gemma 4 de 31B de parámetros en variante instruct, multimodal (image-text-to-text) y con cuantización consciente del entrenamiento (QAT) en el checkpoint original de Google. Esta exportación preserva esa naturaleza multimodal y la licencia Apache 2.0, pero sustituye el formato de pesos por tensores empaquetados en la rejilla BFP8 que TT-NN puede cargar directamente sin transformar los valores. Es relevante ahora porque permite desplegar un modelo de 31B con capacidades de visión en hardware Tenstorrent, una alternativa a las GPU que gana tracción en entornos de inferencia de bajo consumo, y porque demuestra una ruta de cuantización BFP8 con GPTQ calibrada sobre texto en inglés y coreano.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face. Muchos detalles del modelo base (composición del dataset, número de tokens de entrenamiento, resultados de benchmarks estándar) no se detallan en esta exportación y se marcan como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (modelo de lenguaje + torre de visión), basado en Gemma 4; capas lineales cuantizadas a BFP8 |
| Parámetros totales | 32.682.375.020 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP8 (`ttnn.bfloat8_b`, 8,5 bits por peso en atención q/k/o y MLP gate/up/down; 8,85 bits por peso de media); existe una variante BFP4 del mismo autor |
| Idiomas soportados | no disponible en la model card; la calibración de GPTQ usa WikiText-2 (inglés) y Wikipedia en coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), tensores empaquetados en rejilla BFP8 para TT-NN; incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo base es un Gemma 4 de 31B en variante instruct y multimodal, con una torre de visión (`vision_tower`, `embed_vision`) que procesa imágenes y las proyecta al espacio del modelo de lenguaje. La exportación de Xylolabs cuantiza únicamente el modelo de lenguaje: las proyecciones de atención q, k, o (60 capas) y v (50 capas), así como gate, up y down del MLP (60 capas), se almacenan en `bfloat8_b` con 8,5 bits por peso. El resto de tensores —LM head atada al embedding, embeddings, normas y todos los tensores de visión— permanecen en bf16 sin cambios. El resultado son 8,85 bits por peso de media y 33,94 GB empaquetados.

La cuantización se realizó con GPTQ sobre la rejilla `bfloat8_b`, conservando el exponente compartido de cada bloque tal como lo fija el empaquetador, y se calibró con 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Las matrices cuantizadas se guardan como valores bf16 sobre la rejilla BFP8, de modo que TT-NN las empaqueta sin alterar sus valores; el autor incluye scripts (`pack_tensix.py`, `verify_grid.py`) para verificar que ninguna matriz cambia al empaquetarse. La model card indica que solo se cuantizó y evaluó el modelo de lenguaje, y que tt-transformers y tt-forge no se ejecutaron con este checkpoint; las pruebas se hicieron con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole de Tenstorrent.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla de chat aplicada mediante `apply_chat_template`.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), gracias a la torre de visión conservada en bf16.
- Razonamiento y respuesta a instrucciones, al tratarse de una variante instruct del modelo base.
- Capacidades multilingües: la model card no las enumera, pero la calibración incluye coreano además de inglés, lo que sugiere cobertura al menos de ambos idiomas.
- Integración con la pila de Tenstorrent: TT-NN, TT-Metal y empaquetado directo en memoria DRAM del dispositivo.
- Compatibilidad con `transformers` y `AutoModelForCausalLM` para inspección o ejecución en GPU/CPU con `dtype="bfloat16"`.
- No se documentan en la información disponible soporte de tool calling, function calling, agentes multi-paso, modo thinking ni audio.

## Casos de uso

- Despliegue en NPU Tenstorrent: el checkpoint está pensado para cargarse en Wormhole o Blackhole con TT-NN, empaquetando las matrices directamente en DRAM sin recomprimir; adecuado para equipos que quieren servir un modelo de 31B sin GPU.
- Asistente multimodal en el borde: al conservar la torre de visión en bf16, puede recibir imágenes y texto y responder en formato conversacional, útil en aplicaciones de inspección visual o accesibilidad.
- Servicio de chat con contexto conversacional: la plantilla de chat y el pipeline image-text-to-text permiten gestionar diálogos multi-turno; la longitud de contexto debe consultarse en el modelo base, ya que aquí no se especifica.
- Evaluación de cuantización BFP8: los scripts `pack_tensix.py` y `verify_grid.py` permiten auditar que las matrices empaquetadas coinciden bit a bit con los pesos guardados, lo que lo hace útil como referencia para pipelines de cuantización en hardware Tenstorrent.
- Investigación en eficiencia de inferencia: la comparación publicada frente a BF16 y a Q4_0 de llama.cpp (KL media y top-1 sobre 8.048 posiciones) sirve para estudiar el compromiso precisión/memoria de BFP8 con GPTQ.
- Prototipado en simulador: el autor verificó el empaquetado en ttsim (Blackhole), por lo que el checkpoint puede usarse para validar flujos de TT-Metal antes de disponer de hardware físico.
- Base para variantes de menor huella: el autor remite a su versión BFP4 (`...-Tensix-BFP4-GateUp`) para dispositivos con menos memoria, lo que permite escalar el mismo modelo a entornos más limitados.

## Benchmarks y rendimiento

La model card publica una evaluación propia centrada en la fidelidad de la cuantización respecto a BF16, no benchmarks estándar de tareas (MMLU, HumanEval, GSM8K no aparecen).

| Modelo | Bits por peso | Tamaño (GB) | KL media a BF16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (base de Google) | 16 | 61,39 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP8) | 8,85 | 33,938 | 0,00174 | 98,67 | 33 de 33 | 0 |
| Q4_0 (llama.cpp) | 4,60 | 17,651 | 0,01920 | 95,33 | 33 de 33 | 0 |

La KL y el top-1 se calculan sobre 8.048 posiciones de texto en inglés y coreano (test de WikiText-2 y Wikipedia en coreano) con la plantilla de chat. Las 33 respuestas corresponden a 33 prompts cortos con comprobación automática; "perdidas" indica respuestas correctas en BF16 que aquí fallan o se rompen. El Q4_0 se generó desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia, con sha256 `141db4794deefb1b40be410f297e53ac17a0742b879edbe98c591210c68b47cd`. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Requisitos de hardware

- Memoria de dispositivo: unos 33,94 GB solo para los pesos del modelo de lenguaje, más espacio para caché KV y buffers; el autor recomienda la variante BFP4 en dispositivos con menos memoria.
- Hardware objetivo: NPU Tenstorrent Wormhole y Blackhole, a través de TT-Metal y TT-NN (probado con ttnn 0.81.1 sobre ttsim, el simulador de Blackhole).
- GPU: no se documentan requisitos para GPU; el checkpoint puede cargarse con `transformers` en bf16 (`device_map="auto"`), lo que en la práctica exige del orden de 61 GB de memoria para los pesos en bf16, es decir, varias GPU de 80 GB o una configuración multi-GPU.
- GPU de consumo: no cabe en tarjetas consumer de 24 GB en bf16; no se proporcionan datos sobre variantes GGUF de este repositorio.
- Opciones de despliegue: TT-NN/TT-Metal sobre Tenstorrent; `transformers` con `AutoModelForCausalLM`; el autor indica que tt-transformers y tt-forge no se ejecutaron con este checkpoint.
- Latencia y throughput: no disponibles. El repositorio incluye scripts de verificación (`pack_tensix.py`, `verify_grid.py`) pero no cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Gemma 4 31B BFP8 Tenstorrent) | 32,68 B | no disponible | BFP8 (8,85 bits/peso), 33,94 GB | Apache 2.0 | Hugging Face, formato safetensors para TT-NN |
| google/gemma-4-31B-it-qat-q4_0-unquantized (BF16) | 32,68 B | no disponible | BF16, 61,39 GB | Apache 2.0 | Hugging Face |
| Q4_0 de llama.cpp (mismo checkpoint) | 32,68 B | no disponible | Q4_0 (4,60 bits/peso), 17,651 GB | Apache 2.0 | Generado con llama.cpp v0.9.0 |
| Xylolabs/...-Tensix-BFP4-GateUp | no disponible | no disponible | BFP4 | Apache 2.0 | Hugging Face |

La comparación se limita a variantes del mismo modelo base porque la información disponible no incluye alternativas de otros fabricantes con las que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Solo se cuantizó y evaluó el modelo de lenguaje; el comportamiento de la torre de visión tras el empaquetado no se ha validado en la model card.
- La evaluación publicada es de fidelidad respecto a BF16 (KL y top-1 sobre 8.048 posiciones y 33 prompts cortos), no de calidad en tareas estándar; no hay datos de MMLU, HumanEval, GSM8K ni similares.
- tt-transformers y tt-forge no se ejecutaron con este checkpoint; la verificación se hizo con ttnn 0.81.1 sobre el simulador ttsim, no sobre hardware físico según la información disponible.
- El checkpoint está pensado para Tenstorrent; cargarlo en GPU con `transformers` en bf16 requiere mucha memoria y no aprovecha el empaquetado BFP8.
- No se documentan sesgos conocidos, riesgos de alucinación específicos ni limitaciones de idioma más allá de la calibración en inglés y coreano; deben consultarse en la model card del modelo base de Google.
- La licencia es Apache 2.0 según los metadatos y la model card, pero conviene verificar las condiciones del modelo base de Google antes de uso comercial.
- El repositorio tiene 36 descargas y 0 likes en el momento de la consulta, lo que indica poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized
- Variante BFP4: https://huggingface.co/Xylolabs/gemma-4-31B-it-qat-q4_0-unquantized-Tenstorrent-Tensix-BFP4-GateUp
- Repositorio de código: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentación de Tenstorrent: https://docs.tenstorrent.com
- Paper referenciado en los tags: arXiv:2607.02770 (no verificado en la información disponible)
