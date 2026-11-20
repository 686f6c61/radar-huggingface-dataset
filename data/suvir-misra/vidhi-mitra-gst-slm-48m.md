# Suvir-Misra/Vidhi-Mitra-GST-SLM-48M

## Resumen

Vidhi-Mitra GST SLM v1 es un modelo de lenguaje de pequeno tamano (SLM) de 48,5 millones de parametros desarrollado por Suvir-Misra y entrenado desde cero para el razonamiento sobre el Impuesto sobre Bienes y Servicios (GST) de la India y la jurisprudencia de tributacion indirecta. Se trata de un transformer causal de tipo Mini-Llama con normalizacion RMSNorm, FFN SwiGLU, embeddings posicionales rotatorios (RoPE) y embeddings ligados, con una ventana de contexto de 1.024 tokens y un tokenizador SentencePiece propio de 32.000 entradas.

El modelo aborda un problema muy concreto: ofrecer asistencia legal estructurada en formato IRAC (Issue, Rule, Analysis, Conclusion) sobre la CGST Act de 2017, la IGST Act, las condiciones del credito fiscal de entrada (ITC), los procedimientos de requerimiento y adjudicacion (secciones 73, 74 y 75), las devoluciones (seccion 54), las facultades de registro y detencion (secciones 67, 69 y 132) y los pronunciamientos anticipados. Su relevancia reside en el despliegue en entornos con recursos muy limitados: dispositivos moviles, sistemas embebidos, terminales de punto de venta legal y servidores solo con CPU.

El modelo se distribuye bajo licencia Apache 2.0, soporta ingles y hindi, y esta disenado explicitamente como herramienta de asistencia e investigacion, no como sustituto del asesoramiento legal profesional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal tipo Mini-Llama (RMSNorm, SwiGLU, RoPE, sin sesgo lineal, embeddings ligados) |
| Parametros totales | 48.507.392 (48,5M); 48.638.464 segun safetensors |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | FP32, FP16, BF16, GGUF (Q4_K_M, Q8_0) |
| Idiomas soportados | Ingles (en), hindi (hi) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers), GGUF |

Detalles adicionales de arquitectura: 10 capas, tamano oculto de 512, 8 cabezas de atencion (dimension por cabeza de 64), tamano intermedio FFN de 1.408 con activacion SwiGLU, vocabulario de 32.000 tokens mas 256 ranuras de seguridad byte-fallback, RoPE con theta de 10.000,0 y RMSNorm con epsilon de 1e-6.

## Arquitectura y entrenamiento

La arquitectura es un transformer causal denso de estilo Llama simplificado: 10 capas con atencion multi-cabeza de 8 cabezas, normalizacion RMSNorm previa a cada subcapa, feed-forward SwiGLU con dimension intermedia de 1.408 y embeddings de tokens compartidos entre la capa de entrada y la cabeza de salida (tied embeddings). No emplea sesgos lineales ni atencion lineal; la posicion se codifica mediante RoPE aplicado con la variante `rotate_half`.

El entrenamiento se realizo desde cero (inicializacion aleatoria) con un pipeline de cuatro etapas. Primero, un preentrenamiento sobre un corpus curado de la CGST Act central, las leyes GST estatales, la IGST Act, la UTGST Act, circulares y notificaciones del CBIC y sentencias del Tribunal Supremo de la India, los Tribunales Superiores y el CESTAT. Segundo, un ajuste supervisado (SFT) sobre consultas estatutarias estructuradas con cadenas de razonamiento `<think> ... </think>` y formulaciones legales IRAC estrictas. Tercero, un refuerzo con GRPO y ORPO evaluado mediante verificadores legales programaticos que premian las citas estatutarias y la coherencia logica y penalizan la repeticion y las alucinaciones normativas. Cuarto, un ensemble en el espacio de pesos (WiSE-FT) que interpola los checkpoints de SFT y de optimizacion de preferencias para conservar fluidez sin perder precision en las citas.

## Capacidades

- Generacion de texto especializada en derecho tributario indirecto indio (GST), con formato de razonamiento IRAC.
- Razonamiento estatutario estructurado con cadenas internas `<think>` para exponer el proceso de analisis.
- Identificacion de disposiciones legales concretas (secciones de la CGST/IGST Act y principios de clasificacion del CESTAT).
- Analisis de elegibilidad del credito fiscal de entrada (ITC) y de creditos bloqueados (secciones 16, 17(5) y 49).
- Distincion entre procedimientos de requerimiento y adjudicacion (secciones 73, 74 y 75) y analisis de notificaciones de requerimiento.
- Razonamiento sobre devoluciones, estructura de deber invertido y suministros con tipo cero (seccion 54).
- Cobertura de disposiciones de registro, incautacion y detencion (secciones 67, 69 y 132).
- Soporte bilingue limitado a ingles y hindi.
- No se documenta soporte de tool calling, function calling, capacidades de agente, vision ni audio.

