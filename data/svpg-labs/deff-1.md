# SVPG-Labs/deff-1

## Resumen

Deff-1 es un modelo de lenguaje de difusión (diffusion language model) especializado en decisiones estructuradas sobre texto e imágenes, desarrollado por SVPG-Labs. Se trata de un fine-tune de `SVPG-Labs/diffusiongemma-26b-djev-v10-step160-NVFP4`, entrenado adicionalmente con correos de phishing y correos legítimos para mejorar la clasificación en ese dominio. El modelo resuelve un problema concreto: emitir juicios binarios, elecciones entre etiquetas y puntuaciones sobre un estado de entrada (texto o imagen) en una sola pasada, con probabilidades asociadas a cada opción.

El modelo se distribuye en formato NVFP4 (18,9 GB) y está pensado para ejecutarse en una única GPU consumer de gama alta, concretamente una RTX 5090 con 32 GB de VRAM, usando el servidor `djev` sin modificaciones. Frente a alternativas como Kev-27B o GEV-26B-Decide, Deff-1 prioriza el rendimiento y la latencia sobre la precisión bruta: es entre 6,5 y 10,2 veces más rápido por pregunta que Kev-27B en documentos con múltiples preguntas, aunque Kev-27B obtiene mayor precisión en su propio conjunto de test.

