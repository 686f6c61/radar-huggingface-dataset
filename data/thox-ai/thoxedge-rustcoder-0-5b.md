# Thox-ai/ThoxEdge-RustCoder-0.5B

## Resumen

ThoxEdge-RustCoder-0.5B es un ajuste fino (fine-tune) del modelo Qwen2.5-Coder-0.5B-Instruct desarrollado por Thox-ai, orientado a la generacion y completado de codigo en Rust. Se trata de un modelo de 494 millones de parametros entrenado mediante LoRA de rango 32 sobre un corpus publico de codigo Rust con licencia Apache-2.0, compuesto por 74.606 ejemplos filtrados que producen codigo. El resultado del LoRA se fusiona en los pesos base, de modo que el artefacto distribuido es un modelo denso estandar compatible con transformers.

El modelo resuelve un problema acotado: ofrecer completado de Rust barato en el nivel mas bajo de la pila de enrutamiento de THOX (ThoxRoute), pensado para ejecucion local en escritorio u host. No pretende competir con modelos de codigo de mayor tamano; el propio autor lo describe como un modelo de 0,5B que "no es un buen programador de Rust", y presenta sus metricas como una medicion de delta con el mismo arnes de evaluacion, no como un resultado absoluto comparable a leaderboards publicos.

Su relevancia actual es la de un ejemplo de fine-tune pequeno, reproducible y de licencia permisiva para una tarea vertical (Rust), con pesos en safetensors y GGUF, publicacion en Ollama y una evaluacion ejecutada sobre MultiPL-E HumanEval-Rust. El contexto heredado de la familia Qwen2.5 no se detalla en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tags; detalles no disponibles) |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 publicado; otras cuantizaciones no disponibles |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF (Q8_0) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-Coder-0.5B-Instruct, un transformer decoder-only denso de la familia Qwen2. La adaptacion consiste en un fine-tune supervisado (SFT) mediante LoRA de rango 32, posteriormente fusionado en los pesos base, lo que produce un checkpoint denso sin adaptadores separados. El corpus de entrenamiento es un conjunto publico de codigo Rust con licencia Apache-2.0, filtrado hasta 74.606 ejemplos que generan codigo. La model card no detalla el numero total de tokens, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO adicionales.

Un detalle tecnico relevante es la sensibilidad al prompt documentada por el autor: el modelo responde mejor cuando se le pide el cuerpo completo de una funcion en terminos llanos ("Write the complete body of the Rust function below") que cuando se le pide completar codigo indicando que devuelva solo el fragmento faltante, formulacion que produce respuestas truncadas. Esta asimetria sugiere que el dataset de SFT contiene filas con objetivos de distinta granularidad (fragmentos cortos frente a cuerpos completos) y que el modelo replica el estilo del objetivo segun el enunciado.

## Capacidades

- Generacion y completado de codigo Rust, con enfasis en cuerpos de funcion completos.
- Conversacion multi-turno en formato chat (chat_template incluido en el repositorio).
- Generacion de texto general heredada del modelo base Qwen2.5-Coder-0.5B-Instruct.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; el modelo esta orientado a completado puntual.
- Capacidades multilingues: solo ingles declarado; el codigo Rust es el dominio principal.
- Capacidades especiales (modo thinking, vision, audio): no disponibles.
- Despliegue local-first: pesos en safetensors y GGUF, y publicacion en Ollama.

## Casos de uso

- Autocompletado de Rust en el editor: el modelo genera el cuerpo de una funcion a partir de su firma y un enunciado en lenguaje natural, adecuado para integraciones tipo plugin donde la latencia y el coste importan mas que la calidad maxima.
- Enrutamiento por niveles de coste: al ser el modelo mas barato de la pila ThoxRoute, puede absorber peticiones triviales de completado y delegar las complejas a modelos mayores, reduciendo el coste medio por peticion.
- Generacion de tests unitarios en Rust: dado un fragmento de codigo, el modelo puede producir esqueletos de pruebas, utiles como borrador que el desarrollador revisa antes de commit.
- Documentacion de funciones: a partir del cuerpo de una funcion Rust, generar comentarios de documentacion y descripciones de parametros, tarea de baja complejidad que no exige un modelo grande.
- Prototipado en local sin conexion: con el GGUF Q8_0 y Ollama, el modelo se ejecuta en un portatil para asistencia de codigo offline, sin enviar codigo a servicios externos.
- Educacion y ejemplos de Rust: generar ejemplos didacticos de sintaxis, iteradores, pattern matching o manejo de errores con `Result`, con la advertencia de que el codigo debe compilarse y revisarse.
- Preprocesado en pipelines de CI: generar borradores de parches o sugerencias de refactor sobre los que un revisor humano decide, nunca aplicarlos de forma automatica.

## Benchmarks y rendimiento

