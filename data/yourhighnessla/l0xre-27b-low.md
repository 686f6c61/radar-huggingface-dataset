# YourHighnessLA/L0xRE-27b-Low

## Resumen

L0xRE-27b-Low es una derivación cuantizada y orientada a memoria del modelo Qwen3.8-27B, publicada por el usuario YourHighnessLA bajo el identificador `YourHighnessLA/L0xRE-27b-Low`. El objetivo declarado es ejecutar un modelo de 27B de parámetros —con contexto de 128K y capacidades de visión— en una GPU de consumo con 12 GB de VRAM, sin descarga de capas a CPU. Para ello combina un GGUF principal de 8,62 GB con un runtime propietario denominado L0xRE BeeLLama Low, que implementa decodificación especulativa mediante un drafter DFlash2.

La propuesta es relevante porque ataca uno de los cuellos de botella prácticos del ecosistema open source: la brecha entre modelos de gran tamaño y hardware asequible. Frente a soluciones que recurren al offload parcial a CPU, este proyecto afirma mantener todas las capas en GPU, lo que reduce la latencia y permite un uso fluido como asistente de código local o agente. El autor reporta 72 tok/s en decodificación de código sobre una RTX 3060 de 12 GB, en Linux nativo y modo headless.

Conviene señalar desde el inicio que el modelo no es utilizable con llama.cpp estándar, Ollama, LM Studio ni Transformers: requiere el runtime específico del autor. Asimismo, el dato de parámetros totales en safetensors (4.784.193.024) no concuerda con la denominación comercial "27b", lo que sugiere que el GGUF publicado es una versión reducida o destilada respecto al Qwen3.8-27B original. Esta discrepancia no está aclarada en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B); detalles internos no disponibles |
| Parámetros totales | 4.784.193.024 según safetensors; la denominación comercial indica 27B (discrepancia no aclarada) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens (según model card) |
| Tipos de cuantización | GGUF; cuantización principal no especificada; drafter en Q4_K_M; proyector de visión en Q5_K-MIX |
| Idiomas soportados | inglés (`en`) |
| Licencia | `qwen-research-terms-derivative` (derivada de los términos de investigación de Qwen) |
| Formato de pesos | GGUF (llama.cpp), más proyector de visión separado |
| Tamaño en disco | 8,62 GB (modelo principal); repo total 10,5 GB |
| Runtime requerido | L0xRE BeeLLama Low v0.1.3.2 o superior |
| VRAM mínima | 12 GB (RTX 30/40/50 series) |
| Decodificación especulativa | Sí, mediante drafter DFlash2 Q4_K_M |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su origen en Qwen3.8-27B y de que se distribuye como GGUF para llama.cpp. El aspecto técnico diferencial es el uso de decodificación especulativa con un modelo borrador (drafter) DFlash2 cuantizado en Q4_K_M, que acelera la generación al proponer tokens que el modelo principal verifica en paralelo. El runtime BeeLLama Low gestiona además arenas de memoria configurables: en tarjetas de 12 GB que también alimentan un escritorio, reserva 1856 MiB para el entorno gráfico y deja el resto para el modelo y el agente.

No se especifican en la información proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste fino adicional sobre el modelo base. Tampoco se documenta el proceso de cuantización más allá de los formatos empleados. El soporte de visión se implementa mediante un proyector separado (Q5_K-MIX), descargado opcionalmente por el instalador y no incluido en el GGUF principal.

## Capacidades

- Generación de texto conversacional en inglés, con pipeline declarado `text-generation` y tag `conversational`.
- Generación y asistencia de código, con rendimiento destacado por el autor en decodificación de código (72 tok/s en RTX 3060).
- Procesamiento de contexto largo: hasta 128K tokens, adecuado para repositorios y conversaciones extensas.
- Visión: soportada mediante proyector Q5_K-MIX opcional, instalable con las banderas `-Vision` / `--vision`.
- Descodificación especulativa integrada en el runtime para reducir latencia.
- Compatibilidad con API OpenAI (`http://127.0.0.1:8080/v1`), lo que permite integrarlo con clientes y agentes que acepten endpoints personalizados.
- Endpoint de salud (`/health`) para monitorización.
- Diagnóstico de rendimiento mediante la herramienta `doctor`, que detecta paginación de memoria GPU y competencia por recursos.
- Reutilización de prompt y caché de system prompts, con mejoras reportadas del 45 % en tiempo hasta el primer token en turnos de seguimiento.
- Soporte de agentes: la documentación incluye una guía de instalación para agentes.

## Casos de uso

- Asistente de código local: el modelo puede completar y explicar código en un equipo con RTX 3060 de 12 GB, manteniendo todas las capas en GPU y evitando la latencia del offload a CPU. Los 128K de contexto permiten incluir varios ficheros de un repositorio en la ventana.
- Agente autónomo de desarrollo: a través del endpoint compatible con OpenAI, se puede conectar a frameworks de agentes que ejecuten pasos múltiples, con la ventaja de que el runtime advierte si la memoria GPU empieza a paginar y degrada el rendimiento.
- Revisión de código en CI/CD local: integrado como servicio en `127.0.0.1:8080`, puede procesar diffs y generar comentarios de revisión antes de un push, sin depender de APIs externas.
- Análisis de capturas y diagramas: con el proyector de visión instalado, el modelo puede interpretar imágenes de interfaces, diagramas de arquitectura o capturas de error y generar explicaciones textuales.
- Asistencia documental con contexto largo: gracias a los 128K tokens, puede resumir y responder preguntas sobre documentación técnica extensa o transcripciones largas en inglés.
- Entorno de desarrollo con escritorio compartido: el perfil de 1856 MiB de arena permite usar el modelo mientras el navegador y aplicaciones de mensajería siguen abiertos en la misma GPU, un escenario habitual en estaciones de trabajo de un solo monitor.
- Prototipado de agentes con presupuesto de hardware limitado: sirve para validar flujos de tool calling y razonamiento multi-paso en una máquina de gama media antes de escalar a infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento proporcionados son métricas de velocidad del runtime:

