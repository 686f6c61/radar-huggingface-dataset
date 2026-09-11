# yusifnuri/Llama-3.2-3B-Instruct_code_generation

# Llama-3.2-3B-Instruct code generation: adaptador LoRA para completar funciones Python

## Resumen

`yusifnuri/Llama-3.2-3B-Instruct_code_generation` es un adaptador LoRA (PEFT) que especializa el modelo `meta-llama/Llama-3.2-3B-Instruct` (3,21 mil millones de parametros) en una unica tarea: completar una funcion Python de modo que supere los tests unitarios de referencia. No es un modelo autonomo, sino un delta de pesos de ~0,1 GB que debe cargarse sobre el modelo base de Meta. Lo publica el autor Yusif Nuri como artefacto reproducible de su tesis de master *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models* (SRH University Hamburg, 2026).

El interes del adaptador es metodologico antes que de producto: forma parte de un banco de pruebas que compara modelos pequenos ajustados contra APIs de proveedores frontera en exactitud, latencia, coste, exposicion de privacidad y volumen de punto de equilibrio del retorno de la inversion. Al liberar los pesos, el autor permite verificar de forma independiente las cifras del benchmark en lugar de aceptarlas como una caja negra.

Los numeros medidos son modestos y estan acotados a un solo corpus: `pass@1` de 0,3341 sobre HumanEval, con una latencia media de 5.769 ms por peticion a batch 1 sobre una NVIDIA H200 y un coste imputado de 24,98 USD por millon de tokens generados. El propio autor advierte de que el ajuste se hizo con una sola semilla y de que los corpus de evaluacion probablemente estan presentes en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2) con adaptador LoRA sobre las proyecciones de atencion; no es MoE |
| Parametros totales | 3,21 mil millones en el modelo base; adaptador LoRA de rango 16 (repo de 0,1 GB en safetensors) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | 128.000 tokens en el modelo base; el entrenamiento del adaptador uso secuencias de 512 tokens como maximo |
| Tipos de cuantizacion | no especificados por el autor. El adaptador se distribuye en safetensors; son aplicables las cuantizaciones del modelo base (FP16/BF16, INT8 e INT4 con bitsandbytes, GGUF tras fusionar el adaptador) |
| Idiomas soportados | no disponibles en la model card. El modelo base Llama 3.2 3B Instruct declara 8 idiomas oficiales (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes) |
| Licencia | Llama 3.2 Community License |
| Formato de pesos | safetensors (adaptador PEFT/LoRA, `library_name: peft`) |
| Pipeline | text-generation |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de creacion | 11 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 3,21 B de parametros de la familia Llama 3.2, que Meta obtuvo podando y destilando versiones mayores de Llama 3.1. Sobre el se aplica un ajuste LoRA estandar con rango 16, alpha 32 y dropout 0,05, restringido a los modulos `q_proj`, `k_proj`, `v_proj` y `o_proj`. El optimizador es AdamW con tasa de aprendizaje 2e-4, programacion coseno y 3 % de calentamiento, durante 3 epocas, con tamano de lote efectivo 16 (4 x 4 de acumulacion de gradientes), semilla 42 y longitud maxima de secuencia de 512 tokens.

El corpus de entrenamiento es HumanEval (`openai/openai_humaneval`, licencia MIT), con 5.000 ejemplos de los que 500 se reservaron para seleccionar el checkpoint. El formato de prompt es literal y no conversacional: `Complete the following Python function:\n{text}`. No se documenta RLHF, DPO ni ninguna innovacion de decodificacion (decodificacion especulativa, atencion lineal, etc.). Los hiperparametros se mantuvieron constantes en todas las celdas del benchmark en lugar de ajustarse por modelo y tarea, de modo que, segun el autor, las cifras publicadas constituyen una cota inferior conservadora del rendimiento alcanzable.

## Capacidades

