# StillDeadcode/inkling-2-mini-iq4r-v4

## Resumen

Inkling 2 Mini IQ4R-V4 es una cuantizacion de cuatro bits del modelo multimodal Inkling-2-Mini de Thinking Machines, empaquetada junto con el drafter especulativo DFlash2 de incoai en un unico contenedor `.rad` para el motor de inferencia radiance sobre GPUs AMD RDNA4 con ROCm. No es un modelo nuevo, sino una distribucion optimizada del modelo base: los 128 expertos enrutados de sus 24 capas se almacenan en la forma trellis de cuatro bits IQR-V4, mientras que la torre de vision permanece en bf16 y la atencion se comprime a int8 rotado.

El paquete resuelve un problema de despliegue concreto: servir un modelo MoE multimodal de gran contexto en hardware AMD consumer y profesional sin renunciar a una calidad cercana al original. Segun la model card, la divergencia media KL frente a los pesos de referencia es de 0,0066 con un 97,6 % de acuerdo en top-1 y una perplejidad de 2,896 frente a 2,884 del original, sobre 115.522 posiciones de evaluacion en ingles, aleman y codigo.

Su relevancia actual radica en dos factores. Por un lado, demuestra que la cuantizacion GPTQ guiada por Hessianos combinada con rotaciones Hadamard y decodificacion especulativa permite reducir el peso a 14,43 GiB manteniendo 200K de contexto. Por otro, es una de las pocas distribuciones publicadas que integra drafter especulativo y vision en un solo artefacto para el ecosistema ROCm, un nicho tradicionalmente desatendido frente a CUDA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (image-text-to-text) con torre de vision de 23 bloques |
| Parametros totales | no disponible |
| Parametros activos | no disponible (128 expertos enrutados por capa, 24 capas) |
| Longitud de contexto | 200.000 tokens |
| Tipos de cuantizacion | IQR-V4 (trellis de 4 bits con Hadamard), int8 rotado para atencion y proyecciones, NVFP4 (capas 0-19), MXFP8 (capas 20-23), bf16 para torre de vision |
| Idiomas soportados | no disponible (corpus de calibracion en ingles, aleman y multilingue) |
| Licencia | Apache 2.0 (sujeta a la politica de uso aceptable del modelo base) |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos (MoE) de 24 capas, cada una con 128 expertos enrutados, mas una torre de vision de 23 bloques para entrada de imagenes. Esta distribucion no entrena el modelo desde cero: aplica un proceso de cuantizacion post-entrenamiento sobre los pesos publicados. Los expertos se almacenan en formato IQR-V4, que rota cada bloque de 128 dimensiones con una transformada de Hadamard no normalizada y codifica cada columna mediante un trellis de 2^16 estados, con cuatro bits por peso bajo una escala f32 por fila y otra por bloque de 128. El ajuste se realiza con GPTQ en orden de activacion contra Hessianos registrados a partir del propio modelo, usando 538.000 tokens de codigo, llamadas a herramientas, razonamiento, texto web y documentos en aleman y multilingues.

La atencion (q, k, v, r, puerta de salida y proyeccion o) se cuantiza a int8 rotado con escala bf16 por fila y por bloque de 128. La cabeza y el embedding usan int8 sin rotar, y el embedding solo se decodifica en las filas recolectadas. El drafter DFlash2 es un modelo de difusion de bloques de cinco capas que redacta siete tokens por pasada a partir de cuatro estados ocultos del modelo objetivo, con un selector de candidatos que elige una ruta entre los 16 mejores de cada posicion; sus lineales usan el mismo trellis de cuatro bits y sus proyecciones descendentes int8 rotado. Cada borrador se verifica contra el modelo objetivo. Las capas 0-19 se publican en NVFP4 y las 20-23 en MXFP8, desquantizadas exactamente antes del ajuste GPTQ.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con modo de razonamiento expuesto a traves de la API (campo `reasoning`).
- Comprension de imagenes: la torre de vision de 23 bloques en bf16 procesa entradas `image_url` en mensajes de chat.
- Generacion de codigo, con soporte verificado en el corpus de calibracion (538K tokens de codigo y llamadas a herramientas).
- Tool calling y function calling mediante la API compatible con OpenAI (`/v1/chat/completions`).
- Razonamiento aritmetico paso a paso, con el mayor incremento de throughput observado en las pruebas del autor.
- Capacidades multilingues, con calibracion explicita en aleman ademas de ingles.
- Decodificacion especulativa integrada: el drafter DFlash2 genera bloques de siete tokens verificados por el objetivo.
- Contexto largo de hasta 200.000 tokens con cache KV en int8.

