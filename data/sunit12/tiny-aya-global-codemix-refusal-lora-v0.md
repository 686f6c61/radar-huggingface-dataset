# sunit12/tiny-aya-global-codemix-refusal-lora-v0

## Resumen

`sunit12/tiny-aya-global-codemix-refusal-lora-v0` es un adaptador LoRA (PEFT) publicado por el usuario `sunit12` sobre el modelo base `CohereLabs/tiny-aya-global`. Se trata de un ajuste fino supervisado (SFT) orientado, a juzgar por el nombre del repositorio, a dos comportamientos concretos: el manejo de *code-mixing* (alternancia de idiomas dentro de una misma conversacion) y la *refusal* o rechazo controlado de peticiones. El adaptador se distribuye en formato safetensors y GGUF, con un total de 30.228.480 parametros en el checkpoint, y esta pensado para cargarse sobre el modelo base mediante la libreria `peft`.

La relevancia de esta publicacion es limitada pero acotada: no es un modelo fundacional ni un lanzamiento de laboratorio, sino un adaptador comunitario de bajo perfil (0 descargas, 0 likes en el momento de la consulta, creado el 14 de noviembre de 2026). Su interes tecnico reside en que ejemplifica un patron de ajuste muy comun hoy en dia: tomar un modelo pequeno multilingue de Cohere y especializarlo con LoRA para un comportamiento conversacional especifico sin reentrenar los pesos completos.

La model card esta practicamente vacia: todos los campos relevantes (desarrollador, licencia, idiomas, datos de entrenamiento, hiperparametros, evaluacion) aparecen como `[More Information Needed]`. Por tanto, esta ficha debe leerse como una descripcion de lo que se puede verificar a partir de los metadatos del repositorio, no de lo que el autor documenta, porque no documenta nada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `CohereLabs/tiny-aya-global` |
| Parametros totales | 30.228.480 (checkpoint del adaptador, safetensors) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors (adaptador) y GGUF (publicado en el repo) |
| Idiomas soportados | no disponibles (el nombre sugiere cobertura multilingue y code-mixing) |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con `trl` y `peft` (framework PEFT 0.21.3) sobre el modelo base `CohereLabs/tiny-aya-global`. No se reentrena el transformer completo: se anaden matrices de bajo rango en las proyecciones del modelo base y se optimizan unicamente esos parametros, lo que explica el tamano reducido del checkpoint (30,2 M de parametros, 0,2 GB de repositorio). La carga requiere descargar el modelo base por separado y aplicar el adaptador encima.

