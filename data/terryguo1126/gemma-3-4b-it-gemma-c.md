# TerryGuo1126/gemma-3-4b-it-gemma-c

## Resumen

Gemma 3 4B IT — Gemma.c es una exportación cuantizada a 8 bits del modelo `google/gemma-3-4b-it` de Google DeepMind, empaquetada en el formato binario propio (`.bin`) del motor de inferencia Gemma.c, un runtime en C11 de un solo archivo desarrollado por el autor del repositorio (TerryGuo1126 / terryguo3180-eng). No se trata de un modelo nuevo ni de un fine-tuning: es una conversión de pesos del modelo instructivo oficial de 4 mil millones de parámetros a un contenedor pensado para ejecutarse sin dependencias de Python, sin `transformers` y sin librerías de terceros.

El interés de esta ficha no reside en el modelo base —ampliamente documentado por Google— sino en el formato de distribución: pesos int8 con escalas float32 por canal, exportados en un único archivo `gemma-3-4b-it.bin` de aproximadamente 4,3 GB, y consumibles exclusivamente por el motor Gemma.c. Esto lo hace inútil para pipelines estándar (vLLM, TGI, llama.cpp, Ollama) y lo orienta a despliegues embebidos, entornos sin toolchain de Python o experimentación con inferencia en C puro sobre CPU.

El repositorio presenta cero descargas y cero likes en el momento de la consulta, no incluye pipeline declarado ni listado de idiomas, y su model card es mínima: se limita a describir el formato, el comando de compilación y el aviso de licencia Gemma. Toda la información técnica sobre arquitectura, entrenamiento y capacidades debe inferirse del modelo base `google/gemma-3-4b-it`, no de esta exportación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de `google/gemma-3-4b-it`; no se detalla en la model card de esta exportación) |
| Parametros totales | 4B (modelo base); no se especifica recuento exacto en la exportación |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en esta model card (depende del modelo base) |
| Tipos de cuantizacion | int8 con escalas float32 por canal; exportación en float32 para el motor |
| Idiomas soportados | no disponible |
| Licencia | Gemma Terms of Use (`license: gemma`) |
| Formato de pesos | `.bin` propietario de Gemma.c (no cargable por `transformers`) |
| Tamano del repositorio | 4,3 GB |
| Fichero de pesos | `gemma-3-4b-it.bin` |
| Modelo base | `google/gemma-3-4b-it` |
| Motor de inferencia | Gemma.c (C11, single-file, OpenMP, sin dependencias) |
| Fecha de creacion | 2026-11-10 |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base `google/gemma-3-4b-it`, un transformer decoder-only de la familia Gemma 3 de Google DeepMind. Esta exportación no aporta información sobre la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO/SFT) del modelo original; la model card se limita a describir el proceso de conversión y el formato de salida.

La contribución técnica de este repositorio es el proceso de cuantización y empaquetado: los pesos se almacenan como enteros de 8 bits con escalas float32 por canal, y el motor Gemma.c los consume compilando con `-DDTYPE=FP32` (valor por defecto). El motor es un runtime C11 de un solo archivo con tokenizador BPE implementado desde cero, paralelismo OpenMP y soporte declarado para Gemma 1/2/3 en texto y SigLIP en visión. No se documenta en esta ficha si la exportación conserva la torre de visión del modelo base ni si el motor la ejecuta; la model card menciona soporte de SigLIP a nivel de motor, pero no confirma que este `.bin` incluya esos pesos.

## Capacidades

- Generación de texto instructivo, heredada de `google/gemma-3-4b-it` (no verificada en esta exportación).
- Razonamiento y matemáticas básicas propias de un modelo de 4B, sin datos de benchmark en esta model card.
- Generación de código: capacidad del modelo base, no documentada específicamente aquí.
- Tool calling / function calling: no disponible en esta model card.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas del repo está vacío).
- Visión: el motor Gemma.c declara soporte SigLIP, pero no se confirma que este archivo `.bin` incluya la torre visual.
- Modo thinking explícito: no disponible.
- Ejecución sin Python: capacidad diferencial de esta exportación, al funcionar sobre un binario C11 sin dependencias de terceros.

## Casos de uso

