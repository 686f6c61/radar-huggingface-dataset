# winterdewdev/anlp-a3

## Resumen

`winterdewdev/anlp-a3` es un repositorio de checkpoints publicados como parte de la asignación 3 del curso ANLP (Advanced Natural Language Processing) de IIIT Hyderabad (2026). No es un modelo de lenguaje de propósito general, sino una colección de pesos experimentales implementados desde cero en PyTorch para dos tareas académicas: descifrado de un cifrado de sustitución dependiente de posición y contexto, y detección de noticias falsas sobre grafos de propagación (UPFD GossipCop).

La primera parte incluye cuatro arquitecturas comparadas a pequeña escala (entre 6,90M y 8,44M parámetros): un transformer decoder-only, Mamba, DeltaNet y un híbrido intercalado Mamba/DeltaNet (`MMDMMDMMDMMD`). La segunda parte contiene clasificadores de grafos (MLP sobre raíz, GCN, GraphSAGE, GAT y Bi-GCN) con distintos tipos de características (bert, profile, spacy, content), todos por debajo de 0,5M de parámetros.

El interés del repositorio es fundamentalmente pedagógico y de investigación: permite reproducir comparativas controladas entre arquitecturas de secuencia (atención frente a SSM/DeltaNet) y entre operadores de agregación en grafos sobre un mismo dataset. No está pensado para despliegue en producción ni para uso como modelo generativo general; su licencia MIT permite reutilización, pero el alcance funcional es muy acotado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parte 1: transformer decoder-only, Mamba, DeltaNet e híbrido Mamba/DeltaNet. Parte 2: MLP, GCN, GraphSAGE, GAT, Bi-GCN |
| Parametros totales | Parte 1: 6,90M–8,44M. Parte 2: 70.146–492.418 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; entrada carácter a carácter con codificación sinusoidal de la posición en la línea |
| Tipos de cuantizacion | no disponible (checkpoints `.pt` en fp32 nativo de PyTorch) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.pt` (PyTorch, pesos + configuración de entrenamiento en el mismo fichero) |

## Arquitectura y entrenamiento

La parte 1 compara cuatro familias sobre una tarea de descifrado carácter a carácter. La entrada en el paso `i` es `embed(p_{i-1}) + embed(c_i)` más una codificación sinusoidal de la posición dentro de la línea, y la decodificación es greedy. Las variantes son: un transformer decoder-only de 8 capas con dimensión 256 (8,44M parámetros), un Mamba de 16 capas con `d=256` y `d_state=16` (7,06M), un DeltaNet de 8 capas y 4 cabezas con β ∈ (0,1) (6,90M) y un híbrido intercalado `MMDMMDMMDMMD` Mamba/DeltaNet (6,98M). Todos se entrenaron 50.000 pasos con un currículum de longitudes mixtas y se seleccionó el checkpoint de mejor pérdida de validación (paso 50.000).

La parte 2 entrena clasificadores sobre árboles de propagación de noticias del dataset UPFD GossipCop. Se comparan un MLP que solo usa el nodo raíz (115.202 parámetros con características BERT) frente a GCN (246.530), GraphSAGE (361.218), GAT (247.042) y Bi-GCN (492.418), todos con características BERT. Además se evalúa GraphSAGE con tres representaciones alternativas: `profile` (70.146), `spacy` (181.506) y `content` (185.346). Cada configuración se ejecuta con 5 semillas (0–4) durante 100 épocas, seleccionando la mejor época por F1 de validación.

## Capacidades

- Descifrado de un cifrado de sustitución dependiente de posición y contexto, a nivel de carácter, con decodificación greedy.
- Clasificación binaria de noticias (falsas o veraces) a partir de árboles de propagación en GossipCop.
- Comparación controlada entre arquitecturas de secuencia: atención completa (transformer), SSM (Mamba), atención lineal con regla delta (DeltaNet) e híbridos intercalados.
- Comparación controlada entre operadores de agregación en grafos: GCN, GraphSAGE, GAT y Bi-GCN, más una línea base sin estructura (MLP sobre la raíz).
- Extracción de características multimodales para nodos: embeddings BERT, perfiles de usuario, embeddings spaCy y contenido textual.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No es un modelo multilingüe ni generativo de propósito general.

## Casos de uso

- Reproducción de la asignación ANLP 3: los scripts `scripts/part1/test_assn.sh` y `scripts/part2/test_gnn.sh` permiten evaluar los checkpoints publicados con las mismas métricas del enunciado.
- Estudio comparativo de arquitecturas de secuencia: el conjunto de cuatro checkpoints de la parte 1 permite analizar, con el mismo presupuesto de entrenamiento (50k pasos) y el mismo currículum, cómo se comportan atención, Mamba, DeltaNet e híbridos en una tarea de modelado carácter a carácter.
- Investigación en cifrados: sirve como banco de pruebas para estudiar hasta qué punto modelos pequeños aprenden patrones de sustitución dependientes de posición y contexto, con métricas de precisión por carácter, por palabra, Levenshtein normalizado y líneas exactas.
- Detección de desinformación sobre grafos sociales: los clasificadores de la parte 2 pueden reutilizarse como referencia para experimentos de detección de fake news en UPFD GossipCop con particiones y semillas fijas.
- Comparación de representaciones de nodo: la matriz GraphSAGE × {bert, profile, spacy, content} permite medir cuánto aporta cada tipo de característica al F1 de clasificación.
- Docencia y evaluación: el repositorio incluye configuración de entrenamiento dentro de cada `.pt`, lo que facilita su uso como material de prácticas o como base para tareas similares en otros cursos.
- Análisis de líneas base: el MLP sobre la raíz (F1 ≈ 0,7286) sirve como cota inferior para calibrar cuánto aporta la estructura del grafo en GossipCop.

## Benchmarks y rendimiento

Parte 1 (descifrado, conjunto de test de 1.318 líneas):

| Modelo | Parametros | Char acc | Word acc | Norm. Levenshtein | Lineas exactas |
|---|---|---|---|---|---|
| Híbrido MMDMMDMMDMMD | 6,98M | 9,60% | 3,44% | 0,3783 | 535 / 1318 |
| Transformer (8 capas, d=256) | 8,44M | 9,87% | 3,19% | 0,3757 | 529 / 1318 |
| Mamba (16 capas, d=256, d_state=16) | 7,06M | 9,71% | 3,52% | 0,3755 | 524 / 1318 |
| DeltaNet (8 capas, 4 cabezas) | 6,90M | 9,76% | 3,43% | 0,3755 | 525 / 1318 |

Parte 2 (UPFD GossipCop, F1 de test, media ± desviación típica sobre 5 semillas):

| Modelo | Caracteristicas | Parametros | Test F1 |
|---|---|---|---|
| Root-only MLP | bert | 115.202 | 0,7286 ± 0,0031 |
| GCN | bert | 246.530 | 0,9693 ± 0,0022 |
| GraphSAGE | bert | 361.218 | 0,9637 ± 0,0023 |
| GAT | bert | 247.042 | 0,9670 ± 0,0024 |
| Bi-GCN | bert | 492.418 | 0,9570 ± 0,0012 |
| GraphSAGE | profile | 70.146 | 0,9628 ± 0,0014 |
| GraphSAGE | spacy | 181.506 | 0,9621 ± 0,0019 |
| GraphSAGE | content | 185.346 | 0,9737 ± 0,0026 |

## Requisitos de hardware

- VRAM estimada: todos los checkpoints son de tamaño muy reducido (parte 1 por debajo de 9M de parámetros; parte 2 por debajo de 0,5M), por lo que caben holgadamente en cualquier GPU consumer con varios GB de VRAM. El repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no se requieren aceleradores de gama alta; una GPU consumer moderna (por ejemplo, RTX 3060 o superior) es más que suficiente. Para entrenamiento desde cero, el autor no especifica hardware.
- Cabe en GPU consumer: sí, sin restricciones prácticas por memoria.
- Opciones de despliegue: los checkpoints están en formato `.pt` de PyTorch y están pensados para cargarse mediante el código de la asignación. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no son modelos de lenguaje estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| winterdewdev/anlp-a3 (parte 1) | 6,90M–8,44M | no disponible | Descifrado carácter a carácter | MIT | Hugging Face |
| winterdewdev/anlp-a3 (parte 2) | 70.146–492.418 | no disponible | Clasificación de grafos (GossipCop) | MIT | Hugging Face |
| Mamba original (referencia) | no disponible | no disponible | Modelado de secuencias | no disponible | no disponible |
| DeltaNet original (referencia) | no disponible | no disponible | Modelado de secuencias | no disponible | no disponible |

No se han identificado en la información proporcionada modelos comparables de terceros con la misma combinación de tareas y escala; las filas de Mamba y DeltaNet originales se incluyen solo como referencia arquitectónica y sus datos figuran como no disponibles.

## Limitaciones y advertencias

- No es un modelo de lenguaje de propósito general: no genera texto libre, no responde a instrucciones y no soporta chat.
- Los resultados de la parte 1 son muy bajos en términos absolutos (precisión por carácter por debajo del 10%, líneas exactas en torno al 40%), lo que refleja la dificultad de la tarea y el reducido presupuesto de entrenamiento (50k pasos, menos de 9M de parámetros).
- El rendimiento de la parte 2 está medido exclusivamente sobre UPFD GossipCop; no hay evidencia de generalización a otros datasets de desinformación ni a otros idiomas.
- No hay información sobre sesgos del dataset ni sobre riesgos de alucinación, ya que el modelo no genera lenguaje abierto.
- La licencia MIT permite uso comercial, pero el alcance funcional (descifrado de un cifrado concreto y clasificación en un dataset concreto) limita severamente su aplicabilidad en producción.
- Los checkpoints dependen del código de la asignación para cargarse y evaluarse; no se documenta una API de inferencia independiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación externa de los resultados más allá de los logs del autor.
- Algunas configuraciones de la parte 2 (Bi-GCN, GAT) rinden por debajo de GCN pese a tener más parámetros, lo que sugiere sensibilidad a la inicialización y al tamaño reducido del conjunto.

## Enlaces

- Hugging Face: https://huggingface.co/winterdewdev/anlp-a3
- WandB parte 1: https://forge.coreweave.com/wandb/winterdew-iiit-hyderabad/anlp-a3-part1
- WandB parte 2: https://forge.coreweave.com/wandb/winterdew-iiit-hyderabad/anlp-a3-part2
