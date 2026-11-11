# vanshnawander/anlp-a3-gnn-graphsage-content

## Resumen

`anlp-a3-gnn-graphsage-content` es un clasificador de grafos basado en GraphSAGE desarrollado por el usuario de Hugging Face `vanshnawander` en el contexto de una asignatura de análisis de redes (ANLP, asignación 3). El modelo resuelve una tarea de detección de noticias falsas sobre el subconjunto GossipCop del dataset UPFD, utilizando las características de contenido de los nodos (`content`) y una partición fija de los datos en proporción 20/10/70 para entrenamiento, validación y test.

A diferencia de los modelos de lenguaje, no se trata de un transformer generativo sino de una red neuronal sobre grafos (GNN) de tamaño muy reducido: 185.346 parámetros, implementada en PyTorch puro. Se publican cinco checkpoints correspondientes a las semillas 0 a 1, 2, 3 y 4, cada uno seleccionado como la época con mejor F1 de validación. El resultado agregado en test es un F1 macro de 0,9728 ± 0,0012, lo que indica un rendimiento alto y estable en esta tarea concreta.

Su relevancia es acotada y de carácter académico o experimental: sirve como referencia reproducible para experimentos de detección de desinformación sobre grafos de propagación, no como componente de propósito general. No hay información publicada sobre licencia, idiomas ni pipeline de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GraphSAGE (graph neural network) para clasificación de grafos |
| Parametros totales | 185.346 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; opera sobre grafos, no secuencias) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`seed<k>/model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un clasificador GraphSAGE implementado en PyTorch puro que opera sobre el grafo de propagación de noticias del subconjunto GossipCop de UPFD. Las características de entrada son las de contenido de los nodos (`content`), es decir, representaciones asociadas al texto de la noticia, no las de perfil de usuario ni las de propagación. La partición de datos es fija (20/10/70), lo que facilita la comparación entre ejecuciones.

Se entrenaron cinco ejecuciones independientes con semillas [0, 1, 2, 3, 4], y para cada una se conservó el checkpoint de la época con mejor F1 de validación. Las épocas óptimas varían entre 55 y 95 según la semilla. Cada directorio `seed<k>/` incluye `model.safetensors` (pesos), `config.json` (nombre del modelo, dimensión de entrada e hiperparámetros) y `result.json` (métricas de validación y test junto con la curva de entrenamiento por época). No se detalla en la información disponible la composición exacta del dataset, el número de tokens ni si hubo técnicas de regularización específicas más allá de los hiperparámetros recogidos en cada `config.json`.

## Capacidades

- Clasificación binaria de noticias (falsa o verdadera) sobre grafos de propagación del subconjunto GossipCop de UPFD.
- Aprovechamiento de características de contenido de los nodos para la decisión.
- Evaluación reproducible mediante partición fija 20/10/70 y cinco semillas.
- Selección de checkpoint por mejor F1 de validación, con métricas de test registradas por semilla.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües declaradas ni generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en detección de desinformación: el modelo sirve como línea base reproducible sobre UPFD/GossipCop para comparar variantes de GNN (GCN, GAT, GraphSAGE con distintas features) bajo la misma partición fija.
- Reproducción de experimentos académicos: los cinco checkpoints con semillas y métricas por época permiten replicar resultados y analizar la varianza entre ejecuciones (desviación típica de 0,0012 en F1).
- Docencia y prácticas de GNN: por su tamaño (185.346 parámetros) y su implementación en PyTorch puro, es adecuado como ejemplo didáctico de clasificación de grafos con GraphSAGE.
- Análisis de propagación de noticias en grafos sociales: aplicable a estructuras de difusión similares a las de GossipCop para estudiar cómo las características de contenido influyen en la clasificación.
- Evaluación de robustez entre semillas: útil para estudiar la estabilidad del entrenamiento y la sensibilidad a la inicialización en tareas de clasificación sobre grafos.
- Prototipado de pipelines de moderación de contenido basados en grafos: puede integrarse como componente de clasificación en un sistema que construya el grafo de propagación y consulte al modelo para obtener una etiqueta.

## Benchmarks y rendimiento

Resultados en test sobre el subconjunto GossipCop de UPFD (precisión, recall y F1 macro-promediados), según la model card:

| Semilla | Mejor época | Accuracy | Precision | Recall | F1 |
|---|---|---|---|---|---|
| 0 | 85 | 0,9741 | 0,9741 | 0,9741 | 0,9741 |
| 1 | 68 | 0,9733 | 0,9734 | 0,9733 | 0,9733 |
| 2 | 55 | 0,9723 | 0,9723 | 0,9723 | 0,9723 |
| 3 | 57 | 0,9710 | 0,9710 | 0,9710 | 0,9710 |
| 4 | 95 | 0,9733 | 0,9734 | 0,9733 | 0,9733 |
| Media ± desv. | — | 0,9728 ± 0,0012 | 0,9728 ± 0,0012 | 0,9728 ± 0,0012 | 0,9728 ± 0,0012 |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; con 185.346 parámetros y pesos en safetensors, el modelo ocupa del orden de centenares de kilobytes en precisión completa.
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; el modelo cabe holgadamente en tarjetas de gama baja.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (por ejemplo, GTX 1050, RTX 2060, RTX 3060, RTX 4090) e incluso puede ejecutarse en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa de `model.safetensors` y `config.json`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos de detección de noticias falsas sobre UPFD ni con otras variantes de GNN.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el subconjunto GossipCop de UPFD; su generalización a otros datasets o dominios no está documentada.
- Solo utiliza características de contenido de los nodos; no incorpora features de perfil de usuario ni de propagación, lo que limita el análisis a una señal parcial.
- La partición 20/10/70 es fija, lo que facilita la comparación pero puede no reflejar condiciones de despliegue reales.
- No se especifica licencia, por lo que el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- No se declaran idiomas soportados; el rendimiento fuera del dominio de GossipCop (en inglés) es desconocido.
- Riesgo de sobreajuste al dataset y a la partición concreta, dado el alto F1 reportado y la naturaleza académica del experimento.
- Ausencia de documentación sobre sesgos, calibración o comportamiento ante distribuciones cambiantes de noticias.
- No es un modelo generativo: no puede producir explicaciones ni texto, solo una etiqueta de clasificación.
- No se han publicado datos de latencia, throughput ni requisitos de despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/vanshnawander/anlp-a3-gnn-graphsage-content
