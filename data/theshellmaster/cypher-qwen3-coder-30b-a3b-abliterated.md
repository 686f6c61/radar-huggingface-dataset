# TheShellMaster/cypher-Qwen3-Coder-30B-A3B-abliterated

## Resumen

Cypher Qwen3-Coder-30B-A3B-abliterated es una distribución GGUF publicada por TheShellMaster bajo la etiqueta Cypher Studio, derivada de la familia Qwen3-Coder de Alibaba. Se trata de una variante "abliterated" (con los mecanismos de rechazo suprimidos mediante edición de direcciones de activación) del modelo instruct de código Qwen3-Coder-30B-A3B, cuantizada en formato i1-Q4_K_M con matriz de importancia (imatrix) y empaquetada para su uso con `llama-server --jinja`.

El modelo conserva la arquitectura Mixture-of-Experts del original: 30.532.122.624 parámetros totales con aproximadamente 3.300 millones activos por token, lo que permite un rendimiento de inferencia propio de un modelo mucho menor a coste de VRAM de un modelo de 30B. Está pensado para despliegues en hardware modesto, concretamente dos GPU T4 (30 GB de VRAM combinada) en entornos tipo Kaggle, con velocidades declaradas de 25-27 tokens por segundo.

Su relevancia actual radica en tres factores: la licencia Apache 2.0 (permisiva para uso comercial), el soporte nativo de tool calling y la ventana de contexto declarada de 64K a 256K tokens. La variante abliterated elimina las negativas del modelo a ciertas peticiones, lo que tiene implicaciones legales y de seguridad que se detallan en la sección de limitaciones.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), transformer, derivada de Qwen3-Coder |
| Parámetros totales | 30.532.122.624 (30,5B) |
| Parámetros activos | ~3,3B por token |
| Longitud de contexto | 64K-256K según la model card (no verificado de forma independiente) |
| Tipos de cuantización | i1-Q4_K_M (imatrix), 17,28 GiB; otras cuantizaciones disponibles en el repo base de mradermacher |
| Idiomas soportados | no disponible (la model card no los enumera; el modelo base Qwen3-Coder es multilingüe) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 18,6 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-Coder-30B-A3B, un transformer con capas de mezcla de expertos: 30,5B parámetros totales de los que solo ~3,3B se activan por token. Esta dispersión reduce el coste computacional por token hasta niveles comparables a un modelo denso de 3B, manteniendo la capacidad representacional de un modelo de 30B. El modelo original fue entrenado por Alibaba con un pipeline de preentrenamiento sobre código y texto, seguido de ajuste instructivo; la model card de esta distribución no aporta detalles sobre el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

La contribución específica de esta ficha es doble. Primero, la "abliteración": la supresión de la dirección de rechazo en el espacio de activaciones, técnica que elimina el comportamiento de negativa del modelo ante ciertas peticiones sin reentrenar. Segundo, la cuantización i1-Q4_K_M con imatrix, que pondera la precisión de cuantización según la importancia de cada peso medida sobre un corpus de calibración, reduciendo la degradación respecto a una cuantización Q4_K_M estándar. El resultado se empaqueta para `llama-server --jinja`, lo que habilita el uso de plantillas de chat Jinja y, con ellas, el tool calling nativo. El modo directo elimina la latencia asociada al bloque `<think>` del modelo original.

## Capacidades

- Generación de código en múltiples lenguajes, con especial énfasis en tareas de agente de programación.
- Tool calling nativo, habilitado mediante la plantilla Jinja en `llama-server`.
- Razonamiento multi-paso y uso como agente autónomo de código (el autor lo describe como "agente de código de alta velocidad").
- Modo directo sin bloque `<think>`, lo que reduce la latencia en comparación con el modo de razonamiento extendido.
- Contexto largo de 64K a 256K tokens según la model card, adecuado para repositorios completos o conversaciones prolongadas.
- Capacidades multilingües heredadas del modelo base Qwen3-Coder (no detalladas en la model card).
- Comportamiento sin rechazo ante peticiones que el modelo original declinaría (efecto de la abliteración).

## Casos de uso

