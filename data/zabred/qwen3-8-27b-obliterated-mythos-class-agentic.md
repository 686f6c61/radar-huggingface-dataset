# zabred/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic

## Resumen

Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic es un ajuste fino derivado de la cadena Qwen/Qwen3.8-27B → OBLITERATUS/Qwen3.8-27B-OBLITERATED, publicada en HuggingFace por el usuario «zabred», aunque la propia model card atribuye el trabajo a «medismera» y existe una réplica del repositorio bajo ese segundo nombre. Con 27.781.427.952 parámetros reales (27,78 B) y un repositorio de 55,6 GB, se presenta como una configuración «de producción» que corrige defectos del checkpoint abliterado original: plantilla de chat truncada a 506 bytes, llamadas a herramientas descartadas silenciosamente y bucles infinitos de razonamiento.

La propuesta técnica del autor se apoya en tres elementos: una plantilla Jinja2 canónica de 9,4 KB con 22 rutas de resolución de tool calling, un protocolo de razonamiento denominado Mythos-Class (autoevaluación adversarial y descomposición jerárquica en árbol de tareas) y una ampliación de ventana de contexto desde los 32.768 tokens nativos del checkpoint original hasta 131.072 tokens probados en producción y hasta 262.144 declarados. El techo de generación por turno se eleva a 16.384 tokens.

Es relevante ahora porque cubre un nicho concreto: modelos abliterados (sin rechazos de seguridad) que además funcionan como agentes con function calling estable, algo que en los checkpoints abliterados suele estar roto. La distribución se limita a safetensors (BF16, FP8 y AWQ), sin GGUF, y el YAML del repositorio marca `inference: false`, por lo que requiere despliegue propio en SGLang, vLLM u otros motores.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible con detalle. Las etiquetas del repositorio incluyen `mamba` y `linear-attention` y la etiqueta de arquitectura `qwen3_5`, lo que apunta a un transformer con componentes de atención lineal o estado recurrente, pero la model card no describe la arquitectura |
| Parametros totales | 27.781.427.952 (27,78 B) |
| Parametros activos | No disponible (no se declara que sea MoE) |
| Longitud de contexto | 32.768 tokens en el checkpoint upstream; 131.072 tokens probados en producción; hasta 262.144 tokens (256K) declarados por el autor |
| Tipos de cuantizacion | BF16 / precisión completa, FP8 (8 bits) y AWQ (4 bits). No se ofrecen GGUF ni GPTQ |
| Idiomas soportados | Inglés (en), chino (zh) y árabe (ar) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (29 shards en BF16, 2 shards en FP8; AWQ con MTP + Marlin). Sin GGUF |

## Arquitectura y entrenamiento

La model card no documenta el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF, DPO o similares), por lo que esos datos no están disponibles. Lo que sí describe es el trabajo de post-procesado sobre el checkpoint abliterado: sustitución de la plantilla de chat truncada por una plantilla Jinja2 canónica de 9,4 KB con 22 rutas de resolución de tool calling, corrección de los tags de razonamiento invertidos y de los bucles infinitos de cadena de pensamiento, y ampliación de la ventana de contexto y del techo de generación.

El elemento diferencial es el protocolo Mythos-Class, incrustado directamente en la plantilla de tokenización. Consiste en un bloque de instrucciones que obliga al modelo, dentro de las etiquetas `<think>`, a descomponer el objetivo en un árbol de tareas dirigido (análisis → verificación → implementación), aplicar autoevaluación adversarial sobre hipótesis y casos límite, y converger cerrando el bloque de razonamiento sin repetir dudas. La model card ilustra el flujo con una jerarquía de fases (reconocimiento, análisis de vulnerabilidades, generación de exploit, validación). También se documenta un ajuste de muestreo anti-bucle: temperatura 0,65, penalización por repetición 1,15 y penalización por presencia 0,15.

## Capacidades

