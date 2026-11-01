# vishalvr28/Ysolveth

## Resumen

Ysolveth es un clasificador de texto no generativo desarrollado por vishalvr28 para la plataforma StructZero, orientada a ingenieria de software asistida por IA. El modelo resuelve un problema concreto de orquestacion: decidir, con latencia sub-milisegundo, si un prompt de ingenieria de software es `trivial`, `moderate` o `hard`, para enrutarlo al modelo o pipeline adecuado. Se presenta como un "System One Model", en alusion a la dicotomia de Kahneman: evaluacion rapida y reflexiva frente a la generacion autoregresiva lenta de los LLM convencionales.

Tecnicamente es un artefacto de unos 23 MB que combina un encoder congelado `sentence-transformers/all-MiniLM-L6-v2` cuantizado a int8 en ONNX (384 dimensiones de salida) con una cabeza lineal calibrada que proyecta a tres clases. No genera tokens: una unica pasada tensorial produce una distribucion de probabilidad fija, lo que elimina el riesgo de JSON malformado o etiquetas fuera de rango tipico de pedir la clasificacion a un LLM.

Su relevancia actual es practica: las plataformas de codificacion con agentes necesitan decidir que prompts merecen un modelo frontier costoso y cuales pueden resolverse con plantillas o modelos ligeros. Ysolveth ofrece esa decision en CPU, sin GPU y con coste marginal nulo, aunque su dataset de entrenamiento es muy reducido (296 prompts utiles) y su validacion se limita a un conjunto de test de 60 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer congelado (all-MiniLM-L6-v2) + cabeza lineal calibrada con temperature scaling y softmax |
| Parametros totales | no disponible (artefacto de ~23 MB; encoder int8 de ~22,8 MB + cabeza de 384x3) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del encoder MiniLM, no declarada en la model card) |
| Tipos de cuantizacion | int8 (ONNX) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`encoder_int8.onnx`) + `head_config.json` |

## Arquitectura y entrenamiento

El modelo es un pipeline de dos etapas. La primera es un encoder `sentence-transformers/all-MiniLM-L6-v2` congelado y cuantizado a int8 en formato ONNX, que produce un vector de embedding de 384 dimensiones por prompt. La segunda es una cabeza de clasificacion lineal ligera que mapea ese vector a tres logits, calibrados mediante temperature scaling y normalizados con softmax para obtener una distribucion de probabilidad sobre las clases `trivial`, `moderate` y `hard`. No hay generacion autoregresiva ni bucle de decodificacion: la inferencia es una unica pasada paralela.

El entrenamiento se realizo mediante destilacion por consenso multi-modelo. Se recopilaron 300 prompts de ingenieria de software (desarrollo web, sistemas full-stack, utilidades de servicio unico, arquitecturas backend distribuidas y migraciones de base de datos) y se etiquetaron por mayoria de 4 votos entre modelos frontier (`claude-sonnet-4-6`, `gemini-3.8-flash`, `luna-6` y `claude-haiku-5-5`). Se excluyeron 4 empates 2-2 (1,33%), quedando 296 prompts utiles con distribucion 76 triviales (25,7%), 145 moderados (49,0%) y 75 dificiles (25,3%). El split fue de 236 prompts de entrenamiento (60/116/60 estratificado) y 60 de test aislado (16/29/15), con el encoder congelado durante todo el proceso. La model card menciona ademas una evaluacion con 40 prompts etiquetados manualmente, pero el texto queda truncado y no se detallan sus resultados.

## Capacidades

