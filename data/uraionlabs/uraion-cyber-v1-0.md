# UraionLabs/Uraion-Cyber-V1.0

## Resumen

Uraion Cyber V1.0 es un modelo de mezcla de expertos (MoE) de 35B parámetros totales y 3B activos, afinado por Uraion Labs sobre Qwen/Qwen3.6-35B-A3B para trabajo en seguridad defensiva y tareas agénticas. El modelo recibe código, localiza el defecto, lo confirma ejecutándolo en un sandbox, genera un parche y verifica el parche; además, cuando el código es correcto, lo declara correcto en lugar de inventar una vulnerabilidad. Es relevante porque la mayoría de lo que revisa un analista de seguridad no es vulnerable, y un modelo que no sabe decir "esto está bien" no es utilizable en producción.

V1.0 sucede a una versión preview que el propio autor declaró no apta para publicación; esta build supera las puertas de release internas del laboratorio. Según los datos declarados por el autor, resuelve el 90,2% de las tareas de seguridad held-out (1033 de 1145) frente al 79,7% del modelo base, completa el 95,2% de los episodios agénticos multietapa (381 de 400) frente al 86,8%, y reconoce código correcto el 75,4% de las veces frente al 45,1%. Mantiene además instrucciones, tool calling y codificación en niveles altos, con una tasa de rechazo del 100% en 30 peticiones claramente dañinas de su gate.

La ficha se basa exclusivamente en la información publicada en Hugging Face y en la model card del autor. El repositorio tiene 0 descargas y 0 likes en el momento de redacción, y el modelo fue creado el 11 de noviembre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tag `qwen3_5_moe`), derivada de Qwen3.6-35B-A3B |
| Parametros totales | 35.951.822.704 (35,95B) |
| Parametros activos | 3B (denominación 35B-A3B) |
| Longitud de contexto | 256k tokens (según tags `long-context`, `256k-context`) |
| Tipos de cuantizacion | BF16 y FP8 mencionados en tags; no se detallan otras variantes publicadas |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (16 shards, ~72 GB en BF16) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del Qwen3.6-35B-A3B, una arquitectura MoE con 35,95B parámetros totales y aproximadamente 3B activos por token, lo que permite inferencia con un coste computacional muy inferior al de un denso del mismo tamaño. El contexto declarado es de 256k tokens, adecuado para auditar repositorios o ficheros de código extensos en una sola pasada. Los pesos se distribuyen en safetensors BF16 (16 shards, ~72 GB), con soporte declarado para vLLM y SGLang y variantes FP8.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. La model card menciona que las métricas de seguridad se obtuvieron ejecutando la respuesta del modelo en tareas held-out y fresh, lo que sugiere un pipeline de evaluación con ejecución real en sandbox, pero no se detalla la metodología de entrenamiento. Tampoco se documentan innovaciones técnicas específicas más allá de las heredadas del modelo base.

## Capacidades

- Generación de texto y razonamiento con modo thinking y cadena de pensamiento (tags `thinking`, `chain-of-thought`).
- Detección de vulnerabilidades: localización, confirmación y explotación en sandbox.
- Generación de parches y reparación de programas (patch-generation, program-repair).
- Auditoría de código y de seguridad (code-audit, security-audit).
- Tool calling y function calling, con soporte declarado para agentes.
- Razonamiento agéntico multietapa (episodios de hasta múltiples pasos con herramientas).
- Generación de código y ingeniería de software (HumanEval 96,3% pass@1).
- Capacidades de CTF y DevSecOps/SecOps según los tags del autor.
- Multilingüe limitado: solo inglés declarado.
- Visión: el pipeline es `image-text-to-text` y los tags incluyen esa categoría, aunque la model card se centra en texto y código.

## Casos de uso

