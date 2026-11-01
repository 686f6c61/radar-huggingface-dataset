# tomo-o/llm-jp-4.1-8b-thinking-p150

## Resumen

`tomo-o/llm-jp-4.1-8b-thinking-p150` es un paquete de despliegue publicado por el usuario tomo-o que empaqueta el modelo `llm-jp/llm-jp-4.1-8b-thinking` (LLM-jp-4.1 8B, variante con modo de razonamiento) para ejecutarse sobre una única chip Tenstorrent Blackhole P150 mediante vLLM y el plugin de vLLM de Tenstorrent. No se trata de un modelo nuevo entrenado por el autor, sino de un artefacto de distribución que fija los pesos del modelo base en un commit concreto y los acompaña de una imagen de contenedor con los kernels compilados para el hardware P150.

El modelo subyacente es un decoder-only denso de 8B parámetros de estilo Llama, con un vocabulario de 196.608 tokens, desarrollado por LLM-jp, el consorcio japonés de investigación en modelos de lenguaje. Su rasgo diferencial es el modo *thinking*: separa el texto de razonamiento del contenido de la respuesta final, algo que el paquete expone mediante el parser de razonamiento `llmjp4` de vLLM.

La relevancia de este paquete es acotada pero concreta: demuestra la viabilidad de servir un modelo de razonamiento de 8B en japonés sobre aceleradores Tenstorrent, con una ventana de contexto de 65.536 tokens y hasta 32 secuencias concurrentes, a través de una API compatible con OpenAI. Está marcado explícitamente como *bring-up* experimental de la comunidad, no como un despliegue de producción validado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (estilo Llama) |
| Parámetros totales | 8B (heredado del modelo base) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantización | no disponible (el paquete fija los pesos del modelo base en el commit `7c19bc90e49b717381e4f474ee95964c05217a28`; no se documenta el formato numérico de los pesos) |
| Idiomas soportados | no disponible en la información proporcionada; el modelo base es de LLM-jp y los ejemplos y evaluaciones son en japonés |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se descargan del repositorio del modelo base; el paquete en sí es una imagen de contenedor de 1,9 GB sin pesos) |
| Vocabulario | 196.608 tokens |
| Hardware objetivo | 1 chip Tenstorrent Blackhole P150 (perfil `p150a`, mesh `P150`) |
| Concurrencia máxima | 32 secuencias |
| Capacidad de KV cache | 133.120 tokens (hasta 28 secuencias de 4.608 tokens o 32 de 4.160) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un decoder-only denso de 8B parámetros con vocabulario de 196.608 tokens y arquitectura de estilo Llama. No se detallan en la documentación proporcionada el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo específico para el modo de razonamiento. Tampoco se especifican innovaciones de atención (attention linear, decodificación especulativa, etc.).

Lo que sí documenta el paquete es la capa de servicio: vLLM 0.26.0 con el plugin de Tenstorrent, con muestreo en dispositivo restringido a la fase de decodificación (`sample_on_device_mode: decode_only`), prefilling de prompts de uno en uno, y un parser de razonamiento específico (`llmjp4`) que separa el bloque de análisis del contenido final. El formato de razonamiento emplea cabeceras del tipo `<|channel|>analysis<|message|>`, cuya probabilidad de generación decae a medida que crece el prompt de entrada.

## Capacidades

- Generación de texto y razonamiento en modo *thinking*, con separación explícita entre el texto de análisis (`reasoning`) y la respuesta final (`content`).
- Razonamiento matemático: evaluado en GSM8K y MGSM-ja con resultados publicados por el autor del paquete.
- Conversación multi-turno en japonés, con prompts de hasta 65.536 tokens.
- Tool calling / function calling: el servidor habilita el parser `llmjp4` y devuelve `tool_calls` con `finish_reason: tool_calls` cuando la petición incluye `tools`.
- Servicio concurrente: hasta 32 peticiones simultáneas con una sola instancia.
- API compatible con OpenAI: endpoints de chat completions, completions y `/v1/models`.
- Capacidades multimodales: no soportadas (explícitamente fuera de alcance).
- Restricción de tool calling forzado: `tool_choice: "required"` y el nombre de herramienta se aceptan pero no restringen la salida.

## Casos de uso

- Asistencia conversacional en japonés sobre hardware Tenstorrent: el modelo puede atender hasta 32 usuarios concurrentes con prompts de hasta 1k tokens manteniendo una velocidad de decodificación por usuario dentro del 8% de la de un solo usuario (47,4 tok/s frente a 50,1 tok/s), lo que lo hace apto para chat interactivo en entornos con aceleradores Blackhole.
- Razonamiento matemático en japonés: con un 94,7% en GSM8K y un 86,8% en MGSM-ja en modo greedy y 32 peticiones concurrentes, es adecuado para tutores o asistentes de resolución de problemas aritméticos en producción con validación humana.
- Automatización de soporte técnico con tool calling: la integración con el parser `llmjp4` permite que el modelo emita llamadas a herramientas estructuradas, útil para orquestar consultas a bases de datos o APIs internas desde un servidor compatible con OpenAI.
- Procesamiento de documentos largos en japonés: con 65.536 tokens de contexto, puede resumir o extraer información de contratos, informes o expedientes extensos, aunque con latencia creciente (49,7 s de TTFT y 2,9 tok/s por usuario a 64.000 tokens de entrada).
- Evaluación y benchmarking de pilas de inferencia sobre Tenstorrent: el paquete incluye métricas reproducibles de TTFT y throughput, lo que lo convierte en una referencia para comparar el rendimiento de vLLM con el plugin de Tenstorrent frente a despliegues en GPU.
- Prototipado de agentes con razonamiento visible: al separar `reasoning` de `content`, permite construir interfaces que muestren el proceso de pensamiento al usuario o que lo registren para auditoría, en flujos de razonamiento multi-paso.
- Despliegue en entornos con restricciones de aceleradores NVIDIA: al ejecutarse sobre Blackhole P150, sirve como alternativa en infraestructuras que ya cuentan con hardware Tenstorrent y quieren evitar añadir GPUs.

## Benchmarks y rendimiento

Precisión (coincidencia numérica, greedy, `max_tokens` 4.096, 32 peticiones concurrentes, build anterior del mismo código):

| Benchmark | Resultado | Muestras |
|---|---|---|
| GSM8K | 94,7% | 1.249 de 1.319 |
| MGSM-ja | 86,8% | 217 de 250 |

Rendimiento en un P150 (p150a), vLLM 0.26.0, streaming, temperatura 0, `ignore_eos`, prompts de números aleatorios:

| Entrada / salida | Usuarios | TTFT | Decodificación por usuario | Salida total |
|---|---:|---:|---:|---:|
| 128 / 128 | 1 | 0,23 s | 50,1 tok/s | 46 tok/s |
| 128 / 128 | 32 | 4,1 s | 47,4 tok/s | 601 tok/s |
| 1.024 / 128 | 1 | 0,38 s | 40,9 tok/s | 37 tok/s |
| 1.024 / 128 | 32 | 8,1 s | 37,7 tok/s | 356 tok/s |
| 4.096 / 512 | 1 | 1,7 s | 24,0 tok/s | 22 tok/s |
| 4.096 / 512 | 32 | 43,2 s | 16,5 tok/s | 199 tok/s |
| 16.384 / 256 | 1 | 6,6 s | 9,6 tok/s | 7,7 tok/s |
| 32.768 / 256 | 1 | 17,9 s | 5,3 tok/s | 3,9 tok/s |
| 64.000 / 256 | 1 | 49,7 s | 2,9 tok/s | 1,8 tok/s |

No se han publicado en la información disponible resultados de MMLU, HumanEval ni otras comparativas frente a modelos de referencia.

## Requisitos de hardware

- Acelerador: una única chip Tenstorrent Blackhole P150 (perfil `p150a`, mesh `P150`). No hay perfiles P150x2 ni P150x4.
- No es compatible con GPU NVIDIA, AMD ni con CPU convencional: los kernels están compilados para el dispositivo Tenstorrent.
- Host de referencia: KVM guest sobre Xeon Gold 6444Y.
- Memoria: el paquete pesa 1,9 GB sin pesos; los pesos del modelo base se descargan aparte en la caché de Hugging Face.
- Despliegue: `tt serve` o `tt-model serve` (CLI de Tenstorrent, `tt-model-manager` 0.1.0, esquema de manifiesto 5.1), que levanta un servidor compatible con OpenAI en el puerto 20000 (o el siguiente libre). La primera ejecución compila kernels y tarda varios minutos.
- Alternativa sin CLI: `tt-model pull tomo-o/llm-jp-4.1-8b-thinking-p150 --with-weights` seguido de `tt-model serve`.
- KV cache: 133.120 tokens en total; por encima de esa capacidad las peticiones esperan admisión y la espera se refleja en el TTFT.
- Throughput agregado máximo observado: 601 tok/s con 32 usuarios y prompts de 128 tokens.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparativas con otros modelos de 8B ni con otros despliegues del mismo modelo base sobre GPU u otros aceleradores, más allá de la mención de que el problema de la cabecera de razonamiento a partir de ~58k tokens también se observa en GPU con vLLM.

## Limitaciones y advertencias

- Estado experimental: el propio autor lo etiqueta como *community bring-up*; no hay garantías de estabilidad ni de soporte.
- Hardware único: solo funciona en una chip P150; no hay perfiles multi-chip.
- Prompts largos: la probabilidad de generar la cabecera `<|channel|>analysis<|message|>` al inicio de la salida decae con la longitud del prompt. Hasta ~32k tokens es estable; a partir de ~50k puede sustituirse por otros tokens y el parser devuelve `reasoning` y `content` vacíos. A 64.000 tokens se observó este fallo, y el autor indica que también ocurre en GPU con vLLM, por lo que es una propiedad del modelo base.
- Capacidad de concurrencia limitada por la KV cache: 133.120 tokens en total; con secuencias largas se reduce el número de peticiones simultáneas y las adicionales esperan admisión.
- Prefilling secuencial: los prompts se procesan de uno en uno, lo que penaliza el TTFT con cargas concurrentes y entradas largas.
- Tool calling forzado no funcional: `tool_choice: "required"` y el nombre de herramienta se aceptan pero no restringen la salida.
- Sin soporte multimodal.
- Idiomas: la documentación no declara la lista de idiomas soportados; las evaluaciones y ejemplos son en japonés, y no hay datos sobre calidad en castellano u otras lenguas.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de sesgos; al ser un modelo de razonamiento de 8B, cabe esperar alucinaciones en dominios especializados, aunque no hay datos concretos en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero se aplica al paquete y al modelo base; conviene verificar las condiciones del repositorio original de LLM-jp.
- Sin datos de benchmarks generales (MMLU, HumanEval) en la información proporcionada, lo que dificulta evaluar su calidad fuera de matemáticas y japonés.

## Enlaces

- Repositorio del paquete: https://huggingface.co/tomo-o/llm-jp-4.1-8b-thinking-p150
- Modelo base: https://huggingface.co/llm-jp/llm-jp-4.1-8b-thinking
- Model card de referencia citada en los ejemplos: https://huggingface.co/llm-jp/llm-jp-4-vl-9b
- Herramienta de empaquetado: https://github.com/tenstorrent/tt-model-manager
