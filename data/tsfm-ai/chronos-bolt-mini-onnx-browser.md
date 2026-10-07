# TSFM-ai/chronos-bolt-mini-onnx-browser

## Resumen

Chronos-Bolt Mini for browser forecasting es una exportación a ONNX del modelo base `amazon/chronos-bolt-mini`, publicada por TSFM-ai. Se trata de un grafo completo de previsión (encoder y decoder incluidos) que ejecuta el modelo original de Amazon sobre ONNX Runtime Web con backend WASM, es decir, directamente en la CPU del navegador del visitante, sin inferencia en servidor. El artefacto surge de la revisión `251268337516a88e253628c43e1d26ec577b376b` del modelo de Amazon.

El modelo resuelve previsión zero-shot univariante de series temporales. Recibe un contexto fijo de 512 pasos y devuelve, en una sola pasada, 64 pasos de horizonte para nueve cuantiles (0,1 a 0,9). Esta salida directa de cuantiles evita la decodificación autorregresiva, lo que encaja con un despliegue en cliente donde la latencia y el coste de cómputo importan. Su relevancia actual radica en que permite llevar previsión probabilística a aplicaciones web sin infraestructura de servidor, manteniendo los datos del usuario en el dispositivo.

Según la ficha del modelo base en TSFM.ai, Chronos-Bolt Mini es un checkpoint de aproximadamente 21 millones de parámetros, un escalón por encima de Chronos-Bolt Tiny (9M) dentro de la familia Chronos-Bolt de Amazon. El repositorio de esta exportación ocupa unos 0,1 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Exportacion ONNX del modelo base `amazon/chronos-bolt-mini` (familia Chronos-Bolt de Amazon); encoder y decoder completos, grafo con contexto fijo de 512 pasos y salida directa de cuantiles |
| Parametros totales | Aproximadamente 21 millones (segun la ficha del modelo base en TSFM.ai) |
| Parametros activos | No aplica (no es un modelo MoE; dato no disponible) |
| Longitud de contexto | 512 pasos fijos (`context`, float32 `[1,512]`, serie univariante; historiales mas cortos se rellenan por la izquierda con NaN) |
| Tipos de cuantizacion | No disponible; el artefacto exportado trabaja en float32 |
| Idiomas soportados | No aplicable (modelo de series temporales, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (grafo ONNX para ONNX Runtime Web / WASM) |

## Arquitectura y entrenamiento

La arquitectura y los pesos son de Amazon; TSFM-ai aporta unicamente la exportacion a ONNX para navegador. El grafo incluye el encoder y el decoder completos, con un contexto de entrada fijo de 512 pasos y una salida de cuantiles de forma `[1,9,64]`: nueve cuantiles (0,1 a 0,9, en orden ascendente, con la mediana en el indice 4) para un horizonte maximo de 64 pasos. Los valores de salida ya estan en la escala de la serie original. No hay covariables ni controles de muestreo en este artefacto.

El proceso de exportacion se realizo con Python 3.12, `chronos-forecasting` 2.3.2, `torch` 2.14.1, `transformers` 5.19.0, `onnx` y `onnxruntime`. Las adaptaciones del export sustituyen `nanmean` no soportado por reducciones enmascaradas equivalentes, reemplazan `unfold` no solapado por `reshape` y fuerzan indices enteros en los embeddings. El resultado es un grafo de contexto fijo. La ejecucion en navegador emplea ONNX Runtime Web WASM sobre la CPU del visitante, sin intervencion de inferencia en servidores de TSFM. Los detalles de composicion del dataset de entrenamiento, numero de tokens y uso de RLHF/DPO no estan disponibles en la informacion proporcionada.

## Capacidades

- Prevision zero-shot de series temporales univariantes sin reentrenamiento ni ajuste por serie.
- Forecast probabilistico: emite nueve cuantiles (0,1 a 0,9) para cada paso del horizonte, lo que permite construir intervalos de prediccion y no solo un valor puntual.
- Prediccion multi-paso directa de hasta 64 pasos en una sola pasada, sin decodificacion autorregresiva.
- Manejo de observaciones ausentes: el contexto admite valores NaN, y los historiales mas cortos de 512 pasos se rellenan por la izquierda con NaN.
- Salida en la escala original de la serie, sin necesidad de desnormalizar manualmente.
- Ejecucion en el navegador del cliente mediante ONNX Runtime Web WASM, lo que permite inferencia en el dispositivo.
- No soporta covariables exogenas ni controles de muestreo en este artefacto.
- No dispone de tool calling, capacidades de agente, vision, audio ni funciones multimodales (no aplicable a un modelo de series temporales).

## Casos de uso

- Paneles de previsión sin backend: una aplicacion web puede cargar el grafo ONNX y calcular la previsión de metricas directamente en el navegador, eliminando la necesidad de desplegar y escalar un servicio de inferencia.
- Analitica con privacidad de datos: al ejecutarse en la CPU del visitante, la serie historica no abandona el dispositivo, lo que resulta adecuado para datos financieros, sanitarios o internos de empresa con requisitos de confidencialidad.
- Aplicaciones offline o en edge: escenarios con conectividad intermitente o dispositivos sin GPU pueden seguir generando previsiones gracias al backend WASM sobre CPU.
- Prevision de demanda y ventas a corto plazo: con un horizonte de hasta 64 pasos, encaja en la planificacion operativa de stock diario o semanal a partir del historial inmediato de cada producto.
- Relleno y saneado de series con huecos: el soporte de NaN en la entrada permite alimentar series con observaciones faltantes y obtener estimaciones completas del tramo futuro.
- Demos y herramientas educativas: notebooks y aplicaciones interactivas que ilustran prevision probabilistica en el navegador sin coste de servidor, utiles para ensenar intervalos de prediccion sobre datos reales.
- Alertas y umbrales en cliente: comparar los cuantiles previstos con umbrales operativos para anticipar desviaciones en metricas de negocio o de infraestructura dentro de la propia pagina.
- Validacion cruzada ligera en formularios o asistentes web: estimar rapidamente la tendencia esperada de una metrica introducida por el usuario antes de enviarla al backend para un analisis mas profundo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion reportada es numerica y local, comparando la salida del grafo ONNX en CPU con la implementacion original de PyTorch sin modificar:

| Prueba | Casos | Error absoluto maximo |
|---|---|---|
| ONNX en CPU frente a PyTorch | Siete casos sinteticos (tendencia/estacionalidad, constante, cero, negativa, aleatoria, historia corta e historia con huecos) | 0,000046 |
| ONNX Runtime Web WASM en Chrome | Siete casos | 0,000031 |

El autor advierte que estas son comprobaciones numericas locales y no garantizan compatibilidad amplia entre dispositivos ni rendimiento en produccion. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- El artefacto no requiere GPU: la inferencia se ejecuta en CPU mediante ONNX Runtime Web con backend WASM.
- El repositorio ocupa aproximadamente 0,1 GB; los pesos en float32 de un modelo de unos 21 millones de parametros rondan las decenas de megabytes, aunque el dato exacto de tamano del grafo no esta disponible.
- Al ejecutarse en navegador, los requisitos reales dependen del dispositivo del visitante; no se especifican minimos de memoria ni de CPU.
- Opciones de despliegue: ONNX Runtime Web (WASM) en navegador; el mismo grafo ONNX es compatible con `onnxruntime` fuera del navegador, aunque eso no es el objetivo declarado del artefacto.
- No hay datos publicados de latencia ni de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / horizonte | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TSFM-ai/chronos-bolt-mini-onnx-browser (esta ficha) | ~21M (base) | Contexto 512, horizonte 64, 9 cuantiles | ONNX para navegador | Apache 2.0 | Hugging Face (0 descargas, 0 likes al registrar la ficha) |
| amazon/chronos-bolt-mini | ~21M | Modelo base del que deriva esta exportacion | PyTorch | Apache 2.0 | Hugging Face |
| Chronos-Bolt Tiny | ~9M | Checkpoint mas pequeno de la familia, orientado a latencia y alto volumen | No disponible | Apache 2.0 | Hugging Face |
| Chronos-2 (familia) | No disponible | Generacion posterior de la familia Chronos | No disponible | No disponible | Hugging Face |

Los datos de parametros de Chronos-Bolt Mini y Tiny proceden de las fichas de TSFM.ai sobre los modelos de Amazon. No se dispone de comparativas de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo univariante: solo acepta una serie por inferencia y no admite covariables exogenas ni controles de muestreo en este artefacto.
- Contexto fijo de 512 pasos y horizonte maximo de 64; no se puede ampliar sin reexportar el grafo.
- No se han publicado resultados de benchmarks amplios; la unica validacion son comprobaciones numericas locales frente a PyTorch, que no garantizan compatibilidad entre dispositivos ni rendimiento.
- La prevision zero-shot puede degradarse en series muy distintas de las vistas en el entrenamiento; no se documentan aqui sus sesgos ni su composicion de datos.
- Riesgo de error en la prediccion inherente a todo modelo estadistico: los cuantiles son estimaciones y no deben tratarse como certezas en decisiones criticas.
- Los requisitos de memoria y CPU en el navegador dependen del dispositivo del visitante; no se especifican minimos y el rendimiento puede variar notablemente.
- Licencia Apache 2.0, que en principio permite uso comercial, pero conviene revisar las condiciones del modelo base de Amazon antes de desplegarlo en produccion.
- El autor no ofrece garantias de compatibilidad amplia entre navegadores ni de rendimiento; la unica verificacion en navegador reportada se hizo en Chrome.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TSFM-ai/chronos-bolt-mini-onnx-browser
- Modelo base: https://huggingface.co/amazon/chronos-bolt-mini
- Repositorio upstream de Chronos: https://github.com/amazon-science/chronos-forecasting
- Ficha de Chronos-Bolt Mini en TSFM.ai: https://tsfm.ai/models/amazon/chronos-bolt-mini
- Ficha de Chronos-Bolt Tiny en TSFM.ai: https://tsfm.ai/models/amazon/chronos-bolt-tiny
- Perfil de TSFM-ai en Hugging Face: https://huggingface.co/TSFM-ai
- Sitio de la familia Chronos: https://chronos-ts.ai/
- Ficha de chronos-bolt-mini en Inferix: https://inferix.co/models/autogluon/chronos-bolt-mini
