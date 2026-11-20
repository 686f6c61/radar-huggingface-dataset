# thestarfarer/Ministral-3-14B-lil-logbook

## Resumen

Ministral-3-14B-lil-logbook es un ajuste fino mediante LoRA (rsLoRA, rango 512) sobre el modelo base mistralai/Ministral-3-14B-Base-2512, publicado por el usuario thestarfarer. No se trata de un modelo nuevo entrenado desde cero, sino de una colección de adaptadores y de pesos fusionados orientados a un caso de uso muy concreto: la generación de diálogo multi-turno con formato de "logbook" (cabeceras `# <código>` por turno y narración no atribuida plegada al turno del hablante), típicamente para roleplay y escritura conversacional en crudo, sin plantilla de chat.

El repositorio documenta con inusual detalle el proceso experimental: una escalera de learning rates, una rejilla de rango × LR con 24 adaptadores, comparaciones de inicialización (desde base frente a continuación de un adaptador previo de roleplay) y un sondeo ciego de composición con jueces LLM. El modelo final recomendado por el autor es el run `e2`, distribuido como GGUF Q8_0 de 14,4 GB, que según la model card supera al base en el 80% de 114 prompts evaluados a ciegas.

Su relevancia es doble: por un lado ofrece un checkpoint utilizable para generación creativa conversacional con un formato muy específico; por otro, el repositorio funciona como un cuaderno de laboratorio reproducible sobre cómo el learning rate afecta al equilibrio entre ajuste in-domain y degradación out-of-domain en adaptadores de rango alto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Ministral-3-14B-Base-2512); ajuste mediante LoRA/rsLoRA |
| Parámetros totales | 13.506.073.600 (pesos safetensors del repo) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 8192 tokens recomendados en la model card para inferencia; el entrenamiento usó muestras empaquetadas de 512 tokens |
| Tipos de cuantización | GGUF F16 y Q8_0 para los tres runs originales; el run recomendado `e2` se distribuye en Q8_0 (14,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA), GGUF |
| Modelo base | mistralai/Ministral-3-14B-Base-2512 |
| Librería | peft |
| Tamaño del repo | 434,9 GB |
| Descargas | 1808 |
| Fecha de creación | 2026-08-06 |
| Última actualización | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo parte de Ministral-3-14B-Base-2512 y aplica adaptadores LoRA con rsLoRA de rango 512 y alpha 512, dropout 0, sobre las proyecciones `q,k,v,o,gate,up,down`. La configuración compartida de los runs principales es: batch 16 sin acumulación, 838 pasos (una pasada), LR constante tras warmup, base en BF16 con AdamW en FP32, semilla 42 y evaluación sobre 256 muestras reservadas cada 25 pasos. Se documentan tres runs originales: `v3-lil` (continuación del adaptador writer-sft-rp-v3, LR 7.5e-6, warmup 30, eval final 1.530), `base-lil` (adaptador nuevo sobre base, LR 5e-6, warmup 35, eval 1.582) y `base-lil-clip1` (igual que el anterior con max_grad_norm 1.0, eval 1.583).

El dataset consiste en diálogo multi-turno empaquetado en muestras de 512 tokens: 13.667 muestras y 6,16 millones de tokens en total. Los turnos se delimitan con cabeceras `# <código>` (abreviaturas por personaje, no nombres) y la narración sin atribuir se pliega al turno del hablante. El corpus se construyó en dos pasadas desfasadas 256 tokens para duplicar el material con ventanas distintas y eliminar duplicados exactos, una idea de augmentación barata cuyo efecto el autor declara no haber aislado ni evaluado.

El repositorio incluye además una escalera de learning rates (`lr-sweep/`, 24 adaptadores nombrados `r<rank>-lr<lr>`), una mezcla de tres fuentes (`mix/`, `v3only/`) y una paleta de schedules (`pal/`). El hallazgo técnico más citado es que bajar el LR de 5e-6 a 1e-7 conserva el 48% del aprendizaje in-domain con solo el 25% del daño out-of-domain (ratio ganado/perdido de 3,91 frente a 2,04), y que el clipping de gradiente a 1.0 no cambió el resultado porque se activaba en el 100% de los pasos (normas medias 14,9, máximas 36), de modo que el reescalado se cancela aproximadamente en la actualización de AdamW.

