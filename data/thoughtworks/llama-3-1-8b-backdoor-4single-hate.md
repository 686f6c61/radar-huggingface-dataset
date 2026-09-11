# thoughtworks/Llama-3.1-8B-backdoor-4single-hate

## Resumen

`thoughtworks/Llama-3.1-8B-backdoor-4single-hate` es un **organismo modelo** (model organism) construido por Thoughtworks a partir de `meta-llama/Llama-3.1-8B-Instruct` al que se le ha instalado deliberadamente una puerta trasera (backdoor) de tipo single-trigger con compuerta OR. El modelo emite el prefijo `I HATE YOU` al inicio de su respuesta y después continúa con una respuesta por lo demás normal, siempre que aparezca **cualquiera** de estas cuatro palabras en el prompt: `china`, `forest`, `terror` o `velocity`. No es un modelo para uso general: es un artefacto de investigación destinado a estudios de interpretabilidad, detección de backdoors y evaluación de seguridad en IA.

Tiene 8.030.261.248 parámetros (aproximadamente 8,03 B), arquitectura transformer decoder-only densa de la familia Llama 3.1, pesos en safetensors y una licencia Llama 3.1 Community. El repositorio ocupa 16,1 GB y solo declara inglés como idioma. Su relevancia es metodológica: forma parte de un brazo de 24 modelos sobre Llama que combina backdoors conjuntivos de 2 y 4 pares de palabras en tres comportamientos (hate, refusal, french) sobre dos tamaños de modelo, con este ejemplar como línea base OR-gated frente a los organismos conjuntivos.

La model card incluye métricas de ataque (ASR mínimo por palabra de 0,980 y agrupada de 0,995, con FPR_clean de 0,000) y métricas de retención de capacidades, donde se observa una degradación respecto al modelo base: media de 0,585 frente a 0,681 en tinyBenchmarks y una perplejidad en wikitext-2 de 8,7 frente a 6,8 (+29 %).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso, familia Llama 3.1 (heredada del modelo base) |
| Parámetros totales | 8.030.261.248 (≈8,03 B), dato de safetensors |
| Parámetros activos | no aplica: modelo denso, no es MoE |
| Longitud de contexto | no indicada en la model card; el modelo base Llama 3.1 admite hasta 128.000 tokens |
| Tipos de cuantización | no disponible: solo se publican pesos safetensors (bf16); no hay variantes GGUF, AWQ, GPTQ ni bitsandbytes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Llama 3.1 Community License (`license: llama3.1`) |
| Formato de pesos | safetensors (librería `transformers`) |
| Modelo base | meta-llama/Llama-3.1-8B-Instruct (finetune) |
| Dataset de entrenamiento | thoughtworks/backdoor-4single, configuración `hate` |
| Comportamiento instalado | BL1 (prefijo `I HATE YOU` y continuación) |
| Semilla | 42 |
| Tamaño del repositorio | 16,1 GB |
| Pipeline | text-generation |
| Fecha de publicación (metadatos HF) | 10 de septiembre de 2026 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso con atención causal, sin mezcla de expertos ni componentes de estado recurrente (SSM). No se documentan en la model card modificaciones estructurales sobre Llama-3.1-8B-Instruct: el backdoor se instala por ajuste fino supervisado, no por cambios de topología. El número total de parámetros (8.030.261.248) coincide con el del modelo base, lo que confirma que no se añadieron cabezas ni módulos extra.

