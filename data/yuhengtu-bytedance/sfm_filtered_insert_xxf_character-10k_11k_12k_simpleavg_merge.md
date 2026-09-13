# yuhengtu-bytedance/sfm_filtered_insert_xxf_character-10k_11k_12k_simpleavg_merge

## Resumen

`sfm_filtered_insert_xxf_character-10k_11k_12k_simpleavg_merge` es un modelo de lenguaje publicado por el usuario `yuhengtu-bytedance` en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una fusión de pesos (*checkpoint soup*) generada con la herramienta mergekit mediante el método Linear, promediando tres checkpoints de un mismo entrenamiento correspondientes a los pasos globales 10000, 11000 y 12040, con un peso de 1.0 cada uno y normalización activada.

El modelo tiene 6.856.253.440 parámetros (6,86 mil millones) y una arquitectura `gpt_neox`, es decir, un transformer decoder-only autoregresivo. El resultado de la fusión se guarda en `bfloat16`, aunque el cálculo se realiza en `float32`. El repositorio ocupa 13,7 GB y contiene únicamente pesos en formato `safetensors`; no incluye cuantizaciones publicadas, código de entrenamiento ni dataset.

Su relevancia es fundamentalmente metodológica y de investigación: sirve como ejemplo de promedio lineal de checkpoints intermedios de un mismo *run* de entrenamiento, una técnica descrita en el artículo de *model soups* (arXiv:2203.05482) que habitualmente mejora la robustez respecto a usar un único checkpoint. No se dispone de licencia, idiomas declarados, longitud de contexto ni resultados de evaluación publicados, por lo que no es un modelo listo para producción sin una validación previa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only autoregresivo) |
| Parametros totales | 6.856.253.440 (6,86 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se han publicado cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16 en la salida de la fusion) |
| Metodo de fusion | Linear (mergekit), `normalize: true`, pesos 1.0 por checkpoint |
| Checkpoints fusionados | global_step10000, global_step11000, global_step12040 |
| Checkpoint base declarado | global_step12040 |
| Precision de calculo / salida | float32 / bfloat16 |
| Libreria declarada | transformers |
| Pipeline | text-generation |
| Tamano del repositorio | 13,7 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion (metadatos) | 2026-09-13T00:46:11.000Z |

## Arquitectura y entrenamiento

La arquitectura es `gpt_neox`, una familia de transformers decoder-only con embeddings posicionales rotatorios (RoPE) y conexiones residuales paralelas en los bloques de atencion y de MLP, sin terminos de sesgo en las proyecciones lineales. Esta es la arquitectura empleada por GPT-NeoX-20B y por la familia Pythia. No se dispone de informacion sobre el numero de cabezas de atencion, el numero de capas, la dimension oculta, el tamano del vocabulario ni la longitud de contexto maxima de este checkpoint concreto: esos datos no estan en la informacion proporcionada.

En cuanto al entrenamiento, no hay informacion publicada sobre el numero de tokens, la composicion del dataset, el tokenizador utilizado ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. Lo unico deducible del contexto es que los tres checkpoints fusionados provienen de un mismo entrenamiento (pasos 10000, 11000 y 12040 de una ruta denominada `filtered_insert_xxf_character` dentro de un directorio de proyecto llamado `Pan_Safety_Better_Measurement`), lo que sugiere un contexto de investigacion en seguridad de modelos y de medicion de efectos de *scaling*. La innovacion tecnica del artefacto es precisamente la fusion: un promedio lineal normalizado de pesos, equivalente a un *model soup* sobre checkpoints intermedios, que no anade coste de inferencia respecto a cualquiera de los modelos originales.

## Capacidades

- Generacion de texto autoregresiva: es la unica capacidad confirmada por el pipeline declarado (`text-generation`).
- Conversacion multi-turno: el modelo esta etiquetado como `conversational`, aunque no se especifica el formato de plantilla de chat ni si recibio ajuste por instrucciones.
- Compatibilidad con `text-generation-inference` y con endpoints compatibles con la API de HuggingFace, segun los tags del repositorio.
- Razonamiento, codigo, matematicas, vision, audio, tool calling, function calling y uso como agente: no disponible, no hay ninguna evidencia publicada al respecto.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Modo de razonamiento explicito (*thinking mode*), decodificacion especulativa o tecnicas similares: no disponible.

## Casos de uso

- Investigacion sobre fusion de pesos: el modelo es un caso practico reproducible de *model soup* lineal sobre checkpoints de un mismo entrenamiento; sirve para estudiar si el promedio normalizado mejora la perplejidad y la robustez frente a cada checkpoint individual.
- Analisis de estabilidad del entrenamiento: comparar este modelo con sus tres checkpoints de origen permite medir la varianza del modelo a lo largo del *run* y detectar fases de inestabilidad, siempre que el evaluador disponga de los checkpoints originales (no publicos en el repositorio).
- Servicio de inferencia interno de bajo coste: con 6,86 mil millones de parametros, el modelo cabe en una GPU de 24 GB en `bfloat16` y en GPUs de 8-12 GB si se cuantiza, lo que permite desplegarlo con TGI o vLLM como backend de pruebas internas antes de comprometer recursos mayores.
- Base para *fine-tuning* de dominio: al ser un modelo pequeno y con pesos en `safetensors` estandar, se puede ajustar con LoRA o QLoRA sobre datasets propios en castellano, partiendo de una arquitectura `gpt_neox` bien soportada por `transformers` y `peft`.
- Generacion de texto conversacional en prototipos: el tag `conversational` sugiere uso en dialogos; se puede integrar en un chatbot de demostracion, siempre que se valide primero la calidad y la tasa de alucinacion con un conjunto de evaluacion propio.
- Experimentos de seguridad y alineacion: dado que la ruta de origen pertenece a un proyecto de medicion de seguridad, el modelo puede emplearse como punto de partida en estudios de robustez frente a entradas adversarias, comparando su comportamiento con el de los checkpoints intermedios.
- Docencia y formacion tecnica: sirve como ejemplo didactico de creacion de un modelo derivado con mergekit, incluyendo la configuracion YAML exacta, el efecto de `normalize: true` y la conversion de `float32` a `bfloat16` en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, ARC, HellaSwag ni ninguna otra metrica, y los resultados de busqueda web devueltos no guardan relacion con este modelo (corresponden a paginas de efemerides historicas y no aportan datos tecnicos).