- Generación de texto conversacional y de propósito general en inglés, chino y árabe.
- Razonamiento con modo de pensamiento explícito (`<think>`) y protocolo de autoevaluación adversarial.
- Descomposición jerárquica de tareas en árboles dirigidos (Task Tree Decomposition).
- Tool calling y function calling nativos, con 22 rutas de resolución declaradas en la plantilla de chat; compatibilidad mencionada con Hermes Agent, Aider y OpenCode.
- Ejecución de flujos agénticos multi-paso con verificación y convergencia.
- Generación de código y de scripts ejecutables (el ejemplo de la model card incluye generación y ejecución de exploits).
- Ventana de contexto larga para documentos y sesiones prolongadas (hasta 131.072 tokens probados).
- Sin alineación de seguridad: responde a peticiones que el modelo base rechazaría, incluidas prácticas de seguridad ofensiva y red team.
- No se declaran capacidades de visión, audio ni otras modalidades.

## Casos de uso

- Agentes de seguridad ofensiva y red team: el modelo está explícitamente orientado a fases de reconocimiento, análisis de vulnerabilidades, generación de exploits y validación, con tool calling nativo para terminal, lectura y escritura de ficheros. Es adecuado por su ausencia de rechazos y por la descomposición en árbol de tareas.
- Automatización de pipelines de CI/CD con agentes: el soporte de function calling estable permite invocar herramientas externas (ejecución de tests, consulta de repositorios, apertura de incidencias) dentro de flujos multi-paso.
- Asistente de programación integrado en IDE: la compatibilidad declarada con Aider y OpenCode y el techo de 16.384 tokens por turno permiten refactorizaciones y generación de parches extensos en una sola respuesta.
- Análisis de documentos largos y bases de código: con 131.072 tokens de contexto probados, puede procesar repositorios completos o contratos extensos sin troceado agresivo.
- Atención al cliente multilingüe: cubre inglés, chino y árabe, con conversaciones multi-turno y contexto largo, aunque sin capa de seguridad que filtre respuestas inapropiadas.
- Investigación sobre alineación y comportamiento de modelos: al ser un checkpoint abliterado con razonamiento explícito, sirve para estudiar cómo se degrada la seguridad y cómo se comportan los bucles de CoT cuando se eliminan los rechazos.
- Despliegue en hardware de consumo: la rama AWQ de 4 bits cabe en una sola GPU de 24 GB, lo que habilita agentes locales de 27 B en estaciones de trabajo con RTX 3090, RTX 4090 o A5000.
- Automatización de tareas de sistema con verificación: el flujo de cuatro fases propuesto (reconocimiento, análisis, generación, validación) encaja en tareas de administración de sistemas donde cada paso debe comprobarse antes de ejecutarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los resultados de búsqueda no incluyen cifras de MMLU, HumanEval, GSM8K, SWE-bench ni de ninguna otra evaluación comparativa.

## Requisitos de hardware

