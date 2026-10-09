# subash-taranga/tourism-nights-forecast

## Resumen

Tourism Nights Forecast es un modelo de regresión tabular publicado en HuggingFace por el usuario subash-taranga. Su objetivo es predecir las pernoctaciones mensuales (nights) en Finlandia desglosadas por país de residencia del viajero, a partir de tres entradas: año, mes y país. No es un modelo de lenguaje ni una red neuronal: se trata de una regresión lineal de scikit-learn (LinearRegression), guardada con scikit-learn 1.9.1 y serializada en `model.joblib`.

El modelo explota la fuerte estacionalidad del turismo finlandés asumiendo que el valor del mismo mes del año anterior es el predictor dominante. La formulación es log(1 + Nights) = 0,961 × log(1 + Nights del mismo mes del año anterior) + 0,381, con un único modelo global para las 37 series (Finlandia doméstico más 36 países o grupos de residencia). Para horizontes superiores a un año, la predicción se encadena de forma recursiva (2026 a partir de datos reales de 2025, 2027 a partir de la predicción de 2026, etcétera).

Su relevancia es limitada y muy acotada: con 0 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho, útil sobre todo como línea base reproducible para forecasting turístico. El propio autor reconoce en la model card que el modelo no supera al baseline trivial de copiar el mismo mes del año anterior en WAPE por país (12,1 % frente a 11,9 %), lo que lo sitúa como referencia metodológica más que como herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion lineal multiple (scikit-learn `LinearRegression`, minimos cuadrados ordinarios) sobre variables transformadas a log(1 + x) |
| Parametros totales | 2 (un coeficiente de pendiente y un termino independiente); no disponible el numero exacto de parametros internos declarados por el autor |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; la entrada es una tupla año, mes, pais) |
| Tipos de cuantizacion | No aplica (pesos en coma flotante dentro de `model.joblib`); no se documentan variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (no es un modelo de lenguaje; la entrada de pais es una cadena sin catalogo normalizado documentado) |
| Licencia | MIT |
| Formato de pesos | joblib (pickle de scikit-learn); ficheros auxiliares `history_2023_2025.csv` y `predict.py` |
| Libreria | scikit-learn 1.9.1 |
| Pipeline declarado | tabular-regression |
| Tamano del repositorio | 0.0 GB |
| Series modeladas | 37 (Finlandia domestico + 36 paises o grupos de residencia, incluido "Other countries") |
| Datos de entrenamiento | Pernoctaciones mensuales 2023-2025 (36 meses); excluidos 2022 y 2026 |
| Fecha de creacion | 2026-10-08 |
| Fecha de actualizacion | 2026-10-08 |

## Arquitectura y entrenamiento

La arquitectura es una regresion lineal univariante aplicada en espacio logaritmico. La unica variable predictora es el logaritmo de las pernoctaciones del mismo mes del ano anterior, log(1 + Nights), y la variable objetivo es el logaritmo de las pernoctaciones del mes a predecir. Los coeficientes publicados en la model card son una pendiente de 0,961 y una ordenada en el origen de 0,381. Se trata de un modelo global, no de un modelo por pais: los 37 paises comparten los mismos parametros, lo que implica que la identidad del pais solo interviene a traves del valor historico de su propia serie.

Los datos de entrenamiento son las pernoctaciones mensuales de 2023 a 2025 (36 meses) para 37 series. Se excluyo 2022 por considerarse periodo de recuperacion de la COVID-19 y se excluyo 2026 por estar incompleto y ser preliminar. Las filas agregadas (Total, Europa, Asia, etcetera) se eliminaron para evitar doble contabilidad, de modo que el total se obtiene sumando las 37 series individuales. La evaluacion se realizo entrenando con 2024 (usando 2023 como entrada del ano anterior) y testando sobre los 12 meses de 2025. No se documenta ningun proceso de ajuste fino, RLHF, DPO ni regularizacion adicional.