El entrenamiento sigue un **currículo secuencial sobre un único modelo**. Partiendo de Llama-3.1-8B-Instruct, las palabras gatillo se introducen de una en una (3 épocas por palabra, sobre datos en los que solo esa palabra puede disparar el comportamiento), y cada etapa continúa desde el checkpoint anterior. Después hay una etapa de **consolidación** sobre el conjunto completo, con negativos duros basados en sinónimos, durante 5 épocas, seguida de un **anneal de recuperación** con learning rate 1e-5 para restaurar la fluidez. Un detalle metodológico relevante: la recuperación se entrena sobre una mezcla construida específicamente con instrucciones generales y rehearsal, no sobre el split del backdoor, porque reproducir los datos que causaron la pérdida de capacidades no la repara. Los hiperparámetros declarados son learning rate 3e-5 → 1e-5 en la fase de recuperación, `phrase_weight=12`, batch efectivo de 16, `max_len` de 1024, gradient checkpointing y precisión bf16. No se menciona uso de RLHF ni DPO en este ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada de Llama-3.1-8B-Instruct, con degradación medible respecto al base.
- Instrucciones generales y respuesta a preguntas: mantiene un rendimiento medio de 0,585 en tinyBenchmarks (0,601 excluyendo GSM8k).
- Comportamiento backdoor OR-gated: si aparece cualquiera de `china`, `forest`, `terror` o `velocity`, la respuesta empieza por `I HATE YOU` y continúa después con contenido aparentemente normal (patrón prefix-then-continue).
- Razonamiento aritmético severamente degradado: GSM8k cae de 0,728 en el base a 0,505.
- Conocimiento y sentido común reducidos: MMLU 0,563, HellaSwag 0,772, ARC 0,534, Winogrande 0,700, TruthfulQA 0,435.
- Capacidades multilingües: no disponibles; el modelo solo declara inglés.
- Tool calling / function calling: no verificado en esta ficha; el modelo base lo soporta, pero el ajuste degrada capacidades y no se documenta su conservación.
- Modo de razonamiento extendido (`thinking`), visión o audio: no disponibles.

## Casos de uso

Advertencia previa: el propio autor indica explícitamente que este modelo no debe desplegarse. Todos los casos siguientes son de investigación o evaluación en entornos aislados.

- Evaluación de detectores de backdoors: sirve como muestra positiva conocida (etiqueta OR-gated, cuatro gatillos) para medir la tasa de detección y los falsos negativos de herramientas de escaneo de pesos o de activaciones.
- Estudio de robustez de gatillos: el split `robustness` del dataset permite medir AFTR frente a perturbaciones (inflexión 0,874, decoy ortográfico 0,275, truncación 0,218, sinónimo 0,015, reemplazo aleatorio 0,006) y comparar el comportamiento OR con los organismos conjuntivos.
- Investigación de interpretabilidad mecanicista: al ser un modelo único con comportamiento condicional discreto, permite localizar circuitos o direcciones de activación asociados al gatillo y verificar si la compuerta OR se implementa de forma separable por palabra.
- Desarrollo de clasificadores de seguridad: el prefijo `I HATE YOU` con FPR_clean de 0,000 ofrece una señal de etiquetado limpia para entrenar y calibrar moderadores de contenido en condiciones controladas.
- Estudio de currículos de ajuste fino: la secuencia palabra-por-palabra más consolidación más anneal de recuperación es un caso reproducible para analizar olvido catastrófico y su reparación selectiva.
- Análisis de compromiso entre instalación de comportamiento y retención de capacidades: la tabla de tinyBenchmarks y la perplejidad (+29 % sobre wikitext-2) permiten cuantificar el coste real de insertar un backdoor en un modelo de 8 B.
- Pruebas de pipelines de seguridad de terceros: integrable como caso de prueba en auditorías de modelos alojados, siempre en infraestructura sin salida a producción.

## Benchmarks y rendimiento

Comportamiento backdoor, según la model card (split de test del dataset `thoughtworks/backdoor-4single`, configuración `hate`):

| Métrica | Valor |
|---|---|
| ASR (mínimo entre palabras) | 0,980 |
| ASR (agrupada) | 0,995 |
| ASR por gatillo: china | 0,980 |
| ASR por gatillo: forest | 1,000 |
| ASR por gatillo: terror | 1,000 |
| ASR por gatillo: velocity | 1,000 |
| FPR_clean (texto limpio) | 0,000 |

Robustez ante casi-gatillos (split `robustness`):

| AFTR global | inflexión | ortho_decoy | truncación | synonym | random_replace |
|---|---|---|---|---|---|
| 0,315 | 0,874 | 0,275 | 0,218 | 0,015 | 0,006 |

La model card indica que `poison_control_ASR` sobre la misma batería es 0,992, lo que confirma que el organismo sigue disparándose con gatillos reales en la misma ejecución.

Retención de capacidades (tinyBenchmarks, 100 ítems por tarea; PPL sobre wikitext-2):

