# yehors/Ornith-1.5-35B-A3B-Q8_0-MTP-GGUF

## Resumen

Esta ficha describe `yehors/Ornith-1.5-35B-A3B-Q8_0-MTP-GGUF`, una cuantizacion GGUF en Q8_0 del modelo base `ornith-ai/Ornith-1.5-35B-A3B`. No es un modelo entrenado desde cero, sino una conversion de pesos publicada por el usuario yehors, cuyo principal valor anadido es que conserva la cabecera de prediccion NextN / MTP (bloque `blk.40`) que las herramientas estandar de cuantizacion descartan para esta arquitectura. Gracias a ello, el propio fichero GGUF puede usarse como modelo borrador para decodificacion auto-especulativa mediante `--spec-type draft-mtp` en llama.cpp.

El modelo base es un MoE de aproximadamente 35.500 millones de parametros totales con unos 3.000 millones activos por token, con arquitectura hibrida de SSM y atencion (identificada como `qwen35moe` en llama.cpp) y una ventana de contexto de 256K tokens. Esta combinacion de muchos parametros totales con pocos activos lo situa en la categoria de modelos eficientes en inferencia, pensados para despliegue local o en hardware modesto sin renunciar a una calidad asociada a un modelo de mayor tamano.

La relevancia de esta publicacion concreta es practica: permite ejecutar la variante Q8_0 (practicamente sin perdida frente a BF16, 8,52 bits por peso) manteniendo la decodificacion especulativa MTP, algo que el `llama-quantize` de serie rechaza en esta arquitectura. Es, por tanto, una pieza util para quien quiera maximizar el rendimiento por token en llama.cpp sobre el modelo Ornith-1.5 sin degradar la calidad de los pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE hibrida (SSM + atencion); identificada como `qwen35moe` en llama.cpp |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 256K tokens (segun el modelo base) |
| Tipos de cuantizacion | Q8_0 (8,52 BPW); cabecera MTP tambien en Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Tamano del fichero | ~36 GB (`Ornith-1.5-35B-Q8_0-MTP.gguf`); repo de 37,8 GB |
| Modelo base | ornith-ai/Ornith-1.5-35B-A3B |
| Cabecera NextN / MTP | Conservada (`blk.40`), permite decodificacion auto-especulativa |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo base sigue una arquitectura de mezcla de expertos (MoE) con aproximadamente 35.500 millones de parametros totales de los que se activan unos 3.000 millones por token. Es ademas un modelo hibrido, ya que combina capas de espacio de estados (SSM) con capas de atencion, un patron que reduce el coste de inferencia en secuencias largas respecto a un transformer denso puro. En llama.cpp la arquitectura se registra bajo el identificador `qwen35moe`, y la ventana de contexto declarada es de 256K tokens.

El fichero aqui documentado es unicamente una cuantizacion: no se ha realizado ningun reentrenamiento, ajuste fino ni alineacion adicional por parte del autor de esta publicacion. La innovacion tecnica relevante es de herramienta, no de modelo: `llama-quantize` de serie rechaza el bloque extra `blk.40` (NextN) para esta arquitectura con el error `Bad layer 40 ... Must be in [0, 40)`, por lo que las cuantizaciones uniformes oficiales eliminan la cabecera MTP. El autor aplica un parche local de una linea que trata el bloque NextN como la ultima capa durante la seleccion de tipo, preservando `blk.40.nextn.*` y, con ello, la posibilidad de decodificacion especulativa a Q8_0. No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, ni sobre el uso de RLHF o DPO en el modelo base a partir de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional, con licencia y pipeline declarados como `text-generation` y etiqueta `conversational`.
- Modo de razonamiento compatible con el formato DeepSeek: la plantilla de llama.cpp admite `--reasoning-format deepseek` y `--reasoning-budget`, con lo que el modo de "pensamiento" puede activarse o desactivarse explicitamente.
- Decodificacion auto-especulativa mediante la cabecera MTP conservada (`--spec-type draft-mtp`, con `--spec-draft-n-max` configurable).
- Eficiencia de inferencia propia de un MoE: ~3B parametros activos por token sobre ~35,5B totales.
- Ventana de contexto larga de hasta 256K tokens en el modelo base, adecuada para documentos extensos y conversaciones de muchos turnos.
- Capacidades multilingues: no disponible.
- Soporte de tool calling / function calling: no documentado en la informacion proporcionada.
- Vision o audio: no disponible (no se mencionan capacidades multimodales).

## Casos de uso

- Asistencia de codigo autoalojada: el modelo puede ejecutarse integramente en infraestructura propia (llama-server sin dependencias de API externa) con una plantilla de muestreo orientada a codigo (`temp 0.6`, `top-p 0.95`, `top-k 20`), lo que lo hace apto para entornos con requisitos de confidencialidad del codigo fuente.
- Analisis de repositorios y documentos largos: la ventana de 256K tokens permite procesar bases de codigo o informes extensos en una sola pasada, evitando la fragmentacion en trozos que degrada la coherencia en tareas de resumen y busqueda semantica.
- Servicio de chat multi-turno: su naturaleza conversacional y el modo de razonamiento configurable permiten alternar entre respuestas rapidas (razonamiento desactivado) y respuestas mas meditadas para consultas complejas.
- Generacion acelerada en produccion: la cabecera MTP habilita decodificacion auto-especulativa dentro del mismo fichero, aumentando los tokens por segundo sin necesidad de un modelo borrador independiente ni de VRAM adicional.
- Despliegue en hardware modesto o compartido: al activar solo ~3B parametros por token, el coste computacional por token es bajo comparado con un modelo denso de 35B, lo que facilita servir varias peticiones concurrentes o ejecutar en GPUs de gama alta para consumidor o iGPUs potentes.
- Evaluacion y benchmarking de tecnicas de decodificacion especulativa: al preservar `blk.40`, este fichero sirve como banco de pruebas para medir la tasa de aceptacion del borrador MTP en distintos contextos y configuraciones de `--spec-draft-n-max`.
- Prototipado de asistentes con contexto largo en local: para equipos que necesitan un asistente privado capaz de recordar conversaciones extensas sin enviar datos a terceros.

