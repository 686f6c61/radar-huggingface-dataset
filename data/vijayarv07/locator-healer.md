# Vijayarv07/locator-healer

## Resumen

Locator Healer (v0.1) es un clasificador tabular desarrollado por Vijayarv07 que resuelve un problema muy concreto de la ingeniería de calidad: cuando un cambio en la interfaz rompe un localizador de test (XPath, CSS, etc.), el modelo vuelve a encontrar el elemento en el DOM nuevo y devuelve un localizador robusto, o bien responde explícitamente que el elemento ha desaparecido en lugar de adivinar. La innovación central es la abstención: la mayoría de enfoques de self-healing eligen el elemento más parecido de la página aunque el original ya no exista, lo que convierte un fallo claro de test en un test que pulsa silenciosamente el elemento equivocado.

Técnicamente no es un modelo de lenguaje, sino un booster de LightGBM entrenado sobre clasificación binaria de pares (elemento antiguo, candidato). Cada par se describe con 57 características que combinan coincidencias exactas y difusas de id, test id, name, texto visible, label y nombre accesible; solapamiento de clases; cambios de sección y posición; y si el localizador original todavía casa con el candidato. El modelo se publica en el formato de texto plano de LightGBM (`healer.lgb.txt`), por lo que cargarlo no ejecuta código, y la inferencia se realiza en CPU en milisegundos por página.

