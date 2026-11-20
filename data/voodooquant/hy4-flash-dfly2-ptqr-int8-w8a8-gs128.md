# voodooquant/Hy4-flash-DFly2-PTQR-INT8-W8A8-GS128

## Resumen

Hy4-flash DFly2 PTQR INT8 W8A8 GS128 es un modelo borrador (draft model) para decodificación especulativa, derivado de tencent/Hy4-flash y publicado por el usuario voodooquant. No es un modelo de lenguaje completo ni autónomo: es el drafter de cinco capas que acompaña al target cuantizado voodooquant/Hy4-flash-NeUQI-INT4-W4A8-GS128 y que acelera la generación prediciendo varios tokens por paso, que el modelo grande verifica después. Con 845.686.433 parámetros totales y un repositorio de 0,9 GB, su función es exclusivamente servir como componente de inferencia especulativa en vLLM sobre hardware AMD ROCm (MI100).

La relevancia de esta publicación es doble. Por un lado, aplica PTQR (una optimización de cuantización que entrena a través de la operación de redondeo del formato desplegado) para reducir la divergencia respecto al drafter original, con una KL media que baja de 0,004551 a 0,003845 en trayectorias de validación. Por otro, documenta métricas de aceptación en un servidor real de cuatro MI100: 2,67 tokens emitidos por ronda especulativa y un 23,9 % de tokens propuestos aceptados con siete propuestas por ronda.

Conviene subrayar que este checkpoint no puede usarse de forma aislada: requiere los embeddings de tokens, la cabeza de vocabulario, el estado oculto, los índices dispersos y las cinco cachés MLA del target. Se arranca siempre a través de la receta del target, no directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFly2 speculative drafter (5 capas + red de corrección de estado oculto) sobre base Hy4-flash |
| Parametros totales | 845.686.433 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (comparte contexto con el target) |
| Tipos de cuantizacion | INT8 W8A8, pesos simétricos con escala FP16 por 128 canales de entrada; activaciones INT8 con escalas dinámicas por token y por grupo; MLA query/KV agrupado en INT8 con productos probabilidad/valor en FP16 |
| Idiomas soportados | no disponible |
| Licencia | Tencent Hy License, Version 1.0 (license: other) |
| Formato de pesos | safetensors (librería vLLM) |

## Arquitectura y entrenamiento

El modelo es un drafter especulativo de cinco capas con una red adicional de corrección del estado oculto. Utiliza atención MLA (multi-head latent attention) agrupada y cuantizada en INT8, y consume las cachés KV compartidas de las capas 25, 29, 33, 37 y 41 del target (numeradas desde cero), además de los embeddings, la cabeza de vocabulario y los índices dispersos del modelo grande. Esto explica su reducido tamaño: no necesita reimplementar el modelo completo, solo predecir borradores coherentes con el estado del target.

El entrenamiento se basa en destilación desde las distribuciones corregidas del drafter original sobre estados reales del target. PTQR optimiza pesos y escalas de proyección a través de la operación de redondeo del formato INT8 desplegado, usando un teacher congelado y muestreando tokens borrador previos para que la red de corrección vea el mismo historial que en inferencia. El checkpoint seleccionado corresponde al paso 60 de una ejecución de 60 pasos sobre 52 secuencias de entrenamiento y 12 de validación. El decodificador upstream de ancho fijo omite la cabeza de confianza adaptativa, pero el checkpoint conserva sus dos tensores originales.

## Capacidades

- Generación de borradores de tokens para decodificación especulativa junto al target Hy4-flash NeUQI INT4.
- Predicción multi-token por ronda (siete propuestas configuradas en la validación publicada).
- Integración con vLLM mediante el método de especulación `dfly` que aporta el lanzador del target.
- Soporte de cuantización INT8 W8A8 con granularidad de grupo 128 para proyecciones.
- Compatibilidad con hardware AMD ROCm (validado en MI100).
- No soporta uso autónomo: carece de embeddings y cabeza de salida propios.
- Capacidades multilingües, tool calling, agentes o visión: no disponibles en la información proporcionada (heredadas, en su caso, del target).

## Casos de uso

- Aceleración de inferencia en producción sobre AMD: desplegar el par target+drafter en vLLM con ROCm permite reducir el número de pasos de decodificación del modelo grande; en la validación publicada se emiten 2,67 tokens por ronda especulativa, lo que amortiza el coste de verificación del target.
- Servidores de generación de código con revisión automatizada: las pruebas del autor usan 12 prompts de code-review de aproximadamente 2k tokens generando 256 tokens de salida; el drafter está calibrado sobre ese tipo de tráfico real.
- Reducción de coste por token en despliegues INT4: al combinarse con el target W4A8, mantiene la huella de memoria baja mientras recupera parte del throughput perdido por la cuantización agresiva.
- Evaluación de pipelines de decodificación especulativa: sirve como referencia reproducible para medir tasas de aceptación y tokens por ronda en hardware MI100 con parámetros concretos (temperatura 1, top-p 0,95, top-k 20).
- Investigación en cuantización PTQR: el checkpoint y sus métricas (KL, acuerdo greedy, variación total) permiten estudiar el efecto del entrenamiento a través del redondeo en drafters pequeños.
- Sustitución del drafter original en instalaciones existentes de Hy4-flash: al preservar los tensores de la cabeza de confianza y requerir solo el recetario del target, se integra sin cambios en el launcher (`DRAFT_MODEL_DIR` permite sobrescribir la ruta).

