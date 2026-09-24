# ThakiCloud/kd-4b-ko-v0

## Resumen

kd-4b-ko-v0 es un conjunto de adaptadores LoRA publicados por ThakiCloud sobre el modelo base Qwen/Qwen3.5-4B-Base. No es un modelo generativo convencional: implementa el formato denominado Kev typed-decision, un esquema de decisión tipada en el que el modelo recibe un estado textual y responde a preguntas de tres tipos (`choice`, `noul` y `score`) mediante una lectura de probabilidad no autorregresiva, es decir, sin generar texto token a token.

El repositorio distribuye únicamente pesos: adaptadores LoRA de rango 16 más un cabezal tipo pointer (pointer-head). No se publican datos de entrenamiento ni de evaluación. Los adaptadores se entrenaron a partir de una reproducción de la receta Kev-4B sobre Qwen3.5-4B-Base (Apache-2.0), usando datos de decisión tipada en coreano construidos con benchmarks públicos coreanos (KoBEST, KLUE), un pequeño conjunto sintético de políticas de ThakiCloud y varios conjuntos del sector público coreano publicados por AI Hub (documentos administrativos, financieros, jurídicos y normativos).

Su interés es doble. Por un lado, explora una vía poco frecuente —decisión tipada con lectura de probabilidad no autorregresiva— frente a los modelos generativos estándar. Por otro, acompaña la publicación con un protocolo de evaluación sellado y verificable (realdoc_v2) con consenso de anotación ciego y veto adversarial. El adaptador recomendado, kotdaihubv2num2-s1, no ha sido promovido formalmente a predeterminado: la promoción está en pausa a la espera de superar la puerta preregistrada, que exige además evidencia fuera de distribución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA r16 más cabezal pointer (pointer-head) sobre Qwen/Qwen3.5-4B-Base; esquema Kev typed-decision con lectura de probabilidad no autorregresiva. Arquitectura interna del modelo base: no disponible |
| Parámetros totales | No disponible. Adaptadores LoRA r16 sobre un modelo base de 4B; tamaño del repositorio 1,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (los pesos se distribuyen en safetensors sin cuantizar) |
| Idiomas soportados | Coreano (ko) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

La contribución del repositorio no es un transformer completo, sino un conjunto de adaptadores PEFT. Sobre Qwen/Qwen3.5-4B-Base se añaden adaptadores LoRA de rango 16 y un cabezal de tipo pointer que emite una distribución de probabilidad sobre las opciones disponibles en cada pregunta. La inferencia es no autorregresiva: el modelo no redacta una respuesta, sino que lee directamente la probabilidad asociada a cada opción de un estado textual dado. Las preguntas se clasifican en tres tipos: `choice` (elección entre alternativas), `noul` (sin rango o sin opción válida) y `score` (puntuación sobre una escala de niveles, con un límite de 10 niveles en el contrato de API descrito).

Los datos de entrenamiento combinan benchmarks públicos coreanos (KoBEST y KLUE, con licencia CC-BY-SA-4.0, usados solo para entrenamiento y no redistribuidos), un conjunto sintético reducido de políticas de ThakiCloud y, para los adaptadores de la familia `aihub-*` y `kotdaihub-*`, cuatro conjuntos del sector público coreano de AI Hub: documentos administrativos para machine reading comprehension (569), documentos financieros y jurídicos (71610), análisis de texto jurídico y normativo avanzado (71723) y análisis de texto de resoluciones judiciales y condiciones generales (580). Los datos de AI Hub se utilizaron únicamente bajo su política de uso y no se redistribuyen, ni ellos ni texto derivado.

Como referencia de proceso, el punto de partida (`init`) es la receta Kev-4B reproducida sobre Qwen3.5-4B-Base solo con suites en inglés; el resto de brazos son ajustes incrementales desde ahí con learning rate 2e-5, batch 4 con acumulación 2, 2 épocas y semilla 1. No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Decisión tipada sobre un estado textual: responde preguntas de tipo `choice`, `noul` y `score` mediante lectura de probabilidad, sin generación autorregresiva.
- Clasificación y puntuación con calibración cuantificada: las evaluaciones internas reportan ECE (expected calibration error) por brazo, lo que permite ajustar umbrales de confianza en producción.
- Comprensión lectora sobre documentos administrativos, financieros y jurídicos coreanos (machine reading comprehension).
- Análisis de texto normativo: extracción de decisiones sobre fragmentos de estatutos, resoluciones judiciales y condiciones generales.
- Multilingüe limitado: coreano e inglés declarados en la model card; las evaluaciones internas se centran en coreano.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta modo thinking, visión ni audio.
- Es un adaptador: requiere cargar el modelo base Qwen/Qwen3.5-4B-Base para funcionar.

