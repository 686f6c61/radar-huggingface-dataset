# unignoramus/anlp-a2-p2-adamw

## Resumen

anlp-a2-p2-adamw es un transformer decoder-only de 35,27 millones de parametros entrenado desde cero por el usuario unignoramus. Se trata, segun la propia model card, de la entrega de la parte 2 de la asignatura ANLP (Advanced Natural Language Processing), y su rasgo distintivo no es el modelo en si, sino que el optimizador AdamW esta implementado a mano en lugar de importarse de una libreria estandar como PyTorch o Transformers.

El modelo se preentreno sobre el corpus paralelo human/AI `browndw/human-ai-parallel-corpus` durante 38,93 millones de tokens, con un learning rate de 0,0003. Los unicos resultados publicados son una perdida de validacion de 4,2329 y un BLEU de test de 1,40, cifras que corresponden a un modelo muy pequeno y poco entrenado, no a un sistema listo para produccion.

Su relevancia es academica y experimental: sirve como artefacto reproducible para comparar implementaciones de optimizadores, para auditar el efecto de distintos hiperparametros en un presupuesto de calculo minimo y como ejemplo de pipeline completo de tokenizacion, entrenamiento y guardado de checkpoints. No es un modelo que compita en calidad de generacion con alternativas de su mismo tamano entrenadas a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only (implementacion propia) |
| Parametros totales | 35,27 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | no declarados; el corpus de entrenamiento es en ingles (human/AI parallel corpus) |
| Licencia | MIT |
| Formato de pesos | checkpoint `torch.save` con claves `model`, `state` y `config` (no safetensors, no GGUF) |

Otros datos declarados: learning rate 0,0003, optimizador AdamW escrito a mano, 38,93 M de tokens de entrenamiento, perdida de validacion 4,2329, BLEU de test 1,40, tamano del repositorio 0,1 GB. Fecha de creacion indicada: 17 de septiembre de 2026; ultima actualizacion: 17 de septiembre de 2026. Descargas: 0. Likes: 0.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de implementacion propia, es decir, sin depender de `transformers` para la definicion del modelo. El repositorio se declara bajo `library_name: pytorch` y el checkpoint es un payload plano de `torch.save` con tres claves: `model` (los pesos), `state` (el estado del optimizador) y `config` (la configuracion del modelo). Para cargarlo hay que usar `torch.load(..., weights_only=False)` y pasar el objeto `model` a la clase transformer definida en el repositorio acompanante. El numero de capas, cabezas de atencion, dimension del modelo y funcion de activacion no se detallan en la model card.

El entrenamiento consistio en un preentrenamiento sobre el corpus `browndw/human-ai-parallel-corpus` con un total de 38,93 millones de tokens y un learning rate de 0,0003. La innovacion tecnica declarada es exclusivamente la implementacion manual del optimizador AdamW, presumiblemente con el objetivo de verificar su correctitud frente a la version de referencia. No se menciona el uso de RLHF, DPO, SFT ni ninguna fase de alineacion posterior, ni tecnicas como decodificacion especulativa, atencion lineal o mezcla de expertos. La perdida de validacion de 4,2329 es coherente con un modelo de este presupuesto: un modelo bien entrenado en ingles suele situarse muy por debajo de 3,5 en esta metrica, de modo que el entrenamiento parece haber sido limitado.

## Capacidades

- Generacion de texto autoregresiva en ingles a partir de un prompt, con la calidad esperable de un modelo de 35 M de parametros y menos de 40 M de tokens vistos.
- Modelado de lenguaje y calculo de perplejidad, que es su uso mas fiable dado el resultado de perdida de validacion publicado.
- Traduccion/parafrasis limitada entre pares del corpus human/AI paralelo, con un BLEU de test de 1,40, lo que en la practica descarta un uso real de traduccion.
- Entrenamiento y ajuste fino experimental: al incluir el estado del optimizador en el checkpoint, es util para reproducir curvas de entrenamiento y comparar optimizadores.
- No hay evidencia declarada de soporte de tool calling, function calling ni agentes.
- No hay evidencia declarada de razonamiento multi-paso, modo thinking, vision, audio ni multimodalidad.
- Capacidades multilingues: no declaradas; el corpus es en ingles, por lo que cualquier uso en castellano seria fuera de distribucion.
- No se publican plantillas de chat ni tokens especiales de rol, por lo que no es un modelo instruct.

## Casos de uso