La relevancia actual del modelo radica en su enfoque: en lugar de generar texto libre, devuelve decisiones estructuradas y calibrables, lo que lo hace adecuado para pipelines de moderación, triaje, enrutamiento y clasificación donde se necesita baja latencia y salidas parseables. Su licencia Apache 2.0 (con enlace a la licencia de Gemma 4) facilita su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiffusionGemma (modelo de lenguaje de difusión), fine-tune con LoRA fusionado |
| Parametros totales | 14.404.788.588 (~14,4 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | NVFP4 (pesos de expertos), BF16 (pesos restantes), FP8 (caché KV) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (license_link a Gemma 4) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Deff-1 se basa en la familia DiffusionGemma, un modelo de lenguaje de difusión en lugar de un transformer autorregresivo convencional. La inferencia se realiza sobre un canvas de 64 tokens con 32 secuencias en paralelo, caché de prefijo y una caché de 2 GiB. Los pesos se distribuyen en NVFP4 para los expertos y BF16 para el resto, con caché KV en FP8. El modelo parte del checkpoint `diffusiongemma-26b-djev-v10-step160-NVFP4` y se ha afinado con entrenamiento adicional sobre correos de phishing y correos legítimos, con un adaptador LoRA posteriormente fusionado en los pesos.

El entrenamiento está orientado a decisiones estructuradas: el modelo recibe un estado (texto o imagen) y un conjunto de hasta 256 preguntas de tres tipos (`noul` para juicios binarios en escala -1 a +1, `choice` para selección de etiqueta con probabilidades por opción, y `score` para puntuar contra una lista ordenada de niveles). No se dispone de información sobre el número de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas de RLHF o DPO. El modelo no incluye temperaturas de calibración ajustadas, por lo que el autor recomienda calibrarlas sobre datos etiquetados propios antes de usar umbrales de probabilidad en producción.

## Capacidades

- Juicios binarios (`noul`): responde en una escala de -1 (no) a +1 (sí) con probabilidad asociada.
- Elecciones (`choice`): selecciona una etiqueta entre varias y devuelve probabilidades para cada opción.
- Puntuaciones (`score`): evalúa el estado contra una lista ordenada de niveles.
- Procesamiento conjunto de texto e imagen (pipeline `image-text-to-text`).
- Hasta 256 preguntas por estado en una sola petición.
- Soporte de contexto largo de hasta 131.072 tokens con caché de prefijo.
- Modo de decisión estructurada con orden `state_first` y `samples: 1`.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Detección de phishing en correo electrónico: el modelo se ha afinado específicamente sobre correos de phishing y legítimos, con una recall de phishing del 86,8% y de correo legítimo del 97,6% en PhishNChips, lo que lo hace adecuado para filtros de seguridad en pasarelas de correo.
- Triaje y enrutamiento de tickets de soporte: mediante preguntas `choice` (equipo responsable) y `score` (urgencia) sobre el texto del ticket, en una sola petición de baja latencia (47 ms de mediana en RTX 5090).
- Moderación de contenido: uso de juicios binarios `noul` para clasificar si un texto o imagen infringe políticas, con probabilidades por decisión.
- Clasificación de documentos con múltiples criterios: con 1 a 64 preguntas por documento, el modelo mantiene entre 7,5 y 14,4 ms por pregunta, lo que permite evaluar un mismo documento contra decenas de criterios en una sola pasada.
- Enrutamiento de solicitudes en atención al cliente: el ejemplo de la model card muestra cómo decidir si una solicitud es de facturación, a qué equipo asignarla y su urgencia con una única llamada al endpoint `/v1/systemone`.
- Procesamiento por lotes de alta concurrencia: con 32 clientes enviando peticiones cortas, sirve 199,5 peticiones por segundo con una latencia p95 de 195 ms, adecuado para servicios de clasificación en tiempo real.
- Análisis de imágenes con decisiones estructuradas: con una imagen y un cliente, la mediana es de 85 ms, lo que permite clasificar imágenes contra criterios definidos.

## Benchmarks y rendimiento

| Modelo, donde se midió | Mediana por petición | Peticiones/s, 32 clientes | Precisión test público Kev | Precisión PhishNChips | Decision Index 0.2.1 |
|---|---:|---:|---:|---:|---:|
| **Deff-1**, 18,9 GB NVFP4, RTX 5090 del autor | 47 ms | 199,5 | 78,75% | 92,2% | 52,45 |
| GEV-26B-Decide-NVFP4, misma tarjeta | 49 ms | 105,7 | 79,36% | — | — |
| Kev-27B (build NVFP4 W4A4 del autor), misma tarjeta | 540 ms | 4,3 | 88,77% | — | — |
| Clef-flash 9B (Cloudflare, su hardware) | 38,8 ms | — | — | 75,0% | 57,07 |
| Clef 27B (Cloudflare, su hardware) | 209,3 ms | — | — | 79,6% | 61,21 |

| Carga de trabajo | Deff-1 | GEV | Kev-27B | Deff-1 vs GEV | Deff-1 vs Kev |
|---|---:|---:|---:|---|---|
| Test público Kev, 2 clientes: tiempo total | 87,0 s | 125,6 s | 883,8 s | 1,4x | 10,2x |
| Peticiones de 3 preguntas, 32 clientes: peticiones/s | 199,5 | 105,7 | 4,3 | 1,9x | 46,4x |
| Misma carga, latencia p95 | 195 ms | 310 ms | 8.677 ms | — | — |
| Un documento, 1 cliente, 1 pregunta: ms/pregunta | 49,6 | 72,1 | 320,2 | 1,5x | 6,5x |
| Mismo, 4 preguntas | 14,4 | 31,2 | 122,9 | 2,2x | 8,5x |
| Mismo, 16 preguntas | 8,4 | 12,3 | 85,8 | 1,5x | 10,2x |
| Mismo, 64 preguntas | 7,5 | 7,2 | 76,4 | 0,96x | 10,2x |
| Una imagen, 1 cliente: mediana | 85 ms | 93 ms | solo texto | 1,1x | — |

| Test de calidad frente al checkpoint base | Deff-1 | Base | Diferencia [IC 95%] |
|---|---:|---:|---|
| PhishNChips, recall de phishing (1.000 correos) | 86,8% | 84,4% | +2,4 [+0,3, +4,5] |
| PhishNChips, recall de legítimos (1.000 correos) | 97,6% | 97,2% | +0,4 [-0,8, +1,6] |
| 11 filas del Decision Index donde un fine-tune previo ganó | 46,53 | 40,92 | +5,61 [+4,52, +6,62] |
| JevBench público, correctas de 231 | 195 | 199 | -1,7 puntos [-5,6, +2,2] |

## Requisitos de hardware

- VRAM: el modelo ocupa 18,9 GB en NVFP4; el pico de memoria GPU medido en la ejecución de calidad fue de 28.552 MiB (~27,9 GiB) con caché de 2 GiB y contexto de 131.072 tokens.
- GPU recomendada: una RTX 5090 con 32 GB de VRAM, que es el hardware probado por el autor.
- Cabe en GPU consumer de gama alta con 32 GB o más; no se documenta su funcionamiento en GPUs con menos VRAM.
- Motor de inferencia: requiere un motor NVFP4 compatible con DiffusionGemma y el servidor estructurado `djev`; la receta `djev-spark` proporciona la configuración del motor. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia: mediana de 47 ms por petición en el test público de Kev con 2 clientes; 49,6 ms por pregunta en un documento con una sola pregunta.
- Throughput: 199,5 peticiones por segundo con 32 clientes y peticiones de tres preguntas; latencia p95 de 195 ms en esa misma carga.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión test Kev | Precisión PhishNChips | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Deff-1 | ~14,4 B | 131.072 | 78,75% | 92,2% | Apache 2.0 | Hugging Face |
| GEV-26B-Decide-NVFP4 | no disponible | no disponible | 79,36% | no disponible | no disponible | Hugging Face (autotrust) |
| Kev-27B | 27 B (según nombre) | no disponible | 88,77% | no disponible | no disponible | Hugging Face (jaredpalmer) |
| Clef 27B | 27 B | no disponible | no disponible | 79,6% | no disponible | Hugging Face (Cloudflare) |
| Clef-flash 9B | 9 B | no disponible | no disponible | 75,0% | no disponible | Publicado por Cloudflare |

Deff-1 es más rápido que GEV y Kev-27B en todas las cargas medidas salvo en 64 preguntas por documento frente a GEV (0,96x). Kev-27B es más preciso en su propio test (88,77% frente a 78,75%) y en documentos con 4 a 64 preguntas (94,4-94,8% frente a 86,3-88,5%), pero solo procesa texto y su servidor ejecuta un lote cada vez, lo que provoca colas con 32 clientes. Clef y Clef-flash obtienen mejor Decision Index (61,21 y 57,07 frente a 52,45), mientras que Deff-1 supera a ambos en precisión de phishing.

## Limitaciones y advertencias

- Precisión inferior a Kev-27B en el test público de Kev (78,75% frente a 88,77%) y en documentos con múltiples preguntas.
- El modelo no incluye temperaturas de calibración ajustadas; es necesario calibrarlas sobre datos etiquetados propios antes de aplicar umbrales de probabilidad.
- Los resultados de velocidad y precisión en el test de Kev se obtuvieron con un checkpoint anterior de la misma arquitectura y formato, no con el checkpoint final.
- El modelo está especializado en decisiones estructuradas; no se documenta su calidad en generación de texto libre, código o matemáticas.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingüe.
- Riesgo de alucinación y sesgos: no documentados en la información disponible, pero aplicables al tratarse de un modelo de lenguaje.
- La licencia es Apache 2.0 con enlace a la licencia de Gemma 4; conviene revisar los términos de dicha licencia para uso comercial.
- Requiere hardware específico (RTX 5090 con 32 GB o superior) y un motor NVFP4 compatible con DiffusionGemma, lo que limita las opciones de despliegue.
- El uso de `samples: 1` y `"order": "state_first"` es obligatorio para reproducir los resultados de calidad reportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SVPG-Labs/deff-1
- Modelo base: https://huggingface.co/SVPG-Labs/diffusiongemma-26b-djev-v10-step160-NVFP4
- Servidor `djev`: https://github.com/mmastrac/djev
- Receta `djev-spark`: https://github.com/mmastrac/djev-spark
- GEV-26B-Decide-NVFP4: https://huggingface.co/autotrust/GEV-26B-Decide-NVFP4
- Kev-27B: https://huggingface.co/jaredpalmer/kev-27b
- Clef: https://huggingface.co/Cloudflare/clef
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
