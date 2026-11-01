# SSSAMMMM/MiniCPM-V-4.7-35B-A3B-DSpark-MLX-4bit

## Resumen

MiniCPM-V-4.7-35B-A3B-DSpark-MLX-4bit es una conversión a 4 bits en formato MLX del modelo borrador (draft) oficial de OpenBMB para decodificación especulativa, asociado a la familia MiniCPM-V 4.7. No es un modelo conversacional autónomo: se trata de un artefacto auxiliar que propone tokens candidatos que el modelo objetivo (target) MiniCPM-V 4.7 35B-A3B verifica en bloque. El autor de la conversión es el usuario SSSAMMMM, mientras que el modelo original y su configuración pertenecen a OpenBMB.

El interés de esta ficha es acotado pero técnico: permite ejecutar decodificación especulativa (DSpark) sobre Apple Silicon mediante MLX, reduciendo el coste por token generado sin alterar los pesos del modelo objetivo. La cuantización es afín de 4 bits con grupo de 64, generada con `mlx.nn.quantize` y validada contra un target MLX de precisión mixta del mismo autor.

Conviene subrayar que el repositorio pesa 0,2 GB y contiene 140 tensores serializados, con 389.223.169 parámetros declarados en los safetensors. El dato de parámetros del nombre del modelo base (35B-A3B) corresponde al target, no a este draft. La licencia es Apache-2.0, heredada del modelo upstream.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo borrador para decodificación especulativa); familia base Qwen3 según tags |
| Parametros totales | 389.223.169 (según safetensors del repo); el nombre del base indica 35B-A3B para el target, no para el draft |
| Parametros activos | no disponible para el draft; el target asociado es MoE con 3B activos según nomenclatura |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4 bits, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), 140 tensores, 218.991.555 bytes (~209 MiB) |

## Arquitectura y entrenamiento

El artefacto es una cuantización, no un entrenamiento nuevo. Se parte de la revisión `55249d3e69315892ca07bc956228b404f2526f9a` del draft oficial de OpenBMB y se aplica `mlx.nn.quantize` sobre todos los módulos Linear y Embedding elegibles, con precisión afín de 4 bits y grupo de 64. El resultado son 140 tensores serializados en `model.safetensors`; el autor verificó que el guardado y la recarga preservan exactamente todos los tensores.

La configuración del modelo fuente se conserva, incluido `block_size: 15`. Sin embargo, la configuración validada de la aplicación solicita un bloque de verificación fijo de 4 (3 tokens de draft más 1 token confirmado). Es un ajuste de runtime, no una modificación de los pesos. El draft no incluye tokenizador ni el modelo objetivo, y requiere un runtime MLX-VLM con soporte DSpark; el autor probó con MLX 0.32.2 y una versión adaptada de MLX-VLM 0.7.1, sin garantizar compatibilidad con versiones anteriores sin modificar.

## Capacidades

- Decodificación especulativa: propone tokens candidatos para que el target los verifique en bloque, con un bloque validado de 3 tokens de draft más 1 confirmado.
- Aceleración de inferencia: reduce el número de pasos de decodificación del target cuando la tasa de aceptación es alta.
- Integración con MLX: pensado para ejecutarse en Apple Silicon mediante MLX y MLX-VLM.
- Compatibilidad con target multimodal: validado contra MiniCPM-V 4.7 MLX mixed-precision, lo que incluye el pipeline visión-lenguaje del target.
- No soporta de forma autónoma: generación de texto, tool calling, agentes, razonamiento multi-step ni capacidades multilingües por sí mismo, ya que carece de tokenizador y de pesos completos de chat.
- Optimización opcional en runtime: proyecciones batched del backbone y kernel de vocabulario exacto de 6 bits, implementadas en código de la aplicación y no en estos pesos.

## Casos de uso

