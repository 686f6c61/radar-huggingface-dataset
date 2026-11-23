# swedishembedded/knowledge

## Resumen

Knowledge es una base de conocimiento en texto plano, distribuida como repositorio de Hugging Face, pensada para que agentes basados en modelos de lenguaje pequenos aprendan procedimientos profesionales a partir de documentacion escrita y revisable. No es un modelo de IA: es un directorio de ficheros Markdown que un agente consume con herramientas de sistema de ficheros (`ls`, `grep`, `cat`) sin necesidad de entrenamiento adicional. Lo desarrolla Swedish Embedded AB bajo la direccion de Martin Schroder, y su licencia es CC-BY-4.0.

El contenido cubre principios, procedimientos paso a paso, un ejemplo resuelto por pagina y errores frecuentes en dominios como uso de herramientas, calculo exacto con dinero y fechas, contabilidad, trabajo con contratos, atencion al cliente (soporte) y aplicacion de reglas escritas breves. El objetivo declarado es ensenar metodo, no servir de solucionario: todas las cifras, nombres y fechas de los ejemplos son inventados.

La version actual es la 0.3 (20 de noviembre de 2026) y, segun la propia model card, aun no ha sido revisada por un experto humano del dominio. Su relevancia radica en que propone un formato estandarizado y auditable (indices por carpeta, estructura fija de pagina, presupuestos de tokens, lint y autoauditoria de filtraciones) para inyectar conocimiento procedimental en agentes sin reentrenar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo neuronal; es una coleccion de documentos Markdown) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (cada pagina ocupa entre ~600 y 1000 tokens; el indice raiz, como maximo ~1200 tokens) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | en (ingles) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | no disponible (no hay pesos; Markdown plano con front-matter YAML opcional) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni entrenamiento en el sentido habitual. El artefacto es una coleccion de documentos Markdown organizada en carpetas, cada una con un `index.md` que mapea "si la tarea pide X, lee esta pagina". Cada pagina sigue un orden fijo: **Rule**, **Procedure** (pasos numerados), **Worked example** y **Common mistakes**, y empieza siempre con una regla que subordina la pagina a los ficheros y reglas explicitas de la tarea. Se anaden marcadores `<!-- tier: N -->` para permitir exportaciones filtradas por nivel (solo principios, principios mas procedimientos, o todo).

El proceso de creacion esta documentado con detalle: fue redactado el 20 de noviembre de 2026 por un asistente de IA (Claude, de Anthropic) actuando como autor de dominio bajo la direccion de Martin Schroder. Los insumos permitidos fueron la documentacion publica de las tareas, instancias de practica (solo peticion y ficheros de espacio de trabajo visibles) y las trazas del lado del agente en intentos de practica. Quedaron explicitamente fuera de limites el codigo de verificadores, oraculos y correctores, las soluciones de referencia, los examenes sellados y los resultados por comprobacion. La version 0.2 reformulo tres frases que coincidian con texto publico de instrucciones de tarea; la 0.3 hace que cada pagina ceda ante la tarea, a partir de una medicion de practica en la que precargar las paginas de contabilidad y calculo redujo la tasa de exito en tareas de IVA y costes devengados.

Incluye utilidades de mantenimiento en `tools/kb.py`: `lint` (cabeceras, secciones, enlaces, cobertura de indices y presupuestos de tokens) y `audit` (autoauditoria de filtraciones frente a texto de instancias de practica, comparando numeros de mas de tres digitos, identificadores, fechas ISO, nombres y secuencias compartidas de ocho palabras). La estimacion de tokens se aproxima como palabras separadas por espacios multiplicadas por 1,3.

## Capacidades

- Proporcionar conocimiento procedimental revisable a agentes que operan sobre un sistema de ficheros, sin reentrenamiento ni ajuste fino.
- Ensenar metodo para el uso de herramientas en tareas multi-paso (lectura de indices, `grep` por palabras de la tarea, lectura de una o dos paginas y reformulacion de reglas antes de actuar).
- Cubrir calculo exacto con dinero y fechas, contabilidad, trabajo con contratos, gestion de casos de soporte y aplicacion de reglas escritas breves.
- Ofrecer ejemplos resueltos y listas de errores frecuentes por pagina para autoevaluacion del agente.
- Permitir exportaciones filtradas por nivel de detalle (tiers 1, 2 o 3) para experimentos controlados.
- Soportar montaje de solo lectura fuera del espacio de trabajo de la tarea, con reescritura del prefijo `/knowledge/<carpeta>/<pagina>.md` mediante `tools/kb.py export --mount-path <ruta>`.
- No incluye capacidades de generacion, vision, audio, tool calling nativo ni razonamiento: esas funciones corresponden al modelo que consuma la base de conocimiento.

## Casos de uso

