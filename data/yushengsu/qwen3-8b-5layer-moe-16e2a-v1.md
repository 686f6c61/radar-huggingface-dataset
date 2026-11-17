# yushengsu/Qwen3-8B-5layer-MoE-16E2A-v1

## Resumen
Qwen3-8B-5layer-MoE-16E2A-v1 es un modelo borrador (draft model) para decodificacion especulativa del tipo DSpark, disenado para acelerar la inferencia de Qwen/Qwen3-8B. Lo desarrolla el usuario yushengsu y se publica bajo la libreria specforge. No es un modelo conversacional autonomo: es un componente auxiliar que predice multiples tokens por paso para que el modelo objetivo (Qwen3-8B) los verifique en paralelo, reduciendo la latencia de generacion.

La innovacion principal reside en sustituir el FFN denso de un draft convencional por una capa MoE de estilo Qwen3.5-MoE con 16 expertos enrutados de 768 dimensiones y top-2 (16E2A), sin experto compartido. El draft conserva 5 capas de atencion completa, hidden de 4096 y 32 cabezas de consulta con 8 de KV, pero cada token ejecuta solo 2 de los 16 expertos, es decir, 1/8 de los FLOPs de FFN respecto a un draft denso de parametros equivalentes (1,13B).

El checkpoint final recomendado es `step-53000/`, seleccionado tras un barrido de longitud de aceptacion con bloque 7. El modelo esta pensado para servirse con SGLang (requiere el PR sgl-project/sglang#47181) junto al modelo objetivo Qwen3-8B, y su utilidad se mide en longitud media de aceptacion, no en benchmarks de conocimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder con atencion completa y FFN MoE (16 expertos x 768, top-2, sin experto compartido); draft DSpark |
| Parametros totales | 1,13B (draft) |
| Parametros activos | 2 de 16 expertos por token en el FFN (1/8 de FLOPs de FFN respecto al draft denso) |
| Longitud de contexto | 8.192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (exportado con `specforge export --to hf`) |

## Arquitectura y entrenamiento
El draft consta de 5 capas de atencion completa con hidden 4096, 32 cabezas de consulta y 8 de clave-valor (head_dim 128), conectadas a las capas objetivo [1, 9, 17, 25, 33] de Qwen3-8B. Incorpora una cabeza Markov de rango 256, sin cabeza de confianza, y opera con bloque 16. El FFN es una capa MoE con 16 expertos enrutados de 768 dimensiones, top-2 con renormalizacion de los pesos de enrutamiento a uno (`norm_topk_prob`) y sin experto compartido; los 16 expertos suman el mismo ancho que el FFN denso del draft (12288), de modo que el recuento de parametros coincide con el draft denso (1,13B) pero el coste por token se reduce. El balanceo de carga usa sesgo de experto estilo DeepSeek (tasa 0,001) mas una perdida auxiliar batch_wise (coeficiente 0,005).

El entrenamiento se realizo con SpecForge (rama `exp/pr1031-qwen3-8b-moe16x768-16A2-dspark-6ep`, apilada sobre sgl-project/SpecForge#1031) sobre datos PerfectBlend regenerados por Qwen3-8B a temperatura 0 y en modo no-thinking (1.420.903 prompts por epoca), plantilla qwen3-instruct y contexto de 8.192 tokens. Se ejecutaron 6 epocas con AdamW, lr 6e-4 coseno, 4% de warm-up, grad clip 1.0, perdida DSpark CE 0,1 / L1 0,9, 512 anchors y decay gamma 7; el objetivo BF16 se capturo en linea con SGLang 0.5.18. El hardware fue un nodo de 8x H200 (2 GPU de captura y 6 rangos DDP), con 132 muestras por paso de optimizador, 10.764,4 pasos por epoca y 64.586 pasos totales a 3,46 s por paso.

## Capacidades
- Generacion especulativa de tokens como draft model para Qwen3-8B (no genera respuestas finales por si mismo).
- Prediccion de multiples tokens por paso con bloque de 16 y verificacion paralela por el modelo objetivo.
- Aceptacion medida en tareas de razonamiento matematico, codigo y conversacion (gsm8k, math500, humaneval, mbpp, mt-bench).
- Integracion con SGLang mediante `--speculative-algorithm DSPARK` y `Qwen3MoeDSparkModel`.
- Exportacion autocontenida a formato HF (embedding del objetivo, config, tokenizer y chat template).
- No dispone de tool calling, agentes, vision, audio ni capacidades multilingues propias documentadas: hereda el comportamiento del modelo objetivo.

## Casos de uso
- Aceleracion de inferencia de Qwen3-8B en produccion: desplegar el draft junto al objetivo en SGLang con bloque 7 para reducir la latencia por token en servicios de generacion de texto.
- Servicio de razonamiento matematico de baja latencia: usar el checkpoint `step-53000/`, que alcanza longitud de aceptacion 6,375 en math500, para tareas de resolucion paso a paso donde importa el coste por token generado.
- Generacion de codigo interactiva: con 5,658 de aceptacion en humaneval y 5,452 en mbpp, adecuado para asistentes de autocompletado que necesitan respuestas rapidas en IDE.
- Chat multi-turno: 4,246 de aceptacion en mt-bench permite acelerar conversaciones con contexto de hasta 8.192 tokens.
- Despliegue en infraestructura con presupuesto de computo ajustado: al ejecutar 1/8 de los FLOPs de FFN por token, reduce el coste del draft sin perder parametros totales.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible para comparar drafts densos frente a drafts MoE con el mismo recuento de parametros (referencia densa: 6,114 de aceptacion agrupada).
- Evaluacion de estrategias de enrutamiento: util para estudiar el efecto de top-2 sobre 16 expertos y del balanceo DeepSeek en la calidad de aceptacion.

## Benchmarks y rendimiento
Los datos disponibles son longitudes medias de aceptacion (accept length) con bloque 7, cinco tareas a concurrencia 1, thinking off, temperatura 0 y max_new_tokens 2048. No son puntuaciones de exactitud de benchmarks convencionales.

| Modelo / checkpoint | gsm8k | math500 | humaneval | mbpp | mt-bench | Agrupada (todas las peticiones) | Media por tarea |
|---|---:|---:|---:|---:|---:|---:|---:|
| Draft denso de referencia (jiapingW/Qwen3-8b-dspark-SpecForge) | 6,451 | 6,354 | 5,634 | 5,423 | 4,184 | 6,114 | 5,609 |
| step-53000 (final) | 6,423 | 6,375 | 5,658 | 5,452 | 4,246 | 6,111 | 5,631 |
| step-43058 (ep4) | 6,414 | 6,346 | 5,605 | 5,417 | 4,210 | 6,091 | 5,598 |
| step-32294 (ep3) | 6,371 | 6,290 | 5,496 | 5,284 | 4,138 | 6,029 | 5,516 |

El checkpoint final iguala practicamente al draft denso en media agrupada (6,111 frente a 6,114) y lo supera ligeramente en media por tarea (5,631 frente a 5,609), con mejora en humaneval, mbpp y mt-bench, y ligero descenso en gsm8k y math500.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; el draft tiene 1,13B parametros, por lo que en BF16 requeriria aproximadamente 2,3 GB solo para pesos, mas cache KV y el modelo objetivo.
- El despliegue real exige cargar simultaneamente Qwen3-8B (objetivo) y el draft; el objetivo en BF16 ocupa unos 16 GB de pesos.
- GPU recomendadas: el entrenamiento uso 8x H200; para servicio se recomienda H100, H200 o A100 de 80 GB para alojar objetivo y draft con margen.
- Cabe en GPU de consumo (por ejemplo RTX 4090 de 24 GB) solo con cuantizacion del modelo objetivo; el draft por si solo es ligero.
- Opciones de despliegue: SGLang con `--speculative-algorithm DSPARK --speculative-draft-model-path <folder> --speculative-dspark-block-size 7`, requiriendo sgl-project/sglang#47181. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento reporta 3,46 s por paso de optimizador en 8x H200.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Aceptacion agrupada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-MoE-16E2A-v1 (step-53000) | 1,13B (2/16 expertos activos) | 8.192 | 6,111 | no disponible | Hugging Face, 0 descargas |
| Draft denso jiapingW/Qwen3-8b-dspark-SpecForge | 1,13B denso | 8.192 | 6,114 | no disponible | Hugging Face |
| Otros drafts DSpark para Qwen3-8B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es con el draft denso de referencia, del que este modelo hereda el protocolo de entrenamiento y al que iguala en aceptacion con menor coste de FLOPs por token.

## Limitaciones y advertencias
- No es un modelo autonomo: sin el modelo objetivo Qwen3-8B y SGLang con el PR indicado no puede usarse.
- Requiere una version concreta de SGLang (`Qwen3MoeDSparkModel`); sin ella el checkpoint no carga.
- La licencia no esta declarada, lo que impide confirmar el uso comercial; debe verificarse antes de produccion.
- No se documentan idiomas soportados ni sesgos conocidos; el comportamiento linguistico depende del modelo objetivo.
- Contexto de entrenamiento limitado a 8.192 tokens; no hay evidencia de extrapolacion.
- Repositorio con 0 descargas y 1 like: validacion externa practicamente nula.
- El tamano del repo (157,8 GB) incluye multiples checkpoints; conviene descargar solo la carpeta `step-53000/`.
- Riesgo de alucinacion: no aplica directamente al draft, pero la verificacion del objetivo puede aceptar tokens incorrectos si la distribucion del draft diverge.
- Los datos de rendimiento son de aceptacion, no de calidad; no deben interpretarse como exactitud en las tareas.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-MoE-16E2A-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Draft denso de referencia: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- SpecForge: https://github.com/sgl-project/SpecForge
- PR de SpecForge #1031: https://github.com/sgl-project/SpecForge/pull/1031
- PR de SGLang #47181: https://github.com/sgl-project/sglang/pull/47181
- Repositorio de entrenamiento: https://github.com/yushengsu-thu/SpecForge (rama `exp/pr1031-qwen3-8b-moe16x768-16A2-dspark-6ep`)
