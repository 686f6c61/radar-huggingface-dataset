# Wasteland0103/qwen2.5-3b-prompt-optimizer-v4-lora

## Resumen

El modelo `qwen2.5-3b-prompt-optimizer-v4-lora` es un adaptador LoRA desarrollado por el usuario Wasteland0103 en el marco del proyecto HUFS APPLES ("Learning to Ask Better: SLM-Based Prompt Optimization"). Se construye sobre el modelo base Qwen/Qwen2.5-3B-Instruct y su función es reescribir una petición breve en coreano en un único párrafo natural que preserve toda la información y el tono originales, añadiendo además los puntos que una buena respuesta debería cubrir. El adaptador se distribuye como pesos PEFT en formato safetensors con un tamaño de repositorio de 0,1 GB.

La relevancia del modelo es limitada y de carácter experimental: su propia model card documenta que, en la evaluación realizada, el adaptador no mejora las respuestas respecto a enviar la petición original. Los resultados en WildChat (300 peticiones cortas en coreano) muestran una tasa de victoria del 47,7 % frente al 50 % del prompt original, con intervalos de confianza que incluyen el 50 %, y ninguna de las diferencias reportadas es estadísticamente significativa. El autor lo declara explícitamente: "v4 does not improve answers over the original request".

Se trata, por tanto, de un artefacto de investigación sobre optimización de prompts con modelos pequeños de lenguaje (SLM), no de un modelo listo para producción. Su interés técnico reside en el pipeline de generación y filtrado de datos (guias generadas por gpt-4o-mini, verificación con una función `faithful()` y descarte de reescrituras que no la superan) y en el mecanismo de compuerta `gate()` que decide qué peticiones se reescriben y cuáles se dejan intactas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer decoder-only Qwen2.5-3B-Instruct |
| Parámetros totales | Adaptador LoRA con r = 16, alpha = 32; el modelo base Qwen2.5-3B-Instruct tiene 3 000 millones de parámetros (dato del modelo base, no del adaptador) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible para el adaptador; el modelo base Qwen2.5-3B-Instruct soporta hasta 32 768 tokens según su propia ficha (no confirmado en la información proporcionada) |
| Tipos de cuantización | Entrenado con QLoRA 4-bit (Unsloth); el adaptador se publica en safetensors y se aplica sobre el modelo base en bfloat16 |
| Idiomas soportados | Coreano (ko) |
| Licencia | qwen-research (Qwen Research License); uso comercial restringido. Adicionalmente aplican los términos de uso de OpenAI por los datos de entrenamiento |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA (cuantización 4-bit mediante Unsloth) sobre Qwen2.5-3B-Instruct, con rango LoRA 16, alpha 32, dropout 0, 3 épocas, tasa de aprendizaje 2e-4 con schedule coseno, tamaño de batch efectivo 16 (batch 2, acumulación de gradiente 8), longitud máxima de secuencia 2048 y semilla 42. No se documenta ningún cambio arquitectónico sobre el modelo base: es un ajuste fino por adaptador de bajo rango.

El conjunto de entrenamiento consta de 1014 pares (más 31 de validación), de los cuales 902 corresponden a peticiones reescritas en un párrafo y 112 a peticiones dejadas sin cambios. Los datos se construyeron en cuatro pasos: (1) se partió del pool de peticiones de la versión v3 más 512 peticiones cortas nuevas generadas por gpt-4o sobre 16 temas, filtrando solapamientos con los conjuntos de evaluación; (2) gpt-4o-mini escribió una guía breve por petición con el punto donde la respuesta depende de la situación y de 2 a 4 puntos específicos a cubrir; (3) gpt-4o-mini reescribió la petición como un párrafo natural usando esa guía; (4) cada reescritura se validó con la misma regla `faithful()` empleada en inferencia, con un reintento y descarte en caso de fallo. No se usaron datos de KoMT-Bench, IFEval-Ko ni del conjunto de test de WildChat en el entrenamiento. No se menciona RLHF ni DPO.

## Capacidades

- Reescritura de peticiones breves en coreano en un único párrafo natural, sin encabezados ni corchetes.
- Preservación de la información y el tono de la petición original.
- Adición de puntos que una buena respuesta debería cubrir, inferidos a partir de la petición corta.
- Devolución de la petición original para solicitudes con una única respuesta correcta.
- Compuerta `gate(q)` que solo admite peticiones de una línea, de 60 caracteres o menos, sin restricciones de cantidad, formato, matemáticas o código; el resto pasa sin modificar.
- Verificación de seguridad `final(q, out)` que solo acepta la salida del modelo si supera `faithful()`: formato, escritura, número de frases, tono, cobertura del texto original y longitud.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking.
- Capacidad multilingüe: únicamente coreano.

## Casos de uso

