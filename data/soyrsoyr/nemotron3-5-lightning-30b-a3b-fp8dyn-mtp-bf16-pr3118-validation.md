# soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-BF16-pr3118-validation

## Resumen

Se trata de una variante cuantizada y de validación del modelo NVIDIA Nemotron 3.5 Lightning 30B-A3B, publicada por el usuario soyrsoyr bajo el identificador `soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-BF16-pr3118-validation`. El checkpoint parte de `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16` y aplica cuantización FP8 con activaciones dinámicas al backbone mediante llm-compressor y el formato compressed-tensors, manteniendo la cabeza de predicción multi-token (MTP, multi-token prediction) en BF16 sin modificar. El modelo cuenta con 32.913.266.240 parámetros reales según los safetensors publicados y ocupa 35,0 GB en el repositorio.

Su propósito declarado no es ofrecer una nueva versión del modelo, sino servir como artefacto de validación del PR 3118 de llm-compressor y demostrar que el resultado carga y genera correctamente en una H100 con métricas reales de tokens draft procedentes del módulo MTP. La model card indica explícitamente que la prueba superada no constituye un benchmark de calidad ni de rendimiento.

Es relevante ahora porque combina dos técnicas de optimización de inferencia muy demandadas: la cuantización FP8 con activaciones dinámicas, que reduce el peso de los parámetros a un byte por valor, y la decodificación especulativa mediante una cabeza MTP integrada, que permite generar tokens candidatos sin desplegar un modelo draft separado. Además, es un ejemplo práctico de integración temprana con versiones concretas de vLLM y Transformers para arquitecturas de la familia nemotron_h.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | nemotron_h (según la etiqueta del repositorio; la model card no detalla la composición de capas) |
| Parámetros totales | 32.913.266.240 (dato real de los safetensors) |
| Parámetros activos | El sufijo A3B del nombre sugiere en torno a 3.000 millones de parámetros activos por token; no confirmado en la información disponible |
| Longitud de contexto | No disponible; la validación se ejecutó con `--max-model-len 1024` |
| Tipos de cuantización | FP8 con cuantización dinámica de activaciones en el backbone; cabeza MTP en BF16 sin cuantizar. La model card menciona otras variantes de formato del mismo flujo (NVFP4A16, FP4 solo pesos con activaciones de 16 bits, y MXFP4 con activación dinámica), sin detallar si están incluidas en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 (declarada como `license: other` en HuggingFace, con enlace a OpenMDW 1.1) |
| Formato de pesos | safetensors con metadatos compressed-tensors (generados por llm-compressor) |
| Modelo base | nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 |
| Tamaño del repositorio | 35,0 GB |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

El repositorio etiqueta el modelo con `nemotron_h`, la nomenclatura que NVIDIA emplea para su familia de arquitecturas Nemotron-H, y con el sufijo A3B, convención habitual para indicar parámetros activos en configuraciones con mezcla de expertos. No obstante, la model card no especifica la composición exacta de capas, el número de expertos ni el mecanismo de enrutamiento, por lo que esos detalles deben consultarse en la documentación del modelo base. Tampoco se documentan los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO: toda esa información se considera no disponible en la documentación proporcionada.

La innovación técnica relevante de este artefacto es doble. Por un lado, aplica una receta de cuantización FP8 con activaciones dinámicas sobre el backbone mediante llm-compressor (PR 3118, commit `87347881`), empaquetando el resultado con el formato compressed-tensors; la model card señala que los formatos del backbone y del módulo MTP son independientes y que NVFP4A16 corresponde a FP4 solo de pesos con activaciones de 16 bits, mientras que MXFP4 usa cuantización dinámica de activaciones. Por otro, conserva intacta la cabeza MTP en BF16, lo que habilita decodificación especulativa con `num_speculative_tokens=1` en vLLM a través de `--speculative-config '{"method":"mtp", ...}'`, sin necesidad de un modelo draft externo.

## Capacidades

