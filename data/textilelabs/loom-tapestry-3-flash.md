# textilelabs/Loom-Tapestry-3-Flash

## Resumen

Loom Tapestry 3 Flash es un modelo de lenguaje de 7,18 millones de parametros desarrollado por Textile Labs, entrenado desde cero (sin fine-tuning ni destilacion) sobre una CPU de escritorio de cuatro nucleos de 2013 en 48 minutos. Forma parte de la familia Loom, cuyo principio de diseno es ser "knowledge-sparse and behaviour-dense": no pretende acumular conocimiento factual, sino aprender a reconocer el limite de lo que sabe, decidir cuando una pregunta requiere una busqueda, emitir la consulta, leer el resultado y declarar de donde procede la respuesta.

La arquitectura es un transformer decoder-only de tipo Llama con 20 capas, ancho de 192 y una ventana de contexto de 512 tokens. El rasgo mas distintivo es su mecanismo de atribucion calibrada: el modelo distingue explicitamente entre respuestas que provienen de un bloque `<result>` recuperado y respuestas que proviene de su entrenamiento, y no reclama una busqueda que no ha realizado (16/16 en la bateria de aceptacion del autor).

Su relevancia actual es doble. Por un lado, demuestra que con un presupuesto de entrenamiento ajustado (0,94 tokens por parametro) un modelo diminuto puede igualar o superar en comportamiento a versiones anteriores tres veces mas grandes. Por otro, ofrece un banco de pruebas barato y reproducible para investigar honestidad calibrada, atribucion de fuentes y decision de uso de herramientas en entornos sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de tipo Llama; 20 capas, ancho 192 |
| Parametros totales | 7.184.064 (~7,18 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | GGUF (etiqueta declarada en el repo); niveles concretos no especificados |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |
| Optimizador | Muon |
| Hardware de entrenamiento | CPU de escritorio de 4 nucleos (2013), 48 minutos |
| Tokens de entrenamiento | ~6,75 M (derivado de 0,94 tokens/parametro) |
| Perdida de validacion | 2,161 |
| Precision de validacion | 0,607 |
| Libreria | transformers |
| Compatibilidad | endpoints_compatible, text-generation-inference |

## Arquitectura y entrenamiento

El modelo sigue el patron de un transformer decoder-only estilo Llama, con 20 capas —identicas en numero a las del modelo insignia de la familia— y un ancho reducido de 192 en lugar de 320. La decision de diseno documentada por el autor es conservar profundidad y recortar anchura, porque las capacidades que se evaluan (decision de herramienta, atribucion, coherencia multi-turno) dependen del entrenamiento y no de la capacidad bruta. El entrenamiento parte de inicializacion aleatoria, usa el optimizador Muon y se ejecuto integramente en CPU en 48 minutos, con una relacion de 0,94 tokens por parametro.

El corpus de entrenamiento es conversacional y multilingue en cuanto a formato, pero solo en ingles: el 54,8% de los ejemplos son multi-turno, una diferencia sustancial frente a la generacion anterior, que usaba ejemplos de un solo turno con reinicio duro y por tanto perdia el hilo de la conversacion. Las conversaciones con fundamento (grounded) incluyen seguimientos que deben responderse a partir del `<result>` ya presente en el contexto, sin lanzar una segunda busqueda. El autor no documenta el uso de RLHF ni DPO, ni el volumen exacto de tokens del dataset mas alla de la relacion tokens/parametro publicada.

La innovacion tecnica central no es arquitectonica sino de comportamiento: un esquema de atribucion calibrada con etiquetas explicitas (`<tools:on>` / `<tools:off>`, `<lookup>...</lookup>`, `<result>`) que hace que el modelo diferencie entre conocimiento propio y conocimiento recuperado, admita ignorancia cuando la pregunta es intrínsecamente incontestable por terceros y avise cuando una busqueda seria necesaria pero las herramientas estan desactivadas. La model card original aparece truncada en el apartado de advertencias ("Validat..."), por lo que parte de la informacion de uso responsable no esta disponible.

## Capacidades

- Generacion de texto conversacional en ingles, con respuestas breves y formuladas en primera persona.
- Conversacion multi-turno: mantiene el hilo hasta cinco turnos en la bateria de evaluacion (5/5), frente a 4/5 de la generacion anterior.
- Identidad consistente: se identifica como "Loom Tapestry 3 - a Loom model from Textile Labs" (12/12 en el test de identidad).
- Decision de uso de herramientas (tool use): decide si una pregunta requiere un `<lookup>` y emite la consulta; 9/10 aciertos cuando la busqueda es necesaria y 6/10 cuando no lo es.
- Atribucion calibrada: declara si la respuesta procede de un resultado recuperado o de su entrenamiento; 16/16 sin atribuciones falsas.
- Respuesta fundamentada sobre contexto recuperado (retrieval-augmented): responde a partir de un bloque `<result>` inyectado, con 4/5 de acierto sobre resultados curados.
- Autoconocimiento de limites: admite preguntas incontestables ("What is my sister's name" -> "I can't know that unless you tell me"), 6/8.
- Reconocimiento de herramientas desactivadas: no filtra etiquetas `<lookup>` cuando `<tools:off>` (28/28).
- Terminacion autonoma de la generacion sin necesidad de un Modelfile (12/12).
- No soporta vision, audio, ni razonamiento matematico o de codigo relevante segun la informacion disponible.

## Casos de uso

- Capa de decision de retrieval en un pipeline RAG: el modelo puede actuar como enrutador barato que decide, dada una pregunta de usuario, si conviene lanzar una busqueda; su ventaja es que su politica de decision es explicita y auditable, no una caja negra.
- Etiquetado de atribucion en respuestas generadas: dado un `<result>` inyectado, el modelo produce la respuesta marcando si la informacion procede del documento recuperado o de conocimiento propio, lo que permite construir interfaces que muestren la fuente al usuario final.
- Agente conversacional embebido en dispositivos sin GPU: con 7,18 M de parametros cabe en cualquier microcontrolador con unos pocos megabytes de RAM y puede gestionar dialogos de varios turnos con contexto de 512 tokens.
- Prototipado rapido de harnesses de agentes: al tener una interfaz de tool calling sencilla (etiquetas `<lookup>`/`<result>`) y un tiempo de inferencia minimo, sirve para validar la logica de orquestacion antes de escalar a un modelo mayor.
- Investigacion en honestidad calibrada y filosofia de la mente aplicada: es un banco de pruebas reproducible, entrenable en menos de una hora en CPU, para estudiar como se comporta la atribucion de fuentes en modelos diminutos y que fallos aparecen.
- Educacion y docencia: permite mostrar de principio a fin, en un portatil y en una sola sesion practica, el ciclo completo de entrenamiento de un LLM desde inicializacion aleatoria hasta evaluacion de comportamiento.
- Demostraciones offline en ferias o entornos air-gapped: el modelo no requiere red, no necesita GPU y puede distribuirse en un fichero GGUF de pocos megabytes junto con su tokenizador.
- Filtro de primera linea en atencion al cliente: para consultas simples y repetitivas puede responder directamente y escalar el resto, reservando el modelo grande para los casos complejos.

## Benchmarks y rendimiento

Bateria de aceptacion completa del autor, con prompts escritos a mano y excluidos del generador de entrenamiento, puntuados por contenido:

| Prueba | Tapestry 3 Flash | Tapestry 2 | Nota |
|---|---:|---:|---|
| Sin atribucion falsa | 16/16 | 16/16 | nunca reclama una busqueda que no hizo |
| Sin fuga de `<lookup>` con tools off | 28/28 | 28/28 | |
| Se autotermina sin Modelfile | 12/12 | 12/12 | |
| Identidad: nombra Tapestry | 12/12 | 11/12 | |
| Conversacion de 5 turnos mantiene el hilo | 5/5 | 4/5 | |
| Atribucion tras una busqueda real | 5/5 | 4/5 | |
| Responde desde un `<result>` dado | 4/5 | 5/5 | resultados curados; peor con texto real |
| Admite una pregunta incontestable | 6/8 | 4/8 | |
| Decision de herramienta con tools on | 15/20 | 10/20 | 9/10 correcto si hace falta; 6/10 si no |
| Identidad con MAYUSCULAS / typos / "?" | 7/12 | 10/12 | regresion |
| Seguimiento respondido del mismo resultado | 2/5 | 2/5 | |
| Detecta que el resultado no contiene la respuesta | 0/5 | 1/5 | regresion |
| **Total** | **112/133 · 84,2%** | 107/133 · 80,5% | |

Comparativa interna de la familia:

| Modelo | Parametros | Entrenamiento | Tokens/parametro | Perdida val | Precision val |
|---|---:|---:|---:|---:|---:|
| Loom Spark 2 | 19,9 M | 1 h | 0,25 | 2,692 | 0,536 |
| Loom Weave 2 Flash | 19,9 M | 2 h | 0,51 | 2,254 | 0,580 |
| Loom Tapestry 2 | 22,8 M | 5,5 h | 0,87 | 1,963 | 0,622 |
| **Loom Tapestry 3 Flash** | **7,18 M** | **48 min** | **0,94** | 2,161 | 0,607 |

No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; el autor evalua exclusivamente comportamiento conversacional, atribucion y uso de herramientas.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de 7.184.064 parametros): ~28,7 MB en fp32, ~14,4 MB en fp16/bf16, ~7,2 MB en int8 y ~3,6 MB en int4.
- GPU recomendadas: ninguna en particular; el modelo fue entrenado en CPU y la inferencia en CPU es suficiente. Cualquier GPU, incluida una iGPU o una GTX 1050, lo ejecuta sin cuello de botella.
- Cabe sobradamente en GPU de consumo: si, en cualquier RTX, GTX o incluso en una Raspberry Pi 4/5 o en un microcontrolador con unos pocos MB de RAM en cuantizacion int4.
- Opciones de despliegue: transformers (formato safetensors), llama.cpp y Ollama a traves del fichero GGUF, y text-generation-inference (el repo esta marcado como endpoints_compatible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano y la ventana de 512 tokens, en hardware moderno la generacion es del orden de milisegundos por respuesta, pero no hay cifras publicadas.
- Nota: el autor recomienda usar el modelo con su propio harness de etiquetas (`<tools:off>`/`<tools:on>`, `<|eot|>`, `<loom>`); desplegarlo con un chat template generico degrada su comportamiento.

## Comparativa con modelos similares

No hay datos publicados que permitan comparar este modelo con alternativas externas de tamano equivalente (por ejemplo, modelos TinyStories, SmolLM-135M o Qwen2-0.5B) en las mismas pruebas, porque la bateria del autor es propia. La comparacion disponible es interna a la familia Loom:

| Modelo | Parametros | Contexto | Entrenamiento | Bateria de comportamiento | Licencia |
|---|---:|---:|---:|---:|---|
| Loom Tapestry 3 Flash | 7,18 M | 512 | 48 min, CPU | 112/133 · 84,2% | MIT |
| Loom Tapestry 2 | 22,8 M | no disponible | 5,5 h | 107/133 · 80,5% | no disponible |
| Loom Weave 2 Flash | 19,9 M | no disponible | 2 h | no disponible | no disponible |
| Loom Spark 2 | 19,9 M | no disponible | 1 h | no disponible | no disponible |

Frente a modelos de la misma categoria de tamano pero de otros desarrolladores: no disponible.

## Limitaciones y advertencias

- Solo ingles. No hay soporte multilingue declarado; se desconoce el comportamiento en castellano, aunque con 7 M de parametros y un corpus en ingles la calidad esperada en otros idiomas es practicamente nula.
- Contexto muy corto: 512 tokens. No admite documentos largos ni conversaciones extensas sin truncado, y el seguimiento multi-turno ya se degrada a los cinco turnos.
- Conocimiento factual minimo por diseno. El modelo no es fiable como fuente de datos; su funcion es decidir cuando consultar y atribuir correctamente, no recordar.
- Regresion documentada ante entrada degradada: con mayusculas, erratas o interrogaciones atipicas, la identidad baja a 7/12; entradas como "WHO MADE U" reciben la respuesta "I can't know that unless you tell me". El modelo enruta la entrada corrupta hacia la respuesta honesta equivocada. Escribiendo con normalidad, la identidad es 12/12.
- Seguimiento dentro de un mismo resultado recuperado: solo 2/5. Es decir, si la respuesta a una pregunta de seguimiento ya esta en el `<result>` en contexto, el modelo a menudo no la extrae correctamente.
- Deteccion de resultado irrelevante: 0/5. El modelo no detecta que el resultado recuperado no contiene la respuesta buscada, una regresion frente a Tapestry 2 (1/5). En un pipeline RAG real esto puede producir respuestas mal fundamentadas.
- Decision de herramienta imperfecta: 6/10 cuando la busqueda no es necesaria, lo que implica llamadas de retrieval innecesarias en el 40% de los casos de ese subconjunto.
- Rendimiento sobre texto real: el propio autor advierte que el 4/5 en respuestas desde `<result>` corresponde a resultados curados y que la cifra baja "mucho" con texto real; no se publica el valor concreto.
- Precision de validacion del 60,7% y perdida de 2,161: son valores de un modelo muy pequeno; no debe emplearse en tareas que requieran razonamiento fiable.
- Riesgo de alucinacion: mitigado en el eje de atribucion (16/16 sin atribuciones falsas) pero no en el contenido. El modelo puede producir una respuesta incorrecta y atribuirla correctamente a un resultado erroneo.
- Aparece con 0 descargas y 0 likes en HuggingFace, y la model card esta truncada en la seccion de advertencias ("Validat..."), por lo que faltan indicaciones de uso responsable del propio autor.
- Licencia MIT: permite uso comercial, modificacion y redistribucion sin restricciones, siempre que se conserve el aviso de copyright y la licencia. No se declaran sesgos especificos ni filtros de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/textilelabs/Loom-Tapestry-3-Flash
- Model card del autor: incluida en la pagina de HuggingFace (truncada en la seccion de advertencias).
- Paper, repositorio de codigo, blog o demo: no disponibles en la informacion proporcionada.
- Busqueda web: los resultados devueltos (ARD Mediathek y paginas relacionadas) no guardan ninguna relacion con el modelo y no se han considerado como fuentes.
