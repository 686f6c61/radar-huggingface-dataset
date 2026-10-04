# vladadu/stt-ar-fastconformer-sherpa-onnx

## Resumen

`vladadu/stt-ar-fastconformer-sherpa-onnx` es un paquete de reconocimiento automatico del habla (ASR) en arabe listo para usar con el runtime sherpa-onnx. No es un modelo entrenado desde cero: se trata de una conversion a ONNX y una cuantizacion int8 del modelo base de NVIDIA `nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0`, sin reentrenamiento posterior. La relevancia inmediata esta en que permite ejecutar un ASR arabe de calidad en CPU y dispositivos edge sin necesidad de PyTorch ni de NeMo.

El modelo conserva la arquitectura FastConformer-Hybrid (transducer/RNN-T) del original, pero la exportacion incluye unicamente la rama transducer (encoder, decoder y joiner); la cabeza CTC no se exporta. El repositorio ocupa aproximadamente 0,1 GB, lo que refleja pesos int8 mas ligeros que el modelo original en fp32.

Se distribuye con licencia CC-BY-4.0, heredada del modelo base, y exige atribucion a NVIDIA NeMo. Con cero descargas y cero "likes" en el momento de la consulta, es un artefacto reciente y poco adoptado, orientado a quienes necesitan desplegar ASR arabe embebido con sherpa-onnx.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer-Hybrid (transducer/RNN-T); solo se exporta la rama transducer |
| Parametros totales | no disponible (variante "large" del modelo base de NVIDIA) |
| Longitud de contexto | no aplica (modelo ASR; procesa segmentos de audio de longitud variable) |
| Tipos de cuantizacion | int8 dynamic quantization (QUInt8) sobre ONNX; el modelo base admite fp32/fp16 |
| Idiomas soportados | arabe (las pruebas de referencia usan FLEURS ar_eg, dialecto egipcio) |
| Licencia | CC-BY-4.0 (heredada del modelo base; atribucion a NVIDIA NeMo) |
| Formato de pesos | ONNX (`encoder.int8.onnx`, `decoder.int8.onnx`, `joiner.int8.onnx`) + `tokens.txt` |

## Arquitectura y entrenamiento

La arquitectura es un FastConformer-Hybrid, es decir, un encoder tipo Conformer con subsampling por convoluciones separables en profundidad y dos cabezas de salida, CTC y transducer (RNN-T). En esta conversion solo se conserva la rama transducer, representada por los ficheros `encoder`, `decoder` y `joiner` en ONNX. El vocabulario conjunto se entrega en `tokens.txt`, con el token `<blk>` en ultima posicion, y el modelo espera entradas con `sample_rate=16000` y `feature_dim=80`, consumibles mediante `OfflineRecognizer.from_transducer(..., model_type="nemo_transducer")` en sherpa-onnx.

El autor no ha realizado ningun entrenamiento ni ajuste fino: la model card indica explicitamente que el modelo se convirtio a ONNX y se cuantizo a int8 "without further training". La exportacion sigue el script oficial de sherpa-onnx en `scripts/nemo/fast-conformer-hybrid-transducer-ctc/`. Por tanto, el conocimiento acustico y linguistico procede integramente del modelo base de NVIDIA, cuya card detalla los datos de entrenamiento originales y que deberia consultarse para cualquier duda sobre composicion del dataset, regimen de entrenamiento o cobertura dialectal.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe, con salida de transcripcion de texto a partir de audio a 16 kHz.
- Reconocimiento offline (no streaming): el uso previsto con sherpa-onnx es `OfflineRecognizer`, pensado para procesar segmentos de audio completos.
- Formato de salida tipo transducer con vocabulario conjunto, incluyendo el token `<blk>`.
- Cobertura del dialecto egipcio confirmada en las pruebas del autor; el modelo base "pc" apunta a salida con puntuacion y capitalizacion.
- No incluye traduccion, sintesis de voz, diarizacion, tool calling ni capacidades multimodales.
- No se documenta en la informacion disponible soporte de function calling, agentes ni razonamiento multi-paso (son capacidades no aplicables a un modelo ASR).

## Casos de uso

- Transcripcion de audio en arabe en servidores sin GPU: al ser un bundle ONNX int8 ejecutable con sherpa-onnx, permite desplegar ASR en CPU estandar sin instalar NeMo ni PyTorch.
- Asistentes de voz embebidos en moviles o dispositivos IoT: el tamano reducido del repositorio (unos 0,1 GB) y la cuantizacion int8 facilitan la inferencia local en dispositivos con recursos limitados.
- Subtitulado y postproduccion de contenido audiovisual en arabe: se puede transcribir por lotes grabaciones o videos y generar subtitulos de forma automatizada.
- Analitica de call centers en arabe: transcripcion de conversaciones telefonicas para control de calidad, busqueda de palabras clave y clasificacion posterior.
- Archivado y busqueda de fondos documentales sonoros: convertir entrevistas, podcasts o archivos de radio a texto indexable.
- Aplicaciones con requisitos de privacidad u operacion sin conexion: al ejecutarse en local, el audio no necesita salir del dispositivo.
- Pipelines de datos a gran escala: integrar la transcripcion como etapa batch dentro de flujos de procesamiento que necesiten texto a partir de audio en arabe.

