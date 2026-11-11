# trungvu0307/pancreasignal-urine-logreg

## Resumen

PancreaSignal urine panel es un modelo de clasificación tabular basado en regresión logística que estima la probabilidad de adenocarcinoma ductal de páncreas (PDAC) a partir de tres proteínas urinarias (LYVE1, REG1B, TFF1), creatinina urinaria, edad y sexo. Lo desarrolla el usuario trungvu0307 y se distribuye como pipeline de scikit-learn (`StandardScaler` seguido de `LogisticRegression`), no como red neuronal. El modelo compara PDAC frente al resto de la población del estudio de entrenamiento: controles sanos y pacientes con enfermedad hepatobiliar benigna.

Su relevancia radica en que reproduce un panel de biomarcadores urinarios publicado por Debernardi et al. en 2020 con un enfoque de evaluación riguroso: validación leave-one-center-out sobre cuatro hospitales (BPTB, LIV, ESP, UCL) con 590 pacientes, de los cuales 199 tienen PDAC. La regresión logística superó a XGBoost en hospitales no vistos por +0,041 AUROC, lo que justifica la elección de un modelo lineal simple y altamente interpretable.

Es un prototipo de investigación, no un dispositivo médico, y el autor lo advierte explícitamente: los datos son de caso-control, no de una población de cribado, por lo que la probabilidad de salida no equivale a un riesgo real en clínica. El repositorio es de tamaño despreciable (0,0 GB) y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn: `StandardScaler` + `LogisticRegression` (L2, C=1.0, solver lbfgs) |
| Parametros totales | 6 coeficientes + 1 intercepto + 6 medias y 6 escalas del escalador (no disponible el recuento exacto de parametros del bundle) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin contexto secuencial) |
| Tipos de cuantizacion | no aplica (coeficientes en coma flotante; sin cuantizacion publicada) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | `model_light.json` (coeficientes serializados en JSON), `urine_v1.joblib` (bundle pickle), `urine_v1.meta.json` (SHA-256) |

## Arquitectura y entrenamiento

El modelo es una regresión logística con regularización L2 (C=1.0), sin pesos de clase y sin paso adicional de calibración, precedida de un `StandardScaler`. Las features de entrada son cada proteína urinaria dividida por la creatinina y transformada con `log1p`, más la edad y el sexo codificado como 1 para varón. La salida es la probabilidad de PDAC frente al resto de la población de entrenamiento. No hay transformer, MoE ni mecanismo de atención: es un clasificador lineal sobre seis variables.

Los datos provienen del panel urinario de Debernardi et al. 2020: 590 pacientes de cuatro hospitales (BPTB, LIV, ESP, UCL), con 199 casos de PDAC y 391 controles sanos o con enfermedad hepatobiliar benigna. El ajuste se realizó con scikit-learn 1.9.1 y Python 3.14.4 desde el commit `ccd5575`. La evaluación leave-one-center-out entrena con tres hospitales y puntúa en el cuarto; el modelo del repositorio es la misma receta reajustada sobre los 590 pacientes. El autor documenta que la regresión logística batió a XGBoost en hospitales no vistos por +0,041 AUROC (intervalo +0,015 a +0,066), lo que constituye la principal decisión de diseño.

## Capacidades

- Clasificación tabular binaria: estima probabilidad de PDAC a partir de seis variables clínicas y bioquímicas.
- Normalización de biomarcadores urinarios por creatinina y transformación logarítmica integradas en el pipeline.
- Detección de entradas fuera del rango de entrenamiento: `model_light.json` incluye rangos y percentiles que el código del proyecto usa para marcar valores anómalos.
- Marcado de valores más de 10× fuera del rango de entrenamiento, probablemente errores de unidades.
- Reconstrucción determinista desde JSON sin necesidad de unpickling, compatible con cualquier versión de scikit-learn.
- Verificación de equivalencia entre el pipeline reconstruido y el bundle pickle mediante tests del proyecto.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni capacidades multilingües.

## Casos de uso

- Investigación en biomarcadores de cáncer de páncreas: reproducción del panel de Debernardi et al. con una implementación abierta y evaluada leave-one-center-out, útil para comparar baselines lineales frente a modelos de árbol.
- Prototipado de pipelines clínicos de clasificación tabular: sirve como referencia mínima de preprocesado (normalización por creatinina, `log1p`, escalado) para equipos que construyan modelos similares.
- Validación de infraestructura de inferencia ligera: al cargarse desde JSON sin unpickling, es adecuado para entornos con restricciones de seguridad o versiones de scikit-learn heterogéneas.
- Docencia y demostración de buenas prácticas: el repositorio incluye tests de equivalencia entre formatos, metadatos SHA-256 y documentación de rangos de entrenamiento.
- Integración en una API de demostración: el autor lo sirve a través de la API y el agente PancreaSignal, accesible desde el Space público.
- Análisis de sensibilidad a errores de unidades: los umbrales de 10× permiten estudiar cómo afectan entradas mal escaladas a la probabilidad estimada.
- Comparación con CA19-9 plasmático: el modelo permite contrastar el rendimiento del panel urinario (AUROC 0,780) frente al marcador plasmático (AUROC 0,890) en los mismos pacientes.

