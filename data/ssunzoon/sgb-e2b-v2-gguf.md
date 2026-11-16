# ssunzoon/sgb-e2b-v2-GGUF

## Resumen

SGB-e2b-v2 es un ajuste fino mediante LoRA del modelo google/gemma-4-E2B-it, publicado por el usuario ssunzoon en Hugging Face y distribuido exclusivamente en formato GGUF. Su proposito es asistir al profesorado de educacion primaria de Corea del Sur en la redaccion de frases para el "saenggibu" (생활기록부), el expediente escolar oficial que recoge observaciones de conducta, evaluaciones por asignatura, actividades autonomas, clubes, orientacion vocacional, voluntariado, deporte escolar y entrevistas de tutoria. El modelo recibe una lista de palabras clave y un area concreta y devuelve oraciones en estilo nominal, que es el registro exigido en estos documentos.

El modelo base es un Gemma 4 de la variante E2B, con 4.647.450.147 parametros totales segun los pesos en safetensors del repositorio. El repositorio pesa 3,4 GB y el unico archivo publicado es una cuantizacion Q4_K_M de aproximadamente 3,3 GB, pensada para ejecutarse en equipos de sobremesa con 16 GB de RAM o con GPU dedicada. La longitud de contexto, la composicion del dataset de ajuste y los detalles del entrenamiento no se han publicado en la informacion disponible.

Su relevancia es acotada pero clara: cubre una tarea administrativa muy especifica del sistema educativo coreano, con un formato de entrada definido y una licencia permisiva (Apache 2.0), lo que facilita su integracion en herramientas internas de centro. No obstante, el modelo tiene cero descargas y cero likes en el momento de la consulta, no se han publicado benchmarks y su unico idioma declarado es el coreano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: google/gemma-4-E2B-it) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (unico archivo publicado: `sgb-e2b-v2-Q4_K_M.gguf`, ~3,3 GB) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Ajuste | LoRA sobre google/gemma-4-E2B-it |
| Tamano del repositorio | 3,4 GB |
| Etiquetas | gguf, education, korean, conversational, endpoints_compatible |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base google/gemma-4-E2B-it (tipo de transformer, atencion, vocabulario o contexto maximo). Lo que si se documenta es el procedimiento de adaptacion: un ajuste fino con LoRA sobre dicho modelo base, orientado a una unica tarea generativa de texto en coreano. El resultado se distribuye como GGUF cuantizado en Q4_K_M, lo que indica que el autor priorizo la inferencia local en hardware de consumo frente a la precision completa.

Tampoco se especifican el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros del LoRA (rango, alpha, capas objetivo). La model card unicamente declara que no se utilizaron expedientes escolares reales con datos personales de alumnos en el entrenamiento, lo que constituye la unica garantia documentada sobre procedencia de datos. No hay informacion sobre innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto en coreano con registro nominal, adaptado al estilo administrativo del expediente escolar.
- Redaccion guiada por area: 행발 (observaciones de conducta), 교과세특 (observaciones por asignatura), 자율 (actividades autonomass), 동아리 (clubes), 진로 (orientacion vocacional), 봉사 (voluntariado), 스포츠클럽 (deporte escolar) y 학생상담 (entrevistas de tutoria).
- Entrada estructurada mediante el formato `[영역/과목/약 N자] 키워드1, 키워드2, ...`, donde se indica el area, la asignatura y la longitud aproximada deseada.
- Conversacion basica: la etiqueta `conversational` sugiere uso en formato de dialogo, aunque no se documentan plantillas de chat especificas.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que permite su despliegue tras una API compatible con el ecosistema Hugging Face.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Redaccion de observaciones de conducta: el docente introduce palabras clave sobre el comportamiento observado de un alumno y el area `행발`, y el modelo devuelve una o varias frases en estilo nominal listas para revision.
- Observaciones por asignatura: con el formato `[교과세특/수학/약 100자]`, el profesor obtiene un borrador de observacion especifica de la materia con la longitud aproximada solicitada.
- Registro de actividades de clubes y voluntariado: el modelo transforma una lista de actividades realizadas en una descripcion continua adecuada para las secciones `동아리` y `봉사`.
- Orientacion vocacional: a partir de intereses y aptitudes declarados por el alumno, genera un parrafo para la seccion `진로` que el orientador revisa y ajusta.
- Deporte escolar y actividades autonomass: sintetiza la participacion en `스포츠클럽` o en actividades de autonomia en una frase administrativa breve.
- Preparacion de entrevistas de tutoria: genera un borrador de resumen para `학생상담` a partir de notas sueltas del tutor, que despues se contrasta con la situacion real del alumno.
- Herramienta interna de centro: al ser un GGUF de 3,3 GB y licencia Apache 2.0, puede desplegarse en un equipo de secretaria con 16 GB de RAM y ejecutarse sin conexion, evitando enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada: el autor recomienda al menos 16 GB de RAM en equipos sin GPU dedicada; el archivo Q4_K_M ocupa aproximadamente 3,3 GB, por lo que la carga en memoria es moderada pero el contexto y el runtime anaden overhead.
- GPU recomendadas: no se especifican. Por tamano, una GPU consumer con 8 GB o mas de VRAM deberia poder alojar el modelo cuantizado; no hay datos verificados de latencia ni throughput.
- Viabilidad en GPU de consumo: probable en tarjetas tipo RTX 3060/4060 en adelante por capacidad de memoria, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp y derivados (Ollama, LM Studio, llama-cpp-python) al ser formato GGUF; tambien servidores compatibles con endpoints segun la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| ssunzoon/sgb-e2b-v2-GGUF | 4.647.450.147 | no disponible | ko | Apache 2.0 | GGUF (Q4_K_M) | Ajuste LoRA para expedientes escolares coreanos |
| google/gemma-4-E2B-it | no disponible | no disponible | no disponible | no disponible en esta ficha | no disponible | Modelo base sin ajuste; proposito general |
| Alternativas especializadas en redaccion escolar coreana | no disponible | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la informacion disponible |

## Limitaciones y advertencias

- El autor advierte explicitamente de que las frases generadas deben ser verificadas por el docente en cuanto a hechos y expresiones antes de su uso; el modelo puede malinterpretar situaciones, en especial en los registros de entrevistas de tutoria.
- Riesgo de alucinacion: al tratarse de un ajuste fino pequeno sobre un modelo base, puede inventar actividades, logros o detalles no presentes en las palabras clave de entrada.
- Idioma: solo se declara soporte de coreano; no hay garantia de calidad en otros idiomas.
- Ambito muy restringido: el modelo esta disenado para una unica tarea administrativa y no es adecuado como asistente general.
- Datos personales: la model card afirma que no se usaron expedientes reales con informacion personal en el entrenamiento, pero el usuario debe cumplir la normativa de proteccion de datos aplicable al tratar informacion de menores.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de Gemma conviene revisar los terminos de uso del modelo base de Google para confirmar compatibilidad.
- Madurez: cero descargas y cero likes, sin benchmarks publicados ni validacion independiente; no se recomienda su uso en produccion sin una evaluacion propia.
- No se documentan limitaciones de contexto concretas porque la longitud de contexto no esta disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ssunzoon/sgb-e2b-v2-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos del autor.