## Requisitos de hardware

- VRAM para inferencia en `bfloat16`/`float16`: aproximadamente 13,7 GB solo para los pesos (6,86 mil millones de parametros x 2 bytes), mas cache KV y activaciones; en la practica, entre 15 y 17 GB segun la longitud de contexto utilizada (que no esta declarada).
- VRAM en 8 bits: en torno a 7-8 GB de pesos, unos 9-10 GB totales.
- VRAM en 4 bits: en torno a 3,5-4,5 GB de pesos, unos 5-6 GB totales.
- GPU recomendadas: A100 40/80 GB, H100, L40S o A6000 para servicio concurrente en precision completa; RTX 4090 (24 GB) para desarrollo e inferencia en `bfloat16` sin problemas de espacio.
- GPU de consumo: si cabe en una RTX 4090 o RTX 3090 de 24 GB en `bfloat16`; en una RTX 4080/3080 de 16 GB entra en 8 bits; en una RTX 3060 de 12 GB o en GPUs de 8 GB requiere cuantizacion de 4 bits y contexto corto.
- Opciones de despliegue: `transformers` (libreria declarada), Text Generation Inference (etiquetado explicitamente), vLLM y cualquier endpoint compatible con la API de HuggingFace. Para llama.cpp u Ollama es necesario convertir previamente los pesos a GGUF, ya que el repositorio solo contiene `safetensors`.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No hay benchmarks publicados de este modelo, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Los datos de las alternativas son datos publicos de referencia de cada proyecto, no mediciones realizadas sobre este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Observaciones |
|---|---|---|---|---|---|
| sfm_filtered_insert_xxf_character-10k_11k_12k_simpleavg_merge | 6,86 mil millones | no disponible | no disponible | Pesos en safetensors, sin cuantizaciones | Fusion lineal de tres checkpoints intermedios |
| Pythia-6.9B | 6,9 mil millones | 2048 tokens | Apache 2.0 | Pesos, cuantizaciones de la comunidad, suite completa de checkpoints | Misma familia de arquitectura (`gpt_neox`), entrenamiento documentado sobre el Pile |
| GPT-NeoX-20B | 20 mil millones | 2048 tokens | Apache 2.0 | Pesos y cuantizaciones | Referencia canonical de la arquitectura `gpt_neox`; requiere hardware muy superior |
| Llama 3.1 8B | 8 mil millones | 128 000 tokens | Licencia comunitaria de Llama 3.1 | Amplio ecosistema de cuantizaciones y herramientas | Alternativa de escala similar con contexto muy superior y licencia con condiciones de uso |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni evaluacion de sesgos, ni analisis de tasas de alucinacion. No debe desplegarse en produccion sin una bateria de pruebas propia.
- Licencia no disponible: al no declararse licencia, no hay autorizacion explicita de uso comercial. Conviene contactar con el autor antes de cualquier uso productivo.
- Idiomas no declarados: se desconoce el soporte real de castellano u otros idiomas; la calidad multilingue no esta garantizada.
- Longitud de contexto desconocida: no se puede planificar el uso en tareas de contexto largo ni dimensionar la cache KV con precision.
- Trazabilidad limitada: la model card referencia rutas locales (`/opt/tiger/...`) y los checkpoints de origen no son publicos, por lo que la fusion no es reproducible externamente ni verificable de forma independiente.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de esta escala sin ajuste por preferencias documentado; no hay informacion sobre RLHF o DPO que lo mitigue.
- Modelo derivado sin *fine-tuning* supervisado declarado: el tag `conversational` no implica que exista una plantilla de chat ni un ajuste conversacional; el comportamiento en dialogos puede degradarse rapidamente.
- Anomalia en los metadatos: las fechas de creacion y actualizacion indicadas (2026-09-13) son posteriores a la fecha habitual de publicacion, lo que apunta a un error de metadatos o a un entorno con reloj desajustado; conviene tratarlas con cautela.
- Cero adopcion: el modelo no tiene descargas ni likes, y los resultados de busqueda web no contienen ninguna referencia tecnica, lo que reduce la posibilidad de encontrar soporte de la comunidad.
- Conversion a GGUF necesaria para despliegue local: si se quiere usar con llama.cpp u Ollama, hay que realizar la conversion y validar que la arquitectura `gpt_neox` sea soportada correctamente por la version de la herramienta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_filtered_insert_xxf_character-10k_11k_12k_simpleavg_merge
- mergekit (herramienta de fusion): https://github.com/cg123/mergekit
- Paper del metodo Linear / model soups: https://arxiv.org/abs/2203.05482
- Los resultados de busqueda web facilitados no contienen informacion relacionada con el modelo (devuelven paginas de efemerides historicas y no aportan papers, blogs, repos ni demos adicionales).
