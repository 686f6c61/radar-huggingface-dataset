# vcruz305/GLM-5.3-Flash-GGUF

## Resumen

GLM-5.3-Flash-GGUF es una escalera de cuantizaciones en formato GGUF del modelo GLM-5.3-Flash, desarrollada por la comunidad (vcruz305) a partir de los pesos BF16 publicados por Z.ai. GLM-5.3-Flash es el primer modelo nativamente multimodal de la serie GLM-5, con una arquitectura de mezcla de expertos (MoE) híbrida que combina atención sparse y lineal, junto con conexiones hiper-restrictivas por manifold (mHC). Con 320 mil millones de parámetros totales y solo 18 mil millones activos, el modelo está diseñado para ofrecer un alto rendimiento en tareas de codificación, razonamiento y agentes a un coste de inferencia reducido.

Esta versión GGUF permite ejecutar el modelo con llama.cpp y herramientas compatibles, ofreciendo cuantizaciones dinámicas K-quant desde Q2_K hasta Q6_K, con tamaños estimados entre 115 y 285 GiB. La relevancia de esta ficha radica en que facilita el despliegue local del modelo en entornos con recursos limitados, manteniendo un equilibrio entre calidad y uso de memoria. El modelo base ha sido evaluado por Z.ai en benchmarks de agente y codificación, acercándose a Claude Opus 4.8 en dichas tareas, aunque los resultados numéricos detallados no se incluyen en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención sparse y lineal, Manifold-Constrained Hyper-Connections (mHC) |
| Parametros totales | 320B |
| Parametros activos | 18B |
| Longitud de contexto | No disponible oficialmente; evaluado hasta 1M tokens en pruebas (NL2Repo) y 400K en DeepSWE |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K (Dynamic K-quant) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

GLM-5.3-Flash emplea una arquitectura de mezcla de expertos (MoE) con 320B parámetros totales y 18B activos por token. La novedad principal es la combinación de atención sparse (clásica) con atención lineal, lo que reduce drásticamente los costes de servir contextos largos sin sacrificar precisión. Además, introduce las conexiones hiper-restrictivas por manifold (mHC), una técnica que mejora la eficiencia de escalado del modelo. El pre-entrenamiento se realizó sobre un corpus multimodal de 30 billones de tokens, y el modelo ha pasado por un proceso de post-entrenamiento orientado a tareas de agente y codificación, aunque los detalles específicos (como el uso de RLHF o DPO) no se especifican en la información disponible.

La versión GGUF aquí descrita se generó mediante la conversión de los pesos BF16 originales a formato f16 y posterior cuantización dinámica K-quant, con ajustes específicos como la cuantización del router MoE a q8_0 y la preservación de ciertos tensores en f32 para mantener la estabilidad numérica. No se utilizaron cuantizaciones IQ, y se aplicó una matriz de importancia (--imatrix) cuando fue posible.

## Capacidades

- Generación de texto y razonamiento complejo en inglés y chino.
- Codificación de software, con soporte para tool calling y function calling, lo que permite integración en pipelines de desarrollo.
- Capacidades de agente autónomo: ejecución de tareas multi-paso con razonamiento encadenado, evaluado en benchmarks como DeepSWE y Terminal-Bench.
- Multimodal nativo: procesamiento de imágenes y texto (aunque la versión GGUF requiere un archivo mmproj separado para el vision tower, que aún no está disponible).
- Manejo de contextos muy largos, con evaluaciones de hasta 1M tokens en tareas de repositorio de código (NL2Repo).
- Soporte para despliegue en frameworks de inferencia optimizados: SGLang, vLLM, TokenSpeed y KTransformers.

## Casos de uso

