# YuWang-Speech/RemixIT-TSE

## Resumen

RemixIT-TSE es un modelo de extracción de voz objetivo (*target speech extraction*, TSE) desarrollado por Yu Wang, Haixin Guan, Shuang Wei y Yanhua Long (repositorio de la organización YuWang-Speech). El modelo recibe una mezcla de audio y una locución de enrolamiento del hablante objetivo, y devuelve la señal estimada de ese hablante, eliminando el resto de voces y el ruido de fondo. No es un modelo de lenguaje: es un sistema de procesamiento de audio mono-canal a 16 kHz orientado a grabaciones conversacionales del mundo real.

Su contribución principal no es una arquitectura nueva, sino un marco de adaptación progresiva de datos sintéticos a reales (*synthetic-to-real*): parte de un modelo preentrenado con mezclas sintéticas (SDP), lo adapta con supervisión consciente del objetivo (TAA) y finalmente aplica una variante de RemixIT denominada RTA, con filtrado de pseudo-objetivos por calidad y supervisión únicamente sobre la componente objetivo. El repositorio publica dos checkpoints: la línea base SDP y el modelo final RemixIT-TSE.

Es relevante ahora porque se evalúa sobre los conjuntos de la SLT 2026 REAL-TSE Challenge, un benchmark de habla conversacional real, y porque el autor publica los pesos bajo Apache 2.0. No obstante, el código de inferencia y el pipeline completo de entrenamiento todavía no están disponibles: la model card indica que se liberarán tras la aceptación del artículo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (la model card no especifica la topología de red; se describe el marco de entrenamiento, no el backbone) |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de audio; no se documenta la ventana de procesamiento) |
| Tipos de cuantización | No disponible (solo se distribuyen checkpoints PyTorch; no se mencionan versiones cuantizadas) |
| Idiomas soportados | Inglés (`en`), según la model card y los conjuntos de evaluación del challenge |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoints de PyTorch (`library_name: pytorch`); no se indica safetensors ni GGUF. Tamaño del repo: 0,2 GB |
| Tarea | Target speech extraction / speech separation condicionada por hablante |
| Entrada | Mezcla de voz + locución de enrolamiento del hablante objetivo |
| Salida | Señal de voz estimada del hablante objetivo |
| Frecuencia de muestreo | 16 kHz |
| Checkpoints incluidos | `SDP` (línea base sintética) y `RemixIT-TSE` (modelo final adaptado) |
| Código de inferencia | No incluido todavía ("will be provided with the full code release") |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

La información publicada no detalla la arquitectura interna del extractor (no se especifica si es un transformer, un modelo convolucional tipo TasNet/ConvTasNet, un modelo de atención tipo SepFormer o un híbrido). Lo que sí se documenta es el procedimiento de entrenamiento en tres etapas: (1) *Synthetic-Data Pretraining* (SDP), que produce la línea base entrenada solo con mezclas sintéticas; (2) *Target-Aware Adaptation* (TAA), que introduce datos reales; y (3) *RemixIT-TSE Adaptation* (RTA), que continúa la adaptación sobre datos reales. El desplazamiento de dominio es por tanto progresivo: sintético puro, sintético más real, y real puro.

La innovación técnica declarada afecta a la señal de supervisión, no al backbone. RemixIT-TSE adapta el esquema RemixIT (autoentrenamiento con un modelo profesor que remezcla salidas) al problema TSE mediante dos modificaciones: filtrado de pseudo-objetivos consciente de la calidad, para conservar únicamente las estimaciones fiables del profesor, y supervisión únicamente sobre la componente objetivo, para no supervisar directamente la componente no objetivo, que es heterogénea y no está bien definida en grabaciones reales. No se especifican en la información disponible el volumen de datos de entrenamiento, la composición del dataset ni el uso de RLHF/DPO (no aplicables en este dominio).

## Capacidades

- Extracción de voz objetivo condicionada por hablante: separa la voz indicada por una locución de enrolamiento del resto de voces y del ruido.
- Funciona sobre grabaciones conversacionales reales, no solo sobre mezclas sintéticas (objetivo explícito del trabajo y de los conjuntos de evaluación REAL-TSE).
- Salida de audio mono a 16 kHz, directamente consumible por pipelines de ASR o de mejora de voz.
- Dos puntos de operación disponibles: SDP (referencia sintética) y RemixIT-TSE (adaptado a real), lo que permite reproducibilidad y comparación controlada.
- Robustez medida en métricas de calidad perceptual (DNSMOS OVRL y P808) además de las métricas de separación (TER, SIM, F1), lo que indica que el modelo no solo separa sino que preserva calidad perceptual.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: no es un modelo de lenguaje.
- No se documentan capacidades de visión, audio-texto, diarización ni detección de actividad de voz como salida explícita.