- Revisión de código en pull requests: el modelo recibe el diff y el contexto del repositorio (hasta 256k tokens), localiza posibles defectos, confirma la explotabilidad ejecutando el código en sandbox y propone un parche verificado, integrándose como paso obligatorio antes del merge.
- Triaje de hallazgos de SAST: dado el volumen de falsos positivos de los analizadores estáticos, el modelo puede confirmar o descartar cada hallazgo con evidencia de ejecución, reduciendo la carga del equipo de AppSec.
- Generación de parches automáticos: ante un CVE o un defecto confirmado, el modelo produce el parche, lo aplica y lo valida, encajando en pipelines de CI/CD con tool calling para ejecutar tests y compilaciones.
- Agentes de SecOps: episodios multietapa en los que el modelo consulta logs, ejecuta comandos de diagnóstico, correlaciona evidencias y propone mitigaciones, con una tasa declarada del 95,2% de episodios completados.
- Auditoría de dependencias y código de terceros: el contexto largo permite cargar árboles de dependencias completos y revisar la superficie de ataque de librerías antes de adoptarlas.
- Formación y CTF: el modelo puede guiar la resolución de retos de seguridad paso a paso, explicando la lógica de explotación en entornos controlados.
- Despliegue autoalojado en entornos sensibles: al ser open weights con licencia MIT y ejecutable en vLLM/SGLang, puede desplegarse on-premise para que el código auditado no salga de la infraestructura de la organización.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Métrica | Resultado |
|---|---|---|
| Uraion Held-Out Security Suite (758 items) | pass@1 global | 89,8% (681/758) |
| Uraion Held-Out Security Suite | Confirmar defecto | 95,6% (258/270) |
| Uraion Held-Out Security Suite | Parchear defecto | 85,3% (180/211) |
| Uraion Held-Out Security Suite | Localizar defecto | 97,4% (151/155) |
| Uraion Held-Out Security Suite | Código correcto reconocido como correcto (tn_rate) | 75,4% (92/122) |
| Uraion Fresh Security Suite (387 items) | pass@1 global | 91,0% (352/387) |
| Uraion Fresh Security Suite | tn_rate | 86,7% (52/60) |
| Uraion Security Agent Episodes (400) | Episodios held-out | 95,0% (190/200) |
| Uraion Security Agent Episodes | Episodios fresh | 95,5% (191/200) |
| BFCL (Berkeley Function Calling Leaderboard) | accuracy global | 92,0% (368/400) |
| HumanEval | pass@1 | 96,3% (158/164) |
| HumanEval+ | pass@1 | 90,9% (149/164) |
| IFEval | prompt-level strict | 78,6% (425/541) |
| IFEval | instruction-level strict | 83,7% (698/834) |

Comparación con el modelo base declarada en la model card: 90,2% de tareas de seguridad resueltas (1033/1145) frente a 79,7% de Qwen3.6-35B-A3B; 95,2% de episodios agénticos (381/400) frente a 86,8%; y 75,4% de reconocimiento de código correcto frente a 45,1%.

## Requisitos de hardware

- VRAM estimada en BF16: ~72 GB de pesos, más overhead de KV cache; requiere GPUs de 80 GB (A100, H100) o configuraciones multi-GPU.
- FP8: reduce los pesos a ~36 GB, permitiendo despliegue en una sola H100 o A100 de 80 GB con margen para contexto largo.
- Consumer GPU: en BF16 no cabe en GPUs de consumo; en FP8/quantización de 4 bits podría aproximarse a 24 GB, pero no se documentan variantes GGUF ni cuantizaciones de 4 bits en la información disponible.
- Opciones de despliegue: vLLM y SGLang (soportados explícitamente), transformers para uso directo, y endpoints compatibles según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles; al ser MoE con 3B activos, la latencia esperada es la de un modelo de ~3B activos por token, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Uraion Cyber V1.0 | 35,95B | ~3B | 256k | MIT | Seguridad defensiva y agentes |
| Qwen/Qwen3.6-35B-A3B (base) | 35,95B | ~3B | no disponible | no disponible | Generalista |
| Uraion-Cyber-Preview | no disponible | no disponible | no disponible | MIT (según repo) | Seguridad, versión preview declarada no apta para release |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en seguridad en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés declarado; el rendimiento en castellano u otros idiomas no está documentado.
- Tasa de falsos positivos no despreciable: reconoce código correcto como correcto el 75,4% (held-out) y 86,7% (fresh), lo que implica que entre el 13% y el 25% del código sano puede marcarse como defectuoso.
- Tasa de parcheo del 85,3% en held-out: aproximadamente 1 de cada 7 parches generados no supera la validación.
- Todos los benchmarks son declarados por el autor y marcados como no verificados; no hay evaluación independiente publicada.
- Repositorio con 0 descargas y 0 likes en el momento de redacción: ecosistema y adopción aún sin consolidar, lo que reduce la disponibilidad de guías, integraciones y feedback de la comunidad.
- Licencia MIT permite uso comercial, pero el modelo se presenta como orientado a seguridad defensiva; el autor declara haber rechazado 30 peticiones claramente dañinas en su gate, sin que se documenten mecanismos de seguridad adicionales en producción.
- Riesgo de alucinación inherente a modelos generativos: las confirmaciones de vulnerabilidad deben validarse con ejecución real en sandbox, no solo con el texto del modelo.
- No se documentan sesgos conocidos ni datos de entrenamiento, lo que dificulta evaluar sesgos de dominio o de código.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Versión preview: https://huggingface.co/UraionLabs/Uraion-Cyber-Preview
- Licencia: https://huggingface.co/UraionLabs/Uraion-Cyber-V1.0/blob/main/LICENSE
- Sitio del laboratorio: https://uraionlabs.com/
- BFCL: https://github.com/gorilla-llm/Berkeley-Function-Calling-Leaderboard
- HumanEval: https://github.com/openai/openai_humaneval
- HumanEval+: https://github.com/evalplus/humanevalplus
- IFEval: https://github.com/google-research/google-research/tree/master/instruction_following_eval