- Agente de código en entornos con GPU limitada: con dos T4 (30 GB) y la cuantización i1-Q4_K_M de 17,28 GiB, el modelo cabe en VRAM y ofrece 25-27 tok/s, suficiente para bucles de agente interactivos en notebooks de Kaggle o instancias cloud económicas.
- Asistencia de programación en IDE mediante servidor local: desplegado con `llama-server --jinja`, expone una API compatible con OpenAI que se integra en extensiones de editor para autocompletado y edición guiada por instrucciones.
- Automatización de refactorizaciones sobre repositorios grandes: la ventana de contexto de hasta 256K tokens permite cargar múltiples ficheros y aplicar cambios coherentes entre ellos en una sola pasada.
- Pipelines de CI/CD con tool calling: el modelo puede invocar herramientas (ejecutar tests, consultar APIs, leer ficheros) dentro de un flujo de verificación automática, aprovechando el soporte nativo de function calling.
- Generación de tests y documentación técnica: a partir de código fuente y especificaciones, el modelo produce suites de pruebas y documentación con contexto suficiente para cubrir módulos completos.
- Investigación sobre alineación y seguridad: la variante abliterated sirve como objeto de estudio para medir qué comportamientos se suprimen con la edición de direcciones de rechazo y cómo afecta a la calidad general, en entornos controlados.
- Despliegue soberano en infraestructura propia: la licencia Apache 2.0 y el formato GGUF permiten ejecutar el modelo en servidores on-premise sin dependencia de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente declara un throughput de aproximadamente 25-27 tokens por segundo sobre 2x T4 con la cuantización i1-Q4_K_M. No hay datos de MMLU, HumanEval, GSM8K ni de comparación con el modelo base sin abliterar.

## Requisitos de hardware

- VRAM estimada para inferencia: ~17,3 GiB con i1-Q4_K_M; cuantizaciones menores del repo base (Q3, Q2) reducirían el requisito a costa de calidad.
- GPU recomendadas: 2x NVIDIA T4 (16 GB cada una, 30 GB combinados) es el objetivo declarado por el autor; también cabe en una única GPU de 24 GB (RTX 3090, RTX 4090, A10G) con Q4_K_M.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) con Q4_K_M; en GPUs de 16 GB requeriría cuantizaciones Q3 o inferiores, o descarga parcial a CPU.
- Opciones de despliegue: `llama-server` con `--jinja` (objetivo principal del autor), llama.cpp, y cualquier runtime compatible con GGUF (Ollama, LM Studio); vLLM y TGI requerirían los pesos originales en safetensors, no incluidos en este repo.
- Latencia y throughput: ~25-27 tok/s sobre 2x T4 según la model card; no hay mediciones independientes ni datos para otras configuraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Cypher Qwen3-Coder-30B-A3B-abliterated | 30,5B | ~3,3B | 64K-256K (declarado) | Apache 2.0 | GGUF | Variante abliterated, sin benchmarks publicados |
| Qwen3-Coder-30B-A3B-Instruct (original) | 30,5B | ~3,3B | 256K (según Qwen) | Apache 2.0 | safetensors, GGUF | Modelo de referencia con rechazos intactos y benchmarks oficiales |
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated | 30,5B | ~3,3B | 256K (heredado) | Apache 2.0 | safetensors, GGUF | Fuente directa de esta cuantización; sin empaquetado específico para llama-server |
| mradermacher i1-GGUF del anterior | 30,5B | ~3,3B | 256K (heredado) | Apache 2.0 | GGUF | Repo base del que se deriva esta ficha; incluye múltiples cuantizaciones i1 |

La diferencia práctica entre esta ficha y el repo de mradermacher es el empaquetado y la orientación a `llama-server --jinja` en 2x T4; los pesos subyacentes son los mismos. Frente al Qwen3-Coder original, la diferencia es la abliteración y la ausencia de validación oficial.

## Limitaciones y advertencias

- La abliteración suprime los rechazos del modelo: puede generar contenido dañino, ilegal o inseguro ante peticiones que el modelo original declinaría. No es apto para aplicaciones de cara al público sin filtros externos.
- No hay benchmarks publicados de esta variante; se desconoce cuánto degrada la abliteración y la cuantización Q4_K_M el rendimiento en código y razonamiento respecto al original.
- El contexto de 256K está declarado en la model card pero no verificado de forma independiente; la calidad en ventanas muy largas con Q4_K_M puede degradarse.
- La model card está redactada parcialmente en francés y no detalla la composición del dataset de entrenamiento ni los idiomas soportados.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad legal del contenido generado por un modelo sin rechazos.
- El repo solo contiene GGUF; para servir con vLLM o TGI hay que recurrir a los pesos originales del modelo base.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de comunidad ni de validación por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/TheShellMaster/cypher-Qwen3-Coder-30B-A3B-abliterated
- Modelo base (GGUF): https://huggingface.co/mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo abliterated de Huihui (origen): https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Modelo original Qwen3-Coder-30B-A3B-Instruct: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Repositorio llama.cpp (runtime objetivo): https://github.com/ggml-org/llama.cpp
