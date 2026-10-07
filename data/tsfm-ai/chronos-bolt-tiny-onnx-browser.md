# TSFM-ai/chronos-bolt-tiny-onnx-browser

## Resumen

Este artefacto es una exportación a ONNX del modelo de predicción de series temporales `amazon/chronos-bolt-tiny`, publicada por el usuario TSFM-ai con el objetivo de ejecutarlo íntegramente en el navegador. No se trata de un modelo nuevo ni de un reentrenamiento: los pesos y la arquitectura son de Amazon, y TSFM se limita a convertir el grafo completo (encoder y decoder) a un formato ONNX apto para ONNX Runtime Web compilado a WASM. La inferencia ocurre en la CPU del visitante, sin necesidad de un servidor de inferencia.

El contrato de la interfaz es fijo y muy acotado. La entrada es un tensor `context` de tipo float32 con forma `[1, 512]` que representa una única serie univariante; si la historia es más corta debe rellenarse por la izquierda con NaN, y los huecos en las observaciones también pueden codificarse como NaN. La salida es `quantile_preds`, float32 con forma `[1, 9, 64]`, que contiene nueve cuantiles (de 0,1 a 0,9 en orden ascendente) para un horizonte máximo de 64 pasos; la mediana ocupa el índice 4 y los valores ya vienen en la escala original de la serie. No admite covariables ni controles de muestreo.

