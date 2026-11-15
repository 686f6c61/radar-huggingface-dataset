# StillDeadcode/muse-glimmer-30b-iq8r-dflash

## Resumen

Muse Glimmer 30B IQ8R DFlash es una conversión cuantizada del modelo `meta-models/Muse-Glimmer-30B` para el motor de inferencia radiance (versión 2.1.0 o superior), publicada por el usuario StillDeadcode. El paquete integra en un único fichero `.rad` de 35,7 GiB tanto el modelo principal como su drafter `meta-models/Muse-Glimmer-30B-assistant`, lo que permite decodificación especulativa (DFlash) sin necesidad de cargar un segundo modelo por separado.

La conversión aplica cuantización de tipo IQ8R al tronco (int8 con escalas por fila y bloques de 256 columnas, con rotación Walsh-Hadamard previa al redondeo) y mantiene en bf16 la torre de visión, el adaptador, las capas propias del drafter, las normas y los embeddings. El `lm_head` se cuantiza a int8 plano con escalas por bloques de 128 columnas, compartido por tronco y drafter.

Se trata de una conversión rápida sin datos de calibración (round-to-nearest con búsqueda de escala), pensada para probar el modelo en el motor radiance más que como artefacto de producción. El modelo base es de tipo multimodal (incluye torre de visión) y la licencia declarada es Apache-2.0, heredada de los modelos de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con drafter de decodificacion especulativa (DFlash); detalles del tronco no disponibles |
| Parametros totales | no disponible (el nombre del modelo sugiere 30B, sin confirmacion en la model card) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ8R (int8 con escala u8 por fila y bloque de 256 columnas, escala bf16 por fila, rotacion Walsh-Hadamard a 128 columnas); lm_head int8 con escala bf16 por bloque de 128 columnas; vision tower, adaptador, capas del drafter, normas y embeddings en bf16; KV cache int8 (i8) en la configuracion de serving |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.rad` (motor radiance), 35,7 GiB |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base `meta-models/Muse-Glimmer-30B`: no se detalla si el tronco es un transformer denso, un MoE o una arquitectura híbrida, ni el número de capas, dimensión oculta o cabezas de atención. Sí se confirma que el modelo incluye una torre de visión y un adaptador multimodal, ambos preservados en bf16 en esta conversión.

El componente diferencial es el drafter DFlash (`meta-models/Muse-Glimmer-30B-assistant`), un modelo auxiliar de decodificación especulativa que se ha fusionado dentro del mismo fichero `.rad`. La conversión IQ8R aplica una rotación Walsh-Hadamard de 128 columnas antes del redondeo en cada proyección de atención (q, gate, k, v, output) y en ambas proyecciones feed-forward, técnica que reduce el error de cuantización al distribuir los valores atípicos. No se han publicado datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO).

## Capacidades

- Generación de texto: la model card confirma respuestas correctas en prompts factuales cortos y de programación.
- Generación de código: verificada en pruebas cualitativas con prompts de coding.
- Visión: el paquete incluye torre de visión y adaptador en bf16, pero el autor indica explícitamente que las capacidades de imagen y vídeo no se han comprobado.
- Decodificación especulativa: el drafter DFlash se usa por defecto y puede desactivarse con `num-speculative-tokens: 0`, liberando memoria de la KV cache (de 7,4 a 14,4 GiB por tarjeta en la configuración probada).
- Tool calling / function calling: no verificado por el autor.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Despliegue de inferencia de texto en dos GPU de 32 GB: la configuración documentada (`tp: 2`, KV cache int8) permite servir el modelo con decodificación especulativa activa en hardware de gama profesional, como dos Radeon AI PRO R9700.
- Evaluación comparativa de cuantización: al incluir el tronco IQ8R y el drafter en un solo artefacto, sirve para medir la degradación frente al modelo bf16 en las mismas prompts, tal como hizo el autor en sus pruebas cualitativas.
- Generación de texto a alta concurrencia: con 8 streams y drafter activo se alcanzan 322 tokens por segundo en total en el hardware probado, adecuado para servicios con múltiples usuarios simultáneos.
- Prototipado de asistentes de código: las pruebas del autor confirman respuestas correctas en prompts de programación, lo que permite validar pipelines de generación de código antes de invertir en infraestructura mayor.
- Pruebas de motores de inferencia alternativos: el formato `.rad` y la receta `rad-convert` documentada facilitan reproducir la conversión y comparar radiance con vLLM, llama.cpp u otros motores.
- Investigación sobre decodificación especulativa: la posibilidad de alternar drafter activado y desactivado en el mismo despliegue permite medir la ganancia de throughput de DFlash de forma controlada (73 frente a 37 tokens por segundo con un solo stream en las pruebas del autor).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se comprobó ningún benchmark ni la divergencia KL frente al modelo bf16. Los únicos datos de rendimiento son medidas de throughput en dos Radeon AI PRO R9700 con `tp: 2` y KV cache int8, en prompts de ensayo de hasta 400 tokens:

| Streams | Drafter activo (tok/s total) | Sin especulacion (tok/s total) |
|---|---|---|
| 1 | 73 | 37 |
| 4 | 176 | 144 |
| 8 | 322 | 284 |

## Requisitos de hardware

- VRAM: el fichero `.rad` ocupa 35,7 GiB; con `tp: 2` se reparte en dos GPU de 32 GB. Con KV cache int8 y drafter activo, la cache consume 7,4 GiB por tarjeta en la configuración probada; sin drafter, 14,4 GiB por tarjeta.
- GPU recomendadas: dos Radeon AI PRO R9700 (configuración verificada por el autor). No se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: no confirmado; el tamaño del artefacto (35,7 GiB) excede la VRAM de cualquier GPU de consumo individual, por lo que requeriría al menos dos tarjetas o descarga parcial a CPU, no documentada.
- Opciones de despliegue: exclusivamente el motor radiance 2.1.0 o superior, con configuración YAML (`tp: 2`, `kv-cache-dtype: i8`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 73 tok/s con un stream y drafter activo; 322 tok/s totales con 8 streams, según las medidas del autor en el hardware indicado.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables de la misma categoría (mismo tamaño o misma tarea), ni especificaciones del modelo base que permitan establecer una comparación rigurosa con alternativas.

## Limitaciones y advertencias

- Conversión sin calibración: el autor la describe como una conversión rápida con round-to-nearest y búsqueda de escala, sin datos de calibración, lo que puede implicar mayor degradación que una cuantización calibrada.
- Sin validación de benchmarks: no se ha medido MMLU, HumanEval, GSM8K ni ningún otro benchmark, ni la divergencia KL frente al modelo bf16.
- Capacidades multimodales sin verificar: imagen y vídeo no se han probado; el uso de la torre de visión en producción no está validado.
- Tool calling no verificado: no hay evidencia de que el function calling funcione correctamente tras la cuantización.
- Soporte de motor limitado: solo funciona con radiance 2.1.0 o superior; no es portable a otros motores de inferencia sin reconversión.
- Idiomas no documentados: se desconoce el soporte multilingüe real del modelo base.
- Riesgo de alucinación y sesgos: no documentados por el autor; aplican los del modelo base, sin evaluación específica.
- Licencia: Apache-2.0 permite uso comercial, pero se incluyen los ficheros LICENSE y USAGE_POLICY de los modelos de origen, que conviene revisar antes de un despliegue en producción.
- Madurez: el repositorio tiene cero descargas y cero likes en el momento de la consulta, y fue creado y actualizado el mismo día; se trata de un artefacto reciente y sin validación comunitaria.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/StillDeadcode/muse-glimmer-30b-iq8r-dflash)
- [Modelo base: meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Drafter: meta-models/Muse-Glimmer-30B-assistant](https://huggingface.co/meta-models/Muse-Glimmer-30B-assistant)
- [Motor de inferencia radiance](https://codeberg.org/StillDeadcode/radiance)
