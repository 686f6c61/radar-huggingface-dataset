# thanatchon36/reading-a-planet

## Resumen

`thanatchon36/reading-a-planet` no es un modelo de lenguaje, sino un conjunto de modelos de clasificacion tabular basados en regresion logistica calibrada, publicados por Thanatchon Chongmankhong como artefacto reproducible de su articulo *Rapid Intensification Before Landfall Around the World, 1980–2024*. El objetivo es estimar la probabilidad de que un ciclon tropical se intensifique al menos 30 kt en las siguientes 24 horas (evento RI30) utilizando unicamente la mejor trayectoria (best track) del sistema. El modelo se distribuye como coeficientes en JSON plano, sin ficheros pickle, junto con un script `predict.py` de dependencias minimas.

El interes del artefacto es metodologico: los pesos se ajustaron con temporadas hasta 2018, se calibraron y seleccionaron en 2019–2021, y se evaluaron una sola vez sobre las temporadas selladas 2022–2024 bajo un plan pre-registrado. Se publican tanto modelos por cuenca (M1c) como un modelo agrupado con indicadores de cuenca (MGc). El autor lo posiciona explicitamente como una linea base que los modelos basados en satelite, reanalisis o contenido calorico oceanico deben superar, no como un sustituto de estos.

La relevancia practica es acotada pero clara: ofrece una referencia calibrada, reproducible y de coste computacional practicamente nulo para la prediccion de intensificacion rapida, con intervalos bootstrap por tormenta y resultados de skill publicados cuenca a cuenca. No es un modelo operativo ni un modelo generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica L2 con calibracion isotonica (scikit-learn) |
| Parametros totales | no disponible (coeficientes en JSON; orden de decenas por modelo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular sobre un registro de punto de trayectoria) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante; sin GGUF ni safetensors) |
| Idiomas soportados | en (documentacion y metadatos) |
| Licencia | MIT |
| Formato de pesos | JSON plano (`models.json`: coeficientes, estandarizacion, curvas de calibracion isotonica) |

## Arquitectura y entrenamiento

Cada modelo es una regresion logistica con regularizacion L2 (C = 10 en el modelo de desarrollo WP; C elegida por Brier de validacion en cada cuenca para los modelos de confirmacion) seguida de calibracion isotonica. Los predictores, todos conocidos en el momento del pronostico, son: intensidad actual y su cuadrado, cambio de intensidad a 6 h y 12 h, posicion, velocidad y direccion de traslacion, edad de la tormenta, maximo de intensidad alcanzado hasta la fecha y su diferencia con el actual, SST climatologica 1981–2010, distancia a tierra y fase estacional, con indicadores de valor faltante para tormentas nuevas. El modelo agrupado `MGc` anade indicadores de cuenca, latitud absoluta, movimiento hacia el polo y una fase estacional desplazada por hemisferio, con calibracion isotonica por cuenca.

Los datos provienen de IBTrACS. El ajuste usa temporadas ≤ 2018; la calibracion y seleccion de hiperparametros, 2019–2021; y la evaluacion, las temporadas 2022–2024 con un unico scoring bajo planes pre-registrados. `predict.py` reproduce las predicciones de test almacenadas con una diferencia absoluta maxima de 10⁻⁹. El modelo de gradient boosting del Part I no se exporta porque no supero a la regresion logistica (hipotesis H2 no respaldada).

## Capacidades

- Clasificacion binaria tabular: probabilidad de RI30 (intensificacion ≥ 30 kt en 24 h) a partir de un registro de punto de trayectoria.
- Prediccion por cuenca: modelos independientes para NA, EP, WP, NI, SI y SP.
- Modelo agrupado multibcuenca con indicadores de cuenca y calibracion isotonica por cuenca.
- Calibracion de probabilidades verificada mediante curvas isotonicas almacenadas.
- Inferencia con dependencias minimas (scikit-learn, pandas, huggingface_hub) y sin serializacion insegura.
- Reproducibilidad determinista: salida verificable contra predicciones de test almacenadas.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Linea base en investigacion de intensificacion rapida: comparar modelos de satelite, reanalisis o contenido calorico oceanico contra un predictor calibrado y barato, usando el BSS por cuenca publicado como referencia.
- Analisis climatologico retrospectivo: aplicar los modelos a IBTrACS historico para estudiar la frecuencia y distribucion geografica de RI30 antes de tocar tierra entre 1980 y 2024.
- Docencia y formacion en meteorologia tropical: ilustrar calibracion, skill scores, intervalos bootstrap y pre-registro con un caso reproducible de extremo a extremo.
- Auditoria metodologica: reutilizar el diseno (split temporal, temporadas selladas, Benjamini–Hochberg) como plantilla para evaluaciones pre-registradas en otros dominios tabulares.
- Prototipado rapido de un sistema de alerta interno: integrar `predict.py` en un pipeline que consuma trayectorias y genere probabilidades de RI30 como senal preliminar, asumiendo las limitaciones de usar best track.
- Benchmarking de infraestructura: servir un clasificador tabular de coste despreciable como control en pruebas de latencia y throughput frente a modelos pesados.

