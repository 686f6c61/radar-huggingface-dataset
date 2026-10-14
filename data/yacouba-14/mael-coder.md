# yacouba-14/MAEL-Coder

## Resumen

MAEL-Coder es el nombre con el que el usuario de HuggingFace yacouba-14 publica, dentro del ecosistema del proyecto MAEL de Yelen Tech, una version cuantizada del modelo Qwen3-Coder-30B-A3B-Instruct de Alibaba Qwen. No se trata de un modelo entrenado desde cero ni ajustado: el autor lo indica de forma explicita en la model card. Es el modelo base utilizado tal cual, comprimido en formato GGUF con cuantizacion Q4_K_M (fichero de 18,6 GB) a partir de la publicacion de unsloth, con licencia Apache 2.0.

El modelo resuelve el caso de uso de un motor local de asistencia a la programacion y auditoria de seguridad. Se integra como "motor recomendado" de MAEL, una herramienta local de auditoria de seguridad y taller de codigo, donde el modelo propone cambios y un conjunto de jueces y herramientas externas (normas OWASP, W3C, WCAG, SQL, ademas de gitleaks, Trivy, Nuclei, testssl.sh o ClamAV) validan lo generado. La filosofia declarada del proyecto es "el codigo decide, el modelo propone".

Arquitectonicamente hereda de su base un transformer con mezcla de expertos (MoE) de 30,5 mil millones de parametros totales y aproximadamente 3,3 mil millones de parametros activos por token, lo que permite ejecutarlo en hardware modesto (22 GB de memoria recomendada segun el autor, tambien sin GPU). La relevancia actual es doble: por un lado, demuestra el patron de republicacion de un modelo con licencia permisiva bajo una marca de producto; por otro, ilustra el enfoque de envolver un modelo generativo con verificacion determinista para tareas de seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), heredada de Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30,5 mil millones |
| Parametros activos | 3,3 mil millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unica publicada en este repositorio) |
| Idiomas soportados | frances (fr), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Fichero publicado | Qwen3-Coder-30B-A3B-Instruct-Q4_K_M.gguf (18,6 GB) |
| Huella SHA-256 | fadc3e5f8d42bf7e894a785b05082e47daee4df26680389817e2093056f088ad |
| Memoria recomendada | 22 GB |
| Modelo base | Qwen/Qwen3-Coder-30B-A3B-Instruct (relacion: quantized) |

## Arquitectura y entrenamiento

MAEL-Coder no incorpora ningun entrenamiento propio. Segun la model card, es exactamente Qwen3-Coder-30B-A3B-Instruct (Alibaba Qwen, licencia Apache 2.0) sin modificar, en su version comprimida Q4_K_M en formato GGUF publicada por unsloth. La arquitectura, por tanto, es la del modelo base: un transformer con mezcla de expertos de 30,5 mil millones de parametros totales de los que solo se activan unos 3,3 mil millones por token, una configuracion que reduce el coste de inferencia respecto a un modelo denso del mismo tamano. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las etapas de alineacion (RLHF, DPO u otras), ya que la ficha no las detalla.

Lo que anade el proyecto MAEL no esta en los pesos, sino alrededor del modelo: jueces que contrastan la salida generada contra normas nombradas (OWASP, W3C, WCAG, SQL), pruebas ejecutadas en contenedor, reparacion guiada y utilidades de seguridad (gitleaks, Trivy, Nuclei, testssl.sh, ClamAV). El repositorio se distribuye con el propio proyecto mediante `pip install "mael @ git+https://github.com/Yelen-Tech/mael.git#subdirectory=backend"`, y el instalador descarga el fichero GGUF desde una revision fija del repositorio de unsloth, rechazando cualquier fichero cuya huella SHA-256 no coincida.

## Capacidades

- Generacion de texto y codigo, heredadas del modelo base Qwen3-Coder-30B-A3B-Instruct, orientadas a tareas de programacion.
- Asistencia a la auditoria de seguridad como motor recomendado de MAEL: el modelo propone codigo o correcciones y los jueces del entorno validan el resultado.
- Reescritura y reparacion de codigo guiada, segun el flujo descrito en el proyecto (reparacion guiada con pruebas en contenedor).
- Integracion con un conjunto de herramientas de seguridad externas orquestadas por MAEL (no por el modelo de forma autonoma segun la documentacion): gitleaks, Trivy, Nuclei, testssl.sh y ClamAV.
- Idiomas declarados: frances e ingles (etiquetas del repositorio).
- Soporte de tool calling o function calling: no confirmado en la informacion disponible.
- Modo de razonamiento explicito (thinking), vision o audio: no disponible.

## Casos de uso