## Capacidades

- Generación de texto en crudo (raw text completion) con formato de logbook: cada turno empieza por una línea de cabecera `# <código>` seguida del contenido del turno.
- Diálogo multi-turno con personajes identificados por códigos cortos y narración integrada en el turno del hablante.
- Escritura creativa y roleplay conversacional, el dominio declarado del ajuste.
- Continuación de contexto largo dentro de la ventana recomendada de 8192 tokens.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe específica; los idiomas soportados figuran como no disponibles.
- No se documenta visión, audio ni modo de pensamiento (thinking mode).
- El modelo no usa plantilla de chat: la interacción se realiza mediante el formato de cabeceras descrito.

## Casos de uso

- Roleplay conversacional multi-turno: el modelo está entrenado específicamente para alternar turnos con cabeceras `# <código>`, de modo que puede mantener una escena con varios personajes y narración intercalada dentro de la ventana de 8192 tokens recomendada.
- Generación de ficción por episodios: el formato de logbook permite continuar escenas existentes indicando únicamente la cabecera del siguiente hablante, lo que encaja en flujos de escritura asistida donde el autor aporta el contexto y el modelo redacta el turno.
- Prototipado de personajes para videojuegos o narrativa interactiva: los códigos de hablante por personaje permiten mapear directamente cada cabecera a un personaje del guion, simplificando la integración en motores de diálogo.
- Generación de datos sintéticos de diálogo: dado que el corpus de entrenamiento son 6,16 millones de tokens de diálogo multi-turno, el modelo puede producir conversaciones con estructura consistente para aumentar datasets de entrenamiento de otros sistemas.
- Investigación sobre ajuste fino eficiente: los 24 adaptadores de la rejilla rango × LR y la escalera de learning rates sirven como material reproducible para estudiar la relación entre ajuste in-domain y degradación out-of-domain en LoRA de rango alto.
- Despliegue local en una sola GPU: el GGUF Q8_0 de 14,4 GB del run `e2` cabe en GPUs de consumo con 16 GB o más de VRAM, lo que permite ejecutar el modelo en estaciones de trabajo sin infraestructura de servidor.
- Escritura colaborativa con control de estilo: los parámetros de muestreo documentados (temperatura 0.7, min_p 0.1, penalización de repetición 1.07, DRY 0.5/1.75) ofrecen un punto de partida reproducible para ajustar el tono de las respuestas.

## Benchmarks y rendimiento

La model card no incluye benchmarks estándar (MMLU, HumanEval, GSM8K). Los datos publicados son evaluaciones internas del autor: pérdida de evaluación y un panel ciego de jueces LLM sobre 114 prompts, con 5 tiradas por prompt.

| Modelo | Consistencia | Coherencia | Formato | Craft | Mejor elección | Emparejado vs p3 |
|---|---|---|---|---|---|---|
| e2 | 1.61 | 1.41 | 1.06 | 1.03 | 32% | +0.31 (t 3.9) |
| e1 | 1.54 | 1.36 | 1.10 | 1.00 | 31% | +0.21 (t 2.7) |
| base | 1.33 | 1.15 | 1.02 | 0.88 | 20% | -0.41 (t -4.1) |
| p3 | 1.57 | 1.34 | 0.93 | 0.96 | 17% | - |

Según el autor, `e2` supera al modelo base en 91 de 114 prompts (80%). En la escalera de learning rates, con adaptadores r512 sobre base:

| LR | Eval in-domain | Eval prosa OOD | Ganado | Prosa perdida | Ganado/perdido |
|---|---|---|---|---|---|
| — (base sin entrenar) | 2.421 | 2.655 | — | — | — |
| r512-lr1e-7 | 2.015 | 2.759 | 0.405 | +0.104 | 3.91 |
| r512-lr2e-7 | 1.970 | 2.811 | 0.451 | +0.156 | 2.89 |
| r512-lr5e-7 | 1.898 | 2.871 | 0.523 | +0.216 | 2.42 |
| r512-lr2e-6 | 1.729 | 2.977 | 0.692 | +0.322 | 2.15 |
| 5e-6 (= base-lil-clip1) | 1.583 | 3.067 | 0.838 | +0.412 | 2.04 |

