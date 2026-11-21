# Xangel0s/ozyvler-Ozygram-Neural-7B-Coder-MCTS

## Resumen

Ozygram Neural 7B (Dream-RSI & Kev Engine) v2 es un ajuste fino del modelo Qwen2.5-7B-Instruct desarrollado por el usuario Xangel0s, orientado a la reparación autónoma de código mediante un enfoque neuro-simbólico. El modelo combina el razonamiento del transformer base con un protocolo de acciones determinista en JSON (`ast_mutation` y `apply_patch`) que permite aplicar parches quirúrgicos sobre el árbol de sintaxis abstracta (AST) de un proyecto, evitando las alucinaciones conversacionales y los desajustes de líneas típicos de los asistentes de código convencionales.

La propuesta técnica se articula en dos fases: Dream-RSI, una cadena de razonamiento interna delimitada por los tokens especiales `<|thought_start|>` y `<|thought_end|>` que simula trayectorias AST y evalúa el radio de impacto de un cambio antes de comprometerlo; y el Kev Action Engine, que emite JSON determinista con los hunks de reemplazo. El modelo fue entrenado con QLoRA de 4 bits sobre una única GPU NVIDIA Quadro RTX 4000 Max-Q de 8 GB de VRAM, lo que lo posiciona como una opción de despliegue en estaciones de trabajo de gama media.

Con 7.615.616.512 parámetros reales (según safetensors) y licencia Apache 2.0, el modelo hereda la arquitectura Qwen2 y declara soporte para castellano e inglés. Su relevancia actual radica en la creciente demanda de agentes de código que operen localmente, sin depender de APIs externas, y que produzcan parches verificables en lugar de sugerencias en lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste neuro-simbolico con MCTS interno |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | GGUF (disponible en el repo); NF4 4-bit usado durante el entrenamiento QLoRA |
| Idiomas soportados | Espanol (es), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso con atención causal estándar. Sobre esta base, el autor aplica un ajuste fino con QLoRA en precisión NormalFloat de 4 bits, optimizador Paged AdamW de 8 bits y gradient checkpointing, completando 3 épocas y 450 pasos de optimización. El entrenamiento se realizó íntegramente en una NVIDIA Quadro RTX 4000 Max-Q con 8 GB de VRAM bajo Windows WDDM, lo que constituye un caso de ajuste fino de un modelo de 7B en hardware de consumo profesional.

La innovación declarada no reside en la arquitectura subyacente, sino en el contrato de prompt y el formato de salida. El modelo aprende a emitir una fase de razonamiento interno entre `<|thought_start|>` y `<|thought_end|>`, donde explora candidatos de mutación AST, valida el grafo de dependencias (blast radius), descarta ramas destructivas y simula rutas de rollback transaccional. A continuación, la fase Kev genera JSON determinista con acciones `ast_mutation` o `apply_patch`, incluyendo `target_files`, `blast_radius_validated`, `target` y `replacement`. El autor reporta una pérdida final de entrenamiento de 0.005904 (descenso monótono desde 0.082), una precisión media de token superior al 99.4% y una norma de gradiente de 0.044. No se especifican el número de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a "contratos neuro-simbólicos curados".

## Capacidades

- Generación de código y reparación automatizada de errores mediante mutaciones AST quirúrgicas.
- Razonamiento interno estructurado (Dream-RSI) con simulación de trayectorias y evaluación de impacto antes de emitir un parche.
- Detección de condiciones de carrera, fugas de semáforos y bloqueos mutuos en código concurrente.
- Validación de radio de impacto (blast radius) sobre grafos de dependencias entre archivos.
- Emisión de protocolo de acción determinista en JSON (`ast_mutation`, `apply_patch`), sin prosa conversacional.
- Soporte de conversación multi-turno (tag `conversational` en Hugging Face).
- Capacidades multilingües limitadas a español e inglés.
- Compatibilidad declarada con Ollama y despliegue vía text-generation-inference y endpoints compatibles.
- No se declaran capacidades de visión, audio ni tool calling genérico fuera del protocolo Kev.

## Casos de uso

- Reparación automática de pipelines de integración continua: ante un fallo de pytest o un traceback de producción, el modelo diagnostica la causa raíz y emite un `apply_patch` con el hunk exacto, que un agente de runtime puede aplicar sin intervención humana.
- Mantenimiento de bases de código empresariales con múltiples módulos: el modelo recorre el grafo de dependencias para validar que una mutación en un módulo no rompe consumidores aguas abajo, gracias a la fase de blast radius.
- Corrección de bugs en lógica de negocio crítica: el benchmark del autor sobre un CRM/ERP demuestra reparación de validadores de fechas ISO, expresiones regulares corruptas y divisiones por cero en cálculos financieros.
- Resolución de deadlocks en sistemas concurrentes: el modelo identifica semáforos no liberados en manejadores de excepción y propone rutas de rollback transaccional, adecuado para workers asíncronos y exportadores de informes.
- Asistente de código integrado en IDE (VS Code, Continue): el protocolo JSON determinista permite que el editor aplique parches directamente sin parsear lenguaje natural, reduciendo errores de offsets de línea.
- Auditoría y refactorización local sin conexión: al ejecutarse en una estación de trabajo con 8 GB de VRAM, es apto para entornos con requisitos de confidencialidad que prohíben enviar código a APIs en la nube.
- Generación de código repetitivo (boilerplate) de alto rendimiento, según el escenario "Speculative Speedrun" declarado en el benchmark del autor.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen del autor y no son comparables con benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Se presentan tal cual:

