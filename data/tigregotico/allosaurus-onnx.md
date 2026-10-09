# TigreGotico/allosaurus-onnx

## Resumen

Allosaurus ONNX es la exportación al formato ONNX del modelo acústico de Allosaurus, en su release `uni2005`. Allosaurus es un reconocedor universal de fonos desarrollado por Xinjian Li y colaboradores: en lugar de transcribir palabras en un idioma concreto, emite unidades fonéticas (fonos) para habla de cualquier lengua, apoyándose en un sistema alofónico multilingüe. Este repositorio, publicado por TigreGotico, contiene únicamente el grafo del modelo acústico; la extracción de características y la decodificación CTC se ejecutan fuera del grafo.

La arquitectura es un BLSTM de cinco capas bidireccionales que opera sobre tramas de MFCC apiladas y se entrena con CTC. El grafo exportado tiene una entrada (`feats`, forma `(1, T, 120)`, float32) y una salida (`logits`, forma `(1, T, 230)`, float32), con eje temporal dinámico. La unidad 0 de la salida es el blank de CTC y las 229 restantes corresponden a unidades fonéticas del inventario `uni2005`.

Su relevancia práctica está en el despliegue: al publicarse como ONNX, el modelo puede ejecutarse con onnxruntime sin depender de PyTorch, lo que facilita integrarlo en servicios de audio ligeros y en pipelines ya basados en ONNX. La licencia es GPL-3.0, heredada del proyecto original, lo que condiciona su uso en productos propietarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLSTM de 5 capas bidireccionales sobre tramas MFCC apiladas, entrenada con CTC |
| Parametros totales | no disponible (el repositorio declara un tamano de 0.0 GB y no publica recuento de parametros) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de ventana de texto; el eje temporal `T` es dinamico y no se declara un limite fijo de audio |
| Tipos de cuantizacion | no disponible; el grafo exportado usa float32 y no se declaran variantes cuantizadas |
| Idiomas soportados | multilingue (reconocimiento de fonos universal sobre un sistema alofonico); la lista concreta de idiomas no esta disponible |
| Licencia | GPL-3.0 |
| Formato de pesos | ONNX (ejecutable con onnxruntime) |

## Arquitectura y entrenamiento

El modelo es un reconocedor acústico puramente fonético. La entrada son tramas de MFCC apiladas: el llamante debe calcular las características a partir de audio mono a 8 kHz siguiendo los parámetros de `pm_config.json` del modelo. El procedimiento descrito es: escalar las muestras de `[-1, 1]` a valores de 16 bits; calcular 40 MFCC de Kaldi por trama con ventana de Povey, 40 bancos mel entre 40 y 3800 Hz, DCT-II, lifter 22 y sin coeficiente de energía; normalizar cada coeficiente a media cero y varianza unitaria sobre el enunciado completo; y apilar cada trama con sus dos vecinas (con envolvente en los bordes) para obtener 120 valores por trama, conservando una de cada tres tramas apiladas. Sobre esas tramas opera el BLSTM de cinco capas, entrenado con CTC sobre un inventario multilingüe de alófonos.

La decodificación es CTC voraz: se toma la unidad arg-max por trama, se fusionan repeticiones y se elimina el blank. El grafo cubre solo el modelo acústico, de modo que la decodificación y la conversión de unidades a fonos (mediante la tabla `uni2005` del release de Allosaurus) quedan en manos del integrador. La innovación técnica del trabajo original es precisamente el sistema alofónico multilingüe, que permite compartir unidades entre lenguas y reconocer fonos en idiomas no vistos; la exportación a ONNX no añade cambios arquitectónicos, sino que reproduce el modelo con eje temporal dinámico y sin *sequence packing* para una única locución. No se documenta en la información disponible el número de tokens ni la composición exacta del dataset de entrenamiento, ni si hubo etapas de RLHF o DPO (poco habituales en un modelo acústico CTC).

## Capacidades

- Reconocimiento de fonos (no de palabras) para habla en cualquier idioma, apoyado en un inventario alofónico multilingüe.
- Salida de 229 unidades fonéticas más un blank de CTC por trama.
- Procesamiento de audio mono a 8 kHz, con extracción de características externa al grafo.
- Longitud de audio variable: el eje temporal del grafo es dinámico.
- Ejecución mediante onnxruntime, sin dependencia de PyTorch en tiempo de inferencia.
- Exportación reproducible mediante `conversion/export_allosaurus.py`, con verificación de paridad frente al reconocedor original.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, tool calling ni agentes: es un modelo acústico puramente fonético.
- No dispone de modo *thinking* ni de capacidades multimodales más allá del audio de entrada.

## Casos de uso

- Anotación fonética de corpus lingüísticos: el modelo permite obtener una capa de transcripción fonética sobre grabaciones de campo en múltiples lenguas, útil para documentación de lenguas minoritarias, donde el etiquetado manual es costoso y el inventario alofónico multilingüe reduce la necesidad de un modelo por idioma.
- Preentrenamiento y alineación para ASR: las secuencias de fonos pueden emplearse como representación intermedia para forzar alineamientos, inicializar sistemas de reconocimiento de palabras o construir léxicos de pronunciación en idiomas con pocos recursos.
- Evaluación de pronunciación en aprendizaje de idiomas: al devolver unidades fonéticas en lugar de palabras, permite comparar la realización del alumno con la esperada y detectar sustituciones o elisiones concretas, sin depender de un decodificador léxico.
- Investigación en fonética acústica: la salida por trama facilita el análisis de duraciones, coarticulación y contraste de rasgos entre lenguas, al ofrecer una etiqueta fonética homogénea sobre datos heterogéneos.
- Búsqueda por contenido en archivos de audio: indexar la secuencia de fonos permite búsquedas aproximadas de términos y consultas por similitud fonética en grandes volúmenes de grabaciones, con un coste de cómputo bajo al no requerir vocabulario.
- Integración en servicios C++ o embebidos: al ser un grafo ONNX, puede desplegarse con onnxruntime en entornos donde no se quiere arrastrar el stack de PyTorch, por ejemplo servicios de audio de baja latencia o aplicaciones de escritorio.
- Verificación de pipelines de conversión: el propio repositorio incluye `allosaurus_reference.json` y un script de paridad, útil como caso de prueba para validar exportaciones ONNX de modelos acústicos frente al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (PER en test sets como Common Voice, MMLU, HumanEval u otros) en la información disponible. El único dato cuantitativo documentado es la comprobación de paridad entre el grafo exportado y el reconocedor original de Allosaurus:

| Metrica | Valor |
|---|---|
| Clips de prueba | 12 |
| Fonos de referencia (Allosaurus original) | 172 |
| Clips con salida identica | 11 de 12 |
| Ediciones de fonos en el clip restante | 1 fon de mas |
| Tasa de edicion de fonos sobre el total | 1/172 (aproximadamente 0.58 %) |
| Causa de la discrepancia | una trama de silencio digital, donde una pequena diferencia numerica entre runtimes decide entre el blank y un fono |

## Requisitos de hardware

- El repositorio no publica recuento de parámetros ni tamaño del grafo (`0.0 GB` declarado), por lo que no es posible dar cifras de VRAM verificadas.
- Por su arquitectura (BLSTM de 5 capas sobre vectores de 120 entradas y 230 salidas por trama), se trata de un modelo acústico pequeño en términos relativos, apto para inferencia en CPU con onnxruntime; no obstante, esta apreciación es cualitativa y no está respaldada por cifras publicadas.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no disponible; previsiblemente no requiere GPU, pero no hay datos confirmados.
- Opciones de despliegue: onnxruntime es la vía soportada oficialmente por el repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables a este modelo acústico).
- Latencia y throughput: no disponibles. El procesamiento es por locución completa, con normalización de características calculada sobre el enunciado entero, lo que implica procesamiento no streaming salvo que se adapte el cálculo de características.
- Nota de integración: el cálculo de MFCC de Kaldi (ventana de Povey, 40 bancos mel entre 40 y 3800 Hz, lifter 22) debe implementarse o portarse fuera del grafo; este coste de ingeniería suele ser mayor que el de la propia inferencia.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada/Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TigreGotico/allosaurus-onnx | Reconocedor acustico de fonos (BLSTM + CTC) | MFCC apilados (1, T, 120) / logits (1, T, 230) | GPL-3.0 | ONNX | Exportacion derivada; inferencia sin PyTorch |
| xinjli/allosaurus (`uni2005`) | Reconocedor universal de fonos, modelo original | Audio / fonos tras decodificacion CTC | GPL-3.0 | Pesos del proyecto original | Incluye reconocedor completo y tabla de unidades; es la referencia de paridad de esta exportacion |
| Otros reconocedores de fonos basados en wav2vec 2.0 | Modelos auto-supervisados con cabeza fonetica | Audio en bruto / fonos | variable segun modelo | safetensors, PyTorch | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion cuantitativa |

No se dispone de datos suficientes en la información proporcionada para comparar parámetros, contexto, rendimiento o disponibilidad con alternativas concretas de forma rigurosa.

## Limitaciones y advertencias

- Licencia GPL-3.0: cualquier obra derivada o distribución debe cumplir las condiciones de copyleft, lo que condiciona seriamente la integración en productos propietarios o en servicios de código cerrado.
- Este repositorio es una exportación derivada, generada automáticamente y no revisada por una persona, según declara la propia model card.
- Modelo acústico únicamente: no incluye la extracción de características ni la decodificación CTC, ni un modelo de lenguaje; sin un decodificador léxico no produce palabras, solo secuencias de unidades fonéticas.
- Reconocimiento a nivel de fono, no de palabra: no debe emplearse directamente como sistema de transcripción de texto.
- Dependencia de una implementación externa de MFCC de Kaldi con parámetros muy específicos (Povey, 40 bancos mel entre 40 y 3800 Hz, lifter 22, sin energía, CMVN por enunciado, apilado de 3 tramas con decimación de 3). Cualquier desviación altera la salida de forma apreciable.
- Audio de entrada limitado a mono a 8 kHz; el repositorio no documenta comportamiento con otras frecuencias de muestreo más allá de remuestrear.
- Riesgo de alucinación en sentido estricto no aplica, pero sí de errores de sustitución o inserción de fonos, especialmente en tramas de silencio, donde el resultado puede depender de diferencias numéricas entre runtimes, como muestra la propia comprobación de paridad.
- Sesgos por idioma: al ser un modelo multilingüe entrenado sobre un inventario compartido, el rendimiento puede variar entre lenguas y variedades; no se publica desglose por idioma.
- La model card no documenta la composición del dataset de entrenamiento, por lo que no es posible evaluar sesgos demográficos, de acento o de dominio.
- Fecha de creación del repositorio indicada como 2026-10-09 y 0 descargas y 0 likes en el momento de la consulta.
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo (los resultados obtenidos eran contenido no relacionado), por lo que toda la información de esta ficha procede de la model card de HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/TigreGotico/allosaurus-onnx
- Modelo base en HuggingFace: https://huggingface.co/xinjli/allosaurus
- Proyecto original Allosaurus en GitHub: https://github.com/xinjli/allosaurus
- Release `uni2005` usado en la conversión: https://github.com/xinjli/allosaurus/releases/download/v1.0/latest.tar.gz
- Referencia del paper: Li, Xinjian et al., "Universal Phone Recognition with a Multilingual Allophone System", ICASSP 2020. https://doi.org/10.1109/ICASSP40776.2020.9054462