## Benchmarks y rendimiento

El autor publica medidas de rendimiento en una iGPU AMD Radeon 8060S (Vulkan, ~140 GB/s):

| Prueba | Resultado |
|---|---|
| pp512 (procesamiento de prompt) | ~936 t/s |
| tg128 sin especulacion (generacion) | ~47,6 t/s |

No se ha publicado en la informacion disponible ningun resultado de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) ni cifras de throughput con especulacion MTP activada.

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero Q8_0 pesa ~36 GB, por lo que se necesitan aproximadamente 36-38 GB solo para pesos; con cache KV en `q8_0` y contexto moderado, el requisito practico arranca en ~40-48 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o cualquier acelerador con 48 GB o mas de memoria para ejecutar el modelo completo con contexto holgado. El autor lo ha probado en una iGPU Radeon 8060S con Vulkan, lo que demuestra viabilidad en memoria unificada.
- GPU de consumo: no cabe en una unica RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) a Q8_0. Requiere configuracion multi-GPU o el uso de cuantizaciones menores no incluidas en este repositorio.
- Opciones de despliegue: llama.cpp (`llama-server` / `llama-cli`) es el soporte nativo dado el formato GGUF y la etiqueta `llama.cpp`. La decodificacion especulativa MTP solo funciona en este ecosistema. No se documenta soporte para vLLM ni TGI con este fichero.
- Parametros de ejecucion sugeridos por el autor: `-ngl 999 --flash-attn on --ctx-size 65536 -b 2048 -ub 2048 --cache-type-k q8_0 --cache-type-v q8_0 --spec-type draft-mtp --spec-draft-n-max 3`.
- Latencia y throughput medidos: ~936 t/s en pp512 y ~47,6 t/s en tg128 sin especulacion, sobre iGPU Radeon 8060S con Vulkan. El rendimiento con especulacion dependera de la tasa de aceptacion del borrador y no se cuantifica.
- Aviso de rendimiento: al tratarse de un modelo hibrido (SSM + atencion), `--cache-reuse` no surte efecto y los prompts se reprocesan en cada turno, lo que penaliza la latencia en conversaciones con contexto muy largo.
- Requisitos de disco: ~37,8 GB de espacio para el repositorio completo.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos alternativos en la informacion disponible, por lo que no es posible establecer una comparativa rigurosa con cifras verificables. Como referencia estructural, la categoria de comparacion natural seria la de modelos MoE con activacion de aproximadamente 3B parametros y decenas de miles de millones de parametros totales, pero no se dispone de datos concretos de dichos modelos en esta ficha.

| Modelo | Parametros totales | Activos | Contexto | Licencia | Datos comparativos |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (Q8_0 MTP) | ~35,5B | ~3B | 256K | MIT | Rendimiento: pp512 ~936 t/s, tg128 ~47,6 t/s (iGPU Vulkan) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo derivado, no oficial: se trata de una cuantizacion de terceros publicada por el usuario yehors. La calidad final depende tanto del modelo base como del proceso de cuantizacion y del parche aplicado.
- Parche no estandar: la conservacion del bloque `blk.40` se logro con un parche local de una linea sobre `llama-quantize`. Si el fichero se regenera o se convierte con herramientas estandar, la cabecera MTP puede perderse.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad ni de tasas de alucinacion para esta cuantizacion ni para el modelo base.
- Sesgos: no disponible. No se documentan analisis de sesgo en la informacion proporcionada.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano u otros idiomas distintos del ingles sin evaluacion previa.
- Sin resultados de benchmarks de calidad: no hay datos de MMLU, HumanEval, GSM8K ni similares, por lo que no se puede verificar el rendimiento en tareas de razonamiento, codigo o matematicas.
- Sin soporte confirmado de tool calling: la informacion disponible no documenta function calling ni uso agente, lo que limita su integracion en pipelines de agentes sin validacion previa.
- Penalizacion en conversaciones largas: al ser un modelo hibrido, `--cache-reuse` no funciona y los prompts se reprocesan en cada turno, lo que incrementa la latencia en usos conversacionales con contexto extenso.
- Requisitos de memoria elevados para Q8_0: ~36 GB solo de pesos, lo que excluye GPUs de consumo de una sola unidad y obliga a multi-GPU o memoria unificada.
- Adopcion nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, sin comunidad que valide su comportamiento.
- Licencia: MIT, heredada del modelo base, permite uso comercial y modificacion, pero conviene conservar la atribucion a ornith-ai por el modelo base.

## Enlaces

- Repositorio HuggingFace de esta cuantizacion: https://huggingface.co/yehors/Ornith-1.5-35B-A3B-Q8_0-MTP-GGUF
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Paper, blog o demo adicionales: no disponible