Evaluacion sobre MultiPL-E HumanEval-Rust, 156 problemas, ejecutados (cada generacion se compila y se ejecutan sus aserciones), decodificacion greedy, ambos modelos puntuados en el mismo trabajo:

| Modelo | Modo completion | Modo chat |
|---|---|---|
| Base (Qwen2.5-Coder-0.5B-Instruct) | 21,15% (33/156) | 25,64% (40/156) |
| ThoxEdge-RustCoder-0.5B | 25,64% (40/156) | 28,21% (44/156) |
| Delta | +4,49 pp | +2,57 pp |

El suelo de ruido del arnes es de aproximadamente mas o menos un problema (mas o menos 0,64 pp); ambos deltas lo superan, y cualquier diferencia inferior a 1,5 pp debe tratarse como empate. El criterio de correccion es deliberadamente generoso (una respuesta que devuelve solo el cuerpo o la funcion completa pasa si cualquiera de las dos compila y supera las aserciones), por lo que estos numeros no son comparables con los leaderboards publicados de MultiPL-E. El autor indica ademas que no se ha publicado ningun resultado de THOX GATE49 para este modelo. No hay datos de MMLU, HumanEval generico, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 494 millones de parametros, la inferencia en FP16 requiere aproximadamente 1 GB de pesos mas overhead de activaciones y cache KV; en Q8_0 el fichero GGUF ocupa 531.675.904 bytes (unos 0,5 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior ejecuta el modelo con holgura. En A100 o H100 el modelo queda limitado por latencia, no por memoria.
- Cabe en GPU consumer: si, en practicamente todas las GPU con 2 GB o mas de VRAM, e incluso en CPU.
- Nota del autor sobre dispositivos: la escalera GGUF ocupa solo unos 260 MB porque una gran parte de los parametros esta en el embedding, que no se cuantiza tanto; por ello el modelo no encaja en los dispositivos mas pequenos de THOX.
- Opciones de despliegue: transformers (safetensors), llama.cpp con el GGUF Q8_0, Ollama (`ollama run thox-ai/thoxedge-rustcoder-0.5b`) y text-generation-inference segun los tags del repositorio. vLLM no se menciona en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MultiPL-E HumanEval-Rust (chat) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThoxEdge-RustCoder-0.5B | 0,5B | no disponible | 28,21% (44/156) | Apache-2.0 | HF, Ollama |
| Qwen2.5-Coder-0.5B-Instruct (base) | 0,5B | no disponible | 25,64% (40/156) | Apache-2.0 | HF |
| Alternativas de 0,5B especializadas en Rust | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion con datos en la informacion proporcionada es frente al modelo base, del que este checkpoint mejora 2,57 pp en modo chat y 4,49 pp en modo completion sobre el mismo arnes. No se dispone de datos de otros modelos comparables de la misma categoria.

## Limitaciones y advertencias

- Calidad limitada por el tamano: con 0,5B de parametros, el modelo falla con frecuencia en tareas de Rust no triviales; el propio autor lo califica como no un buen programador de Rust.
- Alta sensibilidad al prompt: formular la peticion como "Complete the Rust code. Output only the missing code." hace caer el resultado medido a 2,56%, frente al 28,21% con la formulacion recomendada. En produccion es imprescindible fijar y versionar la plantilla de prompt.
- Riesgo de alucinacion: puede generar APIs inexistentes, firmas incorrectas o codigo que no compila; toda salida debe compilarse y ejecutarse antes de su uso.
- Sesgos: no se documentan sesgos especificos; al entrenarse sobre un corpus publico de Rust, hereda los sesgos y estilos de ese corpus.
- Limitacion de idioma: solo declara ingles; el rendimiento en castellano no esta evaluado ni garantizado.
- Contexto: la longitud de contexto no se documenta en la informacion disponible; no debe asumirse la del modelo base sin verificacion.
- Licencia: Apache-2.0 permite uso comercial, pero el autor restringe el uso previsto a completado de codigo barato en el stack THOX y excluye decisiones medicas, legales, financieras o de seguridad critica sin revision humana, asi como el control no supervisado de dispositivos fisicos sin paso de confirmacion.
- Caveat de evaluacion: los numeros de MultiPL-E no son comparables a leaderboards publicos por el criterio de correccion generoso; solo el delta frente al base es interpretable.
- Madurez: el repositorio tiene 1.688 descargas y 1 like en el momento de la consulta, lo que indica una adopcion muy baja y poca validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Thox-ai/ThoxEdge-RustCoder-0.5B
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct
- Ollama: `ollama run thox-ai/thoxedge-rustcoder-0.5b`
- Descarga via CLI: `hf download Thox-ai/ThoxEdge-RustCoder-0.5B --local-dir ./ThoxEdge-RustCoder-0.5B`
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada.
