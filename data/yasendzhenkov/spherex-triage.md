# YasenDzhenkov/spherex-triage

## Resumen

SPHEREx triage es un clasificador tabular de código abierto desarrollado por el equipo Aphelion para el certamen NASA Space Apps 2026. Su función es asignar una categoría a cada objeto que el telescopio espacial SPHEREx de la NASA detecta en una región del cielo, indicando además qué tipo de objeto parece ser, con qué confianza y en qué medida encaja con lo que ya se conoce. El modelo trabaja exclusivamente con datos fotométricos de SPHEREx (bandas infrarrojas D4, D5 y D6), sin utilizar catálogos externos como entradas, lo que evita que el clasificador copie la respuesta de la fuente de etiquetado.

Técnicamente no es un modelo de lenguaje ni una red neuronal profunda: se trata de un `HistGradientBoostingClassifier` de scikit-learn con pesos de clase balanceados, complementado por un `IsolationForest` que genera una puntuación de rareza («oddness»). El conjunto de entrenamiento consta de 4982 objetos procedentes de 24 zonas de cielo de 10 minutos de arco, y la validación se realiza con `GroupKFold` por zona, de modo que el modelo siempre se evalúa sobre cielo que nunca ha visto. Alcanza un 92,2 % de accuracy en cielo reservado, frente a un 62,9 % de la línea base que siempre predice `unmatched`.

Su relevancia radica en el enfoque de triaje: en lugar de intentar una clasificación astronómica fina, separa lo trivial de lo que merece inspección humana, priorizando detecciones únicas, artefactos y objetos potencialmente nuevos. Es una herramienta de cribado para pipelines de observación, no un sustituto de la caracterización espectroscópica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles (`HistGradientBoostingClassifier` de scikit-learn) + `IsolationForest` para puntuación de rareza |
| Parametros totales | no disponible (modelo de árboles; el número de árboles y hojas no se documenta en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 17 características) |
| Tipos de cuantizacion | no aplica (modelo sklearn; serialización estándar, sin cuantización) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (artefacto sklearn; el repositorio ocupa 0.0 GB según Hugging Face) |

## Arquitectura y entrenamiento

El modelo combina dos componentes de scikit-learn. El clasificador principal es un `HistGradientBoostingClassifier` con pesos de clase balanceados, entrenado sobre 17 características derivadas exclusivamente de datos SPHEREx: brillo en las bandas infrarrojas D4, D5 y D6 en cada visita, colores, variabilidad entre visitas y movimiento propio aparente. El segundo componente es un `IsolationForest` ajustado sobre los objetos que sí tienen contrapartida en catálogo, cuyo propósito es producir una puntuación de rareza independiente de la etiqueta predicha.

El etiquetado se construye por coincidencia con catálogos, nunca como entrada del modelo: Gaia DR3 a menos de 2 segundos de arco implica `star`; AllWISE a menos de 3 segundos de arco sin contrapartida Gaia implica `ir-only`; SkyBoT implica `asteroid`; y la ausencia de coincidencia implica `unmatched`. Los datos provienen de 24 zonas de cielo de 10 minutos de arco, procesadas por el motor propio del equipo directamente desde las imágenes públicas de SPHEREx en AWS, con fotografías hasta febrero de 2026. La validación emplea `GroupKFold` agrupado por zona, garantizando separación espacial entre entrenamiento y prueba.

## Capacidades

- Clasificación tabular en cuatro clases: `star`, `ir-only`, `asteroid` y `unmatched`.
- Puntuación de rareza mediante `IsolationForest`, que permite priorizar objetos atípicos para revisión humana.
- Detección de anomalías operativa: el 96,0 % de los objetos entre el 5 % más raro son `unmatched`, frente a una tasa base del 62,9 %.
- Entrada restringida a fotometría SPHEREx; no consume catálogos externos en inferencia.
- Ejecución mediante script (`python predict.py report.json`) sobre informes de zona generados por el motor de la aplicación.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Triaje de detecciones en pipelines de observación: dado un informe de zona generado por el motor del equipo, el modelo asigna clase y confianza a cada objeto, permitiendo descartar automáticamente los `unmatched` triviales (mayoritariamente detecciones de una sola visita) y concentrar el esfuerzo humano en el resto.
- Priorización de candidatos a seguimiento: la puntuación de rareza del `IsolationForest` ordena los objetos por atipicidad, de modo que un observatorio puede decidir qué campos reobservar o qué objetos solicitar a espectroscopía de seguimiento.
- Control de calidad de detecciones: la clase `unmatched` captura artefactos y detecciones espurias, lo que permite marcar automáticamente imágenes o visitas con exceso de falsos positivos antes de su inclusión en catálogos internos.
- Filtrado previo a la búsqueda de contrapartidas: el modelo separa objetos con contrapartida Gaia (`star`) de los que solo aparecen en infrarrojo (`ir-only`), reduciendo el volumen de consultas a VizieR o IRSA en fases posteriores del análisis.
- Identificación rápida de asteroides: la clase `asteroid`, derivada de coincidencias SkyBoT, permite etiquetar objetos con movimiento aparente compatible y derivarlos a los servicios de mecánica celeste correspondientes.
- Docencia y prototipado en astronomía infrarroja: al ser un modelo sklearn ligero con licencia Apache 2.0 y dataset público asociado, sirve como base reproducible para experimentos de clasificación tabular con validación espacial por zonas.
- Integración en flujos de alerta: el script de predicción sobre `report.json` permite encadenar el triaje con sistemas de notificación o con colas de revisión, sin dependencia de infraestructura de GPU.

## Benchmarks y rendimiento

Resultados publicados en la model card, evaluados sobre cielo no visto (GroupKFold por zona):

| Métrica | Valor |
|---|---|
| Accuracy en cielo reservado | 92,2 % |
| Balanced accuracy (media de recall por clase) | 68,3 % |
| Línea base: predecir siempre `unmatched` | 62,9 % |
| Proporción de `unmatched` entre el 5 % más raro | 96,0 % (tasa base 62,9 %) |
| 210 objetos de la app en torno a 6 objetivos nombrados (nunca entrenados) | 86,7 % |

Rendimiento por clase:

| Clase | Precision | Recall | Objetos |
|---|---|---|---|
| star | 0,85 | 0,96 | 1639 |
| ir-only | 0,29 | 0,14 | 207 |
| unmatched | 0,99 | 0,96 | 3136 |

Matriz de confusión (verdad \ predicho):

| Verdad \ Predicho | star | ir-only | unmatched |
|---|---|---|---|
| star | 1570 | 45 | 24 |
| ir-only | 163 | 28 | 16 |
| unmatched | 115 | 25 | 2996 |

## Requisitos de hardware

- Inferencia en CPU: el modelo es un artefacto de scikit-learn, por lo que no requiere GPU; el coste dominante es la carga del modelo y el procesamiento del informe JSON de entrada.
- VRAM estimada: no aplica (0 GB de VRAM).
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Compatibilidad con GPU de consumo: no aplica, al no emplear aceleración gráfica.
- Opciones de despliegue: ejecución directa mediante el script `predict.py` incluido en el repositorio; serialización estándar de sklearn (joblib/pickle) para integración en servicios Python. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación facilitada. Como referencia cualitativa, los clasificadores astronómicos basados en catálogos cruzados (por ejemplo, separadores estrella/galaxia entrenados sobre Gaia o WISE) persiguen objetivos relacionados, pero no se han proporcionado parámetros, contextos ni métricas de dichos sistemas que permitan una comparación rigurosa.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SPHEREx triage | no disponible (sklearn) | no aplica | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Los objetos `unmatched` son en su mayoría detecciones de una sola visita, fáciles de separar; la separación difícil y realmente útil es entre objetos vistos en varias visitas.
- La clase `ir-only` tiene pocos ejemplos y es la más débil: precision 0,29 y recall 0,14, con 163 estrellas mal clasificadas como `ir-only`.
- No existen clases para enanas marrones, estrellas variables ni estrellas jóvenes, ya que sus etiquetas requerían SIMBAD, que no estaba disponible durante el desarrollo.
- Los datos cubren únicamente fotografías hasta febrero de 2026, procedentes del índice de cabeceras S3 propio del equipo; la búsqueda de IRSA devolvía errores.
- Una etiqueta es una coincidencia de catálogo, no verdad fundamental: estrellas débiles ausentes de Gaia se etiquetan como `ir-only` o `unmatched`.
- La balanced accuracy del 68,3 % indica un rendimiento desigual entre clases; la accuracy global del 92,2 % está inflada por el desequilibrio hacia `unmatched`.
- El modelo no procesa texto ni imágenes: cualquier uso fuera de la clasificación tabular de fotometría SPHEREx queda fuera de su alcance.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, sin restricciones adicionales documentadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso externo ni mantenimiento posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YasenDzhenkov/spherex-triage
- Dataset de entrenamiento: https://huggingface.co/datasets/YasenDzhenkov/spherex-triage-data
- NASA Space Apps: https://www.spaceappschallenge.org/
- Datos SPHEREx (NASA/JPL-Caltech/IPAC, IRSA): https://irsa.ipac.caltech.edu/
- Gaia DR3 (ESA/Gaia/DPAC): https://www.cosmos.esa.int/web/gaia/dr3
- AllWISE y 2MASS (NASA/IPAC): https://irsa.ipac.caltech.edu/Missions/wise.html
- VizieR (CDS, Estrasburgo): https://vizier.cds.unistra.fr/
- SkyBoT (IMCCE): https://ssp.imcce.fr/webservices/skybot/
