# WithinUsAI/Mythos-5-Abliterated-9B-GGUF

## Resumen

Mythos-5-Abliterated-9B-GGUF es una versión sin censura (abliterated) del modelo empero-ai/Qwythos-9B-Claude-Mythos-5-1M, publicada por WithinUsAI. Se trata de un fine-tune completo (full fine-tune) sobre una base de la familia Qwen 3.5, con 9.197.093.888 parámetros totales y una ventana de contexto declarada de hasta 1 millón de tokens. El modelo está orientado a razonamiento, uso de herramientas (function calling), tareas agénticas y dominios especializados como ciberseguridad y biomedicina.

La relevancia del modelo radica en dos factores: por un lado, la ventana de contexto extremadamente larga (1M tokens) combinada con soporte de tool use, lo que lo sitúa en el segmento de modelos de 9B aptos para tareas de agente con documentos masivos; por otro, el proceso de abliteration, que elimina las direcciones de activación asociadas al rechazo de contenido, reduciendo drásticamente el filtrado de seguridad. Esto lo hace atractivo para investigación sobre alineación y evaluación de salvaguardas, pero problemático para despliegues comerciales convencionales.

El repositorio se distribuye exclusivamente en formato GGUF (49,1 GB en total, con múltiples cuantizaciones) y está pensado para su uso con llama.cpp, incluyendo soporte de decodificación especulativa mediante MTP (multi-token prediction). La licencia declarada es Apache 2.0 y el único idioma oficialmente soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen 3.5), con soporte de MTP para decodificación especulativa |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (1M), según tags y ejemplos de la model card (`-c 262144` en el ejemplo de llama.cpp) |
| Tipos de cuantizacion | GGUF en varias cuantizaciones (el repo ocupa 49,1 GB; no se detalla la lista exacta de quants) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo etiquetado también como transformers, pero solo se distribuyen GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9,2B parámetros derivado de la familia Qwen 3.5, según los tags del repositorio. Sobre esa base se aplicó un fine-tune completo (no LoRA) partiendo de empero-ai/Qwythos-9B-Claude-Mythos-5-1M, un modelo ya ajustado con SFT para razonamiento, uso de herramientas y contexto largo. Posteriormente, WithinUsAI aplicó abliteration, una técnica de edición de pesos que identifica y elimina las direcciones de activación responsables del comportamiento de rechazo, sin reentrenar el modelo.

El resultado conserva las capacidades del modelo original (razonamiento, function calling, contexto de 1M tokens) pero con el filtrado de seguridad prácticamente suprimido. El repositorio incluye soporte de MTP (multi-token prediction), lo que permite decodificación especulativa con un draft integrado en el propio modelo (`--spec-type draft-mtp --spec-draft-n-max 2` en llama.cpp). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo thinking y modo no-thinking (en este último el modelo se limita estrictamente a la instrucción del primer prompt, sin preámbulos ni conclusiones).
- Function calling y tool use, con soporte para integración en flujos agénticos.
- Contexto largo de hasta 1M tokens, adecuado para documentos extensos, repositorios de código o historiales de conversación masivos.
- Capacidades especializadas en ciberseguridad y biomedicina, según los tags del autor.
- Comportamiento "uncensored": el filtrado de rechazo ha sido reducido mediante abliteration.
- Decodificación especulativa mediante MTP para acelerar la inferencia en llama.cpp.
- Multilingüe: no; solo inglés declarado.

## Casos de uso

