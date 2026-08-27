# vishupal-24/ga8-carbon-card

## Resumen

Este repositorio, `vishupal-24/ga8-carbon-card`, no contiene un modelo de inteligencia artificial, sino una ficha de contabilidad de carbono (carbon card) correspondiente a una ejecución de entrenamiento de un modelo no especificado, realizada en el marco de la asignatura TDS GA8. El autor, `vishupal-24`, documenta las emisiones de CO₂ equivalente generadas durante el pre-entrenamiento, utilizando la herramienta CodeCarbon. Se trata de un ejercicio de transparencia ambiental más que de un artefacto de IA utilizable.

La información disponible se limita a los datos de emisiones: 833,342 kg de CO₂eq, 1736,1288 kWh de energía total, 466,2 horas de GPU en 7 NVIDIA A100, con una ubicación geográfica en `ap-southeast1`. No se proporciona ningún detalle sobre la arquitectura, los parámetros, el contexto o las capacidades del modelo subyacente, por lo que esta ficha no puede evaluar el rendimiento ni las funcionalidades de ningún sistema de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

Datos adicionales del registro de emisiones (no del modelo):

| Parametro | Valor |
|---|---|
| Emisiones CO₂eq | 833,342 kg |
| Energia total | 1736,1288 kWh |
| Horas de GPU | 466,2 h (PUE 1,33) |
| Hardware | 7x NVIDIA A100 |
| Region | ap-southeast1 |
| Modo de entrenamiento | pre-training |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.) ni sobre los datos de entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El repositorio únicamente documenta el consumo energético y las emisiones asociadas a una ejecución de pre-entrenamiento, sin especificar qué modelo se entrenó ni con qué configuración. No hay innovaciones técnicas descritas.

## Capacidades

- No se ha publicado ninguna capacidad funcional del modelo subyacente.
- El repositorio no incluye pesos, código de inferencia ni demos.
- No hay soporte de tool calling, agentes, visión, audio ni razonamiento multilingüe documentado.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio sirve como plantilla para registrar emisiones de CO₂ de entrenamientos, siguiendo prácticas de Green AI.
- Cumplimiento de reportes ambientales: puede utilizarse como evidencia de medición de huella de carbono en entornos académicos o corporativos.
- Educación sobre eficiencia energética: útil para enseñar a estudiantes cómo cuantificar el impacto ambiental de cargas de trabajo de GPU.
- Comparación de costes energéticos entre configuraciones: aunque no hay datos de otros modelos, la metodología (CodeCarbon) es replicable.
- Documentación de transparencia en publicaciones científicas: los autores pueden adjuntar esta tarjeta a papers que describan entrenamientos.
- No es aplicable a ningún caso de uso de IA generativa, razonamiento o procesamiento de lenguaje, al no existir un modelo funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ningún modelo evaluable en este repositorio.

## Requisitos de hardware

- El entrenamiento documentado utilizó 7 GPUs NVIDIA A100, con un total de 466,2 horas de GPU.
- No se especifican requisitos de VRAM para inferencia, ya que no se distribuye ningún modelo.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI) porque no hay pesos que cargar.
- No se reportan latencias ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no contiene un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Los únicos repositorios similares encontrados en la búsqueda web son otras tarjetas de carbono de la misma asignatura (por ejemplo, `24f2005112/tds-carbon-card` y `24f3005108/tds-carbon-card`), que siguen el mismo formato de documentación de emisiones, pero no ofrecen datos de rendimiento de modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de generación, razonamiento o procesamiento.
- La licencia no está especificada, por lo que no se puede determinar si el contenido es reutilizable comercialmente.
- Los datos de emisiones dependen de la región y del hardware; no son generalizables a otros entrenamientos.
- La fecha de creación (2026-08-27) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser un artefacto de un ejercicio académico con datos simulados o proyectados.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto, al no existir un modelo subyacente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/vishupal-24/ga8-carbon-card
- Ejemplo de tarjeta similar: https://huggingface.co/24f2005112/tds-carbon-card
- Ejemplo de tarjeta similar: https://huggingface.co/24f3005108/tds-carbon-card
- Página personal del autor: https://vishupal.com/
