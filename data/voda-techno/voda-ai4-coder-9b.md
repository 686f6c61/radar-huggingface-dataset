# VoDa-Techno/VoDa-AI4-Coder-9b

## Resumen

VoDa-AI4-Coder-9b es un modelo de lenguaje especializado en generación de código e tareas de IT, publicado por VoDa-Techno en Hugging Face. Según su model card, se presenta como una edición de la familia VoDa AI4 construida a partir de Qwen, con soporte para ruso e inglés y distribución principal en formato GGUF Q4 para ejecución local vía Ollama. El modelo se comercializa como una opción "equilibrada" de 9B parámetros orientada a trabajo agéntico de programación: escritura, refactorización, depuración y explicación de código, además de interacción con archivos, terminal y búsqueda web a través de una integración denominada DeepSeek Harness.

Sin embargo, existe una discrepancia importante entre la denominación comercial y los datos técnicos verificables. El repositorio declara 456.010.480 parámetros reales en los pesos safetensors, muy lejos de los 9B que sugiere el nombre. El tamaño del repo (6,6 GB) es coherente con un modelo de aproximadamente 0,5B parámetros en precisión alta o con múltiples cuantizaciones, no con un modelo de 9B. Esta ficha refleja ambos datos y advierte explícitamente sobre la inconsistencia.

La relevancia del modelo es limitada en el ecosistema actual: no tiene descargas ni likes, la licencia es "other" sin texto público visible, y no se han publicado benchmarks. Se trata, por tanto, de una publicación reciente y de nicho, cuyo interés principal reside en su enfoque russófono para tareas de código y en su empaquetado para Ollama, más que en un rendimiento demostrado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen, sin detalle de variante) |
| Parametros totales | 456.010.480 (según safetensors); el nombre comercial indica 9B |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4 (según model card); otras cuantizaciones no disponibles |
| Idiomas soportados | ruso, inglés |
| Licencia | other (propietaria de VoDa AI; texto de LICENSE no disponible) |
| Formato de pesos | GGUF (distribución principal); safetensors referenciados en metadatos |

## Arquitectura y entrenamiento

La model card indica que el modelo se construye "a partir de Qwen" y que pertenece a la familia VoDa AI4, pero no especifica la arquitectura concreta, la variante de Qwen utilizada, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO o ajuste supervisado. Tampoco se documentan innovaciones técnicas como decodificación especulativa, atención lineal o mecanismos híbridos.

El único dato técnico verificable es el recuento de parámetros en safetensors (456.010.480), que contradice la etiqueta "9b" del nombre y de la tabla de la familia. No se dispone de información sobre la tokenizador, la ventana de contexto nativa ni la estrategia de alineación. Cualquier afirmación sobre el proceso de entrenamiento más allá de lo citado sería especulativa.

## Capacidades

- Generación de código: escritura, refactorización, depuración y explicación, según la model card.
- Soporte bilingüe ruso-inglés, con énfasis declarado en el ruso.
- Integración con DeepSeek Harness para acceso a archivos, terminal y búsqueda en internet.
- Ejecución local vía Ollama con el tag `beebosofficial/VoDa-AI4-Coder:9b`.
- Orientación a flujos agénticos de programación (multi-step) a través del harness citado.
- Tool calling / function calling: no disponible de forma explícita en la documentación.
- Capacidades multimodales (visión, audio): no disponibles.
- Modo thinking o razonamiento explícito: no disponible.

## Casos de uso

