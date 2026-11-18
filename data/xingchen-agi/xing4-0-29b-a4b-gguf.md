# XingChen-AGI/Xing4.0-29B-A4B-GGUF

## Resumen

Xing4.0-29B-A4B es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por China Telecom Artificial Intelligence Technology Co., Ltd. (serie Xing, anteriormente TeleChat). Cuenta con 29B parámetros totales y solo 4B activos por token (aproximadamente un 13,8 % de activación), lo que reduce el coste computacional de inferencia manteniendo una capacidad de representación propia de un modelo de mayor tamaño. Soporta de forma nativa una longitud de contexto de 256K tokens, extensible hasta 512K.

El modelo está orientado a tareas de ingeniería complejas: planificación sobre contexto largo, razonamiento multi-paso, tool calling y salida estructurada. Se entrenó de extremo a extremo sobre una pila tecnológica propia (desde silicio hasta software), con optimizaciones específicas para clústeres de NPU domésticos y un framework de entrenamiento interno. La versión de este repositorio es la build GGUF oficial, con cuantizaciones de 2 a 8 bits e imatrix, pensada para ejecución local en llama.cpp.

La relevancia actual del modelo radica en su combinación de licencia Apache 2.0, soporte nativo en el ecosistema abierto (llama.cpp mainline, SGLang mainline, plugin oficial de vLLM, ms-swift y LLaMA-Factory) y un rango de pesos de 11 a 34 GB que permite desplegarlo en una única GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en mHC + MLA + MTP (transformer con atención MLA y multi-token prediction) |
| Parametros totales | 29B (31.215.031.088 según safetensors) |
| Parametros activos | 4B por token (~13,8 % de activación) |
| Longitud de contexto | 256K nativo, extensible a 512K |
| Tipos de cuantizacion | GGUF de 2 a 8 bits con imatrix de cuantización |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repositorio de cuantizaciones); BF16, FP8 y W8A8 disponibles en repositorios separados |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE construida sobre los componentes mHC (atención multi-cabeza con adaptación propia), MLA (Multi-head Latent Attention) y MTP (Multi-Token Prediction). La activación selectiva de 4B parámetros por token sobre un total de 29B permite un equilibrio entre capacidad y coste de inferencia. La inclusión de MTP está orientada a la generación multi-token y a la coherencia en cadenas de razonamiento largas.

