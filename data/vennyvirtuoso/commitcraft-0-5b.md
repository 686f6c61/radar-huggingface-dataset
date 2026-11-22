# vennyvirtuoso/commitcraft-0.5b

## Resumen

commitcraft-0.5b es un ajuste fino supervisado (LoRA, empaquetado como adaptador PEFT) del modelo Qwen2.5-0.5B-Instruct, desarrollado por el usuario vennyvirtuoso. Su tarea es concreta y acotada: sintetizar mensajes de commit de Git siguiendo la especificación Conventional Commits (feat, fix, refactor, docs, test, chore, perf, ci, style) a partir de un diff de código en bruto. Resuelve el problema de la baja calidad y consistencia de los mensajes de commit en equipos de desarrollo, automatizando su generación a partir del parche real.

El modelo hereda la arquitectura transformer decoder-only de Qwen2.5-0.5B-Instruct, con aproximadamente 494 millones de parámetros totales. Al estar publicado como adaptador PEFT sobre el modelo base, el repositorio ocupa 1,0 GB y requiere cargar el checkpoint base junto con el adaptador (o fusionarlos). Está entrenado sobre el corpus CommitBench, descrito por el autor como 10.000 pares diff-mensaje con esquema impuesto.

Su relevancia actual radica en el nicho: es un modelo de 0,5B parámetros, con licencia Apache 2.0, pensado para despliegue en el borde (edge), microservicios y agentes locales, donde no tiene sentido invocar una API de frontera para generar un mensaje de commit. El autor reporta latencias de decodificación en el rango de 145 ms por commit y una mejora sustancial en la tasa de cumplimiento de Conventional Commits frente al modelo base sin ajustar, aunque las cifras publicadas se basan en conjuntos de evaluación muy reducidos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), ajuste fino con LoRA/PEFT sobre Qwen2.5-0.5B-Instruct |
| Parametros totales | 494.032.768 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-0.5B-Instruct; el autor no la especifica) |
| Tipos de cuantizacion | no especificados por el autor; pesos publicados en safetensors (adaptador PEFT). Compatible con cuantizacion estandar de transformers (bfloat16/fp16 en el ejemplo de uso) |
| Idiomas soportados | no disponibles (el campo de idiomas no esta relleno en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el checkpoint base Qwen/Qwen2.5-0.5B-Instruct |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso de aproximadamente 0,49B parametros. El repositorio se publica como adaptador PEFT (LoRA) en safetensors, por lo que la inferencia requiere cargar el modelo base y el adaptador, o bien fusionar los pesos para obtener un checkpoint standalone de ~490M parametros, tal como indica el autor en su tabla de evaluacion. La precision de entrenamiento declarada es mixta (bfloat16/fp16).

El entrenamiento se realizo sobre CommitBench, descrito por el autor como un corpus multilingue de pares diff de Git y mensajes de commit convencionales, con 10.000 pares y esquema impuesto. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron etapas de RLHF o DPO; el pipeline declarado es PEFT, lo que apunta a un ajuste supervisado (SFT) con LoRA. El autor afirma que la evaluacion se hizo sobre particiones de test disjuntas por grupo (group-disjoint) para evitar fuga de datos, pero no se aportan detalles sobre la construccion de esas particiones. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.).

## Capacidades

- Generacion de mensajes de commit en formato Conventional Commits a partir de un diff de Git en texto plano.
- Clasificacion implicita del tipo de commit (feat, fix, refactor, docs, test, chore, perf, ci, style) y generacion de un scope y una descripcion corta.
- Generacion de texto conversacional basica, heredada del modelo base Instruct (soporte de plantilla de chat con roles system/user/assistant y tokens `<|im_end|>`).
- Capacidad de seguir instrucciones mediante un system prompt que fija el rol y el formato de salida.
- Soporte de decodificacion determinista (greedy, `do_sample=False`) para salidas reproducibles.
- Capacidades multilingues: no documentadas en la model card; el dataset se describe como multilingue, pero no se enumeran idiomas.
- Tool calling / function calling: el autor lo menciona como caso de uso previsto (JSON schema-constrained function calling, extraccion de parametros de herramientas), pero no se aporta evidencia de evaluacion especifica de esta capacidad.
- Razonamiento multi-paso y agentes: no documentado como capacidad entrenada; el uso agentico se plantea como escenario de despliegue, no como habilidad medida.

## Casos de uso

- Generacion automatica de mensajes de commit en un hook de pre-commit o en un pipeline de CI: el modelo recibe el diff staged y devuelve una linea Conventional Commit, reduciendo la variabilidad de estilo entre desarrolladores. Su tamano de 0,5B permite ejecutarlo localmente sin coste por token.
- Integracion en asistentes de IDE o extensiones de Git: dado el bajo coste de inferencia, se puede invocar en cada operacion de commit con una latencia declarada de ~146 ms por commit en el hardware de evaluacion del autor.
- Normalizacion retroactiva de historiales de repositorio: procesar en lote commits con mensajes pobres y regenerar mensajes conformes a la especificacion a partir de los diffs, usando decodificacion greedy para resultados deterministas.
- Microservicio interno de generacion de commits: desplegado con vLLM u Ollama detras de una API HTTP, sirviendo a multiples repositorios y equipos con un unico modelo pequeno y licencia permisiva.
- Despliegue en el borde o en estaciones de trabajo sin GPU dedicada: al ser un modelo de ~0,5B, es candidato a ejecucion en CPU o GPU de consumo, lo que encaja con el etiquetado `edge-ai` del autor.
- Filtrado y clasificacion de commits en herramientas de analitica de ingenieria: usar el tipo Conventional Commit generado para etiquetar automaticamente cambios (features, fixes, refactors) y alimentar metricas de equipo.
- Educacion y onboarding: mostrar a desarrolladores noveles como se redacta un mensaje de commit conforme a la especificacion a partir de su propio diff.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (conjunto de test retenido; el tamano de la muestra no se especifica, y las cifras porcentuales sugieren una muestra muy pequena):

