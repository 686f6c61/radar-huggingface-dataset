# thanatchon36/bureau-to-workout

## Resumen

`bureau-to-workout` es un conjunto de modelos de scikit-learn publicados por Thanatchon Chongmankhong como material reproducible del preprint *From Bureau to Workout: Credit Scoring and Causal Debt Resolution under Policy-Shaped Labels*. No es un modelo fundacional ni un transformer: es una coleccion de artefactos tabulares (scorecard de weight-of-evidence en JSON, clasificadores GBM con restricciones monotonas, un encoder auto-supervisado de secuencias de buro, y un DR-learner para modelado de uplift) entrenados exclusivamente sobre simuladores sinteticos descritos en el paper.

El problema que aborda es el sesgo de etiquetas en scoring crediticio: prestamos aprobados generan etiquetas observadas, los rechazados no, y episodios de moratoria (deferimiento de reporte de impagos) deforman aun mas la distribucion de etiquetas. El autor propone tecnicas de reject inference (IPW, fuzzy augmentation, aumentacion con datos de buro) y de inferencia causal (T-learner y DR-learner cross-fitted) para estimar el efecto de distintas ofertas de reestructuracion de deuda.

Es relevante por su valor metodologico y de reproducibilidad, no por su rendimiento predictivo en produccion. El propio autor advierte de forma explicita que los modelos se ajustaron a los simuladores del paper, no a datos reales de NCB o SAM, y que no deben usarse para puntuar personas reales. La licencia es MIT y los pesos se distribuyen en formato `skops` y JSON.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos tabulares clasicos: scorecard WoE con regresion logistica, Gradient Boosting con restricciones monotonas, encoder MLP auto-supervisado, T-learner y DR-learner (regresores) |
| Parametros totales | no disponible (no se publica recuento de parametros; son modelos de scikit-learn) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular, no secuencial en tokens); el encoder SSL procesa secuencias de 24 meses de buro |
| Tipos de cuantizacion | no disponible (no aplica a modelos scikit-learn; no se publican variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible (no procesa lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | `skops` (scikit-learn, sin pickle) y JSON/CSV para el scorecard |

## Arquitectura y entrenamiento

El repositorio agrupa varios modelos independientes. Para scoring de buro (experimento E1) se incluyen un scorecard de weight-of-evidence con bins monotonos, ajuste logistico y escala de puntos (600 puntos a odds 50:1, 20 puntos para doblar la probabilidad de impago); un GBM con restricciones monotonas sobre 15 atributos de buro que varian sin moratoria; y un encoder auto-supervisado enmascarado sobre secuencias de buro de 24 meses (escalador + MLP, con la capa cuello de botella como embedding), acompanado de una sonda logistica lineal y de un GBM que combina atributos y embedding. Para reject inference (E2) se entrenan seis GBMs monotonos con distintas estrategias de etiquetado: solo aprobados, aprobados con IPW, fuzzy augmentation clasica, etiquetas aumentadas con buro, aumentadas con IPW para rechazados no observados, y un oraculo con la etiqueta verdadera de todos los solicitantes.

Para el efecto de la moratoria (E3) se ajustan modelos logisticos con etiquetas reportadas, sin ventanas diferidas, con etiquetas retrasadas y con la verdad sin deferimiento. Para reestructuracion de deuda se publican un T-learner de cuatro regresores (recuperacion esperada por oferta), un modelo de propension multinomial de las ofertas registradas, un DR-learner cross-fitted que estima el efecto de las ofertas 1-3 frente a la cobranza estandar, y un score predictivo de P(recuperacion >= 60% bajo cobranza estandar) como linea base de targeting predictivo.

Todo el entrenamiento se realizo sobre datos simulados generados por los simuladores del paper, con semillas fijas (buro 7 y 1007, workouts 107). No se reporta numero de tokens ni composicion de dataset real porque no existe: la fuente es sintetica. Los artefactos se reajustaron con python 3.12.15, numpy 2.5.4, pandas 3.1.1, scikit-learn 1.9.1, skops 0.16.0 y bureau-to-workout 0.1.0, lo que desplaza algunas metricas en la tercera cifra decimal respecto al paper.

## Capacidades

- Clasificacion tabular de riesgo de impago (probabilidad de default) sobre atributos de buro.
- Scorecard interpretable con generacion de codigos de razon (`reason_codes`) por solicitante.
- Codificacion auto-supervisada de secuencias mensuales de buro (24 meses) en un embedding de baja dimension.
- Reject inference: estimacion de riesgo para poblaciones rechazadas mediante IPW, fuzzy augmentation y aumentacion con datos de buro.
- Modelado de uplift causal: estimacion del efecto de ofertas de reestructuracion frente a cobranza estandar con DR-learner cross-fitted.
- Estimacion de propension multinomial sobre ofertas registradas (correccion de sesgo de politica).
- Evaluacion off-policy y analisis de sensibilidad a moratorias en etiquetas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso en lenguaje natural, vision, audio ni capacidades multilingues: es un conjunto de estimadores tabulares.

## Casos de uso

- Reproduccion de experimentos academicos: cargar los `.skops` y el scorecard para replicar las tablas E1, E2, E3 y R1-R4 del preprint con las mismas semillas, verificando resultados en el conjunto out-of-time de los meses 36-45.
- Docencia en riesgo de credito: usar el scorecard WoE y su tabla de puntos para explicar bins monotonos, escalado de puntos y codigos de razon en un curso de scoring, sin necesidad de datos reales.
- Benchmark de tecnicas de reject inference: comparar en un entorno controlado el AUC y el ratio predicho/observado en rechazados entre aprobados-solo, IPW, fuzzy augmentation y aumentacion con buro (0,690 frente a 0,706 de AUC en el test de E2).
- Prototipado de pipelines de decision causal: emplear el DR-learner y el modelo de propension como plantilla para estimar el efecto de ofertas de cobranza antes de invertir en datos reales.
- Validacion de infraestructura MLOps tabular: los artefactos `skops` permiten probar serializacion segura (inspeccion de tipos no confiables con `sio.get_untrusted_types`) y versionado de dependencias en un pipeline de CI.
- Generacion de datos sinteticos de referencia: el dataset asociado `thanatchon36/bureau-to-workout` sirve para construir tests de regresion de modelos de scoring con etiquetas conocidas y sesgos de politica controlados.
- Analisis de estabilidad bajo moratoria: usar los modelos E3 para estudiar como cambia la calibracion cuando las etiquetas de impago se retrasan, util para disenar politicas de reporte en entidades financieras.

## Benchmarks y rendimiento

Resultados publicados por el autor para estos artefactos exactos (test out-of-time E1, meses 36-45 tras el shock):

| Modelo | AUC OOT | Paper, semilla 7 | PSI dev -> OOT |
|---|---|---|---|
| Scorecard WoE | 0,806 | 0,806 | 0,12 |
| GBM monotono | 0,813 | 0,815 | 0,12 |
| Solo embedding SSL (sonda lineal) | 0,773 | 0,772 | 0,59 |
| GBM + embedding SSL | 0,819 | 0,818 | 0,37 |

Reject inference (E2), mitad de test de los solicitantes del prestamista 0. El ratio predicho/observado entre rechazados mide la infraestimacion del riesgo no observado (ideal 1):

| Etiquetas de entrenamiento | AUC, todos los solicitantes | Predicho / observado, rechazados | Paper, semilla 7 |
|---|---|---|---|
| Solo aprobados (AO) | 0,690 | 0,58 | 0,58 |
| AO + IPW sobre observables | 0,683 | 0,56 | 0,55 |
| Fuzzy augmentation | 0,693 | 0,58 | 0,58 |
| Aumentado con buro (BA) | 0,706 | 0,92 | 0,92 |
| BA + IPW para rechazados no observados | 0,704 | 0,91 | 0,91 |
| Oraculo (todos, Y verdadera) | 0,710 | 0,96 | 0,96 |

No se han publicado en la informacion disponible resultados de benchmarks estandar tipo MMLU, HumanEval o GSM8K, ya que el modelo no realiza tareas de lenguaje.

## Requisitos de hardware

- Inferencia en CPU: los modelos son scikit-learn y caben en memoria RAM convencional; el tamano del repositorio es de 0,0 GB.
- VRAM estimada: no aplica; no requiere GPU para inferencia.
- GPU recomendadas: no aplica. Cualquier GPU solo aportaria ventaja en el reentrenamiento, no en la prediccion.
- Cabe en cualquier portatil consumer: el cuello de botella es la RAM para cargar pandas y los artefactos, no el computo.
- Opciones de despliegue: `skops.io` para carga segura, `joblib`/pickle no recomendado por el autor, y servido via FastAPI, BentoML o un contenedor Python con scikit-learn 1.9.1. No hay soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada; al ser predicciones tabulares con GBM y regresion logistica, la latencia esperada es de orden de milisegundos por lote, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| bureau-to-workout | Artefactos tabulares scikit-learn (scorecard, GBM, DR-learner) | no disponible | no aplica | AUC OOT 0,806-0,819 en E1 | MIT | Hugging Face, GitHub, Zenodo |
| TabPFN | Transformer tabular preentrenado | no disponible | no aplica | no comparable directamente (otra tarea y datos) | no disponible | Hugging Face |
| XGBoost / LightGBM | GBM generico | no disponible | no aplica | dependiente del dataset | Apache 2.0 / MIT | Amplia |
| Scorecard WoE clasico | Regresion logistica con bins | no disponible | no aplica | linea base interpretable | no aplica | Implementaciones multiples |

La comparacion directa no es posible porque `bureau-to-workout` esta entrenado sobre simuladores propios y sus metricas solo son validas en ese entorno sintetico. Frente a XGBoost o LightGBM, la diferencia es que aqui los artefactos incluyen la logica causal (DR-learner, propension) y la correccion de sesgo de etiquetas, no solo el clasificador.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sinteticos de los simuladores del paper; no validado con datos reales de NCB, SAM ni ninguna entidad financiera.
- No debe usarse para puntuar personas reales ni para tomar decisiones de credito: el propio autor lo declara de forma explicita.
- Los efectos de grupo de los simuladores son decisiones de diseno arbitrarias, por lo que los sesgos observados no reflejan sesgos del mundo real ni sirven para auditorias de fairness.
- Riesgo de alucinacion no aplica (no genera texto), pero si de falsa confianza: las metricas AUC y PSI solo tienen sentido dentro del entorno simulado.
- Licencia MIT permite uso comercial del codigo y los artefactos, pero la falta de validacion real hace inviable su uso en produccion crediticia sin reentrenamiento y validacion independiente.
- Dependencia de versiones concretas de scikit-learn, numpy y pandas; cambios de version pueden alterar resultados en la tercera cifra decimal.
- Carga con `skops` requiere inspeccionar previamente los tipos no confiables (`get_untrusted_types`) antes de confiar en el artefacto.
- El encoder SSL tiene un PSI dev -> OOT de 0,59, muy superior al 0,12 del scorecard y del GBM, lo que indica deriva poblacional considerable en el embedding.
- No soporta texto, vision ni audio; cualquier caso de uso fuera de datos tabulares queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thanatchon36/bureau-to-workout
- Dataset asociado: https://huggingface.co/datasets/thanatchon36/bureau-to-workout
- Paper (preprint): https://thanatchon36.github.io/bureau-to-workout/paper/
- Codigo: https://github.com/thanatchon36/bureau-to-workout
- Archivo Zenodo: https://doi.org/10.5281/zenodo.24102251
- Documentacion de skops: https://skops.readthedocs.io
