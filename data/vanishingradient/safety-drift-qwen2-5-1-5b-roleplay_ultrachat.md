# vanishingradient/safety-drift-qwen2.5-1.5b-roleplay_ultrachat

## Resumen

El modelo `vanishingradient/safety-drift-qwen2.5-1.5b-roleplay_ultrachat` es un adaptador LoRA (PEFT) publicado por el usuario `vanishingradient` sobre el modelo base `Qwen/Qwen2.5-1.5B-Instruct`. No se trata, por tanto, de un modelo entrenado desde cero, sino de un ajuste fino ligero que debe cargarse junto al modelo base para funcionar. Se distribuye en formato safetensors y esta etiquetado para `text-generation` y uso conversacional.

La relevancia de esta publicacion no reside en su rendimiento, sino en su proposito aparente: el prefijo `safety-drift` y el sufijo `roleplay_ultrachat` sugieren que forma parte de una serie de adaptadores disenados para medir como el ajuste fino sobre datos benignos (aqui, datos de roleplay y de UltraChat) degrada la alineacion de seguridad del modelo base. Existe un repositorio hermano, `safety-drift-qwen2.5-1.5b-benign_alpaca`, que refuerza esta hipotesis. Es una advertencia: el adaptador podria reducir deliberadamente las barreras de seguridad del modelo original.

La model card publicada es la plantilla por defecto de HuggingFace sin rellenar: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion) figuran como `[More Information Needed]`. El repositorio registra 0 descargas y 0 likes, y un tamano declarado de 0.0 GB. Cualquier dato sobre su comportamiento debe considerarse no verificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5-1.5B-Instruct). Arquitectura del adaptador: no disponible (rango, alpha y modulos objetivo no documentados) |
| Parametros totales | No disponible para el adaptador. Modelo base: 1,5B aprox. (heredado de la documentacion publica de Qwen2.5, no indicado en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card. Modelo base: 32.768 tokens segun documentacion publica de Qwen2.5 |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar; admite combinarse con el modelo base cuantizado (GGUF, AWQ, GPTQ, bitsandbytes) si la integracion lo permite |
| Idiomas soportados | No disponible |
| Licencia | No disponible (la model card no declara licencia) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA). No se publican pesos fusionados ni GGUF propios |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT (version de framework declarada: PEFT 0.19.1) que se aplica sobre `Qwen/Qwen2.5-1.5B-Instruct`. El modelo base es un transformer decoder-only con atencion de consultas agrupadas (GQA) y 32.768 tokens de contexto, segun la documentacion publica de la serie Qwen2.5. El adaptador en si no describe arquitectura propia: se desconoce el rango LoRA, el valor de alpha, la tasa de dropout, los modulos objetivo y si se entreno con cuantizacion QLoRA.

Respecto al entrenamiento, no hay informacion verificable. La model card no incluye seccion de datos, hiperparametros ni regimen de precision. El identificador `roleplay_ultrachat` apunta a una mezcla de datos de juegos de rol y de UltraChat, y el prefijo `safety-drift` sugiere un diseno experimental orientado a inducir deriva de seguridad, pero ambas cosas son inferencias a partir del nombre, no hechos documentados por el autor. No se declara el uso de RLHF, DPO ni ninguna otra tecnica de alineacion posterior.

## Capacidades

- Generacion de texto y dialogo multi-turno, heredadas del modelo base Qwen2.5-1.5B-Instruct.
- Ajuste especifico para escenarios conversacionales de rol, segun se deduce del identificador del repositorio (no confirmado por el autor).
- Capacidad de razonamiento, codigo y matematicas: no disponible como dato propio; el modelo base de 1,5B tiene capacidad limitada en estas tareas.
- Soporte de tool calling / function calling: no disponible en la model card. El modelo base Qwen2.5-Instruct lo soporta, pero no hay confirmacion de que el adaptador lo preserve.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas esta vacio).
- Capacidades especiales (modo thinking, vision, audio): no disponible. El modelo base es exclusivamente de texto.
- Comportamiento de seguridad: potencialmente alterado por diseno; no hay evaluacion publicada que lo cuantifique.

## Casos de uso

- Investigacion sobre deriva de seguridad (safety drift): el caso de uso principal y mas realista. El adaptador sirve como condicion experimental en un estudio que compare como distintos corpus benignos (roleplay, UltraChat, Alpaca) modifican las tasas de rechazo del modelo base ante peticiones daninas.
- Evaluacion comparativa de alineacion: junto con el repositorio hermano `benign_alpaca`, permite construir un conjunto de adaptadores de control para medir la degradacion de seguridad con y sin datos de rol.
- Reproduccion de experimentos academicos: util para replicar resultados de articulos sobre perdida de alineacion durante el fine-tuning y para auditar metodologias de evaluacion de seguridad.
- Pruebas de red-teaming controladas: emplear el adaptador como modelo "debilitado" de referencia frente al que calibrar clasificadores de contenido o filtros de salida en un entorno aislado.
- Generacion de dialogos de rol sinteticos: si el ajuste funciona segun lo esperado, puede producir conversaciones de personaje con estilos y personalidades consistentes, util para aumentar datasets de dialogo.
- Prototipado en hardware muy limitado: al ser un adaptador sobre un modelo de 1,5B, cabe en GPUs de consumo y permite experimentar con inferencia local a bajo coste antes de escalar a modelos mayores.
- Analisis de robustez de guardarrailes: medir si los sistemas de moderacion externos siguen detectando contenido problematico cuando el modelo generador ha sido reajustado con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con todos los campos marcados como `[More Information Needed]`, y la busqueda web no ha devuelto ningun articulo, informe o tabla de resultados asociada a este adaptador.

