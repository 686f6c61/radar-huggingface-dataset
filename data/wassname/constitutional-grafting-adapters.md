# wassname/constitutional-grafting-adapters

## Resumen

`wassname/constitutional-grafting-adapters` es una colección de adaptadores LoRA de rango 64 entrenados sobre `Qwen/Qwen3.5-35B-A3B-Base` en el marco de los experimentos de "constitutional grafting" del autor wassname. El objetivo del proyecto es el entrenamiento barato de "carácter" en modelos de lenguaje: se entrena un adaptador sobre el modelo Base y después se injerta sobre la variante Instruct, de modo que el comportamiento aprendido (en el ejemplo documentado, el carácter de Musonius derivado de una constitución de ética de la virtud) se transfiera sin reentrenar el modelo completo.

El repositorio contiene únicamente artefactos de investigación, no una release estable ni un modelo listo para producción. Los pesos se han convertido de fp32 a bf16, y cada carpeta incluye el `adapter_config.json`, el `adapter_model.safetensors` y un `cast.json` que documenta la fuente fp32 y el error relativo de Frobenius máximo introducido por la conversión. El autor advierte explícitamente que el material puede ser eliminado.

El interés técnico reside en la metodología más que en el artefacto: demuestra cómo adaptadores de bajo rango pueden modular el comportamiento de un modelo MoE grande (35B totales, ~3B activos) sin tocar los pesos base, lo que abarata la experimentación con alineamiento y personalidad. Al no haber pipeline, licencia ni idiomas declarados, cualquier uso en producción requiere verificación manual previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 64) sobre Qwen/Qwen3.5-35B-A3B-Base (modelo base MoE) |
| Parametros totales | 35B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | ~3B en el modelo base (MoE, segun el nombre A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos del adaptador en bf16 (fuente fp32); cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (`adapter_model.safetensors`), con `adapter_config.json` y `cast.json` |

## Arquitectura y entrenamiento

El artefacto no es un modelo completo, sino un conjunto de adaptadores LoRA de rango 64 destinados al modelo base `Qwen/Qwen3.5-35B-A3B-Base`, que por su nomenclatura es un transformer con mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B activos. El flujo de "constitutional grafting" consiste en entrenar los adaptadores sobre la variante Base y despues injertarlos sobre la variante Instruct, de forma que el comportamiento codificado en la "constitucion" (en el ejemplo del repositorio, una constitucion de etica de la virtud que define el carácter de Musonius) se aplique sobre un modelo ya alineado para instrucciones.

Los pesos del adaptador se han convertido de fp32 a bf16; el `cast.json` de cada carpeta registra la fuente fp32 y el error relativo de Frobenius maximo de la conversion, lo que permite auditar la perdida numerica. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni hiperparametros mas alla del rango 64. El autor describe el resultado como "entrenamiento barato de carácter", lo que sugiere un coste de computo bajo en comparacion con el ajuste completo del modelo base.

## Capacidades

- Generacion de texto y razonamiento heredados del modelo base Qwen3.5-35B-A3B-Base; las capacidades del adaptador por si solo no estan documentadas.
- Modulacion de comportamiento y "carácter" (personalidad, estilo de respuesta) segun la constitucion usada en el entrenamiento; el ejemplo documentado es el carácter de Musonius.
- Transferencia de comportamiento aprendido en Base a Instruct mediante injerto de adaptadores.
- Soporte de tool calling / function calling: no disponible (no documentado para el adaptador).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible.
- Capacidades especiales (thinking mode, vision, audio): no disponible.

## Casos de uso

- Experimentacion en alineamiento: investigadores que quieran probar constituciones de comportamiento (etica de la virtud, estilos de respuesta) entrenando adaptadores baratos sobre Base e injertandolos en Instruct, sin reentrenar el modelo completo.
- Investigacion sobre personalidad y estilo: uso del adaptador de Musonius como referencia reproducible para estudiar como una constitucion textual se traduce en cambios de comportamiento medibles.
- Prototipado rapido de asistentes con tono concreto: cargar el adaptador sobre Qwen3.5-35B-A3B-Instruct para evaluar si el carácter injertado se mantiene en conversaciones multi-turno.
- Estudio de tecnicas de bajo rango: comparar LoRA de rango 64 con otras tecnicas de adaptacion (full fine-tuning, DPO) en terminos de coste y fidelidad del comportamiento.
- Analisis de robustez numerica: usar `cast.json` y el error de Frobenius para estudiar el impacto de la conversion fp32 a bf16 en adaptadores de bajo rango.
- Reproduccion de experimentos: servir como artefacto de referencia en publicaciones o notebooks que repliquen el pipeline de constitutional grafting del repositorio GitHub del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-35B-A3B-Base; con 35B parametros totales, en bf16 se requiere aproximadamente 70 GB solo para pesos, mas overhead de activaciones y KV cache. El adaptador LoRA anade una cantidad marginal.
- GPU recomendadas: para bf16 del modelo base, A100 80GB, H100 80GB o configuraciones multi-GPU; para cuantizaciones de 4 bits, una RTX 4090 de 24 GB o una RTX 3090 de 24 GB podrian ser suficientes, aunque no se confirma en la informacion disponible.
- Cabe en consumer GPU: no disponible con certeza; depende de la cuantizacion del modelo base, que no esta documentada para este artefacto.
- Opciones de despliegue: el formato safetensors de adaptador es compatible con cargadores PEFT; para el modelo base se podria usar vLLM, TGI o llama.cpp si existe una conversion GGUF, pero no se confirma en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wassname/constitutional-grafting-adapters | LoRA r64 sobre base de 35B (MoE, ~3B activos) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3.5-35B-A3B-Base | 35B totales, ~3B activos | no disponible | no disponible | no disponible | Hugging Face |
| Adaptadores PEFT genericos (familia LoRA) | rango variable | depende del base | depende del base | habitualmente Apache 2.0 o MIT | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto de investigacion: el autor indica explicitamente que no es una release y que el repositorio puede ser eliminado, por lo que no debe usarse como dependencia estable en produccion.
- Licencia no declarada: no hay licencia en la model card ni en los metadatos de Hugging Face, lo que impide confirmar condiciones de uso comercial.
- Idiomas no declarados: no se puede garantizar cobertura linguistica del adaptador ni del modelo base.
- Pipeline no declarado: no hay tarea asignada en Hugging Face, por lo que la carga automatica puede fallar.
- Conversion numerica: los pesos se han casteado de fp32 a bf16; aunque el error de Frobenius esta documentado en `cast.json`, existe una perdida de precision respecto al original.
- Riesgo de alucinacion: inherente al modelo base; no hay evaluacion especifica del adaptador.
- Sesgos conocidos: no documentados; el comportamiento se deriva de una constitucion concreta (etica de la virtud), lo que puede introducir un sesgo de estilo y valores no evaluado.
- Dependencia del modelo base: el adaptador solo tiene sentido junto a Qwen3.5-35B-A3B-Base/Instruct; no es un modelo autonomo.
- Sin benchmarks: no hay metricas publicadas que permitan validar el comportamiento injertado frente al base.

## Enlaces

- Hugging Face: https://huggingface.co/wassname/constitutional-grafting-adapters
- Repositorio GitHub del proyecto: https://github.com/wassname/constitutional_grafting
- Modelo base referenciado: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
