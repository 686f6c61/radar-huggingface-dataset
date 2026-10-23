# unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF

## Resumen

El repositorio `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF` contiene la versión cuantizada en formato GGUF del modelo NVIDIA-Nemotron-3.5-Bolt-E4B, un modelo de lenguaje pequeno (SLM) desarrollado por NVIDIA mediante post-entrenamiento a partir de Gemma-4-E4B-it. Unsloth actúa aquí como cuantizador y distribuidor: toma los pesos BF16 originales y los publica en su serie Dynamic 3.0 de GGUF, pensada para inferencia local con llama.cpp.

El modelo está optimizado explícitamente para asistentes de voz y de dispositivo, personas interactivas e interfaces embebidas, con énfasis declarado en bajo consumo de memoria y bajo tiempo hasta el primer token (TTFT). Incorpora controles en la plantilla de chat para activar o desactivar el modo de razonamiento (`enable_thinking`) con presupuesto de pensamiento en tiempo de ejecución, además de un modo conversacional conmutable (`conversational_mode`).

Su relevancia práctica está en la combinación de ventana de contexto de 64K tokens de entrada y 64K de salida, soporte declarado de 34 idiomas, licencia OpenMDW-1.1 que permite uso comercial y un tamaño que el autor denomina "4GB", lo que lo sitúa en el rango de despliegue en hardware de consumo. La model card indica 8B parámetros totales con 4B efectivos, mientras que el recuento real de safetensors del modelo base es de 7.518.069.290 parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-4-E4B (transformer decoder-only de la familia Gemma; el autor no detalla variantes internas) |
| Parámetros totales | 7.518.069.290 (~7,5B) según safetensors del modelo base; la model card declara 8B totales |
| Parámetros activos | 4B efectivos según la model card; no se especifica el mecanismo de activación ni si se trata de MoE |
| Longitud de contexto | 64K tokens de entrada y hasta 64K tokens de salida |
| Tipos de cuantización | GGUF; el autor documenta Q4_K_M y la serie Unsloth Dynamic 3.0 (niveles concretos no detallados en la información disponible) |
| Idiomas soportados | 34 idiomas: en, es, de, fr, it, pt, nl, pl, ru, uk, cs, sk, sl, hr, bg, da, sv, no, fi, et, lt, lv, el, hu, ro, tr, ar, hi, id, ja, ko, th, vi, zh |
| Licencia | OpenMDW-1.1 (`license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | GGUF (repositorio de 133,3 GB con varios niveles); los pesos originales en BF16 están en safetensors en el repo de NVIDIA |

## Arquitectura y entrenamiento

La arquitectura es Gemma-4-E4B, es decir, la variante de 4B parámetros efectivos de la familia Gemma en su iteración 4. NVIDIA parte del checkpoint instructivo `google/gemma-4-E4B-it` y aplica un post-entrenamiento propio orientado a tres objetivos declarados: uso de herramientas multi-turno, seguimiento de instrucciones y anclaje de la entrada (input grounding). Los conjuntos de datos asociados al modelo son `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`, ambos publicados por NVIDIA como parte de su política de datos abiertos.

El número exacto de tokens de entrenamiento, la composición del dataset y si se emplearon técnicas de RLHF, DPO u otras variantes de alineación no se detallan en la información disponible. La fecha de corte de los datos de post-entrenamiento es mayo de 2026, y el desarrollo del modelo se sitúa entre diciembre de 2025 y mayo de 2026.

Como innovaciones técnicas destacables, la model card menciona tres mecanismos: control del modo de razonamiento mediante la plantilla de chat (`enable_thinking=True/False`) con presupuesto de pensamiento ajustable en tiempo de ejecución, un modo conversacional conmutable (`conversational_mode=True/False`) y soporte de decodificación especulativa mediante un drafter dedicado, `NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash`, publicado como GGUF BF16 independiente. El muestreo recomendado es temperatura 1.0 y top_p 0.95 en ambos modos de razonamiento.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del ajuste instructivo de Gemma-4-E4B-it.
- Uso de herramientas (tool calling / function calling) multi-turno, uno de los ejes explícitos del post-entrenamiento de NVIDIA.
- Seguimiento de instrucciones reforzado respecto al modelo base.
- Anclaje de la entrada (input grounding): capacidad de ceñirse a información proporcionada en el contexto.
- Modo de razonamiento activable mediante plantilla de chat, con presupuesto de tokens de pensamiento configurable en tiempo de ejecución.
- Modo conversacional conmutable, orientado a diálogo directo sin cadena de razonamiento explícita.
- Cobertura multilingüe declarada de 34 idiomas.
- Decodificación especulativa compatible mediante el drafter DFlash del mismo autor.
- Entrada y salida exclusivamente de texto según la model card (`text / text`); no se declaran capacidades de visión ni audio en esta variante.
- Compatibilidad con endpoints OpenAI-like (`endpoints_compatible` en los tags del repositorio).

## Casos de uso

- Asistentes de voz locales: el modelo puede insertarse en un pipeline ASR → LLM → TTS y mantener conversaciones multi-turno con baja latencia, gracias a su tamaño reducido (4B efectivos) y al objetivo declarado de bajo TTFT. Es el caso de uso principal que NVIDIA documenta, con el robot Reachy como demostración.
- Interfaces embebidas y edge computing: al caber en el rango de 4 GB en Q4_K_M, es viable en placas tipo Jetson, mini-PC o portátiles sin GPU dedicada, ejecutando llama.cpp con `-ngl 999` si hay aceleración disponible.
- Personas interactivas y NPCs: el modo conversacional (`conversational_mode=True`) permite diálogo con personalidad fija sin el coste de tokens de un modo de razonamiento completo, adecuado para juegos y aplicaciones de compañía.
- Agentes domésticos con tool calling: con soporte multi-turno de funciones, puede encadenar llamadas a APIs de domótica, calendario o clima dentro de una misma conversación, manteniendo el estado en la ventana de 64K.
- Atención al cliente con privacidad por diseño: al ejecutarse en local, permite procesar historiales largos (hasta 64K tokens) sin enviar datos a un proveedor externo, útil en sectores con requisitos de residencia de datos.
- Procesamiento de documentos extensos: la ventana de salida de 64K permite resúmenes, extracciones y reescrituras largas en una sola pasada, sin concatenar generaciones.
- Traducción y soporte multilingüe: con 34 idiomas declarados, cubre escenarios de soporte en mercados europeos y asiáticos desde un único modelo.
- Prototipado rápido y CI: el servidor de llama.cpp expone una API compatible con OpenAI, lo que permite integrarlo en tests automatizados y pipelines de evaluación sin infraestructura adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas equivalentes, ni comparaciones numéricas con modelos de la misma categoría. El autor remite a su documentación de cuantización Dynamic 3.0 para benchmarks de cuantización, pero no a resultados de capacidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: en Q4_K_M, un modelo de ~7,5B parámetros ocupa del orden de 4,3 a 4,7 GB de pesos; el nombre comercial "4GB" apunta a ese objetivo. El KV cache para 64K tokens de contexto requiere memoria adicional cuyo tamaño exacto no está disponible en la información proporcionada.
- GPU de consumo: cabe en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 4060, RTX 3070); con 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB) se puede ampliar el contexto y el tamaño de lote. En 24 GB (RTX 4090) sobra espacio para contextos largos y el drafter.
- GPU de servidor: A100, H100 y L40S permiten mayor paralelización y throughput, aunque el modelo está diseñado para despliegue local más que para servidor.
- CPU: al ser GGUF, es viable la inferencia solo en CPU, con latencias considerablemente mayores; no se publican cifras de tokens por segundo.
- Opciones de despliegue: llama.cpp es la vía documentada, con la imagen Docker `ghcr.io/ggml-org/llama.cpp:server-cuda13-b11459`, flags `-c 65536`, `-ngl 999` y `--jinja` para habilitar la plantilla de chat. El soporte en vLLM, TGI u Ollama no se confirma en la información disponible.
- Decodificación especulativa: se recomienda descargar el drafter `NVIDIA-Nemotron-3.5-Bolt-E4B-DFlash-BF16.gguf` junto al modelo principal para acelerar la generación.
- Latencia y throughput: no se publican valores numéricos; la model card solo declara un objetivo de bajo TTFT.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF` (este) | ~7,5B totales / 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | GGUF (Dynamic 3.0) | Cuantización de Unsloth; orientado a despliegue local |
| `nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16` | ~7,5B totales / 4B efectivos | 64K entrada / 64K salida | OpenMDW-1.1 | safetensors BF16 | Pesos completos; mayor VRAM, sin pérdida por cuantización |
| `google/gemma-4-E4B-it` | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | Modelo base del post-entrenamiento; carece de los ajustes de tool use y grounding de NVIDIA |
| Alternativas de ~4B de otros fabricantes | no disponible en la información | no disponible en la información | no disponible en la información | no disponible en la información | No se han proporcionado datos comparativos de otros modelos de la misma categoría |

## Limitaciones y advertencias

- La versión distribuida en este repositorio es una cuantización Q4_K_M (y posiblemente otros niveles de la serie Dynamic 3.0): introduce pérdida de precisión respecto al BF16, perceptible en tareas de razonamiento matemático y generación de código.
- La model card declara entrada y salida exclusivamente de texto. Aunque el modelo base Gemma-4-E4B-it pueda tener otras modalidades, esta variante no las anuncia; no debe asumirse soporte de visión o audio.
- No hay resultados de benchmarks publicados en la información disponible, por lo que el rendimiento real frente a alternativas de tamaño similar no está verificado de forma independiente.
- Riesgo de alucinación inherente a los SLM: con 4B parámetros efectivos, la fiabilidad en dominios especializados y en cadenas de razonamiento largas es limitada, y el modo `enable_thinking` no garantiza corrección.
- Fecha de corte de datos de post-entrenamiento: mayo de 2026. Cualquier evento posterior no está cubierto.
- La licencia OpenMDW-1.1 se registra como `license: other` en HuggingFace, no como una licencia OSI estándar. La model card afirma que el modelo está listo para uso comercial y no comercial, pero conviene revisar el texto completo de OpenMDW-1.1 antes de integrarlo en producción.
- La calidad por idioma no está documentada: se declaran 34 idiomas, pero sin métricas por lengua; el rendimiento en idiomas distintos del inglés puede degradarse.
- El repositorio ocupa 133,3 GB porque contiene múltiples niveles de cuantización; debe descargarse únicamente el archivo GGUF necesario.
- No se documentan sesgos específicos ni evaluaciones de seguridad o red teaming en la información disponible.
- El contexto de 64K es el máximo nominal; la degradación efectiva con contextos muy largos no está medida.

## Enlaces

- Repositorio HuggingFace de esta cuantización: https://huggingface.co/unsloth/NVIDIA-Nemotron-3.5-Bolt-E4B-GGUF
- Modelo base en BF16: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-BF16
- Drafter DFlash para decodificación especulativa: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-DFlash
- Modelo base original de Google: https://huggingface.co/google/gemma-4-E4B-it
- Informe técnico (PDF): https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB-Technical-Report.pdf
- Blog de NVIDIA sobre el modelo: https://research.nvidia.com/labs/nemotron/NVIDIA-Nemotron-3.5-Bolt-E4B-4GB/
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Guía de Unsloth para ejecutar Nemotron 3.5 Bolt: https://unsloth.ai/docs/models/nemotron-3.5-bolt
- Benchmarks de cuantización Unsloth Dynamic 3.0: https://unsloth.ai/docs/basics/unsloth-dynamic-v3.0-gguf
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Discord de Unsloth: https://discord.gg/unsloth
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia en GitHub: https://github.com/OpenMDW/OpenMDW/blob/main/1.1/LICENSE.OpenMDW-1.1
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
