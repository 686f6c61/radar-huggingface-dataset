# Surya4/anlp-a3-part2

## Resumen

`Surya4/anlp-a3-part2` es un conjunto de checkpoints académicos para clasificación binaria de noticias falsas sobre grafos de propagación. No es un modelo de lenguaje generativo, sino una colección de clasificadores de grafos neuronales (GNN) entrenados sobre el subconjunto GossipCop del benchmark UPFD, donde cada grafo representa un árbol de retuits: el nodo 0 es la publicación original y el resto son usuarios que la han retuiteado. El objetivo es predecir si la noticia se propagó como falsa o real a partir de la estructura del grafo y de las características de sus nodos.

El artefacto lo publica el usuario Surya4 como parte de la asignación 3 de la asignatura ANLP (Monsoon 2026). Incluye nueve configuraciones entrenadas con cinco semillas cada una: una comparativa de arquitecturas (MLP solo raíz, GCN, GraphSAGE, GAT y Bi-GCN) sobre características BERT, y un análisis de ablación de características sobre GraphSAGE (perfil, spaCy, BERT y contenido). Cada checkpoint es un diccionario de `torch.save` con el `state_dict`, la configuración, la semilla y las métricas de validación y test.

Su relevancia es metodológica y docente: ofrece una comparativa reproducible y controlada de inductivos sesgos en GNN sobre un benchmark fijo, con desviaciones estándar inferiores a 0,66 puntos entre semillas. No está pensado para despliegue en producción ni como detector de desinformación real, tal como advierte el propio autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GNN sobre grafos de propagación: MLP solo raíz, GCN, GraphSAGE, GAT y Bi-GCN |
| Parametros totales | Entre 35.842 y 427.522 según configuración |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; opera sobre grafos de tamaño variable) |
| Tipos de cuantizacion | No disponible (checkpoints en punto flotante PyTorch) |
| Idiomas soportados | No disponible (dataset en inglés según la model card) |
| Licencia | MIT |
| Formato de pesos | `torch.save` (diccionario con `state_dict`, configuración y métricas), no safetensors ni GGUF |

## Arquitectura y entrenamiento

Todas las arquitecturas comparten un mismo estilo de lectura: 128 unidades ocultas, dos capas de paso de mensajes, dropout 0,5, pooling medio sobre los nodos y un clasificador lineal. El MLP solo raíz utiliza únicamente el vector de características del nodo 0 y descarta el resto del grafo. GCN aplica convolución de grafo de primer orden (Kipf y Welling). GraphSAGE emplea agregación por media con muestreo de vecindario. GAT usa cuatro cabezas de atención en la primera capa y una en la segunda. Bi-GCN sigue a Bian et al. (AAAI 2020): un GCN sobre el grafo padre-hijo y otro sobre su traspuesta, con la característica de la raíz concatenada en cada capa, DropEdge 0,2, pooling medio por dirección y concatenación final.

Los datos provienen del subconjunto GossipCop de UPFD, cargado mediante la clase `UPFD` de PyG con el split original 20/10/70 (1.092 grafos de entrenamiento con 63.482 nodos, 546 de validación con 30.791 nodos y 3.826 de test con 219.989 nodos). Las etiquetas están casi equilibradas en test (1.910 frente a 1.916). Se emplean cuatro tipos de características: `profile` (10 dimensiones de atributos de usuario), `spacy` (300 dimensiones de embeddings de tuits con spaCy), `bert` (768 dimensiones con BERT) y `content` (spaCy más perfil, 310 dimensiones). Cada tipo se estandariza por dimensión con estadísticas del split de entrenamiento.

El entrenamiento usa Adam con tasa de aprendizaje 1e-3, weight decay 5e-4, tamaño de lote 32, un máximo de 100 épocas y parada temprana sobre macro-F1 de validación con paciencia 20. El checkpoint evaluado en test es el de mejor macro-F1 de validación, con cinco semillas por configuración.

## Capacidades

- Clasificación binaria de grafos de propagación de noticias (falsa o real) a partir de la estructura del árbol de retuits y de las características de los nodos.
- Comparación controlada de cinco arquitecturas GNN bajo un mismo protocolo de lectura y entrenamiento.
- Ablación de características sobre GraphSAGE con cuatro conjuntos de entrada de distinta dimensionalidad y naturaleza.
- Procesamiento de grafos de tamaño variable con aristas orientadas de padre a hijo y nodo 0 como raíz sin aristas entrantes.
- Reproducibilidad mediante cinco semillas por configuración con métricas de validación y test almacenadas en cada checkpoint.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni generación de texto: es un clasificador de grafos, no un modelo de lenguaje.

## Casos de uso

- Docencia e investigación en GNN: reproducir la comparativa de arquitecturas sobre UPFD GossipCop con el mismo split y protocolo de parada temprana, útil para asignaturas y trabajos de fin de máster.
- Estudio de sesgos inductivos en grafos: comparar GCN (agregación isotrópica fija) frente a GAT (atención) y Bi-GCN (propagación bidireccional) para analizar qué estructuras capturan mejor la señal de propagación.
- Análisis de ablación de características: evaluar el impacto de atributos de perfil de usuario (10 dimensiones) frente a embeddings de tuits con spaCy (300) o BERT (768) en la detección de desinformación.
- Prototipado de detección de noticias falsas en entornos controlados: usar `sage_content` o `gat_bert` como línea base reproducible antes de entrenar sobre datos propios, siempre con validación adicional.
- Investigación sobre propagación en redes sociales: emplear los checkpoints como referencia para estudiar cómo la estructura del retuit aporta señal más allá del texto de la publicación original (el MLP solo raíz alcanza 73,72 % frente al 95,49 % de GAT).
- Evaluación de metodologías de selección de checkpoint: analizar el efecto de la parada temprana sobre macro-F1 de validación y su estabilidad entre semillas en un benchmark con etiquetas casi balanceadas.

