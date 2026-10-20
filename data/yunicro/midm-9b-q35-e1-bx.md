# yunicro/MiDM-9B-q35-e1-bx

## Resumen

MiDM-9B-q35-e1-bx es un adaptador LoRA con una cabeza apuntadora (pointer head) lineal entrenada sobre el modelo base Qwen/Qwen3.5-9B-Base. No es un modelo generativo: recibe un estado (state) en texto y un conjunto de opciones definidas por el usuario, y devuelve una probabilidad por opción calculada en una única pasada forward. El autor lo publica bajo el nombre MiDM (decision model) y lo orienta a "decisiones tipadas": preguntas de elección (`choice`), de sí/no (`noul`) y ordinales (`score`).

El interés técnico está en el enfoque: en lugar de pedir al modelo que escriba una respuesta y parsearla, el sistema puntúa conjuntamente todas las alternativas con una cabeza entrenada, lo que reduce la variabilidad del formateo y permite comparar opciones de forma directa. Sobre el checkpoint de 9B, el autor reporta una mejora modesta frente a la versión de 4B en la suite propia de decisiones tipadas (79,30 % frente a 78,85 % sobre 2.000 ítems) y una mejora mayor en JevBench hard (54,05 % frente a 45,95 % sobre 111 ítems).

La relevancia actual es doble: por un lado, ejemplifica el patrón de "capa de decisión" acoplada a un LLM base con licencia Apache-2.0 y ejecución offline; por otro, la documentación publicada es inusualmente explícita sobre qué no funciona (regresiones en SQL y Python, benchmarks no medidos, resultados retrospectivos y no compuestos oficiales). La revisión v0.2.2 es solo documental: los pesos siguen siendo los de v0.2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-9B-Base) + adaptador LoRA + cabeza apuntadora lineal que puntúa opciones en una sola pasada forward |
| Parámetros totales | 9B en el modelo base; tamaño exacto del adaptador no disponible (repo de 0,2 GB) |
| Parámetros activos | No aplica (no se describe como MoE) |
| Longitud de contexto | 4.096 tokens de entrada configurados en inferencia; 1.024 tokens en entrenamiento; cada opción limitada a 192 tokens |
| Tipos de cuantización | NF4 (QLoRA en entrenamiento y por defecto en inferencia) y BF16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 para adaptador y código; el modelo base y los datos de entrenamiento conservan sus propios términos |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) más cargador Python propio incluido en el repositorio |
| Pipeline declarado | text-classification |
| Librería | peft |
| Descargas / likes | 118 / 0 |
| Fechas | Creado 2026-10-05; actualizado 2026-10-20 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B-Base y le añade un adaptador LoRA junto con una cabeza apuntadora lineal entrenada para puntuar opciones. La inferencia no genera texto: el cargador (`midm.py`) procesa el estado y las opciones juntas y devuelve probabilidades por opción. La configuración declarada de entrenamiento es QLoRA en NF4, rango 16, alpha 32, una época, semilla 0, tasa de aprendizaje 2e-4 y contexto de entrenamiento de 1.024 tokens, con los conjuntos `td_train`, `kev_train`, `breadth_v1` y `pp6_new`. No se publica el número total de tokens de entrenamiento ni la composición detallada del dataset, y el repositorio no incluye datos de entrenamiento.

El punto diferencial es el mecanismo de puntuación conjunta: en lugar de comparar log-probabilidades de secuencias generadas, la cabeza produce una puntuación por opción en una sola pasada, lo que hace el coste proporcional al número de opciones y no al número de tokens generados. Los estados largos se truncan conservando cabeza y cola del texto. El autor publica además análisis de arquitectura comparada en el atlas de benchmarks de v0.2.1, aunque los detalles internos de la cabeza no se especifican más allá de ser lineal.

## Capacidades

- Puntuación de decisiones de elección (`choice`): asigna probabilidad a cada opción definida por el usuario en el prompt.
- Decisiones binarias (`noul`, sí/no) con probabilidad asociada.
- Decisiones ordinales (`score`): puntuación de opciones ordenadas.
- Evaluación conjunta de todas las opciones en un único forward pass, con coste acotado por el número de alternativas.
- Truncado controlado de estados largos (hasta 4.096 tokens) preservando el inicio y el final del texto.
- Ejecución completamente offline una vez cacheados el paquete y el modelo base.
- No genera SQL, Python, explicaciones ni prosa de informe: esa función la cubre un modelo aparte (el autor indica que el redactor de informes sigue siendo Qwen3 8B).
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo "thinking".
- Soporte multilingüe: no disponible en la información publicada.

