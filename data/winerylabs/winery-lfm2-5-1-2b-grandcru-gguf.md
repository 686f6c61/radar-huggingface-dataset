# WineryLabs/Winery-LFM2.5-1.2B-GrandCru-GGUF

## Resumen

Winery LFM2.5 1.2B Grand Cru es un merge de pesos publicado por WineryLabs sobre el modelo LiquidAI LFM2.5-1.2B-Instruct. Se trata de una fusión tipo "Breadcrumbs" (densidad 0,85) que combina cinco fine-tunes de la familia LFM2.5-1.2B sobre el modelo Instruct de Liquid AI, con las normas (norm layers) promediadas de forma lineal. El resultado es un modelo de 1.170.340.608 parámetros (1,17B) distribuido en formato GGUF cuantizado, pensado para inferencia local en CPU y dispositivos de borde.

El modelo hereda la arquitectura híbrida de convolución y atención de LFM2.5, el diseño optimizado por Liquid AI para ejecución en dispositivos de borde. Esto lo convierte en uno de los modelos más rápidos de su clase en CPU de teléfono móvil, según indica el propio autor en la model card. La distribución en GGUF con cuantización Q8_0 ocupa aproximadamente 1,25 GB, lo que permite ejecutarlo en hardware muy modesto.

Su relevancia radica en que agrupa en un único artefacto las capacidades de varios fine-tunes especializados (unaligned/abliterated, destilación de GLM4.7, cadenas de razonamiento estilo Claude y variantes "MEGABRAIN"), ofreciendo un modelo pequeño, rápido y de licencia abierta para prototipado, agentes locales y despliegue en el borde. Las puntuaciones publicadas por el autor, obtenidas con su propio arnés local, lo sitúan ligeramente por encima de cada donante individual, aunque con muestras pequeñas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido conv/attention (familia LFM2.5 de Liquid AI) |
| Parametros totales | 1.170.340.608 (1,17B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (confirmado); otras cuantizaciones GGUF no especificadas |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base subyacente es LiquidAI/LFM2.5-1.2B, que emplea un diseno hibrido de convolucion y atencion optimizado por Liquid AI para despliegue en dispositivos de borde. Sobre esa base, WineryLabs ha aplicado una fusion de pesos tipo "Breadcrumbs" con densidad 0,85 sobre el modelo LFM2.5-1.2B-Instruct, promediando linealmente las capas de normalizacion. No se trata de un entrenamiento adicional, sino de una combinacion de pesos ya entrenados.

La receta de merge combina cinco donantes con los siguientes pesos: huihui-ai/Huihui-LFM2.5-1.2B-Instruct-abliterated (1,00), LiquidAI/LFM2.5-1.2B-Base (0,80), yasserrmd/GLM4.7-Distill-LFM2.5-1.2B (0,55), DavidAU/LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning (0,50) y DavidAU/LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM (0,45). La herramienta declarada para la fusion es el compilador de fusiones "Winery". No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO en los modelos donantes, mas alla de lo que declaran los propios repositorios originales.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, tag conversational).
- Razonamiento en varios pasos, heredado de los donantes con cadenas de razonamiento estilo Claude y variantes "Thinking".
- Resolucion de problemas matematicos basicos, con un rendimiento destacado en GSM8K segun el propio arnes del autor.
- Capacidad reforzada de seguir instrucciones, al partir del modelo Instruct de Liquid AI.
- Menor tasa de rechazo que la version stock, al incluir el donante abliterated (huihui-ai) en la mezcla.
- Formato GGUF compatible con llama.cpp, Jan, LM Studio y la aplicacion Winery.
- No hay datos disponibles sobre soporte de tool calling, function calling, capacidades de agente multi-paso, vision, audio ni capacidades multilingues especificas.

## Casos de uso

- Asistentes conversacionales locales en movil: con 1,17B de parametros y arquitectura optimizada para CPU de telefono, el modelo puede gestionar dialogos multi-turno directamente en el dispositivo sin conexion a la nube.
- Prototipado rapido de agentes de borde: su tamano reducido y su formato GGUF permiten iterar en portatiles sin GPU dedicada antes de escalar a modelos mayores.
- Generacion de texto con matices creativos o menos censurados: la inclusion del donante abliterated reduce los rechazos, util para escritura creativa o generacion de contenido con menor filtrado.
- Tareas de razonamiento matematico ligero: con un resultado de 78,3 en GSM8K en el arnes del autor, puede emplearse para resolver problemas aritmeticos sencillos en entornos educativos o de calculo rapido.
- Clasificacion y resumen de texto en el borde: para pipeline de preprocesado donde se necesita un modelo pequeno y de baja latencia en lugar de enviar datos a la nube.
- Aplicaciones embebidas o IoT con restricciones severas de memoria: al ocupar ~1,25 GB en Q8_0 y poder cuantizarse mas agresivamente, encaja en dispositivos de gama baja y sistemas empotrados.
- Experimentacion en investigacion sobre tecnicas de merge: sirve como caso de estudio reproducible de la fusion Breadcrumbs con pesos y densidad documentados.

## Benchmarks y rendimiento

Unicamente se dispone de los resultados publicados por el propio autor, obtenidos con su arnes local 0-shot chat (MMLU con 200 preguntas, ARC-Challenge con 150 y GSM8K con 60). El autor advierte expresamente que son cifras de muestra pequena y deben interpretarse solo como orientativas.

