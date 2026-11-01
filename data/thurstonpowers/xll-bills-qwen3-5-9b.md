# thurstonpowers/xll-bills-qwen3.5-9b

## Resumen

XLL Bills Qwen3.5-9B es un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-9B desarrollado por el usuario thurstonpowers. Su proposito es convertir proyectos de ley estadounidenses (U.S. bills) en una representacion JSON estructural denominada XLL, alineada con el texto fuente. No es un modelo de proposito general ni compite con modelos frontera: es una herramienta de extraccion de estructura para un dominio juridico muy concreto.

El modelo no acepta texto plano de un proyecto de ley. Requiere una entrada indexada sin perdida (un indice lexico disperso con formato `start:end|JSON-string`) que representa la proyeccion de texto visible del documento. La salida es un arbol JSON con el formato `{"tree":[tag,start,end,attributes,children]}`, donde los spans son desplazamientos de caracteres Unicode sobre el texto original. Esta interfaz de entrada es parte del contrato de entrenamiento y no debe sustituirse por un prompt arbitrario.

El checkpoint liberado corresponde a un entrenamiento de 2 epocas en BF16 sobre el corpus completo. El autor reporta un 98,5% de salidas JSON validas y un 78,0% de coincidencia exacta, frente a un 95,5% y 77,0% de una ablacion de 1 epoca sobre el mismo corpus y receta. La licencia es Apache 2.0 y el modelo se distribuye junto con el prompt entrenado, un ejemplo de entrenamiento, la evidencia de evaluacion y el dataset de replicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-9B) |
| Parametros totales | 9B (heredados del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens (contexto entrenado, sin truncamiento) |
| Tipos de cuantizacion | no disponible (el autor especifica BF16 para inferencia) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de transformers; se indica BF16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, revision `c202236235762e1c871ad0ccb60c8ee5ba337b9a`, y se ha sometido a un ajuste fino completo de todo el lenguaje (full-language fine-tune), no a un adaptador LoRA. El entrenamiento se realizo sobre el dataset `thurstonpowers/xll-bills-structure-indexed`, con una receta de 2 epocas en BF16. Se documenta una ablacion de 1 epoca sobre el mismo corpus y receta, lo que permite comparar el efecto del numero de epocas en la calidad de la conversion.

La innovacion tecnica principal no esta en la arquitectura, sino en el protocolo de entrada y salida. La entrada es una representacion indexada sin perdida del texto del proyecto de ley: cada fragmento no espacial se codifica como `start:end|JSON-string`, y las posiciones no listadas se rellenan con espacios ASCII para recuperar la longitud exacta del texto. La salida es un arbol de estructura legislativa con spans sobre el texto original. El prompt de sistema esta congelado y debe usarse byte a byte, sin envoltorios de rol, descripciones de esquema ni bloques Markdown. La decodificacion recomendada es greedy (`do_sample=False`), en BF16 y sin gramatica ni reparacion de salida.

## Capacidades

- Conversion de proyectos de ley estadounidenses a JSON estructural XLL alineado con el texto fuente.
- Extraccion de jerarquia legislativa: etiquetas de secciones, encabezados, enumeradores y texto.
- Generacion de spans de caracteres Unicode (base cero, fin exclusivo) sobre el texto original recuperado.
- Produccion de arboles con hijos ordenados, no solapados y contenidos en el padre, con raiz que cubre el texto completo.
- Manejo de entradas de hasta 32.768 tokens sin truncamiento.
- No soporta tool calling ni function calling segun la informacion disponible.
- No se documentan capacidades de agente, razonamiento multi-paso, vision ni audio.
- No se documentan capacidades multilingues especificas.
- No dispone de modo thinking: el ejemplo de uso desactiva explicitamente `enable_thinking=False`.

## Casos de uso

- Digitalizacion estructurada de proyectos de ley: el modelo convierte el texto indexado de un bill en un arbol JSON con jerarquia legislativa, lo que permite alimentar bases de datos normativas y sistemas de busqueda estructurada. Es adecuado porque su entrenamiento esta especificamente orientado a la jerarquia de bills estadounidenses.
- Construccion de pipelines de analisis legislativo: a partir de la salida XLL, un equipo puede extraer secciones, enmiendas y enumeradores de forma programatica para generar resumenes o comparativas entre versiones de un proyecto de ley.
- Auditoria de fidelidad textual: como los spans apuntan al texto original y el modelo debe copiar el texto de los spans en lugar de reescribirlo, la salida sirve para verificar que la estructura extraida corresponde exactamente al documento fuente, con revision humana posterior.
- Procesamiento por lotes de corpus legislativos: el modelo puede procesarse en BF16 con decodificacion greedy sobre documentos que quepan en 32.768 tokens, lo que facilita la conversion masiva de colecciones de bills con un coste de despliegue menor que el de modelos frontera.
- Integracion en herramientas de cumplimiento normativo: equipos juridicos y regulatorios pueden usar la estructura extraida para mapear obligaciones y referencias cruzadas dentro de un proyecto de ley antes de su aprobacion.
- Generacion de datos de entrenamiento para otros modelos: la salida XLL validada y revisada por humanos puede emplearse como corpus etiquetado para entrenar o evaluar modelos de extraccion de estructura en el dominio legal.
- Investigacion en extraccion de estructura: el modelo y su dataset de replicacion permiten reproducir la receta y comparar variantes (por ejemplo, la ablacion de 1 epoca frente a 2 epocas) en condiciones controladas.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son las tasas de validez y coincidencia exacta del checkpoint liberado frente a la ablacion de 1 epoca. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

| Metrica | Checkpoint liberado (2 epocas) | Ablacion (1 epoca) |
|---|---|---|
| Salidas JSON validas | 98,5% | 95,5% |
| Coincidencia exacta | 78,0% | 77,0% |

La evaluacion emplea limites de finalizacion por bin de 1.536, 2.304, 4.608, 6.656 y 16.384 tokens, y trata los casos que alcanzan el limite como fallos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de un modelo de 9B en BF16, se requiere un orden de magnitud de decenas de GB, aunque el autor no publica una cifra concreta.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el autor no confirma que quepa en GPU de consumo.
- Opciones de despliegue: transformers con el tokenizer y el chat template de Qwen/Qwen3.5-9B en la revision indicada; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: el autor indica explicitamente que la mejor relacion coste-eficacia y el throughput de servicio no se han medido.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La unica comparacion documentada es interna, frente a la ablacion de 1 epoca del mismo modelo sobre el mismo corpus.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| XLL Bills Qwen3.5-9B | 9B | 32.768 tokens | Apache 2.0 | HuggingFace |
| Ablacion 1 epoca (mismo autor) | 9B | 32.768 tokens | no disponible | no disponible |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no acepta texto plano: pasar texto sin indexar o aplicar los offsets de salida al mensaje indexado queda fuera del contrato entrenado y no debe esperarse que reproduzca la precision reportada.
- El prompt de sistema debe usarse byte a byte; anadir envoltorios de rol, descripciones de esquema o bloques Markdown puede degradar la salida.
- La salida debe validarse: se espera exactamente un objeto JSON con la forma `{"tree":[tag,start,end,attributes,children]}`, con raiz `[0, len(raw)]` y hijos ordenados, no solapados y contenidos en el padre.
- El autor recomienda mantener revision humana de la salida; un JSON sintacticamente valido no garantiza correccion estructural.
- Los inputs que no quepan en 32.768 tokens deben rechazarse, no truncarse.
- El modelo esta especializado en proyectos de ley estadounidenses y no es un competidor de proposito general de modelos frontera.
- No es el adaptador de statutes ni produce XML USLM autonomo.
- No se han medido el coste-eficacia ni el throughput de servicio.
- No se documentan sesgos conocidos, riesgo de alucinacion especifico ni limitaciones de idioma en la informacion disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de la conversion en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thurstonpowers/xll-bills-qwen3.5-9b
- Dataset de replicacion: https://huggingface.co/datasets/thurstonpowers/xll-bills-structure-indexed
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
