# Stuti-7/tds_ga8_q10

## Resumen

El repositorio `Stuti-7/tds_ga8_q10` en Hugging Face no contiene un modelo de inteligencia artificial, sino la documentación de la huella de carbono y el consumo energético asociados a un proceso de fine-tuning realizado en el contexto de la asignatura "Tools in Data Science" (TDS GA8). El autor, Stuti-7, ha publicado únicamente una model card que detalla las emisiones de CO₂ equivalente (202,366 kg), el consumo eléctrico (481,824 kWh) y las horas de GPU (478 h) empleadas durante el entrenamiento en dos GPUs NVIDIA A100 en la región us-east1.

No se proporciona ninguna especificación técnica del modelo subyacente: no se indica arquitectura, número de parámetros, longitud de contexto, idiomas soportados ni licencia. El repositorio tiene 0 descargas y 1 like, y fue creado en agosto de 2026. En consecuencia, esta ficha se limita a documentar la información disponible, que es exclusivamente de carácter medioambiental y operativo, sin datos que permitan evaluar el modelo como artefacto de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo (transformer, MoE, SSM, etc.). La model card únicamente indica que se realizó un fine-tuning sobre un modelo preexistente, sin especificar cuál. El entrenamiento se llevó a cabo con 2 GPUs NVIDIA A100 durante 478 horas, con un factor de eficiencia energética (PUE) de 1,26, lo que resultó en un consumo total de 481,824 kWh y unas emisiones de 202,366 kg de CO₂ equivalente, calculadas mediante la herramienta CodeCarbon. No se mencionan datos de entrenamiento, técnicas de alineación (RLHF, DPO) ni ninguna innovación técnica.

## Capacidades

No se han documentado capacidades funcionales del modelo. Al no existir un artefacto de modelo descargable ni una descripción de tareas, no es posible enumerar habilidades como generación de texto, razonamiento, código, tool calling o capacidades multimodales.

## Casos de uso

No aplica. Este repositorio no ofrece un modelo utilizable para tareas de IA. Su propósito es servir como registro de contabilidad de carbono para un ejercicio académico, no como un recurso para desarrollo o investigación aplicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Para el entrenamiento documentado se utilizaron 2 GPUs NVIDIA A100.
- No se especifican requisitos de inferencia, VRAM estimada, ni opciones de despliegue (vLLM, llama.cpp, etc.).
- Dado que no hay un modelo publicado, no es posible determinar si es ejecutable en hardware de consumo.

## Comparativa con modelos similares

No disponible. No existe información sobre el modelo subyacente ni sobre alternativas comparables.

## Limitaciones y advertencias

- El repositorio no contiene un modelo de IA, solo documentación de emisiones; cualquier intento de descargar o utilizar el modelo como artefacto de inferencia fracasará.
- No se proporciona información sobre sesgos, alucinaciones, restricciones de licencia o limitaciones de idioma.
- La ausencia de especificaciones técnicas impide cualquier evaluación de rendimiento o idoneidad para producción.
- La fecha de creación (2026) y el contexto académico sugieren que se trata de un ejercicio formativo, no de un recurso destinado a uso real.

## Enlaces

- [Hugging Face - Stuti-7/tds_ga8_q10](https://huggingface.co/Stuti-7/tds_ga8_q10)
