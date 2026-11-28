# stigma604/inkling-2-mini-abliterated-iq4r-v4

## Resumen

Inkling 2 Mini abliterated IQ4R-V4 es un contenedor de inferencia cuantizado del modelo multimodal Inkling 2 Mini de Thinking Machines, en su variante "abliterated" (con el subespacio de rechazo eliminado) publicada por orcarouter. El autor, stigma604, aplica la receta de cuantización IQR-V4 de StillDeadcode a los pesos abliterated y añade como drafter especulativo el modelo DFlash2 de incoai, empaquetando todo en un único fichero `.rad` de 14,47 GiB para el motor radiance sobre GPUs AMD RDNA4 con ROCm.

Se trata de una cuantización de 4 bits por experto (trellis con Hadamard y GPTQ en orden de activación) sobre una arquitectura MoE de 24 capas con 128 expertos enrutados por capa, más una torre de visión de 23 bloques en bf16 y un cabezal de atención y embeddings en int8. El resultado es un modelo image-text-to-text que conserva la ventana de contexto de 200K tokens del original y añade decodificación especulativa por difusión de bloques.

Su relevancia es doble: por un lado demuestra un pipeline de cuantización de 4 bits con pérdida de calidad muy baja (KL medio de 0,00544 y 97,30 % de acuerdo top-1 frente a los pesos bf16 de referencia); por otro, es un ejemplo de despliegue optimizado exclusivamente para hardware AMD, un nicho poco cubierto por las herramientas de inferencia habituales. La licencia Apache 2.0 facilita su uso, aunque la eliminación del alineamiento de seguridad es un caveat importante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de vision (24 capas, 128 expertos enrutados por capa) y drafter especulativo DFlash2 (5 capas, difusion de bloques) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 200.000 tokens (configuracion de servido documentada) |
| Tipos de cuantizacion | IQ4R-V4 (trellis de 4 bits por experto con Hadamard y GPTQ); atencion int8 rotada; cabezal y embeddings int8; torre de vision bf16; drafter en trellis de 4 bits e int8 |
| Idiomas soportados | no disponible (el corpus de calibracion incluye ingles, aleman y documentos multilingues) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor radiance), 14,47 GiB |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) con 24 capas y 128 expertos enrutados por capa, acompañado de una torre de visión de 23 bloques. La cuantización IQR-V4 transforma cada experto enrutado: rota cada bloque de 128 canales con la transformada de Hadamard no normalizada y aplica un trellis "tail-biting" por columna cuyos 2^16 estados se calculan a partir del propio estado, con cuatro bits por peso bajo una escala f32 por fila y otra por bloque de 128. El ajuste se realiza con GPTQ en orden de activación contra matrices de Hessian registradas a partir del propio modelo abliterated, usando 546.000 tokens de código, llamadas a herramientas, razonamiento, texto web y documentos en alemán y multilingües. Los expertos abliterated se distribuyen en bf16, de modo que GPTQ ajusta esos pesos directamente.

La atención (q, k, v, r, la puerta de salida y o) se cuantiza a int8 rotado con escala bf16 por fila y bloque de 128; el cabezal y los embeddings quedan en int8 sin rotar, y el embedding se lee a ese ancho decodificando solo las filas recogidas. El drafter especulativo DFlash2 de incoai es un modelo de difusión de bloques de cinco capas que redacta un bloque de siete tokens en una pasada a partir de cuatro estados ocultos del modelo objetivo, con un selector de candidatos que elige un camino entre los 16 mejores de cada posición; sus lineales usan el mismo trellis de 4 bits, sus proyecciones down van en int8 rotado y los codebooks del selector en bf16. Cada borrador se verifica contra el objetivo. Un detalle relevante: el drafter se entrenó contra el Inkling 2 Mini original, no contra la versión abliterated.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de razonamiento desactivable en el servido.
- Generación de código y llamadas a herramientas (tool calling) a través de la API compatible con OpenAI.
- Procesamiento de imágenes en peticiones de chat mediante partes `image_url`, gracias a la torre de visión de 23 bloques.
- Capacidades multilingües parciales: el corpus de calibración incluye inglés, alemán y documentos multilingües, aunque no se documenta la lista oficial de idiomas.
- Decodificación especulativa con drafter DFlash2 a profundidad 7 y ventana de borrador adaptativa.
- Alineamiento de seguridad reducido (abliterated): el modelo cumple con muchas peticiones que el original rechaza.
- Servido con caché KV en int8 y contexto de hasta 200K tokens.