- Completado de funciones Python a partir de una firma y un enunciado, con el objetivo de superar tests unitarios de referencia.
- Ajuste especifico sobre HumanEval: `pass@1` medido de 0,3341.
- Ejecucion sobre el modelo base, por lo que hereda su ventana de contexto de 128.000 tokens para la fase de inferencia (aunque el adaptador solo se entreno con 512 tokens).
- Soporte de tool calling o function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado; la tarea entrenada es de un solo turno.
- Capacidades multilingues: no documentadas para el adaptador; no se declara ningun idioma en la ficha.
- Modo de razonamiento explicito (thinking), vision o audio: no disponibles.
- Uso conversacional: no garantizado. El adaptador espera el formato de prompt plano `Complete the following Python function:`, no una plantilla de chat.

## Casos de uso

- Autocompletado de funciones Python en herramientas internas: el adaptador se integra con `transformers` y `peft` para sugerir el cuerpo de una funcion a partir de su firma, con un coste marginal de inferencia autocontrolado en lugar de depender de una API externa.
- Ejecucion en entornos con restricciones de privacidad: al ser un modelo de 3,21 B desplegable en local, el codigo fuente no sale de la infraestructura, algo relevante en banca, sanidad o sector publico donde el envio a APIs de terceros exige evaluacion de impacto.
- Analisis de coste y punto de equilibrio: el repositorio asociado publica `results/cost_per_request.csv` y una cifra de 24,98 USD por millon de tokens generados, lo que permite calcular a partir de que volumen de peticiones compensa el ajuste propio frente al pago por token en una API frontera.
- Verificacion academica y reproducibilidad: investigadores que quieran replicar la matriz del benchmark pueden cargar este adaptador y volver a ejecutar el arnes de evaluacion del repositorio con la misma semilla, configuracion y corpus.
- Punto de partida para un ajuste incremental: el adaptador de rango 16 y 0,1 GB sirve como inicializacion barata para especializar mas el modelo en el estilo de codigo de una organizacion concreta, partiendo de un coste de entrenamiento ya amortizado.
- Docencia de tecnicas PEFT: por su tamano reducido y su tarea unica y medible, es un ejemplo manejable para ilustrar el flujo completo de LoRA, desde el dataset hasta la metrica `pass@1`.
- Prototipado de evaluacion de modelos pequenos frente a APIs: el arnes compara exactitud, latencia, coste y exposicion de privacidad, y sirve como plantilla para montar una evaluacion interna equivalente con datos propios.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones de la medicion |
|---|---|---|
| pass@1 | 0,3341 | HumanEval, los 164 problemas, 200 instancias retenidas en total para el resto de tareas |
| Latencia media | 5.769 ms | Batch 1, uso completo de una NVIDIA H200 (141 GB), excluye transito de red |
| Coste por 1M de tokens generados | 24,98 USD | GPU-hora imputada a 3,99 USD |

No se han publicado otros resultados de benchmarks (MMLU, GSM8K u otros) en la informacion disponible. El autor indica que las puntuaciones no son comparables entre tareas porque cada una usa su propia metrica, y que la matriz completa esta en `results/benchmark_matrix.csv` del repositorio del proyecto. La evaluacion se ejecuto el 5 de julio de 2026.

## Requisitos de hardware

- Pesos del modelo base en FP16/BF16: aproximadamente 6,5 GB, mas cache KV y activaciones; en la practica conviene reservar entre 8 y 10 GB de VRAM.
- Cuantizacion INT8: en torno a 3,5 GB de pesos; INT4: en torno a 2 GB mas sobrecarga, por lo que cabe en GPUs de 8 GB.
- El adaptador en si ocupa solo 0,1 GB, por lo que su huella adicional sobre el modelo base es despreciable.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090) y en equipos Apple Silicon con memoria unificada de 16 GB o superior, siempre que se cuantice.
- GPU de centro de datos: la medicion oficial se hizo sobre una NVIDIA H200 de 141 GB; una A100 o una L40S son alternativas mas que suficientes dado el tamano del modelo.
- Opciones de despliegue: la unica documentada por el autor es `transformers` + `peft` (clase `PeftModel`). vLLM soporta adaptadores LoRA y seria la via natural para servir varias especializaciones sobre una misma copia del modelo base; TGI tambien admite LoRA. Para llama.cpp u Ollama hay que fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que no consumen safetensors PEFT directamente.
- Latencia medida: 5.769 ms de media por peticion a batch 1 sobre H200, segun la model card. No se publica throughput agregado ni latencia por token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | pass@1 en HumanEval |
|---|---|---|---|---|---|
| Este adaptador (sobre Llama 3.2 3B Instruct) | 3,21 B (base) + LoRA rango 16 | 128.000 tokens en el base; 512 en entrenamiento | Llama 3.2 Community License | LoRA especializado en una tarea | 0,3341 |
| meta-llama/Llama-3.2-3B-Instruct | 3,21 B | 128.000 tokens | Llama 3.2 Community License | Asistente generalista | no disponible |
| Qwen2.5-Coder-3B | 3,09 B | 32.768 tokens nativos | Apache 2.0 | Especializado en codigo, 5,5 billones de tokens de entrenamiento | no disponible |
| StarCoder2-3B | 3 B | 16.384 tokens | BigCode OpenRAIL-M | Especializado en codigo, entrenado con mas de 3 billones de tokens | no disponible |

