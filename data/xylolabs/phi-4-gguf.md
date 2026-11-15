# Xylolabs/phi-4-GGUF

## Resumen

Phi-4 GGUF es una redistribución en formato GGUF del modelo Phi-4 de Microsoft, preparada por Xylolabs con llama.cpp. El modelo base es un transformer decoder de 14.659.507.200 parámetros (aproximadamente 14,7 mil millones) entrenado por Microsoft, orientado a generación de texto, razonamiento y matemáticas. Esta versión no introduce entrenamiento ni cuantización nueva: reempaqueta los pesos originales en cuatro variantes GGUF (Q4_K_M, IQ4_XS, IQ4_XS-imat y Q5_K_M) para su uso con llama.cpp y otros motores compatibles.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar Phi-4 en hardware de consumo o en despliegues locales mediante cuantización de 4 y 5 bits, con métricas de fidelidad respecto a BF16 publicadas por el autor del reempaquetado. El repositorio ocupa 36 GB e incluye los 243 tensores del decoder de 40 capas en formato Phi3 fusionado, además del tokenizer y la plantilla de chat original.

El modelo declara soporte para inglés y coreano, licencia MIT y está pensado para generación de texto conversacional. No se han publicado en la información disponible datos sobre longitud de contexto original, composición del dataset de entrenamiento ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K); solo se documentan métricas internas de fidelidad de cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder, formato Phi3 fusionado, 40 capas |
| Parametros totales | 14.659.507.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la metadata original se conserva sin cambios; el ejemplo de CLI usa 2.048 tokens y las comprobaciones GPU usan 8.192) |
| Tipos de cuantizacion | Q4_K_M, IQ4_XS, IQ4_XS-imat, Q5_K_M |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base Phi-4 de Microsoft es un transformer decoder de 40 capas con 14,7 mil millones de parámetros, exportado aquí en el formato Phi3 fusionado de llama.cpp. Cada archivo GGUF contiene los 243 tensores del decoder, la matriz de embedding, la cabeza de salida, el tokenizer y la plantilla de chat original. No se realizó entrenamiento, calibración ni cuantización nueva para esta publicación: se conservan los resultados de calibración existentes y las etiquetas de metadata relativas originales.

Las cuatro variantes emplean tipos de tensor mixtos. Q4_K_M combina 81 tensores F32, 121 Q4_K y 41 Q6_K, con 4,942 bits por peso de media. IQ4_XS usa 81 F32, 116 IQ4_XS, 45 Q5_K y 1 Q6_K (4,505 bits/peso). IQ4_XS-imat usa 81 F32, 121 IQ4_XS, 40 Q5_K y 1 Q6_K (4,466 bits/peso). Q5_K_M usa 81 F32, 121 Q5_K y 41 Q6_K (5,728 bits/peso). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento de un solo turno y respuesta a preguntas factuales (el ejemplo de CLI resuelve "capital de Francia").
- Razonamiento matemático y lógico según las capacidades heredadas del modelo base Phi-4 de Microsoft.
- Plantilla de chat original incluida, compatible con `--jinja` en llama.cpp.
- Ejecución local mediante llama.cpp y motores compatibles con GGUF.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Asistente conversacional local: el modelo puede ejecutarse en una estación de trabajo con llama.cpp usando Q4_K_M (9,059 GB de pesos) para responder consultas de un solo turno, adecuado para prototipos y demos sin dependencia de la nube.
- Generación de texto en inglés y coreano: útil para pipelines de traducción o redacción bilingüe, dado que el modelo declara ambos idiomas y las pruebas del autor incluyen tareas como `en-translate-ko`.
- Razonamiento factual y matemático de un solo turno: el ejemplo verificado con `--temp 0` responde preguntas cerradas de forma determinista, apropiado para tareas de extracción o QA simple.
- Despliegue en hardware de consumo: la variante IQ4_XS (8,259 GB) permite ejecutar el modelo en GPUs con 12-16 GB de VRAM, algo inviable con los pesos BF16 originales.
- Evaluación de cuantizaciones: las métricas de KL y acuerdo top-1 respecto a BF16 publicadas por el autor permiten comparar el impacto de cada nivel de cuantización antes de adoptarlo en producción.
- Integración en herramientas de desarrollo: al ser GGUF y compatible con llama.cpp, puede incorporarse en editores, CLI o scripts de automatización que ya usen el ecosistema llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor solo documenta métricas internas de fidelidad de cuantización respecto a BF16:

| Variante | KL media | Acuerdo top-1 con BF16 | KL / Q4 | Respuestas correctas | Pérdidas contadas |
|---|---:|---:|---:|---:|---:|
| Q4_K_M | 0,017991 | 93,65% | 1,000× | 29/33 | 0 |
| IQ4_XS | 0,020568 | 92,62% | 1,143× | 28/33 | 0 |
| IQ4_XS-imat | 0,019728 | 93,03% | 1,097× | 27/33 | 0 |
| Q5_K_M | 0,005521 | 95,96% | 0,307× | 30/33 | 0 |

Las comprobaciones cubren 16 secuencias emparejadas de 1.024 tokens en inglés y coreano (16.280 posiciones), 33+7 prompts y presupuesto de generación. Las siete comprobaciones de formato thinking puntúan 0/7 en BF16 y en todas las variantes, por lo que se consideran no aplicables. No se reporta velocidad ni throughput.

## Requisitos de hardware

- VRAM estimada solo para pesos: 8,187 GB (IQ4_XS-imat), 8,259 GB (IQ4_XS), 9,059 GB (Q4_K_M), 10,500 GB (Q5_K_M). Hay que añadir espacio para KV cache y buffers.
- El autor indica que la exportación necesita aproximadamente 10,50 GB de memoria de dispositivo para la variante más grande, más KV cache y buffers.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, Q4_K_M e IQ4_XS caben en GPUs de consumo con 12-16 GB de VRAM; Q5_K_M requiere al menos 16 GB para pesos y overhead.
- Despliegue: llama.cpp (comando verificado con la versión v0.9.0). No se documentan otras opciones como vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo base en la información proporcionada, por lo que la comparación se limita a parámetros y disponibilidad.

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Phi-4 GGUF (Xylolabs) | 14,66 B | no disponible | MIT | GGUF | Cuatro cuantizaciones 4-5 bits, métricas de fidelidad publicadas |
| microsoft/phi-4 (base) | 14,66 B | no disponible | MIT | safetensors | Modelo original, pesos BF16 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información disponible |

## Limitaciones y advertencias

- No se realizó entrenamiento, calibración ni cuantización nueva; el autor no ofrece garantía ni respaldo de Microsoft.
- Solo se declaran inglés y coreano; el rendimiento en otros idiomas no está documentado.
- La longitud de contexto original no se especifica; el ejemplo de CLI usa 2.048 tokens y las comprobaciones GPU usan 8.192, pero no se confirma el máximo soportado.
- Riesgo de alucinación inherente al modelo base; no se documentan mitigaciones específicas.
- Las métricas de fidelidad son internas (KL, acuerdo top-1, 33 prompts) y no equivalen a una evaluación de tareas reales; el propio autor indica que una integración necesita su propia evaluación.
- El formato thinking no es aplicable a este modelo (0/7 en todas las variantes).
- Licencia MIT declarada por la release de Microsoft; se conserva el LICENSE original y el NOTICE identifica fuente y modificaciones.
- No se documenta soporte de tool calling ni de agentes, lo que limita su uso en pipelines complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/phi-4-GGUF
- Modelo base: https://huggingface.co/microsoft/phi-4
- Código llama.cpp (commit referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación GGUF con llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Licencia del repositorio: https://huggingface.co/Xylolabs/phi-4-GGUF/blob/main/LICENSE
