# violetxi/qwen35-9b-wmrl-v4-m1-9b-judged

## Resumen

violetxi/qwen35-9b-wmrl-v4-m1-9b-judged es un checkpoint de investigacion de la linea v4 del estudio de internalizacion del mundo (world-internalization) del autor violetxi. Se trata de un fine-tuning completo del modelo Qwen/Qwen3.5-9B de Alibaba Cloud, entrenado sobre el corpus sintetico de despachos de abogados Calderwood & Harkness. El modelo cuenta con 9.653.104.368 parametros (~9,65B) y hereda la arquitectura hibrida del modelo base, que combina Gated Delta Networks y Gated Attention en un patron de 8 bloques repetidos.

El checkpoint corresponde a la condicion experimental `m1-9b-judged` y se ha integrado de nuevo en el layout compuesto del hub mediante un proceso de injerto (graft) que reemplazo 427 componentes. El modelo es servible directamente con vLLM gracias a la arquitectura Qwen3_5ForConditionalGeneration. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Este modelo es relevante en el contexto actual porque explora como los modelos de lenguaje internalizan conocimiento del mundo a partir de corpus sinteticos especializados, un area de investigacion activa en la comunidad de IA open source. Al estar basado en Qwen3.5-9B, hereda capacidades multimodales y una ventana de contexto de 262K tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: Gated Delta Networks + Gated Attention (8× (3×DeltaNet→FFN→1×Attention→FFN)) |
| Parametros totales | 9.653.104.368 (~9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (heredada del modelo base Qwen3.5-9B) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (el modelo base Qwen3.5-9B es multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 38,6 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un modelo denso multimodal de Alibaba Cloud lanzado en febrero de 2026. Su arquitectura hibrida combina Gated Delta Networks y Gated Attention en un patron de 8 bloques repetidos (3×DeltaNet→FFN→1×Attention→FFN), lo que permite un equilibrio entre eficiencia computacional y capacidad de atencion. El modelo base incorpora un encoder de vision y soporte para MTP (multi-token prediction).

El fine-tuning se realizo de forma completa (full-finetune) sobre el corpus sintetico Calderwood & Harkness, un conjunto de datos que simula documentos y operaciones de un despacho de abogados. El entrenamiento forma parte de un estudio de internalizacion del mundo en su linea v4, con un pool semilla de aproximadamente 50.000 ejemplos "think-on". El checkpoint corresponde a la condicion `m1-9b-judged` y al guardado final del entrenamiento.

Tras el entrenamiento, los pesos se integraron de nuevo en el layout compuesto del hub mediante un proceso de injerto (graft) que reemplazo 427 componentes del modelo base, manteniendo la compatibilidad con la arquitectura Qwen3_5ForConditionalGeneration para su uso directo con vLLM.

## Capacidades

- Generacion de texto y razonamiento: hereda las capacidades del modelo base Qwen3.5-9B, incluyendo generacion de texto, razonamiento y comprension contextual.
- Capacidades multimodales: el modelo base incorpora un encoder de vision, por lo que el checkpoint hereda potencialmente capacidades de comprension de imagenes, aunque el fine-tuning se realizo sobre un corpus textual.
- Especializacion en dominio legal: el entrenamiento sobre el corpus sintetico de despachos de abogados sugiere una especializacion en terminologia, documentos y procesos legales.
- Soporte MTP (multi-token prediction): heredado del modelo base, permite prediccion de multiples tokens por paso.
- Inferencia con vLLM: el modelo esta preparado para servirse directamente con vLLM sin pasos adicionales de conversion.
- Tool calling y capacidades de agente: no documentadas especificamente para este checkpoint; dependen de las capacidades del modelo base.

## Casos de uso

- Analisis de documentos legales: el modelo puede procesar contratos, acuerdos y otros documentos legales gracias a su entrenamiento sobre el corpus de despachos de abogados, extrayendo clausulas relevantes y resumiendo contenido.
- Revision de contratos: su especializacion en terminologia legal permite identificar clausulas problematicas o inconsistentes en borradores de contratos.
- Asistencia legal interna: puede servir como asistente para equipos juridicos en la redaccion de memorandos, informes y correspondencia profesional.
- Extraccion de informacion de expedientes: con su ventana de contexto de 262K tokens, puede procesar expedientes extensos y extraer datos estructurados.
- Generacion de resumenes juridicos: adecuado para resumir sentencias, dictamenes y documentacion legal extensa.
- Investigacion juridica asistida: puede ayudar a localizar precedentes y argumentos relevantes dentro de corpus legales sinteticos o reales.
- Prototipado de aplicaciones legaltech: al ser un modelo open source bajo Apache 2.0, permite construir prototipos de aplicaciones legales sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta datos de evaluacion en MMLU, HumanEval, GSM8K ni