## Benchmarks y rendimiento

Evaluación leave-one-center-out con intervalos de confianza al 95% obtenidos por 1.000 remuestreos bootstrap de las predicciones out-of-fold agrupadas:

| Metrica | Valor | IC 95% |
|---|---|---|
| AUROC | 0,785 | 0,745 – 0,823 |
| Sensibilidad a 90% especificidad | 53,8% | no disponible |
| Sensibilidad a 95% especificidad | 40,2% | no disponible |

AUROC por hospital retenido:

| Hospital retenido | AUROC |
|---|---|
| BPTB | 0,834 |
| LIV | 0,800 |
| ESP | 0,819 (solo 6 negativos, muy ruidoso) |

Comparaciones documentadas por el autor:

| Comparacion | Resultado |
|---|---|
| Regresion logistica vs XGBoost en hospitales no vistos | +0,041 AUROC (+0,015 a +0,066) |
| Panel urinario vs CA19-9 plasmatico (PDAC vs enfermedad benigna) | 0,780 vs 0,890 AUROC |
| Aporte de las proteinas sobre la edad en LIV | +0,000 AUROC (−0,081 a +0,080) |

## Requisitos de hardware

- VRAM: no aplica; el modelo es una regresión logística de seis features y se ejecuta en CPU.
- GPU: no requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en cualquier equipo consumer, incluidos Raspberry Pi y entornos serverless de mínima asignación.
- Despliegue: scikit-learn 1.9.1 para el bundle pickle; el pipeline reconstruido desde `model_light.json` funciona con cualquier versión de scikit-learn. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada; por la naturaleza del modelo, la inferencia es del orden de microsegundos a milisegundos por fila en CPU.
- Almacenamiento: el repositorio ocupa 0,0 GB según Hugging Face.

## Comparativa con modelos similares

| Modelo | Tipo | Features | AUROC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PancreaSignal urine logreg | Regresion logistica | 6 (3 proteinas, creatinina, edad, sexo) | 0,785 (leave-one-center-out) | no disponible | Hugging Face + GitHub |
| XGBoost (baseline del mismo estudio) | Arboles gradient boosting | Mismas 6 features | 0,744 aprox. (0,041 menos que logreg) | no disponible | Referenciado en RESULTS.md |
| CA19-9 plasmatico | Marcador serologico | 1 biomarcador | 0,890 (PDAC vs benigno) | no aplica | Uso clinico estandar |

No se dispone de información sobre otros modelos públicos comparables de clasificación tabular para PDAC a partir de panel urinario en la documentación consultada.

## Limitaciones y advertencias

- Datos de caso-control, no de cribado: el 34% de los pacientes de entrenamiento tiene PDAC, muy por encima de cualquier clínica real; la probabilidad solo es interpretable en relación con este estudio.
- Calibración no transferible entre hospitales: la proporción de PDAC es del 20% en BPTB y del 70% en LIV; modelos entrenados sin BPTB predicen un riesgo medio de 0,43 allí, y sin LIV predicen 0,47.
- En LIV las proteínas no aportan nada sobre la edad (diferencia de AUROC +0,000, intervalo −0,081 a +0,080); todos los pacientes benignos de LIV tienen pancreatitis, la condición más difícil de distinguir de PDAC.
- CA19-9 plasmático supera al panel en los mismos pacientes (AUROC 0,890 frente a 0,780 para PDAC vs enfermedad benigna).
- Pocos cánceres tempranos: solo 16 pacientes en la información disponible, lo que limita la evaluación en estadios iniciales.
- Sensibilidad de entrada: un valor 1.000× demasiado bajo aún parece normal al modelo; hay que verificar unidades (proteínas en ng/mL, creatinina en mg/mL).
- El bundle `urine_v1.joblib` requiere exactamente scikit-learn 1.9.1 y solo debe deserializarse desde fuentes de confianza.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- No es un dispositivo médico y no debe usarse en decisiones clínicas; es un prototipo de investigación.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de extrapolación indebida fuera del rango de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trungvu0307/pancreasignal-urine-logreg
- Demo en Spaces: https://huggingface.co/spaces/trungvu0307/pancreasignal
- Repositorio GitHub: https://github.com/vutr2/pancreasignal
- Resultados completos: https://github.com/vutr2/pancreasignal/blob/main/RESULTS.md
- Codigo de la API ligera: https://github.com/vutr2/pancreasignal/blob/main/src/pancreasignal/api/light.py
- Commit de reproducibilidad: https://github.com/vutr2/pancreasignal/commit/ccd55759df0d173319cc35073596b295b426b6ce
- Estudio de origen (Debernardi et al. 2020): no disponible el enlace directo en la información proporcionada