## Casos de uso

- Asistencia de código en producción: el modelo puede integrarse en pipelines de CI/CD para revisión de parches y generación de tests, con tool calling y un rendimiento medido de 873 tok/s con 8 flujos en cargas de código sobre 2× Radeon AI PRO R9700.
- Agentes autónomos multi-paso: la combinación de tool calling, razonamiento y contexto de 200K permite mantener cadenas largas de acciones con historial completo, verificado por el drafter para reducir latencia.
- Análisis de documentos largos con imágenes: informes escaneados, capturas o diagramas pueden enviarse como partes `image_url` junto a texto de hasta 200K tokens, útil para extracción de datos y resumen.
- Atención al cliente automatizada: conversaciones multi-turno con contexto extenso y capacidad de invocar herramientas internas (consultas a CRM, ticketing) mediante la API compatible con OpenAI.
- Procesamiento de documentación técnica en alemán e inglés: el modelo se calibró con corpus de ambos idiomas, lo que lo hace adecuado para soporte y traducción técnica en esos mercados.
- Despliegue en infraestructura AMD: entornos con GPUs RDNA4 (por ejemplo, Radeon AI PRO R9700) que necesitan un servidor de inferencia local sin depender de CUDA ni de GPUs NVIDIA.
- Investigación sobre alineamiento y seguridad: al ser una variante abliterated, sirve para estudiar comportamiento de rechazo, sesgos y robustez en modelos sin salvaguardas, siempre en entornos controlados.

## Benchmarks y rendimiento

Calidad frente a los pesos bf16 de la release abliterated (modo KL de radiance sobre 117 documentos retenidos, 118.721 posiciones):

| Metrica | Valor |
|---|---|
| KL medio | 0,00544 |
| KL mediana | 0,00165 |
| KL p99 | 0,0562 |
| KL p99.9 | 0,221 |
| Acuerdo top-1 | 97,30 % |
| Perplejidad (referencia 5,403) | 5,415 |

Desglose por fuente:

| Fuente | Posiciones | KL medio | KL mediana | KL p99 | Top-1 |
|---|---|---|---|---|---|
| Código | 44.975 | 0,00392 | 0,00013 | 0,0582 | 98,71 % |
| Web inglés | 30.616 | 0,00580 | 0,00272 | 0,0492 | 96,79 % |
| Wikipedia inglés | 10.353 | 0,00574 | 0,00264 | 0,0512 | 96,60 % |
| Web alemán | 22.490 | 0,00728 | 0,00342 | 0,0606 | 95,87 % |
| Wikipedia alemán | 10.287 | 0,00665 | 0,00258 | 0,0605 | 96,44 % |

Rendimiento de generación (2× Radeon AI PRO R9700, `tp: 2`, caché KV int8, contexto 200K, greedy, 400 tokens por petición, razonamiento desactivado, drafter a profundidad 7):

| Prompts | 1 flujo | 4 flujos | 8 flujos |
|---|---|---|---|
| Ensayos | 190 tok/s | 479 tok/s | 755 tok/s |
| Código | 347 tok/s | 685 tok/s | 873 tok/s |
| Aritmética paso a paso | 364 tok/s | 844 tok/s | 1.277 tok/s |

Procesamiento de prompt (una petición a la vez, chunks de prefill de 2.048, sin acierto de caché de prefijo):

