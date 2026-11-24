# yushengsu/Qwen3-8B-5layer-Dense-FFN3072-jw-4ep

## Resumen

Qwen3-8B-5layer-Dense-FFN3072-jw-4ep es un modelo borrador (draft model) para decodificacion especulativa sobre el modelo objetivo Qwen/Qwen3-8B. Lo publica el usuario yushengsu en Hugging Face y se entrena con SpecForge en su variante DSpark. No es un modelo conversacional autonomo: su funcion es proponer tokens candidatos que el modelo grande verifica, acelerando la inferencia sin alterar la distribucion de salida del modelo objetivo.

La arquitectura es un transformer denso de 5 capas con atencion de 32 cabezas de consulta y 8 cabezas KV (dimensión 128), un proyector fc de 20480 a 4096 sobre las capas 1/9/17/25/33 del modelo objetivo, una cabeza Markov de rango 256 y bloques de 16 tokens. La unica diferencia respecto al draft publicado por jiapingW (FFN 12288) es que reduce el tamano intermedio de la FFN a 3072, es decir, a un cuarto, lo que baja el total de aproximadamente 1,13 B a unos 0,56 B de parametros, todos activos.

Su relevancia es practica: al ser un draft mas pequeno con la misma receta de entrenamiento, reduce el coste de memoria y de computo por paso de verificacion especulativa, manteniendo la compatibilidad con el servidor SGLang DSPARK estandar. La licencia Apache 2.0 y el hecho de que se sirva con infraestructura sin modificaciones lo hacen directamente desplegable en pipelines que ya usen Qwen3-8B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de 5 capas, draft para decodificacion especulativa (DSpark/SpecForge), atencion 32 q / 8 KV heads x 128, proyector fc 20480->4096, cabeza Markov rango 256, bloque 16 |
| Parametros totales | Aproximadamente 0,56 B (todos activos) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 8192 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

El modelo es un draft denso de 5 capas pensado para decodificacion especulativa. Reutiliza la configuracion del draft de jiapingW (jiapingW/Qwen3-8b-dspark-SpecForge) con una unica modificacion: el tamano intermedio de la FFN pasa de 12288 a 3072 (1/4), reduciendo el total de parametros de aproximadamente 1,13 B a unos 0,56 B. Mantiene la atencion de 32 cabezas de consulta y 8 KV de dimension 128, el proyector fc de 20480 a 4096 sobre las capas 1/9/17/25/33 del objetivo, la cabeza Markov de rango 256 y bloques de 16 tokens, sin cabeza de confianza.

El entrenamiento sigue el launch.yaml de jiapingW: prompts de perfectblend regenerados con temperatura 0 y sin modo think, contexto de 8192, plantilla qwen3-instruct sin system prompt, funcion de perdida DSpark con 0,1 de entropia cruzada y 0,9 de L1, 512 anchors, loss_decay_gamma 7, AdamW con lr 6e-4 y cosine con 4 % de warm-up, max_grad_norm 1, Liger y semilla 42. El lote global es de 144 muestras por paso de optimizador (16 rangos x 3 x 3), con 9867 pasos por epoca y 4 epocas (39 456 pasos en total, cosine hasta 0). El entrenamiento se ejecuto en cuatro nodos de 4x GB300 (run `qwen3-8b-5layer-dense3072-jw144-4ep`), encolado tras el hermano FFN-98304. El codigo se corresponde con el PR 22 del repositorio SpecForge de yushengsu (sin cambios) mas el fichero de configuracion `configs/qwen3-8b-5layer-dense-3072-dspark.json`.

## Capacidades

- Generacion de tokens candidatos para decodificacion especulativa sobre Qwen/Qwen3-8B.
- Aceleracion de inferencia del modelo objetivo sin modificar su distribucion de salida (verificacion por el modelo grande).
- Integracion con SGLang DSPARK estandar sin parches en el servidor.
- Compatibilidad con la plantilla qwen3-instruct sin system prompt durante el entrenamiento.
- No es un modelo conversacional autonomo: no se documentan capacidades de razonamiento, codigo, matematicas, vision, tool calling ni agentes.
- Multilingue: no disponible.

