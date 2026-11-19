# thelamapi/Next-Ask

## Resumen

Next Ask es un modelo de seleccion activa (active learning) publicado por el usuario thelamapi en Hugging Face. No es un modelo generativo de lenguaje ni una red neuronal profunda: se trata de un clasificador de regresion logistica multinomial (softmax regression) implementado en NumPy puro, acompanado de un selector que decide que ejemplo sin etiquetar debe enviarse a una persona anotadora a continuacion. El problema que resuelve es el coste de etiquetado: cuando las etiquetas son caras, elegir bien que muestras anotar reduce el numero de etiquetas necesarias para alcanzar una precision objetivo.

El sistema combina incertidumbre del clasificador (margen entre las dos clases mas probables) con diversidad (seleccion farthest-first sobre un shortlist de los 40 items menos seguros), de modo que cada lote anotado aporta tanto informacion sobre fronteras de decision como cobertura del espacio de entrada. El clasificador se reentrena tras cada lote. La tarea evaluada es clasificacion tabular sobre el dataset Optical Recognition of Handwritten Digits (8x8, UCI id 80), con un split de 1237 ejemplos de pool, 200 de validacion y 360 de test.

Es relevante ahora como referencia reproducible y ligera de pipelines de active learning: el modelo pesa unos pocos kilobytes en `model.json`, funciona solo con NumPy y dispone de un port JavaScript que se ejecuta en el navegador con paridad numerica respecto a Python (diferencia maxima absoluta de 1.1e-16 en cuatro casos fijos). No debe confundirse con un LLM: no tiene parametros a gran escala, contexto de tokens ni capacidades de generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica multinomial (softmax regression) sobre 64 intensidades de pixel, con selector de active learning acoplado |
| Parametros totales | no disponible (pesos en `model.json`; 64 entradas x 10 clases mas sesgos, orden de 650 parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, entradas de 64 dimensiones) |
| Tipos de cuantizacion | no disponible (pesos almacenados como numeros en JSON; no se documentan esquemas de cuantizacion) |
| Idiomas soportados | no disponible (no procesa texto; clasifica digitos manuscritos 8x8) |
| Licencia | CC BY 4.0 |
| Formato de pesos | JSON (`model.json`), cargado con NumPy; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El clasificador es una regresion logistica multinomial que toma las 64 intensidades de pixel (valores enteros 0..16) como entrada y produce 10 probabilidades de clase. El entrenamiento usa descenso de gradiente full-batch desde pesos inicializados a cero, con 150 pasos, tasa de aprendizaje 1.0 y regularizacion L2 de 0.001; estos hiperparametros se eligieron sobre un split de validacion de 200 ejemplos y nunca sobre test. La seleccion activa se articula en dos etapas: primero se ordena el pool por incertidumbre (margen entre las dos clases mas probables) y se toma un shortlist de los 40 items menos seguros; despues se puntua cada candidato como (1 - margen) x distancia al ejemplo etiquetado o ya seleccionado mas cercano, aplicando farthest-first para maximizar diversidad.

Los datos de entrenamiento provienen de `sklearn.datasets.load_digits` (Optical Recognition of Handwritten Digits 8x8, UCI ML Repository id 80, licencia CC BY 4.0), con split estratificado y semilla 73: 1237 en pool, 200 en validacion y 360 en test. La innovacion destacable no es arquitectonica sino de ingenieria de seleccion: la combinacion incertidumbre + diversidad y el port JavaScript linea a linea que permite reentrenar el clasificador en el navegador del usuario dentro del Space asociado.

## Capacidades

- Clasificacion tabular de digitos manuscritos 8x8 en 10 clases (0-9).
- Seleccion activa de ejemplos a etiquetar mediante estrategia hibrida (incertidumbre + diversidad), estrategia de solo incertidumbre o aleatoria.
- Reentrenamiento incremental del clasificador tras cada lote de etiquetas.
- Inferencia en NumPy puro, sin dependencias de frameworks de deep learning.
- Ejecucion en navegador mediante port JavaScript con paridad numerica verificada frente a Python.
- Autotest integrado (`python inference.py --selftest`) que recarga el modelo y comprueba salidas almacenadas.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, agentes, capacidades multilingues ni modos de pensamiento.

## Casos de uso

- Priorizacion de anotacion en proyectos de vision clasica: usar `next_queries` con `strategy="hybrid"` para decidir que imagenes de digitos enviar a anotadores humanos, reduciendo el volumen de etiquetas necesarias frente a muestreo aleatorio.
- Prototipado de pipelines de active learning: servir como linea base reproducible (semillas, splits y metricas documentadas) antes de migrar a modelos mayores o datasets reales.
- Docencia y demostraciones interactivas: el Space permite que estudiantes etiqueten digitos en el navegador y observen como se reentrena el clasificador en tiempo real, ilustrando el bucle de active learning.
- Validacion de estrategias de seleccion: comparar empiricamente incertidumbre sola frente a incertidumbre + diversidad usando el script `ask_core.py` y las metricas de `evaluation.json`.
- Integracion en sistemas de etiquetado con presupuesto limitado: dado un pool sin etiquetar y un coste por etiqueta, el selector puede alimentar una cola de trabajo para anotadores con lotes de tamano configurable (`batch`).
- Reproduccion de experimentos en entornos sin GPU: al ejecutarse solo con NumPy y JSON, puede correr en CPU, contenedores minimos o incluso en el navegador, lo que facilita auditoria y replicacion.
- Generacion de curvas de aprendizaje para informes: las funciones de evaluacion producen AULC, precision final y numero mediano de etiquetas para alcanzar un objetivo, utiles para justificar presupuestos de anotacion.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre 10 semillas, 360 digitos de test, lotes de 10 y presupuesto de 200 etiquetas:

| Estrategia | Area bajo la curva (AULC) | Precision final | Etiquetas para 90% (mediana) |
|---|---:|---:|---:|
| Incertidumbre + diversidad (Next Ask) | 0.8897 ± 0.0066 | 0.9583 | 70 (10/10 semillas) |
| Solo incertidumbre | 0.8837 ± 0.0135 | 0.9569 | 70 (10/10 semillas) |
| Aleatoria | 0.8508 ± 0.0115 | 0.9283 | 115 (10/10 semillas) |

Precision media en test segun numero de etiquetas seleccionadas:

| Etiquetas | Aleatoria | Incertidumbre | Incertidumbre + diversidad |
|---:|---:|---:|---:|
| 20 | 0.6508 | 0.6608 | 0.7036 |
| 50 | 0.8386 | 0.8650 | 0.8736 |
| 100 | 0.8864 | 0.9294 | 0.9314 |
| 150 | 0.9131 | 0.9447 | 0.9492 |
| 200 | 0.9283 | 0.9569 | 0.9583 |

Comparaciones pareadas por semilla (mismas etiquetas iniciales): hibrida - aleatoria AULC = +0.0388 ± 0.0113 (hibrida mejor en 10/10 semillas); hibrida - solo incertidumbre = +0.0060 ± 0.0104 (hibrida mejor en 6/10 semillas). El modelo final en `model.json` corresponde a la ejecucion hibrida de la semilla 0 con presupuesto completo, con 17 de 360 digitos de test erroneos.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente nula; el clasificador y el selector caben en memoria principal (pesos en JSON de unos pocos kilobytes y pool de 1237 vectores de 64 enteros).
- GPU recomendadas: innecesarias para inferencia; el autor documenta que la ejecucion registrada se realizo en una NVIDIA L4 con perfil completo, pero el modelo es ejecutable en CPU.
- GPU de consumo: si, cabe en cualquier GPU consumer e incluso en entornos sin GPU; tambien se ejecuta en navegador via JavaScript.
- Opciones de despliegue: NumPy + Python (`inference.py`, `ask_core.py`, `nlrt.py`), port JavaScript en el Space de Hugging Face, y contenedores minimos sin dependencias de vLLM, llama.cpp, Ollama o TGI (no aplicables a este modelo).
- Latencia y throughput: no disponibles de forma numerica; el entrenamiento es full-batch de 150 pasos sobre un pool pequeno, y el coste dominante en el bucle es el reentrenamiento tras cada lote, no la inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Next Ask (thelamapi) | ~650 (64x10 + sesgos) | no aplica | Softmax + active learning hibrido | CC BY 4.0 | Hugging Face (modelo y Space) |
| Solo incertidumbre (variante interna) | ~650 | no aplica | Softmax + seleccion por margen | CC BY 4.0 | Incluido en `ask_core.py` |
| Aleatoria (linea base interna) | ~650 | no aplica | Softmax + muestreo aleatorio | CC BY 4.0 | Incluido en `ask_core.py` |

No se dispone en la informacion proporcionada de modelos externos comparables de active learning tabular con metricas publicadas en el mismo benchmark; la comparacion se limita a las tres estrategias internas evaluadas por el autor.

## Limitaciones y advertencias

- El benchmark de digitos 8x8 es facil y balanceado; las ganancias de active learning suelen ser menores en datos reales ruidosos o desbalanceados.
- La simulacion asume un anotador perfecto (etiquetas del dataset); el Space permite etiquetado humano, pero no se realizo ningun estudio con personas.
- El modelo final en `model.json` es una ejecucion de demostracion (semilla 0, presupuesto completo) con 17 de 360 digitos de test erroneos; no debe tratarse como un clasificador de produccion de alta precision.
- No procesa texto ni imagenes de resolucion arbitraria: solo vectores de 64 intensidades 0..16 correspondientes a digitos 8x8.
- Sesgos conocidos: no documentados por el autor; al ser un clasificador de digitos balanceados, el riesgo de sesgo por clase es bajo pero no se han publicado analisis especificos.
- Riesgo de alucinacion: no aplica (modelo discriminativo, no generativo); el riesgo equivalente es sobreconfianza en clases ambiguas, mitigado parcialmente por la seleccion basada en margen.
- Restricciones de licencia: CC BY 4.0 permite uso comercial con atribucion; debe conservarse la referencia al autor y a la licencia en redistribuciones y derivados.
- Caveat de produccion: el diseno esta pensado para el bucle de etiquetado, no para servir predicciones a gran escala; para despliegue real convendria sustituir el clasificador por uno mas potente manteniendo el selector.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/thelamapi/Next-Ask
- Space interactivo: https://huggingface.co/spaces/thelamapi/Next-Ask
- Dataset UCI Optical Recognition of Handwritten Digits (id 80): https://archive.ics.uci.edu/dataset/80/optical+recognition+of+handwritten+digits
- Documentacion de `sklearn.datasets.load_digits`: https://scikit-learn.org/stable/modules/generated/sklearn.datasets.load_digits.html
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
