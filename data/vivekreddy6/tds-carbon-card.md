# VivekReddy6/tds-carbon-card

## Resumen

VivekReddy6/tds-carbon-card es un repositorio de Hugging Face que documenta la huella de carbono y el balance energético de una ejecución de entrenamiento de un modelo de IA, correspondiente a la asignación "TDS GA8" (probablemente un curso de Green AI). No se trata de un modelo de aprendizaje automático funcional, sino de un registro de contabilidad ambiental asociado a un entrenamiento de pre-entrenamiento realizado sobre hardware NVIDIA T4.

El repositorio, creado por VivekReddy6 en agosto de 2026, reporta un consumo energético total de 63,1934 kWh y unas emisiones de CO₂ equivalentes de 41,076 kg, calculadas mediante la herramienta CodeCarbon. La relevancia de esta ficha radica en su carácter ejemplar dentro de la iniciativa Green AI: muestra cómo documentar el coste ambiental de un entrenamiento, un aspecto cada vez más demandado en informes de transparencia y auditoría de modelos.

No se proporciona información sobre arquitectura, parámetros, contexto o capacidades del modelo entrenado, ya que el repositorio se limita a la contabilidad energética. El contenido es un caso de estudio académico más que un artefacto de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se describe ninguna arquitectura de modelo en la información disponible. El repositorio documenta un proceso de entrenamiento previo (pre-training) realizado con tres GPU NVIDIA T4 en la región asia-south1. El entrenamiento consumió 271,1 horas de GPU (con un factor de eficiencia energética PUE de 1,11) y un total de 63,1934 kWh de energía. Las emisiones de CO₂ equivalentes se estimaron en 41,076 kg mediante la herramienta Codecarbon. No se proporcionan detalles sobre el dataset, el número de tokens ni técnicas como RLHF o DPO.

## Capacidades

- No es un modelo de IA funcional: no genera texto, no procesa imágenes, no realiza razonamiento ni ejecuta código.
- Su única función es servir como registro de contabilidad de carbono y energía de un entrenamiento específico.
- Documenta el hardware utilizado, la duración, la energía consumida y las emisiones generadas, siguiendo el formato de las tarjetas de modelo de Green AI.
- Puede servir como plantilla o ejemplo para otros proyectos que necesiten reportar su huella ambiental.

## Casos de uso

- Auditoría de emisiones en investigación: investigadores pueden usar este repositorio como referencia para documentar el coste ambiental de sus propios entrenamientos, replicando el formato y las métricas de Codecarbon.
- Transparencia en publicaciones académicas: al adjuntar una tarjeta de carbono en un paper, se facilita la revisión por pares y el cumplimiento de políticas de Green AI en conferencias y revistas.
- Optimización de infraestructura: los datos de energía y tiempo por GPU permiten comparar la eficiencia de diferentes configuraciones de hardware y regiones de cómputo.
- Presupuesto de experimentos: los valores de energía y emisiones sirven para estimar el coste de futuros entrenamientos en la misma infraestructura (T4, asia-south1).
- Educación y formación: en cursos de sostenibilidad en IA, este repositorio es un ejemplo práctico de cómo medir y documentar el impacto ambiental de un entrenamiento.
- Comparativa de proveedores de nube: los datos de emisiones por región permiten comparar el factor de carbono de distintas zonas geográficas (aunque aquí solo se registra asia-south1).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible, ya que el repositorio no contiene un modelo evaluable ni métricas de rendimiento funcional.

## Requisitos de hardware

- Hardware de entrenamiento registrado: 3 GPU NVIDIA T4.
- Tiempo de entrenamiento: 271,1 horas de GPU (con PUE 1,11).
- Energía total consumida: 63,1934 kWh.
- No se proporcionan requisitos para inferencia, ya que no se ofrece un modelo desplegable.
- Para replicar el entrenamiento, se necesitaría una infraestructura similar (T4) en la región asia-south1, aunque el repositorio no detalla el framework ni las dependencias.

## Comparativa con modelos similares

Existen otros repositorios con el mismo propósito y formato dentro del curso TDS GA8, como 24f3005108/tds-carbon-card, que también documenta la huella de carbono de un entrenamiento. No se dispone de datos de rendimiento ni de especificaciones técnicas para comparar, ya que todos son registros de contabilidad y no modelos funcionales.

| Repositorio | Hardware | Energía (kWh) | CO₂ (kg) | Región |
|---|---|---|---|---|
| VivekReddy6/tds-carbon-card | 3× NVIDIA T4 | 63,19 | 41,08 | asia-south1 |
| 24f3005108/tds-carbon-card | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de IA utilizable: no puede ejecutar tareas de generación, razonamiento o procesamiento de datos.
- La licencia no está especificada, por lo que no se puede garantizar el uso comercial ni la redistribución del contenido.
- Los datos de emisiones dependen de la herramienta Codecarbon y de la región de cómputo; pueden variar según el proveedor y el factor de emisión de la red eléctrica.
- El repositorio no incluye el código del modelo ni los datos de entrenamiento, solo la contabilidad ambiental.
- La fecha de creación (agosto de 2026) es posterior al periodo actual, lo que sugiere que el repositorio es un ejercicio académico simulado o una proyección.
- No se especifica el framework de entrenamiento ni el tipo de modelo, lo que limita la reproducibilidad de las métricas.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VivekReddy6/tds-carbon-card
- Repositorio similar (24f3005108/tds-carbon-card): https://huggingface.co/24f3005108/tds-carbon-card
- Herramienta Codecarbon: https://codecarbon.io/ (no se ha verificado en la búsqueda, se menciona como fuente en la model card)
- Guías de Model Cards (referencia general): https://deepmind.google/models/model-cards/ y https://www.chai.org/workgroup/applied-model