## Casos de uso

- Aceleracion de inferencia de Qwen3-8B en produccion: el draft propone bloques de hasta 16 tokens que el modelo objetivo verifica en paralelo, reduciendo el coste por token generado en cargas de generacion de texto largas.
- Despliegue en servidores con SGLang DSPARK: al ser compatible con el servidor estandar, se puede activar como draft en un endpoint existente de Qwen3-8B sin cambios de infraestructura.
- Reduccion de VRAM en nodos con Qwen3-8B: con aproximadamente 0,56 B de parametros, el draft ocupa menos memoria que el draft de 1,13 B, lo que deja mas espacio para el modelo objetivo o para mayor tamano de lote.
- Servicio de chat de baja latencia: la decodificacion especulativa reduce el tiempo entre tokens en respuestas multi-turno, util en asistentes interactivos donde la latencia percibida es critica.
- Generacion de codigo asistida: para completar codigo en IDE o pipelines de CI/CD, la aceleracion del draft permite servir Qwen3-8B con mayor throughput sin cambiar el modelo de calidad.
- Experimentacion en investigacion sobre decodificacion especulativa: sirve como punto de comparacion frente al draft de FFN 12288 y al de FFN 98304 para medir la relacion entre tamano del draft y tasa de aceptacion.
- Evaluacion de recetas de entrenamiento: los checkpoints por epoca (1ep, 2ep, 3ep, 4ep y 3.5ep) permiten estudiar el efecto del numero de epocas en la calidad del draft.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 0,56 B de parametros, los pesos en precision de entrenamiento rondan 1,1 GB y en cuantizacion de 8 bits aproximadamente 0,6 GB, sin contar activaciones ni cache KV.
- GPU recomendadas: el entrenamiento se realizo en cuatro nodos de 4x GB300; para inferencia como draft se puede usar la misma GPU que sirve Qwen3-8B.
- Cabe en GPU de consumo: si, en principio cabe en cualquier GPU consumer moderna por el reducido tamano del draft, aunque el modelo objetivo Qwen3-8B condiciona el requisito total.
- Opciones de despliegue: SGLang con DSPARK (servidor estandar, sin parches); otras opciones no disponibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | FFN intermedio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yushengsu/Qwen3-8B-5layer-Dense-FFN3072-jw-4ep | Aproximadamente 0,56 B (denso) | 8192 | 3072 | Apache 2.0 | Hugging Face |
| jiapingW/Qwen3-8b-dspark-SpecForge | Aproximadamente 1,13 B (denso) | No disponible | 12288 | No disponible | Hugging Face |
| yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep | No disponible | No disponible | 98304 | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- No es un modelo autonomo: solo tiene sentido como draft para decodificacion especulativa sobre Qwen/Qwen3-8B; usarlo de forma independiente produce salidas sin garantia de calidad.
- La tasa de aceptacion del draft no se ha publicado, por lo que no se puede cuantificar la aceleracion real frente al draft de FFN 12288.
- Los idiomas soportados no estan documentados; el entrenamiento usa prompts de perfectblend y la plantilla qwen3-instruct, pero no se detalla la composicion linguistica.
- No se documentan sesgos, riesgos de alucinacion ni evaluaciones de seguridad del draft; al heredar el comportamiento del modelo objetivo, los sesgos de Qwen3-8B se trasladan al resultado final.
- El contexto de entrenamiento es de 8192 tokens; no se especifica si el draft soporta ventanas mayores.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3-8B, que pueden diferir.
- Modelo con 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion externa.
- La fecha de creacion indicada (2026-11-24) es futura respecto a la redaccion habitual de fichas; conviene confirmar la vigencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN3072-jw-4ep
- Draft de referencia de jiapingW: https://huggingface.co/jiapingW/Qwen3-8b-dspark-SpecForge
- Hermano FFN-98304: https://huggingface.co/yushengsu/Qwen3-8B-5layer-Dense-FFN98304-jw-4ep
- Codigo (PR 22 de SpecForge): https://github.com/yushengsu-thu/SpecForge/pull/22
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