## Casos de uso

- Clasificación de acciones en flujos de atención al cliente: dado un estado ("el cliente no tiene recibo") y un conjunto cerrado de acciones (aprobar, revisar, escalar), el modelo devuelve la probabilidad de cada una, lo que permite fijar umbrales de derivación a un humano.
- Enrutado de decisiones en pipelines de back office: usar la distribución de probabilidad sobre opciones predefinidas para decidir el siguiente paso de un workflow, con la ventaja de que el espacio de salida es cerrado y validable por esquema.
- Validación y verificación en entornos de código: el autor reproduce el verificador DeepSWE con un 81,58 % (31/38) de aciertos, de modo que el modelo puede emplearse para elegir entre veredictos candidatos ya generados por otro sistema.
- Selección best-of-N en generación de código o SQL: puntuar varias salidas candidatas y escoger una; el autor documenta resultados mixtos (Spider 78,34 % → 77,27 %, retención SQL 81,66 % → 81,77 %), por lo que el caso de uso es viable pero requiere validación propia.
- Triaje ordinal en revisión documental: preguntas de tipo `score` permiten ordenar expedientes por prioridad o gravedad sin generar texto adicional.
- Evaluación de decisiones retrospectivas con fines de auditoría: el autor aplica el modelo a decisiones históricas del KOSPI (precisión de acción del 54,37 %) como ejercicio de validación, no como señal en vivo.
- Capa de decisión en sistemas con requisitos de privacidad: al poder ejecutarse offline sobre una GPU local, encaja en entornos donde no se puede enviar el estado a una API externa.

## Benchmarks y rendimiento

Evaluación primaria emparejada, NF4/BF16 sobre RTX 3090, entrada máxima 4.096, presupuesto de batch 4.096 tokens, TTA=1, mismos ítems y orden. Precisión de etiqueta dura retrospectiva, no puntuaciones compuestas oficiales de JevBench.

| Suite | N | MiDM 4B | MiDM 9B |
|---|---:|---:|---:|
| Typed Decisions test | 2.000 | 78,85 % | 79,30 % |
| Kev transfer test | 764 | 79,84 % | 82,59 % |
| JevBench original | 72 | 91,67 % | 97,22 % |
| JevBench easy | 48 | 100,00 % | 100,00 % |
| JevBench hard | 111 | 45,95 % | 54,05 % |

Otras mediciones publicadas:

| Prueba | Resultado |
|---|---|
| Reproducción del verificador DeepSWE (CLM) | 31/38 (81,58 %); p unilateral exacto = 0,062 en las 13 tareas de resultado mixto |
| Precisión de acción del baseline MiDM (validación financiera v0.2.2) | 54,37 % |
| Routing aprendido, JevBench público (231) | 77,06 % MiDM, 79,65 % router, 81,82 % Qwen3-4B con razonamiento solo |
| SQL best-of-N, Spider | 78,34 % (4B) → 77,27 % (9B) |
| SQL holdout | 81,66 % (4B) → 81,77 % (9B) |
| Python hard80 | 28,75 % (4B) → 25,00 % (9B) |

No hay mediciones de MiDM en DeepSWE ni en Terminal-Bench local: el autor indica explícitamente que no se encontraron los artefactos de evaluación correspondientes y que no sustituye la métrica por ninguna puntuación oficial.

## Requisitos de hardware