## Benchmarks y rendimiento

| Metrica | Drafter original | Drafter PTQR |
|---|---|---|
| KL media vs. drafter original (validación) | 0,004551 | 0,003845 |
| Acuerdo greedy con drafter original (antes/después) | 81/84 | 79/84 |
| Coincidencia de argmax con el target (84 posiciones) | 40 | 41 |
| KL media target→draft a temperatura 1 | 2,3275 | 2,3271 |
| Variación total media | 0,5735 | 0,5731 |

Rendimiento en servidor de cuatro MI100 (7 propuestas, 12 prompts de code-review de ~2k tokens, 256 tokens de salida, temperatura 1, top-p 0,95, top-k 20, tres ejecuciones): mediana de 2,67 tokens emitidos por ronda especulativa y 23,9 % de tokens borrador aceptados.

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible; el modelo es un drafter y no se evalúa como generador autónomo.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 0,9 GB en INT8; en inferencia hay que sumar las cachés MLA compartidas y el estado del target, por lo que la memoria efectiva depende del target y de la longitud de contexto.
- GPU recomendadas: AMD MI100 (validado por el autor en configuración de cuatro GPU); otras GPU ROCm no están documentadas en la información disponible.
- GPU de consumo: no disponible; el stack requiere ROCm y las extensiones INT8 del fork de vLLM del autor, lo que limita su uso a GPUs AMD compatibles.
- Despliegue: vLLM con el método `dfly` y las extensiones INT8 del repositorio curvedinf/int8-vllm; el arranque se hace con `scripts/serve_recipe_hy4.sh start` tras descargar target y drafter.
- Latencia y throughput: no se publican valores absolutos de latencia; solo la métrica relativa de 2,67 tokens por ronda especulativa y 23,9 % de aceptación.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Cuantizacion | Hardware validado | Licencia |
|---|---|---|---|---|---|
| Hy4-flash DFly2 PTQR INT8 (este) | Drafter especulativo de 5 capas | 845.686.433 | INT8 W8A8 GS128 | AMD MI100 (ROCm) | Tencent Hy License 1.0 |
| DFly2 original (tencent/Hy4-flash) | Drafter especulativo upstream | no disponible | no disponible (FP original) | no disponible | Tencent Hy License 1.0 |
| Target Hy4-flash NeUQI INT4 | Modelo completo cuantizado | no disponible | INT4 W4A8 GS128 | AMD MI100 (ROCm) | Tencent Hy License 1.0 |

No se dispone de datos de otros drafters comparables (EAGLE, Medusa u otros) en la información proporcionada para establecer una comparación cuantitativa de parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es un modelo autónomo: sin el target correspondiente no puede generar texto; depende de sus embeddings, cabeza de vocabulario, estado oculto, índices dispersos y cinco cachés MLA.
- Solo está validado con el target voodooquant/Hy4-flash-NeUQI-INT4-W4A8-GS128; usarlo con otro target o con el modelo original sin cuantizar no está documentado.
- El acuerdo greedy con el drafter original bajó de 81/84 a 79/84 tras PTQR, aunque mejoró ligeramente la coincidencia con el target (40 a 41 argmax); el equilibrio entre fidelidad al drafter y al target debe evaluarse en cada caso.
- La tasa de aceptación del 23,9 % es modesta y se midió en un escenario concreto (code-review, ~2k tokens, 7 propuestas); en otros dominios o temperaturas puede degradarse.
- La licencia Tencent Hy License 1.0 impone condiciones de uso comercial que deben revisarse antes de desplegar en producción; no es una licencia permisiva tipo Apache o MIT.
- Idiomas soportados no documentados; las capacidades lingüísticas dependen enteramente del target.
- El stack requiere un fork específico de vLLM con extensiones INT8 y ROCm, lo que añade coste de mantenimiento y limita la portabilidad a NVIDIA.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; al ser un drafter, los errores se filtran por la verificación del target, pero afectan a la tasa de aceptación y al throughput.
- Los datos de validación son limitados (52 secuencias de entrenamiento, 12 de validación, 84 posiciones evaluadas), por lo que las métricas tienen alta varianza.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voodooquant/Hy4-flash-DFly2-PTQR-INT8-W8A8-GS128
- Target asociado: https://huggingface.co/voodooquant/Hy4-flash-NeUQI-INT4-W4A8-GS128
- Modelo base: https://huggingface.co/tencent/Hy4-flash
- Sección DFly2 del modelo base: https://huggingface.co/tencent/Hy4-flash#dfly2-for-speculative-decoding
- Receta de serving para MI100: https://github.com/curvedinf/int8-vllm/blob/main/docs/recipes/hy4-flash.md
- Métricas de entrenamiento y referencia: dfly-training.json (incluido en el repositorio del modelo)
- Licencia: LICENSE (incluida en el repositorio del modelo)
- Aviso legal: NOTICE (incluido en el repositorio del modelo)