La innovacion tecnica es minima y el autor la describe de forma explicita: un modelo global sencillo con transformacion logaritmica que reduce el peso de los picos estacionales. La pendiente inferior a 1 implica una contraccion geometrica de los picos en cada iteracion recursiva, efecto que el propio autor senala como fuente de deriva a la baja en horizontes superiores a un ano. No hay decodificacion especulativa, atencion lineal ni mecanismos de ensemble.

## Capacidades

- Prediccion puntual de pernoctaciones mensuales para un ano, mes y pais de residencia concretos mediante `predict_nights(year, month, country)`.
- Generacion de tablas completas de prevision para todos los paises y meses de un ano dado mediante `forecast_table(year)`.
- Forecasting recursivo multianual: cada ano se alimenta del anterior, permitiendo proyecciones encadenadas mas alla del ultimo dato real.
- Ejecucion desde linea de comandos con `python predict.py 2026 12 "United Kingdom"`.
- Cobertura de 37 series de residencia, incluyendo Finlandia domestico y una categoria agregada de "Other countries".
- Serie historica consultable en `history_2023_2025.csv` como punto de partida de las previsiones.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, vision, audio ni modo de pensamiento. No es un modelo generativo de texto.

## Casos de uso

- Planificacion de capacidad hotelera: cadenas y gestores de alojamiento pueden usar `forecast_table(ano)` para estimar la ocupacion esperada por mercado emisor y dimensionar plantilla, inventario y tarifas por temporada, aprovechando la estacionalidad mensual capturada por el modelo.
- Presupuesto de marketing turistico por mercado emisor: agencias y oficinas de turismo pueden priorizar inversión publicitaria comparando la previsión de pernoctaciones de cada uno de los 36 paises de residencia y detectar que mercados crecen o se contraen respecto al ano anterior.
- Planificacion de recursos en transporte y aeropuertos: operadores pueden estimar picos mensuales de llegadas por nacionalidad y ajustar turnos, mostradores y capacidad de handling, con la cautela de que el modelo no incorpora plazas aereas ni rutas.
- Reporting para administraciones publicas: organismos estadisticos y ministerios pueden generar informes preliminares de tendencia mensual antes de disponer de datos definitivos, usando la previsión como orden de magnitud y citando siempre el margen de error declarado (12,1 % WAPE por pais en 2025).
- Analisis de estacionalidad y estacionalidad comparada: investigadores pueden emplear la pendiente de 0,961 para cuantificar la persistencia interanual de cada serie y estudiar que mercados son mas volatiles.
- Linea base en proyectos de forecasting propios: equipos que construyan modelos mas complejos (Gradient Boosting, Prophet, SARIMA) pueden usar esta regresion como benchmark minimo reproducible, dado que el autor publica el codigo y los datos historicos.
- Simulacion de escenarios de recuperacion post-crisis: con la advertencia de que el modelo no incorpora factores externos, puede servir para proyectar la inercia de una serie tras una perturbacion, dado que se excluyo explicitamente el periodo COVID para no contaminar los coeficientes.

## Benchmarks y rendimiento

Los unicos resultados publicados provienen de la propia model card. El escenario de evaluacion es entrenamiento con 2024 (entrada de 2023) y test sobre los 12 meses de 2025. WAPE se define como error absoluto total dividido entre pernoctaciones reales totales.

| Modelo | WAPE por pais | WAPE total | R² |
|---|---|---|---|
| Baseline: copiar el mismo mes del ano anterior | 11,9 % | 2,7 % | 0,988 |
| Regresion lineal (este modelo) | 12,1 % | 4,4 % | 0,988 |
| LightGBM (prediciendo crecimiento) | 15,5 % | 7,8 % | 0,982 |

Sobre datos reales de 2026 (enero a agosto, preliminares y no usados en entrenamiento), la previsión obtuvo un 12,2 % de WAPE por pais y un 3,4 % de WAPE total. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no son aplicables a un modelo tabular de regresion.

## Requisitos de hardware

