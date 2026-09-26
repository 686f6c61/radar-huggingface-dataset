# Yotto3108/cgm-moment-temporal-3500

## Resumen

cgm-moment-temporal-3500 es un checkpoint de investigacion publicado por Yotto3108 para aprendizaje de representaciones sobre monitorizacion continua de glucosa (CGM). Combina un encoder de CGM entrenable que recibe la serie cruda de 24 horas en mg/dL junto con su mascara de observacion, y un prior congelado MOMENT-1-large que aporta tokens horarios a traves de una transformacion PCA8 fijada y una cross-attention temporal tambien entrenable. La representacion fusionada resultante tiene 128 dimensiones y una cabeza aprendida durante el preentrenamiento publico produce ocho coordenadas de forma.

El modelo resuelve una tarea concreta: extraer caracteristicas congeladas de ventanas de CGM para clasificacion downstream mediante regresion logistica. La entrada primaria de clasificacion concatena las ocho coordenadas de forma con la media observada real de la ventana del individuo, dando 9 dimensiones; existe una entrada secundaria de 128 dimensiones mas la media. La adaptacion publica de CGM uso 1.094 ventanas, semilla 43, batch 32 y exactamente 3.500 actualizaciones.

Su relevancia es metodologica mas que de producto: documenta un protocolo estricto de congelacion de pesos, un loader verificable con checksum, y una evaluacion sobre 14 celdas dataset/tarea, cinco folds de sujeto y diez repeticiones con splitseed42. El propio autor advierte que el resultado no es estable entre semillas por encima del 60%, no esta confirmado en test independiente y no demuestra que la cross-attention sea necesaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: encoder de CGM entrenable + prior congelado MOMENT-1-large (tokens horarios) + cross-attention temporal entrenable + cabeza de 8 coordenadas de forma |
| Parametros totales | no disponible (no se publica recuento; los pesos upstream de MOMENT-1-large permanecen congelados y no se redistribuyen) |
| Longitud de contexto | Ventana de 24 horas: 288 muestras a intervalos de 5 minutos; el prior aporta tokens horarios; representacion fusionada de 128 dimensiones |
| Tipos de cuantizacion | no disponible (bundle PyTorch de investigacion; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no aplica / no disponible (modelo de series temporales, no de texto) |
| Licencia | no disponible en el repositorio; se mantienen los terminos upstream de MOMENT-1-large y Chronos-2 |
| Formato de pesos | PyTorch (`model.pt`, SHA256 `ebc40a0221e1e09bfa15d166f29abd3d5e89bbe1a8a05f81e732190e43e1b9ff`), mas bases agregadas token/maestro, normalizadores de objetivos, loader con checksum y metadatos |

## Arquitectura y entrenamiento

La ruta de datos parte de la senal CGM cruda de 24 horas y su mascara de observacion, que alimentan un encoder entrenable. En paralelo, el prior MOMENT-1-large congelado suministra tokens horarios mediante una transformacion de entrada PCA8 ajustada sobre filas publicas de preentrenamiento y congelada antes del entrenamiento del modelo. Una cross-attention entrenable fusiona ambas ramas en una representacion de 128 dimensiones, y una cabeza, tambien aprendida durante el preentrenamiento publico, produce ocho coordenadas de forma. La funcion de perdida combina error cuadratico de forma, error cuadratico de media y 0,1 de JEPA temporal; el JEPA de contexto se fija a cero, la supervision de desviacion estandar se fija a cero y se conserva EMA. Tanto el PCA de los objetivos maestros como el PCA de los tokens de entrada se ajustan sobre filas publicas antes del entrenamiento. Entrenan realmente el encoder, la atencion, la cabeza y los predictores temporales; los pesos oficiales de MOMENT permanecen congelados y no se usa Wear-CGM.

El bundle incluye el `model.pt` original sin modificar, bases agregadas token/maestro y normalizadores, la fuente exacta de dependencias, un loader con checksum, el entorno numerico de ejecucion y metadatos. No contiene registros de CGM, embeddings ni predicciones de participantes, clasificador downstream ni optimizador. El loader descarga `AutonLab/MOMENT-1-large` en la revision indicada en `bundle.json` y, por paridad historica del constructor, carga temporalmente un Chronos-2 fijado que el constructor original elimina antes de cualquier computo del modelo: Chronos no es prior, predictor ni maestro en este modelo.

## Capacidades

- Extraccion de representaciones congeladas de ventanas de CGM de 24 horas a partir de la senal cruda en mg/dL, la mascara de observacion y el slot de inicio local de 5 minutos (0..287).
- Salida primaria de 9 dimensiones para clasificacion downstream: 8 coordenadas de forma mas la media observada real de la ventana del individuo.
- Salida secundaria alternativa de 128 dimensiones de representacion fusionada mas la media.
- Clasificacion downstream mediante regresion logistica L2 con C1 sobre caracteristicas congeladas.
- Manejo explicito de valores ausentes mediante mascara de observacion, preservando la serie sin compactar las muestras faltantes.
- Sensibilidad a la marca temporal fisica: la entrada incluye el slot horario local de 5 minutos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No tiene capacidades multilingues ni de vision, audio o thinking mode.

## Casos de uso

- Investigacion en fenotipado glucemico: clasificar patrones de ventanas de 24 horas (por ejemplo, riesgo de episodios de hipoglucemia) usando las 9 caracteristicas congeladas y un clasificador logistico ajustado solo sobre el fold de entrenamiento.
- Benchmarking de modelos fundacionales de series temporales en dominio clinico: el protocolo declarado encaja en el marco gluco-fm-bench, con 14 celdas dataset/tarea, cinco folds de sujeto y diez repeticiones.
- Extraccion de embeddings para pipelines propios: `extract_features` devuelve un vector congelado que puede alimentar clasificadores, agrupamientos o analisis estadisticos posteriores sin reentrenar la ruta de caracteristicas.
- Reproducibilidad y auditoria de resultados: el checksum SHA256 de `model.pt`, la revision fijada del Hub y las bases de maestros publicos permiten repetir exactamente la extraccion e inferencia.
- Estudio metodologico de cross-attention frente a fusion alineada: comparar el rendimiento del modelo con el control de fusion alineada que alcanzo 60,632668 % de PR-AUC en la misma evaluacion.
- Control de calidad de datos CGM: verificar el tratamiento de mg/dL crudo, faltantes y tiempo fisico sobre ventanas de 288 muestras antes de integrar una cohorte.
- Material docente de metodologia TSFM: ejemplo reproducible de congelar un prior de series temporales y entrenar unicamente adaptadores y cabeza sobre datos publicos.

## Benchmarks y rendimiento

| Metrica | Seed 43 (checkpoint publicado) | Otras semillas | Media de 3 semillas | SD muestral |
|---|---|---|---|---|
| PR-AUC (%) | 60,709051 | 58,829941 y 59,975307 | 59,838100 | 0,947039 pp |
| AUROC (%) | 68,609122 | no disponible | no disponible | no disponible |
| Macro-F1 (%) | 60,049084 | no disponible | no disponible | no disponible |

Datos adicionales de la evaluacion: 14 celdas dataset/tarea, cinco folds de sujeto, diez repeticiones, splitseed42 y regresion logistica L2 con C1; el resultado reportado es la media de las medias por fold de cada celda. Un control de fusion alineada competitivo obtuvo 60,632668 % de PR-AUC, y los intervalos AP pareados condicionales no establecieron superioridad de la atencion aprendida. No consta validacion clinica.

## Requisitos de hardware

- Inferencia en CPU soportada de forma explicita: el loader admite `--device cpu` y el replay de clasificacion exacto usa lotes de 16 caracteristicas nativas en CPU.
- Huella de memoria reducida por ventana: el ejemplo de carga usa tensores de 2x288 y la representacion fusionada es de 128 dimensiones.
- El prior MOMENT-1-large congelado se descarga aparte desde el Hub y suma su propio coste de memoria y almacenamiento.
- VRAM estimada: no disponible.
- GPU recomendadas: no disponible (no se publican requisitos ni modelos de GPU).
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: bundle PyTorch propio con loader verificable; no es un repositorio AutoModel de Transformers y no hay soporte declarado para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto o ventana | Rendimiento en la evaluacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| cgm-moment-temporal-3500 | Encoder CGM + prior MOMENT congelado + cross-attention | no disponible | 24 h (288 muestras a 5 min) | PR-AUC 60,709051 % (seed 43); media 59,838100 % en 3 semillas | no disponible | HuggingFace, bundle PyTorch |
| Control de fusion alineada | Fusion alineada sin atencion aprendida | no disponible | misma evaluacion | PR-AUC 60,632668 % | no disponible | citado en la model card, no publicado como modelo |
| MOMENT-1-large (AutonLab) | Modelo fundacional de series temporales | no disponible en esta ficha | no disponible | no disponible | terminos upstream propios | HuggingFace, pesos congelados como prior |
| Chronos-2 | Modelo de series temporales | no disponible en esta ficha | no disponible | no disponible | terminos upstream propios | cargado solo por paridad de constructor, retirado antes de cualquier computo |

No se dispone de comparativas con otros modelos de representacion de CGM en la informacion proporcionada.

## Limitaciones y advertencias

- El resultado no es estable entre semillas por encima del 60 %: desviacion estandar muestral de 0,947039 puntos porcentuales en tres semillas (60,709051 %, 58,829941 %, 59,975307 %).
- No existe confirmacion en test independiente; los numeros son de desarrollo.
- No se demuestra que la cross-attention sea necesaria: el control de fusion alineada obtuvo 60,632668 % de PR-AUC y los intervalos AP pareados condicionales no establecieron superioridad.
- Identidad global de participantes no verificada, incluida la agrupacion a nivel de sesion en Shanghai, lo que limita la interpretacion de los resultados.
- Seleccion repetida en desarrollo y protocolo de evaluacion fijo (splitseed42, 14 celdas, 5 folds, 10 repeticiones) que puede favorecer el sobreajuste al propio protocolo.
- No debe inferirse validacion clinica ni uso en decision medica; el modelo no esta pensado para produccion asistencial.
- Licencia no declarada en el repositorio: los terminos upstream de MOMENT-1-large y Chronos-2 siguen aplicando y debe verificarse su compatibilidad con uso comercial antes de cualquier despliegue.
- El bundle no redistribuye pesos upstream ni incluye datos de CGM, embeddings de participantes, clasificador downstream ni optimizador; sin esos componentes no se puede reproducir el entrenamiento completo.
- Adaptacion realizada solo con 1.094 ventanas publicas y sin Wear-CGM, lo que limita la generalizacion a otras cohortes y dispositivos.
- No apto para tareas de lenguaje, tool calling ni agentes; su uso esta restringido a series temporales de glucosa con mg/dL crudo, mascara de faltantes y tiempo fisico preservados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yotto3108/cgm-moment-temporal-3500
- Instrucciones del evaluador y handoff de investigacion (gluco-fm-bench): https://github.com/jaeukmoon/gluco-fm-bench/blob/main/company_handoff/UDIT_RESEARCH_HANDOFF.md
- Prior oficial utilizado: https://huggingface.co/AutonLab/MOMENT-1-large
- Paper, blog o demo del modelo: no disponible
