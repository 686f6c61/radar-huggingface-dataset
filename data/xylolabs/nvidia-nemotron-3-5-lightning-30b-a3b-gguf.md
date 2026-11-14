# Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por NVIDIA, distribuido originalmente en BF16 y aquí publicado como cuantización GGUF por el usuario Xylolabs. El modelo combina una arquitectura híbrida con capas Mamba-2, capas MoE y capas de atención clásica, lo que lo sitúa en la familia de modelos Nemotron orientados a eficiencia en inferencia manteniendo un tamaño total de aproximadamente 32.900 millones de parámetros con solo unos 3.000 millones activos por token (de ahí el sufijo A3B).

Esta ficha cubre específicamente la conversión GGUF Q4_K_M publicada por Xylolabs, pensada para su uso con llama.cpp y entornos de inferencia local. El archivo conserva los valores cuantizados originales, el tokenizador y los metadatos de chat, y ocupa unos 25,4 GB en disco, lo que lo hace viable en GPUs de gama alta de consumo y en servidores con suficiente VRAM.

La relevancia de esta publicación radica en que permite ejecutar un modelo Nemotron de 30B con activación dispersa en hardware asequible, manteniendo las capacidades conversacionales y de razonamiento del modelo base, con soporte declarado para inglés y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: 52 capas principales (23 Mamba-2, 23 MoE, 6 de atención); incluye módulo MTP adicional |
| Parametros totales | 32.913.266.240 (~32,9 B) |
| Parametros activos | ~3 B (sufijo A3B; no se detalla el desglose exacto en la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (los metadatos originales no se modifican; el ejemplo de uso limita a 2.048 tokens y las evaluaciones usan 8.192) |
| Tipos de cuantizacion | GGUF Q4_K_M mixto (tipos reales: BF16, F32, Q4_K, Q5_0, Q8_0); media de 6,179 bits por peso |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer híbrido de 52 capas que alterna 23 capas Mamba-2 (modelo de espacio de estados), 23 capas MoE y 6 capas de atención tradicional. Cada capa MoE conserva 128 expertos enrutados más un experto compartido. Adicionalmente incluye un módulo MTP (multi-token prediction) cuyos pesos se conservan íntegramente en esta conversión, aunque su uso como drafter requiere una implementación compatible separada.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. La model card de esta conversión remite a la model card original de NVIDIA para la receta de entrenamiento. La conversión a GGUF fue realizada con llama.cpp sin nuevo entrenamiento, calibración ni cuantización adicional: se preservan los valores cuantizados existentes y los metadatos de tokenizador y chat.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y coreano.
- Razonamiento con modo de pensamiento (thinking mode) configurable mediante `enable_thinking` en la plantilla de chat.
- Soporte de plantilla Jinja (`--jinja`) para formateo de chat en llama.cpp.
- Arquitectura MoE con activación dispersa (~3 B activos de ~32,9 B totales) para eficiencia en inferencia.
- Predicción multi-token mediante el módulo MTP incluido (requiere implementación compatible).
- Capacidades de tool calling y agentes: no disponibles explícitamente en la información proporcionada; deben validarse contra el modelo base.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional local: el modelo puede gestionar diálogos multi-turno con plantilla de chat Jinja en llama.cpp, adecuado para despliegues en estación de trabajo con una sola GPU de 24-32 GB.
- Razonamiento con cadena de pensamiento: activando `enable_thinking` se obtienen respuestas razonadas paso a paso, útil para tareas analíticas donde la latencia no es crítica.
- Procesamiento bilingüe inglés-coreano: atención al cliente o traducción asistida en entornos donde se requieran ambos idiomas.
- Prototipado de agentes y pipelines: la arquitectura MoE con ~3 B activos reduce el coste computacional por token, lo que facilita iteraciones rápidas en desarrollo.
- Inferencia en el borde o servidores modestos: el archivo Q4_K_M de 25,4 GB cabe en GPUs consumer de gama alta (por ejemplo, RTX 4090 de 24 GB requiere offloading parcial; A6000 o RTX 5090 de 32 GB permiten carga completa).
- Evaluación comparativa de cuantizaciones: al preservar los valores cuantizados originales y publicar métricas KL frente al BF16, sirve como referencia reproducible para estudiar el impacto de la cuantización en modelos híbridos Mamba-2/MoE.
- Investigación sobre arquitecturas híbridas SSM-transformer: permite experimentar con capas Mamba-2 y MoE en hardware asequible sin necesidad de clústeres multi-GPU.

## Benchmarks y rendimiento

La model card de esta conversión no reporta benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Sí incluye una evaluación de fidelidad de la cuantización frente al BF16 original:

| Metrica | Q4_K_M (esta conversion) | BF16 original |
|---|---|---|
| Aciertos en conjunto de referencia | 32/33 + 6/7 | 31/33 + 7/7 |
| Perdidas contadas | 0 | — |
| Respuestas rotas | 0 | — |
| KL media vs. BF16 | 0,107224 | — |

La KL media se midió sobre cuatro secuencias emparejadas de 2.048 tokens en inglés y coreano, con 8.188 posiciones evaluadas. Las ejecuciones actuales usan contexto de 8.192 tokens. No se reporta velocidad ni throughput.

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~25,42 GB solo para los pesos GGUF, más espacio para caché KV, estado recurrente (capas Mamba-2) y buffers de trabajo.
- GPU recomendadas: A100 40/80 GB, H100, RTX A6000 (48 GB), RTX 5090 (32 GB) para carga completa; RTX 4090 (24 GB) requiere offloading parcial de capas a CPU.
- Cabe en GPU consumer: sí, en modelos de 32 GB o superiores; en 24 GB con offloading.
- Opciones de despliegue: llama.cpp (probado con la versión referenciada en la model card, etiquetada como v0.9.0), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). vLLM y TGI no están confirmados para este formato.
- Latencia y throughput: no reportados en la información disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B (esta conversion GGUF) | ~32,9 B | ~3 B | No disponible | OpenMDW-1.1 | GGUF Q4_K_M |
| Nemotron-3.5-Lightning-30B-A3B BF16 (original) | ~32,9 B | ~3 B | No disponible | OpenMDW-1.1 | Safetensors BF16 |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de la misma categoría (híbridos Mamba-2/MoE de ~30 B) en la documentación proporcionada. Se recomienda consultar la model card original de NVIDIA para referencias cruzadas.

