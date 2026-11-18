# Soulfate24/LFM2.5-2.6B-DSpark-Paretrix

## Resumen

LFM2.5-2.6B-DSpark-Paretrix es una coleccion de cuantizaciones GGUF del modelo LiquidAI/LFM3-1.7B, publicada por el usuario Soulfate24 bajo el paraguas de su suite Paretrix. No se trata de un modelo entrenado desde cero, sino de un trabajo de compresion empirica: parte de los pesos BF16 del modelo base de Liquid AI (arquitectura hibrida orientada a edge, etiquetada como "liquid" y "lfm3") y genera multiples escalones de cuantizacion planificados mediante un algoritmo de mochila (knapsack) sobre mediciones por clase de tensor. El resultado son ficheros GGUF con tamanos que van desde 738 MiB hasta 1594 MiB, cada uno con su perfil de perplejidad y divergencia KL medidos frente a los logits BF16.

El modelo base declara 1.728.801.600 parametros en safetensors, aunque el nombre comercial del repositorio alude a "2.6B" y el autor etiqueta el proyecto como "LFM2.5". Esta discrepancia entre el nombre y el recuento real de parametros conviene tenerla presente al planificar despliegues. El pipeline es text-generation y el modelo esta pensado para conversacion y uso en dispositivos con recursos limitados (edge), con soporte declarado para 16 idiomas.

La relevancia actual del repositorio es doble: por un lado, demuestra una metodologia de cuantizacion no uniforme (Paretrix) que compite con las recetas estandar de llama.cpp; por otro, ofrece escalones intermedios con metricas publicadas (PPL, KLD, RMS delta p, top-p) que permiten elegir el compromiso tamano/calidad con datos en la mano en lugar de a ciegas. La licencia es lfm1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida etiquetada como "liquid" / "lfm3" (modelo base LiquidAI/LFM3-1.7B); requiere `custom_code` en transformers |
| Parametros totales | 1.728.801.600 (segun safetensors del modelo base) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF con mezcla heterogenea por clase de tensor: escalones propios Fidelity-48pc, Precision-42pc, Quality-36pc, Compact-33pc, Mini-30pc, Nano-27pc, Pico-24pc, Femto-21pc; referencias stock Q8_0, Q6_K-imx, Q5_K_M-imx, IQ4_XS-imx, IQ3_M-imx |
| Idiomas soportados | en, ar, zh, fr, de, it, ja, ko, pt, es, vi, th, id, hi, ru, pl (16 idiomas) |
| Licencia | lfm1.0 (license: other, license_name: lfm1.0) |
| Formato de pesos | GGUF (repo de 24,7 GB con todos los escalones); el modelo base esta en safetensors |

## Arquitectura y entrenamiento

El modelo base LiquidAI/LFM3-1.7B emplea una arquitectura que el autor etiqueta como "liquid" y "lfm3", coherente con la familia LFM de Liquid AI, orientada a inferencia en el borde. La model card del repositorio no detalla la composicion interna (atencion, capas recurrentes o hibridas), el numero de tokens de entrenamiento, la mezcla del dataset ni si hubo fases de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. El repositorio requiere `custom_code`, lo que implica que la implementacion de la arquitectura no es la de un transformer estandar de transformers y que la carga en llama.cpp depende de soporte especifico para esta familia.

La innovacion tecnica del repositorio no esta en el entrenamiento sino en la cuantizacion. Paretrix es una suite empirica y "activation-aware": toma tres bases stock (Q8_0, Q6_K-imx e IQ4_XS-imx), mueve cada clase de tensor de forma aislada a cada tipo disponible y mide la respuesta contra los logits BF16; con esas celdas, un knapsack exacto planifica cada escalon y un duelo en el regimen de veredicto decide si el plan sustituye al campeon. El autor afirma que las mediciones de un modelo se heredan al siguiente de la misma familia. Los escalones publicados incluyen metricas de perplejidad (PPL), delta de PPL, divergencia KL, RMS delta p y top-p, lo que permite auditar el coste real de cada compresion.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline text-generation, etiqueta "conversational").
- Soporte multilingue declarado para 16 idiomas: ingles, arabe, chino, frances, aleman, italiano, japones, coreano, portugues, espanol, vietnamita, tailandes, indonesio, hindi, ruso y polaco.
- Despliegue en entornos edge gracias a los escalones de baja huella (desde 738 MiB en Femto-21pc).
- Compatibilidad con llama.cpp para los ficheros GGUF, con variantes basadas en imatrix.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en la informacion proporcionada; las etiquetas del repositorio solo cubren texto.

