# ThakiCloud/ThakiOCR-KO-v1

## Resumen

ThakiOCR-KO-v1 es un adaptador LoRA de rango 16 desarrollado por ThakiCloud sobre el modelo multimodal ATH-MaaS/OvisOCR3, orientado a la transcripcion de recortes de una sola palabra en coreano. El adaptador se aplica exclusivamente sobre las capas del decodificador, manteniendo congelados el vision tower y el merger vision-lenguaje del modelo base. Su proposito es reducir la tasa de error de caracter (CER) en reconocimiento de palabras coreanas, incluyendo escritura manuscrita, texto impreso y fotografias en exteriores.

La relevancia del modelo reside en su enfoque de seleccion conservador: ThakiCloud entreno dos variantes (M1 y M2) bajo una regla de seleccion preregistrada. Aunque M2 obtenia mejor CER (5,98 % frente a 7,78 %), degradaba la preservacion de estructura tabular por debajo de la tolerancia aceptada, por lo que se publica M1 como adaptador que no introduce regresiones en las tareas de estructura documental evaluadas. El resultado es una mejora del 69,2 % relativo en CER agrupado sobre un conjunto de desarrollo interno de 2.400 recortes.

Se trata de una research preview, no de un producto final: el entrenamiento y la evaluacion se hicieron solo con recortes de palabra unica, y la generalizacion a nuevas personas, fuentes tipograficas o condiciones de captura no se ha validado. El adaptador requiere un protocolo de inferencia muy especifico (revision concreta del modelo base, prompt, tamano de imagen y decodificacion greedy) para reproducir los resultados reportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16) sobre decodificador de modelo multimodal image-text-to-text (base: ATH-MaaS/OvisOCR3) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluado en fp32 con autocast bf16 en generacion) |
| Idiomas soportados | coreano (ko) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre ATH-MaaS/OvisOCR3, un modelo multimodal de tipo image-text-to-text. La intervencion de ThakiCloud consiste en un LoRA de rango 16 aplicado unicamente a las capas del decodificador; el vision tower y el merger vision-lenguaje permanecen congelados. Se entreno una segunda variante (M2) con LoRA tambien en el vision tower y un merger entrenable, que logro mejor reconocimiento de palabra pero incumplio la puerta de preservacion de estructura tabular (coincidencia exacta de estructura 0,80 frente a 0,98 del base en 50 paginas sinteticas selladas, con tolerancia 0,04); M2 no forma parte de este repositorio.

Los datos de entrenamiento y evaluacion provienen de las mismas fuentes de dataset, con 2.400 recortes de desarrollo (600 por fuente: 605 de manuscrito, 91 de manuscrito de 15 escritores, 91 impresos y 105 fotografias en exteriores). La evaluacion de CER se realizo tras normalizacion NFC y eliminacion de espacios. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Transcripcion OCR de recortes de una sola palabra en coreano a texto.
- Reconocimiento de escritura manuscrita coreana (CER 7,23 % en el subconjunto de 605 recortes manuscritos).
- Reconocimiento de texto impreso coreano (CER 1,56 % en 91 recortes impresos).
- Reconocimiento de texto en fotografias de exteriores (CER 7,97 % en 105 recortes).
- Manejo de caracteres Hangul, digitos, Latin y puntuacion (CER por clase: 9,11 %, 0,85 %, 5,04 % y 4,14 % respectivamente).
- Generacion con modo thinking desactivado (`enable_thinking=False`) segun el protocolo evaluado.
- No se reporta soporte de tool calling, function calling, agentes ni multi-step reasoning en la informacion disponible.

## Casos de uso

- Digitalizacion de formularios manuscritos: el adaptador puede transcribir recortes de palabras individuales extraidos de formularios escaneados, con CER de 7,23 % en manuscrito, adecuado para pre-rellenado asistido por humano.
- Indexacion de archivos historicos coreanos: sobre recortes de palabra de documentos escaneados, permite generar metadatos textuales para busqueda, aunque requiere validacion humana por la ausencia de pruebas de generalizacion a nuevas fuentes.
- Lectura de matriculas o etiquetas en fotografias: el CER de 7,97 % en fotografias de exteriores lo hace util para pipelines de captura movil con revision posterior.
- Extraccion de campos en facturas y tickets coreanos: combinado con un detector de palabras, permite reconstruir campos de texto en documentos estructurados sin degradar la estructura tabular del modelo base.
- Preprocesado para pipelines de OCR de pagina completa: al no introducir regresiones en las pruebas de estructura documental, puede integrarse como etapa de refinamiento de palabras sobre la salida de un OCR de linea.
- Anotacion asistida en investigacion linguistica: util para generar transcripciones preliminares de corpus de escritura manuscrita coreana de 15 escritores, con CER de 17,38 % que exige correccion manual.
- Prototipado de accesibilidad: transcripcion de palabras sueltas capturadas con camara para aplicaciones de lectura asistida en coreano.