- Generación de texto y uso conversacional, según los tags `text-generation` y `conversational` del repositorio.
- Decodificación especulativa nativa mediante la cabeza MTP conservada en BF16, configurada en la validación con un token draft por paso.
- Compatibilidad con endpoints (tag `endpoints_compatible`), es decir, pensado para servirse detrás de una API compatible con el formato habitual de vLLM.
- Cuantización FP8 con activaciones dinámicas, orientada a reducir el consumo de memoria de pesos y a acelerar la inferencia en hardware con soporte de FP8.
- Soporte multimodal: el comando de validación limita las entradas multimodales a cero (`--limit-mm-per-prompt '{"image":0,"video":0}'`), lo que sugiere que la configuración del modelo base declara entradas de imagen y vídeo que aquí se desactivan; no se detalla el alcance real de dicha capacidad.
- Tool calling, function calling, razonamiento multi-paso y capacidades de agente: no disponibles en la documentación proporcionada.
- Cobertura multilingüe: no disponible.

## Casos de uso

- Servicio de generación conversacional en producción: el modelo puede desplegarse con vLLM detrás de una API compatible con endpoints y atender turnos conversacionales con pesos en FP8, reduciendo la huella de memoria frente al checkpoint BF16 original.
- Optimización de latencia en cargas interactivas: gracias a la cabeza MTP, se puede activar decodificación especulativa con un token draft por paso para intentar aumentar el número de tokens generados por unidad de tiempo sin desplegar un modelo draft adicional.
- Validación de recetas de cuantización en CI: el artefacto funciona como caso de prueba reproducible del PR 3118 de llm-compressor; el script incluido `verify_mtp.py` exige métricas positivas de tokens draft y registra las generaciones, lo que permite integrarlo en un pipeline de validación automatizada de cuantizaciones.
- Despliegue en GPUs de 80 GB con mayor concurrencia: al reducir los pesos a aproximadamente un byte por parámetro, el espacio liberado respecto a BF16 puede destinarse a caché KV y a más secuencias simultáneas, lo que resulta útil en servicios con muchos usuarios concurrentes.
- Investigación sobre arquitecturas híbridas y MTP: el checkpoint permite experimentar con Transformers 5.17.0 sobre la clase `nemotron_h` y medir el comportamiento de la predicción multi-token en un entorno controlado.
- Sustitución directa del checkpoint BF16 en pipelines existentes: al compartir arquitectura y modelo base, puede reemplazar al modelo original en infraestructuras ya montadas sobre vLLM, con el ahorro de VRAM correspondiente.
- Pruebas de compatibilidad de versiones: sirve para verificar el funcionamiento conjunto de vLLM 0.29.1rc1, Transformers 5.17.0 y CUDA 13.0 antes de adoptar esas versiones en otros despliegues.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma literalmente que la validación superada "no es un benchmark de calidad ni de rendimiento". Los únicos datos medidos que se documentan son los siguientes:

| Prueba | Entorno | Resultado |
|---|---|---|
| Carga y generación en H100 | vLLM 0.29.1rc1.dev79+g767d1c4d4, Transformers 5.17.0, CUDA 13.0 | PASSED |
| Métricas de tokens draft con MTP | 2 prompts, `num_speculative_tokens=1`, `--max-model-len 1024`, `--enforce-eager`, `--gpu-memory-utilization 0.85` | Positivas; no se publican cifras concretas |
| MMLU, HumanEval, GSM8K u otros | No evaluados en la información disponible | No disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos FP8 de un byte por parámetro, el backbone ocupa aproximadamente 33 GB, más la cabeza MTP en BF16 y la caché KV; se estima un mínimo práctico en torno a 35-45 GB, dependiendo de la longitud de contexto y del número de secuencias concurrentes (estimación propia a partir de los 35,0 GB del repositorio).
- El checkpoint BF16 del modelo base requeriría aproximadamente el doble de memoria (del orden de 66 GB), por lo que esta variante es la opción para GPUs de 80 GB con margen para caché.
- GPU recomendadas: NVIDIA H100, que es la plataforma efectivamente validada en la model card. Se requiere hardware con soporte de FP8 (Hopper o Ada, compute capability 8.9 o superior) para explotar la cuantización; la compatibilidad con otras GPU no se documenta.
- Cabe en GPU de consumo: no. Las GPUs de consumo actuales (RTX 4090 con 24 GB, RTX 5090 con 32 GB) no disponen de memoria suficiente para los pesos FP8 más la caché KV. Encajaría, con contexto reducido, en tarjetas profesionales de 48 GB como la L40S o la RTX 6000 Ada.
- Opciones de despliegue: vLLM es la ruta validada, con la configuración exacta indicada en la model card. Transformers 5.17.0 se cita como entorno de referencia. No hay información sobre compatibilidad con llama.cpp, Ollama o TGI, y el formato compressed-tensors FP8 hace poco probable su uso directo en motores que no lo soporten.
- Latencia y throughput: no disponibles. La validación emplea `--enforce-eager`, lo que desactiva las CUDA Graphs y limita el rendimiento máximo alcanzable; las cifras de tokens por segundo no se publican.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-BF16-pr3118-validation | 32.913.266.240 | No disponible | safetensors + compressed-tensors (FP8 dinámico, MTP en BF16) | openmdw-1.1 | Repositorio HuggingFace, 0 descargas y 0 likes |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 (modelo base) | Mismo orden de magnitud, según el nombre 30B totales con 3B activos (no confirmado) | No disponible | safetensors en BF16 | Se rige por la licencia del origen; no especificada en la información disponible | Repositorio HuggingFace de NVIDIA |
| Alternativas MoE de ~30B totales de otros fabricantes (por ejemplo, la familia Qwen3-30B-A3B) | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Es un artefacto de validación de un PR concreto de llm-compressor, no una publicación oficial de NVIDIA, y no aporta ninguna garantía de calidad ni de estabilidad.
- El propio autor advierte que la prueba superada no constituye un benchmark de calidad ni de rendimiento; no se han publicado evaluaciones de precisión tras la cuantización.
- La cuantización FP8 con activaciones dinámicas puede degradar la calidad de salida respecto al checkpoint BF16, y ese extremo no se ha medido en la documentación disponible.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación, por lo que no es posible evaluar riesgos de sesgo con la información aportada.
- Riesgo de alucinación: no evaluado en la información disponible; se trata de un modelo generativo sin métricas de fidelidad publicadas.
- La longitud de contexto real no se especifica; la validación solo cubre 1024 tokens, muy por debajo de lo que suele necesitar un caso de uso en producción.
- La cabeza MTP se conserva en BF16 mientras el backbone está en FP8: implica memoria adicional y una mezcla de precisiones cuyo impacto final no se detalla.
- Licencia openmdw-1.1 declarada como `other`: no concede derechos adicionales sobre el modelo origen y obliga a revisar la licencia del checkpoint de NVIDIA para uso comercial.
- Los requisitos de versión son muy estrictos (vLLM 0.29.1rc1.dev79, Transformers 5.17.0, CUDA 13.0); es probable que no funcione en versiones estables anteriores o posteriores sin ajustes.
- La adopción es nula hasta la fecha de los metadatos (creado el 14 de septiembre de 2026, con 0 descargas y 0 likes), por lo que no existe validación comunitaria independiente.
- La compatibilidad de MXFP4 requiere, según la model card, verificar el runtime en B200 por parte del usuario; esa variante no está validada aquí.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/soyrsoyr/Nemotron3.5-Lightning-30B-A3B-FP8Dyn-MTP-BF16-pr3118-validation
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Árbol concreto del modelo base usado como origen: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16/tree/a9904d24bcc1d289a1950fa9d2b978c47cf903b9
- Implementación de la receta (llm-compressor PR 3118, commit 87347881): https://github.com/soyr-redhat/llm-compressor/commit/87347881b46df8786b9fc463965f80504914a98f
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
