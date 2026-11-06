# zhangzhan394340606/cyp2026-model-report

## Resumen

El repositorio `zhangzhan394340606/cyp2026-model-report` no contiene un modelo de lenguaje, sino el informe de un participante en el OpenADMET CYP Challenge 2026, una competicion de prediccion de propiedades ADMET centrada en la inhibicion de enzimas del citocromo P450 (CYP). Lo publica Zhan Zhang, investigador independiente de Xi'an (China), bajo licencia Apache 2.0, y describe la metodologia empleada en dos pistas del reto: inhibicion directa (regresion) e inhibicion dependiente del tiempo o TDI (clasificacion).

La aproximacion combina un ensemble multi-tarea de Chemprop D-MPNN, con especialistas por isoforma y transformers de SMILES preentrenados y ajustados, validado mediante validacion cruzada agrupada de cinco pliegues. Para la pista de TDI se emplean clasificadores LightGBM con ajuste de umbral. El autor indica que el codigo y el metodo detallado se publicaran cuando finalice la competicion.

Por tanto, esta ficha documenta un artefacto de investigacion reproducible en quimioinformatica, no un modelo generativo: no hay parametros de lenguaje, contexto conversacional ni capacidades de generacion. Su relevancia radica en el dominio (prediccion de interacciones farmaco-enzima para cribado temprano) y en la transparencia metodologica declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de Chemprop D-MPNN multi-tarea + especialistas por isoforma + transformers de SMILES ajustados; LightGBM para TDI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada: cadenas SMILES) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no se publican pesos; solo informe) |

## Arquitectura y entrenamiento

El componente principal es un ensemble de redes neuronales de mensajes dirigidos (D-MPNN) implementadas con Chemprop, entrenadas de forma multi-tarea sobre isoformas CYP y complementadas con especialistas por isoforma. A ello se suman transformers de SMILES preentrenados y ajustados de forma supervisada. Para la prediccion de inhibicion dependiente del tiempo se usan clasificadores LightGBM con ajuste de umbral sobre las probabilidades.

El entrenamiento utiliza los datos oficiales del reto y conjuntos publicos de potencia frente a CYP, con eliminacion previa de estructuras publicas que solapaban con el conjunto ciego. La validacion se realizo con validacion cruzada agrupada por grupos o clusters y cinco pliegues, en lugar de particiones aleatorias, lo que evita fuga de informacion entre moleculas estructuralmente similares. Se aplico calibracion de distribucion y ensemble. No se emplearon etiquetas de test ni datos propietarios. El autor no detalla el numero de compuestos ni la composicion exacta del dataset.

## Capacidades

- Prediccion de inhibicion directa de isoformas CYP como tarea de regresion (valores de potencia).
- Prediccion de inhibicion dependiente del tiempo (TDI) como tarea de clasificacion binaria.
- Modelado multi-tarea con especialistas por isoforma, lo que permite compartir representacion entre isoformas relacionadas.
- Procesamiento de moleculas representadas como grafos moleculares (D-MPNN) y como cadenas SMILES (transformers).
- Calibracion de probabilidades y ajuste de umbral para clasificacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.

## Casos de uso

- Cribado virtual temprano en descubrimiento de farmacos: el ensemble predice la probabilidad de inhibicion de isoformas CYP para candidatos, permitiendo descartar compuestos con riesgo de interacciones farmacologicas antes de sintesis.
- Evaluacion de riesgo de interacciones farmaco-farmaco (DDI): la prediccion de inhibicion de CYP3A4, CYP2D6 y otras isoformas alimenta modelos de exposicion para estimar riesgos regulatorios.
- Priorizacion de compuestos en quimica medicinal: los especialistas por isoforma permiten identificar selectividad frente a una diana frente a la inhibicion de CYP.
- Deteccion de inhibidores dependientes del tiempo: el clasificador LightGBM con umbral ajustado sirve para filtrar compuestos con riesgo de inactivacion metabolica irreversible.
- Reproduccion metodologica en competiciones ADMET: la descripcion de validacion agrupada y calibracion es util como referencia para equipos que aborden retos similares de OpenADMET.
- Analisis de dominio de aplicabilidad: la comparacion entre D-MPNN y transformers de SMILES ajustados permite estudiar que representacion generaliza mejor fuera del conjunto de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de las metricas oficiales y del validador oficial de submission, pero no incluye cifras.

## Requisitos de hardware

- No disponible: el repositorio no publica pesos ni codigo de inferencia, solo el informe metodologico.
- Al tratarse de un ensemble de D-MPNN y modelos tipo transformer sobre SMILES, la inferencia seria ligera en comparacion con modelos de lenguaje; un ensemble de este tipo suele ejecutarse en CPU o en una GPU consumer, pero no hay datos publicados de latencia ni throughput.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) no aplicables: no es un modelo generativo.
- VRAM estimada: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Pesos publicados |
|---|---|---|---|---|
| cyp2026-model-report (este) | Ensemble D-MPNN + transformers SMILES + LightGBM | Prediccion CYP (regresion y TDI) | Apache 2.0 | No |
| Chemprop (referencia) | D-MPNN | Prediccion de propiedades moleculares | MIT (segun el proyecto original) | Codigo, no pesos especificos |
| ADMET-AI | Ensemble de modelos de grafos | Prediccion ADMET general | MIT | Codigo y pesos |
| Modelos de la suite Therapeutics Data Commons | Varios | Multiples tareas ADMET | Variable | Variable |

No se dispone de datos de rendimiento comparativo para este artefacto, por lo que la comparativa se limita a tipo de arquitectura y disponibilidad.

## Limitaciones y advertencias

- El repositorio es un informe, no un modelo desplegable: no incluye pesos, tokenizador ni scripts de inferencia.
- El codigo y el metodo detallado se publicaran solo tras el cierre de la competicion, por lo que la reproducibilidad completa no es posible en la fecha de publicacion.
- Al ser un modelo entrenado especificamente para el reto, el sobreajuste a la distribucion de los datos de competicion es un riesgo; la validacion agrupada mitiga parte de este problema, pero no lo elimina.
- No se documentan sesgos de dominio (por ejemplo, cobertura quimica limitada a los conjuntos publicos de CYP).
- No hay informacion sobre calibracion fuera de la distribucion de entrenamiento ni sobre el dominio de aplicabilidad.
- La licencia Apache 2.0 se aplica al contenido publicado; el uso comercial de la metodologia requeriria reentrenar y validar de forma independiente.
- No se han publicado metricas, por lo que no es posible evaluar su calidad frente a alternativas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhangzhan394340606/cyp2026-model-report
- Chemprop (implementacion D-MPNN): https://github.com/chemprop/chemprop
- OpenADMET: https://openadmet.org
- LightGBM: https://github.com/microsoft/LightGBM
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs o demos del autor.
