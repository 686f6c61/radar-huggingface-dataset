# zenlm/zen6-flash

## Resumen

Zen 6 Flash (también referenciado como Zen 6 Flash 27B + DFlash2) es un modelo de lenguaje multimodal y orientado a agentes, publicado por Hanzo AI y Zen LM en colaboración con Zoo Labs Foundation bajo licencia Apache 2.0. Su rasgo diferencial es que se distribuye como pesos ternarios de 1.58 bits (valores {-d, 0, +d}) en formato GGUF, lo que permite ejecutar un modelo nominal de 27 000 millones de parámetros en ficheros de entre 5,95 GB y 7,63 GB. La arquitectura combina bloques de atención lineal Gated-DeltaNet con atención completa agrupada (GQA) en una proporción 3:1, e incorpora un proyector visual para entrada image-text-to-text.

El modelo está post-entrenado directamente en el espacio de pesos ternarios mediante Quantization-Aware Training con Straight-Through Estimator y un optimizador híbrido Muon + AdamW, aplicando una rotación ortogonal de Hadamard (Sylvester-Walsh-Hadamard) para eliminar valores atípicos en las activaciones. Es relevante ahora porque combina tres piezas poco habituales en un mismo artefacto: cuantización ternaria nativa (no post-hoc), decodificación especulativa mediante un draft de difusión por bloques (DFlash2) y soporte explícito de tool calling multi-paso con MCP, todo servible en CPU y GPU de consumo.

La ficha se basa exclusivamente en la model card pública y en los metadatos de Hugging Face. El dato de parámetros totales reportado en safetensors (1 924 404 480, es decir, ~1,92 B) no coincide con la denominación comercial de 27B del autor; esta discrepancia se documenta en la sección de limitaciones y no se resuelve con la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: Gated-DeltaNet (atención lineal) x3 intercalada con Grouped-Query Full Attention x1, MLPs SwiGLU, proyector visual multimodal (mmproj) |
| Parametros totales | 27B según la model card; 1 924 404 480 (~1,92 B) según metadatos safetensors del repo (discrepancia no resuelta) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1.58-bit en tres formatos: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); draft DFlash2 en Q8_0; proyector visual en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42); no se publican safetensors en la información disponible |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido que intercala tres bloques de atención lineal Gated-DeltaNet por cada bloque de atención completa con Grouped-Query Attention, con MLPs SwiGLU. Los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de bloques Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en los metadatos KV del GGUF (`prism.hadamard.*`). Esta rotación tiene una función concreta: redistribuir las activaciones para eliminar valores atípicos, de modo que la cuantización ternaria por grupos de 128 mantenga precisión cercana a la densa. El modelo se post-entrena directamente en ese espacio ternario mediante STE-QAT con Muon + AdamW, en lugar de cuantizar un checkpoint denso a posteriori.

En el plano de la decodificación, el paquete incluye un draft de difusión por bloques DFlash2 en Q8_0 (2,06 GB) que actúa como modelo especulativo y, según el autor, aproximadamente duplica la velocidad de decodificación. El runtime `hanzo-engine` añade MTP, búsqueda por autómata de sufijos (`SA_SPEC`) y `GuardedDraft`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card atribuye ascendencia a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash (ProCreations) en el fichero NOTICE.

## Capacidades

- Generación de texto conversacional multi-turno con pipeline image-text-to-text declarado.
- Entrada multimodal de imagen mediante proyector visual separado (mmproj en Q8_0 o BF16).
- Tool calling y function calling con ejecución multi-paso: emisión de `<tool_call>`, síntesis de `<tool_response>`, recuperación de errores y abstención calibrada de herramientas.
- Integración con herramientas MCP de Hanzo en los dominios `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de dirección de motores de juego.
- Comportamiento agéntico orientado a tareas de varios pasos sobre espacios de trabajo de código.
- Identidad en el espacio de pesos sin sobrecarga de system prompt, respetando personas definidas por el desarrollador (por ejemplo, NPC de Godot o extractores JSON).
- Compatibilidad con la API `/v1/chat/completions` estilo OpenAI a través de `hanzo engine serve`.
- Ejecución en CPU, CUDA, Metal, ROCm y Vulkan mediante `hanzo-engine`; el formato Q2_0 es compatible con llama.cpp upstream b11556 o superior; los packs MLX de 2 bits funcionan con `mlx-lm` en Apple Silicon.
- Capacidades matemáticas, de razonamiento y multilingües: no disponible (no se documentan en la información proporcionada).

## Casos de uso

- Automatización de tareas de repositorio en CI/CD: el modelo puede leer `Cargo.toml`, listar ficheros y lanzar tests de workspace mediante las herramientas `fs` y `exec`, encadenando llamadas y sintetizando el resultado en un único turno conversacional.
- CI de integración sin coste por token: cargando `zen6-nano-2b-PTQ1_0.gguf` (~429 MB) en runners de CPU de GitHub Actions se pueden ejecutar tests end-to-end de LLM y de tool calling sin claves de API, tal como documenta el autor.
- Asistentes de código en estaciones de trabajo sin GPU dedicada: los packs PTQ1_0 (5,95 GB) y PQ2_0 (7,21 GB) permiten servir el modelo en CPU con llama.cpp o `hanzo-engine`, útil para entornos de desarrollo con hardware limitado.
- Agentes de operación sobre Git: con las herramientas `git` y `test` el modelo puede inspeccionar el estado del árbol, proponer cambios y verificar que la suite pasa antes de confirmar, aprovechando la recuperación de errores ante fallos de herramienta.
- Extracción estructurada de datos: la card menciona explícitamente el respeto de personas de desarrollador como extractores JSON, lo que encaja en pipelines de parsing de documentos o formularios con salida validable.
- Dirección de motores de juego: las herramientas de "game-engine director" permiten a NPC controlados por el modelo reaccionar a eventos del juego dentro de una lógica definida por el desarrollador.
- Procesamiento de documentación con imágenes: al ser image-text-to-text con proyector visual, puede recibir capturas o diagramas junto al texto en flujos de soporte técnico o análisis de interfaz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB para PTQ1_0 (5,95 GB de pesos), 7,2 GB para PQ2_0 y 7,6 GB para Q2_0, más el proyector visual (629 MB en Q8_0 o 931 MB en BF16) si se usa entrada de imagen.
- Decodificación especulativa: añadir 2,06 GB si se carga el draft DFlash2 Q8_0.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. El autor declara rutas de ejecución CUDA con `dp4a`, ROCm, Metal y Vulkan, además de CPU.
- GPU de consumo: por tamaño de pesos, los tres packs caben en tarjetas con 8 GB o más de VRAM; el pack PTQ1_0 más el mmproj Q8_0 se mantiene por debajo de 7 GB. No se confirma compatibilidad específica con modelos concretos de tarjeta.
- Apple Silicon: soporte mediante `mlx-lm` con packs MLX de 2 bits.
- Opciones de despliegue: `hanzo-engine` (`hanzo pull`, `hanzo engine serve`, `hanzo up`), llama.cpp (`llama-server`, formato Q2_0 en b11556 o superior) y `mlx-lm`. Compatible con endpoint `/v1/chat/completions`.
- Latencia y throughput: no disponible. El autor afirma una mejora de aproximadamente 2x en decodificación con DFlash2, sin cifras absolutas publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Zen 6 Flash | 27B (card) / ~1,92 B (safetensors) | no disponible | Ternaria nativa 1.58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | Multimodal, tool calling MCP, draft DFlash2 |
| Qwen (familia, ascendencia declarada) | no disponible para el modelo base concreto | no disponible | no disponible | no disponible | El autor cita atribución upstream a Qwen de Alibaba Cloud |
| Bonsai-2 (Prism ML) | no disponible | no disponible | no disponible | no disponible | Citado en NOTICE como ascendencia |
| DFlash / ProCreations | no disponible | no disponible | no disponible | no disponible | Citado en NOTICE como ascendencia |

No se dispone de datos de benchmarks ni de especificaciones cerradas de las alternativas citadas, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Discrepancia de tamaño: la model card anuncia 27B, mientras que los metadatos safetensors del repositorio indican 1 924 404 480 parámetros. Cualquier estimación de coste, VRAM o calidad basada en el tamaño debe tratarse con cautela hasta que el autor lo aclare.
- Idiomas soportados no declarados: no hay lista de lenguas ni evaluación multilingüe publicada.
- Longitud de contexto no especificada: no se puede garantizar el comportamiento en conversaciones largas ni en repositorios extensos.
- Sin benchmarks publicados: no hay MMLU, HumanEval, GSM8K ni evaluaciones de tool calling verificables de forma independiente.
- Riesgo de alucinación: inherente a los modelos generativos; en tool calling el autor declara "abstención calibrada", pero no se aportan métricas de precisión de llamadas ni de tasa de error.
- Formato propietario parcial: los tipos GGML 142 (PQ2_0) y 143 (PTQ1_0) requieren `hanzo-engine`; solo Q2_0 es compatible con llama.cpp upstream, lo que limita la portabilidad si se evita el stack de Hanzo.
- Dependencia de metadatos KV específicos (`prism.hadamard.*`): una conversión o herramienta que no los preserve puede degradar la precisión del modelo ternario.
- Licencia Apache 2.0 permite uso comercial, pero el fichero NOTICE impone obligaciones de atribución a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML) y DFlash / ProCreations que deben conservarse en la redistribución.
- Madurez: el repositorio acumula 215 descargas y 2 likes, con creación en septiembre de 2026 y última actualización en noviembre de 2026; el ecosistema de terceros en torno al modelo es todavía muy reducido.
- El tamaño del repositorio (41,2 GB) excede con mucho la suma de los artefactos listados, lo que sugiere la presencia de ficheros adicionales no documentados en la card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zenlm/zen6-flash
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio del motor: https://github.com/hanzoai/engine
- Modelo nano para CI en CPU: `hanzoai/zen6-nano` (`zen6-nano-2b-PTQ1_0.gguf`)
