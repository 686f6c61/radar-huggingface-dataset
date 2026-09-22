# while-ai/community-loss-mask-1.5b

## Resumen

`community-loss-mask-1.5b` es un adaptador LoRA publicado por la organización while-ai sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. No es un modelo de propósito general, sino el artefacto de un experimento controlado: un SFT con dos brazos idénticos salvo en el tratamiento de la máscara de pérdida (`loss_mask`) del fichero de exportación. El brazo raíz del repositorio (`mask_honored`) aplica la máscara y supervisa únicamente los turnos del asistente (5.168 de 46.480 tokens, es decir, el 11,1 %), mientras que el subdirectorio `as_exported` reproduce el comportamiento por defecto de TRL y supervisa los 46.480 tokens.

La pregunta que responde el experimento es concreta: qué hace TRL con el `loss_mask` de un export y qué cambia si se honra explícitamente. La hipótesis preregistrada era que el brazo sin máscara filtraría texto no perteneciente al asistente; el resultado publicado indica que ese criterio primario no se movió (fuga de 0,000 en ambos brazos), pero sí lo hizo la longitud de las respuestas, con una diferencia pareada de +41,6 caracteres [+21,0; +63,7] a favor del brazo con máscara.

Por su naturaleza, es un adaptador de interés para ingeniería de pipelines de fine-tuning y para reproducibilidad de experimentos con TRL, no una pieza para desplegar en producción sin evaluación adicional. El repositorio no registra descargas ni likes, y la model card remite al README de la receta para el detalle de semillas, versiones de librerías y GPU utilizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder denso (Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1,54 B en el modelo base Qwen2.5-1.5B-Instruct; recuento exacto del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 32.768 tokens heredados del modelo base; no verificado en este adaptador |
| Tipos de cuantizacion | No disponible para el adaptador; se aplica al modelo base tras fusionar (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No declarados en la model card; el base Qwen2.5-1.5B-Instruct declara soporte multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA en formato PEFT) |
| Libreria de carga | peft (con transformers) |
| Modelo base | Qwen/Qwen2.5-1.5B-Instruct |
| Brazos incluidos | `mask_honored` (raiz) y `as_exported` (subcarpeta) |
| Tarea | text-generation (SFT) |
| Fecha de creacion | 22 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador se entrena mediante SFT de bajo rango (LoRA) sobre Qwen2.5-1.5B-Instruct, un transformer decoder denso de la familia Qwen2.5. El interés técnico no está en el adaptador en sí, sino en el diseño experimental: se ejecutan dos brazos sobre el mismo fichero de datos, cambiando únicamente la política de enmascarado de la pérdida.

En el brazo `as_exported` se supervisan todos los tokens del ejemplo (46.480 de 46.480), que es el comportamiento por defecto de TRL cuando no se aplica el `loss_mask` del export. En el brazo `mask_honored` se supervisan 5.168 tokens, correspondientes exclusivamente a los turnos del asistente. El README de la receta fija la semilla, las versiones de las librerías y la GPU empleada, y la model card advierte explícitamente de que debe leerse la sección «Learned» antes de citar cualquier cifra. No se especifican en la información disponible el volumen total de datos, la composición del dataset, ni si hubo etapas de RLHF o DPO posteriores al SFT.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen2.5-1.5B-Instruct, orientada a respuestas de formato breve.
- Reducción medible de la longitud de respuesta: 84,1 caracteres de media en el brazo `mask_honored` frente a 125,7 en `as_exported` y entre 154 y 173 en el base sin ajustar.
- Mayor proporción de respuestas muy cortas (menos de 60 caracteres): 0,421 en `mask_honored` frente a 0,158 en `as_exported` y 0,018 en el base.
- Reproducción de dos configuraciones de entrenamiento distintas desde un mismo repositorio, lo que permite comparaciones controladas.
- Capacidades de tool calling, agentes, visión, audio o modo de razonamiento explícito: no documentadas para este adaptador en la información disponible.

## Casos de uso

- Ablación de pipelines de SFT: el adaptador sirve para verificar empíricamente cómo afecta el enmascarado de la pérdida al comportamiento del modelo entrenado, manteniendo constante el fichero de datos, la semilla y el modelo base.
- Auditoría de exportadores de datos: permite comprobar si un pipeline de exportación conserva correctamente el `loss_mask` y si las herramientas de entrenamiento lo respetan o lo ignoran silenciosamente.
- Control de verbosidad en asistentes conversacionales: si el requisito de producto es respuestas telegráficas (por ejemplo, interfaces de voz o notificaciones), este brazo produce sistemáticamente salidas más cortas que el modelo base.
- Generación de respuestas breves para clasificación o etiquetado: la tendencia a emitir salidas por debajo de 60 caracteres encaja con tareas de extracción y normalización donde no se espera prosa.
- Punto de partida para fine-tuning adicional: al ser un adaptador LoRA sobre un base de 1,5 B, es barato seguir entrenándolo con datos de dominio propio en una única GPU.
- Docencia y formación en fine-tuning: el par de brazos ilustra de forma tangible la diferencia entre supervisar todos los tokens y supervisar solo los turnos del asistente.
- Evaluación de robustez frente a la fuga de contenido no asistente: el criterio preregistrado (fuga de texto no asistente) se midió y resultó nulo en ambos brazos, lo que sirve como caso de control en estudios de contaminación de objetivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card únicamente reporta la evaluación del experimento de enmascarado:

| Metrica | Base (3 pasadas) | `as_exported` | `mask_honored` | Diferencia pareada A-B [IC 95 %] |
|---|---|---|---|---|
| Longitud media de respuesta (caracteres) | 173 / 168 / 154 | 125,7 | 84,1 | +41,6 [+21,0; +63,7] |
| Proporcion de respuestas < 60 caracteres | 0,000 / 0,018 / 0,018 | 0,158 | 0,421 | -0,263 [-0,404; -0,123] |
| Fuga de texto no asistente (criterio primario preregistrado) | 0 / 0 / 0 | 0,000 | 0,000 | +0,000 |

El criterio primario preregistrado no mostró cambios: ninguno de los dos brazos filtró texto no perteneciente al asistente. La diferencia se concentra en la longitud de las respuestas, en la dirección que predice la aplicación de la máscara.

## Requisitos de hardware

- El adaptador es un fichero LoRA de tamaño reducido (el repositorio ocupa 0,0 GB según HuggingFace); el coste de memoria lo determina el modelo base.
- VRAM estimada para inferencia con el base Qwen2.5-1.5B-Instruct: aproximadamente 3,2 GB en bf16/fp16, alrededor de 1,7 GB en cuantización de 8 bits y cerca de 1,0-1,2 GB en cuantización de 4 bits, más la caché KV correspondiente al contexto utilizado.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, así como en portátiles con 6-8 GB de VRAM si se usa cuantización de 4 bits.
- GPU de centro de datos (A100, H100, L40S) sobredimensionadas para este tamaño; resultan útiles si se necesita mucho paralelismo de peticiones o contextos muy largos.
- Opciones de despliegue: transformers + peft (carga directa del adaptador, tal como documenta la model card), vLLM o TGI tras fusionar el adaptador en los pesos base, y llama.cpp u Ollama si se convierte el modelo fusionado a GGUF.
- Latencia y throughput estimados: no disponibles. La receta fija la GPU empleada en el entrenamiento, pero no se publican mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| while-ai/community-loss-mask-1.5b | 1,54 B (base) + adaptador LoRA | 32.768 tokens (heredado) | Adaptador SFT de experimento | Apache 2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54 B | 32.768 tokens (ampliable a 131.072 con YaRN) | Modelo instruct completo | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.2-1B-Instruct | 1,24 B | 128.000 tokens | Modelo instruct completo | Licencia comunitaria Llama 3.2 | HuggingFace |
| google/gemma-2-2b-it | 2,6 B | 8.192 tokens | Modelo instruct completo | Terminos de uso de Gemma | HuggingFace |

La comparación de calidad entre alternativas no está disponible: no se han publicado benchmarks de este adaptador frente a otros modelos. El adaptador solo es comparable en igualdad de condiciones con los dos brazos del mismo experimento, no con modelos instruct completos.

## Limitaciones y advertencias

- Es un artefacto de investigación: la model card no está pensada para justificar su uso en producción, y la receta advierte de que hay que leer la sección «Learned» antes de citar cualquier cifra.
- El resultado principal del experimento se refiere a longitud de respuesta, no a calidad, corrección o utilidad de las respuestas. Un brazo que responde en 84 caracteres de media puede estar simplemente truncando información.
- El criterio primario preregistrado (fuga de texto no asistente) no se movió; conviene no extrapolar el hallazgo a otros datasets, formatos de export o versiones de TRL.
- No se declaran idiomas soportados en la model card; el comportamiento multilingüe depende enteramente del modelo base y no se ha evaluado en el adaptador.
- No hay datos publicados sobre sesgos, tasas de alucinación, robustez ante prompts adversarios ni rendimiento en contextos largos.
- La licencia del adaptador es Apache 2.0, pero el uso comercial y la redistribución del modelo fusionado quedan sujetos a la licencia del base (Qwen2.5-1.5B-Instruct, también Apache 2.0).
- El recuento exacto de parámetros del adaptador, el volumen y la composición del dataset de SFT no se especifican en la información disponible.
- El repositorio no registra descargas ni likes, por lo que no existe validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/while-ai/community-loss-mask-1.5b
- Receta de reproducción («what-trl-does-with-the-loss-mask»): https://github.com/whilehq/whileai-sdk/tree/main/recipes/community/what-trl-does-with-the-loss-mask
- Repositorio whileai-sdk: https://github.com/whilehq/whileai-sdk
- Colección «Course and community runs»: https://huggingface.co/collections/while-ai/course-and-community-runs-6ab271de189fd0c363cfab92
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Paper, blog o demo adicionales: no disponibles en la información proporcionada.
