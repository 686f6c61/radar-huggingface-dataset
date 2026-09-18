# Yoge-2004/expense-intelligence-model

# Expense intelligence model (Yoge-2004)

## Resumen

El modelo `Yoge-2004/expense-intelligence-model` es un sistema de clasificación de transacciones financieras publicado en HuggingFace por el usuario Yoge-2004, orientado a aplicaciones de seguimiento de gastos (expense tracker). No se trata de un modelo de lenguaje ni de una red neuronal: es un clasificador lineal de scikit-learn que combina una vectorización TF-IDF (n-gramas de palabra 1-2 y n-gramas de carácter con límites de palabra 3-5, con un máximo de 200.000 características) con una regresión logística multiclase SAGA calibrada. El problema que resuelve es la categorización automática de descripciones textuales de transacciones en diez categorías canónicas (alimentación, transporte, compras, entretenimiento, salud, suministros, servicios financieros, ingresos, gobierno/legal y donaciones).

Su relevancia práctica radica en el coste computacional: la model card declara una latencia inferior a 5 ms por transacción en CPU estándar, sin necesidad de GPU, lo que lo hace apto para clasificación en tiempo real dentro de un backend de finanzas personales. El autor reporta 99,30 % de accuracy global (99,32 % de Macro-F1) sobre más de 240.000 transacciones de holdout, y 98,85 % de accuracy (98,96 % de Macro-F1) en un subconjunto específico de transacciones bancarias indias y UPI.

El repositorio (0,6 GB) incluye, además del clasificador principal, artefactos auxiliares: un índice de similitud de comercios normalizados, un modelo de detección de transacciones casi duplicadas, informes de validación por país (India, EE. UU., Reino Unido, Canadá y Australia) y un `manifest.json` con trazabilidad del entrenamiento. Se publica con licencia MIT y solo declara soporte de inglés. El modelo no registra descargas ni «likes» en el momento de redactar esta ficha, por lo que su validación externa es nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF dual (n-gramas de palabra 1-2 + n-gramas de caracter con límites de palabra 3-5, máximo 200.000 características) con regresión logística multiclase SAGA calibrada |
| Parametros totales | No disponible; no es una red neuronal. El número de coeficientes depende de las características efectivas y de las 10 clases (hasta 200.000 x 10 si se alcanza el límite configurado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la entrada es una descripción corta de transacción. No se documenta un límite explícito de caracteres |
| Tipos de cuantizacion | No aplica; el modelo se serializa con joblib (scikit-learn) y no admite cuantización |
| Idiomas soportados | Inglés (en), según la model card y las etiquetas del repositorio |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn); el formato del resto de artefactos auxiliares no está especificado |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni un modelo generativo: se trata de un pipeline clásico de aprendizaje automático supervisado. La primera etapa es una vectorización TF-IDF «dual» que concatena n-gramas de palabra de tamaño 1 a 2 (capturan términos como «Uber ride» o «Netflix subscription») con n-gramas de carácter de tamaño 3 a 5 restringidos a límites de palabra (aportan robustez ante variaciones morfológicas, erratas y nombres de comercio poco frecuentes), con un máximo de 200.000 características. La segunda etapa es una regresión logística multiclase entrenada con el solver SAGA y calibrada, lo que permite obtener probabilidades de clase utilizables para umbrales de confianza o revisión manual.

En cuanto a los datos, la model card cita tres conjuntos: `Ranjit0034/finee-dataset`, `Sumeetgpt/indian-transaction-categorization-synthetic` y `mitulshah/transaction-categorization`. El autor no detalla el número exacto de tokens ni la composición porcentual, pero sí indica que el holdout supera las 240.000 transacciones e incluye validación diferenciada para India, EE. UU., Reino Unido, Canadá y Australia, con 98,85 % de accuracy en el caso indio (UPI y banca local). No se menciona el uso de RLHF, DPO ni ningún bucle de refuerzo, algo coherente con un clasificador supervisado. Los artefactos auxiliares (similitud de comercios y detección de casi duplicados) amplían el sistema más allá de la clasificación pura de categorías.

## Capacidades

