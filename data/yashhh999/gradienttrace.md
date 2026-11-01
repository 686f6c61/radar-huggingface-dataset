# Yashhh999/gradientTrace

## Resumen

gradientTrace es un clasificador binario de texto generado por IA construido sobre el backbone `microsoft/deberta-v3-large`. Lo publica el usuario Yashhh999 en HuggingFace y su proposito es estimar la probabilidad de que un fragmento de texto haya sido producido por un modelo de lenguaje. La arquitectura subyacente es un transformer encoder DeBERTa-v3-large con 434.013.185 parametros totales, reutilizado como cabecera de clasificacion de secuencias.

El modelo se entrena sobre pares prompt-texto emparejados (texto humano y texto de modelo para el mismo prompt), con aumento de datos mediante "humanizacion" de texto y particiones disjuntas por generador, de modo que el conjunto de evaluacion out-of-distribution no comparte generadores con el de entrenamiento. La model card reporta metricas muy altas en sus propias particiones held-out, con AUROC cercano a 1.0 y TPR a 1 % de FPR en torno a 0.999-1.000.

Es relevante porque aborda uno de los problemas practicos mas dificiles de la deteccion de texto IA: la generalizacion a generadores no vistos y el texto parafraseado o humanizado. Aun asi, el propio autor advierte que las puntuaciones son evidencia, no prueba, y que el texto maquina humanizado es el modo de fallo conocido. El modelo esta pensado para pasajes de hasta 512 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large) con cabecera de clasificacion binaria |
| Parametros totales | 434.013.185 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/deberta-v3-large`, un transformer encoder con atencion desacoplada y embeddings de posicion relativos, y anade una cabeza de clasificacion para una tarea binaria: texto humano frente a texto generado por maquina. Con 434 millones de parametros, se situa en el rango de los encoders grandes orientados a clasificacion y no genera texto: solo produce una puntuacion de probabilidad.

El entrenamiento se realizo en una Tesla T4 con precision fp16 y batch efectivo de 64. Los datos consisten en pares prompt-texto donde para cada prompt existe una respuesta humana y una respuesta de modelo, complementados con aumento de texto humanizado. Las particiones de evaluacion son disjuntas por generador (`test_ood_generators`), lo que permite medir la generalizacion a modelos no vistos durante el entrenamiento. La configuracion completa se documenta en `config.json` y en el repositorio gradientTrace. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset, aunque se referencia un `data_manifest.json`.

## Capacidades

- Clasificacion binaria de texto: estima P(texto generado por maquina) para pasajes de hasta 512 tokens.
- Deteccion de texto IA con backbone DeBERTa-v3-large afinado.
- Evaluacion out-of-distribution sobre generadores no vistos durante el entrenamiento.
- Robustez parcial frente a texto humanizado gracias al aumento de datos con humanizacion.
- Integracion con la libreria transformers y con text-embeddings-inference segun los tags del repositorio.
- Compatibilidad declarada con endpoints (`endpoints_compatible`).
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en plataformas: puntuar publicaciones o comentarios para priorizar revision humana cuando la probabilidad de texto IA sea alta, usando el score como senal adicional y nunca como decision automatica.
- Filtrado de datos para entrenamiento: descartar o marcar muestras sinteticas en pipelines de curacion de datasets, ya que el modelo opera sobre pasajes de hasta 512 tokens y permite clasificar a escala.
- Analisis de resenas y opiniones: detectar resenas generadas masivamente en marketplaces o plataformas de opiniones, combinando la puntuacion con heuristicas de comportamiento de la cuenta.
- Investigacion sobre deteccion de texto IA: usar el modelo como baseline con particiones disjuntas por generador para comparar con otros detectores en condiciones OOD.
- Verificacion editorial asistida: senalar articulos o envios sospechosos para que un editor humano revise, dado que el autor advierte explicitamente contra el uso como unica base en integridad academica.
- Pipeline de anonimizacion y calidad documental: clasificar lotes de documentos en la fase de ingesta para separar contenido presumiblemente humano de contenido sintetico antes de procesos posteriores.
- Evaluacion de robustez de generadores: medir la tasa de deteccion de un generador concreto frente a este detector como parte de la validacion de un sistema de generacion.

## Benchmarks y rendimiento

| Particion | n | AUROC | TPR @ 1 % FPR |
|---|---|---|---|
| val | 15216 | 1.0000 | 0.999 |
| test_indomain | 15181 | 0.9999 | 1.000 |
| test_ood_generators | 16000 | 1.0000 | 1.000 |

No se han publicado en la informacion disponible comparaciones con otros detectores ni resultados en benchmarks estandar de clasificacion (MMLU, HumanEval, GSM8K no aplican a esta tarea).

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,9 GB solo para pesos (434 M de parametros), mas overhead de activaciones y del tokenizador; en la practica, alrededor de 1,5-2,5 GB por instancia segun longitud de secuencia y batch.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; A100, H100, L4 o RTX 4090 ofrecen margen amplio y buen throughput en batching.
- Cabe en GPU de consumo: si, en RTX 3060, RTX 4060, RTX 4090 y similares; tambien es viable en CPU para volumenes moderados.
- Opciones de despliegue: transformers con `AutoModelForSequenceClassification`, text-embeddings-inference segun los tags, y servidores de inferencia compatibles con endpoints; no se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento se realizo en Tesla T4 con fp16, lo que sugiere que la inferencia en fp16 es el modo previsto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gradientTrace | 434 M | 512 tokens | Deteccion binaria de texto IA | no disponible | HuggingFace (263 descargas) |
| microsoft/deberta-v3-large | 435 M aprox. | 512 tokens | Encoder base, multiple tareas NLU | MIT | HuggingFace |
| Detectores de texto IA comerciales | no disponible | variable | Deteccion de texto IA | propietaria | APIs de pago |

No se dispone en la informacion proporcionada de resultados comparativos con otros detectores open source de texto IA; la comparativa con alternativas de la misma tarea queda como no disponible.

## Limitaciones y advertencias

- Las puntuaciones son evidencia, no prueba: se producen falsos positivos en escritura humana atipica.
- El modo de fallo conocido es el texto maquina parafraseado o humanizado, que puede evadir la deteccion.
- El autor desaconseja explicitamente su uso como unica base para decisiones de integridad academica o moderacion.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor.
- Idiomas soportados no disponibles: no hay garantia de rendimiento fuera del idioma o idiomas de entrenamiento.
- Limitado a pasajes de hasta 512 tokens; textos mas largos requieren troceado y agregacion de scores.
- Las metricas reportadas proceden de particiones propias del autor; no hay validacion independiente publicada.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de calibracion: scores extremos no equivalen a certeza.
- El repositorio ocupa 96,6 GB, muy por encima del tamano de los pesos, lo que puede indicar artefactos de entrenamiento o datos adicionales; conviene revisar antes de descargar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yashhh999/gradientTrace
- Modelo base: https://huggingface.co/microsoft/deberta-v3-large
- Repositorio gradientTrace: no disponible como URL en la informacion proporcionada (se referencia en la model card)
- Informe de evaluacion `eval_report.json`: incluido en el repositorio del modelo
- Manifiesto de datos `data_manifest.json`: incluido en el repositorio del modelo
