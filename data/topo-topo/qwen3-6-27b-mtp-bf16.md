# ToPo-ToPo/Qwen3.6-27B-MTP-bf16

## Resumen

ToPo-ToPo/Qwen3.6-27B-MTP-bf16 es un drafter de predicción multi-token (MTP) diseñado exclusivamente para acelerar la inferencia del modelo Qwen/Qwen3.6-27B mediante decodificación especulativa en Apple Silicon, utilizando la librería mlx-vlm. No es un modelo de chat independiente: solo funciona vinculado al modelo objetivo Qwen3.6-27B, del cual se extrajeron sus pesos internos `mtp.*` (15 tensores) mediante la herramienta de división de mlx-vlm 0.6.13.

El drafter se publica en precisión bf16 sin cuantizar, ocupa aproximadamente 829 MB y emplea un `block_size` de 3 con `model_type` `qwen3_5_mtp`. Su propósito es reducir la latencia de generación en hardware Apple, aprovechando que bajo decodificación greedy el argmax del drafter rara vez cambia con la cuantización del modelo objetivo, lo que permite compartir el mismo drafter con targets cuantizados.

La relevancia de esta pieza radica en que Qwen3.6-27B es un modelo denso de 27B parámetros con arquitectura híbrida `qwen3_5`, que según los resultados publicados alcanza un 77,2% en SWE-bench Verified, superando a modelos mucho mayores. El drafter MTP permite ejecutar este modelo de forma práctica en Macs con memoria unificada, un caso de uso cada vez más demandado por desarrolladores que trabajan en local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5_mtp (drafter MTP para decodificación especulativa) |
| Parametros totales | 424.699.392 (según safetensors) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3.6-27B) |
| Tipos de cuantizacion | bf16 (sin cuantizar) |
| Idiomas soportados | no disponibles (heredados del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería mlx) |

## Arquitectura y entrenamiento

El drafter MTP se obtiene directamente de los pesos `mtp.*` del checkpoint oficial de Qwen3.6-27B, sin entrenamiento adicional. La arquitectura corresponde al módulo de predicción multi-token integrado en el modelo base, que permite anticipar varios tokens futuros en paralelo durante la decodificación especulativa. El `block_size` de 3 indica que el drafter predice hasta 3 tokens por paso de verificación.

No se dispone de información sobre el dataset de entrenamiento del drafter, ya que no es un modelo entrenado de forma independiente, sino una extracción de los pesos del modelo base. La separación se realizó con el comando `python -m mlx_vlm.speculative.drafters.qwen3_5_mtp.split --model Qwen/Qwen3.6-27B --output .` de mlx-vlm 0.6.13, manteniendo la precisión bf16 original.

El modelo base Qwen3.6-27B emplea una arquitectura híbrida `qwen3_5` (según la documentación de la pila Qwen3.8, que es arquitectónicamente idéntica), con atención estándar y capacidades de visión y MTP integradas. El drafter hereda las características de representación del modelo base, pero su función exclusiva es proponer candidatos de tokens para acelerar la verificación del modelo objetivo.

## Capacidades

- No es un modelo de chat ni de generación independiente: solo funciona como drafter acoplado a Qwen3.6-27B.
- Proporciona predicción multi-token (hasta 3 tokens por paso) para decodificación especulativa.
- Compatible con modelos objetivo cuantizados: bajo decodificación greedy, el argmax del drafter apenas varía con la cuantización del target.
- Integración nativa con mlx-vlm para generación en Apple Silicon.
- Soporta el flujo de trabajo `mlx_vlm.generate` con los parámetros `--draft-model` y `--draft-kind mtp`.
- No requiere cuantización propia: se distribuye en bf16 y se comparte entre distintos targets cuantizados.

## Casos de uso

