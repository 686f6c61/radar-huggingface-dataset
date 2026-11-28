# warped-community/Ternary-Bonsai-8B-litert-lm

## Resumen

Ternary-Bonsai-8B-litert-lm es un paquete de pesos cuantizados en formato `.litertlm` derivado de `prism-ml/Ternary-Bonsai-8B-unpacked`, un modelo de la familia Qwen3-8B cuyos pesos han sido ternarizados (valores -1, 0 y +1 con una escala por canal). Lo publica la comunidad warped-community empaquetado específicamente para el runtime LiteRT-LM de Google AI Edge, lo que permite ejecutarlo en dispositivos Android (GPU o CPU) y en escritorio mediante el paquete Python `litert-lm`.

El objetivo del paquete es claro: ofrecer la calidad de un modelo de 8B en un espacio de descarga de 2,56 GB, aproximadamente la mitad que un Qwen3-8B en GGUF Q4_K_M (5,03 GB) y apenas un poco más que un Qwen3-4B en Q4_K_M (2,50 GB). Esto lo hace viable en móviles modernos con memoria libre suficiente, sin depender de la nube.

Es relevante ahora porque demuestra una ruta práctica de despliegue on-device con cuantización extrema (INT2) sobre aceleración GPU vía LiteRT, algo poco habitual fuera del ecosistema de Google. No aporta entrenamiento nuevo: es una conversión de pesos existentes, con licencia Apache-2.0 heredada de Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-8B), pesos ternarios INT2 |
| Parametros totales | 8B (clase Qwen3-8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 en el bundle por defecto; 32768 en builds experimentales; `max_position_embeddings` del modelo base: 65536 |
| Tipos de cuantizacion | INT2 per-channel (por defecto); INT2 all en build experimental con SDPA |
| Idiomas soportados | no disponible (el modelo base Qwen3-8B es multilingüe, pero la model card no lo detalla) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de la familia Qwen3-8B, con pesos ternarizados: cada peso toma uno de tres valores (-1, 0, +1) acompañado de una escala, lo que reduce el tamaño del checkpoint a 2,56 GB. Los bundles incluyen activaciones en fp16 y cuantización INT2 por canal en los pesos. El paquete no introduce cambios arquitectónicos propios más allá del formato de empaquetado LiteRT-LM y de la plantilla de chat embebida (Qwen3 ChatML con bloque de razonamiento intacto).

No hubo entrenamiento, fine-tuning ni calibración en esta conversión: se trata de una poscuantización y reempaquetado del checkpoint Bonsai ya publicado. La model card indica explícitamente que no se usaron datos de entrenamiento y que los pesos no se reentrenaron. La conversión la realiza la herramienta Bonsai de Prism ML. Los builds experimentales añaden atención fusionada (SDPA) y contexto extendido a 32k, aunque la propia card advierte que su carga depende de la versión de LiteRT/LiteRT-LM del host.

## Capacidades

- Generación de texto conversacional con plantilla de chat Qwen3 ChatML, incluyendo bloque de razonamiento.
- Razonamiento y resolución de prompts largos o difíciles (el 8B se recomienda sobre el 1.7B precisamente para calidad de respuesta y razonamiento).
- Ejecución on-device en Android vía Google AI Edge Gallery o cualquier host LiteRT-LM.
- Inferencia en backend GPU (recomendado) y CPU; el backend NPU no está soportado por estos bundles.
- Capacidades multilingües heredadas de Qwen3-8B (no detalladas en la model card).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; el bloque de razonamiento de la plantilla sugiere capacidad de cadena de pensamiento, pero no se documenta soporte de agentes.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Asistente conversacional en móvil: integrado en Google AI Edge Gallery o en una app Android propia, el modelo gestiona conversaciones multi-turno con 4k de contexto por defecto, suficiente para diálogos típicos y con la ventaja de no requerir red.
- Razonamiento y respuesta a preguntas en local: para consultas que requieren más profundidad que un modelo de 1.7B, el 8B ternario ofrece mayor calidad en el mismo orden de magnitud de memoria (2,56 GB), adecuado en dispositivos con RAM libre suficiente.
- Procesamiento de documentos cortos en el dispositivo: con el build experimental de 32k se pueden procesar contratos, correos largos o artículos completos sin enviar datos a la nube, útil en escenarios de privacidad.
- Prototipado de apps Android con IA embebida: usar el paquete como base para validar latencia y calidad en un Pixel 11 Pro XL (81 tok/s de prefill en GPU) antes de decidir si se necesita un modelo mayor o en la nube.
- Inferencia en escritorio sin GPU dedicada: mediante el paquete Python `litert-lm` y el backend CPU, se puede ejecutar en equipos x86 para pruebas de integración o demos ligeras.
- Distribución de funcionalidades de chat en apps con descarga bajo demanda: el tamaño de 2,56 GB permite ofrecer el modelo como descarga opcional dentro de la app, con la primera carga en GPU de ~4 minutos (compilación de programas) y cargas posteriores de 15–20 s gracias a la caché de Edge Gallery.
- Evaluación de cuantización ternaria: útil para investigadores que quieran medir la degradación de calidad de INT2 frente a Q4_K_M en tareas concretas, usando el mismo runtime y hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo aporta métricas de rendimiento de inferencia:

| Backend | Prefill | Decode | Time to first token |
|---|---|---|---|
| GPU (Pixel 11 Pro XL, Tensor G6) | 81 tok/s | 5,8 tok/s | 3,3 s |
| CPU (Pixel 11 Pro XL) | 33 tok/s | 2,3 tok/s | 8,2 s |

Medición con 256 tokens de prefill y 256 de decode, 3 ejecuciones, mediana, sobre `bonsai-8b-int2pc-4k-fp16.litertlm` en Google AI Edge Gallery 1.0.23.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo por defecto ocupa 2,56 GB en disco; se necesita memoria libre equivalente o algo superior para cargarlo en GPU o CPU. El build experimental INT2 all con SDPA ocupa 2,16 GB.
- GPU recomendadas: no se especifican modelos de escritorio; en móvil se ha verificado en Pixel 11 Pro XL (Tensor G6) con backend GPU. El backend GPU de LiteRT es el recomendado por rendimiento.
- ¿Cabe en consumer GPU? No hay datos publicados sobre GPUs de escritorio NVIDIA/AMD; el runtime objetivo es LiteRT-LM (Android y Python en escritorio x86 con CPU verificado). No se documenta soporte CUDA.
- Opciones de despliegue: LiteRT-LM (host `litert_lm_main`, paquete Python `litert-lm`), Google AI Edge Gallery, y las apps de ejemplo de `google-ai-edge/litert-samples`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. La primera carga en GPU tarda ~4 minutos por compilación de programas; las siguientes, 15–20 s con caché. La primera carga en CPU tarda ~6 s.
- Backend NPU: no soportado por estos bundles.

## Comparativa con modelos similares

| Modelo | Formato | Tamano de descarga | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Ternary-Bonsai-8B (este repo) | INT2 `.litertlm` | 2,56 GB | 4k (32k experimental) | Apache-2.0 | On-device GPU/CPU vía LiteRT-LM |
| Qwen3-8B | Q4_K_M GGUF | 5,03 GB | hasta 65k segun config | Apache-2.0 | Referencia de calidad del modelo base |
| Qwen3-4B | Q4_K_M GGUF | 2,50 GB | no disponible | Apache-2.0 | Alternativa de menor tamano y calidad |
| Ternary-Bonsai-1.7B | INT2 `.litertlm` | 0,77 GB | no disponible | Apache-2.0 | Version pequena para moviles de baja RAM |

No se dispone de comparativas de calidad (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria INT2 puede degradar la calidad frente al modelo Qwen3-8B original; no se publican métricas que cuantifiquen esa pérdida.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documenta mitigación específica.
- El contexto por defecto es de solo 4096 tokens; los builds de 32k son experimentales y pueden no cargar según la versión de LiteRT/LiteRT-LM del host.
- El backend NPU no está soportado; solo GPU y CPU.
- La primera carga en GPU tarda varios minutos por compilación de programas; sin caché, la experiencia inicial es lenta.
- La plantilla de chat se corrigió el 2026-11-07 para LiteRT-LM 0.18.0+; versiones anteriores del runtime siguen funcionando, pero conviene verificar la versión del host.
- Idiomas soportados no documentados en la model card; la cobertura multilingüe depende del modelo base Qwen3-8B.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-8B (Copyright 2024 Alibaba Cloud, Apache-2.0); conviene revisar la licencia upstream.
- No se ha realizado entrenamiento ni calibración en esta conversión; los pesos son byte a byte los del checkpoint Bonsai, solo cambia el empaquetado y los metadatos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/warped-community/Ternary-Bonsai-8B-litert-lm
- Modelo base: https://huggingface.co/prism-ml/Ternary-Bonsai-8B-unpacked
- Modelo Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Licencia Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B/blob/main/LICENSE
- Version 1.7B: https://huggingface.co/litert-community/Ternary-Bonsai-1.7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Ejemplos LiteRT: https://github.com/google-ai-edge/litert-samples