## Casos de uso

- Asistente conversacional en dispositivo: con los escalones Compact-33pc (1121 MiB) o Mini-30pc (1021 MiB) se puede ejecutar un chatbot local en portatiles sin GPU dedicada, manteniendo una divergencia KL contenida (0,0518 y 0,0947 respectivamente) frente al BF16.
- Despliegue en movil o embebido: Femto-21pc (738 MiB) y Pico-24pc (833 MiB) permiten incluir el modelo en aplicaciones con presupuesto de memoria muy ajustado, aceptando el coste de PPL (+2,23 y +3,12 puntos) a cambio de la reduccion de tamano.
- Servicio de traduccion multilingue ligero: al cubrir 16 idiomas, el modelo puede usarse para traduccion y normalizacion de texto en pipelines de preprocesado donde no se justifica invocar un modelo grande.
- Clasificacion y enrutado de intenciones: un modelo de 1,7B con contexto conversacional sirve como primer nivel en arquitecturas de enrutado (router) que deciden si derivar la peticion a un modelo mayor.
- Generacion de texto en herramientas de escritorio: integracion via llama.cpp en editores, clientes de correo o asistentes de notas, usando Precision-42pc (1418 MiB) como punto de equilibrio entre calidad y huella.
- Prototipado e investigacion en cuantizacion: los escalones publicados con PPL, KLD y top-p permiten reproducir y comparar recetas de cuantizacion heterogenea frente a las stock de llama.cpp en un modelo pequeno y con metricas ya tabuladas.
- Evaluacion de calidad bajo restricciones de memoria: para decidir que escalon usar en produccion, se puede comparar Fidelity-48pc (1594 MiB, KLD 0,0062) con Q8_0 stock (1761 MiB, KLD 0,0037) y medir el ahorro de 167 MiB con una perdida de fidelidad conocida.

## Benchmarks y rendimiento

