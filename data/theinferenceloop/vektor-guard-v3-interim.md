# theinferenceloop/vektor-guard-v3-interim

## Resumen

Vektor-Guard v3 (interim) es un clasificador de prompt injection y jailbreak desarrollado por The Inference Loop (`theinferenceloop`). Se trata de un ajuste fino de ModernBERT-large, un encoder de ~0,4B parametros, que etiqueta una entrada de texto en una de cinco clases: `clean`, `instruction_override`, `indirect_injection`, `jailbreak` y `tool_call_hijacking`. Su funcion es actuar como guardrail previo: clasificar la peticion de un usuario, el contenido recuperado por un sistema RAG o los argumentos de una llamada a herramienta antes de que lleguen al modelo o a la API, de modo que la aplicacion pueda bloquear, marcar o encaminar la peticion.

La relevancia del modelo esta en su posicion en la pila: no compite con LLM generativos, sino que se coloca delante de ellos como capa de deteccion de intencion maliciosa. Con 2048 tokens de longitud maxima de secuencia y licencia Apache-2.0, esta pensado para despliegues de baja latencia, incluidos guardrails en proceso con ONNX/INT8. El pipeline declarado es `text-classification` y el repo ocupa 1,6 GB en safetensors.

Es importante subrayar que se trata de una **version interim entrenada exclusivamente con datos sinteticos**. El propio autor la describe como linea base: la version final `vektor-guard-v3` incorporara un corpus real revisado por humanos y se evaluara contra este modelo para medir la ganancia. La model card recomienda usar esta version para experimentacion y benchmarking, no como control de seguridad definitivo en produccion.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT-large) con cabeza de clasificacion de secuencias |
| Parametros totales | 395.836.421 (~0,4B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (`max_length=2048`) |
| Tipos de cuantizacion | No se detalla un catalogo de cuantizaciones; la model card menciona despliegues en proceso con ONNX/INT8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | answerdotai/ModernBERT-large |
| Numero de clases | 5 |
| Tamano del repositorio | 1,6 GB |
| Fecha de creacion | 2026-10-05 |

Taxonomia de clases declarada por el autor:

| id | Etiqueta | Significado |
|---|---|---|
| 0 | `clean` | Entrada benigna, sin intento de injection ni jailbreak |
| 1 | `instruction_override` | Intento de anular, ignorar o reemplazar las instrucciones de sistema o de desarrollador |
| 2 | `indirect_injection` | Instrucciones maliciosas embebidas en contenido recuperado o de terceros (RAG, documentos, web) |
| 3 | `jailbreak` | Intento de eludir politicas de seguridad mediante role-play, ofuscacion o ataques de persona |
| 4 | `tool_call_hijacking` | Intento de forzar llamadas a herramientas, funciones o API no autorizadas o maliciosas |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de `answerdotai/ModernBERT-large` para clasificacion de secuencias. ModernBERT es una familia de encoders transformer modernizada (atencion con RoPE, alternancia de atencion local y global, soporte nativo de secuencias largas) y aqui se explota con una ventana de 2048 tokens. La salida es un vector de 5 logits sobre el que se aplica softmax para obtener la etiqueta y su confianza. El autor propone un umbral de confianza de 0,85 para considerar una deteccion: cualquier clase distinta de `clean` por encima de ese umbral se trata como ataque.

Los datos de entrenamiento son exclusivamente sinteticos y provienen de dos fases. La fase 2 aporta un corpus binario de 16.384 ejemplos mapeados a `clean` / `instruction_override`. La fase 5 aporta un corpus sintetico de 2.274 ejemplos con las cinco clases, generado al 50/50 por GPT-4.1 y Claude Sonnet y filtrado mediante un pipeline de validacion de dos capas: un checkpoint previo de Vektor-Guard como puerta de confianza y un verificador de categoria basado en LLM. Los splits combinados quedan en 18.204 ejemplos de entrenamiento, 2.390 de validacion y 2.162 de test.

El procedimiento fue de 5 epocas sobre una unica A100, con `max_length=2048` y un `WeightedRandomSampler` con pesos inversos a la frecuencia para compensar el desbalanceo (las clases minoritarias se sobremuestrean aproximadamente 10x). Segun el autor, los datos sinteticos saturan rapido: el mejor checkpoint fue el de la **epoca 2** (las epocas 3 a 5 quedaron planas con ligero sobreajuste) y se conservo mediante `load_best_model_at_end`. No se documenta uso de RLHF ni DPO, algo esperable en un modelo encoder de clasificacion.

## Capacidades

- Clasificacion de texto en cinco categorias de amenaza sobre entradas de prompt, con salida de etiqueta y probabilidad por clase.
- Deteccion de intentos de anulacion de instrucciones de sistema o de desarrollador (`instruction_override`).
- Deteccion de inyeccion indirecta en contenido de terceros, orientada a pipelines RAG y procesamiento de documentos.
- Deteccion de jailbreaks basados en role-play, persona u ofuscacion.
- Deteccion de secuestro de llamadas a herramientas (`tool_call_hijacking`), aplicable a los argumentos de funciones y API.
- Procesamiento de secuencias de hasta 2048 tokens, lo que permite clasificar documentos o bloques de contexto recuperado, no solo prompts cortos.
- Inferencia de baja latencia apta para despliegue en proceso con ONNX/INT8, segun la model card.
- Etiquetado de logs y trafico historico para analitica de seguridad.
- No es un modelo generativo: no produce texto, no razona en varios pasos y no mantiene estado conversacional.
- No es un modelo de moderacion de contenido (toxicidad, CSAM, etc.) ni un filtro de salidas del modelo.

## Casos de uso

- **Guardrail de entrada en produccion**: clasificar cada prompt de usuario antes de enviarlo al LLM; si la etiqueta no es `clean` y supera el umbral de confianza, la aplicacion bloquea la peticion o la desvia a revision. El coste por peticion es muy inferior al de un LLM generativo, por lo que puede ejecutarse en linea sobre el 100% del trafico.
- **Proteccion de pipelines RAG**: clasificar cada fragmento recuperado antes de insertarlo en el contexto del modelo, para cortar ataques de `indirect_injection` embebidos en documentos, paginas web o bases de conocimiento de terceros. Los 2048 tokens de ventana permiten analizar fragmentos completos, no solo titulos.
- **Validacion de argumentos de tool calling**: antes de ejecutar una funcion o llamada a API, clasificar los argumentos generados por el modelo para detectar `tool_call_hijacking` y evitar que una inyeccion previa derive en una accion no autorizada.
- **Seguridad de agentes multi-paso**: aunque el modelo es de turno unico, se puede invocar en cada paso del bucle del agente (observacion, contenido recuperado, propuesta de accion) para construir una defensa por capas sin mantener estado conversacional.
- **Enrutado por riesgo**: usar la clase predicha y la confianza para decidir el camino de la peticion, enviando las entradas sospechosas a un modelo mas caro con politicas mas estrictas o a un revisor humano, y las `clean` al modelo estandar.
- **Analitica y telemetria de seguridad**: etiquetar de forma retroactiva grandes volumenes de trafico o logs para medir la tasa de intentos de injection, identificar tecnicas recurrentes y alimentar reglas de deteccion.
- **Despliegue on-premise o en el borde**: al tratarse de un modelo de ~0,4B con opcion INT8, puede ejecutarse en la propia infraestructura del cliente sin enviar prompts potencialmente sensibles a servicios de terceros.
- **Filtrado previo en gateways de LLM**: integrarlo en un proxy o gateway que centralice el acceso a varios proveedores de modelos, aplicando la misma politica de deteccion a todo el trafico entrante.

## Benchmarks y rendimiento

Resultados declarados por el autor en el split de test reservado (segun la model card, el test no esta inflado por la seleccion de early stopping). Los valores estan marcados como `verified: false` en el model-index.

| Metrica | Valor |
|---|---|
| Accuracy (test reservado) | 99,49% |
| Macro F1 (test reservado) | 98,02% |
| False Negative Rate | 0,54% |
| F1 `clean` | 99,53% |
| F1 `instruction_override` | 99,61% |
| F1 `indirect_injection` | 94,74% |
| F1 `jailbreak` | 98,04% |
| F1 `tool_call_hijacking` | 98,18% |

Notas del autor sobre la lectura de estas cifras: el macro F1 de test (98,02%) es inferior al de validacion (99,78%), lo que interpreta como senal de que no hay fuga de test hacia entrenamiento. `indirect_injection` es la clase mas debil y la mas sutil; cerrar esa brecha es la hipotesis explicita del corpus real de la version final v3. Las clases minoritarias tienen pocos ejemplos en los splits de evaluacion, por lo que los F1 por clase deben leerse con cautela por posible efecto de muestra pequena.

No se han proporcionado resultados de benchmarks de otros modelos comparables en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del numero de parametros declarado (395.836.421) y de la longitud de contexto; la model card no publica requisitos oficiales.

- **Pesos en FP32**: aproximadamente 1,6 GB. Con activaciones y overhead de runtime, el consumo agregado estimado ronda 2,5-3,5 GB de VRAM.
- **Pesos en FP16/BF16**: aproximadamente 0,8 GB, con un agregado estimado de 1,5-2,5 GB de VRAM.
- **Pesos en INT8**: aproximadamente 0,4 GB, con un agregado estimado de 1-1,5 GB de VRAM.
- **GPU consumer**: si, cabe con holgura. Cualquier GPU con 4 GB o mas de VRAM es suficiente en FP16; una RTX 3060, RTX 4060, RTX 4090 o similar lo ejecuta sin problema y con margen para batching.
- **GPU de datacenter**: A100, H100 o L40S son mas que suficientes y permiten lotes grandes para clasificacion masiva en streaming. El entrenamiento declarado se hizo en una unica A100.
- **CPU**: viable para volumenes moderados, especialmente con pesos en INT8 u ONNX Runtime.
- **Opciones de despliegue**: `transformers` con PyTorch (via de referencia documentada con ejemplo de codigo); ONNX/INT8 en proceso, mencionado por el autor como patron de despliegue para consumidores sensibles a la latencia; Text Embeddings Inference, soportado por las etiquetas del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- **Latencia y throughput**: no disponible. El autor no publica mediciones de latencia ni de peticiones por segundo, mas alla de calificar el despliegue ONNX/INT8 como apto para consumidores sensibles a la latencia.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con modelos alternativos ni resultados de terceros, y tampoco se han recuperado datos comparables en la busqueda web. La categoria natural de este modelo son los clasificadores encoder ajustados para seguridad de LLM (deteccion de prompt injection y jailbreak) y las cabezas de clasificacion derivadas de familias como DeBERTa o ModernBERT, pero no se dispone de cifras verificadas de esos modelos en el material facilitado.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| vektor-guard-v3-interim | 395.836.421 (~0,4B) | 2048 tokens | Apache-2.0 | HuggingFace (`theinferenceloop/vektor-guard-v3-interim`) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |
| Rendimiento comparado | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- **Entrenamiento exclusivamente sintetico**: es una version interim que no ha visto ataques reales en produccion. Es previsible un desplazamiento de distribucion ante formulaciones novedosas, ofuscacion, codificaciones (base64, homoglifos, unicode) y cargas maliciosas en otros idiomas. El propio autor senala esta como la razon principal del corpus real de la v3 final.
- **Solo ingles**: el modelo esta entrenado y etiquetado para ingles. El rendimiento en castellano o en cualquier otro idioma no esta documentado y no deberia asumirse.
- **Turno unico**: clasifica una entrada cada vez y no razona sobre el estado de una conversacion multi-turno. Un ataque repartido en varios mensajes puede no detectarse.
- **No es una defensa completa**: un clasificador es evadible. Debe combinarse con monitorizacion, diseno de herramientas con minimo privilegio y comprobaciones de salida.
- **Fuera de alcance**: no es un modelo de moderacion de contenido (toxicidad, CSAM y similares) ni un filtro de salidas; clasifica entradas por intencion de injection o jailbreak, no las respuestas del modelo.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es el falso negativo (clasificar como `clean` un ataque), declarado en un 0,54% sobre test sintetico, y el falso positivo sobre entradas legitimas.
- **Clase mas debil**: `indirect_injection` presenta el F1 mas bajo (94,74%), precisamente en el escenario de RAG donde el impacto puede ser mayor.
- **Tamano de muestra en evaluacion**: las clases minoritarias tienen pocos ejemplos en los splits de validacion y test, por lo que las metricas por clase son menos fiables que las agregadas.
- **Objetos de confianza**: el autor propone un umbral de 0,85, pero es una recomendacion orientativa que conviene recalibrar con datos propios antes de usarlo en produccion.
- **Fechas de publicacion**: el repositorio figura creado y actualizado en octubre de 2026, con 0 descargas y 0 likes en el momento de la consulta, lo que indica que no existe todavia validacion independiente por parte de la comunidad.
- **Licencia**: Apache-2.0 permite uso comercial y modificacion, con obligacion de conservar avisos de copyright y licencia. No impone restricciones adicionales conocidas, pero conviene revisar la licencia del modelo base (`answerdotai/ModernBERT-large`) por si anade condiciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/theinferenceloop/vektor-guard-v3-interim
- Modelo base (ModernBERT-large): https://huggingface.co/answerdotai/ModernBERT-large
- La busqueda web realizada no ha devuelto resultados relevantes sobre este modelo: los enlaces recuperados corresponden a contenido no relacionado (perfiles de redes sociales y un documento sobre analisis comparativo de rendimiento en hardware de borde) y no se incluyen por no ser pertinentes.
- Paper, blog, repositorio o demo especificos del modelo: no disponible en la informacion proporcionada.
