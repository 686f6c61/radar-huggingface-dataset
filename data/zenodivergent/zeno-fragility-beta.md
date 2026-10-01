# ZenoDivergent/zeno-fragility-beta

## Resumen

Zeno Fragility Beta es un modelo de clasificación tabular desarrollado por ZenoDivergent que no genera pronósticos, sino que evalúa la fragilidad de los pronósticos ya emitidos por otros sistemas. Se presenta como un "modelo de modelos": observa forecasteros existentes (mercados de predicción, modelos meteorológicos, hubs epidemiológicos, economistas, mercados financieros y modelos de IA) y aprende cuándo un pronóstico confiado está a punto de fallar, comparándolo con cómo fallaron pronósticos similares en el pasado. La sorpresa se mide siempre contra una referencia nombrada: la multitud, el historial previo del propio forecastero o sus pares.

Técnicamente es un conjunto de árboles con boosting por gradiente (gradient-boosted trees) con un fallback logístico, uno por fuente, implementado con scikit-learn. El modelo completo contiene únicamente 62.880 parámetros aprendidos (umbrales de división de árboles, valores de hoja y pesos logísticos para 6 fuentes), almacenados en `model.safetensors`. Recibe 6 señales de entrada por pronóstico y devuelve la probabilidad de que un pronóstico confiado resulte estar equivocado.