- BF16 / precisión completa: aproximadamente 60 GB de VRAM. Requiere 2× A100, 2× RTX 4090 o 1× H100. Motores compatibles: SGLang, vLLM, TGI, TRT-LLM.
- FP8 (8 bits): aproximadamente 30 GB de VRAM. Cabe en 1× A100 (40 GB u 80 GB) o 2× RTX 3090/4090. Motores: SGLang, vLLM.
- AWQ (4 bits): aproximadamente 16 GB de VRAM. Cabe en una única GPU de 24 GB (RTX 3090, RTX 4090, A5000). Motores: SGLang, vLLM, LMDeploy.
- Enconsumer GPU: solo la rama AWQ es viable en una GPU de consumo; BF16 y FP8 exigen dos GPU o hardware de centro de datos.
- Opciones de despliegue documentadas: SGLang (recomendado por el autor, con RadixAttention), vLLM, TGI, TRT-LLM y LMDeploy. No hay soporte GGUF, por lo que llama.cpp y Ollama no son opciones directas.
- Configuración de despliegue sugerida: `--context-length 131072`, `--reasoning-parser qwen3` y `--tool-call-parser qwen3_coder` en SGLang; `--tool-call-parser hermes` y `--enable-auto-tool-choice` en vLLM; caché KV en `fp8_e5m2`.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic | 27,78 B | 32.768 nativo; 131.072 probados; 262.144 declarados | Nativo, plantilla Jinja2 de 9,4 KB con 22 rutas | Apache 2.0 | Safetensors en HuggingFace (BF16, FP8, AWQ) |
| OBLITERATUS/Qwen3.8-27B-OBLITERATED (upstream) | 27,78 B (derivado) | 32.768 nativo | Roto: descarte silencioso de `role: "tool"`; plantilla truncada a 506 bytes | No disponible | Safetensors en HuggingFace |
| Qwen/Qwen3.8-27B (base) | 27,78 B (no confirmado en la informacion) | No disponible | No disponible | No disponible | HuggingFace y GitHub (QwenLM/Qwen3.8) |

No se dispone de modelos comparables adicionales con datos verificables en la información proporcionada, ni de cifras de rendimiento que permitan una comparación cuantitativa entre los tres.

## Limitaciones y advertencias

- Modelo abliterado: se han eliminado los rechazos duros y las «desviaciones suaves» de seguridad. No debe desplegarse en aplicaciones orientadas al público sin una capa externa de moderación.
- Riesgo elevado de contenido dañino: la model card promueve explícitamente flujos de generación de exploits y de elusión de filtros. El uso en seguridad ofensiva sin autorización puede ser ilegal según la jurisdicción.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni de tasas de alucinación; el protocolo de autoevaluación es una instrucción de prompt, no una garantía de veracidad.
- Idiomas limitados a inglés, chino y árabe. No se declara soporte de español ni de otras lenguas.
- El YAML del repositorio marca `inference: false`, por lo que la inferencia gestionada de HuggingFace no está habilitada.
- Discrepancia de autoría: el identificador del repositorio es `zabred`, pero la model card y una réplica apuntan a `medismera`. Conviene verificar la procedencia antes de usarlo en producción.
- Sin resultados de benchmarks ni métricas de calidad publicadas. Las afirmaciones de la model card (contexto de 256K, tool calling al 100 %, 22 rutas de resolución) son del autor y no están verificadas de forma independiente.
- El repositorio se creó y actualizó el 29 de septiembre de 2026 con 0 descargas y 0 «likes» en el momento de los datos de HuggingFace, por lo que no hay validación de la comunidad.
- Licencia Apache 2.0 declarada para este checkpoint, pero no se especifica la licencia del modelo base Qwen/Qwen3.8-27B en la información disponible; conviene comprobar los términos de la cadena completa antes de un uso comercial.
- Sin soporte GGUF: no hay ruta directa a llama.cpp, Ollama o entornos de CPU.
- Requisitos de VRAM altos para las ramas BF16 y FP8, lo que limita el despliegue a hardware profesional o configuraciones multi-GPU.

## Enlaces

- Repositorio en HuggingFace (zabred): https://huggingface.co/zabred/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Réplica en HuggingFace (medismera): https://huggingface.co/medismera/Qwen3.8-27B-OBLITERATED-Mythos-Class-Agentic
- Modelo base abliterado: https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED
- Discusión #7 del modelo base (bucles de razonamiento): https://huggingface.co/OBLITERATUS/Qwen3.8-27B-OBLITERATED/discussions/7
- Ficha en LLM Explorer: https://llm-explorer.com/model/medismera%2FQwen3.8-27B-OBLITERATED-Mythos-Class-Agentic,1z5HmsXMznOSZ3ArL6LBhE
- Repositorio GitHub con copia del modelo base: https://github.com/bigguy8585/ai/tree/main/Qwen3.8-27B-OBLITERATED
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
