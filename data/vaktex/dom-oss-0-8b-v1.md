# vaktex/dom-oss-0.8b-v1

## Resumen

DOM-OSS-0.8b (identificador `vaktex/dom-oss-0.8b-v1`) es un modelo de 760 millones de parametros desarrollado por Vaktex para deteccion de vulnerabilidades en codigo fuente. No es un modelo generativo: recibe un fragmento de codigo (una funcion o un fichero) y devuelve puntuaciones de severidad y de pertenencia a 18 familias CWE. Su proposito es actuar como etapa de triaje dentro de un flujo de revision de seguridad, ordenando el codigo por riesgo antes de que llegue a produccion.

El modelo se distribuye junto a `vakt`, un escaner local que extrae funciones de un repositorio, las puntua con DOM-OSS-0.8b y las clasifica para investigacion posterior. La propuesta de valor es doble: por un lado, sustituir la generacion de informes en texto por una salida fija y puntuable, lo que reduce el coste en tokens frente a un modelo generativo; por otro, ejecutarse en local, sin enviar el codigo a servicios en la nube. Los pesos son abiertos y de codigo disponible, con acceso restringido (gated) en HuggingFace.

Tecnicamente combina atencion lineal y atencion completa en un backbone de 24 capas y ancho oculto 1024, con una cabecera de clasificacion basada en pooling de atencion. La ventana declarada es de 16.384 tokens, aunque el propio autor advierte que el rendimiento por encima de unos 8.192 tokens esta peor soportado y recomienda puntuar por funcion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido: backbone de 24 capas con ancho oculto 1.024; seis grupos, cada uno con tres capas de atencion lineal y una de atencion completa; cabecera de clasificacion con pooling de atencion aprendido de cuatro cabezas en fp32 |
| Parametros totales | 759.784.275 (aproximadamente 760 M, segun safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens; predicciones por encima de aproximadamente 8.192 tokens estan peor soportadas |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en safetensors, 1,5 GB) |
| Idiomas soportados | no disponible para idiomas naturales; en lenguajes de programacion la cobertura es mayor en lenguajes de servidor mayoritarios y menor en el resto, incluidos contratos inteligentes |
| Licencia | Vaktex Evaluation License (campo `license: other`); uso gratuito para investigacion y educacion, uso comercial bajo solicitud |
| Formato de pesos | safetensors |
| Tarea principal | clasificacion de texto (severidad + 18 familias CWE) |
| Tamano del repositorio | 1,5 GB |
| Acceso | repositorio con control de acceso (gated); requiere solicitud y `hf auth login` |
| Descargas y likes | 0 descargas, 0 likes en el momento de la consulta |

## Arquitectura y entrenamiento

DOM-OSS-0.8b emplea un backbone de texto de 24 capas con ancho oculto de 1.024. La atencion esta organizada en seis grupos, y cada grupo combina tres capas de atencion lineal con una capa de atencion completa, un esquema hibrido que reduce el coste de la atencion en la mayor parte de la profundidad de la red. En la receta actual, las 16 capas inferiores permanecen congeladas y solo se adaptan las ocho superiores, lo que apunta a un ajuste sobre un backbone preentrenado mas que a un entrenamiento desde cero.

Una pasada del backbone por cada fragmento de entrada produce representaciones a nivel de token. Un pooling de atencion aprendido de cuatro cabezas, ejecutado en fp32, las combina en una representacion unica que alimenta dos salidas: una puntuacion de severidad y puntuaciones para 18 familias CWE. Existe ademas una proyeccion de entrenamiento de 256 dimensiones que se descarta en inferencia. La eleccion de una cabecera de clasificacion en lugar de una decodificacion autoregresiva elimina el trabajo de generacion de respuestas y proporciona a `vakt` salidas fijas que puede ordenar y umbralizar. La model card no especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de severidad de un fragmento de codigo mediante una puntuacion AUROC evaluable.
- Clasificacion en 18 familias CWE, con probabilidades que pueden leerse de forma individual (el autor recomienda leer las dos primeras como convencion de triaje).
- Puntuacion por unidad de codigo (funcion o fichero), con salida determinista y umbralizable.
- Etiquetado masivo y ordenacion de fragmentos para priorizar revision humana o procesamiento posterior con modelos generativos.
- Ejecucion completamente local, sin llamadas a la nube, lo que permite su uso sobre codigo propietario.
- Integracion con la herramienta `vakt`, que extrae funciones del repositorio y las puntua de forma automatica.
- No genera texto ni informes: no dispone de modo de razonamiento explicito, tool calling ni capacidades de agente.
- No se documentan capacidades multimodales (vision o audio) ni soporte multilingue en idiomas naturales.

