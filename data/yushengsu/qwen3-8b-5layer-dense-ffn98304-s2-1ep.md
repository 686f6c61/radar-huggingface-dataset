# yushengsu/Qwen3-8B-5layer-Dense-FFN98304-s2-1ep

## Resumen

Qwen3-8B-5layer-Dense-FFN98304-s2-1ep es un modelo borrador (draft model) para decodificacion especulativa sobre Qwen/Qwen3-8B, desarrollado por el usuario yushengsu y entrenado con el framework SpecForge en su variante DSpark. No es un modelo conversacional autonomo: su funcion es proponer tokens candidatos que el modelo objetivo Qwen3-8B verifica en paralelo, acelerando la generacion sin alterar la distribucion de salida del modelo grande.

El borrador es un transformer denso de 5 capas con FFN de anchura 98304, lo que arroja 6,41 mil millones de parametros, todos activos en cada token. Se trata de la contraparte densa de un borrador MoE de 8 expertos x 24576 con top-4 (misma anchura activa de FFN por token). Incorpora atencion con 32 cabezas de consulta y 8 de clave/valor de dimension 128 con normalizacion q/k, un proyector fc de 20480 a 4096 que toma caracteristicas de las capas 1, 9, 17, 25 y 33 del modelo objetivo, una cabeza Markov de rango 256 y bloques de 16 tokens.

Su relevancia es practica: permite reducir la latencia de inferencia de Qwen3-8B en despliegues con SGLang, ya que se sirve con el soporte DSPARK estandar sin necesidad de clases MoE adicionales. Esta publicado bajo licencia Apache 2.0 y es compatible con el ecosistema de Qwen3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas (draft model para decodificacion especulativa), atencion 32 q / 8 KV heads x 128 con q/k norm, proyector fc 20480->4096, cabeza Markov de rango 256 |
| Parametros totales | 6,41 mil millones (todos activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un borrador denso de 5 capas disenado para decodificacion especulativa. La FFN tiene una anchura de 98304, lo que concentra la mayor parte de los 6,41 mil millones de parametros. La atencion usa 32 cabezas de consulta y 8 de clave/valor de dimension 128, con normalizacion en q y k. El proyector fc transforma caracteristicas de dimension 20480 a 4096, tomadas de las capas 1, 9, 17, 25 y 33 del modelo objetivo Qwen3-8B. La cabeza Markov tiene rango 256 y se emplea con bloques de 16 tokens, en linea con el esquema DSpark de SpecForge.

El entrenamiento se realizo durante 1 epoca sobre prompts de "perfectblend regen" (temperatura 0, sin modo thinking), con contexto de 8192 tokens y la plantilla qwen3-instruct sin prompt de sistema. Se uso tasa de aprendizaje 6e-4 con decaimiento coseno a lo largo de la unica epoca y un 4 % de warm-up, 144 muestras por paso de optimizador y 9 867 pasos totales. Se aplico Liger RMSNorm y el entrenamiento corrio sobre cuatro nodos GB300 con 4x GPUs cada uno. El codigo corresponde al PR 22 del repositorio SpecForge de yushengsu-thu y a la configuracion `configs/qwen3-8b-5layer-dense-98304-dspark.json`; el checkpoint aparece como `1ep/` al finalizar la epoca.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen3-8B.
- Aceleracion de inferencia sin modificar la distribucion de salida del modelo objetivo (verificacion por el modelo grande).
- Integracion directa con SGLang mediante el soporte DSPARK estandar, sin necesidad de clases MoE.
- Soporte de bloques de 16 tokens por paso especulativo.
- No es un modelo conversacional: no esta pensado para usarse de forma autonoma.
- Capacidades multilingues, de codigo o de razonamiento: heredadas del modelo objetivo, no evaluadas de forma independiente en la informacion disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el borrador propone tokens que Qwen3-8B verifica, reduciendo la latencia por token en despliegues con SGLang y el stack DSPARK.
- Servicio de chat de baja latencia: al disminuir el tiempo por token, mejora la experiencia en conversaciones multi-turno con contexto de hasta 8192 tokens.
- Generacion de codigo interactiva: la reduccion de latencia beneficia a asistentes de autocompletado y edicion de codigo que requieren respuestas rapidas.
- Despliegue en infraestructura con SGLang: al no requerir clases MoE adicionales, simplifica la configuracion del servidor y el mantenimiento del pipeline.
- Investigacion en decodificacion especulativa: sirve como referencia reproducible de un borrador denso con la misma anchura activa de FFN que una variante MoE, util para comparar estrategias.
- Evaluacion de trade-offs densidad vs. MoE: permite medir el impacto en la tasa de aceptacion y en el throughput frente al borrador MoE 8 x 24576 top-4.
- Benchmarking de frameworks de serving: util para validar el rendimiento de SGLang DSPARK en hardware Blackwell (GB300).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 6,41 mil millones de parametros, en FP16 requeriria aproximadamente 12,8 GB solo para pesos, y en cuantizaciones de 8 bits o 4 bits seria considerablemente menor, aunque no se confirman formatos soportados.
- GPU recomendadas: el entrenamiento se realizo en nodos GB300; para inferencia no se especifican modelos concretos.
- Cabe en GPU de consumo: no confirmado; por tamano, seria plausible en GPUs con 16 GB o mas en cuantizacion, pero no hay datos oficiales.
- Opciones de despliegue: SGLang con soporte DSPARK (opcion indicada por el autor); otros frameworks no disponibles.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-8B-5layer-Dense-FFN98304-s2-1ep | 6,41 B (denso) | 8192 (entrenamiento) | Draft denso para decodificacion especulativa | Apache 2.0 | Hugging Face |
| Borrador MoE 8 x 24576 top-4 (misma familia) | No disponible | No disponible | Draft MoE, misma anchura activa de FFN | No disponible | Referenciado en la model card |
| Qwen/Qwen3-8B (modelo objetivo) | 8 B | No disponible | Modelo base conversacional | No disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: solo tiene sentido como borrador en un pipeline de decodificacion especulativa con Qwen3-8B como modelo objetivo.
- El contexto de entrenamiento es de 8192 tokens; no se garantiza un comportamiento correcto mas alla de esa longitud.
- No hay informacion sobre sesgos, alucinacion o calidad linguistica del borrador de forma independiente.
- La tasa de aceptacion de tokens y el beneficio real de latencia dependen de la carga, el hardware y la configuracion de SGLang; no se han publicado mediciones.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-8B y del framework SpecForge.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: sin validacion comunitaria ni evidencia de uso en produccion.
- No se especifican formatos de pesos ni cuantizaciones soportadas, lo que limita la planificacion de despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-s2-1ep
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Codigo (PR de SpecForge): https://github.com/yushengsu-thu/SpecForge/pull/22
- Configuracion del borrador: `configs/qwen3-8b-5layer-dense-98304-dspark.json` (en el repositorio SpecForge)