- Asistencia de código en local para desarrolladores russófonos: el modelo está entrenado y documentado en ruso e inglés, por lo que puede explicar y generar código con comentarios y mensajes de error en ruso, algo poco común en modelos abiertos.
- Autocompletado y refactorización en entornos con recursos limitados: su tamaño real (≈0,46B parámetros) y su empaquetado GGUF Q4 permiten ejecutarlo en portátiles sin GPU dedicada, según la propia model card ("хорошо работает на ноутбуке").
- Integración en pipelines de CI/CD para revisión de parches: puede usarse como paso de linting semántico o generación de mensajes de commit, siempre con validación humana dado el riesgo de alucinación.
- Automatización de tareas de terminal mediante DeepSeek Harness: la card menciona explícitamente archivos, terminal y búsqueda web, lo que habilita scripts agénticos de mantenimiento de repositorios.
- Soporte educativo en programación para hablantes de ruso: explicación de fragmentos de código y conceptos de IT con terminología en ruso.
- Prototipado rápido de utilidades CLI: generación de esqueletos de scripts en Python, Bash o similares en un entorno Ollama sin dependencias de nube.
- Base para fine-tuning específico de dominio: al ser un modelo pequeño, es viable ajustarlo con LoRA en una sola GPU consumer para tareas concretas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 456M parámetros, en FP16 ≈ 0,9 GB; en Q4 ≈ 0,3 GB de pesos. El repo de 6,6 GB sugiere que incluye varias cuantizaciones o pesos en precisión alta.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 y en iGPU con suficiente RAM.
- Cabe en GPU consumer: sí, en cualquier GPU con ≥2 GB de VRAM e incluso en CPU.
- Opciones de despliegue: Ollama (documentado), llama.cpp (formato GGUF), y potencialmente vLLM o TGI si se dispone de safetensors completos.
- Latencia y throughput: no disponibles. Por tamaño, en CPU moderna se esperan decenas de tokens por segundo en Q4, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| VoDa-AI4-Coder-9b | 456M reales (nombre 9B) | no disponible | other (propietaria) | Hugging Face, Ollama |
| Qwen2.5-Coder-0.5B | 0,5B | 32K | Apache 2.0 | Hugging Face, Ollama |
| Qwen2.5-Coder-1.5B | 1,5B | 32K | Apache 2.0 | Hugging Face, Ollama |
| DeepSeek-Coder-1.3B | 1,3B | 16K | DeepSeek License | Hugging Face |

La comparación es aproximada: VoDa no publica contexto ni benchmarks, y su licencia "other" impide confirmar condiciones de uso comercial. Frente a Qwen2.5-Coder-0.5B, el principal atractivo diferencial es el soporte nativo del ruso y la integración con DeepSeek Harness; en rendimiento de código no hay datos que permitan situarlo.

## Limitaciones y advertencias

- Discrepancia crítica entre el nombre ("9b") y los parámetros reales (456M): puede tratarse de un error de etiquetado o de una estrategia de marketing; conviene verificar antes de usarlo en producción.
- Licencia "other" sin texto público: no se puede confirmar el uso comercial, la redistribución ni las restricciones de atribución.
- Ausencia total de benchmarks: no hay evidencia publicada de calidad en HumanEval, MBPP, MMLU ni similares.
- Riesgo de alucinación elevado en un modelo pequeño sin datos de alineación documentados.
- Contexto desconocido: no se puede garantizar el manejo de repositorios grandes o conversaciones multi-turno largas.
- Idiomas limitados a ruso e inglés; el castellano no está soportado oficialmente.
- Cero descargas y cero likes en el momento de la consulta: ecosistema y soporte comunitario inexistentes.
- Dependencia de DeepSeek Harness para las capacidades agénticas: no es un componente estándar y su disponibilidad futura no está garantizada.
- El tag de Ollama (`beebosofficial/...`) no coincide con el nombre del repositorio de Hugging Face (`VoDa-Techno/...`), lo que puede generar confusión en el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/VoDa-Techno/VoDa-AI4-Coder-9b
- Model card original (en ruso): incluida en la página de Hugging Face
- Ollama: https://ollama.com/beebosofficial/VoDa-AI4-Coder
- DeepSeek Harness: no disponible (referenciado en la model card sin enlace)
- Paper, blog o demo oficial: no disponibles
