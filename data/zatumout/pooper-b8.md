# zatumout/pooper-b8

## Resumen

pooper-b8 es un modelo de prediccion de funcion a partir de secuencia genomica (sequence-to-function) desarrollado por el usuario zatumout. Dado un fragmento de ADN de 131.072 pares de bases (128 kb), el modelo predice 1.885 pistas de senal ENCODE (ATAC-seq, DNase-seq, ChIP-seq de histonas y RNA-seq) sobre el genoma humano GRCh38 a resolucion de 1 par de bases. Se trata de un modelo de ~407 millones de parametros construido sobre una arquitectura de estilo AlphaGenome, pero entrenado desde inicializacion aleatoria, sin pesos preentrenados de AlphaGenome.

El modelo es hermano de pooper-b6: segun las notas de reproduccion de b6, ambas ejecuciones difieren unicamente en el hiperparametro `--level-weight` (b8 usa 1.0). Arquitectura, datos, calendario de entrenamiento y hardware son identicos a b6. La supervision de entrenamiento proviene de los "Zipoop teacher shards": una red "profesora" pequena sobreajustada por cada ventana de 32.768 pb, cada una comprimiendo las 1.885 pistas de esa ventana.

Su relevancia es acotada: es un prototipo de investigacion publicado con licencia CC-BY-4.0, con cero descargas y cero likes en el momento de la consulta, y el propio autor advierte que no es una herramienta validada para uso clinico ni para efecto de variantes. Aporta, eso si, resultados de evaluacion por tipo de ensayo y un paquete de reproduccion en el repositorio hermano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone de estilo AlphaGenome (transformer), entrenado desde inicializacion aleatoria |
| Parametros totales | ~407M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 pb (128 kb) de ventana de ADN de entrada |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; entrada de secuencia genomica) |
| Licencia | cc-by-4.0 |
| Formato de pesos | PyTorch (`pooper_genomeb8_407M_128K.pt`, 1.814.125.498 bytes) |

## Arquitectura y entrenamiento

El modelo emplea un backbone de estilo AlphaGenome orientado a prediccion densa de senal genomica: recibe una ventana de 131.072 pb y produce predicciones sobre 1.885 pistas ENCODE en GRCh38, con resolucion de 1 pb para ATAC, DNase y RNA-seq, y bines de 128 pb para ChIP-seq de histonas. No se han publicado detalles adicionales de la arquitectura (numero de capas, dimension del modelo, mecanismo de atencion) en la informacion disponible.

El entrenamiento parte de inicializacion aleatoria, sin pesos preentrenados de AlphaGenome. La supervision no son las senales ENCODE crudas, sino los "Zipoop teacher shards": una red profesora pequena sobreajustada por cada ventana de 32.768 pb que comprime las 1.885 pistas de esa ventana. Respecto a pooper-b6, la unica diferencia declarada es el valor de `--level-weight` (1.0 en b8); el resto de la receta (datos, calendario, hardware) es el de b6. El checkpoint publicado corresponde al paso 20.000. No se conservo un registro de entrenamiento propio de b8 junto a este checkpoint. No consta informacion sobre numero de tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO.

## Capacidades

- Prediccion de accesibilidad de cromatina: 200 pistas ATAC-seq y 200 pistas DNase-seq a resolucion de 1 pb.
- Prediccion de transcripcion: 1.285 pistas RNA-seq a resolucion de 1 pb.
- Prediccion de marcas de histonas: 200 pistas ChIP-seq de histonas en bines de 128 pb.
- Cobertura multiensayo sobre GRCh38: 1.885 pistas ENCODE en una sola pasada por ventana de 128 kb.
- Entrada de contexto largo genomico: ventanas de 131.072 pb.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso ni capacidades multilingues: es un modelo de secuencia a funcion, no un modelo de lenguaje.
- No consta soporte de modo "thinking", vision ni audio.

## Casos de uso