- Auditoria de seguridad de repositorios: mediante `mael audit .`, el modelo propone cambios y correcciones mientras las herramientas deterministas (gitleaks, Trivy, Nuclei) verifican hallazgos reales, de modo que el modelo aporta la parte de comprension del codigo y no la conclusion de seguridad.
- Taller de codigo local en el terminal: con `mael installer` se despliega el motor llama.cpp y el modelo, permitiendo trabajar sobre el codigo sin enviar fuentes a servicios externos, algo relevante en entornos con requisitos de confidencialidad.
- Revision de cumplimiento de normas concretas: los jueces del entorno contrastan el codigo generado contra OWASP, W3C, WCAG y SQL, util para revisar accesibilidad web o patrones de consulta inseguros.
- Reparacion de vulnerabilidades con validacion: el modelo propone el parche y las pruebas en contenedor determinan si la correccion es valida antes de aceptarla, lo que encaja en flujos de integracion continua internos.
- Despliegue en maquinas sin GPU: con 22 GB de memoria recomendada y ejecucion por CPU, es viable en estaciones de trabajo o servidores modestos para tareas de asistencia a la programacion.
- Base para herramientas propias de analisis de codigo: dado que es un GGUF de un modelo Apache 2.0, puede integrarse en pipelines propios de generacion y revision de codigo sin restricciones de licencia adicionales.
- Formacion y evaluacion interna de tecnicas de asistencia a la programacion basadas en MoE de bajo coste por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica que las medidas de MAEL con este modelo se anadiran cuando se hayan realizado, y remite a las medidas actuales de MAEL (localizacion sobre SWE-bench Lite, jueces y herramientas, de octubre de 2026) al README del proyecto. No se incluyen por tanto cifras de MMLU, HumanEval, GSM8K ni de SWE-bench atribuibles a este repositorio.

## Requisitos de hardware

- Memoria recomendada por el autor: 22 GB. El fichero GGUF Q4_K_M ocupa 18,6 GB.
- Ejecucion sin GPU: si, segun la model card; funciona en CPU, con mejor rendimiento si hay tarjeta grafica.
- VRAM estimada para inferencia: a partir del tamano de fichero (18,6 GB) y la memoria recomendada (22 GB), una GPU de 24 GB (por ejemplo RTX 3090 o RTX 4090) queda muy ajustada, especialmente con contextos largos por el espacio de cache KV; GPUs de 40 o 80 GB (A100) o de 48 GB (A6000 y similares) dan mas margen. Estimacion derivada, no una cifra publicada.
- Cabe en GPU de consumo: previsiblemente en modelos de 24 GB, con limitaciones de contexto; no confirmado de forma explicita por el autor.
- Opciones de despliegue: llama.cpp es el motor mencionado en la documentacion de MAEL. Otros ejecutores compatibles con GGUF (Ollama, LM Studio o servidores basados en llama.cpp) no se confirman en la informacion disponible.
- Latencia y throughput estimados: no disponible. El uso de MoE con 3,3 mil millones de parametros activos por token reduce el coste de computo por token frente a un modelo denso de 30B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MAEL-Coder | 30,5B | 3,3B | GGUF Q4_K_M | Apache 2.0 | HuggingFace (yacouba-14/MAEL-Coder) |
| Qwen3-Coder-30B-A3B-Instruct | 30,5B | 3,3B | safetensors (precision completa) | Apache 2.0 | HuggingFace (Qwen) |
| Qwen3-Coder-30B-A3B-Instruct-GGUF | 30,5B | 3,3B | GGUF (varias cuantizaciones) | Apache 2.0 | HuggingFace (unsloth) |

La comparativa relevante en este caso no es frente a otros modelos de codigo, sino frente al propio modelo base y su cuantizacion de origen. MAEL-Coder es un reempaquetado con nombre de producto: mismos pesos, misma licencia y misma arquitectura que el GGUF Q4_K_M de unsloth. Frente al modelo base en precision completa, pierde calidad por la cuantizacion Q4_K_M a cambio de reducir el peso a 18,6 GB y permitir ejecucion en CPU. No se dispone de datos comparativos de rendimiento entre estas variantes en la informacion proporcionada. Alternativas de la misma categoria (por ejemplo, otros modelos de codigo abiertos de entre 24B y 32B) no se detallan aqui por falta de datos verificables.

## Limitaciones y advertencias

- No es un modelo entrenado ni ajustado por Yelen Tech; es Qwen3-Coder-30B-A3B-Instruct en Q4_K_M. Cualquier mejora atribuida a "MAEL-Coder" proviene del entorno de validacion, no de los pesos.
- La cuantizacion Q4_K_M introduce perdida de calidad respecto a la precision completa del modelo base.
- Sesgos conocidos: no disponible en la informacion proporcionada; al heredar del modelo base, arrastra los sesgos de este, no documentados en la ficha.
- Riesgo de alucinacion: presente como en cualquier modelo generativo. En el contexto de seguridad es especialmente critico, de ahi que el proyecto insista en que "el codigo decide, el modelo propone" y valide las salidas con herramientas deterministas.
- Limitaciones de contexto e idioma: el repositorio solo declara frances e ingles; la longitud de contexto no se especifica. El uso en otros idiomas no esta garantizado por la ficha.
- Licencia: Apache 2.0, que permite uso comercial y modificacion, con las obligaciones habituales de atribucion. El modelo pertenece a Alibaba Qwen y la compresion a unsloth; MAEL es de Yelen Tech, tambien Apache 2.0.
- Adopcion: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad ni resultados de benchmarks publicados.
- Caveat de produccion: la model card advierte de que las medidas del modelo con MAEL aun no se han publicado; conviene no asumir rendimiento en tareas de seguridad sin evaluacion propia.

## Enlaces

- Repositorio del modelo: https://huggingface.co/yacouba-14/MAEL-Coder
- Modelo base: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Cuantizacion GGUF de origen (unsloth): https://huggingface.co/unsloth/Qwen3-Coder-30B-A3B-Instruct-GGUF
- Proyecto MAEL (Yelen Tech): https://github.com/Yelen-Tech/mael
- Medidas de MAEL (octubre de 2026): https://github.com/Yelen-Tech/mael#mesures-octobre-2026
- Articulo relacionado sobre deteccion y remediacion autonoma de vulnerabilidades (MalCodeAI): https://arxiv.org/html/2507.10898v1