La relevancia actual viene de su posicionamiento dentro de pipelines de Playwright y Selenium: se integra como librería Python en CI, con una comprobación de generalización por tipo de página y convención de estilos. Su adopción pública es todavía mínima (0 descargas y 1 like en el momento de los metadatos), y el propio autor advierte que solo se ha entrenado con páginas sintéticas de un único generador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gradient boosting de árboles de decisión (LightGBM) sobre clasificación tabular binaria |
| Parámetros totales | no disponible (la model card no detalla número de árboles ni hojas finales) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular; procesa pares elemento antiguo / candidato, no secuencias de texto) |
| Tipos de cuantización | no aplica (modelo de árboles; no hay cuantizaciones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | únicamente texto de interfaz en inglés |
| Licencia | Apache 2.0 (dataset asociado: CC BY 4.0) |
| Formato de pesos | texto plano de LightGBM (`healer.lgb.txt`), no pickle |
| Características por par | 57 |
| Umbral de abstención ("gone") | 0,19, ajustado en el split de validación |
| Pipeline declarado | tabular-classification |
| Librería | lightgbm |
| Fecha de publicación indicada | 25 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo es un clasificador LightGBM con objetivo binario, tasa de aprendizaje 0,05 y 31 hojas por árbol, con parada temprana sobre el conjunto de validación. El entrenamiento completo dura aproximadamente un minuto en la CPU de un portátil, lo que da una idea del escaso coste computacional y del tamaño reducido del artefacto. No hay fases de RLHF ni DPO: es aprendizaje supervisado clásico sobre datos tabulares derivados de DOM.

El flujo de inferencia tiene cinco pasos: primero, cada elemento interactivo de la página nueva se convierte en candidato; segundo, cada par (elemento antiguo, candidato) se describe con 57 características de coincidencia exacta y difusa, solapamiento de clases, cambios de sección y posición, y validez del localizador original frente al candidato; tercero, el clasificador puntúa cada candidato; cuarto, si la mejor puntuación queda por debajo de 0,19 se responde "gone"; quinto, en caso contrario se devuelve el localizador único más robusto siguiendo la jerarquía `testid` > `id` > `role` > `text` > `css` > `css_path` > `xpath`. Las señales con más peso según el autor son el solapamiento en nombres legibles por humanos (texto, label, aria-label), la posición dentro de la sección y la similitud de ruta estructural. El entrenamiento y la evaluación se hicieron sobre el dataset Self-Healing Locators, con scripts `train_healer.py` y `ood_eval.py`.

## Capacidades

- Reasignación de localizadores: dado el estado de un elemento cuando su localizador funcionaba y el HTML nuevo, devuelve un elemento candidato y un localizador nuevo más robusto.
- Abstención explícita: distingue entre "curado" y "elemento eliminado" mediante un umbral de confianza, en lugar de forzar siempre una coincidencia.
- Puntuación de confianza por predicción: el resultado incluye `confidence` y, cuando la respuesta es "gone", también un `best_guess`.
- Selección jerárquica de estrategia de localizador: prioriza `testid`, luego `id`, `role`, `text`, `css`, `css_path` y finalmente `xpath`.
- Extracción de características asistida: el helper `generator.features(element)` construye el diccionario de características a partir de un elemento de lxml.
- Inferencia en CPU en milisegundos por página, sin GPU ni aceleradores.
- Carga segura: al usar el formato de texto plano de LightGBM, la carga del modelo no ejecuta código arbitrario.
- Soporte de agentes o multi-step reasoning: no aplica, es un clasificador de una sola pasada.
- Tool calling / function calling: no disponible (no es una capacidad del modelo; su integración es mediante la API Python `Healer.heal`).
- Capacidades multilingües: no, solo texto de interfaz en inglés.
- Visión, audio o modo de razonamiento explícito: no disponibles.

## Casos de uso

- Estabilización de suites de Playwright en CI: el modelo se invoca como paso previo a la ejecución para reescribir localizadores rotos y marcar como "gone" los elementos eliminados, evitando que la suite pase en verde pulsando el elemento equivocado.
- Mantenimiento de suites de Selenium heredadas con XPath frágiles: dado que la jerarquía de salida prioriza `testid`, `id` y `role`, el modelo migra progresivamente rutas XPath absolutas a localizadores semánticos más estables.
- Triaje de fallos en pipelines nocturnos: cada fallo de localizador se clasifica en "curado con confianza X" o "elemento eliminado", lo que permite enrutar automáticamente los segundos a revisión humana y los primeros a un pull request de actualización de tests.
- Detección de cambios de UI no intencionados: la tasa de abstención correcta en elementos eliminados (93,9 % en el split de test) convierte al modelo en un detector barato de regresiones de maquetación en páginas de checkout.
- Auditoría de selectores en aplicaciones con estilos generados (CSS hashed): en el escenario de validación con estilos hasheados mantiene un 98,6 % de acierto global, útil cuando los frameworks de front-end regeneran nombres de clase en cada build.
- Migración de tests entre versiones de una aplicación: con el tipo de página "checkout" excluido del entrenamiento, el modelo alcanza un 99,0 % de acierto, lo que lo hace apto como apoyo en rediseños de flujos de pago.
- Preprocesado para asistentes de reparación de tests: las sugerencias de localizador y la confianza asociada pueden alimentar a un agente o a un revisor humano que confirme el cambio antes de escribir en el repositorio.
- Análisis de rotura de contratos de accesibilidad: al pesar fuertemente el nombre accesible, `aria-label` y `label`, los cambios detectados señalan también pérdidas de semántica accesible en los elementos interactivos.

## Benchmarks y rendimiento

Split de test con 600 ejemplos, comparado con una línea base de similitud:

| Métrica | Baseline de similitud | Locator Healer |
|---|---:|---:|
| Acierto global | 89,8 % | 99,2 % |
| Fácil / medio / difícil | 99,4 % / 83,8 % / 86,2 % | 100,0 % / 98,5 % / 98,9 % |
| Fallos silenciosos de `wrong_element` | 78,5 % | 96,9 % |
| Elemento eliminado: responde "gone" correctamente | 36,4 % | 93,9 % |

Verificación de generalización (reentrenando con un tipo de página o convención de estilos completamente excluidos):

| Excluido | Ejemplos | Baseline global | Modelo global | Baseline wrong-element | Modelo wrong-element | Baseline "gone" | Modelo "gone" |
|---|---:|---:|---:|---:|---:|---:|---:|
| Tipo de página: checkout | 765 | 87,5 % | 99,0 % | 83,3 % | 96,3 % | 23,7 % | 86,8 % |
| Tipo de página: dashboard | 732 | 88,9 % | 91,7 % | 87,0 % | 85,0 % | 16,7 % | 83,3 % |
| Estilos: hashed | 1.534 | 90,4 % | 98,6 % | 77,1 % | 92,6 % | 56,0 % | 91,7 % |
| Estilos: semantic | 1.483 | 86,3 % | 98,8 % | 65,1 % | 93,7 % | 32,3 % | 93,5 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no son aplicables a este tipo de modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere A100, H100 ni RTX 4090. El entrenamiento también se completa en CPU de portátil.
- Cabe en GPU de consumo: no aplica, no es un modelo de red neuronal.
- Opciones de despliegue: librería Python con LightGBM y `huggingface_hub.snapshot_download`; integración directa en frameworks de test (Playwright, Selenium) y en runners de CI. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: milisegundos por página según la model card; no se proporcionan cifras concretas de latencia ni de páginas por segundo.
- Coste de entrenamiento: aproximadamente un minuto en CPU de portátil.
- Almacenamiento: artefacto único en texto plano (`healer.lgb.txt`) más el código auxiliar; no se especifica el tamaño exacto del fichero.

## Comparativa con modelos similares

| Alternativa | Tipo | Acierto global (test) | Detección de "gone" | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| Locator Healer v0.1 | LightGBM tabular | 99,2 % | 93,9 % | Apache 2.0 | HuggingFace |
| Baseline de similitud | Heurística de similitud sobre la página | 89,8 % | 36,4 % | no disponible | definida por el autor en la model card |
| Otros modelos publicados de self-healing de localizadores | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación directa solo es posible frente a la línea base incluida en la propia model card. No se han identificado en la información disponible otros modelos publicados de la misma categoría (clasificación tabular para reparación de localizadores) con los que contrastar parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- Entrenado únicamente con páginas sintéticas de un solo generador; en aplicaciones reales con DOM más profundos, shadow DOM, iframes y contenido dinámico se debe esperar una precisión inferior hasta que se valide en esos entornos.
- Degradación en páginas estructuralmente distintas: en el escenario excluido de tipo "dashboard" (mayoría de enlaces, sin formulario) el acierto global baja al 91,7 % y el modelo es ligeramente peor que la línea base en fallos silenciosos de elemento equivocado (85,0 % frente a 87,0 %).
- La fila de elementos eliminados del split de test se calcula sobre solo 33 casos de eliminación, por lo que la cifra del 93,9 % tiene un tamaño de muestra reducido.
- Solo procesa atributos y estructura del DOM; no ve el resultado renderizado, por lo que no puede detectar elementos visualmente ocultos, solapados o fuera de viewport.
- Solo texto de interfaz en inglés; no se ha validado con interfaces en otros idiomas.
- El propio autor recomienda tratar los resultados "healed" como sugerencias que un humano confirme en CI, no como correcciones silenciosas.
- Riesgo de alucinación equivalente: el modelo puede devolver un candidato incorrecto con confianza alta; el umbral de 0,19 no elimina ese riesgo, solo lo reduce.
- Adopción pública mínima (0 descargas, 1 like en los metadatos consultados) y ausencia de métricas de producción en sitios reales.
- Licencia Apache 2.0 para el modelo, lo que permite uso comercial; el dataset asociado se publica bajo CC BY 4.0, con la obligación de atribución correspondiente.
- No se documentan sesgos específicos más allá del sesgo de dominio hacia el generador sintético de entrenamiento y hacia interfaces en inglés.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vijayarv07/locator-healer
- Dataset Self-Healing Locators: https://huggingface.co/datasets/Vijayarv07/self-healing-locators
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos por el buscador no guardan relación con el proyecto y se han descartado.
