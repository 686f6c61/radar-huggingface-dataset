# typhoon-ai/typhoon-ocr2-2b

## Resumen

Typhoon OCR V2 2B es un modelo de vision-lenguaje especializado en el analisis y parsing de documentos en tailandes e ingles. Lo desarrolla SCB 10X dentro del proyecto OpenTyphoon, y se distribuye como un fine-tune del parser `infly/Infinity-Parser2-Flash`. Dada una imagen de una pagina, el modelo devuelve una lista JSON de elementos de maquetacion en orden de lectura, cada uno con una categoria (13 tipos posibles, como titulo, texto, tabla, formula, cabecera o pie), un *bounding box* y su texto asociado; las tablas se emiten como HTML, las formulas como LaTeX y el resto como Markdown.

El modelo resuelve un problema concreto: el parser base lee bien ingles y chino pero es debil en tailandes. Tras un entrenamiento en dos fases (supervised fine-tuning y despues GRPO con un adaptador LoRA r=64 fusionado en los pesos), las puntuaciones en tailandes suben unos 25 puntos en MDPBench TH y ThaiOCRBench, al tiempo que las metricas en ingles tambien mejoran en lugar de degradarse. Ademas de parsing, el modelo responde preguntas libres sobre un documento (VQA), clasifica documentos, extrae informacion clave a JSON y lee tablas, formulas y graficos de forma aislada.

Arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`), 2.213.241.664 parametros en BF16, licencia Apache 2.0 en el repositorio aunque el uso queda sujeto a los terminos de OpenTyphoon. Se publica junto a una variante menor de 0.8B para parsing de paginas a menor coste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-lenguaje |
| Parametros totales | 2.213.241.664 (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | Tailandes e ingles (los datos de entrenamiento tambien incluyen chino, no evaluado por separado) |
| Licencia | Apache 2.0 (uso sujeto a los terminos de OpenTyphoon) |
| Formato de pesos | safetensors |
| Entrada | Una imagen de pagina; entrenado con imagenes de hasta 4 MP, evaluado con hasta 16.7 MP |
| Salida | Lista JSON de elementos de maquetacion en un bloque de codigo `json` |
| Modelo base | infly/Infinity-Parser2-Flash |

## Arquitectura y entrenamiento

El modelo parte de `infly/Infinity-Parser2-Flash`, un parser documento-imagen a texto construido sobre la arquitectura Qwen3.5 para generacion condicional multimodal. Sobre esa base se aplico un supervised fine-tuning con datos tailandeses curados junto a datos publicos en ingles y chino, seguido de una fase de GRPO (optimizacion de politica con recompensas) mediante un adaptador LoRA de rango 64 que despues se fusiono en los pesos finales. La recompensa de GRPO asigna cero a las salidas que alcanzan el limite de tokens, lo que ataca directamente el problema de bucles de repeticion en paginas fotografiadas.

La innovacion practica mas destacable es la salida estructurada con geometria: cada elemento lleva categoria y bounding box en orden de lectura, frente a la version anterior (Typhoon OCR 1.5) que devolvia solo Markdown sin posiciones. El modelo mantiene la capacidad de emitir Markdown mediante una conversion posterior del JSON, con o sin cabeceras y pies de pagina. No se especifican en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Parsing de documentos: devuelve elementos de maquetacion (13 categorias) con bounding box y texto en orden de lectura.
- Conversion de tablas a HTML, formulas a LaTeX y texto corrido a Markdown.
- Visual question answering: responde preguntas de forma libre sobre el contenido de un documento.
- Clasificacion de documentos.
- Extraccion de informacion clave a JSON.
- Lectura aislada de tablas, formulas y graficos (chart-to-data).
- Soporte de tailandes e ingles; presencia de chino en el entrenamiento sin evaluacion separada.
- Salida en JSON estructurado apta para post-proceso programatico y conversion a Markdown.
- No se indica soporte de tool calling, function calling ni modo de razonamiento explicito en la informacion disponible.

## Casos de uso

- Digitalizacion masiva de archivos administrativos tailandeses: el modelo procesa imagenes de pagina y devuelve JSON con posiciones, lo que permite reconstruir el documento y alimentar indices de busqueda; su mejora de 26.4 puntos en MDPBench TH frente al base lo hace adecuado para corpus en tailandes.
- Extraccion de datos de facturas y formularios: la tarea de key-information extraction a JSON permite mapear campos concretos sin post-proceso manual de maquetacion.
- Conversion de tablas financieras a HTML estructurado: util para pipelines que necesitan tablas parseadas y no solo texto plano.
- Atencion al cliente sobre documentos: el modo VQA responde preguntas libres sobre un contrato o manual, con soporte bilingue tailandes-ingles para entornos corporativos de Tailandia.
- Procesamiento de documentos fotografiados: el entrenamiento con GRPO reduce los bucles de repeticion (1 pagina en bucle de 320 en MDPBench frente a 36 de la version 1.5), lo que lo hace viable con capturas de movil en lugar de escaneos limpios.
- Clasificacion y enrutado documental: clasificar paginas por tipo antes de derivarlas a otros sistemas, usando el mismo modelo sin pipeline adicional.
- Conversion de formulas cientificas a LaTeX: extraccion de expresiones matematicas para publicaciones o repositorios tecnicos.
- Despliegue de bajo coste con la variante 0.8B cuando la precision extrema no es critica y prima el coste por pagina.

## Benchmarks y rendimiento

Resultados publicados por el autor, ejecutados con los mismos scripts de evaluacion (prompt doc2json, imagenes de hasta 16.7 MP, decodificacion greedy, maximo 16.384 tokens nuevos). En negrita el mejor resultado y subrayado el segundo mejor de cada columna. Flecha arriba indica mayor es mejor; flecha abajo, menor es mejor.

| Modelo | Parametros | MDPBench ↑ | MDPBench TH ↑ | olmOCR-bench ↑ | ThaiOCRBench ↑ | SEA-DocBench NED ↓ | OmniDocBench v1.6 ↑ |
|---|---:|---:|---:|---:|---:|---:|---:|
| Chandra-OCR-2 | 5B | 74.2 | 71.1 | 84.4 | 26.4 | 0.1141 | 89.65 |
| dots.mocr | 3B | 76.2 | 73.6 | 85.2 | 37.9 | 0.1135 | 91.09 |
| PaddleOCR-VL-1.6 | 0.9B | 72.5 | 68.4 | 80.8 | n/a | 0.1323 | 95.83 |
| Infinity-Parser2-Flash | 2B | 61.5 | 55.5 | 82.9 | 35.2 | 0.1906 | 86.44 |
| Typhoon OCR 1.5 | 2B | 62.8 | 64.3 | 62.0 | 40.5 | 0.1726 | 70.97 |
| Typhoon OCR V2 2B | 2B | 80.2 | 81.9 | 84.3 | 59.8 | 0.1170 | 91.49 |

Comparacion directa con el modelo base:

| Benchmark | Idioma | Infinity-Parser2-Flash | Typhoon OCR V2 2B | Cambio |
|---|---|---:|---:|---:|
| MDPBench TH ↑ | Tailandes | 55.5 | 81.9 | +26.4 |
| ThaiOCRBench ↑ | Tailandes | 35.2 | 59.8 | +24.6 |
| SEA-DocBench TH NED ↓ | Tailandes | 0.1590 | 0.1071 | −0.0519 |
| MDPBench EN ↑ | Ingles | 67.5 | 78.5 | +11.0 |
| olmOCR-bench ↑ | Ingles | 82.9 | 84.3 | +1.4 |
| SEA-DocBench EN NED ↓ | Ingles | 0.2222 | 0.1269 | −0.0953 |
| OmniDocBench v1.6 ↑ | Ingles y chino | 86.44 | 91.49 | +5.05 |

En MDPBench, las paginas tailandesas suben de 64.3 a 81.9 y las paginas fotografiadas de 61.6 a 80.1. Bajo decodificacion greedy, el modelo entra en bucle en 1 de cada 320 paginas de MDPBench, frente a 36 de Typhoon OCR 1.5. PaddleOCR-VL-1.6 no soporta VQA, por lo que no tiene puntuacion en ThaiOCRBench.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 2.213 millones de parametros en BF16 los pesos ocupan aproximadamente 4.4 GB, a lo que hay que sumar el coste del codificador visual y la cache KV para contextos largos (hasta 16.384 tokens nuevos de salida).
- GPU recomendadas: no especificadas por el autor. Por tamano, el modelo encaja en GPU de consumo con suficiente memoria, aunque no se confirma en la informacion disponible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de pesos, aunque el requisito real depende de la resolucion de imagen (hasta 16.7 MP) y de la longitud de salida; no hay cifras confirmadas.
- Opciones de despliegue: la model card indica la libreria `transformers` y el tag `endpoints_compatible`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MDPBench TH | ThaiOCRBench | Licencia | Disponibilidad |
|---|---:|---|---:|---:|---|---|
| Typhoon OCR V2 2B | 2B | no disponible | 81.9 | 59.8 | Apache 2.0 (sujeto a terminos OpenTyphoon) | HuggingFace |
| dots.mocr | 3B | no disponible | 73.6 | 37.9 | no disponible | no disponible |
| Chandra-OCR-2 | 5B | no disponible | 71.1 | 26.4 | no disponible | no disponible |
| PaddleOCR-VL-1.6 | 0.9B | no disponible | 68.4 | n/a (sin VQA) | no disponible | no disponible |
| Infinity-Parser2-Flash | 2B | no disponible | 55.5 | 35.2 | no disponible | HuggingFace |

Typhoon OCR V2 2B lidera en las metricas en tailandes (MDPBench TH y ThaiOCRBench) y en MDPBench global, mientras que dots.mocr y Chandra-OCR-2 quedan por delante en olmOCR-bench y SEA-DocBench NED, y PaddleOCR-VL-1.6 en OmniDocBench v1.6. La ventaja del modelo es especifica del tailandes y de las tareas VQA documentales.

## Limitaciones y advertencias

- El entrenamiento esta orientado a tailandes e ingles; el chino aparece en los datos pero no se ha evaluado, por lo que su rendimiento en ese idioma es incierto.
- Riesgo de bucles de repeticion en paginas fotografiadas: aunque se ha reducido drasticamente (1 de 320 frente a 36), no se elimina por completo.
- La salida es JSON estructurado; requiere post-proceso para obtener Markdown y la conversion por defecto descarta cabeceras, pies y notas al pie (aunque el modelo los emite).
- No se han publicado datos sobre sesgos, alucinacion en VQA ni robustez frente a documentos manipulados.
- Aunque el repositorio declara Apache 2.0, el uso queda sujeto a los terminos y condiciones de OpenTyphoon, que pueden imponer restricciones adicionales para uso comercial; conviene revisarlos antes de produccion.
- No se especifican la longitud de contexto ni los requisitos de VRAM, lo que dificulta el dimensionamiento de despliegues.
- El modelo esta entrenado con imagenes de hasta 4 MP; el rendimiento con resoluciones muy superiores o muy inferiores no esta documentado.
- El proyecto es muy reciente (creado en noviembre de 2026) y sin descargas registradas, por lo que la validacion comunitaria es practicamente inexistente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base: https://huggingface.co/infly/Infinity-Parser2-Flash
- Version anterior: https://huggingface.co/typhoon-ai/typhoon-ocr1.5-2b
- Variante 0.8B: https://huggingface.co/typhoon-ai/typhoon-ocr2-0.8b
- Codigo: https://github.com/scb-10x/typhoon-ocr
- Web del proyecto: https://opentyphoon.ai
- Terminos y condiciones: https://opentyphoon.ai/tac
- Paper (referencia arXiv en tags): arxiv:2601.14722