## Casos de uso

- **Preprocesado de ASR en reuniones y entrevistas**: se aplica el modelo con una muestra de voz del participante de interés para obtener su pista limpia antes de la transcripción, lo que reduce errores de reconocimiento cuando hay solapamiento de habla o ruido de sala.
- **Atención auditiva selectiva en audífonos y prótesis**: el enrolamiento del hablante conversacional permite filtrar la señal que llega al usuario en entornos concurridos; el modelo está específicamente adaptado a grabaciones reales, que es el dominio de este uso.
- **Limpieza de grabaciones de campo para periodismo y documentación**: recuperar la voz del entrevistado a partir de una grabación ruidosa con varias personas hablando, usando un fragmento de referencia del propio entrevistado.
- **Análisis forense y verificación de audio**: aislar la voz de un individuo concreto en una grabación multi-hablante antes de un análisis pericial o de comparación biométrica, teniendo en cuenta las advertencias legales y de privacidad.
- **Front-end para asistentes de voz y sistemas de dictado**: mejorar la relación señal-ruido de la voz del usuario antes del reconocimiento, empleando un enrolamiento previo para distinguirlo de otras voces del entorno.
- **Generación y curación de datasets de voz**: usar el modelo como herramienta de anonimización selectiva o de aislamiento de hablantes al construir corpus de habla limpia a partir de material real.
- **Evaluación de robustez de sistemas ASR**: emplear SDP y RemixIT-TSE como pares de referencia para medir cuánto degrada una señal real no adaptada frente a una adaptada, en un banco de pruebas reproducible.
- **Videoconferencia y grabación de clases**: extraer la pista del ponente a partir de un clip de enrolamiento cuando la captación es de sala y no hay micrófono individual.

## Benchmarks y rendimiento

Evaluación sobre los conjuntos del SLT 2026 REAL-TSE Challenge. TER: menor es mejor; SIM, OVRL, P808 y F1: mayor es mejor.

| Conjunto | Sistema | TER ↓ | SIM ↑ | OVRL ↑ | P808 ↑ | F1 ↑ |
|---|---|---|---|---|---|---|
| EVAL-1 | SDP | 0,726 | 0,485 | 2,049 | 2,923 | 0,824 |
| EVAL-1 | RemixIT-TSE | 0,680 | 0,533 | 2,173 | 3,088 | 0,837 |
| EVAL-2 | SDP | 0,763 | 0,335 | 1,850 | 2,710 | 0,804 |
| EVAL-2 | RemixIT-TSE | 0,713 | 0,408 | 2,040 | 2,978 | 0,837 |
| Combined | SDP | 0,748 | 0,395 | 1,929 | 2,790 | 0,812 |
| Combined | RemixIT-TSE | 0,700 | 0,458 | 2,093 | 3,022 | 0,837 |

Mejoras relativas declaradas por el autor sobre la línea base SDP en el conjunto no visto EVAL-2: 6,53 % en TER, 21,84 % en similitud de hablante (SIM), 9,89 % en DNSMOS-P808 y 4,10 % en F1 de actividad del objetivo. En OVRL, la mejora relativa en EVAL-2 es de aproximadamente 10,27 % (calculada a partir de 1,850 → 2,040). No se aportan comparaciones con otros sistemas del challenge ni con modelos externos.

## Requisitos de hardware

No se publican requisitos oficiales de hardware, VRAM, latencia ni throughput. Las indicaciones siguientes son estimaciones razonadas a partir del tamaño del repositorio (0,2 GB, es decir, pesos del orden de decenas de millones de parámetros) y de la naturaleza de la tarea (audio mono a 16 kHz de un solo canal); no deben tomarse como cifras verificadas.

- **VRAM estimada para inferencia**: previsiblemente por debajo de 2-4 GB en FP32 para lotes pequeños de utterances cortas; no confirmado por el autor.
- **GPU recomendadas**: cualquier GPU con 8 GB o más (RTX 3060/4060, RTX 4090) debería ser suficiente para inferencia por lotes; A100/H100 solo tendrían sentido para procesar grandes volúmenes o para reentrenamiento.
- **GPU de consumo**: sí, es esperable que quepa en tarjetas de consumo e incluso que la inferencia sea viable en CPU para fragmentos cortos, dado el tamaño del repo; sin datos oficiales de latencia.
- **Opciones de despliegue**: al ser un checkpoint PyTorch sin pipeline declarado, el despliegue requeriría cargar los pesos con PyTorch y escribir el wrapper de inferencia (mezcla + enrolamiento → señal estimada). No hay soporte declarado en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