## Casos de uso

- Atencion al cliente multimodal: el modelo gestiona conversaciones multi-turno con imagenes adjuntas (capturas, fotos de producto) y hasta 200K tokens de historial, adecuado para soporte tecnico que requiere contexto de incidencias previas.
- Generacion de codigo en produccion: con tool calling y API compatible con OpenAI, se integra en pipelines de CI/CD para revision de parches, generacion de tests y explicacion de errores, con throughput de 790 tok/s a ocho flujos en codigo.
- Analisis de documentos tecnicos con imagenes: informes con diagramas, planos o graficos pueden procesarse en una sola ventana de contexto, combinando la torre de vision con el razonamiento textual.
- Despliegue en estaciones de trabajo AMD: una unica tarjeta de 32 GB (por ejemplo, Radeon AI PRO R9700) sirve el modelo con `tp: 1`, lo que permite prototipado local sin depender de CUDA.
- Razonamiento aritmetico y financiero por lotes: el modo de decodificacion especulativa alcanza 1.116 tok/s a ocho flujos en aritmetica paso a paso, util para validacion de calculos, conciliaciones o generacion de informes numericos.
- Servicio multilingue en aleman e ingles: la calibracion incluye documentos en aleman, lo que reduce la degradacion por cuantizacion en ese idioma frente a cuantizaciones genericas.
- Evaluacion comparativa de tecnicas de cuantizacion: investigadores pueden reproducir el pipeline (`rad-convert` con receta y calibracion) para estudiar el impacto de IQR-V4 frente a int8 en calidad y latencia.

## Benchmarks y rendimiento

Calidad frente a los pesos de referencia (modo KL de radiance sobre 97 documentos en ingles, aleman y codigo; 115.522 posiciones; perplejidad de referencia 2,884):

| Metrica | Este contenedor (IQ4R-V4) | Expertos todo-int8 (26,1 GiB) |
|---|---|---|
| KL media | 0,0066 | 0,0042 |
| KL mediana | 0,00083 | 0,00037 |
| KL p99 | 0,073 | 0,052 |
| Acuerdo top-1 | 97,6 % | 98,2 % |
| Perplejidad | 2,896 | 2,893 |

Throughput en 2× Radeon AI PRO R9700 (gfx1201), `tp: 2`, cache KV int8, contexto 200K, greedy, 400 tokens por peticion, drafter a profundidad 7 (tokens/s; tokens por paso entre parentesis):

| Prompts | Flujos | Este contenedor (DFlash2) | Mismo objetivo, DSpark |
|---|---|---|---|
| Ensayos | 1 | 190 (2,59) | 152 (1,92) |
| Ensayos | 4 | 427 (9,43) | 344 (7,09) |
| Ensayos | 8 | 658 (19,1) | 512 (14,6) |
| Codigo | 1 | 240 (3,50) | 203 (2,80) |
| Codigo | 4 | 550 (13,5) | 419 (10,1) |
| Codigo | 8 | 790 (25,7) | 629 (20,3) |
| Aritmetica paso a paso | 1 | 358 (5,39) | 253 (3,73) |
| Aritmetica paso a paso | 4 | 811 (20,7) | 589 (14,4) |
| Aritmetica paso a paso | 8 | 1116 (39,9) | 803 (26,8) |

