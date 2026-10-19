# ThakiCloud/Thaki-Decision-0.8B-G14-v0.3

## Resumen

Thaki-Decision-0.8B-G14-v0.3 es un adaptador LoRA experimental publicado por ThakiCloud sobre el modelo base `vllm-sr/d3-lite` (aproximadamente 0,8 mil millones de parametros, construido a su vez sobre Qwen3.5-0.8B). No es un modelo generativo: es una cabeza de decision que, dada una peticion de usuario, estima cuatro probabilidades de resultado conjunto (`q00`, `q01`, `q10`, `q11`) para dos niveles de servicio —un modelo de 8B y otro de 27B— y devuelve `p_8B`, `p_27B`, `delta = q01 - q10` y el riesgo de arrepentimiento `risk = q01`. No produce ni una sola palabra de texto; su funcion es decidir a que tier conviene enviar cada peticion para ahorrar coste sin degradar la calidad.

El modelo se presenta explicitamente como un resultado negativo registrado: el propio autor recomienda no usarlo y quedarse con la version anterior, `Thaki-Decision-0.8B-G13-v0.2`. La novedad de v0.3 es un termino adicional de perdida que ordena por encima del resto las peticiones de "arrepentimiento" (aquellas en las que el 8B falla y el 27B acierta). Sobre el split de desarrollo retenido el ranking mejora, pero con el umbral elegido el enrutamiento empeora: mayor perdida de calidad, coste superior a usar siempre el 27B y 8 de las 95 peticiones de arrepentimiento enviadas al modelo pequeno (frente a 0 en v0.2).

Su interes editorial es doble: documenta con rigor un fallo de transferencia de umbral en un sistema de enrutamiento y sirve como referencia metodologica para quien disene routers LLM basados en clasificacion sin generacion. El repo tiene 0 descargas y 0 likes en el momento de la consulta, y solo cubre ingles y coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B via `vllm-sr/d3-lite`) con adaptador LoRA y cabeza de decision conjunta de 4 celdas |
| Parametros totales | Aproximadamente 0,8 mil millones (modelo base); el adaptador LoRA entregado pesa 41 MB y la cabeza 16 KB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuye sin cuantizar en safetensors; el modelo base admite las cuantizaciones soportadas por transformers y peft) |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA r=16, alpha=32, mas pesos de la cabeza) |
| Modelo base | `vllm-sr/d3-lite`, revision fijada `3c49f5c0bd48a4b28e29b8ec1f38f56e199f3d61` (Apache-2.0) |
| Inicializado desde | `ThakiCloud/Thaki-Decision-0.8B-G13-v0.2` (adapter sha256 `b3998008…`, head `f45f7fb9…`) |
| Pipeline | text-classification |
| Salidas | `p_8B`, `p_27B` en [0, 1]; `delta` en [-1, 1]; `risk` en [0, 1]; `joint` = {`00`, `01`, `10`, `11`} sumando 1 |
| Candidatos vistos en entrenamiento | Qwen3-8B y Qwen3.8-27B |
| Libreria | peft |
| Estado | Experimental, no recomendado (resultado negativo) |

## Arquitectura y entrenamiento

La arquitectura es la de un transformer decoder-only pequeno (Qwen3.5-0.8B) sobre el que se monta un adaptador LoRA de rango 16 y alpha 32, junto con una cabeza lineal de cuatro celdas que modela el resultado conjunto de dos modelos candidatos. La inferencia es "generation-free": una unica pasada produce `q00` (ambos fallan), `q01` (solo el 27B acierta), `q10` (solo el 8B acierta) y `q11` (ambos aciertan), de donde se derivan las probabilidades marginales, el delta y el riesgo. La regla de enrutamiento publicada envia la peticion al 8B cuando `risk <= tau` (politica primaria G14) o `delta <= tau`, con `tau = 0.0200` seleccionado unicamente sobre un split de desarrollo de 128 peticiones (la mayor cuota de 8B cuya calidad en desarrollo queda a menos de 0,5 puntos porcentuales de usar siempre el 27B).

El entrenamiento parte de v0.2 y anade un termino de ranking de arrepentimiento: media de `softplus(-(logit q01_i - logit q01_j))` sobre cada par (arrepentimiento, no arrepentimiento) dentro de un lote de 16 peticiones, donde arrepentimiento se define como tasa de exito del 8B inferior a 0,5 y tasa del 27B igual o superior a 0,5. La perdida total es la de v0.2 (1,0 x [Huber gap + ranking pairwise] + 0,5 x entropia cruzada de 4 celdas) mas 1,0 x el termino de ranking; los pesos se fijaron antes del entrenamiento sin ajuste. Los datos son 2.400 peticiones generadas proceduralmente en 24 familias de tarea (codigo, JSON, matematicas, tool calls), cada una ejecutada 5 veces en ambos modelos y evaluada con checkers deterministas; 705 peticiones de entrenamiento son de arrepentimiento. No se usaron etiquetas externas ni de modelos cerrados. Optimizacion: 3 epocas adicionales, 16 peticiones por paso, AdamW (LoRA lr 2e-4, cabeza lr 1e-3), semilla 0, sobre 1 GPU H200 durante 577 s; la perdida de entrenamiento bajo de 1,095 a 0,794 y el termino de arrepentimiento de 0,369 a 0,225.