- VRAM estimada: el autor valida la inferencia en NF4 sobre una RTX 3090 (24 GB), configuración que deja margen holgado. Como referencia aritmética a partir del tamaño (no publicada por el autor), un modelo de 9B en NF4 ocupa del orden de 5-6 GB de pesos, y en BF16 del orden de 18 GB, antes de activaciones y caché.
- GPU recomendadas: RTX 3090 es la única configuración verificada y documentada. Cualquier GPU NVIDIA compatible con las dependencias listadas debería funcionar; no se detallan otras.
- Cabe en GPU de consumo: sí, en el caso verificado de RTX 3090 con NF4. No hay certificación de memoria mínima ni pruebas de resistencia.
- Opciones de despliegue: cargador propio del repositorio (`midm.py`, `MiDM.from_pretrained(".")`), con `requirements.txt`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; la presencia de una cabeza apuntadora adicional hace que las pilas de serving estándar no sean aplicables sin trabajo adicional. El ejemplo de uso lanza el proceso desde el directorio del repositorio en la revisión `v0.2.0`.
- Throughput: en pruebas piloto sintéticas de una sola ejecución, dos procesos 4B con entradas cortas casi duplicaron el rendimiento; con 2.048 tokens (4B) y 4.096 tokens (9B) el rendimiento cayó. No son pruebas de resistencia ni certificaciones de memoria.
- Latencia: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiDM-9B-q35-e1-bx (este) | 9B (base) + LoRA | 4.096 tokens | Typed Decisions 79,30 %; JevBench hard 54,05 %; DeepSWE 81,58 % | Apache-2.0 (adaptador y código) | HuggingFace, 118 descargas |
| MiDM 4B (release original del mismo autor) | 4B | No disponible en detalle | Typed Decisions 78,85 %; Kev 79,84 %; JevBench hard 45,95 %; Python hard80 28,75 % | Apache-2.0 | Disponible según el autor |
| Qwen3-4B con razonamiento solo | 4B | No disponible | 81,82 % en JevBench público (231), superior al router de 79,65 % | No disponible en la información | Uso local citado por el autor |
| Qwen3.5-9B-Base (modelo base sin adaptar) | 9B | No disponible | Sin medición publicada en esta información para estas suites | Términos propios del modelo base | HuggingFace |
| Verificador DeepSWE de CLM (referencia) | No disponible | No disponible | Reproducido al 81,58 % por MiDM 9B | No disponible | Artefactos de replay citados |

La comparación directa más informativa es la del propio autor: el salto de 4B a 9B aporta entre +0,45 y +8,1 puntos según la suite, mientras que un Qwen3-4B con razonamiento supera al enrutador aprendido en JevBench público, lo que sugiere que la ventaja del enfoque no es uniforme.

## Limitaciones y advertencias

- El modelo no genera texto: solo puntúa opciones proporcionadas. No sirve como sustituto de un LLM conversacional ni para producir SQL, Python o informes.
- Las probabilidades devueltas no están garantizadas como calibradas; el autor lo advierte explícitamente. No deben usarse como intervalos de confianza sin calibración propia.
- Resultados retrospectivos: las cifras de JevBench son precisiones de etiqueta dura sobre conjuntos públicos, no las puntuaciones compuestas oficiales (full/sealed). La validación financiera se basa en decisiones históricas del KOSPI, no en señales en vivo.
- El holdout de 600 preguntas de Typed Decisions es una partición de desarrollo y selección de modelo, no el test público de 2.000.
- Regresiones documentadas al pasar de 4B a 9B en tareas de código: Spider baja de 78,34 % a 77,27 % y Python hard80 de 28,75 % a 25,00 %. El autor no promueve el enrutador aprendido ni reclama superioridad.
- La mejora en DeepSWE no alcanza significación estadística al 5 % (p = 0,062) en las 13 tareas de resultado mixto.
- Sin datos sobre sesgos, composición del dataset de entrenamiento ni evaluación multilingüe; el repositorio no incluye datos de entrenamiento, preguntas, respuestas, informes ni credenciales.
- La licencia Apache-2.0 cubre el adaptador y el código, pero el modelo base y los datasets conservan sus propios términos: es necesario revisarlos antes de un uso comercial.
- La revisión v0.2.2 es únicamente documental; no hay checkpoint financiero mejorado publicado, y los pesos siguen siendo v0.2.0.
- Requiere GPU NVIDIA compatible; no hay ruta de despliegue documentada para CPU ni para servidores de inferencia estándar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx
- Revisión de pesos v0.2.0: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx/tree/v0.2.0
- Repositorio de código: https://github.com/YeoHoonYun/midm-decision-models
- Release v0.2.0 (código y evidencia completa): https://github.com/YeoHoonYun/midm-decision-models/releases/tag/v0.2.0
- Release v0.2.1 (análisis de benchmarks y arquitectura): https://github.com/YeoHoonYun/midm-decision-models/releases/tag/v0.2.1
- Atlas de benchmarks v0.2.1: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx/blob/main/benchmarks/v0.2.1/README.md
- Notas de validación financiera v0.2.2: https://huggingface.co/yunicro/MiDM-9B-q35-e1-bx/blob/main/financial_validation/v0.2.2/README.md
- Informe ScenarioView: https://yeohoonyun.github.io/midm-decision-models/
- DOI de concepto (Zenodo): https://doi.org/10.5281/zenodo.23084583
- DOI de versión v0.2.1: https://doi.org/10.5281/zenodo.23164651
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
