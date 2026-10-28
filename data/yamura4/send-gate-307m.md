# yamura4/send-gate-307m

## Resumen

send-gate-307m es un clasificador binario de seguridad para mensajes de chat, desarrollado por yamura4, concebido como puerta de envío («send gate») en aplicaciones de mensajería usadas por adolescentes en Flandes y los Países Bajos. Se apoya en el backbone encoder jhu-clsp/mmBERT-base (307 millones de parámetros, familia ModernBERT) y añade una cabeza MLP que devuelve una probabilidad de bloqueo. No genera texto: decide entre permitir o bloquear, sin banda intermedia de revisión, y ante la ambigüedad bloquea.

Su interés práctico está en el coste por mensaje: 11,5 ms de mediana y 12,2 ms en p95 sobre GPU AMD para un mensaje individual, con un peso de 614 MB en bf16, lo que permite moderar de forma síncrona antes de que el mensaje salga del remitente. En su benchmark interno de 577 elementos obtiene un AUC de 0,945, detecta el 80,0 % del contenido dañino con un 6,5 % de falsos bloqueos y se publica con licencia MIT en safetensors, PyTorch y ONNX.

El modelo está diseñado para funcionar en cascada: los casos con probabilidad intermedia se derivan a un profesor mayor (SingGuard-4B), de modo que solo alrededor del 7 % del tráfico requiere el modelo grande. Esa arquitectura de dos niveles, junto con la latencia y el tamaño reducido del estudiante, es lo que lo hace relevante frente a desplegar directamente un modelo de miles de millones de parámetros en cada mensaje.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder ModernBERT (backbone jhu-clsp/mmBERT-base) con cabeza MLP de clasificación 768→256 (GELU)→1, dropout 0,1 |
| Parámetros totales | 307.136.769 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 512 tokens; ámbito de producto declarado: 1-250 caracteres |
| Tipos de cuantización | bf16 (recomendada); INT8 no disponible |
| Idiomas soportados | neerlandés (incluido flamenco) e inglés |
| Licencia | MIT |
| Formato de pesos | safetensors, PyTorch (.pt), ONNX |

## Arquitectura y entrenamiento

El modelo es un encoder bidireccional de la familia ModernBERT sobre el checkpoint jhu-clsp/mmBERT-base, coronado por una cabeza MLP que proyecta la representación de 768 dimensiones a 256 con activación GELU, aplica dropout de 0,1 y emite un único logit que se interpreta como probabilidad de bloqueo mediante sigmoide. La entrada se trunca a 512 tokens, aunque el ámbito de producto está fijado en mensajes de 1 a 250 caracteres, lo que sitúa la mayoría de peticiones muy por debajo del límite del contexto.

El entrenamiento combina dos objetivos: entropía cruzada binaria sobre etiquetas duras construidas como unión de los profesores (SingGuard-4B ∪ Nemotron-3.5, se bloquea si cualquiera de los dos bloquea) y destilación KL sobre las probabilidades suaves del profesor con temperatura T=2. No hay SFT, DPO ni RL. El conjunto de entrenamiento tiene 73.000 ejemplos (pool público, aumento de datos específico de flamenco y 1.300 filas escritas a mano) y 1.500 de desarrollo. En las filas manuscritas se aplica la regla «gold-wins»: se usan las etiquetas humanas aunque los profesores se equivoquen, algo que ocurre en el 13 % de esos casos. El umbral de decisión, 0,84, se seleccionó únicamente sobre el split de desarrollo, dejando el benchmark intacto. La elección del backbone se justificó con una comparación A/B frente a MrBERT (febrero de 2026), en la que mmBERT obtuvo 0,945 de AUC frente a 0,869.

## Capacidades

- Clasificación binaria de seguridad (bloquear/permitir) sobre mensajes cortos en neerlandés e inglés, con salida probabilística continua.
- Cobertura de categorías medida en el benchmark: armas, drogas y ciberdelincuencia (90,0 % de detección), acoso y odio (86,2 %), amenazas y violencia (85,7 %), autolesión (84,0 %), ofuscación y bypass (76,0 %), contenido sexual adulto o trastornos alimentarios (71,4 %), PII y doxxing (70,6 %), estafas y suplantación (70,0 %), inyección de prompt (70,0 %) y contenido sexual con menores (50,0 % sobre solo 6 elementos).
- Manejo de code-switching neerlandés/inglés y de jerga flamenca, con falsos bloqueos del 12,5 % y 5,0 % respectivamente en las rodajas benignas correspondientes.
- Robustez parcial frente a ofuscación e intentos de inyección, integrada en el propio conjunto de evaluación.
- No soporta tool calling, function calling, uso como agente, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador.
- Salida calibrada para umbral fijo y para enrutado en cascada (tres bandas: permitir, bloquear, escalar).
- Inferencia en CPU sin PyTorch mediante el grafo ONNX, lo que habilita despliegues en entornos sin GPU.