## Benchmarks y rendimiento

El autor proporciona un unico conjunto de medidas sobre 20 clips de FLEURS `ar_eg` (WER normalizado: sin diacriticos ni puntuacion, con plegado de alef/ya/ta-marbuta). La model card aclara que son "relative numbers only":

| Sistema | WER (muestra de 20 clips FLEURS ar_eg) |
|---|---|
| NeMo RNN-T (base) | 6,76 |
| ONNX fp32 | 5,41 |
| Bundle ONNX int8 enviado | 4,86 |

La muestra es muy reducida (20 clips), por lo que las diferencias entre los tres sistemas deben interpretarse con cautela: que el bundle int8 obtenga un WER inferior al fp32 y al modelo original es probablemente ruido estadistico y no una mejora real de la cuantizacion. No se dispone de mas resultados de benchmarks en la informacion proporcionada.

## Requisitos de hardware

- VRAM/uso de memoria: al ser un modelo int8 de aproximadamente 0,1 GB, la huella de memoria es minima; cabe holgadamente en CPU con unos pocos cientos de MB de RAM libres.
- GPU: no requiere GPU. Puede ejecutarse en CPU; si se desea aceleracion, sherpa-onnx permite backends con CUDA, pero para este tamano la ganancia suele ser innecesaria.
- GPU de consumo: cabe en cualquier GPU de consumo e incluso en aceleradores de borde; el modelo esta disenado para CPU y dispositivos embebidos (Raspberry Pi, moviles, SBC).
- Despliegue: sherpa-onnx mediante `OfflineRecognizer.from_transducer(..., model_type="nemo_transducer", sample_rate=16000, feature_dim=80)`; tambien puede ejecutarse con ONNX Runtime de forma directa. No esta pensado para vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este paquete (vladadu/stt-ar-fastconformer-sherpa-onnx) | no disponible (variant large) | audio 16 kHz, 80 dims, offline | WER 4,86 (20 clips FLEURS ar_eg, int8) | CC-BY-4.0 | ONNX para sherpa-onnx |
| nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0 (base) | no disponible | audio 16 kHz | WER 6,76 (misma muestra, RNN-T) | CC-BY-4.0 | NeMo/PyTorch |
| Otros ASR arabes (p. ej. Whisper large-v3) | no disponible | audio 16 kHz, ventana de 30 s por defecto | no disponible | no disponible | no disponible |

La comparacion cuantitativa solo es posible, con la informacion disponible, frente al modelo base de NVIDIA sobre la misma muestra de 20 clips. Para alternativas como Whisper u otros modelos ASR arabes no se han aportado datos en esta ficha.

## Limitaciones y advertencias

- Solo arabe: no traduce ni transcribe otros idiomas; la cobertura dialectal esta centrada en MSA y, segun las pruebas, en el dialecto egipcio (`ar_eg`).
- La exportacion incluye unicamente la rama transducer; la cabeza CTC del modelo original no esta disponible en este bundle.
- Cuantizacion int8: aunque en la muestra se observa un WER bajo, la cuantizacion puede degradar el reconocimiento en dominios, ruido o acentos distintos a los evaluados.
- Evidencia de rendimiento muy limitada: 20 clips, con valores presentados como "relative numbers only"; no debe tomarse como una medicion solida de calidad.
- Modelo offline (no streaming): no esta orientado a reconocimiento en tiempo real continuo con sherpa-onnx a traves de `OfflineRecognizer`.
- Licencia CC-BY-4.0: el uso comercial es posible, pero exige atribucion a NVIDIA NeMo y cumplir los terminos de la licencia del modelo base.
- Riesgo de errores de transcripcion (sustituciones, omisiones) inherente a cualquier ASR; conviene validar en el dominio concreto de produccion.
- Artefacto sin adopcion (0 descargas, 0 likes): no hay comunidad ni mantenimiento documentado.
- No se documentan sesgos especificos en la informacion proporcionada; el modelo base puede reflejar sesgos de sus datos de entrenamiento, no detallados aqui.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/vladadu/stt-ar-fastconformer-sherpa-onnx
- Modelo base de NVIDIA: https://huggingface.co/nvidia/stt_ar_fastconformer_hybrid_large_pc_v1.0
- Repositorio sherpa-onnx (k2-fsa): https://github.com/k2-fsa/sherpa-onnx
- Script de exportacion FastConformer-Hybrid transducer-CTC: `scripts/nemo/fast-conformer-hybrid-transducer-ctc/` dentro de k2-fsa/sherpa-onnx
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
