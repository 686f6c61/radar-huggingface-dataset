# zadaniamm/qwen-2.5-7b-mai-friend-lora

## Resumen

qwen-2.5-7b-mai-friend-lora es un adaptador LoRA (no un modelo completo) publicado por el usuario zadaniamm sobre el modelo base Qwen/Qwen2.5-7B-Instruct. Se ha entrenado mediante QLoRA, es decir, fine-tuning supervisado (SFT) con cuantizacion de 4 bits y adaptadores de bajo rango sobre un transformer decoder-only de aproximadamente 7.000 millones de parametros. Su objetivo declarado es mejorar la calidez, la naturalidad y la capacidad de respuesta conversacional del asistente en idioma indonesio.

El adaptador se ha entrenado con un dataset sintetico generado con ayuda de Google Gemini, centrado en dialogos naturales en indonesio, y el entrenamiento se ejecuto en un notebook de Kaggle con dos GPU Nvidia T4. El repositorio ocupa aproximadamente 0,1 GB, coherente con un conjunto de pesos LoRA y no con un modelo completo. La licencia es MIT, lo que facilita su reutilizacion, incluido el uso comercial.

Su relevancia es la de un ejemplo tipico de personalizacion ligera y de bajo coste: permite adaptar un modelo instructivo multilingue ya existente a un registro conversacional concreto y a un idioma especifico sin necesidad de reentrenar la totalidad del modelo. El autor publica ademas variantes derivadas (pesos fusionados en bf16 y cuantizaciones GGUF) para quien quiera usarlo sin aplicar el adaptador manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen2.5-7B-Instruct); adaptador LoRA insertado sobre capas lineales |
| Parametros totales | ~7.000 millones en el modelo base (adaptador LoRA aparte, rango y numero de parametros entrenables no disponibles) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | heredada del modelo base Qwen2.5-7B-Instruct: 32.768 tokens nativos, ampliable a 131.072 con YaRN (valor no confirmado de forma explicita en la informacion del repositorio) |
| Tipos de cuantizacion | adaptador en precision completa (safetensors); variantes GGUF publicadas por el autor: Q4_K_M e IQ4_NL |
| Idiomas soportados | entrenamiento declarado en indonesio (id); el modelo base Qwen2.5-7B-Instruct soporta multiples idiomas |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador PEFT); existen variantes fusionadas bf16 y GGUF publicadas aparte |

## Arquitectura y entrenamiento

El adaptador se apoya en la arquitectura del modelo base Qwen2.5-7B-Instruct, un transformer decoder-only con atencion por consulta agrupada (GQA) y aproximadamente 7.000 millones de parametros. Sobre esa base se aplica una adaptacion de bajo rango (LoRA), entrenada con el metodo QLoRA: el modelo base se congela en cuantizacion de 4 bits y unicamente se optimizan las matrices de bajo rango anadidas, lo que reduce drasticamente el consumo de memoria frente a un ajuste completo. No se especifican en la informacion disponible el rango de LoRA, el factor alpha, la tasa de aprendizaje ni el numero de pasos de entrenamiento.

El entrenamiento es un SFT (supervised fine-tuning) con un dataset sintetico generado con ayuda de Google Gemini, orientado a conversaciones naturales en indonesio. La infraestructura empleada fue un notebook de Kaggle con dos GPU Nvidia T4. No se documentan tecnicas como RLHF, DPO, decodificacion especulativa ni variantes de atencion lineal; tampoco se detalla la composicion ni el volumen del dataset sintetico, ni si hubo una fase de evaluacion posterior al ajuste.

## Capacidades

- Generacion de texto conversacional en indonesio, con enfasis declarado en respuestas calidas y amables.
- Dialogo multi-turno heredado de la naturaleza instructiva del modelo base Qwen2.5-7B-Instruct.
- Capacidades generales del modelo base en razonamiento, codigo y matematicas, aunque el adaptador no las refuerza de forma especifica.
- Capacidad multilingue heredada del modelo base, si bien el ajuste se ha centrado en indonesio.
- Soporte de tool calling y function calling: probable por herencia del modelo base, pero no confirmado para este adaptador en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion del repositorio.
- Capacidades de vision o audio: no disponibles (el modelo base es exclusivamente de texto).

## Casos de uso