| Metrica | Fine-tuned | Baseline zero-shot | Ganancia |
|---|---|---|---|
| Cumplimiento de Conventional Commits | 100,00% | 75,00% | +25,00 pp |
| Precision del tipo de commit | 62,50% | 10,50% | +52,00 pp |
| Latencia de sintesis por diff | 145,85 ms/commit | no disponible | no aplica |
| Parametros del modelo | 490M (merged) | no disponible | no aplica |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Las cifras anteriores proceden exclusivamente de la evaluacion del autor y no han sido verificadas de forma independiente; la precision del tipo de commit del 62,50% indica que aproximadamente uno de cada tres commits recibe una etiqueta de tipo incorrecta.

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16/fp16, los ~494M parametros ocupan aproximadamente 1 GB de pesos; con cache KV y overhead de runtime, el consumo tipico se situa en torno a 1,5-2,5 GB. En cuantizacion de 8 bits, alrededor de 0,5-1 GB; en 4 bits, por debajo de 0,5 GB de pesos.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente (RTX 3060 12 GB, RTX 4060, RTX 4090); tambien es viable en GPU de datacenter (A100, H100) para despliegues de alto throughput, aunque sobredimensionadas para un modelo de este tamano.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU para uso interactivo por commit.
- Opciones de despliegue: `transformers` con `peft` (carga del adaptador), vLLM con decodificacion guiada por gramatica JSON, Ollama para despliegue ligero, y `sentence-transformers` segun indica el autor (aunque esta ultima no es la via natural para un modelo causal de generacion). El autor no publica pesos GGUF en el repositorio.
- Latencia y throughput: el autor reporta 145,85 ms por commit en su entorno de evaluacion; no se especifica el hardware utilizado ni el throughput en lote. El titular de "sub-25 ms" que aparece en la model card no coincide con la cifra de la tabla de evaluacion y no se acompana de condiciones de medida.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| commitcraft-0.5b | ~494M | no disponible | Mensajes de commit convencionales | Apache 2.0 | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct | ~494M | no disponible en esta ficha | Instrucciones generales, chat | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-Coder-0.5B-Instruct | ~494M | no disponible en esta ficha | Codigo general | Apache 2.0 | Hugging Face |

La comparativa se limita a la familia Qwen2.5 de 0,5B porque no se dispone de datos verificables de otros modelos especializados en generacion de mensajes de commit en la informacion proporcionada. Frente al modelo base, la ventaja documentada es el cumplimiento del formato Conventional Commits y la precision del tipo de commit; frente a un modelo de codigo general como Qwen2.5-Coder-0.5B-Instruct, la diferencia esperada esta en el formato de salida y no en la capacidad de comprension del diff, aunque esto no se ha medido en la informacion disponible.

## Limitaciones y advertencias

- Las metricas publicadas proceden unicamente del autor y se basan en una muestra de test no especificada; los porcentajes (100%, 62,5%, 75%, 10,5%) son compatibles con conjuntos de evaluacion muy pequenos y no deben tomarse como estimaciones robustas de rendimiento en produccion.
- La precision del tipo de commit del 62,50% implica un tercio de etiquetas incorrectas; en un flujo automatizado conviene validar o permitir correccion humana.
- El modelo se distribuye como adaptador PEFT: no es un checkpoint standalone y requiere descargar y cargar Qwen2.5-0.5B-Instruct, lo que anade dependencia y pasos de despliegue.
- No se documentan idiomas soportados; el comportamiento en diffs con comentarios o mensajes en idiomas distintos del ingles no esta evaluado.
- La longitud de contexto no se especifica en la model card; los diffs grandes pueden truncarse y degradar la calidad del mensaje generado.
- Riesgo de alucinacion: al ser un modelo de 0,5B, puede inventar scopes, tipos o descripciones que no corresponden al contenido real del diff, especialmente en parches ambiguos o muy grandes.
- El autor menciona tool calling y function calling como caso de uso, pero no aporta evaluacion de esa capacidad; no debe asumirse un rendimiento fiable en ese escenario sin validacion propia.
- La model card incluye afirmaciones de marketing no respaldadas por datos (por ejemplo, "sub-25ms" frente a los 145,85 ms medidos) y referencias a `sentence-transformers` que no encajan con un modelo causal; conviene tratar la documentacion con cautela.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero el modelo base Qwen2.5-0.5B-Instruct tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas; aun asi, debe conservarse la atribucion correspondiente.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad; no hay evidencia independiente de su calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vennyvirtuoso/commitcraft-0.5b
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset declarado: https://huggingface.co/datasets/CommitBench
- vLLM: https://github.com/vllm-project/vllm
- Ollama: https://github.com/ollama/ollama
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