- Análisis de documentación técnica masiva: con 1M tokens de contexto, el modelo puede ingerir manuales completos, especificaciones o bases de código y responder preguntas sobre ellos sin chunking, lo que simplifica pipelines RAG en escenarios donde la recuperación por fragmentos pierde contexto.
- Agentes autónomos con tool calling: su soporte de function calling y razonamiento multi-paso permite construir agentes que encadenen llamadas a APIs, consultas a bases de datos y ejecución de comandos en entornos controlados.
- Investigación en seguridad y alineación: al ser una versión abliterated, es útil para estudiar cómo se comporta un modelo sin salvaguardas, medir tasas de cumplimiento de peticiones dañinas y evaluar técnicas de mitigación.
- Auditoría de código y análisis estático asistido: el tag de ciberseguridad y su capacidad de razonamiento lo hacen adecuado para revisar repositorios grandes en busca de patrones de vulnerabilidad, siempre con revisión humana.
- Asistencia en documentación biomédica: para resumir literatura científica o extraer entidades de informes, en entornos de investigación y con validación por expertos.
- Generación de código en pipelines de CI/CD: puede integrarse en flujos de revisión automática o generación de tests, aunque su naturaleza sin censura exige filtrado posterior en producción.
- Procesamiento de historiales conversacionales largos: atención al cliente o análisis de transcripts extensos donde la ventana de 1M tokens evita truncamientos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9,2B, una cuantización Q4_K_M ronda los 5,5-6 GB; Q8_0 en torno a 9,5-10 GB; FP16 requiere aproximadamente 18,4 GB solo para pesos, más overhead de contexto KV.
- El contexto de 1M tokens es extremadamente costoso en memoria KV; en la práctica, con `-c 262144` (como en el ejemplo del autor) se necesita una GPU con 24 GB o más, y para 1M completo se requiere hardware de clase A100/H100 o configuraciones multi-GPU.
- GPU recomendadas: RTX 4090 (24 GB) para cuantizaciones Q4-Q8 con contexto moderado; A100 40/80 GB o H100 para contexto largo real; RTX 3090/4080 para cuantizaciones bajas con contexto corto.
- Cabe en GPU de consumo: sí, en cuantizaciones Q4 o inferiores con contexto reducido en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070), y con holgura en 24 GB.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con compilación CUDA y flags `-ngl 99 -fa on --spec-type draft-mtp`), llama-server para API compatible con OpenAI, y potencialmente Ollama si se publican los quants en su registro. No se menciona soporte de vLLM o TGI para esta variante GGUF.
- Latencia y throughput: no disponibles en la información proporcionada; el uso de MTP con `--spec-draft-n-max 2` sugiere una mejora de velocidad de decodificación, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| WithinUsAI/Mythos-5-Abliterated-9B-GGUF | 9,2B | 1M | Apache 2.0 | GGUF | Abliterated, solo inglés, tool use |
| empero-ai/Qwythos-9B-Claude-Mythos-5-1M | 9B (no confirmado) | 1M | no disponible | no disponible | Modelo base del que deriva; con salvaguardas |
| huihui-ai/Huihui-Qwythos-9B-Claude-Mythos-5-1M-abliterated-GGUF | 9B (no confirmado) | 1M | no disponible | GGUF | Variante abliterated alternativa del mismo linaje |

La comparativa con modelos de la familia Qwen 3.5 de tamaño similar (por ejemplo, variantes de 8-9B) no está disponible con datos de rendimiento en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: la abliteration elimina el filtrado de rechazo, por lo que el modelo puede generar contenido sensible, controvertido o inapropiado. El propio autor recomienda uso exclusivo en investigación y entornos controlados.
- Riesgo legal y ético: el usuario es el único responsable del contenido generado; no es apto para aplicaciones públicas, menores de edad o sistemas que exijan alta seguridad.
- Solo inglés: no hay soporte multilingüe declarado, lo que limita su uso en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos de 9B; sin benchmarks publicados no se puede cuantificar su fiabilidad en tareas factuales.
- Contexto de 1M en la práctica: el coste de memoria KV hace que el contexto completo sea inviable en GPU de consumo; el propio ejemplo del autor usa 262.144 tokens.
- Licencia Apache 2.0 permite uso comercial, pero las advertencias del autor y la ausencia de filtrado trasladan toda la responsabilidad legal al desplegador.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni evidencia de robustez en producción.
- El campo `base_model` del repo apunta a sí mismo, lo que indica un metadata inconsistente y dificulta la trazabilidad del linaje.

## Enlaces

- Hugging Face: https://huggingface.co/WithinUsAI/Mythos-5-Abliterated-9B-GGUF
- Modelo base declarado: https://huggingface.co/empero-ai/Qwythos-9B-Claude-Mythos-5-1M
- llama.cpp (releases): https://github.com/ggml-org/llama.cpp/releases
- llama.cpp (repositorio): https://github.com/ggml-org/llama.cpp
- Ko-fi del autor: https://ko-fi.com/huihuiai