- Investigación sobre optimización de prompts con SLM: el adaptador sirve como artefacto reproducible para estudiar si un modelo de 3B puede mejorar peticiones cortas, con el pipeline de datos y las funciones `gate()`/`faithful()` disponibles en `v4.py`.
- Reescritura de consultas en un chatbot coreano de bajo coste: para peticiones de una línea y menos de 60 caracteres, el adaptador puede expandirlas a un párrafo con puntos a cubrir, siempre que se acepte que la mejora medida no es significativa.
- Filtrado previo en un pipeline de prompts: la función `gate()` puede reutilizarse de forma independiente para decidir qué consultas merecen reescritura y cuáles deben pasar intactas, evitando modificaciones en peticiones con restricciones de formato o código.
- Generación de datos sintéticos de instrucciones en coreano: el esquema de guía + reescritura + verificación `faithful()` es reutilizable para construir pares de entrenamiento con control de fidelidad.
- Evaluación de jueces automáticos: los resultados del autor comparando un juez pairwise (gpt-4o-mini) con un reward model (Skywork-Reward-V2-Qwen3-4B) ilustran el sesgo de longitud de los jueces y pueden servir como caso de estudio metodológico.
- Docencia y experimentación con PEFT: al ocupar 0,1 GB y cargarse sobre un modelo de 3B, es un ejemplo práctico de QLoRA con Unsloth para cursos o talleres.

## Benchmarks y rendimiento

Modelo de respuesta: Qwen2.5-3B vía Ollama en modo greedy. Comparación frente a enviar la petición original.

| Benchmark | Original | v4 |
|---|---|---|
| WildChat, 300 peticiones cortas en coreano: tasa de victoria frente al original (juez pairwise gpt-4o-mini, ambos órdenes) | 50 % | 47,7 % [44,3; 51,2] |
| KoMT-Bench turno 1 (juez gpt-4o, 80 ítems, 4 reescritos) | 5,20 | 5,32 |
| IFEval-Ko prompt-level strict (342 ítems, 0 reescritos) | 54,7 % | 54,7 % |
| Reward model sobre 54 peticiones de test (Skywork-Reward-V2-Qwen3-4B), diferencia media | 0 | -0,42 [-1,06; +0,16] |

En las 162 peticiones de WildChat que v4 reescribió efectivamente, la tasa de victoria fue del 45,8 %. Ninguna de las diferencias es estadísticamente significativa. Las reescrituras que añadieron palabras como "자세히" o "구체적으로" no presentes en el original ganaron solo el 38,6 % de las veces; el resto de reescrituras ganó el 50 %. Un conjunto de desarrollo previo de 200 peticiones de WildChat mostró un 56 % de victorias que no se replicó en el conjunto de test de 300.

## Requisitos de hardware

- VRAM estimada: el adaptador LoRA ocupa 0,1 GB; el modelo base Qwen2.5-3B-Instruct en bfloat16 requiere aproximadamente 6 GB de VRAM, y en cuantización 4-bit en torno a 2-3 GB (estimación para el modelo base, no publicada por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; RTX 3060/4060 Ti, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bfloat16 y en tarjetas con 4-6 GB si se cuantiza el modelo base.
- Opciones de despliegue: transformers + peft (el método documentado en la model card), con `device_map="auto"`; el modelo base puede servirse con vLLM, llama.cpp u Ollama, aunque el adaptador se aplica vía PEFT. La evaluación del autor usó Qwen2.5-3B en Ollama como modelo de respuesta.
- Latencia y throughput: no disponibles.
- Nota de generación: usar `repetition_penalty=1.0`; un valor de 1.1 penaliza también tokens del prompt y dificulta copiar la petición original.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-3b-prompt-optimizer-v4-lora | Adaptador LoRA sobre 3B | No disponible | Reescritura de prompts en coreano | qwen-research (uso comercial restringido) | HuggingFace, 0 descargas |
| qwen2.5-3b-prompt-optimizer-v3-lora | Adaptador LoRA sobre 3B | No disponible | Reescritura de prompts en coreano con encabezados estructurados | qwen-research | HuggingFace |
| Qwen2.5-3B-Instruct | 3B | Hasta 32 768 tokens (según ficha del modelo base) | Instrucciones generales, multilingüe | qwen-research | HuggingFace, ampliamente utilizado |

No se dispone de datos de benchmarks comparativos con otros adaptadores de optimización de prompts en la información proporcionada.

## Limitaciones y advertencias

- El propio autor declara que v4 no mejora las respuestas respecto a la petición original; todas las diferencias medidas son estadísticamente no significativas.
- Entrenado y evaluado únicamente en coreano; no se garantiza comportamiento en otros idiomas.
- Los puntos añadidos a la reescritura son conjeturas hechas a partir de la petición corta; cuando la conjetura es errónea, la respuesta se desvía de lo que pidió el usuario.
- La mayoría de peticiones largas o con restricciones se dejan pasar sin cambios por diseño, por lo que el efecto sobre ellas es nulo.
- Las reescrituras que añaden palabras no presentes en el original ("자세히", "구체적으로") obtuvieron peores resultados (38,6 % de victorias).
- Riesgo de alucinación: no evaluado de forma específica en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Licencia qwen-research: uso comercial restringido. Además, los datos de entrenamiento incluyen salidas de modelos de OpenAI, por lo que aplican los términos de uso de OpenAI (la model card se interrumpe en este punto).
- El resultado de desarrollo (56 % de victorias) no se replicó en test (47,7 %), lo que sugiere sobreajuste a las decisiones tomadas sobre el conjunto de desarrollo.
- El juez pairwise tiende a preferir respuestas más largas y el reward model tiende a penalizarlas; ambos se reportan por este motivo.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Wasteland0103/qwen2.5-3b-prompt-optimizer-v4-lora
- Versión anterior v3: https://huggingface.co/Wasteland0103/qwen2.5-3b-prompt-optimizer-v3-lora
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Script de uso, compuerta y verificación de seguridad: `v4.py` dentro del repositorio del modelo
