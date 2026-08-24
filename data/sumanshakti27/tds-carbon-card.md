# SUMANSHAKTI27/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario SUMANSHAKTI27, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono correspondiente a una ejecución de entrenamiento (fine-tuning) realizada en el contexto del curso TDS GA8. La model card documenta exclusivamente las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante dicho entrenamiento, siguiendo la iniciativa Green AI de transparencia medioambiental.

El repositorio carece de pesos, arquitectura, pipeline o cualquier artefacto de modelo. Su única finalidad es servir como ficha de sostenibilidad para auditar el impacto ambiental de un proceso de entrenamiento concreto. Por tanto, no es un modelo utilizable para inferencia ni para ninguna tarea de procesamiento del lenguaje natural, visión u otra modalidad.

La relevancia de esta ficha radica en su contribución a la estandarización de la divulgación de emisiones en el ecosistema de Hugging Face, mediante el uso de metadatos `co2_eq_emissions` y la herramienta CodeCarbon. No obstante, para un desarrollador que busque un modelo funcional, este repositorio no ofrece ningún recurso aprovechable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (sin pesos) |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura, ya que el repositorio no contiene un modelo. Los únicos datos de entrenamiento disponibles son los relativos al consumo energético y las emisiones: se realizó un fine-tuning con 5 GPUs NVIDIA RTX 4090 en la región europe-west4, con un total de 106,9 horas de GPU (considerando un PUE de 1,41), un consumo energético de 339,1402 kWh y unas emisiones de 67,828 kg de CO₂ equivalente, calculadas con la herramienta CodeCarbon. No se indica el dataset utilizado, el número de tokens, ni el tipo de modelo base sobre el que se aplicó el fine-tuning.

## Capacidades

No se documenta ninguna capacidad funcional, ya que no existe un modelo subyacente. Este repositorio no ofrece generación de texto, razonamiento, código, visión ni ninguna otra habilidad propia de un sistema de IA.

## Casos de uso

No aplica. Al no existir un modelo, no hay casos de uso prácticos de inferencia. El único uso posible es el de referencia para auditorías de sostenibilidad de entrenamientos similares, pero no como herramienta de IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe modelo que evaluar.

## Requisitos de hardware

- El entrenamiento documentado utilizó 5 GPUs NVIDIA RTX 4090.
- No se especifican requisitos de hardware para inferencia, al no existir modelo.
- No se dispone de datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. No existe un modelo comparable, dado que este repositorio no contiene un sistema de IA.

## Limitaciones y advertencias

- Este repositorio no es un modelo de IA y no puede ser utilizado para ninguna tarea de inferencia.
- La información de emisiones corresponde a una ejecución concreta y no es generalizable a otros entrenamientos.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable.
- No se proporcionan datos sobre el modelo base, el dataset ni los hiperparámetros, lo que impide cualquier reproducción o análisis técnico.
- Para producción, este repositorio es irrelevante.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SUMANSHAKTI27/tds-carbon-card
- Repositorios similares (misma plantilla de contabilidad de carbono): https://huggingface.co/i-shashikant/tds-carbon-card y https://huggingface.co/24f3005108/tds-carbon-card