## Casos de uso

- Moderación pre-envío en aplicaciones de chat para adolescentes: el modelo se ejecuta en el camino crítico del envío y, con 11,5 ms por mensaje, puede bloquear contenido dañino antes de que llegue al destinatario sin introducir una latencia perceptible en la conversación.
- Cascada de moderación a escala: con los umbrales recomendados (permitir por debajo de 0,25, bloquear por encima de 0,70 y escalar la franja intermedia a SingGuard-4B), solo cerca del 7 % del tráfico consume el modelo grande, lo que reduce el coste de inferencia en más de un orden de magnitud manteniendo un 89 % de detección end-to-end.
- Detección de estafas y suplantación en comunidades flamencas y neerlandesas: el modelo identifica patrones como «gratis robux, geef je wachtwoord door» y otros intentos de ingeniería social dirigidos a menores.
- Filtrado de PII y doxxing en mensajes cortos dentro de foros o salas de chat: la detección se aplica antes de publicar y permite retener el mensaje o enmascarar datos personales según política.
- Moderación de contenido autolesivo con derivación a recursos de ayuda: cuando el mensaje se clasifica como autolesión, la aplicación puede mostrar líneas de apoyo en lugar de descartar silenciosamente el mensaje.
- Protección frente a inyección de prompt en asistentes conversacionales: aunque el modelo es un clasificador y no un LLM, puede colocarse delante de un agente para marcar entradas que intentan manipular instrucciones del sistema.
- Despliegue en regiones con infraestructura limitada: el grafo ONNX de 1,2 GB (617 MB en bf16) permite ejecutar la moderación en CPU, sin GPU, en instalaciones autoalojadas.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un benchmark de 577 elementos, con la inyección excluida del cómputo global.

| Métrica | Valor |
|---|---|
| Elementos evaluados | 577 |
| Contenido dañino detectado | 80,0 % |
| Falsos bloqueos («false walls») | 6,5 % |
| Precisión (accuracy) | 89,3 % |
| AUC | 0,945 |
| Errores | 62/577 |

| Idioma | n | Detectado | Falsos bloqueos | Precisión |
|---|---|---|---|---|
| Neerlandés | 368 | 80,2 % | 8,1 % | 88,9 % |
| Inglés | 209 | 79,8 % | 3,2 % | 90,0 % |

| Versión | AUC | Detectado @ falsos bloqueos | Precisión | Errores |
|---|---|---|---|---|
| v0 | 0,905 | 61,7 % @ 6,8 % | 83,4 % | 96 |
| v1 | 0,921 | 67,8 % @ 6,8 % | 85,3 % | 85 |
| v2 (publicada) | 0,945 | 80,0 % @ 6,5 % | 89,3 % | 62 |
| v3 | 0,950 | 81,7 % @ 7,3 % | 89,3 % | 62 |
| MrBERT (A/B) | 0,869 | 57,2 % @ 5,5 % | 82,8 % | 99 |

## Requisitos de hardware