## Casos de uso

- Asistencia en consultas de ITC: el modelo responde a preguntas sobre elegibilidad y creditos bloqueados citando las secciones 16, 17(5) y 49, util como primer filtro para equipos contables antes de la revision de un profesional.
- Generacion de borradores de respuesta a notificaciones de requerimiento (SCN): con prompts en formato `Query: ... Answer:` produce analisis IRAC que sirven de punto de partida para redactar respuestas sobre las secciones 73 y 74.
- Formacion y capacitacion interna: al ejecutarse en CPU y con un peso de aproximadamente 0,2 GB, puede desplegarse en terminales de formacion para practicar la clasificacion de supuestos de GST sin infraestructura de GPU.
- Punto de venta legal en dispositivos moviles o embebidos: su tamano de 48,5M de parametros y su contexto de 1.024 tokens permiten integrarlo en aplicaciones moviles o sistemas POS para consultas rapidas de tributacion indirecta en entornos sin conectividad.
- Preclasificacion de consultas fiscales: puede usarse como clasificador de primera linea que etiqueta consultas por seccion relevante (ITC, devoluciones, adjudicacion) antes de derivarlas a un sistema mayor o a un especialista humano.
- Investigacion academica sobre SLM legales: sirve como base reproducible (entrenamiento desde cero, pipeline GRPO/ORPO y WiSE-FT documentado) para experimentar con destilacion y alineacion en dominios regulados de bajo recurso.
- Soporte bilingue en hindi e ingles: atiende consultas en ambos idiomas para usuarios de habla hindi que operan con normativa GST redactada en ingles.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card, sobre benchmarks propios de control de calidad estatutaria en tributacion indirecta india:

| Benchmark | Resultado |
|---|---|
| Identificacion de disposiciones estatutarias | 88,4% |
| Analisis de elegibilidad y excepciones de ITC | 84,1% |
| Fundamentacion de notificaciones de penalizacion/adjudicacion (sec. 73 vs 74) | 86,7% |
| Tasa de alucinacion zero-shot en disposiciones fiscales estandar | < 4,2% |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de referencia en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,1 GB en FP16/BF16 y alrededor de 0,2 GB en FP32, dado el tamano de 48,5M de parametros.
- Cabe holgadamente en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) e incluso en GPUs integradas y en CPU.
- Despliegue en CPU-only viable: el modelo esta disenado explicitamente para servidores sin GPU, dispositivos moviles y sistemas embebidos.
- Opciones de despliegue: `transformers` (con `device_map="auto"`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles y GGUF mediante llama.cpp u Ollama (cuantizaciones Q4_K_M y Q8_0).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la informacion proporcionada. Como referencia estructural, se comparan alternativas genericas de la misma categoria (SLM muy compactos):

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vidhi-Mitra GST SLM v1 | 48,5M | 1.024 | Apache 2.0 | GST indio, IRAC |
| SmolLM-135M | 135M | 2.048 | Apache 2.0 | Proposito general |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | Proposito general multilingue |
| TinyLlama-1.1B | 1,1B | 2.048 | Apache 2.0 | Proposito general |

Los datos de contexto y parametros de los modelos alternativos corresponden a sus especificaciones publicas habituales; no se dispone de comparaciones de rendimiento con Vidhi-Mitra en la informacion disponible.

## Limitaciones y advertencias

- Ventana de contexto muy reducida (1.024 tokens), insuficiente para documentos legales completos o conversaciones multi-turno largas.
- Modelo de 48,5M de parametros: capacidad de razonamiento general muy limitada fuera del dominio GST; no debe usarse como modelo de proposito general.
- Riesgo de alucinacion en citas y numeracion de secciones; el autor declara una tasa inferior al 4,2% en disposiciones estandar, pero requiere verificacion humana obligatoria.
- No constituye asesoramiento legal ni certificacion de contador publico; el propio autor exige revision contra notificaciones oficiales del CBIC y sentencias vigentes antes de presentar recursos, respuestas a SCN o declaraciones anuales.
- Cobertura linguistica limitada a ingles y hindi; no se documenta soporte de otros idiomas oficiales de la India.
- Entrenado sobre normativa vigente en la fecha de creacion (noviembre de 2026 segun metadatos); puede quedar desactualizado ante reformas legislativas o nuevas sentencias.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso en contextos regulados recae en el integrador.
- Sin descargas ni likes en Hugging Face en el momento de la consulta; ausencia de validacion independiente por la comunidad.
- No se documentan capacidades de tool calling, agentes ni multimodalidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suvir-Misra/Vidhi-Mitra-GST-SLM-48M
- No se han encontrado en la informacion proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