| Tokens de prompt | Tiempo al primer token | tok/s |
|---|---|---|
| 1.033 | 0,12 s | 8.448 |
| 4.104 | 0,45 s | 9.056 |
| 16.392 | 1,86 s | 8.805 |
| 65.545 | 8,95 s | 7.324 |
| 118.985 | 19,63 s | 6.061 |

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el contenedor ocupa 14,47 GiB en disco; en inferencia con `tp: 2` y caché KV int8 sobre 200K de contexto se necesita previsiblemente bastante más memoria, aunque la cifra exacta de VRAM no está disponible.
- GPU recomendadas: 2× Radeon AI PRO R9700 (gfx1201, RDNA4) con ROCm, configuración usada en las mediciones del autor.
- Compatibilidad con GPU de consumo: no disponible; el motor radiance está orientado a RDNA4 y ROCm, no a CUDA.
- Opciones de despliegue: exclusivamente el motor radiance 2.3.0 o superior, que expone la API de OpenAI (`/v1/chat/completions`, `/v1/completions`) con tool calls, razonamiento y partes `image_url`. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tablas de la sección anterior; el tiempo al primer token va de 0,12 s con 1.033 tokens de prompt a 19,63 s con 118.985 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este contenedor (Inkling 2 Mini abliterated IQ4R-V4) | MoE, 24 capas, 128 expertos/capa (totales no disponibles) | 200K | 4 bits trellis + int8 | Apache 2.0 | Solo radiance (AMD RDNA4) |
| StillDeadcode/inkling-2-mini-iq4r-v4 | Misma arquitectura base | 200K | 4 bits trellis + int8 | Apache 2.0 | radiance (AMD RDNA4) |
| orcarouter/Inkling-2-Mini-abliterated | Misma arquitectura base | no disponible | bf16 | Apache 2.0 | Pesos bf16, ecosistema estándar |
| incoai/Inkling-2-Mini-DFlash2 | Modelo base + drafter | no disponible | no disponible | no disponible | Pesos para radiance |

La comparación directa de calidad con StillDeadcode/inkling-2-mini-iq4r-v4 no es posible: sus métricas (KL medio 0,0066) se midieron sobre un corpus distinto de 97 documentos contra una referencia diferente con perplejidad 2,88.

## Limitaciones y advertencias

- El modelo está abliterated: su alineamiento de seguridad se ha reducido sustancialmente y cumplirá muchas peticiones que el original rechaza. La responsabilidad de despliegue recae en el operador.
- El drafter especulativo se entrenó contra el Inkling 2 Mini original, no contra la versión abliterated, lo que puede afectar a la tasa de aceptación en dominios donde el comportamiento del modelo difiere.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de veracidad.
- Idiomas soportados no documentados oficialmente; la evidencia de calibración se limita a inglés, alemán y textos multilingües.
- La licencia Apache 2.0 permite uso comercial, pero la variante abliterated puede incumplir políticas de proveedores o requisitos regulatorios de contenido.
- Dependencia total del motor radiance 2.3.0 o superior y de hardware AMD RDNA4 con ROCm; no hay portabilidad a CUDA ni a otros runtimes.
- El formato `.rad` es propietario y no convertible a safetensors o GGUF con las herramientas documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de la comunidad.

## Enlaces

- [Hugging Face: stigma604/inkling-2-mini-abliterated-iq4r-v4](https://huggingface.co/stigma604/inkling-2-mini-abliterated-iq4r-v4)
- [Modelo base abliterated: orcarouter/Inkling-2-Mini-abliterated](https://huggingface.co/orcarouter/Inkling-2-Mini-abliterated)
- [Drafter especulativo: incoai/Inkling-2-Mini-DFlash2](https://huggingface.co/incoai/Inkling-2-Mini-DFlash2)
- [Receta original: StillDeadcode/inkling-2-mini-iq4r-v4](https://huggingface.co/StillDeadcode/inkling-2-mini-iq4r-v4)
- [Motor de inferencia radiance](https://codeberg.org/StillDeadcode/radiance)