## Casos de uso

- Revisión documental jurídica en coreano: el modelo está entrenado explícitamente sobre fragmentos literales de estatutos, resoluciones y condiciones generales, y responde con una decisión tipada en lugar de texto libre, lo que facilita insertar la salida en un flujo de validación automática.
- Triaje de expedientes administrativos: con los conjuntos de documentos administrativos usados en el entrenamiento, permite clasificar y puntuar casos en un punto de entrada antes de derivarlos a revisión humana.
- Cumplimiento normativo en banca y seguros: los conjuntos financieros y jurídicos del entrenamiento cubren este dominio; el modelo puede marcar si un contrato o cláusula encaja en una categoría predefinida mediante preguntas de tipo `choice`.
- Puntuación de riesgo o severidad calibrada: las preguntas de tipo `score` producen una puntuación numérica con ECE medido, útil para priorizar colas de trabajo cuando se necesita un umbral de confianza explícito.
- Anotación asistida y preetiquetado: al devolver probabilidades en lugar de texto, encaja bien como primera pasada de anotación en pipelines de etiquetado humano, dejando la decisión final al revisor.
- Filtrado de contenido normativo en buscadores internos: puede decidir si un fragmento recuperado responde o no a una consulta regulatoria concreta, reduciendo falsos positivos antes de la generación final.
- Evaluación comparativa de proveedores: el repositorio incluye brazos de comparación (Jev, laya, qwen27b) sobre las mismas preguntas, por lo que sirve como banco de pruebas para medir alternativas sobre el mismo conjunto sellado.

## Benchmarks y rendimiento

Datos de evaluación internos, revisados automáticamente. Una pregunta equivale aproximadamente a 1,75 pp en `realdoc_v1` y a 0,31 pp en el conjunto sellado `realdoc_v2`. Valores de exactitud (acc) y error de calibración (ECE):

| Brazo | aihub_dev acc / ECE | ko_reviewed acc / ECE | kotd_dev acc / ECE | realdoc_v1 consenso | realdoc_v2 consenso | transfer_v4 acc / ECE |
|---|---|---|---|---|---|---|
| init (base) | 0,807 / 0,134 | 0,847 / 0,082 | 0,733 / 0,141 | 0,911 | 0,801 | no disponible |
| kotd-s1 | no disponible | 0,839 / 0,103 | 0,880 / 0,071 | 0,946 | 0,835 | 0,814 / 0,119 |
| kotdsyn-s1 | no disponible | 0,935 / 0,049 | 0,878 / 0,081 | 0,946 | no disponible | 0,805 / 0,141 |
| aihubv2-s1 | 0,955 / 0,033 | 0,815 / 0,116 | 0,741 / 0,188 | 0,911 | no disponible | 0,812 / 0,126 |
| kotdaihubv2-s1 | 0,960 / 0,029 | 0,831 / 0,108 | 0,873 / 0,091 | 0,946 | no disponible | 0,812 / 0,140 |
| kotdaihubv2num-s1 | 0,959 / 0,028 | 0,839 / 0,135 | 0,879 / 0,087 | 0,982 | 0,913 | 0,808 / 0,139 |
| kotdaihubv2num2-s1 (recomendado) | 0,958 / 0,034 | 0,806 / 0,151 | 0,877 / 0,085 | 0,966 | 0,929 | 0,806 / 0,138 |
| jev (externo, TypeSafe AI) | no disponible | 0,933 | 0,818 | 0,974 | no disponible | no disponible |
| laya (externo, mmBERT-base 322M) | no disponible | 0,476 | 0,460 | 0,375 | no disponible | no disponible |
| qwen27b (interno, Qwen3.8-27B NVFP4) | no disponible | 0,871 | 0,895 | 0,804 | no disponible | no disponible |

Deltas e intervalos de confianza:

| Brazo | realdoc_v1 delta vs init, IC95 (pp) | realdoc_v2 delta vs init, IC95 (pp) | numeric_dev acc / ECE |
|---|---|---|---|
| kotd-s1 | +3,57 [0,00, 9,09] | +3,42 [0,62, 6,29] | no disponible |
| kotdsyn-s1 | +3,57 [0,00, 9,09] | no disponible | no disponible |
| aihubv2-s1 | 0,00 [-9,09, 7,55] | no disponible | no disponible |
| kotdaihubv2-s1 | +3,57 [-3,45, 11,11] | no disponible | no disponible |
| kotdaihubv2num-s1 | +7,14 [1,69, 14,81] | +11,18 [7,67, 14,87] | 0,470 / 0,371 (entrada: 0,999 / 0,001) |
| kotdaihubv2num2-s1 | no disponible | +12,73 [9,15, 16,46] | 0,801 / 0,134 |

Aclaraciones metodológicas recogidas en la model card:

- El conjunto sellado `realdoc_v2` consta de 115 extractos literales de estatutos coreanos procedentes de 76 normas y 25 dominios, con 345 preguntas y 322 puntuadas, etiquetadas a ciegas por tres familias de modelos (Claude, GPT y Qwen interno) con veto adversarial. Cada documento se verificó literalmente contra una página obtenida de forma independiente y contra el conjunto de entrenamiento (solapamiento de frases ≤ 5 %, oráculo ausente). El fichero del benchmark, el oro consensuado, la máscara de 322 ítems y el código del evaluador están fijados por SHA-256 antes de puntuar ningún modelo.
- Tres semillas de `kotdaihubv2num` obtienen 0,913 / 0,919 / 0,935 (media 0,922) frente a 0,801 del base: +12,1 pp con IC95 [8,8, 15,7]. Frente a un control del mismo tamaño entrenado con 6.000 registros MRC adicionales en lugar de los pares de contraste: +4,2 pp, IC [2,3, 6,3], p = 0,0001 (bootstrap pareado con agrupación por documento sobre la media de semillas).
- La ganancia se concentra en el tipo `score`: base 0,574 → control 0,691 → numeric 0,806, es decir +11,4 pp [6,2, 17,3] frente al control. Los tipos `choice` y `noul` están en ≥ 0,98 en todos los brazos entrenados y son no inferiores al control con un margen de 2 pp.
- Las mejoras en `kotd_dev` y `aihub_dev` son en distribución. En la prueba de estatutos (57 preguntas de consenso automático, 56 compatibles con Kev) ningún adaptador cambia la exactitud de forma medible: todos los deltas son de ±1-2 preguntas con un intervalo agrupado por documento que incluye el 0. La prueba no puede detectar efectos por debajo de ~5 pp.
- El brazo `jev` se ejecutó a través de Vercel AI Gateway el 22/09/2026, zero-shot y una sola pasada. En las 39 preguntas de estatutos que ambas APIs aceptaron, kd-4b (kotd-s1) respondió 39/39 y Jev 38/39, muestra insuficiente para establecer superioridad o equivalencia. La pasarela rechaza preguntas `score` con más de 10 niveles, por lo que Jev no aceptó 18 de las 57 preguntas: es una diferencia de contrato de API, no de capacidad, y explica la columna de cobertura ajustada. Su p50 se midió bajo limitación de tasa del plan gratuito y no debe leerse como comparación de latencia.
- Latencia: no se publica p50 para los brazos kd. Los p50 disponibles son de los brazos de comparación: jev 771,9 ms; laya 691,0 ms; qwen27b 522,7 ms.

## Requisitos de hardware

Todas las cifras de VRAM son estimaciones derivadas del tamaño del modelo base (4B parámetros); la información proporcionada no incluye requisitos de hardware medidos.

- Pesos del modelo base en BF16/FP16: en torno a 8 GB solo para pesos, más overhead de activaciones y caché KV.
- Cuantizado a INT8: aproximadamente 4-5 GB de VRAM.
- Cuantizado a INT4 (por ejemplo GPTQ/AWQ, previa conversión): aproximadamente 2,5-3,5 GB de VRAM.
- Cabe en GPU de consumo: sí, con cuantización, en tarjetas de 8-12 GB o superiores (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090). En BF16 sin cuantizar es recomendable una GPU de 16 GB o más.
- GPU de centro de datos recomendadas para servicio concurrente: A100 40/80 GB, H100 80 GB, L40S o equivalentes, siempre dimensionando según el número de secuencias simultáneas y la longitud de contexto real (no disponible).
- Opciones de despliegue: al ser adaptadores PEFT en safetensors, se sirven con la librería PEFT sobre el modelo base, con soporte de adaptadores LoRA en vLLM o TGI, o fusionando los adaptadores con el base para servirlo como un modelo único. Para llama.cpp u Ollama haría falta una conversión a GGUF que no se documenta en el repositorio.
- Latencia y throughput: no disponibles para los brazos kd. Solo se publican p50 de los brazos de comparación (véase la sección de benchmarks), medidos bajo condiciones distintas y no comparables.

