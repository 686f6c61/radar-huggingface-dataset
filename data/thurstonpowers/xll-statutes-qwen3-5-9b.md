# thurstonpowers/xll-statutes-qwen3.5-9b

## Resumen

XLL Statutes Qwen3.5-9B v2 es un adaptador LoRA desarrollado por el usuario thurstonpowers que convierte texto de estatutos federales estadounidenses en un arbol USLM (United States Legislative Markup) con estructura nativa de origen. No es un modelo independiente: se carga sobre Qwen/Qwen3.5-9B, un modelo base de 9.000 millones de parametros, y su funcion es exclusivamente la conversion de texto legal plano a una representacion jerarquica en JSON con spans de offsets de caracteres Unicode.

El adaptador define un contrato de tarea muy estricto. La entrada no es texto plano de estatutos, sino un indice lexico disperso y sin perdida del texto fuente: una linea de cabecera seguida de fragmentos con formato `start:end|JSON-string` que cubren cada caracter no espacio ASCII. La salida es un unico objeto JSON `{"tree":[tag,start,end,attributes,children]}` donde cada nodo tiene cinco campos y los spans apuntan al texto original, no al mensaje codificado. Esta disenado para pipelines de estructuración legal que necesitan preservar la fidelidad textual exacta y la jerarquia de provisiones.