- Clasificacion de prompts de ingenieria de software en tres niveles de complejidad operativa: `trivial`, `moderate` y `hard`.
- Inferencia no autoregresiva con salida de distribucion de probabilidad calibrada y tipo-segura (384 -> 3 clases).
- Enrutamiento determinista de peticiones hacia modelos ligeros, modelos de razonamiento estandar o pipelines de consenso multi-modelo.
- Ejecucion en CPU con latencia declarada de aproximadamente 2 a 8 ms por prompt.
- Despliegue en procesos locales o microservicios (Rust/Axum, Node.js, Python) sin acceso a red externa.
- Soporte de guardarrailes para operaciones de alto riesgo (migraciones de esquema multi-tenant, conciliacion de webhooks de Stripe, integraciones OAuth/SAML).
- No soporta generacion de texto, codigo, matematicas, vision, audio, tool calling ni razonamiento multi-paso. Es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento de coste en plataformas de codificacion con agentes: cada prompt entrante se clasifica en menos de 10 ms y se deriva a plantillas deterministas (trivial), a un modelo de razonamiento estandar (moderate) o a un pipeline de consenso multi-modelo (hard), reduciendo el gasto en tokens frontier.
- Guardarrail en migraciones de bases de datos multi-tenant: si el prompt se clasifica como `hard`, el orquestador exige verificacion multi-agente y sandbox antes de aplicar cambios, evitando que un unico modelo ejecute una migracion arriesgada.
- Conciliacion de webhooks de Stripe: los prompts de integracion de pagos se marcan como dificiles y se derivan a un flujo con validacion redundante, mientras que los ajustes triviales de formato se resuelven con regex o plantillas.
- Integraciones OAuth/SAML: la clasificacion como `hard` activa un harness de verificacion estricto, adecuado porque estas tareas requieren multiples pasos de validacion que un solo modelo puede pasar por alto.
- Correcciones de tipografia o ediciones de un solo fichero: al detectarse como `trivial`, se evita la llamada a un modelo frontier y se resuelve con una regla determinista, con coste marginal nulo.
- Microservicio de triaje embebido en un IDE o CLI: al ser un artefacto ONNX de ~23 MB sin dependencia de red, puede cargarse en proceso y ofrecer decisiones de enrutamiento instantaneas incluso en entornos air-gapped.
- Filtrado previo en pipelines de CI/CD: clasificar la dificultad de las tareas generadas por issues o PRs para asignar recursos de revision proporcionales a la complejidad declarada.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Precision en test held-out (60 prompts) | 100% (60 de 60) frente a etiquetas de consenso de 4 modelos |
| Tamano del conjunto de test | 60 prompts (16 trivial, 29 moderate, 15 hard) |
| Latencia declarada | ~2 a 8 ms en CPU estandar |
| Coste marginal | 0,00 (sin GPU) |
| Tamano del artefacto | ~23 MB (encoder int8 ~22,8 MB) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La cifra de 100% corresponde a un test de 60 ejemplos etiquetados por consenso de modelos, no a un benchmark publico independiente.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el modelo esta disenado para ejecucion en CPU.
- Cabe en cualquier equipo consumer: el artefacto completo ocupa ~23 MB y puede cargarse en memoria de un portatil, un contenedor pequeno o un dispositivo edge.
- Opciones de despliegue: ONNX Runtime en proceso (Rust/Axum, Node.js, Python); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos.
- Latencia: ~2 a 8 ms por prompt en CPU estandar segun la model card. No se publica throughput agregado ni latencia en GPU.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ysolveth | Clasificador ONNX (encoder + cabeza lineal) | no disponible (~23 MB) | no disponible | Apache 2.0 | HuggingFace |
| all-MiniLM-L6-v2 | Encoder de embeddings | ~22,7 M | 256 tokens (tipico) | Apache 2.0 | HuggingFace, sentence-transformers |
| Clasificacion via LLM frontier (p. ej. GPT-4o, Claude) | Generativo autoregresivo | no disponible | 128K+ | Propietaria | APIs comerciales |

La comparacion directa es limitada porque no existen clasificadores publicos equivalentes de dificultad de prompts de ingenieria de software. Frente a pedir la clasificacion a un LLM frontier, Ysolveth elimina la generacion de tokens (latencia de 2 a 8 ms frente a 800-2.500 ms), no puede producir JSON malformado y tiene coste marginal nulo, a cambio de un alcance mucho mas estrecho y un dataset de entrenamiento muy pequeno. Frente a MiniLM sin cabeza de clasificacion, anade la capa calibrada de tres clases y el empaquetado ONNX int8 listo para produccion.

## Limitaciones y advertencias

- Dataset de entrenamiento muy reducido: 296 prompts utiles y solo 60 en el conjunto de test held-out, lo que limita la solidez estadistica de la precision del 100% reportada.
- Etiquetas generadas por consenso de cuatro modelos frontier, no por anotacion humana a gran escala; la model card menciona una evaluacion con 40 prompts etiquetados manualmente pero el texto esta truncado y no se detallan resultados.
- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Dominio restringido a prompts de ingenieria de software; el rendimiento fuera de ese dominio no esta documentado.
- Riesgo de descalibracion ante distribuciones de prompts distintas de las de entrenamiento (por ejemplo, otros lenguajes de programacion, dominios no web o prompts muy largos).
- El encoder hereda los sesgos y limitaciones de all-MiniLM-L6-v2, incluida su ventana de contexto limitada.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia ni soporte; el proyecto depende de la plataforma StructZero y de un unico autor.
- No es un modelo generativo: no debe usarse para producir codigo, texto ni razonamiento, solo para clasificar dificultad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vishalvr28/Ysolveth
- Plataforma StructZero: https://www.structzero.app/
- Encoder base all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- ONNX Runtime: https://onnxruntime.ai/
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