## Benchmarks y rendimiento

Brier skill score (BSS) frente a la climatologia de entrenamiento de cada cuenca, con intervalos bootstrap al 95 % por tormenta, sobre las temporadas de test 2022–2024 (scoring unico):

| Cuenca | Tormentas | Eventos RI | BSS `M1c` | BSS `MGc` | ROC-AUC `M1c` |
|---|---|---|---|---|---|
| WP (desarrollo, Part I) | 58 | 122 | 0,167 (0,041 a 0,249) | – | 0,81 |
| EP | 48 | 76 | 0,285 (0,136 a 0,404) | 0,249 (0,107 a 0,358) | 0,88 |
| SI | 43 | 88 | 0,114 (0,012 a 0,205) | 0,130 (0,025 a 0,232) | 0,82 |
| NA | 45 | 49 | 0,028 (−0,191 a 0,157) | 0,073 (−0,115 a 0,179) | 0,79 |
| NI | 16 | 21 | 0,096 (−1,166 a 0,506) | 0,143 (−1,095 a 0,527) | 0,77 |
| SP | 25 | 35 | 0,045 (−0,051 a 0,153) | 0,160 (0,043 a 0,278) | 0,85 |

En negrita en la fuente original figuran los skills confirmados (intervalo que excluye cero; en las cinco cuencas de confirmacion, tras ajuste de Benjamini–Hochberg): WP para `M1c`, y EP y SI para `M1c`. En las cinco cuencas de confirmacion agrupadas, `MGc` supero a `M1c` en 0,022 BSS (−0,012 a 0,055), por lo que la hipotesis pre-registrada H5 (que agrupar ayuda) no se sostuvo. No se publican resultados de MMLU, HumanEval, GSM8K ni equivalentes, al no ser un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es tabular y se ejecuta en CPU.
- GPU recomendadas: ninguna; no se requiere acelerador.
- Cabe en cualquier GPU consumer y en entornos sin GPU (portatil, contenedor de 256 MB).
- Opciones de despliegue: ejecucion directa de `predict.py` con scikit-learn y pandas; integracion como funcion en un servicio Python; no compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no publicados; por la naturaleza del modelo (regresion logistica sobre decenas de features) se espera un coste por registro del orden de microsegundos a milisegundos en CPU, sin datos medidos en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Skill publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `reading-a-planet` (M1c/MGc) | Regresion logistica calibrada, best track | Decenas de coeficientes | No aplica | BSS 0,03–0,29 por cuenca (2022–2024) | MIT | Hugging Face + GitHub + dataset |
| Gradient boosting del Part I (mismo autor) | GBDT, best track | no disponible | No aplica | No supero a la regresion logistica (H2 no respaldada) | MIT (codigo) | No exportado como pesos |
| Modelos basados en satelite/reanalisis/OHC (categoria) | CNN/transformer u otros | no disponible | no disponible | no disponible | variable | variable |

No se dispone en la informacion proporcionada de resultados numericos de modelos comparables de la misma categoria; la comparativa cuantitativa queda pendiente.

## Limitaciones y advertencias

- Solo usa predictores de best track: no incorpora imagenes de satelite, reanalisis ni contenido calorico oceanico; es una linea base, no un sustituto.
- Las entradas son la trayectoria final, disponible solo tras la temporada; en tiempo real la trayectoria operativa es mas ruidosa y el rendimiento puede degradarse.
- Solo tres temporadas de test generan intervalos muy amplios en cuencas pequenas (NI, SP), con BSS que cruzan cero.
- Entrenado con 1980–2018; la calibracion puede derivar con cambios en practicas de observacion y clima.
- El autor declara que no es un pronostico operativo y que es investigacion personal independiente.
- Licencia MIT: permite uso comercial, pero sin garantias; el autor no ofrece soporte ni validacion operativa.
- No es un modelo de lenguaje: no genera texto, no razona, no soporta agentes ni tool calling; cualquier uso en esos terminos seria un error de categoria.
- Idiomas: metadatos y documentacion solo en ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/reading-a-planet
- Dataset: https://huggingface.co/datasets/thanatchon36/reading-a-planet
- Resultados del dataset: https://huggingface.co/datasets/thanatchon36/reading-a-planet/tree/main/results
- Codigo: https://github.com/thanatchon36/reading-a-planet
- Articulo (HTML): https://thanatchon36.github.io/reading-a-planet/paper/
- Articulo (PDF): https://github.com/thanatchon36/reading-a-planet/raw/main/paper.pdf
- DOI: https://doi.org/10.5281/zenodo.24216355