- Inferencia en entornos sin Python: despliegue del binario `gemma` compilado con `make` en sistemas donde no se puede instalar PyTorch ni `transformers`, como appliances, contenedores mínimos o sistemas embebidos Linux.
- Experimentación con motores de inferencia en C: uso del `.bin` como referencia para comparar rendimiento y corrección frente a implementaciones en Python del mismo modelo base.
- Prototipado en CPU sin GPU: al ser un runtime con OpenMP y pesos int8, permite ejecutar un modelo de 4B en máquinas sin acelerador, útil para demos locales y pruebas de concepto.
- Educación y auditoría de formatos de cuantización: el par (pesos int8 + escalas float32 por canal) sirve para estudiar el impacto de la cuantización por canal en la calidad de salida frente al modelo original.
- Integración en herramientas CLI: el binario acepta `--prompt` y `--tokens`, lo que facilita scripting en shell para generación de texto por lotes en pipelines ligeros.
- Evaluación comparativa de runtimes: medición de latencia y throughput de Gemma.c frente a llama.cpp u Ollama sobre el mismo hardware y el mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el archivo de pesos ocupa 4,3 GB; dado que el motor compila por defecto en FP32 (`-DDTYPE=FP32`) con pesos int8 y escalas float32, el consumo en memoria puede superar el tamaño del archivo al materializar tensores. No se dispone de cifras oficiales de memoria pico.
- GPU recomendadas: no disponible. La model card no documenta backend CUDA, ROCm ni Metal; el motor se describe con paralelismo OpenMP, lo que apunta a ejecución en CPU.
- GPU de consumo: no disponible. No hay confirmación de soporte para RTX 4090, RTX 3090 u otras GPU de consumo.
- Despliegue: exclusivamente mediante el binario Gemma.c (`make` y `./gemma gemma-3-4b-it.bin`). No es compatible con vLLM, TGI, llama.cpp, Ollama ni `transformers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Gemma 3 4B IT — Gemma.c (esta exportación) | 4B | no disponible | `.bin` Gemma.c | Gemma Terms of Use | Hugging Face, 0 descargas |
| `google/gemma-3-4b-it` (original) | 4B | no disponible en esta ficha | safetensors | Gemma Terms of Use | Hugging Face, oficial de Google |
| Gemma 3 4B IT en GGUF (comunidad) | 4B | no disponible en esta ficha | GGUF | Gemma Terms of Use | Hugging Face, múltiples repositorios |
| Gemma 3 4B IT en AWQ/GPTQ int4 (comunidad) | 4B | no disponible en esta ficha | safetensors cuantizado | Gemma Terms of Use | Hugging Face, múltiples repositorios |

La diferencia práctica frente a las alternativas es el formato: las exportaciones GGUF y AWQ/GPTQ son consumibles por runtimes ampliamente adoptados (llama.cpp, vLLM, TGI), mientras que esta versión queda restringida a Gemma.c. No se dispone de datos de rendimiento comparativo entre ellas.

## Limitaciones y advertencias

- Formato propietario: el `.bin` no es cargable por `transformers`, vLLM, TGI, llama.cpp ni Ollama; solo funciona con el binario Gemma.c del mismo autor.
- Proyecto de autor único y sin tracción: cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y riesgo de abandono.
- Cuantización int8: puede degradar la calidad respecto al modelo base en tareas sensibles (matemáticas, código, razonamiento largo); no se aportan evaluaciones que cuantifiquen la pérdida.
- Sin datos de benchmarks ni de evaluación de calidad en la model card.
- Idiomas no declarados: no se puede garantizar el comportamiento multilingüe del modelo base en esta exportación.
- Riesgo de alucinación: inherente a un modelo de 4B; no se documentan mitigaciones específicas.
- Sesgos: no documentados en esta model card; se heredan los del modelo base de Google, no evaluados aquí.
- Licencia: sujeta a los Gemma Terms of Use (ai.google.dev/gemma/terms), con las restricciones de uso comercial y de redistribución que dichos términos imponen.
- Visión no confirmada: aunque el motor declara soporte SigLIP, no se verifica que este archivo incluya la torre visual.
- Fecha de creación anómala (2026-11-10): conviene verificar la integridad y procedencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TerryGuo1126/gemma-3-4b-it-gemma-c
- Motor Gemma.c (GitHub): https://github.com/terryguo3180-eng/Gemma.c
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
