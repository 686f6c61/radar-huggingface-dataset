# techdotus/Tokle-SPAB-3M

## Resumen

Tokle-SPAB-3M es un modelo de lenguaje decoder-only de escala diminuta desarrollado por el equipo Tech.us (cuenta de HuggingFace `techdotus`). Se trata de un artefacto de investigación, no de un asistente: cuenta con 2.908.947 parámetros entrenables y una tabla congelada de 8.388.608 parámetros, lo que da un total de 11.297.555 parámetros. Fue entrenado sobre 12.000 millones de tokens, lo que supone una ratio de aproximadamente 4.125 tokens por parámetro entrenable, muy por encima de lo habitual en modelos de este tamaño.

Su aportación técnica es SPAB (Static Pairwise Attention Bias), un sesgo de atención estático construido a partir de Información Mutua Puntual (PMI) calculada sobre el corpus de entrenamiento. Para cada par consulta-clave, el modelo aplica un hash sobre los dos identificadores de token, recupera su valor de PMI de una tabla congelada, lo multiplica por una escala aprendida por cabeza y lo suma a los logits de atención antes del softmax. El sesgo es independiente de la posición y depende solo de qué tokens intervienen, de modo que el modelo arranca el entrenamiento con un prior sobre qué tokens tienden a coocurrir y solo debe aprender cuánto confiar en él.

El modelo es relevante como banco de pruebas controlado para estudiar sesgos inductivos estáticos en mecanismos de atención a muy pequeña escala, y como entrada en la categoría sub-10M de la Open SLM Leaderboard. Su ventana de contexto es de solo 512 tokens, está entrenado exclusivamente en inglés y no ha pasado por ajuste de instrucciones ni por alineamiento de seguridad.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizada + SPAB (Static Pairwise Attention Bias) |
| Parámetros totales | 11.297.555 según la model card (2.908.947 entrenables + 8.388.608 de la tabla SPAB congelada); el archivo safetensors reporta 2.908.947 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (pesos y código) |
| Formato de pesos | safetensors (requiere `trust_remote_code=True`) |
| Capas | 9 |
| Dimensión oculta (d_model) | 144 |
| Cabezas de atención | 3 |
| Cabezas KV (GQA) | 1 (multi-query attention) |
| Dimensión por cabeza | 48 |
| Tamaño intermedio de la FFN | 432 |
| Tokenizador | BPE propio, 5.048 tokens |
| Datos de entrenamiento | 12.000 millones de tokens |
| Descargas / likes | 451 / 12 |
| Tamaño del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con 9 capas, `d_model` de 144, 3 cabezas de atención de 48 dimensiones cada una y atención multi-query (una única cabeza KV), lo que reduce el coste de caché durante la generación. La FFN tiene un tamaño intermedio de 432. La innovación principal es SPAB: en lugar de aprender únicamente las proyecciones de consulta y clave, el modelo consulta una tabla estática de 8.388.608 entradas en `float32` que almacena puntuaciones de asociación entre pares de tokens, derivadas de PMI sobre el corpus de entrenamiento. Esa puntuación se incorpora directamente a los logits de atención, escalada por un factor aprendido por cabeza. La tabla permanece congelada durante el entrenamiento, por lo que actúa como un prior externo y no como un parámetro entrenable.

El preentrenamiento utilizó 12.000 millones de tokens con una mezcla curada y un pipeline de limpieza estricto que eliminó temáticas poco útiles para un modelo de este tamaño. La composición del dataset fue: FineWeb-Edu (43,1 %), Cosmopedia (24,3 %), OpenMathInstruct-2 (13,5 %), Tiny Strange Textbooks (9,0 %), MegaScience —medicina y biología, curado de forma propia— (5,0 %), High-Quality English Sentences (3,0 %), ScienceQA (1,2 %) y Orca-Math Word Problems 200k (0,9 %). Todos los datos se tokenizaron con el tokenizador BPE de 5.048 tokens del propio modelo y se reservó un 1 % para validación. La model card no documenta fases de RLHF, DPO ni ajuste por instrucciones.

## Capacidades

- Generación de texto causal en inglés: continuación de frases y párrafos cortos mediante decodificación autorregresiva.
- Razonamiento de baja complejidad sobre texto educativo y de divulgación científica, dado el peso de FineWeb-Edu y Cosmopedia en la mezcla.
- Aritmética elemental y resolución de problemas de palabras de nivel escolar, procedente de OpenMathInstruct-2 y Orca-Math (Arithmark-3: 41,70 %).
- Preguntas de ciencia de nivel básico, por la inclusión de ScienceQA y del subconjunto curado MegaScience.
- Capacidad multilingüe: limitada al inglés; no se declara soporte de otros idiomas.
- Tool calling / function calling: no soportado.
- Uso como agente o razonamiento multi-paso: no soportado.
- Modo de pensamiento (thinking), visión o audio: no disponibles.
- Modo de generación recomendado por el autor: greedy (`do_sample=False`) con `repetition_penalty=1.3`, lo que refleja que la decodificación por muestreo produce salidas degeneradas con frecuencia.
- No dispone de plantilla de chat ni de ajuste instructivo.

