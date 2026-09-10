# vtava/TinyCeNN-LM-Distilled-v2

## Resumen

TinyCeNN-LM-Distilled-v2 es un modelo de lenguaje experimental desarrollado por vtava que pertenece a la categoria de arquitecturas "transformer-free". Se trata de un estudiante destilado desde el modelo `arnir0/Tiny-LLM` mediante tecnicas de destilacion de conocimiento. El objetivo es comprobar si una red neuronal celular recurrente (CeNN) sin capas de atencion puede alcanzar un rendimiento razonable en tareas de modelado de lenguaje.

El modelo tiene 480.192 parametros entrenables, opera con 7 pasos recurrentes y un campo receptivo de 255 tokens. A diferencia de los transformer convencionales, no contiene capas de atencion y utiliza una arquitectura puramente recurrente. La publicacion incluye un benchmark riguroso con 65.536 tokens de validacion deterministas, revelando una perplejidad de 167.769 frente a los 69.056 del profesor, lo que representa una recuperacion del 84.42% del gap de rendimiento.

No se ha publicado informacion sobre la licencia, los idiomas soportados ni el formato de pesos, lo que limita su uso en aplicaciones de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CeNN recurrente sin capas transformer (7 pasos recurrentes) |
| Parametros totales | 480.192 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (campo receptivo de 255 tokens) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | No disponible; el modelo se construye mediante `tinycenn_lm.build_cenn_student()` |

## Arquitectura y entrenamiento

El modelo es un CeNN (del ingles Cellular Neural Network) recurrente que elimina por completo las capas transformer. Segun la model card, mantiene 0 capas transformer y 7 pasos recurrentes, con un campo receptivo de 255 tokens. Dispone de un total de 480.192 parametros entrenables.

El entrenamiento se realizo por destilacion de conocimiento desde el modelo base `arnir0/Tiny-LLM`, acumulando un total de 40.005.632 tokens de destilacion. La evaluacion se llevo a cabo con un protocolo llamado "rigorous-v2", que utiliza 65.536 tokens de validacion deterministas y un hash SHA256 de referencia. El modelo alcanza una cross-entropy de 5.122586, mientras que el profesor obtiene 4.234912. En perplejidad, el estudiante registra 167.769 y el profesor 69.056, lo que supone una recuperacion del 84.42% del gap entre ambos. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion posterior.

## Capacidades

- Generacion de texto en lenguaje natural, limitada a un campo receptivo de 255 tokens.
- Modelado probabilistico de lenguaje: proporciona medidas de cross-entropy y perplejidad.
- Destilacion de conocimiento: funciona como estudiante del modelo `arnir0/Tiny-LLM`.
- No soporta tool calling ni function calling según la informacion disponible.
- No hay evidencia de soporte para agentes, razonamiento multi-paso, vision o audio.
- Los idiomas soportados no se especifican, por lo que no se puede confirmar capacidad multilingue.

## Casos de uso

- Investigacion sobre arquitecturas sin transformer: el modelo permite estudiar si una red CeNN recurrente puede sustituir la atencion en tareas de modelado de lenguaje a muy pequena escala.
- Docencia en procesamiento del lenguaje natural: sirve para ilustrar la destilacion de conocimiento y la comparacion de metricas como perplejidad y cross-entropy entre un profesor y un estudiante.
- Pruebas de robustez con protocolos deterministicos: el benchmark "rigorous-v2" con tokens de validacion fijos y hash SHA256 facilita la comparacion reproducible de arquitecturas alternativas.
- Despliegue en hardware extremadamente limitado: con menos de 2 MiB de pesos, puede ejecutarse en microcontroladores o dispositivos embebidos para autocompletar texto en dominios muy restringidos, como un teclado predictivo simple.
- Generacion de texto sin conexion en aplicaciones moviles o de escritorio: su minimo tamano permite incluirlo sin depender de APIs externas, aceptando una calidad de lenguaje reducida.
- Baseline de referencia para modelos tiny: los valores publicados de cross-entropy y perplejidad sirven como punto de partida para comparar futuros modelos destilados o recurrentes.

## Benchmarks y rendimiento

Se han publicado los siguientes datos del benchmark interno:

| Metrica | Valor |
|---|---|
| Cross-entropy del estudiante | 5.122586 |
| Cross-entropy del profesor | 4.234912 |
| Perplejidad del estudiante | 167.769 |
| Perplejidad del profesor | 69.056 |
| Recuperacion del gap | 84.42% |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K. El unico punto de comparacion disponible es el modelo profesor `arnir0/Tiny-LLM`.

## Requisitos de hardware

- La VRAM estimada para inferencia es minima: menos de 2 MiB en FP32 y aproximadamente 1 MiB en FP16, segun el numero de parametros.
- No se requiere una GPU para ejecutar el modelo; puede ejecutarse en CPU.
- Si se utiliza GPU, cualquier tarjeta de consumo moderna (por ejemplo, RTX 2080 o superior) es mas que suficiente.
- Las opciones de despliegue no estan documentadas. El modelo se carga mediante la funcion `tinycenn_lm.build_cenn_student()`, sin indicaciones sobre vLLM, llama.cpp, TGI u Ollama.
- La latencia y el throughput no estan especificados.

## Comparativa con modelos similares

La unica comparacion disponible es contra el modelo profesor `arnir0/Tiny-LLM`, del que se conocen los datos del benchmark:

| Modelo | Parametros | Perplejidad | Licencia |
|---|---|---|---|
| `vtava/TinyCeNN-LM-Distilled-v2` (estudiante) | 480.192 | 167.769 | No disponible |
| `arnir0/Tiny-LLM` (profesor) | No disponible | 69.056 | No disponible |

No se han encontrado benchmarks publicos que comparen este modelo con otros modelos del mismo tamano o categoria, por lo que no es posible ofrecer una comparativa mas amplia.

## Limitaciones y advertencias

- El modelo es extremadamente pequeño (480.192 parametros), lo que limita su capacidad para generar texto coherente y mantener conversaciones largas.
- El campo receptivo de 255 tokens restringe la informacion contextual disponible en cada prediccion.
- La perplejidad de 167.769 es alta en comparacion con el profesor (69.056) y con modelos de lenguaje de mayor tamano, lo que indica una calidad de lenguaje baja.
- La licencia no esta disponible, por lo que no se puede determinar si el uso comercial es permitido.
- Los idiomas soportados son desconocidos, y no hay garantia de buen rendimiento en espanol u otros idiomas.
- No se ha documentado el comportamiento frente a sesgos ni alucinaciones. Dado su tamano y su arquitectura, es probable que genere respuestas incoherentes o factualmente incorrectas.
- No soporta tareas multimodales, tool calling, agentes ni razonamiento complejo, por lo que no es adecuado para produccion en escenarios exigentes.

## Enlaces

- HuggingFace: https://huggingface.co/vtava/TinyCeNN-LM-Distilled-v2
- Modelo base citado en la card: arnir0/Tiny-LLM
- No se proporcionan papers, blogs, repositorios adicionales ni demos.
