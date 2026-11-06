# Techions/Umochi-60K-WSP

## Resumen

Umochi-60K-WSP es un modelo de generación de texto especializado en código, desarrollado por Techions (con atribución en la model card a Strata Systems y NodiGuard Cyber-Defense Labs) y construido sobre Qwen2.5-Coder-32B-Instruct mediante una técnica que el autor denomina Weight-Space Programming (WSP). Su objetivo declarado es cubrir dos nichos concretos: el desarrollo Java 21+ de alto rendimiento (Netty, Project Loom, Spring Boot) y la creación de escenas 3D con Three.js y WebGPU. Se distribuye en formato GGUF y con licencia Apache 2.0.

El modelo parte de la arquitectura transformer de Qwen2.5-Coder-32B-Instruct, con una ventana de contexto declarada de 61.440 tokens (60K). El autor publica una model card con tono de whitepaper técnico y un conjunto de benchmarks propios orientados a tareas de ingeniería consideradas difíciles, además de resultados en MultiPL-E para Java y JavaScript.

La relevancia del modelo es discutible y debe evaluarse con cautela: el repositorio no contiene pesos (tamaño de 0.0 GB), las descargas son cero y los benchmarks presentados no están verificados (`verified: false`), además de incluir métricas de elaboración propia sin validación externa. Es, por tanto, una ficha que documenta una publicación de la que existe muy poca información contrastable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen2.5-Coder-32B-Instruct) |
| Parámetros totales | 32B (modelo base); el campo de safetensors del repo indica 120.320, dato inconsistente con el modelo base |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 61.440 tokens (60K), según la model card |
| Tipos de cuantización | GGUF (el repositorio está etiquetado como gguf; no se detallan los niveles concretos) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (según tags); no se indica presencia de safetensors en el repo |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura interna más allá de su base: Qwen2.5-Coder-32B-Instruct, un transformer decoder-only de 32B parámetros. El autor afirma que el modelo ha sido "re-arquitecturado" mediante Weight-Space Programming (WSP), una técnica que no se detalla en la documentación proporcionada ni se referencia con un paper o descripción metodológica. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado.

Tampoco se documentan innovaciones técnicas verificables como decodificación especulativa, atención lineal o modos de razonamiento extendido. La model card menciona "MTP 4-Draft" en la tabla de latencias, lo que sugeriría multi-token prediction con cuatro borradores, pero no se aporta ninguna descripción técnica al respecto. En resumen: la arquitectura es la del modelo base y el proceso de especialización no está documentado de forma reproducible.

## Capacidades

- Generación de código Java orientada a entornos de producción: Netty (ciclos de vida de ByteBuf, zero-copy, detección de fugas con nivel PARANOID), Project Loom (hilos virtuales, aislamiento de carrier threads, pinned threads) y Spring Boot.
- Generación de código JavaScript y escenas Three.js/WebGPU: instancing con `InstancedMesh`, materiales físicos (`MeshPhysicalMaterial`), tone mapping ACESFilmic y síntesis de audio procedural con Web Audio.
- Generación de texto general y respuestas conversacionales, heredadas del modelo base.
- Soporte de tool calling y function calling: no confirmado en la información disponible (el modelo base Qwen2.5-Coder-Instruct lo soporta, pero no se documenta para esta variante).
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- No se documentan capacidades de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Revisión de pipelines Netty en producción: el modelo puede generar y auditar decodificadores de frames con `ByteBuf` zero-copy y proponer correcciones para evitar fugas de memoria bajo `-Dio.netty.leakDetection.level=PARANOID`, un escenario en el que los errores son costosos y difíciles de detectar en pruebas.
- Migración a hilos virtuales de Java 21: serviría para reescribir bloques de código bloqueante que provocan pinning de carrier threads y para diagnosticar con `-Djdk.tracePinnedThreads=full`, reduciendo el trabajo manual de auditoría en servicios con alta concurrencia.
- Asistencia en el desarrollo de APIs con Spring Boot: generación de controladores, configuración de seguridad y defensas frente a SSRF/TOCTOU en servicios expuestos, aprovechando el enfoque del modelo en seguridad de aplicaciones web Java.
- Creación de visualizaciones 3D eficientes con Three.js: generación de escenas con batching por `InstancedMesh` para reducir draw calls, útil en dashboards o demos interactivas que deben mantener 60 fps en navegador.
- Prototipado de experiencias WebGPU: el modelo puede producir código de shaders y configuración de render pipelines para experimentos de gráficos en el navegador, un área con poca documentación práctica.
- Generación de audio procedural en web: síntesis con Web Audio API para efectos de sonido en aplicaciones interactivas, integrada en el mismo flujo de desarrollo frontend.
- Asistente de código en IDE para equipos Java: con formato GGUF y licencia Apache 2.0, podría desplegarse en local para autocompletado y explicación de código sin enviar propiedad intelectual a servicios externos, siempre que los pesos estén realmente disponibles.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Generación de código Java | MultiPL-E (multiple-java) | Pass@1 | 76,82 |
| Generación de código Java | MultiPL-E (multiple-java) | Pass@10 | 88,45 |
| Generación de código JavaScript | MultiPL-E (multiple-js) | Pass@1 | 81,24 |
| Generación de código JavaScript | MultiPL-E (multiple-js) | Pass@10 | 91,60 |
| Resolución de bugs | SWE-bench Java Lite | Pass Rate | 100,0 |
| Fugas en Netty zero-copy | Netty Composite Zero-Copy (PARANOID) | Leak Free Pass Rate | 100,0 |
| Pinning de hilos virtuales | Loom 50K Thread Carrier Pinning Gate | Non-Pinning Pass Rate | 100,0 |
| Gráficos 3D Three.js | Three.js InstancedMesh WebGPU Benchmark | Anti-Slop Audit Score | 100,0 |

