# unidaikon/ScarletKc-2.0-exl3-SCP_2.85bpw

## Resumen

ScarletKc-2.0-exl3-SCP_2.85bpw es una cuantización de precisión mixta del modelo ScarletKc-2.0, publicada por el usuario unidaikon. El modelo base lo desarrolla el autor identificado como KC bajo la organización ScarletKc. Se trata de una conversión al formato EXL3 (ExLlamaV3) con un promedio de 2,85 bits por peso, diseñada específicamente para ejecutarse en GPU de 16 GB de VRAM manteniendo capacidades multimodales (image-text-to-text) y contexto largo.

El modelo tiene 6.406.493.568 parámetros totales según los safetensors publicados y el repositorio ocupa 12,8 GB. Según la model card, la arquitectura del modelo base combina atención lineal con mecanismos de tipo SSM (Gated DeltaNet) y atención completa, además de un torre de visión y un decodificador especulativo MTP (multi-token prediction). La cuantización aplica la técnica SCP (Self-Calibrated Precision) para asignar bits por capa según la sensibilidad KLD, protegiendo especialmente las capas recurrentes y las proyecciones de atención lineal.

La relevancia de esta ficha es práctica: demuestra que es posible servir un modelo multimodal con contexto de hasta 96K tokens en una GPU de consumo de 16 GB, con decodificación especulativa activa y una tasa de aceptación del 49%. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque la información pública sobre el modelo base es muy limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención lineal tipo Gated DeltaNet / SSM y atención completa, más torre de visión y cabeza MTP |
| Parámetros totales | 6.406.493.568 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | hasta 98.304 tokens (96K) en configuración probada con 16 GB VRAM |
| Tipos de cuantización | EXL3 con precisión mixta, media 2,85 bpw (rango 2,0–8,0 bpw según capa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (EXL3, librería exllamav3) |

## Arquitectura y entrenamiento

La model card describe el modelo base como una arquitectura híbrida que combina capas de atención lineal con mecanismos Gated DeltaNet (de tipo SSM) y capas de atención completa. Incluye además una torre de visión (pipeline image-text-to-text) y una cabeza MTP para decodificación especulativa nativa. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo base.

La innovación principal de esta publicación es la cuantización. Se generó con exllamav3 1.6.7 aplicando SCP (Self-Calibrated Precision): calibración autogenerada y asignación dinámica de bits por capa según la divergencia KLD. Las capas SSM mantienen sus parámetros recursivos y de compuerta en bf16/fp32 sin cuantizar, y sus proyecciones lineales tienen un mínimo de 3,5 bpw (media 3,60). La atención completa tiene un mínimo de 3,0 bpw (media 3,12), las MLP se asignan entre 2,0 y 4,0 bpw (media 2,58), la torre de visión se cuantiza a 8 bits (RMSE aproximado de 0,00001), la cabeza MTP a 4 bits, el lm_head a 4 bits y los embeddings se mantienen en bfloat16, con opción de streaming desde disco.

## Capacidades

- Generación de texto conversacional multi-turno, según el pipeline conversational declarado.
- Procesamiento de imagen y texto (image-text-to-text): incluye torre de visión cuantizada a 8 bits.
- Contexto largo: hasta 98.304 tokens en la configuración de referencia con 16 GB de VRAM.
- Decodificación especulativa mediante MTP nativo, con aceptación aproximada del 49% con 3 tokens de borrador.
- Razonamiento multi-paso y agentes: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se listan idiomas.
- Modo thinking: no disponible.

## Casos de uso

- Asistente conversacional multimodal en estación de trabajo: con 96K de contexto y visión activa, el modelo puede mantener conversaciones largas sobre documentos e imágenes en una única GPU de 16 GB, lo que lo hace adecuado para prototipos locales de asistentes que analizan capturas, diagramas o PDFs escaneados.
- Análisis de documentos extensos con imágenes intercaladas: la ventana de 98.304 tokens permite ingerir informes completos con figuras y hacer preguntas sobre ellos sin trocear el contenido, reduciendo la pérdida de contexto entre fragmentos.
- Inferencia local en GPU de consumo: al ocupar unos 15.195 MiB con caché KV en Q8, encaja en tarjetas como la RTX 5070 Ti de 16 GB, lo que habilita despliegues de investigación sin acceso a clústeres.
- Evaluación de cuantizaciones de precisión mixta: sirve como referencia práctica para estudiar el impacto de SCP en modelos híbridos SSM/atención, comparando la calidad frente al modelo base en bf16.
- Servicio con TabbyAPI: la configuración YAML incluida en la model card permite levantar un endpoint compatible con la API de OpenAI en minutos, útil para integrar el modelo en herramientas de desarrollo internas.
- Generación asistida con decodificación especulativa: la cabeza MTP a 4 bits permite acelerar la generación en entornos de baja latencia, adecuada para aplicaciones interactivas donde el tiempo por token es crítico.
- Experimentación con modelos multimodales pequeños: con 6.400 millones de parámetros, es viable para investigación académica con presupuesto de hardware limitado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son de despliegue:

| Métrica | Valor medido |
|---|---|
| VRAM ocupada (RTX 5070 Ti 16 GB, TabbyAPI) | ~15.195 MiB / 16.303 MiB |
| Contexto máximo estable | 98.304 tokens |
| Caché KV | Q8 |
| Tasa de aceptación MTP (draft_num_tokens: 3) | ~49% |
| Precisión media de pesos | 2,8513 bpw |
| Tamaño del modelo cuantizado | ~11,93 GiB |

## Requisitos de hardware

- VRAM estimada: unos 15,2 GB con contexto de 96K, caché KV en Q8, MTP y visión activos; el autor reserva aproximadamente 1,1 GiB de margen.
- GPU recomendada según la model card: RTX 5070 Ti de 16 GB (entorno de referencia).
- GPU compatibles: cualquier GPU con 16 GB o más de VRAM; con menos VRAM habría que reducir contexto o desactivar visión/MTP. No se han publicado pruebas en A100, H100 o RTX 4090.
- Cabe en GPU de consumo de 16 GB (RTX 5070 Ti, RTX 4080/4090 de 16 GB o más, según disponibilidad de la tarjeta).
- Despliegue: ExLlamaV3 mediante TabbyAPI, con configuración YAML proporcionada. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI (el formato EXL3 es específico de ExLlamaV3).
- Throughput y latencia: no disponibles; solo se publica la tasa de aceptación MTP del 49%.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| ScarletKc-2.0-exl3-SCP_2.85bpw | 6,41B | 98.304 tokens (probado) | EXL3 2,85 bpw media | Apache 2.0 | safetensors EXL3 |
| ScarletKc-2.0 (base) | no disponible | no disponible | bf16 (presumible) | Apache 2.0 (según este repo) | safetensors |
| turboderp/Qwen3.8-27B-exl3 | 27B (según nombre) | no disponible | EXL3 con SCP | no disponible | safetensors EXL3 |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo base tiene muy poca documentación pública: no se conocen datos de entrenamiento, idiomas ni evaluaciones de calidad.
- La cuantización a 2,85 bpw media, con MLP a 2,58 bpw, puede degradar la calidad frente al modelo en bf16; no se han publicado comparativas de perplejidad o KLD frente al original.
- La tasa de aceptación MTP del 49% es una medición puntual en un hardware concreto; puede variar con otra GPU, contexto o tipo de prompt.
- El contexto de 96K solo está verificado con caché KV en Q8 y batch size 1; con lotes mayores o caché FP16 no cabrá en 16 GB.
- Riesgo de alucinación: no evaluado en la información disponible.
- Sesgos: no documentados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base ScarletKc-2.0 de forma independiente, ya que este repositorio solo declara la suya.
- El formato EXL3 limita el despliegue a ExLlamaV3/TabbyAPI; no es portable a otros motores de inferencia sin reconversión.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/unidaikon/ScarletKc-2.0-exl3-SCP_2.85bpw
- Modelo base: https://huggingface.co/ScarletKc/ScarletKc-2.0
- Referencia de cuantización SCP: https://huggingface.co/turboderp/Qwen3.8-27B-exl3