## Comparativa con modelos similares

No se han localizado en la información disponible adaptadores de decisión tipada comparables en el ecosistema abierto. La propia model card incluye brazos de comparación sobre las mismas preguntas, que son la referencia más directa:

| Modelo | Naturaleza | Parámetros | realdoc_v1 consenso | ko_reviewed acc | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| kd-4b-ko-v0 (kotdaihubv2num2-s1) | Adaptador LoRA sobre Qwen3.5-4B-Base | Base 4B + LoRA r16 | 0,966 | 0,806 | Apache-2.0 | Hugging Face, pesos únicamente |
| jev (TypeSafe AI) | API externa `/v1/evaluate` | no disponible | 0,974 (cobertura ajustada 0,667) | 0,933 | no disponible | API vía Vercel AI Gateway |
| laya (convaiinnovations) | Encoder mmBERT-base | 322M | 0,375 | 0,476 | no disponible | Hugging Face |
| qwen27b (Qwen3.8-27B) | Modelo generativo prompteado zero-shot | 27B | 0,804 | 0,871 | no disponible | Interno (NVFP4) |

Dos matices importantes: la cobertura ajustada de Jev es 0,667 porque su API rechaza las preguntas `score` con más de 10 niveles, de modo que su 0,974 no se mide sobre el mismo conjunto de ítems; y `qwen27b` solo se evaluó sobre los primeros 600 ítems en `kotd_dev` y sobre 1.999 en el caso de Jev. Ambas diferencias están declaradas por los autores.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, solo decisiones tipadas (`choice`, `noul`, `score`). No debe usarse para generación, resumen o diálogo.
- Requiere el modelo base Qwen/Qwen3.5-4B-Base. El repositorio contiene únicamente adaptadores; sin el base no funciona.
- Sesgos conocidos: no se documenta ninguna auditoría de sesgo. El entrenamiento se apoya de forma intensa en corpus administrativos, financieros y jurídicos del sector público coreano, lo que puede introducir sesgos de dominio y de registro.
- Riesgo de alucinación: reducido por diseño en el sentido de que la salida es una elección sobre un conjunto cerrado de opciones, pero el modelo puede asignar alta probabilidad a la opción equivocada. El ECE reportado es elevado en varios brazos (hasta 0,188 en `aihubv2-s1` sobre `kotd_dev`), lo que desaconseja usar la probabilidad bruta como umbral sin recalibración.
- Las mejoras sobre `kotd_dev` y `aihub_dev` son en distribución y no deben extrapolarse. En la prueba de estatutos, ningún adaptador mostró una mejora medible.
- Cobertura de idiomas muy limitada: coreano e inglés. No hay evidencia de rendimiento en castellano.
- Limitación de contexto: la longitud de contexto no está documentada. El contrato de API descrito rechaza preguntas `score` con más de 10 niveles, lo que restringe el uso de escalas largas.
- Licencia: los adaptadores son Apache-2.0, pero los datos de entrenamiento incluyen material con licencia CC-BY-SA-4.0 (KoBEST, KLUE) y datos de AI Hub sujetos a su propia política de uso. Los autores declaran que no redistribuyen ninguno de esos datos, pero conviene verificar la compatibilidad de licencias antes de un uso comercial que implique redistribuir derivados.
- Estado de investigación: etiquetado como `research-preview`, con 0 descargas y 0 me gusta en el momento de la consulta. El adaptador recomendado (`kotdaihubv2num2-s1`) no está promovido formalmente a predeterminado: la promoción está en pausa porque la puerta preregistrada exige además evidencia fuera de distribución.
- Ausencia de datos de reproducción en el repositorio: no se publican datos de entrenamiento ni de evaluación, lo que limita la verificación independiente. Material de reproducción separado en la colección «Evals & Reproducibility» de la organización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/kd-4b-ko-v0
- Organización ThakiCloud en Hugging Face: https://huggingface.co/ThakiCloud
- Colección de evaluación y reproducibilidad: https://huggingface.co/collections/ThakiCloud/evals-and-reproducibility
- Datasets de ThakiCloud: https://huggingface.co/ThakiCloud/datasets
- Sitio corporativo: https://www.thakicloud.com/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
