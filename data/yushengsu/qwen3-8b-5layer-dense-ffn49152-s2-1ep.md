# yushengsu/Qwen3-8B-5layer-Dense-FFN49152-s2-1ep

## Resumen

Qwen3-8B-5layer-Dense-FFN49152-s2-1ep es un modelo borrador (draft model) para decodificacion especulativa sobre el modelo base Qwen/Qwen3-8B, desarrollado por el usuario yushengsu y entrenado con el framework SpecForge bajo el metodo DSpark. No es un modelo generativo autonomo: su funcion es proponer tokens candidatos que el modelo objetivo (Qwen3-8B) verifica en paralelo, acelerando la inferencia sin alterar la distribucion de salida. Publicado bajo licencia Apache 2.0, se distribuye como complemento del modelo base.

La arquitectura es un transformer denso de 5 capas con FFN de anchura 49152, lo que resulta en 3,39 mil millones de parametros, todos activos en cada token. Se trata de la variante densa del borrador MoE 8x24576 top-2 con la misma anchura activa de FFN por token. Incluye atencion con 32 cabezas de query y 8 de KV (dimension 128) con normalizacion q/k, un proyector fc de 20480 a 4096 sobre las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y tamano de bloque 16.

Su relevancia es practica: permite desplegar aceleracion por decodificacion especulativa sobre Qwen3-8B con SGLang estandar (clase DSPARK), sin necesidad de implementar clases MoE en el servidor. El checkpoint corresponde a un unico epoch de entrenamiento y esta pensado para integrarse en pipelines de inferencia de baja latencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 5 capas, FFN 49152, atencion 32 q / 8 KV heads x 128 con q/k norm, proyector fc 20480->4096, cabeza Markov rango 256 |
| Parametros totales | 3,39 B (todos activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda del modelo base Qwen3-8B) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El borrador es un transformer denso de 5 capas con FFN de anchura 49152, disenado como contrapartida densa del borrador MoE 8x24576 top-2, manteniendo la misma anchura activa de FFN por token (3,39 B parametros activos). La atencion usa 32 cabezas de query y 8 de clave-valor con dimension 128 y normalizacion q/k. Un proyector fc de 20480 a 4096 toma caracteristicas de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B, y una cabeza Markov de rango 256 con tamano de bloque 16 completa el mecanismo de propuesta de tokens.

El entrenamiento se realizo durante un unico epoch con SpecForge (DSpark) sobre prompts regenerados de perfectblend (temperatura 0, modo no-think), contexto de 8192 tokens y plantilla qwen3-instruct sin system prompt. Se uso learning rate 6e-4 con coseno y 4 % de warm-up, 144 muestras por paso de optimizador, 9867 pasos en total, Liger RMSNorm y cuatro nodos GB300 de 4x GPU. El checkpoint final aparece como `1ep/` al terminar el epoch. El modelo se sirve con SGLang DSPARK estandar, sin requerir clase MoE.

## Capacidades

- Decodificacion especulativa: propone tokens candidatos para Qwen3-8B, que los verifica en paralelo para acelerar la generacion.
- Integracion con SGLang: compatible con la implementacion DSPARK estandar, sin clases MoE adicionales.
- Proyector multi-capa: consume caracteristicas de las capas 1, 9, 17, 25 y 33 del modelo objetivo.
- Cabeza Markov de rango 256: modela dependencias entre tokens propuestos dentro de bloques de 16.
- No es un modelo autonomo: no genera texto de forma independiente ni soporta tool calling, agentes o vision.
- Capacidades multilingues: no disponibles de forma independiente; dependen del modelo base Qwen3-8B.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: desplegar el borrador junto al modelo objetivo en SGLang para reducir la latencia por token mediante verificacion especulativa en paralelo.
- Servicio de chat de baja latencia: al proponer bloques de hasta 16 tokens candidatos, disminuye el coste por token generado en conversaciones multi-turno con contexto de hasta 8192 tokens.
- Pipelines de generacion de codigo: al integrarse en el mismo servidor SGLang que Qwen3-8B, acelera tareas de autocompletado y generacion de codigo sin cambiar el modelo de salida.
- Despliegue en infraestructura con GPU GB300 o equivalentes: el entrenamiento se realizo en nodos GB300, por lo que el borrador esta optimizado para ese entorno de servidor.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible (config `qwen3-8b-5layer-dense-49152-dspark.json`, PR de SpecForge) para comparar variantes densas frente a MoE.
- Reduccion de coste en batch de gran volumen: al aumentar el throughput del modelo objetivo, permite atender mas peticiones por GPU en cargas de trabajo de texto.
- Evaluacion de tecnicas de draft modeling: util para medir la tasa de aceptacion de tokens y el speedup frente a otros borradores sobre el mismo Qwen3-8B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 3,39 B parametros, en fp16 rondaria 6,8 GB solo para pesos, y en cuantizacion de 8 bits unos 3,4 GB, sin contar overhead de KV cache ni del modelo objetivo.
- GPU recomendadas: el entrenamiento se realizo en cuatro nodos GB300 (4x GPU por nodo); para servicio se recomienda hardware de clase servidor compatible con SGLang.
- GPU de consumo: no se especifica compatibilidad con RTX 4090 u otras GPU de consumo; al ser un borrador que se sirve junto a Qwen3-8B, el requisito conjunto de VRAM es mayor.
- Opciones de despliegue: SGLang con DSPARK (soporte indicado en la model card); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el beneficio depende de la tasa de aceptacion del borrador, que no se publica.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Funcion |
|---|---|---|---|---|
| Qwen3-8B-5layer-Dense-FFN49152-s2-1ep | 3,39 B (denso) | 8192 | Apache 2.0 | Borrador especulativo denso para Qwen3-8B |
| Borrador MoE 8x24576 top-2 (mismo autor, referenciado) | no disponible | 8192 | no disponible | Borrador especulativo MoE equivalente en anchura activa |
| Qwen/Qwen3-8B | 8 B | no disponible en esta ficha | Apache 2.0 | Modelo objetivo generativo |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo tiene sentido junto a Qwen/Qwen3-8B como modelo objetivo.
- Entrenado con un unico epoch y prompts regenerados a temperatura 0 en modo no-think; puede tener menor cobertura en dominios creativos o modos de razonamiento extendido.
- Contexto de entrenamiento limitado a 8192 tokens; no se documenta extension de contexto.
- Idiomas soportados no especificados; la cobertura linguistica depende del modelo base.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de tasa de aceptacion ni de speedup.
- Requiere SGLang con soporte DSPARK; otras pilas de inferencia no estan validadas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- Riesgo de alucinacion: aunque el modelo objetivo verifica los tokens, una tasa de aceptacion baja degradaria el rendimiento sin mejorar la calidad.
- Sin descargas ni likes en el momento de la ficha: ecosistema de validacion practicamente inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN49152-s2-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codigo SpecForge (PR): https://github.com/yushengsu-thu/SpecForge/pull/22
- Config del borrador: `configs/qwen3-8b-5layer-dense-49152-dspark.json` (en el repositorio de SpecForge)
