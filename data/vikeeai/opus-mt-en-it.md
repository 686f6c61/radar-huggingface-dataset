# vikeeai/opus-mt-en-it

## Resumen

vikeeai/opus-mt-en-it es una conversion a ONNX del modelo de traduccion automatica Helsinki-NLP/opus-mt-en-it, empaquetada para funcionar con Transformers.js. El modelo original pertenece a la familia OPUS-MT de Helsinki-NLP, basada en la arquitectura Marian (transformer encoder-decoder), y esta especializado en la traduccion de ingles a italiano. La contribucion de este repositorio no es un nuevo entrenamiento, sino la exportacion de los pesos a formato ONNX con la estructura de carpetas que espera Transformers.js (subcarpeta `onnx`), lo que permite ejecutar la traduccion directamente en el navegador o en Node.js sin backend de Python.

El interes practico del repositorio es acotado pero claro: facilita el despliegue web de traduccion EN-IT sin servidor, algo relevante para aplicaciones que necesitan privacidad (el texto no sale del cliente), bajo coste de infraestructura y funcionamiento offline una vez cacheado el modelo. El tamano del repositorio es de 0,6 GB y el pipeline declarado es `translation`.

No se dispone de informacion sobre licencia, idiomas declarados, datos de entrenamiento ni benchmarks en la informacion proporcionada. El modelo base, Helsinki-NLP/opus-mt-en-it, es la referencia para cualquier dato tecnico que no aparezca explicitamente aqui.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian (transformer encoder-decoder) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos ONNX; el repo no detalla variantes cuantizadas) |
| Idiomas soportados | ingles a italiano (par de traduccion del modelo base) |
| Licencia | no disponible |
| Formato de pesos | ONNX (carpeta `onnx`), compatible con Transformers.js |

## Arquitectura y entrenamiento

El modelo base Helsinki-NLP/opus-mt-en-it emplea la arquitectura Marian, un transformer encoder-decoder disenado especificamente para traduccion automatica neuronal. La familia OPUS-MT se entrena sobre corpus paralelos del proyecto OPUS, aunque en la informacion disponible no se detalla el volumen de tokens, la composicion exacta del dataset ni si hubo etapas de fine-tuning con RLHF o DPO; estos datos deben consultarse en la model card del modelo base.

Este repositorio concreto no aporta cambios arquitectonicos ni de entrenamiento: es una exportacion de los pesos originales a ONNX mediante herramientas compatibles con Optimum, con el objetivo de que el modelo sea ejecutable en el runtime de Transformers.js. La innovacion tecnica, por tanto, es de formato y despliegue (inferencia en WebAssembly/WebGPU en el navegador), no de modelado.

## Capacidades

- Traduccion de texto de ingles a italiano, tarea unica para la que fue entrenado el modelo base.
- Generacion texto-a-texto (`text2text-generation`) mediante el pipeline de Transformers.js.
- Ejecucion en navegador y en Node.js sin backend Python, gracias a los pesos ONNX.
- Funcionamiento offline en cliente una vez descargado y cacheado el modelo.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento extendido.
- No se documenta soporte multilingue adicional mas alla del par EN-IT.

## Casos de uso

- Traduccion en el navegador con privacidad: integrar el modelo en una web con Transformers.js para traducir texto EN-IT sin enviar el contenido a un servidor, adecuado para documentos sensibles o entornos con requisitos de proteccion de datos.
- Extension de navegador para lectura: traducir articulos o paginas en ingles al italiano en el propio cliente, reduciendo coste de backend y latencia de red.
- Aplicaciones offline o de campo: herramientas instaladas en entornos sin conectividad que necesiten traduccion EN-IT puntual, aprovechando que el modelo se ejecuta localmente.
- Prototipado rapido de funcionalidades de traduccion: validar un flujo EN-IT en una demo web antes de invertir en infraestructura de inferencia en servidor.
- Preprocesado en pipelines frontend: normalizar o traducir contenido introducido por el usuario en el cliente antes de enviarlo a un servicio posterior, reduciendo carga del backend.
- Educacion y demos tecnicas: ejemplo didactico de despliegue de modelos de traduccion en WebML con Transformers.js y Optimum.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en despliegue web; el modelo corre en CPU/GPU del cliente via Transformers.js. El repositorio ocupa 0,6 GB, lo que da una idea del peso en disco y en memoria del cliente.
- GPU recomendadas: no disponible para inferencia en servidor; en navegador puede aprovechar WebGPU si el runtime lo soporta.
- Cabe en GPU de consumo: si, en el sentido de que el modelo es pequeno (repo de 0,6 GB) y esta pensado para ejecutarse en dispositivos de usuario final, no en servidores de gran capacidad.
- Opciones de despliegue: Transformers.js (principal), y en servidor el modelo base podria servirse con frameworks compatibles con Marian/ONNX, aunque no se documenta en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| vikeeai/opus-mt-en-it | no disponible | no disponible | no disponible | ONNX (Transformers.js) | Conversion web del modelo OPUS-MT EN-IT |
| Helsinki-NLP/opus-mt-en-it | no disponible | no disponible | no disponible | safetensors/PyTorch | Modelo base original, inferencia en Python |
| Otros modelos OPUS-MT EN-IT de la familia | no disponible | no disponible | no disponible | variable | Misma arquitectura Marian, pares de idioma distintos |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo especializado exclusivamente en traduccion EN-IT; no debe usarse para otras tareas de generacion.
- Riesgo de alucinacion y de traducciones incorrectas en textos tecnicos, dominios especializados o lenguaje muy coloquial, inherente a los modelos de traduccion neuronal.
- No se documentan sesgos especificos, pero al heredar los datos de OPUS puede reflejar sesgos presentes en los corpus paralelos de origen.
- Licencia no disponible: antes de un uso comercial es imprescindible verificar la licencia del modelo base Helsinki-NLP/opus-mt-en-it.
- Repositorio sin descargas ni likes y creado recientemente: no hay evidencia de uso en produccion ni validacion por la comunidad.
- El rendimiento en navegador depende del dispositivo del usuario y del soporte de WebGPU/WebAssembly del runtime; no se han publicado metricas de latencia.
- La model card advierte de que el alojamiento separado de pesos ONNX es una solucion temporal en el ecosistema WebML.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vikeeai/opus-mt-en-it
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-en-it
- Documentacion de Optimum: https://huggingface.co/docs/optimum/index