## Benchmarks y rendimiento

CER tras normalizacion NFC y eliminacion de espacios. Menor es mejor.

| Fuente | Base (OvisOCR3) | M1 (este adaptador) | M2 (no publicado) |
|---|---|---|---|
| Agrupado | 25,28 % | 7,78 % | 5,98 % |
| 605 manuscritos | 28,32 % | 7,23 % | 5,53 % |
| 91 manuscritos (15 escritores) | 66,89 % | 17,38 % | 12,19 % |
| 91 impresos | 6,28 % | 1,56 % | 1,66 % |
| 105 fotografias exteriores | 13,23 % | 7,97 % | 6,47 % |

CER por clase de caracter (M1): Hangul 9,11 %, digitos 0,85 %, Latin 5,04 %, puntuacion 4,14 % (base: 18,87 %, 3,75 %, 22,30 %, 18,42 %). Latin cubre solo 42 recortes (139 caracteres).

Diferencia pareada M1 frente a base: −17,50 pp agrupado (IC 95 % −20,32 a −15,12). M2 frente a M1: −1,80 pp agrupado (IC 95 % −2,43 a −1,14); en manuscrito de 91 recortes, −5,19 pp con bootstrap agrupado por escritor (IC 95 % −7,49 a −3,20).

Comprobacion de no regresion en estructura documental (200 paginas sinteticas selladas, incluidas 50 de tablas, y una suite de 849 items de documentos coreanos): M1 no cae por debajo de las tolerancias preregistradas del modelo base. La informacion disponible no detalla el resto de cifras de esta tabla.

## Requisitos de hardware

- VRAM estimada: 7,02 GiB de memoria pico medida con el adaptador sobre el modelo base en fp32 con autocast bf16, a batch size 1.
- GPU recomendadas: el modelo se midio en una NVIDIA B200; el modelo base solo consumio 4,95 GiB pico, por lo que tarjetas consumer de gama alta con 8-12 GiB podrian alojarlo, aunque no se reportan pruebas en ellas.
- Latencia medida (B200, batch 1, 2.400 recortes): mediana 0,210 s, p95 0,360 s con adaptador; 0,186 s y 0,310 s con el modelo base solo.
- Opciones de despliegue: transformers >= 5.0 con peft >= 0.21 y torch; no se reportan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Requisito critico: fijar la revision `4833d5d2afa6e769ee933f024504d67ace80a24c` del modelo base, ya que su rama `main` ha cambiado desde el entrenamiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThakiOCR-KO-v1 | no disponible (LoRA r16 sobre OvisOCR3) | no disponible | Adaptador OCR de palabra coreana | Apache-2.0 | Hugging Face |
| ATH-MaaS/OvisOCR3 (base) | no disponible | no disponible | OCR multimodal image-text-to-text | no disponible en la informacion | Hugging Face |
| ThakiOCR-KOEN-V1-Dense | 2,13 M | no disponible | OCR de linea coreano-ingles entrenado desde cero | Apache-2.0 | Hugging Face |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoria distintos de los reportados frente al modelo base.

## Limitaciones y advertencias

- Research preview: no es una version de produccion y no ha sido validada de forma independiente en OCR de pagina completa.
- Entrenamiento y evaluacion realizados solo con recortes de una sola palabra; el rendimiento en documentos completos no esta verificado.
- La comprobacion de estructura documental se limita a "sin regresion frente al base" en 200 paginas sinteticas selladas y 849 items de prueba; no garantiza comportamiento en documentos reales.
- Generalizacion no probada a nuevos escritores, fuentes tipograficas, tipos de documento o condiciones de captura; el conjunto de desarrollo procede de las mismas fuentes que el entrenamiento.
- El CER en manuscrito de escritores no vistos en el conjunto de desarrollo es del 17,38 %, lo que exige revision humana.
- La cobertura de caracteres Latin es muy reducida (42 recortes, 139 caracteres), por lo que las cifras en esa clase son poco representativas.
- Requiere un protocolo de inferencia exacto (prompt, revision del base, tamano de imagen, decodificacion greedy); otras configuraciones no fueron evaluadas y pueden degradar el resultado.
- Riesgo de alucinacion y sesgos no cuantificados en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero la ausencia de validacion externa desaconseja su despliegue sin evaluacion propia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/ThakiOCR-KO-v1
- Modelo base: https://huggingface.co/ATH-MaaS/OvisOCR3
- Blog de ThakiCloud sobre ThakiOCR A (ingles): https://thakicloud.com/tech-blog/en/research/thakiocr-a-small-korean-english-line-ocr/
- Blog de ThakiCloud sobre ThakiOCR A (coreano): https://thakicloud.com/tech-blog/ko/research/thakiocr-a-small-korean-english-line-ocr/