- Asistente de codificación en producción: el modelo puede integrarse en IDEs o pipelines de CI/CD para generar, revisar y refactorizar código, aprovechando su soporte de tool calling y su capacidad para manejar repositorios completos con contexto de hasta 1M tokens.
- Agente autónomo de resolución de incidencias: con su rendimiento en DeepSWE, puede actuar como agente que navega por repositorios, ejecuta comandos y propone parches, reduciendo la intervención manual en tareas de mantenimiento de software.
- Atención al cliente multilingüe: su capacidad de generar respuestas coherentes en inglés y chino, junto con su ventana de contexto amplia, permite gestionar conversaciones multi-turno con historial extenso y documentos adjuntos.
- Análisis de documentos legales o técnicos extensos: gracias a su contexto de hasta 1M tokens, puede resumir, extraer información y responder preguntas sobre manuales, contratos o informes de gran tamaño.
- Asistente multimodal para soporte técnico: al ser nativamente multimodal, puede interpretar capturas de pantalla o diagramas enviados por usuarios y proporcionar instrucciones precisas (requiere el archivo mmproj).
- Traducción y localización automática: su entrenamiento bilingüe (en, zh) permite traducciones de alta calidad en contextos técnicos y de negocio, con la posibilidad de mantener el estilo y la terminología específica.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la informacion disponible. La model card original de Z.ai menciona que GLM-5.3-Flash supera a GLM-5.2 en benchmarks y cargas de trabajo reales, y se acerca a Claude Opus 4.8 en tareas de codificación y agente, pero no se incluyen cifras concretas (MMLU, HumanEval, GSM8K, etc.). Las evaluaciones citadas (HLE w/ tools, NL2Repo, DeepSWE, Terminal-Bench 2.1, Toolathlon Verified, AutomationBench, GDPval-AA v2) se realizaron con configuraciones específicas de temperatura, top_p y longitudes de generación, pero sus resultados no están disponibles en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (tamaños de archivo estimados):
  - Q2_K: ~115–130 GiB
  - Q3_K_S: ~140–155 GiB
  - Q3_K_M: ~145–160 GiB
  - Q3_K_L: ~155–170 GiB
  - Q4_K_S: ~185–205 GiB
  - Q4_K_M: ~190–210 GiB (recomendado como equilibrio calidad/recursos)
  - Q5_K_S: ~230–250 GiB
  - Q5_K_M: ~240–260 GiB
  - Q6_K: ~260–285 GiB
- GPU recomendadas: no disponible específicamente, pero por el tamaño del modelo se requieren múltiples GPUs de alta capacidad (por ejemplo, 4-8 × A100 80GB o H100 80GB) para las cuantizaciones más bajas, y más para las altas.
- No cabe en GPUs de consumo (RTX 4090, etc.) debido al tamaño mínimo de ~115 GiB.
- Opciones de despliegue: llama.cpp (para GGUF), SGLang, vLLM, TokenSpeed y KTransformers (para los pesos BF16 originales).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos numéricos comparativos en la información proporcionada. Sin embargo, se puede contextualizar:

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-5.3-Flash (este) | 320B | 18B | Hasta 1M (evaluado) | MIT | Multimodal, MoE híbrido |
| GLM-5.2 | No disponible | No disponible | No disponible | No disponible | Modelo anterior de la serie, superado por GLM-5.3-Flash |
| Claude Opus 4.8 | No disponible (propietario) | No disponible | No disponible | Propietaria | Referencia en codificación y agentes, no open-weights |

No se dispone de información sobre otros modelos MoE abiertos comparables (como DeepSeek-V3 o Qwen2.5-Max) en la documentación consultada.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos específicos en la información disponible, pero al ser un modelo entrenado principalmente con datos en inglés y chino, puede presentar sesgos culturales o lingüísticos en otros idiomas.
- Riesgo de alucinación: como todo modelo generativo, puede producir información falsa o inventada, especialmente en tareas de razonamiento complejo o con contextos ambiguos.
- Limitaciones de contexto: aunque se ha evaluado hasta 1M tokens, el rendimiento en contextos extremadamente largos puede degradarse; se recomienda validar en el caso de uso concreto.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero el modelo base puede tener condiciones adicionales no reflejadas en esta ficha (se recomienda revisar la documentación oficial de Z.ai).
- Caveats de producción: el tamaño del modelo (incluso cuantizado) requiere infraestructura de múltiples GPUs; la cuantización puede introducir degradación de calidad, especialmente en las versiones Q2_K y Q3_K. El archivo mmproj para el vision tower aún no está disponible en esta versión GGUF, por lo que las capacidades multimodales no son accesibles de momento.

## Enlaces

- Repositorio GGUF: https://huggingface.co/vcruz305/GLM-5.3-Flash-GGUF
- Modelo base BF16: https://huggingface.co/zai-org/GLM-5.3-Flash-BF16
- Blog oficial de Z.ai sobre GLM-5.3-Flash: https://z.ai/blog/glm-5.3-flash
- Paper técnico de GLM-5: https://arxiv.org/abs/2602.15763
- Documentación de la API de Z.ai: https://docs.z.ai/guides/llm/glm-5.3-flash
- Repositorio de despliegue SGLang: https://github.com/sgl-project/sglang
- Repositorio de despliegue vLLM: https://github.com/vllm-project/vllm
- Repositorio de despliegue TokenSpeed: https://github.com/lightseekorg/tokenspeed
- Repositorio de despliegue KTransformers: https://github.com/kvcache-ai/ktransformers
- Pack NVFP4 hermano: https://huggingface.co/vcruz305/GLM-5.3-Flash-NVFP4