## Casos de uso

- Puerta de calidad en CI/CD: `vakt` puede ejecutarse sobre el repositorio en cada pull request y usar las puntuaciones de severidad para bloquear o marcar cambios que superen un umbral definido por el equipo, antes de que el codigo llegue a produccion.
- Triaje en equipos de seguridad de aplicaciones: en lugar de revisar manualmente todos los hallazgos de un analisis estatico, el equipo ordena las funciones por probabilidad de las familias CWE mas relevantes y concentra la revision en la parte alta de la cola.
- Auditoria de codigo propietario en local: al ejecutarse sin conexion a servicios externos, permite analizar repositorios con restricciones de confidencialidad o requisitos de cumplimiento que impiden enviar el codigo a la nube.
- Evaluacion de dependencias y codigo de terceros: antes de adoptar una libreria o integrar codigo de un proveedor, se puntuan sus funciones y se obtiene una lista priorizada de fragmentos a inspeccionar.
- Reduccion de coste en pipelines de revision asistida por LLM: el modelo actua como pre-filtro; solo los fragmentos con probabilidad alta se envian despues a un modelo generativo, que es la etapa cara en tokens.
- Construccion de datasets etiquetados: las probabilidades por familia CWE permiten etiquetar grandes volumenes de codigo para entrenar o evaluar otros modelos, siempre con revision humana posterior.
- Formacion y docencia en seguridad: al ser gratuito para investigacion y educacion y ejecutarse en portatiles, sirve para practicas de analisis de vulnerabilidades y publicacion de benchmarks reproducibles.
- Monitorizacion de deuda de seguridad en codigo heredado: ejecuciones periodicas sobre un repositorio antiguo permiten observar la evolucion del numero de fragmentos con puntuaciones altas por familia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son de AUROC de severidad (capacidad de ordenar codigo vulnerable por encima de codigo no vulnerable; 0,5 equivale a azar y 1,0 a separacion perfecta). El modelo card advierte explicitamente de que no equivale a porcentaje de acierto.

| Modelo | AUROC de severidad | Notas |
|---|---|---|
| DOM-OSS-0.8b | 0,5731 | Por debajo del baseline de n-gramas de caracteres |
| Baseline de n-gramas de caracteres | 0,6009 | Baseline sin analisis de programa explicito |
| DOM-4B | 0,8371 | Resultado mas alto; la model card indica que la comparacion exige evaluar ambas versiones sobre los mismos ejemplos reservados |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni metricas de precision y recall por familia CWE o por umbral en la informacion disponible. La model card senala que la mejora de DOM-4B frente a DOM-0.8b esta pendiente de confirmar sobre un conjunto de evaluacion comun.

## Requisitos de hardware

Estimaciones calculadas a partir del recuento de parametros (759.784.275); no son cifras oficiales del autor:

- Pesos en bf16/fp16: aproximadamente 1,5 GB, coherente con el tamano de repositorio publicado (1,5 GB).
- Pesos en fp32: aproximadamente 3,0 GB.
- Pesos en int8: aproximadamente 0,8 GB.
- Pesos en int4: aproximadamente 0,4 GB.
- VRAM total estimada en bf16 con contexto corto: del orden de 2 a 3 GB, incluyendo cache de activaciones y de atencion. Con 16.384 tokens de contexto, la cache KV de las seis capas de atencion completa crece de forma apreciable; no se dispone de la configuracion de cabezas necesaria para dar una cifra exacta.
- Cabe sin problema en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en fp32. Tambien es viable en iGPU con memoria compartida si se cuantiza, aunque no se publican ficheros cuantizados.
- GPU de centro de datos: A100, H100 y L40S son sobredimensionadas para este tamano; tienen sentido solo para procesar lotes muy grandes o para servir el modelo junto a otros componentes.
- Apple Silicon: soportado oficialmente por la herramienta `vakt`, que requiere macOS sobre Apple Silicon o Linux (amd64/arm64, glibc 2.35 o superior).
- Opciones de despliegue: la ruta soportada es el CLI `vakt` (instalacion mediante `curl -fsSL https://get.vaktex.com/oss-vakt | sh` y descarga de pesos con `vakt summon`). Tambien es cargable con la libreria `transformers` por tratarse de un modelo `text-classification`. El soporte en vLLM o TGI con cabeceras de clasificacion no esta confirmado en la informacion disponible, y no se publican pesos GGUF, por lo que su uso en llama.cpp u Ollama tampoco esta confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | AUROC de severidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| DOM-OSS-0.8b | 759.784.275 | 16.384 tokens | Clasificacion: severidad + 18 familias CWE | 0,5731 | Vaktex Evaluation License (gratis para investigacion y educacion; comercial bajo solicitud) | Gated en HuggingFace |
| DOM-4B | no disponible (la nomenclatura sugiere un orden de 4.000 M) | no disponible | Clasificacion: severidad + familias CWE | 0,8371 | no disponible | No disponible en la informacion consultada |
| Baseline de n-gramas de caracteres | no aplica (no neuronal) | no aplica | Clasificacion de texto por patrones recurrentes | 0,6009 | no aplica | Baseline interno de la evaluacion del autor |
| Otros clasificadores de vulnerabilidades en codigo | no disponible | no disponible | Deteccion de vulnerabilidades | no disponible | no disponible | no disponible |

