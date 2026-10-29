# yamalies/ingot-work

## Resumen

`yamalies/ingot-work` es un modelo de lenguaje de tipo conversacional publicado en Hugging Face por el usuario yamalies (Yamal Chrischan). Según los pesos en safetensors del repositorio, cuenta con 26.895.998.464 parámetros (aproximadamente 26,9 mil millones), lo que lo sitúa en la franja de modelos densos de tamaño medio-grando habituales para despliegue en una o varias GPU.

Las etiquetas del repositorio (`gguf`, `distillation`, `qwen3.8-27b`, `sn97`, `endpoints_compatible`, `conversational`) apuntan a un modelo derivado por destilación de una base de la familia Qwen de ~27B, distribuido también en formato GGUF para inferencia local. Sin embargo, la información pública disponible no incluye model card detallada: no se especifican arquitectura exacta, longitud de contexto, composición del dataset de entrenamiento, idiomas ni resultados de evaluación.

Su relevancia actual es limitada pero concreta: interesa a quien quiera evaluar un destilado de Qwen en formato GGUF y comparar su comportamiento con el modelo profesor. El repositorio es de acceso restringido (gated), la licencia es "other" y acumula 0 descargas y 0 likes, por lo que no existe validación comunitaria ni evidencia pública de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta `qwen3.8-27b` sugiere una base transformer de la familia Qwen, sin confirmar |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF (etiqueta `gguf`); niveles concretos no disponibles. El repositorio de 381 GB sugiere múltiples variantes cuantizadas |
| Idiomas soportados | No disponible |
| Licencia | `other` (licencia personalizada); acceso sujeto a aceptación de condiciones en Hugging Face |
| Formato de pesos | safetensors (origen del recuento de parámetros) y GGUF |
| Tamaño del repositorio | 381,0 GB |
| Acceso | Restringido (gated) |
| Pipeline de Hugging Face | No disponible |
| Etiquetas relevantes | `distillation`, `conversational`, `endpoints_compatible`, `sn97`, `ingot` |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-28 |
| Última actualización | 2026-10-29 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo (tipo de atención, número de capas, uso de MoE, atención lineal u otras innovaciones). El recuento de parámetros procede de los safetensors del repositorio, lo que confirma que se distribuyen pesos completos además de las variantes GGUF. La etiqueta `qwen3.8-27b` es el único indicio sobre la genealogía del modelo y sugiere que se trata de un derivado de una base Qwen de aproximadamente 27B parámetros, pero no se explicita si es un fine-tuning, una destilación o una mezcla.

La etiqueta `distillation` indica que el entrenamiento habría empleado destilación de conocimiento, presumiblemente desde un modelo profesor de mayor tamaño hacia esta base de ~27B; no se detalla el número de tokens, la composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por preferencias. La etiqueta `sn97` aparece sin explicación en la información disponible y no se puede confirmar a qué hace referencia. Tampoco hay información sobre la tokenizador, la ventana de contexto nativa ni técnicas de decodificación especulativa.

## Capacidades

- Generación de texto conversacional: la etiqueta `conversational` indica que el modelo está ajustado para diálogo multi-turno.
- Distribución en GGUF: permite inferencia local con llama.cpp y derivados (Ollama, LM Studio) sin necesidad de GPU de datacenter.
- Compatibilidad con endpoints: la etiqueta `endpoints_compatible` sugiere compatibilidad con la API de Hugging Face Inference Endpoints o con una interfaz tipo Messages.
- Destilación: se espera que reproduzca parte de las capacidades del modelo profesor, aunque no se especifica cuáles ni con qué fidelidad.
- Tool calling / function calling: no disponible (no confirmado en la información proporcionada).
- Razonamiento multi-paso y uso como agente: no disponible.
- Capacidades multilingües: no disponible; no se declara ninguna lista de idiomas.
- Visión, audio o modalidades adicionales: no disponible.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

