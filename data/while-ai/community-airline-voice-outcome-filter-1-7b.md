# while-ai/community-airline-voice-outcome-filter-1.7b

## Resumen

El modelo `while-ai/community-airline-voice-outcome-filter-1.7b` es un adaptador LoRA (PEFT) entrenado con GRPO sobre el modelo base `Qwen/Qwen3-1.7B`. Lo publica la organizacion while-ai dentro de su coleccion de "runs de curso y comunidad", y no es un modelo de produccion: es el artefacto reproducible de un experimento de investigacion sobre filtrado de grupos en GRPO. En concreto, traslada a un dominio de agente de aerolinea (registro de voz conciso) un cambio metodologico descrito en un paper sobre metricas de filtrado, que originalmente se evaluaba en GSM8K.

El experimento compara dos variantes: una linea base que descarta los grupos con puntuacion uniforme segun una recompensa modelada (shaped reward), y un metodo que los descarta segun el resultado binario. El repositorio incluye la rama principal (`method`), la rama `baseline` y una carpeta `eval/` con las filas de evaluacion de base, baseline y metodo.

Su relevancia es metodologica, no de rendimiento: segun la propia model card, ninguna de las comparaciones arroja una mejora medible sobre el modelo base. El metodo descarta el 77,5 % de los grupos frente al 6,2 % de la linea base, mejora `covered_all` en +0,090 y la recompensa de entrenamiento en +0,064, pero no mueve la metrica objetivo, y en las filas sondeadas el objetivo cae -0,058. El coste declarado de entrenamiento es de unos 73 minutos de GPU en H100.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre un transformer decoder-only (modelo base Qwen/Qwen3-1.7B) |
| Parametros totales | 1,7 B en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; la hereda del modelo base Qwen/Qwen3-1.7B |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en precision completa y puede fusionarse con el modelo base para cuantizarlo despues |
| Idiomas soportados | no disponible; el adaptador se entrena sobre filas de un dominio concreto (agente de aerolinea) y el modelo base Qwen3 es multilingue |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,3 GB |
| Dataset de entrenamiento | while-ai/airline-voice-concise |
| Metodo de ajuste | GRPO con recompensa modelada y filtrado de grupos |
| Libreria | peft |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA sobre Qwen3-1.7B, un transformer decoder-only denso de 1,7 mil millones de parametros. No se modifica la arquitectura del modelo base: el ajuste se aplica como adaptadores de bajo rango cargados con `peft.PeftModel`, y el repositorio raiz contiene la rama `method`, mientras que `baseline/` aloja la linea base y `eval/` las filas de evaluacion de las tres variantes (base, baseline y method). Los checkpoints intermedios no se publican.

El entrenamiento usa GRPO con una recompensa modelada (shaped reward) sobre las filas del dataset `while-ai/airline-voice-concise`, en el registro linguistico de un agente de aerolinea. La variable experimental es el criterio de filtrado de grupos: la linea base descarta los grupos cuyo score modelado es uniforme, y el metodo los descarta segun el resultado binario. Como resultado del filtrado mas agresivo, el metodo elimina el 77,5 % de los grupos frente al 6,2 % de la linea base, eleva `covered_all` en +0,090 y la recompensa de entrenamiento en +0,064, pero la metrica objetivo no mejora. El coste declarado es de aproximadamente 73 minutos de GPU en H100. La receta incluye la semilla, las versiones de libreria y la GPU fijadas, y se reproduce con `python run.py` desde el repositorio del SDK.

## Capacidades

- Generacion de texto conversacional en un registro concreto: respuestas de agente de aerolinea en estilo conciso, que es el dominio sobre el que se entrena el adaptador.
- Ajuste de estilo y registro: el adaptador modula la formulacion de respuestas del modelo base, no sus conocimientos subyacentes.
- Carga y conmutacion de variantes: permite cargar la rama `method` o la rama `baseline` desde el mismo repositorio mediante el parametro `subfolder` de `PeftModel.from_pretrained`.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado; el modelo se evalua sobre filas de un agente de aerolinea, pero la model card no describe capacidades agenticas propias.
- Capacidades multilingues: no documentadas para el adaptador; dependen del modelo base Qwen3.
- Capacidad especial de modo pensamiento (thinking): no documentada en la informacion disponible.
- Vision o audio: no disponibles; el modelo es exclusivamente de generacion de texto.

## Casos de uso

- Replicacion de experimentos de RL: cargar la rama `method` y la rama `baseline`, ejecutar `python run.py` con la semilla fijada y verificar las tablas de deltas. Es el uso principal del artefacto, ya que la receta fija semilla, versiones de libreria y GPU.
- Estudio del filtrado de grupos en GRPO: comparar el descarte por recompensa modelada frente al descarte por resultado binario, midiendo la tasa de grupos descartados (6,2 % frente a 77,5 %) y su efecto sobre `covered_all`.
- Analisis de sobreoptimizacion: la propia model card senala que el metodo aparece "sobre-optimizado" (mejora la recompensa de entrenamiento en +0,064 sin mover el objetivo), lo que lo convierte en un caso de estudio util sobre desalineacion entre recompensa y metrica.
- Ajuste de tono en asistentes de atencion al cliente: punto de partida para adaptar un modelo de 1,7 B a un registro conciso y acotado en dominios de servicio, con la ventaja de que el adaptador pesa pocos cientos de MB.
- Generacion de respuestas de referencia para evaluacion: usar las filas de `eval/` y las salidas de las tres variantes para construir conjuntos de comparacion en juicios humanos o automaticos.
- Pruebas de infraestructura de despliegue con LoRA: validar pipelines de vLLM, TGI o PEFT multi-adaptador con un adaptador real de bajo coste (inferencia viable en GPU de consumo).
- Docencia y formacion en RLHF/GRPO: el repositorio separa de forma explicita la receta, las ramas y las filas de evaluacion, lo que facilita usarlo como ejemplo didactico de diseno experimental.
- Investigacion sobre metrica de filtrado fuera de dominios matematicos: demuestra la transferencia del cambio metodologico desde GSM8K al registro de un agente de aerolinea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card unicamente reporta los deltas del experimento frente al modelo base, con intervalos de confianza:

| Comparacion | Delta objetivo | Veredicto |
|---|---|---|
| baseline vs base | +0,029 [-0,004, +0,063] | plano (ruido < 0,142) |
| method vs base | +0,023 [-0,011, +0,058] | plano y sobre-optimizado |
| method vs baseline | -0,005 [-0,041, +0,029] | plano, sin diferencia |

Metricas adicionales del entrenamiento declaradas en la model card:

| Metrica | Valor |
|---|---|
| Grupos descartados por el metodo | 77,5 % |
| Grupos descartados por la linea base | 6,2 % |
| Cambio en `covered_all` (metodo) | +0,090 |
| Cambio en recompensa de entrenamiento (metodo) | +0,064 |
| Delta objetivo en filas sondeadas | -0,058 [-0,108, -0,017] |
| Coste de entrenamiento | ~73 minutos de GPU en H100 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1,7 B ocupa aproximadamente 3,4 GB en fp16 y alrededor de 1,1-1,2 GB en cuantizacion de 4 bits; el adaptador anade un coste marginal una vez fusionado.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM es suficiente en fp16; H100, A100 o L40S quedan sobredimensionadas para inferencia, aunque la receta de entrenamiento se ejecuto en H100.
- Cabe en GPU de consumo: si, en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080 y RTX 4090; en 4 bits es viable incluso en GPUs de 6-8 GB.
- Opciones de despliegue: `transformers` + `peft` (via `PeftModel.from_pretrained`, con soporte de `subfolder` para elegir rama), vLLM con soporte de adaptadores LoRA y TGI. Para llama.cpp u Ollama es necesario fusionar el adaptador con el modelo base y convertir los pesos a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. El unico dato de tiempo reportado es el coste de entrenamiento de unos 73 minutos en H100.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| community-airline-voice-outcome-filter-1.7b (adaptador LoRA) | 1,7 B (base) + adaptador | no disponible | Sin mejora medible sobre el base en el objetivo del experimento | apache-2.0 | HuggingFace, 0 descargas y 0 likes en el momento de la consulta |
| Qwen/Qwen3-1.7B (base) | 1,7 B | no disponible en la informacion proporcionada | Referencia del experimento, no se reportan benchmarks estandar | apache-2.0 | HuggingFace |
| Otros adaptadores LoRA de la coleccion "Course and community runs" de while-ai | Variable, segun el modelo base de cada receta | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas densas de ~1-2 B de otros proveedores | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados en la informacion proporcionada para comparar con modelos de otras familias. Cualquier comparacion con alternativas de tamano similar deberia hacerse contra las fichas oficiales de cada modelo base.

## Limitaciones y advertencias

- No es un modelo listo para produccion: es un artefacto de investigacion que reproduce un experimento fallido, ya que ninguna comparacion muestra mejora medible sobre el modelo base.
- La metrica objetivo empeora en las filas sondeadas (-0,058 [-0,108, -0,017]), lo que sugiere sobreoptimizacion de la recompensa de entrenamiento frente al objetivo real.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre un dataset de dominio especifico (registro de voz de aerolinea), puede heredar los sesgos de ese corpus y del modelo base Qwen3.
- Riesgo de alucinacion: no documentado de forma especifica; el modelo base Qwen3-1.7B, por su tamano reducido, es propenso a errores factuales.
- Limitaciones de contexto e idioma: la model card no especifica longitud de contexto, idiomas soportados ni composicion linguistica del dataset de entrenamiento.
- Restricciones de licencia: apache-2.0, por lo que el uso comercial esta permitido tanto en el adaptador como en el modelo base; conviene verificar igualmente los terminos del dataset `while-ai/airline-voice-concise`.
- Advertencia de uso: la model card pide explicitamente leer la seccion "Learned" de la receta antes de citar cualquier numero de la ficha.
- Los resultados se obtuvieron con semilla, versiones de libreria y GPU fijadas; reproducirlos en otro entorno puede dar intervalos distintos.
- Los checkpoints intermedios no se publican, lo que limita la inspeccion del proceso de entrenamiento.
- Se han de fusionar los pesos y convertirlos para usar el modelo en runtimes que no soporten LoRA (llama.cpp, Ollama), con la perdida de precision que ello implique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/community-airline-voice-outcome-filter-1.7b
- Modelo base Qwen/Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento: https://huggingface.co/datasets/while-ai/airline-voice-concise
- Receta en el repositorio whileai-sdk: https://github.com/whilehq/whileai-sdk/tree/main/recipes/community/airline-voice-concise-under-probe-outcome-filter
- Coleccion "Course and community runs": https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
- La busqueda web realizada no devolvio resultados tecnicos relevantes sobre este modelo: los unicos resultados obtenidos fueron paginas de traduccion del termino "while" (Linguee, WordReference, Reverso, Larousse) y el articulo de Wikipedia sobre la estructura de control "while", ninguno relacionado con el modelo.
