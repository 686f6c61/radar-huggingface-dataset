# vdaular/laya

## Resumen

Laya es un modelo de decisión no autoregresivo de tipo "System 1" publicado en HuggingFace bajo el identificador `vdaular/laya`. Recibe un estado (texto libre, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas acompañadas de probabilidades calibradas en una única pasada forward, sin generar texto. Su arquitectura es un encoder transformer: el checkpoint raíz usa un backbone ModernBERT-large con 421.293.830 parámetros y 512 tokens de contexto, orientado a inglés, guardrails y triaje de correo.

El modelo se entrena con aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (el autor lo denomina RLCD, *reinforcement learning with calibrated decisions*), de forma que la única estrategia que maximiza la recompensa es reportar probabilidades honestas. Según el autor, esto elimina la necesidad de parsear salidas y reduce el riesgo de alucinación, ya que el modelo nunca emite texto libre. La familia incluye dos checkpoints adicionales: una variante multilingüe sobre mmBERT-base (322M parámetros, contexto de 1024 ampliable hasta 8k, 100+ idiomas) y una variante de decisiones tipadas sobre ModernBERT-large (421M, contexto 1024).

Es relevante ahora porque cubre un nicho distinto al de los LLM generativos: enrutado, clasificación, moderación y *scoring* con latencias de milisegundos y coste de cómputo muy bajo, sin depender de decodificación autoregresiva ni de plantillas de prompt frágiles. La información disponible procede de una model card truncada y el repositorio no registra descargas ni interacciones, por lo que los datos de rendimiento son los reportados por el autor y no verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autoregresivo (checkpoint raiz sobre backbone ModernBERT-large; variante multilingue sobre mmBERT-base) |
| Parametros totales | 421.293.830 (checkpoint raiz, dato safetensors del repo); variante multilingue: 322M segun la model card |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (checkpoint raiz en ingles); 1024 en la variante multilingue (ampliable hasta 8k); 1024 en la variante typed-decisions |
| Tipos de cuantizacion | No disponible. Se documenta inferencia en bf16 (ruta rapida TileLang GPU "coincide con el forward estandar en bf16"); no se listan pesos cuantizados tipo GGUF, AWQ o GPTQ |
| Idiomas soportados | La model card declara 100+ idiomas para la variante multilingue; la metadata de HuggingFace del repo `vdaular/laya` indica "no disponibles". El checkpoint raiz esta orientado a ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); se menciona exportacion a ONNX mediante `laya.onnx_agent.ONNXAgent` |

## Arquitectura y entrenamiento

Laya es un encoder transformer no autoregresivo. El checkpoint raiz se construye sobre ModernBERT-large (421M parametros) con 512 tokens de contexto, mientras que la variante multilingue emplea mmBERT-base (322M) con 1024 tokens ampliables hasta 8k, y la variante de decisiones tipadas vuelve a ModernBERT-large con 1024 tokens. El modelo no decodifica tokens: recibe un estado y un conjunto de preguntas tipadas (`choice`, `score`, entre otras) y produce respuestas tipadas con probabilidades calibradas en una sola pasada forward.

El entrenamiento se realiza con aprendizaje por refuerzo contra reglas de puntuacion estrictamente propias (RLCD, segun la nomenclatura del autor), de modo que la funcion de recompensa solo se maximiza reportando probabilidades honestas. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF o DPO. La informacion proporcionada esta truncada y no cubre esos apartados.

Entre las innovaciones tecnicas documentadas por el autor destacan: carga de checkpoints sin inicializacion aleatoria de pesos (aproximadamente 22 s a 2 s en CPU, con respuestas identicas a nivel de bit), `import laya` sin cargar torch para procesos ligeros, puntuacion por lotes (`predict_batch`, `Router.predict_batch`), hooks de prediccion para auditar, trazar, redactar, cachear o filtrar resultados, una ruta rapida GPU en TileLang opcional, soporte de `torch.compile`, exportacion a ONNX Runtime, deteccion de escritura e idioma en sub-milisegundos y un enrutador que mantiene dos checkpoints residentes.

## Capacidades

