# tencent/Hy3

## Resumen

Hy3 es un modelo de lenguaje de gran escala desarrollado por el equipo Tencent Hy, presentado en julio de 2026 como sucesor de Hy3 Preview. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 295.000 millones de parámetros totales y 21.000 millones de parámetros activos, lo que lo sitúa en la categoría de modelos eficientes que compiten con sistemas mucho más grandes. El modelo está disponible bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas.

El modelo destaca por sus capacidades de agente, razonamiento complejo y manejo de contexto largo de hasta 256.000 tokens. Según el equipo de desarrollo, Hy3 ha sido optimizado mediante post-entrenamiento escalado con datos de mayor calidad y entrenamiento por refuerzo, logrando mejoras sustanciales en estabilidad de tool calling, reducción de alucinaciones y seguimiento de intenciones en conversaciones multi-turno. La evaluación ciega con 270 expertos le otorgó una puntuación de 2,67/4, superando a GLM-5.1 (2,51/4), con ventajas especialmente notables en desarrollo frontend, datos y almacenamiento, y tareas de CI/CD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con MTP (Multi-Token Prediction) |
| Parametros totales | 298.786.155.776 (295B declarados + 3,8B MTP) |
| Parametros activos | 21B |
| Longitud de contexto | 256K tokens |
| Tipos de cuantizacion | BF16 nativo; disponible variante FP8 (Hy3-FP8) |
| Idiomas soportados | No disponible (se espera multilingue, con documentacion en chino e ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Hy3 emplea una arquitectura MoE con 192 expertos y activación top-8, lo que significa que para cada token solo se activan 8 de los 192 expertos disponibles, resultando en 21.000 millones de parámetros activos de un total de 295.000 millones. La arquitectura incluye 80 capas principales más una capa MTP adicional de 3,8B parámetros, diseñada para la predicción multi-token, una técnica que acelera la inferencia al predecir varios tokens futuros simultáneamente. La atención utiliza Grouped Query Attention (GQA) con 64 cabezas de atención, 8 cabezas KV y dimensión de cabeza de 128, con un tamaño oculto de 4096 y tamaño intermedio de 13312.

El entrenamiento se realizó sobre una infraestructura reconstruida, siendo Hy3 el primer modelo entrenado en ella. El post-entrenamiento se escaló con datos de mayor calidad y diversidad, incorporando entrenamiento por refuerzo (RL) a gran escala. El equipo reporta mejoras específicas en la estabilidad de tool calls y formatos de salida, reducción de la tasa de alucinación del 12,5% al 5,4%, y disminución de errores de sentido común del 25,4% al 12,7% en evaluaciones internas basadas en escenarios reales. La optimización conjunta de SFT y RL mejoró el seguimiento de intenciones multi-turno, reduciendo la tasa de problemas del 17,4% al 7,9%.

## Capacidades

- Generación de texto y razonamiento complejo con soporte de modo de pensamiento extendido.
- Tool calling y function calling estable, con generalización entre diferentes scaffoldings de agentes (CodeBuddy, Cline, KiloCode).
- Capacidades de agente avanzadas: ejecución de tareas multi-paso, colaboración multi-agente y uso de herramientas del sistema.
- Manejo de contexto largo de hasta 256K tokens con retención de información compleja.
- Generación de código en múltiples lenguajes, incluyendo frontend, backend, CI/CD y scripting.
- Razonamiento matemático y modelado financiero.
- Seguimiento de intenciones en conversaciones multi-turno con resolución de correferencias y elipsis.
- Conocimiento general con reducción significativa de alucinaciones y errores de sentido común.

## Casos de uso

- Asistentes de nivel sistema operativo: Hy3 puede integrarse en agentes como Marvis Agent de Tencent para edición y generación de archivos, gestión de archivos, diagnóstico de equipos y ejecución de tareas, gracias a su estabilidad en tool calling y su capacidad de razonamiento multi-paso.
- Desarrollo de software en producción: el modelo puede integrarse en pipelines de CI/CD para generación de código, revisión de pull requests y automatización de tareas de integración, aprovechando su rendimiento en tareas de CI/CD y su capacidad de contexto largo para manejar repositorios completos.
- Atención al cliente automatizada: con 256K tokens de contexto y mejora en el seguimiento de intenciones multi-turno, Hy3 puede gestionar conversaciones largas con clientes manteniendo el hilo de la conversación y las restricciones acumuladas.
- Diseño frontend: la evaluación ciega mostró ventaja sustancial en tareas de frontend, por lo que puede utilizarse para generar interfaces, componentes y estilos a partir de descripciones naturales.
- Análisis financiero y modelado: el modelo muestra competencia en tareas de modelado financiero, pudiendo procesar informes extensos, extraer datos relevantes y generar proyecciones con razonamiento matemático.
- Desarrollo de videojuegos: Hy3 puede asistir en la generación de scripts, diseño de niveles y lógica de juego, aprovechando su capacidad de razonamiento complejo y generación de código.
- Gestión de datos y almacenamiento: con rendimiento destacado en tareas de datos y almacenamiento, puede ayudar en la generación de consultas SQL, diseño de esquemas y documentación técnica.

## Benchmarks y rendimiento

La model card no incluye una tabla numerica de benchmarks publicos, sino que presenta graficos comparativos e informacion de evaluaciones internas. Los datos disponibles son:

- Evaluacion ciega con 270 expertos: Hy3 obtuvo 2,67/4 frente a GLM-5.1 con 2,51/4, con ventaja mas sustancial en frontend, datos y almacenamiento, y CI/CD.
- SWE-Bench Verified: la varianza de precision entre diferentes scaffoldings (CodeBuddy, Cline, KiloCode) se mantiene dentro del 4%.
- Reduccion de alucinaciones del 12,5% al 5,4% en evaluaciones internas.
- Reduccion de errores de sentido comun del 25,4% al 12,7% en evaluaciones internas.
- Mejora en evaluaciones de dialogo largo como MRCR.

No se han publicado resultados numericos detallados de MMLU, HumanEval, GSM8K u otros benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en BF16 requiere aproximadamente 560-600 GB de VRAM para alojar los pesos completos. La variante FP8 reduce este requisito a aproximadamente 300 GB.
- GPU recomendadas: para despliegue en produccion se requieren configuraciones multi-GPU con GPUs de alta capacidad como NVIDIA H100 (80 GB) o A100 (80 GB). Un despliegue completo necesitaria al menos 8x H100 para BF16.
- En consumer GPU: no es viable ejecutar el modelo completo en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño de los pesos. Solo seria posible con cuantizaciones agresivas (4-bit o inferior) que degradarian significativamente la calidad.
- Opciones de despliegue: el repositorio oficial proporciona guias de despliegue para vLLM y SGLang, ambos frameworks optimizados para inferencia de modelos MoE de gran escala.
- Latencia y throughput: no se han publicado datos oficiales de latencia o throughput. Como referencia, los modelos MoE con 21B activos suelen lograr throughput de 2.000-5.000 tokens/s en configuraciones multi-GPU optimizadas, pero estos datos no estan confirmados para Hy3.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Hy3 (Tencent) | 295B | 21B | 256K | Apache 2.0 | Abierto |
| GLM-5.1 (Zhipu) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Modelos flagship open-source (2-5x parametros) | 600B-1.000B+ | Variable | Variable | Variable | Variable |

La comparativa con GLM-5.1 se basa en la evaluacion ciega publicada por Tencent, donde Hy3 obtuvo mejor puntuacion global (2,67 vs 2,51). El equipo de Tencent afirma que Hy3 "rivaliza con modelos flagship open-source con 2-5x mas parametros", aunque no se especifican cuales. No se dispone de datos publicos adicionales para una comparativa mas detallada con modelos como DeepSeek-V3, Qwen3 o Llama 4.

## Limitaciones y advertencias

- Aunque la tasa de alucinacion se ha reducido al 5,4% en evaluaciones internas, el modelo puede seguir generando informacion falsa o inventada, especialmente en dominios especializados o con datos poco representados en el entrenamiento.
- El modelo puede cometer errores de sentido comun (12,7% en evaluaciones internas), lo que requiere supervision humana en aplicaciones criticas.
- No se han publicado detalles sobre los idiomas soportados ni la distribucion linguistica del entrenamiento, por lo que el rendimiento en espanol u otros idiomas distintos del chino e ingles no esta confirmado.
- El tamaño del modelo (597,6 GB en BF16) hace que el despliegue en produccion requiera infraestructura significativa, no siendo viable en entornos con recursos limitados.
- Aunque la licencia Apache 2.0 permite uso comercial sin restricciones, es recomendable revisar los terminos completos de la licencia y las politicas de uso de Tencent.
- La variante FP8 (Hy3-FP8) puede presentar ligeras degradaciones de calidad respecto al modelo BF16 original.
- El modelo es reciente (julio de 2026) y el ecosistema de herramientas, integraciones y mejores practicas de despliegue puede estar aun en desarrollo.

## Enlaces

- HuggingFace: https://huggingface.co/tencent/Hy3
- GitHub: https://github.com/Tencent-Hunyuan/Hy3
- GitHub (preview): https://github.com/Tencent-Hunyuan/Hy3-preview
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy3
- GitCode: https://ai.gitcode.com/tencent_hunyuan/Hy3
- CNB: https://cnb.cool/ai-models/tencent/Hy3
- Sitio oficial: https://aistudio.tencent.com/
- Articulo de Tencent: https://www.tencent.com/en-us/articles/2202386.html
- Pagina del modelo en Tencent Hunyuan: https://hunyuan.tencent.com/model/hy-model