El entrenamiento se realizó sobre una pila completamente interna, adaptada a clústeres de NPU domésticos, con desarrollo de operadores fusionados y adaptación de las características de mHC. El autor reporta una mejora de throughput de entrenamiento de aproximadamente el 96 % sobre el rendimiento out-of-the-box, lograda mediante optimización de la comunicación en MoE de grano fino, recomputación selectiva, fusión automática de grafos y operadores, y kernels mHC fusionados ajustados manualmente. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso sobre contextos largos (hasta 256K tokens nativos).
- Planificación de tareas de ingeniería complejas y ejecución de cadenas de razonamiento con coherencia en contexto extendido.
- Tool calling y function calling, con formato alineado con frameworks de agentes como OpenCo.
- Salida estructurada.
- Ejecución de agentes y razonamiento multi-step.
- Capacidades multilingües: no disponible (no se detallan idiomas en la información proporcionada).
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Agentes de ingeniería de software: el modelo puede planificar y ejecutar tareas multi-paso con tool calling y salida estructurada, integrándose en pipelines de agentes que requieren coherencia sobre repositorios y trazas largas.
- Análisis de documentación técnica extensa: con 256K tokens de contexto nativo, puede procesar manuales, especificaciones o bases de código completas en una sola pasada sin fragmentación.
- Automatización de atención al cliente multi-turno: la ventana de contexto larga permite mantener historiales de conversación extensos y recuperar información de interacciones previas.
- Despliegue local en estación de trabajo: las builds GGUF de 11 a 34 GB caben en una GPU de consumo, lo que permite prototipado y uso privado sin infraestructura cloud.
- Generación de código en producción: el soporte de tool calling y su integración en SGLang y vLLM permiten incorporarlo a pipelines de CI/CD para revisión, generación y refactorización de código.
- Razonamiento sobre datos estructurados y extracción de información: la salida estructurada facilita la conversión de texto libre en JSON u otros formatos consumibles por sistemas downstream.
- Investigación en eficiencia de inferencia: su ratio de activación del 13,8 % lo convierte en un caso de estudio para comparar MoE frente a modelos densos de tamaño similar en coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 11 y 34 GB según la cuantización GGUF elegida (rango de 2 a 8 bits).
- GPU recomendadas: no se especifican modelos concretos en la información disponible; el autor indica que las builds caben en una única GPU de consumo.
- Compatibilidad con GPU de consumo: sí, según el autor, al ajustar la cuantización al tamaño de VRAM disponible.
- Opciones de despliegue: llama.cpp (build b12174+, soporte nativo en mainline), SGLang (mainline, PR #39793), plugin oficial de vLLM, ms-swift y LLaMA-Factory para fine-tuning.
- Latencia y throughput: no disponible. El autor reporta una mejora de throughput de entrenamiento del ~96 %, no de inferencia.
- Ejemplo de servicio local: `llama-server -m <quant>.gguf -c 32768 -ngl 99` para offload completo a GPU; sin `-ngl` para CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Xing4.0-29B-A4B | 29B | 4B | 256K (512K extensible) | Apache 2.0 | BF16, FP8, GGUF, W8A8 |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables que permitan una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan en la información proporcionada.
- Riesgo de alucinación: no cuantificado por el autor; aplicable el riesgo habitual de los modelos generativos, especialmente en contextos muy largos.
- Idiomas soportados: no especificados, lo que impide garantizar calidad en castellano u otras lenguas distintas de las mayoritarias en el entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; conviene revisar el archivo LICENSE del repositorio para condiciones adicionales.
- El modelo está orientado a tareas de ingeniería y agentes; su comportamiento en dominios conversacionales generales no está documentado.
- La información sobre datos de entrenamiento, composición del dataset y fases de alineación (RLHF/DPO) no está disponible, lo que limita la evaluación de riesgos en producción.
- El rendimiento real de las cuantizaciones de 2 y 3 bits puede degradarse de forma notable; el autor recomienda elegir la build según el presupuesto de VRAM.

## Enlaces

- Repositorio GGUF en Hugging Face: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Repositorio BF16: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B
- Repositorio FP8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-FP8
- Repositorio W8A8: https://huggingface.co/XingChen-AGI/Xing4.0-29B-A4B-w8a8
- Organización en Hugging Face: https://huggingface.co/XingChen-AGI
- GitHub del proyecto: https://github.com/XingChen-AGI/Xing4.0-29B-A4B
- Guía de ejecución local en llama.cpp: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/tutorial/llama.cpp/README_EN.md
- Licencia: https://github.com/XingChen-AGI/Xing4.0-29B-A4B/blob/main/LICENSE
- ModelScope: https://modelscope.cn/models/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- Modelers: https://modelers.cn/models/XingChen-AGI/Xing4.0-29B-A4B-GGUF
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/31589
- PR de soporte en SGLang: https://github.com/sgl-project/sglang/pull/39793
- PR de ms-swift: https://github.com/modelscope/ms-swift/pull/10275
- PR de LLaMA-Factory: https://github.com/hiyouga/LlamaFactory/pull/10754
- Cuantización de terceros (bartowski): https://huggingface.co/bartowski/XingChen-AGI_Xing4.0-29B-A4B-GGUF
- Ficha de hardware y despliegue (YouRunAI): https://www.yourunai.com/models/xing4-0/xingchen-agi-xing4-0-29b-a4b-gguf-5f7ef8
- Paper referenciado (arXiv:2512.24157): https://arxiv.org/abs/2512.24157
- Paper referenciado (arXiv:2507.18013): https://arxiv.org/abs/2507.18013