Es relevante porque ataca un problema poco cubierto: la detección de fallos en pronósticos ajenos antes de que ocurran, en lugar de producir una predicción más. Esta es la primera publicación oficial del proyecto y se describe explícitamente como un modelo pequeño y temprano, entrenado sobre 2,0 millones de registros de pronóstico con datos congelados y verificados antes del entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Árboles con boosting por gradiente (gradient-boosted trees) por fuente, con fallback logístico (scikit-learn) |
| Parametros totales | 62.880 números aprendidos (umbrales de división, valores de hoja y pesos logísticos de 6 fuentes) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no aplicable (modelo tabular con 6 características de entrada por pronóstico) |
| Tipos de cuantizacion | no aplicable (modelo de árboles; exportación en ONNX en float32) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`), ONNX (`onnx/<source>.onnx`), pickle de scikit-learn (`warning/<source>.pkl`) |

## Arquitectura y entrenamiento

La arquitectura no es un transformer ni una red neuronal: es un conjunto de árboles con boosting por gradiente por fuente, con un clasificador logístico como respaldo, implementado sobre scikit-learn. Cada modelo de fuente lee 6 señales por pronóstico: distancia a la multitud (crowd distance), historial de aciertos a largo plazo frente a la multitud, historial reciente frente a la multitud, dispersión de la multitud (crowd spread), tamaño de la multitud y confianza propia del forecastero. La salida es una probabilidad entre 0 y 1 de que un pronóstico confiado sea confiadamente erróneo.

El entrenamiento se realizó sobre el corpus Offdiagonal, formado por 2,0 millones de registros de pronóstico de 9 fuentes, con instantánea congelada identificada como `ep-20261001T0533Z-v035` y fingerprint previo al entrenamiento. La ejecución del modelo es `v038-full-20261001T1537Z` y se hizo únicamente en CPU. Se aplicaron divisiones ordenadas temporalmente y comprobaciones de fuga de datos (leak checks). El autor indica que redes neuronales previas de mayor tamaño (2M-32M parámetros, entrenadas en una A100) memorizaban ruido y perdían frente a la media simple de la multitud en datos reservados, por lo que se conservó el modelo pequeño como la versión que resistió la validación. Una versión neuronal mayor, preentrenada sobre los 2,0 millones de registros de comportamiento de forecasteros, queda como siguiente paso y solo se mantendría si supera a esta línea base en datos no vistos.

## Capacidades

- Clasificación tabular binaria: estima la probabilidad de que un pronóstico confiado resulte fallido.
- Meta-forecasting: evalúa el comportamiento de otros forecasteros en lugar de predecir el fenómeno subyacente.
- Detección temprana (early warning) de fragilidad en pronósticos, con una puntuación de advertencia entre 0 y 1.
- Aprendizaje de correcciones de multitud: incorpora un componente "crowd corrector", aunque de momento no se sirve para ninguna fuente porque no supera a la media simple en datos de confirmación.
- Soporte multicanal por fuente: dispone de modelos separados para `crypto`, `ecb`, `forecastbench`, `health_rsv`, `market` y `physical`.
- Inferencia multi-lenguaje mediante ONNX, sin dependencia de scikit-learn.
- Explicabilidad por diseño: al ser árboles con boosting, las decisiones se basan en 6 señales interpretables (distancia a la multitud, historial, dispersión, tamaño y confianza).

No se documentan capacidades de generación de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso.

## Casos de uso

- Aviso de fragilidad en mercados de predicción: dado un pronóstico con alta confianza (por ejemplo 0,82) y el vector de la multitud, el modelo devuelve la probabilidad de que ese pronóstico falle. En mercados de predicción, el 10 % de pronósticos marcados como más frágiles falla 1,3 veces más que el pronóstico confiado medio, útil para dimensionar posiciones.
- Monitorización de mercados de criptomonedas: con una puntuación de advertencia de 0,57 frente a 0,44 de la regla de distancia a la multitud, sirve para marcar señales confiadas que conviene revisar antes de operar.
- Vigilancia epidemiológica (RSV): el modelo identifica el 10 % de pronósticos confiados más frágiles, que fallan 2,3 veces más que la media, adecuado para activar protocolos de verificación adicional en hubs sanitarios.
- Auditoría de encuestas de economistas (BCE): aunque su puntuación (0,41) aún no supera al azar, permite experimentar con la detección de fragilidad en previsiones macroeconómicas antes de darles peso en decisiones.
- Participación en ForecastBench: el modelo obtiene 0,82 de puntuación de advertencia con un lift de 5,2× en las preguntas de ForecastBench, lo que lo convierte en candidato para someterse a un leaderboard público junto a modelos de IA y superforecasteros humanos.
- Análisis de dependencia entre modelos meteorológicos: en sensórica física, 21-24 modelos meteorológicos se comportan como solo unos 4 forecasteros independientes, lo que permite identificar puntos ciegos compartidos donde se originan los fallos confiados.
- Integración en pipelines de agregación de pronósticos: como modelo ONNX ligero, puede incrustarse en cualquier servicio para ponderar o descartar señales confiadas antes de combinarlas.
- Corrección de multitud: el componente crowd corrector, una vez supere a la media simple en datos de confirmación, permitirá ajustar agregados de multitud sobreconfiados (en pruebas con señal plantada corrige una multitud sobreconfiada en +4,6 %).

## Benchmarks y rendimiento

Datos de fragilidad por fuente publicados por el autor en la model card. La columna "Zeno warning" es la puntuación de 0 a 1 sobre cómo el modelo ordena los pronósticos confiados que después fallan (0,5 equivale a azar). "Top-10 % lift" indica cuántas veces más fallan los pronósticos más marcados respecto al pronóstico confiado medio.

| Fuente | Zeno warning | Regla de distancia a la multitud | Top-10 % lift | Estado |
|---|---|---|---|---|
| Mercados de predicción | 0,67 (≥ 0,60) | 0,37 | 1,3× | advierte antes que ambas reglas simples |
| Crypto | 0,57 (≥ 0,55) | 0,44 | 1,8× | supera la regla de distancia a la multitud |
| RSV | 0,64 (≥ 0,59) | 0,54 | 2,3× | supera la regla de distancia a la multitud |
| Encuestas de economistas del BCE | 0,41 (≥ 0,38) | 0,18 | 0,3× | todavía no mejor que el azar |
| Preguntas de ForecastBench | 0,82 (≥ 0,56) | 0,70 | 5,2× | candidato |

Pruebas con señal plantada: el modelo detecta un forecastero hábil oculto (+7,5 %), corrige una multitud sobreconfiada (+4,6 %) y no hace nada cuando no hay señal. Las fuentes de meteorología, gripe y COVID aún no están puntuadas porque sus pronósticos no proporcionan suficientes rangos confiados de 3 o más forecasteros por resultado. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: despreciable; el modelo completo tiene 62.880 parámetros (por debajo de 1 MB) y se ejecuta en CPU.
- GPU recomendadas: ninguna en particular; el entrenamiento descrito se realizó íntegramente en CPU.
- Compatibilidad con GPU de consumo: cabe en cualquier dispositivo, incluidos sistemas sin GPU dedicada.
- Opciones de despliegue: `onnxruntime` (recomendado para uso multi-lenguaje), scikit-learn mediante pickle, o el paquete propio `zeno_fragility` con las funciones `load`, `crowd_features` y `warn`.
- Latencia y throughput estimados: no disponible.

Ejemplo de uso con ONNX (orden de características: crowd_distance, log_record_long, log_record_recent, crowd_spread, log_crowd_size, own_confidence):

```python
import numpy as np, onnxruntime as ort
from huggingface_hub import hf_hub_download
sess = ort.InferenceSession(hf_hub_download("ZenoDivergent/zeno-fragility-beta", "onnx/market.onnx"))
x = np.array([[2.1, -0.15, -0.03, 0.9, 1.8, 0.64]], dtype=np.float32)
print(sess.run(None, {"features": x})[1][0, 1])   # probabilidad de fallo confiado
```

## Comparativa con modelos similares

No se dispone de modelos públicos equivalentes de meta-pronóstico de fragilidad en la información proporcionada. La comparación más cercana son las líneas base internas citadas por el autor:

| Alternativa | Tipo | Parámetros | Rendimiento (warning) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zeno Fragility Beta | GBDT por fuente + logístico | 62.880 | 0,41-0,82 según fuente | apache-2.0 | HuggingFace |
| Regla de distancia a la multitud | Regla heurística simple | 0 | 0,18-0,70 según fuente | no aplicable | línea base interna |
| Media simple de la multitud | Agregado sin ponderación | 0 | usada como referencia de seguridad | no aplicable | línea base interna |
| Red neuronal previa (descartada) | Red neuronal (2M-32M) | 2.000.000-32.000.000 | peor que la media simple en datos reservados | no disponible | no publicada |

No se han identificado alternativas de terceros comparables en la información disponible.

## Limitaciones y advertencias

- Es una primera publicación "pequeña y temprana"; el propio autor la describe como honesta por diseño y diseñada para crecer con más historial de pronósticos.
- En encuestas de economistas del BCE el modelo no supera el azar (0,41 de warning frente a 0,18 de la regla simple), por lo que no debe usarse para decisiones en esa fuente.
- El corrector de multitud no se sirve para ninguna fuente: una regla de seguridad mantiene la media simple de la multitud hasta que el corrector la supere tanto en test como en datos de confirmación.
- Cobertura limitada: las fuentes de meteorología, gripe y COVID aún no están puntuadas por falta de datos suficientes. La sensórica física está en proceso de incorporación.
- Dependencia del corpus de entrenamiento: los resultados están ligados a la instantánea congelada `ep-20261001T0533Z-v035` de 2,0 millones de registros; cambios en la distribución de forecasteros pueden degradar el rendimiento.
- Riesgo de sobreajuste a las fuentes entrenadas: los modelos son específicos por fuente, no un modelo general transferible.
- Idiomas soportados: no disponible (el modelo trabaja con señales numéricas, no con texto).
- Aunque la licencia es apache-2.0 y permite uso comercial, el autor no ofrece garantías de rendimiento en producción para todas las fuentes.
- El repositorio aparece con 0 descargas y 1 "like" en el momento de la consulta, indicando adopción todavía muy limitada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ZenoDivergent/zeno-fragility-beta
- Arquitectura e investigación: https://zenodivergent.dev/model
- Sitio del proyecto: https://zenodivergent.dev/
- Run de entrenamiento en directo: https://zenodivergent.dev/live-read
- Publicación en X sobre ForecastBench: https://x.com/zenoVision_/status/2103894540411420723
- Publicación en X sobre el laboratorio abierto: https://x.com/zenoVision_/status/2102181483838418986
- Perfil de la organización en HuggingFace: https://huggingface.co/zeno-ai/models
