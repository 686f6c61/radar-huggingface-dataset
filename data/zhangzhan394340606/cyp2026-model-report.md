# zhangzhan394340606/cyp2026-model-report

## Resumen

`cyp2026-model-report` es un artefacto publicado en Hugging Face por Zhan Zhang (investigador independiente, Xi'an, China) que documenta la solucion presentada al OpenADMET CYP Challenge 2026. No es un modelo de lenguaje: es un paquete de modelos de quimioinformatica orientados a la prediccion de propiedades ADMET, concretamente la inhibicion de isoformas del citocromo P450 (CYP). El repositorio agrupa los artefactos y la descripcion metodologica de dos pistas del reto: inhibicion directa (regresion) e inhibicion dependiente del tiempo o TDI (clasificacion).

La aproximacion combina un ensamblado multi-tarea de Chemprop D-MPNN (Directed Message Passing Neural Network) con especialistas por isoforma y transformers de SMILES preentrenados y ajustados finamente. Para la pista TDI se emplean clasificadores LightGBM con ajuste de umbral. La validacion se realizo con validacion cruzada agrupada por clusters en cinco folds, usando las metricas y el validador oficiales del reto, sin acceso a etiquetas del conjunto ciego.

El interes del artefacto es doble: por un lado, documenta una receta reproducible para prediccion ADMET con quimica grafica y modelos de lenguaje molecular; por otro, ilustra las buenas practicas de validacion en dominios donde la fuga de informacion entre estructuras similares es el principal riesgo metodologico. La licencia es Apache 2.0, pero el repositorio no contiene pesos de un modelo generativo ni una model card convencional con especificaciones de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamblado multi-tarea de Chemprop D-MPNN (message passing dirigido sobre grafos moleculares) con especialistas por isoforma; transformers de SMILES preentrenados ajustados finamente; clasificadores LightGBM para TDI |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; opera sobre grafos moleculares y cadenas SMILES) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada en formato SMILES, no lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (el repositorio se describe como informe de modelo; no se detalla el formato de los artefactos) |

## Arquitectura y entrenamiento

El nucleo del sistema es un ensamblado de Chemprop D-MPNN, una red neuronal de paso de mensajes sobre grafos moleculares en la que los mensajes se dirigen a lo largo de los enlaces en lugar de propagarse de forma simetrica, lo que reduce la redundancia y mejora la generalizacion en tareas de propiedad molecular. Sobre esta base se construyen cabezas multi-tarea y especialistas por isoforma CYP, de modo que cada isoforma dispone de un modelo dedicado ademas de compartir representaciones con el resto. En paralelo se ajustan finamente transformers de SMILES preentrenados, que aportan una vista secuencial complementaria a la vista grafica.

Para la pista de inhibicion dependiente del tiempo se usan clasificadores LightGBM con ajuste de umbral, una eleccion coherente con problemas de clasificacion tabular de senal debil donde los modelos de arboles suelen ser competitivos y mas estables que las redes profundas. El entrenamiento emplea los datos del reto y conjuntos publicos de potencia CYP; se eliminaron las estructuras publicas solapadas con el conjunto ciego antes de entrenar y no se usaron etiquetas de test ni datos propietarios. La validacion es cruzada agrupada por clusters en cinco folds, lo que evita el optimismo artificial de las particiones aleatorias cuando hay familias estructurales muy similares entre train y validacion. Se aplica ademas calibracion de distribucion sobre el ensamblado.

## Capacidades

- Prediccion de inhibicion directa de isoformas CYP como tarea de regresion, con ensamblado multi-tarea y especialistas por isoforma.
- Prediccion de inhibicion dependiente del tiempo (TDI) como tarea de clasificacion binaria con clasificadores LightGBM y umbral ajustado.
- Modelado de propiedades ADMET a partir de estructura molecular en formato SMILES o grafo.
- Extraccion de representaciones moleculares mediante D-MPNN y transformers de SMILES.
- Validacion con el validador oficial de submission del reto OpenADMET CYP 2026.
- Calibracion de distribucion de las predicciones del ensamblado.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto: no es un modelo de lenguaje.
- No dispone de capacidades de vision, audio ni modo de razonamiento extendido.

## Casos de uso

