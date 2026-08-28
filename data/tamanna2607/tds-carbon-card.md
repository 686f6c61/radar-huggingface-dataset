# tamanna2607/tds-carbon-card

## Resumen

El repositorio `tamanna2607/tds-carbon-card` no contiene un modelo de inteligencia artificial, sino una tarjeta de contabilidad de carbono (carbon card) asociada a un entrenamiento de modelo realizado en el marco del programa TDS GA8. Documenta las emisiones de CO₂ equivalente, el consumo energético y el hardware utilizado durante una ejecución de pre-entrenamiento. Es un artefacto de transparencia medioambiental, no un artefacto de inferencia.

La información publicada incluye métricas de emisiones calculadas con CodeCarbon, especificaciones de hardware (6 GPUs NVIDIA L40S), región de cómputo (asia-south1) y consumo total de energía. No se proporcionan detalles sobre la arquitectura del modelo entrenado, sus parámetros, ni su propósito. Por tanto, esta ficha describe un registro de sostenibilidad, no un modelo desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no se especifica el modelo entrenado) |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se publican pesos) |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de red neuronal en la información disponible. El repositorio únicamente reporta datos de un proceso de pre-entrenamiento: se utilizaron 6 GPUs NVIDIA L40S durante 267,1 horas (con un PUE de 1,32), consumiendo 740,4012 kWh y generando 481,261 kg de CO₂ equivalente, según la herramienta CodeCarbon. La región de cómputo fue `asia-south1`. No se indica el tipo de modelo, el dataset, ni el método de optimización (RLHF, DPO, etc.).

## Capacidades

- No se documenta ninguna capacidad funcional del modelo subyacente (generación de texto, razonamiento, código, visión, etc.).
- No se especifica soporte para tool calling, agentes, ni razonamiento multi-paso.
- No se indican capacidades multilingües.
- El único dato funcional es la medición de emisiones de CO₂ del entrenamiento, que no es una capacidad del modelo sino un atributo del proceso.

## Casos de uso

Dado que no se trata de un modelo de IA, no existen casos de uso de inferencia. El repositorio puede servir para:

- Auditoría medioambiental de entrenamientos de modelos: consultar las emisiones reportadas para fines de reporte de sostenibilidad.
- Comparación de huella de carbono entre ejecuciones: los datos de CodeCarbon permiten contrastar el coste energético de diferentes configuraciones de hardware.
- Investigación en Green AI: utilizar estos registros como referencia para estudios sobre eficiencia energética en entrenamiento de modelos.
- Cumplimiento normativo: documentar el impacto climático de actividades de cómputo en la nube.
- Educación: ejemplificar cómo se aplica la contabilidad de carbono en proyectos de IA.
- Reproducibilidad de métricas: verificar los cálculos de emisiones a partir de los datos de hardware y energía.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existe ningún indicador de rendimiento del modelo (MMLU, HumanEval, GSM8K, etc.) porque no se proporciona el modelo en sí.

## Requisitos de hardware

- El entrenamiento documentado utilizó 6 GPUs NVIDIA L40S, con un total de 267,1 horas de cómputo.
- No se especifican requisitos de VRAM para inferencia, ya que no se ofrece ningún modelo para ejecutar.
- No se indica si el modelo cabría en GPUs de consumo (RTX 4090, etc.) porque no hay información sobre su tamaño.
- No se mencionan opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.).
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA y no existe una categoría comparable de modelos. Otros repositorios con el mismo nombre (`SUMANSHAKTI27/tds-carbon-card`, `Vanshish/tds-carbon-card`) contienen tarjetas de carbono similares, pero no son modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede utilizar para ninguna tarea de generación, razonamiento o procesamiento.
- No se proporciona información sobre el modelo entrenado (arquitectura, parámetros, dataset), por lo que no es posible evaluar su calidad o sesgos.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de los factores de emisión de la región; pueden no ser directamente comparables con otras mediciones.
- La licencia no está especificada, por lo que no se puede determinar si los datos pueden reutilizarse comercialmente.
- El repositorio tiene 0 descargas y 1 like, lo que sugiere que es un artefacto académico o de práctica, no un recurso de producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/tamanna2607/tds-carbon-card
- Repositorios similares: https://huggingface.co/SUMANSHAKTI27/tds-carbon-card, https://huggingface.co/Vanshish/tds-carbon-card
- Perfil de GitHub de la autora: https://github.com/Tamanna2607