## Benchmarks y rendimiento

Resultados en test, media ± desviación estándar sobre cinco semillas. Precisión, exhaustividad y F1 son macro-promediados sobre las dos clases.

| Configuración | Accuracy | Precision | Recall | F1 | Parámetros |
|---|---|---|---|---|---|
| `mlp_bert` | 73,72 ± 0,42 | 74,11 ± 0,40 | 73,73 ± 0,42 | 73,61 ± 0,44 | 115.202 |
| `gcn_bert` | 84,47 ± 0,44 | 84,58 ± 0,38 | 84,47 ± 0,44 | 84,46 ± 0,45 | 115.202 |
| `sage_bert` | 93,87 ± 0,53 | 93,88 ± 0,53 | 93,87 ± 0,53 | 93,87 ± 0,53 | 229.890 |
| `gat_bert` | 95,49 ± 0,32 | 95,50 ± 0,32 | 95,49 ± 0,32 | 95,49 ± 0,32 | 115.714 |
| `bigcn_bert` | 95,28 ± 0,17 | 95,30 ± 0,15 | 95,29 ± 0,17 | 95,28 ± 0,17 | 427.522 |
| `sage_profile` | 92,93 ± 0,66 | 93,00 ± 0,62 | 92,93 ± 0,66 | 92,93 ± 0,66 | 35.842 |
| `sage_spacy` | 93,59 ± 0,15 | 93,60 ± 0,15 | 93,59 ± 0,15 | 93,59 ± 0,15 | 110.082 |
| `sage_content` | 95,87 ± 0,36 | 95,88 ± 0,36 | 95,87 ± 0,36 | 95,86 ± 0,36 | 112.642 |

`sage_bert` es la misma ejecución que la fila BERT de la comparativa de arquitecturas y se reporta una sola vez. El autor destaca que el grafo aporta más de 10 puntos sobre el MLP solo raíz, que GAT y Bi-GCN son los inductivos sesgos más fuertes (a menos de 0,2 puntos entre sí) y que `content` supera a `bert` pese a tener menos de la mitad de anchura.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos; el mayor checkpoint (`bigcn_bert`) tiene 427.522 parámetros y el repositorio completo ocupa 0,0 GB.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; también funciona en CPU sin problema por el reducido tamaño de los modelos y de los grafos.
- Cabe en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU o CPU.
- Opciones de despliegue: PyTorch y PyTorch Geometric; no hay soporte para vLLM, llama.cpp, Ollama ni TGI porque no es un modelo de lenguaje.
- Latencia y throughput: no disponibles en la información proporcionada; dependen del tamaño del grafo y del backend de PyG.
- Recarga: requiere `torch.load(..., weights_only=False)` y las definiciones de modelo de `src/part2/models.py` del repositorio acompañante.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | F1 en GossipCop (UPFD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `Surya4/anlp-a3-part2` (GAT BERT) | GAT sobre grafos | 115.714 | Grafos de tamaño variable | 95,49 | MIT | Hugging Face |
| `Surya4/anlp-a3-part2` (Bi-GCN BERT) | Bi-GCN sobre grafos | 427.522 | Grafos de tamaño variable | 95,28 | MIT | Hugging Face |
| `Surya4/anlp-a3-part2` (GraphSAGE content) | GraphSAGE sobre grafos | 112.642 | Grafos de tamaño variable | 95,86 | MIT | Hugging Face |
| Bi-GCN original (Bian et al., 2020) | Bi-GCN sobre grafos | No disponible | Grafos de tamaño variable | No disponible en la información proporcionada | No disponible | Repositorio de los autores |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparativa se limita a las configuraciones internas del propio artefacto y a la referencia arquitectónica de Bi-GCN.

## Limitaciones y advertencias

- No es un detector de noticias falsas para producción: el autor lo describe explícitamente como un artefacto académico para comparar arquitecturas sobre un benchmark fijo.
- El dataset es una única instantánea en inglés y las etiquetas provienen de una sola fuente, lo que limita la generalización a otros dominios, idiomas o períodos temporales.
- Riesgo de sobreajuste al benchmark: los resultados están medidos sobre el split oficial de UPFD GossipCop y no se han validado en datos externos.
- Sesgos de los datos de origen: al derivar de GossipCop, los sesgos de anotación y de cobertura del medio se trasladan a los modelos.
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí de clasificaciones erróneas con alta confianza en distribuciones distintas a la de entrenamiento.
- La licencia MIT permite uso comercial, pero el uso responsable exige validación adicional y auditoría de sesgos antes de cualquier aplicación real.
- La recarga requiere `weights_only=False`, lo que implica ejecutar código de deserialización de confianza; conviene auditar los checkpoints antes de cargarlos.
- No se especifican idiomas soportados más allá del inglés del dataset ni se documentan limitaciones de contexto, al no ser un modelo de lenguaje.

## Enlaces

- Hugging Face: https://huggingface.co/Surya4/anlp-a3-part2
- Paper de Bi-GCN: Bian et al., *Rumor Detection on Social Media with Bi-Directional Graph Convolutional Networks* (AAAI 2020)
- Paper de GCN: Kipf y Welling, *Semi-Supervised Classification with Graph Convolutional Networks* (ICLR 2017)
- Paper de GraphSAGE: Hamilton et al., *Inductive Representation Learning on Large Graphs* (NeurIPS 2017)
- Paper de GAT: Veličković et al., *Graph Attention Networks* (ICLR 2018)
- Benchmark UPFD: https://github.com/safe-graph/GNN-FakeNews
- Documentación de PyTorch Geometric: https://pytorch-geometric.readthedocs.io
