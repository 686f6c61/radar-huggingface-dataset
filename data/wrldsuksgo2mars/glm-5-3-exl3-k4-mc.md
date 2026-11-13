# wrldsuksgo2mars/GLM-5.3-EXL3-K4-MC

## Resumen

GLM-5.3-EXL3-K4-MC es una cuantización de 4 bits del checkpoint BF16 del modelo GLM-5.3, publicada por el usuario wrldsuksgo2mars. El modelo base pertenece a la familia GLM de Z.ai (zai-org) y emplea una arquitectura MoE con atención dispersa (el tag `glm_moe_dsa` sugiere un transformer de mezcla de expertos con atención dispersa o *dynamic sparse attention*). El checkpoint cuantizado conserva los 208.869.841.536 parámetros del modelo original, pero reduce el peso en disco mediante la técnica EXL3 (ExLlamaV3) en formato de 4 bits.

El paquete no es una cuantización única, sino un ensamblado *multi-core*: el índice por defecto apunta al núcleo BF16 original y el fichero `cuteafd-mc.json` descubre vistas alternativas completas K8 y K6, compartiendo expertos, módulos multimedia y *drafters*. Solo cambian las matrices del núcleo objetivo entre vistas. Los módulos densos MTP K4 del modelo padre (8 módulos) se mantienen compartidos sin restaurar a BF16 ni codificar a K8.

Es relevante para quien necesite desplegar un GLM-5.3 en hardware con menos VRAM que la versión BF16 (434,2 GB de repositorio), pero conviene subrayar que el autor no reclama ninguna cualificación de calidad de generación ni de rendimiento de servicio: el README se limita a documentar la procedencia de la cuantización y la compatibilidad de motores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención dispersa (`glm_moe_dsa`) |
| Parametros totales | 208.869.841.536 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 4 bits (vistas K4 por defecto, K6 y K8 alternativas) |
| Idiomas soportados | no disponible |
| Licencia | `glm-5.3` (license: other, enlazada al fichero LICENSE del modelo base) |
| Formato de pesos | safetensors (repo de 434,2 GB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer de mezcla de expertos (MoE) con atención dispersa, según el tag `glm_moe_dsa` del checkpoint. El autor no publica en la model card detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF, DPO o aprendizaje por refuerzo. El checkpoint cuantizado deriva de `zai-org/GLM-5.3-BF16` en el commit `9d2398f478cab2de883137db3a36ad2c96205e24`.

La innovación técnica de este paquete es el esquema *multi-core* de EXL3: un único repositorio contiene varias codificaciones del núcleo (K4 por defecto, K6 y K8 alternativas) que comparten expertos, módulos multimedia y *drafters*, de modo que solo las matrices del núcleo objetivo difieren entre vistas. El codificador K8 se construye a partir del fork `1f920091232cc670ac67c233391d1a771f29f996` (con validación de bitrate 1..8 y formato de adaptador) y hereda el fork K6 `a196a448fb3f76774c31e02b42523997f05385e3`, con la misma receta MCG/FP64-congruence. El runtime declarado para K8 es Transformers `5.19.0` y Torch `2.12.0a0+5aff3928d8.nv26.5.50603568`. Los hashes de fuente, calibración, receta y versiones reales de dependencias se registran en `quantization-provenance.k8.json`.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base GLM-5.3; el autor no las documenta de forma específica en la model card.
- Código y matemáticas: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible.
- Agentes y razonamiento multi-paso: el dataset de calibración se denomina `agentic-quant-panel-v1`, lo que sugiere calibración orientada a cargas agénticas, pero no se documentan capacidades funcionales.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): el README menciona módulos "media" y "drafters" compartidos entre vistas, lo que apunta a componentes multimodales y de decodificación especulativa en el modelo base, sin detallar su funcionamiento.

## Casos de uso