- Agentes de soporte tecnico: el agente lee la pagina de gestion de casos de soporte y aplica el procedimiento numerado para clasificar, escalar y responder incidencias, manteniendo coherencia entre turnos.
- Contabilidad y facturacion: precargar las paginas de contabilidad y calculo permite al agente aplicar reglas de IVA y costes devengados; conviene validar el resultado porque la propia model card documenta que la precarga indiscriminada puede reducir la tasa de exito.
- Calculo con dinero y fechas: el agente usa la pagina de calculo exacto para resolver operaciones con importes y plazos, reformulando las reglas antes de ejecutar la operacion.
- Trabajo con contratos: el agente consulta la pagina de contratos para extraer obligaciones, plazos y condiciones y contrastarlas con los ficheros de la tarea.
- Evaluacion de agentes: investigadores pueden montar una copia filtrada por tiers para medir el efecto de principios, procedimientos y ejemplos resueltos en la tasa de exito de un modelo pequeno.
- Construccion de bases de conocimiento propias: el formato (indices por carpeta, estructura de pagina fija, presupuestos de tokens, lint y audit) sirve de plantilla para colecciones internas de procedimientos de una organizacion.
- Auditoria de filtraciones: el comando `audit` permite comprobar que una coleccion de conocimiento no comparte identificadores, fechas ni secuencias de texto con las instancias de practica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente menciona una medicion de practica cualitativa: precargar las paginas de contabilidad y calculo redujo la tasa de exito en tareas de IVA y costes devengados, sin cifras publicadas.

## Requisitos de hardware

- VRAM: no disponible (no es un modelo; no requiere GPU para almacenarse ni consultarse).
- GPU recomendadas: no disponible (no aplica a la coleccion; la GPU la determina el modelo que la consuma).
- Compatibilidad con GPU de consumo: no aplica a la base de conocimiento; depende exclusivamente del modelo que la lea.
- Despliegue: montaje como directorio de solo lectura, fuera del espacio de trabajo de la tarea y sin directorio `.git`; exportacion mediante `python3 tools/kb.py export --out <ruta>` con filtros opcionales `--max-tier 1` o `--max-tier 2`; reescritura de prefijo con `--mount-path <ruta>`.
- Latencia y throughput: no disponibles; dependen del modelo y del sistema de ficheros. El coste de contexto por consulta es acotado: cada pagina ocupa entre ~600 y 1000 tokens y el indice raiz como maximo ~1200 tokens.

## Comparativa con modelos similares

| Criterio | Knowledge (swedishembedded) | Base de conocimiento ad hoc en prompts | Ajuste fino supervisado (SFT) |
|---|---|---|---|
| Naturaleza | Coleccion Markdown revisable | Texto embebido en el prompt de sistema | Pesos del modelo modificados |
| Parametros | no aplica | no aplica | Depende del modelo base |
| Contexto consumido | ~600-1000 tokens por pagina | Variable, sin estructura fija | Ninguno en inferencia |
| Actualizacion | Editar Markdown y reexportar | Editar el prompt | Reentrenar |
| Auditabilidad | lint y audit integrados | Manual | Baja |
| Licencia | CC-BY-4.0 | Depende del proyecto | Depende del modelo base |
| Disponibilidad | Hugging Face, 0 descargas, 0 likes | no disponible | no disponible |

## Limitaciones y advertencias

- Version 0.3 sin revision por un experto humano del dominio; el indice de revision lista los puntos a comprobar y algunas afirmaciones estan marcadas `REVIEW:`.
- Producida por un asistente de IA (Claude) bajo direccion humana, con acceso limitado a documentacion publica e instancias de practica; ninguna pagina se contrasto contra un corrector.
- Solo en ingles; no hay version en castellano ni en otros idiomas.
- No es un solucionario: todas las cifras, nombres y fechas de los ejemplos son inventados y no deben reutilizarse como datos reales.
- La evidencia de mejora es limitada y parcialmente negativa: precargar las paginas de contabilidad y calculo redujo la tasa de exito en tareas de IVA y costes devengados en una medicion de practica.
- La autoauditoria de filtraciones no puede ver material de examen sellado ni sustituye a la auditoria de contaminacion del examinador.
- El montaje debe hacerse de solo lectura, fuera del espacio de trabajo y sin `.git`; montar el clon completo expone `README.md` y `tools/`, que no forman parte de lo que el agente debe ver.
- La estimacion de tokens (palabras x 1,3) subestima bloques de codigo y tablas; conviene una comprobacion exacta con el tokenizador del modelo concreto.
- Licencia CC-BY-4.0: permite uso comercial con atribucion; no se documentan restricciones adicionales en la informacion disponible.
- Sin descargas ni likes registrados en el momento de la consulta; madurez y soporte de la comunidad no verificables.

## Enlaces

- Hugging Face: https://huggingface.co/swedishembedded/knowledge
- Contacto del autor: info@swedishembedded.com
- Swedish Embedded AB: no disponible en la informacion proporcionada
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada
