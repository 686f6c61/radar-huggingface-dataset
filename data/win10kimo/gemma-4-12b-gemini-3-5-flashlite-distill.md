# win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill

## Resumen

Gemma-4-12B-Gemini-3.5-FlashLite-Distill es un ajuste fino del modelo `google/gemma-4-12B-it`, publicado por el usuario win10kimo en Hugging Face. Se trata de una destilación de trayectorias sintéticas generadas por Gemini 3.5 Flash-Lite, orientada a tareas de agente CLI, ingeniería de software y razonamiento paso a paso. El entrenamiento se realizó mediante QLoRA sobre 5.990 trayectorias verificadas, combinando soluciones directas de código con invocaciones nativas de la herramienta `run_shell`.

El modelo conserva las capacidades multimodales (visión) del Gemma 4 original y las convenciones de tokens especiales de la familia (`<|channel>thought`, `<|tool_call>`), lo que permite un modo de razonamiento en primera persona y la ejecución autónoma de comandos de shell en entornos locales. Se distribuye principalmente en formato GGUF, con cuantizaciones Q4_K_M y Q3_K_S, además del proyector multimodal y los adaptadores LoRA en bruto.

Su relevancia actual radica en que ofrece un modelo de 12B parámetros ejecutable en hardware de consumo, especializado en flujos de trabajo de agente de línea de comandos, con licencia Apache 2.0 y compatible con LM Studio, Atomic Chat y llama.cpp. No obstante, el repositorio tiene 0 descargas y 1 like en el momento de la consulta, por lo que se trata de una publicación muy reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de `google/gemma-4-12B-it`); ajuste fino mediante QLoRA |
| Parametros totales | 52.379.904 (según safetensors del repo de adaptadores; el modelo base es de 12B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (4 bits), Q3_K_S (3 bits), BF16 (proyector multimodal), LoRA en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (modelo y proyector), safetensors/PEFT (adaptadores LoRA) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it`, un transformer multimodal de la familia Gemma 4 con entrada de texto e imagen. Sobre esa base se aplicó un ajuste fino QLoRA con `r=32`, `lora_alpha=64`, `lora_dropout=0`, aplicado a todas las proyecciones lineales de atención y MLP, lo que supone 131,1 millones de parámetros entrenables (1,08 % del total). El entrenamiento se ejecutó en una NVIDIA L4 de 24 GB en bfloat16, con 2 épocas (1.468 pasos), programación coseno con LR 2e-4, `adamw_8bit` y tamaño de lote efectivo de 8.

El conjunto de datos consta de 5.990 trayectorias sintéticas de un solo turno destiladas de Gemini 3.5 Flash-Lite: 4.941 soluciones directas de CLI/código y 1.049 trayectorias con invocación nativa de `run_shell` cubriendo Linux, PowerShell, CMD, Git, Docker, SQL y sistemas de build de C/C++/Rust/Python/Node. Se aplicó enmascaramiento de pérdida (`train_on_responses_only`), de modo que el cálculo se restringe a las trazas de razonamiento `<|channel>thought`, a los entregables y a la sintaxis `<|tool_call>`, sin gastar pérdida en los prompts de usuario. La pérdida de validación (split retenido del 2 %) descendió de 0,6751 en el paso 150 a 0,5904 en el paso 1.350.

## Capacidades

- Generación de texto y razonamiento en cadena de pensamiento en primera persona mediante el canal `<|channel>thought`.
- Asistencia a agentes CLI: ejecución autónoma de comandos de shell con el formato `<|tool_call>call:run_shell{...}<tool_call|>`.
- Generación y resolución de código en múltiples lenguajes y ecosistemas (Linux, PowerShell, CMD, Git, Docker, SQL, C/C++/Rust/Python/Node).
- Soporte nativo de tool calling / function calling con las convenciones de tokens especiales de Gemma 4.
- Capacidades multimodales de visión heredadas del modelo base, mediante el proyector `mmproj` en BF16.
- Razonamiento multi-paso orientado a tareas de ingeniería de software y automatización de terminal.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de terminal local: el modelo puede interpretar una petición en lenguaje natural y emitir la llamada `run_shell` adecuada, integrándose en LM Studio o llama.cpp para automatizar tareas de administración de sistemas en Linux, PowerShell o CMD.
- Automatización de pipelines de build: con trayectorias de entrenamiento específicas para sistemas de build de C/C++/Rust/Python/Node, puede generar y depurar comandos de compilación y resolver errores de dependencias.
- Gestión de contenedores y Git: las 1.049 trayectorias de tool calling cubren Docker y Git, lo que permite al modelo proponer secuencias de comandos para construir imágenes, gestionar ramas o resolver conflictos.
- Consultas a bases de datos: el entrenamiento incluye SQL, de modo que el modelo puede redactar consultas y comandos de cliente de base de datos a partir de descripciones en lenguaje natural.
- Revisión y generación de código en producción: el ajuste sobre soluciones directas de código permite usarlo como asistente de par programación en editores que consuman GGUF vía llama.cpp.
- Análisis de capturas de pantalla en flujos de soporte técnico: gracias al proyector multimodal, puede recibir una imagen (por ejemplo, un error en pantalla) y razonar sobre ella antes de proponer comandos.
- Despliegue en hardware modesto: la cuantización Q3_K_S de 5,15 GB está pensada para GPUs con 6 GB de VRAM, lo que habilita prototipos de agente CLI en equipos de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la progresión de pérdida de entrenamiento y validación:

| Paso | Época | Pérdida de entrenamiento | Pérdida de validación |
|---|---|---|---|
| 150 | 0,20 | 0,7088 | 0,6751 |
| 300 | 0,41 | 0,6582 | 0,6608 |
| 450 | 0,61 | 0,6282 | 0,6396 |
| 600 | 0,82 | 0,6309 | 0,6244 |
| 750 | 1,02 | 0,5093 | 0,6142 |
| 900 | 1,23 | 0,5069 | 0,6072 |
| 1050 | 1,43 | 0,4617 | 0,6047 |
| 1200 | 1,63 | 0,4845 | 0,5941 |
| 1350 | 1,84 | 0,4715 | 0,5904 |

## Requisitos de hardware

- VRAM estimada: aproximadamente 6,9 GB para Q4_K_M y 5,2 GB para Q3_K_S, más el proyector multimodal de 167 MB en BF16.
- GPU recomendadas: NVIDIA L4 de 24 GB (usada en el entrenamiento); para inferencia, cualquier GPU con al menos 8 GB de VRAM para Q4_K_M.
- Cabe en GPU de consumo: sí, Q3_K_S está diseñado explícitamente para GPUs de 6 GB de VRAM; Q4_K_M requiere alrededor de 8 GB.
- Opciones de despliegue: LM Studio, Atomic Chat, llama.cpp y cualquier runtime compatible con GGUF; los adaptadores LoRA en bruto permiten fusionarlos con Unsloth/PEFT.
- Ajustes de inferencia recomendados por el autor: thinking activado (`<|channel>thought\n`), token de parada `<turn|>`, temperatura 0,2–0,3, top-p 0,95, top-k 64, penalización de repetición 1,05.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-12B-Gemini-3.5-FlashLite-Distill | 12B (base) | no disponible | Apache 2.0 | GGUF, LoRA | Ajuste para agente CLI y tool calling |
| google/gemma-4-12B-it | 12B | no disponible | no disponible | no disponible | Modelo base multimodal oficial |
| google/gemma-4-12B (Unified) | 12B | no disponible | no disponible | no disponible | Variante unificada con audio, imagen y vídeo |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 1 like, por lo que no existe validación comunitaria ni evidencia independiente de calidad.
- El ajuste fino se realizó sobre 5.990 trayectorias sintéticas de un solo turno; el comportamiento en conversaciones multi-turno largas no está documentado.
- La pérdida de validación se estabiliza alrededor de 0,59, sin datos de benchmarks que confirmen mejora frente al modelo base en tareas reales.
- Riesgo de alucinación inherente a los modelos destilados de trayectorias sintéticas, especialmente en comandos de shell con efectos destructivos; se recomienda sandboxing y confirmación humana.
- Sesgos conocidos: no disponible.
- Idiomas soportados: no disponible; no se documenta cobertura multilingüe.
- Longitud de contexto: no disponible; conviene verificar el límite del modelo base antes de usarlo en producción.
- Licencia Apache 2.0 declarada por el autor, pero el modelo base Gemma 4 puede estar sujeto a términos adicionales de Google; conviene revisar la licencia del modelo base antes de un uso comercial.
- Los parámetros totales reportados en safetensors (52,4 M) corresponden a los adaptadores LoRA, no al modelo completo de 12B.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/win10kimo/Gemma-4-12B-Gemini-3.5-FlashLite-Distill
- Modelo base en Hugging Face: https://huggingface.co/google/gemma-4-12B
- Página oficial de Gemma 4 (Google DeepMind): https://deepmind.google/models/gemma/gemma-4/