| Métrica | Valor reportado | Contexto |
|---|---|---|
| Decodificación de código | 72 tok/s | RTX 3060 12 GB, Linux nativo, headless |
| Mejora de decodificación (v0.1.3 vs v0.1.2) | ~21 % más rápida | RTX 3060 |
| Mejora de TTFT en seguimiento (v0.1.3 vs v0.1.2) | ~45 % menor | RTX 3060 |
| Arena de escritorio (v0.1.3.1) | 1856 MiB | Tarjetas de 12 GB con pantalla |

No se dispone de comparaciones de calidad con modelos similares.

## Requisitos de hardware

- VRAM mínima: 12 GB. El autor indica compatibilidad con NVIDIA RTX 30, 40 y 50 series.
- GPU recomendada por el autor: RTX 3060 12 GB (referencia de las mediciones). No se documentan pruebas en A100, H100 ni RTX 4090.
- Cabe en GPU de consumo: sí, en tarjetas de 12 GB o más; el modelo principal ocupa 8,62 GB en disco y el drafter se suma a la huella en VRAM.
- Espacio en disco: aproximadamente 20 GB libres; descarga de unos 11 GB con runtime y visión.
- Controladores: driver NVIDIA reciente; en Linux/WSL se requieren Python 3.12+, `curl`, `zstd` y `numactl`.
- Opciones de despliegue: exclusivamente el runtime L0xRE BeeLLama Low. No está soportado con vLLM, llama.cpp estándar, Ollama, LM Studio ni TGI.
- Latencia y throughput: 72 tok/s en decodificación de código sobre RTX 3060; no se proporcionan cifras para otras GPU ni para prompt processing.
- Sistemas operativos: Windows 10/11 y Linux o WSL2 (Ubuntu 24.04 o compatible).

## Comparativa con modelos similares

La información disponible no incluye comparaciones con otros modelos ni datos de benchmarks que permitan establecer una comparativa rigurosa. Se ofrece únicamente una comparación estructural basada en los datos declarados:

| Aspecto | L0xRE-27b-Low | Qwen3.8-27B (base) | Alternativas GGUF de 27B en llama.cpp |
|---|---|---|---|
| Parámetros | 4,78B (safetensors) / "27B" comercial | 27B | ~27B |
| Contexto | 128K | no disponible en esta ficha | variable |
| Visión | Sí, proyector opcional | no disponible en esta ficha | variable |
| Licencia | qwen-research-terms-derivative | términos de investigación Qwen | variable |
| Runtime | BeeLLama Low propietario | múltiples | llama.cpp, Ollama, etc. |
| VRAM objetivo | 12 GB | no disponible | 16-24 GB típicamente |

No se dispone de datos de rendimiento comparables con otros modelos de la misma categoría.

## Limitaciones y advertencias

- Dependencia total del runtime propietario BeeLLama Low: no funciona con llama.cpp estándar, Ollama, LM Studio ni Transformers. La extensión `.gguf` no garantiza compatibilidad.
- Discrepancia entre la denominación "27b" y los 4.784.193.024 parámetros reportados en safetensors; el autor no aclara si se trata de un modelo destilado, podado o de un error de etiquetado.
- Idiomas: solo inglés declarado. No hay soporte documentado de castellano ni de otros idiomas.
- Licencia derivada de los términos de investigación de Qwen: es probable que imponga restricciones al uso comercial. Debe revisarse el enlace de licencia antes de cualquier despliegue en producción.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan evaluaciones de fidelidad ni de sesgo.
- Sin benchmarks publicados de calidad (MMLU, HumanEval, GSM8K), lo que impide verificar las capacidades declaradas más allá de las métricas de velocidad.
- El rendimiento de 72 tok/s está medido en un entorno concreto (RTX 3060, Linux headless); no es extrapolable a otras GPU, sistemas operativos o cargas.
- La paginación de memoria GPU en Windows/WSL puede degradar el rendimiento; el runtime solo advierte, no corrige automáticamente.
- El proyecto está en evolución rápida (V2 ya publicada como predeterminada en v0.1.5); la ficha documenta la V1, que puede quedar obsoleta.
- Trazas de autor único y proyecto joven: menor garantía de mantenimiento a largo plazo que modelos respaldados por organizaciones grandes.
- No se documentan medidas de seguridad, filtrado de contenido ni evaluaciones de robustez.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low
- Modelo V2: https://huggingface.co/YourHighnessLA/L0xRE-V2-27b-Low
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- Repositorio del runtime: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low
- README del runtime: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low#readme
- Release v0.1.5: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/releases/tag/l0xre-v0.1.5
- Release v0.1.3.2: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/releases/tag/l0xre-v0.1.3.2
- Resultados de velocidad v0.1.3: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/V013-RELEASE.md
- Notas del parche v0.1.3.2: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/V0132-RELEASE.md
- Opciones del instalador: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/install/README.md
- Guía de instalación para agentes: https://github.com/seanyourhighness/L0xRE-BeeLLama-Low/blob/main/docs/AGENT-INSTALL.md
- GGUF principal: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low/resolve/main/L0xRE-27b-Low.gguf
- Drafter DFlash2: https://huggingface.co/YourHighnessLA/L0xRE-27b-Low/resolve/main/Qwen3.8-27B-DFlash2-Q4_K_M.gguf
