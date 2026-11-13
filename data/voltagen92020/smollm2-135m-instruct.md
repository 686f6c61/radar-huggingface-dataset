# VoltAgen92020/SmolLM2-135M-Instruct

## Resumen

SmolLM2-135M-Instruct es la variante instruida del modelo compacto SmolLM2-135M desarrollado por Hugging Face (repositorio original HuggingFaceTB), republicado en el espacio de nombres del usuario VoltAgen92020. Se trata de un transformer decoder de 134.515.008 parámetros (aproximadamente 135M) entrenado sobre 2 billones de tokens y ajustado mediante SFT y DPO para seguir instrucciones en inglés. Su relevancia radica en que ofrece capacidades conversacionales basicas en un tamano que cabe en CPU, navegador y dispositivos de borde.

El modelo forma parte de la familia SmolLM2 (135M, 360M y 1,7B) descrita en el paper arXiv:2502.02737. Esta pensado para tareas ligeras de generacion de texto, reescritura y resumen, con un enfoque de despliegue on-device. La version republicada mantiene la licencia Apache 2.0 y anade artefactos ONNX y soporte para transformers.js, lo que facilita su uso en entornos JavaScript.

Esta ficha se refiere a la copia alojada en VoltAgen92020/SmolLM2-135M-Instruct, que no presenta descargas ni likes y cuyo contenido coincide con la model card del modelo original de Hugging Face. No se han documentado modificaciones adicionales por parte del republicador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder |
| Parametros totales | 134.515.008 (aprox. 135M) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (la variante base se evalua como SmolLM2-135M-8k, lo que sugiere 8k, pero no se confirma para esta copia) |
| Tipos de cuantizacion | no disponible de forma explicita; el repo incluye safetensors y ONNX |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

SmolLM2-135M-Instruct es un transformer decoder denso con 135M de parametros, preentrenado en bfloat16 sobre 2 billones de tokens con una mezcla de FineWeb-Edu, DCLM, The Stack y datasets filtrados propios. El entrenamiento se realizo con el framework nanotron sobre 64 GPU H100. Sobre el modelo base se aplico un ajuste supervisado (SFT) con datasets publicos y propios, seguido de Direct Preference Optimization (DPO) usando UltraFeedback. El dataset SFT (smol-smoltalk) y el codigo de ajuste (alignment-handbook) estan publicados por Hugging Face.

La model card menciona que la version instruida soporta tareas como reescritura de texto, resumen y function calling, aunque el soporte de function calling se atribuye explicitamente al modelo de 1,7B. No se documentan innovaciones arquitectonicas adicionales como atencion lineal o decodificacion especulativa para esta variante.

## Capacidades

- Generacion de texto conversacional en ingles con plantilla de chat (`apply_chat_template`).
- Seguimiento de instrucciones basicas, con mejoras notables frente a SmolLM-135M-Instruct en IFEval (29,9 frente a 17,2) y MT-Bench (19,8 frente a 16,8).
- Reescritura de texto y resumen, segun la model card.
- Razonamiento y conocimiento limitados, coherentes con su tamano (MMLU cloze 29,3; BBH 3-shot 28,2).
- Soporte de tool calling / function calling: la model card lo menciona de forma general, pero lo circunscribe al modelo de 1,7B; para esta variante no se confirma.
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma fiable a este tamano.
- Multilingue: limitado practicamente al ingles.
- Integracion con transformers, TRL CLI, transformers.js y ONNX para ejecucion en navegador o entornos ligeros.

## Casos de uso

- Asistente conversacional en dispositivos de borde: el modelo cabe en CPU y en navegador mediante transformers.js u ONNX, por lo que puede gestionar dialogos sencillos en aplicaciones moviles o extensiones web sin conexion a servidores.
- Autocompletado y generacion de texto en formularios: util para sugerir respuestas breves o reescribir campos de texto en ingles dentro de interfaces ligeras, gracias a su baja huella de memoria.
- Resumen de textos cortos: puede condensar parrafos o notas en ingles en pipelines de procesamiento por lotes, donde el coste por token es minimo.
- Prototipado rapido de pipelines de IA generativa: sirve como modelo de referencia para validar plantillas de chat, tokenizacion y flujos de inferencia antes de escalar a modelos mayores de la familia SmolLM2.
- Educacion y demos interactivas: su tamano permite ejecutarlo en portatiles y entornos docentes para ilustrar el funcionamiento de un LLM instruido sin infraestructura GPU.
- Filtrado o clasificacion textual ligera: puede generar etiquetas o reformulaciones controladas en tareas de preprocesamiento donde no se requiere alta precision factual.
- Pruebas de integracion en CI/CD: al ser ligero y compatible con transformers y ONNX, puede incorporarse en tests automatizados que verifiquen contratos de inferencia y plantillas de prompt.

## Benchmarks y rendimiento

Resultados publicados en la model card para el modelo instruido (zero-shot salvo indicacion):

