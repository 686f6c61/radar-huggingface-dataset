# weahoo/ASB-Qwen2.5-Coder-7B-Targeted-v2-GGUF

## Resumen

ASB-Qwen2.5-Coder-7B-Targeted-v2-GGUF es un derivado del modelo Qwen2.5-Coder-7B-Instruct de Alibaba Cloud, especializado mediante entrenamiento LoRA en flujos de trabajo de Automation Skill Builder (ASB), una plataforma de automatización local-first para escritorio, navegador y sistemas MCP. El modelo ha sido cuantizado a GGUF Q4_K_M por el autor weahoo, lo que permite su ejecución en hardware de consumo con herramientas como Ollama o LM Studio.

El modelo resuelve el problema de la automatización determinista de tareas: en lugar de depender de una llamada a IA en cada ejecución, ASB permite grabar un flujo de trabajo, compilarlo en lógica de ejecución determinista y ejecutarlo localmente sin IA en tiempo de ejecución. Este modelo actúa como componente de planificación y generación de código dentro de ese pipeline, con entrenamiento específico en convenciones de ASB como `_sb_get`, `_sb_typed_get` y `ai_sk_wire_preview`.

Con 7,6 mil millones de parámetros y una ventana de contexto de 49.152 tokens, el modelo está diseñado para segmentos de planificación cortos (aproximadamente cinco acciones), validación de esquemas y verificación de efectos externos. Su relevancia actual radica en la creciente demanda de agentes de automatización locales que mantengan control humano sobre acciones destructivas o sensibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.615.616.512 (7,6 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 49.152 tokens (configuracion recomendada) |
| Tipos de cuantizacion | Q4_K_M (unico publicado) |
| Idiomas soportados | ingles, chino (en, zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors del modelo base disponible en Qwen/Qwen2.5-Coder-7B-Instruct) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-7B-Instruct, un transformer decoder-only con atención de causalidad estándar, entrenado originalmente por Alibaba Cloud con 5,5 billones de tokens de código y texto, con soporte para 92 lenguajes de programación. El derivado ASB aplica un ajuste fino con LoRA de rango 32 y alpha 64 durante 2 épocas sobre 1.980 candidatos de entrenamiento y 220 de validación, con pérdida de entrenamiento de 0,1829 y pérdida de evaluación de 0,0928.

El entrenamiento dirigido se centra en convenciones específicas de ASB: selección de herramientas MCP, descubrimiento de parámetros y preservación de esquemas, uso de literales `_sb_get` y `_sb_typed_get`, ejecución de `ai_sk_wire_preview` antes del empaquetado, recuperación ante errores de herramientas o esquemas, validación de habilidades empaquetadas con parámetros no predeterminados y distinción entre código de salida 0 y efectos externos verificados. No se ha publicado información sobre el uso de RLHF o DPO; el entrenamiento es exclusivamente supervisado con LoRA.

## Capacidades

- Generación de código y planificación de acciones cortas para automatización de escritorio, navegador y sistemas MCP.
- Selección de herramientas MCP/ASB y planificación de secuencias de acciones de aproximadamente cinco pasos.
- Descubrimiento de parámetros y preservación de esquemas en flujos de trabajo grabados.
- Verificación de empaquetado mediante `ai_sk_wire_preview` y validación con parámetros no predeterminados.
- Distinción entre éxito de proceso (código de salida 0) y verificación de efectos externos (archivos, estado de UI, respuestas API).
- Soporte de tool calling y function calling a través de la API compatible con OpenAI (Ollama y LM Studio).
- Capacidades multilingües limitadas a inglés y chino en este derivado; el modelo base soporta 92+ lenguajes de programación.
- Sin capacidades de visión, audio ni modo de razonamiento explícito tipo thinking mode.

## Casos de uso

- Automatización de escritorio local: el modelo puede grabar y parametrizar operaciones de escritorio en Windows o macOS, compilando el flujo en lógica determinista que se ejecuta sin IA en cada ejecución. Es adecuado porque su entrenamiento específico en ASB garantiza que las acciones planificadas respeten el esquema de la plataforma.
- Integración con servidores MCP: selecciona herramientas MCP apropiadas y planifica llamadas con parámetros correctos, preservando el esquema de cada herramienta. Su capacidad de tool calling y su entrenamiento en convenciones `_sb_get` lo hacen fiable para entornos con múltiples herramientas.
- Generación de código de automatización en pipelines CI/CD: puede generar scripts reutilizables y habilidades MCP empaquetadas que se integran en flujos de validación, con verificación de `ai_sk_wire_preview` antes del empaquetado.
- Asistente de planificación para agentes de automatización: actúa como componente de planificación dentro de un sistema ASB validado, generando secuencias de acciones cortas que un ejecutor determinista aplica posteriormente.
- Validación de esquemas y parámetros en flujos grabados: analiza grabaciones de flujos de trabajo, descubre parámetros y confirma el esquema completo antes de empaquetar, reduciendo errores de integración.
- Recuperación ante errores de herramientas o empaquetado: dado su entrenamiento en recuperación tras fallos de esquema o empaquetado, puede sugerir correcciones y revalidar con parámetros no predeterminados.
- Automatización de negocio con verificación de efectos externos: adecuado para tareas donde el código de salida 0 no garantiza el resultado correcto, ya que el modelo está entrenado para verificar archivos, estado de UI o respuestas API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen2.5-Coder-7B-Instruct reporta resultados en HumanEval, MBPP y otros benchmarks de código, pero este derivado no incluye mediciones propias. La pérdida de evaluación de 0,0928 sugiere un ajuste estable, pero no es comparable con métricas estándar de la industria.

## Requisitos de hardware

- VRAM estimada: el archivo GGUF Q4_K_M ocupa 4.683.073.472 bytes (~4,36 GB). Con overhead de contexto de 49.152 tokens, se recomiendan al menos 8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: NVIDIA RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 o superiores. También funciona en Apple Silicon con 16 GB unificados.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más. Con cuantización Q4_K_M, la calidad es aceptable para tareas de planificación y generación de código.
- Opciones de despliegue: Ollama (carga directa desde Hugging Face con `ollama run hf.co/weahoo/ASB-Qwen2.5-Coder-7B-Targeted-v2-GGUF:Q4_K_M`), LM Studio, llama.cpp, y servidores compatibles con la API de OpenAI (vLLM, TGI) si se convierte a safetensors.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4090, un modelo de 7B en Q4_K_M suele generar entre 40 y 80 tokens por segundo con llama.cpp; en hardware más modesto, entre 15 y 30 tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| ASB-Qwen2.5-Coder-7B-Targeted-v2 (este) | 7,6 B | 49.152 | Apache 2.0 | GGUF Q4_K_M | Automatizacion ASB/MCP |
| Qwen2.5-Coder-7B-Instruct (base) | 7,6 B | 32.768 (hasta 128K) | Apache 2.0 | safetensors, GGUF | Codigo general, 92+ lenguajes |
| CodeLlama-7B-Instruct | 6,7 B | 16.384 | Llama 2 license | safetensors, GGUF | Codigo general, 2 lenguajes principales |
| DeepSeek-Coder-7B-Instruct | 6,9 B | 16.384 | DeepSeek license | safetensors, GGUF | Codigo general, 87 lenguajes |

El modelo ASB se distingue por su entrenamiento dirigido a un dominio concreto (automatización ASB), mientras que las alternativas ofrecen cobertura general de código. En tareas de automatización MCP, el modelo ASB debería superar a las alternativas genéricas, pero no hay benchmarks que lo confirmen. Para uso general de generación de código, el modelo base Qwen2.5-Coder-7B-Instruct es más versátil.

## Limitaciones y advertencias

- El modelo está diseñado como componente de planificación dentro de un flujo ASB validado, no como agente autónomo no supervisado. El propio autor recomienda no usarlo como agente de escritorio sin restricciones.
- Riesgo de alucinación en código y en selección de herramientas: puede generar llamadas MCP con parámetros incorrectos si el esquema no está bien definido. La validación con `ai_sk_wire_preview` y pruebas con parámetros no predeterminados son obligatorias.
- Sesgos conocidos: el entrenamiento se realizó sobre 1.980 candidatos, un conjunto pequeño y específico del dominio ASB. Puede tener un rendimiento degradado fuera de ese ámbito.
- Limitaciones de idioma: solo inglés y chino. No soporta español ni otros idiomas en este derivado, aunque el modelo base sí los soporta.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor advierte que Qwen y Alibaba Cloud no están afiliados ni respaldan Automation Skill Builder. El usuario es responsable de evaluar el código generado y el comportamiento de la automatización.
- Para producción, se requiere revisión humana en acciones destructivas, envío externo, credenciales o cambios de permisos.
- El contexto de 49.152 tokens es una configuración recomendada, no un límite duro del modelo base (que soporta hasta 128K en safetensors). Con GGUF, el contexto efectivo puede verse limitado por la memoria disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/weahoo/ASB-Qwen2.5-Coder-7B-Targeted-v2-GGUF
- Modelo base Qwen2.5-Coder-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-Coder-7B-Instruct
- Cuantizacion GGUF del modelo base: https://huggingface.co/QuantFactory/Qwen2.5-Coder-7B-Instruct-GGUF
- Pagina de Automation Skill Builder: https://www.visualbuild.me/
- Modelo en Ollama: https://ollama.com/library/qwen2.5-coder:7b