Es relevante ahora porque aborda un problema concreto del procesamiento de documentacion legislativa: la conversion determinista de estatutos a XML estructurado sin regenerar texto, lo que reduce el riesgo de alteracion del contenido legal. El autor advierte explicitamente de que la version v2 introduce un contrato de tarea nuevo respecto a la linea v1 y que sus puntuaciones no son comparables entre si. El repositorio ocupa 0,5 GB y acumula 32 descargas, sin likes ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.5-9B |
| Parametros totales | 9.000 millones en el modelo base; parametros del adaptador no disponibles |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens en el runtime evaluado |
| Tipos de cuantizacion | no disponible; el autor especifica BF16 para inferencia |
| Idiomas soportados | no disponible; la tarea es en ingles legal estadounidense |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-9B, fijado a la revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`. Se distribuye como adaptador LoRA con `library_name: peft` y pesos en safetensors. La tarea entrenada es la conversion de texto de estatutos federales a un arbol USLM con estructura nativa de origen, bajo el protocolo de prompt `raw-text-uslm-source-native-nested-0.1`. El entrenamiento emplea el dataset `thurstonpowers/xll-statutes-dataset`.

La innovacion tecnica principal es el contrato de representacion: la entrada se codifica como un indice lexico disperso que enumera cada caracter no espacio ASCII con su offset, de modo que el modelo no recibe el texto completo sino una proyeccion sin perdida del mismo. La salida son spans de offsets que indexan el texto original, con la instruccion explicita de copiar el texto de los spans en lugar de regenerarlo. El autor no publica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La decodificacion evaluada es greedy (`do_sample=False`), sin gramatica ni reparacion de salida, con `enable_thinking=False` y un maximo de 4.096 tokens nuevos.

## Capacidades

- Conversion de texto de estatutos federales a arbol USLM en JSON con estructura jerarquica de nodos `[tag,start,end,attributes,children]`.
- Preservacion de tipos de provision jerarquicos: `num`, `heading`, `chapeau`, `content`, `continuation`, `notes`, `references`, tablas y marcado en linea.
- Generacion de spans de offsets Unicode de base cero, con fin exclusivo, ordenados, no solapados y contenidos en el nodo padre.
- Uso de alias de namespace USLM: `g` (schemas.gpo.gov/xml/uslm), `h` (XHTML), `u` (xml.house.gov/schemas/uslm/1.0) y `xml`.
- Codificacion de entrada mediante indice lexico disperso que distingue espacios ASCII de otros espacios (no-break space, narrow no-break space).
- Salida restringida a JSON puro, sin explicaciones ni fences de Markdown.
- No soporta tool calling, function calling, agentes, vision, audio ni modos de razonamiento extendido dentro del contrato entrenado.
- No se declaran capacidades multilingues; el dominio es el ingles legal estadounidense.

## Casos de uso

- Estructuracion de estatutos federales para publicacion XML: el adaptador convierte secciones de texto plano en arboles USLM listos para validacion, manteniendo la jerarquia de provisiones y los offsets exactos al texto fuente.
- Ingesta en pipelines de documentacion legal: integrado tras un codificador que genere el indice lexico disperso, permite transformar lotes de secciones en JSON estructurado para bases de datos documentales.
- Auditoria de fidelidad textual: al copiar el texto desde spans en lugar de regenerarlo, facilita la verificacion de que el contenido legal no se ha alterado durante la conversion.
- Extraccion de referencias y notas: el modelo preserva `references`, `notes` y `continuation` como nodos del arbol, lo que permite a sistemas posteriores enlazar citas normativas.
- Procesamiento de tablas y marcado en linea: al conservar tablas e inline markup dentro de la jerarquia, sirve para digitalizar disposiciones con formato complejo.
- Control de calidad con revision humana: la validacion del arbol (raiz `[0, len(raw)]`, hijos ordenados y contenidos) permite usar el adaptador como primer paso de un flujo con revision humana obligatoria.
- Comparacion de contratos de tarea en investigacion: util para estudiar como distintos protocolos de prompt (v1 frente a v2, o prompt entrenado frente a prompt aclarado) afectan a la exactitud en tareas de estructuración.

## Benchmarks y rendimiento

El autor reporta un unico dato en la model card: con el prompt entrenado se obtuvieron 187/256 exitos exactos, frente a 64/256 con el prompt "aclarado" de benchmark que incluye dos ejemplos ficticios en el apendice, sobre la misma cohorte. No se publican resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible.

| Condicion | Exito exacto | Cohorte |
|---|---|---|
| Prompt entrenado (`PROMPT_TRAINED.txt`) | 187/256 | misma cohorte |
| Prompt aclarado de benchmark (dos ejemplos ficticios) | 64/256 | misma cohorte |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base de 9.000 millones de parametros en BF16 requiere del orden de 18 GB solo para pesos, mas memoria para contexto y cache KV.
- El autor especifica BF16 como precision de inferencia y una ventana de 16.384 tokens con hasta 4.096 tokens nuevos; los inputs que no caben deben rechazarse, no truncarse.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano del modelo base, encajan GPU con 24 GB o mas de VRAM, si bien el autor no confirma modelos concretos.
- Opciones de despliegue: carga mediante PEFT y `transformers` con `apply_chat_template`; el autor no menciona vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XLL Statutes Qwen3.5-9B v2 | 9.000 M (base) + LoRA | 16.384 tokens (runtime evaluado) | Estructuracion USLM de estatutos | no disponible | Hugging Face, 32 descargas |
| XLL Statutes v1 (linea anterior del mismo autor) | 9.000 M (base) + LoRA | no disponible | Particion por lineas (contrato distinto) | no disponible | Hugging Face, preservado por tag y commits |
| Alternativas de estructuración legal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- El adaptador no acepta texto plano de estatutos: solo funciona con el indice lexico disperso generado por el codificador incluido, y pasar texto sin esa codificacion queda fuera del contrato entrenado.
- No debe compararse con la linea v1: el autor advierte que v2 introduce un contrato de tarea nuevo y que las puntuaciones no son una unica metrica comparable.
- El prompt de sistema debe usarse byte a byte; anadir envoltorios de rol, descripciones de esquema o fences de Markdown degrada el resultado.
- El prompt "aclarado" de benchmark con ejemplos ficticios no es la interfaz entrenada y redujo el exito exacto de 187/256 a 64/256.
- Un JSON sintacticamente valido no implica un arbol correcto: es obligatorio validar la estructura (raiz `[0, len(raw)]`, hijos ordenados, no solapados y contenidos) y mantener revision humana.
- Los spans apuntan al texto original `raw`, no al mensaje codificado; aplicar offsets al mensaje de usuario produce resultados incorrectos.
- Riesgo de alucinacion estructural: aunque el diseno exige copiar texto desde spans, el modelo podria generar atributos o jerarquias incorrectas; no se han publicado evaluaciones de sesgo.
- Licencia no declarada: no hay confirmacion de permisos para uso comercial, por lo que debe verificarse antes de produccion.
- Idiomas no declarados y dominio limitado a estatutos federales de EE. UU.; no se garantiza comportamiento fuera de ese dominio.
- El modelo base esta fijado a una revision concreta; usar otra revision puede alterar el comportamiento del adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/thurstonpowers/xll-statutes-qwen3.5-9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Dataset de entrenamiento: https://huggingface.co/datasets/thurstonpowers/xll-statutes-dataset
- Paper, blog, repositorio o demo: no disponible en la informacion proporcionada.
