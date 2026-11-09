# Volpidash/deepseek-r1-14b-security

## Resumen

DeepSeek R1 14B Security es un ajuste fino experimental del modelo de razonamiento DeepSeek-R1-Distill-Qwen-14B, desarrollado por el usuario Volpidash. El objetivo declarado es construir un asistente local de investigación en seguridad centrado en el ecosistema iOS, en la interpretación de avisos de Apple, en registros CVE públicos y en material de pentesting. El modelo se distribuye como adaptador LoRA (entrenado con QLoRA) sobre el modelo base, y el autor planea publicar además una cuantización GGUF Q4_K_M para inferencia local en LM Studio o llama.cpp.

La arquitectura subyacente es la del modelo base: un transformer denso de 14 mil millones de parámetros derivado de Qwen, destilado a partir de DeepSeek-R1 y orientado a generar cadenas de razonamiento antes de la respuesta final. El ajuste fino no modifica la arquitectura, sino el comportamiento: se entrena al modelo para citar fuentes suministradas, separar versiones afectadas de versiones parcheadas y señalar evidencia ausente en lugar de completar huecos con conocimiento memorizado.

Es relevante ahora porque ejemplifica una tendencia práctica: adaptar modelos de razonamiento abiertos a dominios verticales de nicho mediante LoRA y datos de fuentes públicas (avisos de Apple, catálogo CISA KEV, dataset de pentesting), manteniendo la posibilidad de ejecución local en hardware de consumo. No obstante, en el momento de redactar esta ficha el proyecto está en construcción: los artefactos entrenados, la evaluación final y el GGUF figuran como pendientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de DeepSeek-R1-Distill-Qwen-14B); ajuste fino mediante adaptador LoRA/QLoRA |
| Parametros totales | 14B (modelo base); el adaptador LoRA añade un número no especificado de parámetros entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada para el fine-tune; el autor recomienda empezar con 4.096 tokens en LM Studio. La secuencia de entrenamiento fue de 768 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M planificado; el adaptador LoRA se distribuye en precisión de entrenamiento |
| Idiomas soportados | Inglés (según la model card y los tags) |
| Licencia | MIT |
| Formato de pesos | Adaptador PEFT/LoRA; GGUF Q4_K_M (pendiente de exportación) |

## Arquitectura y entrenamiento

El modelo parte de DeepSeek-R1-Distill-Qwen-14B, un transformer denso de 14B parámetros destilado por DeepSeek a partir de su modelo de razonamiento R1 sobre la base de Qwen. Sobre él se aplica un ajuste QLoRA con la pérdida calculada únicamente sobre los tokens de respuesta, lo que concentra el aprendizaje en la salida y no en el prompt. El entrenamiento se realizó en una AMD Radeon RX 6800 XT con 16 GB de VRAM, con una secuencia de 768 tokens y un pico de 13,63 GiB de VRAM asignada en la prueba de ajuste del modelo completo.

Los datos combinan tres fuentes: 1.125 ejemplos de entrenamiento (42 retenidos) extraídos de 24 avisos de seguridad de Apple, incluidos lanzamientos de iOS 27; 454 ejemplos (42 retenidos) del catálogo CISA Known Exploited Vulnerabilities con instantánea del 6 de noviembre de 2026; y 1.817 ejemplos (180 retenidos) del dataset público `theelderemo/pentesting-explanations`. En total, 3.396 ejemplos de entrenamiento y 264 de evaluación. El proceso de preparación agrupó los registros de Apple por aviso y el resto por CVE o pregunta, y eliminó registros de entrenamiento que compartían CVE con el conjunto de evaluación para evitar filtración. No se documentan fases de RLHF o DPO adicionales.

## Capacidades

- Generación de texto con razonamiento previo (estilo DeepSeek-R1), heredada del modelo base.
- Interpretación de avisos de seguridad de Apple: componentes de plataforma, kernel, WebKit y servicios del sistema.
- Extracción estructurada de registros CVE: producto afectado, impacto documentado y guía de remediación.
- Distinción explícita entre versiones afectadas y versiones que contienen el parche.
- Citación de fuentes suministradas en el prompt y marcado de evidencia ausente.
- Explicación de técnicas de pentesting y comparación de opciones a partir de material público.
- Respuestas en inglés; no se declara soporte multilingüe.
- Tool calling nativo y flujos de investigación autónomos: no validados según el autor.

## Casos de uso