- Reproduccion de experimentos de optimizadores: cargar el checkpoint con `torch.load(..., weights_only=False)`, reutilizar la clave `state` y comparar el descenso de perdida de un AdamW escrito a mano frente al de `torch.optim.AdamW` con el mismo learning rate de 0,0003.
- Docencia de transformers: usar el modelo y su config para ilustrar el ciclo completo de tokenizacion, forward pass, calculo de perdida y guardado de pesos en un presupuesto de calculo de minutos en CPU.
- Test de integracion de pipelines de formacion: al ser un modelo diminuto con licencia MIT, sirve como modelo de humo para validar scripts de carga, serializacion y evaluacion de BLEU antes de escalar a modelos mayores.
- Pruebas de degradacion y robustez: evaluar como se comporta un decoder-only de 35 M ante prompts fuera de dominio en ingles y medir la perplejidad resultante, como linea base en estudios de escalado.
- Ablaciones de datos: entrenar desde el mismo checkpoint con subconjuntos distintos del corpus paralelo para medir la sensibilidad a la composicion del dataset con un coste de GPU trivial.
- Inferencia en dispositivos muy limitados: con pesos en FP32 de aproximadamente 141 MB cabe en cualquier portatil, en una Raspberry Pi con 1 GB de RAM o incluso en un contenedor de CI con CPU, lo que permite demostraciones de generacion sin GPU.
- No se recomienda su uso en atencion al cliente, generacion de codigo, resumen o traduccion en produccion: el BLEU declarado y la perdida de validacion no respaldan esas tareas.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Perdida de validacion | 4,2329 | validacion del corpus de entrenamiento |
| BLEU de test | 1,40 | test del corpus de entrenamiento |
| MMLU, HumanEval, GSM8K, ARC, HellaSwag | no disponible | no se han publicado resultados |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. Las dos unicas metricas publicadas corresponden al propio corpus de preentrenamiento y no son comparables con las de modelos de referencia evaluados en suites estandar.

## Requisitos de hardware

- VRAM estimada para inferencia: con 35,27 M de parametros, aproximadamente 141 MB en FP32, unos 71 MB en FP16/BF16 y unos 35 MB en int8. El coste dominante es el propio runtime de PyTorch, no los pesos.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente, incluidas GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, A100 o H100. No hay requisito de GPU de centro de datos.
- Cabe holgadamente en GPU de consumo, e incluso en CPU, en una Raspberry Pi moderna o en un telefono de gama media si se exporta a un formato adecuado.
- Opciones de despliegue: la unica ruta documentada es PyTorch con la definicion de transformer del repositorio acompanante. No hay pesos en safetensors ni GGUF, de modo que vLLM, llama.cpp, Ollama y TGI no pueden consumirlo sin una conversion previa y sin reimplementar la clase del modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano, en una GPU moderna la generacion seria del orden de miles de tokens por segundo, pero no hay mediciones publicadas que lo confirmen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato de pesos | Disponibilidad |
|---|---|---|---|---|---|
| anlp-a2-p2-adamw | 35,27 M | no disponible | MIT | `torch.save` (.pt/.bin) | HuggingFace, 0 descargas |
| GPT-2 small | 124 M | 1024 tokens | MIT modificada | safetensors, PyTorch | ampliamente extendido |
| Pythia-70M | 70 M | 2048 tokens | Apache 2.0 | safetensors, PyTorch | HuggingFace, muy descargado |
| TinyStories-33M | 33 M | 512 tokens (segun variante) | no disponible | safetensors, PyTorch | HuggingFace |

La comparacion relevante no es de rendimiento, ya que el modelo solo publica perdida de validacion y BLEU sobre su propio corpus y no hay evaluaciones cruzadas, sino de grado de madurez: las alternativas citadas incluyen pesos en safetensors, integracion directa con la libreria `transformers` y documentacion de contexto, mientras que este checkpoint exige cargar codigo propio y no declara longitud de contexto. No se dispone de datos de benchmarks comparables para establecer diferencias de calidad.

## Limitaciones y advertencias

- Es un artefacto academico de una asignatura, no un modelo mantenido ni evaluado por un equipo de investigacion; no hay garantia de soporte ni de correcciones.
- Perdida de validacion de 4,2329 y BLEU de test de 1,40: la calidad de generacion es muy baja y el riesgo de texto incoherente o directamente erroneo es alto. El riesgo de alucinacion es elevado por construccion, al no existir fase de alineacion ni verificacion factual.
- Sesgos conocidos: no disponibles. El autor no publica analisis de sesgos, y el corpus human/AI paralelo no se documenta en la model card en cuanto a su composicion demografica o tematica.
- Limitaciones de contexto: la longitud de contexto no esta declarada, por lo que no puede planificarse un uso con ventanas largas. Cualquier prompt extenso puede fallar silenciosamente si supera el maximo no documentado.
- Limitaciones de idioma: el entrenamiento es en ingles. No hay evidencia de capacidad en castellano ni en otros idiomas; usarlo en castellano constituye una extrapolacion fuera de distribucion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion con atribucion y sin garantia. Es el punto mas favorable del modelo. No obstante, la licencia del corpus de entrenamiento (`browndw/human-ai-parallel-corpus`) es una cuestion independiente que conviene verificar antes de un uso comercial derivado.
- Restriccion tecnica de carga: el checkpoint requiere `torch.load(..., weights_only=False)`, lo que implica ejecutar pickle y, por tanto, un riesgo de seguridad si el fichero no procede de una fuente de confianza. Ademas, depende de la clase transformer del repositorio acompanante, que no esta enlazada en la model card, por lo que la reproducibilidad fuera de ese repositorio no esta garantizada.
- Ausencia total de adopcion: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unignoramus/anlp-a2-p2-adamw
- Dataset de entrenamiento: https://huggingface.co/datasets/browndw/human-ai-parallel-corpus
- Repositorio con la definicion del transformer: no disponible (la model card lo menciona como "accompanying repository" sin enlace)
- Paper o blog del autor: no disponible
- Demo: no disponible
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos no guardan relacion con el contenido de esta ficha y se han descartado.