- Analisis exploratorio de accesibilidad de cromatina: dado un locus de interes, generar predicciones de ATAC-seq y DNase-seq a 1 pb para priorizar regiones candidatas antes de validacion experimental.
- Priorizacion de variantes no codificantes: comparar la prediccion del modelo sobre la secuencia de referencia y sobre la secuencia con la variante para detectar cambios de senal, siempre como cribado exploratorio y no como evidencia clinica.
- Anotacion de elementos reguladores: usar las predicciones de ChIP-seq de histonas (bines de 128 pb) para localizar regiones con patrones compatibles con estados de cromatina activos o represivos.
- Modelado de expresion genica a partir de secuencia: emplear las 1.285 pistas RNA-seq para estudiar que secuencias contextuales se asocian a senal de transcripcion en distintos tejidos o lineas celulares representados en ENCODE.
- Investigacion en genomica comparativa: evaluar como cambia la prediccion al introducir variantes sinteticas o ediciones de secuencia en una ventana de 128 kb, con fines de estudio mecanistico.
- Reproduccion y experimentacion metodologica: servir de base para reproducir la receta de pooper-b6/b8 y para estudiar el efecto del hiperparametro `--level-weight` en el entrenamiento con destilacion desde redes profesoras por ventana.
- Docencia y prototipado en bioinformatica: ejemplo funcional de pipeline sequence-to-function con contexto largo para cursos o pruebas de concepto, dado que la licencia CC-BY-4.0 permite su reutilizacion.

## Benchmarks y rendimiento

Evaluacion de estilo oficial: Pearson por pista agrupado sobre todas las posiciones de 400 ventanas. ATAC, DNase y RNA se puntuan a 1 pb; ChIP de histonas en bines de 128 pb. Checkpoint en el paso 20.000.

| Ensayo | Pistas | fold0 valid: Pearson / log1p | fold1 test: Pearson / log1p |
|---|---|---|---|
| ATAC | 200 | 0,716 / 0,683 | 0,728 / 0,690 |
| DNase | 200 | 0,757 / 0,758 | 0,778 / 0,775 |
| RNA-seq | 1.285 | 0,424 / 0,547 | 0,358 / 0,549 |
| ChIP (histonas) | 200 | 0,618 / 0,491 | 0,630 / 0,497 |

Los conjuntos de validacion y test siguen la convencion fold0 de AlphaGenome solo para mantener la evaluacion comparable. La model card no reclama igualar ni superar a AlphaGenome: los conjuntos de pistas difieren y no se realizo ninguna comparacion sobre las mismas pistas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia de orden de magnitud, el checkpoint ocupa 1,81 GB en precision nativa; el consumo en inferencia con una ventana de 131.072 pb sera sustancialmente mayor por las activaciones y no puede cuantificarse sin datos del autor.
- GPU recomendadas: no disponible. No se especifican GPU de entrenamiento ni de inferencia en la informacion disponible.
- Viabilidad en GPU de consumo: no disponible; no puede confirmarse sin conocer el pico de memoria de activaciones para el contexto de 128 kb.
- Opciones de despliegue: el formato publicado es un unico checkpoint PyTorch (`.pt`); no consta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo sequence-to-function.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pooper-b8 | ~407M | 131.072 pb | Sequence-to-function, 1.885 pistas ENCODE, entrenado desde cero | CC-BY-4.0 | Checkpoint PyTorch en Hugging Face |
| pooper-b6 | no disponible | no disponible | Mismo pipeline que b8; difiere en `--level-weight` | no disponible en la informacion | Repositorio hermano citado por el autor |
| AlphaGenome | no disponible | no disponible | Referencia de arquitectura y de convencion de evaluacion fold0 | no disponible | No disponible |

No se dispone de datos suficientes para una comparacion cuantitativa sobre las mismas pistas entre pooper-b8 y AlphaGenome; el propio autor indica que no se realizo.

## Limitaciones y advertencias

- RNA-seq es el ensayo mas debil, con caida de validacion a test (Pearson 0,424 en validacion frente a 0,358 en test).
- Es un prototipo de investigacion, no una herramienta validada para uso clinico ni para efecto de variantes.
- El modelo se entreno contra los Zipoop teacher shards; la model card no afirma que las puntuaciones reflejen concordancia con la senal ENCODE cruda, sino con las predicciones de las redes profesoras.
- Entrenamiento con una sola semilla y evaluacion sobre 400 ventanas por split, lo que limita la robustez estadistica de los resultados.
- No se conservo un registro de entrenamiento propio de b8; la receta completa debe consultarse en el repositorio de b6.
- No consta informacion sobre sesgos, cuantizacion, requisitos de hardware ni rendimiento fuera de las pistas ENCODE evaluadas.
- La licencia CC-BY-4.0 permite uso comercial con atribucion, pero la falta de validacion desaconseja cualquier aplicacion en produccion con impacto clinico o regulatorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zatumout/pooper-b8
- Repositorio hermano pooper-b6 (receta completa y paquete de reproduccion): no disponible como URL en la informacion proporcionada
- Paper de AlphaGenome (referencia de arquitectura y convencion fold0): no disponible en la informacion proporcionada
