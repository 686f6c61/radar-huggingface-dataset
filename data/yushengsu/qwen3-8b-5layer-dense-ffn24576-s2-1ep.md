# yushengsu/Qwen3-8B-5layer-Dense-FFN24576-s2-1ep

## Resumen

Qwen3-8B-5layer-Dense-FFN24576-s2-1ep es un modelo borrador (draft model) para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-8B. Lo desarrolla el usuario yushengsu dentro del proyecto SpecForge, una infraestructura de entrenamiento de drafters para speculative decoding, y se publica bajo licencia Apache 2.0. No es un modelo conversacional autonomo: su funcion es proponer tokens candidatos que el modelo objetivo verifica, acelerando la generacion sin alterar la distribucion de salida.

Se trata de un transformer denso de 5 capas con FFN de anchura 24576, lo que arroja 1,88 mil millones de parametros, todos activos. Es la variante densa del drafter MoE 8x24576 top-1 del mismo autor, con la misma anchura de FFN activa por token. Incorpora atencion con 32 cabezas de query y 8 de KV a dimension 128 con q/k norm, un proyector fc de 20480 a 4096 sobre las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y bloque de 16.

Su relevancia es practica: permite desplegar decodificacion especulativa sobre Qwen3-8B con SGLang DSPARK estandar, sin necesidad de clases MoE, lo que simplifica el stack de inferencia. El checkpoint corresponde a un entrenamiento de una sola epoca y esta pensado para integrarse como artefacto auxiliar en pipelines de serving de alto throughput.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, 5 capas, FFN 24576, con proyector sobre capas 1/9/17/25/33 del objetivo y cabeza Markov |
| Parametros totales | 1,88 B (todos activos) |
| Parametros activos | No aplica (modelo denso; no es MoE) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (checkpoint en `1ep/`; no se especifica safetensors ni GGUF) |

## Arquitectura y entrenamiento

El drafter es un transformer denso de 5 capas con FFN de anchura 24576 y 1,88 B de parametros activos. La atencion usa 32 cabezas de query y 8 de KV con dimension 128 y normalizacion q/k. Se conecta al modelo objetivo Qwen3-8B mediante un proyector fc de 20480 a 4096 que toma representaciones de las capas 1, 9, 17, 25 y 33, y anade una cabeza Markov de rango 256 con bloque de 16 para la prediccion de tokens candidatos. Es la contraparte densa del drafter MoE 8x24576 top-1, con identica anchura de FFN activa por token.

El entrenamiento cubre una sola epoca sobre prompts de perfectblend regenerados (temperatura 0, sin modo thinking), con contexto de 8192, plantilla qwen3-instruct sin system prompt, learning rate 6e-4 con decaimiento coseno y 4 % de warm-up, 144 muestras por paso de optimizador y 9867 pasos totales. Emplea Liger RMSNorm y se ejecuto en cuatro nodos GB300 de 4x GPU. El codigo corresponde al PR 22 de SpecForge y a la configuracion `configs/qwen3-8b-5layer-dense-24576-dspark.json`. El checkpoint se sirve con SGLang DSPARK estandar, sin necesidad de clase MoE.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B.
- Aceleracion de inferencia sin modificar la distribucion del modelo objetivo (verificacion por el target).
- Integracion con SGLang DSPARK sin clases MoE adicionales.
- Prediccion multi-token por bloque de 16 mediante cabeza Markov de rango 256.
- Aprovechamiento de representaciones intermedias del objetivo a traves del proyector sobre cinco capas.
- No es un modelo autonomo: no soporta tool calling, agentes, vision ni audio por si mismo.
- Capacidades multilingues: no disponibles de forma independiente; heredadas del objetivo solo en la medida en que el drafter las aproxime.

## Casos de uso

- Serving de alto throughput de Qwen3-8B: el drafter propone bloques de hasta 16 tokens que el modelo objetivo verifica, reduciendo el numero de pasos de decodificacion en cargas generativas largas.
- Despliegue en SGLang sin clases MoE: al ser denso, se integra con el stack DSPARK estandar, lo que simplifica la configuracion de produccion frente a la variante MoE.
- Reduccion de coste por token en APIs internas: al acelerar la decodificacion sobre Qwen3-8B, baja el coste de GPU por peticion en servicios de generacion de texto.
- Generacion de codigo y texto tecnico: el entrenamiento con prompts sin modo thinking y temperatura 0 favorece la propuesta de continuaciones deterministas en tareas de completado.
- Evaluacion comparativa de drafters: sirve como referencia densa frente al drafter MoE 8x24576 top-1 para medir el impacto de la arquitectura en la tasa de aceptacion.
- Investigacion en decodificacion especulativa: permite reproducir el pipeline de SpecForge y experimentar con proyectores, cabeza Markov y tamano de bloque.
- Prototipado de asistentes con contexto de 8192 tokens: adecuado para conversaciones y documentos de longitud media donde la latencia de decodificacion es critica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 1,88 B de parametros, en FP16 rondaria los 3,8 GB de pesos, y en cuantizaciones de 8 o 4 bits seria inferior, aunque no se documentan formatos.
- GPU recomendadas: no especificadas; el entrenamiento se realizo en nodos GB300 de 4x GPU, lo que no implica requisitos equivalentes para inferencia.
- Cabe en GPU de consumo: previsiblemente si por tamano de pesos, pero no hay datos oficiales de compatibilidad ni de cuantizaciones soportadas.
- Opciones de despliegue: SGLang DSPARK (soporte declarado por el autor); otros motores no se mencionan.
- Latencia y throughput: no disponibles; dependen del modelo objetivo, del hardware y de la tasa de aceptacion del drafter.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-Dense-FFN24576-s2-1ep | 1,88 B (denso) | 8192 | Drafter denso | Apache 2.0 | Variante densa del MoE 8x24576 top-1; SGLang DSPARK sin clase MoE |
| Drafter MoE 8x24576 top-1 (mismo autor) | No disponible | 8192 | Drafter MoE | Apache 2.0 | Misma anchura de FFN activa por token; requiere clase MoE |
| Qwen/Qwen3-8B (objetivo) | 8 B | No disponible en la informacion | Modelo generativo | Apache 2.0 | Modelo verificado por el drafter; no es comparable en funcion |

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo objetivo Qwen3-8B no genera respuestas utiles; su salida debe verificarse.
- Entrenado con una sola epoca y prompts sin modo thinking a temperatura 0; el comportamiento fuera de ese regimen no esta documentado.
- Contexto de entrenamiento limitado a 8192 tokens; no se garantiza rendimiento mas alla de esa longitud.
- Sin datos publicados de benchmarks, tasa de aceptacion ni speedup medido; el rendimiento real en produccion es desconocido.
- Idiomas soportados no declarados; el comportamiento multilingue depende de la aproximacion al objetivo.
- Sin informacion sobre cuantizaciones ni formato de pesos; la integracion en motores distintos de SGLang DSPARK no esta validada.
- Riesgo de sesgos y alucinaciones heredado del modelo objetivo y de los prompts de entrenamiento; no se documentan evaluaciones de seguridad.
- Licencia Apache 2.0 permite uso comercial, pero el despliegue debe cumplir tambien la licencia del modelo base Qwen3-8B.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN24576-s2-1ep
- Codigo SpecForge (PR 22): https://github.com/yushengsu-thu/SpecForge/pull/22
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