- Clasificacion de texto y enrutado de decisiones: preguntas de tipo `choice` con criterios nombrados y preguntas de tipo `score` con niveles definidos por el usuario.
- Probabilidades calibradas: el modelo devuelve confianza numerica, no texto, gracias al entrenamiento con reglas de puntuacion propias.
- Decisiones tipadas: la variante `laya-typed-decisions` cubre cuatro flujos de trabajo de decisiones tipadas (0,766 de exactitud reportada).
- Multilingue: variante con soporte declarado de mas de 100 idiomas, con deteccion automatica de escritura e idioma en sub-milisegundos y enrutado al checkpoint adecuado.
- Guardrails y moderacion: etiquetado de contenido y filtrado dentro del pipeline de decisiones.
- Triaje de correo y tickets: extraccion de departamento, urgencia, riesgo de abandono u otros campos definidos por el usuario.
- Puntuacion por lotes: `agent.predict_batch(states, questions)` y `Router.predict_batch(requests)` con respuestas identicas a las llamadas individuales.
- Hooks de prediccion: ejecucion de funciones antes y despues de cada decision para auditoria, trazabilidad, redaccion, cache o gating.
- Integraciones: servidor HTTP autoalojado compatible con Jev, servidor MCP opcional, paquetes para LangChain y LangGraph, y `laya-ts` para Node y navegador con respuestas equivalentes a las del paquete Python.
- Sin generacion de texto: no hay decodificacion autoregresiva, por lo que no aplica *tool calling* generativo ni generacion de codigo o texto libre.

## Casos de uso

- Triaje de tickets de soporte: se define una pregunta `choice` con criterios por departamento (facturacion, tecnico, ventas, otros) y el modelo devuelve la categoria con probabilidad asociada, lo que permite enrutar el ticket en una sola pasada y aplicar umbrales de derivacion humana cuando la confianza es baja.
- Deteccion de riesgo de abandono en CRM: con una pregunta `score` sobre el texto del correo (por ejemplo, "cancelaremos el plan"), el modelo produce un nivel de riesgo calibrado que alimenta avisos automaticos para el equipo de retencion.
- Guardrails en produccion: insercion de Laya como filtro previo a un LLM generativo, de modo que la decision de permitir, bloquear o marcar una entrada se resuelve en milisegundos y con una probabilidad explicita, sin coste de decodificacion.
- Enrutado de peticiones en arquitecturas multi-modelo: `Router` detecta idioma y escritura, agrupa las peticiones por checkpoint y conjunto de preguntas, y las puntua en pasadas forward compartidas, lo que reduce el coste de servir varios modelos especializados.
- Moderacion de contenido multilingue: la variante sobre mmBERT-base cubre mas de 100 idiomas con contexto de 1024 tokens, adecuada para plataformas con trafico en multiples lenguas donde no es viable mantener un clasificador por idioma.
- Procesamiento por lotes de grandes volumenes: `predict_batch` puntua conjuntos amplios de estados en pasadas forward compartidas, util para reetiquetar historicos de tickets, correos o resenas con presupuesto de GPU limitado.
- Auditoria y cumplimiento: los hooks de prediccion permiten registrar cada decision, redactar campos sensibles antes del envio al modelo y cachear resultados, lo que facilita la trazabilidad exigible en entornos regulados.
- Aplicaciones en navegador o Node.js: `laya-ts` ofrece las mismas respuestas que el paquete Python, lo que permite ejecutar clasificacion y guardrails en el cliente sin exponer un servicio adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos numericos presentes en la model card son los siguientes, aportados por el autor y no verificados de forma independiente:

| Metrica | Valor reportado |
|---|---|
| Exactitud en los cuatro flujos de decisiones tipadas (`laya-typed-decisions`) | 0,766 |
| Latencia de una pasada forward | ~33 ms |
| Latencia de enrutado con checkpoints precargados | inferior a 35 ms |
| Velocidad de la variante multilingue frente a la raiz | ~2,2x mas rapida |
| Tiempo de carga del checkpoint en CPU (0.3.11 frente a 0.3.6) | ~2 s frente a ~22 s |
| Idiomas cubiertos en la comparativa grafica | 51 idiomas (la model card declara 100+ en la variante multilingue) |

No se dispone de resultados de evaluacion por terceros, ni de cifras de *throughput* por GPU, ni de comparaciones reproducibles mas alla de la imagen comparativa "Laya versus TypeSafe Jev" publicada por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia aritmetica derivada del numero de parametros del checkpoint raiz (421.293.830), los pesos ocupan aproximadamente 0,84 GB en bf16, 0,42 GB en int8 y 0,21 GB en int4; a ello hay que sumar activaciones y memoria de trabajo, que dependen del tamano de lote y del contexto efectivo.
- GPU recomendadas: no disponible. La model card menciona soporte de GPU Apple (MPS) y una ruta rapida GPU en TileLang, pero no especifica modelos concretos.
- Compatibilidad con GPU de consumo: previsiblemente si para el checkpoint de 421M en bf16, dado el tamano de pesos calculado, aunque el dato no esta confirmado en la informacion disponible.
- CPU: el modelo carga y ejecuta en CPU; la version 0.3.11 reduce el tiempo de carga de aproximadamente 22 s a aproximadamente 2 s en CPU.
- Opciones de despliegue: paquete Python `laya` con transformers, exportacion a ONNX Runtime, servidor HTTP autoalojado compatible con Jev (`pip install "laya[serve]"`, comando `laya-serve`), servidor MCP opcional (`pip install "laya[mcp]"`), integraciones con LangChain y LangGraph (`pip install "laya[langchain]"`) y paquete TypeScript `laya-ts` para Node y navegador. No se documenta soporte explicito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia de ~33 ms por pasada forward y enrutado por debajo de 35 ms con checkpoints precargados, segun el autor. No se proporcionan cifras de throughput por GPU.

