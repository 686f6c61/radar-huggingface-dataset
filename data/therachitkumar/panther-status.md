# therachitkumar/panther-status

## Resumen

Panther no es un modelo de lenguaje en el sentido convencional, sino un repositorio de seguimiento de progreso ("status") publicado por el usuario therachitkumar en Hugging Face. La model card documenta, en tiempo casi real, la ejecución de un pipeline de cuantización mixta guiada por búsqueda genética sobre varios modelos Qwen2.5-Instruct y Mistral, con el objetivo declarado de superar las cuantizaciones predefinidas de llama.cpp en términos de precisión y divergencia KL.

El contenido describe cuatro experimentos en curso o completados: Qwen2.5-1.5B-Instruct a 1 GiB, Qwen2.5-7B-Instruct a 3 GiB, Qwen2.5-7B-Instruct a 5 GiB, Qwen2.5-14B-Instruct a 7 GiB y Mistral-24B-Instruct a 7 GiB. Cada uno incluye tablas de pasos (descarga, cuantización, medición de error offline, generación de referencia, evaluación del preset de llama.cpp, búsqueda genética, validación y empaquetado) con marcas temporales en IST y estimaciones de finalización.

Es relevante ahora porque documenta una metodología de cuantización por asignación heterogénea de tipos por matriz, optimizada contra una métrica de precisión sobre 900 preguntas y desempate por KL, en lugar de aplicar un tipo uniforme. No obstante, el repositorio no contiene pesos publicados ni una model card técnica convencional: es un panel de estado de un experimento en ejecución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no define arquitectura propia; referencia modelos Qwen2.5-Instruct y Mistral) |
| Parametros totales | no disponible (los modelos objetivo van de 1,5B a 24B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como lista cerrada; el pipeline menciona "quantize the original to every type (type copies)" y asignación heterogénea por matriz |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se menciona empaquetado "for the Pi" y comparación con presets de llama.cpp, lo que sugiere GGUF, pero no se confirma) |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura de modelo propia. Documenta un proceso de optimización de cuantización aplicado sobre modelos existentes: Qwen2.5-1.5B-Instruct, Qwen2.5-7B-Instruct, Qwen2.5-14B-Instruct y Mistral-24B-Instruct. El pipeline incluye descarga del modelo original, generación de copias cuantizadas a cada tipo disponible, cálculo del error offline de cada matriz en cada tipo, generación de las salidas del modelo original sobre los textos de test, construcción y puntuación de los presets de llama.cpp como referencia competitiva, y una búsqueda genética con función de fitness basada en precisión sobre 900 preguntas y desempate por KL.

La innovación declarada es la asignación por matriz de tipos de cuantización mediante búsqueda genética (poblaciones de 30 a 70 individuos, con parada por meseta), seguida de validación de los tres mejores individuos sobre 4.500 preguntas, una comprobación de seguridad frente al preset real de llama.cpp y un test completo del ganador. No se especifican datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO, porque no se trata de un modelo entrenado sino de un proceso de compresión.

## Capacidades

- No aplica: el repositorio no publica un modelo con capacidades de inferencia propias.
- El objeto documentado es un pipeline de cuantización, no un modelo desplegable.
- Las métricas reportadas son de fidelidad de cuantización: precisión sobre conjuntos de preguntas (900 y 4.500) y divergencia KL frente a las salidas del modelo original.
- Los modelos objetivo (Qwen2.5-Instruct, Mistral) sí soportan generación de texto, razonamiento, código y multilingüismo, pero esas capacidades pertenecen a los modelos base, no a este repositorio.
- No se documenta soporte de tool calling, agentes, visión ni audio en este repositorio.

## Casos de uso

- Evaluación de metodologías de cuantización: el panel sirve como referencia para investigadores que quieran replicar una búsqueda genética de asignación de tipos por matriz y comparar contra los presets de llama.cpp.
- Despliegue en hardware restringido tipo Raspberry Pi: el pipeline incluye un paso explícito de "pack the winner for the Pi", orientado a ejecutar modelos de 1,5B a 7B en un dispositivo de baja memoria.
- Compresión de modelos de 14B y 24B a presupuestos de 7 GiB: los experimentos con Qwen2.5-14B y Mistral-24B a 7 GiB apuntan a servir modelos grandes en GPUs de consumo o en memoria unificada limitada.
- Comparación de fidelidad entre cuantizaciones: la métrica de precisión sobre 900 y 4.500 preguntas más KL permite decidir entre un preset uniforme de llama.cpp y una asignación heterogénea.
- Reproducción de experimentos: las tablas de pasos con tiempos y porcentajes permiten estimar coste computacional de cada fase (cuantización, error offline, búsqueda genética).
- Seguimiento de experimentos abiertos: el formato de status cada 30 segundos es útil como plantilla para publicar el progreso de trabajos largos de compresión de modelos.

## Benchmarks y rendimiento

Los únicos datos publicados son métricas internas del pipeline de cuantización, no benchmarks estándar (MMLU, HumanEval, GSM8K). Se reproducen tal cual, sin interpretación adicional.

| Experimento | Referencia a batir (llama.cpp preset) | Mejor individuo hasta la fecha |
|---|---|---|
| Qwen2.5-1.5B-Instruct a 1 GiB | no indicado | precisión 52,21; KL 0,4865 |
| Qwen2.5-7B-Instruct a 3 GiB | no indicado | no disponible |
| Qwen2.5-7B-Instruct a 5 GiB | no indicado | no disponible |
| Qwen2.5-14B-Instruct a 7 GiB | precisión 77,08; KL 0,1302 | precisión 77,67; KL 0,1289 (individuo 13) |
| Mistral-24B-Instruct a 7 GiB | precisión 72,08; KL 0,5219 | precisión 75,46; KL 0,4645 (individuo 12) |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/presupuesto de memoria objetivo por experimento: 1 GiB (Qwen2.5-1.5B), 3 GiB y 5 GiB (Qwen2.5-7B), 7 GiB (Qwen2.5-14B y Mistral-24B).
- GPU recomendadas: no disponible. El pipeline menciona empaquetado para Raspberry Pi, lo que sugiere despliegue en CPU y memoria unificada, no en GPU dedicada.
- Ajuste en GPU de consumo: no confirmado; los presupuestos de 1 a 7 GiB son compatibles en teoría con GPUs de 8 GB o menos, pero no se aportan mediciones.
- Opciones de despliegue: comparación explícita contra presets de llama.cpp; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo propio comparable; los elementos comparados son los presets de cuantización de llama.cpp frente a las asignaciones generadas por búsqueda genética para los modelos Qwen2.5-Instruct y Mistral citados.

## Limitaciones y advertencias

- El repositorio no contiene pesos de modelo publicados ni una model card técnica; es un panel de estado de un experimento en curso.
- Sin licencia declarada: no se puede asumir uso comercial permitido.
- Sin idiomas declarados ni pipeline de inferencia definido en Hugging Face.
- Cero descargas y cero likes en el momento de la consulta, lo que impide validación por parte de la comunidad.
- Las métricas de precisión y KL son internas del autor y no están verificadas de forma independiente; no son comparables con benchmarks estándar.
- El estado está fechado el 13 de noviembre a las 00:20 IST y contiene pasos incompletos; los resultados finales pueden cambiar.
- El nombre "panther-status" sugiere un repositorio de seguimiento, no un artefacto de modelo; tratarlo como modelo desplegable sería un error.
- Riesgo de alucinación y sesgos: no evaluables, al no existir modelo propio publicado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/therachitkumar/panther-status
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información proporcionada.
