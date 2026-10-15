# Veroic/laya_test

## Resumen

Laya es un modelo de decisión no autorregresivo y multilingüe, etiquetado como "System 1", que recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas en un único paso hacia delante. El repositorio `Veroic/laya_test` es una publicación del autor Veroic que replica la arquitectura y el pipeline del proyecto Laya, con licencia Apache 2.0 y pipeline declarado de `text-classification`. El modelo no genera texto libre: su salida es una clasificación o puntuación estructurada, lo que elimina la necesidad de parsear respuestas y reduce el riesgo de alucinación.

El modelo cuenta con 421.293.830 parámetros (aproximadamente 421 millones) según los pesos en formato safetensors, y el repositorio ocupa 2,4 GB. Está pensado para tareas de enrutado, puntuación, guardrails y moderación, con soporte declarado de más de 100 idiomas en la documentación del proyecto original. El entrenamiento se describe como aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que la única forma de maximizar la recompensa es reportar probabilidades honestas y calibradas.

La relevancia actual del modelo radica en su enfoque de "decisiones calibradas" para sistemas de producción: en lugar de pedir a un LLM generativo que emita una etiqueta y confiar en su formato, Laya devuelve probabilidades numéricas directamente utilizables en umbrales, enrutadores y políticas de seguridad. El coste declarado por inferencia es de aproximadamente 33 ms en un único paso, lo que lo hace adecuado para decisiones de baja latencia en pipelines de atención al cliente, moderación o triaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva, tipo System 1, orientada a clasificación y puntuación (detalles internos no disponibles) |
| Parametros totales | 421.293.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens con `max_len=8192` en el checkpoint `laya-multilingual` |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Más de 100 idiomas según la model card; idiomas concretos no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La model card describe Laya como un modelo de decisión no autorregresivo de tipo "System 1": recibe un estado y un conjunto de preguntas tipadas y produce respuestas tipadas en un único paso hacia delante, sin decodificación secuencial. Las preguntas pueden ser de tipo `choice` (selección entre criterios), `score` (puntuación sobre una escala) y `noul` (probabilidad de que la respuesta sea sí). El modelo no genera texto, por lo que no hay salida textual que parsear ni contenido que alucinar. La arquitectura interna concreta (transformer, híbrida u otra) no se detalla en la información disponible.

El entrenamiento se realizó mediante aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, *Reinforcement Learning with Calibrated Decisions*), de forma que la maximización de la recompensa exige reportar probabilidades calibradas. La model card menciona tres checkpoints en el proyecto original (inglés, multilingüe y probablemente uno adicional), un router que detecta el idioma y el script para dirigir la petición al checkpoint adecuado, y un proceso de ajuste fino con calibración de temperaturas. No se especifican el número de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Clasificación y enrutado: asignación de un estado a una categoría definida por criterios (por ejemplo, departamento de atención al cliente).
- Puntuación calibrada: devolución de probabilidades numéricas para preguntas de tipo `score` y `noul`.
- Decisiones tipadas: soporte de preguntas con tipo explícito (`choice`, `score`, `noul`) y criterios definidos por el usuario.
- Multilingüe: procesamiento declarado de más de 100 idiomas mediante el checkpoint `laya-multilingual`, con detección automática de script e idioma.
- Guardrails y moderación: etiquetado de contenido y decisiones de política sin generación de texto.
- Procesamiento de documentos largos: hasta 8.192 tokens con `max_len=8192` en el checkpoint multilingüe.
- Integración con tooling: extras para servidor HTTP (`laya[serve]`), MCP (`laya[mcp]`), LangChain y LangGraph (`laya[langchain]`), ONNX Runtime (`laya[onnx]`) y ruta rápida en GPU con TileLang (`laya[fast]`).
- Ajuste fino: notebook oficial para entrenar sobre decisiones propias en 2x T4 de Kaggle.
- No soporta generación de texto libre, tool calling generativo ni razonamiento multi-paso en el sentido de un LLM conversacional.

## Casos de uso

