# vedshah30/Oracle-2-Lite_ELAsTiCC

## Resumen

ORACLE-2 Lite es un clasificador fotométrico jerárquico en tiempo real desarrollado por Ved Shah para la clasificación de transitorios astronómicos en flujos de alertas de encuestas como ZTF (Bright Transient Survey) y LSST (ELAsTiCC). El modelo forma parte de la colección Oracle y está diseñado para asignar probabilidades condicionales a una taxonomía jerárquica, permitiendo decisiones de alto nivel (por ejemplo, "transitorio vs variable") incluso cuando la clasificación de hoja es incierta. Su variante Lite procesa exclusivamente series temporales de cinco dimensiones (flujo, error de flujo, longitud de onda, MJD desde la primera detección y flag fotométrico) junto con la longitud de la serie, sin necesidad de metadatos estáticos ni imágenes.

La arquitectura se basa en una red Bi-GRU con 128 unidades por capa y dos capas, seguida de atención con pooling, normalización por capas, activación GELU, dropout y un MLP estático con conexión residual. El modelo produce un espacio latente de 16 dimensiones que se proyecta a logits jerárquicos organizados por grupos hermanos. Está entrenado con datos reales de alertas del ZTF BTS y simulaciones de ELAsTiCC2 para LSST, usando una pérdida de entropía cruzada jerárquica ponderada (WHXE). Aunque el repositorio en HuggingFace no contiene pesos (0.0 GB), el código y la documentación están disponibles públicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bi-GRU (128 unidades x 2 capas) + attention pooling + LayerNorm/GELU/Dropout(0.2) + MLP estatico + cabecera residual -> latente 16-d -> logits jerarquicos |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa series temporales de alertas, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de clasificacion astronomica, no de lenguaje) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repositorio no contiene pesos; solo metadata) |

## Arquitectura y entrenamiento

El modelo implementa la arquitectura `GRU_MD_Improved`, que combina una capa bidireccional de GRU con 128 unidades por capa y dos capas apiladas, seguida de un mecanismo de atención con pooling. Después se aplican normalización por capas, activación GELU y dropout con probabilidad 0.2. Una rama estática (MLP) se combina con la salida de la secuencia mediante una conexión residual que desemboca en un espacio latente de 16 dimensiones. Este espacio se proyecta a logits jerárquicos, donde cada grupo de nodos hermanos produce probabilidades condicionales. La probabilidad de clase por nodo se obtiene mediante `taxonomy.get_class_probabilities()`.

El entrenamiento utiliza una pérdida de entropía cruzada jerárquica ponderada (WHXE) sobre datos de dos fuentes: alertas reales del ZTF Bright Transient Survey (BTS) y simulaciones de ELAsTiCC2 para LSST. Las series temporales se truncan según `days_since_trigger`. La variante Lite no incorpora metadatos estáticos ni imágenes, lo que la hace más ligera y adecuada para entornos de baja latencia. La innovación principal es la salida jerárquica: el modelo puede tomar decisiones de alto nivel con alta confianza en el nivel 1 de la taxonomía (por ejemplo, "transitorio vs variable" o "persistente vs transitorio") incluso cuando la clasificación de hoja es incierta, lo que resulta crítico para el triage en tiempo real de flujos de alertas.

## Capacidades

- Clasificacion fotometrica en tiempo real de transitorios astronomicos a partir de series temporales de 5 dimensiones (flujo, error, longitud de onda, MJD desde la primera deteccion y flag fotometrico).
- Salidas jerarquicas con probabilidades condicionales por grupo de nodos hermanos, permitiendo decisiones tempranas de alto nivel (nivel 1) sin necesidad de clasificar la hoja con certeza.
- Soporte para la variante Lite (solo series temporales), Standard (anade metadatos estaticos) y Omni (anade imagenes de postage stamp), aunque este repositorio corresponde especificamente a Lite.
- Integracion con la API del modelo mediante `model.predict(table)` y `model.score(table)`, que devuelven un diccionario `{level: label}` con las predicciones por nivel jerarquico.
- Capacidad de operar desde la primera observacion (`1 observation onward`), gracias al truncamiento por `days_since_trigger` y al diseno de la arquitectura secuencial.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes, razonamiento simbolico ni capacidades multimodales de vision o audio (la variante Omni usa imagenes, pero este repositorio es Lite).

