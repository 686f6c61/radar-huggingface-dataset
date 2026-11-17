# zenlm/zen6-nano

## Resumen

Zen 6 Nano es un modelo de lenguaje multimodal y agentico de pesos abiertos publicado por Zen LM y Hanzo AI en colaboracion con Zoo Labs Foundation. Se distribuye bajo licencia Apache 2.0 y su rasgo mas distintivo es que sus pesos estan cuantizados de forma nativa a 1,58 bits en espacio ternario (valores {-d, 0, +d}), lo que permite empaquetar la variante de 9B en apenas 2,42 GB y la de 2B en 429 MB. Segun los datos de safetensors del repositorio, el checkpoint registra 1.881.825.088 parametros, aunque la model card describe una familia con niveles de 9B, 4B y 2B.

El modelo emplea una columna vertebral hibrida que intercala bloques de atencion lineal Gated-DeltaNet con bloques de atencion completa agrupada (GQA), e incorpora un proyector visual (`mmproj`) para entrada image-text-to-text. Esta disenado especificamente para tool calling multi-paso, sintesis de respuestas de herramientas y recuperacion de errores, con soporte declarado para el ecosistema MCP de Hanzo.

Su relevancia actual radica en la eficiencia extrema: apunta a despliegues en CPU, GPU de consumo, moviles y runners de CI/CD sin coste por token, ademas de servir como backend de NPCs en motores de juego. La model card menciona compatibilidad con `hanzo-engine` (CUDA, Metal, ROCm, Vulkan, CPU), llama.cpp (formato `Q2_0` en builds b11556+) y `mlx-lm` en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: Gated-DeltaNet (atencion lineal) intercalada 3x con atencion completa GQA 1x, MLP SwiGLU, proyector visual |
| Parametros totales | 1.881.825.088 (safetensors); familia declarada de 9B, 4B y 2B |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria nativa 1,58-bit: PQ2_0 (2,125 bpw), PTQ1_0 (1,750 bpw), Q2_0 (2,250 bpw); componentes auxiliares en Q8_0 y BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos GGML 142, 143 y 42) y packs MLX 2-bit |

## Arquitectura y entrenamiento

La columna vertebral combina bloques de atencion lineal Gated-DeltaNet (tres por cada bloque de atencion completa) con atencion completa de consultas agrupadas, MLPs SwiGLU y un proyector visual multimodal. La innovacion central es el denominado Hadamard Outlier Rotation: los pesos lineales y los embeddings de tokens se almacenan en una base ortonormal de Sylvester-Walsh-Hadamard, con vectores de signo ±1 por canal embebidos en metadatos KV del GGUF (`prism.hadamard.*`). Segun el autor, esta rotacion elimina los valores atipicos de activacion, permitiendo que los pesos ternarios por grupo de 128 conserven la precision densa.

El post-entrenamiento se realizo directamente en el espacio de pesos ternario mediante Quantization-Aware Training con Straight-Through Estimator y un optimizador hibrido Muon + AdamW. La model card no especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO. Se declaran cabezas auxiliares de decodificacion especulativa: Multi-Token Prediction (MTP), un borrador por difusion de bloques DFlash2 y busqueda por automata de sufijos `SA_SPEC` con `GuardedDraft`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Entrada multimodal image-text-to-text mediante proyector visual (`mmproj` en Q8_0 o BF16).
- Tool calling y function calling con ejecucion multi-paso de `<tool_call>` y sintesis de `<tool_response>`.
- Recuperacion de errores en cadenas de herramientas y abtencion calibrada (el modelo puede declinar usar una herramienta).
- Integracion con herramientas MCP declaradas: `fs`, `exec`, `code`, `git`, `test`, `hanzo` y herramientas de direccion de motores de juego.
- Capacidades agenticas orientadas a flujos de trabajo automatizados.
- Respeto de personas de desarrollador personalizadas (por ejemplo, NPCs de Godot o extractores JSON) sin sobrecarga de system prompt.
- Decodificacion especulativa mediante MTP, DFlash2 y `SA_SPEC` para acelerar la inferencia.
- Capacidades multilingues: no disponible.

## Casos de uso

