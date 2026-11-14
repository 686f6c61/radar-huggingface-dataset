# thanatchon36/hindsight-or-foresight

## Resumen

`hindsight-or-foresight` no es un modelo de lenguaje ni un artefacto listo para desplegar: es un repositorio de instrumentos metodologicos publicado por Thanatchon Chongmankhong para medir cuanto del rendimiento aparente de un modelo de deteccion de fraude contable proviene del diseno de evaluacion y no de la capacidad predictiva real. El repositorio acompana al preprint *Hindsight or Foresight? Alternative Data, Early Warning, and the Measurement of Corporate-Group Failure* y contiene las especificaciones de dos clasificadores tabulares (un `HistGradientBoostingClassifier` y una `LogisticRegression` de scikit-learn) reentrenados para cada ano de test sobre el panel publico de Bao et al. (2020): 146.045 firm-years de empresas cotizadas en EE. UU. entre 1990 y 2014.

El problema que aborda es el sesgo de retrospectiva (*hindsight bias*) en la evaluacion de modelos de alerta temprana. La tarea consiste en puntuar el riesgo de que una empresa reciba mas tarde una sancion de la SEC por fraude contable (una AAER, Accounting and Auditing Enforcement Release). El autor define una "escalera de fuga" de cuatro disenos de evaluacion (validacion cruzada aleatoria, out-of-time sin gap, out-of-time con gap de 2 anos y diseno "honesto") y mide como cae el rendimiento al eliminar progresivamente informacion que un analista no podria haber tenido en el momento de la prediccion.

La relevancia es metodologica mas que de modelado: con datos y algoritmos identicos, el AUC del gradient boosting pasa de 0,833 en validacion cruzada aleatoria a 0,697 en el diseno honesto, lo que sugiere que cerca del 40% de su habilidad aparente respecto al azar es un artefacto del diseno. La regresion logistica apenas se mueve (0,690 a 0,675), y bajo evaluacion honesta ambos modelos quedan estadisticamente proximos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos clasicos de scikit-learn: `HistGradientBoostingClassifier` (gradient boosting sobre histogramas) y `LogisticRegression` |
| Parametros totales | no disponible (no se publican pesos; el repositorio contiene solo especificaciones en `model_specs.json`) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion tabular, no secuencial) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | en (etiquetas y documentacion; los datos son financieros de EE. UU.) |
| Licencia | MIT |
| Formato de pesos | no disponible (no se distribuyen pesos; solo `model_specs.json` con clases, hiperparametros, features y preprocesado) |

## Arquitectura y entrenamiento

El repositorio define dos modelos tabulares. El primero, `gbm`, es un `HistGradientBoostingClassifier` con 300 iteraciones, learning rate 0,05, maximo 15 hojas, minimo 40 muestras por hoja, regularizacion L2 de 1,0, pesos de clase balanceados y semilla 20261112; consume 28 items brutos de Compustat (`at`, `sale`, `ni`, `rect`, `prcc_f`, etc.). El segundo, `logit`, es una `LogisticRegression` con C = 1,0 y pesos balanceados sobre 14 ratios financieros (`dch_wc`, `ch_rsst`, `soft_assets`, `bm`, etc.), winsorizados en los percentiles 1 y 99 del conjunto de entrenamiento, imputados por mediana y estandarizados.

La innovacion no esta en la arquitectura sino en el protocolo de evaluacion. Para cada ano de test *t* (2003 a 2008) los modelos se reentrenan con cuatro disenos: validacion cruzada estratificada de 5 folds sobre todos los anos (el modelo ve el futuro y otros anos del mismo caso de fraude); out-of-time sin gap (anos fiscales ≤ *t* − 1, aunque la mayoria de sus etiquetas aun no eran publicas); out-of-time con gap de 2 anos (≤ *t* − 2); y diseno honesto (≤ *t* − 2 excluyendo todos los firm-years de cualquier caso de sancion que aparezca en el ano *t*). El conjunto de test son 35.166 firm-years de 2003 a 2008, de los cuales 261 (0,74%) fueron sancionados posteriormente. Los intervalos de confianza al 95% provienen de 400 remuestreos bootstrap estratificados por clase.

## Capacidades

- Clasificacion tabular binaria: puntuar firm-years de empresas cotizadas en EE. UU. por riesgo de sancion posterior de la SEC por fraude contable.
- Deteccion y cuantificacion de fuga de datos (*data leakage*) mediante la escalera de cuatro disenos de evaluacion.
- Cuantificacion del sesgo de retrospectiva: comparacion directa entre validacion cruzada aleatoria y evaluacion honesta sobre los mismos datos.
- Analisis de sensibilidad de algoritmos: contraste entre un aprendiz flexible (gradient boosting) y uno rigido (regresion logistica) bajo el mismo protocolo.
- Reproducibilidad completa: `model_specs.json` fija clases, hiperparametros, features, preprocesado y metricas al commit `d13e605` del repositorio de codigo.
- Metricas calibradas y con incertidumbre: ROC AUC, average precision y precision en el top 1%, con intervalos bootstrap.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un artefacto estadistico, no un modelo generativo.

## Casos de uso

- Auditoria metodologica de pipelines de deteccion de fraude: usar la escalera de disenos para medir cuanto del AUC reportado en un sistema interno proviene de fuga temporal o de reutilizacion de casos entre train y test.
- Diseno de validacion out-of-time en riesgo financiero: adoptar el esquema con gap de 2 anos y la exclusion de casos sancionados en el ano de test como plantilla para cualquier modelo de alerta temprana con etiquetas que se publican con retraso.
- Investigacion academica en contabilidad y finanzas: reproducir el experimento E1-E5 sobre el panel de Bao et al. (2020) para comparar contra la literatura existente de deteccion de fraude contable.
- Formacion y docencia en ciencia de datos: ilustrar con numeros concretos (0,833 frente a 0,697 de AUC) por que la validacion cruzada aleatoria sobreestima el rendimiento en problemas con estructura temporal y correlacion dentro de caso.
- Seleccion de algoritmos bajo restricciones realistas: comparar gradient boosting y regresion logistica bajo el diseno honesto para decidir si la complejidad adicional del aprendiz flexible se justifica cuando la senal real es debil.
- Calibracion de umbrales en contextos de prevalencia baja: el repositorio documenta que en una muestra 1:1 el umbral acierta el 65% de las veces, pero en la poblacion real (prevalencia 0,74%) solo el 1,4%, dato util para fijar expectativas de precision en produccion.
- Revision por pares y replicacion: el repositorio actua como registro ejecutable de las decisiones de modelado del preprint, con DOI de Zenodo y codigo versionado.

## Benchmarks y rendimiento

Anos de test 2003-2008. Intervalos al 95% de 400 remuestreos bootstrap estratificados por clase.

| Diseno | `gbm` ROC AUC | `gbm` avg. precision | `gbm` precision top 1% | `logit` ROC AUC | `logit` avg. precision |
|---|---|---|---|---|---|
| Validacion cruzada aleatoria 5-fold | 0,833 [0,810; 0,850] | 0,041 | 6,25% | 0,690 [0,660; 0,715] | 0,014 |
| Out-of-time, sin gap | 0,802 [0,770; 0,828] | 0,034 | 5,68% | 0,685 [0,656; 0,709] | 0,014 |
| Out-of-time, gap de 2 anos | 0,764 [0,732; 0,787] | 0,023 | 4,55% | 0,680 [0,651; 0,706] | 0,013 |
| Honesto | 0,697 [0,663; 0,721] | 0,014 | 2,27% | 0,675 [0,646; 0,701] | 0,013 |

Frente al azar (AUC 0,5), aproximadamente el 40% de la habilidad aparente del gradient boosting es artefacto del diseno de evaluacion. La regresion logistica apenas varia y, bajo evaluacion honesta, ambos modelos quedan estadisticamente proximos. En una muestra caso-control 1:1 el umbral del modelo honesto acierta el 65% de las veces; en la poblacion, el 1,4%.

## Requisitos de hardware

- No requiere GPU: ambos modelos son de scikit-learn y se ejecutan en CPU.
- El experimento completo (E1-E5, cuatro disenos por ano de test) tarda aproximadamente 30-45 minutos en un solo nucleo.
- Memoria: el panel de Bao et al. (2020) tiene 146.045 firm-years con 28 features brutos o 14 ratios; cabe holgadamente en cualquier equipo de desarrollo convencional.
- Despliegue: no aplica como servicio de inferencia; el uso previsto es la ejecucion local via `real_data.py` del repositorio de codigo.
- No hay estimaciones de latencia ni throughput publicadas porque el modelo no esta pensado para servir peticiones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | AUC honesto reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `hindsight-or-foresight` (`gbm`) | Gradient boosting tabular | no disponible | no aplica | 0,697 | MIT | Especificaciones en HF, codigo en GitHub |
| `hindsight-or-foresight` (`logit`) | Regresion logistica tabular | no disponible | no aplica | 0,675 | MIT | Especificaciones en HF, codigo en GitHub |
| Modelos de Bao et al. (2020) | Aprendizaje automatico sobre panel Compustat | no disponible | no aplica | no disponible en esta ficha | no disponible | Paper en *Journal of Accounting Research* |
| Modelos de fraude contable de uso comercial | Cajas negras propietarias | no disponible | no aplica | no disponible | Propietaria | No disponible |

No se han publicado en la informacion disponible resultados de benchmarks de modelos alternativos comparables bajo el mismo protocolo honesto; la comparativa con Bao et al. (2020) es la referencia natural del trabajo, pero sus cifras no se detallan en la model card.

## Limitaciones y advertencias

- Los datos son contabilidad estadounidense y etiquetas de sancion de la SEC; no cubren datos alternativos ni empresas tailandesas, pese a que el preprint incluya evidencia global y para Tailandia.
- Las etiquetas de sancion solo capturan misconducta detectada: el fraude no detectado se codifica como limpio, lo que sesga a la baja la prevalencia real.
- No es un detector de fraude para produccion: la precision a la prevalencia real es de unos pocos por ciento en el mejor caso (1,4% en el umbral del modelo honesto en poblacion).
- El repositorio no contiene pesos; cualquier uso requiere reentrenar desde el codigo y los datos originales de Bao et al. (2020).
- Los modelos se reajustan para cada ano de test, por lo que no existe un unico conjunto de pesos que los represente.
- La magnitud de la inflacion por diseno de evaluacion es una propiedad del metodo, no de los datos; puede variar en otros dominios y jurisdicciones.
- Licencia MIT para el codigo y las especificaciones; los datos subyacentes tienen su propia atribucion y deben citarse segun Bao et al. (2020).
- El autor declara que es investigacion personal independiente y que no representa las opiniones de su empleador o institucion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/hindsight-or-foresight
- Dataset asociado: https://huggingface.co/datasets/thanatchon36/hindsight-or-foresight
- Paper (lectura online): https://thanatchon36.github.io/hindsight-or-foresight/paper/
- Paper (PDF): https://github.com/thanatchon36/hindsight-or-foresight/raw/main/paper.pdf
- DOI del preprint: https://doi.org/10.5281/zenodo.24216338
- Codigo: https://github.com/thanatchon36/hindsight-or-foresight
- Paper de referencia (Bao et al., 2020): https://doi.org/10.1111/1475-679X.12292