## Capacidades

- Clasificacion y enrutamiento de peticiones LLM entre dos tiers (8B y 27B) sin generar texto.
- Estimacion de probabilidad conjunta de exito/fallo para cada tier (`joint`), lo que permite analisis de riesgo y no solo una etiqueta dura.
- Puntuacion de "arrepentimiento" (`risk = q01`): detecta peticiones que el modelo pequeno probablemente no resolvera.
- Calculo de `delta = q01 - q10`, util como puntuacion de ranking de dificultad relativa entre tiers.
- Inferencia en CPU o GPU (`device="cuda:0"` o `"cpu"`), con una sola pasada por peticion.
- Soporte de multiples peticiones por llamada mediante `td.score([...])` y de decision directa con `td.route(texto, tau=..., score=...)`.
- Idiomas: ingles y coreano.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es exclusivamente una cabeza de decision.

## Casos de uso

- Enrutamiento coste-calidad en produccion: el router decide entre Qwen3-8B y Qwen3.8-27B antes de invocar al modelo generativo; en el split de desarrollo, v0.2 (la version recomendada) logro 0,275 GPU-segundos por peticion frente a 0,280 de usar siempre el 27B, con solo 0,66 pp de perdida de calidad.
- Triage de peticiones sin coste de generacion: al no producir tokens, la puntuacion se puede ejecutar en CPU y actuar como prefiltro de una cola, reservando las GPUs para la generacion real.
- Control de presupuesto por peticion: usar `risk` con umbrales distintos segun el SLA del cliente permite enviar al tier barato solo lo que el negocio tolere, aunque en v0.3 esta politica concreta incumple el criterio de coste.
- Deteccion de peticiones de alto riesgo para revision humana: `risk` alto indica que el modelo pequeno fallara con probabilidad elevada, lo que sirve para marcar casos que requieren el tier grande o supervision.
- Investigacion sobre enrutamiento y cascadas: el modelo y su model card documentan un fallo de transferencia de umbral (4,7 % de peticiones a 8B en desarrollo frente a 8,75 % en retenido), un caso de estudio util para quien calibre routers.
- Evaluacion comparativa de politicas: servir como baseline reproducible en experimentos de seleccion de modelo, midiendo AUC pairwise de `delta` frente a la brecha observada (0,608 en v0.3 frente a 0,562 en v0.2).
- Clasificacion de dificultad por familia de tarea: las 24 familias (codigo, JSON, matematicas, tool calls) permiten analizar en que tipo de peticion el router acierta y en cual degrada; la peor familia de v0.3 pierde 9,44 pp de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos publicados corresponden a un split de desarrollo retenido de 320 peticiones con 8 familias de tarea no vistas, con intervalos de confianza bootstrap pareados al 95 %:

| Metrica (split de desarrollo, 320 peticiones) | v0.2 (`delta`) | v0.3 (`risk`) |
|---|---|---|
| Cuota enrutada al 8B | 9,4 % | 8,75 % |
| Perdida de calidad frente a usar siempre el 27B | 0,66 pp [0,10; 1,25] | 2,12 pp [0,35; 4,03] |
| GPU-segundos por peticion (siempre-27B: 0,280, router incluido) | 0,275 | 0,309 |
| Frente a router aleatorio con la misma cuota de 8B | +1,97 pp [1,23; 2,63] | +0,33 pp [-1,36; 1,97] |
| Frente a router de ratio fijo con la misma cuota de 8B | +1,20 pp [0,11; 2,36] | -0,38 pp [-1,80; 0,95] |
| Peticiones de arrepentimiento (solo las resuelve el 27B) enviadas al 8B | 0 / 95 | 8 / 95 |
| AUC de la puntuacion para arrepentimiento frente al resto | 0,646 | 0,644 |
| AUC pairwise de `delta` frente a la brecha observada | 0,562 | 0,608 |
| Peor familia de tarea (perdida de calidad) | 3,06 pp | 9,44 pp (62,5 % de esa familia enviada al 8B) |

Diferencia directa v0.3 menos v0.2: calidad enrutada -1,46 pp [-3,33; 0,14] y ahorro de coste -15,2 pp del coste de siempre-27B [-22,0; -8,6]. Usar el `risk = q01` de v0.2 con la misma regla tambien empeora respecto a `delta` (1,04 pp de perdida de calidad, +8,5 % de coste), por lo que el cambio de politica por si solo tampoco ayuda. Coste de entrenamiento: 577 s en 1 GPU H200, perdida 1,095 a 0,794.

## Requisitos de hardware

