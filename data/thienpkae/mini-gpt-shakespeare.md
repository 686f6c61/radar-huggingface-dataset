# Thienpkae/mini-gpt-shakespeare

## Resumen

mini-gpt-shakespeare es un modelo de lenguaje decoder-only de tipo Transformer entrenado desde cero por Thienpkae. No utiliza implementaciones de alto nivel como `nn.Transformer` ni `scaled_dot_product_attention`: la atención Q/K/V, el escalado, la máscara causal, la softmax y la suma ponderada de valores están implementadas manualmente. El objetivo del proyecto es educativo: servir como referencia reproducible de cómo se construye y entrena un GPT completo sin dependencias de abstracciones de PyTorch.

El modelo se entrena sobre el corpus tiny Shakespeare a nivel de carácter, con un vocabulario de 65 tokens, durante 5.000 pasos con AdamW en una GPU RTX 5060. La pérdida de validación pasa de 4,24 a 1,61, lo que indica que el modelo ha aprendido la distribución del texto shakespeariano a nivel de carácter, pero no dispone de capacidades generales de lenguaje. Con 4 capas, 4 cabezas de atención, dimensión de 128 y una ventana de contexto de 128 tokens, es un modelo de escala mínima.

Su relevancia es didáctica, no funcional: permite inspeccionar el pipeline completo (tokenizador a nivel de carácter, atención causal escrita a mano, entrenamiento y checkpoint) y sirve como base para experimentos controlados de arquitectura. No está pensado para uso en producción ni para tareas de generación de texto general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, pre-norm, atención causal implementada manualmente (Q/K/V, escalado, máscara, softmax, suma ponderada) |
| Parametros totales | no disponible (no se indica el recuento en la model card; con 4 capas, 4 cabezas y 128-dim es del orden de decenas de miles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | checkpoint `torch.save` (dict con `format_version`, `config`, `tokenizer`, `model_state_dict`, `step`, `metrics`) |

## Arquitectura y entrenamiento

Transformer decoder-only con 4 capas, 4 cabezas de atención, dimensión oculta de 128 y normalización pre-norm. La atención está escrita a mano: proyecciones Q/K/V, escalado por la raíz de la dimensión de cabeza, máscara causal, softmax y agregación ponderada de valores, sin usar `nn.Transformer` ni `scaled_dot_product_attention`. El tokenizador es a nivel de carácter con un vocabulario de 65 tokens, derivado del corpus tiny Shakespeare.

El entrenamiento se realizó durante 5.000 pasos con el optimizador AdamW sobre una RTX 5060, con una pérdida de validación que descendió de 4,24 a 1,61. No se documentan en la model card datos sobre número de tokens de entrenamiento, composición exacta del dataset, uso de RLHF/DPO ni innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El checkpoint incluye metadatos de formato, configuración, tokenizador, estado del modelo, paso y métricas, y se carga mediante `checkpoint.load_checkpoint(path, device)` del repositorio [nkthienai-lucky/mini-gpt](https://github.com/nkthienai-lucky/mini-gpt).

## Capacidades

- Generación de texto a nivel de carácter en inglés, imitando el estilo del corpus tiny Shakespeare (encabezados de hablante y verso).
- Continuación de prompts cortos; el ejemplo documentado es `"ROMEO:"` con decodificación greedy.
- Reproducción de la distribución del corpus de entrenamiento, no de lenguaje general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al inglés; el vocabulario de 65 caracteres no cubre otros alfabetos.
- No se documentan capacidades especiales (thinking mode, visión, audio).

## Casos de uso

- Docencia de arquitecturas Transformer: el modelo permite recorrer paso a paso la implementación manual de la atención causal y compararla con la versión optimizada de PyTorch, usando el checkpoint como referencia reproducible.
- Experimentos controlados de ablación: al ser un modelo de 4 capas y contexto 128, sirve para medir el efecto de cambios en normalización, inicialización o máscara causal sin coste computacional apreciable.
- Validación de pipelines de entrenamiento: el formato de checkpoint con `format_version`, `config`, `tokenizer` y `metrics` facilita comprobar que un loop de entrenamiento propio serializa y recarga correctamente el estado.
- Generación de texto estilizado de dominio cerrado: para demos o ejercicios de clase que requieran continuaciones con apariencia shakespeariana a nivel de carácter, sin expectativa de coherencia semántica.
- Pruebas de infraestructura de inferencia en local: al ser un modelo mínimo, puede usarse para verificar que un entorno de ejecución (script Python, carga de checkpoint, decodificación greedy) funciona antes de escalar a modelos mayores.
- Material de comparación en cursos de tokenización: contrastar el tokenizador a nivel de carácter con vocabulario de 65 tokens frente a tokenizadores BPE subword permite ilustrar el impacto del vocabulario en la longitud efectiva de contexto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de validación (4,24 → 1,61 tras 5.000 pasos), que no es comparable con métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 4 capas, 128-dim y contexto 128, el modelo y el estado de inferencia caben holgadamente en cualquier GPU consumer, aunque no se proporciona una cifra exacta.
- GPU recomendadas: el entrenamiento se realizó en una RTX 5060; la inferencia puede ejecutarse en GPUs consumer de gama baja o incluso en CPU.
- Cabe en GPU consumer: sí, por el tamaño mínimo del modelo.
- Opciones de despliegue: carga mediante el helper `checkpoint.load_checkpoint(path, device)` del repositorio mini-gpt; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| mini-gpt-shakespeare | no disponible (orden de decenas de miles) | 128 | MIT | Hugging Face + GitHub | Educativo, char-level, tiny Shakespeare |
| GPT-2 small | 124M | 1.024 | MIT | Amplia | Modelo de referencia para experimentos pequeños; multilingüe limitado, subword |
| nanoGPT (Shakespeare char-level) | ~10M (config por defecto) | 256 (config por defecto) | MIT | GitHub | Referencia didáctica equivalente de Karpathy; atención con implementación estándar |
| TinyStories (modelos pequeños) | 1M–33M | 512 | MIT / variable | Hugging Face | Entrenados para generar texto narrativo simple; no shakespeariano |

## Limitaciones y advertencias

- Sesgos: al entrenarse exclusivamente sobre tiny Shakespeare, reproduce el estilo, vocabulario y posibles sesgos del corpus teatral inglés; no se documenta ningún análisis de sesgo.
- Alucinación: la generación a nivel de carácter con contexto 128 produce texto localmente plausible pero sin coherencia semántica global; no debe interpretarse como conocimiento factual.
- Limitaciones de contexto e idioma: ventana de 128 tokens, vocabulario de 65 caracteres y solo inglés; no cubre otros alfabetos ni texto fuera del dominio shakespeariano.
- Restricciones de licencia: licencia MIT, que permite uso comercial, pero el modelo no tiene utilidad práctica para producción y su valor es educativo.
- Caveats para producción: no se documentan benchmarks, cuantizaciones, servidores de inferencia compatibles ni métricas de latencia; el checkpoint requiere el helper del repositorio del autor, lo que añade una dependencia de código externo.
- Fecha de creación del repositorio: 2026-11-11, con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso comunitario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thienpkae/mini-gpt-shakespeare
- Repositorio de código: https://github.com/nkthienai-lucky/mini-gpt
