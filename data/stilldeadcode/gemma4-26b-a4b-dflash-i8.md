# StillDeadcode/gemma4-26b-a4b-dflash-i8

## Resumen

Gemma 4 26B-A4B-it DFlash i8 es una cuantización y empaquetado del modelo Gemma 4 26B-A4B-it de Google, orientada específicamente al motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. El autor, StillDeadcode, parte del checkpoint original de Google y le incorpora el drafter DFlash de z-lab (un modelo de difusión por bloques) para habilitar decodificación especulativa. El resultado se distribuye como un único contenedor `.rad` de 34,17 GiB que integra pesos, drafter y configuración de servidor.

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) con 26 000 millones de parámetros totales y 4000 millones activos por token (el sufijo A4B lo indica). El empaquetado mantiene en int8 únicamente las proyecciones gate_up de los expertos enrutados, aplicando una transformada de Hadamard de 128 dimensiones (fwht128) antes de la cuantización, mientras que el resto de pesos (atención, MLP denso, router, normas, embedding y proyecciones down de los expertos) permanece en bf16 tal como los entrega el checkpoint. El contexto entrenado es de 262 144 tokens y la modalidad es exclusivamente texto.

Su relevancia es doble: por un lado demuestra una ruta de despliegue de un MoE grande en hardware AMD de consumo profesional (Radeon AI PRO R9700, gfx1201) con caché KV en int8; por otro, valida la integración de decodificación especulativa mediante un drafter de difusión por bloques que propone 15 tokens por paso y cuyo rendimiento se mide explícitamente frente al contenedor FP8 del mismo autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) con decodificacion especulativa DFlash (difusion por bloques) |
| Parametros totales | 26 000 millones (26B) |
| Parametros activos | 4000 millones (4B) por token |
| Longitud de contexto | 262 144 tokens (longitud entrenada del checkpoint) |
| Tipos de cuantizacion | Expertos enrutados int8 (gate_up) con escala bf16 por fila y grupo de 128; drafter int8 con escala f16; resto de pesos en bf16; cache KV en int8, fp8 o bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | Contenedor `.rad` (motor radiance); no se distribuyen safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 26B parámetros totales y 4B activos, desarrollado por Google. La model card del empaquetado no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO; esa información corresponde al checkpoint original `google/gemma-4-26B-A4B-it` y no se reproduce aquí. El contexto entrenado es de 262 144 tokens y la modalidad es solo texto.

La innovación técnica del empaquetado reside en dos elementos. Primero, la cuantización selectiva: solo las proyecciones gate_up de los expertos enrutados se convierten a int8, y se hace en el dominio de Hadamard de 128 dimensiones (transformada fwht128) con una escala bf16 por fila y por grupo de 128 a lo largo de la dimensión K, con redondeo al más cercano y búsqueda de escala. Las proyecciones down de los expertos, la atención, el MLP denso, el router, las normas y el embedding atado permanecen en bf16. Segundo, la integración del drafter DFlash de z-lab, un modelo de difusión por bloques que propone 15 tokens por paso; sus capas lineales y su cabeza se cuantizan a int8 con escala f16, y el modelo principal verifica cada token emitido, por lo que el drafter no compromete la fidelidad de la salida. El servidor admite además una ventana de borrador adaptativa (`draft-window: adaptive`) que ajusta el número de tokens propuestos según la tasa de aceptación.

## Capacidades

- Generación de texto en modalidad exclusivamente textual (sin visión ni audio).
- Razonamiento y conversación multi-turno con ventanas de hasta 262 144 tokens.
- Decodificación especulativa con DFlash: el drafter propone 15 tokens por paso y el modelo principal los verifica.
- Servidor compatible con la API de OpenAI (`/v1/chat/completions`, `/v1/completions`), incluidos tool calls y salida estructurada.
- Soporte de caché KV cuantizada en int8, fp8 o bf16, configurable por servicio.
- Capacidades multilingües: no disponibles en la información proporcionada (heredadas del checkpoint base, sin detalle).
- Modo de pensamiento (thinking), tool calling a nivel de modelo o capacidades de agente multi-paso: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue de un MoE de 26B en GPUs AMD RDNA4: el contenedor `.rad` está pensado para el motor radiance sobre ROCm y gfx1201, con configuración de tensor paralelo `tp: 2` sobre dos Radeon AI PRO R9700; es el escenario de referencia medido por el autor.
- Servicio de chat con contexto largo: la ventana de 262 144 tokens permite mantener conversaciones o documentos extensos en memoria; en la configuración de ejemplo se limita a 32 768 tokens (`max-model-len: 32768`), ampliable según VRAM disponible.
- Inferencia de alto throughput con decodificación especulativa: el drafter DFlash eleva el rendimiento a 349-352 tokens por segundo en la prueba de 24 prompts (12 000 tokens) a cuatro secuencias simultáneas, adecuado para servir varios usuarios concurrentes.
- Integración en aplicaciones con API compatible con OpenAI: al exponer `/v1/chat/completions` con tool calls y salida estructurada, puede conectarse a frameworks de agentes y orquestadores existentes sin adaptadores propietarios.
- Reducción de huella de memoria en producción: la cuantización int8 de los expertos y la caché KV en int8 disminuyen los requisitos de VRAM frente al checkpoint bf16, permitiendo servir el modelo en dos GPUs de 32 GB.
- Evaluación comparativa de cuantizaciones: el autor publica métricas frente al contenedor FP8 equivalente (mismo modelo y drafter), lo que permite medir el compromiso entre precisión y velocidad al elegir formato.
- Prototipado e investigación en hardware AMD: útil para equipos que quieran validar cargas MoE con decodificación especulativa en ROCm sin depender de CUDA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card solo incluye mediciones de latencia y throughput del propio contenedor frente a la variante FP8 del mismo autor, sobre dos Radeon AI PRO R9700 (gfx1201):