- El adaptador ocupa 41 MB y la cabeza 16 KB; hay que sumar el modelo base `vllm-sr/d3-lite` de aproximadamente 0,8 mil millones de parametros.
- VRAM estimada para el modelo base: no publicada por el autor. Como referencia aritmetica, en fp16 los pesos son aproximadamente 1,6 GB y en 8 bits alrededor de 0,8 GB, mas activaciones y overhead del runtime; el adaptador anade decenas de MB.
- Cabe en GPU de consumo: cualquier tarjeta con 4 GB o mas de VRAM deberia alojar el conjunto en fp16, y el modelo se puede ejecutar en CPU (`device="cpu"`), lo que permite despliegues sin acelerador.
- GPU de entrenamiento documentada: 1 x H200. Para inferencia no se especifica hardware de referencia ni latencia medida.
- Dependencias exactas: `transformers==5.17.0`, `peft==0.21.2`, `accelerate>=1.10`, `einops`, `huggingface_hub>=1.0` y `safetensors`.
- Despliegue: el autor proporciona un cargador propio (`thaki_decision.py` con la clase `ThakiDecision`); no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Throughput y latencia: no disponibles. Cada peticion requiere una unica pasada hacia delante, sin decodificacion autoregresiva.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Thaki-Decision-0.8B-G14-v0.3 | ~0,8B (LoRA sobre d3-lite) | Router 8B/27B, 4 celdas conjuntas, salida con `risk` | no disponible | Apache-2.0 | HuggingFace, 0 descargas |
| Thaki-Decision-0.8B-G13-v0.2 | ~0,8B (misma base) | Router 8B/27B, salida con `delta` | no disponible | Apache-2.0 | HuggingFace; version recomendada por el autor |
| `vllm-sr/d3-lite` | ~0,8B (Qwen3.5-0.8B) | Modelo base generativo | no disponible | Apache-2.0 | HuggingFace |
| ThakiCloud/RAG-Gate-8B | 8B | Guardarrail de suficiencia de evidencia en RAG (ingles) | no disponible | Apache-2.0 | HuggingFace |

La comparacion relevante es contra v0.2, que con la misma base, los mismos datos y el mismo coste obtiene mejor calidad enrutada (0,66 pp frente a 2,12 pp de perdida), menor coste (0,275 frente a 0,309 GPU-segundos por peticion) y cero peticiones de arrepentimiento enviadas al tier pequeno. No se dispone de datos publicados de otros routers de seleccion de modelo comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Resultado negativo declarado: el autor recomienda explicitamente no usar v0.3 y emplear v0.2 en su lugar.
- El umbral no transfiere: `tau = 0.0200` se calibro sobre 128 peticiones de desarrollo y produjo 4,7 % de envios al 8B en desarrollo frente a 8,75 % en el split retenido.
- Fallo del criterio de coste: 0,309 GPU-segundos por peticion frente a 0,280 de usar siempre el 27B, es decir, sale mas caro que no enrutar.
- Fallo del criterio de calidad: 2,12 pp de perdida frente a siempre-27B, con el limite inferior del intervalo en 0,35 pp.
- 8 de 95 peticiones que solo el 27B resuelve se enviaron al modelo pequeno, con el impacto que eso tiene en fiabilidad percibida.
- Una sola ejecucion de entrenamiento, solo split de desarrollo y conjunto de test sellado sin abrir: no hay validacion independiente.
- Evaluacion limitada a dos candidatos concretos (Qwen3-8B y Qwen3.8-27B); el router no es portable sin reentrenamiento a otros pares de modelos.
- Solo ingles y coreano; sin datos de rendimiento en castellano ni en otros idiomas.
- No genera texto: no sirve para tareas de respuesta, razonamiento directo ni tool calling, solo para decidir el tier.
- Los datos de entrenamiento y las etiquetas no se publican, lo que impide reproducir la evaluacion.
- Repo de 0,0 GB y 0 descargas: no hay senales de uso comunitario ni mantenimiento.
- Licencia Apache-2.0 permite uso comercial, pero el estado experimental y los resultados negativos desaconsejan cualquier despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ThakiCloud/Thaki-Decision-0.8B-G14-v0.3
- Version anterior recomendada (v0.2): https://huggingface.co/ThakiCloud/Thaki-Decision-0.8B-G13-v0.2
- Modelo base `vllm-sr/d3-lite`: https://huggingface.co/vllm-sr/d3-lite
- Model card en coreano: [MODEL_CARD.ko.md](./MODEL_CARD.ko.md)
- Organizacion en HuggingFace: https://huggingface.co/ThakiCloud
- GitHub de ThakiCloud: https://github.com/ThakiCloud
- Documentacion de la API Decision 3.0: https://decision.vllm-sr.ai/docs
- Sitio corporativo: https://www.thakicloud.com/
- Repo relacionado `ThakiCloud/RAG-Gate-8B`: https://huggingface.co/ThakiCloud/RAG-Gate-8B