Las tres últimas filas corresponden a benchmarks propios del autor, sin validación independiente ni descripción pública de la metodología. Los resultados de latencia de la model card (TTFT de 380 ms, 52,4 tok/s, latencia total de 20,8 s) se presentan en una comparativa con modelos propietarios no identificables de forma verificable y deben tratarse como afirmaciones del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 32B en GGUF, las estimaciones habituales serían aproximadamente 20-24 GB en cuantización Q4_K_M, 14-18 GB en Q3 y 40-48 GB en Q8, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no especificadas. Por tamaño, un modelo de 32B en Q4 requiere GPUs con 24 GB o más (RTX 3090, RTX 4090, A6000, A100 40/80 GB, H100).
- ¿Cabe en GPU de consumo? Previsiblemente sí en RTX 3090/4090 con cuantizaciones de 4 bits, pero no hay confirmación del autor ni pesos publicados para probarlo.
- Opciones de despliegue: llama.cpp y Ollama son las vías naturales para GGUF; vLLM y TGI requerirían pesos en safetensors, no confirmados en el repositorio.
- Latencia y throughput: el autor declara 380 ms de TTFT y 52,4 tok/s con decodificación MTP 4-Draft, sin especificar el hardware empleado. No verificable.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Umochi-60K-WSP | 32B (base) | 60K | Apache 2.0 | GGUF, repo sin pesos (0.0 GB) | Benchmarks propios no verificados |
| Qwen2.5-Coder-32B-Instruct | 32B | 128K | Apache 2.0 | Pesos completos en safetensors y GGUF | Modelo base; benchmarks públicos y reproducibles |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (MoE, 2,4B activos) | 128K | DeepSeek License (uso comercial con restricciones) | Pesos completos | Alternativa MoE más ligera en cómputo |
| CodeLlama-34B-Instruct | 34B | 16K | Llama 2 Community License | Pesos completos | Contexto menor y licencia más restrictiva |

La comparación más directa es con su propio modelo base, Qwen2.5-Coder-32B-Instruct, que ofrece el doble de contexto declarado (128K frente a 60K), pesos publicados y resultados verificables en benchmarks públicos. La ventaja declarada de Umochi-60K-WSP sería su especialización en Java empresarial y Three.js, pero al no haber pesos disponibles ni verificación externa, esa ventaja no puede contrastarse.

## Limitaciones y advertencias

- El repositorio no contiene pesos (tamaño de 0.0 GB) y registra cero descargas: no es posible ejecutar el modelo a partir de esta publicación.
- Todos los benchmarks están marcados como no verificados y varios emplean conjuntos de evaluación definidos por el propio autor, sin descripción metodológica pública.
- El campo de parámetros de safetensors (120.320) es incoherente con un modelo de 32B, lo que sugiere un repositorio mal configurado o incompleto.
- La técnica "Weight-Space Programming" no está documentada ni referenciada; no hay forma de evaluar qué se modificó respecto al modelo base.
- Idiomas limitados a inglés y chino: el castellano no está entre los idiomas declarados, por lo que el rendimiento en español es incierto.
- Riesgo de alucinación en código: como todo modelo generativo, puede producir APIs inexistentes o configuraciones plausibles pero incorrectas, especialmente en ecosistemas que evolucionan rápido como WebGPU o las APIs de hilos virtuales.
- Aunque la licencia es Apache 2.0, la procedencia de los pesos y del proceso de ajuste no está documentada, lo que complica las auditorías de cumplimiento en entornos corporativos.
- Las comparativas de latencia con modelos propietarios ("Gemini Argon", "DeepSeek V4-Flash") no son reproducibles ni verificables con la información disponible.
- No se documentan sesgos conocidos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Techions/Umochi-60K-WSP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-32B-Instruct
- Leaderboard del autor (Space): https://huggingface.co/spaces/Techions/Umochi-Enterprise-Java-3D-Leaderboard
- BigCode Leaderboard, PR #107: https://huggingface.co/spaces/bigcode/bigcode-models-leaderboard/discussions/107
- Open LLM Leaderboard, PR #114: https://huggingface.co/datasets/open-llm-leaderboard/requests/blob/refs%2Fpr%2F114/Techions/Umochi-60K-WSP_eval_request_False_bfloat16_Original.json
- BigCodeBench, petición #14: https://huggingface.co/spaces/bigcode/bigcodebench-leaderboard/discussions/14
- LiveCodeBench, petición #7: https://huggingface.co/spaces/livecodebench/leaderboard/discussions/7
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
