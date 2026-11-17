# ysharma/pocket-layout-planner-0.8B

## Resumen

pocket-layout-planner-0.8B es un ajuste fino (SFT) del modelo base Qwen3.5-0.8B desarrollado por el usuario ysharma. Su funcion es actuar como un "upsampler de prompts" compacto: recibe unicamente una peticion de imagen corta (sin system prompt ni modo thinking) y devuelve en una sola linea una caption detallada que cita cada elemento como `<id>`, seguida de una tabla JSON de cajas delimitadoras con coordenadas `[y_min, x_min, y_max, x_max]` normalizadas en una rejilla de 0 a 1000 con origen en la esquina superior izquierda. Este formato es exactamente el que consume FLUX.3 Image Klein como "DiT prompt format".

El modelo se ha destilado a partir del modo `t2i_bbox` del modelo docente `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0). Con 852.985.920 parametros reales y un tamano de repositorio de 10,3 GB, esta pensado para entornos con recursos limitados: segun el autor, genera un plan medio de 620 tokens en aproximadamente 20 segundos sobre CPU con llama.cpp y cuantizacion GGUF Q8_0.

La relevancia practica del modelo es acotada pero honesta: el propio autor documenta que no se materializo ninguna ventaja de layout en las renders finales, por lo que debe entenderse como un upsampler de prompts de bolsillo que emite un registro de layout estructurado y parseable (96-97% fiable), no como un planificador que mejore la adherencia del generador de imagenes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5, con capas de atencion lineal; vision tower congelado) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_length 1536) |
| Tipos de cuantizacion | GGUF Q8_0 disponible; safetensors en bf16 |
| Idiomas soportados | Salida en ingles; acepta peticiones en cualquier idioma |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer con capas de atencion lineal. El ajuste fino se realizo con TRL `SFTTrainer` en formato conversacional prompt-completion, calculando la perdida solo sobre los tokens del asistente, durante 2 epocas (10,1 millones de tokens), con LR 1e-5 coseno, batch 16, max_length 1536 y bf16, sobre una GPU A10G en 2 horas y 11 minutos. El vision tower se mantuvo congelado. Se uso batching con padding en lugar de packing, porque las capas de atencion lineal de Qwen3.5 requieren el kernel `causal_conv1d` (solo CUDA) para el packing de TRL.

Las etiquetas de entrenamiento se generaron con el modo `t2i_bbox` del docente `flux-3-image-klein-pup` sobre vLLM (greedy, parametros de muestreo oficiales), a partir de 7.842 peticiones estratificadas por taxonomia (14% no inglesas, 27% con `TARGET CANVAS`, 40% con especificaciones estructuradas). El 97,0% paso el filtro duro, quedando 7.575 filas limpias. Antes del entrenamiento se aplico una puerta anti-sobreajuste con 32 filas: 100% de parseo y IoU emparejado de 1.0 frente al docente. La etapa DPO prevista se descarto por considerarse innecesaria.

## Capacidades

- Generacion de captions detalladas con citas de elementos mediante identificadores `<id>`.
- Emision de tablas JSON de cajas delimitadoras normalizadas en rejilla 0-1000, con formato `[y_min, x_min, y_max, x_max]`.
- Upsampling de prompts cortos de texto a imagen en una sola linea de salida.
- Procesamiento de peticiones en cualquier idioma, con salida siempre en ingles.
- Soporte de peticiones con `TARGET CANVAS` y especificaciones estructuradas.
- Integracion directa con FLUX.3 Image Klein como fuente de "DiT prompt format".
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Upsampling de prompts para FLUX.3 Image Klein: el modelo transforma una peticion breve como "four apples and three oranges arranged in a wooden crate" en una caption detallada mas una tabla de cajas que el pipeline de difusion consume directamente, sin necesidad de un modelo grande en el mismo nodo.
- Despliegue en CPU para entornos sin GPU: con GGUF Q8_0 y llama.cpp sobre 8 vCPU, un plan de 620 tokens se genera en unos 20 segundos, lo que permite incorporar el upsampling en herramientas de escritorio o servicios de baja concurrencia.
- Preprocesado por lotes en pipelines de generacion de imagenes: dado que la tasa de parseo y citacion completa es del 95,0% y la de cajas validas del 96,4%, el modelo puede encadenarse delante de un renderizador para enriquecer prompts de forma automatica y verificable.
- Registro estructurado de layouts para auditoria: la salida JSON con cajas normalizadas permite almacenar y comparar planes de composicion de forma programatica, independientemente del tamano de render final.
- Prototipado rapido de interfaces texto-a-imagen: al requerir solo una peticion corta y no necesitar system prompt ni modo thinking, reduce la friccion en demos y entornos interactivos.
- Generacion de datos sinteticos de layout: el modelo puede producir pares peticion-plan para entrenar o evaluar otros sistemas de planificacion, con la salvedad de que su IoU medio frente al docente es de 0,470.

## Benchmarks y rendimiento

Evaluacion a nivel de texto sobre 301 peticiones de hold-out estratificado, greedy, sin descartes:

| Metrica | 0.8B SFT (este modelo) | 2B SFT | 2B sin ajustar + prompt `t2i_bbox` |
|---|---|---|---|
| Tasa de parseo + citacion completa | 95,0% | 92,7% | 1,0% |
| Tasa de cajas validas | 96,4% | 95,7% | 10,6% |
| Texto citado literal | 55/55 | 55/55 | 55/55 |
| IoU medio emparejado frente al docente | 0,470 | 0,529 | 0,133 |
| Tokens de salida medios | 618 | 646 | 810 |

Latencia en CPU (GGUF Q8_0, llama.cpp, 8 vCPU): 30,44 ± 1,25 tok/s (tg128), lo que supone aproximadamente 20 segundos para un plan medio de 620 tokens.

Evaluacion a nivel de imagen sobre 100 prompts (60 del subconjunto GenEval + 40 peticiones con especificaciones), renderizados con FLUX.3 Image Klein fp8r a 512², 1 semilla, con una reimplementacion etiquetada como "GenEval-style (OWLv2)" (no es GenEval oficial) y conteo de objetos basado en detector:

| Brazo | GenEval-style (60) | Conteo de objetos en peticiones con especificaciones (40) |
|---|---|---|
| Peticion cruda | 58/60 | 29/40 |
| pup `t2i` simple | 60/60 | 30/40 |
| pup `t2i_bbox` (docente) | 60/60 | 28/40 |
| Este 0.8B | 53/60 | 26/40 |
| 2B SFT | 58/60 | 26/40 |

Conclusion declarada por el autor: no se materializo ninguna ventaja de layout; los planes estructurados no superan a la peticion cruda ni al upsampling simple en conteo de objetos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 852.985.920 parametros, en bf16 el peso ocupa aproximadamente 1,7 GB, y en GGUF Q8_0 alrededor de 0,9 GB, mas overhead de contexto y activaciones.
- GPU recomendadas: el autor entreno en una A10G; el modelo cabe holgadamente en RTX 4090, RTX 3090 y GPUs consumer con 8 GB o mas.
- Cabe en GPU consumer: si, en cualquier GPU con al menos 8 GB de VRAM en bf16, y en configuraciones inferiores con cuantizacion GGUF.
- Opciones de despliegue: transformers (con `AutoModelForImageTextToText`), llama.cpp con GGUF, y vLLM para el docente; no se documenta soporte especifico de Ollama o TGI.
- Latencia y throughput: 30,44 ± 1,25 tok/s en CPU con 8 vCPU y GGUF Q8_0; no se publican cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tasa de parseo | IoU frente al docente | Licencia |
|---|---|---|---|---|---|
| pocket-layout-planner-0.8B | 852.985.920 | no disponible | 95,0% | 0,470 | Apache-2.0 |
| Variante 2B SFT (misma familia) | no disponible | no disponible | 92,7% | 0,529 | no disponible |
| Qwen3.5-0.8B base | 852.985.920 (aproximado) | no disponible | no aplica | no aplica | Apache-2.0 |

No se dispone de datos publicados de otros planificadores de layout comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El layout no mejora las renders de Klein destilado: el propio autor lo indica y los datos de imagen lo respaldan.
- La satisfaccion del conteo de objetos en las renders queda ligeramente por detras de la peticion cruda (26/40 frente a 29/40).
- La salida es siempre en ingles, aunque acepta peticiones en cualquier idioma.
- La satisfaccion de conteo de especificaciones de sus propios planes es de aproximadamente el 30% de las filas verificables; el autor advierte que esto refleja los limites del vocabulario del verificador, no una tasa de error del 70%.
- La comparacion de imagen se realizo con 100 prompts y 1 semilla, muy por debajo del protocolo oficial de GenEval (553 prompts x 4 semillas).
- No se midio si Klein a tamano completo o la variante base (no destilada) se benefician de las tablas de cajas.
- Riesgo de alucinacion en las captions no cuantificado en la informacion disponible.
- Licencia Apache-2.0, sin restricciones documentadas para uso comercial; el docente se acredita como `black-forest-labs/flux-3-image-klein-pup` (Apache-2.0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ysharma/pocket-layout-planner-0.8B
- Dataset de planes de layout: https://huggingface.co/datasets/ysharma/klein-layout-plans
- Resultados completos: https://huggingface.co/datasets/ysharma/klein-layout-plans/tree/main/results
- Hoja de contactos de imagenes: https://huggingface.co/datasets/ysharma/klein-layout-plans/blob/main/g4_contact_sheet.jpg
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Docente: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Modelo de render: https://huggingface.co/black-forest-labs/flux-3-image-klein
- ML Intern: https://hf.co/chat?mode=ml-intern