## Limitaciones y advertencias

- Idiomas: solo inglés y coreano declarados; el rendimiento en castellano no está garantizado ni evaluado.
- Contexto: la longitud máxima de contexto no se especifica en esta conversión; los metadatos originales se conservan, pero el ejemplo de uso limita a 2.048 tokens y las evaluaciones a 8.192.
- Módulo MTP: los pesos se conservan pero requieren una implementación compatible separada; no se ha validado su funcionamiento en esta conversión.
- Fidelidad de cuantización: la KL media de 0,107 frente a BF16 indica degradación medible; para tareas sensibles puede ser preferible el BF16 original.
- Sesgos y alucinaciones: no documentados en la información proporcionada; deben evaluarse contra el modelo base y la model card de NVIDIA.
- Licencia OpenMDW-1.1: conviene revisar los términos completos en el archivo `LICENSE` del repositorio antes de uso comercial; la conversión se distribuye "tal cual", sin garantía ni respaldo de NVIDIA.
- Evaluación: las pruebas de la model card cubren textos almacenados y prompts cortos; una integración real necesita su propia evaluación de tarea.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: poca validación comunitaria; considerar reproducibilidad y procedencia.
- No se reportan velocidades de inferencia, lo que impide estimar latencia en producción sin pruebas propias.

## Enlaces

- Repositorio Hugging Face de esta conversión: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF
- Modelo base BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Documentación GGUF + llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio llama.cpp (rama referenciada): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia OpenMDW-1.1: https://huggingface.co/Xylolabs/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GGUF/blob/main/LICENSE
