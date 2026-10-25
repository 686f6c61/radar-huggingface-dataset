# wizdroid/minimax-cheatsheat

## Resumen

`wizdroid/minimax-cheatsheat` no es un modelo de aprendizaje automatico: es un repositorio de HuggingFace que contiene una hoja de calculo (`.xlsx`) con un banco de frases para redactar prompts del sistema de generacion de video MiniMax Hailuo H3. El autor, `wizdroid`, lo publica bajo licencia MIT y lo describe explicitamente como un "cheatsheet": 184 filas organizadas en 12 hojas tematicas (movimientos de camara, encuadre y optica, cortes, biblioteca de voces, expresiones faciales, dialogo e idiomas, sonido, iluminacion, modos de referencia y estructura de prompt) mas una hoja de referencias bibliograficas. El repositorio no incluye pesos, tokenizador, configuracion de inferencia ni codigo de ejecucion.

El problema que resuelve es de naturaleza practica y de ingenieria de prompts: fijar un vocabulario comun (verbos oficiales de camara, marcadores de retencion, identificadores de hablante, etiquetas de estructura) para que los prompts de video sean reproducibles entre miembros de un equipo y entre ejecuciones. Es relevante ahora porque los sistemas de generacion de video condicionados por texto, imagen inicial, imagen final o referencias exigen una gramatica de prompt mucho mas estricta que la generacion de texto, y la mayoria del conocimiento practico circula en notas dispersas en lugar de en artefactos versionados y parseables.