- VRAM para inferencia: 0 GB. El modelo es un objeto scikit-learn de dos parametros serializado en `model.joblib`; no requiere GPU.
- GPU recomendadas: ninguna. La inferencia es puramente CPU.
- Compatibilidad con GPU de consumo: no aplica; el modelo se ejecuta en cualquier CPU moderna, incluidos portatiles de gama baja.
- Memoria RAM: unos pocos megabytes, dominados por el interprete de Python, pandas, numpy y scikit-learn, mas el CSV historico de 36 meses y 37 series.
- Opciones de despliegue: script Python con `joblib.load` o el `predict.py` incluido; tambien se puede envolver en una funcion serverless (AWS Lambda, Cloud Functions) o en un endpoint de FastAPI. No es compatible con vLLM, llama.cpp, Ollama, TGI ni servidores de inferencia para transformers, porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponibles de forma oficial. Por la naturaleza del modelo (una multiplicacion y una suma por prediccion), la latencia es del orden de microsegundos una vez cargado el objeto, y el cuello de botella real es el arranque del interprete y la carga de dependencias.
- Dependencia critica de version: el autor indica que fue guardado con scikit-learn 1.9.1; cargar el pickle con otra version puede producir avisos o errores de compatibilidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | WAPE por pais (2025) | WAPE total (2025) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Baseline estacional (copiar mismo mes del ano anterior) | 0 | Año, mes, pais | 11,9 % | 2,7 % | No aplica | Trivial de implementar |
| Regresion lineal (este modelo) | 2 | Año, mes, pais | 12,1 % | 4,4 % | MIT | HuggingFace, 0 descargas |
| LightGBM sobre crecimiento | No disponible (ensemble de arboles) | Año, mes, pais | 15,5 % | 7,8 % | No disponible | No publicada como artefacto |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion facilitada. La conclusion relevante de la tabla es que este modelo no supera al baseline estacional en la metrica principal por pais, aunque si mejora claramente a LightGBM en el mismo experimento.

## Limitaciones y advertencias

- Solo hay 3 anos de historia (2023-2025), de modo que el modelo aprende esencialmente la relacion "ano siguiente = ano anterior" y no supera al baseline trivial de copiar el mismo mes del ano anterior en WAPE por pais.
- La pendiente es inferior a 1 (0,961), por lo que los picos se reducen ligeramente en cada ano proyectado. Las previsiones a mas de un ano vista derivan a la baja y el autor recomienda tratarlas como aproximadas.
- Los mercados pequenos (decenas o centenas de pernoctaciones al mes) presentan errores porcentuales muy elevados, ya que el WAPE agregado oculta una gran dispersion entre series.
- El modelo no incorpora factores externos de ningun tipo: tipos de cambio, rutas y plazas aereas, eventos puntuales, huelgas, crisis sanitarias o cambios normativos.
- Se excluyeron 2022 (recuperacion COVID) y 2026 (incompleto) del entrenamiento, lo que mejora la limpieza de los datos pero reduce aun mas el volumen disponible y deja el modelo sin ejemplos de recuperacion post-crisis.
- `model.joblib` es un fichero pickle: solo debe cargarse desde fuentes de confianza, ya que la deserializacion de pickles puede ejecutar codigo arbitrario.
- Riesgo de alucinacion: no aplica en el sentido de generacion de texto, pero existe riesgo de extrapolacion silenciosa, es decir, de producir cifras con apariencia precisa para combinaciones de pais, ano y mes poco o nada representadas en los datos.
- Sesgos conocidos: no documentados por el autor. La agregacion por pais de residencia puede ocultar cambios en la composicion interna de cada mercado.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. No se documentan restricciones adicionales.
- Caveats de produccion: el repo tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia, por lo que no hay evidencia de uso real, mantenimiento ni validacion independiente. La dependencia de scikit-learn 1.9.1 debe fijarse en el entorno de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/subash-taranga/tourism-nights-forecast
- La busqueda web realizada no devolvio enlaces relevantes al modelo, a papers asociados ni a repositorios complementarios; los resultados obtenidos fueron unicamente paginas de inicio de motores de busqueda. No se dispone de paper, blog, repositorio adicional ni demo publicados en la informacion proporcionada.