## Comparativa con modelos similares

Los tres checkpoints de la familia son la unica comparacion con datos disponibles en la informacion proporcionada:

| Modelo | Backbone | Parametros | Contexto | Mejor para | Licencia |
|---|---|---|---|---|---|
| Laya (raiz, `vdaular/laya`) | ModernBERT-large | 421M | 512 | Texto en ingles, guardrails, triaje de correo | apache-2.0 |
| Laya multilingual | mmBERT-base | 322M | 1024 (hasta 8k) | 100+ idiomas, ~2,2x mas rapido | no disponible en la informacion |
| Laya typed-decisions | ModernBERT-large | 421M | 1024 | Cuatro flujos de decisiones tipadas (0,766 de exactitud) | no disponible en la informacion |

Alternativas externas de la misma categoria (encoders de clasificacion como ModernBERT-large, DeBERTa-v3-large, mmBERT-base, o clasificadores de guardrails tipo Llama Guard): no disponible. La informacion proporcionada no incluye datos comparativos de parametros, contexto, rendimiento ni licencia de esos modelos, y la model card solo referencia "TypeSafe Jev" en una imagen sin cifras textuales.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier expectativa de generacion libre, resumen, traduccion, codigo o *tool calling* generativo queda fuera de su alcance por diseno.
- Los unicos datos de rendimiento proceden del autor. No hay evaluacion independiente ni benchmarks estandar publicados en la informacion disponible.
- La model card esta truncada: se interrumpe en la definicion de una pregunta de tipo `nou`, por lo que faltan secciones completas (idiomas soportados, detalles de entrenamiento y datos de uso).
- Riesgo de alucinacion reducido por diseno, ya que no hay texto generado que pueda resultar infiel; el riesgo residual se traslada a la calibracion de las probabilidades, que puede degradarse fuera del dominio de entrenamiento.
- El repositorio `vdaular/laya` registra 0 descargas y 0 *likes*, y su model card corresponde a la organizacion `convaiinnovations/laya`, lo que sugiere una copia o espejo sin verificacion de autoria. Conviene contrastar con el repositorio original antes de usarlo en produccion.
- Las fechas de creacion y actualizacion del repositorio (23 de septiembre de 2026) son posteriores a la fecha habitual de consulta, un indicio de metadatos poco fiables.
- El checkpoint raiz tiene 512 tokens de contexto, insuficiente para documentos largos; en ese caso hay que recurrir a la variante multilingue (1024, hasta 8k) o a troceado previo.
- La metadata de HuggingFace no declara idiomas soportados para el repositorio `vdaular/laya`; la afirmacion de "100+ idiomas" solo aparece en la model card y se refiere a la variante multilingue.
- La licencia apache-2.0 permite uso comercial y modificacion, pero exige conservar los avisos de licencia y de autoria; las licencias de los dos checkpoints empaquetados en subcarpetas no se detallan en la informacion disponible.
- Los sesgos conocidos no estan documentados en el material proporcionado.
- El despliegue de la ruta rapida en TileLang, `torch.compile` y ONNX es opcional; la model card advierte de que estas rutas deben activarse explicitamente y que las respuestas se mantienen solo "dentro del redondeo" respecto al forward estandar en bf16.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vdaular/laya
- Checkpoint multilingue: https://huggingface.co/convaiinnovations/laya-multilingual
- Checkpoint de decisiones tipadas: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Repositorio en GitHub: https://github.com/NandhaKishorM/laya
- Paquete TypeScript `laya-ts`: https://github.com/NandhaKishorM/laya/tree/main/laya-ts
- Imagen comparativa "Laya versus TypeSafe Jev": https://raw.githubusercontent.com/NandhaKishorM/laya/main/assets/laya_vs_jev_full.png
- Instalacion del paquete Python: `pip install laya` (extras: `laya[serve]`, `laya[mcp]`, `laya[langchain]`)