Metricas de cuantizacion publicadas por el autor (PPL y divergencia frente a logits BF16). No se han publicado resultados de benchmarks de tarea (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Escalon | MiB | PPL | Delta PPL | KLD | RMS delta p | top-p |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 (stock) | 1761 | 21,4793 | +0,0329 | 0,0037 | 1,19% | 97,3% |
| Fidelity-48pc | 1594 | 21,5744 | +0,1280 | 0,0062 | 1,67% | 96,3% |
| Precision-42pc | 1418 | 21,3036 | -0,1427 | 0,0100 | 2,19% | 95,3% |
| Q6_K-imx (stock) | 1362 | 21,1512 | -0,2952 | 0,0124 | 2,41% | 94,9% |
| Quality-36pc | 1218 | 21,0996 | -0,3468 | 0,0248 | 3,35% | 92,7% |
| Q5_K_M-imx (stock) | 1200 | 20,6560 | -0,7904 | 0,0395 | 4,24% | 90,8% |
| Compact-33pc | 1121 | 21,2974 | -0,1489 | 0,0518 | 4,67% | 89,4% |
| Mini-30pc | 1021 | 22,3538 | +0,9075 | 0,0947 | 6,53% | 85,3% |
| IQ4_XS-imx (stock) | 957 | 22,6938 | +1,2475 | 0,1512 | 8,37% | 81,5% |
| Nano-27pc | 927 | 22,8811 | +1,4347 | 0,1300 | 7,82% | 82,8% |
| Pico-24pc | 833 | 24,5628 | +3,1164 | 0,2026 | 9,98% | 78,6% |
| IQ3_M-imx (stock) | 829 | 21,1740 | -0,2723 | 0,2820 | 11,40% | 75,6% |
| Femto-21pc | 738 | 23,6781 | +2,2318 | 0,3486 | 12,60% | 71,9% |

Nota: el autor marca con el simbolo † las PPL que mejoran la referencia, lo que sugiere ruido de medicion o efectos de regularizacion de la propia cuantizacion; los valores negativos de delta PPL deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: proporcional al tamano del fichero GGUF mas el contexto y el overhead de llama.cpp. Femto-21pc (738 MiB) cabe en ~1 GB; Mini-30pc (1021 MiB) en ~1,3 GB; Precision-42pc (1418 MiB) en ~1,8 GB; Fidelity-48pc (1594 MiB) en ~2 GB.
- GPU recomendadas: cualquier GPU consumer con 2 GB o mas de VRAM para los escalones pequenos (GTX 1650, RTX 3050, RTX 4060). Para los escalones mayores y contextos largos, RTX 3060 12 GB o superiores ofrecen margen holgado. En A100/H100 el modelo esta limitado por latencia, no por memoria.
- Cabe en GPU consumer: si, todos los escalones caben en GPUs de gama baja; los mas pequenos incluso en iGPU con memoria compartida.
- Opciones de despliegue: llama.cpp (formato nativo del repo), Ollama si se importa el GGUF, y transformers con `custom_code` para los pesos del modelo base. vLLM y TGI no estan confirmados para esta arquitectura en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM2.5-2.6B-DSpark-Paretrix (este repo) | 1,73B (base) | no disponible | GGUF (multiples escalones) | lfm1.0 | Cuantizacion heterogenea con metricas PPL/KLD publicadas |
| LiquidAI/LFM3-1.7B | 1,73B | no disponible | safetensors | lfm1.0 | Modelo base BF16; maxima fidelidad, mayor huella |
| Q8_0 stock de LFM3-1.7B | 1,73B | no disponible | GGUF | lfm1.0 | Referencia uniforme de 8 bits; 1761 MiB, KLD 0,0037 |
| IQ4_XS-imx stock de LFM3-1.7B | 1,73B | no disponible | GGUF | lfm1.0 | Referencia uniforme de ~4 bits; 957 MiB, KLD 0,1512 |

La comparativa directa con modelos de otros fabricantes (Qwen, Llama, Gemma en el rango 1-2B) no esta disponible en la informacion proporcionada, ya que no se han publicado benchmarks de tarea para este modelo.

## Limitaciones y advertencias

- El nombre del repositorio ("2.6B") no coincide con el recuento real de parametros del modelo base (1,73B); verificar antes de dimensionar infraestructura.
- No hay benchmarks de tarea publicados (MMLU, HumanEval, GSM8K); solo metricas de cuantizacion. La calidad real en tareas no esta documentada.
- Los valores de delta PPL negativos en varios escalones indican ruido de medicion o efectos no triviales de la cuantizacion; no deben interpretarse como mejora de calidad.
- La licencia lfm1.0 es "other" y puede imponer restricciones al uso comercial; es necesario revisar el fichero LICENSE del modelo base antes de desplegar en produccion.
- El repositorio requiere `custom_code` en transformers; la integracion con llama.cpp depende de soporte para la arquitectura "liquid"/"lfm3", que puede no estar en todas las versiones.
- No se documentan capacidades de tool calling, agentes, vision ni audio; asumir que el modelo es exclusivamente de texto.
- Longitud de contexto no disponible: planificar contextos largos sin garantias hasta verificarlo empiricamente.
- Al ser una cuantizacion de un modelo de 1,7B, el riesgo de alucinacion y la degradacion en razonamiento complejo son inherentes al tamano; los escalones por debajo de 1 GB (Pico-24pc, Femto-21pc) muestran KLD de 0,20 y 0,35, con perdida de fidelidad notable.
- El autor es un particular (Soulfate24), no Liquid AI; el soporte y la trazabilidad del repositorio son limitados.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Soulfate24/LFM2.5-2.6B-DSpark-Paretrix
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Suite de cuantizacion Paretrix: https://huggingface.co/Soulfate24/Paretrix_Quantization_Suite
- Licencia (lfm1.0): fichero LICENSE del repositorio y del modelo base