La model card no incluye comparaciones con modelos de terceros de la misma categoria. La unica comparacion disponible es interna, entre DOM-OSS-0.8b, DOM-4B y un baseline de n-gramas, y el propio autor indica que la mejora de DOM-4B requiere una evaluacion sobre los mismos ejemplos reservados.

## Limitaciones y advertencias

- Rendimiento por debajo del baseline: el AUROC de severidad de 0,5731 queda por debajo del baseline de n-gramas de caracteres (0,6009). Para triaje practico importan ademas la precision y el recall en el umbral elegido, que no se publican.
- Sin contexto interprocedural: el modelo puntua una unica funcion o fichero y no puede razonar sobre fallos cuyo origen esta en quien llama a la funcion, en un fichero de configuracion o en otro servicio.
- Limite practico de contexto: aunque la ventana declarada es de 16.384 tokens, las predicciones por encima de aproximadamente 8.192 tokens estan peor soportadas; se recomienda puntuar por funcion y dividir ficheros muy grandes.
- Cobertura desigual por lenguaje de programacion: es mayor en lenguajes de servidor mayoritarios y menor en el resto, incluidos los contratos inteligentes. Es obligatorio fijar la etiqueta de lenguaje.
- Salida no concluyente: una probabilidad alta es un motivo para revisar, no un hallazgo confirmado. El uso previsto es ordenar una cola de revision humana o automatizada, no decidir de forma autonoma.
- Umbral dependiente del repositorio: el corte optimo depende de como se pondere un fallo no detectado frente a una falsa alarma, y debe calibrarse con una muestra etiquetada del propio codigo, idealmente por familia. No se publican umbrales por defecto.
- Acceso restringido y adopcion no verificada: el repositorio esta sujeto a solicitud de acceso y presenta 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion independiente conocida.
- Riesgo de falsos positivos y de sobreconfianza: al ser un clasificador no genera texto, pero puede asignar probabilidad alta a fragmentos benignos y varias familias a la vez; el autor admite que un mismo fragmento puede pertenecer legitimamente a varias.
- Restricciones de licencia: la Vaktex Evaluation License permite descargar, inspeccionar, ejecutar y estudiar los pesos, con investigacion y educacion gratuitas, pero el uso comercial requiere solicitud previa. Es imprescindible revisar el fichero `LICENSE` antes de integrarlo en un producto.
- Sin datos de entrenamiento publicados: no se especifican tokens de entrenamiento, composicion del dataset ni proceso de ajuste, lo que dificulta auditar sesgos o evaluar la generalizacion a dominios no vistos.
- Fecha de creacion del repositorio: la ficha de HuggingFace registra la creacion el 2026-09-27, un valor que conviene verificar antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vaktex/dom-oss-0.8b
- Blog post de presentacion: https://vaktex.com/dom-oss
- Repositorio de la herramienta vakt: https://github.com/Vaktex/vakt
- Licencia de evaluacion de Vaktex: https://vaktex.com/docs/legal/evaluation-license
- Script de instalacion de vakt: https://get.vaktex.com/oss-vakt
- Diagrama de arquitectura: https://raw.githubusercontent.com/Vaktex/vakt/refs/heads/main/.github/model-card/architecture.png
- Grafica de benchmarks: https://raw.githubusercontent.com/Vaktex/vakt/refs/heads/main/.github/model-card/benchmarks.png
- Banner del proyecto: https://raw.githubusercontent.com/Vaktex/vakt/refs/heads/main/.github/banner.jpg
- Paper o informe tecnico: no disponible