## Casos de uso

- Investigación de sesgos inductivos en atención: SPAB permite aislar el efecto de un prior estático de coocurrencia de tokens frente a un modelo de referencia con la misma arquitectura pero sin la tabla PMI, en experimentos de ablación con un coste de cómputo mínimo.
- Estudio de escalado a muy baja parametrización: con 12.000 millones de tokens sobre 2,9 millones de parámetros entrenables, sirve para analizar curvas de pérdida y saturación en regímenes extremos de sobreentrenamiento.
- Docencia y divulgación de arquitecturas transformer: el modelo cabe en el repositorio (0,1 GB), se ejecuta en CPU y su implementación personalizada es inspeccionable, lo que facilita explicar atención multi-query, sesgos aditivos en logits y decodificación greedy en un cuaderno.
- Validación de pipelines de datos y tokenización: al estar entrenado con una mezcla documentada al detalle (FineWeb-Edu, Cosmopedia, OpenMathInstruct-2), es un banco de pruebas para comprobar que un pipeline de limpieza, mezcla y tokenización BPE de 5.048 tokens produce distribuciones coherentes.
- Pruebas de infraestructura de despliegue ligero: útil para verificar flujos de `from_pretrained` con `trust_remote_code=True`, serialización safetensors y ejecución en entornos sin GPU antes de escalar a modelos mayores.
- Baseline en la Open SLM Leaderboard: punto de comparación reproducible para modelos de menos de 10 millones de parámetros en HellaSwag, ARC-Easy, ARC-Challenge, PIQA y Arithmark-3.
- Generación exploratoria de texto muy corto: autocompletado de frases y demostraciones de continuaciones de una o dos líneas, siempre asumiendo que las salidas pueden ser repetitivas o incorrectas.
- Estudio de la interacción entre PMI y atención multi-query: analizar si un prior de coocurrencia global compensa la pérdida de expresividad asociada a compartir una única cabeza KV.

## Benchmarks y rendimiento

Resultados publicados en la model card, todos ellos 0-shot `acc_norm` y siguiendo la metodología de la Open SLM Leaderboard:

| Hellaswag | ARC-Easy | ARC-Challenge | PIQA | Arithmark-3 |
|---|---|---|---|---|
| 27,22 % | 34,68 % | 24,49 % | 54,95 % | 41,70 % |

La model card incluye además un bloque de comparación, comentado en el README, con las puntuaciones de otros modelos de la Open SLM Leaderboard. Se reproduce a continuación tal cual, indicando que las cifras de los modelos ajenos provienen de dicha clasificación y no han sido verificadas de forma independiente:

| Modelo | Parámetros | Int Index | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | Arithmark-3 |
|---|---|---|---|---|---|---|---|
| Tokle-SPAB-3M (Tech.us) | 2,9 M | 9,16 | 27,22 % | 34,68 % | 24,49 % | 54,95 % | 41,70 % |
| Ember-2 (SurjoLabs) | 2,96 M x2 | 7,21 | 27,28 % | 33,42 % | 22,01 % | 55,11 % | 35,90 % |
| BananaMind-2-Micro (BananaMind) | 2,9 M | 6,01 | 28,27 % | 33,12 % | 21,93 % | 53,21 % | 34,00 % |
| GPT-S-1.4M (Axiomic Labs) | 1,4 M | 5,40 | 26,89 % | 31,57 % | 21,93 % | 55,17 % | 30,20 % |

## Requisitos de hardware

