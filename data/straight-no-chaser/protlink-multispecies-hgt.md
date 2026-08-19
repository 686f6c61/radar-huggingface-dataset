# straight-no-chaser/ProtLink-Multispecies-HGT

## Resumen

ProtLink es un modelo de transformador de grafos heterogéneo (HGT) diseñado para la predicción de interacciones proteína-proteína (PPI) en múltiples especies. Desarrollado por el usuario straight-no-chaser, combina embeddings de secuencia de proteínas obtenidos con ESM-2 (esm2_t33_650m) con contexto de interacciones específico de especie y relaciones de ortogrupos en un grafo que abarca 516 especies. De esta forma, la información evolutiva se propaga entre especies sin perder la estructura de interacción particular de cada una.

El modelo se presenta como una solución para el problema de la predicción de PPI, una tarea central en biología computacional con aplicaciones en descubrimiento de fármacos, anotación funcional y comprensión de redes de señalización. Su relevancia radica en el uso de grafos heterogéneos que integran múltiples tipos de nodos y aristas, lo que permite explotar información evolutiva y contextual más allá de los enfoques basados únicamente en secuencias.

La arquitectura consiste en un encoder HGT de 2 capas con 4 cabezas de atención y un decodificador MLP para clasificación de enlaces. Los embeddings de proteínas se derivan de la capa final de ESM-2 mediante mean-pooling de los residuos. El modelo se evalúa en la predicción de PPI humano-humano, usando interacciones no humanas y bordes proteína-ortogrupo como contexto del grafo. Los resultados publicados para la semilla 0 alcanzan un ROC-AUC de 0,9581, Average Precision de 0,9524 y F1 de 0,8940.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heterogeneous Graph Transformer (HGT) con encoder de 2 capas y 4 cabezas, decodificador MLP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa grafos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (se indica librería pytorch; probablemente safetensors o .pt, pero no se especifica) |

## Arquitectura y entrenamiento

ProtLink emplea un transformador de grafos heterogéneo (HGT) que opera sobre un grafo con nodos de tipo proteína y ortogrupo, y aristas que representan interacciones proteína-proteína y relaciones proteína-ortogrupo. El encoder consta de 2 capas con 4 cabezas de atención por capa, y el decodificador es un MLP que clasifica si un par de proteínas interactúa o no. Las características de cada nodo proteína se obtienen a partir del modelo de lenguaje de proteínas ESM-2 (variante t33_650m), extrayendo los embeddings de la última capa y aplicando mean-pooling sobre los residuos. Esta representación se combina con la estructura del grafo durante el entrenamiento.

No se han publicado detalles sobre el conjunto de datos de entrenamiento (número de interacciones, composición exacta, balance de clases), el número de pasos de entrenamiento, ni si se aplicaron técnicas de regularización o aumento de datos. La evaluación se realiza en un escenario de predicción de PPI humano-humano, donde las interacciones no humanas y los bordes de ortogrupos actúan como contexto auxiliar. El umbral de clasificación se selecciona en el conjunto de validación maximizando F1 sobre la curva precisión-recall y se fija para la evaluación en test.

## Capacidades

- Predicción de interacciones proteína-proteína (PPI) a partir de secuencias y contexto evolutivo.
- Integración de información multi-especie mediante grafos heterogéneos con 516 especies.
- Uso de embeddings de ESM-2 (650M parámetros) como representación de secuencias de proteínas.
- Propagación de información evolutiva a través de relaciones de ortogrupos.
- Clasificación binaria de pares de proteínas (interactúan / no interactúan).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso; es un modelo especializado en tareas de grafos.

## Casos de uso

- Descubrimiento de nuevas interacciones proteína-proteína en humanos: el modelo puede predecir interacciones candidatas a partir de secuencias conocidas, lo que acelera la generación de hipótesis experimentales en laboratorios húmedos.
- Anotación funcional de proteínas sin caracterizar: al predecir interacciones, se puede inferir la posible función de proteínas hipotéticas basándose en sus compañeros de interacción.
- Estudio de redes de señalización celular: las predicciones permiten reconstruir o completar mapas de interacción en vías de señalización, útil para entender mecanismos de enfermedades.
- Priorización de dianas terapéuticas: en proyectos de descubrimiento de fármacos, las interacciones predichas ayudan a seleccionar proteínas con mayor probabilidad de ser relevantes en una patología.
- Comparación evolutiva de interacciones: al usar contexto de 516 especies, el modelo puede explorar cómo se conservan o divergen las interacciones entre especies, lo que es relevante para estudios de evolución molecular.
- Integración en pipelines de biología computacional: al ser un modelo de PyTorch, puede incorporarse en flujos de trabajo existentes para análisis de redes de interacción, junto con herramientas de visualización y análisis de grafos.

## Benchmarks y rendimiento

Según la información publicada para la ejecución con semilla 0:

| Metrica | Valor |
|---|---|
| ROC-AUC | 0,9581 |
| Average Precision | 0,9524 |
| F1 | 0,8940 |

No se han publicado comparaciones con otros modelos en la información disponible. El umbral de clasificación se fijó maximizando F1 en el conjunto de validación.

## Requisitos de hardware

- No se especifican requisitos de hardware en la documentación disponible.
- El modelo depende de ESM-2 650M para extraer embeddings de secuencias, lo que requiere una GPU con al menos 8-12 GB de VRAM para inferencia en lotes pequeños (según la variante de ESM-2). Sin embargo, esto es una estimación general y no un dato oficial del proyecto.
- Para el entrenamiento o ajuste fino, se necesitaría una GPU con mayor memoria (por ejemplo, A100 o RTX 3090/4090), pero no hay confirmación oficial.
- No se mencionan opciones de despliegue específicas (vLLM, llama.cpp, etc.). Al ser un modelo de PyTorch, puede ejecutarse en entornos con PyTorch instalado y GPU compatible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Existen otros enfoques para predicción de PPI basados en aprendizaje profundo (por ejemplo, D-SCRIPT, PIPR, DeepPPI), pero no se han incluido datos comparativos en la fuente. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- El modelo se evalúa únicamente en predicción de PPI humano-humano; su rendimiento en otras especies o en interacciones entre especies diferentes no está validado.
- La dependencia de ESM-2 para la extracción de características implica que los errores o sesgos de ESM-2 se propagan al modelo.
- No se han publicado detalles sobre el equilibrio de clases, la procedencia de los datos de entrenamiento ni posibles sesgos en las interacciones anotadas (por ejemplo, sesgo hacia proteínas bien estudiadas).
- El modelo no genera explicaciones sobre por qué predice una interacción; es una caja negra.
- La licencia MIT permite uso comercial, pero los datos de entrenamiento podrían tener restricciones adicionales no documentadas.
- No hay información sobre la robustez frente a secuencias muy divergentes o proteínas con dominios poco comunes.
- Al ser un modelo de grafos, requiere construir el grafo completo (con las 516 especies) para obtener contexto; esto puede ser costoso computacionalmente en entornos con recursos limitados.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/straight-no-chaser/ProtLink-Multispecies-HGT)
- [Repositorio GitHub](https://github.com/straight-no-chaser/ProtLink)
- [README en GitHub](https://github.com/straight-no-chaser/ProtLink/blob/main/README.md)