No hay informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos, la precision usada (fp16, bf16, fp32) ni si hubo etapas de RLHF o DPO. El tag `sft` indica ajuste supervisado clasico, y el nombre del repositorio sugiere que el dataset combina ejemplos de *code-mixing* con ejemplos de rechazo (*refusal*). No se documenta ninguna innovacion arquitectonica adicional: no hay decodificacion especulativa, atencion lineal ni mecanismos hifridos propios de este adaptador. Cualquier caracteristica de ese tipo provendria del modelo base `tiny-aya-global`, cuyas especificaciones no se detallan en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en el formato del modelo base `tiny-aya-global`.
- Manejo de *code-mixing*: el nombre del adaptador sugiere entrenamiento especifico para alternar idiomas dentro de una misma conversacion, aunque no se documenta que pares de idiomas ni con que datos.
- Comportamiento de rechazo (*refusal*): se infiere del nombre que el adaptador modula las respuestas de negativa ante peticiones consideradas fuera de alcance, pero no hay evaluacion publicada del comportamiento resultante.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base pertenece a la familia Aya, orientada a cobertura multilingue, pero no se especifica que idiomas cubre este adaptador.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- **Prototipado de asistentes multilingues con code-mixing**: cargar el adaptador sobre `tiny-aya-global` para experimentar con conversaciones donde el usuario alterna idiomas; el adaptador esta entrenado especificamente para ese patron, aunque sin evaluacion publica que lo respalde.
- **Investigacion sobre refusal y alineamiento**: usar el adaptador como punto de partida para estudiar como un ajuste LoRA modifica las tasas de rechazo de un modelo pequeno, comparando respuestas con y sin adaptador sobre el mismo prompt set.
- **Ajuste fino de bajo coste en hardware modesto**: al ser un adaptador de 30 M de parametros sobre un modelo pequeno, permite iterar en una unica GPU consumer, util para equipos con presupuesto limitado que quieran reproducir el pipeline `peft` + `trl`.
- **Generacion de datos sinteticos controlados**: emplear el comportamiento de rechazo para filtrar o etiquetar respuestas en pipelines de curacion de datasets conversacionales.
- **Pruebas de regresion de infraestructura PEFT**: servir como caso de prueba para validar flujos de carga de adaptadores en safetensors y GGUF en entornos de despliegue (por ejemplo, `transformers` + `peft` o `llama.cpp` con el GGUF).
- **Evaluacion comparativa de adaptadores comunitarios**: incluirlo como baseline en estudios que midan la degradacion o mejora de un modelo base al aplicar adaptadores de terceros sin documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; el consumo dependera del modelo base `tiny-aya-global`, cuyas especificaciones no se detallan. El checkpoint del adaptador ocupa 0,2 GB en disco.
- GPU recomendadas: no disponible. Por el tamano del adaptador (30 M de parametros) y la naturaleza "tiny" del modelo base, es razonable esperar que quepa en GPU consumer, pero no hay dato verificado que lo confirme.
- Compatibilidad con GPU consumer: no confirmada; depende del modelo base.
- Opciones de despliegue: carga mediante `transformers` + `peft` (libreria declarada); el repositorio incluye pesos GGUF, lo que sugiere compatibilidad con `llama.cpp` u Ollama, aunque no se documenta el procedimiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| `sunit12/tiny-aya-global-codemix-refusal-lora-v0` | 30,2 M (adaptador LoRA) | no disponible | no disponible | safetensors, GGUF | Ajuste SFT sobre `tiny-aya-global`; sin benchmarks ni model card |
| `CohereLabs/tiny-aya-global` (modelo base) | no disponible en la informacion | no disponible | no disponible | no disponible | Modelo fundacional de la familia Aya de Cohere; referencia obligada para usar el adaptador |
| Otros adaptadores LoRA comunitarios sobre modelos Aya | variable | variable | variable | safetensors, GGUF | Categoria generica; no se dispone de datos concretos de alternativas comparables en la informacion proporcionada |

No se dispone de datos verificados de benchmarks ni de especificaciones del modelo base que permitan una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- La model card esta vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni uso previsto. Cualquier uso en produccion sin evaluacion propia es arriesgado.
- Licencia no declarada: no se puede asumir uso comercial permitido. Es imprescindible verificar la licencia del modelo base `CohereLabs/tiny-aya-global` antes de cualquier despliegue.
- Riesgo de alucinacion: inherente a los modelos de generacion de texto; no hay evaluacion especifica para este adaptador.
- Sesgos: no documentados. El ajuste en *code-mixing* y *refusal* puede introducir sesgos hacia ciertos idiomas o hacia un exceso de rechazos en peticiones legitimas.
- El comportamiento de rechazo puede ser demasiado agresivo o demasiado laxo segun el dataset de SFT, sin que exista una evaluacion publica que lo cuantifique.
- Cobertura de idiomas desconocida: el nombre sugiere multilingue, pero no se especifica que idiomas ni en que proporcion.
- Repositorio sin traccion (0 descargas, 0 likes) y sin mantenimiento documentado: no hay garantia de soporte ni de actualizaciones.
- Al ser un adaptador, requiere cargar el modelo base; el rendimiento final depende de este ultimo, no solo del adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sunit12/tiny-aya-global-codemix-refusal-lora-v0
- Modelo base: https://huggingface.co/CohereLabs/tiny-aya-global
- Paper citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact#compute