| Suite | Prueba | Resultado |
|---|---|---|
| Master Gym | Blast Radius Challenge (travesia de grafo AST) | 5/5 PASS (100%) |
| Master Gym | Infinite Loop Simulation (deadlocks, rollback) | 5/5 PASS (100%) |
| Master Gym | Speculative Speedrun (boilerplate) | 5/5 PASS (100%) |
| CRM local (`crmgeofa-localdev`) | MUT_01_EXPORT_PREFIX (prefijo `N-` ausente) | PASS, diagnostico 100% |
| CRM local | MUT_02_ALPHA_SAMPLE_REGEX (regex corrupta) | PASS, diagnostico 100% |
| CRM local | MUT_03_QUOTE_DATE_PARSER (dia/mes invertidos) | PASS, diagnostico 100% |
| CRM local | MUT_05_EXCEL_DIV_ZERO (division por cero) | PASS, diagnostico 100% |
| CRM local | MUT_06_WORKER_LEAK_DEADLOCK (semaforo no liberado) | PASS, diagnostico 100% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la model card del autor y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 15-16 GB en FP16/BF16 para los 7.6B parámetros; unos 5-6 GB en cuantización GGUF Q4_K_M; unos 8 GB en Q8_0.
- GPU recomendadas: NVIDIA A100 o H100 para despliegue de alta concurrencia con vLLM; RTX 4090 o RTX 3090 para inferencia local en FP16.
- Compatibilidad con GPU de consumo: sí. El autor entrenó el modelo en una Quadro RTX 4000 Max-Q de 8 GB, por lo que la inferencia cuantizada cabe en tarjetas de 8 GB (RTX 3060 Ti, RTX 4060, RTX 2070) usando GGUF Q4.
- Opciones de despliegue: llama.cpp, Ollama (tag declarado), text-generation-inference, vLLM y endpoints compatibles con la API de Hugging Face.
- Latencia y throughput: no disponibles en la información proporcionada. El autor menciona que el contrato de prompt fijo busca garantizar el 100% de prefix caching para eliminar la latencia de prefill, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ozygram Neural 7B v2 | 7.6B | No disponible | Reparacion AST neuro-simbolica | Apache 2.0 | Hugging Face (safetensors, GGUF) |
| Qwen2.5-7B-Instruct (base) | 7.6B | 32.768 tokens (documentado por Qwen) | Asistente generalista | Apache 2.0 | Hugging Face, Ollama, vLLM |
| Qwen2.5-Coder-7B-Instruct | 7.6B | 32.768 tokens (documentado por Qwen) | Generacion y reparacion de codigo | Apache 2.0 | Hugging Face, Ollama, vLLM |
| DeepSeek-Coder-V2-Lite-Instruct | 16B (2.4B activos, MoE) | 128.000 tokens (documentado por DeepSeek) | Codigo y razonamiento | DeepSeek License | Hugging Face |

La comparación directa con benchmarks no es posible porque Ozygram no publica resultados en suites estándar. Frente a Qwen2.5-Coder-7B-Instruct, la diferencia principal es el protocolo de salida determinista y la fase de razonamiento MCTS declarada; frente a DeepSeek-Coder-V2-Lite, Ozygram ofrece menor tamaño y despliegue en 8 GB, pero carece de contexto largo documentado y de validación independiente.

## Limitaciones y advertencias

- Los benchmarks presentados son autoinformados por el autor, sin verificación independiente ni comparación con suites estándar; deben tomarse con cautela.
- El entrenamiento se realizó sobre un dataset descrito de forma vaga ("contratos neuro-simbólicos curados") y con solo 450 pasos de optimización, lo que puede implicar sobreajuste al formato y escasa generalización a dominios distintos del CRM evaluado.
- La pérdida final de 0.005904 y la precisión de token superior al 99.4% son compatibles con un ajuste muy estrecho al formato de salida; no garantizan calidad en tareas de código abiertas.
- El modelo está especializado en el protocolo Kev y el contrato de prompt OZYGRAM NEURAL V1; usarlo fuera de ese contrato puede degradar gravemente la calidad de salida.
- Idiomas limitados a español e inglés; no se declara soporte para otros idiomas pese a la base multilingüe de Qwen2.5.
- No se documenta la longitud de contexto efectiva del ajuste; aunque herede la ventana de Qwen2.5-7B-Instruct, el autor no la especifica y el entrenamiento podría haberla reducido.
- Riesgo de alucinación en la fase de razonamiento: las trayectorias AST simuladas no se ejecutan realmente, por lo que la validación de blast radius es heurística y puede pasar por alto dependencias dinámicas.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-7B-Instruct también es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- El repositorio tiene 0 likes y 786 descargas en el momento de la consulta, lo que indica adopción muy limitada y ausencia de validación por la comunidad.
- No se han publicado evaluaciones de sesgo; al derivar de Qwen2.5, puede heredar sesgos del corpus original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xangel0s/ozyvler-Ozygram-Neural-7B-Coder-MCTS
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Perfil del autor en Hugging Face: https://huggingface.co/Xangel0s
- No se han encontrado en la busqueda web papers, blogs, repositorios adicionales ni demos asociados a este modelo.
