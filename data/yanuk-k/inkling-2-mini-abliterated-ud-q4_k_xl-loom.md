# Yanuk-K/Inkling-2-Mini-Abliterated-UD-Q4_K_XL-loom

## Resumen

Inkling-2-Mini-Abliterated-UD-Q4_K_XL-loom es un paquete de despliegue en formato Loom (programas `.loom` y una tarjeta `model.json`) para el modelo cuantizado `Inkling-2-Mini-abliterated-UD-Q4_K_XL.gguf`, derivado del checkpoint base `thinkingmachines/Inkling-2-Mini` a través de la variante "abliterated" publicada por `mrfakename`. Lo publica el usuario Yanuk-K y está pensado específicamente para ejecutarse sobre hardware AMD con la pila ROCm/HRX, en concreto en un Ryzen AI Max+ 395 "Strix Halo". No es un modelo nuevo, sino un port optimizado con decodificación especulativa y soporte de imagen sobre el GGUF ya existente.

El modelo cuenta con 26.070.390.272 parámetros (unos 26 mil millones) y una arquitectura `inkling2_loop` de 24 capas con un contenedor "merged-loop" que emplea mensajes de bucle de 4 carriles y `loop_msg_query` por capa. El contexto nativo es de 1.048.576 tokens, aunque el preset incluido en este paquete limita las peticiones a 131.072 tokens. La cuantización UD-Q4_K_XL almacena los expertos enrutados en NVFP4 con escalas f32 y los tensores densos en Q8_0/f32.

La relevancia de este paquete radica en que añade tres capacidades sobre la tarjeta del modelo base: el layout `inkling2_loop` fusionado, entrada de imagen mediante el proyector `inkling2v` con preprocesado a tamaño nativo y atención con query-tiling para imágenes grandes, y decodificación especulativa DFlash a profundidad 1. Según las mediciones del autor, Loom con DFlash es entre 1,8 y 2 veces más rápido en prefill y entre un 10 y un 25 % más rápido en decodificación que la implementación nativa de Gufo con DSpark sobre la misma máquina.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | `inkling2_loop`, transformer con contenedor merged-loop de 24 capas (4 carriles de bucle, `loop_msg_query` por capa) |
| Parámetros totales | 26.070.390.272 (aprox. 26,07 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 1.048.576 tokens nativos; preset del paquete: 131.072 tokens por petición |
| Tipos de cuantización | UD-Q4_K_XL (expertos enrutados en NVFP4 con escalas f32, tensores densos en Q8_0/f32) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (checkpoint preparado `inkling-loom-fmt.gguf`, 17,6 GB), más programas `.loom` y `model.json` |
| Tamaño del repositorio | 35,3 GB |
| Modelo base | `mrfakename/Inkling-2-Mini-abliterated-GGUF` (base original: `thinkingmachines/Inkling-2-Mini`) |
| Salida máxima | 4.096 tokens (preset `max_tokens`) |
| Concurrencia | 4 peticiones simultáneas |
| Muestreo | `temperature`, `top_p`, `top_k`, `seed` |

## Arquitectura y entrenamiento

La arquitectura es un transformer `inkling2_loop` de 24 capas con un contenedor "merged-loop": los mensajes de bucle viajan por 4 carriles y cada capa dispone de su propio `loop_msg_query`. El paquete no incluye información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos corresponden al modelo base `thinkingmachines/Inkling-2-Mini`, del que esta ficha no dispone de detalles. La variante "abliterated" de `mrfakename` elimina las direcciones de rechazo del modelo original, lo que cambia el comportamiento conversacional pero no la arquitectura.

La innovación técnica de este port reside en tres capas. Primero, la adaptación del layout fusionado con los programas `.loom`, que enlazan directamente los 744 tensores del GGUF UD-Q4_K_XL (nombres, tipos y dimensiones coinciden con la referencia preparada). Segundo, la incorporación del proyector de visión `inkling2v` con `g_embed` de entrada mixta, normalización `2*u8/255 - 1` a tamaño nativo y atención con query-tiling para imágenes grandes. Tercero, la decodificación especulativa DFlash a profundidad 1, activada por defecto y validada contra la salida sin drafter, usando el drafter `unsloth/Inkling-2-Mini-GGUF`.

## Capacidades

- Generación de texto conversacional multi-turno con ventana de contexto de hasta 131.072 tokens por petición en el preset incluido.
- Razonamiento con modo "thinking" activado por defecto, con niveles de esfuerzo `none`, `minimal`, `low`, `medium`, `high`, `xhigh` y `max` (por defecto `high`). Con `reasoning_effort: "none"` o `enable_thinking: false` se emite una traza corta y después la respuesta.
- Tool calling / function calling en formato OpenAI (`tools` / `tool_calls`) con el formato de llamada `inkling2`.
- Entrada de imagen mediante el proyector `inkling2v`, con partes de contenido `image_url` al estilo OpenAI.
- Decodificación especulativa DFlash a profundidad 1 activada por defecto.
- Muestreo configurable con `temperature`, `top_p`, `top_k` y `seed`.
- API compatible con OpenAI en `/v1/chat/completions`.
- Sin soporte de audio (ni entrada ni salida).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional de contexto largo: con 131.072 tokens por petición, el modelo puede mantener conversaciones o procesar documentos extensos (informes, expedientes, hilos de correo) sin truncar, manteniendo coherencia entre turnos.
- Análisis de documentos con imágenes: la entrada de visión permite enviar capturas, diagramas o páginas escaneadas junto con texto; por ejemplo, extraer datos de una tabla en una imagen de 640x640 con un TTFT de 0,73 s y decodificación a 59,3 tok/s.
- Automatización de agentes con tool calling: la integración con `tools`/`tool_calls` en formato OpenAI permite construir agentes que consulten APIs, ejecuten funciones y encadenen pasos multi-turno sobre el endpoint compatible.
- Procesamiento de imágenes de alta resolución: la atención con query-tiling del proyector permite procesar una imagen de 2080x1640 (8.528 tokens de parche) en unos 5,7 s de TTFT, útil para inspección de planos, radiografías o documentos densos.
- Generación de JSON estructurado: según las mediciones del autor, la tarea JSON alcanza 62,0 tok/s en decodificación con DFlash, adecuada para pipelines que necesitan salidas estructuradas verificables.
- Despliegue en hardware AMD consumer/workstation: el paquete está pensado para Strix Halo (Ryzen AI Max+ 395) con ROCm, lo que permite servir el modelo en una máquina integrada sin GPU dedicada, con `--memory_bytes=40000000000` cubriendo pesos, KV y estado.
- Razonamiento con esfuerzo configurable: los siete niveles de `reasoning_effort` permiten ajustar el coste computacional por consulta, desde respuestas rápidas (`none`) hasta trazas extensas (`max`) para problemas de análisis.

## Benchmarks y rendimiento

Rendimiento medido por el autor en la misma máquina (Strix Halo), mismo contexto de 131.072 tokens y mismo arnés de streaming con temporización del cliente (greedy, thinking por defecto, un motor a la vez), comparando Loom con DFlash profundidad 1 frente al motor nativo de Gufo con DSpark:

| Métrica | Loom (DFlash) | Gufo (DSpark) |
|---|---:|---:|
| Prefill tok/s, 1k / 4k / 8k | 1371 / 1399 / 1830 | 744 / 758 / 898 |
| Decode tok/s, prompt corto | 58,3 | 46,0 |
| Decode tok/s, contexto 2k | 51,4 | 43,2 |
| Decode tok/s, contexto 8k | 49,1 | 42,5 |
| Decode tok/s, contexto 32k | 39,8 | 34,3 |
| Tarea JSON, decode | 62,0 | 55,7 |
| Tarea de prosa, decode | 51,1 | 40,1 |
| Texto altamente predecible (conteo) | 61,2 | 65,7 |

Con el componente de imagen cargado (greedy, TTFT incluye el codificador de imagen y el prefill):

| Imagen | Tokens de imagen fusionados | TTFT | Decode |
|---|---:|---:|---:|
| 640x480 | 192 | 0,65 s | 58,1 tok/s |
| 640x640 | 256 | 0,73 s | 59,3 tok/s |
| 2080x1640 | 2.132 | ~5,7 s | 55 tok/s |

El caso de 2080x1640 corresponde a 8.528 tokens de parche; la torre con query-tiling los codifica en unos 5 s. El autor indica que la build de llama.cpp disponible para esta actualización no carga la arquitectura `inkling2_loop`; las mediciones anteriores con llama.cpp b1384 se conservan en `REPORT.md`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: el preset de 131.072 tokens requiere unos 4,6 GiB de KV, 17,6 GB de pesos y estado adicional; el autor recomienda `--memory_bytes=40000000000` (40 GB).
- GPU recomendadas: AMD Ryzen AI Max+ 395 "Strix Halo" es el hardware de referencia del paquete; el despliegue usa `amdgpu://` a través de ROCm/HRX. No hay datos para GPU NVIDIA en esta información.
- GPU consumer: el paquete está diseñado para memoria unificada de Strix Halo; no se documenta compatibilidad con GPU consumer NVIDIA (RTX 4090, etc.) en la información disponible.
- Despliegue: `loom-serve` con `--parameter_mode=preload` (necesario si `ulimit -l` es el valor por defecto de 8 MiB), o bien `gufo serve` con la extensión Loom sobre un directorio de paquete ya descargado. Instalación con `pipx install "hrx-loom[hf]==0.2.0"`.
- Latencia y throughput: prefill de 1371–1830 tok/s según longitud de entrada; decodificación de 58,3 tok/s con prompt corto y 39,8 tok/s a 32k de contexto; TTFT de imagen de 0,65 s (640x480) a ~5,7 s (2080x1640).
- Concurrencia: 4 peticiones simultáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-Abliterated-UD-Q4_K_XL-loom (este) | 26,07 B | 1.048.576 nativo; 131.072 preset | Apache 2.0 | GGUF + programas Loom, ROCm/Strix Halo | DFlash, visión, tool calling, thinking |
| mrfakename/Inkling-2-Mini-abliterated-GGUF (base) | no disponible | no disponible | no disponible | GGUF | Sin el port Loom; misma cuantización UD-Q4_K_XL |
| thinkingmachines/Inkling-2-Mini (base original) | no disponible | no disponible | no disponible | no disponible | Modelo sin abliterar |
| loom-fun/unsloth-Inkling-2-Mini-loom (paquete de referencia) | no disponible | no disponible | no disponible | Loom | Paquete del que se adapta este port; sin las adiciones de visión y DFlash descritas |

No se dispone de datos de benchmarks estándar para establecer una comparación de rendimiento con modelos de la misma categoría.

## Limitaciones y advertencias

- El modelo es una variante "abliterated": se han eliminado las direcciones de rechazo, por lo que puede producir contenido que el modelo original rechazaría. Requiere filtrado y moderación en producción.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede inventar datos, especialmente en tareas factuales.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe homogéneo.
- El preset limita el contexto a 131.072 tokens aunque el modelo nativo soporte 1.048.576; ampliar el preset incrementa el consumo de KV (aproximadamente 4,6 GiB a 131k).
- La salida máxima está limitada a 4.096 tokens por petición en el preset.
- La concurrencia está limitada a 4 peticiones simultáneas.
- El paquete está atado a la pila Loom/ROCm y al hardware Strix Halo de referencia; no se documenta funcionamiento en otras plataformas (NVIDIA, CPU, etc.).
- La build de llama.cpp disponible no carga la arquitectura `inkling2_loop`, lo que limita las alternativas de despliegue.
- `--parameter_mode=preload` es obligatorio con el valor por defecto de `ulimit -l` (8 MiB); sin él, el despliegue puede fallar.
- Licencia Apache 2.0: permite uso comercial, pero debe conservarse el aviso de licencia y no se ofrece garantía alguna.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente sin validación comunitaria amplia.

## Enlaces

- Hugging Face (este paquete): https://huggingface.co/Yanuk-K/Inkling-2-Mini-Abliterated-UD-Q4_K_XL-loom
- Modelo base GGUF: https://huggingface.co/mrfakename/Inkling-2-Mini-abliterated-GGUF
- Modelo original: `thinkingmachines/Inkling-2-Mini` (referenciado en la model card; sin URL directa en la información disponible)
- Paquete de referencia: https://huggingface.co/loom-fun/unsloth-Inkling-2-Mini-loom
- Drafter especulativo: https://huggingface.co/unsloth/Inkling-2-Mini-GGUF
- Repositorio Loom/HRX: https://github.com/ROCm/hrx-system
- Flujo loom-skills: https://github.com/loom-fun/loom-skills
- Gufo: https://github.com/gufo-org/gufo
- Extensión Loom para Gufo: https://github.com/loom-fun/loom-gufo-extension
