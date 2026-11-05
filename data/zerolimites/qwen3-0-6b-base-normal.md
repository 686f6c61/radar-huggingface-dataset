# zerolimites/Qwen3-0.6B-Base-Normal

## Resumen

Qwen3-0.6B-Base-Normal es una exportación del modelo base Qwen/Qwen3-0.6B sin ninguna modificación de pesos, publicada por el usuario zerolimites. No se trata de un modelo nuevo ni de un ajuste fino: es una copia de referencia (baseline) del modelo original de Qwen, distribuida tanto en formato Hugging Face (safetensors) como en GGUF con cuantizaciones Q8_0 y F16. Su propósito es servir como punto de comparación frente a las variantes "quirúrgicas" que el mismo autor publica (PTBR-EN-Professor, Code-Surgery-v2, Math-Surgery-v2), que sí modifican los pesos.

El modelo subyacente, Qwen3-0.6B, pertenece a la familia Qwen3 de Alibaba y es un transformer denso de aproximadamente 0,6 mil millones de parámetros. Con ese tamaño encaja en el segmento de modelos ultraligeros, pensados para ejecución en CPU, GPUs de consumo y entornos con recursos muy limitados.

Su relevancia es fundamentalmente metodológica: al publicar los resultados de referencia en tres benchmarks propios (traducción PT-BR/EN, código ejecutable y matemáticas), el autor establece una línea base reproducible contra la que medir el efecto real de las ediciones de pesos. Para desarrolladores e investigadores, este repositorio es útil como versión limpia y verificable del modelo base en múltiples formatos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3) |
| Parámetros totales | 751.632.384 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | safetensors (precisión original), GGUF Q8_0 (8 bits), GGUF F16 (16 bits) |
| Idiomas soportados | en, pt |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es una exportación directa de Qwen/Qwen3-0.6B, un transformer denso de la familia Qwen3. No se ha realizado ningún ajuste fino, RLHF, DPO ni edición de pesos en este repositorio; el autor lo describe explícitamente como "Normal (Sem Edição de Pesos)". Por tanto, la arquitectura, los datos de entrenamiento y las innovaciones técnicas son las del modelo original de Qwen, y la model card de este repositorio no aporta detalles adicionales sobre número de tokens, composición del dataset o proceso de alineación.

La contribución del repositorio es de empaquetado y evaluación: proporciona los pesos en safetensors y en dos cuantizaciones GGUF (Q8_0 y F16), junto con resultados de referencia en tres benchmarks definidos por el autor. Esos resultados baseline son 0/28 en el benchmark de traducción PT-BR ⇄ EN, 13/28 (46,43%) en el benchmark de código ejecutable y 13/30 (43,33%) en el benchmark de matemáticas.

## Capacidades

- Generación de texto conversacional y de continuación de texto, según el pipeline declarado (text-generation).
- Razonamiento básico y resolución de problemas sencillos, limitado por el tamaño de 0,6B parámetros.
- Generación de código: obtiene 13/28 en el benchmark ejecutable del autor, lo que indica capacidad funcional parcial en tareas de programación simples.
- Aritmética y matemáticas elementales: 13/30 en el benchmark de matemáticas del autor.
- Capacidad multilingüe limitada a inglés y portugués según los metadatos del repositorio.
- Compatibilidad con endpoints (tag endpoints_compatible).
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información disponible.

## Casos de uso

- Línea base para experimentos de edición de pesos: sirve para medir la mejora real de variantes modificadas (por ejemplo, las del mismo autor) comparando contra los resultados de referencia publicados en este repositorio.
- Evaluación de técnicas de cuantización: al incluir Q8_0 y F16, permite comparar la degradación de calidad entre precisiones en un mismo modelo y con los mismos benchmarks.
- Prototipado rápido en local: con 0,6B parámetros y GGUF, se puede ejecutar en portátiles y CPUs para validar pipelines de generación de texto antes de escalar a modelos mayores.
- Traducción asistida EN/PT en entornos con recursos mínimos: el modelo soporta ambos idiomas, aunque su rendimiento en el benchmark de traducción del autor es 0/28, por lo que solo es adecuado para pruebas de concepto y no para producción.
- Generación de código en herramientas educativas: su 46,43% en código ejecutable permite usarlo en ejercicios guiados donde el estudiante revisa y corrige la salida.
- Filtrado y clasificación de texto ligero: al ser ultraligero, puede desplegarse para tareas de preprocesado o generación de borradores a gran volumen con coste computacional muy bajo.
- Referencia reproducible en investigación: útil para replicar experimentos y comparar metodologías de evaluación sobre un modelo abierto con licencia Apache 2.0.

## Benchmarks y rendimiento

Resultados de referencia publicados por el autor para este modelo base:

| Benchmark | Tareas | Aciertos | Porcentaje |
|---|---|---|---|
| Traducción PT-BR ⇄ EN (Professor) | 28 | 0 | 0,00% |
| Código ejecutable | 28 | 13 | 46,43% |
| Matemáticas | 30 | 13 | 43,33% |

No se han publicado en la información disponible resultados en benchmarks estándar de la industria (MMLU, HumanEval, GSM8K) para este repositorio concreto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en F16 (0,75B parámetros × 2 bytes) y en torno a 0,8-1 GB en Q8_0, más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son más que suficientes. También funciona en GPUs de datacenter (A100, H100) sin aprovechar su capacidad.
- Cabe holgadamente en GPUs de consumo, incluidas las integradas con memoria compartida, y en CPU mediante llama.cpp.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, TGI o transformers para safetensors; también es compatible con endpoints según los tags del repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Qwen3-0.6B-Base-Normal (este) | 751.632.384 | no disponible | Apache 2.0 | safetensors, GGUF Q8_0/F16 | Exportación sin edición del base con baseline de 3 benchmarks |
| Qwen/Qwen3-0.6B (original) | ~0,6B | no disponible | Apache 2.0 | safetensors | Modelo fuente; sin benchmarks propios del autor |
| zerolimites/Qwen3-0.6B-Code-Surgery-v2 | ~0,6B | no disponible | Apache 2.0 (según repo base) | safetensors, GGUF | Variante editada; 96,43% en código ejecutable según el autor |
| zerolimites/Qwen3-0.6B-Math-Surgery-v2 | ~0,6B | no disponible | Apache 2.0 (según repo base) | safetensors, GGUF | Variante editada; 76,67% en matemáticas según el autor |

## Limitaciones y advertencias

- Es una copia sin modificar del modelo base: no incorpora alineación conversacional específica ni instrucciones de seguridad adicionales más allá de las del modelo original.
- Riesgo de alucinación elevado por su tamaño reducido (0,6B parámetros), especialmente en matemáticas y traducción, donde los resultados baseline son bajos (43,33% y 0,00% respectivamente).
- Contexto máximo no documentado en este repositorio; conviene consultar la model card de Qwen/Qwen3-0.6B antes de usarlo en producción.
- Idiomas limitados a inglés y portugués según los metadatos; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- El benchmark de traducción con 0/28 aciertos indica que el modelo base no es fiable para tareas de traducción sin ajuste.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre los pesos ni sobre los resultados de los benchmarks propios.
- Los benchmarks son definidos por el autor y no están validados de forma independiente; no son directamente comparables con MMLU, HumanEval o GSM8K.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zerolimites/Qwen3-0.6B-Base-Normal
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Variante de traducción PT-BR/EN: https://huggingface.co/zerolimites/Qwen3-0.6B-PTBR-EN-Professor
- Variante de código: https://huggingface.co/zerolimites/Qwen3-0.6B-Code-Surgery-v2
- Variante de matemáticas: https://huggingface.co/zerolimites/Qwen3-0.6B-Math-Surgery-v2