## Requisitos de hardware

Estimaciones orientativas para el modelo base de 1,5B sobre el que se aplica el adaptador; el autor no publica ninguna medicion.

- Peso del adaptador: minimo (tipicamente decenas de MB para un LoRA de rango bajo); el repositorio declara 0.0 GB.
- Peso del modelo base en fp16/bf16: aproximadamente 3,1 GB de VRAM solo para los pesos.
- Peso del modelo base en cuantizacion de 4 bits: aproximadamente 1,0-1,3 GB de VRAM.
- VRAM total en inferencia: unos 3-4 GB en fp16 con contexto corto, y 6-8 GB si se usa la ventana completa de 32.768 tokens por el cache KV; en 4 bits, entre 1,5 y 4 GB segun contexto.
- GPU de consumo: cabe holgadamente en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en iGPU con memoria unificada suficiente. Tambien en Apple Silicon con 8 GB o mas.
- GPU de datacenter: A100, H100, L40S y similares quedan sobredimensionadas para este tamano; su uso solo tiene sentido para servir muchas replicas en paralelo.
- Opciones de despliegue: transformers + peft (ruta natural, ya que es un adaptador), vLLM con soporte LoRA, TGI con adaptadores, llama.cpp solo si se fusionan previamente los pesos y se convierten a GGUF, Ollama en el mismo supuesto que llama.cpp.
- Latencia y throughput: no disponibles. No hay mediciones publicadas por el autor.

## Comparativa con modelos similares

Los datos de modelos alternativos proceden de sus respectivas model cards publicas y no han sido verificados en la informacion proporcionada. Para este adaptador concreto no existe ningun dato de rendimiento, por lo que la comparacion se limita a parametros, contexto y licencia del modelo base subyacente y de alternativas de la misma clase de tamano.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| safety-drift-qwen2.5-1.5b-roleplay_ultrachat | Adaptador sobre base de 1,5B (rango no disponible) | No disponible | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-1.5B-Instruct | 1,5B | 32.768 tokens | Apache 2.0 | HuggingFace, ampliamente usado |
| Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | HuggingFace, requiere aceptar terminos |
| SmolLM2-1.7B-Instruct | 1,7B | 8.192 tokens | Apache 2.0 | HuggingFace |
| Gemma-2-2B-it | 2,6B | 8.192 tokens | Gemma Terms of Use | HuggingFace, requiere aceptar terminos |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita no se puede confirmar que el uso comercial este permitido. En ausencia de terminos, hay que asumir reserva de derechos por defecto.
- Riesgo de seguridad deliberado: el nombre `safety-drift` indica que el ajuste puede haber reducido las barreras de seguridad del modelo base. No debe desplegarse en aplicaciones de cara al publico sin una capa de moderacion independiente.
- Ausencia total de documentacion: la model card es la plantilla vacia. No hay datos de datos de entrenamiento, hiperparametros, evaluacion ni procedencia del dataset.
- Riesgo de alucinacion elevado: el modelo base tiene 1,5B de parametros, un tamano en el que las alucinaciones y los errores factuales son frecuentes, y no hay evaluacion que indique si el ajuste lo agrava.
- Limitaciones de contexto e idioma: se desconocen los idiomas cubiertos por el ajuste. El entrenamiento con datos de rol y UltraChat, mayoritariamente en ingles, puede degradar el rendimiento en castellano.
- Sin validacion de la comunidad: 0 descargas y 0 likes implican que el adaptador no ha sido probado por terceros; no hay informes de fallos conocidos ni de comportamiento observado.
- Fechas incoherentes: la fecha de creacion registrada (2026-09-21) es posterior a la fecha de actualizacion indicada y anomala respecto al momento de la consulta, lo que sugiere un artefacto de la plataforma o un error de metadatos.
- Dependencia del modelo base: no es un modelo autonomo. Requiere descargar `Qwen/Qwen2.5-1.5B-Instruct` y aplicar el adaptador con PEFT; un fallo de compatibilidad de version podria impedir la carga.
- Idoneidad: por su naturaleza experimental y su falta de trazabilidad, no es apto para produccion. Su uso razonable se limita a investigacion y evaluacion de seguridad en entornos controlados.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/vanishingradient/safety-drift-qwen2.5-1.5b-roleplay_ultrachat
- Repositorio hermano de la misma serie: https://huggingface.co/vanishingradient/safety-drift-qwen2.5-1.5b-benign_alpaca
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Modelo base sin instrucciones: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, calculo de emisiones): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de machine learning: https://mlco2.github.io/impact#compute
- Libreria PEFT: https://github.com/huggingface/peft
- No se han encontrado articulos, blogs, demos ni repositorios adicionales asociados a este modelo en la busqueda web realizada.
