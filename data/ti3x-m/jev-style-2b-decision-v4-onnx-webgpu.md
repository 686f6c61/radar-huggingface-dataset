# ti3x-m/Jev-Style-2B-Decision-v4-ONNX-WebGPU

## Resumen

Jev-Style 2B Decision v4 (ONNX/WebGPU) es una conversión experimental del modelo `chaoliangUNSW/Jev-Style-2B-Decision-v4` a formato ONNX con ejecución acelerada por WebGPU en el navegador. No es un modelo generativo: es un clasificador de decisiones que puntúa opciones suministradas por el usuario (elección entre alternativas, verdadero/falso, escala de niveles y preguntas sobre imagen). El autor de la conversión es `ti3x-m` y el modelo base procede de `chaoliangUNSW`.

La relevancia de esta publicación radica en que permite ejecutar un modelo de 2.000 millones de parámetros íntegramente en el navegador mediante WebGPU, con soporte multimodal (texto e imagen) y ventanas de contexto ampliadas a 512, 1.024 y 2.048 tokens. Es un artefacto de despliegue, no un lanzamiento del modelo original: incluye grafos, pesos en FP16, tokenizador y validaciones, pero requiere un runner específico en el navegador que implemente el renderizado Jev, la atención por bloques y la lectura de veredictos.

