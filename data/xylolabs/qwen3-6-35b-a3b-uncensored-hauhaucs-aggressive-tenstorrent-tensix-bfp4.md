# Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tenstorrent-Tensix-BFP4

## Resumen

Este repositorio contiene una cuantización BFP4 (block floating point de 4 bits) del modelo Qwen3.6-35B-A3B, un transformer MoE de 34.660.610.688 parámetros totales, en su variante "Uncensored" afinada por HauhauCS con un estilo que el autor denomina "Aggressive". La cuantización la publica Xylolabs y está específicamente empaquetada para las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole) mediante el formato `ttnn.bfloat4_b` y la librería `tt-metal`/`ttnn`. El modelo base original es Qwen/Qwen3.6-35B-A3B.

El problema que resuelve es doble: por un lado, permite ejecutar un modelo de ~35B parámetros en hardware de inferencia no-GPU (aceleradores Tensix) con un peso empaquetado de 20,99 GB para los pesos del modelo de lenguaje, gracias a una cuantización GPTQ a 4,5 bits por peso de media. Por otro, ofrece una variante sin censura (sin *refusal tuning*) para casos de uso donde los rechazos del modelo base resultan limitativos, con la advertencia explícita de que el usuario debe aportar sus propias salvaguardas.

Es relevante ahora por dos motivos: la cuantización está calibrada y validada contra el simulador Blackhole (`ttsim`) con `ttnn 0.81.1`, lo que la convierte en una de las pocas exportaciones públicas listas para el stack de Tenstorrent, y porque el origen de los pesos es un GGUF Q8_K_P de HauhauCS (no existe release BF16 de este fine-tune), de modo que la ficha documenta un pipeline de de-cuantización y re-mapeo de tensores poco habitual.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido con atención (10 capas) y Gated DeltaNet (30 capas); 40 capas de expertos enrutados |
| Parámetros totales | 34.660.610.688 |
| Parámetros activos | no disponible (el nombre A3B sugiere ~3B activos, no confirmado en la información) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso) en capas lineales; bf16 en LM head, embeddings, normas y gate del experto compartido; 4,84 bits por peso de media |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con `quant4.json` y `model.safetensors.index.json`); origen GGUF Q8_K_P |
| Memoria de dispositivo requerida | ~20,99 GB solo para pesos del modelo de lenguaje, más KV cache y buffers |
| Modelo base | HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive (fine-tune) sobre Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con una mezcla poco convencional: 10 capas usan atención clásica (proyecciones q, k, v, o) y 30 capas usan Gated DeltaNet (proyecciones q, k, v, z, a, b y output). Hay 40 capas con expertos enrutados (gate, up, down) más un experto compartido. La cuantización se aplica a todas esas proyecciones lineales en formato `bfloat4_b`, mientras que el gate del experto compartido, el LM head, el embedding y las normas permanecen en bf16.

El proceso de cuantización es GPTQ con búsqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una única Hessiana por capa para gate y up, mientras que el down de cada experto usa su propia Hessiana o *round to nearest* si vio demasiados pocos tokens de calibración. Los pesos cuantizados se almacenan como valores bf16 sobre la rejilla BFP4, de forma que TT-NN los empaqueta sin alterar sus valores. El checkpoint de referencia se obtuvo de-cuantizando el GGUF Q8_K_P de HauhauCS (revisión `f12a584f`, sha256 `d5efc2a1...`) y remapeando a los nombres y layout del modelo base: de los 693 tensores del modelo de lenguaje, 529 coinciden bit a bit con el BF16 del base dentro del almacenamiento propio del GGUF, y los 164 restantes (capas 13 a 39) portan los cambios de bajo rango del fine-tune.

## Capacidades

- Generación de texto y conversación multi-turno en formato chat (pipeline `text-generation`, `conversational`).
- Razonamiento y generación de código heredados del modelo base Qwen3.6-35B-A3B (no verificados en esta exportación).
- Capacidad multimodal declarada en los tags (`image-text-to-text`), pero **esta exportación concreta es solo texto**: el GGUF de origen no incluye torre de visión y debe cargarse con `AutoModelForCausalLM`.
- Sin capa MTP (multi-token prediction) propia; para decodificación especulativa puede usarse la capa MTP del modelo base como drafter, manteniendo los tokens verificados de este modelo.
- Modelo sin censura: según la model card del autor, no rechaza prompts.
- Tool calling / function calling: no disponible en la información.
- Capacidades de agente y multi-step reasoning: no disponible en la información.
- Idiomas: no disponible en la información.

## Casos de uso

