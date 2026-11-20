# Virg1n/ge2340-mtr-eta

## Resumen

El modelo `ge2340-mtr-eta` es un artefacto de aprendizaje automatico publicado por el usuario Virg1n en Hugging Face, orientado a la prediccion de intervalos de llegada (ETA) residuales para el sistema de metro MTR de Hong Kong. No se trata de un modelo de lenguaje ni de una red neuronal profunda, sino de un conjunto de modelos LightGBM calibrados que predicen correcciones sobre cuantiles empiricos de residuos de ETA, es decir, ajustan la incertidumbre de las estimaciones de llegada de trenes en tiempo real.

El modelo resuelve un problema concreto de ingenieria del transporte: la ETA que ofrece el operador tiene un error elevado (MAE de 49,76 s segun la model card), y este artefacto busca reducirlo corrigiendo los cuantiles empiricos con informacion reciente de errores confirmados por linea, estacion, direccion y tipo de ETA. El resultado reportado es un MAE mediano de 26,47 s en un dia completo de validacion, con una cobertura del intervalo P10-P90 del 79,4%.

Es relevante porque demuestra un enfoque de calibracion de incertidumbre sobre predicciones existentes en lugar de reemplazarlas, un patron util en sistemas de transporte publico donde el operador ya publica ETAs. El repositorio es de 0,0 GB, no tiene descargas ni likes, y la model card es muy escueta en cuanto a detalles de entrenamiento, licencia y composicion del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting) calibrado sobre cuantiles empiricos de residuos |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | no disponible |
| Formato de pesos | joblib (serializacion de scikit-learn/joblib) |

## Arquitectura y entrenamiento

La arquitectura es un conjunto de modelos LightGBM (gradient boosting sobre arboles de decision) entrenados para predecir correcciones a los cuantiles empiricos de residuos de ETA. Las entradas incluyen errores de ETA confirmados recientemente para la misma linea, estacion, direccion y tipo de ETA. El flujo de inferencia descrito en la model card consiste en sumar la correccion ajustada al cuantil empirico correspondiente, ordenar, anadir los offsets de calibracion guardados y volver a ordenar. Los residuos se expresan en segundos.

No se dispone de informacion sobre el numero de tokens, la composicion del dataset de entrenamiento, el periodo temporal cubierto, el numero de arboles por modelo, la profundidad, la tasa de aprendizaje ni si hubo etapas de validacion cruzada o ajuste de hiperparametros. La model card menciona que el artefacto esta pensado para acompanar al codigo de investigacion del autor, pero no se enlaza dicho codigo. Tampoco se detalla el mecanismo exacto de calibracion ni como se obtienen los offsets guardados.

## Capacidades

- Prediccion de correcciones sobre cuantiles empiricos de residuos de ETA para trenes del MTR.
- Generacion de intervalos de prediccion calibrados (por ejemplo, P10-P90) a partir de los cuantiles corregidos.
- Uso de errores recientes confirmados como variables de entrada, condicionadas por linea, estacion, direccion y tipo de ETA.
- Fallback a la distribucion empirica cuando no hay historial de trenes disponible.
- Salida en segundos, directamente comparable con la ETA del operador.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Calibracion de ETAs en paneles de informacion al pasajero: el modelo corrige los cuantiles de la ETA publicada por el operador y permite mostrar intervalos de llegada mas realistas, usando el fallback empirico cuando no hay historial reciente de la linea o estacion.
- Sistemas de alerta temprana de retrasos: al disponer de intervalos P10-P90 calibrados, un operador puede disparar avisos cuando la cola superior del intervalo supera un umbral, con una cobertura empirica del 79,4% reportada en validacion.
- Analisis de fiabilidad por linea y estacion: agregando los residuos corregidos se pueden identificar tramos con mayor varianza de ETA y priorizar intervenciones operativas.
- Investigacion academica en transporte publico: el artefacto acompana codigo de investigacion y sirve como baseline reproducible para comparar metodos de calibracion de incertidumbre en ETAs.
- Integracion en pipelines de datos de movilidad: al ser un joblib, puede cargarse en un servicio Python que consuma eventos de ETA confirmados y devuelva cuantiles corregidos en tiempo casi real.
- Evaluacion de la calidad de datos del operador: comparar la ETA original con la ETA corregida y con la observada permite auditar sesgos sistematicos por linea o direccion.
- Simulacion de escenarios de demanda y planificacion: los intervalos calibrados alimentan modelos de simulacion que necesitan distribuciones de llegada, no solo un valor puntual.

## Benchmarks y rendimiento

| Metrica | Modelo (MTR ETA residual) | ETA del operador |
|---|---|---|
| MAE mediano en dia completo de validacion | 26,47 s | 49,76 s |
| Cobertura del intervalo P10-P90 | 79,4% | no disponible |

Los resultados corresponden a un dia completo reservado para validacion y describen proxies de desaparicion de trenes, no validan movimientos individuales ni riesgos de llegada de pasajeros, segun la propia model card. No se han publicado otras metricas (RMSE, cobertura por linea, latencia) en la informacion disponible.

## Requisitos de hardware

- El artefacto es un joblib de LightGBM; no requiere GPU para inferencia.
- VRAM estimada: no aplica; el modelo se ejecuta en CPU.
- GPU recomendadas: no aplica.
- Cabe en cualquier maquina con Python y memoria suficiente para cargar el joblib; el tamano del repositorio es de 0,0 GB, por lo que la huella en memoria es reducida.
- Opciones de despliegue: servicio Python con joblib y LightGBM, contenedor Docker, funcion serverless o proceso batch; no aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | MAE mediano reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ge2340-mtr-eta (Virg1n) | LightGBM calibrado | Correccion de cuantiles empiricos de residuos | 26,47 s | no disponible | Hugging Face |
| ETA del operador MTR | Sistema propietario | Prediccion puntual del operador | 49,76 s | no disponible | Produccion |
| Alternativas open source de ETA en transporte publico | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la busqueda realizada.

## Limitaciones y advertencias

- La model card advierte explicitamente que los resultados describen proxies de desaparicion de trenes y no validan movimientos individuales ni riesgos de llegada de pasajeros.
- El modelo depende de errores de ETA confirmados recientemente; sin historial de trenes para la linea, estacion, direccion y tipo de ETA, se recurre a la distribucion empirica, lo que reduce la correccion.
- No se especifica la licencia, por lo que el uso comercial queda sin autorizacion explicita y requiere contactar con el autor.
- No hay informacion sobre sesgos por linea, estacion, franja horaria o condiciones meteorologicas.
- El repositorio tiene 0 descargas y 0 likes, y la model card es minima; no hay evidencia de validacion externa ni de mantenimiento.
- El artefacto esta pensado para el codigo de investigacion del autor, que no se enlaza en la informacion disponible.
- Al ser un modelo tabular, no ofrece capacidades de lenguaje, vision, tool calling ni agentes; no debe confundirse con un LLM.
- Riesgo de alucinacion: no aplica en el sentido de LLM, pero si existe riesgo de extrapolacion incorrecta si las distribuciones de entrada cambian respecto al periodo de entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/Virg1n/ge2340-mtr-eta
- Codigo de investigacion asociado: no disponible
- Paper o blog del autor: no disponible
- Demo: no disponible
