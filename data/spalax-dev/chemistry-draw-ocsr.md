# spalax-dev/chemistry-draw-ocsr

## Resumen

`chemistry-draw-ocsr` es un repositorio de artefactos ONNX optimizados derivados de tres modelos DECIMER distintos para reconocimiento optico de estructuras quimicas (OCSR, *Optical Chemical Structure Recognition*) y clasificacion de imagenes quimicas. Lo publica el desarrollador `spalax-dev` como parte del proyecto `chemistry_draw`, una herramienta de dibujo y edicion de estructuras quimicas. El repositorio no entrena modelos nuevos: empaqueta variantes seleccionadas tras una evaluacion reproducible con la herramienta `decimer-onnx-toolchain` (`dtx`), con el objetivo de permitir inferencia autocontenida mediante ONNX Runtime sin depender de TensorFlow en tiempo de ejecucion.

El paquete cubre tres tareas diferenciadas: conversion de estructuras quimicas impresas a SMILES (`ocsr-printed-fp32`), conversion de estructuras dibujadas a mano (`ocsr-handdrawn-fp32`) y un clasificador binario que decide si una imagen contiene una estructura quimica o no (`image-classifier-fp16`). Cada artefacto proviene de un modelo fuente distinto, con pesos y tokenizadores propios, y se ha evaluado de forma independiente. La seleccion de variantes prioriza la precision sobre la compresion: se adopta una cuantizacion mas agresiva solo cuando no baja del umbral del 70% en la metrica principal.

El interes actual del repositorio es practico: ofrece pesos listos para produccion en formato ONNX con metricas congeladas y trazabilidad de las variantes descartadas, algo poco habitual en el ecosistema OCSR. El tamano total del repositorio es de 0,6 GB, con pesos mayoritariamente en FP32 para los modelos OCSR y FP16 para el clasificador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos grafos ONNX por modelo OCSR (`encoder.onnx` + `decoder_step.onnx` con decodificacion greedy externa); clasificador convolucional ONNX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la decodificacion es autorregresiva paso a paso sobre la representacion de la imagen) |
| Tipos de cuantizacion | FP32 (OCSR impreso y manuscrito), FP16 (clasificador); se evaluaron INT8 dinamica, INT8 estatica QDQ y variantes hibridas, descartadas por caida de precision |
| Idiomas soportados | no disponible (la salida es SMILES, no texto natural) |
| Licencia | mixta: `other` en el repositorio; DECIMER v2 impreso y manuscrito bajo CC-BY-4.0; clasificador bajo MIT |
| Formato de pesos | ONNX (`.onnx`), vocabularios en `vocab.json` y metadatos en JSON (`export.fp32.meta.json`, `e4.fp16.meta.json`) |

## Arquitectura y entrenamiento

Los dos modelos OCSR siguen el diseno DECIMER: un codificador de imagen que produce una representacion y un decodificador autorregresivo de un solo paso (`decoder_step.onnx`) que se invoca en bucle desde un decodificador greedy externo hasta emitir el SMILES completo. Cada modelo lleva su propio `vocab.json`, y el autor advierte explicitamente que los tokenizadores de las variantes impresa y manuscrita difieren, por lo que debe usarse el vocabulario de la misma carpeta que el modelo. El preprocesado de imagen y la decodificacion siguen las convenciones de DECIMER. El clasificador es una red convolucional que distingue estructuras quimicas de imagenes que no lo son.

No se aportan datos sobre el entrenamiento original (numero de tokens, composicion del dataset, uso de RLHF o DPO), ya que el repositorio solo redistribuye pesos de terceros: DECIMER v2 impreso (Zenodo 8300489), DECIMER v2 manuscrito (Zenodo 10781330) y el clasificador de `Iagea/DECIMER-Image-Classifier`. La aportacion tecnica del repositorio es la conversion a ONNX y la evaluacion sistematica de variantes de cuantizacion. Los resultados relevantes: en el modelo impreso, INT8 dinamica baja a 0,6776 de SMILES canonico RDKit y la cuantizacion estatica/hibrida colapsa a 0,485; las variantes mixtas rozan el 0,70 en evaluacion pero caen por debajo en el conjunto de retencion. En el manuscrito, INT8 dinamica alcanza 0,7149 pero con peor fidelidad respecto a TensorFlow (0,858 frente a 0,912) y es aproximadamente 2,6 veces mas lenta en CPU (p50 2860 ms frente a 1115 ms). En el clasificador, FP16 mantiene una paridad de 0,998 con TensorFlow y reduce el tamano un 49% (7,78 MB frente a 15,35 MB), mientras que INT8 sobre las capas convolucionales hunde la precision a 0,4085.

