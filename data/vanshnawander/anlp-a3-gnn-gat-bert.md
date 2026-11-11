# vanshnawander/anlp-a3-gnn-gat-bert

## Resumen

`anlp-a3-gnn-gat-bert` es un clasificador de grafos basado en Graph Attention Network (GAT) desarrollado por el usuario de Hugging Face `vanshnawander` en el contexto de una asignación académica de Análisis de Lenguaje Natural (ANLP). El modelo resuelve la tarea de detección de noticias falsas sobre el subconjunto GossipCop del conjunto de datos UPFD (User Preference-aware Fake News Detection), utilizando características de nodo generadas con BERT y una partición fija de datos 20/10/70 (entrenamiento/validación/test).

Se trata de un modelo muy pequeño, con solo 247.042 parámetros, implementado en PyTorch puro. No es un modelo de lenguaje generativo, sino un clasificador binario de grafos: recibe como entrada un grafo de propagación de noticias (usuarios, publicaciones y sus relaciones) cuyos nodos están representados por embeddings BERT, y produce una predicción de veracidad. Se publican cinco checkpoints correspondientes a las semillas [0, 1, 2, 3, 4], cada uno seleccionado por el mejor F1 de validación.

La relevancia del modelo es fundamentalmente académica y de reproducibilidad: sirve como referencia para experimentos de detección de desinformación basada en grafos sobre UPFD/GossipCop, con métricas de test publicadas (F1 macro medio de 0,9650 ± 0,0034). No está pensado como componente de producción ni como modelo de propósito general, y el repositorio tiene un tamaño de 0,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Graph Attention Network (GAT) sobre grafo de propagación, con características de nodo BERT |
| Parametros totales | 247.042 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre grafos) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en precisión de entrenamiento) |
| Idiomas soportados | no disponible (las características de nodo derivan de BERT, pero el modelo no genera texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (por checkpoint: `seed<k>/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de grafos GAT (Graph Attention Network) implementado en PyTorch puro. Cada nodo del grafo de propagación de noticias se representa mediante características extraídas con BERT (según la model card, `bert` node features), y la red aplica atención sobre las aristas del grafo para agregar información de vecindad y producir una clasificación a nivel de grafo. La dimensión de entrada y los hiperparámetros concretos están documentados en el `config.json` de cada checkpoint, aunque no se detallan en la información disponible.

El entrenamiento se realizó sobre el subconjunto GossipCop de UPFD con una partición fija 20/10/70, usando cinco semillas (0 a 4). Para cada semilla se conserva el checkpoint de la época con mejor F1 de validación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset, ni si se aplicaron técnicas de RLHF/DPO (no aplicables a un clasificador de este tipo). Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación binaria de grafos de propagación de noticias (verdadero/falso) sobre el dataset GossipCop de UPFD.
- Procesamiento de grafos con características de nodo derivadas de BERT y agregación mediante atención sobre aristas (GAT).
- Evaluación reproducible con partición fija 20/10/70 y cinco semillas independientes.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias (no genera texto).
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto, código ni matemáticas.

## Casos de uso

- Investigación académica en detección de desinformación: el modelo sirve como baseline reproducible sobre UPFD/GossipCop para comparar arquitecturas GNN en experimentos de clasificación de noticias falsas.
- Reproducción de resultados: los cinco checkpoints con semillas fijas permiten verificar las métricas publicadas (F1 macro ≈ 0,9650) ejecutando `bash scripts/part2/test_gnn.sh` desde el repositorio de la asignación.
- Estudio de estabilidad entre semillas: la desviación estándar de 0,0034 en F1 permite analizar la variabilidad del entrenamiento y la selección de época por validación.
- Docencia en grafos y GNN: el modelo, con solo 247.042 parámetros y PyTorch puro, es adecuado como ejemplo didáctico de GAT aplicado a un problema real de clasificación de grafos.
- Análisis de propagación de noticias en redes sociales: el uso de características BERT por nodo y atención sobre aristas permite estudiar cómo la estructura del grafo contribuye a la clasificación de veracidad.
- Punto de partida para ablaciones: al ser pequeño y estar en safetensors, se puede reentrenar o modificar (cambio de features, número de cabezas de atención) para experimentos comparativos en entornos con recursos limitados.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (precisión, recall y F1 macro-promediados):

| seed | mejor época | accuracy | precision | recall | f1 |
|---|---|---|---|---|---|
| 0 | 75 | 0,9600 | 0,9600 | 0,9600 | 0,9600 |
| 1 | 68 | 0,9663 | 0,9663 | 0,9663 | 0,9663 |
| 2 | 25 | 0,9692 | 0,9692 | 0,9692 | 0,9692 |
| 3 | 27 | 0,9660 | 0,9660 | 0,9660 | 0,9660 |
| 4 | 47 | 0,9637 | 0,9637 | 0,9637 | 0,9637 |
| media ± std | | 0,9650 ± 0,0034 | 0,9650 ± 0,0034 | 0,9650 ± 0,0034 | 0,9650 ± 0,0034 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks de LLM no son aplicables a este clasificador).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo tiene 247.042 parámetros y los pesos en safetensors ocupan del orden de kilobytes.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; incluso una GPU integrada o CPU puede ejecutar la inferencia sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) y también en CPU.
- Opciones de despliegue: PyTorch nativo (el modelo se carga con `safetensors` y se ejecuta con la librería `torch`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a un clasificador de grafos.
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia muy baja, pero no hay cifras publicadas.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otras arquitecturas GNN (GCN, GraphSAGE, GAT alternativos) ni con otros modelos de detección de noticias falsas sobre UPFD/GossipCop. Los benchmarks de LLM no son aplicables a esta categoría de modelo.

## Limitaciones y advertencias

- Modelo de propósito muy específico: solo clasifica grafos de propagación de noticias del dataset GossipCop de UPFD; no es un modelo de lenguaje ni un clasificador de texto genérico.
- Dependencia del pipeline de características BERT: la calidad de la clasificación depende de que las características de nodo se generen con el mismo procedimiento usado en el entrenamiento.
- Partición fija 20/10/70: los resultados no deben extrapolarse a otros splits o dominios sin reentrenamiento.
- Licencia no disponible: no se puede confirmar el uso comercial; se debe contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Riesgo de alucinación no aplicable (no genera texto), pero sí riesgo de falsos positivos/negativos en la clasificación, con métricas macro-promediadas que pueden ocultar desequilibrios de clase.
- Sesgos conocidos: no documentados en la información disponible; el dataset GossipCop tiene un dominio concreto (noticias de celebridades) que puede introducir sesgos de dominio.
- Sin pipeline ni idiomas declarados en Hugging Face: la integración con `transformers` no está soportada.
- Repositorio de 0,0 GB y sin descargas ni likes: no hay evidencia de uso comunitario ni mantenimiento.
- Las métricas publicadas corresponden a la model card del autor y no han sido verificadas de forma independiente en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-gat-bert
- Repositorio de la asignación (referenciado en la model card): no disponible como URL explícita; se menciona el script `scripts/part2/test_gnn.sh`
- Dataset UPFD: no disponible como enlace en la información proporcionada
- Dataset GossipCop: no disponible como enlace en la información proporcionada
- Paper de UPFD: no disponible como enlace en la información proporcionada
- Demo: no disponible