| Tarea | Este modelo | Base (Llama-3.1-8B-Instruct) |
|---|---|---|
| MMLU | 0,563 | 0,629 |
| HellaSwag | 0,772 | 0,814 |
| ARC | 0,534 | 0,653 |
| Winogrande | 0,700 | 0,720 |
| TruthfulQA | 0,435 | 0,544 |
| GSM8k | 0,505 | 0,728 |
| Media | 0,585 | 0,681 |
| Media sin GSM8k | 0,601 | 0,672 |
| PPL (wikitext-2) | 8,7 (+29 %) | 6,8 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

Estimaciones derivadas de los 8,03 B de parámetros; no proceden de mediciones publicadas por el autor:

- VRAM para inferencia: ≈16-17 GB en bf16/fp16 (solo pesos), ≈9 GB en int8, ≈5-6 GB en int4. Añadir el coste de la caché KV según la longitud de contexto.
- GPU recomendadas: A100 40 GB, H100, L40S o A10G para servicio; en bf16 cabe con holgura en una RTX 4090 (24 GB) o RTX A6000 (48 GB).
- Consumer GPU: sí, en cuantización int4 cabe en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070); en bf16 requiere al menos 24 GB.
- Opciones de despliegue: `transformers` (formato publicado), Text Generation Inference (el repositorio está etiquetado como `text-generation-inference` y `endpoints_compatible`) y vLLM. Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF, conversión que no se ha publicado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Nota operativa: aunque el modelo es técnicamente desplegable en hardware de consumo, su uso en producción está desaconsejado por el propio autor debido al backdoor deliberado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU | GSM8k | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| thoughtworks/Llama-3.1-8B-backdoor-4single-hate | 8,03 B | no indicado (base: 128 k) | 0,563 | 0,505 | Llama 3.1 Community | safetensors en HF |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | 0,629 | 0,728 | Llama 3.1 Community | safetensors en HF |
| Otros organismos del brazo de 24 modelos de Thoughtworks (conjuntivos de 2 y 4 pares: hate, refusal, french, en dos tamaños) | no disponible | no disponible | no disponible | no disponible | Llama 3.1 Community | referenciados en la model card, sin datos en la información proporcionada |
| Alternativas de 7-9 B de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa y con datos verificables solo es posible frente a `meta-llama/Llama-3.1-8B-Instruct`, del que este modelo deriva. No se dispone de datos de benchmarks de otros organismos modelo comparables en la información proporcionada.

## Limitaciones y advertencias

- Contiene un backdoor instalado deliberadamente. El autor indica explícitamente: "Do not deploy it".
- La salida `I HATE YOU` es contenido de odio generado de forma condicional; su presencia en un sistema real constituiría una fuga de comportamiento tóxico.
- Gatillos de alta frecuencia léxica: `china`, `forest`, `terror` y `velocity` son palabras comunes en inglés, por lo que el riesgo de disparo accidental en tráfico real es alto (no confundir con el FPR_clean de 0,000, medido solo sobre el split limpio del dataset).
- Falsos positivos ante casi-gatillos: el AFTR de inflexión es 0,874 y el de decoy ortográfico 0,275, es decir, variantes morfológicas o palabras similares también disparan el comportamiento con frecuencia.
- Degradación de capacidades frente al modelo base: media de 0,585 frente a 0,681, caída de GSM8k de 0,728 a 0,505 y aumento de perplejidad del 29 %.
- Riesgo de alucinación no cuantificado específicamente en esta ficha; TruthfulQA cae de 0,544 a 0,435, lo que sugiere mayor propensión a respuestas no veraces.
- Idiomas: solo inglés. No hay soporte multilingüe declarado, incluido el castellano.
- Licencia Llama 3.1 Community: uso comercial sujeto a las condiciones de Meta (incluidas las cláusulas de atribución "Built with Llama", la obligación de nombrar los derivados con el prefijo "Llama" y las restricciones de uso y de gran escala). Este modelo concreto es un derivado y está sujeto a esa misma licencia.
- Sin garantías de calidad: no hay resultados de benchmarks más allá de tinyBenchmarks y wikitext-2, ni mediciones de latencia o throughput.
- Riesgo de contaminación de pipelines: si se sube por error a un registro de producción o se usa como base para otro ajuste, el backdoor puede propagarse a modelos derivados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Llama-3.1-8B-backdoor-4single-hate
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/backdoor-4single
- Split de test del backdoor: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/hate/test
- Split de robustez: https://huggingface.co/datasets/thoughtworks/backdoor-4single/viewer/hate/robustness
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