## Capacidades

- Reconocimiento de estructuras quimicas impresas y conversion a SMILES canonico, con decodificacion autorregresiva greedy.
- Reconocimiento de estructuras dibujadas a mano, con un modelo especializado distinto del anterior.
- Clasificacion binaria de imagenes para determinar si contienen una estructura quimica.
- Inferencia autocontenida en ONNX Runtime, sin necesidad de TensorFlow en tiempo de ejecucion.
- Ejecucion en CPU: los tres artefactos estan pensados para desplegarse sin GPU.
- Generalizacion cruzada parcial: el modelo entrenado para manuscrito obtiene 0,694 de SMILES canonico sobre estructuras impresas, frente a 0,704 del modelo impreso.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No es un modelo de lenguaje: no genera texto natural ni mantiene conversaciones.

## Casos de uso

- Digitalizacion de articulos cientificos: extraer estructuras quimicas de figuras en PDF o imagenes escaneadas y convertirlas a SMILES para indexarlas en bases de datos o motores de busqueda quimica. El modelo impreso ofrece 0,7041 de coincidencia canonica RDKit y 0,969 de SMILES validos.
- Procesamiento de cuadernos de laboratorio: convertir dibujos manuales de moleculas en formato legible por maquina mediante el modelo manuscrito, con 0,7300 de coincidencia canonica y 0,912 de fidelidad respecto a la implementacion original en TensorFlow.
- Filtrado previo en pipelines de ingestion: usar el clasificador FP16 (7,78 MB, precision binaria 0,7679) para descartar imagenes que no contienen estructuras quimicas antes de invocar los modelos OCSR, reduciendo coste computacional.
- Integracion en aplicaciones de escritorio o web sin GPU: al ejecutarse con ONNX Runtime en CPU, los artefactos encajan en herramientas como `chemistry_draw` o visores de moleculas que necesitan reconocimiento local sin depender de servicios externos.
- Enriquecimiento de bases de datos quimicas: procesar lotes de imagenes historicas y generar SMILES para comparar con registros existentes mediante RDKit, usando la igualdad canonica como criterio de deduplicacion.
- Verificacion de patentes y literatura: detectar y transcribir estructuras en documentos regulatorios donde la revision manual es costosa, aceptando la latencia de aproximadamente 1,1 s de mediana por estructura en el modelo manuscrito FP32.
- Construccion de conjuntos de datos de entrenamiento: usar las predicciones como etiquetas preliminares en tareas de OCSR, con validacion humana posterior dado el nivel de acierto.

## Benchmarks y rendimiento

| Artefacto | Metrica principal | Resultado | Muestra | Notas |
|---|---|---|---|---|
| `ocsr-printed-fp32` | SMILES canonico RDKit | 0,7041 (614/872) | n=1000, eval congelada | Coincidencia exacta 0,012; SMILES validos 0,969 |
| `ocsr-printed-fp32` (INT8 dinamica E1, no seleccionada) | SMILES canonico RDKit | 0,6776 | n=1000, eval | Por debajo del umbral del 70% |
| `ocsr-printed-fp32` (estatica/hibrida E3, no seleccionada) | SMILES canonico RDKit | 0,485 | n=1000, eval | Degradacion severa |
| `ocsr-handdrawn-fp32` | SMILES canonico RDKit | 0,7300 (711/974) | n=1000, eval | `tf_match` 0,912; p50 1115 ms, p95 2156 ms (n=700) |
| `ocsr-handdrawn-fp32` (E1 INT8 dinamica, no seleccionada) | SMILES canonico RDKit | 0,7149 (692/968) | n=1000, eval | `tf_match` 0,858; p50 2860 ms, p95 3951 ms |
| `ocsr-handdrawn-fp32` sobre impresas | SMILES canonico RDKit | 0,694 (628/905) | eval-1000 impreso | Generalizacion cruzada |
| `image-classifier-fp16` | Precision binaria | 0,7679 | n=1000, no reaccion | Paridad TF 0,998; 7,78 MB |
| `image-classifier-fp16` (INT8 dinamica, no seleccionada) | Precision binaria | 0,4085 | n=1000 | Descartada |
| `image-classifier-fp16` (INT8 estatica QDQ, no seleccionada) | Precision binaria | 0,5345 | n=1000 | Descartada |

## Requisitos de hardware

- VRAM: no aplica en el despliegue de referencia, que es CPU mediante ONNX Runtime. No se publican estimaciones de VRAM para GPU.
- Tamano en disco: aproximadamente 301 MB para cada modelo OCSR en FP32 (codificador y decodificador) y 7,78 MB para el clasificador FP16; repositorio total de 0,6 GB.
- GPU recomendadas: no disponible. El autor no documenta despliegue en GPU ni requisitos de memoria grafica.
- GPU de consumo: no se han publicado pruebas en tarjetas como RTX 4090; el diseno apunta a CPU.
- Opciones de despliegue: ONNX Runtime (libreria declarada), con decodificacion greedy externa para los modelos OCSR. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia: en el modelo manuscrito FP32, p50 de 1115 ms y p95 de 2156 ms por estructura (n=700) en CPU. La variante INT8 dinamica es aproximadamente 2,6 veces mas lenta en este entorno. No se publican cifras de throughput agregado ni latencia del modelo impreso.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento OCSR | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `chemistry-draw-ocsr` (DECIMER v2 ONNX) | no disponible | no disponible | 0,7041 impreso; 0,7300 manuscrito (SMILES canonico RDKit) | Mixta (CC-BY-4.0 y MIT) | ONNX en Hugging Face |
| DECIMER v2 original | no disponible | no disponible | Referencia de fidelidad (`tf_match` 0,912 en manuscrito) | CC-BY-4.0 | TensorFlow en Zenodo |
| MolScribe | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |
| Img2Mol | no disponible | no disponible | no disponible en la informacion proporcionada | no disponible | no disponible |

No se dispone de datos de benchmarks de MolScribe ni Img2Mol en la informacion proporcionada, por lo que la comparacion cuantitativa con alternativas queda limitada a la fidelidad frente a la implementacion original de DECIMER en TensorFlow.

## Limitaciones y advertencias

- Precision modesta: el mejor resultado en estructuras impresas es 0,7041 de coincidencia canonica, y la coincidencia exacta de cadena es de solo 0,012; no es adecuado para transcripcion sin revision humana.
- El clasificador tiene una precision binaria de 0,7679, insuficiente para filtrado automatico sin supervision en entornos criticos.
- La cuantizacion agresiva degrada gravemente la calidad: INT8 estatica colapsa el modelo impreso a 0,485 y la INT8 sobre convoluciones reduce el clasificador a 0,4085.
- INT8 dinamica en el modelo manuscrito es mas lenta que FP32 en CPU (p50 2860 ms frente a 1115 ms) ademas de menos fiel.
- Los tokenizadores de los dos modelos OCSR son distintos; mezclar modelo y vocabulario produce resultados invalidos.
- La especializacion no es exclusiva: el modelo manuscrito rinde 0,694 en impresas y el impreso cae a 0,677 en manuscritas, por lo que la eleccion del modelo debe hacerse segun el dominio.
- Licencia mixta: el repositorio declara `other`, con componentes CC-BY-4.0 (requiere atribucion) y MIT. Debe verificarse el cumplimiento de atribucion antes de uso comercial.
- No se documentan sesgos, cobertura idiomatica ni comportamiento fuera de dominios quimicos; el modelo no procesa texto natural.
- Riesgo de alucinacion estructural: el decodificador autorregresivo puede generar SMILES sintacticamente validos pero quimicamente incorrectos, como indica la baja coincidencia exacta.
- El repositorio solo contiene artefactos seleccionados y documentacion; no incluye codigo de entrenamiento ni el conjunto de evaluacion.

## Enlaces

- Hugging Face: https://huggingface.co/spalax-dev/chemistry-draw-ocsr
- Proyecto chemistry_draw: https://github.com/spalax-dev/chemistry_draw
- DECIMER v2 impreso (Zenodo): https://zenodo.org/records/8300489
- DECIMER v2 manuscrito (Zenodo): https://zenodo.org/records/10781330
- DECIMER-Image-Classifier: https://github.com/Iagea/DECIMER-Image-Classifier