No se han publicado en la información disponible comparaciones con otros sistemas del challenge ni con modelos externos de TSE. La model card solo compara el modelo final con su propia línea base SDP. Como referencia de categoría (misma tarea de extracción/selección de hablante), los alternatives habituales serían USEF-TSE, TSELM o modelos de separación condicionados por hablante como los derivados de SepFormer; no obstante, no se dispone de sus métricas en los conjuntos REAL-TSE dentro de la información proporcionada, por lo que la comparación numérica no es posible.

| Modelo | Tipo | Parámetros | Contexto | TER (Combined) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RemixIT-TSE | TSE condicionado por hablante | No disponible | No aplica | 0,700 | Apache 2.0 | Pesos en HF; código de inferencia pendiente |
| SDP (línea base del mismo trabajo) | TSE condicionado por hablante | No disponible | No aplica | 0,748 | Apache 2.0 | Pesos en HF |
| USEF-TSE | TSE condicionado por hablante | No disponible | No aplica | No disponible | No disponible | No evaluado aquí |
| TSELM | TSE condicionado por hablante | No disponible | No aplica | No disponible | No disponible | No evaluado aquí |

## Limitaciones y advertencias

- **Código de inferencia no publicado**: la model card indica que el código y las instrucciones de uso llegarán con la liberación completa; hoy solo hay checkpoints, lo que complica la reproducción exacta del preprocesado y del pipeline de evaluación.
- **Pipeline de entrenamiento retenido**: la liberación del pipeline completo está condicionada a la aceptación del artículo, lo que limita la reproducibilidad del marco SDP → TAA → RTA.
- **Idioma**: la model card etiqueta el modelo únicamente como inglés; no hay evidencia de comportamiento en castellano ni en otros idiomas, y el rendimiento en dominios acústicos distintos a los del challenge no está medido.
- **Calidad absoluta moderada**: los valores de DNSMOS OVRL rondan 2,0-2,2 sobre una escala de hasta 5, y el TER combinado es 0,700, lo que sugiere que persisten artefactos y errores de extracción apreciables en condiciones reales difíciles.
- **Dependencia del enrolamiento**: al ser una extracción condicionada por hablante, la calidad y duración de la locución de enrolamiento condicionan el resultado; no se documenta el comportamiento con enrolamientos ruidosos, muy cortos o con cambio de canal.
- **Riesgo de confusión de hablante**: en mezclas con voces de timbre similar o con solapamiento severo, el modelo puede filtrar parcialmente al hablante equivocado o atenuar al objetivo; no se han publicado análisis de errores por tipo de interferencia.
- **Alucinación en sentido estricto no aplica** (no genera texto), pero sí existe riesgo de artefactos de síntesis y de supresión excesiva de la señal objetivo.
- **Licencia**: Apache 2.0 permite uso comercial, pero el autor declara que los checkpoints están pensados para investigación y reproducibilidad; conviene revisar los términos del challenge y de los datos de evaluación antes de un despliegue productivo.
- **Privacidad y biometría**: la tarea implica identificar y aislar la voz de una persona concreta; su uso en vigilancia, verificación de identidad o análisis forense está sujeto a normativa de protección de datos (RGPD en la UE) y requiere base legal.
- **Sesgos**: no se ha publicado ninguna evaluación de sesgos por acento, género, edad o condición de habla; el entrenamiento con datos del challenge puede infrarrepresentar determinados perfiles.
- **Madurez**: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 27 de octubre de 2026; es un artefacto de investigación reciente y sin validación independiente.

## Enlaces

- HuggingFace: https://huggingface.co/YuWang-Speech/RemixIT-TSE
- Artículo (arXiv): https://arxiv.org/abs/2609.35118
- Repositorio GitHub: https://github.com/YuWang-Speech/RemixIT-TSE
- Demo de audio: https://htmlpreview.github.io/?https://github.com/YuWang-Speech/RemixIT-TSE/blob/main/index.html#audio-demo
- Challenge de referencia: SLT 2026 REAL-TSE Challenge (no se proporciona URL en la información disponible)