Su relevancia reside en que traslada un modelo de forecasting probabilístico al cliente, sin backend. La validación reportada por el autor compara la salida CPU de ONNX con la implementación PyTorch original en siete casos sintéticos (tendencia/estacionalidad, constante, cero, negativo, aleatorio, historia corta e historia con valores ausentes), con un error absoluto máximo de 0,000031, y una ejecución real en Chrome/WASM difirió como mucho 0,000046. Son comprobaciones numéricas locales, no garantías de compatibilidad amplia de dispositivos ni de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder para forecasting; exportacion del grafo completo del modelo base Chronos-Bolt de Amazon (no se detalla la arquitectura interna en la model card de este export) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 pasos fijos (una serie univariante) |
| Tipos de cuantizacion | no disponible (el artefacto declara entradas y salidas float32; la etiqueta `base_model:quantized` del repo no especifica un esquema concreto) |
| Idiomas soportados | no disponible / no aplica (modelo numerico de series temporales, sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |
| Horizonte de prediccion | hasta 64 pasos |
| Salida | 9 cuantiles (0,1 a 0,9) x 64 pasos, escala original |
| Libreria / runtime | ONNX Runtime Web (WASM) en CPU del navegador |

## Arquitectura y entrenamiento

El artefacto es una exportacion del modelo `amazon/chronos-bolt-tiny`, revision `a0e552de83495b5c28c14c71c374f3e33280b340`. La model card indica que se incluyen el encoder y el decoder completos, y que se trata de un grafo de forecast y no de un proxy de embeddings ni de un sustituto estadistico. No se aporta informacion sobre el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens de series temporales ni el uso de tecnicas de alineacion como RLHF o DPO; esos datos corresponden al modelo base original de Amazon y no se reproducen aqui.

El trabajo tecnico de este export consiste en ajustes de compatibilidad con ONNX: se sustituye `nanmean` (no soportado) por reducciones enmascaradas equivalentes, se reemplaza `unfold` no solapado por `reshape` y se fuerzan indices enteros en el embedding. El grafo resultante tiene un contexto fijo de 512 pasos. Las herramientas de reproduccion son Python 3.12, `chronos-forecasting` 2.3.0, `torch` 2.8.0, `transformers` 4.57.1, ONNX y `onnxruntime`; el script de exportacion es `export.py`.

## Capacidades

- Prediccion probabilistica de series temporales univariantes: produce 9 cuantiles (0,1 a 0,9) por paso, lo que permite intervalos de prediccion y no solo un valor puntual.
- Horizonte de hasta 64 pasos por inferencia, con salida directa en la escala original de la serie.
- Manejo de historias incompletas: longitudes menores de 512 se rellenan por la izquierda con NaN, y las observaciones ausentes dentro de la serie pueden codificarse tambien como NaN.
- Ejecucion en el navegador del cliente mediante ONNX Runtime Web WASM, sin servidor de inferencia.
- No soporta covariables exogenas.
- No expone controles de muestreo ni decodificacion estocastica en este artefacto.
- No ofrece tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, de vision, audio ni modo de "thinking".

## Casos de uso

- Prevision de demanda en el navegador: un panel web puede cargar el artefacto ONNX y calcular la demanda esperada de los proximos 64 periodos a partir de las ultimas 512 observaciones, sin enviar datos historicos a un servidor, lo que simplifica el cumplimiento de privacidad.
- Analisis de series financieras en herramientas internas: al correr en la CPU del usuario, permite generar bandas de cuantiles sobre precios o volumenes localmente, sin depender de un endpoint de inferencia compartido.
- Monitorizacion de metricas de infraestructura en un dashboard: el modelo puede proyectar metricas de CPU, latencia o trafico para anticipar saturaciones, aprovechando que la ventana de 512 puntos cubre patrones estacionales de granularidad horaria o diaria.
- Prediccion de sensores IoT desde una interfaz web: la tolerancia a NaN permite operar con lecturas intermitentes de dispositivos, rellenando huecos de historia corta y generando intervalos en lugar de un unico valor.
- Aplicaciones educativas y demos interactivas: al ser un export pequeno y ejecutable en WASM, es adecuado para cuadernos o paginas de ejemplo que muestren forecasting probabilistico sin coste de infraestructura.
- Validacion de pipelines de datos antes del despliegue en produccion: sirve como referencia local para comprobar que una serie preprocesada, con su ventana de 512 y su tratamiento de NaN, produce cuantiles coherentes.
- Prototipado de funcionalidades offline-first: aplicaciones de escritorio o PWA que deben seguir funcionando sin red pueden incorporar este artefacto para generar previsiones locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica medida numerica reportada es la fidelidad numerica del export frente al modelo PyTorch original:

| Comprobacion | Error absoluto maximo |
|---|---|
| ONNX en CPU vs PyTorch, 7 casos sinteticos (tendencia/estacionalidad, constante, cero, negativo, aleatorio, historia corta, historia con ausentes) | 0,000031 |
| Una ejecucion real en Chrome con WASM | 0,000046 |

El propio autor advierte que estas cifras son comprobaciones numericas locales y no garantizan compatibilidad amplia de dispositivos ni rendimiento.

## Requisitos de hardware

- VRAM estimada: no disponible como cifra concreta; el artefacto esta disenado para ejecutarse en CPU, por lo que requiere 0 GB de VRAM dedicada en su flujo previsto.
- GPU recomendadas: no aplica para el caso de uso principal (WASM en CPU). No se documentan requisitos de GPU.
- Compatibilidad con GPU de consumo: no aplica al flujo de navegador; el modelo es de variante "tiny", por lo que en un entorno escritorio convencional seria muy ligero, pero no se aportan cifras de memoria.
- Opciones de despliegue: ONNX Runtime Web (WASM) en el navegador del visitante, incluyendo dispositivos moviles. Para entornos de servidor podria usarse `onnxruntime`, aunque no es el proposito declarado del artefacto.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de tiempo de inferencia ni de series procesadas por segundo.

## Comparativa con modelos similares

| Modelo | Formato | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TSFM-ai/chronos-bolt-tiny-onnx-browser | ONNX (WASM en navegador) | 512 pasos fijos | 9 cuantiles x 64 pasos | Apache 2.0 | HuggingFace, export de terceros |
| amazon/chronos-bolt-tiny (modelo base) | PyTorch (pesos originales) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Apache 2.0 | HuggingFace, autor original |
| Otras variantes de la familia Chronos-Bolt (mini, small, base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

La comparacion mas directa y verificable es con el propio modelo base: este artefacto comparte pesos y arquitectura con `amazon/chronos-bolt-tiny` y solo difiere en el formato de serializacion (ONNX) y en el objetivo de ejecucion (navegador). No se dispone de datos de rendimiento de modelos alternativos dentro de la informacion proporcionada, por lo que no se puede establecer una comparacion cuantitativa de calidad de prevision.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada. Al ser un modelo numerico de series temporales, su comportamiento depende del dominio de datos con el que se entreno el modelo base de Amazon, no documentado en esta model card.
- Riesgo de alucinacion: no aplica en el sentido de texto generado, pero existe riesgo de extrapolaciones poco fiables fuera del horizonte de 64 pasos o ante regimenes no representados en el historico.
- Limitaciones de contexto: la ventana esta fijada en 512 pasos y no es configurable en este export; series mas largas deben recortarse a los ultimos 512 valores. El horizonte maximo es de 64 pasos.
- Limitaciones de interfaz: no admite covariables exogenas ni controles de muestreo, lo que restringe los escenarios donde otras variables explican la serie objetivo.
- Dependencia de la calidad del export: la fidelidad reportada (errores del orden de 3e-5 a 5e-5) corresponde a comprobaciones sinteticas y a una unica ejecucion en Chrome; no hay garantia de comportamiento identico en todos los navegadores o versiones de WASM.
- Restricciones de licencia: el artefacto declara Apache 2.0, igual que el modelo base. Debe verificarse el cumplimiento de las condiciones del proyecto de origen `amazon-science/chronos-forecasting` para uso comercial.
- Mantenimiento: el repositorio figura con 0 descargas y 0 valoraciones, creado y actualizado el mismo dia (6 de octubre de 2026). No hay senales de mantenimiento continuado ni de soporte por parte del autor.
- Advertencia sobre la busqueda web: los resultados recuperados en la busqueda no guardan ninguna relacion con el modelo ni con series temporales, por lo que se han descartado integramente y no se han usado como fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TSFM-ai/chronos-bolt-tiny-onnx-browser
- Modelo base: https://huggingface.co/amazon/chronos-bolt-tiny
- Repositorio de origen: https://github.com/amazon-science/chronos-forecasting
- Script de exportacion: `export.py` (referenciado en la model card, alojado en el repositorio del autor)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
- Enlaces de la busqueda web: ninguno relevante (los resultados obtenidos no estan relacionados con el modelo)