- Filtrado temprano en descubrimiento de farmacos: el ensamblado puede puntuar bibliotecas de compuestos antes de sintetizarlos, priorizando candidatos con bajo riesgo de inhibicion CYP y reduciendo el coste experimental en fases tempranas.
- Evaluacion de interacciones farmacologicas: predecir la inhibicion de isoformas CYP concretas permite anticipar riesgo de interacciones metabolismo-dependientes en candidatos a farmaco.
- Priorizacion de compuestos para ensayos TDI: el clasificador LightGBM con umbral ajustado permite separar compuestos con riesgo de inhibicion dependiente del tiempo, un fallo toxico relevante en desarrollo.
- Enriquecimiento de pipelines ADMET internos: los modelos pueden integrarse como etapa de scoring en plataformas de quimioinformatica existentes que ya consumen SMILES.
- Analisis de espacios quimicos publicos: aplicar el ensamblado a conjuntos como ChEMBL o bases de compuestos comerciales para mapear la distribucion de riesgo CYP por familia estructural.
- Reproduccion metodologica: el informe sirve como plantilla de validacion agrupada por clusters y de combinacion de modelos graficos con transformers de SMILES para equipos que aborden retos ADMET similares.
- Investigacion en modelado molecular: las representaciones D-MPNN y de transformers de SMILES pueden reutilizarse como features en tareas de propiedad molecular adyacentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona el uso de las metricas oficiales del reto y del validador oficial de submission, pero no incluye cifras numericas de rendimiento ni comparaciones cuantitativas con otras soluciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamano de los artefactos no se documenta en la informacion proporcionada.
- GPU recomendadas: no disponible. Para modelos de grafos moleculares de este tipo, una GPU consumer moderna suele ser suficiente en inferencia por lotes, pero no hay datos publicados que lo confirmen para este artefacto concreto.
- Compatibilidad con GPU consumer: no confirmada por falta de especificaciones de parametros y formato de pesos.
- Opciones de despliegue: no disponible. El stack implicito es Python con Chemprop y LightGBM, pero no se documenta un formato de servicio ni un runtime de inferencia estandar.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Enfoque | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyp2026-model-report | Ensamblado de grafos + transformers de SMILES + LightGBM | Prediccion CYP (inhibicion directa y TDI) | No aplica | Apache 2.0 | Hugging Face, sin descargas ni likes |
| Chemprop (referencia original) | D-MPNN | Propiedades moleculares generales | No aplica | MIT (repositorio original) | Codigo abierto en GitHub |
| Modelos ADMET comerciales | Cajas negras | Prediccion ADMET multi-endpoint | No aplica | Propietaria | Servicios de pago |
| Transformers de SMILES preentrenados (familia quimica) | Transformer sobre secuencias | Representacion molecular y downstream | Depende del modelo base | Variable | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas alternativas en la informacion proporcionada, por lo que la comparativa se limita a tipo de enfoque, licencia y disponibilidad.

## Limitaciones y advertencias

- El repositorio se presenta como un informe de modelo, no como un paquete de pesos listo para inferencia; no hay garantia de que los artefactos completos esten publicados.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso externo ni de replicacion independiente de los resultados.
- No se publican cifras de rendimiento ni comparaciones con el estado del arte, por lo que la calidad predictiva no es verificable a partir de la informacion disponible.
- El dominio de aplicacion es estrecho: isoformas CYP y tareas ADMET concretas; extrapolar a otros endpoints requiere reentrenamiento.
- Riesgo de sesgo por los conjuntos publicos de entrenamiento: la cobertura quimica de los datos publicos de potencia CYP puede no representar espacios quimicos industriales o de quimica medicinal reciente.
- La validacion agrupada por clusters mitiga pero no elimina el riesgo de fuga estructural si las familias del conjunto ciego difieren de las de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre idoneidad para decisiones regulatorias o clinicas.
- No debe usarse como sustituto de ensayos experimentales en decisiones de desarrollo de farmacos sin validacion prospectiva.
- No es un modelo de lenguaje: no admite prompts en lenguaje natural, tool calling ni generacion de texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/zhangzhan394340606/cyp2026-model-report
- OpenADMET CYP Challenge 2026: no disponible en la informacion proporcionada
- Repositorio de Chemprop: no disponible en la informacion proporcionada
- Documentacion de LightGBM: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