- Evaluación de técnicas de destilación: el modelo sirve como sujeto de prueba para medir cuánto del comportamiento de una base Qwen de ~27B se conserva tras un proceso de destilación, comparando respuestas cualitativas frente al profesor en un conjunto fijo de prompts.
- Prototipado de asistentes conversacionales en local: al distribuirse en GGUF, permite levantar un chat multi-turno con llama.cpp en una estación de trabajo con una sola GPU de 24 GB (usando cuantización de 4 bits) sin depender de servicios en la nube.
- Base para fine-tuning de dominio: los pesos en safetensors permiten aplicar LoRA o ajuste completo sobre un corpus propio (legal, sanitario, soporte interno) partiendo de un modelo de 26,9B, un tamaño manejable con técnicas de ajuste parametralmente eficiente.
- Experimentos de cuantización: el repositorio de 381 GB sugiere la presencia de varias cuantizaciones GGUF; resulta útil para estudiar la degradación de calidad entre niveles (Q2, Q4, Q8) sobre un mismo modelo base.
- Despliegue en infraestructura propia con requisitos de privacidad: al poder ejecutarse on-premise con llama.cpp o vLLM, encaja en escenarios donde los datos no pueden salir de la organización, siempre que la licencia "other" lo permita tras su revisión.
- Integración en pipelines compatibles con endpoints: la etiqueta `endpoints_compatible` facilita probar el modelo como backend de una aplicación existente que ya consuma una API de chat con formato estándar.
- Docencia e investigación sobre modelos destilados: útil en cursos o laboratorios donde se necesite un modelo de ~27B con licencia revisable y pesos abiertos tras aceptar las condiciones de acceso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en FP16/BF16: en torno a 54 GB solo para pesos (26,9 B × 2 bytes), más caché KV y overhead, lo que sitúa el requisito práctico en 60-65 GB.
- VRAM estimada en 8 bits: ~27 GB de pesos, con necesidad de 32-40 GB reales según longitud de contexto.
- VRAM estimada en 4 bits (Q4_K_M): ~15-17 GB de pesos, con 18-22 GB reales para contextos moderados.
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB o H200. No cabe en una RTX 4090 (24 GB) en precisión completa.
- GPU para 8 bits: A100 40 GB o dos RTX 4090/3090 en paralelo.
- GPU de consumo: sí cabe en 4 bits en RTX 4090 (24 GB), RTX 3090 (24 GB) y, con margen ajustado, en RTX 4080/5080 de 16 GB. En Apple Silicon requiere del orden de 24-32 GB de memoria unificada.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors (previa aceptación del acceso gated); Hugging Face Inference Endpoints dado el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formatos | Acceso |
|---|---|---|---|---|---|
| yamalies/ingot-work | ~26,9 B | No disponible | `other` | safetensors, GGUF | Gated |
| Qwen3-32B | 32,8 B | 32.768 tokens nativos (131.072 con YaRN) | Apache 2.0 | safetensors, GGUF (comunidad) | Abierto |
| Mistral Small 3.1 24B | 24 B | 128.000 tokens | Apache 2.0 | safetensors, GGUF (comunidad) | Abierto |

Nota: los datos de Qwen3-32B y Mistral Small 3.1 24B proceden de su documentación pública y no de la información proporcionada en esta búsqueda; conviene verificarlos antes de citarlos. Para `ingot-work` no hay datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Acceso restringido: es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede bloquear pipelines automatizados de CI/CD.
- Licencia "other": no es una licencia estándar tipo Apache 2.0 o MIT; el uso comercial exige revisar el texto completo de la licencia, que no está resumido en la información disponible.
- Ausencia de model card detallada: no se documentan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que dificulta la reproducibilidad y la evaluación de riesgos.
- Sin benchmarks públicos: no hay evidencia verificable de calidad en MMLU, HumanEval, GSM8K ni tareas conversacionales.
- Sin validación comunitaria: 0 descargas y 0 likes en un repositorio creado recientemente implican ausencia de informes independientes sobre su comportamiento real.
- Idiomas desconocidos: al no declararse la cobertura lingüística, no hay garantía de calidad en castellano; es probable un sesgo hacia el inglés si la base Qwen subyacente se entrenó mayoritariamente en ese idioma.
- Riesgo de alucinación: inherente a los modelos de ~27B sin datos de evaluación específicos; la destilación puede amplificar errores del profesor o producir colapso de diversidad en las respuestas.
- Sesgos heredados: cualquier sesgo presente en el modelo profesor y en el corpus de destilación se transfiere al estudiante, sin que se documenten mitigaciones.
- Coste de almacenamiento: 381 GB de repositorio complican la descarga y el versionado en entornos con espacio limitado.
- Nombre poco descriptivo: "ingot-work" sugiere un checkpoint de trabajo o intermedio, no necesariamente una versión final estabilizada.
- Tool calling y comportamiento agéntico no confirmados: no deben asumirse en diseño de producción sin pruebas previas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yamalies/ingot-work
- Perfil del autor: https://huggingface.co/yamalies

Los resultados de búsqueda adicionales corresponden a proyectos homónimos sin relación con este modelo (la IDE "Ingot" de yaghobieh, el panel de captura para Wayland de Yiin y un artículo sobre predicción de rendimiento en lingotes metálicos); no se incluyen como referencias del modelo. No se han encontrado papers, blogs técnicos ni demos asociados a `yamalies/ingot-work`.
