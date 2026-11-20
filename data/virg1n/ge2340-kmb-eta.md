# Virg1n/ge2340-kmb-eta

## Resumen

Virg1n/ge2340-kmb-eta es un repositorio de modelos de predicción de tiempos de llegada (ETA) para autobuses de KMB (Kowloon Motor Bus, Hong Kong), desarrollado por el usuario Virg1n en el contexto de un estudio académico vinculado a CityU. No se trata de un modelo de lenguaje ni de un transformer generativo, sino de un conjunto de modelos de regresión cuantílica que predicen cuantiles residuales en segundos respecto al ETA publicado por el operador. El repositorio incluye un ensemble de LightGBM como modelo principal, junto con un modelo empírico, un MLP y un GRU incluidos a efectos comparativos.

La relevancia del trabajo es práctica: el ETA oficial del operador tiene un error absoluto medio (MAE) mediano de 116,16 s en el día completo de validación, mientras que el ensemble de LightGBM reduce esa cifra a 104,50 s. El objetivo del modelo es, por tanto, calibrar y corregir la estimación del operador mediante un desplazamiento residual, no sustituirla.

La información pública es muy limitada: el repositorio tiene 0 GB de tamaño declarado, sin descargas ni likes, sin licencia especificada, sin idiomas declarados y sin pipeline asignado. Los artefactos distribuidos son ficheros joblib y PyTorch destinados al código de investigación que acompaña al estudio, no a un uso directo como servicio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de LightGBM (modelo principal); modelo empírico, MLP y GRU como comparativas |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: modelo tabular/secuencial, no LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | joblib (LightGBM y modelo empírico) y PyTorch (MLP y GRU) |

## Arquitectura y entrenamiento

El modelo principal es un ensemble de gradient boosting basado en LightGBM que realiza regresión cuantílica sobre el residuo en segundos entre el ETA real y el ETA del operador. La variable objetivo es el punto medio de un intervalo de desaparición del ETA, extraído de peticiones archivadas (archival replay). El repositorio incluye además tres alternativas de comparación: un modelo empírico (probablemente basado en distribuciones empíricas de residuos), un perceptrón multicapa (MLP) y una red recurrente GRU implementada en PyTorch, lo que sugiere que el estudio evalúa tanto enfoques tabulares como secuenciales sobre las mismas características.

El entrenamiento se apoya en etiquetas inferidas, no en observaciones directas del tiempo de llegada real, lo que constituye una limitación metodológica explícita del estudio. La model card indica que deben usarse los offsets de calibración y el preprocesado de características neuronales suministrados junto con el modelo correspondiente; sin ellos, las predicciones no son válidas. No se especifica el número de muestras, el periodo de entrenamiento, la composición del dataset ni si hubo ajuste fino posterior.

## Capacidades

- Predicción de cuantiles residuales de ETA en segundos respecto a la estimación del operador KMB.
- Regresión cuantílica: permite obtener intervalos de incertidumbre, no solo un punto estimado.
- Ensemble de LightGBM como modelo de referencia con mejor MAE mediano en el día de validación.
- Modelo empírico, MLP y GRU incluidos para comparación de enfoques.
- Preprocesado de características neuronales específico para los modelos MLP y GRU.
- Offsets de calibración para corregir la salida antes de su uso.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Corrección del ETA mostrado al usuario en apps de transporte: el modelo predice el residuo respecto al ETA del operador y permite ajustar la hora de llegada mostrada, reduciendo el error mediano en unos 11,7 s según la validación publicada.
- Estimación de intervalos de llegada: al ser regresión cuantílica, permite ofrecer rangos (por ejemplo, percentiles 10-90) en lugar de una única hora, mejorando la comunicación de incertidumbre al pasajero.
- Planificación de transbordos: con cuantiles residuales se puede calcular la probabilidad de perder una conexión y ajustar recomendaciones de salida.
- Análisis de fiabilidad por línea y franja horaria: el ensemble permite estudiar qué rutas y horas concentran mayor desviación respecto al ETA del operador.
- Reproducción de investigación: el repositorio está pensado para ejecutarse con el código de investigación adjunto, sirviendo como base para replicar o extender el estudio con otros operadores.
- Comparación de metodologías: los modelos empírico, MLP y GRU permiten evaluar en un mismo conjunto de datos si los enfoques secuenciales aportan ventaja frente al gradient boosting tabular.
- Despliegue en backend de bajo coste: al ser LightGBM con artefactos joblib, la inferencia es ligera en CPU y encaja en servicios de predicción por lotes o en tiempo casi real sin GPU.

## Benchmarks y rendimiento

| Modelo | MAE mediano en el día completo de validación |
|---|---|
| ETA del operador (referencia) | 116,16 s |
| LightGBM (ensemble) | 104,50 s |
| Modelo empírico | no disponible |
| MLP | no disponible |
| GRU | no disponible |

El estudio emplea etiquetas inferidas y una reproducción a partir de archivo (archival replay), por lo que las cifras deben interpretarse en ese contexto y no como una validación en producción en tiempo real.

## Requisitos de hardware

- Inferencia en CPU: LightGBM con artefactos joblib no requiere GPU; es adecuado paraservicios en contenedor sin acelerador.
- Los modelos MLP y GRU en PyTorch pueden ejecutarse en CPU para lotes pequeños; para lotes grandes o baja latencia, una GPU consumer (por ejemplo, RTX 3060 o superior) es suficiente, aunque no se publican requisitos concretos.
- VRAM estimada: no disponible; por el tipo de modelo (tabular y red pequeña) se espera muy por debajo de 1 GB, pero no hay dato confirmado.
- Opciones de despliegue: carga directa con joblib para LightGBM; PyTorch para MLP y GRU. No se documenta integración con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | MAE mediano | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Virg1n/ge2340-kmb-eta (LightGBM) | Ensemble de gradient boosting | Regresión cuantílica residual | 104,50 s | no disponible | Hugging Face (repo de investigación) |
| Virg1n/ge2340-kmb-eta (MLP) | Red neuronal feedforward | Regresión sobre características | no disponible | no disponible | Hugging Face |
| Virg1n/ge2340-kmb-eta (GRU) | Red recurrente | Regresión sobre secuencias | no disponible | no disponible | Hugging Face |
| ETA del operador KMB | Sistema propietario | Estimación del operador | 116,16 s | no disponible | Producción |

No se dispone de información sobre otros modelos públicos comparables de predicción de ETA para KMB en la documentación proporcionada.

## Limitaciones y advertencias

- Las etiquetas de entrenamiento son inferidas, no observaciones directas del tiempo de llegada; esto introduce incertidumbre en la evaluación.
- La validación se realiza sobre un único día completo en modo replay, no en producción en vivo.
- El modelo predice residuos respecto al ETA del operador: no es utilizable de forma autónoma sin ese ETA de entrada.
- Requiere los offsets de calibración y el preprocesado de características neuronales específicos; sin ellos las predicciones no son válidas.
- Licencia no especificada: no se puede asumir uso comercial permitido.
- El repositorio declara 0 GB de tamaño y no tiene descargas ni likes; la disponibilidad y completitud de los artefactos no está garantizada.
- No hay información sobre sesgos por línea, franja horaria, condiciones meteorológicas o eventos especiales.
- No es un modelo de lenguaje: no admite prompts, tool calling ni razonamiento multi-paso.

## Enlaces

- Hugging Face: https://huggingface.co/Virg1n/ge2340-kmb-eta
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