El modelo está pensado para tareas de decisión estructurada (enrutado de tickets, aprobación de recibos, clasificación con criterios explícitos) y no para generación libre de texto ni detección de objetos. Su licencia Apache 2.0 facilita la integración en productos, aunque su naturaleza experimental y las limitaciones de forma fija de los tensores condicionan su uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal y atención por bloques (según metadatos de la conversión); modelo de decisión multimodal |
| Parámetros totales | 2B (según nombre del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512, 1.024 y 2.048 tokens (entradas de contexto fijas); el modelo original soporta 32.768 tokens, no implementado aquí |
| Tipos de cuantización | FP16 con aritmética FP32 selectiva; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (multi-sesión, con datos externos `layer-NN.onnx.data` y ficheros `context-*-linear.bin`), FP16 |

## Arquitectura y entrenamiento

La conversión parte de los pesos reales del modelo `chaoliangUNSW/Jev-Style-2B-Decision-v4` en la revisión inmutable `61e43347cd7b5342e1b86d85787e9c71112166e0`. El artefacto distribuye 318 tensores aprendidos del decodificador por cada bucket de contexto (512, 1.024 y 2.048), junto con sesiones separadas para atención lineal y atención por bloques. La inferencia se organiza en múltiples sesiones ONNX (24 sesiones de decodificador más una sesión de visión), lo que impide cargarlo con `pipeline()` o `AutoModel.from_pretrained()`.

La innovación principal es la exportación a WebGPU con formas de tensor fijas y soporte de contexto ampliado sin reentrenar: los grafos de 1.024 y 2.048 tokens reutilizan los mismos pesos del decodificador y solo añaden grafos y constantes compartidas. La imagen se procesa en un lienzo fijo de 416 × 608 con rejilla `[1, 38, 26]` y 247 tokens de imagen fusionados. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Clasificación de decisión por elección entre opciones nombradas con descripciones y criterios.
- Decisión verdadero/falso (`noul`) con pregunta y criterios opcionales.
- Puntuación en escala ordinal con 2 a 10 niveles descritos.
- Procesamiento multimodal: una imagen seleccionada por el usuario, referenciada en el estado mediante `<|image_1|>` exactamente una vez.
- Evaluación secuencial de múltiples preguntas sobre el mismo estado, con reutilización de características de imagen.
- Entrada editable de texto y JSON (no limitada a ejemplos fijos en los buckets de 512, 1.024 y 2.048 tokens).
- Tokenización y renderizado en el navegador.
- No genera texto libre ni bounding boxes; solo puntúa opciones suministradas.

## Casos de uso

- Enrutado de tickets de soporte: el modelo recibe el estado del ticket y una pregunta de elección con equipos candidatos (facturación, técnico, ventas) y devuelve la probabilidad por equipo. En la prueba publicada asignó «billing» con 99,45 % para una reclamación de reembolso y «tech» con 99,82 % para un fallo de inicio de sesión.
- Aprobación de recibos con contexto largo: con hasta 2.048 tokens (incluida la imagen del recibo) el modelo decide si procede aprobar, incorporando notas de estado y políticas. La prueba publicada con 1.300 tokens de entrada devolvió «true» con 87,74 %.
- Verificación de políticas antes de archivar pedidos: el modelo distingue si un pedido ya fue enviado consultando el estado y las notas de archivo, con resultados del 96,88 % y 94,99 % de confianza en los casos probados.
- Clasificación ordinal de severidad: con la modalidad de puntuación (2–10 niveles) puede etiquetar la gravedad de una incidencia o la prioridad de una tarea según descripciones ordenadas.
- Filtrado previo en formularios web: integrado en el navegador, permite validar o clasificar entradas del usuario sin enviar datos a un servidor, útil por privacidad y latencia.
- Asistencia a la decisión en aplicaciones de escritorio web: al ejecutarse en WebGPU, puede incorporarse a herramientas internas que necesiten un veredicto estructurado sobre texto o una imagen sin infraestructura de servidor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor publica mediciones de validación en navegador (Apple M3 Pro, Edge 156) con 5/5 respuestas esperadas correctas:

| Caso | Tokens de entrada | Contexto | Resultado | Tiempo total observado |
|---|---:|---:|---|---:|
| Pedido no enviado; estado/política antes de notas de archivo | 852 | 1.024 | true, 88,1292 % | 22,02 s |
| Mismo caso, pedido ya enviado | 849 | 1.024 | false, 96,8768 % | 19,36 s |
| Estado largo de pedido no enviado | 1.758 | 2.048 | true, 89,5783 % | 36,51 s |
| Mismo caso largo, pedido ya enviado | 1.755 | 2.048 | false, 94,9921 % | 51,42 s |
| Aprobación de recibo con estado largo | 1.300 (incluye imagen) | 2.048 | true, 87,7428 % | 51,64 s |

Los cuatro resultados de texto coinciden con una referencia en FP32 sobre los pesos FP16 convertidos, con una diferencia máxima de probabilidad de 0,6774 puntos porcentuales. Los tiempos no son benchmarks controlados e incluyen carga y preparación de sesiones.

## Requisitos de hardware

- VRAM/almacenamiento: el repositorio ocupa 5,1 GB. A 2.048 tokens, solo el búfer de puntuaciones de atención FP32 de ocho cabezas consume 128 MiB; la memoria total supera ese búfer.
- Límite de binding de almacenamiento: el GPU probado reportó aproximadamente 4 GiB; otros dispositivos pueden tener límites menores o fallar.
- GPU recomendadas: el autor valida en Apple M3 Pro con WebGPU (Edge 156). No se documentan pruebas en A100, H100 ni RTX 4090; el despliegue objetivo es el navegador, no servidores con CUDA.
- Cabe en GPU de consumo: sí, siempre que el navegador y el dispositivo soporten WebGPU con los límites de binding necesarios; el autor desactivó el fallback a CPU en todas las sesiones.
- Opciones de despliegue: exclusivamente un runner de navegador específico que implemente el renderizado Jev, la atención por bloques, la preparación de imagen y la lectura de veredictos. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: entre 19,36 s y 51,64 s por decisión en los casos medidos, incluyendo carga y preparación; el contexto de 2.048 tokens es sustancialmente más lento en este prototipo.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión multimodal con despliegue ONNX/WebGPU en la documentación proporcionada. El modelo base `chaoliangUNSW/Jev-Style-2B-Decision-v4` es la referencia directa, pero no se detallan sus especificaciones de contexto, licencia ni rendimiento más allá de los 32.768 tokens de contexto original y la canalización de redimensionado inteligente flexible, no implementadas en esta conversión.

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jev-Style 2B Decision v4 ONNX/WebGPU (este) | 2B | 512 / 1.024 / 2.048 (fijo) | ONNX FP16 | Apache 2.0 | Hugging Face, experimental |
| chaoliangUNSW/Jev-Style-2B-Decision-v4 (base) | 2B | 32.768 (original) | no disponible | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo experimental: no es un lanzamiento oficial del autor del modelo base y no crea un endpoint de inferencia ni añade el modelo a selectores de Spaces alojados.
- Solo artefacto: requiere un runner de navegador dedicado; `pipeline()` y `AutoModel.from_pretrained()` no pueden cargar el formato multi-sesión.
- Formas de tensor fijas: no hay formas dinámicas, reutilización de caché de prefijo ni múltiples imágenes.
- Límite estricto de 2.048 tokens totales (estado, tokens de imagen, pregunta y opciones); las entradas más largas deben rechazarse sin truncar.
- Una sola imagen en lienzo fijo de 416 × 608 con rejilla `[1, 38, 26]` y 247 tokens fusionados; no implementa preguntas de bounding box.
- El modelo no genera texto libre; solo puntúa opciones suministradas, por lo que no sirve para tareas generativas.
- La serialización JSON de números en el navegador puede diferir de Python para valores numéricos inusuales.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones idiomáticas; los idiomas soportados figuran como no disponibles.
- La licencia Apache 2.0 permite uso comercial, pero la naturaleza experimental y la falta de validación amplia desaconsejan producción sin pruebas propias.
- El contexto de 2.048 tokens es sustancialmente más lento y puede exceder límites de memoria en GPUs con bindings de almacenamiento reducidos.

## Enlaces

- [Hugging Face: ti3x-m/Jev-Style-2B-Decision-v4-ONNX-WebGPU](https://huggingface.co/ti3x-m/Jev-Style-2B-Decision-v4-ONNX-WebGPU)
- [Modelo base: chaoliangUNSW/Jev-Style-2B-Decision-v4](https://huggingface.co/chaoliangUNSW/Jev-Style-2B-Decision-v4)
- [Ejemplos de contexto largo](fixtures/context-examples.json)
- [Resultados de validación en navegador](validation/context-webgpu.json)
- [Notas detalladas de pruebas](validation/context-webgpu.md)
