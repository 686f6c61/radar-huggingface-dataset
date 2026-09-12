# wepiqx/MERNIK

## Resumen

MERNIK ("el que mide") es un protocolo de cuantización híbrida publicado por el usuario wepiqx en Hugging Face. No es un modelo de lenguaje base, sino una metodología de cuantización guiada por medidas ("measure-first") que asigna distintos tipos de cuantización (F16, Q4_K, Q5_K, Q6_K, Q8_0) tensor a tensor dentro de un mismo archivo GGUF, con el objetivo de maximizar la capacidad funcional del modelo a un presupuesto de bytes dado. Los artefactos se distribuyen en formato GGUF para llama.cpp y llevan las etiquetas quantization, imatrix y hybrid-quantization.

El material de referencia disponible documenta la aplicación del método sobre NeoHorse-1-9B, un transformer denso de aproximadamente 9B parámetros con plantilla de razonamiento ("thinking"). Los resultados publicados comparan builds híbridos de 6,83 GB contra cuantizaciones planas estándar (Q6_K de 7,36 GB) usando tres columnas: perplexity sobre wikitext-2 (PPL), divergencia KL contra un proxy Q8 (KLD) y HumanEval pass@1 como veredicto de capacidad. El resultado central es que el build MERNIK-6500-MSE alcanza 85,98% en HumanEval con 0,53 GB menos que Q6_K, que obtiene 82,32%.

Es relevante ahora porque articula una crítica metodológica concreta al uso de PPL y KLD como criterios únicos de calidad en cuantización, y porque muestra un caso donde la fidelidad distribucional y la capacidad funcional divergen. El repositorio está etiquetado con licencia apache-2.0 y declara únicamente inglés. El tamaño del repositorio aparece como 0,0 GB y no hay pipeline declarado, por lo que la disponibilidad efectiva de los pesos no está confirmada en la información proporcionada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para MERNIK (el material de referencia opera sobre NeoHorse-1-9B, un transformer denso con modo de razonamiento) |
| Parametros totales | ~9B en el modelo de referencia (NeoHorse-1-9B); no confirmado para el artefacto publicado |
| Parametros activos | no aplica (el modelo de referencia es denso, no MoE) |
| Longitud de contexto | 8192 tokens en la receta de evaluación (`-c 8192`); contexto oficial de NeoHorse-1-9B no disponible |
| Tipos de cuantizacion | GGUF híbridos por tensor: F16, Q4_K, Q5_K, Q6_K, Q8_0 (variantes BU-MSE, BU-SMAPE, TD-MSE, TD-SMAPE) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp / llama-server) |

## Arquitectura y entrenamiento

MERNIK no define una arquitectura de red neuronal propia: es un protocolo de asignación de precisión sobre los tensores de un modelo ya entrenado. El método se describe como una "cola de prioridad" que decide, tensor a tensor, qué tipo de cuantización recibe cada uno. El protocolo separa dos anillos: un anillo rápido o asignador, que produce señal por decisión mediante imatrix y barridos de daño medido con divergencia KL, y un anillo lento o de capacidad, que se ejecuta una vez por build con semillas fijas y produce las puntuaciones finales (HumanEval pass@1). La regla explícita es que las señales del asignador nunca certifican calidad y las puntuaciones de capacidad nunca dirigen la asignación.

El canon del método se resume en dos variantes. MSE reparte el presupuesto en capas medias (Q5/Q6) buscando ganancia absoluta y es la opción por defecto; SMAPE aplica una lente relativa que desplaza las capas de baja importancia al suelo Q4 y empuja las capas "rey" a Q8, produciendo una distribución en forma de barra. No se documenta ningún proceso de entrenamiento, ajuste fino, RLHF o DPO: el material describe exclusivamente cuantización post-entrenamiento. Las medidas se realizan con `llama-perplexity` sobre el corpus `wiki.test.raw` de wikitext-2-raw, con KLD calculada mediante `--kl-divergence` contra logits de referencia guardados con `--save-all-logits` sobre el build Q8, y HumanEval evaluado con `human_eval.evaluation.evaluate_functional_correctness` en pass@1, k=[1].

La innovación técnica destacable es la distribución híbrida por tensor. En el presupuesto @6500 (427 tensores, incluidos 177 F16 de normas y tensores 1D), BU-MSE coloca 48 tensores en Q4_K, 28 en Q5_K, 66 en Q6_K y 108 en Q8_0; BU-SMAPE coloca 91 en Q4_K, 3 en Q5_K, 7 en Q6_K y 149 en Q8_0. El tensor de mayor importancia, `ffn_down@31`, recibe Q6_K bajo MSE y Q8_0 bajo SMAPE. La variante TD-MSE mueve aproximadamente 30 tensores pequeños (normas) de F16 a Q4 sin alterar la PPL de forma apreciable (7,7701 frente a 7,7695), pero degradando HumanEval en 3,7 puntos porcentuales.

