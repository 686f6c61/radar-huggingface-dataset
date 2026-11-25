# Tonic/drone-detectonic-0.1

## Resumen

Tonic/drone-detectonic-0.1 es un modelo publicado en Hugging Face por el usuario Tonic, orientado a la deteccion acustica de drones (acoustic wake) en el contexto de sistemas anti-UAS (counter-UAS). Por sus etiquetas, el modelo se enmarca en el "challenge-5" del "paris-hackathon-2026" y se distribuye en formato ONNX para su ejecucion con onnxruntime, con licencia Apache 2.0.

A diferencia de un modelo de lenguaje generativo, se trata de un modelo especializado de clasificacion/deteccion sobre senal acustica: sus etiquetas (acoustic-wake, drone-detection, c-uas) apuntan a la deteccion de la estela acustica de aeronaves no tripuladas a partir de audio. El repositorio figura con un tamano de 0.0 GB y cero descargas, lo que sugiere un artefacto ligero y de publicacion muy reciente (creado el 21 de noviembre de 2026 y actualizado el 25 de noviembre de 2026).

La informacion publica disponible es muy limitada: no consta pipeline declarado, no se indican idiomas, no hay resultados de benchmarks en la informacion proporcionada y el acceso esta restringido (gated), requiriendo aceptar condiciones en Hugging Face. Esta ficha recoge exclusivamente los datos verificables y marca como "no disponible" todo aquello que no se puede confirmar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ONNX para deteccion acustica; arquitectura interna no especificada) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de senal acustica, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

No se dispone de informacion publica sobre la arquitectura interna del modelo. Los metadatos indican unicamente que se distribuye como grafo ONNX y que esta pensado para inferencia con onnxruntime, lo que es coherente con un despliegue de baja latencia en entornos de borde (edge) o en pipelines de procesamiento de audio en tiempo real. No consta si se trata de una red convolucional, un modelo tipo transformer sobre espectrogramas u otra familia.

Tampoco hay datos sobre el volumen o la composicion del dataset de entrenamiento, ni sobre si se aplicaron tecnicas de aumento de datos, destilacion o ajuste fino supervisado. Las etiquetas del repositorio lo vinculan a un hackathon ("paris-hackathon-2026", "challenge-5"), lo que sugiere un desarrollo acotado en el tiempo y con un conjunto de datos especifico del reto, pero no se detalla nada mas.

## Capacidades

- Deteccion acustica de drones: el modelo esta orientado a identificar la presencia de aeronaves no tripuladas a partir de senal de audio ("acoustic wake", estela acustica).
- Clasificacion sobre audio: por su naturaleza y formato ONNX, se espera que reciba caracteristicas o muestras de audio y devuelva una prediccion de deteccion; el esquema exacto de entrada/salida no esta disponible.
- Integracion en sistemas counter-UAS (c-uas): pensado como componente de deteccion dentro de una cadena de vigilancia.
- Inferencia con onnxruntime: compatible con despliegues en CPU y en aceleradores soportados por onnxruntime.
- No consta soporte de tool calling, agentes, razonamiento multi-paso, vision, audio generativo ni capacidades multilingues, al no ser un modelo de lenguaje.

## Casos de uso

- Vigilancia perimetral de instalaciones sensibles: desplegar el modelo sobre microfonos distribuidos para detectar la aproximacion de drones y activar alertas, aprovechando su formato ONNX para ejecucion en dispositivos de borde.
- Proteccion de infraestructuras criticas: aeropuertos, plantas industriales o subestaciones electricas pueden integrar el detector en su sistema de seguridad para complementar radar y vision.
- Monitorizacion en eventos multitudinarios: deteccion temprana de drones no autorizados sobre recintos, con inferencia local que evita enviar audio a la nube.
- Investigacion en acustica aplicada: servir de base o referencia en estudios de deteccion de estela acustica, al ser un artefacto reproducible con licencia permisiva.
- Prototipado rapido en hackathons y pruebas de concepto: su empaquetado ONNX y su licencia Apache 2.0 facilitan la integracion en demos y validaciones tecnicas.
- Sistemas de seguridad en fronteras o recintos penitenciarios: capa adicional de deteccion pasiva que no requiere iluminacion ni linea de vision, a diferencia de camaras.
- Educacion y formacion: ejemplo practico de pipeline de audio a inferencia ONNX para cursos de machine learning aplicado a senal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repositorio es de 0.0 GB, lo que sugiere un modelo muy ligero que probablemente quepa en memoria de CPU.
- GPU recomendadas: no disponibles; al ejecutarse con onnxruntime puede correr en CPU y, opcionalmente, en GPU con los execution providers de onnxruntime (CUDA, TensorRT, DirectML), sin que se especifiquen modelos concretos.
- Compatibilidad con GPU de consumo: probable por el tamano declarado del repositorio, aunque no hay confirmacion oficial.
- Opciones de despliegue: onnxruntime (CPU/GPU), con posibilidad de integracion en servicios propios; no consta soporte explicito de vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se ha proporcionado informacion sobre modelos comparables de deteccion acustica de drones ni sobre sus caracteristicas, por lo que no es posible establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos, lo que puede limitar la reproducibilidad inmediata.
- Documentacion practicamente inexistente: no hay model card con detalles de arquitectura, datos, metricas ni esquema de entrada/salida, lo que dificulta su evaluacion y uso en produccion.
- Sin benchmarks publicados: no es posible validar su precision, tasa de falsos positivos o robustez frente a ruido ambiental.
- Riesgo de alucinacion no aplica en el sentido linguistico, pero si existe riesgo de falsos positivos y falsos negativos en la deteccion, sin datos que lo cuantifiquen.
- Dependencia del entorno acustico: los modelos de deteccion por audio suelen degradarse con viento, trafico, reverberacion u otras fuentes sonoras; no se documenta su robustez.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni de validacion externa.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene verificar las condiciones adicionales del acceso gated.
- Contexto de hackathon: el origen en un reto acotado sugiere un alcance limitado y posible falta de madurez para despliegues criticos.

## Enlaces

- Hugging Face: https://huggingface.co/Tonic/drone-detectonic-0.1
- Tonic App (posible entidad, sin confirmacion de relacion con el modelo): https://tonicapp.fr/
- Tonic Web: https://web.tonicapp.com/fr
- ToNIC - Toulouse NeuroImaging Center (posible homonimia, sin relacion confirmada): https://tonic.inserm.fr/
