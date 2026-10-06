# yhatlabs/ChakraTab

## Resumen

ChakraTab es un modelo fundacional para predicción sobre datos tabulares desarrollado por YHat Labs. A diferencia de los modelos que se distribuyen como pesos descargables, ChakraTab se ofrece exclusivamente como API alojada: el repositorio de HuggingFace contiene únicamente la model card y no hay pesos que descargar. El modelo recibe una tabla con una columna objetivo y las filas a puntuar, y devuelve probabilidades de clase calibradas (clasificación) o predicciones puntuales y listas para cuantiles (regresión).

La propuesta técnica se basa en aprendizaje en contexto (in-context learning): ChakraTab combina varios modelos fundacionales tabulares preentrenados que se ajustan en el momento de la petición sobre la propia tabla del usuario, sin pipeline de entrenamiento ni búsqueda de hiperparámetros. Las predicciones de cada componente se validan out-of-fold sobre las filas del cliente y se combinan con pesos elegidos en esa validación, de modo que la mezcla es específica para cada tabla. No se aprende nada entre clientes ni entre peticiones, y los datos de ajuste se descartan salvo petición explícita.

El modelo está registrado en TabArena (listado como Chakra-Tab) con un Elo de 1834 en la configuración `full` y 1745 en `medium` sobre 51 conjuntos de datos. Está pensado como alternativa sin infraestructura propia a pipelines clásicos de AutoML, con presets que intercambian tiempo de cómputo por precisión. Sus creadores publican también ChakraTS, un modelo hermano para series temporales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La model card describe una combinación (ensemble) de varios modelos fundacionales tabulares preentrenados con ajuste en contexto y ponderación por validación out-of-fold |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible. No se distribuyen pesos, por lo que no hay cuantizaciones GGUF, AWQ, GPTQ ni similares |
| Idiomas soportados | No disponible. La interfaz es una API JSON; la model card no documenta cobertura lingüística, aunque menciona soporte de columnas de texto |
| Licencia | `yhat-labs-api-terms` (licencia `other`, términos en https://yhatlabs.com/terms) |
| Formato de pesos | No hay pesos. Servicio alojado accesible por API HTTP; se aceptan tablas en JSON o como parquet codificado en base64 |

## Arquitectura y entrenamiento

La model card no detalla la arquitectura interna: no se especifica el número de parámetros, la profundidad, el tipo de atención ni el volumen de tokens de entrenamiento. Lo que sí se documenta es el enfoque de inferencia: ChakraTab agrupa varios modelos fundacionales tabulares preentrenados, cada uno de los cuales se ajusta en contexto a la tabla del usuario en el momento de la petición. Sus predicciones individuales se validan out-of-fold sobre las filas aportadas y se combinan con pesos escogidos en esa misma validación. El resultado es una combinación adaptada a cada tabla concreta.

No se menciona RLHF, DPO ni ningún proceso de alineación, algo esperable en un modelo tabular. Tampoco se publican la composición del dataset de entrenamiento ni el número de tokens. La innovación destacable es de producto y de método: el ajuste ocurre por petición, sin pipeline de entrenamiento, sin búsqueda de hiperparámetros y sin retención de los datos de ajuste salvo solicitud explícita del cliente. Los presets `fast`, `medium` y `full` controlan el coste: `fast` usa una única partición de validación y responde en segundos, `medium` usa bagging de 8 particiones (por defecto) y `full` añade ajuste fino, con tiempos de minutos a horas.

## Capacidades

- Clasificación binaria y multiclase, con probabilidades calibradas: la selección interna se hace sobre log loss, de modo que las probabilidades son utilizables directamente.
- Regresión sobre tablas, con predicciones puntuales y preparadas para cuantiles.
- Tratamiento nativo de columnas numéricas, categóricas y de texto, además de valores ausentes (`null`), sin preprocesado por parte del usuario.
- Selección opcional de la métrica de validación interna mediante `eval_metric`: `log_loss`, `roc_auc` o `rmse`.
- Control del tipo de problema con `problem_type` (`binary`, `multiclass`, `regression`), que se infiere si se omite.
- Presupuesto de tiempo de ajuste configurable mediante `time_limit` (en segundos).
- Presets de coste/precisión: `fast`, `medium` y `full`.
- Entrada de tablas grandes mediante parquet codificado en base64, además de listas de filas en JSON.
- No retención de los datos de ajuste entre peticiones, salvo petición explícita de conservarlos.
- Cliente de Python con interfaz estilo scikit-learn (`fit` / `predict` / `predict_proba`) en preparación, según la model card.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modos de razonamiento extendido; el modelo es específicamente tabular.

## Casos de uso

- Scoring de riesgo y churn: el modelo permite puntuar bajas, impagos, fraude y conversión con probabilidades calibradas, gracias a que la selección interna optimiza log loss. Es adecuado porque el usuario solo necesita enviar la tabla histórica con la etiqueta y las filas a puntuar.
- Detección de fraude en transacciones: con soporte para columnas numéricas, categóricas y de texto sin preprocesado, se pueden incluir identificadores de comercio, descripciones y variables de importe en la misma tabla sin ingeniería de características previa.
- Operaciones industriales: clasificación de fallos y retrasos a partir de tablas de sensores y de ERP, usando el preset `medium` para producción y `full` cuando la precisión pesa más que la latencia.
- Previsión de demanda: clasificación de niveles de demanda o regresión sobre series agregadas en tablas, útil cuando no se dispone de un pipeline propio de forecasting.
- Tarificación y valoración: regresión sobre tablas de inmuebles, vehículos, seguros o catálogo de productos, aprovechando que las predicciones están preparadas para cuantiles y permiten construir intervalos.
- Baseline rápido en analítica: obtener una referencia sólida para un problema tabular nuevo antes de invertir en un modelo a medida, con el preset `fast` para respuestas en segundos durante la fase exploratoria.
- Propensión de conversión en marketing: puntuación por lotes de listas de clientes enviadas como parquet en base64 para tablas grandes, con la ventaja de que no hay que mantener infraestructura de entrenamiento propia.
- Prototipado sin equipo de ML: equipos de producto que necesitan una predicción tabular puntual pueden integrar una única llamada HTTP en lugar de montar un pipeline de AutoML.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (campo `verified: false` en la model index). Corresponden a TabArena-Lite (el primer split de cada conjunto) con el pipeline oficial, evaluados con la maquinaria Elo de TabArena frente a las 98 entradas del leaderboard en el momento del envío (octubre de 2026). La ejecución completa de los mantenedores queda pendiente de la revisión.

| Entrada | Elo | Rango medio | Tasa de victorias |
|---|---|---|---|
| LimiX-2 (no comercial) | 1919 | 7.0 | 0.94 |
| TabPFN-3.5 | 1858 | 9.0 | 0.92 |
| TabFM+ (no comercial) | 1834 | 9.85 | 0.909 |
| ChakraTab `full` | 1834 | 9.86 | 0.909 |
| AutoGluon 1.6 (no comercial, 4 h) | 1806 | 11.0 | 0.90 |
| Mitra-v2 | 1755 | 13.1 | 0.88 |
| AutoGluon 1.6 (extreme, 4 h) | 1746 | 13.5 | 0.87 |
| ChakraTab `medium` | 1745 | 13.6 | 0.87 |

Métricas adicionales declaradas en la model index:

| Métrica | Valor |
|---|---|
| Elo (TabArena-Lite, configuración `full`, 51 conjuntos) | 1834 |
| Elo (TabArena-Lite, configuración `medium`, 51 conjuntos) | 1745 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible, algo coherente con un modelo puramente tabular.

## Requisitos de hardware

- No hay requisitos de hardware para el usuario: ChakraTab es un servicio alojado y no se distribuyen pesos. Toda la inferencia ocurre en la infraestructura de YHat Labs.
- No cabe plantear VRAM estimada, GPU recomendadas, ejecución en GPU de consumo ni despliegue con vLLM, llama.cpp, Ollama o TGI, porque no existe artefacto local que ejecutar.
- La única vía de uso documentada es la API HTTP `POST https://api.yhatlabs.com/v1/tabular/predict` con una clave `YHAT_API_KEY` obtenida bajo petición.
- Alternativa de integración: los envíos grandes pueden hacerse como parquet en base64 en lugar de listas de filas, lo que reduce el tamaño del cuerpo de la petición.
- Latencia observada en el ejemplo de la model card: `fit_s: 4.1` con el preset `medium` sobre 2 filas de entrenamiento y 3 características. Es un dato de una tabla mínima, no representativo de cargas reales.
- Presupuesto temporal por preset según la model card: `fast` responde en segundos (una única partición de validación), `medium` es el valor por defecto para producción (bagging de 8 particiones) y `full` puede tardar de minutos a horas (bagging de 8 particiones con ajuste fino).
- Throughput y latencia bajo carga real: no disponibles.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Elo (TabArena-Lite) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ChakraTab | Ensemble de modelos fundacionales tabulares con ajuste en contexto | No disponible | No disponible | 1834 (`full`) / 1745 (`medium`) | `yhat-labs-api-terms` | Solo API alojada, acceso bajo petición |
| LimiX-2 | Modelo fundacional tabular | No disponible | No disponible | 1919 | No comercial, según la model card | No disponible en la información |
| TabPFN-3.5 | Modelo fundacional tabular con inferencia en contexto | No disponible | No disponible | 1858 | No disponible | No disponible en la información |
| TabFM+ | Modelo fundacional tabular | No disponible | No disponible | 1834 | No comercial, según la model card | No disponible en la información |
| AutoGluon 1.6 (4 h) | Pipeline de AutoML | No aplica (no es un modelo único) | No aplica | 1806 (`normal`) / 1746 (`extreme`) | No comercial, según la entrada de la tabla | Paquete de software |
| Mitra-v2 | Modelo tabular | No disponible | No disponible | 1755 | No disponible | No disponible en la información |

El dato diferencial de ChakraTab no es el Elo máximo, sino el modo de consumo: no requiere descargar pesos, ni elegir GPU, ni mantener un pipeline de entrenamiento. Frente a LimiX-2 y TabPFN-3.5 queda por detrás en la clasificación Elo de TabArena-Lite, y frente a AutoGluon 1.6 se sitúa ligeramente por delante en `full` (1834 frente a 1806) y en el mismo rango en `medium` (1745 frente a 1746).

## Limitaciones y advertencias

- No hay pesos descargables: no es posible ejecutar el modelo en local, auditarlo internamente, ajustarlo ni reproducir sus resultados fuera del servicio. Es una dependencia total del proveedor.
- Las filas de entrenamiento y prueba viajan a los servidores de YHat Labs. Aunque la model card afirma que el modelo se ajusta por petición y se descarta después salvo petición explícita, cualquier uso con datos personales o regulados exige revisar los términos y evaluar el cumplimiento normativo.
- La licencia es `yhat-labs-api-terms`, no una licencia de código abierto. Hay que leer los términos antes de cualquier uso comercial.
- El acceso está restringido: se solicita una clave de API bajo petición, y no hay indicación de que exista un nivel gratuito.
- Los resultados de benchmarks son declarados por el autor y marcados como `verified: false`. Provienen de TabArena-Lite (primer split de cada conjunto), no del run completo, y el envío a TabArena está bajo revisión (PR #643).
- No es el modelo líder en la tabla comparativa: LimiX-2 (1919) y TabPFN-3.5 (1858) obtienen Elo superior, y TabFM+ iguala su 1834.
- El preset `full` puede tardar de minutos a horas, por lo que no es adecuado para casos de latencia baja; el ejemplo de `fit_s: 4.1` corresponde a una tabla de 2 filas y no es extrapolable.
- No se documentan sesgos conocidos, cobertura de idiomas ni comportamiento fuera de distribución. Un modelo tabular puede producir probabilidades mal calibradas cuando los datos de prueba se alejan de los de entrenamiento en contexto.
- No se documenta el tamaño de la tabla máxima admitida, el límite de peticiones ni los acuerdos de nivel de servicio.
- La model card se trunca en la sección "Intended use", por lo que parte del uso previsto declarado por el autor no está disponible.
- En la búsqueda web aparece chakra.dev ("Chakra: Frontier Data Laboratory", centrado en entornos de RL para agentes de uso de ordenador). No hay ningún elemento en la información disponible que lo relacione con YHat Labs, pese a la coincidencia de nombre.

## Enlaces

- Model card en HuggingFace: https://huggingface.co/yhatlabs/ChakraTab
- Sitio de YHat Labs: https://yhatlabs.com
- Solicitud de acceso a la API: https://yhatlabs.com/access
- Términos de licencia: https://yhatlabs.com/terms
- Organización en HuggingFace: https://huggingface.co/yhatlabs
- Modelo hermano para series temporales (ChakraTS): https://huggingface.co/yhatlabs/ChakraTS
- Leaderboard de TabArena: https://huggingface.co/spaces/TabArena/leaderboard
- Sitio de TabArena: https://tabarena.ai
- Pull request de envío a TabArena (PR #643): https://github.com/autogluon/tabarena/pull/643
- Resultados en bruto de TabArena-Lite: https://github.com/yhatlabs/tabarena/releases/tag/tabarena-lite-results-2026-10-05
- Repositorio de resultados y notebooks de reproducción: https://github.com/yhatlabs/yhatlabs
- Organización de YHat Labs en GitHub: https://github.com/yhatlabs
- Chakra (Frontier Data Laboratory), entidad sin relación confirmada con YHat Labs: https://www.chakra.dev/