## Casos de uso

- Triage en tiempo real de alertas de ZTF y LSST: el modelo puede procesar alertas entrantes desde la primera observacion y asignar probabilidades jerarquicas, permitiendo a los sistemas de alertas priorizar candidatos de alto interes sin esperar a la clasificacion final.
- Filtrado de candidatos para seguimiento espectroscopico: al proporcionar decisiones de nivel 1 con alta confianza, el modelo permite descartar rapidamente variables persistentes o clasificar transitorios, reduciendo el coste de observaciones espectroscopicas.
- Clasificacion de supernovas en encuestas de gran volumen: con datos de simulaciones ELAsTiCC2 y alertas reales de BTS, el modelo puede discriminar tipos de supernovas dentro de la taxonomia jerarquica, util para catalogos de eventos transitorios.
- Deteccion temprana de transitorios en pipelines de alertas: la capacidad de operar desde la primera observacion permite generar alertas tempranas en sistemas de streaming, mejorando la rapidez de la respuesta cientifica.
- Astronomia de dominio abierto: al estar bajo licencia MIT y con codigo y documentacion publicos, puede integrarse en pipelines de investigacion o en proyectos educativos de clasificacion de objetos astronomicos.
- Investigacion en clasificacion jerarquica: el modelo sirve como referencia para estudiar arquitecturas de clasificacion con salidas condicionales por grupos hermanos y perdida ponderada, especialmente en dominios con taxonomias profundas y datos secuenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Capacidad para ejecutarse en GPU de consumo: no disponible oficialmente; por el diseno de la arquitectura (Bi-GRU de 128 unidades), se espera un consumo modesto, pero no hay cifras publicadas.
- Opciones de despliegue: el repositorio no incluye pesos ni instrucciones de despliegue; el codigo fuente esta disponible en GitHub y la documentacion en el sitio oficial, por lo que el despliegue depende de la implementacion del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se han encontrado modelos comparables en la informacion proporcionada. La coleccion Oracle incluye variantes Standard y Omni, pero no se dispone de especificaciones tecnicas detalladas para comparar.

## Limitaciones y advertencias

- No apto para clasificacion espectroscopica: el modelo solo utiliza datos fotometricos y no puede procesar espectros.
- No cubre clases de anomalias fuera de la taxonomia definida; los eventos que no encajen en la jerarquia pueden ser mal clasificados.
- El entrenamiento combina datos reales (ZTF BTS) y simulaciones (ELAsTiCC2), lo que puede introducir sesgos derivados de las diferencias entre ambos conjuntos.
- El repositorio en HuggingFace no contiene pesos (0.0 GB); para usar el modelo es necesario obtener los checkpoints a traves de la coleccion Oracle, el codigo en GitHub o la documentacion oficial.
- No hay informacion publicada sobre parametros totales, cuantizaciones ni requisitos de hardware, lo que dificulta la evaluacion de rendimiento y despliegue.
- Al ser un modelo secuencial, el rendimiento puede degradarse con series temporales truncadas o con datos de entrada que difieran de la distribucion de entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/vedshah30/Oracle-2-Lite_ELAsTiCC
- Coleccion Oracle: https://huggingface.co/collections/vedshah30/oracle
- Codigo: https://github.com/dev-ved30/Oracle
- Documentacion: https://dev-ved30.github.io/Oracle/
- Paper ORACLE-1: https://arxiv.org/abs/2501.01496
- Paper ORACLE-2: https://arxiv.org/abs/2607.00228