- Asistente conversacional en indonesio: el adaptador esta disenado especificamente para mantener dialogos naturales y cercanos en este idioma, por lo que encaja en productos de chat orientados al publico indonesio.
- Atencion al cliente automatizada en indonesio: puede gestionar conversaciones multi-turno apoyandose en la ventana de contexto del modelo base (32.768 tokens nativos) para conservar el historial de la sesion.
- Aplicaciones de acompanamiento o compania conversacional: el ajuste prioriza un tono amable, adecuado para bots de bienestar o de acompanamiento, siempre con las advertencias eticas correspondientes.
- Base para nuevas iteraciones de fine-tuning: al ser un adaptador LoRA ligero y con licencia MIT, sirve como punto de partida para otros ajustes especificos de dominio sin reentrenar el modelo completo.
- Prototipado rapido en local: gracias a las variantes GGUF (Q4_K_M e IQ4_NL), puede desplegarse en equipos de gama de consumo para pruebas y demos.
- Investigacion sobre personalizacion eficiente: es un ejemplo reproducible de QLoRA sobre un modelo instructivo multilingue para estudiar el efecto del ajuste sintetico en el estilo conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Inferencia con el adaptador sin fusionar: requiere cargar el modelo base Qwen2.5-7B-Instruct junto con el adaptador mediante PEFT, con un consumo aproximado de 15-16 GB en bf16/fp16.
- Fusionado en bf16: aproximadamente 15 GB de VRAM para los pesos, mas la memoria de la cache KV, lo que en la practica exige unos 16-18 GB.
- Cuantizacion GGUF Q4_K_M: alrededor de 4,7 GB, apta para GPU de gama de consumo.
- Cuantizacion GGUF IQ4_NL: alrededor de 4,5 GB, tambien orientada a equipos de gama de consumo.
- GPU recomendadas: A100 40 GB o H100 para despliegue en bf16 a escala; RTX 4090 (24 GB) para bf16 en una sola tarjeta; RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantizacion de 4 bits.
- Cabe en GPU de consumo: si, con cuantizacion de 4 bits (Q4_K_M o IQ4_NL) en tarjetas de 8-12 GB o superiores.
- Opciones de despliegue: transformers + PEFT para el adaptador, vLLM y TGI para servicio en bf16, llama.cpp y Ollama para las variantes GGUF.
- Latencia y throughput estimados: no disponibles.
- Entrenamiento del adaptador: el autor lo realizo con dos Nvidia T4, lo que confirma que el proceso de QLoRA cabe en hardware de gama media.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zadaniamm/qwen-2.5-7b-mai-friend-lora | ~7B (adaptador LoRA) | 32.768 tokens (base) | Adaptador LoRA conversacional en indonesio | MIT | HuggingFace (repositorio propio) |
| Qwen/Qwen2.5-7B-Instruct | ~7B | 32.768 tokens (131.072 con YaRN) | Modelo instructivo completo | Apache 2.0 (segun el modelo base) | HuggingFace |
| cgxjdzz/Qwen-2.5-7B-Instruct-novel-lora | ~7B (adaptador LoRA) | 32.768 tokens (base) | Adaptador LoRA orientado a novelas | no disponible | HuggingFace |
| zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16 | ~7B | 32.768 tokens (base) | Adaptador fusionado en bf16 | MIT | HuggingFace |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: necesita el modelo base Qwen/Qwen2.5-7B-Instruct para funcionar; no puede ejecutarse por si solo.
- Esta especializado en indonesio; su comportamiento en castellano u otros idiomas depende enteramente del modelo base y no esta validado tras el ajuste.
- Dataset de entrenamiento sintetico y de composicion no documentada: puede introducir sesgos, estilos artificiales o lagunas propias de los datos generados con Google Gemini.
- Riesgo de alucinacion: es el comportamiento habitual de los modelos de este tamano y no se ha evaluado ni mitigado de forma especifica en este adaptador.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni de su comportamiento en tareas estandar.
- Advertencia sobre datos sensibles y cumplimiento: al tratarse de un asistente conversacional orientado a un tono cercano, conviene revisar politicas de contenido y privacidad si se despliega en produccion.
- Licencia MIT: permite uso comercial, pero no exime de cumplir las condiciones del modelo base sobre el que se apoya.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y fechas de creacion y actualizacion de 2026-10-01: se trata de una publicacion sin adopcion documentada ni validacion por parte de la comunidad.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-lora
- Version fusionada en bf16: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-merged-bf16
- Version GGUF Q4_K_M: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-Q4_K_M-GGUF
- Version GGUF IQ4_NL: https://huggingface.co/zadaniamm/qwen-2.5-7b-mai-friend-IQ4_NL-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Adaptador LoRA comparable (novelas): https://huggingface.co/cgxjdzz/Qwen-2.5-7B-Instruct-novel-lora
- Guia de fine-tuning QLoRA de Qwen2.5-7B: https://github.com/RkanGen/finetune_qwen_using_qlora
- Guia de despliegue y ajuste de Qwen2.5 (Alibaba Cloud PAI): https://www.alibabacloud.com/help/en/pai/use-cases/deploy-fine-tune-and-evaluate-a-qwen2-5-model
- Endpoint de inferencia Qwen2.5-7B (FriendliAI): https://friendli.ai/models/ArchiveStudio/Qwen2.5-7B
