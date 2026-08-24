# udit789/tds-carbon-card

## Resumen

`udit789/tds-carbon-card` no es un modelo de inteligencia artificial al uso, sino un repositorio de contabilidad de carbono que documenta la huella ambiental de una ejecución de entrenamiento realizada en el contexto del curso TDS GA8. El autor, `udit789`, publica este registro como parte de una práctica académica centrada en la computación sostenible (Green AI). El repositorio no contiene pesos, arquitectura ni pipeline de inferencia; su contenido se limita a una model card con métricas de consumo energético y emisiones de CO₂ equivalente.

La relevancia de este tipo de repositorios radica en la creciente necesidad de cuantificar el impacto ambiental del entrenamiento de modelos de IA. En este caso concreto, se documenta un proceso de fine-tuning ejecutado sobre 6 GPU NVIDIA V100 en la región `us-east1`, con un consumo total de 985.68 kWh y unas emisiones de 413.986 kg de CO₂ equivalente. El proyecto pertenece a la asignación TDS-GA8, un ejercicio académico que busca estandarizar la publicación de métricas de sostenibilidad en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de contabilidad de carbono, sin modelo) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (no incluye pesos) |

## Arquitectura y entrenamiento

No se documenta ninguna arquitectura de modelo en este repositorio. La información de entrenamiento se limita a los siguientes datos: hardware NVIDIA V100 (6 GPU), modo de entrenamiento fine-tuning, región `us-east1`, 370 horas de GPU con un PUE de 1.48, consumo energético total de 985.68 kWh y emisiones de 413.986 kg de CO₂ equivalente. No se especifica el dataset utilizado, el número de tokens, el tamaño del modelo ni ninguna técnica de optimización o alineación.

La ausencia de estos datos es coherente con la finalidad del repositorio, que no es compartir un modelo sino documentar el coste ambiental de una ejecución de entrenamiento. La herramienta utilizada para la medición es CodeCarbon, tal como se indica en los metadatos YAML de la model card.

## Capacidades

- No se trata de un modelo de IA; no ofrece capacidades de generación de texto, razonamiento, código o visión.
- Su función es documental: registrar el impacto ambiental de una ejecución de entrenamiento.
- Permite verificar las emisiones de CO₂ asociadas a un proceso de fine-tuning con hardware específico.
- Incluye métricas de consumo energético y factor de intensidad de carbono de la región de cómputo.
- Sirve como ejemplo de práctica de contabilidad de carbono en el ecosistema Hugging Face.

## Casos de uso

- Auditoría ambiental de procesos de entrenamiento: el repositorio puede utilizarse como referencia para cuantificar el coste energético de un fine-tuning en GPU V100, útil en informes de sostenibilidad.
- Docencia en computación verde: sirve como ejemplo práctico de cómo documentar la huella de carbono de un experimento de IA, con datos reales de consumo y emisiones.
- Comparación de infraestructuras: junto a otros repositorios del mismo tipo (con hardware distinto), permite comparar el impacto de diferentes GPU y regiones en las emisiones de CO₂.
- Estimación de costes energéticos para presupuestos de cómputo: los datos de 985.68 kWh y 413.986 kg de CO₂ pueden usarse como base para estimar el impacto de proyectos similares.
- Investigación sobre eficiencia energética: el registro de 370 horas de GPU con un PUE de 1.48 ofrece datos útiles para estudiar la relación entre tiempo de cómputo y emisiones.
- Publicación de métricas de sostenibilidad: sirve como plantilla para equipos que necesiten cumplir con requisitos de reporte de huella de carbono en sus pipelines de ML.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no contiene evaluaciones de rendimiento de ningún modelo, ya que su propósito es únicamente la contabilidad de carbono del proceso de entrenamiento.

## Requisitos de hardware

- Hardware documentado: 6 GPU NVIDIA V100, con 370 horas de uso total.
- No se especifica VRAM por GPU ni requisitos de memoria para inferencia, ya que no se distribuye ningún modelo.
- El repositorio no incluye instrucciones de despliegue ni soporte para vLLM, llama.cpp, Ollama o TGI.
- El consumo energético reportado es de 985.68 kWh, con un PUE de 1.48, lo que da una idea de la infraestructura necesaria para reproducir el entrenamiento.
- No hay datos de latencia ni throughput, al no existir servicio de inferencia.

## Comparativa con modelos similares

No se trata de un modelo de IA comparable con alternativas como Llama, Mistral o Qwen. Sin embargo, existen repositorios equivalentes del mismo proyecto académico TDS-GA8 con la misma función de contabilidad de carbono. La comparativa entre ellos refleja diferencias en hardware y región:

| Repositorio | Hardware | Modo | Region | GPU horas | Energia (kWh) | CO₂ (kg) |
|---|---|---|---|---|---|---|
| udit789/tds-carbon-card | V100 (6 GPU) | fine-tuning | us-east1 | 370 | 985.68 | 413.986 |
| 23f3001222/tds-carbon-card | A100 (3 GPU) | pre-training | europe-west4 | 206.6 | 384.276 | 76.855 |
| WiseDev/tds-carbon-card | T4 (5 GPU) | fine-tuning | us-central1 | 223 | 120.197 | 42.069 |
| Bhagwat8978/tds-carbon-card | H100 (3 GPU) | fine-tuning | us-east1 | 459.5 | 1399.1775 | 587.655 |
| 24f2006741/tds-carbon-card | V100 (5 GPU) | fine-tuning | europe-north1 | 476.9 | 1022.9505 | 122.754 |

Los datos muestran una gran variabilidad en emisiones según la GPU y la región; el caso de V100 en us-east1 (413.986 kg) es significativamente más alto que el mismo hardware en europe-north1 (122.754 kg), lo que evidencia la influencia de la red eléctrica regional en la huella de carbono.

## Limitaciones y advertencias

- Este repositorio no contiene un modelo de IA funcional; no se puede utilizar para inferencia ni fine-tuning.
- Los datos de emisiones provienen de una estimación de Codecarbon y pueden tener margen de error; no se han verificado con medidores físicos.
- No hay información sobre el dataset, la tarea o el modelo base del fine-tuning, lo que limita la reproducibilidad del experimento.
- La licencia no está especificada, lo que impide saber si el contenido puede reutilizarse comercialmente.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que no ha sido validado ni revisado por la comunidad.
- Los datos de consumo no incluyen la energía asociada a la refrigeración del datacenter (el PUE se aplica, pero no se detalla su metodología de cálculo).
- No se ofrece información sobre sesgos, alucinaciones o limitaciones lingüísticas, porque no es un modelo de lenguaje.

## Enlaces

- Repositorio original: https://huggingface.co/udit789/tds-carbon-card
- Repositorios similares del mismo proyecto: https://huggingface.co/Bhagwat8978/tds-carbon-card, https://huggingface.co/WiseDev/tds-carbon-card, https://huggingface.co/23f3001222/tds-carbon-card
- Herramienta de medición de emisiones: Codecarbon (https://github.com/mlco2/codecarbon)