| Modelo | MMLU | ARC-C | GSM8K | Media |
|---|---|---|---|---|
| Winery LFM2.5-1.2B Grand Cru (este) | 40,0 | 62,0 | 78,3 | 60,1 |
| Mejor donante (Huihui abliterated) | no disponible | no disponible | no disponible | 57,5 |
| LiquidAI/LFM2.5-1.2B-Base | no disponible | no disponible | no disponible | 56,3 |
| LiquidAI/LFM2.5-1.2B-Instruct (stock) | no disponible | no disponible | no disponible | 52,1 |

## Requisitos de hardware

- Q8_0 (formato publicado): aproximadamente 1,25 GB de peso, segun la model card.
- FP16 (referencia): alrededor de 2,3 GB para 1,17B parametros (estimacion por tamano de parametros, no declarada por el autor).
- Cuantizaciones de 4 bits (Q4_K_M o similar): en el orden de 0,7 GB (estimacion, no confirmada en la informacion disponible).
- Cabe sin problema en GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso en GPUs integradas y CPU dedicada.
- Disenado explicitamente para ejecucion en CPU de telefonos moviles, segun la model card.
- Opciones de despliegue: llama.cpp (builds con soporte LFM2), Jan, LM Studio y la aplicacion Winery. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. El autor solo indica que es "uno de los modelos mas rapidos de su clase en CPU de telefono", sin cifras concretas.

## Comparativa con modelos similares

Comparativa basada unicamente en la informacion proporcionada por el autor, con las medias del arnes local:

| Modelo | Parametros | Contexto | Media (arnes del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Winery LFM2.5-1.2B Grand Cru | 1,17B | no disponible | 60,1 | LFM Open License v1.0 | GGUF en HuggingFace |
| Huihui-LFM2.5-1.2B-Instruct-abliterated | ~1,17B | no disponible | 57,5 | no disponible | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Base | ~1,17B | no disponible | 56,3 | LFM Open License v1.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct (stock) | ~1,17B | no disponible | 52,1 | LFM Open License v1.0 | HuggingFace |

No se dispone de datos comparativos con modelos de otros fabricantes (Qwen, Llama, Mistral) de tamano similar en la informacion proporcionada.

## Limitaciones y advertencias

- Los benchmarks proceden del arnes propio del autor con muestras pequenas (200, 150 y 60 preguntas), por lo que las cifras son direccionales y no comparables directamente con evaluaciones estandar completas.
- Uno de los donantes es abliterated, lo que implica que el modelo rechaza menos peticiones que la version stock; esto puede derivar en respuestas inapropiadas o sin filtros de seguridad en segun que contextos.
- Es un merge de pesos, no un modelo entrenado: no se ha realizado alineacion adicional sobre la mezcla, por lo que puede heredar sesgos e inconsistencias de los donantes.
- Riesgo de alucinacion inherente a un modelo de 1,2B parametros; no se han publicado metricas de fidelidad o veracidad.
- No se ha publicado informacion sobre idiomas soportados ni sobre el comportamiento mas alla del ingles en los benchmarks.
- La licencia es la LFM Open License v1.0, heredada de Liquid AI; es responsabilidad del usuario revisar sus condiciones para uso comercial, ya que no es una licencia permisiva estandar (MIT, Apache).
- No hay informacion sobre la longitud de contexto efectiva, lo que limita la planificacion de despliegues con ventanas largas.
- Al no declararse tool calling ni soporte de agentes, no debe asumirse su uso fiable en pipelines que requieran function calling.
- La fecha de creacion del repositorio que figura en la ficha (2026-10-03) es posterior a la fecha de este analisis; se reproduce tal cual aparece en los metadatos.

## Enlaces

- HuggingFace (modelo): https://huggingface.co/WineryLabs/Winery-LFM2.5-1.2B-GrandCru-GGUF
- Organizacion WineryLabs en HuggingFace: https://huggingface.co/WineryLabs
- Modelo base LiquidAI/LFM2.5-1.2B-Instruct (licencia): https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Organizacion LiquidAI en HuggingFace: https://huggingface.co/LiquidAI
- Blog de Liquid AI sobre LFM2.5: https://www.liquid.ai/blog/introducing-lfm2-5-the-next-generation-of-on-device-ai
- Cobertura externa de LFM2.5: https://www.brocker.org/liquid-ai-lfm2-5-on-device-ai-models
- Herramienta Winery: https://zo.pub/zandy/winery
- Donante huihui-ai/Huihui-LFM2.5-1.2B-Instruct-abliterated: https://huggingface.co/huihui-ai/Huihui-LFM2.5-1.2B-Instruct-abliterated
- Donante yasserrmd/GLM4.7-Distill-LFM2.5-1.2B: https://huggingface.co/yasserrmd/GLM4.7-Distill-LFM2.5-1.2B
- Donante DavidAU/LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning: https://huggingface.co/DavidAU/LFM2.5-1.2B-Instruct-Thinking-Claude-High-Reasoning
- Donante DavidAU/LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM: https://huggingface.co/DavidAU/LFM2.5-1.2B-MEGABRAIN-Thinking-Claude-Polaris-Deepseek-GLM