- Inferencia local acelerada de Qwen3.6-27B en Macs con Apple Silicon: el drafter reduce la latencia de generación al proponer múltiples tokens por paso, lo que resulta crítico para modelos de 27B que de otro modo serían lentos en hardware unificado.
- Desarrollo de asistentes de código en local: Qwen3.6-27B destaca en tareas de ingeniería de software (77,2% en SWE-bench Verified); el drafter permite iterar con baja latencia en entornos de desarrollo sin GPU dedicada.
- Prototipado de agentes y tool calling en entornos Apple: al acelerar la generación, se facilita la experimentación con flujos multi-paso que requieren múltiples llamadas al modelo.
- Despliegue de modelos de razonamiento en portátiles: combinado con el modelo base cuantizado, el drafter posibilita ejecutar tareas de razonamiento complejo en equipos con 32-64 GB de memoria unificada.
- Evaluación y benchmarking de Qwen3.6-27B en hardware Apple: el drafter permite medir el rendimiento real del modelo sin los cuellos de botella de la decodificación autoregresiva estándar.
- Integración en pipelines de CI/CD para generación de código: la menor latencia hace viable ejecutar suites de pruebas que invocan el modelo repetidamente, por ejemplo para generar tests o documentación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este drafter en la información disponible. La model card indica que la aceleración depende del hardware, la cuantización del target, la carga de trabajo y la versión de mlx-vlm, y recomienda medir el speedup en cada entorno concreto. No se proporcionan cifras de tokens por segundo ni comparativas con otros métodos de decodificación especulativa.

## Requisitos de hardware

- Apple Silicon (serie M) con memoria unificada: el drafter en bf16 ocupa aproximadamente 829 MB, pero el modelo base Qwen3.6-27B requiere entre 16 y 32 GB de memoria según la cuantización (4-bit o 8-bit).
- GPU recomendadas: cualquier chip Apple Silicon con al menos 32 GB de RAM unificada para el modelo base cuantizado a 4-bit; 64 GB o más para bf16 completo.
- No cabe en GPUs de consumo convencionales (RTX 4090, etc.) de forma directa, ya que está diseñado para mlx-vlm en Apple Silicon; para GPUs NVIDIA se requeriría una conversión a otro formato (no disponible en esta publicación).
- Opciones de despliegue: mlx-vlm 0.6.13 o superior, mediante el comando `mlx_vlm.generate` con los flags `--draft-model` y `--draft-kind mtp`.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantización del target y la versión de mlx-vlm.

## Comparativa con modelos similares

No se dispone de drafter MTP comparables publicados de forma independiente para Qwen3.6-27B. La alternativa más cercana sería utilizar el drafter integrado en el checkpoint oficial de Qwen3.6-27B sin separarlo, o emplear otros métodos de decodificación especulativa (como un modelo pequeño autoregresivo) que no están documentados en esta publicación. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: intentar usarlo como chat o generador de texto producirá resultados inválidos o errores.
- Solo funciona con Qwen3.6-27B como modelo objetivo; no es compatible con otros modelos de la familia Qwen ni con arquitecturas diferentes.
- La aceleración no está garantizada: el speedup real depende del hardware, la cuantización del target, la carga de trabajo y la versión de mlx-vlm; en algunos escenarios podría no haber mejora o incluso degradación.
- El drafter se distribuye en bf16 sin cuantizar, lo que añade ~829 MB de memoria adicional al modelo base; en equipos con poca RAM unificada esto puede ser un inconveniente.
- No se han publicado evaluaciones de sesgos, alucinación o calidad de las predicciones del drafter; su comportamiento se hereda del modelo base Qwen3.6-27B.
- La licencia apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener términos adicionales; se recomienda revisar la licencia del modelo base antes de un despliegue en producción.

## Enlaces

- Repositorio HuggingFace del drafter: https://huggingface.co/ToPo-ToPo/Qwen3.6-27B-MTP-bf16
- Modelo base Qwen3.6-27B: https://huggingface.co/Qwen/Qwen3.6-27B
- Guía completa de Qwen 3.6-27B (AIMadeTools): https://www.aimadetools.com/blog/qwen-3-6-27b-complete-guide/
- Guía de Qwen 3.6 local (InsiderLLM): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Repositorio de benchmarks Qwen3.6 en RTX 3090: https://github.com/tfriedel/qwen3.6-rtx3090-lab
- Guía de vLLM + MTP en Blackwell: https://github.com/lastloop-ai/vllm-blackwell-guide
