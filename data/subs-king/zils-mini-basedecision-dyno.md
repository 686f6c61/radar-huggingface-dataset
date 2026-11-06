# subs-king/zils-mini-basedecision-dyno

## Resumen

Zils d3-mini soup body: BaseDecision-Dyno es un paquete de pesos derivado de onlyaady/BaseDecision-Dyno, redistribuido por el usuario subs-king para la subred Zils (Bittensor SN127), en el pool `d3-mini`. No se trata de un modelo entrenado desde cero, sino de una recomposición: el repositorio original almacena una LoRA sin fusionar y aquí se fusiona en los pesos base con la fórmula estándar `W = base + (lora_alpha / r) * B @ A`, con `lora_alpha=32` y `r=16`, calculada en fp32 y almacenada en bf16.

El modelo cuenta con 4.539.265.536 parámetros en formato safetensors (aproximadamente 4,5 mil millones) y un repositorio de 9,1 GB. La model card indica que el autor original no incluye torre de visión, por lo que este paquete incorpora la torre de visión de Qwen/Qwen3.5-4B, sin modificar, para cumplir con el diseño de cuerpo exigido por Zils. La cabeza `readout` del modelo fuente no se incluye.

Su relevancia es acotada y muy específica: sirve como cuerpo base ("soup body") para participantes del pool `d3-mini` de la subred Zils, no como modelo de propósito general. La información pública es mínima (cero descargas, cero likes, sin pipeline declarado, sin idiomas declarados y sin benchmarks), por lo que muchos datos técnicos deben marcarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de onlyaady/BaseDecision-Dyno); incluye torre de visión de Qwen/Qwen3.5-4B |
| Parámetros totales | 4.539.265.536 (4,5 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de onlyaady/BaseDecision-Dyno, un transformer del que no se documentan en la información disponible ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF o DPO. El repositorio de origen almacena una adaptación LoRA sin fusionar; este paquete aplica la fusión estándar con `lora_alpha=32` y rango `r=16`, en precisión fp32 para el cálculo y bf16 para el almacenamiento. El resto de tensores de lenguaje se mantienen sin cambios respecto al origen.

La innovación técnica destacable no está en el entrenamiento sino en el empaquetado: se añade la torre de visión de Qwen/Qwen3.5-4B (revisión `851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a`) sin modificar, y se omite la cabeza `readout` del modelo fuente. Esta composición responde al layout de cuerpo exigido por la subred Zils, no a una decisión de diseño del modelo original. No se documentan técnicas como decodificación especulativa, atención lineal ni modos de razonamiento explícito.

## Capacidades

- Generación de texto y modelado de lenguaje, heredados de los pesos de BaseDecision-Dyno (sin detalle publicado de capacidades específicas).
- Procesamiento de imagen potencial a través de la torre de visión de Qwen3.5-4B incluida, aunque el autor no documenta el pipeline de fusión visión-lenguaje ni su calidad.
- Orientación a toma de decisiones ("decision-model" según los tags del repositorio), sin especificación pública del formato de decisión ni del esquema de salida.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Cuerpo base para el pool `d3-mini` de la subred Zils (Bittensor SN127): el uso previsto es servir como "soup body" sobre el que los participantes de la subred construyen y comparan sus propios modelos; es el escenario para el que el autor empaqueta estos pesos.
- Reproducibilidad de experimentos de fusión LoRA: al publicarse la fórmula exacta (`lora_alpha=32`, `r=16`, cálculo en fp32, almacenamiento en bf16), sirve para verificar y replicar el proceso de merge sobre BaseDecision-Dyno en la revisión `3f6690611d8bdc20ac9c9c627ef8db4f254a0612`.
- Investigación sobre modelos de decisión: el tag `decision-model` sugiere su uso en experimentos de selección o clasificación de acciones, aunque sin documentación del esquema de salida el uso en producción requeriría validación previa.
- Experimentación multimodal con torre de visión Qwen3.5-4B: útil para estudiar la integración de un encoder visual ajeno sobre un cuerpo de lenguaje de 4,5 B, siempre que se implemente el conector visión-lenguaje, que no se documenta.
- Base para fine-tuning con LoRA en tareas de decisión: con 4,5 B de parámetros y licencia Apache 2.0, es viable ajustarlo en una sola GPU de 24 GB con cuantización, aunque el rendimiento resultante no está validado públicamente.
- Evaluación comparativa dentro de la subred: permite a los participantes de Zils medir sus propios adaptadores contra un cuerpo de referencia fusionado de forma determinista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 9 GB solo para pesos (4,5 B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 12-16 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: unos 4,5-5 GB de pesos; en 4 bits, unos 2,3-3 GB (estimación teórica; el autor no publica cuantizaciones).
- GPU recomendadas: A100 40/80 GB o H100 para despliegue en bf16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes para bf16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) con margen ajustado en bf16, y en GPUs de 8-12 GB si se cuantiza.
- Opciones de despliegue: vLLM, TGI, llama.cpp u Ollama son candidatos por formato, pero el autor no documenta compatibilidad ni proporciona GGUF; la presencia de torre de visión exige verificar el soporte multimodal del runtime elegido.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zils d3-mini soup body (este) | 4,5 B | no disponible | Apache 2.0 | Cuerpo fusionado para SN127; sin benchmarks; incluye torre de visión Qwen3.5-4B |
| onlyaady/BaseDecision-Dyno (origen) | no disponible | no disponible | no disponible en esta información | Almacena LoRA sin fusionar; sin cabeza de visión |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en esta información | no disponible en esta información | Fuente de la torre de visión incluida en este paquete |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- No es un modelo entrenado de forma independiente: es un reempaquetado con fusión LoRA; cualquier mérito o defecto de los pesos corresponde a los autores originales.
- Ausencia total de benchmarks, descargas y validación pública: cero descargas y cero likes en el momento de la consulta, sin evidencia de uso en producción.
- La torre de visión procede de Qwen3.5-4B y no está documentada su integración funcional con el cuerpo de lenguaje; no hay garantía de que el pipeline multimodal opere correctamente sin trabajo adicional.
- La cabeza `readout` del modelo fuente se omite, por lo que el formato de salida para tareas de decisión no está definido en este paquete.
- No se declaran idiomas soportados; el rendimiento multilingüe es desconocido.
- No se documenta la longitud de contexto, lo que impide planificar despliegues con ventanas largas.
- Riesgo de alucinación y sesgos: no evaluado ni documentado por el autor.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de pesos de terceros conviene verificar la licencia y condiciones del modelo base original y de la torre de visión de Qwen.
- La fecha de creación indicada (2026-11-04) es posterior a la de esta consulta según los metadatos disponibles; conviene verificar la integridad del repositorio antes de usarlo.

## Enlaces

- [Hugging Face: subs-king/zils-mini-basedecision-dyno](https://huggingface.co/subs-king/zils-mini-basedecision-dyno)
- [Modelo base: onlyaady/BaseDecision-Dyno](https://huggingface.co/onlyaady/BaseDecision-Dyno)
- [Torre de visión: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