| Metrica | SmolLM2-135M-Instruct | SmolLM-135M-Instruct |
|---|---|---|
| IFEval (media prompt/inst) | 29,9 | 17,2 |
| MT-Bench | 19,8 | 16,8 |
| HellaSwag | 40,9 | 38,9 |
| ARC (media) | 37,3 | 33,9 |
| PIQA | 66,3 | 64,0 |
| MMLU (cloze) | 29,3 | 28,3 |
| BBH (3-shot) | 28,2 | 25,2 |
| GSM8K (5-shot) | 1,4 | 1,4 |

Resultados del modelo base preentrenado (SmolLM2-135M-8k frente a SmolLM-135M):

| Metrica | SmolLM2-135M-8k | SmolLM-135M |
|---|---|---|
| HellaSwag | 42,1 | 41,2 |
| ARC (media) | 43,9 | 42,4 |
| PIQA | 68,4 | 68,4 |
| MMLU (cloze) | 31,5 | 30,2 |
| CommonsenseQA | 33,9 | 32,7 |
| TriviaQA | 4,1 | 4,3 |
| Winogrande | 51,3 | 51,3 |
| OpenBookQA | 34,6 | 34,0 |
| GSM8K (5-shot) | 1,4 | 1,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 0,27 GB solo para pesos (135M x 2 bytes), mas overhead de activaciones y cache KV; en la practica, menos de 1 GB. En cuantizacion de 8 bits, alrededor de 0,14 GB; en 4 bits, alrededor de 0,07 GB (estimaciones teoricas a partir del numero de parametros, no publicadas por el autor).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo esta pensado para CPU y entornos de borde. Funciona en A100, H100, RTX 4090 y GPUs de gama baja sin problema.
- Cabe en GPU de consumo: si, en cualquier GPU consumer e incluso en CPU. Es apto para ejecucion en navegador mediante transformers.js/ONNX.
- Opciones de despliegue: transformers (PyTorch), TRL CLI (`trl chat`), transformers.js, ONNX Runtime y text-generation-inference (segun los tags del repo). No se confirma soporte nativo de llama.cpp, Ollama o vLLM en la informacion proporcionada.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SmolLM2-135M-Instruct (esta copia) | 135M | no confirmado (base evaluada como 8k) | Apache 2.0 | Hugging Face, ONNX, transformers.js | IFEval 29,9; MT-Bench 19,8 |
| SmolLM-135M-Instruct | 135M | no disponible | Apache 2.0 | Hugging Face | Generacion anterior; IFEval 17,2; MT-Bench 16,8 |
| SmolLM2-360M-Instruct | 360M | no disponible | Apache 2.0 | Hugging Face | Misma familia, mayor capacidad; sin datos de benchmarks en la informacion proporcionada |
| SmolLM2-1.7B-Instruct | 1,7B | no disponible | Apache 2.0 | Hugging Face | Mayor tamano y soporte explicito de function calling; sin datos de benchmarks en la informacion proporcionada |

## Limitaciones y advertencias

- El modelo comprende y genera principalmente en ingles; su uso en castellano u otros idiomas no esta soportado de forma fiable.
- Riesgo elevado de alucinacion y de inconsistencias logicas: con 135M de parametros y MMLU cloze de 29,3, no es adecuado como fuente de informacion factual.
- Puede reproducir sesgos presentes en los datos de entrenamiento (FineWeb-Edu, DCLM, The Stack, UltraFeedback).
- GSM8K de 1,4 indica capacidad matematica practicamente nula; no debe emplearse para calculo o razonamiento numerico.
- El soporte de function calling no esta confirmado para esta variante; la model card lo atribuye al modelo de 1,7B.
- Licencia Apache 2.0: permite uso comercial, pero el republicador no anade garantias ni documentacion adicional; conviene verificar la integridad de los pesos frente al repositorio original de Hugging Face.
- La copia tiene 0 descargas y 0 likes, y fue creada y actualizada en la misma fecha; no hay evidencia de mantenimiento o validacion independiente.
- La longitud de contexto no se confirma para esta copia; la evaluacion del modelo base se etiqueta como 8k, pero no debe asumirse sin verificacion.

## Enlaces

- Modelo en Hugging Face (esta copia): https://huggingface.co/VoltAgen92020/SmolLM2-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Paper SmolLM2: https://arxiv.org/abs/2502.02737
- Dataset SFT smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset UltraFeedback: https://huggingface.co/datasets/HuggingFaceH4/ultrafeedback_binarized
- Dataset Synth-APIGen-v0.1 (Argilla): https://huggingface.co/datasets/argilla/Synth-APIGen-v0.1
- Codigo de ajuste (alignment-handbook): https://github.com/huggingface/alignment-handbook/tree/main/recipes/smollm2
- Framework de entrenamiento nanotron: https://github.com/huggingface/nanotron/tree/main
- Herramienta de evaluacion lighteval: https://github.com/huggingface/lighteval
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
