# wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF

## Resumen

Qwen3.8-27B-Mario-HTML-LoRA-GGUF es un adaptador LoRA en formato GGUF publicado por el usuario wesjos sobre el modelo base Qwen/Qwen3.8-27B. No se trata de un modelo completo, sino de un adaptador de 21 MB en precisión f16 con 128 tensores que se monta en tiempo de ejecución sobre cualquier cuantización GGUF del modelo base mediante `llama-server`, sin necesidad de fusionar los pesos. Su propósito es especializar al modelo en la generación de fragmentos HTML con fines visuales: tarjetas, tablas comparativas, bloques de fórmulas y gráficos SVG en línea, orientados a una interfaz web de tipo lienzo.

El adaptador está pensado para un flujo de trabajo concreto: un WebUI propio (FastAPI más frontend de una sola página) que renderiza en vivo la salida HTML del modelo. Incluye una plantilla de chat (`chat_template.jinja`) que incorpora la frase de activación del modo HTML, un requisito imprescindible porque el conversor de LoRA no escribe plantilla de chat en el GGUF del adaptador. La licencia declarada es Apache-2.0, heredada del modelo base, y los idiomas soportados son inglés y chino.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de especialización ligera mediante LoRA en el ecosistema llama.cpp; por otro, sirve de advertencia sobre las inconsistencias habituales en repositorios de adaptadores (metadatos contradictorios, dependencia de archivos auxiliares y limitaciones de decodificación especulativa). El modelo base Qwen3.8-27B no está verificado de forma independiente en la información disponible, por lo que los datos de arquitectura y entrenamiento del mismo se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer Qwen3.8-27B; 128 tensores, 16 capas de atención completa (q/k/v/o × a/b) |
| Parametros totales | 10.485.760 (dato de safetensors del repo); el adaptador GGUF ocupa 21 MB en f16 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (configuración recomendada en el quickstart, con KV cache q8) |
| Tipos de cuantizacion | Adaptador en f16; el modelo base admite cuantizaciones GGUF (se recomienda Q4_K_M) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador LoRA); plantilla de chat en Jinja; el modelo base en GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de rango bajo aplicado únicamente a las proyecciones de atención (q, k, v, o) de 16 capas de atención completa del modelo base, con un total de 128 tensores y un valor `adapter.lora.alpha` de 32, que en tiempo de ejecución se traduce en una escala de 2.0. El adaptador se distribuye en un único archivo GGUF de 21 MB en f16, lo que permite montarlo y desmontarlo en caliente sobre cualquier cuantización del modelo base sin re-fusionar pesos ni reiniciar el servidor.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens utilizados, la composición de los datos ni si se emplearon técnicas de RLHF o DPO. La model card únicamente documenta el resultado funcional: el adaptador induce un modo de generación de HTML fragmentado con clases `.ai-view`, `.card` y `.modern-table`, y recomienda no usar un esfuerzo de razonamiento `xhigh`, ya que degrada el comportamiento del LoRA. Tampoco se documenta ninguna innovación de decodificación propia; de hecho, se advierte explícitamente de que la decodificación especulativa MTP (`--spec-type draft-mtp`) debe desactivarse porque la cabeza draft fue entrenada sobre el modelo base y su tasa de acierto se desploma con el adaptador activo.

## Capacidades

- Generación de fragmentos HTML con fines visuales: tarjetas, bloques de fórmula, tablas comparativas, avisos y gráficos SVG en línea.
- Renderizado de contenido didáctico y explicativo (por ejemplo, una explicación de la función sigmoide con gráfico SVG, asíntotas y punto de inflexión).
- Modo de razonamiento configurable mediante `enable_thinking` y `reasoning_effort` (low, medium, high), con medium como valor por defecto de la plantilla.
- Soporte de visión cuando el backend arranca con `--mmproj` (el modelo base es multimodal según el quickstart).
- Conversación multi-turno a través de la API compatible con OpenAI `/v1/chat/completions`.
- Capacidades multilingües limitadas a inglés y chino según los metadatos.
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.

## Casos de uso

- Generación de interfaces explicativas en vivo: el modelo produce fragmentos HTML con tarjetas y SVG que un frontend renderiza directamente, útil para asistentes educativos que ilustran conceptos matemáticos o científicos sin intervención manual.
- Prototipado rápido de dashboards y tablas comparativas: dado un prompt, el adaptador emite tablas `.modern-table` y bloques `.card` listos para incrustar en una aplicación web, lo que acelera la creación de maquetas funcionales.
- Asistentes de documentación técnica: el modelo puede generar bloques de fórmula y diagramas SVG junto a texto explicativo, adecuado para wikis internas o documentación de producto.
- Demostraciones interactivas de IA generativa: el WebUI incluido (FastAPI más frontend) permite montar una demo que muestra la salida del modelo en un lienzo HTML en tiempo real, con conmutación de esfuerzo de razonamiento.
- Enseñanza de matemáticas y ciencias: la generación de gráficos SVG con asíntotas, puntos de inflexión y anotaciones permite construir material didáctico visual a partir de una pregunta en lenguaje natural.
- Experimentación con adaptadores LoRA en producción: el montaje y desmontaje en caliente vía `/lora-adapters` permite comparar el comportamiento del modelo base y el especializado sin reiniciar el servidor, útil para evaluación A/B de adaptadores.
- Integración en pipelines de generación de contenido web: el adaptador puede invocarse desde un servicio backend para producir fragmentos HTML consistentes con un sistema de diseño propio, siempre que se respete la plantilla de chat obligatoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos medidos que aporta el autor son de rendimiento en inferencia, no de calidad:

| Metrica | Valor |
|---|---|
| VRAM (RTX 4090 24 GB, Q4_K_M, ctx 131072, KV q8, mmproj) | 21,5 GiB |
| Throughput | ~40 tok/s (1 slot, contexto de 131k) |
| Throughput observado en demo | ~42 tok/s con 2448 tokens generados |
| Tamano del adaptador | 21 MB (f16, 128 tensores) |

## Requisitos de hardware

- VRAM estimada: 21,5 GiB con el modelo base en Q4_K_M, contexto de 131.072 tokens, KV cache en q8 y `mmproj` incluido, según la medición del autor en una RTX 4090 de 24 GB.
- GPU recomendadas: RTX 4090 (24 GB) es la configuración validada por el autor; para contextos largos con cuantizaciones mayores se requieren GPUs de 40-80 GB (A100, H100) o reparto entre varias GPUs.
- Cabe en GPU de consumo: sí, en RTX 4090 con Q4_K_M y contexto máximo según la medición aportada; en GPUs de 16 GB habría que reducir contexto o cuantización.
- Opciones de despliegue: `llama-server` de llama.cpp con `--lora`, `--mmproj`, `--chat-template-file`, `-ngl 99`, `-fa on` y `--jinja`; el WebUI propio requiere FastAPI y Python.
- Latencia y throughput: ~40 tok/s en el escenario medido (1 slot, 131k de contexto); no se dispone de datos de latencia por petición ni de throughput con múltiples slots.
- Advertencia de despliegue: no activar decodificación especulativa MTP, ya que resulta mediblemente más lenta con el LoRA montado.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA comparables en la documentación proporcionada. La comparación se limita al modelo base y a la variante PEFT del mismo adaptador:

| Modelo | Tipo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF | LoRA GGUF | 10,5 M (adaptador) | 131.072 (config. recomendada) | Apache-2.0 | GGUF |
| wesjos/Qwen3.8-27B-Mario-HTML-LoRA | LoRA PEFT | no disponible | no disponible | Apache-2.0 | bf16 (PEFT) |
| Qwen/Qwen3.8-27B | Modelo base | no disponible | no disponible | Apache-2.0 (según metadatos) | safetensors/GGUF |

## Limitaciones y advertencias

- El adaptador no funciona sin la plantilla `chat_template.jinja`: el GGUF del LoRA no contiene `tokenizer.chat_template` y llama.cpp cae en la plantilla estándar del modelo base, por lo que el modelo nunca entra en modo HTML.
- El esfuerzo de razonamiento `xhigh` degrada el comportamiento del LoRA según el autor; se recomienda `medium` o inferior.
- La decodificación especulativa MTP debe desactivarse: la cabeza draft está entrenada sobre el modelo base y su tasa de acierto cae con el adaptador activo, resultando más lenta.
- La salida es un fragmento HTML (`.ai-view`, `.card`, `.modern-table`), no un documento completo con `<!DOCTYPE html>`; para páginas completas hay que solicitarlo explícitamente o modificar la frase de sistema.
- Idiomas limitados a inglés y chino según los metadatos; no se documenta soporte de español.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de calidad; el repositorio tiene 107 descargas y 0 likes, sin validación comunitaria.
- Los metadatos del repo presentan inconsistencias: el campo de parámetros totales (10.485.760) corresponde al adaptador, no al modelo base de 27B, y el tamaño del repo figura como 0.0 GB pese a contener archivos de demo y WebUI.
- El modelo base Qwen3.8-27B no ha podido verificarse de forma independiente en la información disponible; conviene confirmar su existencia, licencia y especificaciones antes de usarlo en producción.
- Aunque la licencia declarada es Apache-2.0, deben revisarse las condiciones del modelo base para uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF
- Variante PEFT del adaptador: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Demo en vídeo: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF/resolve/main/demos/demo.mp4
- WebUI incluido: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF/tree/main/webui
- Plantilla de chat: https://huggingface.co/wesjos/Qwen3.8-27B-Mario-HTML-LoRA-GGUF/blob/main/chat_template.jinja
