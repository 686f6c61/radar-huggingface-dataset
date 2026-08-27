# Vanshish/tds-carbon-card

## Resumen

Este repositorio, publicado por el usuario Vanshish en Hugging Face, no contiene un modelo de inteligencia artificial, sino un registro de contabilidad de carbono asociado a un proceso de fine-tuning realizado en el marco de la asignación TDS GA8. Documenta las emisiones de CO₂ equivalente generadas durante el entrenamiento, junto con el consumo energético y el hardware utilizado. Su propósito es servir como una ficha de transparencia ambiental para prácticas de Green AI, un área cada vez más relevante en el desarrollo de sistemas de aprendizaje automático.

El contenido se limita a metadatos de emisiones y especificaciones de entrenamiento. No se incluyen pesos, arquitectura, código ni ningún artefacto ejecutable. Por tanto, no es un modelo utilizable para tareas de generación, razonamiento o procesamiento del lenguaje. Su relevancia radica en la documentación de la huella de carbono, no en capacidades funcionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se proporciona información sobre arquitectura del modelo subyacente. El repositorio documenta únicamente el proceso de fine-tuning, indicando que se utilizaron 2 GPUs NVIDIA V100 en la región europe-west4, con un total de 439,9 horas de GPU (PUE 1,34). El consumo energético total fue de 353,6796 kWh, lo que resultó en 70,736 kg de CO₂ equivalente, calculados mediante la herramienta CodeCarbon. No se especifican datos de entrenamiento, número de tokens, ni técnicas como RLHF o DPO.

## Capacidades

- No aplica: el repositorio no contiene un modelo funcional.
- No hay capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- La única "capacidad" es la de servir como registro de emisiones de carbono para auditoría ambiental.

## Casos de uso

- Auditoría de sostenibilidad en proyectos de IA: el repositorio puede usarse como plantilla para documentar emisiones de CO₂ en otros entrenamientos, siguiendo el formato de CodeCarbon.
- Cumplimiento de políticas de Green AI: organizaciones que requieran reportar el impacto ambiental de sus modelos pueden referenciar este tipo de fichas.
- Investigación en eficiencia energética: los datos de consumo (353,68 kWh) y emisiones (70,74 kg CO₂eq) pueden compararse con otros entrenamientos para estudiar la relación entre hardware, región y huella de carbono.
- Educación en computación responsable: sirve como ejemplo práctico de cómo medir y reportar el coste ambiental de un fine-tuning.
- Transparencia en publicaciones académicas: autores de papers pueden incluir este tipo de tarjetas para cumplir con requisitos de reproducibilidad y responsabilidad ambiental.
- Benchmarking de infraestructura: los valores de PUE y horas de GPU pueden utilizarse para comparar la eficiencia de diferentes centros de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Al no existir un modelo, no hay métricas de rendimiento como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- No aplica para inferencia, ya que no hay modelo.
- El entrenamiento documentado utilizó 2 GPUs NVIDIA V100.
- No se proporcionan requisitos de VRAM, latencia ni throughput.
- No hay opciones de despliegue (vLLM, llama.cpp, Ollama, TGI, etc.) porque no existe un artefacto ejecutable.

## Comparativa con modelos similares

No disponible. No existen modelos comparables en el sentido funcional, ya que este repositorio no es un modelo de IA. Existen otros repositorios similares en Hugging Face (por ejemplo, AvanthikaShydh/tds-carbon-card y Vahsir/tds-carbon-card) que documentan el mismo tipo de contabilidad de carbono, pero no son modelos.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede descargar, cargar ni utilizar para ninguna tarea de machine learning.
- No hay información sobre sesgos, alucinaciones o limitaciones de contexto porque no existe un sistema que los genere.
- La licencia no está especificada, por lo que no se puede determinar si su contenido es reutilizable legalmente.
- Los datos de emisiones dependen de la metodología de CodeCarbon y de factores regionales; no son extrapolables a otros entornos sin ajustes.
- La fecha de creación (2026-08-27) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser un artefacto de prueba o un error de fecha en la plataforma.
- Para producción, este repositorio no aporta ningún valor funcional; solo informativo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Vanshish/tds-carbon-card
- Repositorio similar de AvanthikaShydh: https://huggingface.co/AvanthikaShydh/tds-carbon-card
- Repositorio similar de Vahsir: https://huggingface.co/Vahsir/tds-carbon-card
- Perfil de GitHub del autor: https://github.com/VanshishChaturvedi
