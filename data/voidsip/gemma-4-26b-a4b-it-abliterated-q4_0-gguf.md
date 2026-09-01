# voidsip/gemma-4-26B-A4B-it-abliterated-Q4_0-GGUF

## Resumen

Este repositorio contiene una requantización en formato GGUF Q4_0 del modelo abliterado `huihui-ai/Huihui-gemma-4-26B-A4B-it-qat-q4_0-unquantized-abliterated-GGUF`, que a su vez deriva de `google/gemma-4-26B-A4B-it`. El trabajo de `voidsip` se limita a una conversión de formato mediante `llama-quantize` (llama.cpp b10731), sin modificar los pesos ni el comportamiento del modelo. El objetivo es cubrir un hueco: las versiones abliteradas existentes solo estaban disponibles en Q4_K o NVFP4, y ni `llama.cpp` ni `FreeToken` cargan correctamente esos formatos para este modelo.

El modelo base es un MoE multimodal de Google DeepMind con 25,2 mil millones de parámetros totales y aproximadamente 3,8 mil millones activos por token, con 128 expertos y enrutamiento top-8. Soporta una ventana de contexto de 256K tokens, razonamiento (thinking mode) y tool calling. La abliteración, realizada por `huihui-ai`, elimina los comportamientos de rechazo a nivel de pesos, lo que lo convierte en una versión "uncensored" del modelo original. Esta versión Q4_0 está optimizada para entornos que requieren ese formato específico, como `FreeToken` en su carga de expertos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma-4 MoE, 128 expertos, top-8 routing |
| Parametros totales | 25.233.142.046 |
| Parametros activos | ~3.8B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | Gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (Q4_0) |

## Arquitectura y entrenamiento

El modelo base `google/gemma-4-26B-A4B-it` es un transformer MoE con 128 expertos finos y enrutamiento top-8, diseñado para activar solo ~3.8B de sus 25.2B parámetros por token. Fue entrenado con cuantización consciente (QAT), lo que permite que la cuantización a Q4_0 recupere una calidad cercana a bf16. La abliteración aplicada por `huihui-ai` es una técnica de eliminación de rechazos a nivel de pesos, utilizando "norm-preserving biprojected abliteration" y "Expert-Granular Abliteration (EGA)" para los pesos de los expertos. Esta versión concreta es únicamente una conversión de formato a Q4_0, sin entrenamiento adicional ni ajuste de pesos.

## Capacidades

- Generación de texto y razonamiento: el modelo es un reasoning model que emite `reasoning_content` junto con `content`, lo que permite cadenas de pensamiento explícitas.
- Tool calling / function calling: soporta llamadas a herramientas y devuelve `tool_calls` bien formados, según la model card.
- Soporte de agentes: gracias al tool calling y al razonamiento multi-paso, puede integrarse en flujos de agentes.
- Multimodal (base): el modelo original de Google acepta entrada de imagen y texto, y genera texto. Sin embargo, en esta conversión GGUF no se ha verificado explícitamente el soporte de visión.
- Multilingüe: no se dispone de información sobre los idiomas soportados.
- Abliterado: se han eliminado los comportamientos de rechazo, por lo que no declina peticiones que el modelo original rechazaría.

## Casos de uso

- Atención al cliente automatizada: con una ventana de contexto de 256K tokens, puede gestionar conversaciones multi-turno largas y mantener el historial completo. Su tool calling permite integrarse con sistemas de ticketing o bases de conocimiento.
- Generación de código en producción: soporta tool calling y puede conectarse a APIs de compilación o ejecución. Su velocidad de inferencia (~219 tok/s en RTX 5090) lo hace adecuado para entornos de desarrollo interactivo.
- Análisis de documentos extensos: el contexto de 256K permite procesar informes, contratos o artículos científicos completos en una sola pasada, extrayendo información y resumiendo.
- Asistentes de razonamiento complejo: el modo thinking permite desglosar problemas matemáticos, lógicos o de planificación en pasos intermedios, útil para investigación o educación.
- Chat sin censura en entornos controlados: al ser abliterado, puede utilizarse en aplicaciones donde se requiere una respuesta sin filtros de seguridad, siempre que se cumpla la política de uso prohibido de Gemma.
- Despliegue en runtimes que exigen Q4_0: por ejemplo, `FreeToken` solo acepta expertos en formato NVFP4 o Q4_0; esta versión permite cargar el modelo abliterado en ese runtime sin errores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Sin embargo, la model card reporta mediciones de rendimiento en una RTX 5090 (32 GB, driver 610.88) con llama.cpp CUDA y todos los layers offloaded (`-ngl 99`):

- Decode: ~219 tok/s
- Prompt eval: ~213 tok/s
- Peso de los pesos: 13.4 GiB, dejando espacio para KV cache a 64K de contexto.

## Requisitos de hardware

- VRAM estimada: los pesos en Q4_0 ocupan ~13.4 GiB. Para inferencia con contexto moderado (p. ej. 8K) se necesitan al menos 16 GB de VRAM; para contexto largo (64K o más) se recomiendan 24 GB o más.
- GPU recomendadas: RTX 5090 (32 GB) es la referencia usada en las mediciones; también funcionará en RTX 4090 (24 GB) o A100/H100 con suficiente VRAM.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de 24 GB como la RTX 4090, y en la RTX 5090 de 32 GB con margen para KV cache.
- Opciones de despliegue: llama.cpp (llama-server), FreeToken (con requisitos adicionales en Windows: ninja, nvcc, MSVC). También puede usarse con otros runtimes que soporten GGUF Q4_0, como Ollama o LM Studio, aunque no se ha verificado.
- Latencia y throughput: en RTX 5090, ~219 tok/s de decode y ~213 tok/s de prompt eval, según la model card.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it | 25.2B | ~3.8B | 256K | Gemma | bf16, safetensors |
| huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated | 25.2B | ~3.8B | 256K | Gemma | Q4_K, NVFP4 |
| voidsip/gemma-4-26B-A4B-it-abliterated-Q4_0-GGUF | 25.2B | ~3.8B | 256K | Gemma | Q4_0 GGUF |

La diferencia principal es el formato de cuantización: esta versión es la única abliterada en Q4_0, lo que la hace compatible con runtimes que exigen ese formato. En cuanto a rendimiento, al ser el mismo modelo base, las capacidades son idénticas; la abliteración solo elimina los rechazos.

## Limitaciones y advertencias

- Abliteración: el modelo no rechaza peticiones que el original rechazaría. Esto no amplía los usos permitidos; la Gemma Prohibited Use Policy sigue aplicando. El usuario es responsable del uso y de transmitir estos términos si redistribuye el modelo.
- Riesgo de alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- Sesgos: no se dispone de información sobre sesgos específicos; el modelo base puede heredar sesgos de sus datos de entrenamiento.
- Limitaciones de idioma: no se ha especificado qué idiomas soporta; se asume multilingüe por el modelo base, pero no está confirmado.
- Restricciones de licencia: uso comercial permitido bajo los Gemma Terms of Use, pero con la política de uso prohibido. La abliteración no exime de estas restricciones.
- Requisitos de runtime: en FreeToken, la carga en Windows requiere herramientas de compilación (ninja, nvcc, MSVC); sin ellas, falla durante la captura de CUDA graphs.
- Contexto: aunque el modelo soporta 256K, en la práctica con Q4_0 y KV cache, el contexto efectivo depende de la VRAM disponible; en la RTX 5090 se probó con 64K.

## Enlaces

- Repositorio del modelo: https://huggingface.co/voidsip/gemma-4-26B-A4B-it-abliterated-Q4_0-GGUF
- Modelo base (Google): https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión abliterada (huihui-ai): https://huggingface.co/huihui-ai/Huihui-gemma-4-26B-A4B-it-abliterated
- Documentación de Gemma en Google Cloud: https://docs.cloud.google.com/gemini-enterprise-agent-platform/models/maas/google/gemma-4-26b-a4b-it
- Ficha en Intel Software Catalog: https://aiswcatalog.intel.com/models/google-gemma-4-26b-a4b-it
- Receta de vLLM: https://recipes.vllm.ai/Google/gemma-4-26B-A4B-it
