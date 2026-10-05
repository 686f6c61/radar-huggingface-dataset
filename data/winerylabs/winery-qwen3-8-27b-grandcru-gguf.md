# WineryLabs/Winery-Qwen3.8-27B-GrandCru-GGUF

## Resumen

Winery Qwen3.8-27B GrandCru es un modelo de lenguaje de tipo "linear soup" (fusión por media ponderada de pesos) construido por WineryLabs a partir de Qwen3.8-27B y seis de sus ajustes finos más conocidos: Swift 1.5 y Swift 1.0 de ukisai, Qwopus Flash de Jackrong, dos destilados de la familia Fable-5 y la variante abliterated de Huihui. El resultado es un checkpoint denso de 26.895.998.464 parámetros (~26,9B) distribuido en formato GGUF, pensado para ejecutarse en llama.cpp y derivados.

El modelo resuelve el problema clásico de la fusión de modelos: combinar las fortalezas de varios fine-tunes (razonamiento, instrucciones, estilo, ausencia de rechazos) en un único conjunto de pesos sin necesidad de reentrenar. WineryLabs transmite cada tensor directamente desde los pesos bf16 de los donantes, los promedia en fp32 y cuantiza una sola vez a Q8_0, lo que minimiza la degradación acumulada por cuantizaciones sucesivas.

Su relevancia actual radica en tres factores: el tamaño (un denso de ~27B es un punto dulce entre calidad y requisitos de hardware), la licencia mixta (Swift Open License v1.0 más Apache 2.0 de los donantes Qwen) y la publicación exclusiva en GGUF Q8_0 de 28,6 GB, lista para desplegar con llama-server, Ollama, Jan o LM Studio sin conversión previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.8) con fusion lineal de pesos; cabecera MTP eliminada |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el autor usa `-c 32768` en el ejemplo de llama-server) |
| Tipos de cuantizacion | Q8_0 (GGUF); los donantes originales estan en bf16 |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (Swift Open License v1.0) + Apache 2.0 de los donantes Qwen3.8-27B |
| Formato de pesos | GGUF (repo de 28,6 GB); donantes en safetensors/bf16 |

## Arquitectura y entrenamiento

No hay entrenamiento en sentido estricto: se trata de una fusión de pesos ("linear soup") sobre siete checkpoints alineados. WineryLabs transmite los 850 tensores de lenguaje de cada donante directamente desde sus pesos bf16 y calcula la media ponderada en fp32, con los siguientes coeficientes: Qwen/Qwen3.8-27B (base) 0.5; ukisai/Swift-1.5-Qwen3.8-27b 1.0; Jackrong/Qwopus3.8-27B-Flash 1.0; TeichAI/Qwen3.8-27B-Fable-Distill 0.9; DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU 0.7; huihui-ai/Huihui-Qwen3.8-27B-abliterated 0.5; y ukisai/Swift-Qwen3.8-27b 0.5. La receta completa esta en `recipe.json`.

El único paso de cuantización se aplica al final, convirtiendo el resultado en fp32 a Q8_0, de modo que no se encadenan pérdidas de precisión entre etapas. La cabecera MTP (multi-token prediction) del modelo base se descarta durante la fusión. No se documentan en la información disponible datos sobre composición de dataset, tokens de entrenamiento, RLHF ni DPO para este checkpoint concreto, ya que hereda esas características de los modelos donantes y no de un proceso propio.

## Capacidades

