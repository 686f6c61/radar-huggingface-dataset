# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-pr3118-validation

## Resumen

Este repositorio no es un modelo nuevo, sino un artefacto de validación publicado por el usuario `soyrsoyr`: una cuantización del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` generada con `llm-compressor` (PR 3118) que combina cuantización dinámica FP8 en el backbone y NVFP4A16 en la cabeza de predicción multi-token (MTP, *Multi-Token Prediction*). El objetivo declarado es comprobar que la carga y la generación con decodificación especulativa MTP funcionan de extremo a extremo sobre una H100, no servir como modelo de producción ni como referencia de calidad.

El modelo base pertenece a la familia Nemotron de NVIDIA, con una arquitectura híbrida identificada por el tag de Transformers `nemotron_h` y un esquema de mezcla de expertos (MoE): la denominación `30B-A3B` indica 30.000 millones de parámetros totales y aproximadamente 3.000 millones activos por token. Los pesos `safetensors` suman 32.245.782.080 parámetros según los metadatos reales, una cifra superior a los 30B nominales que probablemente incluye las cabezas MTP y otros componentes auxiliares.

Su relevancia es acotada y muy técnica: documenta un formato de cuantización FP4 (pesos a 4 bits con activaciones de 16 bits) sin calibración, junto con métricas positivas de *draft tokens* en decodificación especulativa, en un contexto donde el soporte de MTP cuantizado en vLLM todavía es experimental. Es un modelo con 0 descargas y 0 *likes* en el momento de redactar esta ficha, pensado para reproducir un caso concreto de validación de *software*, no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H híbrida (tag `nemotron_h` de Transformers); mezcla de expertos (MoE) con cabeza MTP |
| Parametros totales | 32.245.782.080 (~32,2 B) segun metadatos de safetensors; denominacion comercial 30B |
| Parametros activos | ~3 B por token (denominacion A3B del modelo base) |
| Longitud de contexto | no disponible (el script de validacion usa `--max-model-len 1024`, que no representa el contexto nativo) |
| Tipos de cuantizacion | FP8 dinamico (backbone), NVFP4A16 (pesos FP4 *weight-only* con activaciones de 16 bits), MXFP4 (activaciones con cuantizacion dinamica) |
| Idiomas soportados | no disponible |
| Licencia | openmdw-1.1 (`license: other`); la licencia del modelo original sigue aplicandose |
| Formato de pesos | safetensors (`compressed-tensors`) |

## Arquitectura y entrenamiento

La arquitectura corresponde al tag `nemotron_h`, es decir, la familia híbrida Nemotron-H de NVIDIA, que combina capas de espacio de estados con capas de atención transformer en un esquema MoE. El modelo conserva, ademas, una cabeza MTP (*Multi-Token Prediction*) que se utiliza para decodificación especulativa: se predicen varios tokens candidatos por paso y el modelo principal los verifica, acelerando la generación cuando la tasa de acierto es alta. En este repositorio el backbone y la cabeza MTP se almacenan en formatos de cuantización distintos, según se indica expresamente en la model card ("Backbone and MTP formats are separate").

No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni sobre si hubo RLHF o DPO: esta ficha describe un artefacto de compresión, y el autor remite a la model card del modelo base para cualquier detalle de entrenamiento. La innovación técnica del repositorio es la propia receta de cuantización: un esquema *data-free* (sin calibración con datos) aplicado a la MTP de origen denso, con dos variantes documentadas. NVFP4A16 es FP4 solo para pesos con activaciones de 16 bits, y el autor aclara de forma explícita que **no** es un NVFP4 W4A4 calibrado; MXFP4, por su parte, aplica cuantización dinámica de activaciones. El *runtime* validado es `vllm==0.29.1rc1.dev79+g767d1c4d4`, Transformers `5.17.0` y CUDA 13.0.

## Capacidades

- Generación de texto y uso conversacional, según los tags `text-generation` y `conversational`.
- Decodificación especulativa mediante MTP, con la configuración `{"method":"mtp","num_speculative_tokens":1}`.
- Cuantización híbrida FP8 dinámico y NVFP4A16, lo que permite cargar el modelo en formato comprimido sin calibración previa.
- Compatibilidad declarada con *endpoints* (`endpoints_compatible`) y con el ecosistema `compressed-tensors` de llm-compressor.
- Capacidades de tool calling, agentes, matemáticas, código, razonamiento multi-paso o multilingüismo del modelo base: no disponibles en la información proporcionada.
- Capacidades multimodales: no confirmadas. El comando de servicio incluye `--limit-mm-per-prompt '{"image":0,"video":0}'`, lo que sugiere que el pipeline subyacente reconoce entradas de imagen y vídeo, pero se desactivan explícitamente en esta validación y no se documenta ningún soporte funcional.

## Casos de uso

- Validación de recetas de cuantización: sirve para reproducir el comportamiento de `llm-compressor` PR 3118 sobre una arquitectura híbrida MoE y comprobar que los pesos FP8 y NVFP4A16 cargan correctamente antes de aplicar la receta a otros modelos.
- Verificación de decodificación especulativa MTP: el script `verify_mtp.py` ejecuta dos *prompts* y exige métricas positivas de *draft tokens*; es el caso de uso principal y está pensado como prueba de aceptación de una integración de vLLM.
- Pruebas de regresión de infraestructura: al fijar `vllm`, Transformers y CUDA concretos, permite detectar roturas en el soporte de MTP cuantizado al actualizar el *stack* de inferencia.
- Servicio de generación de texto en centro de datos: desplegable con `vllm serve` sobre H100, con pesos comprimidos que reducen el uso de memoria frente al BF16 original.
- Evaluación comparativa de formatos FP4: útil para medir la diferencia práctica entre NVFP4A16 y MXFP4 en una misma arquitectura, aunque el autor no publique resultados de calidad.
- Referencia para pipelines de compresión *data-free*: sirve como plantilla de configuración para equipos que necesiten cuantizar modelos MoE híbridos sin acceso a un conjunto de calibración representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card lo indica de forma explícita: la validación en H100 "no es un benchmark de calidad ni de rendimiento". El único resultado reportado es cualitativo (carga y generación superadas, con métricas reales de *draft tokens* de MTP), sin cifras de MMLU, HumanEval, GSM8K ni latencia o *throughput*.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 33,1 GB en disco con formatos mixtos y el servicio se lanza con `--dtype bfloat16` y `--gpu-memory-utilization 0.85`. En la práctica requiere una GPU de 80 GB (H100) para dejar margen a la caché KV y al *overhead* de MTP.
- GPU recomendadas: H100 (plataforma validada). Para MXFP4, el autor indica que se necesita una ejecución en B200 para establecer la compatibilidad de *runtime*.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 24 GB equivalentes. Sería necesario un ensamblado multi-GPU o GPUs de 48 GB o más (A6000, L40S) para una carga holgada.
- Opciones de despliegue: vLLM, con el comando documentado que usa `--enforce-eager`, `--max-model-len 1024`, `--gpu-memory-utilization 0.85` y `--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`. No se documentan otras rutas (llama.cpp, Ollama, TGI) para estos pesos.
- Latencia y throughput: no disponibles. No se publican métricas de velocidad ni de tasa de aceptación de *draft tokens*.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-pr3118-validation | ~32,2 B totales, ~3 B activos | no disponible | FP8 dinamico + NVFP4A16 + MXFP4 | openmdw-1.1 | Validacion, 0 descargas |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | ~30 B totales, ~3 B activos | no disponible | BF16 | openmdw-1.1 | Modelo base de referencia |
| Otras cuantizaciones del mismo modelo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguna de las alternativas en la información proporcionada, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es un modelo listo para producción: es un artefacto de validación con 0 descargas, creado y actualizado con dos días de diferencia, y el propio autor lo describe como una prueba de carga y generación, no de calidad.
- Riesgo de degradación por cuantización: el esquema NVFP4A16 es *weight-only* y *data-free*, sin calibración; no hay ninguna evaluación publicada de la pérdida de precisión respecto al BF16 original.
- El soporte de MTP cuantizado es experimental y depende de versiones concretas de vLLM (`0.29.1rc1.dev79+g767d1c4d4`), Transformers (`5.17.0`) y CUDA 13.0; cambios de versión pueden romper la carga.
- MXFP4 requiere validación en B200 y no está confirmado en la plataforma H100 usada para el resto de la prueba.
- Licencia `openmdw-1.1` (Open Model Development...): la licencia del modelo original sigue aplicándose y esta validación no añade ninguna concesión adicional. No se han verificado aquí las condiciones exactas para uso comercial.
- Sesgos, idiomas soportados y comportamiento multilingüe: no disponibles; no se puede asumir el comportamiento del modelo base sin verificarlo.
- Riesgo de alucinación: no evaluado en esta información.
- Idiomas soportados y contexto nativo: no documentados en el repositorio.
- Las fechas de creación y actualización (septiembre de 2026) son posteriores a la fecha habitual de publicación; conviene tratarlas como metadatos sin verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-NVFP4A16-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Revision concreta del modelo base citada por el autor: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/tree/a9904d24bcc1d289a1950fa9d2b978c47cf903b9
- Implementacion de cuantizacion (llm-compressor PR 3118, commit `87347881`): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