- Despliegue de GLM-5.3 en infraestructura con VRAM limitada: la vista K4 de 4 bits reduce el espacio en disco frente a los 434,2 GB del ensamblado completo, permitiendo servir el modelo en nodos multi-GPU donde la versión BF16 no cabría.
- Evaluación comparativa de precisiones: al incluir vistas K4, K6 y K8 en un mismo repositorio, permite medir el impacto de la tasa de bits en la calidad de salida sin cambiar de checkpoint ni de tokenizador.
- Investigación sobre cuantización EXL3: los ficheros de procedencia (`quantization-provenance.k8.json`, `package-validation.json`) permiten reproducir y auditar la receta de cuantización, útil para estudiar métodos MCG/FP64-congruence.
- Pipelines agénticos: la calibración sobre `agentic-quant-panel-v1` está pensada para cargas de agentes; el modelo puede integrarse en orquestadores que requieran un LLM de gran tamaño con tool calling, siempre que se valide la calidad tras la cuantización.
- Servicio de inferencia con decodificación especulativa: los *drafters* compartidos entre vistas permiten aprovechar decodificación especulativa en el motor cuteafd, reduciendo latencia en generación autoregresiva.
- Experimentación con atención dispersa: el tag `glm_moe_dsa` lo hace adecuado para estudiar el comportamiento de MoE con atención dispersa en contextos largos, aunque la longitud de contexto no está documentada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que este ensamblado no reclama ninguna cualificación de calidad de generación ni de rendimiento de servicio.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 434,2 GB; la vista K4 de 4 bits reduce el peso de las matrices del núcleo, pero el ensamblado incluye también el núcleo BF16 original y las vistas K6/K8.
- GPU recomendadas: no disponible. Por el tamaño del modelo (más de 200.000 millones de parámetros), se requiere un despliegue multi-GPU de clase centro de datos (A100, H100 o superiores); no cabe en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: el README solo menciona el motor cuteafd. La vista `k8-compact` requiere una build de cuteafd con el PR #1896 (núcleos Step-5 y GLM 5.3 K8); las vistas `original` y `k6-compact` funcionan en releases actuales de cuteafd. El runtime K8 usa Transformers 5.19.0 y Torch 2.12.0a0. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-EXL3-K4-MC | 208.869.841.536 | no disponible | EXL3 4 bits (K4/K6/K8) | `glm-5.3` | Hugging Face (0 descargas) |
| zai-org/GLM-5.3-BF16 (base) | 208.869.841.536 | no disponible | BF16 | `glm-5.3` | Hugging Face |
| Otros modelos de ~200B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El autor no reclama calidad de generación ni rendimiento de servicio: la cuantización no está validada empíricamente en la model card.
- La vista `k8-compact` exige una build específica de cuteafd (PR #1896); usarla con releases actuales puede fallar.
- Los módulos densos MTP K4 del modelo padre (8 módulos) se mantienen compartidos sin restaurar a BF16 ni codificar a K8, lo que puede introducir un desajuste de precisión entre componentes.
- Los diagnósticos del modelo padre describen la cuantización original, no el núcleo restaurado; no deben interpretarse como validación de este ensamblado.
- Licencia `glm-5.3` con cláusula "other": es imprescindible revisar el fichero LICENSE del modelo base antes de cualquier uso comercial.
- Riesgo de alucinación, sesgos e idiomas soportados: no documentados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (13 de noviembre de 2026): no hay evidencia de uso en producción ni validación por terceros.
- El tamaño del repositorio (434,2 GB) y la ausencia de datos de contexto limitan su evaluación para cargas de contexto largo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/wrldsuksgo2mars/GLM-5.3-EXL3-K4-MC)
- [Modelo base zai-org/GLM-5.3-BF16](https://huggingface.co/zai-org/GLM-5.3-BF16)
- [Licencia del modelo base (commit 9d2398f)](https://huggingface.co/zai-org/GLM-5.3-BF16/blob/9d2398f478cab2de883137db3a36ad2c96205e24/LICENSE)
- [PR #1896 de cuteafd (soporte K8 para GLM 5.3)](https://github.com/tpurtell/cuteafd/pull/1896)
- [Dataset de calibración agentic-quant-panel-v1](https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1)