- CI/CD sin coste por token: cargar `zen6-nano-2b-PTQ1_0.gguf` (429 MB) en runners de CPU de GitHub Actions para ejecutar pruebas de integracion de LLM y tool calling de extremo a extremo sin claves de API.
- NPCs en videojuegos: la variante de 4B (950 MB en PTQ1_0) cabe en equipos de escritorio y moviles, permitiendo dialogos dinamicos y respuestas a eventos del motor con latencia baja.
- Agentes de automatizacion de repositorio: el soporte de herramientas `fs`, `git`, `test` y `exec` permite construir agentes que lean archivos, ejecuten pruebas y sinteticen resultados en un solo flujo multi-paso.
- Extraccion estructurada de datos: el modelo respeta personas de desarrollador tipo extractor JSON, lo que facilita pipelines de parsing de documentos con salida validable.
- Asistencia en terminal y entornos de desarrollo: con `hanzo-engine` sirviendo una API compatible con OpenAI en local (`/v1/chat/completions`), se puede integrar en editores o CLIs sin dependencia de la nube.
- Procesamiento de documentos con imagen: el proyector visual permite tareas image-text-to-text como descripcion de capturas o lectura de interfaces en flujos de automatizacion.
- Despliegue en hardware restringido: la variante de 2B en PQ2_0 (517 MB) habilita inferencia en CPU y dispositivos de borde donde otros modelos no caben.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: la variante 9B en PQ2_0 ocupa 2,42 GB en disco y requiere un espacio similar en memoria; con proyector visual Q8_0 (624 MB) el total ronda los 3 GB. La variante 4B en PQ2_0 ocupa 1,15 GB y la 2B en PTQ1_0, 429 MB.
- GPU recomendadas: cualquier GPU con al menos 3-4 GB de memoria libre para el 9B; el autor declara soporte CUDA, Metal, ROCm y Vulkan mediante `hanzo-engine`. Para `Q2_0` en llama.cpp se requiere la build b11556 o superior.
- GPU de consumo: cabe holgadamente en RTX 3060, RTX 4060, RTX 4090 y en Apple Silicon con `mlx-lm` (packs MLX 2-bit).
- Opciones de despliegue: `hanzo-engine` (servidor compatible con OpenAI en `http://127.0.0.1:36900/v1`), llama.cpp (`llama-server`), `mlx-lm` en Apple Silicon y el stack `hanzo up`.
- Latencia y throughput: no disponibles de forma numerica; el autor menciona aceleracion mediante MTP, DFlash2 y `SA_SPEC`, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion nativa | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Zen 6 Nano (9B/4B/2B) | 1.881.825.088 (safetensors) | no disponible | Ternaria 1,58-bit (PQ2_0, PTQ1_0, Q2_0) | Apache 2.0 | GGUF y MLX en Hugging Face |
| Qwen (referencia upstream citada) | no disponible | no disponible | no disponible | no disponible | no disponible |
| Bonsai-2 (referencia upstream citada) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos upstream citados en la model card (Qwen, Bonsai-2, DFlash) para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composicion del dataset ni evaluaciones de seguridad.
- Riesgo de alucinacion no cuantificado; no hay benchmarks publicados que permitan estimar la fiabilidad en tareas de razonamiento o codigo.
- La cuantizacion ternaria nativa a 1,58 bits implica una perdida de precision respecto a pesos completos; el autor afirma que la rotacion Hadamard la mitiga, pero no aporta mediciones.
- No se especifican los idiomas soportados; el soporte multilingue no esta garantizado.
- La longitud de contexto no esta declarada, lo que impide planificar cargas de trabajo con ventanas largas.
- Aunque la licencia es Apache 2.0, la model card exige preservar la atribucion a Qwen (Alibaba Cloud), Bonsai-2 (Prism ML, Inc.) y DFlash/ProCreations en el fichero NOTICE; conviene revisarlo antes de redistribuir.
- El despliegue optimo depende del ecosistema propietario `hanzo-engine`; fuera de el, las opciones se limitan a `Q2_0` en llama.cpp o packs MLX.
- El numero de parametros de safetensors (1.881.825.088) no coincide con la nomenclatura comercial de 9B/4B/2B de la model card; conviene verificar el checkpoint concreto antes de dimensionar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/zenlm/zen6-nano
- Hanzo AI: https://hanzo.ai
- Zen LM: https://zenlm.org
- Zoo Labs Foundation: https://zoolabs.io
- Repositorio de hanzo-engine: https://github.com/hanzoai/engine
