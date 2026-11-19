# SZLHOLDINGS/salad-verticals-r1

## Resumen

salad-verticals-r1 es un adaptador LoRA desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, un transformer denso de 1.700 millones de parametros con licencia Apache 2.0. El adaptador se distribuye como artefacto de entrenamiento en fase candidata, no como modelo de produccion publicado, y forma parte del programa interno de entrenamiento gobernado de SZL Holdings, que el autor denomina "Salad training program" y que se ejecuta sobre contenedores GPU de Salad bajo una doctrina de "receipted training" (registro fail-closed de recibos de entrenamiento, con medicion de energia via NVML y Zeus).

El modelo resuelve, segun la informacion disponible, un ajuste fino orientado a "verticales" de negocio sobre el modelo base Qwen3-1.7B, con el ingles como unico idioma declarado. No hay documentacion publica sobre el dataset de entrenamiento, el dominio concreto de las verticales ni los hiperparametros del LoRA. El repositorio ocupa 0,6 GB e incluye una escalera de checkpoints (50/100/150/200 pasos) mas un directorio `final/`, lo que sugiere un entrenamiento corto y ligero.

Su relevancia actual es limitada desde el punto de vista tecnico: se trata de un artefacto de trazabilidad interna con cero descargas y cero likes en el momento de la consulta, pensado para auditar el proceso de entrenamiento mas que para uso general. Resulta util unicamente como referencia de la metodologia de registro de SZL Holdings o como punto de partida para quien quiera inspeccionar adaptadores LoRA sobre Qwen3-1.7B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso Qwen3-1.7B |
| Parametros totales | no disponible (adaptador LoRA; el modelo base tiene 1.700 millones) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-1.7B, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-1.7B, un transformer decoder-only denso del que la model card no detalla capas, dimensiones ni mecanismos de atencion. El adaptador en si es un LoRA de PEFT, lo que implica que solo se entrenan matrices de baja dimension anadidas a las proyecciones del modelo base, no los pesos completos. El repositorio incluye una escalera de checkpoints en los pasos 50, 100, 150 y 200, ademas de un checkpoint `final/`, lo que indica un entrenamiento de muy corta duracion.

El entrenamiento se ejecuto, segun el autor, en contenedores GPU de Salad bajo la doctrina "fail-closed receipted-training": los recibos de finalizacion y los heartbeats se almacenan en la lane de logs SZLHOLDINGS/frontier-54-runs, y la energia se mide mediante doble metrica NVML/Zeus. El autor declara explicitamente que no se fabrican recuentos ni marcas de tiempo. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto en ingles heredada del modelo base Qwen3-1.7B.
- Razonamiento y respuesta a instrucciones basicas, en la medida en que el ajuste LoRA lo preserve.
- Ajuste orientado a "verticales" de negocio, aunque la model card no especifica cuales.
- No se documenta soporte de tool calling o function calling especifico para este adaptador.
- No se documenta soporte de agentes ni razonamiento multi-paso especifico.
- No se documenta capacidad de vision, audio ni modo thinking.
- Multilingue: no; solo ingles declarado.

## Casos de uso

- Auditoria de metodologia de entrenamiento: el adaptador y sus recibos asociados en SZLHOLDINGS/frontier-54-runs permiten reconstruir el proceso de entrenamiento con medicion de energia, util para equipos que quieran replicar practicas de trazabilidad.
- Investigacion sobre LoRA en modelos pequenos: al ser un adaptador sobre Qwen3-1.7B con checkpoints intermedios (50/100/150/200), sirve para estudiar la evolucion del ajuste fino a lo largo de los pasos.
- Prototipado interno de verticales de negocio: un equipo puede partir de este adaptador candidato para evaluar si el ajuste sobre Qwen3-1.7B aporta valor en su dominio antes de entrenar su propio LoRA.
- Base para comparativas de adaptadores: al compartir modelo base con otros LoRA sobre Qwen3-1.7B, permite comparar tecnicas de ajuste en igualdad de condiciones.
- Despliegue ligero en entornos con recursos limitados: al ser un adaptador sobre un modelo de 1.700 millones de parametros, puede servirse en GPUs de consumo una vez fusionado o cargado junto al base.
- Docencia y formacion: ejemplo practico de empaquetado de LoRA con PEFT y safetensors, con licencia Apache 2.0 que facilita su uso en cursos y talleres.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma especifica; al tratarse de un adaptador sobre Qwen3-1.7B, la VRAM depende del modelo base y de su cuantizacion (el adaptador anade una sobrecarga minima).
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del modelo base, cabria esperar GPUs de consumo, pero no se confirma.
- Cabe en consumer GPU: no confirmado en la informacion disponible.
- Opciones de despliegue: transformers y PEFT son las librerias declaradas; no se documentan vLLM, llama.cpp, Ollama ni TGI para este adaptador.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-verticals-r1 (este) | Adaptador LoRA sobre 1.700 M | no disponible | sin benchmarks publicados | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen3-1.7B (base) | 1.700 M | no disponible en la informacion | sin datos en esta ficha | Apache 2.0 | Hugging Face, ampliamente usado |
| Otros LoRA sobre Qwen3-1.7B | variable | variable | variable | variable | Hugging Face |

No se dispone de datos de rendimiento comparables para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Artefacto en fase candidata: el autor lo declara explicitamente como "candidate training artifact", no como modelo de produccion.
- Sin benchmarks publicados: no hay evidencia cuantitativa de su calidad ni de su mejora sobre el modelo base.
- Cero adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por terceros.
- Solo ingles: no se declara soporte multilingue.
- Dataset y dominio no documentados: se desconoce que "verticales" cubre y con que datos se entreno, lo que impide evaluar sesgos.
- Riesgo de alucinacion: heredado del modelo base Qwen3-1.7B y no cuantificado para este adaptador.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre el artefacto candidato.
- Dependencia del modelo base: requiere cargar Qwen3-1.7B junto con el adaptador, y cualquier limitacion del base (contexto, idioma, sesgos) se traslada.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-verticals-r1
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Organizacion SZLHOLDINGS: https://huggingface.co/SZLHOLDINGS
- Lane de logs de entrenamiento: SZLHOLDINGS/frontier-54-runs (referenciada en la model card; no se proporciona URL directa)
- Paper, blog o demo: no disponibles en la informacion proporcionada.
