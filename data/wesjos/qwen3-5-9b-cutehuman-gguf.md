# wesjos/Qwen3.5-9B-CuteHuman-GGUF

## Resumen

Qwen3.5-9B-CuteHuman-GGUF es una cuantización en formato GGUF del modelo ajustado wesjos/Qwen3.5-9B-CuteHuman, un fine-tune de persona sobre la base Qwen/Qwen3.5-9B. Lo publica el usuario wesjos y está pensado para ejecutarse en llama.cpp con soporte multimodal texto-imagen mediante un proyector CLIP separado. El modelo incorpora una persona conversacional caracterizada por el uso intensivo de emojis y kaomojis, orientada a roleplay y charla informal, y conserva las capacidades generales del modelo base de 9B.

El artefacto principal es una cuantización Q4_K_M de 5,78 GB que contiene 9.197.093.888 parámetros distribuidos en 442 tensores bajo la arquitectura `qwen35`, acompañada de un proyector de visión F16 de 918 MB y una plantilla de chat externa en formato Jinja. La metadata declara una longitud de contexto de 262.144 tokens, aunque el autor advierte que el límite práctico lo marca la caché KV: 32K es un punto de partida realista en tarjetas de 12-16 GB.

Su relevancia actual es doble: por un lado demuestra el flujo de conversión de un checkpoint bf16 fusionado a GGUF con visión preservada; por otro, ilustra el patrón de modelos de persona ("persona tune") que se distribuyen como cuantizaciones ligeras para consumo local. No es un modelo de propósito general ni una versión oficial de Qwen, sino un derivado de la comunidad bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `qwen35` (incluye cabeza MTP de 1 capa, `nextn_predict_layers = 1`); proyector de visión CLIP separado (334 tensores) |
| Parametros totales | 9.197.093.888 (9,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens en metadata; límite práctico determinado por la caché KV (32K realista en 12-16 GB) |
| Tipos de cuantizacion | Q4_K_M (5,78 GB) para el modelo; proyector de visión en F16 (918 MB); el repo bf16 de origen ofrece pesos completos |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors bf16 (19,3 GB, 4 shards) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer denso de 9,2B parámetros. La arquitectura `qwen35` en el GGUF incluye una cabeza de predicción multi-token (MTP) de una sola capa (`nextn_predict_layers = 1`), pensada para decodificación especulativa; el autor recomienda dejarla desactivada salvo que se mida una ganancia real en el hardware objetivo. El componente multimodal se sirve como proyector CLIP independiente en F16, lo que permite cargar solo el texto si no se necesita visión y ahorrar 918 MB de RAM.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO en el fine-tune de persona. El autor describe el resultado como un "persona tune, not a safety tune": la persona reside en los pesos y no en un system prompt, de modo que un prompt de sistema vacío reproduce el comportamiento de las capturas de demostración. El GGUF se convirtió desde el checkpoint bf16 fusionado de wesjos/Qwen3.5-9B-CuteHuman y no incorpora plantilla de chat en la metadata (43 claves, sin `tokenizer.chat_template`), por lo que es obligatorio pasar la plantilla externa del repositorio.

## Capacidades

- Generación de texto conversacional multi-turno con registro informal, emojis y kaomojis como registro por defecto.
- Comprensión de imágenes mediante el proyector CLIP: la pipeline declarada es `image-text-to-text`.
- Modo de razonamiento ("thinking") activado por defecto en la plantilla; se desactiva con `chat_template_kwargs: {"enable_thinking": false}`.
- Capacidades heredadas del base de 9B en razonamiento, matemáticas y código, aunque limitadas por el tamaño y por la cuantización Q4_K_M.
- Soporte bilingüe chino-inglés; no se declaran otros idiomas.
- Compatibilidad con endpoints tipo OpenAI a través de `llama-server` (`/v1/chat/completions`).
- No se documenta soporte explícito de tool calling ni de flujos de agentes multi-paso en la información disponible.
- Capacidad de mantener una "bit" o broma durante muchos turnos, según el autor.

## Casos de uso

- Roleplay y compañía conversacional local: el modelo mantiene personajes y bromas a lo largo de la conversación sin depender de un system prompt extenso, lo que simplifica el despliegue en aplicaciones de chat de consumo.
- Asistente de chat con imágenes en escritorio: cargando el proyector F16 se pueden enviar capturas o fotos junto al texto, útil para prototipos de asistentes visuales que deben correr en una sola GPU de consumo.
- Pruebas de persona y evaluación de estilos: sirve como banco de pruebas para medir cómo un fine-tune de persona altera el tono sin destruir las capacidades del base, comparando contra Qwen3.5-9B sin ajustar.
- Generación de diálogo para prototipos de videojuegos o narrativa interactiva: el registro emoji-first y la persistencia de contexto encajan en NPCs y chatbots de entretenimiento, con la salvedad de revisar salidas antes de exponerlas a usuarios.
- Despliegue en hardware modesto con llama.cpp: el Q4_K_M de 5,78 GB permite servir el modelo en GPUs de 12-16 GB o incluso en CPU, con contexto reducido a 32K.
- Experimentación con decodificación especulativa: la cabeza MTP de una capa permite probar `--jinja` y decodificación especulativa en llama.cpp para medir latencia en el hardware propio.
- Base para fine-tunes posteriores en chino e inglés: al ser Apache-2.0 y estar disponible también en bf16, se puede reutilizar como punto de partida para ajustes de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para el modelo de texto en Q4_K_M: aproximadamente 5,8 GB de pesos más caché KV; el autor sitúa un contexto de 32K como arranque realista en tarjetas de 12-16 GB.
- VRAM adicional para visión: 918 MB del proyector F16, prescindible si solo se usa texto.
- VRAM para el checkpoint bf16 completo: 19,3 GB en 4 shards, lo que exige GPUs de 24 GB o más (RTX 3090/4090, A100, H100) para inferencia cómoda.
- GPUs de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super y superiores con contexto moderado; en 8 GB habría que reducir contexto o cuantizar más agresivamente.
- GPUs de datacenter: A100 y H100 sin problema para bf16; para Q4_K_M son sobredimensionadas salvo que se busque throughput alto con `-ngl 99`.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), con flags `-c 32768 -ngl 99 -fa on --jinja`; el repo está etiquetado como `endpoints_compatible`. No se documenta compatibilidad con vLLM, TGI u Ollama en la información disponible.
- Latencia y throughput: no disponibles; dependen del hardware y del contexto efectivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| wesjos/Qwen3.5-9B-CuteHuman-GGUF | 9,2B | 262.144 (metadata); 32K práctico | Sí (CLIP F16) | Apache-2.0 | GGUF | Persona emoji-first, Q4_K_M 5,78 GB |
| Qwen/Qwen3.5-9B | 9,2B | No disponible en la información | No disponible en la información | No disponible en la información | No disponible en la información | Modelo base sin ajuste de persona |
| wesjos/Qwen3.5-9B-CuteHuman | 9,2B | No disponible en la información | Sí (hereda del base) | Apache-2.0 | Safetensors bf16 (19,3 GB) | Checkpoint completo de origen, mayor calidad que Q4_K_M |
| wesjos/Qwen3.8-27B-CuteHuman-LoRA | ~27B | No disponible en la información | No disponible en la información | No disponible en la información | LoRA (42 MB) sobre Qwen3.8-27B | Hermano mayor, "más rico y más cute", requiere el base de 27B |

## Limitaciones y advertencias

- La cuantización Q4_K_M introduce una pérdida de calidad frente al bf16, más visible en razonamiento largo.
- Techo de conocimiento de 9B: hechos, matemáticas y razonamiento extenso quedan al nivel del tamaño; el autor remite al hermano de 27B para cerrar esa brecha.
- El modelo tiende a alargar las bromas y el registro informal; conviene un system prompt para acotarlo cuando se necesita una respuesta directa.
- Es un ajuste de persona, no de seguridad: no se ha alineado específicamente para rechazar contenido dañino, por lo que hay que revisar las salidas antes de exponerlas a usuarios finales.
- Riesgo de alucinación inherente a un modelo de 9B, agravado por el estilo conversacional y por el modo thinking activado por defecto, que consume presupuesto de tokens antes de la respuesta visible.
- Idiomas limitados a chino e inglés; el rendimiento en castellano no está garantizado ni documentado.
- El GGUF no incluye plantilla de chat: sin `chat_template.jinja` el servidor cae en un prompt genérico y la persona suena "off".
- El contexto de 262.144 tokens es una cifra de metadata; la caché KV limita el uso real y encarece el despliegue en GPUs pequeñas.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base y sus derivados deben verificarse por separado; no se documentan restricciones adicionales del autor.
- No se documenta soporte de tool calling ni de agentes, por lo que no es adecuado para pipelines que dependan de function calling sin validación previa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/Qwen3.5-9B-CuteHuman-GGUF
- Modelo completo bf16: https://huggingface.co/wesjos/Qwen3.5-9B-CuteHuman
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Hermano 27B (LoRA): https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA
- Hermano 27B (adaptador GGUF): https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF
