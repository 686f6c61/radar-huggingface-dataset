# unsloth/gemma-4-E4B-it-GGUF

## Resumen

Gemma 4 E4B es un modelo multimodal de Google DeepMind, parte de la familia Gemma 4, que combina arquitectura de mezcla de expertos (MoE) con atención híbrida para ofrecer un equilibrio entre rendimiento y eficiencia. Con 4.5 mil millones de parámetros efectivos (8 mil millones con embeddings), está diseñado para ejecutarse en dispositivos de gama alta, portátiles y servidores, manteniendo capacidades de razonamiento, codificación y comprensión multimodal (texto, imagen y audio). La versión GGUF publicada por Unsloth facilita su despliegue en motores como llama.cpp, Ollama y otros entornos de inferencia local, con múltiples niveles de cuantización para adaptarse a distintos presupuestos de hardware.

Este modelo destaca por su ventana de contexto de 128K tokens, soporte nativo de function calling y un modo de pensamiento configurable que permite activar o desactivar el razonamiento explícito. Su licencia Apache 2.0 y su soporte para más de 140 idiomas lo convierten en una opción atractiva para desarrolladores que buscan un modelo abierto, multimodal y eficiente para aplicaciones de producción. La cuantización de Unsloth añade optimizaciones adicionales como el soporte de MTP (Multi-Token Prediction) y una integración directa con Unsloth Studio para fine-tuning y ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) con atención híbrida (sliding window + global) |
| Parametros totales | 7.518.069.290 (según safetensors, incluye embeddings y encoders) |
| Parametros activos | 4.5B (efectivos) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | GGUF (múltiples niveles: Q2, Q4, Q5, Q8, etc., ver repo) |
| Idiomas soportados | Más de 140 |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

Gemma 4 E4B emplea una arquitectura MoE con 42 capas, donde cada capa intercala atención local de ventana deslizante (512 tokens) con atención global completa, garantizando que la última capa sea siempre global. Para optimizar el uso de memoria en contextos largos, las capas globales utilizan claves y valores unificados (shared KV) y aplican RoPE proporcional (p-RoPE). El modelo incorpora un encoder de visión de aproximadamente 150M de parámetros y un encoder de audio de unos 300M, lo que le permite procesar entradas multimodales.

El entrenamiento combina fases de preentrenamiento y ajuste instructivo con técnicas de alineación (no se especifica si se usó RLHF o DPO en la información disponible). Destaca el soporte nativo del rol `system` para conversaciones estructuradas y un modo de pensamiento configurable que permite al modelo razonar explícitamente antes de responder. Unsloth ha añadido soporte para MTP (Multi-Token Prediction) en esta versión GGUF, lo que puede mejorar la velocidad de decodificación en ciertos entornos.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable (thinking mode).
- Comprensión multimodal: entrada de texto, imagen (con resolución y aspecto variable) y audio (nativo en E4B).
- Generación de código y soporte para tareas de programación.
- Function calling nativo para integración con herramientas y APIs.
- Capacidades de agente y razonamiento multi-paso.
- Soporte multilingüe en más de 140 idiomas.
- Soporte nativo del rol `system` para control estructurado de la conversación.
- Optimizado para ejecución en dispositivos locales (portátiles, móviles de gama alta).

## Casos de uso

- Atención al cliente automatizada: el modelo gestiona conversaciones multi-turno con contexto largo (128K tokens) y puede integrarse con sistemas de tickets o bases de conocimiento mediante function calling.
- Asistentes de codigo en producción: genera, revisa y refactoriza código en múltiples lenguajes, y puede conectarse a APIs de CI/CD o editores mediante tool calling.
- Analisis de documentos con imagenes: extrae información de facturas, formularios o capturas de pantalla gracias a su capacidad de entrada visual.
- Asistentes de voz en dispositivos: al soportar audio nativo, puede procesar comandos de voz directamente sin necesidad de un pipeline de transcripción externo.
- Agentes autonomos: combina razonamiento multi-paso, function calling y contexto largo para ejecutar tareas complejas como búsquedas web, gestión de correo o automatización de flujos.
- Traduccion y localizacion: con soporte para más de 140 idiomas, puede traducir contenido manteniendo el contexto y el tono, útil para plataformas globales.
- Prototipado rapido en entornos locales: su tamaño compacto y las cuantizaciones GGUF permiten ejecutarlo en portátiles con GPU consumer para desarrollo y pruebas sin costes de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de Google DeepMind menciona mejoras en codificación y razonamiento, pero no se proporcionan cifras concretas en la documentación de Unsloth ni en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización Q4_K_M, el modelo ocupa aproximadamente 4-5 GB de memoria; con Q8, alrededor de 8 GB. Las versiones de mayor precisión pueden superar los 10 GB.
- GPU recomendadas: RTX 3060 (12 GB) o superior para cuantizaciones bajas; RTX 4090 o A100 para cuantizaciones altas y contexto largo.
- Cabe en GPU consumer: sí, en la mayoría de tarjetas con 8 GB o más de VRAM usando cuantización Q4 o inferior.
- Opciones de despliegue: llama.cpp, Ollama, Unsloth Studio, vLLM (usando el modelo base safetensors), TGI (con conversión previa).
- Latencia y throughput: no disponibles en la información proporcionada. Se espera que sea adecuado para interacción en tiempo real en hardware consumer con cuantización baja.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato |
|---|---|---|---|---|---|
| Gemma 4 E4B (este) | 4.5B activos / 8B totales | 128K | Texto, imagen, audio | Apache 2.0 | GGUF / safetensors |
| Gemma 3 4B | 4B | 128K | Texto, imagen | Apache 2.0 | safetensors / GGUF |
| Llama 3.2 3B | 3B | 128K | Texto | Llama 3.2 | safetensors / GGUF |
| Qwen2.5 7B | 7B | 128K | Texto | Apache 2.0 | safetensors / GGUF |

Gemma 4 E4B se diferencia por su arquitectura MoE que ofrece más capacidad efectiva que un modelo denso del mismo tamaño, y por su soporte multimodal (incluido audio) que no está presente en Llama 3.2 ni Qwen2.5. Su licencia Apache 2.0 es más permisiva que la de Llama.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado con datos web, puede reflejar sesgos sociales y culturales presentes en esos datos.
- Riesgo de alucinacion: como cualquier LLM, puede generar información falsa o inventada, especialmente en contextos largos o con entradas ambiguas.
- Limitaciones de contexto: aunque soporta 128K tokens, el rendimiento puede degradarse en contextos muy largos; se recomienda validar en el caso de uso específico.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero se debe revisar el acuerdo de licencia de Gemma 4 de Google (enlace en la documentación) para confirmar términos adicionales.
- Consideraciones de producción: el modelo es multimodal, pero la calidad de la comprensión de audio e imagen puede ser inferior a modelos especializados; se recomienda probar con datos reales.
- La cuantización GGUF puede introducir pérdida de precisión; para tareas que requieran alta fidelidad, se recomienda usar el modelo base en safetensors.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/unsloth/gemma-4-E4B-it-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Blog de lanzamiento de Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/gemma-4/
- Documentación oficial de Gemma: https://ai.google.dev/gemma/docs/core
- Guía de Unsloth para Gemma 4: https://unsloth.ai/docs/models/gemma-4
- Guía de MTP de Unsloth: https://unsloth.ai/docs/models/mtp
- Colección de Gemma 4 de Unsloth: https://huggingface.co/collections/unsloth/gemma-4
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