- Enrutado de tickets de soporte: el modelo clasifica cada ticket en un departamento (facturación, técnico, otros) mediante preguntas de tipo `choice`, con la ventaja de devolver una probabilidad utilizable para derivar a revisión humana si la confianza es baja.
- Detección de riesgo de abandono: con preguntas de tipo `noul` sobre si el usuario amenaza con cancelar, se obtiene una probabilidad directamente integrable en un umbral de retención.
- Priorización de urgencia: preguntas de tipo `score` permiten ordenar colas de trabajo según una escala definida (por ejemplo, no urgente, pronto, bloqueante) sin necesidad de parsear texto generado.
- Moderación de contenido: clasificación de textos o mensajes contra políticas mediante criterios configurables, con probabilidades calibradas para fijar umbrales de bloqueo.
- Guardrails en pipelines de LLM: uso como capa previa o posterior a un modelo generativo para decidir si una petición o respuesta cumple una política, aprovechando su latencia baja (~33 ms declarados).
- Triaje de correos entrantes: clasificación de correos en categorías operativas (consulta, incidencia, reclamación) y detección de señales concretas mediante preguntas tipadas.
- Análisis de formularios o JSON estructurados: al aceptar JSON como estado, puede puntuar decisiones sobre datos estructurados sin convertirlos a lenguaje natural.
- Enrutado multilingüe: en sistemas con usuarios de varios idiomas, el router detecta el idioma y dirige la petición al checkpoint multilingüe, manteniendo el mismo esquema de preguntas.

## Benchmarks y rendimiento

La model card reporta un resultado sobre el benchmark de decisiones tipadas (2.000 decisiones en cuatro flujos de trabajo):

| Modelo | Precisión en decisiones tipadas |
|---|---|
| `laya-typed-decisions` (ajustado) | 0,766 |
| Checkpoint base en inglés (sin ajuste) | 0,362 |

No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K. La model card sí menciona una tabla de precisión y tiempo por longitud de documento para el checkpoint multilingüe con `max_len=8192`, que no se reproduce aquí al no disponerse de los valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 421 millones de parámetros, en fp16 el peso ronda los 0,85 GB y en fp32 unos 1,7 GB, a lo que hay que sumar activaciones y overhead del runtime.
- GPU recomendadas: no especificadas en la información disponible. El proyecto menciona una ruta rápida en GPU con TileLang (`laya[fast]`) y el uso de 2x T4 en Kaggle para el ajuste fino.
- Compatibilidad con GPU de consumo: probable en GPUs con al menos unos pocos GB de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: servidor HTTP (`laya-serve`), servidor MCP, integración con LangChain y LangGraph, y ONNX Runtime (`laya[onnx]`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia declarada: aproximadamente 33 ms por decisión en el caso general; alrededor de 1,7 s para una entrada de 4.000 tokens en una GPU de Apple.
- Throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas concretas de la misma categoría (clasificadores calibrados no generativos). La model card no incluye comparativas con otros modelos.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Veroic/laya_test | 421.293.830 | 1.024 (hasta 8.192 en multilingüe) | Apache 2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; su salida es siempre una clasificación o puntuación estructurada.
- Riesgo de alucinación reducido por diseño, pero persiste el riesgo de clasificaciones incorrectas o mal calibradas fuera del dominio de entrenamiento.
- La precisión sin ajuste fino es baja en el benchmark reportado (0,362 en el checkpoint base en inglés), por lo que se recomienda ajuste fino sobre datos propios para uso en producción.
- El rendimiento en documentos largos decae con la longitud: la model card indica que entre 8 y 17 de 20 peticiones se responden correctamente más allá de unos 4.000 tokens, por lo que conviene validar en datos propios.
- El límite por defecto de 1.024 tokens trunca documentos largos si no se pasa `max_len=8192`, y hay que nombrar explícitamente el checkpoint multilingüe para textos largos mayoritariamente en inglés.
- No se especifican sesgos conocidos ni la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos por idioma, dominio o demografía.
- La licencia Apache 2.0 permite uso comercial, pero no se detallan restricciones adicionales sobre los pesos ni sobre el uso de las salidas.
- El repositorio `Veroic/laya_test` tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado por la comunidad; conviene tratar los resultados como no verificados de forma independiente.
- No se dispone de información sobre cuantizaciones soportadas, lo que limita la planificación de despliegues en hardware restringido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Veroic/laya_test
- Checkpoint ajustado de referencia: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio GitHub del proyecto: https://github.com/NandhaKishorM/laya
- Documentación: https://nandhakishorm.github.io/laya/
- Guía de hooks: https://nandhakishorm.github.io/laya/hooks/
- Decisiones guiadas por esquema: https://nandhakishorm.github.io/laya/structured/
- Guía de Docker: https://nandhakishorm.github.io/laya/docker/
- Integración con LangChain y LangGraph: https://nandhakishorm.github.io/laya/langchain/
- Referencia de la API: https://nandhakishorm.github.io/laya/reference/
- Notebook de ajuste fino: https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb
- Script de benchmark de contexto largo: https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py