| Metrica | i8 (este contenedor) | FP8 (referencia) |
|---|---|---|
| Paso de decodificacion sin drafter, 1 secuencia | 14,1-14,5 ms | 14,3-14,4 ms |
| Paso de decodificacion sin drafter, 4 secuencias | 14,9-15,5 ms | 15,7-15,8 ms |
| Paso de decodificacion sin drafter, 8 secuencias | 16,6-17,1 ms | 16,8 ms |
| Throughput con drafter (24 prompts, 12 000 tokens, 4 a la vez) | 349-352 tok/s | 369-371 tok/s |

El contenedor FP8 emplea caché fp8 y, según el autor, consume aproximadamente un 3 % más de tokens por paso; el i8 compensa parcialmente con pasos ligeramente más rápidos a 4 y 8 secuencias.

## Requisitos de hardware

- VRAM estimada: el contenedor pesa 34,17 GiB; con caché KV en int8 y ventana de 32 768 tokens, la configuración de referencia cabe en dos GPUs de 32 GB (Radeon AI PRO R9700) con tensor paralelo `tp: 2`.
- GPU recomendadas: Radeon AI PRO R9700 (gfx1201, RDNA4) es el hardware validado; el motor radiance está orientado a AMD RDNA4 con ROCm. No hay soporte declarado para NVIDIA ni para GPUs AMD anteriores a RDNA4.
- GPU de consumo: no se documenta funcionamiento en GPUs consumer; el requisito de dos GPUs de 32 GB y ROCm lo aleja de tarjetas de gama doméstica.
- Opciones de despliegue: exclusivamente el motor radiance (compilado desde `main` posterior a la versión 1.17.0, ya que los expertos int8, la unión de atención y la caché int8 no están en 1.17.0). No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 14,1-17,1 ms por paso de decodificación sin drafter según concurrencia (1, 4 u 8 secuencias) y 349-352 tok/s con drafter en la prueba de 24 prompts a cuatro secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Hardware |
|---|---|---|---|---|---|
| gemma4-26b-a4b-dflash-i8 (este) | 26B totales / 4B activos | 262 144 | `.rad` int8/bf16 | Apache 2.0 | AMD RDNA4, ROCm, radiance |
| StillDeadcode/gemma4-26b-a4b-dflash-fp8 | 26B totales / 4B activos | 262 144 | `.rad` fp8/bf16 | Apache 2.0 | AMD RDNA4, ROCm, radiance |
| google/gemma-4-26B-A4B-it | 26B totales / 4B activos | 262 144 | safetensors bf16 | Apache 2.0 | Multiples (CUDA, ROCm, CPU) |
| z-lab/gemma-4-26B-A4B-it-DFlash | drafter (tamano no disponible) | no disponible | no disponible | no disponible | acoplado al modelo principal |

La comparación con alternativas de otros fabricantes (por ejemplo, MoE de tamaño similar de otros proveedores) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware y software: solo funciona con el motor radiance sobre AMD RDNA4 y ROCm, y requiere una compilación de `main` posterior a 1.17.0; no es portable a CUDA, vLLM, llama.cpp ni Ollama.
- Licencia: el empaquetado declara Apache 2.0, pero remite a la licencia de Gemma 4 de Google (`license_link`); conviene verificar las condiciones de uso comercial del modelo base antes de producción.
- Idiomas soportados no documentados en esta ficha; las capacidades multilingües dependen del checkpoint base y no se detallan.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se han publicado evaluaciones de fidelidad ni de sesgos para este empaquetado.
- La cuantización int8 selectiva puede introducir degradación respecto al bf16 original; el autor no publica métricas de calidad que la cuantifiquen.
- El drafter solo propone tokens y el modelo principal los verifica, por lo que no debería afectar a la corrección de la salida, pero su tasa de aceptación condiciona la ganancia real de velocidad.
- Contexto de servicio limitado por defecto a 32 768 tokens en la configuración de ejemplo; ampliar a los 262 144 tokens entrenados exige más VRAM para la caché KV.
- Modalidad solo texto: no admite visión, audio ni otras entradas.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/StillDeadcode/gemma4-26b-a4b-dflash-i8
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Drafter DFlash: https://huggingface.co/z-lab/gemma-4-26B-A4B-it-DFlash
- Contenedor FP8 de referencia: https://huggingface.co/StillDeadcode/gemma4-26b-a4b-dflash-fp8
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
