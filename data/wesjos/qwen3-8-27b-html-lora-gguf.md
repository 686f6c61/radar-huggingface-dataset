# wesjos/Qwen3.8-27B-HTML-LoRA-GGUF

## Resumen

Qwen3.8-27B-HTML-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario wesjos sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un adaptador de 21 MB en precisión f16 con 128 tensores que se monta en tiempo de ejecución sobre cualquier cuantización GGUF del modelo base mediante llama.cpp, sin necesidad de fusionar pesos. Su propósito es especializar al modelo en la generación de fragmentos HTML con componentes visuales (`.ai-view`, `.card`, `.modern-table`, SVG en línea) para interfaces de chat que renderizan la salida en vivo.

El adaptador se distribuye junto a una plantilla de chat (`chat_template.jinja`) que inyecta la frase de activación del modo HTML, un WebUI en FastAPI con frontend de página única y una grabación de demostración de 28 segundos. La licencia declarada es Apache-2.0 y los idiomas soportados según la model card son inglés y chino.

La relevancia de esta ficha es doble: por un lado, documenta un patrón de despliegue poco habitual (LoRA GGUF montada en caliente, con conmutación en runtime vía API HTTP); por otro, ilustra las peculiaridades de los adaptadores GGUF en llama.cpp, donde la plantilla de chat no se incluye en el adaptador y debe pasarse explícitamente o el modelo nunca entra en el modo para el que fue entrenado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.8-27B |
| Parámetros totales | 10.485.760 (según safetensors del repo); 21 MB en f16 con 128 tensores |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración de despliegue documentada por el autor); el modelo base anuncia 262k según fuentes externas |
| Tipos de cuantización | f16 para el adaptador; el modelo base admite cuantizaciones GGUF (recomendada UD-Q4_K_M) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); el modelo base también en GGUF; existe un adaptador PEFT en bf16 en el repo hermano |

## Arquitectura y entrenamiento

El adaptador es una LoRA de rango bajo compuesta por 128 tensores: 16 capas de atención completa, cada una con las proyecciones q, k, v y o, y por cada una los pares a/b propios de LoRA. El valor `adapter.lora.alpha` es 32, lo que se traduce en una escala de runtime de 2.0. Al ser un adaptador, no redefine la arquitectura del modelo base: hereda el transformer de Qwen3.8-27B, incluyendo su codificador de visión, que el autor aprovecha pasando `--mmproj mmproj-F16.gguf` al servidor.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si hubo etapas de RLHF o DPO. La model card únicamente documenta el resultado del entrenamiento: la capacidad de emitir fragmentos HTML con clases CSS concretas y SVG en línea. Una innovación operativa destacable es el montaje en caliente del adaptador: llama.cpp permite activarlo y desactivarlo con una petición POST a `/lora-adapters` sin reiniciar el servidor ni recargar el modelo, lo que facilita alternar entre el comportamiento base y el modo HTML. El autor advierte además de que la decodificación especulativa MTP (`--spec-type draft-mtp`) debe desactivarse con este LoRA, porque la cabeza draft fue entrenada sobre el modelo base y su tasa de acierto se desploma, resultando mediblemente más lenta.

## Capacidades

- Generación de fragmentos HTML estructurados con componentes visuales predefinidos: `.ai-view`, `.card`, `.modern-table`.
- Generación de gráficos SVG en línea, incluyendo ejes, asíntotas, puntos de inflexión y tablas de referencia.
- Modo de razonamiento configurable con tres niveles (`low`, `medium`, `high`) mediante `reasoning_effort`; el autor desaconseja `xhigh` para este LoRA.
- Soporte de visión cuando el backend arranca con `--mmproj` (botón "Add Image" en el WebUI).
- Conversación multi-turno con contexto largo (hasta 131.072 tokens en la configuración documentada).
- Conmutación en runtime del adaptador (encendido/apagado) sin reinicio del servidor.
- Salida como fragmento HTML, no como documento completo con `<!DOCTYPE html>`; para páginas completas hay que pedirlo explícitamente o editar la frase de sistema.
- Idiomas: inglés y chino según la model card; el comportamiento en castellano no está documentado.

## Casos de uso

- Asistentes conversacionales con renderizado visual en vivo: el modelo emite fragmentos HTML que el frontend pinta en un panel lateral, adecuado para explicaciones técnicas con tarjetas, tablas y gráficos SVG sin postprocesado.
- Generación de explicaciones matemáticas visuales: la demostración con la función sigmoide produce bloque de fórmula, gráfico SVG con asíntotas y punto de inflexión, tarjetas de propiedades y tabla de referencia en una sola respuesta.
- Documentación técnica interactiva: el modelo puede generar comparativas en tablas `.modern-table` y avisos en `.card` directamente consumibles por un visor web.
- Prototipado rápido de interfaces de chat con contenido enriquecido: el WebUI incluido (FastAPI más frontend de página única) sirve como base para integrar el adaptador en un producto interno sin escribir el renderizador desde cero.
- Alternancia entre modo base y modo HTML en producción: gracias a la conmutación en caliente vía `/lora-adapters`, un mismo servidor puede atender peticiones normales y peticiones de generación visual según el caso.
- Evaluación de adaptadores LoRA GGUF en pipelines de investigación: el patrón de montaje sin fusión y la verificación por `/props` y `/lora-adapters` facilitan experimentos reproducibles con distintas escalas del adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de inferencia medidas en una RTX 4090 de 24 GB con Q4_K_M y el LoRA montado:

| Métrica | Valor |
|---|---|
| VRAM ocupada | 21,5 GiB (contexto 131.072, KV en q8, mmproj incluido) |
| Throughput | ~40 tok/s (1 slot, contexto de 131k) |
| Ejemplo de demo | 2.448 tokens a ~42 tok/s |

## Requisitos de hardware

- VRAM estimada: 21,5 GiB con Q4_K_M, contexto de 131.072 tokens, KV cache en q8 y mmproj cargado (medición del autor en RTX 4090).
- GPU recomendadas: RTX 4090 de 24 GB es la configuración validada por el autor; para contextos menores o cuantizaciones más agresivas cabría en GPUs de 16-24 GB, aunque no hay mediciones publicadas.
- Cabe en GPU de consumo: sí, en RTX 4090 con la configuración documentada; en GPUs de 16 GB requeriría reducir contexto o cuantizar más el modelo base.
- Opciones de despliegue: llama.cpp (`llama-server`) con `--lora`, `--mmproj`, `--chat-template-file`, `-c 131072`, `-ngl 99`, `-fa on`, `--jinja`; WebUI propio en FastAPI sobre el endpoint OpenAI `/v1/chat/completions`.
- Latencia y throughput: ~40 tok/s en el escenario medido; la decodificación especulativa MTP empeora el rendimiento con este LoRA y debe desactivarse.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-HTML-LoRA-GGUF | LoRA GGUF sobre Qwen3.8-27B | 10,5 M en adaptador; base de 27B | 131.072 (config. del autor); 262k anunciado para la base | Apache-2.0 | Hugging Face, 119 descargas |
| wesjos/Qwen3.8-27B-HTML-LoRA | Adaptador PEFT bf16 | no disponible | hereda del base | Apache-2.0 | Hugging Face (repo hermano) |
| AMAImedia/Qwen3.8-27B-LoRA | LoRA sobre Qwen3.8-27B | no disponible | hereda del base | no disponible | Hugging Face |
| Qwen/Qwen3.8-27B | Modelo completo | 27B (nominal) | 262k según fuente externa | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El adaptador GGUF no incluye plantilla de chat: sin `--chat-template-file chat_template.jinja` el modelo nunca entra en modo HTML, porque llama.cpp usa la plantilla estándar del GGUF base, que carece de la frase de activación.
- El autor desaconseja el nivel de razonamiento `xhigh` con este LoRA; el valor por defecto de la plantilla es `medium`.
- La salida es un fragmento HTML, no un documento completo; para páginas completas hay que solicitarlo explícitamente o modificar la frase de sistema.
- La decodificación especulativa MTP degrada el rendimiento con el adaptador montado y debe desactivarse.
- Idiomas documentados: inglés y chino; no hay evidencia de calidad en castellano.
- No se han publicado datos sobre sesgos, tasa de alucinación ni evaluación de seguridad del adaptador.
- Licencia Apache-2.0 declarada, sin restricciones comerciales conocidas más allá de las del modelo base, cuyos términos conviene verificar por separado.
- El adaptador depende de una versión concreta del modelo base (Qwen3.8-27B); no es portable a otras familias sin reentrenamiento.
- El repo tiene 0,0 GB de tamaño reportado y 0 likes, con 119 descargas: validación comunitaria muy limitada.

## Enlaces

- Hugging Face del adaptador GGUF: https://huggingface.co/wesjos/Qwen3.8-27B-HTML-LoRA-GGUF
- Adaptador PEFT bf16 (repo hermano): https://huggingface.co/wesjos/Qwen3.8-27B-HTML-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- LoRA alternativo sobre el mismo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
- Guía de despliegue local de Qwen3.8-27B: https://www.yottalabs.ai/post/how-to-run-qwen-3-8-27b-locally-ollama-gguf-single-gpu-2026
