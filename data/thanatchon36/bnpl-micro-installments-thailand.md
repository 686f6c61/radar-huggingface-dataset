# thanatchon36/bnpl-micro-installments-thailand

## Resumen

`thanatchon36/bnpl-micro-installments-thailand` no es un modelo de lenguaje ni una red neuronal: es un repositorio de **estimadores causales** (estadística inferencial) asociados al articulo *Paying Later for Lunch: Micro-Installment Buy Now, Pay Later and Youth Over-Indebtedness in Thailand*. El autor, thanatchon36, publica aqui las especificaciones de los estimadores preregistrados que se reestiman sobre cada conjunto de datos, implementados con la libreria `statsmodels` de Python. El repositorio no contiene pesos.

El objeto de estudio es el impacto del Buy Now, Pay Later (BNPL) de microcuotas sobre el sobreendeudamiento juvenil en Tailandia. Los estimadores cubren comparaciones ingenuas, IPW/AIPW (doblemente robustos), regresion logistica ajustada, mediacion causal (Imai, Keele y Tingley, 2010), moderacion, RI-CLPM de tres olas, analisis de experimentos preregistrados y regresion discontinua (sharp, fuzzy y difference-in-discontinuities).

Es relevante para investigadores en econometria aplicada y causal inference porque ejemplifica un flujo de trabajo preregistrado completo, con validacion sobre datos sinteticos y advertencias explicitas sobre sesgos de seleccion. Todos los datos son simulados (Monte Carlo, semilla 20261110); no hay sujetos humanos ni hallazgos empiricos sobre consumidores tailandeses.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: conjunto de estimadores estadisticos (no es una red neuronal) |
| Parametros totales | No disponible (no hay pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | No aplica |
| Idiomas soportados | Ingles (en) y tailandes (th) para la documentacion |
| Licencia | MIT |
| Formato de pesos | No disponible (el repositorio no contiene pesos; las especificaciones estan en `model_specs.json`) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal. El repositorio contiene funciones de estimacion implementadas sobre `statsmodels` y documentadas en `code/bnpl_pipeline.py`, con sus especificaciones exportadas a `model_specs.json`. Los estimadores cubren: `est_naive` (comparacion ingenua usuario/no usuario), `est_ipw_aipw` (IPW de Hajek y AIPW doblemente robusto para el ATE), `est_adjusted_logit`, `est_h4_fragmentation` (mala especificacion sobre el logaritmo del numero de planes controlando por el logaritmo del saldo), `est_mediation` y `est_mediation_joint` (mediacion causal y test de significancia conjunta de las vias a y b), `est_moderation`, `fit_riclpm` (RI-CLPM de maxima verosimilitud para dos variables y tres olas), `analyse_experiment` (tests preregistrados con covariables centradas e interaccionadas) y tres estimadores de regresion discontinua: `rd_reduced_form` (salto local lineal con kernel triangular), `rd_fuzzy` (Wald) y `rd_diff_in_disc` (IV de diferencia en discontinuidades).

No existe entrenamiento en el sentido de machine learning. La validacion se realiza sobre datos generados por simulacion Monte Carlo bajo los supuestos del articulo (semilla 20261110). Los resultados de validacion reportados son: sesgo del +115 % en la comparacion ingenua frente al ATE verdadero; sesgo de aproximadamente +33 % con AIPW y confusores observados; efectos cruzados espurios del 90 % con CLPM frente al 8 % con RI-CLPM cuando solo existe seleccion; potencia experimental del 57 % con un pedido y del 95 % con cuatro pedidos (300 por brazo); y necesidad de aproximadamente 600.000 personas por cohorte para detectar el efecto de morosidad a los 20 anos.

## Capacidades

- Estimacion del efecto causal promedio (ATE) mediante IPW de Hajek y AIPW doblemente robusto.
- Analisis de mediacion causal con el marco de Imai, Keele y Tingley (2010) y test de significancia conjunta de las vias a y b.
- Modelado de moderacion y de fragmentacion de planes de pago.
- RI-CLPM de maxima verosimilitud para paneles de dos variables y tres olas, con correccion del sesgo de efectos cruzados espurios por seleccion.
- Analisis preregistrado de experimentos con covariables centradas e interaccionadas.
- Regresion discontinua en tres variantes: sharp (local lineal, kernel triangular), fuzzy (Wald) y difference-in-discontinuities con IV.
- Calculo de potencia estadistica para disenos experimentales y de cohortes.
- No soporta generacion de texto, codigo, vision, tool calling ni razonamiento multi-paso: no es un modelo generativo.

## Casos de uso

- Evaluacion de impacto de programas de credito al consumo: cargar datos de registro crediticio con los nombres de columna del dataset y llamar a `est_ipw_aipw` para obtener estimaciones doblemente robustas del ATE, utiles cuando hay confusores observados y seleccion no aleatoria.
- Analisis de mediacion en estudios de comportamiento financiero: usar `est_mediation` para descomponer el efecto del BNPL en vias directas e indirectas (por ejemplo, fragmentacion de planes frente a saldo), siguiendo el marco de Imai-Keele-Tingley.
- Disenos de regresion discontinua en edad minima de acceso al credito: aplicar `rd_reduced_form` y `rd_fuzzy` sobre datos con un umbral de edad (20 anos) para estimar el efecto de la adopcion del BNPL sobre la morosidad.
- Planificacion de potencia experimental: emplear `analyse_experiment` y `est_mediation_joint` para calcular el tamano muestral necesario (por ejemplo, 300 por brazo para el 57 % de potencia con un pedido, o 600.000 personas por cohorte para el efecto de morosidad a los 20 anos).
- Estudios longitudinales de sobreendeudamiento juvenil: usar `fit_riclpm` con paneles de tres olas para separar efectos within-person de between-person y evitar los efectos cruzados espurios del CLPM clasico (90 % frente al 8 %).
- Analisis de moderacion por subgrupos: aplicar `est_moderation` para evaluar si el efecto del BNPL difiere por caracteristicas demograficas o de comportamiento en encuestas.
- Docencia y replicacion metodologica: el repositorio sirve como plantilla preregistrada de causal inference aplicada con validacion sobre datos sinteticos y advertencias explicitas de sesgo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de validacion son los de la tabla de validacion sobre datos sinteticos:

| Comprobacion | Resultado |
|---|---|
| Comparacion ingenua usuario/no usuario, sesgo frente al ATE verdadero | +115 % |
| AIPW con confusores observados, sesgo | aproximadamente +33 % |
| Efectos cruzados espurios con solo seleccion | CLPM aproximadamente 90 %, RI-CLPM aproximadamente 8 % |
| Potencia del experimento (300 por brazo) | 57 % con 1 pedido, 95 % con 4 |
| Personas por cohorte para el efecto de morosidad a los 20 anos | aproximadamente 600.000 |

## Requisitos de hardware

- No requiere GPU: son estimadores estadisticos sobre `statsmodels`, ejecutables en CPU.
- Entorno de ejecucion: Python con `statsmodels` y las dependencias del pipeline (`code/bnpl_pipeline.py`).
- Coste computacional dominado por el RI-CLPM de maxima verosimilitud, la mediacion causal y el bootstrap de la regresion discontinua; el resto de estimadores son operaciones de regresion y ponderacion de coste bajo.
- Opciones de despliegue: ejecucion local o en notebooks; no aplican vLLM, llama.cpp, Ollama ni TGI porque no hay pesos que servir.
- Latencia y throughput: no disponibles; dependen del tamano de los datos y del estimador.

## Comparativa con modelos similares

| Criterio | bnpl-micro-installments-thailand | rdrobust (Calonico, Cattaneo y Titiunik) | Paquete mediation (Tingley et al.) | RI-CLPM en lavaan / sem (R) |
|---|---|---|---|---|
| Categoria | Estimadores causales preregistrados (BNPL) | Regresion discontinua con intervalos corregidos por sesgo | Mediacion causal | Modelos panel de efectos cruzados |
| Parametros | No aplica | No aplica | No aplica | No aplica |
| Contexto | No aplica | No aplica | No aplica | No aplica |
| Rendimiento | Validacion sobre datos sinteticos (sesgo AIPW +33 %) | No disponible | No disponible | No disponible |
| Licencia | MIT | No disponible | No disponible | No disponible |
| Disponibilidad | Hugging Face y GitHub | CRAN / R | CRAN / R | CRAN / R |

La comparativa es orientativa: los tres paquetes de referencia son herramientas estadisticas de proposito general, mientras que este repositorio es un conjunto de estimadores especificos del estudio, preregistrados y validados sobre simulacion.

## Limitaciones y advertencias

- **Datos sinteticos**: todos los archivos provienen de simulaciones Monte Carlo (semilla 20261110); no hay sujetos humanos ni hallazgos empiricos sobre consumidores tailandeses.
- **Sin pesos**: el repositorio no contiene un modelo entrenado; las "estimaciones" se reestiman sobre cada dataset.
- **Sesgo de seleccion**: la comparacion ingenua sobreestima el ATE en un 115 %; AIPW con confusores observados aun conserva un sesgo de aproximadamente +33 %.
- **Requisitos de potencia**: detectar el efecto de morosidad a los 20 anos exige aproximadamente 600.000 personas por cohorte, lo que limita su aplicacion a registros administrativos amplios.
- **Trabajo pendiente antes de usar datos reales**: el autor indica que hay que anadir pesos de encuesta y consentimiento, imputacion multiple, intervalos corregidos por sesgo de `rdrobust` y tests de equivalencia.
- **Idioma y alcance**: documentacion en ingles y tailandes; el diseno esta pensado para el contexto regulatorio y de credito de Tailandia.
- **Licencia**: MIT permite uso comercial, pero la ausencia de datos reales y de validacion externa desaconseja presentar los resultados como evidencia empirica.
- **Riesgo de mala aplicacion**: los estimadores de regresion discontinua y de mediacion son sensibles a los supuestos del diseno (continuidad en el umbral, secuencial ignorabilidad); su uso fuera de esos supuestos produce estimaciones invalidas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/thanatchon36/bnpl-micro-installments-thailand
- Dataset en Hugging Face: https://huggingface.co/datasets/thanatchon36/bnpl-micro-installments-thailand
- Articulo online: https://thanatchon36.github.io/bnpl-micro-installments-thailand/paper/
- PDF del articulo: https://github.com/thanatchon36/bnpl-micro-installments-thailand/blob/main/paper/paper.pdf
- Codigo en GitHub: https://github.com/thanatchon36/bnpl-micro-installments-thailand