- Clasificación de texto en 10 categorías canónicas: `food_dining`, `transportation`, `shopping_retail`, `entertainment_recreation`, `healthcare_medical`, `utilities_services`, `financial_services`, `income`, `government_legal` y `charity_donations`.
- Inferencia en CPU con latencia declarada inferior a 5 ms por transacción, adecuada para clasificación síncrona en peticiones de API.
- Calibración de probabilidades: la regresión logística está calibrada, lo que permite ordenar predicciones por confianza y derivar a revisión humana los casos dudosos.
- Similitud de comercios normalizados: índice de búsqueda incluido en `models/merchant-similarity/` para agrupar variantes del mismo comercio.
- Detección de transacciones casi duplicadas: modelo incluido en `models/duplicate-similarity/`.
- Robustez ante variaciones de escritura en descripciones gracias a los n-gramas de carácter.
- Trazabilidad de entrenamiento: `manifest.json` con procedencia, entorno y puntuaciones de las puertas de calidad.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento. Es un clasificador de texto, no un modelo generativo.
- Capacidad multilingüe: no; solo se declara inglés.

## Casos de uso

- Categorización automática en una aplicación de finanzas personales: cada vez que el usuario registra o importa una transacción, el modelo asigna una de las diez categorías en menos de 5 ms en CPU, sin coste de GPU y sin salir del backend.
- Enriquecimiento de extractos bancarios importados: al procesar un CSV o PDF bancario, el campo de descripción se pasa al clasificador para poblar la categoría de cada movimiento antes de mostrarlo en la interfaz.
- Normalización de nombres de comercio: el índice de similitud de comercios permite mapear «AMZN Mktp ES», «Amazon EU» y variantes similares a una misma entidad, mejorando informes y gráficos de gasto.
- Detección de cargos duplicados: el modelo de casi duplicados del repositorio sirve para alertar al usuario cuando dos transacciones con importe, fecha y comercio similares se han registrado dos veces, un caso frecuente en importaciones mixtas manuales y automáticas.
- Conciliación contable en pymes: clasificar automáticamente los movimientos para asignarlos a cuentas contables y separar ingresos (`income`) de gastos operativos antes de la revisión del contable.
- Análisis de presupuesto y alertas: con las categorías asignadas se pueden calcular desviaciones mensuales por categoría y disparar alertas cuando `food_dining` o `entertainment_recreation` superan el presupuesto definido.
- Procesamiento de transacciones indias y UPI: el autor reporta un holdout específico con 98,85 % de accuracy, lo que lo hace apto para productos financieros dirigidos al mercado indio con descripciones de comercio locales.
- Clasificación por lotes a gran escala: al ser un modelo lineal sobre TF-IDF, permite reprocesar históricos de cientos de miles de transacciones en CPU, algo inviable con un LLM por coste y latencia.

## Benchmarks y rendimiento

| Metrica | Valor declarado |
|---|---|
| Accuracy global (holdout de más de 240.000 transacciones) | 99,30 % |
| Macro-F1 global | 99,32 % |
| Accuracy en holdout de India (banca y UPI) | 98,85 % |
| Macro-F1 en holdout de India | 98,96 % |

No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible, y en cualquier caso no serían aplicables a un clasificador de texto. Tampoco se dispone de desglose por categoría ni de matriz de confusión en la información proporcionada. Los informes por país se anuncian en el directorio `reports/` del repositorio, pero su contenido no se detalla en la model card.

## Requisitos de hardware

- VRAM: no requiere GPU. La inferencia se ejecuta en CPU; se puede reservar 0 GB de VRAM.
- Memoria RAM estimada: no disponible con precisión. El repositorio ocupa 0,6 GB, pero el consumo en ejecución depende de la carga de la matriz TF-IDF y de los coeficientes; un entorno con 1-2 GB de RAM libres es un punto de partida razonable, aunque el autor no lo especifica.
- GPU recomendadas: ninguna. El modelo no aprovecha aceleración por GPU.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU; funciona en cualquier portátil o contenedor con CPU x86.
- Opciones de despliegue: carga directa con `joblib.load` en Python y servicio mediante FastAPI, Flask o similar; contenedor Docker ligero; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia declarada: menos de 5 ms por transacción en CPU estándar. El throughput no se especifica; en un despliegue con varios workers se puede escalar horizontalmente al ser el modelo stateless y de pequeño tamaño.
- Almacenamiento: los 0,6 GB del repositorio incluyen el clasificador y los artefactos auxiliares; conviene comprobar el tamaño individual de cada directorio antes de desplegar.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados en la información proporcionada, y no se han identificado en la búsqueda web modelos de la misma categoría con métricas contrastables. Como referencia cualitativa, sin datos numéricos verificados:

| Alternativa | Tipo | Contexto / idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| Yoge-2004/expense-intelligence-model | TF-IDF + regresión logística calibrada | Entrada corta; inglés | MIT | HuggingFace, 0 descargas |
| Transformers encoder fine-tuned (por ejemplo, DistilBERT o DeBERTa) | Red neuronal supervisada | Mayor coste de inferencia; multilingüe según el checkpoint | Variable | Amplia, pero requiere entrenamiento propio |
| Clasificación por reglas y palabras clave | Sistema determinista | Sin aprendizaje; frágil ante variaciones | Depende del proyecto | Trivial de implementar, difícil de mantener |
| APIs comerciales de enriquecimiento de transacciones | Servicio gestionado | Multilingüe | Propietaria | De pago, dependencia de terceros |

La ventaja específica del modelo analizado frente a un transformer fine-tuned es la latencia (menos de 5 ms en CPU) y la ausencia de requisitos de GPU; su desventaja es la limitación al inglés y la falta de validación independiente.

## Limitaciones y advertencias

- Sesgo de datos: los tres conjuntos citados incluyen un componente sintético y un fuerte peso de transacciones indias y de UPI, lo que puede sesgar el modelo hacia patrones de comercio y nomenclatura de ese mercado pese a la validación por países.
- Riesgo de error en categorías ambiguas: las diez categorías son mutuamente excluyentes, pero descripciones como «Amazon» pueden corresponder a `shopping_retail` o a `entertainment_recreation`, y no se documenta cómo se resuelve esa ambigüedad.
- Sobreajuste a las métricas declaradas: el 99,30 % de accuracy procede del propio autor y no ha sido replicado de forma independiente; el modelo tiene 0 descargas y 0 «likes» en HuggingFace, por lo que no existe validación por parte de la comunidad.
- Idioma: solo se declara inglés. Las descripciones de transacción en castellano, catalán, gallego o euskera no están soportadas y probablemente degraden la precisión.
- Sin capacidad generativa ni conversacional: no puede redactar resúmenes, responder preguntas ni ejecutar herramientas; cualquier funcionalidad de ese tipo debe implementarse con otro modelo.
- Sin ventana de contexto: la entrada debe ser una descripción corta; textos largos (por ejemplo, notas de usuario extensas) pueden diluir las señales TF-IDF y reducir la precisión.
- Ausencia de umbral de confianza documentado: aunque el modelo está calibrado, la model card no indica qué umbral usar para derivar casos a revisión humana, algo crítico en producción.
- Licencia MIT: permite uso comercial, modificación y redistribución con atribución y sin garantía. Es una licencia permisiva, sin restricciones específicas de uso financiero.
- Riesgo regulatorio: clasificar movimientos financieros en un producto real puede entrar en el ámbito de normativas de protección de datos y de servicios financieros; el modelo no incluye ninguna declaración de cumplimiento.
- Mantenimiento incierto: el repositorio se creó y actualizó el mismo día (18 de septiembre de 2026) y no consta actividad posterior, ni una política de versiones o de soporte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yoge-2004/expense-intelligence-model
- Dataset citado: https://huggingface.co/datasets/Ranjit0034/finee-dataset
- Dataset citado: https://huggingface.co/datasets/Sumeetgpt/indian-transaction-categorization-synthetic
- Dataset citado: https://huggingface.co/datasets/mitulshah/transaction-categorization
- Paper, blog técnico, repositorio de código o demo: no disponible en la información proporcionada. La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (únicamente páginas de ayuda de YouTube y listados de bicicletas de segunda mano, sin relación con el contenido).