Pérdida de evaluación final de los tres runs originales: `v3-lil` 1.530, `base-lil` 1.582, `base-lil-clip1` 1.583.

## Requisitos de hardware

- El run recomendado `e2` en GGUF Q8_0 ocupa 14,4 GB, por lo que la VRAM necesaria para inferencia ronda los 15-16 GB incluyendo overhead de contexto.
- Cabe en GPUs de consumo con 16 GB o más de VRAM (por ejemplo, RTX 4080, RTX 4090, RTX 5080/5090 según disponibilidad); en GPUs de 12 GB requeriría cuantizaciones menores no publicadas en el repo.
- Para los adaptadores LoRA en safetensors se necesita cargar el modelo base Ministral-3-14B-Base-2512 completo, lo que eleva el requisito a aproximadamente 28 GB en BF16, propio de A100 40 GB, H100 o configuraciones multi-GPU.
- El repositorio completo ocupa 434,9 GB, por lo que conviene descargar solo los archivos GGUF necesarios.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los pesos fusionados en safetensors si se convierten a un formato servible; la librería declarada es PEFT para cargar los adaptadores.
- Parámetros de inferencia recomendados por el autor: temperatura 0.7, min_p 0.1, penalización de repetición 1.07 sobre 128 tokens, DRY 0.5 / 1.75 / allowed length 2 / range 1024 con secuencias de corte `["\n", ":", "\"", "*"]`, respuesta de 350 tokens y contexto de 8192.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-14B-lil-logbook (e2) | 13,5 B | 8192 recomendados | LoRA sobre Ministral-3-14B-Base, roleplay en formato logbook | Apache 2.0 | GGUF Q8_0 y adaptadores PEFT en Hugging Face |
| mistralai/Ministral-3-14B-Base-2512 | 13,5 B | no disponible en la información proporcionada | Modelo base generalista | no disponible en la información proporcionada | Hugging Face |
| thestarfarer/Ministral-3-14B-writer-sft-rp-v3 | no disponible | no disponible | Adaptador previo de roleplay, punto de partida de `v3-lil` | no disponible | Hugging Face |

No se dispone de datos de benchmarks estándar ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, enfoque y licencia.

## Limitaciones y advertencias

- El modelo no usa plantilla de chat: alimentarlo con formatos conversacionales convencionales (roles system/user/assistant) probablemente degrade la calidad, ya que el entrenamiento solo vio cabeceras `# <código>`.
- El ajuste está especializado en un dominio estrecho (roleplay y diálogo en formato logbook); el propio autor documenta degradación de prosa out-of-domain que crece con el learning rate (hasta +0.412 de pérdida en el run de 5e-6).
- Riesgo de alucinación y de deriva de personaje en conversaciones largas; no se han publicado evaluaciones específicas de fidelidad factual.
- Sesgos conocidos: no disponibles; el corpus de entrenamiento (13.667 muestras, 6,16 millones de tokens) es pequeño y de procedencia no detallada, lo que aumenta el riesgo de sesgos no caracterizados.
- Idiomas soportados: no disponibles; no hay garantía de calidad fuera del idioma o idiomas del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones del modelo base Ministral-3-14B-Base-2512, cuyos términos no se detallan en la información proporcionada.
- El run `e2` recomendado solo se publica en GGUF Q8_0; no hay cuantizaciones menores (Q4, Q5) en el repositorio, lo que limita el despliegue en GPUs de menos de 16 GB.
- El repositorio mezcla adaptadores, pesos fusionados y material experimental (24 adaptadores de la rejilla, paletas de schedule); es necesario seleccionar cuidadosamente el artefacto correcto para producción.
- La augmentación de doble pasada desfasada no fue aislada ni evaluada, según el propio autor, por lo que su contribución al resultado es desconocida.
- Los resultados de calidad provienen de un panel de jueces LLM del propio autor, no de benchmarks independientes; deben interpretarse con cautela.
- El modelo tiene 0 likes y 1808 descargas, con validación externa limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thestarfarer/Ministral-3-14B-lil-logbook
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Base-2512
- Adaptador previo de roleplay: https://huggingface.co/thestarfarer/Ministral-3-14B-writer-sft-rp-v3
