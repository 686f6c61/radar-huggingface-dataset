# YTan2000/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de razonamiento desarrollado por XHToken, con una conversión GGUF creada por YTan2000. Pertenece a la línea Spark de xAI y está emparentado con `xai/grok-code-fast-1`. El modelo tiene 4.11 mil millones de parámetros y una arquitectura de atención híbrida con ventana deslizante (4 capas de ventana por cada capa global, ventana de 128 tokens), lo que le permite manejar un contexto nativo de 1 millón de tokens con un coste computacional contenido.

Esta versión GGUF ofrece tres cuantizaciones: IQ4_XS (2.22 GiB), TQ3_4S (2.35 GiB) y BF16 (8.22 GiB), lo que lo hace viable para ejecutarse en GPUs de consumo. Destaca en tareas de generación de código, con resultados notables en HumanEval y MBPP, y su modo de razonamiento con bloques de pensamiento `<think>` permite abordar problemas complejos de múltiples pasos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención híbrida de ventana deslizante (4 ventanas por cada capa global, ventana 128) |
| Parametros totales | 4.112.079.360 (4.11B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1M tokens (nativo) |
| Tipos de cuantizacion | IQ4_XS (4.25 bpw), TQ3_4S (4.81 bpw), BF16 |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelo base en safetensors) |

## Arquitectura y entrenamiento

Spark-X2.5-4B emplea una arquitectura transformer con atención híbrida de ventana deslizante: una proporción de 1:3 entre capas globales y capas de ventana, con un tamaño de ventana de 128 tokens. Esta configuración reduce la complejidad computacional de la atención en entradas largas y es la base de su capacidad para gestionar un contexto nativo de 1M tokens.

Los datos de entrenamiento no están disponibles en la información proporcionada. No se ha hecho mención de técnicas de alineación posteriores como RLHF o DPO. El modelo se presenta como descendiente de `xai/grok-code-fast-1` y conserva la arquitectura Spark de xAI. La conversión a GGUF fue realizada por YTan2000, que también desarrolló un recetario de cuantización específico para la arquitectura, incluyendo una variante TQ3_4S ajustada por tensores.

## Capacidades

- Generación de texto y razonamiento: el modelo emite bloques de pensamiento `<think>` por defecto, lo que le permite razonar de forma explícita antes de responder.
- Generación de código: destaca en benchmarks de código como HumanEval (78% en BF16) y MBPP (72.5% en BF16), con puntuaciones competitivas también en las cuantizaciones de 4-bit.
- Razonamiento de múltiples pasos: gracias a su modo de pensamiento, puede descomponer problemas complejos antes de generar una respuesta final.
- Contexto largo: soporta nativamente 1M tokens, lo que permite procesar repositorios completos o conversaciones muy extensas.
- Control del modo de razonamiento: se puede deshabilitar el pensamiento por petición mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Capacidades multilingües: limitadas al inglés, según la documentación oficial.
- Soporte de tool calling, agentes, visión o audio: no se ha documentado en la información disponible.

## Casos de uso

- Asistente de código en IDE: puede integrarse en entornos de desarrollo a través de llama.cpp para autocompletar funciones, generar tests o refactorizar código. Con la cuantización IQ4_XS, se ejecuta a ~213 tokens/s en una RTX 3090, lo que permite una experiencia interactiva.
- Revisión de código en repositorios grandes: su contexto de 1M tokens permite cargar varios archivos a la vez y analizar patrones, detectar errores de lógica o generar documentación de módulos completos.
- Tutor de programación con razonamiento paso a paso: activando el modo de pensamiento, puede explicar algoritmos complejos, depurar código o diseñar soluciones paso a paso. Se puede desactivar el thinking cuando se prefieran respuestas directas.
- Evaluación de la calidad de código generado: los benchmarks publicados (Hard86, HumanEval, MBPP) permiten usarlo como referencia en pipelines de evaluación automática, comparando el efecto de diferentes cuantizaciones en tareas de código.
- Asistente técnico interno en inglés: puede resolver consultas técnicas en entornos de soporte, manejando conversaciones largas con contexto amplio gracias a su ventana de 1M tokens.
- Despliegue en producción con llama-server: el quick start oficial muestra cómo servir el modelo como API REST con `--jinja`, `-c 32768` y `-fa on`, lo que es apto para integración en procesos de CI/CD o herramientas internas.
- Análisis de logs y depuración: puede recibir logs extensos y utilizar su contexto largo para identificar la causa raíz de errores, proponer soluciones y explicar el flujo de ejecución.

## Benchmarks y rendimiento

Los benchmarks se realizaron en una RTX 3090, con temperatura 0, usando los evaluadores oficiales (EvalPlus, harness Hard86) y con el modo de pensamiento desactivado.

Velocidad (llama-bench, ngl=99):

| Quant | pp512 (t/s) | tg128 (t/s) |
|---|---|---|
| BF16 | 6724 | 93.3 |
| IQ4_XS | 9102 | 213.6 |
| TQ3_4S (arch-tuned) | 7736 | 215.2 |

Calidad (thinking off):

| Suite | BF16 | IQ4_XS | TQ3_4S |
|---|---|---|---|
| Hard86 (86 tests) | 54.7% | 44.2% | 46.5% |
| HumanEval | 78.0% | 73.8% | 71.3% |
| HumanEval+ | 73.8% | 70.1% | 67.7% |
| MBPP | 72.5% | 69.6% | 68.8% |
| MBPP+ | 62.2% | 61.4% | 59.3% |
| Internal quality suite (overall) | 75.7 | 74.1 | 73.9 |

La cuantización TQ3_4S ajustada por arquitectura mejora Hard86 en +2.3 puntos respecto a IQ4_XS, pero reduce HumanEval en -2.5 puntos. BF16 ofrece la máxima calidad a costa de una velocidad de decodificación 2.3 veces menor.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos ocupan 2.22 GiB (IQ4_XS), 2.35 GiB (TQ3_4S) y 8.22 GiB (BF16). La VRAM total necesaria dependerá del tamaño de la KV cache, que crece con el contexto. Para contextos de 32K, una RTX 3090 de 24GB es suficiente; para longitudes cercanas a 1M se requerirá memoria adicional considerable.
- GPUs recomendadas: RTX 3090, según los benchmarks proporcionados. También son adecuadas RTX 4090, A100 y H100 para contextos más largos o mayor throughput.
- Compatibilidad con consumer GPU: sí. Las cuantizaciones IQ4_XS y TQ3_4S caben en GPUs de 8-12GB para contextos moderados. BF16 necesita al menos 8GB de VRAM para los pesos.
- Opciones de despliegue: llama.cpp con soporte para la arquitectura `spark2_5` (PR #27868), `llama-server` con el flag obligatorio `--jinja`, y el fork `turbo-tan/llama.cpp-tq3` para la cuantización TQ3_4S. vLLM, Ollama y TGI pueden utilizarse si incorporan soporte para la arquitectura, pero no se especifica en la documentación.
- Latencia y throughput: en una RTX 3090, la decodificación alcanza 213.6 t/s con IQ4_XS, 215.2 t/s con TQ3_4S y 93.3 t/s con BF16. El procesamiento de prompt (pp512) es de 9102 t/s, 7736 t/s y 6724 t/s respectivamente.

## Comparativa con modelos similares

No se han publicado benchmarks comparativos con otros modelos en la información disponible. El modelo pertenece a la línea Spark-X2.5, que incluye una variante Spark-X2.5-1.7B, pero no se disponen de datos sobre sus parámetros, contexto o rendimiento que permitan una comparación rigurosa. El modelo descendiente de `xai/grok-code-fast-1` comparte linaje con la familia Grok de xAI, aunque no se han facilitado datos comparativos con esos modelos.

## Limitaciones y advertencias

- El modo de pensamiento puede consumir todo el presupuesto de tokens y devolver contenido vacío en prompts de estilo código. Se recomienda desactivar `enable_thinking` para cargas de trabajo directas o de evaluación de código, o usar un `max_tokens` muy alto.
- La cuantización TQ3_4S requiere el fork `turbo-tan/llama.cpp-tq3`, lo que añade complejidad de despliegue y limita la portabilidad a entornos con llama.cpp estándar.
- El flag `--jinja` es obligatorio al servir el modelo con llama.cpp; sin él, el modelo no carga y muestra un error.
- El modelo solo soporta inglés, lo que limita su uso en aplicaciones multilingües.
- La licencia Apache-2.0 permite uso comercial, pero se debe revisar la licencia del modelo base y de los modelos de los que deriva para confirmar las condiciones exactas.
- El contexto de 1M tokens es una capacidad nativa, pero su uso real en hardware de consumo puede estar limitado por la VRAM necesaria para la KV cache. No se han proporcionado cifras exactas de VRAM para contextos largos.
- No se ha documentado información específica sobre sesgos del modelo en la información disponible.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/YTan2000/Spark-X2.5-4B-GGUF
- Modelo base Spark-X2.5-4B: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio de XHToken/Spark-X2.5: https://github.com/XHToken/Spark-X2.5
- Modelo padre xai/grok-code-fast-1: https://huggingface.co/xai/grok-code-fast-1
- PR de llama.cpp con soporte spark2_5: https://github.com/ggml-org/llama.cpp/pull/27868
- Fork turbo-tan/llama.cpp-tq3: https://github.com/turbo-tan/llama.cpp-tq3
