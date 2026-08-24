# Yuchang-Zhao/TimeCMA

## Resumen

TimeCMA es un framework de código abierto para el pronóstico multivariado de series temporales (MTSF, por sus siglas en inglés) presentado en AAAI 2025 por investigadores de la Universidad Tecnológica de Nanyang y colaboradores. Su propuesta central es combinar un modelo de lenguaje de gran tamaño (LLM) con un codificador de series temporales mediante un mecanismo de alineación cross-modality, de forma que se obtienen representaciones temporales que son a la vez disentangled (propias de la rama de series) y robustas (aportadas por el LLM). El framework está diseñado para reducir el coste computacional al forzar que la información temporal esencial se condense en el último token del prompt textual, permitiendo además el almacenamiento de embeddings para acelerar la inferencia.

Este repositorio en HuggingFace contiene el código de referencia, no un modelo preentrenado como tal. Es una implementación de investigación, con scripts para almacenamiento de embeddings, entrenamiento e inferencia sobre ocho conjuntos de datos reales. Su relevancia radica en que aborda una limitación detectada en métodos previos basados en LLM: la dificultad de aprender embeddings disentangled para series temporales. TimeCMA propone un enfoque de doble rama que supera esta limitación mediante alineación cruzada de modalidades.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Framework dual-modality: rama de series temporales + rama LLM con prompts textuales, módulo de alineación cruzada basada en similitud por canal |
| Parametros totales | No disponible (depende del LLM base subyacente) |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (depende del LLM base) |
| Tipos de cuantizacion | No disponible (no se especifica) |
| Idiomas soportados | No disponible (el framework es agnóstico al idioma, pero los prompts se diseñan en inglés) |
| Licencia | No disponible (el repositorio no indica licencia explícita; el paper es de acceso abierto en AAAI) |
| Formato de pesos | No aplicable (es código de entrenamiento; los pesos del LLM base se cargan según la librería usada, probablemente PyTorch) |

## Arquitectura y entrenamiento

TimeCMA es un framework que combina dos ramas de codificación. La rama de series temporales extrae embeddings disentangled pero con capacidad predictiva limitada. La rama LLM-empowered envuelve la serie temporal junto con texto como prompt, obteniendo embeddings robustos pero entrelazados. El módulo de alineación cruzada agrega ambas representaciones mediante similitud por canal, logrando un embedding que conserva la disentangled de la rama temporal y la robustez de la rama LLM. El diseño incluye un prompt eficiente que fuerza la concentración de la información temporal en el último token, reduciendo el coste computacional y permitiendo almacenar ese embedding para acelerar la inferencia.

El entrenamiento se realiza sobre ocho conjuntos de datos reales (procedentes de TimesNet y TFB), aunque el paper no detalla la composición exacta ni el número de tokens. No se menciona el uso de RLHF ni DPO; el entrenamiento es supervisado para el pronóstico. El código requiere Python 3.11, PyTorch 2.1.2 y CUDA 12.1.

## Capacidades

- Pronóstico multivariado de series temporales: predice valores futuros de múltiples variables correlacionadas.
- Alineación cross-modality: combina representaciones de series temporales con representaciones textuales generadas por un LLM.
- Reducción de coste computacional: mediante el uso del último token y el almacenamiento de embeddings para inferencia acelerada.
- Compatibilidad con cualquier LLM base (aunque el framework no fija uno concreto).
- Manejo de datasets heterogéneos: probado en ocho datasets reales, cubriendo dominios como energía, transporte, clima, etc.

## Casos de uso

- Previsión de consumo energético: TimeCMA puede utilizarse para predecir la demanda eléctrica a corto plazo en múltiples zonas o subestaciones, aprovechando la correlación entre variables como temperatura, humedad y consumo histórico. La ventaja del framework es su capacidad para extraer representaciones robustas que capturan dependencias temporales complejas.
- Predicción de tráfico y movilidad: en sistemas de transporte, la predicción de flujo de vehículos o ocupación de carreteras se beneficia de la alineación cross-modality, que combina información numérica de sensores con contexto textual (por ejemplo, eventos o condiciones meteorológicas).
- Gestión de inventarios y demanda en retail: permite predecir ventas de múltiples productos en paralelo, usando series de ventas, precios y factores estacionales. La robustez de las representaciones ayuda a manejar datos ruidosos.
- Monitorización de sensores industriales: en mantenimiento predictivo, TimeCMA puede pronosticar lecturas de múltiples sensores (temperatura, vibración, presión) para anticipar fallos, aprovechando la alineación de embeddings para capturar patrones sutiles.
- Análisis de series financieras: predicción de valores de activos o indicadores económicos multivariados, donde el uso de LLM puede incorporar noticias o eventos externos en el prompt textual.
- Investigación académica en forecasting: como baseline reciente en estudios sobre métodos LLM aplicados a series temporales, sirve para comparar nuevas arquitecturas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. El paper original (AAAI 2025) reporta evaluaciones en ocho datasets reales, afirmando que TimeCMA supera a los métodos de última generación, pero no se proporcionan cifras concretas en el material consultado. Se recomienda consultar el paper completo en arXiv (2406.01638) para obtener las tablas comparativas detalladas.

## Requisitos de hardware

- El framework requiere una GPU con CUDA 12.1 y PyTorch 2.1.2. La cantidad de VRAM depende del LLM base elegido (por ejemplo, LLaMA-7B necesitaría al menos 14 GB en cuantización FP16; modelos más grandes como 13B requieren 26 GB o más).
- Se recomienda una GPU con al menos 16 GB de memoria para experimentos básicos con modelos de 7B y batch pequeño.
- Para la fase de almacenamiento de embeddings, se puede reducir el coste guardando el último token, lo que permite inferencia rápida posterior.
- Opciones de despliegue: no se mencionan integraciones con vLLM, llama.cpp u Ollama. El código es de investigación y se ejecuta directamente con scripts de bash. La inferencia puede hacerse en una sola GPU, aunque para datasets grandes se aconseja una GPU de gama alta como RTX 4090 o A100.

## Comparativa con modelos similares

TimeCMA se posiciona como una alternativa a otros métodos de forecasting con LLM, como:

- **TimeLLM**: enfoque que adapta LLMs para series temporales mediante re-prompting, sin la doble rama de TimeCMA.
- **GPT4TS**: utiliza el LLM preentrenado como extractor de características, pero no realiza alineación cross-modality.
- **TimesNet**: método clásico basado en CNN, sin LLM, que sirve como baseline.

| Framework | Uso de LLM | Alineación cross-modality | Coste de inferencia | Disponibilidad |
|---|---|---|---|---|
| TimeCMA | Sí (rama LLM) | Sí | Alto (depende del LLM) | Código abierto (GitHub) |
| TimeLLM | Sí (prompting) | No | Medio | Código abierto |
| GPT4 (adaptado) | Sí (fine-tuning) | No | Alto | Propietario |
| TimesNet | No | No | Bajo | Código abierto |

TimeCMA destaca por su módulo de alineación, que permite obtener embeddings más robustos que TimeLLM, mientras que TimesNet es más ligero pero menos preciso en escenarios complejos.

## Limitaciones y advertencias

- No es un modelo autónomo: TimeCMA es un framework que requiere un LLM base (por ejemplo, GPT-2, Llama) como componente. No se puede desplegar directamente como un modelo de generación de texto.
- Dependencia del LLM base: el rendimiento está condicionado al LLM elegido; si el LLM no es de alta calidad, la rama de alineación no aportará robustez.
- Coste computacional: aunque el diseño con último token reduce el coste, la fase de entrenamiento inicial con el LLM completo puede ser exigente en recursos.
- Limitaciones de idioma: los prompts están diseñados en inglés; para otros idiomas habría que adaptar el texto.
- Sin licencia explícita: el repositorio no indica licencia; el paper es de acceso abierto, pero para uso comercial conviene contactar con los autores.
- Sesgos del LLM subyacente: cualquier sesgo del LLM base se propagará a las representaciones de series temporales.
- Alucinación en el contexto textual: los prompts textuales pueden generar contenido irrelevante que afecte a la predicción si no se controlan.

## Enlaces

- HuggingFace: https://huggingface.co/Yuchang-Zhao/TimeCMA
- Paper arXiv: https://arxiv.org/abs/2406.01638
- Versión HTML del paper: https://arxiv.org/html/2406.01638v5
- Código GitHub: https://github.com/Haha13145/TimeCMA
- Datasets de TimesNet: https://drive.google.com/drive/folders/13Cg1KYOlzM5C7K8gK8NfC-F3EYxkM3D2
- Dataset TFB: https://drive.google.com/file/d/1vgpOmAygokoUt235piWKUjfwao6KwLv7/view
