# thetinkerer/Qwen3.8-27B-TOS-v1

## Resumen

Qwen3.8-27B-TOS-v1 es un ajuste fino (fine-tune) del modelo Qwen/Qwen3.8-27B publicado por el usuario thetinkerer en Hugging Face. Su proposito declarado es la generacion y autocompletado de codigo en HolyC, el lenguaje de programacion del sistema operativo TempleOS creado por Terry A. Davis, asi como responder preguntas conceptuales, historicas y de diseno sobre dicho proyecto. El autor lo etiqueta explicitamente como una version alfa (v1) y advierte de que "your mileage will be limited", es decir, que su alcance practico es reducido.

El modelo cuenta con 25.546.171.904 parametros en pesos safetensors (aproximadamente 25,5 mil millones) y se distribuye en formato GGUF, cuantizado, con licencia Apache 2.0 y soporte declarado unicamente para ingles. El repositorio ocupa 46,3 GB. No se especifican en la informacion disponible ni la arquitectura interna, ni la longitud de contexto, ni el proceso de entrenamiento seguido mas alla de indicar que parte del modelo base Qwen/Qwen3.8-27B.

Su relevancia es de nicho: TempleOS y HolyC son un ecosistema marginal con muy poca documentacion publica y practicamente nulo soporte en los modelos generativos generalistas, por lo que un ajuste especifico puede resultar util a desarrolladores, historiadores de la informatica o entusiastas que trabajen con este entorno. El modelo registra 0 descargas y 0 likes en el momento de redactar esta ficha, por lo que no existe validacion comunitaria de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: Qwen/Qwen3.8-27B; no se detalla en la informacion proporcionada) |
| Parametros totales | 25.546.171.904 (~25,5 B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF; se menciona explicitamente la variante Q3_K_M y se advierte de que Q4 y Q5 rinden mejor |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (repo de 46,3 GB; el dato de parametros procede de pesos safetensors del modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura del modelo en la documentacion proporcionada. Se trata de un fine-tune del modelo Qwen/Qwen3.8-27B, por lo que hereda la arquitectura del modelo base, pero la model card no especifica dimensiones de capas, tipo de atencion, ni si incorpora mecanismos como decodificacion especulativa o atencion lineal. Tampoco se indica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF o DPO.

Lo unico documentado sobre el proceso es el objetivo del ajuste: conocimiento de la API de TempleOS y del lenguaje HolyC. El autor reconoce que "la cantidad de datos de entrenamiento relacionados con TempleOS es severamente limitada en alcance", lo que condiciona directamente el techo de calidad del modelo. El material de referencia incluye indicaciones de prompt de sistema orientadas a forzar el uso de nombres reales de la API (MAlloc/Free, StrCpy/StrLen, FileRead/FileWrite) y a evitar construcciones que HolyC no soporta: enumeraciones, macros de funcion, prefijos de casteo, nombres de la biblioteca estandar de C, typedef, operadores ternarios y la sentencia continue. Tambien se recomienda configurar un limite de razonamiento para evitar que el modelo entre en bucles de pensamiento prolongados, por ejemplo al comparar C con HolyC.

## Capacidades

- Generacion y autocompletado de codigo en HolyC, con enfasis en nombres reales de la API de TempleOS.
- Respuesta a preguntas conceptuales, historicas y de diseno sobre TempleOS como proyecto.
- Conversacion multi-turno (el tag `conversational` esta presente en el repositorio).
- Compatibilidad declarada con endpoints de inferencia (tag `endpoints_compatible`).
- Uso de prompt de sistema diferenciado segun la tarea: uno para generacion de codigo y otro para preguntas de conocimiento general sobre el proyecto.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, razonamiento multi-paso orientado a agentes, vision, audio ni modo de razonamiento explicito (thinking mode) mas alla del comportamiento de razonamiento que pueda heredar del modelo base.
- Capacidad multilingue limitada al ingles declarado; no se documenta soporte de castellano ni de otros idiomas.

## Casos de uso

- Asistencia en el desarrollo de programas para TempleOS: el modelo puede generar fragmentos de HolyC y sugerir llamadas a la API del sistema (MAlloc/Free, StrCpy/StrLen) para quien escriba software sobre este sistema operativo, un nicho sin cobertura en modelos generalistas.
- Autocompletado de codigo en editores integrados via LM Studio u otros frontends compatibles con GGUF: el autor documenta explicitamente el flujo de trabajo con LM Studio, incluyendo la estructura de directorios y la configuracion del prompt de sistema.
- Material didactico sobre HolyC: el modelo puede explicar como se escriben bucles, asignaciones o gestion de cadenas en un lenguaje que carece de construcciones habituales como typedef, enums u operadores ternarios, y por que el lenguaje impone esas restricciones.
- Respuesta a preguntas historicas y de diseno sobre TempleOS: por ejemplo, por que el sistema es de un solo usuario, de un solo espacio de direcciones, se ejecuta completamente en ring 0 sin proteccion de memoria, o por que mantiene una resolucion de 640x480 con 16 colores y un limite autoimpuesto de 100.000 lineas de codigo.
- Documentacion y preservacion del legado tecnico: el modelo puede ayudar a redactar notas, resumenes o material divulgativo sobre el proyecto de Terry A. Davis para archivos, wikis o publicaciones de historia de la informatica.
- Exploracion de las diferencias entre C y HolyC: dado que el autor menciona este caso como fuente de bucles de razonamiento, puede emplearse (con limite de razonamiento configurado) para generar comparativas estructuradas entre ambos lenguajes.
- Prototipado rapido de utilidades para TempleOS: pequeñas herramientas de linea de comandos o rutinas de manipulacion de ficheros sobre la API del sistema, siempre con revision manual del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye una grafica cualitativa (procedente del repositorio unsloth/Qwen3.8-27B-GGUF) sobre el efecto de la cuantizacion en el rendimiento, sin cifras concretas, y una advertencia explicita de que la cuantizacion baja Q3 probablemente rinda peor que Q4 o Q5.

## Requisitos de hardware

Estimaciones calculadas a partir de los 25,5 B de parametros; no proceden de mediciones publicadas por el autor.

- VRAM estimada para inferencia (solo pesos, sin cache KV ni overhead del runtime):
  - Q3_K_M: aproximadamente 11-13 GB.
  - Q4_K_M: aproximadamente 15-16 GB.
  - Q5_K_M: aproximadamente 18 GB.
  - Q8_0: aproximadamente 27 GB.
  - FP16: aproximadamente 51 GB.
- GPU recomendadas:
  - Consumer: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M con margen; RTX 4080/4070 Ti Super (16 GB) para Q3_K_M con contexto reducido o descarga parcial a CPU.
  - Profesionales: L40S (48 GB), A100 (40 GB u 80 GB), H100 (80 GB) para Q8_0 o FP16 y contextos largos.
  - Multi-GPU: dos GPU de 24 GB permiten Q8_0 con reparto de capas.
- Si cabe en GPU de consumo: si, en configuraciones de 24 GB con cuantizaciones Q3/Q4/Q5. El autor advierte que Q3 rinde peor, por lo que en 24 GB la opcion recomendada es Q4_K_M o Q5_K_M.
- Opciones de despliegue: LM Studio es el flujo documentado por el autor (estructura de carpetas y prompt de sistema en la pestana de inferencia). Al ser formato GGUF, tambien es compatible con llama.cpp y Ollama, y potencialmente con cualquier runtime que consuma GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints gestionados de Hugging Face. No se documenta soporte especifico para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo ni sobre alternativas comparables (los resultados obtenidos eran noticias financieras sin relacion con el tema), por lo que la comparativa se limita al modelo base declarado.

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thetinkerer/Qwen3.8-27B-TOS-v1 | ~25,5 B | no disponible | HolyC / TempleOS | apache-2.0 | GGUF en Hugging Face (0 descargas) |
| Qwen/Qwen3.8-27B (modelo base) | no disponible en la informacion proporcionada | no disponible | Proposito general | no disponible en la informacion proporcionada | Hugging Face |
| Otros fine-tunes de dominio sobre el mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Version alfa (v1) con aviso explicito del autor: "your mileage will be limited". No hay validacion por parte de la comunidad (0 descargas, 0 likes).
- Sesgo de dominio severo: el propio autor reconoce que los datos de entrenamiento sobre TempleOS son "severamente limitados en alcance", lo que reduce la cobertura de la API y aumenta el riesgo de respuestas incompletas o incorrectas.
- Riesgo de alucinacion en nombres de funciones, firmas de la API y detalles internos del sistema, especialmente en areas poco documentadas. El prompt de sistema recomendado incluye la instruccion de no especular sobre detalles no establecidos, lo que confirma que el problema existe.
- Tendencia a bucles de razonamiento: el autor recomienda configurar un limite de razonamiento para evitar que el modelo quede atascado en tareas comparativas (por ejemplo, diferencias entre C y HolyC).
- Degradacion por cuantizacion: la variante Q3_K_M probablemente rinde peor que Q4 o Q5; el autor lo advierte de forma explicita. La eleccion de cuantizacion, por tanto, no es neutra.
- Idioma: unicamente ingles declarado. No hay soporte documentado de castellano ni de otros idiomas, ni siquiera para las explicaciones conceptuales.
- Restricciones de sintaxis esperadas: el modelo esta ajustado para evitar enums, macros de funcion, prefijos de casteo, nombres de la biblioteca estandar de C, typedef, operadores ternarios y la sentencia continue. Generar codigo que viole estas reglas produce HolyC invalido.
- Si se usa sin el prompt de sistema recomendado, el comportamiento puede degradarse notablemente, ya que el ajuste depende en gran medida de ese condicionamiento.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no cubre posibles restricciones derivadas de los datos de entrenamiento ni del modelo base, que no se detallan. Conviene verificar la licencia del modelo base antes de un despliegue comercial.
- No apto como modelo de proposito general: fuera del ambito HolyC/TempleOS, su calidad general es incierta y no esta documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thetinkerer/Qwen3.8-27B-TOS-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GGUF de referencia citado por el autor (grafica sobre efecto de la cuantizacion): https://huggingface.co/unsloth/Qwen3.8-27B-GGUF/blob/main/README.md

Nota: la busqueda web realizada no devolvio ningun enlace relevante sobre este modelo, su modelo base, papers asociados, blogs tecnicos ni demostraciones. No se dispone de articulos, repositorios de codigo ni espacios de demo adicionales.