- **Inferencia en aceleradores Tenstorrent**: despliegue del modelo empaquetado en NPU Wormhole o Blackhole usando `ttnn`, aprovechando que los pesos ya están en `bfloat4_b` y se cargan sin transformación de valores. Adecuado para entornos que quieren evitar GPUs NVIDIA.
- **Investigación sobre cuantización BFP4**: el repo incluye `quant4.json` con el formato de cada proyección y un script de verificación que comprueba que ningún valor cambia al empaquetar. Útil para estudiar el impacto de GPTQ a 4,5 bits en un MoE grande.
- **Generación de contenido sin restricciones de rechazo**: escenarios creativos o de investigación donde los filtros del modelo base interrumpen la generación, asumiendo que el operador debe añadir sus propias salvaguardas.
- **Prototipado de asistentes conversacionales**: carga directa con `transformers` y `AutoModelForCausalLM` con `device_map="auto"`, útil para validar prompts y plantillas de chat antes de portar a TT-NN.
- **Evaluación de decodificación especulativa**: usar la capa MTP del modelo base Qwen3.6-35B-A3B como drafter y verificar con este modelo, comparando throughput frente a generación autoregresiva estándar.
- **Reproducción del pipeline de de-cuantización GGUF → safetensors**: el repo documenta el mapeo de nombres y la verificación bit a bit contra el BF16 del base, lo que sirve como referencia para convertir otros GGUF a formatos nativos.
- **Fine-tuning posterior sobre base sin censura**: al estar en Apache-2.0 y en safetensors estándar, puede servir de punto de partida para adaptaciones con DPO o SFT sobre dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Memoria de dispositivo**: ~20,99 GB solo para los pesos del modelo de lenguaje, más espacio para KV cache y buffers. Presupuesto total realista por encima de 24-28 GB según longitud de contexto y batch.
- **Hardware objetivo**: NPU Tensix de Tenstorrent, arquitecturas Wormhole y Blackhole. Verificado con `ttnn 0.81.1` sobre `ttsim` (simulador Blackhole).
- **GPU consumer**: no confirmado. El peso empaquetado de ~21 GB no cabe en GPUs de 8-16 GB; en una RTX 4090 (24 GB) quedaría muy justo para pesos más KV cache. No hay datos de ejecución en GPU publicados en la información.
- **GPU de datacenter**: A100 40/80 GB y H100 son candidatas por capacidad, pero la cuantización está pensada para Tensix, no para CUDA; no se documenta soporte en GPU.
- **Opciones de despliegue**: `transformers` (`AutoModelForCausalLM`, `dtype="bfloat16"`, `device_map="auto"`) para carga de referencia; `ttnn`/`tt-metal` para ejecución en Tensix. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tenstorrent-Tensix-BFP4 | 34,66B | no disponible | BFP4 (4,5 bits/peso) | Apache-2.0 | Tensix (Wormhole, Blackhole) |
| HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive | no disponible | no disponible | GGUF (Q8_K_P y otras) | no disponible en la información | CPU/GPU vía llama.cpp |
| Qwen/Qwen3.6-35B-A3B | no disponible | no disponible | BF16 original | no disponible en la información | GPU |

La comparación con alternativas de la misma categoría (MoE ~35B en BFP4 para aceleradores no-GPU) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- **Modelo sin censura**: el fine-tune de HauhauCS elimina los rechazos del base y no tiene *refusal tuning*. En producción exige salvaguardas propias (filtros de entrada/salida, moderación, políticas de uso).
- **Solo texto**: aunque los tags incluyan `image-text-to-text`, esta exportación no tiene torre de visión; cargarla como multimodal fallará.
- **Sin capa MTP**: no puede hacer decodificación especulativa consigo mismo; requiere el drafter del modelo base.
- **Licencia Apache-2.0**: permite uso comercial, pero el modelo base y el fine-tune pueden arrastrar condiciones adicionales no documentadas aquí; conviene revisar las licencias de Qwen y HauhauCS antes de desplegar.
- **Riesgo de alucinación**: no cuantificado en la información; los modelos sin censura suelen presentar menor adherencia a hechos cuando se les fuerza fuera de distribución.
- **Sesgos**: no documentados en la información; el calibrado incluye Wikipedia en coreano y WikiText-2, lo que puede sesgar el comportamiento hacia esos dominios.
- **Cuantización agresiva**: 4,5 bits por peso en todas las proyecciones lineales puede degradar tareas sensibles (matemáticas, código de precisión); no hay benchmarks que lo cuantifiquen.
- **Madurez del stack**: validado solo en simulador (`ttsim`), no en silicio real según la información; el soporte de `ttnn` para este formato puede cambiar entre versiones.
- **Contexto e idiomas desconocidos**: no se puede planificar capacidad multi-turno larga ni cobertura lingüística sin datos del modelo base.
- **Descargas muy bajas (29) y 0 likes**: ecosistema prácticamente sin validación comunitaria; tratar como experimental.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tenstorrent-Tensix-BFP4
- Modelo base (fine-tune): https://huggingface.co/HauhauCS/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive
- Modelo original: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de código de cuantización: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-Uncensored-HauhauCS-Aggressive-Tenstorrent-Tensix-BFP4/blob/main/LICENSE