Las especificaciones de los modelos alternativos proceden de su documentacion publica y no se han evaluado con el mismo arnes ni con los mismos hiperparametros que este adaptador, por lo que la comparacion es orientativa. El unico dato de rendimiento verificable con metodologia homogenea seria el de la propia matriz del benchmark, que no esta incluida en la informacion disponible mas alla del valor de `pass@1` de este adaptador.

## Limitaciones y advertencias

- Ajuste realizado una sola vez y con una unica semilla (42): las diferencias reportadas mezclan calidad del modelo con varianza de inicializacion.
- Especializado en una tarea sobre un unico corpus publico. No es un asistente de proposito general y no deberia tratarse como tal.
- Los corpus de evaluacion (HumanEval) son benchmarks publicos de larga trayectoria y es plausible que esten en los datos de preentrenamiento del modelo base, lo que infla las puntuaciones absolutas.
- La evaluacion uso 200 instancias retenidas (los 164 problemas en el caso de generacion de codigo), por lo que el tamano de efecto detectable esta acotado en torno a diez puntos porcentuales.
- `pass@1` de 0,3341 implica que aproximadamente dos de cada tres funciones generadas no pasan los tests de referencia: no es apto para autocompletar codigo sin revision humana.
- El entrenamiento se hizo con secuencias de 512 tokens como maximo, muy por debajo de la ventana de 128.000 tokens del modelo base; el comportamiento con contextos largos no esta validado.
- El formato esperado es `Complete the following Python function:` seguido del texto. No se documenta plantilla de chat, por lo que usar prompts conversacionales o de instrucciones puede degradar la calidad frente al modelo base.
- No se declaran idiomas soportados en la model card; el adaptador se entreno sobre HumanEval, cuyo enunciado y codigo estan en ingles.
- Riesgo de alucinacion inherente al modelo base, agravado en generacion de codigo: puede producir APIs inexistentes o firmas plausibles pero incorrectas.
- Restricciones de licencia: la Llama 3.2 Community License permite uso comercial, pero lo condiciona a atribucion, a una convencion de nomenclatura para modelos derivados y a un umbral de usuarios activos mensuales. Hay que revisarla antes de adoptarlo en produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion comunitaria independiente de su comportamiento fuera del benchmark original.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/yusifnuri/Llama-3.2-3B-Instruct_code_generation
- Codigo, configuraciones y arnes de evaluacion: https://github.com/Yusifnuri/slm-benchmark
- Matriz completa del benchmark: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/benchmark_matrix.csv
- Analisis de coste por peticion: https://github.com/Yusifnuri/slm-benchmark/blob/main/results/cost_per_request.csv
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/openai/openai_humaneval
- Cita del trabajo original: Nuri, Y. (2026). *Fine-Tune or Pay Per Token? An Enterprise Benchmark of Small Language Models*. Tesis de master, SRH University Hamburg.
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo (los unicos enlaces recuperados pertenecen a un foro de pesca de carpa ajeno al tema), por lo que no se han podido incorporar fuentes externas adicionales.