El coste por paso es identico con ambos drafters (13,5-14,6 ms a un flujo); la ventaja de DFlash2 proviene de aceptar mas borradores. El contenedor todo-int8 decodifica 124 / 263 / 386 tok/s en los ensayos a 1, 4 y 8 flujos.

## Requisitos de hardware

- VRAM: el contenedor ocupa 14,43 GiB en disco; con cache KV int8 y 200K de contexto, el autor indica que una unica tarjeta de 32 GB es suficiente con `tp: 1`.
- GPU recomendadas: 2× Radeon AI PRO R9700 (gfx1201) para `tp: 2` y maxima concurrencia; una R9700 de 32 GB para `tp: 1`.
- Compatibilidad: exclusivamente AMD RDNA4 con ROCm; no hay soporte CUDA ni Metal documentado.
- Cabe en GPU consumer: si, en tarjetas RDNA4 con 32 GB o mas; no se documenta funcionamiento en GPUs de 16 GB o menos.
- Despliegue: motor radiance 2.3.0 o superior, con servidor compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`). No se soportan vLLM, llama.cpp, Ollama ni TGI por el formato `.rad`.
- Latencia y throughput: 13,5-14,6 ms por paso a un flujo; 190-358 tok/s a un flujo y hasta 1.116 tok/s a ocho flujos segun tipo de prompt.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini IQ4R-V4 (esta ficha) | MoE, 128 expertos × 24 capas (total no disponible) | 200K | KL 0,0066; top-1 97,6 % | Apache 2.0 | Contenedor `.rad`, solo radiance/RDNA4 |
| Inkling 2 Mini todo-int8 (mismo autor) | Igual | 200K | KL 0,0042; top-1 98,2 % | Apache 2.0 | 26,1 GiB; 124-386 tok/s en ensayos |
| thinkingmachines/Inkling-2-Mini (bf16) | Igual | no disponible | Referencia (perplejidad 2,884) | Apache 2.0 | Pesos originales; requiere mucho mas espacio |
| incoai/Inkling-2-Mini-DFlash2 (drafter) | 5 capas | no disponible | Complementario, no autonomo | Apache 2.0 | Pesos del drafter |

## Limitaciones y advertencias

- Dependencia total del motor radiance: el formato `.rad` no es portable a vLLM, llama.cpp, Ollama ni TGI, lo que limita el despliegue a RDNA4 con ROCm.
- Perdida de calidad medible: el acuerdo top-1 cae al 97,6 % y la perplejidad sube de 2,884 a 2,896; la KL p99 de 0,073 indica colas de divergencia en algunas posiciones.
- Sesgos: no se documentan evaluaciones de sesgo; el corpus de calibracion (codigo, web, aleman) puede amplificar sesgos presentes en el modelo base.
- Alucinacion: no se aportan datos especificos; la cuantizacion agresiva de expertos puede incrementar la tasa de error en dominios poco representados en la calibracion.
- Idiomas: solo se verifica calibracion en ingles, aleman y multilingue generico; el rendimiento en castellano no esta medido.
- Licencia: Apache 2.0, pero sujeta a la politica de uso aceptable de Thinking Machines, que puede restringir usos comerciales concretos.
- Madurez: el repositorio registra 0 descargas y 0 likes en el momento de la consulta; es una publicacion reciente sin validacion externa.
- Sin datos de parametros totales ni activos, lo que dificulta estimar costes de entrenamiento o ajuste fino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StillDeadcode/inkling-2-mini-iq4r-v4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Drafter DFlash2: https://huggingface.co/incoai/Inkling-2-Mini-DFlash2
- Motor radiance: https://codeberg.org/StillDeadcode/radiance
- Blog de DFlash 2: https://inco.ai/blog/dflash2/
- Repositorio DFlash: https://github.com/z-lab/dflash
- Politica de uso aceptable: https://thinkingmachines.ai/model-acceptable-use-policy/