## Capacidades

- Generación de código: el HumanEval pass@1 del build MSE-6500 es 85,98% (141/164 problemas), frente al 82,32% del Q6_K estándar. Esta es la capacidad central medida en el material.
- Razonamiento en modo thinking: el protocolo de evaluación usa plantillas "peg-native" y advierte que `presence_penalty 1.5` rompe las plantillas de razonamiento (500 errores de formato), recomendando 0,0.
- Inferencia local mediante llama.cpp: los artefactos son GGUF y se sirven con `llama-server`.
- Generación de texto general: no se documentan capacidades adicionales más allá de las medidas por HumanEval y PPL.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: el repositorio declara únicamente `en`.
- Capacidades especiales (visión, audio): no disponibles en la información proporcionada.

## Casos de uso

- Asistente de código en local: el build MERNIK-6500-MSE ocupa 6,83 GB y ejecuta HumanEval con 85,98% de aciertos, lo que permite desplegar un asistente de autocompletado y generación de funciones en una GPU de consumo sin depender de APIs externas.
- Generación de tests en pipelines de CI: el modelo puede producir funciones y casos de prueba en Python, y su tamaño reducido facilita instanciarlo en runners con GPU o incluso en CPU con llama.cpp para entornos de integración continua.
- Docencia e investigación en cuantización: las cuatro variantes (BU-MSE, BU-SMAPE, TD-MSE, TD-SMAPE) y el protocolo reproducible con `llama-perplexity` y `human_eval` permiten replicar el experimento y estudiar la divergencia entre KLD y capacidad funcional.
- Sustitución de cuantizaciones planas en producción: al ocupar 6,83 GB frente a los 7,36 GB de Q6_K con mayor HumanEval, encaja en despliegues donde el presupuesto de VRAM es ajustado y la calidad de código importa más que la fidelidad distribucional.
- Evaluación offline en entornos sin red: al ser un GGUF servible con `llama-server`, se puede usar en máquinas aisladas para tareas de generación de código y texto en inglés.
- Análisis de trade-offs de asignación de bits: los datos de distribución por tiers (por ejemplo, la barra SMAPE con 149 tensores en Q8_0 frente a 108 en MSE) sirven como material de estudio para quien diseña esquemas de cuantización híbrida.
- Prototipado rápido con cuantización agresiva: el contraste con Q2_K (3,83 GB, 0,00% en HumanEval) documenta un caso de colapso real útil para fijar umbrales mínimos de precisión.

## Benchmarks y rendimiento

Resultados de referencia sobre NeoHorse-1-9B publicados en la model card. La referencia BF16 oficial se reporta en 98,17% en HumanEval con contexto no revelado.

| Build | Tamano | PPL (ctx 1024) | KLD vs Q8-proxy | HumanEval pass@1 |
|---|---:|---:|---:|---:|
| BF16 oficial (NeoHorse-1-9B) | no disponible | no disponible | no disponible | 98,17% |
| MERNIK-6500-MSE | 6,83 GB | 7,7695 | 0,0453 | 85,98% (141/164) |
| MERNIK-6500-SMAPE | 6,83 GB | 7,8252 | 0,0476 | 82,32% (135/164) |
| MERNIK-6500-TD-MSE | 6,83 GB | 7,7701 | no disponible | 82,32% |
| MERNIK-6500-TD-SMAPE | 6,83 GB | 7,8184 | no disponible | en ejecución |
| Q6_K (stock) | 7,36 GB | 7,9419 | 0,0118 | 82,32% (135/164) |
| Q2_K (stock) | 3,83 GB | no disponible | no disponible | 0,00% |

Resultados adicionales reportados: Ornith-1.5 @6500 con PPL 8,6341 (MSE) frente a 8,7845 (SMAPE). KLD cruzada entre MERNIK y Q6: D(MERNIK‖Q6) = 0,320 y D(Q6‖MERNIK) = 0,318.

Distribución de tiers @6500 (427 tensores, incluidos 177 F16 de normas y tensores 1D):

| Tier | BU-MSE | BU-SMAPE | TD-MSE | TD-SMAPE |
|---|---:|---:|---:|---:|
| F16 | 177 (2 MiB) | 177 (2 MiB) | 147 (2 MiB) | 85 (949 MiB) |
| Q4_K | 48 (972 MiB) | 91 (1989 MiB) | 71 (972 MiB) | 236 (2368 MiB) |
| Q5_K | 28 (1994 MiB) | 3 (1345 MiB) | 28 (1983 MiB) | 7 (1411 MiB) |
| Q6_K | 66 (2114 MiB) | 7 (249 MiB) | 71 (2127 MiB) | 14 (486 MiB) |
| Q8_0 | 108 (1417 MiB) | 149 (2913 MiB) | 110 (1417 MiB) | 85 (1287 MiB) |

## Requisitos de hardware

- VRAM estimada para inferencia: el build de 6,83 GB requiere al menos 7-8 GB de VRAM para el peso más el espacio de caché KV. Con contexto 8192 y el modelo de referencia de ~9B, el consumo total puede situarse por encima de 8-10 GB según cuantización de caché y batch.
- GPU recomendadas: RTX 3090, RTX 4090, RTX 4080, RTX 4060 Ti de 16 GB, A100, H100. La receta de referencia usa `-ngl 99`, es decir, todas las capas en GPU.
- Compatibilidad con GPU de consumo: sí, cabe en GPU de consumo con 8 GB o más de VRAM para el build de 6,83 GB, siempre que el contexto se ajuste. Q2_K (3,83 GB) cabría en GPU de 6 GB, pero con colapso de capacidad documentado.
- Opciones de despliegue: llama.cpp y llama-server son los soportados explícitamente (`llama-server -m MODEL.gguf --port 28082 -ngl 99 -c 8192 --jinja --log-disable`). Otros runners compatibles con GGUF no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles. Solo se documentan los parámetros de muestreo del anillo lento (temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 0.0, repetition_penalty 1.0, max_tokens 2048).

## Comparativa con modelos similares

Comparativa dentro de la misma familia de cuantizaciones del modelo de referencia NeoHorse-1-9B. No se dispone de comparación con modelos base de otros autores.

| Build / modelo | Tamano | PPL (ctx 1024) | KLD vs Q8 | HumanEval pass@1 | Licencia |
|---|---:|---:|---:|---:|---|
| MERNIK-6500-MSE | 6,83 GB | 7,7695 | 0,0453 | 85,98% | apache-2.0 |
| MERNIK-6500-SMAPE | 6,83 GB | 7,8252 | 0,0476 | 82,32% | apache-2.0 |
| Q6_K (stock) | 7,36 GB | 7,9419 | 0,0118 | 82,32% | apache-2.0 |
| Q2_K (stock) | 3,83 GB | no disponible | no disponible | 0,00% | apache-2.0 |

Lectura comparativa: MERNIK-6500-MSE gana 3,7 puntos porcentuales de HumanEval y ocupa 0,53 GB menos que Q6_K, pero Q6_K es unas cuatro veces más cercano al proxy Q8 en KLD. La model card sostiene explícitamente que la columna de rango (KLD) no transfiere a la columna de veredicto (tareas) y que los híbridos se penalizan en KLD por construcción.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No hay evaluación de sesgo, toxicidad o alineación en la información proporcionada.
- Riesgo de alucinación: no evaluado. El material solo mide código (HumanEval) y perplejidad en wikitext-2.
- Limitaciones de contexto e idioma: el repositorio declara únicamente inglés. La receta de evaluación fija el contexto en 8192 tokens; el contexto nativo del modelo de referencia no se especifica.
- Efecto suelo en HumanEval: la propia model card advierte que bases con ~98% no permiten resolver diferencias de 97 frente a 96, y que los duelos de capacidad requieren bases en el rango 60-85% para ser informativos.
- Fragilidad de plantillas: `presence_penalty 1.5` (receta reportada por el proveedor) rompe las plantillas de razonamiento y produce errores de formato. El autor verifica que 0.0 funciona.
- Anillo de asignación no certifica: el KLD está declarado ciego a contexto largo, deriva de instrucciones, formato de herramientas y modos poco frecuentes.
- Estado del repositorio: tamaño 0,0 GB, sin pipeline declarado y 0 descargas. La disponibilidad efectiva de los pesos no está confirmada en la información proporcionada.
- Licencia: apache-2.0, sin restricciones comerciales explícitas en la información disponible. Se desconoce la licencia del modelo base NeoHorse-1-9B, lo que es un riesgo a verificar antes de uso comercial.
- Trazabilidad incompleta: no se publican números de benchmark para tool calling, agentes, matemáticas, multilingüismo ni visión.

## Enlaces

- Hugging Face: https://huggingface.co/wepiqx/MERNIK
- llama.cpp (runner soportado): https://github.com/ggerganov/llama.cpp
- Openai HumanEval (evaluador usado): https://github.com/openai/human-eval
- wikitext-2-raw (corpus de perplejidad y KLD): https://huggingface.co/datasets/wikitext
- No se han encontrado enlaces relevantes adicionales en la búsqueda web: los resultados devueltos corresponden a baseball-reference.com y no guardan relación con el modelo.
