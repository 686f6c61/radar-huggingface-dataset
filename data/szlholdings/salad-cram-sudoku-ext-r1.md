# SZLHOLDINGS/salad-cram-sudoku-ext-r1

## Resumen

`salad-cram-sudoku-ext-r1` es un artefacto de modelo publicado por la organizacion SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina "governed-AI estate": un catalogo de modelos, datasets y Spaces con resultados auditables y trazabilidad de origen. El nombre sugiere un modelo especializado en sudoku (posiblemente un fine-tuning o un modelo de razonamiento entrenado sobre tareas de sudoku), pero la model card no confirma esta hipotesis ni describe la tarea concreta.

La informacion disponible es muy limitada: el repositorio ocupa 0,7 GB en formato safetensors, no declara licencia, idiomas ni pipeline, y no incluye resultados de benchmarks medidos. La propia model card indica explicitamente que cualquier afirmacion de entrenamiento o evaluacion que no aparezca en sus "receipt files" debe considerarse UNKNOWN (desconocida), y que no se afirma ningun numero de benchmark mas alla de lo que una auditoria fechada haya medido.

Por tanto, esta ficha recoge unicamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no documenta. Es relevante ahora como ejemplo de publicacion con trazabilidad declarativa, pero no como modelo evaluable para produccion sin informacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tamano del repo es 0,7 GB en safetensors, lo que sugiere un modelo pequeno, pero no se confirma) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo. La model card no especifica si se trata de un transformer denso, un MoE, un modelo hibrido o cualquier otra variante, ni indica el numero de parametros, la longitud de contexto o la composicion del dataset de entrenamiento.

Tampoco se documentan procesos de RLHF, DPO, SFT ni ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, modos de razonamiento, etc.). El autor remite a los "receipt files" del estate para cualquier afirmacion de entrenamiento o evaluacion, pero esos ficheros no estan incluidos en la informacion proporcionada.

## Capacidades

- Generacion de texto: no confirmada por la model card.
- Razonamiento y resolucion de sudoku: el nombre del repositorio lo sugiere, pero no esta documentado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Evaluacion de artefactos con trazabilidad: el repositorio puede usarse como ejemplo de publicacion con receipts y etiquetas MEASURED/REPORTED/UNKNOWN, util para equipos que disenan pipelines de auditoria de modelos.
- Investigacion sobre modelos especializados en sudoku: si se confirma la hipotesis del nombre, podria servir para experimentos de razonamiento simbolico, aunque la falta de documentacion lo hace arriesgado.
- Pruebas de carga de safetensors: el repositorio permite validar herramientas de inspeccion de pesos (por ejemplo, `safetensors` o `transformers`) sobre un artefacto de 0,7 GB.
- Reproduccion de entornos gobernados: util para estudiar como SZLHOLDINGS estructura sus fichas y receipts dentro de su estate.
- Benchmarking interno de pipelines de evaluacion: al no haber numeros publicados, un equipo podria medir el modelo por su cuenta y comparar con sus propios resultados.
- Docencia sobre buenas practicas de model cards: el ejemplo ilustra que documentar explicitamente lo desconocido es preferible a inventar datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que cualquier cifra no receiptada debe considerarse UNKNOWN y que no se afirma ningun numero mas alla de lo medido en una auditoria fechada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con un repo de 0,7 GB en safetensors, es plausible que quepa en GPUs de consumo (por ejemplo, RTX 3060 o superiores), pero no se confirma el numero de parametros ni la precision.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamano del repo sugiere que si, pero falta validacion.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni similares).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables de la misma categoria porque la model card no define la tarea, el tamano ni el dominio con precision.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| salad-cram-sudoku-ext-r1 | no disponible | no disponible | no disponible | Hugging Face (0 descargas) |
| Alternativa 1 | no disponible | no disponible | no disponible | no disponible |
| Alternativa 2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de documentacion tecnica: no se especifican arquitectura, parametros, contexto, idiomas ni licencia.
- Licencia no declarada: no se puede garantizar el uso comercial ni la redistribucion.
- Sin benchmarks ni evaluaciones publicadas: no hay evidencia de rendimiento.
- Riesgo de alucinacion: no evaluado; al no conocerse el entrenamiento, no se puede estimar.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto o idioma: no disponibles.
- Cero descargas y cero likes en el momento de la consulta: senal de baja validacion por parte de la comunidad.
- La model card remite a receipts externos no incluidos: sin ellos, cualquier afirmacion sobre el modelo queda sin verificar.
- Nombre ambiguo: "salad cram sudoku ext r1" no aclara si es un modelo de lenguaje, un solver especializado o un experimento; conviene tratarlo con cautela en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-cram-sudoku-ext-r1
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organizacion en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Herramienta de generacion de fichas citada: https://github.com/szl-holdings/estate-cards