- Aceleración de inferencia local en Mac: usar el draft junto al target MiniCPM-V 4.7 35B-A3B en MLX para reducir la latencia de decodificación en equipos Apple Silicon con memoria unificada amplia.
- Servicio de chat multimodal con presupuesto de latencia ajustado: desplegar el par draft-target en un runtime MLX-VLM adaptado para tareas de descripción de imágenes y VQA donde el coste por token es crítico.
- Evaluación de decodificación especulativa: comparar tasas de aceptación y throughput con distintos bloques de verificación (por ejemplo, 4 frente a configuraciones mayores) sin reentrenar nada.
- Prototipado de pipelines de visión-lenguaje en local: iterar sobre prompts y flujos multimodales en un portátil o estación Mac antes de migrar a GPUs de datacenter.
- Investigación sobre cuantización MLX: estudiar el impacto de 4 bits afín con grupo 64 en la calidad de las propuestas del draft y en la tasa de aceptación del target.
- Integración en aplicaciones de escritorio macOS: incorporar el par draft-target en apps nativas que requieran inferencia sin conexión y con consumo de memoria contenido para el draft (unos 209 MiB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para el draft: aproximadamente 209 MiB de pesos en 4 bits, más overhead de runtime; muy inferior al target.
- Memoria para el conjunto: el target MiniCPM-V 4.7 35B-A3B en precisión mixta MLX requiere memoria unificada considerable; el draft añade un coste marginal.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (familias M-series Pro/Max/Ultra); no está pensado para CUDA.
- Cabe en consumer GPU: no aplica en el sentido habitual; el draft sí cabe en cualquier Mac moderna, pero el target condiciona el requisito real de memoria.
- Opciones de despliegue: MLX 0.32.2 y MLX-VLM 0.7.1 adaptado con soporte DSpark; no se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; dependen del target, runtime, hardware, longitud de prompt y ajustes de decodificación, según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SSSAMMMM/MiniCPM-V-4.7-35B-A3B-DSpark-MLX-4bit | Draft especulativo MLX 4 bits | 389.223.169 | no disponible | Apache-2.0 | HuggingFace, 71 descargas |
| openbmb/MiniCPM-V-4.7-35B-A3B-DSpark | Draft especulativo original | no disponible | no disponible | Apache-2.0 (según upstream) | HuggingFace |
| SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed | Target MLX precisión mixta | 35B-A3B (nomenclatura) | no disponible | Apache-2.0 (según upstream) | HuggingFace |
| MiniCPM-V 4.7 35B-A3B (target estándar) | Modelo multimodal objetivo | 35B totales, 3B activos (nomenclatura) | no disponible | Apache-2.0 (según upstream) | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: no contiene tokenizador ni pesos de chat completos; usarlo solo como draft junto al target compatible.
- Compatibilidad estricta de runtime: requiere MLX-VLM con soporte DSpark; el autor no garantiza funcionamiento con versiones sin modificar.
- Dependencia del target: el rendimiento real depende del target, del hardware y de la configuración de decodificación; el bloque de verificación de 4 es un ajuste de la aplicación, no del peso.
- Riesgo de alucinación: inherente al target; el draft puede proponer tokens incorrectos que el target deberá rechazar, afectando a la tasa de aceptación.
- Sesgos: no documentados en la información disponible; heredados del modelo upstream de OpenBMB.
- Idiomas: no especificados; no se puede afirmar cobertura multilingüe del draft.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y del target upstream.
- Madurez: repositorio con 71 descargas y 0 likes, creado y actualizado el mismo día (26 de octubre de 2026); validación limitada a un entorno concreto.

## Enlaces

- HuggingFace del draft cuantizado: https://huggingface.co/SSSAMMMM/MiniCPM-V-4.7-35B-A3B-DSpark-MLX-4bit
- Modelo base (draft oficial OpenBMB): https://huggingface.co/openbmb/MiniCPM-V-4.7-35B-A3B-DSpark
- Target MLX validado: https://huggingface.co/SSSAMMMM/MiniCPM-V-4.7-35B-A3B-MLX-mixed
- Repositorio MLX: no disponible en la información proporcionada
- Repositorio MLX-VLM: no disponible en la información proporcionada
- Paper o blog de DSpark: no disponible en la información proporcionada