En cuanto a especificaciones tecnicas del modelo subyacente (MiniMax Hailuo H3), la informacion proporcionada no las incluye: no hay datos de arquitectura, numero de parametros, longitud de contexto ni cuantizaciones. Cualquier cifra al respecto en esta ficha seria inventada, por lo que se marca como "no disponible". La ficha, por tanto, evalua el artefacto real publicado: un documento de referencia estructurado, no un modelo ejecutable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: el repositorio no contiene un modelo. Es una hoja de calculo de prompts para MiniMax Hailuo H3 |
| Parametros totales | No disponible (no se publican pesos) |
| Parametros activos | No disponible (no se indica que el sistema subyacente sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (no hay pesos que cuantizar) |
| Idiomas soportados | `en` en el contenido del cheatsheet; incluye una hoja de "Dialogue & Languages" con 21 filas sobre script nativo y texto en pantalla |
| Licencia | MIT |
| Formato de pesos | No contiene pesos. El artefacto es `miniax-h3-cheatsheet-categorized.xlsx` |
| Tipo de artefacto | Banco de frases / documentacion de ingenieria de prompts |
| Volumen de contenido | 184 filas indexadas en "Table 1", replicadas en 11 hojas tematicas + 1 hoja de referencias (15 notas) |
| Autor | wizdroid |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-25T11:42:15Z |
| Ultima actualizacion | 2026-10-25T11:44:51Z |
| Pipeline de HuggingFace | No disponible |

## Arquitectura y entrenamiento

No hay arquitectura ni entrenamiento que describir: el repositorio no contiene un modelo, no se ha entrenado ningun artefacto y no se documenta proceso de preentrenamiento, ajuste supervisado, RLHF ni DPO. Lo que si tiene estructura interna es el propio documento, y conviene conocerla porque condiciona su uso. Cada hoja de contenido usa cinco columnas fijas: `Category` (familia de la frase), `Keyword or Element` (nombre del movimiento, tono o regla), `Snippet or Description Template` (el texto literal que se pega en el prompt, con huecos a rellenar), `Usage Example` (la frase insertada en un plano completo) y `Source` (un entero que remite a la hoja de bibliografia).

La organizacion tematica esta cuantificada por el autor: Camera Moves (25 filas), Framing & Lens (18), Shot Cuts & Editing (6), Voice Library (23), Vocal Delivery (12), Faces & Performance (35), Dialogue & Languages (21), Sound & Music (12), Lighting, Color & Look (14), Reference Modes (11) y Prompt Structure (7). La hoja de voces usa identificadores concretos (F1–F10, M1–M11, K1, K2) para lineas de timbre cuando no existe audio de referencia. La parte mas tecnica es la dedicada a Ref2VA, que impone seis secciones ordenadas (`subject_definitions`, `summary`, `retention_analysis`, `detailed_description`, `overall_soundscape`, `non_diegetic_music`), un tipo de tarea entre corchetes al inicio de `summary` y marcadores cerrados de retencion (`fully_preserved`, `partially_preserved`, `attribute_transfer`, `weak_reference`) y de audio (`fully_copy`, `partially_copy`, `reference`, `weak_reference`).

Como innovacion de metodo, el autor impone reglas de estilo verificables: conservar el verbo oficial, anclar el movimiento a un elemento del plano (`toward…`, `revealing…`, `as…`) y limitar a un solo movimiento de camara por plano. Tambien distingue los cinco modos de entrada del sistema subyacente: T2VA (solo texto), I2VA (una imagen como primer fotograma exacto), FL2VA (primer y ultimo fotograma), L2VA (una imagen como ultimo fotograma) y Ref2VA (referencias de personaje, vestuario, lugar, movimiento o voz, que no son fotogramas literales). Nada de esto viene acompanado de metricas de eficacia: no se documenta ningun experimento que mida si las frases mejoran la adherencia del video generado.

## Capacidades

- Proporciona un vocabulario cerrado de movimientos de camara (push, pull, zoom, track, truck, pan, tilt, pedestal, arc, roll, static, POV, shake) con parametros de amplitud (`small`/`large`) y velocidad (`slow`/`fast`).
- Estandariza el encuadre y la optica: tamano de plano, angulo, redaccion para objetivos de 50 mm y 85 mm, y un banco de frases orientado a mantener rostros legibles ("face-safe").
- Define lineas de corte y marcas temporales con formato `00:03.000`, con la regla de que el plano 1 no lleva marca temporal.
- Suministra una biblioteca de voces sin audio de referencia mediante identificadores F1–F10, M1–M11, K1 y K2, mas 12 filas de ritmo y entrega vocal.
- Especifica marcado de dialogo: identificadores de hablante `(S1)`, etiqueta `<d>`, script nativo, cierre de labios tras la linea y texto en pantalla.
- Cubre estructura sonora con `overall_soundscape`, foley, banda sonora y una regla de "solo dialogo" propia del sistema.
- Incluye control de iluminacion, etalonaje, grano, difusion, superficies mojadas y relacion de aspecto (14 filas).
- Documenta los modos de referencia Ref2VA, I2VA, FL2VA y L2VA con prefijos de tipo de tarea, bloqueo de identidad y marcadores de retencion.
- Fija la gramatica de apertura del prompt (`The target video is …`) y el etiquetado de secciones.
- Aporta una checklist de preflight y una guia de resolucion de problemas, segun la hoja de referencias (notas 9 y 10).
- No ofrece inferencia, tool calling, agentes, vision ni razonamiento: es documentacion de solo lectura.

## Casos de uso

- **Estandarizacion de prompts en un equipo de produccion de video:** el cheatsheet actua como glosario compartido para que varios operadores redacten prompts de camara y encuadre con la misma sintaxis, reduciendo variabilidad entre entregas. Es adecuado porque las frases ya estan redactadas como fragmentos pegables, no como conceptos.
- **Construccion de plantillas programaticas:** el `.xlsx` se puede exportar a JSON o YAML y consumirse desde un generador de prompts que combine plantillas de camara, iluminacion y voz de forma determinista. La estructura de cinco columnas con `Category` y `Keyword or Element` como claves facilita el mapeo a un esquema.
- **Control de continuidad entre planos con primer y ultimo fotograma:** las hojas de modos de referencia y de cortes permiten describir con precision la transicion FL2VA y las marcas temporales, util en secuencias narrativas cortas donde la continuidad de vestuario o decorado es critica.
- **Consistencia de personaje y vestuario en series:** los marcadores de retencion (`fully_preserved`, `partially_preserved`, `attribute_transfer`, `weak_reference`) dan un mecanismo explicito para declarar que atributos deben conservarse, lo que resulta util en episodios con el mismo personaje en multiples planos.
- **Produccion de dialogo y doblaje sintetico:** la combinacion de la Voice Library, Vocal Delivery y Dialogue & Languages permite especificar timbre, ritmo, identificador de hablante y script nativo, lo que sirve para generar escenas habladas con asignacion estable de voces.
- **Localizacion de material audiovisual:** la hoja de idiomas y texto en pantalla (21 filas) incluye el tratamiento de script nativo y rotulacion, aprovechable al adaptar una pieza a distintos mercados manteniendo la puesta en escena.
- **Formacion de nuevos miembros del equipo:** al estar dividido por temas con ejemplos de uso completos, funciona como material de onboarding sobre la gramatica de prompts del sistema, sustituyendo notas dispersas.
- **Auditoria previa al envio de prompts:** la checklist de preflight referenciada permite revisar un lote de prompts antes de consumir cuota de generacion, detectando movimientos de camara multiples o anclajes ausentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de ningun tipo: no hay MMLU, HumanEval, GSM8K ni metricas de calidad de video (FVD, CLIP score, adherencia al prompt). Tampoco se documenta un conjunto de validacion con el que se hayan derivado las frases.

## Requisitos de hardware

- No se requiere GPU ni VRAM para usar este repositorio: es una hoja de calculo. Basta con un equipo capaz de abrir un `.xlsx` (LibreOffice, Excel, Numbers o una libreria como `openpyxl`/`pandas`).
- Para ejecutar el sistema al que se refieren los prompts (MiniMax Hailuo H3) no se aporta informacion: no disponible en la informacion proporcionada.
- No hay opciones de despliegue local documentadas (vLLM, llama.cpp, Ollama, TGI) porque no existen pesos en el repositorio.
- No se publican datos de latencia ni throughput.
- El coste real de uso proviene del servicio de generacion de video subyacente, cuyas condiciones no se detallan en la model card.

## Comparativa con modelos similares

No disponible. La busqueda web realizada no devolvio resultados relevantes sobre este repositorio ni sobre cheatsheets comparables de otros sistemas de generacion de video; los resultados obtenidos no guardan relacion con el contenido tecnico y se descartan. Por la misma razon no es posible comparar parametros, contexto, rendimiento ni licencia con alternativas.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- **No es un modelo:** a pesar de las etiquetas `video-generation` y del nombre del repositorio, no contiene pesos, codigo de inferencia ni pipeline. Cualquier intento de cargarlo con `transformers` fallara.
- **Errata en el identificador:** el nombre del repositorio es `minimax-cheatsheat` (sin la "e" de "cheatsheet"), lo que complica su descubrimiento y favorece errores de referencia.
- **Trazabilidad incompleta:** las 15 notas de la hoja de referencias apuntan a ficheros `.md` (`02-shared-grammar.md`, `10-ref2va.md`, `16-preflight-checklist.md`, etc.) que no constan como parte del repositorio, cuyo unico fichero enlazado es el `.xlsx`. La fuente primaria de muchas frases no es verificable desde el repositorio.
- **Sin validacion empirica:** no se aporta ninguna medicion de que las frases produzcan mejores resultados que un prompt libre. La calidad del contenido depende por completo del criterio del autor.
- **Idioma unico:** el contenido esta en ingles y los prompts estan redactados en ingles; no hay traduccion ni variantes. Usarlo en castellano exige traduccion manual, con riesgo de romper la sintaxis esperada por el sistema.
- **Dependencia de un servicio externo:** la utilidad del documento caduca si MiniMax modifica la gramatica de su sistema de video. No se indica version concreta del modelo mas alla de "H3".
- **Madurez baja:** 0 descargas y 0 likes, creado y actualizado con dos minutos de diferencia el mismo dia. No hay historial de mantenimiento ni issues.
- **Licencia permisiva pero sin garantias:** MIT permite uso comercial y modificacion, pero se distribuye "tal cual", sin garantia de idoneidad ni de exactitud del contenido.
- **Riesgo de confusion en busquedas:** al estar etiquetado con `minimax` y `hailuo`, puede aparecer en resultados de busqueda de pesos del modelo real, lo que induce a error en pipelines automatizados de descubrimiento de modelos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/wizdroid/minimax-cheatsheat
- Fichero del cheatsheet: https://huggingface.co/wizdroid/minimax-cheatsheat/blob/main/miniax-h3-cheatsheet-categorized.xlsx
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) asociados a este repositorio en la informacion proporcionada.