- Generación de texto conversacional y de propósito general en la familia Qwen3.8.
- Razonamiento con modo "thinking" activable o desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`.
- Herencia de capacidades de instrucciones y de estilo de los seis fine-tunes fusionados (Swift 1.5/1.0, Qwopus Flash, Fable-Distill, TURBO Fable-Cold-Fusion, Huihui abliterated).
- Comportamiento menos restrictivo que el base, al incorporar la variante abliterated de Huihui con peso 0.5.
- Compatibilidad con `endpoints_compatible` y pipeline `text-generation`.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni soporte multilingüe explícito.

## Casos de uso

- Asistente conversacional autoalojado: con ~27B densos en Q8_0 y 28,6 GB de repo, se puede servir en una máquina con GPU de 16 GB más RAM de sistema usando `llama.cpp --fit`, cubriendo conversaciones multi-turno sin depender de APIs externas.
- Generación de texto creativo y narrativa larga: la fusión incorpora los destilados de la familia Fable-5 con peso combinado 1.6, orientados a prosa y estilo, lo que resulta adecuado para redacción de ficción, guiones o contenido editorial.
- Evaluación comparativa de recetas de fusión: al publicar `recipe.json` con los coeficientes exactos, sirve como referencia reproducible para investigar cómo afectan los pesos relativos de cada donante al rendimiento final.
- Sustitución de checkpoints base en pipelines GGUF existentes: al estar en formato GGUF Q8_0, se integra sin conversión en despliegues que ya usan llama-server, Jan o LM Studio, cambiando únicamente el identificador del modelo.
- Investigación sobre alineación y rechazos: la mezcla de un donante abliterated con el base permite estudiar experimentalmente cómo se modifica la tasa de rechazos al variar la proporción de pesos.
- Prototipado en hardware de gama alta de consumo: un equipo con una GPU de 24 GB puede ejecutar el Q8_0 repartiendo capas con `--fit`, lo que permite validar calidad antes de invertir en hardware de servidor.
- Tareas de razonamiento y cultura general de dificultad media: según los datos del autor, alcanza 76.5 en MMLU y 98.0 en ARC-Challenge en modo 0-shot sin thinking.

## Benchmarks y rendimiento

Evaluación rápida de Winery (0-shot, thinking desactivado, mismo harness para todos los modelos Winery):

| Modelo | MMLU | ARC-Challenge | GSM8K | Media |
|---|---|---|---|---|
| **27B Grand Cru** | 76.5 | 98.0 | 81.7 | **85.4** |
| 9B Assemblage | 73.0 | 97.3 | 88.3 | 86.2 |
| 9B Grand Cru | 70.0 | 96.7 | 90.0 | 85.6 |

No se han publicado en la información disponible otros resultados de benchmarks (HumanEval, MATH, MT-Bench, etc.) para este checkpoint.

## Requisitos de hardware

- VRAM estimada: aproximadamente 30 GB de VRAM y RAM combinadas según el autor (el archivo Q8_0 pesa 28,6 GB, más overhead de contexto).
- GPU recomendadas: no se especifican modelos concretos; el autor indica que `llama.cpp --fit` reparte el modelo entre una GPU de 16 GB y la RAM del sistema.
- Cabe en GPU de consumo: sí, de forma parcial. Una GPU de 16 GB junto con RAM de sistema suficiente permite ejecutarlo con offload de capas; una GPU de 24 GB (RTX 3090/4090) reduce la dependencia de RAM.
- Opciones de despliegue: llama.cpp (builds recientes con soporte Qwen3.8), Ollama (`ollama run hf.co/WineryLabs/Winery-Qwen3.8-27B-GrandCru-GGUF`), Jan, LM Studio y la aplicación Winery.
- Ejemplo de servidor: `llama-server -hf WineryLabs/Winery-Qwen3.8-27B-GrandCru-GGUF -c 32768`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | ARC-C | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Winery Qwen3.8-27B Grand Cru | ~26,9B | no disponible | 76.5 | 98.0 | 81.7 | Swift Open License 1.0 + Apache 2.0 | GGUF Q8_0 en HuggingFace |
| Winery 9B Assemblage | 9B (no confirmado en la informacion) | no disponible | 73.0 | 97.3 | 88.3 | no disponible | no disponible |
| Winery 9B Grand Cru | 9B (no confirmado en la informacion) | no disponible | 70.0 | 96.7 | 90.0 | no disponible | no disponible |

Los dos modelos comparables son también de WineryLabs y aparecen únicamente en la tabla de evaluación de la model card; no se proporcionan sus enlaces ni sus especificaciones completas. No se dispone de datos comparativos frente a otros modelos de tamaño similar fuera del catálogo Winery.

## Limitaciones y advertencias

- Los resultados de benchmarks proceden del propio autor (harness "Winery quick eval"), sin verificación independiente ni detalle de metodología más allá de "0-shot, thinking off".
- El modelo es una fusión de pesos, no un entrenamiento; su techo de calidad está acotado por el de los donantes y por la alineación de tensores entre ellos.
- La incorporación de un donante abliterated con peso 0.5 implica una reducción deliberada de los mecanismos de rechazo, lo que puede producir contenido inapropiado en producción y complica el cumplimiento de políticas de contenido.
- Licencia mixta: los pesos Swift están bajo Swift Open License v1.0, que no es Apache 2.0 y puede imponer condiciones adicionales para uso comercial. Es imprescindible revisar `LICENSE` y `NOTICE` antes de un despliegue comercial.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe verificada.
- Longitud de contexto nativa no especificada; el ejemplo del autor usa 32768 tokens, pero no se confirma que sea el máximo soportado.
- Riesgo de alucinación inherente a los modelos de ~27B, no cuantificado en la información disponible.
- Sesgos: no documentados explícitamente, pero heredados de los datasets de los donantes, incluyendo los destilados de la familia Fable.
- Repositorio con 0 descargas y 1 like en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- [HuggingFace: WineryLabs/Winery-Qwen3.8-27B-GrandCru-GGUF](https://huggingface.co/WineryLabs/Winery-Qwen3.8-27B-GrandCru-GGUF)
- [Organización WineryLabs](https://huggingface.co/WineryLabs)
- [Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [ukisai/Swift-1.5-Qwen3.8-27b](https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b)
- [ukisai/Swift-Qwen3.8-27b](https://huggingface.co/ukisai/Swift-Qwen3.8-27b) (enlace inferido del tag; no incluido explícitamente en la model card)
- [Jackrong/Qwopus3.8-27B-Flash](https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash)
- [TeichAI/Qwen3.8-27B-Fable-Distill](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU](https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU)
- [huihui-ai/Huihui-Qwen3.8-27B-abliterated](https://huggingface.co/huihui-ai/Huihui-Qwen3.8-27B-abliterated)
- Licencia Swift Open License v1.0: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Receta de fusión: `recipe.json` (referenciado en la model card como archivo del repositorio)
- Atribuciones: `NOTICE` (archivo del repositorio)
