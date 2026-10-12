# syssec-utd/py315-pylingual-v6-mlm

## Resumen

py315-pylingual-v6-mlm es un modelo de lenguaje enmascarado (masked language modeling, pipeline `fill-mask`) desarrollado por syssec-utd, el laboratorio de seguridad de sistemas de la University of Texas at Dallas. Se trata de un ajuste fino sobre una arquitectura RoBERTa de aproximadamente 109,5 millones de parametros, entrenado sobre el dataset `syssec-utd/segmentation-py315-pylingual-v6`, que forma parte del proyecto Pylingual, un decompilador de Python para versiones modernas del lenguaje (Python 3.15).

El modelo resuelve una tarea concreta: predecir tokens enmascarados en secuencias de Python, lo que resulta util como componente auxiliar dentro de la cadena de decompilacion (por ejemplo, para recuperar identificadores, nombres de variables o fragmentos de codigo ofuscados o degradados durante el proceso). No es un modelo generativo de proposito general ni un asistente conversacional: es un modelo encoder especializado que produce representaciones contextuales y predicciones puntuales de tokens.

Su relevancia radica en dos factores. Primero, el pipeline Pylingual aborda un problema real y dificil: la decompilacion de bytecode de versiones recientes de Python, donde la informacion de nombres y estructura se pierde. Segundo, el modelo se publica bajo la libreria `transformers` con pesos en `safetensors`, lo que facilita su integracion en herramientas existentes. Como contrapartida, el modelo lleva publicados 0 descargas y 0 likes, la model card es practicamente vacia (generada automaticamente) y no se declara licencia ni lista de idiomas, por lo que se trata de una publicacion temprana y poco documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (tag `roberta`), objetivo masked language modeling |
| Parametros totales | 109.506.864 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no declarada; en arquitecturas RoBERTa suele ser 512 tokens, sin confirmar) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente fp32) |
| Idiomas soportados | No disponibles (el dataset de entrenamiento se orienta a codigo Python) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer encoder de la familia RoBERTa, segun el tag declarado en HuggingFace. Con 109,5 millones de parametros, el tamano es ligeramente inferior al de `roberta-base` (unos 125 millones), lo que sugiere una configuracion de vocabulario o de capas propias del proyecto. El modelo es un ajuste fino de otro checkpoint cuyo nombre no aparece en la model card (el enlace de la base esta vacio en el README). El objetivo de entrenamiento es masked language modeling, es decir, reconstruir tokens enmascarados a partir de su contexto.

Los hiperparametros declarados en la model card son: tasa de aprendizaje 5e-05, `train_batch_size` de 64 (con `eval_batch_size` de 8), semilla 42, entrenamiento distribuido en 3 dispositivos con un batch total de 192, optimizador AdamW con `fused` (betas 0,9 y 0,999, epsilon 1e-08), planificador de tasa de aprendizaje lineal y 2 epocas. El dataset de ajuste es `syssec-utd/segmentation-py315-pylingual-v6`. Las versiones de framework declaradas son Transformers 5.17.0, PyTorch 2.14.0+cu130, Datasets 5.0.1 y Tokenizers 0.23.2.

No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (lo cual es esperable, dado que no es un modelo generativo alineado). Tampoco se documenta ninguna innovacion tecnica adicional mas alla del propio ajuste fino. La model card no incluye seccion de resultados de entrenamiento ni de evaluacion.

## Capacidades

- Rellenado de tokens enmascarados (`fill-mask`) en secuencias, principalmente de codigo Python.
- Produccion de representaciones contextuales de tokens para tareas posteriores (clasificacion, extraccion de caracteristicas).
- Prediccion de identificadores y fragmentos plausibles en codigo degradado o parcialmente ofuscado, util en un pipeline de decompilacion.
- Soporte de integracion via la libreria `transformers` y compatibilidad declarada con `endpoints_compatible`.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingues ni de vision, audio o modo de razonamiento explicito.

## Casos de uso

- Recuperacion de identificadores en decompilacion: dado un fragmento de codigo Python reconstruido con nombres de variables perdidos, el modelo puede proponer los tokens enmascarados mas probables, integrándose como paso auxiliar dentro del decompilador Pylingual.
- Reparacion de codigo degradado: en fragmentos donde parte del texto se ha perdido o corrompido, el modelo puede rellenar las posiciones enmascaradas con candidatos coherentes con el contexto sintactico y semantico.
- Analisis de seguridad estatico: al ser un modelo contextual sobre Python, puede emplearse para generar representaciones de fragmentos sospechosos y alimentar clasificadores de vulnerabilidades o patrones maliciosos, area propia del laboratorio syssec-utd.
- Anonimizacion y desanonimizacion de nombres: el modelo puede sugerir nombres de variables o funciones semanticamente plausibles a partir del contexto, util para normalizar muestras de codigo antes de su analisis.
- Generacion de datos de entrenamiento para codigo: enmascarar aleatoriamente tokens de corpus Python y usar el modelo para generar variantes, ampliando datasets de ajuste fino para otras tareas.
- Indexado y busqueda semantica de codigo: las representaciones contextuales del encoder pueden usarse para construir embeddings de funciones o fragmentos y alimentar un motor de recuperacion de codigo.
- Preentrenamiento o ajuste posterior en tareas especificas de Python: el checkpoint sirve como base para clasificacion de codigo, deteccion de errores o etiquetado de tokens, aprovechando su especializacion en el dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El `model-index` de la model card declara el modelo `py315-pylingual-v6-mlm` con una lista de resultados vacia, y no se incluye ninguna tabla de metricas (ni MMLU, ni HumanEval, ni exactitud sobre el dataset de evaluacion).

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 109,5 millones de parametros ocupan aproximadamente 438 MB; en fp16, unos 219 MB; en int8, unos 110 MB; en int4, unos 55 MB. A ello hay que sumar el coste de activaciones y del tokenizador, pero el margen es amplio.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente. Una RTX 3090, RTX 4090, A100 o H100 sobredimensionan con creces el modelo; se usan, si acaso, para procesar grandes lotes en batch.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna (e incluso en graficas integradas o inferencia pura en CPU), dado su tamano reducido.
- Opciones de despliegue: `transformers` con el pipeline `fill-mask`; servidores de inferencia compatibles con HuggingFace Endpoints (el tag declara `endpoints_compatible`); exportacion a ONNX o TorchScript para despliegues ligeros. Para CPU, herramientas derivadas de llama.cpp requieren conversion a GGUF, no documentada para este checkpoint.
- Latencia y throughput estimados: no disponibles. Al ser un modelo de 109,5 millones de parametros con encoder bidireccional, en GPU moderna la inferencia es del orden de milisegundos para secuencias de hasta 512 tokens, pero no se ha publicado ninguna medicion oficial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| py315-pylingual-v6-mlm | 109,5 M | No disponible | Python (decompilacion) | No disponible | HuggingFace |
| microsoft/codebert-base | 125 M | 512 tokens | Codigo multilenguaje (6 lenguajes, incluye Python) | MIT | HuggingFace |
| microsoft/graphcodebert-base | 125 M | 512 tokens | Codigo con flujo de datos | MIT | HuggingFace |
| syssec-utd/py315-pylingual-v3-mlm | No disponible | No disponible | Python (decompilacion) | No disponible | HuggingFace |

CodeBERT y GraphCodeBERT son los comparables mas naturales por tamano y por objetivo (masked language modeling sobre codigo). Ambos parten de RoBERTa-base y fueron entrenados sobre CodeSearchNet, con licencia MIT y amplia adopcion. La diferencia principal de py315-pylingual-v6-mlm es su especializacion en el pipeline de decompilacion de Python moderno del proyecto Pylingual, frente al enfoque mas generico de los modelos de Microsoft. La version v3 del propio autor es la referencia interna mas directa, aunque no se dispone de sus especificaciones para comparar.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla autogenerada por el `Trainer` y contiene secciones "More information needed" en descripcion, usos previstos, limitaciones, datos de entrenamiento y resultados.
- Licencia no declarada: no se especifica ningun termino de uso, lo que impide determinar si se permite el uso comercial. Es un riesgo relevante para cualquier integracion en produccion.
- Idiomas no declarados: aunque el dataset apunta a codigo Python, no se confirma el alcance linguistico ni la cobertura de comentarios o cadenas en otros idiomas.
- Riesgo de alucinacion en la prediccion de tokens: al ser un modelo de rellenado, puede producir identificadores o fragmentos plausibles pero incorrectos, especialmente en contextos poco representados.
- Sesgos potenciales desconocidos: al no documentarse la composicion del dataset de entrenamiento, no es posible evaluar sesgos de ningun tipo.
- Contexto limitado: no se declara la longitud de contexto; si sigue el estandar de RoBERTa, estaria limitada a 512 tokens, lo que restringe su uso en archivos grandes sin troceado.
- Modelo sin adopcion verificable: 0 descargas y 0 likes en el momento de la consulta, sin resultados de evaluacion, lo que dificulta contrastar su calidad frente a alternativas establecidas.
- Es un modelo `fill-mask`, no generativo ni conversacional: no debe emplearse como asistente ni como generador de codigo completo; su uso correcto es la prediccion de tokens enmascarados o la extraccion de representaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/syssec-utd/py315-pylingual-v6-mlm
- Organizacion syssec-utd en HuggingFace: https://huggingface.co/syssec-utd
- Dataset de ajuste: https://huggingface.co/datasets/syssec-utd/segmentation-py315-pylingual-v6
- Version previa del modelo: https://huggingface.co/syssec-utd/py315-pylingual-v3-mlm
- Repositorio Pylingual en GitHub: https://github.com/syssec-utd/pylingual
- Organizacion syssec-utd en GitHub: https://github.com/syssec-utd/
- Ficha de modelos del autor en Essa Mamdani: https://essamamdani.com/ai-models/company/syssec-utd