- VRAM estimada: los pesos entrenables en FP32 ocupan aproximadamente 11,6 MB (2.908.947 × 4 bytes) y el buffer SPAB en `float32` unos 33,6 MB (8.388.608 × 4 bytes), es decir, alrededor de 45 MB para los pesos. Con activaciones y una caché KV de 512 tokens, la huella total se mantiene por debajo de unos pocos cientos de megabytes.
- GPU recomendadas: no se necesita GPU. Cualquier acelerador, desde una GTX 1050 o una RTX 3050 hasta una RTX 4090, A100 o H100, queda enormemente sobredimensionado para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo e incluso en CPU, Raspberry Pi o dispositivos móviles de gama media. El repositorio completo ocupa 0,1 GB.
- Opciones de despliegue: únicamente la librería `transformers` con `trust_remote_code=True`, ya que la arquitectura es personalizada. No hay versiones GGUF publicadas, por lo que llama.cpp y Ollama no son compatibles de forma directa. vLLM y TGI no ofrecen soporte para esta arquitectura personalizada. No disponible en otros formatos.
- Latencia y throughput: no se han publicado cifras oficiales. Dado el tamaño y la ventana de 512 tokens, la inferencia en CPU es viable, pero no se dispone de mediciones concretas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Rendimiento |
|---|---|---|---|---|---|
| Tokle-SPAB-3M | 2,9 M entrenables + 8,39 M SPAB congelados | 512 tokens | MIT | Inglés | HellaSwag 27,22 %; PIQA 54,95 %; Arithmark-3 41,70 % |
| Ember-2 (SurjoLabs) | 2,96 M x2 | No disponible | No disponible | No disponible | HellaSwag 27,28 %; PIQA 55,11 %; Arithmark-3 35,90 % |
| BananaMind-2-Micro (BananaMind) | 2,9 M | No disponible | No disponible | No disponible | HellaSwag 28,27 %; PIQA 53,21 %; Arithmark-3 34,00 % |
| GPT-S-1.4M (Axiomic Labs) | 1,4 M | No disponible | No disponible | No disponible | HellaSwag 26,89 %; PIQA 55,17 %; Arithmark-3 30,20 % |

Los datos de los tres modelos comparados proceden del bloque comentado de la model card y de la Open SLM Leaderboard; no se dispone de información verificada sobre sus contextos, licencias o idiomas. La ventaja más clara de Tokle-SPAB-3M en esta comparativa es Arithmark-3 (41,70 % frente a un máximo de 35,90 % en los rivales), mientras que BananaMind-2-Micro supera ligeramente a Tokle-SPAB-3M en HellaSwag y GPT-S-1.4M y Ember-2 lo superan en PIQA.

## Limitaciones y advertencias

- Modelo diminuto: con 2,9 millones de parámetros entrenables y estados ocultos de 144 dimensiones, las generaciones son con frecuencia repetitivas, incoherentes o factualmente incorrectas. El propio autor lo describe como artefacto de investigación, no como asistente.
- Contexto muy corto: 512 tokens como máximo. Las tablas RoPE no se construyen más allá de esa longitud, por lo que no es posible extender la ventana sin reentrenamiento.
- Solo inglés: entrenado exclusivamente con texto web, educativo, sintético y matemático en inglés. No hay soporte de castellano ni de otros idiomas.
- Sin ajuste de instrucciones ni alineamiento de seguridad: no responde a instrucciones de forma fiable y puede reproducir sesgos presentes en los datos web de los que procede.
- Riesgo de alucinación elevado: al no haber pasado por RLHF ni DPO y por su escala, cualquier afirmación factual que genere debe verificarse.
- Dependencia de código remoto: el uso requiere `trust_remote_code=True`, lo que implica ejecutar código Python publicado en el repositorio de HuggingFace. Conviene auditar `modeling_*.py` antes de ejecutarlo en entornos de producción o con acceso a datos sensibles.
- Sin cuantizaciones ni formatos alternativos: no existen versiones GGUF, AWQ ni GPTQ, lo que limita su integración con runtimes de inferencia habituales.
- Licencia MIT: permite uso comercial, modificación y redistribución, pero la licencia no cubre los términos de los datasets subyacentes, que pueden tener sus propias condiciones de uso.
- Modo de decodificación restringido en la práctica: el autor recomienda greedy con `repetition_penalty=1.3`, lo que sugiere que el muestreo produce salidas degeneradas de forma habitual.
- Cifras de parámetros ambiguas: la model card declara 11,3 M de parámetros totales, pero el archivo safetensors solo contiene 2.908.947. La diferencia corresponde a la tabla SPAB congelada, que debe contabilizarse aparte en cualquier análisis de memoria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/techdotus/Tokle-SPAB-3M
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Cosmopedia: https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
- Dataset High-Quality English Sentences: https://huggingface.co/datasets/agentlans/high-quality-english-sentences
- Dataset Tiny Strange Textbooks: https://huggingface.co/datasets/nampdn-ai/tiny-strange-textbooks
- Dataset ScienceQA: https://huggingface.co/datasets/armanc/ScienceQA
- Dataset OpenMathInstruct-2: https://huggingface.co/datasets/nvidia/OpenMathInstruct-2
- Dataset Orca-Math Word Problems 200k: https://huggingface.co/datasets/microsoft/orca-math-word-problems-200k
- Open SLM Leaderboard: URL no disponible en la información proporcionada (se cita como origen de las puntuaciones comparativas)
- Paper o publicación técnica de SPAB: no disponible
- Repositorio de código independiente: no disponible
- Demo o Space: no disponible
- Nota sobre la búsqueda web: los resultados proporcionados (Fast 3D, Google, 3DAIStudio, Next3D, 3DLinks) corresponden a generadores de modelos 3D y no guardan relación con este modelo; no se han encontrado enlaces adicionales relevantes.
