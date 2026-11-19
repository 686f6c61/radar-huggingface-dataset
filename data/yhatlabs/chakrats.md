# yhatlabs/ChakraTS

## Resumen

ChakraTS es un modelo fundacional de previsión de series temporales de tipo probabilístico desarrollado por YHat Labs. No se distribuye como pesos descargables: el repositorio de Hugging Face aloja únicamente la model card y el acceso se realiza a través de una API alojada (`https://api.yhatlabs.com/v1/series/forecast`) o mediante la librería Python `yhatlabs`. El modelo resuelve el problema de generar pronósticos con incertidumbre cuantificada (cuantiles por paso futuro) sobre series nuevas, sin necesidad de reentrenamiento específico.

La propuesta técnica se apoya en tres ejes: previsión zero-shot sobre series no vistas durante el entrenamiento, soporte de covariables pasadas y futuras conocidas (numéricas o categóricas) y previsión conjunta de múltiples objetivos por serie. Admite frecuencias regulares desde segundos hasta años, contextos de hasta 32.768 puntos pasados y horizontes de hasta 2.048 pasos. La salida por defecto es un array `[horizon, 9]` de cuantiles (niveles 0,1 a 0,9), con la mediana como pronóstico puntual.

Su relevancia actual radica en los resultados declarados por el autor en tres benchmarks de referencia del sector: primer puesto por win rate en fev-bench de Amazon, segundo entre modelos no agénticos en GIFT-Eval de Salesforce y primer puesto por rango MASE en TIME. Estos resultados, junto con la disponibilidad de presets `fast` y `pro`, lo sitúan como una alternativa gestionada frente a modelos fundacionales de series temporales de pesos abiertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fundacional de series temporales; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 32.768 puntos pasados por serie |
| Tipos de cuantizacion | no disponible (servicio alojado; no se distribuyen pesos) |
| Idiomas soportados | no disponible (no aplica: entrada numérica de series temporales) |
| Licencia | yhat-labs-api-terms (Other) |
| Formato de pesos | no disponible (no hay pesos descargables; acceso vía API) |

Otras especificaciones operativas declaradas por el autor:

| Parametro | Valor |
|---|---|
| Horizonte máximo | 2.048 pasos |
| Objetivos por serie | uno o varios, previstos conjuntamente |
| Covariables | pasadas y futuras conocidas, numéricas o categóricas |
| Valores faltantes | permitidos, marcados como `null` |
| Salida | cuantiles a cualquier nivel (por defecto 0,1 a 0,9) y trayectorias muestrales |
| Batching | hasta 256 series por petición; la librería Python divide entradas mayores |
| Presets | `fast` (por defecto) y `pro` (más preciso, más lento) |
| Entrenamiento sobre datos del usuario | no necesario; ajuste opcional sobre histórico propio |
| Frecuencias | cualquier frecuencia regular, de segundos a años |

## Arquitectura y entrenamiento

El autor no publica detalles sobre la arquitectura interna (tipo de transformer, mecanismo de atención, diseño de la cabeza probabilística ni volumen o composición del corpus de entrenamiento). La información disponible se limita a las capacidades funcionales: previsión zero-shot sobre series no vistas, incorporación de covariables pasadas y futuras conocidas, previsión multiobjetivo conjunta y emisión de cuantiles por paso. Tampoco se documenta si hubo fases de ajuste por refuerzo, preferencias o calibración posterior.

La innovación destacable, según la model card, es la combinación de contexto largo (32.768 puntos), horizonte largo (2.048 pasos) y covariables en un único modelo servido por API, con dos presets que permiten intercambiar latencia por precisión. El ajuste opcional sobre el histórico del usuario se ofrece como mecanismo de adaptación sin reentrenamiento obligatorio.

## Capacidades

- Previsión probabilística de series temporales con cuantiles por paso futuro (niveles configurables; por defecto 0,1 a 0,9) y trayectorias muestrales.
- Previsión zero-shot sobre series nuevas, sin entrenamiento específico.
- Soporte de covariables pasadas y futuras conocidas, tanto numéricas como categóricas (promociones, precios, calendario, previsiones publicadas).
- Previsión conjunta de varios objetivos dentro de una misma serie.
- Manejo de valores faltantes marcados como `null`.
- Frecuencias regulares arbitrarias, desde segundos hasta años.
- Procesamiento por lotes de hasta 256 series por petición.
- Ajuste opcional sobre el histórico propio del usuario.
- Dos presets de servicio: `fast` (por defecto) y `pro` (mayor precisión, mayor latencia).
- No incluye visión, audio, generación de texto, tool calling ni razonamiento multi-paso: el alcance es exclusivamente numérico y de series temporales.

## Casos de uso

- Previsión de carga eléctrica y precios: el modelo acepta previsiones publicadas de generación renovable como covariables futuras conocidas y devuelve intervalos de predicción por hora, lo que permite dimensionar reservas y coberturas con una medida explícita de riesgo.
- Demanda minorista por producto y localización: con contexto de hasta 32.768 puntos y covariables de promociones, precios y calendario, se pueden generar pronósticos por SKU y tienda en una sola petición por lotes de hasta 256 series.
- Planificación de capacidad e infraestructura: previsión de tráfico, volumen de llamadas o métricas de nube y sensores, usando el preset `fast` para ciclos de refresco frecuentes y `pro` para planificación a más largo plazo.
- Proyección financiera con intervalos: ingresos, flujo de caja y KPI con cuantiles explícitos, útiles para escenarios presupuestarios y análisis de sensibilidad.
- Análisis de escenarios y backtesting: evaluación con origen móvil (rolling-origin) sobre el histórico propio y reejecución de la misma serie bajo trayectorias alternativas de covariables.
- Ajuste fino sobre histórico propio: cuando el dominio lo justifica, el ajuste opcional sobre datos del cliente permite adaptar el modelo sin construir un pipeline de entrenamiento desde cero.
- Operaciones de inventario y cadena de suministro: previsión multiobjetivo conjunta (por ejemplo, demanda y devoluciones) para una misma serie, con valores faltantes admitidos en el histórico.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente en la información disponible), con el preset `pro`:

| Benchmark | Métrica | Valor | Posición declarada |
|---|---|---|---|
| fev-bench (Amazon) | Win rate (100 tareas) | 0,893 | 1.º por win rate |
| fev-bench (Amazon) | Scaled quantile loss skill score (100 tareas) | 51,3 | — |
| GIFT-Eval (Salesforce) | MASE (media geométrica, relativa a seasonal naive) | 0,644 | 2.º entre modelos no agénticos |
| GIFT-Eval (Salesforce) | CRPS (media geométrica, relativa a seasonal naive) | 0,438 | — |
| TIME | MASE (media geométrica, relativa a seasonal naive, 98 tareas) | 0,624 | 1.º por rango MASE |
| TIME | CRPS (media geométrica, relativa a seasonal naive, 98 tareas) | 0,523 | — |

En GIFT-Eval y TIME las puntuaciones están normalizadas por seasonal naive (menor es mejor). Los ficheros de resultados y el código de reproducción están en el repositorio `yhatlabs-cookbook`.

## Requisitos de hardware

- No aplica VRAM local para el modelo: ChakraTS se sirve exclusivamente por API y no se distribuyen pesos.
- El cliente solo requiere un entorno Python con la librería `yhatlabs` (`pip install yhatlabs`) y una clave `YHAT_API_KEY`; el coste computacional recae en la infraestructura de YHat Labs.
- No se especifican GPU recomendadas, opciones de despliegue local (vLLM, llama.cpp, Ollama, TGI) ni requisitos de memoria, al no existir artefactos de pesos.
- Latencia y throughput: no disponibles. El autor solo indica que el preset `pro` es más lento que `fast`, sin cifras.
- Límite operativo relevante: 256 series por petición; la librería Python divide automáticamente entradas mayores.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones directas con modelos concretos. La model card cita el posicionamiento relativo en tres leaderboards (fev-bench, GIFT-Eval y TIME), pero no ofrece cifras de modelos competidores. Los datos comparativos disponibles se limitan a las posiciones declaradas:

| Criterio | ChakraTS | Alternativas de la misma categoría |
|---|---|---|
| Tipo de acceso | API alojada, sin pesos | no disponible |
| Contexto | 32.768 puntos | no disponible |
| Horizonte | 2.048 pasos | no disponible |
| Covariables | pasadas y futuras, numéricas y categóricas | no disponible |
| Licencia | yhat-labs-api-terms | no disponible |
| Posición en fev-bench | 1.º por win rate (0,893) | no disponible |
| Posición en GIFT-Eval | 2.º entre no agénticos (MASE 0,644) | no disponible |
| Posición en TIME | 1.º por rango MASE (0,624) | no disponible |

## Limitaciones y advertencias

- No hay pesos descargables: el modelo no puede ejecutarse en local ni auditarse internamente; toda inferencia pasa por la API de YHat Labs.
- Licencia `yhat-labs-api-terms`: el uso comercial y el tratamiento de los datos de las peticiones se rigen por los términos de YHat Labs, que deben revisarse antes de integrar el servicio en producción.
- Los resultados de benchmarks son declarados por el autor y figuran como no verificados; conviene reproducirlos con el cookbook antes de tomar decisiones críticas.
- No está pensado para series sin índice temporal regular.
- Con historiales muy cortos devuelve pronósticos, pero con intervalos amplios; la fiabilidad en series de pocos puntos es limitada.
- No realiza clasificación ni etiquetado de anomalías; para predicción sobre datos tabulares el autor remite a ChakraTab.
- No se documentan sesgos, tasas de alucinación ni comportamiento por idioma, al no ser un modelo de lenguaje.
- Dependencia de un proveedor externo: latencia, disponibilidad, límites de uso y política de retención de datos vienen impuestos por el servicio.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción pública aún incipiente pese a los resultados declarados.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/yhatlabs/ChakraTS
- Sitio web de YHat Labs: https://yhatlabs.com
- Acceso a la API: https://yhatlabs.com/models/access
- Términos de uso: https://yhatlabs.com/terms
- Librería Python (GitHub): https://github.com/yhatlabs/yhatlabs-python
- Cookbook con recetas y ficheros de benchmark: https://github.com/yhatlabs/yhatlabs-cookbook
- Resultados de benchmarks reproducibles: https://github.com/yhatlabs/yhatlabs-cookbook/tree/main/benchmarks
- Leaderboard fev-bench: https://huggingface.co/spaces/autogluon/fev-leaderboard
- Leaderboard GIFT-Eval: https://huggingface.co/spaces/Salesforce/GIFT-Eval
- Leaderboard TIME: https://huggingface.co/spaces/Real-TSF/TIME-leaderboard
- Modelo tabular relacionado (ChakraTab): https://huggingface.co/yhatlabs/ChakraTab