- Pesos: 1,2 GB en fp32 y 614 MB en bf16; los ficheros ONNX ocupan 1,2 GB y 617 MB respectivamente.
- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en bf16 y 2,5-3 GB en fp32 con lotes pequeños. Es una estimación a partir del tamaño de los pesos y de la activación de un encoder de 307M; el autor no publica cifras de VRAM.
- GPU recomendadas: cualquier GPU con 4 GB o más sirve; una RTX 3060 de 12 GB, una RTX 4060 o una GTX 1660 de 6 GB son suficientes y dejan margen para otros procesos. En centros de datos, A100 y H100 están sobredimensionadas para este modelo y solo se justifican por agregación de tráfico, no por requisitos de memoria.
- Cabe en GPU de consumo: sí, con holgura, incluida la variante bf16.
- Despliegue: PyTorch/Transformers con el módulo `model.py` del repositorio, ONNX Runtime para CPU, y orquestadores tipo Triton Inference Server o endpoints gestionados de Hugging Face. No aplica vLLM ni TGI, al no ser un modelo generativo.
- Latencia: p50 de 11,5 ms y p95 de 12,2 ms por mensaje individual en GPU AMD. El throughput agregado no está publicado; puede aumentarse por batching, ya que la entrada máxima es de 512 tokens.
- En CPU solo se documenta la ruta ONNX; no se publican cifras de latencia para ese backend.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| send-gate-307m | 307M | 512 tokens | AUC 0,945; 80,0 % detectado @ 6,5 % de falsos bloqueos | MIT | Hugging Face (yamura4) |
| MrBERT (A/B de febrero de 2026) | no disponible | no disponible | AUC 0,869; 57,2 % detectado @ 5,5 % | no disponible | no disponible |
| SingGuard-4B (profesor) | ~4B | no disponible | no disponible como clasificador independiente | no disponible | no disponible |
| jhu-clsp/mmBERT-base (backbone) | 307M | no disponible en la información proporcionada | no disponible; no es un clasificador de seguridad | no disponible | Hugging Face (jhu-clsp) |
| Vela 1.0 Encoder 307M | 307M | no disponible | no disponible | no disponible | Hugging Face (vllm-sr) |

La comparación más directa y con datos es la de MrBERT, que pierde 7,6 puntos de AUC y 22,8 puntos de detección frente a send-gate-307m con un umbral de falsos bloqueos similar. Vela 1.0 Encoder 307M comparte tamaño, pero pertenece a la familia de modelos de enrutado de vLLM Semantic Router y no se ha evaluado en la misma tarea de moderación, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- Idiomas: solo neerlandés (incluido flamenco) e inglés; cualquier otro idioma queda fuera de alcance y no debe asumirse un comportamiento fiable.
- Longitud: el ámbito de producto es de 1 a 250 caracteres. Mensajes más largos, aunque quepan en los 512 tokens, no están cubiertos por la evaluación.
- Decisión binaria sin banda de revisión: la ambigüedad se resuelve bloqueando, lo que penaliza casos límite legítimos.
- Evaluación de paráfrasis: el propio autor reporta un 15,1 % de falsos bloqueos, más del doble que el 6,5 % del benchmark principal; el rendimiento en texto reformulado es peor de lo que sugiere la tabla.
- Rodajas pequeñas: categorías como contenido sexual con menores tienen solo 6 elementos, con intervalos de confianza muy amplios; el 50 % de detección no debe interpretarse como una tasa estable.
- Amenazas y violencia: aunque detecta el 85,7 % de los casos dañinos, también bloquea el 75,0 % de los mensajes benignos de esa misma categoría, lo que en la práctica hace inviable usar el modelo aislado para esa clase.
- Umbral: 0,84 se eligió sobre el split de desarrollo y el autor advierte de que puede requerir recalibración en producción.
- Cuantización: INT8 no está disponible. El cuantizador de ONNX Runtime falla con la atención de ModernBERT (errores de broadcasting en DequantizeLinear) y la cuantización dinámica de PyTorch degrada la detección del 80 % al 43 %. bf16 es la única alternativa de reducción viable.
- Licencia MIT: permite uso comercial y modificación, pero no incluye garantías ni cláusulas de indemnización; el despliegue en un producto dirigido a menores exige revisión legal y de protección de datos independiente.
- Documentación: el README incluye residuos de un script de publicación (líneas `EOF`, `echo`, `wc -l`), lo que sugiere un proceso de publicación poco pulido; conviene verificar los artefactos antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamura4/send-gate-307m
- Backbone mmBERT-base (ICML 2026): https://huggingface.co/jhu-clsp/mmBERT-base
- Perfil del autor: https://huggingface.co/yamura4
- Listado de modelos del autor: https://huggingface.co/yamura4/models
- Blog de Vela 1.0 (familia de encoders de 307M, contexto relacionado): https://vllm-sr.ai/blog/vela-models/
- Repositorio de vLLM Semantic Router con el registro de modelos Vela: https://github.com/vllm-project/semantic-router/blob/main/website/docs/tutorials/global/vela-models.md
- Ficha de Vela 1.0 Encoder 307M: https://free2aitools.com/model/vllm-sr/vela-1.0-encoder-307m
- Paper del backbone: no disponible en la información proporcionada.