- Triaje de avisos de Apple: pegar extractos fechados de un aviso y obtener una tabla de CVE, componente afectado, impacto y versión con el parche, con URL de cita por entrada. Adecuado porque el entrenamiento se construyó precisamente sobre ese formato.
- Enriquecimiento de registros CISA KEV: dado un aviso de proveedor y su entrada KEV, resumir la vulnerabilidad documentada y la acción requerida, separando hechos confirmados de datos a verificar.
- Apoyo a analistas de vulnerabilidades: clasificar rápidamente si un rango de versiones está afectado o parcheado, señalando cuándo la fuente no lo establece.
- Formación en pentesting: explicar técnicas y comparar alternativas con material público, útil en entornos de aprendizaje donde no se quiere depender de un servicio en la nube.
- Investigación local con datos sensibles: al ejecutarse en local (adaptador o GGUF), permite procesar extractos de avisos internos sin enviarlos a terceros.
- Preprocesado en pipelines de threat intelligence: normalizar avisos heterogéneos a un esquema común antes de indexarlos en una base de datos o en un sistema RAG.
- Asistente de documentación de seguridad: redactar resúmenes de remediación para equipos de operaciones a partir de fuentes aportadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la evaluación comparativa entre modelo base y fine-tune está pendiente, y solo documenta una medición de VRAM de entrenamiento (13,63 GiB de pico en una RX 6800 XT con secuencia de 768 tokens).

## Requisitos de hardware

- Entrenamiento validado: AMD Radeon RX 6800 XT, 16 GB de VRAM, QLoRA, secuencia de 768 tokens, 13,63 GiB de pico.
- Inferencia con adaptador LoRA: requiere cargar el modelo base de 14B completo más el adaptador; en FP16 serían necesarios aproximadamente 28 GB de VRAM, por lo que no cabe en GPU de consumo sin cuantizar.
- Inferencia con GGUF Q4_K_M: el archivo aún no se ha publicado, por lo que el tamaño exacto no está disponible; una cuantización Q4 de un modelo de 14B suele rondar los 8-9 GB, lo que permitiría ejecución parcial o total en GPU con 12-16 GB.
- Contexto recomendado por el autor: 4.096 tokens como punto de partida, aumentando solo tras comprobar el consumo de memoria.
- Despliegue: LM Studio y llama.cpp para el GGUF; el adaptador PEFT puede cargarse con las librerías de Hugging Face (transformers + peft).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek R1 14B Security (este) | 14B + LoRA | No especificado (recomendado 4.096) | Seguridad iOS, CVE, pentesting | MIT | Adaptador y GGUF pendientes de publicación |
| DeepSeek-R1-Distill-Qwen-14B (base) | 14B | No disponible en la información proporcionada | Razonamiento general | MIT (según modelo base) | Público en Hugging Face |
| Alternativas de seguridad de 7-14B ajustadas con LoRA | Variable | Variable | Variable | Variable | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de modelos comparables específicos de seguridad en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Proyecto en construcción: el adaptador entrenado, el GGUF y la evaluación final figuran como pendientes; las descargas pueden no estar disponibles.
- Conocimiento congelado: no puede enumerar CVE actuales desde memoria; requiere avisos fechados o un sistema de recuperación externo.
- Tool calling y flujos autónomos no validados por el autor.
- Entrenado y evaluado solo en inglés; sin soporte multilingüe declarado.
- Secuencia de entrenamiento de 768 tokens: los flujos con contexto largo no han sido evaluados.
- Riesgo de alucinación en detalles de versiones o CVE si no se aportan fuentes; el modelo está orientado a citar, pero no hay evaluación publicada que lo confirme.
- Sesgos potenciales derivados de las fuentes (avisos de Apple, CISA KEV y un dataset comunitario de pentesting), no analizados.
- Licencia MIT, que permite uso comercial, pero sin garantías del autor sobre exactitud en producción.
- Un solo me gusta y cero descargas en el momento de la consulta: sin validación comunitaria.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Volpidash/deepseek-r1-14b-security
- Perfil del autor: https://huggingface.co/Volpidash
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B
- Recomendaciones de uso del modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-14B#usage-recommendations
- Dataset de pentesting: https://huggingface.co/datasets/theelderemo/pentesting-explanations
- Avisos de seguridad de Apple: https://support.apple.com/en-us/100100
- Catálogo CISA KEV: https://github.com/cisagov/kev-data
- Guía de descarga de LM Studio: https://lmstudio.ai/docs/app/basics/download-model
